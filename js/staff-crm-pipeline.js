/**
 * CRM Pipeline tab — per-client CRM nurture sequence (new engine).
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

  function leadSourceTable(detail) {
    return String((detail && detail.source_table) || "unknown").trim();
  }

  function buildPipelineQuery(state) {
    var parts = [];
    if (state.leadId) parts.push("leadId=" + encodeURIComponent(String(state.leadId)));
    if (state.leadSourceTable) {
      parts.push("leadSourceTable=" + encodeURIComponent(state.leadSourceTable));
    }
    var showStopped = $("crm-pt-show-stopped", state.root);
    if (showStopped && showStopped.checked) parts.push("includeStopped=1");
    return parts.length ? "?" + parts.join("&") : "";
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
    if (s === "cancelled") return "opted_out";
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
    if (p.kind === "call" || p.kind === "system") {
      wrap.innerHTML =
        '<p class="crm-pipeline-preview-hint"><strong>' +
        esc(st.name || "") +
        '</strong></p><p class="crm-pipeline-preview-hint">' +
        esc(p.description || p.note || "") +
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
      wrap.innerHTML =
        '<label for="crm-pt-email-subj">' +
        esc(t("pipe_subject")) +
        '</label><input id="crm-pt-email-subj" type="text" readonly value="' +
        esc(p.subject || "") +
        '" /><label for="crm-pt-email-body" style="margin-top:10px;display:block">' +
        esc(t("pipe_body_html")) +
        '</label><textarea id="crm-pt-email-body" rows="14" readonly>' +
        esc(p.body || "") +
        "</textarea>";
    }
  }

  function formatStepStatus(status) {
    if (status === "not_enrolled") return t("pipe_status_not_enrolled");
    if (status === "upcoming") return t("pipe_status_upcoming");
    if (status === "missed") return t("pipe_status_missed");
    return status || "";
  }

  function channelClass(channel) {
    var ch = String(channel || "").toLowerCase();
    if (ch === "sms") return "ch-sms";
    if (ch === "email") return "ch-em";
    if (ch === "call") return "ch-call";
    return "ch-sys";
  }

  function renderDetail(state) {
    var empty = $("crm-pt-empty", state.root);
    var detailPanel = $("crm-pt-detail", state.root);
    var entry = state.entry;
    var notice = $("crm-pt-notice", state.root);

    if (!state.leadId) {
      if (empty) {
        empty.classList.remove("hidden");
        empty.innerHTML =
          "<strong>" + esc(t("pipe_no_lead_title")) + "</strong>" + esc(t("pipe_no_lead_body"));
      }
      if (detailPanel) detailPanel.classList.add("hidden");
      return;
    }

    if (!entry || !entry.steps || !entry.steps.length) {
      if (empty) {
        empty.classList.remove("hidden");
        empty.innerHTML =
          "<strong>" +
          esc(t("pipe_no_enrollment_title")) +
          "</strong>" +
          esc(t("pipe_no_enrollment_body"));
      }
      if (detailPanel) detailPanel.classList.add("hidden");
      return;
    }

    if (empty) empty.classList.add("hidden");
    if (detailPanel) detailPanel.classList.remove("hidden");

    var ns = entry.nurture_enrollment || null;
    var enrolled = !!state.enrolled && !!ns;
    var pipelineStage =
      entry.pipeline_stage || (state.detail && state.detail.pipeline_stage) || "—";

    if (notice) {
      if (!enrolled) {
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
      var seqLabel = entry.sequence_label
        ? ' · <span class="crm-pipeline-muted">' + esc(entry.sequence_label) + "</span>"
        : "";
      var entryLabel =
        enrolled && (entry.crm_entry_at || (ns && ns.enrolled_at))
          ? ' · <span class="crm-pipeline-muted">' +
            esc(t("pipe_crm_entry")) +
            " " +
            esc(fmtDate(entry.crm_entry_at || ns.enrolled_at)) +
            "</span>"
          : "";
      stageLine.innerHTML =
        esc(t("pipe_pipeline_stage")) +
        ': <strong>' +
        esc(pipelineStage) +
        '</strong> · <span class="crm-pipeline-muted">' +
        esc(t("pipe_nurture")) +
        "</span> " +
        nurtureLabel +
        seqLabel +
        entryLabel +
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
          var ch = channelClass(row.channel);
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
            (row.phase_label
              ? '<span class="crm-pipeline-muted small">' + esc(row.phase_label) + " · </span>"
              : "") +
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
      ns && (ns.status === "cancelled" || ns.status === "completed");
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
    if (linkBtn) linkBtn.style.display = "none";
    if (enrollBtn) {
      var canEnroll = !enrolled && !!state.canEnroll;
      enrollBtn.style.display = canEnroll ? "inline-block" : "none";
      enrollBtn.disabled = !canEnroll;
    }

    renderPreview(state);
  }

  async function loadPipeline(state) {
    if (!state.leadId) {
      state.entry = null;
      state.enrolled = false;
      renderDetail(state);
      return;
    }

    setFoot(state, t("pipe_loading"));
    try {
      var data = await api("/api/staff/nurture-pipeline" + buildPipelineQuery(state), null, {
        method: "GET",
      });
      state.enrolled = !!(data && data.enrolled);
      state.canEnroll = !!(data && data.can_enroll);
      if (data && data.contact_id) state.contactId = data.contact_id;
      state.entry = {
        pipeline_stage: data.pipeline_stage,
        sequence_label: data.sequence_label,
        nurture_enrollment: data.nurture_enrollment,
        crm_entry_at: data.crm_entry_at,
        steps: (data && data.steps) || [],
      };
      state.stepIndex = 0;
      renderDetail(state);
      setFoot(state, "");
    } catch (e) {
      setFoot(state, String((e && e.message) || t("pipe_load_failed")));
    }
  }

  async function enrollInNurture(state) {
    var btn = $("crm-pt-enroll", state.root);
    if (btn) btn.disabled = true;
    setFoot(state, t("pipe_enrolling"));
    try {
      await api("/api/staff/nurture-pipeline" + buildPipelineQuery(state), null, { method: "POST" });
      setFoot(state, t("pipe_enrolled_ok"));
      await loadPipeline(state);
    } catch (e) {
      setFoot(state, String((e && e.message) || t("pipe_enroll_failed")));
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function bindAction(state, btnId, action) {
    var btn = $(btnId, state.root);
    if (!btn) return;
    btn.addEventListener("click", async function () {
      if (!state.leadId) return;
      try {
        var qs = buildPipelineQuery(state);
        var sep = qs.indexOf("?") >= 0 ? "&" : "?";
        await api(
          "/api/staff/nurture-pipeline" + qs + sep + "action=" + encodeURIComponent(action),
          null,
          { method: "PATCH" }
        );
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
    bindAction(state, "crm-pt-pause", "pause");
    bindAction(state, "crm-pt-resume", "resume");
    bindAction(state, "crm-pt-sold", "sold");
    bindAction(state, "crm-pt-optout", "opt_out");
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

    var state = {
      root: rootEl,
      leadId: opts.leadId || detail.id,
      leadSourceTable: leadSourceTable(detail),
      detail: detail,
      contactId: resolveContactId(detail),
      enrolled: false,
      canEnroll: false,
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
