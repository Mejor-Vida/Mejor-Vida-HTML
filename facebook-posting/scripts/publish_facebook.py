#!/usr/bin/env python3
"""
Publish a Facebook post to a Facebook Page using the Meta Graph API.
Uses /photos when image_url is provided, otherwise /feed.
"""

import json
import os
import sys
import threading
import time
from pathlib import Path
from typing import Any, Optional

import certifi
import requests

from scripts.facebook_post_package import FacebookPostPackage

_DOTENV_DONE = False


def _load_dotenv_files() -> None:
    """Load repo-root `.env.local` / `.env` and `facebook-posting/.env*` into os.environ (shell wins if set)."""
    global _DOTENV_DONE
    if _DOTENV_DONE:
        return
    try:
        from dotenv import load_dotenv
    except ImportError:
        _DOTENV_DONE = True
        return
    fb_root = Path(__file__).resolve().parents[1]
    repo_root = fb_root.parent
    for base in (repo_root, fb_root):
        for name in (".env.local", ".env"):
            path = base / name
            if path.is_file():
                load_dotenv(path, override=False)
    _DOTENV_DONE = True


def _load_config() -> dict:
    """Load config from settings.json; token/page ID may be overridden by env (safer for secrets)."""
    _load_dotenv_files()
    config_path = Path(__file__).resolve().parents[1] / "config" / "settings.json"
    config = json.loads(config_path.read_text(encoding="utf-8"))
    if os.environ.get("FACEBOOK_PAGE_ACCESS_TOKEN"):
        config["page_access_token"] = os.environ["FACEBOOK_PAGE_ACCESS_TOKEN"]
    if os.environ.get("FACEBOOK_PAGE_ID"):
        config["page_id"] = os.environ["FACEBOOK_PAGE_ID"]
    return config


def _mime_for_path(path: Path) -> str:
    suf = path.suffix.lower()
    if suf in (".jpg", ".jpeg"):
        return "image/jpeg"
    if suf == ".webp":
        return "image/webp"
    return "image/png"


def publish_post(
    message: str,
    image_url: Optional[str] = None,
    *,
    image_path: Optional[Path] = None,
) -> dict:
    """
    Publish a post to the Facebook Page.

    Args:
        message: The post caption/text
        image_url: Optional public URL of image to attach (Graph fetches it).
        image_path: Optional local image file; uploaded as multipart ``source`` (no public URL needed).

    Returns:
        API response dict with post id, etc.

    Raises:
        requests.HTTPError: If the API returns an error
    """
    config = _load_config()
    page_id = config["page_id"]
    token = config["page_access_token"]
    base = "https://graph.facebook.com/v21.0"

    if image_path is not None:
        path = Path(image_path)
        if not path.is_file():
            raise FileNotFoundError(f"Image file not found: {path}")
        url = f"{base}/{page_id}/photos"
        mime = _mime_for_path(path)
        with path.open("rb") as fp:
            files = {"source": (path.name, fp, mime)}
            data = {"message": message, "access_token": token}
            resp = requests.post(url, data=data, files=files, timeout=120, verify=certifi.where())
        if not resp.ok:
            snippet = (resp.text or "")[:800]
            raise requests.HTTPError(f"{resp.status_code} {resp.reason} — {snippet}", response=resp)
        return resp.json()

    if image_url:
        # Post as photo with caption
        url = f"{base}/{page_id}/photos"
        payload = {
            "message": message,
            "url": image_url,
            "access_token": token,
        }
    else:
        # Post as text-only to feed
        url = f"{base}/{page_id}/feed"
        payload = {
            "message": message,
            "access_token": token,
        }

    resp = requests.post(url, data=payload, timeout=30, verify=certifi.where())
    resp.raise_for_status()
    return resp.json()


def _graph_post_id(result: dict) -> Optional[str]:
    """Prefer post_id (photo story) else id (feed post)."""
    return result.get("post_id") or result.get("id")


