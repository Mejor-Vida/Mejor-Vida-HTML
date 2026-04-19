import sharp from "sharp";

export type ImageValidationResult = {
  width: number;
  height: number;
  isSquare: boolean;
  isRecommendedSize: boolean;
  warnings: string[];
};

/** Facebook feed square recommended 1080×1080; we allow small tolerance. */
const FACEBOOK_SQ = 1080;
const TOL = 8;

export async function validateFacebookSquarePng(
  filePath: string,
): Promise<ImageValidationResult> {
  const meta = await sharp(filePath).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  const warnings: string[] = [];

  if (!w || !h) warnings.push("Could not read image dimensions.");

  const isSquare = Math.abs(w - h) <= TOL;
  if (!isSquare) {
    warnings.push(`Image is not square (${w}×${h}). Facebook square ads should be 1:1.`);
  }

  const isRecommendedSize =
    Math.abs(w - FACEBOOK_SQ) <= TOL && Math.abs(h - FACEBOOK_SQ) <= TOL;
  if (!isRecommendedSize) {
    warnings.push(
      `Recommended 1080×1080 px for feed; got ${w}×${h}. Upscaling/downscaling may affect clarity.`,
    );
  }

  // Heuristic: very small canvas → text may be illegible
  if (w < 600 || h < 600) {
    warnings.push("Very small dimensions — text may be too small to read on mobile.");
  }

  return { width: w, height: h, isSquare, isRecommendedSize, warnings };
}
