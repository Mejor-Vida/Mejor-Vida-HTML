/**
 * CRM Overview tab — editable lead profile (identity, qualification, pipeline).
 */
(function () {
  "use strict";

  var TAG_OPTIONS = [
    "",
    "new",
    "warm",
    "hot",
    "call_back",
    "not_interested",
    "do_not_contact",
    "follow_up_needed",
    "appointment_set",
    "quote_sent",
    "application_started",
  ];

  var PIPELINE_OPTIONS = [
    "",
    "new",
    "contacted",
    "engaged",
    "client",
    "retained",
    "loyal",
    "lost",
    "enrolled",
  ];

  var SOURCE_OPTIONS = [
    "",
    "facebook_ad",
    "instagram_ad",
    "google_search",
    "google_ad",
    "website_quote_tool",
    "website_contact_form",
    "manychat",
    "whatsapp_inbound",
    "sms_inbound",
    "inbound_call",
    "referral",
    "partner_referral",
    "existing_client",
    "staff_compose",
    "other",
  ];

  var mountState = null;

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function api(path, body, opts) {
    var shell = window.StaffCrm;
    if (!shell || !shell.authedApi) throw new Error("StaffCrm not ready");
    return shell.authedApi(path, body, opts);
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s);
  }

  function $(id, root) {
    return (root || document).querySelector("#" + id);
  }

  function optionLabel(prefix, value) {
    if (!value) return t(prefix + "_select");
    return t(prefix + "_" + value);
  }

  function buildSelectOptions(prefix, values, selected) {
    return values
      .map(function (value) {
        var label = optionLabel(prefix, value);
        var sel = String(selected || "") === String(value) ? " selected" : "";
        return '<option value="' + esc(value) + '"' + sel + ">" + esc(label) + "</option>";
      })
      .join("");
  }

  function setLanguageToggle(state, rawLang) {
    var lang = /^(es|espanol|español|spanish)$/i.test(String(rawLang || "").trim()) ? "Spanish" : "English";
    var hidden = $("crm-ov-language", state.root);
    if (hidden) hidden.value = lang;
    var en = $("crm-ov-language-en", state.root);
    var es = $("crm-ov-language-es", state.root);
    if (en) en.classList.toggle("active", lang === "English");
    if (es) es.classList.toggle("active", lang === "Spanish");
  }

  function setSelectOrCustom(root, id, rawValue) {
    var el = $(id, root);
    if (!el) return;
    var v = rawValue != null ? String(rawValue).trim() : "";
    if (!v) {
      el.value = "";
      return;
    }
    var has = Array.prototype.some.call(el.options || [], function (opt) {
      return String(opt.value || "") === v;
    });
    if (!has) {
      var opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      opt.setAttribute("data-custom", "1");
      el.appendChild(opt);
    }
    el.value = v;
  }

  function normalizeCitizenship(raw) {
    var v = String(raw || "").trim();
    if (v === "other_or_not_sure" || v === "undocumented_immigrant") return "itin_holder";
    return v;
  }

  function calcAgeFromDob(dob) {
    if (window.StaffCrm && window.StaffCrm.calcAge) return window.StaffCrm.calcAge(dob);
    if (!dob) return null;
    var d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    var t = new Date();
    var a = t.getFullYear() - d.getFullYear();
    var m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
    return a;
  }

  function syncAgeFromBirthdate(state) {
    var dobEl = $("crm-ov-dob", state.root);
    var ageEl = $("crm-ov-age", state.root);
    if (!dobEl || !ageEl) return;
    var dob = String(dobEl.value || "").trim();
    if (!dob) {
      ageEl.value = "";
      return;
    }
    var age = calcAgeFromDob(dob);
    if (age != null && age >= 0 && age <= 130) ageEl.value = String(age);
  }

  function applyDetailToForm(state, detail) {
    var pe = (detail && detail.profile_ext) || {};
    function setv(id, v) {
      var el = $(id, state.root);
      if (!el) return;
      el.value = v != null && v !== undefined ? String(v) : "";
    }

    setv("crm-ov-id", detail.id);
    setv("crm-ov-first-name", detail.first_name);
    setv("crm-ov-last-name", detail.last_name);
    setv("crm-ov-email", detail.email);
    setv("crm-ov-phone", detail.phone);
    setLanguageToggle(state, detail.language);
    setv("crm-ov-state", pe.state);
    setv("crm-ov-age", detail.age != null && detail.age !== "" ? String(detail.age) : "");
    setv("crm-ov-dob", pe.date_of_birth);
    if (pe.date_of_birth && (detail.age == null || detail.age === "")) syncAgeFromBirthdate(state);
    setv("crm-ov-sex", detail.sex);
    var tob = $("crm-ov-tobacco", state.root);
    if (tob) {
      if (detail.tobacco === true) tob.value = "true";
      else if (detail.tobacco === false) tob.value = "false";
      else tob.value = "";
    }
    setv("crm-ov-living-situation", pe.living_situation);
    setv("crm-ov-citizenship-status", normalizeCitizenship(pe.citizenship_status));
    setv("crm-ov-height", pe.height);
    setv("crm-ov-weight", pe.weight != null && pe.weight !== "" ? String(pe.weight) : "");
    setSelectOrCustom(state.root, "crm-ov-tag", detail.tag);
    setSelectOrCustom(state.root, "crm-ov-pipeline-stage", window.StaffCrmStages ? window.StaffCrmStages.normalizeStage(detail.pipeline_stage) : detail.pipeline_stage);
    setSelectOrCustom(state.root, "crm-ov-source", detail.source);
    var doff = $("crm-ov-drop-off", state.root);
    if (doff) doff.checked = !!detail.drop_off;
    setSelectOrCustom(state.root, "crm-ov-drop-off-stage", detail.drop_off_stage);
    setv("crm-ov-notes", pe.notes);
  }

  function serializeForm(state) {
    var tob = $("crm-ov-tobacco", state.root);
    var tv = tob ? tob.value : "";
    var tobacco = tv === "true" ? true : tv === "false" ? false : null;
    return {
      id: String(($("crm-ov-id", state.root) && $("crm-ov-id", state.root).value) || ""),
      first_name: String(($("crm-ov-first-name", state.root) && $("crm-ov-first-name", state.root).value) || "").trim(),
      last_name: String(($("crm-ov-last-name", state.root) && $("crm-ov-last-name", state.root).value) || "").trim(),
      email: String(($("crm-ov-email", state.root) && $("crm-ov-email", state.root).value) || "")
        .trim()
        .toLowerCase(),
      phone: String(($("crm-ov-phone", state.root) && $("crm-ov-phone", state.root).value) || "").trim(),
      language: String(($("crm-ov-language", state.root) && $("crm-ov-language", state.root).value) || "English").trim(),
      state: String(($("crm-ov-state", state.root) && $("crm-ov-state", state.root).value) || "").trim(),
      age: String(($("crm-ov-age", state.root) && $("crm-ov-age", state.root).value) || "").trim(),
      date_of_birth: String(($("crm-ov-dob", state.root) && $("crm-ov-dob", state.root).value) || "").trim(),
      sex: String(($("crm-ov-sex", state.root) && $("crm-ov-sex", state.root).value) || "").trim(),
      tobacco: tobacco,
      living_situation: String(
        ($("crm-ov-living-situation", state.root) && $("crm-ov-living-situation", state.root).value) || ""
      ).trim(),
      citizenship_status: String(
        ($("crm-ov-citizenship-status", state.root) && $("crm-ov-citizenship-status", state.root).value) || ""
      ).trim(),
      height: String(($("crm-ov-height", state.root) && $("crm-ov-height", state.root).value) || "").trim(),
      weight: String(($("crm-ov-weight", state.root) && $("crm-ov-weight", state.root).value) || "").trim(),
      tag: String(($("crm-ov-tag", state.root) && $("crm-ov-tag", state.root).value) || "").trim(),
      pipeline_stage: String(
        ($("crm-ov-pipeline-stage", state.root) && $("crm-ov-pipeline-stage", state.root).value) || ""
      ).trim(),
      source: String(($("crm-ov-source", state.root) && $("crm-ov-source", state.root).value) || "").trim(),
      drop_off: !!($("crm-ov-drop-off", state.root) && $("crm-ov-drop-off", state.root).checked),
      drop_off_stage: String(
        ($("crm-ov-drop-off-stage", state.root) && $("crm-ov-drop-off-stage", state.root).value) || ""
      ).trim(),
      notes: String(($("crm-ov-notes", state.root) && $("crm-ov-notes", state.root).value) || "").trim(),
    };
  }

  function buildPatchBody(state) {
    var s = serializeForm(state);
    var ageOut = null;
    if (s.age !== "") {
      var n = parseInt(s.age, 10);
      if (Number.isFinite(n) && n >= 0 && n <= 130) ageOut = n;
    }
    var weightOut = null;
    if (s.weight !== "") {
      var w = parseFloat(s.weight);
      if (Number.isFinite(w) && w > 0 && w <= 999) weightOut = w;
    }
    return {
      id: state.leadId,
      first_name: s.first_name || null,
      last_name: s.last_name || null,
      email: s.email || null,
      phone: s.phone || null,
      language: s.language || "English",
      age: ageOut,
      sex: s.sex || null,
      tobacco: s.tobacco,
      tag: s.tag || null,
      pipeline_stage: s.pipeline_stage || null,
      source: s.source || null,
      drop_off: s.drop_off,
      drop_off_stage: s.drop_off_stage || null,
      profile_ext: {
        state: s.state || null,
        date_of_birth: s.date_of_birth || null,
        living_situation: s.living_situation || null,
        citizenship_status: s.citizenship_status || null,
        height: s.height || null,
        weight: weightOut,
        notes: s.notes || null,
        tobacco_status: s.tobacco === true ? "yes" : s.tobacco === false ? "no" : null,
      },
    };
  }

  function setStatus(state, msg) {
    var el = $("crm-ov-status", state.root);
    if (el) el.textContent = msg || "";
  }

  function updateSaveButton(state) {
    var btn = $("crm-ov-save", state.root);
    if (!btn) return;
    if (state.readOnly) {
      btn.disabled = true;
      return;
    }
    var cur = JSON.stringify(serializeForm(state));
    btn.disabled = cur === state.baselineJson;
  }

  function scheduleDirtyCheck(state) {
    clearTimeout(state.dirtyTimer);
    state.dirtyTimer = setTimeout(function () {
      updateSaveButton(state);
    }, 60);
  }

  function setFormDisabled(state, disabled) {
    var form = $("crm-ov-form", state.root);
    if (!form) return;
    form.querySelectorAll("input, select, textarea, button.crm-ov-lang-opt").forEach(function (node) {
      if (node.id === "crm-ov-id") return;
      if (disabled) node.setAttribute("disabled", "disabled");
      else node.removeAttribute("disabled");
    });
    var saveBtn = $("crm-ov-save", state.root);
    if (saveBtn && !disabled) updateSaveButton(state);
    else if (saveBtn) saveBtn.disabled = true;
  }

  function renderReadonlyBlock(state, detail) {
    var block = $("crm-ov-readonly-block", state.root);
    if (!block) return;
    var rows = [
      [t("ov_source_table"), detail.source_table],
      [t("full_name"), detail.display_name],
      [t("conn_first_name"), detail.first_name],
      [t("conn_last_name"), detail.last_name],
      [t("conn_email"), detail.email],
      [t("conn_phone"), detail.phone],
      [t("col_language"), detail.language],
      [t("source"), detail.source],
    ];
    block.innerHTML =
      '<div class="crm-overview-readonly-grid">' +
      rows
        .map(function (pair) {
          return (
            '<div class="crm-overview-readonly-item"><label>' +
            esc(pair[0]) +
            '</label><div>' +
            esc(pair[1] != null ? String(pair[1]) : "—") +
            "</div></div>"
          );
        })
        .join("") +
      "</div>";
  }

  function openSaveModal(state) {
    var mod = $("crm-ov-save-modal", state.root);
    if (mod) mod.classList.remove("hidden");
  }

  function closeSaveModal(state) {
    var mod = $("crm-ov-save-modal", state.root);
    if (mod) mod.classList.add("hidden");
  }

  async function performSave(state) {
    closeSaveModal(state);
    var s = serializeForm(state);
    if (!s.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) {
      setStatus(state, t("ov_status_invalid_email"));
      return;
    }
    var saveBtn = $("crm-ov-save", state.root);
    if (saveBtn) saveBtn.disabled = true;
    setStatus(state, t("ov_status_saving"));
    try {
      var data = await api("/api/staff/leads", buildPatchBody(state), { method: "PATCH" });
      if (data && data.detail) {
        applyDetailToForm(state, data.detail);
        state.baselineJson = JSON.stringify(serializeForm(state));
      }
      if (data && data.item && window.StaffCrm && window.StaffCrm.upsertLeadListItem) {
        window.StaffCrm.upsertLeadListItem(data.item);
      } else if (window.StaffCrm && window.StaffCrm.reloadLeadDetail) {
        await window.StaffCrm.reloadLeadDetail(state.leadId);
      }
      setStatus(state, t("ov_status_saved"));
    } catch (e) {
      setStatus(state, (e && e.message) || t("ov_status_save_failed"));
    } finally {
      updateSaveButton(state);
    }
  }

  function formHtml() {
    return (
      '<div class="crm-overview-wrap">' +
      '<div class="crm-overview-toolbar">' +
      "<h2>" +
      esc(t("ov_heading")) +
      "</h2>" +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:10px">' +
      '<span id="crm-ov-status" class="crm-overview-status" aria-live="polite"></span>' +
      '<button type="button" id="crm-ov-save" class="crm-btn secondary" disabled>' +
      esc(t("ov_save")) +
      "</button>" +
      "</div></div>" +
      '<div id="crm-ov-readonly-banner" class="crm-overview-readonly-banner hidden"></div>' +
      '<div id="crm-ov-readonly-block" class="hidden"></div>' +
      '<form id="crm-ov-form" class="crm-overview-form" autocomplete="off" onsubmit="return false;">' +
      '<section class="crm-overview-section">' +
      '<div class="crm-overview-section-bar">' +
      esc(t("ov_section_identity")) +
      "</div>" +
      '<div class="crm-overview-grid">' +
      field("crm-ov-id", t("ov_lead_id"), "text", { ro: true }) +
      field("crm-ov-first-name", t("conn_first_name"), "text") +
      field("crm-ov-last-name", t("conn_last_name"), "text") +
      field("crm-ov-email", t("conn_email"), "email", { required: true }) +
      field("crm-ov-phone", t("conn_phone"), "tel") +
      languageField() +
      field("crm-ov-state", t("ov_state"), "text", { placeholder: "e.g. NE" }) +
      "</div></section>" +
      '<section class="crm-overview-section">' +
      '<div class="crm-overview-section-bar">' +
      esc(t("ov_section_qualification")) +
      "</div>" +
      '<div class="crm-overview-grid">' +
      field("crm-ov-age", t("med_age"), "number", { min: 0, max: 130 }) +
      field("crm-ov-dob", t("birthdate"), "date") +
      selectField("crm-ov-sex", t("ov_sex"), buildSelectOptions("ov_sex", ["", "male", "female"], "")) +
      selectField(
        "crm-ov-tobacco",
        t("ov_tobacco"),
        buildSelectOptions("ov_tobacco", ["", "true", "false"], "")
      ) +
      selectField(
        "crm-ov-living-situation",
        t("ov_living_situation"),
        buildSelectOptions("ov_living", ["", "independent", "assisted_living", "nursing_home"], "")
      ) +
      selectField(
        "crm-ov-citizenship-status",
        t("ov_citizenship"),
        buildSelectOptions("ov_citizenship", ["", "us_citizen", "permanent_resident", "itin_holder"], "")
      ) +
      field("crm-ov-height", t("ov_height"), "text", { placeholder: "5'10\"" }) +
      field("crm-ov-weight", t("ov_weight"), "number", { min: 1, max: 999, step: "0.1", placeholder: "lbs" }) +
      "</div></section>" +
      '<section class="crm-overview-section">' +
      '<div class="crm-overview-section-bar">' +
      esc(t("ov_section_pipeline")) +
      "</div>" +
      '<div class="crm-overview-grid">' +
      selectField(
        "crm-ov-tag",
        t("ov_tag"),
        buildSelectOptions("ov_tag", TAG_OPTIONS, ""),
        t("ov_tag_hint")
      ) +
      selectField(
        "crm-ov-pipeline-stage",
        t("ov_pipeline_stage"),
        buildSelectOptions("ov_stage", PIPELINE_OPTIONS, ""),
        t("ov_pipeline_hint")
      ) +
      selectField(
        "crm-ov-source",
        t("source"),
        buildSelectOptions("ov_source", SOURCE_OPTIONS, ""),
        t("ov_source_hint")
      ) +
      checkboxField("crm-ov-drop-off", t("ov_drop_off"), t("ov_drop_off_hint")) +
      selectField(
        "crm-ov-drop-off-stage",
        t("ov_drop_off_stage"),
        buildSelectOptions("ov_stage", PIPELINE_OPTIONS, ""),
        t("ov_drop_off_stage_hint")
      ) +
      textareaField("crm-ov-notes", t("ov_notes"), t("ov_notes_hint"), t("ov_notes_ph")) +
      "</div></section>" +
      "</form>" +
      saveModalHtml() +
      "</div>"
    );
  }

  function field(id, label, type, opts) {
    opts = opts || {};
    var attrs = 'id="' + id + '" type="' + type + '" autocomplete="off"';
    if (opts.ro) attrs += ' readonly class="crm-overview-ro" tabindex="-1"';
    if (opts.required) attrs += " required";
    if (opts.placeholder) attrs += ' placeholder="' + esc(opts.placeholder) + '"';
    if (opts.min != null) attrs += ' min="' + opts.min + '"';
    if (opts.max != null) attrs += ' max="' + opts.max + '"';
    if (opts.step) attrs += ' step="' + opts.step + '"';
    return (
      '<div class="crm-overview-field"><label for="' +
      id +
      '">' +
      esc(label) +
      "</label><input " +
      attrs +
      " /></div>"
    );
  }

  function selectField(id, label, optionsHtml, hint) {
    return (
      '<div class="crm-overview-field"><label for="' +
      id +
      '">' +
      esc(label) +
      "</label>" +
      (hint ? '<div class="crm-overview-hint">' + esc(hint) + "</div>" : "") +
      '<select id="' +
      id +
      '">' +
      optionsHtml +
      "</select></div>"
    );
  }

  function textareaField(id, label, hint, placeholder) {
    return (
      '<div class="crm-overview-field crm-overview-field--full"><label for="' +
      id +
      '">' +
      esc(label) +
      "</label>" +
      (hint ? '<div class="crm-overview-hint">' + esc(hint) + "</div>" : "") +
      '<textarea id="' +
      id +
      '" rows="3" placeholder="' +
      esc(placeholder || "") +
      '"></textarea></div>'
    );
  }

  function checkboxField(id, label, hint) {
    return (
      '<div class="crm-overview-field crm-overview-field--full">' +
      '<label class="crm-overview-check-label" for="' +
      id +
      '"><input id="' +
      id +
      '" type="checkbox" />' +
      "<span>" +
      esc(label) +
      (hint ? '<span class="crm-overview-hint" style="display:block;margin-top:4px;font-weight:400">' + esc(hint) + "</span>" : "") +
      "</span></label></div>"
    );
  }

  function languageField() {
    return (
      '<div class="crm-overview-field"><label>' +
      esc(t("col_language")) +
      '</label><input id="crm-ov-language" type="hidden" value="English" />' +
      '<div class="crm-overview-lang-toggle" role="group" aria-label="' +
      esc(t("col_language")) +
      '">' +
      '<button type="button" id="crm-ov-language-en" class="crm-ov-lang-opt active">' +
      esc(t("ov_lang_en")) +
      "</button>" +
      '<button type="button" id="crm-ov-language-es" class="crm-ov-lang-opt">' +
      esc(t("ov_lang_es")) +
      "</button></div></div>"
    );
  }

  function saveModalHtml() {
    return (
      '<div id="crm-ov-save-modal" class="crm-overview-modal-backdrop hidden" role="dialog" aria-modal="true">' +
      '<div class="crm-overview-modal">' +
      "<h3>" +
      esc(t("ov_save_confirm_title")) +
      "</h3>" +
      "<p>" +
      esc(t("ov_save_confirm_body")) +
      "</p>" +
      '<div class="crm-overview-modal-actions">' +
      '<button type="button" id="crm-ov-save-cancel" class="crm-btn secondary">' +
      esc(t("conn_no")) +
      "</button>" +
      '<button type="button" id="crm-ov-save-confirm" class="crm-btn">' +
      esc(t("conn_yes")) +
      "</button></div></div></div>"
    );
  }

  function wire(state) {
    var form = $("crm-ov-form", state.root);
    if (form) {
      form.addEventListener("input", function () {
        scheduleDirtyCheck(state);
      });
      form.addEventListener("change", function () {
        scheduleDirtyCheck(state);
      });
    }
    $("crm-ov-language-en", state.root).addEventListener("click", function () {
      setLanguageToggle(state, "English");
      scheduleDirtyCheck(state);
    });
    $("crm-ov-language-es", state.root).addEventListener("click", function () {
      setLanguageToggle(state, "Spanish");
      scheduleDirtyCheck(state);
    });
    var dobEl = $("crm-ov-dob", state.root);
    if (dobEl) {
      var onDobChange = function () {
        syncAgeFromBirthdate(state);
        scheduleDirtyCheck(state);
      };
      dobEl.addEventListener("change", onDobChange);
      dobEl.addEventListener("input", onDobChange);
    }
    $("crm-ov-save", state.root).addEventListener("click", function () {
      if (state.readOnly) return;
      if (JSON.stringify(serializeForm(state)) === state.baselineJson) return;
      openSaveModal(state);
    });
    $("crm-ov-save-cancel", state.root).addEventListener("click", function () {
      closeSaveModal(state);
    });
    $("crm-ov-save-confirm", state.root).addEventListener("click", function () {
      void performSave(state);
    });
    var mod = $("crm-ov-save-modal", state.root);
    if (mod) {
      mod.addEventListener("click", function (e) {
        if (e.target === mod) closeSaveModal(state);
      });
    }
  }

  function applyReadOnlyState(state, detail) {
    var banner = $("crm-ov-readonly-banner", state.root);
    var roBlock = $("crm-ov-readonly-block", state.root);
    var form = $("crm-ov-form", state.root);
    if (state.readOnly) {
      if (banner) {
        banner.classList.remove("hidden");
        banner.textContent = t("ov_readonly_banner", { table: String(detail.source_table || "unknown") });
      }
      if (roBlock) {
        roBlock.classList.remove("hidden");
        renderReadonlyBlock(state, detail);
      }
      if (form) form.classList.add("hidden");
      state.baselineJson = "";
      setFormDisabled(state, true);
    } else {
      if (banner) banner.classList.add("hidden");
      if (roBlock) {
        roBlock.classList.add("hidden");
        roBlock.innerHTML = "";
      }
      if (form) form.classList.remove("hidden");
      setFormDisabled(state, false);
    }
  }

  async function mount(rootEl, opts) {
    if (!rootEl) return;
    var detail = opts.detail || {};
    var leadId = opts.leadId || detail.id;
    if (!leadId) {
      rootEl.innerHTML = '<div class="crm-placeholder"><p>' + esc(t("client_not_found")) + "</p></div>";
      return;
    }

    var state = {
      root: rootEl,
      leadId: leadId,
      readOnly: !!detail.read_only,
      baselineJson: "",
      dirtyTimer: null,
    };
    mountState = state;

    rootEl.innerHTML = formHtml();
    state.root = rootEl;
    applyDetailToForm(state, detail);
    applyReadOnlyState(state, detail);
    if (!state.readOnly) {
      state.baselineJson = JSON.stringify(serializeForm(state));
      updateSaveButton(state);
    }
    wire(state);

    try {
      var data = await api("/api/staff/leads?id=" + encodeURIComponent(leadId), null, { method: "GET" });
      var d = data && data.detail;
      if (!d) throw new Error("No detail");
      state.readOnly = !!d.read_only;
      applyDetailToForm(state, d);
      applyReadOnlyState(state, d);
      if (!state.readOnly) {
        state.baselineJson = JSON.stringify(serializeForm(state));
        updateSaveButton(state);
      }
    } catch (e) {
      setStatus(state, (e && e.message) || t("load_error"));
    }
  }

  window.StaffCrmOverview = { mount: mount };
})();
