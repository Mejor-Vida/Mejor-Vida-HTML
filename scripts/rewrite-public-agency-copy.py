#!/usr/bin/env python3
"""Rewrite public HTML: agency name in body copy; no four-state license roster.

Skips licencias.html / en/licenses.html (the only pages that should name
current licensed states). Leaves author bylines, mailto, footer NPN line,
chat aria-labels, and about-julie biography names.
"""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SKIP_DIRS = {
    ".cursor-tmp-941",
    "node_modules",
    ".git",
    "email-previews",
    "staff",
    ".venv",
    "local-browser-agent",
    "mvi-ad-test-runner",
    "integrations",
    "source_pdfs",
}

SKIP_FILES = {
    ROOT / "licencias.html",
    ROOT / "en" / "licenses.html",
}

# Specific phrases first (longest / most specific).
REPLACEMENTS: list[tuple[str, str]] = [
    (
        "Julie compares options in Nebraska, Kansas, Colorado, and Nevada.",
        "Mejor Vida Insurance compares options based on your age, health, and state.",
    ),
    (
        "Julie compara opciones en Nebraska, Kansas, Colorado y Nevada.",
        "Mejor Vida Seguros compara opciones según su edad, salud y estado.",
    ),
    (
        "and get a quote with Julie in Nebraska, Kansas, Colorado, and Nevada.",
        "and get a quote with Mejor Vida Insurance.",
    ),
    (
        "y cotización con Julie en Nebraska, Kansas, Colorado y Nevada.",
        "y cotización con Mejor Vida Seguros.",
    ),
    (
        "Julie quotes quality carrier options in Nebraska, Kansas, Colorado, and Nevada.",
        "Mejor Vida Insurance quotes quality carrier options.",
    ),
    (
        "Julie cotiza opciones con aseguradoras de calidad en Nebraska, Kansas, Colorado y Nevada.",
        "Mejor Vida Seguros cotiza opciones con aseguradoras de calidad.",
    ),
    (
        "Julie is licensed in Nebraska, Kansas, Colorado, and Nevada.",
        "Current licenses are listed on the licenses page.",
    ),
    (
        "Julie está licenciada en Nebraska, Kansas, Colorado y Nevada.",
        "Los estados con licencia actuales están en la página de licencias.",
    ),
    (
        "Julie is a licensed life and final expense insurance agent in Nebraska, Kansas, Colorado, and Nevada.",
        "Mejor Vida Insurance is an independent life and final expense agency.",
    ),
    (
        "A licensed Mejor Vida agent helps you compare options in Nebraska, Kansas, Colorado, and Nevada.",
        "A licensed Mejor Vida agent helps you compare options.",
    ),
    (
        "We are licensed in Nebraska, Kansas, Colorado, and Nevada.",
        "Current licenses are on the licenses page.",
    ),
    (
        "Mejor Vida is licensed in Nebraska, Kansas, Colorado, and Nevada.",
        "Current licenses are on the licenses page.",
    ),
    (
        "Available to quote in Nebraska, Kansas, Colorado, and Nevada, subject to eligibility and plan availability.",
        "Availability depends on your state, eligibility, and plan. See the licenses page for current licensed states.",
    ),
    (
        "Julie reviews exclusions before you sign.",
        "Mejor Vida Insurance reviews exclusions before you sign.",
    ),
    (
        "Julie le explica las exclusiones antes de firmar.",
        "Mejor Vida Seguros le explica las exclusiones antes de firmar.",
    ),
    (
        "Julie compares multiple companies so one decline is not the end of the search.",
        "Mejor Vida Insurance compares multiple companies so one decline is not the end of the search.",
    ),
    (
        "Julie compara varias compañías para no quedarse con la primera negativa.",
        "Mejor Vida Seguros compara varias compañías para no quedarse con la primera negativa.",
    ),
    (
        "Julie explains the contract in plain language.",
        "Mejor Vida Insurance explains the contract in plain language.",
    ),
    (
        "Julie le explica el contrato en palabras claras.",
        "Mejor Vida Seguros le explica el contrato en palabras claras.",
    ),
    (
        "Julie compares simplified-issue products from the carriers Mejor Vida offers.",
        "Mejor Vida Insurance compares simplified-issue products from the carriers we offer.",
    ),
    (
        "Julie compara productos de emisión simplificada con las compañías que Mejor Vida ofrece.",
        "Mejor Vida Seguros compara productos de emisión simplificada con las compañías que ofrece.",
    ),
    (
        "Do not assume — Julie reviews your situation and looks for the best available path.",
        "Do not assume — Mejor Vida Insurance reviews your situation and looks for the best available path.",
    ),
    (
        "Lo importante es no asumir: Julie revisa su caso concreto y busca la mejor opción disponible.",
        "Lo importante es no asumir: Mejor Vida Seguros revisa su caso concreto y busca la mejor opción disponible.",
    ),
    (
        "or call Julie at",
        "or call Mejor Vida Insurance at",
    ),
    (
        "o llame a Julie al",
        "o llame a Mejor Vida Seguros al",
    ),
    (
        "<summary>Which states does Julie serve?</summary>",
        "<summary>Where is Mejor Vida licensed?</summary>",
    ),
    (
        "<summary>¿En qué estados atiende Julie?</summary>",
        "<summary>¿Dónde tiene licencia Mejor Vida Seguros?</summary>",
    ),
    (
        "<p>Nebraska, Kansas, Colorado, and Nevada. <a href=\"licenses.html\">View licenses</a>.</p>",
        "<p>Current licensed states are listed on the <a href=\"licenses.html\">licenses</a> page.</p>",
    ),
    (
        "Julie reviews your health answers",
        "Mejor Vida Insurance reviews your health answers",
    ),
    (
        "Julie explains which path fits",
        "Mejor Vida Insurance explains which path fits",
    ),
    (
        "Free quote. Julie compares options based on your age, health, and budget.",
        "Free quote. Mejor Vida Insurance compares options based on your age, health, and budget.",
    ),
    (
        "Julie atiende Nebraska, Kansas, Colorado y Nevada.",
        "Los estados con licencia actuales están en la página de licencias.",
    ),
    (
        "Julie is licensed in Nebraska, Kansas, Colorado, and Nevada. She",
        "Mejor Vida Insurance",
    ),
    (
        "Julie Braunsroth está autorizada para vender seguros en Nebraska, Kansas, Colorado y Nevada (NPN #21695431).",
        "Julie Braunsroth es agente de seguros (NPN #21695431). Los estados con licencia actuales están en la página de licencias.",
    ),
    (
        "Julie Braunsroth es agente de seguros con licencia en Nebraska, Kansas, Colorado y Nevada (NPN #21695431).",
        "Julie Braunsroth es agente de seguros (NPN #21695431).",
    ),
    (
        "Julie Braunsroth is authorized to offer and sell life insurance in <strong>Nebraska, Kansas, Colorado, and Nevada</strong>.",
        "Julie Braunsroth is a licensed insurance agent. Current states are listed below.",
    ),
    (
        "Julie is authorized to offer and sell life insurance and annuities in <strong>Nebraska, Kansas, Colorado, and Nevada</strong>. If you live elsewhere, we connect you with a licensed agent in your state.",
        "Mejor Vida Insurance is authorized to offer and sell life insurance and annuities where licensed. Current states are on the licenses page. If you live elsewhere, we can still help with a referral when appropriate.",
    ),
    (
        "Julie está autorizada para ofrecer y vender seguros de vida y anualidades en <strong>Nebraska, Kansas, Colorado y Nevada</strong>. Si vive en otro estado, le conectamos con un agente licenciado allí.",
        "Mejor Vida Seguros está autorizada para ofrecer y vender seguros de vida y anualidades donde tiene licencia. Los estados actuales están en la página de licencias. Si vive en otro estado, podemos ayudarle con una referencia cuando corresponda.",
    ),
    (
        "Julie cotiza en Nebraska, Kansas, Colorado y Nevada. Si vive en otro estado, elija «Otro estado».",
        "Si vive en un estado donde todavía no tenemos licencia, elija «Otro estado».",
    ),
    (
        "Agente de seguros licenciada en Nebraska, Kansas, Colorado y Nevada",
        "Agente de seguros licenciada",
    ),
    (
        "agencia con licencia en Nebraska, Kansas, Colorado y Nevada.",
        "agencia independiente.",
    ),
    (
        "atendemos a clientes en Nebraska, Kansas, Colorado y Nevada. ",
        "",
    ),
    (
        "we serve clients in Nebraska, Kansas, Colorado, and Nevada. ",
        "",
    ),
    (
        "Licensed in Nebraska, Kansas, Colorado, and Nevada. NPN",
        "NPN",
    ),
    (
        "Licenciada en Nebraska, Kansas, Colorado y Nevada. NPN",
        "NPN",
    ),
    (
        "Julie is a licensed insurance agent in Nebraska, Kansas, Colorado, and Nevada. NPN",
        "Julie is a licensed insurance agent. NPN",
    ),
    (
        "Julie es una agente de seguros licenciada en Nebraska, Kansas, Colorado y Nevada. NPN",
        "Julie es una agente de seguros licenciada. NPN",
    ),
    (
        "a licensed insurance agent in Nebraska, Kansas, Colorado, and Nevada",
        "a licensed insurance agent",
    ),
    (
        "agente de seguros licenciada en Nebraska, Kansas, Colorado y Nevada",
        "agente de seguros licenciada",
    ),
    (
        "agente de seguros con licencia en Nebraska, Kansas, Colorado y Nevada",
        "agente de seguros",
    ),
    (
        "licensed insurance agent in Nebraska, Kansas, Colorado, and Nevada",
        "licensed insurance agent",
    ),
    (
        " in Nebraska, Kansas, Colorado, and Nevada",
        "",
    ),
    (
        " en Nebraska, Kansas, Colorado y Nevada",
        "",
    ),
    (
        "Nebraska, Kansas, Colorado, and Nevada",
        "",
    ),
    (
        "Nebraska, Kansas, Colorado y Nevada",
        "",
    ),
    (
        "Julie compares options based on your age, health, and budget.",
        "Mejor Vida Insurance compares options based on your age, health, and budget.",
    ),
    (
        "Julie compares coverage and pricing across companies",
        "Mejor Vida Insurance compares coverage and pricing across companies",
    ),
    (
        "After you complete the quote form and Julie reviews your information",
        "After you complete the quote form and Mejor Vida Insurance reviews your information",
    ),
    (
        "Julie can prepare",
        "Mejor Vida Insurance can prepare",
    ),
    (
        "Julie can run",
        "Mejor Vida Insurance can run",
    ),
    (
        "Julie can compare",
        "Mejor Vida Insurance can compare",
    ),
    (
        "cotizar</a> con Julie",
        "cotizar</a> con Mejor Vida Seguros",
    ),
    (
        "get a quote</a> with Julie",
        "get a quote</a> with Mejor Vida Insurance",
    ),
    (
        "Get a quote with Julie.",
        "Get a quote with Mejor Vida Insurance.",
    ),
    (
        "Cotice con Julie.",
        "Cotice con Mejor Vida Seguros.",
    ),
]


