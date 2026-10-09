#!/usr/bin/env node
/**
 * Composite Texas map + seal for state coverage hero, then trim transparent padding.
 * Usage: node scripts/build-texas-state-hero.js
 */
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "img/state-heroes/texas-hero.png");

const MAP_W = 618;
const SEAL_PX = 112;
/** Central Texas belt — keep seal away from narrow south tip and panhandle */
const SEAL_X = 0.56;
const SEAL_Y = 0.5;

async function main() {
  const mapBuf = await sharp(path.join(ROOT, "img/state-heroes/texas-map-teal.svg"))
    .resize(MAP_W, null, { fit: "inside" })
    .png()
    .toBuffer();
  const sealBuf = await sharp(path.join(ROOT, "img/state-heroes/texas-state-seal.svg"))
    .resize(SEAL_PX, null, { fit: "inside" })
    .png()
    .toBuffer();

  const mapMeta = await sharp(mapBuf).metadata();
  const sealMeta = await sharp(sealBuf).metadata();
  const pad = 4;
  const canvasW = mapMeta.width + pad * 2;
  const canvasH = mapMeta.height + pad * 2;
  const mapLeft = pad;
  const mapTop = pad;
  const sealLeft = Math.round(mapLeft + mapMeta.width * SEAL_X - sealMeta.width / 2);
  const sealTop = Math.round(mapTop + mapMeta.height * SEAL_Y - sealMeta.height / 2);

  const raw = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: mapBuf, left: mapLeft, top: mapTop },
      { input: sealBuf, left: sealLeft, top: sealTop },
    ])
    .png()
    .toBuffer();

  const trimmed = await sharp(raw).trim().toBuffer();
  const meta = await sharp(trimmed).metadata();
  await sharp(trimmed).png().toFile(OUT);
  console.log("Wrote", OUT, `${meta.width}x${meta.height}`, { sealLeft, sealTop });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
