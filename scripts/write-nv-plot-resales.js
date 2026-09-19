#!/usr/bin/env node
/**
 * Snapshot Grave Solutions Nevada ads into city plot-resale JSON.
 * Only listings whose cemetery is in that city. Checked 18 Sep 2026.
 * Skip sold/expired ads. Older 2022 Palm Eastern ads were not still active.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CHECKED = "2026-09-18";
const CHECKED_ES = "18 sep. 2026";
const CHECKED_EN = "18 Sep 2026";
const NV_BOARD = "https://www.gravesolutions.com/for-sale/cemetery-properties/nevada";
const SEARCH = (city) =>
  `https://www.gravesolutions.com/search?SiteState=NV&SiteCity=${encodeURIComponent(city)}`;

const NOTE_ES =
  "Anuncios de particulares. No son precios de Mejor Vida Seguros ni la lista oficial del cementerio. La oficina debe transferir la escritura. Revise si el anuncio sigue activo.";
const NOTE_EN =
  "Private-party ads. These are not Mejor Vida Insurance prices or the cemetery’s official list. The office must transfer the deed. Check that the listing is still active.";

function boards(citySearch, cityLabelEs, cityLabelEn) {
  return [
    {
      id: "grave-solutions-city",
      name: "Grave Solutions",
      url: citySearch,
      labelEs: cityLabelEs,
      labelEn: cityLabelEn,
    },
    {
      id: "grave-solutions",
      name: "Grave Solutions",
      url: NV_BOARD,
      labelEs: "Tablero en vivo · Nevada",
      labelEn: "Live board · Nevada",
    },
  ];
}

function fileFor(city, extraBoards, listings) {
  return {
    city,
    checked: CHECKED,
    checkedLabelEs: CHECKED_ES,
    checkedLabelEn: CHECKED_EN,
    noteEs: NOTE_ES,
    noteEn: NOTE_EN,
    boards: extraBoards,
    cemeterySignals: [],
    listings,
  };
}

const cities = {
  "las-vegas": fileFor(
    "las-vegas",
    boards(SEARCH("Las Vegas"), "Tablero en vivo · Las Vegas", "Live board · Las Vegas"),
    []
  ),
  henderson: fileFor(
    "henderson",
    boards(SEARCH("Henderson"), "Tablero en vivo · Henderson", "Live board · Henderson"),
    []
  ),
  "north-las-vegas": fileFor(
    "north-las-vegas",
    boards(
      SEARCH("North Las Vegas"),
      "Tablero en vivo · North Las Vegas",
      "Live board · North Las Vegas"
    ),
    []
  ),
  reno: fileFor(
    "reno",
    boards(SEARCH("Reno"), "Tablero en vivo · Reno", "Live board · Reno"),
    []
  ),
  sparks: fileFor(
    "sparks",
    boards(SEARCH("Sparks"), "Tablero en vivo · Sparks", "Live board · Sparks"),
    []
  ),
  "carson-city": fileFor(
    "carson-city",
    boards(SEARCH("Carson City"), "Tablero en vivo · Carson City", "Live board · Carson City"),
    []
  ),
};

for (const [slug, json] of Object.entries(cities)) {
  const dest = path.join(ROOT, "data", `${slug}-plot-resales.json`);
  fs.writeFileSync(dest, JSON.stringify(json, null, 2) + "\n");
  console.log("wrote", dest, `(${json.listings.length} listings)`);
}
