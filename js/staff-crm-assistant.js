/**
 * CRM Staff Assistant — internal AI chat (RAG + general fallback).
 * Supports multiple conversations in a left history column (localStorage).
 */
(function () {
  "use strict";

  var STAFF_CHAT_VERSION = 2;
  var MAX_CHAT_MESSAGES = 100;
  var MAX_CONVERSATIONS = 40;

  var state = {
    userId: "",
    activeId: "",
    conversations: [],
    conversation: [],
    thinkingNode: null,
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

  function chatStorageKey() {
    return "mvi.staff.assistant.chat.v" + STAFF_CHAT_VERSION + "." + (state.userId || "anon");
  }

  function legacyChatStorageKey() {
    return "mvi.staff.assistant.chat.v1." + (state.userId || "anon");
  }

  function uid() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
      }
    } catch (e) {}
    return "c-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function trimChat(msgs) {
    if (!Array.isArray(msgs)) return [];
    if (msgs.length <= MAX_CHAT_MESSAGES) return msgs;
    return msgs.slice(msgs.length - MAX_CHAT_MESSAGES);
  }

  function sanitizeMsgs(msgs) {
    return trimChat(
      (Array.isArray(msgs) ? msgs : []).filter(function (m) {
        return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
      })
    );
  }

  function titleFromMsgs(msgs) {
    var list = sanitizeMsgs(msgs);
    for (var i = 0; i < list.length; i++) {
      if (list[i].role === "user" && String(list[i].content || "").trim()) {
        var raw = String(list[i].content).replace(/\s+/g, " ").trim();
        return raw.length > 56 ? raw.slice(0, 53) + "…" : raw;
      }
    }
    return t("assistant_untitled_chat");
  }

  function sortConversations(list) {
    return (list || []).slice().sort(function (a, b) {
      return (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0);
    });
  }

  function normalizeConversation(c) {
    if (!c || typeof c !== "object") return null;
    var id = String(c.id || "").trim() || uid();
    var msgs = sanitizeMsgs(c.msgs);
    var updatedAt = Number(c.updatedAt) || Date.now();
    var title = String(c.title || "").trim() || titleFromMsgs(msgs);
    return { id: id, title: title, updatedAt: updatedAt, msgs: msgs };
  }

  function loadLegacyChat() {
    try {
      var raw = localStorage.getItem(legacyChatStorageKey());
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.msgs) || !obj.msgs.length) return null;
      return normalizeConversation({
        id: uid(),
        title: titleFromMsgs(obj.msgs),
        updatedAt: Date.now(),
        msgs: obj.msgs,
      });
    } catch (e) {
      return null;
    }
  }

  function persistStore() {
    try {
      var sorted = sortConversations(state.conversations).slice(0, MAX_CONVERSATIONS);
      state.conversations = sorted;
      localStorage.setItem(
        chatStorageKey(),
        JSON.stringify({
          v: STAFF_CHAT_VERSION,
          activeId: state.activeId || (sorted[0] && sorted[0].id) || "",
          conversations: sorted,
        })
      );
    } catch (e) {
      /* quota / private mode */
    }
  }

  function loadStore() {
    try {
      var raw = localStorage.getItem(chatStorageKey());
      if (raw) {
        var obj = JSON.parse(raw);
        var list = Array.isArray(obj && obj.conversations) ? obj.conversations : [];
        state.conversations = sortConversations(
          list
            .map(normalizeConversation)
            .filter(Boolean)
        );
        state.activeId = String((obj && obj.activeId) || "").trim();
        if (state.activeId && !state.conversations.some(function (c) { return c.id === state.activeId; })) {
          state.activeId = "";
        }
        if (!state.activeId && state.conversations.length) {
          state.activeId = state.conversations[0].id;
        }
        return;
      }
    } catch (e) {
      /* fall through */
    }

    var legacy = loadLegacyChat();
    if (legacy) {
      state.conversations = [legacy];
      state.activeId = legacy.id;
      persistStore();
      try {
        localStorage.removeItem(legacyChatStorageKey());
      } catch (e2) {}
      return;
    }

    state.conversations = [];
    state.activeId = "";
  }

  function getActiveConversation() {
    var id = state.activeId;
    for (var i = 0; i < state.conversations.length; i++) {
      if (state.conversations[i].id === id) return state.conversations[i];
    }
    return null;
  }

  function syncActiveMsgsToStore() {
    var active = getActiveConversation();
    if (!active) return;
    active.msgs = sanitizeMsgs(state.conversation);
    active.title = titleFromMsgs(active.msgs);
    active.updatedAt = Date.now();
    persistStore();
  }

  function ensureActiveConversation() {
    var active = getActiveConversation();
    if (active) return active;
    var created = normalizeConversation({
      id: uid(),
      title: t("assistant_untitled_chat"),
      updatedAt: Date.now(),
      msgs: [],
    });
    state.conversations.unshift(created);
    state.activeId = created.id;
    persistStore();
    return created;
  }

  function formatChatTime(ts) {
    var n = Number(ts) || 0;
    if (!n) return "";
    try {
      return new Date(n).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  }

  function renderShell() {
    return (
      '<div class="crm-assistant-shell">' +
      '<h1 class="crm-assistant-page-title">' +
      esc(t("assistant_title")) +
      "</h1>" +
      '<div class="crm-assistant-layout">' +
      '<aside class="crm-assistant-sidebar" aria-label="' +
      esc(t("assistant_history_label")) +
      '">' +
      '<div class="crm-assistant-sidebar-head">' +
      "<strong>" +
      esc(t("assistant_history_label")) +
      "</strong>" +
      '<button type="button" class="crm-btn secondary crm-assistant-sidebar-new" id="crm-assistant-new">' +
      esc(t("assistant_new_convo")) +
      "</button></div>" +
      '<div id="crm-assistant-history" class="crm-assistant-history" role="list"></div>' +
      "</aside>" +
      '<div class="crm-assistant-wrap">' +
      '<div class="crm-assistant-head">' +
      "<div><strong>" +
      esc(t("assistant_title")) +
      "</strong>" +
      '<div class="crm-assistant-note">' +
      esc(t("assistant_subtitle")) +
      "</div></div>" +
      '<button type="button" class="crm-btn secondary crm-assistant-new-desktop" id="crm-assistant-new-head">' +
      esc(t("assistant_new_convo")) +
      "</button></div>" +
      '<div id="crm-assistant-log" class="crm-assistant-log" role="log" aria-live="polite"></div>' +
      '<div class="crm-assistant-compose">' +
      "<div>" +
      '<textarea id="crm-assistant-input" spellcheck="true" placeholder="' +
      esc(t("assistant_placeholder")) +
      '"></textarea>' +
      '<div id="crm-assistant-err" class="crm-assistant-err"></div>' +
      "</div>" +
      '<button type="button" class="crm-btn" id="crm-assistant-send">' +
      esc(t("assistant_send")) +
      "</button></div></div></div></div>"
    );
  }

  function renderHistoryList() {
    var host = $("crm-assistant-history");
    if (!host) return;
    var list = sortConversations(state.conversations);
    state.conversations = list;
    if (!list.length) {
      host.innerHTML =
        '<div class="crm-assistant-history-empty">' + esc(t("assistant_history_empty")) + "</div>";
      return;
    }
    host.innerHTML = list
      .map(function (c) {
        var active = c.id === state.activeId ? " is-active" : "";
        var preview = esc(c.title || t("assistant_untitled_chat"));
        var when = esc(formatChatTime(c.updatedAt));
        return (
          '<div class="crm-assistant-history-item' +
          active +
          '" role="listitem" data-id="' +
          esc(c.id) +
          '">' +
          '<button type="button" class="crm-assistant-history-open" data-id="' +
          esc(c.id) +
          '" title="' +
          preview +
          '">' +
          '<span class="crm-assistant-history-title">' +
          preview +
          "</span>" +
          (when
            ? '<span class="crm-assistant-history-meta">' + when + "</span>"
            : "") +
          "</button>" +
          '<button type="button" class="crm-assistant-history-trash" data-id="' +
          esc(c.id) +
          '" aria-label="' +
          esc(t("assistant_delete_chat")) +
          '" title="' +
          esc(t("assistant_delete_chat")) +
          '"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9zm-1 12h12a1 1 0 0 0 1-1V8H5v12a1 1 0 0 0 1 1z"/></svg></button></div>'
        );
      })
      .join("");
  }

  function addMessage(role, content, source) {
    var log = $("crm-assistant-log");
    if (!log) return;
    var row = document.createElement("div");
    row.className = "crm-assistant-msg-row " + role;
    var bubble = document.createElement("div");
    bubble.className = "crm-assistant-msg " + role;
    if (role === "assistant") bubble.innerHTML = renderMarkdown(stripSourceHeader(content));
    else bubble.textContent = String(content || "");
    row.appendChild(bubble);
    if (role === "assistant") {
      var marker = document.createElement("div");
      var sourceUi = normalizeSourceLabel(source);
      marker.className = "crm-assistant-source " + sourceUi.cls;
      marker.textContent = sourceUi.text;
      marker.title =
        source === "internal_rag"
          ? t("assistant_source_rag_tip")
          : source === "general_fallback"
            ? t("assistant_source_general_tip")
            : t("assistant_source_unknown_tip");
      row.appendChild(marker);
    }
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
  }

  function renderMarkdown(text) {
    var lines = String(text || "")
      .replace(/\r/g, "")
      .split("\n");
    var html = [];
    var inUl = false;
    var inOl = false;
    var inTable = false;

    function closeLists() {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }
      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
    }
    function closeTable() {
      if (inTable) {
        html.push("</tbody></table>");
        inTable = false;
      }
    }
    function inline(str) {
      return esc(str)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(
          /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );
    }

    for (var i = 0; i < lines.length; i++) {
      var trim = lines[i].trim();
      if (!trim) {
        closeLists();
        closeTable();
        continue;
      }
      var ul = trim.match(/^-\s+(.+)/);
      var ol = trim.match(/^\d+\.\s+(.+)/);
      if (ul) {
        closeTable();
        if (!inUl) {
          closeLists();
          html.push("<ul>");
          inUl = true;
        }
        html.push("<li>" + inline(ul[1]) + "</li>");
        continue;
      }
      if (ol) {
        closeTable();
        if (!inOl) {
          closeLists();
          html.push("<ol>");
          inOl = true;
        }
        html.push("<li>" + inline(ol[1]) + "</li>");
        continue;
      }
      if (trim.indexOf("|") !== -1) {
        closeLists();
        var cells = trim
          .split("|")
          .map(function (c) {
            return c.trim();
          })
          .filter(Boolean);
        if (cells.length >= 2) {
          if (!inTable) {
            html.push("<table><tbody>");
            inTable = true;
          }
          html.push(
            "<tr>" +
              cells
                .map(function (c) {
                  return "<td>" + inline(c) + "</td>";
                })
                .join("") +
              "</tr>"
          );
          continue;
        }
      }
      closeLists();
      closeTable();
      html.push("<p>" + inline(trim) + "</p>");
    }
    closeLists();
    closeTable();
    return html.join("") || "<p></p>";
  }

  function stripSourceHeader(content) {
    return String(content || "")
      .replace(/^source:\s.*(?:\r?\n)+/i, "")
      .trim();
  }

  function normalizeSourceLabel(source) {
    if (source === "internal_rag") return { text: t("assistant_source_rag"), cls: "rag" };
    if (source === "general_fallback") return { text: t("assistant_source_general"), cls: "general" };
    return { text: t("assistant_source_unknown"), cls: "" };
  }

  function setThinking(on) {
    var log = $("crm-assistant-log");
    if (!log) return;
    if (on) {
      if (state.thinkingNode) return;
      state.thinkingNode = document.createElement("div");
      state.thinkingNode.className = "crm-assistant-thinking";
      state.thinkingNode.textContent = t("assistant_thinking");
      log.appendChild(state.thinkingNode);
      log.scrollTop = log.scrollHeight;
    } else if (state.thinkingNode) {
      state.thinkingNode.remove();
      state.thinkingNode = null;
    }
  }

  function hydrateLogFromActive() {
    var log = $("crm-assistant-log");
    if (!log) return;
    log.innerHTML = "";
    state.thinkingNode = null;
    var active = ensureActiveConversation();
    var stored = sanitizeMsgs(active.msgs);
    state.conversation = stored.map(function (m) {
      return { role: m.role, content: m.content, source: m.source || "", ts: m.ts };
    });
    stored.forEach(function (m) {
      addMessage(m.role, m.content, m.source || "");
    });
    renderHistoryList();
  }

  function selectConversation(id) {
    if (!id || id === state.activeId) return;
    syncActiveMsgsToStore();
    var found = state.conversations.some(function (c) {
      return c.id === id;
    });
    if (!found) return;
    state.activeId = id;
    // bump to top as most recently used
    var active = getActiveConversation();
    if (active) active.updatedAt = Date.now();
    persistStore();
    hydrateLogFromActive();
    var err = $("crm-assistant-err");
    if (err) err.textContent = "";
    var input = $("crm-assistant-input");
    if (input) input.focus();
  }

  function deleteConversation(id) {
    if (!id) return;
    if (!window.confirm(t("assistant_delete_confirm"))) return;
    state.conversations = state.conversations.filter(function (c) {
      return c.id !== id;
    });
    if (state.activeId === id) {
      state.activeId = state.conversations[0] ? state.conversations[0].id : "";
      if (!state.activeId) {
        ensureActiveConversation();
      }
      hydrateLogFromActive();
    } else {
      persistStore();
      renderHistoryList();
    }
  }

  function newConversation() {
    syncActiveMsgsToStore();
    var created = normalizeConversation({
      id: uid(),
      title: t("assistant_untitled_chat"),
      updatedAt: Date.now(),
      msgs: [],
    });
    state.conversations.unshift(created);
    state.activeId = created.id;
    persistStore();
    hydrateLogFromActive();
    var err = $("crm-assistant-err");
    if (err) err.textContent = "";
    var input = $("crm-assistant-input");
    if (input) {
      input.value = "";
      input.focus();
    }
  }

  async function resolveUserId() {
    state.userId = "";
    try {
      var sb = window.StaffCrm && window.StaffCrm.getSupabase ? window.StaffCrm.getSupabase() : null;
      if (!sb || !sb.auth || !sb.auth.getUser) return;
      var u = await sb.auth.getUser();
      state.userId = (u && u.data && u.data.user && u.data.user.id) || "";
    } catch (e) {
      state.userId = "";
    }
  }

  async function sendChat() {
    var input = $("crm-assistant-input");
    var err = $("crm-assistant-err");
    var sendBtn = $("crm-assistant-send");
    if (!input) return;
    var text = String(input.value || "").trim();
    if (!text) return;
    if (err) err.textContent = "";
    ensureActiveConversation();
    input.value = "";
    addMessage("user", text);
    state.conversation.push({ role: "user", content: text, ts: Date.now() });
    state.conversation = trimChat(state.conversation);
    syncActiveMsgsToStore();
    renderHistoryList();
    setThinking(true);
    if (sendBtn) sendBtn.disabled = true;
    try {
      var data = await api("/api/staff-chat", {
        message: text,
        conversationHistory: state.conversation,
      });
      if (!data.answer) throw new Error(data.error || "Failed");
      var src = data.source || "";
      state.conversation.push({
        role: "assistant",
        content: data.answer,
        source: src,
        ts: Date.now(),
      });
      state.conversation = trimChat(state.conversation);
      syncActiveMsgsToStore();
      renderHistoryList();
      addMessage("assistant", data.answer, src);
    } catch (e) {
      if (err) err.textContent = t("assistant_send_failed");
    } finally {
      setThinking(false);
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
    }
  }

  function wireHandlers() {
    var sendBtn = $("crm-assistant-send");
    var input = $("crm-assistant-input");
    var newBtn = $("crm-assistant-new");
    var newHead = $("crm-assistant-new-head");
    var history = $("crm-assistant-history");

    if (sendBtn) {
      sendBtn.addEventListener("click", function () {
        void sendChat();
      });
    }
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          void sendChat();
        }
      });
    }
    if (newBtn) newBtn.addEventListener("click", newConversation);
    if (newHead) newHead.addEventListener("click", newConversation);
    if (history) {
      history.addEventListener("click", function (e) {
        var trash = e.target.closest(".crm-assistant-history-trash");
        if (trash) {
          e.preventDefault();
          e.stopPropagation();
          deleteConversation(trash.getAttribute("data-id"));
          return;
        }
        var open = e.target.closest(".crm-assistant-history-open");
        if (open) {
          e.preventDefault();
          selectConversation(open.getAttribute("data-id"));
        }
      });
    }
  }

  async function mount(main) {
    if (!main) return;
    main.innerHTML = renderShell();
    wireHandlers();
    await resolveUserId();
    loadStore();
    ensureActiveConversation();
    hydrateLogFromActive();
    var input = $("crm-assistant-input");
    if (input) input.focus();
  }

  window.StaffCrmAssistant = { mount: mount };
})();
