#!/usr/bin/env python3
"""Patch cloned Aug 23 templates into the Aug 30, 2026 weekly blog."""
from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SLUG = "weekly-insurance-update-2026-08-30"
IMG = f"blog-generated/{SLUG}"
ISO = "2026-08-30T11:00:00-05:00"

ES1 = "costo-funeral-poliza-entierro-2026-08-30.html"
ES2 = "anualidad-cargos-rescate-2026-08-30.html"
ES3 = "adultos-jovenes-costo-seguro-termino-2026-08-30.html"
EN1 = "funeral-cost-burial-policy-2026-08-30.html"
EN2 = "annuity-surrender-charges-2026-08-30.html"
EN3 = "young-adults-term-life-cost-perception-2026-08-30.html"


def splice_hero(html: str, block: str) -> str:
    start = html.find('<div class="blog-hero')
    end = html.rfind("</article>")
    if start < 0 or end < 0:
        raise SystemExit("blog-hero or </article> missing")
    return html[:start] + block + html[end + len("</article>") :]


def replace_faq_json(html: str, faq_json: str) -> str:
    needle = '"@type": "FAQPage"'
    i = html.find(needle)
    if i < 0:
        return html
    s = html.rfind("<script", 0, i)
    e = html.find("</script>", i)
    if s < 0 or e < 0:
        return html
    return html[:s] + faq_json + html[e + len("</script>") :]


FAQ_ES1 = """<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
  {"@type":"Question","name":"¿Una póliza de entierro le paga a la funeraria?","acceptedAnswer":{"@type":"Answer","text":"Por lo general no. Paga un beneficio en efectivo a la persona que usted nombra, según el contrato. Esa persona decide cómo usar el dinero."}},
  {"@type":"Question","name":"¿Los 8,300 dólares de NFDA son lo que costará mi funeral?","acceptedAnswer":{"@type":"Answer","text":"No. Es una mediana nacional de 2023 y no incluye todos los cargos del cementerio ni el monumento. Pida la lista de precios de la funeraria local."}},
  {"@type":"Question","name":"¿Un funeral prepagado es lo mismo que un seguro de vida?","acceptedAnswer":{"@type":"Answer","text":"No. El prepagado es un arreglo con una funeraria. El seguro de vida paga a un beneficiario. Son instrumentos distintos."}}
 ]
}
</script>"""

FAQ_ES2 = """<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
  {"@type":"Question","name":"¿Qué es un cargo por rescate?","acceptedAnswer":{"@type":"Answer","text":"Es un porcentaje que la compañía puede quedarse si usted retira dinero de la anualidad demasiado pronto, durante un plazo escrito en el contrato."}},
  {"@type":"Question","name":"¿Puedo sacar un 10% cada año sin cargo?","acceptedAnswer":{"@type":"Answer","text":"Algunos contratos lo permiten. NAIC lo cita como ejemplo, no como regla de todas las anualidades. El límite está en su contrato."}},
  {"@type":"Question","name":"¿Una anualidad sustituye un seguro de gastos finales?","acceptedAnswer":{"@type":"Answer","text":"Por lo general no. La anualidad suele ser para ingresos de retiro. Un seguro de gastos finales paga un beneficio si usted fallece."}}
 ]
}
</script>"""

FAQ_ES3 = """<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
  {"@type":"Question","name":"¿El estudio de LIMRA es mi prima?","acceptedAnswer":{"@type":"Answer","text":"No. Es un hallazgo de percepción: adultos sanos de 18 a 30 años sobreestimaron el costo mediano de un término de 20 años por 250,000 dólares. Su tarifa es otra cosa."}},
  {"@type":"Question","name":"¿Término o vida entera para un adulto joven?","acceptedAnswer":{"@type":"Answer","text":"Depende del trabajo del dinero. Reemplazar ingresos unos años suele ser un trabajo de término. La vida entera dura mientras la póliza siga en vigor y suele costar más al mismo monto."}},
  {"@type":"Question","name":"¿Debo elegir la compañía de un ranking?","acceptedAnswer":{"@type":"Answer","text":"No. Un ranking no es su expediente. Pregunte si la compañía ofrece el monto y el producto que usted necesita."}}
 ]
}
</script>"""

