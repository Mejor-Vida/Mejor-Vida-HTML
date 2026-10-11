/** Shared burial-plot copy and Grave Solutions board for Arizona city guides. */
const GRAVE_AZ = "https://www.gravesolutions.com/for-sale/cemetery-properties/arizona";

const PHOENIX_PLOT_OFFICES = [
  {
    name: "Greenwood Memory Lawn Mortuary & Cemetery",
    addr: "719 N 27th Ave, Phoenix",
    phone: "623-846-1212",
    href: "https://www.dignitymemorial.com/funeral-homes/arizona/phoenix/greenwood-memory-lawn-mortuary/3482",
    noteEs: "Vende espacios en el mismo terreno que la funeraria. No publica un precio de partida del lote en la web.",
    noteEn: "Sells spaces on the same grounds as the funeral home. Does not post a starting plot price online.",
  },
  {
    name: "Resthaven / Carr-Tenney Mortuary & Memorial Gardens",
    addr: "4310 E Southern Ave, Phoenix",
    phone: "602-305-4400",
    href: "https://www.resthavenfuneral.com/",
    noteEs: "Cementerio y funeraria en el sur de Phoenix. Pida la lista general de precios por escrito.",
    noteEn: "Cemetery and funeral home in south Phoenix. Ask for the general price list in writing.",
  },
  {
    name: "National Memorial Park & Mortuary",
    addr: "6333 N 7th St, Phoenix",
    phone: "602-277-4407",
    href: "https://www.nationalmemorialpark.com/",
    noteEs: "No publica el precio del lote en internet. Llame y pida la lista vigente.",
    noteEn: "Does not publish plot prices online. Call and ask for the current list.",
  },
];

const TUCSON_PLOT_OFFICES = [
  {
    name: "Evergreen Mortuary & Cemetery",
    addr: "3015 N Oracle Rd, Tucson",
    phone: "520-888-7470",
    href: "https://www.evergreen-tucson.com/",
    noteEs: "Cementerio y crematorio en el mismo campus que la funeraria de la tabla. Pida la lista de propiedad.",
    noteEn: "Cemetery and crematory on the same campus as the funeral home on the chart. Ask for the property list.",
  },
  {
    name: "East Lawn Palms Memorial Park & Mortuary",
    addr: "5801 E Grant Rd, Tucson",
    phone: "520-745-3711",
    href: "https://www.eastlawnpalms.com/",
    noteEs: "No publica un precio de partida del lote en la web. Los anuncios de reventa citan a veces más de $10,000 por espacio.",
    noteEn: "Does not post a starting plot price online. Resale ads sometimes cite more than $10,000 per space.",
  },
];

const MESA_PLOT_OFFICES = [
  {
    name: "Queen of Heaven Catholic Cemetery",
    addr: "1562 E Baseline Rd, Mesa",
    phone: "480-832-3030",
    href: "https://www.queenofheavencemetery.com/",
    noteEs: "Cementerio católico en Mesa. Paquetes prepagados y espacios se cotizan en la oficina.",
    noteEn: "Catholic cemetery in Mesa. Pre-need packages and spaces are quoted at the office.",
  },
  ...PHOENIX_PLOT_OFFICES.slice(0, 2),
];

const GLENDALE_PLOT_OFFICES = [
  {
    name: "Resthaven Park West Cemetery",
    addr: "6290 W Northern Ave, Glendale",
    phone: "623-939-4900",
    href: "https://www.resthavenfuneral.com/",
    noteEs: "Anuncios de reventa en 2026 citaron unos $5,500 en la lista del cementerio y $4,000 de precio pedido.",
    noteEn: "Resale ads in 2026 cited about $5,500 on the cemetery list and $4,000 asking.",
  },
  {
    name: "West Resthaven Cemetery",
    addr: "6450 W Northern Ave, Glendale",
    phone: "623-939-4900",
    href: "https://www.resthavenfuneral.com/",
    noteEs: "Anuncios pidieron unos $3,500 por espacio en secciones más antiguas.",
    noteEn: "Ads asked about $3,500 per space in older sections.",
  },
  PHOENIX_PLOT_OFFICES[0],
];

