/**
 * Ohio city guides. Estimator column is Ohio Funeralocity averages
 * (captured 26 Jul 2026). Named-home prices only when that home publishes them.
 */
const { makeCity, cell } = require("./oh-factory");

const HERO = {
  heroVer: "landmark-v1",
};

const CITIES = [
  { slug: "columbus", name: "Columbus" },
  { slug: "cleveland", name: "Cleveland" },
  { slug: "cincinnati", name: "Cincinnati" },
  { slug: "toledo", name: "Toledo" },
  { slug: "akron", name: "Akron" },
  { slug: "dayton", name: "Dayton" },
];

function near(except) {
  return CITIES.filter((c) => c.slug !== except);
}

const BOARD = "https://www.gravesolutions.com/for-sale/cemetery-properties/ohio";

const shared = {
  analysisSameEs:
    "Un paquete con el mismo nombre puede incluir o no el ataúd, la urna o el velatorio. Lea la lista de esa funeraria. El lote del cementerio no va en ninguno.",
  analysisSameEn:
    "A package with the same name may or may not include the casket, urn, or visitation. Read that funeral home’s list. The cemetery plot is in none of them.",
  prepaidCemEs: "o en el cementerio que elija",
  prepaidCemEn: "or at the cemetery you choose",
  tableFootEs:
    "La columna del estimador son promedios de Ohio de Funeralocity (26 jul. 2026). Esos promedios son de paquetes de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.",
  tableFootEn:
    "The estimator column is Ohio Funeralocity averages (26 Jul 2026). Those averages are funeral-home packages. They do not include the plot, opening and closing, the vault, or the marker.",
  resaleHref: BOARD,
};

const shawDavis = {
  id: "shaw",
  name: "Shaw-Davis",
  href: "https://www.shaw-davis.com/general-price-list",
  addr: "34 W 2nd Ave, Columbus · 614-299-4155",
  dc: 895,
  dcEs:
    "Paquete “Just Cremation”, vigente el 1 de julio de 2025. Incluye contenedor alternativo y urna de polímero. El lote no va incluido.",
  dcEn:
    "“Just Cremation” package, effective July 1, 2025. Includes an alternative container and a polymer urn. The plot is not included.",
  ib: 995,
  ibEs:
    "Entierro directo de la lista general, vigente el 1 de julio de 2025, cuando la familia no está. El ataúd va aparte, desde $1,195 en esa lista. El lote no va incluido.",
  ibEn:
    "Direct burial on the general price list, effective July 1, 2025, when the family is not present. The casket is extra, from $1,195 on that list. The plot is not included.",
  memCell: cell(
    2295,
    "Paquete “Cremation with Memorial Service”, vigente el 1 de julio de 2025. Incluye urna y un bloque de 2 horas el mismo día para visita o servicio. El lote no va incluido.",
    "“Cremation with Memorial Service” package, effective July 1, 2025. Includes an urn and a same-day 2-hour block for visitation or a service. The plot is not included."
  ),
  trCell: cell(
    2795,
    "Paquete “1 Day Traditional” de la página de entierros, con precios del 4 de octubre de 2024. Visita y servicio el mismo día. No incluye ataúd ni bóveda. El lote no va incluido.",
    "“1 Day Traditional” package on the burial page, prices dated October 4, 2024. Same-day visitation and service. Does not include a casket or vault. The plot is not included."
  ),
  casketTrad: false,
};

const advantageHilltop = {
  id: "advantage",
  name: "Advantage Hilltop",
  href: "https://www.dignitymemorial.com/funeral-homes/ohio/columbus/advantage-funeral-cremation-services-by-schoedinger-hilltop/8792",
  addr: "3030 W Broad St, Columbus · 614-279-8675",
  dc: 1970,
  dcEs:
    "Paquete “Limited Cremation”, vigente el 9 de junio de 2026. Incluye un momento familiar privado. La lista no incluye urna. El lote no va incluido.",
  dcEn:
    "“Limited Cremation” package, effective June 9, 2026. Includes a private family moment. The list does not include an urn. The plot is not included.",
  ib: null,
  memCell: cell(
    2720,
    "Paquete “Value Cremation”, vigente el 9 de junio de 2026. Incluye el servicio en la capilla y un momento familiar privado. No lista urna ni velatorio. El lote no va incluido.",
    "“Value Cremation” package, effective June 9, 2026. Includes a chapel service and a private family moment. It does not list an urn or visitation. The plot is not included."
  ),
  trCell: cell(
    3745,
    "Paquete “Advantage Burial”, vigente el 9 de junio de 2026. Incluye hasta 2 horas de velatorio y el servicio. No lista ataúd ni bóveda. El lote no va incluido.",
    "“Advantage Burial” package, effective June 9, 2026. Includes up to 2 hours of visitation and the service. It does not list a casket or vault. The plot is not included."
  ),
  casketTrad: false,
};

const vitoNero = {
  id: "vito",
  name: "Vito-Nero",
  href: "https://vitonero.com/pricing",
  addr: "6130 Turney Rd, Garfield Heights · 216-663-9222",
  dc: 725,
  dcEs:
    "Cremación directa publicada en su sitio, leída el 28 de septiembre de 2026. El sitio no imprime fecha de vigencia. Incluye servicios del director, refrigeración, contenedor de cremación, la cremación, la entrega en un contenedor básico y un obituario en línea. El lote no va incluido.",
  dcEn:
    "Direct cremation published on their site, read September 28, 2026. The site does not print an effective date. Includes the director’s services, refrigeration, a cremation container, the cremation, return in a basic container, and an online obituary. The plot is not included.",
  ib: null,
  memCell: cell(
    2195,
    "Cremación con memorial en el mismo sitio. Incluye la cremación directa, un memorial en su local, el montaje, libro, tarjetas, notas de agradecimiento y música. El lote no va incluido.",
    "Cremation with memorial on the same site. Includes the direct cremation, a memorial at their facility, the display setup, a register book, cards, thank-you notes, and music. The plot is not included."
  ),
  trCell: cell(
    4995,
    "Paquete “Celebration of Life” en su página de servicios, leída el 28 de septiembre de 2026. Incluye visita y ceremonia en su local, preparación y traslado, carroza, escolta y un ataúd a elección. El lote no va incluido.",
    "“Celebration of Life” package on their services page, read September 28, 2026. Includes visitation and a ceremony at their facility, preparation and transportation, a hearse, an escort, and a casket of the family’s choice. The plot is not included."
  ),
  casketTrad: true,
};

