/**
 * Florida burial-plot offices and Grave Solutions board helpers for city guides.
 * Resale asking prices are private ads — not cemetery list prices.
 */
const GRAVE_FL = "https://www.gravesolutions.com/for-sale/cemetery-properties/florida";

function plotOfficeListHtml(offices, lang) {
  return (offices || []).map((o) => {
    if (lang === "es") {
      return `${o.name}${o.city ? `, ${o.city}` : ""}${o.phone ? `. Tel. ${o.phone}` : ""}.${
        o.noteEs ? ` ${o.noteEs}` : ""
      }`;
    }
    return `${o.name}${o.city ? `, ${o.city}` : ""}${o.phone ? `. Phone ${o.phone}` : ""}.${
      o.noteEn ? ` ${o.noteEn}` : ""
    }`;
  });
}

/** @deprecated Prefer the low/mid/high chart helpers — plain text does not render the range chart. */
function plotPriceRange(cityEs, cityEn, low, high) {
  return {
    es: `En anuncios de reventa cerca de ${cityEs}, los pedidos recientes suelen caer entre <strong>$${Number(
      low
    ).toLocaleString("en-US")}</strong> y <strong>$${Number(high).toLocaleString(
      "en-US"
    )}</strong> por espacio (o por paquete de dos). Eso no es la lista del cementerio.`,
    en: `Near ${cityEn}, recent resale ads often ask between <strong>$${Number(
      low
    ).toLocaleString("en-US")}</strong> and <strong>$${Number(high).toLocaleString(
      "en-US"
    )}</strong> per space (or for a two-space package). That is not the cemetery’s price list.`,
  };
}

const PLOT_INTRO_ES =
  "Solo el <strong>espacio de la tumba en el cementerio</strong> (el lote), cuando un anuncio cita el precio de lista o el precio pedido. <strong>No</strong> incluye abrir/cerrar, bóveda, lápida ni funeral. No es un promedio oficial del condado.";
const PLOT_INTRO_EN =
  "Only the <strong>cemetery grave space</strong> (the plot), when an ad cites the cemetery’s list price or a resale asking price. <strong>Does not</strong> include opening/closing, a vault, a marker, or the funeral. Not an official county average.";

function plotChartShell(nameEs, nameEn, tiers, footEs, footEn) {
  return {
    titleEs: `¿Cuánto cuesta un lote en el área de ${nameEs}?`,
    titleEn: `What does a burial plot cost in the ${nameEn} area?`,
    introEs: PLOT_INTRO_ES,
    introEn: PLOT_INTRO_EN,
    ...tiers,
    footEs,
    footEn,
  };
}

/** Low / typical / high chart for Jacksonville (Grave Solutions ads, Oct 2026). */
function plotPriceRangeJacksonville(nameEs, nameEn) {
  return plotChartShell(
    nameEs,
    nameEn,
    {
      low: {
        amount: 2000,
        labelEs: "Reventa (anuncio citado)",
        labelEn: "Resale (cited ad)",
        noteEs:
          "Chapel Hill Memory Gardens (Sermon on the Mount): el vendedor pedía ~$2,000 por espacio y citó ~$5,995 en la lista del cementerio.",
        noteEn:
          "Chapel Hill Memory Gardens (Sermon on the Mount): the seller asked about $2,000 per space and cited about $5,995 on the cemetery list.",
      },
      mid: {
        amount: 5995,
        labelEs: "Lista del cementerio (citada en anuncios)",
        labelEn: "Cemetery list (cited in ads)",
        noteEs:
          "Varios anuncios de Chapel Hill citan unos $5,995 por espacio antes de bóveda y lápida. Arlington Memorial (Veterans Garden) pedía ~$4,000 por un espacio de doble profundidad con bóvedas.",
        noteEn:
          "Several Chapel Hill ads cite about $5,995 per space before vault and marker. Arlington Memorial (Veterans Garden) asked about $4,000 for a double-depth space with vaults.",
      },
      high: {
        amount: 8000,
        labelEs: "Lote histórico o dos espacios (anuncio)",
        labelEn: "Historic plot or two spaces (ad)",
        noteEs:
          "Hardage-Giddens Oaklawn (sección histórica): un espacio pedido ~$8,000. Greenlawn: dos espacios juntos ~$10,000. Paquetes con bóvedas o criptas de mausoleo pueden superar $15,000.",
        noteEn:
          "Hardage-Giddens Oaklawn (historic section): one space asking about $8,000. Greenlawn: two spaces together about $10,000. Packages with vaults or mausoleum crypts can exceed $15,000.",
      },
    },
    'Fuentes: anuncios en <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Jacksonville" rel="noopener" target="_blank">Grave Solutions (Jacksonville)</a> — Chapel Hill, Arlington Memorial, Oaklawn y Greenlawn (oct. 2026). El rango resume anuncios de particulares, no es una estadística del estado.',
    'Sources: ads on <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Jacksonville" rel="noopener" target="_blank">Grave Solutions (Jacksonville)</a> — Chapel Hill, Arlington Memorial, Oaklawn, and Greenlawn (Oct 2026). The range summarizes private ads; it is not a state statistic.'
  );
}

