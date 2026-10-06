/**
 * South Dakota city guides. Estimator column is South Dakota Funeralocity averages
 * (captured 26 Jul 2026). No local home publishes a first-party four-package list here,
 * so the chart is estimator-only.
 */
const { makeCity } = require("./sd-factory");

const HERO = {
  heroVer: "landmark-v1",
};

const CITIES = [
  {
    "slug": "sioux-falls",
    "name": "Sioux Falls"
  },
  {
    "slug": "rapid-city",
    "name": "Rapid City"
  }
];

function near(except) {
  return CITIES.filter((c) => c.slug !== except);
}

const shared = {
  analysisSameEs:
    "Un paquete con el mismo nombre puede incluir o no el ataúd, la urna o el velatorio. Lea la lista de esa funeraria. El lote del cementerio no va en ninguno.",
  analysisSameEn:
    "A package with the same name may or may not include the casket, urn, or visitation. Read that funeral home’s list. The cemetery plot is in none of them.",
  prepaidCemEs: "o en el cementerio que elija",
  prepaidCemEn: "or at the cemetery you choose",
  tableFootEs:
    "La columna del estimador son promedios de Dakota del Sur de Funeralocity (26 jul. 2026). Esos promedios son de paquetes de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.",
  tableFootEn:
    "The estimator column is South Dakota Funeralocity averages (26 Jul 2026). Those averages are funeral-home packages. They do not include the plot, opening and closing, the vault, or the marker.",
  resaleHref: "https://www.gravesolutions.com/for-sale/cemetery-properties/south-dakota",
};

module.exports = [
  makeCity({
    ...shared,
    ...HERO,
    slug: "sioux-falls",
    heroFile: "sioux-falls-falls-park",
    heroClass: "sc-hero--sioux-falls",
    heroW: 1200,
    heroH: 900,
    nameEn: "Sioux Falls",
    heroCaptionEs: "Cataratas del río Big Sioux, Sioux Falls",
    heroCaptionEn: "Falls of the Big Sioux River, Sioux Falls",
    countyEs: "condado de Minnehaha",
    countyEn: "Minnehaha County",
    metroEs: ["Sioux Falls","Brandon","Harrisburg","Tea"],
    metroEn: ["Sioux Falls","Brandon","Harrisburg","Tea"],
    metroTitleEs: "Sioux Falls y el condado de Minnehaha",
    metroTitleEn: "Sioux Falls and Minnehaha County",
    nearbyGuides: near("sioux-falls"),
    faqPlotEs: "No. El precio de la funeraria no compra el espacio. El 28 de septiembre de 2026, un anuncio de particular para un nicho de columbario de granito en Hills of Rest Cemetery, Sioux Falls, pedía $2,200. El vendedor dijo que la lista del cementerio era de unos $4,000. Un nicho no es una tumba para cuerpo completo, y no es la lista del cementerio.",
    faqPlotEn: "No. The funeral-home price does not buy the space. On September 28, 2026, a private ad for one granite columbarium niche at Hills of Rest Cemetery in Sioux Falls asked $2,200. The seller said the cemetery’s list price was about $4,000. A niche is not a full-body grave, and this is not the cemetery’s price list.",
    officesNoteEs: "La cifra de $2,200 es un anuncio de un nicho de cremación. No es un precio de lote nuevo para un entierro de cuerpo completo.",
    officesNoteEn: "The $2,200 figure is an ad for a cremation niche. It is not a new-lot price for a full-body burial.",
    newListEs: "El 28 de septiembre de 2026, Grave Solutions mostraba un nicho de granito en Hills of Rest Cemetery, Sioux Falls, a $2,200. El vendedor comparó ese precio con una lista del cementerio de unos $4,000. Pida la lista vigente en la oficina.",
    newListEn: "On September 28, 2026, Grave Solutions showed one granite niche at Hills of Rest Cemetery, Sioux Falls, at $2,200. The seller compared that with a cemetery list price of about $4,000. Ask the office for the current list.",
    officesEs: ["Hills of Rest Cemetery, Sioux Falls. Reventa vista el 28 de septiembre de 2026: un nicho a $2,200. Lote nuevo: pida la lista."],
    officesEn: ["Hills of Rest Cemetery, Sioux Falls. Resale seen September 28, 2026: one niche at $2,200. New lot: ask for the list."],
    analysisPlotEs: "Un anuncio del 28 de septiembre de 2026 pedía <strong>$2,200</strong> por un nicho de columbario en Hills of Rest. Eso no está en el promedio de la funeraria y no es una tumba para cuerpo completo.",
    analysisPlotEn: "An ad on September 28, 2026 asked <strong>$2,200</strong> for a columbarium niche at Hills of Rest. That is not in the funeral-home average, and it is not a full-body grave.",
    plotNew: null,
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "rapid-city",
    heroFile: "rapid-city-dinosaur-park",
    heroClass: "sc-hero--rapid-city",
    heroW: 1181,
    heroH: 900,
    nameEn: "Rapid City",
    heroCaptionEs: "Dinosaur Park, Rapid City",
    heroCaptionEn: "Dinosaur Park, Rapid City",
    countyEs: "condado de Pennington",
    countyEn: "Pennington County",
    metroEs: ["Rapid City","Box Elder","Summerset","Black Hawk"],
    metroEn: ["Rapid City","Box Elder","Summerset","Black Hawk"],
    metroTitleEs: "Rapid City y el condado de Pennington",
    metroTitleEn: "Rapid City and Pennington County",
    nearbyGuides: near("rapid-city"),
    faqPlotEs: "No. El precio de la funeraria no compra el espacio en el cementerio. Esta guía no publica un precio de lote nuevo para Rapid City. Pida la lista en el cementerio que elija. Abrir y cerrar, la bóveda y la lápida son cargos aparte.",
    faqPlotEn: "No. The funeral-home price does not buy the cemetery space. This guide does not publish a new-lot price for Rapid City. Ask the cemetery you choose for its list. Opening and closing, the vault, and the marker are separate charges.",
    officesNoteEs: "Estas cifras serían del cementerio, no de la funeraria. No hay un precio de lote nuevo publicado para Rapid City en esta página.",
    officesNoteEn: "These figures would come from the cemetery, not the funeral home. This page does not have a published new-lot price for Rapid City.",
    newListEs: "No hay un precio de lote nuevo publicado para Rapid City en esta guía. Llame al cementerio que elija y pida la lista por escrito. Los anuncios de particulares están en el tablero de Dakota del Sur de Grave Solutions.",
    newListEn: "This guide does not have a published new-lot price for Rapid City. Call the cemetery you choose and ask for the list in writing. Private-party ads are on the South Dakota Grave Solutions board.",
    officesEs: ["Rapid City. Lote nuevo: pida la lista en el cementerio que elija."],
    officesEn: ["Rapid City. New lot: ask the cemetery you choose for the list."],
    analysisPlotEs: "El lote no está en el promedio de la funeraria. En Rapid City no hay un precio de lote nuevo publicado en esta guía. Los anuncios de particulares están en el tablero de Dakota del Sur de Grave Solutions.",
    analysisPlotEn: "The plot is not in the funeral-home average. This guide does not have a published new-lot price for Rapid City. Private-party ads are on the South Dakota Grave Solutions board.",
    plotNew: null,
    plotResale: null,
  })
];
