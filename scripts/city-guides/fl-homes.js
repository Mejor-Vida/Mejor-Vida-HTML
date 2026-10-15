/**
 * Florida funeral-home GPL columns (first-party lists only).
 * Prices from each home’s published GPL or package list — not Funeralocity.
 * Every named home buries and cremates.
 */
const { cell } = require("./fl-factory");

const ESTIMATOR_FOOT_ES =
  " Columna del estimador: promedios de Florida de Funeralocity (entierro completo $8,399; inmediato $5,252; cremación completa $5,971; directa $1,708). Esos promedios son de paquetes de funeraria. No incluyen el lote, abrir y cerrar, la bóveda ni la lápida.";
const ESTIMATOR_FOOT_EN =
  " Estimator column: Florida Funeralocity averages (full burial $8,399; immediate $5,252; full cremation $5,971; direct $1,708). Those averages are funeral-home packages. They do not include the plot, opening and closing, the vault, or the marker.";

const SERVICE_AREA_LEAD_ES =
  "Las columnas son funerarias del área metropolitana que publican lista propia; no están todas dentro de los límites de la ciudad. Las funerarias locales aparecen abajo. Llame y pida la lista vigente.";
const SERVICE_AREA_LEAD_EN =
  "Columns are metro funeral homes with their own published lists; not every home is inside the city limits. Local funeral homes are listed below. Call and ask for the current list.";

function newcomerOrlando() {
  return {
    id: "newcomer",
    name: "Newcomer Funeral Home (Orlando)",
    href: "https://cdn.newcomer.com/prod/price-lists/Orlando%20GPL.pdf",
    addr: "895 S Goldenrod Rd, Orlando · (407) 277-4227",
    dc: 1445,
    ib: 2745,
    dcEs: "Cremación directa, contenedor del comprador (GPL 10 sep. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 10 Sep 2026).",
    ibEs: "Entierro inmediato, ataúd del comprador (GPL 10 sep. 2026). Lote aparte.",
    ibEn: "Immediate burial, purchaser casket (GPL 10 Sep 2026). Plot extra.",
    memCell: cell(
      3335,
      "Memorial Ceremony with Celebration of Life After Cremation (plan simplificado, GPL 10 sep. 2026). Sin urna ni ataúd.",
      "Memorial Ceremony with Celebration of Life After Cremation (simplified plan, GPL 10 Sep 2026). No urn or casket."
    ),
    trCell: cell(
      3995,
      "Funeral Ceremony con velatorio el día anterior (plan simplificado, GPL 10 sep. 2026). Ataúd y lote aparte.",
      "Funeral Ceremony with viewing the day before (simplified plan, GPL 10 Sep 2026). Casket and plot extra."
    ),
  };
}

function floridaMortuaryTampa() {
  return {
    id: "flmortuary",
    name: "Florida Mortuary (Tampa)",
    href: "https://sfprod.altogetherfuneral.com/on/demandware.static/-/Sites-locations-catalog/default/dw8d6e0863/gpl/FLLFM%20GPL.pdf",
    addr: "4601 N Nebraska Ave, Tampa · (813) 513-0215",
    dc: 1510,
    ib: 3115,
    dcEs: "Cremación directa, contenedor del comprador (GPL 7 may. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 7 May 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 7 may. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 7 May 2026). Casket and plot extra.",
    memCell: cell(
      3475,
      "Paquete Legacy: memorial después de la cremación (lista de paquetes 7 may. 2026). Urna/ataúd según allowance.",
      "Legacy package: memorial after cremation (package list 7 May 2026). Urn/casket per allowance."
    ),
    trCell: cell(
      8530,
      "Paquete Eternal burial (capilla/iglesia), lista 7 may. 2026. Incluye allowance de ataúd $2,300; lote aparte.",
      "Eternal burial package (chapel/church), list 7 May 2026. Includes a $2,300 casket allowance; plot extra."
    ),
    casketTrad: true,
  };
}