function plotPriceRangeMiami(nameEs, nameEn) {
  return plotChartShell(
    nameEs,
    nameEn,
    {
      low: {
        amount: 6000,
        labelEs: "Reventa (nicho o lote)",
        labelEn: "Resale (niche or plot)",
        noteEs:
          "Woodland Park South: nicho individual pedido ~$6,000. Caballero Rivero Dade: dos lotes juntos ~$6,500.",
        noteEn:
          "Woodland Park South: individual niche asking about $6,000. Caballero Rivero Dade: two plots together about $6,500.",
      },
      mid: {
        amount: 8500,
        labelEs: "Cripta doble profundidad (reventa)",
        labelEn: "Double-depth crypt (resale)",
        noteEs:
          "Woodland Park South: criptas de doble profundidad pedidas ~$8,500–$10,000. Un anuncio citó ~$18,000 en lista para propiedad similar.",
        noteEn:
          "Woodland Park South: double-depth crypts asking about $8,500–$10,000. One ad cited about $18,000 on the list for similar property.",
      },
      high: {
        amount: 16000,
        labelEs: "Cripto de mausoleo (anuncio)",
        labelEn: "Mausoleum crypt (ad)",
        noteEs:
          "Woodlawn West / South: cripta de mausoleo pedida ~$16,000. Woodlawn North: cripta individual ~$7,300.",
        noteEn:
          "Woodlawn West / South: mausoleum crypt asking about $16,000. Woodlawn North: single crypt about $7,300.",
      },
    },
    'Fuentes: anuncios en <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Miami" rel="noopener" target="_blank">Grave Solutions (Miami)</a> — Woodland Park South, Woodlawn West/North y Caballero Rivero Dade (oct. 2026).',
    'Sources: ads on <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Miami" rel="noopener" target="_blank">Grave Solutions (Miami)</a> — Woodland Park South, Woodlawn West/North, and Caballero Rivero Dade (Oct 2026).'
  );
}

function plotPriceRangeTampa(nameEs, nameEn) {
  return plotChartShell(
    nameEs,
    nameEn,
    {
      low: {
        amount: 3000,
        labelEs: "Reventa por espacio (Myrtle Hill)",
        labelEn: "Resale per space (Myrtle Hill)",
        noteEs:
          "Myrtle Hill Memorial Park: espacios lado a lado pedidos ~$3,000 cada uno. Hillsborough Memorial Gardens (Brandon): dos espacios juntos $3,700.",
        noteEn:
          "Myrtle Hill Memorial Park: side-by-side spaces asking about $3,000 each. Hillsborough Memorial Gardens (Brandon): two spaces together $3,700.",
      },
      mid: {
        amount: 8000,
        labelEs: "Lista citada (Hillsborough)",
        labelEn: "Cited list (Hillsborough)",
        noteEs:
          "Anuncios de Hillsborough Memorial Gardens citan ~$8,000 por espacio en la lista del cementerio antes de bóveda y lápida.",
        noteEn:
          "Hillsborough Memorial Gardens ads cite about $8,000 per space on the cemetery list before vault and marker.",
      },
      high: {
        amount: 15000,
        labelEs: "Dos espacios (Myrtle Hill)",
        labelEn: "Two spaces (Myrtle Hill)",
        noteEs:
          "Myrtle Hill: dos espacios juntos pedidos $15,000; el vendedor citó ~$18,000 cada uno en la lista del cementerio. Chimes Garden: ~$4,000–$5,000 por espacio con bóveda.",
        noteEn:
          "Myrtle Hill: two spaces together asking $15,000; the seller cited about $18,000 each on the cemetery list. Chimes Garden: about $4,000–$5,000 per space with vault.",
      },
    },
    'Fuentes: anuncios en <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Tampa" rel="noopener" target="_blank">Grave Solutions (Tampa)</a> y <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Brandon" rel="noopener" target="_blank">Brandon</a> — Myrtle Hill e Hillsborough Memorial Gardens (oct. 2026).',
    'Sources: ads on <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Tampa" rel="noopener" target="_blank">Grave Solutions (Tampa)</a> and <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Brandon" rel="noopener" target="_blank">Brandon</a> — Myrtle Hill and Hillsborough Memorial Gardens (Oct 2026).'
  );
}

