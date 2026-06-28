#!/usr/bin/env python3
"""Patch weekly-insurance-update-2026-06-28.html (ES + EN) — week of June 21–June 27, 2026."""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "weekly-insurance-update-2026-06-28"
IMG = f"../img/opt/blog-generated/{SLUG}"
IMG_EN = f"../../img/opt/blog-generated/{SLUG}"
FALLBACK_ES = "../img/opt/3-1-2026-Blog.png"
FALLBACK_EN = "../../img/opt/3-1-2026-Blog.png"

META = {
    "en": {
        "path": ROOT / "en/blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "title": "Weekly U.S. Life & Final Expense Insurance Update (June 28, 2026) | Mejor Vida Insurance",
        "description": "June 28, 2026 weekly update: GAO finds NAIC transparency gap, First Connect D2C pressure on agents, CLEAR Forms Act SEC registration reform, DOJ healthcare fraud takedown — news from June 21–June 27, 2026.",
        "keywords": "weekly insurance update, final expense insurance, NAIC transparency, GAO audit, First Connect, D2C competition, CLEAR Forms Act, healthcare fraud, DOJ enforcement",
        "og_title": "Weekly U.S. Life & Final Expense Insurance Update — June 28, 2026",
        "og_desc": "June 28, 2026: NAIC transparency GAO audit, independent agent digital pressure, CLEAR Forms Act, DOJ fraud takedown — week of June 21–June 27, 2026.",
        "json_headline": "Weekly U.S. Life & Final Expense Insurance Update — week of June 21–June 27, 2026",
        "json_alt": "June 28, 2026: NAIC transparency; First Connect D2C; CLEAR Forms Act; DOJ fraud takedown",
        "json_desc": "Mejor Vida Insurance June 28, 2026 weekly briefing for agents: GAO NAIC transparency audit, First Connect digital distribution pressure, CLEAR Forms Act SEC reform, and DOJ healthcare fraud enforcement.",
        "itemlist_name": "Topics for agents — insurance market update June 21–June 27, 2026",
        "hero_h1": "Weekly U.S. Life &amp; Final Expense Insurance Update",
        "hero_date": "June 28, 2026 · News from June 21 – June 27, 2026",
        "hero_tags": "📰 4 Stories  |  🏛 NAIC Transparency  |  📱 D2C &amp; Digital  |  📋 CLEAR Forms Act  |  ⚖ Fraud Enforcement",
        "hero_lead": "Welcome to your weekly briefing on U.S. life and final expense insurance. This edition covers four developments from June 21–June 27, 2026: a GAO audit finding the NAIC lacks transparency despite overseeing trillions in insurance assets, First Connect's State of the Industry Report documenting digital-first pressure on independent agents, the CLEAR Forms Act advancing SEC registration reform for life and annuity products, and the DOJ's largest-ever healthcare fraud takedown charging 455 defendants.",
        "hero_img": f"{IMG_EN}/hero-en.png",
        "hero_webp": f"{IMG_EN}/hero-en.webp",
        "hero_alt": "Weekly insurance update June 28, 2026—NAIC transparency GAO audit, D2C digital pressure, CLEAR Forms Act, DOJ fraud enforcement",
        "read_min": "About 32 min read",
        "disclaimer_week": "Content covers U.S. life and final expense insurance news from June 21 - June 27, 2026.",
        "prior_link": "weekly-insurance-update-2026-06-21.html",
        "prior_label": "June 21, 2026 update — prior week",
        "sidebar_prior": "June 21 update",
        "lang_link": f"/blog/{SLUG}.html",
        "lang_label": "Español",
        "fragment": ROOT / "blog/_fragments/weekly-2026-06-28-stories-en.html",
        "img_base": IMG_EN,
        "fallback": FALLBACK_EN,
        "sidebar": [
            ("story1", "Story 1 — NAIC transparency GAO audit"),
            ("story2", "Story 2 — First Connect D2C pressure"),
            ("story3", "Story 3 — CLEAR Forms Act"),
            ("story4", "Story 4 — DOJ fraud takedown"),
        ],
        "hreflang_es": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "hreflang_en": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "og_image": f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}/hero-en.png",
        "published": "2026-06-28T08:00:00-06:00",
    },
    "es": {
        "path": ROOT / "blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "title": "Actualización semanal de seguros de vida y gastos finales (28 junio 2026) | Mejor Vida Insurance",
        "description": "Actualización del 28 de junio de 2026: GAO encuentra brecha de transparencia del NAIC, presión D2C de First Connect, CLEAR Forms Act, operación DOJ contra fraude en salud — noticias del 21 al 27 de junio de 2026.",
        "keywords": "actualización semanal seguros, gastos finales, transparencia NAIC, auditoría GAO, First Connect, competencia D2C, CLEAR Forms Act, fraude en salud, DOJ",
        "og_title": "Actualización semanal de vida y gastos finales — 28 de junio de 2026",
        "og_desc": "28 junio 2026: transparencia NAIC GAO, presión digital agentes, CLEAR Forms Act, operación DOJ fraude — semana del 21 al 27 de junio de 2026.",
        "json_headline": "Actualización semanal de seguros de vida y gastos finales en EE. UU. — semana del 21 al 27 de junio de 2026",
        "json_alt": "28 junio 2026: transparencia NAIC; First Connect D2C; CLEAR Forms Act; operación DOJ fraude",
        "json_desc": "Resumen semanal Mejor Vida Insurance del 28 de junio de 2026 para agentes: auditoría GAO sobre transparencia del NAIC, presión digital First Connect, CLEAR Forms Act y operación DOJ contra fraude en salud.",
        "itemlist_name": "Temas para agentes — actualización del mercado 21–27 junio 2026",
        "hero_h1": "Actualización semanal de seguros de vida y gastos finales en EE. UU.",
        "hero_date": "28 de junio de 2026 · Noticias del 21 al 27 de junio de 2026",
        "hero_tags": "📰 4 historias  |  🏛 Transparencia NAIC  |  📱 D2C y digital  |  📋 CLEAR Forms Act  |  ⚖ Fraude y cumplimiento",
        "hero_lead": "Bienvenido a su resumen semanal de seguro de vida y gastos finales en EE. UU. Esta edición cubre cuatro desarrollos del 21 al 27 de junio de 2026: una auditoría del GAO que concluye que el NAIC carece de transparencia pese a supervisar billones en activos de seguros, el informe State of the Industry de First Connect documentando presión digital sobre agentes independientes, la CLEAR Forms Act avanzando la reforma del registro SEC para productos de vida y anualidades, y la operación más grande del DOJ contra fraude en salud con 455 acusados.",
        "hero_img": f"{IMG}/hero-es.png",
        "hero_webp": f"{IMG}/hero-es.webp",
        "hero_alt": "Actualización semanal 28 junio 2026—auditoría GAO NAIC, presión D2C digital, CLEAR Forms Act, operación DOJ fraude",
        "read_min": "Aprox. 32 min de lectura",
        "disclaimer_week": "El contenido cubre noticias de EE. UU. sobre vida y gastos finales del 21 al 27 de junio de 2026.",
        "prior_link": "weekly-insurance-update-2026-06-21.html",
        "prior_label": "Actualización 21 junio 2026 — semana anterior",
        "sidebar_prior": "Actualización del 21 de junio",
        "lang_link": f"/en/blog/{SLUG}.html",
        "lang_label": "English",
        "fragment": ROOT / "blog/_fragments/weekly-2026-06-28-stories-es.html",
        "img_base": IMG,
        "fallback": FALLBACK_ES,
        "sidebar": [
            ("story1", "Historia 1 — transparencia NAIC GAO"),
            ("story2", "Historia 2 — presión D2C First Connect"),
            ("story3", "Historia 3 — CLEAR Forms Act"),
            ("story4", "Historia 4 — operación DOJ fraude"),
        ],
        "hreflang_es": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "hreflang_en": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "og_image": f"https://www.mejorvidainsurance.com/img/opt/blog-generated/{SLUG}/hero-es.png",
        "published": "2026-06-28T08:00:00-06:00",
    },
}

