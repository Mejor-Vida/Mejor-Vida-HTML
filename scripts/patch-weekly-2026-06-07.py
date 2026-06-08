#!/usr/bin/env python3
"""Patch weekly-insurance-update-2026-06-07.html (ES + EN) — week of May 31–June 06, 2026."""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "weekly-insurance-update-2026-06-07"
IMG = f"../img/opt/blog-generated/{SLUG}"
IMG_EN = f"../../img/opt/blog-generated/{SLUG}"
FALLBACK_ES = "../img/opt/3-1-2026-Blog.png"
FALLBACK_EN = "../../img/opt/3-1-2026-Blog.png"

META = {
    "en": {
        "path": ROOT / "en/blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "title": "Weekly U.S. Life & Final Expense Insurance Update (June 7, 2026) | Mejor Vida Insurance",
        "description": "June 7, 2026 weekly update: 26North Re enters U.S. market, Maryland FAMLI private leave plans, Tennessee NAIC locator record $107M, Louisiana BOLI and bail bond laws — news from May 31–June 06, 2026.",
        "keywords": "weekly insurance update, final expense insurance, 26North Re, Maryland FAMLI, NAIC policy locator, Louisiana BOLI, structured settlement",
        "og_title": "Weekly U.S. Life & Final Expense Insurance Update — June 7, 2026",
        "og_desc": "June 7, 2026: reinsurance M&A, Maryland paid family leave, NAIC locator record, Louisiana insurance legislation — week of May 31–June 06, 2026.",
        "json_headline": "Weekly U.S. Life & Final Expense Insurance Update — week of May 31–June 06, 2026",
        "json_alt": "June 7, 2026: 26North Re; Maryland FAMLI; NAIC locator; Louisiana BOLI",
        "json_desc": "Mejor Vida Insurance June 7, 2026 weekly briefing for agents: 26North Re U.S. entry, Maryland private paid leave market, Tennessee NAIC locator record, and Louisiana BOLI legislation.",
        "itemlist_name": "Topics for agents — insurance market update May 31–June 06, 2026",
        "hero_h1": "Weekly U.S. Life &amp; Final Expense Insurance Update",
        "hero_date": "June 7, 2026 · News from May 31 – June 06, 2026",
        "hero_tags": "📰 4 Stories This Week  |  🔄 Reinsurance &amp; M&amp;A  |  🏛 State Regulation  |  🔍 Consumer Protection  |  ⚖ Legislation",
        "hero_lead": "Welcome to your weekly briefing on U.S. life and final expense insurance. This edition covers four developments from May 31–June 06, 2026: 26North Re's entry into the U.S. market through Independent Insurance Group, Maryland opening its private paid family leave insurance market with a September filing deadline, Tennessee families recovering a record $107 million through the NAIC Policy Locator, and Louisiana enacting new bank-owned life insurance and bail bond agent laws.",
        "hero_img": f"{IMG_EN}/hero-en.png",
        "hero_webp": f"{IMG_EN}/hero-en.webp",
        "hero_alt": "Weekly insurance update June 7, 2026—reinsurance acquisition, Maryland FAMLI, NAIC policy locator, Louisiana BOLI legislation",
        "read_min": "About 32 min read",
        "disclaimer_week": "Content covers U.S. life and final expense insurance news from May 31 - June 06, 2026.",
        "prior_link": "weekly-insurance-update-2026-05-31.html",
        "prior_label": "May 31, 2026 update — prior week",
        "sidebar_prior": "May 31 update",
        "lang_link": f"/blog/{SLUG}.html",
        "lang_label": "Español",
        "fragment": ROOT / "blog/_fragments/weekly-2026-06-07-stories-en.html",
        "img_base": IMG_EN,
        "fallback": FALLBACK_EN,
        "sidebar": [
            ("story1", "Story 1 — 26North Re acquisition"),
            ("story2", "Story 2 — Maryland FAMLI"),
            ("story3", "Story 3 — NAIC locator record"),
            ("story4", "Story 4 — Louisiana BOLI laws"),
        ],
        "hreflang_es": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "hreflang_en": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "og_image": f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}/hero-en.png",
        "published": "2026-06-07T08:00:00-06:00",
    },
    "es": {
        "path": ROOT / "blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "title": "Actualización semanal de seguros de vida y gastos finales (7 junio 2026) | Mejor Vida Insurance",
        "description": "Actualización del 7 de junio de 2026: 26North Re entra al mercado EE. UU., Maryland abre licencia familiar pagada, récord NAIC de 107 M$ en Tennessee, leyes BOLI en Luisiana — noticias del 31 de mayo al 6 de junio de 2026.",
        "keywords": "actualización semanal seguros, gastos finales, 26North Re, Maryland FAMLI, localizador NAIC, BOLI Luisiana, acuerdos estructurados",
        "og_title": "Actualización semanal de vida y gastos finales — 7 de junio de 2026",
        "og_desc": "7 junio 2026: reaseguro y M&A, licencia familiar Maryland, récord localizador NAIC, legislación Luisiana — semana del 31 de mayo al 6 de junio de 2026.",
        "json_headline": "Actualización semanal de seguros de vida y gastos finales en EE. UU. — semana del 31 de mayo al 6 de junio de 2026",
        "json_alt": "7 junio 2026: 26North Re; Maryland FAMLI; localizador NAIC; BOLI Luisiana",
        "json_desc": "Resumen semanal Mejor Vida Insurance del 7 de junio de 2026 para agentes: entrada de 26North Re, mercado privado de licencia pagada en Maryland, récord del localizador NAIC en Tennessee y legislación BOLI en Luisiana.",
        "itemlist_name": "Temas para agentes — actualización del mercado 31 mayo–6 junio 2026",
        "hero_h1": "Actualización semanal de seguros de vida y gastos finales en EE. UU.",
        "hero_date": "7 de junio de 2026 · Noticias del 31 de mayo al 6 de junio de 2026",
        "hero_tags": "📰 4 historias  |  🔄 Reaseguro y M&amp;A  |  🏛 Regulación estatal  |  🔍 Protección al consumidor  |  ⚖ Legislación",
        "hero_lead": "Bienvenido a su resumen semanal de seguro de vida y gastos finales en EE. UU. Esta edición cubre cuatro desarrollos del 31 de mayo al 6 de junio de 2026: la entrada de 26North Re al mercado estadounidense mediante Independent Insurance Group, Maryland abriendo su mercado privado de seguro de licencia familiar pagada con plazo de presentación en septiembre, familias de Tennessee recuperando un récord de 107 millones de dólares mediante el NAIC Policy Locator, y Luisiana promulgando nuevas leyes sobre seguro de vida propiedad de bancos y agentes de fianzas.",
        "hero_img": f"{IMG}/hero-es.png",
        "hero_webp": f"{IMG}/hero-es.webp",
        "hero_alt": "Actualización semanal 7 junio 2026—adquisición de reaseguro, Maryland FAMLI, localizador NAIC, legislación BOLI Luisiana",
        "read_min": "Aprox. 32 min de lectura",
        "disclaimer_week": "El contenido cubre noticias de EE. UU. sobre vida y gastos finales del 31 de mayo al 6 de junio de 2026.",
        "prior_link": "weekly-insurance-update-2026-05-31.html",
        "prior_label": "Actualización 31 mayo 2026 — semana anterior",
        "sidebar_prior": "Actualización del 31 de mayo",
        "lang_link": f"/en/blog/{SLUG}.html",
        "lang_label": "English",
        "fragment": ROOT / "blog/_fragments/weekly-2026-06-07-stories-es.html",
        "img_base": IMG,
        "fallback": FALLBACK_ES,
        "sidebar": [
            ("story1", "Historia 1 — adquisición 26North Re"),
            ("story2", "Historia 2 — Maryland FAMLI"),
            ("story3", "Historia 3 — récord localizador NAIC"),
            ("story4", "Historia 4 — leyes BOLI Luisiana"),
        ],
        "hreflang_es": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "hreflang_en": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "og_image": f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}/hero-es.png",
        "published": "2026-06-07T08:00:00-06:00",
    },
}

