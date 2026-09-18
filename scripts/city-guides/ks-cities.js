const { makeCity, cell, jocoNear } = require("./ks-factory");

const GRAVE_KS = "https://www.gravesolutions.com/for-sale/cemetery-properties/kansas";
const FCA_NO_MEM_LEAD_ES =
  "Estas funerarias tienen una lista general de precios (encuesta FCA-GKC 2025: cremación directa, entierro inmediato y funeral estándar). Esa encuesta no incluye un paquete de memorial después de cremación, así que no van en la tabla. Llame y pida la lista general de precios vigente.";
const FCA_NO_MEM_LEAD_EN =
  "These funeral homes have a general price list (FCA-GKC 2025 survey: direct cremation, immediate burial, and a standard funeral). That survey has no cremation-with-memorial package, so they are not on the chart. Call and ask for the current general price list.";
const FCA_NO_MEM_CHEAP_ES =
  "La encuesta FCA-GKC 2025 transcribió cremación directa, entierro inmediato y funeral estándar, pero no un memorial después de cremación. Esta tabla no nombra esas casas. El estimador usa <strong>$2,553</strong> como promedio de Kansas para cremación directa. Ese número no es el precio de una casa. Pida la lista vigente por teléfono.";
const FCA_NO_MEM_CHEAP_EN =
  "The FCA-GKC 2025 survey transcribed direct cremation, immediate burial, and a standard funeral, but not a memorial after cremation. This table does not name those homes. The estimator uses <strong>$2,553</strong> as the Kansas average for direct cremation. That figure is not one home’s price. Ask for the current list by phone.";
const FCA_NO_MEM_FAQ_ES =
  "La encuesta FCA-GKC 2025 no incluye un paquete de memorial después de cremación, así que esta tabla no nombra funerarias. El estimador usa $2,553 como promedio de Kansas para cremación directa; ese número no es el precio de una casa. Muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional suele necesitar más: el promedio de Kansas es $8,640, y el lote, la bóveda y la lápida van aparte.";
const FCA_NO_MEM_FAQ_EN =
  "The FCA-GKC 2025 survey has no cremation-with-memorial package, so this table does not name funeral homes. The estimator uses $2,553 as the Kansas average for direct cremation; that figure is not one home’s price. Many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial often needs more: the Kansas average is $8,640, and the plot, vault, and marker are extra.";

const wichita = makeCity({
  slug: "wichita",
  nameEs: "Wichita",
  nameEn: "Wichita",
  heroFile: "wichita-keeper-of-the-plains",
  heroCaptionEs:
    "El Keeper of the Plains, Wichita — escultura de Blackbear Bosin en la confluencia de los ríos Arkansas y Little Arkansas, con braseros y los puentes peatonales en forma de arco y flecha.",
  heroCaptionEn:
    "The Keeper of the Plains, Wichita — sculpture by Blackbear Bosin at the confluence of the Arkansas and Little Arkansas rivers, with fire pots and the bow-and-arrow pedestrian bridges.",
  heroClass: "sc-hero--wichita",
  heroW: 882,
  heroH: 900,
  heroVer: "v3",
  nearbyGuides: [],
  countyEs: "condado Sedgwick",
  countyEn: "Sedgwick County",
  metroEs: ["Wichita", "Valley Center", "Derby", "Haysville", "Park City", "Bel Aire"],
  metroEn: ["Wichita", "Valley Center", "Derby", "Haysville", "Park City", "Bel Aire"],
  metroTitleEs: "Área que atendemos en Wichita",
  metroTitleEn: "Wichita area we serve",
  prepaidCemEs: "Maple Grove, Resthaven",
  prepaidCemEn: "Maple Grove, Resthaven",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Maple Grove (316-682-4821) o en Resthaven. También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Maple Grove (316-682-4821) or Resthaven for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Downing & Lahey: GPL 14 ago. 2026. Baker Wichita East: GPL 15 jun. 2026. Baker Valley Center: GPL 1 ene. 2025. Estimador: promedios Funeralocity de Kansas. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Downing & Lahey: GPL 14 Aug 2026. Baker Wichita East: GPL 15 Jun 2026. Baker Valley Center: GPL 1 Jan 2025. Estimator: Kansas Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Maple Grove publica un teléfono de oficina. Resthaven y White Chapel no publican el lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Maple Grove publishes an office phone. Resthaven and White Chapel do not post plot prices online. Call and ask for the current list in writing.",
  newListEs:
    "Ninguno de estos cementerios de Wichita publica un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista en la oficina.",
  newListEn:
    "None of these Wichita cemeteries publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask the office for the list.",
  officesEs: [
    "<strong>Maple Grove Cemetery</strong> — 1000 N Hillside St. Teléfono 316-682-4821.",
    "<strong>Resthaven Gardens of Memory</strong> — 11800 E 21st St N. Pida la lista en la oficina del parque.",
    "<strong>White Chapel Memorial Gardens</strong> — 1620 N Greenwich Rd. Pida la lista en la oficina.",
  ],
  officesEn: [
    "<strong>Maple Grove Cemetery</strong> — 1000 N Hillside St. Phone 316-682-4821.",
    "<strong>Resthaven Gardens of Memory</strong> — 11800 E 21st St N. Ask the park office for the list.",
    "<strong>White Chapel Memorial Gardens</strong> — 1620 N Greenwich Rd. Ask the office for the list.",
  ],
  analysisSameEs:
    "El funeral tradicional de Downing & Lahey (<strong>$5,625</strong>) es un agrupamiento de servicios, sin ataúd. El de Baker Wichita East (<strong>$5,597</strong>) ya mete un ataúd de 20 gauge. El de Baker Valley Center (<strong>$3,997</strong>) también incluye ataúd. El promedio de entierro completo de Kansas (<strong>$8,640</strong>) suele incluir ataúd.",
  analysisSameEn:
    "Downing & Lahey’s traditional grouping (<strong>$5,625</strong>) is services, with no casket. Baker Wichita East’s church/chapel package (<strong>$5,597</strong>) already puts in a 20-gauge casket. Baker Valley Center’s full-service package (<strong>$3,997</strong>) includes a casket too. Kansas’s full-burial average (<strong>$8,640</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Eso se pide en la oficina. En Maple Grove llame al <strong>316-682-4821</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. Ask the cemetery office. At Maple Grove call <strong>316-682-4821</strong>.",
  resaleHref: GRAVE_KS,
  plotNew: 3000,
  plotResale: 1200,
  homes: [
    {
      id: "downing",
      name: "Downing & Lahey",
      href: "https://downingandlahey.com/",
      addr: "6555 E Central · 316-682-4553",
      dc: 3870,
      ib: 4205,
      trad: 5625,
      dcEs: "Cremación directa, contenedor del comprador. Urna aparte.",
      dcEn: "Direct cremation, purchaser container. Urn extra.",
      ibEs: "Entierro inmediato, contenedor del comprador. Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container. Casket and plot extra.",
      memCell: cell(5010, "Cremación con memorial publicada. Urna aparte.", "Published cremation with memorial. Urn extra."),
      trCell: cell(5625, "Agrupamiento de servicio tradicional. Ataúd y lote aparte.", "Traditional service grouping. Casket and plot extra."),
    },
    {
      id: "bakerw",
      name: "Baker Wichita East",
      href: "https://www.bakerfhwichita.com/",
      addr: "6100 E Central, Ste. 203 · 316-612-1700",
      dc: 899,
      ib: 1397,
      trad: 5597,
      dcEs: "Cremación directa publicada. Contenedor y permiso aparte.",
      dcEn: "Published direct cremation. Container and permit extra.",
      ibEs: "Entierro inmediato publicado. Ataúd y lote aparte.",
      ibEn: "Published immediate burial. Casket and plot extra.",
      memCell: cell(1797, "Cremación directa con memorial en su local. Urna aparte.", "Direct cremation with a memorial at their facility. Urn extra."),
      trCell: cell(5597, "Paquete de iglesia/capilla. Ya incluye ataúd de 20 gauge.", "Church/chapel package. Already includes a 20-gauge casket."),
      casketTrad: true,
    },
    {
      id: "bakervc",
      name: "Baker Valley Center",
      href: "https://www.bakerfhvc.com/",
      addr: "100 S Cedar Ave, Valley Center",
      dc: 1100,
      ib: 1395,
      trad: 3997,
      dcEs: "Cremación directa publicada (GPL 1 ene. 2025).",
      dcEn: "Published direct cremation (GPL 1 Jan 2025).",
      ibEs: "Entierro inmediato, contenedor del comprador.",
      ibEn: "Immediate burial, purchaser container.",
      memCell: cell(2597, "Paquete de cremación: velatorio o memorial y ataúd de alquiler.", "Cremation package: viewing or memorial and a rental casket."),
      trCell: cell(3997, "Paquete completo con ataúd de 20 gauge.", "Full-service package with a 20-gauge casket."),
      casketMem: true,
      casketTrad: true,
    },
  ],
});

