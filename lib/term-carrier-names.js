/**
 * Display names for the carrier and product slugs the term quote engine
 * returns, so the results page can name the company that actually won the
 * quote instead of a hardcoded one.
 */

const CARRIER_NAMES = {
  transamerica: "Transamerica",
  moo: "Mutual of Omaha",
  corebridge: "Corebridge Financial",
  amam: "American Amicable",
  assurity: "Assurity",
  americo: "Americo",
  aetna: "Aetna",
};

const PRODUCT_NAMES = {
  trendsetter_super: "Trendsetter Super",
  trendsetter_lb: "Trendsetter LB",
  term_life_answers: "Term Life Answers",
  term_life_answers_brokerage: "Term Life Answers",
  term_life_express: "Term Life Express",
  qol_flex_term: "QoL Flex Term",
  qol_flex_term_simplinow_choice: "QoL Flex Term",
  select_a_term: "Select-a-Term",
  select_a_term_simplinow_choice: "Select-a-Term",
  easy_term: "Easy Term",
};

function carrierDisplayName(slug) {
  return CARRIER_NAMES[slug] || "";
}

function productDisplayName(slug) {
  return PRODUCT_NAMES[slug] || "";
}

/** "Transamerica Trendsetter Super", or just the carrier when the product is unknown. */
function quoteSourceLabel(carrierSlug, productSlug) {
  const carrier = carrierDisplayName(carrierSlug);
  if (!carrier) return "";
  const product = productDisplayName(productSlug);
  return product ? `${carrier} ${product}` : carrier;
}

module.exports = {
  CARRIER_NAMES,
  PRODUCT_NAMES,
  carrierDisplayName,
  productDisplayName,
  quoteSourceLabel,
};
