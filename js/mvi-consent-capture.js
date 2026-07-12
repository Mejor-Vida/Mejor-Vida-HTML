/**
 * Capture exact SMS consent checkbox label text + optional form screenshot for TCPA proof.
 * Usage:
 *   MVIConsentCapture.attachToPayload(payload, 'ql-sms-consent')
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

  function resolveCaptureRoot(opts) {
    opts = opts || {};
    if (opts.root && opts.root.nodeType === 1) return opts.root;
    var selectors = [].concat(
      opts.root || [],
      "#mvi-step-contact",
      ".mvi-quote-contact-fields",
      ".lf-contact-card",
      ".lf-quote-form",
      "form.mvi-quote-form",
      "#lf-sms-consent"
    );
    for (var i = 0; i < selectors.length; i++) {
      var sel = selectors[i];
      if (!sel || typeof sel !== "string") continue;
      var el = document.querySelector(sel);
      if (!el) continue;
      if (sel === "#lf-sms-consent") {
        return el.closest(".form-check") || el.closest("form") || el.parentElement || el;
      }
      return el;
    }
    return null;
  }

  /**
   * Capture the filled contact + SMS consent block as a JPEG data URL.
   * Soft-fails (returns "") if the library or DOM capture is unavailable.
   */
  function captureConsentScreenshot(opts) {
    opts = opts || {};
    var root = resolveCaptureRoot(opts);
    if (!root || typeof Promise === "undefined") return Promise.resolve("");

    return loadHtml2Canvas()
      .then(function (html2canvas) {
        return html2canvas(root, {
          backgroundColor: "#ffffff",
          scale: Math.min(2, (global.devicePixelRatio || 1) > 1.5 ? 1.5 : 1.25),
          useCORS: true,
          logging: false,
          scrollX: 0,
          scrollY: -((global.scrollY || global.pageYOffset || 0)),
        });
      })
      .then(function (canvas) {
        var maxW = opts.maxWidth || 900;
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
        var quality = typeof opts.quality === "number" ? opts.quality : 0.72;
        var dataUrl = out.toDataURL("image/jpeg", quality);
        // Keep under typical serverless body limits (~1MB safety margin with other fields).
        if (dataUrl && dataUrl.length > 750000 && quality > 0.45) {
          dataUrl = out.toDataURL("image/jpeg", 0.5);
        }
        if (dataUrl && dataUrl.length > 900000) return "";
        return dataUrl || "";
      })
      .catch(function () {
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
