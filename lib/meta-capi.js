/**
 * Meta Conversions API — shared helpers for Spanish FE landing events.
 * Pixel: 873141755808233 (Mejor Vida Landing Page)
 */
const crypto = require("crypto");

const META_PIXEL_ID = String(process.env.META_PIXEL_ID || "873141755808233").trim();
const META_GRAPH_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "v19.0").trim();

const LANDING_EVENT_NAMES = new Set(["PageView", "ViewContent"]);

function capiSha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function capiNormalizePhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) digits = "1" + digits;
  return digits || null;
}

function capiNormalizeZip(zip) {
  const digits = String(zip || "").replace(/\D/g, "").slice(0, 5);
  return digits.length >= 5 ? digits : null;
}

function gastosFinalesLandingPath(originDetail) {
  return String(
    (originDetail && (originDetail.page_path || originDetail.landing_path)) || ""
  );
}

function isGastosFinalesLanding(originDetail) {
  return gastosFinalesLandingPath(originDetail).includes("gastos-finales-ads");
}

function isSpanishGastosFinalesLanding(originDetail, body) {
  const path = gastosFinalesLandingPath(originDetail);
  if (!path.includes("gastos-finales-ads")) return false;
  if (/\/en\//i.test(path)) return false;
  const lang = String((body && body.lang) || "").trim().toLowerCase();
  if (lang === "en") return false;
  const source = String((body && body.source) || "").trim();
  if (source === "english_landing_gastos_finales") return false;
  return true;
}

function shouldSendMetaCapiForLead(leadSource, originDetail) {
  if (leadSource === "facebook_landing_gastos_finales") return true;
  if (leadSource === "nebraska_quote_page" && isGastosFinalesLanding(originDetail)) {
    return true;
  }
  if (leadSource === "fexquotes_page" && isGastosFinalesLanding(originDetail)) {
    return true;
  }
  return false;
}

function capiClientUserAgent(req, body) {
  const fromBody = String((body && body.clientUserAgent) || "").trim();
  if (fromBody) return fromBody.slice(0, 1000);
  const h = (req && req.headers) || {};
  const fromReq = String(h["user-agent"] || h["User-Agent"] || "").trim();
  return fromReq ? fromReq.slice(0, 1000) : null;
}

function capiClientIp(req) {
  const h = (req && req.headers) || {};
  const xff = String(h["x-forwarded-for"] || h["X-Forwarded-For"] || "")
    .split(",")[0]
    .trim();
  const real = String(h["x-real-ip"] || h["X-Real-IP"] || "").trim();
  const ip = xff || real;
  if (ip && /^[\da-fA-F:.]+$/.test(ip) && ip.length <= 45) return ip;
  return null;
}

function capiFbcFromOrigin(metaFbc, originDetail) {
  const fromClient = String(metaFbc || "").trim();
  if (fromClient) return fromClient.slice(0, 500);
  const fbclid = String((originDetail && originDetail.fbclid) || "").trim();
  if (!fbclid) return null;
  return `fb.1.${Date.now()}.${fbclid.slice(0, 500)}`;
}

function capiEventSourceUrl(originDetail) {
  const path = String(
    (originDetail && (originDetail.page_path || originDetail.landing_path)) || ""
  ).trim();
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path.split("?")[0];
  }
  if (path.startsWith("/")) {
    return `https://www.mejorvidainsurance.com${path.split("?")[0]}`;
  }
  return "https://www.mejorvidainsurance.com/gastos-finales-ads-v2/";
}

