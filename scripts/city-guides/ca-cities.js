/**
 * California city guides. Estimator column is California Funeralocity averages
 * (captured 26 Jul 2026). Named-home columns will be added when a home publishes
 * a first-party four-package GPL; until then the chart is estimator-only.
 */
const { makeCity } = require("./ca-factory");
const losAngeles = require("./los-angeles");
const sanDiego = require("./san-diego");
const sanJose = require("./san-jose");

const HERO = { heroVer: "landmark-v1" };

const CITY_META = [
  {
    slug: "los-angeles",
    nameEn: "Los Angeles",
    nameEs: "Los Ángeles",
    heroFile: "los-angeles-hollywood-sign",
    heroVer: "hollywood-v1",
    heroClass: "sc-hero--los-angeles",
    heroCaptionEs: "Letrero de Hollywood, Los Ángeles",
    heroCaptionEn: "Hollywood Sign, Los Angeles",
    countyEs: "condado de Los Ángeles",
    countyEn: "Los Angeles County",
    metroEs: ["Los Ángeles", "Long Beach", "Glendale", "Pasadena", "Torrance", "Pomona"],
    metroEn: ["Los Angeles", "Long Beach", "Glendale", "Pasadena", "Torrance", "Pomona"],
    metroTitleEs: "Área metropolitana de Los Ángeles",
    metroTitleEn: "Los Angeles metro area",
  },
  {
    slug: "san-diego",
    nameEn: "San Diego",
    nameEs: "San Diego",
    heroFile: "san-diego-coronado-bridge",
    heroClass: "sc-hero--san-diego",
    heroCaptionEs: "Puente Coronado y la bahía de San Diego",
    heroCaptionEn: "Coronado Bridge and San Diego Bay",
    countyEs: "condado de San Diego",
    countyEn: "San Diego County",
    metroEs: ["San Diego", "Chula Vista", "Oceanside", "Escondido", "Carlsbad", "El Cajon"],
    metroEn: ["San Diego", "Chula Vista", "Oceanside", "Escondido", "Carlsbad", "El Cajon"],
    metroTitleEs: "Área metropolitana de San Diego",
    metroTitleEn: "San Diego metro area",
  },
  {
    slug: "san-jose",
    nameEn: "San Jose",
    nameEs: "San José",
    heroFile: "san-jose-downtown",
    heroClass: "sc-hero--san-jose",
    heroCaptionEs: "Costa cerca de San José, California",
    heroCaptionEn: "Coast near San Jose, California",
    countyEs: "condado de Santa Clara",
    countyEn: "Santa Clara County",
    metroEs: ["San José", "Sunnyvale", "Santa Clara", "Mountain View", "Milpitas", "Campbell"],
    metroEn: ["San Jose", "Sunnyvale", "Santa Clara", "Mountain View", "Milpitas", "Campbell"],
    metroTitleEs: "San José y el condado de Santa Clara",
    metroTitleEn: "San Jose and Santa Clara County",
  },
  {
    slug: "san-francisco",
    nameEn: "San Francisco",
    nameEs: "San Francisco",
    heroFile: "san-francisco-golden-gate",
    heroClass: "sc-hero--san-francisco",
    heroCaptionEs: "Puente Golden Gate, San Francisco",
    heroCaptionEn: "Golden Gate Bridge, San Francisco",
    countyEs: "condado de San Francisco",
    countyEn: "San Francisco County",
    metroEs: ["San Francisco", "Daly City", "South San Francisco", "San Bruno"],
    metroEn: ["San Francisco", "Daly City", "South San Francisco", "San Bruno"],
    metroTitleEs: "San Francisco y la península inmediata",
    metroTitleEn: "San Francisco and the immediate peninsula",
  },
  {
    slug: "fresno",
    nameEn: "Fresno",
    nameEs: "Fresno",
    heroFile: "fresno-water-tower",
    heroClass: "sc-hero--fresno",
    heroCaptionEs: "Fresno, Valle Central de California",
    heroCaptionEn: "Fresno, California’s Central Valley",
    countyEs: "condado de Fresno",
    countyEn: "Fresno County",
    metroEs: ["Fresno", "Clovis", "Madera", "Selma", "Reedley"],
    metroEn: ["Fresno", "Clovis", "Madera", "Selma", "Reedley"],
    metroTitleEs: "Fresno y el condado de Fresno",
    metroTitleEn: "Fresno and Fresno County",
  },
  {
    slug: "sacramento",
    nameEn: "Sacramento",
    nameEs: "Sacramento",
    heroFile: "sacramento-state-capitol",
    heroClass: "sc-hero--sacramento",
    heroCaptionEs: "Capitolio del estado, Sacramento",
    heroCaptionEn: "California State Capitol, Sacramento",
    countyEs: "condado de Sacramento",
    countyEn: "Sacramento County",
    metroEs: ["Sacramento", "Elk Grove", "Roseville", "Folsom", "Citrus Heights", "Rancho Cordova"],
    metroEn: ["Sacramento", "Elk Grove", "Roseville", "Folsom", "Citrus Heights", "Rancho Cordova"],
    metroTitleEs: "Sacramento y el condado de Sacramento",
    metroTitleEn: "Sacramento and Sacramento County",
  },
];

