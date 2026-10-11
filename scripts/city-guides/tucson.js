const { makeCity } = require("./az-factory");
const {
  bringsBroadway,
  evergreenTucson,
  ESTIMATOR_FOOT_ES,
  ESTIMATOR_FOOT_EN,
} = require("./az-homes");
const {
  GRAVE_AZ,
  TUCSON_PLOT_OFFICES,
  plotPriceRangeTucson,
  plotOfficeListHtml,
} = require("./az-plot-shared");

module.exports = makeCity({
  slug: "tucson",
  nameEs: "Tucson",
  nameEn: "Tucson",
  heroFile: "tucson-skyline",
  heroClass: "sc-hero--tucson",
  heroW: 1600,
  heroH: 900,
  heroVer: "skyline-v2",
  heroCaptionEs: "Horizonte de Tucson al atardecer, con Sentinel Peak (“A” Mountain)",
  heroCaptionEn: "Tucson skyline at sunset with Sentinel Peak (“A” Mountain)",
  countyEs: "condado Pima",
  countyEn: "Pima County",
  metroEs: ["Tucson", "Oro Valley", "Marana", "Sahuarita", "Green Valley"],
  metroEn: ["Tucson", "Oro Valley", "Marana", "Sahuarita", "Green Valley"],
  metroTitleEs: "Tucson y el condado Pima",
  metroTitleEn: "Tucson and Pima County",
  nearbyGuides: [{ slug: "phoenix", name: "Phoenix" }],
  prepaidCemEs: "Evergreen Mortuary & Cemetery, East Lawn Palms Memorial Park",
  prepaidCemEn: "Evergreen Mortuary & Cemetery, East Lawn Palms Memorial Park",
  homes: [evergreenTucson(), bringsBroadway()],
  tableFootEs:
    "Evergreen Mortuary: GPL 12 feb. 2026 — cremación directa $1,740, entierro inmediato $2,495; memorial Simple Memorial Cremation Basic $6,005; entierro Basic Burial $8,415. Bring’s Broadway Chapel: GPL y paquetes 29 abr. 2026 — cremación directa $2,290, entierro inmediato $3,195; Classic Tribute Cremation $6,570; Reflection Burial $7,475." +
    ESTIMATOR_FOOT_ES,
  tableFootEn:
    "Evergreen Mortuary: GPL 12 Feb 2026 — direct cremation $1,740, immediate burial $2,495; Simple Memorial Cremation Basic $6,005; Basic Burial $8,415. Bring’s Broadway Chapel: GPL and packages 29 Apr 2026 — direct cremation $2,290, immediate burial $3,195; Classic Tribute Cremation $6,570; Reflection Burial $7,475." +
    ESTIMATOR_FOOT_EN,
  analysisSameEs:
    "Evergreen publica cremación directa <strong>$1,740</strong> y entierro inmediato <strong>$2,495</strong>; su memorial Simple Memorial Cremation Basic está en <strong>$6,005</strong> y su entierro con velatorio Basic Burial en <strong>$8,415</strong> (ataúd del paquete). Bring’s publica cremación directa <strong>$2,290</strong> y entierro inmediato <strong>$3,195</strong>; Classic Tribute Cremation <strong>$6,570</strong> y Reflection Burial <strong>$7,475</strong> con allowance de ataúd. Los paquetes no incluyen lote ni cargos de cementerio salvo que la lista lo diga.",
  analysisSameEn:
    "Evergreen publishes direct cremation <strong>$1,740</strong> and immediate burial <strong>$2,495</strong>; its Simple Memorial Cremation Basic is <strong>$6,005</strong> and Basic Burial with visitation is <strong>$8,415</strong> (package casket). Bring’s publishes direct cremation <strong>$2,290</strong> and immediate burial <strong>$3,195</strong>; Classic Tribute Cremation <strong>$6,570</strong> and Reflection Burial <strong>$7,475</strong> with a casket allowance. Packages do not include a plot or cemetery charges unless the list says so.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Evergreen está en <strong>520-888-7470</strong>. East Lawn Palms está en <strong>520-745-3711</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. Evergreen is at <strong>520-888-7470</strong>. East Lawn Palms is at <strong>520-745-3711</strong>.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Evergreen y East Lawn Palms venden espacios en Tucson (520-888-7470 y 520-745-3711). Pida la lista por escrito. Los anuncios de reventa están en el tablero de Arizona de Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Evergreen and East Lawn Palms sell spaces in Tucson (520-888-7470 and 520-745-3711). Ask for the list in writing. Resale ads are on the Arizona Grave Solutions board.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla incluye abrir/cerrar, bóveda, lápida ni funeral. Anuncios en East Lawn Palms citaron unos <strong>$4,500</strong> por dos espacios y compararon con más de <strong>$10,000</strong> en la lista del cementerio.",
  newListEn:
    "None of the chart prices include opening/closing, a vault, a marker, or the funeral. East Lawn Palms ads cited about <strong>$4,500</strong> for two spaces and compared to more than <strong>$10,000</strong> on the cemetery list.",
  plotPriceRange: plotPriceRangeTucson("Tucson", "Tucson"),
  plotNew: 5000,
  plotResale: 2250,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — anuncios citan a menudo más de $5,000)",
  plotNewLabelEn: "New, from the cemetery office (ask for the list — ads often cite more than $5,000)",
  plotPublished: [],
  plotOffices: TUCSON_PLOT_OFFICES,
  officesEs: plotOfficeListHtml(TUCSON_PLOT_OFFICES, "es"),
  officesEn: plotOfficeListHtml(TUCSON_PLOT_OFFICES, "en"),
  resaleHref: GRAVE_AZ,
});
