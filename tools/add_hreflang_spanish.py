#!/usr/bin/env python3
"""Add hreflang alternate tags and optional English header link to Spanish root pages (regex-safe)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://www.mejorvidainsurance.com"

PAGES = {
    "index.html": ("/", "/en/"),
    "quote.html": ("/quote.html", "/en/quote.html"),
    "about-julie.html": ("/about-julie.html", "/en/about-julie.html"),
    "contact.html": ("/contact.html", "/en/contact.html"),
    "blog.html": ("/blog.html", "/en/blog.html"),
    "final-expense-estimator.html": ("/final-expense-estimator.html", "/en/final-expense-estimator.html"),
    "landing-gastos-finales.html": ("/landing-gastos-finales.html", "/en/landing-final-expense.html"),
    "privacy-policy.html": ("/privacy-policy.html", "/en/privacy-policy.html"),
    "terms-service.html": ("/terms-service.html", "/en/terms-service.html"),
    "sms-optin.html": ("/sms-optin.html", "/en/sms-optin.html"),
}

# Spanish-only SEO: keep EN pages for bilingual families, but do not advertise
# them to crawlers via hreflang="en" (robots.txt Disallow: /en/ + noindex).
HREFLANG_BLOCK = """
  <link rel="alternate" hreflang="es" href="{es_url}" />
  <link rel="alternate" hreflang="x-default" href="{es_url}" />"""

ENGLISH_LINK = (
    '<a href="/en/" class="d-none d-lg-inline-block nav-link-cm small text-muted '
    'text-decoration-none ms-1" title="View site in English">English</a>'
)


def inject_hreflang(text: str, es_path: str, en_path: str) -> str:
    es_url = f"{BASE}{es_path if es_path != '/' else '/'}"
    en_url = f"{BASE}{en_path}"
    text = re.sub(r'\s*<link[^>]+hreflang="[^"]+"[^>]*/>\s*', "\n", text)
    block = HREFLANG_BLOCK.format(es_url=es_url, en_url=en_url)
    if 'hreflang="es"' not in text:
        text = re.sub(r"</head>", block + "\n</head>", text, count=1, flags=re.IGNORECASE)
    return text


def inject_english_link(text: str) -> str:
    if ENGLISH_LINK in text:
        return text
    if 'class="header-actions"' not in text:
        return text
    return re.sub(
        r'(<!-- Language Toggle -->\s*)<div class="d-flex gap-1 ms-2">',
        r"\1" + ENGLISH_LINK + '\n          <div class="d-flex gap-1 ms-2">',
        text,
        count=1,
    )


def process_file(name: str, es_path: str, en_path: str) -> None:
    path = ROOT / name
    if not path.exists():
        print(f"  skip missing {name}")
        return
    text = path.read_text(encoding="utf-8")
    text = inject_hreflang(text, es_path, en_path)
    if name != "landing-gastos-finales.html":
        text = inject_english_link(text)
    path.write_text(text, encoding="utf-8")
    print(f"  updated {name}")


def main() -> None:
    for name, (es_path, en_path) in PAGES.items():
        process_file(name, es_path, en_path)


if __name__ == "__main__":
    main()
