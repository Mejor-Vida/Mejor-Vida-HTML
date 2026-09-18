/**
 * Grand Island city-guide data. Same locked layout as Lincoln.
 * Canonical format: .cursor/rules/city-page-layout.mdc
 *
 * Local homes bury and cremate. They do not post a GPL PDF on their own
 * sites; package figures are from each home’s compiled general price list
 * (17 Sep 2026). Casket is extra on named-home columns unless noted.
 */
function line(labelEs, labelEn, descEs, descEn, cells) {
  return { labelEs, labelEn, descEs, descEn, cells };
}

module.exports = {
  slug: "grand-island",
  nameEs: "Grand Island",
  nameEn: "Grand Island",
  stateSlug: "nebraska",
  stateNameEs: "Nebraska",
  stateNameEn: "Nebraska",
  stateCode: "NE",
  heroFile: "grand-island-welcome-sign",
  heroCaptionEs: "Letrero de bienvenida a Grand Island",
  heroCaptionEn: "Welcome to Grand Island sign",
  heroClass: "sc-hero--grand-island",
  heroW: 1024,
  heroH: 633,
  heroVer: "sign-v1",
  titleEs: "Seguro de gastos finales y de entierro en Grand Island | Mejor Vida Seguros",
  titleEn: "Final expense and burial insurance in Grand Island | Mejor Vida Insurance",
  descEs:
    "Seguro de gastos finales, de entierro o funeral en Grand Island, Alda, Cairo y Doniphan: funerarias, lotes y cotización por teléfono. Licencia de Nebraska, NPN #21695431.",
  descEn:
    "Final expense, burial, or funeral insurance in Grand Island, Alda, Cairo, and Doniphan: funeral-home lists, plots, and a phone quote. Nebraska license, NPN #21695431.",
  ctaSubEs:
    "Abajo: qué es este seguro, las listas de funerarias, el lote aparte, y una calculadora de cobertura.",
  ctaSubEn:
    "Below: what this insurance is, funeral-home price lists, the plot as a separate bill, and a coverage calculator.",
  bulletsEs: [
    `Qué es el seguro de gastos finales — también llamado de entierro o funeral — y cómo se usa para el funeral.`,
    `Una tabla de paquetes de funerarias en Grand Island, del más económico al más caro.`,
    `El lote es una factura aparte del cementerio, con anuncios de reventa que suelen costar menos.`,
    `Una calculadora para estimar el funeral, la cobertura y la prima mensual.`,
  ],
  bulletsEn: [
    `What final expense insurance is — also called burial or funeral insurance — and how it pays for a funeral.`,
    `A Grand Island funeral-home package table, from the least expensive to the most expensive.`,
    `The burial plot is a separate cemetery bill, with resale listings that often cost less.`,
    `A calculator for funeral cost, coverage, and a monthly premium.`,
  ],
  countyEs: "condado Hall",
  countyEn: "Hall County",
  metroEs: ["Grand Island", "Alda", "Cairo", "Doniphan", "Wood River", "St. Libory"],
  metroEn: ["Grand Island", "Alda", "Cairo", "Doniphan", "Wood River", "St. Libory"],
  metroTitleEs: "Área que atendemos en Grand Island",
  metroTitleEn: "Grand Island area we serve",
  metroNoteEs:
    'Las cotizaciones oficiales son por teléfono para residentes de Nebraska en estas comunidades del condado Hall. No hay oficina de atención al público. Lincoln tiene <a href="lincoln.html">su propia guía</a>. Omaha tiene <a href="omaha.html">su propia guía</a>.',
  metroNoteEn:
    'Official quotes are by phone for Nebraska residents in these Hall County communities. There is no public walk-in office. Lincoln has <a href="lincoln.html">its own guide</a>. Omaha has <a href="omaha.html">its own guide</a>.',
  faqCremationEs: {
    q: "¿Cuánta cobertura suele alcanzar para una cremación en Grand Island?",
    a: "Con cremación directa publicada desde $1,840 en Livingston-Sondermann, $2,270 en All Faiths y $3,000 en Apfel, muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional suele necesitar más: el paquete de All Faiths está en $3,845 sin ataúd, y el lote, la bóveda y la lápida van aparte.",
  },
  faqCremationEn: {
    q: "How much coverage is usually enough for cremation in Grand Island?",
    a: "With direct cremation published from $1,840 at Livingston-Sondermann, $2,270 at All Faiths, and $3,000 at Apfel, many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial often needs more: All Faiths’ traditional package is $3,845 with no casket, and the plot, vault, and marker are extra.",
  },
  faqPrepaidEs: {
    q: "¿Cuál es la diferencia entre un funeral prepagado y este seguro?",
    a: "El prepagado se ata a una funeraria o a un lote y puede fijar ese precio. El seguro de gastos finales paga efectivo a su beneficiario: puede usarlo en Livingston-Sondermann, All Faiths, Apfel, Westlawn Memorial Park, el cementerio municipal, o en otros gastos finales.",
  },
  faqPrepaidEn: {
    q: "What is the difference between a prepaid funeral and this insurance?",
    a: "A prepaid plan is tied to one funeral home or plot and may lock that price. Final expense insurance pays cash to your beneficiary. They can use it at Livingston-Sondermann, All Faiths, Apfel, Westlawn Memorial Park, the city cemetery, or for other final bills.",
  },
  faqPlotEs: {
    q: "¿El funeral incluye el lote del cementerio?",
    a: "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en Westlawn Memorial Park (308-381-2420) o en el cementerio municipal (308-385-5359). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  },
  faqPlotEn: {
    q: "Does the funeral include the cemetery plot?",
    a: "No. The funeral home price is one bill. The plot is another. Ask Westlawn Memorial Park (308-381-2420) or the city cemetery (308-385-5359) for its list. Resale plots can cost less; the cemetery still has to change the deed.",
  },
  faqCalcEs: {
    q: "¿Cómo uso la calculadora de esta página?",
    a: "Está al final. Indique edad, sexo y si fuma. Elija el servicio y la funeraria. Verá un funeral estimado, una cobertura y una prima mensual de las tarifas de compañías designadas. Luego llame para una cotización oficial.",
  },
  faqCalcEn: {
    q: "How do I use the calculator on this page?",
    a: "It is at the bottom. Enter age, sex, and whether you smoke. Pick the service and funeral home. You will see an estimated funeral, suggested coverage, and a monthly premium from appointed-company rate charts. Then call for an official quote.",
  },
  guide: {
    resaleJson: "data/grand-island-plot-resales.json",
    resaleNoscriptHref: "https://eturnalrest.com/cemeteries/ne/westlawn-memorial-park-grand-island/",
    tableFootEs:
      "Livingston-Sondermann, All Faiths y Apfel no publican la GPL en su web; cifras de cada lista general compiladas el 17 sep. 2026. El ataúd no va en esos paquetes. Estimador: promedios de Nebraska que usa el estimador. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
    tableFootEn:
      "Livingston-Sondermann, All Faiths, and Apfel do not post a GPL on their websites; figures are from each home’s general price list as compiled 17 Sep 2026. A casket is not in those packages. Estimator: Nebraska averages the estimator uses. Always ask for the current list. These are not Mejor Vida Insurance prices.",
    compareLeadEs: "El salto grande es el paquete de servicios. El ataúd solo va si esa casa lo dice; el lote nunca.",
    compareLeadEn: "The real gap is the service package. A casket is included only when that home’s package says so; the plot never is.",
    officesNoteEs:
      "Westlawn Memorial Park y el cementerio municipal no publican el lote en la web. El cementerio de veteranos no cobra a quienes califican. Llame y pida la lista actual por escrito.",
    officesNoteEn:
      "Westlawn Memorial Park and the city cemetery do not post plot prices online. The veterans cemetery does not charge eligible veterans. Call and ask for the current list in writing.",
    newListEs:
      "Westlawn Memorial Park no publica un precio de partida. Estimaciones de terceros ponen un espacio nuevo entre <strong>$2,150 y $3,950</strong>. Lo que más se oye ronda los <strong>$3,000</strong>. Abrir y cerrar, bóveda y lápida siguen aparte. Pida la lista: 308-381-2420.",
    newListEn:
      "Westlawn Memorial Park does not publish a starting price. Third-party estimates put a new space between <strong>$2,150 and $3,950</strong>. <strong>About $3,000</strong> is the number that comes up most. Opening and closing, the vault, and the marker are still extra. Ask for the list: 308-381-2420.",
    officesEs: [
      "<strong>Westlawn Memorial Park</strong> — 3826 W Stolley Park Rd, mismo terreno que Livingston-Sondermann. Teléfono 308-381-2420.",
      "<strong>Cementerio municipal de Grand Island</strong> — 3168 W Stolley Park Rd. Teléfono 308-385-5359. No publican el lote en la web; hay que llamar.",
      "<strong>Cementerio de Veteranos de Nebraska en Grand Island</strong> — 3270 W Capital Ave. Teléfono 308-661-1987. No hay cuotas para veteranos y dependientes que califican.",
    ],
    officesEn: [
      "<strong>Westlawn Memorial Park</strong> — 3826 W Stolley Park Rd, same grounds as Livingston-Sondermann. Phone 308-381-2420.",
      "<strong>Grand Island City Cemetery</strong> — 3168 W Stolley Park Rd. Phone 308-385-5359. They do not post plot prices on the website; you have to call.",
      "<strong>Nebraska Veterans Cemetery at Grand Island</strong> — 3270 W Capital Ave. Phone 308-661-1987. There are no fees for eligible veterans and dependents.",
    ],
    resaleFootEs:
      "Son precios pedidos, no una oferta de Mejor Vida Seguros. El tablero de Westlawn Memorial Park en Eturnal Rest no tiene anuncios activos ahora; un anuncio a $500 por espacio ya aparece agotado.",
    resaleFootEn:
      "These are asking prices, not a Mejor Vida Insurance offer. The Westlawn Memorial Park board on Eturnal Rest has no live ads right now; a $500-per-space listing is already marked sold.",
    analysisEs: [
      {
        h: "Empiece por el paquete más barato",
        p: "La cremación directa es el atajo más barato que publican: <strong>$1,840</strong> en Livingston-Sondermann, <strong>$2,270</strong> en All Faiths y <strong>$3,000</strong> en Apfel. El estimador usa <strong>$2,958</strong> para Nebraska. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
      },
      {
        h: "El mismo nombre de paquete no incluye lo mismo",
        p: "El funeral tradicional de All Faiths (<strong>$3,845</strong>) y el de Livingston-Sondermann (<strong>$3,730</strong>) son servicios, sin ataúd. El de Apfel (<strong>$4,635</strong>) también va sin ataúd. El promedio de entierro completo de Nebraska (<strong>$8,620</strong>) suele incluir ataúd.",
      },
      {
        h: "El lote nunca va en estos paquetes",
        p: "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Eso se pide en la oficina. En Westlawn Memorial Park no hay lista en la web; llame al <strong>308-381-2420</strong>.",
      },
      {
        h: "Use el estimador para los extras",
        p: "Flores, certificados, papelería, honorario, catering y varios casi nunca vienen en el paquete. El <a href=\"__ESTIMATOR_HREF__\">estimador de gastos finales</a> los suma aparte, en los mismos campos.",
      },
    ],
    analysisEn: [
      {
        h: "Start with the least expensive package",
        p: "Direct cremation is the cheapest published shortcut: <strong>$1,840</strong> at Livingston-Sondermann, <strong>$2,270</strong> at All Faiths, and <strong>$3,000</strong> at Apfel. The estimator uses <strong>$2,958</strong> for Nebraska. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
      },
      {
        h: "The same package name does not include the same items",
        p: "All Faiths’ traditional funeral (<strong>$3,845</strong>) and Livingston-Sondermann’s (<strong>$3,730</strong>) are services, with no casket. Apfel’s (<strong>$4,635</strong>) is also without a casket. Nebraska’s full-burial average (<strong>$8,620</strong>) usually includes a casket too.",
      },
      {
        h: "The plot is never in these packages",
        p: "None of the figures in the table are cemetery property or opening/closing. Ask the cemetery office. Westlawn Memorial Park does not post a list online; call <strong>308-381-2420</strong>.",
      },
      {
        h: "Use the estimator for the extras",
        p: "Flowers, death certificates, stationery, honorarium, catering, and miscellaneous almost never come in the package. The <a href=\"__ESTIMATOR_HREF__\">final expense estimator</a> adds them separately, in those same fields.",
      },
    ],
    homes: [
      {
        id: "livson",
        name: "Livingston-Sondermann",
        href: "https://www.livson.com/",
        addr: "3826 W Stolley Park Rd · 308-382-7070",
      },
      {
        id: "faiths",
        name: "All Faiths",
        href: "https://www.giallfaiths.com/",
        addr: "2929 S Locust St · 308-398-2929",
      },
      {
        id: "apfel",
        name: "Apfel",
        href: "https://www.apfelfuneralhome.com/",
        addr: "1123 W 2nd St · 308-384-0590",
      },
      {
        id: "us",
        estimator: true,
        nameEs: "Estimador (Nebraska)",
        nameEn: "Estimator (Nebraska)",
        addrEs: "Promedios Funeralocity de Nebraska",
        addrEn: "Nebraska Funeralocity averages",
      },
    ],
    packages: [
      line(
        "Cremación directa",
        "Direct cremation",
        "Gastos de funeraria para una cremación sin velatorio ni ceremonia: traslado, servicios mínimos del director y tarifa del crematorio. No incluye urna, flores, certificados de defunción, papelería, honorario, catering, varios ni propiedad en cementerio.",
        "Funeral home expenses for a cremation with no viewing or ceremony: transfer, minimum director services, and the crematory fee. Does not include an urn, flowers, death certificates, stationery, honorarium, catering, miscellaneous, or cemetery property.",
        {
          livson: { amt: 1840, es: "Cremación directa publicada. Urna aparte.", en: "Published direct cremation. Urn extra." },
          faiths: { amt: 2270, es: "Cremación directa publicada. Urna aparte.", en: "Published direct cremation. Urn extra." },
          apfel: { amt: 3000, es: "Cremación directa publicada. Urna aparte.", en: "Published direct cremation. Urn extra." },
          us: { amt: 2958, es: "Promedio de Nebraska (Funeralocity), el mismo que usa el estimador.", en: "Nebraska average (Funeralocity), the same figure the estimator uses." },
        }
      ),
      line(
        "Entierro inmediato",
        "Immediate burial",
        "Gastos de funeraria para un entierro sin velatorio ni ceremonia: traslado, servicios mínimos del director y transporte al cementerio. No incluye ataúd, bóveda, propiedad en cementerio, apertura/cierre, flores, certificados, papelería, honorario, catering ni varios.",
        "Funeral home expenses for a burial with no visitation or ceremony: transfer, minimum director services, and transport to the cemetery. Does not include a casket, vault, cemetery property, opening/closing, flowers, death certificates, stationery, honorarium, catering, or miscellaneous.",
        {
          livson: { amt: 1770, es: "Servicios básicos y traslado. Ataúd y lote aparte.", en: "Basic services and transfer. Casket and plot extra." },
          faiths: { amt: 2340, es: "Servicios básicos y traslado. Ataúd y lote aparte.", en: "Basic services and transfer. Casket and plot extra." },
          apfel: { amt: 3515, es: "Entierro directo publicado. Ataúd y lote aparte.", en: "Published direct burial. Casket and plot extra." },
          us: { amt: 5467, es: "Promedio de Nebraska (Funeralocity); suele incluir un ataúd básico.", en: "Nebraska average (Funeralocity); often includes a basic casket." },
        }
      ),
      line(
        "Cremación con memorial",
        "Cremation with memorial",
        "Gastos de funeraria para cremación más un memorial o reunión sencilla (sin ataúd presente). En algunas casas la urna va incluida. Propiedad en cementerio, flores, certificados, honorario, catering y varios suelen ir aparte.",
        "Funeral home expenses for cremation plus a memorial or simple gathering (no casket present). An urn is included at some homes. Cemetery property, flowers, death certificates, honorarium, catering, and miscellaneous are usually extra.",
        {
          livson: { amt: 3730, es: "Memorial publicado. Urna aparte.", en: "Published memorial. Urn extra." },
          faiths: { amt: 3845, es: "Memorial publicado. Urna aparte.", en: "Published memorial. Urn extra." },
          apfel: { amt: 3940, es: "Memorial publicado. Urna aparte.", en: "Published memorial. Urn extra." },
          us: { amt: 6530, es: "Cremación completa de Nebraska (Funeralocity); suele incluir velatorio y ataúd de cremación.", en: "Nebraska full cremation (Funeralocity); typically viewing and a cremation casket." },
        }
      ),
      line(
        "Funeral tradicional con velatorio",
        "Traditional funeral with visitation",
        "Gastos de funeraria para un funeral con visita: director y personal, traslado, embalsamado y arreglo, velatorio, ceremonia y carroza. El ataúd solo va si el paquete de esa casa lo dice. Bóveda, propiedad en cementerio, apertura/cierre y la mayoría de extras no van incluidos.",
        "Funeral home expenses for a funeral with visitation: director and staff, transfer, embalming and preparation, viewing, the ceremony, and a hearse. A casket is included only if that home’s package says so. Vault, cemetery property, opening/closing, and most extras are not included.",
        {
          livson: { amt: 3730, es: "Funeral con velatorio. Ataúd y lote aparte.", en: "Funeral with visitation. Casket and plot extra." },
          faiths: { amt: 3845, es: "Funeral con velatorio. Ataúd y lote aparte.", en: "Funeral with visitation. Casket and plot extra." },
          apfel: { amt: 4635, es: "Funeral con velatorio. Ataúd y lote aparte.", en: "Funeral with visitation. Casket and plot extra." },
          us: { amt: 8620, es: "Entierro completo de Nebraska (Funeralocity); ya mete un ataúd típico.", en: "Nebraska full burial (Funeralocity); already puts in a typical casket." },
        }
      ),
    ],
    calc: {
      defaultService: "directCremation",
      defaultHome: "livson",
      plotNew: 3000,
      plotResale: 1000,
      vault: 1495,
      casketTypical: 2500,
      gpl: {
        livson: { directCremation: 1840, memorialCremation: 3730, immediateBurial: 1770, traditional: 3730 },
        faiths: { directCremation: 2270, memorialCremation: 3845, immediateBurial: 2340, traditional: 3845 },
        apfel: { directCremation: 3000, memorialCremation: 3940, immediateBurial: 3515, traditional: 4635 },
        us: { directCremation: 2958, memorialCremation: 6530, immediateBurial: 5467, traditional: 8620 },
      },
      homeIncludesCasket: {
        us: ["memorialCremation", "immediateBurial", "traditional"],
      },
      homeLabels: {
        livson: { en: "Livingston-Sondermann", es: "Livingston-Sondermann" },
        faiths: { en: "All Faiths", es: "All Faiths" },
        apfel: { en: "Apfel", es: "Apfel" },
        us: { en: "Estimator (Nebraska)", es: "Estimador (Nebraska)" },
      },
    },
  },
};
