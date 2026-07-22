#!/usr/bin/env python3
"""Render ES/EN life insurance cost pages with illustrative preferred term charts."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RATES = json.loads((ROOT / "js/life-insurance-cost-rates.json").read_text(encoding="utf-8"))
RATES_JS = json.dumps(RATES, separators=(",", ":"))


def extract_header_footer(sample: Path) -> tuple[str, str]:
    text = sample.read_text(encoding="utf-8")
    header = re.search(r"(<header class=\"sticky-top[\s\S]*?</header>)", text)
    footer = re.search(r"(<footer[\s\S]*?</footer>)", text)
    if not header or not footer:
        raise SystemExit(f"Could not extract header/footer from {sample}")
    return header.group(1), footer.group(1)


def face_tabs(faces: list[int]) -> str:
    bits = []
    for i, face in enumerate(faces):
        label = f"${face:,}"
        cls = "lic-face-tab is-active" if i == 0 else "lic-face-tab"
        selected = "true" if i == 0 else "false"
        bits.append(
            f'<button type="button" class="{cls}" data-lic-face="{face}" '
            f'role="tab" aria-selected="{selected}">{label}</button>'
        )
    return "\n".join(bits)


def term_section(term: int, title: str, lead: str, lang: str, quote_href: str) -> str:
    age_h = "Edad" if lang == "es" else "Age"
    fem = "Mujer" if lang == "es" else "Female"
    male = "Hombre" if lang == "es" else "Male"
    return f"""<section class="lic-section" id="term-{term}" data-lic-product="term" data-lic-term="{term}" data-lic-quote-href="{quote_href}">
<h2>{title}</h2>
<p>{lead}</p>
<div class="lic-face-tabs" role="tablist">
{face_tabs(RATES["faces"])}
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">{age_h}</th><th scope="col">{fem}</th><th scope="col">{male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</section>"""


def whole_life_section(lang: str, quote_href: str) -> str:
    age_h = "Edad" if lang == "es" else "Age"
    fem = "Mujer" if lang == "es" else "Female"
    male = "Hombre" if lang == "es" else "Male"
    wl = RATES.get("whole_life") or {}
    faces = wl.get("faces") or [50000, 100000, 250000, 500000]
    if lang == "es":
        title = "Costo promedio del seguro de vida entera"
        lead = (
            "Primas mensuales ilustrativas (preferred / no fumador) por edad para montos de $50,000 a $500,000 "
            "(edades de muestra 20–85)."
        )
    else:
        title = "Average cost of whole life insurance"
        lead = (
            "Illustrative monthly premiums (preferred / non-tobacco) by age for coverage amounts from $50,000 to $500,000 "
            "(sample ages 20–85)."
        )
    return f"""<section class="lic-section" id="whole-life" data-lic-product="whole" data-lic-quote-href="{quote_href}">
<h2>{title}</h2>
<p>{lead}</p>
<div class="lic-face-tabs" role="tablist">
{face_tabs(faces)}
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">{age_h}</th><th scope="col">{fem}</th><th scope="col">{male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</section>"""


def final_expense_section(lang: str, quote_href: str, fe_p: str) -> str:
    age_h = "Edad" if lang == "es" else "Age"
    fem = "Mujer" if lang == "es" else "Female"
    male = "Hombre" if lang == "es" else "Male"
    fe = RATES.get("final_expense") or {}
    faces = fe.get("faces") or [5000, 10000, 25000, 50000]
    if lang == "es":
        title = "Costo promedio del seguro de gastos finales"
        lead = (
            "Primas mensuales ilustrativas (no fumador) por edad para montos de $5,000 a $50,000 "
            "(edades de muestra según el cuadro, hasta 85–90)."
        )
    else:
        title = "Average cost of final expense insurance"
        lead = (
            "Illustrative monthly premiums (non-tobacco) by age for coverage amounts from $5,000 to $50,000 "
            "(sample ages per chart, through 85–90)."
        )
    return f"""<section class="lic-section" id="final-expense" data-lic-product="fe" data-lic-quote-href="{quote_href}">
<h2>{title}</h2>
<p>{lead}</p>
<div class="lic-face-tabs" role="tablist">
{face_tabs(faces)}
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">{age_h}</th><th scope="col">{fem}</th><th scope="col">{male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
<p>{fe_p}</p>
</section>"""


