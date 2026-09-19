const { makeCity, cell, valleyNear, renoNear } = require("./nv-factory");

const GRAVE_NV = "https://www.gravesolutions.com/for-sale/cemetery-properties/nevada";

const NO_GPL_LEAD_ES =
  "Estas funerarias no publican una lista general de precios completa (cremación directa, entierro inmediato, memorial y funeral tradicional) en internet. Llame y pida la lista general de precios vigente.";
const NO_GPL_LEAD_EN =
  "These funeral homes do not publish a complete general price list online (direct cremation, immediate burial, memorial, and traditional funeral). Call and ask for the current general price list.";
const NO_GPL_SAME_ES =
  "Ninguna funeraria de esta ciudad publica en internet los cuatro paquetes. El promedio de entierro completo de Nevada (<strong>$8,538</strong>) suele incluir ataúd; el de una casa concreta puede no incluirlo. Pida la lista vigente.";
const NO_GPL_SAME_EN =
  "No funeral home in this city publishes all four packages online. Nevada’s full-burial average (<strong>$8,538</strong>) usually includes a casket; a named home’s package may not. Ask for the current list.";

function tributeCrem(amt) {
  return cell(
    amt,
    "Paquete Tribute de cremación: reunión sencilla, urna y contenedor Trayview. Sin velatorio con cuerpo.",
    "Tribute cremation package: simple gathering, urn, and Trayview container. No body present."
  );
}

function waltonHome({ id, name, href, addr }) {
  return {
    id,
    name,
    href,
    addr,
    dc: 1695,
    ib: 2995,
    trad: 6915,
    dcEs: "Cremación directa, contenedor del comprador (GPL 26 feb. 2026).",
    dcEn: "Direct cremation, purchaser container (GPL 26 Feb 2026).",
    ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
    ibEn: "Immediate burial, purchaser casket. Plot extra.",
    memCell: cell(
      3480,
      "Paquete Walton Memorial Service & Celebration of Life. Crematorio incluido. Urna aparte.",
      "Walton Memorial Service & Celebration of Life package. Crematory included. Urn extra."
    ),
    trCell: cell(
      6915,
      "Paquete Walton Traditional Funeral Service: velatorio y ceremonia. Ataúd y lote aparte.",
      "Walton Traditional Funeral Service package: visitation and ceremony. Casket and plot extra."
    ),
  };
}

function estimatorCity(spec) {
  return makeCity({
    unpublishedLeadEs: NO_GPL_LEAD_ES,
    unpublishedLeadEn: NO_GPL_LEAD_EN,
    analysisSameEs: NO_GPL_SAME_ES,
    analysisSameEn: NO_GPL_SAME_EN,
    analysisPlotEs:
      spec.analysisPlotEs ||
      "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Eso se pide en la oficina.",
    analysisPlotEn:
      spec.analysisPlotEn ||
      "None of the figures in the table are cemetery property or opening/closing. Ask the cemetery office.",
    resaleHref: GRAVE_NV,
    homes: [],
    ...spec,
  });
}

