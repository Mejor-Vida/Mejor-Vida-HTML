#!/usr/bin/env node
/**
 * Americo Sales Tools / Training / Forms harvest.
 * These grids stay empty until Show All + Apply.
 *
 * Usage (bridge armed on Americo tab):
 *   node scripts/americo-bridge-apply-harvest.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = process.env.MVI_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.MVI_BRIDGE_PORT || 9334);
const TOKEN = process.env.MVI_BRIDGE_TOKEN || "mvi-local-bridge";
const BASE = `http://${HOST}:${PORT}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const OUT = path.join(REPO, "integrations", "knowledge", "Americo_Knowledge", "raw", "harvest-20260823");

const PRODUCTS = [
  { id: 345, slug: "eagle-select" },
  { id: 267, slug: "advantage-wl" },
  { id: 437, slug: "iul" },
  { id: 297, slug: "lifeterm" },
  { id: 427, slug: "cbo-100" },
  { id: 428, slug: "cbo-50" },
  { id: 359, slug: "term-125" },
  { id: 357, slug: "term-100" },
  { id: 405, slug: "continuation-10" },
  { id: 406, slug: "continuation-25" },
  { id: 373, slug: "payment-protector" },
  { id: 407, slug: "payment-protector-cont" },
  { id: 363, slug: "adb" },
  { id: 433, slug: "elite-5" },
  { id: 276, slug: "platinum-assure-ca" },
  { id: 436, slug: "platinum-assure-series" },
];

const SECTIONS = [
  { key: "training", path: "Training" },
  { key: "salestools", path: "SalesTools" },
  { key: "forms", path: "Forms" },
];

async function api(pathname, opts = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "X-MVI-Bridge-Token": TOKEN,
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  if (!res.ok) throw new Error(body.error || body.message || `HTTP ${res.status}`);
  return body;
}

async function command(action, args = {}) {
  return api("/v1/command", { method: "POST", body: JSON.stringify({ action, args }) });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function evalCode(code) {
  const r = await command("evaluate", { code });
  return r.value !== undefined ? r.value : r.result ?? r;
}

async function applyAndScrape(url) {
  await command("navigate", { url });
  await sleep(1800);
  await evalCode(`(() => {
    const chk = document.getElementById("chkShowAll");
    if (chk && !chk.checked) chk.click();
    const btn = document.getElementById("btnApply");
    if (btn) btn.click();
    return { checked: !!(chk && chk.checked), applied: !!btn };
  })()`);
  await sleep(2800);
  return evalCode(`(() => {
    const files = [...document.querySelectorAll("a[href]")].map(a => ({
      text: (a.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 220),
      href: a.href
    })).filter(a => /File\\/Get/i.test(a.href));
    const rows = [...document.querySelectorAll("table tr, .k-grid tr")].map(tr =>
      [...tr.querySelectorAll("th,td")].map(c => (c.innerText || "").trim().replace(/\\s+/g, " "))
    ).filter(r => r.some(Boolean)).slice(0, 200);
    const body = (document.body.innerText || "").slice(0, 40000);
    return { title: document.title, url: location.href, files, rows, body };
  })()`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const catalog = [];
  for (const p of PRODUCTS) {
    for (const s of SECTIONS) {
      const id = `${s.key}-applied-${p.id}-${p.slug}`;
      const url = `https://portal.americoagent.com/${s.path}/${p.id}`;
      process.stdout.write(`→ ${id} `);
      try {
        const detail = await applyAndScrape(url);
        const file = path.join(OUT, `${id}.json`);
        fs.writeFileSync(file, JSON.stringify({ id, url, capturedAt: new Date().toISOString(), detail }, null, 2));
        const n = (detail && detail.files && detail.files.length) || 0;
        const names = ((detail && detail.files) || []).slice(0, 6).map((x) => x.text).filter(Boolean);
        console.log(`files ${n}${names.length ? " · " + names.join(" | ") : ""}`);
        catalog.push({ id, url, fileCount: n, files: (detail && detail.files) || [] });
      } catch (e) {
        console.log("FAIL", e.message);
        catalog.push({ id, url, error: e.message });
      }
    }
  }
  const unique = new Map();
  for (const row of catalog) {
    for (const f of row.files || []) {
      const m = String(f.href || "").match(/id=(\d+)/) || String(f.href || "").match(/File\/Get\/(\d+)/);
      const fid = m ? m[1] : f.href;
      if (!unique.has(fid)) unique.set(fid, { id: fid, href: f.href, text: f.text, from: [row.id] });
      else unique.get(fid).from.push(row.id);
    }
  }
  fs.writeFileSync(path.join(OUT, "applied-catalog.json"), JSON.stringify({ catalog, uniqueFiles: [...unique.values()] }, null, 2));
  console.log("Unique File/Get IDs:", unique.size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
