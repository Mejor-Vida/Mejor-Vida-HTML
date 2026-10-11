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
const {
  GRAVE_AZ,
  MESA_PLOT_OFFICES,
  plotPriceRangeMesa,
  plotOfficeListHtml,
} = require("./az-plot-shared");

module.exports = makeCity({
  slug: "chandler",
  nameEs: "Chandler",
  nameEn: "Chandler",
  heroFile: "chandler-aerial",
  heroClass: "sc-hero--chandler",
  heroW: 1600,
  heroH: 900,
  heroVer: "aerial-v1",
  heroCaptionEs: "Vista aérea de Chandler — campos de golf y comunidades del sureste del valle",
  heroCaptionEn: "Aerial view of Chandler — golf courses and Southeast Valley communities",
  countyEs: "condado Maricopa",
  countyEn: "Maricopa County",
  metroEs: ["Chandler", "Gilbert", "Mesa", "Tempe", "Phoenix", "Sun Lakes"],
  metroEn: ["Chandler", "Gilbert", "Mesa", "Tempe", "Phoenix", "Sun Lakes"],
  metroTitleEs: "Chandler y el sureste del valle",
  metroTitleEn: "Chandler and the Southeast Valley",
  nearbyGuides: [
    { slug: "mesa", name: "Mesa" },
    { slug: "gilbert", name: "Gilbert" },
    { slug: "tempe", name: "Tempe" },
    { slug: "phoenix", name: "Phoenix" },
  ],
  prepaidCemEs: "Queen of Heaven Catholic Cemetery, Gilbert Memorial Park",
  prepaidCemEn: "Queen of Heaven Catholic Cemetery, Gilbert Memorial Park",
  homes: [buelerChandler(), wymanChapel(), falconerGilbert()],
  tableFootEs:
    "Whitney & Murphy Bueler Mortuary (Chandler): GPL 7 feb. 2026 — cremación directa y entierro inmediato $1,785 (contenedor del comprador); paquete Cremation with Memorial Service $2,985; Traditional Funeral Service $4,195 (lista de opciones 1 feb. 2026). Wyman (Mesa) y Falconer (Gilbert): GPL en línea — cremación directa $895 y $2,395; entierro inmediato $1,395 y $2,795." +
    ESTIMATOR_FOOT_ES,
  tableFootEn:
    "Whitney & Murphy Bueler Mortuary (Chandler): GPL 7 Feb 2026 — direct cremation and immediate burial $1,785 (purchaser container); Cremation with Memorial Service package $2,985; Traditional Funeral Service $4,195 (personalized options 1 Feb 2026). Wyman (Mesa) and Falconer (Gilbert): GPL online — direct cremation $895 and $2,395; immediate burial $1,395 and $2,795." +
    ESTIMATOR_FOOT_EN,
  analysisSameEs:
    "Bueler en Chandler publica los cuatro tipos de paquete en su GPL y lista de opciones personalizadas. Wyman (Mesa) sigue siendo la cremación directa más baja (<strong>$895</strong>). Falconer (Gilbert) está en la tabla por su GPL en línea; memorial y funeral tradicional completos aparecen en Bueler.",
  analysisSameEn:
    "Bueler in Chandler publishes all four package types on its GPL and personalized options list. Wyman (Mesa) still has the lowest direct cremation (<strong>$895</strong>). Falconer (Gilbert) is on the chart for its online GPL; full memorial and traditional packages appear on Bueler.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Queen of Heaven (Mesa) está en <strong>480-832-3030</strong>. Gilbert Memorial Park está en <strong>480-935-5858</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. Queen of Heaven (Mesa) is at <strong>480-832-3030</strong>. Gilbert Memorial Park is at <strong>480-935-5858</strong>.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Queen of Heaven y Gilbert Memorial Park atienden familias en Chandler. Pida la lista por escrito. Los anuncios de reventa están en Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Queen of Heaven and Gilbert Memorial Park serve Chandler families. Ask for the list in writing. Resale ads are on Grave Solutions.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla incluye bóveda, lápida ni funeral. Anuncios en el este del valle citan unos <strong>$2,400–$4,000</strong> por espacio en reventa.",
  newListEn:
    "None of the chart prices include a vault, marker, or funeral. East Valley ads cite about <strong>$2,400 to $4,000</strong> per space on resale.",
  plotPriceRange: plotPriceRangeMesa("Chandler", "Chandler"),
  plotNew: 4000,
  plotResale: 2400,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista en Queen of Heaven o Gilbert Memorial Park)",
  plotNewLabelEn: "New, from the cemetery office (ask at Queen of Heaven or Gilbert Memorial Park)",
  plotPublished: [],
  plotOffices: [
    {
      name: "Gilbert Memorial Park",
      addr: "2100 E Queen Creek Rd, Gilbert",
      phone: "480-935-5858",
      href: "https://www.gilbertmemorialpark.com/",
      noteEs: "Cementerio en Gilbert; muchas familias en Chandler compran aquí. Pida la lista por escrito.",
      noteEn: "Cemetery in Gilbert; many Chandler families buy here. Ask for the list in writing.",
    },
    ...MESA_PLOT_OFFICES.slice(0, 1),
  ],
  officesEs: plotOfficeListHtml(
    [
      {
        name: "Gilbert Memorial Park",
        addr: "2100 E Queen Creek Rd, Gilbert",
        phone: "480-935-5858",
      },
      { name: "Queen of Heaven Catholic Cemetery", addr: "1562 E Baseline Rd, Mesa", phone: "480-832-3030" },
    ],
    "es"
  ),
  officesEn: plotOfficeListHtml(
    [
      {
        name: "Gilbert Memorial Park",
        addr: "2100 E Queen Creek Rd, Gilbert",
        phone: "480-935-5858",
      },
      { name: "Queen of Heaven Catholic Cemetery", addr: "1562 E Baseline Rd, Mesa", phone: "480-832-3030" },
    ],
    "en"
  ),
  unpublishedLeadEs: SERVICE_AREA_LEAD_ES,
  unpublishedLeadEn: SERVICE_AREA_LEAD_EN,
  unpublishedHomes: [
    {
      name: "Valley of the Sun Mortuary & Cemetery",
      href: "https://www.dignitymemorial.com/",
      addr: "10940 E Chandler Heights Rd, Chandler",
      phone: "(480) 832-2859",
    },
    {
      name: "A Legacy Funeral Home — Rose Chapel",
      href: "https://www.afamilylegacy.com/",
      addr: "1374 N Arizona Ave, Chandler",
      phone: "(480) 963-8800",
    },
  ],
  resaleHref: GRAVE_AZ,
});
