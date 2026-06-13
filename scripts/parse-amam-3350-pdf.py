#!/usr/bin/env python3
"""
Parse American Amicable Form 3350 (Easy Term Monthly Quick Quotes) into
integrations/knowledge/Term_Life_Knowledge/term_carrier_premiums.csv rows.

Usage:
  python3 scripts/parse-amam-3350-pdf.py
  python3 scripts/parse-amam-3350-pdf.py path/to/3350.pdf
"""
from __future__ import annotations

import csv
import re
import sys
from datetime import date
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError as exc:
    raise SystemExit("Install pypdf: pip3 install pypdf") from exc

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PDF = ROOT / "integrations/knowledge/Term_Life_Knowledge/amam-easy-term-3350.pdf"
CSV_PATH = ROOT / "integrations/knowledge/Term_Life_Knowledge/term_carrier_premiums.csv"
SOURCE_FILE = "Form_3350_8-22.pdf"
SOURCE_DATE = "2022-08-01"
POLICY_FEE = 60
MODAL = 0.094

# Public quoter face amounts that appear on Form 3350 (Easy Term max $500K).
QUOTER_FACES = {100_000, 150_000, 200_000, 250_000, 300_000, 400_000, 500_000}


def parse_face_line(line: str) -> list[int]:
    faces = []
    for m in re.findall(r"\$[\d,]+", line):
        if m == "$15":
            continue
        faces.append(int(m.replace("$", "").replace(",", "")))
    return faces


def parse_premium(token: str) -> float | None:
    if token in ("NA*", "NA", "**", "N/A"):
        return None
    try:
        return float(token)
    except ValueError:
        return None


def parse_page(text: str) -> list[dict]:
    if "Return of Premium" in text:
        return []

    gender = "male" if "Male Easy Term" in text else "female" if "Female Easy Term" in text else None
    if not gender:
        return []

    term_match = re.search(r"(\d+)\s+Year Level Term(?!\s*-)", text)
    if not term_match:
        return []
    term_years = int(term_match.group(1))

    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    faces: list[int] = []
    for ln in lines:
        candidate = parse_face_line(ln)
        if len(candidate) >= 4:
            faces = candidate
            break
    if not faces:
        return []

    rows: list[dict] = []
    for ln in lines:
        if not re.match(r"^\d{2}\s", ln):
            continue
        parts = ln.split()
        if len(parts) < 4:
            continue
        try:
            age = int(parts[0])
        except ValueError:
            continue
        if age < 18 or age > 85:
            continue
        if parts[-1] == parts[0]:
            values = parts[1:-1]
        else:
            values = parts[1:]
        expected = len(faces) * 2
        if len(values) != expected:
            continue

        for i, face in enumerate(faces):
            if face not in QUOTER_FACES:
                continue
            n_val = parse_premium(values[i * 2])
            t_val = parse_premium(values[i * 2 + 1])
            if n_val is not None:
                rows.append(
                    make_row(age, gender, False, term_years, face, n_val, "standard_nt")
                )
            if t_val is not None:
                rows.append(
                    make_row(age, gender, True, term_years, face, t_val, "standard_t")
                )
    return rows


def make_row(
    age: int,
    sex: str,
    smoker: bool,
    term_years: int,
    face: int,
    monthly: float,
    health_class: str,
) -> dict:
    return {
        "carrier": "amam",
        "product": "easy_term",
        "state": "NE",
        "age": age,
        "sex": sex,
        "smoker": 1 if smoker else 0,
        "term_years": term_years,
        "face_band_min": face,
        "face_band_max": face,
        "health_class": health_class,
        "rate_per_thousand": "",
        "policy_fee_annual": POLICY_FEE,
        "modal_monthly_factor": MODAL,
        "monthly_premium": f"{monthly:.2f}",
        "face_amount": face,
        "source_file": SOURCE_FILE,
        "source_date": SOURCE_DATE,
    }


def read_existing_csv() -> tuple[list[str], list[dict]]:
    header = [
        "carrier",
        "product",
        "state",
        "age",
        "sex",
        "smoker",
        "term_years",
        "face_band_min",
        "face_band_max",
        "health_class",
        "rate_per_thousand",
        "policy_fee_annual",
        "modal_monthly_factor",
        "monthly_premium",
        "face_amount",
        "source_file",
        "source_date",
    ]
    if not CSV_PATH.exists():
        return header, []
    rows: list[dict] = []
    with CSV_PATH.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(
            (line for line in fh if line.strip() and not line.lstrip().startswith("#"))
        )
        for row in reader:
            if row.get("carrier") == "amam" and row.get("product") == "easy_term":
                continue
            rows.append({k: row.get(k, "") for k in header})
    return header, rows


def row_key(row: dict) -> tuple:
    return (
        row["carrier"],
        row["product"],
        row["state"],
        int(row["age"]),
        row["sex"],
        int(row["smoker"]),
        int(row["term_years"]),
        int(row["face_band_min"]),
        int(row["face_band_max"]),
        row["health_class"],
    )


def main() -> None:
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    if not pdf_path.exists():
        raise SystemExit(f"PDF not found: {pdf_path}")

    reader = PdfReader(str(pdf_path))
    parsed: list[dict] = []
    for page in reader.pages:
        parsed.extend(parse_page(page.extract_text() or ""))

    dedup: dict[tuple, dict] = {}
    for row in parsed:
        dedup[row_key(row)] = row
    amam_rows = sorted(
        dedup.values(),
        key=lambda r: (
            r["sex"],
            int(r["term_years"]),
            int(r["age"]),
            int(r["smoker"]),
            int(r["face_amount"]),
        ),
    )

    header, keep_rows = read_existing_csv()
    out_rows = keep_rows + amam_rows

    with CSV_PATH.open("w", newline="", encoding="utf-8") as fh:
        fh.write(
            "# carrier,product,state,age,sex,smoker,term_years,face_band_min,face_band_max,"
            "health_class,rate_per_thousand,policy_fee_annual,modal_monthly_factor,"
            "monthly_premium,face_amount,source_file,source_date\n"
        )
        fh.write(
            "# AmAm Easy Term rows parsed from Form 3350 — "
            f"generated {date.today().isoformat()}\n"
        )
        writer = csv.DictWriter(fh, fieldnames=header)
        writer.writeheader()
        writer.writerows(out_rows)

    print(f"Parsed {len(amam_rows)} AmAm Easy Term rows from {pdf_path.name}")
    print(f"Wrote {len(out_rows)} total rows to {CSV_PATH}")

    # Spot-check documented sample: male 45 / 20yr / $250K / NT
    sample = dedup.get(
        ("amam", "easy_term", "NE", 45, "male", 0, 20, 250_000, 250_000, "standard_nt")
    )
    if sample:
        print(f"Sample male 45 / 20yr / $250K NT: ${sample['monthly_premium']}/mo")


if __name__ == "__main__":
    main()
