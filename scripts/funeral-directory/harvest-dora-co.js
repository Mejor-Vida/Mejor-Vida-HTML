#!/usr/bin/env node
/**
 * Harvest Colorado DORA funeral establishments (FES roster).
 * Contacts only — no GPL dollars. Website/phone overlay from first-party
 * links listed by the Funeral Consumer Society of Colorado directory
 * (phones and URLs only; never copy FCSC price columns).
 *
 * Usage: node scripts/funeral-directory/harvest-dora-co.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "colorado-funeral-homes.json");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const GEN = "https://apps2.colorado.gov/dora/licensing/Lookup/GenerateRoster.aspx";
const FCSC = "https://funeralconsumercolorado.org/directory";
const FES_CHECKBOX = "ctl00$MainContentPlaceHolder$ckbRoster64";

function strip(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, String.fromCharCode(34))
    .replace(/\s+/g, " ")
    .trim();
}

function fold(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatPhone(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    return `${d.slice(1, 4)}-${d.slice(4, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return "";
}

function httpsUrl(url) {
  const raw = String(url || "").trim();
  if (!raw || /^javascript:/i.test(raw) || /^mailto:/i.test(raw)) return "";
  if (/@/.test(raw) || /gmail\.com/i.test(raw)) return "";
  if (raw.startsWith("//")) return `https:${raw}`;
  if (/^https?:\/\//i.test(raw)) {
    const href = raw.replace(/^http:\/\//i, "https://");
    try {
      const host = new URL(href).hostname.replace(/^www\./, "");
      if (
        /bing\.com|google\.com|facebook\.com|yelp\.com|funeralocity|memorialmerits|funeralconsumer|yahoo\.com/i.test(
          host
        )
      ) {
        return "";
      }
    } catch {
      return "";
    }
    if (/@/.test(href) || /gmail\.com/i.test(href)) return "";
    return href;
  }
  if (/^[a-z0-9.-]+\.[a-z]{2,}/i.test(raw)) return `https://${raw}`;
  return "";
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i += 1;
        continue;
      }
      inQ = !inQ;
      continue;
    }
    if (c === "," && !inQ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function parseCsv(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || "").trim();
    });
    return row;
  });
}

function hiddenInputs(html) {
  const out = {};
  const re = /<input[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const name = (tag.match(/name="([^"]+)"/i) || [])[1];
    if (!name) continue;
    const type = ((tag.match(/type="([^"]+)"/i) || [])[1] || "").toLowerCase();
    if (type === "checkbox" || type === "radio") {
      if (/\bchecked\b/i.test(tag)) {
        out[name] = (tag.match(/value="([^"]*)"/i) || [])[1] || "on";
      }
      continue;
    }
    if (type === "image" || type === "button" || type === "submit") continue;
    const val = (tag.match(/value="([^"]*)"/i) || [])[1];
    if (val != null) out[name] = val;
  }
  return out;
}

function cookieHeader(res) {
  const list = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  return list.map((c) => c.split(";")[0]).join("; ");
}

async function downloadFesCsv() {
  const r1 = await fetch(GEN, {
    headers: { "user-agent": UA, accept: "text/html" },
  });
  if (!r1.ok) throw new Error(`GenerateRoster GET ${r1.status}`);
  const cookies = cookieHeader(r1);
  const html1 = await r1.text();
  const fields = hiddenInputs(html1);
  fields[FES_CHECKBOX] = "on";
  fields["ctl00$MainContentPlaceHolder$btnRosterContinue"] = "Continue";
  const r2 = await fetch(GEN, {
    method: "POST",
    headers: {
      "user-agent": UA,
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookies,
      origin: "https://apps2.colorado.gov",
      referer: GEN,
    },
    body: new URLSearchParams(fields),
    redirect: "follow",
  });
  const html2 = await r2.text();
  const id = (html2.match(/OpenFileDownloadWindow\((\d+)/) || [])[1];
  if (!id) throw new Error("DORA roster download id not found");
  const dl = `https://apps2.colorado.gov/dora/licensing/Lookup/FileDownload.aspx?Idnt=${id}&Type=Comma`;
  const r3 = await fetch(dl, {
    headers: {
      "user-agent": UA,
      cookie: cookies,
      referer: "https://apps2.colorado.gov/dora/licensing/Lookup/DownloadRoster.aspx",
      accept: "text/csv,application/octet-stream,*/*",
    },
  });
  if (!r3.ok) throw new Error(`FileDownload ${r3.status}`);
  return r3.text();
}

