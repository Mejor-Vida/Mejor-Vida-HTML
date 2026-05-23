#!/usr/bin/env python3
"""Build English /en/ mirror pages from Spanish root sources."""

from __future__ import annotations

import copy
import re
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

ROOT = Path(__file__).resolve().parents[1]
EN_DIR = ROOT / "en"
INCLUDES = ROOT / "includes"
BASE = "https://www.mejorvidainsurance.com"

EN_HEADER = (INCLUDES / "en-site-header.html").read_text(encoding="utf-8")
EN_FOOTER = (INCLUDES / "en-site-footer.html").read_text(encoding="utf-8")

EN_MOBILE_MENU_JS = """
  <script>
    (function () {
      var y = document.getElementById('year');
      if (y) y.textContent = new Date().getFullYear();
      var hamburgerBtn = document.getElementById('hamburger-btn');
      var mobileMenu = document.getElementById('mobile-menu');
      if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          mobileMenu.classList.toggle('active');
          hamburgerBtn.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
        });
        document.addEventListener('click', function (e) {
          if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
            hamburgerBtn.textContent = '☰';
          }
        });
        mobileMenu.querySelectorAll('a').forEach(function (link) {
          link.addEventListener('click', function () {
            mobileMenu.classList.remove('active');
            hamburgerBtn.textContent = '☰';
          });
        });
      }
    })();
  </script>
"""

# Spanish filename -> English /en/ filename
PAGE_MAP = {
    "index.html": "index.html",
    "quote.html": "quote.html",
    "about-julie.html": "about-julie.html",
    "contact.html": "contact.html",
    "blog.html": "blog.html",
    "final-expense-estimator.html": "final-expense-estimator.html",
    "landing-gastos-finales.html": "landing-final-expense.html",
}

COPY_PAGES = {
    "privacy-policy-en.html": "privacy-policy.html",
    "terms-service-en.html": "terms-service.html",
    "sms-optin.html": "sms-optin.html",
}

PAGE_SEO = {
    "index.html": {
        "title": "Final Expense Insurance | Mejor Vida Insurance",
        "description": "Protect your family with final expense life insurance. Start with a free online quote or WhatsApp. Licensed Nebraska agent Julie serves English and Spanish speakers.",
        "og_image": "/img/hero-couple-embrace.png",
    },
    "quote.html": {
        "title": "Free Online Final Expense Quote | Mejor Vida Insurance",
        "description": "Get a free final expense insurance quote online in minutes. No obligation. Licensed Nebraska agent Julie compares trusted carriers for your situation.",
        "og_image": "/img/hero-couple-embrace.png",
    },
    "about-julie.html": {
        "title": "About Julie | Mejor Vida Insurance",
        "description": "Meet Julie, a licensed final expense insurance agent in Nebraska serving the Hispanic community and English-speaking families across the state.",
        "og_image": "/img/julie-headshot.png",
    },
    "contact.html": {
        "title": "Contact Us | Mejor Vida Insurance",
        "description": "Contact Mejor Vida Insurance by phone, WhatsApp, email, or schedule a call with Julie about final expense coverage in Nebraska.",
        "og_image": "/img/logo-english2.png",
    },
    "blog.html": {
        "title": "Final Expense Insurance Blog | Mejor Vida Insurance",
        "description": "Weekly updates on final expense and life insurance news, tips, and guidance from Mejor Vida Insurance in Nebraska.",
        "og_image": "/img/logo-english2.png",
    },
    "final-expense-estimator.html": {
        "title": "Final Expense Calculator | Mejor Vida Insurance",
        "description": "Estimate funeral and final expense costs by state in under 60 seconds. Free planning tool from Mejor Vida Insurance.",
        "og_image": "/img/logo-english2.png",
    },
    "landing-final-expense.html": {
        "title": "Final Expense Insurance Nebraska | Mejor Vida Insurance",
        "description": "Affordable final expense insurance in Nebraska. Free quote online or by WhatsApp. Julie helps you compare trusted carriers.",
        "og_image": "/img/hero-couple-embrace.png",
    },
    "privacy-policy.html": {
        "title": "Privacy Policy | Mejor Vida Insurance",
        "description": "Privacy Policy for Mejor Vida Insurance LLC, including SMS and text messaging practices, opt-in, opt-out, and TCPA compliance.",
        "og_image": "/img/logo-english2.png",
    },
    "terms-service.html": {
        "title": "Terms of Service | Mejor Vida Insurance",
        "description": "Terms of Service for Mejor Vida Insurance LLC website, quotes, SMS program, and insurance information services.",
        "og_image": "/img/logo-english2.png",
    },
    "sms-optin.html": {
        "title": "SMS Opt-In Disclosure | Mejor Vida Insurance",
        "description": "SMS and text message opt-in disclosure for Mejor Vida Insurance LLC: how to subscribe, message frequency, opt-out (STOP), rates, and privacy.",
        "og_image": "/img/logo-english2.png",
    },
}

