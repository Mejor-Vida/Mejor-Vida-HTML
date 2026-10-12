/**
 * New Mexico city guides. Estimator column is New Mexico Funeralocity averages
 * (captured 26 Jul 2026). Named columns are first-party lists only.
 * Las Cruces has no published four-package list, so that chart stays estimator-only.
 */
const { makeCity, cell } = require("./nm-factory");

const HERO = {
  heroVer: "landmark-v1",
};

const CITIES = [
  {
    "slug": "albuquerque",
    "name": "Albuquerque"
  },
  {
    "slug": "las-cruces",
    "name": "Las Cruces"
  },
  {
    "slug": "rio-rancho",
    "name": "Rio Rancho"
  },
  {
    "slug": "santa-fe",
    "name": "Santa Fe"
  }
];

function near(except) {
  return CITIES.filter((c) => c.slug !== except);
}

const FRENCH_GPL = "https://irp.cdn-website.com/68ab9c76/files/uploaded/FRENCH+GPL+2025+-+July.pdf";
const DIRECTORS_GPL = "https://www.nmcremation.com/GPL.pdf";
const DANIELS_GPL = "https://irp.cdn-website.com/74068d93/files/uploaded/2026.10.01+Daniels+GPL.pdf";
const GRAVE_NM = "https://www.gravesolutions.com/for-sale/cemetery-properties/new-mexico";
const SANDIA_AD = "https://www.gravesolutions.com/for-sale/sandia-memory-gardens-albuquerque-nm-cemetery-plot-99db08";
const HILLCREST_11500 = "https://www.gravesolutions.com/for-sale/hillcrest-memorial-gardens-las-cruces-nm-cemetery-plot-572438";
const VISTA_AD = "https://www.gravesolutions.com/for-sale/vista-verde-memorial-park-rio-rancho-nm-cemetery-plot-0bd263";

const EST_FOOT_ES =
  " La columna del estimador son promedios de Nuevo México de Funeralocity (26 jul. 2026). Esos promedios son de paquetes de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.";
const EST_FOOT_EN =
  " The estimator column is New Mexico Funeralocity averages (26 Jul 2026). Those averages are funeral-home packages. They do not include the plot, opening and closing, the vault, or the marker.";

function frenchHome(addr) {
  return {
    id: "french",
    name: "French Funerals",
    href: FRENCH_GPL,
    addr,
    dc: 3375,
    ib: 3175,
    dcEs: "Cremación directa, contenedor del comprador (GPL 1 jul. 2025). El permiso del OMI de $236.79 no va incluido.",
    dcEn: "Direct cremation, purchaser container (GPL 1 Jul 2025). The $236.79 OMI permit is not included.",
    ibEs: "Entierro inmediato, contenedor del comprador. Sin ceremonia. Lote aparte.",
    ibEn: "Immediate burial, purchaser container. No ceremony. Plot extra.",
  };
}

function directorsChoice() {
  return {
    id: "directors",
    name: "Director’s Choice",
    href: DIRECTORS_GPL,
    addr: "9316 Susan Ave SE, Albuquerque · 505-275-6524",
    dc: 1215,
    ib: 2395,
    dcEs: "Cremación simple en persona o por teléfono, con contenedor estándar (GPL 1 may. 2025). En línea está en $995. El permiso del OMI de $230 va aparte.",
    dcEn: "In-person or phone simple cremation, with the standard container (GPL 1 May 2025). Online arrangements are $995. The $230 OMI permit is extra.",
    ibEs: "Entierro inmediato sin ataúd (GPL 1 may. 2025). Lote aparte.",
    ibEn: "Immediate burial with no casket (GPL 1 May 2025). Plot extra.",
    memCell: cell(
      3895,
      "Servicio memorial con cremación: capilla, vista privada para la familia, carroza y contenedor estándar (GPL 1 may. 2025). Lote aparte.",
      "Cremation memorial service: chapel, private family viewing, hearse, and standard container (GPL 1 May 2025). Plot extra."
    ),
    trCell: cell(
      4195,
      "Paquete tradicional A: velatorio de un día, rosario, ceremonia y ataúd de calibre 20 sin sellar (GPL 1 may. 2025). Lote aparte.",
      "Traditional package A: one-day visitation, rosary, ceremony, and a 20-gauge non-sealer casket (GPL 1 May 2025). Plot extra."
    ),
    casketTrad: true,
  };
}

function danielsHome(addr) {
  return {
    id: "daniels",
    name: "Daniels Family",
    href: DANIELS_GPL,
    addr,
    dc: 3785,
    ib: 3995,
    dcEs: "Cremación directa, contenedor del comprador (GPL 1 oct. 2026). La misma lista en Alameda, Carlisle, Sara, Southern y Wyoming. No incluye velatorio ni ceremonia.",
    dcEn: "Direct cremation, purchaser container (GPL 1 Oct 2026). The same list at Alameda, Carlisle, Sara, Southern, and Wyoming. No visitation or ceremony.",
    ibEs: "Entierro inmediato, ataúd del comprador (GPL 1 oct. 2026). Con su ataúd mínimo está en $5,440. Lote aparte.",
    ibEn: "Immediate burial, purchaser casket (GPL 1 Oct 2026). With their minimum casket it is $5,440. Plot extra.",
  };
}

