/**
 * Shared Gmail OAuth redirect URI. Drive backup reuses this callback so we do
 * not have to register a new Google Cloud redirect URI.
 */
const PRODUCTION_GMAIL_REDIRECT_URI =
  "https://www.mejorvidainsurance.com/api/staff/gmail-callback";

function productionGmailRedirectUri() {
  // Must match api/staff/gmail-auth.js exactly. Do not use GMAIL_REDIRECT_URI —
  // that env has been stored with a capital "Https" and Google rejects it.
  return PRODUCTION_GMAIL_REDIRECT_URI;
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
