#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

function usage() {
  console.log(`
Usage:
  node scripts/generate-image.js --prompt "..." --type blog-hero --filename my-image

Optional:
  --base-url http://localhost:3000
  --width 1536 --height 864

Env required:
  IMAGE_API_AUTH_TOKEN
`);
}

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

async function main() {
  const prompt = getArg("prompt");
  const type = getArg("type");
  const filename = getArg("filename");
  const baseUrl = getArg("base-url") || process.env.IMAGE_API_BASE_URL || "http://localhost:3000";
  const width = getArg("width");
  const height = getArg("height");
  const auth = process.env.IMAGE_API_AUTH_TOKEN;

  if (!prompt || !type || !filename) {
    usage();
    process.exit(1);
  }
  if (!auth) {
    console.error("Missing IMAGE_API_AUTH_TOKEN in local environment.");
    process.exit(1);
  }

  const body = {
    prompt,
    type,
    filename,
  };
  if (width) body.width = Number(width);
  if (height) body.height = Number(height);

  const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/api/generate-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${auth}`,
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (!resp.ok || !data.success) {
    console.error("Generation failed:", data);
    process.exit(1);
  }

  const ext = data.mimeType && data.mimeType.includes("jpeg") ? "jpg" : "png";
  const safeFilename = data.filename.replace(/\.[a-z0-9]+$/i, "");
  const outputDir = path.join(process.cwd(), "public", "img", "generated");
  ensureDir(outputDir);
  const outputPath = path.join(outputDir, `${safeFilename}.${ext}`);

  const buffer = Buffer.from(data.base64, "base64");
  fs.writeFileSync(outputPath, buffer);

  console.log(`Saved: ${outputPath}`);
  console.log(`Type: ${data.meta?.type || type}`);
  console.log(`Model: ${data.meta?.model || "unknown"}`);
}

main().catch((err) => {
  console.error("Unhandled error:", err.message || err);
  process.exit(1);
});
