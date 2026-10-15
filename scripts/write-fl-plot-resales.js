#!/usr/bin/env node
/**
 * Snapshot Grave Solutions Florida ads into city plot-resale JSON.
 * Checked 15 Oct 2026 from the Florida board (private-party asking prices).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CHECKED = "2026-10-15";
const CHECKED_ES = "15 oct. 2026";
const CHECKED_EN = "15 Oct 2026";
const FL_BOARD = "https://www.gravesolutions.com/for-sale/cemetery-properties/florida";
const SEARCH = (city) =>
  `https://www.gravesolutions.com/search?SiteState=FL&SiteCity=${encodeURIComponent(city)}`;

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
      url: FL_BOARD,
      labelEs: "Tablero en vivo · Florida",
      labelEn: "Live board · Florida",
    },
  ];
}

function fileFor(city, extraBoards, listings, signals) {
  return {
    city,
    checked: CHECKED,
    checkedLabelEs: CHECKED_ES,
    checkedLabelEn: CHECKED_EN,
    noteEs: NOTE_ES,
    noteEn: NOTE_EN,
    boards: extraBoards,
    cemeterySignals: signals || [],
    listings,
  };
}

const cities = {
  jacksonville: fileFor(
    "jacksonville",
    boards(SEARCH("Jacksonville"), "Tablero en vivo · Jacksonville", "Live board · Jacksonville"),
    [
      {
        id: "gs-arlington-4000",
        status: "listed",
        cemetery: "Arlington Memorial Park",
        spaces: 1,
        asking: 4000,
        obo: false,
        transferFee: null,
        citedListEach: null,
        url: FL_BOARD,
        titleEs: "Grave Solutions · Veterans Garden (doble profundidad)",
        titleEn: "Grave Solutions · Veterans Garden (double depth)",
      },
      {
        id: "gs-chapel-hill-jax-2000",
        status: "listed",
        cemetery: "Chapel Hill Memory Gardens",
        spaces: 1,
        asking: 2000,
        obo: false,
        transferFee: null,
        citedListEach: 5995,
        url: FL_BOARD,
        titleEs: "Grave Solutions · Sermon on the Mount",
        titleEn: "Grave Solutions · Sermon on the Mount",
      },
    ],
    [
      {
        cemetery: "Chapel Hill Memory Gardens",
        citedListLow: 5995,
        citedListHigh: 5995,
        typical: 5995,
        phone: "",
        noteEs: "Anuncios citaron ~$5,995 en lista; reventa ~$2,000 por espacio.",
        noteEn: "Ads cited about $5,995 on the list; resale about $2,000 per space.",
      },
    ]
  ),
  miami: fileFor(
    "miami",
    boards(SEARCH("Miami"), "Tablero en vivo · Miami", "Live board · Miami"),
    [
      {
        id: "gs-woodland-8500",
        status: "listed",
        cemetery: "Caballero Rivero Woodland Park South",
        spaces: 2,
        asking: 8500,
        obo: false,
        transferFee: null,
        citedListEach: null,
        url: FL_BOARD,
        titleEs: "Grave Solutions · cripta doble profundidad",
        titleEn: "Grave Solutions · double-depth crypt",
      },
      {
        id: "gs-woodlawn-west-7550",
        status: "listed",
        cemetery: "Caballero Rivero Woodlawn West",
        spaces: 1,
        asking: 7550,
        obo: false,
        transferFee: 250,
        citedListEach: null,
        url: FL_BOARD,
        titleEs: "Grave Solutions · derechos + liner + marcador",
        titleEn: "Grave Solutions · rights + liner + marker",
      },
    ],
    []
  ),
  tampa: fileFor(
    "tampa",
    boards(SEARCH("Tampa"), "Tablero en vivo · Tampa", "Live board · Tampa"),
    [
      {
        id: "gs-hillsborough-3700",
        status: "listed",
        cemetery: "Hillsborough Memorial Gardens",
        spaces: 2,
        asking: 3700,
        obo: false,
        transferFee: null,
        citedListEach: 8000,
        url: FL_BOARD,
        titleEs: "Grave Solutions · Christus (Brandon)",
        titleEn: "Grave Solutions · Christus (Brandon)",
      },
    ],
    [
      {
        cemetery: "Hillsborough Memorial Gardens",
        citedListLow: 8000,
        citedListHigh: 8000,
        typical: 8000,
        phone: "",
        noteEs: "Anuncio citó ~$8,000 por espacio en lista; dos espacios a $3,700 de reventa.",
        noteEn: "Ad cited about $8,000 per space on the list; two spaces at $3,700 resale.",
      },
    ]
  ),
  orlando: fileFor(
    "orlando",
    boards(SEARCH("Orlando"), "Tablero en vivo · Orlando", "Live board · Orlando"),
    [
      {
        id: "gs-chapel-hill-orlando-12000",
        status: "listed",
        cemetery: "Chapel Hill Cemetery",
        spaces: 2,
        asking: 12000,
        obo: false,
        transferFee: null,
        citedListEach: null,
        url: FL_BOARD,
        titleEs: "Grave Solutions · Devotion (con bóvedas)",
        titleEn: "Grave Solutions · Devotion (with vaults)",
      },
      {
        id: "gs-highland-5500",
        status: "listed",
        cemetery: "Highland Memory Gardens",
        spaces: 2,
        asking: 5500,
        obo: false,
        transferFee: null,
        citedListEach: null,
        url: FL_BOARD,
        titleEs: "Grave Solutions · Garden of Peace",
        titleEn: "Grave Solutions · Garden of Peace",
      },
    ],
    []
  ),
  "st-petersburg": fileFor(
    "st-petersburg",
    boards(SEARCH("St. Petersburg"), "Tablero en vivo · St. Petersburg", "Live board · St. Petersburg"),
    [],
    []
  ),
  "fort-lauderdale": fileFor(
    "fort-lauderdale",
    boards(SEARCH("Fort Lauderdale"), "Tablero en vivo · Fort Lauderdale", "Live board · Fort Lauderdale"),
    [
      {
        id: "gs-evergreen-16000",
        status: "listed",
        cemetery: "Evergreen Cemetery",
        spaces: 2,
        asking: 16000,
        obo: false,
        transferFee: null,
        citedListEach: 8745,
        url: FL_BOARD,
        titleEs: "Grave Solutions · Garden 12 (interiores)",
        titleEn: "Grave Solutions · Garden 12 (interior)",
      },
      {
        id: "gs-lauderdale-4000",
        status: "listed",
        cemetery: "Lauderdale Memorial Park",
        spaces: 1,
        asking: 4000,
        obo: false,
        transferFee: null,
        citedListEach: null,
        url: FL_BOARD,
        titleEs: "Grave Solutions · Garden 41",
        titleEn: "Grave Solutions · Garden 41",
      },
    ],
    [
      {
        cemetery: "Evergreen Cemetery",
        citedListLow: 8745,
        citedListHigh: 8745,
        typical: 8745,
        phone: "",
        noteEs: "Anuncio citó ~$8,745 por espacio nuevo en el borde; interiores de reventa más altos.",
        noteEn: "Ad cited about $8,745 per new edge space; interior resales run higher.",
      },
    ]
  ),
  tallahassee: fileFor(
    "tallahassee",
    boards(SEARCH("Tallahassee"), "Tablero en vivo · Tallahassee", "Live board · Tallahassee"),
    [],
    []
  ),
  "west-palm-beach": fileFor(
    "west-palm-beach",
    boards(SEARCH("West Palm Beach"), "Tablero en vivo · West Palm Beach", "Live board · West Palm Beach"),
    [],
    []
  ),
};

for (const [slug, json] of Object.entries(cities)) {
  const dest = path.join(ROOT, "data", `${slug}-plot-resales.json`);
  fs.writeFileSync(dest, JSON.stringify(json, null, 2) + "\n");
  console.log("wrote", dest, `(${json.listings.length} listings)`);
}
