/**
 * Florida city guides — Funeralocity estimator column + named-home GPL columns
 * when published, burial-plot section with Grave Solutions resale data.
 */
const { makeCity, flNear } = require("./fl-factory");
const {
  ESTIMATOR_FOOT_ES,
  ESTIMATOR_FOOT_EN,
  SERVICE_AREA_LEAD_ES,
  SERVICE_AREA_LEAD_EN,
  newcomerOrlando,
  floridaMortuaryTampa,
  schnaussJax,
  hardageGiddensJax,
  caballeroMiami,
  hadleyDavisMiami,
  masponsMiami,
  browardFortLauderdale,
  kraeerFairchildFortLauderdale,
  browardFuneralChoices,
  lifesongTallahassee,
  quattlebaumWpb,
  bellAndClarkWpb,
  andersonMcQueenStPete,
  davidGrossStPete,
} = require("./fl-homes");
const {
  GRAVE_FL,
  plotOfficeListHtml,
  plotPriceRangeJacksonville,
  plotPriceRangeMiami,
  plotPriceRangeTampa,
  plotPriceRangeOrlando,
  plotPriceRangeStPetersburg,
  plotPriceRangeFortLauderdale,
  plotPriceRangeTallahassee,
  plotPriceRangeWestPalmBeach,
  JACKSONVILLE_PLOT_OFFICES,
  MIAMI_PLOT_OFFICES,
  TAMPA_PLOT_OFFICES,
  ORLANDO_PLOT_OFFICES,
  ST_PETE_PLOT_OFFICES,
  FORT_LAUDERDALE_PLOT_OFFICES,
  TALLAHASSEE_PLOT_OFFICES,
  WEST_PALM_PLOT_OFFICES,
} = require("./fl-plot-shared");

const HERO = { heroVer: "landmark-v1", heroW: 1600, heroH: 900 };

