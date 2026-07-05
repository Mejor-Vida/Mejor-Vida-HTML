#!/usr/bin/env python3
"""Patch weekly-insurance-update-2026-07-05.html (ES + EN) — week of June 28–July 04, 2026."""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "weekly-insurance-update-2026-07-05"
IMG = f"../img/opt/blog-generated/{SLUG}"
IMG_EN = f"../../img/opt/blog-generated/{SLUG}"
FALLBACK_ES = "../img/opt/3-1-2026-Blog.png"
FALLBACK_EN = "../../img/opt/3-1-2026-Blog.png"

META = {
    "en": {
        "path": ROOT / "en/blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "title": "Weekly U.S. Life & Final Expense Insurance Update (July 5, 2026) | Mejor Vida Insurance",
        "description": "July 5, 2026 weekly update: PHL Variable liquidation pushed to 2027, Clarity for Compensation Act advances unanimously, GLP-1 drugs reshape underwriting, Corebridge Max Accumulator+ III IUL enhancements — news from June 28–July 04, 2026.",
        "keywords": "weekly insurance update, final expense insurance, PHL Variable Insurance, NOLHGA, Clarity for Compensation Act, GLP-1 underwriting, Corebridge IUL, Max Accumulator",
        "og_title": "Weekly U.S. Life & Final Expense Insurance Update — July 5, 2026",
        "og_desc": "July 5, 2026: PHL Variable liquidation 2027, Clarity for Compensation Act, GLP-1 underwriting, Corebridge IUL — week of June 28–July 04, 2026.",
        "json_headline": "Weekly U.S. Life & Final Expense Insurance Update — week of June 28–July 04, 2026",
        "json_alt": "July 5, 2026: PHL Variable liquidation; Clarity for Compensation Act; GLP-1 underwriting; Corebridge IUL",
        "json_desc": "Mejor Vida Insurance July 5, 2026 weekly briefing for agents: PHL Variable liquidation pushed to 2027, Clarity for Compensation Act advances, GLP-1 drugs reshape underwriting, and Corebridge Max Accumulator+ III IUL enhancements.",
        "itemlist_name": "Topics for agents — insurance market update June 28–July 04, 2026",
        "hero_h1": "Weekly U.S. Life &amp; Final Expense Insurance Update",
        "hero_date": "July 5, 2026 · News from June 28 – July 04, 2026",
        "hero_tags": "📰 4 Stories  |  ⚠ PHL Liquidation  |  ⚖ Compensation Act  |  ⚕ GLP-1 Underwriting  |  📈 Corebridge IUL",
        "hero_lead": "Welcome to your weekly briefing on U.S. life and final expense insurance. This edition covers four developments from June 28–July 04, 2026: Connecticut regulators confirming PHL Variable Insurance liquidation will not occur until at least 2027 as NOLHGA begins its RFP process, the House Financial Services Committee unanimously advancing the Clarity for Compensation Act for financial advisors, carriers adding back weight in underwriting to combat GLP-1 mortality slippage, and Corebridge Financial enhancing its Max Accumulator+ III IUL with Nasdaq-100 and S&amp;P 500 High Bonus strategies.",
        "hero_img": f"{IMG_EN}/hero-en.png",
        "hero_webp": f"{IMG_EN}/hero-en.webp",
        "hero_alt": "Weekly insurance update July 5, 2026—PHL Variable liquidation, Clarity for Compensation Act, GLP-1 underwriting, Corebridge IUL",
        "read_min": "About 32 min read",
        "disclaimer_week": "Content covers U.S. life and final expense insurance news from June 28 - July 04, 2026.",
        "prior_link": "weekly-insurance-update-2026-06-28.html",
        "prior_label": "June 28, 2026 update — prior week",
        "sidebar_prior": "June 28 update",
        "lang_link": f"/blog/{SLUG}.html",
        "lang_label": "Español",
        "fragment": ROOT / "blog/_fragments/weekly-2026-07-05-stories-en.html",
        "img_base": IMG_EN,
        "fallback": FALLBACK_EN,
        "sidebar": [
            ("story1", "Story 1 — PHL Variable liquidation 2027"),
            ("story2", "Story 2 — Clarity for Compensation Act"),
            ("story3", "Story 3 — GLP-1 underwriting"),
            ("story4", "Story 4 — Corebridge IUL enhancements"),
        ],
        "hreflang_es": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "hreflang_en": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "og_image": f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}/hero-en.png",
        "published": "2026-07-05T08:00:00-06:00",
    },
    "es": {
        "path": ROOT / "blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "title": "Actualización semanal de seguros de vida y gastos finales (5 julio 2026) | Mejor Vida Insurance",
        "description": "Actualización del 5 de julio de 2026: liquidación de PHL Variable pospuesta a 2027, Clarity for Compensation Act avanza por unanimidad, medicamentos GLP-1 reconfiguran suscripción, mejoras IUL Corebridge Max Accumulator+ III — noticias del 28 de junio al 4 de julio de 2026.",
        "keywords": "actualización semanal seguros, gastos finales, PHL Variable Insurance, NOLHGA, Clarity for Compensation Act, suscripción GLP-1, Corebridge IUL, Max Accumulator",
        "og_title": "Actualización semanal de vida y gastos finales — 5 de julio de 2026",
        "og_desc": "5 julio 2026: liquidación PHL Variable 2027, Clarity for Compensation Act, suscripción GLP-1, Corebridge IUL — semana del 28 de junio al 4 de julio de 2026.",
        "json_headline": "Actualización semanal de seguros de vida y gastos finales en EE. UU. — semana del 28 de junio al 4 de julio de 2026",
        "json_alt": "5 julio 2026: liquidación PHL Variable; Clarity for Compensation Act; suscripción GLP-1; Corebridge IUL",
        "json_desc": "Resumen semanal Mejor Vida Insurance del 5 de julio de 2026 para agentes: liquidación de PHL Variable pospuesta a 2027, Clarity for Compensation Act avanza, medicamentos GLP-1 reconfiguran suscripción y mejoras IUL Corebridge Max Accumulator+ III.",
        "itemlist_name": "Temas para agentes — actualización del mercado 28 junio–4 julio 2026",
        "hero_h1": "Actualización semanal de seguros de vida y gastos finales en EE. UU.",
        "hero_date": "5 de julio de 2026 · Noticias del 28 de junio al 4 de julio de 2026",
        "hero_tags": "📰 4 historias  |  ⚠ Liquidación PHL  |  ⚖ Compensation Act  |  ⚕ Suscripción GLP-1  |  📈 Corebridge IUL",
        "hero_lead": "Bienvenido a su resumen semanal de seguro de vida y gastos finales en EE. UU. Esta edición cubre cuatro desarrollos del 28 de junio al 4 de julio de 2026: reguladores de Connecticut confirman que la liquidación de PHL Variable Insurance no ocurrirá hasta al menos 2027 mientras NOLHGA inicia su proceso RFP, el Comité de Servicios Financieros de la Cámara avanza por unanimidad la Clarity for Compensation Act para asesores financieros, aseguradoras reincorporan peso en suscripción para combatir el deslizamiento de mortalidad por GLP-1, y Corebridge Financial mejora su IUL Max Accumulator+ III con estrategias Nasdaq-100 y S&amp;P 500 High Bonus.",
        "hero_img": f"{IMG}/hero-es.png",
        "hero_webp": f"{IMG}/hero-es.webp",
        "hero_alt": "Actualización semanal 5 julio 2026—liquidación PHL Variable, Clarity for Compensation Act, suscripción GLP-1, Corebridge IUL",
        "read_min": "Aprox. 32 min de lectura",
        "disclaimer_week": "El contenido cubre noticias de EE. UU. sobre vida y gastos finales del 28 de junio al 4 de julio de 2026.",
        "prior_link": "weekly-insurance-update-2026-06-28.html",
        "prior_label": "Actualización 28 junio 2026 — semana anterior",
        "sidebar_prior": "Actualización del 28 de junio",
        "lang_link": f"/en/blog/{SLUG}.html",
        "lang_label": "English",
        "fragment": ROOT / "blog/_fragments/weekly-2026-07-05-stories-es.html",
        "img_base": IMG,
        "fallback": FALLBACK_ES,
        "sidebar": [
            ("story1", "Historia 1 — liquidación PHL Variable 2027"),
            ("story2", "Historia 2 — Clarity for Compensation Act"),
            ("story3", "Historia 3 — suscripción GLP-1"),
            ("story4", "Historia 4 — mejoras IUL Corebridge"),
        ],
        "hreflang_es": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "hreflang_en": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "og_image": f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}/hero-es.png",
        "published": "2026-07-05T08:00:00-06:00",
    },
}

