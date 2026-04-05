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
        help="Same as --dry-run: no publish (FB/post-preview.html is updated on every run)",
    )
    args = parser.parse_args()
    # Featured blog: March 29 – April 4, 2026 weekly update (matches blog.html)
    blog = {
        "title": "Actualización semanal - 29 de marzo al 4 de abril de 2026",
        "summary": "Supervisión de IA en la NAIC, estudio LIMRA/NAILBA sobre adopción de IA en distribución, consulta sobre ilustraciones de anualidades indexadas.",
        "url": "https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-03-29.html",
        "image_url": "https://www.mejorvidainsurance.com/img/blog-generated/weekly-insurance-update-2026-03-29/hero.png",
    }

    # Curated caption (hook → why it matters → CTA → link → 2–4 hashtags)
    facebook_caption = """¿Alguna vez te preguntaste si la tecnología ya está cambiando cómo te venden y te cuidan el seguro? A muchas familias les pasa lo mismo.

En este artículo te lo contamos sin tecnicismos: qué están haciendo los reguladores para que la inteligencia artificial se use con más claridad y equidad, cómo eso puede tocar cotizaciones y servicio al cliente, y por qué conviene mirar con ojo los números “bonitos” en una propuesta de retiro o seguro—no siempre significan lo mismo en la vida real.

Tu tranquilidad y la de tu familia empiezan con entender qué estás firmando.

¿Dudas sobre tu cobertura o quieres una segunda opinión? Escríbenos por mensaje y te ayudamos.

https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-03-29.html

#MejorVidaInsurance #SeguroDeVida #FamiliaHispana"""
    # Versión corta y comentario fijado: facebook-posting/facebook_post_variants.txt

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

    repo_root = _root.parent
    preview_path = repo_root / "FB" / "post-preview.html"
    write_preview(
        caption,
        image_url=blog.get("image_url"),
        blog_url=blog["url"],
        out_path=preview_path,
    )
    print(f"Preview updated: {preview_path}")

    if args.preview or args.dry_run:
        if args.preview:
            print("Open that file in your browser (double-click or drag into Chrome/Safari).")
        else:
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