FAQ_EN1 = """<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
  {"@type":"Question","name":"Does a burial policy pay the funeral home?","acceptedAnswer":{"@type":"Answer","text":"Usually not. It pays a cash benefit to the person you name, according to the contract. That person decides how to use the money."}},
  {"@type":"Question","name":"Is NFDA’s $8,300 what my funeral will cost?","acceptedAnswer":{"@type":"Answer","text":"No. It is a 2023 national median and does not include every cemetery charge or monument. Ask your local funeral home for its price list."}},
  {"@type":"Question","name":"Is a prepaid funeral the same as life insurance?","acceptedAnswer":{"@type":"Answer","text":"No. Prepaid is an arrangement with a funeral home. Life insurance pays a beneficiary. They are different instruments."}}
 ]
}
</script>"""

FAQ_EN2 = """<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
  {"@type":"Question","name":"What is a surrender charge?","acceptedAnswer":{"@type":"Answer","text":"A percentage the company may keep if you take money out of the annuity too early, during a period written in the contract."}},
  {"@type":"Question","name":"Can I take 10% a year with no charge?","acceptedAnswer":{"@type":"Answer","text":"Some contracts allow a small annual withdrawal. NAIC uses that as an example, not a rule for every annuity. Your contract controls."}},
  {"@type":"Question","name":"Does an annuity replace final expense insurance?","acceptedAnswer":{"@type":"Answer","text":"Usually not. An annuity is typically for retirement income. Final expense life insurance pays a benefit if you die."}}
 ]
}
</script>"""

FAQ_EN3 = """<script type="application/ld+json">
{
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
  {"@type":"Question","name":"Is the LIMRA finding my premium?","acceptedAnswer":{"@type":"Answer","text":"No. It is a perception finding: healthy adults 18–30 overestimated the median cost of a $250,000 20-year term. Your rate is something else."}},
  {"@type":"Question","name":"Term or whole life for a young adult?","acceptedAnswer":{"@type":"Answer","text":"It depends on the job for the money. Replacing income for a set of years is often a term job. Whole life is designed to last while the policy stays in force and usually costs more at the same face amount."}},
  {"@type":"Question","name":"Should I pick the company from a ranking?","acceptedAnswer":{"@type":"Answer","text":"No. A ranking is not your file. Ask whether the company will consider the amount and product you need."}}
 ]
}
</script>"""


