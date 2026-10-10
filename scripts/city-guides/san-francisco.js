/**
 * San Francisco city guide — named-home columns from first-party GPLs and package lists.
 */
const { makeCity, cell } = require("./ca-factory");

function cremationPlanB(amt) {
  return cell(
    amt,
    "Paquete Cremation Plan B: cremación directa, servicio memorial en la funeraria y urna. Sin velatorio con cuerpo.",
    "Cremation Plan B package: direct cremation, memorial service at the funeral home, and an urn. No body present."
  );
}

module.exports = makeCity({
  slug: "san-francisco",
  nameEn: "San Francisco",
  nameEs: "San Francisco",
  heroFile: "san-francisco-golden-gate",
  heroVer: "golden-gate-v1",
  heroClass: "sc-hero--san-francisco",
  heroCaptionEs: "Puente Golden Gate, San Francisco",
  heroCaptionEn: "Golden Gate Bridge, San Francisco",
  heroW: 1200,
  heroH: 900,
  countyEs: "condado de San Francisco",
  countyEn: "San Francisco County",
  metroEs: ["San Francisco", "Daly City", "South San Francisco", "San Bruno"],
  metroEn: ["San Francisco", "Daly City", "South San Francisco", "San Bruno"],
  metroTitleEs: "San Francisco y la península inmediata",
  metroTitleEn: "San Francisco and the immediate peninsula",
  nearbyGuides: [
    { slug: "san-jose", name: "San Jose" },
    { slug: "los-angeles", name: "Los Angeles" },
    { slug: "sacramento", name: "Sacramento" },
    { slug: "san-diego", name: "San Diego" },
    { slug: "fresno", name: "Fresno" },
  ],
  prepaidCemEs: "Cypress Lawn Memorial Park, Holy Cross Catholic Cemetery, Greenlawn Memorial Park",
  prepaidCemEn: "Cypress Lawn Memorial Park, Holy Cross Catholic Cemetery, Greenlawn Memorial Park",
  tableFootEs:
    "San Francisco Columbarium & Funeral Home y Green Street Mortuary: GPL y paquetes, 29 sep. 2026. Cypress Lawn Funeral Home (Colma, área de servicio): GPL, 1 ene. 2026. Estimador: promedios Funeralocity de California (26 jul. 2026). Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "San Francisco Columbarium & Funeral Home and Green Street Mortuary: GPL and packages, 29 Sep 2026. Cypress Lawn Funeral Home (Colma, service area): GPL, 1 Jan 2026. Estimator: California Funeralocity averages (26 Jul 2026). Always ask for the current list. These are not Mejor Vida Insurance prices.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Cypress Lawn Memorial Park vende espacios en Colma (650-550-8808). Holy Cross Catholic Cemetery también atiende familias de San Francisco (650-756-2060). Los anuncios de reventa están en el tablero de California de Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Cypress Lawn Memorial Park sells spaces in Colma (650-550-8808). Holy Cross Catholic Cemetery also serves San Francisco families (650-756-2060). Resale ads are on the California Grave Solutions board.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla de arriba incluye abrir/cerrar la tumba, bóveda, lápida ni funeral. Cypress Lawn y Holy Cross no publican un precio de partida del lote en internet. Los anuncios de reventa citan a veces el precio de lista del cementerio (por ejemplo, unos <strong>$4,500</strong> por un nicho en Cypress Lawn).",
  newListEn:
    "None of the starting prices in the chart include opening/closing, a vault, a marker, or the funeral. Cypress Lawn and Holy Cross do not post a starting plot price online. Resale ads sometimes cite the cemetery’s list price (for example, about <strong>$4,500</strong> for a niche at Cypress Lawn).",
  plotPriceRange: {
    titleEs: "¿Cuánto cuesta un lote en el área de San Francisco?",
    titleEn: "What does a burial plot cost in the San Francisco area?",
    introEs:
      "Solo el <strong>espacio en el cementerio</strong> (lote o nicho), cuando hay una lista publicada o un anuncio que cita el precio de venta del cementerio. <strong>No</strong> incluye abrir/cerrar, bóveda, lápida ni funeral. No es un promedio oficial del condado.",
    introEn:
      "Only the <strong>cemetery space</strong> (grave or niche), when a published list or an ad cites the cemetery’s retail price. <strong>Does not</strong> include opening/closing, a vault, a marker, or the funeral. Not an official county average.",
    low: {
      amount: 4500,
      labelEs: "Precio de venta citado (cementerio)",
      labelEn: "Cited cemetery retail",
      noteEs:
        "Anuncio de reventa citó <strong>$4,500</strong> como precio de lista de Cypress Lawn Memorial Park para un nicho doble con frente de vidrio (Colma).",
      noteEn:
        "A resale ad cited <strong>$4,500</strong> as Cypress Lawn Memorial Park’s list price for a double glass-front niche (Colma).",
    },
    mid: {
      amount: 8750,
      labelEs: "Rango típico (anuncios de reventa)",
      labelEn: "Typical range (resale ads)",
      noteEs:
        "Anuncios de particulares en Cypress Lawn y Greenlawn Memorial Park (Colma) pidieron unos $6,800–$8,750 por espacio de entierro en 2023–2026.",
      noteEn:
        "Private ads at Cypress Lawn and Greenlawn Memorial Park (Colma) asked about $6,800 to $8,750 per burial space in 2023–2026.",
    },
    high: {
      amount: 15000,
      labelEs: "Precio de venta citado (espacio premium)",
      labelEn: "Cited asking price (premium space)",
      noteEs:
        "Anuncios de reventa en jardines premium de Cypress Lawn y Holy Cross han pedido <strong>$15,000</strong> o más según la sección.",
      noteEn:
        "Resale ads in premium sections of Cypress Lawn and Holy Cross have asked <strong>$15,000</strong> or more depending on the section.",
    },
    footEs:
      "Fuentes: anuncios en <a href=\"https://www.gravesolutions.com/for-sale/cemetery-properties/california\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> que citan Cypress Lawn Memorial Park y Greenlawn Memorial Park (Colma); listados de corredores del área de la bahía. El rango típico resume anuncios de particulares, no es una estadística del estado.",
    footEn:
      "Sources: ads on <a href=\"https://www.gravesolutions.com/for-sale/cemetery-properties/california\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> citing Cypress Lawn Memorial Park and Greenlawn Memorial Park (Colma); Bay Area broker listings. The typical figure summarizes private ads; it is not a state statistic.",
  },
  plotNew: 10000,
  plotResale: 6800,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — Colma y la península suelen superar $8,000)",
  plotNewLabelEn: "New, from the cemetery office (ask for the list — Colma and peninsula spaces often exceed $8,000)",
  plotPublished: [],
  plotOffices: [
    {
      name: "Cypress Lawn Memorial Park",
      addr: "1370 El Camino Real, Colma",
      phone: "650-550-8808",
      href: "https://cypresslawn.com/locations/cypress-lawn-funeral-home/",
      noteEs: "Cementerio y funeraria en Colma; atiende a familias de San Francisco.",
      noteEn: "Cemetery and funeral home in Colma; serves San Francisco families.",
    },
    {
      name: "Holy Cross Catholic Cemetery",
      addr: "1500 Mission Rd, Colma",
      phone: "650-756-2060",
      href: "https://sfcathcems.org/holy-cross-colma/",
      noteEs: "No publica el precio del lote en internet. Pida la lista por escrito.",
      noteEn: "Does not publish plot prices online. Ask for the list in writing.",
    },
    {
      name: "Greenlawn Memorial Park",
      addr: "1100 El Camino Real, Colma",
      phone: "650-755-0322",
      href: "https://www.dignitymemorial.com/funeral-homes/california/colma/greenlawn-memorial-park/2471",
      noteEs: "Vende espacios en Colma. Llame para la lista vigente.",
      noteEn: "Sells spaces in Colma. Call for the current list.",
    },
  ],
  officesEs: [
    "<strong>Cypress Lawn Memorial Park</strong> — 1370 El Camino Real, Colma. Teléfono 650-550-8808.",
    "<strong>Holy Cross Catholic Cemetery</strong> — 1500 Mission Rd, Colma. Teléfono 650-756-2060.",
    "<strong>Greenlawn Memorial Park</strong> — 1100 El Camino Real, Colma. Teléfono 650-755-0322.",
  ],
  officesEn: [
    "<strong>Cypress Lawn Memorial Park</strong> — 1370 El Camino Real, Colma. Phone 650-550-8808.",
    "<strong>Holy Cross Catholic Cemetery</strong> — 1500 Mission Rd, Colma. Phone 650-756-2060.",
    "<strong>Greenlawn Memorial Park</strong> — 1100 El Camino Real, Colma. Phone 650-755-0322.",
  ],
  analysisSameEs:
    "San Francisco Columbarium publica cremación directa desde <strong>$3,070</strong> y entierro inmediato desde <strong>$4,320</strong>. Su Cremation Plan B (<strong>$7,940</strong>) ya incluye memorial en la funeraria; el Burial Plan B (<strong>$12,908</strong>) incluye ataúd recomendado de $3,595. Green Street publica cremación directa desde <strong>$3,191</strong> y entierro inmediato desde <strong>$5,263</strong>; su Burial Plan D (<strong>$8,343</strong>) incluye velatorio y ceremonia, pero no publica un paquete de cremación con memorial. Cypress Lawn (Colma) publica cremación directa desde <strong>$4,000</strong>, entierro inmediato desde <strong>$4,195</strong>, Silver Cremation (<strong>$5,890</strong>) y Gold Package (<strong>$12,995</strong>) con ataúd. El promedio de California (<strong>$8,050</strong>) suele incluir ataúd; no es el paquete de una casa.",
  analysisSameEn:
    "San Francisco Columbarium publishes direct cremation from <strong>$3,070</strong> and immediate burial from <strong>$4,320</strong>. Its Cremation Plan B (<strong>$7,940</strong>) already includes a funeral-home memorial; Burial Plan B (<strong>$12,908</strong>) includes a $3,595 recommended casket. Green Street publishes direct cremation from <strong>$3,191</strong> and immediate burial from <strong>$5,263</strong>; its Burial Plan D (<strong>$8,343</strong>) includes visitation and ceremony but does not publish a cremation-with-memorial package. Cypress Lawn (Colma) publishes direct cremation from <strong>$4,000</strong>, immediate burial from <strong>$4,195</strong>, Silver Cremation (<strong>$5,890</strong>), and Gold Package (<strong>$12,995</strong>) with a casket. California’s average (<strong>$8,050</strong>) usually includes a casket; it is not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Cypress Lawn Memorial Park llame al <strong>650-550-8808</strong>. La mayoría de los entierros en tierra de familias de San Francisco son en Colma.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Cypress Lawn Memorial Park call <strong>650-550-8808</strong>. Most ground burials for San Francisco families are in Colma.",
  analysisCheapEs:
    "La cremación directa es el atajo más barato que publican: <strong>$3,070</strong> en el Columbarium, <strong>$3,191</strong> en Green Street y <strong>$4,000</strong> en Cypress Lawn (Colma). El estimador usa <strong>$1,647</strong> para California. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
  analysisCheapEn:
    "Direct cremation is the cheapest published shortcut: <strong>$3,070</strong> at the Columbarium, <strong>$3,191</strong> at Green Street, and <strong>$4,000</strong> at Cypress Lawn (Colma). The estimator uses <strong>$1,647</strong> for California. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
  resaleHref: "https://www.gravesolutions.com/for-sale/cemetery-properties/california",
  unpublishedLeadEs:
    "Estas funerarias atienden el área pero no publican en internet los cuatro paquetes con precios en esta guía. Llame y pida la lista general de precios vigente.",
  unpublishedLeadEn:
    "These funeral homes serve the area but do not publish all four priced packages online in this guide. Call and ask for the current general price list.",
  unpublishedHomes: [
    {
      name: "Evergreen Mortuary of McAvoy O'Hara",
      href: "https://www.mcavoyohara.com/",
      addr: "4545 Geary Blvd, San Francisco",
      phone: "415-668-0077",
    },
    {
      name: "Duggan's Serra Mortuary",
      href: "https://www.duggans-serra.com/Content/Media/DuggansSerraMortuary/PDFFiles/for%20WEB%20%20-%20DSM%20GPL%20.pdf",
      addr: "500 Westlake Ave, Daly City",
      phone: "650-756-4500",
    },
    {
      name: "Neptune Society — San Francisco",
      href: "https://www.neptunesociety.com/locations/california/san-francisco",
      addr: "San Francisco (cremación)",
      phone: "415-982-9303",
    },
  ],
  homes: [
    {
      id: "columbarium",
      name: "San Francisco Columbarium & Funeral Home",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-francisco/san-francisco-columbarium-funeral-home/8131/costs/funeral-price-list",
      addr: "One Loraine Court · 415-771-0717",
      dc: 3070,
      ib: 4320,
      dcEs: "Cremación directa con Pacific Pine (GPL 29 sep. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Pacific Pine (GPL 29 Sep 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 29 sep. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 29 Sep 2026). Casket and plot extra.",
      memCell: cremationPlanB(7940),
      trCell: cell(
        12908,
        "Paquete Burial Plan B: ceremonia en capilla y recepción. Incluye ataúd recomendado de $3,595. Sin bóveda ni lote.",
        "Burial Plan B package: chapel ceremony and reception. Includes a $3,595 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "green-street",
      name: "Green Street Mortuary",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-francisco/green-street-mortuary/2594/funeral-price-list",
      addr: "649 Green St · 415-433-5692",
      dc: 3191,
      ib: 5263,
      dcEs: "Cremación directa con Trayview (GPL 29 sep. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Trayview (GPL 29 Sep 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 29 sep. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 29 Sep 2026). Casket and plot extra.",
      trCell: cell(
        8343,
        "Paquete Burial Plan D: velatorio y ceremonia en capilla o en iglesia. No incluye ataúd ni lote.",
        "Burial Plan D package: visitation and chapel or church ceremony. Does not include a casket or plot."
      ),
      casketTrad: false,
    },
    {
      id: "cypress-lawn",
      name: "Cypress Lawn Funeral Home",
      href: "https://cypresslawn.com/wp-content/uploads/CLFH.GPL_.FEB_.2026_WEB-2.pdf",
      addr: "1370 El Camino Real, Colma · 650-550-8808",
      dc: 4000,
      ib: 4195,
      dcEs: "Cremación directa, contenedor del comprador (GPL 1 ene. 2026). Crematorio incluido.",
      dcEn: "Direct cremation, purchaser container (GPL 1 Jan 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 1 ene. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 1 Jan 2026). Casket and plot extra.",
      memCell: cell(
        5890,
        "Paquete Silver Cremation: cremación directa más servicio memorial en la funeraria (lun.–vie.). Sin ataúd ni urna en el paquete.",
        "Silver Cremation package: direct cremation plus a weekday memorial service at the funeral home. No casket or urn in the package."
      ),
      trCell: cell(
        12995,
        "Paquete Gold (servicio tradicional de dos días): velatorio y ceremonia. Incluye ataúd de $4,895. Sin bóveda ni lote.",
        "Gold Package (two-day traditional service): visitation and ceremony. Includes a $4,895 casket. No vault or plot."
      ),
      casketTrad: true,
    },
  ],
});
