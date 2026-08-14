#!/usr/bin/env python3
"""Import Integrity children life harvest into child_integrity_premiums.

Reads:
  integrations/knowledge/Term_Life_Knowledge/integrity-children-harvest.json

Writes CSV + Supabase table for a future children's whole life quoter.
Keeps appointed / sellable carriers only (drops marketplace logos).

Usage:
  python3 scripts/import-integrity-children-premiums.py
  python3 scripts/import-integrity-children-premiums.py --csv-only
  python3 scripts/import-integrity-children-premiums.py --dry-run
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

HARVEST = (
    ROOT
    / "integrations/knowledge/Term_Life_Knowledge/integrity-children-harvest.json"
)
OUT_CSV = (
    ROOT
    / "integrations/knowledge/Term_Life_Knowledge/integrity-children-premiums.csv"
)

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
    return (slug.strip("_") or "child_life")[:60]


def harvest_batch_id(harvested_at: str) -> str:
    try:
        return datetime.fromisoformat(harvested_at.replace("Z", "+00:00")).date().isoformat()
    except Exception:
        return date.today().isoformat()


def expand_rows(data: dict) -> list[dict]:
    batch = harvest_batch_id(data.get("harvested_at") or "")
    rows: list[dict] = []
    for rec in data.get("records") or []:
        cards = rec.get("all") or rec.get("appointed") or []
        if not cards and rec.get("best"):
            cards = [rec["best"]]
        health = HEALTH_MAP.get(rec.get("health") or "S", "standard_nt")
        # Prefer Preferred Immediate when multiple appointed cards share a cell
        cards = sorted(
            [c for c in cards if c.get("monthly") is not None],
            key=lambda c: (
                0 if "preferred" in (c.get("product") or "").lower() else 1,
                float(c.get("monthly") or 1e9),
            ),
        )
        kept = []
        for card in cards:
            cname = (card.get("carrier") or "").strip()
            slug = carrier_slug(cname)
            if slug not in MVI_APPOINTED_SLUGS:
                continue
            kept.append((slug, cname, card))
        for idx, (slug, cname, card) in enumerate(kept, start=1):
            pname = (card.get("product") or "").strip() or "children_life"
            rows.append(
                {
                    "harvest_batch_id": batch,
                    "source": "integrity_connect",
                    "underwriting_mode": "simplified_issue",
                    "product_type": "children_life",
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
                    "monthly_premium": float(card["monthly"]),
                    "nearest_age": card.get("nearest_age") or rec.get("nearest_age"),
                    "rank_in_quote": idx,
                    "is_best": idx == 1,
                    "is_mvi_appointed": True,
                    "marketplace_policy_count": rec.get("policy_count"),
                    "quote_scraped_at": rec.get("scraped_at"),
                    "source_url": rec.get("url"),
                    "source_file": "integrity-children-harvest.json",
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
                    "is_mvi_appointed": 1,
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
        raise SystemExit(
            "Install: pip install -r integrations/supabase/requirements.txt"
        ) from e

    dsn = get_database_url()
    if not dsn:
        raise SystemExit(
            "Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local"
        )

    cols = [
        "harvest_batch_id",
        "source",
        "underwriting_mode",
        "product_type",
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
    batch_ids = sorted({r["harvest_batch_id"] for r in rows})

    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS child_integrity_premiums (
                  id bigserial PRIMARY KEY,
                  harvest_batch_id text NOT NULL,
                  source text,
                  underwriting_mode text,
                  product_type text,
                  state text,
                  age int NOT NULL,
                  sex text NOT NULL,
                  smoker boolean NOT NULL DEFAULT false,
                  face_amount int NOT NULL,
                  health_class text,
                  health_label text,
                  carrier_slug text NOT NULL,
                  carrier_name text,
                  product_slug text,
                  product_name text,
                  monthly_premium numeric NOT NULL,
                  nearest_age int,
                  rank_in_quote int,
                  is_best boolean DEFAULT false,
                  is_mvi_appointed boolean DEFAULT true,
                  marketplace_policy_count int,
                  quote_scraped_at timestamptz,
                  source_url text,
                  source_file text,
                  source_date date,
                  created_at timestamptz DEFAULT now()
                );
                CREATE INDEX IF NOT EXISTS child_integrity_premiums_lookup_idx
                  ON child_integrity_premiums (state, age, sex, face_amount, is_best);
                CREATE OR REPLACE VIEW child_integrity_appointed_best_premiums AS
                  SELECT DISTINCT ON (state, age, sex, smoker, face_amount, health_class)
                    *
                  FROM child_integrity_premiums
                  WHERE is_mvi_appointed = true AND monthly_premium IS NOT NULL
                  ORDER BY state, age, sex, smoker, face_amount, health_class,
                           monthly_premium ASC, rank_in_quote ASC NULLS LAST;
                """
            )
            for bid in batch_ids:
                cur.execute(
                    "DELETE FROM child_integrity_premiums WHERE harvest_batch_id = %s",
                    (bid,),
                )
            sql = f"""
                INSERT INTO child_integrity_premiums ({", ".join(cols)})
                VALUES ({", ".join(["%s"] * len(cols))})
            """
            cur.executemany(sql, [tuple(r[c] for c in cols) for r in rows])
        conn.commit()
    return len(rows)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--csv-only", action="store_true")
    args = ap.parse_args()

    if not HARVEST.exists():
        raise SystemExit(f"Missing harvest: {HARVEST}")

    data = json.loads(HARVEST.read_text(encoding="utf-8"))
    rows = expand_rows(data)
    print(f"Appointed child premium rows: {len(rows)}")
    if args.dry_run:
        return

    write_csv(rows, OUT_CSV)
    print(f"Wrote {OUT_CSV}")
    if args.csv_only:
        return
    n = upsert_supabase(rows)
    print(f"Upserted {n} rows into child_integrity_premiums")


if __name__ == "__main__":
    main()
