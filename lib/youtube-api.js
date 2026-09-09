/**
 * YouTube Data API v3 — agency channel for instructional videos.
 * OAuth: YOUTUBE_REFRESH_TOKEN + GA4/Gmail OAuth client.
 * Do not print tokens.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { google } = require("./google-clients");
const { getGa4OAuthClientConfig } = require("./ga4-oauth-config");

const YOUTUBE_CONNECT_STATE = "youtube-connect";
const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.force-ssl",
];
const LOCAL_REDIRECT_URI = "http://localhost:3000/api/staff/gsc-callback";
const PRODUCTION_REDIRECT_URI = "https://www.mejorvidainsurance.com/api/staff/gsc-callback";
const CHANNEL_JSON_PATH = path.join(__dirname, "..", "data", "youtube-channel.json");
const EXPECTED_HANDLE = "@mejorvidainsurancellc";

function youtubeOAuthRedirectUri() {
  const fromEnv = String(process.env.YOUTUBE_OAUTH_REDIRECT_URI || "").trim();
  if (fromEnv) return fromEnv;
  return PRODUCTION_REDIRECT_URI;
}

function youtubeOAuthConfig() {
  const { clientId, clientSecret } = getGa4OAuthClientConfig();
  const refreshToken = String(process.env.YOUTUBE_REFRESH_TOKEN || "").trim();
  return { clientId, clientSecret, refreshToken };
}

function hasYoutubeCredentials() {
  const { clientId, clientSecret, refreshToken } = youtubeOAuthConfig();
  return !!(clientId && clientSecret && refreshToken);
}

function youtubeOAuthClient(redirectUri) {
  const { clientId, clientSecret } = youtubeOAuthConfig();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function getYoutubeAccessToken(redirectUri) {
  if (!hasYoutubeCredentials()) {
    const err = new Error(
      "YouTube is not connected. Run npm run youtube:connect as admin@mejorvidainsurance.com."
    );
    err.code = "YOUTUBE_NOT_CONFIGURED";
    throw err;
  }
  const { refreshToken } = youtubeOAuthConfig();
  const client = youtubeOAuthClient(redirectUri || youtubeOAuthRedirectUri());
  client.setCredentials({ refresh_token: refreshToken });
  const tok = await client.getAccessToken();
  const accessToken = typeof tok === "string" ? tok : tok && tok.token;
  if (!accessToken) throw new Error("YouTube access token missing");
  return String(accessToken);
}

function normalizeHandle(raw) {
  const s = String(raw || "")
    .trim()
    .replace(/^https?:\/\/(www\.)?youtube\.com\//i, "")
    .replace(/^@/, "");
  return s ? "@" + s.toLowerCase() : "";
}

function pickPreferredChannel(items) {
  const list = Array.isArray(items) ? items : [];
  const wanted = EXPECTED_HANDLE;
  const match = list.find((ch) => {
    const custom = normalizeHandle(ch && ch.snippet && ch.snippet.customUrl);
    const title = String((ch && ch.snippet && ch.snippet.title) || "").toLowerCase();
    return custom === wanted || title.includes("mejor vida insurance");
  });
  return match || list[0] || null;
}

function channelPublicRecord(item) {
  if (!item) return null;
  const snippet = item.snippet || {};
  const handle = normalizeHandle(snippet.customUrl) || "";
  return {
    title: String(snippet.title || "").trim(),
    handle: handle || null,
    channel_id: String(item.id || "").trim() || null,
    url: handle
      ? "https://www.youtube.com/" + handle
      : item.id
        ? "https://www.youtube.com/channel/" + item.id
        : null,
    connected_at: new Date().toISOString(),
  };
}

async function fetchMineChannels(accessToken) {
  const url =
    "https://www.googleapis.com/youtube/v3/channels?part=snippet,status&mine=true&maxResults=50";
  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + accessToken },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      (body && body.error && body.error.message) || "YouTube channels.list failed (" + res.status + ")"
    );
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return Array.isArray(body.items) ? body.items : [];
}

function writeChannelJson(record) {
  fs.mkdirSync(path.dirname(CHANNEL_JSON_PATH), { recursive: true });
  fs.writeFileSync(CHANNEL_JSON_PATH, JSON.stringify(record, null, 2) + "\n", "utf8");
  return CHANNEL_JSON_PATH;
}

function readChannelJson() {
  if (!fs.existsSync(CHANNEL_JSON_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(CHANNEL_JSON_PATH, "utf8"));
  } catch (e) {
    return null;
  }
}

module.exports = {
  YOUTUBE_CONNECT_STATE,
  YOUTUBE_SCOPES,
  LOCAL_REDIRECT_URI,
  PRODUCTION_REDIRECT_URI,
  CHANNEL_JSON_PATH,
  youtubeOAuthRedirectUri,
  youtubeOAuthConfig,
  hasYoutubeCredentials,
  youtubeOAuthClient,
  getYoutubeAccessToken,
  fetchMineChannels,
  pickPreferredChannel,
  channelPublicRecord,
  writeChannelJson,
  readChannelJson,
};
