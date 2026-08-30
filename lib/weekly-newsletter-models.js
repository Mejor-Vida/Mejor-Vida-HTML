/**
 * Model selection for the two-stage weekly newsletter workflow.
 * Stage 1 = research / reasoning. Stage 2 = long-form writing.
 * Never use mini / nano / economy models for Stage 2.
 */

const FORBIDDEN_WRITE_RE = /\b(mini|nano|fast|economy|lite|haiku|flash)\b/i;

function researchModel() {
  return (
    process.env.WEEKLY_NEWSLETTER_RESEARCH_MODEL ||
    process.env.WEEKLY_RESEARCH_MODEL ||
    "o3"
  );
}

function writeModel() {
  const raw =
    process.env.WEEKLY_NEWSLETTER_WRITE_MODEL ||
    process.env.WEEKLY_WRITE_MODEL ||
    "gpt-5.6";
  if (FORBIDDEN_WRITE_RE.test(raw)) {
    throw new Error(
      `WEEKLY_NEWSLETTER_WRITE_MODEL="${raw}" is not allowed for Stage 2. ` +
        `Use GPT-5.6 or another strong long-form writing model (not mini/fast/economy).`
    );
  }
  return raw;
}

function isReasoningModel(model) {
  return /^(o[0-9]|o[0-9]-|gpt-5|chatgpt-4o-latest)/i.test(String(model || "")) ||
    /\breasoning\b/i.test(String(model || ""));
}

/**
 * Chat Completions helper that works with classic and reasoning models.
 */
async function openAiJsonChat(apiKey, opts) {
  opts = opts || {};
  const model = opts.model;
  if (!model) throw new Error("openAiJsonChat requires model");
  const messages = opts.messages;
  if (!messages || !messages.length) throw new Error("openAiJsonChat requires messages");

  const body = {
    model,
    messages,
    response_format: opts.response_format || { type: "json_object" },
  };

  const maxTokens = opts.maxTokens || 8000;
  if (isReasoningModel(model)) {
    body.max_completion_tokens = maxTokens;
  } else {
    body.max_tokens = maxTokens;
    if (typeof opts.temperature === "number") body.temperature = opts.temperature;
    else body.temperature = 0.3;
  }

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) {
    const err = data.error && data.error.message ? data.error.message : JSON.stringify(data);
    throw new Error(`OpenAI ${model} ${r.status}: ${err}`);
  }
  const text =
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content;
  try {
    return JSON.parse(text || "{}");
  } catch (_) {
    throw new Error(`OpenAI ${model} returned non-JSON`);
  }
}

module.exports = {
  researchModel,
  writeModel,
  isReasoningModel,
  openAiJsonChat,
  FORBIDDEN_WRITE_RE,
};
