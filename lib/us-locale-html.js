/**
 * Mark public pages as U.S. Spanish / U.S. English for search (hreflang, html lang, og:locale).
 * Does not geo-block. Google treats these as hints so U.S. traffic is preferred, not guaranteed exclusive.
 *
 * Never rewrite data-lang="es" / data-lang="en" — those drive the on-page language toggle CSS.
 */
function applyUsLocaleSignals(html) {
  if (typeof html !== "string" || !html) return html;
  let out = html;
  out = out.replace(/data-lang="es-US"/g, 'data-lang="es"');
  out = out.replace(/data-lang="en-US"/g, 'data-lang="en"');
  out = out.replace(/data-lang='es-US'/g, "data-lang='es'");
  out = out.replace(/data-lang='en-US'/g, "data-lang='en'");
  out = out.replace(/\[data-lang="es-US"\]/g, '[data-lang="es"]');
  out = out.replace(/\[data-lang="en-US"\]/g, '[data-lang="en"]');
  out = out.replace(/hreflang="es"/g, 'hreflang="es-US"');
  out = out.replace(/hreflang="en"/g, 'hreflang="en-US"');
  out = out.replace(/hreflang='es'/g, "hreflang='es-US'");
  out = out.replace(/hreflang='en'/g, "hreflang='en-US'");
  out = out.replace(/content="es_ES"/g, 'content="es_US"');
  out = out.replace(/content='es_ES'/g, "content='es_US'");
  out = out.replace(/(<html\b[^>]*\s)lang="es"(?!-)/gi, '$1lang="es-US"');
  out = out.replace(/(<html\b[^>]*\s)lang="en"(?!-)/gi, '$1lang="en-US"');
  out = out.replace(/(<html\b[^>]*\s)lang='es'(?!-)/gi, "$1lang='es-US'");
  out = out.replace(/(<html\b[^>]*\s)lang='en'(?!-)/gi, "$1lang='en-US'");
  out = out.replace(/document\.documentElement\.lang="es"/g, 'document.documentElement.lang="es-US"');
  out = out.replace(/document\.documentElement\.lang="en"/g, 'document.documentElement.lang="en-US"');
  out = out.replace(/document\.documentElement\.lang='es'/g, "document.documentElement.lang='es-US'");
  out = out.replace(/document\.documentElement\.lang='en'/g, "document.documentElement.lang='en-US'");
  out = out.replace(/"inLanguage":\s*"es-ES"/g, '"inLanguage": "es-US"');
  out = out.replace(/"inLanguage":\s*"es"/g, '"inLanguage": "es-US"');
  out = out.replace(/"inLanguage":\s*"en"(?!-)/g, '"inLanguage": "en-US"');
  return out;
}

module.exports = { applyUsLocaleSignals };