# Spanish public path (for hreflang) -> en filename
HREFLANG_ES = {
    "index.html": "/",
    "quote.html": "/quote.html",
    "about-julie.html": "/about-julie.html",
    "contact.html": "/contact.html",
    "blog.html": "/blog.html",
    "final-expense-estimator.html": "/final-expense-estimator.html",
    "landing-final-expense.html": "/landing-gastos-finales.html",
    "privacy-policy.html": "/privacy-policy.html",
    "terms-service.html": "/terms-service.html",
    "sms-optin.html": "/sms-optin.html",
}

INTERNAL_LINKS = {
    "index.html": "/en/index.html",
    "/index.html": "/en/index.html",
    "quote.html": "/en/quote.html",
    "/quote.html": "/en/quote.html",
    "about-julie.html": "/en/about-julie.html",
    "/about-julie.html": "/en/about-julie.html",
    "contact.html": "/en/contact.html",
    "/contact.html": "/en/contact.html",
    "blog.html": "/en/blog.html",
    "/blog.html": "/en/blog.html",
    "final-expense-estimator.html": "/en/final-expense-estimator.html",
    "/final-expense-estimator.html": "/en/final-expense-estimator.html",
    "landing-gastos-finales.html": "/en/landing-final-expense.html",
    "/landing-gastos-finales.html": "/en/landing-final-expense.html",
    "landing-final-expense.html": "/en/landing-final-expense.html",
    "privacy-policy.html": "/en/privacy-policy.html",
    "/privacy-policy.html": "/en/privacy-policy.html",
    "privacy-policy-en.html": "/en/privacy-policy.html",
    "/privacy-policy-en.html": "/en/privacy-policy.html",
    "terms-service.html": "/en/terms-service.html",
    "/terms-service.html": "/en/terms-service.html",
    "terms-service-en.html": "/en/terms-service.html",
    "/terms-service-en.html": "/en/terms-service.html",
    "sms-optin.html": "/en/sms-optin.html",
    "/sms-optin.html": "/en/sms-optin.html",
}


EN_INDEX_FAQ_LD = """{
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is final expense insurance?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Final expense insurance is a type of life insurance designed to cover funeral, burial, medical bills, and other small end-of-life costs so your family is not left with the full financial burden."
        }
      },
      {
        "@type": "Question",
        "name": "How much does final expense insurance cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cost depends on your age, health, and coverage amount. Premiums are often affordable and stay level for life. Request a free personalized quote online or by WhatsApp."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need a medical exam to qualify?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "In many cases, no medical exam is required. Many final expense policies use simplified health questionnaires. Carriers may offer different acceptance levels based on your answers and history."
        }
      },
      {
        "@type": "Question",
        "name": "Which insurance companies does Mejor Vida Insurance work with?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "As an independent agent, Julie works with well-known carriers including Assurity, Mutual of Omaha, and American Amicable to compare options for your situation and budget."
        }
      },
      {
        "@type": "Question",
        "name": "How long does it take to get a policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The process can move quickly. After you complete the quote form and Julie reviews your information, many policies can be approved within days depending on the carrier and your health."
        }
      },
      {
        "@type": "Question",
        "name": "Do you offer service in Spanish?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Julie offers personalized help in both Spanish and English so you can understand your options clearly in the language you prefer."
        }
      }
    ]
  }"""


