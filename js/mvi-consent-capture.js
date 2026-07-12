/**
 * Capture exact SMS consent checkbox label text for TCPA proof.
 * Usage: MVIConsentCapture.textFromCheckboxId('ql-sms-consent')
 */
(function (global) {
  "use strict";

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

  global.MVIConsentCapture = {
    textFromCheckboxId: textFromCheckboxId,
    pageUrl: pageUrl,
    attachToPayload: attachToPayload,
  };
})(typeof window !== "undefined" ? window : globalThis);
