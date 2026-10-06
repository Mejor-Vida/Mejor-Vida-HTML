#!/usr/bin/env python3
"""Build weekly consumer blog pages for 2026-09-06 from Aug 30 templates + fragments."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "weekly-insurance-update-2026-09-06"
FRAG = ROOT / "blog" / "_fragments"
PUB = "2026-09-06T22:00:00-05:00"
IMG_ABS = f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}"

STORIES = [
    {
        "es_file": "lista-precios-funeral-ftc-2026-09-06.html",
        "en_file": "funeral-price-list-ftc-2026-09-06.html",
        "es_title": "La lista de precios del funeral es una herramienta, no un paquete obligatorio",
        "en_title": "The funeral price list is a tool, not a required package",
        "es_desc": "La FTC exige una lista desglosada. Úsela para comparar funerarias y estimar un seguro de gastos finales.",
        "en_desc": "The FTC requires an itemized funeral price list. Use it to compare providers and size final expense coverage.",
        "og_image": f"{IMG_ABS}/story-1.png",
        "keywords_es": "regla de funerales, FTC, lista de precios, gastos finales",
        "keywords_en": "funeral rule, FTC, price list, final expense",
        "tags_es": ["regla de funerales", "FTC", "gastos finales", "lista de precios funeraria"],
        "tags_en": ["funeral rule", "FTC", "final expense", "funeral price list"],
        "faq_es": [
            ("¿La lista de precios es lo mismo que un seguro de gastos finales?", "No. La lista dice qué cobra la funeraria. El seguro paga un beneficio en efectivo al beneficiario, según el contrato."),
            ("¿Puedo pedir precios sin dar mi nombre?", "La FTC indica que puede pedir información de precios por teléfono. Use esa opción si le resulta más cómoda."),
            ("¿La regla cubre el cementerio?", "Por lo general no. Anote los costos del cementerio aparte cuando estime cuánta cobertura podría necesitar."),
        ],
        "faq_en": [
            ("Is the price list the same as final expense insurance?", "No. The list shows what the funeral home charges. The insurance pays a cash benefit to the beneficiary, according to the contract."),
            ("Can I ask for prices without giving my name?", "The FTC says you can request price information by phone. Use that option if it feels more comfortable."),
            ("Does the rule cover the cemetery?", "Generally no. Write cemetery costs separately when you estimate how much coverage you might need."),
        ],
        "frag_es": "weekly-2026-09-06-art1-es.html",
        "frag_en": "weekly-2026-09-06-art1-en.html",
        "preload": "story-1.webp",
    },
    {
        "es_file": "monto-seguro-gastos-finales-2026-09-06.html",
        "en_file": "how-much-final-expense-coverage-2026-09-06.html",
        "es_title": "Una mediana nacional no es la cuenta de su familia",
        "en_title": "A national median is not your family’s bill",
        "es_desc": "Cifras de NFDA como contexto. El monto de gastos finales debe nacer de precios locales.",
        "en_desc": "NFDA figures are context. Size final expense coverage from local prices, not a national median.",
        "og_image": f"{IMG_ABS}/story-2.png",
        "keywords_es": "gastos finales, NFDA, costo funeral, monto de cobertura",
        "keywords_en": "final expense, NFDA, funeral cost, coverage amount",
        "tags_es": ["gastos finales", "NFDA", "costo de funeral", "seguro de vida"],
        "tags_en": ["final expense", "NFDA", "funeral cost", "life insurance"],
        "faq_es": [
            ("¿Los 8,300 dólares de NFDA son lo que costará mi funeral?", "No. Es una mediana nacional de 2023 y no incluye todos los cargos del cementerio ni otros extras. Pida la lista local."),
            ("¿El seguro de gastos finales le paga a la funeraria?", "Por lo general no. Paga un beneficio en efectivo a la persona que usted nombra, según el contrato."),
            ("¿Debo comprar el mismo monto que la mediana nacional?", "No automáticamente. Use la mediana como contexto y construya su número con precios locales y el dinero ya reservado."),
        ],
        "faq_en": [
            ("Are NFDA’s $8,300 my funeral cost?", "No. It is a 2023 national median and does not include every cemetery charge or extra. Ask for the local list."),
            ("Does final expense insurance pay the funeral home?", "Usually not. It pays a cash benefit to the person you name, according to the contract."),
            ("Should I buy the same amount as the national median?", "Not automatically. Use the median as context and build your number from local prices and money already set aside."),
        ],
        "frag_es": "weekly-2026-09-06-art2-es.html",
        "frag_en": "weekly-2026-09-06-art2-en.html",
        "preload": "story-2.webp",
    },
    {
        "es_file": "cotizacion-real-seguro-termino-2026-09-06.html",
        "en_file": "get-a-real-term-life-quote-2026-09-06.html",
        "es_title": "Una suposición no es una cotización de seguro a término",
        "en_title": "A guess is not a term life quote",
        "es_desc": "LIMRA: mucha gente sobreestima el término. Pida una cotización real. No es una promesa de prima.",
        "en_desc": "LIMRA: many people overestimate term cost. Ask for a real quote. It is not a premium promise.",
        "og_image": f"{IMG_ABS}/story-3.png",
        "keywords_es": "seguro a término, cotización, LIMRA, costo del seguro",
        "keywords_en": "term life, quote, LIMRA, life insurance cost",
        "tags_es": ["seguro a término", "cotización", "LIMRA", "gastos finales"],
        "tags_en": ["term life", "quote", "LIMRA", "final expense"],
        "faq_es": [
            ("¿El estudio de LIMRA es mi prima?", "No. Describe una brecha de percepción, sobre todo en adultos sanos de 18 a 30 años frente a un término de ejemplo. Su tarifa es otra cosa."),
            ("¿Una cotización inicial es el precio final?", "No siempre. Puede cambiar después de la suscripción. Léala como un punto de partida, no como una promesa."),
            ("¿Debo elegir la compañía de un ranking?", "No. Un ranking no es su expediente. Pregunte si la compañía ofrece el monto y el producto que usted necesita."),
        ],
        "faq_en": [
            ("Is the LIMRA study my premium?", "No. It describes a perception gap, especially for healthy adults 18 to 30 looking at a sample term policy. Your rate is something else."),
            ("Is an initial quote the final price?", "Not always. It can change after underwriting. Treat it as a starting point, not a promise."),
            ("Should I pick the company from a ranking?", "No. A ranking is not your file. Ask whether the company offers the amount and product you need."),
        ],
        "frag_es": "weekly-2026-09-06-art3-es.html",
        "frag_en": "weekly-2026-09-06-art3-en.html",
        "preload": "story-3.webp",
    },
]


def replace_hero(text: str, new: str) -> str:
    for start in ("<!-- Blog Hero -->", '<div class="blog-hero mv-news hero">'):
        i = text.find(start)
        if i < 0:
            continue
        j = text.find("\n</article>", i)
        if j < 0:
            continue
        return text[:i] + new + text[j:]
    raise SystemExit("hero/article markers not found")


def sub_meta(text: str, name: str, value: str) -> str:
    return re.sub(
        rf'<meta content="[^"]*" name="{name}"/>',
        f'<meta content="{value}" name="{name}"/>',
        text,
        count=1,
    )


def sub_prop(text: str, prop: str, value: str) -> str:
    return re.sub(
        rf'<meta content="[^"]*" property="{prop}"/>',
        f'<meta content="{value}" property="{prop}"/>',
        text,
        count=1,
    )


def faq_json(pairs: list[tuple[str, str]]) -> str:
    ents = []
    for q, a in pairs:
        ents.append(
            {
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a},
            }
        )
    return json.dumps(
        {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": ents},
        ensure_ascii=False,
        indent=1,
    )


def patch_head_common(text: str, *, title: str, desc: str, keywords: str, canonical: str, og_title: str, og_desc: str, og_url: str, og_image: str, locale: str, robots: str, headline: str, json_desc: str, keywords_json: list[str], page_id: str, word_count: int, lang: str, tags: list[str], preload: str, img_prefix: str) -> str:
    text = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", text, count=1)
    text = sub_meta(text, "description", desc)
    text = sub_meta(text, "keywords", keywords)
    text = sub_meta(text, "robots", robots)
    text = re.sub(
        r'<link href="https://www\.mejorvidainsurance\.com/[^"]*" rel="canonical"/>',
        f'<link href="{canonical}" rel="canonical"/>',
        text,
        count=1,
    )
    text = sub_prop(text, "og:title", og_title)
    text = sub_prop(text, "og:description", og_desc)
    text = sub_prop(text, "og:url", og_url)
    text = sub_prop(text, "og:image", og_image)
    text = sub_prop(text, "og:locale", locale)
    text = sub_prop(text, "article:published_time", PUB)
    text = sub_prop(text, "article:modified_time", PUB)
    text = re.sub(
        r'(<meta content=")[^"]*(" property="article:tag"/>)',
        lambda m, tags=tags: m.group(0),
        text,
    )
    # Replace article:tag block
    tag_block = "\n".join([f'<meta content="{t}" property="article:tag"/>' for t in tags])
    text = re.sub(
        r'(<meta content="[^"]*" property="article:section"/>)\n(?:<meta content="[^"]*" property="article:tag"/>\n)+',
        r"\1\n" + tag_block + "\n",
        text,
        count=1,
    )
    text = re.sub(r'"headline": "[^"]*"', f'"headline": {json.dumps(headline, ensure_ascii=False)}', text, count=1)
    text = re.sub(r'"description": "[^"]*"', f'"description": {json.dumps(json_desc, ensure_ascii=False)}', text, count=1)
    text = re.sub(r'"image": "[^"]*"', f'"image": "{og_image}"', text, count=1)
    text = re.sub(r'"datePublished": "[^"]*"', f'"datePublished": "{PUB}"', text, count=1)
    text = re.sub(r'"dateModified": "[^"]*"', f'"dateModified": "{PUB}"', text, count=1)
    text = re.sub(
        r'"@id": "https://www\.mejorvidainsurance\.com/[^"]*"',
        f'"@id": "{page_id}"',
        text,
        count=1,
    )
    text = re.sub(r'"wordCount": \d+', f'"wordCount": {word_count}', text, count=1)
    text = re.sub(
        r'"keywords": \[[\s\S]*?\]',
        '"keywords": ' + json.dumps(keywords_json, ensure_ascii=False, indent=2),
        text,
        count=1,
    )
    text = re.sub(
        r'<link rel="preload" as="image" href="[^"]+" type="image/webp" fetchpriority="high"/>',
        f'<link rel="preload" as="image" href="{img_prefix}{preload}" type="image/webp" fetchpriority="high"/>',
        text,
        count=1,
    )
    return text


def patch_digest(lang: str) -> None:
    if lang == "es":
        path = ROOT / "blog" / f"{SLUG}.html"
        frag = (FRAG / "weekly-2026-09-06-digest-es.html").read_text(encoding="utf-8")
        title = "Tres claves para comparar un funeral y un seguro de vida | Mejor Vida Seguros"
        desc = "Guía del 6 de septiembre de 2026: lista de precios funeraria, monto de gastos finales y cotización real de seguro a término."
        keywords = "seguro de vida, gastos finales, funeral, lista de precios, seguro a término"
        canonical = f"https://www.mejorvidainsurance.com/blog/{SLUG}.html"
        og_image = f"{IMG_ABS}/hero-es.png"
        locale = "es_US"
        robots = "index, follow"
        headline = "Tres claves para comparar un funeral y un seguro de vida con más claridad"
        json_desc = "Tres guías para familias: lista de precios de la FTC, cifras de NFDA y cotización de seguro a término."
        kjson = ["seguro de gastos finales", "seguro de vida", "regla de funerales", "seguro a término"]
        tags = ["seguro de vida", "gastos finales", "funeral", "seguro a término"]
        img_prefix = f"../img/opt/blog-generated/{SLUG}/"
        preload = "hero-es.webp"
        lang_href = f"/en/blog/{SLUG}.html"
        hreflang = f'<link href="{canonical}" hreflang="es-US" rel="alternate"/><link href="{canonical}" hreflang="x-default" rel="alternate"/>'
    else:
        path = ROOT / "en/blog" / f"{SLUG}.html"
        frag = (FRAG / "weekly-2026-09-06-digest-en.html").read_text(encoding="utf-8")
        title = "Three practical keys for comparing a funeral and life insurance | Mejor Vida Insurance"
        desc = "September 6, 2026 guide: funeral price lists, final expense amount, and a real term life quote."
        keywords = "life insurance, final expense, funeral costs, term life, FTC, NFDA"
        canonical = f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html"
        og_image = f"{IMG_ABS}/hero-en.png"
        locale = "en_US"
        robots = "noindex, follow"
        headline = "Three practical keys for comparing a funeral and life insurance more clearly"
        json_desc = "Three family guides: FTC funeral price list, NFDA cost figures, and a real term life quote."
        kjson = ["final expense insurance", "life insurance", "funeral rule", "term life"]
        tags = ["life insurance", "final expense", "funeral", "term life"]
        img_prefix = f"../../img/opt/blog-generated/{SLUG}/"
        preload = "hero-en.webp"
        lang_href = f"/blog/{SLUG}.html"
        hreflang = ""

    text = path.read_text(encoding="utf-8")
    text = text.replace("weekly-insurance-update-2026-08-30", SLUG)
    text = text.replace("2026-08-30", "2026-09-06")
    text = patch_head_common(
        text,
        title=title,
        desc=desc,
        keywords=keywords,
        canonical=canonical,
        og_title=headline,
        og_desc=desc,
        og_url=canonical,
        og_image=og_image,
        locale=locale,
        robots=robots,
        headline=headline,
        json_desc=json_desc,
        keywords_json=kjson,
        page_id=canonical,
        word_count=1200,
        lang=lang,
        tags=tags,
        preload=preload,
        img_prefix=img_prefix,
    )
    # Breadcrumb + ItemList
    items_es = [
        (STORIES[0]["es_file"], STORIES[0]["es_title"]),
        (STORIES[1]["es_file"], STORIES[1]["es_title"]),
        (STORIES[2]["es_file"], STORIES[2]["es_title"]),
    ]
    items_en = [
        (STORIES[0]["en_file"], STORIES[0]["en_title"]),
        (STORIES[1]["en_file"], STORIES[1]["en_title"]),
        (STORIES[2]["en_file"], STORIES[2]["en_title"]),
    ]
    items = items_es if lang == "es" else items_en
    base = "https://www.mejorvidainsurance.com/blog/" if lang == "es" else "https://www.mejorvidainsurance.com/en/blog/"
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio" if lang == "es" else "Home", "item": "https://www.mejorvidainsurance.com/" if lang == "es" else "https://www.mejorvidainsurance.com/en/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.mejorvidainsurance.com/blog.html" if lang == "es" else "https://www.mejorvidainsurance.com/en/blog.html"},
            {"@type": "ListItem", "position": 3, "name": headline, "item": canonical},
        ],
    }
    itemlist = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Temas para familias — 6 de septiembre de 2026" if lang == "es" else "Topics for families — September 6, 2026",
        "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "url": base + fn, "name": name}
            for i, (fn, name) in enumerate(items)
        ],
    }
    text = re.sub(
        r'<!-- JSON-LD: BreadcrumbList -->\s*<script type="application/ld\+json">[\s\S]*?</script>',
        "<!-- JSON-LD: BreadcrumbList -->\n<script type=\"application/ld+json\">\n"
        + json.dumps(crumbs, ensure_ascii=False, indent=1)
        + "\n</script>",
        text,
        count=1,
    )
    text = re.sub(
        r'<!-- JSON-LD: ItemList for news stories -->\s*<script type="application/ld\+json">[\s\S]*?</script>',
        "<!-- JSON-LD: ItemList for news stories -->\n<script type=\"application/ld+json\">\n"
        + json.dumps(itemlist, ensure_ascii=False, indent=1)
        + "\n</script>",
        text,
        count=1,
    )
    if lang == "es":
        text = re.sub(
            r'<link href="https://www\.mejorvidainsurance\.com/blog/[^"]*" hreflang="es-US" rel="alternate"/><link href="https://www\.mejorvidainsurance\.com/blog/[^"]*" hreflang="x-default" rel="alternate"/>',
            hreflang,
            text,
            count=1,
        )
        text = re.sub(
            r'<a href="/en/" class="mvi-lang-fab text-decoration-none" title="View site in English">English</a>',
            f'<a href="{lang_href}" class="mvi-lang-fab text-decoration-none" title="View this page in English">English</a>',
            text,
            count=1,
        )
    else:
        text = re.sub(
            r'<a href="[^"]*" class="mvi-lang-fab text-decoration-none" title="Ver sitio en español">Español</a>',
            f'<a href="{lang_href}" class="mvi-lang-fab text-decoration-none" title="Ver esta página en español">Español</a>',
            text,
            count=1,
        )
        # Strip leftover hreflang to ES if present
        text = re.sub(r'<link href="https://www\.mejorvidainsurance\.com/[^"]*" hreflang="[^"]*" rel="alternate"/>', "", text)
    text = replace_hero(text, frag)
    path.write_text(text, encoding="utf-8")
    print(f"patched digest {path.relative_to(ROOT)}")


def patch_article(story: dict, lang: str) -> None:
    if lang == "es":
        path = ROOT / "blog" / story["es_file"]
        frag = (FRAG / story["frag_es"]).read_text(encoding="utf-8")
        title = f"{story['es_title']} | Mejor Vida Seguros"
        desc = story["es_desc"]
        keywords = story["keywords_es"]
        canonical = f"https://www.mejorvidainsurance.com/blog/{story['es_file']}"
        og_image = story["og_image"]
        locale = "es_US"
        robots = "index, follow"
        headline = story["es_title"]
        tags = story["tags_es"]
        kjson = story["tags_es"]
        img_prefix = f"../img/opt/blog-generated/{SLUG}/"
        faq = story["faq_es"]
        lang_href = f"/en/blog/{story['en_file']}"
        crumb_home = ("Inicio", "https://www.mejorvidainsurance.com/")
        crumb_blog = ("Blog", "https://www.mejorvidainsurance.com/blog.html")
        crumb_week = ("Resumen semanal — 6 de septiembre de 2026", f"https://www.mejorvidainsurance.com/blog/{SLUG}.html")
    else:
        path = ROOT / "en/blog" / story["en_file"]
        frag = (FRAG / story["frag_en"]).read_text(encoding="utf-8")
        title = f"{story['en_title']} | Mejor Vida Insurance"
        desc = story["en_desc"]
        keywords = story["keywords_en"]
        canonical = f"https://www.mejorvidainsurance.com/en/blog/{story['en_file']}"
        og_image = story["og_image"]
        locale = "en_US"
        robots = "noindex, follow"
        headline = story["en_title"]
        tags = story["tags_en"]
        kjson = story["tags_en"]
        img_prefix = f"../../img/opt/blog-generated/{SLUG}/"
        faq = story["faq_en"]
        lang_href = f"/blog/{story['es_file']}"
        crumb_home = ("Home", "https://www.mejorvidainsurance.com/en/")
        crumb_blog = ("Blog", "https://www.mejorvidainsurance.com/en/blog.html")
        crumb_week = ("Weekly digest — September 6, 2026", f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html")

    text = path.read_text(encoding="utf-8")
    text = text.replace("weekly-insurance-update-2026-08-30", SLUG)
    text = text.replace("2026-08-30", "2026-09-06")
    text = patch_head_common(
        text,
        title=title,
        desc=desc,
        keywords=keywords,
        canonical=canonical,
        og_title=headline,
        og_desc=desc,
        og_url=canonical,
        og_image=og_image,
        locale=locale,
        robots=robots,
        headline=headline,
        json_desc=desc,
        keywords_json=kjson,
        page_id=canonical,
        word_count=750,
        lang=lang,
        tags=tags,
        preload=story["preload"],
        img_prefix=img_prefix,
    )
    faq_block = (
        "<!-- JSON-LD: FAQPage for AEO -->\n"
        '<script type="application/ld+json">\n'
        + faq_json(faq)
        + "\n</script>"
    )
    text = re.sub(
        r'<!-- JSON-LD: FAQPage for AEO -->\s*<script type="application/ld\+json">[\s\S]*?</script>',
        faq_block,
        text,
        count=1,
    )
    crumbs = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": crumb_home[0], "item": crumb_home[1]},
            {"@type": "ListItem", "position": 2, "name": crumb_blog[0], "item": crumb_blog[1]},
            {"@type": "ListItem", "position": 3, "name": crumb_week[0], "item": crumb_week[1]},
            {"@type": "ListItem", "position": 4, "name": headline, "item": canonical},
        ],
    }
    text = re.sub(
        r'<!-- JSON-LD: BreadcrumbList -->\s*<script type="application/ld\+json">[\s\S]*?</script>',
        "<!-- JSON-LD: BreadcrumbList -->\n<script type=\"application/ld+json\">\n"
        + json.dumps(crumbs, ensure_ascii=False, indent=1)
        + "\n</script>",
        text,
        count=1,
    )
    if lang == "es":
        text = re.sub(
            r'<link href="https://www\.mejorvidainsurance\.com/blog/[^"]*" hreflang="es-US" rel="alternate"/><link href="https://www\.mejorvidainsurance\.com/blog/[^"]*" hreflang="x-default" rel="alternate"/>',
            f'<link href="{canonical}" hreflang="es-US" rel="alternate"/><link href="{canonical}" hreflang="x-default" rel="alternate"/>',
            text,
            count=1,
        )
        text = re.sub(
            r'<a href="/en/" class="mvi-lang-fab text-decoration-none" title="View site in English">English</a>',
            f'<a href="{lang_href}" class="mvi-lang-fab text-decoration-none" title="View this page in English">English</a>',
            text,
            count=1,
        )
    else:
        text = re.sub(r'<link href="https://www\.mejorvidainsurance\.com/[^"]*" hreflang="[^"]*" rel="alternate"/>', "", text)
        text = re.sub(
            r'<a href="[^"]*" class="mvi-lang-fab text-decoration-none" title="Ver sitio en español">Español</a>',
            f'<a href="{lang_href}" class="mvi-lang-fab text-decoration-none" title="Ver esta página en español">Español</a>',
            text,
            count=1,
        )
    text = replace_hero(text, frag)
    path.write_text(text, encoding="utf-8")
    print(f"patched article {path.relative_to(ROOT)}")


def insert_blog_card() -> None:
    es_card = """<!-- BLOG CARD: Weekly Insurance Update September 6, 2026 -->
