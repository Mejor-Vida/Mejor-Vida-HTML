/**
 * Arizona funeral-home GPL columns (first-party lists only).
 * Prices copied from each home’s published GPL or package list — not Funeralocity.
 */
const { cell } = require("./az-factory");

const NO_GPL_LEAD_ES =
  "Estas funerarias no publican en internet los cuatro paquetes de la tabla. Llame y pida la lista general de precios vigente.";
const NO_GPL_LEAD_EN =
  "These funeral homes do not publish all four packages on this chart online. Call and ask for the current general price list.";

const SERVICE_AREA_LEAD_ES =
  "Las columnas son funerarias del área metropolitana que publican lista propia; no están todas dentro de los límites de la ciudad. Las funerarias locales aparecen abajo. Llame y pida la lista vigente.";
const SERVICE_AREA_LEAD_EN =
  "Columns are metro funeral homes with their own published lists; not every home is inside the city limits. Local funeral homes are listed below. Call and ask for the current list.";

function eastLakeMortuary() {
  return {
    id: "eastlake",
    name: "East Lake Mortuary",
    href: "https://cdn.f1connect.net/cdn/15172D-cTs/gpl/Eastlake%20Mortuary%20GPL.pdf",
    addr: "1715 E Jefferson St, Phoenix · (602) 253-4105",
    dc: 975,
    ib: 1000,
    dcEs: "Cremación directa, contenedor del comprador (GPL 7 mar. 2024).",
    dcEn: "Direct cremation, purchaser container (GPL 7 Mar 2024).",
    ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
    ibEn: "Immediate burial, purchaser casket. Plot extra.",
    memCell: cell(
      1350,
      "Cremación con memorial en la funeraria, sin restos presentes (GPL 7 mar. 2024). Urna incluida en cremación directa; memorial aparte de lote.",
      "Cremation with memorial at the funeral home, without remains present (GPL 7 Mar 2024). Direct cremation includes a temporary urn; plot extra."
    ),
    trCell: cell(
      2995,
      "Paquete C-60: velatorio 1 h, embalsamado y ataúd de tela incluido (GPL 7 mar. 2024). Lote aparte.",
      "C-60 package: 1-hour visitation, embalming, and cloth-covered casket included (GPL 7 Mar 2024). Plot extra."
    ),
    casketTrad: true,
  };
}

function simplyCremation() {
  return {
    id: "simply",
    name: "Simply Cremation and Funeral Arrangements",
    href: "https://cdn.f1connect.net/cdn/15550D-Kz0/gpl/Simply%20Cremation%20and%20Funeral%20Arrangements%20GPL.pdf",
    addr: "16952 W Bell Rd, Surprise · (623) 975-9393",
    dc: 2645,
    ib: 2330,
    dcEs: "Cremación directa, contenedor del comprador (GPL 6 oct. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 6 Oct 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 6 oct. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 6 Oct 2026). Casket and plot extra.",
  };
}

function bringsBroadway() {
  return {
    id: "brings",
    name: "Bring’s Broadway Chapel",
    href: "https://www.bringfuneralhome.com/",
    addr: "6910 E Broadway Blvd, Tucson · (520) 296-7193",
    dc: 2290,
    ib: 3195,
    dcEs: "Cremación directa, contenedor del comprador (GPL 29 abr. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 29 Apr 2026).",
    ibEs: "Entierro inmediato, ataúd del comprador (GPL 29 abr. 2026). Lote aparte.",
    ibEn: "Immediate burial, purchaser casket (GPL 29 Apr 2026). Plot extra.",
    memCell: cell(
      6570,
      "Paquete Classic Tribute Cremation (lista de paquetes 29 abr. 2026). Incluye allowance de ataúd y urna según la lista.",
      "Classic Tribute Cremation package (package list 29 Apr 2026). Includes casket and urn allowances per the list."
    ),
    trCell: cell(
      7475,
      "Paquete Reflection Burial (lista de paquetes 29 abr. 2026). Incluye allowance de ataúd. Lote aparte.",
      "Reflection Burial package (package list 29 Apr 2026). Includes a casket allowance. Plot extra."
    ),
    casketMem: true,
    casketTrad: true,
  };
}

function evergreenTucson() {
  return {
    id: "evergreen",
    name: "Evergreen Mortuary & Cemetery",
    href: "https://cdn.f1connect.net/cdn/14439D-JTs/gpl/Evergreen%20Mortuary%20Cemetery%20and%20Crematory%20GPL.pdf",
    addr: "3015 N Oracle Rd, Tucson · (520) 888-7470",
    dc: 1740,
    ib: 2495,
    dcEs: "Cremación directa (GPL 12 feb. 2026).",
    dcEn: "Direct cremation (GPL 12 Feb 2026).",
    ibEs: "Entierro inmediato (GPL 12 feb. 2026). Ataúd y lote aparte salvo paquete.",
    ibEn: "Immediate burial (GPL 12 Feb 2026). Casket and plot extra unless a package says otherwise.",
    memCell: cell(
      6005,
      "Paquete Simple Memorial Cremation, nivel Basic (GPL 12 feb. 2026). Urna y contenedor según la lista.",
      "Simple Memorial Cremation package, Basic tier (GPL 12 Feb 2026). Urn and container per the list."
    ),
    trCell: cell(
      8415,
      "Paquete Basic Burial con velatorio (GPL 12 feb. 2026). Incluye ataúd del paquete. Cementerio aparte.",
      "Basic Burial package with visitation (GPL 12 Feb 2026). Includes the package casket. Cemetery charges extra."
    ),
    casketMem: true,
    casketTrad: true,
  };
}