ITEMLIST_JSON = """[
      {"@type":"ListItem","position":1,"item":{"@type":"NewsArticle","headline":"GAO Report Finds NAIC Lacks Transparency","datePublished":"2026-06-22","publisher":{"@type":"Organization","name":"Legis1 / GAO"}}},
      {"@type":"ListItem","position":2,"item":{"@type":"NewsArticle","headline":"First Connect 2026 State of the Industry Report","datePublished":"2026-06-27","publisher":{"@type":"Organization","name":"First Connect"}}},
      {"@type":"ListItem","position":3,"item":{"@type":"NewsArticle","headline":"CLEAR Forms Act: IRI and ACLI Support SEC Registration Reform","datePublished":"2026-06-25","publisher":{"@type":"Organization","name":"ThinkAdvisor"}}},
      {"@type":"ListItem","position":4,"item":{"@type":"NewsArticle","headline":"DOJ National Healthcare Fraud Takedown: 455 Defendants Charged","datePublished":"2026-06-24","publisher":{"@type":"Organization","name":"WUSF / DOJ"}}}
    ]"""


def load_stories(m: dict) -> str:
    raw = m["fragment"].read_text(encoding="utf-8")
    return raw.replace("IMG_BASE", m["img_base"]).replace("IMG_FALLBACK", m["fallback"])


