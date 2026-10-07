/**
 * Parse Meta WhatsApp Business Account webhook payloads (messages field).
 */

const {
  normalizeMetaAdId,
  normalizeCtwaClid,
  normalizeWaId,
} = require("./meta-whatsapp-attribution");

function extractReferralEvents(body, expectedPhoneNumberId) {
  const wantPhone = String(expectedPhoneNumberId || "").trim();
  const out = [];
  const entries = Array.isArray(body && body.entry) ? body.entry : [];
  for (const entry of entries) {
    const changes = Array.isArray(entry.changes) ? entry.changes : [];
    for (const change of changes) {
      if (String(change.field || "") !== "messages") continue;
      const value = change.value || {};
      const meta = value.metadata || {};
      const phoneNumberId = String(meta.phone_number_id || "").trim();
      if (wantPhone && phoneNumberId && phoneNumberId !== wantPhone) continue;

      const contacts = Array.isArray(value.contacts) ? value.contacts : [];
      const contactWa = contacts[0] && contacts[0].wa_id ? normalizeWaId(contacts[0].wa_id) : "";

      const messages = Array.isArray(value.messages) ? value.messages : [];
      for (const msg of messages) {
        const messageId = String(msg.id || "").trim();
        if (!messageId) continue;
        const from = normalizeWaId(msg.from) || contactWa;
        const referral = msg.referral && typeof msg.referral === "object" ? msg.referral : null;
        if (!referral) continue;

        const sourceType = String(referral.source_type || "").toLowerCase();
        const metaAdId = normalizeMetaAdId(referral.source_id);
        if (!metaAdId) continue;
        if (sourceType && sourceType !== "ad") continue;

        const ctwaClid = normalizeCtwaClid(referral.ctwa_clid);
        out.push({
          messageId,
          waId: from,
          metaAdId,
          metaCtwaClid: ctwaClid || null,
          phoneNumberId,
        });
      }
    }
  }
  return out;
}

module.exports = { extractReferralEvents };
