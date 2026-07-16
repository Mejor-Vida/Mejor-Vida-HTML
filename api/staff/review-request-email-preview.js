const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody } = require("./_inbox-lib");
const {
  buildReviewRequestPlainText,
  buildReviewRequestSubject,
  googleReviewUrl,
  facebookReviewUrl,
} = require("../../lib/review-request-email-template");
const { normalizeFirstName } = require("../../lib/medical-intake-lead-greeting");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const language = body && body.language != null ? String(body.language).trim() : "English";
  const firstName = normalizeFirstName(body && body.firstName != null ? body.firstName : "");
  const googleLink = googleReviewUrl();
  const facebookLink = facebookReviewUrl();

  const subject = buildReviewRequestSubject({ language, firstName });
  const bodyText = buildReviewRequestPlainText({
    language,
    firstName,
    googleReviewLink: googleLink,
    facebookReviewLink: facebookLink,
  });

  return json(res, 200, {
    subject,
    body: bodyText,
    previewLink: googleLink,
    googleReviewLink: googleLink,
    facebookReviewLink: facebookLink,
  });
};
