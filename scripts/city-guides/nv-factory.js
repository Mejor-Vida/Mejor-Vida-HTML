/**
 * Shared Nevada city-guide builder. Same locked layout as Lincoln.
 * Canonical format: .cursor/rules/city-page-layout.mdc
 *
 * Named-home columns from first-party lists (the home’s site or PDF). Fill only
 * the package rows that list publishes. Leave the rest blank — do not invent
 * a total and do not copy Funeralocity into a named column. If no local home
 * publishes any of the four packages, the chart is estimator-only. The
 * estimator column is Nevada Funeralocity averages (captured 26 Jul 2026).
 */
const NV_AVG = {
  directCremation: 1467,
  immediateBurial: 4982,
  memorialCremation: 6095,
  traditional: 8538,
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
    es: "Promedio de Nevada (Funeralocity), el mismo que usa el estimador.",
    en: "Nevada average (Funeralocity), the same figure the estimator uses.",
  },
  ib: {
    es: "Promedio de Nevada (Funeralocity); suele incluir un ataúd básico.",
    en: "Nevada average (Funeralocity); often includes a basic casket.",
  },
  mem: {
    es: "Cremación completa de Nevada (Funeralocity); suele incluir velatorio y ataúd de cremación.",
    en: "Nevada full cremation (Funeralocity); typically viewing and a cremation casket.",
  },
  tr: {
    es: "Entierro completo de Nevada (Funeralocity); ya mete un ataúd típico.",
    en: "Nevada full burial (Funeralocity); already puts in a typical casket.",
  },
};

function cell(amt, es, en) {
  return { amt, es, en };
}

const NOT_PUB = cell(
  null,
  "No figura en su lista publicada. Pida la lista vigente.",
  "Not on their published list. Ask for the current list."
);

function joinTowns(towns, lang) {
  const list = (towns || []).map((n) => String(n || "").trim()).filter(Boolean);
  if (!list.length) return "";
  if (list.length === 1) return list[0];
  const last = list[list.length - 1];
  const rest = list.slice(0, -1).join(", ");
  return lang === "es" ? `${rest} y ${last}` : `${rest}, and ${last}`;
}

