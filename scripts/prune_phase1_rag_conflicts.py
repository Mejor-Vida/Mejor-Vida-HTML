#!/usr/bin/env python3
"""Remove Phase 1 knowledge_chunks that steal retrieval from specific Julie/MVI/carrier contact FAQs.

Targets source name rag_phase1_2026_04_20 (ingest --source-name used for Phase 1 CSV).
Chunk content format from ingest: lines include 'Question: ...' from Q/A rows.

Requires DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local (same as ingest).
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

SOURCE = "rag_phase1_2026_04_20"

# Substrings matched against knowledge_chunks.content (case-sensitive: Question: is exact from ingest)
QUESTION_MARKERS = [
    "Question: Why should I work with an independent agent instead of going directly to an insurance company?",
    "Question: How much does final expense insurance cost?",
    "Question: How do I contact Assurity customer service?",
    "Question: How do I file a claim with Assurity?",
    "Question: How do I contact American Amicable customer service?",
    "Question: How do I file a claim with American Amicable?",
    "Question: Is Assurity a Nebraska company?",
]


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

    conditions = " OR ".join(["kc.content LIKE %s" for _ in QUESTION_MARKERS])
    params = [f"%{m}%" for m in QUESTION_MARKERS]

    sql = f"""
    WITH deleted AS (
      DELETE FROM knowledge_chunks kc
      USING knowledge_documents kd, knowledge_sources ks
      WHERE kc.document_id = kd.id
        AND kd.source_id = ks.id
        AND ks.name = %s
        AND ({conditions})
      RETURNING kc.id
    )
    SELECT count(*)::int FROM deleted;
    """
    args = (SOURCE,) + tuple(params)

    with psycopg.connect(dsn, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, args)
            deleted = int(cur.fetchone()[0])
        conn.commit()

    print(f"Deleted {deleted} chunk(s) from source {SOURCE!r} matching generic contact/Julie/carrier patterns.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
