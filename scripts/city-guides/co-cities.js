const { makeCity, cell, frontRangeNear } = require("./co-factory");

const GRAVE_CO = "https://www.gravesolutions.com/for-sale/cemetery-properties/colorado";

const NO_GPL_LEAD_ES =
  "Estas funerarias no publican una lista general de precios completa (cremación directa, entierro inmediato, memorial y funeral tradicional) en internet. Llame y pida la lista general de precios vigente.";
const NO_GPL_LEAD_EN =
  "These funeral homes do not publish a complete general price list online (direct cremation, immediate burial, memorial, and traditional funeral). Call and ask for the current general price list.";
const NO_GPL_SAME_ES =
  "Ninguna funeraria de esta ciudad publica en internet los cuatro paquetes. El promedio de entierro completo de Colorado (<strong>$8,162</strong>) suele incluir ataúd; el de una casa concreta puede no incluirlo. Pida la lista vigente.";
const NO_GPL_SAME_EN =
  "No funeral home in this city publishes all four packages online. Colorado’s full-burial average (<strong>$8,162</strong>) usually includes a casket; a named home’s package may not. Ask for the current list.";

const newcomerPrices = {
  dc: 1690,
  ib: 2555,
  trad: 4095,
  dcEs: "Cremación directa con contenedor de cartón (GPL 14 sep. 2026). Urna aparte.",
  dcEn: "Direct cremation with cardboard container (GPL 14 Sep 2026). Urn extra.",
  ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
  ibEn: "Immediate burial, purchaser casket. Plot extra.",
  memCell: cell(
    3295,
    "Memorial después de cremación (plan simplificado del mismo GPL). Urna aparte.",
    "Memorial after cremation (simplified plan on the same GPL). Urn extra."
  ),
  trCell: cell(
    4095,
    "Funeral con velatorio el día anterior. Ataúd y lote aparte.",
    "Funeral with viewing the day before. Casket and plot extra."
  ),
};

function tributeCrem(amt) {
  return cell(
    amt,
    "Paquete Tribute de cremación: reunión sencilla, urna y contenedor Trayview. Sin velatorio con cuerpo.",
    "Tribute cremation package: simple gathering, urn, and Trayview container. No body present."
  );
}

function dignityHome({
  id,
  name,
  href,
  addr,
  dc,
  ib,
  trad,
  mem,
  dateEs,
  dateEn,
  tradEs,
  tradEn,
}) {
  const row = {
    id,
    name,
    href,
    addr,
    dc,
    ib,
    dcEs: `Cremación directa, contenedor del comprador (GPL ${dateEs}).`,
    dcEn: `Direct cremation, purchaser container (GPL ${dateEn}).`,
    ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
    ibEn: "Immediate burial, purchaser casket. Plot extra.",
  };
  if (mem != null) row.memCell = tributeCrem(mem);
  if (trad != null) {
    row.trad = trad;
    row.casketTrad = true;
    row.trCell = cell(trad, tradEs, tradEn);
  }
  return row;
}