ITEMLIST_JSON = """[
      {"@type":"ListItem","position":1,"item":{"@type":"NewsArticle","headline":"26North Re Enters U.S. Market with Acquisition of Independent Insurance Group","datePublished":"2026-06-01","publisher":{"@type":"Organization","name":"Business Wire"}}},
      {"@type":"ListItem","position":2,"item":{"@type":"NewsArticle","headline":"Maryland Opens Private Paid Family Leave Insurance Market","datePublished":"2026-06-02","publisher":{"@type":"Organization","name":"Insurance Business Magazine"}}},
      {"@type":"ListItem","position":3,"item":{"@type":"NewsArticle","headline":"Tennessee Families Recover Record $107 Million Through NAIC Locator","datePublished":"2026-06-04","publisher":{"@type":"Organization","name":"Tennessee Dept. of Commerce & Insurance"}}},
      {"@type":"ListItem","position":4,"item":{"@type":"NewsArticle","headline":"Louisiana Enacts New BOLI and Bail Bond Agent Laws","datePublished":"2026-06-05","publisher":{"@type":"Organization","name":"Insurance Business Magazine"}}}
    ]"""


def load_stories(m: dict) -> str:
    raw = m["fragment"].read_text(encoding="utf-8")
    return raw.replace("IMG_BASE", m["img_base"]).replace("IMG_FALLBACK", m["fallback"])


