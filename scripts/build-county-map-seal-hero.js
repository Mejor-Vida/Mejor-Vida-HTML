#!/usr/bin/env node
/**
 * Nebraska-style state hero: full-bleed county map (1400×900) + seal.
 * CSS mask on .sc-hero-visual fades the left edge into the headline column.
 *
 * Usage: node scripts/build-county-map-seal-hero.js arizona michigan virginia
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const COUNTIES_URL =
  "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json";

const STATES = {
  arizona: { fipsPrefix: "04", sealFile: "arizona-state-seal.svg" },
  michigan: { fipsPrefix: "26", sealFile: "michigan-state-seal.svg" },
  virginia: {
    fipsPrefix: "51",
    sealFile: "virginia-state-seal.svg",
    /** VA silhouette is wide east–west; county-centroid still sits west of the visual mass. */
    sealOffsetX: 72,
    sealOffsetY: 0,
  },
};

const W = 1400;
const H = 900;
const SEAL_PX = 200;
/** Slightly larger than max fit so the silhouette fills more of the hero panel. */
const SCALE_BOOST = 1.08;

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return get(res.headers.location).then(resolve, reject);
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

function ringToPath(ring, project) {
  return (
    ring
      .map((p, i) => {
        const [x, y] = project(p[0], p[1]);
        return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ") + " Z"
  );
}

function featurePaths(coords, type, project) {
  const parts = [];
  if (type === "Polygon") {
    for (const ring of coords) parts.push(ringToPath(ring, project));
  } else {
    for (const poly of coords) {
      for (const ring of poly) parts.push(ringToPath(ring, project));
    }
  }
  return parts.join(" ");
}

function boundsFromFeatures(features) {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  function expand(p) {
    minLon = Math.min(minLon, p[0]);
    maxLon = Math.max(maxLon, p[0]);
    minLat = Math.min(minLat, p[1]);
    maxLat = Math.max(maxLat, p[1]);
  }
  function walkCoords(coords, type) {
    if (type === "Polygon") {
      for (const ring of coords) for (const p of ring) expand(p);
    } else {
      for (const poly of coords) for (const ring of poly) for (const p of ring) expand(p);
    }
  }
  for (const f of features) walkCoords(f.geometry.coordinates, f.geometry.type);
  return { minLon, maxLon, minLat, maxLat };
}

function makeProjector(minLon, maxLon, minLat, maxLat) {
  const padLeft = 0.012;
  const padRight = 0.012;
  const padTop = 0.012;
  const padBottom = 0.012;
  const innerW = W * (1 - padLeft - padRight);
  const innerH = H * (1 - padTop - padBottom);
  const lonSpan = maxLon - minLon || 1;
  const latSpan = maxLat - minLat || 1;
  const scale = Math.min(innerW / lonSpan, innerH / latSpan) * SCALE_BOOST;
  const drawnW = lonSpan * scale;
  const drawnH = latSpan * scale;
  const offsetX = W * padLeft + (innerW - drawnW) * 0.55;
  const offsetY = H * padTop + (innerH - drawnH) / 2;

  function project(lon, lat) {
    const x = offsetX + (lon - minLon) * scale;
    const y = offsetY + (maxLat - lat) * scale;
    return [x, y];
  }

  return { project };
}

/** Seal at average of each county’s projected center (stable on irregular shapes like VA). */
function sealAnchorFromCounties(features, project) {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const f of features) {
    const b = boundsFromFeatures([f]);
    const [x, y] = project((b.minLon + b.maxLon) / 2, (b.minLat + b.maxLat) / 2);
    sx += x;
    sy += y;
    n += 1;
  }
  return [sx / n, sy / n];
}

async function loadFeatures(fipsPrefix) {
  const geo = JSON.parse(await get(COUNTIES_URL));
  const features = geo.features.filter((f) => String(f.id || "").startsWith(fipsPrefix));
  if (!features.length) throw new Error(`No counties for FIPS prefix ${fipsPrefix}`);
  return features;
}

async function writeMapSvg(slug, features) {
  const { minLon, maxLon, minLat, maxLat } = boundsFromFeatures(features);
  const { project } = makeProjector(minLon, maxLon, minLat, maxLat);

  const paths = features
    .map((f, i) => {
      const d = featurePaths(f.geometry.coordinates, f.geometry.type, project);
      const fill = i % 2 === 0 ? "#4a9fd4" : "#3d8fc4";
      return `  <path d="${d}" fill="${fill}" fill-opacity="0.92" stroke="#9ecae8" stroke-width="1.35" stroke-linejoin="round"/>`;
    })
    .join("\n");

  const out = path.join(ROOT, `img/state-heroes/${slug}-map-teal.svg`);
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="100%" height="100%" fill="#1e5f96"/>
  <g id="${slug}-counties">
${paths}
  </g>
</svg>`;
  fs.writeFileSync(out, svg);
  console.log("Wrote", out, `(${features.length} counties, ${W}x${H})`);
}

async function writeHeroPng(slug, features) {
  const mapPath = path.join(ROOT, `img/state-heroes/${slug}-map-teal.svg`);
  const sealPath = path.join(ROOT, `img/state-heroes/${STATES[slug].sealFile}`);
  const out = path.join(ROOT, `img/state-heroes/${slug}-hero.png`);

  const { minLon, maxLon, minLat, maxLat } = boundsFromFeatures(features);
  const { project } = makeProjector(minLon, maxLon, minLat, maxLat);
  const cfg = STATES[slug];
  const sealAnchor = sealAnchorFromCounties(features, project);
  const offsetX = cfg.sealOffsetX || 0;
  const offsetY = cfg.sealOffsetY || 0;

  const mapBuf = await sharp(mapPath).png().toBuffer();
  const sealBuf = await sharp(sealPath).resize(SEAL_PX, null, { fit: "inside" }).png().toBuffer();
  const sealMeta = await sharp(sealBuf).metadata();

  const sealLeft = Math.round(sealAnchor[0] + offsetX - sealMeta.width / 2);
  const sealTop = Math.round(sealAnchor[1] + offsetY - sealMeta.height / 2);

  await sharp(mapBuf)
    .composite([{ input: sealBuf, left: sealLeft, top: sealTop, blend: "over" }])
    .png()
    .toFile(out);

  console.log("Wrote", out, { sealLeft, sealTop, anchor: sealAnchor });
}

async function main() {
  const slugs = process.argv.slice(2).filter((s) => STATES[s]);
  if (!slugs.length) {
    console.error("Usage: node scripts/build-county-map-seal-hero.js arizona michigan virginia");
    process.exit(1);
  }
  for (const slug of slugs) {
    const { fipsPrefix } = STATES[slug];
    const features = await loadFeatures(fipsPrefix);
    await writeMapSvg(slug, features);
    await writeHeroPng(slug, features);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
