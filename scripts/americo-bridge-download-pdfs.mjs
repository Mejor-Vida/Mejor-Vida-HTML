#!/usr/bin/env node
/**
 * Download priority Americo File/Get PDFs through the armed portal tab (session cookies).
 * Uses sync XHR + chunked base64 because bridge evaluate is not async.
 *
 * Usage: node scripts/americo-bridge-download-pdfs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HOST = process.env.MVI_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.MVI_BRIDGE_PORT || 9334);
const TOKEN = process.env.MVI_BRIDGE_TOKEN || "mvi-local-bridge";
const BASE = `http://${HOST}:${PORT}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const PDF_DIR = path.join(REPO, "integrations", "knowledge", "Americo_Knowledge", "raw", "pdfs");
const CHUNK = 180000;

const FILES = [
  { id: 21041, name: "Eagle_Select_Agent_Guide_21041.pdf" },
  { id: 20720, name: "Eagle_Select_Highlights_20720.pdf" },
  { id: 20741, name: "Eagle_Select_Quit_Smoking_Advantage_Flyer_20741.pdf" },
  { id: 21108, name: "Eagle_Select_Reference_Sheet_21108.pdf" },
  { id: 20742, name: "Eagle_Select_Smoking_Advantage_Agent_FAQ_20742.pdf" },
  { id: 20725, name: "Eagle_Select_Spec_Flyer_20725.pdf" },
  { id: 20894, name: "Eagle_Select_Underwriting_Flyer_20894.pdf" },
  { id: 21216, name: "Instant_Decision_eApp_UW_Quick_Reference_21216.pdf" },
  { id: 20732, name: "Eagle_Select_Client_Brochure_20732.pdf" },
  { id: 20876, name: "Eagle_Select_Quit_Smoking_Client_FAQ_20876.pdf" },
  { id: 19271, name: "AdvantageWL_Agent_Guide_19271.pdf" },
  { id: 21217, name: "AdvantageWL_UW_Quick_Reference_21217.pdf" },
  { id: 20689, name: "AdvantageWL_Client_Brochure_20689.pdf" },
  { id: 20900, name: "IUL_Agent_Guide_20900.pdf" },
  { id: 20901, name: "IUL_Highlights_20901.pdf" },
  { id: 20881, name: "IUL_Client_Brochure_20881.pdf" },
  { id: 20911, name: "Instant_Decision_Term_Agent_Guide_20911.pdf" },
  { id: 20166, name: "DIR_Occupations_Guidelines_20166.pdf" },
  { id: 20617, name: "Instant_Decision_Term_Highlights_20617.pdf" },
  { id: 20590, name: "Term_Products_at_a_Glance_20590.pdf" },
  { id: 20703, name: "Continuation_10_25_Client_Brochure_20703.pdf" },
  { id: 20163, name: "Payment_Protector_Highlights_20163.pdf" },
  { id: 20159, name: "Payment_Protector_Client_Brochure_20159.pdf" },
  { id: 20160, name: "Payment_Protector_Continuation_Brochure_20160.pdf" },
  { id: 21282, name: "Elite_5_Agent_Guide_21282.pdf" },
  { id: 20205, name: "Annuity_Products_at_a_Glance_20205.pdf" },
  { id: 21279, name: "Elite_5_Client_Brochure_21279.pdf" },
  { id: 20284, name: "Platinum_Assure_Series_Agent_Guide_20284.pdf" },
  { id: 19480, name: "Platinum_Assure_Series_Client_Brochure_19480.pdf" },
  { id: 20204, name: "Platinum_Assure_5_Client_Brochure_20204.pdf" },
  { id: 20203, name: "Platinum_Assure_5_Agent_Guide_20203.pdf" },
  { id: 20724, name: "Instant_Decision_Term_TriFold_20724.pdf" },
  { id: 21276, name: "Current_Interest_Rates_21276.pdf" },
  { id: 21058, name: "Product_Availability_Guide_21058.pdf" },
  { id: 21106, name: "Advertising_Compliance_Guidelines_21106.pdf" },
  { id: 20878, name: "Contracting_New_Business_Guidelines_20878.pdf" },
  { id: 21286, name: "Who_to_Call_21286.pdf" },
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

function extractPdf(pdfPath) {
  const txtPath = pdfPath.replace(/\.pdf$/i, ".txt");
  const r = spawnSync("pdftotext", ["-layout", pdfPath, txtPath], { encoding: "utf8" });
  if (r.status !== 0) {
    const r2 = spawnSync("pdftotext", [pdfPath, txtPath], { encoding: "utf8" });
    if (r2.status !== 0) {
      console.warn("  pdftotext failed", r.stderr || r2.stderr);
      return null;
    }
  }
  return txtPath;
}

async function fetchChunk(fileId, offset) {
  const code = `(() => {
    const id = ${fileId};
    const offset = ${offset};
    const limit = ${CHUNK};
    if (!window.__mviPdf || window.__mviPdf.id !== id) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://portal.americoagent.com/File/Get/" + id, false);
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
      xhr.send(null);
      window.__mviPdf = {
        id: id,
        status: xhr.status,
        type: xhr.getResponseHeader("content-type") || "",
        disp: xhr.getResponseHeader("content-disposition") || "",
        bin: xhr.responseText || ""
      };
    }
    const c = window.__mviPdf;
    const slice = c.bin.substring(offset, offset + limit);
    let s = "";
    for (let i = 0; i < slice.length; i++) s += String.fromCharCode(slice.charCodeAt(i) & 255);
    return { status: c.status, len: c.bin.length, type: c.type, disp: c.disp, offset: offset, n: slice.length, b64: btoa(s) };
  })()`;
  return evalCode(code);
}

async function downloadOne(file) {
  const dest = path.join(PDF_DIR, file.name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log("skip existing", file.name);
    return dest;
  }
  process.stdout.write(`↓ ${file.id} ${file.name} `);
  let first = await fetchChunk(file.id, 0);
  if (!first || first.status !== 200 || !first.len) {
    console.log("FAIL status", first && first.status, first && first.type);
    return null;
  }
  const buf = Buffer.alloc(first.len);
  Buffer.from(first.b64, "base64").copy(buf, 0);
  let got = first.n;
  while (got < first.len) {
    const part = await fetchChunk(file.id, got);
    if (!part || !part.n) break;
    Buffer.from(part.b64, "base64").copy(buf, got);
    got += part.n;
    process.stdout.write(".");
  }
  fs.writeFileSync(dest, buf);
  const mag = buf.slice(0, 5).toString("utf8");
  console.log(` ${buf.length} bytes ${mag.startsWith("%PDF") ? "PDF" : mag}`);
  return dest;
}

async function main() {
  fs.mkdirSync(PDF_DIR, { recursive: true });
  await command("navigate", { url: "https://portal.americoagent.com/" });
  await sleep(1500);
  for (const file of FILES) {
    try {
      const dest = await downloadOne(file);
      if (dest) extractPdf(dest);
    } catch (e) {
      console.log("FAIL", file.id, e.message);
    }
  }
  console.log("Done PDF download");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