def patch_file(lang: str) -> None:
    m = META[lang]
    text = m["path"].read_text(encoding="utf-8")
    text = text.replace("2026-06-21", "2026-06-28")
    text = text.replace("weekly-insurance-update-2026-06-21", SLUG)
    text = text.replace("weekly-insurance-update-2026-06-14", "weekly-insurance-update-2026-06-21")
    if lang == "en":
        text = text.replace("June 21, 2026", "June 28, 2026")
        text = text.replace("June 14 – June 20, 2026", "June 21 – June 27, 2026")
        text = text.replace("June 14–June 20, 2026", "June 21–June 27, 2026")
        text = text.replace("June 14 - June 20, 2026", "June 21 - June 27, 2026")
        text = text.replace("June 14–20, 2026", "June 21–June 27, 2026")
    else:
        text = text.replace("21 de junio de 2026", "28 de junio de 2026")
        text = text.replace("14 al 20 de junio de 2026", "21 al 27 de junio de 2026")
        text = text.replace("del 14 al 20 de junio de 2026", "del 21 al 27 de junio de 2026")
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
        r'<meta content="2026-06-28T[^"]*" property="article:published_time"/>',
        f'<meta content="{m["published"]}" property="article:published_time"/>',
        text,
        count=1,
    )
    text = re.sub(
        r'<meta content="2026-06-28T[^"]*" property="article:modified_time"/>',
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
        r'"datePublished": "2026-06-28T[^"]*"',
        f'"datePublished": "{m["published"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'"dateModified": "2026-06-28T[^"]*"',
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
        rf'weekly-insurance-update-2026-06-28/hero[^"]*\.webp',
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
        r'<li><a href="weekly-insurance-update-2026-06-21\.html">[^<]*</a></li>',
        f'<li><a href="{m["prior_link"]}">{m["prior_label"]}</a></li>',
        text,
        count=1,
    )
    text = re.sub(
        r'<li><a href="weekly-insurance-update-2026-06-14\.html">[^<]*</a></li>',
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
        r'href="https://www\.mejorvidainsurance\.com/blog/weekly-insurance-update-2026-06-28\.html" hreflang="es"',
        f'href="{m["hreflang_es"]}" hreflang="es"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="https://www\.mejorvidainsurance\.com/en/blog/weekly-insurance-update-2026-06-28\.html" hreflang="en"',
        f'href="{m["hreflang_en"]}" hreflang="en"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="/en/blog/weekly-insurance-update-2026-06-28\.html"',
        f'href="{m["lang_link"]}"',
        text,
        count=1,
    )
    text = re.sub(
        r'href="/blog/weekly-insurance-update-2026-06-28\.html"',
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
