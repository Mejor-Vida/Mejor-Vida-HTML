"use strict";

async function pdfBufferToText(buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data =
    buffer instanceof Uint8Array && !(Buffer.isBuffer && Buffer.isBuffer(buffer))
      ? buffer
      : Uint8Array.from(buffer);
  const loadingTask = pdfjs.getDocument({
    data,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const doc = await loadingTask.promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const rows = {};
    for (const item of content.items || []) {
      const str = String(item.str || "");
      if (!str.trim()) continue;
      const y = item.transform ? Math.round(item.transform[5]) : 0;
      if (!rows[y]) rows[y] = [];
      rows[y].push({ x: item.transform ? item.transform[4] : 0, str });
    }
    const ys = Object.keys(rows)
      .map(Number)
      .sort((a, b) => b - a);
    const lines = ys.map((y) =>
      rows[y]
        .sort((a, b) => a.x - b.x)
        .map((p) => p.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
    );
    pages.push(lines.join("\n"));
  }
  return pages.join("\n");
}

module.exports = { pdfBufferToText };
