#!/usr/bin/env python3
"""Build English /en/ mirror pages from Spanish root sources."""

from __future__ import annotations

import copy
import re
import shutil
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString, Tag

ROOT = Path(__file__).resolve().parents[1]
EN_DIR = ROOT / "en"
SOURCES = ROOT / "sources"
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

# Extra bilingual pages (sources/{path} → Spanish root + en/{path})
EXTRA_BILINGUAL_PAGES = [
    "schedule-julie.html",
    "quote-out-of-state.html",
    "thank-you-out-of-state.html",
    "privacy-policy.html",
    "terms-service.html",
    "sms-optin.html",
]

EXCLUDE_SOURCE_PREFIXES = (
    "staff/",
    "preview/",
    "en/",
    "sources/",  # templates dir — never treat as public pages
    "email-previews/",
    "facebook-posting/",
    "integrations/",
    "website-avatar/",
    "FB/",
    "blog/_fragments/",
    "includes/",
)

# Built by dedicated handlers (skip in site-wide loop)
SKIP_SITE_WIDE = frozenset(
    {
        "index.html",
        "quote.html",
        "about-julie.html",
        "contact.html",
        "blog.html",
        "final-expense-estimator.html",
        "landing-gastos-finales.html",
        "quote-results.html",
        "privacy-policy-en.html",
        "terms-service-en.html",
    }
)

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
    "quote-results.html": {
        "title": "Your Lowest Rate Opportunities May Not Last Forever | Mejor Vida Insurance",
        "description": "See your final expense estimate and schedule with Julie today. Age and health changes can affect future options.",
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
    "quote-results.html": "/quote-results.html",
    "schedule-julie.html": "/schedule-julie.html",
    "quote-out-of-state.html": "/quote-out-of-state.html",
    "thank-you-out-of-state.html": "/thank-you-out-of-state.html",
}

