#!/usr/bin/env python3
"""Apply SQL files in migrations/ order. Run from repo root.

  pip install -r integrations/supabase/requirements.txt
  python3 integrations/supabase/apply_migrations.py

Requires DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD (see config.py).
"""

from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_root))

from integrations.supabase.config import get_database_url  # noqa: E402

try:
    import psycopg
except ImportError:
    print("Install: pip install -r integrations/supabase/requirements.txt")
    raise SystemExit(1)


def _ensure_tracker(conn) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
              filename text PRIMARY KEY,
              applied_at timestamptz NOT NULL DEFAULT now()
            );
            """
        )


def _is_applied(conn, filename: str) -> bool:
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM schema_migrations WHERE filename = %s", (filename,))
        return cur.fetchone() is not None


def _mark_applied(conn, filename: str) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO schema_migrations (filename) VALUES (%s) ON CONFLICT DO NOTHING",
            (filename,),
        )


def main() -> int:
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local")
        return 1
    mig_dir = Path(__file__).resolve().parent / "migrations"
    files = sorted(mig_dir.glob("*.sql"))
    if not files:
        print("No migrations/*.sql found.")
        return 1
    with psycopg.connect(dsn, autocommit=True) as conn:
        _ensure_tracker(conn)
        for path in files:
            name = path.name
            if _is_applied(conn, name):
                print(f"Skipping {name} (already applied).")
                continue
            sql = path.read_text(encoding="utf-8")
            print(f"Applying {name} …")
            try:
                # Run the whole file as one script so DO $$ ... $$ blocks and similar stay intact
                # (line-based _split_sql breaks on semicolons inside dollar-quoted bodies).
                with conn.cursor() as cur:
                    cur.execute(sql)
            except Exception as e:
                print(f"Error in {name}: {e}")
                return 1
            _mark_applied(conn, name)
    print("Migrations applied OK.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