const lasVegas = makeCity({
  slug: "las-vegas",
  nameEs: "Las Vegas",
  nameEn: "Las Vegas",
  heroW: 1350,
  heroH: 900,
  nearbyGuides: valleyNear("las-vegas"),
  countyEs: "condado Clark",
  countyEn: "Clark County",
  metroEs: [
    "Las Vegas",
    "North Las Vegas",
    "Sunrise Manor",
    "Paradise",
    "Spring Valley",
    "Summerlin",
    "Enterprise",
  ],
  metroEn: [
    "Las Vegas",
    "North Las Vegas",
    "Sunrise Manor",
    "Paradise",
    "Spring Valley",
    "Summerlin",
    "Enterprise",
  ],
  metroTitleEs: "Área que atendemos en Las Vegas",
  metroTitleEn: "Las Vegas area we serve",
  prepaidCemEs: "Palm Eastern, Palm Downtown",
  prepaidCemEn: "Palm Eastern, Palm Downtown",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Palm Eastern (702-464-8500) o en Palm Downtown (702-464-8300). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Palm Eastern (702-464-8500) or Palm Downtown (702-464-8300) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Bunker's Eden Vale: GPL y paquetes, 2 feb. 2026 (cremación directa $2,365 y entierro inmediato $4,140, contenedor o ataúd del comprador). Memorial Basic Cremation $5,535 (incluye urna hasta $395). Funeral Simple Burial $9,900 (incluye ataúd sugerido). Palm Southwest: GPL y paquetes Dignity, 5 ago. 2026. Estimador: promedios Funeralocity de Nevada. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Bunker's Eden Vale: GPL and packages, 2 Feb 2026 (direct cremation $2,365 and immediate burial $4,140, purchaser container or casket). Basic Cremation memorial $5,535 (urn allowance up to $395). Simple Burial funeral $9,900 (suggested casket included). Palm Southwest: Dignity GPL and package list, 5 Aug 2026. Estimator: Nevada Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Palm Eastern y Palm Downtown venden lotes. Ninguno publica el precio de partida en la web. Llame y pida la lista actual por escrito.",
  officesNoteEn:
    "Palm Eastern and Palm Downtown sell plots. Neither publishes a starting plot price online. Call and ask for the current list in writing.",
  newListEs:
    "Estos cementerios de Las Vegas no publican un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 702-464-8500.",
  newListEn:
    "These Las Vegas cemeteries do not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 702-464-8500.",
  officesEs: [
    "<strong>Palm Eastern Mortuary &amp; Cemetery</strong> — 7600 S Eastern Ave. Teléfono 702-464-8500.",
    "<strong>Palm Downtown Mortuary</strong> — 1325 N Main St. Teléfono 702-464-8300.",
  ],
  officesEn: [
    "<strong>Palm Eastern Mortuary &amp; Cemetery</strong> — 7600 S Eastern Ave. Phone 702-464-8500.",
    "<strong>Palm Downtown Mortuary</strong> — 1325 N Main St. Phone 702-464-8300.",
  ],
  analysisSameEs:
    "Bunker's publica cremación directa (<strong>$2,365</strong>) y entierro inmediato (<strong>$4,140</strong>) con contenedor o ataúd del comprador. Su memorial Basic Cremation (<strong>$5,535</strong>) ya mete servicio memorial, contenedor Novato y urna hasta $395. Su funeral Simple Burial (<strong>$9,900</strong>) ya mete velatorio, ceremonia y ataúd sugerido. Palm Southwest publica cifras distintas: cremación directa <strong>$2,875</strong> y funeral Tribute <strong>$16,360</strong> con ataúd recomendado. El promedio de entierro completo de Nevada (<strong>$8,538</strong>) suele incluir ataúd; no es el paquete de una casa.",
  analysisSameEn:
    "Bunker's publishes direct cremation (<strong>$2,365</strong>) and immediate burial (<strong>$4,140</strong>) with a purchaser container or casket. Its Basic Cremation memorial (<strong>$5,535</strong>) already puts in a memorial service, a Novato container, and an urn allowance up to $395. Its Simple Burial funeral (<strong>$9,900</strong>) already puts in visitation, the ceremony, and a suggested casket. Palm Southwest publishes different figures: direct cremation <strong>$2,875</strong> and a Tribute funeral <strong>$16,360</strong> with a recommended casket. Nevada’s full-burial average (<strong>$8,538</strong>) usually includes a casket; it is not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Palm Eastern llame al <strong>702-464-8500</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Palm Eastern call <strong>702-464-8500</strong>.",
  resaleHref: GRAVE_NV,
  plotNew: 5500,
  plotResale: 3800,
  unpublishedLeadEs: NO_GPL_LEAD_ES,
  unpublishedLeadEn: NO_GPL_LEAD_EN,
  unpublishedHomes: [
    {
      name: "Palm Eastern Mortuary",
      href: "https://www.dignitymemorial.com/funeral-homes/nevada/las-vegas/palm-eastern-mortuary/1009",
      addr: "7600 S Eastern Ave",
      phone: "702-464-8500",
    },
    {
      name: "Palm Northwest Mortuary",
      href: "https://www.dignitymemorial.com/funeral-homes/nevada/las-vegas/palm-northwest-mortuary/1011",
      addr: "6701 N Jones Blvd",
      phone: "702-464-8460",
    },
    {
      name: "Palm Downtown Mortuary",
      href: "https://www.dignitymemorial.com/funeral-homes/nevada/las-vegas/palm-downtown-mortuary",
      addr: "1325 N Main St",
      phone: "702-464-8300",
    },
    {
      name: "Palm South Jones Mortuary",
      href: "https://www.dignitymemorial.com/funeral-homes/nevada/las-vegas/palm-south-jones-mortuary/1012",
      addr: "1600 S Jones Blvd",
      phone: "702-464-8420",
    },
    {
      name: "Palm Cheyenne Mortuary",
      href: "https://www.dignitymemorial.com/funeral-homes/nevada/las-vegas/palm-cheyenne-mortuary",
      addr: "7400 W Cheyenne Ave",
      phone: "702-464-8480",
    },
  ],
  homes: [
    {
      id: "bunkers",
      name: "Bunker's Eden Vale",
      href: "https://www.bunkerslv.com/general-price-list",
      addr: "925 Las Vegas Blvd N · 702-385-1441",
      dc: 2365,
      ib: 4140,
      trad: 9900,
      casketTrad: true,
      dcEs: "Cremación directa, contenedor del comprador (GPL 2 feb. 2026). Crematorio incluido.",
      dcEn: "Direct cremation, purchaser container (GPL 2 Feb 2026). Crematory included.",
      ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
      ibEn: "Immediate burial, purchaser casket. Plot extra.",
      memCell: cell(
        5535,
        "Paquete Basic Cremation: memorial, contenedor Novato y urna hasta $395. Sin velatorio con cuerpo.",
        "Basic Cremation package: memorial, Novato container, and urn allowance up to $395. No body present."
      ),
      trCell: cell(
        9900,
        "Paquete Simple Burial: velatorio y ceremonia. Incluye ataúd sugerido. Lote aparte.",
        "Simple Burial package: visitation and ceremony. Includes a suggested casket. Plot extra."
      ),
    },
    {
      id: "palmsw",
      name: "Palm Southwest",
      href: "https://www.dignitymemorial.com/funeral-homes/nevada/las-vegas/palm-southwest-mortuary/5260/funeral-price-list",
      addr: "7979 W Warm Springs Rd · 702-260-0770",
      dc: 2875,
      ib: 4970,
      trad: 16360,
      casketTrad: true,
      dcEs: "Cremación directa, contenedor del comprador (GPL 5 ago. 2026).",
      dcEn: "Direct cremation, purchaser container (GPL 5 Aug 2026).",
      ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
      ibEn: "Immediate burial, purchaser casket. Plot extra.",
      memCell: tributeCrem(5260),
      trCell: cell(
        16360,
        "Paquete Tribute de funeral con velatorio. Incluye ataúd recomendado. Sin bóveda. Lote aparte.",
        "Tribute funeral package with visitation. Includes a recommended casket. No vault. Plot extra."
      ),
    },
  ],
});

