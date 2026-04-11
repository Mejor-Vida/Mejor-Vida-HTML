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


def publish_post(message: str, image_url: Optional[str] = None) -> dict:
    """
    Publish a post to the Facebook Page.

    Args:
        message: The post caption/text
        image_url: Optional URL of image to attach. If provided, uses /photos endpoint.

    Returns:
        API response dict with post id, etc.

    Raises:
        requests.HTTPError: If the API returns an error
    """
    config = _load_config()
    page_id = config["page_id"]
    token = config["page_access_token"]
    base = "https://graph.facebook.com/v21.0"

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


def publish_post_package(
    package: FacebookPostPackage,
    image_url: Optional[str] = None,
    *,
    post_first_comment: bool = True,
    first_comment_delay_sec: int = 600,
) -> dict[str, Any]:
    """
    Publish main_caption (+ optional image), then optionally the first follow-up comment with link.

    By default the first comment waits **first_comment_delay_sec** (600 = 10 minutes) so the main
    post can gain reach before the link appears. Uses a background thread; keep the process running
    until the delay elapses (non-daemon thread).

    Aligns with facebook-post-rules.md (link in comment, not main caption).
    """
    result: dict[str, Any] = dict(publish_post(package.main_caption, image_url=image_url))
    pid = _graph_post_id(result)
    if not (post_first_comment and pid and package.first_comment.strip()):
        return result

    if first_comment_delay_sec <= 0:
        try:
            result["first_comment_response"] = post_comment(pid, package.first_comment)
        except Exception as e:
            result["first_comment_error"] = str(e)
        return result

    def _delayed() -> None:
        try:
            time.sleep(first_comment_delay_sec)
            post_comment(pid, package.first_comment)
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
