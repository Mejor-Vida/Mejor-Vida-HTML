"""
Write a static HTML file to review the Facebook post locally before publishing.
Default path: repo_root/FB/post-preview.html — open in the browser (double-click or file:///...).
"""
from __future__ import annotations

import html
import os
import re
from datetime import datetime, timezone
from pathlib import Path

from scripts.facebook_post_package import FacebookPostPackage

_WEEKLY_SLUG_DATE = re.compile(
    r"weekly-insurance-update-(\d{4}-\d{2}-\d{2})\.html", re.IGNORECASE
)
_MESES_ES = (
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
)


def infer_content_date_iso(blog_url: str) -> str | None:
    """Extract YYYY-MM-DD from weekly-insurance-update-YYYY-MM-DD.html in URL, if present."""
    m = _WEEKLY_SLUG_DATE.search(blog_url or "")
    return m.group(1) if m else None


def spanish_long_date(iso_date: str) -> str:
    parts = iso_date.strip().split("-")
    if len(parts) != 3:
        return iso_date
    y, mo, d = int(parts[0]), int(parts[1]), int(parts[2])
    if not 1 <= mo <= 12:
        return iso_date
    return f"{d} de {_MESES_ES[mo - 1]} de {y}"


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
    auto_refresh_sec: int | None = None,
) -> None:
    """Write preview HTML; out_path e.g. .../Mejor-Vida-HTML/FB/post-preview.html"""
    html_dir = out_path.parent
    html_dir.mkdir(parents=True, exist_ok=True)
    img_src = _resolve_image_src(image_url, html_dir)
    safe_caption = html.escape(caption).replace("\n", "<br>\n")
    safe_blog_url = html.escape(blog_url)
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    safe_generated = html.escape(generated)

    body = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
