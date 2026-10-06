/**
 * Funeralocity state averages for Julie's licensed states.
 * Source: integrations/knowledge/Funeralocity_State_Costs/ne-ks-co-nv.json
 * Captured 2026-07-26 from Funeralocity average/full/short API.
 */
(function (global) {
  "use strict";

  var COSTS = {
    NE: {
      code: "NE",
      slug: "nebraska",
      nameEn: "Nebraska",
      nameEs: "Nebraska",
      sourceUrl: "https://www.funeralocity.com/average-funeral-price/ne",
      fullBurial: 8620,
      immediateBurial: 5467,
      fullCremation: 6530,
      directCremation: 2958,
    },
    KS: {
      code: "KS",
      slug: "kansas",
      nameEn: "Kansas",
      nameEs: "Kansas",
      sourceUrl: "https://www.funeralocity.com/average-funeral-price/ks",
      fullBurial: 8640,
      immediateBurial: 5374,
      fullCremation: 6452,
      directCremation: 2553,
    },
    CO: {
      code: "CO",
      slug: "colorado",
      nameEn: "Colorado",
      nameEs: "Colorado",
      sourceUrl: "https://www.funeralocity.com/average-funeral-price/co",
      fullBurial: 8162,
      immediateBurial: 4864,
      fullCremation: 5840,
      directCremation: 1730,
    },
    NV: {
      code: "NV",
      slug: "nevada",
      nameEn: "Nevada",
      nameEs: "Nevada",
      sourceUrl: "https://www.funeralocity.com/average-funeral-price/nv",
      fullBurial: 8538,
      immediateBurial: 4982,
      fullCremation: 6095,
      directCremation: 1467,
    },
    OH: {
      code: "OH",
      slug: "ohio",
      nameEn: "Ohio",
      nameEs: "Ohio",
      sourceUrl: "https://www.funeralocity.com/average-funeral-price/oh",
      fullBurial: 8018,
      immediateBurial: 4949,
      fullCremation: 5666,
      directCremation: 2056,
    },
    NM: {
      code: "NM",
      slug: "new-mexico",
      nameEn: "New Mexico",
      nameEs: "Nuevo México",
      sourceUrl: "https://www.funeralocity.com/average-funeral-price/nm",
      fullBurial: 7829,
      immediateBurial: 4757,
      fullCremation: 5588,
      directCremation: 1935,
    },
    SC: {
      code: "SC",
      slug: "south-carolina",
      nameEn: "South Carolina",
      nameEs: "Carolina del Sur",
      sourceUrl: "https://www.funeralocity.com/average-funeral-price/sc",
      fullBurial: 8270,
      immediateBurial: 4926,
      fullCremation: 6017,
      directCremation: 1911,
    },
    SD: {
      code: "SD",
      slug: "south-dakota",
      nameEn: "South Dakota",
      nameEs: "Dakota del Sur",
      sourceUrl: "https://www.funeralocity.com/average-funeral-price/sd",
      fullBurial: 8614,
      immediateBurial: 5164,
      fullCremation: 6689,
      directCremation: 2826,
    },
  };

  var LICENSE = {
    NE: {
      typeEn: "Resident producer",
      typeEs: "Productora residente",
      number: "21695431",
      pdf: "julie-license-ne.pdf",
    },
    KS: {
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "21695431",
      pdf: "julie-license-ks.pdf",
    },
    CO: {
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "955378",
      pdf: "julie-license-co.pdf",
    },
    NV: {
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "4237259",
      pdf: "julie-license-nv.pdf",
    },
    OH: {
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "1777665",
      pdf: "julie-license-oh.pdf?v=20260928-cert",
    },
    NM: {
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "21695431",
      pdf: "julie-license-nm.pdf?v=20260928-cert",
    },
    SC: {
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "21695431",
      pdf: "julie-license-sc.pdf?v=20260928-cert",
    },
    SD: {
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "21695431",
      pdf: "julie-license-sd.pdf?v=20260928-cert",
    },
  };

  var NPN = "21695431";

  function money(n) {
    return (
      "$" +
      Math.round(Number(n) || 0).toLocaleString("en-US", {
        maximumFractionDigits: 0,
      })
    );
  }

  function pageHref(code, isEs) {
    var info = COSTS[code];
    if (!info) return null;
    return isEs
      ? "/estados/" + info.slug + ".html"
      : "/en/states/" + info.slug + ".html";
  }

  global.MVI_STATE_COVERAGE = {
    costs: COSTS,
    license: LICENSE,
    npn: NPN,
    money: money,
    pageHref: pageHref,
    capturedAt: "2026-07-26",
    sourceLabel: "Funeralocity",
  };
})(typeof window !== "undefined" ? window : globalThis);
