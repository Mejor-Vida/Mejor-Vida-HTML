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

async function transcribeRecording(buffer, filename, mime) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("missing OPENAI_API_KEY");
  const form = new FormData();
  const blob = new Blob([buffer], { type: mime || "video/mp4" });
  form.append("file", blob, filename || "recording.mp4");
  form.append("model", "whisper-1");
  form.append("language", "es");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "segment");
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
  const segments = (transcript && transcript.segments) || [];
  const timed = segments
    .map((s) => {
      const start = Number(s.start);
      const end = Number(s.end);
      const text = String(s.text || "").trim();
      if (!text || !Number.isFinite(start)) return "";
      return `[${start.toFixed(2)}–${end.toFixed(2)}] ${text}`;
    })
    .filter(Boolean)
    .join("\n");
  const raw = await openaiChat(
    [
      {
        role: "system",
        content:
          "You edit Julie Braunsroth talking-head recordings. Compare the approved Spanish script to a timestamped transcript. " +
          "Find retakes, 'go stop / go start / go back' commands, false starts, and repeated sentences. " +
          "Return JSON only: {\"keep\":[{\"start\":0,\"end\":12.4,\"note\":\"opening\"}],\"cut\":[{\"start\":12.4,\"end\":18.1,\"reason\":\"retake\"}],\"summary\":\"one sentence\"}. " +
          "keep is the timeline to concatenate in order so the result matches the script. Times in seconds from the recording.",
      },
      {
        role: "user",
        content: `Approved script:\n${scriptEs}\n\nTranscript:\n${timed || transcript.text || ""}`,
      },
    ],
    { temperature: 0.1, max_tokens: 1800 }
  );
  const jsonText = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    return { keep: [], cut: [], summary: raw.slice(0, 400), raw };
  }
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
};