const denver = makeCity({
  slug: "denver",
  nameEs: "Denver",
  nameEn: "Denver",
  heroFile: "denver-union-station",
  heroCaptionEs: "Union Station, Denver — fachada principal, Travel by Train.",
  heroCaptionEn: "Union Station, Denver — main facade, Travel by Train.",
  heroClass: "sc-hero--denver",
  heroW: 1349,
  heroH: 900,
  nearbyGuides: frontRangeNear("denver"),
  countyEs: "condado Denver",
  countyEn: "Denver County",
  metroEs: ["Denver", "Lakewood", "Wheat Ridge", "Thornton", "Englewood", "Sheridan"],
  metroEn: ["Denver", "Lakewood", "Wheat Ridge", "Thornton", "Englewood", "Sheridan"],
  metroTitleEs: "Área que atendemos en Denver",
  metroTitleEn: "Denver area we serve",
  prepaidCemEs: "Fairmount, Crown Hill",
  prepaidCemEn: "Fairmount, Crown Hill",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Fairmount (303-399-0692) o en Crown Hill (303-233-4611). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Fairmount (303-399-0692) or Crown Hill (303-233-4611) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Newcomer West Metro (Lakewood): GPL 14 sep. 2026. Olinger Hampden, Crown Hill y Highland: GPL y paquetes Dignity, 11 may. 2026. Estimador: promedios Funeralocity de Colorado. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Newcomer West Metro (Lakewood): GPL 14 Sep 2026. Olinger Hampden, Crown Hill, and Highland: Dignity GPL and package lists, 11 May 2026. Estimator: Colorado Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Fairmount y Crown Hill venden lotes. Ninguno publica el precio de partida en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Fairmount and Crown Hill sell plots. Neither publishes a starting plot price online. Call and ask for the current list in writing.",
  newListEs:
    "Quienes revenden en Fairmount suelen citar la lista del cementerio cerca de <strong>$5,900 a $9,200</strong> por espacio. Abrir y cerrar, bóveda y lápida siguen aparte.",
  newListEn:
    "People reselling at Fairmount often cite the cemetery’s list around <strong>$5,900 to $9,200</strong> per space. Opening and closing, the vault, and the marker are still extra.",
  officesEs: [
    "<strong>Fairmount Cemetery</strong> — 430 S Quebec St. Teléfono 303-399-0692.",
    "<strong>Crown Hill Cemetery</strong> — 7777 W 29th Ave, Wheat Ridge. Teléfono 303-233-4611.",
    "<strong>Fort Logan National Cemetery</strong> — cementerio nacional; hay reglas propias de elegibilidad.",
  ],
  officesEn: [
    "<strong>Fairmount Cemetery</strong> — 430 S Quebec St. Phone 303-399-0692.",
    "<strong>Crown Hill Cemetery</strong> — 7777 W 29th Ave, Wheat Ridge. Phone 303-233-4611.",
    "<strong>Fort Logan National Cemetery</strong> — a national cemetery with its own eligibility rules.",
  ],
  analysisSameEs:
    "El funeral tradicional de Newcomer (<strong>$4,095</strong>) es servicios con velatorio, sin ataúd. Los paquetes Dignity de Olinger ya meten ataúd recomendado: Tribute con velatorio en Hampden (<strong>$12,595</strong>), Honor con velatorio en Highland (<strong>$14,960</strong>) y Crown Hill (<strong>$15,335</strong>). El promedio de Colorado (<strong>$8,162</strong>) no es un paquete de esas casas.",
  analysisSameEn:
    "Newcomer’s traditional funeral (<strong>$4,095</strong>) is services with viewing, with no casket. Olinger’s Dignity packages already put in a recommended casket: Tribute with visitation at Hampden (<strong>$12,595</strong>), Honor with visitation at Highland (<strong>$14,960</strong>) and Crown Hill (<strong>$15,335</strong>). Colorado’s average (<strong>$8,162</strong>) is not one of those packages.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Fairmount llame al <strong>303-399-0692</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Fairmount call <strong>303-399-0692</strong>.",
  resaleHref: GRAVE_CO,
  plotNew: 5900,
  plotResale: 3750,
  unpublishedLeadEs:
    "Horan & McConaty, Fairmount y All-States no publican en internet una lista general de precios con los cuatro paquetes. All-States es sobre todo cremación. Llame y pida la lista vigente.",
  unpublishedLeadEn:
    "Horan & McConaty, Fairmount, and All-States do not publish a complete four-package general price list online. All-States is mainly cremation. Call and ask for the current list.",
  unpublishedHomes: [
    {
      name: "Horan & McConaty (Central Denver)",
      href: "https://www.horancares.com/",
      addr: "3020 Federal Blvd",
      phone: "303-477-1625",
    },
    {
      name: "Horan & McConaty (South Denver)",
      href: "https://www.horancares.com/",
      addr: "1091 S Colorado Blvd",
      phone: "303-757-1238",
    },
    {
      name: "Fairmount Funeral Home",
      href: "https://www.fairmountfuneralhome.com/",
      addr: "430 S Quebec St",
      phone: "303-399-0692",
    },
    {
      name: "All-States Cremation",
      href: "https://www.altogetherfuneral.com/",
      addr: "1338 S Jason St",
      phone: "303-234-0354",
    },
  ],
  homes: [
    {
      id: "newcomerw",
      name: "Newcomer West Metro",
      href: "https://www.newcomerdenver.com/services-pricing",
      addr: "901 S Sheridan Blvd, Lakewood · 303-274-6065",
      ...newcomerPrices,
    },
    dignityHome({
      id: "hampden",
      name: "Olinger Hampden",
      href: "https://www.dignitymemorial.com/funeral-homes/colorado/denver/olinger-hampden-mortuary-cemetery/4958/costs/funeral-price-list",
      addr: "8600 E Hampden Ave · 303-771-4636",
      dc: 2545,
      ib: 4195,
      mem: 4625,
      trad: 12595,
      dateEs: "11 may. 2026",
      dateEn: "11 May 2026",
      tradEs:
        "Paquete Tribute de funeral con velatorio. Incluye ataúd recomendado y catering. Sin bóveda. Lote aparte.",
      tradEn:
        "Tribute funeral package with visitation. Includes a recommended casket and catering. No vault. Plot extra.",
    }),
    dignityHome({
      id: "highland",
      name: "Olinger Highland",
      href: "https://www.dignitymemorial.com/funeral-homes/colorado/thornton/olinger-highland-mortuary-cemetery/2551/costs/funeral-price-list",
      addr: "10201 Grant St, Thornton · 303-451-6674",
      dc: 2645,
      ib: 4245,
      mem: 5025,
      trad: 14960,
      dateEs: "11 may. 2026",
      dateEn: "11 May 2026",
      tradEs:
        "Paquete Honor de funeral con velatorio. Incluye ataúd recomendado y catering. Sin bóveda. Lote aparte.",
      tradEn:
        "Honor funeral package with visitation. Includes a recommended casket and catering. No vault. Plot extra.",
    }),
    dignityHome({
      id: "crownhill",
      name: "Olinger Crown Hill",
      href: "https://www.dignitymemorial.com/funeral-homes/colorado/wheat-ridge/olinger-crown-hill-mortuary-cemetery/2379/costs/funeral-price-list",
      addr: "7777 W 29th Ave, Wheat Ridge · 303-233-4611",
      dc: 2745,
      ib: 4395,
      mem: 5125,
      trad: 15335,
      dateEs: "11 may. 2026",
      dateEn: "11 May 2026",
      tradEs:
        "Paquete Honor de funeral con velatorio. Incluye ataúd recomendado y catering. Sin bóveda. Lote aparte.",
      tradEn:
        "Honor funeral package with visitation. Includes a recommended casket and catering. No vault. Plot extra.",
    }),
  ],
});

