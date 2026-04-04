#!/usr/bin/env python3
"""
Provision HubSpot for final-expense sales: deal pipeline + a small set of custom properties.

Loads HUBSPOT_ACCESS_TOKEN from the environment. If not set, tries each line in repo .env.local.

HubSpot: Development → Legacy apps → Private app → Scopes.

Minimum scopes (use "Find a scope" search; deal pipelines often have NO separate
crm.pipelines.deals line — deal pipeline API access is covered by deals + schemas):
  - crm.objects.deals.read
  - crm.objects.deals.write
  - crm.schemas.contacts.read
  - crm.schemas.contacts.write
  - crm.schemas.deals.read
  - crm.schemas.deals.write

Optional: if your picker lists pipeline scopes for deals, add them; many portals
only show crm.pipelines.orders.* (commerce) — you can ignore those for this script.

Note: Creating an extra deal pipeline (beyond your plan limit) returns an error; use HubSpot UI
to edit the default pipeline or upgrade. This script skips creation if a pipeline named
"Final expense" already exists.

Usage:
  cd /path/to/Mejor-Vida-HTML
  pip install -r integrations/hubspot/requirements.txt
  python3 integrations/hubspot/setup_hubspot_fe.py
  python3 integrations/hubspot/setup_hubspot_fe.py --dry-run
  python3 integrations/hubspot/setup_hubspot_fe.py --pipeline-only
  python3 integrations/hubspot/setup_hubspot_fe.py --properties-only
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any

import requests

_REPO_ROOT = Path(__file__).resolve().parents[2]
_API = "https://api.hubapi.com"

_PIPELINE_LABEL = "Final expense"

# (label, probability string, is_closed) — open stages must not be closed; won/lost are closed.
_FE_STAGES: list[tuple[str, str, bool]] = [
    ("New", "0.10", False),
    ("Contact / needs", "0.20", False),
    ("Quote shared", "0.35", False),
    ("Application started", "0.55", False),
    ("With carrier", "0.75", False),
    ("Placed", "1.0", True),  # closed won
    ("Closed lost", "0.0", True),  # closed lost
]

_CONTACT_PROPERTIES: list[dict[str, Any]] = [
    {
        "name": "mvs_fe_lead_source",
        "label": "FE lead source",
        "groupName": "contactinformation",
        "type": "enumeration",
        "fieldType": "select",
        "options": [
            {"label": "Facebook", "value": "facebook"},
            {"label": "Referral", "value": "referral"},
            {"label": "Website", "value": "website"},
            {"label": "Inbound call", "value": "inbound_call"},
            {"label": "Other", "value": "other"},
        ],
    },
    {
        "name": "mvs_fe_tobacco",
        "label": "Tobacco / nicotine (FE)",
        "groupName": "contactinformation",
        "type": "enumeration",
        "fieldType": "select",
        "options": [
            {"label": "Yes", "value": "yes"},
            {"label": "No", "value": "no"},
            {"label": "Unknown", "value": "unknown"},
        ],
    },
]

_DEAL_PROPERTIES: list[dict[str, Any]] = [
    {
        "name": "mvs_fe_quoted_carrier",
        "label": "Quoted carrier / product (FE)",
        "groupName": "dealinformation",
        "type": "string",
        "fieldType": "text",
    },
    {
        "name": "mvs_fe_face_amount",
        "label": "Face amount discussed",
        "groupName": "dealinformation",
        "type": "number",
        "fieldType": "number",
    },
    {
        "name": "mvs_fe_monthly_premium",
        "label": "Monthly premium quoted",
        "groupName": "dealinformation",
        "type": "number",
        "fieldType": "number",
    },
]


def _load_env_local() -> None:
    path = _REPO_ROOT / ".env.local"
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key, val = key.strip(), val.strip().strip('"').strip("'")
        # Always apply .env.local so an empty shell var cannot block the token.
        if key:
            os.environ[key] = val


def _headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def _stage_payload(label: str, probability: str, is_closed: bool, display_order: int) -> dict[str, Any]:
    return {
        "label": label,
        "displayOrder": display_order,
        "metadata": {
            "probability": probability,
            "isClosed": "true" if is_closed else "false",
        },
    }


def _list_deal_pipelines(token: str) -> list[dict[str, Any]]:
    r = requests.get(
        f"{_API}/crm/v3/pipelines/deals",
        headers=_headers(token),
        timeout=60,
    )
    r.raise_for_status()
    data = r.json()
    return list(data.get("results", []))


def _create_pipeline(token: str, dry_run: bool) -> None:
    existing = _list_deal_pipelines(token)
    for p in existing:
        if p.get("label") == _PIPELINE_LABEL:
            print(f"Pipeline already exists: {_PIPELINE_LABEL!r} (id={p.get('id')}) — skipping.")
            return

    body: dict[str, Any] = {
        "label": _PIPELINE_LABEL,
        "displayOrder": 1,
        "stages": [
            _stage_payload(lbl, prob, closed, i)
            for i, (lbl, prob, closed) in enumerate(_FE_STAGES)
        ],
    }
    if dry_run:
        print("[dry-run] POST /crm/v3/pipelines/deals")
        print(json.dumps(body, indent=2))
        return

    r = requests.post(
        f"{_API}/crm/v3/pipelines/deals",
        headers=_headers(token),
        json=body,
        timeout=60,
    )
    if not r.ok:
        try:
            err = r.json()
            if err.get("category") == "API_LIMIT" and "pipeline" in (err.get("message") or "").lower():
                print(
                    "HubSpot allows only 1 deal pipeline on your current plan — cannot add "
                    f"{_PIPELINE_LABEL!r} as a second pipeline.\n"
                    "Rename or edit your existing deal pipeline in HubSpot: "
                    "Settings → Data management → Objects → Deals → Pipelines, "
                    "and match the stages you want (or upgrade for multiple pipelines).\n"
                    "Continuing with custom properties only.",
                    file=sys.stderr,
                )
                return
        except (ValueError, TypeError):
            pass
        print(r.text, file=sys.stderr)
        r.raise_for_status()
    out = r.json()
    print(f"Created pipeline {_PIPELINE_LABEL!r} id={out.get('id')}")


def _ensure_property(token: str, object_type: str, spec: dict[str, Any], dry_run: bool) -> None:
    name = spec["name"]
    r = requests.get(
        f"{_API}/crm/v3/properties/{object_type}/{name}",
        headers=_headers(token),
        timeout=60,
    )
    if r.status_code == 200:
        print(f"Property {object_type}.{name} already exists — skipping.")
        return
    if r.status_code != 404:
        r.raise_for_status()

    if dry_run:
        print(f"[dry-run] POST /crm/v3/properties/{object_type} name={name}")
        print(json.dumps(spec, indent=2))
        return

    r = requests.post(
        f"{_API}/crm/v3/properties/{object_type}",
        headers=_headers(token),
        json=spec,
        timeout=60,
    )
    if r.status_code == 409:
        print(f"Property {object_type}.{name} already exists (409) — skipping.")
        return
    if not r.ok:
        print(r.text, file=sys.stderr)
        r.raise_for_status()
    print(f"Created property {object_type}.{name}")


def main() -> None:
    parser = argparse.ArgumentParser(description="HubSpot FE pipeline + properties bootstrap")
    parser.add_argument("--dry-run", action="store_true", help="Print actions without calling API")
    parser.add_argument("--pipeline-only", action="store_true")
    parser.add_argument("--properties-only", action="store_true")
    args = parser.parse_args()

    _load_env_local()
    token = (os.environ.get("HUBSPOT_ACCESS_TOKEN") or "").strip()
    token = token.replace("\r", "").replace("\n", "").strip()
    if not token:
        print(
            "Set HUBSPOT_ACCESS_TOKEN (Private App token) in the environment or in .env.local",
            file=sys.stderr,
        )
        sys.exit(1)

    do_pipeline = not args.properties_only
    do_properties = not args.pipeline_only
    if args.pipeline_only and args.properties_only:
        print("Use only one of --pipeline-only / --properties-only, or neither.", file=sys.stderr)
        sys.exit(1)

    if do_pipeline:
        _create_pipeline(token, args.dry_run)

    if do_properties:
        for spec in _CONTACT_PROPERTIES:
            _ensure_property(token, "contacts", spec, args.dry_run)
        for spec in _DEAL_PROPERTIES:
            _ensure_property(token, "deals", spec, args.dry_run)


if __name__ == "__main__":
    try:
        main()
    except requests.HTTPError as e:
        r = e.response
        if r is not None and r.status_code == 401:
            print(
                "HubSpot returned 401 Unauthorized. Check that HUBSPOT_ACCESS_TOKEN is the "
                "Private App access token (not OAuth client secret), has no spaces or line breaks, "
                "and that the app is still active.",
                file=sys.stderr,
            )
        if r is not None and r.text:
            print(r.text, file=sys.stderr)
        sys.exit(1)
