#!/usr/bin/env python3
"""
Load Carrier Rate Charts from the leads workbook and compute illustrative monthly
premiums for website quote requests (Assurity Protect+ from sheet; other carriers
when tables exist — placeholders until parsed).
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_root))

from integrations.google_sheets.client import open_sheet
from integrations.google_sheets.export_hero_carousel_quotes import (
    assurity_monthly_for_gender,
    logo_for,
    parse_assurity_protect_plus_base,
    parse_coverage_multiplier_examples,
)


def load_rate_chart_rows(tab_name: str = "Carrier Rate Charts") -> list[list[str]]:
    ws = open_sheet(sheet_name=tab_name)
    return ws.get_all_values()


def compute_carrier_quotes_with_grids(
    age: int,
    gender: str,
    coverage_amount: int,
    base: dict[int, tuple[float, float]],
    mults: dict[int, tuple[float, float]],
) -> list[dict[str, Any]]:
    """
    Same output shape as compute_carrier_quotes, but uses pre-parsed base (age -> male/female $10k mo)
    and mults (face amount -> multiplier male/female). Logic lives in code; data from DB or sheet import.
    """
    if gender not in ("male", "female"):
        gender = "female"

    carriers: list[dict[str, Any]] = []

    assurity_ok = age in base and coverage_amount in mults
    if assurity_ok:
        v = assurity_monthly_for_gender(age, coverage_amount, base, mults, gender)
        if v is not None:
            logo, alt = logo_for("assurity")
            carriers.append(
                {
                    "carrierKey": "assurity",
                    "carrierName": alt,
                    "logo": logo,
                    "qualified": True,
                    "monthly": round(float(v), 2),
                    "coverage": coverage_amount,
                }
            )
        else:
            carriers.append(
                {
                    "carrierKey": "assurity",
                    "carrierName": "Assurity",
                    "qualified": False,
                    "reason": "rate_unavailable",
                }
            )
    else:
        carriers.append(
            {
                "carrierKey": "assurity",
                "carrierName": "Assurity",
                "qualified": False,
                "reason": "age_or_coverage_not_in_table",
            }
        )

    for key, label in (
        ("mutual-of-omaha", "Mutual of Omaha"),
        ("american-amicable", "American Amicable"),
    ):
        logo, alt = logo_for(key) if key == "mutual-of-omaha" else ("", label)
        carriers.append(
            {
                "carrierKey": key,
                "carrierName": label,
                "logo": logo or None,
                "qualified": False,
                "reason": "rates_not_configured_in_tool",
            }
        )

    return carriers


def compute_carrier_quotes(
    age: int,
    gender: str,
    coverage_amount: int,
    rows: list[list[str]],
) -> list[dict[str, Any]]:
    """
    Return one entry per carrier: qualified + monthly when rates exist.
    gender: 'male' | 'female'
    coverage_amount: e.g. 10000, 15000, 20000, 25000
    """
    base = parse_assurity_protect_plus_base(rows)
    mults = parse_coverage_multiplier_examples(rows)
    return compute_carrier_quotes_with_grids(age, gender, coverage_amount, base, mults)


def allowed_coverages_from_mults(mults: dict[int, tuple[float, float]]) -> list[int]:
    return sorted(mults.keys())


def allowed_age_range_from_base(base: dict[int, tuple[float, float]]) -> tuple[int, int]:
    if not base:
        return (45, 85)
    ages = sorted(base.keys())
    return (ages[0], ages[-1])


def allowed_coverages(rows: list[list[str]]) -> list[int]:
    mults = parse_coverage_multiplier_examples(rows)
    return allowed_coverages_from_mults(mults)


def allowed_age_range(rows: list[list[str]]) -> tuple[int, int]:
    base = parse_assurity_protect_plus_base(rows)
    return allowed_age_range_from_base(base)
