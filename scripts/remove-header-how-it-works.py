#!/usr/bin/env python3
"""Remove How It Works / Cómo funciona from site headers (desktop + mobile nav only)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {
    "node_modules",
    ".git",
    "preview",
    "email-previews",
    "staff",
    "website-avatar",
    "facebook-posting",
}

DESKTOP = re.compile(
    r'\n\s*<a (?=[^>]*#how-it-works)(?=[^>]*nav-link-stack)[^>]*>(?:Cómo funciona|How It Works)</a>',
    re.I,
)
MOBILE = re.compile(
    r'\n\s*<a (?=[^>]*#how-it-works)(?=[^>]*mobile-menu-link)[^>]*>(?:Cómo funciona|How It Works)</a>',
    re.I,
)


def main() -> None:
    changed: list[Path] = []
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if 'class="sticky-top bg-white shadow-sm border-bottom"' not in path.read_text(encoding="utf-8"):
            continue
        text = path.read_text(encoding="utf-8")
        updated = DESKTOP.sub("", text)
        updated = MOBILE.sub("", updated)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(ROOT))
    print(f"Updated {len(changed)} file(s):")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