<div class="col-12 col-lg-10">
<article class="blog-card h-100">
<div class="row g-0 align-items-stretch">
<div class="col-12 col-md-5">
<a class="d-block h-100 text-decoration-none blog-card-thumb-link blog-card-thumb-link--contain" href="/blog/weekly-insurance-update-2026-09-06.html">
<picture>
<source type="image/webp" srcset="/img/opt/blog-generated/weekly-insurance-update-2026-09-06/story-1.webp"/>
<img alt="Adulto hispano solicita una lista escrita de precios en una funeraria" class="blog-card-thumb blog-card-thumb--contain" src="/img/opt/blog-generated/weekly-insurance-update-2026-09-06/story-1.png" width="800" height="450" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='/img/opt/3-1-2026-Blog.png'"/>
</picture>
</a>
</div>
<div class="col-12 col-md-7">
<div class="p-3 p-md-4 d-flex flex-column justify-content-center blog-card-body">
<h3 class="h5 fw-bold mb-2 blog-card-title" style="color:#1a365d;">Tres claves para comparar un funeral y un seguro de vida — 6 de septiembre de 2026</h3>
<ul class="small text-muted mb-2 ps-3 blog-card-hook">
<li>Lista de precios funeraria de la FTC</li>
<li>Monto de gastos finales frente a cifras nacionales</li>
<li>Cotización real de seguro a término</li>
</ul>
<a class="btn btn-outline-primary btn-sm align-self-start mt-auto" href="/blog/weekly-insurance-update-2026-09-06.html">Leer resumen</a>
</div>
</div>
</div>
</article>
</div>
"""
    en_card = """<!-- BLOG CARD: Weekly Insurance Update September 6, 2026 -->
