#!/usr/bin/env python3
"""
Mejor Vida Insurance — Facebook posting system.

Follows facebook-post-rules.md (repo root): main caption has no blog link; link in first comment;
INFO / REVISAR + DM; full package written to preview + FB/post-package.json.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Add project root to path so we can import scripts
_root = Path(__file__).resolve().parent
sys.path.insert(0, str(_root))

from scripts.facebook_post_package import (
    FacebookPostPackage,
    default_first_comment_with_link,
    package_to_dict,
    resolve_whatsapp_url,
)
from scripts.generate_facebook_post import build_facebook_post_package
from scripts.preview_html import write_preview_package
from scripts.publish_facebook import publish_post_package


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate and publish Facebook post from blog content")
    parser.add_argument("--dry-run", action="store_true", help="Generate package only, do not publish")
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Same as --dry-run: no publish (FB/post-preview.html is updated on every run)",
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Add meta refresh to preview HTML (use with http:// from dev_preview.py or serve_preview.py)",
    )
    parser.add_argument(
        "--no-first-comment",
        action="store_true",
        help="On publish: post main only; do not post the follow-up comment via API (paste manually if you want)",
    )
    parser.add_argument(
        "--first-comment-delay-seconds",
        type=int,
        default=600,
        metavar="N",
        help="Wait N seconds after the main post before posting the first comment (default: 600 = 10 minutes)",
    )
    parser.add_argument(
        "--first-comment-now",
        action="store_true",
        help="Post the first comment immediately (same as --first-comment-delay-seconds 0)",
    )
    args = parser.parse_args()

    # Featured blog: March 29 – April 4, 2026 weekly update (matches blog.html)
    blog = {
        "title": "Actualización semanal - 29 de marzo al 4 de abril de 2026",
        "summary": "Supervisión de IA en la NAIC, estudio LIMRA/NAILBA sobre adopción de IA en distribución, consulta sobre ilustraciones de anualidades indexadas.",
        "url": "https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-03-29.html",
        "image_url": "https://www.mejorvidainsurance.com/img/blog-generated/weekly-insurance-update-2026-03-29/hero.png",
    }
    blog_url = blog["url"]

    config_path = _root / "config" / "settings.json"
    config = json.loads(config_path.read_text(encoding="utf-8"))
    language = config.get("default_language", "es")
    whatsapp_url = resolve_whatsapp_url(_root)

    # Weekly curated package (override). Link only in first_comment — not in main_caption.
    weekly_package = FacebookPostPackage(
        main_caption="""¿Alguna vez te preguntaste si realmente entiendes el seguro que tienes… o solo confiaste en lo que te dijeron?

A muchas familias les pasa… hasta que ya es demasiado tarde.

Te lo explicamos fácil:
Qué está cambiando con la inteligencia artificial en los seguros,
cómo puede afectar lo que pagas y el servicio que recibes,
y por qué los números “bonitos” no siempre reflejan la realidad.

Tu tranquilidad y la de tu familia empiezan con entender qué estás firmando.

No estamos aquí para venderte algo que no necesitas — estamos para ayudarte a entender.

Comenta “INFO” si quieres el desglose del artículo
o “REVISAR” si quieres que veamos tu caso contigo.

También puedes mandarnos mensaje directamente.

#SeguroDeVida #GastosFinales #ProtegeATuFamilia #FamiliaHispana #TranquilidadFinanciera""",
        alternate_caption="""¿Entiendes tu seguro o solo lo que te dijeron?

Te explicamos en simple qué puede cambiar con la IA en seguros y por qué importa a tu familia.

Comenta “INFO” o “REVISAR”, o mándanos mensaje.

#SeguroDeVida #GastosFinales #ProtegeATuFamilia""",
        first_comment=default_first_comment_with_link(blog_url, whatsapp_url=whatsapp_url),
        image_prompt=(
            "Familia hispana en casa, conversación tranquila mirando pantalla o papeles; tono cálido y humano; "
            "sugerencia visual de claridad y confianza (no estética corporativa fría); nativo a Facebook; "
            "colores suaves, luz natural."
        ),
        manychat_keywords=("INFO", "REVISAR"),
        pinned_comment=None,
    )

    package = build_facebook_post_package(
        blog_title=blog["title"],
        blog_summary=blog["summary"],
        blog_url=blog_url,
        language=language,
        override=weekly_package,
    )

    print("=== Main caption (sin enlace al blog) ===\n")
    print(package.main_caption)
    print("\n=== Primer comentario (con enlace) ===\n")
    print(package.first_comment)
    print("\n=== Texto alternativo (corto) ===\n")
    print(package.alternate_caption)
    print("\n=== Prompt de imagen ===\n")
    print(package.image_prompt)
    print("\n=== Keywords ManyChat ===\n")
    print(", ".join(package.manychat_keywords))
    if package.pinned_comment:
        print("\n=== Comentario fijado (opcional) ===\n")
        print(package.pinned_comment)
    print("\n" + "-" * 40 + "\n")

    repo_root = _root.parent
    fb_dir = repo_root / "FB"
    fb_dir.mkdir(parents=True, exist_ok=True)
    preview_path = fb_dir / "post-preview.html"
    package_json = fb_dir / "post-package.json"

    write_preview_package(
        package,
        image_url=blog.get("image_url"),
        blog_url=blog_url,
        out_path=preview_path,
        auto_refresh_sec=3 if args.live else None,
    )
    package_json.write_text(
        json.dumps(
            {
                "blog_url": blog_url,
                "whatsapp_first_comment_url_used": whatsapp_url,
                **package_to_dict(package),
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Preview updated: {preview_path}")
    print(f"Package JSON: {package_json}")

    if args.preview or args.dry_run:
        if args.preview:
            print("Open that file in your browser (double-click or drag into Chrome/Safari).")
        else:
            print("Dry run: skipping publish.")
        return 0

    delay_sec = 0 if args.first_comment_now else args.first_comment_delay_seconds
    try:
        result = publish_post_package(
            package,
            image_url=blog.get("image_url"),
            post_first_comment=not args.no_first_comment,
            first_comment_delay_sec=0 if args.no_first_comment else delay_sec,
        )
        print(f"Published successfully: {result}")
        if not args.no_first_comment and delay_sec > 0:
            print(
                f"\nFirst comment is scheduled in {delay_sec}s (~{delay_sec // 60} min). "
                "Keep this terminal open until you see “First comment posted…” or the process will exit early.",
                flush=True,
            )
        return 0
    except Exception as e:
        print(f"Publish failed: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