const overlandPark = makeCity({
  slug: "overland-park",
  nameEs: "Overland Park",
  nameEn: "Overland Park",
  heroFile: "overland-park-deanna-rose",
  heroCaptionEs: "Entrada de Deanna Rose Children’s Farmstead, Overland Park.",
  heroCaptionEn: "Entrance to Deanna Rose Children’s Farmstead, Overland Park.",
  heroClass: "sc-hero--overland-park",
    heroW: 1200,
    heroH: 900,
  nearbyGuides: jocoNear("overland-park"),
  countyEs: "condado Johnson",
  countyEn: "Johnson County",
  metroEs: ["Overland Park", "Leawood", "Prairie Village", "Mission", "Fairway"],
  metroEn: ["Overland Park", "Leawood", "Prairie Village", "Mission", "Fairway"],
  metroTitleEs: "Área que atendemos en Overland Park",
  metroTitleEn: "Overland Park area we serve",
  prepaidCemEs: "Johnson County Memorial Gardens",
  prepaidCemEn: "Johnson County Memorial Gardens",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Johnson County Memorial Gardens (913-451-1860). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Johnson County Memorial Gardens (913-451-1860) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "La encuesta FCA-GKC 2025 transcribió las GPL de McGilley & Hoge (ago. 2024), Johnson County Funeral Chapel (oct. 2024) y Overland Park Funeral Chapel (oct. 2024): cremación directa, entierro inmediato y funeral estándar. No incluye un memorial después de cremación, así que esta tabla no las nombra. Estimador: promedios Funeralocity de Kansas. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "The FCA-GKC 2025 survey transcribed GPLs for McGilley & Hoge (Aug 2024), Johnson County Funeral Chapel (Oct 2024), and Overland Park Funeral Chapel (Oct 2024): direct cremation, immediate burial, and a standard funeral. It has no memorial-after-cremation package, so this table does not name them. Estimator: Kansas Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Johnson County Memorial Gardens comparte oficina con Johnson County Funeral Chapel. Pleasant Valley no publica el lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Johnson County Memorial Gardens shares an office with Johnson County Funeral Chapel. Pleasant Valley does not post plot prices online. Call and ask for the current list in writing.",
  newListEs:
    "Estos cementerios de Overland Park no publican un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 913-451-1860.",
  newListEn:
    "These Overland Park cemeteries do not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 913-451-1860.",
  officesEs: [
    "<strong>Johnson County Memorial Gardens</strong> — 11200 Metcalf Ave. Teléfono 913-451-1860.",
    "<strong>Pleasant Valley Cemetery</strong> — 8100 Mission Rd. Pida la lista en la oficina del cementerio.",
    "<strong>Antioch Pioneer Cemetery</strong> — cementerio histórico de Overland Park. Pregunte en el ayuntamiento si aún hay espacios.",
  ],
  officesEn: [
    "<strong>Johnson County Memorial Gardens</strong> — 11200 Metcalf Ave. Phone 913-451-1860.",
    "<strong>Pleasant Valley Cemetery</strong> — 8100 Mission Rd. Ask the cemetery office for the list.",
    "<strong>Antioch Pioneer Cemetery</strong> — historic Overland Park cemetery. Ask city hall whether spaces are still sold.",
  ],
  analysisCheapEs: FCA_NO_MEM_CHEAP_ES,
  analysisCheapEn: FCA_NO_MEM_CHEAP_EN,
  faqCremationAEs: FCA_NO_MEM_FAQ_ES,
  faqCremationAEn: FCA_NO_MEM_FAQ_EN,
  unpublishedLeadEs: FCA_NO_MEM_LEAD_ES,
  unpublishedLeadEn: FCA_NO_MEM_LEAD_EN,
  analysisSameEs:
    "La encuesta no tiene un memorial después de cremación, así que McGilley & Hoge, Johnson County Funeral Chapel y Overland Park Funeral Chapel no van en la tabla. El funeral estándar de esa encuesta (con ataúd, en muchas casas) no es el mismo paquete que un memorial. El promedio de Kansas (<strong>$8,640</strong>) suele incluir ataúd.",
  analysisSameEn:
    "The survey has no memorial-after-cremation package, so McGilley & Hoge, Johnson County Funeral Chapel, and Overland Park Funeral Chapel are not on the chart. That survey’s standard funeral (often with a casket) is not the same package as a memorial. Kansas’s average (<strong>$8,640</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Johnson County Memorial Gardens llame al <strong>913-451-1860</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Johnson County Memorial Gardens call <strong>913-451-1860</strong>.",
  resaleHref: GRAVE_KS,
  plotNew: 4000,
  plotResale: 1800,
  homes: [],
  unpublishedHomes: [
    {
      name: "McGilley & Hoge",
      href: "https://www.dignitymemorial.com/funeral-homes/overland-park-ks/mcgilley-hoge-johnson-county-memorial-chapel/4976",
      addr: "8024 Santa Fe Dr",
      phone: "913-642-3565",
    },
    {
      name: "Johnson County Funeral Chapel",
      href: "https://www.johnsoncountyfuneralchapel.com/",
      addr: "11200 Metcalf Ave",
      phone: "913-451-1860",
    },
    {
      name: "Overland Park Funeral Chapel",
      href: "https://www.overlandparkfuneralchapel.com/",
      addr: "8201 Metcalf Ave",
      phone: "913-648-6224",
    },
  ],
});

