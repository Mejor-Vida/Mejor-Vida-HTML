"""
HTTP handler for local Facebook post preview: serves FB/ at / and repo img/ at /img/
so <img src="../img/..."> works when the page is http://127.0.0.1:PORT/post-preview.html.
"""
from __future__ import annotations

import http.server
import posixpath
import urllib.parse
from pathlib import Path


class FbPreviewRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Serve FB directory as document root; also map /img/* to repo_root/img/*."""

    def __init__(self, fb_dir: Path, repo_root: Path, *args, **kwargs):
        self._repo_root = repo_root.resolve()
        self._img_root = (self._repo_root / "img").resolve()
        super().__init__(*args, directory=str(fb_dir.resolve()), **kwargs)

    def translate_path(self, path: str) -> str:
        parsed = urllib.parse.unquote(path)
        parsed = parsed.split("?", 1)[0].split("#", 1)[0]
        parsed = posixpath.normpath(parsed)
        if parsed in ("/img", "/img/"):
            return super().translate_path(path)
        if not parsed.startswith("/img/"):
            return super().translate_path(path)
        rel = parsed.lstrip("/")
        if not rel.startswith("img/"):
            return super().translate_path(path)
        full = (self._repo_root / rel).resolve()
        try:
            full.relative_to(self._img_root)
        except ValueError:
            return super().translate_path(path)
        return str(full)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()


def make_fb_preview_handler(fb_dir: Path, repo_root: Path):
    def _handler(*args, **kwargs):
        return FbPreviewRequestHandler(fb_dir, repo_root, *args, **kwargs)

    return _handler
