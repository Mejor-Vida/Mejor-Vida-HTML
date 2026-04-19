"""Persist chat memory and form fields to disk so they survive Streamlit restarts."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parent
SESSION_FILE = _ROOT / ".browser_agent_session.json"


def load_session() -> dict[str, Any] | None:
    if not SESSION_FILE.is_file():
        return None
    try:
        raw = SESSION_FILE.read_text(encoding="utf-8")
        return json.loads(raw)
    except (json.JSONDecodeError, OSError):
        return None


def save_session(data: dict[str, Any]) -> None:
    SESSION_FILE.parent.mkdir(parents=True, exist_ok=True)
    SESSION_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def clear_session_file() -> None:
    SESSION_FILE.unlink(missing_ok=True)


def session_file_path() -> Path:
    return SESSION_FILE