def guaranteed_section(lang: str, quote_href: str) -> str:
    age_h = "Edad" if lang == "es" else "Age"
    fem = "Mujer" if lang == "es" else "Female"
    male = "Hombre" if lang == "es" else "Male"
    gi = RATES.get("guaranteed") or {}
    faces = gi.get("faces") or [10000, 15000, 20000, 25000]
    if lang == "es":
        title = "Costo promedio del seguro de aceptación garantizada"
        lead = (
            "Primas mensuales ilustrativas por edad para montos de $10,000 a $25,000 "
            "(aceptación garantizada / banda graduada; edades de muestra 45–85)."
        )
    else:
        title = "Average cost of guaranteed acceptance life insurance"
        lead = (
            "Illustrative monthly premiums by age for coverage amounts from $10,000 to $25,000 "
            "(guaranteed acceptance / graded band; sample ages 45–85)."
        )
    return f"""<section class="lic-section" id="guaranteed" data-lic-product="gi" data-lic-quote-href="{quote_href}">
<h2>{title}</h2>
<p>{lead}</p>
<div class="lic-face-tabs" role="tablist">
{face_tabs(faces)}
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">{age_h}</th><th scope="col">{fem}</th><th scope="col">{male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</section>"""


def universal_life_section(lang: str, quote_href: str) -> str:
    age_h = "Edad" if lang == "es" else "Age"
    fem = "Mujer" if lang == "es" else "Female"
    male = "Hombre" if lang == "es" else "Male"
    ul = RATES.get("universal_life") or {}
    faces = ul.get("faces") or [50000, 100000, 250000, 500000]
    if lang == "es":
        title = "Costo promedio del seguro de vida universal"
        lead = (
            "Primas mensuales ilustrativas (preferred no fumador) por edad para montos de $50,000 a $500,000. "
            "La vida universal e indexada (IUL) también depende del financiamiento, cargos y topes — Julie puede preparar una ilustración real."
        )
    else:
        title = "Average cost of universal life insurance"
        lead = (
            "Illustrative monthly premiums (preferred non-tobacco) by age for coverage amounts from $50,000 to $500,000. "
            "Universal and indexed universal life (IUL) also depend on funding, charges, and caps — Julie can run a real carrier illustration."
        )
    return f"""<section class="lic-section" id="universal-life" data-lic-product="ul" data-lic-quote-href="{quote_href}">
<h2>{title}</h2>
<p>{lead}</p>
<div class="lic-face-tabs" role="tablist">
{face_tabs(faces)}
</div>
<div class="lic-rate-wrap">
<table class="lic-rate-table">
<thead><tr><th scope="col">{age_h}</th><th scope="col">{fem}</th><th scope="col">{male}</th></tr></thead>
<tbody data-lic-tbody></tbody>
</table>
</div>
<p class="lic-rate-note" data-lic-note></p>
</section>"""


def children_section(lang: str, quote_href: str) -> str:
    # Industry sample children’s whole life (unisex), ~+5% vs public sample figures, rounded.
    # Bands: 0–4, 5–9, 10–14, 15–17 × $10k / $25k / $50k
    rates = [
        ("0–4", 5, 11, 20),
        ("5–9", 6, 13, 24),
        ("10–14", 6, 15, 28),
        ("15–17", 8, 19, 36),
    ]
    rows = "".join(
        f"<tr><td>{band}</td><td>${a10:,}</td><td>${a25:,}</td><td>${a50:,}</td></tr>"
        for band, a10, a25, a50 in rates
    )
    if lang == "es":
        title = "Costo promedio del seguro de vida infantil"
        lead = (
            "Primas mensuales ilustrativas (unisex) por banda de edad para $10,000, $25,000 y $50,000 "
            "(seguro de vida entera infantil; edades típicas desde 14 días hasta 17 años)."
        )
        note = (
            "Primas mensuales ilustrativas (redondeadas). Muestras educativas (~+5% vs cuadros públicos); "
            "no es cotización de compañía. Las cotizaciones reales de Mejor Vida dependen de la compañía, la edad exacta y el monto."
        )
        age_h, c10, c25, c50 = "Edad", "$10,000", "$25,000", "$50,000"
    else:
        title = "Average cost of children’s life insurance"
        lead = (
            "Illustrative monthly premiums (unisex) by age band for $10,000, $25,000, and $50,000 "
            "(children’s whole life; typical issue ages from 14 days through 17)."
        )
        note = (
            "Illustrative monthly premiums (rounded). Educational samples (~+5% vs public charts); "
            "not a carrier quote. Actual Mejor Vida prices depend on carrier, exact age, and face amount."
        )
        age_h, c10, c25, c50 = "Age", "$10,000", "$25,000", "$50,000"
    return f"""<section class="lic-section" id="children">
<h2>{title}</h2>
<p>{lead}</p>
<div class="lic-rate-wrap">
<table class="lic-rate-table lic-rate-table--faces">
<thead><tr><th scope="col">{age_h}</th><th scope="col">{c10}</th><th scope="col">{c25}</th><th scope="col">{c50}</th></tr></thead>
<tbody>{rows}</tbody>
</table>
</div>
<p class="lic-rate-note">{note}</p>
</section>"""


