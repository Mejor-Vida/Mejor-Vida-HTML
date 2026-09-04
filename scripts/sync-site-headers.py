#!/usr/bin/env python3
"""Replace site headers with includes/site-header-inner.html and includes/en-site-header.html."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ES_TEMPLATE = (ROOT / "includes" / "site-header-inner.html").read_text(encoding="utf-8")
EN_TEMPLATE = (ROOT / "includes" / "en-site-header.html").read_text(encoding="utf-8")
HEADER_RE = re.compile(
    r"<header class=\"sticky-top bg-white shadow-sm border-bottom\">.*?</header>"
    r"(?:\s*<a\b[^>]*\bmvi-whatsapp-fab\b[^>]*>.*?</a>)?"
    r"(?:\s*<div class=\"mvi-float-stack\">.*?</div>)?",
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
}
SKIP_FILES = {"blog/blog-template.html"}


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
    boot = f'href="{prefix}bootstrap/css/bootstrap.min.css"'
    if boot in html:
        return html.replace(
            f'<link href="{prefix}bootstrap/css/bootstrap.min.css" rel="stylesheet" />',
            f'<link href="{prefix}bootstrap/css/bootstrap.min.css" rel="stylesheet" />\n{link.rstrip()}',
            1,
        )
    m = re.search(r'(<link[^>]+stylesheet[^>]*>)', html)
    if m:
        insert_at = m.end()
        return html[:insert_at] + "\n" + link.rstrip() + html[insert_at:]
    return html


def sync_es_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if 'class="sticky-top bg-white shadow-sm border-bottom"' not in text:
        return False
    prefix = prefix_for(path)
    new_header = ES_TEMPLATE.replace("__PREFIX__", prefix)
    if path.parent.name == "estados":
        new_header = new_header.replace(
            'href="/en/" class="mvi-lang-fab',
            f'href="/en/states/{path.stem}.html" class="mvi-lang-fab',
        )
    updated, n = HEADER_RE.subn(new_header.strip(), text, count=1)
    if n == 0:
        return False
    updated = ensure_shared_css(updated, prefix)
    if updated != text:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


def prepare_en_header(path: Path) -> str:
    header = EN_TEMPLATE.strip()
    en_root = ROOT / "en"
    if path.parent != en_root:
        depth = len(path.relative_to(en_root).parts) - 1
        up_site = "../" * (depth + 1)
        nest = "../" * depth
        header = header.replace("../img/", up_site + "img/")
        if path.parent.name == "states":
            header = header.replace(
                'href="../index.html" class="mvi-lang-fab',
                f'href="/estados/{path.stem}.html" class="mvi-lang-fab',
            )
        header = header.replace('href="../index.html"', f'href="{up_site}index.html"')
        header = header.replace('href="index.html#home"', f'href="{nest}index.html#home"')
        header = header.replace('href="index.html"', f'href="{nest}index.html"')
        header = header.replace(
            'href="../guias-gastos-finales.html"',
            f'href="{up_site}guias-gastos-finales.html"',
        )
        header = header.replace('href="../blog/', f'href="{up_site}blog/')
        if depth:
            for name in (
                "about-julie.html",
                "blog.html",
                "final-expense-estimator.html",
                "final-expense-insurance.html",
                "how-much-does-a-funeral-cost.html",
                "prepaid-funerals.html",
                "how-to-pay-for-a-funeral.html",
                "no-waiting-period-life-burial.html",
                "contact.html",
                "quote.html",
                "term-quote.html",
                "licenses.html",
                "life-insurance-products.html",
                "life-insurance-cost.html",
                "final-expense-cost.html",
                "whole-life-cost.html",
                "term-life-cost.html",
                "children-life-insurance-cost.html",
                "children-life-insurance.html",
                "grandchildren-life-insurance.html",
                "family-life-insurance.html",
                "parents-life-insurance.html",
                "grandparents-life-insurance.html",
                "siblings-life-insurance.html",
                "family-members-life-insurance.html",
                "find-life-insurance-policy.html",
                "final-expense-pre-existing-conditions.html",
                "term-life-pre-existing-conditions.html",
                "life-insurance-diabetes.html",
                "life-insurance-heart-disease.html",
                "life-insurance-high-blood-pressure.html",
                "life-insurance-copd.html",
                "life-insurance-cancer.html",
                "life-insurance-kidney-disease.html",
                "life-insurance-disability.html",
                "life-insurance-hiv.html",
                "life-insurance-stroke.html",
                "life-insurance-seniors-over-80.html",
                "life-insurance-seniors-over-85.html",
                "life-insurance-seniors-no-medical-exam.html",
                "life-insurance-age-limit.html",
                "burial-insurance-seniors.html",
                "life-insurance-seniors.html",
                "guaranteed-acceptance.html",
                "cremation-insurance.html",
                "term-life-insurance.html",
                "instant-life-insurance.html",
                "mortgage-protection-insurance.html",
                "states/nebraska.html",
                "states/kansas.html",
                "states/colorado.html",
                "states/nevada.html",
                "5000-life-insurance-cost.html",
                "10000-life-insurance-cost.html",
                "15000-life-insurance-cost.html",
                "20000-life-insurance-cost.html",
                "25000-life-insurance-cost.html",
                "30000-life-insurance-cost.html",
                "40000-life-insurance-cost.html",
                "50000-life-insurance-cost.html",
                "75000-life-insurance-cost.html",
                "100000-life-insurance-cost.html",
                "500000-life-insurance-cost.html",
                "1000000-life-insurance-cost.html",
                "2000000-life-insurance-cost.html",
                "3000000-life-insurance-cost.html",
                "insurance-carriers.html",
            ):
                header = header.replace(f'href="{name}#', f'href="{nest}{name}#')
                header = header.replace(f'href="{name}"', f'href="{nest}{name}"')
            header = header.replace(
                'href="blog/final-expense-vs-prepaid-funeral-2026-07-19.html"',
                f'href="{nest}blog/final-expense-vs-prepaid-funeral-2026-07-19.html"',
            )
    return header


def sync_en_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    if 'class="sticky-top bg-white shadow-sm border-bottom"' not in text:
        return False
    new_header = prepare_en_header(path)
    updated, n = HEADER_RE.subn(new_header, text, count=1)
    if n == 0:
        return False
    en_root = ROOT / "en"
    depth = len(path.relative_to(en_root).parts) - 1
    prefix = "../" * (depth + 1)
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
        if sync_es_file(path):
            changed.append(path.relative_to(ROOT))
    en_dir = ROOT / "en"
    if en_dir.is_dir():
        for path in sorted(en_dir.rglob("*.html")):
            if "blog-template" in path.name:
                continue
            if sync_en_file(path):
                changed.append(path.relative_to(ROOT))
    print(f"Updated {len(changed)} file(s):")
    for p in changed:
        print(f"  - {p}")


if __name__ == "__main__":
    main()
