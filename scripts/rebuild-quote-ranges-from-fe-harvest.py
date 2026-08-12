#!/usr/bin/env python3
"""Rebuild quote_ranges (ages 45–85) from Integrity FE appointed harvest.

Semantics (unchanged for the site quoter):
  low  = cheapest appointed Level / good-health monthly at $10,000 face
  high = cheapest appointed Graded / modified monthly at $10,000 face (fallback: low*1.35)
  anchor = midpoint

Appointed products considered (Integrity FE logos / names):
  Living Promise Level (MOO), Senior Choice Immediate (AmAm), Eagle Select* (Americo),
  Immediate Solution / Express Premier (Transamerica), Accendo/Aetna Preferred,
  SimpliNow Level (Corebridge), Assurity Protect+/Perform+ when logo maps.

Usage:
  python3 scripts/rebuild-quote-ranges-from-fe-harvest.py
  python3 scripts/rebuild-quote-ranges-from-fe-harvest.py --apply
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HARVEST = ROOT / "integrations/knowledge/Term_Life_Knowledge/integrity-fe-harvest.json"
OUT_SQL = ROOT / "integrations/supabase/migrations/092_reseed_quote_ranges_from_integrity_fe.sql"


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
    return "level" in hl or hl in ("", "preferred") or "immediate" in prod or "preferred" in prod or "select" in prod


def is_graded(card: dict) -> bool:
    hl = (card.get("health_label") or "").lower()
    prod = (card.get("product") or "").lower()
    return "graded" in hl or "graded" in prod or "modified" in prod


def scale_to_10k(monthly: float, face: int) -> float | None:
    if not face or face <= 0 or monthly is None:
        return None
    return round(monthly * (10000 / face), 2)


def build_ranges(records: list[dict]) -> dict[tuple[int, str], dict]:
    # (age, sex) -> {low, high}
    level: dict[tuple[int, str], list[float]] = defaultdict(list)
    graded: dict[tuple[int, str], list[float]] = defaultdict(list)
    for rec in records:
        if rec.get("tobacco"):
            continue
        face = int(rec.get("face") or 0)
        age = int(rec["age"])
        sex = rec["sex"]
        key = (age, sex)
        for card in rec.get("all") or []:
            if carrier_slug(card) is None:
                continue
            m = card.get("monthly")
            if m is None:
                continue
            m10 = scale_to_10k(float(m), int(card.get("face_amount") or face or 0))
            if m10 is None:
                continue
            if is_graded(card):
                graded[key].append(m10)
            elif is_level(card):
                level[key].append(m10)
    out = {}
    for key, lows in level.items():
        low = min(lows)
        highs = graded.get(key) or []
        high = min(highs) if highs else round(low * 1.35, 2)
        if high < low:
            high = low
        out[key] = {
            "low": low,
            "high": high,
            "anchor": round((low + high) / 2, 2),
        }
    return out


def write_sql(ranges: dict[tuple[int, str], dict], path: Path) -> None:
    # Keep existing smoker rows; replace NT rows for harvested ages only via DELETE+INSERT
    ages = sorted({a for a, _ in ranges})
    lines = [
        "-- Auto-generated from Integrity FE appointed harvest",
        f"-- as_of: {date.today().isoformat()}",
        "-- Updates non-smoker quote_ranges for harvested ages; smokers unchanged.",
        "",
        "DELETE FROM quote_ranges",
        f"WHERE smoker = false AND age IN ({', '.join(str(a) for a in ages)});",
        "",
        "INSERT INTO quote_ranges (age, sex, smoker, low, high, anchor) VALUES",
    ]
    values = []
    for (age, sex) in sorted(ranges):
        r = ranges[(age, sex)]
        values.append(
            f"  ({age}, '{sex}', false, {r['low']:.2f}, {r['high']:.2f}, {r['anchor']:.2f})"
        )
    lines.append(",\n".join(values) + ";\n")
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="Apply migration via apply_migrations.py")
    args = ap.parse_args()

    if not HARVEST.exists():
        print(f"Missing {HARVEST}")
        return 1
    data = json.loads(HARVEST.read_text(encoding="utf-8"))
    ranges = build_ranges(data.get("records") or [])
    if not ranges:
        print("No appointed FE level premiums found")
        return 1
    write_sql(ranges, OUT_SQL)
    print(f"wrote {OUT_SQL.relative_to(ROOT)} cells={len(ranges)}")
    for key in sorted(ranges)[:6]:
        age, sex = key
        r = ranges[key]
        print(f"  {sex} {age}: low={r['low']} high={r['high']} anchor={r['anchor']}")
    print("  ...")

    if args.apply:
        import subprocess

        rc = subprocess.call(
            [sys.executable, str(ROOT / "integrations/supabase/apply_migrations.py")],
            cwd=str(ROOT),
        )
        if rc != 0:
            return rc
        # Refresh educational FE cost JSON from new migration + legacy 014 smokers/ages
        rebuild = ROOT / "scripts/rebuild-final-expense-rates-from-quote-ranges.py"
        if rebuild.exists():
            # Prefer rebuilding from live DB later; for now regenerate from 014+092 by
            # parsing both SQL files is complex — call existing script which reads 014.
            print("NOTE: run scripts/rebuild-final-expense-rates-from-quote-ranges.py after updating 014 or extend it to read 092.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