const henderson = estimatorCity({
  slug: "henderson",
  nameEs: "Henderson",
  nameEn: "Henderson",
  heroW: 1200,
  heroH: 900,
  nearbyGuides: valleyNear("henderson"),
  countyEs: "condado Clark",
  countyEn: "Clark County",
  metroEs: ["Henderson", "Boulder City", "Whitney"],
  metroEn: ["Henderson", "Boulder City", "Whitney"],
  metroTitleEs: "Área que atendemos en Henderson",
  metroTitleEn: "Henderson area we serve",
  prepaidCemEs: "Palm Boulder Highway",
  prepaidCemEn: "Palm Boulder Highway",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Palm Boulder Highway publica césped y jardines desde $5,495. Pida la lista vigente al 702-464-8440. También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Palm Boulder Highway publishes lawn and garden spaces from $5,495. Ask for the current list at 702-464-8440. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Palm Boulder Highway publica en Dignity precios de partida de salón, lote, catering, urnas y ataúdes; no abre en internet la lista general con los cuatro paquetes. Estimador: promedios Funeralocity de Nevada. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Palm Boulder Highway’s Dignity page posts starting prices for venues, plots, catering, urns, and caskets; it does not open a general price list with the four packages. Estimator: Nevada Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Palm Boulder Highway vende lotes. En su página Dignity, césped y jardines parten de <strong>$5,495</strong> (18 sep. 2026). Mausoleo desde $7,995. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista actual por escrito.",
  officesNoteEn:
    "Palm Boulder Highway sells plots. Its Dignity page lists lawn and garden spaces from <strong>$5,495</strong> (18 Sep 2026). Mausoleums from $7,995. Opening and closing, the vault, and the marker are still extra. Ask for the current list in writing.",
  newListEs:
    "Palm Boulder Highway publica en Dignity un precio de partida del lote de <strong>$5,495</strong> (césped y jardines; 18 sep. 2026). Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 702-464-8440.",
  newListEn:
    "Palm Boulder Highway’s Dignity page lists a starting plot price of <strong>$5,495</strong> (lawn and garden spaces; 18 Sep 2026). Opening and closing, the vault, and the marker are still extra. Ask for the list: 702-464-8440.",
  officesEs: [
    "<strong>Palm Boulder Highway Mortuary &amp; Cemetery</strong> — 800 S Boulder Hwy. Teléfono 702-464-8440. Césped y jardines desde $5,495.",
  ],
  officesEn: [
    "<strong>Palm Boulder Highway Mortuary &amp; Cemetery</strong> — 800 S Boulder Hwy. Phone 702-464-8440. Lawn and garden spaces from $5,495.",
  ],
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio. En Palm Boulder Highway el césped y jardines parten de <strong>$5,495</strong>. Llame al <strong>702-464-8440</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property. At Palm Boulder Highway, lawn and garden spaces start at <strong>$5,495</strong>. Call <strong>702-464-8440</strong>.",
  analysisCheapEs:
    "Palm Boulder Highway publica en Dignity salón, lote, catering, urnas y ataúdes, pero no abre los cuatro paquetes de la tabla. El estimador usa <strong>$1,467</strong> como promedio de Nevada para cremación directa. Ese número no es el precio de esa casa. Pida la lista vigente por teléfono. Urna, flores y certificados van aparte.",
  analysisCheapEn:
    "Palm Boulder Highway’s Dignity page posts venues, plots, catering, urns, and caskets, but it does not open the four packages on this chart. The estimator uses <strong>$1,467</strong> as the Nevada average for direct cremation. That figure is not that home’s price. Ask for the current list by phone. Urn, flowers, and death certificates are extra.",
  plotNew: 5495,
  plotResale: 3800,
  unpublishedLeadEs:
    "Palm Boulder Highway publica en Dignity salón desde $895, lote desde $5,495, catering desde $895, urnas desde $295 y ataúdes desde $1,995. No abre en internet la lista general con cremación directa, entierro inmediato, memorial y funeral tradicional. Llame y pida esa lista vigente.",
  unpublishedLeadEn:
    "Palm Boulder Highway’s Dignity page posts venues from $895, plots from $5,495, catering from $895, urns from $295, and caskets from $1,995. It does not open a general price list with direct cremation, immediate burial, memorial, and traditional funeral. Call and ask for that current list.",
  unpublishedHomes: [
    {
      name: "Palm Boulder Highway Mortuary",
      href: "https://www.dignitymemorial.com/funeral-homes/nevada/henderson/palm-boulder-highway-mortuary/1010",
      addr: "800 S Boulder Hwy",
      phone: "702-464-8440",
    },
  ],
});