module.exports = [
  makeCity({
    ...HERO,
    slug: "jacksonville",
    nameEn: "Jacksonville",
    heroFile: "jacksonville-skyline",
    heroClass: "sc-hero--jacksonville",
    heroCaptionEs: "Centro de Jacksonville",
    heroCaptionEn: "Downtown Jacksonville",
    countyEs: "condado de Duval",
    countyEn: "Duval County",
    metroEs: ["Jacksonville", "Orange Park", "Jacksonville Beach", "Atlantic Beach"],
    metroEn: ["Jacksonville", "Orange Park", "Jacksonville Beach", "Atlantic Beach"],
    metroTitleEs: "Jacksonville y el condado de Duval",
    metroTitleEn: "Jacksonville and Duval County",
    nearbyGuides: flNear("jacksonville"),
    prepaidCemEs: "Arlington Memorial Park, Chapel Hill Memory Gardens",
    prepaidCemEn: "Arlington Memorial Park, Chapel Hill Memory Gardens",
    homes: [schnaussJax(), hardageGiddensJax()],
    tableFootEs:
      "Schnauss NEFL (808 Margaret St): paquetes publicados en neflfuneral.com — cremación directa $895; entierro inmediato $2,495; memorial con cremación $2,495; funeral completo $4,495 (ataúd mínimo desde $600 aparte en entierro). Hardage-Giddens Chapel Hills: GPL Dignity 3 mar. 2026 — cremación directa $3,395 y entierro inmediato $4,895; no publica en esa lista un total de memorial o funeral tradicional empaquetado." +
      ESTIMATOR_FOOT_ES,
    tableFootEn:
      "Schnauss NEFL (808 Margaret St): packages published on neflfuneral.com — direct cremation $895; immediate burial $2,495; cremation with memorial $2,495; full-service funeral $4,495 (minimum casket from $600 extra on burial packages). Hardage-Giddens Chapel Hills: Dignity GPL 3 Mar 2026 — direct cremation $3,395 and immediate burial $4,895; that list does not publish a packaged memorial or traditional-funeral total." +
      ESTIMATOR_FOOT_EN,
    analysisSameEs:
      "Schnauss publica los cuatro paquetes (cremación directa desde <strong>$895</strong>; funeral completo <strong>$4,495</strong>). Hardage-Giddens publica cremación directa desde <strong>$3,395</strong> y entierro inmediato desde <strong>$4,895</strong>. El promedio de Florida (<strong>$5,971</strong> / <strong>$8,399</strong>) no es el paquete de una casa.",
    analysisSameEn:
      "Schnauss publishes all four packages (direct cremation from <strong>$895</strong>; full-service funeral <strong>$4,495</strong>). Hardage-Giddens publishes direct cremation from <strong>$3,395</strong> and immediate burial from <strong>$4,895</strong>. Florida averages (<strong>$5,971</strong> / <strong>$8,399</strong>) are not one home’s package.",
    analysisPlotEs:
      "Ninguna cifra de la tabla es propiedad en cementerio. En Jacksonville los anuncios suelen caer entre <strong>$2,000</strong> (reventa) y <strong>$5,995</strong> (lista citada) por espacio; lotes históricos o pares pueden pedir <strong>$8,000–$10,000</strong>.",
    analysisPlotEn:
      "None of the chart figures are cemetery property. In Jacksonville, ads often fall between <strong>$2,000</strong> (resale) and <strong>$5,995</strong> (cited list) per space; historic lots or pairs can ask <strong>$8,000–$10,000</strong>.",
    faqPlotEs:
      "No. El precio de la funeraria no compra el espacio. En Jacksonville la reventa suele empezar cerca de $2,000 y la lista citada en anuncios cerca de $5,995 por espacio. Pida la lista por escrito. Los anuncios están en Grave Solutions Florida.",
    faqPlotEn:
      "No. The funeral-home price does not buy the space. In Jacksonville, resale often starts near $2,000 and cited list prices near $5,995 per space. Ask for the list in writing. Ads are on Grave Solutions Florida.",
    officesNoteEs: "Las cifras de reventa son anuncios de particulares, no la lista del cementerio.",
    officesNoteEn: "Resale figures are private ads, not the cemetery’s price list.",
    newListEs:
      "El 15 de octubre de 2026, Grave Solutions mostraba reventas en Chapel Hill (~$2,000; lista citada ~$5,995), Arlington Memorial (~$4,000 doble profundidad), Oaklawn histórico (~$8,000) y Greenlawn (dos espacios ~$10,000).",
    newListEn:
      "On October 15, 2026, Grave Solutions showed Chapel Hill resales (~$2,000; cited list ~$5,995), Arlington Memorial (~$4,000 double depth), historic Oaklawn (~$8,000), and Greenlawn (two spaces ~$10,000).",
    plotPriceRange: plotPriceRangeJacksonville("Jacksonville", "Jacksonville"),
    plotNew: 5995,
    plotResale: 2000,
    plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — anuncios citan ~$5,995)",
    plotNewLabelEn: "New, from the cemetery office (ask for the list — ads cite about $5,995)",
    plotOffices: JACKSONVILLE_PLOT_OFFICES,
    officesEs: plotOfficeListHtml(JACKSONVILLE_PLOT_OFFICES, "es"),
    officesEn: plotOfficeListHtml(JACKSONVILLE_PLOT_OFFICES, "en"),
    resaleHref: GRAVE_FL,
  }),

  makeCity({
    ...HERO,
    slug: "miami",
    nameEn: "Miami",
    heroFile: "miami-skyline",
    heroClass: "sc-hero--miami",
    heroCaptionEs: "Centro de Miami desde Brickell",
    heroCaptionEn: "Downtown Miami from Brickell",
    countyEs: "condado de Miami-Dade",
    countyEn: "Miami-Dade County",
    metroEs: ["Miami", "Hialeah", "Coral Gables", "Miami Beach"],
    metroEn: ["Miami", "Hialeah", "Coral Gables", "Miami Beach"],
    metroTitleEs: "Miami y Miami-Dade",
    metroTitleEn: "Miami and Miami-Dade",
    nearbyGuides: flNear("miami"),
    prepaidCemEs: "Caballero Rivero Woodland Park South, Woodlawn West",
    prepaidCemEn: "Caballero Rivero Woodland Park South, Woodlawn West",
    homes: [hadleyDavisMiami(), masponsMiami(), caballeroMiami()],
    tableFootEs:
      "Hadley Davis (NW 62nd St / Miami Gardens): paquetes en hadleydavisfuneralhome.com — cremación directa $695; entierro directo $2,691 (ataúd incluido); Cremation Service $2,146; Burial Service $2,991. Maspons (SW 8th St / Westchester): Direct Cremation $1,977; Silver Cremation $4,432; Basic Burial $5,180 (ataúd incluido); no publica entierro inmediato empaquetado. Caballero Rivero Little Havana: GPL Dignity 7 jul. 2026 — cremación directa $1,995 y entierro inmediato $4,425." +
      ESTIMATOR_FOOT_ES,
    tableFootEn:
      "Hadley Davis (NW 62nd St / Miami Gardens): packages on hadleydavisfuneralhome.com — direct cremation $695; direct burial $2,691 (casket included); Cremation Service $2,146; Burial Service $2,991. Maspons (SW 8th St / Westchester): Direct Cremation $1,977; Silver Cremation $4,432; Basic Burial $5,180 (casket included); no packaged immediate burial. Caballero Rivero Little Havana: Dignity GPL 7 Jul 2026 — direct cremation $1,995 and immediate burial $4,425." +
      ESTIMATOR_FOOT_EN,
    analysisSameEs:
      "Hadley Davis publica cremación directa desde <strong>$695</strong> y funeral con ataúd desde <strong>$2,991</strong>. Maspons publica memorial Silver <strong>$4,432</strong> y Basic Burial <strong>$5,180</strong>. Caballero Rivero publica cremación directa desde <strong>$1,995</strong>.",
    analysisSameEn:
      "Hadley Davis publishes direct cremation from <strong>$695</strong> and a funeral with casket from <strong>$2,991</strong>. Maspons publishes Silver memorial <strong>$4,432</strong> and Basic Burial <strong>$5,180</strong>. Caballero Rivero publishes direct cremation from <strong>$1,995</strong>.",
    analysisPlotEs:
      "El lote no está en la tabla. En Woodland Park South, criptas de doble profundidad se pedían ~$8,500–$10,000 en oct. 2026; nichos desde ~$6,000.",
    analysisPlotEn:
      "The plot is not in the chart. At Woodland Park South, double-depth crypts asked about $8,500–$10,000 in Oct 2026; niches from about $6,000.",
    faqPlotEs:
      "No. El lote es otra factura. Caballero Rivero Woodland Park South, Woodlawn West y Dade aparecen en reventas de Miami. Pida la lista por escrito.",
    faqPlotEn:
      "No. The plot is a separate bill. Caballero Rivero Woodland Park South, Woodlawn West, and Dade show up in Miami resales. Ask for the list in writing.",
    officesNoteEs: "Las criptas de reventa no son un precio de lote nuevo de la oficina.",
    officesNoteEn: "Resale crypts are not a new-lot price from the office.",
    newListEs:
      "El 15 de octubre de 2026, Grave Solutions mostraba nichos ~$6,000, criptas de doble profundidad ~$8,500–$10,000 y criptas de mausoleo ~$16,000 en cementerios Caballero Rivero.",
    newListEn:
      "On October 15, 2026, Grave Solutions showed niches about $6,000, double-depth crypts about $8,500–$10,000, and mausoleum crypts about $16,000 at Caballero Rivero cemeteries.",
    plotPriceRange: plotPriceRangeMiami("Miami", "Miami"),
    plotNew: null,
    plotResale: 8500,
    plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista)",
    plotNewLabelEn: "New, from the cemetery office (ask for the list)",
    plotOffices: MIAMI_PLOT_OFFICES,
    officesEs: plotOfficeListHtml(MIAMI_PLOT_OFFICES, "es"),
    officesEn: plotOfficeListHtml(MIAMI_PLOT_OFFICES, "en"),
    resaleHref: GRAVE_FL,
  }),

  makeCity({
    ...HERO,
    slug: "tampa",
    nameEn: "Tampa",
    heroFile: "tampa-skyline",
    heroClass: "sc-hero--tampa",
    heroCaptionEs: "Centro de Tampa",
    heroCaptionEn: "Downtown Tampa",
    countyEs: "condado de Hillsborough",
    countyEn: "Hillsborough County",
    metroEs: ["Tampa", "Brandon", "Temple Terrace", "Plant City"],
    metroEn: ["Tampa", "Brandon", "Temple Terrace", "Plant City"],
    metroTitleEs: "Tampa y Hillsborough",
    metroTitleEn: "Tampa and Hillsborough",
    nearbyGuides: flNear("tampa"),
    prepaidCemEs: "Hillsborough Memorial Gardens",
    prepaidCemEn: "Hillsborough Memorial Gardens",
    homes: [floridaMortuaryTampa()],
    tableFootEs:
      "Florida Mortuary (Tampa): GPL 7 may. 2026 — cremación directa $1,510 y entierro inmediato $3,115; paquete Legacy memorial $3,475; Eternal burial $8,530 (allowance de ataúd $2,300)." +
      ESTIMATOR_FOOT_ES,
    tableFootEn:
      "Florida Mortuary (Tampa): GPL 7 May 2026 — direct cremation $1,510 and immediate burial $3,115; Legacy memorial package $3,475; Eternal burial $8,530 ($2,300 casket allowance)." +
      ESTIMATOR_FOOT_EN,
    analysisSameEs:
      "Florida Mortuary publica cremación directa desde <strong>$1,510</strong>. Su memorial Legacy está en <strong>$3,475</strong> y el entierro Eternal en <strong>$8,530</strong> (con allowance de ataúd).",
    analysisSameEn:
      "Florida Mortuary publishes direct cremation from <strong>$1,510</strong>. Its Legacy memorial is <strong>$3,475</strong> and Eternal burial is <strong>$8,530</strong> (with a casket allowance).",
    analysisPlotEs:
      "En Hillsborough Memorial Gardens (Brandon), un anuncio pedía <strong>$3,700</strong> por dos espacios y citó ~$8,000 por espacio en lista. En Myrtle Hill, reventas desde ~$3,000 por espacio.",
    analysisPlotEn:
      "At Hillsborough Memorial Gardens (Brandon), an ad asked <strong>$3,700</strong> for two spaces and cited about $8,000 per space on the list. At Myrtle Hill, resales start near $3,000 per space.",
    faqPlotEs:
      "No. El lote es aparte. Hillsborough Memorial Gardens y Myrtle Hill aparecen en reventas del área de Tampa. Pida la lista por escrito.",
    faqPlotEn:
      "No. The plot is separate. Hillsborough Memorial Gardens and Myrtle Hill show up in Tampa-area resales. Ask for the list in writing.",
    officesNoteEs: "La cifra de $3,700 es un anuncio de dos espacios, no un lote nuevo de la oficina.",
    officesNoteEn: "The $3,700 figure is a two-space ad, not a new lot from the office.",
    newListEs:
      "El 15 de octubre de 2026, Grave Solutions mostraba dos espacios en Hillsborough Memorial Gardens a $3,700 (lista citada ~$8,000) y espacios en Myrtle Hill desde ~$3,000 cada uno.",
    newListEn:
      "On October 15, 2026, Grave Solutions showed two spaces at Hillsborough Memorial Gardens for $3,700 (cited list about $8,000) and Myrtle Hill spaces from about $3,000 each.",
    plotPriceRange: plotPriceRangeTampa("Tampa", "Tampa"),
    plotNew: 8000,
    plotResale: 3000,
    plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — anuncios citan ~$8,000)",
    plotNewLabelEn: "New, from the cemetery office (ask for the list — ads cite about $8,000)",
    plotOffices: TAMPA_PLOT_OFFICES,
    officesEs: plotOfficeListHtml(TAMPA_PLOT_OFFICES, "es"),
    officesEn: plotOfficeListHtml(TAMPA_PLOT_OFFICES, "en"),
    resaleHref: GRAVE_FL,
  }),

  makeCity({
    ...HERO,
    slug: "orlando",
    nameEn: "Orlando",
    heroFile: "orlando-skyline",
    heroClass: "sc-hero--orlando",
    heroCaptionEs: "Centro de Orlando",
    heroCaptionEn: "Downtown Orlando",
    countyEs: "condado de Orange",
    countyEn: "Orange County",
    metroEs: ["Orlando", "Winter Park", "Longwood", "Apopka"],
    metroEn: ["Orlando", "Winter Park", "Longwood", "Apopka"],
    metroTitleEs: "Orlando y el centro de Florida",
    metroTitleEn: "Orlando and Central Florida",
    nearbyGuides: flNear("orlando"),
    prepaidCemEs: "Chapel Hill Cemetery, Glen Haven, Highland Memory Gardens",
    prepaidCemEn: "Chapel Hill Cemetery, Glen Haven, Highland Memory Gardens",
    homes: [newcomerOrlando()],
    tableFootEs:
      "Newcomer Orlando: GPL 10 sep. 2026 — cremación directa $1,445 y entierro inmediato $2,745; memorial Celebration of Life $3,335; Funeral Ceremony $3,995 (ataúd aparte)." +
      ESTIMATOR_FOOT_ES,
    tableFootEn:
      "Newcomer Orlando: GPL 10 Sep 2026 — direct cremation $1,445 and immediate burial $2,745; Celebration of Life memorial $3,335; Funeral Ceremony $3,995 (casket extra)." +
      ESTIMATOR_FOOT_EN,
    analysisSameEs:
      "Newcomer publica la cremación directa más baja de esta tabla (<strong>$1,445</strong>). Su funeral con velatorio está en <strong>$3,995</strong> sin ataúd.",
    analysisSameEn:
      "Newcomer publishes the lowest direct cremation on this chart (<strong>$1,445</strong>). Its funeral with visitation is <strong>$3,995</strong> without a casket.",
    analysisPlotEs:
      "En Chapel Hill Cemetery, dos lotes con bóvedas se pedían <strong>$12,000</strong> en oct. 2026. Highland Memory Gardens mostraba paquetes de dos espacios ~$5,500; pares sin bóveda desde ~$4,800.",
    analysisPlotEn:
      "At Chapel Hill Cemetery, two lots with vaults asked <strong>$12,000</strong> in Oct 2026. Highland Memory Gardens showed two-space packages around $5,500; pairs without vaults from about $4,800.",
    faqPlotEs:
      "No. El lote es aparte. Chapel Hill, Woodlawn y Highland Memory Gardens aparecen en reventas del área de Orlando.",
    faqPlotEn:
      "No. The plot is separate. Chapel Hill, Woodlawn, and Highland Memory Gardens show up in Orlando-area resales.",
    officesNoteEs: "Los paquetes con bóveda no son un precio de lote sencillo de la oficina.",
    officesNoteEn: "Packages that include vaults are not a plain new-lot office price.",
    newListEs:
      "El 15 de octubre de 2026, Grave Solutions mostraba pares en Chapel Hill desde ~$4,800, paquetes Highland ~$5,500 y dos lotes con bóvedas en Chapel Hill a $12,000.",
    newListEn:
      "On October 15, 2026, Grave Solutions showed Chapel Hill pairs from about $4,800, Highland packages about $5,500, and two Chapel Hill lots with vaults at $12,000.",
    plotPriceRange: plotPriceRangeOrlando("Orlando", "Orlando"),
    plotNew: null,
    plotResale: 5500,
    plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista)",
    plotNewLabelEn: "New, from the cemetery office (ask for the list)",
    plotOffices: ORLANDO_PLOT_OFFICES,
    officesEs: plotOfficeListHtml(ORLANDO_PLOT_OFFICES, "es"),
    officesEn: plotOfficeListHtml(ORLANDO_PLOT_OFFICES, "en"),
    resaleHref: GRAVE_FL,
  }),

  makeCity({
    ...HERO,
    slug: "st-petersburg",
    nameEn: "St. Petersburg",
    nameEs: "St. Petersburg",
    heroFile: "st-petersburg-skyline",
    heroClass: "sc-hero--st-petersburg",
    heroCaptionEs: "St. Petersburg, Pinellas",
    heroCaptionEn: "St. Petersburg, Pinellas",
    countyEs: "condado de Pinellas",
    countyEn: "Pinellas County",
    metroEs: ["St. Petersburg", "Clearwater", "Largo", "Pinellas Park"],
    metroEn: ["St. Petersburg", "Clearwater", "Largo", "Pinellas Park"],
    metroTitleEs: "St. Petersburg y Pinellas",
    metroTitleEn: "St. Petersburg and Pinellas",
    nearbyGuides: flNear("st-petersburg"),
    prepaidCemEs: "Memorial Park, Royal Palm North",
    prepaidCemEn: "Memorial Park, Royal Palm North",
    homes: [davidGrossStPete(), andersonMcQueenStPete(), floridaMortuaryTampa()],
    unpublishedLeadEs: SERVICE_AREA_LEAD_ES,
    unpublishedLeadEn: SERVICE_AREA_LEAD_EN,
    tableFootEs:
      "David C. Gross y Anderson-McQueen (St. Petersburg): GPL 7 may. 2026 — cremación directa $3,830 / $4,040; entierro inmediato $4,680 / $5,725. Florida Mortuary (Tampa, área de servicio) publica también memorial Legacy $3,475 y Eternal burial $8,530." +
      ESTIMATOR_FOOT_ES,
    tableFootEn:
      "David C. Gross and Anderson-McQueen (St. Petersburg): GPL 7 May 2026 — direct cremation $3,830 / $4,040; immediate burial $4,680 / $5,725. Florida Mortuary (Tampa, service area) also publishes Legacy memorial $3,475 and Eternal burial $8,530." +
      ESTIMATOR_FOOT_EN,
    analysisSameEs:
      "Gross publica cremación directa desde <strong>$3,830</strong>. Florida Mortuary (Tampa) está en la tabla porque publica memorial y funeral empaquetados para el área Tampa Bay; no está dentro de St. Petersburg.",
    analysisSameEn:
      "Gross publishes direct cremation from <strong>$3,830</strong>. Florida Mortuary (Tampa) is on the chart because it publishes packaged memorial and burial totals for the Tampa Bay area; it is not inside St. Petersburg city limits.",
    analysisPlotEs:
      "En Memorial Park, reventas pedían ~$2,500 por espacio en oct. 2026. En Royal Palm North, un paquete con bóvedas ~$3,000 y criptas de mausoleo ~$8,000.",
    analysisPlotEn:
      "At Memorial Park, resales asked about $2,500 per space in Oct 2026. At Royal Palm North, a vault package was about $3,000 and mausoleum crypts about $8,000.",
    faqPlotEs:
      "No. El lote es aparte. Memorial Park y Royal Palm North aparecen en reventas de St. Petersburg. Pida la lista por escrito.",
    faqPlotEn:
      "No. The plot is separate. Memorial Park and Royal Palm North show up in St. Petersburg resales. Ask for the list in writing.",
    officesNoteEs: "Las cifras de reventa no son un precio de lote nuevo de la oficina.",
    officesNoteEn: "Resale figures are not a new-lot price from the office.",
    newListEs:
      "El 15 de octubre de 2026, Grave Solutions mostraba espacios en Memorial Park a ~$2,500 cada uno y paquetes en Royal Palm North desde ~$3,000.",
    newListEn:
      "On October 15, 2026, Grave Solutions showed Memorial Park spaces at about $2,500 each and Royal Palm North packages from about $3,000.",
    plotPriceRange: plotPriceRangeStPetersburg("St. Petersburg", "St. Petersburg"),
    plotNew: null,
    plotResale: 2500,
    plotOffices: ST_PETE_PLOT_OFFICES,
    officesEs: plotOfficeListHtml(ST_PETE_PLOT_OFFICES, "es"),
    officesEn: plotOfficeListHtml(ST_PETE_PLOT_OFFICES, "en"),
    resaleHref: GRAVE_FL,
  }),

  makeCity({
    ...HERO,
    slug: "fort-lauderdale",
    nameEn: "Fort Lauderdale",
    heroFile: "fort-lauderdale-skyline",
    heroClass: "sc-hero--fort-lauderdale",
    heroCaptionEs: "Centro de Fort Lauderdale",
    heroCaptionEn: "Downtown Fort Lauderdale",
    countyEs: "condado de Broward",
    countyEn: "Broward County",
    metroEs: ["Fort Lauderdale", "Oakland Park", "Hollywood", "Pompano Beach", "Davie"],
    metroEn: ["Fort Lauderdale", "Oakland Park", "Hollywood", "Pompano Beach", "Davie"],
    metroTitleEs: "Fort Lauderdale y Broward",
    metroTitleEn: "Fort Lauderdale and Broward",
    nearbyGuides: flNear("fort-lauderdale"),
    prepaidCemEs: "Evergreen Cemetery, Lauderdale Memorial Park",
    prepaidCemEn: "Evergreen Cemetery, Lauderdale Memorial Park",
    homes: [browardFuneralChoices(), browardFortLauderdale(), kraeerFairchildFortLauderdale()],
    unpublishedLeadEs: SERVICE_AREA_LEAD_ES,
    unpublishedLeadEn: SERVICE_AREA_LEAD_EN,
    tableFootEs:
      "Broward Funeral Choices (3776 W Oakland Park Blvd, Oakland Park): paquetes publicados en browardfuneralchoices.com — cremación directa $995; Graveside / Direct Burial $3,295 (ataúd incluido); Viewing followed by Cremation $3,995; Funeral Service Packages desde $4,495 (ataúd incluido; cementerio aparte). Broward Burial & Cremation: GPL Dignity 3 ago. 2026 — cremación directa $2,465 y entierro inmediato $3,195. Kraeer-Fairchild: misma fecha — cremación directa $3,170 y entierro inmediato $5,095; esas dos listas Dignity no publican memorial ni funeral tradicional empaquetados." +
      ESTIMATOR_FOOT_ES,
    tableFootEn:
      "Broward Funeral Choices (3776 W Oakland Park Blvd, Oakland Park): packages published on browardfuneralchoices.com — direct cremation $995; Graveside / Direct Burial $3,295 (casket included); Viewing followed by Cremation $3,995; Funeral Service Packages from $4,495 (casket included; cemetery separate). Broward Burial & Cremation: Dignity GPL 3 Aug 2026 — direct cremation $2,465 and immediate burial $3,195. Kraeer-Fairchild: same date — direct cremation $3,170 and immediate burial $5,095; those Dignity lists do not publish packaged memorial or traditional-funeral totals." +
      ESTIMATOR_FOOT_EN,
    analysisSameEs:
      "Broward Funeral Choices publica los cuatro paquetes (cremación directa desde <strong>$995</strong>; funeral desde <strong>$4,495</strong>). Broward Burial & Cremation y Kraeer-Fairchild publican solo cremación directa e entierro inmediato en sus GPL Dignity.",
    analysisSameEn:
      "Broward Funeral Choices publishes all four packages (direct cremation from <strong>$995</strong>; funeral from <strong>$4,495</strong>). Broward Burial & Cremation and Kraeer-Fairchild publish only direct cremation and immediate burial on their Dignity GPLs.",
    analysisPlotEs:
      "En Evergreen / Lauderdale Memorial, un anuncio pedía <strong>$16,000</strong> por dos espacios interiores y citó ~$8,745 por espacio nuevo en el borde. Reventas más bajas desde ~$3,000–$4,000 por espacio.",
    analysisPlotEn:
      "At Evergreen / Lauderdale Memorial, an ad asked <strong>$16,000</strong> for two interior spaces and cited about $8,745 per new edge space. Lower resales start near $3,000–$4,000 per space.",
    faqPlotEs:
      "No. El lote es aparte. Evergreen, Lauderdale Memorial y Forest Lawn aparecen en reventas de Fort Lauderdale.",
    faqPlotEn:
      "No. The plot is separate. Evergreen, Lauderdale Memorial, and Forest Lawn show up in Fort Lauderdale resales.",
    officesNoteEs: "La cifra de $16,000 es un anuncio de dos espacios interiores.",
    officesNoteEn: "The $16,000 figure is an ad for two interior spaces.",
    newListEs:
      "El 15 de octubre de 2026, Grave Solutions mostraba espacios desde ~$3,000–$4,000, lista citada ~$8,745 en Evergreen, y dos espacios interiores a $16,000.",
    newListEn:
      "On October 15, 2026, Grave Solutions showed spaces from about $3,000–$4,000, a cited Evergreen list about $8,745, and two interior spaces at $16,000.",
    plotPriceRange: plotPriceRangeFortLauderdale("Fort Lauderdale", "Fort Lauderdale"),
    plotNew: 8745,
    plotResale: 4000,
    plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — anuncios citan ~$8,745)",
    plotNewLabelEn: "New, from the cemetery office (ask for the list — ads cite about $8,745)",
    plotOffices: FORT_LAUDERDALE_PLOT_OFFICES,
    officesEs: plotOfficeListHtml(FORT_LAUDERDALE_PLOT_OFFICES, "es"),
    officesEn: plotOfficeListHtml(FORT_LAUDERDALE_PLOT_OFFICES, "en"),
    resaleHref: GRAVE_FL,
  }),

  makeCity({
    ...HERO,
    slug: "tallahassee",
    nameEn: "Tallahassee",
    heroFile: "tallahassee-capitol",
    heroClass: "sc-hero--tallahassee",
    heroCaptionEs: "Capitolio de Florida, Tallahassee",
    heroCaptionEn: "Florida State Capitol, Tallahassee",
    countyEs: "condado de Leon",
    countyEn: "Leon County",
    metroEs: ["Tallahassee", "Quincy", "Crawfordville", "Midway"],
    metroEn: ["Tallahassee", "Quincy", "Crawfordville", "Midway"],
    metroTitleEs: "Tallahassee y Leon",
    metroTitleEn: "Tallahassee and Leon",
    nearbyGuides: flNear("tallahassee"),
    prepaidCemEs: "MeadowWood Memorial Park, Tallahassee Memory Gardens",
    prepaidCemEn: "MeadowWood Memorial Park, Tallahassee Memory Gardens",
    homes: [lifesongTallahassee()],
    tableFootEs:
      "Lifesong Funerals & Cremations (Tallahassee / Quincy): GPL 15 jun. 2025 — cremación directa $2,200; entierro inmediato $2,855; memorial con cremación $3,860; Traditional Burial Service $5,380 (ataúd aparte)." +
      ESTIMATOR_FOOT_ES,
    tableFootEn:
      "Lifesong Funerals & Cremations (Tallahassee / Quincy): GPL 15 Jun 2025 — direct cremation $2,200; immediate burial $2,855; cremation with memorial $3,860; Traditional Burial Service $5,380 (casket extra)." +
      ESTIMATOR_FOOT_EN,
    analysisSameEs:
      "Lifesong publica cremación directa desde <strong>$2,200</strong> y funeral tradicional desde <strong>$5,380</strong> sin ataúd. El promedio de Florida (<strong>$8,399</strong>) suele incluir ataúd típico.",
    analysisSameEn:
      "Lifesong publishes direct cremation from <strong>$2,200</strong> and traditional burial from <strong>$5,380</strong> without a casket. Florida’s average (<strong>$8,399</strong>) usually includes a typical casket.",
    analysisPlotEs:
      "En Tallahassee Memory Gardens, reventas pedían ~$1,200 por espacio. En MeadowWood, ~$5,995 por espacio (lista citada ~$6,995); paquetes con bóvedas hasta ~$16,000.",
    analysisPlotEn:
      "At Tallahassee Memory Gardens, resales asked about $1,200 per space. At MeadowWood, about $5,995 per space (cited list about $6,995); packages with vaults up to about $16,000.",
    faqPlotEs:
      "No. El lote es aparte. MeadowWood Memorial Park y Tallahassee Memory Gardens aparecen en reventas. Pida la lista por escrito.",
    faqPlotEn:
      "No. The plot is separate. MeadowWood Memorial Park and Tallahassee Memory Gardens show up in resales. Ask for the list in writing.",
    officesNoteEs: "Las cifras de reventa no son un precio de lote nuevo de la oficina.",
    officesNoteEn: "Resale figures are not a new-lot price from the office.",
    newListEs:
      "El 15 de octubre de 2026, Grave Solutions mostraba Memory Gardens a ~$1,200 por espacio y MeadowWood desde ~$5,995 (paquetes con bóvedas hasta ~$16,000).",
    newListEn:
      "On October 15, 2026, Grave Solutions showed Memory Gardens at about $1,200 per space and MeadowWood from about $5,995 (packages with vaults up to about $16,000).",
    plotPriceRange: plotPriceRangeTallahassee("Tallahassee", "Tallahassee"),
    plotNew: 6995,
    plotResale: 1200,
    plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — anuncios citan ~$6,995)",
    plotNewLabelEn: "New, from the cemetery office (ask for the list — ads cite about $6,995)",
    plotOffices: TALLAHASSEE_PLOT_OFFICES,
    officesEs: plotOfficeListHtml(TALLAHASSEE_PLOT_OFFICES, "es"),
    officesEn: plotOfficeListHtml(TALLAHASSEE_PLOT_OFFICES, "en"),
    resaleHref: GRAVE_FL,
  }),

  makeCity({
    ...HERO,
    slug: "west-palm-beach",
    nameEn: "West Palm Beach",
    heroFile: "west-palm-beach-skyline",
    heroClass: "sc-hero--west-palm-beach",
    heroCaptionEs: "West Palm Beach",
    heroCaptionEn: "West Palm Beach",
    countyEs: "condado de Palm Beach",
    countyEn: "Palm Beach County",
    metroEs: ["West Palm Beach", "Lake Worth", "Riviera Beach", "Palm Beach Gardens"],
    metroEn: ["West Palm Beach", "Lake Worth", "Riviera Beach", "Palm Beach Gardens"],
    metroTitleEs: "West Palm Beach y Palm Beach",
    metroTitleEn: "West Palm Beach and Palm Beach",
    nearbyGuides: flNear("west-palm-beach"),
    prepaidCemEs: "Hillcrest Memorial Park, Memory Gardens",
    prepaidCemEn: "Hillcrest Memorial Park, Memory Gardens",
    homes: [bellAndClarkWpb(), quattlebaumWpb()],
    tableFootEs:
      "Bell & Clark (Broadway Ave): Direct Cremation $695; Viewing with Cremation $3,250; Funeral Package desde $4,000 (ataúd calibre 20 incluido); no publica entierro inmediato empaquetado. Quattlebaum (Parker Ave / Hillcrest): GPL Dignity 3 ago. 2026 — cremación directa $3,495 y entierro inmediato $5,195." +
      ESTIMATOR_FOOT_ES,
    tableFootEn:
      "Bell & Clark (Broadway Ave): Direct Cremation $695; Viewing with Cremation $3,250; Funeral Package from $4,000 (20-gauge casket included); no packaged immediate burial. Quattlebaum (Parker Ave / Hillcrest): Dignity GPL 3 Aug 2026 — direct cremation $3,495 and immediate burial $5,195." +
      ESTIMATOR_FOOT_EN,
    analysisSameEs:
      "Bell & Clark publica cremación directa desde <strong>$695</strong> y funeral con ataúd desde <strong>$4,000</strong>. Quattlebaum publica cremación directa desde <strong>$3,495</strong> y entierro inmediato desde <strong>$5,195</strong>.",
    analysisSameEn:
      "Bell & Clark publishes direct cremation from <strong>$695</strong> and a funeral with casket from <strong>$4,000</strong>. Quattlebaum publishes direct cremation from <strong>$3,495</strong> and immediate burial from <strong>$5,195</strong>.",
    analysisPlotEs:
      "En Hillcrest Memorial Park, reventas pedían desde ~$1,500 por espacio; anuncios citan ~$5,410 en lista. Dos espacios juntos ~$7,000.",
    analysisPlotEn:
      "At Hillcrest Memorial Park, resales asked from about $1,500 per space; ads cite about $5,410 on the list. Two spaces together about $7,000.",
    faqPlotEs:
      "No. El lote es aparte. Hillcrest Memorial Park y Memory Gardens aparecen en reventas de West Palm Beach.",
    faqPlotEn:
      "No. The plot is separate. Hillcrest Memorial Park and Memory Gardens show up in West Palm Beach resales.",
    officesNoteEs: "Las cifras de reventa no son un precio de lote nuevo de la oficina.",
    officesNoteEn: "Resale figures are not a new-lot price from the office.",
    newListEs:
      "El 15 de octubre de 2026, Grave Solutions mostraba Hillcrest desde ~$1,500 por espacio (lista citada ~$5,410) y pares a ~$7,000; Memory Gardens dos espacios ~$3,500.",
    newListEn:
      "On October 15, 2026, Grave Solutions showed Hillcrest from about $1,500 per space (cited list about $5,410) and pairs at about $7,000; Memory Gardens two spaces about $3,500.",
    plotPriceRange: plotPriceRangeWestPalmBeach("West Palm Beach", "West Palm Beach"),
    plotNew: 5410,
    plotResale: 1500,
    plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — anuncios citan ~$5,410)",
    plotNewLabelEn: "New, from the cemetery office (ask for the list — ads cite about $5,410)",
    plotOffices: WEST_PALM_PLOT_OFFICES,
    officesEs: plotOfficeListHtml(WEST_PALM_PLOT_OFFICES, "es"),
    officesEn: plotOfficeListHtml(WEST_PALM_PLOT_OFFICES, "en"),
    resaleHref: GRAVE_FL,
  }),
];