const aurora = makeCity({
  slug: "aurora",
  nameEs: "Aurora",
  nameEn: "Aurora",
  heroFile: "aurora-municipal-center",
  heroCaptionEs: "Aurora Municipal Center, 15151 E Alameda Pkwy.",
  heroCaptionEn: "Aurora Municipal Center, 15151 E Alameda Pkwy.",
  heroClass: "sc-hero--aurora",
  heroW: 1600,
  heroH: 793,
  nearbyGuides: frontRangeNear("aurora"),
  countyEs: "condados Arapahoe y Adams",
  countyEn: "Arapahoe and Adams counties",
  metroEs: ["Aurora", "Centennial", "Parker", "Commerce City"],
  metroEn: ["Aurora", "Centennial", "Parker", "Commerce City"],
  metroTitleEs: "Área que atendemos en Aurora",
  metroTitleEn: "Aurora area we serve",
  prepaidCemEs: "Olinger Chapel Hill, Fairmount",
  prepaidCemEn: "Olinger Chapel Hill, Fairmount",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Olinger Chapel Hill (6601 S Colorado Blvd, Centennial) o en Fairmount (303-399-0692). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Olinger Chapel Hill (6601 S Colorado Blvd, Centennial) or Fairmount (303-399-0692) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Newcomer East Metro (Aurora): GPL 14 sep. 2026. Olinger Chapel Hill (Centennial): GPL y paquetes Dignity, 29 jul. 2026. Estimador: promedios Funeralocity de Colorado. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Newcomer East Metro (Aurora): GPL 14 Sep 2026. Olinger Chapel Hill (Centennial): Dignity GPL and package list, 29 Jul 2026. Estimator: Colorado Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Chapel Hill y Fairmount venden lotes. No publican el precio de partida en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Chapel Hill and Fairmount sell plots. They do not publish a starting plot price online. Call and ask for the current list in writing.",
  newListEs:
    "En Chapel Hill hay anuncios de reventa de cuatro espacios a <strong>$8,000</strong> el conjunto. Abrir y cerrar, bóveda y lápida siguen aparte.",
  newListEn:
    "Chapel Hill has resale ads for four spaces at <strong>$8,000</strong> for the set. Opening and closing, the vault, and the marker are still extra.",
  officesEs: [
    "<strong>Olinger Chapel Hill Cemetery</strong> — 6601 S Colorado Blvd, Centennial. Pida la lista en la oficina.",
    "<strong>Fairmount Cemetery</strong> — 430 S Quebec St, Denver. Teléfono 303-399-0692.",
    "<strong>Aurora Cemetery</strong> — cementerio municipal. Pregunte en el ayuntamiento por espacios.",
  ],
  officesEn: [
    "<strong>Olinger Chapel Hill Cemetery</strong> — 6601 S Colorado Blvd, Centennial. Ask the office for the list.",
    "<strong>Fairmount Cemetery</strong> — 430 S Quebec St, Denver. Phone 303-399-0692.",
    "<strong>Aurora Cemetery</strong> — municipal cemetery. Ask city hall about spaces.",
  ],
  analysisSameEs:
    "El funeral tradicional de Newcomer (<strong>$4,095</strong>) es servicios con velatorio, sin ataúd. El Tribute de Olinger Chapel Hill (<strong>$13,690</strong>) ya mete ataúd recomendado, velatorio y catering. El promedio de Colorado (<strong>$8,162</strong>) no es un paquete de esas casas.",
  analysisSameEn:
    "Newcomer’s traditional funeral (<strong>$4,095</strong>) is services with viewing, with no casket. Olinger Chapel Hill’s Tribute funeral (<strong>$13,690</strong>) already puts in a recommended casket, visitation, and catering. Colorado’s average (<strong>$8,162</strong>) is not one of those packages.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio. En Fairmount llame al <strong>303-399-0692</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property. At Fairmount call <strong>303-399-0692</strong>.",
  resaleHref: GRAVE_CO,
  plotNew: 5900,
  plotResale: 2000,
  unpublishedLeadEs: NO_GPL_LEAD_ES,
  unpublishedLeadEn: NO_GPL_LEAD_EN,
  unpublishedHomes: [
    {
      name: "Horan & McConaty (Aurora)",
      href: "https://www.horancares.com/",
      addr: "11150 E Dartmouth Ave",
      phone: "303-745-4418",
    },
  ],
  homes: [
    {
      id: "newcomere",
      name: "Newcomer East Metro",
      href: "https://www.newcomerdenver.com/services-pricing",
      addr: "190 Potomac St · 720-857-0700",
      ...newcomerPrices,
    },
    dignityHome({
      id: "chapelhill",
      name: "Olinger Chapel Hill",
      href: "https://www.dignitymemorial.com/funeral-homes/colorado/centennial/olinger-chapel-hill-mortuary-cemetery/2556/costs/funeral-price-list",
      addr: "6601 S Colorado Blvd, Centennial · 303-771-3960",
      dc: 3045,
      ib: 4395,
      mem: 5425,
      trad: 13690,
      dateEs: "29 jul. 2026",
      dateEn: "29 Jul 2026",
      tradEs:
        "Paquete Tribute de funeral con velatorio. Incluye ataúd recomendado y catering. Sin bóveda. Lote aparte.",
      tradEn:
        "Tribute funeral package with visitation. Includes a recommended casket and catering. No vault. Plot extra.",
    }),
  ],
});

