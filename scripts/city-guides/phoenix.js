const { makeCity } = require("./az-factory");
const { eastLakeMortuary, ESTIMATOR_FOOT_ES, ESTIMATOR_FOOT_EN } = require("./az-homes");
const {
  GRAVE_AZ,
  PHOENIX_PLOT_OFFICES,
  plotPriceRangePhoenix,
  plotOfficeListHtml,
} = require("./az-plot-shared");

module.exports = makeCity({
  slug: "phoenix",
  nameEs: "Phoenix",
  nameEn: "Phoenix",
  heroFile: "phoenix-skyline",
  heroClass: "sc-hero--phoenix",
  heroW: 1600,
  heroH: 900,
  heroVer: "landmark-v1",
  heroCaptionEs: "Centro de Phoenix visto desde South Mountain",
  heroCaptionEn: "Downtown Phoenix from South Mountain",
  countyEs: "condado Maricopa",
  countyEn: "Maricopa County",
  metroEs: ["Phoenix", "Glendale", "Tempe", "Scottsdale", "Mesa", "Chandler", "Gilbert", "Peoria", "Surprise"],
  metroEn: ["Phoenix", "Glendale", "Tempe", "Scottsdale", "Mesa", "Chandler", "Gilbert", "Peoria", "Surprise"],
  metroTitleEs: "Phoenix y el valle del Sol",
  metroTitleEn: "Phoenix and the Valley",
  nearbyGuides: [
    { slug: "mesa", name: "Mesa" },
    { slug: "chandler", name: "Chandler" },
    { slug: "scottsdale", name: "Scottsdale" },
    { slug: "glendale", name: "Glendale" },
    { slug: "gilbert", name: "Gilbert" },
    { slug: "tempe", name: "Tempe" },
    { slug: "tucson", name: "Tucson" },
  ],
  prepaidCemEs: "Greenwood Memory Lawn, Resthaven / Carr-Tenney",
  prepaidCemEn: "Greenwood Memory Lawn, Resthaven / Carr-Tenney",
  homes: [eastLakeMortuary()],
  tableFootEs:
    "East Lake Mortuary: GPL 7 mar. 2024 — cremación directa $975 y entierro inmediato $1,000 con contenedor o ataúd del comprador; memorial con cremación $1,350; paquete C-60 con velatorio $2,995 (ataúd de tela incluido)." +
    ESTIMATOR_FOOT_ES,
  tableFootEn:
    "East Lake Mortuary: GPL 7 Mar 2024 — direct cremation $975 and immediate burial $1,000 with purchaser container or casket; cremation with memorial $1,350; C-60 visitation package $2,995 (cloth casket included)." +
    ESTIMATOR_FOOT_EN,
  analysisSameEs:
    "East Lake publica cremación directa desde <strong>$975</strong> (contenedor del comprador). Su memorial con cremación en la funeraria está en <strong>$1,350</strong> (sin restos presentes). El paquete C-60 con velatorio y ataúd de tela está en <strong>$2,995</strong>. El promedio de entierro completo de Arizona (<strong>$7,784</strong>) suele incluir ataúd; no es el paquete de una casa.",
  analysisSameEn:
    "East Lake publishes direct cremation from <strong>$975</strong> (purchaser container). Its cremation-with-memorial at the funeral home is <strong>$1,350</strong> (without remains present). The C-60 visitation package with a cloth casket is <strong>$2,995</strong>. Arizona’s full-burial average (<strong>$7,784</strong>) usually includes a casket; it is not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Greenwood Memory Lawn llame al <strong>623-846-1212</strong>. Resthaven / Carr-Tenney está en <strong>602-305-4400</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Greenwood Memory Lawn call <strong>623-846-1212</strong>. Resthaven / Carr-Tenney is at <strong>602-305-4400</strong>.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Greenwood Memory Lawn y Resthaven / Carr-Tenney venden espacios en el valle (623-846-1212 y 602-305-4400). Pida la lista por escrito. Los anuncios de reventa están en el tablero de Arizona de Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Greenwood Memory Lawn and Resthaven / Carr-Tenney sell spaces in the Valley (623-846-1212 and 602-305-4400). Ask for the list in writing. Resale ads are on the Arizona Grave Solutions board.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla de arriba incluye abrir/cerrar la tumba, bóveda, lápida ni funeral. Anuncios de reventa en Greenwood citaron unos <strong>$3,995</strong> en la lista del cementerio y <strong>$2,400</strong> pedidos por espacio. Resthaven publica paquetes más altos cuando incluyen bóveda y marcador.",
  newListEn:
    "None of the chart prices include opening/closing, a vault, a marker, or the funeral. Greenwood resale ads cited about <strong>$3,995</strong> on the cemetery list and <strong>$2,400</strong> asking per space. Resthaven ads run higher when vaults and markers are bundled in.",
  plotPriceRange: plotPriceRangePhoenix("Phoenix", "Phoenix"),
  plotNew: 4000,
  plotResale: 2400,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — muchos espacios citan unos $4,000)",
  plotNewLabelEn: "New, from the cemetery office (ask for the list — many spaces cite about $4,000)",
  plotPublished: [],
  plotOffices: PHOENIX_PLOT_OFFICES,
  officesEs: plotOfficeListHtml(PHOENIX_PLOT_OFFICES, "es"),
  officesEn: plotOfficeListHtml(PHOENIX_PLOT_OFFICES, "en"),
  resaleHref: GRAVE_AZ,
});
