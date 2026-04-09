/**
 * POST /api/quote-site
 * Same range logic as /api/quote but JSON for the website (no ManyChat secret).
 * Guarded by allowed Origin — see lib/site-origin.js.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)
 */

const { verifySiteOrigin } = require("../lib/site-origin");
const { logRequest } = require("../lib/manychat-auth");
const { fetchQuoteRange } = require("../lib/supabase");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function dollars(n) {
  return `$${Number(n).toFixed(2)}`;
}

module.exports = async function handler(req, res) {
  logRequest("quote-site");
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
    if (isNaN(age) || age < 45 || age > 85) {
      return json(res, 200, {
        ok: true,
        quote_status: "out_of_range",
        quote_low: "",
        quote_high: "",
        quote_anchor: "",
        quote_error:
          age < 45
            ? "Our final expense products start at age 45."
            : "Our final expense products are available up to age 85.",
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

    const range = await fetchQuoteRange(SUPABASE_URL, SUPABASE_KEY, age, sex, smoker);

    if (!range) {
      return json(res, 200, {
        ok: true,
        quote_status: "no_data",
        quote_low: "",
        quote_high: "",
        quote_anchor: "",
        quote_error: "We don't have rate data for that combination yet.",
      });
    }

    return json(res, 200, {
      ok: true,
      quote_status: "ok",
      quote_low: dollars(range.low),
      quote_high: dollars(range.high),
      quote_anchor: dollars(range.anchor),
      quote_error: "",
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
