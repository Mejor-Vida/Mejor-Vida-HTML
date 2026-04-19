#!/usr/bin/env python3
"""Serve repo_root/FB with Cache-Control: no-store (avoids stale file:// caching).

  cd facebook-posting && python3 serve_preview.py

Open http://127.0.0.1:8765/post-preview.html — use with watch_preview.py or dev_preview.py.
"""
from __future__ import annotations

import socketserver
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parent
_REPO = _ROOT.parent
_FB = _REPO / "FB"
PORT = 8765

sys.path.insert(0, str(_ROOT))
from scripts.preview_server import make_fb_preview_handler


def main() -> int:
    if not _FB.is_dir():
        print(f"Folder not found: {_FB}", flush=True)
        return 1
    socketserver.TCPServer.allow_reuse_address = True
    handler = make_fb_preview_handler(_FB, _REPO)
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"Serving {_FB} at http://127.0.0.1:{PORT}/post-preview.html", flush=True)
        httpd.serve_forever()


if __name__ == "__main__":
    raise SystemExit(main())
