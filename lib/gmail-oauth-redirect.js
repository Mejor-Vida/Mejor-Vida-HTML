/**
 * Shared Gmail OAuth redirect URI. Drive backup reuses this callback so we do
 * not have to register a new Google Cloud redirect URI.
 */
const PRODUCTION_GMAIL_REDIRECT_URI =
  "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function productionGmailRedirectUri() {
  return String(process.env.GMAIL_REDIRECT_URI || PRODUCTION_GMAIL_REDIRECT_URI).trim();
}

function gmailRedirectUriForRequest(req) {
  const host = String((req && req.headers && req.headers.host) || "");
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return `http://${host}/api/staff/gmail-callback`;
  }
  return productionGmailRedirectUri();
}

module.exports = {
  PRODUCTION_GMAIL_REDIRECT_URI,
  productionGmailRedirectUri,
  gmailRedirectUriForRequest,
};
