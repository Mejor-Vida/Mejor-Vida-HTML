#!/usr/bin/env node
/**
 * Offline checks for Meta WhatsApp CTWA attribution webhook.
 * Usage: node scripts/test-meta-whatsapp-webhook.js
 * No Supabase migration, deploy, or live Meta calls.
 */

const crypto = require("crypto");

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

const PHONE_ID = "995924690274318";
const APP_SECRET = "test-app-secret-for-hmac-only";
const VERIFY_TOKEN = "test-verify-token-xyz";
const SUPABASE_URL = "https://example.supabase.co";
const SERVICE_KEY = "test-service-role-key";

function hubSig(bodyBuf, secret) {
  const hex = crypto.createHmac("sha256", secret).update(bodyBuf).digest("hex");
  return `sha256=${hex}`;
}

function samplePayload(phoneNumberId, messageId, sourceId, waFrom = "14025559876") {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "1643473203448152",
        changes: [
          {
            field: "messages",
            value: {
              metadata: { phone_number_id: phoneNumberId },
              contacts: [{ wa_id: waFrom }],
              messages: [
                {
                  from: waFrom,
                  id: messageId,
                  timestamp: "1700000000",
                  type: "text",
                  text: { body: "Hi" },
                  referral: {
                    source_type: "ad",
                    source_id: sourceId,
                    ctwa_clid: "ClidTest_abc123XYZ",
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

/** In-memory Supabase REST mock */
function createStore() {
  return {
    whatsapp_webhook_messages: new Map(),
    whatsapp_ctwa_pending_attribution: [],
    contacts: [],
    webhook_logs: [],
  };
}

function installFetchMock(store) {
  const original = global.fetch;
  global.fetch = async (url, opts = {}) => {
    const u = String(url);
    const method = (opts.method || "GET").toUpperCase();
    const path = u.replace(`${SUPABASE_URL}/rest/v1`, "");

    if (path.startsWith("/webhook_logs") && method === "POST") {
      store.webhook_logs.push(JSON.parse(opts.body || "{}"));
      return { ok: true, status: 201, text: async () => "" };
    }

    if (path.startsWith("/whatsapp_webhook_messages") && method === "POST") {
      const row = JSON.parse(opts.body || "{}");
      const id = row.whatsapp_message_id;
      if (store.whatsapp_webhook_messages.has(id)) {
        return { ok: false, status: 409, text: async () => "duplicate" };
      }
      store.whatsapp_webhook_messages.set(id, { ...row });
      return { ok: true, status: 201, text: async () => "" };
    }

    if (path.startsWith("/whatsapp_webhook_messages") && method === "PATCH") {
      const m = path.match(/whatsapp_message_id=eq\.([^&]+)/);
      const id = m ? decodeURIComponent(m[1]) : "";
      const patch = JSON.parse(opts.body || "{}");
      const row = store.whatsapp_webhook_messages.get(id);
      if (row) Object.assign(row, patch);
      return { ok: true, status: 204, text: async () => "" };
    }

    if (path.startsWith("/whatsapp_ctwa_pending_attribution") && method === "POST") {
      const row = JSON.parse(opts.body || "{}");
      const open = store.whatsapp_ctwa_pending_attribution.filter((p) => !p.applied_at && p.wa_id === row.wa_id);
      if (open.length) {
        return { ok: false, status: 409, text: async () => "unique violation" };
      }
      row.id = `pending-${store.whatsapp_ctwa_pending_attribution.length + 1}`;
      store.whatsapp_ctwa_pending_attribution.push(row);
      return { ok: true, status: 201, text: async () => "" };
    }

    if (path.startsWith("/whatsapp_ctwa_pending_attribution") && method === "GET") {
      const waMatch = path.match(/wa_id=eq\.([^&]+)/);
      const last10Match = path.match(/phone_last_10=eq\.([^&]+)/);
      let rows = store.whatsapp_ctwa_pending_attribution.filter((p) => !p.applied_at);
      if (waMatch) {
        const wa = decodeURIComponent(waMatch[1]);
        rows = rows.filter((p) => p.wa_id === wa);
      }
      if (last10Match) {
        const t = decodeURIComponent(last10Match[1]);
        rows = rows.filter((p) => p.phone_last_10 === t);
      }
      rows.sort((a, b) => (b.received_at || "").localeCompare(a.received_at || ""));
      return { ok: true, status: 200, text: async () => JSON.stringify(rows.slice(0, 1)) };
    }

    if (path.startsWith("/whatsapp_ctwa_pending_attribution") && method === "PATCH") {
      const m = path.match(/id=eq\.([^&]+)/);
      const id = m ? decodeURIComponent(m[1]) : "";
      const patch = JSON.parse(opts.body || "{}");
      const row = store.whatsapp_ctwa_pending_attribution.find((p) => p.id === id);
      if (row) Object.assign(row, patch);
      return { ok: true, status: 204, text: async () => "" };
    }

    if (path.startsWith("/contacts") && method === "GET") {
      if (path.includes("phone=eq.")) {
        const m = path.match(/phone=eq\.([^&]+)/);
        const phone = m ? decodeURIComponent(m[1]) : "";
        const hit = store.contacts.find((c) => c.phone === phone);
        return { ok: true, status: 200, text: async () => JSON.stringify(hit ? [hit] : []) };
      }
      if (path.includes("id=eq.")) {
        const m = path.match(/id=eq\.([^&]+)/);
        const id = m ? decodeURIComponent(m[1]) : "";
        const hit = store.contacts.find((c) => c.id === id);
        return { ok: true, status: 200, text: async () => JSON.stringify(hit ? [hit] : []) };
      }
      return { ok: true, status: 200, text: async () => JSON.stringify([]) };
    }

    if (path.startsWith("/contacts") && method === "PATCH") {
      const m = path.match(/id=eq\.([^&]+)/);
      const id = m ? decodeURIComponent(m[1]) : "";
      const patch = JSON.parse(opts.body || "{}");
      const row = store.contacts.find((c) => c.id === id);
      if (row) {
        row._patches = row._patches || [];
        row._patches.push(patch);
        Object.assign(row, patch);
      }
      return { ok: true, status: 204, text: async () => "" };
    }

    return original
      ? original(url, opts)
      : { ok: false, status: 404, text: async () => `unmocked ${method} ${path}` };
  };
  return () => {
    global.fetch = original;
  };
}

function loadWebhookModule() {
  const p = require.resolve("../api/meta-whatsapp-webhook");
  delete require.cache[p];
  delete require.cache[require.resolve("../lib/meta-whatsapp-attribution")];
  delete require.cache[require.resolve("../lib/meta-whatsapp-webhook")];
  delete require.cache[require.resolve("../lib/contacts-db")];
  return require("../api/meta-whatsapp-webhook");
}

function mockRes() {
  const out = { statusCode: 200, headers: {}, body: "" };
  const res = {
    statusCode: 200,
    status(code) {
      out.statusCode = Number(code) || 200;
      this.statusCode = out.statusCode;
      return this;
    },
    setHeader(k, v) {
      out.headers[String(k).toLowerCase()] = v;
    },
    getHeader(k) {
      return out.headers[String(k).toLowerCase()];
    },
    send(payload) {
      if (Buffer.isBuffer(payload)) out.body = payload.toString("utf8");
      else if (typeof payload === "object") out.body = JSON.stringify(payload);
      else out.body = payload == null ? "" : String(payload);
      return out;
    },
  };
  return { res, out };
}

async function invokeGet(handler, query) {
  const { res, out } = mockRes();
  await handler({ method: "GET", query, headers: {} }, res);
  return out;
}

async function invokePost(handler, rawBuf, signatureHeader) {
  const { res, out } = mockRes();
  await handler(
    {
      method: "POST",
      headers: { "x-hub-signature-256": signatureHeader, "content-type": "application/json" },
      rawBody: rawBuf,
    },
    res
  );
  let json = null;
  try {
    json = JSON.parse(out.body);
  } catch {
    /* plain */
  }
  return { ...out, json };
}

async function run() {
  process.env.META_WHATSAPP_VERIFY_TOKEN = VERIFY_TOKEN;
  process.env.META_WHATSAPP_APP_SECRET = APP_SECRET;
  process.env.META_WHATSAPP_PHONE_NUMBER_ID = PHONE_ID;
  process.env.SUPABASE_URL = SUPABASE_URL;
  process.env.SUPABASE_SERVICE_ROLE_KEY = SERVICE_KEY;
  delete process.env.META_WHATSAPP_SKIP_SIGNATURE;

  const { extractReferralEvents } = require("../lib/meta-whatsapp-webhook");
  const { mergePendingAttributionForContact } = require("../lib/meta-whatsapp-attribution");

  // --- extractReferralEvents ---
  const adId = "120212345678901234";
  const body = samplePayload(PHONE_ID, "wamid.TEST001", adId);
  const refs = extractReferralEvents(body, PHONE_ID);
  assert(refs.length === 1, "correct phone_number_id yields one referral event");
  assert(refs[0].metaAdId === adId, "referral.source_id becomes meta_ad_id");
  assert(refs[0].metaCtwaClid === "ClidTest_abc123XYZ", "ctwa_clid extracted");
  assert(refs[0].waId === "14025559876", "wa_id from message.from");

  const wrongPhone = extractReferralEvents(body, "000000000000000");
  assert(wrongPhone.length === 0, "wrong phone_number_id filters out events");

  // --- GET verify ---
  const handler = loadWebhookModule();
  const badGet = await invokeGet(handler, {
    "hub.mode": "subscribe",
    "hub.verify_token": "wrong",
    "hub.challenge": "42",
  });
  assert(badGet.statusCode === 403, "GET verify rejects wrong token");

  const goodGet = await invokeGet(handler, {
    "hub.mode": "subscribe",
    "hub.verify_token": VERIFY_TOKEN,
    "hub.challenge": "CHALLENGE_99",
  });
  assert(goodGet.statusCode === 200, "GET verify accepts correct token");
  assert(goodGet.body === "CHALLENGE_99", "GET verify returns hub.challenge plain text");

  // --- POST signature ---
  const store = createStore();
  const restoreFetch = installFetchMock(store);
  const handler2 = loadWebhookModule();
  const payloadJson = JSON.stringify(samplePayload(PHONE_ID, "wamid.SIG001", adId));
  const badPost = await invokePost(handler2, Buffer.from(payloadJson, "utf8"), "sha256=deadbeef");
  assert(badPost.statusCode === 403, "invalid webhook signature rejected");

  const goodBuf = Buffer.from(payloadJson, "utf8");
  const goodPost = await invokePost(handler2, goodBuf, hubSig(goodBuf, APP_SECRET));
  assert(goodPost.statusCode === 200, "valid signature accepted");
  assert(goodPost.json.referrals === 1, "POST processes one referral after signature ok");

  // --- duplicate message id ---
  const dupPost = await invokePost(handler2, goodBuf, hubSig(goodBuf, APP_SECRET));
  assert(dupPost.json.results[0].duplicate === true, "duplicate WhatsApp message ID ignored");

  // --- pending then lead-intake merge ---
  const pendingId = "wamid.PENDING01";
  const wa = "14025551111";
  const pendingAd = "120299988877766655";
  const pendingJson = JSON.stringify(samplePayload(PHONE_ID, pendingId, pendingAd, wa));
  const pendingBuf = Buffer.from(pendingJson, "utf8");
  await invokePost(handler2, pendingBuf, hubSig(pendingBuf, APP_SECRET));
  assert(
    store.whatsapp_ctwa_pending_attribution.some((p) => p.wa_id === wa && p.meta_ad_id === pendingAd),
    "pending attribution stored when contact missing"
  );

  const contactId = "contact-uuid-1";
  store.contacts.push({
    id: contactId,
    phone: "+14025551111",
    meta_ad_id: "",
    meta_ctwa_clid: "",
  });
  const cfg = { supabaseUrl: SUPABASE_URL, serviceKey: SERVICE_KEY };
  const merged = await mergePendingAttributionForContact(cfg, contactId, {
    phone: "+14025551111",
    whatsappId: wa,
  });
  assert(merged.merged === true, "mergePendingAttributionForContact applies pending row");
  const contactAfter = store.contacts.find((c) => c.id === contactId);
  assert(contactAfter.meta_ad_id === pendingAd, "lead-intake merge sets meta_ad_id from pending");

  // --- never overwrite existing meta_ad_id ---
  const existingAd = "120211111111111111";
  const newAd = "120222222222222222";
  store.contacts.push({
    id: "contact-uuid-2",
    phone: "+14025552222",
    meta_ad_id: existingAd,
    meta_ctwa_clid: "existing_clid",
  });
  const overwriteJson = JSON.stringify(samplePayload(PHONE_ID, "wamid.NOWRITE01", newAd, "14025552222"));
  const overwriteBuf = Buffer.from(overwriteJson, "utf8");
  await invokePost(handler2, overwriteBuf, hubSig(overwriteBuf, APP_SECRET));
  const kept = store.contacts.find((c) => c.id === "contact-uuid-2");
  assert(kept.meta_ad_id === existingAd, "existing contacts.meta_ad_id is never overwritten");

  restoreFetch();

  // --- migration 107 static review ---
  const fs = require("fs");
  const path = require("path");
  const sql = fs.readFileSync(
    path.join(__dirname, "../integrations/supabase/migrations/107_whatsapp_ctwa_attribution.sql"),
    "utf8"
  );
  const destructive =
    /\bDROP\s+(TABLE|INDEX|COLUMN|SCHEMA)\b/i.test(sql) ||
    /\bTRUNCATE\b/i.test(sql) ||
    /\bDELETE\s+FROM\b/i.test(sql) ||
    /\bALTER\s+TABLE\s+public\.contacts\b/i.test(sql);
  assert(!destructive, "migration 107 has no DROP/TRUNCATE/DELETE FROM/ALTER contacts");
  assert(/CREATE TABLE IF NOT EXISTS public\.whatsapp_webhook_messages/i.test(sql), "migration creates webhook messages table");
  assert(
    /CREATE TABLE IF NOT EXISTS public\.whatsapp_ctwa_pending_attribution/i.test(sql),
    "migration creates pending attribution table"
  );
  assert(/ENABLE ROW LEVEL SECURITY/i.test(sql), "migration enables RLS");
  assert(!/CREATE POLICY/i.test(sql), "migration adds no public RLS policies (service role only)");

  if (process.exitCode) {
    console.error("\nSome checks failed.");
    process.exit(process.exitCode);
  }
  console.log("\nAll meta-whatsapp webhook checks passed.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
