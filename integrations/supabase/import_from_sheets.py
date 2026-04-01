#!/usr/bin/env python3
"""
Parse Assurity grids from Google Sheet "Carrier Rate Charts" and upsert into Supabase.

  pip install -r integrations/supabase/requirements.txt
  pip install -r integrations/google_sheets/requirements.txt
  python3 integrations/supabase/import_from_sheets.py

Env: GOOGLE_SHEETS_* + DATABASE_URL (or SUPABASE_URL + SUPABASE_DB_PASSWORD)
Optional: QUOTE_IMPORT_TAB=Carrier Rate Charts
          QUOTE_IMPORT_VERSION_CODE=sheet_import_v1
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_root))

from integrations.google_sheets.export_hero_carousel_quotes import (  # noqa: E402
    parse_assurity_protect_plus_base,
    parse_coverage_multiplier_examples,
)
from integrations.google_sheets.quote_engine import load_rate_chart_rows  # noqa: E402
from integrations.supabase.config import get_database_url  # noqa: E402

try:
    import psycopg
except ImportError:
    print("pip install psycopg[binary]")
    raise SystemExit(1)


def _get_or_create_carrier(cur, slug: str, name: str, logo_path: str | None = None) -> str:
    cur.execute("SELECT id FROM carriers WHERE slug = %s", (slug,))
    r = cur.fetchone()
    if r:
        return str(r[0])
    cur.execute(
        "INSERT INTO carriers (slug, display_name, logo_path) VALUES (%s, %s, %s) RETURNING id",
        (slug, name, logo_path),
    )
    return str(cur.fetchone()[0])


def _get_or_create_product(cur, carrier_id: str, slug: str, name: str) -> str:
    cur.execute(
        "SELECT id FROM products WHERE carrier_id = %s::uuid AND slug = %s",
        (carrier_id, slug),
    )
    r = cur.fetchone()
    if r:
        return str(r[0])
    cur.execute(
        "INSERT INTO products (carrier_id, slug, display_name) VALUES (%s::uuid, %s, %s) RETURNING id",
        (carrier_id, slug, name),
    )
    return str(cur.fetchone()[0])


def _upsert_product_version(cur, product_id: str, version_code: str, label: str) -> str:
    cur.execute(
        """
        SELECT id FROM product_versions WHERE product_id = %s::uuid AND version_code = %s
        """,
        (product_id, version_code),
    )
    r = cur.fetchone()
    if r:
        vid = str(r[0])
        cur.execute(
            "UPDATE product_versions SET is_active = true, display_label = %s WHERE id = %s::uuid",
            (label, vid),
        )
        cur.execute(
            "UPDATE product_versions SET is_active = false WHERE product_id = %s::uuid AND id != %s::uuid",
            (product_id, vid),
        )
        return vid
    cur.execute(
        """
        INSERT INTO product_versions (product_id, version_code, display_label, tobacco_class, is_active)
        VALUES (%s::uuid, %s, %s, 'non_tobacco', true)
        RETURNING id
        """,
        (product_id, version_code, label),
    )
    vid = str(cur.fetchone()[0])
    cur.execute(
        "UPDATE product_versions SET is_active = false WHERE product_id = %s::uuid AND id != %s::uuid",
        (product_id, vid),
    )
    return vid


def main() -> int:
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD")
        return 1
    tab = (os.environ.get("QUOTE_IMPORT_TAB") or "Carrier Rate Charts").strip()
    version_code = (os.environ.get("QUOTE_IMPORT_VERSION_CODE") or "sheet_import_v1").strip()
    print(f"Reading tab {tab!r} …")
    rows = load_rate_chart_rows(tab_name=tab)
    base = parse_assurity_protect_plus_base(rows)
    mults = parse_coverage_multiplier_examples(rows)
    if not base:
        print("No Assurity Protect+ base block found in sheet.")
        return 1
    if not mults:
        print("No coverage multiplier block found; using 10k only.")
        mults = {10_000: (1.0, 1.0)}

    print(
        f"Parsed ages {min(base.keys())}-{max(base.keys())} ({len(base)} rows), "
        f"{len(mults)} coverage tiers."
    )

    with psycopg.connect(dsn) as conn:
        conn.autocommit = False
        with conn.cursor() as cur:
            cid = _get_or_create_carrier(
                cur, "assurity", "Assurity", "img/carriers/assurity-wordmark.png"
            )
            pid = _get_or_create_product(
                cur, cid, "whole_life_protect_plus", "Whole Life Protect+"
            )
            vid = _upsert_product_version(
                cur, pid, version_code, f"Imported {version_code}"
            )

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
                VALUES (%s::uuid, 'Protect+ monthly 10k base', 'monthly_10k_base')
                RETURNING id
                """,
                (vid,),
            )
            rt_id = str(cur.fetchone()[0])

            for age in sorted(base.keys()):
                m, f = base[age]
                cur.execute(
                    """
                    INSERT INTO rate_rows (rate_table_id, issue_age, monthly_male_10k, monthly_female_10k)
                    VALUES (%s::uuid, %s, %s, %s)
                    """,
                    (rt_id, age, m, f),
                )

            for face in sorted(mults.keys()):
                mm, mf = mults[face]
                cur.execute(
                    """
                    INSERT INTO coverage_multipliers
                    (product_version_id, face_amount, multiplier_male, multiplier_female)
                    VALUES (%s::uuid, %s, %s, %s)
                    """,
                    (vid, face, mm, mf),
                )

        conn.commit()
    print("Supabase import committed OK. QUOTE_DATA_SOURCE defaults to supabase in the quote API.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