function schnaussJax() {
  return {
    id: "schnauss",
    name: "Schnauss NEFL Funeral Home",
    href: "https://www.neflfuneral.com/our-services/funeral-services",
    addr: "808 Margaret St, Jacksonville · (904) 683-9288",
    dc: 895,
    ib: 2495,
    dcEs:
      "Paquete Simple Cremation (lista publicada en neflfuneral.com): traslado, papelería y cremación. Contenedor temporal; ME y certificados aparte.",
    dcEn:
      "Simple Cremation package (published on neflfuneral.com): removal, paperwork, and cremation. Temporary container; ME fee and death certificates extra.",
    ibEs:
      "Paquete Direct Burial (servicios funerarios publicados): sin velatorio ni embalsamado; mar–jue 11–14. Ataúd mínimo desde $600 aparte; lote aparte.",
    ibEn:
      "Direct Burial package (published funeral-services list): no viewing or embalming; Tue–Thu 11 a.m.–2 p.m. Minimum casket from $600 extra; plot extra.",
    memCell: cell(
      2495,
      "Paquete Cremation With Memorial Service (lista de cremación publicada): memorial en capilla; mar–jue 11–14. Urna y ME aparte.",
      "Cremation With Memorial Service package (published cremation list): chapel memorial; Tue–Thu 11 a.m.–2 p.m. Urn and ME fee extra."
    ),
    trCell: cell(
      4495,
      "Paquete Full Service Funeral (lista publicada): embalsamado, velatorio el mismo día, funeral en capilla y entierro; mar–jue 11–14. Ataúd mínimo desde $600 aparte; lote aparte.",
      "Full Service Funeral package (published list): embalming, same-day viewing, chapel funeral, and burial; Tue–Thu 11 a.m.–2 p.m. Minimum casket from $600 extra; plot extra."
    ),
  };
}

function hardageGiddensJax() {
  return {
    id: "hardage",
    name: "Hardage-Giddens Chapel Hills",
    href: "https://www.dignitymemorial.com/funeral-homes/jacksonville-fl/hardage-giddens-chapel-hills-funeral-home/4053/costs/price-list",
    addr: "850 St Johns Bluff Rd N, Jacksonville · (904) 641-9755",
    dc: 3395,
    ib: 4895,
    dcEs: "Cremación directa, contenedor del comprador (GPL Dignity 3 mar. 2026).",
    dcEn: "Direct cremation, purchaser container (Dignity GPL 3 Mar 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 3 mar. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 3 Mar 2026). Casket and plot extra.",
  };
}

function caballeroMiami() {
  return {
    id: "caballero",
    name: "Caballero Rivero Little Havana",
    href: "https://www.dignitymemorial.com/funeral-homes/florida/miami/caballero-rivero-little-havana/9548/funeral-price-list",
    addr: "3344 SW 8th St, Miami · (305) 445-9508",
    dc: 1995,
    ib: 4425,
    dcEs: "Cremación directa, contenedor del comprador (GPL Dignity 7 jul. 2026).",
    dcEn: "Direct cremation, purchaser container (Dignity GPL 7 Jul 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 7 jul. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 7 Jul 2026). Casket and plot extra.",
  };
}

function hadleyDavisMiami() {
  return {
    id: "hadley",
    name: "Hadley Davis Funeral Home",
    href: "https://hadleydavisfuneralhome.com/services/",
    addr: "2321 NW 62nd St, Miami · (305) 638-5030",
    dc: 695,
    ib: 2691,
    dcEs:
      "Direct Cremation (paquetes publicados en hadleydavisfuneralhome.com): traslado, cremación, aprobación estatal y papelería.",
    dcEn:
      "Direct Cremation (packages published on hadleydavisfuneralhome.com): removal, cremation, state approval, and paperwork.",
    ibEs:
      "Direct Burial (lista publicada): servicios básicos, embalsamado, traslado y coche fúnebre. Incluye ataúd de acero calibre 20; lote aparte.",
    ibEn:
      "Direct Burial (published list): basic services, embalming, removal, and hearse. Includes a 20-gauge steel casket; plot extra.",
    memCell: cell(
      2146,
      "Cremation Service Package (lista publicada): embalsamado, velatorio, servicio en capilla y ataúd de alquiler calibre 20. Lote/urna aparte.",
      "Cremation Service Package (published list): embalming, visitation, chapel service, and 20-gauge rental casket. Plot/urn extra."
    ),
    trCell: cell(
      2991,
      "Burial Service Package (lista publicada): embalsamado, velatorio, capilla, coche fúnebre y ataúd de metal calibre 20. Lote aparte.",
      "Burial Service Package (published list): embalming, visitation, chapel, hearse, and 20-gauge metal casket. Plot extra."
    ),
    casketIb: true,
    casketMem: true,
    casketTrad: true,
  };
}

