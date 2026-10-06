/**
 * Load/save YouTube teaching scripts for the staff CRM tab.
 */
const fs = require("fs");
const path = require("path");
const { htmlPathForPage } = require("./youtube-script-pages");

const ROOT = path.join(__dirname, "..");
const VIDEO_DIR = path.join(ROOT, "data/teaching-videos");

const JULIE_SCRIPT_SYSTEM = `You help Julie Braunsroth write YouTube teaching scripts she will record herself (talking head). Not HeyGen. Not Jhenny. Not an AI avatar.

Language: Spanish usted for the recording script. Agency: Mejor Vida Seguros. Spoken site: mejorvidaseguros.com (never mejorvidainsurance.com on camera).
Julie may say she is Julie, founder and licensed agent of Mejor Vida Seguros (NPN only if it is natural — do not dump a bio). Do not list licensed states except on the licenses page. Point to the licenses page instead.

Facts only from the page / breakdown. Do not invent premiums, approval odds, or “usted califica.”
YouTube standalone: never say “esta página.” Organize as a lesson (hook, through-line, unpack a mix-up, recap), not a walk of H2s. Cap under 4 minutes (~130 spoken words/min) unless Julie asks for longer.
Locked close, verbatim, last:

Esperamos que esta información le ayude a entender mejor sus opciones de seguro de vida.

Si desea saber cuánto podría costar su cobertura, visite mejorvidaseguros.com o escríbanos por WhatsApp al 402-440-5438. Puede recibir una cotización gratuita y sin compromiso.

Estamos aquí para ayudarle a encontrar una opción que se ajuste a sus necesidades y a su presupuesto.

When rewriting a script, return the full spoken Spanish script (markdown allowed). Opening: “Hola. Soy Julie de Mejor Vida Seguros.”`;

function readIfExists(file) {
  try {
    if (fs.existsSync(file)) return fs.readFileSync(file, "utf8");
  } catch (e) {}
  return "";
}

function seedFromFiles(slug) {
  const base = path.join(VIDEO_DIR, slug);
  return {
    breakdown: readIfExists(`${base}-breakdown.md`),
    script_en: readIfExists(`${base}-script.en.md`),
    script_es: readIfExists(`${base}-script.es.md`) || readIfExists(`${base}-script.md`),
  };
}

function extractSpoken(md) {
  const text = String(md || "");
  const spoken = text.split(/##\s+Spoken script/i)[1];
  const body = spoken ? spoken.split(/\n##\s+/)[0] : text;
  return body
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function forJulieRecording(md) {
  return extractSpoken(md).replace(
    /^Hola\.\s*Soy Jhenny[^\n]*/i,
    "Hola. Soy Julie de Mejor Vida Seguros."
  );
}

function pageTextForPrompt(page) {
  const htmlFile = htmlPathForPage(page);
  if (!htmlFile) return "";
  let html = "";
  try {
    html = fs.readFileSync(htmlFile, "utf8");
  } catch (e) {
    return "";
  }
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return html.slice(0, 14000);
}

async function openaiChat(messages, opts) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("missing OPENAI_API_KEY");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: (opts && opts.model) || "gpt-4o",
      temperature: opts && opts.temperature != null ? opts.temperature : 0.35,
      max_tokens: (opts && opts.max_tokens) || 2200,
      messages,
    }),
  });
  const data = await r.json();
  if (!r.ok) {
    const msg = (data && data.error && data.error.message) || `OpenAI ${r.status}`;
    throw new Error(String(msg).slice(0, 240));
  }
  return String(
    (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || ""
  ).trim();
}

function packTranscriptSegments(transcript) {
  return ((transcript && transcript.segments) || [])
    .map((s) => ({
      start: Number(s.start),
      end: Number(s.end),
      text: String(s.text || "").trim(),
    }))
    .filter((s) => s.text && Number.isFinite(s.start));
}

function packTranscriptWords(transcript) {
  return ((transcript && transcript.words) || [])
    .map((w) => ({
      start: Number(w.start),
      end: Number(w.end != null ? w.end : w.start),
      word: String(w.word || w.text || "").trim(),
    }))
    .filter((w) => w.word && Number.isFinite(w.start));
}

function expectedSpeechSec(text) {
  const n = speechTokens(text).length;
  if (!n) return 0;
  return Math.max(1.1, n / 2.15);
}

