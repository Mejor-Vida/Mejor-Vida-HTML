#!/usr/bin/env python3
"""English 10DLC compliance mirror of gastos-finales-ads-v2/index.html."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "gastos-finales-ads-v2" / "index.html"
DST = ROOT / "en" / "gastos-finales-ads-v2" / "index.html"

SMS_EN = (
    "Yes, I agree to receive SMS text messages from Mejor Vida Insurance LLC, including personalized "
    "quote follow-up, appointment scheduling reminders, application status updates, and customer "
    "service messages. Msg &amp; data rates may apply. Frequency: 1–5 messages per week. "
    "Reply STOP to cancel. Reply HELP for help. Consent is not required to get a quote or purchase "
    "insurance. SMS is delivered via authorized providers including Telnyx. "
    '<a href="../privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> · '
    '<a href="../terms-service.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>.'
)

STRUCTURAL_REPLACEMENTS = [
    ('<html lang="es">', '<html lang="en">'),
    ('<meta name="robots" content="noindex, nofollow" />', '<meta name="robots" content="index, follow" />'),
    (
        'content="Tu estimado personalizado de seguro de gastos finales con Mejor Vida Insurance en Nebraska."',
        'content="Free final expense insurance quote from Mejor Vida Insurance in Nebraska. English compliance mirror of our quote landing for SMS opt-in review."',
    ),
    ('content="final-expense-es-v2"', 'content="final-expense-en-v2-compliance"'),
    ('<!-- Meta Pixel Code -->', '<!-- Meta Pixel omitted on English compliance landing -->'),
    ('<script defer src="/js/meta-pixel-landing.js"></script>', ''),
    (
        '<noscript><img alt="" height="1" width="1" style="display:none" '
        'src="https://www.facebook.com/tr?id=873141755808233&amp;ev=PageView&amp;noscript=1" /></noscript>',
        '',
    ),
    ('<!-- End Meta Pixel Code -->', ''),
    (
        '<title>Seguro de gastos finales | Mejor Vida Insurance</title>',
        '<title>Final Expense Insurance Quote | Mejor Vida Insurance</title>',
    ),
    ('href="../favicon.ico"', 'href="../../favicon.ico"'),
    ('href="../bootstrap/', 'href="../../bootstrap/'),
    ('href="../css/quote-flow-shared.css"', 'href="../../css/quote-flow-shared.css"'),
    ('href="css/', 'href="../../gastos-finales-ads-v2/css/'),
    ('src="../img/logo-spanish2.png"', 'src="../../img/logo-english2.png"'),
    ('aria-label="Volver al inicio de esta página"', 'aria-label="Return to start of this page"'),
    ('<span class="lf-help-label">¿Necesitas ayuda?</span>', '<span class="lf-help-label">Need help?</span>'),
    (
        'text=Hola%2C%20me%20interes%C3%B3%20conocer%20el%20seguro%20de%20gastos%20finales.',
        'text=Hello%2C%20I%20am%20interested%20in%20learning%20about%20final%20expense%20insurance.',
    ),
    ('aria-label="WhatsApp con Mejor Vida"', 'aria-label="WhatsApp Mejor Vida"'),
    ('aria-label="Progreso"', 'aria-label="Progress"'),
    (
        'hidden>¿Listo para aprender más de gastos finales?</h1>',
        'hidden>Ready to learn more about final expense insurance?</h1>',
    ),
    ('aria-label="Volver al paso anterior">← Atrás</button>', 'aria-label="Go back to previous step">← Back</button>'),
    ('aria-label="Elige cómo continuar"', 'aria-label="Choose how to continue"'),
    ('disabled>Siguiente</button>', 'disabled>Next</button>'),
    ('src="img/', 'src="../../gastos-finales-ads-v2/img/'),
    ('src="../img/', 'src="../../img/'),
    ('href="../en/e-sign-consent.html"', 'href="../e-sign-consent.html"'),
    ('href="../terms-service.html"', 'href="../terms-service.html"'),
    ('href="../privacy-policy.html"', 'href="../privacy-policy.html"'),
    ('<body class="lf-landing"', '<body class="lf-landing" data-lf-lang="en"'),
    (
        'data-src-es="https://meetings-na2.hubspot.com/julie-braunsroth" title="Agendar con Julie"',
        'data-src-es="https://meetings-na2.hubspot.com/julie-braunsroth" '
        'data-src-en="https://meetings-na2.hubspot.com/julie-braunsroth/insurance-consultation-mejor-vida-insurance" '
        'title="Schedule with Julie"',
    ),
]

# Spanish → English (order: longer phrases first where helpful)
EN_STRINGS = [
    ('Obtener cotización gratis', 'Get a free quote'),
    ('Estimado personalizado en minutos', 'Personalized estimate in minutes'),
    ('Calculadora de gastos finales', 'Final expense calculator'),
    ('Estima costos funerarios en tu estado', 'Estimate funeral costs in your state'),
    ('Programar una llamada', 'Schedule a call'),
    ('Agenda una cita con Julie', 'Book time with Julie'),
    (
        'Verás promedios de entierro y cremación para ese estado. Nebraska viene preseleccionado; elige otro estado si planeas fuera de Nebraska.',
        'You will see average burial and cremation costs for that state. Nebraska is pre-selected; choose another state if you are planning outside Nebraska.',
    ),
    ('¿En qué estado vives?', 'What state do you live in?'),
    ('¿Qué tipo de ceremonia prefieres?', 'What type of ceremony do you prefer?'),
    (
        'Esto nos ayuda a estimar costos aproximados de gastos funerarios.',
        'This helps us estimate approximate funeral costs.',
    ),
    ('aria-label="Tipo de ceremonia"', 'aria-label="Ceremony type"'),
    ('>Entierro</button>', '>Burial</button>'),
    ('>Cremación</button>', '>Cremation</button>'),
    ('¿Cuánto podrían costar tus gastos funerarios?', 'How much might your funeral expenses cost?'),
    ('Elige un nivel y ajusta las partidas abajo.', 'Choose a level and adjust the line items below.'),
    ('Nivel de planificación', 'Planning level'),
    ('¿Qué gastos del hogar seguirían para tu familia?', 'What household expenses would your family still face?'),
    (
        'Muchas familias planean al menos 90 días de margen financiero.',
        'Many families plan for at least 90 days of financial cushion.',
    ),
    ('Gastos mensuales', 'Monthly expenses'),
    ('Número de meses', 'Number of months'),
    ('Otros gastos familiares', 'Other family expenses'),
    ('Estimación total de gastos finales', 'Total final expense estimate'),
    (
        'Según tus selecciones, aquí está tu estimación total. Esta herramienta es para planificación — Julie puede ayudarte a elegir cobertura de seguro según tus metas.',
        'Based on your selections, here is your total estimate. This tool is for planning — Julie can help you choose insurance coverage that fits your goals.',
    ),
    ('Total gastos funerarios', 'Total funeral expenses'),
    ('Total gastos familiares', 'Total family expenses'),
    ('Gastos finales totales', 'Total final expenses'),
    ('aria-label="Siguiente paso"', 'aria-label="Next step"'),
    (
        'Las estimaciones son solo para planificación educativa y no son un contrato ni precio garantizado. Licencia de productor en Nebraska #21695431.',
        'Estimates are for educational planning only and are not a contract or guaranteed price. Nebraska producer license #21695431.',
    ),
    ('Empezar de nuevo', 'Start over'),
    ('Usamos tu estado para mostrar aseguradoras y tarifas disponibles.', 'We use your state to show available carriers and rates.'),
    ('<label class="lf-select-label" for="lf-state-combobox-input">Estado</label>', '<label class="lf-select-label" for="lf-state-combobox-input">State</label>'),
    ('Selecciona tu estado.', 'Select your state.'),
    ('Indica tu sexo', 'What is your sex?'),
    (
        'Las aseguradoras lo usan para calcular tu tarifa. Es un requisito legal en la mayoría de los estados.',
        'Carriers use this to calculate your rate. It is a legal requirement in most states.',
    ),
    ('aria-label="Sexo"', 'aria-label="Sex"'),
    ('>Hombre</button>', '>Male</button>'),
    ('>Mujer</button>', '>Female</button>'),
    ('¿Cuál es tu fecha de nacimiento?', 'What is your date of birth?'),
    ('Tu edad es un factor clave para calcular tu tarifa.', 'Your age is a key factor in calculating your rate.'),
    ('Fecha de nacimiento', 'Date of birth'),
    ('Ingresa una fecha válida (mm/dd/aaaa).', 'Enter a valid date (mm/dd/yyyy).'),
    ('¿Has usado tabaco en los últimos 12 meses?', 'Have you used tobacco in the last 12 months?'),
    ('Incluye cigarrillos, puros, vapeo y otros productos con nicotina.', 'Includes cigarettes, cigars, vaping, and other nicotine products.'),
    ('aria-label="Uso de tabaco en los últimos 12 meses"', 'aria-label="Tobacco use in the last 12 months"'),
    ('>Sí</button>', '>Yes</button>'),
    ('¿Cuál es tu nombre?', 'What is your name?'),
    (
        'Esto nos ayuda a verificar tu identidad para darte tu estimado personalizado.',
        'This helps us verify your identity for your personalized estimate.',
    ),
    (
        'aria-label="Información sobre tu estimado y tarifa final con Julie"',
        'aria-label="Information about your estimate and final rate with Julie"',
    ),
    ('Nombre legal', 'Legal first name'),
    ('Apellido legal', 'Legal last name'),
    (
        'Usamos cifrado seguro para proteger tus datos.',
        'We use secure encryption to protect your data.',
    ),
    (
        'Al hacer clic en «Continuar», confirmo que soy el solicitante y que he recibido, leído y acepto:',
        "By clicking 'Continue', I confirm that I am the applicant and that I have received, read, and agree to:",
    ),
    ('Consentimiento de firma electrónica', 'Electronic Signature Consent'),
    ('Términos de uso', 'Terms of Service'),
    ('Política de privacidad', 'Privacy Policy'),
    (' y\n          <a href="../privacy-policy.html"', ' and\n          <a href="../privacy-policy.html"'),
    ('¿Cuál es tu correo electrónico?', 'What is your email address?'),
    ('Correo electrónico', 'Email'),
    ('placeholder="tu@ejemplo.com"', 'placeholder="you@example.com"'),
    ('Ingresa un correo electrónico válido.', 'Enter a valid email address.'),
    ('¿Cuál es tu número de teléfono?', 'What is your phone number?'),
    ('Julie usará este número para dar seguimiento a tu cotización.', 'Julie will use this number to follow up on your quote.'),
    ('Número de teléfono', 'Phone number'),
    ('Ingresa un número de teléfono válido de 10 dígitos en EE. UU.', 'Enter a valid 10-digit U.S. phone number.'),
    ('Te garantizamos: sin correo basura. Sin llamadas spam.', 'Our guarantee: No junk mail. No spam calls.'),
    ('Tus mejores tarifas podrían no durar para siempre', 'Your best rates may not last forever'),
    (
        'La edad y los cambios de salud pueden afectar las opciones futuras.',
        'Age and health changes can affect future options.',
    ),
    ('aria-label="Progreso de cotización"', 'aria-label="Quote progress"'),
    ('>Información</span>', '>Information</span>'),
    ('>Tu estimación</span>', '>Your estimate</span>'),
    ('>Agendar con Julie</span>', '>Schedule with Julie</span>'),
    ('>Detalles</h3>', '>Details</h3>'),
    (
        'Las pólizas de vida entera de gastos finales que comparamos ofrecen estos beneficios:',
        'All whole life final expense plans we compare offer these benefits:',
    ),
    ('Las primas no aumentan', 'Premiums never increase'),
    ('La cobertura no disminuye', 'Coverage never decreases'),
    ('La póliza no vence', 'Policy never expires'),
    (
        'Sin examen médico para calificar (en la mayoría de los casos)',
        'No medical exam to qualify (for most cases)',
    ),
    ('Sin dinero por adelantado', 'No money due upfront'),
    ('>Ver más ', '>See more '),
    ('Mejor precio estimado para ti', 'Your lowest estimated rate'),
    ('<p class="mvi-result-per-month mb-0">al mes</p>', '<p class="mvi-result-per-month mb-0">per month</p>'),
    (
        '<span class="mvi-result-price-for" style="font-size:1rem;font-weight:600;color:#64748b;">por</span>',
        '<span class="mvi-result-price-for" style="font-size:1rem;font-weight:600;color:#64748b;">for</span>',
    ),
    (
        '<p class="mvi-result-quote-coverage-label mb-0">de cobertura</p>',
        '<p class="mvi-result-quote-coverage-label mb-0">coverage</p>',
    ),
    (
        'Reserva tu mejor precio <strong>hoy</strong>. La edad y los cambios de salud pueden limitar las opciones disponibles mañana.',
        'Lock in your best price <strong>today</strong>. Age and health changes can limit what is available tomorrow.',
    ),
    ('aria-label="Más opciones"', 'aria-label="More options"'),
    ('Tu tarifa según estos datos', 'Your rate based on this information'),
    ('>Nacimiento</th>', '>Date of birth</th>'),
    ('>Edad</th>', '>Age</th>'),
    ('>Sexo</th>', '>Sex</th>'),
    ('>Estado</th>', '>State</th>'),
    ('>Tabaco</th>', '>Tobacco</th>'),
    ('Cobertura deseada', 'Desired coverage'),
    (
        '<strong>Importante:</strong> Lo que ves aquí es solo un <strong>estimado orientativo</strong>, no el precio final de tu póliza. En tu llamada con Julie recibirás la <strong>cotización oficial</strong> según tu edad, salud y aseguradora — y, si calificas, podrás <strong>reservar y bloquear</strong> esa tarifa.',
        '<strong>Important:</strong> What you see here is only a <strong>reference estimate</strong>, not your final policy price. On your call with Julie you will receive the <strong>official quote</strong> based on your age, health, and carrier — and, if you qualify, you can <strong>lock in</strong> that rate.',
    ),
    (
        'El precio del seguro de vida es personal; las tarifas dependen de tu situación.',
        'Life insurance pricing is personal; rates depend on your situation.',
    ),
    (
        'Mejor Vida facilita este proceso. Responde unas preguntas y te daremos un estimado personalizado.',
        'Mejor Vida makes this process simple. Answer a few questions and we will give you a personalized estimate.',
    ),
    (
        '<li><strong>Tarifa final:</strong> El costo exacto de tu póliza, confirmado en una llamada con Julie cuando se verifiquen tus datos.</li>',
        '<li><strong>Final rate:</strong> The exact cost of your policy, confirmed on a call with Julie once your information is verified.</li>',
    ),
    (
        'aria-label="Conozca la historia de Julie Braunsroth"',
        'aria-label="Meet Julie Braunsroth — read her story"',
    ),
    ('Agente de seguros licenciada en Nebraska', 'Licensed Nebraska insurance agent'),
    ('Licencia de productor #21695431', 'Producer license #21695431'),
    ('<span>Inglés</span> · <span>Español</span>', '<span>English</span> · <span>Spanish</span>'),
    ('Conozca a Julie', 'Meet Julie'),
    ('aria-label="Cerrar"', 'aria-label="Close"'),
    ('Agendar cita con Julie', 'Schedule an appointment with Julie'),
    ('title="Agendar con Julie"', 'title="Schedule with Julie"'),
    ('Seguro de vida entera', 'Whole life insurance'),
    (
        'Las pólizas de emisión garantizada pueden requerir un período de espera de 2 años para que se pague el beneficio completo.',
        'Guaranteed issue plans may require a 2-year waiting period before the full benefit is payable.',
    ),
    (
        'Las pólizas de cobertura inmediata no tienen período de espera para que comience la cobertura.',
        'Immediate coverage plans do not involve a waiting period before coverage begins.',
    ),
]

JULIE_BIO_MODAL_BODY_EN = """
          <p class="lf-julie-bio-modal-lead">Founder of Mejor Vida Insurance LLC · Licensed Nebraska insurance agent</p>
          <p>Born and raised in Bogotá, Colombia, Julie has always had a deep passion for serving and supporting the Hispanic community. After meeting her husband in Colombia, they moved to Nebraska to build a new life together.</p>
          <p>She arrived in the United States without speaking English, without knowing how to drive, and without extended family nearby—only her husband, a new culture to discover, and new beginnings to face. Like many immigrant families, she learned to adapt, grow, and move forward one step at a time.</p>
          <h3 class="lf-julie-bio-modal-heading">A path of service</h3>
          <p>Her service journey began with Hispanic mothers through MilkWorks, later with local libraries promoting literacy through bilingual reading programs, and eventually helping launch MyBridge Radio Español, a Christian radio station in Nebraska.</p>
          <figure class="lf-julie-bio-modal-photo">
            <img src="../../img/julie-community-mothers-children.png" alt="Julie smiling with mothers and young children in a community setting." width="1024" height="572" loading="lazy" decoding="async" />
          </figure>
          <h3 class="lf-julie-bio-modal-heading">Her mission today</h3>
          <p>Today, Julie helps families understand life insurance and final expense planning—and how to protect the people they love most.</p>
          <h3 class="lf-julie-bio-modal-heading">Why this work is personal</h3>
          <p>When Julie's father passed away, he had final expense coverage, but it was not enough for all the costs her family faced. She also saw how her mother's long-term planning became a final act of love when the time came.</p>
          <figure class="lf-julie-bio-modal-photo lf-julie-bio-modal-photo--portrait">
            <img src="../../img/julie-parents-embrace.png" alt="An older couple smiling and embracing warmly." width="681" height="1024" loading="lazy" decoding="async" />
          </figure>
          <p class="mb-0">Julie is ready to serve your family with the same care and understanding that shaped her own story. <a href="../about-julie.html">Read her full bio</a>.</p>
          <figure class="lf-julie-bio-modal-map">
            <img src="../../img/nebraska-lancaster.svg" alt="Map of Nebraska highlighting the Lincoln area—Julie's home base for family and clients." width="200" height="92" loading="lazy" decoding="async" />
            <figcaption>This is Julie's home base for caring for her family and her clients.</figcaption>
          </figure>
