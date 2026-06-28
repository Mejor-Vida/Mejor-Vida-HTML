#!/usr/bin/env python3
"""
diagnose_token.py — Verify your Facebook Page access token before publishing.

Run this any time publishing fails with a Meta error (especially code 190).

Usage:
    cd facebook-posting
    python3 scripts/diagnose_token.py

Reads credentials from the same .env files as publish_facebook.py.
No arguments needed — just make sure your .env is set up.
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

_scripts_dir = Path(__file__).resolve().parent
if str(_scripts_dir) not in sys.path:
    sys.path.insert(0, str(_scripts_dir))

from ssl_context import get_ssl_context


# ── Load .env files (mirrors publish_facebook.py logic) ───────────────────
def _load_dotenv_files() -> None:
    try:
        from dotenv import load_dotenv
    except ImportError:
        return
    fb_root = Path(__file__).resolve().parents[1]
    repo_root = fb_root.parent
    for base in (repo_root, fb_root):
        for name in (".env.local", ".env"):
            p = base / name
            if p.is_file():
                load_dotenv(p, override=False)
                print(f"  Loaded env: {p}")


print("=" * 60)
print("Facebook Token Diagnostics")
print("=" * 60)
print()
print("Loading .env files…")
_load_dotenv_files()
print()

GRAPH = "https://graph.facebook.com/v21.0"

TOKEN   = os.environ.get("FACEBOOK_PAGE_ACCESS_TOKEN", "").strip()
PAGE_ID = os.environ.get("FACEBOOK_PAGE_ID", "").strip()
APP_ID  = os.environ.get("FACEBOOK_APP_ID", "").strip()
APP_SECRET = os.environ.get("FACEBOOK_APP_SECRET", "").strip()

# Also check settings.json fallback
config_path = Path(__file__).resolve().parents[1] / "config" / "settings.json"
if config_path.exists():
    cfg = json.loads(config_path.read_text())
    if not TOKEN:
        TOKEN = cfg.get("page_access_token", "")
    if not PAGE_ID:
        PAGE_ID = cfg.get("page_id", "")


def _get(url: str, params: dict) -> dict:
    query = urllib.parse.urlencode(params)
    with urllib.request.urlopen(f"{url}?{query}", context=get_ssl_context()) as r:
        return json.loads(r.read())


# ── 1. Check env vars are present ─────────────────────────────────────────
print("── 1. Credential presence ─────────────────────────────────────")
ok = True
for name, val in [
    ("FACEBOOK_PAGE_ACCESS_TOKEN", TOKEN),
    ("FACEBOOK_PAGE_ID", PAGE_ID),
]:
    if not val or val.startswith("YOUR_"):
        print(f"  ✗  {name} is NOT set (still a placeholder or missing)")
        ok = False
    else:
        masked = val[:6] + "…" + val[-4:] if len(val) > 12 else "***"
        print(f"  ✓  {name} = {masked}")

for name, val in [
    ("FACEBOOK_APP_ID", APP_ID),
    ("FACEBOOK_APP_SECRET", APP_SECRET),
]:
    if not val:
        print(f"  ⚠  {name} not set (optional for publishing, required for token refresh)")
    else:
        masked = val[:4] + "…" + val[-2:] if len(val) > 8 else "***"
        print(f"  ✓  {name} = {masked}")

print()
if not ok:
    print("❌  Credentials missing. Follow TOKEN_SETUP in README.md to get a Page token.")
    sys.exit(1)

# ── 2. debug_token ─────────────────────────────────────────────────────────
print("── 2. debug_token (token introspection) ───────────────────────")
if APP_ID and APP_SECRET:
    try:
        dbg = _get(f"{GRAPH}/debug_token", {
            "input_token":  TOKEN,
            "access_token": f"{APP_ID}|{APP_SECRET}",
        })
        info = dbg.get("data", {})
        is_valid  = info.get("is_valid", False)
        tok_type  = info.get("type", "?")
        app_id    = info.get("app_id", "?")
        user_id   = info.get("user_id", "?")
        expires   = info.get("expires_at", "?")
        scopes    = info.get("scopes", [])
        error     = info.get("error", {})

        validity = "✓ VALID" if is_valid else "✗ INVALID"
        print(f"  is_valid   : {validity}")
        print(f"  type       : {tok_type}  (should be 'PAGE')")
        print(f"  app_id     : {app_id}")
        print(f"  user_id    : {user_id}")
        print(f"  expires_at : {expires}  (0 = never, good for Page tokens)")
        print(f"  scopes     : {', '.join(scopes) if scopes else '(none)'}")

        if not is_valid:
            code = error.get("code", "?")
            sub  = error.get("subcode", "?")
            msg  = error.get("message", "?")
            print()
            print(f"  Error code {code} / subcode {sub}: {msg}")
            print()
            reasons = {
                190: "Token expired or revoked. Run get_page_token.py to get a new one.",
                463: "Token expired. Run get_page_token.py.",
                467: "Token invalid (wrong type or revoked). Run get_page_token.py.",
                460: "Password changed — all tokens invalidated. Run get_page_token.py.",
            }
            print(f"  Likely cause: {reasons.get(code, 'Unknown — check Meta error docs.')}")

        if tok_type != "PAGE":
            print()
            print("  ⚠️  Token type is not PAGE. You need a Page access token,")
            print("     not a User token. Run get_page_token.py to exchange it.")

        required = {"pages_manage_posts", "pages_manage_engagement"}
        missing = required - set(scopes)
        if missing:
            print()
            print(f"  ⚠️  Missing required scope(s): {', '.join(sorted(missing))}")
            print("     pages_manage_engagement is required to post first comments.")
            print("     In Graph API Explorer, add these and regenerate your User token,")
            print("     then run get_page_token.py again.")

    except Exception as exc:
        print(f"  Could not call debug_token: {exc}")
        print("  (This is fine — FACEBOOK_APP_ID/SECRET are optional for this check)")
else:
    print("  Skipped (FACEBOOK_APP_ID and FACEBOOK_APP_SECRET not set)")
    print("  To enable full introspection, add them to .env")

print()

# ── 3. GET /me ─────────────────────────────────────────────────────────────
print("── 3. GET /me  (basic token health check) ─────────────────────")
try:
    me = _get(f"{GRAPH}/me", {"access_token": TOKEN, "fields": "id,name"})
    if "error" in me:
        e = me["error"]
        print(f"  ✗  Error {e.get('code')}: {e.get('message')}")
        if e.get("code") == 190:
            print("  → Token is expired/invalid. Run scripts/get_page_token.py.")
    else:
        print(f"  ✓  id   = {me.get('id')}")
        print(f"  ✓  name = {me.get('name')}")
except Exception as exc:
    print(f"  ✗  Request failed: {exc}")

print()

# ── 4. Check posting permission on the Page ────────────────────────────────
print("── 4. GET /{page_id}  (confirm Page access) ────────────────────")
try:
    page = _get(f"{GRAPH}/{PAGE_ID}", {
        "access_token": TOKEN,
        "fields": "id,name,fan_count",
    })
    if "error" in page:
        e = page["error"]
        print(f"  ✗  Error {e.get('code')}: {e.get('message')}")
    else:
        print(f"  ✓  Page ID   = {page.get('id')}")
        print(f"  ✓  Page name = {page.get('name')}")
        fans = page.get("fan_count")
        if fans is not None:
            print(f"  ✓  Followers = {fans:,}")
except Exception as exc:
    print(f"  ✗  Request failed: {exc}")

print()
print("=" * 60)
print("Diagnostics complete. If all checks above show ✓, run:")
print("  python3 main.py --dry-run   (preview caption)")
print("  python3 main.py             (publish for real)")
print("=" * 60)