function near(except) {
  return CITY_META.filter((c) => c.slug !== except).map((c) => ({
    slug: c.slug,
    name: c.nameEn,
  }));
}

const shared = {
  heroW: 1280,
  heroH: 720,
  analysisSameEs:
    "Un paquete con el mismo nombre puede incluir o no el ataúd, la urna o el velatorio. Lea la lista de esa funeraria. El lote del cementerio no va en ninguno.",
  analysisSameEn:
    "A package with the same name may or may not include the casket, urn, or visitation. Read that funeral home’s list. The cemetery plot is in none of them.",
  prepaidCemEs: "o en el cementerio que elija",
  prepaidCemEn: "or at the cemetery you choose",
  tableFootEs:
    "La columna del estimador son promedios de California de Funeralocity (26 jul. 2026). Esos promedios son de paquetes de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.",
  tableFootEn:
    "The estimator column is California Funeralocity averages (26 Jul 2026). Those averages are funeral-home packages. They do not include the plot, opening and closing, the vault, or the marker.",
  resaleHref: "https://www.gravesolutions.com/for-sale/cemetery-properties/california",
  unpublishedLeadEs:
    "Estas funerarias no publican en internet los cuatro paquetes con precios en esta guía. Llame y pida la lista general de precios vigente.",
  unpublishedLeadEn:
    "These funeral homes do not publish all four priced packages online in this guide. Call and ask for the current general price list.",
};

function plotCopy(cityNameEs, cityNameEn) {
  return {
    faqPlotEs: `No. El precio de la funeraria no compra el espacio en el cementerio. Esta guía no publica un precio de lote nuevo para ${cityNameEs}. Pida la lista en el cementerio que elija. Abrir y cerrar, la bóveda y la lápida son cargos aparte.`,
    faqPlotEn: `No. The funeral-home price does not buy the cemetery space. This guide does not publish a new-lot price for ${cityNameEn}. Ask the cemetery you choose for its list. Opening and closing, the vault, and the marker are separate charges.`,
    officesNoteEs: `Estas cifras serían del cementerio, no de la funeraria. No hay un precio de lote nuevo publicado para ${cityNameEs} en esta página.`,
    officesNoteEn: `These figures would come from the cemetery, not the funeral home. This page does not have a published new-lot price for ${cityNameEn}.`,
    newListEs: `No hay un precio de lote nuevo publicado para ${cityNameEs} en esta guía. Llame al cementerio que elija y pida la lista por escrito. Los anuncios de particulares están en el tablero de California de Grave Solutions.`,
    newListEn: `This guide does not have a published new-lot price for ${cityNameEn}. Call the cemetery you choose and ask for the list in writing. Private-party ads are on the California Grave Solutions board.`,
    officesEs: [`${cityNameEs}. Lote nuevo: pida la lista en el cementerio que elija.`],
    officesEn: [`${cityNameEn}. New lot: ask the cemetery you choose for the list.`],
    analysisPlotEs: `El lote no está en el promedio de la funeraria. En ${cityNameEs} no hay un precio de lote nuevo publicado en esta guía. Los anuncios de particulares están en el tablero de California de Grave Solutions.`,
    analysisPlotEn: `The plot is not in the funeral-home average. This guide does not have a published new-lot price for ${cityNameEn}. Private-party ads are on the California Grave Solutions board.`,
    plotNew: null,
    plotResale: null,
  };
}

module.exports = CITY_META.map((meta) => {
  if (meta.slug === "los-angeles") return losAngeles;
  if (meta.slug === "san-diego") return sanDiego;
  if (meta.slug === "san-jose") return sanJose;
  const plot = plotCopy(meta.nameEs, meta.nameEn);
  return makeCity({
    ...shared,
    ...HERO,
    ...meta,
    ...plot,
    nearbyGuides: near(meta.slug),
    homes: [],
  });
});
