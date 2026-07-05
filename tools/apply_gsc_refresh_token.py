#!/usr/bin/env python3
"""Upsert GSC_REFRESH_TOKEN into .env.local (token read from file arg or stdin; never printed)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
ENV_PATH = REPO / ".env.local"


def read_token(source: Path | None) -> str:
    if source and source.is_file():
        raw = source.read_text(encoding="utf-8").strip()
    else:
        raw = sys.stdin.read().strip()
    if not raw:
        raise SystemExit("Empty token input.")
    if raw.startswith("GSC_REFRESH_TOKEN="):
        raw = raw.split("=", 1)[1].strip()
    return raw


def upsert(path: Path, token: str) -> None:
    line = f"GSC_REFRESH_TOKEN={token}"
    if not path.exists():
        path.write_text(line + "\n", encoding="utf-8")
        return
    text = path.read_text(encoding="utf-8")
    if re.search(r"^GSC_REFRESH_TOKEN=", text, re.M):
        text = re.sub(r"^GSC_REFRESH_TOKEN=.*$", line, text, flags=re.M)
    else:
        text = text.rstrip() + "\n" + line + "\n"
    path.write_text(text, encoding="utf-8")


def main() -> int:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    token = read_token(src)
    upsert(ENV_PATH, token)
    site_line = "GSC_SITE_URL=sc-domain:mejorvidainsurance.com"
    if ENV_PATH.is_file():
        text = ENV_PATH.read_text(encoding="utf-8")
        if not re.search(r"^GSC_SITE_URL=", text, re.M):
            text = text.rstrip() + "\n" + site_line + "\n"
            ENV_PATH.write_text(text, encoding="utf-8")
    print(f"Updated GSC_REFRESH_TOKEN in {ENV_PATH} (value not shown).")
    print("Add the same GSC_REFRESH_TOKEN and GSC_SITE_URL to Vercel project env.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
