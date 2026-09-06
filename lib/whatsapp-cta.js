/**
 * WhatsApp click-to-chat copy that starts the ManyChat quote flow.
 * Must match the live Facebook Click-to-WhatsApp autofill (and the EN keyword).
 */
const WA_NUMBER = "14024405438";

const QUOTE_TRIGGER_ES = "Hola, quiero una cotización gratis de seguro de gastos finales.";
const QUOTE_TRIGGER_EN = "Hi, I want a free final expense insurance quote.";

function waQuoteUrl(lang) {
  const isEn = String(lang || "")
    .toLowerCase()
    .startsWith("en");
  const text = isEn ? QUOTE_TRIGGER_EN : QUOTE_TRIGGER_ES;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

module.exports = {
  WA_NUMBER,
  QUOTE_TRIGGER_ES,
  QUOTE_TRIGGER_EN,
  waQuoteUrl,
};
