#!/usr/bin/env python3
"""One-shot: clone 2026-08-02 templates into this week's consumer digest + articles."""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "weekly-insurance-update-2026-08-23"
ISO = "2026-08-23T11:00:00-05:00"
DATE_ES = "23 de agosto de 2026"
DATE_EN = "August 23, 2026"
WINDOW_ES = "16 al 22 de agosto de 2026"
WINDOW_EN = "August 16–22, 2026"

ART = {
    1: {
        "es_file": "pruebas-geneticas-seguro-de-vida-2026-08-23.html",
        "en_file": "genetic-tests-life-insurance-2026-08-23.html",
        "es_h": "Si se hizo una prueba genética, ¿eso importa al pedir un seguro de vida?",
        "en_h": "If you had a genetic test, does that matter when you apply for life insurance?",
        "es_desc": "Al pedir un seguro de vida la compañía pregunta por su salud. Qué cubre una ley federal de salud y qué no cubre en vida.",
        "en_desc": "Life insurers ask about your health. What a federal health-privacy law covers — and what it does not cover for life insurance.",
        "es_kw": "seguro de vida, pruebas genéticas, gastos finales, solicitud de seguro",
        "en_kw": "life insurance, genetic test, final expense, life insurance application",
        "img": "story-1",
        "es_alt": "Científica en un laboratorio examina una muestra de prueba genética junto a un modelo de ADN",
        "en_alt": "Scientist in a laboratory examining a genetic test sample beside a DNA model",
    },
    2: {
        "es_file": "anualidad-cuando-puede-usar-el-dinero-2026-08-23.html",
        "en_file": "annuity-when-you-can-use-the-money-2026-08-23.html",
        "es_h": "Por qué a veces no se puede sacar el dinero de una anualidad cuando se necesita",
        "en_h": "Why some people cannot take money out of an annuity when they need it",
        "es_desc": "Una anualidad es un contrato de retiro, no una cuenta de cheques. Cuándo puede usar el dinero y cómo se diferencia del seguro de vida.",
        "en_desc": "An annuity is a retirement contract, not a checking account. When you can use the money, and how it differs from life insurance.",
        "es_kw": "anualidad, retiro, seguro de vida, gastos finales",
        "en_kw": "annuity, retirement income, life insurance, final expense",
        "img": "story-2",
        "es_alt": "Mujer mayor recibe un pago en efectivo en un mostrador de oficina",
        "en_alt": "Older woman receiving a cash payout at an office counter",
    },
    3: {
        "es_file": "regla-funerales-ftc-derechos-familias-2026-08-23.html",
        "en_file": "ftc-funeral-rule-family-rights-2026-08-23.html",
        "es_h": "Sus derechos al comprar un funeral — y por qué importan si piensa en un seguro",
        "en_h": "Your rights when you shop for a funeral — and why that matters for life insurance",
        "es_desc": "Al planear un funeral usted puede pedir precios y llevarse una lista. Cómo eso ayuda si busca un seguro de gastos finales.",
        "en_desc": "When you plan a funeral you can ask for prices and keep a printed list. Why that matters if you are looking at final expense insurance.",
        "es_kw": "regla de funerales, FTC, gastos finales, lista de precios funeraria",
        "en_kw": "FTC Funeral Rule, funeral prices, final expense insurance, general price list",
        "img": "story-3",
        "es_alt": "Pareja mayor camina del brazo hacia la entrada de una funeraria",
        "en_alt": "Older couple walking arm in arm toward a funeral home entrance",
    },
}


def splice(html: str, start: str, end: str, new: str) -> str:
    i = html.find(start)
    j = html.find(end)
    if i < 0 or j < 0 or j <= i:
        raise SystemExit(f"splice failed start={i} end={j}")
    return html[:i] + new + html[j:]


def set_meta(html: str, *, title, desc, keywords, canonical, og_title, og_desc, og_url, og_image, robots, locale, tags):
    html = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html, count=1, flags=re.S)
    html = re.sub(
        r'<meta content="[^"]*" name="description"/>',
        f'<meta content="{desc}" name="description"/>',
        html,
        count=1,
    )
    html = re.sub(
        r'<meta content="[^"]*" name="keywords"/>',
        f'<meta content="{keywords}" name="keywords"/>',
        html,
        count=1,
    )
    html = re.sub(
        r'<meta content="[^"]*" name="robots"/>',
        f'<meta content="{robots}" name="robots"/>',
        html,
        count=1,
    )
    html = re.sub(
        r'<link href="[^"]*" rel="canonical"/>',
        f'<link href="{canonical}" rel="canonical"/>',
        html,
        count=1,
    )
    html = re.sub(r'<meta content="[^"]*" property="og:title"/>', f'<meta content="{og_title}" property="og:title"/>', html, count=1)
    html = re.sub(r'<meta content="[^"]*" property="og:description"/>', f'<meta content="{og_desc}" property="og:description"/>', html, count=1)
    html = re.sub(r'<meta content="[^"]*" property="og:url"/>', f'<meta content="{og_url}" property="og:url"/>', html, count=1)
    html = re.sub(r'<meta content="[^"]*" property="og:image"/>', f'<meta content="{og_image}" property="og:image"/>', html, count=1)
    html = re.sub(r'<meta content="[^"]*" property="og:locale"/>', f'<meta content="{locale}" property="og:locale"/>', html, count=1)
    html = html.replace("2026-08-02T08:00:00-06:00", ISO)
    html = re.sub(
        r'<link rel="preload" as="image" href="[^"]+" type="image/webp" fetchpriority="high"/>',
        f'<link rel="preload" as="image" href="{og_image.replace("https://www.mejorvidainsurance.com/", "../" if "/blog/" in canonical and "/en/" not in canonical else "../../").replace(".png", ".webp").replace("https://www.mejorvidainsurance.com/", "")}" type="image/webp" fetchpriority="high"/>',
        html,
        count=1,
    )
    return html


def set_hreflang(html: str, url: str, en: bool) -> str:
    html = re.sub(
        r'<link href="https://www.mejorvidainsurance.com/[^"]+" hreflang="es" rel="alternate"/>',
        "" if en else f'<link href="{url}" hreflang="es" rel="alternate"/>',
        html,
        count=1,
    )
    html = re.sub(
        r'<link href="https://www.mejorvidainsurance.com/[^"]+" hreflang="x-default" rel="alternate"/>',
        "" if en else f'<link href="{url}" hreflang="x-default" rel="alternate"/>',
        html,
        count=1,
    )
    html = re.sub(
        r'<link href="https://www.mejorvidainsurance.com/[^"]+" hreflang="en" rel="alternate"/>',
        "",
        html,
    )
    return html


def set_article_tags(html: str, tags: list[str]) -> str:
    pattern = re.compile(r'(?:<meta content="[^"]*" property="article:tag"/>\s*)+')
    repl = "".join(f'<meta content="{t}" property="article:tag"/>\n' for t in tags)
    html2, n = pattern.subn(repl, html, count=1)
    return html2 if n else html


def img_prefix(en: bool) -> str:
    return "../../img/opt/blog-generated/" + SLUG if en else "../img/opt/blog-generated/" + SLUG


