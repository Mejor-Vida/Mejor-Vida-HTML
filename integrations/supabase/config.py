"""Load DATABASE_URL for Supabase Postgres (migrations + quote data)."""

from __future__ import annotations

import os
import re
from pathlib import Path
from urllib.parse import quote_plus

_root = Path(__file__).resolve().parents[2]
_env = _root / ".env.local"
if _env.exists():
    for line in _env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


def _append_ssl_and_timeout(url: str) -> str:
    """Supabase expects SSL; avoid hanging TCP connects with connect_timeout."""
    if re.search(r"sslmode\s*=", url, re.I):
        return url
    sep = "&" if "?" in url else "?"
    return f"{url}{sep}sslmode=require&connect_timeout=15"


def get_database_url() -> str | None:
    """Prefer DATABASE_URL; else build from SUPABASE_URL + SUPABASE_DB_PASSWORD."""
    direct = (os.environ.get("DATABASE_URL") or "").strip()
    if direct:
        return _append_ssl_and_timeout(direct)
    base = (os.environ.get("SUPABASE_URL") or "").strip().rstrip("/")
    pw = (os.environ.get("SUPABASE_DB_PASSWORD") or "").strip()
    if not base or not pw or "supabase.co" not in base:
        return None
    m = re.search(r"https://([a-z0-9]+)\.supabase\.co", base, re.I)
    if not m:
        return None
    ref = m.group(1)
    enc = quote_plus(pw, safe="")
    built = f"postgresql://postgres:{enc}@db.{ref}.supabase.co:5432/postgres"
    return _append_ssl_and_timeout(built)


def get_service_role_key() -> str:
    return (
        (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY") or "")
        .strip()
    )