function plotPriceRangeOrlando(nameEs, nameEn) {
  return plotChartShell(
    nameEs,
    nameEn,
    {
      low: {
        amount: 2400,
        labelEs: "Reventa por espacio (Chapel Hill)",
        labelEn: "Resale per space (Chapel Hill)",
        noteEs:
          "Chapel Hill Cemetery: dos espacios pedidos $4,800 (~$2,400 cada uno). Cinco espacios juntos ~$5,150 en Apostles Row.",
        noteEn:
          "Chapel Hill Cemetery: two spaces asking $4,800 (about $2,400 each). Five spaces together about $5,150 on Apostles Row.",
      },
      mid: {
        amount: 5500,
        labelEs: "Paquete de dos espacios (Highland)",
        labelEn: "Two-space package (Highland)",
        noteEs:
          "Highland Memory Gardens (Apopka): dos espacios (a veces con bóveda) pedidos ~$5,500. Woodlawn Memorial Park: un espacio ~$6,250.",
        noteEn:
          "Highland Memory Gardens (Apopka): two spaces (sometimes with a vault) asking about $5,500. Woodlawn Memorial Park: one space about $6,250.",
      },
      high: {
        amount: 12000,
        labelEs: "Dos lotes con bóvedas (Chapel Hill)",
        labelEn: "Two lots with vaults (Chapel Hill)",
        noteEs:
          "Chapel Hill Cemetery: dos lotes con bóvedas pedidos $12,000. Criptas de doble profundidad o mausoleo pueden pedir más.",
        noteEn:
          "Chapel Hill Cemetery: two lots with vaults asking $12,000. Double-depth crypts or mausoleum spaces can ask more.",
      },
    },
    'Fuentes: anuncios en <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Orlando" rel="noopener" target="_blank">Grave Solutions (Orlando)</a> y Apopka — Chapel Hill, Highland Memory Gardens y Woodlawn (oct. 2026).',
    'Sources: ads on <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Orlando" rel="noopener" target="_blank">Grave Solutions (Orlando)</a> and Apopka — Chapel Hill, Highland Memory Gardens, and Woodlawn (Oct 2026).'
  );
}

function plotPriceRangeStPetersburg(nameEs, nameEn) {
  return plotChartShell(
    nameEs,
    nameEn,
    {
      low: {
        amount: 2500,
        labelEs: "Reventa por espacio (Memorial Park)",
        labelEn: "Resale per space (Memorial Park)",
        noteEs:
          "Memorial Park (49th St N): dos espacios lado a lado pedidos $2,500 cada uno. Otro anuncio pedía $3,000 por dos espacios juntos.",
        noteEn:
          "Memorial Park (49th St N): two side-by-side spaces asking $2,500 each. Another ad asked $3,000 for two spaces together.",
      },
      mid: {
        amount: 3000,
        labelEs: "Paquete con bóvedas (Royal Palm)",
        labelEn: "Package with vaults (Royal Palm)",
        noteEs:
          "Royal Palm North: dos espacios de doble profundidad con bóvedas pedidos $3,000 el paquete.",
        noteEn:
          "Royal Palm North: two double-depth spaces with vaults asking $3,000 for the package.",
      },
      high: {
        amount: 8000,
        labelEs: "Cripto de mausoleo (anuncio)",
        labelEn: "Mausoleum crypt (ad)",
        noteEs:
          "Royal Palm North: cripta de mausoleo (interior, planta baja) pedida ~$8,000. Estate familiar en Memorial Park ~$12,000.",
        noteEn:
          "Royal Palm North: interior ground-level mausoleum crypt asking about $8,000. Memorial Park family estate about $12,000.",
      },
    },
    'Fuentes: anuncios en <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=St.+Petersburg" rel="noopener" target="_blank">Grave Solutions (St. Petersburg)</a> — Memorial Park y Royal Palm North (oct. 2026).',
    'Sources: ads on <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=St.+Petersburg" rel="noopener" target="_blank">Grave Solutions (St. Petersburg)</a> — Memorial Park and Royal Palm North (Oct 2026).'
  );
}