const kansasCity = makeCity({
  slug: "kansas-city",
  nameEs: "Kansas City (Kansas)",
  nameEn: "Kansas City, Kansas",
  heroFile: "kansas-city-ks-rosedale-arch",
  heroCaptionEs:
    "Arco conmemorativo de Rosedale, Kansas City (Kansas) — réplica del Arco de Triunfo dedicada a los de Kansas City, Kansas, que sirvieron en la Primera Guerra Mundial.",
  heroCaptionEn:
    "Rosedale World War I Memorial Arch, Kansas City, Kansas — a replica of the Arc de Triomphe dedicated to the men of Kansas City, Kansas who served in World War I.",
  heroClass: "sc-hero--kansas-city",
    heroW: 600,
    heroH: 900,
  nearbyGuides: [{ slug: "overland-park", name: "Overland Park" }],
  countyEs: "condado Wyandotte",
  countyEn: "Wyandotte County",
  metroEs: ["Kansas City", "Bonner Springs", "Edwardsville", "Piper"],
  metroEn: ["Kansas City", "Bonner Springs", "Edwardsville", "Piper"],
  metroTitleEs: "Área que atendemos en Kansas City, Kansas",
  metroTitleEn: "Kansas City, Kansas area we serve",
  prepaidCemEs: "Maple Hill, Highland Park",
  prepaidCemEn: "Maple Hill, Highland Park",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Maple Hill (913-831-3345) o en Highland Park (913-371-0699). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Maple Hill (913-831-3345) or Highland Park (913-371-0699) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "La encuesta FCA-GKC 2025 transcribió las GPL de Chapel Hill-Butler (ago. 2024), Porter (ene. 2025) y Highland Park (ene. 2025): cremación directa, entierro inmediato y funeral estándar. No incluye un memorial después de cremación, así que esta tabla no las nombra. Estimador: promedios Funeralocity de Kansas. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "The FCA-GKC 2025 survey transcribed GPLs for Chapel Hill-Butler (Aug 2024), Porter (Jan 2025), and Highland Park (Jan 2025): direct cremation, immediate burial, and a standard funeral. It has no memorial-after-cremation package, so this table does not name them. Estimator: Kansas Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Maple Hill y Highland Park tienen funeraria y cementerio en el mismo terreno. Quindaro no publica el lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Maple Hill and Highland Park have a funeral home and cemetery on the same grounds. Quindaro does not post plot prices online. Call and ask for the current list in writing.",
  newListEs:
    "Estos cementerios de Kansas City, Kansas, no publican un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista en la oficina.",
  newListEn:
    "These Kansas City, Kansas cemeteries do not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask the office for the list.",
  officesEs: [
    "<strong>Maple Hill Funeral Home & Cemetery</strong> — 3300 Shawnee Dr. Teléfono 913-831-3345.",
    "<strong>Highland Park Funeral Home & Crematory</strong> — 4101 State Ave. Teléfono 913-371-0699.",
    "<strong>Quindaro Cemetery</strong> — cementerio histórico de Kansas City, Kansas. Pregunte en el condado Wyandotte si aún hay espacios.",
  ],
  officesEn: [
    "<strong>Maple Hill Funeral Home & Cemetery</strong> — 3300 Shawnee Dr. Phone 913-831-3345.",
    "<strong>Highland Park Funeral Home & Crematory</strong> — 4101 State Ave. Phone 913-371-0699.",
    "<strong>Quindaro Cemetery</strong> — historic Kansas City, Kansas cemetery. Ask Wyandotte County whether spaces are still sold.",
  ],
  analysisCheapEs: FCA_NO_MEM_CHEAP_ES,
  analysisCheapEn: FCA_NO_MEM_CHEAP_EN,
  faqCremationAEs: FCA_NO_MEM_FAQ_ES,
  faqCremationAEn: FCA_NO_MEM_FAQ_EN,
  unpublishedLeadEs: FCA_NO_MEM_LEAD_ES,
  unpublishedLeadEn: FCA_NO_MEM_LEAD_EN,
  analysisSameEs:
    "La encuesta no tiene un memorial después de cremación, así que Chapel Hill-Butler, Porter y Highland Park no van en la tabla. El funeral estándar de esa encuesta no es el mismo paquete que un memorial. El promedio de Kansas (<strong>$8,640</strong>) suele incluir ataúd.",
  analysisSameEn:
    "The survey has no memorial-after-cremation package, so Chapel Hill-Butler, Porter, and Highland Park are not on the chart. That survey’s standard funeral is not the same package as a memorial. Kansas’s average (<strong>$8,640</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Maple Hill llame al <strong>913-831-3345</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Maple Hill call <strong>913-831-3345</strong>.",
  resaleHref: GRAVE_KS,
  plotNew: 2800,
  plotResale: 1000,
  homes: [],
  unpublishedHomes: [
    {
      name: "Chapel Hill-Butler",
      href: "https://www.dignitymemorial.com/funeral-homes/kansas-city-ks/chapel-hill-butler-funeral-home/4969",
      addr: "701 N 94th St",
      phone: "913-334-3366",
    },
    {
      name: "Porter Funeral Home",
      href: "https://www.porterfuneralhome.com/",
      addr: "1835 Minnesota Ave",
      phone: "913-621-6400",
    },
    {
      name: "Highland Park",
      href: "https://www.highlandparkfh.com/",
      addr: "4101 State Ave",
      phone: "913-371-0699",
    },
  ],
});