const reno = makeCity({
  slug: "reno",
  nameEs: "Reno",
  nameEn: "Reno",
  heroW: 1200,
  heroH: 900,
  nearbyGuides: renoNear("reno"),
  countyEs: "condado Washoe",
  countyEn: "Washoe County",
  metroEs: ["Reno", "Verdi"],
  metroEn: ["Reno", "Verdi"],
  metroTitleEs: "Área que atendemos en Reno",
  metroTitleEn: "Reno area we serve",
  prepaidCemEs: "Mountain View Cemetery",
  prepaidCemEn: "Mountain View Cemetery",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Mountain View Cemetery (775-329-9231). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Mountain View Cemetery (775-329-9231) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Mountain View Mortuary: GPL 16 sep. 2026 (cremación directa $1,455 y entierro inmediato $2,695, contenedor o ataúd del comprador; el crematorio figura aparte a $350). No publica paquetes de memorial ni funeral tradicional. Walton’s Sierra Chapel, O’Brien Rogers &amp; Crosby y Ross, Burke &amp; Knobel: GPL de 6 páginas, 26 feb. 2026 (cremación directa $1,695 y entierro inmediato $2,995). Paquetes Walton: memorial $3,480 y funeral tradicional $6,915, sin urna ni ataúd. Estimador: promedios Funeralocity de Nevada. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Mountain View Mortuary: GPL 16 Sep 2026 (direct cremation $1,455 and immediate burial $2,695, purchaser container or casket; crematory listed separately at $350). It does not publish memorial or traditional packages. Walton’s Sierra Chapel, O’Brien Rogers &amp; Crosby, and Ross, Burke &amp; Knobel: 6-page GPL, 26 Feb 2026 (direct cremation $1,695 and immediate burial $2,995). Walton packages: memorial $3,480 and traditional funeral $6,915, with no urn or casket. Estimator: Nevada Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Mountain View vende lotes. No publica el precio de partida en la web. Llame y pida la lista por escrito.",
  officesNoteEn:
    "Mountain View sells plots. It does not post a starting plot price online. Call and ask for the list in writing.",
  newListEs:
    "Mountain View no publica un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 775-329-9231.",
  newListEn:
    "Mountain View does not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 775-329-9231.",
  officesEs: ["<strong>Mountain View Cemetery</strong> — 435 Stoker Ave. Teléfono 775-329-9231."],
  officesEn: ["<strong>Mountain View Cemetery</strong> — 435 Stoker Ave. Phone 775-329-9231."],
  analysisSameEs:
    "Mountain View publica cifras distintas: cremación directa (<strong>$1,455</strong>) y entierro inmediato (<strong>$2,695</strong>) con contenedor o ataúd del comprador. El crematorio figura aparte a <strong>$350</strong>. No publica un paquete de memorial ni de funeral tradicional. Las tres casas Walton publican la misma cremación directa (<strong>$1,695</strong>) y el mismo entierro inmediato (<strong>$2,995</strong>). El memorial Walton (<strong>$3,480</strong>) ya mete crematorio; la urna va aparte. El funeral tradicional Walton (<strong>$6,915</strong>) ya mete velatorio y ceremonia; el ataúd va aparte. El promedio de entierro completo de Nevada (<strong>$8,538</strong>) suele incluir ataúd; no es el paquete de una casa.",
  analysisSameEn:
    "Mountain View publishes different figures: direct cremation (<strong>$1,455</strong>) and immediate burial (<strong>$2,695</strong>) with a purchaser container or casket. The crematory is listed separately at <strong>$350</strong>. It does not publish a memorial or traditional package. The three Walton homes publish the same direct cremation (<strong>$1,695</strong>) and the same immediate burial (<strong>$2,995</strong>). Walton’s memorial (<strong>$3,480</strong>) already puts in the crematory; the urn is extra. Walton’s traditional funeral (<strong>$6,915</strong>) already puts in visitation and the ceremony; the casket is extra. Nevada’s full-burial average (<strong>$8,538</strong>) usually includes a casket; it is not one home’s package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Mountain View llame al <strong>775-329-9231</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property or opening/closing. At Mountain View call <strong>775-329-9231</strong>.",
  resaleHref: GRAVE_NV,
  plotNew: 4500,
  plotResale: 2500,
  unpublishedLeadEs: "",
  unpublishedLeadEn: "",
  unpublishedHomes: [],
  homes: [
    waltonHome({
      id: "sierra",
      name: "Walton’s Sierra Chapel",
      href: "https://www.waltonsfuneralhomes.com/waltons-sierra-chapel-price-list/",
      addr: "875 W Second St · 775-323-7189",
    }),
    waltonHome({
      id: "obrien",
      name: "Walton’s O’Brien Rogers & Crosby",
      href: "https://www.waltonsfuneralhomes.com/waltons-obrien-rogers-crosby-price-list/",
      addr: "600 W Second St · 775-323-6191",
    }),
    waltonHome({
      id: "rbk",
      name: "Ross, Burke & Knobel",
      href: "https://www.waltonsfuneralhomes.com/waltons-ross-burke-knobel-price-list/",
      addr: "2155 Kietzke Ln · 775-323-4154",
    }),
    {
      id: "mtnview",
      name: "Mountain View Mortuary",
      href: "https://www.mountainviewmortuary.net/services/pricing",
      addr: "425 Stoker Ave · 775-788-2199",
      dc: 1455,
      ib: 2695,
      dcEs: "Cremación directa, contenedor del comprador (GPL 16 sep. 2026). Crematorio aparte, $350.",
      dcEn: "Direct cremation, purchaser container (GPL 16 Sep 2026). Crematory extra, $350.",
      ibEs: "Entierro inmediato, ataúd del comprador. Lote aparte.",
      ibEn: "Immediate burial, purchaser casket. Plot extra.",
    },
  ],
});

