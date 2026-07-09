/**
 * CRM Licensing — state licenses, agency license, training, documents.
 */
(function () {
  "use strict";

  var data = { summary: null, states: [], agency: null, training: [], documents: [] };
  var ui = { tab: "overview", selectedStateId: "", statusMsg: "", editingState: false, editingAgency: false };

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  function api(path, body, opts) {
    if (!window.StaffCrm || !window.StaffCrm.authedApi) throw new Error("StaffCrm not ready");
    return window.StaffCrm.authedApi(path, body, opts);
  }

  function $(id, root) {
    return (root || document).querySelector("#" + id);
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
    if (isNaN(d.getTime())) return "—";
    var lang = window.StaffCrmI18n ? window.StaffCrmI18n.getLang() : "en";
    return d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function normState(s) {
    return String(s || "")
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 2);
  }

  function navigateTab(tab) {
    if (window.StaffCrm && window.StaffCrm.navigate) {
      window.StaffCrm.navigate("#/licensing/" + tab);
    } else {
      location.hash = "#/licensing/" + tab;
    }
  }

  function docsFor(parentType, parentId) {
    return (data.documents || []).filter(function (d) {
      return d.parent_type === parentType && String(d.parent_id) === String(parentId);
    });
  }

  function statusBadge(kind, row) {
    if (kind === "state") {
      if (row.expired) return '<span class="crm-lic-badge crm-lic-badge-danger">' + esc(t("lic_status_expired")) + "</span>";
      if (row.expiring_soon)
        return '<span class="crm-lic-badge crm-lic-badge-warn">' + esc(t("lic_expiring_soon")) + "</span>";
    }
    if (kind === "training" && row.overdue) {
      return '<span class="crm-lic-badge crm-lic-badge-danger">' + esc(t("lic_overdue")) + "</span>";
    }
    var st = row.display_status || row.status || "";
    return '<span class="crm-lic-badge">' + esc(st) + "</span>";
  }

  function renderSubtabs(activeTab) {
    var tabs = [
      { id: "overview", label: t("lic_tab_overview") },
      { id: "states", label: t("lic_tab_states") },
      { id: "agency", label: t("lic_tab_agency") },
      { id: "training", label: t("lic_tab_training") },
    ];
    return (
      '<div class="crm-lic-subtabs" role="tablist">' +
      tabs
        .map(function (tab) {
          return (
            '<button type="button" class="crm-lic-subtab' +
            (tab.id === activeTab ? " active" : "") +
            '" data-lic-tab="' +
            esc(tab.id) +
            '">' +
            esc(tab.label) +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderOverview() {
    var s = data.summary || {};
    return (
      '<div class="crm-lic-panel" id="crm-lic-panel-overview">' +
      '<div class="crm-lic-stats">' +
      '<div class="crm-lic-stat"><div class="crm-lic-stat-val">' +
      esc(String(s.state_count || 0)) +
      '</div><div class="crm-lic-stat-label">' +
      esc(t("lic_stat_states")) +
      "</div></div>" +
      '<div class="crm-lic-stat"><div class="crm-lic-stat-val crm-lic-stat-warn">' +
      esc(String(s.states_expiring_60 || 0)) +
      '</div><div class="crm-lic-stat-label">' +
      esc(t("lic_stat_expiring_60")) +
      "</div></div>" +
      '<div class="crm-lic-stat"><div class="crm-lic-stat-val crm-lic-stat-danger">' +
      esc(String(s.states_expired || 0)) +
      '</div><div class="crm-lic-stat-label">' +
      esc(t("lic_stat_expired")) +
      "</div></div>" +
      '<div class="crm-lic-stat"><div class="crm-lic-stat-val">' +
      esc(String(s.training_due_30 || 0)) +
      '</div><div class="crm-lic-stat-label">' +
      esc(t("lic_stat_training_30")) +
      "</div></div>" +
      '<div class="crm-lic-stat"><div class="crm-lic-stat-val crm-lic-stat-danger">' +
      esc(String(s.training_overdue || 0)) +
      '</div><div class="crm-lic-stat-label">' +
      esc(t("lic_stat_training_overdue")) +
      "</div></div>" +
      "</div>" +
      '<p class="crm-lic-note">' +
      esc(t("lic_overview_blurb")) +
      "</p>" +
      '<div class="crm-lic-card"><h3>' +
      esc(t("lic_upcoming_title")) +
      "</h3>" +
      renderUpcomingList() +
      "</div></div>"
    );
  }

  function renderUpcomingList() {
    var items = [];
    (data.states || []).forEach(function (st) {
      if (st.expiration_date && (st.expiring_soon || st.expired)) {
        items.push({
          sort: st.expiration_date,
          line:
            esc(st.state_code) +
            " — " +
            esc(t("lic_expires")) +
            " " +
            esc(fmtDate(st.expiration_date)) +
            " " +
            statusBadge("state", st),
        });
      }
    });
    (data.training || []).forEach(function (tr) {
      if (tr.due_date && tr.status !== "completed" && tr.status !== "waived") {
        items.push({
          sort: tr.due_date,
          line: esc(tr.title) + " — " + esc(t("lic_due")) + " " + esc(fmtDate(tr.due_date)) + " " + statusBadge("training", tr),
        });
      }
    });
    items.sort(function (a, b) {
      return String(a.sort).localeCompare(String(b.sort));
    });
    if (!items.length) return '<p class="crm-lic-muted">' + esc(t("lic_nothing_due")) + "</p>";
    return "<ul class=\"crm-lic-upcoming\">" + items.map(function (x) {
      return "<li>" + x.line + "</li>";
    }).join("") + "</ul>";
  }

  function stateOptions(selected) {
    var states = window.MVS_US_STATES || [];
    return states
      .map(function (st) {
        var code = st.c || st.code || st.abbr || "";
        var name = st.n || st.name || code;
        return (
          '<option value="' +
          esc(code) +
          '"' +
          (code === selected ? " selected" : "") +
          ">" +
          esc(code + " — " + name) +
          "</option>"
        );
      })
      .join("");
  }

  function stateName(code) {
    var states = window.MVS_US_STATES || [];
    var hit = states.find(function (s) {
      return (s.c || s.code || s.abbr) === code;
    });
    return hit ? hit.n || hit.name || code : code || "—";
  }

  function licenseTypeLabel(type) {
    var map = {
      resident: t("lic_type_resident"),
      non_resident: t("lic_type_non_resident"),
      temporary: t("lic_type_temporary"),
      other: t("lic_type_other"),
    };
    return map[type] || type || "—";
  }

  function displayVal(value) {
    return value == null || value === "" ? "—" : String(value);
  }

  function fieldView(label, value, span, opts) {
    opts = opts || {};
    var raw = displayVal(value);
    var inner;
    if (raw === "—") {
      inner = esc("—");
    } else if (opts.link) {
      inner =
        '<a href="' +
        esc(opts.link) +
        '" target="_blank" rel="noopener">' +
        esc(raw) +
        "</a>";
    } else {
      inner = esc(raw);
    }
    return fieldWrap(
      '<span class="crm-lic-label">' + esc(label) + '</span><div class="crm-lic-value">' + inner + "</div>",
      span
    );
  }

  function fieldViewDate(label, iso, span) {
    return fieldView(label, iso ? fmtDate(iso) : "", span);
  }

  function renderStateView(row) {
    var id = row.id || "";
    return (
      '<div class="crm-lic-view" data-lic-state-view="' +
      esc(id) +
      '">' +
      '<div class="crm-lic-form-grid">' +
      fieldView(t("lic_col_state"), row.state_code + " — " + stateName(row.state_code)) +
      fieldView(t("lic_col_number"), row.license_number) +
      fieldView(t("lic_col_type"), licenseTypeLabel(row.license_type)) +
      fieldView(t("lic_col_status"), row.status) +
      fieldView(t("lic_col_loa"), (row.lines_of_authority || []).join(", "), "full") +
      fieldViewDate(t("lic_col_effective"), row.effective_date) +
      fieldViewDate(t("lic_col_expiration"), row.expiration_date) +
      fieldViewDate(t("lic_col_renewal"), row.renewal_due_date) +
      fieldView(t("lic_col_verify_url"), row.verify_url, "full", { link: row.verify_url }) +
      "</div>" +
      fieldView(t("lic_col_notes"), row.notes, "full") +
      (id ? renderDocSection("state", id, false) : "") +
      '<div class="crm-lic-form-actions">' +
      '<button type="button" class="crm-btn secondary" data-lic-edit-state="' +
      esc(id) +
      '">' +
      esc(t("lic_edit")) +
      "</button>" +
      "</div></div>"
    );
  }

  function renderStateForm(row, isNew) {
    row = row || {};
    var id = row.id || "";
    return (
      '<form class="crm-lic-form" data-lic-state-form="' +
      esc(id || "new") +
      '">' +
      '<div class="crm-lic-form-grid">' +
      fieldSelect(t("lic_col_state"), "lic-st-state", stateOptions(row.state_code || "NE"), isNew) +
      fieldInput(t("lic_col_number"), "lic-st-number", row.license_number || "") +
      fieldSelect(
        t("lic_col_type"),
        "lic-st-type",
        [
          { v: "resident", l: t("lic_type_resident") },
          { v: "non_resident", l: t("lic_type_non_resident") },
          { v: "temporary", l: t("lic_type_temporary") },
          { v: "other", l: t("lic_type_other") },
        ]
          .map(function (o) {
            return (
              '<option value="' +
              esc(o.v) +
              '"' +
              ((row.license_type || "non_resident") === o.v ? " selected" : "") +
              ">" +
              esc(o.l) +
              "</option>"
            );
          })
          .join(""),
        false
      ) +
      fieldSelect(
        t("lic_col_status"),
        "lic-st-status",
        ["active", "pending", "expired", "inactive", "suspended"]
          .map(function (v) {
            return (
              '<option value="' +
              v +
              '"' +
              ((row.status || "active") === v ? " selected" : "") +
              ">" +
              esc(v) +
              "</option>"
            );
          })
          .join(""),
        false
      ) +
      fieldInput(t("lic_col_loa"), "lic-st-loa", (row.lines_of_authority || []).join(", "), "text", "full") +
      fieldInput(t("lic_col_effective"), "lic-st-effective", row.effective_date || "", "date") +
      fieldInput(t("lic_col_expiration"), "lic-st-expiration", row.expiration_date || "", "date") +
      fieldInput(t("lic_col_renewal"), "lic-st-renewal", row.renewal_due_date || "", "date") +
      fieldInput(t("lic_col_verify_url"), "lic-st-verify", row.verify_url || "", "url", "full") +
      "</div>" +
      fieldTextarea(t("lic_col_notes"), "lic-st-notes", row.notes || "", 4) +
      (id ? renderDocSection("state", id, true) : "") +
      '<div class="crm-lic-form-actions">' +
      '<button type="submit" class="crm-btn">' +
      esc(isNew ? t("lic_add_state") : t("ov_save")) +
      "</button>" +
      (isNew
        ? '<button type="button" class="crm-btn secondary" data-lic-cancel-state="new">' +
          esc(t("lic_cancel")) +
          "</button>"
        : '<button type="button" class="crm-btn secondary" data-lic-cancel-state="' +
          esc(id) +
          '">' +
          esc(t("lic_cancel")) +
          "</button>") +
      (id
        ? '<button type="button" class="crm-btn secondary crm-lic-delete-state" data-id="' +
          esc(id) +
          '">' +
          esc(t("lic_delete")) +
          "</button>"
        : "") +
      "</div></form>"
    );
  }

  function fieldWrap(innerHtml, span) {
    var cls = "crm-lic-field";
    if (span === "full") cls += " crm-lic-field--full";
    return '<div class="' + cls + '">' + innerHtml + "</div>";
  }

  function fieldInput(label, id, value, type, span) {
    type = type || "text";
    return fieldWrap(
      '<label class="crm-lic-label" for="' +
        id +
        '">' +
        esc(label) +
        '</label><input class="crm-input" type="' +
        esc(type) +
        '" id="' +
        id +
        '" value="' +
        esc(value == null ? "" : value) +
        '" />',
      span
    );
  }

  function fieldSelect(label, id, optionsHtml, disabled, span) {
    return fieldWrap(
      '<label class="crm-lic-label" for="' +
        id +
        '">' +
        esc(label) +
        '</label><select class="crm-input" id="' +
        id +
        '"' +
        (disabled ? " disabled" : "") +
        ">" +
        optionsHtml +
        "</select>",
      span
    );
  }

  function fieldTextarea(label, id, value, rows, span) {
    rows = rows || 3;
    return fieldWrap(
      '<label class="crm-lic-label" for="' +
        id +
        '">' +
        esc(label) +
        '</label><textarea class="crm-lic-textarea" id="' +
        id +
        '" rows="' +
        rows +
        '">' +
        esc(value == null ? "" : value) +
        "</textarea>",
      span || "full"
    );
  }

  function renderDocSection(parentType, parentId, editable) {
    var docs = docsFor(parentType, parentId);
    var html =
      '<div class="crm-lic-docs"><h4>' +
      esc(t("lic_documents")) +
      "</h4>";
    if (!docs.length) {
      html += '<p class="crm-lic-muted">' + esc(t("lic_no_documents")) + "</p>";
    } else {
      html +=
        '<ul class="crm-lic-doc-list">' +
        docs
          .map(function (d) {
            return (
              "<li><button type=\"button\" class=\"crm-lic-doc-open\" data-doc-id=\"" +
              esc(d.id) +
              '" data-doc-filename="' +
              esc(d.filename) +
              '" data-doc-type="' +
              esc(d.content_type || "") +
              '">' +
              esc(d.filename) +
              '</button> <span class="crm-lic-muted">(' +
              esc(fmtDate(d.uploaded_at)) +
              ")</span>" +
              (editable
                ? ' <button type="button" class="crm-lic-doc-del" data-doc-id="' +
                  esc(d.id) +
                  '">×</button>'
                : "") +
              "</li>"
            );
          })
          .join("") +
        "</ul>";
    }
    if (editable) {
      html +=
        '<label class="crm-lic-label">' +
        esc(t("lic_upload")) +
        '</label><input type="file" class="crm-lic-file" accept=".pdf,image/jpeg,image/png,image/webp" data-parent-type="' +
        esc(parentType) +
        '" data-parent-id="' +
        esc(parentId) +
        '" />';
    }
    html += "</div>";
    return html;
  }

  function renderStatesPanel() {
    var rows = data.states || [];
    var selected = rows.find(function (r) {
      return String(r.id) === String(ui.selectedStateId);
    });
    return (
      '<div class="crm-lic-panel" id="crm-lic-panel-states">' +
      '<div class="crm-lic-split">' +
      '<div class="crm-lic-list-col">' +
      '<div class="crm-lic-list-head"><strong>' +
      esc(t("lic_tab_states")) +
      '</strong><button type="button" class="crm-btn secondary" id="lic-add-state-btn">' +
      esc(t("lic_add_state")) +
      "</button></div>" +
      '<div class="crm-lic-list">' +
      rows
        .map(function (r) {
          var active = String(r.id) === String(ui.selectedStateId) ? " active" : "";
          return (
            '<button type="button" class="crm-lic-list-item' +
            active +
            '" data-state-id="' +
            esc(r.id) +
            '"><span class="crm-lic-list-title">' +
            esc(r.state_code) +
            " · " +
            esc(r.license_type) +
            "</span>" +
            statusBadge("state", r) +
            '<span class="crm-lic-list-sub">' +
            esc(r.license_number || "—") +
            " · " +
            esc(t("lic_expires")) +
            " " +
            esc(fmtDate(r.expiration_date)) +
            "</span></button>"
          );
        })
        .join("") +
      (rows.length ? "" : '<p class="crm-lic-muted">' + esc(t("lic_no_states")) + "</p>") +
      "</div></div>" +
      '<div class="crm-lic-detail-col" id="crm-lic-state-detail">' +
      (ui.selectedStateId === "__new__"
        ? "<h3>" + esc(t("lic_add_state")) + "</h3>" + renderStateForm(null, true)
        : selected
          ? "<h3>" + esc(selected.state_code) + "</h3>" +
            (ui.editingState ? renderStateForm(selected, false) : renderStateView(selected))
          : '<p class="crm-lic-muted">' + esc(t("lic_select_state")) + "</p>") +
      "</div></div></div>"
    );
  }

  function renderAgencyView(a) {
    return (
      '<div class="crm-lic-view" id="crm-lic-agency-view">' +
      '<div class="crm-lic-form-grid">' +
      fieldView(t("lic_agency_entity"), a.entity_name, "full") +
      fieldView(t("lic_col_number"), a.license_number) +
      fieldView(t("lic_col_state"), a.state_code) +
      fieldView(t("lic_col_status"), a.status) +
      fieldViewDate(t("lic_col_effective"), a.effective_date) +
      fieldViewDate(t("lic_col_expiration"), a.expiration_date) +
      fieldViewDate(t("lic_col_renewal"), a.renewal_due_date) +
      fieldView(t("lic_agency_registered_agent"), a.registered_agent, "full") +
      fieldView(t("lic_agency_address"), a.business_address, "full") +
      fieldView(t("lic_col_verify_url"), a.verify_url, "full", { link: a.verify_url }) +
      "</div>" +
      fieldView(t("lic_col_notes"), a.notes, "full") +
      (a.id ? renderDocSection("agency", a.id, false) : "") +
      '<div class="crm-lic-form-actions">' +
      '<button type="button" class="crm-btn secondary" id="lic-edit-agency-btn">' +
      esc(t("lic_edit")) +
      "</button></div></div>"
    );
  }

  function renderAgencyForm(a) {
    a = a || {};
    return (
      '<form class="crm-lic-form" id="crm-lic-agency-form">' +
      '<div class="crm-lic-form-grid">' +
      fieldInput(t("lic_agency_entity"), "lic-ag-entity", a.entity_name || "Mejor Vida Insurance LLC", "text", "full") +
      fieldInput(t("lic_col_number"), "lic-ag-number", a.license_number || "") +
      fieldInput(t("lic_col_state"), "lic-ag-state", a.state_code || "NE") +
      fieldSelect(
        t("lic_col_status"),
        "lic-ag-status",
        ["active", "pending", "expired", "inactive"]
          .map(function (v) {
            return (
              '<option value="' +
              v +
              '"' +
              ((a.status || "active") === v ? " selected" : "") +
              ">" +
              esc(v) +
              "</option>"
            );
          })
          .join(""),
        false
      ) +
      fieldInput(t("lic_col_effective"), "lic-ag-effective", a.effective_date || "", "date") +
      fieldInput(t("lic_col_expiration"), "lic-ag-expiration", a.expiration_date || "", "date") +
      fieldInput(t("lic_col_renewal"), "lic-ag-renewal", a.renewal_due_date || "", "date") +
      fieldInput(t("lic_agency_registered_agent"), "lic-ag-agent", a.registered_agent || "", "text", "full") +
      fieldInput(t("lic_agency_address"), "lic-ag-address", a.business_address || "", "text", "full") +
      fieldInput(t("lic_col_verify_url"), "lic-ag-verify", a.verify_url || "", "url", "full") +
      "</div>" +
      fieldTextarea(t("lic_col_notes"), "lic-ag-notes", a.notes || "", 4) +
      (a.id ? renderDocSection("agency", a.id, true) : "") +
      '<div class="crm-lic-form-actions"><button type="submit" class="crm-btn">' +
      esc(t("ov_save")) +
      '</button><button type="button" class="crm-btn secondary" id="lic-cancel-agency-btn">' +
      esc(t("lic_cancel")) +
      "</button></div>" +
      '<input type="hidden" id="lic-ag-id" value="' +
      esc(a.id || "") +
      '" />' +
      "</form>"
    );
  }

  function renderAgencyPanel() {
    var a = data.agency || {};
    return (
      '<div class="crm-lic-panel" id="crm-lic-panel-agency">' +
      '<div class="crm-lic-card"><h3>' +
      esc(t("lic_tab_agency")) +
      "</h3>" +
      (ui.editingAgency ? renderAgencyForm(a) : renderAgencyView(a)) +
      "</div></div>"
    );
  }

  function renderTrainingPanel() {
    var rows = data.training || [];
    return (
      '<div class="crm-lic-panel" id="crm-lic-panel-training">' +
      '<div class="crm-lic-card">' +
      '<div class="crm-lic-list-head"><strong>' +
      esc(t("lic_tab_training")) +
      '</strong><button type="button" class="crm-btn secondary" id="lic-add-training-btn">' +
      esc(t("lic_add_training")) +
      "</button></div>" +
      '<div class="crm-lic-table-wrap"><table class="crm-lic-table"><thead><tr>' +
      "<th>" +
      esc(t("lic_train_title")) +
      "</th><th>" +
      esc(t("lic_train_category")) +
      "</th><th>" +
      esc(t("lic_due")) +
      "</th><th>" +
      esc(t("lic_col_status")) +
      "</th><th></th>" +
      "</tr></thead><tbody>" +
      rows
        .map(function (r) {
          return (
            "<tr><td>" +
            esc(r.title) +
            "</td><td>" +
            esc(r.category) +
            "</td><td>" +
            esc(fmtDate(r.due_date)) +
            "</td><td>" +
            statusBadge("training", r) +
            '</td><td><button type="button" class="crm-btn secondary crm-lic-edit-training" data-id="' +
            esc(r.id) +
            '">' +
            esc(t("lic_edit")) +
            "</button></td></tr>"
          );
        })
        .join("") +
      (rows.length ? "" : '<tr><td colspan="5" class="crm-lic-muted">' + esc(t("lic_no_training")) + "</td></tr>") +
      "</tbody></table></div>" +
      '<div id="crm-lic-training-form-wrap" class="hidden"></div>' +
      "</div></div>"
    );
  }

  function renderTrainingForm(row) {
    row = row || {};
    return (
      '<form class="crm-lic-form crm-lic-training-form" style="margin-top:16px">' +
      '<h4>' +
      esc(row.id ? t("lic_edit_training") : t("lic_add_training")) +
      "</h4>" +
      '<div class="crm-lic-form-grid">' +
      fieldInput(t("lic_train_title"), "lic-tr-title", row.title || "", "text", "full") +
      fieldSelect(
        t("lic_train_category"),
        "lic-tr-cat",
        ["ce", "product", "aml", "compliance", "other"]
          .map(function (v) {
            return (
              '<option value="' +
              v +
              '"' +
              ((row.category || "ce") === v ? " selected" : "") +
              ">" +
              esc(v) +
              "</option>"
            );
          })
          .join(""),
        false
      ) +
      fieldInput(t("lic_train_provider"), "lic-tr-provider", row.provider || "") +
      fieldInput(t("lic_col_state"), "lic-tr-state", row.state_code || "") +
      fieldInput(t("lic_due"), "lic-tr-due", row.due_date || "", "date") +
      fieldInput(t("lic_completed"), "lic-tr-completed", row.completed_date || "", "date") +
      fieldInput(t("lic_hours_required"), "lic-tr-hrs-req", row.hours_required != null ? String(row.hours_required) : "", "number") +
      fieldInput(t("lic_hours_done"), "lic-tr-hrs-done", row.hours_completed != null ? String(row.hours_completed) : "", "number") +
      fieldSelect(
        t("lic_col_status"),
        "lic-tr-status",
        ["pending", "completed", "overdue", "waived"]
          .map(function (v) {
            return (
              '<option value="' +
              v +
              '"' +
              ((row.status || "pending") === v ? " selected" : "") +
              ">" +
              esc(v) +
              "</option>"
            );
          })
          .join(""),
        false
      ) +
      "</div>" +
      fieldTextarea(t("lic_col_notes"), "lic-tr-notes", row.notes || "", 3) +
      '<input type="hidden" id="lic-tr-id" value="' +
      esc(row.id || "") +
      '" />' +
      '<div class="crm-lic-form-actions">' +
      '<button type="submit" class="crm-btn">' +
      esc(t("ov_save")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="lic-tr-cancel">' +
      esc(t("lic_cancel")) +
      "</button>" +
      (row.id
        ? '<button type="button" class="crm-btn secondary" id="lic-tr-delete">' +
          esc(t("lic_delete")) +
          "</button>"
        : "") +
      "</div></form>"
    );
  }

  function renderShell() {
    return (
      '<div class="crm-lic-shell">' +
      '<h1 class="crm-lic-page-title">' +
      esc(t("licensing_title")) +
      "</h1>" +
      '<p class="crm-lic-page-sub">' +
      esc(t("licensing_sub")) +
      "</p>" +
      renderSubtabs(ui.tab) +
      '<p id="crm-lic-status" class="crm-lic-status" aria-live="polite">' +
      esc(ui.statusMsg || "") +
      "</p>" +
      renderOverview() +
      renderStatesPanel() +
      renderAgencyPanel() +
      renderTrainingPanel() +
      "</div>"
    );
  }

  function showTab(tab) {
    ui.tab = tab;
    document.querySelectorAll(".crm-lic-subtab").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lic-tab") === tab);
    });
    document.querySelectorAll(".crm-lic-panel").forEach(function (panel) {
      var id = panel.id || "";
      var show =
        (tab === "overview" && id === "crm-lic-panel-overview") ||
        (tab === "states" && id === "crm-lic-panel-states") ||
        (tab === "agency" && id === "crm-lic-panel-agency") ||
        (tab === "training" && id === "crm-lic-panel-training");
      panel.classList.toggle("hidden", !show);
    });
  }

  function setStatus(msg) {
    ui.statusMsg = msg || "";
    var el = $("crm-lic-status");
    if (el) el.textContent = ui.statusMsg;
  }

  async function loadData() {
    var payload = await api("/api/staff/licensing", null, { method: "GET" });
    data.summary = payload.summary || {};
    data.states = payload.states || [];
    data.agency = payload.agency || null;
    data.training = payload.training || [];
    data.documents = payload.documents || [];
  }

  function readStateForm(root) {
    var loa = ($("lic-st-loa", root) && $("lic-st-loa", root).value) || "";
    return {
      state_code: $("lic-st-state", root) ? $("lic-st-state", root).value : "",
      license_number: $("lic-st-number", root) ? $("lic-st-number", root).value : "",
      license_type: $("lic-st-type", root) ? $("lic-st-type", root).value : "non_resident",
      status: $("lic-st-status", root) ? $("lic-st-status", root).value : "active",
      lines_of_authority: loa
        .split(",")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean),
      effective_date: $("lic-st-effective", root) ? $("lic-st-effective", root).value : "",
      expiration_date: $("lic-st-expiration", root) ? $("lic-st-expiration", root).value : "",
      renewal_due_date: $("lic-st-renewal", root) ? $("lic-st-renewal", root).value : "",
      verify_url: $("lic-st-verify", root) ? $("lic-st-verify", root).value : "",
      notes: $("lic-st-notes", root) ? $("lic-st-notes", root).value : "",
    };
  }

  async function saveState(form, id, isNew) {
    var body = readStateForm(form);
    setStatus(t("ov_status_saving"));
    if (isNew) {
      await api("/api/staff/licensing?type=state", body, { method: "POST" });
      ui.selectedStateId = "";
    } else {
      await api("/api/staff/licensing?type=state&id=" + encodeURIComponent(id), body, { method: "PATCH" });
    }
    ui.editingState = false;
    await reload(mainEl);
    setStatus(t("ov_status_saved"));
  }

  async function saveAgency() {
    var body = {
      entity_name: $("lic-ag-entity") ? $("lic-ag-entity").value : "",
      license_number: $("lic-ag-number") ? $("lic-ag-number").value : "",
      state_code: $("lic-ag-state") ? $("lic-ag-state").value : "NE",
      status: $("lic-ag-status") ? $("lic-ag-status").value : "active",
      effective_date: $("lic-ag-effective") ? $("lic-ag-effective").value : "",
      expiration_date: $("lic-ag-expiration") ? $("lic-ag-expiration").value : "",
      renewal_due_date: $("lic-ag-renewal") ? $("lic-ag-renewal").value : "",
      registered_agent: $("lic-ag-agent") ? $("lic-ag-agent").value : "",
      business_address: $("lic-ag-address") ? $("lic-ag-address").value : "",
      verify_url: $("lic-ag-verify") ? $("lic-ag-verify").value : "",
      notes: $("lic-ag-notes") ? $("lic-ag-notes").value : "",
    };
    setStatus(t("ov_status_saving"));
    await api("/api/staff/licensing?type=agency", body, { method: "POST" });
    ui.editingAgency = false;
    await reload(mainEl);
    setStatus(t("ov_status_saved"));
  }

  async function saveTraining(form) {
    var id = $("lic-tr-id", form) ? $("lic-tr-id", form).value : "";
    var body = {
      title: $("lic-tr-title", form) ? $("lic-tr-title", form).value : "",
      category: $("lic-tr-cat", form) ? $("lic-tr-cat", form).value : "ce",
      provider: $("lic-tr-provider", form) ? $("lic-tr-provider", form).value : "",
      state_code: $("lic-tr-state", form) ? $("lic-tr-state", form).value : "",
      due_date: $("lic-tr-due", form) ? $("lic-tr-due", form).value : "",
      completed_date: $("lic-tr-completed", form) ? $("lic-tr-completed", form).value : "",
      hours_required: $("lic-tr-hrs-req", form) ? $("lic-tr-hrs-req", form).value : "",
      hours_completed: $("lic-tr-hrs-done", form) ? $("lic-tr-hrs-done", form).value : "",
      status: $("lic-tr-status", form) ? $("lic-tr-status", form).value : "pending",
      notes: $("lic-tr-notes", form) ? $("lic-tr-notes", form).value : "",
    };
    setStatus(t("ov_status_saving"));
    if (id) {
      await api("/api/staff/licensing?type=training&id=" + encodeURIComponent(id), body, { method: "PATCH" });
    } else {
      await api("/api/staff/licensing?type=training", body, { method: "POST" });
    }
    await reload(mainEl);
    setStatus(t("ov_status_saved"));
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result || "");
        var idx = result.indexOf(",");
        resolve(idx >= 0 ? result.slice(idx + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function uploadDocument(input) {
    var file = input.files && input.files[0];
    if (!file) return;
    var parentType = input.getAttribute("data-parent-type");
    var parentId = input.getAttribute("data-parent-id");
    setStatus(t("lic_uploading"));
    var b64 = await fileToBase64(file);
    await api("/api/staff/licensing?type=document", {
      parent_type: parentType,
      parent_id: parentId,
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      data_base64: b64,
    }, { method: "POST" });
    await reload(mainEl);
    setStatus(t("lic_upload_done"));
  }

  function payloadToBlob(payload) {
    var bin = atob(payload.data_base64 || "");
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var contentType = payload.content_type || "application/octet-stream";
    var blob = new Blob([bytes], { type: contentType });
    return {
      blob: blob,
      url: URL.createObjectURL(blob),
      filename: payload.filename || "license-document",
      contentType: contentType,
      viewable: /^application\/pdf$/i.test(contentType) || /^image\//i.test(contentType),
    };
  }

  function triggerDownload(file) {
    var a = document.createElement("a");
    a.href = file.url;
    a.download = file.filename;
    a.click();
  }

  var docModalsReady = false;
  var docViewerUrl = "";
  var pendingDocFile = null;

  function revokeDocViewerUrl() {
    if (docViewerUrl) {
      URL.revokeObjectURL(docViewerUrl);
      docViewerUrl = "";
    }
  }

  function closeDocActionModal() {
    var el = document.getElementById("crm-lic-doc-action-modal");
    if (el) el.classList.add("hidden");
    pendingDocFile = null;
  }

  function closeDocViewerModal() {
    var el = document.getElementById("crm-lic-doc-viewer-modal");
    if (el) el.classList.add("hidden");
    var body = document.getElementById("crm-lic-doc-viewer-body");
    if (body) body.innerHTML = "";
    revokeDocViewerUrl();
  }

  function ensureDocModals() {
    if (docModalsReady) return;
    docModalsReady = true;
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="crm-lic-doc-action-modal" class="crm-modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="crm-lic-doc-action-title">' +
        '<div class="crm-modal crm-lic-doc-action-panel">' +
        '<h2 id="crm-lic-doc-action-title">' +
        esc(t("lic_doc_choose")) +
        "</h2>" +
        '<p id="crm-lic-doc-action-name" class="crm-lic-doc-action-name"></p>' +
        '<div class="crm-modal-actions crm-lic-doc-action-btns">' +
        '<button type="button" class="crm-btn" id="crm-lic-doc-view-btn">' +
        esc(t("lic_doc_view")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" id="crm-lic-doc-download-btn">' +
        esc(t("lic_doc_download")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" id="crm-lic-doc-action-cancel">' +
        esc(t("lic_cancel")) +
        "</button>" +
        "</div></div></div>" +
        '<div id="crm-lic-doc-viewer-modal" class="crm-modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="crm-lic-doc-viewer-title">' +
        '<div class="crm-modal crm-lic-doc-viewer-panel">' +
        '<div class="crm-lic-doc-viewer-head">' +
        '<h2 id="crm-lic-doc-viewer-title"></h2>' +
        '<button type="button" class="crm-lic-doc-viewer-close" id="crm-lic-doc-viewer-close" aria-label="' +
        esc(t("lic_doc_close")) +
        '">×</button>' +
        "</div>" +
        '<div class="crm-lic-doc-viewer-body" id="crm-lic-doc-viewer-body"></div>' +
        '<div class="crm-lic-doc-viewer-foot">' +
        '<button type="button" class="crm-btn secondary" id="crm-lic-doc-viewer-dl">' +
        esc(t("lic_doc_download")) +
        "</button>" +
        "</div></div></div>"
    );

    var actionModal = document.getElementById("crm-lic-doc-action-modal");
    var viewerModal = document.getElementById("crm-lic-doc-viewer-modal");

    document.getElementById("crm-lic-doc-action-cancel").addEventListener("click", closeDocActionModal);
    actionModal.addEventListener("click", function (e) {
      if (e.target === actionModal) closeDocActionModal();
    });

    document.getElementById("crm-lic-doc-download-btn").addEventListener("click", function () {
      if (!pendingDocFile) return;
      triggerDownload(pendingDocFile);
      URL.revokeObjectURL(pendingDocFile.url);
      closeDocActionModal();
    });

    document.getElementById("crm-lic-doc-view-btn").addEventListener("click", function () {
      if (!pendingDocFile) return;
      openDocViewer(pendingDocFile);
      closeDocActionModal();
    });

    document.getElementById("crm-lic-doc-viewer-close").addEventListener("click", closeDocViewerModal);
    document.getElementById("crm-lic-doc-viewer-dl").addEventListener("click", function () {
      if (!docViewerUrl) return;
      triggerDownload({
        url: docViewerUrl,
        filename: document.getElementById("crm-lic-doc-viewer-title").textContent || "license-document",
      });
    });
    viewerModal.addEventListener("click", function (e) {
      if (e.target === viewerModal) closeDocViewerModal();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (viewerModal && !viewerModal.classList.contains("hidden")) {
        closeDocViewerModal();
        return;
      }
      if (actionModal && !actionModal.classList.contains("hidden")) closeDocActionModal();
    });
  }

  function openDocViewer(file) {
    revokeDocViewerUrl();
    docViewerUrl = file.url;
    var title = document.getElementById("crm-lic-doc-viewer-title");
    var body = document.getElementById("crm-lic-doc-viewer-body");
    if (title) title.textContent = file.filename;
    if (!body) return;
    if (/^image\//i.test(file.contentType)) {
      body.innerHTML =
        '<img class="crm-lic-doc-viewer-img" src="' + esc(file.url) + '" alt="' + esc(file.filename) + '" />';
    } else {
      body.innerHTML = '<iframe class="crm-lic-doc-viewer-frame" src="' + esc(file.url) + '" title="' + esc(file.filename) + '"></iframe>';
    }
    document.getElementById("crm-lic-doc-viewer-modal").classList.remove("hidden");
  }

  async function fetchDocumentFile(docId) {
    var payload = await api("/api/staff/licensing?download=" + encodeURIComponent(docId), null, { method: "GET" });
    return payloadToBlob(payload);
  }

  async function openDocumentChooser(docId) {
    ensureDocModals();
    closeDocViewerModal();
    setStatus(t("lic_doc_loading"));
    try {
      var file = await fetchDocumentFile(docId);
      pendingDocFile = file;
      var nameEl = document.getElementById("crm-lic-doc-action-name");
      var viewBtn = document.getElementById("crm-lic-doc-view-btn");
      if (nameEl) nameEl.textContent = file.filename;
      if (viewBtn) viewBtn.classList.toggle("hidden", !file.viewable);
      document.getElementById("crm-lic-doc-action-modal").classList.remove("hidden");
      setStatus("");
    } catch (e) {
      setStatus((e && e.message) || t("load_error"));
    }
  }

  async function downloadDocument(docId) {
    var file = await fetchDocumentFile(docId);
    triggerDownload(file);
    URL.revokeObjectURL(file.url);
  }

  var mainEl = null;

  async function reload(main) {
    await loadData();
    var tab = ui.tab;
    var sel = ui.selectedStateId;
    var editingState = ui.editingState;
    var editingAgency = ui.editingAgency;
    main.innerHTML = renderShell();
    ui.tab = tab;
    ui.selectedStateId = sel;
    ui.editingState = editingState;
    ui.editingAgency = editingAgency;
    showTab(ui.tab);
    wire(main);
  }

  function wire(main) {
    main.querySelectorAll(".crm-lic-subtab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ui.editingState = false;
        ui.editingAgency = false;
        navigateTab(btn.getAttribute("data-lic-tab"));
      });
    });

    main.querySelectorAll(".crm-lic-list-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ui.selectedStateId = btn.getAttribute("data-state-id");
        ui.editingState = false;
        reload(main);
      });
    });

    var addState = $("lic-add-state-btn", main);
    if (addState) {
      addState.addEventListener("click", function () {
        ui.selectedStateId = "__new__";
        ui.editingState = true;
        reload(main);
      });
    }

    main.querySelectorAll("[data-lic-edit-state]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ui.editingState = true;
        reload(main);
      });
    });

    main.querySelectorAll("[data-lic-cancel-state]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-lic-cancel-state");
        if (key === "new") ui.selectedStateId = "";
        ui.editingState = false;
        reload(main);
      });
    });

    main.querySelectorAll("[data-lic-state-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var key = form.getAttribute("data-lic-state-form");
        void saveState(form, key, key === "new");
      });
    });

    main.querySelectorAll(".crm-lic-delete-state").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        if (!confirm(t("lic_confirm_delete"))) return;
        await api("/api/staff/licensing?type=state&id=" + encodeURIComponent(btn.getAttribute("data-id")), null, {
          method: "DELETE",
        });
        ui.selectedStateId = "";
        ui.editingState = false;
        await reload(main);
      });
    });

    var agForm = $("crm-lic-agency-form", main);
    if (agForm) {
      agForm.addEventListener("submit", function (e) {
        e.preventDefault();
        void saveAgency();
      });
    }

    var editAgency = $("lic-edit-agency-btn", main);
    if (editAgency) {
      editAgency.addEventListener("click", function () {
        ui.editingAgency = true;
        reload(main);
      });
    }

    var cancelAgency = $("lic-cancel-agency-btn", main);
    if (cancelAgency) {
      cancelAgency.addEventListener("click", function () {
        ui.editingAgency = false;
        reload(main);
      });
    }

    var addTr = $("lic-add-training-btn", main);
    if (addTr) {
      addTr.addEventListener("click", function () {
        var wrap = $("crm-lic-training-form-wrap", main);
        if (wrap) {
          wrap.classList.remove("hidden");
          wrap.innerHTML = renderTrainingForm({});
          wireTrainingForm(wrap, main);
        }
      });
    }

    main.querySelectorAll(".crm-lic-edit-training").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        var row = (data.training || []).find(function (r) {
          return String(r.id) === String(id);
        });
        var wrap = $("crm-lic-training-form-wrap", main);
        if (wrap && row) {
          wrap.classList.remove("hidden");
          wrap.innerHTML = renderTrainingForm(row);
          wireTrainingForm(wrap, main);
        }
      });
    });

    main.querySelectorAll(".crm-lic-file").forEach(function (input) {
      input.addEventListener("change", function () {
        void uploadDocument(input);
      });
    });

    main.querySelectorAll(".crm-lic-doc-open").forEach(function (btn) {
      btn.addEventListener("click", function () {
        void openDocumentChooser(btn.getAttribute("data-doc-id"));
      });
    });

    main.querySelectorAll(".crm-lic-doc-del").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        if (!confirm(t("lic_confirm_delete_doc"))) return;
        await api("/api/staff/licensing?type=document&id=" + encodeURIComponent(btn.getAttribute("data-doc-id")), null, {
          method: "DELETE",
        });
        await reload(main);
      });
    });
  }

  function wireTrainingForm(wrap, main) {
    var form = wrap.querySelector(".crm-lic-training-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      void saveTraining(form);
    });
    var cancel = $("lic-tr-cancel", form);
    if (cancel) {
      cancel.addEventListener("click", function () {
        wrap.classList.add("hidden");
        wrap.innerHTML = "";
      });
    }
    var del = $("lic-tr-delete", form);
    if (del) {
      del.addEventListener("click", async function () {
        var id = $("lic-tr-id", form).value;
        if (!confirm(t("lic_confirm_delete"))) return;
        await api("/api/staff/licensing?type=training&id=" + encodeURIComponent(id), null, { method: "DELETE" });
        await reload(main);
      });
    }
  }

  async function mount(main, opts) {
    mainEl = main;
    ui.tab = (opts && opts.tab) || "overview";
    ui.selectedStateId = "";
    main.innerHTML = '<p class="crm-empty-state">' + esc(t("loading")) + "</p>";
    try {
      await loadData();
      if (!ui.selectedStateId && data.states && data.states[0]) {
        ui.selectedStateId = data.states[0].id;
      }
      main.innerHTML = renderShell();
      showTab(ui.tab);
      wire(main);
    } catch (e) {
      main.innerHTML =
        '<div class="crm-placeholder"><strong>' +
        esc(t("load_error")) +
        "</strong><p>" +
        esc((e && e.message) || "") +
        "</p></div>";
    }
  }

  window.StaffCrmLicensing = { mount: mount };
})();
