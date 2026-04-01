#!/usr/bin/env python3
"""Smoke test: Supabase grids + same quote math as the API."""

from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_root))

from integrations.google_sheets.quote_engine import compute_carrier_quotes_with_grids  # noqa: E402
from integrations.supabase.quote_data import load_quote_grids_from_supabase  # noqa: E402


def main() -> int:
    try:
        base, mults = load_quote_grids_from_supabase()
    except Exception as e:
        print("Failed to load Supabase grids:", e)
        return 1
    carriers = compute_carrier_quotes_with_grids(60, "male", 15_000, base, mults)
    a = next((c for c in carriers if c.get("carrierKey") == "assurity"), None)
    print("Assurity result:", a)
    if not a or not a.get("qualified"):
        print("Expected qualified=True for seed sample or real import with age 60 / 15k.")
        return 1
    print("OK monthly:", a.get("monthly"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