const sparks = makeCity({
  slug: "sparks",
  nameEs: "Sparks",
  nameEn: "Sparks",
  heroW: 1200,
  heroH: 900,
  nearbyGuides: renoNear("sparks"),
  countyEs: "condado Washoe",
  countyEn: "Washoe County",
  metroEs: ["Sparks", "Spanish Springs"],
  metroEn: ["Sparks", "Spanish Springs"],
  metroTitleEs: "Área que atendemos en Sparks",
  metroTitleEn: "Sparks area we serve",
  prepaidCemEs: "Mountain View",
  prepaidCemEn: "Mountain View",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Mountain View Cemetery en Reno (775-329-9231). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Mountain View Cemetery in Reno (775-329-9231) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Walton’s Sparks: GPL 26 feb. 2026 (cremación directa $1,695 y entierro inmediato $2,995, contenedor o ataúd del comprador). Paquetes Walton: memorial $3,480 y funeral tradicional $6,915, sin urna ni ataúd. Estimador: promedios Funeralocity de Nevada. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Walton’s Sparks: GPL 26 Feb 2026 (direct cremation $1,695 and immediate burial $2,995, purchaser container or casket). Walton packages: memorial $3,480 and traditional funeral $6,915, with no urn or casket. Estimator: Nevada Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Mountain View, en Reno, vende lotes que usan muchas familias de Sparks. No publica el precio de partida en la web. Llame y pida la lista por escrito.",
  officesNoteEn:
    "Mountain View, in Reno, sells plots that many Sparks families use. It does not post a starting plot price online. Call and ask for the list in writing.",
  newListEs:
    "Mountain View no publica un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 775-329-9231.",
  newListEn:
    "Mountain View does not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 775-329-9231.",
  officesEs: ["<strong>Mountain View Cemetery</strong> — 435 Stoker Ave, Reno. Teléfono 775-329-9231."],
  officesEn: ["<strong>Mountain View Cemetery</strong> — 435 Stoker Ave, Reno. Phone 775-329-9231."],
  analysisSameEs:
    "Walton’s Sparks publica cremación directa (<strong>$1,695</strong>) y entierro inmediato (<strong>$2,995</strong>) con contenedor o ataúd del comprador. El memorial Walton (<strong>$3,480</strong>) ya mete crematorio; la urna va aparte. El funeral tradicional Walton (<strong>$6,915</strong>) ya mete velatorio y ceremonia; el ataúd va aparte. El promedio de entierro completo de Nevada (<strong>$8,538</strong>) suele incluir ataúd; no es un paquete Walton.",
  analysisSameEn:
    "Walton’s Sparks publishes direct cremation (<strong>$1,695</strong>) and immediate burial (<strong>$2,995</strong>) with a purchaser container or casket. Walton’s memorial (<strong>$3,480</strong>) already puts in the crematory; the urn is extra. Walton’s traditional funeral (<strong>$6,915</strong>) already puts in visitation and the ceremony; the casket is extra. Nevada’s full-burial average (<strong>$8,538</strong>) usually includes a casket; it is not a Walton package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio. En Mountain View llame al <strong>775-329-9231</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property. At Mountain View call <strong>775-329-9231</strong>.",
  resaleHref: GRAVE_NV,
  plotNew: 4500,
  plotResale: 2500,
  unpublishedLeadEs: "",
  unpublishedLeadEn: "",
  unpublishedHomes: [],
  homes: [
    waltonHome({
      id: "waltonsparks",
      name: "Walton’s Sparks",
      href: "https://www.waltonsfuneralhomes.com/waltons-sparks-price-list/",
      addr: "1745 Sullivan Ln · 775-359-2210",
    }),
  ],
});