const olathe = makeCity({
  slug: "olathe",
  nameEs: "Olathe",
  nameEn: "Olathe",
  heroFile: "olathe-mahaffie",
  heroCaptionEs: "Mahaffie Stagecoach Stop & Farm Historic Site, 1200 E Kansas City Rd, Olathe.",
  heroCaptionEn: "Mahaffie Stagecoach Stop & Farm Historic Site, 1200 E Kansas City Road, Olathe.",
  heroClass: "sc-hero--olathe",
    heroW: 1351,
    heroH: 900,
  nearbyGuides: jocoNear("olathe"),
  countyEs: "condado Johnson",
  countyEn: "Johnson County",
  metroEs: ["Olathe", "Gardner", "Spring Hill", "Edgerton"],
  metroEn: ["Olathe", "Gardner", "Spring Hill", "Edgerton"],
  metroTitleEs: "Área que atendemos en Olathe",
  metroTitleEn: "Olathe area we serve",
  prepaidCemEs: "Olathe Memorial Cemetery",
  prepaidCemEn: "Olathe Memorial Cemetery",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Olathe Memorial Cemetery (913-971-5226). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Olathe Memorial Cemetery (913-971-5226) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Penwell-Gabel Olathe: GPL Newcomer vigente 15 sep. 2026 (cremación directa del comprador $2,045; entierro inmediato $3,270; memorial $4,905; funeral $6,195). McGilley & Frye y Bruce Gardner aparecen en la encuesta FCA-GKC 2025 sin un paquete de memorial, así que no van en la tabla. Estimador: promedios Funeralocity de Kansas. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Penwell-Gabel Olathe: Newcomer GPL effective 15 Sep 2026 (purchaser direct cremation $2,045; immediate burial $3,270; memorial $4,905; funeral $6,195). McGilley & Frye and Bruce Gardner appear in the FCA-GKC 2025 survey with no memorial package, so they are not on the chart. Estimator: Kansas Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Olathe Memorial Cemetery es municipal y publica teléfono. No publican el lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Olathe Memorial Cemetery is municipal and publishes a phone number. They do not post plot prices online. Call and ask for the current list in writing.",
  newListEs:
    "Olathe Memorial Cemetery no publica un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 913-971-5226.",
  newListEn:
    "Olathe Memorial Cemetery does not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 913-971-5226.",
  officesEs: [
    "<strong>Olathe Memorial Cemetery</strong> — 738 N Chestnut St. Oficina 730 N Chestnut. Teléfono 913-971-5226.",
    "<strong>Penwell-Gabel Olathe</strong> — 14275 S Blackbob Rd. Pregunte en la funeraria por terrenos que ellos administren.",
    "<strong>Cementerio de Gardner</strong> — para familias del sur del condado. Pida la lista en el ayuntamiento de Gardner.",
  ],
  officesEn: [
    "<strong>Olathe Memorial Cemetery</strong> — 738 N Chestnut St. Office 730 N Chestnut. Phone 913-971-5226.",
    "<strong>Penwell-Gabel Olathe</strong> — 14275 S Blackbob Rd. Ask the funeral home about grounds they manage.",
    "<strong>Gardner Cemetery</strong> — for families in southern Johnson County. Ask Gardner city hall for the list.",
  ],
  unpublishedLeadEs: FCA_NO_MEM_LEAD_ES,
  unpublishedLeadEn: FCA_NO_MEM_LEAD_EN,
  analysisSameEs:
    "Penwell-Gabel Olathe publica planes simplificados: funeral <strong>$6,195</strong> y memorial después de cremación <strong>$4,905</strong>, sin ataúd. McGilley & Frye y Bruce en Gardner no van en la tabla: la encuesta FCA no tiene memorial. El promedio de Kansas (<strong>$8,640</strong>) suele incluir ataúd.",
  analysisSameEn:
    "Penwell-Gabel Olathe publishes simplified plans: funeral <strong>$6,195</strong> and memorial after cremation <strong>$4,905</strong>, with no casket. McGilley & Frye and Bruce in Gardner are not on the chart: the FCA survey has no memorial. Kansas’s average (<strong>$8,640</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Olathe Memorial Cemetery llame al <strong>913-971-5226</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Olathe Memorial Cemetery call <strong>913-971-5226</strong>.",
  resaleHref: GRAVE_KS,
  plotNew: 3500,
  plotResale: 1500,
  homes: [
    {
      id: "penwellol",
      name: "Penwell-Gabel Olathe",
      href: "https://www.penwellgabelolathe.com/",
      addr: "14275 S Blackbob Rd · 913-768-6777",
      dc: 2045,
      ib: 3270,
      trad: 6195,
      dcEs: "Cremación directa, contenedor del comprador.",
      dcEn: "Direct cremation, purchaser container.",
      ibEs: "Entierro inmediato, ataúd del comprador.",
      ibEn: "Immediate burial, purchaser casket.",
      memCell: cell(
        4905,
        "Plan simplificado: memorial con celebración después de cremación. Urna aparte.",
        "Simplified plan: memorial with a gathering after cremation. Urn extra."
      ),
      trCell: cell(
        6195,
        "Plan simplificado: funeral con velatorio el día anterior. Ataúd y lote aparte.",
        "Simplified plan: funeral with viewing the day before. Casket and plot extra."
      ),
    },
  ],
  unpublishedHomes: [
    {
      name: "McGilley & Frye",
      href: "https://www.dignitymemorial.com/funeral-homes/olathe-ks/mcgilley-frye-funeral-home/5220",
      addr: "105 E Loula St",
      phone: "913-782-0582",
    },
    {
      name: "Bruce Funeral Home (Gardner)",
      href: "https://www.brucefuneralhomes.com/",
      addr: "106 S Center St, Gardner",
      phone: "913-856-7111",
    },
  ],
});

