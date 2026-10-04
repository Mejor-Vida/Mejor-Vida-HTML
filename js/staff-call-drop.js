/**
 * Staff Call Drop — Home Screen app for sending a recorded call into the CRM.
 */
(function () {
  "use strict";

  var loginScreen = document.getElementById("login-screen");
  var app = document.getElementById("app");
  var emailForm = document.getElementById("email-form");
  var codeForm = document.getElementById("code-form");
  var emailEl = document.getElementById("email");
  var codeEl = document.getElementById("code");
  var loginErr = document.getElementById("login-err");
  var emailBtn = document.getElementById("email-btn");
  var codeBtn = document.getElementById("code-btn");
  var installBanner = document.getElementById("install-banner");
  var statusEl = document.getElementById("status");
  var resultEl = document.getElementById("result");
  var listEl = document.getElementById("list");

  var pendingEmail = "";
  var accessToken = "";
  var refreshToken = "";
  var supabaseUrl = "";
  var supabaseAnon = "";
  var SESSION_KEY = "mvi_sms_session";
  var currentItem = null;

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function setLoginError(msg, ok) {
    loginErr.textContent = msg || "";
    loginErr.className = ok ? "err ok" : "err";
  }

  function showApp(on) {
    loginScreen.classList.toggle("hidden", on);
    app.classList.toggle("hidden", !on);
  }

  function setStatus(msg) {
    statusEl.textContent = msg || "";
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  async function api(path, body, opts) {
    var options = opts || {};
    var method = options.method || (body != null ? "POST" : "GET");
    var headers = Object.assign({}, options.headers || {});
    if (body != null && !(body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
    if (accessToken) headers.Authorization = "Bearer " + accessToken;
    var res = await fetch(path, {
      method: method,
      headers: headers,
      body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
    if (res.status === 401 && refreshToken) {
      var refreshed = await refreshSession();
      if (refreshed) {
        headers.Authorization = "Bearer " + accessToken;
        res = await fetch(path, {
          method: method,
          headers: headers,
          body: body == null ? undefined : body instanceof FormData ? body : JSON.stringify(body),
        });
      }
    }
    if (res.status === 401) {
      await signOut();
      throw new Error("signed_out");
    }
    var data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = {};
    }
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  function saveSession(session) {
    if (!session || !session.access_token) return;
    accessToken = session.access_token;
    if (session.refresh_token) refreshToken = session.refresh_token;
    var exp = session.expires_at;
    if (exp && exp < 1e12) exp = exp * 1000;
    if (!exp) exp = Date.now() + (session.expires_in || 3600) * 1000;
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: exp,
        })
      );
    } catch (e) {}
  }

  async function loadConfig() {
    var confRes = await fetch("/api/staff-config");
    var conf = await confRes.json();
    if (!confRes.ok || !conf.supabaseUrl || !conf.supabaseAnonKey) {
      throw new Error("config");
    }
    supabaseUrl = conf.supabaseUrl.replace(/\/$/, "");
    supabaseAnon = conf.supabaseAnonKey;
  }

  async function refreshSession() {
    if (!refreshToken || !supabaseUrl || !supabaseAnon) return false;
    try {
      var r = await fetch(supabaseUrl + "/auth/v1/token?grant_type=refresh_token", {
        method: "POST",
        headers: {
          apikey: supabaseAnon,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      var j = await r.json().catch(function () {
        return {};
      });
      if (!r.ok || !j.access_token) return false;
      saveSession(j);
      return true;
    } catch (e) {
      return false;
    }
  }

  async function restoreSession() {
    try {
      var s = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (!s || !s.access_token) return false;
      accessToken = s.access_token;
      refreshToken = s.refresh_token || "";
      if (s.expires_at && s.expires_at < Date.now() + 60000) {
        var ok = await refreshSession();
        if (!ok) return !!accessToken;
      }
      return !!accessToken;
    } catch (e) {
      return false;
    }
  }

  async function signOut() {
    accessToken = "";
    refreshToken = "";
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    showApp(false);
    codeForm.classList.add("hidden");
    emailForm.classList.remove("hidden");
  }

  function fieldRows(extracted) {
    var labels = [
      ["first_name", "First name"],
      ["last_name", "Last name"],
      ["phone", "Phone"],
      ["email", "Email"],
      ["language", "Language"],
      ["age", "Age"],
      ["sex", "Sex"],
      ["tobacco", "Tobacco"],
      ["date_of_birth", "Birthdate"],
      ["state", "State"],
      ["height", "Height"],
      ["weight", "Weight"],
      ["living_situation", "Living"],
      ["citizenship_status", "Citizenship"],
      ["coverage_amount", "Coverage"],
    ];
    var html = '<ul class="fields">';
    labels.forEach(function (pair) {
      var val = extracted[pair[0]];
      if (val == null || val === "") return;
      html += "<li><span>" + esc(pair[1]) + "</span><strong>" + esc(val === true ? "Yes" : val === false ? "No" : val) + "</strong></li>";
    });
    html += "</ul>";
    return html;
  }

  function renderResult(item) {
    currentItem = item;
    if (!item) {
      resultEl.classList.add("hidden");
      resultEl.innerHTML = "";
      return;
    }
    var extracted = item.extracted || {};
    var match = item.match_label
      ? "<p>Matched client: <strong>" + esc(item.match_label) + "</strong></p>"
      : "<p>No matching client yet. Apply will create one if there is a phone or email.</p>";
    var err = item.error_text ? '<p class="err">' + esc(item.error_text) + "</p>" : "";
    var summary = extracted.summary ? '<p class="summary">' + esc(extracted.summary) + "</p>" : "";
    var actions =
      item.status === "applied"
        ? '<p class="status">Applied to the client record.</p>' +
          (item.matched_lead_id
            ? '<p><a class="btn" href="/staff/crm.html#/clients/' +
              encodeURIComponent(item.matched_lead_id) +
              '/overview">Open client</a></p>'
            : "")
        : item.status === "ready" || item.status === "error"
          ? '<div class="result-actions"><button type="button" class="btn" id="apply-btn">Apply to CRM fields</button>' +
            '<button type="button" class="btn secondary" id="discard-btn">Discard</button></div>'
          : "";
    resultEl.innerHTML =
      "<h3>Extracted fields</h3>" +
      err +
      match +
      fieldRows(extracted) +
      summary +
      actions;
    resultEl.classList.remove("hidden");
    var applyBtn = document.getElementById("apply-btn");
    if (applyBtn) {
      applyBtn.onclick = async function () {
        applyBtn.disabled = true;
        setStatus("Saving fields on the client…");
        try {
          var data = await api("/api/staff/call-intake", { action: "apply", id: item.id });
          renderResult(data.item);
          setStatus("Saved. Blank CRM fields were filled; existing values were left alone.");
          await loadList();
        } catch (e) {
          setStatus(e.message || "Could not apply");
          applyBtn.disabled = false;
        }
      };
    }
    var discardBtn = document.getElementById("discard-btn");
    if (discardBtn) {
      discardBtn.onclick = async function () {
        try {
          await api("/api/staff/call-intake", { action: "discard", id: item.id });
          renderResult(null);
          setStatus("Discarded.");
          await loadList();
        } catch (e) {
          setStatus(e.message || "Could not discard");
        }
      };
    }
  }

  function formatWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }

  async function loadList() {
    try {
      var data = await api("/api/staff/call-intake");
      var items = data.items || [];
      if (!items.length) {
        listEl.innerHTML = '<p class="sub">No calls dropped yet.</p>';
        return;
      }
      listEl.innerHTML = items
        .map(function (it) {
          return (
            '<button type="button" class="item" data-id="' +
            esc(it.id) +
            '"><strong>' +
            esc(it.match_label || it.hint_phone || "Call") +
            "</strong><div class=\"meta\">" +
            esc(it.status) +
            " · " +
            esc(formatWhen(it.created_at)) +
            "</div></button>"
          );
        })
        .join("");
    } catch (e) {
      listEl.innerHTML = '<p class="err">' + esc(e.message || "Could not load") + "</p>";
    }
  }

  async function openItem(id) {
    setStatus("Loading…");
    try {
      var data = await api("/api/staff/call-intake?id=" + encodeURIComponent(id));
      renderResult(data.item);
      setStatus("");
    } catch (e) {
      setStatus(e.message || "Could not load call");
    }
  }

  function hintPhone() {
    return String(document.getElementById("hint-phone").value || "").trim();
  }

  async function pasteTranscript() {
    var text = String(document.getElementById("transcript").value || "").trim();
    if (text.length < 20) {
      setStatus("Paste more of the transcript first.");
      return;
    }
    setStatus("Reading the transcript…");
    try {
      var data = await api("/api/staff/call-intake", {
        action: "paste",
        transcript_text: text,
        hint_phone: hintPhone(),
      });
      renderResult(data.item);
      setStatus("Ready. Check the fields, then apply.");
      await loadList();
    } catch (e) {
      setStatus(e.message || "Could not read transcript");
    }
  }

  function putFile(url, file, mime) {
    return fetch(url, {
      method: "PUT",
      headers: { "Content-Type": mime || file.type || "application/octet-stream" },
      body: file,
    }).then(function (r) {
      if (!r.ok) throw new Error("Upload failed");
    });
  }

  async function uploadFile(file) {
    if (!file) return;
    var name = String(file.name || "call.m4a");
    var ext = (name.split(".").pop() || "m4a").toLowerCase();
    setStatus("Uploading recording…");
    try {
      var up = await api("/api/staff/call-intake", {
        action: "upload-url",
        ext: ext,
        hint_phone: hintPhone(),
      });
      await putFile(up.signedUrl, file, up.mime || file.type);
      setStatus("Transcribing the call… this can take a minute.");
      var data = await api("/api/staff/call-intake", { action: "uploaded", id: up.id });
      renderResult(data.item);
      setStatus("Ready. Check the fields, then apply.");
      await loadList();
    } catch (e) {
      setStatus(e.message || "Upload failed");
    }
  }

  emailForm.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    pendingEmail = String(emailEl.value || "").trim().toLowerCase();
    emailBtn.disabled = true;
    setLoginError("");
    try {
      var data = await fetch("/api/staff/sms-otp-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      }).then(function (r) {
        return r.json();
      });
      if (!data.ok) {
        setLoginError(data.error || "Could not send code");
        return;
      }
      emailForm.classList.add("hidden");
      codeForm.classList.remove("hidden");
      setLoginError("Code sent. Check email.", true);
      codeEl.focus();
    } catch (e) {
      setLoginError("Could not send code");
    } finally {
      emailBtn.disabled = false;
    }
  });

  codeForm.addEventListener("submit", async function (ev) {
    ev.preventDefault();
    codeBtn.disabled = true;
    try {
      var data = await fetch("/api/staff/sms-otp-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, code: String(codeEl.value || "").trim() }),
      }).then(function (r) {
        return r.json();
      });
      if (!data.ok || !data.session) {
        setLoginError(data.error || "Wrong code");
        return;
      }
      saveSession(data.session);
      showApp(true);
      await loadList();
    } catch (e) {
      setLoginError("Could not verify");
    } finally {
      codeBtn.disabled = false;
    }
  });

  document.getElementById("back-email").addEventListener("click", function () {
    codeForm.classList.add("hidden");
    emailForm.classList.remove("hidden");
    setLoginError("");
  });
  document.getElementById("signout-btn").addEventListener("click", signOut);
  document.getElementById("paste-btn").addEventListener("click", pasteTranscript);
  document.getElementById("refresh-btn").addEventListener("click", loadList);
  document.getElementById("file").addEventListener("change", function (ev) {
    var file = ev.target.files && ev.target.files[0];
    uploadFile(file);
    ev.target.value = "";
  });
  listEl.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-id]");
    if (btn) openItem(btn.getAttribute("data-id"));
  });

  (async function boot() {
    try {
      await loadConfig();
    } catch (e) {
      setLoginError("Could not load staff configuration.");
      return;
    }
    if (!isStandalone()) installBanner.classList.remove("hidden");
    var restored = await restoreSession();
    if (restored) {
      showApp(true);
      await loadList();
    }
    try {
      var params = new URLSearchParams(window.location.search);
      var shared = params.get("text") || params.get("transcript") || "";
      if (shared && restored) {
        document.getElementById("transcript").value = shared;
      }
    } catch (e) {}
  })();
})();
