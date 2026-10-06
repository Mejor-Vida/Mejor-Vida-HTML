#!/usr/bin/env python3
"""Local viewer for ad backgrounds. Delete removes the file and the library entry."""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]
YOURS = ROOT / "img" / "ad-photo-library" / "yours"
LIBRARY = ROOT / "ad-photo-library.json"
DATA = ROOT / "js" / "fe-ad-builder-data.js"
BUILDER = ROOT / "img" / "ad-builder"
PORT = 8771

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ad backgrounds</title>
<style>
  body { margin: 0; background: #111; color: #f4f6f8; font-family: Helvetica, Arial, sans-serif; }
  header { position: sticky; top: 0; z-index: 2; display: flex; justify-content: space-between; align-items: center; background: #111; padding: 12px 16px; border-bottom: 1px solid #333; }
  h1 { font-size: 16px; font-weight: 600; margin: 0; }
  main { width: min(720px, 100%); margin: 0 auto; padding: 12px; box-sizing: border-box; }
  figure { margin: 0 0 28px; }
  img { width: 100%; height: auto; display: block; background: #222; border-radius: 8px; }
  .row { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-top: 8px; }
  figcaption { font-size: 13px; color: #c5ced9; word-break: break-all; }
  button { background: #8f1d1d; color: #fff; border: 0; border-radius: 8px; padding: 8px 14px; font-size: 14px; font-weight: 700; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: default; }
  #status { font-size: 13px; color: #f0c7c7; margin: 0; }
</style>
</head>
<body>
<header><h1 id="count">Ad backgrounds</h1><p id="status"></p></header>
<main id="list"></main>
<script>
var files = __FILES__;
function render() {
  document.getElementById("count").textContent = files.length + " ad backgrounds";
  document.getElementById("list").innerHTML = files.map(function (name, i) {
    return '<figure><div class="row"><figcaption>' + (i + 1) + " / " + files.length + " · " + name.replace(/\\.jpg$/, "") +
      '</figcaption><button type="button" data-name="' + name.replace(/"/g, "") + '">Delete</button></div>' +
      '<img src="/file/' + encodeURIComponent(name) + '" alt=""></figure>';
  }).join("");
}
document.getElementById("list").addEventListener("click", function (event) {
  var button = event.target.closest("button[data-name]");
  if (!button) return;
  var name = button.getAttribute("data-name");
  button.disabled = true;
  fetch("/api/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name })
  }).then(function (response) {
    if (!response.ok) throw new Error("delete failed");
    files = files.filter(function (item) { return item !== name; });
    render();
  }).catch(function () {
    button.disabled = false;
    document.getElementById("status").textContent = "Could not delete " + name;
  });
});
render();
</script>
</body>
</html>
"""


def image_names():
    names = []
    for path in YOURS.iterdir():
        if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"} and not path.name.startswith("."):
            names.append(path.name)
    return sorted(names)


def library_id(name):
    stem = Path(name).stem
    if stem.startswith("bg-"):
        return stem[3:]
    return stem


def drop_from_libraries(name):
    image_id = library_id(name)
    prefix = "window.FE_AD_LIBRARY = "
    raw = DATA.read_text()
    data = json.loads(raw[len(prefix):].rstrip().rstrip(";"))
    data["images"] = [row for row in data["images"] if row.get("id") != image_id]
    DATA.write_text(prefix + json.dumps(data, ensure_ascii=False, separators=(", ", ": ")) + ";\n")
    library = json.loads(LIBRARY.read_text())
    for group in library.get("groups", []):
        group["photos"] = [row for row in group.get("photos", []) if row.get("id") != image_id]
    LIBRARY.write_text(json.dumps(library, ensure_ascii=False, indent=2) + "\n")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("[ad-backgrounds]", fmt % args)

    def do_GET(self):
        path = unquote(urlparse(self.path).path)
        if path in ("/", "/view.html"):
            body = PAGE.replace("__FILES__", json.dumps(image_names())).encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path.startswith("/file/"):
            name = Path(path[len("/file/"):]).name
            file_path = YOURS / name
            if not file_path.is_file():
                self.send_error(404)
                return
            data = file_path.read_bytes()
            kind = "image/png" if file_path.suffix.lower() == ".png" else "image/jpeg"
            self.send_response(200)
            self.send_header("Content-Type", kind)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(data)
            return
        self.send_error(404)

    def do_POST(self):
        if urlparse(self.path).path != "/api/delete":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
            name = Path(str(payload.get("name") or "")).name
        except json.JSONDecodeError:
            self.send_error(400)
            return
        file_path = YOURS / name
        if name.startswith(".") or file_path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"} or not file_path.is_file():
            self.send_error(404)
            return
        file_path.unlink()
        builder_copy = BUILDER / name
        if builder_copy.is_file():
            builder_copy.unlink()
        drop_from_libraries(name)
        body = b'{"ok":true}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Ad background viewer at http://127.0.0.1:{PORT}/")
    server.serve_forever()
