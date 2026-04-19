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
    blog_url: str,
    *,
    whatsapp_url: str | None = None,
    language: str = "es",
) -> str:
    """
    First comment after the main post (~10 min): article link + optional WhatsApp line.
    Facebook does not render HTML buttons in comments; use a wa.me URL (clickable).
    """
    u = blog_url.strip()
    w = (whatsapp_url or "").strip()
    if language == "en":
        lines = ["If you want to read the full article, here it is:", u]
        if w:
            lines.extend(["", "If you'd rather walk through it with us directly, message us here:", w])
        return "\n".join(lines)
    lines = ["Si quieres leer el artículo completo, aquí te lo dejo:", u]
    if w:
        lines.extend(
            ["", "Si prefieres que lo veamos contigo directamente, mándanos mensaje aquí:", w]
        )
    return "\n".join(lines)


_URL_RE = re.compile(r"https?://[^\s]+", re.IGNORECASE)


def main_caption_has_url(text: str) -> bool:
    return bool(_URL_RE.search(text or ""))


def warn_if_main_has_url(main_caption: str) -> None:
    if main_caption_has_url(main_caption):
        print(
            "Warning: main_caption appears to contain a URL. "
            "facebook-post-rules.md: put the blog link in first_comment only.",
            file=sys.stderr,
        )
