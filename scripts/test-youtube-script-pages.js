#!/usr/bin/env node
"use strict";

const { listYoutubeScriptPages, findYoutubeScriptPage } = require("../lib/youtube-script-pages");
const { extractSpoken, forJulieRecording, seedFromFiles } = require("../lib/youtube-scripts");

const catalog = listYoutubeScriptPages();
if (catalog.groups.length !== 3) {
  throw new Error("expected 3 groups, got " + catalog.groups.length);
}
const ids = catalog.groups.map((g) => g.id).join(",");
if (ids !== "funeral,life,guides") {
  throw new Error("unexpected group order: " + ids);
}
const total = catalog.groups.reduce((n, g) => n + g.pages.length, 0);
if (total < 20) throw new Error("too few pages: " + total);
if (!findYoutubeScriptPage("como-pagar-un-funeral")) {
  throw new Error("missing como-pagar-un-funeral");
}
const spoken = extractSpoken("## Spoken script\n\nHola. Soy Julie.\n\n## Extra");
if (spoken !== "Hola. Soy Julie.") throw new Error("extractSpoken failed: " + spoken);
const seed = seedFromFiles("como-pagar-un-funeral");
if (!seed.script_es && !seed.breakdown) {
  throw new Error("expected seed files for como-pagar-un-funeral");
}
const julie = forJulieRecording(seed.script_es);
if (!julie.startsWith("Hola. Soy Julie de Mejor Vida Seguros.")) {
  throw new Error("forJulieRecording did not start as Julie: " + julie.slice(0, 80));
}
if (/Beatriz|HeyGen|Avatar III/.test(julie)) {
  throw new Error("spoken script still has production notes");
}
console.log("ok", { groups: ids, pages: total });
