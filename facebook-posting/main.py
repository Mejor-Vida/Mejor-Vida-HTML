#!/usr/bin/env python3
"""
Mejor Vida Insurance — Facebook posting system (v1).

Flow:
1. Define sample blog post (or load from your blog system later)
2. Generate Facebook caption via template
3. Publish to Facebook Page (with or without image)
"""

import argparse
import json
import sys
from pathlib import Path

# Add project root to path so we can import scripts
_root = Path(__file__).resolve().parent
sys.path.insert(0, str(_root))

from scripts.generate_facebook_post import generate_facebook_post
from scripts.preview_html import write_preview
from scripts.publish_facebook import publish_post


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate and publish Facebook post from blog content")
    parser.add_argument("--dry-run", action="store_true", help="Generate caption only, do not publish")
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Write preview.html in facebook-posting/ for browser review (no publish)",
    )
    args = parser.parse_args()
    # Featured blog: March 29 – April 4, 2026 weekly update (matches blog.html)
    blog = {
        "title": "Actualización semanal - 29 de marzo al 4 de abril de 2026",
        "summary": "Supervisión de IA en la NAIC, estudio LIMRA/NAILBA sobre adopción de IA en distribución, consulta sobre ilustraciones de anualidades indexadas.",
        "url": "https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-03-29.html",
        "image_url": "https://www.mejorvidainsurance.com/img/blog-generated/weekly-insurance-update-2026-03-29/hero.png",
    }

    # Curated caption (template: hook → body → CTA → link → hashtags)
    facebook_caption = """¿Cómo está cambiando la supervisión de la IA en seguros y qué deben vigilar familias y agentes?

Esta semana te resumimos tres temas: avances de la NAIC en inteligencia artificial, qué dice el estudio LIMRA/NAILBA sobre IA en distribución, y la consulta sobre ilustraciones de anualidades indexadas.

Lee el artículo en claro y escríbenos si quieres revisar tu cobertura o tienes dudas.

https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-03-29.html

#MejorVidaInsurance #SeguroDeVida #NAIC #AgentesDeSeguros #GastosFinales"""

    # Load default language from config
    config_path = _root / "config" / "settings.json"
    config = json.loads(config_path.read_text(encoding="utf-8"))
    language = config.get("default_language", "es")

    # 2. Generate Facebook post
    caption = generate_facebook_post(
        blog_title=blog["title"],
        blog_summary=blog["summary"],
        blog_url=blog["url"],
        language=language,
        override_caption=facebook_caption,
    )

    print("Generated caption:\n")
    print(caption)
    print("\n" + "-" * 40 + "\n")

    preview_path = _root / "preview.html"
    if args.preview:
        write_preview(
            caption,
            image_url=blog.get("image_url"),
            blog_url=blog["url"],
            out_path=preview_path,
            fb_root=_root,
        )
        print(f"Preview written: {preview_path}")
        print("Open that file in your browser (double-click or drag into Chrome/Safari).")
        return 0

    if args.dry_run:
        print("Dry run: skipping publish.")
        return 0

    # 3. Publish to Facebook
    try:
        result = publish_post(message=caption, image_url=blog.get("image_url"))
        print(f"Published successfully. Post ID: {result.get('id', result.get('post_id', 'unknown'))}")
        return 0
    except Exception as e:
        print(f"Publish failed: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
