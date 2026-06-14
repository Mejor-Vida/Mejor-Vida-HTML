#!/usr/bin/env node
/**
 * Automated WinFlex extract — Playwright drives the browser (you stay logged in).
 *
 *   npm run harvest:winflex:setup
 *   npm run harvest:winflex -- login          # once: sign in, save session
 *   npm run harvest:winflex:auto --fast       # 2 quotes: male 45 PP + Standard @ $250K
 *   npm run harvest:winflex:auto --pilot      # 6 validation quotes
 *   npm run harvest:winflex:auto -- --discover   # dump Express wizard labels
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import os from "os";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const lib = require("./winflex-harvest-lib.js");

const WINFLEX_HOME = process.env.WINFLEX_URL || "https://www.winflexweb.com/wfw_home.aspx";
const WINFLEX_EXPRESS =
  process.env.WINFLEX_EXPRESS_URL || "https://www.winflexweb.com/wfx_express.aspx";
const PROFILE_DIR =
  process.env.WINFLEX_PROFILE_DIR ||
  path.join(os.homedir(), ".mvi-winflex-harvest");
const CDP_PORT = Number(process.env.WINFLEX_CDP_PORT || 9333);
const SHOT_DIR = path.join(lib.KNOWLEDGE_DIR, "winflex-screenshots", "auto");

const FAST_SPECS = [
  { term_years: 20, age: 45, sex: "male", smoker: 0, face: 250000, health_class: "preferred_plus_nt" },
  { term_years: 20, age: 45, sex: "male", smoker: 0, face: 250000, health_class: "standard_nt" },
];

const HEALTH_LABEL = {
  preferred_plus_nt: /preferred plus/i,
  standard_nt: /standard non.?smok/i,
};

function parseArgs(argv) {
  const args = { mode: "auto", fast: false, pilot: false, discover: false, carrier: lib.DEFAULT_CARRIER };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--fast") args.fast = true;
    if (argv[i] === "--pilot") args.pilot = true;
    if (argv[i] === "--discover") args.discover = true;
    if (argv[i] === "--carrier" && argv[i + 1]) args.carrier = argv[++i];
  }
  if (!args.fast && !args.pilot && !args.discover) args.fast = true;
  return args;
}

function profileInUseError(err) {
  const msg = String(err && err.message ? err.message : err);
  return /existing browser session|profile.*in use|SingletonLock/i.test(msg);
}

async function connectCdp() {
  const url = `http://127.0.0.1:${CDP_PORT}`;
  const browser = await chromium.connectOverCDP(url);
  const context = browser.contexts()[0];
  if (!context) throw new Error(`CDP connected but no browser context at ${url}`);
  const page = context.pages().filter((p) => !p.isClosed()).slice(-1)[0] || (await context.newPage());
  return { context, page, cdp: true };
}

async function closeProfileBrowsers() {
  const { execSync } = await import("child_process");
  try {
    execSync(`pkill -f "user-data-dir=${PROFILE_DIR}"`, { stdio: "ignore" });
    await new Promise((r) => setTimeout(r, 1500));
  } catch (e) {
    /* none running */
  }
}

async function launch() {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const opts = {
    headless: false,
    viewport: { width: 1440, height: 960 },
    acceptDownloads: true,
    slowMo: 80,
    args: [`--remote-debugging-port=${CDP_PORT}`],
  };

  if (process.env.WINFLEX_CDP_ATTACH === "1") {
    return connectCdp();
  }

  async function tryLaunch() {
    try {
      return await chromium.launchPersistentContext(PROFILE_DIR, opts);
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      if (/Executable doesn't exist/i.test(msg)) {
        console.log("Playwright Chromium missing — using installed Google Chrome…");
        return chromium.launchPersistentContext(PROFILE_DIR, { ...opts, channel: "chrome" });
      }
      throw e;
    }
  }

  try {
    const context = await tryLaunch();
    const page = context.pages()[0] || (await context.newPage());
    return { context, page, cdp: false };
  } catch (e) {
    if (!profileInUseError(e)) throw e;
    console.log("WinFlex profile busy — closing prior harvest browser…");
    await closeProfileBrowsers();
    try {
      const context = await tryLaunch();
      const page = context.pages()[0] || (await context.newPage());
      return { context, page, cdp: false };
    } catch (e2) {
      if (!profileInUseError(e2)) throw e2;
      console.log(`Retrying via CDP on port ${CDP_PORT}…`);
      return connectCdp();
    }
  }
}

async function snap(page, name) {
  const file = path.join(SHOT_DIR, `${Date.now()}-${name}.png`);
  await page.screenshot({ path: file, fullPage: true }).catch(() => {});
  console.log("  screenshot:", file);
  return file;
}

