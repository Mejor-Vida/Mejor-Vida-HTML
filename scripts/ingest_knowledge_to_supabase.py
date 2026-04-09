#!/usr/bin/env python3
"""Load FAQ / knowledge text into Supabase knowledge_chunks with OpenAI embeddings.

The RAG pipeline reads from knowledge_chunks; if this table is empty, every chat
answer is no_answer.

Sources (pick one):
  1) CSV file: --csv path/to/export.csv (export from Google Sheets: File → Download → CSV)
  2) Public sheet: set GOOGLE_SHEETS_AI_KNOWLEDGE_SPREADSHEET_ID — fetches
     .../export?format=csv (sheet must be "Anyone with the link" viewer or public)
  3) Private sheet: install google-api-python-client + google-auth, set
     GOOGLE_APPLICATION_CREDENTIALS to a service account JSON, share the sheet
     with that service account email (Viewer).

Expected CSV columns (header row, flexible names):
  - content  OR  text  OR  body  → one chunk per row
  - OR question + answer  → combined as Q/A
  - optional: locale (en|es), topic

Requires in .env.local (repo root):
  OPENAI_API_KEY
  DATABASE_URL  OR  SUPABASE_URL + SUPABASE_DB_PASSWORD (same as apply_migrations.py)

Usage:
  pip install -r integrations/supabase/requirements.txt
  python3 scripts/ingest_knowledge_to_supabase.py --csv scripts/knowledge_seed.example.csv --replace

  python3 scripts/ingest_knowledge_to_supabase.py --replace   # uses env sheet id if set
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_root))

from integrations.supabase.config import get_database_url  # noqa: E402

try:
    import psycopg
except ImportError:
    print("Install: pip install -r integrations/supabase/requirements.txt")
    raise SystemExit(1)


def _norm_header(h: str) -> str:
    return re.sub(r"\s+", " ", (h or "").strip().lower())


def _load_env() -> None:
    env_path = _root / ".env.local"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


def _fetch_csv_public(spreadsheet_id: str, gid: str) -> str:
    url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export?format=csv&gid={gid}"
    req = urllib.request.Request(url, headers={"User-Agent": "MejorVidaKnowledgeIngest/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", errors="replace")


def _fetch_csv_google_api(spreadsheet_id: str, gid_str: str) -> str | None:
    try:
        from google.oauth2.service_account import Credentials
        from googleapiclient.discovery import build
    except ImportError:
        return None
    path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
    if not path or not Path(path).is_file():
        return None
    scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    creds = Credentials.from_service_account_file(path, scopes=scopes)
    service = build("sheets", "v4", credentials=creds, cache_discovery=False)
    meta = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    sheets = meta.get("sheets", [])
    title = None
    if gid_str.isdigit():
        gid_int = int(gid_str)
        for sh in sheets:
            props = sh.get("properties", {})
            if props.get("sheetId") == gid_int:
                title = props.get("title")
                break
    if not title and sheets:
        title = sheets[0]["properties"]["title"]
    if not title:
        return ""
    safe = str(title).replace("'", "''")
    range_a1 = f"'{safe}'!A1:ZZ5000"
    result = (
        service.spreadsheets()
        .values()
        .get(spreadsheetId=spreadsheet_id, range=range_a1)
        .execute()
    )
    rows = result.get("values", [])
    if not rows:
        return ""
    buf = io.StringIO()
    w = csv.writer(buf)
    for row in rows:
        w.writerow(row)
    return buf.getvalue()


def _parse_csv_text(text: str) -> list[dict[str, str]]:
    f = io.StringIO(text)
    r = csv.DictReader(f)
    if not r.fieldnames:
        return []
    out: list[dict[str, str]] = []
    for raw in r:
        row = {_norm_header(k): (v or "").strip() for k, v in raw.items()}
        out.append(row)
    return out


def _row_to_chunk_text(row: dict[str, str]) -> tuple[str, dict[str, Any]]:
    meta: dict[str, Any] = {}
    loc = row.get("locale") or row.get("lang") or row.get("language") or ""
    if loc:
        meta["locale"] = loc[:8]
    topic = row.get("topic") or row.get("title") or row.get("category") or ""
    if topic:
        meta["topic"] = topic[:200]

    q = row.get("question") or row.get("q") or ""
    a = row.get("answer") or row.get("a") or ""
    body = (
        row.get("content")
        or row.get("text")
        or row.get("body")
        or row.get("chunk")
        or ""
    )

    if body and not (q or a):
        return body, meta

    if q or a:
        parts = []
        if topic:
            parts.append(f"Topic: {topic}")
        if q:
            parts.append(f"Question: {q}")
        if a:
            parts.append(f"Answer: {a}")
        return "\n".join(parts), meta

    # fallback: first non-empty value
    for v in row.values():
        if v:
            return v, meta
    return "", meta


def _split_oversized(text: str, max_chars: int = 3500) -> list[str]:
    text = text.strip()
    if len(text) <= max_chars:
        return [text] if text else []
    chunks: list[str] = []
    start = 0
    while start < len(text):
        chunks.append(text[start : start + max_chars])
        start += max_chars
    return [c for c in chunks if c.strip()]


def _embed_batch(texts: list[str], api_key: str) -> list[list[float]]:
    if not texts:
        return []
    payload = json.dumps(
        {"model": "text-embedding-3-small", "input": texts}
    ).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/embeddings",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode())
    if not data.get("data"):
        raise RuntimeError(f"OpenAI embeddings: bad response {data}")
    # sort by index
    ordered = sorted(data["data"], key=lambda x: x["index"])
    return [item["embedding"] for item in ordered]


def _vec_to_pg(emb: list[float]) -> str:
    return "[" + ",".join(f"{x:.8g}" for x in emb) + "]"


def main() -> int:
    _load_env()
    ap = argparse.ArgumentParser(description="Ingest knowledge into Supabase knowledge_chunks")
    ap.add_argument("--csv", help="Path to CSV (exported from Google Sheets)")
    ap.add_argument(
        "--replace",
        action="store_true",
        help="Remove previous rows imported with source name google_sheet_ai_knowledge before insert",
    )
    ap.add_argument("--dry-run", action="store_true", help="Parse and embed only; no DB writes")
    ap.add_argument(
        "--batch-size",
        type=int,
        default=24,
        help="Embedding API batch size (default 24)",
    )
    args = ap.parse_args()

    api_key = (os.environ.get("OPENAI_API_KEY") or "").strip()
    if not api_key:
        print("Set OPENAI_API_KEY in .env.local")
        return 1

    csv_text = ""
    if args.csv:
        p = Path(args.csv)
        if not p.is_file():
            print(f"File not found: {p}")
            return 1
        csv_text = p.read_text(encoding="utf-8", errors="replace")
    else:
        sid = (os.environ.get("GOOGLE_SHEETS_AI_KNOWLEDGE_SPREADSHEET_ID") or "").strip()
        gid = (os.environ.get("GOOGLE_SHEETS_AI_KNOWLEDGE_GID") or "0").strip()
        if not sid:
            print("Provide --csv path or set GOOGLE_SHEETS_AI_KNOWLEDGE_SPREADSHEET_ID in .env.local")
            return 1
        try:
            csv_text = _fetch_csv_public(sid, gid)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                alt = _fetch_csv_google_api(sid, gid)
                if alt is None:
                    print(
                        "Sheet not publicly readable. Options:\n"
                        "  1) Share sheet: Anyone with the link → Viewer\n"
                        "  2) Or: pip install google-api-python-client google-auth\n"
                        "     Set GOOGLE_APPLICATION_CREDENTIALS to service account JSON\n"
                        "     Share the sheet with that service account email\n"
                        "  3) Or: Download CSV from Sheets and run with --csv file.csv"
                    )
                    return 1
                csv_text = alt
            else:
                print(f"HTTP {e.code} fetching public CSV export. Check spreadsheet id / gid, or use --csv.")
                return 1
        except Exception as e:
            alt = _fetch_csv_google_api(sid, gid)
            if alt is not None:
                csv_text = alt
            else:
                print(f"Failed to fetch sheet: {e}")
                return 1

    rows = _parse_csv_text(csv_text)
    if not rows:
        print("No rows parsed from CSV.")
        return 1

    chunk_texts: list[str] = []
    chunk_meta: list[dict[str, Any]] = []
    for i, row in enumerate(rows):
        raw, meta = _row_to_chunk_text(row)
        if not raw.strip():
            continue
        meta["csv_row"] = i + 2  # header = row 1
        for part in _split_oversized(raw):
            chunk_texts.append(part)
            chunk_meta.append(dict(meta))

    if not chunk_texts:
        print("No non-empty content rows.")
        return 1

    print(f"Prepared {len(chunk_texts)} chunk(s) from {len(rows)} CSV row(s).")

    embeddings: list[list[float]] = []
    bs = max(1, min(args.batch_size, 100))
    for i in range(0, len(chunk_texts), bs):
        batch = chunk_texts[i : i + bs]
        if args.dry_run:
            embeddings.extend([[0.0] * 1536 for _ in batch])
            continue
        print(f"Embedding {i + 1}–{i + len(batch)} / {len(chunk_texts)} …")
        embeddings.extend(_embed_batch(batch, api_key))

    if args.dry_run:
        print("Dry run: skipping database.")
        return 0

    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local")
        return 1

    source_name = "google_sheet_ai_knowledge"
    external_ref = (os.environ.get("GOOGLE_SHEETS_AI_KNOWLEDGE_SPREADSHEET_ID") or "csv_import").strip()
    doc_title = f"Knowledge import {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M')} UTC"

    with psycopg.connect(dsn, autocommit=False) as conn:
        with conn.cursor() as cur:
            if args.replace:
                cur.execute(
                    """
                    DELETE FROM knowledge_chunks
                    WHERE document_id IN (
                      SELECT kd.id FROM knowledge_documents kd
                      JOIN knowledge_sources ks ON ks.id = kd.source_id
                      WHERE ks.name = %s
                    );
                    """,
                    (source_name,),
                )
                cur.execute(
                    """
                    DELETE FROM knowledge_documents
                    WHERE source_id IN (SELECT id FROM knowledge_sources WHERE name = %s);
                    """,
                    (source_name,),
                )
                cur.execute("DELETE FROM knowledge_sources WHERE name = %s;", (source_name,))

            cur.execute(
                """
                INSERT INTO knowledge_sources (name, source_type, external_ref, notes)
                VALUES (%s, 'google_sheet', %s, 'ingest_knowledge_to_supabase.py')
                RETURNING id;
                """,
                (source_name, external_ref[:500]),
            )
            sid = cur.fetchone()[0]

            cur.execute(
                """
                INSERT INTO knowledge_documents (title, source_id, status)
                VALUES (%s, %s, 'published')
                RETURNING id;
                """,
                (doc_title[:500], sid),
            )
            doc_id = cur.fetchone()[0]

            for idx, (txt, emb, meta) in enumerate(zip(chunk_texts, embeddings, chunk_meta)):
                meta_out = {
                    **meta,
                    "import": "ingest_knowledge_to_supabase.py",
                    "document_title": doc_title,
                }
                cur.execute(
                    """
                    INSERT INTO knowledge_chunks
                      (document_id, chunk_index, content, embedding, metadata, status)
                    VALUES (%s, %s, %s, %s::vector, %s::jsonb, 'published');
                    """,
                    (
                        str(doc_id),
                        idx,
                        txt,
                        _vec_to_pg(emb),
                        json.dumps(meta_out),
                    ),
                )

        conn.commit()
    print(f"Inserted {len(chunk_texts)} chunk(s) into knowledge_chunks (document title: {doc_title}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
