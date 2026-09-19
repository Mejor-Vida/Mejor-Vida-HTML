#!/usr/bin/env node
/**
 * Find first-party GPL / pricing pages on Kansas funeral-home websites.
 * Does not invent prices. Writes a report to data/kansas-gpl-probe.json.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const places = require("./kansas-places");
const OUT = path.join(ROOT, "data", "kansas-gpl-probe.json");

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

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

function isPricingHay(hay) {
  return /gpl|general[-_\s]?price|price[-_\s]?list|pricing|packages?[-_\s]?price|funeral[-_\s]?pric|cremation[-_\s]?pric|costs?\/|\/costs|lista[-_\s]?general|precios|gather\.app\/gpl/i.test(
    hay
  );
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
    if (isPricingHay(hay)) out.push({ href, text: text.slice(0, 140) });
  }
  const pdfs = html.matchAll(/href=["']([^"']+\.pdf[^"']*)["']/gi);
  for (const p of pdfs) {
    const href = absUrl(p[1], base);
    if (href && /price|gpl|cost|cremat|funeral|package/i.test(href)) {
      out.push({ href, text: "PDF" });
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
    /direct cremation[^$.]{0,80}\$?\s*[0-9,]{3,7}/gi,
    /immediate burial[^$.]{0,80}\$?\s*[0-9,]{3,7}/gi,
    /traditional funeral[^$.]{0,80}\$?\s*[0-9,]{3,7}/gi,
    /memorial (?:service|cremation|package)[^$.]{0,80}\$?\s*[0-9,]{3,7}/gi,
    /cremation with (?:memorial|service)[^$.]{0,80}\$?\s*[0-9,]{3,7}/gi,
    /simple cremation[^$.]{0,80}\$?\s*[0-9,]{3,7}/gi,
  ];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(text)) && hits.length < 16) {
      hits.push(m[0].replace(/\s+/g, " ").slice(0, 180));
    }
  });
  return {
    mentionsGpl: /\b(general price list|\bgpl\b|lista general de precios|packages price list|funeral price list)\b/i.test(
      lower
    ),
    hints: hits,
  };
}

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 14000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "user-agent": UA,
        accept: "text/html,application/pdf,*/*",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    const ctype = res.headers.get("content-type") || "";
    const body = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      finalUrl: res.url,
      ctype,
      body: body.slice(0, 450000),
    };
  } catch (err) {
    return { ok: false, status: 0, error: String(err.message || err) };
  } finally {
    clearTimeout(t);
  }
}

function pickFollow(links) {
  const rank = (href) => {
    const h = href.toLowerCase();
    if (/gather\.app\/gpl/.test(h)) return 0;
    if (/packages-price-list|packages_price/.test(h)) return 1;
    if (/funeral-price-list|general-price|gpl/.test(h)) return 2;
    if (/\.pdf(\?|$)/.test(h) && /price|gpl|cost/.test(h)) return 3;
    if (/\/costs\//.test(h)) return 4;
    return 5;
  };
  return [...links].sort((a, b) => rank(a.href) - rank(b.href))[0] || null;
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
  console.log(`probing ${homes.length} unique Kansas sites`);
  const results = await mapPool(homes, 5, async (site) => {
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
      followed: "",
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
    const homeHints = extractHints(home.body || "");
    rec.mentionsGpl = homeHints.mentionsGpl;
    rec.hints = homeHints.hints;
    const follow = pickFollow(rec.links);
    if (follow && follow.href !== (home.finalUrl || site.href)) {
      rec.followed = follow.href;
      const page = await fetchText(follow.href);
      if (page.ok && !/pdf/i.test(page.ctype || "")) {
        const more = extractHints(page.body || "");
        rec.mentionsGpl = rec.mentionsGpl || more.mentionsGpl;
        rec.hints = [...rec.hints, ...more.hints].slice(0, 16);
      } else if (page.ok && /pdf/i.test(page.ctype || "")) {
        rec.mentionsGpl = true;
        rec.hints.push("followed link is PDF");
      }
    }
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
        withHints: results.filter((r) => r.hints && r.hints.length).length,
        results,
      },
      null,
      2
    ) + "\n"
  );
  console.log(
    `wrote ${OUT} (${promising.length} promising, ${results.filter((r) => r.hints && r.hints.length).length} with dollar hints / ${results.length} sites)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
