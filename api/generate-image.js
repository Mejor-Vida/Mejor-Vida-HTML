const {
  ALLOWED_TYPES,
  TYPE_DEFAULTS,
  DEFAULT_MODEL,
  DEFAULT_NEGATIVE_PROMPT,
  sanitizeFilename,
  clampDimension,
} = require("./_image-utils");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readBearerToken(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, error: "Method Not Allowed" });
  }

  const expectedAuthToken = process.env.IMAGE_API_AUTH_TOKEN;
  const hfToken = process.env.HF_TOKEN;
  if (!expectedAuthToken || !hfToken) {
    return json(res, 500, { success: false, error: "Server env vars are not configured" });
  }

  const bearer = readBearerToken(req);
  if (!bearer || bearer !== expectedAuthToken) {
    return json(res, 401, { success: false, error: "Unauthorized" });
  }

  let body = {};
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (_) {
    return json(res, 400, { success: false, error: "Invalid JSON body" });
  }
  const prompt = String(body.prompt || "").trim();
  const type = String(body.type || "").trim();
  const filename = sanitizeFilename(body.filename);

  if (!prompt || prompt.length < 8) {
    return json(res, 400, { success: false, error: "Invalid prompt" });
  }

  if (!ALLOWED_TYPES.has(type)) {
    return json(res, 400, { success: false, error: "Invalid type" });
  }

  const defaults = TYPE_DEFAULTS[type];
  const width = clampDimension(body.width, defaults.width);
  const height = clampDimension(body.height, defaults.height);

  const hfUrl = `https://router.huggingface.co/hf-inference/models/${DEFAULT_MODEL}`;
  const payload = {
    inputs: prompt,
    parameters: {
      width,
      height,
      negative_prompt: DEFAULT_NEGATIVE_PROMPT,
      num_inference_steps: 4,
      guidance_scale: 3.5,
    },
    options: { wait_for_model: true, use_cache: false },
  };

  try {
    const hfResp = await fetch(hfUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const contentType = hfResp.headers.get("content-type") || "";
    if (!hfResp.ok) {
      let details = "Generation failed";
      try {
        details = await hfResp.text();
      } catch (_) {}
      return json(res, 502, {
        success: false,
        error: "Hugging Face request failed",
        details: details.slice(0, 500),
      });
    }

    if (contentType.includes("application/json")) {
      const errPayload = await hfResp.json();
      return json(res, 502, {
        success: false,
        error: "Unexpected JSON response from image model",
        details: errPayload,
      });
    }

    const arrayBuffer = await hfResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = contentType || "image/png";

    return json(res, 200, {
      success: true,
      mimeType,
      base64: buffer.toString("base64"),
      filename: `${filename}.png`,
      meta: { type, width, height, model: DEFAULT_MODEL },
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      error: "Internal generation error",
      details: error && error.message ? error.message : "Unknown error",
    });
  }
};
