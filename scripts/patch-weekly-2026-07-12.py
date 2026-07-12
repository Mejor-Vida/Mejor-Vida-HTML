#!/usr/bin/env python3
"""Patch weekly-insurance-update-2026-07-12.html (ES + EN) — week of July 05–11, 2026."""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "weekly-insurance-update-2026-07-12"
IMG = f"../img/opt/blog-generated/{SLUG}"
IMG_EN = f"../../img/opt/blog-generated/{SLUG}"
FALLBACK_ES = "../img/opt/3-1-2026-Blog.png"
FALLBACK_EN = "../../img/opt/3-1-2026-Blog.png"
PRIOR = "weekly-insurance-update-2026-07-05.html"

META = {
    "en": {
        "path": ROOT / "en/blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "title": "Weekly U.S. Life & Final Expense Insurance Update (July 12, 2026) | Mejor Vida Insurance",
        "description": "July 12, 2026 weekly update: Unum $3.8B long-term care reinsurance with Fortitude Re, Medigap premiums surge 12–26%, NAIFA life settlement guidance — news from July 05–11, 2026.",
        "keywords": "weekly insurance update, final expense insurance, Unum, Fortitude Re, long-term care reinsurance, Medigap premiums, Medicare Supplement, NAIFA, life settlements",
        "og_title": "Weekly U.S. Life & Final Expense Insurance Update — July 12, 2026",
        "og_desc": "July 12, 2026: Unum $3.8B LTC reinsurance, Medigap premiums up 12–26%, NAIFA life settlement alert — week of July 05–11, 2026.",
        "json_headline": "Weekly U.S. Life & Final Expense Insurance Update — week of July 05–11, 2026",
        "json_alt": "July 12, 2026: Unum LTC reinsurance; Medigap premium surge; NAIFA life settlements",
        "json_desc": "Mejor Vida Insurance July 12, 2026 weekly briefing for agents: Unum Group's $3.8B long-term care reinsurance deal with Fortitude Re, Medigap premiums surging 12–26%, and NAIFA guidance on life settlements.",
        "itemlist_name": "Topics for agents — insurance market update July 05–11, 2026",
        "hero_h1": "Weekly U.S. Life &amp; Final Expense Insurance Update",
        "hero_date": "July 12, 2026 · News from July 05 – July 11, 2026",
        "hero_tags": "📰 3 Stories  |  🏥 Unum LTC Reinsurance  |  📈 Medigap Premiums  |  ⚠ Life Settlements",
        "hero_lead": "Welcome to this week's edition of the Weekly U.S. Life &amp; Final Expense Insurance Update — your curated briefing on the news that matters most to independent agents selling term life, whole life, final expense, and health insurance products. This week's edition covers a landmark long-term care reinsurance transaction, surging Medicare Supplement premiums, and critical guidance on life settlements for your clients.",
        "hero_img": f"{IMG_EN}/hero-en.png",
        "hero_webp": f"{IMG_EN}/hero-en.webp",
        "hero_alt": "Weekly insurance update July 12, 2026—Unum LTC reinsurance, Medigap premium surge, NAIFA life settlement guidance",
        "read_min": "About 28 min read",
        "disclaimer_week": "Content covers U.S. life and final expense insurance news from July 05 - July 11, 2026.",
        "prior_link": PRIOR,
        "prior_label": "July 5, 2026 update — prior week",
        "sidebar_prior": "July 5 update",
        "lang_link": f"/blog/{SLUG}.html",
        "lang_label": "Español",
        "fragment": ROOT / "blog/_fragments/weekly-2026-07-12-stories-en.html",
        "img_base": IMG_EN,
        "fallback": FALLBACK_EN,
        "sidebar": [
            ("story1", "Story 1 — Unum $3.8B LTC reinsurance"),
            ("story2", "Story 2 — Medigap premiums surge"),
            ("story3", "Story 3 — NAIFA life settlements"),
        ],
        "hreflang_es": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "hreflang_en": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "og_image": f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}/hero-en.png",
        "published": "2026-07-12T08:00:00-06:00",
    },
    "es": {
        "path": ROOT / "blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "title": "Actualización semanal de seguros de vida y gastos finales (12 julio 2026) | Mejor Vida Insurance",
        "description": "Actualización del 12 de julio de 2026: reaseguro de cuidado a largo plazo Unum–Fortitude Re por $3.8 mil millones, primas Medigap suben 12–26%, alerta NAIFA sobre liquidaciones de vida — noticias del 5 al 11 de julio de 2026.",
        "keywords": "actualización semanal seguros, gastos finales, Unum, Fortitude Re, reaseguro LTC, primas Medigap, suplemento Medicare, NAIFA, liquidaciones de vida",
        "og_title": "Actualización semanal de vida y gastos finales — 12 de julio de 2026",
        "og_desc": "12 julio 2026: reaseguro LTC Unum $3.8B, primas Medigap 12–26%, alerta NAIFA liquidaciones de vida — semana del 5 al 11 de julio de 2026.",
        "json_headline": "Actualización semanal de seguros de vida y gastos finales en EE. UU. — semana del 5 al 11 de julio de 2026",
        "json_alt": "12 julio 2026: reaseguro LTC Unum; aumento primas Medigap; liquidaciones de vida NAIFA",
        "json_desc": "Resumen semanal Mejor Vida Insurance del 12 de julio de 2026 para agentes: transacción de reaseguro LTC Unum–Fortitude Re por $3.8 mil millones, aumento de primas Medigap del 12–26% y guía NAIFA sobre liquidaciones de pólizas de vida.",
        "itemlist_name": "Temas para agentes — actualización del mercado 5–11 julio 2026",
        "hero_h1": "Actualización semanal de seguros de vida y gastos finales en EE. UU.",
        "hero_date": "12 de julio de 2026 · Noticias del 5 al 11 de julio de 2026",
        "hero_tags": "📰 3 historias  |  🏥 Reaseguro LTC Unum  |  📈 Primas Medigap  |  ⚠ Liquidaciones de vida",
        "hero_lead": "Bienvenido a esta edición del resumen semanal de seguros de vida y gastos finales en EE. UU. — su briefing curado sobre las noticias que más importan a agentes independientes que venden vida a término, vida entera, gastos finales y productos de salud. Esta semana cubre una transacción histórica de reaseguro de cuidado a largo plazo, el alza de primas de Medigap y orientación crítica sobre liquidaciones de pólizas de vida para sus clientes.",
        "hero_img": f"{IMG}/hero-es.png",
        "hero_webp": f"{IMG}/hero-es.webp",
        "hero_alt": "Actualización semanal 12 julio 2026—reaseguro LTC Unum, aumento primas Medigap, guía NAIFA liquidaciones de vida",
        "read_min": "Aprox. 28 min de lectura",
        "disclaimer_week": "El contenido cubre noticias de EE. UU. sobre vida y gastos finales del 5 al 11 de julio de 2026.",
        "prior_link": PRIOR,
        "prior_label": "Actualización 5 julio 2026 — semana anterior",
        "sidebar_prior": "Actualización del 5 de julio",
        "lang_link": f"/en/blog/{SLUG}.html",
        "lang_label": "English",
        "fragment": ROOT / "blog/_fragments/weekly-2026-07-12-stories-es.html",
        "img_base": IMG,
        "fallback": FALLBACK_ES,
        "sidebar": [
            ("story1", "Historia 1 — reaseguro LTC Unum $3.8B"),
            ("story2", "Historia 2 — alza de primas Medigap"),
            ("story3", "Historia 3 — liquidaciones de vida NAIFA"),
        ],
        "hreflang_es": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "hreflang_en": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "og_image": f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}/hero-es.png",
        "published": "2026-07-12T08:00:00-06:00",
    },
}

