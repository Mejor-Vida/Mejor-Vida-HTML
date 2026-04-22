const { google } = require("googleapis");
const { requireStaffAuth } = require("../auth-check");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const code = String((req.query && req.query.code) || "").trim();
  if (!code) return res.status(400).send("Missing OAuth code");

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri =
    process.env.GMAIL_REDIRECT_URI ||
    "https://www.mejorvidainsurance.com/api/staff/gmail-callback";
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing Gmail OAuth configuration");
  }

  try {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const tokenRes = await oauth2Client.getToken(code);
    const refreshToken =
      tokenRes &&
      tokenRes.tokens &&
      tokenRes.tokens.refresh_token
        ? String(tokenRes.tokens.refresh_token)
        : "";

    const html = refreshToken
      ? `<!doctype html><html><body style="font-family:Arial,sans-serif;padding:24px"><h2>Gmail Refresh Token</h2><p>Copy this value and set <code>GMAIL_REFRESH_TOKEN</code> in Vercel:</p><textarea style="width:100%;height:120px">${refreshToken}</textarea></body></html>`
      : `<!doctype html><html><body style="font-family:Arial,sans-serif;padding:24px"><h2>No refresh token returned</h2><p>Google did not return a refresh token. Re-run auth with consent prompt and ensure this is the first grant for this OAuth client/user.</p></body></html>`;

    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    res.status(500).send("Failed to exchange OAuth code");
  }
};
