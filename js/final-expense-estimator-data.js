/**
 * Final expense funeral cost estimator — per-state burial & cremation averages
 * (Legacy Safeguard Expense Estimator, May 2026) plus optional tier add-ons.
 */
/** $0 option — matches Legacy “Not Desired” on merchandise line items */
var MVI_FE_NOT_DESIRED = {
  labelEn: "Not Desired",
  labelEs: "No deseado",
  amount: 0,
};

function buildFeEstimatorStates() {
  var costs = window.MVI_FE_STATE_COSTS || {};
  var out = {};
  Object.keys(costs).forEach(function (code) {
    var row = costs[code];
    out[code] = {
      code: row.code,
      nameEn: row.nameEn,
      nameEs: row.nameEs,
      burial: row.burial,
      cremation: row.cremation,
      funeralHome: row.funeralHome,
    };
  });
  return out;
}

window.MVI_FE_ESTIMATOR_DATA = {
  storageKey: "mviFeEstimatorV6",
  notDesiredOption: MVI_FE_NOT_DESIRED,
  defaultState: "NE",
  states: buildFeEstimatorStates(),
  burialStateKeys: [
    "casket",
    "vault",
    "cemetery",
    "opening",
    "flowers",
    "deathCerts",
    "stationery",
  ],
  cremationStateKeys: ["cremationPrice", "memorialService"],
  /** Cemetery & opening/closing — Legacy Safeguard fixed tier amounts (all states). */
  cemeteryTierAmounts: [1500, 2500, 3500],
  openingTierAmounts: [1500, 2500, 3500],
  tierLineIds: {
    burial: [
      "casket",
      "vault",
      "cemetery",
      "opening",
      "flowers",
      "deathCerts",
      "stationery",
      "honorarium",
      "catering",
      "misc",
    ],
    cremation: ["urn", "flowers", "deathCerts", "stationery", "honorarium", "catering", "misc"],
  },
  tiers: [
    { id: "basic", labelEn: "Basic", labelEs: "Básico", optionIndex: 0 },
    { id: "standard", labelEn: "Standard", labelEs: "Estándar", optionIndex: 1 },
    { id: "premium", labelEn: "Premium", labelEs: "Premium", optionIndex: 2 },
  ],
  /** Burial: funeral home (state) + tiered merchandise; opening uses state average. */
  burialLines: [
    {
      id: "casket",
      labelEn: "Casket",
      labelEs: "Ataúd",
      type: "select",
      options: [
        { labelEn: "$995 (Basic)", labelEs: "$995 (Básico)", amount: 995 },
        { labelEn: "$2,495 (Standard)", labelEs: "$2,495 (Estándar)", amount: 2495 },
        { labelEn: "$5,995 (Premium)", labelEs: "$5,995 (Premium)", amount: 5995 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "vault",
      labelEn: "Vault",
      labelEs: "Bóveda",
      type: "select",
      options: [
        { labelEn: "$995 (Basic)", labelEs: "$995 (Básica — concreto)", amount: 995 },
        { labelEn: "$1,495 (Standard)", labelEs: "$1,495 (Estándar)", amount: 1495 },
        { labelEn: "$2,495 (Premium)", labelEs: "$2,495 (Premium)", amount: 2495 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "cemetery",
      labelEn: "Cemetery Property",
      labelEs: "Propiedad en cementerio",
      type: "cemeteryTier",
    },
    {
      id: "opening",
      labelEn: "Opening/Closing Grave",
      labelEs: "Apertura/cierre de tumba",
      type: "openingTier",
    },
    {
      id: "flowers",
      labelEn: "Flowers",
      labelEs: "Flores",
      type: "select",
      options: [
        { labelEn: "$250 (Basic)", labelEs: "$250 (Básico)", amount: 250 },
        { labelEn: "$500 (Standard)", labelEs: "$500 (Estándar)", amount: 500 },
        { labelEn: "$1,000 (Premium)", labelEs: "$1,000 (Premium)", amount: 1000 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "deathCerts",
      labelEn: "Death Certificates",
      labelEs: "Certificados de defunción",
      type: "select",
      options: [
        { labelEn: "$500", labelEs: "$500", amount: 500 },
        { labelEn: "$500", labelEs: "$500", amount: 500 },
        { labelEn: "$500", labelEs: "$500", amount: 500 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "stationery",
      labelEn: "Stationery Package",
      labelEs: "Paquete de papelería",
      type: "select",
      options: [
        { labelEn: "$50 (Basic)", labelEs: "$50 (Básico)", amount: 50 },
        { labelEn: "$75 (Standard)", labelEs: "$75 (Estándar)", amount: 75 },
        { labelEn: "$100 (Premium)", labelEs: "$100 (Premium)", amount: 100 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "honorarium",
      labelEn: "Honorarium",
      labelEs: "Honorario (oficiante)",
      type: "select",
      options: [
        { labelEn: "$100 (Basic)", labelEs: "$100 (Básico)", amount: 100 },
        { labelEn: "$200 (Standard)", labelEs: "$200 (Estándar)", amount: 200 },
        { labelEn: "$300 (Premium)", labelEs: "$300 (Premium)", amount: 300 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "catering",
      labelEn: "Catering",
      labelEs: "Catering",
      type: "select",
      options: [
        { labelEn: "$500 (Basic)", labelEs: "$500 (Básico)", amount: 500 },
        { labelEn: "$1,000 (Standard)", labelEs: "$1,000 (Estándar)", amount: 1000 },
        { labelEn: "$2,000 (Premium)", labelEs: "$2,000 (Premium)", amount: 2000 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "misc",
      labelEn: "Miscellaneous Items",
      labelEs: "Artículos varios",
      type: "select",
      options: [
        { labelEn: "$500 (Basic)", labelEs: "$500 (Básico)", amount: 500 },
        { labelEn: "$1,000 (Standard)", labelEs: "$1,000 (Estándar)", amount: 1000 },
        { labelEn: "$1,500 (Premium)", labelEs: "$1,500 (Premium)", amount: 1500 },
        MVI_FE_NOT_DESIRED,
      ],
    },
  ],
  /** Cremation: funeral home total (state) + Legacy-style merchandise tiers. */
  cremationLines: [
    {
      id: "urn",
      labelEn: "Cremation Urn",
      labelEs: "Urna de cremación",
      type: "select",
      options: [
        { labelEn: "$195 (Basic)", labelEs: "$195 (Básica)", amount: 195 },
        { labelEn: "$495 (Standard)", labelEs: "$495 (Estándar)", amount: 495 },
        { labelEn: "$995 (Premium)", labelEs: "$995 (Premium)", amount: 995 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "flowers",
      labelEn: "Flowers",
      labelEs: "Flores",
      type: "select",
      options: [
        { labelEn: "$250 (Basic)", labelEs: "$250 (Básico)", amount: 250 },
        { labelEn: "$500 (Standard)", labelEs: "$500 (Estándar)", amount: 500 },
        { labelEn: "$1,000 (Premium)", labelEs: "$1,000 (Premium)", amount: 1000 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "deathCerts",
      labelEn: "Death Certificates",
      labelEs: "Certificados de defunción",
      type: "select",
      options: [
        { labelEn: "$500", labelEs: "$500", amount: 500 },
        { labelEn: "$500", labelEs: "$500", amount: 500 },
        { labelEn: "$500", labelEs: "$500", amount: 500 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "stationery",
      labelEn: "Stationery Package",
      labelEs: "Paquete de papelería",
      type: "select",
      options: [
        { labelEn: "$50 (Basic)", labelEs: "$50 (Básico)", amount: 50 },
        { labelEn: "$75 (Standard)", labelEs: "$75 (Estándar)", amount: 75 },
        { labelEn: "$100 (Premium)", labelEs: "$100 (Premium)", amount: 100 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "honorarium",
      labelEn: "Honorarium",
      labelEs: "Honorario (oficiante)",
      type: "select",
      options: [
        { labelEn: "$100 (Basic)", labelEs: "$100 (Básico)", amount: 100 },
        { labelEn: "$200 (Standard)", labelEs: "$200 (Estándar)", amount: 200 },
        { labelEn: "$300 (Premium)", labelEs: "$300 (Premium)", amount: 300 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "catering",
      labelEn: "Catering",
      labelEs: "Catering",
      type: "select",
      options: [
        { labelEn: "$500 (Basic)", labelEs: "$500 (Básico)", amount: 500 },
        { labelEn: "$1,000 (Standard)", labelEs: "$1,000 (Estándar)", amount: 1000 },
        { labelEn: "$2,000 (Premium)", labelEs: "$2,000 (Premium)", amount: 2000 },
        MVI_FE_NOT_DESIRED,
      ],
    },
    {
      id: "misc",
      labelEn: "Miscellaneous Items",
      labelEs: "Artículos varios",
      type: "select",
      options: [
        { labelEn: "$500 (Basic)", labelEs: "$500 (Básico)", amount: 500 },
        { labelEn: "$1,000 (Standard)", labelEs: "$1,000 (Estándar)", amount: 1000 },
        { labelEn: "$1,500 (Premium)", labelEs: "$1,500 (Premium)", amount: 1500 },
        MVI_FE_NOT_DESIRED,
      ],
    },
  ],
  familyMonthsOptions: [1, 2, 3, 6, 9, 12],
  /**
   * Info bubble copy (Legacy Safeguard–style). Burial funeral-home breakdown
   * uses Nebraska amounts as template; scaled to each state’s funeral home total.
   */
  lineInfo: {
    funeralHomeBurialBreakdown: [
      {
        labelEn: "Basic Services for Director and Staff",
        labelEs: "Servicios básicos del director y personal",
        amount: 1715,
      },
      { labelEn: "Embalming", labelEs: "Embalsamado", amount: 642 },
      { labelEn: "Dressing and Casketing", labelEs: "Vestido y colocación en ataúd", amount: 248 },
      {
        labelEn: "Facilities and Staff for Visitation",
        labelEs: "Instalaciones y personal para visita",
        amount: 363,
      },
      { labelEn: "Transfer to Funeral home", labelEs: "Traslado a la funeraria", amount: 279 },
      { labelEn: "Hearse", labelEs: "Carroza", amount: 246 },
      { labelEn: "Limousine", labelEs: "Limusina", amount: 194 },
      { labelEn: "Utility and Flower vehicle", labelEs: "Vehículo de servicio y flores", amount: 117 },
    ],
    funeralHomeCremation: {
      infoEn:
        "Funeral home expenses for cremation typically include basic services of the director and staff, transfer, preparation, use of facilities for a memorial service, and coordination of cremation arrangements. Amounts vary by state.",
      infoEs:
        "Los gastos de funeraria para cremación suelen incluir servicios básicos del director y personal, traslado, preparación, uso de instalaciones para un servicio conmemorativo y coordinación de la cremación. Los montos varían según el estado.",
    },
    casket: {
      infoEn:
        "Casket prices vary depending upon many factors, including the choice of different metals or woods that are chosen.",
      infoEs:
        "Los precios del ataúd varían según muchos factores, incluida la elección de diferentes metales o maderas.",
    },
    vault: {
      infoEn:
        "Most cemeteries require an outer burial container or burial vault to protect the grave and so that the ground does not settle over time. (Outer Burial Container)",
      infoEs:
        "La mayoría de los cementerios exigen un contenedor exterior o bóveda para proteger la tumba y evitar que el terreno se hunda con el tiempo. (Contenedor exterior de entierro)",
    },
    cemetery: {
      infoEn:
        "If you do not currently have cemetery property you might consider setting aside funds to pay for this expense.",
      infoEs:
        "Si aún no tienes propiedad en un cementerio, considera reservar fondos para cubrir este gasto.",
    },
    opening: {
      infoEn:
        "Opening and closing of the grave also includes the cost of preparing the cemetery property for burial and setting up for the graveside service.",
      infoEs:
        "La apertura y el cierre de la tumba también incluyen preparar el lote en el cementerio y organizar el servicio en la tumba.",
    },
    flowers: {
      infoEn:
        "It's traditional to have flower arrangements at funeral ceremonies. You may choose to set aside funds to help provide this expense for your family.",
      infoEs:
        "Es tradicional tener arreglos florales en ceremonias funerarias. Puedes reservar fondos para ayudar a tu familia con este gasto.",
    },
    deathCerts: {
      infoEn:
        "Death certificates and obituary expense also need to be accounted for. The price for obituaries varies depending on the number of newspapers and which newspapers you choose to include an obituary.",
      infoEs:
        "Los certificados de defunción y el costo del obituario también deben contemplarse. El precio del obituario varía según la cantidad de periódicos y cuáles elijas.",
    },
    stationery: {
      infoEn:
        "Stationery packages include register books, thank you cards, and memorial folders for the ceremony.",
      infoEs:
        "Los paquetes de papelería incluyen libros de registro, tarjetas de agradecimiento y carpetas conmemorativas para la ceremonia.",
    },
    honorarium: {
      infoEn:
        "It's customary to provide an honorarium or gift to the officiant who conducts the service and to any musicians that perform (e.g. preacher, singer, pianist, and any other individuals that help conduct the service).",
      infoEs:
        "Es costumbre ofrecer un honorario o regalo al oficiante que dirige el servicio y a los músicos que participan (por ejemplo, pastor, cantante, pianista y quienes ayuden a conducir el servicio).",
    },
    catering: {
      infoEn:
        "A common tradition is for families to gather for a meal after the service; you may want to set aside money to help pay for this event.",
      infoEs:
        "Es tradición que las familias se reúnan para comer después del servicio; puedes reservar dinero para ayudar a cubrir este evento.",
    },
    misc: {
      infoEn:
        "There are always unforeseen expenses that arise when preparing for any budget, so it is recommended to plan for some miscellaneous funds to help cover these costs.",
      infoEs:
        "Siempre surgen gastos imprevistos al preparar cualquier presupuesto, por lo que se recomienda reservar fondos varios para ayudar a cubrir estos costos.",
    },
    urn: {
      infoEn:
        "Cremation urn prices vary by material, size, and design — from simple containers to decorative keepsake urns.",
      infoEs:
        "Los precios de la urna varían según el material, tamaño y diseño — desde contenedores sencillos hasta urnas decorativas.",
    },
    familyMonthly: {
      infoEn:
        "Monthly household costs your family may need to cover after a loss — such as rent, mortgage, utilities, or car payments.",
      infoEs:
        "Gastos mensuales del hogar que tu familia podría necesitar cubrir tras una pérdida, como renta, hipoteca, servicios o pagos del auto.",
    },
    familyOther: {
      infoEn:
        "One-time family expenses such as medical bills, legal fees, or other debts you want your plan to address.",
      infoEs:
        "Gastos familiares únicos como facturas médicas, honorarios legales u otras deudas que quieras incluir en tu plan.",
    },
  },
};
