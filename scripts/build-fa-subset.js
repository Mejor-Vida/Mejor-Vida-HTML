#!/usr/bin/env node
/**
 * Build local Font Awesome bundle: solid + brands + regular only (not full all.min).
 * Usage: node scripts/build-fa-subset.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "css", "fontawesome");
const OUT_CSS = path.join(ROOT, "css", "fontawesome-mvi.min.css");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name);
    const d = path.join(dest, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

let faRoot;
try {
  faRoot = path.dirname(require.resolve("@fortawesome/fontawesome-free/package.json"));
} catch {
  console.error("Run: npm install --save-dev @fortawesome/fontawesome-free");
  process.exit(1);
}

if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
}

copyDir(path.join(faRoot, "css"), path.join(OUT_DIR, "css"));
copyDir(path.join(faRoot, "webfonts"), path.join(OUT_DIR, "webfonts"));

const parts = [
  "fontawesome.min.css",
  "brands.min.css",
  "solid.min.css",
  "regular.min.css",
];

const bundle = parts
  .map((file) => {
    const raw = fs.readFileSync(path.join(OUT_DIR, "css", file), "utf8");
    return raw.replace(/\.\.\/webfonts\//g, "fontawesome/webfonts/");
  })
  .join("\n");

fs.writeFileSync(OUT_CSS, bundle);

const woff2 = fs.readdirSync(path.join(OUT_DIR, "webfonts")).filter((f) => f.endsWith(".woff2"));
let totalKb = 0;
for (const f of woff2) {
  totalKb += fs.statSync(path.join(OUT_DIR, "webfonts", f)).size;
}

console.log("Wrote css/fontawesome-mvi.min.css (solid + brands + regular)");
console.log(`Webfonts: ${woff2.join(", ")} (${Math.round(totalKb / 1024)} KB total)`);
