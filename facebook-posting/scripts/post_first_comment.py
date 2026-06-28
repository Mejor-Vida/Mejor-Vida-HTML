#!/usr/bin/env python3
"""Post the first comment from FB/post-package.json onto a Page post (Graph API).

Use when the main post published but the first comment failed (e.g. missing
pages_manage_engagement on the Page token).

Examples:
  cd facebook-posting
  python3 scripts/post_first_comment.py
  python3 scripts/post_first_comment.py --post-id PAGEID_POSTID
  python3 scripts/post_first_comment.py --hook "455 personas acusadas"
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import certifi
import requests

_scripts = Path(__file__).resolve().parent
sys.path.insert(0, str(_scripts.parent))
from scripts.publish_facebook import _load_config, post_comment  # noqa: E402


def find_post(page_id: str, token: str, hook: str) -> dict | None:
    base = "https://graph.facebook.com/v21.0"
    resp = requests.get(
        f"{base}/{page_id}/posts",
        params={
            "access_token": token,
            "fields": "id,message,created_time",
            "limit": 15,
        },
        timeout=30,
        verify=certifi.where(),
    )
    resp.raise_for_status()
    posts = resp.json().get("data", [])
    hook_l = hook.lower()
    for p in posts:
        if hook_l in (p.get("message") or "").lower():
            return p
    return posts[0] if posts else None


def has_site_comment(post_id: str, token: str) -> bool:
    base = "https://graph.facebook.com/v21.0"
    resp = requests.get(
        f"{base}/{post_id}/comments",
        params={"access_token": token, "fields": "message", "limit": 10},
        timeout=30,
        verify=certifi.where(),
    )
    if not resp.ok:
        return False
    for c in resp.json().get("data", []):
        if "mejorvidainsurance.com" in (c.get("message") or "").lower():
            return True
    return False


def main() -> int:
    parser = argparse.ArgumentParser(description="Post first comment from post-package.json")
    parser.add_argument("--post-id", default="", help="Facebook post id (PAGEID_POSTID)")
    parser.add_argument(
        "--hook",
        default="455 personas acusadas",
        help="Match recent post by caption substring (default: June 28 DOJ post)",
    )
    parser.add_argument(
        "--package",
        default="",
        help="Path to post-package JSON (default: repo FB/post-package.json)",
    )
    args = parser.parse_args()

    repo = Path(__file__).resolve().parents[2]
    pkg_path = Path(args.package) if args.package else repo / "FB" / "post-package.json"
    if not pkg_path.is_file():
        print(f"Missing package: {pkg_path}", file=sys.stderr)
        return 1

    pkg = json.loads(pkg_path.read_text(encoding="utf-8"))
    comment = (pkg.get("first_comment") or "").strip()
    if not comment:
        print("Package has no first_comment text.", file=sys.stderr)
        return 1

    cfg = _load_config()
    page_id = cfg["page_id"]
    token = cfg["page_access_token"]

    post_id = args.post_id.strip()
    if post_id:
        target = {"id": post_id, "message": "(manual post id)"}
    else:
        target = find_post(page_id, token, args.hook)
        if not target:
            print("No matching post found on Page.", file=sys.stderr)
            return 1

    post_id = target["id"]
    print(f"Post: {post_id}")
    if target.get("created_time"):
        print(f"Created: {target['created_time']}")
    preview = (target.get("message") or "")[:100]
    if preview and preview != "(manual post id)":
        print(f"Caption: {preview}…")

    if has_site_comment(post_id, token):
        print("First comment with site link already exists — nothing to do.")
        return 0

    try:
        result = post_comment(post_id, comment)
    except requests.HTTPError as e:
        print(str(e), file=sys.stderr)
        return 1

    print(f"First comment posted: {result.get('id', result)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
