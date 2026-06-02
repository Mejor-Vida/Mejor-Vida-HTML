/**
 * CRM Pipeline tab — per-client nurture sequence tracker (classic portal parity).
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

  function resolveContactId(detail) {
    if (!detail) return "";
    var cid = detail.contact_id || detail.contacts_contact_id;
    if (cid) return String(cid).trim();
    if (String(detail.source_table || "") === "contacts" && detail.id) return String(detail.id).trim();
    return "";
  }

  function hasLookupHints(detail) {
    if (!detail) return false;
    return !!(
      resolveContactId(detail) ||
      String(detail.phone || "").trim() ||
      String(detail.email || "").trim() ||
      String(detail.manychat_subscriber_id || "").trim()
    );
  }

  /** Planned nurture stages when no contacts row is linked yet (matches server template). */
  function buildLocalTemplateSteps() {
    var rows = [
      { stageNumber: 1, name: "WA-Quote email", channel: "email", channelUi: "Email", is_next: true },
      { stageNumber: 2, name: "WA — Value + book call", channel: "whatsapp", channelUi: "WhatsApp" },
      { stageNumber: 3, name: "WA — Check-in", channel: "whatsapp", channelUi: "WhatsApp" },
      { stageNumber: 4, name: "SMS — Day 3", channel: "sms", channelUi: "SMS" },
      { stageNumber: 5, name: "SMS — Day 5 + VCF", channel: "sms", channelUi: "SMS" },
      { stageNumber: 6, name: "SMS — Day 7", channel: "sms", channelUi: "SMS" },
      { stageNumber: 7, name: "Email — Week 1", channel: "email", channelUi: "Email" },
      { stageNumber: 8, name: "Email — Week 2", channel: "email", channelUi: "Email" },
      { stageNumber: 9, name: "Email — Week 3", channel: "email", channelUi: "Email" },
      { stageNumber: 10, name: "Email — Week 4", channel: "email", channelUi: "Email" },
    ];
    return rows.map(function (r) {
      return {
        stageNumber: r.stageNumber,
        phase: 0,
        step: 1,
        channel: r.channel,
        channelUi: r.channelUi,
        name: r.name,
        scheduled_at: null,
        actual_sent_at: null,
        status: "not_enrolled",
        is_next: !!r.is_next,
        detail_reason: null,
        preview: null,
      };
    });
  }

  function buildPipelineQuery(state) {
    var parts = [];
    var d = state.detail || {};
    var cid = state.contactId || resolveContactId(d);
    if (cid) parts.push("contactId=" + encodeURIComponent(cid));
    if (d.phone) parts.push("phone=" + encodeURIComponent(String(d.phone).trim()));
    if (d.email) parts.push("email=" + encodeURIComponent(String(d.email).trim()));
    if (d.manychat_subscriber_id) {
      parts.push("subscriberId=" + encodeURIComponent(String(d.manychat_subscriber_id).trim()));
    }
    var showStopped = $("crm-pt-show-stopped", state.root);
    if (showStopped && showStopped.checked) parts.push("includeStopped=1");
    return parts.length ? "?" + parts.join("&") : "";
  }

  function buildEnrollQuery(state) {
    var qs = buildPipelineQuery(state);
    return qs.replace(/^\?/, "?") || "";
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return String(iso);
    }
  }

  function badgeClass(status) {
    var s = String(status || "").toLowerCase();
    if (s === "active") return "active";
    if (s === "paused") return "paused";
    if (s === "completed") return "completed";
    if (s === "converted") return "converted";
    if (s === "opted_out") return "opted_out";
    return "completed";
  }

  function shellHtml() {
    return (
      '<div class="crm-pipeline-wrap">' +
      '<div class="crm-pipeline-head">' +
      "<div><strong>" +
      esc(t("pipe_title")) +
      '</strong><p class="crm-pipeline-sub">' +
      esc(t("pipe_subtitle")) +
      "</p></div>" +
      '<div class="crm-pipeline-head-actions">' +
      '<label class="crm-pipeline-show-stopped"><input type="checkbox" id="crm-pt-show-stopped" /> ' +
      esc(t("pipe_show_stopped")) +
      "</label>" +
      '<button type="button" id="crm-pt-refresh" class="crm-btn secondary">' +
      esc(t("pipe_refresh")) +
      "</button></div></div>" +
      '<div id="crm-pt-empty" class="crm-pipeline-empty hidden"></div>' +
      '<div id="crm-pt-detail" class="hidden">' +
      '<div id="crm-pt-notice" class="crm-pipeline-notice hidden" role="status"></div>' +
      '<div class="crm-pipeline-status-bar">' +
      '<div id="crm-pt-stage-line" class="crm-pipeline-stage-line"></div>' +
      '<div class="crm-pipeline-actions">' +
      '<button type="button" id="crm-pt-pause" class="crm-btn secondary">' +
      esc(t("pipe_pause")) +
      "</button>" +
      '<button type="button" id="crm-pt-resume" class="crm-btn secondary">' +
      esc(t("pipe_resume")) +
      "</button>" +
      '<button type="button" id="crm-pt-sold" class="crm-btn secondary">' +
      esc(t("pipe_sold")) +
      "</button>" +
      '<button type="button" id="crm-pt-optout" class="crm-btn secondary">' +
      esc(t("pipe_optout")) +
      "</button>" +
      '<button type="button" id="crm-pt-link" class="crm-btn secondary">' +
      esc(t("pipe_link_contact")) +
      "</button>" +
      '<button type="button" id="crm-pt-enroll" class="crm-btn">' +
      esc(t("pipe_enroll")) +
      "</button></div></div>" +
      '<div class="crm-pipeline-table-wrap"><table class="crm-pipeline-table" aria-label="' +
      esc(t("pipe_steps_table")) +
      '"><thead><tr>' +
      "<th>#</th><th>" +
      esc(t("pipe_col_stage")) +
      "</th><th>" +
      esc(t("pipe_col_channel")) +
      "</th><th>" +
      esc(t("pipe_col_scheduled")) +
      "</th><th>" +
      esc(t("pipe_col_sent")) +
      "</th><th>" +
      esc(t("pipe_col_status")) +
      '</th></tr></thead><tbody id="crm-pt-steps-body"></tbody></table></div>' +
      '<div id="crm-pt-preview" class="crm-pipeline-preview">' +
      '<p class="crm-pipeline-preview-label">' +
      esc(t("pipe_preview_label")) +
      '</p><div id="crm-pt-preview-inner" class="crm-pipeline-preview-inner"></div></div>' +
      '<p id="crm-pt-foot" class="crm-pipeline-foot" aria-live="polite"></p></div></div>'
    );
  }

  function setFoot(state, msg) {
    var el = $("crm-pt-foot", state.root);
    if (el) el.textContent = msg || "";
  }

  async function saveOverride(state, stepRow) {
    var subj = $("crm-pt-email-subj", state.root);
    var body = $("crm-pt-email-body", state.root);
    if (!subj || !body || !state.contactId) return;
    try {
      await api(
        "/api/staff/nurture-override?contactId=" +
          encodeURIComponent(state.contactId) +
          "&phase=3&step=" +
          encodeURIComponent(String(stepRow.step)),
        { subject: subj.value, body: body.value },
        { method: "POST" }
      );
      setFoot(state, t("pipe_override_saved"));
      await loadPipeline(state);
    } catch (e) {
      setFoot(state, String((e && e.message) || t("pipe_load_failed")));
    }
  }

  function renderPreview(state) {
    var wrap = $("crm-pt-preview-inner", state.root);
    var entry = state.entry;
    if (!wrap || !entry || !entry.steps || !entry.steps.length) return;
    if (state.stepIndex < 0 || state.stepIndex >= entry.steps.length) state.stepIndex = 0;
    var st = entry.steps[state.stepIndex];
    if (!st) {
      wrap.innerHTML = '<p class="crm-pipeline-preview-hint">' + esc(t("pipe_no_preview")) + "</p>";
      return;
    }
    if (!st.preview) {
      wrap.innerHTML =
        '<p class="crm-pipeline-preview-hint"><strong>' +
        esc(st.name || "") +
        '</strong></p><p class="crm-pipeline-preview-hint">' +
        esc(st.status === "not_enrolled" ? t("pipe_preview_not_enrolled") : t("pipe_no_preview")) +
        "</p>";
      return;
    }
    var p = st.preview;
    wrap.innerHTML = "";
    if (p.kind === "whatsapp") {
      wrap.innerHTML =
        '<p class="crm-pipeline-preview-hint">' +
        esc(p.note || "") +
        '</p><p class="crm-pipeline-preview-hint">' +
        esc(t("pipe_subscriber_ready", { yes: p.subscriber_ready ? t("pipe_yes") : t("pipe_no") })) +
        "</p>";
      return;
    }
    if (p.kind === "sms") {
      wrap.innerHTML =
        '<label>' +
        esc(t("pipe_sms_body")) +
        '</label><textarea readonly rows="8">' +
        esc(p.text || "") +
        "</textarea>";
      return;
    }
    if (p.kind === "email") {
      if (!p.editable && p.note && !((p.subject || "").trim() || (p.body || "").trim())) {
        wrap.innerHTML = '<p class="crm-pipeline-preview-hint">' + esc(p.note) + "</p>";
        return;
      }
      wrap.innerHTML =
        '<label for="crm-pt-email-subj">' +
        esc(t("pipe_subject")) +
        '</label><input id="crm-pt-email-subj" type="text" value="' +
        esc(p.subject || "") +
        '"' +
        (p.editable ? "" : " readonly") +
        ' /><label for="crm-pt-email-body" style="margin-top:10px;display:block">' +
        esc(t("pipe_body_html")) +
        '</label><textarea id="crm-pt-email-body" rows="14"' +
        (p.editable ? "" : " readonly") +
        ">" +
        esc(p.body || "") +
        "</textarea>";
      if (p.editable) {
        var actions = document.createElement("div");
        actions.className = "crm-pipeline-preview-actions";
        actions.innerHTML =
          '<button type="button" id="crm-pt-save-override" class="crm-btn secondary">' +
          esc(t("pipe_save_override")) +
          '</button><span class="crm-pipeline-preview-hint">' +
          esc(p.is_override ? t("pipe_using_custom") : t("pipe_using_default")) +
          "</span>";
        wrap.appendChild(actions);
        $("crm-pt-save-override", wrap).addEventListener("click", function () {
          void saveOverride(state, st);
        });
      }
    }
  }

  function renderDetail(state) {
    var empty = $("crm-pt-empty", state.root);
    var detailPanel = $("crm-pt-detail", state.root);
    var entry = state.entry;
    var notice = $("crm-pt-notice", state.root);

    if (!entry || !entry.steps || !entry.steps.length) {
      if (empty) {
        empty.classList.remove("hidden");
        empty.innerHTML =
          "<strong>" +
          esc(t("pipe_no_contact_title")) +
          "</strong>" +
          esc(t("pipe_no_contact_body"));
      }
      if (detailPanel) detailPanel.classList.add("hidden");
      return;
    }

    if (empty) empty.classList.add("hidden");
    if (detailPanel) detailPanel.classList.remove("hidden");

    var ns = entry.nurture_sequence || null;
    var ls = entry.lead_state || {};
    var enrolled = !!state.enrolled && !!ns;
    var pipelineStage =
      ls.pipeline_stage || (state.detail && state.detail.pipeline_stage) || "—";

    if (notice) {
      if (!state.contactFound) {
        notice.classList.remove("hidden");
        notice.textContent = t("pipe_preview_unlinked");
      } else if (!enrolled) {
        notice.classList.remove("hidden");
        notice.textContent = t("pipe_not_enrolled_notice");
      } else {
        notice.classList.add("hidden");
        notice.textContent = "";
      }
    }

    var stageLine = $("crm-pt-stage-line", state.root);
    if (stageLine) {
      var nurtureLabel = enrolled
        ? '<span class="crm-pt-badge ' +
          esc(badgeClass(ns.status)) +
          '">' +
          esc(String(ns.status || "")) +
          "</span>"
        : '<span class="crm-pt-badge completed">' + esc(t("pipe_status_not_enrolled")) + "</span>";
      stageLine.innerHTML =
        esc(t("pipe_pipeline_stage")) +
        ': <strong>' +
        esc(pipelineStage) +
        '</strong> · <span class="crm-pipeline-muted">' +
        esc(t("pipe_nurture")) +
        "</span> " +
        nurtureLabel +
        (enrolled && ns.next_send_at
          ? ' · <span class="crm-pipeline-muted">' +
            esc(t("pipe_next_send")) +
            " " +
            esc(fmtDate(ns.next_send_at)) +
            "</span>"
          : "");
    }

    var steps = entry.steps || [];
    if (state.stepIndex >= steps.length) state.stepIndex = 0;

    var tbody = $("crm-pt-steps-body", state.root);
    if (tbody) {
      tbody.innerHTML = steps
        .map(function (row, idx) {
          var ch = row.channel === "whatsapp" ? "ch-wa" : row.channel === "sms" ? "ch-sms" : "ch-em";
          var active = idx === state.stepIndex ? " crm-pt-row-active" : "";
          var next = row.is_next ? " crm-pt-row-next" : "";
          return (
            '<tr class="crm-pt-step-row' +
            active +
            next +
            '" data-idx="' +
            idx +
            '"><td>' +
            esc(String(row.stageNumber)) +
            "</td><td>" +
            esc(row.name || "") +
            '</td><td><span class="crm-pt-ch-pill ' +
            ch +
            '">' +
            esc(row.channelUi || row.channel || "") +
            "</span></td><td>" +
            esc(fmtDate(row.scheduled_at)) +
            "</td><td>" +
            esc(fmtDate(row.actual_sent_at)) +
            "</td><td>" +
            esc(formatStepStatus(row.status)) +
            (row.detail_reason
              ? ' <span class="crm-pipeline-muted">(' + esc(row.detail_reason) + ")</span>"
              : "") +
            "</td></tr>"
          );
        })
        .join("");
      tbody.querySelectorAll(".crm-pt-step-row").forEach(function (tr) {
        tr.addEventListener("click", function () {
          state.stepIndex = parseInt(tr.getAttribute("data-idx"), 10) || 0;
          tbody.querySelectorAll(".crm-pt-step-row").forEach(function (r) {
            r.classList.remove("crm-pt-row-active");
          });
          tr.classList.add("crm-pt-row-active");
          renderPreview(state);
        });
      });
    }

    var stopped =
      ns &&
      (ns.status === "converted" || ns.status === "opted_out" || ns.status === "completed");
    var pauseBtn = $("crm-pt-pause", state.root);
    var resumeBtn = $("crm-pt-resume", state.root);
    var soldBtn = $("crm-pt-sold", state.root);
    var optBtn = $("crm-pt-optout", state.root);
    var linkBtn = $("crm-pt-link", state.root);
    var enrollBtn = $("crm-pt-enroll", state.root);
    if (pauseBtn) {
      pauseBtn.style.display = enrolled && ns.status === "active" ? "inline-block" : "none";
      pauseBtn.disabled = !enrolled || stopped;
    }
    if (resumeBtn) {
      resumeBtn.style.display = enrolled && ns.status === "paused" ? "inline-block" : "none";
      resumeBtn.disabled = !enrolled || stopped;
    }
    if (soldBtn) soldBtn.disabled = !enrolled || stopped;
    if (optBtn) optBtn.disabled = !enrolled || stopped;
    if (linkBtn) {
      linkBtn.style.display = !state.contactFound && hasLookupHints(state.detail) ? "inline-block" : "none";
      linkBtn.disabled = state.contactFound || !hasLookupHints(state.detail);
    }
    if (enrollBtn) {
      enrollBtn.style.display = state.contactFound && !enrolled ? "inline-block" : "none";
      enrollBtn.disabled = !state.contactFound;
    }

    renderPreview(state);
  }

  function formatStepStatus(status) {
    if (status === "not_enrolled") return t("pipe_status_not_enrolled");
    return status || "";
  }

  async function loadPipeline(state) {
    if (!hasLookupHints(state.detail)) {
      state.entry = { steps: buildLocalTemplateSteps(), contact: null, nurture_sequence: null };
      state.contactFound = false;
      state.enrolled = false;
      state.stepIndex = 0;
      renderDetail(state);
      setFoot(state, t("pipe_add_contact_hint"));
      return;
    }

    setFoot(state, t("pipe_loading"));
    try {
      var data = await api("/api/staff/pipeline" + buildPipelineQuery(state), null, { method: "GET" });
      var leads = (data && data.leads) || [];
      state.contactFound = !!(data && data.contact_found);
      state.enrolled = !!(data && data.enrolled);
      if (data && data.resolved_contact_id) {
        state.contactId = data.resolved_contact_id;
      }

      if (leads.length && leads[0].steps && leads[0].steps.length) {
        state.entry = leads[0];
      } else if (state.contactFound) {
        state.entry = {
          contact: leads[0] && leads[0].contact,
          nurture_sequence: null,
          lead_state: (leads[0] && leads[0].lead_state) || null,
          steps: buildLocalTemplateSteps(),
        };
        state.enrolled = false;
      } else {
        state.entry = {
          contact: null,
          nurture_sequence: null,
          lead_state: null,
          steps: buildLocalTemplateSteps(),
        };
        state.contactFound = false;
        state.enrolled = false;
      }

      state.stepIndex = 0;
      renderDetail(state);
      setFoot(state, "");
    } catch (e) {
      setFoot(state, String((e && e.message) || t("pipe_load_failed")));
    }
  }

  async function linkContactRecord(state) {
    if (!state.leadId) {
      setFoot(state, t("pipe_link_failed"));
      return;
    }
    var btn = $("crm-pt-link", state.root);
    if (btn) btn.disabled = true;
    setFoot(state, t("pipe_linking"));
    try {
      var data = await api(
        "/api/staff/contact-link?leadId=" + encodeURIComponent(String(state.leadId)),
        null,
        { method: "POST" }
      );
      if (data && data.contact_id) {
        state.contactId = String(data.contact_id);
        if (state.detail) {
          state.detail.contact_id = state.contactId;
          state.detail.contacts_contact_id = state.contactId;
        }
      }
      setFoot(state, t("pipe_linked_ok"));
      await loadPipeline(state);
    } catch (e) {
      setFoot(state, String((e && e.message) || t("pipe_link_failed")));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function enrollInNurture(state) {
    if (!state.contactFound) {
      setFoot(state, t("pipe_enroll_need_contact"));
      return;
    }
    var btn = $("crm-pt-enroll", state.root);
    if (btn) btn.disabled = true;
    setFoot(state, t("pipe_enrolling"));
    try {
      await api("/api/staff/nurture-enroll" + buildEnrollQuery(state), null, { method: "POST" });
      setFoot(state, t("pipe_enrolled_ok"));
      await loadPipeline(state);
    } catch (e) {
      setFoot(state, String((e && e.message) || t("pipe_enroll_failed")));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function bindPatch(state, btnId, url) {
    var btn = $(btnId, state.root);
    if (!btn) return;
    btn.addEventListener("click", async function () {
      if (!state.contactId) return;
      try {
        await api(url + "?contactId=" + encodeURIComponent(state.contactId), null, { method: "PATCH" });
        setFoot(state, t("pipe_updated"));
        await loadPipeline(state);
      } catch (e) {
        setFoot(state, String((e && e.message) || t("pipe_action_failed")));
      }
    });
  }

  function wire(state) {
    var refresh = $("crm-pt-refresh", state.root);
    if (refresh) {
      refresh.addEventListener("click", function () {
        void loadPipeline(state);
      });
    }
    var showStopped = $("crm-pt-show-stopped", state.root);
    if (showStopped) {
      showStopped.addEventListener("change", function () {
        void loadPipeline(state);
      });
    }
    bindPatch(state, "crm-pt-pause", "/api/staff/nurture-pause");
    bindPatch(state, "crm-pt-resume", "/api/staff/nurture-resume");
    bindPatch(state, "crm-pt-sold", "/api/staff/nurture-clear-sold");
    bindPatch(state, "crm-pt-optout", "/api/staff/nurture-clear-opt-out");
    var linkBtn = $("crm-pt-link", state.root);
    if (linkBtn) {
      linkBtn.addEventListener("click", function () {
        void linkContactRecord(state);
      });
    }
    var enrollBtn = $("crm-pt-enroll", state.root);
    if (enrollBtn) {
      enrollBtn.addEventListener("click", function () {
        void enrollInNurture(state);
      });
    }
  }

  async function mount(rootEl, opts) {
    if (!rootEl) return;
    var detail = opts.detail || {};
    var contactId = resolveContactId(detail);

    var state = {
      root: rootEl,
      leadId: opts.leadId || detail.id,
      detail: detail,
      contactId: resolveContactId(detail),
      contactFound: false,
      enrolled: false,
      entry: null,
      stepIndex: 0,
    };

    rootEl.innerHTML = shellHtml();
    state.root = rootEl;
    wire(state);
    await loadPipeline(state);
  }

  window.StaffCrmPipeline = { mount: mount, resolveContactId: resolveContactId };
})();
