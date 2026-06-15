/**
 * Review request email copy (EN/ES) — Facebook reviews link for staff Connect tab.
 */

const { salutationLine, normalizeFirstName } = require("./medical-intake-lead-greeting");

const DEFAULT_FACEBOOK_REVIEW_URL =
  "https://www.facebook.com/MejorVidaInsurance/reviews";

function reviewUrl() {
  const fromEnv = String(process.env.FACEBOOK_REVIEW_URL || "").trim();
  return fromEnv || DEFAULT_FACEBOOK_REVIEW_URL;
}

function buildReviewRequestSubject({ language, firstName }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const n = normalizeFirstName(firstName);
  if (useEs) {
    return n ? `¿Podrías dejarnos una reseña, ${n}?` : "¿Podrías dejarnos una reseña?";
  }
  return n ? `Would you share a quick review, ${n}?` : "Would you share a quick review?";
}

function buildReviewRequestPlainText({ language, firstName, reviewLink }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const salutation = salutationLine(language, firstName);
  const url = String(reviewLink || reviewUrl()).trim();

  if (useEs) {
    return (
      `${salutation}\n\n` +
      `Gracias por confiar en Mejor Vida Insurance. Tu opinión ayuda a otras familias a encontrar ` +
      `orientación bilingüe sobre seguros de gastos finales aquí en Nebraska.\n\n` +
      `Si tuviste una buena experiencia con Julie, ¿podrías dejarnos una reseña breve en Facebook? ` +
      `Solo toma un minuto y significa mucho para nosotros.\n\n` +
      `Dejar una reseña en Facebook:\n${url}\n\n` +
      `Gracias de corazón por tu apoyo.\n\n` +
      `Julie Braunsroth\nMejor Vida Insurance`
    );
  }

  return (
    `${salutation}\n\n` +
    `Thank you for trusting Mejor Vida Insurance. Your feedback helps other families find ` +
    `bilingual final expense guidance here in Nebraska.\n\n` +
    `If Julie was helpful to you, would you leave a short review on our Facebook page? ` +
    `It only takes a minute and it means a great deal to our small team.\n\n` +
    `Leave a review on Facebook:\n${url}\n\n` +
    `Thank you sincerely for your support.\n\n` +
    `Julie Braunsroth\nMejor Vida Insurance`
  );
}

function buildReviewRequestCtaHtml({ language, reviewLink }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const label = useEs ? "Dejar una reseña en Facebook" : "Leave a review on Facebook";
  const safeUrl = String(reviewLink || reviewUrl()).replace(/"/g, "&quot;");
  return (
    `<p style="margin:24px 0;text-align:center;">` +
    `<a href="${safeUrl}" style="display:inline-block;padding:14px 28px;background:#1a4d8c;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;">` +
    `${label}</a></p>`
  );
}

module.exports = {
  DEFAULT_FACEBOOK_REVIEW_URL,
  reviewUrl,
  buildReviewRequestSubject,
  buildReviewRequestPlainText,
  buildReviewRequestCtaHtml,
};
