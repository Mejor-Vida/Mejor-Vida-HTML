#!/usr/bin/env python3
"""Build weekly consumer blog pages for 2026-09-13 from Sept 6 templates + fragments."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "weekly-insurance-update-2026-09-13"
FRAG = ROOT / "blog" / "_fragments"
PUB = "2026-09-13T21:30:00-05:00"
IMG_ABS = f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}"

STORIES = [
    {
        "es_file": "solicitudes-seguro-vida-agosto-mib-2026-09-13.html",
        "en_file": "life-insurance-applications-august-mib-2026-09-13.html",
        "es_title": "Las solicitudes de seguro de vida subieron en agosto, sobre todo entre adultos mayores",
        "en_title": "Life insurance applications rose in August, led by older adults",
        "es_desc": "El MIB Life Index midió más solicitudes en agosto, con el mayor salto después de los 50. Una solicitud no es una póliza emitida.",
        "en_desc": "The MIB Life Index measured more applications in August, with the largest jump after age 50. An application is not an issued policy.",
        "og_image": f"{IMG_ABS}/story-1.png",
        "keywords_es": "solicitudes de seguro de vida, MIB, adultos mayores, seguro a término",
        "keywords_en": "life insurance applications, MIB, older adults, term life",
        "tags_es": ["seguro de vida", "MIB", "adultos mayores", "seguro a término"],
        "tags_en": ["life insurance", "MIB", "older adults", "term life"],
        "faq_es": [
            ("¿El 18% significa que las primas bajaron?", "No. El índice mide solicitudes, no precios. Su prima sigue dependiendo de su expediente y de la compañía."),
            ("¿Una solicitud es lo mismo que una póliza emitida?", "No. La solicitud es el inicio. La compañía todavía puede aprobar, posponer, limitar el monto o no ofrecer cobertura."),
            ("¿A los 70 años ya es demasiado tarde para preguntar?", "El dato de agosto muestra que muchas personas de 70 años o más sí solicitaron. Eso no garantiza aprobación."),
        ],
        "faq_en": [
            ("Does the 18% mean premiums went down?", "No. The index measures applications, not prices. Your premium still depends on your file and the company."),
            ("Is an application the same as an issued policy?", "No. The application is the start. The company can still approve, postpone, limit the amount, or decline to offer coverage."),
            ("Is it too late to ask at age 70?", "August’s data shows many people 70 and older did apply. That does not guarantee approval."),
        ],
        "frag_es": "weekly-2026-09-13-art1-es.html",
        "frag_en": "weekly-2026-09-13-art1-en.html",
        "preload": "story-1.webp",
    },
    {
        "es_file": "historial-manejo-seguro-vida-2026-09-13.html",
        "en_file": "driving-record-life-insurance-2026-09-13.html",
        "es_title": "El historial de manejo también puede entrar en el seguro de vida",
        "en_title": "Your driving record can enter a life insurance application too",
        "es_desc": "Las aseguradoras suelen revisar el registro de vehículos. Una multa no siempre cambia el precio; varias sí pueden.",
        "en_desc": "Life insurers commonly review a motor-vehicle record. One ticket often does not change the price; several can.",
        "og_image": f"{IMG_ABS}/story-2.png",
        "keywords_es": "historial de manejo, seguro de vida, MVR, DUI",
        "keywords_en": "driving record, life insurance, MVR, DUI",
        "tags_es": ["historial de manejo", "seguro de vida", "MVR", "gastos finales"],
        "tags_en": ["driving record", "life insurance", "MVR", "final expense"],
        "faq_es": [
            ("¿Una multa de estacionamiento sube mi seguro de vida?", "Por lo general no. Las infracciones menores sin movimiento normalmente no afectan la cotización de vida."),
            ("¿Un DUI significa que me van a rechazar?", "No de forma automática. Puede encarecer, aplazar o, en algunos casos, llevar a un rechazo. Las reglas varían según la compañía."),
            ("¿Esto cambia una póliza que ya pagué?", "No. Describe cómo se revisa una solicitud nueva. No reescribe un contrato que ya está en vigor."),
        ],
        "faq_en": [
            ("Will a parking ticket raise my life insurance?", "Usually not. Small non-moving violations typically do not affect life insurance quotes."),
            ("Does a DUI mean I will be declined?", "Not automatically. It can raise the cost, postpone an offer, or, in some cases, lead to a decline. Rules vary by company."),
            ("Does this change a policy I already pay for?", "No. It describes how a new application is reviewed. It does not rewrite a contract already in force."),
        ],
        "frag_es": "weekly-2026-09-13-art2-es.html",
        "frag_en": "weekly-2026-09-13-art2-en.html",
        "preload": "story-2.webp",
    },
    {
        "es_file": "quien-paga-cuentas-seguro-vida-2026-09-13.html",
        "en_file": "who-pays-the-bills-life-insurance-2026-09-13.html",
        "es_title": "Si usted muriera mañana, ¿quién tendría dificultades para pagar las cuentas?",
        "en_title": "If you died tomorrow, who would struggle to pay the bills?",
        "es_desc": "Las cuentas del hogar siguen aunque desaparezca un sueldo. Revise si la cobertura del trabajo lo acompaña.",
        "en_desc": "Household bills continue even when a paycheck stops. Check whether workplace coverage follows you.",
        "og_image": f"{IMG_ABS}/story-3.png",
        "keywords_es": "seguro de vida, beneficiario, cobertura del trabajo, seguro a término",
        "keywords_en": "life insurance, beneficiary, workplace coverage, term life",
        "tags_es": ["seguro de vida", "beneficiario", "cobertura laboral", "seguro a término"],
        "tags_en": ["life insurance", "beneficiary", "workplace coverage", "term life"],
        "faq_es": [
            ("¿El estudio que citó la estación es de LIMRA?", "No lo sabemos. La página no nombró el estudio. No atribuimos la cifra a otra fuente."),
            ("¿La cobertura del trabajo basta?", "A veces ayuda. Conviene confirmar el monto y si puede conservarse al dejar el empleo."),
            ("¿A los 50 años ya no tiene sentido el término?", "No. Suele costar más después de esa edad. Eso no es una regla de que el producto deja de ser útil."),
        ],
        "faq_en": [
            ("Is the study the station cited from LIMRA?", "We do not know. The page did not name the study. We do not assign the figure to another source."),
            ("Is workplace coverage enough?", "It can help. Confirm the amount and whether you can keep it after leaving the job."),
            ("Does term stop making sense at 50?", "No. It often costs more after that age. That is not a rule that the product stops being useful."),
        ],
        "frag_es": "weekly-2026-09-13-art3-es.html",
        "frag_en": "weekly-2026-09-13-art3-en.html",
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
        frag = (FRAG / "weekly-2026-09-13-digest-es.html").read_text(encoding="utf-8")
        title = "Solicitudes, historial de manejo y las cuentas que no se detienen | Mejor Vida Seguros"
        desc = "13 de septiembre de 2026: más solicitudes de seguro de vida, el historial de manejo y quién pagaría las cuentas."
        keywords = "seguro de vida, gastos finales, seguro a término, historial de manejo"
        canonical = f"https://www.mejorvidainsurance.com/blog/{SLUG}.html"
        og_image = f"{IMG_ABS}/hero-es.png"
        locale = "es_US"
        robots = "index, follow"
        headline = "Solicitudes, historial de manejo y las cuentas que no se detienen"
        json_desc = "Tres noticias para familias: solicitudes de agosto, historial de manejo y las cuentas que siguen."
        kjson = ["seguro de gastos finales", "seguro de vida", "seguro a término", "historial de manejo"]
        tags = ["seguro de vida", "gastos finales", "seguro a término", "historial de manejo"]
        img_prefix = f"../img/opt/blog-generated/{SLUG}/"
        preload = "hero-es.webp"
        lang_href = f"/en/blog/{SLUG}.html"
        hreflang = f'<link href="{canonical}" hreflang="es-US" rel="alternate"/><link href="{canonical}" hreflang="x-default" rel="alternate"/>'
    else:
        path = ROOT / "en/blog" / f"{SLUG}.html"
        frag = (FRAG / "weekly-2026-09-13-digest-en.html").read_text(encoding="utf-8")
        title = "Applications, driving records, and the bills that keep coming | Mejor Vida Insurance"
        desc = "September 13, 2026: more life insurance applications, driving records, and who would pay the bills."
        keywords = "life insurance, final expense, term life, driving record"
        canonical = f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html"
        og_image = f"{IMG_ABS}/hero-en.png"
        locale = "en_US"
        robots = "noindex, follow"
        headline = "Applications, driving records, and the bills that keep coming"
        json_desc = "Three family stories: August applications, driving records, and the bills that continue."
        kjson = ["final expense insurance", "life insurance", "term life", "driving record"]
        tags = ["life insurance", "final expense", "term life", "driving record"]
        img_prefix = f"../../img/opt/blog-generated/{SLUG}/"
        preload = "hero-en.webp"
        lang_href = f"/blog/{SLUG}.html"
        hreflang = ""

    text = path.read_text(encoding="utf-8")
    text = text.replace("weekly-insurance-update-2026-09-06", SLUG)
    text = text.replace("2026-09-06", "2026-09-13")
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
        "name": "Temas para familias — 13 de septiembre de 2026" if lang == "es" else "Topics for families — September 13, 2026",
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
        crumb_week = ("Resumen semanal — 13 de septiembre de 2026", f"https://www.mejorvidainsurance.com/blog/{SLUG}.html")
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
        crumb_week = ("Weekly digest — September 13, 2026", f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html")

    text = path.read_text(encoding="utf-8")
    text = text.replace("weekly-insurance-update-2026-09-06", SLUG)
    text = text.replace("2026-09-06", "2026-09-13")
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
    es_card = """<!-- BLOG CARD: Weekly Insurance Update September 13, 2026 -->