function parseFcscContacts(html) {
  const table = (html.match(/<table[\s\S]+?<\/table>/i) || [])[0] || "";
  const rows = table.split(/<tr/i).slice(1);
  const out = [];
  rows.forEach((tr) => {
    const tds = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) => m[1]);
    if (tds.length < 10) return;
    const city = strip(tds[0]);
    const name = strip(tds[2]);
    if (!city || !name) return;
    const href = ((tds[9] || "").match(/href=["']([^"']+)["']/i) || [])[1] || "";
    out.push({
      city,
      name,
      phone: formatPhone(strip(tds[8])),
      website: httpsUrl(href || strip(tds[9])),
    });
  });
  return out;
}

function overlayKey(name, city) {
  return `${fold(name)}|${fold(city)}`;
}

function sameHome(a, b) {
  const fa = fold(a);
  const fb = fold(b);
  if (!fa || !fb) return false;
  if (fa === fb) return true;
  return fa.includes(fb) || fb.includes(fa);
}

function findOverlay(home, byKey, overlay) {
  const exact = byKey.get(overlayKey(home.name, home.city));
  if (exact) return exact;
  const hits = overlay.filter((o) => sameHome(o.name, home.name));
  if (hits.length === 1) return hits[0];
  const cityHits = hits.filter((o) => fold(o.city) === fold(home.city));
  return cityHits[0] || null;
}

function applyContact(home, overlay) {
  if (!overlay) return home;
  return {
    ...home,
    phone: home.phone || overlay.phone || "",
    website: home.website || overlay.website || "",
  };
}

function fromRow(row) {
  const status = row["License Status Description"] || "";
  if (!/^active/i.test(status)) return null;
  const name = row["Entity Name"] || row["Formatted Name"] || "";
  const city = row.City || "";
  if (!name || !city) return null;
  const street = [row["Address Line 1"], row["Address Line 2"]].filter(Boolean).join(", ");
  return {
    name,
    street,
    city,
    region: row.State || "CO",
    county: (row.County || "").replace(/\s+County$/i, ""),
    zip: row["Mail Zip Code"] || "",
    phone: "",
    website: "",
    license: `FES-${row["License Number"] || ""}`.replace(/-$/, ""),
    status,
  };
}

async function main() {
  const csv = await downloadFesCsv();
  const rows = parseCsv(csv);
  const seen = new Set();
  const homes = [];
  rows.forEach((row) => {
    const home = fromRow(row);
    if (!home) return;
    const key = `${home.license}|${fold(home.street)}|${fold(home.city)}`;
    if (seen.has(key)) return;
    seen.add(key);
    homes.push(home);
  });

  let overlay = [];
  try {
    const res = await fetch(FCSC, {
      headers: { "user-agent": UA, accept: "text/html" },
      redirect: "follow",
    });
    if (res.ok) overlay = parseFcscContacts(await res.text());
  } catch {
    overlay = [];
  }
  const byKey = new Map();
  overlay.forEach((o) => {
    const k = overlayKey(o.name, o.city);
    if (!byKey.has(k)) byKey.set(k, o);
  });
  const merged = homes.map((home) => applyContact(home, findOverlay(home, byKey, overlay)));

  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: "https://apps2.colorado.gov/dora/licensing/Lookup/GenerateRoster.aspx",
        sourceName: "Colorado DORA funeral establishment (FES) roster",
        harvested: new Date().toISOString().slice(0, 10),
        homes: merged,
      },
      null,
      2
    ) + "\n"
  );
  const withWeb = merged.filter((h) => h.website).length;
  const withPhone = merged.filter((h) => h.phone).length;
  console.log(
    `wrote ${OUT} (${merged.length} homes, ${new Set(merged.map((h) => h.city)).size} cities, ${withPhone} phones, ${withWeb} websites)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