function plotPriceRangePhoenix(nameEs, nameEn) {
  return {
    titleEs: `¿Cuánto cuesta un lote en el área de ${nameEs}?`,
    titleEn: `What does a burial plot cost in the ${nameEn} area?`,
    introEs:
      "Solo el <strong>espacio de la tumba en el cementerio</strong> (el lote), cuando hay un anuncio que cita el precio de lista del cementerio o un precio pedido de reventa. <strong>No</strong> incluye abrir/cerrar, bóveda, lápida ni funeral. No es un promedio oficial del condado.",
    introEn:
      "Only the <strong>cemetery grave space</strong> (the plot), when an ad cites the cemetery’s list price or a resale asking price. <strong>Does not</strong> include opening/closing, a vault, a marker, or the funeral. Not an official county average.",
    low: {
      amount: 2400,
      labelEs: "Reventa (anuncio citado)",
      labelEn: "Resale (cited ad)",
      noteEs:
        "Anuncio en Grave Solutions por espacio en Greenwood Memory Lawn; el vendedor citó unos $3,995 en la lista del cementerio y pedía $2,400.",
      noteEn:
        "Grave Solutions ad for a space at Greenwood Memory Lawn; the seller cited about $3,995 on the cemetery list and asked $2,400.",
    },
    mid: {
      amount: 4000,
      labelEs: "Lista del cementerio (citada en anuncios)",
      labelEn: "Cemetery list (cited in ads)",
      noteEs:
        "Varios anuncios de particulares en Greenwood y Resthaven citan unos $3,995–$5,500 por espacio antes de bóveda y lápida.",
      noteEn:
        "Several private ads at Greenwood and Resthaven cite about $3,995 to $5,500 per space before vault and marker.",
    },
    high: {
      amount: 9000,
      labelEs: "Paquete o dos espacios (anuncio)",
      labelEn: "Package or two spaces (ad)",
      noteEs:
        "Anuncios en Resthaven Park East pidieron hasta unos $18,000 por dos espacios con bóvedas y marcador incluidos — no es solo el lote.",
      noteEn:
        "Resthaven Park East ads asked up to about $18,000 for two spaces with vaults and a marker included — not plot only.",
    },
    footEs:
      'Fuentes: anuncios en <a href="https://www.gravesolutions.com/for-sale/greenwood-memory-lawn-phoenix-az-cemetery-plot-fdd18f" rel="noopener" target="_blank">Grave Solutions (Greenwood)</a>, <a href="https://www.gravesolutions.com/for-sale/resthaven-park-cemetary-east-phoenix-az-burial-plot-c1ff3b-1" rel="noopener" target="_blank">Resthaven Park East</a> y <a href="https://www.gravesolutions.com/for-sale/east-resthaven-park-cemetery-phoenix-az-cemetery-plot-645266" rel="noopener" target="_blank">East Resthaven</a> (oct. 2026). El rango resume anuncios de particulares, no es una estadística del estado.',
    footEn:
      'Sources: ads on <a href="https://www.gravesolutions.com/for-sale/greenwood-memory-lawn-phoenix-az-cemetery-plot-fdd18f" rel="noopener" target="_blank">Grave Solutions (Greenwood)</a>, <a href="https://www.gravesolutions.com/for-sale/resthaven-park-cemetary-east-phoenix-az-burial-plot-c1ff3b-1" rel="noopener" target="_blank">Resthaven Park East</a>, and <a href="https://www.gravesolutions.com/for-sale/east-resthaven-park-cemetery-phoenix-az-cemetery-plot-645266" rel="noopener" target="_blank">East Resthaven</a> (Oct 2026). The range summarizes private ads; it is not a state statistic.',
  };
}

function plotPriceRangeTucson(nameEs, nameEn) {
  return {
    titleEs: `¿Cuánto cuesta un lote en el área de ${nameEs}?`,
    titleEn: `What does a burial plot cost in the ${nameEn} area?`,
    introEs:
      "Solo el <strong>espacio de la tumba en el cementerio</strong> (el lote), cuando un anuncio cita el precio de lista o el precio pedido. <strong>No</strong> incluye abrir/cerrar, bóveda, lápida ni funeral.",
    introEn:
      "Only the <strong>cemetery grave space</strong> (the plot), when an ad cites a list or asking price. <strong>Does not</strong> include opening/closing, a vault, a marker, or the funeral.",
    low: {
      amount: 2250,
      labelEs: "Reventa (dos espacios)",
      labelEn: "Resale (two spaces)",
      noteEs:
        "Anuncio en Grave Solutions por dos espacios en East Lawn Palms (Garden of David) por $4,500 en total.",
      noteEn:
        "Grave Solutions ad for two spaces at East Lawn Palms (Garden of David) for $4,500 total.",
    },
    mid: {
      amount: 5000,
      labelEs: "Rango típico (anuncios)",
      labelEn: "Typical range (ads)",
      noteEs:
        "Anuncios en Pima citan unos $2,250–$5,000 por espacio; el vendedor comparó con más de $10,000 en la lista de East Lawn Palms.",
      noteEn:
        "Pima County ads cite about $2,250 to $5,000 per space; one seller compared to more than $10,000 on East Lawn Palms’ list.",
    },
    high: {
      amount: 10000,
      labelEs: "Precio de lista citado",
      labelEn: "Cited list price",
      noteEs:
        "Un anuncio de reventa citó más de <strong>$10,000</strong> por espacio en East Lawn Palms (lista del cementerio, no verificada en la web).",
      noteEn:
        "One resale ad cited more than <strong>$10,000</strong> per space at East Lawn Palms (cemetery list, not verified online).",
    },
    footEs:
      'Fuentes: anuncios en <a href="https://www.gravesolutions.com/for-sale/east-lawn-tucson-az-cemetery-plot-a65eb7" rel="noopener" target="_blank">Grave Solutions (East Lawn Palms)</a> (oct. 2026); <a href="https://www.evergreen-tucson.com/" rel="noopener" target="_blank">Evergreen Mortuary &amp; Cemetery</a> (lista en la oficina).',
    footEn:
      'Sources: ads on <a href="https://www.gravesolutions.com/for-sale/east-lawn-tucson-az-cemetery-plot-a65eb7" rel="noopener" target="_blank">Grave Solutions (East Lawn Palms)</a> (Oct 2026); <a href="https://www.evergreen-tucson.com/" rel="noopener" target="_blank">Evergreen Mortuary &amp; Cemetery</a> (list at the office).',
  };
}

