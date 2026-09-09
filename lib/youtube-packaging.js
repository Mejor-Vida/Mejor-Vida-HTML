/**
 * YouTube + Google video SEO packaging for teaching-page videos.
 * Catalog: data/youtube-videos.json
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CATALOG_PATH = path.join(ROOT, "data", "youtube-videos.json");
const BASE = "https://www.mejorvidainsurance.com";

function xmlEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function loadCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
}

function writeCatalog(catalog) {
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n", "utf8");
}

function formatChapterTime(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m + ":" + String(r).padStart(2, "0");
}

function iso8601Duration(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return "PT" + r + "S";
  return r ? "PT" + m + "M" + r + "S" : "PT" + m + "M";
}

function watchUrl(videoId) {
  return "https://www.youtube.com/watch?v=" + videoId;
}

function embedUrl(videoId) {
  return "https://www.youtube.com/embed/" + videoId;
}

function thumbnailUrl(videoId) {
  return "https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg";
}

function playlistUrl(playlistId) {
  if (!playlistId) return null;
  return "https://www.youtube.com/playlist?list=" + playlistId;
}

function chapterBlock(chapters) {
  const rows = Array.isArray(chapters) ? chapters : [];
  if (rows.length < 3) return "";
  return (
    "Capítulos:\n" +
    rows.map((ch) => formatChapterTime(ch.t) + " " + ch.label).join("\n")
  );
}

function buildDescription(video, playlistId) {
  const lines = [String(video.description_lead || "").trim(), ""];
  const body = String(video.description_body || "").trim();
  if (body) {
    lines.push(body, "");
  }
  const chapters = chapterBlock(video.chapters);
  if (chapters) {
    lines.push(chapters, "");
  }
  lines.push(
    "Enlaces:",
    "Sitio: https://www.mejorvidainsurance.com/",
    "Esta guía: " + BASE + video.page_es,
    "Cotización gratis: https://www.mejorvidainsurance.com/quote.html",
    "WhatsApp: https://wa.me/14024405438",
    "Teléfono: 402-440-5438",
    "Licencias: https://www.mejorvidainsurance.com/licencias.html",
  );
  const more = playlistUrl(playlistId);
  if (more) {
    lines.push("Más lecciones: " + more);
  }
  lines.push(
    "",
    "La presentadora es la asistente educativa de Mejor Vida Seguros.",
    "Esto es educación, no una cotización de una funeraria concreta.",
    "",
    (Array.isArray(video.hashtags) ? video.hashtags : []).join(" "),
  );
  return lines.filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n").trim() + "\n";
}

function captionPath(video) {
  if (!video.captions_vtt) return null;
  return path.join(ROOT, video.captions_vtt);
}

function videoObjectJsonLd(video) {
  const id = video.youtube_id;
  const pageUrl = BASE + video.page_es;
  return {
    "@type": "VideoObject",
    "@id": pageUrl + "#video",
    name: video.title,
    description: String(video.description_lead || "").trim(),
    thumbnailUrl: thumbnailUrl(id),
    uploadDate: video.upload_date,
    duration: iso8601Duration(video.duration_seconds),
    embedUrl: embedUrl(id),
    contentUrl: watchUrl(id),
    inLanguage: video.language || "es",
    isFamilyFriendly: true,
    publisher: {
      "@type": "Organization",
      name: "Mejor Vida Insurance LLC",
      url: BASE + "/",
      logo: {
        "@type": "ImageObject",
        url: BASE + "/img/opt/logo-spanish2.png",
      },
    },
  };
}

function sitemapVideoXml(video) {
  const id = video.youtube_id;
  const desc = String(video.description_lead || "").trim().slice(0, 2048);
  const tags = (video.tags || []).slice(0, 8);
  let xml = "    <video:video>\n";
  xml += "      <video:thumbnail_loc>" + xmlEscape(thumbnailUrl(id)) + "</video:thumbnail_loc>\n";
  xml += "      <video:title>" + xmlEscape(video.title) + "</video:title>\n";
  xml += "      <video:description>" + xmlEscape(desc) + "</video:description>\n";
  xml += "      <video:player_loc allow_embed=\"yes\">" + xmlEscape(embedUrl(id)) + "</video:player_loc>\n";
  xml += "      <video:duration>" + Math.round(Number(video.duration_seconds) || 0) + "</video:duration>\n";
  if (video.upload_date) {
    xml += "      <video:publication_date>" + xmlEscape(video.upload_date) + "</video:publication_date>\n";
  }
  xml += "      <video:family_friendly>yes</video:family_friendly>\n";
  xml += "      <video:live>no</video:live>\n";
  xml +=
    "      <video:uploader info=\"" +
    xmlEscape("https://www.youtube.com/@mejorvidainsurancellc") +
    "\">Mejor Vida Insurance LLC</video:uploader>\n";
  for (const tag of tags) {
    xml += "      <video:tag>" + xmlEscape(tag) + "</video:tag>\n";
  }
  xml += "    </video:video>\n";
  return xml;
}

function videosByPage() {
  const catalog = loadCatalog();
  const map = new Map();
  for (const video of catalog.videos || []) {
    if (video.page_es) map.set(video.page_es, video);
  }
  return map;
}

module.exports = {
  CATALOG_PATH,
  BASE,
  loadCatalog,
  writeCatalog,
  formatChapterTime,
  iso8601Duration,
  watchUrl,
  embedUrl,
  thumbnailUrl,
  playlistUrl,
  buildDescription,
  captionPath,
  videoObjectJsonLd,
  sitemapVideoXml,
  videosByPage,
};