DIGEST_ES = f"""<div class="blog-hero mv-news hero">
<div class="container">
<h1>Actualización semanal de seguros de vida y gastos finales en EE. UU.</h1>
<div class="blog-meta">
<i class="fas fa-calendar-alt me-2"></i>30 de agosto de 2026 · Noticias y guías del 23 al 29 de agosto de 2026 |
   <i class="fas fa-user ms-3 me-2"></i>Mejor Vida Seguros |
   <i class="fas fa-clock ms-3 me-2"></i>Aprox. 6 min de lectura
  </div>
<p class="lead mb-3 fw-semibold">3 historias | Costos de funeral | Reglas de una anualidad | Seguro a término para adultos jóvenes</p>
<p class="lead mb-3">Cada semana resumimos noticias del mundo de los seguros para ayudar a las familias a protegerse con claridad. Esta edición habla de por qué el funeral se cobra pronto, de qué reglas trae una anualidad cuando usted necesita el dinero, y de por qué tantos adultos jóvenes creen que el seguro de vida cuesta mucho más de lo que suele costar.</p>
<picture>
<source type="image/webp" srcset="../img/opt/{IMG}/hero-es.webp"/>
<img alt="Familia hispana de varias generaciones camina junta al atardecer — 30 de agosto de 2026" class="img-fluid rounded-3 shadow-sm" src="../img/opt/{IMG}/hero-es.png" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='../img/opt/3-1-2026-Blog.png'"/>
</picture>
</div>
</div>
<article class="py-5 mv-news page-wrap">
<div class="news-grid">
<section class="article-col">
<div class="blog-content">
<section class="story-section" id="story1">
<h2>Historia 1: El funeral se paga pronto. ¿Qué hace una póliza pequeña de entierro?</h2>
<p class="story-meta"><strong>Fuente:</strong> Asociación Nacional de Directores de Funerarias | <strong>Publicado:</strong> 30 de agosto de 2026</p>
<picture>
<source type="image/webp" srcset="../img/opt/{IMG}/story-1.webp"/>
<img alt="Abuela e hija hispanas revisan una lista de precios de funeraria en la mesa de la cocina" class="img-fluid rounded-3 mb-3" src="../img/opt/{IMG}/story-1.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../img/opt/3-1-2026-Blog.png'"/>
</picture>
<p>Cuando alguien fallece, la funeraria no espera meses. El pago suele pedirse en días. Esa cuenta puede incluir el servicio básico, un velorio o una ceremonia, un ataúd o una urna, y a menudo el cementerio aparte.</p>
<p>La Asociación Nacional de Directores de Funerarias (NFDA) publica medianas nacionales. En su estudio de listas de precios de 2023 —las cifras que aún muestra en su página de estadísticas— un funeral con velorio y entierro quedó en 8,300 dólares. Con velorio y cremación, 6,280. Esas medianas no incluyen todos los cargos del cementerio ni el monumento. El total de una familia real puede ser más alto o más bajo.</p>
<p>Una póliza pequeña de seguro de vida no es un contrato con la funeraria. Paga un beneficio en efectivo a la persona que usted nombra. Esa persona puede usarlo para el funeral u otras necesidades. Un funeral prepagado es otro arreglo. No mezcle los dos.</p>
<p>Esta semana circularon informes de “tamaño del mercado” del seguro de entierro. No repetimos esas cifras de vendedor. Lo útil es entender el costo típico y quién cobra el beneficio. Mejor Vida Seguros explica opciones: 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">¿Quiere conocer todos los detalles?</p>
<p class="mb-4"><a class="btn btn-primary" href="{ES1}">Leer el artículo completo</a></p>
<p class="story-meta mb-0"><strong>Fuente: <a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA — estadísticas</a></strong></p>
</section>
<section class="story-section" id="story2">
<h2>Historia 2: Una anualidad puede verse atractiva. El contrato igual tiene reglas.</h2>
<p class="story-meta"><strong>Fuente:</strong> Asociación Nacional de Comisionados de Seguros | <strong>Publicado:</strong> 30 de agosto de 2026</p>
<picture>
<source type="image/webp" srcset="../img/opt/{IMG}/story-2.webp"/>
<img alt="Hombre hispano lee un contrato de anualidad en la mesa, luz de atardecer" class="img-fluid rounded-3 mb-3" src="../img/opt/{IMG}/story-2.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../img/opt/3-1-2026-Blog.png'"/>
</picture>
<p>Después de unos años en que los ahorros se ven fuertes, una anualidad puede sonar fácil: usted deja el dinero y más tarde lo usa. Eso cabe en un anuncio. Un contrato no.</p>
<p>Una anualidad es un acuerdo con una compañía de seguros, no una cuenta de banco. La Asociación Nacional de Comisionados de Seguros (NAIC) advierte que, si saca el dinero demasiado pronto, suele haber un cargo por rescate: un porcentaje de lo que retira. Ese porcentaje a menudo baja con los años. Algunos contratos permiten un retiro pequeño cada año —a veces alrededor del 10 por ciento— sin ese cargo. El límite exacto está en su contrato, no en un titular.</p>
<p>Esto importa si el dinero podría necesitarse pronto para un funeral. Una anualidad suele ser un mal sustituto cuando la única meta es un fondo de entierro. Mejor Vida Seguros no ilustra un interés. 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">¿Quiere conocer todos los detalles?</p>
<p class="mb-4"><a class="btn btn-primary" href="{ES2}">Leer el artículo completo</a></p>
<p class="story-meta mb-0"><strong>Fuente: <a href="https://content.naic.org/sites/default/files/consumer-what-to-know-before-buying-annuity.pdf" rel="noopener" target="_blank">NAIC — antes de comprar una anualidad</a></strong></p>
</section>
<section class="story-section" id="story3">
<h2>Historia 3: Muchos adultos jóvenes creen que el seguro de vida cuesta 10 veces más</h2>
<p class="story-meta"><strong>Fuente:</strong> LIMRA y Life Happens | <strong>Publicado:</strong> 30 de agosto de 2026</p>
<picture>
<source type="image/webp" srcset="../img/opt/{IMG}/story-3.webp"/>
<img alt="Padre hispano joven carga a un niño pequeño en una sala iluminada por el sol" class="img-fluid rounded-3 mb-3" src="../img/opt/{IMG}/story-3.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../img/opt/3-1-2026-Blog.png'"/>
</picture>
<p>Muchos adultos jóvenes no piden un seguro de vida porque creen que la prima se comerá el presupuesto. LIMRA y Life Happens, en el estudio Insurance Barometer de 2025, hallaron que adultos sanos de 18 a 30 años, al adivinar el costo de un término de 20 años por 250,000 dólares, sobreestimaron el costo mediano unas 10 a 12 veces. Eso es percepción. No es su prima.</p>
<p>Esta semana, sitios de comparación publicaron listas de “el mejor seguro para adultos jóvenes.” No repetimos un podio de marcas. El trabajo del dinero es la pregunta útil: ¿reemplazar ingresos unos años, o una póliza pequeña para un funeral? El término y la vida entera no hacen el mismo trabajo.</p>
<p>Pida una cotización con su edad y su salud. No use la cifra de un artículo. Mejor Vida Seguros compara opciones: 402-440-5438. Sin promesa de aprobación.</p>
<p class="mt-4 mb-2 fw-semibold">¿Quiere conocer todos los detalles?</p>
<p class="mb-4"><a class="btn btn-primary" href="{ES3}">Leer el artículo completo</a></p>
<p class="story-meta mb-0"><strong>Fuente: <a href="https://www.limra.com/en/newsroom/news-releases/2025/adults-age-30-and-younger-overestimate-life-insurance-cost-by-1012-times/" rel="noopener" target="_blank">LIMRA — costo percibido del seguro de vida</a></strong></p>
</section>
<div class="border rounded p-4 mb-4 bg-white">
<p class="mb-1 fw-bold">Mejor Vida Seguros</p>
<p class="mb-2">Ayudamos a familias hispanas en EE. UU. a entender sus opciones de protección — con claridad y sin presión.</p>
<p class="mb-0"><a href="mailto:Julie@mejorvidainsurance.com">Julie@mejorvidainsurance.com</a></p>
</div>
<div class="bg-light border rounded p-3 small text-secondary mb-4">
<p class="mb-2"><strong>Aviso:</strong> Este resumen es sólo con fines educativos y no constituye asesoramiento legal, financiero ni una recomendación personalizada.</p>
<p class="mb-2">El contenido cubre temas para familias del 23 al 29 de agosto de 2026.</p>
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
<li><a href="#story1">Historia 1 — funeral y póliza de entierro</a></li>
<li><a href="#story2">Historia 2 — anualidad y cargo por rescate</a></li>
<li><a href="#story3">Historia 3 — costo del término para adultos jóvenes</a></li>
</ul>
<p class="small mb-0 mt-2"><a href="../guias-gastos-finales.html">Guías de gastos finales</a> <span class="text-secondary">— para familias.</span></p>
</section>
</aside>
</div>
</article>"""

