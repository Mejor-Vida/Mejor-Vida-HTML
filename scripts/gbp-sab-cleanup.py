#!/usr/bin/env python3
"""One-shot: SAB / GBP cleanup — strip street schema, sync footers/headers, NAP, titles."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {
    "node_modules",
    ".git",
    "includes",
    "scripts",
    "email-previews",
    "staff",
    "website-avatar",
    "facebook-posting",
}

# Remove JSON-LD "address": { ... PostalAddress ... },
ADDRESS_BLOCK_RE = re.compile(
    r',?\s*"address"\s*:\s*\{\s*'
    r'"@type"\s*:\s*"PostalAddress"\s*,?'
    r'[\s\S]*?'
    r'\}\s*,?',
    re.MULTILINE,
)

FOOTER_RE = re.compile(
    r'<footer style="background:#1a365d; padding: 8px 0 24px 0;">.*?</footer>',
    re.DOTALL,
)
HEADER_RE = re.compile(
    r'<header class="sticky-top bg-white shadow-sm border-bottom">.*?</header>',
    re.DOTALL,
)

def _read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def load_templates() -> None:
    global ES_FOOTER, EN_FOOTER, ES_HEADER, EN_HEADER
    ES_FOOTER = _read(ROOT / "includes" / "site-footer-inner.html")
    EN_FOOTER = _read(ROOT / "includes" / "en-site-footer.html")
    ES_HEADER = _read(ROOT / "includes" / "site-header-inner.html")
    EN_HEADER = _read(ROOT / "includes" / "en-site-header.html")


ES_FOOTER = EN_FOOTER = ES_HEADER = EN_HEADER = ""

STARS_DIV_RE = re.compile(
    r'\s*<div class="(?:lf|mi)-julie-stars"[^>]*>\s*'
    r'(?:<span[^>]*>\s*★\s*</span>\s*){5}'
    r'</div>\s*',
    re.IGNORECASE,
)

NAME_FIX_RE = re.compile(r"Mejor Vida Insurance(?! LLC)")


def should_skip(path: Path) -> bool:
    return any(part in SKIP_DIRS for part in path.parts)


def prefix_for(path: Path) -> str:
    rel = path.relative_to(ROOT)
    depth = len(rel.parts) - 1
    return "../" * depth if depth else ""


def strip_address_schema(text: str) -> tuple[str, int]:
    n = 0

    def repl(m: re.Match) -> str:
        nonlocal n
        n += 1
        chunk = m.group(0)
        # Preserve a comma if neighbors need it: prefer trailing comma removal
        # Leave a single comma if we stripped mid-object and left ",,"
        return "," if chunk.strip().startswith(",") and not chunk.rstrip().endswith(",") else ""

    # Cleaner approach: remove `,\n    "address": { ... }` entirely
    updated, count = ADDRESS_BLOCK_RE.subn("", text)
    # Fix double commas / trailing commas before }
    updated = re.sub(r",\s*,", ",", updated)
    updated = re.sub(r",(\s*\})", r"\1", updated)
    return updated, count


def sync_es_footer(path: Path, text: str) -> str:
    prefix = prefix_for(path)
    new_footer = ES_FOOTER.replace("__PREFIX__", prefix).strip()
    updated, n = FOOTER_RE.subn(new_footer, text, count=1)
    return updated if n else text


def sync_en_footer(path: Path, text: str) -> str:
    # __ASSET__ → site root (../ from en/, ../../ from en/blog/)
    # __PAGE__ → en/ folder ("" from en/, ../ from en/blog/)
    rel_under_en = path.relative_to(ROOT / "en")
    depth = len(rel_under_en.parts) - 1
    asset = "../" * (depth + 1)
    page = "../" * depth
    new_footer = (
        EN_FOOTER.replace("__ASSET__", asset).replace("__PAGE__", page).strip()
    )
    updated, n = FOOTER_RE.subn(new_footer, text, count=1)
    return updated if n else text


def sync_es_header(path: Path, text: str) -> str:
    if 'class="sticky-top bg-white shadow-sm border-bottom"' not in text:
        return text
    prefix = prefix_for(path)
    new_header = ES_HEADER.replace("__PREFIX__", prefix).strip()
    updated, n = HEADER_RE.subn(new_header, text, count=1)
    return updated if n else text


def sync_en_header(path: Path, text: str) -> str:
    if 'class="sticky-top bg-white shadow-sm border-bottom"' not in text:
        return text
    # EN header uses relative links for en/*; nested pages need ../ prefix on en-siblings
    header = EN_HEADER.strip()
    if path.parent != ROOT / "en":
        depth = len(path.relative_to(ROOT / "en").parts) - 1
        up_site = "../" * (depth + 1)  # to site root
        nest = "../" * depth  # to en/
        header = header.replace("../img/", up_site + "img/")
        header = header.replace('href="../index.html"', f'href="{up_site}index.html"')
        header = header.replace(
            'href="../guias-gastos-finales.html"',
            f'href="{up_site}guias-gastos-finales.html"',
        )
        if depth:
            for name in (
                "about-julie.html",
                "blog.html",
                "final-expense-estimator.html",
                "contact.html",
                "quote.html",
                "licenses.html",
            ):
                header = header.replace(f'href="{name}"', f'href="{nest}{name}"')
    updated, n = HEADER_RE.subn(header, text, count=1)
    return updated if n else text


def fix_brand_name_in_meta(text: str) -> str:
    """Add LLC to titles/OG/twitter/alt when missing (avoid double LLC)."""

    def fix_attr(m: re.Match) -> str:
        full = m.group(0)
        return NAME_FIX_RE.sub("Mejor Vida Insurance LLC", full)

    # title tags
    text = re.sub(
        r"<title>[^<]*</title>",
        lambda m: NAME_FIX_RE.sub("Mejor Vida Insurance LLC", m.group(0)),
        text,
    )
    # og:title / twitter:title content=
    text = re.sub(
        r'(property="og:title"\s+content="[^"]*")',
        fix_attr,
        text,
    )
    text = re.sub(
        r'(content="[^"]*"\s+property="og:title")',
        fix_attr,
        text,
    )
    text = re.sub(
        r'(name="twitter:title"\s+content="[^"]*")',
        fix_attr,
        text,
    )
    text = re.sub(
        r'(content="[^"]*"\s+name="twitter:title")',
        fix_attr,
        text,
    )
    # logo alts
    text = re.sub(
        r'alt="Mejor Vida Insurance(?! LLC)(?: logo)?"',
        lambda m: m.group(0).replace("Mejor Vida Insurance", "Mejor Vida Insurance LLC"),
        text,
    )
    return text


def neutralize_stars(text: str) -> str:
    return STARS_DIV_RE.sub("\n", text)


def process_html(path: Path) -> list[str]:
    notes: list[str] = []
    text = path.read_text(encoding="utf-8")
    original = text

    new_text, n_addr = strip_address_schema(text)
    if n_addr:
        notes.append(f"schema-address×{n_addr}")
        text = new_text

    rel = path.relative_to(ROOT)
    parts = rel.parts

    if "en" in parts and parts[0] == "en":
        before = text
        text = sync_en_footer(path, text)
        if text != before:
            notes.append("en-footer")
        before = text
        text = sync_en_header(path, text)
        if text != before:
            notes.append("en-header")
    elif parts[0] != "sources" and "Landing page" not in parts:
        # Spanish public pages (root, blog, carriers, etc.)
        if parts[0] not in ("gastos-finales-ads", "gastos-finales-ads-v2", "gastos-finales-ads-v3", "preview"):
            before = text
            text = sync_es_footer(path, text)
            if text != before:
                notes.append("es-footer")
            before = text
            text = sync_es_header(path, text)
            if text != before:
                notes.append("es-header")

    # Fallback: if map-marker + address still present (landing/sources), strip those spans
    if "fa-map-marker-alt" in text and "1201 O St" in text:
        text2 = re.sub(
            r'\s*<span class="text-nowrap"><i class="fas fa-map-marker-alt[^"]*"[^>]*></i>\s*1201 O St Ste 309 Unit #597[^<]*</span>',
            "",
            text,
        )
        if text2 != text:
            notes.append("strip-map-pin")
            text = text2

    before = text
    text = fix_brand_name_in_meta(text)
    if text != before:
        notes.append("brand-llc")

    before = text
    text = neutralize_stars(text)
    if text != before:
        notes.append("stars")

    if text != original:
        path.write_text(text, encoding="utf-8")
    return notes


def main() -> int:
    load_templates()
    changed: list[tuple[str, list[str]]] = []
    for path in sorted(ROOT.rglob("*.html")):
        if should_skip(path):
            continue
        notes = process_html(path)
        if notes:
            changed.append((str(path.relative_to(ROOT)), notes))

    print(f"Updated {len(changed)} HTML file(s)")
    for p, notes in changed:
        print(f"  - {p}: {', '.join(notes)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