const clevelandCremation = {
  id: "clecremation",
  name: "Cleveland Cremation",
  href: "https://cdn.f1connect.net/cdn/15452D-vD0/gpl/Cleveland%20Cremation%20GPL.pdf",
  addr: "5618 Broadview Rd, Parma · 440-238-1200",
  dc: 1245,
  dcEs:
    "Cremación directa de la lista general vigente el 17 de noviembre de 2025. Incluye el traslado, el transporte local al crematorio, los servicios básicos y un contenedor de cartón. No incluye rito. La lista no agrega una tarifa de crematorio aparte. El lote no va incluido.",
  dcEn:
    "Direct cremation on the general price list effective November 17, 2025. Includes removal, local transportation to the crematory, basic services, and a cardboard container. It does not include a rite. The list does not add a separate crematory fee. The plot is not included.",
  ib: 1995,
  ibEs:
    "Entierro inmediato en la misma lista: $1,995 con ataúd del comprador, o $1,995 más el ataúd si se elige en la funeraria. Esas líneas no describen velatorio ni ceremonia. El lote no va incluido.",
  ibEn:
    "Immediate burial on the same list: $1,995 with a casket from the purchaser, or $1,995 plus the casket if one is selected from the funeral home. Those lines do not describe visitation or a ceremony. The plot is not included.",
  casketTrad: false,
};

const martens = {
  id: "martens",
  name: "Martens",
  href: "https://www.davidmartensfh.com/general-price-list",
  addr: "4175 Rocky River Dr, Cleveland · 216-941-1772",
  dc: 1700,
  dcEs:
    "Lista general vigente el 1 de enero de 2025. Incluye traslado, servicios básicos, traslado al crematorio y contenedor alternativo. La tarifa del crematorio, $350, va aparte. El lote no va incluido.",
  dcEn:
    "General price list effective January 1, 2025. Includes transfer, basic services, transfer to the crematory, and an alternative container. The crematory fee, $350, is extra. The plot is not included.",
  ib: 2400,
  ibEs:
    "Entierro inmediato de la misma lista, vigente el 1 de enero de 2025. Incluye vestir y colocar en el ataúd y el traslado al cementerio. No incluye el ataúd, velatorio, ceremonia ni servicio de pie de tumba. El lote no va incluido.",
  ibEn:
    "Immediate burial on the same list, effective January 1, 2025. Includes dressing, casketing, and transfer to the cemetery. It does not include the casket, visitation, a ceremony, or a graveside service. The plot is not included.",
  casketTrad: false,
};

const cummingsDavis = {
  id: "cummings",
  name: "Cummings & Davis",
  href: "https://www.dignitymemorial.com/funeral-homes/ohio/cleveland/cummings-davis-funeral-home/7828",
  addr: "13201 Euclid Ave, Cleveland · 216-541-1111",
  dc: null,
  ib: null,
  memCell: cell(
    6180,
    "Paquete “Honor Cremation”, precio con el descuento impreso, vigente el 20 de enero de 2026. Incluye traslado, refrigeración, tarifa del crematorio, reunión o memorial, y una urna. También lista flores y una recepción. El lote no va incluido.",
    "“Honor Cremation” package, price with the printed savings, effective January 20, 2026. Includes transfer, refrigeration, the crematory fee, a gathering or memorial service, and an urn. It also lists flowers and a reception. The plot is not included."
  ),
  trCell: cell(
    9795,
    "Paquete “Tribute Funeral” sin bóveda, precio con el descuento impreso, vigente el 20 de enero de 2026. Incluye embalsamar, vestir, velatorio, carroza y un ataúd de su lista. Con la bóveda la misma lista imprime $11,990. El lote no va incluido.",
    "“Tribute Funeral” package without the vault, price with the printed savings, effective January 20, 2026. Includes embalming, dressing, visitation, a hearse, and a casket from their list. With the vault the same list prints $11,990. The plot is not included."
  ),
  casketTrad: true,
};

const newcomerToledo = {
  id: "newcomer",
  name: "Newcomer Toledo",
  href: "https://cdn.newcomer.com/prod/price-lists/Toledo%20GPL.pdf",
  addr: "4150 W Laskey Rd, Toledo · 419-473-0300",
  dc: 1345,
  dcEs:
    "Cremación directa con contenedor de cartón, lista general vigente el 11 de septiembre de 2026. Con contenedor del comprador es $1,195. No incluye urna. El lote no va incluido.",
  dcEn:
    "Direct cremation with a cardboard container, general price list effective September 11, 2026. With a container from the purchaser it is $1,195. No urn. The plot is not included.",
  ib: 2655,
  ibEs:
    "Entierro inmediato con ataúd del comprador, misma lista. No incluye el ataúd, velatorio, ceremonia ni servicio de pie de tumba. El lote no va incluido.",
  ibEn:
    "Immediate burial with a casket from the purchaser, same list. It does not include the casket, visitation, a ceremony, or a graveside service. The plot is not included.",
  memCell: cell(
    3055,
    "Plan “Memorial Ceremony with Celebration of Life After Cremation”, vigente el 11 de septiembre de 2026. Reunión y ceremonia el mismo día, después de la cremación. No incluye urna. El lote no va incluido.",
    "“Memorial Ceremony with Celebration of Life After Cremation” plan, effective September 11, 2026. Same-day gathering and ceremony after cremation. It does not include an urn. The plot is not included."
  ),
  trCell: cell(
    3645,
    "Plan “Funeral Ceremony”, vigente el 11 de septiembre de 2026. Velatorio el día anterior y ceremonia. No incluye ataúd ni bóveda. Si visita y servicio son el mismo día, la lista resta $145. El lote no va incluido.",
    "“Funeral Ceremony” plan, effective September 11, 2026. Visitation the day before and a ceremony. It does not include a casket or vault. If the visit and service are the same day, the list subtracts $145. The plot is not included."
  ),
  casketTrad: false,
};

const newcomerAkron = {
  id: "newcomer",
  name: "Newcomer Akron",
  href: "https://cdn.newcomer.com/prod/price-lists/Akron%20GPL.pdf",
  addr: "131 N Canton Rd, Akron · 330-784-3334",
  dc: 1890,
  dcEs:
    "Cremación directa con contenedor de cartón, lista general vigente el 10 de septiembre de 2026. Con contenedor del comprador es $1,695. No incluye urna. El lote no va incluido.",
  dcEn:
    "Direct cremation with a cardboard container, general price list effective September 10, 2026. With a container from the purchaser it is $1,695. No urn. The plot is not included.",
  ib: 2805,
  ibEs:
    "Entierro inmediato con ataúd del comprador, misma lista. No incluye el ataúd, velatorio, ceremonia ni servicio de pie de tumba. El lote no va incluido.",
  ibEn:
    "Immediate burial with a casket from the purchaser, same list. It does not include the casket, visitation, a ceremony, or a graveside service. The plot is not included.",
  memCell: cell(
    3105,
    "Plan “Memorial Ceremony with Celebration of Life After Cremation”, vigente el 10 de septiembre de 2026. Reunión y ceremonia el mismo día, después de la cremación. No incluye urna. El lote no va incluido.",
    "“Memorial Ceremony with Celebration of Life After Cremation” plan, effective September 10, 2026. Same-day gathering and ceremony after cremation. It does not include an urn. The plot is not included."
  ),
  trCell: cell(
    3645,
    "Plan “Funeral Ceremony”, vigente el 10 de septiembre de 2026. Velatorio el día anterior y ceremonia. No incluye ataúd ni bóveda. El lote no va incluido.",
    "“Funeral Ceremony” plan, effective September 10, 2026. Visitation the day before and a ceremony. It does not include a casket or vault. The plot is not included."
  ),
  casketTrad: false,
};