def remove_comments(soup: BeautifulSoup) -> None:
    for node in soup.find_all(string=lambda t: isinstance(t, Comment)):
        node.extract()


def remove_lang_toggle_ui(soup: BeautifulSoup) -> None:
    for el in soup.find_all(attrs={"data-lang-btn": True}):
        el.decompose()
    for wrap in soup.select(".header-actions .d-flex.gap-1"):
        if not wrap.find(True):
            wrap.decompose()


def strip_bilingual(soup: BeautifulSoup) -> None:
    for el in list(soup.find_all(attrs={"data-lang": "es"})):
        el.decompose()
    for el in soup.find_all(attrs={"data-lang": "en"}):
        if "data-lang" in el.attrs:
            del el.attrs["data-lang"]
    remove_lang_toggle_ui(soup)


def strip_bilingual_css_rules(css: str) -> str:
    """Remove language-toggle rules only; keep the rest of a shared stylesheet."""
    css = re.sub(
        r'\s*html\.lang-es\s+\[data-lang="en"\]\s*\{[^}]*\}',
        "",
        css,
    )
    css = re.sub(
        r'\s*html\.lang-en\s+\[data-lang="es"\]\s*\{[^}]*\}',
        "",
        css,
    )
    return css


def remove_lang_scripts(soup: BeautifulSoup) -> None:
    for script in soup.find_all("script"):
        txt = script.string or ""
        if "sessionLang" in txt or "data-lang-btn" in txt or "setLanguage" in txt:
            if "hamburger-btn" not in txt or "sessionLang" in txt:
                script.decompose()
    for style in soup.find_all("style"):
        txt = style.string or ""
        if "html.lang-es" in txt or "html.lang-en" in txt:
            style.string = strip_bilingual_css_rules(txt)


def absolutize_assets(html: str) -> str:
    for prefix in ("bootstrap/", "css/", "js/", "img/", "favicon.ico"):
        html = re.sub(
            rf'((?:href|src)=["\'])(?!https?:|/|#|mailto:|tel:|data:)({re.escape(prefix)})',
            rf"\1/\2",
            html,
        )
    return html


def rewrite_internal_links(html: str) -> str:
    def repl_href(m: re.Match) -> str:
        val = m.group(2)
        base = val.split("#")[0].split("?")[0]
        frag = val[len(base) :] if "#" in val or "?" in val else ""
        mapped = None
        if base in INTERNAL_LINKS:
            mapped = INTERNAL_LINKS[base]
        elif base.startswith("/") and base.lstrip("/") in INTERNAL_LINKS:
            mapped = INTERNAL_LINKS[base.lstrip("/")]
        if mapped:
            return f"{m.group(1)}{mapped}{frag}{m.group(3)}"
        return m.group(0)

    html = re.sub(r'(href=["\'])([^"\']+)(["\'])', repl_href, html)
    return html


def replace_header_footer(soup: BeautifulSoup, *, skip_header: bool = False) -> None:
    header = soup.find("header")
    footer = soup.find("footer")
    if header and not skip_header:
        header.replace_with(BeautifulSoup(EN_HEADER, "html.parser"))
    if footer:
        footer.replace_with(BeautifulSoup(EN_FOOTER, "html.parser"))