def guide_sections(lang: str, quote_href: str, products_href: str, est_href: str, prefix: str) -> str:
    faq_meta = faq_and_meta_sections(lang, quote_href, prefix)
    if lang == "es":
        return f"""<section class="lic-section lic-guide" id="factores-costo">
<h2>Factores que determinan el costo del seguro de vida</h2>
<p>En términos generales, el precio refleja la esperanza de vida y el riesgo que asume la aseguradora. Según el producto y la compañía, pueden aplicar algunos o todos estos factores:</p>
<aside class="lic-callout" aria-label="Importante">
<strong>Recuerde</strong>
<p>Estos factores <em>no</em> suelen usarse para fijar la prima: raza, etnia, orientación sexual, estado civil, puntaje de crédito o nivel educativo.</p>
</aside>
<ul class="lic-factor-list">
<li><strong>Sexo.</strong> En la mayoría de los estados, los hombres pagan más porque, en promedio, viven menos años que las mujeres.</li>
<li><strong>Edad.</strong> Cotizar más joven suele ser más económico; las primas suben con la edad de emisión.</li>
<li><strong>Tipo de póliza.</strong> La temporal suele ser la más asequible por dólar de cobertura; la vida entera y la universal cuestan más porque son permanentes o flexibles.</li>
<li><strong>Plazo (solo temporal).</strong> Plazos típicos: 10, 15, 20, 25 o 30 años. A mayor plazo, mayor prima.</li>
<li><strong>Monto de cobertura.</strong> Más beneficio por fallecimiento implica mayor prima.</li>
<li><strong>Tipo de suscripción.</strong> Completa (examen) suele ser más barata; emisión simplificada cuesta más; aceptación garantizada es la más cara porque la aseguradora conoce poco o nada de su salud.</li>
<li><strong>Historial de salud y estilo de vida.</strong> Condiciones, tabaco, aficiones de riesgo, historial de manejo y otros hábitos pueden subir el precio o limitar opciones.</li>
<li><strong>Estado y forma de pago.</strong> El estado define qué productos hay disponibles. El pago automático bancario o anual suele evitar recargos de facturación.</li>
</ul>
</section>

<section class="lic-section lic-guide" id="cuanto-necesita">
<h2>¿Cuánto seguro de vida necesita?</h2>
<p>Pregúntese: si falleciera hoy, ¿para qué usaría la familia el beneficio? Asígnele un valor a cada necesidad (gastos finales, reemplazo de ingreso, hipoteca, deudas, educación).</p>
<p>Una guía práctica es la fórmula DIME: Deuda + Ingreso (años que quiere reemplazar) + Hipoteca + Educación. También puede usar nuestra <a href="{est_href}">calculadora de gastos finales</a> o <a href="{quote_href}">cotizar</a> con Julie, que compara opciones de <a href="{products_href}">tipos de seguro de vida</a>.</p>
</section>

<section class="lic-section lic-guide" id="consejos-ahorro">
<h2>Consejos para encontrar tarifas más asequibles</h2>
<ul class="lic-factor-list">
<li><strong>Haga un examen médico si califica</strong> — la suscripción completa suele bajar el precio frente a la aceptación garantizada.</li>
<li><strong>Use débito automático bancario</strong> — muchas compañías cobran menos que con tarjeta o factura por correo.</li>
<li><strong>Pague semestral o anual</strong> cuando haya descuento modal.</li>
<li><strong>Compare varias compañías</strong> — cada una califica salud y edad distinto.</li>
<li><strong>Trabaje con un agente independiente</strong> (como Mejor Vida) que cotice más de un proveedor.</li>
<li><strong>Considere aseguradoras sólidas aunque no sean “de marca”</strong> — hay opciones con buena calificación fuera de los nombres más famosos.</li>
<li><strong>No espere</strong> — posponer la compra suele subir la prima con la edad.</li>
<li><strong>Deje de fumar</strong> y mejore presión, colesterol, A1C y peso cuando pueda antes de cotizar.</li>
<li><strong>Elija vida temporal</strong> si necesita cobertura asequible por un plazo fijo — suele ser lo más económico por dólar.</li>
</ul>
<p class="lic-rate-note"><a href="{quote_href}">Cotizar ahora</a> · <a href="{products_href}">Ver tipos de seguro</a></p>
</section>
{faq_meta}"""

    return f"""<section class="lic-section lic-guide" id="cost-factors">
<h2>Factors that determine the cost of life insurance</h2>
<p>At a high level, price reflects life expectancy and the risk the insurer takes. Depending on the product and company, some or all of these factors may apply:</p>
<aside class="lic-callout" aria-label="Important">
<strong>Don’t forget</strong>
<p>These factors typically <em>cannot</em> be used to set your premium: race, ethnicity, sexual orientation, marital status, credit score, or education level.</p>
</aside>
<ul class="lic-factor-list">
<li><strong>Gender.</strong> In most states, men pay more because they live fewer years on average than women.</li>
<li><strong>Age.</strong> Quoting younger is usually cheaper; issue-age premiums rise as you get older.</li>
<li><strong>Policy type.</strong> Term is usually the most affordable per dollar of coverage; whole life and universal cost more because they are permanent or flexible.</li>
<li><strong>Term length (term only).</strong> Common terms: 10, 15, 20, 25, or 30 years. Longer terms cost more.</li>
<li><strong>Coverage amount.</strong> A larger death benefit means a higher premium.</li>
<li><strong>Underwriting type.</strong> Fully underwritten (exam) is often cheapest; simplified issue costs more; guaranteed acceptance is usually the most expensive because the insurer knows little about your health.</li>
<li><strong>Health and lifestyle.</strong> Conditions, tobacco, risky hobbies, driving history, and related habits can raise price or limit options.</li>
<li><strong>State and payment method.</strong> Your state controls which products are available. Bank draft or annual pay often avoids billing surcharges.</li>
</ul>
</section>

<section class="lic-section lic-guide" id="how-much-coverage">
<h2>How much life insurance do you need?</h2>
<p>Ask: if you died today, what would the benefit pay for? Assign a dollar value to each need (final expenses, income replacement, mortgage, debts, education).</p>
<p>A practical guide is the DIME formula: Debt + Income (years you want to replace) + Mortgage + Education. You can also use our <a href="{est_href}">final expense estimator</a> or <a href="{quote_href}">get a quote</a> with Julie, who compares <a href="{products_href}">life insurance product types</a>.</p>
</section>

<section class="lic-section lic-guide" id="affordable-tips">
<h2>Tips for finding more affordable life insurance rates</h2>
<ul class="lic-factor-list">
<li><strong>Take a medical exam when you qualify</strong> — fuller underwriting often means a lower rate than guaranteed issue.</li>
<li><strong>Use bank autopay</strong> — many carriers price monthly draft lower than credit-card or direct bill.</li>
<li><strong>Pay semi-annually or annually</strong> when a modal discount applies.</li>
<li><strong>Shop multiple carriers</strong> — each prices health and age differently.</li>
<li><strong>Work with an independent agent</strong> (like Mejor Vida) who can compare more than one provider.</li>
<li><strong>Stay open to strong regional carriers</strong> — household names are not the only A-rated options.</li>
<li><strong>Don’t wait</strong> — delaying usually raises the premium as you age.</li>
<li><strong>Quit smoking</strong> and improve blood pressure, cholesterol, A1C, and weight when you can before you apply.</li>
<li><strong>Buy term</strong> when you need affordable coverage for a set period — it is usually the lowest cost per dollar.</li>
</ul>
<p class="lic-rate-note"><a href="{quote_href}">Get a quote</a> · <a href="{products_href}">See product types</a></p>
</section>
{faq_meta}"""


