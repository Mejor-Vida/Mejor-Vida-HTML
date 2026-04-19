#!/usr/bin/env python3
"""
Generate Facebook post packages from blog content using facebook-post-rules.md (repo root).
Designed to plug in an LLM later; default simulation produces rule-compliant placeholders.
"""

from pathlib import Path
from typing import Optional

from scripts.facebook_post_package import (
    FacebookPostPackage,
    default_first_comment_with_link,
    resolve_whatsapp_url,
    warn_if_main_has_url,
)


def _load_template() -> str:
    """Load the Facebook post template from prompts folder (authoring guidance)."""
    template_path = Path(__file__).resolve().parents[1] / "prompts" / "facebook_post_template.md"
    return template_path.read_text(encoding="utf-8")


def _simulate_package(
    blog_title: str,
    blog_summary: str,
    blog_url: str,
    language: str,
) -> FacebookPostPackage:
    """
    Placeholder post when no override is provided. Follows funnel rules: no URL in main,
    INFO/REVISAR + DM, link only in first_comment.
    """
    _ = blog_summary  # hook/value can be replaced by LLM using this
    fb_root = Path(__file__).resolve().parents[1]
    wa = resolve_whatsapp_url(fb_root)

    if language == "es":
        main = f"""¿De verdad entiendes lo que estás pagando en tu seguro… o solo confiaste en lo que te dijeron?

Muchas familias descubren detalles tarde, cuando ya no hay vuelta atrás.

Te lo explicamos en palabras simples a partir de esto: {blog_title}
— qué puede importar en la vida real y qué conviene revisar con calma.

No estamos aquí para venderte algo que no necesitas — estamos para ayudarte a entender.

Comenta “INFO” si quieres el artículo completo
o “REVISAR” si quieres que veamos tu caso contigo.

También puedes mandarnos mensaje directamente.

#SeguroDeVida #GastosFinales #ProtegeATuFamilia #FamiliaHispana #TranquilidadFinanciera"""
        alternate = f"""¿Seguro que tu cobertura es la que crees?

Te explicamos {blog_title} sin tecnicismos.

Comenta “INFO” o “REVISAR”, o mándanos mensaje.

#SeguroDeVida #GastosFinales #ProtegeATuFamilia"""
        image_prompt = (
            "Escena cálida y realista: familia hispana en casa, conversando con calma sobre papeles o tablet; "
            "luz natural; sensación de confianza y claridad; estilo nativo de Facebook, sin corporativo frío."
        )
    elif language == "en":
        main = f"""Do you really understand what you're paying for in your insurance—or only what someone told you?

Many families find out too late.

We break it down in plain language from this: {blog_title}
— what matters day-to-day and what’s worth a calm second look.

We're not here to sell you what you don't need—we're here to help you understand.

Comment “INFO” for the full article
or “REVISAR” if you want us to look at your situation with you.

You can also message us directly.

#LifeInsurance #FinalExpense #ProtectYourFamily #PeaceOfMind"""
        alternate = f"""Think your coverage is what you think it is?

We explain {blog_title} without jargon.

Comment “INFO” or “REVISAR”, or message us.

#LifeInsurance #FinalExpense #ProtectYourFamily"""
        image_prompt = (
            "Warm, realistic Hispanic family at home, calm conversation, natural light, "
            "trustworthy tone, Facebook-native, not generic stock."
        )
    else:
        main = f"""¿De verdad entiendes tu seguro—or only what you were told?

Te lo explicamos simple: {blog_title}

Comment “INFO” / “REVISAR” or message us.

#SeguroDeVida #GastosFinales #ProtegeATuFamilia"""
        alternate = f"Bilingual short version: {blog_title}. INFO / REVISAR / DM."
        image_prompt = "Warm family scene, bilingual trust, Facebook-native, not corporate stock."

    lang_for_comment = "en" if language == "en" else "es"
    first = default_first_comment_with_link(blog_url, whatsapp_url=wa, language=lang_for_comment)

    warn_if_main_has_url(main)
    return FacebookPostPackage(
        main_caption=main.strip(),
        alternate_caption=alternate.strip(),
        first_comment=first.strip(),
        image_prompt=image_prompt.strip(),
        manychat_keywords=("INFO", "REVISAR"),
        pinned_comment=None,
    )


def build_facebook_post_package(
    blog_title: str,
    blog_summary: str,
    blog_url: str,
    language: str = "es",
    override: Optional[FacebookPostPackage] = None,
) -> FacebookPostPackage:
    """
    Build the full post package. If override is set (e.g. weekly curated content in main.py), use it
    after validating the main caption has no URL.
    """
    _ = _load_template()

    if override is not None:
        warn_if_main_has_url(override.main_caption)
        return override

    return _simulate_package(blog_title, blog_summary, blog_url, language)


# Back-compat: single-string caption (deprecated; use build_facebook_post_package)
def generate_facebook_post(
    blog_title: str,
    blog_summary: str,
    blog_url: str,
    language: str = "es",
    override_caption: Optional[str] = None,
) -> str:
    """
    Deprecated: returns main_caption only for legacy callers.
    Prefer build_facebook_post_package().
    """
    if override_caption and override_caption.strip():
        warn_if_main_has_url(override_caption)
        return override_caption.strip()
    pkg = _simulate_package(blog_title, blog_summary, blog_url, language)
    return pkg.main_caption
