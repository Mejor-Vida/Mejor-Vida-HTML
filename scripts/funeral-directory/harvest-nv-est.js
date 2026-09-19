#!/usr/bin/env node
/**
 * Harvest Nevada Funeral and Cemetery Services Board establishment lists.
 * Contacts only — no GPL dollars. EST list includes phones; DC list phones
 * are on page 2 in the same order as page 1.
 *
 * Usage: node scripts/funeral-directory/harvest-nv-est.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data", "nv-funeral-homes.json");
const LIST_PAGE = "https://www.funeral.nv.gov/Licensee-Lists/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const NV_CITIES = [
  "North Las Vegas",
  "Boulder City",
  "Carson City",
  "Las Vegas",
  "Gardnerville",
  "Winnemucca",
  "Logandale",
  "Yerington",
  "Hawthorne",
  "Henderson",
  "Pahrump",
  "Mesquite",
  "Fallon",
  "Minden",
  "Sparks",
  "Caliente",
  "Reno",
  "Elko",
  "Ely",
].sort((a, b) => b.length - a.length);

function fold(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function formatPhone(raw) {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    return `${d.slice(1, 4)}-${d.slice(4, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return "";
}

function collapse(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function pdfPages(filePath) {
  const raw = execFileSync(
    "python3",
    [
      "-c",
      "from pypdf import PdfReader\nimport json,sys\nr=PdfReader(sys.argv[1])\nprint(json.dumps([(p.extract_text() or '') for p in r.pages]))",
      filePath,
    ],
    { encoding: "utf8" }
  );
  return JSON.parse(raw);
}

function splitNameAddress(nameAddr) {
  const raw = collapse(nameAddr);
  const m = raw.match(/^(.*?)(\d{1,5}\s+[A-Za-z0-9].*)$/);
  if (m) return { name: collapse(m[1]), street: collapse(m[2]) };
  const glued = raw.match(/^(.*?)(\d{2,5}[A-Za-z].*)$/);
  if (glued) {
    const street = glued[2].replace(/^(\d{2,5})(?=[A-Za-z])/, "$1 ");
    return { name: collapse(glued[1]), street: collapse(street) };
  }
  return { name: raw, street: "" };
}

function cityFromZip(city, zip) {
  const z = String(zip || "");
  if (/^890(30|31|32|81|84|85|86)/.test(z)) return "North Las Vegas";
  if (city === "North Las Vegas" && /^891/.test(z)) return "Las Vegas";
  return city;
}

function unglueCities(s) {
  let out = String(s || "");
  for (const city of NV_CITIES) {
    const glued = city.replace(/\s+/g, "");
    const cityRe = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const gluedRe = glued.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(`([A-Za-z0-9])(${gluedRe})(?=\\s*NV\\b)`, "i"), `$1 ${city}`);
    out = out.replace(new RegExp(`([A-Za-z0-9])(${cityRe})(?=\\s*NV\\b)`, "i"), `$1 ${city}`);
  }
  return out;
}

function splitCityTail(rest) {
  const cleaned = unglueCities(
    collapse(rest)
      .replace(/Nevada Funeral and Cemetery Services Board[\s\S]*?nvfuneralboard@fb\.nv\.gov/gi, " ")
      .replace(/Nevada Funeral and Cemetery Services Board[\s\S]*?as of [A-Za-z]+ \d+, \d{4}/gi, " ")
      .replace(/Status Type No\. Facility Name[\s\S]*?Discipline Y\/N/gi, " ")
      .replace(/Phone Expiration DateDiscipline Y\/N[\s\S]*$/gi, " ")
      .replace(/Page \d+ of \d+/gi, " ")
      .replace(/\s*\d{2}\/\d{2}\/\d{4}\s*[YN]\s*$/i, "")
  );
  const nv = collapse(cleaned).match(/^(.*)NV\s*(\d{5})(?:\s*)(\d{3}-\d{3}-\d{4})?\s*$/i);
  if (!nv) return null;
  let before = collapse(nv[1]);
  for (const city of NV_CITIES) {
    const spaced = city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const end = new RegExp(`(?:^|[\\s,])${spaced}\\s*$`, "i");
    if (!end.test(` ${before}`)) continue;
    before = before.replace(new RegExp(`${spaced}\\s*$`, "i"), "");
    const cityOut = cityFromZip(city, nv[2]);
    let nameAddr = collapse(before);
    if (city === "North Las Vegas" && cityOut === "Las Vegas") {
      nameAddr = collapse(`${nameAddr} North`);
    }
    return {
      nameAddr,
      city: cityOut,
      zip: nv[2],
      phone: formatPhone(nv[3] || ""),
    };
  }
  return null;
}

function parseEstBlocks(text, kind) {
  const marker = kind === "DC" ? /Active DC /i : /Active EST /i;
  const chunks = collapse(text).split(marker).slice(1);
  const out = [];
  chunks.forEach((raw) => {
    const block = collapse(raw).replace(/\s*Page \d+ of \d+\s*/gi, " ");
    const numM = block.match(/^(\d+)\s+(.+)$/);
    if (!numM) return;
    const licenseNo = numM[1];
    const rest = numM[2]
      .replace(/\s*\d{2}\/\d{2}\/\d{4}\s*[YN]\s*$/i, "")
      .trim();
    const tail = splitCityTail(rest);
    if (!tail) return;
    const { name, street } = splitNameAddress(tail.nameAddr);
    if (!name) return;
    out.push({
      name,
      street,
      city: tail.city,
      region: "NV",
      zip: tail.zip,
      phone: tail.phone,
      website: "",
      license: `${kind}-${licenseNo}`,
      kind: kind === "DC" ? "directCremationFacility" : "establishment",
      status: "Active",
    });
  });
  return out;
}

