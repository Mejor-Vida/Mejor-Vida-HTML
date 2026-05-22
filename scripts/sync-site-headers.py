#!/usr/bin/env python3
"""Replace site headers on inner pages with includes/site-header-inner.html (matches index layout)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = (ROOT / "includes" / "site-header-inner.html").read_text(encoding="utf-8")
HEADER_RE = re.compile(
    r"<header class=\"sticky-top bg-white shadow-sm border-bottom\">.*?</header>",
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
}
SKIP_FILES = {"index.html", "blog/blog-template.html"}


def prefix_for(path: Path) -> str:
    rel = path.relative_to(ROOT)
    depth = len(rel.parts) - 1
    return "../" * depth if depth else ""


def css_href(prefix: str) -> str:
    return f'{prefix}css/quote-flow-shared.css'


def ensure_shared_css(html: str, prefix: str) -> str:
    link = f'  <link href="{css_href(prefix)}" rel="stylesheet" />\n'
    marker = 'href="' + css_href(prefix) + '"'
    if marker in html:
        return html
    # After bootstrap if present
    boot = f'href="{prefix}bootstrap/css/bootstrap.min.css"'
    if boot in html:
        return html.replace(
            f'<link href="{prefix}bootstrap/css/bootstrap.min.css" rel="stylesheet" />',
            f'<link href="{prefix}bootstrap/css/bootstrap.min.css" rel="stylesheet" />\n{link.rstrip()}',
            1,
        )
    # After first stylesheet
    m = re.search(r'(<link[^>]+stylesheet[^>]*>)', html)
    if m:
        insert_at = m.end()
        return html[:insert_at] + "\n" + link.rstrip() + html[insert_at:]
    return html


def sync_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if 'class="sticky-top bg-white shadow-sm border-bottom"' not in text:
        return False
    prefix = prefix_for(path)
    new_header = TEMPLATE.replace("__PREFIX__", prefix)
    updated, n = HEADER_RE.subn(new_header.strip(), text, count=1)
    if n == 0:
        return False
    updated = ensure_shared_css(updated, prefix)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if any(part in SKIP_DIRS for part in path.parts):
            continue
        if path.name in SKIP_FILES:
            continue
        if sync_file(path):
            changed.append(path.relative_to(ROOT))
    print(f"Updated {len(changed)} file(s):")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
