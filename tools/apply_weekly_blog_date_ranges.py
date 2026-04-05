#!/usr/bin/env python3
"""
Set visible week coverage on weekly blog posts: start = filename date, end = start + 6 days.

Updates titles, meta, hero calendar lines, JSON-LD headlines/names, conclusions, blog.html cards.
Does not alter story-level 'Published: March 23' lines (different strings).
"""
from __future__ import annotations

import re
import sys
from datetime import date, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BLOG = PROJECT_ROOT / "blog"
BLOG_HTML = PROJECT_ROOT / "blog.html"

MONTHS_EN = (
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
)
MONTHS_ES = (
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
)


def fmt_en(d: date) -> str:
    return f"{MONTHS_EN[d.month - 1]} {d.day}, {d.year}"


def fmt_en_range(start: date, end: date) -> str:
    return f"{fmt_en(start)} – {fmt_en(end)}"


def fmt_es_range(start: date, end: date) -> str:
    if start.month == end.month and start.year == end.year:
        return f"{start.day} al {end.day} de {MONTHS_ES[end.month - 1]} de {end.year}"
    return (
        f"{start.day} de {MONTHS_ES[start.month - 1]} al {end.day} de "
        f"{MONTHS_ES[end.month - 1]} de {end.year}"
    )


def es_single_day(start: date) -> str:
    return f"{start.day} de {MONTHS_ES[start.month - 1]} de {start.year}"


def parse_start(path: Path) -> date | None:
    m = re.search(r"weekly-insurance-update-(\d{4})-(\d{2})-(\d{2})\.html", path.name)
    if not m:
        return None
    return date(int(m.group(1)), int(m.group(2)), int(m.group(3)))


def apply_to_weekly_file(path: Path) -> bool:
    start = parse_start(path)
    if not start:
        return False
    end = start + timedelta(days=6)
    en_one = fmt_en(start)
    en_r = fmt_en_range(start, end)
    es_one = es_single_day(start)
    es_r = fmt_es_range(start, end)
    month_day = f"{MONTHS_EN[start.month - 1]} {start.day}"

    text = path.read_text(encoding="utf-8")
    orig = text

    # Title, meta, og, JSON-LD (unique phrases with full en_one)
    text = text.replace(
        f"Weekly Life and Final Expense Insurance Update: {en_one}",
        f"Weekly Life and Final Expense Insurance Update: {en_r}",
    )
    text = text.replace(
        f"Weekly insurance update for {en_one}:",
        f"Weekly insurance update for {en_r}:",
    )
    text = text.replace(
        f'"Insurance Industry News - Week of {en_one}"',
        f'"Insurance Industry News - Week of {en_r}"',
    )
    text = text.replace(
        f"<i class=\"fas fa-calendar-alt me-2\"></i>{en_one} |",
        f'<i class="fas fa-calendar-alt me-2"></i>{en_r} |',
    )
    text = text.replace(
        f"<i class=\"fas fa-calendar-alt me-2\"></i>{es_one} |",
        f'<i class="fas fa-calendar-alt me-2"></i>{es_r} |',
    )

    # Hero image alt often ends with "weekly update March 29, 2026"
    text = text.replace(
        f"weekly update {en_one}",
        f"weekly update {en_r}",
    )

    # Conclusion (English)
    text = text.replace(
        f"The {month_day} recap highlights",
        f"The {en_r} recap highlights",
    )
    # Conclusion (Spanish): "La actualización del 29 de marzo destaca"
    es_month = MONTHS_ES[start.month - 1]
    old_es_phrase = f"La actualización del {start.day} de {es_month} destaca"
    text = text.replace(
        old_es_phrase,
        f"La actualización del período {es_r} destaca",
    )

    if text == orig:
        print(f"No changes (patterns missing?): {path.name}", file=sys.stderr)
        return False

    path.write_text(text, encoding="utf-8")
    print(f"Updated {path.name} -> {en_r}")
    return True


def apply_blog_html() -> None:
    """Replace blog card titles that use single-day labels."""
    text = BLOG_HTML.read_text(encoding="utf-8")
    orig = text

    for path in sorted(BLOG.glob("weekly-insurance-update-*.html")):
        start = parse_start(path)
        if not start:
            continue
        end = start + timedelta(days=6)
        en_one = fmt_en(start)
        en_r = fmt_en_range(start, end)
        es_one = es_single_day(start)
        es_r = fmt_es_range(start, end)

        text = text.replace(
            f"Weekly update - {en_one}",
            f"Weekly update - {en_r}",
        )
        text = text.replace(
            f"Actualización semanal - {es_one}",
            f"Actualización semanal - {es_r}",
        )
        text = text.replace(
            f"Weekly Insurance Update {en_one}",
            f"Weekly Insurance Update {en_r}",
        )

    # Newsletter summary line (April 5) — show range for "this week"
    text = text.replace(
        "Resumen de esta semana (5 de abril, 2026)",
        "Resumen de esta semana (5 al 11 de abril de 2026)",
    )
    text = text.replace(
        "This week's summary (April 5, 2026)",
        "This week's summary (April 5 – April 11, 2026)",
    )

    if text != orig:
        BLOG_HTML.write_text(text, encoding="utf-8")
        print("Updated blog.html")


def main() -> int:
    n = 0
    for path in sorted(BLOG.glob("weekly-insurance-update-*.html")):
        if apply_to_weekly_file(path):
            n += 1
    apply_blog_html()
    print(f"Done. Weekly files touched: {n}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
