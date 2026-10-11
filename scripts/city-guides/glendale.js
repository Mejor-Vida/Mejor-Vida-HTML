const { makeCity } = require("./az-factory");
const {
  simplyCremation,
  ESTIMATOR_FOOT_ES,
  ESTIMATOR_FOOT_EN,
  SERVICE_AREA_LEAD_ES,
  SERVICE_AREA_LEAD_EN,
} = require("./az-homes");
const {
  GRAVE_AZ,
  GLENDALE_PLOT_OFFICES,
  plotPriceRangeGlendale,
  plotOfficeListHtml,
} = require("./az-plot-shared");

module.exports = makeCity({
  slug: "glendale",
  nameEs: "Glendale",
  nameEn: "Glendale",
  heroFile: "glendale-capitol",
  heroClass: "sc-hero--glendale",
  heroW: 1600,
  heroH: 900,
  heroVer: "capitol-v1",
  heroCaptionEs: "Capitolio de Arizona, área metropolitana de Phoenix",
  heroCaptionEn: "Arizona State Capitol, Phoenix metro area",
  countyEs: "condado Maricopa",
  countyEn: "Maricopa County",
  metroEs: ["Glendale", "Peoria", "Phoenix", "Surprise", "Avondale", "Goodyear"],
  metroEn: ["Glendale", "Peoria", "Phoenix", "Surprise", "Avondale", "Goodyear"],
  metroTitleEs: "Glendale y el oeste del valle",
  metroTitleEn: "Glendale and the West Valley",
  nearbyGuides: [
    { slug: "phoenix", name: "Phoenix" },
    { slug: "mesa", name: "Mesa" },
    { slug: "scottsdale", name: "Scottsdale" },
  ],
  prepaidCemEs: "Resthaven Park West, West Resthaven Cemetery",
  prepaidCemEn: "Resthaven Park West, West Resthaven Cemetery",
  homes: [simplyCremation()],
  tableFootEs:
    "Simply Cremation and Funeral Arrangements (Surprise): GPL 6 oct. 2026 — cremación directa $2,645 y entierro inmediato $2,330 con contenedor del comprador. Memorial y funeral tradicional: pida la lista." +
    ESTIMATOR_FOOT_ES,
  tableFootEn:
    "Simply Cremation and Funeral Arrangements (Surprise): GPL 6 Oct 2026 — direct cremation $2,645 and immediate burial $2,330 with purchaser container. Memorial and traditional funeral: ask for the list." +
    ESTIMATOR_FOOT_EN,
  analysisSameEs:
    "Simply publica cremación directa <strong>$2,645</strong> y entierro inmediato <strong>$2,330</strong> (contenedor del comprador) desde Surprise; no publica totales de memorial ni funeral tradicional en la GPL. El promedio de Arizona (<strong>$5,372</strong> / <strong>$7,784</strong>) no es el precio de esa casa.",
  analysisSameEn:
    "Simply publishes direct cremation <strong>$2,645</strong> and immediate burial <strong>$2,330</strong> (purchaser container) from Surprise; it does not publish memorial or traditional funeral totals on the GPL. Arizona averages (<strong>$5,372</strong> / <strong>$7,784</strong>) are not that home’s price.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Resthaven Park West / West Resthaven comparten la línea del oeste del valle: <strong>623-939-4900</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. Resthaven Park West / West Resthaven share the west-valley line: <strong>623-939-4900</strong>.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Resthaven Park West y West Resthaven en Glendale (623-939-4900) venden espacios. Los anuncios de reventa están en Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Resthaven Park West and West Resthaven in Glendale (623-939-4900) sell spaces. Resale ads are on Grave Solutions.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla incluye bóveda, lápida ni funeral. Anuncios en Resthaven Park West citaron <strong>$5,500</strong> en la lista del cementerio y <strong>$4,000</strong> pedidos.",
  newListEn:
    "None of the chart prices include a vault, marker, or funeral. Resthaven Park West ads cited <strong>$5,500</strong> on the cemetery list and <strong>$4,000</strong> asking.",
  plotPriceRange: plotPriceRangeGlendale("Glendale", "Glendale"),
  plotNew: 4000,
  plotResale: 3500,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — reventas en Glendale suelen pedir $3,500–$5,500)",
  plotNewLabelEn: "New, from the cemetery office (ask for the list — Glendale resales often ask $3,500–$5,500)",
  plotPublished: [],
  plotOffices: GLENDALE_PLOT_OFFICES,
  officesEs: plotOfficeListHtml(GLENDALE_PLOT_OFFICES, "es"),
  officesEn: plotOfficeListHtml(GLENDALE_PLOT_OFFICES, "en"),
  unpublishedLeadEs: SERVICE_AREA_LEAD_ES,
  unpublishedLeadEn: SERVICE_AREA_LEAD_EN,
  resaleHref: GRAVE_AZ,
});