def inject_seo(soup: BeautifulSoup, en_file: str, es_key: str) -> None:
    seo = PAGE_SEO[en_file]
    head = soup.find("head")
    if not head:
        return

    es_path = HREFLANG_ES[en_file]
    en_url = f"{BASE}/en/" if en_file == "index.html" else f"{BASE}/en/{en_file}"
    es_url = f"{BASE}{es_path if es_path != '/' else '/'}"

    if soup.html:
        soup.html["lang"] = "en"
    if soup.body and soup.body.get("class"):
        classes = [c for c in soup.body["class"] if not c.startswith("lang-")]
        soup.body["class"] = classes

    for tag_name, attr in [("meta", "name"), ("meta", "property")]:
        pass

    for meta in head.find_all("meta"):
        if meta.get("name") == "robots" and "noindex" in (meta.get("content") or ""):
            meta["content"] = "index, follow"
    desc = head.find("meta", attrs={"name": "description"})
    if desc:
        desc["content"] = seo["description"]
    else:
        m = soup.new_tag("meta", attrs={"name": "description", "content": seo["description"]})
        head.append(m)
    for meta in head.find_all("meta"):
        if meta.get("property") == "og:title":
            meta["content"] = seo["title"]
        if meta.get("property") == "og:description":
            meta["content"] = seo["description"]
        if meta.get("property") == "og:url":
            meta["content"] = en_url
        if meta.get("property") == "og:locale":
            meta["content"] = "en_US"
        if meta.get("name") == "twitter:title":
            meta["content"] = seo["title"]
        if meta.get("name") == "twitter:description":
            meta["content"] = seo["description"]

    title = head.find("title")
    if title:
        title.string = seo["title"]

    canonical = head.find("link", rel="canonical")
    if canonical:
        canonical["href"] = en_url
    else:
        head.append(soup.new_tag("link", rel="canonical", href=en_url))

    for link in head.find_all("link", rel="alternate"):
        link.decompose()

    head.append(soup.new_tag("link", rel="alternate", hreflang="es", href=es_url))
    head.append(soup.new_tag("link", rel="alternate", hreflang="en", href=en_url))
    head.append(soup.new_tag("link", rel="alternate", hreflang="x-default", href=es_url))

    if not head.find("meta", property="og:title"):
        m = soup.new_tag("meta")
        m["property"] = "og:title"
        m["content"] = seo["title"]
        head.append(m)
    if not head.find("meta", property="og:description"):
        m = soup.new_tag("meta")
        m["property"] = "og:description"
        m["content"] = seo["description"]
        head.append(m)
    if not head.find("meta", property="og:url"):
        m = soup.new_tag("meta")
        m["property"] = "og:url"
        m["content"] = en_url
        head.append(m)
    if not head.find("meta", property="og:type"):
        m = soup.new_tag("meta")
        m["property"] = "og:type"
        m["content"] = "website"
        head.append(m)
    og_img = seo.get("og_image", "/img/logo-english2.png")
    if not head.find("meta", property="og:image"):
        m = soup.new_tag("meta")
        m["property"] = "og:image"
        m["content"] = f"{BASE}{og_img}"
        head.append(m)


def fix_quote_page(soup: BeautifulSoup) -> None:
    consent = soup.find("input", id="ql-sms-consent")
    if consent:
        consent.attrs.pop("checked", None)
    label = soup.find("label", attrs={"for": "ql-sms-consent"})
    if label:
        label.clear()
        label.append(
            'Yes, I agree to receive SMS text messages from Mejor Vida Insurance LLC about insurance options. '
            "Frequency: 1–5 messages per week. Msg & data rates may apply. Reply STOP to cancel. "
            "Consent is not required to get a quote or purchase insurance."
        )
        a = soup.new_tag("a", href="/en/privacy-policy.html")
        a.string = " Privacy Policy"
        label.append(a)
        label.append(".")


def fix_sms_optin(html: str) -> str:
    html = re.sub(
        r"https://www\.mejorvidainsurance\.com/quote\.html",
        "https://www.mejorvidainsurance.com/en/quote.html",
        html,
    )
    html = re.sub(
        r"https://www\.mejorvidainsurance\.com/landing-gastos-finales\.html",
        "https://www.mejorvidainsurance.com/en/quote.html",
        html,
    )
    html = re.sub(
        r"https://www\.mejorvidainsurance\.com/en/landing-final-expense\.html",
        "https://www.mejorvidainsurance.com/en/quote.html",
        html,
    )
    html = re.sub(
        r"https://www\.mejorvidainsurance\.com/privacy-policy-en\.html",
        "https://www.mejorvidainsurance.com/en/privacy-policy.html",
        html,
    )
    html = re.sub(
        r"https://www\.mejorvidainsurance\.com/terms-service-en\.html",
        "https://www.mejorvidainsurance.com/en/terms-service.html",
        html,
    )
    # How You Opt In — quote form URL only (A2P compliance)
    html = re.sub(
        r"<h2>How You Opt In</h2>.*?<ul>.*?</ul>",
        (
            "<h2>How You Opt In</h2>\n"
            "<p>\n"
            "      You may opt in by providing your mobile phone number and <strong>optionally</strong> checking the SMS consent box on one of our online quote forms before you submit. The checkbox is <strong>not required</strong> to submit the form or receive a quote. Express written SMS consent is recorded only when you check the box and submit. Consent is not a condition of purchasing insurance where prohibited by law.\n"
            "    </p>\n"
            "<ul>\n"
            '<li><strong>Free online quote (Nebraska):</strong> <a href="https://www.mejorvidainsurance.com/en/quote.html">https://www.mejorvidainsurance.com/en/quote.html</a></li>\n'
            "</ul>"
        ),
        html,
        count=1,
        flags=re.DOTALL,
    )
    html = html.replace("Privacy Policy (English)", "Privacy Policy")
    html = html.replace("Terms of Service (English)", "Terms of Service")
    return html


