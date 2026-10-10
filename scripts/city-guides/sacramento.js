/**
 * Sacramento city guide — named-home columns from first-party Dignity Memorial GPLs and package lists.
 */
const { makeCity, cell } = require("./ca-factory");

function tributeCrem(amt) {
  return cell(
    amt,
    "Paquete Tribute de cremación: reunión sencilla, urna y contenedor Trayview o Safeway. Sin velatorio con cuerpo.",
    "Tribute cremation package: simple gathering, urn, and Trayview or Safeway container. No body present."
  );
}

module.exports = makeCity({
  slug: "sacramento",
  nameEn: "Sacramento",
  nameEs: "Sacramento",
  heroFile: "sacramento-tower-bridge-aerial",
  heroVer: "tower-bridge-aerial-v1",
  heroClass: "sc-hero--sacramento",
  heroCaptionEs: "Vista aérea del Tower Bridge y el río Sacramento",
  heroCaptionEn: "Aerial view of the Tower Bridge and Sacramento River",
  heroW: 1600,
  heroH: 900,
  countyEs: "condado de Sacramento",
  countyEn: "Sacramento County",
  metroEs: ["Sacramento", "Elk Grove", "Roseville", "Folsom", "Citrus Heights", "Rancho Cordova"],
  metroEn: ["Sacramento", "Elk Grove", "Roseville", "Folsom", "Citrus Heights", "Rancho Cordova"],
  metroTitleEs: "Sacramento y el condado de Sacramento",
  metroTitleEn: "Sacramento and Sacramento County",
  nearbyGuides: [
    { slug: "los-angeles", name: "Los Angeles" },
    { slug: "san-diego", name: "San Diego" },
    { slug: "san-jose", name: "San Jose" },
    { slug: "san-francisco", name: "San Francisco" },
    { slug: "fresno", name: "Fresno" },
  ],
  prepaidCemEs: "East Lawn Memorial Park, East Lawn Sierra Hills Memorial Park, St. Mary’s Catholic Cemetery",
  prepaidCemEn: "East Lawn Memorial Park, East Lawn Sierra Hills Memorial Park, St. Mary’s Catholic Cemetery",
  tableFootEs:
    "North Sacramento Funeral Home: GPL y paquetes, 28 sep. 2026. Lombard Funeral Home y Nicoletti, Culjis & Herberger Funeral Home: GPL y paquetes, 1 oct. 2026. Estimador: promedios Funeralocity de California (26 jul. 2026). Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "North Sacramento Funeral Home: GPL and packages, 28 Sep 2026. Lombard Funeral Home and Nicoletti, Culjis & Herberger Funeral Home: GPL and packages, 1 Oct 2026. Estimator: California Funeralocity averages (26 Jul 2026). Always ask for the current list. These are not Mejor Vida Insurance prices.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. East Lawn Memorial Park vende espacios en Folsom Boulevard (916-732-2000). East Lawn Sierra Hills atiende el área norte (916-732-2020). Los anuncios de reventa están en el tablero de California de Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. East Lawn Memorial Park sells spaces on Folsom Boulevard (916-732-2000). East Lawn Sierra Hills serves the north area (916-732-2020). Resale ads are on the California Grave Solutions board.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla de arriba incluye abrir/cerrar la tumba, bóveda, lápida ni funeral. East Lawn no publica un precio de partida del lote en internet. Los anuncios de reventa en East Lawn Memorial Park citan a veces unos <strong>$6,400</strong> por espacio (Briggs Addition) hasta <strong>$10,000</strong> por espacio en secciones como South Terrace.",
  newListEn:
    "None of the starting prices in the chart include opening/closing, a vault, a marker, or the funeral. East Lawn does not post a starting plot price online. Resale ads at East Lawn Memorial Park sometimes cite about <strong>$6,400</strong> per space (Briggs Addition) up to <strong>$10,000</strong> per space in sections such as South Terrace.",
  plotPriceRange: {
    titleEs: "¿Cuánto cuesta un lote en el área de Sacramento?",
    titleEn: "What does a burial plot cost in the Sacramento area?",
    introEs:
      "Solo el <strong>espacio de la tumba en el cementerio</strong> (el lote), cuando hay una lista publicada o un anuncio que cita el precio de venta del cementerio. <strong>No</strong> incluye abrir/cerrar, bóveda, lápida ni funeral. No es un promedio oficial del condado.",
    introEn:
      "Only the <strong>cemetery grave space</strong> (the plot), when a published list or an ad cites the cemetery’s retail price. <strong>Does not</strong> include opening/closing, a vault, a marker, or the funeral. Not an official county average.",
    low: {
      amount: 6400,
      labelEs: "Reventa (anuncio citado)",
      labelEn: "Resale (cited ad)",
      noteEs:
        "Anuncio de reventa por espacio en East Lawn Memorial Park (Briggs Addition) que citaba un precio de lista del cementerio de unos $9,950.",
      noteEn:
        "Resale ad for a space at East Lawn Memorial Park (Briggs Addition) citing a cemetery list price of about $9,950.",
    },
    mid: {
      amount: 8500,
      labelEs: "Rango típico (anuncios de reventa)",
      labelEn: "Typical range (resale ads)",
      noteEs:
        "Muchos anuncios de particulares en East Lawn Memorial Park y Sierra Hills piden unos $5,200–$10,000 por espacio; la mediana en tableros de reventa suele rondar $8,500.",
      noteEn:
        "Many private ads at East Lawn Memorial Park and Sierra Hills ask about $5,200 to $10,000 per space; resale boards often show a median near $8,500.",
    },
    high: {
      amount: 10000,
      labelEs: "Precio de venta citado (sección premium)",
      labelEn: "Cited asking price (premium section)",
      noteEs:
        "Anuncios históricos en South Terrace de East Lawn Memorial Park pidieron <strong>$10,000</strong> por espacio junto a la vía principal.",
      noteEn:
        "Historical ads in East Lawn Memorial Park’s South Terrace asked <strong>$10,000</strong> per space along the main drive.",
    },
    footEs:
      "Fuentes: anuncios en <a href=\"https://www.gravesolutions.com/search?SiteState=CA&amp;SiteCity=SACRAMENTO\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> y listados de reventa que citan East Lawn Memorial Park; <a href=\"https://www.eastlawn.com/east-sacramento/\" rel=\"noopener\" target=\"_blank\">East Lawn Memorial Park</a> (tarifas de lote en la oficina, no en la web). El rango típico resume anuncios de particulares, no es una estadística del estado.",
    footEn:
      "Sources: ads on <a href=\"https://www.gravesolutions.com/search?SiteState=CA&amp;SiteCity=SACRAMENTO\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> and resale listings citing East Lawn Memorial Park; <a href=\"https://www.eastlawn.com/east-sacramento/\" rel=\"noopener\" target=\"_blank\">East Lawn Memorial Park</a> (plot fees at the office, not online). The typical figure summarizes private ads; it is not a state statistic.",
  },
  plotNew: 8500,
  plotResale: 6400,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — muchos espacios en East Lawn superan $8,500)",
  plotNewLabelEn: "New, from the cemetery office (ask for the list — many East Lawn spaces exceed $8,500)",
  plotPublished: [],
  plotOffices: [
    {
      name: "East Lawn Memorial Park",
      addr: "4300 Folsom Blvd, Sacramento",
      phone: "916-732-2000",
      href: "https://www.eastlawn.com/east-sacramento/",
      noteEs: "Cementerio y funeraria en East Sacramento. No publica el precio del lote en internet.",
      noteEn: "Cemetery and funeral home in East Sacramento. Does not publish plot prices online.",
    },
    {
      name: "East Lawn Sierra Hills Memorial Park",
      addr: "5757 Greenback Ln, Sacramento",
      phone: "916-732-2020",
      href: "https://www.eastlawn.com/greenback/",
      noteEs: "Cementerio en Greenback Lane. Pida la lista por escrito.",
      noteEn: "Cemetery on Greenback Lane. Ask for the list in writing.",
    },
    {
      name: "St. Mary’s Catholic Cemetery",
      addr: "6700 21st Ave, Sacramento",
      phone: "916-452-6864",
      href: "https://www.scdiocese.org/cemeteries",
      noteEs: "Cementerio diocesano. La tarifa vigente está en la oficina de cementerios.",
      noteEn: "Diocesan cemetery. Current fees are at the cemeteries office.",
    },
  ],
  officesEs: [
    "<strong>East Lawn Memorial Park</strong> — 4300 Folsom Blvd. Teléfono 916-732-2000.",
    "<strong>East Lawn Sierra Hills Memorial Park</strong> — 5757 Greenback Ln. Teléfono 916-732-2020.",
    "<strong>St. Mary’s Catholic Cemetery</strong> — 6700 21st Ave. Teléfono 916-452-6864.",
  ],
  officesEn: [
    "<strong>East Lawn Memorial Park</strong> — 4300 Folsom Blvd. Phone 916-732-2000.",
    "<strong>East Lawn Sierra Hills Memorial Park</strong> — 5757 Greenback Ln. Phone 916-732-2020.",
    "<strong>St. Mary’s Catholic Cemetery</strong> — 6700 21st Ave. Phone 916-452-6864.",
  ],
  analysisSameEs:
    "North Sacramento Funeral Home publica cremación directa desde <strong>$1,840</strong> y entierro inmediato desde <strong>$2,640</strong>. Su paquete Tribute de cremación (<strong>$3,250</strong>) incluye urna del listado; el Tribute de funeral (<strong>$8,915</strong>) incluye ataúd recomendado de $2,495. Lombard Funeral Home publica cremación directa desde <strong>$1,960</strong>, entierro inmediato desde <strong>$4,070</strong> y el Tribute de funeral (<strong>$11,510</strong>) con ataúd de $3,395. Nicoletti, Culjis & Herberger publica cremación directa desde <strong>$2,460</strong>, entierro inmediato desde <strong>$5,020</strong> y el Tribute de funeral (<strong>$13,150</strong>) con ataúd de $3,395. El promedio de California (<strong>$8,050</strong>) suele incluir ataúd; no es el paquete de una casa.",
  analysisSameEn:
    "North Sacramento Funeral Home publishes direct cremation from <strong>$1,840</strong> and immediate burial from <strong>$2,640</strong>. Its Tribute cremation package (<strong>$3,250</strong>) includes a listed urn; the Tribute funeral package (<strong>$8,915</strong>) includes a $2,495 recommended casket. Lombard Funeral Home publishes direct cremation from <strong>$1,960</strong>, immediate burial from <strong>$4,070</strong>, and the Tribute funeral package (<strong>$11,510</strong>) with a $3,395 casket. Nicoletti, Culjis & Herberger publishes direct cremation from <strong>$2,460</strong>, immediate burial from <strong>$5,020</strong>, and the Tribute funeral package (<strong>$13,150</strong>) with a $3,395 casket. California’s average (<strong>$8,050</strong>) usually includes a casket; it is not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En East Lawn Memorial Park llame al <strong>916-732-2000</strong>. Sierra Hills está en <strong>916-732-2020</strong>; no publican el lote en la web.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At East Lawn Memorial Park call <strong>916-732-2000</strong>. Sierra Hills is at <strong>916-732-2020</strong>; they do not publish plot prices online.",
  analysisCheapEs:
    "La cremación directa es el atajo más barato que publican: <strong>$1,840</strong> en North Sacramento Funeral Home, <strong>$1,960</strong> en Lombard Funeral Home (Pacific Pine) y <strong>$2,460</strong> en Nicoletti, Culjis & Herberger. El estimador usa <strong>$1,647</strong> para California. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
  analysisCheapEn:
    "Direct cremation is the cheapest published shortcut: <strong>$1,840</strong> at North Sacramento Funeral Home, <strong>$1,960</strong> at Lombard Funeral Home (Pacific Pine), and <strong>$2,460</strong> at Nicoletti, Culjis & Herberger. The estimator uses <strong>$1,647</strong> for California. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
  resaleHref: "https://www.gravesolutions.com/for-sale/cemetery-properties/california",
  unpublishedLeadEs:
    "Estas funerarias atienden el área pero no publican en internet los cuatro paquetes con precios en esta guía. Llame y pida la lista general de precios vigente.",
  unpublishedLeadEn:
    "These funeral homes serve the area but do not publish all four priced packages online in this guide. Call and ask for the current general price list.",
  unpublishedHomes: [
    {
      name: "East Lawn Memorial Park & Mortuary",
      href: "https://www.eastlawn.com/wp-content/uploads/2022/10/East-Lawn-General-Price-List-eff.-10.1.22-1.pdf",
      addr: "4300 Folsom Blvd, Sacramento",
      phone: "916-732-2000",
    },
    {
      name: "W.F. Gormley & Sons Funeral Chapel",
      href: "https://www.gormleyfuneral.com/",
      addr: "2015 Capitol Ave, Sacramento",
      phone: "916-441-1371",
    },
    {
      name: "Price Funeral Chapel",
      href: "https://www.pricefuneralchapel.com/",
      addr: "6335 Sunrise Blvd, Citrus Heights",
      phone: "916-725-2181",
    },
  ],
  homes: [
    {
      id: "north-sacramento",
      name: "North Sacramento Funeral Home",
      href: "https://www.dignitymemorial.com/funeral-homes/california/sacramento/north-sacramento-funeral-home/3060/funeral-price-list",
      addr: "725 El Camino Ave · 916-922-9668",
      dc: 1840,
      ib: 2640,
      dcEs: "Cremación directa con Trayview 29 (GPL 28 sep. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Trayview 29 (GPL 28 Sep 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 28 sep. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 28 Sep 2026). Casket and plot extra.",
      memCell: tributeCrem(3250),
      trCell: cell(
        8915,
        "Paquete Tribute Funeral: ceremonia en capilla o en iglesia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: chapel or church ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "lombard",
      name: "Lombard Funeral Home",
      href: "https://www.dignitymemorial.com/funeral-homes/california/sacramento/lombard-funeral-home/9575/funeral-price-list",
      addr: "1550 Fulton Ave · 916-483-3297",
      dc: 1960,
      ib: 4070,
      dcEs: "Cremación directa con Pacific Pine (GPL 1 oct. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Pacific Pine (GPL 1 Oct 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 1 oct. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 1 Oct 2026). Casket and plot extra.",
      memCell: tributeCrem(3790),
      trCell: cell(
        11510,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $3,395. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $3,395 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "nicoletti",
      name: "Nicoletti, Culjis & Herberger Funeral Home",
      href: "https://www.dignitymemorial.com/funeral-homes/california/sacramento/nicoletti-culjis-herberger-funeral-home/7043/funeral-price-list",
      addr: "5401 Folsom Blvd · 916-451-7284",
      dc: 2460,
      ib: 5020,
      dcEs: "Cremación directa con Pacific Pine (GPL 1 oct. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Pacific Pine (GPL 1 Oct 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 1 oct. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 1 Oct 2026). Casket and plot extra.",
      memCell: tributeCrem(4540),
      trCell: cell(
        13150,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $3,395. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $3,395 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
  ],
});
