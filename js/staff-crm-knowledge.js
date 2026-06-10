/**
 * CRM Knowledge — Staff KB gaps (review, generate, push to RAG).
 */
(function () {
  "use strict";

  var state = {
    items: [],
    selectedId: "",
  };

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
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    var lang = window.StaffCrmI18n ? window.StaffCrmI18n.getLang() : "en";
    return d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function parseKbGapAnswers(raw) {
    var text = String(raw || "").trim();
    if (!text) return { english: "", spanish: "" };
    var enMatch = text.match(/English:\s*([\s\S]*?)(?:\n\s*Spanish:|$)/i);
    var esMatch = text.match(/Spanish:\s*([\s\S]*)$/i);
    if (enMatch || esMatch) {
      return {
        english: enMatch ? String(enMatch[1] || "").trim() : "",
        spanish: esMatch ? String(esMatch[1] || "").trim() : "",
      };
    }
    return { english: text, spanish: "" };
  }

  function combineKbGapAnswers(english, spanish) {
    var en = String(english || "").trim();
    var es = String(spanish || "").trim();
    if (en && es) return "English:\n" + en + "\n\nSpanish:\n" + es;
    return en || es;
  }

  function sourceLabel(source) {
    if (source === "general_fallback") return t("kb_source_general");
    if (source === "internal_rag") return t("kb_source_rag");
    return source || t("kb_source_unknown");
  }

  function getSelected() {
    return state.items.find(function (q) {
      return q.id === state.selectedId;
    }) || null;
  }

  function renderShell() {
    return (
      '<div class="crm-kb-shell">' +
      '<h1 class="crm-kb-page-title">' +
      esc(t("knowledge_title")) +
      "</h1>" +
      '<div class="crm-kb-wrap">' +
      '<aside class="crm-kb-list-col">' +
      '<div class="crm-kb-head">' +
      "<div><strong>" +
      esc(t("kb_staff_title")) +
      "</strong>" +
      '<div class="crm-kb-count" id="crm-kb-count">' +
      esc(t("kb_loading")) +
      "</div></div>" +
      '<button type="button" class="crm-btn secondary" id="crm-kb-refresh">' +
      esc(t("kb_refresh")) +
      "</button></div>" +
      '<div id="crm-kb-items" class="crm-kb-items"></div>' +
      "</aside>" +
      '<div class="crm-kb-detail-col">' +
      '<div class="crm-kb-head">' +
      "<div><strong>" +
      esc(t("kb_detail_title")) +
      "</strong>" +
      '<div class="crm-kb-count">' +
      esc(t("kb_detail_blurb")) +
      "</div></div></div>" +
      '<div id="crm-kb-detail" class="crm-kb-detail-body">' +
      '<div class="crm-kb-empty">' +
      esc(t("kb_select_gap")) +
      "</div></div></div></div></div>"
    );
  }

  function renderList() {
    var box = $("crm-kb-items");
    var count = $("crm-kb-count");
    if (!box) return;
    if (count) count.textContent = t("kb_unresolved_count", { count: state.items.length });
    box.innerHTML = "";
    if (!state.items.length) {
      box.innerHTML = '<div class="crm-kb-empty">' + esc(t("kb_no_gaps")) + "</div>";
      return;
    }
    state.items.forEach(function (q) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "crm-kb-item" + (q.id === state.selectedId ? " active" : "");
      btn.innerHTML =
        '<div class="crm-kb-item-title">' +
        esc(sourceLabel(q.source)) +
        "</div>" +
        '<div class="crm-kb-item-preview">' +
        esc(String(q.question || "").slice(0, 130)) +
        "</div>" +
        '<div class="crm-kb-item-meta">' +
        esc(
          t("kb_item_meta", {
            retrieval: String(q.retrieval_count || 0),
            sim: q.max_similarity == null ? "—" : Number(q.max_similarity).toFixed(3),
            date: fmtDate(q.last_asked_at || q.created_at),
          })
        ) +
        "</div>";
      btn.addEventListener("click", function () {
        state.selectedId = q.id;
        renderList();
        renderDetail();
      });
      box.appendChild(btn);
    });
  }

  function renderDetail(statusText) {
    var box = $("crm-kb-detail");
    if (!box) return;
    var q = getSelected();
    if (!q) {
      box.innerHTML = '<div class="crm-kb-empty">' + esc(t("kb_select_gap")) + "</div>";
      return;
    }
    var parsed = parseKbGapAnswers(q.assistant_answer || "");
    box.innerHTML =
      '<div class="crm-kb-meta-grid">' +
      '<div class="crm-kb-meta-card"><strong>' +
      esc(t("kb_meta_source")) +
      "</strong>" +
      esc(q.source || "—") +
      "</div>" +
      '<div class="crm-kb-meta-card"><strong>' +
      esc(t("kb_meta_retrieval")) +
      "</strong>" +
      esc(String(q.retrieval_count || 0)) +
      "</div>" +
      '<div class="crm-kb-meta-card"><strong>' +
      esc(t("kb_meta_similarity")) +
      "</strong>" +
      esc(q.max_similarity == null ? "—" : Number(q.max_similarity).toFixed(3)) +
      "</div>" +
      '<div class="crm-kb-meta-card"><strong>' +
      esc(t("kb_meta_last_asked")) +
      "</strong>" +
      esc(fmtDate(q.last_asked_at || q.created_at)) +
      "</div></div>" +
      '<div class="crm-kb-field"><label for="crm-kb-question">' +
      esc(t("kb_question_label")) +
      '</label><textarea id="crm-kb-question" rows="4" readonly>' +
      esc(q.question || "") +
      "</textarea></div>" +
      '<div class="crm-kb-field"><label for="crm-kb-julie-input">' +
      esc(t("kb_julie_input_label")) +
      '</label><textarea id="crm-kb-julie-input" rows="4" placeholder="' +
      esc(t("kb_julie_input_ph")) +
      '"></textarea></div>' +
      '<div class="crm-kb-field"><label>' +
      esc(t("kb_answer_label")) +
      "</label>" +
      '<div class="crm-kb-answer-grid">' +
      '<div class="crm-kb-field"><label for="crm-kb-answer-en">' +
      esc(t("kb_answer_en")) +
      '</label><textarea id="crm-kb-answer-en" rows="14">' +
      esc(parsed.english) +
      "</textarea></div>" +
      '<div class="crm-kb-field"><label for="crm-kb-answer-es">' +
      esc(t("kb_answer_es")) +
      '</label><textarea id="crm-kb-answer-es" rows="14">' +
      esc(parsed.spanish) +
      "</textarea></div></div></div>" +
      '<div class="crm-kb-actions">' +
      '<button type="button" class="crm-btn secondary" id="crm-kb-save">' +
      esc(t("kb_save")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-kb-generate">' +
      esc(t("kb_generate")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-kb-push">' +
      esc(t("kb_push_rag")) +
      "</button>" +
      '<button type="button" class="crm-btn is-danger" id="crm-kb-delete">' +
      esc(t("kb_delete")) +
      "</button></div>" +
      '<div id="crm-kb-status" class="crm-kb-status">' +
      esc(statusText || "") +
      "</div>";

    $("crm-kb-save").addEventListener("click", onSave);
    $("crm-kb-generate").addEventListener("click", onGenerate);
    $("crm-kb-push").addEventListener("click", onPushRag);
    $("crm-kb-delete").addEventListener("click", onDelete);
  }

  function setStatus(msg) {
    var el = $("crm-kb-status");
    if (el) el.textContent = msg || "";
  }

  async function loadGaps() {
    var count = $("crm-kb-count");
    if (count) count.textContent = t("kb_loading");
    try {
      var data = await api("/api/staff/kb-gaps", null, { method: "GET" });
      state.items = Array.isArray(data.items) ? data.items : [];
      if (!state.selectedId && state.items.length) state.selectedId = state.items[0].id;
      if (state.selectedId && !state.items.some(function (q) {
        return q.id === state.selectedId;
      })) {
        state.selectedId = state.items.length ? state.items[0].id : "";
      }
      renderList();
      renderDetail();
    } catch (e) {
      if (count) count.textContent = t("kb_load_failed");
      var box = $("crm-kb-items");
      if (box) box.innerHTML = '<div class="crm-kb-empty">' + esc(t("kb_load_error")) + "</div>";
    }
  }

  async function onPushRag() {
    var q = getSelected();
    if (!q) return;
    var answerEn = String(($("crm-kb-answer-en") && $("crm-kb-answer-en").value) || "").trim();
    var answerEs = String(($("crm-kb-answer-es") && $("crm-kb-answer-es").value) || "").trim();
    if (!answerEn && !answerEs) {
      setStatus(t("kb_need_answer"));
      return;
    }
    var pushBtn = $("crm-kb-push");
    setStatus(t("kb_pushing"));
    if (pushBtn) {
      pushBtn.disabled = true;
      pushBtn.textContent = t("kb_pushing_btn");
    }
    try {
      var data = await api("/api/staff/push-kb-gap-to-rag", {
        id: q.id,
        answerEnglish: answerEn,
        answerSpanish: answerEs,
      });
      state.items = state.items.filter(function (item) {
        return item.id !== q.id;
      });
      state.selectedId = state.items.length ? state.items[0].id : "";
      renderList();
      renderDetail(data && data.deduped ? t("kb_pushed_deduped") : t("kb_pushed_ok"));
    } catch (e) {
      setStatus(t("kb_push_failed"));
    } finally {
      if (pushBtn) {
        pushBtn.disabled = false;
        pushBtn.textContent = t("kb_push_rag");
      }
    }
  }

  async function onGenerate() {
    var q = getSelected();
    if (!q) return;
    var question = String(($("crm-kb-question") && $("crm-kb-question").value) || "").trim();
    var julieInput = String(($("crm-kb-julie-input") && $("crm-kb-julie-input").value) || "").trim();
    if (!question) {
      setStatus(t("kb_missing_question"));
      return;
    }
    var genBtn = $("crm-kb-generate");
    setStatus(t("kb_generating"));
    if (genBtn) {
      genBtn.disabled = true;
      genBtn.textContent = t("kb_generating_btn");
    }
    try {
      var data = await api("/api/staff/generate-kb-gap-response", {
        id: q.id,
        question: question,
        julieInput: julieInput,
      });
      if ($("crm-kb-answer-en")) $("crm-kb-answer-en").value = String((data && data.english_answer) || "");
      if ($("crm-kb-answer-es")) $("crm-kb-answer-es").value = String((data && data.spanish_answer) || "");
      setStatus(t("kb_generated_ok"));
    } catch (e) {
      setStatus(t("kb_generate_failed"));
    } finally {
      if (genBtn) {
        genBtn.disabled = false;
        genBtn.textContent = t("kb_generate");
      }
    }
  }

  async function onSave() {
    var q = getSelected();
    if (!q) return;
    var answerEn = String(($("crm-kb-answer-en") && $("crm-kb-answer-en").value) || "").trim();
    var answerEs = String(($("crm-kb-answer-es") && $("crm-kb-answer-es").value) || "").trim();
    if (!answerEn && !answerEs) {
      setStatus(t("kb_answer_empty"));
      return;
    }
    var saveBtn = $("crm-kb-save");
    setStatus(t("kb_saving"));
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = t("kb_saving_btn");
    }
    try {
      await api("/api/staff/save-kb-gap", {
        id: q.id,
        answerEnglish: answerEn,
        answerSpanish: answerEs,
      });
      q.assistant_answer = combineKbGapAnswers(answerEn, answerEs);
      setStatus(t("kb_saved"));
    } catch (e) {
      setStatus(t("kb_save_failed"));
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = t("kb_save");
      }
    }
  }

  async function onDelete() {
    var q = getSelected();
    if (!q) return;
    var delBtn = $("crm-kb-delete");
    setStatus(t("kb_deleting"));
    if (delBtn) {
      delBtn.disabled = true;
      delBtn.textContent = t("kb_deleting_btn");
    }
    try {
      await api("/api/staff/delete-kb-gap", { id: q.id });
      state.items = state.items.filter(function (item) {
        return item.id !== q.id;
      });
      state.selectedId = state.items.length ? state.items[0].id : "";
      renderList();
      renderDetail(t("kb_deleted"));
    } catch (e) {
      setStatus(t("kb_delete_failed"));
    } finally {
      if (delBtn) {
        delBtn.disabled = false;
        delBtn.textContent = t("kb_delete");
      }
    }
  }

  function wireHandlers() {
    var refresh = $("crm-kb-refresh");
    if (refresh) refresh.addEventListener("click", function () {
      void loadGaps();
    });
  }

  async function mount(main) {
    if (!main) return;
    main.innerHTML = renderShell();
    wireHandlers();
    await loadGaps();
  }

  window.StaffCrmKnowledge = { mount: mount };
})();
