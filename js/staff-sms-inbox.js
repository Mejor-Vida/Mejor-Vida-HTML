(function () {
  var loginScreen = document.getElementById("login-screen");
  var app = document.getElementById("app");
  var emailForm = document.getElementById("email-form");
  var codeForm = document.getElementById("code-form");
  var emailEl = document.getElementById("email");
  var codeEl = document.getElementById("code");
  var loginErr = document.getElementById("login-err");
  var emailBtn = document.getElementById("email-btn");
  var codeBtn = document.getElementById("code-btn");
  var listView = document.getElementById("list-view");
  var chatView = document.getElementById("chat-view");
  var threadList = document.getElementById("thread-list");
  var bubbles = document.getElementById("bubbles");
  var chatTitle = document.getElementById("chat-title");
  var replyBody = document.getElementById("reply-body");
  var pushBanner = document.getElementById("push-banner");
  var installBanner = document.getElementById("install-banner");
  var safariBanner = document.getElementById("safari-banner");

  var pendingEmail = "";
  var accessToken = "";
  var refreshToken = "";
  var supabaseUrl = "";
  var supabaseAnon = "";
  var currentPhone = "";
  var pollTimer = null;
  var SESSION_KEY = "mvi_sms_session";

  function isStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  }

  function isIos() {
    var ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function isIosSafari() {
    var ua = navigator.userAgent || "";
    if (!isIos()) return false;
    if (/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA|Chrome|Android/.test(ua)) return false;
    return /Safari/.test(ua) || !!window.navigator.standalone;
  }

  function setLoginError(msg, ok) {
    loginErr.textContent = msg || "";
    loginErr.className = ok ? "err ok" : "err";
  }

  function showApp(on) {
    loginScreen.classList.toggle("hidden", on);
    app.classList.toggle("hidden", !on);
  }

  function showChat(on) {
    listView.classList.toggle("hidden", on);
    chatView.classList.toggle("hidden", !on);
  }

  function formatWhen(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    var now = new Date();
    var sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) {
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  async function api(path, opts) {
    var options = opts || {};
    var headers = Object.assign(
      { "Content-Type": "application/json" },
      options.headers || {}
    );
    if (accessToken) headers.Authorization = "Bearer " + accessToken;
    var res = await fetch(path, Object.assign({}, options, { headers: headers }));
    if (res.status === 401 && refreshToken) {
      var refreshed = await refreshSession();
      if (refreshed) {
        headers.Authorization = "Bearer " + accessToken;
        res = await fetch(path, Object.assign({}, options, { headers: headers }));
      }
    }
    if (res.status === 401) {
      await signOut(false);
      throw new Error("signed_out");
    }
    var data = {};
    try {
      data = await res.json();
    } catch (e) {
      data = {};
    }
    if (!res.ok && !data.error) data.error = "Request failed";
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
    currentPhone = "";
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {}
    showChat(false);
    showApp(false);
    codeForm.classList.add("hidden");
    emailForm.classList.remove("hidden");
  }

  function urlPhone() {
    try {
      return new URLSearchParams(window.location.search).get("phone") || "";
    } catch (e) {
      return "";
    }
  }

  async function loadThreads() {
    var data = await api("/api/staff/sms-threads");
    if (!data.ok) {
      threadList.innerHTML = '<p class="empty">' + (data.error || "Could not load messages.") + "</p>";
      return;
    }
    var threads = data.threads || [];
    if (!threads.length) {
      threadList.innerHTML = '<p class="empty">No texts yet. Send a message to 402-844-1199 or start a new conversation below.</p>';
      return;
    }
    threadList.innerHTML = threads
      .map(function (t) {
        var who = t.display || t.phone;
        var preview = (t.lastDirection === "outbound" ? "You: " : "") + (t.lastBody || "");
        return (
          '<button type="button" class="thread" data-phone="' +
          encodeURIComponent(t.phone) +
          '"><span class="when">' +
          formatWhen(t.lastAt) +
          '</span><div class="who">' +
          who +
          '</div><div class="preview">' +
          preview.replace(/</g, "&lt;") +
          "</div></button>"
        );
      })
      .join("");
  }

  function toE164(raw) {
    var d = String(raw || "").replace(/\D/g, "");
    if (d.length === 10) return "+1" + d;
    if (d.length === 11 && d.charAt(0) === "1") return "+" + d;
    return String(raw || "").trim();
  }

  async function openThread(phone) {
    currentPhone = toE164(phone);
    chatTitle.textContent = currentPhone;
    showChat(true);
    await loadMessages();
    replyBody.focus();
  }

  async function loadMessages() {
    if (!currentPhone) return;
    var data = await api("/api/staff/sms-messages?phone=" + encodeURIComponent(currentPhone));
    if (!data.ok) return;
    var msgs = data.messages || [];
    bubbles.innerHTML = msgs
      .map(function (m) {
        var cls = m.direction === "outbound" ? "out" : "in";
        return (
          '<div class="bubble ' +
          cls +
          '">' +
          String(m.body || "").replace(/</g, "&lt;") +
          '<span class="meta">' +
          formatWhen(m.created_at) +
          "</span></div>"
        );
      })
      .join("");
    bubbles.scrollTop = bubbles.scrollHeight;
    if (msgs.length && msgs[0].thread_phone) {
      /* keep */
    }
  }

  function urlBase64ToUint8Array(base64String) {
    var padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    var base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    var rawData = atob(base64);
    var outputArray = new Uint8Array(rawData.length);
    for (var i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  }

  async function registerPush() {
    var canPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    if (isIos() && !isStandalone()) {
      installBanner.classList.remove("hidden");
      pushBanner.classList.add("hidden");
      return;
    }
    if (!canPush) {
      if (isIos()) installBanner.classList.remove("hidden");
      return;
    }
    installBanner.classList.add("hidden");
    try {
      var reg = await navigator.serviceWorker.register("/sms-inbox-sw.js", { scope: "/staff/" });
      navigator.serviceWorker.addEventListener("message", function (event) {
        if (event.data && event.data.type === "sms-open" && event.data.url) {
          var u = new URL(event.data.url, window.location.origin);
          var phone = u.searchParams.get("phone");
          if (phone) openThread(phone);
        }
      });
      var vapid = await api("/api/staff/sms-vapid");
      if (!vapid.ok || !vapid.publicKey) {
        document.getElementById("push-banner-text").textContent =
          "Text alerts are not configured on the server yet.";
        pushBanner.classList.remove("hidden");
        return;
      }
      if (Notification.permission === "granted") {
        await enablePush(reg, vapid.publicKey, false);
        return;
      }
      if (Notification.permission === "denied") {
        document.getElementById("push-banner-text").textContent =
          "Notifications are blocked. On iPhone: Settings → Safari → MVI SMS → allow notifications, or delete the icon and add it again.";
        pushBanner.classList.remove("hidden");
        return;
      }
      pushBanner.classList.remove("hidden");
      var btn = document.getElementById("enable-push-btn");
      btn.onclick = function () {
        enablePush(reg, vapid.publicKey, true);
      };
    } catch (e) {
      document.getElementById("push-banner-text").textContent =
        "Could not set up alerts. Open the Home Screen icon (not a Safari tab) and try again.";
      pushBanner.classList.remove("hidden");
    }
  }

  async function enablePush(reg, publicKey, fromTap) {
    var textEl = document.getElementById("push-banner-text");
    var btn = document.getElementById("enable-push-btn");
    try {
      var perm = Notification.permission;
      if (perm !== "granted") {
        perm = await Notification.requestPermission();
      }
      if (perm !== "granted") {
        textEl.textContent = "Allow was not granted. Tap Turn on text alerts again, or check iPhone Settings.";
        return;
      }
      var sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      var saved = await api("/api/staff/sms-push-subscribe", {
        method: "POST",
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      if (!saved.ok) {
        textEl.textContent = saved.error || "Could not save this phone for alerts.";
        return;
      }
      var test = await api("/api/staff/sms-push-test", { method: "POST", body: "{}" });
      textEl.textContent =
        test && test.sent
          ? "Text alerts are on. You should see a test notification now. Incoming texts will alert here instead of only by email."
          : "This phone is saved. If you did not see a test alert, open the Home Screen icon and tap Turn on text alerts again.";
      if (btn) btn.classList.add("hidden");
      pushBanner.classList.remove("hidden");
      pushBanner.classList.remove("banner-warn");
    } catch (e) {
      textEl.textContent = fromTap
        ? "Could not enable alerts. Open the MVI SMS icon from the Home Screen and try again."
        : textEl.textContent;
      console.warn("enablePush", e);
    }
  }

  function startPoll() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function () {
      if (document.hidden) return;
      if (currentPhone) loadMessages().catch(function () {});
      else loadThreads().catch(function () {});
    }, 8000);
  }

  async function afterLogin() {
    showApp(true);
    showChat(false);
    var needSafari = isIos() && !isIosSafari() && !isStandalone();
    if (needSafari) {
      safariBanner.classList.remove("hidden");
      installBanner.classList.add("hidden");
    } else if (!isStandalone()) {
      safariBanner.classList.add("hidden");
      installBanner.classList.remove("hidden");
    } else {
      safariBanner.classList.add("hidden");
      installBanner.classList.add("hidden");
    }
    await loadThreads();
    var deep = urlPhone();
    if (deep) await openThread(deep);
    startPoll();
    if (!needSafari) registerPush();
  }

  var copyLinkBtn = document.getElementById("copy-inbox-link");
  if (copyLinkBtn) {
    copyLinkBtn.addEventListener("click", async function () {
      var url = "https://www.mejorvidainsurance.com/staff/sms-inbox.html";
      try {
        await navigator.clipboard.writeText(url);
        copyLinkBtn.textContent = "Copied — paste it in Safari";
      } catch (e) {
        window.prompt("Copy this link and open it in Safari:", url);
      }
    });
  }

  emailForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    setLoginError("");
    emailBtn.disabled = true;
    try {
      var email = String(emailEl.value || "").trim();
      var data = await api("/api/staff/sms-otp-request", {
        method: "POST",
        body: JSON.stringify({ email: email }),
      });
      if (!data.ok) {
        setLoginError(data.error || "Could not send a code.");
        return;
      }
      pendingEmail = email;
      emailForm.classList.add("hidden");
      codeForm.classList.remove("hidden");
      setLoginError("If this email is authorized, a code is on the way.", true);
      codeEl.focus();
    } catch (err) {
      setLoginError("Could not send a code. Please try again.");
    } finally {
      emailBtn.disabled = false;
    }
  });

  document.getElementById("back-email").addEventListener("click", function () {
    codeForm.classList.add("hidden");
    emailForm.classList.remove("hidden");
    setLoginError("");
  });

  codeForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    setLoginError("");
    codeBtn.disabled = true;
    try {
      var data = await api("/api/staff/sms-otp-verify", {
        method: "POST",
        body: JSON.stringify({
          email: pendingEmail || String(emailEl.value || "").trim(),
          code: String(codeEl.value || "").trim(),
        }),
      });
      if (!data.ok || !data.session || !data.session.access_token) {
        setLoginError(data.error || "That code did not work.");
        return;
      }
      saveSession(data.session);
      await afterLogin();
    } catch (err) {
      setLoginError("Could not verify the code. Please try again.");
    } finally {
      codeBtn.disabled = false;
    }
  });

  threadList.addEventListener("click", function (e) {
    var btn = e.target.closest(".thread");
    if (!btn) return;
    var phone = decodeURIComponent(btn.getAttribute("data-phone") || "");
    if (phone) openThread(phone);
  });

  document.getElementById("back-btn").addEventListener("click", function () {
    currentPhone = "";
    showChat(false);
    loadThreads().catch(function () {});
  });

  document.getElementById("signout-btn").addEventListener("click", function () {
    signOut();
  });

  document.getElementById("new-thread-btn").addEventListener("click", function () {
    var phone = String(document.getElementById("new-phone").value || "").trim();
    if (!phone) return;
    openThread(phone);
  });

  document.getElementById("composer").addEventListener("submit", async function (e) {
    e.preventDefault();
    var text = String(replyBody.value || "").trim();
    if (!text || !currentPhone) return;
    var sendBtn = document.getElementById("send-btn");
    sendBtn.disabled = true;
    try {
      var data = await api("/api/staff/sms-reply", {
        method: "POST",
        body: JSON.stringify({ toPhone: currentPhone, body: text }),
      });
      if (!data.ok) {
        alert(data.error || "Could not send.");
        return;
      }
      if (data.to) currentPhone = data.to;
      replyBody.value = "";
      await loadMessages();
      await loadThreads();
    } finally {
      sendBtn.disabled = false;
    }
  });

  (async function init() {
    try {
      await loadConfig();
    } catch (e) {
      console.warn("staff-config failed", e);
    }
    try {
      if (await restoreSession()) {
        await afterLogin();
      }
    } catch (e) {
      setLoginError("Could not restore the previous sign-in. Request a new code.");
    }
  })();
})();
