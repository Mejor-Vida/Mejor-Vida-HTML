#!/usr/bin/env python3
"""Upsert GOOGLE_DRIVE_REFRESH_TOKEN into .env.local (token from file or stdin; never printed)."""
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
    if raw.startswith("GOOGLE_DRIVE_REFRESH_TOKEN="):
        raw = raw.split("=", 1)[1].strip()
    return raw


def upsert(path: Path, token: str) -> None:
    line = f"GOOGLE_DRIVE_REFRESH_TOKEN={token}"
    if not path.exists():
        path.write_text(line + "\n", encoding="utf-8")
        return
    text = path.read_text(encoding="utf-8")
    if re.search(r"^GOOGLE_DRIVE_REFRESH_TOKEN=", text, re.M):
        text = re.sub(r"^GOOGLE_DRIVE_REFRESH_TOKEN=.*$", line, text, flags=re.M)
    else:
        text = text.rstrip() + "\n" + line + "\n"
    path.write_text(text, encoding="utf-8")


def main() -> int:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    token = read_token(src)
    upsert(ENV_PATH, token)
    print(f"Updated GOOGLE_DRIVE_REFRESH_TOKEN in {ENV_PATH} (value not shown).")
    print("Add the same GOOGLE_DRIVE_REFRESH_TOKEN to Vercel project env.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
