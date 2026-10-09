/**
 * Los Angeles city guide — named-home columns from first-party GPLs and package lists.
 */
const { makeCity, cell } = require("./ca-factory");

function tributeCrem(amt) {
  return cell(
    amt,
    "Paquete Tribute de cremación: reunión sencilla, urna y contenedor Trayview. Sin velatorio con cuerpo.",
    "Tribute cremation package: simple gathering, urn, and Trayview container. No body present."
  );
}

module.exports = makeCity({
  slug: "los-angeles",
  nameEn: "Los Angeles",
  nameEs: "Los Ángeles",
  heroFile: "los-angeles-hollywood-sign",
  heroVer: "hollywood-v1",
  heroClass: "sc-hero--los-angeles",
  heroCaptionEs: "Letrero de Hollywood, Los Ángeles",
  heroCaptionEn: "Hollywood Sign, Los Angeles",
  heroW: 1280,
  heroH: 720,
  countyEs: "condado de Los Ángeles",
  countyEn: "Los Angeles County",
  metroEs: ["Los Ángeles", "Long Beach", "Glendale", "Pasadena", "Torrance", "Pomona"],
  metroEn: ["Los Angeles", "Long Beach", "Glendale", "Pasadena", "Torrance", "Pomona"],
  metroTitleEs: "Área metropolitana de Los Ángeles",
  metroTitleEn: "Los Angeles metro area",
  nearbyGuides: [
    { slug: "san-diego", name: "San Diego" },
    { slug: "san-jose", name: "San Jose" },
    { slug: "san-francisco", name: "San Francisco" },
    { slug: "fresno", name: "Fresno" },
    { slug: "sacramento", name: "Sacramento" },
  ],
  prepaidCemEs: "Pierce Brothers Westwood Village Memorial Park, Forest Lawn Hollywood Hills",
  prepaidCemEn: "Pierce Brothers Westwood Village Memorial Park, Forest Lawn Hollywood Hills",
  tableFootEs:
    "Funeraria del Angel Wilmington: GPL y paquetes, 25 ago. 2026. Gates Kingsley & Gates Moeller Murphy (Santa Mónica): GPL y paquetes, 21 ene. 2026. Pierce Brothers Westwood Village: GPL y paquetes, 21 ene. 2026. Estimador: promedios Funeralocity de California (26 jul. 2026). Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Funeraria del Angel Wilmington: GPL and packages, 25 Aug 2026. Gates Kingsley & Gates Moeller Murphy (Santa Monica): GPL and packages, 21 Jan 2026. Pierce Brothers Westwood Village: GPL and packages, 21 Jan 2026. Estimator: California Funeralocity averages (26 Jul 2026). Always ask for the current list. These are not Mejor Vida Insurance prices.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pierce Brothers Westwood Village Memorial Park vende espacios en el mismo terreno (310-474-1579). Forest Lawn Hollywood Hills también vende lotes (888-204-3131). Pida la lista por escrito. Los anuncios de reventa están en el tablero de California de Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Pierce Brothers Westwood Village Memorial Park sells spaces on the same grounds (310-474-1579). Forest Lawn Hollywood Hills also sells plots (888-204-3131). Ask for the list in writing. Resale ads are on the California Grave Solutions board.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla de arriba incluye abrir/cerrar la tumba, bóveda, lápida ni funeral. En la GPL de Forest Lawn (mar. 2025), abrir y cerrar un entierro con cuerpo figura en <strong>$2,425</strong>. Rose Hills dice que abrir/cerrar se paga aparte al momento del entierro. Inglewood Park y Westwood no publican un precio de partida en la web.",
  newListEn:
    "None of the starting prices in the chart include opening/closing, a vault, a marker, or the funeral. On Forest Lawn’s GPL (Mar 2025), opening and closing for a full burial is <strong>$2,425</strong>. Rose Hills states that opening and closing are paid separately at interment. Inglewood Park and Westwood do not post a starting plot price online.",
  plotPriceRange: {
    titleEs: "¿Cuánto cuesta un lote en el área de Los Ángeles?",
    titleEn: "What does a burial plot cost in the Los Angeles area?",
    introEs:
      "Solo el <strong>espacio de la tumba en el cementerio</strong> (el lote), en la sección más barata que publica cada lista. <strong>No</strong> incluye abrir/cerrar, bóveda, lápida ni funeral. No es un promedio oficial del condado.",
    introEn:
      "Only the <strong>cemetery grave space</strong> (the plot), at the least expensive section each published list describes. <strong>Does not</strong> include opening/closing, a vault, a marker, or the funeral. Not an official county average.",
    low: {
      amount: 5000,
      labelEs: "Precio publicado más bajo",
      labelEn: "Lowest published list price",
      noteEs:
        "Redondeado desde listas de cementerios del condado de Los Ángeles (~$4,980 en una lista de 2024).",
      noteEn:
        "Rounded from published LA County cemetery lists (~$4,980 on a 2024 price list).",
    },
    mid: {
      amount: 12000,
      labelEs: "Rango típico (estimado)",
      labelEn: "Typical range (estimated)",
      noteEs:
        "Muchas familias pagan entre unos $9,000 y $13,000 por el espacio antes de bóveda y lápida, según listas publicadas del condado.",
      noteEn:
        "Many families pay about $9,000 to $13,000 for the space before vault and marker, based on published county cemetery lists.",
    },
    high: {
      amount: 27500,
      labelEs: "Precio publicado más alto (suelo)",
      labelEn: "Highest published ground price",
      noteEs:
        "Precio de partida publicado en internet para entierro en césped de doble profundidad (~$27,500).",
      noteEn:
        "Published online starting price for double-depth lawn burial (~$27,500).",
    },
    footEs:
      "Fuentes: <a href=\"https://rosehillsmemorialpark.com/wp-content/uploads/2026/01/Rose-Hills-Price-Lists-12.5.2025.pdf\" rel=\"noopener\" target=\"_blank\">Rose Hills (lista sep. 2024)</a>; <a href=\"https://forest-lawn.s3-us-west-1.amazonaws.com/wp-content/uploads/2025/03/FL-250111-01-LA-OC-GPL-English-v10-0304.pdf\" rel=\"noopener\" target=\"_blank\">Forest Lawn GPL LA/OC (7 mar. 2025)</a> (varios parques, at-need desde ~$7,935 hasta ~$26,450); <a href=\"https://hollywoodforever.com/cemetery/\" rel=\"noopener\" target=\"_blank\">Hollywood Forever</a>. El rango típico resume listas publicadas, no es una estadística del estado. Westwood e Inglewood Park no publican un precio de partida en la web. Abrir/cerrar en Forest Lawn: $2,425 (misma GPL).",
    footEn:
      "Sources: <a href=\"https://rosehillsmemorialpark.com/wp-content/uploads/2026/01/Rose-Hills-Price-Lists-12.5.2025.pdf\" rel=\"noopener\" target=\"_blank\">Rose Hills (list Sep 2024)</a>; <a href=\"https://forest-lawn.s3-us-west-1.amazonaws.com/wp-content/uploads/2025/03/FL-250111-01-LA-OC-GPL-English-v10-0304.pdf\" rel=\"noopener\" target=\"_blank\">Forest Lawn LA/OC GPL (7 Mar 2025)</a> (multiple parks, at-need from about $7,935 to about $26,450); <a href=\"https://hollywoodforever.com/cemetery/\" rel=\"noopener\" target=\"_blank\">Hollywood Forever</a>. The typical figure summarizes published lists; it is not a state statistic. Westwood and Inglewood Park do not post a starting price online. Forest Lawn opening/closing: $2,425 (same GPL).",
  },
  plotOpenClose: 2425,
  plotNew: 12000,
  plotResale: 8500,
  plotNewLabelEs: "Nuevo, oficina del cementerio (unos $12,000 — rango típico del área)",
  plotNewLabelEn: "New, from the cemetery office (about $12,000 — typical area range)",
  plotPublished: [],
  plotOffices: [
    {
      name: "Pierce Brothers Westwood Village Memorial Park",
      addr: "1218 Glendon Ave, Los Angeles",
      phone: "310-474-1579",
      href: "https://www.dignitymemorial.com/funeral-homes/california/los-angeles/pierce-brothers-westwood-village-memorial-park-and-mortuary/4749",
      noteEs: "Vende espacios en el mismo terreno que la funeraria Westwood.",
      noteEn: "Sells spaces on the same grounds as the Westwood funeral home.",
    },
    {
      name: "Forest Lawn — Hollywood Hills",
      addr: "6300 Forest Lawn Dr, Los Angeles",
      phone: "888-204-3131",
      href: "https://forestlawn.com/locations/hollywood-hills/",
      noteEs: "Lista general de precios LA/OC en la web.",
      noteEn: "LA/OC general price list is on the website.",
    },
    {
      name: "Inglewood Park Cemetery",
      addr: "720 E Florence Ave, Inglewood",
      phone: "310-412-6500",
      href: "https://www.inglewoodparkcemetery.com/",
      noteEs: "No publica el precio del lote en internet. Pida la lista por escrito.",
      noteEn: "Does not publish plot prices online. Ask for the list in writing.",
    },
  ],
  officesEs: [
    "<strong>Pierce Brothers Westwood Village Memorial Park</strong> — 1218 Glendon Ave. Teléfono 310-474-1579.",
    "<strong>Forest Lawn Hollywood Hills</strong> — 6300 Forest Lawn Dr. Teléfono 888-204-3131.",
    "<strong>Inglewood Park Cemetery</strong> — 720 E Florence Ave, Inglewood. Teléfono 310-412-6500.",
  ],
  officesEn: [
    "<strong>Pierce Brothers Westwood Village Memorial Park</strong> — 1218 Glendon Ave. Phone 310-474-1579.",
    "<strong>Forest Lawn Hollywood Hills</strong> — 6300 Forest Lawn Dr. Phone 888-204-3131.",
    "<strong>Inglewood Park Cemetery</strong> — 720 E Florence Ave, Inglewood. Phone 310-412-6500.",
  ],
  analysisSameEs:
    "Funeraria del Angel Wilmington publica cremación directa desde <strong>$2,360</strong> y entierro inmediato desde <strong>$3,395</strong> (contenedor del comprador). Su paquete Angel Cremation (<strong>$6,220</strong>) ya mete flores, urna y recepción. Gates Kingsley publica cremación directa desde <strong>$2,385</strong> y entierro inmediato desde <strong>$4,610</strong>. Pierce Brothers Westwood publica cremación directa desde <strong>$2,800</strong> y el paquete Tribute de funeral (<strong>$13,455</strong>) ya incluye ataúd recomendado. El promedio de California (<strong>$8,050</strong>) suele incluir ataúd; no es el paquete de una casa.",
  analysisSameEn:
    "Funeraria del Angel Wilmington publishes direct cremation from <strong>$2,360</strong> and immediate burial from <strong>$3,395</strong> (purchaser container). Its Angel Cremation package (<strong>$6,220</strong>) already puts in flowers, an urn, and a reception. Gates Kingsley publishes direct cremation from <strong>$2,385</strong> and immediate burial from <strong>$4,610</strong>. Pierce Brothers Westwood publishes direct cremation from <strong>$2,800</strong>, and the Tribute funeral package (<strong>$13,455</strong>) already includes a recommended casket. California’s average (<strong>$8,050</strong>) usually includes a casket; it is not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Westwood Village llame al <strong>310-474-1579</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Westwood Village call <strong>310-474-1579</strong>.",
  analysisCheapEs:
    "La cremación directa es el atajo más barato que publican: <strong>$2,360</strong> en Funeraria del Angel Wilmington, <strong>$2,385</strong> en Gates Kingsley (Santa Mónica) y <strong>$2,800</strong> en Pierce Brothers Westwood. El estimador usa <strong>$1,647</strong> para California. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
  analysisCheapEn:
    "Direct cremation is the cheapest published shortcut: <strong>$2,360</strong> at Funeraria del Angel Wilmington, <strong>$2,385</strong> at Gates Kingsley (Santa Monica), and <strong>$2,800</strong> at Pierce Brothers Westwood. The estimator uses <strong>$1,647</strong> for California. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
  resaleHref: "https://www.gravesolutions.com/for-sale/cemetery-properties/california",
  unpublishedLeadEs:
    "Estas funerarias atienden el área pero no publican en internet los cuatro paquetes con precios en esta guía. Llame y pida la lista general de precios vigente.",
  unpublishedLeadEn:
    "These funeral homes serve the area but do not publish all four priced packages online in this guide. Call and ask for the current general price list.",
  unpublishedHomes: [
    {
      name: "Forest Lawn Hollywood Hills",
      href: "https://forestlawn.com/locations/hollywood-hills/",
      addr: "6300 Forest Lawn Dr",
      phone: "888-204-3131",
    },
    {
      name: "Angeles Funeral Home",
      href: "https://www.angelesfuneral.com/",
      addr: "1200 E 28th St",
      phone: "213-749-5147",
    },
    {
      name: "Hollywood Forever Cemetery & Funeral Home",
      href: "https://www.hollywoodforever.com/",
      addr: "6000 Santa Monica Blvd",
      phone: "323-469-1181",
    },
  ],
  homes: [
    {
      id: "angelw",
      name: "Funeraria del Angel Wilmington",
      href: "https://www.dignitymemorial.com/funeral-homes/california/wilmington/funeraria-del-angel-wilmington/4614/funeral-price-list",
      addr: "1640 N Avalon Blvd, Wilmington · 310-834-8531",
      dc: 2360,
      ib: 3395,
      dcEs: "Cremación directa con Pacific Pine (GPL 25 ago. 2026). Crematorio incluido. Sin ceremonia.",
      dcEn: "Direct cremation with Pacific Pine (GPL 25 Aug 2026). Crematory included. No ceremony.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 25 ago. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 25 Aug 2026). Casket and plot extra.",
      memCell: cell(
        6220,
        "Paquete Angel Cremation: cremación directa, flores, urna y recepción I. No es suma de la GPL.",
        "Angel Cremation package: direct cremation, flowers, urn, and Reception I. Not a GPL line-item sum."
      ),
      trCell: cell(
        9615,
        "Paquete Classic Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $1,795. Lote aparte.",
        "Classic Funeral package: visitation and ceremony. Includes a $1,795 recommended casket. Plot extra."
      ),
      casketTrad: true,
    },
    {
      id: "gkgmm",
      name: "Gates Kingsley (Santa Monica)",
      href: "https://www.dignitymemorial.com/funeral-homes/california/santa-monica/gates-kingsley-gates-moeller-murphy-funeral-directors/8286/funeral-price-list",
      addr: "2450 Colorado Ave, Santa Monica · 310-395-9988",
      dc: 2385,
      ib: 4610,
      dcEs: "Cremación directa con Pacific Pine (GPL 21 ene. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Pacific Pine (GPL 21 Jan 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 21 ene. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 21 Jan 2026). Casket and plot extra.",
      memCell: tributeCrem(4865),
      trCell: cell(
        11415,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "pbw",
      name: "Pierce Brothers Westwood",
      href: "https://www.dignitymemorial.com/funeral-homes/california/los-angeles/pierce-brothers-westwood-village-memorial-park-mortuary/4798/funeral-price-list",
      addr: "1218 Glendon Ave · 310-474-1579",
      dc: 2800,
      ib: 4895,
      dcEs: "Cremación directa, contenedor del comprador (GPL 21 ene. 2026). Crematorio incluido.",
      dcEn: "Direct cremation, purchaser container (GPL 21 Jan 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 21 ene. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 21 Jan 2026). Casket and plot extra.",
      memCell: tributeCrem(5545),
      trCell: cell(
        13455,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
  ],
});
