/**
 * Lincoln city-guide data. Copy this file for a new city; do not invent a new layout.
 * Canonical format: .cursor/rules/city-page-layout.mdc
 */
const NPN = "21695431";

function line(labelEs, labelEn, descEs, descEn, cells) {
  return { labelEs, labelEn, descEs, descEn, cells };
}

module.exports = {
  slug: "lincoln",
  nameEs: "Lincoln",
  nameEn: "Lincoln",
  stateSlug: "nebraska",
  stateNameEs: "Nebraska",
  stateNameEn: "Nebraska",
  stateCode: "NE",
  heroFile: "lincoln-state-capitol",
  heroCaptionEs: "Capitolio de Nebraska, Lincoln",
  heroCaptionEn: "Nebraska State Capitol, Lincoln",
  heroClass: "sc-hero--lincoln",
  heroW: 1024,
  heroH: 714,
  heroVer: "capitol-v1",
  titleEs: "Seguro de gastos finales en Lincoln | Mejor Vida Seguros",
  titleEn: "Final Expense Insurance in Lincoln | Mejor Vida Insurance",
  descEs:
    "Qué es el seguro de gastos finales en Lincoln, listas de funerarias lado a lado, lotes y reventa, y una calculadora de cobertura. Licencia de Nebraska, NPN #21695431.",
  descEn:
    "What final expense insurance is in Lincoln, side-by-side funeral-home lists, plots and resale, and a coverage calculator. Nebraska license, NPN #21695431.",
  ctaSubEs:
    "Abajo: qué es este seguro, las listas de funerarias, el lote aparte, y una calculadora de cobertura.",
  ctaSubEn:
    "Below: what this insurance is, funeral-home price lists, the plot as a separate bill, and a coverage calculator.",
  bulletsEs: [
    `Qué es el seguro de gastos finales y cómo se usa para el funeral.`,
    `Una tabla de paquetes de funerarias en Lincoln, del más económico al más caro.`,
    `Por qué el lote no entra en la lista de precios, y anuncios de reventa más baratos.`,
    `Una calculadora para estimar el funeral, la cobertura y la prima mensual.`,
  ],
  bulletsEn: [
    `What final expense insurance is, and how it pays for a funeral.`,
    `A Lincoln funeral-home package table, from the least expensive to the most expensive.`,
    `Why the burial plot is not on the funeral price list, plus lower-cost resale ads.`,
    `A calculator for funeral cost, coverage, and a monthly premium.`,
  ],
  metroEs: ["Lincoln", "Hickman", "Waverly", "Roca", "Bennet", "Malcolm"],
  metroEn: ["Lincoln", "Hickman", "Waverly", "Roca", "Bennet", "Malcolm"],
  metroTitleEs: "Área que atendemos en Lincoln",
  metroTitleEn: "Lincoln area we serve",
  metroNoteEs:
    'Cotizamos por teléfono, WhatsApp y en línea a residentes de Nebraska en estas comunidades del condado Lancaster. No hay oficina de atención al público. Omaha tiene <a href="omaha.html">su propia guía</a>.',
  metroNoteEn:
    'We quote by phone, WhatsApp, and online for Nebraska residents in these Lancaster County communities. There is no public walk-in office. Omaha has <a href="omaha.html">its own guide</a>.',
  faqCremationEs: {
    q: "¿Cuánta cobertura suele alcanzar para una cremación en Lincoln?",
    a: "Con cremación directa publicada desde $1,595 en Alternative y desde $3,910 en Lincoln Memorial, muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional en Lincoln Memorial suele necesitar más: el paquete Tribute empieza en $11,935 y el lote, la bóveda y la lápida van aparte.",
  },
  faqCremationEn: {
    q: "How much coverage is usually enough for cremation in Lincoln?",
    a: "With direct cremation published from $1,595 at Alternative and from $3,910 at Lincoln Memorial, many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial at Lincoln Memorial often needs more: the Tribute package starts at $11,935, and the plot, vault, and marker are extra.",
  },
  faqPrepaidEs: {
    q: "¿Cuál es la diferencia entre un funeral prepagado y este seguro?",
    a: "El prepagado se ata a una funeraria o a un lote y puede fijar ese precio. El seguro de gastos finales paga efectivo a su beneficiario: puede usarlo en Lincoln Memorial, Alternative Funeral, Wyuka, Calvary, o en otros gastos finales.",
  },
  faqPrepaidEn: {
    q: "What is the difference between a prepaid funeral and this insurance?",
    a: "A prepaid plan is tied to one funeral home or plot and may lock that price. Final expense insurance pays cash to your beneficiary. They can use it at Lincoln Memorial, Alternative Funeral, Wyuka, Calvary, or for other final bills.",
  },
  faqPlotEs: {
    q: "¿El funeral incluye el lote del cementerio?",
    a: "No. El precio de la funeraria es una factura. El lote es otra. Pida la lista en la oficina del cementerio (Lincoln Memorial Park: 402-423-1515). También hay lotes de reventa más baratos; el cementerio debe cambiar la escritura.",
  },
  faqPlotEn: {
    q: "Does the funeral include the cemetery plot?",
    a: "No. The funeral home price is one bill. The plot is another. Ask the cemetery office for its list (Lincoln Memorial Park: 402-423-1515). Resale plots can cost less; the cemetery still has to change the deed.",
  },
  faqCalcEs: {
    q: "¿Cómo uso la calculadora de esta página?",
    a: "Está al final. Indique edad, sexo y si fuma. Elija el servicio y la funeraria. Verá un funeral estimado, una cobertura y una prima mensual de las tarifas de compañías designadas. Luego pida una cotización real.",
  },
  faqCalcEn: {
    q: "How do I use the calculator on this page?",
    a: "It is at the bottom. Enter age, sex, and whether you smoke. Pick the service and funeral home. You will see an estimated funeral, suggested coverage, and a monthly premium from appointed-company rate charts. Then get a real quote.",
  },
  guide: {
    resaleJson: "data/lincoln-plot-resales.json",
    resaleNoscriptHref: "https://eturnalrest.com/cemeteries/ne/lincoln-memorial-cemetery-lincoln/",
    tableFootEs:
      "Alternative: página de servicios, 17 sep. 2026. Lincoln Memorial: GPL y paquetes Dignity, 6 ago. 2026. Wyuka: lista de servicios, 30 mar. 2026. Estimador: promedios Funeralocity de Nebraska. Pida siempre la lista actual. No son precios de Mejor Vida Seguros.",
    tableFootEn:
      "Alternative: services page, 17 Sep 2026. Lincoln Memorial: Dignity GPL and packages, 6 Aug 2026. Wyuka: service list, 30 Mar 2026. Estimator: Nebraska Funeralocity averages. Always ask for the current list. These are not Mejor Vida Insurance prices.",
    compareLeadEs: "El salto grande es el paquete de servicios. El ataúd solo va si esa casa lo dice; el lote nunca.",
    compareLeadEn: "The real gap is the service package. A casket is included only when that home’s package says so; the plot never is.",
    newListEs:
      "Quienes revenden lotes en Lincoln Memorial Park suelen decir que la lista del cementerio está entre <strong>$2,600 y $4,495</strong> por espacio. Lo que más se oye es unos <strong>$4,000</strong>. Abrir y cerrar, bóveda y lápida siguen aparte.",
    newListEn:
      "People reselling plots at Lincoln Memorial Park often say the cemetery’s own list is <strong>$2,600 to $4,495</strong> per space. <strong>About $4,000</strong> is the number that comes up most. Opening and closing, the vault, and the marker are still extra.",
    officesEs: [
      "<strong>Lincoln Memorial Park</strong> — mismo terreno que Lincoln Memorial Funeral Home. Teléfono 402-423-1515.",
      "<strong>Wyuka</strong> — funeraria y cementerio juntos en 3600 O St. Teléfono 402-474-3600.",
      "<strong>Calvary Catholic Cemetery</strong> — 3880 L St, 402-476-8787. Vende lotes, nichos y mausoleo. No es la misma empresa que Alternative Funeral.",
    ],
    officesEn: [
      "<strong>Lincoln Memorial Park</strong> — same grounds as Lincoln Memorial Funeral Home. Phone 402-423-1515.",
      "<strong>Wyuka</strong> — funeral home and cemetery together at 3600 O St. Phone 402-474-3600.",
      "<strong>Calvary Catholic Cemetery</strong> — 3880 L St, 402-476-8787. Sells plots, niches, and mausoleum space. It is not the same company as Alternative Funeral.",
    ],
    resaleFootEs:
      "Son precios pedidos, no una oferta de Mejor Vida Seguros. Un anuncio de Wyuka a $3,600 por dos lotes ya aparece vendido.",
    resaleFootEn:
      "These are asking prices, not a Mejor Vida Insurance offer. A Wyuka ad at $3,600 for two plots is already marked sold.",
    analysisEs: [
      {
        h: "Empiece por el paquete más barato",
        p: "La cremación directa es el atajo más barato que publican: <strong>$1,595</strong> en Alternative, <strong>$3,285</strong> en Wyuka y <strong>$3,910</strong> en Lincoln Memorial. El estimador usa <strong>$2,958</strong> para Nebraska. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.",
      },
      {
        h: "El mismo nombre de paquete no trae el mismo carrito",
        p: "El funeral tradicional de Alternative (<strong>$3,155</strong>) y el de Wyuka (<strong>$5,800</strong>) son servicios, sin ataúd. El Tribute de Lincoln Memorial (<strong>$11,935</strong>) ya mete un ataúd de $2,795. El promedio de entierro completo de Nebraska (<strong>$8,620</strong>) también suele incluir ataúd.",
      },
      {
        h: "El lote nunca va en estos paquetes",
        p: "Ninguna cifra de la tabla es propiedad en cementerio ni apertura/cierre. Eso se pide en la oficina. En Lincoln Memorial Park los vendedores de reventa citan unos <strong>$4,000</strong> por un espacio nuevo.",
      },
      {
        h: "Use el estimador para los extras",
        p: "Flores, certificados, papelería, honorario, catering y varios casi nunca vienen en el paquete. El <a href=\"__ESTIMATOR_HREF__\">estimador de gastos finales</a> los suma aparte, en los mismos campos.",
      },
    ],
    analysisEn: [
      {
        h: "Start with the least expensive package",
        p: "Direct cremation is the cheapest published shortcut: <strong>$1,595</strong> at Alternative, <strong>$3,285</strong> at Wyuka, and <strong>$3,910</strong> at Lincoln Memorial. The estimator uses <strong>$2,958</strong> for Nebraska. That number is funeral home expenses only: urn, flowers, and death certificates are extra.",
      },
      {
        h: "The same package name is not the same cart",
        p: "Alternative’s traditional funeral (<strong>$3,155</strong>) and Wyuka’s (<strong>$5,800</strong>) are services, with no casket. Lincoln Memorial Tribute (<strong>$11,935</strong>) already puts in a $2,795 casket. Nebraska’s full-burial average (<strong>$8,620</strong>) usually includes a casket too.",
      },
      {
        h: "The plot is never in these packages",
        p: "None of the figures in the table are cemetery property or opening/closing. Ask the cemetery office. At Lincoln Memorial Park, resale sellers cite about <strong>$4,000</strong> for a new space.",
      },
      {
        h: "Use the estimator for the extras",
        p: "Flowers, death certificates, stationery, honorarium, catering, and miscellaneous almost never come in the package. The <a href=\"__ESTIMATOR_HREF__\">final expense estimator</a> adds them separately, in those same fields.",
      },
    ],
    homes: [
      {
        id: "alt",
        name: "Alternative Funeral",
        href: "https://lincolnalternativefuneral.com/our-services/",
        addr: "245 N 27th St, Suite B · 402-429-1450",
      },
      {
        id: "lm",
        name: "Lincoln Memorial",
        href: "https://www.lincolnfh.com/",
        addr: "6800 S 14th St · 402-423-1515",
      },
      {
        id: "wyuka",
        name: "Wyuka",
        href: "https://www.wyuka.com/service-pricing/",
        addr: "3600 O St · 402-474-3600",
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
          alt: { amt: 1595, es: "Traslado local y tarifa de cremación. Sin urna.", en: "Local transfer and cremation fee. No urn." },
          lm: { amt: 3910, es: "Servicios, traslado, refrigeración y crematorio. Contenedor del comprador.", en: "Services, transfer, refrigeration, and crematory. Purchaser container." },
          wyuka: { amt: 3285, es: "Incluye contenedor y urna temporal.", en: "Includes a container and temporary urn." },
          us: { amt: 2958, es: "Promedio de Nebraska (Funeralocity), el mismo que usa el estimador.", en: "Nebraska average (Funeralocity), the same figure the estimator uses." },
        }
      ),
      line(
        "Entierro inmediato",
        "Immediate burial",
        "Gastos de funeraria para un entierro sin velatorio ni ceremonia: traslado, servicios mínimos del director y transporte al cementerio. No incluye ataúd, bóveda, propiedad en cementerio, apertura/cierre, flores, certificados, papelería, honorario, catering ni varios.",
        "Funeral home expenses for a burial with no visitation or ceremony: transfer, minimum director services, and transport to the cemetery. Does not include a casket, vault, cemetery property, opening/closing, flowers, death certificates, stationery, honorarium, catering, or miscellaneous.",
        {
          alt: { amt: 1805, es: "Retiro, autorizaciones y traslado al cementerio. Ataúd aparte.", en: "Removal, authorizations, and transport to the cemetery. Casket extra." },
          lm: { amt: 4920, es: "Servicios, refrigeración, traslado y transporte al cementerio. Contenedor del comprador.", en: "Services, refrigeration, transfer, and transport to the cemetery. Purchaser container." },
          wyuka: { amt: 3195, es: "Ataúd y lote aparte.", en: "Casket and plot extra." },
          us: { amt: 5467, es: "Promedio de Nebraska (Funeralocity); suele incluir un ataúd básico.", en: "Nebraska average (Funeralocity); often includes a basic casket." },
        }
      ),
      line(
        "Cremación con memorial",
        "Cremation with memorial",
        "Gastos de funeraria para cremación más un memorial o reunión sencilla (sin ataúd presente). En algunas casas la urna va incluida. Propiedad en cementerio, flores, certificados, honorario, catering y varios suelen ir aparte.",
        "Funeral home expenses for cremation plus a memorial or simple gathering (no casket present). An urn is included at some homes. Cemetery property, flowers, death certificates, honorarium, catering, and miscellaneous are usually extra.",
        {
          alt: { amt: 2595, es: "Traslado, director, cremación y memorial. Ataúd aparte.", en: "Transfer, director, cremation, and memorial. Casket extra." },
          lm: { amt: 5795, es: "Paquete Tribute: cremación directa, reunión sencilla y urna. No es suma de la GPL.", en: "Tribute package: direct cremation, simple gathering, and an urn. Not a GPL sum." },
          wyuka: { amt: 3960, es: "Cremación directa más memorial o pie de tumba.", en: "Direct cremation plus memorial or graveside." },
          us: { amt: 6530, es: "Cremación completa de Nebraska (Funeralocity); suele incluir velatorio y ataúd de cremación.", en: "Nebraska full cremation (Funeralocity); typically viewing and a cremation casket." },
        }
      ),
      line(
        "Funeral tradicional con velatorio",
        "Traditional funeral with visitation",
        "Gastos de funeraria para un funeral con visita: director y personal, traslado, embalsamado y arreglo, velatorio, ceremonia y carroza. El ataúd solo va si el paquete de esa casa lo dice (Tribute de Lincoln Memorial sí). Bóveda, propiedad en cementerio, apertura/cierre y la mayoría de extras no van incluidos.",
        "Funeral home expenses for a funeral with visitation: director and staff, transfer, embalming and preparation, viewing, the ceremony, and a hearse. A casket is included only if that home’s package says so (Lincoln Memorial Tribute does). Vault, cemetery property, opening/closing, and most extras are not included.",
        {
          alt: { amt: 3155, es: "1 hora de visita, ceremonia y papelería. Ataúd y bóveda aparte.", en: "1-hour visitation, ceremony, and stationery. Casket and vault extra." },
          lm: { amt: 11935, es: "Paquete Tribute: ya incluye ataúd de $2,795. Sin bóveda ni lote.", en: "Tribute package: already includes a $2,795 casket. No vault or plot." },
          wyuka: { amt: 5800, es: "Funeral con velatorio. Ataúd y lote aparte.", en: "Funeral with visitation. Casket and plot extra." },
          us: { amt: 8620, es: "Entierro completo de Nebraska (Funeralocity); ya mete un ataúd típico.", en: "Nebraska full burial (Funeralocity); already puts in a typical casket." },
        }
      ),
    ],
    calc: {
      plotNew: 4000,
      plotResale: 2000,
      vault: 1495,
      casketTypical: 2500,
      gpl: {
        alt: { directCremation: 1595, memorialCremation: 2595, immediateBurial: 1805, traditional: 3155 },
        lm: { directCremation: 3910, memorialCremation: 5795, immediateBurial: 4920, traditional: 11935 },
        wyuka: { directCremation: 3285, memorialCremation: 3960, immediateBurial: 3195, traditional: 5800 },
        us: { directCremation: 2958, memorialCremation: 6530, immediateBurial: 5467, traditional: 8620 },
      },
      homeIncludesCasket: {
        lm: ["traditional", "memorialCremation"],
        us: ["memorialCremation", "immediateBurial", "traditional"],
      },
      homeLabels: {
        alt: { en: "Alternative Funeral", es: "Alternative Funeral" },
        lm: { en: "Lincoln Memorial", es: "Lincoln Memorial" },
        wyuka: { en: "Wyuka", es: "Wyuka" },
        us: { en: "Estimator (Nebraska)", es: "Estimador (Nebraska)" },
      },
    },
  },
};

module.exports.NPN = NPN;
