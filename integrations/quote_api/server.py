#!/usr/bin/env python3
"""
Website quote API: Supabase-backed rate grids and lead capture; Google Sheets only for optional backup + manual import (`import_from_sheets.py`). HubSpot + optional email.

Run from repo root:
  pip install -r integrations/quote_api/requirements.txt
  python3 integrations/quote_api/server.py --port 8765

Env (see .env.local or quote_api/README.md):
  GOOGLE_SHEETS_* , HUBSPOT_ACCESS_TOKEN, DATABASE_URL (or SUPABASE_URL + SUPABASE_DB_PASSWORD),
  QUOTE_DATA_SOURCE=supabase|sheets|auto (default supabase; auto + QUOTE_ALLOW_SHEET_FALLBACK=1 for rare sheet fallback)
  LEAD_LIST_GOOGLE_SHEET_BACKUP — default on; set 0/false/no to skip mirroring Lead List to Sheets after Supabase insert
  Optional: RESEND_API_KEY, RESEND_FROM_EMAIL, MVS_SCHEDULE_CALL_URL,
            QUOTE_CORS_ORIGINS (comma-separated, or *),
            QUOTE_API_SHARED_SECRET (required if set — X-Quote-Secret header)

Front-end: set window.MVS_QUOTE_API to base URL (e.g. https://quotes.example.com).
GET /api/quote/options returns age/coverage limits for the form.
"""

from __future__ import annotations

import argparse
import json
import os
from datetime import date
import re
import sys
import time
import urllib.error
import urllib.request
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any

# Repo root
_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(_ROOT))

# Load .env.local
_env = _ROOT / ".env.local"
if _env.exists():
    for line in _env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            v = v.strip().strip('"').strip("'")
            if k and k not in os.environ:
                os.environ[k] = v

import requests

from integrations.google_sheets.client import open_sheet
from integrations.google_sheets.export_hero_carousel_quotes import (
    parse_assurity_protect_plus_base,
    parse_coverage_multiplier_examples,
)
from integrations.google_sheets.quote_engine import (
    allowed_age_range_combined,
    allowed_coverages_combined,
    compute_carrier_quotes_from_grids_by_carrier,
    load_rate_chart_rows,
)

_ROWS_CACHE: list[list[str]] | None = None
_ROWS_AT: float = 0.0
ROWS_TTL = 60.0

# Quote grids: carrier_slug -> (base by age, mults by face). Cached with source tag.
_GridByCarrier = dict[str, tuple[dict[int, tuple[float, float]], dict[int, tuple[float, float]]]]
_MooLpRates = dict[str, dict[tuple[int, str], dict[str, Any]]]
# (grids_by_carrier, moo_lp_rates or {}, source_label)
_GRID_BUNDLE: tuple[_GridByCarrier, _MooLpRates, str] | None = None
_GRID_AT: float = 0.0

# Website quote form: declared health (not used for automated underwriting in this tool).
HEALTH_CONDITIONS: frozenset[str] = frozenset(
    {
        "none",
        "diabetes",
        "hypertension",
        "heart_disease",
        "copd_lung",
        "stroke",
        "cancer",
        "kidney_disease",
        "liver_disease",
        "mental_health",
        "other",
    }
)

HEALTH_LABELS_ES: dict[str, str] = {
    "none": "Sin condiciones mayores declaradas",
    "diabetes": "Diabetes",
    "hypertension": "Presión arterial alta / hipertensión",
    "heart_disease": "Enfermedad cardíaca (infarto, IC, etc.)",
    "copd_lung": "EPOC / enfermedad pulmonar",
    "stroke": "Derrame cerebral / AIT",
    "cancer": "Cáncer (actual o en el pasado)",
    "kidney_disease": "Enfermedad renal",
    "liver_disease": "Enfermedad hepática",
    "mental_health": "Depresión / ansiedad (con tratamiento)",
    "other": "Otra condición",
}

# Coverage: fixed menu on website + optional "other" band (quotes still sheet-driven).
STANDARD_WEB_COVERAGES: frozenset[int] = frozenset(
    {2000, 5000, 10000, 15000, 20000, 25000, 30000, 40000, 50000}
)
COVERAGE_OTHER_MIN = 2_000
COVERAGE_OTHER_MAX = 150_000
# MoO Living Promise Level (NE): max face $50k on the quote tool (shared form).
LEVEL_MAX_COVERAGE = 50_000
# Living Promise Graded (NE): face cap $20k; issue ages typically 45–80 (confirm with carrier).
GRADED_MAX_COVERAGE = 20_000
GRADED_AGE_MIN = 45
GRADED_AGE_MAX = 80