function mergeOffScriptIssues(list) {
  const items = (list || [])
    .filter((x) => Number.isFinite(Number(x.start)) && Number.isFinite(Number(x.end)) && Number(x.end) - Number(x.start) >= 0.25)
    .map((x) => ({
      start: Number(x.start),
      end: Number(x.end),
      kind: x.kind || "off_script",
      label: x.label || "Sound that is not the script",
      spoken: String(x.spoken || "").trim(),
      status: x.status || "open",
    }))
    .sort((a, b) => a.start - b.start);
  const out = [];
  for (const x of items) {
    const last = out[out.length - 1];
    if (last && x.start <= last.end + 0.25) {
      last.end = Math.max(last.end, x.end);
      if (x.spoken && !last.spoken) last.spoken = x.spoken;
      if (x.kind === "before_script") last.kind = "before_script";
    } else {
      out.push({ ...x });
    }
  }
  return out.map((x) => ({
    id: `iss-${x.start.toFixed(2)}-${x.end.toFixed(2)}`,
    start: Math.round(x.start * 10) / 10,
    end: Math.round(x.end * 10) / 10,
    kind: x.kind,
    label: x.label,
    spoken: x.spoken,
    status: x.status || "open",
  }));
}

function firstScriptWordTime(scriptEs, words) {
  const startPhrase = splitScriptRows(scriptEs)[0] || scriptEs;
  const list = words || [];
  if (!startPhrase || !list.length) return null;
  let best = null;
  for (let i = 0; i < list.length; i++) {
    const window = list
      .slice(i, i + 10)
      .map((w) => w.word)
      .join(" ");
    const score = tokenOverlap(window, startPhrase);
    if (score >= 0.4 && (!best || score > best.score)) best = { start: list[i].start, score };
  }
  return best;
}

function collectOffScriptIssues({ scriptEs, words, cuts, rows }) {
  const issues = [];
  const wordHit = firstScriptWordTime(scriptEs, words || []);
  if (wordHit && wordHit.start > 0.4) {
    issues.push({
      start: 0,
      end: wordHit.start,
      kind: "before_script",
      label: "Audio before Julie starts the script",
    });
  }
  const aligned = (rows || []).filter(
    (r) => r && String(r.script || "").trim() && Number.isFinite(Number(r.start)) && Number.isFinite(Number(r.end))
  );
  if (!wordHit && aligned[0]) {
    const first = aligned[0];
    const dur = Number(first.end) - Number(first.start);
    const exp = expectedSpeechSec(first.script);
    if (dur > exp + 1.15) {
      issues.push({
        start: Number(first.start),
        end: Number(first.start) + (dur - exp),
        kind: "before_script",
        label: "Audio before Julie starts the script",
      });
    }
  }
  (rows || []).forEach((r) => {
    if (r && !String(r.script || "").trim() && String(r.spoken || "").trim() && Number.isFinite(Number(r.start))) {
      issues.push({
        start: Number(r.start),
        end: Number(r.end),
        kind: "extra_speech",
        label: "Not in the script",
        spoken: String(r.spoken).trim(),
      });
    }
  });
  (cuts || []).forEach((c) => {
    const reason = String((c && c.reason) || "").trim();
    issues.push({
      start: Number(c.start),
      end: Number(c.end),
      kind: /retake|restart|go back/i.test(reason) ? "retake" : "off_script",
      label: reason || "Not in the script",
    });
  });
  return mergeOffScriptIssues(issues);
}

function splitScriptRows(script) {
  const text = String(script || "").replace(/\r/g, "").trim();
  if (!text) return [];
  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const rows = [];
  for (const p of paras) {
    const parts = p.match(/[^.!?…]+(?:[.!?…]+|$)/g);
    const sentences = (parts || [p]).map((s) => s.trim()).filter(Boolean);
    if (sentences.length > 1 && p.length > 80) rows.push(...sentences);
    else rows.push(p);
  }
  return rows;
}

function speechTokens(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9ñü\s]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function tokenOverlap(a, b) {
  const A = speechTokens(a);
  const B = speechTokens(b);
  if (!A.length || !B.length) return 0;
  const set = new Set(A);
  let hit = 0;
  for (const w of B) if (set.has(w)) hit += 1;
  return hit / Math.max(A.length, B.length);
}

