#!/usr/bin/env python3
"""Exit 0 only if Python is new enough for browser-use (>= 3.11)."""

import sys

MIN = (3, 11)


def main() -> int:
    if sys.version_info[:2] < MIN:
        print(
            f"This project needs Python {MIN[0]}.{MIN[1]}+ (you have "
            f"{sys.version_info.major}.{sys.version_info.minor}).\n"
            "Install Python 3.12 from https://www.python.org/downloads/ or "
            "`brew install python@3.12`, then recreate the venv:\n"
            "  rm -rf .venv\n"
            "  python3.12 -m venv .venv\n"
            "  source .venv/bin/activate\n"
            "  pip install -r requirements.txt",
            file=sys.stderr,
        )
        return 1
    print(f"OK: Python {sys.version_info.major}.{sys.version_info.minor} is sufficient.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
