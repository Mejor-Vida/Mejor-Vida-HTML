/**
 * Shared helpers for WinFlex rate harvest → term_carrier_premiums.csv
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const KNOWLEDGE_DIR = path.join(ROOT, "integrations/knowledge/Term_Life_Knowledge");
const CAPTURES_PATH = path.join(KNOWLEDGE_DIR, "winflex-captures.jsonl");
const CSV_PATH = path.join(KNOWLEDGE_DIR, "term_carrier_premiums.csv");

/** Issue ages for face amounts $100,000+ (age last birthday). Source: Transamerica product portfolio. */
const TRANSAMERICA_TS_SUPER_AGE_MAX = {
  10: { nt: 80, t: 80 },
  15: { nt: 78, t: 73 },
  20: { nt: 70, t: 65 },
  25: { nt: 65, t: 60 },
  30: { nt: 58, t: 53 },
};

const MOO_TLA_AGE_MAX = {
  10: { nt: 80, t: 75 },
  15: { nt: 74, t: 70 },
  20: { nt: 68, t: 65 },
  25: { nt: 68, t: 65 },
  30: { nt: 55, t: 50 },
};

/** Face bands for quoter ($100K+). Quote at representative face in each band. */
const FACE_BANDS = [
  { min: 100000, max: 249999, quoteFace: 200000 },
  { min: 250000, max: 499999, quoteFace: 350000 },
  { min: 500000, max: 999999, quoteFace: 750000 },
  { min: 1000000, max: 5000000, quoteFace: 2000000 },
];

const HEALTH_CLASSES = ["preferred_plus_nt", "standard_nt"];

const CARRIER_PROFILES = {
  transamerica: {
    id: "transamerica",
    carrier: "transamerica",
    product: "trendsetter_super",
    label: "Transamerica — Trendsetter Super",
    winflexCompany: "Transamerica",
    winflexProductHint: "Trendsetter Super (TS-10/15/20/25/30)",
    policy_fee_annual: 30,
    modal_monthly_factor: 0.085,
    source_file: "WinFlex_Web_Transamerica",
    ageMax: TRANSAMERICA_TS_SUPER_AGE_MAX,
    healthClassWinflex: {
      preferred_plus_nt: "Preferred Plus Non-Tobacco (PP)",
      standard_nt: "Standard Non-Tobacco (SNS)",
    },
  },
  moo: {
    id: "moo",
    carrier: "moo",
    product: "term_life_answers",
    label: "Mutual of Omaha — Term Life Answers",
    winflexCompany: "Mutual of Omaha",
    winflexProductHint: "Term Life Answers (TLA)",
    policy_fee_annual: 62.5,
    modal_monthly_factor: 0.086,
    source_file: "WinFlex_Web_MOO",
    ageMax: MOO_TLA_AGE_MAX,
    healthClassWinflex: {
      preferred_plus_nt: "Preferred Plus Non-Tobacco",
      standard_nt: "Standard Non-Tobacco",
    },
  },
};

const DEFAULT_CARRIER = "transamerica";

const PILOT_SPECS = [
  { term_years: 20, age: 45, sex: "male", smoker: 0, face: 250000, health_class: "preferred_plus_nt" },
  { term_years: 20, age: 45, sex: "male", smoker: 0, face: 250000, health_class: "standard_nt" },
  { term_years: 20, age: 45, sex: "female", smoker: 0, face: 250000, health_class: "preferred_plus_nt" },
  { term_years: 20, age: 45, sex: "female", smoker: 0, face: 250000, health_class: "standard_nt" },
  { term_years: 20, age: 35, sex: "male", smoker: 0, face: 250000, health_class: "preferred_plus_nt" },
  { term_years: 20, age: 55, sex: "male", smoker: 0, face: 250000, health_class: "preferred_plus_nt" },
];

function resolveCarrierProfile(id) {
  const key = String(id || DEFAULT_CARRIER).toLowerCase().trim();
  return CARRIER_PROFILES[key] || CARRIER_PROFILES[DEFAULT_CARRIER];
}

function faceBandForAmount(face) {
  const f = parseInt(String(face), 10);
  for (const band of FACE_BANDS) {
    if (f >= band.min && f <= band.max) return { min: band.min, max: band.max };
  }
  return { min: 100000, max: 249999 };
}

function specKey(spec) {
  return [
    spec.carrier || DEFAULT_CARRIER,
    spec.product || "",
    spec.term_years,
    spec.age,
    spec.sex,
    spec.smoker,
    spec.face || spec.quoteFace,
    spec.health_class,
  ].join(":");
}

function buildFullGrid(carrierId) {
  const profile = resolveCarrierProfile(carrierId);
  const specs = [];
  const terms = [10, 15, 20, 25, 30];
  for (const term_years of terms) {
    const limits = profile.ageMax[term_years];
    if (!limits) continue;
    for (let age = 18; age <= limits.nt; age++) {
      for (const sex of ["male", "female"]) {
        for (const smoker of [0, 1]) {
          const maxAge = smoker ? limits.t : limits.nt;
          if (age > maxAge) continue;
          for (const health_class of HEALTH_CLASSES) {
            for (const band of FACE_BANDS) {
              specs.push({
                carrier: profile.carrier,
                product: profile.product,
                term_years,
                age,
                sex,
                smoker,
                face: band.quoteFace,
                health_class,
                face_band_min: band.min,
                face_band_max: band.max,
              });
            }
          }
        }
      }
    }
  }
  return specs;
}

