#!/usr/bin/env python3
"""Build compact carrier blocks for landing-gastos-finales.html (~half page each)."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

LP_CARRIERS_CSS = """
    /* Carrier blocks — compact (~half page each), logo centered on top */
    .lp-carriers-section {
      padding: clamp(1.75rem, 4vw, 2.5rem) clamp(0.65rem, 2.5vw, 2rem);
      background: var(--mvi-bg);
      border-top: 1px solid var(--mvi-border);
      scroll-margin-top: calc(var(--lp-header-h) + 0.5rem);
    }
    .lp-carriers-inner {
      max-width: 76rem;
      margin: 0 auto;
    }
    .lp-carriers-title {
      margin: 0 0 0.65rem;
      text-align: center;
      font-size: clamp(1.85rem, 5vw, 2.85rem);
      font-weight: 700;
      color: var(--mvi-navy);
      line-height: 1.2;
    }
    .lp-carriers-lead {
      margin: 0 0 clamp(1.5rem, 3vw, 2rem);
      max-width: none;
      text-align: center;
      font-size: clamp(1.05rem, 2.2vw, 1.15rem);
      color: var(--mvi-muted);
      line-height: 1.55;
    }
    .lp-carrier-block {
      width: 100%;
      max-width: none;
      margin: 0 0 clamp(1.75rem, 4vw, 2.25rem);
      background: #fff;
      border: 1px solid var(--mvi-border);
      border-radius: 0.75rem;
      overflow: hidden;
      scroll-margin-top: calc(var(--lp-header-h) + 0.5rem);
    }
    .lp-carrier-block:last-child { margin-bottom: 0; }
    .lp-carrier-logo-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(1.1rem, 3vw, 1.5rem) clamp(1rem, 2.5vw, 1.25rem) clamp(0.85rem, 2vw, 1rem);
      background: #fff;
      border-bottom: 1px solid var(--mvi-border);
    }
    .lp-carrier-logo-wrap img {
      display: block;
      width: auto;
      max-width: min(100%, 28rem);
      object-fit: contain;
    }
    .lp-carrier-block--omaha .lp-carrier-logo-wrap img { height: clamp(4rem, 10vw, 5.25rem); }
    .lp-carrier-block--assurity .lp-carrier-logo-wrap img { height: clamp(3.25rem, 8vw, 4.25rem); }
    .lp-carrier-block--amicable .lp-carrier-logo-wrap img { height: clamp(3.5rem, 9vw, 4.75rem); }
    .lp-carrier-content {
      padding: clamp(1rem, 2.5vw, 1.5rem) clamp(1.25rem, 3vw, 2rem) clamp(1.25rem, 2.5vw, 1.5rem);
    }
    @media (min-width: 992px) {
      .lp-carrier-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.85rem 1.75rem;
        align-items: start;
      }
      .lp-carrier-content .lp-carrier-tagline,
      .lp-carrier-content h3,
      .lp-carrier-plan-guide,
      .lp-carrier-highlights,
      .lp-carrier-fine,
      .lp-carrier-more {
        grid-column: 1 / -1;
      }
      .lp-carrier-blurb { grid-column: 1; margin-bottom: 0; }
      .lp-carrier-plans { grid-column: 2; margin-bottom: 0; align-self: start; }
    }
    .lp-carrier-content h3 {
      margin: 0 0 0.5rem;
      font-size: clamp(1.25rem, 2.5vw, 1.5rem);
      font-weight: 700;
      color: var(--mvi-navy);
      line-height: 1.3;
      text-align: center;
    }
    .lp-carrier-tagline {
      margin: 0 0 0.65rem;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--mvi-muted);
    }
    .lp-carrier-blurb {
      margin: 0 0 0.85rem;
      font-size: clamp(1.05rem, 2vw, 1.12rem);
      color: #334155;
      line-height: 1.55;
      max-width: none;
    }
    .lp-carrier-plans {
      display: grid;
      gap: 0.65rem;
      margin: 0 0 0.85rem;
    }
    @media (min-width: 520px) {
      .lp-carrier-plans--2 { grid-template-columns: 1fr 1fr; }
    }
    @media (min-width: 992px) {
      .lp-carrier-highlights {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.35rem 1.5rem;
        padding-left: 1.15rem;
      }
    }
    .lp-carrier-plan-card {
      padding: 0.65rem 0.75rem;
      border-radius: 0.45rem;
      border: 1px solid var(--mvi-border);
      background: var(--mvi-bg);
      font-size: clamp(0.92rem, 1.8vw, 1rem);
      line-height: 1.45;
      color: #475569;
    }
    .lp-carrier-plan-card strong {
      display: block;
      color: var(--mvi-navy);
      font-size: 0.95em;
      margin-bottom: 0.2rem;
    }
    .lp-carrier-plan-guide {
      margin: 0 0 0.75rem;
      padding: 0.55rem 0.7rem;
      border-radius: 0.4rem;
      border: 1px solid rgba(13, 71, 161, 0.12);
      background: #f8fbff;
      font-size: clamp(0.88rem, 1.75vw, 0.98rem);
      line-height: 1.4;
      color: #475569;
    }
    .lp-carrier-plan-guide h4 {
      margin: 0 0 0.25rem;
      font-size: 0.95em;
      font-weight: 700;
      color: var(--mvi-navy);
    }
    .lp-carrier-plan-guide-row { display: block; margin-top: 0.2rem; }
    .lp-carrier-plan-guide-row strong { color: var(--mvi-navy); font-weight: 600; }
    .lp-carrier-plan-guide-note {
      display: block;
      margin-top: 0.35rem;
      font-size: 0.92em;
      color: #64748b;
    }
    .lp-carrier-highlights {
      margin: 0 0 0.75rem;
      padding-left: 1.15rem;
      font-size: clamp(0.98rem, 1.9vw, 1.06rem);
      color: #475569;
      line-height: 1.5;
    }
    .lp-carrier-highlights li { margin-bottom: 0.3rem; }
    .lp-carrier-highlights li:last-child { margin-bottom: 0; }
    .lp-carrier-fine {
      margin: 0 0 0.65rem;
      font-size: 0.88rem;
      color: var(--mvi-muted);
      line-height: 1.45;
    }
    .lp-carrier-more {
      margin: 0;
      text-align: center;
      font-size: clamp(0.95rem, 1.8vw, 1.02rem);
    }
    .lp-carrier-more a { font-weight: 600; }
