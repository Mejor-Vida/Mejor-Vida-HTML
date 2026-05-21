/**
 * Nebraska final expense funeral cost estimator — line items aligned with
 * industry planning tools (burial / cremation). Amounts are illustrative
 * averages for Nebraska; not a binding quote.
 */
window.MVI_FE_ESTIMATOR_DATA = {
  state: { code: "NE", nameEn: "Nebraska", nameEs: "Nebraska" },
  storageKey: "mviFeEstimatorV1",
  burial: {
    funeralHome: 3804,
    lines: [
      {
        id: "casket",
        labelEn: "Casket",
        labelEs: "Ataúd",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$995 (Basic)", labelEs: "$995 (Básico)", amount: 995 },
          { labelEn: "$2,495 (Standard)", labelEs: "$2,495 (Estándar)", amount: 2495 },
          { labelEn: "$4,995 (Premium)", labelEs: "$4,995 (Premium)", amount: 4995 },
        ],
      },
      {
        id: "vault",
        labelEn: "Vault",
        labelEs: "Bóveda",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$995 (Basic — Concrete)", labelEs: "$995 (Básica — concreto)", amount: 995 },
          { labelEn: "$1,495 (Standard)", labelEs: "$1,495 (Estándar)", amount: 1495 },
          { labelEn: "$2,495 (Premium)", labelEs: "$2,495 (Premium)", amount: 2495 },
        ],
      },
      { id: "cemetery", labelEn: "Cemetery Property", labelEs: "Propiedad en cementerio", type: "fixed", amount: 1500 },
      { id: "opening", labelEn: "Opening/Closing Grave", labelEs: "Apertura/cierre de tumba", type: "fixed", amount: 1500 },
      {
        id: "flowers",
        labelEn: "Flowers",
        labelEs: "Flores",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$250", labelEs: "$250", amount: 250 },
          { labelEn: "$500", labelEs: "$500", amount: 500 },
          { labelEn: "$750", labelEs: "$750", amount: 750 },
        ],
      },
      {
        id: "deathCerts",
        labelEn: "Death Certificates",
        labelEs: "Certificados de defunción",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$500", labelEs: "$500", amount: 500 },
          { labelEn: "$750", labelEs: "$750", amount: 750 },
        ],
      },
      {
        id: "stationery",
        labelEn: "Stationery Package",
        labelEs: "Paquete de papelería",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$50", labelEs: "$50", amount: 50 },
          { labelEn: "$150", labelEs: "$150", amount: 150 },
        ],
      },
      {
        id: "honorarium",
        labelEn: "Honorarium",
        labelEs: "Honorario (oficiante)",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$100", labelEs: "$100", amount: 100 },
          { labelEn: "$250", labelEs: "$250", amount: 250 },
        ],
      },
      {
        id: "catering",
        labelEn: "Catering",
        labelEs: "Catering",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$500", labelEs: "$500", amount: 500 },
          { labelEn: "$1,000", labelEs: "$1,000", amount: 1000 },
        ],
      },
      {
        id: "misc",
        labelEn: "Miscellaneous Items",
        labelEs: "Artículos varios",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$500", labelEs: "$500", amount: 500 },
          { labelEn: "$1,000", labelEs: "$1,000", amount: 1000 },
        ],
      },
    ],
  },
  cremation: {
    funeralHome: 5088,
    lines: [
      {
        id: "urn",
        labelEn: "Cremation Urn",
        labelEs: "Urna de cremación",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$195 (Basic)", labelEs: "$195 (Básica)", amount: 195 },
          { labelEn: "$495 (Standard)", labelEs: "$495 (Estándar)", amount: 495 },
          { labelEn: "$995 (Premium)", labelEs: "$995 (Premium)", amount: 995 },
        ],
      },
      {
        id: "flowers",
        labelEn: "Flowers",
        labelEs: "Flores",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$250", labelEs: "$250", amount: 250 },
          { labelEn: "$500", labelEs: "$500", amount: 500 },
        ],
      },
      {
        id: "deathCerts",
        labelEn: "Death Certificates",
        labelEs: "Certificados de defunción",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$500", labelEs: "$500", amount: 500 },
          { labelEn: "$750", labelEs: "$750", amount: 750 },
        ],
      },
      {
        id: "stationery",
        labelEn: "Stationery Package",
        labelEs: "Paquete de papelería",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$50", labelEs: "$50", amount: 50 },
          { labelEn: "$150", labelEs: "$150", amount: 150 },
        ],
      },
      {
        id: "honorarium",
        labelEn: "Honorarium",
        labelEs: "Honorario (oficiante)",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$100", labelEs: "$100", amount: 100 },
          { labelEn: "$250", labelEs: "$250", amount: 250 },
        ],
      },
      {
        id: "catering",
        labelEn: "Catering",
        labelEs: "Catering",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$500", labelEs: "$500", amount: 500 },
          { labelEn: "$1,000", labelEs: "$1,000", amount: 1000 },
        ],
      },
      {
        id: "misc",
        labelEn: "Miscellaneous Items",
        labelEs: "Artículos varios",
        type: "select",
        defaultIndex: 0,
        options: [
          { labelEn: "$500", labelEs: "$500", amount: 500 },
          { labelEn: "$1,000", labelEs: "$1,000", amount: 1000 },
        ],
      },
    ],
  },
  familyMonthsOptions: [1, 2, 3, 6, 9, 12],
};
