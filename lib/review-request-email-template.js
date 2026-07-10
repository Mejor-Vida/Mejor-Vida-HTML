/**
 * Review request email copy (EN/ES) — Facebook review link for staff Connect tab.
 */

const { salutationLine, normalizeFirstName } = require("./medical-intake-lead-greeting");

const DEFAULT_FACEBOOK_REVIEW_URL =
  "https://www.facebook.com/MejorVidaInsurance/reviews";

function facebookReviewUrl() {
  const fromEnv = String(process.env.FACEBOOK_REVIEW_URL || "").trim();
  return fromEnv || DEFAULT_FACEBOOK_REVIEW_URL;
}

/** @deprecated use facebookReviewUrl */
function reviewUrl() {
  return facebookReviewUrl();
}

function buildReviewRequestSubject({ language, firstName }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const n = normalizeFirstName(firstName);
  if (useEs) {
    return n ? `¿Podrías dejarnos una reseña, ${n}?` : "¿Podrías dejarnos una reseña?";
  }
  return n ? `Would you share a quick review, ${n}?` : "Would you share a quick review?";
}

function buildReviewRequestPlainText({ language, firstName, reviewLink, facebookReviewLink }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const salutation = salutationLine(language, firstName);
  const fb = String(facebookReviewLink || reviewLink || facebookReviewUrl()).trim();

  if (useEs) {
    return (
      `${salutation}\n\n` +
      `Gracias por confiar en Mejor Vida Insurance. Tu opinión ayuda a otras familias a encontrar ` +
      `orientación bilingüe sobre seguros de gastos finales en Nebraska, Kansas, Colorado y Nevada.\n\n` +
      `Si tuviste una buena experiencia con Julie, ¿podrías dejarnos una reseña breve en Facebook? ` +
      `Solo toma un minuto y significa mucho para nosotros.\n\n` +
      `Dejar una reseña en Facebook:\n${fb}\n\n` +
      `Gracias de corazón por tu apoyo.\n\nJulie Braunsroth\nMejor Vida Insurance`
    );
  }

  return (
    `${salutation}\n\n` +
    `Thank you for trusting Mejor Vida Insurance. Your feedback helps other families find ` +
    `bilingual final expense guidance in Nebraska, Kansas, Colorado, and Nevada.\n\n` +
    `If Julie was helpful to you, would you leave a short review on our Facebook page? ` +
    `It only takes a minute and it means a great deal to our small team.\n\n` +
    `Leave a review on Facebook:\n${fb}\n\n` +
    `Thank you sincerely for your support.\n\nJulie Braunsroth\nMejor Vida Insurance`
  );
}

function reviewButtonHtml({ href, label, bg, color }) {
  const safeUrl = String(href || "").replace(/"/g, "&quot;");
  return (
    `<a href="${safeUrl}" style="display:inline-block;padding:14px 28px;background:${bg};color:${color};` +
    `text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;margin:6px 8px;">${label}</a>`
  );
}

function buildReviewRequestCtaHtml({ language, reviewLink, facebookReviewLink }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const fb = String(facebookReviewLink || reviewLink || facebookReviewUrl()).trim();
  const fbLabel = useEs ? "Dejar reseña en Facebook" : "Leave a review on Facebook";

  const buttons = reviewButtonHtml({
    href: fb,
    label: fbLabel,
    bg: "#1a4d8c",
    color: "#ffffff",
  });

  return `<p style="margin:24px 0;text-align:center;line-height:1.4;">${buttons}</p>`;
}

module.exports = {
  DEFAULT_FACEBOOK_REVIEW_URL,
  facebookReviewUrl,
  reviewUrl,
  buildReviewRequestSubject,
  buildReviewRequestPlainText,
  buildReviewRequestCtaHtml,
};
