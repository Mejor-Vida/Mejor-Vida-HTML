const {
  exchangeOAuthCode,
  createPermanentMetaAdToken,
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

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }

  const code = String((req.query && req.query.code) || "").trim();
  const oauthError = String((req.query && req.query.error_description) || (req.query && req.query.error) || "").trim();
  if (oauthError) {
    return res.status(400).send("Meta OAuth error: " + escapeHtml(oauthError));
  }
  if (!code) {
    return res.status(400).send("Missing OAuth code");
  }

  const { systemUserId } = getMetaAppConfig();
  const redirectUri = resolveMetaOAuthRedirectUri(req);

  try {
    const adminToken = await exchangeOAuthCode(code, redirectUri);
    const result = await createPermanentMetaAdToken(adminToken);
    const token = String(result.access_token || "").trim();
    if (!token) {
      return res.status(500).send("Meta returned no system user access_token.");
    }

    const debug = await debugMetaToken(token);
    const expiresLine = debug.isNeverExpiring
      ? "This token does not expire (permanent system user token)."
      : "Meta issued a 60-day token. Re-run this flow before it expires, or contact support to enable never-expiring tokens.";

    const html = `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Meta ad access token</title></head>
<body style="font-family:system-ui,sans-serif;padding:24px;max-width:760px;line-height:1.5">
  <h2>Meta ad access token (permanent)</h2>
  <p>Copy into <code>META_AD_ACCESS_TOKEN</code> in <code>.env.local</code> and Vercel, then redeploy.</p>
  <p>Also confirm <code>META_AD_ACCOUNT_ID=act_845948004443182</code> (or run <code>npm run meta:ads-discover</code>).</p>
  <p><strong>${escapeHtml(expiresLine)}</strong></p>
  <p>System user: <code>${escapeHtml(systemUserId)}</code></p>
  <p>Scopes: <code>${escapeHtml((debug.scopes || []).join(", "))}</code></p>
  ${result.fallbackReason ? `<p style="color:#b45309">Note: ${escapeHtml(result.fallbackReason)}</p>` : ""}
  <pre style="white-space:pre-wrap;word-break:break-all;background:#f1f5f9;padding:12px;border-radius:8px">${escapeHtml(token)}</pre>
  <p><a href="/api/staff/meta-ads-auth">Generate again</a></p>
</body>
</html>`;

    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (e) {
    res.status(500).send("Failed to create Meta system user token: " + escapeHtml(e.message || "unknown"));
  }
};
