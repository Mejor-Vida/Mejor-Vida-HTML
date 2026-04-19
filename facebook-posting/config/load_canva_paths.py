"""Resolve Canva background + active template folder from paths.local.json."""

from __future__ import annotations

import json
from pathlib import Path

_CONFIG_DIR = Path(__file__).resolve().parent
_PATHS_FILE = _CONFIG_DIR / "paths.local.json"


def load_paths() -> dict:
    if not _PATHS_FILE.is_file():
        raise FileNotFoundError(
            f"Missing {_PATHS_FILE} — copy paths.local.json.example and edit."
        )
    with open(_PATHS_FILE, encoding="utf-8") as f:
        return json.load(f)


def get_active_template_dir() -> Path:
    """e.g. .../Canva background images/mom_family_02_clean"""
    p = load_paths()
    base = Path(p["canva_backgrounds_dir"]).expanduser()
    sub = (p.get("active_template") or "").strip()
    if not sub:
        raise ValueError("paths.local.json: set active_template (template subfolder name)")
    return (base / sub).resolve()


if __name__ == "__main__":
    d = get_active_template_dir()
    print(d)
    print("exists:", d.is_dir())