async function activePage(context) {
  const pages = context.pages().filter((p) => !p.isClosed());
  return pages[pages.length - 1] || pages[0];
}

async function clickFirst(page, patterns) {
  for (const pat of patterns) {
    const loc = page.getByRole("button", { name: pat }).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click();
      return true;
    }
    const link = page.getByRole("link", { name: pat }).first();
    if (await link.isVisible().catch(() => false)) {
      await link.click();
      return true;
    }
    const txt = page.getByText(pat).first();
    if (await txt.isVisible().catch(() => false)) {
      await txt.click();
      return true;
    }
  }
  return false;
}

async function selectDropdownOption(page, labelRe, optionRe) {
  const label = page.getByText(labelRe).first();
  if (!(await label.isVisible().catch(() => false))) return false;
  const row = label.locator("xpath=ancestor::tr[1] | ancestor::div[contains(@class,'row')][1]").first();
  const trigger = row.locator("select, input, [role='combobox'], .dropdown, a").first();
  if (await trigger.count()) {
    try {
      if (await trigger.evaluate((el) => el.tagName === "SELECT")) {
        await trigger.selectOption({ label: optionRe });
        return true;
      }
    } catch (e) {}
    await trigger.click().catch(() => {});
    await page.waitForTimeout(400);
  }
  const opt = page.getByText(optionRe).first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click();
    return true;
  }
  return false;
}

async function fillByLabel(page, labelRe, value) {
  const lab = page.locator("label").filter({ hasText: labelRe }).first();
  if (await lab.isVisible().catch(() => false)) {
    const id = await lab.getAttribute("for").catch(() => null);
    if (id) {
      const inp = page.locator(`#${id}`);
      if (await inp.isVisible().catch(() => false)) {
        await inp.fill(String(value));
        return true;
      }
    }
    const inp2 = lab.locator("xpath=following::input[1]").first();
    if (await inp2.isVisible().catch(() => false)) {
      await inp2.fill(String(value));
      return true;
    }
  }
  const inp = page.getByLabel(labelRe).first();
  if (await inp.isVisible().catch(() => false)) {
    await inp.fill(String(value));
    return true;
  }
  return false;
}

async function pageText(page) {
  return page.evaluate(() => document.body?.innerText || "").catch(() => "");
}

async function waitForExpressReady(page, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const url = page.url();
    const text = await pageText(page);
    if (/wfx_express/i.test(url) && /Select Product Type/i.test(text) && !/Loading Please wait/i.test(text)) {
      return true;
    }
    await page.waitForTimeout(800);
  }
  throw new Error("Express Illustrations did not finish loading");
}

async function onExpressPage(page) {
  const url = page.url();
  const text = await pageText(page);
  return /wfx_express/i.test(url) && /Select Product Type/i.test(text);
}

async function dumpPageStructure(page) {
  return page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll("label, th, td, span, div"))
      .map((el) => (el.textContent || "").replace(/\s+/g, " ").trim())
      .filter((t) => t && t.length < 80);
    const uniqueLabels = [...new Set(labels)].slice(0, 80);
    const inputs = Array.from(document.querySelectorAll("input, select, textarea")).map((el) => ({
      tag: el.tagName,
      type: el.type || "",
      id: el.id || "",
      name: el.name || "",
      value: el.value || "",
      placeholder: el.placeholder || "",
    }));
    const radios = Array.from(document.querySelectorAll("input[type='radio']")).map((el) => ({
      id: el.id,
      name: el.name,
      value: el.value,
      checked: el.checked,
      label: el.labels?.[0]?.textContent?.trim() || el.parentElement?.textContent?.trim()?.slice(0, 40) || "",
    }));
    return { url: location.href, title: document.title, uniqueLabels, inputs, radios };
  });
}

async function clickExpressTab(page, nameRe) {
  const tab = page.locator("form label, form span, form a, form input[type='radio'], form li").filter({ hasText: nameRe }).first();
  if (await tab.isVisible().catch(() => false)) {
    await tab.click();
    await page.waitForTimeout(800);
    return true;
  }
  return false;
}

async function clickExpressWizardStep(page, nameRe) {
  const step = page.locator("form a, form li, form span, form td, form th").filter({ hasText: nameRe }).first();
  if (await step.isVisible().catch(() => false)) {
    await step.click();
    await page.waitForTimeout(700);
    return true;
  }
  return false;
}

