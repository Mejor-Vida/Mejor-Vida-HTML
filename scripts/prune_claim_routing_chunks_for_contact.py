#!/usr/bin/env python3
"""Delete knowledge_chunks (non–contact-fixes source) whose content is claim-filing intros.

Those snippets rank high for 'contact' questions but route users to claims instead of customer service.
Keeps rows from source rag_contact_fixes_2026_04_20 untouched.

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

KEEP_SOURCE = "rag_contact_fixes_2026_04_20"
MARKERS = [
    "To file a life insurance claim with American Amicable",
    "To file a life insurance claim with Mutual of Omaha",
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

    or_clauses = " OR ".join(["kc.content LIKE %s" for _ in MARKERS])
    params = tuple(f"%{m}%" for m in MARKERS)

    sql = f"""
    WITH deleted AS (
      DELETE FROM knowledge_chunks kc
      USING knowledge_documents kd, knowledge_sources ks
      WHERE kc.document_id = kd.id
        AND kd.source_id = ks.id
        AND ks.name <> %s
        AND ({or_clauses})
      RETURNING kc.id
    )
    SELECT count(*)::int FROM deleted;
    """
    args = (KEEP_SOURCE,) + params

    with psycopg.connect(dsn, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, args)
            n = int(cur.fetchone()[0])
        conn.commit()

    print(f"Deleted {n} claim-routing chunk(s) (sources other than {KEEP_SOURCE!r}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
