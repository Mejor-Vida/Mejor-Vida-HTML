"""
Structured Facebook post content aligned with ../facebook-post-rules.md (repo root).
Main caption must not contain the blog URL; link belongs in first_comment.
First comment may include blog URL + optional WhatsApp link (plain URL; FB comments are text-only).
"""
from __future__ import annotations

import json
import os
import re
import sys
from dataclasses import asdict, dataclass
from pathlib import Path

MVI_WEBSITE_URL = "https://www.mejorvidainsurance.com/"


@dataclass(frozen=True)
class FacebookPostPackage:
    """Full weekly deliverable: main post text, follow-up, alternates, routing hints."""

    main_caption: str
    alternate_caption: str
    first_comment: str
    image_prompt: str
    manychat_keywords: tuple[str, ...] = ("INFO", "REVISAR")
    pinned_comment: str | None = None


def package_to_dict(p: FacebookPostPackage) -> dict:
    d = asdict(p)
    d["manychat_keywords"] = list(p.manychat_keywords)
    return d


def resolve_whatsapp_url(facebook_posting_root: Path) -> str | None:
    """
    WhatsApp link for the first comment (wa.me or api.whatsapp.com).
    Env MVS_WHATSAPP_FIRST_COMMENT_URL overrides config/settings.json whatsapp_first_comment_url.
    """
    env = os.environ.get("MVS_WHATSAPP_FIRST_COMMENT_URL", "").strip()
    if env:
        return env
    cfg_path = facebook_posting_root / "config" / "settings.json"
    if not cfg_path.is_file():
        return None
    try:
        cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
        w = (cfg.get("whatsapp_first_comment_url") or "").strip()
        return w or None
    except (OSError, json.JSONDecodeError, TypeError):
        return None


def default_first_comment_with_link(
    blog_url: str = "",
    *,
    website_url: str | None = None,
    whatsapp_url: str | None = None,
    language: str = "es",
) -> str:
    """
    First comment after the main post (~10 min): warm intro + website link + optional WhatsApp.

    ``blog_url`` is ignored for the comment link (article goes via INFO/REVISAR). Use
    ``warm_first_comment`` when you have post-specific highlight text (tool, law, etc.).
    """
    _ = blog_url  # package metadata only; first comment links to site, not blog
    return warm_first_comment(
        website_url or MVI_WEBSITE_URL,
        post_hook="Si quieres profundizar en el tema de esta semana",
        whatsapp_url=whatsapp_url,
        language=language,
    )


def warm_first_comment(
    website_url: str,
    *,
    post_hook: str,
    highlight_paragraph: str = "",
    whatsapp_url: str | None = None,
    language: str = "es",
    phone_display: str = "(402) 440-5438",
) -> str:
    """
    Warm, on-brand first comment: thanks + post-specific hook + optional highlight + website link + contact.

    ``highlight_paragraph``: one or two sentences unique to this post (NAIC tool, state law, etc.).
    ``post_hook``: short phrase tying the comment to the main post topic.
    """
    u = (website_url or MVI_WEBSITE_URL).strip()
    w = (whatsapp_url or "").strip()
    if language == "en":
        lines = [
            "Thanks for your interest!",
            "",
            f"{post_hook}, visit our website:",
            u,
        ]
        if (highlight_paragraph or "").strip():
            lines.extend(["", highlight_paragraph.strip()])
        lines.extend(
            [
                "",
                "At Mejor Vida Insurance we specialize in final expense insurance, and we can also "
                "help you with term and whole life insurance. Questions or a free quote? Call, text, "
                f"or WhatsApp us at {phone_display}. We're here to help.",
            ]
        )
        if w:
            lines.extend(["", "WhatsApp:", w])
        return "\n".join(lines)

    lines = [
        "¡Gracias por tu interés!",
        "",
        f"{post_hook}, conoce más en nuestro sitio web:",
        u,
    ]
    if (highlight_paragraph or "").strip():
        lines.extend(["", highlight_paragraph.strip()])
    lines.extend(
        [
            "",
            "En Mejor Vida Insurance nos especializamos en seguros de gastos finales, pero también "
            "podemos ayudarte con seguro de vida a término y seguro de vida entera. ¿Tienes preguntas "
            f"o quieres una cotización sin costo? Llámanos, envíanos un mensaje de texto o escríbenos por WhatsApp al {phone_display}. "
            "Estamos aquí para ayudarte.",
        ]
    )
    if w:
        lines.extend(["", "WhatsApp:", w])
    return "\n".join(lines)


_URL_RE = re.compile(r"https?://[^\s]+", re.IGNORECASE)


def main_caption_has_url(text: str) -> bool:
    return bool(_URL_RE.search(text or ""))


def warn_if_main_has_url(main_caption: str) -> None:
    if main_caption_has_url(main_caption):
        print(
            "Warning: main_caption appears to contain a URL. "
            "facebook-post-rules.md: put links in first_comment only (website), not in main_caption.",
            file=sys.stderr,
        )
