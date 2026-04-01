#!/usr/bin/env python3
"""
Import Mutual of Omaha Living Promise NE base-rate CSVs into moo_living_promise_rates.

Expected CSV columns (see moo_integration_spec.md):
  product_slug, age, gender, tobacco, base_rate_per_1k, policy_fee_annual,
  modal_factor, monthly_bsp_10k, min_face, max_face

Run from repo root (after migration 004 + pip install psycopg):
  python3 integrations/supabase/import_moo_lp_csv.py \\
    "/path/to/living_promise_level_nt_NE.csv" \\
    "/path/to/living_promise_level_t_NE.csv" \\
    "/path/to/living_promise_graded_NE.csv"

Or set MOO_LP_CSV_DIR to a folder containing those three filenames.
"""

from __future__ import annotations

import csv
import os
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


def _parse_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def _upsert_rates_for_version(cur, vid: str, rows: list[dict[str, str]]) -> int:
    cur.execute("DELETE FROM moo_living_promise_rates WHERE product_version_id = %s::uuid", (vid,))
    n = 0
    for r in rows:
        age = int(float(r["age"]))
        gender = str(r["gender"]).strip().lower()
        if gender not in ("male", "female"):
            continue
        cur.execute(
            """
            INSERT INTO moo_living_promise_rates (
              product_version_id, issue_age, gender,
              base_rate_per_1k, policy_fee_annual, modal_factor, min_face, max_face
            ) VALUES (%s::uuid, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                vid,
                age,
                gender,
                float(str(r["base_rate_per_1k"]).replace(",", "")),
                float(str(r["policy_fee_annual"]).replace(",", "")),
                float(str(r["modal_factor"]).replace(",", "")),
                int(float(str(r["min_face"]).replace(",", ""))),
                int(float(str(r["max_face"]).replace(",", ""))),
            ),
        )
        n += 1
    return n


def main() -> int:
    dsn = get_database_url()
    if not dsn:
        print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD")
        return 1

    default_dir = Path.home() / "Desktop" / "Cowork Downloads"
    csv_dir = (os.environ.get("MOO_LP_CSV_DIR") or "").strip()
    paths: list[Path] = []
    if csv_dir:
        d = Path(csv_dir).expanduser()
        for name in (
            "living_promise_level_nt_NE.csv",
            "living_promise_level_t_NE.csv",
            "living_promise_graded_NE.csv",
        ):
            paths.append(d / name)
    else:
        paths = [Path(p).expanduser() for p in sys.argv[1:]]
        if len(paths) != 3:
            if (default_dir / "living_promise_level_nt_NE.csv").is_file():
                print(f"Using {default_dir}")
                paths = [
                    default_dir / "living_promise_level_nt_NE.csv",
                    default_dir / "living_promise_level_t_NE.csv",
                    default_dir / "living_promise_graded_NE.csv",
                ]
            else:
                print(
                    "Usage: python3 import_moo_lp_csv.py <level_nt.csv> <level_t.csv> <graded.csv>\n"
                    "   or: MOO_LP_CSV_DIR=/path/to/dir (with the three standard filenames)"
                )
                return 1

    version_code = (os.environ.get("MOO_LP_VERSION_CODE") or "ne_csv_v1").strip()
    display_tpl = "MoO LP NE ({slug})"

    total = 0
    with psycopg.connect(dsn) as conn:
        conn.autocommit = False
        with conn.cursor() as cur:
            cid = _get_or_create_carrier(
                cur,
                "mutual-of-omaha",
                "Mutual of Omaha",
                "img/carriers/mutual-of-omaha-logo.svg",
            )
            for path in paths:
                if not path.is_file():
                    print(f"Missing file: {path}")
                    return 1
                rows = _parse_csv(path)
                if not rows:
                    print(f"Empty: {path}")
                    return 1
                slug = rows[0].get("product_slug", "").strip()
                if not slug:
                    print(f"No product_slug in {path}")
                    return 1
                label = slug.replace("_", " ").title()
                pid = _get_or_create_product(cur, cid, slug, label)
                vid = _upsert_product_version(
                    cur, pid, version_code, display_tpl.format(slug=slug)
                )
                n = _upsert_rates_for_version(cur, vid, rows)
                print(f"{slug}: {n} rows from {path.name}")
                total += n
        conn.commit()
    print(f"Committed {total} moo_living_promise_rates rows total.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
