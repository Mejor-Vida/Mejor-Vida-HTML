#!/usr/bin/env python3
"""Replace Spanish site footers with includes/site-footer-inner.html (matches index layout)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = (ROOT / "includes" / "site-footer-inner.html").read_text(encoding="utf-8")
FOOTER_RE = re.compile(
    r'<footer style="background:#1a365d; padding: 8px 0 24px 0;">.*?</footer>',
    re.DOTALL,
)
SKIP_DIRS = {
    "preview",
    "email-previews",
    "staff",
    "website-avatar",
    "facebook-posting",
    "node_modules",
    ".git",
    "includes",
    "scripts",
    "en",
    "sources",
    "gastos-finales-ads-v2",
    "gastos-finales-ads",
    "Landing page",
}
SKIP_FILES = set()


def prefix_for(path: Path) -> str:
    rel = path.relative_to(ROOT)
    depth = len(rel.parts) - 1
    return "../" * depth if depth else ""


def footer_css_href(prefix: str) -> str:
    return f'{prefix}css/site-footer.css'


def ensure_footer_css(html: str, prefix: str) -> str:
    href = footer_css_href(prefix)
    marker = f'href="{href}"'
    if marker in html:
        return html
    link = f'<link href="{href}" rel="stylesheet"/>\n'
    shared = f'href="{prefix}css/quote-flow-shared.css"'
    if shared in html:
        return re.sub(
            rf'(<link href="{re.escape(prefix)}css/quote-flow-shared\.css" rel="stylesheet"\s*/>)',
            r"\1\n" + link.rstrip(),
            html,
            count=1,
        )
    boot = f'href="{prefix}bootstrap/css/bootstrap.min.css"'
    if boot in html:
        return re.sub(
            rf'(<link href="{re.escape(prefix)}bootstrap/css/bootstrap.min.css" rel="stylesheet"\s*/>)',
            r"\1\n" + link.rstrip(),
            html,
            count=1,
        )
    m = re.search(r"(<link[^>]+stylesheet[^>]*>)", html)
    if m:
        insert_at = m.end()
        return html[:insert_at] + "\n" + link.rstrip() + html[insert_at:]
    return html


def sync_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if 'background:#1a365d; padding: 8px 0 24px 0' not in text:
        return False
    prefix = prefix_for(path)
    updated = ensure_footer_css(text, prefix)
    new_footer = TEMPLATE.replace("__PREFIX__", prefix).strip()
    updated, n = FOOTER_RE.subn(new_footer, updated, count=1)
    if n == 0 and updated == text:
        return False
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


FOOTER_LOGO_IMG_RE = re.compile(r'<img\s+[^>]*?id="footer-logo"[^>]*?/?>', re.I)


def clean_footer_logo_img(tag: str) -> str:
    src_m = re.search(r'src="([^"]+)"', tag)
    if not src_m:
        return tag
    src = src_m.group(1)
    return (
        f'<img alt="Mejor Vida Insurance LLC" decoding="async" height="533" '
        f'id="footer-logo" loading="lazy" src="{src}" width="800"/>'
    )


def strip_footer_logo_inline_style(html: str) -> str:
    return FOOTER_LOGO_IMG_RE.sub(lambda m: clean_footer_logo_img(m.group(0)), html)


def sync_en_footer_css(path: Path) -> bool:
    """English site: add site-footer.css and normalize footer logo img."""
    text = path.read_text(encoding="utf-8")
    if 'background:#1a365d; padding: 8px 0 24px 0' not in text:
        return False
    prefix = prefix_for(path)
    updated = ensure_footer_css(text, prefix)
    updated = strip_footer_logo_inline_style(updated)
    if updated == text:
        return False
    path.write_text(updated, encoding="utf-8")
    return True


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name in SKIP_FILES:
            continue
        if sync_file(path):
            changed.append(path.relative_to(ROOT))
    en_dir = ROOT / "en"
    if en_dir.is_dir():
        for path in sorted(en_dir.rglob("*.html")):
            if sync_en_footer_css(path):
                changed.append(path.relative_to(ROOT))
    print(f"Updated {len(changed)} file(s):")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