<div class="col-12 col-lg-10">
<article class="blog-card h-100">
<div class="row g-0 align-items-stretch">
<div class="col-12 col-md-5">
<a class="d-block h-100 text-decoration-none blog-card-thumb-link blog-card-thumb-link--contain" href="/blog/weekly-insurance-update-2026-09-13.html">
<picture>
<source type="image/webp" srcset="/img/opt/blog-generated/weekly-insurance-update-2026-09-13/story-1.webp"/>
<img alt="Pareja hispana mayor revisa papeles de una solicitud de seguro de vida en casa" class="blog-card-thumb blog-card-thumb--contain" src="/img/opt/blog-generated/weekly-insurance-update-2026-09-13/story-1.png" width="600" height="600" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='/img/opt/3-1-2026-Blog.png'"/>
</picture>
</a>
</div>
<div class="col-12 col-md-7">
<div class="p-3 p-md-4 d-flex flex-column justify-content-center blog-card-body">
<h3 class="h5 fw-bold mb-2 blog-card-title" style="color:#1a365d;">Solicitudes, historial de manejo y las cuentas que no se detienen — 13 de septiembre de 2026</h3>
<ul class="small text-muted mb-2 ps-3 blog-card-hook">
<li>Más solicitudes de seguro de vida en agosto</li>
<li>El historial de manejo en una solicitud</li>
<li>Quién pagaría las cuentas</li>
</ul>
<a class="btn btn-outline-primary btn-sm align-self-start mt-auto" href="/blog/weekly-insurance-update-2026-09-13.html">Leer resumen</a>
</div>
</div>
</div>
</article>
</div>
"""
    en_card = """<!-- BLOG CARD: Weekly Insurance Update September 13, 2026 -->