function plotPriceRangeFortLauderdale(nameEs, nameEn) {
  return plotChartShell(
    nameEs,
    nameEn,
    {
      low: {
        amount: 3000,
        labelEs: "Reventa por espacio",
        labelEn: "Resale per space",
        noteEs:
          "Sunset Memorial Gardens: un espacio pedido ~$3,000. Lauderdale Memorial Park: espacios pedidos ~$4,000 cada uno.",
        noteEn:
          "Sunset Memorial Gardens: one space asking about $3,000. Lauderdale Memorial Park: spaces asking about $4,000 each.",
      },
      mid: {
        amount: 8745,
        labelEs: "Lista citada (Evergreen / borde)",
        labelEn: "Cited list (Evergreen / edge)",
        noteEs:
          "Un anuncio de Evergreen citó ~$8,745 por espacio nuevo en el borde. Forest Lawn: cripta de mausoleo ~$9,900.",
        noteEn:
          "An Evergreen ad cited about $8,745 per new edge space. Forest Lawn: mausoleum crypt about $9,900.",
      },
      high: {
        amount: 16000,
        labelEs: "Dos espacios interiores (anuncio)",
        labelEn: "Two interior spaces (ad)",
        noteEs:
          "Evergreen / Lauderdale Memorial: dos espacios interiores pedidos $16,000. Tres espacios históricos en Evergreen ~$12,000 el paquete.",
        noteEn:
          "Evergreen / Lauderdale Memorial: two interior spaces asking $16,000. Three historic Evergreen spaces about $12,000 for the package.",
      },
    },
    'Fuentes: anuncios en <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Fort+Lauderdale" rel="noopener" target="_blank">Grave Solutions (Fort Lauderdale)</a> — Evergreen, Lauderdale Memorial, Sunset y Forest Lawn (oct. 2026).',
    'Sources: ads on <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Fort+Lauderdale" rel="noopener" target="_blank">Grave Solutions (Fort Lauderdale)</a> — Evergreen, Lauderdale Memorial, Sunset, and Forest Lawn (Oct 2026).'
  );
}

function plotPriceRangeTallahassee(nameEs, nameEn) {
  return plotChartShell(
    nameEs,
    nameEn,
    {
      low: {
        amount: 1200,
        labelEs: "Reventa (Tallahassee Memory Gardens)",
        labelEn: "Resale (Tallahassee Memory Gardens)",
        noteEs:
          "Tallahassee Memory Gardens (Garden of Devotion): ~$1,200 por espacio / $2,400 el par.",
        noteEn:
          "Tallahassee Memory Gardens (Garden of Devotion): about $1,200 per space / $2,400 for the pair.",
      },
      mid: {
        amount: 5995,
        labelEs: "Reventa / lista citada (MeadowWood)",
        labelEn: "Resale / cited list (MeadowWood)",
        noteEs:
          "MeadowWood Memorial Park: espacios pedidos ~$5,995 cada uno; anuncios citan ~$6,995–$7,000 en lista. Paquete de dos con bóvedas ~$8,500–$10,000.",
        noteEn:
          "MeadowWood Memorial Park: spaces asking about $5,995 each; ads cite about $6,995–$7,000 on the list. Two-space packages with vaults about $8,500–$10,000.",
      },
      high: {
        amount: 16000,
        labelEs: "Paquete completo (dos espacios)",
        labelEn: "Full package (two spaces)",
        noteEs:
          "MeadowWood: dos espacios con bóvedas, abrir/cerrar y memoriales pedidos $16,000; el vendedor citó ~$22,650 en lista del cementerio.",
        noteEn:
          "MeadowWood: two spaces with vaults, opening/closing, and memorials asking $16,000; the seller cited about $22,650 on the cemetery list.",
      },
    },
    'Fuentes: anuncios en <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Tallahassee" rel="noopener" target="_blank">Grave Solutions (Tallahassee)</a> — MeadowWood Memorial Park y Tallahassee Memory Gardens (oct. 2026).',
    'Sources: ads on <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=Tallahassee" rel="noopener" target="_blank">Grave Solutions (Tallahassee)</a> — MeadowWood Memorial Park and Tallahassee Memory Gardens (Oct 2026).'
  );
}

