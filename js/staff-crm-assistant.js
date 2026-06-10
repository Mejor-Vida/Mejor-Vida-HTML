/**
 * CRM Staff Assistant — internal AI chat (RAG + general fallback).
 */
(function () {
  "use strict";

  var STAFF_CHAT_VERSION = 1;
  var MAX_CHAT_MESSAGES = 100;

  var state = {
    userId: "",
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

  function trimChat(msgs) {
    if (!Array.isArray(msgs)) return [];
    if (msgs.length <= MAX_CHAT_MESSAGES) return msgs;
    return msgs.slice(msgs.length - MAX_CHAT_MESSAGES);
  }

  function loadStoredChat() {
    try {
      var raw = localStorage.getItem(chatStorageKey());
      if (!raw) return [];
      var obj = JSON.parse(raw);
      if (!obj || !Array.isArray(obj.msgs)) return [];
      return trimChat(
        obj.msgs.filter(function (m) {
          return m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string";
        })
      );
    } catch (e) {
      return [];
    }
  }

  function saveStoredChat(msgs) {
    try {
      localStorage.setItem(
        chatStorageKey(),
        JSON.stringify({ v: STAFF_CHAT_VERSION, msgs: trimChat(msgs || []) })
      );
    } catch (e) {
      /* quota / private mode */
    }
  }

  function clearStoredChat() {
    try {
      localStorage.removeItem(chatStorageKey());
    } catch (e) {}
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

  function renderShell() {
    return (
      '<div class="crm-assistant-shell">' +
      '<h1 class="crm-assistant-page-title">' +
      esc(t("assistant_title")) +
      "</h1>" +
      '<div class="crm-assistant-wrap">' +
      '<div class="crm-assistant-head">' +
      "<div><strong>" +
      esc(t("assistant_title")) +
      "</strong>" +
      '<div class="crm-assistant-note">' +
      esc(t("assistant_subtitle")) +
      "</div></div>" +
      '<button type="button" class="crm-btn secondary" id="crm-assistant-new">' +
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
      "</button></div></div></div>"
    );
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

  function hydrateLog() {
    var log = $("crm-assistant-log");
    if (!log) return;
    log.innerHTML = "";
    state.thinkingNode = null;
    var stored = loadStoredChat();
    state.conversation = stored.map(function (m) {
      return { role: m.role, content: m.content };
    });
    stored.forEach(function (m) {
      addMessage(m.role, m.content, m.source || "");
    });
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
    input.value = "";
    addMessage("user", text);
    state.conversation.push({ role: "user", content: text, ts: Date.now() });
    state.conversation = trimChat(state.conversation);
    saveStoredChat(state.conversation);
    setThinking(true);
    if (sendBtn) sendBtn.disabled = true;
    try {
      var data = await api("/api/staff-chat", {
        message: text,
        conversationHistory: state.conversation,
      });
      if (!data.answer) throw new Error(data.error || "Failed");
      var src = data.source || "";
      state.conversation.push({ role: "assistant", content: data.answer, source: src, ts: Date.now() });
      state.conversation = trimChat(state.conversation);
      saveStoredChat(state.conversation);
      addMessage("assistant", data.answer, src);
    } catch (e) {
      if (err) err.textContent = t("assistant_send_failed");
    } finally {
      setThinking(false);
      if (sendBtn) sendBtn.disabled = false;
      input.focus();
    }
  }

  function newConversation() {
    state.conversation = [];
    var log = $("crm-assistant-log");
    if (log) log.innerHTML = "";
    state.thinkingNode = null;
    var err = $("crm-assistant-err");
    if (err) err.textContent = "";
    clearStoredChat();
    var input = $("crm-assistant-input");
    if (input) input.focus();
  }

  function wireHandlers() {
    var sendBtn = $("crm-assistant-send");
    var input = $("crm-assistant-input");
    var newBtn = $("crm-assistant-new");
    if (sendBtn) sendBtn.addEventListener("click", function () {
      void sendChat();
    });
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          void sendChat();
        }
      });
    }
    if (newBtn) newBtn.addEventListener("click", newConversation);
  }

  async function mount(main) {
    if (!main) return;
    main.innerHTML = renderShell();
    wireHandlers();
    await resolveUserId();
    hydrateLog();
    var input = $("crm-assistant-input");
    if (input) input.focus();
  }

  window.StaffCrmAssistant = { mount: mount };
})();
