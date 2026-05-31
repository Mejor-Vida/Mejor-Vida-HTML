/**
 * CRM Connect tab — compose email + medical information request (per client).
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

  function $(id, root) {
    return (root || document).querySelector("#" + id);
  }

  function api(path, body, opts) {
    var shell = window.StaffCrm;
    if (!shell || !shell.authedApi) throw new Error("StaffCrm not ready");
    return shell.authedApi(path, body, opts);
  }

  function detailLangToCompose(raw) {
    var s = String(raw || "").trim().toLowerCase();
    if (/^(es|espanol|español|spanish)$/.test(s)) return "Spanish";
    return "English";
  }

  function splitName(detail) {
    var fn = detail.first_name != null ? String(detail.first_name).trim() : "";
    var ln = detail.last_name != null ? String(detail.last_name).trim() : "";
    if (!fn && !ln && detail.display_name) {
      var parts = String(detail.display_name).trim().split(/\s+/).filter(Boolean);
      fn = parts[0] || "";
      ln = parts.slice(1).join(" ");
    }
    return { fn: fn, ln: ln };
  }

  function recipientName(state) {
    var combined = [state.firstName, state.lastName].filter(Boolean).join(" ").trim();
    if (combined) return combined;
    return String(state.displayName || "").trim();
  }

  function formHtml() {
    return (
      '<div class="crm-connect-wrap">' +
      '<form class="crm-connect-form" autocomplete="off" onsubmit="return false;">' +
      '<p class="crm-connect-heading">' +
      esc(t("conn_contact_heading")) +
      "</p>" +
      '<div class="crm-connect-row crm-connect-row-2">' +
      "<div><label for=\"crm-conn-first\">" +
      esc(t("conn_first_name")) +
      '</label><input id="crm-conn-first" type="text" autocomplete="off" /></div>' +
      "<div><label for=\"crm-conn-last\">" +
      esc(t("conn_last_name")) +
      '</label><input id="crm-conn-last" type="text" autocomplete="off" /></div>' +
      "</div>" +
      '<div class="crm-connect-row crm-connect-row-2">' +
      "<div><label for=\"crm-conn-email\">" +
      esc(t("conn_email")) +
      '</label><input id="crm-conn-email" type="email" autocomplete="off" /></div>' +
      "<div><label for=\"crm-conn-phone\">" +
      esc(t("conn_phone")) +
      '</label><input id="crm-conn-phone" type="text" inputmode="tel" autocomplete="off" /></div>' +
      "</div>" +
      '<button type="button" id="crm-conn-save-contact" class="crm-btn secondary crm-connect-save-contact">' +
      esc(t("conn_save_contact")) +
      "</button>" +
      '<div class="crm-connect-toggles">' +
      '<div class="crm-connect-toggle-group" role="group" aria-label="' +
      esc(t("conn_language")) +
      '">' +
      '<span class="crm-connect-toggle-label">' +
      esc(t("conn_language")) +
      "</span>" +
      '<button type="button" class="crm-connect-opt" id="crm-conn-lang-en" data-lang="English">English</button>' +
      '<button type="button" class="crm-connect-opt" id="crm-conn-lang-es" data-lang="Spanish">Spanish</button>' +
      "</div>" +
      '<div class="crm-connect-toggle-group" role="group" aria-label="' +
      esc(t("conn_email_type")) +
      '">' +
      '<span class="crm-connect-toggle-label">' +
      esc(t("conn_email_type")) +
      "</span>" +
      '<button type="button" class="crm-connect-opt active" id="crm-conn-type-general" data-type="general">' +
      esc(t("conn_type_general")) +
      "</button>" +
      '<button type="button" class="crm-connect-opt" id="crm-conn-type-medical" data-type="medical_information_request">' +
      esc(t("conn_type_medical")) +
      "</button>" +
      "</div></div>" +
      '<label for="crm-conn-issue" id="crm-conn-issue-label">' +
      esc(t("conn_customer_issue")) +
      '</label><textarea id="crm-conn-issue" rows="2" placeholder="' +
      esc(t("conn_customer_issue_ph")) +
      '"></textarea>' +
      '<div class="crm-connect-notes-wrap">' +
      '<label for="crm-conn-notes">' +
      esc(t("conn_notes")) +
      '</label><span class="crm-connect-hint">' +
      esc(t("conn_notes_hint")) +
      '</span></div><textarea id="crm-conn-notes" rows="2" placeholder="' +
      esc(t("conn_notes_ph")) +
      '"></textarea>' +
      '<label for="crm-conn-reply" id="crm-conn-reply-label">' +
      esc(t("conn_reply_draft")) +
      '</label><textarea id="crm-conn-reply" rows="12" placeholder="' +
      esc(t("conn_reply_ph")) +
      '"></textarea>' +
      '<div class="crm-connect-actions">' +
      '<button type="button" id="crm-conn-generate" class="crm-btn secondary">' +
      esc(t("conn_generate")) +
      "</button>" +
      '<button type="button" id="crm-conn-send" class="crm-btn">' +
      esc(t("conn_send")) +
      "</button>" +
      '<button type="button" id="crm-conn-save-draft" class="crm-btn secondary">' +
      esc(t("conn_save_draft")) +
      "</button></div>" +
      '<p id="crm-conn-status" class="crm-connect-status" aria-live="polite"></p>' +
      "</form>" +
      '<div id="crm-conn-save-modal" class="crm-connect-modal hidden" role="dialog" aria-modal="true">' +
      '<div class="crm-connect-modal-panel">' +
      "<h3>" +
      esc(t("conn_save_confirm_title")) +
      "</h3>" +
      "<p>" +
      esc(t("conn_save_confirm_body")) +
      "</p>" +
      '<div class="crm-connect-modal-actions">' +
      '<button type="button" id="crm-conn-save-cancel" class="crm-btn secondary">' +
      esc(t("conn_no")) +
      "</button>" +
      '<button type="button" id="crm-conn-save-yes" class="crm-btn">' +
      esc(t("conn_yes")) +
      "</button></div></div></div></div>"
    );
  }

  function setStatus(state, msg) {
    var el = $("crm-conn-status", state.root);
    if (el) el.textContent = msg || "";
  }

  function setLanguage(state, lang) {
    state.composeLang = lang === "Spanish" ? "Spanish" : "English";
    var en = $("crm-conn-lang-en", state.root);
    var es = $("crm-conn-lang-es", state.root);
    if (en) en.classList.toggle("active", state.composeLang === "English");
    if (es) es.classList.toggle("active", state.composeLang === "Spanish");
    if (state.emailType === "medical_information_request") void refreshMedicalPreview(state);
  }

  function setEmailType(state, type) {
    state.emailType = type === "medical_information_request" ? "medical_information_request" : "general";
    var g = $("crm-conn-type-general", state.root);
    var m = $("crm-conn-type-medical", state.root);
    if (g) g.classList.toggle("active", state.emailType === "general");
    if (m) m.classList.toggle("active", state.emailType === "medical_information_request");
    updateMedicalModeUi(state);
    if (state.emailType === "medical_information_request") void refreshMedicalPreview(state);
  }

  function updateMedicalModeUi(state) {
    var isMedical = state.emailType === "medical_information_request";
    var genBtn = $("crm-conn-generate", state.root);
    var reply = $("crm-conn-reply", state.root);
    var replyLabel = $("crm-conn-reply-label", state.root);
    var issueLabel = $("crm-conn-issue-label", state.root);
    var issue = $("crm-conn-issue", state.root);
    var notesWrap = state.root.querySelector(".crm-connect-notes-wrap");
    var notes = $("crm-conn-notes", state.root);
    if (genBtn) genBtn.classList.toggle("hidden", isMedical);
    if (reply) {
      reply.readOnly = isMedical;
      reply.placeholder = isMedical ? t("conn_reply_ph_medical") : t("conn_reply_ph");
    }
    if (replyLabel) {
      replyLabel.textContent = isMedical ? t("conn_reply_preview") : t("conn_reply_draft");
    }
    if (issueLabel) issueLabel.classList.toggle("hidden", isMedical);
    if (issue) {
      issue.classList.toggle("hidden", isMedical);
      if (isMedical) issue.value = "";
    }
    if (notesWrap) notesWrap.classList.toggle("hidden", isMedical);
    if (notes) {
      notes.classList.toggle("hidden", isMedical);
      if (isMedical) notes.value = "";
    }
  }

  async function refreshMedicalPreview(state) {
    if (state.emailType !== "medical_information_request") return;
    var reply = $("crm-conn-reply", state.root);
    if (!reply) return;
    var fn = String(($("crm-conn-first", state.root) && $("crm-conn-first", state.root).value) || "").trim();
    if (!fn) fn = state.firstName || "there";
    setStatus(state, t("conn_status_preview_loading"));
    reply.value = "";
    try {
      var data = await api("/api/staff/medical-intake-email-preview", {
        language: state.composeLang,
        firstName: fn,
      });
      reply.value = (data && data.body) || "";
      setStatus(
        state,
        t("conn_status_preview_ready", { subject: (data && data.subject) || "(preview)" })
      );
    } catch (e) {
      setStatus(state, t("conn_status_preview_failed"));
    }
  }

  function readForm(state) {
    return {
      firstName: String(($("crm-conn-first", state.root) && $("crm-conn-first", state.root).value) || "").trim(),
      lastName: String(($("crm-conn-last", state.root) && $("crm-conn-last", state.root).value) || "").trim(),
      email: String(($("crm-conn-email", state.root) && $("crm-conn-email", state.root).value) || "").trim(),
      phone: String(($("crm-conn-phone", state.root) && $("crm-conn-phone", state.root).value) || "").trim(),
      issue: String(($("crm-conn-issue", state.root) && $("crm-conn-issue", state.root).value) || "").trim(),
      notes: String(($("crm-conn-notes", state.root) && $("crm-conn-notes", state.root).value) || "").trim(),
      reply: String(($("crm-conn-reply", state.root) && $("crm-conn-reply", state.root).value) || "").trim(),
    };
  }

  async function onGenerate(state) {
    if (state.emailType === "medical_information_request") {
      await refreshMedicalPreview(state);
      return;
    }
    var f = readForm(state);
    if (!f.issue && !f.notes) {
      setStatus(state, t("conn_status_need_issue"));
      return;
    }
    setStatus(state, t("conn_status_generating"));
    try {
      var name = recipientName({ firstName: f.firstName, lastName: f.lastName, displayName: state.displayName });
      var data = await api("/api/staff/generate-answer", {
        compose: true,
        customerIssue: f.issue,
        staffNotes: f.notes,
        language: state.composeLang,
        lead: {
          first_name: f.firstName || name.split(/\s+/)[0] || "",
          last_name: f.lastName || name.trim().replace(/^\S+\s*/, "") || "",
          phone: f.phone,
          email: f.email,
        },
      });
      var reply = $("crm-conn-reply", state.root);
      if (reply) reply.value = (data && data.answer) || "";
      setStatus(state, t("conn_status_generated"));
    } catch (e) {
      setStatus(state, t("conn_status_generate_failed"));
    }
  }

  async function onSend(state) {
    var f = readForm(state);
    if (!f.reply && state.emailType !== "medical_information_request") {
      setStatus(state, t("conn_status_need_draft"));
      return;
    }
    if (!f.email) {
      setStatus(state, t("conn_status_need_email"));
      return;
    }
    var sendBtn = $("crm-conn-send", state.root);
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = t("conn_sending");
    }
    setStatus(state, t("conn_sending"));
    try {
      var data = await api("/api/staff/send-email", {
        compose: true,
        toEmail: f.email,
        replyDraft: f.reply,
        language: state.composeLang,
        customerIssue: f.issue,
        emailType: state.emailType,
        leadId: state.leadId,
        leadSourceTable: state.leadSourceTable,
        leadFirstName: f.firstName || state.firstName || "",
      });
      if (data && data.success === true) {
        setStatus(
          state,
          t("conn_status_sent", {
            email: f.email,
            subject: data.subject ? " — " + data.subject : "",
            link: data.intakeUrl ? " · Secure link issued." : "",
          })
        );
      } else {
        setStatus(state, (data && data.error) || t("conn_status_send_failed"));
      }
    } catch (e) {
      setStatus(state, t("conn_status_send_failed"));
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = t("conn_send");
      }
    }
  }

  async function onSaveDraft(state) {
    var f = readForm(state);
    var payload = {
      recipient_name: recipientName({ firstName: f.firstName, lastName: f.lastName, displayName: state.displayName }),
      email: f.email,
      phone: f.phone,
      language: state.composeLang,
      customer_issue: f.issue,
      staff_notes: f.notes,
      lead_id: state.leadId,
    };
    if (state.draftId) payload.id = state.draftId;
    setStatus(state, t("conn_status_saving_draft"));
    try {
      var data = await api("/api/staff/save-compose-draft", payload);
      if (data && data.id) state.draftId = data.id;
      setStatus(state, data && data.updated ? t("conn_status_draft_updated") : t("conn_status_draft_saved"));
    } catch (e) {
      setStatus(state, t("conn_status_draft_failed"));
    }
  }

  function openSaveContactModal(state) {
    var mod = $("crm-conn-save-modal", state.root);
    if (mod) mod.classList.remove("hidden");
  }

  function closeSaveContactModal(state) {
    var mod = $("crm-conn-save-modal", state.root);
    if (mod) mod.classList.add("hidden");
  }

  function onSaveContactClick(state) {
    var f = readForm(state);
    if (!f.email && !f.phone && !f.firstName && !f.lastName) {
      setStatus(state, t("conn_status_need_contact_fields"));
      return;
    }
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
      setStatus(state, t("conn_status_invalid_email"));
      return;
    }
    openSaveContactModal(state);
  }

  async function performSaveContact(state) {
    closeSaveContactModal(state);
    var f = readForm(state);
    var btn = $("crm-conn-save-contact", state.root);
    if (btn) btn.disabled = true;
    setStatus(state, t("conn_status_saving_contact"));
    try {
      var data = await api(
        "/api/staff/leads",
        {
          id: state.leadId,
          first_name: f.firstName || null,
          last_name: f.lastName || null,
          email: f.email ? f.email.toLowerCase() : null,
          phone: f.phone || null,
          language: state.composeLang,
        },
        { method: "PATCH" }
      );
      var item = data && data.item;
      if (!item || !item.id) throw new Error("no item");
      state.firstName = item.first_name != null ? String(item.first_name) : f.firstName;
      state.lastName = item.last_name != null ? String(item.last_name) : f.lastName;
      state.displayName = item.display_name || state.displayName;
      if (window.StaffCrm && window.StaffCrm.reloadLeadDetail) {
        await window.StaffCrm.reloadLeadDetail(state.leadId);
      }
      setStatus(state, t("conn_status_contact_saved"));
    } catch (e) {
      setStatus(state, t("conn_status_contact_failed"));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function wire(state) {
    $("crm-conn-lang-en", state.root).addEventListener("click", function () {
      setLanguage(state, "English");
    });
    $("crm-conn-lang-es", state.root).addEventListener("click", function () {
      setLanguage(state, "Spanish");
    });
    $("crm-conn-type-general", state.root).addEventListener("click", function () {
      setEmailType(state, "general");
    });
    $("crm-conn-type-medical", state.root).addEventListener("click", function () {
      setEmailType(state, "medical_information_request");
    });
    $("crm-conn-generate", state.root).addEventListener("click", function () {
      void onGenerate(state);
    });
    $("crm-conn-send", state.root).addEventListener("click", function () {
      void onSend(state);
    });
    $("crm-conn-save-draft", state.root).addEventListener("click", function () {
      void onSaveDraft(state);
    });
    $("crm-conn-save-contact", state.root).addEventListener("click", function () {
      onSaveContactClick(state);
    });
    $("crm-conn-save-cancel", state.root).addEventListener("click", function () {
      closeSaveContactModal(state);
    });
    $("crm-conn-save-yes", state.root).addEventListener("click", function () {
      void performSaveContact(state);
    });
    var mod = $("crm-conn-save-modal", state.root);
    if (mod) {
      mod.addEventListener("click", function (e) {
        if (e.target === mod) closeSaveContactModal(state);
      });
    }
  }

  function fillForm(state, detail) {
    var names = splitName(detail);
    state.firstName = names.fn;
    state.lastName = names.ln;
    state.displayName = detail.display_name || "";
    var first = $("crm-conn-first", state.root);
    var last = $("crm-conn-last", state.root);
    var email = $("crm-conn-email", state.root);
    var phone = $("crm-conn-phone", state.root);
    if (first) first.value = names.fn;
    if (last) last.value = names.ln;
    if (email) email.value = detail.email || "";
    if (phone) phone.value = detail.phone || "";
    setLanguage(state, detailLangToCompose(detail.language));
    setEmailType(state, "general");
  }

  async function mount(rootEl, opts) {
    if (!rootEl) return;
    var detail = opts.detail || {};
    var leadId = opts.leadId || detail.id;
    if (!leadId) {
      rootEl.innerHTML = '<div class="crm-placeholder"><p>Missing client.</p></div>';
      return;
    }

    var state = {
      root: rootEl,
      leadId: leadId,
      leadSourceTable: detail.source_table || "manychat_leads",
      composeLang: detailLangToCompose(detail.language),
      emailType: "general",
      draftId: null,
      firstName: "",
      lastName: "",
      displayName: detail.display_name || "",
    };

    rootEl.innerHTML = formHtml();
    state.root = rootEl;
    fillForm(state, detail);
    wire(state);
  }

  window.StaffCrmConnect = { mount: mount };
})();
