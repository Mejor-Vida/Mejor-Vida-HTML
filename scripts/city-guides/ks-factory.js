/**
 * Shared Kansas city-guide builder. Same locked layout as Lincoln.
 * Canonical format: .cursor/rules/city-page-layout.mdc
 *
 * Named-home dollars are first-party GPLs or GPL figures transcribed in the
 * FCA-GKC 2025 survey. The estimator column is Kansas Funeralocity averages
 * (captured 26 Jul 2026). Do not copy Nebraska funeral-home or cemetery names.
 */
const KS_AVG = {
  directCremation: 2553,
  immediateBurial: 5374,
  memorialCremation: 6452,
  traditional: 8640,
};

function money(n) {
  return "$" + Number(n).toLocaleString("en-US");
}

function line(labelEs, labelEn, descEs, descEn, cells) {
  return { labelEs, labelEn, descEs, descEn, cells };
}

const PKG_DC_ES =
  "Gastos de funeraria para una cremación sin velatorio ni ceremonia: traslado, servicios mínimos del director y tarifa del crematorio. No incluye urna, flores, certificados de defunción, papelería, honorario, catering, varios ni propiedad en cementerio.";
const PKG_DC_EN =
  "Funeral home expenses for a cremation with no viewing or ceremony: transfer, minimum director services, and the crematory fee. Does not include an urn, flowers, death certificates, stationery, honorarium, catering, miscellaneous, or cemetery property.";
const PKG_IB_ES =
  "Gastos de funeraria para un entierro sin velatorio ni ceremonia: traslado, servicios mínimos del director y transporte al cementerio. No incluye ataúd, bóveda, propiedad en cementerio, apertura/cierre, flores, certificados, papelería, honorario, catering ni varios.";
const PKG_IB_EN =
  "Funeral home expenses for a burial with no visitation or ceremony: transfer, minimum director services, and transport to the cemetery. Does not include a casket, vault, cemetery property, opening/closing, flowers, death certificates, stationery, honorarium, catering, or miscellaneous.";
const PKG_MEM_ES =
  "Gastos de funeraria para cremación más un memorial o reunión sencilla (sin ataúd presente). En algunas casas la urna va incluida. Propiedad en cementerio, flores, certificados, honorario, catering y varios suelen ir aparte.";
const PKG_MEM_EN =
  "Funeral home expenses for cremation plus a memorial or simple gathering (no casket present). An urn is included at some homes. Cemetery property, flowers, death certificates, honorarium, catering, and miscellaneous are usually extra.";
const PKG_TR_ES =
  "Gastos de funeraria para un funeral con visita: director y personal, traslado, embalsamado y arreglo, velatorio, ceremonia y carroza. El ataúd solo va si el paquete de esa casa lo dice. Bóveda, propiedad en cementerio, apertura/cierre y la mayoría de extras no van incluidos.";
const PKG_TR_EN =
  "Funeral home expenses for a funeral with visitation: director and staff, transfer, embalming and preparation, viewing, the ceremony, and a hearse. A casket is included only if that home’s package says so. Vault, cemetery property, opening/closing, and most extras are not included.";

const AVG_NOTE = {
  dc: {
    es: "Promedio de Kansas (Funeralocity), el mismo que usa el estimador.",
    en: "Kansas average (Funeralocity), the same figure the estimator uses.",
  },
  ib: {
    es: "Promedio de Kansas (Funeralocity); suele incluir un ataúd básico.",
    en: "Kansas average (Funeralocity); often includes a basic casket.",
  },
  mem: {
    es: "Cremación completa de Kansas (Funeralocity); suele incluir velatorio y ataúd de cremación.",
    en: "Kansas full cremation (Funeralocity); typically viewing and a cremation casket.",
  },
  tr: {
    es: "Entierro completo de Kansas (Funeralocity); ya mete un ataúd típico.",
    en: "Kansas full burial (Funeralocity); already puts in a typical casket.",
  },
};

function cell(amt, es, en) {
  return { amt, es, en };
}

function fcaMem(stdAmt) {
  return cell(
    stdAmt,
    "Funeral estándar de esa GPL (encuesta FCA-GKC). No publican un memorial aparte en la encuesta.",
    "Standard funeral from that GPL (FCA-GKC survey). The survey has no separate memorial row."
  );
}

