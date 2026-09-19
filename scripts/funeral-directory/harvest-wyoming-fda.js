#!/usr/bin/env node
/**
 * Harvest Wyoming Funeral Directors Association public member list.
 * Name, street, city, phone, website. No GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-wyoming-fda.js
 */
const fs = require("fs");
const path = require("path");
const { formatPhone, httpsUrl } = require("./nap-from-site");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "wyoming-funeral-homes.json");
const SRC = "https://www.wyomingfda.org/wyfda-members";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function cleanHomeName(name) {
  let n = decode(name)
    .replace(/^co\s*n\s*tact:\s*/i, "")
    .replace(/^c\s*o\s*ntact:\s*/i, "")
    .replace(/^.*contact:\s*/i, "")
    .trim();
  const m = n.match(
    /\b((?:[A-Z][\w'.-]+(?:\s+|,\s+|&\s+|-\s+)*)+(?:Funeral|Mortuary|Chapel|Cremation|Memorial)[\w .,&'-]*)/
  );
  if (m) n = m[1].trim();
  return n.replace(/\s+P\.O\. Box$/i, "").trim();
}
function decode(s) {
  return String(s || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function isCityHeading(t) {
  if (!t || t.length > 32) return false;
  if (/members|explore|resources|association|wyoming funeral/i.test(t)) return false;
  if (/\d/.test(t)) return false;
  if (/phone:|website:/i.test(t)) return false;
  return /^[A-Z][A-Za-z .'-]+$/.test(t) && t.split(" ").length <= 3;
}

function splitHomes(block, city) {
  const text = decode(block);
  const parts = [];
  const re = /([\s\S]*?Website:\s*https?:\/\/\S+)/gi;
  let m;
  while ((m = re.exec(text))) parts.push(decode(m[1]));
  const use = parts.length ? parts : /Phone:/i.test(text) ? [text] : [];
  const out = [];
  use.forEach((chunk) => {
    const phone = formatPhone((chunk.match(/Phone:\s*([0-9)(.\s-]{10,22})/i) || [])[1]);
    let website = (chunk.match(/https?:\/\/[^\s]+/i) || [])[0] || "";
    website = httpsUrl(website.replace(/https?:\/\/https?:\/\//i, "https://").replace(/[.,;]+$/, ""));
    const beforePhone = chunk.split(/Phone:/i)[0];
    const numAt = beforePhone.search(/\d/);
    const named = cleanHomeName(numAt > 0 ? beforePhone.slice(0, numAt) : beforePhone);
    if (!named || named.length < 4 || /^non-firm/i.test(named)) return;
    let street = "";
    if (numAt >= 0) {
      const rest = beforePhone.slice(numAt);
      street = decode(rest.split(new RegExp(`\\s+${city}\\s+WY`, "i"))[0])
        .replace(/\s*-\s*P\.?O\.?\s*Box.*$/i, "")
        .replace(/\s*-\s*$/, "");
    }
    out.push({
      name: named.slice(0, 120),
      street,
      city,
      region: "WY",
      phone,
      website,
    });
  });
  return out;
}

async function main() {
  const res = await fetch(SRC, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`WYFDA ${res.status}`);
  const html = await res.text();
  const paras = [...html.matchAll(/class="dmNewParagraph"[^>]*>([\s\S]{0,2000}?)<\/div>/g)].map((m) =>
    decode(m[1].replace(/<[^>]+>/g, " "))
  );
  const homes = [];
  let city = "";
  for (const p of paras) {
    if (/^Non-Firm Members$/i.test(p)) break;
    if (isCityHeading(p)) {
      city = p;
      continue;
    }
    if (!city) continue;
    homes.push(...splitHomes(p, city));
  }
  const seen = new Set();
  const uniq = homes.filter((h) => {
    const k = `${h.name}|${h.city}|${h.phone}`.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  uniq.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: SRC,
        sourceName: "Wyoming Funeral Directors Association member list",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "WY",
        homes: uniq,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`wrote ${OUT} (${uniq.length} homes, ${new Set(uniq.map((h) => h.city)).size} cities)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
