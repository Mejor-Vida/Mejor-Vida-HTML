const {
  exchangeOAuthCode,
  createMetaAdAccessToken,
  debugMetaToken,
} = require("../../lib/meta-system-user-token");
const { getMetaAppConfig, resolveMetaOAuthRedirectUri } = require("../../lib/meta-oauth-config");

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tokenSummary(result, debug) {
  if (result.tokenType === "system_user" && debug.isNeverExpiring) {
    return "Permanent system user token (does not expire).";
  }
  if (result.tokenType === "system_user") {
    return "System user token (~60 days). Re-run /api/staff/meta-ads-auth before it expires.";
  }
  if (debug.expiresIso) {
    return "Long-lived user token — expires around " + debug.expiresIso + ". Re-run auth to renew.";
  }
  return "Long-lived user token (~60 days). Re-run /api/staff/meta-ads-auth before it expires.";
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const code = String((req.query && req.query.code) || "").trim();
  const oauthError = String(
    (req.query && req.query.error_description) || (req.query && req.query.error) || ""
  ).trim();
  if (oauthError) {
    return res.status(400).send("Meta OAuth error: " + escapeHtml(oauthError));
  }
  if (!code) {
    return res.status(400).send("Missing OAuth code");
  }

  const { systemUserId } = getMetaAppConfig();
  const redirectUri = resolveMetaOAuthRedirectUri(req);
  const userOnly =
    String((req.query && req.query.state) || "").trim() === "user" ||
    String((req.query && req.query.user) || "").trim() === "1";

  try {
    const userToken = await exchangeOAuthCode(code, redirectUri);
    const result = await createMetaAdAccessToken(userToken, { userOnly });
    const token = String(result.access_token || "").trim();
    if (!token) {
      return res.status(500).send("Meta returned no access_token.");
    }

    const debug = await debugMetaToken(token);
    const summary = tokenSummary(result, debug);

    const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Meta ad access token</title></head>
<body style="font-family:system-ui,sans-serif;padding:24px;max-width:760px;line-height:1.5">
  <h2>Meta ad access token</h2>
  <p>Copy into <code>META_AD_ACCESS_TOKEN</code> in <code>.env.local</code> and Vercel, then redeploy.</p>
  <p>Also confirm <code>META_AD_ACCOUNT_ID=act_845948004443182</code> (or run <code>npm run meta:ads-discover</code>).</p>
  <p><strong>${escapeHtml(summary)}</strong></p>
  <p>Type: <code>${escapeHtml(result.tokenType || "unknown")}</code></p>
  ${
    result.tokenType === "system_user"
      ? `<p>System user: <code>${escapeHtml(systemUserId)}</code></p>`
      : ""
  }
  <p>Scopes: <code>${escapeHtml((debug.scopes || []).join(", "))}</code></p>
  ${result.fallbackReason ? `<p style="color:#b45309">Note: ${escapeHtml(result.fallbackReason)}</p>` : ""}
  <pre style="white-space:pre-wrap;word-break:break-all;background:#f1f5f9;padding:12px;border-radius:8px">${escapeHtml(token)}</pre>
  <p><a href="/api/staff/meta-ads-auth">Try system user again</a> · <a href="/api/staff/meta-ads-auth?user=1">User token only</a></p>
</body>
</html>`;

    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    res.status(500).send("Failed to create Meta ad token: " + escapeHtml(e.message || "unknown"));
  }
};
