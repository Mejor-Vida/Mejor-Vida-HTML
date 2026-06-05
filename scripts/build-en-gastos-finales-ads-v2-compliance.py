#!/usr/bin/env python3
"""One-off: English 10DLC compliance mirror of gastos-finales-ads-v2/index.html."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "gastos-finales-ads-v2" / "index.html"
DST = ROOT / "en" / "gastos-finales-ads-v2" / "index.html"

SMS_EN = (
    "Yes, I agree to receive SMS text messages from Mejor Vida Insurance LLC about insurance options. "
    "Frequency: 1–5 messages per week. Msg &amp; data rates may apply. Reply STOP to cancel. "
    "Consent is not required to get a quote or purchase insurance. "
    "SMS is delivered via authorized providers including Telnyx. "
    '<a href="../privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> · '
    '<a href="../terms-service.html" target="_blank" rel="noopener noreferrer">Terms of Service</a>.'
)

REPLACEMENTS = [
    ('<html lang="es">', '<html lang="en">'),
    ('<meta name="robots" content="noindex, nofollow" />',
     '<meta name="robots" content="index, follow" />'),
    ('content="Tu estimado personalizado de seguro de gastos finales con Mejor Vida Insurance en Nebraska."',
     'content="Free final expense insurance quote from Mejor Vida Insurance in Nebraska. English compliance mirror of our quote landing for SMS opt-in review."'),
    ('content="final-expense-es-v2"', 'content="final-expense-en-v2-compliance"'),
    ('<!-- Meta Pixel Code -->', '<!-- Meta Pixel omitted on English compliance landing -->'),
    ('<script defer src="/js/meta-pixel-landing.js"></script>', ''),
    ('<noscript><img alt="" height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=873141755808233&amp;ev=PageView&amp;noscript=1" /></noscript>', ''),
    ('<!-- End Meta Pixel Code -->', ''),
    ('<title>Seguro de gastos finales | Mejor Vida Insurance</title>',
     '<title>Final Expense Insurance Quote | Mejor Vida Insurance</title>'),
    ('href="../favicon.ico"', 'href="../../favicon.ico"'),
    ('href="../bootstrap/', 'href="../../bootstrap/'),
    ('href="../css/quote-flow-shared.css"', 'href="../../css/quote-flow-shared.css"'),
    ('href="css/', 'href="../../gastos-finales-ads-v2/css/'),
    ('src="../img/logo-spanish2.png"', 'src="../../img/logo-english2.png"'),
    ('aria-label="Volver al inicio de esta página"', 'aria-label="Return to start of this page"'),
    ('<span class="lf-help-label">¿Necesitas ayuda?</span>',
     '<span class="lf-help-label">Need help?</span>'),
    ('text=Hola%2C%20me%20interes%C3%B3%20conocer%20el%20seguro%20de%20gastos%20finales.',
     'text=Hello%2C%20I%20am%20interested%20in%20learning%20about%20final%20expense%20insurance.'),
    ('aria-label="WhatsApp con Mejor Vida"', 'aria-label="WhatsApp Mejor Vida"'),
    ('aria-label="Progreso"', 'aria-label="Progress"'),
    ('hidden>¿Listo para aprender más de gastos finales?</h1>',
     'hidden>Ready to learn more about final expense insurance?</h1>'),
    ('aria-label="Volver al paso anterior">← Atrás</button>',
     'aria-label="Go back to previous step">← Back</button>'),
    ('aria-label="Elige cómo continuar"', 'aria-label="Choose how to continue"'),
    ('Obtener cotización gratis', 'Get a free quote'),
    ('Estimado personalizado en minutos', 'Personalized estimate in minutes'),
    ('Calculadora de gastos finales', 'Final expense calculator'),
    ('Estima costos funerarios en tu estado', 'Estimate funeral costs in your state'),
    ('Programar una llamada', 'Schedule a call'),
    ('Agenda una cita con Julie', 'Book time with Julie'),
    ('disabled>Siguiente</button>', 'disabled>Next</button>'),
    ('src="img/', 'src="../../gastos-finales-ads-v2/img/'),
    ('src="../img/julie-headshot.png"', 'src="../../img/julie-headshot.png"'),
    ('href="../en/e-sign-consent.html"', 'href="../e-sign-consent.html"'),
    ('href="../terms-service.html"', 'href="../terms-service.html"'),
    ('href="../privacy-policy.html"', 'href="../privacy-policy.html"'),
    ('<body class="lf-landing"', '<body class="lf-landing" data-lf-lang="en"'),
]

# SMS label: replace entire Spanish block
SMS_ES_START = '<label class="lf-sms-optin-text" for="lf-sms-consent">'
if SMS_ES_START in open(SRC, encoding="utf-8").read():
    pass

def main():
    text = SRC.read_text(encoding="utf-8")
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    # Replace SMS opt-in label (Spanish paragraph)
    import re
    text = re.sub(
        r'<label class="lf-sms-optin-text" for="lf-sms-consent">.*?</label>',
        f'<label class="lf-sms-optin-text" for="lf-sms-consent">{SMS_EN}</label>',
        text,
        count=1,
        flags=re.DOTALL,
    )
    # Compliance notice after <main>
    notice = '''
    <div class="alert alert-info mx-3 mt-2 mb-0 small" role="note" style="max-width:40rem;margin-left:auto;margin-right:auto;">
      <strong>10DLC compliance (English):</strong> This page mirrors our final expense quote landing SMS opt-in.
      Reviewers: choose <strong>Get a free quote</strong>, complete the steps, or open
      <a href="?compliance-preview=phone">phone step preview</a> to view the optional SMS checkbox on step 13.
      Primary opt-in URL for registration: <code>/en/quote.html</code> and this page.
    </div>
'''
    text = text.replace('<main class="lf-main">', '<main class="lf-main">' + notice, 1)
    # Script paths
    text = text.replace('src="../js/', 'src="../../js/')
    text = text.replace('src="js/', 'src="../../gastos-finales-ads-v2/js/')
    text = text.replace('?v=20260605g"', '?v=20260606c"')
    # Canonical
    if 'rel="canonical"' not in text:
        text = text.replace(
            '</title>',
            '</title>\n  <link rel="canonical" href="https://www.mejorvidainsurance.com/en/gastos-finales-ads-v2/" />',
            1,
        )
    DST.parent.mkdir(parents=True, exist_ok=True)
    DST.write_text(text, encoding="utf-8")
    print("Wrote", DST)

if __name__ == "__main__":
    main()
