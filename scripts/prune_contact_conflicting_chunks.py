#!/usr/bin/env python3
"""Surgical knowledge_chunks cleanup: remove Julie bio + AmAm/MOO claim-routing snippets.

Deletes by content patterns (any source). Logs counts per step, then verifies 0 matches remain.

After this, re-ingest contact CSV (rows 1–8 only, no bio) with --replace:
  python3 scripts/ingest_knowledge_to_supabase.py \\
    --csv scripts/knowledge_rag_contact_fixes_2026-04-20.csv \\
    --source-name rag_contact_fixes_2026_04_20 --replace

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


def _delete_where(conn, label: str, where_sql: str, params: tuple) -> int:
    sql = f"""
    WITH deleted AS (
      DELETE FROM knowledge_chunks kc
      WHERE {where_sql}
      RETURNING kc.id
    )
    SELECT count(*)::int FROM deleted;
    """
    with conn.cursor() as cur:
        cur.execute(sql, params)
        n = int(cur.fetchone()[0])
    print(f"step {label}: deleted {n} row(s)")
    return n


def _count_where(conn, label: str, where_sql: str, params: tuple) -> int:
    sql = f"SELECT count(*)::int FROM knowledge_chunks kc WHERE {where_sql}"
    with conn.cursor() as cur:
        cur.execute(sql, params)
        return int(cur.fetchone()[0])


def main() -> int:
    _load_env()
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD", file=sys.stderr)
        return 1

    # --- Step 1: Julie bio (any source) ---
    julie_bio_where = """(
      kc.content ILIKE %s
      OR kc.content ILIKE %s
      OR kc.content ILIKE %s
      OR kc.content ILIKE %s
    )"""
    julie_bio_params = (
        "%Julie Braunsroth es la fundadora%",
        "%Julie Braunsroth is the founder%",
        "%Julie is the founder%",
        "%independent insurance agency in Nebraska, run by Julie%",
    )

    # --- Step 2a: American Amicable + claim + 800-736-7311 (all required) ---
    amam_claim_where = """(
      kc.content ILIKE %s
      AND kc.content ILIKE %s
      AND kc.content ILIKE %s
    )"""
    amam_claim_params = (
        "%American Amicable%",
        "%claim%",
        "%800-736-7311%",
    )

    # --- Step 2b: Mutual of Omaha + claim + death certificate ---
    moo_claim_where = """(
      kc.content ILIKE %s
      AND kc.content ILIKE %s
      AND kc.content ILIKE %s
    )"""
    moo_claim_params = (
        "%Mutual of Omaha%",
        "%claim%",
        "%death certificate%",
    )

    with psycopg.connect(dsn, autocommit=False) as conn:
        print("--- deletions ---")
        _delete_where(conn, "1 Julie bio", julie_bio_where, julie_bio_params)
        _delete_where(conn, "2a AmAm claim+736", amam_claim_where, amam_claim_params)
        _delete_where(conn, "2b MOO claim+death cert", moo_claim_where, moo_claim_params)
        conn.commit()

        print("\n--- verification (expect 0) ---")
        v1 = _count_where(
            conn,
            "Julie bio patterns",
            """(
      kc.content ILIKE %s OR kc.content ILIKE %s
      OR kc.content ILIKE %s OR kc.content ILIKE %s
    )""",
            julie_bio_params,
        )
        v2 = _count_where(conn, "AmAm+claim+736", amam_claim_where, amam_claim_params)
        v3 = _count_where(conn, "MOO+claim+death cert", moo_claim_where, moo_claim_params)
        print(f"remaining Julie bio pattern(s): {v1}")
        print(f"remaining AmAm+claim+800-736-7311: {v2}")
        print(f"remaining MOO+claim+death certificate: {v3}")
        ok = v1 == 0 and v2 == 0 and v3 == 0
        if not ok:
            print("WARNING: verification counts are not all zero.", file=sys.stderr)
            return 2

    print("\nOK: verification passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
