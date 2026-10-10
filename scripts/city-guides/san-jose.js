/**
 * San Jose city guide — named-home columns from first-party Dignity Memorial GPLs and package lists.
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
  slug: "san-jose",
  nameEn: "San Jose",
  nameEs: "San José",
  heroFile: "san-jose-downtown",
  heroVer: "coast-beach-v1",
  heroClass: "sc-hero--san-jose",
  heroCaptionEs: "Costa cerca de San José, California",
  heroCaptionEn: "Coast near San Jose, California",
  heroW: 900,
  heroH: 900,
  countyEs: "condado de Santa Clara",
  countyEn: "Santa Clara County",
  metroEs: ["San José", "Sunnyvale", "Santa Clara", "Mountain View", "Milpitas", "Campbell"],
  metroEn: ["San Jose", "Sunnyvale", "Santa Clara", "Mountain View", "Milpitas", "Campbell"],
  metroTitleEs: "San José y el condado de Santa Clara",
  metroTitleEn: "San Jose and Santa Clara County",
  nearbyGuides: [
    { slug: "san-francisco", name: "San Francisco" },
    { slug: "los-angeles", name: "Los Angeles" },
    { slug: "san-diego", name: "San Diego" },
    { slug: "sacramento", name: "Sacramento" },
    { slug: "fresno", name: "Fresno" },
  ],
  prepaidCemEs: "Oak Hill Memorial Park, Mission City Memorial Park, Los Gatos Memorial Park",
  prepaidCemEn: "Oak Hill Memorial Park, Mission City Memorial Park, Los Gatos Memorial Park",
  tableFootEs:
    "Oak Hill Funeral Home & Memorial Park, Willow Glen Funeral Home y Lima Family Erickson Memorial Chapel: GPL y paquetes, 29 sep. 2026. Estimador: promedios Funeralocity de California (26 jul. 2026). Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Oak Hill Funeral Home & Memorial Park, Willow Glen Funeral Home, and Lima Family Erickson Memorial Chapel: GPL and packages, 29 Sep 2026. Estimator: California Funeralocity averages (26 Jul 2026). Always ask for the current list. These are not Mejor Vida Insurance prices.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Oak Hill Memorial Park vende espacios en el mismo terreno que la funeraria (408-297-2447). Mission City Memorial Park en Santa Clara es municipal (408-615-3790). Los anuncios de reventa están en el tablero de California de Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Oak Hill Memorial Park sells spaces on the same grounds as the funeral home (408-297-2447). Mission City Memorial Park in Santa Clara is city-owned (408-615-3790). Resale ads are on the California Grave Solutions board.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla de arriba incluye abrir/cerrar la tumba, bóveda, lápida ni funeral. Oak Hill y Mission City no publican un precio de partida del lote en internet. Los anuncios de reventa citan a veces el precio de lista del cementerio (por ejemplo, unos <strong>$12,600</strong> por espacio de doble profundidad en Oak Hill).",
  newListEn:
    "None of the starting prices in the chart include opening/closing, a vault, a marker, or the funeral. Oak Hill and Mission City do not post a starting plot price online. Resale ads sometimes cite the cemetery’s list price (for example, about <strong>$12,600</strong> per double-depth space at Oak Hill).",
  plotPriceRange: {
    titleEs: "¿Cuánto cuesta un lote en el área de San José?",
    titleEn: "What does a burial plot cost in the San Jose area?",
    introEs:
      "Solo el <strong>espacio de la tumba en el cementerio</strong> (el lote), cuando hay una lista publicada o un anuncio que cita el precio de venta del cementerio. <strong>No</strong> incluye abrir/cerrar, bóveda, lápida ni funeral. No es un promedio oficial del condado.",
    introEn:
      "Only the <strong>cemetery grave space</strong> (the plot), when a published list or an ad cites the cemetery’s retail price. <strong>Does not</strong> include opening/closing, a vault, a marker, or the funeral. Not an official county average.",
    low: {
      amount: 8000,
      labelEs: "Reventa (anuncio reciente)",
      labelEn: "Resale (recent ad)",
      noteEs:
        "Anuncio en Grave Solutions por espacio en Oak Hill Memorial Park (Hillside), con precio de lista del cementerio citado en unos $12,600 por doble profundidad.",
      noteEn:
        "Grave Solutions ad for a space at Oak Hill Memorial Park (Hillside), with the cemetery’s cited list price of about $12,600 per double depth.",
    },
    mid: {
      amount: 15000,
      labelEs: "Rango típico (anuncios de reventa)",
      labelEn: "Typical range (resale ads)",
      noteEs:
        "Muchos anuncios de particulares en Oak Hill piden unos $8,000–$18,000 por espacio; la mediana en tableros de reventa suele rondar $15,000.",
      noteEn:
        "Many private ads at Oak Hill ask about $8,000 to $18,000 per space; resale boards often show a median near $15,000.",
    },
    high: {
      amount: 18000,
      labelEs: "Precio de venta citado (sección premium)",
      labelEn: "Cited asking price (premium section)",
      noteEs:
        "Anuncios en The Cemetery Exchange en 2026 pidieron <strong>$18,000</strong> por espacio en el Garden of the Apostles de Oak Hill Memorial Park.",
      noteEn:
        "The Cemetery Exchange ads in 2026 asked <strong>$18,000</strong> per space in Oak Hill Memorial Park’s Garden of the Apostles.",
    },
    footEs:
      "Fuentes: anuncios en <a href=\"https://www.gravesolutions.com/for-sale/oak-hill-memorial-park-san-jose-ca-cemetery-plot-237d59\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> y <a href=\"https://thecemeteryexchange.com/25-0728-5-featuredlisting-ca.htm\" rel=\"noopener\" target=\"_blank\">The Cemetery Exchange</a> que citan precios de Oak Hill Memorial Park; <a href=\"https://www.santaclaraca.gov/our-city/departments-g-z/parks-recreation/cemeteries\" rel=\"noopener\" target=\"_blank\">Mission City Memorial Park</a> (tarifas en la oficina, no en la web). El rango típico resume anuncios de particulares, no es una estadística del estado.",
    footEn:
      "Sources: ads on <a href=\"https://www.gravesolutions.com/for-sale/oak-hill-memorial-park-san-jose-ca-cemetery-plot-237d59\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> and <a href=\"https://thecemeteryexchange.com/25-0728-5-featuredlisting-ca.htm\" rel=\"noopener\" target=\"_blank\">The Cemetery Exchange</a> citing Oak Hill Memorial Park prices; <a href=\"https://www.santaclaraca.gov/our-city/departments-g-z/parks-recreation/cemeteries\" rel=\"noopener\" target=\"_blank\">Mission City Memorial Park</a> (fees at the office, not online). The typical figure summarizes private ads; it is not a state statistic.",
  },
  plotNew: 15000,
  plotResale: 8000,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — muchos espacios en Oak Hill superan $12,000)",
  plotNewLabelEn: "New, from the cemetery office (ask for the list — many Oak Hill spaces exceed $12,000)",
  plotPublished: [],
  plotOffices: [
    {
      name: "Oak Hill Memorial Park",
      addr: "300 Curtner Ave, San Jose",
      phone: "408-297-2447",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-jose/oak-hill-funeral-home-memorial-park/2473",
      noteEs: "Vende espacios en el mismo terreno que la funeraria Oak Hill.",
      noteEn: "Sells spaces on the same grounds as Oak Hill Funeral Home.",
    },
    {
      name: "Mission City Memorial Park",
      addr: "420 N Winchester Blvd, Santa Clara",
      phone: "408-615-3790",
      href: "https://www.santaclaraca.gov/our-city/departments-g-z/parks-recreation/cemeteries",
      noteEs: "Cementerio municipal. La tarifa vigente está en la oficina o en el folleto de la ciudad.",
      noteEn: "City-owned cemetery. Current fees are at the office or on the city flyer.",
    },
    {
      name: "Los Gatos Memorial Park",
      addr: "2255 Los Gatos Almaden Rd, San Jose",
      phone: "408-379-9200",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-jose/los-gatos-memorial-park-funeral-home/2474",
      noteEs: "No publica el precio del lote en internet. Pida la lista por escrito.",
      noteEn: "Does not publish plot prices online. Ask for the list in writing.",
    },
  ],
  officesEs: [
    "<strong>Oak Hill Memorial Park</strong> — 300 Curtner Ave. Teléfono 408-297-2447.",
    "<strong>Mission City Memorial Park</strong> — 420 N Winchester Blvd, Santa Clara. Teléfono 408-615-3790.",
    "<strong>Los Gatos Memorial Park</strong> — 2255 Los Gatos Almaden Rd. Teléfono 408-379-9200.",
  ],
  officesEn: [
    "<strong>Oak Hill Memorial Park</strong> — 300 Curtner Ave. Phone 408-297-2447.",
    "<strong>Mission City Memorial Park</strong> — 420 N Winchester Blvd, Santa Clara. Phone 408-615-3790.",
    "<strong>Los Gatos Memorial Park</strong> — 2255 Los Gatos Almaden Rd. Phone 408-379-9200.",
  ],
  analysisSameEs:
    "Willow Glen Funeral Home publica cremación directa desde <strong>$3,310</strong> y entierro inmediato desde <strong>$4,545</strong> (contenedor del comprador). Su paquete Tribute de cremación (<strong>$5,390</strong>) ya mete reunión sencilla y urna. Lima Family Erickson publica los mismos mínimos de cremación directa (<strong>$3,310</strong>) y entierro inmediato (<strong>$4,645</strong>), con Tribute de funeral (<strong>$12,700</strong>) que incluye ataúd recomendado. Oak Hill publica cremación directa desde <strong>$4,225</strong>, entierro inmediato desde <strong>$5,545</strong> y el Tribute de funeral (<strong>$14,685</strong>) con ataúd recomendado. El promedio de California (<strong>$8,050</strong>) suele incluir ataúd; no es el paquete de una casa.",
  analysisSameEn:
    "Willow Glen Funeral Home publishes direct cremation from <strong>$3,310</strong> and immediate burial from <strong>$4,545</strong> (purchaser container). Its Tribute cremation package (<strong>$5,390</strong>) already puts in a simple gathering and an urn. Lima Family Erickson publishes the same direct cremation floor (<strong>$3,310</strong>) and immediate burial from <strong>$4,645</strong>, with a Tribute funeral package (<strong>$12,700</strong>) that includes a recommended casket. Oak Hill publishes direct cremation from <strong>$4,225</strong>, immediate burial from <strong>$5,545</strong>, and the Tribute funeral package (<strong>$14,685</strong>) with a recommended casket. California’s average (<strong>$8,050</strong>) usually includes a casket; it is not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Oak Hill Memorial Park llame al <strong>408-297-2447</strong>. Mission City Memorial Park publica tarifas en la oficina de Santa Clara, no en la web.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Oak Hill Memorial Park call <strong>408-297-2447</strong>. Mission City Memorial Park publishes fees at the Santa Clara office, not online.",
  analysisCheapEs:
    "La cremación directa es el atajo más barato que publican: <strong>$3,310</strong> en Willow Glen y Lima Family Erickson, y <strong>$4,225</strong> en Oak Hill (Pacific Pine en la GPL). El estimador usa <strong>$1,647</strong> para California. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
  analysisCheapEn:
    "Direct cremation is the cheapest published shortcut: <strong>$3,310</strong> at Willow Glen and Lima Family Erickson, and <strong>$4,225</strong> at Oak Hill (Pacific Pine on the GPL). The estimator uses <strong>$1,647</strong> for California. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
  resaleHref: "https://www.gravesolutions.com/for-sale/cemetery-properties/california",
  unpublishedLeadEs:
    "Estas funerarias atienden el área pero no publican en internet los cuatro paquetes con precios en esta guía. Llame y pida la lista general de precios vigente.",
  unpublishedLeadEn:
    "These funeral homes serve the area but do not publish all four priced packages online in this guide. Call and ask for the current general price list.",
  unpublishedHomes: [
    {
      name: "Chapel of the Hills Memorial Chapel",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-jose/chapel-of-the-hills-memorial-chapel/2472",
      addr: "1000 S Bascom Ave, San Jose",
      phone: "408-295-6177",
    },
    {
      name: "Darling & Fischer Campbell Memorial Chapel",
      href: "https://www.darlingfischer.com/",
      addr: "231 E Campbell Ave, Campbell",
      phone: "408-378-2850",
    },
    {
      name: "Los Gatos Memorial Park & Funeral Home",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-jose/los-gatos-memorial-park-funeral-home/2474/funeral-price-list",
      addr: "2255 Los Gatos Almaden Rd",
      phone: "408-379-9200",
    },
  ],
  homes: [
    {
      id: "willow-glen",
      name: "Willow Glen Funeral Home",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-jose/willow-glen-funeral-home/7062/funeral-price-list",
      addr: "1039 Lincoln Ave · 408-295-6446",
      dc: 3310,
      ib: 4545,
      dcEs: "Cremación directa con Pacific Pine (GPL 29 sep. 2026). Crematorio incluido. Sin ceremonia.",
      dcEn: "Direct cremation with Pacific Pine (GPL 29 Sep 2026). Crematory included. No ceremony.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 29 sep. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 29 Sep 2026). Casket and plot extra.",
      memCell: tributeCrem(5390),
      trCell: cell(
        11455,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "lima-erickson",
      name: "Lima Family Erickson Memorial Chapel",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-jose/lima-family-erickson-memorial-chapel/2460/funeral-price-list",
      addr: "710 Willow St · 408-295-5160",
      dc: 3310,
      ib: 4645,
      dcEs: "Cremación directa con Pacific Pine (GPL 29 sep. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Pacific Pine (GPL 29 Sep 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 29 sep. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 29 Sep 2026). Casket and plot extra.",
      memCell: tributeCrem(5440),
      trCell: cell(
        12700,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "oak-hill",
      name: "Oak Hill Funeral Home & Memorial Park",
      href: "https://www.dignitymemorial.com/funeral-homes/california/san-jose/oak-hill-funeral-home-memorial-park/2473/costs/funeral-price-list",
      addr: "300 Curtner Ave · 408-297-2447",
      dc: 4225,
      ib: 5545,
      dcEs: "Cremación directa con Pacific Pine (GPL 29 sep. 2026). Crematorio en el mismo lugar.",
      dcEn: "Direct cremation with Pacific Pine (GPL 29 Sep 2026). On-site crematory.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 29 sep. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 29 Sep 2026). Casket and plot extra.",
      memCell: tributeCrem(6705),
      trCell: cell(
        14685,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
  ],
});