const topeka = makeCity({
  slug: "topeka",
  nameEs: "Topeka",
  nameEn: "Topeka",
  heroFile: "topeka-kansas-capitol",
  heroCaptionEs: "Capitolio del Estado de Kansas, Topeka.",
  heroCaptionEn: "Kansas State Capitol, Topeka.",
  heroClass: "sc-hero--topeka",
  heroW: 1600,
  heroH: 900,
  nearbyGuides: [{ slug: "lawrence", name: "Lawrence" }],
  countyEs: "condado Shawnee",
  countyEn: "Shawnee County",
  metroEs: ["Topeka", "Tecumseh", "Silver Lake", "Auburn", "Rossville"],
  metroEn: ["Topeka", "Tecumseh", "Silver Lake", "Auburn", "Rossville"],
  metroTitleEs: "Área que atendemos en Topeka",
  metroTitleEn: "Topeka area we serve",
  prepaidCemEs: "Memorial Park, Mount Hope",
  prepaidCemEn: "Memorial Park, Mount Hope",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Memorial Park (785-272-1122) o en Mount Hope (785-234-6605). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Memorial Park (785-272-1122) or Mount Hope (785-234-6605) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Penwell-Gabel, Parker-Price & Davidson y Dove: GPL Newcomer de Topeka (planes simplificados 16 sep. 2026 / PPD y Dove en la misma familia de listas). Cremación directa del comprador $1,895; entierro inmediato $3,120; memorial $4,745; funeral $5,945. Estimador: promedios Funeralocity de Kansas. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Penwell-Gabel, Parker-Price & Davidson, and Dove: Topeka Newcomer GPLs (simplified plans 16 Sep 2026 / PPD and Dove on the same list family). Purchaser direct cremation $1,895; immediate burial $3,120; memorial $4,745; funeral $5,945. Estimator: Kansas Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Memorial Park y Mount Hope publican teléfono en la GPL de Penwell-Gabel. El cementerio municipal no publica el lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Memorial Park and Mount Hope publish phone numbers on the Penwell-Gabel GPL. The city cemetery does not post plot prices online. Call and ask for the current list in writing.",
  newListEs:
    "Estos cementerios de Topeka no publican un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 785-272-1122.",
  newListEn:
    "These Topeka cemeteries do not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 785-272-1122.",
  officesEs: [
    "<strong>Memorial Park Cemetery</strong> — 3616 SW 6th Ave. Teléfono 785-272-1122.",
    "<strong>Mount Hope Cemetery</strong> — 4700 SW 17th St. Teléfono 785-234-6605.",
    "<strong>Topeka Cemetery</strong> — 1601 SE 10th Ave. Cementerio municipal. Pida la lista en la oficina.",
  ],
  officesEn: [
    "<strong>Memorial Park Cemetery</strong> — 3616 SW 6th Ave. Phone 785-272-1122.",
    "<strong>Mount Hope Cemetery</strong> — 4700 SW 17th St. Phone 785-234-6605.",
    "<strong>Topeka Cemetery</strong> — 1601 SE 10th Ave. City cemetery. Ask the office for the list.",
  ],
  analysisSameEs:
    "Penwell-Gabel, Parker-Price & Davidson y Dove publican los mismos planes simplificados: funeral <strong>$5,945</strong> y memorial después de cremación <strong>$4,745</strong>, sin ataúd. El promedio de entierro completo de Kansas (<strong>$8,640</strong>) suele incluir ataúd.",
  analysisSameEn:
    "Penwell-Gabel, Parker-Price & Davidson, and Dove publish the same simplified plans: funeral <strong>$5,945</strong> and memorial after cremation <strong>$4,745</strong>, with no casket. Kansas’s full-burial average (<strong>$8,640</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Memorial Park llame al <strong>785-272-1122</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Memorial Park call <strong>785-272-1122</strong>.",
  resaleHref: GRAVE_KS,
  plotNew: 3200,
  plotResale: 1400,
  homes: [
    {
      id: "penwellt",
      name: "Penwell-Gabel",
      href: "https://www.penwellgabeltopeka.com/",
      addr: "3616 SW 6th Ave · 785-272-1122",
      dc: 1895,
      ib: 3120,
      trad: 5945,
      dcEs: "Cremación directa, contenedor del comprador.",
      dcEn: "Direct cremation, purchaser container.",
      ibEs: "Entierro inmediato, ataúd del comprador.",
      ibEn: "Immediate burial, purchaser casket.",
      memCell: cell(4745, "Plan simplificado: memorial después de cremación. Urna aparte.", "Simplified plan: memorial after cremation. Urn extra."),
      trCell: cell(5945, "Plan simplificado: funeral. Ataúd y lote aparte.", "Simplified plan: funeral. Casket and plot extra."),
    },
    {
      id: "ppd",
      name: "Parker-Price & Davidson",
      href: "https://www.parkerpriceanddavidson.com/",
      addr: "245 NW Independence Ave · 785-234-5850",
      dc: 1895,
      ib: 3120,
      trad: 5945,
      dcEs: "Cremación directa, contenedor del comprador.",
      dcEn: "Direct cremation, purchaser container.",
      ibEs: "Entierro inmediato, ataúd del comprador.",
      ibEn: "Immediate burial, purchaser casket.",
      memCell: cell(4745, "Plan simplificado: memorial después de cremación. Urna aparte.", "Simplified plan: memorial after cremation. Urn extra."),
      trCell: cell(5945, "Plan simplificado: funeral. Ataúd y lote aparte.", "Simplified plan: funeral. Casket and plot extra."),
    },
    {
      id: "dove",
      name: "Dove",
      href: "https://www.dovetopeka.com/",
      addr: "3700 SW Wanamaker Rd · 785-272-9797",
      dc: 1895,
      ib: 3120,
      trad: 5945,
      dcEs: "Cremación directa, contenedor del comprador.",
      dcEn: "Direct cremation, purchaser container.",
      ibEs: "Entierro inmediato, ataúd del comprador.",
      ibEn: "Immediate burial, purchaser casket.",
      memCell: cell(4745, "Plan simplificado: memorial después de cremación. Urna aparte.", "Simplified plan: memorial after cremation. Urn extra."),
      trCell: cell(5945, "Plan simplificado: funeral. Ataúd y lote aparte.", "Simplified plan: funeral. Casket and plot extra."),
    },
  ],
});

