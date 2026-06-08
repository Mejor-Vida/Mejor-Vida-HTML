#!/usr/bin/env python3
"""
Mejor Vida Insurance — Facebook posting system.

Follows facebook-post-rules.md (repo root): main caption has no blog link; link in first comment;
INFO / REVISAR + DM; full package written to preview + FB/post-package.json.
After publish, schedules the first comment via Make.com webhook (10 min delay in Make).
Use --no-first-comment to skip; --first-comment-graph-api for legacy Graph API posting.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from urllib.parse import urlparse

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
        help="On publish: post main only; skip Make.com webhook and Graph API comment",
    )
    parser.add_argument(
        "--first-comment-graph-api",
        action="store_true",
        help="Post first comment via Graph API instead of Make.com webhook (legacy)",
    )
    parser.add_argument(
        "--first-comment-delay-seconds",
        type=int,
        default=600,
        metavar="N",
        help="Graph API mode only: wait N seconds before first comment (default: 600)",
    )
    parser.add_argument(
        "--first-comment-now",
        action="store_true",
        help="Graph API mode only: post first comment immediately",
    )
    parser.add_argument(
        "--from-json",
        type=str,
        default="",
        metavar="PATH",
        help="Load caption + first_comment + image_url from repo-relative JSON (e.g. FB/post-package-story1-weekly-2026-05-03.json)",
    )
    parser.add_argument(
        "--local-image",
        type=str,
        default="",
        metavar="PATH",
        help="Upload this image file with the post (repo-relative or absolute). Overrides auto-detect from JSON filename.",
    )
    parser.add_argument(
        "--no-image",
        action="store_true",
        help="Publish text-only (feed); skip photo upload even if image_url or local file exists",
    )
    args = parser.parse_args()

    repo_root = _root.parent

    def _local_image_for_url(image_url: str | None) -> Path | None:
        """If image_url basename exists under img/facebook/ or FB/assets/, use local upload (CDN may not be deployed yet)."""
        if not image_url:
            return None
        tail = (urlparse(image_url).path or "").rstrip("/").split("/")[-1]
        if not tail:
            return None
        for sub in ("img/facebook", "FB/assets"):
            p = repo_root / sub / tail
            if p.is_file():
                return p
        return None

    config_path = _root / "config" / "settings.json"
    config = json.loads(config_path.read_text(encoding="utf-8"))
    language = config.get("default_language", "es")
    whatsapp_url = resolve_whatsapp_url(_root)

    if args.from_json.strip():
        jpath = Path(args.from_json.strip())
        if not jpath.is_absolute():
            jpath = repo_root / jpath
        data = json.loads(jpath.read_text(encoding="utf-8"))
        blog_url = data["blog_url"].strip()
        blog = {
            "title": "Mercado y solidez de aseguradoras (actualización semanal)",
            "summary": "Por qué no todas las aseguradoras son iguales; contexto de mercado y fortaleza financiera.",
            "url": blog_url,
            "image_url": data.get("image_url"),
            "post_date_iso": (data.get("post_date_iso") or "").strip() or "2026-05-03",
        }
        mkw = data.get("manychat_keywords") or ["INFO", "REVISAR"]
        weekly_package = FacebookPostPackage(
            main_caption=data["main_caption"].strip(),
            alternate_caption=(data.get("alternate_caption") or "").strip(),
            first_comment=data["first_comment"].strip(),
            image_prompt=(data.get("image_prompt") or "").strip(),
            manychat_keywords=tuple(str(x) for x in mkw),
            pinned_comment=(data.get("pinned_comment") or "").strip() or None,
        )
    else:
        # Featured blog: April 12–18, 2026 weekly update — focus: Iowa payout pause / senior safeguard (story 4).
        blog = {
            "title": "Iowa: pausa breve en pagos de seguro de vida para proteger adultos mayores",
            "summary": "Ley nueva (abr. 2026): la aseguradora puede demorar un pago si hay preocupación razonable de explotación; no es congelación permanente; más de 30 estados con ideas parecidas.",
            "url": "https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-04-19.html#story4",
            "image_url": "https://www.mejorvidainsurance.com/img/facebook/iowa-senior-safeguard-fb-2026-04.png",
            "post_date_iso": "2026-04-19",
        }
        blog_url = blog["url"]

        # Weekly curated package (override). Link only in first_comment — not in main_caption.
        weekly_package = FacebookPostPackage(
            main_caption="""¿Sabías que en Iowa una aseguradora de vida puede pausar por poco tiempo el pago del seguro si cree, con fundamento, que un adulto mayor podría estar siendo explotado con dinero?

