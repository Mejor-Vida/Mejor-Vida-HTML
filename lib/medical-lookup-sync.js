/**
 * Medical intake search — live proxy to RxNorm, NPI Registry, ICD-10, Zippopotam.
 * Server-side only (browser never calls public APIs directly).
 * No local directory download or lookup-table caching required.
 */

function normKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function fetchJson(url, opts) {
  const r = await fetch(url, Object.assign({ headers: { Accept: "application/json" } }, opts || {}));
  const text = await r.text();
  if (!r.ok) throw new Error(`fetch ${r.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text || "{}");
}

function parseZip(zip) {
  const z = String(zip || "").replace(/\D/g, "").slice(0, 5);
  return z.length === 5 ? z : null;
}

async function geocodeZip(zip) {
  const z = parseZip(zip);
  if (!z) return null;
  try {
    const data = await fetchJson(`https://api.zippopotam.us/us/${z}`);
    const place = data && data.places && data.places[0];
    if (!place) return null;
    return {
      zip: z,
      city: place["place name"] || "",
      state: place["state abbreviation"] || "",
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
    };
  } catch (_) {
    return { zip: z, city: "", state: "", lat: null, lng: null };
  }
}

async function searchDrugs(term) {
  const q = String(term || "").trim();
  if (q.length < 2) return [];
  const out = [];
  const seen = new Set();
  try {
    const spell = await fetchJson(
      `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encodeURIComponent(q)}`
    );
    const suggestions = (spell && spell.suggestionGroup && spell.suggestionGroup.suggestionList &&
      spell.suggestionGroup.suggestionList.suggestion) || [];
    const names = Array.isArray(suggestions) ? suggestions : suggestions ? [suggestions] : [];
    for (const name of names.slice(0, 15)) {
      if (!name || seen.has(normKey(name))) continue;
      seen.add(normKey(name));
      out.push({ name: String(name), rxcui: null, drug_type: "Generic" });
    }
  } catch (_) {
    /* spellings optional */
  }
  try {
    const drugs = await fetchJson(
      `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(q)}`
    );
    const groups = (drugs && drugs.drugGroup && drugs.drugGroup.conceptGroup) || [];
    for (const g of groups) {
      for (const c of g.conceptProperties || []) {
        const name = c.name || c.synonym || "";
        const rxcui = c.rxcui ? String(c.rxcui) : null;
        const key = normKey(name) + "|" + (rxcui || "");
        if (!name || seen.has(key)) continue;
        seen.add(key);
        out.push({
          name: String(name),
          rxcui,
          drug_type: g.tty === "SBD" ? "Brand" : g.tty === "BPCK" ? "Branded Generic" : "Generic",
        });
      }
    }
  } catch (_) {
    /* drugs.json optional */
  }
  return out.slice(0, 25);
}

async function searchDrugDosages(rxcui, drugName) {
  const id = String(rxcui || "").trim();
  const out = [];
  if (id) {
    try {
      const data = await fetchJson(
        `https://rxnav.nlm.nih.gov/REST/rxcui/${encodeURIComponent(id)}/related.json?tty=SCD+SCDF`
      );
      const groups = (data && data.relatedGroup && data.relatedGroup.conceptGroup) || [];
      for (const g of groups) {
        for (const c of g.conceptProperties || []) {
          if (c.name) {
            out.push({
              dosage_label: String(c.name),
              rxcui: c.rxcui ? String(c.rxcui) : id,
              default_quantity: 30,
            });
          }
        }
      }
    } catch (_) {
      /* fall through */
    }
  }
  if (!out.length && drugName) {
    try {
      const drugs = await fetchJson(
        `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`
      );
      const groups = (drugs && drugs.drugGroup && drugs.drugGroup.conceptGroup) || [];
      for (const g of groups) {
        for (const c of g.conceptProperties || []) {
          if (c.name) {
            out.push({
              dosage_label: String(c.name),
              rxcui: c.rxcui ? String(c.rxcui) : id || null,
              default_quantity: 30,
            });
          }
        }
      }
    } catch (_) {
      /* ignore */
    }
  }
  return out.slice(0, 40);
}