def digest_body(en: bool) -> str:
    p = img_prefix(en)
    a1, a2, a3 = ART[1], ART[2], ART[3]
    if not en:
        return f'''<div class="blog-hero mv-news hero">
<div class="container">
<h1>Actualización semanal de seguros de vida y gastos finales en EE. UU.</h1>
<div class="blog-meta">
<i class="fas fa-calendar-alt me-2"></i>{DATE_ES} · Noticias y guías del {WINDOW_ES} |
   <i class="fas fa-user ms-3 me-2"></i>Mejor Vida Seguros |
   <i class="fas fa-clock ms-3 me-2"></i>Aprox. 6 min de lectura
  </div>
<p class="lead mb-3 fw-semibold">3 historias | Salud en la solicitud | Dinero de retiro | Derechos en la funeraria</p>
<p class="lead mb-3">Cada semana resumimos noticias del mundo de los seguros para ayudar a las familias a protegerse con claridad. Esta edición habla de las preguntas de salud al pedir un seguro de vida, de por qué a veces no se puede sacar el dinero de un contrato de retiro, y de sus derechos al planear un funeral.</p>
<picture>
<source type="image/webp" srcset="{p}/hero-es.webp"/>
<img alt="Ilustración de familias diversas junto a una hélice de ADN — {DATE_ES}" class="img-fluid rounded-3 shadow-sm" src="{p}/hero-es.png" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='../img/opt/3-1-2026-Blog.png'"/>
</picture>
</div>
</div>
<article class="py-5 mv-news page-wrap">
<div class="news-grid">
<section class="article-col">
<div class="blog-content">
<section class="story-section" id="story1">
<h2>Historia 1: {a1["es_h"]}</h2>
<p class="story-meta"><strong>Fuente:</strong> Departamento de Salud y Servicios Humanos de EE. UU. | <strong>Publicado:</strong> {DATE_ES}</p>
<picture>
<source type="image/webp" srcset="{p}/story-1.webp"/>
<img alt="{a1["es_alt"]}" class="img-fluid rounded-3 mb-3" src="{p}/story-1.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../img/opt/3-1-2026-Blog.png'"/>
</picture>
<p>Cuando usted pide un seguro de vida, la compañía casi siempre pregunta por su salud. Así decide si puede ofrecerle una póliza. Pueden preguntar por el corazón, el cáncer, la diabetes o si fuma. Algunas pólizas pequeñas, pensadas para ayudar con un funeral, hacen menos preguntas. Otras hacen más.</p>
<p>Hay otro tipo de información médica: una prueba genética. Es un estudio que mira los genes que usted heredó de sus padres. A veces la pide un médico. A veces alguien compra un kit en casa. Esta semana, noticias nacionales volvieron a preguntar si una compañía de seguro de vida puede usar ese resultado cuando usted solicita una póliza.</p>
<p>Mucha gente cree que una ley federal ya dice que no. Esa ley cubre, sobre todo, el seguro de salud —el que ayuda a pagar al médico y al hospital— y muchos empleos. El gobierno de Estados Unidos dice que no cubre el seguro de vida. Algunos estados añaden sus propias reglas.</p>
<p>Esto importa si busca vida a término, vida entera o gastos finales. No significa que lo vayan a rechazar. Las preguntas de una solicitud de vida no son las mismas reglas que el seguro médico. Mejor Vida Seguros explica opciones: 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">¿Quiere conocer todos los detalles?</p>
<p class="mb-4"><a class="btn btn-primary" href="{a1["es_file"]}">Leer el artículo completo</a></p>
<p class="story-meta mb-0"><strong>Fuente: <a href="https://www.hhs.gov/ohrp/regulations-and-policy/guidance/guidance-on-genetic-information-nondiscrimination-act/index.html" rel="noopener" target="_blank">HHS</a> · <a href="https://www.genome.gov/about-genomics/policy-issues/Genetic-Discrimination" rel="noopener" target="_blank">NIH</a></strong></p>
</section>
<section class="story-section" id="story2">
<h2>Historia 2: {a2["es_h"]}</h2>
<p class="story-meta"><strong>Fuente:</strong> Insurance Information Institute | <strong>Publicado:</strong> {DATE_ES}</p>
<picture>
<source type="image/webp" srcset="{p}/story-2.webp"/>
<img alt="{a2["es_alt"]}" class="img-fluid rounded-3 mb-3" src="{p}/story-2.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../img/opt/3-1-2026-Blog.png'"/>
</picture>
<p>El seguro de vida paga un dinero a su familia si usted fallece, según la póliza. Una anualidad es otra cosa. Es un contrato con una compañía de seguros. Usted les entrega dinero ahora. Ellos prometen enviarle pagos más adelante, a menudo en la jubilación. No es una cuenta de cheques. No siempre puede retirar el dinero el día que quiera.</p>
<p>Esta semana una columna de finanzas personales describió a alguien que no podía usar su dinero hasta una fecha lejana. Si el contrato dice que hay que esperar, o que sacar el dinero antes cuesta un cargo, esa regla es la que cuenta. Algunas anualidades empiezan a pagar relativamente pronto. Otras esperan años.</p>
<p>Esto importa si está mezclando “ingresos para el retiro” con “dinero para un funeral.” No es el mismo trabajo. Un seguro de gastos finales está pensado para un beneficio por fallecimiento. Una anualidad suele estar pensada para un flujo de ingresos mientras usted vive.</p>
<p>Si su meta es el funeral, pregunte por un seguro de vida pequeño. Si su meta es el retiro, pregunte por escrito cuándo puede usar el dinero. Mejor Vida Seguros no promete un rendimiento. 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">¿Quiere conocer todos los detalles?</p>
<p class="mb-4"><a class="btn btn-primary" href="{a2["es_file"]}">Leer el artículo completo</a></p>
<p class="story-meta mb-0"><strong>Fuente: <a href="https://www.iii.org/article/what-annuities" rel="noopener" target="_blank">Insurance Information Institute</a></strong></p>
</section>
<section class="story-section" id="story3">
<h2>Historia 3: {a3["es_h"]}</h2>
<p class="story-meta"><strong>Fuente:</strong> Comisión Federal de Comercio | <strong>Publicado:</strong> {DATE_ES}</p>
<picture>
<source type="image/webp" srcset="{p}/story-3.webp"/>
<img alt="{a3["es_alt"]}" class="img-fluid rounded-3 mb-3" src="{p}/story-3.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../img/opt/3-1-2026-Blog.png'"/>
</picture>
<p>Cuando alguien fallece, la familia suele decidir en pocos días: entierro o cremación, qué funeraria, qué ataúd. Una funeraria es el negocio que organiza esos servicios. Los precios pueden ser altos, y es fácil sentirse presionado.</p>
<p>El gobierno de Estados Unidos tiene una oficina que protege a los consumidores. Escribió reglas para que las funerarias muestren los precios con claridad y no le obliguen a comprar extras que usted no quiere. Usted puede pedir precios por teléfono sin dar primero su nombre. Si visita, deben entregarle una lista de precios para llevársela a casa.</p>
<p>Un seguro de gastos finales puede dejar dinero en manos de la familia. No reemplaza esos derechos. La póliza paga un beneficio. Las reglas de precios ayudan a gastar ese dinero solo en lo que la familia realmente quiere.</p>
<p>Llame a dos funerarias mientras esté en calma. Mejor Vida Seguros no fija precios de funeral. Si quiere hablar de una póliza pequeña, 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">¿Quiere conocer todos los detalles?</p>
<p class="mb-4"><a class="btn btn-primary" href="{a3["es_file"]}">Leer el artículo completo</a></p>
<p class="story-meta mb-0"><strong>Fuente: <a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC Funeral Rule</a> · <a href="https://consumer.ftc.gov/articles/shopping-funeral-services" rel="noopener" target="_blank">FTC shopping guide</a></strong></p>
</section>
<div class="border rounded p-4 mb-4 bg-white">
<p class="mb-1 fw-bold">Mejor Vida Seguros</p>
<p class="mb-2">Ayudamos a familias hispanas en EE. UU. a entender sus opciones de protección — con claridad y sin presión.</p>
<p class="mb-0"><a href="mailto:Julie@mejorvidainsurance.com">Julie@mejorvidainsurance.com</a></p>
</div>
<div class="bg-light border rounded p-3 small text-secondary mb-4">
<p class="mb-2"><strong>Aviso:</strong> Este resumen es sólo con fines educativos y no constituye asesoramiento legal, financiero ni una recomendación personalizada.</p>
<p class="mb-2">El contenido cubre temas para familias del {WINDOW_ES}.</p>
<p class="mb-0 text-center fw-semibold">© 2026 Mejor Vida Seguros. Todos los derechos reservados.</p>
</div>
<div class="internal-links">
<h3><i class="fas fa-link me-2"></i>Recursos relacionados</h3>
<ul>
<li><a href="que-es-seguro-gastos-finales.html">¿Qué es un seguro de gastos finales?</a></li>
<li><a href="cuanto-cuesta-seguro-gastos-finales.html">¿Cuánto cuesta un seguro de gastos finales?</a></li>
<li><a href="tipos-planes-seguro-gastos-finales.html">Tipos de planes de gastos finales</a></li>
<li><a href="../guias-gastos-finales.html">Guías de gastos finales</a></li>
<li><a href="../quote.html">Cotización gratis</a></li>
<li><a href="../blog.html">Más actualizaciones semanales</a></li>
</ul>
</div>
</div>
</section>
<aside aria-label="Información relacionada" class="sidebar">
<section class="sidebar-card">
<span class="eyebrow">En esta página</span>
<h3>Ir a</h3>
<ul>
<li><a href="#story1">Historia 1 — prueba genética y seguro de vida</a></li>
<li><a href="#story2">Historia 2 — anualidad y acceso al dinero</a></li>
<li><a href="#story3">Historia 3 — derechos en la funeraria</a></li>
</ul>
<p class="small mb-0 mt-2"><a href="../guias-gastos-finales.html">Guías de gastos finales</a> <span class="text-secondary">— para familias.</span></p>
</section>
</aside>
</div>
</article>
'''
    fb = "../../img/opt/3-1-2026-Blog.png"
    return f'''<div class="blog-hero mv-news hero">
<div class="container">
<h1>Weekly life and final expense insurance update in the U.S.</h1>
<div class="blog-meta">
<i class="fas fa-calendar-alt me-2"></i>{DATE_EN} · News and guides from {WINDOW_EN} |
   <i class="fas fa-user ms-3 me-2"></i>Mejor Vida Insurance |
   <i class="fas fa-clock ms-3 me-2"></i>About 6 min read
  </div>
<p class="lead mb-3 fw-semibold">3 stories | Health questions | Retirement money | Funeral-home rights</p>
<p class="lead mb-3">Each week we summarize insurance news to help families protect themselves with clarity. This edition covers health questions on a life insurance application, why some retirement contracts will not release cash on demand, and your rights when you plan a funeral.</p>
<picture>
<source type="image/webp" srcset="{p}/hero-en.webp"/>
<img alt="Illustration of diverse families along a DNA helix — {DATE_EN}" class="img-fluid rounded-3 shadow-sm" src="{p}/hero-en.png" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='{fb}'"/>
</picture>
</div>
</div>
<article class="py-5 mv-news page-wrap">
<div class="news-grid">
<section class="article-col">
<div class="blog-content">
<section class="story-section" id="story1">
<h2>Story 1: {a1["en_h"]}</h2>
<p class="story-meta"><strong>Source:</strong> U.S. Department of Health and Human Services | <strong>Published:</strong> {DATE_EN}</p>
<picture>
<source type="image/webp" srcset="{p}/story-1.webp"/>
<img alt="{a1["en_alt"]}" class="img-fluid rounded-3 mb-3" src="{p}/story-1.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='{fb}'"/>
</picture>
<p>When you apply for life insurance, the company almost always asks about your health. That is how they decide whether they can offer a policy. They may ask about the heart, cancer, diabetes, or smoking. Smaller policies meant to help with a funeral sometimes ask fewer questions. Others ask more.</p>
<p>There is another kind of medical information: a genetic test. That is a test that looks at the genes you inherited from your parents. A doctor may order one. Some people also buy a kit at home. National news this week asked whether a life insurance company can use that result when you apply.</p>
<p>Many people think a federal law already says no. That law mainly covers health insurance — the kind that helps pay the doctor and the hospital — and many jobs. The U.S. government says it does not cover life insurance. Some states add their own rules.</p>
<p>This matters if you are shopping for term, whole life, or final expense coverage. It does not mean you will be turned down. It means the questions on a life application are not the same rules as health-insurance privacy. Mejor Vida Insurance can explain options. 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">Want the full details?</p>
<p class="mb-4"><a class="btn btn-primary" href="{a1["en_file"]}">Read the full article</a></p>
<p class="story-meta mb-0"><strong>Source: <a href="https://www.hhs.gov/ohrp/regulations-and-policy/guidance/guidance-on-genetic-information-nondiscrimination-act/index.html" rel="noopener" target="_blank">HHS</a> · <a href="https://www.genome.gov/about-genomics/policy-issues/Genetic-Discrimination" rel="noopener" target="_blank">NIH</a></strong></p>
</section>
<section class="story-section" id="story2">
<h2>Story 2: {a2["en_h"]}</h2>
<p class="story-meta"><strong>Source:</strong> Insurance Information Institute | <strong>Published:</strong> {DATE_EN}</p>
<picture>
<source type="image/webp" srcset="{p}/story-2.webp"/>
<img alt="{a2["en_alt"]}" class="img-fluid rounded-3 mb-3" src="{p}/story-2.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='{fb}'"/>
</picture>
<p>Life insurance pays money to your family if you die, according to the policy. An annuity is a different product. It is a contract with an insurance company. You give them money now. They promise to send you payments later — often in retirement. It is not a checking account. You cannot always take the money out the day you want it.</p>
<p>A personal-finance column this week described someone who could not use their money until a far-off date. If the contract says you must wait, or that taking money out early costs a fee, that rule is what counts. Some annuities start paying relatively soon. Others wait years.</p>
<p>This matters if you are mixing “retirement income” with “money for a funeral.” Those are different jobs. Final expense insurance is meant to pay a death benefit. An annuity is usually meant to pay income while you are alive.</p>
<p>If your goal is a funeral, ask about a small life insurance policy. If your goal is retirement, ask in writing when you can use the money. Mejor Vida Insurance does not promise a return. 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">Want the full details?</p>
<p class="mb-4"><a class="btn btn-primary" href="{a2["en_file"]}">Read the full article</a></p>
<p class="story-meta mb-0"><strong>Source: <a href="https://www.iii.org/article/what-annuities" rel="noopener" target="_blank">Insurance Information Institute</a></strong></p>
</section>
<section class="story-section" id="story3">
<h2>Story 3: {a3["en_h"]}</h2>
<p class="story-meta"><strong>Source:</strong> Federal Trade Commission | <strong>Published:</strong> {DATE_EN}</p>
<picture>
<source type="image/webp" srcset="{p}/story-3.webp"/>
<img alt="{a3["en_alt"]}" class="img-fluid rounded-3 mb-3" src="{p}/story-3.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='{fb}'"/>
</picture>
<p>When someone dies, the family often has to decide in a few days: burial or cremation, which funeral home, which casket. A funeral home is the business that handles those services. Prices can be high, and it is easy to feel rushed.</p>
<p>The U.S. government has a consumer-protection office. It wrote rules so funeral homes have to show prices clearly and cannot force you to buy extras you do not want. You can ask for prices by phone without giving your name first. If you visit, they must give you a printed price list you can take home.</p>
<p>Final expense insurance can put money in the family’s hands. It does not replace those rights. The policy pays a benefit. The price rules help the family spend that money only on what they actually want.</p>
<p>Call two funeral homes while you are calm. Mejor Vida Insurance does not set funeral prices. If you want to talk about a small policy, 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">Want the full details?</p>
<p class="mb-4"><a class="btn btn-primary" href="{a3["en_file"]}">Read the full article</a></p>
<p class="story-meta mb-0"><strong>Source: <a href="https://consumer.ftc.gov/articles/ftc-funeral-rule" rel="noopener" target="_blank">FTC Funeral Rule</a> · <a href="https://consumer.ftc.gov/articles/shopping-funeral-services" rel="noopener" target="_blank">FTC shopping guide</a></strong></p>
</section>
<div class="border rounded p-4 mb-4 bg-white">
<p class="mb-1 fw-bold">Mejor Vida Insurance</p>
<p class="mb-2">We help Hispanic families in the U.S. understand protection options — clearly and without pressure.</p>
<p class="mb-0"><a href="mailto:Julie@mejorvidainsurance.com">Julie@mejorvidainsurance.com</a></p>
</div>
<div class="bg-light border rounded p-3 small text-secondary mb-4">
<p class="mb-2"><strong>Note:</strong> This summary is for education only. It is not legal or financial advice and not a personal recommendation.</p>
<p class="mb-2">Topics for families from {WINDOW_EN}.</p>
<p class="mb-0 text-center fw-semibold">© 2026 Mejor Vida Insurance. All rights reserved.</p>
</div>
<div class="internal-links">
<h3><i class="fas fa-link me-2"></i>Related resources</h3>
<ul>
<li><a href="../../blog/que-es-seguro-gastos-finales.html">What is final expense insurance? (Spanish guide)</a></li>
<li><a href="../../blog/cuanto-cuesta-seguro-gastos-finales.html">How much does it cost? (Spanish)</a></li>
<li><a href="../../guias-gastos-finales.html">Final expense guides</a></li>
<li><a href="../quote.html">Free quote</a></li>
<li><a href="../blog.html">More weekly updates</a></li>
</ul>
</div>
</div>
</section>
<aside aria-label="Supporting information" class="sidebar">
<section class="sidebar-card">
<span class="eyebrow">On this page</span>
<h3>Jump to</h3>
<ul>
<li><a href="#story1">Story 1 — genetic tests and life insurance</a></li>
<li><a href="#story2">Story 2 — annuity access</a></li>
<li><a href="#story3">Story 3 — funeral-home rights</a></li>
</ul>
<p class="small mb-0 mt-2"><a href="../../guias-gastos-finales.html">Final expense guides</a> <span class="text-secondary">— for families.</span></p>
</section>
</aside>
</div>
</article>
'''