def faq_and_meta_sections(lang: str, quote_href: str, prefix: str) -> str:
    about = f"{prefix}about-julie.html" if lang == "es" else "about-julie.html"
    contact = f"{prefix}contact.html" if lang == "es" else "contact.html"
    disclosures = (
        f"{prefix}divulgaciones-editoriales.html"
        if lang == "es"
        else "../divulgaciones-editoriales.html"
    )

    if lang == "es":
        faqs = [
            (
                "¿Por qué preguntan el estado al cotizar seguro de vida?",
                "Porque la disponibilidad de productos y formularios depende del estado donde vive y firma la solicitud. Un plan puede existir en Nebraska y no en otro estado.",
            ),
            (
                "¿Por qué las mujeres pagan distinto que los hombres?",
                "En la mayoría de los estados, las mujeres pagan menos porque, en promedio, viven más años. Montana exige tarifas unisex en algunos productos, lo que puede cambiar ese patrón.",
            ),
            (
                "¿Es buena una tarifa de $9.95 al mes?",
                "Solo si el monto de cobertura y las condiciones valen ese precio. A veces las tarifas muy bajas son “gancho” con beneficios mínimos. Compare el beneficio por fallecimiento, esperas y exclusiones — no solo la prima.",
            ),
            (
                "¿Cuesta más el seguro sin examen médico?",
                "A menudo sí, porque la aseguradora tiene menos información. Aun así, la emisión simplificada se ha acercado en precio a muchas opciones con examen. Julie puede comparar ambas rutas.",
            ),
            (
                "¿La vida entera cuesta más que la temporal?",
                "Sí. La vida entera es permanente y suele acumular valor en efectivo; la temporal cubre un plazo fijo y normalmente cuesta menos por dólar de cobertura.",
            ),
            (
                "¿El uso de marihuana sube la prima?",
                "Depende de la compañía y del producto. Algunas tratan ciertos usos como tabaco; otras no. Hay que revelarlo con honestidad en la solicitud para que la cotización sea válida.",
            ),
        ]
        faq_html = "".join(
            f"<details{' open' if i == 0 else ''}><summary>{q}</summary><p>{a}</p></details>"
            for i, (q, a) in enumerate(faqs)
        )
        return f"""<section class="lic-section lic-faq" id="faq">
<h2>Preguntas frecuentes</h2>
{faq_html}
</section>

<section class="lic-section lic-meta" id="fuentes">
<div class="lic-meta-tabs" role="tablist">
<button type="button" class="lic-meta-tab is-active" data-lic-meta="author" role="tab" aria-selected="true">Autora</button>
<button type="button" class="lic-meta-tab" data-lic-meta="sources" role="tab" aria-selected="false">Fuentes</button>
<button type="button" class="lic-meta-tab" data-lic-meta="updates" role="tab" aria-selected="false">Actualizaciones</button>
</div>
<div class="lic-meta-panel is-active" data-lic-meta-panel="author">
<p><strong>Julie</strong> — agente de seguros con licencia en Mejor Vida Insurance. Esta página resume rangos ilustrativos de compañías designadas y orientación educativa; no es una oferta vinculante.</p>
<p><a href="{about}">Conozca a Julie</a> · <a href="{contact}">Contacto</a> · <a href="{disclosures}">Divulgaciones editoriales</a></p>
</div>
<div class="lic-meta-panel" data-lic-meta-panel="sources" hidden>
<ol class="lic-sources">
<li>Tablas temporales: primas ilustrativas preferred no fumador (muestras del sector, redondeadas).</li>
<li>Gastos finales / graduado: rangos de cotización Mutual of Omaha + American Amicable (Nebraska).</li>
<li>Vida entera ilustrativa: muestras educativas de mercado (preferred / no fumador), edades 20–85.</li>
<li>Gastos finales ilustrativos: muestras educativas de mercado (no fumador).</li>
<li>Esperanza de vida (contexto educativo): <a href="https://www.cdc.gov/nchs/fastats/life-expectancy.htm" rel="noopener noreferrer" target="_blank">CDC NCHS</a>.</li>
<li>Necesidad de cobertura (DIME): prácticas de la industria; Julie adapta el análisis a su situación.</li>
</ol>
</div>
<div class="lic-meta-panel" data-lic-meta-panel="updates" hidden>
<ul class="lic-updates">
<li><strong>Julio 2026</strong> — Tablas temporales alineadas a rangos preferred ilustrativos (edades 20–80) y página de costos bilingüe.</li>
</ul>
</div>
</section>"""

    faqs = [
        (
            "Why do life insurance companies ask for your state when getting quotes?",
            "Product availability and forms depend on the state where you live and sign the application. A plan may be offered in Nebraska but not in another state.",
        ),
        (
            "Why do women pay differently than men for life insurance?",
            "In most states, women pay less because they typically live longer. Montana requires unisex rates on some products, which can change that pattern.",
        ),
        (
            "Is $9.95 a good rate for life insurance?",
            "Only if the coverage amount and terms are worthwhile. Very low teaser premiums sometimes buy minimal benefits. Compare the death benefit, waiting periods, and exclusions — not just the premium.",
        ),
        (
            "Does life insurance cost more if you don’t take a medical exam?",
            "Often yes, because the insurer has less information. Simplified issue has narrowed the gap versus exam-based policies. Julie can compare both paths.",
        ),
        (
            "Does whole life insurance cost more than term life insurance?",
            "Yes. Whole life is permanent and often builds cash value; term covers a set period and usually costs less per dollar of coverage.",
        ),
        (
            "Will life insurance cost more if I use marijuana?",
            "It depends on the carrier and product. Some treat certain use like tobacco; others do not. Disclose honestly on the application so the quote is valid.",
        ),
    ]
    faq_html = "".join(
        f"<details{' open' if i == 0 else ''}><summary>{q}</summary><p>{a}</p></details>"
        for i, (q, a) in enumerate(faqs)
    )
    return f"""<section class="lic-section lic-faq" id="faq">
<h2>Frequently asked questions</h2>
{faq_html}
</section>

<section class="lic-section lic-meta" id="sources">
<div class="lic-meta-tabs" role="tablist">
<button type="button" class="lic-meta-tab is-active" data-lic-meta="author" role="tab" aria-selected="true">Author</button>
<button type="button" class="lic-meta-tab" data-lic-meta="sources" role="tab" aria-selected="false">Sources cited</button>
<button type="button" class="lic-meta-tab" data-lic-meta="updates" role="tab" aria-selected="false">Article history</button>
</div>
<div class="lic-meta-panel is-active" data-lic-meta-panel="author">
<p><strong>Julie</strong> — licensed insurance agent at Mejor Vida Insurance. This page summarizes illustrative ranges from appointed carriers plus educational guidance; it is not a binding offer.</p>
<p><a href="{about}">About Julie</a> · <a href="{contact}">Contact</a> · <a href="{disclosures}">Editorial disclosures</a></p>
</div>
<div class="lic-meta-panel" data-lic-meta-panel="sources" hidden>
<ol class="lic-sources">
<li>Term tables: illustrative preferred non-tobacco industry sample rates (rounded).</li>
<li>Final expense / graded bands: Mutual of Omaha + American Amicable Nebraska quote ranges.</li>
<li>Illustrative whole life: educational market samples (preferred / non-tobacco), ages 20–85.</li>
<li>Illustrative final expense: educational market samples (non-tobacco).</li>
<li>Life expectancy (educational context): <a href="https://www.cdc.gov/nchs/fastats/life-expectancy.htm" rel="noopener noreferrer" target="_blank">CDC NCHS</a>.</li>
<li>Coverage need (DIME): industry practice; Julie tailors the analysis to your situation.</li>
</ol>
</div>
<div class="lic-meta-panel" data-lic-meta-panel="updates" hidden>
<ul class="lic-updates">
<li><strong>July 2026</strong> — Term charts aligned to illustrative preferred ranges (ages 20–80) and bilingual cost hub published.</li>
</ul>
</div>
</section>"""


