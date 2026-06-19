#!/usr/bin/env node
/**
 * Build favicons from the logo icon only (sun + leaves + path — no MEJOR VIDA text).
 * Source: img/logo-spanish2.png — left graphic column, trimmed to content bounds.
 *
 *   node scripts/generate-favicon-sun.js
 */
"use strict";

const { execSync } = require("child_process");
const sharp = require("sharp");

const SRC = "img/logo-spanish2.png";
/** Left fraction of horizontal logo that contains only the graphic (no text). */
const ICON_WIDTH_RATIO = 0.42;
/** How much of each square the icon fills (0.96 = tight margin for circular crop). */
const FILL_RATIO = 0.96;

async function extractIconBuffer() {
  const meta = await sharp(SRC).metadata();
  const leftW = Math.max(1, Math.round(meta.width * ICON_WIDTH_RATIO));
  const column = await sharp(SRC)
    .extract({ left: 0, top: 0, width: leftW, height: meta.height })
    .png()
    .toBuffer();
  return sharp(column).trim({ threshold: 1 }).png().toBuffer();
}

async function iconSquare(iconBuf, size) {
  const inner = Math.max(1, Math.round(size * FILL_RATIO));
  const margin = Math.max(0, Math.round((size - inner) / 2));
  const resized = await sharp(iconBuf)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: resized, left: margin, top: margin }])
    .png()
    .toBuffer();
}

async function main() {
  const iconBuf = await extractIconBuffer();

  await sharp(await iconSquare(iconBuf, 512)).toFile("img/favicon-sun-source.png");

  for (const size of [16, 32, 48]) {
    await sharp(await iconSquare(iconBuf, size)).toFile(`favicon-${size}x${size}.png`);
  }
  await sharp(await iconSquare(iconBuf, 180)).toFile("apple-touch-icon.png");

  const adsDir = "img/google-ads";
  const fs = require("fs");
  fs.mkdirSync(adsDir, { recursive: true });
  for (const size of [512, 1200]) {
    await sharp(await iconSquare(iconBuf, size)).toFile(`${adsDir}/mvi-square-logo-${size}.png`);
  }

  execSync(
    `python3 - <<'PY'
from PIL import Image
sizes = [16, 32, 48]
imgs = [Image.open(f"favicon-{s}x{s}.png").convert("RGBA") for s in sizes]
imgs[0].save("favicon.ico", format="ICO", sizes=[(s, s) for s in sizes])
print("Updated favicon.ico, PNG sizes, and img/google-ads/mvi-square-logo-*.png")
PY`,
    { stdio: "inherit" }
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
