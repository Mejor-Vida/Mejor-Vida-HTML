const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody } = require("./_inbox-lib");
const {
  buildAgentCredentialsIntroPlainText,
  buildAgentCredentialsSubject,
  VCF_URL,
  LICENSE_LOOKUP_URL,
} = require("../../lib/agent-credentials-email-template");
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

  const subject = buildAgentCredentialsSubject({ language, firstName });
  const bodyText = buildAgentCredentialsIntroPlainText({ language, firstName });

  return json(res, 200, {
    subject,
    body: bodyText,
    vcardUrl: VCF_URL,
    licenseVerifyUrl: LICENSE_LOOKUP_URL,
  });
};
