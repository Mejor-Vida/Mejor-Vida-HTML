#!/usr/bin/env python3
"""Rebuild final_expense rates from the website quoter’s quote_ranges seed.

Source: integrations/supabase/migrations/014_quote_ranges.sql
Carriers: Mutual of Omaha Living Promise + American Amicable (good-health low)
Base face: $10,000 — scaled proportionally for other faces.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SQL = ROOT / "integrations/supabase/migrations/014_quote_ranges.sql"
OUT = ROOT / "js/life-insurance-cost-rates.json"
STANDALONE = ROOT / "js/final-expense-cost-rates.json"

FACES = [5000, 10000, 25000, 50000]
CHART_AGES = list(range(45, 86, 5))


def load_lows() -> dict[tuple[int, str], float]:
    text = SQL.read_text(encoding="utf-8")
    lows: dict[tuple[int, str], float] = {}
    for m in re.finditer(
        r"\((\d+),\s*'(male|female)',\s*(true|false),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)\)",
        text,
    ):
        age, sex, smoker, low, _high, _anchor = m.groups()
        if smoker == "true":
            continue
        lows[(int(age), sex)] = float(low)
    return lows


def main() -> None:
    lows = load_lows()
    tables: dict[str, list[dict]] = {}
    for face in FACES:
        factor = face / 10000.0
        tables[str(face)] = []
        for age in CHART_AGES:
            f = lows.get((age, "female"))
            m = lows.get((age, "male"))
            if f is None or m is None:
                raise SystemExit(f"Missing quote_ranges non-smoker low for age {age}")
            tables[str(face)].append(
                {
                    "age": age,
                    "female": int(round(f * factor)),
                    "male": int(round(m * factor)),
                }
            )

    fe = {
        "source": "Mejor Vida quote engine (quote_ranges) — MOO Living Promise + American Amicable, good-health low",
        "rating": "Non-tobacco, good-health (Level/Immediate) low",
        "as_of": "2026-08-08",
        "note": (
            "Illustrative monthly premiums from Mejor Vida’s quote_ranges table "
            "(Mutual of Omaha Living Promise + American Amicable). Values are the "
            "good-health (Level/Immediate) low for $10,000 face, scaled proportionally "
            "for other amounts, rounded to the nearest dollar. Ages 45–85. Educational "
            "only—not a binding quote. Actual offers vary by carrier, health, tobacco, "
            "state, and underwriting."
        ),
        "faces": FACES,
        "tables": tables,
    }

    data = json.loads(OUT.read_text(encoding="utf-8"))
    data["final_expense"] = fe
    OUT.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    STANDALONE.write_text(json.dumps({"final_expense": fe}, indent=2) + "\n", encoding="utf-8")
    print(f"Updated {OUT} and {STANDALONE}")


if __name__ == "__main__":
    main()
