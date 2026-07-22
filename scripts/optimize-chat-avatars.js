#!/usr/bin/env node
/**
 * Resize + recompress mvi-chat-avatar PNGs to ~2× display size.
 * Display shell is ~5.5rem × 8.25rem (~88×132 CSS px at 16px rem; ~94×140 with html 106.25%).
 * We keep 280×498 (same aspect as 576×1024) for retina clarity + transparency.
 *
 * Backs up originals once to img/mvi-chat-avatar/_candidates/originals/
 * Usage: node scripts/optimize-chat-avatars.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "img", "mvi-chat-avatar");
const BACKUP = path.join(DIR, "_candidates", "originals");
const MAX_W = 280;
const MAX_H = 498;
const FILES = ["idle.png", "blink.png", "happy.png", "thinking.png", "attention.png", "source_identity.png"];

async function optimizeOne(name) {
  const src = path.join(DIR, name);
  if (!fs.existsSync(src)) {
    console.warn("skip missing", name);
    return;
  }
  fs.mkdirSync(BACKUP, { recursive: true });
  const backupPath = path.join(BACKUP, name);
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(src, backupPath);
  }

  const input = fs.existsSync(backupPath) ? backupPath : src;
  const before = fs.statSync(src).size;
  const buf = await sharp(input)
    .resize({
      width: MAX_W,
      height: MAX_H,
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toBuffer();
  fs.writeFileSync(src, buf);
  const after = buf.length;
  console.log(
    `${name}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB (${Math.round((1 - after / before) * 100)}% smaller)`
  );
}

(async () => {
  for (const f of FILES) {
    await optimizeOne(f);
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