function buelerChandler() {
  return {
    id: "bueler",
    name: "Whitney & Murphy Bueler Mortuary",
    href: "https://www.buelermortuary.com/resources/gpl",
    addr: "14 W Hulet Dr, Chandler · (480) 963-6351",
    dc: 1785,
    ib: 1785,
    dcEs: "Cremación directa, contenedor del comprador (GPL 7 feb. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 7 Feb 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 7 feb. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 7 Feb 2026). Casket and plot extra.",
    memCell: cell(
      2985,
      "Paquete Cremation with Memorial Service (opciones personalizadas 1 feb. 2026). Urna y ataúd aparte salvo lo que indique la lista.",
      "Cremation with Memorial Service package (personalized options 1 Feb 2026). Urn and casket extra unless the list says otherwise."
    ),
    trCell: cell(
      4195,
      "Paquete Traditional Funeral Service con velatorio y ceremonia (opciones personalizadas 1 feb. 2026). Ataúd y lote aparte.",
      "Traditional Funeral Service package with visitation and ceremony (personalized options 1 Feb 2026). Casket and plot extra."
    ),
  };
}

function bunkerGardenChapel() {
  return {
    id: "bunker",
    name: "Bunker Family Funeral Home — Garden Chapel",
    href: "https://bunkerfuneral.com/general-price-list/",
    addr: "33 N Centennial Way, Mesa · (480) 964-8686",
    dc: 1695,
    ib: 1695,
    dcEs: "Cremación directa, contenedor del comprador (GPL 14 sep. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 14 Sep 2026).",
    ibEs: "Entierro inmediato, contenedor del comprador (GPL 14 sep. 2026). Ataúd y lote aparte.",
    ibEn: "Immediate burial, purchaser container (GPL 14 Sep 2026). Casket and plot extra.",
    trCell: cell(
      4295,
      "Paquete Full Service With Same Day Visitation (GPL 14 sep. 2026): velatorio, embalsamado y ceremonia. Ataúd y lote aparte salvo lo que indique la lista en la funeraria.",
      "Full Service With Same Day Visitation package (GPL 14 Sep 2026): visitation, embalming, and ceremony. Casket and plot extra unless the list at the funeral home says otherwise."
    ),
  };
}

function meldrumMortuary() {
  return {
    id: "meldrum",
    name: "Meldrum Mortuary",
    href: "https://www.meldrummortuary.com/",
    addr: "52 N Macdonald, Mesa · (480) 834-9255",
    dc: 1195,
    ib: 1595,
    dcEs: "Cremación directa, contenedor del comprador (GPL 13 may. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 13 May 2026).",
    ibEs: "Entierro inmediato, ataúd del comprador (GPL 13 may. 2026). Lote aparte.",
    ibEn: "Immediate burial, purchaser casket (GPL 13 May 2026). Plot extra.",
  };
}

function wymanChapel() {
  return {
    id: "wyman",
    name: "Wyman Cremation & Burial Chapel",
    href: "https://www.wymancremation.com/",
    addr: "115 S Country Club Dr, Mesa · (480) 668-2898",
    dc: 895,
    ib: 1395,
    dcEs: "Cremación directa, contenedor del comprador (GPL en línea, Altogether Funeral).",
    dcEn: "Direct cremation, purchaser container (GPL online, Altogether Funeral).",
    ibEs: "Entierro inmediato, ataúd del comprador (GPL en línea). Lote aparte.",
    ibEn: "Immediate burial, purchaser casket (GPL online). Plot extra.",
  };
}

function falconerGilbert() {
  return {
    id: "falconer",
    name: "Falconer Funeral Home",
    href: "https://sfprod.altogetherfuneral.com/on/demandware.static/-/Sites-locations-catalog/default/dwd8517d22/gpl/AZFLC%20GPL.pdf",
    addr: "251 W Juniper Ave, Gilbert · (480) 892-9411",
    dc: 2395,
    ib: 2795,
    dcEs: "Cremación directa, contenedor del comprador (GPL 29 jun. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 29 Jun 2026).",
    ibEs: "Entierro inmediato, ataúd del comprador (GPL 29 jun. 2026). Lote aparte.",
    ibEn: "Immediate burial, purchaser casket (GPL 29 Jun 2026). Plot extra.",
    memCell: cell(
      4295,
      "Paquete con servicio memorial y recepción en la funeraria (lista de paquetes 29 jun. 2026). Urna y contenedor según la lista.",
      "Package with memorial service and reception at the funeral home (package list 29 Jun 2026). Urn and container per the list."
    ),
    trCell: cell(
      6825,
      "Paquete de entierro con velatorio el mismo día y ceremonia (lista de paquetes 29 jun. 2026). Ataúd y lote aparte salvo lo que indique la lista.",
      "Burial package with same-day visitation and ceremony (package list 29 Jun 2026). Casket and plot extra unless the list says otherwise."
    ),
  };
}

const ESTIMATOR_FOOT_ES =
  " Estimador: promedios Funeralocity de Arizona (9 oct. 2026). Pida siempre la lista actual. No son precios de Mejor Vida Seguros.";
const ESTIMATOR_FOOT_EN =
  " Estimator: Arizona Funeralocity averages (9 Oct 2026). Always ask for the current list. These are not Mejor Vida Insurance prices.";

module.exports = {
  NO_GPL_LEAD_ES,
  NO_GPL_LEAD_EN,
  SERVICE_AREA_LEAD_ES,
  SERVICE_AREA_LEAD_EN,
  ESTIMATOR_FOOT_ES,
  ESTIMATOR_FOOT_EN,
  eastLakeMortuary,
  simplyCremation,
  bringsBroadway,
  evergreenTucson,
  meldrumMortuary,
  wymanChapel,
  falconerGilbert,
  bunkerGardenChapel,
  buelerChandler,
};