def article_body(n: int, en: bool) -> str:
    a = ART[n]
    p = img_prefix(en)
    digest = f"{SLUG}.html"
    fb = "../../img/opt/3-1-2026-Blog.png" if en else "../img/opt/3-1-2026-Blog.png"
    if n == 1 and not en:
        h, lead, img, alt = a["es_h"], "Al pedir un seguro de vida la compañía pregunta por su salud. Hay una ley que cubre sobre todo el seguro médico — no el de vida.", a["img"], a["es_alt"]
        body = f'''<p class="story-meta"><strong>Publicado:</strong> {DATE_ES} · <strong>Fuente:</strong> ver enlaces al final del artículo</p>
<p>Cuando usted pide un seguro de vida, la compañía casi siempre pregunta por su salud. Así decide si puede ofrecerle una póliza y en qué condiciones. Pueden preguntar por el corazón, el cáncer, la diabetes o si fuma. Eso no es un trámite extraño. Es la forma en que el seguro de vida evalúa el riesgo.</p>
<p>Algunas pólizas pequeñas, pensadas para ayudar con un funeral, hacen menos preguntas. Otras, sobre todo un seguro a término más grande, hacen más. Disponibilidad y precio varían según la persona, la compañía y la póliza.</p>
<p>Hay otro tipo de información médica: una prueba genética. Es un estudio que mira los genes que usted heredó de sus padres. A veces la pide un médico. A veces alguien compra un kit en casa. Esta semana, noticias nacionales volvieron a una pregunta sencilla: si usted se hizo esa prueba, ¿puede una compañía de seguro de vida usar el resultado cuando solicita una póliza?</p>
<h2 class="h4 mt-4">Qué cubre la ley — y qué no</h2>
<p>Mucha gente cree que una ley federal ya dice que no. Esa ley se llama GINA. El Departamento de Salud y Servicios Humanos de Estados Unidos explica qué cubre. GINA limita, sobre todo, cómo el seguro de salud —el que ayuda a pagar al médico y al hospital— y muchos empleadores pueden usar información genética.</p>
<p>Las mismas páginas del gobierno dicen que esa ley no cubre el seguro de vida, ni el de discapacidad, ni el de cuidados a largo plazo. El Instituto Nacional de Investigación del Genoma Humano lo confirma. Algunos estados añaden sus propias reglas. Esas reglas no son iguales en todo el país.</p>
<p>Eso no significa que a usted lo vayan a rechazar. Significa que no debe asumir que un resultado genético queda oculto para el seguro de vida solo porque existe esa ley. Tampoco debe ocultar lo que una solicitud pregunta con claridad. Dejar algo fuera puede crear problemas más adelante. Esta página no es asesoría legal ni médica.</p>
<h2 class="h4 mt-4">Un ejemplo</h2>
<p>Imagine a María, de 48 años. Su médico le pide una prueba genética. Meses después ella solicita un seguro de vida a término o de gastos finales. Lo que ocurra depende de la póliza, de la compañía, de lo que ella autorice revisar y de la ley de su estado. Nadie puede prometerle el resultado por adelantado.</p>
<p>Un producto de gastos finales no se suscribe igual que un término grande. Pregunte qué tipo de preguntas hace cada opción. Mejor Vida Seguros compara gastos finales, vida a término y vida entera. Ninguna opción se aprueba porque un artículo lo dijo.</p>
<p>También importa quién puede ver el expediente. Una compañía de vida puede pedir permiso para revisar historial médico. Eso no es lo mismo que el seguro que paga la consulta. Si alguien le dice “la ley federal ya cubre todo,” pida el nombre de la ley y qué producto cubre. En las páginas de HHS, GINA cubre sobre todo salud y empleo, no vida.</p>
<h2 class="h4 mt-4">Qué significa esto para usted</h2>
<p>Si está pensando en proteger a su familia, separe en su mente el seguro que paga al médico y el seguro que paga un beneficio si usted fallece. Las leyes no son las mismas. Si una pregunta de la solicitud no está clara, pida que se la expliquen antes de firmar.</p>
<p>Lleve a la conversación su meta: ¿ayuda con un funeral, o un beneficio más grande para ingresos de la familia? El tipo de producto cambia las preguntas. Mejor Vida Seguros no le pide que invente respuestas ni que envíe resultados genéticos por adelantado. Explica opciones. Si quiere ayuda, llame al 402-440-5438. Sin presiones y sin promesa de aprobación.</p>
<h2 class="h4 mt-4">Preguntas frecuentes</h2>
<h3 class="h6 mt-3">¿GINA cubre el seguro de vida?</h3>
<p>Según HHS, las protecciones de GINA para el seguro de salud no se extienden al seguro de vida, al de discapacidad ni al de cuidados a largo plazo.</p>
<h3 class="h6 mt-3">¿Eso significa que me van a rechazar?</h3>
<p>No. Significa que no debe asumir que un resultado genético queda invisible para el seguro de vida. Cada producto y cada compañía pregunta de forma distinta.</p>
<h3 class="h6 mt-3">¿Un seguro de gastos finales pregunta lo mismo?</h3>
<p>No siempre. Algunas pólizas de gastos finales hacen menos preguntas de salud. Pregunte cómo se suscribe el producto concreto.</p>'''
        faq = [
            ("¿GINA cubre el seguro de vida?", "Según HHS, las protecciones de GINA para el seguro de salud no se extienden al seguro de vida, al de discapacidad ni al de cuidados a largo plazo."),
            ("¿Eso significa que me van a rechazar?", "No. Significa que no debe asumir que un resultado genético queda invisible para el seguro de vida. Cada producto pregunta de forma distinta."),
            ("¿Un seguro de gastos finales pregunta lo mismo?", "No siempre. Algunas pólizas de gastos finales hacen menos preguntas de salud."),
        ]
        sources = [
            ("https://www.hhs.gov/ohrp/regulations-and-policy/guidance/guidance-on-genetic-information-nondiscrimination-act/index.html", "HHS — orientación sobre GINA"),
            ("https://www.genome.gov/about-genomics/policy-issues/Genetic-Discrimination", "NIH / NHGRI — discriminación genética"),
            ("que-es-seguro-gastos-finales.html", "Mejor Vida — ¿Qué es un seguro de gastos finales?"),
        ]
        related = [
            ("que-es-seguro-gastos-finales.html", "¿Qué es un seguro de gastos finales?"),
            ("tipos-planes-seguro-gastos-finales.html", "Tipos de planes de gastos finales"),
            (digest, f"Resumen semanal — {DATE_ES}"),
        ]
        cta = ("¿Quiere hablar con alguien sobre su situación?", "En Mejor Vida Seguros ayudamos a las familias a entender sus opciones con claridad — sin presión. Llame al", "Cotización gratis", "Agendar llamada", "../quote.html", "../schedule-julie.html")
        jump = "Resumen semanal"
    elif n == 1 and en:
        h, lead, img, alt = a["en_h"], "When you apply for life insurance the company asks about your health. A federal health-privacy law covers health insurance — not life insurance.", a["img"], a["en_alt"]
        body = f'''<p class="story-meta"><strong>Published:</strong> {DATE_EN} · <strong>Sources:</strong> see links at the end of this article</p>
<p>When you apply for life insurance, the company almost always asks about your health. That is how they decide whether they can offer a policy and on what terms. They may ask about the heart, cancer, diabetes, or smoking. That is not a strange extra step. It is how life insurance evaluates risk.</p>
<p>Some smaller policies, meant to help with a funeral, ask fewer questions. Others, especially larger term coverage, ask more. Availability and price vary by person, company, and policy.</p>
<p>There is another kind of medical information: a genetic test. That is a test that looks at the genes you inherited from your parents. A doctor may order one. Some people also buy a kit at home. National news this week asked a simple question: if you had that kind of test, can a life insurance company use the result when you apply?</p>
<h2 class="h4 mt-4">What the law covers — and what it does not</h2>
<p>Many people think a federal law already says no. That law is called GINA. The U.S. Department of Health and Human Services explains what it covers. GINA mainly limits how health insurance — the kind that helps pay doctor and hospital bills — and many employers may use genetic information.</p>
<p>The same government pages say that law does not cover life insurance, disability insurance, or long-term care insurance. The National Human Genome Research Institute says the same. Some states add their own rules. Those rules are not the same everywhere.</p>
<p>That does not mean you will be turned down. It means you should not assume a genetic result is invisible to life insurance just because that law exists. It also does not mean you should hide an answer the application clearly asks. Leaving something out can cause trouble later. This page is not legal or medical advice.</p>
<h2 class="h4 mt-4">An example</h2>
<p>Imagine Maria, 48. Her doctor orders a genetic test. Months later she applies for term life or final expense coverage. What happens depends on the policy, the company, what she authorizes the insurer to review, and her state’s law. Nobody can promise the outcome in advance.</p>
<p>A final expense product is not underwritten the same way as a large term policy. Ask what questions each option uses. Mejor Vida Insurance compares final expense, term, and whole life. No option is approved because an article said so.</p>
<p>Who can see the file also matters. A life company may ask permission to review medical history. That is not the same as the insurance that pays the doctor visit. If someone says “federal law already covers everything,” ask which law and which product. On the HHS pages, GINA mainly covers health coverage and employment — not life insurance.</p>
<h2 class="h4 mt-4">What this means for you</h2>
<p>If you are thinking about protecting your family, separate health insurance from life insurance in your mind. The laws are not the same. If an application question is unclear, ask for a plain explanation before you sign.</p>
<p>Bring your goal to the conversation: help with a funeral, or a larger benefit for family income? The product type changes the questions. Mejor Vida Insurance does not ask you to invent answers or to send genetic results in advance. It explains options. If you want help, call 402-440-5438. No pressure, and no promise of approval.</p>
<h2 class="h4 mt-4">Frequently asked questions</h2>
<h3 class="h6 mt-3">Does GINA cover life insurance?</h3>
<p>HHS states that GINA’s health-coverage protections do not extend to life, disability, or long-term care insurance.</p>
<h3 class="h6 mt-3">Does that mean I will be declined?</h3>
<p>No. It means you should not assume a genetic result is invisible to life insurance. Each product asks different questions.</p>
<h3 class="h6 mt-3">Does final expense ask the same things?</h3>
<p>Not always. Some final expense policies ask fewer health questions. Ask how the specific product is underwritten.</p>'''
        faq = [
            ("Does GINA cover life insurance?", "HHS states that GINA’s health-coverage protections do not extend to life, disability, or long-term care insurance."),
            ("Does that mean I will be declined?", "No. It means you should not assume a genetic result is invisible to life insurance. Each product asks different questions."),
            ("Does final expense ask the same things?", "Not always. Some final expense policies ask fewer health questions."),
        ]
        sources = [
            ("https://www.hhs.gov/ohrp/regulations-and-policy/guidance/guidance-on-genetic-information-nondiscrimination-act/index.html", "HHS — GINA guidance"),
            ("https://www.genome.gov/about-genomics/policy-issues/Genetic-Discrimination", "NIH / NHGRI — genetic discrimination"),
            ("../../blog/que-es-seguro-gastos-finales.html", "Mejor Vida — What is final expense insurance? (Spanish)"),
        ]
        related = [
            ("../../blog/que-es-seguro-gastos-finales.html", "What is final expense insurance? (Spanish guide)"),
            ("../../blog/tipos-planes-seguro-gastos-finales.html", "Types of final expense plans (Spanish)"),
            (digest, f"Weekly digest — {DATE_EN}"),
        ]
        cta = ("Want to talk through your situation?", "At Mejor Vida Insurance we help families understand options clearly — no pressure. Call", "Free quote", "Schedule a call", "../quote.html", "../schedule-julie.html")
        jump = "Weekly digest"
    elif n == 2 and not en:
        h, lead, img, alt = a["es_h"], "Una anualidad es un contrato de retiro. No es una cuenta de cheques ni un seguro para el funeral.", a["img"], a["es_alt"]
        body = f'''<p class="story-meta"><strong>Publicado:</strong> {DATE_ES} · <strong>Fuente:</strong> ver enlaces al final del artículo</p>
<p>El seguro de vida paga un dinero a su familia si usted fallece, según los términos de la póliza. Una anualidad es otra cosa. Es un contrato con una compañía de seguros. Usted les entrega dinero ahora. Ellos prometen enviarle pagos más adelante, a menudo en la jubilación.</p>
<p>No es una cuenta de cheques. No siempre puede retirar el dinero el día que quiera. El Insurance Information Institute explica que las anualidades pueden convertir ahorros en un flujo de ingresos. No son, por sí solas, un reemplazo de un seguro de vida ni de un plan para el funeral.</p>
<p>Esta semana una columna de finanzas personales describió a alguien que no podía usar su dinero hasta una fecha lejana. Si el contrato dice que hay que esperar, o que sacar el dinero antes cuesta un cargo, esa regla es la que cuenta.</p>
<h2 class="h4 mt-4">Cómo funciona en la práctica</h2>
<p>Algunas anualidades empiezan a pagar relativamente pronto. Otras esperan años. En esa espera, retirar puede costar un cargo de “entrega” — una multa por salir antes de tiempo — o solo permitir un retiro pequeño. Eso no es un error del banco. Así está hecho el producto.</p>
<p>Hasta que usted lee esas cláusulas, o pide que se las expliquen por escrito, no sabe si el dinero está disponible o encerrado. El nombre comercial del producto no sustituye la lectura del contrato.</p>
<p>También pregunte qué ocurre si usted fallece. En un seguro de vida, el beneficio suele ir a la persona nombrada en la póliza. En una anualidad, el contrato puede pagar a un beneficiario, seguir una renta, o terminar de otra forma. Esa diferencia importa si su familia cuenta con ese dinero para un funeral.</p>
<p>Antes de firmar, pida por escrito: cuándo empiezan los pagos, qué cargo hay si saca dinero antes, si hay un plazo para cancelar, y a quién se paga si usted muere. Si la respuesta es verbal, pida que se la envíen. Un “se lo explico luego” no sustituye el papel.</p>
<h2 class="h4 mt-4">Un ejemplo</h2>
<p>Imagine a Luis, de 62 años. Deposita un bono de trabajo en una anualidad que espera. Tres años después la familia necesita efectivo para un funeral. El contrato puede permitir poco o nada sin penalización. Eso no es un robo. Significa que el producto no era un fondo de emergencia ni una póliza para el funeral.</p>
<p>Si su meta es ayudar con los gastos de un entierro, un seguro de vida pequeño suele ser la herramienta más clara. Si su meta es un ingreso en el retiro, una anualidad podría encajar — solo después de entender cuándo puede usar el dinero.</p>
<p>Otra diferencia: el seguro de vida nombra un beneficiario. Ese dinero, si la póliza está en vigor, suele ir a esa persona. Una anualidad puede pagar a usted mientras vive, o a alguien más según el contrato. No asuma que “es lo mismo que vida.” Pida el cuadro que muestra pagos, cargos y qué ocurre al fallecer.</p>
<h2 class="h4 mt-4">Qué significa esto para usted</h2>
<p>Separe dos metas: ingresos de jubilación y dinero para el funeral. Pueden necesitar productos distintos. Pregunte por escrito cuándo puede usar el dinero y qué pasa si fallece antes. Guarde el contrato donde un familiar de confianza lo encuentre.</p>
<p>Mejor Vida Seguros puede hablar de anualidades y de seguro de vida cuando está autorizada a hacerlo. No promete un rendimiento ni que usted podrá retirar cuando quiera. Preguntas: 402-440-5438.</p>
<h2 class="h4 mt-4">Preguntas frecuentes</h2>
<h3 class="h6 mt-3">¿Una anualidad es lo mismo que un seguro de vida?</h3>
<p>No. El seguro de vida paga un beneficio por fallecimiento según la póliza. Una anualidad suele pagar ingresos mientras usted vive, según el contrato.</p>
<h3 class="h6 mt-3">¿Puedo usar una anualidad para pagar un funeral la próxima semana?</h3>
<p>A menudo no. Si hay un período de espera o un cargo por retiro, esa regla manda. Un seguro de gastos finales está pensado para un beneficio por fallecimiento.</p>
<h3 class="h6 mt-3">¿Qué debo preguntar antes de firmar?</h3>
<p>Cuándo puede usar el dinero, qué cuesta salir antes de tiempo, y qué ocurre si usted fallece.</p>'''
        faq = [
            ("¿Una anualidad es lo mismo que un seguro de vida?", "No. El seguro de vida paga un beneficio por fallecimiento. Una anualidad suele pagar ingresos mientras usted vive."),
            ("¿Puedo usar una anualidad para pagar un funeral la próxima semana?", "A menudo no. Si hay espera o un cargo por retiro, esa regla manda."),
            ("¿Qué debo preguntar antes de firmar?", "Cuándo puede usar el dinero, qué cuesta salir antes, y qué ocurre si usted fallece."),
        ]
        sources = [
            ("https://www.iii.org/article/what-annuities", "Insurance Information Institute — What are annuities?"),
            ("que-es-seguro-gastos-finales.html", "Mejor Vida — ¿Qué es un seguro de gastos finales?"),
        ]
        related = [
            ("que-es-seguro-gastos-finales.html", "¿Qué es un seguro de gastos finales?"),
            ("cuanto-cuesta-seguro-gastos-finales.html", "¿Cuánto cuesta un seguro de gastos finales?"),
            (digest, f"Resumen semanal — {DATE_ES}"),
        ]
        cta = ("¿Quiere hablar con alguien sobre su situación?", "En Mejor Vida Seguros ayudamos a las familias a entender sus opciones con claridad — sin presión. Llame al", "Cotización gratis", "Agendar llamada", "../quote.html", "../schedule-julie.html")
        jump = "Resumen semanal"
    elif n == 2 and en:
        h, lead, img, alt = a["en_h"], "An annuity is a retirement contract. It is not a checking account and it is not funeral insurance.", a["img"], a["en_alt"]
        body = f'''<p class="story-meta"><strong>Published:</strong> {DATE_EN} · <strong>Sources:</strong> see links at the end of this article</p>
<p>Life insurance pays money to your family if you die, according to the policy. An annuity is a different product. It is a contract with an insurance company. You give them money now. They promise to send you payments later — often in retirement.</p>
<p>It is not a checking account. You cannot always take the money out the day you want it. The Insurance Information Institute explains that annuities can turn savings into a stream of income. They are not, by themselves, a stand-in for life insurance or a funeral plan.</p>
<p>A personal-finance column this week described someone who could not use their money until a far-off date. If the contract says you must wait, or that taking money out early costs a fee, that rule is what counts.</p>
<h2 class="h4 mt-4">How it works in practice</h2>
<p>Some annuities start paying relatively soon. Others wait years. During that wait, taking money out may cost a surrender charge — a fee for leaving early — or may only allow a small withdrawal. That is how the product is built.</p>
<p>Until you read those clauses, or get them explained in writing, you do not know whether the money is available or locked. A marketing name does not replace the contract.</p>
<p>Also ask what happens if you die. With life insurance, the benefit usually goes to the person named on the policy. With an annuity, the contract may pay a beneficiary, continue an income stream, or end another way. That difference matters if your family is counting on that money for a funeral.</p>
<p>Before you sign, ask in writing: when payments start, what it costs to take money out early, whether there is a window to cancel, and who is paid if you die. If the answer is verbal, ask them to send it. “I’ll explain later” is not a substitute for the paper.</p>
<h2 class="h4 mt-4">An example</h2>
<p>Imagine Luis, 62. He puts a work bonus into an annuity that waits. Three years later the family needs cash for a funeral. The contract may allow little or nothing without a penalty. That is not theft. It means the product was not an emergency fund and was not a funeral policy.</p>
<p>If your goal is help with funeral costs, a small life insurance policy is usually the clearer tool. If your goal is retirement income, an annuity might fit — only after you understand when you can use the money.</p>
<p>Another difference: life insurance names a beneficiary. That money, if the policy is in force, usually goes to that person. An annuity may pay you while you live, or someone else according to the contract. Do not assume it is “the same as life insurance.” Ask for the chart that shows payments, charges, and what happens at death.</p>
<h2 class="h4 mt-4">What this means for you</h2>
<p>Separate two goals: retirement income and funeral cash. They may need different products. Ask in writing when you can use the money and what happens if you die first. Keep the contract where a trusted relative can find it.</p>
<p>Mejor Vida Insurance can discuss annuities and life insurance when authorized. It does not promise a return or that you can withdraw on demand. Questions: 402-440-5438.</p>
<h2 class="h4 mt-4">Frequently asked questions</h2>
<h3 class="h6 mt-3">Is an annuity the same as life insurance?</h3>
<p>No. Life insurance pays a death benefit according to the policy. An annuity usually pays income while you are alive, according to the contract.</p>
<h3 class="h6 mt-3">Can I use an annuity to pay for a funeral next week?</h3>
<p>Often no. If there is a waiting period or a withdrawal charge, that rule governs. Final expense insurance is meant to pay a death benefit.</p>
<h3 class="h6 mt-3">What should I ask before I sign?</h3>
<p>When you can use the money, what it costs to get out early, and what happens if you die.</p>'''
        faq = [
            ("Is an annuity the same as life insurance?", "No. Life insurance pays a death benefit. An annuity usually pays income while you are alive."),
            ("Can I use an annuity to pay for a funeral next week?", "Often no. If there is a waiting period or a withdrawal charge, that rule governs."),
            ("What should I ask before I sign?", "When you can use the money, what it costs to get out early, and what happens if you die."),
        ]
        sources = [
            ("https://www.iii.org/article/what-annuities", "Insurance Information Institute — What are annuities?"),
            ("../../blog/que-es-seguro-gastos-finales.html", "Mejor Vida — What is final expense insurance? (Spanish)"),
        ]
        related = [
            ("../../blog/que-es-seguro-gastos-finales.html", "What is final expense insurance? (Spanish guide)"),
            ("../../blog/cuanto-cuesta-seguro-gastos-finales.html", "How much does it cost? (Spanish)"),
            (digest, f"Weekly digest — {DATE_EN}"),
        ]
        cta = ("Want to talk through your situation?", "At Mejor Vida Insurance we help families understand options clearly — no pressure. Call", "Free quote", "Schedule a call", "../quote.html", "../schedule-julie.html")
        jump = "Weekly digest"
    elif n == 3 and not en:
        h, lead, img, alt = a["es_h"], "Cuando planifica un funeral puede pedir precios y llevarse una lista. Eso también ayuda si busca un seguro de gastos finales.", a["img"], a["es_alt"]
        body = f'''<p class="story-meta"><strong>Publicado:</strong> {DATE_ES} · <strong>Fuente:</strong> ver enlaces al final del artículo</p>
<p>Cuando alguien fallece, la familia suele tener que decidir en pocos días: entierro o cremación, qué funeraria, qué ataúd. Una funeraria es el negocio que organiza esos servicios. Los precios pueden ser altos, y es fácil sentirse presionado.</p>
<p>El gobierno de Estados Unidos tiene una oficina que protege a los consumidores. Se llama Comisión Federal de Comercio, o FTC. Esa oficina escribió reglas para que las funerarias muestren los precios con claridad y no le obliguen a comprar extras que usted no quiere. Ese conjunto de reglas se conoce como la Regla de Funerales. Sigue vigente.</p>
<h2 class="h4 mt-4">Qué puede hacer, en claro</h2>
<p>Usted puede pedir precios por teléfono sin dar primero su nombre. Si visita, deben entregarle una lista general de precios para llevársela a casa. Puede ver los precios de los ataúdes antes de ver los ataúdes. No tiene que comprar un paquete con extras.</p>
<p>Para la cremación, ningún estado exige un ataúd tradicional; deben ofrecer un contenedor más sencillo. Puede llevar un ataúd o una urna comprados en otro lado, y no pueden cobrarle un cargo por “manejarlo.” El embalsamado no es obligatorio por ley en todas las situaciones; puede preguntar por refrigeración.</p>
<p>Esa lista general de precios es el documento clave. Compárela con otra funeraria. Los nombres de los servicios no siempre coinciden, así que anote el total de lo que su familia realmente quiere: traslado, velación, cremación o entierro, ataúd o urna. Un paquete con un nombre elegante puede incluir cosas que usted no necesita.</p>
<p>Si hay un seguro de gastos finales, el dinero suele ir a la persona nombrada en la póliza. Esa persona decide cómo usarlo. La funeraria no cobra “directo a la póliza” salvo que la familia lo autorice. Por eso conviene que un familiar sepa dónde está la póliza y cómo pedir el beneficio.</p>
<p>Un seguro de vida pequeño —el que muchas familias llaman de gastos finales— puede dejar dinero en manos de la familia. No reemplaza estos derechos. La póliza paga un beneficio. La regla ayuda a gastar ese dinero solo en lo que la familia realmente quiere.</p>
<h2 class="h4 mt-4">Un ejemplo</h2>
<p>Imagine a Ana. Llama a dos funerarias, pide precios sin dar su apellido, compara, y después mira qué cobertura tiene la familia. Eso es planificación. No es una cotización de Mejor Vida Seguros.</p>
<p>Si nadie ha comparado precios, el monto del seguro puede quedarse corto o sobrar. Mejor Vida Seguros no fija precios de funerarias. Puede ayudar a pensar en gastos finales, término o vida entera según la meta familiar. Elegibilidad y precio del seguro varían.</p>
<p>Un funeral prepagado es un contrato con una funeraria. Un seguro de gastos finales es una póliza de vida. No son el mismo producto. La regla de la FTC habla de cómo la funeraria debe mostrar precios. No decide qué seguro comprar.</p>
<h2 class="h4 mt-4">Qué significa esto para usted</h2>
<p>Use estos derechos en calma, no el día del fallecimiento si puede evitarlo. Llame a dos funerarias. Guarde la lista de precios. Diga a un familiar dónde está la póliza, si hay una.</p>
<p>Si quiere revisar si una cobertura de gastos finales encaja con su plan, llame al 402-440-5438. Este artículo no inventa una prima. Sin promesa de aprobación.</p>
<h2 class="h4 mt-4">Preguntas frecuentes</h2>
<h3 class="h6 mt-3">¿Tengo que dar mi nombre para pedir precios?</h3>
<p>No. La FTC dice que puede pedir precios por teléfono sin dar primero su nombre.</p>
<h3 class="h6 mt-3">¿El seguro de gastos finales reemplaza la lista de precios?</h3>
<p>No. El seguro puede poner dinero en la familia. La lista de la funeraria dice qué cuesta cada servicio.</p>
<h3 class="h6 mt-3">¿Debo aceptar un paquete de la funeraria?</h3>
<p>No. Puede comprar solo lo que necesita.</p>'''
        faq = [
            ("¿Tengo que dar mi nombre para pedir precios?", "No. La FTC dice que puede pedir precios por teléfono sin dar primero su nombre."),
            ("¿El seguro de gastos finales reemplaza la lista de precios?", "No. El seguro puede poner dinero en la familia. La lista dice qué cuesta cada servicio."),
            ("¿Debo aceptar un paquete de la funeraria?", "No. Puede comprar solo lo que necesita."),
        ]
        sources = [
            ("https://consumer.ftc.gov/articles/ftc-funeral-rule", "FTC — Funeral Rule"),
            ("https://consumer.ftc.gov/articles/shopping-funeral-services", "FTC — Shopping for funeral services"),
            ("cuanto-cuesta-seguro-gastos-finales.html", "Mejor Vida — ¿Cuánto cuesta un seguro de gastos finales?"),
        ]
        related = [
            ("cuanto-cuesta-seguro-gastos-finales.html", "¿Cuánto cuesta un seguro de gastos finales?"),
            ("final-expense-vs-prepagado-funerario-2026-07-19.html", "Gastos finales frente a funeral prepagado"),
            (digest, f"Resumen semanal — {DATE_ES}"),
        ]
        cta = ("¿Quiere hablar con alguien sobre su situación?", "En Mejor Vida Seguros ayudamos a las familias a entender sus opciones con claridad — sin presión. Llame al", "Cotización gratis", "Agendar llamada", "../quote.html", "../schedule-julie.html")
        jump = "Resumen semanal"
    else:
        h, lead, img, alt = a["en_h"], "When you plan a funeral you can ask for prices and keep a printed list. That also helps if you are looking at final expense insurance.", a["img"], a["en_alt"]
        body = f'''<p class="story-meta"><strong>Published:</strong> {DATE_EN} · <strong>Sources:</strong> see links at the end of this article</p>
<p>When someone dies, the family often has to decide in a few days: burial or cremation, which funeral home, which casket. A funeral home is the business that handles those services. Prices can be high, and it is easy to feel rushed.</p>
<p>The U.S. government has a consumer-protection office. It is called the Federal Trade Commission, or FTC. That office wrote rules so funeral homes have to show prices clearly and cannot force you to buy extras you do not want. That set of rules is called the Funeral Rule. It is still in force.</p>
<h2 class="h4 mt-4">What you can do, in plain words</h2>
<p>You can ask for prices by phone without giving your name first. If you visit, they must give you a general price list you can take home. You can look at casket prices before you look at the caskets. You do not have to buy a package of extras.</p>
<p>For cremation, no state requires a traditional casket; they must offer a simpler container. You may bring a casket or urn bought somewhere else, and they cannot add a handling fee. Embalming is not required by law in every situation; you can ask about refrigeration.</p>
<p>That general price list is the key document. Compare it with another funeral home. Service names do not always match, so write down the total for what your family actually wants: transfer, visitation, cremation or burial, casket or urn. A package with an elegant name can include extras you do not need.</p>
<p>If there is a final expense policy, the money usually goes to the person named on the policy. That person decides how to use it. The funeral home does not bill “straight to the policy” unless the family authorizes it. That is why one relative should know where the policy is and how to claim the benefit.</p>
<p>A small life insurance policy — the kind many families call final expense — can put money in the family’s hands. It does not replace these rights. The policy pays a benefit. The Rule helps that money buy only what the family actually wants.</p>
<h2 class="h4 mt-4">An example</h2>
<p>Imagine Ana. She calls two funeral homes, asks prices without giving her last name, compares, then looks at what coverage the family has. That is planning. It is not a Mejor Vida Insurance quote.</p>
<p>If nobody compares prices, a policy amount can fall short or sit unused. Mejor Vida Insurance does not set funeral-home prices. It can help you think about final expense, term, or whole life against a family goal. Eligibility and premium vary.</p>
<p>A prepaid funeral is a contract with a funeral home. Final expense insurance is a life policy. They are not the same product. The FTC rule is about how the funeral home must show prices. It does not decide which insurance to buy.</p>
<h2 class="h4 mt-4">What this means for you</h2>
<p>Use these rights in calm, not the week of a death if you can help it. Call two funeral homes. Keep the price list. Tell one relative where the policy is, if there is one.</p>
<p>If you want to review whether final expense coverage fits your plan, call 402-440-5438. This article does not invent a premium. No promise of approval.</p>
<h2 class="h4 mt-4">Frequently asked questions</h2>
<h3 class="h6 mt-3">Do I have to give my name to get prices?</h3>
<p>No. The FTC says you can get prices by phone without giving your name first.</p>
<h3 class="h6 mt-3">Does final expense insurance replace the price list?</h3>
<p>No. Insurance can put money in the family’s hands. The funeral home list says what each service costs.</p>
<h3 class="h6 mt-3">Do I have to take a funeral-home package?</h3>
<p>No. You can buy only what you need.</p>'''
        faq = [
            ("Do I have to give my name to get prices?", "No. The FTC says you can get prices by phone without giving your name first."),
            ("Does final expense insurance replace the price list?", "No. Insurance can put money in the family’s hands. The list says what each service costs."),
            ("Do I have to take a funeral-home package?", "No. You can buy only what you need."),
        ]
        sources = [
            ("https://consumer.ftc.gov/articles/ftc-funeral-rule", "FTC — Funeral Rule"),
            ("https://consumer.ftc.gov/articles/shopping-funeral-services", "FTC — Shopping for funeral services"),
            ("../../blog/cuanto-cuesta-seguro-gastos-finales.html", "Mejor Vida — How much does final expense cost? (Spanish)"),
        ]
        related = [
            ("../../blog/cuanto-cuesta-seguro-gastos-finales.html", "How much does final expense cost? (Spanish guide)"),
            ("../../blog/final-expense-vs-prepagado-funerario-2026-07-19.html", "Final expense vs prepaid funeral (Spanish)"),
            (digest, f"Weekly digest — {DATE_EN}"),
        ]
        cta = ("Want to talk through your situation?", "At Mejor Vida Insurance we help families understand options clearly — no pressure. Call", "Free quote", "Schedule a call", "../quote.html", "../schedule-julie.html")
        jump = "Weekly digest"

    src_lis = "".join(f'<li><a href="{u}" rel="noopener" target="_blank">{lab}</a></li>' if u.startswith("http") else f'<li><a href="{u}">{lab}</a></li>' for u, lab in sources)
    rel_lis = "".join(f'<li><a href="{u}">{lab}</a></li>' for u, lab in related)
    src_label = "Sources (authoritative references)" if en else "Fuentes (referencia autoritativa)"
    rel_label = "Related resources" if en else "Recursos relacionados"
    back = f'<p class="small text-secondary"><a href="{digest}">← Back to weekly digest</a></p>' if en else f'<p class="small text-secondary"><a href="{digest}">← Volver al resumen semanal</a></p>'
    aside_h = "On this page" if en else "En esta página"
    jump_h = "Jump to" if en else "Ir a"
    return f'''<div class="blog-hero mv-news hero">
<div class="container">
<h1 id="top">{h}</h1>
<div class="blog-meta">
<i class="fas fa-calendar-alt me-2"></i>{DATE_EN if en else DATE_ES} |
   <i class="fas fa-user ms-3 me-2"></i>{"Mejor Vida Insurance" if en else "Mejor Vida Seguros"} |
   <i class="fas fa-clock ms-3 me-2"></i>{"About 10 min read" if en else "Aprox. 10 min de lectura"}
  </div>
<p class="lead mb-3">{lead}</p>
<picture>
<source type="image/webp" srcset="{p}/{img}.webp"/>
<img alt="{alt}" class="img-fluid rounded-3 shadow-sm" src="{p}/{img}.png" width="800" height="440" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='{fb}'"/>
</picture>
</div>
</div>
<article class="py-5 mv-news page-wrap">
<div class="news-grid">
<section class="article-col">
<div class="blog-content">
{body}
<div class="border rounded p-4 mb-4 bg-light">
<p class="mb-2 fw-semibold">{cta[0]}</p>
<p class="mb-3">{cta[1]} <a href="tel:+14024405438">1-402-440-5438</a>.</p>
<p class="mb-0"><a class="btn btn-primary me-2" href="{cta[4]}">{cta[2]}</a> <a class="btn btn-primary" href="{cta[5]}" style="background:#fec963;border-color:#fec963;color:#111;">{cta[3]}</a></p>
</div>
<div class="internal-links">
<h3><i class="fas fa-link me-2"></i>{rel_label}</h3>
<ul>
{rel_lis}
</ul>
</div>
<div class="border rounded p-3 mb-4 bg-white small">
<p class="mb-2 fw-semibold">{src_label}</p>
<ul class="mb-0 ps-3">
{src_lis}
</ul>
</div>
{back}
</div>
</section>
<aside aria-label="{"Supporting information" if en else "Información relacionada"}" class="sidebar">
<section class="sidebar-card">
<span class="eyebrow">{aside_h}</span>
<h3>{jump_h}</h3>
<ul>
<li><a href="#top">{"Overview" if en else "Inicio del artículo"}</a></li>
<li><a href="{digest}">{jump}</a></li>
</ul>
</section>
</aside>
</div>
</article>
''', faq