async function fillExpressField(page, labelRe, value) {
  if (await fillByLabel(page, labelRe, value)) return true;
  const cell = page.locator("td, th, label, span").filter({ hasText: labelRe }).first();
  if (await cell.isVisible().catch(() => false)) {
    const row = cell.locator("xpath=ancestor::tr[1]").first();
    const inp = row.locator("input:not([type='hidden']), select, textarea").first();
    if (await inp.isVisible().catch(() => false)) {
      const tag = await inp.evaluate((el) => el.tagName);
      if (tag === "SELECT") {
        await inp.selectOption({ label: String(value) }).catch(async () => {
          await inp.selectOption(String(value));
        });
      } else {
        await inp.fill(String(value));
      }
      return true;
    }
  }
  return false;
}

async function selectExpressOption(page, labelRe, optionRe) {
  if (await selectDropdownOption(page, labelRe, optionRe)) return true;
  const opt = page.locator("form label, form span, form a, form li, form option, form td").filter({ hasText: optionRe }).first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click();
    return true;
  }
  const selects = page.locator("form select");
  const count = await selects.count();
  for (let i = 0; i < count; i++) {
    const sel = selects.nth(i);
    const html = await sel.innerHTML().catch(() => "");
    if (optionRe.test(html)) {
      const options = await sel.locator("option").allTextContents();
      const pick = options.find((o) => optionRe.test(o));
      if (pick) {
        await sel.selectOption({ label: pick.trim() });
        return true;
      }
    }
  }
  return false;
}

