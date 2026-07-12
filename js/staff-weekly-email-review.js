(function () {
  "use strict";

  var accessToken = "";
  var sb = null;
  var blogUrl = "";

  function $(id) {
    return document.getElementById(id);
  }

  function setAuthed(on) {
    $("we-login").classList.toggle("hidden", on);
    $("we-app").classList.toggle("hidden", !on);
    $("we-app").setAttribute("aria-hidden", on ? "false" : "true");
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

  async function loadPreview() {
    $("we-msg").textContent = "Loading preview…";
    var data = await api("/api/staff/weekly-email-preview");
    blogUrl = data.blog_url || "";
    $("we-meta").innerHTML =
      "Source: <code>" +
      (data.source_package || "FB package") +
      "</code>" +
      (data.post_date_iso ? " · Date: <strong>" + data.post_date_iso + "</strong>" : "");
    $("we-subject").innerHTML =
      "<strong>Subject:</strong> " + (data.subject || "(none)");
    var frame = $("we-frame");
    frame.srcdoc = data.html || "<p>No HTML</p>";
    var blog = $("we-blog");
    if (blogUrl) {
      blog.href = blogUrl;
      blog.style.display = "";
    } else {
      blog.style.display = "none";
    }
    $("we-msg").textContent = "Preview ready — review the email below. Nothing has been sent yet.";
  }

  async function scheduleSend() {
    if (
      !window.confirm(
        "Schedule this weekly email for the Sunday client send? It will be imported as a scheduled newsletter issue (not sent immediately)."
      )
    ) {
      return;
    }
    $("we-msg").textContent = "Scheduling…";
    try {
      var data = await api("/api/staff/weekly-email-preview", { status: "scheduled" }, "POST");
      $("we-msg").textContent =
        "Scheduled. Issue id: " +
        ((data.issue && data.issue.id) || "ok") +
        ". Sunday cron sends to your client list (rollout rules still apply).";
    } catch (e) {
      $("we-msg").textContent = e.message || String(e);
    }
  }

  $("we-login-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    $("we-login-err").textContent = "";
    $("we-login-btn").disabled = true;
    try {
      var cfg = await fetch("/api/staff-config").then(function (r) {
        return r.json();
      });
      if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) throw new Error("Missing staff config");
      sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      var result = await sb.auth.signInWithPassword({
        email: $("we-email").value.trim(),
        password: $("we-pass").value,
      });
      if (result.error) throw result.error;
      accessToken = result.data.session.access_token;
      setAuthed(true);
      await loadPreview();
    } catch (err) {
      $("we-login-err").textContent = err.message || String(err);
    } finally {
      $("we-login-btn").disabled = false;
    }
  });

  $("we-signout").addEventListener("click", async function () {
    if (sb) await sb.auth.signOut();
    accessToken = "";
    setAuthed(false);
  });

  $("we-reload").addEventListener("click", function () {
    loadPreview().catch(function (e) {
      $("we-msg").textContent = e.message || String(e);
    });
  });

  $("we-schedule").addEventListener("click", function () {
    scheduleSend().catch(function (e) {
      $("we-msg").textContent = e.message || String(e);
    });
  });
})();
