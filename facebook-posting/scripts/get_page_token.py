#!/usr/bin/env python3
"""
get_page_token.py — Obtain a long-lived Facebook Page access token.

Run this once whenever you need to refresh your token.

Three-step exchange:
  1. Take a short-lived User token (from Graph API Explorer, lasts ~1 hour)
  2. Exchange it for a long-lived User token (~60 days)
  3. Pull the Page access token for your Page (never expires while your
     user has the app authorized)

Usage:
    cd facebook-posting
    python3 scripts/get_page_token.py

Required env vars (in facebook-posting/.env or parent .env.local):
    FACEBOOK_APP_ID
    FACEBOOK_APP_SECRET
    FACEBOOK_SHORT_LIVED_USER_TOKEN   ← paste fresh token from Graph API Explorer
    FACEBOOK_PAGE_ID                  ← numeric Page ID

Output:
    Prints the Page access token. Paste it into .env as:
        FACEBOOK_PAGE_ACCESS_TOKEN=<token>
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


# ── Load .env files (same logic as publish_facebook.py) ───────────────────
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


_load_dotenv_files()

GRAPH = "https://graph.facebook.com/v21.0"


# ── Helpers ────────────────────────────────────────────────────────────────
def _get(url: str, params: dict) -> dict:
    query = urllib.parse.urlencode(params)
    with urllib.request.urlopen(f"{url}?{query}", context=get_ssl_context()) as r:
        return json.loads(r.read())


def _die(msg: str) -> None:
    print(f"\n❌  {msg}", file=sys.stderr)
    sys.exit(1)


# ── Config ─────────────────────────────────────────────────────────────────
APP_ID       = os.environ.get("FACEBOOK_APP_ID", "").strip()
APP_SECRET   = os.environ.get("FACEBOOK_APP_SECRET", "").strip()
SHORT_TOKEN  = os.environ.get("FACEBOOK_SHORT_LIVED_USER_TOKEN", "").strip()
PAGE_ID      = os.environ.get("FACEBOOK_PAGE_ID", "").strip()

if not APP_ID:
    _die(
        "FACEBOOK_APP_ID is not set.\n"
        "  Add it to facebook-posting/.env  (find it at developers.facebook.com → your app → App ID)"
    )
if not APP_SECRET:
    _die(
        "FACEBOOK_APP_SECRET is not set.\n"
        "  Add it to facebook-posting/.env  (App Dashboard → Settings → Basic → App Secret)"
    )
if not SHORT_TOKEN:
    _die(
        "FACEBOOK_SHORT_LIVED_USER_TOKEN is not set.\n\n"
        "  How to get one:\n"
        "  1. Go to https://developers.facebook.com/tools/explorer/\n"
        "  2. Select your App from the dropdown (top-right)\n"
        "  3. Click 'Generate Access Token'\n"
        "  4. In the permissions dialog add:\n"
        "       pages_manage_posts\n"
        "       pages_read_engagement\n"
        "       pages_show_list\n"
        "  5. Authorize — copy the 'User Token' shown\n"
        "  6. Add to facebook-posting/.env:\n"
        "       FACEBOOK_SHORT_LIVED_USER_TOKEN=<paste here>\n"
        "  Then re-run this script."
    )
if not PAGE_ID:
    _die(
        "FACEBOOK_PAGE_ID is not set.\n"
        "  Add it to facebook-posting/.env\n"
        "  (Facebook Page → About → Page ID  — it's a long number)"
    )

print("=" * 60)

# ── Step 1: short-lived User token → long-lived User token ────────────────
print("Step 1/3  Short-lived → long-lived User token…")
try:
    data = _get(f"{GRAPH}/oauth/access_token", {
        "grant_type":        "fb_exchange_token",
        "client_id":         APP_ID,
        "client_secret":     APP_SECRET,
        "fb_exchange_token": SHORT_TOKEN,
    })
except Exception as exc:
    _die(f"Network error during token exchange: {exc}")

if "error" in data:
    e = data["error"]
    _die(
        f"Meta error {e.get('code')} (subcode {e.get('error_subcode')}):\n"
        f"  {e.get('message')}\n\n"
        "  Common causes:\n"
        "  • Wrong App ID or App Secret\n"
        "  • Short-lived token already expired (get a fresh one from Graph API Explorer)\n"
        "  • App is in Development mode and the token owner isn't a test user/admin"
    )

long_user_token = data["access_token"]
print(f"  ✓ Long-lived User token obtained (expires in ~{data.get('expires_in', '?')}s ≈ 60 days)\n")

# ── Step 2: list pages the user manages ───────────────────────────────────
print("Step 2/3  Fetching Pages this user administers…")
try:
    pages_resp = _get(f"{GRAPH}/me/accounts", {
        "access_token": long_user_token,
        "fields": "id,name,access_token",
    })
except Exception as exc:
    _die(f"Network error fetching /me/accounts: {exc}")

if "error" in pages_resp:
    e = pages_resp["error"]
    _die(
        f"Meta error {e.get('code')}: {e.get('message')}\n"
        "  Make sure your User token has the 'pages_show_list' permission."
    )

pages = pages_resp.get("data", [])
if not pages:
    _die(
        "No Pages found for this user.\n"
        "  • Make sure you are an Admin (not Editor) of the Facebook Page.\n"
        "  • Make sure 'pages_show_list' permission was granted.\n"
        "  • If the app is in Development mode, make sure your account is a test user or admin."
    )

print(f"  Found {len(pages)} page(s):\n")
matched_token = None
for p in pages:
    marker = "  ← TARGET" if p["id"] == PAGE_ID else ""
    print(f"    [{p['id']}]  {p['name']}{marker}")
    if p["id"] == PAGE_ID:
        matched_token = p["access_token"]

# ── Step 3: extract and display the Page token ────────────────────────────
print()
if matched_token is None:
    listed = ", ".join(p["id"] for p in pages)
    _die(
        f"Page ID {PAGE_ID!r} not in the list above (found: {listed}).\n"
        "  • Verify FACEBOOK_PAGE_ID is the numeric ID (not the page username).\n"
        "  • Make sure the authenticated user is an Admin of that page."
    )

print("Step 3/3  Verifying Page token via debug_token…")
try:
    dbg = _get(f"{GRAPH}/debug_token", {
        "input_token":  matched_token,
        "access_token": f"{APP_ID}|{APP_SECRET}",
    })
    info = dbg.get("data", {})
    is_valid = info.get("is_valid", False)
    token_type = info.get("type", "?")
    expires_at = info.get("expires_at", 0)
    scopes = info.get("scopes", [])

    status = "✓ valid" if is_valid else "✗ INVALID"
    print(f"  is_valid   : {status}")
    print(f"  type       : {token_type}")
    print(f"  expires_at : {expires_at} (0 = never)")
    print(f"  scopes     : {', '.join(scopes) if scopes else '(none returned)'}")

    required = {"pages_manage_posts"}
    missing = required - set(scopes)
    if missing:
        print(f"\n  ⚠️  Missing scope(s): {', '.join(missing)}")
        print("     → In Graph API Explorer, add these permissions and regenerate the User token.")
except Exception:
    print("  (debug_token skipped — token obtained, but could not verify automatically)")

# ── Print the result ───────────────────────────────────────────────────────
print()
print("=" * 60)
print("✅  Page access token ready. Add this line to facebook-posting/.env:")
print()
print(f"FACEBOOK_PAGE_ACCESS_TOKEN={matched_token}")
print()
print("⚠️   NEVER commit .env to git. It is already in .gitignore.")
print("=" * 60)
