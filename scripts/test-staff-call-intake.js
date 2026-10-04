#!/usr/bin/env node
"use strict";

const {
  phoneLast10,
  isBlank,
  fillBlankFields,
  normalizeSex,
  normalizeTobacco,
  normalizeLanguage,
  normalizeState,
  normalizeDob,
  sanitizeExtracted,
  parseModelJson,
  isStaffCallDropPhone,
  isAudioMedia,
  TOP_LEVEL_KEYS,
} = require("../lib/staff-call-intake");
const { parseTelnyxInbound } = require("../lib/sms-inbound-handler");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(phoneLast10("(402) 440-5438") === "4024405438", "last10 punct");
assert(phoneLast10("+14024405438") === "4024405438", "last10 e164");
assert(isBlank(null) && isBlank("") && isBlank("  "), "blank strings");
assert(!isBlank(false), "false is a value");
assert(!isBlank(0), "zero age is a value");

const filled = fillBlankFields(
  { first_name: "Ana", phone: "" },
  { first_name: "Maria", phone: "+14025550100", last_name: "Lopez" },
  TOP_LEVEL_KEYS
);
assert(filled.first_name == null, "do not overwrite first name");
assert(filled.phone === "+14025550100", "fill blank phone");
assert(filled.last_name === "Lopez", "fill missing last name");

assert(normalizeSex("mujer") === "female", "sex es");
assert(normalizeTobacco("fuma") === true, "tobacco es");
assert(normalizeTobacco("no") === false, "tobacco no");
assert(normalizeLanguage("español") === "Spanish", "lang es");
assert(normalizeState("Nebraska") === "NE", "state name");
assert(normalizeState("ne") === "NE", "state code");
assert(normalizeDob("4/15/1948") === "1948-04-15", "dob us");

const parsed = parseModelJson('```json\n{"first_name":"Rosa","tobacco":true}\n```');
assert(parsed.first_name === "Rosa", "json fence");
const clean = sanitizeExtracted({
  first_name: " Rosa ",
  phone: "402-555-0199",
  email: "not-an-email",
  sex: "Female",
  age: "72",
  state: "Kansas",
});
assert(clean.phone === "+14025550199", "phone e164");
assert(clean.email == null, "bad email dropped");
assert(clean.sex === "female", "sex norm");
assert(clean.age === 72, "age num");
assert(clean.state === "KS", "ks");

process.env.CALL_INTAKE_STAFF_PHONES = "+14024405438, 555-111-2222";
assert(isStaffCallDropPhone("402-440-5438") === true, "staff phone match");
assert(isStaffCallDropPhone("4025550100") === false, "non-staff");
delete process.env.CALL_INTAKE_STAFF_PHONES;
assert(isStaffCallDropPhone("402-440-5438") === false, "staff phones unset");
assert(isStaffCallDropPhone("402-440-5438", ["+14024405438"]) === true, "extra phones");

assert(
  isAudioMedia({ url: "https://example.com/a.m4a", contentType: "application/octet-stream" }),
  "m4a by ext"
);
assert(isAudioMedia({ url: "https://example.com/x", contentType: "audio/mp4" }), "audio mime");
assert(!isAudioMedia({ url: "https://example.com/pic.jpg", contentType: "image/jpeg" }), "not image");

const inbound = parseTelnyxInbound({
  data: {
    event_type: "message.received",
    payload: {
      id: "msg-1",
      from: { phone_number: "+14025550100" },
      to: [{ phone_number: "+14028441199" }],
      text: "",
      media: [{ url: "https://example.com/call.m4a", content_type: "audio/mp4" }],
    },
  },
});
assert(inbound && inbound.mediaUrls.length === 1, "telnyx media");
assert(inbound.mediaUrls[0].url.indexOf("call.m4a") >= 0, "telnyx media url");

console.log("staff-call-intake tests ok");