const lawrence = makeCity({
  slug: "lawrence",
  nameEs: "Lawrence",
  nameEn: "Lawrence",
  heroFile: "lawrence-ku-campanile",
  heroCaptionEs:
    "Campanile conmemorativo de la Universidad de Kansas, Lawrence — torre de 120 pies en piedra caliza de Kansas, dedicada en 1951 a quienes de la comunidad de KU murieron en la Segunda Guerra Mundial.",
  heroCaptionEn:
    "University of Kansas Memorial Campanile, Lawrence — a 120-foot Kansas-limestone bell tower dedicated in 1951 to KU community members who died in World War II.",
  heroClass: "sc-hero--lawrence",
    heroW: 602,
    heroH: 900,
  nearbyGuides: [{ slug: "topeka", name: "Topeka" }],
  countyEs: "condado Douglas",
  countyEn: "Douglas County",
  metroEs: ["Lawrence", "Eudora", "Baldwin City", "Lecompton"],
  metroEn: ["Lawrence", "Eudora", "Baldwin City", "Lecompton"],
  metroTitleEs: "Área que atendemos en Lawrence",
  metroTitleEn: "Lawrence area we serve",
  prepaidCemEs: "Oak Hill, Memorial Park",
  prepaidCemEn: "Oak Hill, Memorial Park",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en los cementerios municipales (785-832-3451). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask the city cemeteries (785-832-3451) for the list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Warren-McElwain Lawrence y Eudora: la misma GPL 31 ago. 2026. Rumsey-Yost no publica una lista general de precios completa; no va en la tabla. Estimador: promedios Funeralocity de Kansas. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
    tableFootEn:
    "Warren-McElwain Lawrence and Eudora: the same GPL 31 Aug 2026. Rumsey-Yost does not publish a complete general price list, so it is not on the chart. Estimator: Kansas Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Oak Hill, Maple Grove y Memorial Park son municipales. Llame al 785-832-3451 y pida la lista actual por escrito.",
  officesNoteEn:
    "Oak Hill, Maple Grove, and Memorial Park are municipal. Call 785-832-3451 and ask for the current list in writing.",
  newListEs:
    "Los cementerios municipales de Lawrence no publican un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 785-832-3451.",
  newListEn:
    "Lawrence city cemeteries do not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 785-832-3451.",
  officesEs: [
    "<strong>Oak Hill Cemetery</strong> — 1605 Oak Hill Ave. Teléfono 785-832-3451.",
    "<strong>Memorial Park Cemetery</strong> — 1517 E 15th St. Teléfono 785-832-3451.",
    "<strong>Maple Grove Cemetery</strong> — 1710 N 3rd St. Teléfono 785-832-3451.",
  ],
  officesEn: [
    "<strong>Oak Hill Cemetery</strong> — 1605 Oak Hill Ave. Phone 785-832-3451.",
    "<strong>Memorial Park Cemetery</strong> — 1517 E 15th St. Phone 785-832-3451.",
    "<strong>Maple Grove Cemetery</strong> — 1710 N 3rd St. Phone 785-832-3451.",
  ],
  analysisSameEs:
    "Lawrence y Eudora de Warren-McElwain publican la misma GPL: funeral <strong>$6,890</strong> y memorial <strong>$5,040</strong>, sin ataúd. Rumsey-Yost no publica una lista completa, así que no va en la tabla. El promedio de Kansas (<strong>$8,640</strong>) suele incluir ataúd.",
    analysisSameEn:
    "Warren-McElwain’s Lawrence and Eudora chapels publish the same GPL: funeral <strong>$6,890</strong> and memorial <strong>$5,040</strong>, with no casket. Rumsey-Yost does not publish a complete list, so it is not on the chart. Kansas’s average (<strong>$8,640</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En los cementerios municipales llame al <strong>785-832-3451</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At the city cemeteries call <strong>785-832-3451</strong>.",
  resaleHref: GRAVE_KS,
  plotNew: 3000,
  plotResale: 1200,
  homes: [
    {
      id: "warren",
      name: "Warren-McElwain",
      href: "https://www.warrenmcelwain.com/",
      addr: "120 W 13th St · 785-843-1120",
      dc: 3075,
      ib: 5680,
      trad: 6890,
      dcEs: "Cremación directa, contenedor del comprador.",
      dcEn: "Direct cremation, purchaser container.",
      ibEs: "Entierro inmediato, ataúd del comprador.",
      ibEn: "Immediate burial, purchaser casket.",
      memCell: cell(5040, "Plan simplificado: memorial después de cremación. Urna aparte.", "Simplified plan: memorial after cremation. Urn extra."),
      trCell: cell(6890, "Plan simplificado: funeral. Ataúd y lote aparte.", "Simplified plan: funeral. Casket and plot extra."),
    },
    {
      id: "warreneu",
      name: "Warren-McElwain Eudora",
      href: "https://www.warrenmcelwain.com/",
      addr: "1003 John L. Williams Dr, Eudora · 785-542-3030",
      dc: 3075,
      ib: 5680,
      trad: 6890,
      dcEs: "Misma GPL que Lawrence. Cremación directa, contenedor del comprador.",
      dcEn: "Same GPL as Lawrence. Direct cremation, purchaser container.",
      ibEs: "Misma GPL que Lawrence. Entierro inmediato, ataúd del comprador.",
      ibEn: "Same GPL as Lawrence. Immediate burial, purchaser casket.",
      memCell: cell(5040, "Misma GPL: memorial después de cremación. Urna aparte.", "Same GPL: memorial after cremation. Urn extra."),
      trCell: cell(6890, "Misma GPL: funeral. Ataúd y lote aparte.", "Same GPL: funeral. Casket and plot extra."),
    },
  ],
  unpublishedHomes: [
    {
      name: "Rumsey-Yost",
      href: "https://rumsey-yost.com/",
      addr: "601 Indiana St",
      phone: "785-843-5111",
    },
  ],
});

const shawnee = makeCity({
  slug: "shawnee",
  nameEs: "Shawnee",
  nameEn: "Shawnee",
  heroFile: "shawnee-johnson-county-museum",
  heroCaptionEs: "Letrero de entrada del Johnson County Museum of History, Shawnee.",
  heroCaptionEn: "Johnson County Museum of History entry sign, Shawnee.",
  heroClass: "sc-hero--shawnee",
    heroW: 1200,
    heroH: 900,
  nearbyGuides: jocoNear("shawnee"),
  countyEs: "condado Johnson",
  countyEn: "Johnson County",
  metroEs: ["Shawnee", "Merriam", "De Soto", "Lake Quivira"],
  metroEn: ["Shawnee", "Merriam", "De Soto", "Lake Quivira"],
  metroTitleEs: "Área que atendemos en Shawnee",
  metroTitleEn: "Shawnee area we serve",
  prepaidCemEs: "Pleasant View",
  prepaidCemEn: "Pleasant View",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Pleasant View o en el cementerio de Shawnee (913-631-5200). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Pleasant View or Shawnee Cemetery (913-631-5200) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "La encuesta FCA-GKC 2025 transcribió las GPL de Amos Family (oct. 2024), Charter Shawnee Mission (nov. 2024) y Cedar Crest De Soto (ene. 2025): cremación directa, entierro inmediato y funeral estándar. No incluye un memorial después de cremación, así que esta tabla no las nombra. Estimador: promedios Funeralocity de Kansas. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "The FCA-GKC 2025 survey transcribed GPLs for Amos Family (Oct 2024), Charter Shawnee Mission (Nov 2024), and Cedar Crest De Soto (Jan 2025): direct cremation, immediate burial, and a standard funeral. It has no memorial-after-cremation package, so this table does not name them. Estimator: Kansas Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Los cementerios municipales de Shawnee los administra Parques y Recreación. No publican el lote en la web. Llame al 913-631-5200 y pida la lista actual por escrito.",
  officesNoteEn:
    "Shawnee city cemeteries are run by Parks and Recreation. They do not post plot prices online. Call 913-631-5200 and ask for the current list in writing.",
  newListEs:
    "Pleasant View y el cementerio de Shawnee no publican un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 913-631-5200.",
  newListEn:
    "Pleasant View and Shawnee Cemetery do not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 913-631-5200.",
  officesEs: [
    "<strong>Pleasant View Cemetery</strong> — 6025 Quivira Rd. Teléfono 913-631-5200.",
    "<strong>Cementerio de Shawnee</strong> — 11810 W 61st Terrace. El mismo teléfono de Parques: 913-631-5200.",
    "<strong>Cementerio de De Soto</strong> — para familias al oeste. Pida la lista en el ayuntamiento de De Soto.",
  ],
  officesEn: [
    "<strong>Pleasant View Cemetery</strong> — 6025 Quivira Rd. Phone 913-631-5200.",
    "<strong>Shawnee Cemetery</strong> — 11810 W 61st Terrace. Same Parks number: 913-631-5200.",
    "<strong>De Soto Cemetery</strong> — for families to the west. Ask De Soto city hall for the list.",
  ],
  analysisCheapEs: FCA_NO_MEM_CHEAP_ES,
  analysisCheapEn: FCA_NO_MEM_CHEAP_EN,
  faqCremationAEs: FCA_NO_MEM_FAQ_ES,
  faqCremationAEn: FCA_NO_MEM_FAQ_EN,
  unpublishedLeadEs: FCA_NO_MEM_LEAD_ES,
  unpublishedLeadEn: FCA_NO_MEM_LEAD_EN,
  analysisSameEs:
    "La encuesta no tiene un memorial después de cremación, así que Amos Family, Charter (Merriam) y Cedar Crest (De Soto) no van en la tabla. El funeral estándar de esa encuesta no es el mismo paquete que un memorial. El promedio de Kansas (<strong>$8,640</strong>) suele incluir ataúd.",
  analysisSameEn:
    "The survey has no memorial-after-cremation package, so Amos Family, Charter (Merriam), and Cedar Crest (De Soto) are not on the chart. That survey’s standard funeral is not the same package as a memorial. Kansas’s average (<strong>$8,640</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Pleasant View llame al <strong>913-631-5200</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Pleasant View call <strong>913-631-5200</strong>.",
  resaleHref: GRAVE_KS,
  plotNew: 3800,
  plotResale: 1600,
  homes: [],
  unpublishedHomes: [
    {
      name: "Amos Family",
      href: "https://www.amosfamily.com/",
      addr: "10901 Johnson Dr",
      phone: "913-631-5566",
    },
    {
      name: "Charter Shawnee Mission",
      href: "https://www.charterfunerals.com/",
      addr: "10250 Shawnee Mission Pkwy, Merriam",
      phone: "816-921-5555",
    },
    {
      name: "Cedar Crest",
      href: "https://www.cedarcrestmemorial.com/",
      addr: "32665 Lexington Ave, De Soto",
      phone: "913-583-1002",
    },
  ],
});

