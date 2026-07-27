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