# Shown on quote-results when API returns dual MoO rows (Level + Graded illustrative).
# U.S. states + DC — must match website state dropdown values.
VALID_US_STATE_CODES: frozenset[str] = frozenset(
    {
        "AL",
        "AK",
        "AZ",
        "AR",
        "CA",
        "CO",
        "CT",
        "DE",
        "DC",
        "FL",
        "GA",
        "HI",
        "ID",
        "IL",
        "IN",
        "IA",
        "KS",
        "KY",
        "LA",
        "ME",
        "MD",
        "MA",
        "MI",
        "MN",
        "MS",
        "MO",
        "MT",
        "NE",
        "NV",
        "NH",
        "NJ",
        "NM",
        "NY",
        "NC",
        "ND",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "VA",
        "WA",
        "WV",
        "WI",
        "WY",
    }
)

# Julie licensed for formal quotes in NE only; other states → referral path.
REFERRAL_OUT_OF_STATE_NOTE = {
    "en": (
        "Julie is licensed to provide formal life insurance quotes in Nebraska only. "
        "We saved your contact information—Julie will follow up and will do her best to help you find "
        "a licensed agent in your home state."
    ),
    "es": (
        "Julie está licenciada para ofrecer cotizaciones formales de seguro de vida solo en Nebraska. "
        "Guardamos su información de contacto—Julie dará seguimiento e intentará ayudarle a encontrar "
        "un agente licenciado en su estado."
    ),
}

MOO_LEVEL_GRADED_NOTE = {
    "en": (
        "This quick form cannot tell whether you will qualify for Level or Graded benefit—that is decided by the "
        "insurer’s application and health questions. Below you’ll see illustrative monthly premiums for both paths. "
        "Level: typically lower premium when you qualify on underwriting; higher face amounts (up to $50k NE here). "
        "Graded: simplified path; death benefit may be graded in the first policy years; lower face limits (often up to $20k). "
        "Julie confirms what you qualify for."
    ),
    "es": (
        "Este formulario no puede decir si calificará a beneficio Nivel o Graduado: lo determina la solicitud y las "
        "preguntas de salud con la aseguradora. Abajo verá primas mensuales ilustrativas para ambas opciones. "
        "Nivel: suele ser menor prima si califica en suscripción; montos mayores (hasta $50,000 NE aquí). "
        "Graduado: vía simplificada; el beneficio por muerte puede ser graduado en los primeros años; límites de monto menores "
        "(a menudo hasta $20,000). Julie confirma a qué califica."
    ),
}

HEALTH_LABELS_EN: dict[str, str] = {
    "none": "No major conditions declared",
    "diabetes": "Diabetes",
    "hypertension": "High blood pressure / hypertension",
    "heart_disease": "Heart disease (heart attack, CHF, etc.)",
    "copd_lung": "COPD / lung disease",
    "stroke": "Stroke / TIA",
    "cancer": "Cancer (current or past)",
    "kidney_disease": "Kidney disease",
    "liver_disease": "Liver disease",
    "mental_health": "Depression / anxiety (under treatment)",
    "other": "Other condition",
}


def get_cached_rows() -> list[list[str]]:
    """Sheet rows — only for import scripts or emergency QUOTE_ALLOW_SHEET_FALLBACK / QUOTE_DATA_SOURCE=sheets."""
    global _ROWS_CACHE, _ROWS_AT
    now = time.time()
    if _ROWS_CACHE is None or now - _ROWS_AT > ROWS_TTL:
        _ROWS_CACHE = load_rate_chart_rows()
        _ROWS_AT = now
    return _ROWS_CACHE


def _quote_data_source_mode() -> str:
    """auto | supabase | sheets — default supabase (no Sheet reads); auto + QUOTE_ALLOW_SHEET_FALLBACK for recovery."""
    return (os.environ.get("QUOTE_DATA_SOURCE") or "supabase").strip().lower()


def _quote_allow_sheet_fallback() -> bool:
    v = (os.environ.get("QUOTE_ALLOW_SHEET_FALLBACK") or "").strip().lower()
    return v in ("1", "true", "yes", "on")


