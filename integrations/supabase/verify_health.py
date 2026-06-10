#!/usr/bin/env python3
"""Verify Supabase schema + REST access after advisor migrations.

  python3 integrations/supabase/verify_health.py

Loads .env.local via integrations.supabase.config (no secrets printed).
Exit 0 = all checks passed; exit 1 = one or more failures.
"""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_root))

from integrations.supabase.config import get_database_url  # noqa: E402

try:
    import psycopg
except ImportError:
    print("FAIL: install psycopg (pip install -r integrations/supabase/requirements.txt)")
    raise SystemExit(1)


def load_env_local() -> None:
    env = _root / ".env.local"
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v


def ok(msg: str) -> None:
    print(f"  OK  {msg}")


def fail(msg: str) -> None:
    print(f"  FAIL {msg}")
    failures.append(msg)


failures: list[str] = []


def rest_get(url: str, key: str, accept: str = "application/json") -> tuple[int, str]:
    req = urllib.request.Request(
        url,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Accept": accept,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return resp.status, resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace") if e.fp else ""
        return e.code, body


def check_sql(conn) -> None:
    print("\n[SQL] Schema & data checks")

    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT c.relname, c.relrowsecurity
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
              AND c.relname IN ('staff_reminders', 'contact_communications')
            ORDER BY c.relname
            """
        )
        for name, rls in cur.fetchall():
            if rls:
                ok(f"RLS enabled on {name}")
            else:
                fail(f"RLS disabled on {name}")

        cur.execute(
            """
            SELECT c.relname,
                   COALESCE(
                     (SELECT option_value
                      FROM pg_options_to_table(c.reloptions)
                      WHERE option_name = 'security_invoker'),
                     'off'
                   ) AS security_invoker
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public'
              AND c.relkind = 'v'
              AND c.relname IN ('unified_leads', 'quote_lead_funnel')
            ORDER BY c.relname
            """
        )
        for name, invoker in cur.fetchall():
            if str(invoker).lower() in ("on", "true", "1"):
                ok(f"security_invoker=on on view {name}")
            else:
                fail(f"security_invoker not on for view {name} (got {invoker!r})")

        for idx in (
            "idx_nurture_contact_id",
            "idx_nurture_active_due",
            "idx_oos_referrals_email",
        ):
            cur.execute("SELECT to_regclass(%s)", (f"public.{idx}",))
            reg = cur.fetchone()[0]
            if reg is None:
                ok(f"duplicate index removed: {idx}")
            else:
                fail(f"duplicate index still exists: {idx}")

        checks = [
            ("unified_leads", "SELECT COUNT(*)::int FROM public.unified_leads"),
            ("quote_lead_funnel", "SELECT COUNT(*)::int FROM public.quote_lead_funnel"),
            ("staff_lead_profiles", "SELECT COUNT(*)::int FROM public.staff_lead_profiles"),
            ("contact_communications", "SELECT COUNT(*)::int FROM public.contact_communications"),
            ("staff_reminders", "SELECT COUNT(*)::int FROM public.staff_reminders"),
        ]
        for label, q in checks:
            cur.execute(q)
            n = cur.fetchone()[0]
            ok(f"{label} query returned {n} row(s)")

        cur.execute("SELECT COUNT(*)::int FROM public.unified_leads_rows()")
        n = cur.fetchone()[0]
        ok(f"unified_leads_rows() returned {n} row(s)")

        cur.execute(
            """
            SELECT COUNT(*)::int
            FROM public.unified_leads u
            WHERE u.email IS NOT NULL OR u.phone IS NOT NULL
            """
        )
        n = cur.fetchone()[0]
        ok(f"unified_leads with email or phone: {n}")


def check_rest() -> None:
    print("\n[REST] PostgREST access checks")
    base = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
    service = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        or os.environ.get("SUPABASE_SERVICE_KEY")
        or ""
    ).strip()
    anon = (os.environ.get("SUPABASE_ANON_KEY") or "").strip()

    if not base or not service:
        fail("SUPABASE_URL or service role key missing — skipping REST checks")
        return

    status, body = rest_get(
        f"{base}/rest/v1/unified_leads?select=id,display_name&limit=3",
        service,
    )
    if status == 200:
        rows = json.loads(body or "[]")
        ok(f"service role unified_leads → HTTP {status}, {len(rows)} sample row(s)")
    else:
        fail(f"service role unified_leads → HTTP {status}: {body[:200]}")

    status, body = rest_get(
        f"{base}/rest/v1/staff_lead_profiles?select=id&limit=1",
        service,
    )
    if status == 200:
        ok(f"service role staff_lead_profiles → HTTP {status}")
    else:
        fail(f"service role staff_lead_profiles → HTTP {status}: {body[:200]}")

    if not anon:
        print("  SKIP anon key tests (SUPABASE_ANON_KEY not set)")
        return

    status, body = rest_get(
        f"{base}/rest/v1/staff_lead_profiles?select=id&limit=1",
        anon,
    )
    if status == 200:
        rows = json.loads(body or "[]")
        if len(rows) == 0:
            ok("anon staff_lead_profiles → empty (RLS blocking as expected)")
        else:
            fail(f"anon staff_lead_profiles returned {len(rows)} row(s) — should be blocked")
    else:
        ok(f"anon staff_lead_profiles → HTTP {status} (blocked)")

    status, body = rest_get(
        f"{base}/rest/v1/unified_leads?select=id&limit=1",
        anon,
    )
    if status == 200:
        rows = json.loads(body or "[]")
        if len(rows) == 0:
            ok("anon unified_leads → empty (security_invoker + RLS as expected)")
        else:
            fail(f"anon unified_leads returned {len(rows)} row(s) — should be blocked")
    else:
        ok(f"anon unified_leads → HTTP {status} (blocked)")


def main() -> int:
    load_env_local()
    dsn = get_database_url()
    if not dsn:
        print("FAIL: set DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD in .env.local")
        return 1

    print("Supabase health verification")
    try:
        with psycopg.connect(dsn, connect_timeout=20) as conn:
            conn.autocommit = True
            check_sql(conn)
    except Exception as e:
        fail(f"database connection/query: {e}")

    try:
        check_rest()
    except Exception as e:
        fail(f"REST checks: {e}")

    print()
    if failures:
        print(f"FAILED ({len(failures)} issue(s)):")
        for f in failures:
            print(f"  - {f}")
        return 1

    print("All checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
