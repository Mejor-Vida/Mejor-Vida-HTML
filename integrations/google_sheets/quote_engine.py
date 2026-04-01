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


def _carrier_logo_and_name(carrier_key: str) -> tuple[str, str]:
    if carrier_key == "assurity":
        return logo_for("assurity")
    if carrier_key in ("mutual-of-omaha", "mutual-of-omaha-level", "mutual-of-omaha-graded"):
        return logo_for("mutual-of-omaha")
    if carrier_key == "american-amicable":
        return "", "American Amicable"
    return "", carrier_key


def _tobacco_yes(tobacco: str) -> bool:
    return str(tobacco or "").strip().lower() in ("yes", "y", "true", "1")


def moo_resolve_product_slug(benefit_plan: str, tobacco: str) -> str:
    """Level + tobacco → NT vs T; Graded ignores tobacco."""
    bp = (benefit_plan or "level").strip().lower()
    if bp == "graded":
        return "living_promise_graded"
    return "living_promise_level_t" if _tobacco_yes(tobacco) else "living_promise_level_nt"


def moo_monthly_bsp(
    face: int,
    age: int,
    gender: str,
    moo_lp_rates: dict[str, dict[tuple[int, str], dict[str, Any]]],
    benefit_plan: str,
    tobacco: str,
) -> tuple[float | None, str | None]:
    """
    annual = (face/1000)*base_rate_per_1k + policy_fee_annual; monthly = annual * modal_factor.
    Returns (monthly, None) or (None, reason_code).
    """
    slug = moo_resolve_product_slug(benefit_plan, tobacco)
    tbl = moo_lp_rates.get(slug) or {}
    row = tbl.get((age, gender))
    if not row:
        return None, "age_or_coverage_not_in_table"
    if face < int(row["min_face"]) or face > int(row["max_face"]):
        return None, "age_or_coverage_not_in_table"
    annual = (face / 1000.0) * float(row["base_rate_per_1k"]) + float(row["policy_fee_annual"])
    monthly = annual * float(row["modal_factor"])
    return round(float(monthly), 2), None


def compute_carrier_quotes_from_grids_by_carrier(
    age: int,
    gender: str,
    coverage_amount: int,
    grids_by_carrier: dict[str, tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]],
    *,
    benefit_plan: str = "level",
    tobacco: str = "no",
    moo_lp_rates: dict[str, dict[tuple[int, str], dict[str, Any]]] | None = None,
    moo_dual_benefits: bool = False,
) -> list[dict[str, Any]]:
    """
    Assurity: multiplier grids. Mutual of Omaha: moo_lp_rates + carrier formula (no multipliers).
    If moo_dual_benefits, emit separate MoO rows for Level and Graded (website quote results).
    """
    if gender not in ("male", "female"):
        gender = "female"

    bp_default = (benefit_plan or "level").strip().lower()
    if bp_default not in ("level", "graded"):
        bp_default = "level"

    carriers: list[dict[str, Any]] = []

    for carrier_key in ("assurity", "mutual-of-omaha"):
        logo, alt = _carrier_logo_and_name(carrier_key)
        if carrier_key == "assurity":
            if "assurity" not in grids_by_carrier:
                carriers.append(
                    {
                        "carrierKey": carrier_key,
                        "carrierName": alt,
                        "logo": logo or None,
                        "qualified": False,
                        "reason": "rates_not_configured_in_tool",
                    }
                )
                continue
            base, mults = grids_by_carrier["assurity"]
            row_ok = age in base and coverage_amount in mults
            if row_ok:
                v = assurity_monthly_for_gender(age, coverage_amount, base, mults, gender)
                if v is not None:
                    carriers.append(
                        {
                            "carrierKey": carrier_key,
                            "carrierName": alt,
                            "logo": logo or None,
                            "qualified": True,
                            "monthly": round(float(v), 2),
                            "coverage": coverage_amount,
                        }
                    )
                else:
                    carriers.append(
                        {
                            "carrierKey": carrier_key,
                            "carrierName": alt,
                            "logo": logo or None,
                            "qualified": False,
                            "reason": "rate_unavailable",
                        }
                    )
            else:
                carriers.append(
                    {
                        "carrierKey": carrier_key,
                        "carrierName": alt,
                        "logo": logo or None,
                        "qualified": False,
                        "reason": "age_or_coverage_not_in_table",
                    }
                )
            continue

        # mutual-of-omaha
        moo = moo_lp_rates or {}
        moo_plans: tuple[tuple[str, str, str], ...]
        if moo_dual_benefits:
            moo_plans = (
                ("mutual-of-omaha-level", "level", "Mutual of Omaha (Level)"),
                ("mutual-of-omaha-graded", "graded", "Mutual of Omaha (Graded benefit)"),
            )
        else:
            bp = bp_default
            alt = "Mutual of Omaha (Graded benefit)" if bp == "graded" else "Mutual of Omaha"
            moo_plans = ((carrier_key, bp, alt),)

        if not moo:
            for ck, bp, alt in moo_plans:
                carriers.append(
                    {
                        "carrierKey": ck,
                        "carrierName": alt,
                        "logo": logo or None,
                        "qualified": False,
                        "reason": "rates_not_configured_in_tool",
                        "benefitPlan": bp,
                        "mooProductSlug": moo_resolve_product_slug(bp, tobacco),
                    }
                )
            continue

        logo_moo, _ = _carrier_logo_and_name("mutual-of-omaha")
        for ck, bp, alt in moo_plans:
            mo, reason = moo_monthly_bsp(coverage_amount, age, gender, moo, bp, tobacco)
            if mo is not None:
                carriers.append(
                    {
                        "carrierKey": ck,
                        "carrierName": alt,
                        "logo": logo_moo or None,
                        "qualified": True,
                        "monthly": mo,
                        "coverage": coverage_amount,
                        "benefitPlan": bp,
                        "mooProductSlug": moo_resolve_product_slug(bp, tobacco),
                    }
                )
            else:
                carriers.append(
                    {
                        "carrierKey": ck,
                        "carrierName": alt,
                        "logo": logo_moo or None,
                        "qualified": False,
                        "reason": reason or "age_or_coverage_not_in_table",
                        "benefitPlan": bp,
                        "mooProductSlug": moo_resolve_product_slug(bp, tobacco),
                    }
                )

    ak, alabel = _carrier_logo_and_name("american-amicable")
    carriers.append(
        {
            "carrierKey": "american-amicable",
            "carrierName": alabel,
            "logo": ak or None,
            "qualified": False,
            "reason": "rates_not_configured_in_tool",
        }
    )

    return carriers


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
    grids = {"assurity": (base, mults)}
    return compute_carrier_quotes_from_grids_by_carrier(
        age, gender, coverage_amount, grids, benefit_plan="level"
    )


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


