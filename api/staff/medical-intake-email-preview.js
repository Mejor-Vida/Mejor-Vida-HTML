const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody } = require("./_inbox-lib");
const {
  MEDICAL_INTAKE_PREVIEW_LINK,
  buildMedicalIntakePlainText,
  buildMedicalIntakeSubject,
} = require("../../lib/medical-intake-email-template");
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

  const subject = buildMedicalIntakeSubject({ language });
  const bodyText = buildMedicalIntakePlainText({
    language,
    firstName,
    intakeUrl: MEDICAL_INTAKE_PREVIEW_LINK,
  });

  return json(res, 200, { subject, body: bodyText, previewLink: MEDICAL_INTAKE_PREVIEW_LINK });
};