def build(lang: str, header: str, footer: str) -> str:
    is_es = lang == "es"
    prefix = "" if is_es else "../"
    canonical = (
        "https://www.mejorvidainsurance.com/costo-seguro-vida.html"
        if is_es
        else "https://www.mejorvidainsurance.com/en/life-insurance-cost.html"
    )
    title = (
        "Costo del seguro de vida en 2026 (por edad y tipo) | Mejor Vida"
        if is_es
        else "Life Insurance Cost In 2026 (By Age & Policy Type) | Mejor Vida"
    )
    desc = (
        "Primas ilustrativas de vida temporal, vida entera y gastos finales por edad y monto. Cotice con Julie."
        if is_es
        else "Illustrative term, whole life, and final expense premiums by age and face amount. Get a quote with Julie."
    )
    crumb = (
        f'<a href="{prefix}index.html">Inicio</a> › Costo del seguro de vida'
        if is_es
        else '<a href="index.html">Home</a> › Life insurance cost'
    )
    h1 = (
        "Costo promedio del seguro de vida en 2026"
        if is_es
        else "Average Life Insurance Cost In 2026"
    )
    lead = (
        "El precio depende de la edad, el sexo, la salud, el uso de tabaco, el plazo y el monto. "
        "Las tablas muestran primas mensuales ilustrativas en clase preferred no fumador "
        "(muestras educativas redondeadas). Las cotizaciones reales de Mejor Vida usan compañías designadas y varían con la suscripción."
        if is_es
        else "Price depends on age, sex, health, tobacco use, term length, and face amount. "
        "The tables show illustrative preferred non-tobacco monthly premiums "
        "(rounded educational samples). Actual Mejor Vida quotes use appointed carriers and vary with underwriting."
    )
    take_h = "Puntos clave" if is_es else "Key takeaways"
    takes = (
        [
            "La vida temporal suele ser la opción más económica por dólar de cobertura para necesidades de 10–30 años.",
            "Los gastos finales (vida entera simplificada) suelen cotizarse entre unos $2,000 y $50,000, según compañía y edad.",
            "A mayor edad o monto, mayor prima; el tabaco y la salud también cambian el precio.",
            "Estas cifras son orientativas. Una cotización personalizada compara varias aseguradoras.",
        ]
        if is_es
        else [
            "Term life is usually the most affordable coverage per dollar for 10–30 year needs.",
            "Final expense (simplified whole life) is typically quoted from about $2,000 to $50,000, depending on carrier and age.",
            "Older ages and higher face amounts cost more; tobacco use and health also change the price.",
            "These figures are illustrative. A personalized quote compares multiple carriers.",
        ]
    )
    take_html = "".join(f"<li>{t}</li>" for t in takes)

    products_href = f"{prefix}tipos-seguro-vida.html" if is_es else "life-insurance-products.html"
    quote_href = f"{prefix}quote.html" if is_es else "quote.html"
    est_href = (
        f"{prefix}final-expense-estimator.html"
        if is_es
        else "final-expense-estimator.html"
    )
    fe_p = (
        "Los productos de gastos finales varían por compañía. En nuestro libro: Mutual of Omaha Living Promise "
        "suele ofrecer $2,000–$50,000 (hasta edad 85 en nivelado); American Amicable Senior Choice hasta $50,000 (50–85); "
        "Assurity desde $10,000; Corebridge GI aproximadamente $5,000–$25,000 (50–80)."
        if is_es
        else "Final expense products vary by carrier. In our book: Mutual of Omaha Living Promise typically "
        "offers $2,000–$50,000 (to age 85 on level); American Amicable Senior Choice up to $50,000 (ages 50–85); "
        "Assurity from $10,000; Corebridge GI roughly $5,000–$25,000 (ages 50–80)."
    )

    if is_es:
        t10 = term_section(
            10,
            "Tarifas de vida temporal a 10 años",
            "Primas mensuales ilustrativas (preferred no fumador) para una póliza temporal de 10 años (edades de muestra 20–80). Las cotizaciones reales de Mejor Vida dependen de la compañía y la suscripción.",
            lang,
            quote_href,
        )
        t20 = term_section(
            20,
            "Tarifas de vida temporal a 20 años",
            "Primas mensuales ilustrativas (preferred no fumador) para una póliza temporal de 20 años (edades de muestra 20–65).",
            lang,
            quote_href,
        )
        t30 = term_section(
            30,
            "Tarifas de vida temporal a 30 años",
            "Primas mensuales ilustrativas (preferred no fumador) para una póliza temporal de 30 años (edades de muestra 20–55).",
            lang,
            quote_href,
        )
    else:
        t10 = term_section(
            10,
            "10-year term rates",
            "Illustrative monthly premiums (preferred non-tobacco) for a 10-year term policy (sample ages 20–80). Actual Mejor Vida quotes depend on carrier and underwriting.",
            lang,
            quote_href,
        )
        t20 = term_section(
            20,
            "20-year term rates",
            "Illustrative monthly premiums (preferred non-tobacco) for a 20-year term policy (sample ages 20–65).",
            lang,
            quote_href,
        )
        t30 = term_section(
            30,
            "30-year term rates",
            "Illustrative monthly premiums (preferred non-tobacco) for a 30-year term policy (sample ages 20–55).",
            lang,
            quote_href,
        )

    lang_attr = "es" if is_es else "en"
    lang_class = "lang-es" if is_es else "lang-en"

    return f"""<!DOCTYPE html>
<html class="{lang_class}" lang="{lang_attr}">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-K921EG6JWG"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){{dataLayer.push(arguments);}}
  gtag('js', new Date());
  gtag('config', 'G-K921EG6JWG');
</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>{title}</title>
<meta content="{desc}" name="description"/>
<meta content="{"index, follow" if is_es else "noindex, follow"}" name="robots"/>
<link href="{canonical}" rel="canonical"/>
{'''<link href="https://www.mejorvidainsurance.com/costo-seguro-vida.html" hreflang="es" rel="alternate"/>
<link href="https://www.mejorvidainsurance.com/costo-seguro-vida.html" hreflang="x-default" rel="alternate"/>
''' if is_es else ""}<link href="{prefix}favicon.ico" rel="icon" type="image/x-icon"/>
<link href="{prefix}bootstrap/css/bootstrap.min.css" rel="stylesheet"/>
<link href="{prefix}css/quote-flow-shared.css?v=20260721-lic-cost" rel="stylesheet"/>
<link href="{prefix}css/site-footer.css?v=20260721-lip-page" rel="stylesheet"/>
<link href="{prefix}css/life-insurance-cost.css?v=20260721-lic-full" rel="stylesheet"/>
<link href="{prefix}css/mvi-assistant-widget.css?v=20260721-chat-z" rel="stylesheet"/>
<link href="{prefix}css/fontawesome-mvi.min.css" rel="stylesheet"/>
<style>body {{ font-family: Inter, system-ui, -apple-system, sans-serif; }}</style>
</head>
<body class="lic-page">
{header}

<main>
<section class="lic-hero">
<div class="lic-hero-media" aria-hidden="true">
<picture>
<source srcset="{prefix}img/opt/lip-hero-sunrise.webp" type="image/webp"/>
<img src="{prefix}img/opt/lip-hero-sunrise.jpg" alt="" width="1024" height="682" decoding="async" fetchpriority="high"/>
</picture>
</div>
<div class="container">
<div class="lic-hero-copy">
<p class="lic-breadcrumb">{crumb}</p>
<h1>{h1}</h1>
<p class="lic-hero-lead">{lead}</p>
</div>
</div>
</section>

<div class="lic-layout">
<div class="lic-main">
<div class="lic-takeaways">
<h2>{take_h}</h2>
<ul>{take_html}</ul>
</div>

{t10}
{t20}
{t30}

{whole_life_section(lang, quote_href)}

{final_expense_section(lang, quote_href, fe_p)}

{guaranteed_section(lang, quote_href)}

{universal_life_section(lang, quote_href)}

{children_section(lang, quote_href)}

{guide_sections(lang, quote_href, products_href, est_href, prefix)}
</div>
</div>
</main>

{footer}

<script defer src="{prefix}bootstrap/js/bootstrap.bundle.min.js"></script>
<script src="{prefix}js/mvi-funnel-track.js?v=20260702e"></script>
<div data-api-url="/api/website-chat" id="mvi-assistant-root"></div>
<script defer src="{prefix}js/mvi-nav-questions.js"></script>
<script defer src="{prefix}js/website-assistant-widget.js?v=20260721-chat-z"></script>
<script>window.MVI_LIC_RATES = {RATES_JS};</script>
<script defer src="{prefix}js/life-insurance-cost.js?v=20260721-gi-ul-fill"></script>
<script>document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());</script>
</body>
</html>
"""


def main() -> None:
    es_header, es_footer = extract_header_footer(ROOT / "tipos-seguro-vida.html")
    en_header, en_footer = extract_header_footer(ROOT / "en/life-insurance-products.html")
    es_path = ROOT / "costo-seguro-vida.html"
    en_path = ROOT / "en/life-insurance-cost.html"
    es_path.write_text(build("es", es_header, es_footer), encoding="utf-8")
    en_path.write_text(build("en", en_header, en_footer), encoding="utf-8")
    print("wrote", es_path.relative_to(ROOT))
    print("wrote", en_path.relative_to(ROOT))


if __name__ == "__main__":
    main()
