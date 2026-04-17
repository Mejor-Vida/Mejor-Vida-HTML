#!/usr/bin/env node
/**
 * Writes static HTML previews of the post-quote email (same markup as production).
 * Open in a browser — logos load from mejorvidainsurance.com (requires network).
 *
 *   node scripts/preview-post-quote-email.js
 *
 * Output: email-previews/post-quote-email-en.html
 *         email-previews/post-quote-email-es.html
 */

const fs = require('fs');
const path = require('path');
const { buildEmailEN, buildEmailES } = require('../lib/post-quote-email-html');

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

const enPath = path.join(outDir, 'post-quote-email-en.html');
const esPath = path.join(outDir, 'post-quote-email-es.html');
fs.writeFileSync(enPath, en.html, 'utf8');
fs.writeFileSync(esPath, es.html, 'utf8');

console.log('Wrote email previews (open in browser):');
console.log(' ', enPath);
console.log(' ', esPath);