def fix_contact_page(soup: BeautifulSoup) -> None:
    for btn in soup.find_all("a", href="quote.html"):
        btn["href"] = "/en/quote.html"
        if "Cotización" in btn.get_text():
            btn.string = "Get a Quote"


def set_lang_en_html(soup: BeautifulSoup) -> None:
    html_tag = soup.find("html")
    if html_tag:
        html_tag["lang"] = "en"
        html_tag["class"] = "lang-en"


def post_process_html(html: str, dest_name: str) -> str:
    html = re.sub(r"</link>", "", html)
    html = re.sub(r"(<link[^>]+rel=\"stylesheet\"[^>]*)(?<!\/)>", r"\1 />", html)
    remove_comments_soup = BeautifulSoup(html, "html.parser")
    remove_comments(remove_comments_soup)
    html = str(remove_comments_soup)

    if dest_name == "index.html":
        html = re.sub(
            r'<script type="application/ld\+json">\s*\{[^<]*"@type": "FAQPage"[^<]*\}\s*</script>',
            f'<script type="application/ld+json">\n  {EN_INDEX_FAQ_LD}\n  </script>',
            html,
            count=1,
            flags=re.DOTALL,
        )
        html = html.replace(
            '"description": "Mejor Vida Insurance ofrece seguros de gastos finales personalizados y asequibles para proteger a tu familia. Servicio en español e inglés."',
            '"description": "Mejor Vida Insurance offers personalized, affordable final expense insurance to protect your family. Service in English and Spanish."',
        )

    if dest_name == "blog.html":
        html = html.replace(
            '"name": "Consejos Semanales | Mejor Vida Insurance Blog"',
            '"name": "Weekly Tips | Mejor Vida Insurance Blog"',
        )
        html = html.replace(
            '"headline": "Consejos Semanales sobre Seguros y Protección Familiar"',
            '"headline": "Weekly Tips on Insurance and Family Protection"',
        )

    html = re.sub(r'<script src="script\.js"></script>', "", html)
    if dest_name == "index.html":
        if '<script src="/script.js"></script>' not in html:
            html = html.replace(
                '<script src="/js/hero-quotes-data.js"></script>',
                '<script src="/js/hero-quotes-data.js"></script>\n<script src="/script.js"></script>',
            )

    if dest_name == "final-expense-estimator.html":
        init = (
            '<script>document.documentElement.className="lang-en";</script>'
        )
        if init not in html:
            html = html.replace("</head>", init + "\n</head>", 1)

    if EN_MOBILE_MENU_JS.strip() in html:
        parts = html.split(EN_MOBILE_MENU_JS.strip())
        html = parts[0] + (EN_MOBILE_MENU_JS if len(parts) > 1 else "")

    return html


def apply_landing_translations(html: str) -> str:
    import json

    strings_path = ROOT / "tools" / "landing_en_strings.json"
    pairs = json.loads(strings_path.read_text(encoding="utf-8"))
    for item in pairs:
        html = html.replace(item["es"], item["en"])
    return html