def get_cached_quote_bundle() -> tuple[_GridByCarrier, _MooLpRates, str]:
    """
    Load Assurity multiplier grids + optional MoO LP base-rate tables.
    Sheets mode: Assurity from Carrier Rate Charts; MoO rates empty until imported to DB.
    Supabase: `load_quote_bundle_from_supabase` (Assurity + moo_living_promise_rates).
    """
    global _GRID_BUNDLE, _GRID_AT
    now = time.time()
    if _GRID_BUNDLE is not None and now - _GRID_AT <= ROWS_TTL:
        return _GRID_BUNDLE[0], _GRID_BUNDLE[1], _GRID_BUNDLE[2]

    mode = _quote_data_source_mode()
    grids_by_carrier: _GridByCarrier = {}
    moo_lp: _MooLpRates = {}
    source = "sheets"

    def _from_sheet() -> None:
        nonlocal grids_by_carrier
        rows = get_cached_rows()
        base = parse_assurity_protect_plus_base(rows)
        mults = parse_coverage_multiplier_examples(rows)
        if base and mults:
            grids_by_carrier = {"assurity": (base, mults)}

    if mode == "sheets":
        _from_sheet()
    elif mode == "supabase":
        from integrations.supabase.quote_data import load_quote_bundle_from_supabase

        grids_by_carrier, moo_lp = load_quote_bundle_from_supabase()
        source = "supabase"
    else:
        try:
            from integrations.supabase.quote_data import load_quote_bundle_from_supabase

            grids_by_carrier, moo_lp = load_quote_bundle_from_supabase()
            source = "supabase"
        except Exception as e:
            if _quote_allow_sheet_fallback():
                print(
                    f"[quote-api] Supabase bundle unavailable ({e!s}); "
                    "QUOTE_ALLOW_SHEET_FALLBACK=1 → using Google Sheet (Assurity only)."
                )
                _from_sheet()
                moo_lp = {}
                source = "sheets"
            else:
                raise

    _GRID_BUNDLE = (grids_by_carrier, moo_lp, source)
    _GRID_AT = now
    return grids_by_carrier, moo_lp, source


def get_cached_quote_grids() -> tuple[_GridByCarrier, str]:
    """Backward-compatible: (grids_by_carrier, source) without MoO tables."""
    g, _m, src = get_cached_quote_bundle()
    return g, src


def cors_headers(origin: str | None) -> dict[str, str]:
    allow = (os.environ.get("QUOTE_CORS_ORIGINS") or "*").strip()
    if allow == "*":
        ao = "*"
    else:
        parts = [x.strip() for x in allow.split(",") if x.strip()]
        ao = origin if origin and origin in parts else (parts[0] if len(parts) == 1 else "")
        if not ao and parts:
            ao = parts[0]
    h = {
        "Access-Control-Allow-Origin": ao or "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type, X-Quote-Secret",
        "Access-Control-Max-Age": "86400",
    }
    return h


def check_secret(handler_headers: dict[str, str]) -> bool:
    secret = os.environ.get("QUOTE_API_SHARED_SECRET", "").strip()
    if not secret:
        return True
    return handler_headers.get("X-Quote-Secret") == secret


