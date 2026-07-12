/**
 * CRM Compliance tab — consent proof + full legal/comms history (newest first).
 * Merges: compliance events, SMS/email/WhatsApp logs, staff notes, system events.
 */
(function () {
  "use strict";

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  function api(path, body, opts) {
    var shell = window.StaffCrm;
    if (!shell || !shell.authedApi) throw new Error("StaffCrm not ready");
    return shell.authedApi(path, body, opts);
  }

  function fmtWhen(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return String(iso);
    }
  }

  function daysLeft(expiresAt) {
    if (!expiresAt) return null;
    var ms = new Date(expiresAt).getTime() - Date.now();
    if (!Number.isFinite(ms)) return null;
    return Math.ceil(ms / 86400000);
  }

  /** Legacy leads: infer 30-day window from signup if not stored. */
  function effectiveExpiresAt(detail) {
    if (detail.consent_expires_at) return detail.consent_expires_at;
    var start = detail.consent_captured_at || detail.created_at;
    if (!start) return null;
    var t0 = new Date(start).getTime();
    if (!Number.isFinite(t0)) return null;
    return new Date(t0 + 30 * 86400000).toISOString();
  }

  function hasFullConsentProof(detail) {
    return !!(detail.consent_ip && (detail.consent_text || detail.sms_opt_in_note) && detail.consent_url);
  }

  function channelLabel(ch) {
    var c = String(ch || "").toLowerCase();
    if (c === "sms") return "SMS";
    if (c === "email") return "Email";
    if (c === "whatsapp") return "WhatsApp";
    if (c === "phone") return "Phone";
    if (c === "system") return "System";
    return ch || "";
  }

  function dirLabel(dir) {
    var d = String(dir || "").toLowerCase();
    if (d === "inbound") return t("compliance_dir_in");
    if (d === "outbound") return t("compliance_dir_out");
    return "";
  }

  function normalizeTimeline(complianceEvents, commItems, noteItems) {
    var out = [];

    (complianceEvents || []).forEach(function (ev) {
      var d = ev.detail && typeof ev.detail === "object" ? ev.detail : {};
      var bits = [];
      if (d.ip) bits.push("IP: " + d.ip);
      if (d.reason) bits.push(String(d.reason));
      if (d.consent_text) bits.push(String(d.consent_text).slice(0, 240));
      out.push({
        at: ev.created_at,
        kind: "compliance",
        kindLabel: t("compliance_kind_legal"),
        title: ev.title || ev.event_type || "event",
        subtitle: (ev.event_type || "") + (ev.actor ? " · " + ev.actor : ""),
        body: bits.join(" · ") || null,
      });
    });

    (commItems || []).forEach(function (item) {
      var ch = channelLabel(item.channel);
      var dir = dirLabel(item.direction);
      var title =
        item.title ||
        item.summary ||
        (ch ? ch + (dir ? " (" + dir + ")" : "") : t("compliance_kind_message"));
      var bodyParts = [];
      if (item.subject) bodyParts.push(item.subject);
      if (item.body) bodyParts.push(String(item.body).slice(0, 800));
      else if (item.summary && item.summary !== title) bodyParts.push(item.summary);
      out.push({
        at: item.at,
        kind: item.type === "call" ? "call" : item.channel === "sms" ? "sms" : item.channel === "email" ? "email" : "message",
        kindLabel:
          item.type === "call"
            ? t("compliance_kind_call")
            : item.type === "note"
              ? t("compliance_kind_note")
              : ch
                ? ch + (dir ? " · " + dir : "")
                : t("compliance_kind_message"),
        title: title,
        subtitle: [ch, dir, item.type].filter(Boolean).join(" · "),
        body: bodyParts.length ? bodyParts.join("\n\n") : null,
      });
    });

    (noteItems || []).forEach(function (n) {
      out.push({
        at: n.created_at || n.at,
        kind: "note",
        kindLabel: t("compliance_kind_note"),
        title: t("compliance_note_title"),
        subtitle: n.created_by || n.author || "",
        body: n.note || n.body || n.text || null,
      });
    });

    out.sort(function (a, b) {
      return new Date(b.at).getTime() - new Date(a.at).getTime();
    });
    return out;
  }

  function renderTimeline(items) {
    if (!items.length) {
      return '<p class="crm-empty-state">' + esc(t("compliance_timeline_empty")) + "</p>";
    }
    var html = '<ol class="crm-compliance-timeline">';
    items.forEach(function (ev) {
      html +=
        "<li class=\"crm-compliance-ev crm-compliance-ev--" +
        esc(ev.kind || "event") +
        '">' +
        '<div class="crm-compliance-ev-head">' +
        '<span class="crm-compliance-kind">' +
        esc(ev.kindLabel || "") +
        "</span>" +
        '<span class="crm-muted">' +
        esc(fmtWhen(ev.at)) +
        "</span></div>" +
        "<strong>" +
        esc(ev.title || "") +
        "</strong>" +
        (ev.subtitle
          ? '<div class="crm-muted">' + esc(ev.subtitle) + "</div>"
          : "") +
        (ev.body
          ? '<pre class="crm-compliance-ev-detail">' + esc(ev.body) + "</pre>"
          : "") +
        "</li>";
    });
    html += "</ol>";
    return html;
  }

  async function mount(root, opts) {
    opts = opts || {};
    var detail = opts.detail || {};
    var leadId = opts.leadId || detail.id;
    var complianceEvents = Array.isArray(opts.complianceEvents) ? opts.complianceEvents : [];
    var skipRemote = !!opts.skipRemoteFetch;
    var preComm = Array.isArray(opts.communications) ? opts.communications : null;
    var preNotes = Array.isArray(opts.notes) ? opts.notes : null;

    root.innerHTML = '<p class="crm-empty-state">' + esc(t("loading")) + "</p>";

    var commItems = preComm || [];
    var noteItems = preNotes || [];
    if (!skipRemote && leadId) {
      try {
        var comm = await api("/api/staff/communications?leadId=" + encodeURIComponent(leadId), null, {
          method: "GET",
        });
        commItems = Array.isArray(comm.items) ? comm.items : [];
      } catch (e) {
        commItems = [];
      }
      try {
        var notes = await api("/api/staff/notes?leadId=" + encodeURIComponent(leadId), null, {
          method: "GET",
        });
        noteItems = Array.isArray(notes.items) ? notes.items : [];
      } catch (e) {
        noteItems = [];
      }
    }

    var expiresAt = effectiveExpiresAt(detail);
    var left = daysLeft(expiresAt);
    var expired = left != null && left < 0;
    var fullProof = hasFullConsentProof(detail);
    var bannerClass =
      "crm-compliance-banner" +
      (expired ? " is-expired" : "") +
      (!fullProof ? " is-legacy" : "");
    var bannerText = !fullProof
      ? t("compliance_legacy_proof")
      : expired
        ? t("compliance_consent_expired")
        : left != null
          ? t("compliance_consent_days_left", { days: left })
          : t("compliance_consent_unknown");

    var summary =
      '<div class="crm-card crm-compliance-summary">' +
      "<h2>" +
      esc(t("compliance_proof_title")) +
      "</h2>" +
      '<div class="' +
      bannerClass +
      '">' +
      esc(bannerText) +
      "</div>" +
      '<dl class="crm-compliance-dl">' +
      "<dt>" +
      esc(t("compliance_ip")) +
      "</dt><dd>" +
      esc(detail.consent_ip || "—") +
      "</dd>" +
      "<dt>" +
      esc(t("compliance_registered")) +
      "</dt><dd>" +
      esc(fmtWhen(detail.consent_captured_at || detail.created_at)) +
      "</dd>" +
      "<dt>" +
      esc(t("compliance_expires")) +
      "</dt><dd>" +
      esc(fmtWhen(expiresAt)) +
      (detail.consent_expires_at ? "" : " <span class=\"crm-muted\">(" + esc(t("compliance_expires_inferred")) + ")</span>") +
      "</dd>" +
      "<dt>" +
      esc(t("compliance_sms")) +
      "</dt><dd>" +
      esc(
        detail.sms_opt_in === true
          ? t("compliance_yes")
          : detail.sms_opt_in === false
            ? t("compliance_no")
            : "—"
      ) +
      "</dd>" +
      "<dt>" +
      esc(t("compliance_url")) +
      "</dt><dd class=\"crm-compliance-wrap\">" +
      esc(detail.consent_url || "—") +
      "</dd>" +
      "<dt>" +
      esc(t("compliance_wording")) +
      "</dt><dd class=\"crm-compliance-wording\">" +
      esc(detail.consent_text || detail.sms_opt_in_note || "—") +
      "</dd>" +
      "</dl></div>";

    var timelineItems = normalizeTimeline(complianceEvents, commItems, noteItems);
    var timeline =
      '<div class="crm-card"><h2>' +
      esc(t("compliance_timeline_title")) +
      '</h2><p class="crm-muted">' +
      esc(t("compliance_timeline_sub_full")) +
      "</p>" +
      renderTimeline(timelineItems) +
      "</div>";

    root.innerHTML =
      '<div class="crm-page-head"><h1 class="crm-page-title">' +
      esc(t("tab_compliance")) +
      '</h1><p class="crm-page-sub">' +
      esc(t("compliance_blurb")) +
      "</p></div>" +
      summary +
      timeline;
  }

  window.StaffCrmCompliance = { mount: mount };
})();