function buildCapiUserData({
  email,
  phone,
  firstName,
  lastName,
  sex,
  city,
  state,
  zip,
  country,
  metaFbp,
  metaFbc,
  originDetail,
  clientUserAgent,
  clientIp,
  externalId,
}) {
  const userData = {};

  const sexNorm = String(sex || "").toLowerCase();
  if (sexNorm === "male" || sexNorm === "female") {
    userData.ge = [capiSha256(sexNorm === "male" ? "m" : "f")];
  }

  const emNorm = String(email || "")
    .trim()
    .toLowerCase();
  if (emNorm) userData.em = [capiSha256(emNorm)];

  const phNorm = capiNormalizePhone(phone);
  if (phNorm) userData.ph = [capiSha256(phNorm)];

  const fnNorm = String(firstName || "")
    .trim()
    .toLowerCase();
  if (fnNorm) userData.fn = [capiSha256(fnNorm)];

  const lnNorm = String(lastName || "")
    .trim()
    .toLowerCase();
  if (lnNorm) userData.ln = [capiSha256(lnNorm)];

  const ctNorm = String(city || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (ctNorm) userData.ct = [capiSha256(ctNorm)];

  const stNorm = String(state || "")
    .trim()
    .toLowerCase();
  if (stNorm.length === 2) userData.st = [capiSha256(stNorm)];

  const zpNorm = capiNormalizeZip(zip);
  if (zpNorm) userData.zp = [capiSha256(zpNorm)];

  const countryNorm = String(country || "")
    .trim()
    .toLowerCase();
  if (countryNorm) {
    userData.country = [capiSha256(countryNorm.length === 2 ? countryNorm : "us")];
  } else if (stNorm.length === 2) {
    userData.country = [capiSha256("us")];
  }

  const fbp = String(metaFbp || "").trim();
  if (fbp) userData.fbp = fbp.slice(0, 200);

  const fbc = capiFbcFromOrigin(metaFbc, originDetail);
  if (fbc) userData.fbc = fbc;

  const ua = String(clientUserAgent || "").trim();
  if (ua) userData.client_user_agent = ua.slice(0, 1000);

  if (clientIp) userData.client_ip_address = clientIp;

  const dedupeId = String(externalId || "").trim().slice(0, 128);
  if (dedupeId) userData.external_id = [capiSha256(dedupeId)];

  return userData;
}

function buildCapiUserDataFromBody(req, body, originDetail) {
  const sessionId = String(
    (body && (body.sessionClientId || body.session_client_id)) || ""
  ).trim();
  const eventId = String((body && body.eventId) || "").trim();
  const externalId = sessionId || eventId || null;

  return buildCapiUserData({
    email: body && body.email,
    phone: body && body.phone,
    firstName: body && body.firstName,
    lastName: body && body.lastName,
    sex: body && body.sex,
    city: body && body.city,
    state: body && body.state,
    zip: body && body.zip,
    country: body && body.country,
    metaFbp: body && body.metaFbp,
    metaFbc: body && body.metaFbc,
    originDetail,
    clientUserAgent: capiClientUserAgent(req, body),
    clientIp: capiClientIp(req),
    externalId,
  });
}

async function postMetaCapiPayload(payload, accessToken) {
  const token = String(accessToken || process.env.META_CAPI_ACCESS_TOKEN || "").trim();
  if (!token) return { skipped: true, reason: "META_CAPI_ACCESS_TOKEN not set" };

  const testCode = String(process.env.META_CAPI_TEST_EVENT_CODE || "").trim();
  if (testCode) payload.test_event_code = testCode;

  const url = `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) {
    console.log("[CAPI] failure", r.status, text.slice(0, 400));
    return { ok: false, status: r.status, body: text.slice(0, 400) };
  }
  console.log("[CAPI] success", text.slice(0, 400));
  return { ok: true, body: text.slice(0, 400) };
}

async function sendMetaCapiWebsiteEvent({
  eventName,
  eventId,
  originDetail = {},
  req,
  body = {},
  customData,
  leadSource,
}) {
  try {
    const name = String(eventName || "").trim();
    if (!name) return { skipped: true, reason: "missing event name" };

    if (leadSource != null) {
      if (!shouldSendMetaCapiForLead(leadSource, originDetail)) {
        return { skipped: true, reason: "lead source not eligible" };
      }
    } else if (!isSpanishGastosFinalesLanding(originDetail, body)) {
      return { skipped: true, reason: "not spanish gastos-finales landing" };
    }

    const userData = buildCapiUserDataFromBody(req, body, originDetail);
    const dedupeId = String(eventId || body.eventId || "").trim().slice(0, 128);

    const eventRow = {
      event_name: name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: capiEventSourceUrl(originDetail),
      user_data: userData,
    };
    if (dedupeId) eventRow.event_id = dedupeId;
    if (customData && typeof customData === "object" && Object.keys(customData).length) {
      eventRow.custom_data = customData;
    } else if (name === "Lead") {
      eventRow.custom_data = { currency: "USD", value: 0 };
    }

    return await postMetaCapiPayload({ data: [eventRow] });
  } catch (e) {
    console.log("[CAPI] failure", e.message || String(e));
    return { ok: false, error: e.message || String(e) };
  }
}

module.exports = {
  META_PIXEL_ID,
  META_GRAPH_API_VERSION,
  LANDING_EVENT_NAMES,
  capiSha256,
  capiNormalizePhone,
  gastosFinalesLandingPath,
  isGastosFinalesLanding,
  isSpanishGastosFinalesLanding,
  shouldSendMetaCapiForLead,
  capiClientUserAgent,
  capiClientIp,
  capiFbcFromOrigin,
  capiEventSourceUrl,
  buildCapiUserData,
  buildCapiUserDataFromBody,
  sendMetaCapiWebsiteEvent,
};
