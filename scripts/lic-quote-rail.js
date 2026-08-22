"use strict";

const PHONE = "402-440-5438";
const TEL = "+14024405438";

function quoteRailHtml(opts) {
  const { lang, title, line1, line2, quoteHref } = opts;
  const isEs = lang === "es";
  const href = quoteHref || "quote.html";
  const cta = opts.cta || (isEs ? "Ver precios" : "See prices");
  return `<aside class="lic-aside" aria-label="${isEs ? "Pedir cotización" : "Get a quote"}">
<div class="lic-quote-card">
<div class="lic-quote-card__head"><strong>${title}</strong></div>
<div class="lic-quote-card__body">
<ul class="lic-quote-card__checks">
<li>${line1}</li>
<li>${line2}</li>
<li><a href="tel:${TEL}">${PHONE}</a></li>
</ul>
<a class="lic-quote-card__cta" href="${href}">${cta}</a>
</div>
</div>
</aside>`;
}

module.exports = { quoteRailHtml, PHONE, TEL };