function nearbyForMeta(metro, cityName) {
  const primary = String(cityName || "").toLowerCase();
  return (metro || [])
    .filter((n) => {
      const a = String(n || "").toLowerCase();
      return a && a !== primary && !primary.startsWith(a + ",") && !primary.startsWith(a + " (");
    })
    .slice(0, 3);
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

function namedHomeCells(homes, pick) {
  const cells = {};
  for (const h of homes) cells[h.id] = pick(h);
  return cells;
}

function joinListEs(items) {
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " y " + items[items.length - 1];
}

function joinListEn(items) {
  if (!items.length) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return items[0] + " and " + items[1];
  return items.slice(0, -1).join(", ") + ", and " + items[items.length - 1];
}

function makeCity(spec) {
  const name = spec.nameEn;
  const nameEs = spec.nameEs || spec.nameEn;
  const homes = spec.homes || [];
  const dcs = homes
    .filter((h) => h.dc != null)
    .map((h) => ({ name: h.name, amt: h.dc }))
    .sort((a, b) => a.amt - b.amt);
  const trads = homes
    .filter((h) => h.trad != null)
    .map((h) => ({ name: h.name, amt: h.trad, casket: h.casketTrad }));
  const others = spec.nearbyGuides || [];
  const nearEs = joinTowns(nearbyForMeta(spec.metroEs, nameEs), "es");
  const nearEn = joinTowns(nearbyForMeta(spec.metroEn, name), "en");
  const dcBitsEs = joinListEs(dcs.map((d) => `<strong>${money(d.amt)}</strong> en ${d.name}`));
  const dcBitsEn = joinListEn(dcs.map((d) => `<strong>${money(d.amt)}</strong> at ${d.name}`));
  const prepaidWhereEs = homes.length
    ? homes.map((h) => h.name).join(", ")
    : `cualquier funeraria de ${nameEs}`;
  const prepaidWhereEn = homes.length
    ? homes.map((h) => h.name).join(", ")
    : `any funeral home in ${name}`;

  const packages = [
    line("Cremación directa", "Direct cremation", PKG_DC_ES, PKG_DC_EN, {
      ...namedHomeCells(homes, (h) => (h.dc != null ? cell(h.dc, h.dcEs, h.dcEn) : NOT_PUB)),
      us: cell(NV_AVG.directCremation, AVG_NOTE.dc.es, AVG_NOTE.dc.en),
    }),
    line("Entierro inmediato", "Immediate burial", PKG_IB_ES, PKG_IB_EN, {
      ...namedHomeCells(homes, (h) => (h.ib != null ? cell(h.ib, h.ibEs, h.ibEn) : NOT_PUB)),
      us: cell(NV_AVG.immediateBurial, AVG_NOTE.ib.es, AVG_NOTE.ib.en),
    }),
    line("Cremación con memorial", "Cremation with memorial", PKG_MEM_ES, PKG_MEM_EN, {
      ...namedHomeCells(homes, (h) => h.memCell || NOT_PUB),
      us: cell(NV_AVG.memorialCremation, AVG_NOTE.mem.es, AVG_NOTE.mem.en),
    }),
    line("Funeral tradicional con velatorio", "Traditional funeral with visitation", PKG_TR_ES, PKG_TR_EN, {
      ...namedHomeCells(homes, (h) => h.trCell || NOT_PUB),
      us: cell(NV_AVG.traditional, AVG_NOTE.tr.es, AVG_NOTE.tr.en),
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
    us: { ...NV_AVG },
  };
  const homeLabels = {
    us: { en: "Estimator (Nevada)", es: "Estimador (Nevada)" },
  };
  for (const h of homes) {
    const row = {};
    if (h.dc != null) row.directCremation = h.dc;
    if (h.ib != null) row.immediateBurial = h.ib;
    if (h.memCell && h.memCell.amt != null) row.memorialCremation = h.memCell.amt;
    if (h.trad != null) row.traditional = h.trad;
    gpl[h.id] = row;
    homeLabels[h.id] = { en: h.name, es: h.name };
  }

  return {
    slug: spec.slug,
    nameEs,
    nameEn: name,
    stateSlug: "nevada",
    stateNameEs: "Nevada",
    stateNameEn: "Nevada",
    stateCode: "NV",
    heroFile: spec.heroFile,
    heroCaptionEs: spec.heroCaptionEs,
    heroCaptionEn: spec.heroCaptionEn,
    heroClass: spec.heroClass,
    heroW: spec.heroW,
    heroH: spec.heroH,
    heroVer: spec.heroVer || "v1",
    titleEs: `Seguro de gastos finales y de entierro en ${nameEs} | Mejor Vida Seguros`,
    titleEn: `Final expense and burial insurance in ${name} | Mejor Vida Insurance`,
    descEs: `Seguro de gastos finales, de entierro o funeral en ${nameEs}${nearEs ? `, ${nearEs}` : ""}: funerarias, lotes y cotización por teléfono. Licencia de Nevada, NPN #21695431.`,
    descEn: `Final expense, burial, or funeral insurance in ${name}${nearEn ? `, ${nearEn}` : ""}: funeral-home lists, plots, and a phone quote. Nevada license, NPN #21695431.`,
    ctaSubEs:
      "Abajo: qué es este seguro, las listas de funerarias, el lote aparte, y una calculadora de cobertura.",
    ctaSubEn:
      "Below: what this insurance is, funeral-home price lists, the plot as a separate bill, and a coverage calculator.",
    bulletsEs: [
      "Qué es el seguro de gastos finales — también llamado de entierro o funeral — y cómo se usa para el funeral.",
      `Una tabla de paquetes de funerarias en ${nameEs}, del más económico al más caro.`,
      "El lote es una factura aparte del cementerio, con anuncios de reventa que suelen costar menos.",
      "Una calculadora para estimar el funeral, la cobertura y la prima mensual.",
    ],
    bulletsEn: [
      "What final expense insurance is — also called burial or funeral insurance — and how it pays for a funeral.",
      `${/^[AEIOU]/i.test(name) ? "An" : "A"} ${name} funeral-home package table, from the least expensive to the most expensive.`,
      "The burial plot is a separate cemetery bill, with resale listings that often cost less.",
      "A calculator for funeral cost, coverage, and a monthly premium.",
    ],
    countyEs: spec.countyEs || "",
    countyEn: spec.countyEn || "",
    metroEs: spec.metroEs,
    metroEn: spec.metroEn,
    metroTitleEs: spec.metroTitleEs,
    metroTitleEn: spec.metroTitleEn,
    metroNoteEs: `Las cotizaciones oficiales son por teléfono para residentes de Nevada en estas comunidades${
      spec.countyEs ? ` del ${spec.countyEs}` : ""
    }. No hay oficina de atención al público. ${ownGuideLinks("es", others)}`,
    metroNoteEn: `Official quotes are by phone for Nevada residents in these${
      spec.countyEn ? ` ${spec.countyEn}` : ""
    } communities. There is no public walk-in office. ${ownGuideLinks("en", others)}`,
    faqCremationEs: {
      q: `¿Cuánta cobertura suele alcanzar para una cremación en ${nameEs}?`,
      a:
        spec.faqCremationAEs ||
        (dcs.length
          ? `Con cremación directa publicada desde ${joinListEs(
              dcs.map((d) => `${money(d.amt)} en ${d.name}`)
            )}, muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional suele necesitar más: ${
              trads[0]
                ? `el paquete de ${trads[0].name} está en ${money(trads[0].amt)}${trads[0].casket ? "" : " sin ataúd"}`
                : "el promedio de Nevada es $8,538"
            }, y el lote, la bóveda y la lápida van aparte.`
          : homes.length
            ? `Esta ciudad tiene funerarias en la tabla, pero no todas publican cremación directa. El estimador usa $1,467 como promedio de Nevada para cremación directa; ese número no es el precio de una casa. Muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional suele necesitar más: el promedio de Nevada es $8,538, y el lote, la bóveda y la lápida van aparte.`
            : `Ninguna funeraria de ${nameEs} publica una lista general de precios en internet. El estimador usa $1,467 como promedio de Nevada para cremación directa; ese número no es el precio de una casa. Muchas familias eligen $5,000 a $10,000 para el servicio, urna, viajes y cuentas pequeñas. Un entierro tradicional suele necesitar más: el promedio de Nevada es $8,538, y el lote, la bóveda y la lápida van aparte.`),
    },
    faqCremationEn: {
      q: `How much coverage is usually enough for cremation in ${name}?`,
      a:
        spec.faqCremationAEn ||
        (dcs.length
          ? `With direct cremation published from ${joinListEn(
              dcs.map((d) => `${money(d.amt)} at ${d.name}`)
            )}, many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial often needs more: ${
              trads[0]
                ? `${trads[0].name}’s traditional package is ${money(trads[0].amt)}${trads[0].casket ? "" : " with no casket"}`
                : "the Nevada average is $8,538"
            }, and the plot, vault, and marker are extra.`
          : homes.length
            ? `This city has funeral homes on the chart, but not every home publishes direct cremation. The estimator uses $1,467 as the Nevada average for direct cremation; that figure is not one home’s price. Many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial often needs more: the Nevada average is $8,538, and the plot, vault, and marker are extra.`
            : `No funeral home in ${name} publishes a general price list online. The estimator uses $1,467 as the Nevada average for direct cremation; that figure is not one home’s price. Many families choose $5,000 to $10,000 for the service, urn, travel, and small bills. A traditional burial often needs more: the Nevada average is $8,538, and the plot, vault, and marker are extra.`),
    },
    faqPrepaidEs: {
      q: "¿Cuál es la diferencia entre un funeral prepagado y este seguro?",
      a: `El prepagado se ata a una funeraria o a un lote y puede fijar ese precio. El seguro de gastos finales paga efectivo a su beneficiario: puede usarlo en ${prepaidWhereEs}, ${spec.prepaidCemEs}, o en otros gastos finales.`,
    },
    faqPrepaidEn: {
      q: "What is the difference between a prepaid funeral and this insurance?",
      a: `A prepaid plan is tied to one funeral home or plot and may lock that price. Final expense insurance pays cash to your beneficiary. They can use it at ${prepaidWhereEn}, ${spec.prepaidCemEn}, or for other final bills.`,
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
          p:
            spec.analysisCheapEs ||
            (dcs.length
              ? `La cremación directa es el atajo más barato que publican: ${dcBitsEs}. El estimador usa <strong>$1,467</strong> para Nevada. Ese número es solo gastos de funeraria: urna, flores y certificados van aparte.`
              : homes.length
                ? `Las casas de esta tabla no publican cremación directa. El estimador usa <strong>$1,467</strong> como promedio de Nevada. Ese número no es el precio de una casa. Pida la lista vigente por teléfono. Urna, flores y certificados van aparte.`
                : `Ninguna funeraria de ${nameEs} publica una lista general de precios en internet, así que esta tabla no las nombra. El estimador usa <strong>$1,467</strong> como promedio de Nevada para cremación directa. Ese número no es el precio de una casa. Pida la lista vigente por teléfono. Urna, flores y certificados van aparte.`),
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
          p:
            spec.analysisCheapEn ||
            (dcs.length
              ? `Direct cremation is the cheapest published shortcut: ${dcBitsEn}. The estimator uses <strong>$1,467</strong> for Nevada. That number is funeral home expenses only: urn, flowers, and death certificates are extra.`
              : homes.length
                ? `The homes on this chart do not publish direct cremation. The estimator uses <strong>$1,467</strong> as the Nevada average. That figure is not one home’s price. Ask for the current list by phone. Urn, flowers, and death certificates are extra.`
                : `No funeral home in ${name} publishes a general price list online, so this table does not name them. The estimator uses <strong>$1,467</strong> as the Nevada average for direct cremation. That figure is not one home’s price. Ask for the current list by phone. Urn, flowers, and death certificates are extra.`),
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
          nameEs: "Estimador (Nevada)",
          nameEn: "Estimator (Nevada)",
          addrEs: "Promedios Funeralocity de Nevada",
          addrEn: "Nevada Funeralocity averages",
        },
      ],
      packages,
      unpublishedHomes: spec.unpublishedHomes || [],
      unpublishedLeadEs: spec.unpublishedLeadEs || "",
      unpublishedLeadEn: spec.unpublishedLeadEn || "",
      calc: {
        defaultService: "directCremation",
        defaultHome: homes[0] ? homes[0].id : "us",
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

const VALLEY_NEAR = [
  { slug: "las-vegas", name: "Las Vegas" },
  { slug: "henderson", name: "Henderson" },
];

const RENO_NEAR = [
  { slug: "reno", name: "Reno" },
  { slug: "sparks", name: "Sparks" },
  { slug: "carson-city", name: "Carson City" },
];

function valleyNear(except) {
  return VALLEY_NEAR.filter((x) => x.slug !== except);
}

function renoNear(except) {
  return RENO_NEAR.filter((x) => x.slug !== except);
}

module.exports = { NV_AVG, makeCity, cell, valleyNear, renoNear };
