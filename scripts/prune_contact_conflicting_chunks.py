#!/usr/bin/env python3
"""Audit + delete knowledge_chunks that steal contact/location retrieval from dedicated rows.

Logs id, knowledge_sources.name, first 120 chars of content, then deletes matches.
Run from repo root; uses .env.local for DATABASE_URL (same as ingest).

After this, re-ingest contact CSV with --replace:
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


def main() -> int:
    _load_env()
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD", file=sys.stderr)
        return 1

    # One SELECT with OR of all patterns; DISTINCT id
    sql_select = """
    SELECT DISTINCT kc.id, ks.name AS source_name, left(kc.content, 120) AS preview
    FROM knowledge_chunks kc
    JOIN knowledge_documents kd ON kd.id = kc.document_id
    JOIN knowledge_sources ks ON ks.id = kd.source_id
    WHERE
      kc.content ILIKE %s
      OR kc.content ILIKE %s
      OR kc.content ILIKE %s
      OR kc.content ILIKE %s
      OR (
        kc.content ILIKE %s
        OR (kc.content ILIKE %s AND kc.content ILIKE %s)
      )
      OR (kc.content ILIKE %s AND kc.content ILIKE %s)
    ORDER BY ks.name, kc.id;
    """

    p1 = "%Julie Braunsroth es la fundadora%"
    p2a = "%Julie is the founder%"
    p2b = "%Julie Braunsroth is the founder%"
    p3 = "%To file a life insurance claim with American Amicable%"
    p_moo_claim = "%To file a life insurance claim with Mutual of Omaha%"
    p_claims_dept = "%claims department%"
    p_moo = "%Mutual of Omaha%"
    p_nat = "%national life insurance company%"
    p_aa = "%American Amicable%"

    params = (p1, p2a, p2b, p3, p_moo_claim, p_claims_dept, p_moo, p_nat, p_aa)

    with psycopg.connect(dsn, autocommit=False) as conn:
        with conn.cursor() as cur:
            cur.execute(sql_select, params)
            rows = cur.fetchall()
            print(f"audit: {len(rows)} matching chunk(s)\n")
            ids: list = []
            for rid, src, preview in rows:
                ids.append(rid)
                pv = (preview or "").replace("\n", " ")
                print(f"  id={rid}\n  source_name={src}\n  preview={pv!r}\n")

            if not ids:
                conn.commit()
                print("delete: 0 rows (nothing matched)")
                return 0

            cur.execute(
                "DELETE FROM knowledge_chunks WHERE id = ANY(%s::uuid[]);",
                (ids,),
            )
            deleted = cur.rowcount
        conn.commit()

    print(f"delete: removed {deleted} chunk(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
