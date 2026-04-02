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
    """Prefer DATABASE_URL; else build from SUPABASE_URL + SUPABASE_DB_PASSWORD.

    Default uses the Supabase *session pooler* (aws-0-<region>.pooler.supabase.com:5432,
    user postgres.<project_ref>) so hosts that cannot reach IPv6 (e.g. some Railway
    runtimes) can still connect. Direct db.<ref>.supabase.co often resolves to IPv6 first.

    Set SUPABASE_USE_DIRECT_DB=1 to force db.<ref>.supabase.co:5432 (postgres user).
    Set SUPABASE_POOLER_REGION (or SUPABASE_REGION) if not us-west-2.
    """
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
    use_direct = os.environ.get("SUPABASE_USE_DIRECT_DB", "").strip().lower() in (
        "1",
        "true",
        "yes",
        "on",
    )
    if use_direct:
        built = f"postgresql://postgres:{enc}@db.{ref}.supabase.co:5432/postgres"
    else:
        region = (
            os.environ.get("SUPABASE_POOLER_REGION")
            or os.environ.get("SUPABASE_REGION")
            or "us-west-2"
        ).strip()
        pooler_user = f"postgres.{ref}"
        host = f"aws-0-{region}.pooler.supabase.com"
        built = (
            f"postgresql://{quote_plus(pooler_user, safe='')}:{enc}@{host}:5432/postgres"
        )
    return _append_ssl_and_timeout(built)


def get_service_role_key() -> str:
    return (
        (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY") or "")
        .strip()
    )
