/**
 * Generate photorealistic **square (1:1)** PNGs for the Canva template "mom_emotional_01_clean".
 * **You import these into Canva** — this script does not add text or branding.
 *
 * Uses **fal.ai FLUX 1.1 [pro]** (`fal-ai/flux-pro/v1.1`) for stronger realism than FLUX [dev].
 * Saves under: {canva_backgrounds_dir}/mom_emotional_01_clean/ (or CANVA_TEMPLATE).
 *
 * Setup:
 *   1. FAL_KEY or Fal_key in repo .env.local or facebook-posting/.env
 *   2. config/paths.local.json with canva_backgrounds_dir
 *   3. cd facebook-posting && npm install
 *   4. npm run generate-mom-emotional-01
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

loadDotenv({ path: join(REPO_ROOT, ".env.local") });
loadDotenv({ path: join(FB_POSTING_ROOT, ".env") });

/** Stronger photorealism than fal-ai/flux/dev — commercial FLUX Pro tier on fal. */
const FAL_MODEL = "fal-ai/flux-pro/v1.1";

const DEFAULT_TEMPLATE_SLUG = "mom_emotional_01_clean";

/** Reinforces realism; keeps your outdoor / coffee / text-safe bottom idea. */
const REALISM_SUFFIX =
  "Ultra-photorealistic, shot on a full-frame camera, natural skin texture and pores, realistic fabric and foliage, " +
  "no plastic skin, no cartoon, no illustration, no oversharpened AI look. " +
  "Square composition: keep mother and daughter in upper and middle regions; " +
  "slightly darker, softer ground or path in the lower third for text overlay legibility in design.";

/**
 * User base scene + small per-variation tweaks (same story, different light / framing).
 * Ages per your brief: mother ~65, daughter ~40, Hispanic, outdoor, coffee, natural setting.
 */
const BASE_SCENE =
  "Hispanic elderly mother around 65 walking with her adult daughter around 40 outdoors in a natural setting, " +
  "both holding coffee cups, relaxed conversation, soft smiles, warm natural sunlight, trees and greenery in the background, " +
  "calm and reflective mood, photorealistic lifestyle photography, natural composition, soft depth of field, " +
  "slightly darker lower area for text overlay, high quality";

const VARIATIONS = [
  { id: "01_park_path_dappled", tweak: "Park walking path, dappled sunlight through leaves, candid mid-walk." },
  { id: "02_golden_hour", tweak: "Golden hour, warm rim light, long soft shadows on the path, peaceful." },
  { id: "03_morning_bright", tweak: "Bright morning light, fresh cool tones, clear sky peeking through trees." },
  { id: "04_medium_shot", tweak: "Medium shot, both women clearly visible, eye-level camera, intimate but natural." },
  { id: "05_wider_environment", tweak: "Slightly wider shot, more trees and path visible, subjects still the focus." },
  { id: "06_suburban_sidewalk", tweak: "Leafy suburban sidewalk, green lawns blurred in background, relaxed stroll." },
  { id: "07_soft_overcast", tweak: "Soft overcast daylight, even gentle lighting, no harsh shadows, serene mood." },
];

/**
 * FLUX Pro 1.1 input (see fal.ai schema — not the same fields as flux/dev).
 */
function buildFluxProInput(prompt) {
  return {
    prompt,
    image_size: { width: 2048, height: 2048 },
    num_images: 1,
    output_format: "png",
    safety_tolerance: "2",
    /** Keep your wording; set true if you want fal's prompt polish. */
    enhance_prompt: false,
  };
}

function getFalKey() {
  return (
    process.env.FAL_KEY ||
    process.env.Fal_key ||
    process.env.fal_key ||
    ""
  ).trim();
}

function resolveTemplateOutputDir(templateSlug) {
  const pathsFile = join(FB_POSTING_ROOT, "config", "paths.local.json");
  if (!existsSync(pathsFile)) {
    throw new Error(
      `Missing ${pathsFile}. Copy paths.local.json.example to paths.local.json and set canva_backgrounds_dir.`
    );
  }
  const raw = JSON.parse(readFileSync(pathsFile, "utf8"));
  const base = (raw.canva_backgrounds_dir || "").trim();
  if (!base) {
    throw new Error("paths.local.json must define canva_backgrounds_dir.");
  }
  return join(base, templateSlug);
}

/**
 * @param {object} [options]
 * @param {string} [options.templateSlug]
 * @param {boolean} [options.saveToDisk]
 * @returns {Promise<Array<{ imageUrl: string, prompt: string }>>}
 */
export async function generateMomEmotional01CleanImages(options = {}) {
  const templateSlug = (options.templateSlug || process.env.CANVA_TEMPLATE || DEFAULT_TEMPLATE_SLUG).trim();
  const saveToDisk = options.saveToDisk !== false;

  const key = getFalKey();
  if (!key) {
    throw new Error("Set FAL_KEY or Fal_key in .env.local (repo root) or facebook-posting/.env");
  }

  fal.config({ credentials: key });

  const outDir = resolveTemplateOutputDir(templateSlug);
  if (saveToDisk) {
    mkdirSync(outDir, { recursive: true });
  }

  /** @type {{ imageUrl: string, prompt: string }[]} */
  const results = [];

  for (const v of VARIATIONS) {
    const prompt = `${BASE_SCENE} ${v.tweak} ${REALISM_SUFFIX}`;

    console.log("\n---\n[%s] model=%s\n%s\n", v.id, FAL_MODEL, prompt);

    const result = await fal.subscribe(FAL_MODEL, {
      input: buildFluxProInput(prompt),
      logs: true,
    });

    const imageUrl = result?.data?.images?.[0]?.url;
    if (!imageUrl) {
      console.error("No image URL:", JSON.stringify(result?.data, null, 2));
      throw new Error(`fal.ai returned no image for ${v.id}`);
    }

    if (saveToDisk) {
      const localPath = join(outDir, `${v.id}_fluxpro11_1x1.png`);
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error(`Download failed ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(localPath, buf);
      console.log("Saved:", localPath);
    }

    results.push({ imageUrl, prompt });
  }

  return results;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (isMain) {
  generateMomEmotional01CleanImages()
    .then((rows) => {
      console.log("\n=== Done ===");
      console.log(JSON.stringify(rows, null, 2));
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
