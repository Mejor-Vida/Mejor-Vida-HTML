#!/usr/bin/env node
/**
 * Harvest Fully Underwritten / Simplified Term / Final Expense quotes from
 * Integrity Connect via the MVI Agent Browser Bridge.
 *
 * Prerequisites:
 *   npm run bridge:browser          # server
 *   Chrome extension Bridge ON
 *   Logged into connect.integrity.com
 *
 * Usage:
 *   node scripts/harvest-integrity-term-quotes.mjs
 *   node scripts/harvest-integrity-term-quotes.mjs --product fu --force --fresh
 *   node scripts/harvest-integrity-term-quotes.mjs --product si --spot-check
 *   node scripts/harvest-integrity-term-quotes.mjs --fe-grid --max 80
 *   node scripts/harvest-integrity-term-quotes.mjs --child-grid --fresh
 *
 * Writes:
 *   integrations/knowledge/Term_Life_Knowledge/integrity-term-harvest.json
 *   integrations/knowledge/Term_Life_Knowledge/integrity-fu-term-premiums.csv
 *   (+ integrity-fe-harvest.json / integrity-si-term-premiums.csv /
 *      integrity-children-harvest.json for other products)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(
  ROOT,
  "integrations/knowledge/Term_Life_Knowledge"
);
const HARVEST_JSON = path.join(OUT_DIR, "integrity-term-harvest.json");
const FU_CSV = path.join(OUT_DIR, "integrity-fu-term-premiums.csv");

const HOST = process.env.MVI_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.MVI_BRIDGE_PORT || 9334);
const TOKEN = process.env.MVI_BRIDGE_TOKEN || "mvi-local-bridge";
const BASE = `http://${HOST}:${PORT}`;

const HEALTH_MAP = {
  PP: "preferred_plus_nt",
  P: "preferred_nt",
  SP: "standard_plus_nt",
  S: "standard_nt",
  SUB: "substandard_nt",
};

const HEALTH_LABEL = {
  PP: "Preferred Best",
  P: "Preferred",
  SP: "Standard +",
  S: "Standard",
  SUB: "Substandard",
};

function parseArgs(argv) {
  const args = {
    product: "fu", // fu | si | fe
    ages: [30, 40, 50, 20, 25, 35, 45, 55, 60],
    sexes: ["male", "female"],
    faces: [100000, 250000, 500000, 750000, 1000000, 2000000],
    terms: [10, 20, 30],
    health: ["PP"],
    tobacco: false,
    spotCheck: false,
    maxQuotes: 400,
    sleepMs: 1600,
    force: false,
    fresh: false,
    facesExplicit: false,
    outJson: "",
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = argv[i + 1];
    if (a === "--product" && next) {
      args.product = next;
      i++;
    } else if (a === "--ages" && next) {
      args.ages = next.split(",").map(Number);
      i++;
    } else if (a === "--sexes" && next) {
      args.sexes = next.split(",");
      i++;
    } else if (a === "--faces" && next) {
      args.faces = next.split(",").map(Number);
      args.facesExplicit = true;
      i++;
    } else if (a === "--terms" && next) {
      args.terms = next.split(",").map(Number);
      i++;
    } else if (a === "--health" && next) {
      args.health = next.split(",");
      i++;
    } else if (a === "--tobacco" && next) {
      args.tobacco = ["1", "true", "yes", "y"].includes(String(next).toLowerCase());
      i++;
    } else if (a === "--spot-check") {
      args.spotCheck = true;
      args.product = "si";
      args.ages = [30, 40, 50];
      args.sexes = ["male"];
      args.faces = [100000, 250000];
      args.terms = [20];
      args.health = ["S"];
    } else if (a === "--fe-grid") {
      args.product = "fe";
      args.ages = [50, 55, 60, 65, 70, 75, 80, 85];
      args.sexes = ["male", "female"];
      args.faces = [10000, 15000, 25000, 50000];
      args.terms = [0]; // FE has no term length
      args.health = ["S"]; // FE often uses Standard-style / no PP radios
    } else if (a === "--child-grid") {
      // Children's permanent / FE-path quotes (MOO CWL, Assurity Protect+, TA juvenile, etc.)
      // Integrity has no separate "Children" product picker — use Final Expense flow with child ages.
      args.product = "children";
      args.ages = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
      args.sexes = ["male", "female"];
      args.faces = [5000, 10000, 15000, 25000, 40000, 50000];
      args.terms = [0];
      args.health = ["S"];
      args.maxQuotes = Math.max(args.maxQuotes, 250);
    } else if (a === "--max" && next) {
      args.maxQuotes = Number(next);
      i++;
    } else if (a === "--sleep" && next) {
      args.sleepMs = Number(next);
      i++;
    } else if (a === "--force") {
      args.force = true;
    } else if (a === "--fresh") {
      args.fresh = true;
    } else if (a === "--out-json" && next) {
      args.outJson = next;
      i++;
    }
  }
  if (
    (args.product === "fe" || args.product === "children") &&
    args.faces[0] >= 100000 &&
    !args.facesExplicit
  ) {
    args.faces =
      args.product === "children"
        ? [5000, 10000, 15000, 25000, 40000, 50000]
        : [10000, 15000, 25000, 50000];
    args.terms = [0];
  }
  return args;
}

function productLabelFor(product) {
  if (product === "si") return "Simplified Term";
  if (product === "fe" || product === "children") return "Final Expense";
  return "Fully Underwritten Term";
}

function productTypeKey(product) {
  if (product === "si") return "simplified_term";
  if (product === "fe") return "final_expense";
  if (product === "children") return "children_life";
  return "fully_underwritten_term";
}

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
  if (!res.ok) {
    const err = new Error(body.error || body.message || `HTTP ${res.status}`);
    err.body = body;
    throw err;
  }
  return body;
}

async function cmd(action, args = {}) {
  return api("/v1/command", {
    method: "POST",
    body: JSON.stringify({ action, args }),
  });
}

async function evalPage(code) {
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await cmd("evaluate", { code });
      if (!r.ok) throw new Error(r.error || "evaluate failed");
      return r.value;
    } catch (e) {
      lastErr = e;
      const msg = String(e && e.message ? e.message : e);
      if (!/Frame with ID|target closed|Execution context|removed/i.test(msg)) {
        throw e;
      }
      await sleep(900 + attempt * 400);
    }
  }
  throw lastErr || new Error("evaluate failed");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** DOB so Integrity nearest-age ≈ chart age (birthday ~ today, last year). */