function describeDeviation(script, spoken) {
  const a = speechTokens(script);
  const b = speechTokens(spoken);
  if (!a.length) return spoken ? "Not in the script" : "";
  if (!b.length) return "Not heard in this take";
  const overlap = tokenOverlap(script, spoken);
  if (overlap >= 0.78 && Math.abs(a.length - b.length) <= 3) return "";
  if (b.length > a.length + 4) return "Extra words vs the script";
  if (a.length > b.length + 4) return "Shorter than the script / words skipped";
  if (overlap < 0.55) return "Wording differs from the script";
  if (overlap < 0.78) return "Small wording change";
  return "";
}

function alignScriptToSegments(scriptEs, segments) {
  const rows = splitScriptRows(scriptEs);
  const segs = (segments || []).filter((s) => s && String(s.text || "").trim());
  if (!rows.length) {
    return segs.map((s) => ({
      script: "",
      spoken: s.text,
      start: s.start,
      end: s.end,
      deviation: "Not in the script",
    }));
  }
  const assigned = rows.map(() => []);
  const extras = rows.map(() => []);
  const before = [];
  let i = 0;
  for (const seg of segs) {
    const thisScore = tokenOverlap(seg.text, rows[i] || "");
    const nextScore = i + 1 < rows.length ? tokenOverlap(seg.text, rows[i + 1]) : 0;
    const extraRow = {
      script: "",
      spoken: seg.text,
      start: seg.start,
      end: seg.end,
      deviation: "Not in the script",
    };
    if (Math.max(thisScore, nextScore) < 0.18) {
      if (!assigned[i] || !assigned[i].length) before.push(extraRow);
      else extras[i].push(extraRow);
      continue;
    }
    if (nextScore > thisScore + 0.06 && nextScore >= 0.22) i += 1;
    assigned[Math.min(i, rows.length - 1)].push(seg);
  }
  const out = before.slice();
  rows.forEach((script, r) => {
    const group = assigned[r];
    const spoken = group.map((s) => s.text).join(" ").replace(/\s+/g, " ").trim();
    out.push({
      script,
      spoken,
      start: group.length ? group[0].start : null,
      end: group.length ? group[group.length - 1].end : null,
      deviation: describeDeviation(script, spoken) || null,
    });
    extras[r].forEach((row) => out.push(row));
  });
  return out;
}

function refineRowStartsFromWords(rows, words) {
  const list = (words || []).filter((w) => w && w.word && Number.isFinite(Number(w.start)));
  if (!list.length) return rows || [];
  let cursor = 0;
  return (rows || []).map((row) => {
    const script = String((row && row.script) || "").trim();
    if (!script) return row;
    let best = null;
    const t0 = cursor < list.length ? Number(list[cursor].start) : 0;
    for (let i = cursor; i < list.length; i++) {
      const t = Number(list[i].start);
      if (t > t0 + 55) break;
      const window = list
        .slice(i, i + 12)
        .map((w) => w.word)
        .join(" ");
      const score = tokenOverlap(window, script);
      if (score >= 0.28 && (!best || score > best.score + 0.03 || (score >= best.score - 0.01 && t < best.start))) {
        best = { i, start: t, score };
      }
      if (best && best.score >= 0.58 && i > best.i + 10) break;
    }
    if (!best) return row;
    cursor = best.i + 1;
    const need = Math.max(4, speechTokens(script).length);
    const spokenBits = [];
    let end = Number(list[best.i].end != null ? list[best.i].end : list[best.i].start);
    for (let j = best.i; j < list.length; j++) {
      spokenBits.push(list[j].word);
      end = Number(list[j].end != null ? list[j].end : list[j].start);
      if (speechTokens(spokenBits.join(" ")).length >= need && tokenOverlap(spokenBits.join(" "), script) >= 0.5) break;
      if (spokenBits.length > need + 14) break;
    }
    return {
      ...row,
      start: Math.round(best.start * 10) / 10,
      end: Math.round(end * 10) / 10,
      spoken: String((row && row.spoken) || spokenBits.join(" ")).trim(),
    };
  });
}

async function realignPlanFromTranscript(scriptEs, transcript, plan) {
  const spoken = extractSpoken(scriptEs);
  const segments = packTranscriptSegments(transcript);
  const words = packTranscriptWords(transcript);
  const existing = (plan.rows || []).filter((r) => String((r && r.script) || "").trim());
  let rows;
  if (existing.length >= 8) {
    rows = refineRowStartsFromWords(
      existing.map((r) => ({ ...r, start: null, end: null })),
      words
    );
  } else {
    rows = refineRowStartsFromWords(alignScriptToSegments(spoken, segments), words);
  }
  const next = { ...(plan || {}), segments, words, rows };
  next.issues = collectOffScriptIssues({
    scriptEs: spoken,
    words,
    cuts: next.cut,
    rows,
  });
  return next;
}