const coloradoSprings = makeCity({
  slug: "colorado-springs",
  nameEs: "Colorado Springs",
  nameEn: "Colorado Springs",
  heroFile: "colorado-springs-garden-of-the-gods",
  heroCaptionEs: "Garden of the Gods, Colorado Springs — formaciones de arenisca roja.",
  heroCaptionEn: "Garden of the Gods, Colorado Springs — red sandstone formations.",
  heroClass: "sc-hero--colorado-springs",
  heroW: 1350,
  heroH: 900,
  nearbyGuides: [],
  countyEs: "condado El Paso",
  countyEn: "El Paso County",
  metroEs: ["Colorado Springs", "Fountain", "Monument", "Manitou Springs", "Security-Widefield"],
  metroEn: ["Colorado Springs", "Fountain", "Monument", "Manitou Springs", "Security-Widefield"],
  metroTitleEs: "Área que atendemos en Colorado Springs",
  metroTitleEn: "Colorado Springs area we serve",
  prepaidCemEs: "Evergreen Cemetery, Memorial Gardens",
  prepaidCemEn: "Evergreen Cemetery, Memorial Gardens",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Evergreen Cemetery (719-578-6646). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Evergreen Cemetery (719-578-6646) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "All Veterans: GPL 3 jun. 2026 (cremación directa y entierro inmediato; memorial y funeral tradicional no figuran como paquetes). Evergreen & Blunt: lista general en su sitio. Estimador: promedios Funeralocity de Colorado. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "All Veterans: GPL 3 Jun 2026 (direct cremation and immediate burial; memorial and traditional funeral are not listed as packages). Evergreen & Blunt: general price list on their site. Estimator: Colorado Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Evergreen Cemetery es municipal. Memorial Gardens no publica el lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Evergreen Cemetery is municipal. Memorial Gardens does not post plot prices online. Call and ask for the current list in writing.",
  newListEs:
    "En Evergreen Cemetery hay un anuncio de reventa de dos espacios de cremación a <strong>$1,900</strong> (el vendedor cita $3,650 de lista). Abrir y cerrar, bóveda y lápida siguen aparte.",
  newListEn:
    "Evergreen Cemetery has a resale ad for two cremation spaces at <strong>$1,900</strong> (the seller cites a $3,650 list). Opening and closing, the vault, and the marker are still extra.",
  officesEs: [
    "<strong>Evergreen Cemetery</strong> — 1005 Hancock Expy. Teléfono 719-578-6646.",
    "<strong>Memorial Gardens</strong> — pida la lista en la oficina del parque.",
    "<strong>Fort Logan</strong> no cubre Colorado Springs; pregunte por cementerios nacionales de la zona si hay elegibilidad.",
  ],
  officesEn: [
    "<strong>Evergreen Cemetery</strong> — 1005 Hancock Expy. Phone 719-578-6646.",
    "<strong>Memorial Gardens</strong> — ask the park office for the list.",
    "<strong>Fort Logan</strong> does not cover Colorado Springs; ask about a national cemetery if there is eligibility.",
  ],
  analysisSameEs:
    "El funeral tradicional de Evergreen (<strong>$3,250</strong>) es servicios de iglesia/capilla, sin ataúd. El memorial con cremación (<strong>$2,970</strong>) ya mete contenedor de cartón y urna de plástico. All Veterans publica cremación directa (<strong>$1,595</strong>) y entierro inmediato (<strong>$2,995</strong>), sin un paquete de memorial ni de funeral tradicional en esa lista. El promedio de Colorado (<strong>$8,162</strong>) suele incluir ataúd.",
  analysisSameEn:
    "Evergreen’s traditional church/chapel service (<strong>$3,250</strong>) is services, with no casket. The memorial with cremation (<strong>$2,970</strong>) already puts in a cardboard container and a plastic urn. All Veterans publishes direct cremation (<strong>$1,595</strong>) and immediate burial (<strong>$2,995</strong>), with no memorial or traditional funeral package on that list. Colorado’s average (<strong>$8,162</strong>) usually includes a casket.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio. En Evergreen Cemetery llame al <strong>719-578-6646</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property. At Evergreen Cemetery call <strong>719-578-6646</strong>.",
  resaleHref: GRAVE_CO,
  plotNew: 3650,
  plotResale: 1900,
  unpublishedLeadEs: NO_GPL_LEAD_ES,
  unpublishedLeadEn: NO_GPL_LEAD_EN,
  unpublishedHomes: [
    {
      name: "Shrine of Remembrance",
      href: "https://www.shrineofremembrance.com/",
      addr: "1730 E Fountain Blvd",
      phone: "719-634-1597",
    },
    {
      name: "The Springs Funeral Services",
      href: "https://www.thespringsfuneralservices.com/",
      addr: "3115 E Platte Ave",
      phone: "719-328-1793",
    },
  ],
  homes: [
    {
      id: "allvets",
      name: "All Veterans",
      href: "https://www.altogetherfuneral.com/funeral-cremation/colorado/colorado-springs/all-veterans-funeral-cremation-colorado-springs/coavc.html",
      addr: "1020 E Fillmore St · 303-234-0911",
      dc: 1595,
      ib: 2995,
      dcEs: "Cremación directa, contenedor del comprador (GPL 3 jun. 2026).",
      dcEn: "Direct cremation, purchaser container (GPL 3 Jun 2026).",
      ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
      ibEn: "Immediate burial, purchaser casket. Plot extra.",
    },
    {
      id: "evergreen",
      name: "Evergreen & Blunt",
      href: "https://www.evergreenfuneralhome.org/general-price-listcec02171",
      addr: "1830 E Fountain Blvd · 719-475-8303",
      dc: 2150,
      ib: 2215,
      trad: 3250,
      dcEs: "Cremación directa. Incluye contenedor de cartón y urna de plástico negra.",
      dcEn: "Direct cremation. Includes a cardboard container and a black plastic urn.",
      ibEs: "Entierro directo. Ataúd y lote aparte.",
      ibEn: "Direct burial. Casket and plot extra.",
      memCell: cell(
        2970,
        "Memorial con cremación. Incluye contenedor de cartón y urna de plástico.",
        "Memorial with cremation. Includes a cardboard container and a plastic urn."
      ),
      trCell: cell(
        3250,
        "Servicio tradicional de iglesia/capilla. Ataúd y lote aparte.",
        "Traditional church/chapel service. Casket and plot extra."
      ),
    },
  ],
});

