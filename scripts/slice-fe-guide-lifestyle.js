#!/usr/bin/env node
/**
 * Slice the 4×6 senior lifestyle contact sheet into 24 guide-card sources,
 * then stamp image + short card labels onto data/fe-guide-faq-index.json.
 *
 * Usage: node scripts/slice-fe-guide-lifestyle.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const MAP = require("./fe-guide-lifestyle-map");

const ROOT = path.join(__dirname, "..");
const SRC =
  process.env.FE_GUIDE_SHEET ||
  "/Users/mejorvidainsurance/.cursor/projects/Users-mejorvidainsurance-Desktop-mejor-vida-html-Mejor-Vida-HTML/assets/hispanic-senior-lifestyle-contact-sheet-670ca11a-eac7-4d96-bf50-d79c69ee3a67.png";
const FAQ = path.join(ROOT, "data/fe-guide-faq-index.json");
const IMG_DIR = path.join(ROOT, "img");

const COLS = [
  [6, 249],
  [262, 505],
  [518, 761],
  [774, 1017],
];
const ROWS = [
  [6, 158],
  [170, 323],
  [335, 487],
  [499, 651],
  [664, 816],
  [828, 980],
];
const INSET = 3;

async function sliceSheet() {
  if (!fs.existsSync(SRC)) {
    console.error("Missing contact sheet:", SRC);
    process.exit(1);
  }
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const img = sharp(SRC, { failOn: "none" });
  const meta = await img.metadata();
  if (MAP.length !== 24) {
    console.error("Expected 24 map entries, got", MAP.length);
    process.exit(1);
  }

  for (let i = 0; i < 24; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const [x0, x1] = COLS[col];
    const [y0, y1] = ROWS[row];
    const left = x0 + INSET;
    const top = y0 + INSET;
    const width = x1 - x0 + 1 - INSET * 2;
    const height = y1 - y0 + 1 - INSET * 2;
    const out = path.join(IMG_DIR, `${MAP[i].image}.jpg`);
    await sharp(SRC, { failOn: "none" })
      .extract({ left, top, width, height })
      .resize(800, 600, { fit: "cover", position: "centre" })
      .sharpen({ sigma: 0.7 })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(out);
    console.log(
      `${String(i + 1).padStart(2, "0")} ${MAP[i].image} ← r${row + 1}c${col + 1} ${width}x${height} from ${meta.width}x${meta.height}`
    );
  }
}

function patchFaqIndex() {
  const data = JSON.parse(fs.readFileSync(FAQ, "utf8"));
  const bySlug = Object.fromEntries(MAP.map((row) => [row.slug, row]));
  let n = 0;
  for (const cat of data.categories) {
    for (const g of cat.guides) {
      const row = bySlug[g.slug];
      if (!row) continue;
      g.image = row.image;
      g.cardLabel = row.cardLabel;
      g.cardLabelEn = row.cardLabelEn;
      n += 1;
    }
  }
  if (n !== 24) {
    console.error("FAQ index patched", n, "guides; expected 24");
    process.exit(1);
  }
  fs.writeFileSync(FAQ, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("Updated image + cardLabel on 24 guides in data/fe-guide-faq-index.json");
}

async function writeOptCopies() {
  const outDir = path.join(ROOT, "img", "opt");
  fs.mkdirSync(outDir, { recursive: true });
  for (const row of MAP) {
    const absIn = path.join(IMG_DIR, `${row.image}.jpg`);
    const pipeline = sharp(absIn, { failOn: "none" }).resize(800, 600, {
      fit: "inside",
      withoutEnlargement: true,
    });
    await pipeline.clone().webp({ quality: 86, effort: 4 }).toFile(path.join(outDir, `${row.image}.webp`));
    await pipeline.clone().jpeg({ quality: 86, mozjpeg: true }).toFile(path.join(outDir, `${row.image}.jpg`));
  }
  console.log("Wrote 24 WebP + JPEG sets to img/opt/");
}

sliceSheet()
  .then(writeOptCopies)
  .then(patchFaqIndex)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