async function transcribeRecording(buffer, filename, mime) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("missing OPENAI_API_KEY");
  const form = new FormData();
  const blob = new Blob([buffer], { type: mime || "video/mp4" });
  form.append("file", blob, filename || "recording.mp4");
  form.append("model", "whisper-1");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "segment");
  form.append("timestamp_granularities[]", "word");
  form.append(
    "prompt",
    "Spanish lesson by Julie de Mejor Vida Seguros. Someone else may speak English before she starts. Transcribe every speaker."
  );
  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  const data = await r.json();
  if (!r.ok) {
    const msg = (data && data.error && data.error.message) || `Whisper ${r.status}`;
    throw new Error(String(msg).slice(0, 240));
  }
  return data;
}

async function buildCutPlan(scriptEs, transcript) {
  const segments = packTranscriptSegments(transcript);
  const timed = segments
    .map((s) => `[${Number(s.start).toFixed(2)}–${Number(s.end).toFixed(2)}] ${s.text}`)
    .join("\n");
  const raw = await openaiChat(
    [
      {
        role: "system",
        content:
          "You edit Julie Braunsroth talking-head recordings. Compare the approved Spanish script to a timestamped transcript. " +
          "Find retakes, 'go stop / go start / go back' commands, false starts, other people talking, and any audio that is not the approved script. " +
          "Return JSON only: " +
          '{"keep":[{"start":0,"end":12.4,"note":"opening"}],"cut":[{"start":12.4,"end":18.1,"reason":"retake"}],"summary":"one sentence",' +
          '"rows":[{"script":"exact approved sentence","spoken":"matching transcript for that line","start":0,"end":12.4,"deviation":null}]}. ' +
          "keep is the timeline to concatenate in order so the result matches the script. Times in seconds from the recording. " +
          "rows follow the approved script in order. script must be verbatim from the approved script (one sentence or short paragraph per row). " +
          "spoken is the closest transcript for that line. start/end are seconds. deviation is null when it matches; otherwise a short note (retake, extra words, skipped, command, other speaker). " +
          "Insert extra rows with script \"\" for spoken bits that are not in the script, in time order near the line they interrupt. " +
          "If someone else talks before Julie starts, that belongs in cut and as an extra row with an empty script.",
      },
      {
        role: "user",
        content: `Approved script:\n${scriptEs}\n\nTranscript:\n${timed || (transcript && transcript.text) || ""}`,
      },
    ],
    { temperature: 0.1, max_tokens: 3200 }
  );
  const jsonText = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  let plan;
  try {
    plan = JSON.parse(jsonText);
  } catch (e) {
    plan = { keep: [], cut: [], summary: raw.slice(0, 400), raw };
  }
  plan.segments = segments;
  plan.words = packTranscriptWords(transcript);
  const localRows = alignScriptToSegments(scriptEs, segments);
  if (!Array.isArray(plan.rows) || !plan.rows.length) {
    plan.rows = localRows;
  } else {
    plan.rows = plan.rows.map((r) => {
      const script = String((r && r.script) || "").trim();
      const spoken = String((r && r.spoken) || "").trim();
      return {
        script,
        spoken,
        start: r && r.start != null && r.start !== "" && Number.isFinite(Number(r.start)) ? Number(r.start) : null,
        end: r && r.end != null && r.end !== "" && Number.isFinite(Number(r.end)) ? Number(r.end) : null,
        deviation: describeDeviation(script, spoken) || null,
      };
    });
  }
  plan.issues = collectOffScriptIssues({
    scriptEs,
    words: plan.words,
    cuts: plan.cut,
    rows: plan.rows,
  });
  return plan;
}

module.exports = {
  JULIE_SCRIPT_SYSTEM,
  seedFromFiles,
  extractSpoken,
  forJulieRecording,
  pageTextForPrompt,
  openaiChat,
  transcribeRecording,
  buildCutPlan,
  alignScriptToSegments,
  packTranscriptSegments,
  packTranscriptWords,
  collectOffScriptIssues,
  describeDeviation,
  firstScriptWordTime,
  refineRowStartsFromWords,
  realignPlanFromTranscript,
};