function buildPilotGrid(carrierId) {
  const profile = resolveCarrierProfile(carrierId);
  return PILOT_SPECS.map(function (s) {
    const band = faceBandForAmount(s.face);
    return Object.assign({}, s, {
      carrier: profile.carrier,
      product: profile.product,
      face_band_min: band.min,
      face_band_max: band.max,
    });
  });
}

function formatSpecBanner(spec, index, total, carrierId) {
  const profile = resolveCarrierProfile(carrierId || spec.carrier);
  const tobacco = spec.smoker ? "Tobacco" : "Non-tobacco";
  const health = spec.health_class.replace(/_/g, " ").toUpperCase();
  const face = (spec.face || spec.quoteFace).toLocaleString("en-US");
  return (
    `[${index}/${total}] ${profile.label} · NE · ${spec.sex} · age ${spec.age} · ` +
    `${tobacco} · ${spec.term_years}-year · $${face} · ${health} — ` +
    `Run quote in WinFlex, then press Enter in terminal (s=skip, q=quit, m=manual $)`
  );
}

function winflexInstructions(spec, carrierId) {
  const profile = resolveCarrierProfile(carrierId || spec.carrier);
  const tobacco = spec.smoker ? "Yes (last 12 mo)" : "No";
  const health =
    profile.healthClassWinflex[spec.health_class] ||
    spec.health_class.replace(/_/g, " ");
  const face = (spec.face || spec.quoteFace).toLocaleString("en-US");
  return [
    "WinFlex setup for this capture:",
    `  Company: ${profile.winflexCompany}`,
    `  Product: ${profile.winflexProductHint}`,
    `  State: Nebraska (NE)`,
    `  Sex: ${spec.sex}`,
    `  Issue age: ${spec.age} (last birthday)`,
    `  Tobacco: ${tobacco}`,
    `  Term: ${spec.term_years} years`,
    `  Face amount: $${face}`,
    `  Health / rate class: ${health}`,
    `  Premium mode: Monthly`,
    "",
    "Click Calculate / Illustrate, then return here and press Enter.",
  ].join("\n");
}

/** Extract premium amounts and optional $/1K from visible page text. */
function extractFromText(text) {
  const clean = String(text || "").replace(/\r/g, "");
  const lines = clean.split("\n").map(function (l) {
    return l.replace(/\s+/g, " ").trim();
  });

  const monthlyCandidates = [];
  const rateCandidates = [];
  const labelRe =
    /(initial|modal|total|target|planned)?\s*(monthly|annual)?\s*premium|premium\s*\(?\s*monthly/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (labelRe.test(line)) {
      const sameLine = line.match(/\$\s*([\d,]+\.\d{2})/);
      if (sameLine) monthlyCandidates.push(Number(sameLine[1].replace(/,/g, "")));
      for (let j = 1; j <= 3 && i + j < lines.length; j++) {
        const next = lines[i + j];
        const m = next.match(/\$\s*([\d,]+\.\d{2})/);
        if (m) {
          monthlyCandidates.push(Number(m[1].replace(/,/g, "")));
          break;
        }
      }
    }

    const rateLine = /rate\s*(?:per|\/)\s*\$?\s*1,?000|per\s*\$?\s*1,?000/i.test(line);
    if (rateLine) {
      const rm = line.match(/([\d.]+)/);
      if (rm) rateCandidates.push(Number(rm[1]));
    }
  }

  const allDollars = [];
  const dollarRe = /\$\s*([\d,]+\.\d{2})/g;
  let dm;
  while ((dm = dollarRe.exec(clean)) !== null) {
    allDollars.push(Number(dm[1].replace(/,/g, "")));
  }

  const plausibleMonthly = monthlyCandidates.filter(function (n) {
    return n >= 8 && n <= 15000;
  });
  const fallbackMonthly = allDollars.filter(function (n) {
    return n >= 15 && n <= 15000;
  });

  const monthly_premium = plausibleMonthly[0] || fallbackMonthly[0] || null;
  const rate_per_thousand = rateCandidates[0] || null;

  return {
    monthly_premium,
    rate_per_thousand,
    monthly_candidates: plausibleMonthly.length ? plausibleMonthly : fallbackMonthly.slice(0, 8),
    rate_candidates: rateCandidates,
    all_dollars: allDollars.slice(0, 20),
  };
}

function loadCaptures() {
  if (!fs.existsSync(CAPTURES_PATH)) return [];
  return fs
    .readFileSync(CAPTURES_PATH, "utf8")
    .split(/\n/)
    .map(function (l) {
      return l.trim();
    })
    .filter(Boolean)
    .map(function (l) {
      return JSON.parse(l);
    });
}