const lusain = {
  id: "lusain",
  name: "Lusain",
  href: "https://lusainohio.com/wp-content/uploads/sites/268/2026/03/LUSAIN-OHIO-GPL-20260316.pdf",
  addr: "2060 Germantown St, Dayton · 937-268-6869",
  dc: 799,
  dcEs:
    "Cremación directa de la lista general vigente el 16 de marzo de 2026, con contenedor del comprador o de fibra de la funeraria. No incluye velatorio. El lote no va incluido.",
  dcEn:
    "Direct cremation on the general price list effective March 16, 2026, with a container from the purchaser or a fiberboard container from the funeral home. No visitation. The plot is not included.",
  ib: 2000,
  ibEs:
    "Entierro inmediato sin servicio, misma lista. La lista dice que este cargo incluye un ataúd, el traslado y la carroza local. No incluye velatorio ni ceremonia. El lote no va incluido.",
  ibEn:
    "Immediate burial with no service, same list. The list says this charge includes a casket, removal, and local hearse. It does not include visitation or a ceremony. The plot is not included.",
  casketIb: true,
  casketTrad: false,
};

const springGrove = {
  id: "springgrove",
  name: "Spring Grove",
  href: "https://www.springgrove.org/pricing-options/",
  addr: "Spring Grove Cemetery & Arboretum, Cincinnati",
  phone: "513-681-7526",
  dc: 1002,
  dcEs:
    "Cremación directa publicada por Spring Grove Cremation Society, vigente el 5 de marzo de 2026. El mismo precio de $1,002 figura con o sin colocación permanente en el osario de Spring Grove. No es un lote de cuerpo completo.",
  dcEn:
    "Direct cremation published by Spring Grove Cremation Society, effective March 5, 2026. The same $1,002 price is listed with or without permanent placement in the Spring Grove ossuary. It is not a full-body lot.",
  ib: null,
  memCell: cell(
    4805,
    "Ejemplo publicado de “Memorial Party / Reception”, vigente el 15 de enero de 2026. No es la lista general completa. El lote no va incluido.",
    "Published “Memorial Party / Reception” example, effective January 15, 2026. This is not the full general price list. The plot is not included."
  ),
  trCell: cell(
    6620,
    "Ejemplo de entierro con velorio el mismo día, vigente el 15 de enero de 2026. En ese ejemplo el ataúd y la bóveda van aparte. El lote no va incluido.",
    "Same-day visitation burial example, effective January 15, 2026. In that example the casket and vault are extra. The plot is not included."
  ),
  casketTrad: false,
};

const newcomerCincinnati = {
  id: "newcomer",
  name: "Newcomer",
  href: "https://cdn.newcomer.com/prod/pLists/price-list-Cincinnati.pdf",
  addr: "3300 Parkcrest Ln, Cincinnati · 513-661-7283",
  dc: 1370,
  dcEs:
    "Cremación directa con contenedor de cartón, lista general vigente el 8 de octubre de 2024. Con contenedor del comprador es $1,195. No incluye urna. El lote no va incluido.",
  dcEn:
    "Direct cremation with a cardboard container, general price list effective October 8, 2024. With a container from the purchaser it is $1,195. No urn. The plot is not included.",
  ib: 2200,
  ibEs:
    "Entierro inmediato con ataúd del comprador, misma lista. No incluye el ataúd, velatorio, ceremonia ni servicio de pie de tumba. El lote no va incluido.",
  ibEn:
    "Immediate burial with a casket from the purchaser, same list. It does not include the casket, visitation, a ceremony, or a graveside service. The plot is not included.",
  memCell: cell(
    2695,
    "Plan “Memorial Ceremony After Cremation”, vigente el 8 de octubre de 2024. Reunión y ceremonia el mismo día, después de la cremación. No incluye contenedor ni urna. El lote no va incluido.",
    "“Memorial Ceremony After Cremation” plan, effective October 8, 2024. Same-day gathering and ceremony after cremation. It does not include a container or an urn. The plot is not included."
  ),
  trCell: cell(
    3195,
    "Plan “Funeral Ceremony”, vigente el 8 de octubre de 2024. Velatorio el día anterior y ceremonia. No incluye ataúd ni bóveda. Si visita y servicio son el mismo día, la lista cobra $3,095. El lote no va incluido.",
    "“Funeral Ceremony” plan, effective October 8, 2024. Visitation the day before and a ceremony. It does not include a casket or vault. If the visit and service are the same day, the list charges $3,095. The plot is not included."
  ),
  casketTrad: false,
};

const hodapp = {
  id: "hodapp",
  name: "Hodapp",
  href: "https://www.hodappfuneralhome.com/resources/general-price-list",
  addr: "7401 Vine St, Cincinnati · 513-821-0805",
  dc: 2300,
  dcEs:
    "Paquete “Direct Cremation No Services”, lista vigente el 1 de julio de 2026. Incluye el cargo de servicio de $2,150 y un ataúd de cremación de $150, y entrega las cenizas en una urna temporal. Con contenedor del comprador, la cremación directa es $2,150. No hay velatorio. El lote no va incluido.",
  dcEn:
    "“Direct Cremation No Services” package, list effective July 1, 2026. It includes the $2,150 service charge and a $150 cremation casket, and returns the ashes in a temporary urn. With a container from the purchaser, direct cremation is $2,150. No visitation. The plot is not included.",
  ib: 2150,
  ibEs:
    "Entierro inmediato con contenedor del comprador, misma lista. No incluye ataúd, velatorio ni ceremonia. Con ataúd forrado de tela, la lista cobra $3,320. El lote no va incluido.",
  ibEn:
    "Immediate burial with a container from the purchaser, same list. It does not include a casket, visitation, or a ceremony. With a cloth-covered casket, the list charges $3,320. The plot is not included.",
  memCell: cell(
    3550,
    "Cremación directa con memorial en horario de oficina, vigente el 1 de julio de 2026. Incluye el cargo de servicio, el memorial y un contenedor de cartón. No incluye urna. De noche entre semana es $3,800. El lote no va incluido.",
    "Direct cremation with a memorial during business hours, effective July 1, 2026. It includes the service charge, the memorial, and a corrugated container. It does not include an urn. A weekday evening is $3,800. The plot is not included."
  ),
  trCell: cell(
    4995,
    "Paquete “Traditional Funeral”, vigente el 1 de julio de 2026. Velatorio por la noche y funeral con entierro al día siguiente. No incluye ataúd ni bóveda. El funeral de un solo día (“Conventional”) es $4,495. El lote no va incluido.",
    "“Traditional Funeral” package, effective July 1, 2026. Evening visitation, then a funeral and burial the next day. It does not include a casket or vault. The one-day “Conventional” funeral is $4,495. The plot is not included."
  ),
  casketTrad: false,
};