def should_skip(path: Path) -> bool:
    if path.resolve() in {p.resolve() for p in SKIP_FILES}:
        return True
    parts = set(path.parts)
    if parts & SKIP_DIRS:
        return True
    if "backup" in path.as_posix().lower() or "legacy" in path.as_posix().lower():
        return True
    return False


def protect(text: str) -> tuple[str, list[str]]:
    """Park strings we must not rewrite."""
    tokens: list[str] = []

    def stash(s: str) -> str:
        tokens.append(s)
        return f"@@KEEP{len(tokens) - 1}@@"

    # mailto and author meta / bylines
    import re

    text = re.sub(
        r"mailto:Julie@mejorvidainsurance\.com",
        lambda m: stash(m.group(0)),
        text,
    )
    text = re.sub(
        r"Julie Braunsroth",
        lambda m: stash(m.group(0)),
        text,
    )
    text = re.sub(
        r'aria-label="[^"]*Julie[^"]*"',
        lambda m: stash(m.group(0)),
        text,
        flags=re.I,
    )
    text = re.sub(
        r">Julie is a licensed insurance agent\. NPN",
        lambda m: stash(m.group(0)),
        text,
    )
    text = re.sub(
        r">Julie es una agente de seguros licenciada\. NPN",
        lambda m: stash(m.group(0)),
        text,
    )
    return text, tokens


def restore(text: str, tokens: list[str]) -> str:
    for i, s in enumerate(tokens):
        text = text.replace(f"@@KEEP{i}@@", s)
    return text


def clean_empty_bits(text: str) -> str:
    # Tidy leftover punctuation from deleted state lists
    replacements = [
        (" in .", "."),
        (" en .", "."),
        ("  ", " "),
        (" ,", ","),
        ("..</", ".</"),
        ("options..", "options."),
        ('content="', 'content="'),
    ]
    for a, b in replacements:
        text = text.replace(a, b)
    return text


def process(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    text, tokens = protect(original)
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    text = clean_empty_bits(text)
    text = restore(text, tokens)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> int:
    changed = 0
    for path in ROOT.rglob("*.html"):
        if should_skip(path):
            continue
        try:
            if process(path):
                print(path.relative_to(ROOT))
                changed += 1
        except Exception as e:
            print(f"FAIL {path}: {e}")
            return 1
    print(f"updated {changed} html files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
