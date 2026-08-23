#!/usr/bin/env node
/**
 * Pass 3: remaining informational Forms (CO/NE replacement AAA8327, NV alcohol,
 * ICC military, annuity e-sign/replacement, PAC/fax/delivery). Still skips
 * print-only pocket folder, recruiting ads, W-9, and admin change forms.
 *
 * Usage: node scripts/americo-bridge-download-pdfs-pass3.mjs
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
const PDF_DIR = path.join(REPO, "integrations", "knowledge", "Americo_Knowledge", "raw", "pdfs");
const CHUNK = 180000;

const FILES = [
  { id: 20838, name: "Replacement_Notice_AAA8327_20838.pdf" },
  { id: 15981, name: "Annuity_Replacement_Notice_15981.pdf" },
  { id: 20088, name: "Electronic_Signature_Delivery_Authorization_Annuity_20088.pdf" },
  { id: 15697, name: "UW_Alcohol_Questionnaire_NV_15697.pdf" },
  { id: 19105, name: "UW_Military_Questionnaire_ICC_19105.pdf" },
  { id: 15455, name: "Faxed_Application_Transmittal_15455.pdf" },
  { id: 15146, name: "Generic_Delivery_Receipt_15146.pdf" },
  { id: 21292, name: "Bank_Draft_Authorization_21292.pdf" },
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
        bin: xhr.responseText || ""
      };
    }
    const c = window.__mviPdf;
    const slice = c.bin.substring(offset, offset + limit);
    let s = "";
    for (let i = 0; i < slice.length; i++) s += String.fromCharCode(slice.charCodeAt(i) & 255);
    return { status: c.status, len: c.bin.length, type: c.type, offset: offset, n: slice.length, b64: btoa(s) };
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
  const first = await fetchChunk(file.id, 0);
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
  await sleep(2000);
  let ok = 0;
  let fail = 0;
  for (const file of FILES) {
    try {
      const dest = await downloadOne(file);
      if (dest) ok++;
      else fail++;
    } catch (e) {
      fail++;
      console.log("FAIL", file.id, e.message);
    }
  }
  console.log("Done pass3 ok", ok, "fail", fail);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
