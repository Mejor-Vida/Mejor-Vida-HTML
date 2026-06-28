#!/usr/bin/env node
/**
 * Ping search engines that the sitemap was updated (Bing; Google deprecated ping in 2023).
 * For Google, use Search Console → URL inspection → Request indexing.
 * Usage: node scripts/ping-sitemaps.js
 */
const SITEMAP = "https://www.mejorvidainsurance.com/sitemap.xml";

async function pingBing() {
  const url = `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP)}`;
  const res = await fetch(url);
  const text = await res.text();
  console.log(`Bing ping: HTTP ${res.status}`, text.slice(0, 120));
}

async function main() {
  console.log("Sitemap:", SITEMAP);
  console.log("Google: use Search Console URL Inspection (ping deprecated).");
  await pingBing();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
