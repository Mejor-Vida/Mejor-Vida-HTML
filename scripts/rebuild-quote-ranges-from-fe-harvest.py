#!/usr/bin/env python3
"""Rebuild quoter charts from Integrity FE appointed harvests.

Reads:
  integrations/knowledge/Term_Life_Knowledge/integrity-fe-harvest.json
  integrations/knowledge/Term_Life_Knowledge/integrity-fe-over85.json

Writes:
  js/quote-engine-fe-harvest.json
      Exact appointed Level (low) / Graded or Accendo Standard (high)
      monthly premiums at harvested faces — used by the live FE quoter.
  integrations/supabase/migrations/094_quote_ranges_from_integrity_fe.sql
      $10,000 non-smoker quote_ranges rows for harvested ages, including 86–89.
  js/final-expense-cost-rates.json + js/life-insurance-cost-rates.json
      Educational cost-page charts from the same harvest cells.

Semantics:
  Ages 45–85: cheapest appointed Level / Graded at that face.
  Ages 86–89: Aetna Accendo Preferred (low) / Standard (high); max face $25,000.
  Tobacco 86–89 is not harvested — quoter returns no_data (call).

Usage:
  python3 scripts/rebuild-quote-ranges-from-fe-harvest.py
  python3 scripts/rebuild-quote-ranges-from-fe-harvest.py --apply
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
HARVESTS = [
    ROOT / "integrations/knowledge/Term_Life_Knowledge/integrity-fe-harvest.json",
    ROOT / "integrations/knowledge/Term_Life_Knowledge/integrity-fe-over85.json",
]
OUT_SQL = ROOT / "integrations/supabase/migrations/094_quote_ranges_from_integrity_fe.sql"
ENGINE_JSON = ROOT / "js/quote-engine-fe-harvest.json"
COST_RATES = ROOT / "js/life-insurance-cost-rates.json"
FE_STANDALONE = ROOT / "js/final-expense-cost-rates.json"

ACCENDO_MIN_AGE = 86
ACCENDO_MAX_FACE = 25000
QUOTE_FACE = 10000
CHART_FACES = [5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000]
CHART_AGES_FE = list(range(45, 86, 5)) + [86, 87, 88, 89]


def carrier_slug(card: dict) -> str | None:
    name = (card.get("carrier") or "").lower()
    prod = (card.get("product") or "").lower()
    src = (card.get("logo_src") or "").lower()
    blob = f"{name} {prod} {src}"
    if "americo" in blob or "eagle" in prod:
        return "americo"
    if "transamerica" in blob or "immediate solution" in prod or "express premier" in prod:
        return "transamerica"
    if "omaha" in blob or "living promise" in prod:
        return "moo"
    if "amicable" in blob or "senior choice" in prod:
        return "amam"
    if "assurity" in blob or "protect+" in prod or "perform+" in prod:
        return "assurity"
    if "aetna" in blob or "accendo" in blob:
        return "aetna"
    if "corebridge" in blob or "simplinow" in prod or "american general" in blob:
        return "corebridge"
    return None


def is_level(card: dict) -> bool:
    hl = (card.get("health_label") or "").lower()
    prod = (card.get("product") or "").lower()
    if "graded" in hl or "graded" in prod or "modified" in prod or "guaranteed" in prod:
        return False
    return (
        "level" in hl
        or hl in ("", "preferred")
        or "immediate" in prod
        or "preferred" in prod
        or "select" in prod
    )


def is_graded(card: dict) -> bool:
    hl = (card.get("health_label") or "").lower()
    prod = (card.get("product") or "").lower()
    return "graded" in hl or "graded" in prod or "modified" in prod


def is_accendo_preferred(card: dict) -> bool:
    return carrier_slug(card) == "aetna" and "preferred" in (card.get("product") or "").lower()


def is_accendo_standard(card: dict) -> bool:
    return carrier_slug(card) == "aetna" and "standard" in (card.get("product") or "").lower()


def load_records() -> tuple[list[dict], list[str]]:
    records: list[dict] = []
    sources: list[str] = []
    for path in HARVESTS:
        if not path.exists():
            print(f"missing {path.relative_to(ROOT)}")
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        recs = data.get("records") or []
        records.extend(recs)
        sources.append(path.name)
        print(f"loaded {path.name} records={len(recs)}")
    return records, sources


def cell_from_low_high(low: float, high: float) -> dict:
    if high < low:
        high = low
    return {
        "low": round(low, 2),
        "high": round(high, 2),
        "anchor": round((low + high) / 2, 2),
    }


def build_engine(records: list[dict]) -> dict:
    """(age, sex, face) NT appointed cells."""
    level: dict[tuple[int, str, int], list[float]] = defaultdict(list)
    graded: dict[tuple[int, str, int], list[float]] = defaultdict(list)
    accendo_pref: dict[tuple[int, str, int], list[float]] = defaultdict(list)
    accendo_std: dict[tuple[int, str, int], list[float]] = defaultdict(list)

    for rec in records:
        if rec.get("tobacco"):
            continue
        face = int(rec.get("face") or 0)
        age = int(rec["age"])
        sex = rec["sex"]
        key = (age, sex, face)
        for card in rec.get("all") or rec.get("top") or rec.get("appointed") or []:
            m = card.get("monthly")
            if m is None:
                continue
            monthly = float(m)
            if is_accendo_preferred(card):
                accendo_pref[key].append(monthly)
            elif is_accendo_standard(card):
                accendo_std[key].append(monthly)
            slug = carrier_slug(card)
            if slug is None:
                continue
            if is_graded(card):
                graded[key].append(monthly)
            elif is_level(card):
                level[key].append(monthly)

    cells: dict[str, dict[str, dict[str, dict[str, dict]]]] = {"female": {}, "male": {}}
    keys = set(level) | set(accendo_pref)
    for age, sex, face in sorted(keys):
        key = (age, sex, face)
        if age >= ACCENDO_MIN_AGE:
            prefs = accendo_pref.get(key) or []
            stds = accendo_std.get(key) or []
            if not prefs:
                continue
            if face > ACCENDO_MAX_FACE:
                continue
            low = min(prefs)
            high = min(stds) if stds else round(low * 1.45, 2)
            cell = cell_from_low_high(low, high)
            carrier = "aetna_accendo"
        else:
            lows = level.get(key) or []
            if not lows:
                continue
            low = min(lows)
            highs = graded.get(key) or []
            high = min(highs) if highs else round(low * 1.35, 2)
            cell = cell_from_low_high(low, high)
            carrier = "appointed"
        cell["carrier"] = carrier
        age_bucket = cells.setdefault(sex, {}).setdefault(str(age), {}).setdefault("nt", {})
        age_bucket[str(face)] = cell

    return {
        "as_of": date.today().isoformat(),
        "source": "Integrity Connect Final Expense appointed harvest",
        "tobacco": False,
        "accendo_min_age": ACCENDO_MIN_AGE,
        "accendo_max_age": 89,
        "accendo_max_face": ACCENDO_MAX_FACE,
        "quote_face": QUOTE_FACE,
        "cells": cells,
    }


def ranges_at_10k(engine: dict) -> dict[tuple[int, str], dict]:
    out = {}
    for sex, ages in engine["cells"].items():
        for age_s, tobacco in ages.items():
            cell = (tobacco.get("nt") or {}).get(str(QUOTE_FACE))
            if not cell:
                continue
            out[(int(age_s), sex)] = {
                "low": cell["low"],
                "high": cell["high"],
                "anchor": cell["anchor"],
            }
    return out


def write_sql(ranges: dict[tuple[int, str], dict], path: Path) -> None:
    ages = sorted({a for a, _ in ranges})
    lines = [
        "-- Auto-generated from Integrity FE appointed harvest (incl. Accendo 86–89)",
        f"-- as_of: {date.today().isoformat()}",
        "-- Updates non-smoker quote_ranges for harvested ages; smokers unchanged.",
        "-- Ages 86–89 are Aetna Accendo Preferred (low) / Standard (high) at $10,000.",
        "",
        "DELETE FROM quote_ranges",
        f"WHERE smoker = false AND age IN ({', '.join(str(a) for a in ages)});",
        "",
        "INSERT INTO quote_ranges (age, sex, smoker, low, high, anchor) VALUES",
    ]
    values = []
    for age, sex in sorted(ranges):
        r = ranges[(age, sex)]
        values.append(
            f"  ({age}, '{sex}', false, {r['low']:.2f}, {r['high']:.2f}, {r['anchor']:.2f})"
        )
    lines.append(",\n".join(values) + ";\n")
    path.write_text("\n".join(lines), encoding="utf-8")


def nearest_cell(face_map: dict[str, dict], face: int) -> dict | None:
    if str(face) in face_map:
        return face_map[str(face)]
    faces = sorted(int(k) for k in face_map)
    if not faces:
        return None
    if face <= faces[0]:
        src = face_map[str(faces[0])]
        factor = face / faces[0]
        return cell_from_low_high(src["low"] * factor, src["high"] * factor)
    if face >= faces[-1]:
        src = face_map[str(faces[-1])]
        factor = face / faces[-1]
        return cell_from_low_high(src["low"] * factor, src["high"] * factor)
    lo = faces[0]
    hi = faces[-1]
    for i in range(len(faces) - 1):
        if faces[i] <= face <= faces[i + 1]:
            lo, hi = faces[i], faces[i + 1]
            break
    a = face_map[str(lo)]
    b = face_map[str(hi)]
    t = (face - lo) / (hi - lo)
    return cell_from_low_high(
        a["low"] + (b["low"] - a["low"]) * t,
        a["high"] + (b["high"] - a["high"]) * t,
    )


def write_cost_charts(engine: dict) -> None:
    tables: dict[str, list[dict]] = {}
    for face in CHART_FACES:
        rows = []
        for age in CHART_AGES_FE:
            if age >= ACCENDO_MIN_AGE and face > ACCENDO_MAX_FACE:
                continue
            f_map = engine["cells"].get("female", {}).get(str(age), {}).get("nt") or {}
            m_map = engine["cells"].get("male", {}).get(str(age), {}).get("nt") or {}
            f_cell = nearest_cell(f_map, face) if f_map else None
            m_cell = nearest_cell(m_map, face) if m_map else None
            if not f_cell or not m_cell:
                continue
            rows.append(
                {
                    "age": age,
                    "female": int(round(f_cell["low"])),
                    "male": int(round(m_cell["low"])),
                }
            )
        tables[str(face)] = rows

    fe = {
        "source": "Mejor Vida quote engine — Integrity FE appointed harvest (Accendo 86–89)",
        "rating": "Non-tobacco, good-health (Level/Immediate) low; Accendo Preferred 86–89",
        "as_of": date.today().isoformat(),
        "note": (
            "Illustrative monthly premiums from Integrity Connect appointed harvests used by "
            "the Mejor Vida quoter. Ages 45–85 are the cheapest appointed Level premium; "
            "ages 86–89 are Aetna Accendo Preferred Level (max $25,000). Non-tobacco. "
            "Educational only — not a binding quote."
        ),
        "faces": CHART_FACES,
        "tables": tables,
    }

    if COST_RATES.exists():
        data = json.loads(COST_RATES.read_text(encoding="utf-8"))
    else:
        data = {}
    data["final_expense"] = fe
    COST_RATES.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    FE_STANDALONE.write_text(json.dumps({"final_expense": fe}, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {COST_RATES.relative_to(ROOT)}")
    print(f"wrote {FE_STANDALONE.relative_to(ROOT)}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Apply 094 via psycopg (not other pending migrations)")
    args = ap.parse_args()

    records, sources = load_records()
    if not records:
        print("No FE harvest records found")
        return 1

    engine = build_engine(records)
    engine["source_files"] = sources
    ENGINE_JSON.write_text(json.dumps(engine, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {ENGINE_JSON.relative_to(ROOT)}")

    ranges = ranges_at_10k(engine)
    if not ranges:
        print("No $10,000 cells to seed quote_ranges")
        return 1
    write_sql(ranges, OUT_SQL)
    print(f"wrote {OUT_SQL.relative_to(ROOT)} cells={len(ranges)}")
    for key in sorted(ranges):
        age, sex = key
        r = ranges[key]
        print(f"  {sex} {age}: low={r['low']} high={r['high']} anchor={r['anchor']}")

    write_cost_charts(engine)

    if args.apply:
        from integrations.supabase.config import get_database_url

        try:
            import psycopg
        except ImportError:
            print("Install: pip install -r integrations/supabase/requirements.txt")
            return 1
        dsn = get_database_url()
        if not dsn:
            print("Set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local")
            return 1
        sql = OUT_SQL.read_text(encoding="utf-8")
        with psycopg.connect(dsn) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                cur.execute(
                    "INSERT INTO schema_migrations (filename) VALUES (%s) ON CONFLICT DO NOTHING",
                    (OUT_SQL.name,),
                )
            conn.commit()
        print(f"applied {OUT_SQL.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
