const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect, restInsert } = require("./_inbox-lib");

function splitDisplayName(name) {
  const t = String(name || "").trim();
  if (!t) return { first_name: "", last_name: null };
  const sp = t.indexOf(" ");
  if (sp === -1) return { first_name: t.slice(0, 200), last_name: null };
  return {
    first_name: t.slice(0, sp).trim().slice(0, 200) || t.slice(0, 200),
    last_name: t.slice(sp + 1).trim().slice(0, 200) || null,
  };
}

function displayName(row) {
  const a = String((row && row.first_name) || "").trim();
  const b = String((row && row.last_name) || "").trim();
  const full = [a, b].filter(Boolean).join(" ").trim();
  return full || a || b || "Unknown";
}

function sortKey(row) {
  return displayName(row).toLowerCase();
}

const UNRESOLVED_TEMPLATE = /^\{\{[\s\S]*\}\}$/;

function cleanText(v) {
  const s = String(v || "").trim();
  if (!s || UNRESOLVED_TEMPLATE.test(s)) return "";
  return s;
}

function digitsOnly(v) {
  return String(v || "").replace(/\D+/g, "");
}

/** Same scoring idea as staff/questions — match lead phone to contacts.whatsapp_id / phone / subscriber. */
function bestContactEmailForPhone(phoneField, contacts) {
  const qPhoneText = cleanText(phoneField);
  const qPhoneDigits = digitsOnly(qPhoneText);
  if (!contacts || !contacts.length || !qPhoneText) return "";

  const scored = contacts
    .map((c) => {
      const cPhone = cleanText(c.phone);
      const cWhatsAppId = cleanText(c.whatsapp_id);
      const cSubscriberId = cleanText(c.manychat_subscriber_id);
      const cPhoneDigits = digitsOnly(cPhone);
      const cEmail = cleanText(c.email);
      let score = 0;
      if (qPhoneDigits && cPhoneDigits && qPhoneDigits === cPhoneDigits) score += 100;
      if (qPhoneText && qPhoneText === cWhatsAppId) score += 40;
      if (qPhoneText && qPhoneText === cSubscriberId) score += 35;
      if (cEmail) score += 12;
      if (cSubscriberId) score += 8;
      if (cWhatsAppId) score += 5;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const top = scored.length ? scored[0].c : null;
  return top ? cleanText(top.email) : "";
}

async function enrichLeadEmailsFromContacts(cfg, items) {
  const phonesNeedingEmail = Array.from(
    new Set(
      items
        .filter((i) => !cleanText(i.email) && cleanText(i.phone))
        .map((i) => cleanText(i.phone))
    )
  );
  if (!phonesNeedingEmail.length) return;

  const allContacts = [];
  const chunkSize = 80;
  for (let i = 0; i < phonesNeedingEmail.length; i += chunkSize) {
    const chunk = phonesNeedingEmail.slice(i, i + chunkSize);
    const values = chunk.map((p) => `"${String(p).replace(/"/g, "")}"`).join(",");
    if (!values) continue;
    const contacts = await restSelect(
      cfg,
      "contacts",
      `select=id,email,phone,whatsapp_id,manychat_subscriber_id,created_at&or=(phone.in.(${values}),whatsapp_id.in.(${values}),manychat_subscriber_id.in.(${values}))&order=created_at.desc&limit=400`
    );
    (contacts || []).forEach((c) => allContacts.push(c));
  }

  const seen = new Set();
  const uniq = [];
  allContacts.forEach((c) => {
    const id = c && c.id;
    if (!id || seen.has(id)) return;
    seen.add(id);
    uniq.push(c);
  });

  items.forEach((row) => {
    if (cleanText(row.email) || !cleanText(row.phone)) return;
    const em = bestContactEmailForPhone(row.phone, uniq);
    if (em) row.email = em;
  });
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (req.method === "GET") {
    try {
      const rows = await restSelect(
        cfg,
        "manychat_leads",
        "select=id,first_name,last_name,phone,email,language&limit=5000"
      );
      const items = (rows || []).map((r) => ({
        id: r.id,
        first_name: r.first_name || "",
        last_name: r.last_name || "",
        display_name: displayName(r),
        phone: r.phone || "",
        email: String(r.email || "").trim(),
        language: r.language || "English",
      }));
      await enrichLeadEmailsFromContacts(cfg, items);
      items.sort((x, y) => sortKey(x).localeCompare(sortKey(y)));
      return json(res, 200, { items });
    } catch (e) {
      console.error("staff/leads GET", e);
      return json(res, 500, { error: "Failed to load leads" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json(res, 400, { error: "name and valid email required" });
    }
    const phone = String(body.phone || "").trim().slice(0, 40) || null;
    const language = String(body.language || "English").trim().slice(0, 50) || "English";
    const { first_name, last_name } = splitDisplayName(name);
    if (!first_name) return json(res, 400, { error: "name required" });

    try {
      const inserted = await restInsert(cfg, "manychat_leads", [
        {
          first_name,
          last_name,
          email,
          phone,
          language,
          source: "staff_compose",
          tag: "Lead_NE",
          pipeline_stage: "new",
          drop_off: false,
        },
      ]);
      const row = inserted && inserted[0];
      if (!row || !row.id) return json(res, 500, { error: "Failed to create lead" });
      const item = {
        id: row.id,
        first_name: row.first_name || "",
        last_name: row.last_name || "",
        display_name: displayName(row),
        phone: row.phone || "",
        email: row.email || "",
        language: row.language || "English",
      };
      return json(res, 200, { item });
    } catch (e) {
      console.error("staff/leads POST", e);
      return json(res, 500, { error: "Failed to create lead" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return json(res, 405, { error: "Method Not Allowed" });
};