def json_ld_news(*, headline, desc, image, url, keywords, lang, word_count):
    return {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": headline,
        "description": desc,
        "image": image,
        "author": {"@type": "Person", "name": "Julie", "jobTitle": "Licensed insurance agent" if lang == "en" else "Agente de seguros con licencia", "worksFor": {"@type": "Organization", "name": "Mejor Vida Insurance" if lang == "en" else "Mejor Vida Seguros", "url": "https://www.mejorvidainsurance.com/"}},
        "publisher": {"@type": "Organization", "name": "Mejor Vida Insurance" if lang == "en" else "Mejor Vida Seguros", "url": "https://www.mejorvidainsurance.com/", "logo": {"@type": "ImageObject", "url": "https://www.mejorvidainsurance.com/img/logo-english2.png"}},
        "datePublished": ISO,
        "dateModified": ISO,
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "articleSection": "Insurance Education" if lang == "en" else "Educación sobre seguros",
        "keywords": keywords,
        "wordCount": word_count,
        "inLanguage": "en-US" if lang == "en" else "es-ES",
    }


def replace_json_ld_block(html: str, type_name: str, obj, required=True) -> str:
    pattern = re.compile(
        r'<script type="application/ld\+json">\s*\{\s*"@context":\s*"https://schema.org",\s*"@type":\s*"'
        + type_name
        + r'"[\s\S]*?</script>',
        re.I,
    )
    dumped = json.dumps(obj, ensure_ascii=False, indent=1)
    repl = f'<script type="application/ld+json">\n{dumped}\n</script>'
    html2, n = pattern.subn(repl, html, count=1)
    if n != 1:
        if not required and n == 0:
            # insert before first JSON-LD script
            marker = '<!-- JSON-LD:'
            i = html.find(marker)
            if i < 0:
                i = html.find('<script type="application/ld+json">')
            if i < 0:
                raise SystemExit(f"JSON-LD {type_name} missing and no insert point")
            return html[:i] + repl + "\n" + html[i:]
        raise SystemExit(f"JSON-LD {type_name} replace count={n}")
    return html2


