#!/usr/bin/env python3
"""
Read the HERO CAROUSEL block from tab "Carrier Rate Charts" (leads workbook)
and write js/hero-quotes-data.js for index.html.

Monthly rates are recomputed from the Assurity Whole Life Protect+ table:
male $10k/mo and female $10k/mo by age × coverage multipliers. Each bubble uses
the rate for the row’s Gender (Male / Female in sheet column “Gender”). If
Gender is blank: slides 1 & 3 default Male; 4 & 5 default Female; two rows on the
same slide default to Female then Male (left/first bubble, then right/second).
Other slides use HERO_DEFAULT_GENDER (default female).

Hero coverages use only $10k / $15k / $20k / $25k. After gender is set, each
gender gets distinct tiers (no two males share an amount; no two females share an
amount). Different genders may repeat an amount (e.g. male $10k and female $10k).

When multiple carriers have rate tables, the winning carrier uses the same
gender-specific rate at that coverage.

Optional env:
  HERO_CAROUSEL_DEMO_AGE — age for Protect+ grid (default 60).
  HERO_DEFAULT_GENDER — female or male for single bubbles when Gender cell is empty.
  HERO_KEEP_SHEET_CARRIER=1 — only fill rates for the sheet’s carrier; do not switch logo.

Run from repo root:
  python3 integrations/google_sheets/export_hero_carousel_quotes.py
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

_root = Path(__file__).resolve().parents[2]
_env = _root / ".env.local"
if _env.exists():
    for line in _env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v

sys.path.insert(0, str(_root))
from integrations.google_sheets.client import get_client  # noqa: E402

OUTPUT = _root / "js" / "hero-quotes-data.js"

# Hero bubbles only use these tiers (from the rate table).
STANDARD_HERO_COVERAGES: tuple[int, ...] = (10_000, 15_000, 20_000, 25_000)

POSITIONS_SINGLE = [
    {"bottom": "20%", "left": "2%", "right": "auto"},
    {"bottom": "26%", "right": "0%", "left": "auto"},
    {"bottom": "18%", "left": "5%", "right": "auto"},
    {"bottom": "24%", "right": "3%", "left": "auto"},
    {"bottom": "22%", "left": "4%", "right": "auto"},
]

DUAL_POSITIONS = [
    {"bottom": "26%", "left": "5%", "right": "auto"},
    {"bottom": "20%", "right": "4%", "left": "auto"},
]


def carrier_key(carrier: str) -> str:
    c = (carrier or "").lower()
    if "assurity" in c:
        return "assurity"
    if "mutual" in c or "omaha" in c:
        return "mutual-of-omaha"
    return "assurity"


def logo_for(key: str) -> tuple[str, str]:
    moo = _root / "img" / "carriers" / "mutual-of-omaha-logo.svg"
    ass_png = _root / "img" / "carriers" / "assurity-wordmark.png"
    ass_svg = _root / "img" / "carriers" / "assurity-logo.svg"
    if key == "mutual-of-omaha":
        path = "img/carriers/mutual-of-omaha-logo.svg" if moo.exists() else "img/carriers/mutual-of-omaha.svg"
        return (path, "Mutual of Omaha")
    if ass_png.exists():
        return ("img/carriers/assurity-wordmark.png", "Assurity")
    path = "img/carriers/assurity-logo.svg" if ass_svg.exists() else "img/carriers/assurity.svg"
    return (path, "Assurity")


def find_hero_block(rows: list[list[str]]) -> tuple[int, int]:
    for i, row in enumerate(rows):
        a = (row[0] if row else "").strip()
        if "HERO CAROUSEL" in a.upper():
            for j in range(i + 1, min(i + 5, len(rows))):
                r = rows[j]
                if r and str(r[0]).strip().lower() == "slide":
                    return j, j + 1
            raise RuntimeError("HERO CAROUSEL found but no header row with 'Slide'.")
    raise RuntimeError('No "HERO CAROUSEL" title row in Carrier Rate Charts.')


def hero_column_map(header_row: list[str]) -> dict[str, int]:
    """Slide / Carrier / Coverage / MonthlyRate / optional Gender."""
    m: dict[str, int] = {}
    for i, c in enumerate(header_row):
        k = str(c).strip().lower()
        if k == "slide":
            m["slide"] = i
        elif "carrier" in k:
            m["carrier"] = i
        elif "coverage" in k:
            m["coverage"] = i
        elif "gender" in k:
            m["gender"] = i
        elif "monthly" in k or k == "rate" or ("rate" in k and "carrier" not in k):
            m["rate"] = i
    if "slide" not in m:
        m["slide"] = 0
    return m


def normalize_gender_cell(cell: str) -> str | None:
    s = (cell or "").strip().lower()
    if not s:
        return None
    if s in ("m", "male", "man", "masculino", "hombre"):
        return "male"
    if s in ("f", "female", "woman", "femenino", "mujer"):
        return "female"
    if s.startswith("m") and "fem" not in s:
        return "male"
    return None


def assign_default_genders(entries: list[dict]) -> None:
    def_g = os.environ.get("HERO_DEFAULT_GENDER", "female").strip().lower()
    if def_g not in ("male", "female"):
        def_g = "female"
    by_slide: dict[int, list[int]] = {}
    for i, e in enumerate(entries):
        by_slide.setdefault(e["slide"], []).append(i)
    for slide, idxs in by_slide.items():
        if len(idxs) >= 2:
            for rank, ii in enumerate(idxs):
                if entries[ii].get("gender"):
                    continue
                # Left / first bubble = female, right / second = male
                entries[ii]["gender"] = "female" if rank == 0 else "male"
            continue
        ii = idxs[0]
        if entries[ii].get("gender"):
            continue
        if slide in (1, 3):
            entries[ii]["gender"] = "male"
        elif slide in (4, 5):
            entries[ii]["gender"] = "female"
        else:
            entries[ii]["gender"] = def_g


def reorder_couple_slide_female_first(entries: list[dict]) -> None:
    """In-place: for each slide with two rows, put female before male (sheet order)."""
    by_slide: dict[int, list[int]] = {}
    for i, e in enumerate(entries):
        by_slide.setdefault(e["slide"], []).append(i)
    for slide, idxs in by_slide.items():
        if len(idxs) != 2:
            continue
        i0, i1 = idxs[0], idxs[1]
        a, b = entries[i0], entries[i1]
        ga, gb = a.get("gender"), b.get("gender")
        if ga == "female" and gb == "male":
            continue
        if ga == "male" and gb == "female":
            entries[i0], entries[i1] = b, a


def ensure_unique_coverage_per_gender(entries: list[dict]) -> None:
    """
    Each gender uses distinct amounts from STANDARD_HERO_COVERAGES only.
    Walks entries in order; keeps a tier if unused for that gender, else assigns
    the next free tier.
    """
    used: dict[str, set[int]] = {"male": set(), "female": set()}
    for e in entries:
        g = e.get("gender") if e.get("gender") in ("male", "female") else "female"
        u = used[g]
        cov = normalize_coverage_amount(e.get("coverage") or "")
        if cov in STANDARD_HERO_COVERAGES and cov not in u:
            u.add(cov)
            e["coverage"] = _format_coverage_label(cov)
            continue
        assigned = None
        for tier in STANDARD_HERO_COVERAGES:
            if tier not in u:
                assigned = tier
                break
        if assigned is None:
            raise RuntimeError(
                f"More than {len(STANDARD_HERO_COVERAGES)} {g} hero bubbles; add tiers or reduce rows."
            )
        e["coverage"] = _format_coverage_label(assigned)
        u.add(assigned)


def sync_hero_entries_to_sheet(ws, data_i: int, cols: dict[str, int], entries: list[dict]) -> None:
    """Write Coverage, Gender, and clear MonthlyRate so the sheet matches exported JSON."""
    ci = cols.get("coverage", 2)
    ri = cols.get("rate", 3)
    gi = cols.get("gender")
    for k, e in enumerate(entries):
        r = data_i + 1 + k
        ws.update_cell(r, ci + 1, e.get("coverage") or "")
        ws.update_cell(r, ri + 1, "")
        if gi is not None:
            label = "Male" if e.get("gender") == "male" else "Female"
            ws.update_cell(r, gi + 1, label)


def ensure_hero_gender_column(ws, rows: list[list[str]], header_i: int) -> None:
    """Add optional Gender column (E) so rows can drive male vs female pricing."""
    row = rows[header_i]
    if any(str(c).strip().lower() == "gender" for c in row):
        return
    ws.update_cell(header_i + 1, 5, "Gender")


def _parse_rate_cell(rate_raw: str) -> str:
    rate_clean = (rate_raw or "").replace("$", "").strip()
    if rate_clean and not re.match(r"^\d+(\.\d+)?$", rate_clean):
        m = re.search(r"(\d+\.?\d*)", rate_clean)
        rate_clean = m.group(1) if m else ""
    return rate_clean


def _to_float(val: str) -> float | None:
    s = (val or "").strip().replace("$", "").replace(",", "")
    if not s:
        return None
    try:
        return float(s)
    except ValueError:
        m = re.search(r"(\d+\.?\d*)", s)
        return float(m.group(1)) if m else None


def normalize_coverage_amount(coverage: str) -> int | None:
    """$10,000 / $15k / 10000 -> 10000."""
    s = (coverage or "").strip()
    m = re.search(r"\$?\s*([\d,]+)\s*(k)?", s, re.I)
    if not m:
        return None
    n = int(m.group(1).replace(",", ""))
    if m.group(2) and m.group(2).lower() == "k":
        n *= 1000
    return n


def _format_coverage_label(amount: int) -> str:
    return f"${amount:,}"


def parse_assurity_protect_plus_base(rows: list[list[str]]) -> dict[int, tuple[float, float]]:
    """Age -> (male $10k/mo, female $10k/mo) from first Assurity Whole Life Protect+ block."""
    out: dict[int, tuple[float, float]] = {}
    in_block = False
    header_seen = False
    for row in rows:
        c0 = (row[0] if row else "").strip()
        head = " ".join(str(x) for x in (row[:4] if row else [])).upper()
        if c0.upper().startswith("ASSURITY") and "PROTECT+" in head:
            if out:
                break
            in_block = True
            header_seen = False
            continue
        if not in_block:
            continue
        if c0.upper().startswith("ASSURITY") and "PROTECT+" not in head:
            break
        cells_lc = [str(x).lower() for x in (row[:8] if row else [])]
        joined = " ".join(cells_lc)
        if c0.lower() == "age" and re.search(r"male.*10", joined) and re.search(r"female.*10", joined):
            header_seen = True
            continue
        if not header_seen:
            continue
        if not c0.isdigit():
            if out and not c0:
                break
            continue
        age = int(c0)
        m = _to_float(row[1] if len(row) > 1 else "")
        f = _to_float(row[2] if len(row) > 2 else "")
        if m is not None and f is not None:
            out[age] = (m, f)
    return out


def parse_coverage_multiplier_examples(rows: list[list[str]]) -> dict[int, tuple[float, float]]:
    """
    coverage_amount -> (mult_male, mult_female) derived from example monthly rates
    at age 55 Protect+ (sheet cols: example male / example female vs $10k base row).
    """
    header_row = -1
    for i, row in enumerate(rows):
        a = (row[0] if row else "").strip().lower()
        b = (row[1] if len(row) > 1 else "").strip().lower()
        if "coverage amount" in a and "multiplier" in b:
            header_row = i
            break
    if header_row < 0:
        return {10000: (1.0, 1.0)}

    base_m = base_f = None
    mults: dict[int, tuple[float, float]] = {}

    for row in rows[header_row + 1 :]:
        cov_cell = (row[0] if row else "").strip()
        if not cov_cell.startswith("$") and not re.match(r"^\$?\s*[\d,]+", cov_cell):
            if mults:
                break
            continue
        cov = normalize_coverage_amount(cov_cell)
        if cov is None:
            continue
        ex_m = _to_float(row[2] if len(row) > 2 else "")
        ex_f = _to_float(row[3] if len(row) > 3 else "")
        if cov == 10000 and ex_m and ex_f:
            base_m, base_f = ex_m, ex_f
        if base_m and base_f and ex_m and ex_f:
            mults[cov] = (ex_m / base_m, ex_f / base_f)

    if not mults:
        return {10000: (1.0, 1.0)}
    if 10000 not in mults and base_m and base_f:
        mults[10000] = (1.0, 1.0)
    return mults


def assurity_monthly_for_gender(
    age: int,
    coverage_amount: int,
    base_by_age: dict[int, tuple[float, float]],
    mults: dict[int, tuple[float, float]],
    gender: str,
) -> float | None:
    if coverage_amount not in mults:
        return None
    br = base_by_age.get(age)
    if not br:
        return None
    male_10k, female_10k = br
    mm, mf = mults[coverage_amount]
    if gender == "male":
        return male_10k * mm
    return female_10k * mf


def build_rate_lookup(
    rows: list[list[str]], demo_age: int
) -> tuple[dict[str, dict[str, dict[int, float]]], dict[int, tuple[float, float]]]:
    """
    carrier_key -> gender ('male'|'female') -> coverage_amount -> monthly.
    """
    base = parse_assurity_protect_plus_base(rows)
    mults = parse_coverage_multiplier_examples(rows)
    assurity: dict[str, dict[int, float]] = {"male": {}, "female": {}}
    for cov in sorted(mults.keys()):
        for g in ("male", "female"):
            r = assurity_monthly_for_gender(demo_age, cov, base, mults, g)
            if r is not None:
                assurity[g][cov] = round(r, 2)
    return {"assurity": assurity}, mults


def _winner_for_coverage_gender(
    coverage_amount: int | None, gender: str, rates: dict[str, dict[str, dict[int, float]]]
) -> tuple[str, float] | None:
    if coverage_amount is None or gender not in ("male", "female"):
        return None
    best: tuple[str, float] | None = None
    for ck, gmap in rates.items():
        mp = gmap.get(gender) or {}
        val = mp.get(coverage_amount)
        if val is None:
            continue
        if best is None or val < best[1]:
            best = (ck, val)
    return best


def _apply_rates_to_entry(entry: dict, rates: dict[str, dict[str, dict[int, float]]]) -> None:
    cov_amt = normalize_coverage_amount(entry.get("coverage") or "")
    gender = entry.get("gender") or "female"
    if gender not in ("male", "female"):
        gender = "female"
    if cov_amt is None:
        return

    keep = os.environ.get("HERO_KEEP_SHEET_CARRIER", "").strip().lower() in ("1", "true", "yes")
    if keep:
        ck = entry["carrierKey"]
        mp = (rates.get(ck) or {}).get(gender) or {}
        if cov_amt in mp:
            entry["rate"] = _format_rate_out(mp[cov_amt])
        return

    win = _winner_for_coverage_gender(cov_amt, gender, rates)
    if win is None:
        return
    ck, val = win
    entry["carrierKey"] = ck
    logo, alt = logo_for(ck)
    entry["logo"] = logo
    entry["logoAlt"] = alt
    entry["rate"] = _format_rate_out(val)


def _format_rate_out(val: float) -> str:
    return f"{round(val, 2):.2f}"


def _row_to_entry(row: list[str], cols: dict[str, int]) -> dict | None:
    si = cols.get("slide", 0)
    carrier_i = cols.get("carrier", 1)
    cov_i = cols.get("coverage", 2)
    rate_i = cols.get("rate", 3)
    g_i = cols.get("gender")
    if not row or si >= len(row) or not str(row[si]).strip():
        return None
    slide = str(row[si]).strip()
    if not slide.isdigit():
        return None
    carrier = str(row[carrier_i]).strip() if len(row) > carrier_i else ""
    coverage = str(row[cov_i]).strip() if len(row) > cov_i else ""
    rate_raw = str(row[rate_i]).strip() if len(row) > rate_i else ""
    gcell = str(row[g_i]).strip() if g_i is not None and len(row) > g_i else ""
    g_norm = normalize_gender_cell(gcell)
    key = carrier_key(carrier)
    logo, alt = logo_for(key)
    out: dict = {
        "slide": int(slide),
        "carrierKey": key,
        "logo": logo,
        "logoAlt": alt,
        "coverage": coverage,
        "rate": _parse_rate_cell(rate_raw),
    }
    if g_norm:
        out["gender"] = g_norm
    return out


def parse_quotes(
    rows: list[list[str]], rates: dict[str, dict[str, dict[int, float]]], header_i: int, data_i: int
) -> tuple[list[dict], list[dict]]:
    cols = hero_column_map(rows[header_i])
    raw_entries: list[dict] = []
    for row in rows[data_i:]:
        entry = _row_to_entry(row, cols)
        if entry is None:
            break
        raw_entries.append(entry)

    assign_default_genders(raw_entries)
    reorder_couple_slide_female_first(raw_entries)
    ensure_unique_coverage_per_gender(raw_entries)
    for entry in raw_entries:
        _apply_rates_to_entry(entry, rates)

    slide_order: list[int] = []
    for e in raw_entries:
        s = e["slide"]
        if s not in slide_order:
            slide_order.append(s)

    out: list[dict] = []
    for out_idx, s in enumerate(slide_order):
        group = [e for e in raw_entries if e["slide"] == s]
        if len(group) >= 2:
            bubbles = []
            for j, g in enumerate(group[:2]):
                d = {k: v for k, v in g.items() if k != "slide"}
                d["position"] = DUAL_POSITIONS[j] if j < len(DUAL_POSITIONS) else DUAL_POSITIONS[-1]
                bubbles.append(d)
            out.append({"bubbles": bubbles})
        else:
            g = group[0]
            d = {k: v for k, v in g.items() if k != "slide"}
            pos = POSITIONS_SINGLE[out_idx] if out_idx < len(POSITIONS_SINGLE) else POSITIONS_SINGLE[-1]
            d["position"] = pos
            out.append(d)
    return out, raw_entries


def main() -> int:
    sid = os.environ.get("GOOGLE_SHEETS_SPREADSHEET_ID")
    if not sid:
        print("Set GOOGLE_SHEETS_SPREADSHEET_ID", file=sys.stderr)
        return 1
    demo_age = int(os.environ.get("HERO_CAROUSEL_DEMO_AGE", "60"))

    gc = get_client()
    ws = gc.open_by_key(sid).worksheet("Carrier Rate Charts")
    rows = ws.get_all_values()
    header_i, data_i = find_hero_block(rows)
    ensure_hero_gender_column(ws, rows, header_i)
    rows = ws.get_all_values()
    header_i, data_i = find_hero_block(rows)
    cols = hero_column_map(rows[header_i])
    rates, _mults = build_rate_lookup(rows, demo_age)

    quotes, hero_entries = parse_quotes(rows, rates, header_i, data_i)
    sync_hero_entries_to_sheet(ws, data_i, cols, hero_entries)
    if len(quotes) < 1:
        print("No hero quote rows parsed.", file=sys.stderr)
        return 1

    js_lines = [
        "/** Auto-generated by integrations/google_sheets/export_hero_carousel_quotes.py — do not edit by hand. */",
        "window.HERO_CAROUSEL_QUOTES = " + json.dumps(quotes, indent=2) + ";",
        "",
    ]
    OUTPUT.write_text("\n".join(js_lines), encoding="utf-8")
    print(f"Wrote {OUTPUT} ({len(quotes)} carousel slides, HERO_CAROUSEL_DEMO_AGE={demo_age})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
