#!/usr/bin/env node
/**
 * Build a glyph-subsetted Font Awesome bundle for icons actually used on the site.
 * - Scans *.html and project *.js (excludes node_modules / FA package CSS)
 * - Subsets solid + brands woff2 via pyftsubset (fonttools)
 * - Writes slim css/fontawesome-mvi.min.css + css/fontawesome/webfonts/*.woff2
 *
 * Usage: node scripts/build-fa-subset.js
 * Requires: pip install --user fonttools brotli
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "css", "fontawesome");
const OUT_WF = path.join(OUT_DIR, "webfonts");
const OUT_CSS = path.join(ROOT, "css", "fontawesome-mvi.min.css");
const META = path.join(
  ROOT,
  "node_modules",
  "@fortawesome",
  "fontawesome-free",
  "metadata",
  "icon-families.json"
);

const SKIP_NAMES = new Set([
  "lg",
  "sm",
  "xs",
  "2xs",
  "xl",
  "2xl",
  "fw",
  "ul",
  "li",
  "border",
  "1x",
  "2x",
  "3x",
  "4x",
  "5x",
  "6x",
  "7x",
  "8x",
  "9x",
  "10x",
  "solid",
  "brands",
  "regular",
  "classic",
  "pull-left",
  "pull-right",
  "stack",
  "stack-1x",
  "stack-2x",
  "inverse",
  "beat",
  "beat-fade",
  "bounce",
  "fade",
  "flip",
  "shake",
  "spin",
  "pulse",
  "spin-pulse",
  "spin-reverse",
  "width-auto",
  "width-fixed",
  "subset",
  "xa",
]);

function findPyftsubset() {
  const candidates = [
    "pyftsubset",
    path.join(process.env.HOME || "", "Library/Python/3.9/bin/pyftsubset"),
    path.join(process.env.HOME || "", "Library/Python/3.11/bin/pyftsubset"),
    path.join(process.env.HOME || "", "Library/Python/3.12/bin/pyftsubset"),
  ];
  for (const c of candidates) {
    const r = spawnSync(c, ["--help"], { encoding: "utf8" });
    if (r.status === 0) return c;
  }
  return null;
}

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git" || ent.name === "Landing page") continue;
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(abs, acc);
    else if (/\.(html|js)$/i.test(ent.name)) acc.push(abs);
  }
  return acc;
}

function collectIconNames() {
  const names = new Set();
  for (const file of walkFiles(ROOT)) {
    if (file.includes(`${path.sep}css${path.sep}fontawesome`)) continue;
    if (file.includes(`${path.sep}scripts${path.sep}build-fa-subset.js`)) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(/\bfa-([a-z0-9-]+)/g)) {
      if (!SKIP_NAMES.has(m[1])) names.add(m[1]);
    }
  }
  return names;
}

function resolveIcon(fam, aliases, name) {
  const canonical = fam[name] ? name : aliases[name];
  if (!canonical || !fam[canonical]) return null;
  const meta = fam[canonical];
  const free = (meta.familyStylesByLicense && meta.familyStylesByLicense.free) || [];
  const styles = free.map((s) => `${s.family}-${s.style}`);
  let pack = null;
  if (styles.some((s) => s.includes("brands"))) pack = "brands";
  else if (styles.some((s) => s.includes("solid"))) pack = "solid";
  else if (styles.some((s) => s.includes("regular"))) pack = "regular";
  if (!pack) return null;
  return {
    requested: name,
    canonical,
    unicode: meta.unicode,
    pack,
    aliases: ((meta.aliases && meta.aliases.names) || []).concat(
      name !== canonical ? [name] : []
    ),
  };
}

function coreCssWithoutIcons(faCssPath) {
  const raw = fs.readFileSync(faCssPath, "utf8");
  // Drop per-icon --fa rules; keep base utilities / @font-face replacements later.
  return raw
    .replace(/\.fa-[a-z0-9-]+(?:,\.fa-[a-z0-9-]+)*\{--fa:"[^"]*"\}/gi, "")
    .replace(/url\((?:\.\.\/)?webfonts\//g, "url(fontawesome/webfonts/");
}

function iconRule(resolved) {
  const names = Array.from(
    new Set([resolved.canonical, resolved.requested, ...(resolved.aliases || [])])
  );
  const sel = names.map((n) => `.fa-${n}`).join(",");
  return `${sel}{--fa:"\\${resolved.unicode}"}`;
}

function subsetFont(pyft, srcWoff2, outWoff2, unicodes) {
  // Always keep space + NBSP + replacement-ish basics for font stability
  const cps = Array.from(
    new Set(["0x20", "0xa0", ...unicodes.map((u) => `0x${u}`)])
  ).join(",");
  fs.mkdirSync(path.dirname(outWoff2), { recursive: true });
  const r = spawnSync(
    pyft,
    [
      srcWoff2,
      `--output-file=${outWoff2}`,
      `--unicodes=${cps}`,
      "--flavor=woff2",
      "--layout-features=*",
      "--glyph-names",
      "--symbol-cmap",
      "--legacy-cmap",
      "--notdef-glyph",
      "--notdef-outline",
      "--recommended-glyphs",
      "--name-IDs=*",
      "--name-legacy",
      "--name-languages=*",
    ],
    { encoding: "utf8" }
  );
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error(`pyftsubset failed for ${srcWoff2}`);
  }
}

function main() {
  const pyft = findPyftsubset();
  if (!pyft) {
    console.error("pyftsubset not found. Run: pip3 install --user fonttools brotli");
    process.exit(1);
  }
  let faRoot;
  try {
    faRoot = path.dirname(require.resolve("@fortawesome/fontawesome-free/package.json"));
  } catch {
    console.error("Run: npm install --save-dev @fortawesome/fontawesome-free");
    process.exit(1);
  }

  const fam = JSON.parse(fs.readFileSync(META, "utf8"));
  const aliases = {};
  for (const [name, meta] of Object.entries(fam)) {
    for (const a of (meta.aliases && meta.aliases.names) || []) {
      aliases[a] = name;
    }
  }

  const requested = collectIconNames();
  const resolved = [];
  const missing = [];
  for (const name of [...requested].sort()) {
    const r = resolveIcon(fam, aliases, name);
    if (!r) missing.push(name);
    else resolved.push(r);
  }

  // Deduplicate by canonical+pack
  const byKey = new Map();
  for (const r of resolved) {
    const key = `${r.pack}:${r.canonical}`;
    if (!byKey.has(key)) byKey.set(key, r);
    else {
      const cur = byKey.get(key);
      cur.aliases = Array.from(new Set([...(cur.aliases || []), r.requested, ...(r.aliases || [])]));
    }
  }
  const icons = [...byKey.values()];

  const solidU = icons.filter((i) => i.pack === "solid").map((i) => i.unicode);
  const brandU = icons.filter((i) => i.pack === "brands").map((i) => i.unicode);

  const srcSolid = path.join(faRoot, "webfonts", "fa-solid-900.woff2");
  const srcBrands = path.join(faRoot, "webfonts", "fa-brands-400.woff2");

  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_WF, { recursive: true });

  if (solidU.length) {
    subsetFont(pyft, srcSolid, path.join(OUT_WF, "fa-solid-900.woff2"), solidU);
  }
  if (brandU.length) {
    subsetFont(pyft, srcBrands, path.join(OUT_WF, "fa-brands-400.woff2"), brandU);
  }

  const core = coreCssWithoutIcons(path.join(faRoot, "css", "fontawesome.min.css"));
  // Keep only Free solid + Brands faces pointing at our subset files; drop regular face weight if present.
  let faces = `
:host,:root{--fa-family-brands:"Font Awesome 7 Brands";--fa-family-classic:"Font Awesome 7 Free";--fa-style-family-brands:"Font Awesome 7 Brands";--fa-style-family:"Font Awesome 7 Free"}
@font-face{font-family:"Font Awesome 7 Free";font-style:normal;font-weight:900;font-display:swap;src:url(fontawesome/webfonts/fa-solid-900.woff2?v=20260723subset) format("woff2")}
@font-face{font-family:"Font Awesome 7 Brands";font-style:normal;font-weight:400;font-display:swap;src:url(fontawesome/webfonts/fa-brands-400.woff2?v=20260723subset) format("woff2")}
.fa-brands,.fab{--fa-family:var(--fa-family-brands);--fa-style:400}
.fa-solid,.fas{--fa-family:var(--fa-family-classic);--fa-style:900}
`.trim();

  // Strip original @font-face blocks from core to avoid double-loading full fonts
  const coreNoFace = core.replace(/@font-face\{[^}]+\}/g, "");

  const iconCss = icons.map(iconRule).join("");
  const bundle = `/* Mejor Vida FA glyph subset — generated by scripts/build-fa-subset.js */\n${coreNoFace}\n${faces}\n${iconCss}\n`;
  fs.writeFileSync(OUT_CSS, bundle);

  const solidKb = solidU.length
    ? Math.round(fs.statSync(path.join(OUT_WF, "fa-solid-900.woff2")).size / 1024)
    : 0;
  const brandKb = brandU.length
    ? Math.round(fs.statSync(path.join(OUT_WF, "fa-brands-400.woff2")).size / 1024)
    : 0;
  const cssKb = Math.round(fs.statSync(OUT_CSS).size / 1024);

  console.log(`Icons kept: ${icons.length} (solid ${solidU.length}, brands ${brandU.length})`);
  if (missing.length) console.warn("Unresolved (skipped):", missing.join(", "));
  console.log(`CSS ${cssKb}KB | solid ${solidKb}KB | brands ${brandKb}KB | total fonts ${solidKb + brandKb}KB`);
}

main();
