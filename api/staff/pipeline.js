const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { getSmsMessage, getEmailContent } = require("../../lib/nurture-templates");
const { buildPipelineSteps } = require("./_nurture-lib");

function displayName(contact) {
  const a = String((contact && contact.first_name) || "").trim();
  const b = String((contact && contact.last_name) || "").trim();
  const full = [a, b].filter(Boolean).join(" ").trim();
  if (full) return full;
  const fn = String((contact && contact.full_name) || "").trim();
  return fn || "Unknown";
}

function stepPreview(contact, phase, step, overrideByStep) {
  if (phase === 0) {
    return {
      kind: "email",
      editable: false,
      note:
        "WA-Quote email: immediate post-quote email after quote completes (lib/post-quote-email-html.js). Recipient is always contacts.email.",
      subject: "",
      body: "",
    };
  }
  if (phase === 1) {
    return {
      kind: "whatsapp",
      editable: false,
      note:
        "WhatsApp sends use ManyChat flows (referenced by server environment variables). Copy is not edited here.",
      subscriber_ready: !!(contact && contact.manychat_subscriber_id),
    };
  }
  if (phase === 2) {
    return {
      kind: "sms",
      editable: false,
      text: getSmsMessage(step, contact) || "",
    };
  }
  const ov = overrideByStep && overrideByStep[step];
  if (ov && ov.subject && ov.body) {
    return {
      kind: "email",
      editable: true,
      subject: ov.subject,
      body: ov.body,
      is_override: true,
    };
  }
  const c = getEmailContent(step, contact);
  return {
    kind: "email",
    editable: true,
    subject: c.subject,
    body: c.html,
    is_override: false,
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server misconfigured" });

  try {
    let nsRows = await restSelect(
      cfg,
      "nurture_sequence",
      "select=*,contacts(id,first_name,last_name,full_name,phone,email,language,idioma,manychat_subscriber_id,vcf_sent_at)" +
        "&order=enrolled_at.asc.nullslast&limit=500"
    );

    const includeStopped = ["1", "true", "yes", "on"].includes(
      String((req.query && req.query.includeStopped) || "").toLowerCase()
    );
    if (!includeStopped) {
      const terminal = new Set(["converted", "opted_out", "completed"]);
      nsRows = nsRows.filter((r) => !terminal.has(String((r && r.status) || "").toLowerCase()));
    }

    const contactIds = nsRows.map((r) => r.contact_id).filter(Boolean);
    if (!contactIds.length) {
      return json(res, 200, { leads: [] });
    }

    const inList = contactIds.map((id) => encodeURIComponent(id)).join(",");
    const leadStates = await restSelect(cfg, "lead_state", `contact_id=in.(${inList})`);
    const stateByContact = {};
    for (const s of leadStates) {
      stateByContact[s.contact_id] = s;
    }

    const logs = await restSelect(
      cfg,
      "nurture_delivery_log",
      `contact_id=in.(${inList})&order=sent_at.asc`
    );
    const logsByContact = {};
    for (const L of logs) {
      if (!logsByContact[L.contact_id]) logsByContact[L.contact_id] = [];
      logsByContact[L.contact_id].push(L);
    }

    const overrides = await restSelect(
      cfg,
      "nurture_message_overrides",
      `contact_id=in.(${inList})&phase=eq.3`
    );
    const overridesByContact = {};
    for (const o of overrides) {
      if (!overridesByContact[o.contact_id]) overridesByContact[o.contact_id] = {};
      overridesByContact[o.contact_id][o.step] = o;
    }

    const leads = [];
    for (const ns of nsRows) {
      const contact = ns.contacts;
      if (!contact) continue;
      const cid = contact.id;
      const deliveryLogs = logsByContact[cid] || [];
      const steps = buildPipelineSteps(ns, deliveryLogs);
      const ovMap = overridesByContact[cid] || {};
      for (const row of steps) {
        row.preview = stepPreview(contact, row.phase, row.step, ovMap);
      }

      leads.push({
        contact: {
          id: cid,
          name: displayName(contact),
          phone: contact.phone || null,
          email: contact.email || null,
          language: contact.language || null,
          idioma: contact.idioma || null,
          manychat_subscriber_id: contact.manychat_subscriber_id || null,
          vcf_sent_at: contact.vcf_sent_at || null,
        },
        lead_state: stateByContact[cid] || null,
        nurture_sequence: {
          id: ns.id,
          status: ns.status,
          phase: ns.phase,
          step: ns.step,
          enrolled_at: ns.enrolled_at,
          next_send_at: ns.next_send_at,
          last_sent_at: ns.last_sent_at,
          twilio_opt_out: ns.twilio_opt_out,
          email_opt_out: ns.email_opt_out,
          converted_at: ns.converted_at,
          paused_at: ns.paused_at,
          resumed_at: ns.resumed_at,
          stopped_reason: ns.stopped_reason,
        },
        delivery_logs: deliveryLogs,
        steps,
      });
    }

    return json(res, 200, { leads });
  } catch (e) {
    console.error("[staff/pipeline]", e);
    return json(res, 500, {
      error: "Pipeline load failed",
      detail: String((e && e.message) || e),
    });
  }
};
