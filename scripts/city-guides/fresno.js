/**
 * Fresno city guide — named-home columns from first-party Dignity Memorial GPLs and package lists.
 */
const { makeCity, cell } = require("./ca-factory");

function tributeCrem(amt) {
  return cell(
    amt,
    "Paquete Tribute de cremación: reunión sencilla, urna y contenedor Trayview o Safeway. Sin velatorio con cuerpo.",
    "Tribute cremation package: simple gathering, urn, and Trayview or Safeway container. No body present."
  );
}

function classicCrem(amt) {
  return cell(
    amt,
    "Paquete Classic Cremation Service: cremación directa, reunión sencilla en la funeraria y urna del listado. Sin velatorio con cuerpo.",
    "Classic Cremation Service package: direct cremation, simple gathering at the funeral home, and a listed urn. No body present."
  );
}

module.exports = makeCity({
  slug: "fresno",
  nameEn: "Fresno",
  nameEs: "Fresno",
  heroFile: "fresno-van-ness-arch",
  heroVer: "van-ness-arch-v1",
  heroClass: "sc-hero--fresno",
  heroCaptionEs: "Arco histórico de Fresno en Van Ness Avenue",
  heroCaptionEn: "Historic Fresno arch on Van Ness Avenue",
  heroW: 1024,
  heroH: 674,
  countyEs: "condado de Fresno",
  countyEn: "Fresno County",
  metroEs: ["Fresno", "Clovis", "Madera", "Selma", "Reedley"],
  metroEn: ["Fresno", "Clovis", "Madera", "Selma", "Reedley"],
  metroTitleEs: "Fresno y el condado de Fresno",
  metroTitleEn: "Fresno and Fresno County",
  nearbyGuides: [
    { slug: "los-angeles", name: "Los Angeles" },
    { slug: "san-diego", name: "San Diego" },
    { slug: "san-jose", name: "San Jose" },
    { slug: "san-francisco", name: "San Francisco" },
    { slug: "sacramento", name: "Sacramento" },
  ],
  prepaidCemEs: "Fresno Memorial Gardens, Belmont Memorial Park, Clovis Cemetery",
  prepaidCemEn: "Fresno Memorial Gardens, Belmont Memorial Park, Clovis Cemetery",
  tableFootEs:
    "Funeraria Del Angel Fresno, Whitehurst Sullivan Burns & Blair y Stephens and Bean Funeral Chapel: GPL y paquetes, 8 sep. 2026. Estimador: promedios Funeralocity de California (26 jul. 2026). Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Funeraria Del Angel Fresno, Whitehurst Sullivan Burns & Blair, and Stephens and Bean Funeral Chapel: GPL and packages, 8 Sep 2026. Estimator: California Funeralocity averages (26 Jul 2026). Always ask for the current list. These are not Mejor Vida Insurance prices.",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Fresno Memorial Gardens vende espacios en el sur de Fresno (559-268-7823). Belmont Memorial Park está en 201 N Teilman Ave (559-237-6185). Los anuncios de reventa están en el tablero de California de Grave Solutions.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Fresno Memorial Gardens sells spaces in south Fresno (559-268-7823). Belmont Memorial Park is at 201 N Teilman Ave (559-237-6185). Resale ads are on the California Grave Solutions board.",
  officesNoteEs:
    "Ninguno publica un precio de partida del lote en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "None of them post a starting plot price on the website. Call and ask for the current list in writing.",
  newListEs:
    "Ningún precio de la tabla de arriba incluye abrir/cerrar la tumba, bóveda, lápida ni funeral. Fresno Memorial Gardens y Belmont no publican un precio de partida del lote en internet. Los anuncios de reventa en Belmont citan a veces unos <strong>$1,295</strong> por espacio hasta unos <strong>$5,000</strong> por doble profundidad.",
  newListEn:
    "None of the starting prices in the chart include opening/closing, a vault, a marker, or the funeral. Fresno Memorial Gardens and Belmont do not post a starting plot price online. Resale ads at Belmont sometimes cite about <strong>$1,295</strong> per space up to about <strong>$5,000</strong> for double depth.",
  plotPriceRange: {
    titleEs: "¿Cuánto cuesta un lote en el área de Fresno?",
    titleEn: "What does a burial plot cost in the Fresno area?",
    introEs:
      "Solo el <strong>espacio de la tumba en el cementerio</strong> (el lote), cuando hay una lista publicada o un anuncio que cita el precio de venta del cementerio. <strong>No</strong> incluye abrir/cerrar, bóveda, lápida ni funeral. No es un promedio oficial del condado.",
    introEn:
      "Only the <strong>cemetery grave space</strong> (the plot), when a published list or an ad cites the cemetery’s retail price. <strong>Does not</strong> include opening/closing, a vault, a marker, or the funeral. Not an official county average.",
    low: {
      amount: 1295,
      labelEs: "Reventa (anuncio citado)",
      labelEn: "Resale (cited ad)",
      noteEs:
        "Anuncio en Grave Solutions por espacio en Belmont Memorial Park, con precio de lista del cementerio citado en unos $1,800 por espacio.",
      noteEn:
        "Grave Solutions ad for a space at Belmont Memorial Park, with the cemetery’s cited list price of about $1,800 per space.",
    },
    mid: {
      amount: 5000,
      labelEs: "Rango típico (anuncios de reventa)",
      labelEn: "Typical range (resale ads)",
      noteEs:
        "Muchos anuncios de particulares en Belmont Memorial Park piden unos $1,800–$5,000 por espacio; los tableros de reventa en el Valle Central suelen rondar $5,000.",
      noteEn:
        "Many private ads at Belmont Memorial Park ask about $1,800 to $5,000 per space; Central Valley resale boards often show a median near $5,000.",
    },
    high: {
      amount: 5000,
      labelEs: "Precio de venta citado (doble profundidad)",
      labelEn: "Cited asking price (double depth)",
      noteEs:
        "Anuncios en 2025–2026 pidieron <strong>$5,000</strong> por lote de doble profundidad en Belmont Memorial Park (Garden of the Apostles, sección 217).",
      noteEn:
        "Ads in 2025–2026 asked <strong>$5,000</strong> for a double-depth lot at Belmont Memorial Park (Garden of the Apostles, section 217).",
    },
    footEs:
      "Fuentes: anuncios en <a href=\"https://www.gravesolutions.com/for-sale/belmont-memorial-park-fresno-ca-cemetery-plot-dc39fb\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> y listados de particulares que citan Belmont Memorial Park; <a href=\"https://www.dignitymemorial.com/funeral-homes/california/fresno/fresno-memorial-gardens/0229\" rel=\"noopener\" target=\"_blank\">Fresno Memorial Gardens</a> (tarifas en la oficina, no en la web). El rango típico resume anuncios de particulares, no es una estadística del estado.",
    footEn:
      "Sources: ads on <a href=\"https://www.gravesolutions.com/for-sale/belmont-memorial-park-fresno-ca-cemetery-plot-dc39fb\" rel=\"noopener\" target=\"_blank\">Grave Solutions</a> and private listings citing Belmont Memorial Park; <a href=\"https://www.dignitymemorial.com/funeral-homes/california/fresno/fresno-memorial-gardens/0229\" rel=\"noopener\" target=\"_blank\">Fresno Memorial Gardens</a> (fees at the office, not online). The typical figure summarizes private ads; it is not a state statistic.",
  },
  plotNew: 5000,
  plotResale: 1295,
  plotNewLabelEs: "Nuevo, oficina del cementerio (pida la lista — muchos espacios en el área superan $5,000)",
  plotNewLabelEn: "New, from the cemetery office (ask for the list — many area spaces exceed $5,000)",
  plotPublished: [],
  plotOffices: [
    {
      name: "Fresno Memorial Gardens",
      addr: "175 S Cornelia Ave, Fresno",
      phone: "559-268-7823",
      href: "https://www.dignitymemorial.com/funeral-homes/california/fresno/fresno-memorial-gardens/0229",
      noteEs: "Cementerio Dignity en el sur de Fresno. No publica el precio del lote en internet.",
      noteEn: "Dignity cemetery in south Fresno. Does not publish plot prices online.",
    },
    {
      name: "Belmont Memorial Park",
      addr: "201 N Teilman Ave, Fresno",
      phone: "559-237-6185",
      href: "https://www.belmontmemorialpark.com/",
      noteEs: "Cementerio en el mismo bloque que Stephens and Bean. Pida la lista por escrito.",
      noteEn: "Cemetery on the same block as Stephens and Bean. Ask for the list in writing.",
    },
    {
      name: "Clovis Cemetery",
      addr: "305 N Villa Ave, Clovis",
      phone: "559-299-6057",
      href: "https://www.cityofclovis.com/departments/parks-recreation/cemetery",
      noteEs: "Cementerio municipal de Clovis. La tarifa vigente está en la oficina de la ciudad.",
      noteEn: "City of Clovis cemetery. Current fees are at the city office.",
    },
  ],
  officesEs: [
    "<strong>Fresno Memorial Gardens</strong> — 175 S Cornelia Ave. Teléfono 559-268-7823.",
    "<strong>Belmont Memorial Park</strong> — 201 N Teilman Ave. Teléfono 559-237-6185.",
    "<strong>Clovis Cemetery</strong> — 305 N Villa Ave, Clovis. Teléfono 559-299-6057.",
  ],
  officesEn: [
    "<strong>Fresno Memorial Gardens</strong> — 175 S Cornelia Ave. Phone 559-268-7823.",
    "<strong>Belmont Memorial Park</strong> — 201 N Teilman Ave. Phone 559-237-6185.",
    "<strong>Clovis Cemetery</strong> — 305 N Villa Ave, Clovis. Phone 559-299-6057.",
  ],
  analysisSameEs:
    "Funeraria Del Angel Fresno publica cremación directa desde <strong>$2,335</strong> y entierro inmediato desde <strong>$4,020</strong> (contenedor del comprador). Su paquete Classic Cremation (<strong>$4,465</strong>) ya mete reunión sencilla y urna. Whitehurst publica cremación directa desde <strong>$3,210</strong>, entierro inmediato desde <strong>$5,020</strong> y el Tribute de funeral (<strong>$12,790</strong>) con ataúd recomendado de $2,495. Stephens and Bean publica cremación directa desde <strong>$3,210</strong>, entierro inmediato desde <strong>$5,020</strong> y el Tribute de cremación (<strong>$5,340</strong>). El promedio de California (<strong>$8,050</strong>) suele incluir ataúd; no es el paquete de una casa.",
  analysisSameEn:
    "Funeraria Del Angel Fresno publishes direct cremation from <strong>$2,335</strong> and immediate burial from <strong>$4,020</strong> (purchaser container). Its Classic Cremation Service package (<strong>$4,465</strong>) already puts in a simple gathering and an urn. Whitehurst publishes direct cremation from <strong>$3,210</strong>, immediate burial from <strong>$5,020</strong>, and the Tribute funeral package (<strong>$12,790</strong>) with a $2,495 recommended casket. Stephens and Bean publishes direct cremation from <strong>$3,210</strong>, immediate burial from <strong>$5,020</strong>, and the Tribute cremation package (<strong>$5,340</strong>). California’s average (<strong>$8,050</strong>) usually includes a casket; it is not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Fresno Memorial Gardens llame al <strong>559-268-7823</strong>. Belmont Memorial Park está en <strong>559-237-6185</strong>; no publica el lote en la web.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Fresno Memorial Gardens call <strong>559-268-7823</strong>. Belmont Memorial Park is at <strong>559-237-6185</strong>; they do not publish plot prices online.",
  analysisCheapEs:
    "La cremación directa es el atajo más barato que publican: <strong>$2,335</strong> en Funeraria Del Angel Fresno y <strong>$3,210</strong> en Whitehurst y Stephens and Bean (Pacific Pine en la GPL). El estimador usa <strong>$1,647</strong> para California. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
  analysisCheapEn:
    "Direct cremation is the cheapest published shortcut: <strong>$2,335</strong> at Funeraria Del Angel Fresno and <strong>$3,210</strong> at Whitehurst and Stephens and Bean (Pacific Pine on the GPL). The estimator uses <strong>$1,647</strong> for California. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
  resaleHref: "https://www.gravesolutions.com/for-sale/cemetery-properties/california",
  unpublishedLeadEs:
    "Estas funerarias atienden el área pero no publican en internet los cuatro paquetes con precios en esta guía. Llame y pida la lista general de precios vigente.",
  unpublishedLeadEn:
    "These funeral homes serve the area but do not publish all four priced packages online in this guide. Call and ask for the current general price list.",
  unpublishedHomes: [
    {
      name: "Palm La Paz Funerals & Cremations",
      href: "https://www.dignitymemorial.com/funeral-homes/california/fresno/palm-la-paz-funerals-cremations/9765/funeral-price-list",
      addr: "1605 L St #201, Fresno",
      phone: "559-233-7267",
    },
    {
      name: "Boice Funeral Home",
      href: "https://www.dignitymemorial.com/funeral-homes/california/clovis/boice-funeral-home/2456",
      addr: "308 Pollasky Ave, Clovis",
      phone: "559-299-4372",
    },
    {
      name: "Yost & Webb Funeral Home",
      href: "https://www.yostandwebb.com/pricing",
      addr: "1001 N Van Ness Ave, Fresno",
      phone: "559-222-7764",
    },
  ],
  homes: [
    {
      id: "del-angel",
      name: "Funeraria Del Angel Fresno",
      href: "https://www.dignitymemorial.com/funeral-homes/california/fresno/funeraria-del-angel-fresno/4059/funeral-price-list",
      addr: "475 N Broadway · 559-344-8902",
      dc: 2335,
      ib: 4020,
      dcEs: "Cremación directa con Pacific Pine (GPL 8 sep. 2026). Crematorio incluido. Sin ceremonia.",
      dcEn: "Direct cremation with Pacific Pine (GPL 8 Sep 2026). Crematory included. No ceremony.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 8 sep. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 8 Sep 2026). Casket and plot extra.",
      memCell: classicCrem(4465),
      trCell: cell(
        9945,
        "Paquete Classic Funeral Service: velatorio y ceremonia. Incluye ataúd recomendado de $1,795. Sin bóveda ni lote.",
        "Classic Funeral Service package: visitation and ceremony. Includes a $1,795 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "whitehurst",
      name: "Whitehurst Sullivan Burns & Blair Funeral Home",
      href: "https://www.dignitymemorial.com/funeral-homes/california/fresno/whitehurst-sullivan-burns-blair-funeral-home/7024/funeral-price-list",
      addr: "836 E Nees Ave · 559-227-4048",
      dc: 3210,
      ib: 5020,
      dcEs: "Cremación directa con Pacific Pine (GPL 8 sep. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Pacific Pine (GPL 8 Sep 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 8 sep. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 8 Sep 2026). Casket and plot extra.",
      memCell: tributeCrem(5540),
      trCell: cell(
        12790,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
    {
      id: "stephens-bean",
      name: "Stephens and Bean Funeral Chapel",
      href: "https://www.dignitymemorial.com/funeral-homes/california/fresno/stephens-and-bean-funeral-chapel/7023/funeral-price-list",
      addr: "202 N Teilman Ave · 559-268-9292",
      dc: 3210,
      ib: 5020,
      dcEs: "Cremación directa con Pacific Pine (GPL 8 sep. 2026). Crematorio incluido.",
      dcEn: "Direct cremation with Pacific Pine (GPL 8 Sep 2026). Crematory included.",
      ibEs: "Entierro inmediato, contenedor del comprador (GPL 8 sep. 2026). Ataúd y lote aparte.",
      ibEn: "Immediate burial, purchaser container (GPL 8 Sep 2026). Casket and plot extra.",
      memCell: tributeCrem(5340),
      trCell: cell(
        12415,
        "Paquete Tribute Funeral: velatorio y ceremonia. Incluye ataúd recomendado de $2,495. Sin bóveda ni lote.",
        "Tribute funeral package: visitation and ceremony. Includes a $2,495 recommended casket. No vault or plot."
      ),
      casketTrad: true,
    },
  ],
});
