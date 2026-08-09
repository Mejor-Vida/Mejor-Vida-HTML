#!/usr/bin/env node
/**
 * Harvest Aetna Senior Supplemental agent-portal pages via MVI bridge.
 * Writes JSON snapshots under integrations/knowledge/Aetna_Knowledge/raw/harvest-YYYYMMDD/
 *
 * Usage (bridge armed on Aetna tab):
 *   node scripts/aetna-bridge-harvest.mjs
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
const OUT = path.join(
  REPO,
  "integrations",
  "knowledge",
  "Aetna_Knowledge",
  "raw",
  `harvest-${stamp}`,
);

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

async function waitReady(minLen = 400, tries = 12) {
  for (let i = 0; i < tries; i++) {
    const r = await command("pageText", { maxChars: 200000 });
    const text = r.text || r.result?.text || r.value || "";
    if (typeof text === "string" && text.length >= minLen && !/Loading\.\.\./i.test(text)) {
      return text;
    }
    await sleep(1200);
  }
  const r = await command("pageText", { maxChars: 200000 });
  return r.text || r.result?.text || "";
}

async function collectLinks() {
  const r = await command("pageLinks");
  return r.links || r.result?.links || r.value || [];
}

async function evalJson(code) {
  const r = await command("evaluate", { code });
  return r.value !== undefined ? r.value : r.result ?? r;
}

const PAGES = [
  {
    id: "home",
    url: "https://www.aetnaseniorproducts.com/ssibrokerwebaz/agent/home?channel=broker",
  },
  {
    id: "reference-material",
    url: "https://www.aetnaseniorproducts.com/ssibrokerwebaz/agent/referenceMaterial?channel=broker",
    paginate: true,
  },
  {
    id: "forms-documents",
    url: "https://www.aetnaseniorproducts.com/ssibrokerwebaz/agent/formsAndDocuments?channel=broker",
    paginate: true,
  },
  {
    id: "drug-list",
    url: "https://www.aetnaseniorproducts.com/ssibrokerwebaz/agent/drug/list?channel=broker",
  },
  {
    id: "product-availability",
    url: "https://www.aetnaseniorproducts.com/ssibrokerwebaz/agent/product/productavailability?channel=broker",
  },
  {
    id: "flyers-ads",
    url: "https://www.aetnaseniorproducts.com/ssibrokerwebaz/agent/flyersAds?channel=broker",
    paginate: true,
  },
  {
    id: "training",
    url: "https://www.aetnaseniorproducts.com/ssibrokerwebaz/agent/training?channel=broker",
  },
  {
    id: "product-webinars",
    url: "https://www.aetnaseniorproducts.com/ssibrokerwebaz/agent/productWebinars?channel=broker",
  },
];

async function scrapePage(meta) {
  console.log("→", meta.id, meta.url);
  await command("navigate", { url: meta.url });
  await sleep(2500);
  // dismiss cookie banner if present
  try {
    await command("evaluate", {
      code: `(() => { const b=[...document.querySelectorAll("button")].find(x=>/^(Close|Accept|I agree)/i.test((x.textContent||"").trim())); if(b){b.click();return true;} return false; })()`,
    });
  } catch {
    /* ignore */
  }
  await sleep(800);

  const pages = [];
  const maxPages = meta.paginate ? 6 : 1;
  for (let p = 1; p <= maxPages; p++) {
    const text = await waitReady();
    const links = await collectLinks();
    const detail = await evalJson(`(() => {
      const rows = [...document.querySelectorAll("table tr")].map(tr =>
        [...tr.querySelectorAll("th,td")].map(c => (c.innerText||"").trim().replace(/\\s+/g," "))
      ).filter(r => r.some(Boolean));
      const anchors = [...document.querySelectorAll("a[href]")].map(a => ({
        text: (a.textContent||"").trim().replace(/\\s+/g," ").slice(0,160),
        href: a.href
      })).filter(a => a.href && !a.href.includes("javascript:"));
      return {
        title: document.title,
        url: location.href,
        rowCount: rows.length,
        rows: rows.slice(0, 200),
        anchors: anchors.slice(0, 300),
        bodyPreview: (document.body.innerText||"").slice(0, 12000)
      };
    })()`);

    pages.push({ page: p, text, links, detail });

    if (!meta.paginate) break;
    // try next page
    const clicked = await evalJson(`(() => {
      const next = [...document.querySelectorAll("a,button")].find(el =>
        /^(Next|›|»)$/i.test((el.textContent||"").trim()) ||
        /Next/i.test(el.getAttribute("aria-label")||"") ||
        (el.textContent||"").trim() === "Next ›"
      );
      if (!next || next.getAttribute("disabled") != null || /disabled|inactive/i.test(next.className||"")) return false;
      next.click();
      return true;
    })()`);
    if (!clicked) break;
    await sleep(2000);
  }

  return { ...meta, capturedAt: new Date().toISOString(), pages };
}

async function main() {
  const status = await api("/v1/status");
  if (!status.armed) {
    console.error("Bridge online but extension not armed. Turn Bridge ON on the Aetna tab.");
    process.exit(2);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const index = [];
  for (const page of PAGES) {
    try {
      const data = await scrapePage(page);
      const file = path.join(OUT, `${page.id}.json`);
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      index.push({ id: page.id, file, pages: data.pages.length });
      console.log("  saved", file, `(${data.pages.length} page(s))`);
    } catch (e) {
      console.error("  FAILED", page.id, e.message);
      index.push({ id: page.id, error: e.message });
    }
  }

  // Life-product keyword index across harvest
  const lifeHits = [];
  for (const item of index) {
    if (!item.file) continue;
    const data = JSON.parse(fs.readFileSync(item.file, "utf8"));
    for (const p of data.pages || []) {
      const blob = JSON.stringify(p);
      if (/final expense|accendo|protection series|whole life|underwrit|cash value/i.test(blob)) {
        lifeHits.push({ source: item.id, page: p.page });
      }
    }
  }

  fs.writeFileSync(
    path.join(OUT, "index.json"),
    JSON.stringify({ stamp, out: OUT, index, lifeHits }, null, 2),
  );
  console.log("\nDone:", OUT);
  console.log(JSON.stringify({ index, lifeHits }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
