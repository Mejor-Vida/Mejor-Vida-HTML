/**
 * Mejor Vida — floating website assistant (RAG, session-only storage).
 * POST /api/website-chat (rewrites to /api/rag-site) with session_id + history.
 */
(function () {
  "use strict";

  var STORAGE_SESSION = "mvi_assistant_session_id";
  var STORAGE_MESSAGES = "mvi_assistant_messages";
  var STORAGE_LANG = "mvi_assistant_language";
  var API_URL = "/api/website-chat";
  var FETCH_TIMEOUT_MS = 30000;
  var HISTORY_SEND = 6;
  var READ_MORE_AT = 420;
  var MAX_STORED_MESSAGES = 24;

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return "mvi-" + Date.now() + "-" + Math.random().toString(36).slice(2, 11);
  }

  function loadJson(key, fallback) {
    try {
      var raw = sessionStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, val) {
    try {
      sessionStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      /* quota or disabled */
    }
  }

  function getInitialLanguage() {
    var stored = sessionStorage.getItem(STORAGE_LANG);
    if (stored === "Spanish" || stored === "English") return stored;
    var nav = (navigator.language || "").toLowerCase();
    return nav.indexOf("es") === 0 ? "Spanish" : "English";
  }

  var NAV_TO_ASSISTANT_BOUND = false;

  /** Desktop header + mobile drawer: "Got questions?" links use #final-expense-answers — open chat instead. */
  function bindNavQuestionsToAssistant(setOpen) {
    if (NAV_TO_ASSISTANT_BOUND) return;
    NAV_TO_ASSISTANT_BOUND = true;
    document.addEventListener(
      "click",
      function (e) {
        var a = e.target && e.target.closest && e.target.closest("a[href]");
        if (!a) return;
        if (a.getAttribute("target") === "_blank") return;
        var href = a.getAttribute("href") || "";
        if (href.indexOf("#final-expense-answers") === -1) return;
        if (!a.closest("header")) return;
        e.preventDefault();
        setOpen(true);
        var mm = document.getElementById("mobile-menu");
        if (mm) mm.classList.remove("active");
        var hb = document.getElementById("hamburger-btn");
        if (hb) hb.textContent = "☰";
      },
      true,
    );
  }

  var T = {
    English: {
      title: "Mejor Vida Assistant",
      subtitle: "Final expense insurance help",
      placeholder: "Type your message…",
      send: "Send",
      thinking: "Assistant is typing",
      readMore: "Read more",
      readLess: "Show less",
      error: "Sorry, I couldn't reach the server. Please try again.",
      openChat: "Open chat assistant",
      closeChat: "Close",
      minimize: "Minimize",
      langShort: "EN",
      langSwitch: "Español",
      suggestedHeading: "Try asking:",
      s1: "What is final expense insurance?",
      s2: "How much does coverage usually cost?",
      s3: "Do I need a medical exam?",
    },
    Spanish: {
      title: "Asistente Mejor Vida",
      subtitle: "Ayuda con seguro de gastos finales",
      placeholder: "Escribe tu mensaje…",
      send: "Enviar",
      thinking: "El asistente está escribiendo",
      readMore: "Leer más",
      readLess: "Mostrar menos",
      error: "No pude conectar con el servidor. Intenta de nuevo.",
      openChat: "Abrir asistente de chat",
      closeChat: "Cerrar",
      minimize: "Minimizar",
      langShort: "ES",
      langSwitch: "English",
      suggestedHeading: "Prueba preguntar:",
      s1: "¿Qué es un seguro de gastos finales?",
      s2: "¿Cuánto cuesta la cobertura?",
      s3: "¿Necesito examen médico?",
    },
  };

  function mount(root) {
    if (!root) return;

    var apiUrl = root.getAttribute("data-api-url") || API_URL;

    var state = {
      open: false,
      loading: false,
      language: getInitialLanguage(),
      messages: loadJson(STORAGE_MESSAGES, []),
      sessionId: sessionStorage.getItem(STORAGE_SESSION) || "",
      unread: 0,
    };

    if (!state.sessionId) {
      state.sessionId = uuid();
      sessionStorage.setItem(STORAGE_SESSION, state.sessionId);
    }

    if (!Array.isArray(state.messages)) state.messages = [];

    root.innerHTML =
      '<div class="mvi-assist-fab-wrap" aria-live="polite">' +
      '  <button type="button" class="mvi-assist-fab" aria-expanded="false" aria-controls="mvi-assist-panel">' +
      '    <span class="mvi-assist-fab-icon" aria-hidden="true"><i class="fas fa-comments"></i></span>' +
      '    <span class="mvi-assist-fab-badge" hidden data-mvi-badge>0</span>' +
      "  </button>" +
      '  <div id="mvi-assist-panel" class="mvi-assist-panel" role="dialog" aria-modal="true" aria-label="Chat" hidden>' +
      '    <div class="mvi-assist-header">' +
      '      <div class="mvi-assist-header-text">' +
      '        <div class="mvi-assist-title" data-mvi-title></div>' +
      '        <div class="mvi-assist-subtitle small" data-mvi-subtitle></div>' +
      "      </div>" +
      '      <div class="mvi-assist-header-actions">' +
      '        <button type="button" class="mvi-assist-lang btn btn-sm" data-mvi-lang></button>' +
      '        <button type="button" class="mvi-assist-close btn btn-sm" data-mvi-close>&times;</button>' +
      "      </div>" +
      "    </div>" +
      '    <div class="mvi-assist-messages" data-mvi-messages tabindex="0" role="log"></div>' +
      '    <div class="mvi-assist-suggested" data-mvi-suggested></div>' +
      '    <div class="mvi-assist-compose">' +
      '      <label class="visually-hidden" for="mvi-assist-input" data-mvi-input-label>Message</label>' +
      '      <textarea id="mvi-assist-input" class="mvi-assist-input" rows="1" data-mvi-input autocomplete="off"></textarea>' +
      '      <button type="button" class="mvi-assist-send btn btn-primary" data-mvi-send></button>' +
      "    </div>" +
      "  </div>" +
      "</div>";

    var fab = root.querySelector(".mvi-assist-fab");
    var panel = root.querySelector(".mvi-assist-panel");
    var badge = root.querySelector("[data-mvi-badge]");
    var elTitle = root.querySelector("[data-mvi-title]");
    var elSub = root.querySelector("[data-mvi-subtitle]");
    var elLang = root.querySelector("[data-mvi-lang]");
    var elClose = root.querySelector("[data-mvi-close]");
    var elMessages = root.querySelector("[data-mvi-messages]");
    var elSuggested = root.querySelector("[data-mvi-suggested]");
    var elInput = root.querySelector("[data-mvi-input]");
    var elSend = root.querySelector("[data-mvi-send]");
    var elInputLabel = root.querySelector("[data-mvi-input-label]");

    function tr() {
      return T[state.language] || T.English;
    }

    function persistMessages() {
      var trimmed = state.messages.slice(-MAX_STORED_MESSAGES);
      state.messages = trimmed;
      saveJson(STORAGE_MESSAGES, trimmed);
    }

    function applyChromeStrings() {
      var t = tr();
      elTitle.textContent = t.title;
      elSub.textContent = t.subtitle;
      elInput.placeholder = t.placeholder;
      elSend.textContent = t.send;
      elInput.setAttribute("aria-label", t.placeholder);
      elInputLabel.textContent = t.placeholder;
      elLang.textContent = t.langSwitch;
      elLang.setAttribute("aria-label", "Switch language to " + t.langSwitch);
      fab.setAttribute("aria-label", t.openChat);
      elClose.setAttribute("aria-label", t.closeChat);
      sessionStorage.setItem(STORAGE_LANG, state.language);
    }

    function renderSuggested() {
      var t = tr();
      if (state.messages.length > 0) {
        elSuggested.innerHTML = "";
        elSuggested.classList.add("d-none");
        return;
      }
      elSuggested.classList.remove("d-none");
      elSuggested.innerHTML =
        '<p class="mvi-assist-suggested-label small text-muted mb-2">' +
        escapeHtml(t.suggestedHeading) +
        "</p>" +
        '<div class="mvi-assist-chips">' +
        ["s1", "s2", "s3"]
          .map(function (k) {
            var text = t[k];
            return (
              '<button type="button" class="mvi-assist-chip btn btn-sm btn-outline-secondary">' +
              escapeHtml(text) +
              "</button>"
            );
          })
          .join("") +
        "</div>";
      elSuggested.querySelectorAll(".mvi-assist-chip").forEach(function (btn) {
        btn.addEventListener("click", function () {
          elInput.value = btn.textContent.trim();
          sendMessage();
        });
      });
    }

    function appendBubble(role, content, meta) {
      meta = meta || {};
      var isUser = role === "user";
      var wrap = document.createElement("div");
      wrap.className = "mvi-assist-msg mvi-assist-msg--" + (isUser ? "user" : "assistant");
      var inner = escapeHtml(content).replace(/\n/g, "<br>");
      if (!isUser && meta.expandable) {
        var shortHtml = escapeHtml(meta.short).replace(/\n/g, "<br>");
        inner =
          '<span data-mvi-short>' +
          shortHtml +
          '</span><span data-mvi-rest class="d-none">' +
          escapeHtml(meta.rest).replace(/\n/g, "<br>") +
          '</span> <button type="button" class="mvi-assist-more btn btn-link btn-sm p-0">' +
          escapeHtml(tr().readMore) +
          "</button>";
      }
      wrap.innerHTML =
        '<div class="mvi-assist-bubble">' +
        (isUser ? "" : '<div class="mvi-assist-name small">' + escapeHtml(tr().title) + "</div>") +
        '<div class="mvi-assist-bubble-body">' +
        inner +
        "</div></div>";
      if (!isUser && meta.expandable) {
        var moreBtn = wrap.querySelector(".mvi-assist-more");
        var shortEl = wrap.querySelector("[data-mvi-short]");
        var restEl = wrap.querySelector("[data-mvi-rest]");
        moreBtn.addEventListener("click", function () {
          var expanded = !restEl.classList.contains("d-none");
          if (expanded) {
            restEl.classList.add("d-none");
            moreBtn.textContent = tr().readMore;
          } else {
            restEl.classList.remove("d-none");
            moreBtn.textContent = tr().readLess;
          }
        });
      }
      elMessages.appendChild(wrap);
      elMessages.scrollTop = elMessages.scrollHeight;
    }

    function appendTyping() {
      var wrap = document.createElement("div");
      wrap.className = "mvi-assist-msg mvi-assist-msg--assistant mvi-assist-msg--typing";
      wrap.setAttribute("data-mvi-typing", "1");
      wrap.innerHTML =
        '<div class="mvi-assist-bubble mvi-assist-typing-bubble">' +
        '<span class="mvi-assist-typing-text">' +
        escapeHtml(tr().thinking) +
        '</span><span class="mvi-assist-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span></div>';
      elMessages.appendChild(wrap);
      elMessages.scrollTop = elMessages.scrollHeight;
    }

    function removeTyping() {
      var t = elMessages.querySelector("[data-mvi-typing]");
      if (t) t.remove();
    }

    function historyForApi() {
      return state.messages.slice(-HISTORY_SEND).map(function (m) {
        return { role: m.role, content: m.content };
      });
    }

    function sendMessage() {
      var text = String(elInput.value || "").trim();
      if (!text || state.loading) return;
      elInput.value = "";
      state.messages.push({ role: "user", content: text, ts: Date.now() });
      persistMessages();
      appendBubble("user", text);
      renderSuggested();
      state.loading = true;
      appendTyping();

      var controller = new AbortController();
      var to = window.setTimeout(function () {
        controller.abort();
      }, FETCH_TIMEOUT_MS);

      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: state.sessionId,
          message: text,
          language: state.language,
          history: historyForApi().slice(0, -1),
        }),
        signal: controller.signal,
      })
        .then(function (r) {
          return r.json().then(function (data) {
            return { ok: r.ok, status: r.status, data: data };
          });
        })
        .then(function (res) {
          window.clearTimeout(to);
          removeTyping();
          state.loading = false;
          var data = res.data || {};
          var answer = typeof data.answer === "string" ? data.answer : "";
          if (!res.ok || data.status === "error") {
            answer = tr().error;
          } else if (data.status === "no_answer" && !answer) {
            answer = tr().error;
          }
          var meta = {};
          if (answer.length > READ_MORE_AT) {
            meta.expandable = true;
            meta.short = answer.slice(0, READ_MORE_AT).trim() + "…";
            meta.rest = answer.slice(READ_MORE_AT).trim();
          }
          state.messages.push({ role: "assistant", content: answer, ts: Date.now() });
          persistMessages();
          if (meta.expandable) {
            appendBubble("assistant", meta.short, meta);
          } else {
            appendBubble("assistant", answer);
          }
          if (!state.open) {
            state.unread += 1;
            badge.textContent = String(state.unread);
            badge.hidden = false;
          }
        })
        .catch(function () {
          window.clearTimeout(to);
          removeTyping();
          state.loading = false;
          var errText = tr().error;
          state.messages.push({ role: "assistant", content: errText, ts: Date.now() });
          persistMessages();
          appendBubble("assistant", errText);
        });
    }

    function setOpen(open) {
      state.open = open;
      fab.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
      if (open) {
        state.unread = 0;
        badge.hidden = true;
        elInput.focus();
      }
    }

    function hydrateFromStorage() {
      elMessages.innerHTML = "";
      state.messages.forEach(function (m) {
        if (m.role === "user" || m.role === "assistant") {
          appendBubble(m.role, m.content);
        }
      });
      renderSuggested();
    }

    fab.addEventListener("click", function () {
      setOpen(!state.open);
    });
    elClose.addEventListener("click", function () {
      setOpen(false);
    });
    elLang.addEventListener("click", function () {
      state.language = state.language === "Spanish" ? "English" : "Spanish";
      applyChromeStrings();
      renderSuggested();
    });
    elSend.addEventListener("click", sendMessage);
    elInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    bindNavQuestionsToAssistant(setOpen);
    window.MviOpenAssistant = function () {
      setOpen(true);
    };

    applyChromeStrings();
    hydrateFromStorage();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("mvi-assistant-root");
    if (root) mount(root);
  });
})();
