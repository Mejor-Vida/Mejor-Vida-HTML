#!/usr/bin/env python3
"""Import Integrity Connect Final Expense harvest into fe_integrity_premiums.

Reads:
  integrations/knowledge/Term_Life_Knowledge/integrity-fe-harvest.json

Writes:
  integrations/knowledge/Term_Life_Knowledge/integrity-fe-premiums.csv
  Supabase fe_integrity_premiums

Usage:
  python3 scripts/import-integrity-fe-premiums.py
  python3 scripts/import-integrity-fe-premiums.py --csv-only
  python3 scripts/import-integrity-fe-premiums.py --dry-run
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

CANDIDATES = [
    ROOT / "integrations/knowledge/Term_Life_Knowledge/integrity-fe-harvest.json",
    ROOT / "integrations/knowledge/Final_Expense_Knowledge/integrity-fe-harvest.json",
]
OUT_CSV = ROOT / "integrations/knowledge/Term_Life_Knowledge/integrity-fe-premiums.csv"

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

HEALTH_MAP = {
    "PP": "preferred_plus_nt",
    "P": "preferred_nt",
    "SP": "standard_plus_nt",
    "S": "standard_nt",
    "SUB": "substandard_nt",
}


def carrier_slug(carrier: str) -> str:
    c = (carrier or "").lower()
    if "transamerica" in c:
        return "transamerica"
    if "corebridge" in c or "american general" in c:
        return "corebridge"
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
    return (slug.strip("_") or "fe")[:60]


def harvest_batch_id(harvested_at: str) -> str:
    try:
        return datetime.fromisoformat(harvested_at.replace("Z", "+00:00")).date().isoformat()
    except Exception:
        return date.today().isoformat()


def expand_rows(data: dict) -> list[dict]:
    batch = harvest_batch_id(data.get("harvested_at") or "")
    rows: list[dict] = []
    for rec in data.get("records") or []:
        cards = rec.get("all") or rec.get("appointed") or rec.get("top") or []
        if not cards and rec.get("best"):
            cards = [rec["best"]]
        health = HEALTH_MAP.get(rec.get("health") or "S", "standard_nt")
        for idx, card in enumerate(cards, start=1):
            monthly = card.get("monthly")
            if monthly is None:
                continue
            cname = (card.get("carrier") or "").strip() or "unknown"
            pname = (card.get("product") or "").strip() or "final_expense"
            slug = carrier_slug(cname)
            rows.append(
                {
                    "harvest_batch_id": batch,
                    "source": "integrity_connect",
                    "state": rec.get("state") or "NE",
                    "age": int(rec["age"]),
                    "sex": rec["sex"],
                    "smoker": bool(rec.get("tobacco")),
                    "face_amount": int(rec["face"]),
                    "health_class": health,
                    "health_label": card.get("health_label") or rec.get("health_label") or "",
                    "carrier_slug": slug,
                    "carrier_name": cname,
                    "product_slug": product_slug(pname),
                    "product_name": pname,
                    "monthly_premium": float(monthly),
                    "nearest_age": card.get("nearest_age") or rec.get("nearest_age"),
                    "rank_in_quote": idx,
                    "is_best": idx == 1,
                    "is_mvi_appointed": slug in MVI_APPOINTED_SLUGS,
                    "marketplace_policy_count": rec.get("policy_count"),
                    "quote_scraped_at": rec.get("scraped_at"),
                    "source_url": rec.get("url"),
                    "source_file": "integrity-fe-harvest.json",
                    "source_date": batch,
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
        "face_amount",
        "health_class",
        "monthly_premium",
        "rank_in_quote",
        "is_best",
        "is_mvi_appointed",
        "integrity_carrier",
        "integrity_product",
        "harvest_batch_id",
        "source_date",
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
                    "face_amount": r["face_amount"],
                    "health_class": r["health_class"],
                    "monthly_premium": r["monthly_premium"],
                    "rank_in_quote": r["rank_in_quote"],
                    "is_best": 1 if r["is_best"] else 0,
                    "is_mvi_appointed": 1 if r["is_mvi_appointed"] else 0,
                    "integrity_carrier": r["carrier_name"].replace(",", ";"),
                    "integrity_product": r["product_name"].replace(",", ";"),
                    "harvest_batch_id": r["harvest_batch_id"],
                    "source_date": r["source_date"],
                }
            )


def upsert_supabase(rows: list[dict]) -> int:
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
        "state",
        "age",
        "sex",
        "smoker",
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
            "face_amount",
            "health_class",
            "carrier_slug",
            "product_slug",
            "rank_in_quote",
        }
    )
    sql = f"""
        INSERT INTO fe_integrity_premiums ({col_sql})
        VALUES ({placeholders})
        ON CONFLICT (
          harvest_batch_id, state, age, sex, smoker, face_amount,
          health_class, carrier_slug, product_slug, rank_in_quote
        ) DO UPDATE SET {update_sql}
    """
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM fe_integrity_premiums WHERE harvest_batch_id = ANY(%s)",
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
                "SELECT COUNT(*) FROM fe_integrity_premiums WHERE harvest_batch_id = ANY(%s)",
                (batch_ids,),
            )
            n = cur.fetchone()[0]
        conn.commit()
    return n


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--csv-only", action="store_true")
    args = ap.parse_args()

    src = next((p for p in CANDIDATES if p.exists()), None)
    if not src:
        print("Missing FE harvest JSON. Run: npm run term:harvest-integrity-fe")
        return 1

    data = json.loads(src.read_text(encoding="utf-8"))
    rows = expand_rows(data)
    if not rows:
        print("No FE premium rows found.")
        return 1

    appointed = sum(1 for r in rows if r["is_mvi_appointed"])
    print(f"source={src.relative_to(ROOT)}")
    print(f"expanded_rows={len(rows)} appointed_rows={appointed}")
    write_csv(rows, OUT_CSV)
    print(f"wrote_csv={OUT_CSV.relative_to(ROOT)}")

    if args.dry_run or args.csv_only:
        print("skip_db_import")
        return 0

    n = upsert_supabase(rows)
    print(f"fe_integrity_premiums_rows={n}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
