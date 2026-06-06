/**
 * CRM Communication & Notes tab — compact reminder scheduler, comm history, timestamped notes.
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

  function fmtDateTime(iso) {
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

  function typeLabel(type) {
    var map = {
      event: "cn_type_event",
      nurture_send: "cn_type_nurture_send",
      message: "cn_type_message",
      call: "cn_type_call",
      milestone: "cn_type_milestone",
      question: "cn_type_question",
    };
    return t(map[type] || "cn_type_event");
  }

  function channelLabel(ch) {
    if (!ch) return "";
    var c = String(ch).toLowerCase();
    if (c === "whatsapp") return "WhatsApp";
    if (c === "sms") return "SMS";
    if (c === "email") return "Email";
    if (c === "phone") return "Phone";
    return ch;
  }

  function defaultDatetimeLocal() {
    var d = new Date(Date.now() + 60 * 60 * 1000);
    d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
    var pad = function (n) {
      return String(n).padStart(2, "0");
    };
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function pendingReminders(items) {
    return (items || []).filter(function (r) {
      return r.status === "pending";
    });
  }

  function renderClientReminderItem(r, opts) {
    opts = opts || {};
    var showName = !!opts.showName;
    return (
      "<li" +
      (opts.isCurrent ? ' class="is-current-client"' : "") +
      ">" +
      (showName
        ? '<div class="crm-cn-reminder-client">' +
          esc(r.client_name || "Unknown") +
          (opts.isCurrent ? ' <span class="crm-cn-reminder-you">' + esc(t("cn_this_client")) + "</span>" : "") +
          "</div>"
        : "") +
      '<div class="crm-cn-reminder-meta">' +
      esc(fmtDateTime(r.scheduled_at)) +
      "</div>" +
      '<div class="crm-cn-reminder-msg">' +
      esc(r.message) +
      "</div>" +
      '<div class="crm-cn-reminder-actions">' +
      (opts.showOpen && r.lead_id
        ? '<button type="button" class="crm-btn secondary crm-cn-open-client" data-lead-id="' +
          esc(r.lead_id) +
          '">' +
          esc(t("cn_open_client")) +
          "</button>"
        : "") +
      '<button type="button" class="crm-btn secondary crm-cn-cancel-reminder" data-id="' +
      esc(r.id) +
      '">' +
      esc(t("cn_cancel_reminder")) +
      "</button></div></li>"
    );
  }

  function renderClientReminderLine(items) {
    var pending = pendingReminders(items);
    if (!pending.length) return "";
    var now = Date.now();
    return pending
      .map(function (r) {
        var overdue = new Date(r.scheduled_at).getTime() <= now;
        return (
          '<div class="crm-cn-reminder-oneline' +
          (overdue ? " crm-cn-reminder-overdue" : "") +
          '">' +
          '<span class="crm-cn-reminder-oneline-date">' +
          esc(fmtDateTime(r.scheduled_at)) +
          (overdue ? ' <span class="crm-cn-reminder-due-tag">' + esc(t("cn_reminder_due")) + "</span>" : "") +
          "</span>" +
          '<span class="crm-cn-reminder-oneline-msg">' +
          esc(r.message) +
          "</span>" +
          '<button type="button" class="crm-cn-cancel-reminder crm-cn-reminder-oneline-cancel" data-id="' +
          esc(r.id) +
          '">' +
          esc(t("cn_cancel_reminder")) +
          "</button></div>"
        );
      })
      .join("");
  }

  function renderAllRemindersModalBody(items, currentLeadId) {
    var pending = pendingReminders(items);
    if (!pending.length) {
      return '<p class="crm-cn-empty">' + esc(t("cn_no_all_reminders")) + "</p>";
    }
    return (
      '<ul class="crm-cn-reminder-list crm-cn-reminder-list-modal">' +
      pending
        .map(function (r) {
          return renderClientReminderItem(r, {
            showName: true,
            showOpen: true,
            isCurrent: String(r.lead_id) === String(currentLeadId),
          });
        })
        .join("") +
      "</ul>"
    );
  }

  function directionLabel(direction) {
    if (direction === "inbound") return t("cn_direction_inbound");
    if (direction === "outbound") return t("cn_direction_outbound");
    return "";
  }

  function renderHistoryItems(items, hint) {
    if (hint === "no_contact") {
      return '<p class="crm-cn-empty">' + esc(t("cn_link_contact_hint")) + "</p>";
    }
    if (!items || !items.length) {
      return '<p class="crm-cn-empty">' + esc(t("cn_no_history")) + "</p>";
    }
    return (
      '<ul class="crm-cn-timeline">' +
      items
        .map(function (row) {
          var parts = [];
          var dir = directionLabel(row.direction);
          var ch = row.channel ? channelLabel(row.channel) : "";
          if (dir) parts.push(dir);
          if (ch) parts.push(ch);
          if (row.type && row.type !== "message") parts.push(typeLabel(row.type));
          var meta = parts.filter(Boolean).join(" · ");
          var summary = row.summary || row.title || meta || "—";
          var viewBtn =
            row.has_body && row.id
              ? '<button type="button" class="crm-btn secondary crm-cn-view-msg" data-id="' +
                esc(row.id) +
                '">' +
                esc(t("cn_view_message")) +
                "</button>"
              : "";
          return (
            "<li>" +
            '<div class="crm-cn-timeline-row">' +
            '<span class="crm-cn-timeline-date">' +
            esc(fmtDateTime(row.at)) +
            "</span>" +
            (meta ? '<span class="crm-cn-timeline-meta">' + esc(meta) + "</span>" : "") +
            '<span class="crm-cn-timeline-summary">' +
            esc(summary) +
            "</span>" +
            viewBtn +
            "</div></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function renderNotesItems(items, hint) {
    if (hint === "no_contact") {
      return '<p class="crm-cn-empty">' + esc(t("cn_link_contact_hint")) + "</p>";
    }
    if (!items || !items.length) {
      return '<p class="crm-cn-empty">' + esc(t("cn_no_notes")) + "</p>";
    }
    return (
      '<ul class="crm-cn-notes-list">' +
      items
        .map(function (n) {
          return (
            "<li>" +
            '<div class="crm-cn-note-date">' +
            esc(fmtDateTime(n.created_at)) +
            "</div>" +
            '<div class="crm-cn-note-body">' +
            esc(n.note) +
            "</div></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function formHtml() {
    return (
      '<div class="crm-comm-notes-wrap">' +
      '<section class="crm-cn-scheduler crm-cn-scheduler-compact">' +
      '<div class="crm-cn-scheduler-head">' +
      "<h2>" +
      esc(t("cn_scheduler_title")) +
      "</h2>" +
      '<button type="button" id="crm-cn-all-reminders-btn" class="crm-btn secondary crm-cn-all-reminders-btn">' +
      esc(t("cn_all_reminders_btn")) +
      "</button></div>" +
      '<p class="crm-cn-hint">' +
      esc(t("cn_message_ph")) +
      " · " +
      esc(t("cn_reminder_tz_hint")) +
      "</p>" +
      '<div class="crm-cn-scheduler-inline">' +
      '<input type="text" id="crm-cn-reminder-msg" class="crm-cn-reminder-input" placeholder="' +
      esc(t("cn_message_ph")) +
      '" autocomplete="off" />' +
      '<input type="datetime-local" id="crm-cn-reminder-at" class="crm-cn-reminder-at" aria-label="' +
      esc(t("cn_reminder_when")) +
      '" />' +
      '<button type="button" id="crm-cn-schedule-btn" class="crm-btn crm-cn-schedule-btn">' +
      esc(t("cn_schedule_btn")) +
      "</button></div>" +
      '<div id="crm-cn-reminder-line" class="crm-cn-reminder-line" aria-live="polite"></div></section>' +
      '<div class="crm-cn-columns">' +
      '<section class="crm-cn-col crm-cn-history">' +
      "<h2>" +
      esc(t("cn_comm_history")) +
      "</h2>" +
      '<div id="crm-cn-history-root" class="crm-cn-scroll">' +
      esc(t("cn_loading")) +
      "</div></section>" +
      '<section class="crm-cn-col crm-cn-notes-panel">' +
      "<h2>" +
      esc(t("cn_notes_title")) +
      "</h2>" +
      '<textarea id="crm-cn-note-input" rows="4" placeholder="' +
      esc(t("cn_notes_ph")) +
      '"></textarea>' +
      '<button type="button" id="crm-cn-note-submit" class="crm-btn secondary">' +
      esc(t("cn_notes_submit")) +
      "</button>" +
      '<p id="crm-cn-notes-status" class="crm-cn-status" aria-live="polite"></p>' +
      '<div id="crm-cn-notes-list" class="crm-cn-scroll"></div></section></div>' +
      '<div id="crm-cn-all-reminders-modal" class="crm-modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="crm-cn-all-reminders-title">' +
      '<div class="crm-modal crm-cn-all-reminders-modal">' +
      '<h2 id="crm-cn-all-reminders-title">' +
      esc(t("cn_all_reminders_title")) +
      "</h2>" +
      '<div id="crm-cn-all-reminders-body" class="crm-cn-all-reminders-body"></div>' +
      '<div class="crm-modal-actions">' +
      '<button type="button" id="crm-cn-all-reminders-close" class="crm-btn secondary">' +
      esc(t("close")) +
      "</button></div></div></div>" +
      '<div id="crm-cn-msg-modal" class="crm-modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="crm-cn-msg-modal-title">' +
      '<div class="crm-modal crm-cn-msg-modal">' +
      '<h2 id="crm-cn-msg-modal-title">' +
      esc(t("cn_msg_modal_title")) +
      "</h2>" +
      '<div id="crm-cn-msg-modal-meta" class="crm-cn-msg-modal-meta"></div>' +
      '<pre id="crm-cn-msg-modal-body" class="crm-cn-msg-modal-body"></pre>' +
      '<div class="crm-modal-actions">' +
      '<button type="button" id="crm-cn-msg-modal-close" class="crm-btn secondary">' +
      esc(t("close")) +
      "</button></div></div></div></div>"
    );
  }

  function closeMsgModal(state) {
    var mod = $("crm-cn-msg-modal", state.root);
    if (mod) mod.classList.add("hidden");
  }

  function openMsgModal(state, row) {
    var mod = $("crm-cn-msg-modal", state.root);
    var metaEl = $("crm-cn-msg-modal-meta", state.root);
    var bodyEl = $("crm-cn-msg-modal-body", state.root);
    if (!mod || !bodyEl) return;

    var metaParts = [fmtDateTime(row.at)];
    var dir = directionLabel(row.direction);
    var ch = row.channel ? channelLabel(row.channel) : "";
    if (dir) metaParts.push(dir);
    if (ch) metaParts.push(ch);
    if (metaEl) metaEl.textContent = metaParts.join(" · ");

    var text = row.body || row.summary || t("cn_no_body");
    if (row.subject) {
      text = t("cn_subject_label") + ": " + row.subject + "\n\n" + text;
    }
    bodyEl.textContent = text;
    mod.classList.remove("hidden");
  }

  function wireViewMessageButtons(state, root) {
    (root || state.root).querySelectorAll(".crm-cn-view-msg").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        if (!id || !state.historyById) return;
        var row = state.historyById[id];
        if (row) openMsgModal(state, row);
      });
    });
  }

  function closeAllRemindersModal(state) {
    var mod = $("crm-cn-all-reminders-modal", state.root);
    if (mod) mod.classList.add("hidden");
  }

  async function openAllRemindersModal(state) {
    var mod = $("crm-cn-all-reminders-modal", state.root);
    var body = $("crm-cn-all-reminders-body", state.root);
    if (!mod || !body) return;
    body.innerHTML = '<p class="crm-cn-empty">' + esc(t("cn_loading")) + "</p>";
    mod.classList.remove("hidden");
    try {
      var data = await api("/api/staff/reminders?scope=all");
      body.innerHTML = renderAllRemindersModalBody(data.items || [], state.leadId);
      wireCancelButtons(state, body);
      wireOpenClientButtons(state, body);
    } catch (e) {
      body.innerHTML = '<p class="crm-cn-empty">' + esc((e && e.message) || t("cn_reminder_failed")) + "</p>";
    }
  }

  async function loadClientReminders(state) {
    var lineEl = $("crm-cn-reminder-line", state.root);
    if (!lineEl) return;
    try {
      var rem = await api("/api/staff/reminders?leadId=" + encodeURIComponent(state.leadId));
      state.reminders = rem.items || [];
      lineEl.innerHTML = renderClientReminderLine(state.reminders);
      wireCancelButtons(state, lineEl);
    } catch (e) {
      lineEl.innerHTML = "";
    }
  }

  function flashReminderLine(state, html) {
    var lineEl = $("crm-cn-reminder-line", state.root);
    if (!lineEl) return;
    lineEl.innerHTML = html || "";
    if (!html) return;
    clearTimeout(state._lineFlashTimer);
    state._lineFlashTimer = setTimeout(function () {
      void loadClientReminders(state);
    }, 2200);
  }

  async function loadAll(state) {
    var leadId = state.leadId;
    var histRoot = $("crm-cn-history-root", state.root);
    var notesList = $("crm-cn-notes-list", state.root);
    if (histRoot) histRoot.textContent = t("cn_loading");
    if (notesList) notesList.textContent = t("cn_loading");

    try {
      var comm = await api("/api/staff/communications?leadId=" + encodeURIComponent(leadId));
      state.historyById = {};
      (comm.items || []).forEach(function (row) {
        if (row && row.id) state.historyById[row.id] = row;
      });
      if (histRoot) {
        histRoot.innerHTML = renderHistoryItems(comm.items || [], comm.hint);
        wireViewMessageButtons(state, histRoot);
      }
    } catch (e) {
      if (histRoot) histRoot.innerHTML = '<p class="crm-cn-empty">' + esc((e && e.message) || t("cn_no_history")) + "</p>";
    }

    try {
      var notes = await api("/api/staff/notes?leadId=" + encodeURIComponent(leadId));
      if (notesList) {
        notesList.innerHTML = renderNotesItems(notes.items || [], notes.hint);
      }
    } catch (e) {
      if (notesList) notesList.innerHTML = '<p class="crm-cn-empty">' + esc((e && e.message) || t("cn_no_notes")) + "</p>";
    }

    await loadClientReminders(state);
  }

  function wireCancelButtons(state, root) {
    (root || state.root).querySelectorAll(".crm-cn-cancel-reminder").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var id = btn.getAttribute("data-id");
        if (!id) return;
        btn.disabled = true;
        try {
          await api("/api/staff/reminders", { id: id, status: "cancelled" }, { method: "PATCH" });
          await loadClientReminders(state);
          var mod = $("crm-cn-all-reminders-modal", state.root);
          if (mod && !mod.classList.contains("hidden")) {
            await openAllRemindersModal(state);
          }
        } catch (e) {
          flashReminderLine(state, '<span class="crm-cn-line-flash">' + esc((e && e.message) || t("cn_reminder_failed")) + "</span>");
          btn.disabled = false;
        }
      });
    });
  }

  function wireOpenClientButtons(state, root) {
    (root || state.root).querySelectorAll(".crm-cn-open-client").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-lead-id");
        if (!id || !window.StaffCrm || !window.StaffCrm.navigate) return;
        closeAllRemindersModal(state);
        window.StaffCrm.navigate("#/clients/" + encodeURIComponent(id) + "/comm-notes");
      });
    });
  }

  function wireForm(state) {
    var atInput = $("crm-cn-reminder-at", state.root);
    if (atInput && !atInput.value) atInput.value = defaultDatetimeLocal();

    var allBtn = $("crm-cn-all-reminders-btn", state.root);
    if (allBtn) {
      allBtn.addEventListener("click", function () {
        void openAllRemindersModal(state);
      });
    }

    var closeBtn = $("crm-cn-all-reminders-close", state.root);
    if (closeBtn) closeBtn.addEventListener("click", function () {
      closeAllRemindersModal(state);
    });

    var msgClose = $("crm-cn-msg-modal-close", state.root);
    if (msgClose) msgClose.addEventListener("click", function () {
      closeMsgModal(state);
    });

    var msgMod = $("crm-cn-msg-modal", state.root);
    if (msgMod) {
      msgMod.addEventListener("click", function (e) {
        if (e.target === msgMod) closeMsgModal(state);
      });
    }

    var mod = $("crm-cn-all-reminders-modal", state.root);
    if (mod) {
      mod.addEventListener("click", function (e) {
        if (e.target === mod) closeAllRemindersModal(state);
      });
    }

    var schedBtn = $("crm-cn-schedule-btn", state.root);
    if (schedBtn) {
      schedBtn.addEventListener("click", async function () {
        var msgEl = $("crm-cn-reminder-msg", state.root);
        var atEl = $("crm-cn-reminder-at", state.root);
        var message = msgEl ? String(msgEl.value || "").trim() : "";
        var localAt = atEl ? String(atEl.value || "").trim() : "";
        if (!message) {
          flashReminderLine(state, '<span class="crm-cn-line-flash">' + esc(t("cn_message_ph")) + "</span>");
          return;
        }
        if (!localAt) {
          flashReminderLine(state, '<span class="crm-cn-line-flash">' + esc(t("cn_reminder_failed")) + "</span>");
          return;
        }
        schedBtn.disabled = true;
        try {
          var iso = new Date(localAt).toISOString();
          await api(
            "/api/staff/reminders",
            { lead_id: state.leadId, message: message, scheduled_at: iso },
            { method: "POST" }
          );
          if (msgEl) msgEl.value = "";
          if (atEl) atEl.value = defaultDatetimeLocal();
          await loadClientReminders(state);
        } catch (e) {
          flashReminderLine(state, '<span class="crm-cn-line-flash">' + esc((e && e.message) || t("cn_reminder_failed")) + "</span>");
        } finally {
          schedBtn.disabled = false;
        }
      });
    }

    var noteBtn = $("crm-cn-note-submit", state.root);
    if (noteBtn) {
      noteBtn.addEventListener("click", async function () {
        var input = $("crm-cn-note-input", state.root);
        var status = $("crm-cn-notes-status", state.root);
        var note = input ? String(input.value || "").trim() : "";
        if (!note) return;
        noteBtn.disabled = true;
        if (status) status.textContent = t("cn_loading");
        try {
          await api("/api/staff/notes", { lead_id: state.leadId, note: note }, { method: "POST" });
          if (input) input.value = "";
          if (status) status.textContent = t("cn_note_saved");
          var notes = await api("/api/staff/notes?leadId=" + encodeURIComponent(state.leadId));
          var notesList = $("crm-cn-notes-list", state.root);
          if (notesList) notesList.innerHTML = renderNotesItems(notes.items || [], notes.hint);
        } catch (e) {
          if (status) status.textContent = (e && e.message) || t("cn_note_failed");
        } finally {
          noteBtn.disabled = false;
        }
      });
    }
  }

  async function mount(root, opts) {
    if (!root) return;
    var state = {
      root: root,
      leadId: opts && opts.leadId ? opts.leadId : "",
      detail: opts && opts.detail ? opts.detail : null,
      reminders: [],
      historyById: {},
    };
    function onRemindersSent() {
      void loadClientReminders(state);
    }
    window.addEventListener("staffcrm-reminders-sent", onRemindersSent);
    root.innerHTML = formHtml();
    wireForm(state);
    await loadAll(state);
  }

  window.StaffCrmCommNotes = { mount: mount };
})();
