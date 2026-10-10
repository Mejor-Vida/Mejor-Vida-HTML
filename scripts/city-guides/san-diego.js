/**
 * San Diego city guide — named-home columns from first-party Dignity Memorial GPLs and package lists.
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
  slug: "san-diego",
  nameEn: "San Diego",
  nameEs: "San Diego",
  heroFile: "san-diego-coronado-bridge",
  heroVer: "coronado-aerial-v1",
  heroClass: "sc-hero--san-diego",
  heroCaptionEs: "Puente Coronado y la bahía de San Diego",
  heroCaptionEn: "Coronado Bridge and San Diego Bay",
  heroW: 1280,
  heroH: 720,
  countyEs: "condado de San Diego",
  countyEn: "San Diego County",
  metroEs: ["San Diego", "Chula Vista", "Oceanside", "Escondido", "Carlsbad", "El Cajon"],
  metroEn: ["San Diego", "Chula Vista", "Oceanside", "Escondido", "Carlsbad", "El Cajon"],
  metroTitleEs: "Área metropolitana de San Diego",
  metroTitleEn: "San Diego metro area",
  nearbyGuides: [
    { slug: "los-angeles", name: "Los Angeles" },
    { slug: "san-jose", name: "San Jose" },
    { slug: "san-francisco", name: "San Francisco" },
    { slug: "fresno", name: "Fresno" },
    { slug: "sacramento", name: "Sacramento" },
  ],
  prepaidCemEs: "El Camino Memorial Park, Greenwood Memorial Park, Mount Hope Cemetery",
  prepaidCemEn: "El Camino Memorial Park, Greenwood Memorial Park, Mount Hope Cemetery",
  tableFootEs:
    "Goodbody Mortuary y Cypress View: GPL y paquetes, 4 ago. 2026. El Camino Memorial — Sorrento Valley: GPL y paquetes, 6 oct. 2026. Estimador: promedios Funeralocity de California (26 jul. 2026). Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Goodbody Mortuary and Cypress View: GPL and packages, 4 Aug 2026. El Camino Memorial — Sorrento Valley: GPL and packages, 6 Oct 2026. Estimator: California Funeralocity averages (26 Jul 2026). Always ask for the current list. These are not Mejor Vida Insurance prices.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. El Camino Memorial Park vende espacios en el mismo terreno que la funeraria Sorrento Valley (858-453-2121). Mount Hope publica una tarifa de lote para residentes en su lista municipal. Los anuncios de reventa están en el tablero de California de Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. El Camino Memorial Park sells spaces on the same grounds as the Sorrento Valley funeral home (858-453-2121). Mount Hope publishes a resident lot fee on the city fee schedule. Resale ads are on the California Grave Solutions board.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla de arriba incluye abrir/cerrar la tumba, bóveda, lápida ni funeral. Mount Hope publica un lote de entierro para residentes a <strong>$2,985</strong> y abrir/cerrar a <strong>$581</strong> (tarifas del 1 jul. 2025). El Camino y Greenwood no publican un precio de partida del lote en internet.",
  newListEn:
    "None of the starting prices in the chart include opening/closing, a vault, a marker, or the funeral. Mount Hope publishes a resident burial lot at <strong>$2,985</strong> and opening/closing at <strong>$581</strong> (fees effective 1 Jul 2025). El Camino and Greenwood do not post a starting plot price online.",
  plotPriceRange: {
    titleEs: "¿Cuánto cuesta un lote en el área de San Diego?",
    titleEn: "What does a burial plot cost in the San Diego area?",
    introEs:
      "Solo el <strong>espacio de la tumba en el cementerio</strong> (el lote), cuando hay una lista publicada o un anuncio que cita el precio de venta del cementerio. <strong>No</strong> incluye abrir/cerrar, bóveda, lápida ni funeral. No es un promedio oficial del condado.",
    introEn:
      "Only the <strong>cemetery grave space</strong> (the plot), when a published list or an ad cites the cemetery’s retail price. <strong>Does not</strong> include opening/closing, a vault, a marker, or the funeral. Not an official county average.",
    low: {
      amount: 2985,
      labelEs: "Precio publicado más bajo (lote)",
      labelEn: "Lowest published lot price",
      noteEs:
        "Mount Hope Cemetery — tarifa de lote para residentes (1 jul. 2025). No incluye abrir/cerrar ni bóveda.",
      noteEn:
        "Mount Hope Cemetery — resident burial lot fee (1 Jul 2025). Does not include opening/closing or a vault.",
    },
    mid: {
      amount: 10000,
      labelEs: "Rango típico (anuncios de reventa)",
      labelEn: "Typical range (resale ads)",
      noteEs:
        "Muchos anuncios de particulares en El Camino Memorial Park y Greenwood piden unos $7,500–$15,000 por espacio; la mediana en tableros de reventa suele rondar $10,000.",
      noteEn:
        "Many private ads at El Camino Memorial Park and Greenwood ask about $7,500 to $15,000 per space; resale boards often show a median near $10,000.",
    },
    high: {
      amount: 20000,
      labelEs: "Precio de venta citado (cementerio privado)",
      labelEn: "Cited cemetery retail (private park)",
      noteEs:
        "Anuncios de reventa en 2025–2026 citaron unos $17,500–$20,000 como precio de venta del cementerio en secciones de El Camino Memorial Park.",
      noteEn:
        "Resale ads in 2025–2026 cited about $17,500 to $20,000 as the cemetery’s retail price in sections of El Camino Memorial Park.",
    },
    footEs:
      "Fuentes: <a href=\"https://www.sandiego.gov/sites/default/files/2024-09/mthoperesfees.pdf\" rel=\"noopener\" target=\"_blank\">Mount Hope resident fees (1 jul. 2025)</a>; anuncios en <a href=\"https://www.gravesolutions.com/for-sale/cemetery-properties/california\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> y <a href=\"https://thecemeteryexchange.com/tce-sandiego-ca.htm\" rel=\"noopener\" target=\"_blank\">The Cemetery Exchange</a> que citan precios de venta de El Camino Memorial Park. El rango típico resume anuncios de particulares, no es una estadística del estado. Abrir/cerrar en Mount Hope: $581 (misma tarifa).",
    footEn:
      "Sources: <a href=\"https://www.sandiego.gov/sites/default/files/2024-09/mthoperesfees.pdf\" rel=\"noopener\" target=\"_blank\">Mount Hope resident fees (1 Jul 2025)</a>; ads on <a href=\"https://www.gravesolutions.com/for-sale/cemetery-properties/california\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> and <a href=\"https://thecemeteryexchange.com/tce-sandiego-ca.htm\" rel=\"noopener\" target=\"_blank\">The Cemetery Exchange</a> citing El Camino Memorial Park retail prices. The typical figure summarizes private ads; it is not a state statistic. Mount Hope opening/closing: $581 (same fee schedule).",
  },
  plotOpenClose: 581,
  plotNew: 10000,
  plotResale: 7500,
  plotNewLabelEs: "Nuevo, oficina del cementerio (unos $10,000 — rango típico del área)",
  plotNewLabelEn: "New, from the cemetery office (about $10,000 — typical area range)",
  plotPublished: [],
  plotOffices: [
    {
      name: "El Camino Memorial Park",
      addr: "5600 Carroll Canyon Rd, San Diego",
      phone: "858-453-2121",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-diego/el-camino-memorial-sorrento-valley/9555",
      noteEs: "Vende espacios en el mismo terreno que la funeraria Sorrento Valley.",
      noteEn: "Sells spaces on the same grounds as the Sorrento Valley funeral home.",
    },
    {
      name: "Mount Hope Cemetery",
      addr: "3751 Market St, San Diego",
      phone: "619-527-3400",
      href: "https://www.sandiego.gov/park-and-recreation/general-info/mthope",
      noteEs: "Cementerio municipal con tarifas publicadas en la web de la ciudad.",
      noteEn: "City cemetery with fees published on the city website.",
    },
    {
      name: "Greenwood Memorial Park",
      addr: "4300 Imperial Ave, San Diego",
      phone: "619-264-3131",
      href: "https://www.greenwoodmemorial.com/",
      noteEs: "No publica el precio del lote en internet. Pida la lista por escrito.",
      noteEn: "Does not publish plot prices online. Ask for the list in writing.",
    },
  ],
  officesEs: [
    "<strong>El Camino Memorial Park</strong> — 5600 Carroll Canyon Rd. Teléfono 858-453-2121.",
    "<strong>Mount Hope Cemetery</strong> — 3751 Market St. Teléfono 619-527-3400.",
    "<strong>Greenwood Memorial Park</strong> — 4300 Imperial Ave. Teléfono 619-264-3131.",
  ],
  officesEn: [
    "<strong>El Camino Memorial Park</strong> — 5600 Carroll Canyon Rd. Phone 858-453-2121.",
    "<strong>Mount Hope Cemetery</strong> — 3751 Market St. Phone 619-527-3400.",
    "<strong>Greenwood Memorial Park</strong> — 4300 Imperial Ave. Phone 619-264-3131.",
  ],
  analysisSameEs:
    "Goodbody Mortuary publica cremación directa desde <strong>$1,960</strong> y entierro inmediato desde <strong>$4,270</strong> (contenedor del comprador). Su paquete Tribute de cremación (<strong>$3,890</strong>) ya mete reunión sencilla y urna. El Camino Sorrento Valley publica cremación directa desde <strong>$2,685</strong>, entierro inmediato desde <strong>$5,745</strong> y el Tribute de funeral (<strong>$14,445</strong>) ya incluye ataúd recomendado. Cypress View publica cremación directa desde <strong>$2,085</strong> y el Tribute de funeral (<strong>$11,690</strong>) con ataúd recomendado. El promedio de California (<strong>$8,050</strong>) suele incluir ataúd; no es el paquete de una casa.",
  analysisSameEn:
    "Goodbody Mortuary publishes direct cremation from <strong>$1,960</strong> and immediate burial from <strong>$4,270</strong> (purchaser container). Its Tribute cremation package (<strong>$3,890</strong>) already puts in a simple gathering and an urn. El Camino Sorrento Valley publishes direct cremation from <strong>$2,685</strong>, immediate burial from <strong>$5,745</strong>, and the Tribute funeral package (<strong>$14,445</strong>) already includes a recommended casket. Cypress View publishes direct cremation from <strong>$2,085</strong>, and the Tribute funeral package (<strong>$11,690</strong>) includes a recommended casket. California’s average (<strong>$8,050</strong>) usually includes a casket; it is not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En El Camino Memorial Park llame al <strong>858-453-2121</strong>. Mount Hope publica lote y abrir/cerrar en su tarifa municipal.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At El Camino Memorial Park call <strong>858-453-2121</strong>. Mount Hope publishes lot and opening/closing on its city fee schedule.",
  analysisCheapEs:
    "La cremación directa es el atajo más barato que publican: <strong>$1,960</strong> en Goodbody Mortuary, <strong>$2,085</strong> en Cypress View y <strong>$2,685</strong> en El Camino Sorrento Valley. El estimador usa <strong>$1,647</strong> para California. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
  analysisCheapEn:
    "Direct cremation is the cheapest published shortcut: <strong>$1,960</strong> at Goodbody Mortuary, <strong>$2,085</strong> at Cypress View, and <strong>$2,685</strong> at El Camino Sorrento Valley. The estimator uses <strong>$1,647</strong> for California. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
  resaleHref: "https://www.gravesolutions.com/for-sale/cemetery-properties/california",
  unpublishedLeadEs:
    "Estas funerarias atienden el área pero no publican en internet los cuatro paquetes con precios en esta guía. Llame y pida la lista general de precios vigente.",
  unpublishedLeadEn:
    "These funeral homes serve the area but do not publish all four priced packages online in this guide. Call and ask for the current general price list.",
  unpublishedHomes: [
    {
      name: "Greenwood Memorial Park & Mortuary",
      href: "https://cdn.f1connect.net/cdn/14450D-cDs/gpl/Greenwood%20Memorial%20Park%20Mortuary%20and%20Crematory%20GPL.pdf",
      addr: "4300 Imperial Ave",
      phone: "619-264-3131",
    },
    {
      name: "Neptune Society — San Diego",
      href: "https://neptunesandiego.com/files/Neptune_Society_GPL_Jan2026.pdf",
      addr: "El Cajon (cremación)",
      phone: "619-442-3777",
    },
    {
      name: "Pacific View Memorial Park",
      href: "https://www.dignitymemorial.com/funeral-homes/california/coronado/pacific-view-memorial-park/9556",
      addr: "4300 Valeta Terrace, San Diego",
      phone: "619-523-3131",
    },
  ],
  homes: [
    {
      id: "goodbody",
      name: "Goodbody Mortuary",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-diego/goodbody-mortuary/4616/funeral-price-list",
      addr: "5027 El Cajon Blvd · 619-582-1700",
      dc: 1960,
      ib: 4270,
      dcEs: "Cremación directa con Pacific Pine (GPL 4 ago. 2026). Crematorio incluido. Sin ceremonia.",
      dcEn: "Direct cremation with Pacific Pine (GPL 4 Aug 2026). Crematory included. No ceremony.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 4 ago. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 4 Aug 2026). Casket and plot extra.",
      memCell: tributeCrem(3890),
      trCell: cell(
        11085,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "ecsv",
      name: "El Camino Memorial — Sorrento Valley",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-diego/el-camino-memorial-sorrento-valley/9555/costs/funeral-price-list",
      addr: "5600 Carroll Canyon Rd · 858-453-2121",
      dc: 2685,
      ib: 5745,
      dcEs: "Cremación directa con Pacific Pine (GPL 6 oct. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Pacific Pine (GPL 6 Oct 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 6 oct. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 6 Oct 2026). Casket and plot extra.",
      memCell: tributeCrem(5415),
      trCell: cell(
        14445,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,795. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,795 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "cypress",
      name: "Cypress View Mortuary & Crematory",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-diego/cypress-view-mausoleum-mortuary-and-crematory/9557/costs/funeral-price-list",
      addr: "3953 Imperial Ave · 619-264-3168",
      dc: 2085,
      ib: 4720,
      dcEs: "Cremación directa con Pacific Pine (GPL 4 ago. 2026). Crematorio en el mismo lugar.",
      dcEn: "Direct cremation with Pacific Pine (GPL 4 Aug 2026). On-site crematory.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 4 ago. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 4 Aug 2026). Casket and plot extra.",
      memCell: tributeCrem(4215),
      trCell: cell(
        11690,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
  ],
});
