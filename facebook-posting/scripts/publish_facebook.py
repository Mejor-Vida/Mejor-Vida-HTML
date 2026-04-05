#!/usr/bin/env python3
"""
Publish a Facebook post to a Facebook Page using the Meta Graph API.
Uses /photos when image_url is provided, otherwise /feed.
"""

import json
import os
from pathlib import Path
from typing import Optional

import certifi
import requests

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
