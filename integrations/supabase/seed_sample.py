#!/usr/bin/env python3
"""Minimal Assurity-shaped data for local smoke test (no Google Sheet).

  python3 integrations/supabase/seed_sample.py
"""

from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_root))

from integrations.supabase.config import get_database_url  # noqa: E402
from integrations.supabase.import_from_sheets import (  # noqa: E402
    _get_or_create_carrier,
    _get_or_create_product,
    _upsert_product_version,
)

try:
    import psycopg
except ImportError:
    print("pip install psycopg[binary]")
    raise SystemExit(1)


def main() -> int:
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD")
        return 1

    base = {60: (45.0, 40.0), 65: (55.0, 48.0)}
    mults = {
        10_000: (1.0, 1.0),
        15_000: (1.45, 1.45),
        20_000: (1.9, 1.9),
    }

    with psycopg.connect(dsn) as conn:
        conn.autocommit = False
        with conn.cursor() as cur:
            cid = _get_or_create_carrier(cur, "assurity", "Assurity")
            pid = _get_or_create_product(
                cur, cid, "whole_life_protect_plus", "Whole Life Protect+"
            )
            vid = _upsert_product_version(cur, pid, "seed_demo_v1", "Seed demo (not real rates)")

            cur.execute(
                "DELETE FROM coverage_multipliers WHERE product_version_id = %s::uuid",
                (vid,),
            )
            cur.execute(
                """
                DELETE FROM rate_rows WHERE rate_table_id IN (
                  SELECT id FROM rate_tables WHERE product_version_id = %s::uuid
                )
                """,
                (vid,),
            )
            cur.execute(
                "DELETE FROM rate_tables WHERE product_version_id = %s::uuid",
                (vid,),
            )

            cur.execute(
                """
                INSERT INTO rate_tables (product_version_id, name, table_kind)
                VALUES (%s::uuid, 'Seed Protect+ base', 'monthly_10k_base')
                RETURNING id
                """,
                (vid,),
            )
            rt_id = str(cur.fetchone()[0])
            for age, (m, f) in sorted(base.items()):
                cur.execute(
                    """
                    INSERT INTO rate_rows (rate_table_id, issue_age, monthly_male_10k, monthly_female_10k)
                    VALUES (%s::uuid, %s, %s, %s)
                    """,
                    (rt_id, age, m, f),
                )
            for face, (mm, mf) in sorted(mults.items()):
                cur.execute(
                    """
                    INSERT INTO coverage_multipliers
                    (product_version_id, face_amount, multiplier_male, multiplier_female)
                    VALUES (%s::uuid, %s, %s, %s)
                    """,
                    (vid, face, mm, mf),
                )

        conn.commit()
    print("Seed demo rates inserted as version_code=seed_demo_v1 (active).")
    print("Test quote: age 60, gender male, coverage 15000 should return a monthly.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