DIGEST_EN = f"""<div class="blog-hero mv-news hero">
<div class="container">
<h1>Weekly U.S. life and final expense insurance update</h1>
<div class="blog-meta">
<i class="fas fa-calendar-alt me-2"></i>August 30, 2026 · News and guides from August 23–29, 2026 |
   <i class="fas fa-user ms-3 me-2"></i>Mejor Vida Insurance |
   <i class="fas fa-clock ms-3 me-2"></i>About 6 min read
  </div>
<p class="lead mb-3 fw-semibold">3 stories | Funeral costs | Annuity rules | Term life for younger adults</p>
<p class="lead mb-3">Each week we summarize insurance news so families can protect themselves with a clearer picture. This edition covers why funeral bills come due fast, what rules an annuity has when you need cash, and why so many younger adults think life insurance costs far more than it usually does.</p>
<picture>
<source type="image/webp" srcset="../../img/opt/{IMG}/hero-en.webp"/>
<img alt="Multi-generational Hispanic family walking together at golden hour — August 30, 2026" class="img-fluid rounded-3 shadow-sm" src="../../img/opt/{IMG}/hero-en.png" width="1200" height="800" loading="eager" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='../../img/opt/3-1-2026-Blog.png'"/>
</picture>
</div>
</div>
<article class="py-5 mv-news page-wrap">
<div class="news-grid">
<section class="article-col">
<div class="blog-content">
<section class="story-section" id="story1">
<h2>Story 1: Funeral bills come due fast. What does a small burial policy actually do?</h2>
<p class="story-meta"><strong>Source:</strong> National Funeral Directors Association | <strong>Published:</strong> August 30, 2026</p>
<picture>
<source type="image/webp" srcset="../../img/opt/{IMG}/story-1.webp"/>
<img alt="Hispanic grandmother and adult daughter reviewing a funeral home price list at the kitchen table" class="img-fluid rounded-3 mb-3" src="../../img/opt/{IMG}/story-1.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../../img/opt/3-1-2026-Blog.png'"/>
</picture>
<p>When someone dies, the funeral home does not wait months. Payment is often due in days. That bill can include basic services, a viewing or ceremony, a casket or an urn, and often cemetery costs on top.</p>
<p>The National Funeral Directors Association (NFDA) publishes national medians. In its 2023 General Price List Study — still the figures on its statistics page — a funeral with viewing and burial was $8,300. With viewing and cremation, $6,280. Those medians do not include every cemetery charge or monument. A real family’s total can be higher or lower.</p>
<p>A small life insurance policy is not a contract with the funeral home. It pays a cash benefit to the person you name. That person can use it for the funeral or other needs. A prepaid funeral is a different arrangement. Do not mix the two.</p>
<p>Industry “market size” forecasts circulated this week. We do not repeat vendor totals. What helps a family is the typical cost and who receives the benefit. Mejor Vida Insurance can explain options: 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">Want the full details?</p>
<p class="mb-4"><a class="btn btn-primary" href="{EN1}">Read the full article</a></p>
<p class="story-meta mb-0"><strong>Source: <a href="https://content.nfda.org/news/statistics" rel="noopener" target="_blank">NFDA statistics</a></strong></p>
</section>
<section class="story-section" id="story2">
<h2>Story 2: An annuity can look attractive. The contract still has rules.</h2>
<p class="story-meta"><strong>Source:</strong> National Association of Insurance Commissioners | <strong>Published:</strong> August 30, 2026</p>
<picture>
<source type="image/webp" srcset="../../img/opt/{IMG}/story-2.webp"/>
<img alt="Hispanic man in his fifties reading an annuity contract at a dining table" class="img-fluid rounded-3 mb-3" src="../../img/opt/{IMG}/story-2.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../../img/opt/3-1-2026-Blog.png'"/>
</picture>
<p>After a stretch when savings look strong, an annuity can sound easy: leave the money, use it later. That sentence fits an ad. A contract does not.</p>
<p>An annuity is an agreement with an insurance company, not a bank account. The National Association of Insurance Commissioners (NAIC) warns that if you take money out too early, there is often a surrender charge: a percentage of what you withdraw. That percentage often declines over a set number of years. Some contracts let you take a small amount each year — sometimes around 10 percent — without that charge. The exact limit is in your contract, not in a headline.</p>
<p>This matters if the money might be needed soon for a funeral. An annuity is usually a poor substitute when the only goal is a modest burial fund. Mejor Vida Insurance does not illustrate a rate. 402-440-5438.</p>
<p class="mt-4 mb-2 fw-semibold">Want the full details?</p>
<p class="mb-4"><a class="btn btn-primary" href="{EN2}">Read the full article</a></p>
<p class="story-meta mb-0"><strong>Source: <a href="https://content.naic.org/sites/default/files/consumer-what-to-know-before-buying-annuity.pdf" rel="noopener" target="_blank">NAIC — before you buy an annuity</a></strong></p>
</section>
<section class="story-section" id="story3">
<h2>Story 3: Many younger adults think life insurance costs 10 times more than it does</h2>
<p class="story-meta"><strong>Source:</strong> LIMRA and Life Happens | <strong>Published:</strong> August 30, 2026</p>
<picture>
<source type="image/webp" srcset="../../img/opt/{IMG}/story-3.webp"/>
<img alt="Hispanic young father holding a toddler in a sunlit living room" class="img-fluid rounded-3 mb-3" src="../../img/opt/{IMG}/story-3.png" width="800" height="450" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='../../img/opt/3-1-2026-Blog.png'"/>
</picture>
<p>Many younger adults skip life insurance because they think the premium will eat the budget. LIMRA and Life Happens, in the 2025 Insurance Barometer Study, found that healthy adults ages 18 to 30, asked to guess the cost of a $250,000 20-year term policy, overestimated the median cost by about 10 to 12 times. That is perception. It is not your premium.</p>
<p>Shopping sites published “best life insurance for young adults” lists this week. We do not repeat a brand podium. The useful question is the job for the money: replacing income for a set of years, or a small funeral policy? Term and whole life do different jobs.</p>
<p>Ask for a quote with your age and health. Do not use a number from an article. Mejor Vida Insurance compares options: 402-440-5438. No promise of approval.</p>
<p class="mt-4 mb-2 fw-semibold">Want the full details?</p>
<p class="mb-4"><a class="btn btn-primary" href="{EN3}">Read the full article</a></p>
<p class="story-meta mb-0"><strong>Source: <a href="https://www.limra.com/en/newsroom/news-releases/2025/adults-age-30-and-younger-overestimate-life-insurance-cost-by-1012-times/" rel="noopener" target="_blank">LIMRA — perceived cost of life insurance</a></strong></p>
</section>
<div class="border rounded p-4 mb-4 bg-white">
<p class="mb-1 fw-bold">Mejor Vida Insurance</p>
<p class="mb-2">We help Hispanic families in the U.S. understand their protection options — clearly and without pressure.</p>
<p class="mb-0"><a href="mailto:Julie@mejorvidainsurance.com">Julie@mejorvidainsurance.com</a></p>
</div>
<div class="bg-light border rounded p-3 small text-secondary mb-4">
<p class="mb-2"><strong>Notice:</strong> This digest is for education only and is not legal or financial advice or a personalized recommendation.</p>
<p class="mb-2">Topics cover August 23–29, 2026.</p>
<p class="mb-0 text-center fw-semibold">© 2026 Mejor Vida Insurance. All rights reserved.</p>
</div>
<div class="internal-links">
<h3><i class="fas fa-link me-2"></i>Related resources</h3>
<ul>
<li><a href="../../blog/que-es-seguro-gastos-finales.html">What is final expense insurance? (Spanish guide)</a></li>
<li><a href="../../blog/cuanto-cuesta-seguro-gastos-finales.html">What does final expense cost? (Spanish)</a></li>
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
<li><a href="#story1">Story 1 — funeral costs and a burial policy</a></li>
<li><a href="#story2">Story 2 — annuity surrender charges</a></li>
<li><a href="#story3">Story 3 — term cost for younger adults</a></li>
</ul>
<p class="small mb-0 mt-2"><a href="../../guias-gastos-finales.html">Final expense guides</a> <span class="text-secondary">— for families.</span></p>
</section>
</aside>
</div>
</article>"""