const fortCollins = makeCity({
  slug: "fort-collins",
  nameEs: "Fort Collins",
  nameEn: "Fort Collins",
  heroFile: "fort-collins-old-town",
  heroCaptionEs: "Edificio Old Town Square, Fort Collins.",
  heroCaptionEn: "Old Town Square building, Fort Collins.",
  heroClass: "sc-hero--fort-collins",
  heroW: 1200,
  heroH: 900,
  nearbyGuides: [],
  countyEs: "condado Larimer",
  countyEn: "Larimer County",
  metroEs: ["Fort Collins", "Loveland", "Windsor", "Timnath"],
  metroEn: ["Fort Collins", "Loveland", "Windsor", "Timnath"],
  metroTitleEs: "Área que atendemos en Fort Collins",
  metroTitleEn: "Fort Collins area we serve",
  prepaidCemEs: "Grandview, Resthaven",
  prepaidCemEn: "Grandview, Resthaven",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Grandview Cemetery (970-221-6814). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Grandview Cemetery (970-221-6814) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Goes Funeral Care: GPL 1 ene. 2026. Allnutt Drake Road: GPL y paquetes Dignity, 25 jun. 2026. Estimador: promedios Funeralocity de Colorado. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Goes Funeral Care: GPL 1 Jan 2026. Allnutt Drake Road: Dignity GPL and package list, 25 Jun 2026. Estimator: Colorado Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Grandview es municipal. Resthaven no publica el lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Grandview is municipal. Resthaven does not post plot prices online. Call and ask for the current list in writing.",
  newListEs:
    "Estos cementerios de Fort Collins no publican un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 970-221-6814.",
  newListEn:
    "These Fort Collins cemeteries do not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 970-221-6814.",
  officesEs: [
    "<strong>Grandview Cemetery</strong> — 1900 W Vine Dr. Teléfono 970-221-6814.",
    "<strong>Resthaven Memory Gardens</strong> — pida la lista en la oficina del parque.",
  ],
  officesEn: [
    "<strong>Grandview Cemetery</strong> — 1900 W Vine Dr. Phone 970-221-6814.",
    "<strong>Resthaven Memory Gardens</strong> — ask the park office for the list.",
  ],
  analysisSameEs:
    "El funeral tradicional de Goes (<strong>$4,750</strong>) es velatorio y servicio, sin ataúd. El Tribute de Allnutt Drake (<strong>$11,525</strong>) ya mete ataúd recomendado, velatorio y catering. La cremación directa de Goes (<strong>$2,400</strong>) ya mete contenedor de cartón y urna. El promedio de Colorado (<strong>$8,162</strong>) no es un paquete de esas casas.",
  analysisSameEn:
    "Goes’s traditional service (<strong>$4,750</strong>) is visitation and a funeral, with no casket. Allnutt Drake’s Tribute funeral (<strong>$11,525</strong>) already puts in a recommended casket, visitation, and catering. Goes’s direct cremation (<strong>$2,400</strong>) already puts in a cardboard container and an urn. Colorado’s average (<strong>$8,162</strong>) is not one of those packages.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio. En Grandview llame al <strong>970-221-6814</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property. At Grandview call <strong>970-221-6814</strong>.",
  resaleHref: GRAVE_CO,
  plotNew: 4000,
  plotResale: 1800,
  unpublishedLeadEs: NO_GPL_LEAD_ES,
  unpublishedLeadEn: NO_GPL_LEAD_EN,
  unpublishedHomes: [],
  homes: [
    {
      id: "goes",
      name: "Goes Funeral Care",
      href: "https://www.goesfuneralcare.com/services-pricing",
      addr: "3665 Canal Dr, Unit E · 970-482-2221",
      dc: 2400,
      ib: 2350,
      trad: 4750,
      dcEs: "Cremación directa con llama. Incluye contenedor de cartón y urna (GPL 1 ene. 2026).",
      dcEn: "Direct flame cremation. Includes a cardboard container and an urn (GPL 1 Jan 2026).",
      ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
      ibEn: "Immediate burial, purchaser casket. Plot extra.",
      memCell: cell(
        3200,
        "Cremación y memorial en Goes (máx. 60 personas). Incluye urna.",
        "Cremation and a memorial at Goes (max 60 people). Includes an urn."
      ),
      trCell: cell(
        4750,
        "Servicio tradicional con velatorio. Ataúd y lote aparte.",
        "Traditional service with visitation. Casket and plot extra."
      ),
    },
    dignityHome({
      id: "allnuttdrake",
      name: "Allnutt Drake Road",
      href: "https://www.dignitymemorial.com/funeral-homes/colorado/ft-collins/allnutt-funeral-service-drake-road-chapel/8239/costs/funeral-price-list",
      addr: "650 W Drake Rd · 970-482-3208",
      dc: 3905,
      ib: 4195,
      mem: 6035,
      trad: 11525,
      dateEs: "25 jun. 2026",
      dateEn: "25 Jun 2026",
      tradEs:
        "Paquete Tribute de funeral con velatorio. Incluye ataúd recomendado y catering. Sin bóveda. Lote aparte.",
      tradEn:
        "Tribute funeral package with visitation. Includes a recommended casket and catering. No vault. Plot extra.",
    }),
  ],
});

