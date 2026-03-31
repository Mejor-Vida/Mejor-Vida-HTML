#!/usr/bin/env python3
"""
Google Sheets API client for Mejor Vida Insurance.
Supports both OAuth (Desktop app) and Service Account auth.
"""

import json
import os
from pathlib import Path
from typing import Any, List, Optional

# Load .env.local from project root
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

# OAuth token stored here after first login (so you don't re-login every time)
_AUTH_TOKEN_PATH = Path(__file__).resolve().parent / "authorized_user.json"


def get_client():
    """
    Return authenticated gspread client.
    Supports:
    - OAuth Desktop app JSON (client_id + client_secret) — first run opens browser to log in
    - Service Account JSON — no login, share sheet with service account email
    """
    import gspread
    path = os.environ.get("GOOGLE_SHEETS_CREDENTIALS")
    if not path or not Path(path).exists():
        raise RuntimeError(
            "Set GOOGLE_SHEETS_CREDENTIALS to your OAuth or Service Account JSON path. "
            "See integrations/google_sheets/README.md for setup."
        )

    with open(path, encoding="utf-8") as f:
        creds = json.load(f)

    # OAuth Desktop app format (has "installed" with client_id, client_secret)
    if "installed" in creds:
        return gspread.oauth(
            credentials_filename=path,
            authorized_user_filename=str(_AUTH_TOKEN_PATH),
        )

    # Service Account format (has "type": "service_account")
    if creds.get("type") == "service_account":
        return gspread.service_account(path)

    raise RuntimeError(
        f"Unknown credential format in {path}. "
        "Need OAuth Desktop app JSON (with 'installed') or Service Account JSON (with 'type': 'service_account')."
    )


def get_ai_knowledge_spreadsheet_id() -> str:
    """
    Spreadsheet that holds ManyChat / WhatsApp insurance Q&A only.
    Use this (or read_all_records_ai_knowledge) for AI product answers — not the leads workbook.
    """
    sid = os.environ.get("GOOGLE_SHEETS_AI_KNOWLEDGE_SPREADSHEET_ID")
    if not sid or not str(sid).strip():
        raise RuntimeError(
            "Set GOOGLE_SHEETS_AI_KNOWLEDGE_SPREADSHEET_ID in .env.local "
            "(WhatsApp / ManyChat Q&A workbook)."
        )
    return str(sid).strip()


def read_all_records_ai_knowledge(sheet_name: Optional[str] = None) -> List[dict]:
    """Read records from the AI knowledge spreadsheet only (env: GOOGLE_SHEETS_AI_KNOWLEDGE_SPREADSHEET_ID)."""
    return read_all_records(spreadsheet_id=get_ai_knowledge_spreadsheet_id(), sheet_name=sheet_name)


def open_sheet(spreadsheet_id: Optional[str] = None, sheet_name: Optional[str] = None):
    """
    Open a sheet by ID. Uses GOOGLE_SHEETS_SPREADSHEET_ID from env if not passed.

    Returns the worksheet. Use sheet_name for a specific tab (e.g. "Lead List", rate tables).
    """
    client = get_client()
    sid = spreadsheet_id or os.environ.get("GOOGLE_SHEETS_SPREADSHEET_ID")
    if not sid:
        raise RuntimeError("Set GOOGLE_SHEETS_SPREADSHEET_ID or pass spreadsheet_id.")
    spreadsheet = client.open_by_key(sid)
    if sheet_name:
        return spreadsheet.worksheet(sheet_name)
    return spreadsheet.sheet1


def read_all_records(spreadsheet_id: Optional[str] = None, sheet_name: Optional[str] = None) -> List[dict]:
    """
    Read sheet as list of dicts (first row = headers).
    Perfect for lead lists: [{"First Name": "Justin", "Last Name": "Braunsroth", ...}, ...]
    """
    sheet = open_sheet(spreadsheet_id=spreadsheet_id, sheet_name=sheet_name)
    return sheet.get_all_records()


def append_row(
    row: List[Any],
    spreadsheet_id: Optional[str] = None,
    sheet_name: Optional[str] = None,
) -> dict:
    """Append a row to the sheet. Returns the API response."""
    sheet = open_sheet(spreadsheet_id=spreadsheet_id, sheet_name=sheet_name)
    return sheet.append_row(row, value_input_option="USER_ENTERED")


def main() -> int:
    """Test connection: read and print first 5 rows."""
    try:
        # Default leads tab; override with GOOGLE_SHEETS_TAB (required if leads are not on "Lead List")
        sheet_name = os.environ.get("GOOGLE_SHEETS_TAB") or "Lead List"
        records = read_all_records(sheet_name=sheet_name)
        print(f"Connected. Found {len(records)} rows.")
        for i, row in enumerate(records[:5]):
            print(f"  {i + 1}: {row}")
        return 0
    except Exception as e:
        err = str(e)
        print(f"Error: {err}", flush=True)
        if "404" in err:
            print("\n  → Check GOOGLE_SHEETS_SPREADSHEET_ID in .env.local", flush=True)
            print("  → Get it from your sheet URL: docs.google.com/spreadsheets/d/[THIS_PART]/edit", flush=True)
            print("  → Make sure you're logged in with the account that owns the sheet.", flush=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
