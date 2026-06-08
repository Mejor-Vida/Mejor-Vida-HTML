#!/usr/bin/env node
/**
 * Writes static HTML previews of the post-quote email (same markup as production).
 * Logo src uses ../img/... so opening the file via file:// still loads images from the repo
 * (production emails use absolute https:// URLs from lib/resend-email-template.js).
 *
 *   node scripts/preview-post-quote-email.js
 *
 * Output: email-previews/post-quote-email-en.html
 *         email-previews/post-quote-email-es.html
 *         email-previews/post-quote-over-age-en.html
 *         email-previews/post-quote-over-age-es.html
 */

const fs = require('fs');
const path = require('path');
const {
  buildEmailEN,
  buildEmailES,
  buildOverAgeEmailEN,
  buildOverAgeEmailES,
  LOGO_EN,
  LOGO_ES,
} = require('../lib/post-quote-email-html');

/** Previews live in email-previews/; img/ is one level up. */
const PREVIEW_LOGO_EN = '../img/logo-english2-email.png';
const PREVIEW_LOGO_ES = '../img/logo-spanish2-email.png';

function withLocalLogoUrls(html) {
  return html.split(LOGO_EN).join(PREVIEW_LOGO_EN).split(LOGO_ES).join(PREVIEW_LOGO_ES);
}

const outDir = path.join(__dirname, '..', 'email-previews');
fs.mkdirSync(outDir, { recursive: true });

const sample = {
  name: 'Maria',
  quoteLow: '28',
  quoteHigh: '45',
  callScheduled: false,
  callDatetime: null,
};

const en = buildEmailEN(sample.name, sample.quoteLow, sample.quoteHigh, sample.callScheduled, sample.callDatetime);
const es = buildEmailES(sample.name, sample.quoteLow, sample.quoteHigh, sample.callScheduled, sample.callDatetime);
const overEn = buildOverAgeEmailEN('Asdrubal', false, null);
const overEs = buildOverAgeEmailES('Asdrubal', false, null);

const files = [
  ['post-quote-email-en.html', en.html],
  ['post-quote-email-es.html', es.html],
  ['post-quote-over-age-en.html', overEn.html],
  ['post-quote-over-age-es.html', overEs.html],
];

for (const [name, html] of files) {
  const filePath = path.join(outDir, name);
  fs.writeFileSync(filePath, withLocalLogoUrls(html), 'utf8');
  console.log(' ', filePath);
}

console.log('Wrote email previews (open in browser):');