function estimatorCity(spec) {
  return makeCity({
    unpublishedLeadEs: NO_GPL_LEAD_ES,
    unpublishedLeadEn: NO_GPL_LEAD_EN,
    analysisSameEs: NO_GPL_SAME_ES,
    analysisSameEn: NO_GPL_SAME_EN,
    analysisPlotEs:
      spec.analysisPlotEs ||
      "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Eso se pide en la oficina.",
    analysisPlotEn:
      spec.analysisPlotEn ||
      "None of the figures in the table are cemetery property or opening/closing. Ask the cemetery office.",
    resaleHref: GRAVE_CO,
    homes: [],
    ...spec,
  });
}

const pueblo = estimatorCity({
  slug: "pueblo",
  nameEs: "Pueblo",
  nameEn: "Pueblo",
  heroFile: "pueblo-riverwalk",
  heroCaptionEs: "Historic Arkansas Riverwalk, Pueblo.",
  heroCaptionEn: "Historic Arkansas Riverwalk, Pueblo.",
  heroClass: "sc-hero--pueblo",
  heroW: 1350,
  heroH: 900,
  nearbyGuides: [],
  countyEs: "condado Pueblo",
  countyEn: "Pueblo County",
  metroEs: ["Pueblo", "Pueblo West", "Colorado City"],
  metroEn: ["Pueblo", "Pueblo West", "Colorado City"],
  metroTitleEs: "Área que atendemos en Pueblo",
  metroTitleEn: "Pueblo area we serve",
  prepaidCemEs: "Roselawn",
  prepaidCemEn: "Roselawn",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Roselawn (719-542-0157). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Roselawn (719-542-0157) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Ninguna funeraria de Pueblo publica en internet una lista general de precios con los cuatro paquetes. Estimador: promedios Funeralocity de Colorado. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "No Pueblo funeral home publishes a complete four-package general price list online. Estimator: Colorado Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs: "Roselawn vende lotes. No publica el precio de partida en la web. Llame y pida la lista por escrito.",
  officesNoteEn: "Roselawn sells plots. It does not post a starting plot price online. Call and ask for the list in writing.",
  newListEs:
    "Hay un anuncio de reventa en Roselawn a <strong>$2,000</strong> por un espacio. Abrir y cerrar, bóveda y lápida siguen aparte.",
  newListEn:
    "There is a Roselawn resale ad at <strong>$2,000</strong> for one space. Opening and closing, the vault, and the marker are still extra.",
  officesEs: ["<strong>Roselawn Cemetery</strong> — 1706 Roselawn Rd. Teléfono 719-542-0157."],
  officesEn: ["<strong>Roselawn Cemetery</strong> — 1706 Roselawn Rd. Phone 719-542-0157."],
  analysisPlotEs: "Ninguna cifra de la tabla es propiedad en cementerio. En Roselawn llame al <strong>719-542-0157</strong>.",
  analysisPlotEn: "None of the figures in the table are cemetery property. At Roselawn call <strong>719-542-0157</strong>.",
  plotNew: 3500,
  plotResale: 2000,
  unpublishedHomes: [
    {
      name: "Montgomery & Steward",
      href: "https://www.montgomerysteward.com/",
      addr: "1317 N Main St",
      phone: "719-542-1552",
    },
    {
      name: "Imperial Memorial Gardens",
      href: "https://www.dignitymemorial.com/funeral-homes/colorado/pueblo/imperial-funeral-home/7071",
      addr: "5450 Highway 78 West",
      phone: "719-564-0920",
    },
  ],
});

const boulder = estimatorCity({
  slug: "boulder",
  nameEs: "Boulder",
  nameEn: "Boulder",
  heroFile: "boulder-flatirons",
  heroCaptionEs: "Las Flatirons al amanecer, Boulder.",
  heroCaptionEn: "The Flatirons at sunrise, Boulder.",
  heroClass: "sc-hero--boulder",
  heroW: 1600,
  heroH: 865,
  nearbyGuides: [],
  countyEs: "condado Boulder",
  countyEn: "Boulder County",
  metroEs: ["Boulder", "Longmont", "Louisville", "Lafayette"],
  metroEn: ["Boulder", "Longmont", "Louisville", "Lafayette"],
  metroTitleEs: "Área que atendemos en Boulder",
  metroTitleEn: "Boulder area we serve",
  prepaidCemEs: "Green Mountain, Mountain View",
  prepaidCemEn: "Green Mountain, Mountain View",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Green Mountain Cemetery (303-444-5695). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Green Mountain Cemetery (303-444-5695) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Ninguna funeraria de Boulder publica en internet una lista general de precios con los cuatro paquetes. Estimador: promedios Funeralocity de Colorado. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "No Boulder funeral home publishes a complete four-package general price list online. Estimator: Colorado Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Green Mountain y Mountain View (Crist) venden lotes. No publican el precio de partida en la web. Llame y pida la lista por escrito.",
  officesNoteEn:
    "Green Mountain and Mountain View (Crist) sell plots. They do not post a starting plot price online. Call and ask for the list in writing.",
  newListEs:
    "Estos cementerios de Boulder no publican un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 303-444-5695.",
  newListEn:
    "These Boulder cemeteries do not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 303-444-5695.",
  officesEs: [
    "<strong>Green Mountain Cemetery</strong> — 290 20th St. Teléfono 303-444-5695.",
    "<strong>Mountain View Memorial Park</strong> — mismo terreno que Crist Mortuary. Teléfono 303-442-4411.",
  ],
  officesEn: [
    "<strong>Green Mountain Cemetery</strong> — 290 20th St. Phone 303-444-5695.",
    "<strong>Mountain View Memorial Park</strong> — same grounds as Crist Mortuary. Phone 303-442-4411.",
  ],
  analysisPlotEs: "Ninguna cifra de la tabla es propiedad en cementerio. En Green Mountain llame al <strong>303-444-5695</strong>.",
  analysisPlotEn: "None of the figures in the table are cemetery property. At Green Mountain call <strong>303-444-5695</strong>.",
  plotNew: 5000,
  plotResale: 2200,
  unpublishedHomes: [
    {
      name: "Crist Mortuary",
      href: "https://www.cristmortuary.com/",
      addr: "3395 Penrose Pl",
      phone: "303-442-4411",
    },
  ],
});

