/**
 * Generate multiple 16:9 photorealistic background images for a Canva Facebook ad
 * (text LEFT, image RIGHT — Hispanic mom / family, final expense insurance context).
 *
 * Uses fal.ai FLUX.1 [dev] via @fal-ai/client.
 * Saves PNGs into the active template folder from config/paths.local.json
 * (e.g. .../Canva background images/mom_family_02_clean).
 *
 * Setup:
 *   1. Add FAL_KEY (or Fal_key) to repo root .env.local or facebook-posting/.env
 *   2. cp config/paths.local.json.example config/paths.local.json  (set active_template)
 *   3. cd facebook-posting && npm install
 *   4. npm run generate-canva-bg
 */

import { fal } from "@fal-ai/client";
import { config as loadDotenv } from "dotenv";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);
const FB_POSTING_ROOT = join(__dirname, "..");
const REPO_ROOT = join(FB_POSTING_ROOT, "..");

// Load env (do not commit keys). Accept FAL_KEY or Fal_key — dotenv is case-sensitive for custom names.
loadDotenv({ path: join(REPO_ROOT, ".env.local") });
loadDotenv({ path: join(FB_POSTING_ROOT, ".env") });

/** fal.ai expects the key here; we support both common env names. */
function getFalKey() {
  return (
    process.env.FAL_KEY ||
    process.env.Fal_key ||
    process.env.fal_key ||
    ""
  ).trim();
}

const FAL_MODEL = "fal-ai/flux/dev";

/**
 * fal-ai/flux/dev input (matches Facebook feed + Canva template):
 * - Aspect: 16:9 via explicit 1920×1080 (high resolution)
 * - Format: png
 * - Style: photorealistic (prompt-driven; not cartoon)
 */
const FLUX_INPUT_BASE = {
  image_size: { width: 1920, height: 1080 },
  num_inference_steps: 32,
  guidance_scale: 3.5,
  num_images: 1,
  enable_safety_checker: true,
  output_format: "png",
};

/**
 * Five distinct prompts — each keeps subjects on the RIGHT and text-safe space on the LEFT.
 * (1) Master + (2–5) variations — not the same scene repeated.
 */
const PROMPT_VARIATIONS = [
  {
    id: "01_master_elderly_mother_daughter",
    prompt:
      "Hispanic elderly mother around 65 years old sitting with her adult daughter around 40 years old, " +
      "warm and natural interaction, smiling gently together, modern living room, soft natural daylight, " +
      "emotional but calm and reassuring mood, lifestyle photography, photorealistic, " +
      "subjects positioned on the RIGHT side of the frame, leaving clean empty space on the LEFT side for text, " +
      "uncluttered background, soft depth of field, high quality, professional advertising style",
  },
  {
    id: "02_hugging_connection",
    prompt:
      "Hispanic elderly mother around 65 hugging her adult daughter around 40, emotional family connection, " +
      "soft warm sunlight, cozy home setting, natural smiles, positioned on the RIGHT side of the frame, " +
      "clean empty space on the LEFT for text, photorealistic lifestyle photography, high quality",
  },
  {
    id: "03_calm_safe_couch",
    prompt:
      "Hispanic mother around 65 and adult daughter around 40 sitting together on a couch, relaxed and peaceful, " +
      "soft lighting, modern home interior, feeling of safety and comfort, subjects on the RIGHT side, " +
      "clean negative space on the LEFT for text, photorealistic, high quality",
  },
  {
    id: "04_bright_window_optimistic",
    prompt:
      "Hispanic elderly mother and daughter smiling together near a window, bright natural light, warm tones, " +
      "modern home, positive emotional tone, positioned on the RIGHT side, soft uncluttered background, " +
      "empty space on the LEFT for text, lifestyle photography, high quality",
  },
  {
    id: "05_multigenerational",
    prompt:
      "Hispanic elderly mother around 65 with adult daughter around 40 and young child, family moment, " +
      "warm emotional connection, modern living room, soft natural lighting, subjects grouped on the RIGHT side, " +
      "clean negative space on the LEFT for text, photorealistic, high quality",
  },
];

function readOutputDir() {
  const pathsFile = join(FB_POSTING_ROOT, "config", "paths.local.json");
  if (!existsSync(pathsFile)) {
    throw new Error(
      `Missing ${pathsFile}. Copy paths.local.json.example to paths.local.json and set canva_backgrounds_dir + active_template.`
    );
  }
  const raw = JSON.parse(readFileSync(pathsFile, "utf8"));
  const base = raw.canva_backgrounds_dir;
  const template = (raw.active_template || "").trim();
  if (!base || !template) {
    throw new Error("paths.local.json must define canva_backgrounds_dir and active_template.");
  }
  return join(base, template);
}

/**
 * Calls fal.ai once per variation; returns metadata + downloads files to disk.
 */
export async function generateCanvaBackgroundVariations() {
  const key = getFalKey();
  if (!key) {
    throw new Error(
      `Set FAL_KEY or Fal_key in .env.local (repo root) or facebook-posting/.env`
    );
  }

  fal.config({ credentials: key });

  const outDir = readOutputDir();
  mkdirSync(outDir, { recursive: true });

  /** @type {{ imageUrl: string, prompt: string, localPath: string, requestId?: string }[]} */
  const results = [];

  for (const v of PROMPT_VARIATIONS) {
    const prompt = v.prompt;
    console.log("\n---\nPROMPT [%s]:\n%s\n", v.id, prompt);

    const result = await fal.subscribe(FAL_MODEL, {
      input: {
        prompt,
        ...FLUX_INPUT_BASE,
      },
      logs: true,
    });

    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) {
      console.error("No image URL in response:", JSON.stringify(result?.data, null, 2));
      throw new Error(`fal.ai returned no image for ${v.id}`);
    }

    const localPath = join(outDir, `${v.id}_flux_16x9.png`);
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Download failed ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(localPath, buf);

    console.log("Saved:", localPath);

    results.push({
      imageUrl,
      prompt,
      localPath,
      requestId: result.requestId,
    });
  }

  return results;
}

// Example usage: run this file directly (npm run generate-canva-bg)
const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (isMain) {
  generateCanvaBackgroundVariations()
    .then((rows) => {
      console.log("\n=== Done ===");
      console.log(JSON.stringify(rows.map((r) => ({ imageUrl: r.imageUrl, prompt: r.prompt })), null, 2));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