function plotPriceRangeWestPalmBeach(nameEs, nameEn) {
  return plotChartShell(
    nameEs,
    nameEn,
    {
      low: {
        amount: 1500,
        labelEs: "Reventa por espacio (Hillcrest)",
        labelEn: "Resale per space (Hillcrest)",
        noteEs:
          "Hillcrest Memorial Park: lotes contiguos pedidos ~$1,500 cada uno. Sección judía: un espacio ~$3,500.",
        noteEn:
          "Hillcrest Memorial Park: adjoining lots asking about $1,500 each. Jewish section: one space about $3,500.",
      },
      mid: {
        amount: 5410,
        labelEs: "Lista citada (Hillcrest)",
        labelEn: "Cited list (Hillcrest)",
        noteEs:
          "Un anuncio de tres espacios citó ~$5,410 cada uno en la lista de Hillcrest; el vendedor pedía $4,500 (negociable) por espacio.",
        noteEn:
          "A three-space ad cited about $5,410 each on Hillcrest’s list; the seller asked $4,500 (negotiable) per space.",
      },
      high: {
        amount: 7000,
        labelEs: "Dos espacios juntos (anuncio)",
        labelEn: "Two spaces together (ad)",
        noteEs:
          "Hillcrest: dos espacios lado a lado pedidos $7,000 el par. Memory Gardens (Christus Abbey): dos espacios ~$3,500 el par.",
        noteEn:
          "Hillcrest: two side-by-side spaces asking $7,000 for the pair. Memory Gardens (Christus Abbey): two spaces about $3,500 for the pair.",
      },
    },
    'Fuentes: anuncios en <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=West+Palm+Beach" rel="noopener" target="_blank">Grave Solutions (West Palm Beach)</a> — Hillcrest Memorial Park y Memory Gardens (oct. 2026).',
    'Sources: ads on <a href="https://www.gravesolutions.com/search?SiteState=FL&amp;SiteCity=West+Palm+Beach" rel="noopener" target="_blank">Grave Solutions (West Palm Beach)</a> — Hillcrest Memorial Park and Memory Gardens (Oct 2026).'
  );
}

const JACKSONVILLE_PLOT_OFFICES = [
  {
    name: "Arlington Memorial Park",
    addr: "6821 Lone Star Rd, Jacksonville, FL 32211",
    phone: "(904) 724-6384",
    href: "https://www.gravesolutions.com/search?SiteState=FL&SiteCity=Jacksonville",
    noteEs: "Reventa vista oct. 2026: espacio doble profundidad con bóvedas, pedido ~$4,000.",
    noteEn: "Resale seen Oct 2026: double-depth space with vaults, asking about $4,000.",
  },
  {
    name: "Chapel Hill Memory Gardens",
    addr: "850 St Johns Bluff Rd N, Jacksonville, FL 32225",
    phone: "(904) 641-9755",
    href: "https://www.dignitymemorial.com/funeral-homes/jacksonville-fl/hardage-giddens-chapel-hills-funeral-home/4053",
    noteEs: "Anuncios citaron lista del cementerio ~$5,995 por espacio; reventa ~$2,000 cada uno.",
    noteEn: "Ads cited cemetery list about $5,995 per space; resale about $2,000 each.",
  },
  {
    name: "Hardage-Giddens Oaklawn Cemetery",
    addr: "4801 San Jose Blvd, Jacksonville, FL 32207",
    phone: "(904) 737-7171",
    href: "https://www.dignitymemorial.com/funeral-homes/florida/jacksonville/hardage-giddens-oaklawn-chapel/2341",
    noteEs: "Reventa oct. 2026: espacio en sección histórica pedido ~$8,000; criptas de mausoleo más altas.",
    noteEn: "Resale Oct 2026: historic-section space asking about $8,000; mausoleum crypts higher.",
  },
  {
    name: "Greenlawn Cemetery",
    addr: "4300 Beach Blvd, Jacksonville, FL 32207",
    phone: "(904) 396-2522",
    href: "https://www.dignitymemorial.com/funeral-homes/florida/jacksonville/hardage-giddens-greenlawn-funeral-home-and-cemetery/2343",
    noteEs: "Reventa oct. 2026: dos espacios juntos pedidos ~$10,000.",
    noteEn: "Resale Oct 2026: two spaces together asking about $10,000.",
  },
];

