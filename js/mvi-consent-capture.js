/**
 * Capture exact SMS consent checkbox label text + form screenshot for TCPA proof.
 * Usage:
 *   MVIConsentCapture.attachToPayload(payload, 'ql-sms-consent')
 *   await MVIConsentCapture.attachScreenshot(payload, { mode: 'landing' })
 *   await MVIConsentCapture.attachScreenshot(payload, { root: '#mvi-step-contact' })
 */
(function (global) {
  "use strict";

  var H2C_SRC = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
  var h2cPromise = null;

  function normalizeWhitespace(s) {
    return String(s || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    if (!el) return "";
    return normalizeWhitespace(el.value || el.textContent || "");
  }

  function textFromCheckboxId(id) {
    var el = document.getElementById(id);
    if (!el) return "";
    var label =
      document.querySelector('label[for="' + id + '"]') ||
      (el.closest && el.closest("label")) ||
      null;
    if (!label) return "";
    return normalizeWhitespace(label.innerText || label.textContent || "");
  }

  function pageUrl() {
    try {
      return String(location.href || "").slice(0, 2000);
    } catch (e) {
      return "";
    }
  }

  function attachToPayload(payload, checkboxId) {
    payload = payload || {};
    var text = textFromCheckboxId(checkboxId || "ql-sms-consent");
    if (!text) text = textFromCheckboxId("lf-sms-consent");
    if (text) payload.consentText = text;
    var url = pageUrl();
    if (url) payload.consentUrl = url;
    return payload;
  }

  function loadHtml2Canvas() {
    if (global.html2canvas) return Promise.resolve(global.html2canvas);
    if (h2cPromise) return h2cPromise;
    h2cPromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = H2C_SRC;
      s.async = true;
      s.onload = function () {
        if (global.html2canvas) resolve(global.html2canvas);
        else reject(new Error("html2canvas missing after load"));
      };
      s.onerror = function () {
        h2cPromise = null;
        reject(new Error("html2canvas failed to load"));
      };
      document.head.appendChild(s);
    });
    return h2cPromise;
  }

  function isLandingConsentFlow() {
    return !!(document.getElementById("lf-sms-consent") && !document.getElementById("mvi-step-contact"));
  }

  function resolveCaptureRoot(opts) {
    opts = opts || {};
    if (opts.root && opts.root.nodeType === 1) return opts.root;
    var selectors = [].concat(
      opts.root || [],
      "#lf-consent-capture-root",
      ".lf-step--phone",
      'section.lf-step[data-field="phone"]',
      "#mvi-step-contact",
      ".mvi-quote-contact-fields",
      ".lf-sms-optin",
      "#lf-sms-consent"
    );
    for (var i = 0; i < selectors.length; i++) {
      var sel = selectors[i];
      if (!sel || typeof sel !== "string") continue;
      var el = document.querySelector(sel);
      if (!el) continue;
      if (sel === "#lf-sms-consent" || sel === ".lf-sms-optin") {
        return (
          el.closest("#lf-consent-capture-root") ||
          el.closest(".lf-step--phone") ||
          el.closest('section.lf-step[data-field="phone"]') ||
          el.closest(".lf-step") ||
          el.closest(".form-check") ||
          el.parentElement ||
          el
        );
      }
      return el;
    }
    return null;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * Multi-step landings keep name/email on earlier (often hidden) steps.
   * Build a temporary visible proof card so the screenshot includes all fields + SMS opt-in.
   */
  function buildCompositeLandingProof() {
    var first = fieldValue("lf-first-name-input");
    var last = fieldValue("lf-last-name-input");
    var email = fieldValue("lf-email-input");
    var phone = fieldValue("lf-phone-input");
    var smsEl = document.getElementById("lf-sms-consent");
    var smsChecked = !!(smsEl && smsEl.checked);
    var consentText =
      textFromCheckboxId("lf-sms-consent") ||
      textFromCheckboxId("ql-sms-consent") ||
      "";
    var when = new Date().toISOString();
    var url = pageUrl();
    var fullName = normalizeWhitespace([first, last].filter(Boolean).join(" "));

    var wrap = document.createElement("div");
    wrap.id = "mvi-consent-proof-composite";
    wrap.setAttribute("data-mvi-consent-proof", "1");
    wrap.style.cssText =
      "position:fixed;left:0;top:0;width:720px;max-width:96vw;padding:20px 22px;" +
      "background:#fff;color:#111;font:14px/1.45 system-ui,-apple-system,sans-serif;" +
      "border:1px solid #d1d5db;border-radius:12px;box-sizing:border-box;z-index:2147483000;";
    wrap.innerHTML =
      '<div style="font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#64748b;margin-bottom:8px;">Consent proof snapshot</div>' +
      "<div style=\"font-size:18px;font-weight:700;margin-bottom:12px;\">Mejor Vida Insurance — SMS opt-in</div>" +
      '<dl style="margin:0 0 14px;display:grid;grid-template-columns:140px 1fr;gap:6px 12px;">' +
      "<dt style=\"color:#64748b;\">Name</dt><dd style=\"margin:0;font-weight:600;\">" +
      escapeHtml(fullName || "—") +
      "</dd>" +
      "<dt style=\"color:#64748b;\">Email</dt><dd style=\"margin:0;\">" +
      escapeHtml(email || "—") +
      "</dd>" +
      "<dt style=\"color:#64748b;\">Phone</dt><dd style=\"margin:0;\">" +
      escapeHtml(phone || "—") +
      "</dd>" +
      "<dt style=\"color:#64748b;\">SMS opt-in</dt><dd style=\"margin:0;font-weight:700;color:" +
      (smsChecked ? "#047857" : "#b91c1c") +
      ';">' +
      (smsChecked ? "CHECKED / YES" : "NOT CHECKED") +
      "</dd>" +
      "<dt style=\"color:#64748b;\">Captured at</dt><dd style=\"margin:0;\">" +
      escapeHtml(when) +
      "</dd>" +
      "<dt style=\"color:#64748b;\">Page URL</dt><dd style=\"margin:0;word-break:break-all;font-size:12px;\">" +
      escapeHtml(url || "—") +
      "</dd>" +
      "</dl>" +
      '<div style="border-top:1px solid #e5e7eb;padding-top:12px;">' +
      '<div style="font-size:12px;color:#64748b;margin-bottom:6px;">Exact consent wording</div>' +
      '<div style="font-size:12px;line-height:1.5;max-height:220px;overflow:hidden;">' +
      escapeHtml(consentText || "—") +
      "</div></div>";
    document.body.appendChild(wrap);
    return wrap;
  }

  function canvasToJpegDataUrl(canvas, opts) {
    var maxW = (opts && opts.maxWidth) || 900;
    var out = canvas;
    if (canvas.width > maxW) {
      var ratio = maxW / canvas.width;
      var resized = document.createElement("canvas");
      resized.width = Math.round(canvas.width * ratio);
      resized.height = Math.round(canvas.height * ratio);
      var ctx = resized.getContext("2d");
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, resized.width, resized.height);
        out = resized;
      }
    }
    var quality = opts && typeof opts.quality === "number" ? opts.quality : 0.72;
    var dataUrl = out.toDataURL("image/jpeg", quality);
    if (dataUrl && dataUrl.length > 750000 && quality > 0.45) {
      dataUrl = out.toDataURL("image/jpeg", 0.5);
    }
    if (dataUrl && dataUrl.length > 900000) return "";
    return dataUrl || "";
  }

  function renderNodeToDataUrl(root, opts) {
    return loadHtml2Canvas().then(function (html2canvas) {
      return html2canvas(root, {
        backgroundColor: "#ffffff",
        scale: Math.min(2, (global.devicePixelRatio || 1) > 1.5 ? 1.5 : 1.25),
        useCORS: true,
        logging: false,
        scrollX: 0,
        scrollY: -((global.scrollY || global.pageYOffset || 0)),
      });
    }).then(function (canvas) {
      return canvasToJpegDataUrl(canvas, opts);
    });
  }

  /**
   * Capture consent proof screenshot.
   * Soft-fails (returns "") if the library or DOM capture is unavailable.
   */
  function captureConsentScreenshot(opts) {
    opts = opts || {};
    if (typeof Promise === "undefined") return Promise.resolve("");

    var useComposite =
      opts.composite === true ||
      opts.mode === "landing" ||
      (opts.composite !== false && isLandingConsentFlow());

    if (useComposite) {
      var composite = null;
      try {
        composite = buildCompositeLandingProof();
      } catch (e) {
        composite = null;
      }
      if (composite) {
        return renderNodeToDataUrl(composite, opts)
          .catch(function () {
            return "";
          })
          .then(function (dataUrl) {
            try {
              if (composite && composite.parentNode) composite.parentNode.removeChild(composite);
            } catch (e2) {}
            if (dataUrl) return dataUrl;
            // Fall through to visible step capture if composite failed.
            return captureVisibleRoot(opts);
          });
      }
    }

    return captureVisibleRoot(opts);
  }

  function captureVisibleRoot(opts) {
    var root = resolveCaptureRoot(opts);
    if (!root) return Promise.resolve("");
    return renderNodeToDataUrl(root, opts).catch(function () {
      return "";
    });
  }

  function attachScreenshot(payload, opts) {
    payload = payload || {};
    return captureConsentScreenshot(opts).then(function (dataUrl) {
      if (dataUrl) payload.consentScreenshot = dataUrl;
      return payload;
    });
  }

  global.MVIConsentCapture = {
    textFromCheckboxId: textFromCheckboxId,
    pageUrl: pageUrl,
    attachToPayload: attachToPayload,
    captureConsentScreenshot: captureConsentScreenshot,
    attachScreenshot: attachScreenshot,
  };
})(typeof window !== "undefined" ? window : globalThis);
