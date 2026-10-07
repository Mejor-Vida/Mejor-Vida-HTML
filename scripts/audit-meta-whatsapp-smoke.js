#!/usr/bin/env node
/**
 * End-to-end audit + safe production smoke test for CTWA webhook.
 * Does not print secrets. Does not modify contacts or Meta subscriptions.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

function loadEnvFile(p) {
  if (!p || !fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (k && process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile(path.join(__dirname, "..", ".env.local"));

const PROD = "https://www.mejorvidainsurance.com/api/meta-whatsapp-webhook";
const GRAPH = "https://graph.facebook.com/v21.0";
const PHONE_ID = "995924690274318";
const WABA = "1643473203448152";
const APP_ID = String(process.env.FACEBOOK_APP_ID || "1319755636638842").trim();

const lines = [];

function row(section, status, detail = "") {
  lines.push({ section, status, detail });
  console.log(`${section}\t${status}\t${detail}`);
}

function hubSig(buf, secret) {
  return `sha256=${crypto.createHmac("sha256", secret).update(buf).digest("hex")}`;
}

function samplePayload(messageId, waFrom, sourceId, ctwaClid) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: WABA,
        changes: [
          {
            field: "messages",
            value: {
              metadata: { phone_number_id: PHONE_ID },
              contacts: [{ wa_id: waFrom }],
              messages: [
                {
                  from: waFrom,
                  id: messageId,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: "text",
                  text: { body: "MVI_CTWA_SMOKE_TEST" },
                  referral: {
                    source_type: "ad",
                    source_id: sourceId,
                    ctwa_clid: ctwaClid,
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

async function supabaseSelect(tablePath) {
  const base = process.env.SUPABASE_URL.replace(/\/$/, "") + "/rest/v1";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(`${base}${tablePath}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}`);
  return JSON.parse(text || "[]");
}

async function main() {
  const ts = Date.now();
  const messageId = `wamid.MVI_SMOKE_${ts}`;
  const waId = "15550001999";
  const testAdId = "120299988877766655";
  const testClid = `MVI_SMOKE_CLID_${ts}`;

  // 1 deploy
  const { execSync } = require("child_process");
  const local = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  const remote = execSync("git ls-remote origin main", { encoding: "utf8" }).trim().split(/\s+/)[0];
  row("1_deploy_git", local === remote ? "pass" : "warn", `origin_main_matches_local=${local === remote}`);

  const probe = await fetch(PROD, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hub-signature-256": "sha256=00" },
    body: "{}",
  });
  const probeText = await probe.text();
  row(
    "1_deploy_secret_marker",
    probeText.includes("META_WHATSAPP_APP_SECRET") || probe.status === 403 ? "pass" : "fail",
    `post_probe_http=${probe.status}`
  );

  // 2 env (local presence for smoke signing; Vercel checked separately)
  for (const k of [
    "META_WHATSAPP_APP_SECRET",
    "META_WHATSAPP_VERIFY_TOKEN",
    "META_WHATSAPP_PHONE_NUMBER_ID",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]) {
    row(`2_env_${k}`, process.env[k] ? "present" : "missing", process.env[k] ? "set" : "unset");
  }

  // 3 GET verify
  const verify = String(process.env.META_WHATSAPP_VERIFY_TOKEN || "").trim();
  const challenge = `SMOKE_CHALLENGE_${ts}`;
  const q = new URLSearchParams({
    "hub.mode": "subscribe",
    "hub.verify_token": verify,
    "hub.challenge": challenge,
  });
  const getR = await fetch(`${PROD}?${q}`);
  const getBody = await getR.text();
  row("3_get_verify", getR.status === 200 && getBody === challenge ? "pass" : "fail", `http=${getR.status}`);

  // 4 app subscriptions
  const appSecret = String(process.env.META_WHATSAPP_APP_SECRET || "").trim();
  const appToken = `${APP_ID}|${appSecret}`;
  const subR = await fetch(`${GRAPH}/${APP_ID}/subscriptions?access_token=${encodeURIComponent(appToken)}`);
  const subJ = await subR.json();
  const waSub = (subJ.data || []).find((s) => s.object === "whatsapp_business_account");
  if (!waSub) {
    row("4_whatsapp_subscription", "fail", "not_found");
  } else {
    row("4_whatsapp_subscription", waSub.active ? "pass" : "warn", `active=${waSub.active}`);
    row(
      "4_callback_url",
      waSub.callback_url === PROD ? "pass" : "fail",
      waSub.callback_url || "(none)"
    );
    row(
      "4_messages_field",
      (waSub.fields || []).includes("messages") ? "pass" : "fail",
      (waSub.fields || []).join(",") || "(none)"
    );
  }

  // 5 WABA apps
  const userToken = String(process.env.META_WHATSAPP_ACCESS_TOKEN || "").trim();
  if (!userToken) {
    row("5_waba_subscribed_apps", "skip", "META_WHATSAPP_ACCESS_TOKEN_not_in_local_env");
  } else {
    const wabaR = await fetch(`${GRAPH}/${WABA}/subscribed_apps?access_token=${encodeURIComponent(userToken)}`);
    const wabaJ = await wabaR.json();
    const ids = (wabaJ.data || [])
      .map((d) => d.whatsapp_business_api_data && d.whatsapp_business_api_data.id)
      .filter(Boolean)
      .map(String);
    row("5_manychat_532160876956612", ids.includes("532160876956612") ? "pass" : "fail", ids.includes("532160876956612") ? "connected" : "missing");
    row("5_mvi_1319755636638842", ids.includes("1319755636638842") ? "pass" : "fail", ids.includes("1319755636638842") ? "connected" : "missing");
  }

  // 6-8 production signed POST
  const payload = samplePayload(messageId, waId, testAdId, testClid);
  const raw = Buffer.from(JSON.stringify(payload), "utf8");
  const sig = hubSig(raw, appSecret);

  const post1 = await fetch(PROD, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hub-signature-256": sig },
    body: raw,
  });
  const post1J = await post1.json().catch(() => ({}));
  const r1 = (post1J.results || [])[0] || {};
  row(
    "6_signed_post_first",
    post1.ok && post1J.ok ? "pass" : "fail",
    `http=${post1.status} referrals=${post1J.referrals} duplicate=${!!r1.duplicate} pending=${!!r1.pending}`
  );

  const msgs1 = await supabaseSelect(
    `/whatsapp_webhook_messages?whatsapp_message_id=eq.${encodeURIComponent(messageId)}&select=whatsapp_message_id,outcome,meta_ad_id,meta_ctwa_clid,wa_id`
  );
  row("7_supabase_message_row", msgs1.length === 1 ? "pass" : "fail", `count=${msgs1.length} outcome=${msgs1[0]?.outcome || "n/a"}`);

  const post2 = await fetch(PROD, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-hub-signature-256": sig },
    body: raw,
  });
  const post2J = await post2.json().catch(() => ({}));
  const r2 = (post2J.results || [])[0] || {};
  row("8_duplicate_post", r2.duplicate === true ? "pass" : "fail", `duplicate=${!!r2.duplicate}`);

  const msgs2 = await supabaseSelect(
    `/whatsapp_webhook_messages?whatsapp_message_id=eq.${encodeURIComponent(messageId)}&select=whatsapp_message_id`
  );
  row("8_supabase_still_one_row", msgs2.length === 1 ? "pass" : "fail", `count=${msgs2.length}`);

  // 9 pending attribution (no contact for test wa)
  const pending = await supabaseSelect(
    `/whatsapp_ctwa_pending_attribution?wa_id=eq.${encodeURIComponent(waId)}&applied_at=is.null&select=wa_id,meta_ad_id,meta_ctwa_clid,source_message_id&order=received_at.desc&limit=1`
  );
  row(
    "9_pending_attribution",
    pending.length === 1 && pending[0].meta_ad_id === testAdId ? "pass" : "fail",
    `open_pending=${pending.length} source_msg=${pending[0]?.source_message_id === messageId}`
  );

  // 10 safe: no CRM contact created/updated for test wa
  const contacts = await supabaseSelect(
    `/contacts?or=(phone.eq.%2B${waId},phone_last_10.eq.5550001999)&select=id,meta_ad_id&limit=5`
  );
  row("10_no_test_contact_touched", contacts.length === 0 ? "pass" : "warn", `contacts_found=${contacts.length}`);

  const failed = lines.filter((l) => l.status === "fail").length;
  console.log(`\nSUMMARY\t${failed ? "FAIL" : "PASS"}\tfailed_checks=${failed}`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((e) => {
  console.error("AUDIT_FATAL", e.message || e);
  process.exit(1);
});
