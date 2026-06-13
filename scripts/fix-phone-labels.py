#!/usr/bin/env python3
"""Correct office vs Julie direct phone labels site-wide."""

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

REPAIRS = [
    ('href="tel:+14022078568 2-207-8568"', 'href="tel:+14022078568">402-207-8568'),
    ('href="tel:+14024405438 2-440-5438"', 'href="tel:+14024405438">402-440-5438'),
]

SWAPS = [
    (
        '<strong>Oficina:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a>',
        '<strong>Oficina:</strong> <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a>',
    ),
    (
        '<strong>Office:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a>',
        '<strong>Office:</strong> <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a>',
    ),
    (
        '<strong>Office:</strong> <a class="text-decoration-none" href="tel:+14024405438">402-440-5438</a>',
        '<strong>Office:</strong> <a class="text-decoration-none" href="tel:+14022078568">402-207-8568</a>',
    ),
    (
        '<strong>Línea directa de Julie:</strong> <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a>',
        '<strong>Línea directa de Julie:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a>',
    ),
    (
        '<strong>Julie direct:</strong> <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a>',
        '<strong>Julie direct:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a>',
    ),
    (
        '<strong>Julie direct:</strong> <a class="text-decoration-none" href="tel:+14022078568">402-207-8568</a>',
        '<strong>Julie direct:</strong> <a class="text-decoration-none" href="tel:+14024405438">402-440-5438</a>',
    ),
    (
        'Línea de oficina: <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a>',
        'Línea de oficina: <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a>',
    ),
    (
        'Office line: <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a>',
        'Office line: <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a>',
    ),
    (
        'Office line: <a class="text-decoration-none" href="tel:+14024405438">402-440-5438</a>',
        'Office line: <a class="text-decoration-none" href="tel:+14022078568">402-207-8568</a>',
    ),
    (
        '<p class="mb-1">Office: <a href="tel:+14024405438">402-440-5438</a></p>',
        '<p class="mb-1">Office: <a href="tel:+14022078568">402-207-8568</a></p>',
    ),
    (
        '<li>Office: <a href="tel:+14024405438">402-440-5438</a></li>',
        '<li>Office: <a href="tel:+14022078568">402-207-8568</a></li>',
    ),
    (
        '<li data-lang="en">Office: <a href="tel:+14024405438">402-440-5438</a></li>',
        '<li data-lang="en">Office: <a href="tel:+14022078568">402-207-8568</a></li>',
    ),
    (
        '<span data-lang="en"><strong>Office:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a></span>',
        '<span data-lang="en"><strong>Office:</strong> <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a></span>',
    ),
    (
        '<span data-lang="es"><strong>Oficina:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a></span>',
        '<span data-lang="es"><strong>Oficina:</strong> <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a></span>',
    ),
    (
        '<li data-lang="es">Oficina: <a href="tel:+14024405438">402-440-5438</a></li>',
        '<li data-lang="es">Oficina: <a href="tel:+14022078568">402-207-8568</a></li>',
    ),
    (
        'Oficina: <a href="tel:+14024405438" class="text-white text-opacity-90 text-decoration-none" title="Office line">402-440-5438</a>',
        'Oficina: <a href="tel:+14022078568" class="text-white text-opacity-90 text-decoration-none" title="Office line">402-207-8568</a>',
    ),
    (
        'Office: <a href="tel:+14024405438" class="text-white text-opacity-90 text-decoration-none" title="Office line">402-440-5438</a>',
        'Office: <a href="tel:+14022078568" class="text-white text-opacity-90 text-decoration-none" title="Office line">402-207-8568</a>',
    ),
    (
        'Línea directa de Julie: <a href="tel:+14022078568" class="text-white text-opacity-90 text-decoration-none" title="Julie direct line">402-207-8568</a>',
        'Línea directa de Julie: <a href="tel:+14024405438" class="text-white text-opacity-90 text-decoration-none" title="Julie direct line">402-440-5438</a>',
    ),
    (
        'Julie direct: <a href="tel:+14022078568" class="text-white text-opacity-90 text-decoration-none" title="Julie direct line">402-207-8568</a>',
        'Julie direct: <a href="tel:+14024405438" class="text-white text-opacity-90 text-decoration-none" title="Julie direct line">402-440-5438</a>',
    ),
]


def fix_text(text: str) -> str:
    for old, new in REPAIRS:
        text = text.replace(old, new)
    for old, new in SWAPS:
        text = text.replace(old, new)
    return text


def main() -> None:
    changed: list[Path] = []
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        updated = fix_text(text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(ROOT))
    print(f"Updated {len(changed)} HTML file(s):")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
