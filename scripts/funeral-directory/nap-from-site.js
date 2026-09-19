/**
 * Pull name/address/phone from a funeral home's own website (JSON-LD or microdata).
 * Does not invent values. Returns empty fields when the page does not publish them.
 */
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function fold(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function plausibleCity(city) {
  const t = fold(city);
  if (!t || t.length < 3 || t.length > 40) return false;
  if (/\b(street|avenue|ave|road|blvd|drive|lane|court|highway|hwy|box|suite|floor)\b/.test(t)) {
    return false;
  }
  if (/\b(staff|serving|caring|contact|phone|website|about)\b/.test(t)) return false;
  return true;
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
  if (!raw) return "";
  if (raw.startsWith("//")) return `https:${raw}`;
  if (/^https?:\/\//i.test(raw)) return raw.replace(/^http:\/\//i, "https://");
  if (/^https?:\/\//i.test(`http://${raw}`)) return `https://${raw.replace(/^https?:\/\//i, "")}`;
  return "";
}

function walkJson(node, out) {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((n) => walkJson(n, out));
    return;
  }
  if (typeof node !== "object") return;
  const type = String(node["@type"] || "");
  if (node.address) walkJson(node.address, out);
  if (node.location) walkJson(node.location, out);
  if (node["@graph"]) walkJson(node["@graph"], out);
  const addr = node.address && typeof node.address === "object" ? node.address : node;
  if (addr.addressLocality && !out.city) out.city = String(addr.addressLocality).trim();
  if (addr.streetAddress && !out.street) out.street = String(addr.streetAddress).replace(/\s+/g, " ").trim();
  if (addr.addressRegion && !out.region) out.region = String(addr.addressRegion).trim();
  if (addr.postalCode && !out.zip) out.zip = String(addr.postalCode).trim();
  if ((node.telephone || addr.telephone) && !out.phone) {
    out.phone = formatPhone(node.telephone || addr.telephone);
  }
  if (/LocalBusiness|Funeral|Organization|Place/i.test(type) && node.name && !out.jsonName) {
    out.jsonName = String(node.name).trim();
  }
}

function parseJsonLd(html) {
  const out = { city: "", street: "", region: "", zip: "", phone: "" };
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      walkJson(JSON.parse(m[1].replace(/[\u0000-\u001f]/g, " ")), out);
    } catch {
      /* skip broken json-ld */
    }
  }
  return out;
}

function parseMicrodata(html) {
  const grab = (prop) => {
    const re = new RegExp(`itemprop=["']${prop}["'][^>]*>([^<]+)`, "i");
    const m = html.match(re);
    return m ? String(m[1]).replace(/\s+/g, " ").trim() : "";
  };
  const content = (prop) => {
    const re = new RegExp(`itemprop=["']${prop}["'][^>]*content=["']([^"']+)`, "i");
    const m = html.match(re);
    return m ? m[1].trim() : "";
  };
  return {
    city: grab("addressLocality") || content("addressLocality"),
    street: grab("streetAddress") || content("streetAddress"),
    region: grab("addressRegion") || content("addressRegion"),
    zip: grab("postalCode") || content("postalCode"),
    phone: formatPhone(grab("telephone") || content("telephone")),
  };
}

function stateAliases(code) {
  const c = String(code || "").toUpperCase();
  const names = {
    IA: "Iowa",
    MO: "Missouri",
    WY: "Wyoming",
    KS: "Kansas",
    NE: "Nebraska",
    CO: "Colorado",
    NV: "Nevada",
    OK: "Oklahoma",
    SD: "South Dakota",
    ND: "North Dakota",
    MT: "Montana",
    MN: "Minnesota",
    ID: "Idaho",
    UT: "Utah",
    AZ: "Arizona",
    NM: "New Mexico",
    IL: "Illinois",
    TX: "Texas",
  };
  return names[c] ? `${c}|${names[c]}` : c;
}