def lead_list_row(headers: list[str], data: dict[str, Any]) -> list[Any]:
    """Map submitted data + quote blob onto Lead List header row."""

    def cell_for(h: str) -> str:
        hl = (h or "").strip().lower()
        if "first" in hl and "name" in hl and "last" not in hl and "spouse" not in hl:
            return str(data.get("firstName", ""))
        if "last" in hl and "name" in hl:
            return str(data.get("lastName", ""))
        if "email" in hl or "e-mail" in hl:
            return str(data.get("email", ""))
        if "phone" in hl or "mobile" in hl or hl in ("tel", "cell"):
            return str(data.get("phone", ""))
        if hl == "state" or hl.endswith(" state"):
            return str(data.get("state", ""))
        if ("lead" in hl and "id" in hl) or ("submission" in hl and "id" in hl):
            return str(data.get("leadId", ""))
        if "city" in hl:
            return str(data.get("city", ""))
        if "zip" in hl or "postal" in hl:
            return str(data.get("zip", ""))
        if "source" in hl and "utm" not in hl:
            return str(data.get("source", "website_quote_tool"))
        if "note" in hl or "comment" in hl or "message" in hl:
            return str(data.get("quoteSummary", ""))
        if "tobacco" in hl or "nicotine" in hl or "smoker" in hl:
            return str(data.get("tobacco", ""))
        if "coverage" in hl and "amount" in hl:
            return str(data.get("coverage", ""))
        if hl == "age" or hl.endswith(" age"):
            return str(data.get("age", ""))
        if "birth" in hl or "dob" in hl or ("fecha" in hl and "nac" in hl):
            return str(data.get("dateOfBirth", data.get("date_of_birth", "")))
        if "gender" in hl or "sex" in hl:
            return str(data.get("gender", ""))
        if "language" in hl or hl == "lang":
            return str(data.get("lang", ""))
        if "consent" in hl or "tcpa" in hl:
            return str(data.get("consentSummary", ""))
        if ("other" in hl or "specify" in hl or "detail" in hl) and (
            "health" in hl or "medical" in hl or "condition" in hl
        ):
            return str(data.get("healthConditionOther", ""))
        if "health" in hl or "medical" in hl or "condition" in hl:
            return str(data.get("healthSummary", data.get("healthCondition", "")))
        return ""

    return [cell_for(h) for h in headers]


def _lead_list_sheet_backup_enabled() -> bool:
    raw = (os.environ.get("LEAD_LIST_GOOGLE_SHEET_BACKUP") or "").strip().lower()
    if raw in ("0", "false", "no", "off"):
        return False
    return True


def append_lead_list_google_sheet_backup(data: dict[str, Any]) -> None:
    """Append one row to Lead List tab (backup mirror; failures are logged, not raised from persist)."""
    tab = os.environ.get("GOOGLE_SHEETS_TAB") or "Lead List"
    ws = open_sheet(sheet_name=tab)
    headers = ws.row_values(1)
    if not headers:
        raise RuntimeError("Lead List row 1 is empty — add headers first.")
    row = lead_list_row(headers, data)
    ws.append_row(row, value_input_option="USER_ENTERED")


def hubspot_upsert_contact(payload: dict[str, Any]) -> tuple[str | None, str]:
    token = (os.environ.get("HUBSPOT_ACCESS_TOKEN") or "").strip()
    if not token:
        return None, "skipped_no_token"

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    email = payload["email"]
    base_props = {
        "email": email,
        "firstname": (payload.get("firstName") or "")[:100],
        "lastname": (payload.get("lastName") or "")[:100],
        "phone": (payload.get("phone") or "").replace(" ", "")[:40],
    }
    if payload.get("state"):
        base_props["state"] = str(payload["state"])[:50]
    if payload.get("zip"):
        base_props["zip"] = str(payload["zip"])[:20]
    customs = {
        "mvs_fe_lead_source": "website",
        "mvs_fe_tobacco": "yes" if str(payload.get("tobacco", "")).lower() in ("yes", "y", "true", "1") else "no",
        "mvs_fe_health_condition": str(payload.get("healthCondition", ""))[:100],
        "mvs_fe_health_other": str(payload.get("healthConditionOther", ""))[:500],
    }
    props_attempts = [base_props, {**base_props, **customs}]

    search_body = {
        "filterGroups": [
            {"filters": [{"propertyName": "email", "operator": "EQ", "value": email}]}
        ],
        "properties": ["id"],
        "limit": 1,
    }
    r = requests.post(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        headers=headers,
        json=search_body,
        timeout=30,
    )
    if r.status_code != 200:
        return None, f"hubspot_search_{r.status_code}:{r.text[:200]}"

    results = r.json().get("results") or []
    cid = results[0]["id"] if results else None

    for props in props_attempts:
        if cid:
            pr = requests.patch(
                f"https://api.hubapi.com/crm/v3/objects/contacts/{cid}",
                headers=headers,
                json={"properties": props},
                timeout=30,
            )
            if pr.status_code in (200, 204):
                return str(cid), "updated"
            if pr.status_code == 400 and props is props_attempts[-1]:
                return None, f"hubspot_patch_400:{pr.text[:300]}"
        else:
            cr = requests.post(
                "https://api.hubapi.com/crm/v3/objects/contacts",
                headers=headers,
                json={"properties": props},
                timeout=30,
            )
            if cr.status_code in (200, 201):
                return str(cr.json().get("id", "")), "created"
            if cr.status_code == 409:
                continue
            if cr.status_code == 400 and props is props_attempts[-1]:
                return None, f"hubspot_create_400:{cr.text[:300]}"

    return None, "hubspot_failed"