function masponsMiami() {
  return {
    id: "maspons",
    name: "Maspons Funeral Home",
    href: "https://www.masponsfuneral.com/cremation-packages",
    addr: "3500 SW 8th St, Miami · (305) 461-5070",
    dc: 1977,
    ib: null,
    dcEs:
      "Direct Cremation (paquetes en masponsfuneral.com, capillas Miami y Westchester): servicios básicos, cremación y un certificado de defunción.",
    dcEn:
      "Direct Cremation (packages on masponsfuneral.com, Miami and Westchester chapels): basic services, cremation, and one death certificate.",
    ibEs: "No figura un total de entierro inmediato en su lista de paquetes publicada.",
    ibEn: "No packaged immediate-burial total on their published package lists.",
    memCell: cell(
      4432,
      "Silver Cremation Package (lista publicada): velatorio, ataúd de alquiler, cremación, memorial package, spray y urna acrílica.",
      "Silver Cremation Package (published list): viewing, rental casket, cremation, memorial package, spray, and acrylic urn."
    ),
    trCell: cell(
      5180,
      "Basic Burial Package (lista publicada): servicios, ataúd Spencer calibre 20 con junta, memorial package, spray y certificado. Lote aparte.",
      "Basic Burial Package (published list): services, Spencer 20-gauge gasketed casket, memorial package, spray, and death certificate. Plot extra."
    ),
    casketMem: true,
    casketTrad: true,
  };
}

function browardFortLauderdale() {
  return {
    id: "broward",
    name: "Broward Burial & Cremation",
    href: "https://www.dignitymemorial.com/funeral-homes/florida/fort-lauderdale/broward-burial-and-cremation/7093/funeral-price-list",
    addr: "1801 E Oakland Park Blvd, Fort Lauderdale · (954) 731-4321",
    dc: 2465,
    ib: 3195,
    dcEs: "Cremación directa, contenedor del comprador (GPL Dignity 3 ago. 2026).",
    dcEn: "Direct cremation, purchaser container (Dignity GPL 3 Aug 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 3 ago. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 3 Aug 2026). Casket and plot extra.",
  };
}

function kraeerFairchildFortLauderdale() {
  return {
    id: "kraeer",
    name: "Kraeer-Fairchild Funeral Home",
    href: "https://www.dignitymemorial.com/funeral-homes/florida/fort-lauderdale/kraeer-fairchild-funeral-home-and-cremation-center/7092/funeral-price-list",
    addr: "4061 N Federal Hwy, Fort Lauderdale · (954) 565-5591",
    dc: 3170,
    ib: 5095,
    dcEs: "Cremación directa, contenedor del comprador (GPL Dignity 3 ago. 2026).",
    dcEn: "Direct cremation, purchaser container (Dignity GPL 3 Aug 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 3 ago. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 3 Aug 2026). Casket and plot extra.",
  };
}

function browardFuneralChoices() {
  return {
    id: "bfchoices",
    name: "Broward Funeral Choices",
    href: "https://www.browardfuneralchoices.com/",
    addr: "3776 W Oakland Park Blvd, Oakland Park · (954) 391-5052",
    dc: 995,
    ib: 3295,
    dcEs:
      "Low Cost Direct Cremation (publicado en browardfuneralchoices.com). Lote/urna aparte.",
    dcEn:
      "Low Cost Direct Cremation (published on browardfuneralchoices.com). Plot/urn extra.",
    ibEs:
      "Graveside Burial (Direct Burial) Package (lista publicada): refrigeración, traslado, ataúd calibre 20 o pino sin acabar, y servicio a pie de tumba. Cementerio aparte.",
    ibEn:
      "Graveside Burial (Direct Burial) Package (published list): refrigeration, removal, 20-gauge metal or unfinished pine casket, and graveside setup/service. Cemetery separate.",
    memCell: cell(
      3995,
      "Viewing followed by Cremation (lista publicada): 2 horas de velatorio, ataúd de alquiler, cremación y contenedor. Lote/urna aparte.",
      "Viewing followed by Cremation (published list): 2-hour viewing, rental casket, cremation, and cremation container. Plot/urn extra."
    ),
    trCell: cell(
      4495,
      "Funeral Service Packages desde $4,495 (lista publicada): velatorio y funeral, ataúd calibre 20. Cementerio aparte.",
      "Funeral Service Packages from $4,495 (published list): visitation and funeral, 20-gauge casket. Cemetery separate."
    ),
    casketIb: true,
    casketMem: true,
    casketTrad: true,
  };
}

