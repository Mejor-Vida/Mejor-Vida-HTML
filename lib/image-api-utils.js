const ALLOWED_TYPES = new Set([
  "blog-hero",
  "blog-inline",
  "social-post",
  "ad-creative",
]);

const TYPE_DEFAULTS = {
  "blog-hero": { width: 1536, height: 864 },
  "blog-inline": { width: 1280, height: 720 },
  "social-post": { width: 1080, height: 1080 },
  "ad-creative": { width: 1200, height: 628 },
};

const DEFAULT_MODEL = "black-forest-labs/FLUX.1-schnell";
const DEFAULT_NEGATIVE_PROMPT =
  "text, watermark, signature, logo, blurry, low quality, deformed faces, extra fingers";

function sanitizeFilename(input) {
  const base = String(input || "generated-image")
    .replace(/\.[a-zA-Z0-9]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "generated-image";
}

function clampDimension(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < 256) return 256;
  if (parsed > 2048) return 2048;
  return Math.round(parsed);
}

module.exports = {
  ALLOWED_TYPES,
  TYPE_DEFAULTS,
  DEFAULT_MODEL,
  DEFAULT_NEGATIVE_PROMPT,
  sanitizeFilename,
  clampDimension,
};