const MIAMI_PLOT_OFFICES = [
  {
    name: "Caballero Rivero Woodland Park South",
    addr: "11655 SW 117th Ave, Miami, FL 33186",
    city: "Miami",
    phone: "",
    noteEs: "Reventa oct. 2026: criptas de doble profundidad pedidas ~$8,500–$10,000; nicho ~$6,000.",
    noteEn: "Resale Oct 2026: double-depth crypts asking about $8,500–$10,000; niche about $6,000.",
  },
  {
    name: "Caballero Rivero Woodlawn West",
    addr: "11655 SW 117th Ave, Miami, FL 33186",
    city: "Miami",
    phone: "",
    noteEs: "Reventa: cripta de mausoleo pedida ~$16,000.",
    noteEn: "Resale: mausoleum crypt asking about $16,000.",
  },
  {
    name: "Caballero Rivero Dade (Dade Memorial Park)",
    addr: "1301 Opa Locka Blvd, Miami, FL 33167",
    city: "Miami",
    phone: "",
    noteEs: "Reventa: dos lotes juntos ~$6,500; cripta doble profundidad ~$8,200 (lista citada ~$18,000).",
    noteEn: "Resale: two plots together about $6,500; double-depth crypt about $8,200 (cited list about $18,000).",
  },
];

const TAMPA_PLOT_OFFICES = [
  {
    name: "Hillsborough Memorial Gardens",
    addr: "2323 W Brandon Blvd, Brandon, FL 33511",
    city: "Brandon (área Tampa)",
    phone: "",
    noteEs: "Reventa oct. 2026: dos espacios pedidos $3,700; el anuncio citó ~$8,000 por espacio en lista.",
    noteEn: "Resale Oct 2026: two spaces asking $3,700; the ad cited about $8,000 per space on the list.",
  },
  {
    name: "Myrtle Hill Memorial Park",
    addr: "4202 E Lake Ave, Tampa, FL 33610",
    city: "Tampa",
    phone: "(800) 343-4464",
    noteEs: "Reventa: ~$3,000 por espacio; dos espacios juntos hasta ~$15,000 (lista citada ~$18,000 cada uno).",
    noteEn: "Resale: about $3,000 per space; two spaces together up to about $15,000 (cited list about $18,000 each).",
  },
];

const ORLANDO_PLOT_OFFICES = [
  {
    name: "Chapel Hill Cemetery",
    addr: "2400 Harrell Rd, Orlando, FL 32817",
    city: "Orlando",
    phone: "",
    noteEs: "Reventa oct. 2026: dos lotes con bóvedas pedidos $12,000; pares sin bóveda desde ~$4,800.",
    noteEn: "Resale Oct 2026: two lots with vaults asking $12,000; pairs without vaults from about $4,800.",
  },
  {
    name: "Woodlawn Memorial Park",
    addr: "400 Woodlawn Cemetery Rd, Orlando, FL 34734",
    city: "Orlando",
    phone: "",
    noteEs: "Reventa: un espacio pedido ~$6,250.",
    noteEn: "Resale: one space asking about $6,250.",
  },
  {
    name: "Highland Memory Gardens",
    addr: "3329 E Semoran Blvd, Apopka, FL 32703",
    city: "Apopka / Forest City",
    phone: "",
    noteEs: "Paquetes de dos espacios (a veces con bóveda) pedidos ~$5,500.",
    noteEn: "Two-space packages (sometimes with a vault) asking about $5,500.",
  },
];

const ST_PETE_PLOT_OFFICES = [
  {
    name: "Memorial Park",
    addr: "5750 49th St N, St. Petersburg, FL 33709",
    city: "St. Petersburg",
    phone: "",
    noteEs: "Reventa oct. 2026: dos espacios pedidos $2,500 cada uno.",
    noteEn: "Resale Oct 2026: two spaces asking $2,500 each.",
  },
  {
    name: "Royal Palm North Cemetery",
    addr: "2600 Gandy Blvd, St. Petersburg, FL 33702",
    city: "St. Petersburg",
    phone: "",
    noteEs: "Reventa: paquete de dos espacios con bóvedas ~$3,000; cripta de mausoleo ~$8,000.",
    noteEn: "Resale: two-space package with vaults about $3,000; mausoleum crypt about $8,000.",
  },
];

