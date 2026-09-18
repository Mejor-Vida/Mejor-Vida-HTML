#!/usr/bin/env node
/**
 * Find first-party GPL / pricing pages on Nebraska funeral-home websites.
 * Does not invent prices. Writes a report to data/nebraska-gpl-probe.json.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const places = require("./nebraska-places");
const OUT = path.join(ROOT, "data", "nebraska-gpl-probe.json");

const UA =
  "MejorVidaInsuranceBot/1.0 (+https://www.mejorvidainsurance.com/funerarias-cementerios.html)";

function fold(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function absUrl(href, base) {
  try {
    return new URL(href, base).href;
  } catch {
    return "";
  }
}

function uniqueHomes() {
  const seen = new Map();
  places.forEach((place) => {
    (place.homes || []).forEach((home) => {
      const href = String(home.href || "").trim();
      if (!href) return;
      let host = "";
      try {
        host = new URL(href).hostname.replace(/^www\./, "");
      } catch {
        return;
      }
      if (!seen.has(host)) {
        seen.set(host, {
          host,
          href,
          names: [home.name],
          ids: [home.id],
          cities: [place.nameEn],
        });
      } else {
        const rec = seen.get(host);
        if (!rec.names.includes(home.name)) rec.names.push(home.name);
        if (!rec.ids.includes(home.id)) rec.ids.push(home.id);
        if (!rec.cities.includes(place.nameEn)) rec.cities.push(place.nameEn);
      }
    });
  });
  return [...seen.values()];
}

function extractLinks(html, base) {
  const out = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = absUrl(m[1], base);
    const text = String(m[2] || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!href) continue;
    const hay = `${href} ${text}`.toLowerCase();
    if (
      /gpl|general[-_\s]?price|price[-_\s]?list|pricing|costs?|cremation[-_\s]?pric|funeral[-_\s]?pric|lista[-_\s]?general|precios/.test(
        hay
      )
    ) {
      out.push({ href, text: text.slice(0, 140) });
    }
  }
  const uniq = [];
  const seen = new Set();
  out.forEach((l) => {
    const key = l.href.split("#")[0];
    if (seen.has(key)) return;
    seen.add(key);
    uniq.push(l);
  });
  return uniq.slice(0, 12);
}

function extractHints(html) {
  const text = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const lower = text.toLowerCase();
  const hits = [];
  const patterns = [
    /direct cremation[^$.]{0,80}\$?\s*([0-9,]{3,7})/gi,
    /immediate burial[^$.]{0,80}\$?\s*([0-9,]{3,7})/gi,
    /traditional funeral[^$.]{0,80}\$?\s*([0-9,]{3,7})/gi,
    /memorial (?:service|cremation)[^$.]{0,80}\$?\s*([0-9,]{3,7})/gi,
    /cremaci[oó]n directa[^$.]{0,80}\$?\s*([0-9,]{3,7})/gi,
  ];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(text)) && hits.length < 16) {
      hits.push(m[0].replace(/\s+/g, " ").slice(0, 160));
    }
  });
  return {
    mentionsGpl: /\b(general price list|\bgpl\b|lista general de precios)\b/i.test(lower),
    hints: hits,
  };
}

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "user-agent": UA, accept: "text/html,application/pdf,*/*" },
    });
    const ctype = res.headers.get("content-type") || "";
    const body = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      ctype,
      body: body.slice(0, 400000),
    };
  } catch (err) {
    return { ok: false, status: 0, error: String(err.message || err) };
  } finally {
    clearTimeout(t);
  }
}

async function mapPool(items, size, fn) {
  const out = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, worker));
  return out;
}

async function main() {
  const homes = uniqueHomes();
  console.log(`probing ${homes.length} unique sites`);
  const results = await mapPool(homes, 6, async (site) => {
    const home = await fetchText(site.href);
    const rec = {
      host: site.host,
      href: site.href,
      names: site.names,
      ids: site.ids,
      cities: site.cities,
      status: home.status,
      error: home.error || "",
      finalUrl: home.finalUrl || "",
      links: [],
      mentionsGpl: false,
      hints: [],
    };
    if (!home.ok) return rec;
    if (/pdf/i.test(home.ctype || "") || /\.pdf(\?|$)/i.test(home.finalUrl || site.href)) {
      rec.links.push({ href: home.finalUrl || site.href, text: "homepage is PDF" });
      rec.mentionsGpl = true;
      return rec;
    }
    rec.links = extractLinks(home.body || "", home.finalUrl || site.href);
    const hints = extractHints(home.body || "");
    rec.mentionsGpl = hints.mentionsGpl;
    rec.hints = hints.hints;
    return rec;
  });
  const promising = results.filter(
    (r) => r.links.length || r.mentionsGpl || (r.hints && r.hints.length)
  );
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        updated: new Date().toISOString().slice(0, 10),
        sites: results.length,
        promising: promising.length,
        results,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`wrote ${OUT} (${promising.length} promising / ${results.length} sites)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