def send_email_resend(to: str, subject: str, html: str) -> bool:
    key = (os.environ.get("RESEND_API_KEY") or "").strip()
    from_email = (os.environ.get("RESEND_FROM_EMAIL") or "").strip()
    if not key or not from_email:
        return False
    r = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={"from": from_email, "to": [to], "subject": subject, "html": html},
        timeout=30,
    )
    return r.status_code in (200, 201)


def format_health_line(v: dict[str, Any], lang: str) -> str:
    key = str(v.get("healthCondition", "none"))
    lab = (HEALTH_LABELS_ES if lang == "es" else HEALTH_LABELS_EN).get(key, key)
    oth = (v.get("healthConditionOther") or "").strip()
    if key == "other" and oth:
        return f"{lab}: {oth}"
    return f"{lab}"


def _age_from_birth(birth: date, today: date | None = None) -> int:
    t = today or date.today()
    return t.year - birth.year - ((t.month, t.day) < (birth.month, birth.day))


def validate_body(o: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    first = str(o.get("firstName", "")).strip()
    last = str(o.get("lastName", "")).strip()
    email = str(o.get("email", "")).strip().lower()
    phone = re.sub(r"[^\d+]", "", str(o.get("phone", "")).strip())[:20]

    dob_raw = str(o.get("dateOfBirth", "")).strip()
    date_of_birth: str | None = None
    age: int
    if dob_raw:
        try:
            birth = date.fromisoformat(dob_raw)
        except ValueError:
            return None, "invalid_date_of_birth"
        tday = date.today()
        if birth > tday:
            return None, "dob_future"
        if birth.year < tday.year - 120:
            return None, "invalid_date_of_birth"
        age = _age_from_birth(birth, tday)
        date_of_birth = dob_raw
    else:
        try:
            age = int(o.get("age"))
        except (TypeError, ValueError):
            return None, "dob_required"
    gender = str(o.get("gender", "")).strip().lower()
    if gender in ("f", "female", "femenino", "mujer"):
        gender = "female"
    elif gender in ("m", "male", "masculino", "hombre"):
        gender = "male"
    else:
        return None, "invalid_gender"
    try:
        coverage = int(o.get("coverage"))
    except (TypeError, ValueError):
        return None, "invalid_coverage"
    tobacco = str(o.get("tobacco", "no")).strip().lower()
    state = str(o.get("state", "")).strip().upper()[:2] or "NE"
    if state not in VALID_US_STATE_CODES:
        return None, "invalid_state"
    outside_licensed_state = state != "NE"
    lang = str(o.get("lang", "es")).strip().lower()[:2]
    if lang not in ("es", "en"):
        lang = "es"
    consent_email = bool(o.get("consentEmail"))
    consent_call = bool(o.get("consentCall"))
    consent_text = bool(o.get("consentText"))
    if not (consent_email and consent_call and consent_text):
        return None, "consent_all_required"

    benefit_plan_raw = str(o.get("benefitPlan", "level")).strip().lower()
    if benefit_plan_raw in ("graded", "level"):
        benefit_plan = benefit_plan_raw
    else:
        benefit_plan = "level"

    grids_g, moo_g, __ = get_cached_quote_bundle()
    lo, hi = allowed_age_range_combined(grids_g, moo_g)
    if age < lo or age > hi:
        return None, f"age_out_of_range:{lo}-{hi}"
    if coverage in STANDARD_WEB_COVERAGES:
        pass
    elif COVERAGE_OTHER_MIN <= coverage <= COVERAGE_OTHER_MAX:
        pass
    else:
        return None, "coverage_not_allowed"

    if benefit_plan == "level" and coverage > LEVEL_MAX_COVERAGE:
        return None, "level_coverage_max_50000"

    if benefit_plan == "graded":
        if coverage > GRADED_MAX_COVERAGE:
            return None, "graded_coverage_max_20000"
        if age < GRADED_AGE_MIN or age > GRADED_AGE_MAX:
            return None, f"graded_age_out_of_range:{GRADED_AGE_MIN}-{GRADED_AGE_MAX}"

    em = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not email or not re.match(em, email):
        return None, "invalid_email"
    if len(first) < 1 or len(last) < 1:
        return None, "name_required"
    if len(phone) < 10:
        return None, "phone_required"

    hc = str(o.get("healthCondition", "")).strip().lower()
    if not hc:
        return None, "health_condition_required"
    if hc not in HEALTH_CONDITIONS:
        return None, "invalid_health_condition"
    ho = str(o.get("healthConditionOther", "")).strip()[:500]
    if hc == "other" and len(ho) < 2:
        return None, "health_other_required"
    if hc != "other":
        ho = ""

    return {
        "firstName": first,
        "lastName": last,
        "email": email,
        "phone": phone,
        "age": age,
        "gender": gender,
        "coverage": coverage,
        "tobacco": tobacco,
        "state": state,
        "lang": lang,
        "consentEmail": consent_email,
        "consentCall": consent_call,
        "consentText": consent_text,
        "zip": str(o.get("zip", "")).strip()[:15],
        "healthCondition": hc,
        "healthConditionOther": ho,
        "benefitPlan": benefit_plan,
        "outsideLicensedState": outside_licensed_state,
        "source": "website_quote_form",
        **({"dateOfBirth": date_of_birth} if date_of_birth else {}),
    }, None


def format_quote_summary_lang(carriers: list[dict], lang: str) -> str:
    lines = []
    for c in carriers:
        if c.get("qualified") and c.get("monthly") is not None:
            lines.append(
                f"{c['carrierName']}: ${c['monthly']:.2f}/mo @ ${c.get('coverage', 0):,} (illustrative)"
            )
        else:
            reason = c.get("reason", "")
            lines.append(f"{c['carrierName']}: — ({reason})")
    disclaimer_es = (
        "Cifras aproximadas según tablas internas; no constituyen oferta. "
        "Nivel vs Graduado lo determina la solicitud y las preguntas de necesidades con la aseguradora, no una elección en esta cotización. "
        "Julie confirma el plan y la prima final."
    )
    disclaimer_en = (
        "Approximate figures from internal charts; not an offer. "
        "Level vs graded benefit is determined by the insurer’s application and needs questions—not a choice made in this quote. "
        "Julie confirms the plan and final premium."
    )
    return "\n".join(lines) + "\n\n" + (disclaimer_es if lang == "es" else disclaimer_en)


def html_email_body(
    first: str,
    carriers: list[dict],
    lang: str,
    schedule_url: str,
    health_line: str = "",
) -> str:
    summary = format_quote_summary_lang(carriers, lang).replace("\n", "<br>")
    hl = ""
    if health_line:
        if lang == "es":
            hl = f"<p><strong>Salud (declarada):</strong> {health_line}</p>"
        else:
            hl = f"<p><strong>Health (declared):</strong> {health_line}</p>"
    if lang == "es":
        hi = f"Hola {first},"
        sub = "Gracias por usar la herramienta de cotización de Mejor Vida Insurance."
        sched = f'<p><a href="{schedule_url}">Agendar una llamada con Julie</a></p>' if schedule_url else ""
        return f"<p>{hi}</p><p>{sub}</p>{hl}<p><strong>Tu cotización (referencia):</strong></p><p>{summary}</p>{sched}"
    hi = f"Hello {first},"
    sub = "Thank you for using the Mejor Vida Insurance quote tool."
    sched = f'<p><a href="{schedule_url}">Schedule a call with Julie</a></p>' if schedule_url else ""
    return f"<p>{hi}</p><p>{sub}</p>{hl}<p><strong>Your illustrative quote:</strong></p><p>{summary}</p>{sched}"


def referral_html_email(
    first: str,
    lang: str,
    schedule_url: str,
    health_line: str,
) -> str:
    """Out-of-state: no rate table email; referral messaging only."""
    body = REFERRAL_OUT_OF_STATE_NOTE["es"] if lang == "es" else REFERRAL_OUT_OF_STATE_NOTE["en"]
    hl = ""
    if health_line:
        if lang == "es":
            hl = f"<p><strong>Salud (declarada):</strong> {health_line}</p>"
        else:
            hl = f"<p><strong>Health (declared):</strong> {health_line}</p>"
    if lang == "es":
        hi = f"<p>Hola {first},</p>"
        sched = f'<p><a href="{schedule_url}">Agendar una llamada con Julie</a></p>' if schedule_url else ""
        return f"{hi}<p>{body}</p>{hl}{sched}"
    hi = f"<p>Hello {first},</p>"
    sched = f'<p><a href="{schedule_url}">Schedule a call with Julie</a></p>' if schedule_url else ""
    return f"{hi}<p>{body}</p>{hl}{sched}"


def handle_submit(body: bytes, client_headers: dict[str, str]) -> tuple[int, dict[str, Any]]:
    try:
        o = json.loads(body.decode("utf-8"))
    except json.JSONDecodeError:
        return 400, {"ok": False, "error": "invalid_json"}

    if not check_secret(client_headers):
        return 403, {"ok": False, "error": "forbidden"}

    v, err = validate_body(o)
    if err:
        return 400, {"ok": False, "error": err}

    assert v is not None
    from integrations.supabase.lead_submissions import (
        insert_quote_lead_draft,
        update_quote_lead_after_quote,
        update_quote_lead_hubspot_sync,
    )

    try:
        lead_id = insert_quote_lead_draft(o, v)
    except Exception as e:
        return 503, {"ok": False, "error": "lead_persist_failed", "detail": str(e)[:300]}

    grid_src = ""
    carriers: list[dict[str, Any]] = []
    quote_status = "quote_failed"
    quote_err: str | None = None
    q_text = ""
    q_full = ""
    h_line = format_health_line(v, v["lang"])
    health_summary = (
        f"Salud (declarada): {h_line}" if v["lang"] == "es" else f"Health (declared): {h_line}"
    )

    if v.get("outsideLicensedState"):
        referral_line = (
            REFERRAL_OUT_OF_STATE_NOTE["es"]
            if v["lang"] == "es"
            else REFERRAL_OUT_OF_STATE_NOTE["en"]
        )
        q_full = referral_line + "\n\n" + health_summary
        q_text = referral_line
        quote_status = "referral_out_of_state"
        quote_err = None
    else:
        try:
            grids_by_carrier, moo_lp, grid_src = get_cached_quote_bundle()
            carriers = compute_carrier_quotes_from_grids_by_carrier(
                v["age"],
                v["gender"],
                v["coverage"],
                grids_by_carrier,
                benefit_plan=v.get("benefitPlan") or "level",
                tobacco=str(v.get("tobacco") or "no"),
                moo_lp_rates=moo_lp or None,
                moo_dual_benefits=True,
            )
            q_text = format_quote_summary_lang(carriers, v["lang"])
            q_full = q_text + "\n\n" + health_summary
            quote_status = "quote_generated"
        except Exception as e:
            quote_err = str(e)[:2000]
            carriers = []

    try:
        update_quote_lead_after_quote(
            lead_id,
            quote_summary=q_full or None,
            carriers_result=carriers or None,
            quote_grid_source=grid_src or None,
            quote_status=quote_status,
            quote_error=quote_err,
        )
    except Exception as e:
        print(f"[quote-api] update_quote_lead_after_quote failed: {e}", file=sys.stderr)

    hs_id, hs_status = hubspot_upsert_contact(v)

    if hs_id:
        hss, crm_need, hse = "synced", False, None
    elif hs_status == "skipped_no_token":
        hss, crm_need, hse = "skipped", False, None
    else:
        hss, crm_need, hse = "failed", True, hs_status[:2000]

    try:
        update_quote_lead_hubspot_sync(
            lead_id,
            hubspot_contact_id=hs_id,
            hubspot_sync_status=hss,
            hubspot_sync_error=hse,
            crm_sync_needed=crm_need,
        )
    except Exception as e:
        print(f"[quote-api] update_quote_lead_hubspot_sync failed: {e}", file=sys.stderr)

    consent_blob = json.dumps(
        {
            "email": v["consentEmail"],
            "call": v["consentCall"],
            "text": v["consentText"],
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
    )
    lead_mirror = {
        **v,
        "leadId": lead_id,
        "healthSummary": health_summary,
        "quoteSummary": q_full,
        "consentSummary": consent_blob,
    }
    if _lead_list_sheet_backup_enabled():
        try:
            append_lead_list_google_sheet_backup(lead_mirror)
        except Exception as e:
            print(
                f"[quote-api] Lead List Google Sheet backup failed (Supabase OK): {e}",
                file=sys.stderr,
            )

    schedule_url = (os.environ.get("MVS_SCHEDULE_CALL_URL") or "").strip()
    emailed = False
    if v["consentEmail"]:
        if v.get("outsideLicensedState"):
            subj = (
                "Recibimos su solicitud — Mejor Vida Insurance"
                if v["lang"] == "es"
                else "We received your request — Mejor Vida Insurance"
            )
            html = referral_html_email(v["firstName"], v["lang"], schedule_url, health_line=h_line)
        else:
            subj = (
                "Tu cotización — Mejor Vida Insurance"
                if v["lang"] == "es"
                else "Your quote — Mejor Vida Insurance"
            )
            html = html_email_body(v["firstName"], carriers, v["lang"], schedule_url, health_line=h_line)
        emailed = send_email_resend(v["email"], subj, html)

    out: dict[str, Any] = {
        "ok": True,
        "leadId": lead_id,
        "quoteStatus": quote_status,
        "carriers": carriers,
        "disclaimer": q_text.split("\n\n")[-1] if "\n\n" in q_text else "",
        "scheduleUrl": schedule_url or None,
        "leadSaved": True,
        "leadError": None,
        "hubspotContactId": hs_id,
        "hubspotStatus": hs_status,
        "emailSent": emailed,
    }
    if quote_status == "quote_generated":
        out["mooLevelGradedNote"] = MOO_LEVEL_GRADED_NOTE
    if quote_status == "referral_out_of_state":
        out["referralOutOfStateNote"] = REFERRAL_OUT_OF_STATE_NOTE
    return 200, out


class Handler:
    def __init__(self, request, client_address, server):
        self.request = request
        self.client_address = client_address
        self.server = server

    def handle(self) -> None:
        from http.server import BaseHTTPRequestHandler

        # WSGI-style not used — subclass below
        pass


def run_server(port: int) -> None:
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class QuoteHandler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            print(f"[quote-api] {self.log_date_time_string()} {args[0]}")

        def _read_headers(self) -> dict[str, str]:
            return {k.lower(): v for k, v in self.headers.items()}

        def do_OPTIONS(self):
            origin = self.headers.get("Origin")
            ch = cors_headers(origin)
            self.send_response(204)
            for k, v in ch.items():
                self.send_header(k, v)
            self.end_headers()

        def do_GET(self):
            origin = self.headers.get("Origin")
            ch = cors_headers(origin)
            if self.path == "/api/quote/health":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                for k, v in ch.items():
                    self.send_header(k, v)
                body = json.dumps({"ok": True, "service": "mvs-quote-api"}).encode()
                self.end_headers()
                self.wfile.write(body)
                return
            if self.path in ("/api/quote/options", "/api/quote/options/"):
                grids_by_carrier, moo_lp, _src = get_cached_quote_bundle()
                lo, hi = allowed_age_range_combined(grids_by_carrier, moo_lp)
                cov = allowed_coverages_combined(grids_by_carrier, moo_lp)
                payload = {
                    "ok": True,
                    "ageMin": lo,
                    "ageMax": hi,
                    "coverages": cov,
                }
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                for k, v in ch.items():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))
                return
            self.send_error(404)

        def do_POST(self):
            origin = self.headers.get("Origin")
            ch = cors_headers(origin)
            if self.path not in ("/api/quote/submit", "/api/quote/submit/"):
                self.send_response(404)
                for k, v in ch.items():
                    self.send_header(k, v)
                self.end_headers()
                return
            n = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(n) if n else b"{}"
            code, payload = handle_submit(body, self._read_headers())
            self.send_response(code)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            for k, v in ch.items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))

    print(f"Quote API listening on http://127.0.0.1:{port}")
    print("  POST /api/quote/submit")
    print("  GET  /api/quote/health")
    print("  GET  /api/quote/options")
    HTTPServer(("", port), QuoteHandler).serve_forever()


def main() -> int:
    ap = argparse.ArgumentParser(description="Mejor Vida quote API server")
    ap.add_argument("--port", type=int, default=int(os.environ.get("QUOTE_API_PORT", "8765")))
    args = ap.parse_args()
    try:
        run_server(args.port)
    except KeyboardInterrupt:
        print("Stopped.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
