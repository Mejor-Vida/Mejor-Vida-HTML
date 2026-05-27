#!/usr/bin/env python3
"""Patch weekly-insurance-update-2026-05-24.html (ES + EN) from May 17 templates."""
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SLUG = "weekly-insurance-update-2026-05-24"
IMG = f"../img/blog-generated/{SLUG}"
IMG_EN = f"../../img/blog-generated/{SLUG}"

STORIES_EN = r"""
<section class="story-section" id="story1">
<h2>Story 1: $370M+ in Insurance Investment Activity — AI Weather, India Expansion, and Consumer Claims Advocacy</h2>
<p class="story-meta"><strong>Source:</strong> InsurTech.ME  |  <strong>Published:</strong> May 23, 2026</p>
<img alt="Insurance technology and satellite data concept—InsurTech investment week May 2026" class="img-fluid rounded-3 mb-3" onerror="this.src='IMG_FALLBACK'" src="IMG_BASE/story-1.png"/>
<p>The week of May 17–23, 2026 saw more than $370 million in disclosed insurance and InsurTech investment across four transactions — fewer deals by count, but strategically significant. Three of four involved global carriers committing capital to data and intelligence infrastructure they do not build in-house. The through-line: competitive advantage increasingly depends on who controls data flowing into underwriting and claims.</p>
<h3 class="h5 mt-4">Tomorrow.io — $35M Series F Extension</h3>
<p>Boston-based Tomorrow.io, which operates microwave sounder satellites alongside a generative AI forecasting engine, announced a $35 million extension to its Series F (total $210M), led by Pitango with strategic participation from Harel Insurance. Capital will accelerate AI capabilities, expand the DeepSky observation network, and advance an agentic resilience platform that converts real-time weather data into operational guidance.</p>
<h3 class="h5 mt-4">Liberty Mutual — 74% Stake in India</h3>
<p>Liberty Mutual increased its shareholding in Liberty General Insurance Limited to 74% following India’s 2025 amendment raising foreign direct investment caps. LGI’s gross direct premium rose 25.31% year-on-year in FY2026 — nearly 3.2× the general insurance industry’s 8% growth — positioning Liberty as a first-mover in one of the world’s fastest-growing markets.</p>
<h3 class="h5 mt-4">Tugboat — Consumer Claims Advocacy</h3>
<p>Grand Forks, North Dakota-based Tugboat raised approximately $2.77 million toward a $4 million offering. Founded by former adjusters, the platform ($99/year) helps homeowners navigate denied or underpaid claims with policy reviews, documentation support, and online assistance — signaling growing consumer sophistication around claims.</p>
<h3 class="h5 mt-4">ICEYE — €300M Credit Facility</h3>
<p>Finland-based ICEYE, operating 70 SAR satellites as of March 2026, secured a €300 million three-year revolving credit facility. Clients including Swiss Re, Juniper Re, and AXA use ICEYE to accelerate claims triage and price reinsurance with observed rather than modeled catastrophe data.</p>
<h3 class="h5 mt-4">📈 What This Means for Agents</h3>
<ul class="mb-3">
<li>Ask carrier partners what data investments they are making — superior infrastructure translates into faster approvals and more competitive senior-market pricing.</li>
<li>The Tugboat model signals growing claims awareness; educate clients on state guaranty association limits and carrier financial strength.</li>
<li>The U.S. senior and final expense market — with over 100 million adults acknowledging a coverage gap — remains one of the largest domestic opportunities in financial services.</li>
</ul>
<p class="story-meta mb-0"><strong>Source: InsurTech.ME, May 23, 2026</strong></p>
</section>
<section class="story-section" id="story2">
<h2>Story 2: Prismic Raises $1.9 Billion as Life and Annuity Reinsurance Platform Expands</h2>
<p class="story-meta"><strong>Source:</strong> Royal Gazette  |  <strong>Published:</strong> May 22, 2026</p>
<img alt="Life reinsurance and capital markets—Prismic $1.9B raise May 2026" class="img-fluid rounded-3 mb-3" onerror="this.src='IMG_FALLBACK'" src="IMG_BASE/story-2.png"/>
<p>Prismic, the Bermuda-based life and annuity reinsurer backed by Prudential Financial and Warburg Pincus, raised approximately $1.9 billion in new commitments — exceeding its $1.6 billion target. Total capital since its 2023 launch now stands at $3.3 billion. Prismic manages $17 billion in liabilities as a Bermudian Class E life reinsurer, covering Prudential business in the U.S. and Japan plus third-party deals including Daiichi Life.</p>
<p>Reinsurance lets issuing carriers transfer reserve obligations for a fee, freeing capital for new business. General account reserves ceded by major U.S. life insurers have more than doubled since 2020, per ALIRT — partly enabling whole life and final expense growth (up 13% in policy count in Q1 2026 per LIMRA).</p>
<p>Regulators are watching closely. The PHL Variable Insurance collapse left 100,000 policyholders facing a $2.2 billion shortfall, with complex affiliate reinsurance contributing to losses. The NAIC has proposed frameworks on reserve adequacy, foreign reinsurance oversight, and affiliated investment disclosure.</p>
<h3 class="h5 mt-4">📈 What This Means for Agents</h3>
<ul class="mb-3">
<li>Strong reinsurance capital supports carrier capacity for competitive final expense products — the Prismic raise is a positive signal for availability and pricing stability.</li>
<li>Always verify AM Best ratings and financial strength; PHL showed that oversight gaps can leave policyholders exposed.</li>
<li>State guaranty associations typically cover up to $300,000 in death benefits per policyholder — discuss gaps for larger or older universal life policies.</li>
<li>Ask carriers about reinsurance arrangements and capital management as part of due diligence.</li>
</ul>
<p class="story-meta mb-0"><strong>Source: Royal Gazette, May 22, 2026</strong></p>
</section>
<section class="story-section" id="story3">
<h2>Story 3: WoodmenLife Enters Final Expense Market with New Whole Life Offering</h2>
<p class="story-meta"><strong>Source:</strong> InsuranceNewsNet  |  <strong>Published:</strong> May 21, 2026</p>
<img alt="Final expense whole life product launch—WoodmenLife May 2026" class="img-fluid rounded-3 mb-3" onerror="this.src='IMG_FALLBACK'" src="IMG_BASE/story-3.png"/>
<p>WoodmenLife, the Omaha-based not-for-profit fraternal benefit society rated A+ Superior by AM Best (effective February 20, 2026), launched a final expense whole life product on May 21, 2026. Coverage is designed for funeral and burial costs, medical bills, and other end-of-life obligations — easing the burden on surviving family members.</p>
<p>LIMRA’s Q1 2026 data showed whole life new premium up 9% to $1.6 billion and policy count up 13%, with strength attributed to final expense. Average U.S. funeral costs in 2026 are estimated at $8,000–$12,000. The final expense market is projected at approximately $17.46 billion in 2026, with 9.5% CAGR through 2034.</p>
<p>Whole life provides lifetime coverage and cash value — the typical structure for seniors in their 60s–80s when term becomes unavailable or prohibitively expensive. No-exam policies account for roughly 70% of new final expense policies; over 40% of policies are purchased online. WoodmenLife is distinct from Modern Woodmen of America.</p>
<h3 class="h5 mt-4">📈 What This Means for Agents</h3>
<ul class="mb-3">
<li>New carrier entrants with strong ratings signal long-term segment health — more options for agents who specialize in final expense.</li>
<li>Use $8,000–$12,000 funeral costs as a conversation starter; a $10,000 policy at age 65 might run roughly $40–$55/month for a healthy non-smoking woman.</li>
<li>Prioritize AM Best A- or better, flexible underwriting for common senior conditions, and solid claims payment history.</li>
<li>13% whole-life policy count growth in Q1 2026 confirms demand — prospect actively in the 60–80 age demographic.</li>
</ul>
<p class="story-meta mb-0"><strong>Source: InsuranceNewsNet, May 21, 2026</strong></p>
</section>
<section class="story-section" id="story4">
<h2>Story 4: CMS Finalizes Sweeping ACA Marketplace Overhaul for 2027</h2>
<p class="story-meta"><strong>Source:</strong> Insurance Business Magazine  |  <strong>Published:</strong> May 19, 2026</p>
<img alt="ACA marketplace regulation and agent compliance—CMS 2027 rule May 2026" class="img-fluid rounded-3 mb-3" onerror="this.src='IMG_FALLBACK'" src="IMG_BASE/story-4.png"/>
<p>CMS finalized a comprehensive rule on May 19, 2026 reshaping the Affordable Care Act marketplace for plan year 2027 — affecting user fees, eligibility verification, enrollment periods, plan design, and agent marketing practices. Agents who sell ACA alongside life and final expense should note direct operational changes; life-only agents should understand how coverage gaps affect client conversations.</p>
<p><strong>User fees</strong> drop on Federally-facilitated Exchanges from 2.5% (2026) to 1.9% (2027); State-based Exchanges on the federal platform from 2.0% to 1.5%. <strong>SEP verification</strong> returns — exchanges must verify at least 75% of new Special Enrollment Period enrollments. The <strong>low-income continuous SEP</strong> (below 150% FPL) is eliminated. <strong>Open enrollment</strong> shortens to November 1–December 15 for 2027.</p>
<p>Effective 2028, new <strong>marketing prohibitions</strong> ban cash to induce enrollment, falsely claiming zero-dollar premiums, and misrepresenting enrollment timelines. CMS projects 1.2–2 million fewer enrollees versus 2026 projections and premiums rising 1.7–2.4% due to exits — conditions where clients may seek alternative protection, including life insurance with living benefits or accelerated death benefit riders.</p>
<h3 class="h5 mt-4">📈 What This Means for Agents</h3>
<ul class="mb-3">
<li>Begin ACA renewal outreach in October — the compressed OEP (Nov 1–Dec 15) leaves little margin.</li>
<li>Clients losing the low-income continuous SEP may need alternatives outside open enrollment — discuss life products with living benefit riders where appropriate.</li>
<li>Review marketing materials against 2028 prohibitions now to avoid practices already under regulatory scrutiny.</li>
<li>Rising premiums and tighter eligibility create openings to position life insurance as part of broader financial protection for underinsured clients.</li>
</ul>
<p class="story-meta mb-0"><strong>Source: Insurance Business Magazine, May 19, 2026</strong></p>
</section>
"""