function riversideSantaFe() {
  return {
    id: "riverside",
    name: "Riverside Funeral Home",
    href: "https://sfprod.altogetherfuneral.com/funeral-cremation/new-mexico/santa-fe/riverside-funeral-home-santa-fe/nmrfs.html",
    addr: "1607 Saint Michaels Dr, Santa Fe · 505-240-6663",
    dc: 1435,
    ib: 2170,
    dcEs: "Cremación directa con urna temporal, sin velatorio ni ceremonia (precio publicado en su sitio, leído el 11 oct. 2026). Certificados de defunción aparte.",
    dcEn: "Direct cremation with a temporary urn, no visitation or ceremony (price on their site, read 11 Oct 2026). Death certificates extra.",
    ibEs: "Entierro sin velatorio ni ceremonia. No incluye ataúd, bóveda ni cementerio.",
    ibEn: "Burial with no visitation or ceremony. Does not include a casket, vault, or cemetery costs.",
  };
}

const shared = {
  analysisSameEs:
    "Un paquete con el mismo nombre puede incluir o no el ataúd, la urna o el velatorio. Lea la lista de esa funeraria. El lote del cementerio no va en ninguno.",
  analysisSameEn:
    "A package with the same name may or may not include the casket, urn, or visitation. Read that funeral home’s list. The cemetery plot is in none of them.",
  prepaidCemEs: "o en el cementerio que elija",
  prepaidCemEn: "or at the cemetery you choose",
  tableFootEs:
    "La columna del estimador son promedios de Nuevo México de Funeralocity (26 jul. 2026). Esos promedios son de paquetes de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.",
  tableFootEn:
    "The estimator column is New Mexico Funeralocity averages (26 Jul 2026). Those averages are funeral-home packages. They do not include the plot, opening and closing, the vault, or the marker.",
  resaleHref: GRAVE_NM,
};

