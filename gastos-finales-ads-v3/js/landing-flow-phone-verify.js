/**
 * Landing flow — U.S. phone entry + SMS OTP verification.
 *
 * DISABLED until Telnyx SMS is enabled on the landing. Re-enable by:
 * 1. Restoring the OTP markup in index.html (phone step section)
 * 2. Adding <script src="js/landing-flow-phone-verify.js"></script> before landing-flow.js
 * 3. Setting MVI_LANDING_PHONE_OTP_ENABLED = true on the phone step or in landing-flow.js
 */
(function () {
  "use strict";
  if (!window.MVI_LANDING_PHONE_OTP_ENABLED) return;

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatPhoneInput(value) {
    var d = digitsOnly(value).slice(0, 11);
    if (d.length > 0 && d[0] !== "1") {
      d = d.slice(0, 10);
    } else if (d.length > 1) {
      d = d.slice(0, 11);
    }
    if (d.length === 11 && d[0] === "1") d = d.slice(1);
    d = d.slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return "(" + d.slice(0, 3) + ") " + d.slice(3);
    return "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
  }

  function normalizeUsPhoneE164(value) {
    var d = digitsOnly(value);
    if (d.length === 10) return "+1" + d;
    if (d.length === 11 && d[0] === "1") return "+" + d;
    return null;
  }

  function apiUrl(path) {
    var origin = window.location.origin || "";
    if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)) {
      return "https://www.mejorvidainsurance.com" + path;
    }
    return path;
  }

  function postVerify(payload) {
    return fetch(apiUrl("/api/phone-verify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok && data && data.ok, data: data || {}, status: res.status };
      });
    });
  }

  window.MVILandingPhoneStep = {
    formatPhoneInput: formatPhoneInput,
    normalizeUsPhoneE164: normalizeUsPhoneE164,
    bind: function (ctx) {
      var selections = ctx.selections;
      var onUpdate = ctx.onUpdate;
      var phoneInput = document.getElementById("lf-phone-input");
      var codeInput = document.getElementById("lf-phone-code-input");
      var enterPanel = document.getElementById("lf-phone-enter-panel");
      var verifyPanel = document.getElementById("lf-phone-verify-panel");
      var verifiedPanel = document.getElementById("lf-phone-verified-panel");
      var sendBtn = document.getElementById("lf-phone-send-btn");
      var verifyBtn = document.getElementById("lf-phone-verify-btn");
      var resendBtn = document.getElementById("lf-phone-resend-btn");
      var changeBtn = document.getElementById("lf-phone-change-btn");
      var sendHint = document.getElementById("lf-phone-send-hint");
      var verifyHint = document.getElementById("lf-phone-verify-hint");
      var displayEl = document.getElementById("lf-phone-display");
      var verifiedDisplay = document.getElementById("lf-phone-verified-display");

      if (!phoneInput || !sendBtn) return;

      var pendingE164 = null;

      function setHint(el, message, isError) {
        if (!el) return;
        if (!message) {
          el.hidden = true;
          el.textContent = "";
          el.classList.remove("lf-phone-hint--error", "lf-phone-hint--ok");
          return;
        }
        el.hidden = false;
        el.textContent = message;
        el.classList.toggle("lf-phone-hint--error", !!isError);
        el.classList.toggle("lf-phone-hint--ok", !isError);
      }

      function showPhase(phase) {
        if (enterPanel) enterPanel.hidden = phase !== "enter";
        if (verifyPanel) verifyPanel.hidden = phase !== "code";
        if (verifiedPanel) verifiedPanel.hidden = phase !== "verified";
      }

      function syncVerifiedUI() {
        if (selections.phoneVerified && selections.phone) {
          showPhase("verified");
          if (verifiedDisplay) verifiedDisplay.textContent = selections.phoneDisplay || selections.phone;
          if (phoneInput) phoneInput.value = selections.phoneDisplay || "";
          return;
        }
        if (pendingE164 && verifyPanel && !verifyPanel.hidden) {
          showPhase("code");
          return;
        }
        showPhase("enter");
      }

      function setVerified(e164, display) {
        selections.phone = e164;
        selections.phoneDisplay = display || e164;
        selections.phoneVerified = true;
        pendingE164 = e164;
        try {
          sessionStorage.setItem(ctx.storageKeyPhone, e164);
          sessionStorage.setItem(ctx.storageKeyVerified, "1");
        } catch (e) {}
        setHint(sendHint, "");
        setHint(verifyHint, "");
        syncVerifiedUI();
        onUpdate();
      }

      function clearVerified() {
        selections.phoneVerified = false;
        try {
          sessionStorage.removeItem(ctx.storageKeyVerified);
        } catch (e) {}
        onUpdate();
      }

      phoneInput.addEventListener("input", function () {
        var formatted = formatPhoneInput(phoneInput.value);
        phoneInput.value = formatted;
        if (selections.phoneVerified || pendingE164) {
          var e164 = normalizeUsPhoneE164(formatted);
          if (e164 !== selections.phone) {
            clearVerified();
            pendingE164 = null;
            selections.phone = null;
            selections.phoneDisplay = null;
            try {
              sessionStorage.removeItem(ctx.storageKeyPhone);
            } catch (e2) {}
            showPhase("enter");
            if (codeInput) codeInput.value = "";
          }
        }
        onUpdate();
      });

      if (codeInput) {
        codeInput.addEventListener("input", function () {
          codeInput.value = digitsOnly(codeInput.value).slice(0, 6);
          setHint(verifyHint, "");
        });
      }

      function setLoading(btn, loading) {
        if (!btn) return;
        btn.disabled = loading;
        btn.classList.toggle("is-loading", loading);
      }

      sendBtn.addEventListener("click", function () {
        var e164 = normalizeUsPhoneE164(phoneInput.value);
        if (!e164) {
          phoneInput.classList.add("is-invalid");
          setHint(sendHint, "Enter a valid 10-digit U.S. phone number.", true);
          onUpdate();
          return;
        }
        phoneInput.classList.remove("is-invalid");
        setHint(sendHint, "");
        setLoading(sendBtn, true);
        setLoading(resendBtn, true);

        postVerify({ action: "send", phone: e164 })
          .then(function (result) {
            setLoading(sendBtn, false);
            setLoading(resendBtn, false);
            if (!result.ok) {
              setHint(sendHint, result.data.error || "Could not send code. Try again.", true);
              return;
            }
            pendingE164 = e164;
            selections.phone = e164;
            selections.phoneDisplay = result.data.display || phoneInput.value;
            try {
              sessionStorage.setItem(ctx.storageKeyPhone, e164);
            } catch (e) {}
            if (displayEl) displayEl.textContent = result.data.display || phoneInput.value;
            if (codeInput) {
              codeInput.value = "";
              codeInput.focus();
            }
            showPhase("code");
            setHint(sendHint, "Verification code sent.", false);
            onUpdate();
          })
          .catch(function () {
            setLoading(sendBtn, false);
            setLoading(resendBtn, false);
            setHint(sendHint, "Network error. Check your connection and try again.", true);
          });
      });

      if (resendBtn) {
        resendBtn.addEventListener("click", function () {
          sendBtn.click();
        });
      }

      if (verifyBtn) {
        verifyBtn.addEventListener("click", function () {
          var e164 = pendingE164 || normalizeUsPhoneE164(phoneInput.value);
          var code = codeInput ? codeInput.value : "";
          if (!e164) {
            setHint(verifyHint, "Enter your phone number first.", true);
            return;
          }
          if (code.length !== 6) {
            if (codeInput) codeInput.classList.add("is-invalid");
            setHint(verifyHint, "Enter the 6-digit code from your text.", true);
            return;
          }
          if (codeInput) codeInput.classList.remove("is-invalid");
          setLoading(verifyBtn, true);
          postVerify({ action: "check", phone: e164, code: code })
            .then(function (result) {
              setLoading(verifyBtn, false);
              if (!result.ok) {
                if (codeInput) codeInput.classList.add("is-invalid");
                setHint(verifyHint, result.data.error || "Verification failed.", true);
                return;
              }
              setVerified(result.data.phone || e164, result.data.display);
              setHint(verifyHint, "Phone number verified.", false);
            })
            .catch(function () {
              setLoading(verifyBtn, false);
              setHint(verifyHint, "Network error. Try again.", true);
            });
        });
      }

      if (changeBtn) {
        changeBtn.addEventListener("click", function () {
          selections.phone = null;
          selections.phoneDisplay = null;
          selections.phoneVerified = false;
          pendingE164 = null;
          try {
            sessionStorage.removeItem(ctx.storageKeyPhone);
            sessionStorage.removeItem(ctx.storageKeyVerified);
          } catch (e) {}
          if (codeInput) codeInput.value = "";
          setHint(sendHint, "");
          setHint(verifyHint, "");
          showPhase("enter");
          phoneInput.focus();
          onUpdate();
        });
      }

      function refresh() {
        if (selections.phone && !selections.phoneDisplay) {
          selections.phoneDisplay = formatPhoneInput(selections.phone.replace(/^\+1/, ""));
        }
        if (phoneInput.value === "" && selections.phoneDisplay) {
          phoneInput.value = selections.phoneDisplay;
        }
        syncVerifiedUI();
      }

      refresh();
      return { refresh: refresh };
    },
  };
})();
