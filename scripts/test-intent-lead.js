#!/usr/bin/env node
/**
 * Unit checks for Intent Lead processing (mocked Supabase + CAPI).
 */
const { intentLeadEventId, processIntentLead } = require("../lib/intent-lead");

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else console.log("ok:", msg);
}

const store = {
  contacts: new Map(),
  lead_state: new Map(),
  events: [],
  manychat: new Map(),
};

let capiCalls = 0;

global.fetch = async (url, opts = {}) => {
  const u = String(url);
  const method = (opts.method || "GET").toUpperCase();
  const base = "https://example.supabase.co/rest/v1";

  if (u.includes("graph.facebook.com") && method === "POST") {
    capiCalls += 1;
    return { ok: true, status: 200, text: async () => '{"events_received":1}' };
  }

  if (u.startsWith(base + "/contacts") && method === "GET") {
    if (u.includes("phone=eq.")) {
      const m = u.match(/phone=eq\.([^&]+)/);
      const phone = decodeURIComponent(m[1]);
      let row = store.contacts.get(phone);
      if (!row) {
        row = [...store.contacts.values()].find((c) => c.phone === phone);
      }
      return { ok: true, status: 200, text: async () => JSON.stringify(row ? [row] : []) };
    }
    if (u.includes("phone_last_10=eq.")) {
      return { ok: true, status: 200, text: async () => "[]" };
    }
    if (u.includes("id=eq.")) {
      const m = u.match(/id=eq\.([^&]+)/);
      const id = decodeURIComponent(m[1]);
      const row = [...store.contacts.values()].find((c) => c.id === id);
      return { ok: true, status: 200, text: async () => JSON.stringify(row ? [row] : []) };
    }
  }

  if (u.startsWith(base + "/contacts") && method === "POST") {
    const row = JSON.parse(opts.body || "{}");
    row.id = row.id || `c-${store.contacts.size + 1}`;
    store.contacts.set(row.phone, row);
    return { ok: true, status: 201, text: async () => JSON.stringify([row]) };
  }

  if (u.startsWith(base + "/contacts") && method === "PATCH") {
    const m = u.match(/id=eq\.([^&]+)/);
    const id = decodeURIComponent(m[1]);
    const patch = JSON.parse(opts.body || "{}");
    const row = [...store.contacts.values()].find((c) => c.id === id);
    if (row) Object.assign(row, patch);
    return { ok: true, status: 204, text: async () => "" };
  }

  if (u.includes("/lead_state") && method === "GET") {
    const m = u.match(/contact_id=eq\.([^&]+)/);
    const id = decodeURIComponent(m[1]);
    const row = store.lead_state.get(id);
    return { ok: true, status: 200, text: async () => JSON.stringify(row ? [row] : []) };
  }

  if (u.includes("/lead_state") && method === "POST") {
    const body = JSON.parse(opts.body || "{}");
    const cid = body.contact_id;
    const row = { id: `ls-${store.lead_state.size + 1}`, contact_id: cid, ...body };
    if (cid) store.lead_state.set(cid, row);
    const prefer = String((opts.headers && opts.headers.Prefer) || "");
    if (prefer.includes("representation")) {
      return { ok: true, status: 201, text: async () => JSON.stringify([row]) };
    }
    return { ok: true, status: 201, text: async () => "" };
  }

  if (u.includes("/lead_state") && method === "PATCH") {
    const body = JSON.parse(opts.body || "{}");
    const m = u.match(/contact_id=eq\.([^&]+)/);
    const cid = m ? decodeURIComponent(m[1]) : null;
    if (cid) {
      const prev = store.lead_state.get(cid) || { contact_id: cid, id: `ls-${cid}` };
      store.lead_state.set(cid, { ...prev, ...body });
    }
    return { ok: true, status: 204, text: async () => "" };
  }

  if (u.includes("/events") && method === "POST") {
    store.events.push(JSON.parse(opts.body || "{}"));
    return { ok: true, status: 201, text: async () => "" };
  }

  if (u.includes("/whatsapp_")) {
    return { ok: true, status: 200, text: async () => "[]" };
  }

  if (u.includes("/manychat_leads")) {
    return { ok: true, status: 200, text: async () => "[]" };
  }

  return { ok: false, status: 404, text: async () => "unmocked" };
};

process.env.META_CAPI_ACCESS_TOKEN = "test-token";
process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID = "1643473203448152";

const cfg = { supabaseUrl: "https://example.supabase.co", serviceKey: "test-key" };

(async () => {
  assert(intentLeadEventId("abc") === "intent_lead_abc", "event id stable");

  const r1 = await processIntentLead(cfg, {
    phone: "+15550008888",
    estado: "Topeka KS",
    meta_ad_id: "120299988877766655",
  });
  assert(r1.ok && !r1.intent_lead_duplicate, "first intent lead");
  assert(capiCalls === 1, "capi sent once");
  const c1 = store.contacts.get("+15550008888");
  assert(c1.estado_response === "Topeka KS", "raw estado preserved");
  assert(c1.meta_ad_id === "120299988877766655", "meta ad id set");

  const r2 = await processIntentLead(cfg, {
    phone: "+15550008888",
    estado: "Nebraska",
    meta_ad_id: "120211111111111111",
  });
  assert(r2.intent_lead_duplicate, "second call duplicate intent");
  assert(capiCalls === 1, "capi not sent again");
  assert(store.contacts.get("+15550008888").meta_ad_id === "120299988877766655", "meta ad not overwritten");

  if (process.exitCode) {
    console.error("\nIntent lead tests failed.");
    process.exit(1);
  }
  console.log("\nAll intent-lead checks passed.");
})();