def post_comment(post_id: str, message: str) -> dict:
    """Post a comment on a Page post or photo story (Graph API)."""
    config = _load_config()
    token = config["page_access_token"]
    base = "https://graph.facebook.com/v21.0"
    url = f"{base}/{post_id}/comments"
    payload = {"message": message, "access_token": token}
    resp = requests.post(url, data=payload, timeout=30, verify=certifi.where())
    resp.raise_for_status()
    return resp.json()


def resolve_make_first_comment_webhook_url(*, webhook_url: Optional[str] = None) -> str:
    """Make.com webhook that schedules the delayed first comment (~10 min)."""
    if webhook_url and webhook_url.strip():
        return webhook_url.strip()
    _load_dotenv_files()
    env_url = os.environ.get("MAKE_FB_FIRST_COMMENT_WEBHOOK_URL", "").strip()
    if env_url:
        return env_url
    config = _load_config()
    return str(config.get("make_first_comment_webhook_url") or "").strip()


def schedule_first_comment_via_make(
    post_id: str,
    comment: str,
    *,
    webhook_url: Optional[str] = None,
) -> dict[str, Any]:
    """
    Tell Make.com to post ``comment`` on ``post_id`` after its built-in delay (~10 minutes).

    Payload: ``{"post_id": "...", "comment": "..."}``
    """
    url = resolve_make_first_comment_webhook_url(webhook_url=webhook_url)
    if not url:
        raise ValueError(
            "Make first-comment webhook URL not configured "
            "(settings.json make_first_comment_webhook_url or MAKE_FB_FIRST_COMMENT_WEBHOOK_URL)"
        )
    payload = {"post_id": post_id, "comment": comment}
    resp = requests.post(
        url,
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=30,
        verify=certifi.where(),
    )
    if not resp.ok:
        snippet = (resp.text or "")[:800]
        raise requests.HTTPError(f"{resp.status_code} {resp.reason} — {snippet}", response=resp)
    try:
        body: dict[str, Any] = resp.json()
    except ValueError:
        body = {"status_code": resp.status_code, "text": (resp.text or "")[:500]}
    return body


def publish_post_package(
    package: FacebookPostPackage,
    image_url: Optional[str] = None,
    *,
    image_path: Optional[Path] = None,
    first_comment_mode: str = "make",
    first_comment_delay_sec: int = 600,
) -> dict[str, Any]:
    """
    Publish main_caption (+ optional image), then schedule/post the first follow-up comment.

    ``first_comment_mode``:
    - ``make`` (default): POST to Make.com webhook immediately; Make waits ~10 min then comments.
    - ``graph``: post comment via Graph API (optional delay via background thread).
    - ``none``: main post only.

    Aligns with facebook-post-rules.md (link in comment, not main caption).
    """
    result: dict[str, Any] = dict(
        publish_post(package.main_caption, image_url=image_url, image_path=image_path)
    )
    pid = _graph_post_id(result)
    comment = package.first_comment.strip()
    if first_comment_mode == "none" or not pid or not comment:
        return result

    if first_comment_mode == "make":
        try:
            result["make_first_comment_response"] = schedule_first_comment_via_make(pid, comment)
            result["make_first_comment_scheduled"] = True
            result["make_first_comment_post_id"] = pid
        except Exception as e:
            result["make_first_comment_error"] = str(e)
        return result

    if first_comment_mode != "graph":
        raise ValueError(f"Unknown first_comment_mode: {first_comment_mode!r}")

    if first_comment_delay_sec <= 0:
        try:
            result["first_comment_response"] = post_comment(pid, comment)
        except Exception as e:
            result["first_comment_error"] = str(e)
        return result

    def _delayed() -> None:
        try:
            time.sleep(first_comment_delay_sec)
            post_comment(pid, comment)
            print(
                f"First comment posted (after {first_comment_delay_sec}s delay).",
                flush=True,
            )
        except Exception as e:
            print(f"First comment failed: {e}", file=sys.stderr, flush=True)

    threading.Thread(target=_delayed, name="fb_first_comment_delay", daemon=False).start()
    result["first_comment_scheduled_in_sec"] = first_comment_delay_sec
    result["first_comment_post_id"] = pid
    return result
