/**
 * POST /api/quote
 * ManyChat External Request — returns Low / High / Anchor price range
 * for $10K Final Expense coverage based on age, sex, and smoker status.
 *
 * No health questions. No carrier names. Coverage shown for $10K only,
 * with a note that prices scale for other amounts.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY alias), MANYCHAT_WEBHOOK_SECRET
 *
 * Request body (from ManyChat):
 *   { "age": 65, "sex": "male", "smoker": "no" }
 *   sex: "male" | "female"
 *   Tobacco: smoker | tabaco | tobacco — "yes" | "no" (or boolean true/false)
 *
 * Response: ManyChat v2 content.set_field_values PLUS flat top-level keys
 * (quote_low, quote_high, quote_anchor, quote_status, quote_error) for External
 * Request JSON mapping that cannot read nested arrays.
 *   {
 *     "quote_low": "$56.48",
 *     "quote_high": "$68.44",
 *     "quote_anchor": "$62.46",
 *     "quote_status": "ok",
 *     "quote_error": "",
 *     "version": "v2",
 *     "content": { "type": "show_dynamic_block", "messages": [], "set_field_values": [ ... ] }
 *   }
 */

const { verifyManychatSecret, logRequest } = require("../lib/manychat-auth");
const {
  isQuoteAgeInRange,
  quoteAgeOutOfRangeMessage,
  fetchQuoteRangeForAge,
} = require("../lib/quote-range-router");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

/** Format a number as "$XX.XX" */
function dollars(n) {
  return `$${Number(n).toFixed(2)}`;
}

/** Build a ManyChat "set custom fields" response + flat keys for JSON field mapping */
function manychatFields(fields) {
  const quote_low = fields.quote_low ?? "";
  const quote_high = fields.quote_high ?? "";
  const quote_anchor = fields.quote_anchor ?? "";
  const quote_status = fields.quote_status ?? "";
  const quote_error = fields.quote_error ?? "";
  return {
    quote_low,
    quote_high,
    quote_anchor,
    quote_status,
    quote_error,
    version: "v2",
    content: {
      type: "show_dynamic_block",
      messages: [],
      set_field_values: Object.entries(fields).map(([field_name, value]) => ({
        field_name,
        value: value === undefined || value === null ? "" : String(value),
      })),
    },
  };
}

module.exports = async function handler(req, res) {
  logRequest("quote");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { status: "error", error: "Method Not Allowed" });
  }

  const auth = verifyManychatSecret(req);
  if (!auth.ok) {
    return json(res, auth.status, { status: "error", error: auth.error });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return json(res, 500, { status: "error", error: "Missing Supabase config" });
  }

  try {
    const body = readJsonBody(req);

    // Parse & validate inputs
    // Accept "edad" (Spanish ManyChat field) or "age"
    const age = parseInt(body.edad ?? body.age, 10);
    if (isNaN(age) || !isQuoteAgeInRange(age)) {
      return json(
        res,
        200,
        manychatFields({
          quote_status: "out_of_range",
          quote_low: "",
          quote_high: "",
          quote_anchor: "",
          quote_error: quoteAgeOutOfRangeMessage(age),
        }),
      );
    }

    // Accept "sexo" (Spanish ManyChat field) or "sex"; normalize Hombre→male, Mujer→female
    const sexRaw = String(body.sexo || body.sex || "").toLowerCase().trim();
    const sexMap = { hombre: "male", mujer: "female", male: "male", female: "female" };
    const sex = sexMap[sexRaw] || sexRaw;
    if (sex !== "male" && sex !== "female") {
      return json(
        res,
        200,
        manychatFields({
          quote_status: "error",
          quote_low: "",
          quote_high: "",
          quote_anchor: "",
          quote_error: "Please provide sex as male or female.",
        }),
      );
    }

    // Accept smoker, tabaco (Spanish), or tobacco (ManyChat field name)
    // Normalize: Sí/Si/yes/true/1 → true, No/no/false → false
    let smokerRaw = body.smoker ?? body.tabaco ?? body.tobacco;
    let smoker;
    if (typeof smokerRaw === "boolean") {
      smoker = smokerRaw;
    } else {
      const s = String(smokerRaw || "no").toLowerCase().trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // strip accents: sí→si
      smoker = s === "yes" || s === "si" || s === "true" || s === "1";
    }

    const { range } = await fetchQuoteRangeForAge(
      SUPABASE_URL,
      SUPABASE_KEY,
      age,
      sex,
      smoker
    );

    if (!range) {
      const tobaccoMsg =
        age <= 44 && smoker
          ? "Aún no tenemos tarifas de tabaco para Assurity en línea. Julie puede cotizarle desde Agent Center."
          : "We don't have rate data for that combination yet.";
      return json(
        res,
        200,
        manychatFields({
          quote_status: "no_data",
          quote_low: "",
          quote_high: "",
          quote_anchor: "",
          quote_error: tobaccoMsg,
        }),
      );
    }

    return json(
      res,
      200,
      manychatFields({
        quote_status: "ok",
        quote_low: dollars(range.low),
        quote_high: dollars(range.high),
        quote_anchor: dollars(range.anchor),
        quote_error: "",
      }),
    );
  } catch (err) {
    console.error("quote error:", err);
    return json(
      res,
      200,
      manychatFields({
        quote_status: "error",
        quote_low: "",
        quote_high: "",
        quote_anchor: "",
        quote_error: "Something went wrong. Please try again.",
      }),
    );
  }
};