module.exports = [
  makeCity({
    ...shared,
    ...HERO,
    slug: "columbus",
    heroFile: "columbus-ohio-statehouse",
    heroClass: "sc-hero--columbus",
    heroW: 1567,
    heroH: 900,
    nameEn: "Columbus",
    heroCaptionEs: "Capitolio de Ohio, Columbus",
    heroCaptionEn: "Ohio Statehouse, Columbus",
    countyEs: "condado de Franklin",
    countyEn: "Franklin County",
    metroEs: ["Columbus", "Westerville", "Grove City", "Reynoldsburg"],
    metroEn: ["Columbus", "Westerville", "Grove City", "Reynoldsburg"],
    metroTitleEs: "Columbus y el condado de Franklin",
    metroTitleEn: "Columbus and Franklin County",
    nearbyGuides: near("columbus"),
    homes: [shawDavis, advantageHilltop],
    tableFootEs:
      "Shaw-Davis: cremación directa, entierro inmediato y cremación con memorial vigentes el 1 de julio de 2025; el funeral de un día está en la página de paquetes de entierro con fecha 4 de octubre de 2024. Advantage Hilltop: paquetes vigentes el 9 de junio de 2026. La columna del estimador son promedios de Ohio de Funeralocity (26 jul. 2026). Esos promedios y los paquetes son de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.",
    tableFootEn:
      "Shaw-Davis: direct cremation, immediate burial, and cremation with memorial effective July 1, 2025; the one-day funeral is on the burial package page dated October 4, 2024. Advantage Hilltop: packages effective June 9, 2026. The estimator column is Ohio Funeralocity averages (26 Jul 2026). Those averages and the packages are funeral-home charges. They do not include the plot, opening and closing, the vault, or the marker.",
    analysisCheapEs:
      "La cremación directa es el atajo más barato que publican: <strong>$895</strong> en Shaw-Davis (incluye urna de polímero) y <strong>$1,970</strong> en Advantage Hilltop (la lista no incluye urna). El estimador usa <strong>$2,056</strong> para Ohio. Ese número es solo el promedio de funeraria.",
    analysisCheapEn:
      "Direct cremation is the cheapest published shortcut: <strong>$895</strong> at Shaw-Davis (includes a polymer urn) and <strong>$1,970</strong> at Advantage Hilltop (the list does not include an urn). The estimator uses <strong>$2,056</strong> for Ohio. That number is only the funeral-home average.",
    analysisSameEs:
      "Shaw-Davis incluye una urna en la cremación directa de $895. Advantage Hilltop no lista urna en la de $1,970, pero sí un momento familiar privado. El funeral de un día de Shaw-Davis ($2,795) y el entierro Advantage ($3,745) no incluyen ataúd. El lote no va en ninguno.",
    analysisSameEn:
      "Shaw-Davis includes an urn in the $895 direct cremation. Advantage Hilltop does not list an urn in the $1,970 package, but it does include a private family moment. Shaw-Davis’s one-day funeral ($2,795) and Advantage Burial ($3,745) do not include a casket. The plot is in none of them.",
    faqPlotEs:
      "No. El precio de la funeraria no compra el espacio. Forest Lawn Memorial Gardens, en 5600 East Broad Street, publica un precio inicial de $2,795 para propiedad de entierro y de cremación. Eso no es la cuenta completa de una tumba: abrir y cerrar, la bóveda y la lápida van aparte, y ese inicio puede ser un espacio de cremación. Green Lawn Cemetery no publica el precio del lote y exige bóveda en cada entierro.",
    faqPlotEn:
      "No. The funeral-home price does not buy the space. Forest Lawn Memorial Gardens, at 5600 East Broad Street, publishes a starting price of $2,795 for burial and cremation property. That is not a full grave bill: opening and closing, the vault, and the marker are separate, and that starting space may be a cremation property. Green Lawn Cemetery does not publish a lot price and requires a vault for every burial.",
    officesNoteEs:
      "Los $2,795 son el precio inicial que Forest Lawn publica para propiedad de entierro y de cremación. No es el funeral y no incluye abrir y cerrar. El tablero de Ohio de Grave Solutions no tenía un anuncio activo en Columbus el 28 de septiembre de 2026.",
    officesNoteEn:
      "The $2,795 figure is Forest Lawn’s published starting price for burial and cremation property. It is not the funeral, and it does not include opening and closing. The Ohio Grave Solutions board had no active Columbus ad on September 28, 2026.",
    newListEs:
      "Forest Lawn Memorial Gardens publica en su página un precio inicial de $2,795 para propiedad de cementerio, de entierro o de cremación. No dice que esa cifra sea un lote de cuerpo completo. Teléfono 614-866-0200. Green Lawn Cemetery vende lotes y exige bóveda para cada entierro, de cuerpo o de cremación, pero no publica el precio del espacio.",
    newListEn:
      "Forest Lawn Memorial Gardens publishes a starting price of $2,795 on its page for cemetery property, burial or cremation. It does not say that figure is one full-body lot. Phone 614-866-0200. Green Lawn Cemetery sells lots and requires a vault for every burial, full body or cremation, but it does not publish the space price.",
    officesEs: [
      "Forest Lawn Memorial Gardens, 5600 East Broad Street, Columbus. Propiedad de entierro y de cremación desde $2,795. Abrir y cerrar: en la oficina. Teléfono 614-866-0200.",
      "Green Lawn Cemetery, Columbus. Lote: pida la lista. El sitio exige bóveda para cada entierro, de cuerpo o de cremación.",
    ],
    officesEn: [
      "Forest Lawn Memorial Gardens, 5600 East Broad Street, Columbus. Burial and cremation property from $2,795. Opening and closing: at the office. Phone 614-866-0200.",
      "Green Lawn Cemetery, Columbus. Lot: ask for the list. The site requires a vault for every burial, full body or cremation.",
    ],
    analysisPlotEs:
      "Ningún paquete de la tabla incluye el lote. Forest Lawn publica un inicio de <strong>$2,795</strong> para propiedad de entierro y de cremación. Eso no está en el precio de la funeraria. Abrir y cerrar, la bóveda y la lápida van aparte.",
    analysisPlotEn:
      "No package in the table includes the plot. Forest Lawn publishes a starting price of <strong>$2,795</strong> for burial and cremation property. That is not in the funeral-home price. Opening and closing, the vault, and the marker are extra.",
    plotNew: 2795,
    plotNewLabelEs: "Precio inicial de Forest Lawn (unos $2,795)",
    plotNewLabelEn: "Forest Lawn starting price (about $2,795)",
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "cleveland",
    heroFile: "cleveland-rock-hall",
    heroClass: "sc-hero--cleveland",
    heroW: 1381,
    heroH: 900,
    nameEn: "Cleveland",
    heroCaptionEs: "Salón de la Fama del Rock and Roll, Cleveland",
    heroCaptionEn: "Rock and Roll Hall of Fame, Cleveland",
    countyEs: "condado de Cuyahoga",
    countyEn: "Cuyahoga County",
    metroEs: ["Cleveland", "Lakewood", "Parma", "Euclid"],
    metroEn: ["Cleveland", "Lakewood", "Parma", "Euclid"],
    metroTitleEs: "Cleveland y el condado de Cuyahoga",
    metroTitleEn: "Cleveland and Cuyahoga County",
    nearbyGuides: near("cleveland"),
    homes: [vitoNero, clevelandCremation, martens, cummingsDavis],
    tableFootEs:
      "Vito-Nero: precios de paquetes en su sitio, leídos el 28 de septiembre de 2026; el sitio no imprime fecha de vigencia. No publica un entierro inmediato. Cleveland Cremation (Parma): lista general vigente el 17 de noviembre de 2025. No publica cremación con memorial ni funeral con velatorio. Martens: lista general vigente el 1 de enero de 2025. La cremación directa de $1,700 no incluye la tarifa del crematorio de $350. Cummings & Davis: lista de paquetes vigente el 20 de enero de 2026. No publica cremación directa ni entierro inmediato; el paquete de cremación más bajo incluye una reunión. La columna del estimador son promedios de Ohio de Funeralocity (26 jul. 2026). Esos promedios y las listas son de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.",
    tableFootEn:
      "Vito-Nero: package prices on their site, read September 28, 2026; the site does not print an effective date. It does not publish an immediate burial. Cleveland Cremation (Parma): general price list effective November 17, 2025. It does not publish cremation with a memorial or a funeral with visitation. Martens: general price list effective January 1, 2025. The $1,700 direct cremation does not include the $350 crematory fee. Cummings & Davis: package list effective January 20, 2026. It does not publish a direct cremation or an immediate burial; its lowest cremation package includes a gathering. The estimator column is Ohio Funeralocity averages (26 Jul 2026). Those averages and the lists are funeral-home charges. They do not include the plot, opening and closing, the vault, or the marker.",
    analysisSameEs:
      "La cremación directa de $725 en Vito-Nero incluye la cremación y un contenedor básico para las cenizas. La de $1,245 en Cleveland Cremation no agrega una línea de crematorio. La de $1,700 en Martens deja la tarifa del crematorio de $350 aparte. El funeral de $4,995 en Vito-Nero incluye ataúd. El “Tribute Funeral” de Cummings & Davis es $9,795 sin bóveda e incluye ataúd; con bóveda la misma lista imprime $11,990. Cummings no publica cremación directa: su paquete de cremación más bajo incluye una reunión. El lote no va en ninguno.",
    analysisSameEn:
      "Vito-Nero’s $725 direct cremation includes the cremation and a basic container for the ashes. Cleveland Cremation’s $1,245 list does not add a separate crematory line. Martens’s $1,700 direct cremation leaves the $350 crematory fee extra. Vito-Nero’s $4,995 funeral includes a casket. Cummings & Davis’s Tribute funeral is $9,795 without the vault and includes a casket; with the vault the same list prints $11,990. Cummings does not publish a direct cremation: its lowest cremation package includes a gathering. The plot is in none of them.",
    faqPlotEs:
      "No. El precio de la funeraria no compra el espacio. La ciudad de Cleveland vende tumbas de $743 (marcador al ras) y $873 (marcador elevado) en West Park Cemetery y Cleveland Memorial Gardens; la oficina de Highland Park también vende ese espacio. Lake View publica un lote estándar desde $2,195. Lakewood Park Cemetery, en Rocky River, publica una tumba completa de $3,000. Abrir y cerrar va aparte en los tres.",
    faqPlotEn:
      "No. The funeral-home price does not buy the space. The City of Cleveland sells graves at $743 (flush marker) and $873 (raised marker) at West Park Cemetery and Cleveland Memorial Gardens; the Highland Park office also sells that space. Lake View publishes a standard lot from $2,195. Lakewood Park Cemetery, in Rocky River, publishes a full grave at $3,000. Opening and closing is extra at all three.",
    officesNoteEs:
      "Esos precios son solo el espacio. No son el funeral. Abrir y cerrar, la bóveda y la lápida van aparte. El tablero de Ohio de Grave Solutions no tenía un anuncio activo de un cementerio de Cleveland el 28 de septiembre de 2026.",
    officesNoteEn:
      "Those prices are only the space. They are not the funeral. Opening and closing, the vault, and the marker are extra. The Ohio Grave Solutions board had no active ad for a Cleveland cemetery on September 28, 2026.",
    newListEs:
      "La ciudad cobra $743 por una tumba de marcador al ras y $873 por una de marcador elevado. Efectivo no se acepta y el espacio se paga completo. Abrir y cerrar se consulta en la oficina. Lake View publica un lote en tierra desde $2,195; abrir y cerrar ahí es de $1,795 a $3,295. Lakewood Park publica una tumba completa de $3,000 en las secciones 1 a 18, lista vigente el 1 de septiembre de 2023, y una tumba de cremación de $2,000 en las secciones 3, 8 y 15.",
    newListEn:
      "The city charges $743 for a flush-marker grave and $873 for a raised-marker grave. Cash is not accepted, and the space is paid in full. Opening and closing is at the office. Lake View publishes an in-ground lot from $2,195; opening and closing there is $1,795 to $3,295. Lakewood Park publishes a full grave at $3,000 in sections 1 through 18, list effective September 1, 2023, and a cremation grave at $2,000 in sections 3, 8, and 15.",
    officesEs: [
      "West Park Cemetery, 3942 Ridge Rd, Cleveland. Tumba de la ciudad: $743 al ras o $873 con marcador elevado. Abrir y cerrar: en la oficina.",
      "Cleveland Memorial Gardens, 4324 Green Rd, Cleveland. La misma tarifa de la ciudad: $743 al ras o $873 con marcador elevado.",
      "Highland Park Cemetery, 21400 Chagrin Blvd. La ciudad también nombra esta oficina para comprar una tumba a esa tarifa.",
      "Lake View Cemetery, 12316 Euclid Ave, Cleveland. Lote estándar en tierra desde $2,195. Abrir y cerrar: $1,795 a $3,295. Teléfono 216-421-2665.",
      "Lakewood Park Cemetery, 22025 Detroit Rd, Rocky River. Tumba completa, secciones 1 a 18: $3,000. Tumba de cremación, secciones 3, 8 y 15: $2,000. Abrir y cerrar entre semana antes de las 3 p.m.: $1,600. Lista vigente el 1 de septiembre de 2023. Teléfono 440-333-1922.",
    ],
    officesEn: [
      "West Park Cemetery, 3942 Ridge Rd, Cleveland. City grave: $743 flush or $873 raised marker. Opening and closing: at the office.",
      "Cleveland Memorial Gardens, 4324 Green Rd, Cleveland. Same city fee: $743 flush or $873 raised marker.",
      "Highland Park Cemetery, 21400 Chagrin Blvd. The city also names this office for buying a grave at that fee.",
      "Lake View Cemetery, 12316 Euclid Ave, Cleveland. Standard in-ground lot from $2,195. Opening and closing: $1,795 to $3,295. Phone 216-421-2665.",
      "Lakewood Park Cemetery, 22025 Detroit Rd, Rocky River. Full grave, sections 1 through 18: $3,000. Cremation grave, sections 3, 8, and 15: $2,000. Weekday opening and closing before 3 p.m.: $1,600. List effective September 1, 2023. Phone 440-333-1922.",
    ],
    analysisPlotEs:
      "Una tumba de la ciudad es <strong>$743</strong> (marcador al ras) o <strong>$873</strong> (marcador elevado). Lake View empieza en <strong>$2,195</strong>. Una tumba completa en Lakewood Park es <strong>$3,000</strong>. Nada de eso está en el precio de la funeraria. Abrir y cerrar, la bóveda y la lápida van aparte.",
    analysisPlotEn:
      "A city grave is <strong>$743</strong> (flush marker) or <strong>$873</strong> (raised marker). Lake View starts at <strong>$2,195</strong>. A full grave at Lakewood Park is <strong>$3,000</strong>. None of that is in the funeral-home price. Opening and closing, the vault, and the marker are extra.",
    plotNew: 743,
    plotNewLabelEs: "Tumba de la ciudad, marcador al ras (unos $743)",
    plotNewLabelEn: "City flush-marker grave (about $743)",
    monumentNoteEs:
      "La lápida no va en el precio de la funeraria ni en el del lote. La ciudad de Cleveland cobra $260 por colocar una piedra sencilla (24 por 12 por 4 pulgadas) y $350 por una doble. Eso no es el precio de la piedra. Lake View vende una lápida desde $1,255, más una base desde $445. El cementerio tiene que aprobar el tamaño.",
    monumentNoteEn:
      "The headstone is not in the funeral-home price or the plot price. The City of Cleveland charges $260 to set a single stone (24 by 12 by 4 inches) and $350 for a double stone. That is not the price of the stone. Lake View sells a headstone from $1,255, plus a foundation from $445. The cemetery has to approve the size.",
    monuments: [
      {
        name: "Kotecki Family Memorials",
        href: "https://koteckifamilymemorials.com/",
        addr: "3636 Pearl Rd, Cleveland · 216-749-2880",
      },
      {
        name: "Milano Monuments",
        href: "https://www.milanomonuments.com/",
        addr: "14600 Brookpark Rd, Cleveland · 216-362-1199",
      },
    ],
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "cincinnati",
    heroFile: "cincinnati-roebling-bridge",
    heroClass: "sc-hero--cincinnati",
    heroW: 1229,
    heroH: 900,
    nameEn: "Cincinnati",
    heroCaptionEs: "Puente John A. Roebling, Cincinnati",
    heroCaptionEn: "John A. Roebling Bridge, Cincinnati",
    countyEs: "condado de Hamilton",
    countyEn: "Hamilton County",
    metroEs: ["Cincinnati", "Norwood", "Forest Park", "Springdale"],
    metroEn: ["Cincinnati", "Norwood", "Forest Park", "Springdale"],
    metroTitleEs: "Cincinnati y el condado de Hamilton",
    metroTitleEn: "Cincinnati and Hamilton County",
    nearbyGuides: near("cincinnati"),
    homes: [springGrove, newcomerCincinnati, hodapp],
    tableFootEs:
      "Spring Grove: cremación directa de Spring Grove Cremation Society, vigente el 5 de marzo de 2026. Los ejemplos de memorial y de entierro con velorio son de springgrove.org, vigentes el 15 de enero de 2026. No publica un entierro inmediato. Newcomer, capilla West Side: lista general vigente el 8 de octubre de 2024. Hodapp, capilla de Carthage; la misma lista cubre College Hill: vigente el 1 de julio de 2026. La columna del estimador son promedios de Ohio de Funeralocity (26 jul. 2026). Esos promedios y las listas son de funeraria. No incluyen el lote de cuerpo completo, abrir y cerrar la tumba, la bóveda ni la lápida.",
    tableFootEn:
      "Spring Grove: direct cremation from Spring Grove Cremation Society, effective March 5, 2026. The memorial and visitation-burial examples are from springgrove.org, effective January 15, 2026. It does not publish an immediate burial. Newcomer, West Side Chapel: general price list effective October 8, 2024. Hodapp, Carthage chapel; the same list covers College Hill: effective July 1, 2026. The estimator column is Ohio Funeralocity averages (26 Jul 2026). Those averages and the lists are funeral-home charges. They do not include a full-body plot, opening and closing, the vault, or the marker.",
    analysisSameEs:
      "La cremación directa de $1,002 en Spring Grove no es un lote de cuerpo completo. La de $1,370 en Newcomer incluye un contenedor de cartón y deja la urna aparte. La de $2,300 en Hodapp incluye un ataúd de cremación de $150 y una urna temporal. El funeral de $3,195 en Newcomer y el de $4,995 en Hodapp no incluyen ataúd. Spring Grove no publica un entierro inmediato. El lote no va en ninguno.",
    analysisSameEn:
      "Spring Grove’s $1,002 direct cremation is not a full-body lot. Newcomer’s $1,370 direct cremation includes a cardboard container and leaves the urn extra. Hodapp’s $2,300 direct cremation includes a $150 cremation casket and a temporary urn. Newcomer’s $3,195 funeral and Hodapp’s $4,995 funeral do not include a casket. Spring Grove does not publish an immediate burial. The plot is in none of them.",
    faqPlotEs:
      "No. Los ejemplos de Spring Grove son servicios de funeraria. Spring Grove no publica un precio de lote de cuerpo completo. La ciudad de Montgomery, en el condado de Hamilton, publica un espacio individual de $900 para residentes y $1,800 para no residentes. Abrir y cerrar entre semana es $800 para residentes. Eso no es un cementerio de Cincinnati.",
    faqPlotEn:
      "No. The Spring Grove examples are funeral-home services. Spring Grove does not publish a full-body lot price. The City of Montgomery, in Hamilton County, publishes an individual gravesite at $900 for residents and $1,800 for non-residents. Weekday opening and closing is $800 for residents. That is not a Cincinnati cemetery.",
    officesNoteEs:
      "Los $900 son un espacio individual para residentes de Montgomery, no de Cincinnati, y no son el funeral. Spring Grove no publica el precio del lote. Teléfono de Spring Grove: 513-681-7526.",
    officesNoteEn:
      "The $900 figure is an individual gravesite for a Montgomery resident, not a Cincinnati resident, and it is not the funeral. Spring Grove does not publish the lot price. Spring Grove’s phone is 513-681-7526.",
    newListEs:
      "Spring Grove Cemetery vende el derecho de entierro, no el terreno, y no publica el precio del lote. Pida la lista: 513-681-7526. La ciudad de Montgomery publica en su sitio un espacio individual de $900 (residente) o $1,800 (no residente), y abrir y cerrar entre semana de $800 (residente) o $1,200 (no residente).",
    newListEn:
      "Spring Grove Cemetery sells the interment right, not the land, and it does not publish the lot price. Ask for the list: 513-681-7526. The City of Montgomery publishes an individual gravesite at $900 (resident) or $1,800 (non-resident), and weekday opening and closing at $800 (resident) or $1,200 (non-resident).",
    officesEs: [
      "Spring Grove Cemetery & Arboretum, Cincinnati. Lote de cuerpo completo: pida la lista. Teléfono 513-681-7526.",
      "Cementerio de la ciudad de Montgomery, condado de Hamilton. Espacio individual: $900 residente o $1,800 no residente. Abrir y cerrar entre semana: $800 residente o $1,200 no residente.",
    ],
    officesEn: [
      "Spring Grove Cemetery & Arboretum, Cincinnati. Full-body lot: ask for the list. Phone 513-681-7526.",
      "City of Montgomery cemetery, Hamilton County. Individual gravesite: $900 resident or $1,800 non-resident. Weekday opening and closing: $800 resident or $1,200 non-resident.",
    ],
    analysisPlotEs:
      "Ningún ejemplo de Spring Grove incluye el lote de cuerpo completo. En Montgomery, un suburbio del condado de Hamilton, el espacio individual de residente es <strong>$900</strong>. Eso no es el precio de un cementerio de Cincinnati.",
    analysisPlotEn:
      "No Spring Grove example includes a full-body plot. In Montgomery, a Hamilton County suburb, a resident individual gravesite is <strong>$900</strong>. That is not a Cincinnati cemetery price.",
    plotNew: null,
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "toledo",
    heroFile: "toledo-glass-city-skyway",
    heroClass: "sc-hero--toledo",
    heroW: 1353,
    heroH: 900,
    nameEn: "Toledo",
    heroCaptionEs: "Veterans' Glass City Skyway, Toledo",
    heroCaptionEn: "Veterans' Glass City Skyway, Toledo",
    countyEs: "condado de Lucas",
    countyEn: "Lucas County",
    metroEs: ["Toledo", "Oregon", "Sylvania", "Maumee"],
    metroEn: ["Toledo", "Oregon", "Sylvania", "Maumee"],
    metroTitleEs: "Toledo y el condado de Lucas",
    metroTitleEn: "Toledo and Lucas County",
    nearbyGuides: near("toledo"),
    homes: [newcomerToledo],
    tableFootEs:
      "Newcomer Toledo: lista general vigente el 11 de septiembre de 2026. Hay capillas en Laskey Road, Heatherdowns y King Road. La columna del estimador son promedios de Ohio de Funeralocity (26 jul. 2026). Esos promedios y la lista son de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.",
    tableFootEn:
      "Newcomer Toledo: general price list effective September 11, 2026. Chapels are on Laskey Road, Heatherdowns, and King Road. The estimator column is Ohio Funeralocity averages (26 Jul 2026). Those averages and the list are funeral-home charges. They do not include the plot, opening and closing, the vault, or the marker.",
    faqPlotEs:
      "No. La lista de Newcomer no incluye el lote. Ottawa Hills Memorial Park, 4210 West Central Avenue, publica un precio inicial de $2,495 para propiedad de entierro y de cremación. Eso no es la cuenta completa de una tumba: abrir y cerrar, la bóveda y la lápida van aparte, y ese inicio puede ser un espacio de cremación. Historic Woodlawn administra los cementerios de la ciudad y no publica el precio del espacio. Sí publica un recargo de $250 por entierro de cuerpo, o $150 por cremación, si se agenda con menos de 48 horas.",
    faqPlotEn:
      "No. The Newcomer list does not include the plot. Ottawa Hills Memorial Park, at 4210 West Central Avenue, publishes a starting price of $2,495 for burial and cremation property. That is not a full grave bill: opening and closing, the vault, and the marker are separate, and that starting space may be a cremation property. Historic Woodlawn manages the city cemeteries and does not publish the space price. It does publish a $250 fee for a full-body burial, or $150 for a cremation, if scheduled with less than 48 hours’ notice.",
    officesNoteEs:
      "Los $2,495 son el precio inicial que Ottawa Hills publica para propiedad de entierro y de cremación. No es el funeral y no incluye abrir y cerrar. Woodlawn no publica el precio del lote. Los $250 y $150 son recargos por aviso corto, no el precio del espacio.",
    officesNoteEn:
      "The $2,495 figure is Ottawa Hills’ published starting price for burial and cremation property. It is not the funeral, and it does not include opening and closing. Woodlawn does not publish the lot price. The $250 and $150 figures are short-notice fees, not the space price.",
    newListEs:
      "Ottawa Hills Memorial Park publica en su página un precio inicial de $2,495 para propiedad de cementerio, de entierro o de cremación. No dice que esa cifra sea un lote de cuerpo completo. Teléfono 419-536-8321. Historic Woodlawn dice en su sitio que envíe un correo o llame al 419-472-2186 para la lista completa. La orden de servicio de 2025 publica el recargo por programar o cancelar con menos de 48 horas: $250 por cuerpo completo o $150 por cremación.",
    newListEn:
      "Ottawa Hills Memorial Park publishes a starting price of $2,495 on its page for cemetery property, burial or cremation. It does not say that figure is one full-body lot. Phone 419-536-8321. Historic Woodlawn says on its site to email or call 419-472-2186 for the full price sheet. The 2025 service order publishes the fee for scheduling or canceling with less than 48 hours’ notice: $250 for a full-body burial or $150 for a cremation.",
    officesEs: [
      "Ottawa Hills Memorial Park, 4210 West Central Avenue, Toledo. Propiedad de entierro y de cremación desde $2,495. Abrir y cerrar: en la oficina. Teléfono 419-536-8321.",
      "Historic Woodlawn Cemetery, 1502 West Central Avenue, Toledo. Lote: pida la lista. Teléfono 419-472-2186. Aviso de menos de 48 horas: $250 cuerpo completo o $150 cremación.",
    ],
    officesEn: [
      "Ottawa Hills Memorial Park, 4210 West Central Avenue, Toledo. Burial and cremation property from $2,495. Opening and closing: at the office. Phone 419-536-8321.",
      "Historic Woodlawn Cemetery, 1502 West Central Avenue, Toledo. Lot: ask for the list. Phone 419-472-2186. Less than 48 hours’ notice: $250 full body or $150 cremation.",
    ],
    analysisPlotEs:
      "El lote no está en la lista de Newcomer. Ottawa Hills publica un inicio de <strong>$2,495</strong> para propiedad de entierro y de cremación. Eso no está en el precio de la funeraria. Abrir y cerrar, la bóveda y la lápida van aparte. Woodlawn no publica el precio del espacio. El recargo por aviso corto es <strong>$250</strong> (cuerpo) o <strong>$150</strong> (cremación).",
    analysisPlotEn:
      "The plot is not on the Newcomer list. Ottawa Hills publishes a starting price of <strong>$2,495</strong> for burial and cremation property. That is not in the funeral-home price. Opening and closing, the vault, and the marker are extra. Woodlawn does not publish the space price. The short-notice fee is <strong>$250</strong> (full body) or <strong>$150</strong> (cremation).",
    plotNew: 2495,
    plotNewLabelEs: "Precio inicial de Ottawa Hills (unos $2,495)",
    plotNewLabelEn: "Ottawa Hills starting price (about $2,495)",
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "akron",
    heroFile: "akron-stan-hywet",
    heroClass: "sc-hero--akron",
    heroW: 1600,
    heroH: 900,
    nameEn: "Akron",
    heroCaptionEs: "Stan Hywet Hall, Akron",
    heroCaptionEn: "Stan Hywet Hall, Akron",
    countyEs: "condado de Summit",
    countyEn: "Summit County",
    metroEs: ["Akron", "Cuyahoga Falls", "Stow", "Barberton"],
    metroEn: ["Akron", "Cuyahoga Falls", "Stow", "Barberton"],
    metroTitleEs: "Akron y el condado de Summit",
    metroTitleEn: "Akron and Summit County",
    nearbyGuides: near("akron"),
    homes: [newcomerAkron],
    tableFootEs:
      "Newcomer Akron: lista general vigente el 10 de septiembre de 2026. La columna del estimador son promedios de Ohio de Funeralocity (26 jul. 2026). Esos promedios y la lista son de funeraria. No incluyen el lote, abrir y cerrar la tumba, la bóveda ni la lápida.",
    tableFootEn:
      "Newcomer Akron: general price list effective September 10, 2026. The estimator column is Ohio Funeralocity averages (26 Jul 2026). Those averages and the list are funeral-home charges. They do not include the plot, opening and closing, the vault, or the marker.",
    faqPlotEs:
      "No. El funeral no incluye el lote. En Hillside Memorial Gardens, Akron, un anuncio de particular pide $2,000 por dos espacios juntos (leído el 28 de septiembre de 2026). Eso es un precio pedido, no la lista del cementerio.",
    faqPlotEn:
      "No. The funeral does not include the plot. At Hillside Memorial Gardens in Akron, a private-party ad asks $2,000 for two spaces together (read 28 Sep 2026). That is an asking price, not the cemetery’s list.",
    officesNoteEs:
      "Los $2,000 son el precio pedido de un particular por dos espacios juntos en Hillside Memorial Gardens. No es la lista de la oficina y no es un promedio de Akron.",
    officesNoteEn:
      "The $2,000 figure is a private seller’s asking price for two spaces together at Hillside Memorial Gardens. It is not the office list and it is not an Akron average.",
    newListEs:
      "Esta página no tiene un precio de lote nuevo publicado por un cementerio de Akron. El anuncio de reventa en Hillside Memorial Gardens pide $2,000 por dos espacios juntos. Revise si sigue activo en Grave Solutions.",
    newListEn:
      "This page does not have a new-lot price published by an Akron cemetery. The resale ad at Hillside Memorial Gardens asks $2,000 for two spaces together. Check that it is still active on Grave Solutions.",
    officesEs: [
      "Glendale Cemetery, 150 Glendale Ave, Akron. Lote: pida la lista. Teléfono 330-253-2317.",
      "Hillside Memorial Gardens, Akron. Reventa: $2,000 por dos espacios juntos (anuncio de particular, 28 sep. 2026). Lista de la oficina: pídala al cementerio.",
    ],
    officesEn: [
      "Glendale Cemetery, 150 Glendale Ave, Akron. Lot: ask for the list. Phone 330-253-2317.",
      "Hillside Memorial Gardens, Akron. Resale: $2,000 for two spaces together (private-party ad, 28 Sep 2026). Office list: ask the cemetery.",
    ],
    analysisPlotEs:
      "El lote no está en la lista de Newcomer. Glendale no publica el precio del espacio. Un anuncio pide <strong>$2,000</strong> por dos espacios juntos en Hillside Memorial Gardens, así que no se usa como precio de un solo lote.",
    analysisPlotEn:
      "The plot is not on the Newcomer list. Glendale does not publish the space price. One ad asks <strong>$2,000</strong> for two spaces together at Hillside Memorial Gardens, so it is not used as a one-lot price.",
    plotNew: null,
    plotResale: null,
  }),
  makeCity({
    ...shared,
    ...HERO,
    slug: "dayton",
    heroFile: "dayton-skyline",
    heroClass: "sc-hero--dayton",
    heroW: 1350,
    heroH: 900,
    nameEn: "Dayton",
    heroCaptionEs: "Centro de Dayton junto al río Great Miami",
    heroCaptionEn: "Downtown Dayton along the Great Miami River",
    countyEs: "condado de Montgomery",
    countyEn: "Montgomery County",
    metroEs: ["Dayton", "Kettering", "Huber Heights", "Germantown"],
    metroEn: ["Dayton", "Kettering", "Huber Heights", "Germantown"],
    metroTitleEs: "Dayton y el condado de Montgomery",
    metroTitleEn: "Dayton and Montgomery County",
    nearbyGuides: near("dayton"),
    homes: [lusain],
    tableFootEs:
      "Lusain: lista general vigente el 16 de marzo de 2026. No publica un paquete de cremación con memorial ni de funeral con velatorio. La columna del estimador son promedios de Ohio de Funeralocity (26 jul. 2026). Esos promedios y la lista son de funeraria. No incluyen el lote, abrir y cerrar la tumba ni la lápida. La bóveda de esa lista empieza en $1,200.",
    tableFootEn:
      "Lusain: general price list effective March 16, 2026. It does not publish a cremation-with-memorial package or a funeral-with-visitation package. The estimator column is Ohio Funeralocity averages (26 Jul 2026). Those averages and the list are funeral-home charges. They do not include the plot, opening and closing, or the marker. A vault on that list starts at $1,200.",
    faqPlotEs:
      "No. El funeral no incluye el lote. Germantown Union Cemetery, cerca de Dayton, publica tumbas base a $750, East Hill a $850 y West Twin a $1,100. Quien no es residente suma $400. Vigente el 1 de enero de 2025. Abrir una tumba de adulto es $850 aparte.",
    faqPlotEn:
      "No. The funeral does not include the plot. Germantown Union Cemetery, near Dayton, publishes base graves at $750, East Hill at $850, and West Twin at $1,100. Non-residents add $400. Effective January 1, 2025. An adult opening is $850 extra.",
    officesNoteEs:
      "Los $750 son la tumba base de Germantown Union Cemetery, no un promedio de Dayton y no el funeral. Quien no vive en el distrito suma $400.",
    officesNoteEn:
      "The $750 figure is the base grave at Germantown Union Cemetery, not a Dayton average and not the funeral. Someone who does not live in the district adds $400.",
    newListEs:
      "Germantown Union Cemetery (Resolución 2024-034, vigente el 1 de enero de 2025): tumba base $750, East Hill $850, West Twin $1,100. No residentes suman $400. Apertura de adulto entre semana $850. No es la lista de todos los cementerios de Dayton.",
    newListEn:
      "Germantown Union Cemetery (Resolution 2024-034, effective January 1, 2025): base grave $750, East Hill $850, West Twin $1,100. Non-residents add $400. Weekday adult opening $850. This is not the list for every Dayton cemetery.",
    officesEs: [
      "Germantown Union Cemetery, cerca de Dayton. Tumba base $750. No residentes +$400. Apertura de adulto $850.",
    ],
    officesEn: [
      "Germantown Union Cemetery, near Dayton. Base grave $750. Non-residents +$400. Adult opening $850.",
    ],
    analysisPlotEs:
      "El lote no está en el promedio de la funeraria. En Germantown Union Cemetery la tumba base es <strong>$750</strong>. East Hill es $850 y West Twin es $1,100. Abrir la tumba es otro cargo.",
    analysisPlotEn:
      "The plot is not in the funeral-home average. At Germantown Union Cemetery the base grave is <strong>$750</strong>. East Hill is $850 and West Twin is $1,100. Opening the grave is another charge.",
    plotNew: 750,
    plotResale: null,
  }),
];