function saveCapture(record) {
  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  fs.appendFileSync(CAPTURES_PATH, JSON.stringify(record) + "\n", "utf8");
}

function captureIndexByKey(captures) {
  const map = new Map();
  for (const c of captures) {
    if (c.spec) map.set(specKey(c.spec), c);
  }
  return map;
}

function captureToCsvRow(capture) {
  const s = capture.spec;
  const profile = resolveCarrierProfile(s.carrier);
  const band =
    s.face_band_min != null
      ? { min: s.face_band_min, max: s.face_band_max }
      : faceBandForAmount(s.face || s.quoteFace);
  const face = s.face || s.quoteFace;

  return {
    carrier: profile.carrier,
    product: profile.product,
    state: "NE",
    age: String(s.age),
    sex: s.sex,
    smoker: String(s.smoker ? 1 : 0),
    term_years: String(s.term_years),
    face_band_min: String(band.min),
    face_band_max: String(band.max),
    health_class: s.health_class,
    rate_per_thousand: capture.rate_per_thousand != null ? String(capture.rate_per_thousand) : "",
    policy_fee_annual: String(profile.policy_fee_annual),
    modal_monthly_factor: String(profile.modal_monthly_factor),
    monthly_premium: capture.monthly_premium != null ? String(capture.monthly_premium) : "",
    face_amount: String(face),
    source_file: profile.source_file,
    source_date: capture.captured_at ? capture.captured_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map(function (l) {
      return l.trim();
    })
    .filter(function (l) {
      return l && !l.startsWith("#");
    });
  if (!lines.length) return { header: [], rows: [] };
  const header = lines[0].split(",").map(function (h) {
    return h.trim();
  });
  const rows = lines.slice(1).map(function (line) {
    const parts = line.split(",");
    const row = {};
    header.forEach(function (h, i) {
      row[h] = (parts[i] || "").trim();
    });
    return row;
  });
  return { header, rows };
}

function rowToCsvLine(header, row) {
  return header
    .map(function (h) {
      return row[h] != null ? String(row[h]) : "";
    })
    .join(",");
}

function mergeCapturesToCsv(carrierId) {
  const profile = resolveCarrierProfile(carrierId);
  const captures = loadCaptures().filter(function (c) {
    if (!c.spec) return false;
    const rowCarrier = c.spec.carrier || profile.carrier;
    if (rowCarrier !== profile.carrier) return false;
    return c.monthly_premium != null || c.rate_per_thousand != null;
  });
  if (!captures.length) {
    return { merged: 0, message: "No captures with premium data for " + profile.label + "." };
  }

  const harvestedRows = captures.map(captureToCsvRow);
  const rowKey = function (r) {
    return [
      r.carrier,
      r.product,
      r.state,
      r.age,
      r.sex,
      r.smoker,
      r.term_years,
      r.face_band_min,
      r.face_band_max,
      r.health_class,
    ].join("|");
  };

  const harvestedMap = new Map();
  for (const r of harvestedRows) harvestedMap.set(rowKey(r), r);

  let header;
  let existing = [];
  if (fs.existsSync(CSV_PATH)) {
    const parsed = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
    header = parsed.header;
    existing = parsed.rows.filter(function (r) {
      return r.carrier !== profile.carrier;
    });
  } else {
    header = [
      "carrier",
      "product",
      "state",
      "age",
      "sex",
      "smoker",
      "term_years",
      "face_band_min",
      "face_band_max",
      "health_class",
      "rate_per_thousand",
      "policy_fee_annual",
      "modal_monthly_factor",
      "monthly_premium",
      "face_amount",
      "source_file",
      "source_date",
    ];
  }

  const outRows = existing.concat(Array.from(harvestedMap.values()));
  const commentLines = [
    "# carrier,product,state,age,sex,smoker,term_years,face_band_min,face_band_max,health_class,rate_per_thousand,policy_fee_annual,modal_monthly_factor,monthly_premium,face_amount,source_file,source_date",
    `# ${profile.label} rows from WinFlex harvest — merged ${new Date().toISOString().slice(0, 10)}`,
  ];
  const body = outRows.map(function (r) {
    return rowToCsvLine(header, r);
  });
  fs.writeFileSync(CSV_PATH, commentLines.join("\n") + "\n" + header.join(",") + "\n" + body.join("\n") + "\n", "utf8");

  return {
    merged: harvestedMap.size,
    totalRows: outRows.length,
    csvPath: CSV_PATH,
    carrier: profile.carrier,
  };
}

module.exports = {
  CAPTURES_PATH,
  CSV_PATH,
  KNOWLEDGE_DIR,
  FACE_BANDS,
  CARRIER_PROFILES,
  DEFAULT_CARRIER,
  resolveCarrierProfile,
  buildFullGrid,
  buildPilotGrid,
  formatSpecBanner,
  winflexInstructions,
  extractFromText,
  loadCaptures,
  saveCapture,
  captureIndexByKey,
  specKey,
  faceBandForAmount,
  captureToCsvRow,
  mergeCapturesToCsv,
};