module.exports = [
  makeCity({
    ...shared,
    ...HERO,
    slug: "albuquerque",
    heroFile: "albuquerque-balloon-fiesta",
    heroClass: "sc-hero--albuquerque",
    heroW: 836,
    heroH: 477,
    heroVer: "balloon-v1",
    nameEn: "Albuquerque",
    heroCaptionEs: "Globos sobre Albuquerque durante la fiesta de los globos, con las montañas Sandía al fondo",
    heroCaptionEn: "Hot air balloons over Albuquerque during the balloon fiesta, with the Sandia Mountains behind",
    countyEs: "condado de Bernalillo",
    countyEn: "Bernalillo County",
    metroEs: ["Albuquerque","Los Ranchos","North Valley","South Valley"],
    metroEn: ["Albuquerque","Los Ranchos","North Valley","South Valley"],
    metroTitleEs: "Albuquerque y el condado de Bernalillo",
    metroTitleEn: "Albuquerque and Bernalillo County",
    nearbyGuides: near("albuquerque"),
    prepaidCemEs: "en Sandia Memory Gardens o en Sunset Memorial Park",
    prepaidCemEn: "at Sandia Memory Gardens or Sunset Memorial Park",
    homes: [
      directorsChoice(),
      frenchHome("1111 University Blvd NE, Albuquerque · 505-843-6333"),
      danielsHome("3113 Carlisle Blvd NE, Albuquerque · 505-884-1188"),
    ],
    tableFootEs:
      "Director’s Choice: GPL 1 may. 2025 — cremación simple en persona $1,215 (en línea $995) con contenedor estándar; entierro inmediato $2,395 sin ataúd; memorial con cremación $3,895; paquete tradicional A $4,195 con ataúd de calibre 20. El permiso del OMI de $230 va aparte. French Funerals: GPL 1 jul. 2025, misma lista en sus cinco capillas — cremación directa $3,375 y entierro inmediato $3,175 con contenedor del comprador. El permiso del OMI de $236.79 no va incluido. French no publica un total de memorial ni de funeral con velatorio. Daniels Family: GPL 1 oct. 2026, la misma lista en Alameda, Carlisle, Wyoming, Sara y Southern — cremación directa $3,785 y entierro inmediato $3,995 con contenedor del comprador. Daniels no publica un total de memorial ni de funeral con velatorio." +
      EST_FOOT_ES,
    tableFootEn:
      "Director’s Choice: GPL 1 May 2025 — in-person simple cremation $1,215 (online $995) with the standard container; immediate burial $2,395 with no casket; cremation memorial $3,895; traditional package A $4,195 with a 20-gauge casket. The $230 OMI permit is extra. French Funerals: GPL 1 Jul 2025, the same list at all five chapels — direct cremation $3,375 and immediate burial $3,175 with a purchaser container. The $236.79 OMI permit is not included. French does not publish a memorial total or a visitation-funeral total. Daniels Family: GPL 1 Oct 2026, the same list at Alameda, Carlisle, Wyoming, Sara, and Southern — direct cremation $3,785 and immediate burial $3,995 with a purchaser container. Daniels does not publish a memorial total or a visitation-funeral total." +
      EST_FOOT_EN,
    analysisSameEs:
      "En Director’s Choice el paquete tradicional A (<strong>$4,195</strong>) ya incluye un ataúd de calibre 20. Su entierro inmediato (<strong>$2,395</strong>) no lo incluye. French publica cremación directa en <strong>$3,375</strong> y entierro inmediato en <strong>$3,175</strong>, ambos con contenedor del comprador. Daniels (GPL 1 oct. 2026) publica cremación directa en <strong>$3,785</strong> y entierro inmediato en <strong>$3,995</strong>, también con contenedor del comprador, y no publica un total de funeral con velatorio. El promedio de entierro completo de Nuevo México (<strong>$7,829</strong>) suele incluir ataúd; no es el paquete de una casa.",
    analysisSameEn:
      "At Director’s Choice, traditional package A (<strong>$4,195</strong>) already includes a 20-gauge casket. Its immediate burial (<strong>$2,395</strong>) does not. French publishes direct cremation at <strong>$3,375</strong> and immediate burial at <strong>$3,175</strong>, both with a purchaser container. Daniels (GPL 1 Oct 2026) publishes direct cremation at <strong>$3,785</strong> and immediate burial at <strong>$3,995</strong>, also with a purchaser container, and does not publish a visitation-funeral total. New Mexico’s full-burial average (<strong>$7,829</strong>) usually includes a casket; it is not one home’s package.",
    faqPlotEs:
      "No. El precio de la funeraria no compra el espacio. El 9 de enero de 2025, un anuncio en Sandia Memory Gardens pedía $1,600 por espacio ($3,200 por dos). Eso es lo que pide el vendedor, no la lista del cementerio. Sunset Memorial Park no publica el precio del lote; llame al 505-345-3536. Abrir y cerrar, la bóveda y la lápida van aparte.",
    faqPlotEn:
      "No. The funeral-home price does not buy the space. On January 9, 2025, an ad at Sandia Memory Gardens asked $1,600 per space ($3,200 for two). That is the seller’s asking price, not the cemetery’s list. Sunset Memorial Park does not publish a lot price; call 505-345-3536. Opening and closing, the vault, and the marker are extra.",
    officesNoteEs:
      "Sandia no publica el lote nuevo en la web. El anuncio de reventa no es la lista de la oficina. Sunset tampoco publica el precio del lote.",
    officesNoteEn:
      "Sandia does not publish a new-lot price online. The resale ad is not the office list. Sunset does not publish a lot price either.",
    newListEs:
      "Ningún precio de la tabla de arriba incluye el lote, abrir y cerrar, la bóveda ni la lápida. En la GPL de Director’s Choice del 1 de mayo de 2025, abrir y cerrar figura en <strong>$600</strong> (una profundidad) y <strong>$800</strong> (doble). Eso es un cargo de esa funeraria, no el precio del lote de Sunset ni de Sandia.",
    newListEn:
      "None of the chart prices include the plot, opening and closing, a vault, or a marker. On the Director’s Choice GPL of May 1, 2025, opening and closing is <strong>$600</strong> (single depth) and <strong>$800</strong> (double depth). That is that funeral home’s charge, not Sunset’s or Sandia’s lot price.",
    officesEs: [
      '<a href="https://www.sandiamemorygardens.com/" rel="noopener" target="_blank">Sandia Memory Gardens</a>, 9500 San Pedro Dr NE. Teléfono 505-821-0010. Reventa vista el 9 de enero de 2025: <strong>$1,600</strong> por espacio. Lote nuevo: pida la lista; no está en la web.',
      '<a href="https://www.sunset-memorial.com/" rel="noopener" target="_blank">Sunset Memorial Park</a>, 924 Menaul Blvd NE. Teléfono 505-345-3536. No publica el precio del lote en internet.',
    ],
    officesEn: [
      '<a href="https://www.sandiamemorygardens.com/" rel="noopener" target="_blank">Sandia Memory Gardens</a>, 9500 San Pedro Dr NE. Phone 505-821-0010. Resale seen January 9, 2025: <strong>$1,600</strong> per space. New lot: ask for the list; it is not on the website.',
      '<a href="https://www.sunset-memorial.com/" rel="noopener" target="_blank">Sunset Memorial Park</a>, 924 Menaul Blvd NE. Phone 505-345-3536. They do not publish a lot price online.',
    ],
    analysisPlotEs:
      "Ninguna cifra de la tabla es el lote. El 9 de enero de 2025, un anuncio en Sandia Memory Gardens pedía <strong>$1,600</strong> por espacio. Sunset Memorial Park no publica ese precio (505-345-3536). En la GPL de Director’s Choice, abrir y cerrar está en <strong>$600</strong> o <strong>$800</strong>; eso tampoco es el lote.",
    analysisPlotEn:
      "None of the figures in the table are the plot. On January 9, 2025, an ad at Sandia Memory Gardens asked <strong>$1,600</strong> per space. Sunset Memorial Park does not publish that price (505-345-3536). On the Director’s Choice GPL, opening and closing is <strong>$600</strong> or <strong>$800</strong>; that is not the plot either.",
    unpublishedLeadEs:
      "Garcia y Strong-Thorne aparecen en el sitio de Daniels, pero la GPL del 1 de octubre de 2026 nombra Alameda, Carlisle, Wyoming, Sara y Southern. Esas cinco usan la columna Daniels de arriba. Llame a Garcia y a Strong-Thorne y pida su lista vigente.",
    unpublishedLeadEn:
      "Garcia and Strong-Thorne appear on the Daniels website, but the October 1, 2026 GPL names Alameda, Carlisle, Wyoming, Sara, and Southern. Those five use the Daniels column above. Call Garcia and Strong-Thorne and ask for their current list.",
    unpublishedHomes: [
      { name: "Garcia Mortuary", href: "https://www.danielsfuneral.com/", addr: "717 Stover Ave SW", phone: "505-243-5222" },
      { name: "Strong-Thorne Mortuary", href: "https://www.danielsfuneral.com/", addr: "1100 Coal Ave SE", phone: "505-842-8800" },
    ],
    plotPriceRange: {
      titleEs: "¿Cuánto cuesta un lote en el área de Albuquerque?",
      titleEn: "What does a burial plot cost in the Albuquerque area?",
      introEs:
        "Solo cifras de anuncios de particulares que seguían en el tablero. <strong>No</strong> es un promedio del condado y <strong>no</strong> incluye abrir/cerrar, bóveda ni lápida, salvo que la nota lo diga.",
      introEn:
        "Only figures from private ads that were still on the board. <strong>Not</strong> a county average, and <strong>not</strong> opening/closing, a vault, or a marker, unless the note says so.",
      low: {
        amount: 1600,
        labelEs: "Reventa, un espacio",
        labelEn: "Resale, one space",
        noteEs: "Sandia Memory Gardens, Nativity: el anuncio del 9 de enero de 2025 pide $1,600 por espacio.",
        noteEn: "Sandia Memory Gardens, Nativity: the ad listed January 9, 2025 asks $1,600 per space.",
      },
      mid: {
        amount: 3200,
        labelEs: "El mismo anuncio, dos espacios",
        labelEn: "Same ad, two spaces",
        noteEs: "Esos dos espacios de Sandia se venden juntos por $3,200. No es el precio de un lote nuevo.",
        noteEn: "Those two Sandia spaces are sold together for $3,200. Not a new-lot price.",
      },
      high: {
        amount: 12000,
        labelEs: "Paquete de dos espacios",
        labelEn: "Two-space package",
        noteEs: "Sunset Memorial Park: un anuncio pide $12,000 por dos espacios que ya incluyen dos bóvedas, lápida compartida y dos aperturas. No es solo el lote.",
        noteEn: "Sunset Memorial Park: an ad asks $12,000 for two spaces that already include two vaults, a companion marker, and two openings. Not plot only.",
      },
      footEs:
        `Fuentes: <a href="${SANDIA_AD}" rel="noopener" target="_blank">Grave Solutions (Sandia)</a> y el <a href="${GRAVE_NM}" rel="noopener" target="_blank">tablero de Nuevo México</a> (Sunset, visto el 11 oct. 2026). Sandia y Sunset no publican el lote nuevo en internet.`,
      footEn:
        `Sources: <a href="${SANDIA_AD}" rel="noopener" target="_blank">Grave Solutions (Sandia)</a> and the <a href="${GRAVE_NM}" rel="noopener" target="_blank">New Mexico board</a> (Sunset, seen 11 Oct 2026). Sandia and Sunset do not publish a new-lot price online.`,
    },
    plotPublished: [
      {
        name: "Sandia Memory Gardens",
        url: "https://www.sandiamemorygardens.com/",
        priceEs: "$1,600 por espacio",
        priceEn: "$1,600 per space",
        priceLabelEs: "Anuncio de reventa",
        priceLabelEn: "Resale ad",
        noteEs: "Dos espacios en Nativity, lote 29-D, a $3,200 juntos. No es la lista de la oficina.",
        noteEn: "Two spaces in Nativity, lot 29-D, at $3,200 together. Not the office list.",
        asOfEs: "Anuncio del 9 ene. 2025, visto el 11 oct. 2026",
        asOfEn: "Ad listed 9 Jan 2025, seen 11 Oct 2026",
        sourceUrl: SANDIA_AD,
        sourceLabelEs: "Ver el anuncio",
        sourceLabelEn: "View the ad",
      },
    ],
    plotNew: null,
    plotResale: 1600,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "las-cruces",
    heroFile: "las-cruces-organ-mountains-hero",
    heroClass: "sc-hero--las-cruces",
    heroW: 1024,
    heroH: 548,
    heroVer: "organ-v2",
    nameEn: "Las Cruces",
    heroCaptionEs: "Montañas Organ y la carretera hacia Las Cruces",
    heroCaptionEn: "Organ Mountains and the highway into Las Cruces",
    countyEs: "condado de Doña Ana",
    countyEn: "Doña Ana County",
    metroEs: ["Las Cruces","Mesilla","Anthony","Sunland Park"],
    metroEn: ["Las Cruces","Mesilla","Anthony","Sunland Park"],
    metroTitleEs: "Las Cruces y el condado de Doña Ana",
    metroTitleEn: "Las Cruces and Doña Ana County",
    nearbyGuides: near("las-cruces"),
    prepaidCemEs: "en Hillcrest Memorial Gardens",
    prepaidCemEn: "at Hillcrest Memorial Gardens",
    unpublishedLeadEs:
      "Ninguna funeraria de Las Cruces publica en internet los cuatro paquetes de la tabla, así que la tabla usa solo el estimador de Nuevo México. Estas casas entierran y creman. Llame y pida la lista general de precios vigente.",
    unpublishedLeadEn:
      "No Las Cruces funeral home publishes the four packages on this chart, so the table uses only the New Mexico estimator. These homes both bury and cremate. Call and ask for the current general price list.",
    unpublishedHomes: [
      {
        name: "Baca’s Funeral Chapels & Sunset Crematory",
        href: "https://www.bacasfuneralchapelslascruces.com/",
        addr: "300 East Boutz",
        phone: "575-527-2222",
      },
    ],
    faqPlotEs: "No. El precio de la funeraria no compra el espacio. El 11 de octubre de 2026, el tablero de Grave Solutions seguía mostrando anuncios de particulares para Hillcrest Memorial Gardens, en Las Cruces, por $10,000 y $11,500, cada uno por dos espacios juntos. Eso es lo que pide el vendedor, no la lista del cementerio. Abrir y cerrar, la bóveda y la lápida van aparte.",
    faqPlotEn: "No. The funeral-home price does not buy the space. On October 11, 2026, the Grave Solutions board still showed private ads for Hillcrest Memorial Gardens in Las Cruces at $10,000 and $11,500, each for two spaces together. Those are asking prices, not the cemetery’s price list. Opening and closing, the vault, and the marker are extra.",
    officesNoteEs: "Esas cifras son anuncios de particulares para dos espacios juntos. No son un precio de lote nuevo del cementerio.",
    officesNoteEn: "Those figures are private ads for two spaces together. They are not a new-lot price from the cemetery.",
    newListEs: "El 11 de octubre de 2026, Grave Solutions seguía mostrando dos anuncios en Hillcrest Memorial Gardens, Las Cruces: <strong>$10,000</strong> y <strong>$11,500</strong>, cada uno por dos espacios juntos. No los use como precio de un solo lote. Pida a la oficina la lista de lotes nuevos y confirme que el anuncio sigue vigente.",
    newListEn: "On October 11, 2026, Grave Solutions still showed two ads at Hillcrest Memorial Gardens, Las Cruces: <strong>$10,000</strong> and <strong>$11,500</strong>, each for two spaces together. Do not read either figure as one lot. Ask the office for the new-lot list and confirm the ad is still active.",
    officesEs: ["Hillcrest Memorial Gardens, 5140 W Picacho Ave, Las Cruces. Reventa en el tablero el 11 de octubre de 2026: $10,000 o $11,500 por dos espacios juntos. Lote nuevo: pida la lista en la oficina."],
    officesEn: ["Hillcrest Memorial Gardens, 5140 W Picacho Ave, Las Cruces. Resale on the board October 11, 2026: $10,000 or $11,500 for two spaces together. New lot: ask the office for the list."],
    analysisPlotEs: "El 11 de octubre de 2026, anuncios de particulares en Hillcrest Memorial Gardens pedían <strong>$10,000</strong> y <strong>$11,500</strong> por dos espacios juntos. En Memory Gardens of the Valley, Santa Teresa, otro anuncio pedía <strong>$4,000</strong> por espacio. Eso no está en el promedio de la funeraria. Abrir y cerrar, la bóveda y la lápida van aparte.",
    analysisPlotEn: "On October 11, 2026, private ads at Hillcrest Memorial Gardens asked <strong>$10,000</strong> and <strong>$11,500</strong> for two spaces together. At Memory Gardens of the Valley in Santa Teresa, another ad asked <strong>$4,000</strong> per space. That is not in the funeral-home average. Opening and closing, the vault, and the marker are extra.",
    plotPriceRange: {
      titleEs: "¿Cuánto cuesta un lote en el área de Las Cruces?",
      titleEn: "What does a burial plot cost in the Las Cruces area?",
      introEs:
        "Solo anuncios de particulares que seguían en el tablero el 11 de octubre de 2026. <strong>No</strong> es la lista de la oficina y <strong>no</strong> incluye abrir/cerrar, bóveda ni lápida.",
      introEn:
        "Only private ads still on the board on October 11, 2026. <strong>Not</strong> the office list, and <strong>not</strong> opening/closing, a vault, or a marker.",
      low: {
        amount: 4000,
        labelEs: "Reventa, un espacio",
        labelEn: "Resale, one space",
        noteEs: "Memory Gardens of the Valley, Santa Teresa: el anuncio pide $4,000 por cada espacio (Garden of Tranquility).",
        noteEn: "Memory Gardens of the Valley, Santa Teresa: the ad asks $4,000 for each space (Garden of Tranquility).",
      },
      mid: {
        amount: 10000,
        labelEs: "Dos espacios juntos",
        labelEn: "Two spaces together",
        noteEs: "Hillcrest Memorial Gardens, lote 62: $10,000 por dos espacios lado a lado. No lo divida como si cada uno costara $5,000 en la oficina.",
        noteEn: "Hillcrest Memorial Gardens, lot 62: $10,000 for two side-by-side spaces. Do not split that into a $5,000 office price.",
      },
      high: {
        amount: 11500,
        labelEs: "Dos espacios, Garden of Gethsemane",
        labelEn: "Two spaces, Garden of Gethsemane",
        noteEs: "Hillcrest, lote 71, espacios 3 y 4. Anuncio del 26 de marzo de 2025: $11,500 por los dos.",
        noteEn: "Hillcrest, lot 71, spaces 3 and 4. Ad listed March 26, 2025: $11,500 for both.",
      },
      footEs:
        `Fuentes: <a href="${HILLCREST_11500}" rel="noopener" target="_blank">Grave Solutions (Hillcrest, $11,500)</a> y el <a href="${GRAVE_NM}" rel="noopener" target="_blank">tablero de Nuevo México</a> (Hillcrest $10,000 y Memory Gardens of the Valley), vistos el 11 oct. 2026. Ninguno es un lote nuevo de la oficina.`,
      footEn:
        `Sources: <a href="${HILLCREST_11500}" rel="noopener" target="_blank">Grave Solutions (Hillcrest, $11,500)</a> and the <a href="${GRAVE_NM}" rel="noopener" target="_blank">New Mexico board</a> (Hillcrest $10,000 and Memory Gardens of the Valley), seen 11 Oct 2026. None of these is a new lot from the office.`,
    },
    plotNew: null,
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "rio-rancho",
    heroFile: "rio-rancho-rio-grande",
    heroClass: "sc-hero--rio-rancho",
    heroW: 774,
    heroH: 938,
    heroVer: "river-v1",
    nameEn: "Rio Rancho",
    heroCaptionEs: "El Río Grande y las montañas Sandía cerca de Rio Rancho",
    heroCaptionEn: "The Rio Grande and the Sandia Mountains near Rio Rancho",
    countyEs: "condado de Sandoval",
    countyEn: "Sandoval County",
    metroEs: ["Rio Rancho","Bernalillo","Corrales","Placitas"],
    metroEn: ["Rio Rancho","Bernalillo","Corrales","Placitas"],
    metroTitleEs: "Rio Rancho y el condado de Sandoval",
    metroTitleEn: "Rio Rancho and Sandoval County",
    nearbyGuides: near("rio-rancho"),
    prepaidCemEs: "en Vista Verde Memorial Park",
    prepaidCemEn: "at Vista Verde Memorial Park",
    homes: [
      frenchHome("1275 Unser Blvd NE, Rio Rancho · 505-338-2000"),
      danielsHome("4310 Sara Rd SE, Rio Rancho · 505-892-9920"),
    ],
    tableFootEs:
      "French Funerals, capilla de Rio Rancho: GPL 1 jul. 2025, la misma lista que en Albuquerque — cremación directa $3,375 y entierro inmediato $3,175 con contenedor del comprador. El permiso del OMI de $236.79 no va incluido. French no publica un total de memorial ni de funeral con velatorio. Daniels Family: GPL 1 oct. 2026, la misma lista en Sara Road y Southern — cremación directa $3,785 y entierro inmediato $3,995 con contenedor del comprador. Daniels no publica un total de memorial ni de funeral con velatorio." +
      EST_FOOT_ES,
    tableFootEn:
      "French Funerals, Rio Rancho chapel: GPL 1 Jul 2025, the same list as Albuquerque — direct cremation $3,375 and immediate burial $3,175 with a purchaser container. The $236.79 OMI permit is not included. French does not publish a memorial total or a visitation-funeral total. Daniels Family: GPL 1 Oct 2026, the same list at Sara Road and Southern — direct cremation $3,785 and immediate burial $3,995 with a purchaser container. Daniels does not publish a memorial total or a visitation-funeral total." +
      EST_FOOT_EN,
    analysisSameEs:
      "French publica cremación directa en <strong>$3,375</strong> y entierro inmediato en <strong>$3,175</strong>, ambos con contenedor del comprador y sin ceremonia. Daniels (GPL 1 oct. 2026) publica cremación directa en <strong>$3,785</strong> y entierro inmediato en <strong>$3,995</strong>, también sin velatorio. Ninguna de las dos publica un total de funeral con velatorio. El promedio de entierro completo de Nuevo México (<strong>$7,829</strong>) suele incluir ataúd; no es el paquete de una casa.",
    analysisSameEn:
      "French publishes direct cremation at <strong>$3,375</strong> and immediate burial at <strong>$3,175</strong>, both with a purchaser container and no ceremony. Daniels (GPL 1 Oct 2026) publishes direct cremation at <strong>$3,785</strong> and immediate burial at <strong>$3,995</strong>, also with no visitation. Neither publishes a visitation-funeral total. New Mexico’s full-burial average (<strong>$7,829</strong>) usually includes a casket; it is not one home’s package.",
    faqPlotEs:
      "No. El precio de French no compra el espacio. El 11 de octubre de 2026, Grave Solutions aún mostraba un anuncio de Vista Verde Memorial Park listado el 30 de noviembre de 2015: $1,595 por espacio, y el vendedor citaba unos $1,995 en la lista del cementerio en ese momento. Confirme que el anuncio sigue vigente. Pida la lista actual en la oficina. Abrir y cerrar, la bóveda y la lápida van aparte.",
    faqPlotEn:
      "No. French’s price does not buy the space. On October 11, 2026, Grave Solutions still showed a Vista Verde Memorial Park ad listed November 30, 2015: $1,595 per space, and the seller cited about $1,995 on the cemetery list at that time. Confirm the ad is still active. Ask the office for the current list. Opening and closing, the vault, and the marker are extra.",
    officesNoteEs:
      "El anuncio de 2015 no es la lista vigente de la oficina. Vista Verde no publica el lote nuevo en la web.",
    officesNoteEn:
      "The 2015 ad is not the office’s current list. Vista Verde does not publish a new-lot price online.",
    newListEs:
      "Ningún precio de la tabla incluye el lote. El anuncio de Vista Verde, listado el 30 de noviembre de 2015 y aún en el tablero el 11 de octubre de 2026, pide <strong>$1,595</strong> por cada uno de dos espacios y cita unos <strong>$1,995</strong> de lista en la fecha del anuncio. No use $1,995 como precio de hoy.",
    newListEn:
      "None of the chart prices include the plot. The Vista Verde ad, listed November 30, 2015 and still on the board October 11, 2026, asks <strong>$1,595</strong> for each of two spaces and cites about <strong>$1,995</strong> on the list as of the ad. Do not use $1,995 as today’s price.",
    officesEs: [
      "Vista Verde Memorial Park, 4310 Sara Rd SE. Teléfono del cementerio en la GPL de Daniels del 1 de octubre de 2026: 505-338-1309. Reventa: anuncio del 30 de noviembre de 2015, aún en el tablero el 11 de octubre de 2026, a $1,595 por espacio. Lote nuevo: pida la lista. La capilla Daniels de Sara Road está en esa dirección: 505-892-9920.",
    ],
    officesEn: [
      "Vista Verde Memorial Park, 4310 Sara Rd SE. Cemetery phone on the Daniels GPL of October 1, 2026: 505-338-1309. Resale: ad listed November 30, 2015, still on the board October 11, 2026, at $1,595 per space. New lot: ask for the list. Daniels’ Sara Road Chapel is at that address: 505-892-9920.",
    ],
    analysisPlotEs:
      "El lote no está en la GPL de French. En Vista Verde, un anuncio del 30 de noviembre de 2015 —aún visible el 11 de octubre de 2026— pide <strong>$1,595</strong> por espacio. La cifra de unos $1,995 es lo que el vendedor citaba entonces, no una lista publicada hoy.",
    analysisPlotEn:
      "The plot is not on French’s GPL. At Vista Verde, an ad listed November 30, 2015 — still visible October 11, 2026 — asks <strong>$1,595</strong> per space. The figure of about $1,995 is what the seller cited then, not a list published today.",
    plotPublished: [
      {
        name: "Vista Verde Memorial Park",
        priceEs: "$1,595 por espacio",
        priceEn: "$1,595 per space",
        priceLabelEs: "Anuncio de reventa",
        priceLabelEn: "Resale ad",
        noteEs: "Dos espacios, lote 59. El vendedor citó unos $1,995 de lista cuando publicó el anuncio el 30 de noviembre de 2015. Esa cita no es el precio de hoy.",
        noteEn: "Two spaces, lot 59. The seller cited about $1,995 on the list when the ad was posted November 30, 2015. That citation is not today’s price.",
        asOfEs: "Listado el 30 nov. 2015, visto el 11 oct. 2026",
        asOfEn: "Listed 30 Nov 2015, seen 11 Oct 2026",
        sourceUrl: VISTA_AD,
        sourceLabelEs: "Ver el anuncio",
        sourceLabelEn: "View the ad",
      },
    ],
    plotNew: null,
    plotResale: 1595,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "santa-fe",
    heroFile: "santa-fe-skyline",
    heroClass: "sc-hero--santa-fe",
    heroW: 1024,
    heroH: 590,
    heroVer: "skyline-v1",
    nameEn: "Santa Fe",
    heroCaptionEs: "Santa Fe al atardecer, con la torre y los cerros al fondo",
    heroCaptionEn: "Santa Fe at dusk, with the tower and the hills behind",
    countyEs: "condado de Santa Fe",
    countyEn: "Santa Fe County",
    metroEs: ["Santa Fe","Eldorado","Agua Fria","La Cienega"],
    metroEn: ["Santa Fe","Eldorado","Agua Fria","La Cienega"],
    metroTitleEs: "Santa Fe y el condado de Santa Fe",
    metroTitleEn: "Santa Fe and Santa Fe County",
    nearbyGuides: near("santa-fe"),
    prepaidCemEs: "en Memorial Gardens of Santa Fe o, si hay elegibilidad, en el cementerio nacional de Santa Fe",
    prepaidCemEn: "at Memorial Gardens of Santa Fe or, if eligible, at Santa Fe National Cemetery",
    homes: [riversideSantaFe()],
    tableFootEs:
      "Riverside Funeral Home, Santa Fe: precios publicados en su sitio, leídos el 11 de octubre de 2026 — cremación directa $1,435 con urna temporal y sin ceremonia; entierro sin velatorio $2,170, sin ataúd, bóveda ni cementerio. No publica un total de cremación con memorial ni de funeral con velatorio. Certificados de defunción aparte." +
      EST_FOOT_ES,
    tableFootEn:
      "Riverside Funeral Home, Santa Fe: prices on its site, read October 11, 2026 — direct cremation $1,435 with a temporary urn and no ceremony; burial with no visitation $2,170, with no casket, vault, or cemetery costs. It does not publish a cremation-with-memorial total or a visitation-funeral total. Death certificates are extra." +
      EST_FOOT_EN,
    analysisSameEs:
      "Riverside publica cremación directa en <strong>$1,435</strong> (urna temporal incluida) y entierro sin ceremonia en <strong>$2,170</strong> (sin ataúd). No publica un total de memorial ni de funeral con velatorio. El promedio de entierro completo de Nuevo México (<strong>$7,829</strong>) suele incluir ataúd; no es el paquete de Riverside.",
    analysisSameEn:
      "Riverside publishes direct cremation at <strong>$1,435</strong> (temporary urn included) and burial with no ceremony at <strong>$2,170</strong> (no casket). It does not publish a memorial total or a visitation-funeral total. New Mexico’s full-burial average (<strong>$7,829</strong>) usually includes a casket; it is not Riverside’s package.",
    faqPlotEs:
      "No. El precio de Riverside no compra el espacio. Esta guía no publica un precio de lote nuevo de un cementerio privado en Santa Fe. El anuncio de Memorial Gardens of Santa Fe en Grave Solutions está marcado como vendido, así que no se usa como precio. El cementerio nacional de Santa Fe, 501 N Guadalupe St, tiene espacio para restos con ataúd y cremados; la elegibilidad se confirma en el 505-988-6400. Abrir y cerrar, la bóveda y la lápida de un cementerio privado van aparte.",
    faqPlotEn:
      "No. Riverside’s price does not buy the space. This guide does not publish a new private-cemetery lot price for Santa Fe. The Memorial Gardens of Santa Fe ad on Grave Solutions is marked sold, so it is not used as a price. Santa Fe National Cemetery, 501 N Guadalupe St, has space for casketed and cremated remains; confirm eligibility at 505-988-6400. Opening and closing, the vault, and a marker at a private cemetery are extra.",
    officesNoteEs:
      "Memorial Gardens no tiene un anuncio vigente con precio. El cementerio nacional no es una lista de lote privado.",
    officesNoteEn:
      "Memorial Gardens has no current priced ad. The national cemetery is not a private-lot price list.",
    newListEs:
      "Ningún precio de la tabla incluye el lote. No use el anuncio vendido de Memorial Gardens of Santa Fe, 417 East Rodeo Dr, como precio. Pida la lista en ese cementerio. Para un veterano o un familiar elegible, pregunte en el cementerio nacional de Santa Fe (505-988-6400) antes de comprar un lote privado.",
    newListEn:
      "None of the chart prices include the plot. Do not use the sold Memorial Gardens of Santa Fe ad, 417 East Rodeo Dr, as a price. Ask that cemetery for its list. For an eligible veteran or family member, ask Santa Fe National Cemetery (505-988-6400) before buying a private lot.",
    officesEs: [
      "Memorial Gardens of Santa Fe, 417 East Rodeo Dr. El anuncio de Grave Solutions está vendido. Lote nuevo: pida la lista; no hay un precio publicado en esta guía.",
      '<a href="https://www.cem.va.gov/cems/nchp/santafe.asp" rel="noopener" target="_blank">Cementerio nacional de Santa Fe</a>, 501 N Guadalupe St. Teléfono 505-988-6400. Hay espacio para restos con ataúd y cremados. Confirme la elegibilidad; no es un precio de lote privado.',
    ],
    officesEn: [
      "Memorial Gardens of Santa Fe, 417 East Rodeo Dr. The Grave Solutions ad is sold. New lot: ask for the list; this guide does not have a published price.",
      '<a href="https://www.cem.va.gov/cems/nchp/santafe.asp" rel="noopener" target="_blank">Santa Fe National Cemetery</a>, 501 N Guadalupe St. Phone 505-988-6400. Space is available for casketed and cremated remains. Confirm eligibility; this is not a private-lot price.',
    ],
    analysisPlotEs:
      "El lote no está en el precio de Riverside. No hay un precio de lote nuevo publicado para un cementerio privado de Santa Fe. El anuncio de Memorial Gardens está vendido. El cementerio nacional (505-988-6400) es para quien cumple la elegibilidad de VA, no una lista de reventa.",
    analysisPlotEn:
      "The plot is not in Riverside’s price. There is no published new-lot price for a private Santa Fe cemetery. The Memorial Gardens ad is sold. The national cemetery (505-988-6400) is for people who meet VA eligibility, not a resale price list.",
    plotNew: null,
    plotResale: null,
  })
];
