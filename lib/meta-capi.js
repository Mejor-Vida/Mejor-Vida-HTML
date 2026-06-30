/**
 * Meta Conversions API — website events (PageView, ViewContent, Lead).
 * Pairs with browser Pixel via matching event_id; user_data hashed per Meta spec.
 */
const {
  hashMetaText,
  hashMetaPhone,
  hashMetaZip,
  hashMetaState,
  hashMetaCountry,
  hashMetaGender,
  hashMetaDob,
  hashMetaExternalId,
  normalizePhoneDigits,
  capiSha256Hex,
} = require("./meta-capi-hash");

const META_PIXEL_ID = String(process.env.META_PIXEL_ID || "873141755808233").trim();
const META_GRAPH_API_VERSION = String(process.env.META_GRAPH_API_VERSION || "v19.0").trim();

const LANDING_EVENT_NAMES = new Set(["PageView", "ViewContent"]);
const WEBSITE_EVENT_NAMES = new Set(["PageView", "ViewContent", "Lead"]);

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

function isPlausibleFbclid(value) {
  const id = String(value || "").trim();
  if (!id || id.length < 20) return false;
  if (/^(fbclid|\{\{fbclid\}\}|test|placeholder)$/i.test(id)) return false;
  return true;
}

function capiFbcFromOrigin(metaFbc) {
  const fromClient = String(metaFbc || "").trim();
  if (!fromClient) return null;
  // Pass through browser _fbc only — do not rebuild on server (breaks ad attribution).
  const match = fromClient.match(/^fb\.1\.(\d+)\.(.+)$/);
  if (!match || !isPlausibleFbclid(match[2])) return null;
  return fromClient;
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
  dob,
  metaFbp,
  metaFbc,
  originDetail,
  clientUserAgent,
  clientIp,
  externalId,
}) {
  const userData = {};

  const geHash = hashMetaGender(sex);
  if (geHash) userData.ge = [geHash];

  const emHash = hashMetaText(email);
  if (emHash) userData.em = [emHash];

  const phHash = hashMetaPhone(phone);
  if (phHash) userData.ph = [phHash];

  const fnHash = hashMetaText(firstName);
  if (fnHash) userData.fn = [fnHash];

  const lnHash = hashMetaText(lastName);
  if (lnHash) userData.ln = [lnHash];

  const ctHash = hashMetaText(city);
  if (ctHash) userData.ct = [ctHash];

  const stHash = hashMetaState(state);
  if (stHash) userData.st = [stHash];

  const zpHash = hashMetaZip(zip);
  if (zpHash) userData.zp = [zpHash];

  const countryHash = hashMetaCountry(country || (stHash ? "us" : null));
  if (countryHash) userData.country = [countryHash];

  const dbHash = hashMetaDob(dob);
  if (dbHash) userData.db = [dbHash];

  const fbp = String(metaFbp || "").trim();
  if (fbp) userData.fbp = fbp.slice(0, 200);

  const fbc = capiFbcFromOrigin(metaFbc);
  if (fbc) userData.fbc = fbc;

  const ua = String(clientUserAgent || "").trim();
  if (ua) userData.client_user_agent = ua.slice(0, 1000);

  if (clientIp) userData.client_ip_address = clientIp;

  const extHash = hashMetaExternalId(externalId);
  if (extHash) userData.external_id = [extHash];

  return userData;
}

function buildCapiUserDataFromBody(req, body, originDetail) {
  const sessionId = String(
    (body && (body.sessionClientId || body.session_client_id)) || ""
  ).trim();

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
    dob: body && (body.dob || body.dateOfBirth),
    metaFbp: body && body.metaFbp,
    metaFbc: body && body.metaFbc,
    originDetail,
    clientUserAgent: capiClientUserAgent(req, body),
    clientIp: capiClientIp(req),
    externalId: sessionId || null,
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
    if (!name || !WEBSITE_EVENT_NAMES.has(name)) {
      return { skipped: true, reason: "missing or invalid event name" };
    }

    if (leadSource != null) {
      if (!shouldSendMetaCapiForLead(leadSource, originDetail)) {
        return { skipped: true, reason: "lead source not eligible" };
      }
    } else if (!isSpanishGastosFinalesLanding(originDetail, body)) {
      return { skipped: true, reason: "not spanish gastos-finales landing" };
    }

    const dedupeId = String(
      eventId || (body && (body.metaLeadEventId || body.eventId)) || ""
    )
      .trim()
      .slice(0, 128);

    if (!dedupeId) {
      return { skipped: true, reason: "missing event_id for deduplication" };
    }

    const userData = buildCapiUserDataFromBody(req, body, originDetail);

    const eventRow = {
      event_name: name,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      event_source_url: capiEventSourceUrl(originDetail),
      event_id: dedupeId,
      user_data: userData,
    };

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
  WEBSITE_EVENT_NAMES,
  capiSha256: capiSha256Hex,
  capiNormalizePhone: normalizePhoneDigits,
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