function parseDcPhones(text) {
  const page2 = text.split(/Phone Expiration DateDiscipline Y\/N/i)[1] || "";
  return [...page2.matchAll(/(\d{3}-\d{3}-\d{4}|\d{10})/g)].map((m) => formatPhone(m[1])).filter(Boolean);
}

function absPdf(href) {
  try {
    return new URL(href, "https://www.funeral.nv.gov/").href;
  } catch {
    return "";
  }
}

async function findPdfUrls() {
  const res = await fetch(LIST_PAGE, {
    headers: { "user-agent": UA, accept: "text/html" },
  });
  if (!res.ok) throw new Error(`Licensee list ${res.status}`);
  const html = await res.text();
  const hrefs = [...html.matchAll(/href="([^"]+\.pdf[^"]*)"/gi)].map((m) => absPdf(m[1]));
  const est = hrefs.find((h) => /est\.pdf/i.test(h));
  const dc = hrefs.find((h) => /dc\.pdf/i.test(h));
  if (!est) throw new Error("Nevada EST PDF not found on licensee lists page");
  return { est, dc: dc || "" };
}

async function downloadPdf(url, dest) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "application/pdf" },
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const urls = await findPdfUrls();
  const estPath = "/tmp/nv-est-harvest.pdf";
  const dcPath = "/tmp/nv-dc-harvest.pdf";
  await downloadPdf(urls.est, estPath);
  const estPages = pdfPages(estPath);
  const homes = parseEstBlocks(estPages.join("\n"), "EST");
  if (urls.dc) {
    await downloadPdf(urls.dc, dcPath);
    const dcPages = pdfPages(dcPath);
    const dcHomes = parseEstBlocks(dcPages[0] || "", "DC");
    const phones = parseDcPhones(dcPages[1] || "");
    dcHomes.forEach((h, i) => {
      if (!h.phone && phones[i]) h.phone = phones[i];
    });
    homes.push(...dcHomes);
  }

  const seen = new Set();
  const unique = homes.filter((h) => {
    const key = `${h.license}|${fold(h.street)}|${fold(h.city)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        source: urls.est,
        sourceName: "Nevada Funeral and Cemetery Services Board active establishments",
        harvested: new Date().toISOString().slice(0, 10),
        homes: unique,
      },
      null,
      2
    ) + "\n"
  );
  console.log(
    `wrote ${OUT} (${unique.length} homes, ${new Set(unique.map((h) => h.city)).size} cities, EST ${(unique.filter((h) => h.kind !== "directCremationFacility").length)}, DC ${unique.filter((h) => h.kind === "directCremationFacility").length})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
