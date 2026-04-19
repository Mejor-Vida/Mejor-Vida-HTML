import fs from "fs";
import path from "path";
import { chromium, type Browser } from "playwright";

/**
 * Patch `const DISPLAY = 460` → `1080` so each `ScaledAd` renders native 1080×1080
 * (SCALE = 1). This keeps text sharp for Facebook square exports.
 */
export function patchDisplayForNative1080(html: string): string {
  return html.replace(
    /const\s+DISPLAY\s*=\s*\d+\s*;/,
    "const DISPLAY = 1080;",
  );
}

export type ExportAdPngOptions = {
  sourceHtmlPath: string;
  outDir: string;
  baseNames: string[]; // length 5, filenames without extension
};

/**
 * Screenshots each of the five `DCArtboard` cards in the first section (hook grid).
 * Uses label text `Ad {n} ·` to find the white inner card (following sibling of label).
 */
export async function exportHookGridPngs(
  opts: ExportAdPngOptions,
): Promise<string[]> {
  const { sourceHtmlPath, outDir, baseNames } = opts;
  if (baseNames.length !== 5) {
    throw new Error("Expected exactly 5 baseNames for hook grid export");
  }

  let html = fs.readFileSync(sourceHtmlPath, "utf8");
  html = patchDisplayForNative1080(html);

  const tmp = path.join(outDir, ".render", `export-${Date.now()}.html`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, html, "utf8");

  const fileUrl = "file://" + tmp;

  let browser: Browser | null = null;
  const written: string[] = [];

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 7000, height: 3000 },
      deviceScaleFactor: 2,
    });
    page.setDefaultTimeout(120_000);

    await page.goto(fileUrl, { waitUntil: "load" });

    // Bundler unpack + React+Babel — wait for first artboard label
    await page.getByText(/Ad 1 ·/).first().waitFor({ state: "visible", timeout: 120_000 });

    // Allow fonts / layout
    await new Promise((r) => setTimeout(r, 1500));

    for (let i = 1; i <= 5; i++) {
      const label = page.getByText(new RegExp(`Ad ${i} ·`)).first();
      await label.waitFor({ state: "visible" });
      const card = label.locator("xpath=following-sibling::div[1]");
      const outPath = path.join(outDir, `${baseNames[i - 1]}.png`);
      await card.screenshot({ path: outPath, type: "png" });
      written.push(outPath);
    }
  } finally {
    if (browser) await browser.close();
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }

  return written;
}
