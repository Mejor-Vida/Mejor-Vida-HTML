/**
 * Review request email copy (EN/ES) — Google (primary) + Facebook review links for staff Connect tab.
 */

const { salutationLine, normalizeFirstName } = require("./medical-intake-lead-greeting");

const DEFAULT_GOOGLE_REVIEW_URL = "https://g.page/r/CYawTzl8HannEBI/review";

/** Same destination as Google’s GBP QR (includes QR campaign UTM). */
const DEFAULT_GOOGLE_REVIEW_QR_URL =
  "https://g.page/r/CYawTzl8HannEBI/review?utm_source=gbp&utm_medium=reviews&utm_campaign=qr";

const DEFAULT_GOOGLE_REVIEW_QR_IMAGE_URL =
  "https://www.mejorvidainsurance.com/img/google-review-qr.png";

/** Content-ID for inline QR in review-request HTML emails (no remote fetch). */
const GOOGLE_REVIEW_QR_CID = "google-review-qr";
const GOOGLE_REVIEW_QR_CID_SRC = `cid:${GOOGLE_REVIEW_QR_CID}`;

const DEFAULT_FACEBOOK_REVIEW_URL =
  "https://www.facebook.com/MejorVidaInsurance/reviews";

function googleReviewUrl() {
  const fromEnv = String(process.env.GOOGLE_REVIEW_URL || "").trim();
  return fromEnv || DEFAULT_GOOGLE_REVIEW_URL;
}

function googleReviewQrUrl() {
  const fromEnv = String(process.env.GOOGLE_REVIEW_QR_URL || "").trim();
  return fromEnv || DEFAULT_GOOGLE_REVIEW_QR_URL;
}

function googleReviewQrImageUrl() {
  const fromEnv = String(process.env.GOOGLE_REVIEW_QR_IMAGE_URL || "").trim();
  return fromEnv || DEFAULT_GOOGLE_REVIEW_QR_IMAGE_URL;
}

function facebookReviewUrl() {
  const fromEnv = String(process.env.FACEBOOK_REVIEW_URL || "").trim();
  return fromEnv || DEFAULT_FACEBOOK_REVIEW_URL;
}

/** @deprecated use googleReviewUrl — primary review destination */
function reviewUrl() {
  return googleReviewUrl();
}

function buildReviewRequestSubject({ language, firstName }) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const n = normalizeFirstName(firstName);
  if (useEs) {
    return n ? `¿Podrías dejarnos una reseña, ${n}?` : "¿Podrías dejarnos una reseña?";
  }
  return n ? `Would you share a quick review, ${n}?` : "Would you share a quick review?";
}

function buildReviewRequestPlainText({
  language,
  firstName,
  reviewLink,
  googleReviewLink,
  facebookReviewLink,
}) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const salutation = salutationLine(language, firstName);
  const google = String(googleReviewLink || reviewLink || googleReviewUrl()).trim();
  const fb = String(facebookReviewLink || facebookReviewUrl()).trim();

  if (useEs) {
    return (
      `${salutation}\n\n` +
      `Gracias por confiar en Mejor Vida Insurance. Tu opinión ayuda a otras familias a encontrar ` +
      `orientación bilingüe sobre seguros de gastos finales.\n\n` +
      `Si tuviste una buena experiencia con Julie, ¿podrías dejarnos una reseña breve en Google? ` +
      `Solo toma un minuto y significa mucho para nosotros.\n\n` +
      `Dejar una reseña en Google:\n${google}\n\n` +
      `También puedes reseñarnos en Facebook:\n${fb}\n\n` +
      `Gracias de corazón por tu apoyo.\n\nJulie Braunsroth\nMejor Vida Insurance`
    );
  }

  return (
    `${salutation}\n\n` +
    `Thank you for trusting Mejor Vida Insurance. Your feedback helps other families find ` +
    `bilingual final expense guidance.\n\n` +
    `If Julie was helpful to you, would you leave a short review on Google? ` +
    `It only takes a minute and it means a great deal to our small team.\n\n` +
    `Leave a review on Google:\n${google}\n\n` +
    `You can also leave a review on Facebook:\n${fb}\n\n` +
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

function buildReviewRequestCtaHtml({
  language,
  reviewLink,
  googleReviewLink,
  facebookReviewLink,
  googleReviewQrImage,
}) {
  const useEs = /spanish|español|espanol|^es$/i.test(String(language || ""));
  const google = String(googleReviewLink || reviewLink || googleReviewUrl()).trim();
  const fb = String(facebookReviewLink || facebookReviewUrl()).trim();
  const qrImg = String(
    googleReviewQrImage || GOOGLE_REVIEW_QR_CID_SRC || googleReviewQrImageUrl()
  ).trim();
  const qrHref = googleReviewQrUrl();
  const googleLabel = useEs ? "Dejar reseña en Google" : "Leave a review on Google";
  const fbLabel = useEs ? "Dejar reseña en Facebook" : "Leave a review on Facebook";
  const qrCaption = useEs
    ? "O escanea el código QR para reseñar en Google"
    : "Or scan the QR code to review on Google";

  const buttons =
    reviewButtonHtml({
      href: google,
      label: googleLabel,
      bg: "#1a4d8c",
      color: "#ffffff",
    }) +
    reviewButtonHtml({
      href: fb,
      label: fbLabel,
      bg: "#1877f2",
      color: "#ffffff",
    });

  const qrBlock =
    `<p style="margin:8px 0 0;text-align:center;font-size:14px;color:#555;">${qrCaption}</p>` +
    `<p style="margin:12px 0 0;text-align:center;">` +
    `<a href="${qrHref.replace(/"/g, "&quot;")}" style="text-decoration:none;">` +
    `<img src="${qrImg.replace(/"/g, "&quot;")}" alt="${qrCaption}" width="160" height="160" ` +
    `style="display:inline-block;border:0;width:160px;height:160px;" />` +
    `</a></p>`;

  return (
    `<p style="margin:24px 0 8px;text-align:center;line-height:1.4;">${buttons}</p>` + qrBlock
  );
}

module.exports = {
  DEFAULT_GOOGLE_REVIEW_URL,
  DEFAULT_GOOGLE_REVIEW_QR_URL,
  DEFAULT_GOOGLE_REVIEW_QR_IMAGE_URL,
  GOOGLE_REVIEW_QR_CID,
  GOOGLE_REVIEW_QR_CID_SRC,
  DEFAULT_FACEBOOK_REVIEW_URL,
  googleReviewUrl,
  googleReviewQrUrl,
  googleReviewQrImageUrl,
  facebookReviewUrl,
  reviewUrl,
  buildReviewRequestSubject,
  buildReviewRequestPlainText,
  buildReviewRequestCtaHtml,
};