<div class="col-12 col-lg-10">
<article class="blog-card h-100">
<div class="row g-0 align-items-stretch">
<div class="col-12 col-md-5">
<a class="d-block h-100 text-decoration-none blog-card-thumb-link blog-card-thumb-link--contain" href="/en/blog/weekly-insurance-update-2026-09-13.html">
<picture>
<source type="image/webp" srcset="/img/opt/blog-generated/weekly-insurance-update-2026-09-13/story-1.webp"/>
<img alt="An older Hispanic couple reviews a life insurance application at home" class="blog-card-thumb blog-card-thumb--contain" src="/img/opt/blog-generated/weekly-insurance-update-2026-09-13/story-1.png" width="600" height="600" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='/img/opt/3-1-2026-Blog.png'"/>
</picture>
</a>
</div>
<div class="col-12 col-md-7">
<div class="p-3 p-md-4 d-flex flex-column justify-content-center blog-card-body">
<h3 class="h5 fw-bold mb-2 blog-card-title" style="color:#1a365d;">Applications, driving records, and the bills that keep coming — September 13, 2026</h3>
<ul class="small text-muted mb-2 ps-3 blog-card-hook">
<li>More life insurance applications in August</li>
<li>Driving records on an application</li>
<li>Who would pay the bills</li>
</ul>
<a class="btn btn-outline-primary btn-sm align-self-start mt-auto" href="/en/blog/weekly-insurance-update-2026-09-13.html">Read digest</a>
</div>
</div>
</div>
</article>
</div>
"""
    for path, marker, card in (
        (ROOT / "blog.html", "<!-- BLOG CARD: Weekly Insurance Update September 6, 2026 -->", es_card),
        (ROOT / "en/blog.html", "<!-- BLOG CARD: Weekly Insurance Update September 6, 2026 -->", en_card),
    ):
        text = path.read_text(encoding="utf-8")
        if "weekly-insurance-update-2026-09-13.html" in text:
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
