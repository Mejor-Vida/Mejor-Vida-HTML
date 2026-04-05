"""
Write a static HTML file to review the Facebook post locally before publishing.
Default path: repo_root/FB/post-preview.html — open in the browser (double-click or file:///...).
"""
from __future__ import annotations

import html
import os
import re
from pathlib import Path


def _resolve_image_src(image_url: str | None, html_dir: Path) -> str:
    """Path to image relative to html_dir, or production URL if file missing."""
    if not image_url:
        return ""
    m = re.search(r"mejorvidainsurance\.com(/img/.+)$", image_url)
    if not m:
        return image_url
    repo_root = html_dir.parent
    abs_img = (repo_root / m.group(1).lstrip("/")).resolve()
    if abs_img.is_file():
        return os.path.relpath(abs_img, html_dir).replace("\\", "/")
    return image_url


def write_preview(
    caption: str,
    *,
    image_url: str | None,
    blog_url: str,
    out_path: Path,
) -> None:
    """Write preview HTML; out_path e.g. .../Mejor-Vida-HTML/FB/post-preview.html"""
    html_dir = out_path.parent
    html_dir.mkdir(parents=True, exist_ok=True)
    img_src = _resolve_image_src(image_url, html_dir)
    safe_caption = html.escape(caption).replace("\n", "<br>\n")
    safe_blog_url = html.escape(blog_url)

    body = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facebook post preview (local)</title>
  <style>
    body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #f0f2f5; margin: 0; padding: 24px; color: #1c1e21; }}
    .wrap {{ max-width: 500px; margin: 0 auto; }}
    h1 {{ font-size: 1rem; font-weight: 600; color: #65676b; margin: 0 0 12px 0; }}
    .card {{ background: #fff; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.1); overflow: hidden; }}
    .card img {{ width: 100%; height: auto; display: block; vertical-align: middle; background: #e4e6eb; }}
    .caption {{ padding: 12px 16px 16px; font-size: 15px; line-height: 1.4; white-space: normal; }}
    .meta {{ padding: 12px 16px; font-size: 12px; color: #65676b; border-top: 1px solid #e4e6eb; }}
    .meta a {{ color: #1877f2; }}
    .note {{ font-size: 13px; color: #65676b; margin-top: 16px; padding: 12px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffc107; }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Facebook post preview (not published)</h1>
    <div class="card">
"""

    if img_src:
        body += f'    <img src="{html.escape(img_src)}" alt="Post image" />\n'
    body += f"""    <div class="caption">{safe_caption}</div>
    <div class="meta">Link in caption: <a href="{safe_blog_url}">{safe_blog_url}</a></div>
  </div>
  <p class="note">This file is only on your computer. Close when done, then run <code>python3 main.py</code> to publish to Facebook.</p>
</div>
</body>
</html>
"""

    out_path.write_text(body, encoding="utf-8")
