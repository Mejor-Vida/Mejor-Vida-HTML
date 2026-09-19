#!/usr/bin/env node
/**
 * Harvest South Dakota Board of Funeral Service licensed establishment roster.
 * Official PDF: name + city. No invented phones, websites, or GPL dollars.
 *
 * Usage: node scripts/funeral-directory/harvest-sd-board.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "south-dakota-funeral-homes.json");
const SRC = "https://www.sdboards.org/healthdept/funeral/verify/homeroster.pdf";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const MULTI_CITIES = [
  "Sioux Falls",
  "Rapid City",
  "Elk Point",
  "Hot Springs",
  "Clear Lake",
  "Dell Rapids",
  "Fort Pierre",
  "Big Stone City",
  "Lake Andes",
  "Mission Hill",
  "North Sioux City",
  "Pine Ridge",
  "De Smet",
  "DeSmet",
  "Redfield",
].sort((a, b) => b.length - a.length);

function collapse(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function pdfText(filePath) {
  const raw = execFileSync(
    "python3",
    [
      "-c",
      "from pypdf import PdfReader\nimport sys\nr=PdfReader(sys.argv[1])\nprint('\\n'.join((p.extract_text() or '') for p in r.pages))",
      filePath,
    ],
    { encoding: "utf8" }
  );
  return raw;
}

function stripTrailingCity(name, city) {
  const re = new RegExp(`\\s+${city.replace(/ /g, "\\s+")}$`, "i");
  return collapse(name.replace(re, ""));
}

function splitCity(nameCity) {
  const raw = collapse(nameCity)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s*[-–—]{1,2}\s*/g, " ")
    .replace(/\bDe\s+Smet\b/gi, "DeSmet");
  for (const city of MULTI_CITIES) {
    const re = new RegExp(`^(.*)\\s+${city.replace(/ /g, "\\s+")}$`, "i");
    const m = raw.match(re);
    if (m) return { name: stripTrailingCity(collapse(m[1]), city), city };
  }
  const m = raw.match(/^(.*)\s+([A-Z][A-Za-z.'-]+)$/);
  if (!m) return { name: raw, city: "" };
  return { name: stripTrailingCity(collapse(m[1]), m[2]), city: m[2] };
}

async function main() {
  const tmp = path.join(ROOT, "data", ".sd-homeroster.pdf");
  const res = await fetch(SRC, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`SD roster ${res.status}`);
  fs.writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
  const text = pdfText(tmp);
  fs.unlinkSync(tmp);
  const homes = [];
  text.split(/\n/).forEach((line) => {
    const t = collapse(line);
    const m = t.match(/^(\d+)\s+(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{4})$/);
    if (!m) return;
    const { name, city } = splitCity(m[2]);
    if (!name || !city) return;
    if (/embalming & transport|transport service/i.test(name)) return;
    homes.push({
      name,
      street: "",
      city,
      region: "SD",
      phone: "",
      website: "",
    });
  });
  homes.sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: SRC,
        sourceName: "South Dakota Board of Funeral Service licensed funeral establishments roster",
        harvested: new Date().toISOString().slice(0, 10),
        stateCode: "SD",
        homes,
      },
      null,
      2
    ) + "\n"
  );
  console.log(`wrote ${OUT} (${homes.length} homes, ${new Set(homes.map((h) => h.city)).size} cities)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