"""

COMPLIANCE_NOTICE = """
    <div class="alert alert-info mx-3 mt-2 mb-0 small" role="note" style="max-width:40rem;margin-left:auto;margin-right:auto;">
      <strong>10DLC compliance (English):</strong> This page mirrors our final expense quote landing SMS opt-in.
      Reviewers: choose <strong>Get a free quote</strong>, complete the steps, or open
      <a href="?compliance-preview=phone">phone step preview</a> to view the optional SMS checkbox on step 13.
      Primary opt-in URL for registration: <code>/en/quote.html</code> and this page.
    </div>
"""

SCRIPT_VERSION = "20260529a"


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    for old, new in STRUCTURAL_REPLACEMENTS:
        text = text.replace(old, new)
    for old, new in EN_STRINGS:
        text = text.replace(old, new)

    text = re.sub(
        r'<label class="lf-sms-optin-text" for="lf-sms-consent">.*?</label>',
        f'<label class="lf-sms-optin-text" for="lf-sms-consent">{SMS_EN}</label>',
        text,
        count=1,
        flags=re.DOTALL,
    )

    text = re.sub(
        r'(<div class="modal-body pt-2 lf-julie-bio-modal-body">).*?(</div>\s*</div>\s*</div>\s*</div>\s*<div class="modal fade" id="lf-policy-modal")',
        r"\1" + JULIE_BIO_MODAL_BODY_EN + r"\2",
        text,
        count=1,
        flags=re.DOTALL,
    )

    if COMPLIANCE_NOTICE.strip() not in text:
        text = text.replace("<main class=" + '"lf-main">' + "", "<main class=" + '"lf-main">' + COMPLIANCE_NOTICE, 1)

    text = text.replace('src="../js/', 'src="../../js/')
    text = text.replace('src="js/', 'src="../../gastos-finales-ads-v2/js/')
    text = text.replace('src="../bootstrap/', 'src="../../bootstrap/')
    text = re.sub(r"\?v=[^\"]+\"", f'?v={SCRIPT_VERSION}"', text)

    if 'rel="canonical"' not in text:
        text = text.replace(
            "</title>",
            '</title>\n  <link rel="canonical" href="https://www.mejorvidainsurance.com/en/gastos-finales-ads-v2/" />',
            1,
        )

    DST.parent.mkdir(parents=True, exist_ok=True)
    DST.write_text(text, encoding="utf-8")
    print("Wrote", DST)


if __name__ == "__main__":
    main()
