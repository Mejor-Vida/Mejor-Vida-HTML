/**
 * Mejor Vida — sticky "Leave a Message" contact widget (bottom-left).
 * Posts to POST /api/contact-message (Supabase + HubSpot + staff email).
 */
(function () {
  "use strict";

  if (window.MviLeaveMessageWidget) return;

  var API_URL = "/api/contact-message";
  var ROOT_ID = "mvi-leave-message-root";

  function isBackForwardNavigation() {
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
      if (nav && nav.type === "back_forward") return true;
    } catch (e) {
      /* ignore */
    }
    try {
      if (performance.navigation && performance.navigation.type === 2) return true;
    } catch (e2) {
      /* ignore */
    }
    return false;
  }

  /** Keep fresh loads at the top (widgets append at end of <body>). Back/Forward keep scroll. */
  function preferTopOnFreshLoad() {
    try {
      if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    } catch (e) {
      /* ignore */
    }
    if (isBackForwardNavigation()) return;
    var hash = String((location && location.hash) || "");
    if (hash && hash !== "#" && hash !== "#home" && hash !== "#top") return;
    try {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    } catch (e2) {
      /* ignore */
    }
  }

  preferTopOnFreshLoad();
  window.addEventListener("load", preferTopOnFreshLoad);
  window.addEventListener("pageshow", function (e) {
    if (e && e.persisted) return;
    preferTopOnFreshLoad();
  });

  function focusNoScroll(el) {
    if (!el || typeof el.focus !== "function") return;
    try {
      el.focus({ preventScroll: true });
    } catch (e) {
      /* Never fall back to focus() without preventScroll — that scrolls long pages to the footer. */
    }
  }

  var COPY = {
    es: {
      toggle: "Dejar un mensaje",
      openAria: "Abrir formulario para dejar un mensaje",
      closeAria: "Cerrar formulario de mensaje",
      panelTitle: "Déjenos un mensaje",
      minimize: "Minimizar",
      name: "Nombre",
      phone: "Número de teléfono",
      email: "Correo electrónico",
      message: "Su mensaje",
      submit: "Enviar",
      submitting: "Enviando…",
      success: "Gracias. Recibimos su mensaje y le responderemos pronto.",
      error: "No pudimos enviar el mensaje. Intente de nuevo o llámenos al 402-440-5438.",
      required: "Complete los campos requeridos.",
      consentHtml:
        'Sí, acepto recibir mensajes de texto (SMS) de marketing de Mejor Vida Insurance LLC, incluidos seguimiento personalizado de cotización, recordatorios de citas, actualizaciones del estado de la solicitud y mensajes de servicio al cliente. Pueden aplicar tarifas de mensajes y datos. Frecuencia: hasta 1–5 mensajes por semana. Responda STOP para cancelar. Responda AYUDA para obtener ayuda. El consentimiento no es obligatorio para obtener una cotización ni para contratar un seguro. Los SMS se entregan a través de proveedores autorizados, incluido Telnyx. <a href="https://www.mejorvidainsurance.com/privacy-policy.html" target="_blank" rel="noopener noreferrer">Política de Privacidad</a> · <a href="https://www.mejorvidainsurance.com/terms-service.html" target="_blank" rel="noopener noreferrer">Términos de Servicio</a> · <a href="https://www.mejorvidainsurance.com/sms-optin.html" target="_blank" rel="noopener noreferrer">Programa SMS</a>.',
    },
    en: {
      toggle: "Leave a Message",
      openAria: "Open leave a message form",
      closeAria: "Close message form",
      panelTitle: "Leave us a message",
      minimize: "Minimize",
      name: "Name",
      phone: "Phone Number",
      email: "Email Address",
      message: "Your Message",
      submit: "Submit",
      submitting: "Sending…",
      success: "Thank you. We received your message and will get back to you soon.",
      error: "We could not send your message. Please try again or call us at 402-440-5438.",
      required: "Please complete the required fields.",
      consentHtml:
        'Yes, I agree to receive marketing SMS text messages from Mejor Vida Insurance LLC, including personalized quote follow-up, appointment scheduling reminders, application status updates, and customer service messages. Message and data rates may apply. Frequency: up to 1–5 messages per week. Reply STOP to opt out. Reply HELP for help. Consent is not required to get a quote or purchase insurance. SMS is delivered via authorized providers including Telnyx. <a href="https://www.mejorvidainsurance.com/en/privacy-policy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> · <a href="https://www.mejorvidainsurance.com/en/terms-service.html" target="_blank" rel="noopener noreferrer">Terms of Service</a> · <a href="https://www.mejorvidainsurance.com/en/sms-optin.html" target="_blank" rel="noopener noreferrer">SMS program</a>.',
    },
  };

  function detectLang() {
    var path = String((location && location.pathname) || "");
    // Prefer URL locale — some EN pages incorrectly flip documentElement.lang via inline scripts.
    if (/^\/en(\/|$)/i.test(path) || /(^|\/)en\//i.test(path)) return "en";

    var htmlLang = String((document.documentElement && document.documentElement.lang) || "")
      .toLowerCase()
      .trim();
    if (htmlLang.indexOf("en") === 0) return "en";
    if (htmlLang.indexOf("es") === 0) return "es";

    var site = null;
    try {
      site = sessionStorage.getItem("sessionLang");
    } catch (e) {
      /* ignore */
    }
    if (site === "en" || site === "es") return site;
    return "es";
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function splitName(full) {
    var parts = String(full || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return { firstName: "", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "-" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }

  function ensureRoot() {
    var existing = document.getElementById(ROOT_ID);
    if (existing) return existing;
    var root = document.createElement("div");
    root.id = ROOT_ID;
    var mount = document.getElementById("mvi-leave-message-mount");
    // Inline fixed positioning so the dock never participates in document flow before CSS arrives.
    // Pages with #mvi-leave-message-mount can unstick it with CSS (ads landing, mobile).
    root.setAttribute(
      "style",
      "position:fixed;z-index:1083;left:0.85rem;bottom:0;width:auto;max-width:calc(100vw - 5.5rem);pointer-events:none;",
    );
    if (mount) mount.appendChild(root);
    else document.body.appendChild(root);
    return root;
  }

  function mount(root) {
    if (!root || root.getAttribute("data-mvi-lm-mounted") === "1") return;
    root.setAttribute("data-mvi-lm-mounted", "1");
    root.className = "mvi-lm-root";
    if (!root.getAttribute("style")) {
      root.setAttribute(
        "style",
        "position:fixed;z-index:1083;left:0.85rem;bottom:0;width:auto;max-width:calc(100vw - 5.5rem);pointer-events:none;",
      );
    }

    var lang = detectLang();
    var t = COPY[lang] || COPY.es;
    var open = false;

    root.innerHTML =
      '<div class="mvi-lm-panel" id="mvi-lm-panel" role="dialog" aria-modal="false" aria-labelledby="mvi-lm-title" hidden>' +
      '  <div class="mvi-lm-header">' +
      '    <h2 class="mvi-lm-header-title" id="mvi-lm-title">' +
      escapeHtml(t.panelTitle) +
      "</h2>" +
      '    <button type="button" class="mvi-lm-minimize" data-mvi-lm-minimize aria-label="' +
      escapeHtml(t.minimize) +
      '">' +
      '      <svg class="mvi-lm-minimize-icon" viewBox="0 0 12 12" focusable="false" aria-hidden="true">' +
      '        <path d="M2.2 6h7.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      "      </svg>" +
      "    </button>" +
      "  </div>" +
      '  <div class="mvi-lm-body">' +
      '    <form class="mvi-lm-form" id="mvi-lm-form" novalidate>' +
      '      <div class="mvi-lm-field">' +
      '        <label for="mvi-lm-name">' +
      escapeHtml(t.name) +
      "</label>" +
      '        <input id="mvi-lm-name" name="name" type="text" autocomplete="name" maxlength="200" required />' +
      "      </div>" +
      '      <div class="mvi-lm-field">' +
      '        <label for="mvi-lm-phone">' +
      escapeHtml(t.phone) +
      "</label>" +
      '        <input id="mvi-lm-phone" name="phone" type="tel" autocomplete="tel" maxlength="40" required />' +
      "      </div>" +
      '      <div class="mvi-lm-field">' +
      '        <label for="mvi-lm-email">' +
      escapeHtml(t.email) +
      "</label>" +
      '        <input id="mvi-lm-email" name="email" type="email" autocomplete="email" maxlength="320" required />' +
      "      </div>" +
      '      <div class="mvi-lm-field">' +
      '        <label for="mvi-lm-message">' +
      escapeHtml(t.message) +
      "</label>" +
      '        <textarea id="mvi-lm-message" name="message" maxlength="5000" rows="4" required></textarea>' +
      "      </div>" +
      '      <input class="mvi-lm-hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
      '      <button type="submit" class="mvi-lm-submit" data-mvi-lm-submit>' +
      escapeHtml(t.submit) +
      "</button>" +
      '      <div class="mvi-lm-consent">' +
      '        <input type="checkbox" id="mvi-lm-sms-consent" name="smsConsent" value="1" />' +
      '        <label class="mvi-lm-consent-label" for="mvi-lm-sms-consent" id="mvi-lm-consent-label">' +
      t.consentHtml +
      "</label>" +
      "      </div>" +
      '      <p class="mvi-lm-status" data-mvi-lm-status role="status" aria-live="polite"></p>' +
      "    </form>" +
      "  </div>" +
      "</div>" +
      '<button type="button" class="mvi-lm-toggle" data-mvi-lm-toggle aria-expanded="false" aria-controls="mvi-lm-panel">' +
      '  <span class="mvi-lm-toggle-left">' +
      '    <span class="mvi-lm-toggle-icon" aria-hidden="true"><i class="fas fa-comment-dots"></i></span>' +
      '    <span class="mvi-lm-toggle-label">' +
      escapeHtml(t.toggle) +
      "</span>" +
      "  </span>" +
      '  <span class="mvi-lm-chevron" aria-hidden="true">' +
      '    <svg viewBox="0 0 12 8" focusable="false" aria-hidden="true">' +
      '      <path d="M1.1 6.6L6 1.4l4.9 5.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
      "    </svg>" +
      "  </span>" +
      "</button>";

    var panel = root.querySelector("#mvi-lm-panel");
    var toggle = root.querySelector("[data-mvi-lm-toggle]");
    var minimize = root.querySelector("[data-mvi-lm-minimize]");
    var form = root.querySelector("#mvi-lm-form");
    var statusEl = root.querySelector("[data-mvi-lm-status]");
    var submitBtn = root.querySelector("[data-mvi-lm-submit]");
    var nameEl = root.querySelector("#mvi-lm-name");
    var phoneEl = root.querySelector("#mvi-lm-phone");
    var emailEl = root.querySelector("#mvi-lm-email");
    var messageEl = root.querySelector("#mvi-lm-message");
    var consentEl = root.querySelector("#mvi-lm-sms-consent");
    var consentLabel = root.querySelector("#mvi-lm-consent-label");

    function setStatus(text, kind) {
      statusEl.textContent = text || "";
      statusEl.classList.remove("is-error", "is-success");
      if (kind) statusEl.classList.add(kind);
    }

    function setOpen(next) {
      var wasOpen = open;
      open = !!next;
      root.classList.toggle("is-open", open);
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? t.closeAria : t.openAria);
      // preventScroll: focusing fixed bottom-dock controls otherwise scrolls the page to the footer
      // (root is appended at end of <body>; browsers scroll focused nodes into view).
      if (open && nameEl) {
        focusNoScroll(nameEl);
      } else if (!open && wasOpen && toggle) {
        focusNoScroll(toggle);
      }
    }

    function clearInvalid() {
      [nameEl, phoneEl, emailEl, messageEl].forEach(function (el) {
        if (el) el.classList.remove("is-invalid");
      });
    }

    function markInvalid(el) {
      if (el) el.classList.add("is-invalid");
    }

    toggle.addEventListener("click", function () {
      setOpen(!open);
    });
    minimize.addEventListener("click", function () {
      setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearInvalid();
      setStatus("");

      var name = String(nameEl.value || "").trim();
      var phone = String(phoneEl.value || "").trim();
      var email = String(emailEl.value || "").trim();
      var message = String(messageEl.value || "").trim();
      var hp = String((form.querySelector('[name="website"]') || {}).value || "").trim();
      var smsConsent = !!(consentEl && consentEl.checked);
      var ok = true;

      if (!name) {
        markInvalid(nameEl);
        ok = false;
      }
      if (!phone || phone.replace(/\D/g, "").length < 10) {
        markInvalid(phoneEl);
        ok = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        markInvalid(emailEl);
        ok = false;
      }
      if (!message) {
        markInvalid(messageEl);
        ok = false;
      }
      if (!ok) {
        setStatus(t.required, "is-error");
        return;
      }
      if (hp) {
        setStatus(t.success, "is-success");
        form.reset();
        return;
      }

      var names = splitName(name);
      var consentText = "";
      if (consentLabel) {
        consentText = String(consentLabel.innerText || consentLabel.textContent || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 4000);
      }

      var payload = {
        name: name,
        firstName: names.firstName,
        lastName: names.lastName,
        phone: phone,
        email: email,
        message: message,
        lang: lang,
        source: "website_contact_form",
        consent: smsConsent,
        consentText: consentText,
        consentUrl: String(location.href || "").slice(0, 2000),
        pagePath: String(location.pathname || "").slice(0, 2000),
      };

      submitBtn.disabled = true;
      submitBtn.textContent = t.submitting;

      fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok && result.data && result.data.ok !== false) {
            setStatus(t.success, "is-success");
            form.reset();
            if (typeof window.gtag === "function") {
              try {
                window.gtag("event", "generate_lead", {
                  event_category: "engagement",
                  event_label: "leave_a_message_widget",
                });
              } catch (err) {
                /* ignore */
              }
            }
            return;
          }
          setStatus(t.error, "is-error");
        })
        .catch(function () {
          setStatus(t.error, "is-error");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = t.submit;
        });
    });

    // Start closed without focusing the toggle (focus on init scrolled pages to the footer).
    preferTopOnFreshLoad();

    window.addEventListener("mvi-site-language", function (e) {
      var code = e.detail && e.detail.code;
      if (code !== "en" && code !== "es") return;
      if (code === lang) return;
      root.removeAttribute("data-mvi-lm-mounted");
      root.innerHTML = "";
      mount(root);
    });
  }

  function init() {
    mount(ensureRoot());
  }

  window.MviLeaveMessageWidget = {
    init: init,
    open: function () {
      var root = document.getElementById(ROOT_ID);
      if (!root) init();
      root = document.getElementById(ROOT_ID);
      var toggle = root && root.querySelector("[data-mvi-lm-toggle]");
      if (toggle && root && !root.classList.contains("is-open")) toggle.click();
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
