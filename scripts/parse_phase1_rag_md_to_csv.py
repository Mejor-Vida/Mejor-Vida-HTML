#!/usr/bin/env python3
"""Parse integrations/knowledge-base/RAG_KnowledgeBase_Phase1_Content.md → CSV for ingest_knowledge_to_supabase.py."""
from __future__ import annotations

import csv
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MD = ROOT / "integrations" / "knowledge-base" / "RAG_KnowledgeBase_Phase1_Content.md"
OUT = ROOT / "scripts" / "knowledge_phase1_2026-04-20.csv"


def main() -> int:
    if not MD.is_file():
        print(f"Missing {MD}", file=sys.stderr)
        return 1
    text = MD.read_text(encoding="utf-8")

    # Drop document summary table and section 11 pure informational block (no Q/A pairs)
    if "## SECTION 11:" in text:
        text = text.split("## SECTION 11:")[0]

    rows: list[dict[str, str]] = []
    current_category = ""
    current_source = ""

    # Split into blocks at --- ; within each block look for Q/A
    parts = text.split("\n---\n")
    for block in parts:
        lines = block.strip().split("\n")
        for line in lines:
            if line.startswith("**SOURCE:**"):
                current_source = line.replace("**SOURCE:**", "").strip()
            m = re.match(r"\*\*CATEGORY:\*\*\s*(.+)", line)
            if m:
                current_category = m.group(1).strip()

        # Find **Q: ... ** and A: ... until next ** or end
        qm = re.search(r"\*\*Q:\s*(.+?)\*\*\s*\nA:\s*(.+)", block, re.DOTALL)
        if not qm:
            continue
        q = qm.group(1).strip().replace("\n", " ")
        rest = qm.group(2).strip()
        # Answer may include **Note:** paragraphs
        answer = rest.strip()
        if not q or not answer:
            continue
        rows.append(
            {
                "question": q,
                "answer": answer,
                "category": current_category or "General",
                "source": current_source[:500] if current_source else "",
            }
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["question", "answer", "category", "source"])
        w.writeheader()
        w.writerows(rows)

    print(f"Wrote {len(rows)} rows to {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
