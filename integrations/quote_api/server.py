#!/usr/bin/env python3
"""
Website quote API: sheet-backed premiums, Lead List append, HubSpot contact, optional email.

Run from repo root:
  pip install -r integrations/quote_api/requirements.txt
  python3 integrations/quote_api/server.py --port 8765

Env (see .env.local or quote_api/README.md):
  GOOGLE_SHEETS_* , HUBSPOT_ACCESS_TOKEN
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
from integrations.google_sheets.quote_engine import (
    allowed_age_range,
    allowed_coverages,
    compute_carrier_quotes,
    load_rate_chart_rows,
)

_ROWS_CACHE: list[list[str]] | None = None
_ROWS_AT: float = 0.0
ROWS_TTL = 60.0

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
    global _ROWS_CACHE, _ROWS_AT
    now = time.time()
    if _ROWS_CACHE is None or now - _ROWS_AT > ROWS_TTL:
        _ROWS_CACHE = load_rate_chart_rows()
        _ROWS_AT = now
    return _ROWS_CACHE


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


def append_lead_list(data: dict[str, Any]) -> None:
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


def validate_body(o: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    first = str(o.get("firstName", "")).strip()
    last = str(o.get("lastName", "")).strip()
    email = str(o.get("email", "")).strip().lower()
    phone = re.sub(r"[^\d+]", "", str(o.get("phone", "")).strip())[:20]
    try:
        age = int(o.get("age"))
    except (TypeError, ValueError):
        return None, "invalid_age"
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
    lang = str(o.get("lang", "es")).strip().lower()[:2]
    if lang not in ("es", "en"):
        lang = "es"
    consent_email = bool(o.get("consentEmail"))
    consent_call = bool(o.get("consentCall"))
    consent_text = bool(o.get("consentText"))
    if not (consent_email and consent_call and consent_text):
        return None, "consent_all_required"

    rows = get_cached_rows()
    lo, hi = allowed_age_range(rows)
    if age < lo or age > hi:
        return None, f"age_out_of_range:{lo}-{hi}"
    allowed = allowed_coverages(rows)
    if coverage not in allowed:
        return None, "coverage_not_allowed"

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
        "source": "website_quote_tool",
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
        "El tabaco y la salud pueden cambiar la elegibilidad y la prima."
    )
    disclaimer_en = (
        "Approximate figures from internal charts; not an offer. "
        "Tobacco and health may change eligibility and premium."
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
    rows = get_cached_rows()
    carriers = compute_carrier_quotes(v["age"], v["gender"], v["coverage"], rows)
    q_text = format_quote_summary_lang(carriers, v["lang"])
    h_line = format_health_line(v, v["lang"])
    health_summary = (
        f"Salud (declarada): {h_line}" if v["lang"] == "es" else f"Health (declared): {h_line}"
    )
    q_full = q_text + "\n\n" + health_summary
    consent_blob = json.dumps(
        {
            "email": v["consentEmail"],
            "call": v["consentCall"],
            "text": v["consentText"],
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
    )
    lead_payload = {
        **v,
        "healthSummary": health_summary,
        "quoteSummary": q_full,
        "consentSummary": consent_blob,
    }

    lead_ok = True
    lead_err = ""
    try:
        append_lead_list(lead_payload)
    except Exception as e:
        lead_ok = False
        lead_err = str(e)[:500]

    hs_id, hs_status = hubspot_upsert_contact(v)

    schedule_url = (os.environ.get("MVS_SCHEDULE_CALL_URL") or "").strip()
    emailed = False
    if v["consentEmail"]:
        subj = (
            "Tu cotización — Mejor Vida Insurance"
            if v["lang"] == "es"
            else "Your quote — Mejor Vida Insurance"
        )
        html = html_email_body(v["firstName"], carriers, v["lang"], schedule_url, health_line=h_line)
        emailed = send_email_resend(v["email"], subj, html)

    return 200, {
        "ok": True,
        "carriers": carriers,
        "disclaimer": q_text.split("\n\n")[-1] if "\n\n" in q_text else "",
        "scheduleUrl": schedule_url or None,
        "leadSaved": lead_ok,
        "leadError": lead_err if not lead_ok else None,
        "hubspotContactId": hs_id,
        "hubspotStatus": hs_status,
        "emailSent": emailed,
    }


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
                rows = get_cached_rows()
                lo, hi = allowed_age_range(rows)
                cov = allowed_coverages(rows)
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
