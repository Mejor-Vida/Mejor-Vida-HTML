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


def _split_sql(sql: str) -> list[str]:
    """Split on semicolons at end-of-statement (PostgreSQL simple migrations)."""
    chunks: list[str] = []
    buf: list[str] = []
    for line in sql.splitlines():
        s = line.strip()
        buf.append(line)
        if s.endswith(";"):
            chunk = "\n".join(buf).strip()
            if chunk:
                chunks.append(chunk.rstrip(";").strip())
            buf = []
    if buf:
        chunk = "\n".join(buf).strip()
        if chunk:
            chunks.append(chunk.rstrip(";").strip())
    return [c for c in chunks if c]


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
                with conn.cursor() as cur:
                    for stmt in _split_sql(sql):
                        cur.execute(stmt + ";")
            except Exception as e:
                print(f"Error in {name}: {e}")
                return 1
            _mark_applied(conn, name)
    print("Migrations applied OK.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
