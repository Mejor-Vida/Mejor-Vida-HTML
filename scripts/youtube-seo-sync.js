#!/usr/bin/env node
/**
 * Apply catalog SEO to YouTube: title, description, chapters, tags,
 * Spanish captions, Education category, and the educational playlist.
 *
 *   npm run youtube:seo
 *
 * Loads .env.local; never prints tokens.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

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

loadEnvFile(path.join(ROOT, ".env.local"));

const { getYoutubeAccessToken } = require("../lib/youtube-api");
const {
  loadCatalog,
  writeCatalog,
  buildDescription,
  captionPath,
} = require("../lib/youtube-packaging");

const YT = "https://www.googleapis.com/youtube/v3";

async function ytFetch(token, url, opts) {
  const headers = Object.assign({ Authorization: "Bearer " + token }, (opts && opts.headers) || {});
  const res = await fetch(url, Object.assign({}, opts, { headers }));
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (e) {
    json = null;
  }
  if (!res.ok) {
    const reason =
      json && json.error && json.error.message ? json.error.message : "HTTP " + res.status;
    const err = new Error(reason);
    err.status = res.status;
    throw err;
  }
  return json;
}

function multipartRelated(jsonPart, fileBuf, fileType) {
  const boundary = "mvi_yt_" + Date.now();
  const json = JSON.stringify(jsonPart);
  const head =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    json +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: " +
    fileType +
    "\r\n\r\n";
  const tail = "\r\n--" + boundary + "--\r\n";
  return {
    body: Buffer.concat([Buffer.from(head, "utf8"), fileBuf, Buffer.from(tail, "utf8")]),
    contentType: "multipart/related; boundary=" + boundary,
  };
}

async function ensurePlaylist(token, catalog) {
  const wantedTitle = catalog.playlist && catalog.playlist.title;
  let playlistId = catalog.playlist && catalog.playlist.id;
  if (playlistId) {
    const byId = await ytFetch(
      token,
      YT + "/playlists?part=id&id=" + encodeURIComponent(playlistId),
    );
    if (byId.items && byId.items.length) return playlistId;
  }
  const listed = await ytFetch(
    token,
    YT + "/playlists?part=snippet&mine=true&maxResults=50",
  );
  const existing = (listed.items || []).find(
    (item) => item.snippet && item.snippet.title === wantedTitle,
  );
  if (existing) {
    catalog.playlist.id = existing.id;
    writeCatalog(catalog);
    return existing.id;
  }
  const created = await ytFetch(token, YT + "/playlists?part=snippet,status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      snippet: {
        title: wantedTitle,
        description: catalog.playlist.description || "",
        defaultLanguage: "es",
      },
      status: { privacyStatus: "public" },
    }),
  });
  catalog.playlist.id = created.id;
  writeCatalog(catalog);
  console.log("Created playlist:", wantedTitle);
  return created.id;
}

async function ensureInPlaylist(token, playlistId, videoId) {
  const listed = await ytFetch(
    token,
    YT +
      "/playlistItems?part=snippet&playlistId=" +
      encodeURIComponent(playlistId) +
      "&maxResults=50",
  );
  const already = (listed.items || []).some(
    (item) => item.snippet && item.snippet.resourceId && item.snippet.resourceId.videoId === videoId,
  );
  if (already) return;
  await ytFetch(token, YT + "/playlistItems?part=snippet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      snippet: {
        playlistId,
        resourceId: { kind: "youtube#video", videoId },
      },
    }),
  });
  console.log("Added to playlist:", videoId);
}

async function updateVideoSnippet(token, video, playlistId) {
  const body = {
    id: video.youtube_id,
    snippet: {
      title: video.title,
      description: buildDescription(video, playlistId),
      categoryId: String(video.category_id || "27"),
      tags: video.tags || [],
      defaultLanguage: video.language || "es",
      defaultAudioLanguage: video.language || "es",
    },
    status: {
      privacyStatus: "public",
      selfDeclaredMadeForKids: false,
      embeddable: true,
      containsSyntheticMedia: true,
    },
  };
  try {
    await ytFetch(token, YT + "/videos?part=snippet,status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    if (!/synthetic|containsSyntheticMedia/i.test(e.message || "")) throw e;
    delete body.status.containsSyntheticMedia;
    await ytFetch(token, YT + "/videos?part=snippet,status", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    console.log("Note: YouTube rejected the synthetic-media flag; metadata still saved.");
  }
}

function vttToSrt(vttText) {
  const blocks = String(vttText || "")
    .replace(/^\uFEFF/, "")
    .replace(/^WEBVTT[^\n]*\n+/i, "")
    .trim()
    .split(/\n\n+/);
  const cues = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter((line) => !/^\d+$/.test(line.trim()));
    const timeIdx = lines.findIndex((line) => line.includes("-->"));
    if (timeIdx < 0) continue;
    const times = lines[timeIdx]
      .replace(/\./g, ",")
      .replace(/(\d{2}:\d{2}:\d{2},\d{3})/g, (m) => m);
    const text = lines.slice(timeIdx + 1).join("\n").trim();
    if (!text) continue;
    cues.push(times + "\n" + text);
  }
  return cues.map((cue, i) => i + 1 + "\n" + cue).join("\n\n") + "\n";
}

async function syncCaptions(token, video) {
  const vttPath = captionPath(video);
  if (!vttPath || !fs.existsSync(vttPath)) {
    console.log("No captions file for", video.slug);
    return;
  }
  const srt = Buffer.from(vttToSrt(fs.readFileSync(vttPath, "utf8")), "utf8");
  const listed = await ytFetch(
    token,
    YT + "/captions?part=snippet&videoId=" + encodeURIComponent(video.youtube_id),
  );
  const spanish = (listed.items || []).find((item) => {
    const lang = String((item.snippet && item.snippet.language) || "").toLowerCase();
    const track = String((item.snippet && item.snippet.trackKind) || "").toLowerCase();
    return (lang === "es" || lang.startsWith("es-")) && track !== "asr";
  });
  const snippet = {
    videoId: video.youtube_id,
    language: "es",
    name: "CC",
  };
  if (spanish) {
    const packed = multipartRelated({ id: spanish.id, snippet }, srt, "application/octet-stream");
    await ytFetch(
      token,
      "https://www.googleapis.com/upload/youtube/v3/captions?part=snippet",
      {
        method: "PUT",
        headers: { "Content-Type": packed.contentType },
        body: packed.body,
      },
    );
    console.log("Updated Spanish captions:", video.slug);
    return;
  }
  const packed = multipartRelated({ snippet }, srt, "application/octet-stream");
  await ytFetch(
    token,
    "https://www.googleapis.com/upload/youtube/v3/captions?part=snippet",
    {
      method: "POST",
      headers: { "Content-Type": packed.contentType },
      body: packed.body,
    },
  );
  console.log("Uploaded Spanish captions:", video.slug);
}

async function removeDisplayCaptions(token, video) {
  const listed = await ytFetch(
    token,
    YT + "/captions?part=snippet&videoId=" + encodeURIComponent(video.youtube_id),
  );
  const items = listed.items || [];
  if (!items.length) {
    console.log("No YouTube caption tracks to remove:", video.slug);
    return;
  }
  for (const item of items) {
    try {
      await ytFetch(token, YT + "/captions?id=" + encodeURIComponent(item.id), {
        method: "DELETE",
      });
    } catch (e) {
      const kind = item.snippet && item.snippet.trackKind;
      console.log("Could not remove caption track (" + (kind || "unknown") + ")");
    }
  }
  console.log("Removed YouTube caption tracks (burned-in subs):", video.slug);
}

async function syncUploadDate(token, video, catalog) {
  const listed = await ytFetch(
    token,
    YT + "/videos?part=snippet,contentDetails&id=" + encodeURIComponent(video.youtube_id),
  );
  const item = listed.items && listed.items[0];
  if (!item) throw new Error("YouTube video not found: " + video.youtube_id);
  const published = item.snippet && item.snippet.publishedAt;
  if (published && published !== video.upload_date) {
    video.upload_date = published;
    writeCatalog(catalog);
  }
}

async function main() {
  const token = await getYoutubeAccessToken();
  const catalog = loadCatalog();
  const playlistId = await ensurePlaylist(token, catalog);
  for (const video of catalog.videos || []) {
    if (!video.youtube_id) {
      console.log("Skip (no youtube_id yet):", video.slug);
      continue;
    }
    await syncUploadDate(token, video, catalog);
    await updateVideoSnippet(token, video, playlistId);
    console.log("Updated metadata:", video.youtube_id);
    await ensureInPlaylist(token, playlistId, video.youtube_id);
    try {
      if (video.burned_in_subtitles) {
        await removeDisplayCaptions(token, video);
      } else {
        await syncCaptions(token, video);
      }
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      if (/insufficient|scope/i.test(msg)) {
        console.log(
          "Captions need a one-time YouTube reconnect (youtube.force-ssl). Run: npm run youtube:connect -- --force"
        );
      } else {
        throw e;
      }
    }
    console.log("SEO synced:", video.youtube_id);
  }
  console.log("Playlist:", "https://www.youtube.com/playlist?list=" + playlistId);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
