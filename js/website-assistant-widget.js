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
    // Match main site language (script.js sessionLang) so EN page + EN chat API agree.
    var site = sessionStorage.getItem("sessionLang");
    if (site === "en") return "English";
    if (site === "es") return "Spanish";
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
      dragHint: "Drag header to move the chat window · Double-click header to dock above the button",
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
      dragHint: "Arrastra el encabezado para mover la ventana · Doble clic para acoplar sobre el botón",
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

    function emitAvatarHook(detail) {
      root.dispatchEvent(new CustomEvent("mvi-assistant-hook", { bubbles: false, detail: detail }));
    }

    root.innerHTML =
      '<div class="mvi-assist-fab-wrap" aria-live="polite">' +
      '  <div class="mvi-assist-launcher" data-mvi-launcher>' +
      '    <button type="button" class="mvi-assist-avatar-open" data-mvi-avatar-open aria-label="Open chat assistant">' +
      '      <span class="mvi-assist-avatar-shell" data-mvi-avatar-shell></span>' +
      "    </button>" +
      '    <button type="button" class="mvi-assist-fab" aria-expanded="false" aria-controls="mvi-assist-panel">' +
      '      <span class="mvi-assist-fab-icon" aria-hidden="true"><i class="fas fa-comments"></i></span>' +
      '      <span class="mvi-assist-fab-badge" hidden data-mvi-badge>0</span>' +
      "    </button>" +
      "  </div>" +
      '  <div id="mvi-assist-panel" class="mvi-assist-panel" role="dialog" aria-modal="true" aria-label="Chat" hidden>' +
      '    <div class="mvi-assist-header" data-mvi-header>' +
      '      <div class="mvi-assist-header-start">' +
      '        <div class="mvi-assist-avatar-host-open" data-mvi-avatar-host-open></div>' +
      '        <div class="mvi-assist-header-text">' +
      '          <div class="mvi-assist-title" data-mvi-title></div>' +
      '          <div class="mvi-assist-subtitle small" data-mvi-subtitle></div>' +
      "        </div>" +
      "      </div>" +
      '      <div class="mvi-assist-header-actions">' +
      '        <div class="mvi-assist-lang-toggle" role="group" data-mvi-lang-toggle>' +
      '          <button type="button" class="mvi-assist-lang-btn" data-mvi-lang-pick="es" aria-pressed="false">ES</button>' +
      '          <button type="button" class="mvi-assist-lang-btn" data-mvi-lang-pick="en" aria-pressed="false">EN</button>' +
      "        </div>" +
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
    var elLangToggle = root.querySelector("[data-mvi-lang-toggle]");
    var elLangEs = root.querySelector('[data-mvi-lang-pick="es"]');
    var elLangEn = root.querySelector('[data-mvi-lang-pick="en"]');
    var elClose = root.querySelector("[data-mvi-close]");
    var elMessages = root.querySelector("[data-mvi-messages]");
    var elSuggested = root.querySelector("[data-mvi-suggested]");
    var elInput = root.querySelector("[data-mvi-input]");
    var elSend = root.querySelector("[data-mvi-send]");
    var elInputLabel = root.querySelector("[data-mvi-input-label]");
    var elHeader = root.querySelector("[data-mvi-header]");

    var dragState = {
      active: false,
      pointerId: null,
      startX: 0,
      startY: 0,
      panelLeft: 0,
      panelTop: 0,
    };
    var panelPositionCustom = false;

    function clampPanelPosition(left, top) {
      var pad = 8;
      var w = panel.offsetWidth || 200;
      var h = panel.offsetHeight || 200;
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var maxL = Math.max(pad, vw - w - pad);
      var maxT = Math.max(pad, vh - h - pad);
      return {
        left: Math.min(Math.max(pad, left), maxL),
        top: Math.min(Math.max(pad, top), maxT),
      };
    }

    function applyPanelPosition(left, top) {
      if (!panel.classList.contains("mvi-assist-panel--custom-pos")) {
        var r0 = panel.getBoundingClientRect();
        panel.style.width = Math.round(r0.width) + "px";
        panel.style.height = Math.round(r0.height) + "px";
        panel.classList.add("mvi-assist-panel--custom-pos");
      }
      var c = clampPanelPosition(left, top);
      panel.style.left = Math.round(c.left) + "px";
      panel.style.top = Math.round(c.top) + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panelPositionCustom = true;
    }

    function snapPanelToDefault() {
      dragState.active = false;
      dragState.pointerId = null;
      if (elHeader) elHeader.classList.remove("mvi-assist-header--dragging");
      panel.style.left = "";
      panel.style.top = "";
      panel.style.right = "";
      panel.style.bottom = "";
      panel.style.width = "";
      panel.style.height = "";
      panel.classList.remove("mvi-assist-panel--custom-pos");
      panel.classList.remove("mvi-assist-panel--dragging");
      panelPositionCustom = false;
    }

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
      var isEs = state.language === "Spanish";
      if (elLangEs && elLangEn && elLangToggle) {
        elLangEs.classList.toggle("active", isEs);
        elLangEn.classList.toggle("active", !isEs);
        elLangEs.setAttribute("aria-pressed", isEs ? "true" : "false");
        elLangEn.setAttribute("aria-pressed", isEs ? "false" : "true");
        elLangToggle.setAttribute(
          "aria-label",
          isEs ? "Idioma del chat (ES activo)" : "Chat language (EN active)",
        );
      }
      fab.setAttribute("aria-label", t.openChat);
      var avOpenEl = root.querySelector("[data-mvi-avatar-open]");
      if (avOpenEl) avOpenEl.setAttribute("aria-label", t.openChat);
      elClose.setAttribute("aria-label", t.closeChat);
      if (elHeader) elHeader.setAttribute("title", t.dragHint);
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
      emitAvatarHook({ hook: "thinking" });

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
          emitAvatarHook({ hook: "replied", ok: res.ok });
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
          emitAvatarHook({ hook: "replied", ok: false });
          var errText = tr().error;
          state.messages.push({ role: "assistant", content: errText, ts: Date.now() });
          persistMessages();
          appendBubble("assistant", errText);
        });
    }

    function setOpen(open) {
      if (state.open === open) {
        if (open) elInput.focus();
        return;
      }
      state.open = open;
      fab.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
      var shell = root.querySelector("[data-mvi-avatar-shell]");
      var openHost = root.querySelector("[data-mvi-avatar-host-open]");
      var avBtn = root.querySelector("[data-mvi-avatar-open]");
      if (shell && openHost && avBtn) {
        if (open) {
          if (shell.parentNode !== openHost) openHost.appendChild(shell);
          avBtn.hidden = true;
        } else {
          if (shell.parentNode !== avBtn) avBtn.appendChild(shell);
          avBtn.hidden = false;
        }
      }
      emitAvatarHook({ hook: "panel", open: open });
      if (!open) {
        snapPanelToDefault();
      } else {
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
    var avatarOpenBtn = root.querySelector("[data-mvi-avatar-open]");
    if (avatarOpenBtn) {
      avatarOpenBtn.addEventListener("click", function () {
        setOpen(true);
      });
    }
    elClose.addEventListener("click", function () {
      setOpen(false);
    });
    function pickChatLang(code) {
      window.dispatchEvent(new CustomEvent("mvi-assistant-language", { detail: { code: code } }));
    }
    if (elLangEs) elLangEs.addEventListener("click", function () { pickChatLang("es"); });
    if (elLangEn) elLangEn.addEventListener("click", function () { pickChatLang("en"); });
    elSend.addEventListener("click", sendMessage);

    window.addEventListener(
      "resize",
      function () {
        if (!panelPositionCustom || !state.open) return;
        var rect = panel.getBoundingClientRect();
        applyPanelPosition(rect.left, rect.top);
      },
      { passive: true },
    );

    if (elHeader) {
      function movePanelByPointer(clientX, clientY) {
        var dx = clientX - dragState.startX;
        var dy = clientY - dragState.startY;
        applyPanelPosition(dragState.panelLeft + dx, dragState.panelTop + dy);
        var r = panel.getBoundingClientRect();
        dragState.panelLeft = r.left;
        dragState.panelTop = r.top;
        dragState.startX = clientX;
        dragState.startY = clientY;
      }
      function beginDrag(clientX, clientY) {
        dragState.startX = clientX;
        dragState.startY = clientY;
        var rect = panel.getBoundingClientRect();
        dragState.panelLeft = rect.left;
        dragState.panelTop = rect.top;
        applyPanelPosition(rect.left, rect.top);
        elHeader.classList.add("mvi-assist-header--dragging");
        panel.classList.add("mvi-assist-panel--dragging");
      }
      function endDrag() {
        dragState.active = false;
        dragState.pointerId = null;
        elHeader.classList.remove("mvi-assist-header--dragging");
        panel.classList.remove("mvi-assist-panel--dragging");
      }

      if (window.PointerEvent) {
        elHeader.addEventListener("pointerdown", function (e) {
          if (!state.open) return;
          if (e.button !== undefined && e.button !== 0) return;
          if (e.target && e.target.closest && e.target.closest("[data-mvi-avatar-shell]")) return;
          if (e.target && e.target.closest && e.target.closest("button")) return;
          dragState.active = true;
          dragState.pointerId = e.pointerId;
          beginDrag(e.clientX, e.clientY);
          try {
            elHeader.setPointerCapture(e.pointerId);
          } catch (err) {
            /* ignore */
          }
          e.preventDefault();
        });
        elHeader.addEventListener("pointermove", function (e) {
          if (!dragState.active) return;
          if (dragState.pointerId != null && e.pointerId !== dragState.pointerId) return;
          movePanelByPointer(e.clientX, e.clientY);
        });
        function endHeaderDrag(e) {
          if (!dragState.active) return;
          var pid = dragState.pointerId;
          if (e.pointerId != null && pid != null && e.pointerId !== pid) return;
          try {
            if (pid != null) elHeader.releasePointerCapture(pid);
          } catch (err) {
            /* ignore */
          }
          endDrag();
        }
        elHeader.addEventListener("pointerup", endHeaderDrag);
        elHeader.addEventListener("pointercancel", endHeaderDrag);
      } else {
        var mouseDragging = false;
        elHeader.addEventListener("mousedown", function (e) {
          if (!state.open) return;
          if (e.button !== undefined && e.button !== 0) return;
          if (e.target && e.target.closest && e.target.closest("[data-mvi-avatar-shell]")) return;
          if (e.target && e.target.closest && e.target.closest("button")) return;
          mouseDragging = true;
          dragState.active = true;
          beginDrag(e.clientX, e.clientY);
          e.preventDefault();
        });
        document.addEventListener("mousemove", function (e) {
          if (!mouseDragging || !dragState.active) return;
          movePanelByPointer(e.clientX, e.clientY);
        });
        document.addEventListener("mouseup", function () {
          if (!mouseDragging) return;
          mouseDragging = false;
          endDrag();
        });
      }

      elHeader.addEventListener("dblclick", function (e) {
        if (e.target && e.target.closest && e.target.closest("button")) return;
        snapPanelToDefault();
      });
    }

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

    window.addEventListener("mvi-site-language", function (e) {
      var code = e.detail && e.detail.code;
      if (code === "en") state.language = "English";
      else if (code === "es") state.language = "Spanish";
      else return;
      applyChromeStrings();
      renderSuggested();
    });

    window.addEventListener("mvi-assistant-language", function (e) {
      var code = e.detail && e.detail.code;
      if (code !== "en" && code !== "es") return;
      sessionStorage.setItem("sessionLang", code);
      state.language = code === "es" ? "Spanish" : "English";
      sessionStorage.setItem(STORAGE_LANG, state.language);
      applyChromeStrings();
      renderSuggested();
    });

    applyChromeStrings();
    hydrateFromStorage();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("mvi-assistant-root");
    if (root) mount(root);
  });
})();
