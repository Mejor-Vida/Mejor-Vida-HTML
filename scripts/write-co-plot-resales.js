#!/usr/bin/env node
/**
 * Snapshot Grave Solutions Colorado ads into city plot-resale JSON.
 * Only listings whose cemetery is in that city. Checked 18 Sep 2026.
 * Skip sold/expired ads.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CHECKED = "2026-09-18";
const CHECKED_ES = "18 sep. 2026";
const CHECKED_EN = "18 Sep 2026";
const CO_BOARD = "https://www.gravesolutions.com/for-sale/cemetery-properties/colorado";
const SEARCH = (city) =>
  `https://www.gravesolutions.com/search?SiteState=CO&SiteCity=${encodeURIComponent(city)}`;

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
      url: CO_BOARD,
      labelEs: "Tablero en vivo · Colorado",
      labelEn: "Live board · Colorado",
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
  denver: fileFor(
    "denver",
    boards(SEARCH("Denver"), "Tablero en vivo · Denver", "Live board · Denver"),
    [
      {
        id: "gs-dc7038",
        status: "listed",
        cemetery: "Fairmount Cemetery",
        spaces: 1,
        asking: 7800,
        obo: false,
        transferFee: 0,
        citedListEach: 9200,
        url: "https://www.gravesolutions.com/for-sale/fairmount-cemetery-denver-co-burial-plot-dc7038-1",
        titleEs: "Grave Solutions · un espacio, Sección 4, el vendedor cita $9,200 de lista",
        titleEn: "Grave Solutions · one space, Section 4, seller cites a $9,200 list",
      },
      {
        id: "gs-02ad5d",
        status: "listed",
        cemetery: "Fairmount Cemetery",
        spaces: 2,
        asking: 7500,
        obo: false,
        transferFee: null,
        citedListEach: 5900,
        url: "https://www.gravesolutions.com/for-sale/fairmount-cemetery-denver-co-burial-plot-02ad5d",
        titleEs: "Grave Solutions · dos lotes juntos cerca del Nisei War Memorial",
        titleEn: "Grave Solutions · two lots side by side near the Nisei War Memorial",
      },
      {
        id: "gs-82f943",
        status: "listed",
        cemetery: "Crown Hill Cemetery",
        spaces: 2,
        asking: 10000,
        obo: false,
        transferFee: null,
        citedListEach: null,
        url: "https://www.gravesolutions.com/for-sale/burial-plot-82f943",
        titleEs: "Grave Solutions · dos espacios, Garden Spaces, Block 13W",
        titleEn: "Grave Solutions · two spaces, Garden Spaces, Block 13W",
      },
    ]
  ),
  aurora: fileFor(
    "aurora",
    boards(SEARCH("Aurora"), "Tablero en vivo · Aurora", "Live board · Aurora"),
    []
  ),
  "colorado-springs": fileFor(
    "colorado-springs",
    boards(
      SEARCH("Colorado Springs"),
      "Tablero en vivo · Colorado Springs",
      "Live board · Colorado Springs"
    ),
    []
  ),
  "fort-collins": fileFor(
    "fort-collins",
    boards(SEARCH("Fort Collins"), "Tablero en vivo · Fort Collins", "Live board · Fort Collins"),
    []
  ),
  pueblo: fileFor(
    "pueblo",
    boards(SEARCH("Pueblo"), "Tablero en vivo · Pueblo", "Live board · Pueblo"),
    [
      {
        id: "gs-c41c58",
        status: "listed",
        cemetery: "Imperial Memorial Gardens",
        spaces: 1,
        asking: 3200,
        obo: false,
        transferFee: 395,
        citedListEach: null,
        url: "https://www.gravesolutions.com/for-sale/imperial-memorial-gardens-pueblo-co-burial-plot-c41c58",
        titleEs: "Grave Solutions · Garden of Calvary, $3,200 c/u (tres espacios, se venden sueltos)",
        titleEn: "Grave Solutions · Garden of Calvary, $3,200 each (three spaces, sold individually)",
      },
    ]
  ),
  boulder: fileFor(
    "boulder",
    boards(SEARCH("Boulder"), "Tablero en vivo · Boulder", "Live board · Boulder"),
    []
  ),
  greeley: fileFor(
    "greeley",
    boards(SEARCH("Greeley"), "Tablero en vivo · Greeley", "Live board · Greeley"),
    []
  ),
  "grand-junction": fileFor(
    "grand-junction",
    boards(
      SEARCH("Grand Junction"),
      "Tablero en vivo · Grand Junction",
      "Live board · Grand Junction"
    ),
    []
  ),
};

for (const [slug, json] of Object.entries(cities)) {
  const dest = path.join(ROOT, "data", `${slug}-plot-resales.json`);
  fs.writeFileSync(dest, JSON.stringify(json, null, 2) + "\n");
  console.log("wrote", dest, `(${json.listings.length} listings)`);
}
