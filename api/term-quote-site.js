/**
 * POST /api/term-quote-site
 * Public Nebraska term life quote range (low/high/anchor monthly).
 * Guarded by allowed Origin — see lib/site-origin.js.
 */

const { verifySiteOrigin } = require("../lib/site-origin");
const { logRequest } = require("../lib/manychat-auth");
const {
  isTermAgeInRange,
  termAgeOutOfRangeMessage,
  fetchTermQuoteRange,
} = require("../lib/term-quote-router");
const {
  normalizeUnderwritingMode,
  maxFaceForUnderwritingMode,
  snapCoverageForMode,
} = require("../lib/term-underwriting-mode");

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

const VALID_TERMS = [10, 15, 20, 25, 30];

module.exports = async function handler(req, res) {
  logRequest("term-quote-site");
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
    const termYears = parseInt(body.termYears || body.term_years || body.term, 10);

    if (!VALID_TERMS.includes(termYears)) {
      return json(res, 200, {
        ok: true,
        quote_status: "error",
        quote_error: "Please select a valid term length (10, 15, 20, 25, or 30 years).",
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

    if (!isTermAgeInRange(age, termYears, smoker)) {
      return json(res, 200, {
        ok: true,
        quote_status: "out_of_range",
        quote_low: "",
        quote_high: "",
        quote_anchor: "",
        quote_error: termAgeOutOfRangeMessage(age, termYears, smoker),
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

    const coverageRaw = parseInt(
      body.coverageAmount || body.coverage || 250000,
      10
    );
    const underwritingMode = normalizeUnderwritingMode(
      body.underwritingMode || body.quoteMode || body.underwriting_mode
    );
    const coverageAmount = snapCoverageForMode(
      coverageRaw,
      underwritingMode,
      age
    );
    if (!Number.isFinite(coverageRaw) || coverageRaw < 25000) {
      return json(res, 200, {
        ok: true,
        quote_status: "error",
        quote_error: "Please select a coverage amount of at least $25,000.",
      });
    }
    const modeMaxFace = maxFaceForUnderwritingMode(underwritingMode, age);
    if (coverageAmount > modeMaxFace) {
      const label =
        underwritingMode === "simplified"
          ? "Simplified issue (Easy Term)"
          : "Fully underwritten";
      return json(res, 200, {
        ok: true,
        quote_status: "error",
        quote_error: `${label} quotes online are available up to $${modeMaxFace.toLocaleString("en-US")} for your age.`,
      });
    }

    const heightFt = parseInt(body.heightFt || body.height_ft, 10);
    const heightIn = parseInt(body.heightIn || body.height_in, 10);
    const weightLbs = parseInt(body.weightLbs || body.weight_lbs || body.weight, 10);
    if (
      !Number.isFinite(heightFt) ||
      !Number.isFinite(heightIn) ||
      !Number.isFinite(weightLbs)
    ) {
      return json(res, 200, {
        ok: true,
        quote_status: "error",
        quote_error: "Height and weight are required.",
      });
    }

    const state = String(body.state || "NE")
      .trim()
      .toUpperCase()
      .slice(0, 2);
    if (state !== "NE") {
      return json(res, 200, {
        ok: true,
        quote_status: "error",
        quote_error: "Online term quotes are available for licensed states only (NE, KS, CO, NV).",
      });
    }

    const result = await fetchTermQuoteRange(SUPABASE_URL, SUPABASE_KEY, {
      age,
      sex,
      smoker,
      termYears,
      state,
      coverageAmount,
      heightFt,
      heightIn,
      weightLbs,
      underwritingMode,
    });

    if (!result.range) {
      const msg =
        result.reason === "build_decline"
          ? "Based on height and weight, we cannot show an online range. Julie can review options with you."
          : underwritingMode === "simplified"
            ? "We don't have simplified issue rates for that combination yet. Try fully underwritten or contact Julie."
            : "We don't have fully underwritten rate data for that combination yet. Try simplified issue or contact Julie.";
      return json(res, 200, {
        ok: true,
        quote_status: "no_data",
        quote_low: "",
        quote_high: "",
        quote_anchor: "",
        quote_error: msg,
      });
    }

    return json(res, 200, {
      ok: true,
      quote_status: "ok",
      quote_low: result.range.low,
      quote_high: result.range.high,
      quote_anchor: result.range.anchor,
      quote_error: "",
      term_years: termYears,
      coverage_amount: coverageAmount,
      build_cap: result.buildCap || "",
      underwriting_mode: underwritingMode,
      max_face: modeMaxFace,
    });
  } catch (err) {
    console.error("term-quote-site error:", err);
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