"""

CARRIERS_HTML = """
    <article class="lp-carrier-block lp-carrier-block--omaha" id="carrier-mutual-of-omaha">
      <div class="lp-carrier-logo-wrap">
        <img src="img/carriers/mutual-of-omaha-logo.png" alt="Mutual of Omaha" width="400" height="88" decoding="async" />
      </div>
      <div class="lp-carrier-content">
        <p class="lp-carrier-tagline">Protect Your Kingdom</p>
        <h3>Living Promise — vida entera para gastos finales</h3>
        <p class="lp-carrier-blurb">Seguro de vida entera permanente, suscrito por United of Omaha Life Insurance Company. Ayuda a tu familia con funeral, deudas y otros costos inmediatos — con primas niveladas que no suben por edad.</p>
        <div class="lp-carrier-plans lp-carrier-plans--2">
          <div class="lp-carrier-plan-card">
            <strong>Plan nivelado</strong>
            Prestación completa desde el día 1 · Edades 45–85 · $2,000–$50,000
          </div>
          <div class="lp-carrier-plan-card">
            <strong>Plan gradual*</strong>
            Años 1–2: primas pagadas + 10% (causa natural) · Después: prestación completa · Edades 45–80
          </div>
        </div>
        <div class="lp-carrier-plan-guide">
          <h4>¿Nivelado o gradual?</h4>
          <span class="lp-carrier-plan-guide-row"><strong>Nivelado:</strong> Buena salud → beneficio completo desde el día 1.</span>
          <span class="lp-carrier-plan-guide-row"><strong>Gradual:</strong> Salud más delicada → años 1–2: primas + 10% (causa natural); accidente: completo; después: completo.</span>
          <span class="lp-carrier-plan-guide-note">No lo eliges tú — Julie te confirma según tus respuestas de salud.</span>
        </div>
        <ul class="lp-carrier-highlights">
          <li>Suscripción simplificada — sin examen médico</li>
          <li>Prestación acelerada por enfermedad terminal o confinamiento (incluida en plan nivelado)</li>
          <li>Compañía mutualista desde 1909 · Calificación A+ (AM Best, abril 2025)</li>
        </ul>
        <p class="lp-carrier-fine mb-0">*Plan gradual no disponible en AR, MT, NC.</p>
      </div>
    </article>

    <article class="lp-carrier-block lp-carrier-block--assurity" id="carrier-assurity">
      <div class="lp-carrier-logo-wrap">
        <img src="img/carriers/assurity-logo.svg" alt="Assurity" width="220" height="52" decoding="async" />
      </div>
      <div class="lp-carrier-content">
        <h3>Whole Life Protect+ y Perform+</h3>
        <p class="lp-carrier-blurb">Vida entera permanente desde <strong>$10,000</strong>, con suscripción simplificada hasta los 85 años. Ideal para gastos finales, con beneficios en vida incluidos sin costo extra.</p>
        <div class="lp-carrier-plans lp-carrier-plans--2">
          <div class="lp-carrier-plan-card">
            <strong>Protect+</strong>
            Más prestación por cada dólar de prima — buena opción si priorizas el monto para tu familia.
          </div>
          <div class="lp-carrier-plan-card">
            <strong>Perform+</strong>
            Más valor en efectivo con el tiempo — si puedes pagar un poco más al mes y quieres acumular activo.
          </div>
        </div>
        <ul class="lp-carrier-highlights">
          <li>Sin examen médico para quienes califiquen (suscripción acelerada)</li>
          <li>Beneficios en vida: enfermedad terminal, crónica y crítica (anexo incluido)</li>
          <li>Primas fijas · Elegible para dividendos · Fundada en Lincoln, Nebraska</li>
        </ul>
        <p class="lp-carrier-fine mb-0">No disponible en California ni Nueva York.</p>
      </div>
    </article>

    <article class="lp-carrier-block lp-carrier-block--amicable" id="carrier-american-amicable">
      <div class="lp-carrier-logo-wrap">
        <img src="img/carriers/american-amicable-logo.png" alt="American Amicable" width="520" height="90" decoding="async" />
      </div>
      <div class="lp-carrier-content">
        <h3>Golden Solution y Senior Choice</h3>
        <p class="lp-carrier-blurb">Vida entera para gastos finales, edades <strong>50 a 85</strong>, con suscripción simplificada y sin examen médico (preguntas de salud y entrevista telefónica si aplica).</p>
        <div class="lp-carrier-plans lp-carrier-plans--2">
          <div class="lp-carrier-plan-card">
            <strong>Golden Solution</strong>
            Primas programadas hasta los 100 años.
          </div>
          <div class="lp-carrier-plan-card">
            <strong>Senior Choice</strong>
            Primas programadas hasta los 110 años.
          </div>
        </div>
        <ul class="lp-carrier-highlights">
          <li><strong>Inmediato:</strong> 100% del beneficio desde el año 1</li>
          <li><strong>Escalonado:</strong> 30% / 70% / 100% en años 1–3 (causa natural)</li>
          <li><strong>Devolución de prima:</strong> primas + 10% los primeros 2–3 años, luego 100%</li>
          <li>Cobertura típica: $2,500–$50,000 según plan y edad</li>
        </ul>
      </div>
    </article>