STORIES_ES = STORIES_EN  # placeholder replaced below

STORIES_ES = r"""
<section class="story-section" id="story1">
<h2>Historia 1: Más de 370 millones de dólares en inversión aseguradora — clima con IA, India y defensa del asegurado en reclamaciones</h2>
<p class="story-meta"><strong>Fuente:</strong> InsurTech.ME  |  <strong>Publicado:</strong> 23 de mayo de 2026</p>
<img alt="Tecnología aseguradora y datos por satélite—semana de inversión InsurTech mayo 2026" class="img-fluid rounded-3 mb-3" onerror="this.src='IMG_FALLBACK'" src="IMG_BASE/story-1.png"/>
<p>La semana del 17 al 23 de mayo de 2026 registró más de 370 millones de dólares en inversión divulgada en seguros e InsurTech en cuatro operaciones — menos volumen de deals, pero de alto impacto estratégico. Tres de cuatro involucraron aseguradoras globales invirtiendo en infraestructura de datos e inteligencia que no construyen internamente. La línea común: la ventaja competitiva depende cada vez más de quién controla los datos que alimentan suscripción y reclamaciones.</p>
<h3 class="h5 mt-4">Tomorrow.io — extensión Serie F de 35 millones USD</h3>
<p>Tomorrow.io (Boston), con satélites de sondeo por microondas y motor de pronóstico con IA generativa, anunció 35 millones de dólares adicionales en su Serie F (total 210 M), liderada por Pitango con participación estratégica de Harel Insurance. El capital acelerará capacidades de IA, la red DeepSky y una plataforma de resiliencia que convierte clima en tiempo real en guía operativa autónoma.</p>
<h3 class="h5 mt-4">Liberty Mutual — 74% en India</h3>
<p>Liberty Mutual elevó su participación en Liberty General Insurance Limited al 74% tras la reforma india de 2025 que permitió hasta 100% de inversión extranjera directa. La prima directa bruta de LGI creció 25,31% interanual en el ejercicio 2026 — casi 3,2 veces el 8% del sector general — posicionando a Liberty como pionera en uno de los mercados de más rápido crecimiento.</p>
<h3 class="h5 mt-4">Tugboat — defensa del consumidor en reclamaciones</h3>
<p>Tugboat (Grand Forks, Dakota del Norte) recaudó unos 2,77 millones de dólares de una oferta de 4 millones. Fundada por ex ajustadores, la plataforma (99 USD/año) ayuda a propietarios con reclamaciones denegadas o infrapagadas — señal de mayor sofisticación del consumidor en siniestros.</p>
<h3 class="h5 mt-4">ICEYE — facilidad de crédito de 300 millones EUR</h3>
<p>ICEYE (Finlandia), con 70 satélites SAR en marzo de 2026, obtuvo una facilidad revolvente de 300 millones de euros. Clientes como Swiss Re, Juniper Re y AXA usan ICEYE para acelerar triaje de siniestros y tarifar reaseguro con datos observados, no solo modelados.</p>
<h3 class="h5 mt-4">📈 Qué significa para los agentes</h3>
<ul class="mb-3">
<li>Pregunte a sus carriers qué inversiones en datos realizan — mejor infraestructura se traduce en aprobaciones más rápidas y tarifas más competitivas en el mercado senior.</li>
<li>El modelo Tugboat refleja mayor conciencia sobre reclamaciones; eduque sobre límites de asociaciones de garantía estatales y solidez financiera del carrier.</li>
<li>El mercado de gastos finales y seniors — con más de 100 millones de adultos reconociendo una brecha de cobertura — sigue siendo una de las mayores oportunidades domésticas.</li>
</ul>
<p class="story-meta mb-0"><strong>Fuente: InsurTech.ME, 23 de mayo de 2026</strong></p>
</section>
<section class="story-section" id="story2">
<h2>Historia 2: Prismic recauda 1.900 millones de dólares en reaseguro de vida y anualidades</h2>
<p class="story-meta"><strong>Fuente:</strong> Royal Gazette  |  <strong>Publicado:</strong> 22 de mayo de 2026</p>
<img alt="Reaseguro de vida y mercados de capital—recaudación Prismic mayo 2026" class="img-fluid rounded-3 mb-3" onerror="this.src='IMG_FALLBACK'" src="IMG_BASE/story-2.png"/>
<p>Prismic, reasegurador bermudeño de vida y anualidades respaldado por Prudential Financial y Warburg Pincus, recaudó unos 1.900 millones de dólares en nuevos compromisos — por encima del objetivo de 1.600 millones. El capital total desde su lanzamiento en 2023 alcanza 3.300 millones. Prismic gestiona 17.000 millones en pasivos como reasegurador de vida Clase E, cubriendo negocio de Prudential en EE. UU. y Japón y acuerdos con terceros como Daiichi Life.</p>
<p>El reaseguro permite transferir reservas a cambio de una prima, liberando capital para nuevo negocio. Las reservas de cuenta general cedidas por grandes aseguradoras de vida en EE. UU. se más que duplicaron desde 2020 (ALIRT) — facilitando en parte el crecimiento de whole life y gastos finales (+13% en número de pólizas en Q1 2026 según LIMRA).</p>
<p>Los reguladores vigilan de cerca. El colapso de PHL Variable Insurance dejó a 100.000 asegurados ante un déficit de 2.200 millones; reaseguros complejos con afiliadas contribuyeron a las pérdidas. El NAIC propone marcos sobre adecuación de reservas, supervisión de reaseguro extranjero y divulgación de inversiones afiliadas.</p>
<h3 class="h5 mt-4">📈 Qué significa para los agentes</h3>
<ul class="mb-3">
<li>Capital sólido en reaseguro respalda capacidad para productos competitivos de gastos finales — la recaudación de Prismic es una señal positiva.</li>
<li>Verifique siempre calificaciones AM Best; PHL demostró que lagunas de supervisión pueden exponer a los asegurados.</li>
<li>Las asociaciones de garantía estatales suelen cubrir hasta 300.000 USD en beneficios por muerte — converse brechas en pólizas mayores o UL antiguas.</li>
<li>Pregunte por arreglos de reaseguro y gestión de capital en su diligencia de carriers.</li>
</ul>
<p class="story-meta mb-0"><strong>Fuente: Royal Gazette, 22 de mayo de 2026</strong></p>
</section>
<section class="story-section" id="story3">
<h2>Historia 3: WoodmenLife entra al mercado de gastos finales con whole life</h2>
<p class="story-meta"><strong>Fuente:</strong> InsuranceNewsNet  |  <strong>Publicado:</strong> 21 de mayo de 2026</p>
<img alt="Lanzamiento de producto de gastos finales whole life—WoodmenLife mayo 2026" class="img-fluid rounded-3 mb-3" onerror="this.src='IMG_FALLBACK'" src="IMG_BASE/story-3.png"/>
<p>WoodmenLife, sociedad fraternal sin fines de lucro de Omaha calificada A+ Superior por AM Best (vigente desde el 20 de febrero de 2026), lanzó el 21 de mayo un whole life de gastos finales para costos funerarios, médicos y obligaciones al final de la vida — aliviando la carga de la familia sobreviviente.</p>
<p>LIMRA reportó en Q1 2026 prima nueva de whole life +9% hasta 1.600 millones USD y +13% en número de pólizas, impulsado por gastos finales. El costo promedio de funeral en EE. UU. en 2026 se estima entre 8.000 y 12.000 dólares. El mercado de gastos finales se proyecta en unos 17.460 millones en 2026, con CAGR del 9,5% hasta 2034.</p>
<p>El whole life ofrece cobertura de por vida y valor en efectivo — estructura habitual para personas de 60 a 80 años cuando el término no está disponible o es prohibitivo. Las pólizas sin examen representan ~70% de nuevas pólizas FE; más del 40% se compran en línea. WoodmenLife es distinta de Modern Woodmen of America.</p>
<h3 class="h5 mt-4">📈 Qué significa para los agentes</h3>
<ul class="mb-3">
<li>Nuevos entrantes con calificaciones fuertes refuerzan la salud del segmento — más opciones para agentes especializados.</li>
<li>Use 8.000–12.000 USD en funerales como gancho; una póliza de 10.000 USD a los 65 años puede costar unos 40–55 USD/mes a una mujer no fumadora saludable.</li>
<li>Priorice AM Best A- o mejor, suscripción flexible y historial de pagos de siniestros.</li>
<li>El +13% en pólizas de whole life en Q1 2026 confirma demanda — prospecte activamente entre 60 y 80 años.</li>
</ul>
<p class="story-meta mb-0"><strong>Fuente: InsuranceNewsNet, 21 de mayo de 2026</strong></p>
</section>
<section class="story-section" id="story4">
<h2>Historia 4: CMS finaliza reforma integral del mercado ACA para 2027</h2>
<p class="story-meta"><strong>Fuente:</strong> Insurance Business Magazine  |  <strong>Publicado:</strong> 19 de mayo de 2026</p>
<img alt="Regulación del mercado ACA y cumplimiento de agentes—regla CMS 2027 mayo 2026" class="img-fluid rounded-3 mb-3" onerror="this.src='IMG_FALLBACK'" src="IMG_BASE/story-4.png"/>
<p>CMS finalizó el 19 de mayo de 2026 una regla integral que redefine el mercado de la Ley de Cuidado de Salud Asequible (ACA) para el año de plan 2027 — tarifas de usuario, verificación de elegibilidad, periodos de inscripción, diseño de planes y prácticas de marketing de agentes. Quienes venden ACA junto con vida y gastos finales deben adaptar operaciones; quienes solo venden vida deben entender cómo las brechas de cobertura afectan las conversaciones con el cliente.</p>
<p><strong>Tarifas de usuario</strong> bajan en intercambios federales de 2,5% (2026) a 1,9% (2027); en estatales sobre plataforma federal de 2,0% a 1,5%. <strong>Verificación SEP</strong> vuelve — al menos 75% de nuevas inscripciones por periodo especial. Se <strong>elimina el SEP continuo de bajos ingresos</strong> (bajo 150% FPL). <strong>Inscripción abierta</strong> se acorta al 1 de noviembre–15 de diciembre de 2027.</p>
<p>Desde 2028, nuevas <strong>prohibiciones de marketing</strong> incluyen efectivo para inducir inscripción, afirmar primas de cero dólares falsamente y tergiversar plazos. CMS proyecta 1,2–2 millones menos de inscritos y primas +1,7–2,4% — dinámica en la que clientes pueden buscar protección alternativa, incluida vida con beneficios en vida o riders de beneficio acelerado.</p>
<h3 class="h5 mt-4">📈 Qué significa para los agentes</h3>
<ul class="mb-3">
<li>Comience renovaciones ACA en octubre — la ventana comprimida (1 nov–15 dic) no deja margen.</li>
<li>Quienes pierdan el SEP continuo de bajos ingresos pueden necesitar alternativas fuera de inscripción abierta — evalúe vida con beneficios en vida cuando corresponda.</li>
<li>Revise materiales de marketing frente a prohibiciones de 2028 ya bajo escrutinio regulatorio.</li>
<li>Primas al alza y elegibilidad más estricta abren espacio para posicionar seguro de vida en una estrategia de protección más amplia.</li>
</ul>
<p class="story-meta mb-0"><strong>Fuente: Insurance Business Magazine, 19 de mayo de 2026</strong></p>
</section>
"""

