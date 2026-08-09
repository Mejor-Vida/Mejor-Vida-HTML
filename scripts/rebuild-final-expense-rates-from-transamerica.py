#!/usr/bin/env python3
"""Rebuild final_expense rates in js/life-insurance-cost-rates.json from Transamerica portfolio CSV.

Source: integrations/knowledge/Transamerica_Knowledge/fe_portfolio_rates.csv
Product: Immediate / Preferred / Nontobacco
Formula (agent guide): (rate_per_1000 × units + $42) × 0.086 → round nearest dollar
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV = ROOT / "integrations/knowledge/Transamerica_Knowledge/fe_portfolio_rates.csv"
OUT = ROOT / "js/life-insurance-cost-rates.json"
STANDALONE = ROOT / "js/final-expense-cost-rates.json"

FEE = 42.0
MODAL = 0.086
FACES = [5000, 10000, 25000, 50000]
CHART_AGES = list(range(40, 86, 5))


def monthly(rate_per_1000: float, face: int) -> int:
    return int(round((rate_per_1000 * (face / 1000.0) + FEE) * MODAL))


def main() -> None:
    rows = list(csv.DictReader(CSV.open(encoding="utf-8")))
    by_age_sex: dict[tuple[int, str], float] = {}
    for r in rows:
        if r["product"] != "Immediate":
            continue
        if r["risk_class"] != "Preferred":
            continue
        if r["tobacco"] != "Nontobacco":
            continue
        age = int(r["age"])
        sex = r["sex"].lower()
        by_age_sex[(age, sex)] = float(r["rate_per_1000"])

    tables: dict[str, list[dict]] = {}
    for face in FACES:
        tables[str(face)] = []
        for age in CHART_AGES:
            rf = by_age_sex.get((age, "female"))
            rm = by_age_sex.get((age, "male"))
            if rf is None or rm is None:
                raise SystemExit(f"Missing Transamerica Immediate Preferred Nontobacco rate for age {age}")
            tables[str(face)].append(
                {"age": age, "female": monthly(rf, face), "male": monthly(rm, face)}
            )

    fe = {
        "source": "Transamerica Final Expense Portfolio — Immediate (Preferred Nontobacco)",
        "rating": "Preferred nontobacco (illustrative)",
        "as_of": "2026-08-08",
        "note": (
            "Illustrative monthly EFT premiums from Transamerica Final Expense Portfolio "
            "Agent Guide rates (Immediate / Preferred Nontobacco): "
            "(rate per $1,000 × units + $42 policy fee) × 0.086. Rounded to nearest dollar. "
            "Educational only—not a binding quote. Actual Mejor Vida offers vary by carrier, "
            "health, tobacco, state, and underwriting."
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