ITEMLIST_JSON = """[
      {"@type":"ListItem","position":1,"item":{"@type":"NewsArticle","headline":"PHL Variable Insurance Liquidation Pushed to 2027","datePublished":"2026-07-01","publisher":{"@type":"Organization","name":"InsuranceNewsNet"}}},
      {"@type":"ListItem","position":2,"item":{"@type":"NewsArticle","headline":"Clarity for Compensation Act Advances Unanimously","datePublished":"2026-07-01","publisher":{"@type":"Organization","name":"InvestmentNews"}}},
      {"@type":"ListItem","position":3,"item":{"@type":"NewsArticle","headline":"GLP-1 Drugs Reshaping Life Insurance Underwriting","datePublished":"2026-07-01","publisher":{"@type":"Organization","name":"New Horizons Marketing"}}},
      {"@type":"ListItem","position":4,"item":{"@type":"NewsArticle","headline":"Corebridge Max Accumulator+ III IUL Enhancements","datePublished":"2026-06-29","publisher":{"@type":"Organization","name":"Corebridge Financial"}}}
    ]"""


def load_stories(m: dict) -> str:
    raw = m["fragment"].read_text(encoding="utf-8")
    return raw.replace("IMG_BASE", m["img_base"]).replace("IMG_FALLBACK", m["fallback"])