No es para molestar a las familias honestas. Es para frenar a quienes aprovechan el duelo o la confusión para quedarse con lo que no les toca. La compañía debe revisar el caso y, si hace falta, coordinar con Protección para Adultos o las autoridades. La pausa no es para siempre.

Si algo en tu familia te suena raro—alguien nuevo que “ayuda” demasiado, firmas apuradas, cambios repentinos de beneficiario—vale la pena hablar con alguien de confianza o con el departamento de seguros de tu estado.

En Mejor Vida no estamos para asustarte ni presionarte. Estamos para explicar con claridad y ayudarte a proteger a los tuyos.

Comenta “INFO” si quieres el desglose completo (con contexto y preguntas frecuentes),
o “REVISAR” si quieres que revisemos tu situación o tus dudas sobre seguro de vida o gastos finales.

También puedes mandarnos mensaje directamente si prefieres no comentar en público.

#SeguroDeVida #GastosFinales #ProtegeATuFamilia #FamiliaHispana #AdultosMayores""",
            alternate_caption="""Iowa permite que una aseguradora pause un pago de vida un tiempo si hay señales de explotación financiera a un adulto mayor. No es contra familias normales; es contra abusos en momentos delicados.

Comenta “INFO” para el artículo o “REVISAR” para tu caso. También por mensaje directo.

#SeguroDeVida #GastosFinales #ProtegeATuFamilia""",
            first_comment=default_first_comment_with_link(blog_url, whatsapp_url=whatsapp_url)
            + "\n\n(Fuente citada en el blog: Insurance Business Magazine, 16 abr. 2026.)",
            image_prompt=(
                "Gráfico PNG en español (tools/render_iowa_fb_card_es.py): Iowa abr 2026, «Nueva protección para mayores», "
                "titular «Una pausa breve.», texto sobre retención temporal de pagos sospechosos; fuente Insurance Business Magazine; "
                "marca Mejor Vida. Archivos: img/facebook/ y FB/assets/ iowa-senior-safeguard-fb-2026-04.png."
            ),
            manychat_keywords=("INFO", "REVISAR"),
            pinned_comment=(
                "Si comentas INFO o REVISAR, te respondemos por mensaje. La información es educativa; cada caso y cada estado pueden ser distintos."
            ),
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
                "image_url": blog.get("image_url"),
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

    if args.no_first_comment:
        first_comment_mode = "none"
    elif args.first_comment_graph_api:
        first_comment_mode = "graph"
    else:
        first_comment_mode = "make"

    delay_sec = 0 if args.first_comment_now else args.first_comment_delay_seconds

    image_path_publish: Path | None = None
    if args.no_image:
        image_path_publish = None
        publish_image_url = None
    elif args.local_image.strip():
        li = Path(args.local_image.strip())
        image_path_publish = li if li.is_absolute() else repo_root / li
        if not image_path_publish.is_file():
            print(f"Publish failed: --local-image not found: {image_path_publish}", file=sys.stderr)
            return 1
    else:
        image_path_publish = _local_image_for_url(blog.get("image_url"))

    if not args.no_image:
        publish_image_url = None if image_path_publish is not None else blog.get("image_url")
        if image_path_publish is not None:
            print(f"Publishing with local image upload: {image_path_publish}", flush=True)

    try:
        result = publish_post_package(
            package,
            image_url=publish_image_url,
            image_path=image_path_publish,
            first_comment_mode=first_comment_mode,
            first_comment_delay_sec=delay_sec,
        )
        print(f"Published successfully: {result}")
        if first_comment_mode == "make" and result.get("make_first_comment_scheduled"):
            print(
                "\nFirst comment scheduled via Make.com (~10 min delay in Make).",
                flush=True,
            )
        elif first_comment_mode == "make" and result.get("make_first_comment_error"):
            print(
                f"\nWarning: Make.com first-comment webhook failed: {result['make_first_comment_error']}",
                file=sys.stderr,
                flush=True,
            )
            return 1
        elif first_comment_mode == "graph" and delay_sec > 0:
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
