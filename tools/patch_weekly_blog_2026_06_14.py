#!/usr/bin/env python3
"""Patch weekly-insurance-update-2026-06-14.html — week of June 7–13, 2026."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "weekly-insurance-update-2026-06-14"
PATH = ROOT / "blog" / f"{SLUG}.html"
FRAG = ROOT / "blog" / "_fragments" / "weekly-2026-06-14-stories.html"
IMG = f"../img/opt/blog-generated/{SLUG}"

html = PATH.read_text(encoding="utf-8")
stories = FRAG.read_text(encoding="utf-8")

replacements = [
    ("2026-06-07", "2026-06-14"),
    ("7 junio 2026", "14 junio 2026"),
    ("7 de junio de 2026", "14 de junio de 2026"),
    ("31 de mayo al 6 de junio de 2026", "7 al 13 de junio de 2026"),
    ("31 mayo–6 junio 2026", "7–13 junio 2026"),
    ("weekly-insurance-update-2026-06-07", SLUG),
    (
        "Actualización del 7 de junio de 2026: 26North Re entra al mercado EE. UU., Maryland abre licencia familiar pagada, récord NAIC de 107 M$ en Tennessee, leyes BOLI en Luisiana — noticias del 31 de mayo al 6 de junio de 2026.",
        "Actualización del 14 de junio de 2026: ventas récord T1 2026 según LIMRA, disparo de VUL según Wink, reforma file-and-wait en Oklahoma y análisis KBRA sobre crédito privado — noticias del 7 al 13 de junio de 2026.",
    ),
    (
        "actualización semanal seguros, gastos finales, 26North Re, Maryland FAMLI, localizador NAIC, BOLI Luisiana, acuerdos estructurados",
        "actualización semanal seguros, gastos finales, LIMRA ventas 2026, VUL Wink, Oklahoma tarifas, KBRA crédito privado, whole life",
    ),
    (
        "7 junio 2026: reaseguro y M&A, licencia familiar Maryland, récord localizador NAIC, legislación Luisiana",
        "14 junio 2026: ventas LIMRA T1, VUL Wink, tarifas Oklahoma, crédito privado KBRA",
    ),
    (
        "Resumen semanal Mejor Vida Insurance del 7 de junio de 2026 para agentes: entrada de 26North Re, mercado privado de licencia pagada en Maryland, récord del localizador NAIC en Tennessee y legislación BOLI en Luisiana.",
        "Resumen semanal Mejor Vida Insurance del 14 de junio de 2026 para agentes: ventas T1 2026 de LIMRA, auge de VUL según Wink, ley file-and-wait en Oklahoma y investigación KBRA sobre calificaciones PLR y crédito privado.",
    ),
    (
        '["final expense insurance", "life insurance agents", "ALIRT", "NAIC", "annuity", "private capital", "AI leads"]',
        '["final expense insurance", "life insurance agents", "LIMRA", "VUL", "Oklahoma insurance", "KBRA", "private credit"]',
    ),
    (
        "Temas para agentes — actualización del mercado 31 mayo–6 junio 2026",
        "Temas para agentes — actualización del mercado 7–13 junio 2026",
    ),
]

for old, new in replacements:
    html = html.replace(old, new)

html = re.sub(
    r'<script type="application/ld\+json">\s*\{\s*"@context": "https://schema\.org",\s*"@type": "BreadcrumbList".*?</script>',
    """<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type":"ListItem","position":1,"item":{"@type":"NewsArticle","headline":"Life Insurance Sales Roar Past Forecasts in Q1 2026","datePublished":"2026-06-07","publisher":{"@type":"Organization","name":"LIMRA"}}},
      {"@type":"ListItem","position":2,"item":{"@type":"NewsArticle","headline":"VUL Sales Skyrocket 15% in Q1 2026","datePublished":"2026-06-09","publisher":{"@type":"Organization","name":"InsuranceNewsNet / Wink"}}},
      {"@type":"ListItem","position":3,"item":{"@type":"NewsArticle","headline":"Oklahoma Requires Pre-Approval for Insurance Rate Increases","datePublished":"2026-06-08","publisher":{"@type":"Organization","name":"Insurance Journal"}}},
      {"@type":"ListItem","position":4,"item":{"@type":"NewsArticle","headline":"KBRA on Private Credit Risk in Life Insurer Portfolios","datePublished":"2026-06-08","publisher":{"@type":"Organization","name":"KBRA"}}}
    ]
  }
  </script>""",
    html,
    count=1,
    flags=re.DOTALL,
)

html = re.sub(
    r'<script type="application/ld\+json">\s*\{\s*"@context": "https://schema\.org",\s*"@type": "ItemList".*?</script>',
    """<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Temas para agentes — actualización del mercado 7–13 junio 2026",
    "itemListElement": [
      {"@type":"ListItem","position":1,"item":{"@type":"NewsArticle","headline":"LIMRA Q1 2026 Life Insurance Sales","datePublished":"2026-06-07","publisher":{"@type":"Organization","name":"LIMRA"}}},
      {"@type":"ListItem","position":2,"item":{"@type":"NewsArticle","headline":"VUL Sales Skyrocket in Q1 2026","datePublished":"2026-06-09","publisher":{"@type":"Organization","name":"Wink, Inc."}}},
      {"@type":"ListItem","position":3,"item":{"@type":"NewsArticle","headline":"Oklahoma File-and-Wait Rate Law","datePublished":"2026-06-08","publisher":{"@type":"Organization","name":"Insurance Journal"}}},
      {"@type":"ListItem","position":4,"item":{"@type":"NewsArticle","headline":"KBRA Private Credit PLR Research","datePublished":"2026-06-08","publisher":{"@type":"Organization","name":"KBRA"}}}
    ]
  }
  </script>""",
    html,
    count=1,
    flags=re.DOTALL,
)

hero_block = """<p class="lead mb-3 fw-semibold">📰 4 historias  |  📈 Ventas LIMRA  |  💹 VUL en auge  |  🏛 Regulación Oklahoma  |  🏦 Crédito privado</p>

