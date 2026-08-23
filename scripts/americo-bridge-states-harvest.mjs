#!/usr/bin/env node
/**
 * Harvest Americo product States tabs + quote-tool links.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = process.env.MVI_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.MVI_BRIDGE_PORT || 9334);
const TOKEN = process.env.MVI_BRIDGE_TOKEN || "mvi-local-bridge";
const BASE = `http://${HOST}:${PORT}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "integrations", "knowledge", "Americo_Knowledge", "raw", "harvest-20260823");

const PRODUCTS = [
  { id: 345, slug: "eagle-select" },
  { id: 267, slug: "advantage-wl" },
  { id: 437, slug: "iul" },
  { id: 427, slug: "cbo-100" },
  { id: 433, slug: "elite-5" },
  { id: 436, slug: "platinum-assure-series" },
];

const PATHS = [
  { key: "states", path: "States" },
  { key: "availability", path: "Availability" },
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

async function scrape(url) {
  await command("navigate", { url });
  await sleep(1800);
  return evalCode(`(() => {
    const links = [...document.querySelectorAll("a[href]")].map(a => ({
      text: (a.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 180),
      href: a.href
    })).filter(a => a.href && a.href.indexOf("javascript:") !== 0);
    const files = links.filter(a => /File\\/Get/i.test(a.href));
    const nav = [...document.querySelectorAll("a")].map(a => (a.textContent||"").trim()).filter(t => /Market|Overview|Sales Tools|Forms|Training|States|Quote/i.test(t)).slice(0, 40);
    return { title: document.title, url: location.href, nav, files, body: (document.body.innerText||"").slice(0, 25000), hrefs: links.slice(0, 80) };
  })()`);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const index = [];
  for (const p of PRODUCTS) {
    for (const s of PATHS) {
      const id = `${s.key}-${p.id}-${p.slug}`;
      const url = `https://portal.americoagent.com/${s.path}/${p.id}`;
      process.stdout.write(`→ ${id} `);
      try {
        const detail = await scrape(url);
        fs.writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify({ id, url, capturedAt: new Date().toISOString(), detail }, null, 2));
        console.log((detail.url || "").replace("https://portal.americoagent.com", ""), "files", (detail.files || []).length);
        index.push({ id, landed: detail.url, files: (detail.files || []).length });
      } catch (e) {
        console.log("FAIL", e.message);
        index.push({ id, error: e.message });
      }
    }
  }
  fs.writeFileSync(path.join(OUT, "states-index.json"), JSON.stringify(index, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
