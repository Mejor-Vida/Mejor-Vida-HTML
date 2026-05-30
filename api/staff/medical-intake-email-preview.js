const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody } = require("./_inbox-lib");
const {
  buildMedicalIntakePlainText,
  buildMedicalIntakeSubject,
} = require("../../lib/medical-intake-email-template");

const PREVIEW_LINK =
  "https://www.mejorvidainsurance.com/medical-intake.html?t=[secure link created when you send]";

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
  const firstName = body && body.firstName != null ? String(body.firstName).trim() : "there";

  const subject = buildMedicalIntakeSubject({ language });
  const bodyText = buildMedicalIntakePlainText({
    language,
    firstName: firstName || "there",
    intakeUrl: PREVIEW_LINK,
  });

  return json(res, 200, { subject, body: bodyText, previewLink: PREVIEW_LINK });
};