const greeley = makeCity({
  slug: "greeley",
  nameEs: "Greeley",
  nameEn: "Greeley",
  heroFile: "greeley-downtown",
  heroCaptionEs: "Centro de Greeley, Colorado.",
  heroCaptionEn: "Downtown Greeley, Colorado.",
  heroClass: "sc-hero--greeley",
  heroW: 1350,
  heroH: 900,
  nearbyGuides: [],
  countyEs: "condado Weld",
  countyEn: "Weld County",
  metroEs: ["Greeley", "Evans", "Garden City", "LaSalle"],
  metroEn: ["Greeley", "Evans", "Garden City", "LaSalle"],
  metroTitleEs: "Área que atendemos en Greeley",
  metroTitleEn: "Greeley area we serve",
  prepaidCemEs: "Linn Grove",
  prepaidCemEn: "Linn Grove",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Linn Grove (970-350-9322). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Linn Grove (970-350-9322) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Allnutt Macy Chapel: GPL y lista de paquetes Dignity, 25 jun. 2026. Estimador: promedios Funeralocity de Colorado. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Allnutt Macy Chapel: Dignity GPL and package list, 25 Jun 2026. Estimator: Colorado Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs: "Linn Grove es municipal. No publica el precio de partida en la web. Llame y pida la lista por escrito.",
  officesNoteEn: "Linn Grove is municipal. It does not post a starting plot price online. Call and ask for the list in writing.",
  newListEs:
    "Linn Grove no publica un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 970-350-9322.",
  newListEn:
    "Linn Grove does not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 970-350-9322.",
  officesEs: ["<strong>Linn Grove Cemetery</strong> — 1300 S 11th Ave. Teléfono 970-350-9322."],
  officesEn: ["<strong>Linn Grove Cemetery</strong> — 1300 S 11th Ave. Phone 970-350-9322."],
  analysisSameEs:
    "El funeral Tribute de Allnutt (<strong>$11,840</strong>) ya mete ataúd recomendado, velatorio y catering. La cremación directa (<strong>$3,875</strong>) es sin ceremonia. El promedio de entierro completo de Colorado (<strong>$8,162</strong>) suele incluir ataúd, no un paquete Dignity.",
  analysisSameEn:
    "Allnutt’s Tribute funeral (<strong>$11,840</strong>) already puts in a recommended casket, visitation, and catering. Direct cremation (<strong>$3,875</strong>) has no ceremony. Colorado’s full-burial average (<strong>$8,162</strong>) usually includes a casket; it is not a Dignity package.",
  analysisPlotEs: "Ninguna cifra de la tabla es propiedad en cementerio. En Linn Grove llame al <strong>970-350-9322</strong>.",
  analysisPlotEn: "None of the figures in the table are cemetery property. At Linn Grove call <strong>970-350-9322</strong>.",
  resaleHref: GRAVE_CO,
  plotNew: 3500,
  plotResale: 1600,
  unpublishedLeadEs: NO_GPL_LEAD_ES,
  unpublishedLeadEn: NO_GPL_LEAD_EN,
  unpublishedHomes: [
    {
      name: "Adamson Life Celebration Home",
      href: "https://www.altogetherfuneral.com/funeral-cremation/locations/adamson-life-celebration-home",
      addr: "2000 47th Ave",
      phone: "970-235-2522",
    },
  ],
  homes: [
    {
      id: "allnutt",
      name: "Allnutt Macy Chapel",
      href: "https://www.dignitymemorial.com/funeral-homes/colorado/greeley/allnutt-funeral-service-macy-chapel/8300/funeral-price-list",
      addr: "6521 W 20th St · 970-352-3366",
      dc: 3875,
      ib: 4020,
      trad: 11840,
      casketTrad: true,
      dcEs: "Cremación directa, contenedor del comprador (GPL 25 jun. 2026).",
      dcEn: "Direct cremation, purchaser container (GPL 25 Jun 2026).",
      ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
      ibEn: "Immediate burial, purchaser casket. Plot extra.",
      memCell: cell(
        6105,
        "Paquete Tribute de cremación: reunión sencilla, urna y contenedor Trayview. Sin velatorio con cuerpo.",
        "Tribute cremation package: simple gathering, urn, and Trayview container. No body present."
      ),
      trCell: cell(
        11840,
        "Paquete Tribute de funeral con velatorio. Incluye ataúd recomendado y catering. Sin bóveda. Lote aparte.",
        "Tribute funeral package with visitation. Includes a recommended casket and catering. No vault. Plot extra."
      ),
    },
  ],
});