"""
    if auto_refresh_sec and auto_refresh_sec > 0:
        body += f'  <meta http-equiv="refresh" content="{int(auto_refresh_sec)}" />\n'
    body += f"""  <title>Facebook preview · {safe_generated}</title>
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
    .stamp {{ font-size: 11px; color: #8a8d91; margin-top: 8px; }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Facebook post preview (not published)</h1>
    <p class="stamp">Generado: {safe_generated} — si no ves cambios, recarga forzada (⌘⇧R / Ctrl+F5).</p>
    <div class="card">
"""

    if img_src:
        body += f'    <img src="{html.escape(img_src)}" alt="Post image" />\n'
    body += f"""    <div class="caption">{safe_caption}</div>
    <div class="meta">Artículo (para primer comentario, no en el post principal): <a href="{safe_blog_url}">{safe_blog_url}</a></div>
  </div>
  <p class="note">This file is only on your computer. Close when done, then run <code>python3 main.py</code> to publish to Facebook.</p>
</div>
</body>
</html>
"""

    out_path.write_text(body, encoding="utf-8")


def write_preview_package(
    package: FacebookPostPackage,
    *,
    image_url: str | None,
    blog_url: str,
    out_path: Path,
    auto_refresh_sec: int | None = None,
    content_date_iso: str | None = None,
) -> None:
    """Preview main post + first comment + alternates per facebook-post-rules.md.

    content_date_iso: YYYY-MM-DD for banner + page title (defaults to date parsed from blog_url).
    Also writes post-preview-YYYY-MM-DD.html next to post-preview.html for keeping snapshots.
    """
    html_dir = out_path.parent
    html_dir.mkdir(parents=True, exist_ok=True)
    resolved_date = (content_date_iso or "").strip() or infer_content_date_iso(blog_url)
    img_src = _resolve_image_src(image_url, html_dir)
    safe_main = html.escape(package.main_caption).replace("\n", "<br>\n")
    safe_first = html.escape(package.first_comment).replace("\n", "<br>\n")
    safe_alt = html.escape(package.alternate_caption).replace("\n", "<br>\n")
    safe_prompt = html.escape(package.image_prompt)
    safe_kw = html.escape(", ".join(package.manychat_keywords))
    safe_pinned = (
        html.escape(package.pinned_comment).replace("\n", "<br>\n") if package.pinned_comment else ""
    )
    safe_blog_url = html.escape(blog_url)
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    safe_generated = html.escape(generated)
    safe_resolved = html.escape(resolved_date) if resolved_date else ""
    safe_spanish_date = html.escape(spanish_long_date(resolved_date)) if resolved_date else ""

    if resolved_date:
        safe_page_title = html.escape(f"Facebook preview · semana {resolved_date} · {generated}")
    else:
        safe_page_title = html.escape(f"Facebook preview · {generated}")
    content_banner = ""
    if resolved_date:
        content_banner = f"""
    <div class="content-date">
      <strong>Post / boletín:</strong> {safe_spanish_date} <span class="iso">({safe_resolved})</span><br />
      <span class="sub">Misma vista guardada como <code>post-preview-{safe_resolved}.html</code> para no confundirla con otras semanas.</span>
    </div>"""

    head_extra = ""
    if auto_refresh_sec and auto_refresh_sec > 0:
        head_extra = f'  <meta http-equiv="refresh" content="{int(auto_refresh_sec)}" />\n'

    pinned_block = ""
    if package.pinned_comment:
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
  <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
{head_extra}  <title>{safe_page_title}</title>
  <style>
    body {{ font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #f0f2f5; margin: 0; padding: 24px; color: #1c1e21; }}
    .wrap {{ max-width: 520px; margin: 0 auto; }}
    h1 {{ font-size: 1rem; font-weight: 600; color: #65676b; margin: 0 0 8px 0; }}
    h2 {{ font-size: 0.85rem; font-weight: 600; color: #65676b; margin: 0 0 8px 0; padding: 12px 16px 0 16px; }}
    .content-date {{ background: #e7f3ff; border: 1px solid #1877f2; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; font-size: 14px; line-height: 1.45; }}
    .content-date .iso {{ color: #65676b; font-weight: 500; }}
    .content-date .sub {{ display: block; font-size: 12px; color: #65676b; margin-top: 6px; }}
    .card {{ background: #fff; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.1); overflow: hidden; margin-bottom: 16px; }}
    .card img {{ width: 100%; height: auto; display: block; vertical-align: middle; background: #e4e6eb; }}
    .caption {{ padding: 12px 16px 16px; font-size: 15px; line-height: 1.4; white-space: normal; }}
    .meta {{ padding: 12px 16px; font-size: 12px; color: #65676b; border-top: 1px solid #e4e6eb; }}
    .meta a {{ color: #1877f2; }}
    .note {{ font-size: 13px; color: #65676b; margin-top: 8px; padding: 12px; background: #fff3cd; border-radius: 8px; border: 1px solid #ffc107; }}
    .stamp {{ font-size: 11px; color: #8a8d91; margin-top: 8px; }}
    .rule {{ font-size: 12px; color: #65676b; margin-bottom: 12px; }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Vista previa — post principal (sin enlace al blog)</h1>
{content_banner}
    <p class="stamp">Archivo generado: {safe_generated}</p>
    <p class="rule">Regla: el enlace del artículo va en el <strong>primer comentario</strong>, no en el texto principal (ver <code>facebook-post-rules.md</code>).</p>
    <div class="card">
"""
    if img_src:
        body += f'      <img src="{html.escape(img_src)}" alt="Post image" />\n'
    body += f"""      <div class="caption">{safe_main}</div>
      <div class="meta">Referencia del artículo (solo para ti): <a href="{safe_blog_url}">{safe_blog_url}</a></div>
    </div>

    <div class="card section">
      <h2>Primer comentario (publicar después del post; incluye el enlace)</h2>
      <div class="caption">{safe_first}</div>
    </div>

    <div class="card section">
      <h2>Texto alternativo (más corto)</h2>
      <div class="caption">{safe_alt}</div>
    </div>

    <div class="card section">
      <h2>Prompt de imagen</h2>
      <div class="caption">{safe_prompt}</div>
    </div>

    <div class="card section">
      <h2>Keywords ManyChat</h2>
      <div class="caption">{safe_kw}</div>
    </div>
{pinned_block}
    <p class="note">Solo en tu equipo. Publicar: <code>python3 main.py</code> (sin <code>--dry-run</code>). Tras publicar, el script publica el primer comentario vía Graph API de inmediato. Usa <code>--no-first-comment</code> solo si quieres omitirlo.</p>
  </div>
</body>
</html>
"""

    out_path.write_text(body, encoding="utf-8")
    if resolved_date:
        dated_path = out_path.parent / f"post-preview-{resolved_date}.html"
        dated_path.write_text(body, encoding="utf-8")
