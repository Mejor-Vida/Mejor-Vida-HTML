#!/usr/bin/env node
/**
 * Harvest Americo SalesTools / Training pages + unique File/Get PDFs.
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
const PDF_DIR = path.join(REPO, "integrations", "knowledge", "Americo_Knowledge", "raw", "pdfs");

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

const PAGES = [
  { id: "salestools-345-eagle-select", url: "https://portal.americoagent.com/SalesTools/345" },
  { id: "training-345-eagle-select", url: "https://portal.americoagent.com/Training/345" },
  { id: "salestools-267-advantage-wl", url: "https://portal.americoagent.com/SalesTools/267" },
  { id: "salestools-437-iul", url: "https://portal.americoagent.com/SalesTools/437" },
  { id: "salestools-297-term-series", url: "https://portal.americoagent.com/SalesTools/297" },
  { id: "salestools-427-cbo100", url: "https://portal.americoagent.com/SalesTools/427" },
  { id: "salestools-433-elite5", url: "https://portal.americoagent.com/SalesTools/433" },
  { id: "salestools-436-platinum", url: "https://portal.americoagent.com/SalesTools/436" },
  { id: "service-forms", url: "https://portal.americoagent.com/products/serviceforms" },
];

async function scrape(id, url) {
  console.log("→", id);
  await command("navigate", { url });
  await sleep(2200);
  const page = await command("pageText", { maxChars: 200000 });
  const links = await command("pageLinks");
  let detail = null;
  try {
    const ev = await command("evaluate", {
      code: `(() => {
        const anchors = [...document.querySelectorAll("a[href]")].map(a => ({
          text: (a.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 200),
          href: a.href
        })).filter(a => a.href && a.href.indexOf("javascript:") !== 0);
        const files = anchors.filter(a => /File\\/Get/i.test(a.href));
        const rows = [...document.querySelectorAll("table tr")].map(tr =>
          [...tr.querySelectorAll("th,td")].map(c => (c.innerText||"").trim().replace(/\\s+/g," "))
        ).filter(r => r.some(Boolean)).slice(0, 120);
        return { title: document.title, url: location.href, files, rows, anchors: anchors.slice(0, 300), body: (document.body.innerText||"").slice(0, 30000) };
      })()`,
    });
    detail = ev.value;
  } catch (e) {
    detail = { error: e.message };
  }
  return { id, url, capturedAt: new Date().toISOString(), tabTitle: page.tabTitle, tabUrl: page.tabUrl, text: page.text, links: links.links || [], detail };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const index = [];
  for (const p of PAGES) {
    try {
      const data = await scrape(p.id, p.url);
      const file = path.join(OUT, `${p.id}.json`);
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      index.push({ id: p.id, file });
      const files = (data.detail && data.detail.files) || [];
      console.log("  files", files.length, files.slice(0, 8).map((x) => x.text).join(" | "));
    } catch (e) {
      console.error("  FAIL", p.id, e.message);
      index.push({ id: p.id, error: e.message });
    }
  }
  fs.writeFileSync(path.join(OUT, "salestools-index.json"), JSON.stringify(index, null, 2));
  console.log("Done salestools");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