INTERNAL_LINKS = {
    "index.html": "index.html",
    "/index.html": "index.html",
    "quote.html": "quote.html",
    "/quote.html": "quote.html",
    "about-julie.html": "about-julie.html",
    "/about-julie.html": "about-julie.html",
    "contact.html": "contact.html",
    "/contact.html": "contact.html",
    "blog.html": "blog.html",
    "/blog.html": "blog.html",
    "final-expense-estimator.html": "final-expense-estimator.html",
    "/final-expense-estimator.html": "final-expense-estimator.html",
    "landing-gastos-finales.html": "landing-final-expense.html",
    "/landing-gastos-finales.html": "landing-final-expense.html",
    "landing-final-expense.html": "landing-final-expense.html",
    "privacy-policy.html": "privacy-policy.html",
    "/privacy-policy.html": "privacy-policy.html",
    "privacy-policy-en.html": "privacy-policy.html",
    "/privacy-policy-en.html": "privacy-policy.html",
    "terms-service.html": "terms-service.html",
    "/terms-service.html": "terms-service.html",
    "terms-service-en.html": "terms-service.html",
    "/terms-service-en.html": "terms-service.html",
    "sms-optin.html": "sms-optin.html",
    "/sms-optin.html": "sms-optin.html",
    "schedule-julie.html": "../schedule-julie.html",
    "/schedule-julie.html": "../schedule-julie.html",
    "quote-out-of-state.html": "quote-out-of-state.html",
    "/quote-out-of-state.html": "quote-out-of-state.html",
    "thank-you-out-of-state.html": "thank-you-out-of-state.html",
    "/thank-you-out-of-state.html": "thank-you-out-of-state.html",
    "quote-results.html": "quote-results.html",
    "/quote-results.html": "quote-results.html",
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


def bilingual_source_path(rel: str) -> Path:
    """Bilingual template used to generate Spanish root + English /en/ outputs."""
    path = SOURCES / rel
    if path.is_file():
        return path
    fallback = ROOT / rel
    if fallback.is_file():
        return fallback
    raise FileNotFoundError(f"No source for {rel} (expected sources/ or root)")


def en_asset_prefix(en_rel: str) -> str:
    """Prefix from en/{en_rel} up to site root (for bootstrap/, img/, etc.)."""
    return "../" * len(Path(en_rel).parts)


def en_nav_prefix(en_rel: str) -> str:
    """Prefix from en/{en_rel} up to en/ (for index.html, blog.html within /en/)."""
    parts = Path(en_rel).parts
    if len(parts) <= 1:
        return ""
    return "../" * (len(parts) - 1)


def en_public_path(rel: str) -> str:
    mapped = PAGE_MAP.get(rel, rel)
    if mapped == "index.html":
        return "/en/"
    return f"/en/{mapped}"


def es_public_path(rel: str) -> str:
    mapped = {v: k for k, v in PAGE_MAP.items()}.get(rel, rel)
    if mapped == "index.html":
        return "/"
    return f"/{mapped}"


def discover_bilingual_html() -> list[str]:
    found: list[str] = []
    for path in ROOT.rglob("*.html"):
        rel = path.relative_to(ROOT).as_posix()
        if rel.startswith("en/") or any(rel.startswith(p) for p in EXCLUDE_SOURCE_PREFIXES):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        if "data-lang=" in text:
            found.append(rel)
    return sorted(set(found))


def bootstrap_bilingual_sources() -> None:
    """Keep sources/ as bilingual master; refresh from root if root still has data-lang."""
    SOURCES.mkdir(exist_ok=True)
    candidates = sorted(
        set(discover_bilingual_html())
        | {p.relative_to(SOURCES).as_posix() for p in SOURCES.rglob("*.html")}
    )
    for rel in candidates:
        src = ROOT / rel
        dst = SOURCES / rel
        if not src.is_file() and not dst.is_file():
            continue
        if not src.is_file():
            continue
        if src.resolve() == dst.resolve():
            continue
        if "data-lang=" in src.read_text(encoding="utf-8"):
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            print(f"  refreshed sources/{rel} (from bilingual root)")
        elif not dst.is_file():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            print(f"  bootstrapped sources/{rel}")


def adapt_en_chrome(html: str, en_rel: str) -> str:
    """Adjust shared en header/footer paths for en/blog/... and en/carriers/... depth."""
    assets = en_asset_prefix(en_rel)
    nav = en_nav_prefix(en_rel)
    if assets == "../" and not nav:
        return html
    html = html.replace('src="../img/', f'src="{assets}img/')
    html = html.replace('href="../schedule-julie.html', f'href="{assets}schedule-julie.html')
    html = html.replace('href="../index.html"', f'href="{assets}index.html"')
    if nav:
        for page in (
            "index.html",
            "about-julie.html",
            "blog.html",
            "contact.html",
            "quote.html",
            "final-expense-estimator.html",
            "privacy-policy.html",
            "terms-service.html",
            "sms-optin.html",
        ):
            html = html.replace(f'href="{page}', f'href="{nav}{page}')
    return html


def strip_spanish_only(soup: BeautifulSoup) -> None:
    for el in list(soup.find_all(attrs={"data-lang": "en"})):
        el.decompose()
    for el in soup.find_all(attrs={"data-lang": "es"}):
        if "data-lang" in el.attrs:
            del el.attrs["data-lang"]
    remove_lang_toggle_ui(soup)
    remove_lang_scripts(soup)
    inject_single_lang_head(soup, "es")
    if soup.html:
        soup.html["lang"] = "es"
        soup.html["class"] = "lang-es"


def inject_en_urls_basic(soup: BeautifulSoup, en_rel: str, es_rel: str) -> None:
    head = soup.find("head")
    if not head:
        return
    en_url = f"{BASE}{en_public_path(en_rel)}"
    es_url = f"{BASE}{es_public_path(es_rel)}"
    canonical = head.find("link", rel="canonical")
    if canonical:
        canonical["href"] = en_url
    for meta in head.find_all("meta"):
        if meta.get("property") == "og:url":
            meta["content"] = en_url
        if meta.get("property") == "og:locale":
            meta["content"] = "en_US"
    for link in head.find_all("link", rel="alternate"):
        link.decompose()
    head.append(soup.new_tag("link", rel="alternate", hreflang="es", href=es_url))
    head.append(soup.new_tag("link", rel="alternate", hreflang="en", href=en_url))
    head.append(soup.new_tag("link", rel="alternate", hreflang="x-default", href=es_url))


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


def is_protected_runtime_script(txt: str) -> bool:
    """Quote-results schedule + estimate loaders must survive lang-toggle cleanup."""
    return (
        "mvi-results-body" in txt
        or "mvi-results-missing" in txt
        or ("openScheduleModalMejorVida" in txt and "schedule-iframe" in txt)
    )


def remove_lang_scripts(soup: BeautifulSoup) -> None:
    for script in soup.find_all("script"):
        txt = script.string or ""
        if is_protected_runtime_script(txt):
            continue
        if "sessionLang" in txt or "data-lang-btn" in txt or "setLanguage" in txt:
            if "hamburger-btn" not in txt or "sessionLang" in txt:
                script.decompose()
    for style in soup.find_all("style"):
        txt = style.string or ""
        if "html.lang-es" in txt or "html.lang-en" in txt:
            style.string = strip_bilingual_css_rules(txt)


def relativize_en_assets(html: str, *, asset_prefix: str | None = None) -> str:
    """Use ../ paths so /en/ pages work locally (file://) and on Vercel."""
    prefix = asset_prefix or "../"
    asset_roots = ("bootstrap", "css", "js", "img", "video")
    for root in asset_roots:
        html = re.sub(
            rf'((?:href|src)=["\'])/{root}/',
            rf"\1{prefix}{root}/",
            html,
        )
    for stem in ("bootstrap/", "css/", "js/", "img/", "video/", "favicon.ico", "script.js"):
        html = re.sub(
            rf'((?:href|src)=["\'])(?!https?:|/|#|mailto:|tel:|data:|\\.\\./)({re.escape(stem)})',
            rf"\1{prefix}\2",
            html,
        )
    html = re.sub(r"url\(\s*['\"]/img/", f"url('{prefix}img/", html)
    html = re.sub(r"url\(\s*['\"]img/", f"url('{prefix}img/", html)
    html = re.sub(
        r'data-mvi-avatar-base=(["\'])img/',
        rf"data-mvi-avatar-base=\1{prefix}img/",
        html,
    )
    html = re.sub(
        rf'(srcset=["\'])/({ "|".join(asset_roots) })/',
        rf"\1{prefix}\2/",
        html,
    )
    html = re.sub(
        rf'(srcset=["\'])(?!https?:|/|#|data:|\\.\\./)(img/)',
        rf"\1{prefix}\2",
        html,
    )
    return html


def normalize_en_prefixed_links(html: str) -> str:
    """Convert /en/foo.html → foo.html for same-folder navigation."""
    html = re.sub(r'(href=["\'])/en/([^"\']+)(["\'])', r"\1\2\3", html)
    html = html.replace('href="../../schedule-julie.html"', 'href="/en/schedule-julie.html"')
    html = html.replace('href="../schedule-julie.html"', 'href="/en/schedule-julie.html"')
    html = html.replace('href="schedule-julie.html"', 'href="/en/schedule-julie.html"')
    html = html.replace("href='../../schedule-julie.html'", "href='/en/schedule-julie.html'")
    html = html.replace("href='../schedule-julie.html'", "href='/en/schedule-julie.html'")
    html = html.replace("href='schedule-julie.html'", "href='/en/schedule-julie.html'")
    html = html.replace('href="/schedule-julie.html"', 'href="/en/schedule-julie.html"')
    return html


def inject_en_bootstrap_script(soup: BeautifulSoup) -> None:
    head = soup.find("head")
    if not head:
        return
    for script in list(head.find_all("script")):
        if script.get("type") == "application/ld+json":
            continue
        txt = script.string or script.get_text() or ""
        if "sessionLang" in txt or "data-lang-btn" in txt:
            script.decompose()
    boot = BeautifulSoup(
        '<script>(function(){document.documentElement.className="lang-en";document.documentElement.lang="en";})();</script>',
        "html.parser",
    )
    head.append(boot)


def inject_single_lang_head(soup: BeautifulSoup, lang: str) -> None:
    head = soup.find("head")
    if not head:
        return
    for script in list(head.find_all("script")):
        if script.get("type") == "application/ld+json":
            continue
        txt = script.string or script.get_text() or ""
        if "sessionLang" in txt or "mviNebraskaQuoteResult" in txt or "mvsQuoteResult" in txt:
            script.decompose()
    boot = BeautifulSoup(
        f'<script>(function(){{document.documentElement.lang="{lang}";document.documentElement.className="lang-{lang}";}})();</script>',
        "html.parser",
    )
    head.append(boot)


def add_cross_language_link(soup: BeautifulSoup, *, href: str, label: str, title: str) -> None:
    actions = soup.select_one(".header-actions")
    if not actions:
        return
    existing_lang_links = actions.select("a.nav-link-cm.small.text-muted")
    if existing_lang_links:
        primary = existing_lang_links[0]
        for extra in existing_lang_links[1:]:
            extra.decompose()
        primary["href"] = href
        primary["title"] = title
        primary.string = label
        return
    if actions.find("a", href=href):
        return
    link = soup.new_tag("a", href=href)
    link["class"] = "d-none d-lg-inline-block nav-link-cm small text-muted text-decoration-none ms-1"
    link["title"] = title
    link.string = label
    hamburger = actions.find(class_="hamburger-btn")
    if hamburger:
        hamburger.insert_before(link)
    else:
        actions.append(link)


def fix_quote_results_scripts(html: str, lang: str) -> str:
    html = html.replace(
        "var lang = document.documentElement.classList.contains('lang-en') ? 'en' : 'es';",
        f"var lang = '{lang}';",
    )
    html = html.replace(
        "var warnLang = document.documentElement.classList.contains('lang-en') ? 'en' : 'es';",
        f"var warnLang = '{lang}';",
    )
    html = re.sub(
        r"document\.querySelectorAll\('\.lang-btn'\)\.forEach\(function \(btn\) \{[\s\S]*?\}\);\s*",
        "",
        html,
        count=1,
    )
    html = re.sub(
        r"// Prefer active page language over possibly stale quote payload language\.[\s\S]*?var lang = pageLang \|\| \(q\.lang === 'en' \? 'en' : 'es'\);",
        f"var lang = '{lang}';",
        html,
        count=1,
    )
    html = re.sub(r'<script src="\.\./script\.js"></script>\s*', "", html)
    html = re.sub(r'<script src="script\.js"></script>\s*', "", html)
    return html


def build_quote_results_split() -> None:
    """Spanish quote-results.html + dedicated en/quote-results.html (no shared data-lang page)."""
    source_path = SOURCES / "quote-results.html"
    if not source_path.is_file():
        raise SystemExit(
            f"Missing bilingual source: {source_path.relative_to(ROOT)} "
            "(required to rebuild Spanish and English quote-results pages)."
        )
    raw = source_path.read_text(encoding="utf-8")
    es_dest = ROOT / "quote-results.html"

    # --- Spanish (root) ---
    es_soup = BeautifulSoup(raw, "html.parser")
    for el in list(es_soup.find_all(attrs={"data-lang": "en"})):
        el.decompose()
    for el in es_soup.find_all(attrs={"data-lang": "es"}):
        del el.attrs["data-lang"]
    remove_lang_toggle_ui(es_soup)
    inject_single_lang_head(es_soup, "es")
    if es_soup.html:
        es_soup.html["lang"] = "es"
    add_cross_language_link(
        es_soup,
        href="/en/quote.html",
        label="English",
        title="View quote tool in English",
    )
    es_out = str(es_soup)
    es_out = fix_quote_results_scripts(es_out, "es")
    es_out = rewrite_internal_links(es_out)
    es_dest.write_text(es_out, encoding="utf-8")
    print("  wrote quote-results.html (Spanish only)")

    # --- English (/en/) ---
    en_soup = BeautifulSoup(raw, "html.parser")
    strip_bilingual(en_soup)
    remove_lang_scripts(en_soup)
    inject_single_lang_head(en_soup, "en")
    replace_header_footer(en_soup)
    set_lang_en_html(en_soup)
    inject_seo(en_soup, "quote-results.html", "quote-results.html")
    en_out = str(en_soup)
    en_out = relativize_en_assets(en_out)
    en_out = rewrite_internal_links(en_out)
    en_out = normalize_en_prefixed_links(en_out)
    en_out = fix_quote_results_scripts(en_out, "en")
    if EN_MOBILE_MENU_JS.strip() not in en_out:
        en_out = en_out.replace("</body>", EN_MOBILE_MENU_JS + "\n</body>", 1)
    dest = EN_DIR / "quote-results.html"
    final = en_out if en_out.lstrip().startswith("<!DOCTYPE") else "<!DOCTYPE html>\n" + en_out
    dest.write_text(final, encoding="utf-8")
    print("  wrote en/quote-results.html (English only)")


def write_spanish_only_page(rel: str, *, cross_en_href: str | None = None) -> None:
    """Published root page: Spanish only (no data-lang toggle)."""
    raw = bilingual_source_path(rel).read_text(encoding="utf-8")
    soup = BeautifulSoup(raw, "html.parser")
    strip_spanish_only(soup)
    if cross_en_href:
        add_cross_language_link(
            soup,
            href=cross_en_href,
            label="English",
            title="View this page in English",
        )
    out = str(soup)
    out = rewrite_internal_links(out)
    dest = ROOT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(out, encoding="utf-8")
    print(f"  wrote {rel} (Spanish only)")


def build_english_from_bilingual(
    rel: str,
    en_rel: str | None = None,
    *,
    seo_key: str | None = None,
    use_en_header: bool = True,
    post_name: str | None = None,
    html_post=None,
) -> None:
    en_rel = en_rel or rel
    post_name = post_name or Path(en_rel).name
    soup = BeautifulSoup(bilingual_source_path(rel).read_text(encoding="utf-8"), "html.parser")
    strip_bilingual(soup)
    remove_lang_scripts(soup)
    inject_single_lang_head(soup, "en")
    if use_en_header:
        replace_header_footer(soup)
    set_lang_en_html(soup)
    seo_file = seo_key or Path(en_rel).name
    if seo_file in PAGE_SEO:
        inject_seo(soup, seo_file, rel)
    else:
        inject_en_urls_basic(soup, en_rel, rel)
    out = str(soup)
    assets = en_asset_prefix(en_rel)
    out = relativize_en_assets(out, asset_prefix=assets)
    out = adapt_en_chrome(out, en_rel)
    out = rewrite_internal_links(out)
    out = normalize_en_prefixed_links(out)
    if post_name == "sms-optin.html":
        out = fix_sms_optin(out)
    out = post_process_html(out, post_name)
    if html_post:
        out = html_post(out)
    if "</body>" in out and "hamburger-btn" in out and EN_MOBILE_MENU_JS.strip() not in out:
        out = out.replace("</body>", EN_MOBILE_MENU_JS + "\n</body>", 1)
    dest = EN_DIR / en_rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    final = out if out.lstrip().startswith("<!DOCTYPE") else "<!DOCTYPE html>\n" + out
    dest.write_text(final, encoding="utf-8")
    print(f"  wrote en/{en_rel}")


def build_site_wide_splits() -> None:
    """Split every bilingual template under sources/ into Spanish root + /en/ mirror."""
    for rel in discover_bilingual_html():
        if rel in SKIP_SITE_WIDE:
            continue
        cross = en_public_path(rel)
        write_spanish_only_page(rel, cross_en_href=cross)
        build_english_from_bilingual(rel, rel, use_en_header=True)


def build_index_from_spanish() -> None:
    """Copy Spanish index.html, keep English text blocks, same layout/CSS/JS."""
    soup = BeautifulSoup(bilingual_source_path("index.html").read_text(encoding="utf-8"), "html.parser")
    strip_bilingual(soup)
    remove_lang_scripts(soup)
    inject_en_bootstrap_script(soup)
    replace_header_footer(soup)
    set_lang_en_html(soup)
    inject_seo(soup, "index.html", "index.html")

    assistant = soup.find(id="mvi-assistant-root")
    if assistant:
        assistant["data-mvi-avatar-base"] = "../img/mvi-chat-avatar"

    out = str(soup)
    out = relativize_en_assets(out)
    out = rewrite_internal_links(out)
    out = normalize_en_prefixed_links(out)
    out = post_process_html(out, "index.html")

    if "website-assistant-widget.js" not in out:
        out = out.replace(
            '<script src="../script.js"></script>',
            '<script src="../script.js"></script>\n  <script src="../js/website-assistant-widget.js" defer></script>',
        )

    dest = EN_DIR / "index.html"
    final = out if out.lstrip().startswith("<!DOCTYPE") else "<!DOCTYPE html>\n" + out
    dest.write_text(final, encoding="utf-8")
    print("  wrote en/index.html (copied from index.html, English only)")


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

    html = re.sub(r'<script src="\.\./script\.js"></script>', "", html)
    html = re.sub(r'<script src="script\.js"></script>', "", html)
    if dest_name == "index.html":
        if "../script.js" not in html:
            html = html.replace(
                '<script src="../js/hero-quotes-data.js"></script>',
                '<script src="../js/hero-quotes-data.js"></script>\n  <script src="../script.js"></script>',
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
    src = bilingual_source_path("landing-gastos-finales.html")
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
    out = relativize_en_assets(out)
    out = rewrite_internal_links(out)
    out = normalize_en_prefixed_links(out)
    out = fix_sms_optin(out)
    out = post_process_html(out, "landing-final-expense.html")

    dest = EN_DIR / "landing-final-expense.html"
    final = out if out.lstrip().startswith("<!DOCTYPE") else "<!DOCTYPE html>\n" + out
    dest.write_text(final, encoding="utf-8")
    print("  wrote en/landing-final-expense.html")


def build_page(source_name: str, dest_name: str, *, bilingual: bool = True) -> None:
    text = bilingual_source_path(source_name).read_text(encoding="utf-8")
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
    out = relativize_en_assets(out)
    out = rewrite_internal_links(out)
    out = normalize_en_prefixed_links(out)

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
    print("Bootstrapping bilingual sources/ (first run copies from site)...")
    bootstrap_bilingual_sources()

    print("Building English /en/ mirrors (PAGE_MAP)...")
    for src, dest in PAGE_MAP.items():
        if src == "landing-gastos-finales.html":
            continue
        if src == "index.html":
            build_index_from_spanish()
            continue
        build_page(src, dest, bilingual=True)

    print("Building English landing page...")
    build_landing()

    print("Splitting quote results...")
    build_quote_results_split()

    print("Writing Spanish-only root pages (PAGE_MAP)...")
    for src in PAGE_MAP:
        if src == "landing-gastos-finales.html":
            write_spanish_only_page(src, cross_en_href=en_public_path(src))
            continue
        write_spanish_only_page(src, cross_en_href=en_public_path(src))

    print("Splitting remaining bilingual pages (blog, carriers, legal, quote flow)...")
    build_site_wide_splits()

    print("Done.")


if __name__ == "__main__":
    main()