def patch_file(lang: str) -> None:
    m = META[lang]
    text = m["path"].read_text(encoding="utf-8")
    text = text.replace("2026-05-31", "2026-06-07")
    text = text.replace("weekly-insurance-update-2026-05-31", SLUG)
    text = text.replace("weekly-insurance-update-2026-05-24", "weekly-insurance-update-2026-05-31")
    if lang == "en":
        text = text.replace("May 31, 2026", "June 7, 2026")
        text = text.replace("May 24 – May 30, 2026", "May 31 – June 06, 2026")
        text = text.replace("May 24–May 30, 2026", "May 31–June 06, 2026")
        text = text.replace("May 24 - May 30, 2026", "May 31 - June 06, 2026")
        text = text.replace("May 24–30, 2026", "May 31–June 06, 2026")
    else:
        text = text.replace("31 de mayo de 2026", "7 de junio de 2026")
        text = text.replace("24 al 30 de mayo de 2026", "31 de mayo al 6 de junio de 2026")
        text = text.replace("del 24 al 30 de mayo de 2026", "del 31 de mayo al 6 de junio de 2026")
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
        r'<meta content="2026-05-31T[^"]*" property="article:published_time"/>',
        f'<meta content="{m["published"]}" property="article:published_time"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="2026-05-31T[^"]*" property="article:modified_time"/>',
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
        r'"datePublished": "2026-05-31T[^"]*"',
        f'"datePublished": "{m["published"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"dateModified": "2026-05-31T[^"]*"',
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
        rf'weekly-insurance-update-2026-05-31/hero[^"]*\.webp',
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
        r'<li><a href="weekly-insurance-update-2026-05-31\.html">[^<]*</a></li>',
        f'<li><a href="{m["prior_link"]}">{m["prior_label"]}</a></li>',
        text,
        count=1,
    )
    text = re.sub(
        r'<li><a href="weekly-insurance-update-2026-05-24\.html">[^<]*</a></li>',
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
        r'href="https://www\.mejorvidainsurance\.com/blog/weekly-insurance-update-2026-05-31\.html" hreflang="es"',
        f'href="{m["hreflang_es"]}" hreflang="es"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="https://www\.mejorvidainsurance\.com/en/blog/weekly-insurance-update-2026-05-31\.html" hreflang="en"',
        f'href="{m["hreflang_en"]}" hreflang="en"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="/en/blog/weekly-insurance-update-2026-05-31\.html"',
        f'href="{m["lang_link"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="/blog/weekly-insurance-update-2026-05-31\.html"',
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