import sys

sys.path.insert(0, str(Path(__file__).parent))
from build_week_2026_08_30_articles import (  # noqa: E402
    ART_EN1,
    ART_EN2,
    ART_EN3,
    ART_ES1,
    ART_ES2,
    ART_ES3,
)


def gswap(html: str) -> str:
    html = html.replace("2026-08-23", "2026-08-30")
    html = html.replace("23 de agosto de 2026", "30 de agosto de 2026")
    html = html.replace("16 al 22 de agosto de 2026", "23 al 29 de agosto de 2026")
    html = html.replace("August 23, 2026", "August 30, 2026")
    html = html.replace("August 16–22, 2026", "August 23–29, 2026")
    html = html.replace("August 16-22, 2026", "August 23–29, 2026")
    html = html.replace("week of August 16–22", "week of August 23–29")
    html = html.replace("pruebas-geneticas-seguro-de-vida-2026-08-30.html", ES1)
    html = html.replace("anualidad-cuando-puede-usar-el-dinero-2026-08-30.html", ES2)
    html = html.replace("regla-funerales-ftc-derechos-familias-2026-08-30.html", ES3)
    html = html.replace("genetic-tests-life-insurance-2026-08-30.html", EN1)
    html = html.replace("annuity-when-you-can-use-the-money-2026-08-30.html", EN2)
    html = html.replace("ftc-funeral-rule-family-rights-2026-08-30.html", EN3)
    html = html.replace("weekly-insurance-update-2026-08-23", SLUG)
    return html