const lenexa = makeCity({
  slug: "lenexa",
  nameEs: "Lenexa",
  nameEn: "Lenexa",
  heroFile: "lenexa-city-center",
  heroCaptionEs: "Lenexa City Center, el distrito cívico y comercial de Lenexa.",
  heroCaptionEn: "Lenexa City Center, Lenexa’s civic and commercial district.",
  heroClass: "sc-hero--lenexa",
  heroW: 1600,
  heroH: 900,
  nearbyGuides: jocoNear("lenexa"),
  countyEs: "condado Johnson",
  countyEn: "Johnson County",
  metroEs: ["Lenexa", "De Soto", "Lake Quivira", "Shawnee"],
  metroEn: ["Lenexa", "De Soto", "Lake Quivira", "Shawnee"],
  metroTitleEs: "Área que atendemos en Lenexa",
  metroTitleEn: "Lenexa area we serve",
  prepaidCemEs: "cementerios del condado Johnson",
  prepaidCemEn: "Johnson County cemeteries",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Porter está en Lenexa; el lote se pide en el cementerio. También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Porter is in Lenexa; you buy the plot from the cemetery. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "La encuesta FCA-GKC 2025 transcribió la GPL de Porter Lenexa (ene. 2025): cremación directa, entierro inmediato y funeral estándar. No incluye un memorial después de cremación, así que esta tabla no la nombra. Bruce (Spring Hill) y Dengel (Louisburg) no están en el área de servicio de esta página. Estimador: promedios Funeralocity de Kansas. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "The FCA-GKC 2025 survey transcribed Porter Lenexa’s GPL (Jan 2025): direct cremation, immediate burial, and a standard funeral. It has no memorial-after-cremation package, so this table does not name that home. Bruce (Spring Hill) and Dengel (Louisburg) are not in this page’s service area. Estimator: Kansas Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Lenexa no tiene un cementerio municipal grande que publique precios. Llame a Porter o al cementerio que elija y pida la lista actual por escrito.",
  officesNoteEn:
    "Lenexa does not have a large city cemetery that posts prices. Call Porter or the cemetery you choose and ask for the current list in writing.",
  newListEs:
    "No hay una lista municipal de lote en Lenexa. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista en el cementerio que elija.",
  newListEn:
    "There is no city plot list in Lenexa. Opening and closing, the vault, and the marker are still extra. Ask the cemetery you choose for the list.",
  officesEs: [
    "<strong>Porter Funeral Home & Crematory</strong> — 8535 Monrovia St. Teléfono 913-438-6444. Pregunte qué cementerios atienden.",
    "<strong>De Soto Cemetery</strong> — al oeste de Lenexa. Pida la lista en el ayuntamiento de De Soto.",
    "<strong>Cementerio de Shawnee / Pleasant View</strong> — al este, en Shawnee. Teléfono 913-631-5200.",
  ],
  officesEn: [
    "<strong>Porter Funeral Home & Crematory</strong> — 8535 Monrovia St. Phone 913-438-6444. Ask which cemeteries they serve.",
    "<strong>De Soto Cemetery</strong> — west of Lenexa. Ask De Soto city hall for the list.",
    "<strong>Shawnee Cemetery / Pleasant View</strong> — east in Shawnee. Phone 913-631-5200.",
  ],
  analysisCheapEs: FCA_NO_MEM_CHEAP_ES,
  analysisCheapEn: FCA_NO_MEM_CHEAP_EN,
  faqCremationAEs: FCA_NO_MEM_FAQ_ES,
  faqCremationAEn: FCA_NO_MEM_FAQ_EN,
  unpublishedLeadEs: FCA_NO_MEM_LEAD_ES,
  unpublishedLeadEn: FCA_NO_MEM_LEAD_EN,
  analysisSameEs:
    "La encuesta no tiene un memorial después de cremación, así que Porter no va en la tabla. Bruce en Spring Hill y Dengel en Louisburg tampoco: no están en el área de servicio de Lenexa. El promedio de Kansas (<strong>$8,640</strong>) suele incluir ataúd.",
  analysisSameEn:
    "The survey has no memorial-after-cremation package, so Porter is not on the chart. Bruce in Spring Hill and Dengel in Louisburg are not on it either: they are not in Lenexa’s service area. Kansas’s average (<strong>$8,640</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Porter llame al <strong>913-438-6444</strong> y pregunte el cementerio.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Porter call <strong>913-438-6444</strong> and ask about the cemetery.",
  resaleHref: GRAVE_KS,
  plotNew: 3800,
  plotResale: 1600,
  homes: [],
  unpublishedHomes: [
    {
      name: "Porter Funeral Home & Crematory",
      href: "https://www.porterfuneralhome.com/",
      addr: "8535 Monrovia St",
      phone: "913-438-6444",
    },
  ],
});