function plotPriceRangeMesa(nameEs, nameEn) {
  const base = plotPriceRangePhoenix(nameEs, nameEn);
  return {
    ...base,
    footEs:
      `${base.footEs} <a href="https://www.gravesolutions.com/for-sale/queen-of-heaven-catholic-cemetery-mesa-az-burial-plot-10828b" rel="noopener" target="_blank">Queen of Heaven (Mesa)</a> publica anuncios de paquetes prepagados completos, no solo el lote.`,
    footEn:
      `${base.footEn} <a href="https://www.gravesolutions.com/for-sale/queen-of-heaven-catholic-cemetery-mesa-az-burial-plot-10828b" rel="noopener" target="_blank">Queen of Heaven (Mesa)</a> ads show full pre-need packages, not plot-only pricing.`,
  };
}

function plotPriceRangeGlendale(nameEs, nameEn) {
  return {
    titleEs: `¿Cuánto cuesta un lote en el área de ${nameEs}?`,
    titleEn: `What does a burial plot cost in the ${nameEn} area?`,
    introEs:
      "Solo el <strong>espacio de la tumba</strong>, según anuncios de reventa en cementerios del oeste del valle. <strong>No</strong> incluye bóveda, lápida ni funeral.",
    introEn:
      "Only the <strong>grave space</strong>, from resale ads at west-valley cemeteries. <strong>Does not</strong> include a vault, marker, or funeral.",
    low: {
      amount: 3500,
      labelEs: "Reventa (West Resthaven)",
      labelEn: "Resale (West Resthaven)",
      noteEs: "Anuncio pidió $3,500 por espacio en West Resthaven (sección antigua).",
      noteEn: "Ad asked $3,500 per space at West Resthaven (older section).",
    },
    mid: {
      amount: 4000,
      labelEs: "Reventa (Resthaven Park West)",
      labelEn: "Resale (Resthaven Park West)",
      noteEs: "Anuncio citó $5,500 en la lista del cementerio y pidió $4,000.",
      noteEn: "Ad cited $5,500 on the cemetery list and asked $4,000.",
    },
    high: {
      amount: 5500,
      labelEs: "Lista citada en anuncio",
      labelEn: "List price cited in ad",
      noteEs: "Precio de lista citado en anuncio de Resthaven Park West antes de traspaso.",
      noteEn: "List price cited in a Resthaven Park West ad before transfer.",
    },
    footEs:
      'Fuentes: <a href="https://www.gravesolutions.com/for-sale/west-resthaven-cemetery-glendale-az-burial-plot-77722c" rel="noopener" target="_blank">West Resthaven</a> y <a href="https://www.gravesolutions.com/for-sale/resthaven-cemetery-park-west-glendale-az-cemetery-plot-db4fdb" rel="noopener" target="_blank">Resthaven Park West</a> en Grave Solutions (oct. 2026).',
    footEn:
      'Sources: <a href="https://www.gravesolutions.com/for-sale/west-resthaven-cemetery-glendale-az-burial-plot-77722c" rel="noopener" target="_blank">West Resthaven</a> and <a href="https://www.gravesolutions.com/for-sale/resthaven-cemetery-park-west-glendale-az-cemetery-plot-db4fdb" rel="noopener" target="_blank">Resthaven Park West</a> on Grave Solutions (Oct 2026).',
  };
}

function plotOfficeListHtml(offices, lang) {
  return offices.map((o) => {
    const phone = lang === "es" ? `Teléfono ${o.phone}` : `Phone ${o.phone}`;
    return `<strong>${o.name}</strong> — ${o.addr}. ${phone}.`;
  });
}

module.exports = {
  GRAVE_AZ,
  PHOENIX_PLOT_OFFICES,
  TUCSON_PLOT_OFFICES,
  MESA_PLOT_OFFICES,
  GLENDALE_PLOT_OFFICES,
  plotPriceRangePhoenix,
  plotPriceRangeTucson,
  plotPriceRangeMesa,
  plotPriceRangeGlendale,
  plotOfficeListHtml,
};