def patch_head_digest(html: str, en: bool) -> str:
    base = "https://www.mejorvidainsurance.com"
    if en:
        url = f"{base}/en/blog/{SLUG}.html"
        img = f"{base}/img/opt/blog-generated/{SLUG}/hero-en.png"
        html = set_meta(
            html,
            title=f"Weekly life and final expense insurance update ({DATE_EN}) | Mejor Vida Insurance",
            desc=f"{DATE_EN} digest: life insurance health questions, annuity access, and funeral-home rights.",
            keywords=ART[1]["en_kw"] + ", " + ART[2]["en_kw"] + ", " + ART[3]["en_kw"],
            canonical=url,
            og_title=f"Weekly life & final expense update — {DATE_EN}",
            og_desc="Three family stories: health questions on a life application, annuity access, and funeral-home rights.",
            og_url=url,
            og_image=img,
            robots="noindex, follow",
            locale="en_US",
            tags=[],
        )
        html = html.replace("2026-08-02", "2026-08-23")
        news = json_ld_news(headline=f"Weekly life and final expense insurance update — {DATE_EN}", desc="Three family stories from the week of August 16–22, 2026.", image=img, url=url, keywords=["final expense insurance", "life insurance", "annuity", "funeral rights"], lang="en", word_count=1200)
        crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{base}/en/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{base}/en/blog.html"},
            {"@type": "ListItem", "position": 3, "name": f"Weekly update — {DATE_EN}", "item": url},
        ]}
        items = {"@context": "https://schema.org", "@type": "ItemList", "name": f"Family topics — {WINDOW_EN}", "itemListElement": [
            {"@type": "ListItem", "position": i, "url": f"{base}/en/blog/{ART[i]['en_file']}", "name": ART[i]["en_h"]} for i in (1, 2, 3)
        ]}
    else:
        url = f"{base}/blog/{SLUG}.html"
        img = f"{base}/img/opt/blog-generated/{SLUG}/hero-es.png"
        html = set_meta(
            html,
            title=f"Actualización semanal de seguros de vida y gastos finales ({DATE_ES}) | Mejor Vida Seguros",
            desc=f"Resumen del {DATE_ES}: preguntas de salud al pedir vida, acceso a una anualidad, y derechos en la funeraria.",
            keywords=ART[1]["es_kw"] + ", " + ART[2]["es_kw"] + ", " + ART[3]["es_kw"],
            canonical=url,
            og_title=f"Actualización semanal de vida y gastos finales — {DATE_ES}",
            og_desc="Tres historias para familias: salud en la solicitud, dinero de retiro y derechos en la funeraria.",
            og_url=url,
            og_image=img,
            robots="index, follow",
            locale="es_ES",
            tags=[],
        )
        html = html.replace("2026-08-02", "2026-08-23")
        news = json_ld_news(headline=f"Actualización semanal de seguros de vida y gastos finales — {DATE_ES}", desc="Tres historias para familias de la semana del 16 al 22 de agosto de 2026.", image=img, url=url, keywords=["seguro de gastos finales", "seguro de vida", "anualidad", "regla de funerales"], lang="es", word_count=1200)
        crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": f"{base}/"},
            {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{base}/blog.html"},
            {"@type": "ListItem", "position": 3, "name": f"Actualización semanal — {DATE_ES}", "item": url},
        ]}
        items = {"@context": "https://schema.org", "@type": "ItemList", "name": f"Temas para familias — {WINDOW_ES}", "itemListElement": [
            {"@type": "ListItem", "position": i, "url": f"{base}/blog/{ART[i]['es_file']}", "name": ART[i]["es_h"]} for i in (1, 2, 3)
        ]}
    html = replace_json_ld_block(html, "NewsArticle", news, required=not en)
    html = replace_json_ld_block(html, "BreadcrumbList", crumbs)
    html = replace_json_ld_block(html, "ItemList", items)
    html = set_hreflang(html, url, en)
    html = set_article_tags(
        html,
        ["life insurance", "final expense", "annuity", "funeral rights"] if en else ["seguro de vida", "gastos finales", "anualidad", "regla de funerales"],
    )
    # preload
    pre = ("../../" if en else "../") + f"img/opt/blog-generated/{SLUG}/hero-{'en' if en else 'es'}.webp"
    html = re.sub(
        r'<link rel="preload" as="image" href="[^"]+" type="image/webp" fetchpriority="high"/>',
        f'<link rel="preload" as="image" href="{pre}" type="image/webp" fetchpriority="high"/>',
        html,
        count=1,
    )
    html = re.sub(r'<link href="https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-08-23.html" hreflang="es" rel="alternate"/>', f'<link href="{url}" hreflang="es" rel="alternate"/>' if not en else "", html)
    return html


