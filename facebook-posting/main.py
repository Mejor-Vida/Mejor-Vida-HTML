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
from scripts.preview_html import infer_content_date_iso, write_preview_package
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

    # Featured blog: April 5–11, 2026 weekly update — focus story: PHL Variable Insurance (article 3).
    # Optional: "post_date_iso": "2026-04-12" overrides the date shown on FB preview (default: parsed from URL).
    blog = {
        "title": "PHL Variable Insurance: liquidación y qué importa a familias y asesores",
        "summary": "Déficit reportado, liquidación, protecciones con límites según el estado; comprar con ojos abiertos; recomendar compañías financieramente sólidas.",
        "url": "https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-04-12.html",
        "image_url": "https://www.mejorvidainsurance.com/img/blog-generated/weekly-insurance-update-2026-04-12/hero.png",
    }
    blog_url = blog["url"]

    config_path = _root / "config" / "settings.json"
    config = json.loads(config_path.read_text(encoding="utf-8"))
    language = config.get("default_language", "es")
    whatsapp_url = resolve_whatsapp_url(_root)

    # Weekly curated package (override). Link only in first_comment — not in main_caption.
    weekly_package = FacebookPostPackage(
        main_caption="""¿Qué pasa con tu seguro de vida si la compañía entra en un proceso donde ya no tiene suficiente dinero para cumplir con todo lo que debe?

En la prensa del sector está el caso de PHL Variable Insurance: avanza hacia liquidación y se habla de un déficit reportado muy grande. En palabras simples, a veces una aseguradora llega a un punto en el que los compromisos con los asegurados no cuadran con lo disponible, y el camino puede ser largo y complicado.

Si tú compras seguro para tu familia, esto no es para asustarte: es para que entiendas por qué importa la solidez financiera de la compañía, por qué conviene leer con calma lo que firmas, y por qué, en situaciones extremas, pueden existir redes de respaldo que cambian según el estado y casi siempre tienen límites. Lo que aplica a una persona puede no ser igual que a otra.

Si tú vendes o asesoras sobre seguros, este tipo de noticia también te recuerda algo básico: recomendar productos respaldados por compañías con fuerza financiera clara, y explicar bien los riesgos, es parte de cuidar a la gente que confía en ti.

No estamos aquí para venderte algo que no necesitas. Estamos para ayudarte a entender con información clara.

Comenta “INFO” si quieres el artículo donde lo desglosamos
o “REVISAR” si quieres que veamos tu caso contigo.

También puedes mandarnos mensaje directamente.

#SeguroDeVida #GastosFinales #ProtegeATuFamilia #FamiliaHispana #TranquilidadFinanciera""",
        alternate_caption="""PHL Variable Insurance y la liquidación: en simple, por qué importa la solidez de la aseguradora—si compras o si asesoras a alguien.

Comenta “INFO” para el artículo o “REVISAR” para tu situación. También por mensaje directo.

#SeguroDeVida #GastosFinales #ProtegeATuFamilia""",
        first_comment=default_first_comment_with_link(blog_url, whatsapp_url=whatsapp_url),
        image_prompt=(
            "Hero del blog (pareja hispana revisando documentos de seguro en casa, expresión de preocupación contenida; "
            "metáfora de liquidación e incertidumbre sobre recuperar el valor de la póliza; luz natural, editorial humano, sin texto ni logos)."
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
        content_date_iso=(blog.get("post_date_iso") or "").strip() or None,
    )
    _iso = (blog.get("post_date_iso") or "").strip() or infer_content_date_iso(blog_url)
    if _iso:
        print(f"Dated snapshot: {fb_dir / f'post-preview-{_iso}.html'}")
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
