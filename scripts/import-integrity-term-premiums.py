#!/usr/bin/env python3
"""Import Integrity Connect FU term harvest into term_integrity_premiums.

Reads:
  integrations/knowledge/Term_Life_Knowledge/integrity-term-harvest.json

Writes / refreshes:
  integrations/knowledge/Term_Life_Knowledge/integrity-fu-term-premiums.csv
    (all captured competitor cards, not winners-only)
  Supabase table term_integrity_premiums (via DATABASE_URL / pooler)

Usage (repo root):
  python3 scripts/import-integrity-term-premiums.py
  python3 scripts/import-integrity-term-premiums.py --dry-run
  python3 scripts/import-integrity-term-premiums.py --csv-only

Does not touch term_carrier_premiums (AmAm Easy Term SI).
Never prints secrets.
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

HARVEST_JSON = (
    ROOT
    / "integrations/knowledge/Term_Life_Knowledge/integrity-term-harvest.json"
)
OUT_CSV = (
    ROOT
    / "integrations/knowledge/Term_Life_Knowledge/integrity-fu-term-premiums.csv"
)

HEALTH_MAP = {
    "PP": "preferred_plus_nt",
    "P": "preferred_nt",
    "SP": "standard_plus_nt",
    "S": "standard_nt",
    "SUB": "substandard_nt",
}

# Carriers publish a shorter class ladder for tobacco users, so a tobacco cell
# cannot reuse the non-tobacco slugs above.
TOBACCO_HEALTH_MAP = {
    "PP": "preferred_t",
    "P": "preferred_t",
    "SP": "standard_t",
    "S": "standard_t",
    "SUB": "substandard_t",
}


def health_class_for(code: str, tobacco: bool) -> str:
    code = code or "PP"
    if tobacco:
        return TOBACCO_HEALTH_MAP.get(code, "standard_t")
    return HEALTH_MAP.get(code, "preferred_plus_nt")

# MVI known appointed / contracted carriers (repo + public carrier pages).
# Banner / Symetra / Protective / Prudential / Pacific / Principal are marketplace-only.
MVI_APPOINTED_SLUGS = frozenset(
    {
        "transamerica",
        "corebridge",
        "moo",
        "amam",
        "assurity",
        "aetna",
        "americo",
    }
)


def carrier_slug(carrier: str) -> str:
    c = (carrier or "").lower()
    if "transamerica" in c:
        return "transamerica"
    if "corebridge" in c or "american general" in c:
        return "corebridge"
    if "banner" in c:
        return "banner"
    if "protective" in c:
        return "protective"
    if "symetra" in c:
        return "symetra"
    if "pacific" in c:
        return "pacific_life"
    if "principal" in c:
        return "principal"
    if "prudential" in c:
        return "prudential"
    if "lincoln" in c:
        return "lincoln"
    if "minnesota" in c:
        return "minnesota_life"
    if "john hancock" in c:
        return "john_hancock"
    if "nationwide" in c:
        return "nationwide"
    if "north american" in c:
        return "north_american"
    if "omaha" in c or "mutual" in c:
        return "moo"
    if "american amicable" in c or "amicable" in c:
        return "amam"
    if "assurity" in c:
        return "assurity"
    if "aetna" in c or "accendo" in c:
        return "aetna"
    if "americo" in c:
        return "americo"
    slug = "".join(ch if ch.isalnum() else "_" for ch in c)
    while "__" in slug:
        slug = slug.replace("__", "_")
    return (slug.strip("_") or "unknown")[:40]


def product_slug(product: str) -> str:
    slug = "".join(ch if ch.isalnum() else "_" for ch in (product or "").lower())
    while "__" in slug:
        slug = slug.replace("__", "_")
    return (slug.strip("_") or "term")[:60]


def underwriting_mode(product_type: str) -> str:
    pt = (product_type or "").lower()
    if "simplified" in pt or pt == "si":
        return "simplified"
    return "fully_underwritten"


def harvest_batch_id(harvested_at: str) -> str:
    try:
        return datetime.fromisoformat(harvested_at.replace("Z", "+00:00")).date().isoformat()
    except Exception:
        return date.today().isoformat()


def expand_rows(data: dict) -> list[dict]:
    batch = harvest_batch_id(data.get("harvested_at") or "")
    source_date = batch
    rows: list[dict] = []
    for rec in data.get("records") or []:
        cards = rec.get("all") or rec.get("top") or []
        if not cards and rec.get("best"):
            cards = [rec["best"]]
        tobacco = bool(rec.get("tobacco"))
        health = health_class_for(rec.get("health"), tobacco)
        health_label = rec.get("health_label") or ""
        uw = underwriting_mode(rec.get("product_type") or "")
        policy_count = rec.get("policy_count")
        scraped_at = rec.get("scraped_at")
        url = rec.get("url")
        for idx, card in enumerate(cards, start=1):
            monthly = card.get("monthly")
            if monthly is None:
                continue
            cname = (card.get("carrier") or "").strip() or "unknown"
            pname = (card.get("product") or "").strip() or "term"
            slug = carrier_slug(cname)
            rows.append(
                {
                    "harvest_batch_id": batch,
                    "source": "integrity_connect",
                    "underwriting_mode": uw,
                    "state": rec.get("state") or "NE",
                    "age": int(rec["age"]),
                    "sex": rec["sex"],
                    "smoker": tobacco,
                    "term_years": int(rec["term"]),
                    "face_amount": int(rec["face"]),
                    "health_class": health,
                    "health_label": card.get("health_label") or health_label,
                    "carrier_slug": slug,
                    "carrier_name": cname,
                    "product_slug": product_slug(pname),
                    "product_name": pname,
                    "monthly_premium": float(monthly),
                    "nearest_age": card.get("nearest_age") or rec.get("nearest_age"),
                    "rank_in_quote": idx,
                    "is_best": idx == 1,
                    "is_mvi_appointed": slug in MVI_APPOINTED_SLUGS,
                    "marketplace_policy_count": policy_count,
                    "quote_scraped_at": scraped_at,
                    "source_url": url,
                    "source_file": "integrity-term-harvest.json",
                    "source_date": source_date,
                }
            )
    return rows


def write_csv(rows: list[dict], path: Path) -> None:
    header = [
        "carrier",
        "product",
        "state",
        "age",
        "sex",
        "smoker",
        "term_years",
        "face_band_min",
        "face_band_max",
        "health_class",
        "monthly_premium",
        "face_amount",
        "source_file",
        "source_date",
        "integrity_carrier",
        "integrity_product",
        "nearest_age",
        "product_type",
        "underwriting_mode",
        "rank_in_quote",
        "is_best",
        "is_mvi_appointed",
        "marketplace_policy_count",
        "harvest_batch_id",
    ]
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=header)
        w.writeheader()
        for r in rows:
            w.writerow(
                {
                    "carrier": r["carrier_slug"],
                    "product": r["product_slug"],
                    "state": r["state"],
                    "age": r["age"],
                    "sex": r["sex"],
                    "smoker": 1 if r["smoker"] else 0,
                    "term_years": r["term_years"],
                    "face_band_min": r["face_amount"],
                    "face_band_max": r["face_amount"],
                    "health_class": r["health_class"],
                    "monthly_premium": r["monthly_premium"],
                    "face_amount": r["face_amount"],
                    "source_file": r["source_file"],
                    "source_date": r["source_date"],
                    "integrity_carrier": r["carrier_name"].replace(",", ";"),
                    "integrity_product": r["product_name"].replace(",", ";"),
                    "nearest_age": r["nearest_age"] or "",
                    "product_type": r["underwriting_mode"] + "_term",
                    "underwriting_mode": r["underwriting_mode"],
                    "rank_in_quote": r["rank_in_quote"],
                    "is_best": 1 if r["is_best"] else 0,
                    "is_mvi_appointed": 1 if r["is_mvi_appointed"] else 0,
                    "marketplace_policy_count": r["marketplace_policy_count"] or "",
                    "harvest_batch_id": r["harvest_batch_id"],
                }
            )


def upsert_supabase(rows: list[dict]) -> tuple[int, int]:
    from integrations.supabase.config import get_database_url

    try:
        import psycopg
    except ImportError as e:
        raise SystemExit("Install: pip install -r integrations/supabase/requirements.txt") from e

    dsn = get_database_url()
    if not dsn:
        raise SystemExit("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local")

    batch_ids = sorted({r["harvest_batch_id"] for r in rows})
    cols = [
        "harvest_batch_id",
        "source",
        "underwriting_mode",
        "state",
        "age",
        "sex",
        "smoker",
        "term_years",
        "face_amount",
        "health_class",
        "health_label",
        "carrier_slug",
        "carrier_name",
        "product_slug",
        "product_name",
        "monthly_premium",
        "nearest_age",
        "rank_in_quote",
        "is_best",
        "is_mvi_appointed",
        "marketplace_policy_count",
        "quote_scraped_at",
        "source_url",
        "source_file",
        "source_date",
    ]
    placeholders = ", ".join(["%s"] * len(cols))
    col_sql = ", ".join(cols)
    update_sql = ", ".join(
        f"{c} = EXCLUDED.{c}"
        for c in cols
        if c
        not in {
            "harvest_batch_id",
            "state",
            "age",
            "sex",
            "smoker",
            "term_years",
            "face_amount",
            "health_class",
            "underwriting_mode",
            "carrier_slug",
            "product_slug",
            "rank_in_quote",
        }
    )

    sql = f"""
        INSERT INTO term_integrity_premiums ({col_sql})
        VALUES ({placeholders})
        ON CONFLICT (
          harvest_batch_id, state, age, sex, smoker, term_years, face_amount,
          health_class, underwriting_mode, carrier_slug, product_slug, rank_in_quote
        ) DO UPDATE SET {update_sql}
    """

    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            # Replace this batch so removed cards do not linger
            cur.execute(
                "DELETE FROM term_integrity_premiums WHERE harvest_batch_id = ANY(%s)",
                (batch_ids,),
            )
            values = [
                tuple(
                    r[c] if c != "quote_scraped_at" else (r["quote_scraped_at"] or None)
                    for c in cols
                )
                for r in rows
            ]
            cur.executemany(sql, values)
            cur.execute(
                "SELECT COUNT(*) FROM term_integrity_premiums WHERE harvest_batch_id = ANY(%s)",
                (batch_ids,),
            )
            n = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM term_carrier_premiums")
            amam = cur.fetchone()[0]
        conn.commit()
    return n, amam


def summarize(rows: list[dict]) -> None:
    from collections import Counter

    print(f"expanded_rows={len(rows)}")
    print(f"best_rows={sum(1 for r in rows if r['is_best'])}")
    print(f"appointed_rows={sum(1 for r in rows if r['is_mvi_appointed'])}")
    print(f"appointed_best={sum(1 for r in rows if r['is_mvi_appointed'] and r['is_best'])}")
    winners = Counter(
        (r["carrier_slug"], r["product_slug"]) for r in rows if r["is_best"]
    )
    print("top_marketplace_winners:")
    for (c, p), n in winners.most_common(12):
        print(f"  {n:4d}  {c} | {p}")
    non_appt_winners = sum(
        1 for r in rows if r["is_best"] and not r["is_mvi_appointed"]
    )
    print(f"marketplace_best_not_appointed={non_appt_winners}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--csv-only", action="store_true")
    args = ap.parse_args()

    if not HARVEST_JSON.exists():
        print(f"Missing harvest JSON: {HARVEST_JSON}")
        return 1

    data = json.loads(HARVEST_JSON.read_text(encoding="utf-8"))
    rows = expand_rows(data)
    if not rows:
        print("No premium rows found in harvest.")
        return 1

    summarize(rows)
    write_csv(rows, OUT_CSV)
    print(f"wrote_csv={OUT_CSV.relative_to(ROOT)} rows={len(rows)}")

    if args.dry_run or args.csv_only:
        print("skip_db_import")
        return 0

    n, amam = upsert_supabase(rows)
    print(f"term_integrity_premiums_rows={n}")
    print(f"term_carrier_premiums_rows_unchanged={amam}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