def patch_head_article(html: str, n: int, en: bool, faq) -> str:
    a = ART[n]
    base = "https://www.mejorvidainsurance.com"
    file = a["en_file"] if en else a["es_file"]
    url = f"{base}/en/blog/{file}" if en else f"{base}/blog/{file}"
    img = f"{base}/img/opt/blog-generated/{SLUG}/{a['img']}.png"
    html = set_meta(
        html,
        title=(a["en_h"] if en else a["es_h"]) + (" | Mejor Vida Insurance" if en else " | Mejor Vida Seguros"),
        desc=a["en_desc"] if en else a["es_desc"],
        keywords=a["en_kw"] if en else a["es_kw"],
        canonical=url,
        og_title=a["en_h"] if en else a["es_h"],
        og_desc=a["en_desc"] if en else a["es_desc"],
        og_url=url,
        og_image=img,
        robots="noindex, follow" if en else "index, follow",
        locale="en_US" if en else "es_ES",
        tags=[],
    )
    html = html.replace("2026-08-02", "2026-08-23")
    news = json_ld_news(headline=a["en_h"] if en else a["es_h"], desc=a["en_desc"] if en else a["es_desc"], image=img, url=url, keywords=(a["en_kw"] if en else a["es_kw"]).split(", "), lang="en" if en else "es", word_count=750)
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home" if en else "Inicio", "item": f"{base}/en/" if en else f"{base}/"},
        {"@type": "ListItem", "position": 2, "name": "Blog", "item": f"{base}/en/blog.html" if en else f"{base}/blog.html"},
        {"@type": "ListItem", "position": 3, "name": a["en_h"] if en else a["es_h"], "item": url},
    ]}
    faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": ans}} for q, ans in faq
    ]}
    html = replace_json_ld_block(html, "NewsArticle", news, required=False)
    html = replace_json_ld_block(html, "FAQPage", faq_ld)
    html = replace_json_ld_block(html, "BreadcrumbList", crumbs)
    html = set_hreflang(html, url, en)
    html = set_article_tags(html, (a["en_kw"] if en else a["es_kw"]).split(", "))
    pre = ("../../" if en else "../") + f"img/opt/blog-generated/{SLUG}/{a['img']}.webp"
    html = re.sub(
        r'<link rel="preload" as="image" href="[^"]+" type="image/webp" fetchpriority="high"/>',
        f'<link rel="preload" as="image" href="{pre}" type="image/webp" fetchpriority="high"/>',
        html,
        count=1,
    )
    return html


