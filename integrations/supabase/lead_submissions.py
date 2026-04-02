"""Quote form leads in Supabase: staged insert → quote update → CRM sync update."""

from __future__ import annotations

import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_root = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_root))

from integrations.supabase.config import get_database_url  # noqa: E402
from integrations.supabase.db_pool import get_pool  # noqa: E402

try:
    import psycopg
    from psycopg.types.json import Json
except ImportError:
    psycopg = None  # type: ignore
    Json = None  # type: ignore


def _require_psycopg() -> None:
    if psycopg is None or Json is None:
        raise RuntimeError("psycopg required: pip install psycopg[binary]")


def _consent_from_validated(v: dict[str, Any]) -> dict[str, Any]:
    return {
        "email": bool(v.get("consentEmail")),
        "call": bool(v.get("consentCall")),
        "text": bool(v.get("consentText")),
        "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def insert_quote_lead_draft(raw_request: dict[str, Any], v: dict[str, Any]) -> str:
    """
    Persist lead immediately after validation (quote_requested).
    Returns new row id (uuid string).
    """
    _require_psycopg()
    dsn = get_database_url()
    if not dsn:
        raise RuntimeError("DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD not set")

    consent = _consent_from_validated(v)
    payload_obj: dict[str, Any] = {k: val for k, val in v.items() if k != "consentSummary"}

    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO quote_lead_submissions (
                  source, first_name, last_name, email, phone,
                  age, gender, coverage, tobacco, state_code, zip, lang,
                  health_condition, health_other, quote_summary,
                  consent_summary, payload, request_raw,
                  quote_status, crm_sync_needed
                ) VALUES (
                  %s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s, %s, %s,
                  %s, %s, %s,
                  %s, %s, %s,
                  'quote_requested', true
                )
                RETURNING id::text
                """,
                (
                    str(v.get("source") or "website_quote_form")[:200],
                    (v.get("firstName") or "")[:200] or None,
                    (v.get("lastName") or "")[:200] or None,
                    (v.get("email") or "")[:320] or None,
                    (v.get("phone") or "")[:40] or None,
                    v.get("age"),
                    (v.get("gender") or "")[:20] or None,
                    v.get("coverage"),
                    (v.get("tobacco") or "")[:20] or None,
                    (v.get("state") or "")[:2] or None,
                    (v.get("zip") or "")[:20] or None,
                    (v.get("lang") or "")[:10] or None,
                    (v.get("healthCondition") or "")[:100] or None,
                    (v.get("healthConditionOther") or "")[:500] or None,
                    None,
                    Json(consent),
                    Json(payload_obj),
                    Json(raw_request),
                ),
            )
            row = cur.fetchone()
        conn.commit()
    if not row:
        raise RuntimeError("insert_quote_lead_draft: no id returned")
    return str(row[0])


def update_quote_lead_after_quote(
    lead_id: str,
    *,
    quote_summary: str | None,
    carriers_result: list[dict[str, Any]] | None,
    quote_grid_source: str | None,
    quote_status: str,
    quote_error: str | None,
) -> None:
    """After rate math: quote_generated or quote_failed."""
    _require_psycopg()
    dsn = get_database_url()
    if not dsn:
        raise RuntimeError("DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD not set")

    gen_at: datetime | None = (
        datetime.now(timezone.utc) if quote_status == "quote_generated" else None
    )

    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE quote_lead_submissions SET
                  quote_summary = %s,
                  carriers_result = %s,
                  quote_grid_source = %s,
                  quote_status = %s,
                  quote_error = %s,
                  quote_generated_at = %s
                WHERE id = %s::uuid
                """,
                (
                    (quote_summary or "")[:20000] or None,
                    Json(carriers_result) if carriers_result is not None else None,
                    (quote_grid_source or "")[:50] or None,
                    quote_status[:50],
                    (quote_error or "")[:2000] or None,
                    gen_at,
                    lead_id,
                ),
            )
        conn.commit()


def update_quote_lead_hubspot_sync(
    lead_id: str,
    *,
    hubspot_contact_id: str | None,
    hubspot_sync_status: str,
    hubspot_sync_error: str | None,
    crm_sync_needed: bool,
) -> None:
    _require_psycopg()
    dsn = get_database_url()
    if not dsn:
        raise RuntimeError("DATABASE_URL or SUPABASE_URL + SUPABASE_DB_PASSWORD not set")

    with get_pool().connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE quote_lead_submissions SET
                  hubspot_contact_id = %s,
                  hubspot_sync_status = %s,
                  hubspot_sync_error = %s,
                  hubspot_last_sync_at = now(),
                  crm_sync_needed = %s
                WHERE id = %s::uuid
                """,
                (
                    (hubspot_contact_id or "")[:80] or None,
                    hubspot_sync_status[:40],
                    (hubspot_sync_error or "")[:2000] or None,
                    crm_sync_needed,
                    lead_id,
                ),
            )
        conn.commit()
