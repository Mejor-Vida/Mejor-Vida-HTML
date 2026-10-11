const { makeCity } = require("./az-factory");
const { eastLakeMortuary, ESTIMATOR_FOOT_ES, ESTIMATOR_FOOT_EN, SERVICE_AREA_LEAD_ES, SERVICE_AREA_LEAD_EN } = require("./az-homes");
const {
  GRAVE_AZ,
  PHOENIX_PLOT_OFFICES,
  plotPriceRangePhoenix,
  plotOfficeListHtml,
} = require("./az-plot-shared");

module.exports = makeCity({
  slug: "scottsdale",
  nameEs: "Scottsdale",
  nameEn: "Scottsdale",
  heroFile: "scottsdale-horse-fountain",
  heroClass: "sc-hero--scottsdale",
  heroW: 1600,
  heroH: 900,
  heroVer: "fountain-v1",
  heroCaptionEs: "Fuente de los caballos en Old Town Scottsdale",
  heroCaptionEn: "Bronze Horse Fountain in Old Town Scottsdale",
  countyEs: "condado Maricopa",
  countyEn: "Maricopa County",
  metroEs: ["Scottsdale", "Phoenix", "Paradise Valley", "Tempe", "Fountain Hills"],
  metroEn: ["Scottsdale", "Phoenix", "Paradise Valley", "Tempe", "Fountain Hills"],
  metroTitleEs: "Scottsdale y el noreste del valle",
  metroTitleEn: "Scottsdale and the Northeast Valley",
  nearbyGuides: [
    { slug: "phoenix", name: "Phoenix" },
    { slug: "tempe", name: "Tempe" },
    { slug: "mesa", name: "Mesa" },
  ],
  prepaidCemEs: "Greenwood Memory Lawn, Paradise Memorial Gardens",
  prepaidCemEn: "Greenwood Memory Lawn, Paradise Memorial Gardens",
  homes: [eastLakeMortuary()],
  tableFootEs:
    "East Lake Mortuary (Phoenix): GPL 7 mar. 2024 — ver filas en la tabla. Scottsdale no tiene en esta guía otra columna con lista propia de los cuatro paquetes." +
    ESTIMATOR_FOOT_ES,
  tableFootEn:
    "East Lake Mortuary (Phoenix): GPL 7 Mar 2024 — see rows in the table. Scottsdale has no other column on this guide with its own four-package list." +
    ESTIMATOR_FOOT_EN,
  analysisSameEs:
    "East Lake está en Phoenix; la columna sirve al noreste del valle porque publica los cuatro tipos de paquete. Cremación directa desde <strong>$975</strong>; memorial <strong>$1,350</strong>; paquete C-60 <strong>$2,995</strong>.",
  analysisSameEn:
    "East Lake is in Phoenix; the column serves the northeast Valley because it publishes all four package types. Direct cremation from <strong>$975</strong>; memorial <strong>$1,350</strong>; C-60 package <strong>$2,995</strong>.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Greenwood Memory Lawn está en <strong>623-846-1212</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. Greenwood Memory Lawn is at <strong>623-846-1212</strong>.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Greenwood Memory Lawn y otros cementerios del valle venden espacios (623-846-1212). Los anuncios de reventa están en Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Greenwood Memory Lawn and other Valley cemeteries sell spaces (623-846-1212). Resale ads are on Grave Solutions.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla incluye bóveda, lápida ni funeral. Anuncios en Greenwood citaron unos <strong>$3,995</strong> en la lista del cementerio y <strong>$2,400</strong> pedidos por espacio.",
  newListEn:
    "None of the chart prices include a vault, marker, or funeral. Greenwood ads cited about <strong>$3,995</strong> on the cemetery list and <strong>$2,400</strong> asking per space.",
  plotPriceRange: plotPriceRangePhoenix("Scottsdale", "Scottsdale"),
  plotNew: 4000,
  plotResale: 2400,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — muchos espacios citan unos $4,000)",
  plotNewLabelEn: "New, from the cemetery office (ask for the list — many spaces cite about $4,000)",
  plotPublished: [],
  plotOffices: PHOENIX_PLOT_OFFICES,
  officesEs: plotOfficeListHtml(PHOENIX_PLOT_OFFICES, "es"),
  officesEn: plotOfficeListHtml(PHOENIX_PLOT_OFFICES, "en"),
  unpublishedLeadEs: SERVICE_AREA_LEAD_ES,
  unpublishedLeadEn: SERVICE_AREA_LEAD_EN,
  resaleHref: GRAVE_AZ,
});
