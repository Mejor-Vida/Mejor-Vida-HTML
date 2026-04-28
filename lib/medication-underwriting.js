/**
 * Triage medication names for simplified underwriting risk signals (not medical advice).
 * OpenAI classifies unknowns; sync heuristics catch obvious benign/cosmetic Rx.
 */

const BENIGN_SYNC_PATTERNS = [
  /\bminoxidil\b/i,
  /\brogaine\b/i,
  /\bfinasteride\b/i,
  /\bpropecia\b/i,
  /\bdutasteride\b/i,
  /\blatisse\b/i,
  /\bbimatoprost\b/i,
  /\btretinoin\b/i,
  /\badapalene\b/i,
  /\bvitamin\s*d\b/i,
  /\bbiotin\b/i,
];

function medListSignature(names) {
  const arr = (Array.isArray(names) ? names : [])
    .map((x) => String(x || "").trim().toLowerCase())
    .filter(Boolean)
    .sort();
  return arr.join("|");
}

function looksBenignBySyncHeuristic(name) {
  const t = String(name || "").trim();
  if (!t) return false;
  return BENIGN_SYNC_PATTERNS.some((re) => re.test(t));
}

/**
 * @param {string[]} medicationNames
 * @returns {boolean} true if every non-empty name matches benign heuristic
 */
function allMedicationsBenignByHeuristic(medicationNames) {
  const meds = (medicationNames || []).map((s) => String(s || "").trim()).filter(Boolean);
  if (!meds.length) return false;
  return meds.every((m) => looksBenignBySyncHeuristic(m));
}

/**
 * @param {object|null} classification from classifyMedicationsWithOpenAI
 * @returns {'elevated'|'maintenance'|'benign'|'unknown'|'none'}
 */
function worstMedicationTier(classification) {
  const c = classification && typeof classification === "object" ? classification : null;
  const items = c && Array.isArray(c.items) ? c.items : [];
  if (!items.length) return "none";
  const order = { elevated_cardiometabolic_or_controlled_serious: 3, maintenance_commonly_standard: 2, benign_cosmetic: 1, unknown: 2 };
  let worst = 0;
  let label = "benign";
  for (const it of items) {
    const t = String(it.tier || "unknown");
    const w = order[t] != null ? order[t] : 2;
    if (w > worst) {
      worst = w;
      if (t === "elevated_cardiometabolic_or_controlled_serious") label = "elevated";
      else if (t === "maintenance_commonly_standard") label = "maintenance";
      else if (t === "benign_cosmetic") label = "benign";
      else label = "unknown";
    }
  }
  return label;
}

/**
 * Rx should bump simplified-issue style "moderate" risk when any med is not purely benign cosmetic,
 * or when we could not classify and heuristics did not all-clear.
 */
function rxEscalatesModerateRisk(medicationNames, classification) {
  const meds = (medicationNames || []).map((s) => String(s || "").trim()).filter(Boolean);
  const worst = worstMedicationTier(classification);
  if (worst === "elevated" || worst === "maintenance" || worst === "unknown") return true;
  if (worst === "benign") return false;
  if (!meds.length) return true;
  return !allMedicationsBenignByHeuristic(meds);
}

async function classifyMedicationsWithOpenAI(openaiKey, medicationNames) {
  const names = [...new Set((medicationNames || []).map((s) => String(s || "").trim()).filter(Boolean))];
  if (!names.length || !openaiKey) return null;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You classify drug names for life-insurance underwriting triage (not medical advice, not a diagnosis).

Return strict JSON:
{"items":[{"name":"string (match input)","tier":"benign_cosmetic|maintenance_commonly_standard|elevated_cardiometabolic_or_controlled_serious|unknown","reason_short":"max 80 chars"}],"rationale":"one sentence"}

Tier definitions:
- benign_cosmetic: hair growth topicals, cosmetic-only dermatology, routine supplements unlikely alone to change simplified underwriting.
- maintenance_commonly_standard: typical stable maintenance meds (BP, lipids, thyroid replacement, metformin without complications, stable psych meds without hospitalization, etc.).
- elevated_cardiometabolic_or_controlled_serious: anticoagulants/antiplatelets for serious disease, insulin, opioids for chronic pain, transplant/immunosuppressants, chemo, high-risk combinations.
- unknown: cannot tell from the name alone.

If a name is a brand, infer the usual generic class. Prefer unknown over guessing elevated.`,
        },
        { role: "user", content: JSON.stringify({ medications: names }) },
      ],
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`medication classify ${r.status}`);
  let parsed = {};
  try {
    parsed = JSON.parse(String(data?.choices?.[0]?.message?.content || "{}"));
  } catch (_e) {
    parsed = {};
  }
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  const normalized = items
    .filter((x) => x && x.name)
    .map((x) => ({
      name: String(x.name).trim(),
      tier: String(x.tier || "unknown").trim(),
      reason_short: String(x.reason_short || "").slice(0, 120),
    }));
  return {
    items: normalized,
    rationale: String(parsed.rationale || "").slice(0, 400),
    input_signature: medListSignature(names),
    classified_at: new Date().toISOString(),
  };
}

module.exports = {
  medListSignature,
  looksBenignBySyncHeuristic,
  allMedicationsBenignByHeuristic,
  worstMedicationTier,
  rxEscalatesModerateRisk,
  classifyMedicationsWithOpenAI,
};
