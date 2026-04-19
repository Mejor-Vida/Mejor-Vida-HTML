import fs from "fs";
import path from "path";
import { extractBundlerTemplate } from "./bundlerParser";
import type { HeadlineRow } from "./bundlerParser";

const HEADLINE_DECL = /const\s+HEADLINES\s*=\s*\[/;

/**
 * Replace `const HEADLINES = [ ... ];` in the inner page template with a
 * single-hook array. Uses `JSON.stringify([row])` so the result is valid JS.
 */
export function templateWithSingleHeadline(
  template: string,
  headline: HeadlineRow,
): string {
  const m = template.match(HEADLINE_DECL);
  if (!m || m.index === undefined) {
    throw new Error("HEADLINES block not found in template");
  }
  const startConst = m.index;
  const startBracket = template.indexOf("[", startConst);
  if (startBracket === -1) throw new Error("HEADLINES [ not found");

  let depth = 0;
  let i = startBracket;
  for (; i < template.length; i++) {
    const c = template[i];
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
  }
  let j = i;
  while (j < template.length && /\s/.test(template[j]!)) j++;
  if (template[j] !== ";") {
    throw new Error("Expected `;` after HEADLINES array");
  }
  const end = j + 1;
  const newBlock = `const HEADLINES = ${JSON.stringify([headline])};`;
  return template.slice(0, startConst) + newBlock + template.slice(end);
}

/**
 * JSON.stringify + escape `<` so `</script>` never appears inside `<script>…</script>`
 * when the browser parses HTML (otherwise the JSON is truncated → "Unterminated string").
 * Matches how Claude’s exporter emits `\u003c` for tag opens inside the template string.
 */
export function jsonStringifyForHtmlScriptEmbeddedString(value: string): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

/**
 * Re-embed the modified template into the full standalone HTML document.
 */
export function embedTemplateInBundlerHtml(fullHtml: string, newTemplate: string): string {
  const replaced = fullHtml.replace(
    /(<script\s+type="__bundler\/template">)([\s\S]*?)(<\/script>)/,
    (_match, open: string, _json: string, close: string) =>
      open + jsonStringifyForHtmlScriptEmbeddedString(newTemplate) + close,
  );
  if (replaced === fullHtml) {
    throw new Error("Could not find __bundler/template script to update");
  }
  return replaced;
}

export type SplitFileResult = {
  headline: HeadlineRow;
  baseName: string;
  absolutePath: string;
};

/**
 * Writes one standalone `.html` file per headline. Each file unpacks like the
 * original but the canvas shows only that hook (one artboard + full-size preview
 * matches that ad).
 */
export function writePerHookStandaloneFiles(
  fullHtml: string,
  outDir: string,
  headlines: HeadlineRow[],
  baseNames: string[],
): SplitFileResult[] {
  if (headlines.length !== baseNames.length) {
    throw new Error("headlines and baseNames length mismatch");
  }
  fs.mkdirSync(outDir, { recursive: true });
  const template0 = extractBundlerTemplate(fullHtml);
  const results: SplitFileResult[] = [];

  for (let idx = 0; idx < headlines.length; idx++) {
    const headline = headlines[idx];
    const baseName = baseNames[idx];
    if (!headline || !baseName) continue;

    const newTemplate = templateWithSingleHeadline(template0, headline);
    const newHtml = embedTemplateInBundlerHtml(fullHtml, newTemplate);
    const fileName = `${baseName}.html`;
    const absolutePath = path.join(outDir, fileName);
    fs.writeFileSync(absolutePath, newHtml, "utf8");
    results.push({
      headline,
      baseName,
      absolutePath,
    });
  }

  return results;
}
