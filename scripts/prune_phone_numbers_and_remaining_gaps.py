#!/usr/bin/env python3
from __future__ import annotations
import os, sys
from pathlib import Path
_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(_root))
from integrations.supabase.config import get_database_url
import psycopg

def load_env():
    env = _root / '.env.local'
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line=line.strip()
        if line and not line.startswith('#') and '=' in line:
            k,_,v=line.partition('=')
            if k and k not in os.environ:
                os.environ[k]=v.strip().strip('"').strip("'")

def run():
    load_env()
    dsn=get_database_url()
    if not dsn:
        raise SystemExit('Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD')
    stmts=[
      ('faqs old call-in 402-588-1125',"WITH d AS (DELETE FROM faqs WHERE answer ILIKE %s RETURNING id) SELECT count(*)::int FROM d",('%402-588-1125%',)),
      ('chunks old call-in 402-588-1125 outside allowed sources',"""WITH d AS (DELETE FROM knowledge_chunks kc USING knowledge_documents kd, knowledge_sources ks WHERE kc.document_id=kd.id AND kd.source_id=ks.id AND kc.content ILIKE %s AND ks.name NOT IN ('rag_contact_fixes_2026_04_20','rag_qa_fixes_2026_04_20','rag_coverage_gaps_2026_04_20') RETURNING kc.id) SELECT count(*)::int FROM d""",('%402-588-1125%',)),
      ('faqs stale approval EN',"WITH d AS (DELETE FROM faqs WHERE answer ILIKE %s AND answer ILIKE %s RETURNING id) SELECT count(*)::int FROM d",('%few days to a week%','%simplified issue%')),
      ('faqs stale approval ES',"WITH d AS (DELETE FROM faqs WHERE answer ILIKE %s RETURNING id) SELECT count(*)::int FROM d",('%pocos días a una semana%',)),
      ('chunks MOO offers-as-carrier',"WITH d AS (DELETE FROM knowledge_chunks WHERE content ILIKE %s RETURNING id) SELECT count(*)::int FROM d",('%offers Mutual of Omaha as one of the carriers%',)),
      ('faqs MOO offers-as-carrier',"WITH d AS (DELETE FROM faqs WHERE answer ILIKE %s RETURNING id) SELECT count(*)::int FROM d",('%offers Mutual of Omaha as one of the carriers%',)),
    ]
    with psycopg.connect(dsn, autocommit=False) as conn:
      with conn.cursor() as cur:
        for label,sql,params in stmts:
          cur.execute(sql,params)
          print(f"{label}: removed {int(cur.fetchone()[0])} row(s)")
      conn.commit()

if __name__ == '__main__':
    run()
