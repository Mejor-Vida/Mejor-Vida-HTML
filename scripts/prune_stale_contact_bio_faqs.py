#!/usr/bin/env python3
"""Delete faqs rows whose cached answer matches stale bio / claim contact text.

Logs matching row count per pattern (SELECT before delete), then deletes all matches in one statement.

Requires DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local.
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


def main() -> int:
    _load_env()
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD", file=sys.stderr)
        return 1

    patterns = [
        ("Julie Braunsroth es la fundadora", "%Julie Braunsroth es la fundadora%"),
        ("Julie Braunsroth is the founder", "%Julie Braunsroth is the founder%"),
        ("independent insurance agency in Nebraska, run by Julie", "%independent insurance agency in Nebraska, run by Julie%"),
        ("To file a life insurance claim with American Amicable", "%To file a life insurance claim with American Amicable%"),
        ("To file a life insurance claim with Mutual of Omaha", "%To file a life insurance claim with Mutual of Omaha%"),
        ("claims@aatx.com", "%claims@aatx.com%"),
    ]

    or_parts = " OR ".join(["answer ILIKE %s" for _ in patterns])
    delete_sql = f"WITH deleted AS (DELETE FROM faqs WHERE {or_parts} RETURNING id) SELECT count(*)::int FROM deleted;"
    count_params = tuple(p for _, p in patterns)

    with psycopg.connect(dsn, autocommit=False) as conn:
        print("audit: rows matching each pattern (before delete):")
        with conn.cursor() as cur:
            for label, pat in patterns:
                cur.execute("SELECT count(*)::int FROM faqs WHERE answer ILIKE %s;", (pat,))
                n = int(cur.fetchone()[0])
                print(f"  {label!r}: {n} row(s)")

        with conn.cursor() as cur:
            cur.execute(delete_sql, count_params)
            removed = int(cur.fetchone()[0])
        conn.commit()

    print(f"\ndelete: removed {removed} distinct faq row(s) total (OR of all patterns).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
