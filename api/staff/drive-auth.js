/**
 * GET /api/staff/drive-auth — one-time Google Drive consent for database backups.
 * Uses the cursor-sheets OAuth client (same as Search Console / GA4) so Drive API
 * can be enabled on a Cloud project the agency can open.
 * Sign in as admin@mejorvidainsurance.com so files land in the company Drive.
 */
const { hasGa4OAuthClientConfig } = require("../../lib/ga4-oauth-config");
const {
  DRIVE_SCOPE,
  DRIVE_BACKUP_STATE,
  PRODUCTION_DRIVE_REDIRECT_URI,
  driveOAuthClient,
} = require("../../lib/google-drive-backup");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  if (!hasGa4OAuthClientConfig()) {
    return res
      .status(500)
      .send("Missing OAuth client — set GA4_OAUTH_CLIENT_ID/SECRET or GMAIL_CLIENT_ID/SECRET");
  }

  const oauth2Client = driveOAuthClient(PRODUCTION_DRIVE_REDIRECT_URI);

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account consent",
    include_granted_scopes: false,
    state: DRIVE_BACKUP_STATE,
    scope: [DRIVE_SCOPE],
    login_hint: "admin@mejorvidainsurance.com",
  });
  res.redirect(url);
};
