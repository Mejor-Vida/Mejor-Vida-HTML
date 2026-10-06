#!/usr/bin/env python3
"""Local viewer for finished ads. Reads img/local-ads only."""

import json
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
ADS = ROOT / "img" / "local-ads"
PORT = 8772

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Local ads</title>
<style>
  body { margin: 0; background: #e7e9ee; color: #1a1a1a; font-family: Helvetica, Arial, sans-serif; }
  header { position: sticky; top: 0; z-index: 2; background: #fff; padding: 14px 16px; border-bottom: 1px solid #ddd; }
  h1 { font-size: 16px; font-weight: 700; margin: 0; }
  p { margin: 4px 0 0; font-size: 13px; color: #555; }
  main { width: min(480px, 100%); margin: 0 auto; padding: 16px; box-sizing: border-box; }
  figure { margin: 0 0 28px; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
  figcaption { padding: 12px 14px 0; font-size: 14px; font-weight: 700; }
  img { width: 100%; height: auto; display: block; }
  .empty { background: #fff; border-radius: 12px; padding: 20px; }
</style>
</head>
<body>
<header>
  <h1 id="count">Local ads</h1>
  <p>Finished ads on this computer. New files in img/local-ads show up when you refresh.</p>
</header>
<main id="list"></main>
<script>
var files = __FILES__;
var list = document.getElementById("list");
document.getElementById("count").textContent = files.length + (files.length === 1 ? " local ad" : " local ads");
if (!files.length) {
  list.innerHTML = '<p class="empty">No ads yet.</p>';
} else {
  list.innerHTML = files.map(function (file, i) {
    var label = "Ad " + (i + 1);
    return '<figure><figcaption>' + label + '</figcaption><img src="/file/' + encodeURIComponent(file.name) + '" alt="' + label + '"></figure>';
  }).join("");
}
</script>
</body>
</html>
"""


def image_names():
    if not ADS.is_dir():
        return []
    names = []
    for path in ADS.iterdir():
        if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"} and not path.name.startswith("."):
            names.append(path.name)
    def ad_number(name):
        match = re.search(r"ad(\d+)", name, re.I)
        return int(match.group(1)) if match else 10**6

    return [{"name": name} for name in sorted(names, key=lambda name: (ad_number(name), name))]


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[local-ads]", fmt % args)

    def do_GET(self):
        path = unquote(urlparse(self.path).path)
        if path in ("/", "/view.html"):
            body = PAGE.replace("__FILES__", json.dumps(image_names())).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
            return
        if path.startswith("/file/"):
            name = Path(path[len("/file/"):]).name
            file_path = ADS / name
            if name.startswith(".") or not file_path.is_file() or file_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
                self.send_error(404)
                return
            kind = {
                ".png": "image/png",
                ".webp": "image/webp",
            }.get(file_path.suffix.lower(), "image/jpeg")
            data = file_path.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)
            return
        self.send_error(404)


if __name__ == "__main__":
    ADS.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Local ad viewer at http://127.0.0.1:{PORT}/", flush=True)
    server.serve_forever()