""".strip()


def build_carriers_section() -> str:
    return f"""  <section class="lp-carriers-section" id="aseguradoras" aria-labelledby="aseguradoras-title">
    <div class="lp-carriers-inner">
      <h2 id="aseguradoras-title" class="lp-carriers-title">Aseguradoras que representamos</h2>
      <p class="lp-carriers-lead">Julie trabaja como agente independiente con compañías sólidas. Aquí tienes un resumen de cada una.</p>
{CARRIERS_HTML}
    </div>
  </section>
"""


def update_landing() -> None:
    landing_path = ROOT / "landing-gastos-finales.html"
    text = landing_path.read_text(encoding="utf-8")

    # Replace CSS block
    css_start = text.find("    /* Carrier")
    css_end = text.find("    @media (max-width: 991.98px)", css_start)
    if css_start < 0 or css_end < 0:
        raise SystemExit("Could not find carrier CSS block")
    text = text[:css_start] + LP_CARRIERS_CSS + text[css_end:]

    # Replace carriers section
    sec_start = text.find('  <section class="lp-carriers-section"')
    sec_end = text.find('  <div class="lp-shell">', sec_start)
    if sec_start < 0 or sec_end < 0:
        raise SystemExit("Could not find carriers section boundaries")

    text = text[:sec_start] + build_carriers_section() + "\n\n" + text[sec_end:]

    out = ROOT / "fragments" / "lp-carriers-es.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(CARRIERS_HTML + "\n", encoding="utf-8")

    landing_path.write_text(text, encoding="utf-8")
    print(f"Updated {landing_path}")
    print(f"Wrote {out}")


if __name__ == "__main__":
    update_landing()