META = {
    "en": {
        "path": ROOT / "en/blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/en/blog/{SLUG}.html",
        "title": "Weekly U.S. Life & Final Expense Insurance Update (May 24, 2026) | Mejor Vida Insurance",
        "description": "May 24, 2026 weekly update: $370M+ InsurTech investments, Prismic $1.9B reinsurance raise, WoodmenLife final expense launch, CMS ACA 2027 rule — news from May 17–23, 2026.",
        "keywords": "weekly insurance update, final expense insurance, InsurTech, Prismic reinsurance, WoodmenLife, CMS ACA marketplace",
        "og_title": "Weekly U.S. Life & Final Expense Insurance Update — May 24, 2026",
        "og_desc": "May 24, 2026: InsurTech investments, Prismic reinsurance, WoodmenLife FE, CMS ACA overhaul — week of May 17–23, 2026.",
        "json_headline": "Weekly U.S. Life & Final Expense Insurance Update — week of May 17–May 23, 2026",
        "json_alt": "May 24, 2026: InsurTech $370M+; Prismic $1.9B; WoodmenLife FE; CMS ACA 2027",
        "json_desc": "Mejor Vida Insurance May 24, 2026 weekly briefing for agents: InsurTech capital, life reinsurance, final expense product launch, and ACA marketplace compliance.",
        "itemlist_name": "Topics for agents — insurance market update May 17–May 23, 2026",
        "hero_h1": "Weekly U.S. Life &amp; Final Expense Insurance Update",
        "hero_date": "May 24, 2026 · News from May 17 – May 23, 2026",
        "hero_tags": "📰 4 Stories This Week  |  🛰 InsurTech  |  💰 Reinsurance  |  ⚰ Final Expense  |  📋 ACA Rules",
        "hero_lead": "Welcome to your weekly briefing on U.S. life and final expense insurance. This edition covers four developments from May 17–May 23, 2026: more than $370 million in InsurTech and carrier data investments, Prismic’s oversubscribed $1.9 billion life reinsurance raise, WoodmenLife’s new final expense whole life launch, and CMS’s finalized ACA marketplace overhaul for 2027.",
        "hero_img": f"{IMG_EN}/hero-en.png",
        "hero_alt": "Weekly insurance update May 24, 2026—InsurTech, reinsurance, final expense, and ACA marketplace themes",
        "read_min": "About 32 min read",
        "disclaimer_week": "Content covers U.S. life and final expense insurance news from May 17 - May 23, 2026.",
        "prior_link": "weekly-insurance-update-2026-05-17.html",
        "prior_label": "May 17, 2026 update — prior week (ALIRT transition, AI FE leads, NAIC $9.6T)",
        "sidebar_prior": "May 17 update",
        "lang_link": f"/blog/{SLUG}.html",
        "lang_label": "Español",
        "stories": STORIES_EN,
        "img_base": IMG_EN,
        "fallback": "../img/3-1-2026-Blog.png",
        "sidebar": [
            ("story1", "Story 1 — InsurTech $370M+"),
            ("story2", "Story 2 — Prismic reinsurance"),
            ("story3", "Story 3 — WoodmenLife FE"),
            ("story4", "Story 4 — CMS ACA 2027"),
        ],
    },
    "es": {
        "path": ROOT / "blog" / f"{SLUG}.html",
        "canonical": f"https://www.mejorvidainsurance.com/blog/{SLUG}.html",
        "title": "Actualización semanal de seguros de vida y gastos finales (24 mayo 2026) | Mejor Vida Insurance",
        "description": "Actualización del 24 de mayo de 2026: más de 370 M USD en InsurTech, Prismic 1.900 M en reaseguro, lanzamiento FE de WoodmenLife, regla CMS del mercado ACA 2027 — noticias del 17 al 23 de mayo de 2026.",
        "keywords": "actualización semanal seguros, gastos finales, InsurTech, reaseguro Prismic, WoodmenLife, mercado ACA CMS",
        "og_title": "Actualización semanal de vida y gastos finales — 24 de mayo de 2026",
        "og_desc": "24 mayo 2026: inversiones InsurTech, reaseguro Prismic, gastos finales WoodmenLife, reforma ACA CMS — semana del 17 al 23 de mayo de 2026.",
        "json_headline": "Actualización semanal de seguros de vida y gastos finales en EE. UU. — semana del 17 al 23 de mayo de 2026",
        "json_alt": "24 mayo 2026: InsurTech 370 M+; Prismic 1.900 M; WoodmenLife FE; CMS ACA 2027",
        "json_desc": "Resumen semanal Mejor Vida Insurance del 24 de mayo de 2026 para agentes: capital InsurTech, reaseguro de vida, nuevo producto de gastos finales y cumplimiento del mercado ACA.",
        "itemlist_name": "Temas para agentes — actualización del mercado 17–23 mayo 2026",
        "hero_h1": "Actualización semanal de seguros de vida y gastos finales en EE. UU.",
        "hero_date": "24 de mayo de 2026 · Noticias del 17 al 23 de mayo de 2026",
        "hero_tags": "📰 4 historias  |  🛰 InsurTech  |  💰 Reaseguro  |  ⚰ Gastos finales  |  📋 Reglas ACA",
        "hero_lead": "Bienvenido a su resumen semanal de seguro de vida y gastos finales en EE. UU. Esta edición cubre cuatro desarrollos del 17 al 23 de mayo de 2026: más de 370 millones de dólares en inversión InsurTech y datos, la recaudación sobresuscrita de 1.900 millones de Prismic en reaseguro de vida, el nuevo whole life de gastos finales de WoodmenLife y la reforma finalizada del mercado ACA de CMS para 2027.",
        "hero_img": f"{IMG}/hero-es.png",
        "hero_alt": "Actualización semanal 24 mayo 2026—InsurTech, reaseguro, gastos finales y mercado ACA",
        "read_min": "Aprox. 32 min de lectura",
        "disclaimer_week": "El contenido cubre noticias de EE. UU. sobre vida y gastos finales del 17 al 23 de mayo de 2026.",
        "prior_link": "weekly-insurance-update-2026-05-17.html",
        "prior_label": "Actualización 17 mayo 2026 — semana anterior (ALIRT, prospectos FE con IA, NAIC 9,6 billones USD)",
        "sidebar_prior": "Actualización del 17 de mayo",
        "lang_link": f"/en/blog/{SLUG}.html",
        "lang_label": "English",
        "stories": STORIES_ES,
        "img_base": IMG,
        "fallback": "../img/3-1-2026-Blog.png",
        "sidebar": [
            ("story1", "Historia 1 — InsurTech 370 M+ USD"),
            ("story2", "Historia 2 — reaseguro Prismic"),
            ("story3", "Historia 3 — WoodmenLife FE"),
            ("story4", "Historia 4 — CMS ACA 2027"),
        ],
    },
}

