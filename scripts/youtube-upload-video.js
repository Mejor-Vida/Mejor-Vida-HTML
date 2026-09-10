#!/usr/bin/env node
/**
 * Upload a teaching MP4 to the agency YouTube channel.
 *
 *   node scripts/youtube-upload-video.js --file /tmp/video.mp4 --slug funerales-prepagados
 *
 * Reads title/description/tags from data/youtube-videos.json (youtube_id may be empty).
 * Writes the new youtube_id back. Loads .env.local; never prints tokens.
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
const { loadCatalog, writeCatalog, buildDescription } = require("../lib/youtube-packaging");

function arg(name) {
  const i = process.argv.indexOf("--" + name);
  if (i < 0) return "";
  return String(process.argv[i + 1] || "").trim();
}

async function startResumable(token, meta, fileSize) {
  const url =
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(fileSize),
      "X-Upload-Content-Type": "video/mp4",
    },
    body: JSON.stringify(meta),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("YouTube resumable init failed (" + res.status + "): " + text.slice(0, 400));
  }
  const loc = res.headers.get("location");
  if (!loc) throw new Error("YouTube resumable upload missing Location");
  return loc;
}

async function putFile(sessionUrl, filePath, fileSize) {
  const CHUNK = 8 * 1024 * 1024;
  let start = 0;
  const fd = fs.openSync(filePath, "r");
  try {
    while (start < fileSize) {
      const len = Math.min(CHUNK, fileSize - start);
      const buf = Buffer.alloc(len);
      fs.readSync(fd, buf, 0, len, start);
      const end = start + len - 1;
      const res = await fetch(sessionUrl, {
        method: "PUT",
        headers: {
          "Content-Length": String(len),
          "Content-Range": "bytes " + start + "-" + end + "/" + fileSize,
        },
        body: buf,
      });
      if (res.status === 308) {
        start = end + 1;
        continue;
      }
      const text = await res.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (e) {
        json = null;
      }
      if (!res.ok) {
        throw new Error("YouTube upload PUT failed (" + res.status + "): " + text.slice(0, 400));
      }
      return json;
    }
  } finally {
    fs.closeSync(fd);
  }
  throw new Error("YouTube upload ended without a video id");
}

async function main() {
  const filePath = path.resolve(arg("file"));
  const slug = arg("slug");
  if (!filePath || !slug) {
    throw new Error("Usage: node scripts/youtube-upload-video.js --file <mp4> --slug <catalog-slug>");
  }
  if (!fs.existsSync(filePath)) throw new Error("File not found");
  const catalog = loadCatalog();
  const video = (catalog.videos || []).find((item) => item.slug === slug);
  if (!video) throw new Error("Unknown catalog slug: " + slug);
  const playlistId = catalog.playlist && catalog.playlist.id;
  const fileSize = fs.statSync(filePath).size;
  const token = await getYoutubeAccessToken();
  const meta = {
    snippet: {
      title: video.title,
      description: buildDescription(video, playlistId),
      tags: video.tags || [],
      categoryId: String(video.category_id || "27"),
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
  let sessionUrl;
  try {
    sessionUrl = await startResumable(token, meta, fileSize);
  } catch (e) {
    if (!/synthetic|containsSyntheticMedia/i.test(e.message || "")) throw e;
    delete meta.status.containsSyntheticMedia;
    sessionUrl = await startResumable(token, meta, fileSize);
    console.log("Note: YouTube rejected the synthetic-media flag on init; uploading without it.");
  }
  console.log("Uploading", Math.round(fileSize / (1024 * 1024)) + " MB…");
  const created = await putFile(sessionUrl, filePath, fileSize);
  const id = created && created.id;
  if (!id) throw new Error("Upload succeeded but no video id");
  video.youtube_id = id;
  if (!video.upload_date) video.upload_date = new Date().toISOString();
  writeCatalog(catalog);
  console.log("Uploaded:", "https://www.youtube.com/watch?v=" + id);
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exit(1);
});
