#!/usr/bin/env node
/**
 * Harvest Americo Agent Portal product-resource pages via MVI bridge.
 * Writes JSON under integrations/knowledge/Americo_Knowledge/raw/harvest-YYYYMMDD/
 *
 * Usage (bridge armed on Americo tab):
 *   node scripts/americo-bridge-harvest.mjs
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
const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const OUT = path.join(REPO, "integrations", "knowledge", "Americo_Knowledge", "raw", `harvest-${stamp}`);

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
  return api("/v1/command", {
    method: "POST",
    body: JSON.stringify({ action, args }),
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitReady(minLen = 300, tries = 10) {
  for (let i = 0; i < tries; i++) {
    const r = await command("pageText", { maxChars: 200000 });
    const text = r.text || "";
    if (typeof text === "string" && text.length >= minLen) return r;
    await sleep(1000);
  }
  return command("pageText", { maxChars: 200000 });
}

async function collectLinks() {
  const r = await command("pageLinks");
  return r.links || [];
}

async function evalCode(code) {
  const r = await command("evaluate", { code });
  return r.value !== undefined ? r.value : r.result ?? r;
}

const MARKET_PAGES = [
  { id: "final-expense", url: "https://portal.americoagent.com/Market/FinalExpense" },
  { id: "general-life", url: "https://portal.americoagent.com/Market/GeneralLife" },
  { id: "term", url: "https://portal.americoagent.com/Market/Term" },
  { id: "annuity", url: "https://portal.americoagent.com/Market/Seniors" },
  { id: "home", url: "https://portal.americoagent.com/" },
  { id: "helpful-product-availability", url: "https://portal.americoagent.com/" },
];

function slugFromUrl(url) {
  try {
    const u = new URL(url);
    return (u.pathname.replace(/^\//, "").replace(/\//g, "-") || "page")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .slice(0, 80);
  } catch {
    return "page";
  }
}

async function scrapeUrl(id, url) {
  console.log("→", id, url);
  await command("navigate", { url });
  await sleep(2200);
  const page = await waitReady();
  const links = await collectLinks();
  let detail = null;
  try {
    detail = await evalCode(`(() => {
      const anchors = [...document.querySelectorAll("a[href]")].map(a => ({
        text: (a.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 180),
        href: a.href
      })).filter(a => a.href && a.href.indexOf("javascript:") !== 0);
      const pdfs = anchors.filter(a => /\\.pdf($|\\?|#)/i.test(a.href) || /pdf|brochure|underwrit|guide|form|highlights|rate/i.test(a.text + " " + a.href));
      const products = anchors.filter(a => /\\/Product\\//i.test(a.href));
      const headings = [...document.querySelectorAll("h1,h2,h3,h4")].map(el => (el.innerText || "").trim()).filter(Boolean);
      return {
        title: document.title,
        url: location.href,
        headings,
        products,
        pdfs,
        anchors: anchors.slice(0, 250),
        body: (document.body.innerText || "").slice(0, 25000)
      };
    })()`);
  } catch (e) {
    detail = { error: e.message };
  }
  return {
    id,
    url,
    capturedAt: new Date().toISOString(),
    tabTitle: page.tabTitle,
    tabUrl: page.tabUrl,
    text: page.text,
    links,
    detail,
  };
}

async function main() {
  const status = await api("/v1/status");
  if (!status.armed) {
    console.error("Bridge online but not armed. Turn Bridge ON on the Americo tab.");
    process.exit(2);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const index = [];
  const productUrls = new Map();

  for (const page of MARKET_PAGES.slice(0, 4)) {
    try {
      const data = await scrapeUrl(page.id, page.url);
      const file = path.join(OUT, `${page.id}.json`);
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      index.push({ id: page.id, file, url: data.tabUrl });
      console.log("  saved", file);
      const fromDetail = (data.detail && data.detail.products) || [];
      const fromLinks = (data.links || []).filter((l) => /\/Product\//i.test(l.href || ""));
      for (const p of [...fromDetail, ...fromLinks]) {
        if (p.href) productUrls.set(p.href.split("#")[0], p.text || p.href);
      }
    } catch (e) {
      console.error("  FAILED", page.id, e.message);
      index.push({ id: page.id, error: e.message });
    }
  }

  const home = await scrapeUrl("home", "https://portal.americoagent.com/");
  fs.writeFileSync(path.join(OUT, "home.json"), JSON.stringify(home, null, 2));
  index.push({ id: "home", file: path.join(OUT, "home.json") });

  const docLinks = (home.links || []).filter((l) =>
    /product availability|interest rate|contracting|compliance|who to call|guideline/i.test(
      `${l.text} ${l.href}`,
    ),
  );
  fs.writeFileSync(path.join(OUT, "home-doc-links.json"), JSON.stringify(docLinks, null, 2));

  console.log("\nProduct pages:", [...productUrls.entries()]);
  for (const [url, label] of productUrls) {
    const id = "product-" + slugFromUrl(url);
    try {
      const data = await scrapeUrl(id, url);
      data.label = label;
      const file = path.join(OUT, `${id}.json`);
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      index.push({ id, file, url, label });
      console.log("  saved", file);
    } catch (e) {
      console.error("  FAILED", id, e.message);
      index.push({ id, error: e.message, url });
    }
  }

  fs.writeFileSync(
    path.join(OUT, "index.json"),
    JSON.stringify({ stamp, out: OUT, index, productUrls: [...productUrls] }, null, 2),
  );
  console.log("\nDone:", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