function parseFooterCity(html, expectedState) {
  const title = String((String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "")
    .replace(/\s+/g, " ")
    .trim();
  const text = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const st = String(expectedState || "").replace(/[^A-Za-z]/g, "");
  if (st.length !== 2) return { city: "", street: "", zip: "", phone: "" };
  const alias = stateAliases(st);
  const cityRe = new RegExp(
    `\\b([A-Z][A-Za-z.'\\-]+(?:\\s+(?:or|[A-Z][A-Za-z.'\\-]+)){0,3}),\\s*(?:${alias})\\b(?:\\s+(\\d{5}))?`,
    "g"
  );
  const fromTitle = cityRe.exec(title);
  if (fromTitle) {
    return { city: fromTitle[1].trim(), street: "", zip: fromTitle[2] || "", phone: formatPhone(text) };
  }
  cityRe.lastIndex = 0;
  const m = cityRe.exec(text);
  if (!m) return { city: "", street: "", zip: "", phone: formatPhone(text) };
  return { city: m[1].trim(), street: "", zip: m[2] || "", phone: formatPhone(text) };
}

function mergeNap(parts, expectedState) {
  const out = { city: "", street: "", region: "", zip: "", phone: "" };
  for (const p of parts) {
    if (!p) continue;
    if (!out.city && p.city && plausibleCity(p.city)) out.city = p.city;
    if (!out.street && p.street) out.street = p.street;
    if (!out.region && p.region) out.region = p.region;
    if (!out.zip && p.zip) out.zip = p.zip;
    if (!out.phone && p.phone) out.phone = p.phone;
  }
  const want = fold(expectedState);
  if (out.region) {
    const got = fold(out.region);
    if (got && want && got !== want && got !== want.slice(0, 2) && want.indexOf(got) === -1) {
      if (got.length === 2 && want.length > 2) {
        /* allow "IA" vs "Iowa" — caller passes code */
      } else if (got.length > 2 && want.length === 2) {
        /* allow */
      } else if (got !== want) {
        /* keep city only if region looks like the same state abbreviation or name */
      }
    }
  }
  return out;
}

async function fetchHtml(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "user-agent": UA,
        accept: "text/html,*/*",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    const ctype = res.headers.get("content-type") || "";
    if (!res.ok || /pdf/i.test(ctype)) {
      return { ok: false, status: res.status, html: "" };
    }
    const html = await res.text();
    return { ok: true, status: res.status, html: html.slice(0, 500000), finalUrl: res.url };
  } catch {
    return { ok: false, status: 0, html: "" };
  } finally {
    clearTimeout(t);
  }
}

async function napFromSite(url, expectedStateCode) {
  const href = httpsUrl(url);
  if (!href) return { city: "", street: "", phone: "", href: "" };
  let host = "";
  try {
    host = new URL(href).hostname;
  } catch {
    return { city: "", street: "", phone: "", href: "" };
  }
  if (/google|bing|facebook|instagram|yelp|youtube|gmail/.test(host)) {
    return { city: "", street: "", phone: "", href: "" };
  }
  const page = await fetchHtml(href);
  if (!page.ok) return { city: "", street: "", phone: "", href };
  const json = parseJsonLd(page.html);
  const micro = parseMicrodata(page.html);
  const footer = parseFooterCity(page.html, expectedStateCode);
  const merged = mergeNap([json, micro, footer], expectedStateCode);
  if (String(expectedStateCode).toUpperCase() === "NM" && /consequences/i.test(merged.city || "")) {
    merged.city = "Truth or Consequences";
  }
  const title = String((page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "")
    .replace(/\s+/g, " ")
    .replace(/\s*[|\-–—].*$/, "")
    .trim();
  return {
    city: merged.city,
    street: merged.street,
    phone: merged.phone,
    href,
    name: json.jsonName || title,
  };
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

module.exports = {
  formatPhone,
  httpsUrl,
  napFromSite,
  mapPool,
  fold,
  plausibleCity,
};
