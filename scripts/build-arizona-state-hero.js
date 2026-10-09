#!/usr/bin/env node
/**
 * Nebraska-style AZ hero: wide blue gradient + county map + seal (opaque JPG asset).
 * Usage: node scripts/build-arizona-map-svg.js && node scripts/build-arizona-state-hero.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "img/state-heroes/arizona-hero.png");

const W = 1400;
const H = 900;
const SEAL_PX = 200;

async function main() {
  const bgSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0a2f5c"/>
      <stop offset="38%" stop-color="#143d6b"/>
      <stop offset="72%" stop-color="#1a4d80"/>
      <stop offset="100%" stop-color="#1e5f96"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
</svg>`;

  const bgBuf = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  const mapBuf = await sharp(path.join(ROOT, "img/state-heroes/arizona-map-teal.svg"))
    .resize(780, 820, { fit: "inside" })
    .png()
    .toBuffer();
  const mapMeta = await sharp(mapBuf).metadata();

  const sealBuf = await sharp(path.join(ROOT, "img/state-heroes/arizona-state-seal.svg"))
    .resize(SEAL_PX, null, { fit: "inside" })
    .png()
    .toBuffer();
  const sealMeta = await sharp(sealBuf).metadata();

  const mapLeft = W - mapMeta.width - 24;
  const mapTop = Math.round((H - mapMeta.height) / 2);
  const sealLeft = Math.round(mapLeft + mapMeta.width * 0.38 - sealMeta.width / 2);
  const sealTop = Math.round(mapTop + mapMeta.height * 0.48 - sealMeta.height / 2);

  await sharp(bgBuf)
    .composite([
      { input: mapBuf, left: mapLeft, top: mapTop },
      { input: sealBuf, left: sealLeft, top: sealTop, blend: "over" },
    ])
    .png()
    .toFile(OUT);

  console.log("Wrote", OUT, `${W}x${H}`, { mapLeft, mapTop, sealLeft, sealTop });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
