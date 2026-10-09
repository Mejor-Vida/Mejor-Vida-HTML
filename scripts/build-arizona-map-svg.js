#!/usr/bin/env node
/**
 * County-grid Arizona map (Nebraska-style teal) for the state hero.
 * Writes img/state-heroes/arizona-map-teal.svg
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "img/state-heroes/arizona-map-teal.svg");
const COUNTIES_URL =
  "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json";

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

async function main() {
  const geo = JSON.parse(await get(COUNTIES_URL));
  const features = geo.features.filter((f) => String(f.id || "").startsWith("04"));
  if (!features.length) throw new Error("No Arizona counties in GeoJSON");

  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  function walkCoords(coords, type) {
    if (type === "Polygon") {
      for (const ring of coords) for (const p of ring) expand(p);
    } else {
      for (const poly of coords) for (const ring of poly) for (const p of ring) expand(p);
    }
  }
  function expand(p) {
    minLon = Math.min(minLon, p[0]);
    maxLon = Math.max(maxLon, p[0]);
    minLat = Math.min(minLat, p[1]);
    maxLat = Math.max(maxLat, p[1]);
  }
  for (const f of features) walkCoords(f.geometry.coordinates, f.geometry.type);

  const pad = 0.04;
  const lonSpan = maxLon - minLon;
  const latSpan = maxLat - minLat;
  const width = 1100;
  const height = Math.round(width * (latSpan / lonSpan));
  const innerW = width * (1 - pad * 2);
  const innerH = height * (1 - pad * 2);

  function project(lon, lat) {
    const x = pad * width + ((lon - minLon) / lonSpan) * innerW;
    const y = pad * height + ((maxLat - lat) / latSpan) * innerH;
    return [x, y];
  }

  const paths = features
    .map((f, i) => {
      const d = featurePaths(f.geometry.coordinates, f.geometry.type, project);
      const fill = i % 2 === 0 ? "#4a9fd4" : "#3d8fc4";
      return `  <path d="${d}" fill="${fill}" fill-opacity="0.92" stroke="#9ecae8" stroke-width="1.35" stroke-linejoin="round"/>`;
    })
    .join("\n");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#1e5f96"/>
  <g id="arizona-counties">
${paths}
  </g>
</svg>`;
  fs.writeFileSync(OUT, svg);
  console.log("Wrote", OUT, `(${features.length} counties, ${width}x${height})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
