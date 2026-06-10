#!/usr/bin/env node
/**
 * Build favicon.ico from the sun icon only (no MEJOR VIDA text).
 * Source: img/logo-spanish2.png — left icon column, trimmed to content bounds.
 *
 *   node scripts/generate-favicon-sun.js
 */
"use strict";

const { execSync } = require("child_process");
const sharp = require("sharp");

const SRC = "img/logo-spanish2.png";
// Left column of horizontal logo (icon only, before text).
const ICON_COLUMN = { left: 0, top: 0, width: 620, height: 1024 };

async function loadIconBuffer() {
  const column = await sharp(SRC).extract(ICON_COLUMN).png().toBuffer();
  return sharp(column).trim({ threshold: 1 }).png().toBuffer();
}

async function main() {
  const iconBuf = await loadIconBuffer();
  const base = sharp(iconBuf).resize(512, 512, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  await base.clone().png().toFile("img/favicon-sun-source.png");

  for (const size of [16, 32, 48]) {
    await sharp(iconBuf)
      .resize(size, size, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(`favicon-${size}x${size}.png`);
  }
  await sharp(iconBuf)
    .resize(180, 180, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile("apple-touch-icon.png");

  execSync(
    `python3 - <<'PY'
from PIL import Image
sizes = [16, 32, 48]
imgs = [Image.open(f"favicon-{s}x{s}.png").convert("RGBA") for s in sizes]
imgs[0].save("favicon.ico", format="ICO", sizes=[(s, s) for s in sizes])
print("Updated favicon.ico and PNG sizes")
PY`,
    { stdio: "inherit" }
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
