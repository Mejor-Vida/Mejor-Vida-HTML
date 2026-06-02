/**
 * Resolve a `contacts` row for staff pipeline / nurture (phone, email, ManyChat id).
 */
const { restSelect } = require("./_inbox-lib");

const CONTACT_SELECT =
  "id,first_name,last_name,full_name,phone,email,language,idioma,whatsapp_id,manychat_subscriber_id,vcf_sent_at,created_at";

function cleanText(v) {
  return String(v == null ? "" : v).trim();
}

function normalizeEmail(v) {
  const s = cleanText(v).toLowerCase();
  return s && s.includes("@") ? s : "";
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

function phoneLast10Digits(v) {
  const d = digitsOnly(v);
  return d.length >= 10 ? d.slice(-10) : d.length ? d : "";
}

function hubspotPhoneSearchVariants(phoneRaw) {
  const d = digitsOnly(phoneRaw);
  if (!d) return [];
  const out = new Set([d]);
  if (d.length === 10) out.add("1" + d);
  if (d.length === 11 && d.startsWith("1")) out.add(d.slice(1));
  return Array.from(out);
}

function pgInListQuoted(values) {
  return values.map((v) => encodeURIComponent(String(v))).join(",");
}

function dedupeContactsById(rows) {
  const map = new Map();
  (rows || []).forEach((c) => {
    if (c && c.id && !map.has(String(c.id))) map.set(String(c.id), c);
  });
  return Array.from(map.values());
}

function scoreContactMatch(hints, c) {
  if (!c) return 0;
  let s = 0;
  const sub = cleanText(hints.manychatSubscriberId);
  const ws = cleanText(c.whatsapp_id);
  const ms = cleanText(c.manychat_subscriber_id);
  if (sub && (sub === ws || sub === ms)) s += 1000;
  const p10 = phoneLast10Digits(hints.phone);
  const c10 = phoneLast10Digits(c.phone);
  if (p10 && c10 && p10 === c10) s += 100;
  else {
    const pDigits = digitsOnly(hints.phone);
    const cDigits = digitsOnly(c.phone);
    if (pDigits && cDigits && pDigits === cDigits) s += 100;
  }
  const em = normalizeEmail(hints.email);
  const ce = normalizeEmail(c.email);
  if (em && ce && em === ce) s += 80;
  return s;
}

function pickBestContact(hints, candidates) {
  const uniq = dedupeContactsById(candidates);
  let best = null;
  let bestScore = -1;
  for (const c of uniq) {
    const sc = scoreContactMatch(hints, c);
    if (sc > bestScore) {
      bestScore = sc;
      best = c;
    }
  }
  return bestScore > 0 ? best : null;
}

async function selectContactById(cfg, contactId) {
  const id = cleanText(contactId);
  if (!id) return null;
  const rows = await restSelect(
    cfg,
    "contacts",
    `select=${CONTACT_SELECT}&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function selectContactsByPhone(cfg, phoneRaw) {
  const last10 = phoneLast10Digits(phoneRaw);
  const variants = hubspotPhoneSearchVariants(phoneRaw);
  const idValues = variants.length ? pgInListQuoted(variants) : "";
  const orParts = [];
  if (last10) orParts.push(`phone_last_10.eq.${encodeURIComponent(last10)}`);
  if (idValues) {
    orParts.push(`whatsapp_id.in.(${idValues})`);
    orParts.push(`manychat_subscriber_id.in.(${idValues})`);
  }
  if (!orParts.length) return [];
  const q = `select=${CONTACT_SELECT}&or=(${orParts.join(
    ","
  )})&order=created_at.desc&limit=80`;
  return await restSelect(cfg, "contacts", q);
}

async function selectContactsBySubscriberId(cfg, subscriberIdRaw) {
  const sid = cleanText(subscriberIdRaw);
  if (!sid) return [];
  const enc = encodeURIComponent(sid);
  const q = `select=${CONTACT_SELECT}&or=(whatsapp_id.eq.${enc},manychat_subscriber_id.eq.${enc})&order=created_at.desc&limit=20`;
  return await restSelect(cfg, "contacts", q);
}

async function selectContactByEmail(cfg, emailRaw) {
  const em = normalizeEmail(emailRaw);
  if (!em) return null;
  const rows = await restSelect(
    cfg,
    "contacts",
    `select=${CONTACT_SELECT}&email=eq.${encodeURIComponent(em)}&limit=5`
  );
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

/**
 * @param {object} cfg — serviceConfig()
 * @param {{ contactId?: string, phone?: string, email?: string, manychatSubscriberId?: string }} hints
 */
async function resolveContactForPipeline(cfg, hints) {
  hints = hints || {};
  const directId = cleanText(hints.contactId);
  if (directId) {
    const row = await selectContactById(cfg, directId);
    if (row) return row;
  }

  const candidates = [];
  const sub = cleanText(hints.manychatSubscriberId);
  if (sub) {
    const bySub = await selectContactsBySubscriberId(cfg, sub);
    (bySub || []).forEach((c) => candidates.push(c));
  }
  const phone = cleanText(hints.phone);
  if (phone) {
    const byPhone = await selectContactsByPhone(cfg, phone);
    (byPhone || []).forEach((c) => candidates.push(c));
  }
  const byEmail = await selectContactByEmail(cfg, hints.email);
  if (byEmail) candidates.push(byEmail);

  return pickBestContact(
    {
      phone: hints.phone,
      email: hints.email,
      manychatSubscriberId: hints.manychatSubscriberId,
    },
    candidates
  );
}

module.exports = {
  resolveContactForPipeline,
  CONTACT_SELECT,
};