async function searchProviders(opts) {
  const zip = parseZip(opts && opts.zipCode);
  if (!zip) return { error: "zip_invalid", items: [] };
  const term = String((opts && opts.searchTerm) || "").trim();
  const parts = term.split(/\s+/).filter(Boolean);
  const params = new URLSearchParams({
    version: "2.1",
    postal_code: zip,
    enumeration_type: "NPI-1",
    limit: String(Math.min((opts && opts.perPage) || 20, 50)),
    skip: String((((opts && opts.page) || 1) - 1) * ((opts && opts.perPage) || 20)),
  });
  if (parts.length >= 2) {
    params.set("first_name", parts[0]);
    params.set("last_name", parts.slice(1).join(" "));
  } else if (parts.length === 1) {
    params.set("last_name", parts[0]);
  }
  const data = await fetchJson(`https://npiregistry.cms.hhs.gov/api/?${params}`);
  const results = Array.isArray(data.results) ? data.results : [];
  const geo = await geocodeZip(zip);
  const items = results.map((r) => {
    const basic = r.basic || {};
    const addr = (r.addresses || []).find((a) => a.address_purpose === "LOCATION") || r.addresses?.[0] || {};
    const tax = (r.taxonomies || [])[0] || {};
    const name =
      basic.organization_name ||
      [basic.first_name, basic.middle_name, basic.last_name].filter(Boolean).join(" ").trim() ||
      "Unknown";
    return {
      npi: String(r.number || ""),
      name,
      specialty: tax.desc || tax.primary || "",
      address_line: [addr.address_1, addr.address_2].filter(Boolean).join(", "),
      city: addr.city || geo?.city || "",
      state: addr.state || geo?.state || "",
      zip: (addr.postal_code || zip).slice(0, 5),
      phone: addr.telephone_number || "",
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
    };
  });
  return { items };
}

async function searchPharmacies(opts) {
  const zip = parseZip(opts && opts.zipCode);
  if (!zip) return { error: "zip_invalid", items: [] };
  const ptype = opts && opts.pharmacyType === "online" ? "online" : "physical";
  const params = new URLSearchParams({
    version: "2.1",
    postal_code: zip,
    enumeration_type: "NPI-2",
    limit: "25",
  });
  const name = String((opts && opts.pharmacyName) || "").trim();
  if (name) params.set("organization_name", name);
  const data = await fetchJson(`https://npiregistry.cms.hhs.gov/api/?${params}`);
  const results = Array.isArray(data.results) ? data.results : [];
  const geo = await geocodeZip(zip);
  const items = results.map((r) => {
    const basic = r.basic || {};
    const addr = (r.addresses || []).find((a) => a.address_purpose === "LOCATION") || r.addresses?.[0] || {};
    return {
      npi: String(r.number || ""),
      name: basic.organization_name || "Pharmacy",
      address_line: [addr.address_1, addr.address_2].filter(Boolean).join(", "),
      city: addr.city || geo?.city || "",
      state: addr.state || geo?.state || "",
      zip: (addr.postal_code || zip).slice(0, 5),
      phone: addr.telephone_number || "",
      pharmacy_type: ptype,
      lat: geo?.lat ?? null,
      lng: geo?.lng ?? null,
    };
  });
  return { items };
}

async function searchConditions(term) {
  const q = String(term || "").trim();
  if (q.length < 2) return [];
  const data = await fetchJson(
    `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(q)}&maxList=25`
  );
  const codes = Array.isArray(data[1]) ? data[1] : [];
  const names = Array.isArray(data[3]) ? data[3] : [];
  const out = [];
  for (let i = 0; i < codes.length; i++) {
    const code = String(codes[i] || "");
    const nameArr = names[i];
    const name = Array.isArray(nameArr) ? nameArr[0] : String(nameArr || code);
    if (!code) continue;
    out.push({ name: String(name), icd10_code: code });
  }
  return out;
}

module.exports = {
  parseZip,
  geocodeZip,
  searchDrugs,
  searchDrugDosages,
  searchProviders,
  searchPharmacies,
  searchConditions,
};
