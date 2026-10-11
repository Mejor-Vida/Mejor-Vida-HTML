const { makeCity } = require("./az-factory");
const {
  buelerChandler,
  wymanChapel,
  falconerGilbert,
  ESTIMATOR_FOOT_ES,
  ESTIMATOR_FOOT_EN,
  SERVICE_AREA_LEAD_ES,
  SERVICE_AREA_LEAD_EN,
} = require("./az-homes");
const { GRAVE_AZ, plotPriceRangeMesa, plotOfficeListHtml } = require("./az-plot-shared");

const GILBERT_PLOT_OFFICES = [
  {
    name: "Gilbert Memorial Park",
    addr: "2100 E Queen Creek Rd, Gilbert",
    phone: "480-935-5858",
    href: "https://www.gilbertmemorialpark.com/",
    noteEs: "Primer cementerio municipal de Gilbert. Pida la lista de propiedad y apertura/cierre por escrito.",
    noteEn: "Gilbert’s municipal cemetery. Ask for the property and opening/closing list in writing.",
  },
  {
    name: "Queen of Heaven Catholic Cemetery",
    addr: "1562 E Baseline Rd, Mesa",
    phone: "480-832-3030",
    href: "https://www.queenofheavencemetery.com/",
    noteEs: "Cementerio católico en Mesa, cerca de Gilbert. Paquetes prepagados se cotizan en la oficina.",
    noteEn: "Catholic cemetery in Mesa, near Gilbert. Pre-need packages are quoted at the office.",
  },
];

module.exports = makeCity({
  slug: "gilbert",
  nameEs: "Gilbert",
  nameEn: "Gilbert",
  heroFile: "gilbert-temple",
  heroClass: "sc-hero--gilbert",
  heroW: 1600,
  heroH: 900,
  heroVer: "temple-v1",
  heroCaptionEs: "Templo de Gilbert, Arizona",
  heroCaptionEn: "Gilbert Arizona Temple",
  countyEs: "condado Maricopa",
  countyEn: "Maricopa County",
  metroEs: ["Gilbert", "Chandler", "Mesa", "Queen Creek", "San Tan Valley"],
  metroEn: ["Gilbert", "Chandler", "Mesa", "Queen Creek", "San Tan Valley"],
  metroTitleEs: "Gilbert y el sureste del valle",
  metroTitleEn: "Gilbert and the Southeast Valley",
  nearbyGuides: [
    { slug: "chandler", name: "Chandler" },
    { slug: "mesa", name: "Mesa" },
    { slug: "phoenix", name: "Phoenix" },
  ],
  prepaidCemEs: "Gilbert Memorial Park, Queen of Heaven Catholic Cemetery",
  prepaidCemEn: "Gilbert Memorial Park, Queen of Heaven Catholic Cemetery",
  homes: [falconerGilbert(), buelerChandler(), wymanChapel()],
  tableFootEs:
    "Falconer Funeral Home (Gilbert): GPL y lista de paquetes 29 jun. 2026 — cremación directa $2,395; entierro inmediato $2,795; memorial con recepción $4,295; entierro con velatorio el mismo día $6,825 (contenedor o ataúd del comprador salvo paquete). Whitney & Murphy Bueler Mortuary (Chandler): GPL 7 feb. 2026 — cremación directa y entierro inmediato $1,785; memorial $2,985; funeral tradicional $4,195. Wyman (Mesa): GPL en línea — cremación directa $895; entierro inmediato $1,395." +
    ESTIMATOR_FOOT_ES,
  tableFootEn:
    "Falconer Funeral Home (Gilbert): GPL and package list 29 Jun 2026 — direct cremation $2,395; immediate burial $2,795; memorial with reception $4,295; burial with same-day visitation $6,825 (purchaser container or casket unless a package says otherwise). Whitney & Murphy Bueler Mortuary (Chandler): GPL 7 Feb 2026 — direct cremation and immediate burial $1,785; memorial $2,985; traditional funeral $4,195. Wyman (Mesa): GPL online — direct cremation $895; immediate burial $1,395." +
    ESTIMATOR_FOOT_EN,
  analysisSameEs:
    "Falconer en Gilbert publica los cuatro tipos de fila en su GPL y lista de paquetes. Bueler (Chandler) sigue siendo la opción más baja en memorial y funeral tradicional (<strong>$2,985</strong> / <strong>$4,195</strong>). Wyman (Mesa) tiene la cremación directa más baja (<strong>$895</strong>).",
  analysisSameEn:
    "Falconer in Gilbert publishes all four chart rows on its GPL and package list. Bueler (Chandler) still has the lowest memorial and traditional funeral (<strong>$2,985</strong> / <strong>$4,195</strong>). Wyman (Mesa) has the lowest direct cremation (<strong>$895</strong>).",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Gilbert Memorial Park está en <strong>480-935-5858</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. Gilbert Memorial Park is at <strong>480-935-5858</strong>.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Gilbert Memorial Park (480-935-5858) y Queen of Heaven en Mesa (480-832-3030) venden espacios. Los anuncios de reventa están en Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Gilbert Memorial Park (480-935-5858) and Queen of Heaven in Mesa (480-832-3030) sell spaces. Resale ads are on Grave Solutions.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla incluye bóveda, lápida ni funeral. Anuncios en el este del valle citan unos <strong>$2,400–$4,000</strong> por espacio en reventa.",
  newListEn:
    "None of the chart prices include a vault, marker, or funeral. East Valley ads cite about <strong>$2,400 to $4,000</strong> per space on resale.",
  plotPriceRange: plotPriceRangeMesa("Gilbert", "Gilbert"),
  plotNew: 4000,
  plotResale: 2400,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista en Gilbert Memorial Park)",
  plotNewLabelEn: "New, from the cemetery office (ask at Gilbert Memorial Park)",
  plotPublished: [],
  plotOffices: GILBERT_PLOT_OFFICES,
  officesEs: plotOfficeListHtml(GILBERT_PLOT_OFFICES, "es"),
  officesEn: plotOfficeListHtml(GILBERT_PLOT_OFFICES, "en"),
  unpublishedLeadEs: SERVICE_AREA_LEAD_ES,
  unpublishedLeadEn: SERVICE_AREA_LEAD_EN,
  unpublishedHomes: [
    {
      name: "Gilbert Memorial Park",
      href: "https://www.gilbertmemorialpark.com/",
      addr: "2100 E Queen Creek Rd, Gilbert",
      phone: "(480) 935-5858",
    },
  ],
  resaleHref: GRAVE_AZ,
});
