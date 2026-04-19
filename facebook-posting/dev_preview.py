#!/usr/bin/env python3
"""
Serve FB/ over HTTP (no-cache) and regenerate post-preview.html when sources change.

Single command for automatic preview updates:
  cd facebook-posting && python3 dev_preview.py

Then open http://127.0.0.1:8765/post-preview.html — the page reloads every ~3s and picks up
regenerated HTML after you save main.py, the template, settings, etc.
"""
from __future__ import annotations

import socketserver
import subprocess
import sys
import threading
import time
from pathlib import Path

_ROOT = Path(__file__).resolve().parent
_REPO = _ROOT.parent
_FB = _REPO / "FB"

sys.path.insert(0, str(_ROOT))
from scripts.preview_server import make_fb_preview_handler
PORT = 8765
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


def serve() -> None:
    socketserver.TCPServer.allow_reuse_address = True
    handler = make_fb_preview_handler(_FB, _REPO)
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        httpd.serve_forever()


def run_refresh() -> None:
    subprocess.run(
        [sys.executable, str(_ROOT / "main.py"), "--dry-run", "--live"],
        cwd=str(_ROOT),
        check=False,
    )


def main() -> int:
    paths = _watch_paths()
    if not paths:
        print("No source files found to watch.", file=sys.stderr)
        return 1
    _FB.mkdir(parents=True, exist_ok=True)

    threading.Thread(target=serve, daemon=True).start()
    print(f"Serving {_FB} at http://127.0.0.1:{PORT}/")
    print(f"Open http://127.0.0.1:{PORT}/post-preview.html (auto-refresh ~3s)\n")
    print("Watching:", ", ".join(str(p.relative_to(_ROOT)) for p in paths))
    print("Ctrl+C to stop.\n")
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
            print("Source changed — regenerating preview…")
            run_refresh()


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\nStopped.")
        raise SystemExit(0)