ITEMLIST_JSON = """[
      {"@type":"ListItem","position":1,"item":{"@type":"NewsArticle","headline":"$370M+ Insurance Investment Activity — InsurTech","datePublished":"2026-05-23","publisher":{"@type":"Organization","name":"InsurTech.ME"}}},
      {"@type":"ListItem","position":2,"item":{"@type":"NewsArticle","headline":"Prismic Raises $1.9 Billion — Life Reinsurance","datePublished":"2026-05-22","publisher":{"@type":"Organization","name":"Royal Gazette"}}},
      {"@type":"ListItem","position":3,"item":{"@type":"NewsArticle","headline":"WoodmenLife Final Expense Whole Life Launch","datePublished":"2026-05-21","publisher":{"@type":"Organization","name":"InsuranceNewsNet"}}},
      {"@type":"ListItem","position":4,"item":{"@type":"NewsArticle","headline":"CMS ACA Marketplace Overhaul for 2027","datePublished":"2026-05-19","publisher":{"@type":"Organization","name":"Insurance Business Magazine"}}}
    ]"""


def patch_file(lang: str):
    m = META[lang]
    text = m["path"].read_text(encoding="utf-8")
    text = text.replace("2026-05-17", "2026-05-24")
    text = text.replace("May 17, 2026", "May 24, 2026" if lang == "en" else "24 de mayo de 2026")
    text = text.replace("May 10–May 16, 2026", "May 17–May 23, 2026")
    text = text.replace("May 10–16, 2026", "May 17–23, 2026")
    text = text.replace("May 10 - May 16, 2026", "May 17 - May 23, 2026")
    text = text.replace("10 al 16 de mayo de 2026", "17 al 23 de mayo de 2026")
    text = text.replace("del 10 al 16 de mayo de 2026", "del 17 al 23 de mayo de 2026")
    text = text.replace("weekly-insurance-update-2026-05-17", SLUG)
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
    # JSON-LD headline/description
    text = re.sub(
        r'"headline": "[^"]*"',
        f'"headline": "{m["json_headline"]}"',
        text,
        count=1,
    )
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
    # ItemList body
    text = re.sub(
        r'"itemListElement": \[[\s\S]*?\]\s*\n  \}',
        f'"itemListElement": {ITEMLIST_JSON}\n  }}',
        text,
        count=1,
        flags=re.MULTILINE,
    )
    # Hero
    if lang == "en":
        text = re.sub(
            r"<h1>Weekly U\.S\. Life.*?</h1>",
            f"<h1>{m['hero_h1']}</h1>",
            text,
            count=1,
        )
    else:
        text = re.sub(
            r"<h1>Actualización semanal.*?</h1>",
            f"<h1>{m['hero_h1']}</h1>",
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
    # Stories block
    stories = (
        m["stories"]
        .replace("IMG_BASE", m["img_base"])
        .replace("IMG_FALLBACK", m["fallback"])
    )
    text = re.sub(
        r'<section class="story-section" id="story1">[\s\S]*?</section>\s*<div class="border rounded p-4',
        stories + '\n<div class="border rounded p-4',
        text,
        count=1,
    )
    # Disclaimer week
    text = re.sub(
        r'Content covers U\.S\. life and final expense insurance news from [^<]*\.',
        m["disclaimer_week"],
        text,
        count=1,
    )
    text = re.sub(
        r'El contenido cubre noticias de EE\. UU\. sobre vida y gastos finales del [^<]*\.',
        m["disclaimer_week"],
        text,
        count=1,
    )
    # Internal links prior week
    text = text.replace("weekly-insurance-update-2026-05-10.html", m["prior_link"], 1)
    text = re.sub(
        r'<li><a href="weekly-insurance-update-2026-05-17\.html">[^<]*</a></li>',
        f'<li><a href="{m["prior_link"]}">{m["prior_label"]}</a></li>',
        text,
        count=1,
    )
  # Sidebar TOC
    sidebar_ul = "\n".join(
        f'<li><a href="#{sid}">{label}</a></li>' for sid, label in m["sidebar"]
    )
    text = re.sub(
        r'<ul>\s*<li><a href="#story1">.*?</ul>',
        f"<ul>\n{sidebar_ul}\n</ul>",
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r'<p class="small mb-0 mt-2 text-secondary"><a href="weekly-insurance-update-[^"]*">[^<]*</a>[^<]*</p>',
        f'<p class="small mb-0 mt-2 text-secondary"><a href="{m["prior_link"]}">{m["sidebar_prior"]}</a> — boletín de la semana anterior.</p>'
        if lang == "es"
        else f'<p class="small mb-0 mt-2 text-secondary"><a href="{m["prior_link"]}">{m["sidebar_prior"]}</a> — prior week newsletter.</p>',
        text,
        count=1,
    )
    m["path"].write_text(text, encoding="utf-8")
    print(f"Patched {m['path']}")


def main():
    for lang in ("en", "es"):
        patch_file(lang)
    src = ROOT / "sources/blog" / f"{SLUG}.html"
    shutil.copy2(ROOT / "blog" / f"{SLUG}.html", src)
    print(f"Copied to {src}")


if __name__ == "__main__":
    main()