def patch_file(lang: str) -> None:
    m = META[lang]
    text = m["path"].read_text(encoding="utf-8")
    text = text.replace("2026-06-28", "2026-07-05")
    text = text.replace("weekly-insurance-update-2026-06-28", SLUG)
    text = text.replace("weekly-insurance-update-2026-06-21", "weekly-insurance-update-2026-06-28")
    if lang == "en":
        text = text.replace("June 28, 2026", "July 5, 2026")
        text = text.replace("June 21 – June 27, 2026", "June 28 – July 04, 2026")
        text = text.replace("June 21–June 27, 2026", "June 28–July 04, 2026")
        text = text.replace("June 21 - June 27, 2026", "June 28 - July 04, 2026")
        text = text.replace("June 21–27, 2026", "June 28–July 04, 2026")
    else:
        text = text.replace("28 de junio de 2026", "5 de julio de 2026")
        text = text.replace("21 al 27 de junio de 2026", "28 de junio al 4 de julio de 2026")
        text = text.replace("del 21 al 27 de junio de 2026", "del 28 de junio al 4 de julio de 2026")
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
        r'<meta content="2026-07-05T[^"]*" property="article:published_time"/>',
        f'<meta content="{m["published"]}" property="article:published_time"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="2026-07-05T[^"]*" property="article:modified_time"/>',
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
        r'"datePublished": "2026-07-05T[^"]*"',
        f'"datePublished": "{m["published"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"dateModified": "2026-07-05T[^"]*"',
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
        r'<p class="lead mb-3">Bienvenido a su resumen semanal.*?</p>',
        f'<p class="lead mb-3">{m["hero_lead"]}</p>',
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        rf'weekly-insurance-update-2026-07-05/hero[^"]*\.webp',
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
        r'<li><a href="weekly-insurance-update-2026-06-28\.html">[^<]*</a></li>',
        f'<li><a href="{m["prior_link"]}">{m["prior_label"]}</a></li>',
        text,
        count=1,
    )
    text = re.sub(
        r'<li><a href="weekly-insurance-update-2026-06-21\.html">[^<]*</a></li>',
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
        r'href="https://www\.mejorvidainsurance\.com/blog/weekly-insurance-update-2026-07-05\.html" hreflang="es"',
        f'href="{m["hreflang_es"]}" hreflang="es"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="https://www\.mejorvidainsurance\.com/en/blog/weekly-insurance-update-2026-07-05\.html" hreflang="en"',
        f'href="{m["hreflang_en"]}" hreflang="en"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="/en/blog/weekly-insurance-update-2026-07-05\.html"',
        f'href="{m["lang_link"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="/blog/weekly-insurance-update-2026-07-05\.html"',
        f'href="{m["lang_link"]}"',
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
    text = text.replace(
        '<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>',
        '<div data-api-url="/api/website-chat" data-mvi-avatar-base="/img/mvi-chat-avatar" id="mvi-assistant-root"></div>',
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