<p class="lead mb-3">Bienvenido a su resumen semanal de seguro de vida y gastos finales en EE. UU. Esta edición cubre cuatro desarrollos del 7 al 13 de junio de 2026: datos récord de ventas del primer trimestre según LIMRA (con los gastos finales liderando el crecimiento del whole life), un repunte del 15% en ventas de VUL según Wink, Oklahoma convirtiéndose en el último estado en exigir preaprobación para aumentos de tarifa, y nueva investigación de KBRA sobre calificaciones de crédito privado en carteras de aseguradoras de vida.</p>

<picture>
<source type="image/webp" srcset="../img/opt/blog-generated/weekly-insurance-update-2026-06-14/hero-es.webp"/>
<img alt="Profesional de seguros revisa un informe de ventas récord del primer trimestre de 2026 con gráfico de crecimiento — actualización semanal junio 2026" class="img-fluid rounded-3 shadow-sm" src="../img/opt/blog-generated/weekly-insurance-update-2026-06-14/hero-es.png" width="1024" height="682" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='../img/opt/3-1-2026-Blog.png'"/>
</picture>"""

html = re.sub(
    r'<p class="lead mb-3 fw-semibold">📰 4 historias.*?</picture>',
    hero_block,
    html,
    count=1,
    flags=re.DOTALL,
)

html = re.sub(
    r'<section class="story-section" id="story1">.*?</section>\s*<div class="border rounded p-4 mb-4 bg-white">',
    stories + "\n\n<div class=\"border rounded p-4 mb-4 bg-white\">",
    html,
    count=1,
    flags=re.DOTALL,
)

html = html.replace(
    "El contenido cubre noticias de EE. UU. sobre vida y gastos finales del 31 de mayo al 6 de junio de 2026.",
    "El contenido cubre noticias de EE. U.S. sobre vida y gastos finales del 7 al 13 de junio de 2026.",
)
html = html.replace("EE. U.S.", "EE. UU.")

html = html.replace(
    '<li><a href="weekly-insurance-update-2026-05-31.html">Actualización 31 mayo 2026 — semana anterior</a></li>',
    '<li><a href="weekly-insurance-update-2026-06-07.html">Actualización 7 junio 2026 — semana anterior</a></li>',
)
html = html.replace(
    '<li><a href="#story1">Historia 1 — adquisición 26North Re</a></li>\n<li><a href="#story2">Historia 2 — Maryland FAMLI</a></li>\n<li><a href="#story3">Historia 3 — récord localizador NAIC</a></li>\n<li><a href="#story4">Historia 4 — leyes BOLI Luisiana</a></li>',
    '<li><a href="#story1">Historia 1 — ventas LIMRA T1 2026</a></li>\n<li><a href="#story2">Historia 2 — auge VUL (Wink)</a></li>\n<li><a href="#story3">Historia 3 — tarifas Oklahoma</a></li>\n<li><a href="#story4">Historia 4 — crédito privado KBRA</a></li>',
)
html = html.replace(
    '<p class="small mb-0 mt-2 text-secondary"><a href="weekly-insurance-update-2026-05-31.html">Actualización del 31 de mayo</a> — boletín de la semana anterior.</p>',
    '<p class="small mb-0 mt-2 text-secondary"><a href="weekly-insurance-update-2026-06-07.html">Actualización del 7 de junio</a> — boletín de la semana anterior.</p>',
)

html = html.replace("Aprox. 32 min de lectura", "Aprox. 28 min de lectura")

PATH.write_text(html, encoding="utf-8")
print(f"Patched {PATH}")

# sources mirror
src = ROOT / "sources" / "blog" / f"{SLUG}.html"
if src.parent.exists():
    src.write_text(html.replace("../", ""), encoding="utf-8")
    print(f"Wrote {src}")
