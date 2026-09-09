const { upsertEnvLocal } = require("./env-local-upsert");

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isLocalHost(req) {
  const host = String((req && req.headers && req.headers.host) || "");
  return host.includes("localhost") || host.includes("127.0.0.1");
}

function youtubeConnectedHtml(statusMessage) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>YouTube</title></head><body style="font-family:system-ui,sans-serif;padding:24px;max-width:640px"><h2>YouTube</h2><p>${escapeHtml(
    statusMessage
  )}</p></body></html>`;
}

function sendYoutubeConnectedResponse(req, res, refreshToken) {
  if (!refreshToken) {
    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(
      youtubeConnectedHtml("Google did not return a refresh token. Open /api/staff/youtube-auth again.")
    );
  }
  if (isLocalHost(req)) {
    upsertEnvLocal("YOUTUBE_REFRESH_TOKEN", refreshToken);
    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(
      youtubeConnectedHtml("Saved YouTube access on this Mac. You can close this tab.")
    );
  }

  const ingestSecret = String(process.env.CRON_SECRET || "").trim();
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>YouTube</title></head><body style="font-family:system-ui,sans-serif;padding:24px;max-width:640px"><h2>YouTube</h2><p id="status">Saving access on this Mac…</p><script>
(function () {
  var payload = ${JSON.stringify({ token: refreshToken, secret: ingestSecret })};
  fetch("http://127.0.0.1:3000/api/staff/youtube-token-ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(function (r) {
    document.getElementById("status").textContent = r.ok
      ? "YouTube is connected. You can close this tab."
      : "Could not save on this Mac. Leave this tab open.";
  }).catch(function () {
    document.getElementById("status").textContent = "Could not reach the local server. Leave this tab open.";
  });
})();
</script></body></html>`;
  res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
  return res.send(html);
}

module.exports = { sendYoutubeConnectedResponse, escapeHtml };
