#!/usr/bin/env python3
"""Count knowledge_chunks for a given knowledge_sources.name (import batch)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_root))

try:
    import psycopg
except ImportError:
    print("Install: pip install -r integrations/supabase/requirements.txt")
    raise SystemExit(1)

from integrations.supabase.config import get_database_url  # noqa: E402


def main() -> int:
    ap = argparse.ArgumentParser(description="Count chunks by knowledge_sources.name")
    ap.add_argument("--source", required=True, metavar="NAME", help="knowledge_sources.name")
    args = ap.parse_args()
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local")
        return 1
    sql = """
    SELECT COUNT(*)::int
    FROM knowledge_chunks kc
    JOIN knowledge_documents kd ON kd.id = kc.document_id
    JOIN knowledge_sources ks ON ks.id = kd.source_id
    WHERE ks.name = %s
    """
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (args.source,))
            n = cur.fetchone()[0]
    print(n)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
