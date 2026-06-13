#!/usr/bin/env python3
"""
Parse MOO Term Life Answers illustration PDFs exported from WinFlex.

Drop PDFs in integrations/knowledge/Term_Life_Knowledge/winflex-pdfs/
then run:

  python3 scripts/parse-winflex-pdf.py
  python3 scripts/parse-winflex-pdf.py path/to/file.pdf

Appends JSONL captures to winflex-captures.jsonl (same format as winflex-harvest.mjs).
You still need spec metadata — name files like:
  moo_tla_20y_m45_nt_250k_preferred_plus_nt.pdf

Or use interactive harvest instead.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError as exc:
    raise SystemExit("Install pypdf: pip3 install pypdf") from exc

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "integrations/knowledge/Term_Life_Knowledge/winflex-pdfs"
CAPTURES = ROOT / "integrations/knowledge/Term_Life_Knowledge/winflex-captures.jsonl"

FNAME_RE = re.compile(
    r"(?P<term>\d+)y_.*?m(?P<age>\d+)_(?P<tob>nt|t)_(?P<face>\d+)k_(?P<health>preferred_plus_nt|standard_nt|preferred_nt|standard_t)",
    re.I,
)


def pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    parts = []
    for page in reader.pages:
        parts.append(page.extract_text() or "")
    return "\n".join(parts)


def extract_monthly(text: str) -> float | None:
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in text.splitlines()]
    label = re.compile(r"(initial|modal|total|target|planned)?\s*(monthly|annual)?\s*premium", re.I)
    for i, line in enumerate(lines):
        if not label.search(line):
            continue
        m = re.search(r"\$\s*([\d,]+\.\d{2})", line)
        if m:
            return float(m.group(1).replace(",", ""))
        for j in range(1, 4):
            if i + j >= len(lines):
                break
            m2 = re.search(r"\$\s*([\d,]+\.\d{2})", lines[i + j])
            if m2:
                return float(m2.group(1).replace(",", ""))
    dollars = [float(x.replace(",", "")) for x in re.findall(r"\$\s*([\d,]+\.\d{2})", text)]
    plausible = [d for d in dollars if 15 <= d <= 15000]
    return plausible[0] if plausible else None


def spec_from_filename(name: str) -> dict | None:
    m = FNAME_RE.search(name)
    if not m:
        return None
    face = int(m.group("face")) * 1000
    return {
        "term_years": int(m.group("term")),
        "age": int(m.group("age")),
        "sex": "male",
        "smoker": 0 if m.group("tob").lower() == "nt" else 1,
        "face": face,
        "health_class": m.group("health").lower(),
    }


def face_band(face: int) -> tuple[int, int]:
    if face <= 249_999:
        return 100_000, 249_999
    if face <= 499_999:
        return 250_000, 499_999
    if face <= 999_999:
        return 500_000, 999_999
    return 1_000_000, 5_000_000


def main() -> None:
    paths = [Path(p) for p in sys.argv[1:]] if len(sys.argv) > 1 else sorted(PDF_DIR.glob("*.pdf"))
    if not paths:
        raise SystemExit(f"No PDFs found. Add files to {PDF_DIR}")

    CAPTURES.parent.mkdir(parents=True, exist_ok=True)
    written = 0
    for pdf in paths:
        if not pdf.is_file():
            continue
        text = pdf_text(pdf)
        premium = extract_monthly(text)
        if premium is None:
            print(f"SKIP (no premium): {pdf.name}")
            continue
        spec = spec_from_filename(pdf.stem)
        if not spec:
            print(f"SKIP (rename file with metadata): {pdf.name} — premium ${premium:.2f}")
            continue
        bmin, bmax = face_band(spec["face"])
        spec["face_band_min"] = bmin
        spec["face_band_max"] = bmax
        record = {
            "spec": spec,
            "monthly_premium": premium,
            "captured_at": datetime.now(timezone.utc).isoformat(),
            "source": "pdf",
            "pdf": str(pdf),
        }
        with CAPTURES.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record) + "\n")
        written += 1
        print(f"OK {pdf.name} → ${premium:.2f}")

    print(f"Wrote {written} capture(s) → {CAPTURES}")
    if written:
        print("Run: npm run harvest:winflex -- merge")


if __name__ == "__main__":
    main()