function dobForNearestAge(age) {
  const now = new Date();
  const y = now.getFullYear() - age;
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${m}/${d}/${y}`;
}

const HELPERS = `
function setNativeValue(el, value) {
  const proto = window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  setter.call(el, String(value));
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}
function clickText(exact) {
  const el = [...document.querySelectorAll("button, a, div, span, label")]
    .find(e => (e.textContent || "").trim() === exact && (e.onclick || e.tagName === "BUTTON" || e.getAttribute("role") === "button" || /selectItemLabel|_expandableButton|option /.test(String(e.className))));
  if (el) { el.click(); return true; }
  const any = [...document.querySelectorAll("*")].find(e => (e.textContent || "").trim() === exact && e.children.length === 0);
  if (any) { (any.closest("button, [onclick], .option, [class*=selectItem]") || any).click(); return true; }
  return false;
}
function parseCards() {
  const termCards = [...document.querySelectorAll("[class*='_cardInnerContainer_']")];
  if (termCards.length) {
    return termCards.map(c => {
      const t = c.innerText || "";
      const product = (t.split("\\n")[0] || "").trim();
      const carrierM = t.match(/([^\\n|]+)\\|/);
      const monthlyM = t.match(/Monthly Premium\\s*\\$([0-9,.]+)/i);
      const klassM = t.match(/(Preferred Best|Preferred|Standard \\+|Standard|Substandard|Level|Graded|Modified|Immediate)[^\\n]*/i);
      const nearestM = t.match(/Nearest Age:\\s*(\\d+)/);
      const termM = t.match(/Term Length\\s*(\\d+)/);
      const faceM = t.match(/Coverage Amount\\s*\\$([0-9,]+)/);
      return {
        product,
        carrier: carrierM ? carrierM[1].trim() : "",
        monthly: monthlyM ? Number(monthlyM[1].replace(/,/g, "")) : null,
        health_label: klassM ? klassM[0].trim() : "",
        nearest_age: nearestM ? Number(nearestM[1]) : null,
        term_years: termM ? Number(termM[1]) : null,
        face_amount: faceM ? Number(faceM[1].replace(/,/g, "")) : null,
      };
    }).filter(x => x.monthly != null);
  }
  return [...document.querySelectorAll("[class*='_planBox_']")].map(c => {
    const t = c.innerText || "";
    const product = ((c.querySelector("#plan-name") || {}).textContent || (t.split("\\n")[0] || "")).trim();
    const img = c.querySelector("img[src*='logos'], img[class*='logo']") || c.querySelector("img");
    const src = (img && img.src) || "";
    const file = (src.split("/").pop() || "").toLowerCase();
    let carrier = "";
    if (file.includes("americo")) carrier = "Americo";
    else if (file.includes("transamerica")) carrier = "Transamerica Life Insurance Co.";
    else if (file.includes("united-of-omaha") || file.includes("omaha") || file.includes("mutualofomaha") || file.includes("mutual-of-omaha")) carrier = "United of Omaha";
    else if (file.includes("amicable") || file.includes("americanamicable")) carrier = "American Amicable";
    else if (file.includes("assurity")) carrier = "Assurity";
    else if (file.includes("aetna") || file.includes("accendo") || file.includes("continental")) carrier = "Aetna";
    else if (file.includes("corebridge") || file.includes("american_general") || file.includes("american-general") || file.includes("aig")) carrier = "Corebridge Financial";
    else if (file.includes("aflac")) carrier = "Aflac";
    else if (file.includes("gerber") || file.includes("globe") || file.includes("colonial") || file.includes("tristage") || file.includes("trustage") || file.includes("family-heritage") || file.includes("royal") || file.includes("liberty") || file.includes("foresters") || file.includes("baltimore") || file.includes("cica") || file.includes("guaranty")) carrier = file.split(/[_-]/)[0] || "unknown";
    else {
      // Product-name hints when logo filename is generic (logo_*.jpg)
      const pl = (product || "").toLowerCase();
      if (/children.?s?\\s*whole|childrens?\\s*whole|cwl/i.test(product || "")) carrier = "United of Omaha";
      else if (/protect\\+|perform\\+/i.test(product || "")) carrier = "Assurity";
      else if (/immediate solution|express premier|lifetime/i.test(product || "")) carrier = "Transamerica Life Insurance Co.";
      else if (/living promise|term life answers/i.test(product || "")) carrier = "United of Omaha";
      else if (/senior choice|golden solution|easy term/i.test(product || "")) carrier = "American Amicable";
      else if (/eagle/i.test(product || "")) carrier = "Americo";
      else if (/simplinow|select-a-term|qol/i.test(product || "")) carrier = "Corebridge Financial";
      else carrier = (file.split(/[_-]/)[0] || "unknown");
    }
    const monthlyM = t.match(/Monthly Premium\\s*\\$?\\s*([0-9,.]+)/i) || t.match(/\\$\\s*([0-9,.]+)\\s*\\/mo/i);
    const faceM = t.match(/Coverage Amount\\s*\\n?\\$?([0-9,]+)/i);
    const typeM = t.match(/Coverage Type:\\s*\\n?([^\\n]+)/i);
    return {
      product,
      carrier: String(carrier).trim(),
      monthly: monthlyM ? Number(monthlyM[1].replace(/,/g, "")) : null,
      health_label: typeM ? typeM[1].trim() : "",
      nearest_age: null,
      term_years: null,
      face_amount: faceM ? Number(faceM[1].replace(/,/g, "")) : null,
      logo_src: src,
    };
  }).filter(x => x.monthly != null);
}
function pageKind() {
  const t = document.body.innerText || "";
  if (/Product Specialties are required/i.test(t) && /Add Product Specialties/i.test(t)) return "specialty_required";
  if (/What type of Life Product\\?/.test(t)) return "product_picker";
  if (/confirm a few details/i.test(t)) return "demographics";
  if (/Health Conditions/i.test(t) && /Continue to Quote/i.test(t) && /Final Expense/i.test(t)) return "fe_health";
  if (/Set your product preferences/i.test(t)) return "preferences";
  if (/Final Expense Policies/i.test(t) && /Monthly Premium/i.test(t)) return "results";
  if ((/Fully Underwritten Term|Simplified Term|Final Expense/.test(t) || /policies/.test(t)) && /Monthly Premium/.test(t)) return "results";
  if (/\\d+\\s+policies/.test(t) && (/Nothing Found/i.test(t) || /Reset my Filters/i.test(t))) return "results";
  if (/policies/.test(t) && /Monthly Premium/.test(t)) return "results";
  if (/\\bWealth\\b/.test(t) && /Quick Quote/.test(t) && /\\bLife\\b/.test(t) && !/Monthly Premium/.test(t)) return "life_wealth";
  return "other";
}
function cardKey(c) {
  return [c.carrier, c.product, c.monthly, c.face_amount, c.term_years, c.health_label].join("|");
}
`;

async function ensureQuickQuoteOpen(productLabel) {
  let kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);

  // Already mid-flow
  if (kind === "demographics" || kind === "preferences" || kind === "results" || kind === "fe_health") {
    return kind;
  }

  if (kind !== "product_picker" && kind !== "life_wealth") {
    // Fresh Quick Quote from wherever we are
    await evalPage(`(() => {
      const qq = [...document.querySelectorAll("a, button")].find(e => (e.textContent || "").trim() === "Quick Quote");
      if (qq) qq.click();
      return !!qq;
    })()`);
    await sleep(1200);
    kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
  }

  if (kind === "life_wealth" || kind === "other") {
    await evalPage(`(() => {
      const life = [...document.querySelectorAll("div")].find(e => (e.textContent || "").trim() === "Life" && /_plan_/.test(String(e.className)));
      if (life) { life.click(); return true; }
      return false;
    })()`);
    await sleep(1100);
    kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
  }

  if (kind === "product_picker" || /What type of Life Product/.test(
    await evalPage(`document.body.innerText`)
  )) {
    await evalPage(`(() => {
      ${HELPERS}
      const el = [...document.querySelectorAll("div")].find(e => (e.textContent || "").trim() === ${JSON.stringify(productLabel)} && (e.onclick || /selectItemLabel/.test(String(e.className))));
      if (el) { el.click(); return true; }
      return clickText(${JSON.stringify(productLabel)});
    })()`);
    await sleep(1100);
  }
  return evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
}

/** Force a brand-new quote session (age/gender change). */
async function forceNewQuoteSession(productLabel) {
  await cmd("navigate", {
    url: "https://connect.integrity.com/agent/dashboard",
  });
  await sleep(2500);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await evalPage(`(() => {
        const qq = [...document.querySelectorAll("a, button")].find(e => (e.textContent || "").trim() === "Quick Quote");
        if (qq) qq.click();
        return !!qq;
      })()`);
      await sleep(1300);
      let kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
      if (kind === "life_wealth" || kind === "other") {
        await evalPage(`(() => {
          const life = [...document.querySelectorAll("div")].find(e => (e.textContent || "").trim() === "Life" && /_plan_/.test(String(e.className)));
          if (life) life.click();
          return !!life;
        })()`);
        await sleep(1200);
        kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
      }
      if (kind === "product_picker" || /What type of Life Product/.test(await evalPage(`document.body.innerText`))) {
        await evalPage(`(() => {
          ${HELPERS}
          const el = [...document.querySelectorAll("div")].find(e => (e.textContent || "").trim() === ${JSON.stringify(productLabel)} && (e.onclick || /selectItemLabel/.test(String(e.className))));
          if (el) el.click();
          return !!el;
        })()`);
        await sleep(1300);
      }
      kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
      if (kind === "specialty_required") {
        kind = await continuePastFeHealth();
        console.log(`  forceNew specialties → ${kind}`);
      }
      if (kind === "demographics" || kind === "fe_health" || kind === "preferences" || kind === "results") {
        return kind;
      }
      console.log(`  forceNew attempt ${attempt + 1} → ${kind}`);
    } catch (e) {
      console.log(`  forceNew attempt ${attempt + 1} error: ${e.message || e}`);
      await sleep(1500);
      await cmd("navigate", {
        url: "https://connect.integrity.com/agent/dashboard",
      });
      await sleep(2200);
    }
  }
  return evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
}

async function fillDemographics({ sex, age, state = "NE", tobacco = false }) {
  const genderLabel = sex === "female" ? "Female" : "Male";
  const tobaccoLabel = tobacco ? "Yes" : "No";
  // Birthday ~8 months before today at (year - age) → nearest age ≈ chart age
  const now = new Date();
  const dobDate = new Date(
    now.getFullYear() - age,
    now.getMonth() - 8,
    Math.min(now.getDate(), 28)
  );
  const dob = `${String(dobDate.getMonth() + 1).padStart(2, "0")}/${String(dobDate.getDate()).padStart(2, "0")}/${dobDate.getFullYear()}`;
  // Open state dropdown
  await evalPage(`(() => {
    const menu = document.querySelector("[class*=stateSelect] [role=menu], [class*=stateSelect] .inputbox");
    if (menu) menu.click();
    return !!menu;
  })()`);
  await sleep(350);
  await evalPage(`(() => {
    const opts = [...document.querySelectorAll("#option-container-scrolling_div .option, .options .option")];
    const ne = opts.find(e => (e.textContent || "").trim() === ${JSON.stringify(state)});
    if (ne) { ne.scrollIntoView({ block: "center" }); ne.click(); }
    return { found: !!ne, count: opts.length };
  })()`);
  await sleep(200);
  return evalPage(`(() => {
    ${HELPERS}
    const genderBtn = [...document.querySelectorAll("button")].find(e => (e.textContent || "").trim() === ${JSON.stringify(genderLabel)});
    if (genderBtn) genderBtn.click();
    const tobBtn = [...document.querySelectorAll("button")].find(e => (e.textContent || "").trim() === ${JSON.stringify(tobaccoLabel)});
    if (tobBtn) tobBtn.click();
    const feet = document.querySelector("input[name=feet]");
    const inches = document.querySelector("input[name=inches]");
    const weight = document.querySelector("input[name=weight]");
    const ageEl = document.querySelector("input[name=age]");
    const dobEl = document.querySelector("input.MuiPickersInputBase-input, input.MuiPickersOutlinedInput-input");
    if (feet) setNativeValue(feet, "5");
    if (inches) setNativeValue(inches, ${JSON.stringify(sex === "female" ? "5" : "10")});
    if (weight) setNativeValue(weight, ${JSON.stringify(sex === "female" ? "130" : "170")});
    if (dobEl) {
      dobEl.focus();
      setNativeValue(dobEl, ${JSON.stringify(dob)});
      dobEl.blur();
    }
    if (ageEl) setNativeValue(ageEl, ${JSON.stringify(String(age))});
    const cont = [...document.querySelectorAll("button")].find(e => (e.textContent || "").trim() === "Continue");
    return {
      kind: pageKind(),
      age: ageEl && ageEl.value,
      dob: dobEl && dobEl.value,
      intendedDob: ${JSON.stringify(dob)},
      stateText: (document.querySelector("[class*=stateSelect]")?.innerText || "").split("\\n")[0],
      continueEnabled: !!(cont && !cont.disabled && !cont.className.includes("Mui-disabled")),
    };
  })()`);
}

async function continuePastFeHealth() {
  // FE inserts a health-conditions step before preferences/results.
  for (let i = 0; i < 4; i++) {
    const kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
    if (kind === "specialty_required") {
      await evalPage(`(() => {
        const btn = [...document.querySelectorAll("button")].find(e => /Add Product Specialties/i.test(e.textContent || ""));
        if (btn) btn.click();
        return !!btn;
      })()`);
      await sleep(1200);
      await evalPage(`(() => {
        const dialog = [...document.querySelectorAll("[role=dialog], .MuiDialog-root")].find(d => /Select product specialties/i.test(d.innerText || ""));
        if (!dialog) return { ok: false };
        for (const label of ["FE", "Term"]) {
          const node = [...dialog.querySelectorAll("button, div, span")].find(e => (e.textContent || "").trim() === label);
          const root = node && (node.closest(".MuiChip-root, button") || node);
          if (root) root.click();
        }
        const save = [...dialog.querySelectorAll("button")].find(b => (b.textContent || "").trim() === "Save");
        if (save && !save.disabled && !/Mui-disabled/.test(save.className)) save.click();
        return { ok: true };
      })()`);
      await sleep(1000);
      continue;
    }
    if (kind !== "fe_health") return kind;
    await evalPage(`(() => {
      const c = [...document.querySelectorAll("button")].find(e => (e.textContent || "").trim() === "Continue to Quote");
      if (c) c.click();
      return !!c;
    })()`);
    await sleep(1500);
  }
  return evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
}

async function clickContinue() {
  const r = await evalPage(`(() => {
    const c = [...document.querySelectorAll("button")].find(e => (e.textContent || "").trim() === "Continue");
    if (!c) return { ok: false, reason: "no button" };
    if (c.disabled || c.className.includes("Mui-disabled")) return { ok: false, reason: "disabled" };
    c.click();
    return { ok: true };
  })()`);
  return r;
}

async function fillPreferences({ face, term, health }) {
  return evalPage(`(() => {
    ${HELPERS}
    const faceAmt = ${JSON.stringify(String(face))};
    const healthEl = [...document.querySelectorAll("input[name=healthClasses]")].find(e => e.value === ${JSON.stringify(health)});
    if (healthEl) { healthEl.click(); }
    const money = [...document.querySelectorAll("input")].find(e => e.type === "text" && /\\$/.test(e.value || ""));
    if (money) {
      money.focus();
      setNativeValue(money, faceAmt);
      money.blur();
    }
    const range = document.querySelector("input[type=range]");
    if (range && ${JSON.stringify(term)} > 0) setNativeValue(range, ${JSON.stringify(String(term))});
    return {
      health: healthEl && healthEl.checked,
      face: money && money.value,
      term: range && range.value,
      kind: pageKind(),
    };
  })()`);
}

async function applyResultFilters({ face, term, health }) {
  return evalPage(`(() => {
    ${HELPERS}
    const healthEl = [...document.querySelectorAll("input[name=healthClasses]")].find(e => e.value === ${JSON.stringify(health)});
    if (healthEl && !healthEl.checked) healthEl.click();
    const money = [...document.querySelectorAll("input")].find(e => e.type === "text" && /\\$/.test(e.value || ""));
    if (money) {
      money.focus();
      setNativeValue(money, ${JSON.stringify(String(face))});
      money.blur();
    }
    const range = document.querySelector("input[type=range]");
    if (range && ${JSON.stringify(term)} > 0 && String(range.value) !== ${JSON.stringify(String(term))}) {
      setNativeValue(range, ${JSON.stringify(String(term))});
    }
    return {
      face: money && money.value,
      term: range && range.value,
      health: healthEl && healthEl.value,
    };
  })()`);
}

async function scrapeAllResultPages() {
  // Integrity paginates ~10 cards/page. Walk next until exhausted.
  const collected = [];
  const seen = new Set();
  // Prefer starting at first page when pagination exists
  await evalPage(`(() => {
    const first = [...document.querySelectorAll("button")].find(b => (b.getAttribute("aria-label") || "") === "go to first page");
    if (first && !first.disabled && !/Mui-disabled/.test(first.className)) first.click();
    return true;
  })()`);
  await sleep(700);
  for (let page = 0; page < 12; page++) {
    const snap = await evalPage(`(() => {
      ${HELPERS}
      const cards = parseCards();
      const text = document.body.innerText || "";
      const ageM = text.match(/Age:\\s*\\n?\\s*(\\d+)/);
      const genderM = text.match(/Gender:\\s*\\n?\\s*(Male|Female)/);
      const locM = text.match(/Location:\\s*\\n?\\s*([A-Z]{2})/);
      const countM = text.match(/(\\d+)\\s+policies/);
      const carriersBlock = (text.match(/Carriers\\s*([\\s\\S]*?)(?:Ask Integrity|$)/) || [])[1] || "";
      const carrierList = carriersBlock
        .split("\\n")
        .map(s => s.trim())
        .filter(s => s && s !== "All carriers" && s.length < 120 && !/Filters|Death|Health|Term|Rate|Ask/i.test(s));
      const next = [...document.querySelectorAll("button")].find(b => (b.getAttribute("aria-label") || "") === "go to next page");
      const nextDisabled = !next || next.disabled || /Mui-disabled/.test(next.className);
      return {
        cards,
        age: ageM ? Number(ageM[1]) : null,
        gender: genderM ? genderM[1] : null,
        state: locM ? locM[1] : null,
        policy_count: countM ? Number(countM[1]) : cards.length,
        url: location.href,
        kind: pageKind(),
        carrier_filter_list: carrierList.slice(0, 40),
        has_next: !nextDisabled,
      };
    })()`);
    for (const c of snap.cards || []) {
      const k = `${c.carrier}|${c.product}|${c.monthly}|${c.face_amount}|${c.term_years}|${c.health_label}`;
      if (seen.has(k)) continue;
      seen.add(k);
      collected.push(c);
    }
    if (!snap.has_next) {
      return { ...snap, cards: collected };
    }
    await evalPage(`(() => {
      const next = [...document.querySelectorAll("button")].find(b => (b.getAttribute("aria-label") || "") === "go to next page");
      if (next) next.click();
      return !!next;
    })()`);
    await sleep(900);
  }
  return {
    cards: collected,
    policy_count: collected.length,
    age: null,
    gender: null,
    state: null,
    url: null,
    kind: "results",
    carrier_filter_list: [],
  };
}

async function scrapeResults(meta) {
  const data = await scrapeAllResultPages();
  const cards = [...(data.cards || [])].sort((a, b) => (a.monthly || 0) - (b.monthly || 0));
  const best = cards[0] || null;
  return {
    ...meta,
    scraped_at: new Date().toISOString(),
    page_age: data.age,
    page_gender: data.gender,
    page_state: data.state,
    policy_count: data.policy_count || cards.length,
    carrier_filter_list: data.carrier_filter_list || [],
    url: data.url,
    best,
    top: cards.slice(0, 5),
    all: cards,
  };
}

async function waitForResults(sleepMs, tries = 8) {
  for (let i = 0; i < tries; i++) {
    await sleep(sleepMs);
    const kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
    if (kind === "results") {
      const n = await evalPage(
        `Math.max(document.querySelectorAll("[class*='_cardInnerContainer_']").length, document.querySelectorAll("[class*='_planBox_']").length)`
      );
      if (n > 0) return true;
    }
  }
  return false;
}

function carrierKey(carrier) {
  const c = (carrier || "").toLowerCase();
  if (c.includes("transamerica")) return "transamerica";
  if (c.includes("corebridge") || c.includes("american general")) return "corebridge";
  if (c.includes("banner")) return "banner";
  if (c.includes("protective")) return "protective";
  if (c.includes("symetra")) return "symetra";
  if (c.includes("pacific")) return "pacific_life";
  if (c.includes("principal")) return "principal";
  if (c.includes("prudential")) return "prudential";
  if (c.includes("lincoln")) return "lincoln";
  if (c.includes("minnesota")) return "minnesota_life";
  if (c.includes("john hancock")) return "john_hancock";
  if (c.includes("nationwide")) return "nationwide";
  if (c.includes("north american")) return "north_american";
  if (c.includes("omaha") || c.includes("mutual")) return "moo";
  if (c.includes("american amicable") || c.includes("amicable")) return "amam";
  if (c.includes("assurity")) return "assurity";
  if (c.includes("aetna") || c.includes("accendo")) return "aetna";
  if (c.includes("americo")) return "americo";
  return c.replace(/[^a-z0-9]+/g, "_").slice(0, 40) || "unknown";
}

function productKey(product) {
  return (product || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 60);
}

function toCsvRows(records, productType) {
  const header = [
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
    "integrity_carrier",
    "integrity_product",
    "nearest_age",
    "product_type",
  ];
  const lines = [header.join(",")];
  const asOf = new Date().toISOString().slice(0, 10);
  for (const rec of records) {
    if (!rec.best || rec.best.monthly == null) continue;
    const b = rec.best;
    const age = rec.age;
    const nearest = rec.nearest_age || b.nearest_age || "";
    const row = {
      carrier: carrierKey(b.carrier),
      product: productKey(b.product) || "term",
      state: rec.state || "NE",
      age,
      sex: rec.sex,
      smoker: 0,
      term_years: rec.term,
      face_band_min: rec.face,
      face_band_max: rec.face,
      health_class: HEALTH_MAP[rec.health] || "preferred_plus_nt",
      rate_per_thousand: "",
      policy_fee_annual: "",
      modal_monthly_factor: "",
      monthly_premium: b.monthly,
      face_amount: rec.face,
      source_file: "integrity-connect-quick-quote",
      source_date: asOf,
      integrity_carrier: (b.carrier || "").replace(/,/g, ";"),
      integrity_product: (b.product || "").replace(/,/g, ";"),
      nearest_age: nearest,
      product_type: productType,
    };
    lines.push(header.map((h) => row[h]).join(","));
  }
  return lines.join("\n") + "\n";
}

async function startQuoteSession(args, sex, age) {
  const productLabel = productLabelFor(args.product);
  console.log(`\n== New quote session: ${productLabel} ${sex} age ${age} ==`);

  let kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
  if (kind === "results") {
    const meta = await evalPage(`(() => {
      const t = document.body.innerText || "";
      const ageM = t.match(/Age:\\s*\\n?\\s*(\\d+)/);
      const genderM = t.match(/Gender:\\s*\\n?\\s*(Male|Female)/);
      const productM = t.match(/Final Expense|Fully Underwritten Term|Simplified Term/);
      return {
        age: ageM ? Number(ageM[1]) : null,
        gender: genderM ? genderM[1].toLowerCase() : null,
        product: productM ? productM[0] : null,
      };
    })()`);
    if (
      meta.age === age &&
      meta.gender === sex &&
      (!meta.product || meta.product === productLabel)
    ) {
      console.log("  reusing results page for same insured");
      return true;
    }
  }

  if (kind !== "demographics") {
    kind = await forceNewQuoteSession(productLabel);
    console.log("  after open:", kind);
  } else {
    console.log("  using open demographics form");
  }

  if (kind !== "demographics") {
    await sleep(800);
    kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
  }
  if (kind !== "demographics") {
    console.warn("  expected demographics, got", kind);
    return false;
  }

  let filled = await fillDemographics({
    sex,
    age,
    tobacco: !!args.tobacco,
  });
  console.log("  demographics:", filled);
  if (!filled.continueEnabled) {
    await sleep(400);
    filled = await fillDemographics({
      sex,
      age,
      tobacco: !!args.tobacco,
    });
    console.log("  demographics retry:", filled);
  }
  await sleep(400);
  let cont = await clickContinue();
  if (!cont.ok) {
    await sleep(500);
    cont = await clickContinue();
  }
  console.log("  continue1:", cont);
  await sleep(1200);
  kind = await evalPage(`(() => { ${HELPERS} return pageKind(); })()`);
  if (kind === "fe_health" || kind === "specialty_required") {
    kind = await continuePastFeHealth();
    console.log("  after FE health:", kind);
  }
  if (kind === "preferences") {
    const face0 = args.faces[0];
    const term0 = args.terms[0];
    const health0 = args.health[0];
    const prefs = await fillPreferences({
      face: face0,
      term: term0,
      health: health0,
    });
    console.log("  preferences:", prefs);
    await sleep(300);
    cont = await clickContinue();
    console.log("  continue2:", cont);
  }
  const ok = await waitForResults(args.sleepMs);
  console.log("  results ready:", ok);
  return ok;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const status = await api("/v1/status");
  if (!status.online || !status.armed) {
    console.error("Bridge not armed:", status);
    process.exit(1);
  }
  console.log("Bridge armed:", status.tabUrl);

  const outJson =
    args.outJson ||
    (args.product === "fe"
      ? path.join(OUT_DIR, "integrity-fe-harvest.json")
      : args.product === "si"
        ? path.join(OUT_DIR, "integrity-si-harvest.json")
        : args.product === "children"
          ? path.join(OUT_DIR, "integrity-children-harvest.json")
          : HARVEST_JSON);
  const outCsv = args.outJson
    ? args.outJson.replace(/\.json$/i, ".csv")
    : args.product === "fe"
      ? path.join(OUT_DIR, "integrity-fe-premiums.csv")
      : args.product === "si"
        ? path.join(OUT_DIR, "integrity-si-term-premiums.csv")
        : args.product === "children"
          ? path.join(OUT_DIR, "integrity-children-premiums.csv")
          : FU_CSV;

  if (args.fresh && fs.existsSync(outJson)) {
    const bak = outJson.replace(/\.json$/i, `.bak-${Date.now()}.json`);
    fs.copyFileSync(outJson, bak);
    console.log("Archived previous harvest →", bak);
  }

  // --fresh starts a new product file from empty; without --fresh, resume/merge.
  const existing =
    !args.fresh && fs.existsSync(outJson)
      ? JSON.parse(fs.readFileSync(outJson, "utf8"))
      : { records: [] };
  let records = existing.records || [];
  if (args.force) {
    // Drop matching product_type cells so they are re-scraped with full pagination
    const dropType = productTypeKey(args.product);
    records = records.filter((r) => (r.product_type || "") !== dropType);
    console.log(`Force refresh: cleared ${dropType} records; kept ${records.length}`);
  }
  const seen = new Set(
    records.map(
      (r) =>
        `${r.product_type || "fully_underwritten_term"}|${r.sex}|${r.age}|${r.term}|${r.face}|${r.health}|${r.tobacco ? 1 : 0}`
    )
  );

  let quoteCount = 0;
  const productType = productTypeKey(args.product);

  outer: for (const age of args.ages) {
    for (const sex of args.sexes) {
      const neededCombos = [];
      for (const health of args.health) {
        for (const term of args.terms) {
          for (const face of args.faces) {
            const key = `${productType}|${sex}|${age}|${term}|${face}|${health}|${args.tobacco ? 1 : 0}`;
            if (!seen.has(key)) neededCombos.push({ health, term, face, key });
          }
        }
      }
      if (!neededCombos.length) {
        console.log(`Skip ${sex} ${age} — already harvested`);
        continue;
      }
      if (quoteCount >= args.maxQuotes) break outer;

      try {
        const started = await startQuoteSession(args, sex, age);
        if (!started) {
          console.warn("Failed to reach results; skipping session");
          try {
            await cmd("navigate", {
              url: "https://connect.integrity.com/agent/dashboard",
            });
            await sleep(2000);
          } catch (_) {}
          continue;
        }

        for (const combo of neededCombos) {
          if (quoteCount >= args.maxQuotes) break outer;
          await applyResultFilters(combo);
          await sleep(args.sleepMs);
          for (let w = 0; w < 5; w++) {
            const snap = await evalPage(`(() => {
              ${HELPERS}
              const cards = parseCards();
              return cards[0] || null;
            })()`);
            if (!snap) {
              await sleep(900);
              continue;
            }
            const faceOk = snap.face_amount === combo.face;
            const termOk =
              combo.term === 0 ||
              snap.term_years == null ||
              snap.term_years === combo.term;
            if (faceOk && termOk) break;
            await sleep(900);
          }
          const rec = await scrapeResults({
            product_type: productType,
            sex,
            age,
            term: combo.term,
            face: combo.face,
            health: combo.health,
            health_label: HEALTH_LABEL[combo.health] || combo.health,
            state: "NE",
            tobacco: !!args.tobacco,
          });
          rec.nearest_age = rec.best?.nearest_age || age;
          const appointed = (rec.all || []).filter((c) =>
            [
              "transamerica",
              "corebridge",
              "moo",
              "amam",
              "assurity",
              "aetna",
              "americo",
            ].includes(carrierKey(c.carrier))
          );
          rec.appointed = appointed;
          rec.appointed_best = appointed[0] || null;
          // Children harvest: only keep sellable/appointed products for quoter + charts
          if (args.product === "children") {
            rec.marketplace_all = rec.all;
            rec.all = appointed;
            rec.best = appointed[0] || null;
            rec.top = appointed.slice(0, 10);
            rec.policy_count = appointed.length;
          }
          rec.appointed_best = appointed[0] || null;
          records.push(rec);
          seen.add(combo.key);
          quoteCount++;
          const m = rec.best?.monthly;
          const p = rec.best?.product;
          const c = rec.best?.carrier;
          const ap = rec.appointed_best;
          console.log(
            `  [${quoteCount}] ${sex} age${age} ${combo.term || "FE"} $${combo.face} ${combo.health} → $${m} (${p} / ${c}) cards=${(rec.all || []).length}/${rec.policy_count} appointed=${appointed.length}${ap ? ` bestAppointed=$${ap.monthly} ${ap.carrier}` : ""}`
          );
          fs.writeFileSync(
            outJson,
            JSON.stringify(
              {
                harvested_at: new Date().toISOString(),
                source: "Integrity Connect Quick Quote via MVI Agent Bridge",
                args,
                record_count: records.length,
                records,
              },
              null,
              2
            ) + "\n"
          );
        }
      } catch (sessionErr) {
        console.warn(
          `Session error ${sex} age ${age}:`,
          sessionErr.message || sessionErr
        );
        try {
          await cmd("navigate", {
            url: "https://connect.integrity.com/agent/dashboard",
          });
          await sleep(2500);
        } catch (_) {}
        continue;
      }
    }
  }

  const typed = records.filter((r) => (r.product_type || "") === productType);
  fs.writeFileSync(outCsv, toCsvRows(typed.length ? typed : records, productType));
  // Keep FU CSV rebuild-compatible when harvesting FU (never when --out-json is a spot file)
  if (args.product === "fu" && !args.outJson) {
    fs.writeFileSync(FU_CSV, toCsvRows(typed, "fully_underwritten_term"));
  }
  console.log(`\nWrote ${outJson} (${records.length} records)`);
  console.log(`Wrote ${outCsv}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
