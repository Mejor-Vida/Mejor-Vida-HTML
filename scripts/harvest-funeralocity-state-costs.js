#!/usr/bin/env node
/**
 * Harvest Funeralocity state averages (source of truth for MVI funeral costs).
 * Usage: node scripts/harvest-funeralocity-state-costs.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "integrations/knowledge/Funeralocity_State_Costs");
const OUT_JSON = path.join(OUT_DIR, "all-states-detailed.json");
const OUT_JS = path.join(ROOT, "js/final-expense-state-costs.js");

const NAMES = {
  AL: ["Alabama", "Alabama"], AK: ["Alaska", "Alaska"], AZ: ["Arizona", "Arizona"],
  AR: ["Arkansas", "Arkansas"], CA: ["California", "California"], CO: ["Colorado", "Colorado"],
  CT: ["Connecticut", "Connecticut"], DE: ["Delaware", "Delaware"], DC: ["District of Columbia", "Distrito de Columbia"],
  FL: ["Florida", "Florida"], GA: ["Georgia", "Georgia"], HI: ["Hawaii", "Hawái"],
  ID: ["Idaho", "Idaho"], IL: ["Illinois", "Illinois"], IN: ["Indiana", "Indiana"],
  IA: ["Iowa", "Iowa"], KS: ["Kansas", "Kansas"], KY: ["Kentucky", "Kentucky"],
  LA: ["Louisiana", "Luisiana"], ME: ["Maine", "Maine"], MD: ["Maryland", "Maryland"],
  MA: ["Massachusetts", "Massachusetts"], MI: ["Michigan", "Michigan"], MN: ["Minnesota", "Minnesota"],
  MS: ["Mississippi", "Misisipi"], MO: ["Missouri", "Misuri"], MT: ["Montana", "Montana"],
  NE: ["Nebraska", "Nebraska"], NV: ["Nevada", "Nevada"], NH: ["New Hampshire", "Nuevo Hampshire"],
  NJ: ["New Jersey", "Nueva Jersey"], NM: ["New Mexico", "Nuevo México"], NY: ["New York", "Nueva York"],
  NC: ["North Carolina", "Carolina del Norte"], ND: ["North Dakota", "Dakota del Norte"],
  OH: ["Ohio", "Ohio"], OK: ["Oklahoma", "Oklahoma"], OR: ["Oregon", "Oregón"],
  PA: ["Pennsylvania", "Pensilvania"], RI: ["Rhode Island", "Rhode Island"],
  SC: ["South Carolina", "Carolina del Sur"], SD: ["South Dakota", "Dakota del Sur"],
  TN: ["Tennessee", "Tennessee"], TX: ["Texas", "Texas"], UT: ["Utah", "Utah"],
  VT: ["Vermont", "Vermont"], VA: ["Virginia", "Virginia"], WA: ["Washington", "Washington"],
  WV: ["West Virginia", "Virginia Occidental"], WI: ["Wisconsin", "Wisconsin"], WY: ["Wyoming", "Wyoming"],
};

const SERVICES = {
  traditionalBurial: "traditional-full-service-burial",
  fullCremation: "full-service-cremation",
  affordableBurial: "affordable-burial",
  directCremation: "direct-cremation",
};

function round(n) {
  return Math.round(Number(n) || 0);
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.funeralocity.com/average-funeral-price/ne",
    },
  });
  if (!res.ok) throw new Error(url + " -> " + res.status);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(url + " -> non-JSON: " + text.slice(0, 120));
  }
}

function avg(block) {
  if (!block) return 0;
  return round(block.Average != null ? block.Average : block.average);
}

async function harvestState(code) {
  const lower = code.toLowerCase();
  const short = await fetchJson(
    `https://www.funeralocity.com/api/common/average/full/short/${code}`
  );
  const detailed = {};
  for (const [key, slug] of Object.entries(SERVICES)) {
    detailed[key] = await fetchJson(
      `https://www.funeralocity.com/api/common/average/detailed/services/${slug}/location/state/states/${lower}`
    );
  }
  return {
    code,
    name: short.State || (NAMES[code] && NAMES[code][0]) || code,
    sourceUrl: `https://www.funeralocity.com/average-funeral-price/${lower}`,
    short: {
      fullBurial: short.FullBurial && short.FullBurial.State,
      immediateBurial: short.ImmediateBurial && short.ImmediateBurial.State,
      fullCremation: short.FullCremation && short.FullCremation.State,
      directCremation: short.DirectCremation && short.DirectCremation.State,
    },
    detailed,
  };
}

function burialServicesTotal(d) {
  if (!d) return 0;
  return round(
    (d.Basic_Services || 0) +
      (d.Pricing_Transfer_Home || 0) +
      (d.Pricing_Embaliming || 0) +
      (d.Pricing_Dressing_Casketing || 0) +
      (d.Pricing_Viewing || 0) +
      (d.Pricing_Funeral || 0) +
      (d.Pricing_Hearse || 0) +
      (d.Pricing_Utility_Vehicle || 0)
  );
}

function cremationServicesTotal(d) {
  if (!d) return 0;
  return round(
    (d.Pricing_Base_Services || 0) +
      (d.Pricing_Transfer_Home || 0) +
      (d.Pricing_Embaliming || 0) +
      (d.Pricing_Dressing_Casketing || 0) +
      (d.Pricing_Viewing || 0) +
      (d.Pricing_Funeral || 0) +
      (d.Pricing_Transfer_Crematory || 0) +
      (d.Pricing_Crematory_Fee || 0)
  );
}

function toEstimatorRow(entry) {
  const names = NAMES[entry.code] || [entry.name, entry.name];
  const tb = entry.detailed.traditionalBurial || {};
  const fc = entry.detailed.fullCremation || {};
  const dc = entry.detailed.directCremation || {};
  const fhBurial = burialServicesTotal(tb);
  // Prefer short full-cremation average when present; else detailed services (+ optional cremation casket not included — merchandise is tiered in UI)
  const fhCremation =
    avg(entry.short.fullCremation) ||
    cremationServicesTotal(fc) + round(fc.CremationCasketAverage || 0);
  const directCrem =
    avg(entry.short.directCremation) ||
    round(
      (dc.Pricing_Direct_Cremation || 0) +
        (dc.Pricing_Crematory_Fee || 0) +
        (dc.Pricing_Transfer_Crematory || 0)
    );

  return {
    code: entry.code,
    nameEn: names[0],
    nameEs: names[1],
    burial: {
      // Funeralocity traditional full-service burial — service components only (casket is separate merchandise in the calculator).
      funeralHome: fhBurial,
      casket: round(tb.MedianPricedCasketAverage || 0),
      vault: 0,
      cemetery: 0,
      opening: 0,
      flowers: 0,
      deathCerts: 0,
      stationery: 0,
    },
    cremation: {
      // Full-service cremation average (Funeralocity State.Average) drives the FH cremation line.
      cremationPrice: round(fhCremation),
      memorialService: 0,
      directCremation: round(directCrem),
    },
    funeralHome: {
      burial: fhBurial,
      cremation: round(fhCremation),
    },
    funeralocity: {
      fullBurialAverage: avg(entry.short.fullBurial),
      immediateBurialAverage: avg(entry.short.immediateBurial),
      fullCremationAverage: avg(entry.short.fullCremation),
      directCremationAverage: avg(entry.short.directCremation),
      burialBreakdown: {
        basicServices: round(tb.Basic_Services),
        transferHome: round(tb.Pricing_Transfer_Home),
        embalming: round(tb.Pricing_Embaliming),
        dressingCasketing: round(tb.Pricing_Dressing_Casketing),
        viewing: round(tb.Pricing_Viewing),
        funeralService: round(tb.Pricing_Funeral),
        hearse: round(tb.Pricing_Hearse),
        utilityVehicle: round(tb.Pricing_Utility_Vehicle),
        medianCasket: round(tb.MedianPricedCasketAverage),
      },
      sourceUrl: entry.sourceUrl,
    },
  };
}

function writeEstimatorJs(rows) {
  const header = `/** State burial & cremation averages — Funeralocity source of truth.
 * Generated by scripts/harvest-funeralocity-state-costs.js
 * Captured: ${new Date().toISOString().slice(0, 10)}
 * API: https://www.funeralocity.com/api/common/average/...
 * funeralHome = traditional burial service components (excludes merchandise casket).
 * Cremation FH line uses full-service cremation state average.
 * Vault/cemetery/opening/flowers/etc. remain user-selected tiers in the calculator (not published as FO state averages).
 */
