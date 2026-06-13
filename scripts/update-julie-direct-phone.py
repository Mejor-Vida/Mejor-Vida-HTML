#!/usr/bin/env python3
"""Replace Julie callback number (402-588-1125) with direct line (402-207-8568)."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REPLACEMENTS = [
    ("Julie callback line", "Julie direct line"),
    ("Julie callback:", "Julie direct:"),
    ("Llamadas de Julie:", "Línea directa de Julie:"),
    ("tel:+14025881125", "tel:+14022078568"),
    ("+1-402-588-1125", "+1-402-207-8568"),
    ("+14025881125", "+14022078568"),
    ("402-588-1125", "402-207-8568"),
]

HEADER_INSERTS = [
    (
        '<span><strong>Oficina:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a></span>\n'
        '        <span><strong>SMS/Texto:</strong>',
        '<span><strong>Oficina:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a></span>\n'
        '        <span><strong>Línea directa de Julie:</strong> <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a></span>\n'
        '        <span><strong>SMS/Texto:</strong>',
    ),
    (
        '<span><strong>Office:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a></span>\n'
        '        <span><strong>SMS/Text:</strong>',
        '<span><strong>Office:</strong> <a href="tel:+14024405438" class="text-decoration-none">402-440-5438</a></span>\n'
        '        <span><strong>Julie direct:</strong> <a href="tel:+14022078568" class="text-decoration-none">402-207-8568</a></span>\n'
        '        <span><strong>SMS/Text:</strong>',
    ),
    (
        '<span><strong>Oficina:</strong> <a class="text-decoration-none" href="tel:+14024405438">402-440-5438</a></span>\n'
        '<span><strong>SMS/Texto:</strong>',
        '<span><strong>Oficina:</strong> <a class="text-decoration-none" href="tel:+14024405438">402-440-5438</a></span>\n'
        '<span><strong>Línea directa de Julie:</strong> <a class="text-decoration-none" href="tel:+14022078568">402-207-8568</a></span>\n'
        '<span><strong>SMS/Texto:</strong>',
    ),
    (
        '<span><strong>Office:</strong> <a class="text-decoration-none" href="tel:+14024405438">402-440-5438</a></span>\n'
        '<span><strong>SMS/Text:</strong>',
        '<span><strong>Office:</strong> <a class="text-decoration-none" href="tel:+14024405438">402-440-5438</a></span>\n'
        '<span><strong>Julie direct:</strong> <a class="text-decoration-none" href="tel:+14022078568">402-207-8568</a></span>\n'
        '<span><strong>SMS/Text:</strong>',
    ),
]

CONTACT_INSERTS = [
    (
        '<p class="mb-1">Office: <a href="tel:+14024405438">402-440-5438</a></p>\n<p class="mb-3">SMS:',
        '<p class="mb-1">Office: <a href="tel:+14024405438">402-440-5438</a></p>\n'
        '<p class="mb-1">Julie direct line: <a href="tel:+14022078568">402-207-8568</a></p>\n'
        '<p class="mb-3">SMS:',
    ),
    (
        '<p class="mb-1">Office: <a href="tel:+14024405438">402-440-5438</a></p>\n<p class="mb-3">SMS:',
        '<p class="mb-1">Office: <a href="tel:+14024405438">402-440-5438</a></p>\n'
        '<p class="mb-1">Línea directa de Julie: <a href="tel:+14022078568">402-207-8568</a></p>\n'
        '<p class="mb-3">SMS:',
    ),
]

SKIP_DIRS = {
    "node_modules",
    ".git",
    "preview",
    "email-previews",
    "staff",
    "website-avatar",
    "facebook-posting",
}


def apply_replacements(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    for old, new in HEADER_INSERTS:
        if old in text and "402-207-8568" not in text.split(old, 1)[0][-200:]:
            text = text.replace(old, new, 1)
    for old, new in CONTACT_INSERTS:
        if "Julie direct" not in text and "Línea directa de Julie" not in text:
            text = text.replace(old, new, 1)
    return text


def main() -> None:
    changed: list[Path] = []
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8")
        if "402-588-1125" not in text and "14025881125" not in text:
            updated = apply_replacements(text)
            if updated != text:
                path.write_text(updated, encoding="utf-8")
                changed.append(path.relative_to(ROOT))
            continue
        updated = apply_replacements(text)
        if updated != text:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(ROOT))
    print(f"Updated {len(changed)} HTML file(s):")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
