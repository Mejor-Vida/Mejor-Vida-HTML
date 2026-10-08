const { productionGmailRedirectUri } = require("../../lib/gmail-oauth-redirect");
const { google } = require("../../lib/google-clients");

const CALENDAR_STATE = "mvi_calendar";

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

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, productionGmailRedirectUri());
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    state: CALENDAR_STATE,
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.readonly",
    ],
  });
  res.redirect(url);
};
