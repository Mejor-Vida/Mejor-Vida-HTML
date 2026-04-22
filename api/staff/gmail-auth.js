const { google } = require("googleapis");
const { requireStaffAuth } = require("../auth-check");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri =
    process.env.GMAIL_REDIRECT_URI ||
    "https://www.mejorvidainsurance.com/api/staff/gmail-callback";
  if (!clientId || !clientSecret) {
    return res.status(500).send("Missing Gmail OAuth configuration");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.send"],
  });
  res.redirect(url);
};
