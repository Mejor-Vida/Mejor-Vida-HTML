#!/usr/bin/env python3
"""Write FB/review-facebook-post.html from FB/post-package.json (local preview, file:// safe)."""
from __future__ import annotations

import html
import json
import sys
from pathlib import Path


def br(s: str) -> str:
    return html.escape(s or "").replace("\n", "<br>\n")


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    pkg_path = root / "FB" / "post-package.json"
    if not pkg_path.is_file():
        print("Missing FB/post-package.json", file=sys.stderr)
        return 1
    pkg = json.loads(pkg_path.read_text(encoding="utf-8"))

    img_src = "../img/facebook/iowa-senior-safeguard-fb-2026-04.png"
    img_file = (root / "img" / "facebook" / "iowa-senior-safeguard-fb-2026-04.png").resolve()
    if not img_file.is_file():
        img_src = "../FB/assets/iowa-senior-safeguard-fb-2026-04.png"

    blog_url = html.escape(pkg.get("blog_url", ""))
    prod_img = html.escape(pkg.get("image_url") or "")
    safe_main = br(pkg.get("main_caption", ""))
    safe_first = br(pkg.get("first_comment", ""))
    safe_alt = br(pkg.get("alternate_caption", ""))
    safe_prompt = br(pkg.get("image_prompt", ""))
    safe_kw = html.escape(", ".join(pkg.get("manychat_keywords") or []))
    pinned = pkg.get("pinned_comment")
    safe_pinned = br(pinned) if pinned else ""
    pinned_block = ""
    if pinned:
        pinned_block = f"""
    <div class="card section">
      <h2>Comentario fijado (opcional)</h2>
      <div class="caption">{safe_pinned}</div>
    </div>"""

    body = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vista previa Facebook — revisión local</title>
  <style>
    body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #f0f2f5; margin: 0; padding: 24px; color: #1c1e21; }}
    .wrap {{ max-width: 520px; margin: 0 auto; }}
    h1 {{ font-size: 1rem; font-weight: 600; color: #65676b; margin: 0 0 8px 0; }}
    h2 {{ font-size: 0.85rem; font-weight: 600; color: #65676b; margin: 0 0 8px 0; padding: 12px 16px 0 16px; }}
    .hint {{ font-size: 13px; color: #65676b; margin-bottom: 14px; line-height: 1.45; }}
    .card {{ background: #fff; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.1); overflow: hidden; margin-bottom: 16px; }}
    .card img {{ width: 100%; height: auto; display: block; background: #e4e6eb; }}
    .caption {{ padding: 12px 16px 16px; font-size: 15px; line-height: 1.4; white-space: normal; }}
    .meta {{ padding: 12px 16px; font-size: 12px; color: #65676b; border-top: 1px solid #e4e6eb; }}
    .meta a {{ color: #1877f2; word-break: break-all; }}
    .note {{ font-size: 13px; color: #65676b; margin-top: 8px; padding: 12px; background: #e7f3ff; border-radius: 8px; border: 1px solid #1877f2; }}
    code {{ font-size: 12px; }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Vista previa — publicación Facebook (local)</h1>
    <p class="hint">Abre este archivo desde el repo: <code>FB/review-facebook-post.html</code>. Para regenerarlo tras editar el paquete: <code>python3 tools/sync_fb_review_html.py</code></p>
    <p class="note">Regla: el enlace del blog va en el <strong>primer comentario</strong>, no en el post principal.</p>

    <div class="card">
      <img src="{html.escape(img_src)}" alt="Arte del post" />
      <div class="caption">{safe_main}</div>
      <div class="meta">Artículo (referencia): <a href="{blog_url}">{blog_url}</a><br />
      URL de imagen en producción: {prod_img}</div>
    </div>

    <div class="card section">
      <h2>Primer comentario</h2>
      <div class="caption">{safe_first}</div>
    </div>

    <div class="card section">
      <h2>Texto alternativo (corto)</h2>
      <div class="caption">{safe_alt}</div>
    </div>

    <div class="card section">
      <h2>Prompt de imagen / notas</h2>
      <div class="caption">{safe_prompt}</div>
    </div>

    <div class="card section">
      <h2>Keywords ManyChat</h2>
      <div class="caption">{safe_kw}</div>
    </div>
{pinned_block}
  </div>
</body>
</html>
"""
    out = root / "FB" / "review-facebook-post.html"
    out.write_text(body, encoding="utf-8")
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