window.MVI_FE_STATE_COSTS = `;
  const body = JSON.stringify(rows, null, 2);
  fs.writeFileSync(OUT_JS, header + body + ";\n");
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const codes = Object.keys(NAMES).sort();
  const all = {
    source: "Funeralocity",
    capturedAt: new Date().toISOString(),
    endpointShort: "https://www.funeralocity.com/api/common/average/full/short/{STATE}",
    endpointDetailed:
      "https://www.funeralocity.com/api/common/average/detailed/services/{service}/location/state/states/{state}",
    states: {},
  };

  const estimator = {};
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    process.stdout.write(`[${i + 1}/${codes.length}] ${code}... `);
    try {
      const entry = await harvestState(code);
      all.states[code] = entry;
      estimator[code] = toEstimatorRow(entry);
      const fh = estimator[code].burial.funeralHome;
      const cr = estimator[code].funeralHome.cremation;
      console.log(`burialFH=${fh} cremation=${cr}`);
    } catch (err) {
      console.log("FAIL", err.message);
    }
    // Be polite to the API
    await new Promise((r) => setTimeout(r, 120));
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(all, null, 2));
  writeEstimatorJs(estimator);
  // Keep licensed-state summary for coverage pages
  const licensed = { NE: 1, KS: 1, CO: 1, NV: 1 };
  const summary = {
    source: "Funeralocity API",
    capturedAt: all.capturedAt.slice(0, 10),
    note: "State.Average figures for coverage pages + map tooltips.",
    states: {},
  };
  Object.keys(licensed).forEach((code) => {
    const e = all.states[code];
    if (!e) return;
    summary.states[code] = {
      name: e.name,
      sourceUrl: e.sourceUrl,
      fullBurial: e.short.fullBurial,
      immediateBurial: e.short.immediateBurial,
      fullCremation: e.short.fullCremation,
      directCremation: e.short.directCremation,
    };
  });
  fs.writeFileSync(path.join(OUT_DIR, "ne-ks-co-nv.json"), JSON.stringify(summary, null, 2));
  console.log("Wrote", OUT_JSON);
  console.log("Wrote", OUT_JS);
  console.log("States OK:", Object.keys(estimator).length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