async function openExpressIllustrations(page) {
  if (await onExpressPage(page)) {
    await waitForExpressReady(page);
    return page;
  }

  await page.goto(WINFLEX_EXPRESS, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(2500);
  if (await onExpressPage(page)) {
    await waitForExpressReady(page);
    return page;
  }

  await page.goto(WINFLEX_HOME, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForTimeout(2000);
  const expressLink = page.locator("a").filter({ hasText: /^Express Illustrations$/i }).first();
  if (await expressLink.isVisible().catch(() => false)) {
    await Promise.all([
      page.waitForURL(/wfx_express/i, { timeout: 30000 }).catch(() => {}),
      expressLink.click({ timeout: 15000 }),
    ]);
  } else {
    await clickFirst(page, [/^express illustrations$/i]);
    await page.waitForURL(/wfx_express/i, { timeout: 30000 }).catch(() => {});
  }
  await page.waitForTimeout(2000);
  await waitForExpressReady(page);
  return page;
}

async function setupExpressTermQuote(page, spec) {
  await openExpressIllustrations(page);
  await snap(page, "express-open");

  const termLabel = page.locator("form label, form span").filter({ hasText: /^Term$/i }).first();
  if (await termLabel.isVisible().catch(() => false)) {
    await termLabel.click();
  } else {
    await clickExpressTab(page, /^Term$/i);
  }
  await page.waitForTimeout(1000);
  await snap(page, "term-selected");

  await clickExpressWizardStep(page, /^Insured$/i);
  await fillExpressField(page, /^age$/i, spec.age);
  await selectExpressOption(page, /^sex$/i, new RegExp(spec.sex, "i"));
  await selectExpressOption(page, /state/i, /nebraska|^ne$/i);
  const healthPat = HEALTH_LABEL[spec.health_class] || /preferred plus/i;
  await selectExpressOption(page, /class|risk/i, healthPat);
  if (spec.smoker) {
    await selectExpressOption(page, /tobacco|smok/i, /yes|tobacco/i);
  }

  await clickExpressWizardStep(page, /Quote Information/i);
  await fillExpressField(page, /face|death benefit|amount/i, spec.face);
  await selectExpressOption(page, /term|duration|years/i, new RegExp(String(spec.term_years), "i"));
  await selectExpressOption(page, /mode|billing|payment/i, /monthly/i);

  await clickExpressWizardStep(page, /Company/i);
  await selectExpressOption(page, /company|carrier/i, /transamerica/i);
  await clickFirst(page, [/trendsetter super/i, /trendsetter/i]);
  await page.waitForTimeout(800);

  return page;
}

async function runCalculate(page) {
  await clickExpressWizardStep(page, /Calculation|Output/i);
  const calcBtn = page.locator(
    'input[value="Calculate"], input[value="Run"], button:has-text("Calculate"), button:has-text("Run"), a:has-text("Calculate")'
  ).first();
  if (await calcBtn.isVisible().catch(() => false)) {
    await calcBtn.click();
  } else {
    await clickFirst(page, [/^calculate$/i, /^run$/i, /get quote/i]);
  }
  await page.waitForTimeout(3500);
  await page.waitForFunction(
    () =>
      /Premium|Monthly|Annual|Results|Transamerica/i.test(document.body?.innerText || "") &&
      !/Loading Please wait/i.test(document.body?.innerText || ""),
    { timeout: 90000 }
  ).catch(() => {});
}

async function extractPremiumFromPage(page, profile) {
  const text = await page.evaluate(() => document.body.innerText || "");
  let extracted = lib.extractFromText(text);

  const annualMatch = text.match(/initial annual premium[\s\S]{0,80}?(\d[\d,]*\.?\d*)/i);
  if (annualMatch && !extracted.monthly_premium) {
    const annual = Number(annualMatch[1].replace(/,/g, ""));
    const modal = Number(profile.modal_monthly_factor || 0.085);
    if (annual > 0 && modal > 0) {
      extracted.monthly_premium = Math.round(annual * modal * 100) / 100;
      extracted.derived_from_annual = annual;
      console.log(`  derived monthly from annual $${annual} × ${modal} = $${extracted.monthly_premium}`);
    }
  }

  const tablePrem = await page.locator("table").first().innerText().catch(() => "");
  if (tablePrem) {
    const t2 = lib.extractFromText(tablePrem);
    if (t2.monthly_premium) extracted.monthly_premium = t2.monthly_premium;
  }

  return extracted;
}

async function quoteOne(context, spec, profile, index, total) {
  console.log(`\n[${index}/${total}] Express quote`, JSON.stringify(spec));
  let page = await activePage(context);
  page = await setupExpressTermQuote(page, spec);
  await snap(page, `filled-${index}`);

  await runCalculate(page);
  page = await activePage(context);
  await snap(page, `results-${index}`);

  const extracted = await extractPremiumFromPage(page, profile);
  if (!extracted.monthly_premium) {
    throw new Error("Could not extract monthly premium — see screenshot");
  }

  const band = lib.faceBandForAmount(spec.face);
  const record = {
    spec: Object.assign({}, spec, {
      carrier: profile.carrier,
      product: profile.product,
      face_band_min: band.min,
      face_band_max: band.max,
    }),
    monthly_premium: extracted.monthly_premium,
    rate_per_thousand: extracted.rate_per_thousand,
    derived_from_annual: extracted.derived_from_annual || null,
    captured_at: new Date().toISOString(),
    source: "auto-extract",
    url: page.url(),
  };
  lib.saveCapture(record);
  console.log(`  saved $${extracted.monthly_premium.toFixed(2)}/mo`);
  return record;
}

async function discover(page) {
  await openExpressIllustrations(page);
  const steps = [{ step: "express-home", ...(await dumpPageStructure(page)) }];

  await clickExpressTab(page, /^Term$/i);
  await page.waitForTimeout(1000);
  steps.push({ step: "term-selected", ...(await dumpPageStructure(page)) });

  for (const stepName of [/^Insured$/i, /Quote Information/i, /Company/i, /Calculation/i]) {
    await clickExpressWizardStep(page, stepName);
    await page.waitForTimeout(800);
    steps.push({
      step: `wizard-${String(stepName).replace(/\//g, "")}`,
      ...(await dumpPageStructure(page)),
    });
  }

  console.log(JSON.stringify(steps, null, 2));
}

async function main() {
  const args = parseArgs(process.argv);
  const profile = lib.resolveCarrierProfile(args.carrier);
  const { context, page } = await launch();

  if (args.discover) {
    await discover(page);
    await context.close();
    return;
  }

  const specs = args.pilot
    ? lib.buildPilotGrid(args.carrier)
    : args.fast
      ? FAST_SPECS.map((s) =>
          Object.assign({}, s, {
            carrier: profile.carrier,
            product: profile.product,
            face_band_min: lib.faceBandForAmount(s.face).min,
            face_band_max: lib.faceBandForAmount(s.face).max,
          })
        )
      : lib.buildPilotGrid(args.carrier);

  console.log("Automated WinFlex Express extract —", profile.label);
  console.log("Using saved login:", PROFILE_DIR);
  console.log("Quotes to run:", specs.length);

  const results = [];
  for (let i = 0; i < specs.length; i++) {
    try {
      results.push(await quoteOne(context, specs[i], profile, i + 1, specs.length));
    } catch (err) {
      console.error("  FAILED:", err.message || err);
      await snap(await activePage(context), `error-${i + 1}`);
    }
  }

  await context.close();

  const merge = lib.mergeCapturesToCsv(args.carrier);
  console.log("\nDone.", results.length, "captured.");
  console.log(merge.message || `Merged ${merge.merged} rows → ${merge.csvPath}`);
  if (merge.merged) {
    console.log("Next: node scripts/build-term-premiums-migration.js");
    console.log("      python3 integrations/supabase/apply_migrations.py");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