function lifesongTallahassee() {
  return {
    id: "lifesong",
    name: "Lifesong Funerals & Cremations",
    href: "https://cdn.f1connect.net/cdn/15242D-czw/gpl/Lifesong%20Funerals%20and%20Cremations%20GPL.pdf",
    addr: "231 E 6th Ave, Tallahassee · (850) 765-3190",
    dc: 2200,
    ib: 2855,
    dcEs: "Cremación directa, contenedor del comprador (GPL 15 jun. 2025).",
    dcEn: "Direct cremation, purchaser container (GPL 15 Jun 2025).",
    ibEs: "Entierro inmediato / green burial (GPL 15 jun. 2025). Ataúd y lote aparte.",
    ibEn: "Immediate / green burial (GPL 15 Jun 2025). Casket and plot extra.",
    memCell: cell(
      3860,
      "Cremación con servicio memorial (página de precios Lifesong). Contenedor básico incluido; lote aparte.",
      "Cremation with memorial service (Lifesong pricing page). Basic container included; plot extra."
    ),
    trCell: cell(
      5380,
      "Traditional Burial Service (GPL 15 jun. 2025): velatorio y ceremonia. Ataúd y lote aparte.",
      "Traditional Burial Service (GPL 15 Jun 2025): viewing and ceremony. Casket and plot extra."
    ),
  };
}

function quattlebaumWpb() {
  return {
    id: "quattlebaum",
    name: "Quattlebaum Funeral & Cremation",
    href: "https://www.dignitymemorial.com/funeral-homes/florida/west-palm-beach/quattlebaum-funeral-cremation-and-event-center/2290/costs/funeral-price-list",
    addr: "6411 Parker Ave, West Palm Beach · (561) 833-4061",
    dc: 3495,
    ib: 5195,
    dcEs: "Cremación directa, contenedor del comprador (GPL Dignity 3 ago. 2026).",
    dcEn: "Direct cremation, purchaser container (Dignity GPL 3 Aug 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 3 ago. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 3 Aug 2026). Casket and plot extra.",
  };
}

function bellAndClarkWpb() {
  return {
    id: "bellclark",
    name: "Bell & Clark Funeral Home",
    href: "https://www.bellandclarkfuneralhomefl.com/",
    addr: "3900 Broadway Ave, West Palm Beach · (561) 693-3046",
    dc: 695,
    ib: null,
    dcEs:
      "Direct Cremation (publicado en bellandclarkfuneralhomefl.com): proceso de cremación y aprobación del médico forense.",
    dcEn:
      "Direct Cremation (published on bellandclarkfuneralhomefl.com): cremation process and medical-examiner approval.",
    ibEs: "No figura un total de entierro inmediato en su lista de paquetes publicada.",
    ibEn: "No packaged immediate-burial total on their published package list.",
    memCell: cell(
      3250,
      "Viewing with Cremation Package (lista publicada): servicio, velatorio el mismo día, embalsamado, cremación, limusina y certificado. Cementerio aparte.",
      "Viewing with Cremation Package (published list): service, same-day viewing, embalming, cremation, limousine, and death certificate. Cemetery separate."
    ),
    trCell: cell(
      4000,
      "Funeral Package desde $4,000 (lista publicada): velatorio el día anterior, servicio, embalsamado, limusina y ataúd calibre 20. Cementerio aparte.",
      "Funeral Package from $4,000 (published list): viewing the day before, service, embalming, limousine, and 20-gauge casket. Cemetery separate."
    ),
    casketTrad: true,
  };
}

function andersonMcQueenStPete() {
  return {
    id: "anderson",
    name: "Anderson-McQueen Funeral Homes",
    href: "https://sfprod.altogetherfuneral.com/on/demandware.static/-/Sites-locations-catalog/default/dw38c5f0f0/gpl/FLAMT%20GPL.pdf",
    addr: "2201 Dr MLK Jr St N, St. Petersburg · (727) 258-2929",
    dc: 4040,
    ib: 5725,
    dcEs: "Cremación directa, contenedor del comprador (GPL 7 may. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 7 May 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 7 may. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 7 May 2026). Casket and plot extra.",
  };
}

function davidGrossStPete() {
  return {
    id: "gross",
    name: "David C. Gross Funeral Homes",
    href: "https://sfprod.altogetherfuneral.com/on/demandware.static/-/Sites-locations-catalog/default/dw7b69174b/gpl/FLDGS%20Gross%20GPL.pdf",
    addr: "3622 Central Ave, St. Petersburg · (727) 408-6651",
    dc: 3830,
    ib: 4680,
    dcEs: "Cremación directa, contenedor del comprador (GPL 7 may. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 7 May 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 7 may. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 7 May 2026). Casket and plot extra.",
  };
}

module.exports = {
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
};
