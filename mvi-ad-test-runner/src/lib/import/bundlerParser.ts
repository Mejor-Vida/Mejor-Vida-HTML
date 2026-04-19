import { z } from "zod";

/**
 * Parsed headline row from Claude Design "standalone bundler" HTML.
 * Matches the inline `const HEADLINES = [ ... ]` shape in the template script.
 */
export const HeadlineRowSchema = z.object({
  id: z.number(),
  label: z.string(),
  text: z.string(),
  size: z.number(),
  hideSinExamen: z.boolean().optional(),
});

export type HeadlineRow = z.infer<typeof HeadlineRowSchema>;

const HEADLINE_BLOCK = /const\s+HEADLINES\s*=\s*\[/;

/**
 * Extract the JSON-like array literal for HEADLINES by bracket counting.
 * This avoids `eval` and survives minification as long as the `const HEADLINES = [` prefix exists.
 */
function extractHeadlinesArrayLiteral(template: string): string {
  const m = template.match(HEADLINE_BLOCK);
  if (!m || m.index === undefined) {
    throw new Error(
      "Could not find `const HEADLINES = [` in bundler template. Is this a Claude Design standalone export?",
    );
  }
  const startBracket = template.indexOf("[", m.index);
  if (startBracket === -1) throw new Error("HEADLINES array start `[` not found");

  let depth = 0;
  for (let i = startBracket; i < template.length; i++) {
    const c = template[i];
    if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) {
        return template.slice(startBracket, i + 1);
      }
    }
  }
  throw new Error("Unterminated HEADLINES array");
}

/**
 * Parse a JavaScript array literal (objects may use unquoted keys — not valid JSON).
 * Only used for trusted local standalone HTML from the design export pipeline.
 */
function parseJsArrayLiteral(arrayLiteral: string): unknown {
  const trimmed = arrayLiteral.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
    throw new Error("Expected array literal");
  }
  try {
    return new Function(`"use strict"; return (${trimmed})`)() as unknown;
  } catch (e) {
    throw new Error(
      `Failed to parse HEADLINES array as JavaScript: ${e instanceof Error ? e.message : String(e)}`,
    );
  }
}

/**
 * Read `script[type="__bundler/template"]` from the standalone HTML and return inner HTML template string.
 */
export function extractBundlerTemplate(html: string): string {
  const m = html.match(/<script\s+type="__bundler\/template">([\s\S]*?)<\/script>/);
  if (!m) {
    throw new Error('Missing <script type="__bundler/template"> in standalone HTML');
  }
  // Content is JSON-encoded string
  return JSON.parse(m[1]) as string;
}

export function parseHeadlinesFromTemplate(template: string): HeadlineRow[] {
  const lit = extractHeadlinesArrayLiteral(template);
  const raw = parseJsArrayLiteral(lit);
  if (!Array.isArray(raw)) throw new Error("HEADLINES is not an array");
  return raw.map((row, idx) => {
    const parsed = HeadlineRowSchema.safeParse(row);
    if (!parsed.success) {
      throw new Error(`HEADLINES[${idx}] invalid: ${parsed.error.message}`);
    }
    return parsed.data;
  });
}

export function parseHeadlinesFromStandaloneHtml(html: string): HeadlineRow[] {
  const template = extractBundlerTemplate(html);
  return parseHeadlinesFromTemplate(template);
}

/** Default bullet + CTA copy from `AdCard.jsx` in the bundle (same across hook variants unless extended). */
export const DEFAULT_BULLET_LINES = [
  "Sin examen médico",
  "Cobertura inmediata",
  "Desde $1 al día",
] as const;

export const DEFAULT_CTA_PRIMARY = "Cotización gratis\nrápido por WhatsApp";
export const DEFAULT_CTA_BUTTON = "Chat en WhatsApp";
