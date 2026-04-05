#!/usr/bin/env python3
"""Run get_page_token.py and upsert FACEBOOK_PAGE_ACCESS_TOKEN into .env files (no token printed)."""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

_FB = Path(__file__).resolve().parents[1]
_REPO = _FB.parent


def main() -> int:
    proc = subprocess.run(
        [sys.executable, str(_FB / "scripts" / "get_page_token.py")],
        cwd=str(_FB),
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0:
        sys.stderr.write(proc.stdout + proc.stderr)
        return proc.returncode or 1

    new_line = None
    for line in proc.stdout.splitlines():
        if line.startswith("FACEBOOK_PAGE_ACCESS_TOKEN="):
            new_line = line.strip()
            break
    if not new_line:
        print("Could not parse FACEBOOK_PAGE_ACCESS_TOKEN from get_page_token output.", file=sys.stderr)
        return 1

    def upsert(path: Path) -> None:
        if not path.exists():
            path.write_text(new_line + "\n", encoding="utf-8")
            return
        text = path.read_text(encoding="utf-8")
        if re.search(r"^FACEBOOK_PAGE_ACCESS_TOKEN=", text, re.M):
            text = re.sub(r"^FACEBOOK_PAGE_ACCESS_TOKEN=.*$", new_line, text, flags=re.M)
        else:
            text = text.rstrip() + "\n" + new_line + "\n"
        path.write_text(text, encoding="utf-8")

    upsert(_FB / ".env")
    upsert(_REPO / ".env.local")
    print("Updated FACEBOOK_PAGE_ACCESS_TOKEN in facebook-posting/.env and .env.local (value not shown).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