function fcaTr(stdAmt) {
  return cell(
    stdAmt,
    "Funeral estándar de esa GPL (encuesta FCA-GKC). Suele incluir ataúd.",
    "Standard funeral from that GPL (FCA-GKC survey). A casket is typically included."
  );
}

function ownGuideLinks(lang, others) {
  const bits = others
    .map((o) =>
      lang === "es"
        ? `${o.name} tiene <a href="${o.slug}.html">su propia guía</a>`
        : `${o.name} has <a href="${o.slug}.html">its own guide</a>`
    )
    .join(". ");
  return bits ? `${bits}.` : "";
}

function makeCity(spec) {
  const name = spec.nameEn;
  const nameEs = spec.nameEs || spec.nameEn;
  const homes = spec.homes;
  const dcs = homes.map((h) => ({ name: h.name, amt: h.dc }));
  dcs.sort((a, b) => a.amt - b.amt);
  const trads = homes.map((h) => ({ name: h.name, amt: h.trad, casket: h.casketTrad }));
  const h0 = homes[0];
  const h1 = homes[1];
  const h2 = homes[2];
  const others = spec.nearbyGuides || [];

  const packages = [
    line("Cremación directa", "Direct cremation", PKG_DC_ES, PKG_DC_EN, {
      [h0.id]: cell(h0.dc, h0.dcEs, h0.dcEn),
      [h1.id]: cell(h1.dc, h1.dcEs, h1.dcEn),
      [h2.id]: cell(h2.dc, h2.dcEs, h2.dcEn),
      us: cell(KS_AVG.directCremation, AVG_NOTE.dc.es, AVG_NOTE.dc.en),
    }),
    line("Entierro inmediato", "Immediate burial", PKG_IB_ES, PKG_IB_EN, {
      [h0.id]: cell(h0.ib, h0.ibEs, h0.ibEn),
      [h1.id]: cell(h1.ib, h1.ibEs, h1.ibEn),
      [h2.id]: cell(h2.ib, h2.ibEs, h2.ibEn),
      us: cell(KS_AVG.immediateBurial, AVG_NOTE.ib.es, AVG_NOTE.ib.en),
    }),
    line("Cremación con memorial", "Cremation with memorial", PKG_MEM_ES, PKG_MEM_EN, {
      [h0.id]: h0.memCell,
      [h1.id]: h1.memCell,
      [h2.id]: h2.memCell,
      us: cell(KS_AVG.memorialCremation, AVG_NOTE.mem.es, AVG_NOTE.mem.en),
    }),
    line("Funeral tradicional con velatorio", "Traditional funeral with visitation", PKG_TR_ES, PKG_TR_EN, {
      [h0.id]: h0.trCell,
      [h1.id]: h1.trCell,
      [h2.id]: h2.trCell,
      us: cell(KS_AVG.traditional, AVG_NOTE.tr.es, AVG_NOTE.tr.en),
    }),
  ];

  const homeIncludesCasket = { us: ["memorialCremation", "immediateBurial", "traditional"] };
  for (const h of homes) {
    const keys = [];
    if (h.casketMem) keys.push("memorialCremation");
    if (h.casketIb) keys.push("immediateBurial");
    if (h.casketTrad) keys.push("traditional");
    if (keys.length) homeIncludesCasket[h.id] = keys;
  }

  const gpl = {
    us: { ...KS_AVG },
  };
  const homeLabels = {
    us: { en: "Estimator (Kansas)", es: "Estimador (Kansas)" },
  };
  for (const h of homes) {
    gpl[h.id] = {
      directCremation: h.dc,
      memorialCremation: h.memCell.amt,
      immediateBurial: h.ib,
      traditional: h.trad,
    };
    homeLabels[h.id] = { en: h.name, es: h.name };
  }

  return {
    slug: spec.slug,
    nameEs,
    nameEn: name,
    stateSlug: "kansas",
    stateNameEs: "Kansas",
    stateNameEn: "Kansas",
    stateCode: "KS",
    heroFile: spec.heroFile,
    heroCaptionEs: spec.heroCaptionEs,
    heroCaptionEn: spec.heroCaptionEn,
    heroClass: spec.heroClass,
    heroW: spec.heroW,
    heroH: spec.heroH,
    heroVer: spec.heroVer || "v1",
    titleEs: `Seguro de gastos finales en ${nameEs} | Mejor Vida Seguros`,
    titleEn: `Final Expense Insurance in ${name} | Mejor Vida Insurance`,
    descEs: `Qué es el seguro de gastos finales en ${nameEs}, listas de funerarias lado a lado, lotes y reventa, y una calculadora de cobertura. Licencia de Kansas, NPN #21695431.`,
    descEn: `What final expense insurance is in ${name}, side-by-side funeral-home lists, plots and resale, and a coverage calculator. Kansas license, NPN #21695431.`,
    ctaSubEs:
      "Abajo: qué es este seguro, las listas de funerarias, el lote aparte, y una calculadora de cobertura.",
    ctaSubEn:
      "Below: what this insurance is, funeral-home price lists, the plot as a separate bill, and a coverage calculator.",
    bulletsEs: [
      "Qué es el seguro de gastos finales y cómo se usa para el funeral.",
      `Una tabla de paquetes de funerarias en ${nameEs}, del más económico al más caro.`,
      "El lote es una factura aparte del cementerio, con anuncios de reventa que suelen costar menos.",
      "Una calculadora para estimar el funeral, la cobertura y la prima mensual.",
    ],
    bulletsEn: [
      "What final expense insurance is, and how it pays for a funeral.",
      `${/^[AEIOU]/i.test(name) ? "An" : "A"} ${name} funeral-home package table, from the least expensive to the most expensive.`,
      "The burial plot is a separate cemetery bill, with resale listings that often cost less.",
      "A calculator for funeral cost, coverage, and a monthly premium.",
    ],
    metroEs: spec.metroEs,
    metroEn: spec.metroEn,
    metroTitleEs: spec.metroTitleEs,
    metroTitleEn: spec.metroTitleEn,
    metroNoteEs: `Las cotizaciones oficiales son por teléfono para residentes de Kansas en estas comunidades${
      spec.countyEs ? ` del ${spec.countyEs}` : ""
    }. No hay oficina de atención al público. ${ownGuideLinks("es", others)}`,
    metroNoteEn: `Official quotes are by phone for Kansas residents in these${
      spec.countyEn ? ` ${spec.countyEn}` : ""
    } communities. There is no public walk-in office. ${ownGuideLinks("en", others)}`,
    faqCremationEs: {
      q: `¿Cuánta cobertura suele alcanzar para una cremación en ${nameEs}?`,
      a: `Con cremación directa publicada desde ${money(dcs[0].amt)} en ${dcs[0].name}, ${money(
        dcs[1].amt
      )} en ${dcs[1].name} y ${money(dcs[2].amt)} en ${dcs[2].name}, muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional suele necesitar más: el paquete de ${
        trads[0].name
      } está en ${money(trads[0].amt)}${trads[0].casket ? "" : " sin ataúd"}, y el lote, la bóveda y la lápida van aparte.`,
    },
    faqCremationEn: {
      q: `How much coverage is usually enough for cremation in ${name}?`,
      a: `With direct cremation published from ${money(dcs[0].amt)} at ${dcs[0].name}, ${money(
        dcs[1].amt
      )} at ${dcs[1].name}, and ${money(dcs[2].amt)} at ${dcs[2].name}, many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial often needs more: ${
        trads[0].name
      }’s traditional package is ${money(trads[0].amt)}${trads[0].casket ? "" : " with no casket"}, and the plot, vault, and marker are extra.`,
    },
    faqPrepaidEs: {
      q: "¿Cuál es la diferencia entre un funeral prepagado y este seguro?",
      a: `El prepagado se ata a una funeraria o a un lote y puede fijar ese precio. El seguro de gastos finales paga efectivo a su beneficiario: puede usarlo en ${homes
        .map((h) => h.name)
        .join(", ")}, ${spec.prepaidCemEs}, o en otros gastos finales.`,
    },
    faqPrepaidEn: {
      q: "What is the difference between a prepaid funeral and this insurance?",
      a: `A prepaid plan is tied to one funeral home or plot and may lock that price. Final expense insurance pays cash to your beneficiary. They can use it at ${homes
        .map((h) => h.name)
        .join(", ")}, ${spec.prepaidCemEn}, or for other final bills.`,
    },
    faqPlotEs: {
      q: "¿El funeral incluye el lote del cementerio?",
      a: spec.faqPlotEs,
    },
    faqPlotEn: {
      q: "Does the funeral include the cemetery plot?",
      a: spec.faqPlotEn,
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
      resaleJson: `data/${spec.slug}-plot-resales.json`,
      resaleNoscriptHref: spec.resaleHref,
      tableFootEs: spec.tableFootEs,
      tableFootEn: spec.tableFootEn,
      compareLeadEs:
        "El salto grande es el paquete de servicios. El ataúd solo va si esa casa lo dice; el lote nunca.",
      compareLeadEn:
        "The real gap is the service package. A casket is included only when that home’s package says so; the plot never is.",
      officesNoteEs: spec.officesNoteEs,
      officesNoteEn: spec.officesNoteEn,
      newListEs: spec.newListEs,
      newListEn: spec.newListEn,
      officesEs: spec.officesEs,
      officesEn: spec.officesEn,
      resaleFootEs:
        "Son precios pedidos, no una oferta de Mejor Vida Seguros. Revise si el anuncio sigue activo.",
      resaleFootEn:
        "These are asking prices, not a Mejor Vida Insurance offer. Check that the listing is still active.",
      analysisEs: [
        {
          h: "Empiece por el paquete más barato",
          p: `La cremación directa es el atajo más barato que publican: <strong>${money(
            dcs[0].amt
          )}</strong> en ${dcs[0].name}, <strong>${money(dcs[1].amt)}</strong> en ${dcs[1].name} y <strong>${money(
            dcs[2].amt
          )}</strong> en ${dcs[2].name}. El estimador usa <strong>$2,553</strong> para Kansas. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.`,
        },
        {
          h: "El mismo nombre de paquete no incluye lo mismo",
          p: spec.analysisSameEs,
        },
        {
          h: "El lote nunca va en estos paquetes",
          p: spec.analysisPlotEs,
        },
        {
          h: "Use el estimador para los extras",
          p: 'Flores, certificados, papelería, honorario, catering y varios casi nunca vienen en el paquete. El <a href="__ESTIMATOR_HREF__">estimador de gastos finales</a> los suma aparte, en los mismos campos.',
        },
      ],
      analysisEn: [
        {
          h: "Start with the least expensive package",
          p: `Direct cremation is the cheapest published shortcut: <strong>${money(
            dcs[0].amt
          )}</strong> at ${dcs[0].name}, <strong>${money(dcs[1].amt)}</strong> at ${dcs[1].name}, and <strong>${money(
            dcs[2].amt
          )}</strong> at ${dcs[2].name}. The estimator uses <strong>$2,553</strong> for Kansas. That number is funeral home expenses only: urn, flowers, and death certificates are extra.`,
        },
        {
          h: "The same package name does not include the same items",
          p: spec.analysisSameEn,
        },
        {
          h: "The plot is never in these packages",
          p: spec.analysisPlotEn,
        },
        {
          h: "Use the estimator for the extras",
          p: 'Flowers, death certificates, stationery, honorarium, catering, and miscellaneous almost never come in the package. The <a href="__ESTIMATOR_HREF__">final expense estimator</a> adds them separately, in those same fields.',
        },
      ],
      homes: [
        ...homes.map((h) => ({
          id: h.id,
          name: h.name,
          href: h.href,
          addr: h.addr,
        })),
        {
          id: "us",
          estimator: true,
          nameEs: "Estimador (Kansas)",
          nameEn: "Estimator (Kansas)",
          addrEs: "Promedios Funeralocity de Kansas",
          addrEn: "Kansas Funeralocity averages",
        },
      ],
      packages,
      calc: {
        defaultService: "directCremation",
        defaultHome: homes[0].id,
        plotNew: spec.plotNew,
        plotResale: spec.plotResale,
        vault: 1495,
        casketTypical: 2500,
        gpl,
        homeIncludesCasket,
        homeLabels,
      },
    },
  };
}

const JOCO_NEAR = [
  { slug: "overland-park", name: "Overland Park" },
  { slug: "olathe", name: "Olathe" },
  { slug: "shawnee", name: "Shawnee" },
  { slug: "lenexa", name: "Lenexa" },
];

function jocoNear(except) {
  return JOCO_NEAR.filter((x) => x.slug !== except);
}

module.exports = { KS_AVG, makeCity, cell, fcaMem, fcaTr, jocoNear };
