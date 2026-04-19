#!/usr/bin/env python3
"""
Regenerate FB/post-preview.html when any Facebook-posting source file is saved (poll, no deps).

Run from facebook-posting/:
    python3 watch_preview.py

For automatic browser updates without hard refresh, use dev_preview.py instead (HTTP + meta refresh).

With watch_preview alone: open via http://127.0.0.1:8765/post-preview.html (run serve_preview.py in another terminal).
"""
from __future__ import annotations

import subprocess
import sys
import time
from pathlib import Path

_ROOT = Path(__file__).resolve().parent
_MAIN = _ROOT / "main.py"
POLL = 0.5
DEBOUNCE_SEC = 0.45

WATCH_FILES = [
    _ROOT / "main.py",
    _ROOT / "scripts" / "generate_facebook_post.py",
    _ROOT / "scripts" / "facebook_post_package.py",
    _ROOT / "scripts" / "preview_html.py",
    _ROOT / "prompts" / "facebook_post_template.md",
    _ROOT / "config" / "settings.json",
]


def _watch_paths() -> list[Path]:
    return [p for p in WATCH_FILES if p.is_file()]


def run_refresh() -> None:
    subprocess.run(
        [sys.executable, str(_ROOT / "main.py"), "--dry-run", "--live"],
        cwd=str(_ROOT),
        check=False,
    )


def main() -> int:
    paths = _watch_paths()
    if not paths or not _MAIN.is_file():
        print("main.py or watch paths not found.", file=sys.stderr)
        return 1
    print(
        "Watching:\n  "
        + "\n  ".join(str(p.relative_to(_ROOT)) for p in paths)
        + "\n\nEdit & save any of the above — preview regenerates ~0.5s after last save.\n"
        "Tip: run python3 dev_preview.py for HTTP + auto reload in the browser.\n",
        flush=True,
    )
    run_refresh()
    mtimes = {p: p.stat().st_mtime for p in paths}
    debounce_until: float | None = None
    while True:
        time.sleep(POLL)
        for p in paths:
            try:
                m = p.stat().st_mtime
            except OSError:
                continue
            if m != mtimes[p]:
                mtimes[p] = m
                debounce_until = time.monotonic() + DEBOUNCE_SEC
        if debounce_until is not None and time.monotonic() >= debounce_until:
            debounce_until = None
            print("Source changed — regenerating preview…", flush=True)
            run_refresh()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nStopped.")
        raise SystemExit(0)
