const { makeCity } = require("./az-factory");
const {
  meldrumMortuary,
  wymanChapel,
  bunkerGardenChapel,
  buelerChandler,
  eastLakeMortuary,
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
  slug: "tempe",
  nameEs: "Tempe",
  nameEn: "Tempe",
  heroFile: "tempe-mill-bridge",
  heroClass: "sc-hero--tempe",
  heroW: 1600,
  heroH: 900,
  heroVer: "bridge-v1",
  heroCaptionEs: "Puente de Mill Avenue sobre Tempe Town Lake al atardecer",
  heroCaptionEn: "Mill Avenue bridge over Tempe Town Lake at sunset",
  countyEs: "condado Maricopa",
  countyEn: "Maricopa County",
  metroEs: ["Tempe", "Mesa", "Chandler", "Scottsdale", "Phoenix", "Guadalupe"],
  metroEn: ["Tempe", "Mesa", "Chandler", "Scottsdale", "Phoenix", "Guadalupe"],
  metroTitleEs: "Tempe y el valle central",
  metroTitleEn: "Tempe and the Central Valley",
  nearbyGuides: [
    { slug: "mesa", name: "Mesa" },
    { slug: "phoenix", name: "Phoenix" },
    { slug: "scottsdale", name: "Scottsdale" },
  ],
  prepaidCemEs: "Queen of Heaven Catholic Cemetery, Greenwood Memory Lawn",
  prepaidCemEn: "Queen of Heaven Catholic Cemetery, Greenwood Memory Lawn",
  homes: [wymanChapel(), meldrumMortuary(), bunkerGardenChapel(), buelerChandler(), eastLakeMortuary()],
  tableFootEs:
    "Wyman y Meldrum (Mesa): GPL en línea — cremación directa $895 y $1,195; entierro inmediato $1,395 y $1,595 (contenedor o ataúd del comprador). Bunker Family — Garden Chapel (Mesa): GPL 14 sep. 2026 — cremación directa y entierro inmediato $1,695; paquete Full Service With Same Day Visitation $4,295. Whitney & Murphy Bueler Mortuary (Chandler): GPL 7 feb. 2026 — memorial $2,985; funeral tradicional $4,195. East Lake Mortuary (Phoenix): GPL 7 mar. 2024 — memorial con cremación $1,350; paquete C-60 $2,995." +
    ESTIMATOR_FOOT_ES,
  tableFootEn:
    "Wyman and Meldrum (Mesa): GPL online — direct cremation $895 and $1,195; immediate burial $1,395 and $1,595 (purchaser container or casket). Bunker Family — Garden Chapel (Mesa): GPL 14 Sep 2026 — direct cremation and immediate burial $1,695; Full Service With Same Day Visitation package $4,295. Whitney & Murphy Bueler Mortuary (Chandler): GPL 7 Feb 2026 — memorial $2,985; traditional funeral $4,195. East Lake Mortuary (Phoenix): GPL 7 Mar 2024 — cremation with memorial $1,350; C-60 package $2,995." +
    ESTIMATOR_FOOT_EN,
  analysisSameEs:
    "Wyman publica la cremación directa más baja (<strong>$895</strong>). Bueler (Chandler) y East Lake (Phoenix) llenan memorial y funeral tradicional en la tabla. Bunker (Mesa) publica entierro con velatorio desde <strong>$4,295</strong>. Las funerarias con dirección en Tempe aparecen abajo — llame por la lista vigente.",
  analysisSameEn:
    "Wyman publishes the lowest direct cremation (<strong>$895</strong>). Bueler (Chandler) and East Lake (Phoenix) fill memorial and traditional funeral on the chart. Bunker (Mesa) publishes burial with visitation from <strong>$4,295</strong>. Tempe-address funeral homes are listed below — call for the current list.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Queen of Heaven (Mesa) está en <strong>480-832-3030</strong>. Greenwood está en <strong>623-846-1212</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. Queen of Heaven (Mesa) is at <strong>480-832-3030</strong>. Greenwood is at <strong>623-846-1212</strong>.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Queen of Heaven y Greenwood venden espacios cerca de Tempe. Los anuncios de reventa están en Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Queen of Heaven and Greenwood sell spaces near Tempe. Resale ads are on Grave Solutions.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla incluye bóveda, lápida ni funeral. Anuncios en el valle citan unos <strong>$2,400–$4,000</strong> por espacio en reventa.",
  newListEn:
    "None of the chart prices include a vault, marker, or funeral. Valley ads cite about <strong>$2,400 to $4,000</strong> per space on resale.",
  plotPriceRange: plotPriceRangeMesa("Tempe", "Tempe"),
  plotNew: 4000,
  plotResale: 2400,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista en Queen of Heaven o Greenwood)",
  plotNewLabelEn: "New, from the cemetery office (ask at Queen of Heaven or Greenwood)",
  plotPublished: [],
  plotOffices: MESA_PLOT_OFFICES,
  officesEs: plotOfficeListHtml(MESA_PLOT_OFFICES, "es"),
  officesEn: plotOfficeListHtml(MESA_PLOT_OFFICES, "en"),
  unpublishedLeadEs: SERVICE_AREA_LEAD_ES,
  unpublishedLeadEn: SERVICE_AREA_LEAD_EN,
  unpublishedHomes: [
    {
      name: "Tempe Mortuary",
      href: "https://www.tempemortuary.com/",
      addr: "405 E Southern Ave, Tempe",
      phone: "(480) 967-1643",
    },
    {
      name: "All Options Funeral Home",
      href: "https://www.alloptionsfuneralhome.com/",
      addr: "1525 W University Dr Ste 102, Tempe",
      phone: "(480) 214-3104",
    },
  ],
  resaleHref: GRAVE_AZ,
});
