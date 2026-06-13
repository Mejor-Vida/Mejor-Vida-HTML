#!/usr/bin/env node
/**
 * Interactive WinFlex harvest — you log in and run quotes; this script extracts premiums.
 *
 *   npm run harvest:winflex:install   # once: playwright chromium
 *   npm run harvest:winflex -- login  # open WinFlex, sign in, press Enter
 *   npm run harvest:winflex -- run --pilot
 *   npm run harvest:winflex -- snap    # capture current results page (ad hoc)
 *   npm run harvest:winflex -- merge   # write MOO rows → term_carrier_premiums.csv
 *   npm run harvest:winflex -- status
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const lib = require("./winflex-harvest-lib.js");

const WINFLEX_URL = process.env.WINFLEX_URL || "https://www.winflexweb.com/";
const PROFILE_DIR =
  process.env.WINFLEX_PROFILE_DIR ||
  path.join(os.homedir(), ".mvi-winflex-harvest");

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(function (resolve) {
    rl.question(question, function (answer) {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function parseArgs(argv) {
  const args = {
    mode: "help",
    pilot: false,
    full: false,
    carrier: process.env.WINFLEX_HARVEST_CARRIER || lib.DEFAULT_CARRIER,
  };
  const rest = argv.slice(2);
  if (!rest.length) return args;
  args.mode = rest[0];
  for (let i = 1; i < rest.length; i++) {
    if (rest[i] === "--pilot") args.pilot = true;
    if (rest[i] === "--full") args.full = true;
    if (rest[i] === "--carrier" && rest[i + 1]) {
      args.carrier = rest[++i];
    }
  }
  if (args.mode === "run" && !args.pilot && !args.full) args.pilot = true;
  return args;
}

function browserMissingHelp(err) {
  console.error("\nPlaywright browser not installed.\n");
  console.error("Run these two commands (one per line, no comments on the line):\n");
  console.error('  cd "/Users/mejorvidainsurance/Desktop/mejor-vida-html /Mejor-Vida-HTML"');
  console.error("  npx playwright install chromium\n");
  console.error("Or: npm run harvest:winflex:setup\n");
  if (err && err.message) console.error(String(err.message).split("\n")[0]);
}

async function launchBrowser() {
  fs.mkdirSync(PROFILE_DIR, { recursive: true });
  const baseOpts = {
    headless: false,
    viewport: { width: 1440, height: 920 },
    acceptDownloads: true,
  };

  let context;
  try {
    context = await chromium.launchPersistentContext(PROFILE_DIR, baseOpts);
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    if (!/Executable doesn't exist|browserType\.launchPersistentContext/i.test(msg)) {
      throw err;
    }
    try {
      console.log("Playwright Chromium missing — trying installed Google Chrome…");
      context = await chromium.launchPersistentContext(PROFILE_DIR, Object.assign({}, baseOpts, {
        channel: "chrome",
      }));
    } catch (err2) {
      browserMissingHelp(err2);
      process.exit(1);
    }
  }

  const page = context.pages()[0] || (await context.newPage());
  return { context, page };
}

const BANNER_STORAGE_KEY = "mvi-winflex-harvest-banner-text";

function installPersistentBanner(context) {
  if (context.__mviBannerInstalled) return;
  context.__mviBannerInstalled = true;
  context.addInitScript(function (storageKey) {
    function injectBanner() {
      if (!document.body) return;
      var bannerText = "";
      try {
        bannerText = sessionStorage.getItem(storageKey) || "";
      } catch (e) {}
      if (!bannerText) {
        var old = document.getElementById("mvi-winflex-harvest-banner");
        if (old) old.remove();
        return;
      }
      var el = document.getElementById("mvi-winflex-harvest-banner");
      if (!el) {
        el = document.createElement("div");
        el.id = "mvi-winflex-harvest-banner";
        el.setAttribute("role", "status");
        document.body.appendChild(el);
      }
      el.textContent = bannerText;
      el.style.cssText =
        "position:fixed!important;bottom:0!important;left:0!important;right:0!important;" +
        "top:auto!important;z-index:2147483647!important;background:#c2410c!important;" +
        "color:#fff!important;padding:16px 20px!important;font:700 14px/1.45 system-ui,sans-serif!important;" +
        "box-shadow:0 -4px 24px rgba(0,0,0,.45)!important;white-space:pre-wrap!important;" +
        "border-top:4px solid #fff!important;pointer-events:none!important;";
    }
    injectBanner();
    document.addEventListener("DOMContentLoaded", injectBanner);
    window.addEventListener("load", injectBanner);
    window.setInterval(injectBanner, 1500);
  }, BANNER_STORAGE_KEY);
}

async function setBannerText(page, text) {
  await page.evaluate(
    function (args) {
      try {
        sessionStorage.setItem(args.key, args.text);
      } catch (e) {}
    },
    { key: BANNER_STORAGE_KEY, text: text || "" }
  );
}

async function showBanner(page, text) {
  const injectFn = function (bannerText) {
    if (!document.body) return false;
    var el = document.getElementById("mvi-winflex-harvest-banner");
    if (!el) {
      el = document.createElement("div");
      el.id = "mvi-winflex-harvest-banner";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = bannerText;
    el.style.cssText =
      "position:fixed!important;bottom:0!important;left:0!important;right:0!important;" +
      "top:auto!important;z-index:2147483647!important;background:#c2410c!important;" +
      "color:#fff!important;padding:16px 20px!important;font:700 14px/1.45 system-ui,sans-serif!important;" +
      "box-shadow:0 -4px 24px rgba(0,0,0,.45)!important;white-space:pre-wrap!important;" +
      "border-top:4px solid #fff!important;pointer-events:none!important;";
    return true;
  };

  await setBannerText(page, text);

  let injected = false;
  try {
    await page.bringToFront();
  } catch (e) {}

  for (const frame of page.frames()) {
    try {
      const ok = await frame.evaluate(injectFn, text);
      if (ok) injected = true;
    } catch (e) {}
  }
  return injected;
}

async function scrapePage(page) {
  const text = await page.evaluate(function () {
    return document.body ? document.body.innerText || "" : "";
  });
  const url = page.url();
  const title = await page.title().catch(function () {
    return "";
  });
  const shotDir = path.join(lib.KNOWLEDGE_DIR, "winflex-screenshots");
  fs.mkdirSync(shotDir, { recursive: true });
  const shotName = "capture-" + Date.now() + ".png";
  const shotPath = path.join(shotDir, shotName);
  await page.screenshot({ path: shotPath, fullPage: true }).catch(function () {});

  const extracted = lib.extractFromText(text);
  return Object.assign({}, extracted, {
    page_text_sample: text.slice(0, 4000),
    url,
    title,
    screenshot: shotPath,
  });
}

async function pickPremium(extracted) {
  if (extracted.monthly_premium != null) {
    console.log("Detected monthly premium: $" + extracted.monthly_premium.toFixed(2));
    const confirm = await ask("Use this amount? [Y/n/list]: ");
    if (!confirm || /^y/i.test(confirm)) return extracted.monthly_premium;
    if (/^list/i.test(confirm) && extracted.monthly_candidates.length) {
      extracted.monthly_candidates.forEach(function (n, i) {
        console.log("  [" + i + "] $" + n.toFixed(2));
      });
      const idx = await ask("Pick index: ");
      const pick = extracted.monthly_candidates[parseInt(idx, 10)];
      if (Number.isFinite(pick)) return pick;
    }
  } else if (extracted.monthly_candidates.length) {
    console.log("Could not auto-detect. Candidates:");
    extracted.monthly_candidates.forEach(function (n, i) {
      console.log("  [" + i + "] $" + n.toFixed(2));
    });
    const idx = await ask("Pick index (or type amount like 122.67): ");
    if (/^\d/.test(idx)) {
      if (idx.includes(".")) return Number(idx);
      const pick = extracted.monthly_candidates[parseInt(idx, 10)];
      if (Number.isFinite(pick)) return pick;
    }
  }
  const manual = await ask("Enter monthly premium ($): ");
  const val = Number(String(manual).replace(/[$,]/g, ""));
  return Number.isFinite(val) && val > 0 ? val : null;
}

async function cmdLogin(carrierId) {
  const profile = lib.resolveCarrierProfile(carrierId);
  const { context, page } = await launchBrowser();
  console.log("\nOpening WinFlex in a dedicated browser profile:");
  console.log("  " + PROFILE_DIR);
  console.log("\n1. Sign in with your agent credentials.");
  console.log("2. Carrier for this harvest: " + profile.label);
  console.log("3. Return here and press Enter to save session.\n");

  await page.goto(WINFLEX_URL, { waitUntil: "domcontentloaded", timeout: 120000 });
  await ask("Press Enter when logged in… ");
  console.log("Session saved. You can close the browser or continue with `run`.");
  await ask("Press Enter to close browser… ");
  await context.close();
}

async function cmdSnap(carrierId) {
  const profile = lib.resolveCarrierProfile(carrierId);
  const { context, page } = await launchBrowser();
  await page.goto(WINFLEX_URL, { waitUntil: "domcontentloaded", timeout: 120000 });

  console.log("\nNavigate to a WinFlex quote RESULTS page (" + profile.label + "), then press Enter.");
  await ask("Ready to capture? ");

  const scraped = await scrapePage(page);
  console.log("\n--- Page extract ---");
  console.log("URL:", scraped.url);
  if (scraped.monthly_candidates.length) {
    console.log("Candidates:", scraped.monthly_candidates.map(function (n) {
      return "$" + n.toFixed(2);
    }).join(", "));
  }

  const monthly_premium = await pickPremium(scraped);
  if (monthly_premium == null) {
    console.error("No premium captured.");
    await context.close();
    process.exit(1);
  }

  const spec = {
    carrier: profile.carrier,
    product: profile.product,
    term_years: parseInt(await ask("Term years (e.g. 20): "), 10),
    age: parseInt(await ask("Issue age: "), 10),
    sex: (await ask("Sex (male/female): ")).toLowerCase(),
    smoker: /^y|1|t/i.test(await ask("Tobacco? (y/n): ")) ? 1 : 0,
    face: parseInt(String(await ask("Face amount (e.g. 250000): ")).replace(/[$,]/g, ""), 10),
    health_class: (await ask("Health class (preferred_plus_nt / standard_nt): ")).trim(),
  };
  const band = lib.faceBandForAmount(spec.face);
  spec.face_band_min = band.min;
  spec.face_band_max = band.max;

  const record = {
    spec,
    monthly_premium,
    rate_per_thousand: scraped.rate_per_thousand,
    captured_at: new Date().toISOString(),
    source: "snap",
    screenshot: scraped.screenshot,
    url: scraped.url,
  };
  lib.saveCapture(record);
  console.log("\nSaved capture →", lib.CAPTURES_PATH);
  console.log("Run: npm run harvest:winflex -- merge");
  await context.close();
}

async function cmdRun(usePilot, carrierId) {
  const profile = lib.resolveCarrierProfile(carrierId);
  const grid = usePilot ? lib.buildPilotGrid(carrierId) : lib.buildFullGrid(carrierId);
  const existing = lib.captureIndexByKey(lib.loadCaptures());
  const pending = grid.filter(function (spec) {
    return !existing.has(lib.specKey(spec));
  });

  console.log("\nWinFlex harvest queue (" + profile.label + "):");
  console.log("  Total specs:", grid.length);
  console.log("  Already captured:", grid.length - pending.length);
  console.log("  Remaining:", pending.length);
  if (!pending.length) {
    console.log("Nothing left. Run: npm run harvest:winflex -- merge");
    return;
  }

  const { context, page } = await launchBrowser();
  installPersistentBanner(context);
  await page.goto(WINFLEX_URL, { waitUntil: "domcontentloaded", timeout: 120000 });

  console.log("\nUse the **Chrome for Testing** window this script opened (not regular Chrome).");
  console.log("Orange banner sticks to the BOTTOM of the page and reloads after each WinFlex click.\n");
  console.log("Make sure WinFlex is logged in. Press Enter to start queue…");
  await ask("");

  for (let i = 0; i < pending.length; i++) {
    const spec = pending[i];
    const banner = lib.formatSpecBanner(spec, i + 1, pending.length, carrierId);
    console.log("\n" + "=".repeat(72));
    console.log(lib.winflexInstructions(spec, carrierId));
    console.log("=".repeat(72));
    console.log("\nSet up this quote in WinFlex. Orange bar = bottom of browser window.");
    console.log("If you don't see it, press b in this terminal (or use the instructions below).\n");
    await showBanner(page, banner);

    let action = await ask(
      "\nEnter= capture premium | b= show banner again | s=skip | q=quit | m=manual $: "
    );
    if (/^b/i.test(action)) {
      const ok = await showBanner(page, banner);
      console.log(ok ? "Banner re-shown on current WinFlex page." : "Could not inject banner — use terminal instructions above.");
      action = await ask(
        "\nEnter= capture premium | b= show banner again | s=skip | q=quit | m=manual $: "
      );
    }
    if (/^q/i.test(action)) break;
    if (/^s/i.test(action)) continue;

    let monthly_premium = null;
    if (/^m/i.test(action)) {
      const manual = await ask("Monthly premium ($): ");
      monthly_premium = Number(String(manual).replace(/[$,]/g, ""));
    } else if (/^b/i.test(action)) {
      await showBanner(page, banner);
      continue;
    } else {
      await showBanner(page, banner);
      const scraped = await scrapePage(page);
      monthly_premium = await pickPremium(scraped);
      if (monthly_premium == null) {
        console.log("Skipped — no premium.");
        continue;
      }
      const record = {
        spec,
        monthly_premium,
        rate_per_thousand: scraped.rate_per_thousand,
        captured_at: new Date().toISOString(),
        source: "run",
        screenshot: scraped.screenshot,
        url: scraped.url,
      };
      lib.saveCapture(record);
      console.log("Saved $" + monthly_premium.toFixed(2) + " → " + lib.CAPTURES_PATH);
      continue;
    }

    if (Number.isFinite(monthly_premium) && monthly_premium > 0) {
      lib.saveCapture({
        spec,
        monthly_premium,
        captured_at: new Date().toISOString(),
        source: "run-manual",
      });
      console.log("Saved manual $" + monthly_premium.toFixed(2));
    }
  }

  await context.close();
  console.log("\nDone. Merge with: npm run harvest:winflex -- merge");
}

function cmdStatus(carrierId) {
  const profile = lib.resolveCarrierProfile(carrierId);
  const grid = lib.buildPilotGrid(carrierId);
  const captures = lib.loadCaptures().filter(function (c) {
    return c.spec && (c.spec.carrier || profile.carrier) === profile.carrier;
  });
  const idx = lib.captureIndexByKey(captures);
  console.log("Carrier:", profile.label);
  console.log("Captures file:", lib.CAPTURES_PATH);
  console.log("Total captures:", captures.length);
  console.log("Pilot progress:", idx.size + "/" + grid.length);
  const withPremium = captures.filter(function (c) {
    return c.monthly_premium != null;
  }).length;
  console.log("With monthly premium:", withPremium);
}

function cmdMerge(carrierId) {
  const result = lib.mergeCapturesToCsv(carrierId);
  console.log(
    result.message ||
      "Merged " + result.merged + " " + (result.carrier || "carrier") + " rows → " + result.csvPath
  );
  if (result.merged) {
    console.log("Next: node scripts/build-term-premiums-migration.js");
    console.log("      python3 integrations/supabase/apply_migrations.py");
  }
}

function printHelp() {
  console.log(`
WinFlex term rate harvest (default: Transamerica Trendsetter Super)

  npm run harvest:winflex:setup
  npm run harvest:winflex -- login
  npm run harvest:winflex -- run --pilot
  npm run harvest:winflex -- snap
  npm run harvest:winflex -- merge
  npm run harvest:winflex -- status

  Optional: --carrier transamerica | moo

Profile: ${PROFILE_DIR}
Captures: ${lib.CAPTURES_PATH}
`);
}

async function main() {
  const args = parseArgs(process.argv);
  switch (args.mode) {
    case "login":
      await cmdLogin(args.carrier);
      break;
    case "run":
      await cmdRun(args.pilot && !args.full, args.carrier);
      break;
    case "snap":
      await cmdSnap(args.carrier);
      break;
    case "merge":
      cmdMerge(args.carrier);
      break;
    case "status":
      cmdStatus(args.carrier);
      break;
    default:
      printHelp();
  }
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