ITEMLIST_JSON = """[
      {"@type":"ListItem","position":1,"item":{"@type":"NewsArticle","headline":"Unum Group $3.8B Long-Term Care Reinsurance Deal with Fortitude Re","datePublished":"2026-07-06","publisher":{"@type":"Organization","name":"Business Wire / Unum Group"}}},
      {"@type":"ListItem","position":2,"item":{"@type":"NewsArticle","headline":"Medigap Premiums Surge 12–26% in 2026","datePublished":"2026-07-08","publisher":{"@type":"Organization","name":"CBS News"}}},
      {"@type":"ListItem","position":3,"item":{"@type":"NewsArticle","headline":"NAIFA Alert: What Clients Must Know Before Selling a Life Insurance Policy","datePublished":"2026-07-11","publisher":{"@type":"Organization","name":"InsuranceNewsNet / NAIFA"}}}
    ]"""


def load_stories(m: dict) -> str:
    raw = m["fragment"].read_text(encoding="utf-8")
    return raw.replace("IMG_BASE", m["img_base"]).replace("IMG_FALLBACK", m["fallback"])


def patch_file(lang: str) -> None:
    m = META[lang]
    text = m["path"].read_text(encoding="utf-8")
    # Base files were copied from July 5.
    text = text.replace("weekly-insurance-update-2026-07-05", SLUG)
    text = text.replace("weekly-insurance-update-2026-06-28", "weekly-insurance-update-2026-07-05")
    text = text.replace("2026-07-05", "2026-07-12")
    if lang == "en":
        text = text.replace("July 5, 2026", "July 12, 2026")
        text = text.replace("June 28 – July 04, 2026", "July 05 – July 11, 2026")
        text = text.replace("June 28–July 04, 2026", "July 05–July 11, 2026")
        text = text.replace("June 28 - July 04, 2026", "July 05 - July 11, 2026")
        text = text.replace("June 28–July 04", "July 05–July 11")
    else:
        text = text.replace("5 de julio de 2026", "12 de julio de 2026")
        text = text.replace("28 de junio al 4 de julio de 2026", "5 al 11 de julio de 2026")
        text = text.replace("del 28 de junio al 4 de julio de 2026", "del 5 al 11 de julio de 2026")
    text = re.sub(r"<title>.*?</title>", f"<title>{m['title']}</title>", text, count=1)
    text = re.sub(
        r'<meta content="[^"]*" name="description"/>',
        f'<meta content="{m["description"]}" name="description"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="[^"]*" name="keywords"/>',
        f'<meta content="{m["keywords"]}" name="keywords"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="[^"]*" property="og:title"/>',
        f'<meta content="{m["og_title"]}" property="og:title"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="[^"]*" property="og:description"/>',
        f'<meta content="{m["og_desc"]}" property="og:description"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="https://www\.mejorvidainsurance\.com/img/[^"]*" property="og:image"/>',
        f'<meta content="{m["og_image"]}" property="og:image"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="2026-07-12T[^"]*" property="article:published_time"/>',
        f'<meta content="{m["published"]}" property="article:published_time"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="2026-07-12T[^"]*" property="article:modified_time"/>',
        f'<meta content="{m["published"]}" property="article:modified_time"/>',
        text,
        count=1,
    )
    text = re.sub(r'"headline": "[^"]*"', f'"headline": "{m["json_headline"]}"', text, count=1)
    text = re.sub(
        r'"alternativeHeadline": "[^"]*"',
        f'"alternativeHeadline": "{m["json_alt"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"description": "Mejor Vida Insurance[^"]*"',
        f'"description": "{m["json_desc"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"description": "Resumen semanal Mejor Vida[^"]*"',
        f'"description": "{m["json_desc"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"datePublished": "2026-07-12T[^"]*"',
        f'"datePublished": "{m["published"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"dateModified": "2026-07-12T[^"]*"',
        f'"dateModified": "{m["published"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"name": "Topics for agents[^"]*"',
        f'"name": "{m["itemlist_name"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"name": "Temas para agentes[^"]*"',
        f'"name": "{m["itemlist_name"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"itemListElement": \[[\s\S]*?\]\s*\n  \}',
        f'"itemListElement": {ITEMLIST_JSON}\n  }}',
        text,
        count=1,
        flags=re.MULTILINE,
    )
    if lang == "en":
        text = re.sub(r"<h1>Weekly U\.S\. Life.*?</h1>", f"<h1>{m['hero_h1']}</h1>", text, count=1)
    else:
        text = re.sub(r"<h1>Actualización semanal.*?</h1>", f"<h1>{m['hero_h1']}</h1>", text, count=1)
    text = re.sub(
        r'<div class="blog-meta">[\s\S]*?</div>',
        f'<div class="blog-meta">\n<i class="fas fa-calendar-alt me-2"></i>{m["hero_date"]} |\n      <i class="fas fa-user ms-3 me-2"></i>Mejor Vida Insurance |\n      <i class="fas fa-clock ms-3 me-2"></i>{m["read_min"]}\n    </div>',
        text,
        count=1,
    )
    text = re.sub(
        r'<p class="lead mb-3 fw-semibold">.*?</p>',
        f'<p class="lead mb-3 fw-semibold">{m["hero_tags"]}</p>',
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r'<p class="lead mb-3">Welcome to your weekly.*?</p>',
        f'<p class="lead mb-3">{m["hero_lead"]}</p>',
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r'<p class="lead mb-3">Welcome to this week\'s edition.*?</p>',
        f'<p class="lead mb-3">{m["hero_lead"]}</p>',
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r'<p class="lead mb-3">Bienvenido a su resumen semanal.*?</p>',
        f'<p class="lead mb-3">{m["hero_lead"]}</p>',
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r'<p class="lead mb-3">Bienvenido a esta edición.*?</p>',
        f'<p class="lead mb-3">{m["hero_lead"]}</p>',
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        rf'{SLUG}/hero[^"]*\.webp',
        f"{SLUG}/" + ("hero-en.webp" if lang == "en" else "hero-es.webp"),
        text,
    )
    text = re.sub(
        r'onerror="this\.src=\'[^"]*\'" src="[^"]*hero[^"]*"',
        f'onerror="this.src=\'{m["fallback"]}\'" src="{m["hero_img"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'alt="[^"]*" class="img-fluid rounded-3 shadow-sm"',
        f'alt="{m["hero_alt"]}" class="img-fluid rounded-3 shadow-sm"',
        text,
        count=1,
    )
    stories = load_stories(m)
    text = re.sub(
        r'<section class="story-section" id="story1">[\s\S]*?</section>\s*<div class="border rounded p-4',
        stories + '\n<div class="border rounded p-4',
        text,
        count=1,
    )
    text = re.sub(
        r"Content covers U\.S\. life and final expense insurance news from [^<]*\.",
        m["disclaimer_week"],
        text,
        count=1,
    )
    text = re.sub(
        r"El contenido cubre noticias de EE\. UU\. sobre vida y gastos finales del [^<]*\.",
        m["disclaimer_week"],
        text,
        count=1,
    )
    text = re.sub(
        r'<li><a href="weekly-insurance-update-2026-07-05\.html">[^<]*</a></li>',
        f'<li><a href="{m["prior_link"]}">{m["prior_label"]}</a></li>',
        text,
        count=1,
    )
    text = re.sub(
        r'<li><a href="weekly-insurance-update-2026-06-28\.html">[^<]*</a></li>',
        f'<li><a href="{m["prior_link"]}">{m["prior_label"]}</a></li>',
        text,
        count=1,
    )
    sidebar_ul = "\n".join(f'<li><a href="#{sid}">{label}</a></li>' for sid, label in m["sidebar"])
    text = re.sub(
        r'<ul>\s*<li><a href="#story1">.*?</ul>',
        f"<ul>\n{sidebar_ul}\n</ul>",
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r'<p class="small mb-0 mt-2 text-secondary"><a href="weekly-insurance-update-[^"]*">[^<]*</a>[^<]*</p>',
        f'<p class="small mb-0 mt-2 text-secondary"><a href="{m["prior_link"]}">{m["sidebar_prior"]}</a> — prior week newsletter.</p>'
        if lang == "en"
        else f'<p class="small mb-0 mt-2 text-secondary"><a href="{m["prior_link"]}">{m["sidebar_prior"]}</a> — boletín de la semana anterior.</p>',
        text,
        count=1,
    )
    text = re.sub(
        r'href="https://www\.mejorvidainsurance\.com/blog/weekly-insurance-update-2026-07-12\.html" hreflang="es"',
        f'href="{m["hreflang_es"]}" hreflang="es"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="https://www\.mejorvidainsurance\.com/en/blog/weekly-insurance-update-2026-07-12\.html" hreflang="en"',
        f'href="{m["hreflang_en"]}" hreflang="en"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="/en/blog/weekly-insurance-update-2026-07-12\.html"',
        f'href="{m["lang_link"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="/blog/weekly-insurance-update-2026-07-12\.html"',
        f'href="{m["lang_link"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'<link href="https://www\.mejorvidainsurance\.com/[^"]*" rel="canonical"/>',
        f'<link href="{m["canonical"]}" rel="canonical"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="https://www\.mejorvidainsurance\.com/[^"]*" property="og:url"/>',
        f'<meta content="{m["canonical"]}" property="og:url"/>',
        text,
        count=1,
    )
    m["path"].write_text(text, encoding="utf-8")
    print(f"Patched {m['path']}")


def fix_en_asset_paths(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = text.replace('href="../favicon.ico"', 'href="../../favicon.ico"')
    text = text.replace('href="../bootstrap/', 'href="../../bootstrap/')
    text = text.replace('href="../css/', 'href="../../css/')
    text = text.replace('href="./blog-template.css"', 'href="../../blog/blog-template.css"')
    text = text.replace('src="../bootstrap/', 'src="../../bootstrap/')
    text = text.replace(
        'src="../js/website-assistant-widget.js"',
        'src="../../js/website-assistant-widget.js"',
    )
    path.write_text(text, encoding="utf-8")
    print(f"Fixed EN asset paths: {path}")


def main() -> None:
    for lang in ("en", "es"):
        patch_file(lang)
    fix_en_asset_paths(ROOT / "en/blog" / f"{SLUG}.html")
    src = ROOT / "sources/blog" / f"{SLUG}.html"
    src.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ROOT / "blog" / f"{SLUG}.html", src)
    print(f"Copied to {src}")


if __name__ == "__main__":
    main()
