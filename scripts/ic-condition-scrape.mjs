#!/usr/bin/env node
/**
 * Scrape IC condition search results (requires logged-in Chrome session).
 * Run: node scripts/ic-condition-scrape.mjs copd diabetes afib
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import os from "os";

const QUERIES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["copd", "diabetes", "broken", "afib", "chf", "blood thinner", "ms"];

const HEALTH_URL =
  process.env.IC_HEALTH_URL ||
  "https://connect.integrity.com/agent/clients/contact/18159121/health";

async function scrapeQuery(page, query) {
  await page.goto(HEALTH_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  const addBtn = page.getByRole("button", { name: /add new/i }).first();
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click();
  }

  const modalTitle = page.getByText("Add a Condition", { exact: false });
  await modalTitle.waitFor({ timeout: 15000 });

  const search = page.getByPlaceholder(/search/i).first();
  await search.fill("");
  await search.fill(query);
  await page.waitForTimeout(1200);

  const countText = await page
    .locator("text=/\\d+ Conditions found/i")
    .first()
    .textContent()
    .catch(() => "");

  const labels = await page.locator('input[type="radio"]').evaluateAll(function (inputs) {
    return inputs.slice(0, 8).map(function (inp) {
      const lab = inp.closest("label") || inp.parentElement;
      return (lab && lab.textContent ? lab.textContent : "").replace(/\s+/g, " ").trim();
    });
  });

  return {
    query,
    countText: (countText || "").trim(),
    top: labels.filter(Boolean),
  };
}

async function main() {
  const chromeDir = path.join(
    os.homedir(),
    "Library/Application Support/Google/Chrome"
  );
  const hasChrome = fs.existsSync(chromeDir);

  let browser;
  try {
    if (hasChrome) {
      browser = await chromium.launchPersistentContext(chromeDir, {
        channel: "chrome",
        headless: false,
        args: ["--profile-directory=Default"],
      });
    } else {
      browser = await chromium.launch({ headless: true });
    }

    const page = browser.pages()[0] || (await browser.newPage());
    await page.goto("https://connect.integrity.com", { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2000);

    if (/login|sign.?in/i.test(await page.title()) || /login/i.test(page.url())) {
      console.error("IC login required — sign in to connect.integrity.com in Chrome, then re-run.");
      process.exit(2);
    }

    const results = [];
    for (const q of QUERIES) {
      try {
        results.push(await scrapeQuery(page, q));
      } catch (e) {
        results.push({ query: q, error: String(e.message || e) });
      }
    }

    console.log(JSON.stringify(results, null, 2));
  } finally {
    if (browser) await browser.close();
  }
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
