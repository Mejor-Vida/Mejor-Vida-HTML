#!/usr/bin/env node
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function usage() {
  console.log(`
Usage:
  node scripts/generate-weekly-set.js --slug weekly-insurance-update-2026-03-08 --config scripts/weekly-set.example.json

Optional:
  --base-url http://localhost:3000

Required env:
  IMAGE_API_AUTH_TOKEN
`);
}

function getArg(name) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function readConfig(configPath) {
  const raw = fs.readFileSync(configPath, "utf8");
  const data = JSON.parse(raw);
  if (!data || typeof data !== "object") {
    throw new Error("Invalid config JSON.");
  }
  if (!data.heroPrompt || typeof data.heroPrompt !== "string") {
    throw new Error("Config missing heroPrompt.");
  }
  if (!Array.isArray(data.inlinePrompts) || data.inlinePrompts.length === 0) {
    throw new Error("Config missing inlinePrompts array.");
  }
  if (!data.socialPrompt || typeof data.socialPrompt !== "string") {
    throw new Error("Config missing socialPrompt.");
  }
  if (!data.adPrompt || typeof data.adPrompt !== "string") {
    throw new Error("Config missing adPrompt.");
  }
  return data;
}

function runOne({ baseUrl, prompt, type, filename }) {
  const args = [
    "scripts/generate-image.js",
    "--base-url",
    baseUrl,
    "--prompt",
    prompt,
    "--type",
    type,
    "--filename",
    filename,
  ];

  const result = spawnSync("node", args, {
    stdio: "inherit",
    cwd: process.cwd(),
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`Failed: ${type} -> ${filename}`);
  }
}

function main() {
  const slug = getArg("slug");
  const configFile = getArg("config");
  const baseUrl = getArg("base-url") || process.env.IMAGE_API_BASE_URL || "http://localhost:3000";

  if (!slug || !configFile) {
    usage();
    process.exit(1);
  }
  if (!process.env.IMAGE_API_AUTH_TOKEN) {
    console.error("Missing IMAGE_API_AUTH_TOKEN environment variable.");
    process.exit(1);
  }

  const configPath = path.resolve(process.cwd(), configFile);
  if (!fs.existsSync(configPath)) {
    console.error(`Config file not found: ${configPath}`);
    process.exit(1);
  }

  const cfg = readConfig(configPath);
  console.log(`Generating weekly image set for: ${slug}`);
  console.log(`API base URL: ${baseUrl}`);

  // 1) Hero
  runOne({
    baseUrl,
    prompt: cfg.heroPrompt,
    type: "blog-hero",
    filename: `${slug}-hero`,
  });

  // 2) Inline images
  cfg.inlinePrompts.forEach((p, idx) => {
    runOne({
      baseUrl,
      prompt: p,
      type: "blog-inline",
      filename: `${slug}-inline-${idx + 1}`,
    });
  });

  // 3) Social
  runOne({
    baseUrl,
    prompt: cfg.socialPrompt,
    type: "social-post",
    filename: `${slug}-social`,
  });

  // 4) Ad
  runOne({
    baseUrl,
    prompt: cfg.adPrompt,
    type: "ad-creative",
    filename: `${slug}-ad`,
  });

  console.log("\nWeekly set complete.");
  console.log("Saved files under: public/img/generated/");
}

try {
  main();
} catch (err) {
  console.error("Error:", err && err.message ? err.message : err);
  process.exit(1);
}