def allowed_age_range_from_grids_by_carrier(
    grids_by_carrier: dict[str, tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]],
) -> tuple[int, int]:
    """Union of issue-age spans across carriers (website allows submit if any table supports the age)."""
    lows: list[int] = []
    highs: list[int] = []
    for base, _ in grids_by_carrier.values():
        if not base:
            continue
        ages = sorted(base.keys())
        lows.append(ages[0])
        highs.append(ages[-1])
    if not lows:
        return (45, 85)
    return (min(lows), max(highs))


def allowed_age_range_combined(
    grids_by_carrier: dict[str, tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]],
    moo_lp_rates: dict[str, dict[tuple[int, str], dict[str, Any]]] | None,
) -> tuple[int, int]:
    """Assurity grids + MoO LP age keys (union)."""
    lows: list[int] = []
    highs: list[int] = []
    for base, _ in grids_by_carrier.values():
        if not base:
            continue
        ages = sorted(base.keys())
        lows.append(ages[0])
        highs.append(ages[-1])
    if moo_lp_rates:
        for tbl in moo_lp_rates.values():
            for (a, _) in tbl.keys():
                lows.append(int(a))
                highs.append(int(a))
    if not lows:
        return (45, 85)
    return (min(lows), max(highs))


def allowed_coverages_from_grids_by_carrier(
    grids_by_carrier: dict[str, tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]],
) -> list[int]:
    """Union of face amounts that appear in any carrier multiplier table."""
    seen: set[int] = set()
    for _, mults in grids_by_carrier.values():
        seen.update(mults.keys())
    return sorted(seen)


def allowed_coverages_combined(
    grids_by_carrier: dict[str, tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]],
    moo_lp_rates: dict[str, dict[tuple[int, str], dict[str, Any]]] | None,
) -> list[int]:
    """Multiplier faces + common MoO faces when LP data exists."""
    seen: set[int] = set()
    for _, mults in grids_by_carrier.values():
        seen.update(mults.keys())
    if moo_lp_rates:
        for extra in (2000, 5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000):
            seen.add(extra)
    return sorted(seen)


def allowed_coverages(rows: list[list[str]]) -> list[int]:
    mults = parse_coverage_multiplier_examples(rows)
    return allowed_coverages_from_mults(mults)


def allowed_age_range(rows: list[list[str]]) -> tuple[int, int]:
    base = parse_assurity_protect_plus_base(rows)
    return allowed_age_range_from_base(base)
