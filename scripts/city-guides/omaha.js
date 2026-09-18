/**
 * Omaha city-guide data. Same locked layout as Lincoln.
 * Canonical format: .cursor/rules/city-page-layout.mdc
 *
 * Locked with the template: complete first-party GPLs (burial + cremation, no blank
 * cells), analysis heading “same package name does not include the same items”,
 * phone-only official quotes, comparison legal note, and vault why-text on the calculator.
 */
function line(labelEs, labelEn, descEs, descEn, cells) {
  return { labelEs, labelEn, descEs, descEn, cells };
}

module.exports = {
  slug: "omaha",
  nameEs: "Omaha",
  nameEn: "Omaha",
  stateSlug: "nebraska",
  stateNameEs: "Nebraska",
  stateNameEn: "Nebraska",
  stateCode: "NE",
  heroFile: "omaha-bob-kerrey-bridge",
  heroCaptionEs: "Puente peatonal Bob Kerrey, Omaha",
  heroCaptionEn: "Bob Kerrey Pedestrian Bridge, Omaha",
  heroClass: "",
  heroW: 1024,
  heroH: 591,
  heroVer: "bridge-v1",
  titleEs: "Seguro de gastos finales en Omaha | Mejor Vida Seguros",
  titleEn: "Final Expense Insurance in Omaha | Mejor Vida Insurance",
  descEs:
    "Qué es el seguro de gastos finales en Omaha, listas de funerarias lado a lado, lotes y reventa, y una calculadora de cobertura. Licencia de Nebraska, NPN #21695431.",
  descEn:
    "What final expense insurance is in Omaha, side-by-side funeral-home lists, plots and resale, and a coverage calculator. Nebraska license, NPN #21695431.",
  ctaSubEs:
    "Abajo: qué es este seguro, las listas de funerarias, el lote aparte, y una calculadora de cobertura.",
  ctaSubEn:
    "Below: what this insurance is, funeral-home price lists, the plot as a separate bill, and a coverage calculator.",
  bulletsEs: [
    `Qué es el seguro de gastos finales y cómo se usa para el funeral.`,
    `Una tabla de paquetes de funerarias en Omaha, del más económico al más caro.`,
    `El lote es una factura aparte del cementerio, con anuncios de reventa que suelen costar menos.`,
    `Una calculadora para estimar el funeral, la cobertura y la prima mensual.`,
  ],
  bulletsEn: [
    `What final expense insurance is, and how it pays for a funeral.`,
    `An Omaha funeral-home package table, from the least expensive to the most expensive.`,
    `The burial plot is a separate cemetery bill, with resale listings that often cost less.`,
    `A calculator for funeral cost, coverage, and a monthly premium.`,
  ],
  metroEs: ["Omaha", "Bellevue", "Papillion", "La Vista", "Ralston", "Elkhorn"],
  metroEn: ["Omaha", "Bellevue", "Papillion", "La Vista", "Ralston", "Elkhorn"],
  metroTitleEs: "Área que atendemos en el metro de Omaha",
  metroTitleEn: "Omaha metro we serve",
  metroNoteEs:
    'Las cotizaciones oficiales son por teléfono para residentes de Nebraska en estas comunidades. No hay oficina de atención al público. Lincoln tiene <a href="lincoln.html">su propia guía</a>. Grand Island tiene <a href="grand-island.html">su propia guía</a>.',
  metroNoteEn:
    'Official quotes are by phone for Nebraska residents in these communities. There is no public walk-in office. Lincoln has <a href="lincoln.html">its own guide</a>. Grand Island has <a href="grand-island.html">its own guide</a>.',
  faqCremationEs: {
    q: "¿Cuánta cobertura suele alcanzar para una cremación en Omaha?",
    a: "Con cremación directa publicada desde $1,755 en Braman, $2,795 en Kahler-Dolce y $2,870 en John A. Gentleman, muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional suele necesitar más: la GPL de Braman pone el paquete de funeral tradicional en $5,235, sin ataúd, y el lote, la bóveda y la lápida van aparte.",
  },
  faqCremationEn: {
    q: "How much coverage is usually enough for cremation in Omaha?",
    a: "With direct cremation published from $1,755 at Braman, $2,795 at Kahler-Dolce, and $2,870 at John A. Gentleman, many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial often needs more: Braman’s GPL lists the traditional funeral package at $5,235, with no casket, and the plot, vault, and marker are extra.",
  },
  faqPrepaidEs: {
    q: "¿Cuál es la diferencia entre un funeral prepagado y este seguro?",
    a: "El prepagado se ata a una funeraria o a un lote y puede fijar ese precio. El seguro de gastos finales paga efectivo a su beneficiario: puede usarlo en Braman, Kahler-Dolce, John A. Gentleman, Westlawn-Hillcrest, Forest Lawn, o en otros gastos finales.",
  },
  faqPrepaidEn: {
    q: "What is the difference between a prepaid funeral and this insurance?",
    a: "A prepaid plan is tied to one funeral home or plot and may lock that price. Final expense insurance pays cash to your beneficiary. They can use it at Braman, Kahler-Dolce, John A. Gentleman, Westlawn-Hillcrest, Forest Lawn, or for other final bills.",
  },
  faqPlotEs: {
    q: "¿El funeral incluye el lote del cementerio?",
    a: "No. El precio de la funeraria es una factura. El lote es otra. En Westlawn-Hillcrest el terreno empieza en $2,495. Pida la lista en la oficina (402-556-2500). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  },
  faqPlotEn: {
    q: "Does the funeral include the cemetery plot?",
    a: "No. The funeral home price is one bill. The plot is another. At Westlawn-Hillcrest, ground burial property starts at $2,495. Ask the cemetery office for its list (402-556-2500). Resale plots can cost less; the cemetery still has to change the deed.",
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
    resaleJson: "data/omaha-plot-resales.json",
    resaleNoscriptHref: "https://eturnalrest.com/cemeteries/ne/westlawn-hillcrest-memorial-park-omaha/",
    tableFootEs:
      "Braman: GPL vigente 9 ene. 2026. Kahler-Dolce: GPL Dignity vigente 9 jun. 2026. John A. Gentleman: GPL vigente 6 feb. 2026. Estimador: promedios de Nebraska que usa el estimador. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
    tableFootEn:
      "Braman: GPL effective 9 Jan 2026. Kahler-Dolce: Dignity GPL effective 9 Jun 2026. John A. Gentleman: GPL effective 6 Feb 2026. Estimator: Nebraska averages the estimator uses. Always ask for the current list. These are not Mejor Vida Insurance prices.",
    compareLeadEs: "El salto grande es el paquete de servicios. El ataúd solo va si esa casa lo dice; el lote nunca.",
    compareLeadEn: "The real gap is the service package. A casket is included only when that home’s package says so; the plot never is.",
    officesNoteEs:
      "Westlawn-Hillcrest sí publica un precio de partida para el terreno. Forest Lawn y los cementerios católicos no publican cifras. Llame y pida la lista actual por escrito.",
    officesNoteEn:
      "Westlawn-Hillcrest does publish a starting price for ground burial. Forest Lawn and the Catholic cemeteries do not post figures. Call and ask for the current list in writing.",
    newListEs:
      "Westlawn-Hillcrest publica el terreno desde <strong>$2,495</strong> (propiedad de cementerio Dignity). Abrir y cerrar, bóveda y lápida siguen aparte. Quienes revenden en ese parque suelen pedir menos que la lista del cementerio.",
    newListEn:
      "Westlawn-Hillcrest publishes ground burial property from <strong>$2,495</strong> (Dignity cemetery property). Opening and closing, the vault, and the marker are still extra. People reselling spaces in that park usually ask less than the cemetery’s list.",
    officesEs: [
      "<strong>Westlawn-Hillcrest Memorial Park</strong> — 5701 Center St. Misma oficina que la funeraria Dignity. Teléfono 402-556-2500.",
      "<strong>Forest Lawn Memorial Park</strong> — 7909 Mormon Bridge Rd. Teléfono 402-451-1000. No publican el lote en la web; hay que llamar.",
      "<strong>Cementerios católicos de la Arquidiócesis de Omaha</strong> — Calvary, Resurrection y otros. Línea de consejería 402-391-3711. Pida mapa y precios; no publican cifras en internet.",
    ],
    officesEn: [
      "<strong>Westlawn-Hillcrest Memorial Park</strong> — 5701 Center St. Same office as the Dignity funeral home. Phone 402-556-2500.",
      "<strong>Forest Lawn Memorial Park</strong> — 7909 Mormon Bridge Rd. Phone 402-451-1000. They do not post plot prices on the website; you have to call.",
      "<strong>Catholic Cemeteries of the Archdiocese of Omaha</strong> — Calvary, Resurrection, and others. Counselor line 402-391-3711. Ask for a map and prices; they do not publish figures online.",
    ],
    resaleFootEs:
      "Son precios pedidos, no una oferta de Mejor Vida Seguros. Algunas fichas de producto en Eturnal Rest ya aparecen agotadas; confirme con el vendedor y con el cementerio.",
    resaleFootEn:
      "These are asking prices, not a Mejor Vida Insurance offer. Some Eturnal Rest product pages already show sold out; confirm with the seller and the cemetery.",
    analysisEs: [
      {
        h: "Empiece por el paquete más barato",
        p: "La cremación directa es el atajo más barato que publican: <strong>$1,755</strong> en Braman (crematorio aparte), <strong>$2,795</strong> en Kahler-Dolce y <strong>$2,870</strong> en John A. Gentleman. El estimador usa <strong>$2,958</strong> para Nebraska. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
      },
      {
        h: "El mismo nombre de paquete no incluye lo mismo",
        p: "El memorial de Braman en su GPL es <strong>$3,480</strong>. Kahler-Dolce publica Tribute Cremation a <strong>$4,875</strong> (urna incluida). Gentleman publica Gathering and Memorial Service a <strong>$4,975</strong>. El funeral tradicional de Braman es <strong>$5,235</strong> sin ataúd; el de Gentleman, <strong>$6,585</strong> sin ataúd. El paquete Tribute Funeral de Kahler-Dolce es <strong>$11,665</strong> e incluye ataúd. El promedio de entierro completo de Nebraska (<strong>$8,620</strong>) suele incluir ataúd.",
      },
      {
        h: "El lote nunca va en estos paquetes",
        p: "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. En Westlawn-Hillcrest el terreno empieza en <strong>$2,495</strong>. Eso se pide en la oficina: 402-556-2500.",
      },
      {
        h: "Use el estimador para los extras",
        p: "Flores, certificados, papelería, honorario, catering y varios casi nunca vienen en el paquete. El <a href=\"__ESTIMATOR_HREF__\">estimador de gastos finales</a> los suma aparte, en los mismos campos.",
      },
    ],
    analysisEn: [
      {
        h: "Start with the least expensive package",
        p: "Direct cremation is the cheapest published shortcut: <strong>$1,755</strong> at Braman (crematory extra), <strong>$2,795</strong> at Kahler-Dolce, and <strong>$2,870</strong> at John A. Gentleman. The estimator uses <strong>$2,958</strong> for Nebraska. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
      },
      {
        h: "The same package name does not include the same items",
        p: "Braman’s memorial on its GPL is <strong>$3,480</strong>. Kahler-Dolce publishes Tribute Cremation at <strong>$4,875</strong> (urn included). Gentleman publishes Gathering and Memorial Service at <strong>$4,975</strong>. Braman’s traditional funeral is <strong>$5,235</strong> with no casket; Gentleman’s is <strong>$6,585</strong> with no casket. Kahler-Dolce’s Tribute Funeral package is <strong>$11,665</strong> and includes a casket. Nebraska’s full-burial average (<strong>$8,620</strong>) usually includes a casket.",
      },
      {
        h: "The plot is never in these packages",
        p: "None of the figures in the table are cemetery property or opening/closing. At Westlawn-Hillcrest, ground burial property starts at <strong>$2,495</strong>. Ask the office: 402-556-2500.",
      },
      {
        h: "Use the estimator for the extras",
        p: "Flowers, death certificates, stationery, honorarium, catering, and miscellaneous almost never come in the package. The <a href=\"__ESTIMATOR_HREF__\">final expense estimator</a> adds them separately, in those same fields.",
      },
    ],
    homes: [
      {
        id: "braman",
        name: "Braman Mortuary",
        href: "https://irp.cdn-website.com/b38c7506/files/uploaded/Braman+GPL+Jan+2026.pdf",
        addr: "1702 N 72nd St · 402-391-2171",
      },
      {
        id: "kahler",
        name: "Kahler-Dolce",
        href: "https://www.dignitymemorial.com/funeral-homes/nebraska/papillion/kahler-dolce-mortuary/1697/costs",
        addr: "441 N Washington St, Papillion · 402-339-3232",
      },
      {
        id: "gentleman",
        name: "John A. Gentleman",
        href: "https://www.johnagentleman.com/services/pricing",
        addr: "1010 N 72nd St · 402-205-3604",
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
          braman: { amt: 1755, es: "GPL 9 ene. 2026, contenedor del comprador. Crematorio $405 aparte.", en: "GPL 9 Jan 2026, purchaser container. Crematory fee $405 extra." },
          kahler: { amt: 2795, es: "GPL Dignity 9 jun. 2026, contenedor del comprador. Crematorio incluido.", en: "Dignity GPL 9 Jun 2026, purchaser container. Crematory included." },
          gentleman: { amt: 2870, es: "GPL 6 feb. 2026, contenedor del comprador. Incluye crematorio.", en: "GPL 6 Feb 2026, purchaser container. Crematory included." },
          us: { amt: 2958, es: "Promedio de Nebraska (Funeralocity), el mismo que usa el estimador.", en: "Nebraska average (Funeralocity), the same figure the estimator uses." },
        }
      ),
      line(
        "Entierro inmediato",
        "Immediate burial",
        "Gastos de funeraria para un entierro sin velatorio ni ceremonia: traslado, servicios mínimos del director y transporte al cementerio. No incluye ataúd, bóveda, propiedad en cementerio, apertura/cierre, flores, certificados, papelería, honorario, catering ni varios.",
        "Funeral home expenses for a burial with no visitation or ceremony: transfer, minimum director services, and transport to the cemetery. Does not include a casket, vault, cemetery property, opening/closing, flowers, death certificates, stationery, honorarium, catering, or miscellaneous.",
        {
          braman: { amt: 2440, es: "GPL 9 ene. 2026, contenedor del comprador. Ataúd y lote aparte.", en: "GPL 9 Jan 2026, purchaser container. Casket and plot extra." },
          kahler: { amt: 4150, es: "GPL Dignity 9 jun. 2026, contenedor del comprador. Ataúd y lote aparte.", en: "Dignity GPL 9 Jun 2026, purchaser container. Casket and plot extra." },
          gentleman: { amt: 3745, es: "GPL 6 feb. 2026, contenedor del comprador. Ataúd y lote aparte.", en: "GPL 6 Feb 2026, purchaser container. Casket and plot extra." },
          us: { amt: 5467, es: "Promedio de Nebraska (Funeralocity); suele incluir un ataúd básico.", en: "Nebraska average (Funeralocity); often includes a basic casket." },
        }
      ),
      line(
        "Cremación con memorial",
        "Cremation with memorial",
        "Gastos de funeraria para cremación más un memorial o reunión sencilla (sin ataúd presente). En algunas casas la urna va incluida. Propiedad en cementerio, flores, certificados, honorario, catering y varios suelen ir aparte.",
        "Funeral home expenses for cremation plus a memorial or simple gathering (no casket present). An urn is included at some homes. Cemetery property, flowers, death certificates, honorarium, catering, and miscellaneous are usually extra.",
        {
          braman: { amt: 3480, es: "Paquete Direct Cremation with Memorial Service. Crematorio, urna y contenedor aparte.", en: "Direct Cremation with Memorial Service package. Crematory, urn, and container extra." },
          kahler: { amt: 4875, es: "Paquete Tribute Cremation: reunión sencilla, urna y contenedor. No es suma de la GPL.", en: "Tribute Cremation package: simple gathering, urn, and container. Not a GPL sum." },
          gentleman: { amt: 4975, es: "Gathering and Memorial Service Cremation. Incluye crematorio. Urna aparte.", en: "Gathering and Memorial Service Cremation. Crematory included. Urn extra." },
          us: { amt: 6530, es: "Cremación completa de Nebraska (Funeralocity); suele incluir velatorio y ataúd de cremación.", en: "Nebraska full cremation (Funeralocity); typically viewing and a cremation casket." },
        }
      ),
      line(
        "Funeral tradicional con velatorio",
        "Traditional funeral with visitation",
        "Gastos de funeraria para un funeral con visita: director y personal, traslado, embalsamado y arreglo, velatorio, ceremonia y carroza. El ataúd solo va si el paquete de esa casa lo dice (Tribute de Kahler-Dolce sí). Bóveda, propiedad en cementerio, apertura/cierre y la mayoría de extras no van incluidos.",
        "Funeral home expenses for a funeral with visitation: director and staff, transfer, embalming and preparation, viewing, the ceremony, and a hearse. A casket is included only if that home’s package says so (Kahler-Dolce Tribute does). Vault, cemetery property, opening/closing, and most extras are not included.",
        {
          braman: { amt: 5235, es: "Paquete Traditional Funeral Service. Ataúd, bóveda y lote aparte.", en: "Traditional Funeral Service package. Casket, vault, and plot extra." },
          kahler: { amt: 11665, es: "Paquete Tribute Funeral: ya incluye ataúd de $2,795. Sin bóveda ni lote.", en: "Tribute Funeral package: already includes a $2,795 casket. No vault or plot." },
          gentleman: { amt: 6585, es: "Traditional Funeral Service. Ataúd, bóveda y lote aparte.", en: "Traditional Funeral Service. Casket, vault, and plot extra." },
          us: { amt: 8620, es: "Entierro completo de Nebraska (Funeralocity); ya mete un ataúd típico.", en: "Nebraska full burial (Funeralocity); already puts in a typical casket." },
        }
      ),
    ],
    calc: {
      defaultService: "directCremation",
      defaultHome: "braman",
      plotNew: 2495,
      plotResale: 1800,
      vault: 1495,
      casketTypical: 2500,
      gpl: {
        braman: { directCremation: 1755, memorialCremation: 3480, immediateBurial: 2440, traditional: 5235 },
        kahler: { directCremation: 2795, memorialCremation: 4875, immediateBurial: 4150, traditional: 11665 },
        gentleman: { directCremation: 2870, memorialCremation: 4975, immediateBurial: 3745, traditional: 6585 },
        us: { directCremation: 2958, memorialCremation: 6530, immediateBurial: 5467, traditional: 8620 },
      },
      homeIncludesCasket: {
        kahler: ["traditional", "memorialCremation"],
        us: ["memorialCremation", "immediateBurial", "traditional"],
      },
      homeLabels: {
        braman: { en: "Braman Mortuary", es: "Braman Mortuary" },
        kahler: { en: "Kahler-Dolce", es: "Kahler-Dolce" },
        gentleman: { en: "John A. Gentleman", es: "John A. Gentleman" },
        us: { en: "Estimator (Nebraska)", es: "Estimador (Nebraska)" },
      },
    },
  },
};