def patch(path: Path, body: str, replacements: list[tuple[str, str]], faq: str | None = None) -> None:
    html = gswap(path.read_text(encoding="utf-8"))
    html = splice_hero(html, body)
    for old, new in replacements:
        html = html.replace(old, new)
    if faq:
        html = replace_faq_json(html, faq)
    path.write_text(html, encoding="utf-8")
    print("wrote", path.relative_to(ROOT))


def main() -> None:
    patch(
        ROOT / "blog" / f"{SLUG}.html",
        DIGEST_ES,
        [
            (
                "Resumen del 30 de agosto de 2026: preguntas de salud al pedir vida, acceso a una anualidad, y derechos en la funeraria.",
                "Resumen del 30 de agosto de 2026: costos de funeral, reglas de una anualidad, y el costo del seguro a término para adultos jóvenes.",
            ),
            (
                "Tres historias para familias: salud en la solicitud, dinero de retiro y derechos en la funeraria.",
                "Tres historias para familias: costos de funeral, reglas de una anualidad y seguro a término para adultos jóvenes.",
            ),
            (
                "Tres historias para familias de la semana del 23 al 29 de agosto de 2026.",
                "Tres historias para familias de la semana del 23 al 29 de agosto de 2026.",
            ),
            (
                '"regla de funerales"',
                '"seguro a término"',
            ),
            (
                '"pruebas genéticas"',
                '"gastos de funeral"',
            ),
            (
                "Si se hizo una prueba genética, ¿eso importa al pedir un seguro de vida?",
                "El funeral se paga pronto. ¿Qué hace una póliza pequeña de entierro?",
            ),
            (
                "Por qué a veces no se puede sacar el dinero de una anualidad cuando se necesita",
                "Una anualidad puede verse atractiva. El contrato igual tiene reglas",
            ),
            (
                "Sus derechos al comprar un funeral — y por qué importan si piensa en un seguro",
                "Muchos adultos jóvenes creen que el seguro de vida cuesta 10 veces más",
            ),
        ],
    )
    patch(
        ROOT / "en" / "blog" / f"{SLUG}.html",
        DIGEST_EN,
        [
            (
                "August 30, 2026 digest: life insurance health questions, annuity access, and funeral-home rights.",
                "August 30, 2026 digest: funeral costs, annuity withdrawal rules, and term life for younger adults.",
            ),
            (
                "Three family stories: health questions on a life application, annuity access, and funeral-home rights.",
                "Three family stories: funeral costs, annuity rules, and term life for younger adults.",
            ),
            (
                "Three family stories from the week of August 23–29, 2026.",
                "Three family stories from the week of August 23–29, 2026.",
            ),
            ("funeral rights", "term life"),
            ("genetic test", "funeral cost"),
            (
                "If you had a genetic test, does that matter when you apply for life insurance?",
                "Funeral bills come due fast. What does a small burial policy actually do?",
            ),
            (
                "Why you sometimes cannot take money out of an annuity when you need it",
                "An annuity can look attractive. The contract still has rules",
            ),
            (
                "Your rights when you shop for a funeral — and why they matter if you are thinking about insurance",
                "Many younger adults think life insurance costs 10 times more than it does",
            ),
        ],
    )
    patch(
        ROOT / "blog" / ES1,
        ART_ES1,
        [
            (
                "Si se hizo una prueba genética, ¿eso importa al pedir un seguro de vida?",
                "El funeral se paga pronto. ¿Qué hace una póliza pequeña de entierro?",
            ),
            (
                "Al pedir un seguro de vida la compañía pregunta por su salud. Qué cubre una ley federal de salud y qué no cubre en vida.",
                "El funeral se cobra en días. Medianas NFDA, diferencia entre póliza pequeña y funeral prepagado, y qué puede hacer una familia.",
            ),
        ],
        FAQ_ES1,
    )
    patch(
        ROOT / "blog" / ES2,
        ART_ES2,
        [
            (
                "Por qué a veces no se puede sacar el dinero de una anualidad cuando se necesita",
                "Una anualidad puede verse atractiva. El contrato igual tiene reglas",
            ),
            (
                "Una anualidad es un contrato de retiro. Si hay que esperar para usar el dinero, esa espera manda. No es un seguro de funeral.",
                "Si saca el dinero de una anualidad demasiado pronto, puede haber un cargo por rescate. NAIC explica las reglas. No es un fondo de funeral.",
            ),
        ],
        FAQ_ES2,
    )
    patch(
        ROOT / "blog" / ES3,
        ART_ES3,
        [
            (
                "Sus derechos al comprar un funeral — y por qué importan si piensa en un seguro",
                "Muchos adultos jóvenes creen que el seguro de vida cuesta 10 veces más",
            ),
            (
                "La funeraria debe mostrar precios. Esas reglas ayudan a gastar bien el dinero de una póliza pequeña.",
                "LIMRA: muchos de 18 a 30 años sobreestiman el costo de un término. Término frente a vida entera, sin ranking de compañías.",
            ),
        ],
        FAQ_ES3,
    )
    patch(
        ROOT / "en" / "blog" / EN1,
        ART_EN1,
        [
            (
                "If you had a genetic test, does that matter when you apply for life insurance?",
                "Funeral bills come due fast. What does a small burial policy actually do?",
            ),
            (
                "When you apply for life insurance the company asks about your health. A federal health-privacy law covers health insurance — not life insurance.",
                "Funeral bills are due in days. NFDA medians, the difference between a small policy and a prepaid funeral, and what a family can do.",
            ),
        ],
        FAQ_EN1,
    )
    patch(
        ROOT / "en" / "blog" / EN2,
        ART_EN2,
        [
            (
                "Why you sometimes cannot take money out of an annuity when you need it",
                "An annuity can look attractive. The contract still has rules",
            ),
            (
                "An annuity is a retirement contract. If you have to wait to use the money, that wait controls. It is not funeral insurance.",
                "If you take money out of an annuity too early, there may be a surrender charge. NAIC explains the rules. It is not a burial fund.",
            ),
        ],
        FAQ_EN2,
    )
    patch(
        ROOT / "en" / "blog" / EN3,
        ART_EN3,
        [
            (
                "Your rights when you shop for a funeral — and why they matter if you are thinking about insurance",
                "Many younger adults think life insurance costs 10 times more than it does",
            ),
            (
                "Funeral homes must show prices. Those rules help a family spend a small life policy well.",
                "LIMRA: many adults 18–30 overestimate term cost. Term versus whole life, without a company ranking.",
            ),
        ],
        FAQ_EN3,
    )


if __name__ == "__main__":
    main()
