/**
 * Final expense landing — fetch quote, sync lead, inline results or redirect.
 */
(function () {
  "use strict";

  var IS_EN =
    document.documentElement.lang === "en" ||
    document.body.getAttribute("data-lf-lang") === "en";
  var LANG = IS_EN ? "en" : "es";

  function msg(en, es) {
    return IS_EN ? en : es;
  }

  var DEFAULT_COVERAGE = 10000;

  function siteApiUrl(path) {
    var origin = window.location.origin || "";
    if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(origin)) {
      return "https://www.mejorvidainsurance.com" + path;
    }
    return path;
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function ageFromParsedDob(parsed) {
    if (!parsed) return null;
    var today = new Date();
    var age = today.getFullYear() - parsed.year;
    var md = today.getMonth() - (parsed.month - 1);
    if (md < 0 || (md === 0 && today.getDate() < parsed.day)) age -= 1;
    return age;
  }

  function isoDobFromParsed(parsed) {
    if (!parsed) return "";
    return parsed.year + "-" + pad2(parsed.month) + "-" + pad2(parsed.day);
  }

  function formatCoverage(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }

  function getSessionClientId() {
    try {
      var k = "mviSessionClientId";
      var s = sessionStorage.getItem(k);
      if (s && s.length > 0 && s.length < 200) return s;
      s =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "s-" + String(Date.now()) + "-" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(k, s);
      return s;
    } catch (e) {
      return null;
    }
  }

  function collectOriginDetail() {
    var o = {};
    try {
      var p = new URLSearchParams(location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"].forEach(
        function (key) {
          var v = p.get(key);
          if (v) o[key] = v.slice(0, 500);
        }
      );
      o.page_path = (location.pathname + location.search).slice(0, 2000);
      if (document.referrer) o.referrer = document.referrer.slice(0, 2000);
    } catch (e2) {}
    return o;
  }

  function setQuoteStatus(message, isError) {
    var el = document.getElementById("lf-quote-status");
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = "";
      el.classList.remove("lf-quote-status--error");
      return;
    }
    el.hidden = false;
    el.textContent = message;
    el.classList.toggle("lf-quote-status--error", !!isError);
  }

  window.MVILandingQuoteSubmit = {
    DEFAULT_COVERAGE: DEFAULT_COVERAGE,
    submit: function (ctx) {
      ctx = ctx || {};
      var selections = ctx.selections || {};
      var parseBirthdate = ctx.parseBirthdate;
      var isValidBirthdate = ctx.isValidBirthdate;
      var nextBtn = ctx.nextBtn;
      var inlineResults =
        document.body.getAttribute("data-inline-quote-results") === "1" ||
        typeof ctx.onQuoteComplete === "function";
      var resultsHref =
        document.body.getAttribute("data-quote-results-href") || "../quote-results.html";

      if (ctx.isSubmitting && ctx.isSubmitting()) return Promise.resolve();

      var parsed = parseBirthdate ? parseBirthdate(selections.birthdate) : null;
      if (!isValidBirthdate || !isValidBirthdate(selections.birthdate)) {
        setQuoteStatus(msg("Enter a valid date of birth.", "Ingresa una fecha de nacimiento válida."), true);
        return Promise.resolve();
      }

      var age = ageFromParsedDob(parsed);
      if (age == null) {
        setQuoteStatus(msg("Enter a valid date of birth.", "Ingresa una fecha de nacimiento válida."), true);
        return Promise.resolve();
      }
      if (age < 18) {
        setQuoteStatus(msg("Quotes are available starting at age 18.", "Las cotizaciones están disponibles desde los 18 años."), true);
        return Promise.resolve();
      }
      if (age > 85) {
        setQuoteStatus(msg("Quotes are available up to age 85.", "Las cotizaciones están disponibles hasta los 85 años."), true);
        return Promise.resolve();
      }

      var sex = String(selections.sex || "").toLowerCase();
      if (sex !== "male" && sex !== "female") {
        setQuoteStatus(msg("Complete all previous steps.", "Completa todos los pasos anteriores."), true);
        return Promise.resolve();
      }

      if (selections.tobacco !== "yes" && selections.tobacco !== "no") {
        setQuoteStatus(msg("Complete all previous steps.", "Completa todos los pasos anteriores."), true);
        return Promise.resolve();
      }

      var smoker = selections.tobacco === "yes";
      var coverage = DEFAULT_COVERAGE;
      var dobIso = isoDobFromParsed(parsed);
      var dobDisplay = selections.birthdate || "";
      var stateCode = (selections.state || "NE").toUpperCase();
      var firstName = String(selections.firstName || "").trim();
      var lastName = String(selections.lastName || "").trim();
      var email = String(selections.email || "").trim();
      var phone = String(selections.phone || "").trim();

      if (ctx.setSubmitting) ctx.setSubmitting(true);
      setQuoteStatus(msg("Calculating your estimate…", "Calculando tu estimado…"), false);
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.textContent = msg("Calculating…", "Calculando…");
      }

      var sessionClientId = getSessionClientId();

      return fetch(siteApiUrl("/api/quote-site"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: age,
          sex: sex,
          smoker: smoker,
          coverageAmount: coverage,
        }),
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { res: res, data: data };
          });
        })
        .then(function (out) {
          var res = out.res;
          var data = out.data || {};
          if (!res.ok || data.ok === false) {
            throw new Error(
              data.error || data.quote_error || msg("We could not calculate your estimate.", "No pudimos calcular tu estimado.")
            );
          }
          if (data.quote_status !== "ok") {
            throw new Error(
              data.quote_error || msg("We do not have rates for that combination yet.", "Aún no tenemos tarifas para esa combinación.")
            );
          }

          var carrierNote =
            age < 45
              ? "Assurity Whole Life Protect+ (under 45)."
              : "Mutual of Omaha + American Amicable (45+).";
          var quoteSummary =
            "Final expense landing: " +
            formatCoverage(coverage) +
            " range " +
            data.quote_low +
            " – " +
            data.quote_high +
            " (mid " +
            data.quote_anchor +
            "). " +
            carrierNote +
            " DOB " +
            dobDisplay +
            ", age " +
            age +
            ", " +
            sex +
            ", " +
            stateCode +
            ", tobacco " +
            (smoker ? "yes" : "no") +
            ".";

          setQuoteStatus(msg("Saving your estimate…", "Guardando tu estimado…"), false);

          var originDetail = collectOriginDetail();
          var leadEventId =
            !IS_EN && window.MVIMetaCapiEvents && typeof window.MVIMetaCapiEvents.getLeadEventId === "function"
              ? window.MVIMetaCapiEvents.getLeadEventId()
              : sessionClientId;
          var syncPayload = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            state: stateCode,
            quoteSummary: quoteSummary,
            quoteLow: data.quote_low,
            quoteHigh: data.quote_high,
            quoteAnchor: data.quote_anchor,
            age: age,
            sex: sex,
            smoker: smoker,
            dob: dobIso,
            coverageAmount: coverage,
            consent: !!selections.smsConsent,
            lang: LANG,
            source: IS_EN ? "english_landing_gastos_finales" : "facebook_landing_gastos_finales",
            sessionClientId: sessionClientId,
            metaLeadEventId: leadEventId,
            originDetail: originDetail,
          };
          if (window.MVIConsentCapture && typeof window.MVIConsentCapture.attachToPayload === "function") {
            window.MVIConsentCapture.attachToPayload(syncPayload, "lf-sms-consent");
          } else {
            var consentLabelEl = document.querySelector('label[for="lf-sms-consent"]');
            if (consentLabelEl) {
              syncPayload.consentText = String(consentLabelEl.innerText || consentLabelEl.textContent || "")
                .replace(/\s+/g, " ")
                .trim();
            }
            try {
              syncPayload.consentUrl = String(location.href || "").slice(0, 2000);
            } catch (e) {}
          }
          if (!IS_EN && window.MVIMetaCapiMatch && typeof window.MVIMetaCapiMatch.collectForLeadSync === "function") {
            var capiMatch = window.MVIMetaCapiMatch.collectForLeadSync(originDetail);
            if (capiMatch.metaFbp) syncPayload.metaFbp = capiMatch.metaFbp;
            if (capiMatch.metaFbc) syncPayload.metaFbc = capiMatch.metaFbc;
            if (capiMatch.clientUserAgent) syncPayload.clientUserAgent = capiMatch.clientUserAgent;
          }

          return fetch(siteApiUrl("/api/quote-lead-sync"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(syncPayload),
          }).then(function (syncRes) {
            return syncRes.json().then(function (syncData) {
              if (!IS_EN && syncRes.ok && syncData && syncData.ok && typeof fbq === "function") {
                var leadEventOpts = {
                  eventID: leadEventId,
                  em: email,
                  ph: phone,
                  fn: firstName,
                  ln: lastName,
                  ge: sex === "male" ? "m" : "f",
                };
                fbq("track", "Lead", { currency: "USD", value: 0 }, leadEventOpts);
              }
              return {
                quote: data,
                leadSaved: syncRes.ok && syncData && syncData.ok,
                leadId: syncData && syncData.id ? syncData.id : null,
                syncError:
                  syncRes.ok && syncData && syncData.ok
                    ? null
                    : (syncData && syncData.error) || msg("We could not save your information.", "No pudimos guardar tus datos."),
              };
            });
          });
        })
        .then(function (result) {
          var data = result.quote;
          try {
            sessionStorage.setItem(
              "mviNebraskaQuoteResult",
              JSON.stringify({
                lang: LANG,
                firstName: firstName,
                quote_low: data.quote_low,
                quote_high: data.quote_high,
                quote_anchor: data.quote_anchor,
                age: age,
                sex: sex,
                smoker: smoker,
                dob: dobIso,
                dobDisplay: dobDisplay,
                state: stateCode,
                coverage: coverage,
                savedAt: new Date().toISOString(),
                leadId: result.leadId,
                leadSaved: result.leadSaved,
                syncError: result.syncError,
                sessionClientId: sessionClientId,
                quote_carrier: data.quote_carrier || (age < 45 ? "assurity" : "moo_amam"),
              })
            );
          } catch (storageErr) {}

          var quotePayload = {
            lang: LANG,
            firstName: firstName,
            quote_low: data.quote_low,
            quote_high: data.quote_high,
            quote_anchor: data.quote_anchor,
            age: age,
            sex: sex,
            smoker: smoker,
            dob: dobIso,
            dobDisplay: dobDisplay,
            state: stateCode,
            coverage: coverage,
            savedAt: new Date().toISOString(),
            leadId: result.leadId,
            leadSaved: result.leadSaved,
            syncError: result.syncError,
            sessionClientId: sessionClientId,
            quote_carrier: data.quote_carrier || (age < 45 ? "assurity" : "moo_amam"),
          };

          if (inlineResults && ctx.onQuoteComplete) {
            setQuoteStatus("", false);
            ctx.onQuoteComplete(quotePayload);
            if (ctx.setSubmitting) ctx.setSubmitting(false);
            return;
          }

          setQuoteStatus(msg("Taking you to your results…", "Llevándote a tus resultados…"), false);
          window.location.replace(resultsHref);
        })
        .catch(function (err) {
          setQuoteStatus(err.message || msg("Something went wrong. Please try again.", "Algo salió mal. Inténtelo de nuevo."), true);
          if (ctx.setSubmitting) ctx.setSubmitting(false);
          if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.textContent = msg("See my estimate", "Ver mi estimado");
          }
        });
    },
  };
})();
