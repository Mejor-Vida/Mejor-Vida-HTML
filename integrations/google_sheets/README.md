# Google Sheets API — Mejor Vida Insurance

Connect to your Google Sheets (e.g. "Mejor Vida - WhatsApp Leads") via the Google Sheets API.

**Supports two auth methods:**
- **OAuth Desktop app** — Use if you can't create Service Account keys (e.g. restricted Workspace). First run opens a browser to log in.
- **Service Account** — No login needed. Share sheet with service account email.

---

## Setup: OAuth Desktop app (no admin required)

### 1. Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use existing)
3. Enable **Google Sheets API**: APIs & Services → Enable APIs → search "Google Sheets API" → Enable

### 2. Create OAuth credentials

1. APIs & Services → Credentials → Create Credentials → **OAuth client ID**
2. Application type: **Desktop app**
3. Name it (e.g. "Cursor Python Agent")
4. Click Create → **Download JSON**
5. Save as `integrations/google/oauth_client.json` (or `integrations/google_sheets/credentials.json`)

### 3. Configure environment

Add to `.env.local` in project root:

```
GOOGLE_SHEETS_CREDENTIALS=/Users/mejorvidainsurance/Desktop/mejor-vida-html /Mejor-Vida-HTML/integrations/google/oauth_client.json
GOOGLE_SHEETS_SPREADSHEET_ID=1kuci6vNa7yReBEEQWfsdn9zzstOz9tBkn9mbXkgvFyQ
GOOGLE_SHEETS_TAB=Lead List
```

### 4. First run — one-time login

Run the test script. A browser will open — **log in with the Google account that owns the sheet** and grant access. The token is saved; you won't need to log in again.

---

## Setup: Service Account (if you have admin access)

1. Create Credentials → **Service account** (not OAuth)
2. Keys → Add key → JSON → Download
3. Save as `integrations/google_sheets/credentials.json`
4. Share your sheet with the **service account email** (Editor access)
5. Set `GOOGLE_SHEETS_CREDENTIALS` to the path of that JSON

## Install

```bash
pip3 install gspread
```

## Usage

### Test connection

```bash
cd "/Users/mejorvidainsurance/Desktop/mejor-vida-html /Mejor-Vida-HTML"
python3 integrations/google_sheets/client.py
```

### Use in Python

From project root (or with project root in `sys.path`):

```python
from integrations.google_sheets.client import read_all_records, append_row

# Read leads (Lead List tab)
leads = read_all_records(sheet_name="Lead List")
for lead in leads:
    print(lead["First Name"], lead["Email"])

# Append a new row
append_row(["New", "Lead", "email@example.com"], sheet_name="Lead List")
```

## Security

- **Do not commit** `credentials.json` to git. Add to `.gitignore`.
- The service account has access only to sheets you explicitly share with it.