def write_page(src: Path, dest: Path, body: str, patch_head):
    html = src.read_text()
    html = splice(html, '<div class="blog-hero mv-news hero">', "<footer", body)
    html = patch_head(html)
    dest.write_text(html)
    print("wrote", dest.relative_to(ROOT))


def main():
    write_page(
        ROOT / "blog/weekly-insurance-update-2026-08-02.html",
        ROOT / f"blog/{SLUG}.html",
        digest_body(False),
        lambda h: patch_head_digest(h, False),
    )
    write_page(
        ROOT / "en/blog/weekly-insurance-update-2026-08-02.html",
        ROOT / f"en/blog/{SLUG}.html",
        digest_body(True),
        lambda h: patch_head_digest(h, True),
    )
    es_src = ROOT / "blog/beneficio-gradual-periodo-espera-gastos-finales-2026-08-02.html"
    en_src = ROOT / "en/blog/graded-benefit-waiting-period-final-expense-2026-08-02.html"
    for n in (1, 2, 3):
        body_es, faq_es = article_body(n, False)
        write_page(es_src, ROOT / "blog" / ART[n]["es_file"], body_es, lambda h, n=n, faq=faq_es: patch_head_article(h, n, False, faq))
        body_en, faq_en = article_body(n, True)
        write_page(en_src, ROOT / "en/blog" / ART[n]["en_file"], body_en, lambda h, n=n, faq=faq_en: patch_head_article(h, n, True, faq))


if __name__ == "__main__":
    main()