def inject_english_bio_landing(soup: BeautifulSoup) -> None:
    about = BeautifulSoup((ROOT / "about-julie.html").read_text(encoding="utf-8"), "html.parser")
    strip_bilingual(about)
    article = about.find("article")
    bio = soup.find("article", class_="lp-bio-body")
    if article and bio:
        bio.clear()
        for child in list(article.children):
            bio.append(copy.copy(child))


def build_landing() -> None:
    src = ROOT / "landing-gastos-finales.html"
    soup = BeautifulSoup(src.read_text(encoding="utf-8"), "html.parser")
    strip_bilingual(soup)
    remove_lang_scripts(soup)
    remove_comments(soup)

    html_tag = soup.find("html")
    if html_tag:
        html_tag["lang"] = "en"
        html_tag["class"] = "lang-en"

    logo = soup.select_one(".lp-logo img")
    if logo:
        logo["src"] = "/img/logo-english2.png"
    wa = soup.select_one('a.lp-btn-wa[href*="wa.me"]')
    if wa:
        wa["href"] = (
            "https://wa.me/14024405438?text=Hello%2C%20I%20saw%20your%20final%20expense%20"
            "insurance%20page%20and%20would%20like%20more%20information."
        )

    actions = soup.select_one(".lp-header-actions")
    if actions and not soup.find("a", href="/"):
        esp = soup.new_tag("a", href="/", **{"class": "lp-btn lp-btn-schedule", "style": "font-size:0.78rem;padding:0.45rem 0.72rem;"})
        esp.string = "Español"
        actions.append(esp)

    inject_english_bio_landing(soup)
    inject_seo(soup, "landing-final-expense.html", "landing-gastos-finales.html")

    footer = soup.find("footer")
    if footer:
        footer.replace_with(BeautifulSoup(EN_FOOTER, "html.parser"))

    out = str(soup)
    out = apply_landing_translations(out)
    out = absolutize_assets(out)
    out = rewrite_internal_links(out)
    out = fix_sms_optin(out)
    out = post_process_html(out, "landing-final-expense.html")

    dest = EN_DIR / "landing-final-expense.html"
    final = out if out.lstrip().startswith("<!DOCTYPE") else "<!DOCTYPE html>\n" + out
    dest.write_text(final, encoding="utf-8")
    print("  wrote en/landing-final-expense.html")


def build_page(source_name: str, dest_name: str, *, bilingual: bool = True) -> None:
    src = ROOT / source_name
    text = src.read_text(encoding="utf-8")
    soup = BeautifulSoup(text, "html.parser")

    if bilingual:
        strip_bilingual(soup)
        remove_lang_scripts(soup)
        remove_comments(soup)

    replace_header_footer(soup)
    set_lang_en_html(soup)
    inject_seo(soup, dest_name, source_name)

    if dest_name == "quote.html":
        fix_quote_page(soup)
    if dest_name == "contact.html":
        fix_contact_page(soup)

    out = str(soup)
    out = absolutize_assets(out)
    out = rewrite_internal_links(out)

    if dest_name == "sms-optin.html":
        out = fix_sms_optin(out)

    out = post_process_html(out, dest_name)

    if "</body>" in out and "hamburger-btn" in out and EN_MOBILE_MENU_JS.strip() not in out:
        out = out.replace("</body>", EN_MOBILE_MENU_JS + "\n</body>", 1)

    EN_DIR.mkdir(exist_ok=True)
    dest = EN_DIR / dest_name
    final = out if out.lstrip().startswith("<!DOCTYPE") else "<!DOCTYPE html>\n" + out
    dest.write_text(final, encoding="utf-8")
    print(f"  wrote en/{dest_name}")


def main() -> None:
    EN_DIR.mkdir(exist_ok=True)
    print("Building bilingual mirrors...")
    for src, dest in PAGE_MAP.items():
        if src == "landing-gastos-finales.html":
            continue
        build_page(src, dest, bilingual=True)

    print("Building English landing page...")
    build_landing()

    print("Building copy-based pages...")
    for src, dest in COPY_PAGES.items():
        build_page(src, dest, bilingual=(src == "sms-optin.html"))

    print("Done.")


if __name__ == "__main__":
    main()