const manhattan = makeCity({
  slug: "manhattan",
  nameEs: "Manhattan",
  nameEn: "Manhattan",
  heroFile: "manhattan-anderson-hall",
  heroCaptionEs: "Anderson Hall, Universidad Estatal de Kansas, Manhattan.",
  heroCaptionEn: "Anderson Hall, Kansas State University, Manhattan.",
  heroClass: "sc-hero--manhattan",
    heroW: 825,
    heroH: 900,
  nearbyGuides: [],
  countyEs: "condado Riley",
  countyEn: "Riley County",
  metroEs: ["Manhattan", "Ogden", "St. George", "Wamego", "Junction City"],
  metroEn: ["Manhattan", "Ogden", "St. George", "Wamego", "Junction City"],
  metroTitleEs: "Área que atendemos en Manhattan",
  metroTitleEn: "Manhattan area we serve",
  prepaidCemEs: "Sunrise Cemetery, Sunset Cemetery",
  prepaidCemEn: "Sunrise Cemetery, Sunset Cemetery",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Sunrise Cemetery (785-587-2780). Sunset ya no vende lotes nuevos. También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Sunrise Cemetery (785-587-2780) for its list. Sunset no longer sells new lots. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Las funerarias de Manhattan no publican una lista general de precios. Esta tabla usa listas del área de servicio: Johnson & Mass-Hinitt, Junction City, vigente 15 sep. 2026 (cremación directa del comprador $2,845; entierro inmediato $3,220; memorial $4,855; funeral $6,195); Campanella & Stewart, Wamego, vigente 1 nov. 2025 (cremación directa $4,320; entierro inmediato $3,745; memorial $4,955; funeral $6,195). Pida la lista en Manhattan: Yorgensen-Meloan-Londeen 785-539-7481; Irvin-Parkview 785-537-2110. Estimador: promedios Funeralocity de Kansas. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Manhattan funeral homes do not publish a general price list. This table uses lists from the service area: Johnson & Mass-Hinitt, Junction City, effective 15 Sep 2026 (purchaser direct cremation $2,845; immediate burial $3,220; memorial $4,855; funeral $6,195); Campanella & Stewart, Wamego, effective 1 Nov 2025 (direct cremation $4,320; immediate burial $3,745; memorial $4,955; funeral $6,195). Ask in Manhattan: Yorgensen-Meloan-Londeen 785-539-7481; Irvin-Parkview 785-537-2110. Estimator: Kansas Funeralocity averages. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Sunrise aún vende lotes. Sunset está agotado para terrenos nuevos. Llame al sexton: 785-587-2780.",
  officesNoteEn:
    "Sunrise still sells lots. Sunset is sold out for new ground. Call the sexton: 785-587-2780.",
  newListEs:
    "Sunrise Cemetery no publica un precio de partida del lote en la web. Sunset ya no vende espacios nuevos. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 785-587-2780.",
  newListEn:
    "Sunrise Cemetery does not publish a starting plot price online. Sunset no longer sells new spaces. Opening and closing, the vault, and the marker are still extra. Ask for the list: 785-587-2780.",
  officesEs: [
    "<strong>Sunrise Cemetery</strong> — 2901 Stagg Hill Rd. Teléfono 785-587-2780. Aún hay lotes.",
    "<strong>Sunset Cemetery</strong> — 301 Sunset Ave. Todos los lotes están vendidos. Teléfono 785-587-2780.",
    "<strong>Cementerios de Junction City</strong> — para familias al oeste, hacia Fort Riley. Pida la lista en el ayuntamiento de Junction City.",
  ],
  officesEn: [
    "<strong>Sunrise Cemetery</strong> — 2901 Stagg Hill Rd. Phone 785-587-2780. Lots are still sold.",
    "<strong>Sunset Cemetery</strong> — 301 Sunset Ave. All lots have been sold. Phone 785-587-2780.",
    "<strong>Junction City cemeteries</strong> — for families west toward Fort Riley. Ask Junction City hall for the list.",
  ],
  analysisSameEs:
    "Las dos casas de Manhattan no publican lista. Johnson & Mass-Hinitt (Junction City) y Campanella & Stewart (Wamego) sí. El funeral simplificado sale <strong>$6,195</strong> en ambas, sin ataúd; la cremación directa no: <strong>$2,845</strong> en Junction City y <strong>$4,320</strong> en Wamego. El promedio de entierro completo de Kansas (<strong>$8,640</strong>) suele incluir ataúd.",
  analysisSameEn:
    "Manhattan’s two homes do not publish a list. Johnson & Mass-Hinitt (Junction City) and Campanella & Stewart (Wamego) do. The simplified funeral is <strong>$6,195</strong> at both, with no casket; direct cremation is not: <strong>$2,845</strong> in Junction City and <strong>$4,320</strong> in Wamego. Kansas’s full-burial average (<strong>$8,640</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Sunrise llame al <strong>785-587-2780</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Sunrise call <strong>785-587-2780</strong>.",
  resaleHref: GRAVE_KS,
  plotNew: 2800,
  plotResale: 1000,
  unpublishedHomes: [
    {
      name: "Yorgensen-Meloan-Londeen",
      href: "https://www.ymlfuneralhome.com/",
      addr: "1616 Poyntz Ave",
      phone: "785-539-7481",
    },
    {
      name: "Irvin-Parkview",
      href: "https://www.irvinparkview.com/",
      addr: "1317 Poyntz Ave",
      phone: "785-537-2110",
    },
  ],
  homes: [
    {
      id: "jmh",
      name: "Johnson & Mass-Hinitt (Junction City)",
      href: "https://www.jmhcares.com/",
      addr: "203 N Washington St, Junction City · 785-762-3131",
      dc: 2845,
      ib: 3220,
      trad: 6195,
      dcEs: "Cremación directa, contenedor del comprador. Lista 15 sep. 2026.",
      dcEn: "Direct cremation, purchaser container. List 15 Sep 2026.",
      ibEs: "Entierro inmediato, ataúd del comprador.",
      ibEn: "Immediate burial, purchaser casket.",
      memCell: cell(
        4855,
        "Plan simplificado: memorial después de cremación. Urna aparte.",
        "Simplified plan: memorial after cremation. Urn extra."
      ),
      trCell: cell(6195, "Plan simplificado: funeral. Ataúd y lote aparte.", "Simplified plan: funeral. Casket and plot extra."),
    },
    {
      id: "campanella",
      name: "Campanella & Stewart (Wamego)",
      href: "https://www.campanellastewart.com/",
      addr: "4370 Salzer Rd, Wamego · 785-456-2233",
      dc: 4320,
      ib: 3745,
      trad: 6195,
      dcEs: "Cremación directa, sin servicio. Lista 1 nov. 2025. Contenedor aparte.",
      dcEn: "Direct cremation, no service. List 1 Nov 2025. Container extra.",
      ibEs: "Entierro inmediato, ataúd del comprador.",
      ibEn: "Immediate burial, purchaser casket.",
      memCell: cell(
        4955,
        "Servicio de recuerdo después de cremación. Urna aparte.",
        "Service of remembrance after cremation. Urn extra."
      ),
      trCell: cell(
        6195,
        "Funeral tradicional. Ataúd y lote aparte. Incluye carroza.",
        "Traditional burial services. Casket and plot extra. Hearse included."
      ),
    },
  ],
});

const all = [
  wichita,
  overlandPark,
  kansasCity,
  olathe,
  topeka,
  lawrence,
  shawnee,
  lenexa,
  manhattan,
];

module.exports = all;
module.exports.bySlug = Object.fromEntries(all.map((c) => [c.slug, c]));
