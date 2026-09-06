#!/usr/bin/env python3
"""Dump Supabase Postgres (public tables + auth users/identities + storage files) to a zip.

Usage:
  python3 scripts/dump-supabase-backup.py --out /tmp/mvi-supabase.zip

Prints one JSON manifest object to stdout. Progress goes to stderr.
Never prints secrets.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "integrations" / "supabase"))

from config import get_database_url, get_service_role_key  # noqa: E402

AUTH_TABLES = ("users", "identities")
STORAGE_META_TABLES = ("buckets", "objects")


def _quote_ident(name: str) -> str:
    return '"' + str(name).replace('"', '""') + '"'


def _supabase_url() -> str:
    return (os.environ.get("SUPABASE_URL") or "").strip().rstrip("/")


def _http_json(url: str, key: str, method: str = "GET", body: bytes | None = None, accept: str = "application/json"):
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header("apikey", key)
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Accept", accept)
    if body is not None:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=120) as resp:
        raw = resp.read()
        ctype = str(resp.headers.get("Content-Type") or "")
        return raw, ctype


def copy_table_to_zip(
    conn,
    zf: zipfile.ZipFile,
    schema: str,
    table: str,
    arcname: str,
) -> dict:
    ident = f"{_quote_ident(schema)}.{_quote_ident(table)}"
    sql = f"COPY {ident} TO STDOUT WITH (FORMAT csv, HEADER true, ENCODING 'UTF8')"
    tmp = tempfile.NamedTemporaryFile(prefix=f"mvi-{schema}-{table}-", suffix=".csv", delete=False)
    tmp_path = Path(tmp.name)
    rows = 0
    try:
        with conn.cursor() as cur, tmp_path.open("wb") as fh:
            with cur.copy(sql) as copy:
                while True:
                    data = copy.read()
                    if not data:
                        break
                    fh.write(data)
        # Count data rows (header + lines). CSV can contain newlines in quotes;
        # use a cheap estimate from COPY isn't available, so count via SQL.
        with conn.cursor() as cur:
            cur.execute(f"SELECT COUNT(*) FROM {ident}")
            rows = int(cur.fetchone()[0])
        zf.write(tmp_path, arcname=arcname)
        return {"schema": schema, "table": table, "rows": rows, "bytes": tmp_path.stat().st_size}
    finally:
        tmp.close()
        try:
            tmp_path.unlink(missing_ok=True)
        except OSError:
            pass


def list_tables(conn, schema: str) -> list[str]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT c.relname
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = %s
              AND c.relkind IN ('r', 'p')
            ORDER BY 1
            """,
            (schema,),
        )
        return [r[0] for r in cur.fetchall()]


def add_storage_files(zf: zipfile.ZipFile, manifest: dict) -> None:
    url = _supabase_url()
    key = get_service_role_key()
    if not url or not key:
        manifest["storage_files"] = {"skipped": "missing SUPABASE_URL or service role key"}
        return
    files_meta = []
    try:
        raw, _ = _http_json(f"{url}/storage/v1/bucket", key)
        buckets = json.loads(raw.decode("utf-8") or "[]")
    except Exception as e:
        manifest["storage_files"] = {"error": str(e)[:300]}
        return
    for bucket in buckets:
        name = (bucket.get("id") or bucket.get("name") or "").strip()
        if not name:
            continue
        prefix = ""
        try:
            body = json.dumps({"prefix": prefix, "limit": 1000, "offset": 0}).encode("utf-8")
            raw, _ = _http_json(
                f"{url}/storage/v1/object/list/{urllib.parse.quote(name, safe='')}",
                key,
                method="POST",
                body=body,
            )
            listing = json.loads(raw.decode("utf-8") or "[]")
        except Exception as e:
            files_meta.append({"bucket": name, "error": str(e)[:200]})
            continue
        for obj in listing or []:
            obj_name = (obj.get("name") or "").strip()
            if not obj_name or not obj.get("id"):
                continue
            try:
                file_raw, ctype = _http_json(
                    f"{url}/storage/v1/object/{urllib.parse.quote(name, safe='')}/{urllib.parse.quote(obj_name, safe='/')}",
                    key,
                    accept="*/*",
                )
                arc = f"storage/files/{name}/{obj_name}"
                zf.writestr(arc, file_raw)
                files_meta.append(
                    {
                        "bucket": name,
                        "name": obj_name,
                        "bytes": len(file_raw),
                        "contentType": ctype,
                    }
                )
            except Exception as e:
                files_meta.append({"bucket": name, "name": obj_name, "error": str(e)[:200]})
    manifest["storage_files"] = files_meta


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", required=True, help="Output zip path")
    args = parser.parse_args()

    import psycopg

    db_url = get_database_url()
    if not db_url:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD", file=sys.stderr)
        return 1

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    created = datetime.now(timezone.utc).isoformat()
    manifest: dict = {
        "format": "csv-copy-zip",
        "createdAt": created,
        "tables": [],
        "notes": (
            "Restore on a new Supabase project: apply integrations/supabase/migrations, "
            "then COPY FROM each public/*.csv (CSV HEADER). auth/users.csv and identities "
            "are optional. Storage files are under storage/files/."
        ),
    }

    print(f"Connecting to Postgres pooler…", file=sys.stderr)
    conn = psycopg.connect(db_url, connect_timeout=20)
    try:
        with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_DEFLATED, allowZip64=True) as zf:
            public_tables = list_tables(conn, "public")
            print(f"Dumping {len(public_tables)} public tables…", file=sys.stderr)
            for table in public_tables:
                print(f"  public.{table}", file=sys.stderr)
                info = copy_table_to_zip(conn, zf, "public", table, f"public/{table}.csv")
                manifest["tables"].append(info)
            for table in AUTH_TABLES:
                print(f"  auth.{table}", file=sys.stderr)
                try:
                    info = copy_table_to_zip(conn, zf, "auth", table, f"auth/{table}.csv")
                    manifest["tables"].append(info)
                except Exception as e:
                    manifest.setdefault("skipped", []).append(
                        {"schema": "auth", "table": table, "reason": str(e)[:200]}
                    )
            for table in STORAGE_META_TABLES:
                print(f"  storage.{table}", file=sys.stderr)
                try:
                    info = copy_table_to_zip(conn, zf, "storage", table, f"storage/{table}.csv")
                    manifest["tables"].append(info)
                except Exception as e:
                    manifest.setdefault("skipped", []).append(
                        {"schema": "storage", "table": table, "reason": str(e)[:200]}
                    )
            print("Downloading storage objects…", file=sys.stderr)
            add_storage_files(zf, manifest)
            zf.writestr("manifest.json", json.dumps(manifest, indent=2) + "\n")
    finally:
        conn.close()

    manifest["zipBytes"] = out_path.stat().st_size
    print(
        json.dumps(
            {
                "ok": True,
                "format": "csv-copy-zip",
                "zipBytes": manifest["zipBytes"],
                "tableCount": len(manifest["tables"]),
                "skipped": manifest.get("skipped") or [],
            }
        ),
        flush=True,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