const FORT_LAUDERDALE_PLOT_OFFICES = [
  {
    name: "Evergreen Cemetery",
    addr: "1300 SE 10th Ave, Fort Lauderdale, FL 33316",
    city: "Fort Lauderdale",
    phone: "",
    noteEs: "Reventa oct. 2026: dos espacios interiores pedidos $16,000; anuncio citó ~$8,745 por espacio nuevo en el borde.",
    noteEn: "Resale Oct 2026: two interior spaces asking $16,000; ad cited about $8,745 per new edge space.",
  },
  {
    name: "Lauderdale Memorial Park",
    addr: "2001 SW 4th Ave, Fort Lauderdale, FL 33315",
    city: "Fort Lauderdale",
    phone: "",
    noteEs: "Reventa: espacios pedidos ~$4,000 cada uno.",
    noteEn: "Resale: spaces asking about $4,000 each.",
  },
  {
    name: "Forest Lawn Memorial Gardens",
    addr: "2401 SW 64th Ave, Fort Lauderdale, FL 33317",
    city: "Fort Lauderdale",
    phone: "",
    noteEs: "Reventa: cripta en Pyramid Mausoleum pedida ~$9,900.",
    noteEn: "Resale: Pyramid Mausoleum crypt asking about $9,900.",
  },
];

const TALLAHASSEE_PLOT_OFFICES = [
  {
    name: "MeadowWood Memorial Park (Culley’s)",
    addr: "700 Timberlane Rd, Tallahassee, FL 32312",
    city: "Tallahassee",
    phone: "(850) 877-8191",
    noteEs: "Reventa oct. 2026: ~$5,995 por espacio (lista citada ~$6,995); paquetes con bóvedas hasta ~$16,000.",
    noteEn: "Resale Oct 2026: about $5,995 per space (cited list about $6,995); packages with vaults up to about $16,000.",
  },
  {
    name: "Tallahassee Memory Gardens",
    addr: "Tallahassee, FL",
    city: "Tallahassee",
    phone: "",
    noteEs: "Reventa: Garden of Devotion ~$1,200 por espacio / $2,400 el par.",
    noteEn: "Resale: Garden of Devotion about $1,200 per space / $2,400 for the pair.",
  },
];

const WEST_PALM_PLOT_OFFICES = [
  {
    name: "Hillcrest Memorial Park",
    addr: "6411 Parker Ave, West Palm Beach, FL 33405",
    city: "West Palm Beach",
    phone: "(561) 833-4061",
    noteEs: "Reventa oct. 2026: desde ~$1,500 por espacio; anuncios citan ~$5,410 en lista. Dos espacios juntos ~$7,000.",
    noteEn: "Resale Oct 2026: from about $1,500 per space; ads cite about $5,410 on the list. Two spaces together about $7,000.",
  },
  {
    name: "Memory Gardens",
    addr: "10th Ave N, West Palm Beach, FL 33460",
    city: "West Palm Beach",
    phone: "",
    noteEs: "Reventa: dos espacios (Christus Abbey) pedidos ~$3,500 el par.",
    noteEn: "Resale: two spaces (Christus Abbey) asking about $3,500 for the pair.",
  },
];

module.exports = {
  GRAVE_FL,
  plotOfficeListHtml,
  plotPriceRange,
  plotPriceRangeJacksonville,
  plotPriceRangeMiami,
  plotPriceRangeTampa,
  plotPriceRangeOrlando,
  plotPriceRangeStPetersburg,
  plotPriceRangeFortLauderdale,
  plotPriceRangeTallahassee,
  plotPriceRangeWestPalmBeach,
  JACKSONVILLE_PLOT_OFFICES,
  MIAMI_PLOT_OFFICES,
  TAMPA_PLOT_OFFICES,
  ORLANDO_PLOT_OFFICES,
  ST_PETE_PLOT_OFFICES,
  FORT_LAUDERDALE_PLOT_OFFICES,
  TALLAHASSEE_PLOT_OFFICES,
  WEST_PALM_PLOT_OFFICES,
};