const carsonCity = makeCity({
  slug: "carson-city",
  nameEs: "Carson City",
  nameEn: "Carson City",
  heroW: 1216,
  heroH: 900,
  nearbyGuides: renoNear("carson-city"),
  countyEs: "",
  countyEn: "",
  metroEs: ["Carson City", "Dayton", "Minden"],
  metroEn: ["Carson City", "Dayton", "Minden"],
  metroTitleEs: "Área que atendemos en Carson City",
  metroTitleEn: "Carson City area we serve",
  prepaidCemEs: "Lone Mountain",
  prepaidCemEn: "Lone Mountain",
  faqPlotEs:
    "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Lone Mountain Cemetery (775-887-2111). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  faqPlotEn:
    "No. The funeral home price is one bill. The plot is another. Ask Lone Mountain Cemetery (775-887-2111) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  tableFootEs:
    "Walton’s Chapel of the Valley: GPL 26 feb. 2026 (cremación directa $1,695 y entierro inmediato $2,995, contenedor o ataúd del comprador). Paquetes Walton: memorial $3,480 y funeral tradicional $6,915, sin urna ni ataúd. Estimador: promedios Funeralocity de Nevada. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
  tableFootEn:
    "Walton’s Chapel of the Valley: GPL 26 Feb 2026 (direct cremation $1,695 and immediate burial $2,995, purchaser container or casket). Walton packages: memorial $3,480 and traditional funeral $6,915, with no urn or casket. Estimator: Nevada Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
  officesNoteEs:
    "Lone Mountain es municipal. No publica el precio de partida en la web. Llame y pida la lista por escrito.",
  officesNoteEn:
    "Lone Mountain is municipal. It does not post a starting plot price online. Call and ask for the list in writing.",
  newListEs:
    "Lone Mountain no publica un precio de partida del lote en la web. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 775-887-2111.",
  newListEn:
    "Lone Mountain does not publish a starting plot price online. Opening and closing, the vault, and the marker are still extra. Ask for the list: 775-887-2111.",
  officesEs: ["<strong>Lone Mountain Cemetery</strong> — 1044 Beverly Dr. Teléfono 775-887-2111."],
  officesEn: ["<strong>Lone Mountain Cemetery</strong> — 1044 Beverly Dr. Phone 775-887-2111."],
  analysisSameEs:
    "Chapel of the Valley publica cremación directa (<strong>$1,695</strong>) y entierro inmediato (<strong>$2,995</strong>) con contenedor o ataúd del comprador. El memorial Walton (<strong>$3,480</strong>) ya mete crematorio; la urna va aparte. El funeral tradicional Walton (<strong>$6,915</strong>) ya mete velatorio y ceremonia; el ataúd va aparte. El promedio de entierro completo de Nevada (<strong>$8,538</strong>) suele incluir ataúd; no es un paquete Walton.",
  analysisSameEn:
    "Chapel of the Valley publishes direct cremation (<strong>$1,695</strong>) and immediate burial (<strong>$2,995</strong>) with a purchaser container or casket. Walton’s memorial (<strong>$3,480</strong>) already puts in the crematory; the urn is extra. Walton’s traditional funeral (<strong>$6,915</strong>) already puts in visitation and the ceremony; the casket is extra. Nevada’s full-burial average (<strong>$8,538</strong>) usually includes a casket; it is not a Walton package.",
  analysisPlotEs:
    "Ninguna cifra de la tabla es propiedad en cementerio. En Lone Mountain llame al <strong>775-887-2111</strong>.",
  analysisPlotEn:
    "None of the figures in the table are cemetery property. At Lone Mountain call <strong>775-887-2111</strong>.",
  resaleHref: GRAVE_NV,
  plotNew: 3500,
  plotResale: 2000,
  unpublishedLeadEs: "",
  unpublishedLeadEn: "",
  unpublishedHomes: [],
  homes: [
    waltonHome({
      id: "valley",
      name: "Walton’s Chapel of the Valley",
      href: "https://www.waltonsfuneralhomes.com/waltons-chapel-of-the-valley-price-list/",
      addr: "1281 N Roop St · 775-882-4965",
    }),
  ],
});

module.exports = [lasVegas, henderson, reno, sparks, carsonCity];
