/**
 * POST /api/quote-site
 * Same range logic as /api/quote but JSON for the website (no ManyChat secret).
 * Guarded by allowed Origin — see lib/site-origin.js.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)
 */

const { verifySiteOrigin } = require("../lib/site-origin");
const { logRequest } = require("../lib/manychat-auth");
const {
  isQuoteAgeInRange,
  quoteAgeOutOfRangeMessage,
  fetchQuoteRangeForAge,
} = require("../lib/quote-range-router");
const { scaledRangeResponse } = require("../lib/quote-range-scale");

function applyCors(req, res) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

module.exports = async function handler(req, res) {
  logRequest("quote-site");
  // For local dev pages calling production, reflect CORS once origin is verified.
  applyCors(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const origin = verifySiteOrigin(req);
  if (!origin.ok) {
    return json(res, origin.status, { ok: false, error: origin.error });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return json(res, 500, { ok: false, error: "Missing Supabase config" });
  }

  try {
    const body = readJsonBody(req);
    const age = parseInt(body.age, 10);
    if (isNaN(age) || !isQuoteAgeInRange(age)) {
      return json(res, 200, {
        ok: true,
        quote_status: "out_of_range",
        quote_low: "",
        quote_high: "",
        quote_anchor: "",
        quote_error: quoteAgeOutOfRangeMessage(age),
      });
    }

    const sex = String(body.sex || "").toLowerCase().trim();
    if (sex !== "male" && sex !== "female") {
      return json(res, 200, {
        ok: true,
        quote_status: "error",
        quote_error: "Please provide sex as male or female.",
      });
    }

    let smokerRaw = body.smoker;
    let smoker;
    if (typeof smokerRaw === "boolean") {
      smoker = smokerRaw;
    } else {
      const s = String(smokerRaw || "no").toLowerCase().trim();
      smoker = s === "yes" || s === "true" || s === "1";
    }

    const { range, carrier } = await fetchQuoteRangeForAge(
      SUPABASE_URL,
      SUPABASE_KEY,
      age,
      sex,
      smoker
    );

    if (!range) {
      const tobaccoMsg =
        age <= 44 && smoker
          ? "We do not have Assurity tobacco premiums on file yet. Julie can quote you from Agent Center."
          : "We don't have rate data for that combination yet.";
      return json(res, 200, {
        ok: true,
        quote_status: "no_data",
        quote_low: "",
        quote_high: "",
        quote_anchor: "",
        quote_error: tobaccoMsg,
      });
    }

    const coverageAmount = parseInt(
      body.coverageAmount || body.coverage || 10000,
      10
    );
    const scaled = scaledRangeResponse(
      range,
      Number.isFinite(coverageAmount) && coverageAmount > 0
        ? coverageAmount
        : 10000
    );

    return json(res, 200, {
      ok: true,
      quote_status: "ok",
      quote_low: scaled.low,
      quote_high: scaled.high,
      quote_anchor: scaled.anchor,
      quote_error: "",
      quote_carrier: carrier || "",
      coverage_amount: Number.isFinite(coverageAmount) ? coverageAmount : 10000,
    });
  } catch (err) {
    console.error("quote-site error:", err);
    return json(res, 200, {
      ok: false,
      quote_status: "error",
      quote_low: "",
      quote_high: "",
      quote_anchor: "",
      quote_error: "Something went wrong. Please try again.",
    });
  }
};
