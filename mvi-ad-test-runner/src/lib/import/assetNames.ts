import type { HeadlineRow } from "./bundlerParser";

/**
 * Stable filename slugs per headline id — matches user-requested examples where possible.
 * Extend when new creative packs appear.
 */
const ID_TO_SLUG: Record<number, string> = {
  1: "deuda_10000",
  2: "que_pasaria",
  3: "1_dolar",
  4: "sin_examen",
  5: "nebraska_funeral",
};

function fallbackSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);
}

export function hookAssetBaseName(row: HeadlineRow): string {
  const slug = ID_TO_SLUG[row.id] ?? fallbackSlug(row.text);
  return `hook${row.id}_${slug}`;
}
