/**
 * GET /api/staff/drive-auth — one-time Google Drive consent for database backups.
 * Uses the production Gmail callback URI (already registered on the OAuth client).
 * Sign in as admin@mejorvidainsurance.com so files land in the company Drive.
 */
const { DRIVE_SCOPE, DRIVE_BACKUP_STATE, driveOAuthClient } = require("../../lib/google-drive-backup");
const { productionGmailRedirectUri } = require("../../lib/gmail-oauth-redirect");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing Gmail OAuth configuration");
  }

  const redirectUri = productionGmailRedirectUri();
  const oauth2Client = driveOAuthClient(redirectUri);
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
