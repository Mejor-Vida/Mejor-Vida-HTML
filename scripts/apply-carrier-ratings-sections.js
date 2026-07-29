#!/usr/bin/env node
/**
 * Injects detailed ratings sections (AM Best, Comdex, NAIC, J.D. Power)
 * into ES/EN carrier pages from integrations/knowledge/carrier-ratings.json.
 *
 * Markers:
 *   <!-- mvi-carrier-ratings:start --> … <!-- mvi-carrier-ratings:end -->
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DATA = JSON.parse(
  fs.readFileSync(path.join(ROOT, "integrations/knowledge/carrier-ratings.json"), "utf8")
);

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scoreNice(score) {
  const n = Math.round(Number(score) * 100) / 100;
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, "");
}

function ratingsSection(c, lang) {
  const amDesc =
    lang === "es"
      ? ({ Superior: "Superior", Excellent: "Excelente" }[c.amBest.descriptor] || c.amBest.descriptor)
      : c.amBest.descriptor;
  const outlook =
    lang === "es"
      ? ({
          Stable: "Estable",
          "Under Review — Developing": "En revisión — en desarrollo",
        }[c.amBest.outlook] || c.amBest.outlook)
      : c.amBest.outlook;
  const issuer = lang === "es" ? c.issuerEs : c.issuerEn;
  const why = lang === "es" ? c.scoreWhyEs : c.scoreWhyEn;
  const breakdown = c.scoreBreakdown || {};
  const title =
    lang === "es" ? "Fortaleza financiera y calificaciones" : "Financial strength & ratings";
  const na = lang === "es" ? "N/D" : "N/A";

  const pctLine = (label, val) =>
    val == null ? `${label}: ${na}` : `${label}: <strong>${esc(String(val))}%</strong>`;
  const scoreBreakdownHtml =
    lang === "es"
      ? `<p class="mb-3 small">${pctLine("AM Best", breakdown.amBestPct)} · ${pctLine(
          "Comdex",
          breakdown.comdexPct
        )} · ${pctLine("NAIC", breakdown.naicPct)} → promedio <strong>${esc(
          String(breakdown.avgPct ?? "—")
        )}%</strong> → <strong>${esc(scoreNice(c.score))}/5</strong></p>`
      : `<p class="mb-3 small">${pctLine("AM Best", breakdown.amBestPct)} · ${pctLine(
          "Comdex",
          breakdown.comdexPct
        )} · ${pctLine("NAIC", breakdown.naicPct)} → average <strong>${esc(
          String(breakdown.avgPct ?? "—")
        )}%</strong> → <strong>${esc(scoreNice(c.score))}/5</strong></p>`;

  const otherRows = (c.otherRatings || [])
    .map((r) => {
      const note = lang === "es" ? r.noteEs : r.noteEn;
      return `<tr><td>${esc(r.agency)}</td><td class="fw-bold">${esc(r.rating)}</td><td>${esc(
        note || ""
      )}${
        r.sourceUrl
          ? ` <a href="${esc(r.sourceUrl)}" target="_blank" rel="noopener">${
              lang === "es" ? "Fuente" : "Source"
            }</a>`
          : ""
      }</td></tr>`;
    })
    .join("\n");

  const comdex = c.comdex || {};
  const comdexScore = comdex.score == null ? na : String(comdex.score);
  const comdexNote = lang === "es" ? comdex.noteEs : comdex.noteEn;

  const naic = c.naic || {};
  const naicIdx =
    naic.complaintIndex == null ? null : Number(naic.complaintIndex).toFixed(2);
  const naicNote = lang === "es" ? naic.noteEs : naic.noteEn;
  const naicLine = lang === "es" ? naic.lineEs : naic.lineEn;
  const cis =
    naic.cisUrl || naic.sourceUrl || "https://content.naic.org/cis_consumer_information.htm";
  const consumer = naic.consumerUrl || "https://content.naic.org/consumer";

  const jd = c.jdPower || {};
  const jdSummary = lang === "es" ? jd.summaryEs : jd.summaryEn;
  let jdHeadline = na;
  if (jd.inStudy && jd.score != null) {
    jdHeadline =
      jd.rank != null
        ? `#${jd.rank}${jd.of ? ` / ${jd.of}` : ""} · ${jd.score} / 1,000`
        : `${jd.score} / 1,000`;
  }

  const naicIndexLine =
    naicIdx != null
      ? `${lang === "es" ? "Índice nacional CIS" : "CIS National Index"}: <strong>${esc(naicIdx)}</strong>${
          naic.asOf ? ` (${esc(String(naic.asOf))})` : ""
        }`
      : lang === "es"
        ? `Índice: consulte el <a href="${esc(cis)}" target="_blank" rel="noopener">CIS de la NAIC</a>`
        : `Index: look up in <a href="${esc(cis)}" target="_blank" rel="noopener">NAIC CIS</a>`;

  return `<!-- mvi-carrier-ratings:start -->
<section class="py-5 bg-light border-top border-bottom" id="ratings">
<div class="container" style="max-width:60rem;">
<h2 class="h4 fw-bold mb-2" style="color:#1a365d;">${esc(title)}</h2>
<p class="text-body-secondary mb-2">${
    lang === "es"
      ? `Emisora: <strong>${esc(issuer)}</strong>. Score Mejor Vida: <strong>${esc(
          scoreNice(c.score)
        )}/5</strong> (puesto #${c.rank} en la tabla de estados). ${esc(why)}`
      : `Issuer: <strong>${esc(issuer)}</strong>. Mejor Vida score: <strong>${esc(
          scoreNice(c.score)
        )}/5</strong> (rank #${c.rank} on state pages). ${esc(why)}`
  }</p>
${scoreBreakdownHtml}

<h3 class="h5 fw-bold mb-2">${lang === "es" ? "Calificaciones de solidez" : "Financial strength ratings"}</h3>
<div class="table-responsive mb-4">
<table class="table table-bordered bg-white">
<thead class="table-light">
<tr>
<th>${lang === "es" ? "Agencia" : "Agency"}</th>
<th>${lang === "es" ? "Calificación" : "Rating"}</th>
<th>${lang === "es" ? "Detalle" : "Detail"}</th>
</tr>
</thead>
<tbody>
<tr>
<td>AM Best</td>
<td class="fw-bold">${esc(c.amBest.fsr)}</td>
<td>${esc(amDesc)} · ${lang === "es" ? "Perspectiva" : "Outlook"}: ${esc(outlook)} · ${
    lang === "es" ? "Vigente" : "Effective"
  }: ${esc(c.amBest.effective)}${
    c.amBest.icr ? ` · ICR: ${esc(c.amBest.icr)}` : ""
  } · <a href="${esc(c.amBest.sourceUrl)}" target="_blank" rel="noopener">${esc(
    c.amBest.sourceLabel || (lang === "es" ? "Fuente" : "Source")
  )}</a></td>
</tr>
${otherRows}
</tbody>
</table>
</div>

<h3 class="h5 fw-bold mb-2">Comdex</h3>
<p class="mb-1"><strong>${esc(comdexScore)}</strong>${
    comdex.score != null ? " / 100" : ""
  }${comdexNote ? ` — ${esc(comdexNote)}` : ""}</p>
<p class="small text-muted mb-4">${
    lang === "es"
      ? "Percentil compuesto de calificaciones de agencias principales (cuando hay al menos dos)."
      : "Composite percentile of major-agency ratings (when at least two agencies rate the company)."
  } ${
    comdex.sourceUrl
      ? `<a href="${esc(comdex.sourceUrl)}" target="_blank" rel="noopener">${esc(
          comdex.sourceLabel || "Source"
        )}</a>`
      : ""
  }</p>

<h3 class="h5 fw-bold mb-2">${
    lang === "es" ? "NAIC — Consumer Insurance Search (CIS)" : "NAIC — Consumer Insurance Search (CIS)"
  }</h3>
<p class="mb-1">${lang === "es" ? "Código de compañía" : "Company code"}: <strong>#${esc(
    naic.code || "—"
  )}</strong> · ${naicIndexLine}</p>
<p class="mb-1 text-body-secondary">${esc(naicLine || "")}</p>
<p class="mb-1">${esc(naicNote || "")}</p>
<p class="small text-muted mb-4">${
    lang === "es"
      ? "La NAIC recopila quejas cerradas y confirmadas de los departamentos estatales. Busque la compañía en CIS para el índice de quejas (aprox. 1.00 = lo esperado según cuota de mercado; más bajo es mejor)."
      : "The NAIC compiles closed, confirmed complaints from state insurance departments. Look up the company in CIS for the complaint index (about 1.00 = expected for market share; lower is better)."
  } <a href="${esc(cis)}" target="_blank" rel="noopener">CIS</a> · <a href="${esc(
    consumer
  )}" target="_blank" rel="noopener">${
    lang === "es" ? "Portal del consumidor" : "Consumer hub"
  }</a></p>

<h3 class="h5 fw-bold mb-2">${
    lang === "es" ? "Satisfacción del cliente (J.D. Power)" : "Customer satisfaction (J.D. Power)"
  }</h3>
<p class="mb-1"><strong>${esc(jdHeadline)}</strong></p>
<p class="mb-1 text-body-secondary">${esc(jd.study || "")}</p>
<p class="mb-1">${esc(jdSummary || "")}</p>
<p class="small text-muted mb-0">${
    lang === "es"
      ? "La satisfacción del cliente no es una calificación de solidez financiera."
      : "Customer satisfaction is not a financial-strength rating."
  } ${
    jd.sourceUrl
      ? `<a href="${esc(jd.sourceUrl)}" target="_blank" rel="noopener">${esc(
          jd.sourceLabel || "Source"
        )}</a>`
      : ""
  }</p>
</div>
</section>
<!-- mvi-carrier-ratings:end -->`;
}

function inject(filePath, sectionHtml) {
  let html = fs.readFileSync(filePath, "utf8");
  const start = "<!-- mvi-carrier-ratings:start -->";
  const end = "<!-- mvi-carrier-ratings:end -->";
  if (html.includes(start) && html.includes(end)) {
    html = html.replace(
      new RegExp(`${start}[\\s\\S]*?${end}`),
      sectionHtml.trim()
    );
  } else {
    // Prefer replacing MoO-style dedicated ratings heading block if present
    const mooRe =
      /<section class="py-5 bg-light border-top border-bottom">\s*<div class="container" style="max-width:60rem;">\s*\n?<h2 class="h4 fw-bold mb-4" style="color:#1a365d;">(?:Fortaleza financiera y calificaciones|Financial Strength &amp; Ratings)<[\s\S]*?<\/section>/;
    if (mooRe.test(html)) {
      html = html.replace(mooRe, sectionHtml.trim());
    } else {
      const cta = html.indexOf('<section class="py-5 text-white"');
      if (cta === -1) throw new Error(`No insert point in ${filePath}`);
      html = html.slice(0, cta) + sectionHtml + "\n" + html.slice(cta);
    }
  }
  fs.writeFileSync(filePath, html);
  console.log("updated", path.relative(ROOT, filePath));
}

const PAGE_MAP = [
  ["mutual-of-omaha", "carriers/mutual-of-omaha.html", "es"],
  ["mutual-of-omaha", "en/carriers/mutual-of-omaha.html", "en"],
  ["transamerica", "carriers/transamerica.html", "es"],
  ["transamerica", "en/carriers/transamerica.html", "en"],
  ["american-amicable", "carriers/american-amicable.html", "es"],
  ["american-amicable", "en/carriers/american-amicable.html", "en"],
  ["corebridge", "carriers/corebridge.html", "es"],
  ["corebridge", "en/carriers/corebridge.html", "en"],
  ["assurity", "carriers/assurity.html", "es"],
  ["assurity", "en/carriers/assurity.html", "en"],
  ["aetna", "carriers/aetna.html", "es"],
  ["aetna", "en/carriers/aetna.html", "en"],
];

for (const [id, rel, lang] of PAGE_MAP) {
  const c = DATA.carriers.find((x) => x.id === id);
  if (!c) throw new Error(`Missing carrier ${id}`);
  inject(path.join(ROOT, rel), ratingsSection(c, lang));
}
