#!/usr/bin/env node
/**
 * Remove hreflang="en" / "en-US" from Spanish (indexable) HTML.
 * English /en/ pages stay noindex; Spanish should not advertise them as alternates.
 *
 * Skips: en/**, sources/en/**
 * Usage: node scripts/strip-en-hreflang-from-spanish.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const EN_HREFLANG_RE =
  /\s*<link\b[^>]*\bhreflang=["']en(?:-US)?["'][^>]*\/?>\s*/gi;

function shouldSkip(relPosix) {
  if (relPosix.startsWith("en/")) return true;
  if (relPosix.startsWith("sources/en/")) return true;
  if (relPosix.includes("/node_modules/")) return true;
  return false;
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) walk(abs, out);
    else if (name.endsWith(".html")) out.push(abs);
  }
  return out;
}

let changed = 0;
let scanned = 0;
for (const abs of walk(ROOT)) {
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  if (shouldSkip(rel)) continue;
  scanned += 1;
  const before = fs.readFileSync(abs, "utf8");
  if (!/hreflang=["']en(?:-US)?["']/i.test(before)) continue;
  const after = before.replace(EN_HREFLANG_RE, "\n");
  if (after === before) continue;
  fs.writeFileSync(abs, after, "utf8");
  changed += 1;
  console.log("stripped en hreflang:", rel);
}

console.log(`Done. Scanned ${scanned} Spanish-side HTML files; updated ${changed}.`);
