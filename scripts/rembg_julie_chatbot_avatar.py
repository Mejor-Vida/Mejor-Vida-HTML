#!/usr/bin/env python3
"""Generate img/julie-chatbot-avatar-cutout.png (transparent BG) from the source portrait.
Requires: pip install rembg pillow
Run from repo root: python3 scripts/rembg_julie_chatbot_avatar.py
Output is img/julie-chatbot-avatar-cutout.png for site graphics (e.g. marketing); the live chat UI uses the floating assistant only.
"""
from pathlib import Path

try:
    from rembg import remove
except ImportError:
    raise SystemExit("Install rembg: pip install rembg pillow") from None

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "img" / "julie-chatbot-avatar.png"
OUT = ROOT / "img" / "julie-chatbot-avatar-cutout.png"

def main() -> None:
    data = SRC.read_bytes()
    OUT.write_bytes(remove(data))
    print(f"Wrote {OUT}")

if __name__ == "__main__":
    main()
