/**
 * Connect the agency YouTube channel (Mejor Vida Insurance LLC).
 * Loads .env.local; never prints tokens.
 *
 *   npm run youtube:connect
 *   npm run youtube:connect -- --force
 *   npm run youtube:status
 */
const fs = require("fs");
const http = require("http");
const path = require("path");
const { execFile } = require("child_process");
const { URL } = require("url");
const { upsertEnvLocal } = require("../lib/env-local-upsert");
const {
  YOUTUBE_CONNECT_STATE,
  YOUTUBE_SCOPES,
  LOCAL_REDIRECT_URI,
  youtubeOAuthClient,
  youtubeOAuthConfig,
  hasYoutubeCredentials,
  getYoutubeAccessToken,
  fetchMineChannels,
  pickPreferredChannel,
  channelPublicRecord,
  writeChannelJson,
  readChannelJson,
} = require("../lib/youtube-api");

function loadEnvFile(p) {
  if (!p || !fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile(path.join(__dirname, "..", ".env.local"));

function openBrowser(url) {
  return new Promise((resolve, reject) => {
    execFile("open", ["-a", "Google Chrome", url], (err) => {
      if (err) {
        execFile("open", [url], (err2) => (err2 ? reject(err2) : resolve()));
        return;
      }
      resolve();
    });
  });
}

function htmlPage(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family:system-ui,sans-serif;padding:24px;max-width:640px"><h2>${title}</h2><p>${body}</p></body></html>`;
}

async function verifyAndSave(accessToken) {
  const items = await fetchMineChannels(accessToken);
  const chosen = pickPreferredChannel(items);
  const record = channelPublicRecord(chosen);
  if (!record || !record.channel_id) {
    throw new Error("YouTube connected, but no channel was returned for this Google account.");
  }
  writeChannelJson(record);
  if (record.channel_id) upsertEnvLocal("YOUTUBE_CHANNEL_ID", record.channel_id);
  return { record, count: items.length };
}

async function statusOnly() {
  if (!hasYoutubeCredentials()) {
    console.log("YouTube is not connected.");
    process.exitCode = 1;
    return;
  }
  const accessToken = await getYoutubeAccessToken(LOCAL_REDIRECT_URI);
  const { record, count } = await verifyAndSave(accessToken);
  const stored = readChannelJson();
  console.log("YouTube is connected.");
  console.log("Channel:", record.title);
  if (record.handle) console.log("Handle:", record.handle);
  console.log("URL:", record.url);
  console.log("Channels on this Google account:", count);
  if (stored && stored.channel_id) console.log("Saved public channel id in data/youtube-channel.json");
}

function runOAuth() {
  const { clientId, clientSecret } = youtubeOAuthConfig();
  if (!clientId || !clientSecret) {
    console.error("Missing GA4_OAUTH_CLIENT_ID/SECRET or GMAIL_CLIENT_ID/SECRET in .env.local");
    process.exit(1);
  }

  const oauth2Client = youtubeOAuthClient(LOCAL_REDIRECT_URI);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account consent",
    include_granted_scopes: false,
    state: YOUTUBE_CONNECT_STATE,
    scope: YOUTUBE_SCOPES,
    login_hint: "admin@mejorvidainsurance.com",
  });

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const u = new URL(req.url, "http://localhost:3000");
        if (u.pathname !== "/api/staff/gsc-callback") {
          res.statusCode = 404;
          res.end("Not found");
          return;
        }
        const errParam = String(u.searchParams.get("error") || "").trim();
        if (errParam) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(htmlPage("YouTube", "Google returned: " + errParam + ". You can close this tab."));
          server.close();
          reject(new Error("Google OAuth error: " + errParam));
          return;
        }
        const code = String(u.searchParams.get("code") || "").trim();
        if (!code) {
          res.statusCode = 400;
          res.end("Missing OAuth code");
          return;
        }
        const tokenRes = await oauth2Client.getToken(code);
        const refreshToken =
          tokenRes && tokenRes.tokens && tokenRes.tokens.refresh_token
            ? String(tokenRes.tokens.refresh_token)
            : "";
        if (!refreshToken) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.end(
            htmlPage(
              "YouTube",
              "Google did not return a refresh token. Revoke prior access and run youtube:connect again."
            )
          );
          server.close();
          reject(new Error("No refresh token"));
          return;
        }
        upsertEnvLocal("YOUTUBE_REFRESH_TOKEN", refreshToken);
        process.env.YOUTUBE_REFRESH_TOKEN = refreshToken;
        oauth2Client.setCredentials(tokenRes.tokens);
        const tok = await oauth2Client.getAccessToken();
        const accessToken = typeof tok === "string" ? tok : tok && tok.token;
        const { record } = await verifyAndSave(String(accessToken));
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(
          htmlPage(
            "YouTube connected",
            "Connected to " +
              (record.title || "your channel") +
              (record.handle ? " (" + record.handle + ")" : "") +
              ". You can close this tab."
          )
        );
        server.close();
        resolve(record);
      } catch (e) {
        const msg = e && e.message ? e.message : "unknown";
        const apiDisabled = /youtube\.googleapis\.com|accessNotConfigured|has not been used/i.test(
          msg + " " + JSON.stringify((e && e.body) || {})
        );
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(
          htmlPage(
            "YouTube",
            apiDisabled
              ? "Token saved, but the YouTube Data API is not enabled on this Google Cloud project. Enable it, then run npm run youtube:status."
              : "Could not finish YouTube connect. You can close this tab."
          )
        );
        server.close();
        reject(e);
      }
    });

    server.on("error", reject);
    server.listen(3000, "127.0.0.1", async () => {
      console.log("Waiting for Google consent in Chrome…");
      console.log("Sign in as admin@mejorvidainsurance.com and choose Mejor Vida Insurance LLC.");
      try {
        await openBrowser(authUrl);
      } catch (e) {
        server.close();
        reject(e);
      }
    });

    setTimeout(() => {
      server.close();
      reject(new Error("Timed out waiting for Google consent (3 minutes)."));
    }, 180000);
  });
}

async function main() {
  const status = process.argv.includes("--status");
  const force = process.argv.includes("--force");
  if (status) {
    await statusOnly();
    return;
  }
  if (hasYoutubeCredentials() && !force) {
    try {
      await statusOnly();
      return;
    } catch (e) {
      console.log("Existing token did not work. Starting a new Google consent…");
    }
  }
  if (force) {
    console.log("Starting Google consent so captions and playlists can sync…");
  }
  const record = await runOAuth();
  console.log("YouTube is connected.");
  console.log("Channel:", record.title);
  if (record.handle) console.log("Handle:", record.handle);
  console.log("URL:", record.url);
}

main().catch((e) => {
  const msg = e && e.message ? e.message : String(e);
  console.error(msg);
  if (/redirect_uri_mismatch/i.test(msg)) {
    console.error(
      "Add this redirect URI to the Google Cloud OAuth client: " + LOCAL_REDIRECT_URI
    );
  }
  if (/has not been used|accessNotConfigured|youtube\.googleapis\.com/i.test(msg)) {
    console.error(
      "Enable YouTube Data API v3: https://console.cloud.google.com/apis/library/youtube.googleapis.com"
    );
  }
  process.exit(1);
});
