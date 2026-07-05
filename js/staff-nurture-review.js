(function () {
  "use strict";

  var accessToken = "";
  var sb = null;
  var catalog = null;

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function setAuthed(on) {
    $("nr-login").classList.toggle("hidden", on);
    $("nr-app").classList.toggle("hidden", !on);
    $("nr-app").setAttribute("aria-hidden", on ? "false" : "true");
  }

  async function api(path, body, method) {
    var headers = { Authorization: "Bearer " + accessToken };
    if (body) headers["Content-Type"] = "application/json";
    var r = await fetch(path, {
      method: method || (body ? "POST" : "GET"),
      headers: headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    var data = await r.json().catch(function () {
      return {};
    });
    if (!r.ok) throw new Error(data.error || "Error " + r.status);
    return data;
  }

  function channelClass(ch) {
    if (ch === "sms") return "sms";
    if (ch === "call") return "call";
    return "";
  }

  function isClientSpanishPreview(step, preview) {
    if (!preview) return false;
    if (preview.language === "spanish") return true;
    if (step.audience === "Lead" && (preview.subject || preview.body || preview.html)) return true;
    return false;
  }

  function isInternalStaffPreview(step) {
    if (step.internal) return true;
    if (step.channel === "daily_summary" || step.channel === "notification") return true;
    return step.audience && String(step.audience).toLowerCase().indexOf("internal") >= 0;
  }

  function renderStep(step) {
    var preview = step.preview || {};
    var bodyHtml = "";

    if (isInternalStaffPreview(step)) {
      bodyHtml +=
        '<p class="nr-preview-lang-tag nr-preview-internal-tag">Internal staff email — English (not sent to leads)</p>';
    } else if (isClientSpanishPreview(step, preview)) {
      bodyHtml +=
        '<p class="nr-preview-lang-tag">Client message — Spanish (what the lead receives)</p>';
    }

    if (preview.subject) {
      var subjectLabel = isInternalStaffPreview(step) ? "Subject" : "Subject (Spanish)";
      bodyHtml +=
        '<p class="nr-preview-subject">' + subjectLabel + ": " + esc(preview.subject) + "</p>";
    }
    if (preview.html) {
      bodyHtml += '<div class="nr-preview-html">' + preview.html + "</div>";
    } else if (preview.body) {
      bodyHtml += '<pre class="nr-preview-sms">' + esc(preview.body) + "</pre>";
    } else if (preview.description) {
      bodyHtml += '<p class="nr-preview-desc">' + esc(preview.description) + "</p>";
    }

    if (step.note) {
      bodyHtml += '<p class="nr-muted" style="margin-top:10px">' + esc(step.note) + "</p>";
    }

    return (
      '<article class="nr-step" id="nr-step-' +
      step.order +
      '">' +
      '<div class="nr-step-head">' +
      '<span class="nr-step-num">' +
      String(step.order).padStart(2, "0") +
      "</span>" +
      '<span class="nr-step-when">' +
      esc(step.when) +
      "</span>" +
      '<span class="nr-channel-tag ' +
      channelClass(step.channel) +
      '">' +
      esc(step.channel_label || step.channel) +
      "</span>" +
      '<span class="nr-step-meta">To: ' +
      esc(step.audience || "Lead") +
      (step.recurring ? " · Recurring" : "") +
      "</span>" +
      "</div>" +
      '<div class="nr-step-body">' +
      bodyHtml +
      "</div></article>"
    );
  }

  function renderCatalog(data) {
    catalog = data;
    var steps = data.steps || [];
    var html = "";
    var lastPhase = "";

    steps.forEach(function (step) {
      if (step.phase_label && step.phase_label !== lastPhase) {
        html += '<h2 class="nr-phase-label">' + esc(step.phase_label) + "</h2>";
        lastPhase = step.phase_label;
      }
      html += renderStep(step);
    });

    $("nr-content").innerHTML = html;
    $("nr-content").classList.remove("hidden");
    $("nr-loading").classList.add("hidden");

    var review = data.review || {};
    $("nr-notes").value = review.notes || "";

    var statusBanner = $("nr-status-banner");
    statusBanner.classList.remove("hidden", "ok", "warn");
    if (review.status === "approved") {
      statusBanner.classList.add("ok");
      statusBanner.innerHTML =
        '<span class="nr-banner-title">Approved</span>' +
        '<span class="nr-banner-body">' +
        (review.reviewed_at
          ? "Saved " +
            esc(new Date(review.reviewed_at).toLocaleString()) +
            (review.reviewed_by ? " by " + esc(review.reviewed_by) : "")
          : "The sequence was approved.") +
        "</span>";
    } else if (review.status === "changes_requested") {
      statusBanner.classList.add("warn");
      statusBanner.innerHTML =
        '<span class="nr-banner-title">Changes requested</span>' +
        '<span class="nr-banner-body">See your notes at the bottom of the page.</span>';
    } else {
      statusBanner.classList.add("warn");
      statusBanner.innerHTML =
        '<span class="nr-banner-title">Pending review</span>' +
        '<span class="nr-banner-body">Nothing goes live to real clients until you approve. Test mode is active.</span>';
    }

    var rolloutBanner = $("nr-rollout-banner");
    var rollout = data.rollout || {};
    if (rollout.testing) {
      rolloutBanner.classList.remove("hidden");
      rolloutBanner.innerHTML =
        '<span class="nr-banner-title">Test mode</span>' +
        '<span class="nr-banner-body">Only test leads receive automation: Julie Braunsroth, Justin Braunsroth, and emails julie@ or admin@. ' +
        "Client language: <strong>Spanish</strong> for all lead emails and SMS.</span>";
    } else {
      rolloutBanner.classList.add("hidden");
    }
  }

  async function loadCatalog() {
    $("nr-loading").classList.remove("hidden");
    $("nr-content").classList.add("hidden");
    var data = await api("/api/staff/nurture-review");
    renderCatalog(data);
  }

  async function submitReview(action) {
    var notes = String($("nr-notes").value || "").trim();
    if (action === "request_changes" && !notes) {
      $("nr-approval-msg").textContent = "Please describe the changes you need in the notes box.";
      return;
    }
    $("nr-approval-msg").textContent = "Saving…";
    try {
      var data = await api(
        "/api/staff/nurture-review",
        { action: action, notes: notes },
        "PATCH"
      );
      renderCatalog(data);
      $("nr-approval-msg").textContent =
        action === "approve" ? "Sequence approved." : "Change request saved.";
    } catch (e) {
      $("nr-approval-msg").textContent = e.message || "Could not save";
    }
  }

  function wireLogin() {
    $("nr-login-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      $("nr-login-err").textContent = "";
      $("nr-login-btn").disabled = true;
      try {
        var out = await sb.auth.signInWithPassword({
          email: String($("nr-email").value || "").trim(),
          password: String($("nr-pass").value || ""),
        });
        if (out.error || !out.data || !out.data.session) throw new Error("invalid");
        accessToken = out.data.session.access_token;
        setAuthed(true);
        await loadCatalog();
      } catch (err) {
        $("nr-login-err").textContent = "Invalid email or password.";
      } finally {
        if (!accessToken) $("nr-login-btn").disabled = false;
      }
    });

    $("nr-signout").addEventListener("click", async function () {
      try {
        await sb.auth.signOut();
      } catch (e) {}
      accessToken = "";
      setAuthed(false);
    });

    $("nr-approve").addEventListener("click", function () {
      submitReview("approve");
    });
    $("nr-request-changes").addEventListener("click", function () {
      submitReview("request_changes");
    });
  }

  async function init() {
    wireLogin();
    try {
      var confRes = await fetch("/api/staff-config");
      var conf = await confRes.json();
      if (!confRes.ok || !conf.supabaseUrl || !conf.supabaseAnonKey) throw new Error("config");
      sb = window.supabase.createClient(conf.supabaseUrl, conf.supabaseAnonKey);
      var out = await sb.auth.getSession();
      var sess = out && out.data && out.data.session;
      if (sess && sess.access_token) {
        accessToken = sess.access_token;
        setAuthed(true);
        await loadCatalog();
      } else {
        setAuthed(false);
      }
    } catch (e) {
      setAuthed(false);
      $("nr-login-err").textContent = "Could not load sign-in configuration.";
    }
  }

  init();
})();
