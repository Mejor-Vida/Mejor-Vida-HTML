#!/usr/bin/env python3
"""
Serve the repo over HTTP for landing mobile previews (phone frame + iframe).

  python3 preview/serve-landing-mobile.py
  python3 preview/serve-landing-mobile.py --page ads
  python3 preview/serve-landing-mobile.py --page legacy

  python3 preview/serve-landing-mobile.py --page ads-v2

  python3 preview/serve-landing-mobile.py --page mobile

Open:
  http://127.0.0.1:8766/preview/landing-gastos-finales-ads-mobile.html  (--page ads)
  http://127.0.0.1:8766/preview/landing-gastos-finales-ads-v2-mobile.html (--page ads-v2)
  http://127.0.0.1:8766/preview/mobile-layout-viewer.html              (--page mobile)
  http://127.0.0.1:8766/preview/landing-mobile-header.html             (--page legacy)
"""
from __future__ import annotations

import argparse
import http.server
import socketserver
import webbrowser
from pathlib import Path

PORT = 8766
REPO = Path(__file__).resolve().parents[1]

PAGES = {
    "ads": "preview/landing-gastos-finales-ads-mobile.html",
    "ads-v2": "preview/landing-gastos-finales-ads-v2-mobile.html",
    "legacy": "preview/landing-mobile-header.html",
    "mobile": "preview/mobile-layout-viewer.html",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


def main() -> None:
    parser = argparse.ArgumentParser(description="Local mobile landing preview server")
    parser.add_argument(
        "--page",
        choices=sorted(PAGES.keys()),
        default="ads",
        help="Which preview shell to open (default: ads)",
    )
    args = parser.parse_args()
    rel = PAGES[args.page]
    url = f"http://127.0.0.1:{PORT}/{rel}"
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving {REPO}")
        print(f"Preview: {url}")
        if args.page == "ads":
            print("Also: http://127.0.0.1:8766/gastos-finales-ads/ (full page, no frame)")
        if args.page == "ads-v2":
            print("Also: http://127.0.0.1:8766/gastos-finales-ads-v2/ (full page, no frame)")
        if args.page == "mobile":
            print("Also: http://127.0.0.1:8766/preview/mobile-layout-viewer.html?target=landing")
            print("Medical intake APIs: run npm run dev:local in another terminal")
        print("Ctrl+C to stop")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        httpd.serve_forever()


if __name__ == "__main__":
    main()
