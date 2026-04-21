#!/usr/bin/env python3
"""Prune American Amicable / Mutual of Omaha background snippets and competing Julie license chunks.

Logs rows removed per DELETE. Requires DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD.

After running, re-ingest contact fixes (includes dedicated license rows):
  python3 scripts/ingest_knowledge_to_supabase.py \\
    --csv scripts/knowledge_rag_contact_fixes_2026-04-20.csv \\
    --source-name rag_contact_fixes_2026_04_20 --replace
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_root))

from integrations.supabase.config import get_database_url  # noqa: E402

try:
    import psycopg
except ImportError:
    print("Install: pip install -r integrations/supabase/requirements.txt")
    raise SystemExit(1)


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


def _delete(conn, label: str, sql: str, params: tuple = ()) -> int:
    with conn.cursor() as cur:
        cur.execute(sql, params)
        n = int(cur.fetchone()[0])
    print(f"  {label}: removed {n} row(s)")
    return n


def main() -> int:
    _load_env()
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD", file=sys.stderr)
        return 1

    stmts: list[tuple[str, str, tuple]] = [
        (
            "knowledge_chunks",
            "AmAm background (1910 + American Amicable)",
            """WITH d AS (
              DELETE FROM knowledge_chunks
              WHERE content ILIKE %s AND content ILIKE %s
              RETURNING id) SELECT count(*)::int FROM d""",
            ("%been in business since 1910%", "%American Amicable%"),
        ),
        (
            "faqs",
            "AmAm background (1910 + American Amicable)",
            """WITH d AS (
              DELETE FROM faqs
              WHERE answer ILIKE %s AND answer ILIKE %s
              RETURNING id) SELECT count(*)::int FROM d""",
            ("%been in business since 1910%", "%American Amicable%"),
        ),
        (
            "knowledge_chunks",
            "MOO background (100 years + Mutual of Omaha)",
            """WITH d AS (
              DELETE FROM knowledge_chunks
              WHERE content ILIKE %s AND content ILIKE %s
              RETURNING id) SELECT count(*)::int FROM d""",
            ("%over 100 years of history%", "%Mutual of Omaha%"),
        ),
        (
            "knowledge_chunks",
            "MOO background (Fortune 500 + Mutual of Omaha)",
            """WITH d AS (
              DELETE FROM knowledge_chunks
              WHERE content ILIKE %s AND content ILIKE %s
              RETURNING id) SELECT count(*)::int FROM d""",
            ("%Fortune 500%", "%Mutual of Omaha%"),
        ),
        (
            "faqs",
            "MOO background (100 years + Mutual of Omaha)",
            """WITH d AS (
              DELETE FROM faqs
              WHERE answer ILIKE %s AND answer ILIKE %s
              RETURNING id) SELECT count(*)::int FROM d""",
            ("%over 100 years of history%", "%Mutual of Omaha%"),
        ),
        (
            "faqs",
            "MOO background (Fortune 500 + Mutual of Omaha)",
            """WITH d AS (
              DELETE FROM faqs
              WHERE answer ILIKE %s AND answer ILIKE %s
              RETURNING id) SELECT count(*)::int FROM d""",
            ("%Fortune 500%", "%Mutual of Omaha%"),
        ),
        (
            "knowledge_chunks",
            "Julie license / 21695431 (OR Producer License + Julie)",
            """WITH d AS (
              DELETE FROM knowledge_chunks
              WHERE (content ILIKE %s)
                 OR (content ILIKE %s AND content ILIKE %s)
              RETURNING id) SELECT count(*)::int FROM d""",
            ("%21695431%", "%Producer License%", "%Julie%"),
        ),
        (
            "faqs",
            "FAQ answer contains 21695431",
            """WITH d AS (
              DELETE FROM faqs WHERE answer ILIKE %s
              RETURNING id) SELECT count(*)::int FROM d""",
            ("%21695431%",),
        ),
    ]

    with psycopg.connect(dsn, autocommit=False) as conn:
        print("prune_amam_moo_background_and_license:")
        for table, label, sql, params in stmts:
            _delete(conn, f"{table} — {label}", sql, params)
        conn.commit()

    print("done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
