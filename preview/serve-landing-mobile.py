#!/usr/bin/env python3
"""
Serve the repo over HTTP for landing mobile header preview.

  python3 preview/serve-landing-mobile.py

Open:
  http://127.0.0.1:8766/preview/landing-mobile-header.html
"""
from __future__ import annotations

import http.server
import socketserver
import webbrowser
from pathlib import Path

PORT = 8766
REPO = Path(__file__).resolve().parents[1]


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


def main() -> None:
    url = f"http://127.0.0.1:{PORT}/preview/landing-mobile-header.html"
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving {REPO}")
        print(f"Preview: {url}")
        print("Ctrl+C to stop")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        httpd.serve_forever()


if __name__ == "__main__":
    main()
