const { makeCity } = require("./az-factory");
const {
  meldrumMortuary,
  wymanChapel,
  bunkerGardenChapel,
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
  slug: "mesa",
  nameEs: "Mesa",
  nameEn: "Mesa",
  heroFile: "mesa-monument-valley",
  heroClass: "sc-hero--mesa",
  heroW: 1600,
  heroH: 900,
  heroVer: "desert-v1",
  heroCaptionEs: "Monument Valley, desierto de Arizona",
  heroCaptionEn: "Monument Valley, Arizona desert",
  countyEs: "condado Maricopa",
  countyEn: "Maricopa County",
  metroEs: ["Mesa", "Apache Junction", "Queen Creek", "Gilbert", "Chandler", "Tempe"],
  metroEn: ["Mesa", "Apache Junction", "Queen Creek", "Gilbert", "Chandler", "Tempe"],
  metroTitleEs: "Mesa y el este del valle",
  metroTitleEn: "Mesa and the East Valley",
  nearbyGuides: [
    { slug: "phoenix", name: "Phoenix" },
    { slug: "chandler", name: "Chandler" },
    { slug: "gilbert", name: "Gilbert" },
    { slug: "tempe", name: "Tempe" },
  ],
  prepaidCemEs: "Queen of Heaven Catholic Cemetery, Greenwood Memory Lawn",
  prepaidCemEn: "Queen of Heaven Catholic Cemetery, Greenwood Memory Lawn",
  homes: [wymanChapel(), meldrumMortuary(), bunkerGardenChapel(), eastLakeMortuary()],
  tableFootEs:
    "Wyman y Meldrum: GPL en línea (Altogether Funeral), may. 2026 — cremación directa $895 y $1,195; entierro inmediato $1,395 y $1,595 con contenedor o ataúd del comprador. Bunker Family — Garden Chapel: GPL 14 sep. 2026 — cremación directa y entierro inmediato $1,695 (contenedor del comprador); paquete Full Service With Same Day Visitation $4,295. East Lake Mortuary (Phoenix): GPL 7 mar. 2024 — memorial con cremación $1,350; paquete C-60 con velatorio $2,995." +
    ESTIMATOR_FOOT_ES,
  tableFootEn:
    "Wyman and Meldrum: GPL online (Altogether Funeral), May 2026 — direct cremation $895 and $1,195; immediate burial $1,395 and $1,595 with purchaser container or casket. Bunker Family — Garden Chapel: GPL 14 Sep 2026 — direct cremation and immediate burial $1,695 (purchaser container); Full Service With Same Day Visitation package $4,295. East Lake Mortuary (Phoenix): GPL 7 Mar 2024 — cremation with memorial $1,350; C-60 visitation package $2,995." +
    ESTIMATOR_FOOT_EN,
  analysisSameEs:
    "Wyman publica la cremación directa más baja en la tabla (<strong>$895</strong>). Bunker en Mesa publica entierro completo con velatorio desde <strong>$4,295</strong>. East Lake (Phoenix) está en la tabla porque publica memorial con cremación (<strong>$1,350</strong>) y funeral con velatorio (<strong>$2,995</strong>) — no está dentro de Mesa. El promedio de Arizona (<strong>$5,372</strong> / <strong>$7,784</strong>) no es el paquete de una casa.",
  analysisSameEn:
    "Wyman publishes the lowest direct cremation in the chart (<strong>$895</strong>). Bunker in Mesa publishes full-service burial with visitation from <strong>$4,295</strong>. East Lake (Phoenix) is on the chart because it publishes cremation with memorial (<strong>$1,350</strong>) and a visitation funeral (<strong>$2,995</strong>) — it is not inside Mesa city limits. Arizona averages (<strong>$5,372</strong> / <strong>$7,784</strong>) are not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Queen of Heaven en Mesa está en <strong>480-832-3030</strong>. Greenwood Memory Lawn está en <strong>623-846-1212</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. Queen of Heaven in Mesa is at <strong>480-832-3030</strong>. Greenwood Memory Lawn is at <strong>623-846-1212</strong>.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Queen of Heaven en Mesa (480-832-3030) y Greenwood en Phoenix (623-846-1212) venden espacios. Los anuncios de reventa están en Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Queen of Heaven in Mesa (480-832-3030) and Greenwood in Phoenix (623-846-1212) sell spaces. Resale ads are on Grave Solutions.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla incluye bóveda, lápida ni funeral. Anuncios en Queen of Heaven muestran paquetes prepagados completos (plot, bóveda, marcador) por encima de <strong>$13,000</strong>, no solo el lote.",
  newListEn:
    "None of the chart prices include a vault, marker, or funeral. Queen of Heaven ads show full pre-need packages (plot, vault, marker) above <strong>$13,000</strong>, not plot-only pricing.",
  plotPriceRange: plotPriceRangeMesa("Mesa", "Mesa"),
  plotNew: 4000,
  plotResale: 2400,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — anuncios citan unos $4,000 en el valle)",
  plotNewLabelEn: "New, from the cemetery office (ask for the list — Valley ads cite about $4,000)",
  plotPublished: [],
  plotOffices: MESA_PLOT_OFFICES,
  officesEs: plotOfficeListHtml(MESA_PLOT_OFFICES, "es"),
  officesEn: plotOfficeListHtml(MESA_PLOT_OFFICES, "en"),
  unpublishedLeadEs: SERVICE_AREA_LEAD_ES,
  unpublishedLeadEn: SERVICE_AREA_LEAD_EN,
  unpublishedHomes: [
    {
      name: "Lakeshore Mortuary",
      href: "https://www.dignitymemorial.com/",
      addr: "1815 S Dobson Rd, Mesa",
      phone: "(480) 827-0211",
    },
    {
      name: "Mariposa Gardens Memorial Park & Funeral Care",
      href: "https://www.dignitymemorial.com/",
      addr: "400 S Power Rd, Mesa",
      phone: "(480) 832-2859",
    },
  ],
  resaleHref: GRAVE_AZ,
});