<div class="col-12 col-lg-10">
<article class="blog-card h-100">
<div class="row g-0 align-items-stretch">
<div class="col-12 col-md-5">
<a class="d-block h-100 text-decoration-none blog-card-thumb-link blog-card-thumb-link--contain" href="/en/blog/weekly-insurance-update-2026-09-06.html">
<picture>
<source type="image/webp" srcset="/img/opt/blog-generated/weekly-insurance-update-2026-09-06/story-1.webp"/>
<img alt="Hispanic adult requesting a written funeral price list" class="blog-card-thumb blog-card-thumb--contain" src="/img/opt/blog-generated/weekly-insurance-update-2026-09-06/story-1.png" width="800" height="450" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='/img/opt/3-1-2026-Blog.png'"/>
</picture>
</a>
</div>
<div class="col-12 col-md-7">
<div class="p-3 p-md-4 d-flex flex-column justify-content-center blog-card-body">
<h3 class="h5 fw-bold mb-2 blog-card-title" style="color:#1a365d;">Three keys for comparing a funeral and life insurance — September 6, 2026</h3>
<ul class="small text-muted mb-2 ps-3 blog-card-hook">
<li>FTC funeral price list</li>
<li>Final expense amount vs national figures</li>
<li>A real term life quote</li>
</ul>
<a class="btn btn-outline-primary btn-sm align-self-start mt-auto" href="/en/blog/weekly-insurance-update-2026-09-06.html">Read digest</a>
</div>
</div>
</div>
</article>
</div>
"""
    for path, marker, card in (
        (ROOT / "blog.html", "<!-- BLOG CARD: Weekly Insurance Update August 30, 2026 (week August 23–29, 2026) -->", es_card),
        (ROOT / "en/blog.html", "<!-- BLOG CARD: Weekly Insurance Update August 30, 2026 (week August 23–29, 2026) -->", en_card),
    ):
        text = path.read_text(encoding="utf-8")
        if "weekly-insurance-update-2026-09-06.html" in text:
            print(f"card already in {path.name}")
            continue
        if marker not in text:
            raise SystemExit(f"card marker missing in {path}")
        path.write_text(text.replace(marker, card + marker, 1), encoding="utf-8")
        print(f"inserted card in {path.name}")


def main() -> None:
    patch_digest("es")
    patch_digest("en")
    for s in STORIES:
        patch_article(s, "es")
        patch_article(s, "en")
    insert_blog_card()


if __name__ == "__main__":
    main()
