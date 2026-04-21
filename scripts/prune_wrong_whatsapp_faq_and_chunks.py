#!/usr/bin/env python3
"""Remove cached FAQs and knowledge_chunks that equate WhatsApp with 402-588-1125.

DELETE FROM faqs WHERE answer matches WhatsApp + 402-588-1125.
DELETE FROM knowledge_chunks WHERE content matches whatsapp + 402-588-1125 (case-insensitive).

Uses .env.local for DB credentials (same as ingest).
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

    faq_where = "answer ILIKE %s AND answer ILIKE %s"
    faq_params = ("%WhatsApp%", "%402-588-1125%")

    chunk_where = "content ILIKE %s AND content ILIKE %s"
    chunk_params = ("%whatsapp%", "%402-588-1125%")

    with psycopg.connect(dsn, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT count(*)::int FROM faqs WHERE {faq_where}", faq_params)
            faq_before = int(cur.fetchone()[0])
            cur.execute(f"SELECT count(*)::int FROM knowledge_chunks WHERE {chunk_where}", chunk_params)
            chunk_before = int(cur.fetchone()[0])

        print(f"audit: faqs matching WhatsApp + 402-588-1125: {faq_before}")
        print(f"audit: knowledge_chunks matching whatsapp + 402-588-1125: {chunk_before}")

        with conn.cursor() as cur:
            cur.execute(
                f"WITH d AS (DELETE FROM faqs WHERE {faq_where} RETURNING id) SELECT count(*)::int FROM d",
                faq_params,
            )
            faq_del = int(cur.fetchone()[0])
            cur.execute(
                f"WITH d AS (DELETE FROM knowledge_chunks WHERE {chunk_where} RETURNING id) SELECT count(*)::int FROM d",
                chunk_params,
            )
            chunk_del = int(cur.fetchone()[0])
        conn.commit()

        print(f"delete: faqs removed {faq_del}")
        print(f"delete: knowledge_chunks removed {chunk_del}")

        with conn.cursor() as cur:
            cur.execute(f"SELECT count(*)::int FROM faqs WHERE {faq_where}", faq_params)
            faq_after = int(cur.fetchone()[0])
            cur.execute(f"SELECT count(*)::int FROM knowledge_chunks WHERE {chunk_where}", chunk_params)
            chunk_after = int(cur.fetchone()[0])
        print(f"verify: remaining faqs {faq_after}, remaining chunks {chunk_after}")

    return 0 if faq_after == 0 and chunk_after == 0 else 0


if __name__ == "__main__":
    raise SystemExit(main())