const grandJunction = makeCity({
  slug: "grand-junction",
  nameEs: "Grand Junction",
  nameEn: "Grand Junction",
  heroFile: "grand-junction-independence-monument",
  heroCaptionEs: "Independence Monument, Colorado National Monument, al oeste de Grand Junction.",
  heroCaptionEn: "Independence Monument, Colorado National Monument, west of Grand Junction.",
  heroClass: "sc-hero--grand-junction",
  heroW: 1600,
  heroH: 886,
  nearbyGuides: [],
  countyEs: "condado Mesa",
  countyEn: "Mesa County",
  metroEs: ["Grand Junction", "Fruita", "Palisade", "Clifton"],
  metroEn: ["Grand Junction", "Fruita", "Palisade", "Clifton"],
  metroTitleEs: "Área que atendemos en Grand Junction",
  metroTitleEn: "Grand Junction area we serve",
  prepaidCemEs: "Orchard Mesa, Municipal Cemetery",
  prepaidCemEn: "Orchard Mesa, Municipal Cemetery",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en el cementerio municipal (970-254-3866). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask the municipal cemetery (970-254-3866) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Callahan-Edfast: GPL y lista de paquetes Dignity, 26 feb. 2026. Martin Mortuary: GPL Dignity, 26 feb. 2026 (cremación directa y entierro inmediato; memorial y funeral tradicional no figuraban en la hoja que se abrió). Estimador: promedios Funeralocity de Colorado. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Callahan-Edfast: Dignity GPL and package list, 26 Feb 2026. Martin Mortuary: Dignity GPL, 26 Feb 2026 (direct cremation and immediate burial; memorial and traditional funeral were not on the sheet that opened). Estimator: Colorado Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Orchard Mesa y el cementerio municipal venden lotes. No publican el precio de partida en la web. Llame y pida la lista por escrito.",
  officesNoteEn:
    "Orchard Mesa and the municipal cemetery sell plots. They do not post a starting plot price online. Call and ask for the list in writing.",
  newListEs:
    "Estos cementerios de Grand Junction no publican un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 970-254-3866.",
  newListEn:
    "These Grand Junction cemeteries do not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 970-254-3866.",
  officesEs: [
    "<strong>Municipal Cemetery / Orchard Mesa</strong> — Teléfono 970-254-3866.",
  ],
  officesEn: [
    "<strong>Municipal Cemetery / Orchard Mesa</strong> — Phone 970-254-3866.",
  ],
  analysisSameEs:
    "El funeral Honor de Callahan (<strong>$12,840</strong>) ya mete ataúd recomendado, velatorio y catering. La cremación directa publicada es la misma cifra en Callahan y Martin (<strong>$1,785</strong>). Martin no tiene en esta tabla memorial ni funeral tradicional porque esa hoja de paquetes no se abrió. El promedio de Colorado (<strong>$8,162</strong>) no es un paquete Dignity.",
  analysisSameEn:
    "Callahan’s Honor funeral (<strong>$12,840</strong>) already puts in a recommended casket, visitation, and catering. Published direct cremation is the same figure at Callahan and Martin (<strong>$1,785</strong>). Martin has no memorial or traditional funeral on this chart because that package sheet did not open. Colorado’s average (<strong>$8,162</strong>) is not a Dignity package.",
  analysisPlotEs: "Ninguna cifra de la tabla es propiedad en cementerio. Llame al <strong>970-254-3866</strong>.",
  analysisPlotEn: "None of the figures in the table are cemetery property. Call <strong>970-254-3866</strong>.",
  resaleHref: GRAVE_CO,
  plotNew: 3500,
  plotResale: 1600,
  homes: [
    {
      id: "callahan",
      name: "Callahan-Edfast",
      href: "https://www.dignitymemorial.com/funeral-homes/colorado/grand-junction/callahan-edfast-mortuary-crematory/8268/funeral-price-list",
      addr: "2515 Patterson Rd · 970-243-2450",
      dc: 1785,
      ib: 4390,
      trad: 12840,
      casketTrad: true,
      dcEs: "Cremación directa, contenedor del comprador (GPL 26 feb. 2026).",
      dcEn: "Direct cremation, purchaser container (GPL 26 Feb 2026).",
      ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
      ibEn: "Immediate burial, purchaser casket. Plot extra.",
      memCell: cell(
        3915,
        "Paquete Tribute de cremación: reunión sencilla, urna y contenedor Trayview. Sin velatorio con cuerpo.",
        "Tribute cremation package: simple gathering, urn, and Trayview container. No body present."
      ),
      trCell: cell(
        12840,
        "Paquete Honor de funeral con velatorio. Incluye ataúd recomendado y catering. Sin bóveda. Lote aparte.",
        "Honor funeral package with visitation. Includes a recommended casket and catering. No vault. Plot extra."
      ),
    },
    dignityHome({
      id: "martin",
      name: "Martin Mortuary",
      href: "https://www.dignitymemorial.com/funeral-homes/colorado/grand-junction/martin-mortuary/2549/costs/funeral-price-list",
      addr: "550 North Ave · 970-243-1538",
      dc: 1785,
      ib: 4390,
      dateEs: "26 feb. 2026",
      dateEn: "26 Feb 2026",
    }),
  ],
});

const all = [denver, aurora, coloradoSprings, fortCollins, pueblo, boulder, greeley, grandJunction];

module.exports = all;
module.exports.bySlug = Object.fromEntries(all.map((c) => [c.slug, c]));
