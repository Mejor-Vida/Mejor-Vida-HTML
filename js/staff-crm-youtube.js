/**
 * CRM YouTube — teaching-page scripts, Voice Prompter, recording review, publish.
 */
(function () {
  "use strict";

  var state = {
    groups: [],
    slug: "",
    item: null,
    tab: "script",
    loading: false,
    saving: false,
    chatBusy: false,
  };

  var MAX_UPLOAD_BYTES = 512 * 1024 * 1024;
  var WHISPER_MAX_BYTES = 25 * 1024 * 1024;

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  function clearErr() {
    var note = document.getElementById("crm-yt-err");
    if (note) note.remove();
  }

  function siblingAudioPath(videoPath) {
    return String(videoPath || "").replace(/\.[^.]+$/, "") + ".audio.wav";
  }

  function writeWavString(view, offset, str) {
    for (var i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  }

  function encodeWavFile(audioBuffer) {
    var samples = audioBuffer.getChannelData(0);
    var n = samples.length;
    var sampleRate = audioBuffer.sampleRate || 16000;
    var out = new ArrayBuffer(44 + n * 2);
    var view = new DataView(out);
    writeWavString(view, 0, "RIFF");
    view.setUint32(4, 36 + n * 2, true);
    writeWavString(view, 8, "WAVE");
    writeWavString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeWavString(view, 36, "data");
    view.setUint32(40, n * 2, true);
    for (var i = 0; i < n; i++) {
      var s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new File([out], "analysis.wav", { type: "audio/wav" });
  }

  function extractAnalysisAudio(file) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || typeof OfflineAudioContext === "undefined") {
      return Promise.reject(new Error("no audio"));
    }
    return file.arrayBuffer().then(function (ab) {
      var ctx = new AC();
      var resume = ctx.resume ? ctx.resume() : Promise.resolve();
      return resume
        .then(function () {
          return ctx.decodeAudioData(ab.slice(0));
        })
        .then(function (decoded) {
          var sampleRate = 16000;
          var length = Math.max(1, Math.ceil(decoded.duration * sampleRate));
          var offline = new OfflineAudioContext(1, length, sampleRate);
          var src = offline.createBufferSource();
          src.buffer = decoded;
          src.connect(offline.destination);
          src.start(0);
          return offline.startRendering();
        })
        .then(encodeWavFile)
        .finally(function () {
          if (ctx.close) ctx.close();
        });
    });
  }

  function putFile(signedUrl, file, mime, onProgress) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("PUT", signedUrl);
      xhr.setRequestHeader("Content-Type", mime || "application/octet-stream");
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) onProgress(e.loaded / e.total);
        };
      }
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error("Upload failed"));
      };
      xhr.onerror = function () {
        reject(new Error("Upload failed"));
      };
      xhr.send(file);
    });
  }

  function api(path, body, opts) {
    if (!window.StaffCrm || !window.StaffCrm.authedApi) throw new Error("StaffCrm not ready");
    return window.StaffCrm.authedApi(path, body, opts);
  }

  function statusLabel(status) {
    var key = "yt_status_" + (status || "empty");
    var out = t(key);
    return out === key ? status || "empty" : out;
  }

  function setHash(slug) {
    var next = slug ? "#/youtube/" + encodeURIComponent(slug) : "#/youtube";
    if (location.hash !== next) location.hash = next;
  }

  function pageSelectHtml() {
    var options = state.groups
      .map(function (g) {
        var opts = (g.pages || [])
          .map(function (p) {
            var sel = p.slug === state.slug ? " selected" : "";
            return (
              '<option value="' +
              esc(p.slug) +
              '"' +
              sel +
              ">" +
              esc(p.title) +
              "</option>"
            );
          })
          .join("");
        return '<optgroup label="' + esc(g.title) + '">' + opts + "</optgroup>";
      })
      .join("");
    return (
      '<label class="crm-yt-select-wrap"><span class="visually-hidden">' +
      esc(t("yt_page_select")) +
      "</span>" +
      '<select id="crm-yt-page-select" class="crm-yt-select">' +
      '<option value="">' +
      esc(t("yt_pick_page")) +
      "</option>" +
      options +
      "</select></label>"
    );
  }

  function paneTabs() {
    var tabs = [
      ["script", "yt_tab_script"],
      ["prompter", "yt_tab_prompter"],
      ["record", "yt_tab_record"],
      ["review", "yt_tab_review"],
    ];
    return tabs
      .map(function (pair) {
        var on = state.tab === pair[0] ? " is-active" : "";
        return (
          '<button type="button" class="crm-yt-tab' +
          on +
          '" data-yt-tab="' +
          pair[0] +
          '">' +
          esc(t(pair[1])) +
          "</button>"
        );
      })
      .join("");
  }

  function scriptPane(item) {
    var cluster = item.clusterParent
      ? '<p class="crm-yt-note">' + esc(t("yt_cluster_note", { parent: item.clusterParent })) + "</p>"
      : "";
    return (
      cluster +
      '<textarea id="crm-yt-script-es" class="crm-input crm-yt-script" spellcheck="true">' +
      esc(item.spoken || item.script_es || "") +
      "</textarea>" +
      '<div class="crm-yt-chat-wrap">' +
      '<p class="crm-yt-hint">' +
      esc(t("yt_chat_hint")) +
      "</p>" +
      '<div class="crm-yt-chat" id="crm-yt-chat"></div>' +
      '<form id="crm-yt-chat-form" class="crm-yt-chat-form">' +
      '<input id="crm-yt-chat-input" class="crm-input" autocomplete="off" placeholder="' +
      esc(t("yt_chat_placeholder")) +
      '" />' +
      '<button type="submit" class="crm-btn">' +
      esc(t("yt_chat_send")) +
      "</button>" +
      "</form></div>"
    );
  }

  function prompterPane(item) {
    var spoken = item.spoken || "";
    return (
      "<p>" +
      esc(t("yt_prompter_intro")) +
      "</p>" +
      "<ul class=\"crm-yt-bullets\">" +
      "<li>" +
      esc(t("yt_prompter_mic")) +
      "</li>" +
      "<li>" +
      esc(t("yt_prompter_cmds")) +
      "</li>" +
      "</ul>" +
      '<div class="crm-yt-toolbar">' +
      '<button type="button" class="crm-btn" id="crm-yt-open-prompter"' +
      (spoken ? "" : " disabled") +
      ">" +
      esc(t("yt_open_prompter")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-yt-mark-approved">' +
      esc(t("yt_mark_approved")) +
      "</button>" +
      "</div>" +
      (spoken
        ? ""
        : '<p class="crm-yt-hint">' + esc(t("vp_no_script")) + "</p>")
    );
  }

  function recordPane(item) {
    var hasFile = item.recording_path
      ? '<div class="crm-yt-file-row"><p>' +
        esc(t("yt_recording_on_file")) +
        " <code>" +
        esc(item.recording_path) +
        "</code></p>" +
        '<button type="button" class="crm-btn secondary crm-yt-danger" id="crm-yt-remove-recording">' +
        esc(t("yt_remove_recording")) +
        "</button></div>"
      : "<p>" + esc(t("yt_recording_none")) + "</p>";
    return (
      hasFile +
      '<p class="crm-yt-hint">' +
      esc(t("yt_upload_hint")) +
      "</p>" +
      '<input id="crm-yt-file" type="file" accept="video/*,audio/*,.mov,.mp4,.m4v,.webm" />' +
      '<div class="crm-yt-toolbar">' +
      '<button type="button" class="crm-btn" id="crm-yt-upload">' +
      esc(t("yt_upload")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-yt-analyze"' +
      (item.recording_path ? "" : " disabled") +
      ">" +
      esc(t("yt_analyze")) +
      "</button>" +
      "</div>" +
      '<p id="crm-yt-upload-status" class="crm-yt-hint"></p>'
    );
  }

  function reviewPane(item) {
    var plan = item.cut_plan || {};
    var cuts = Array.isArray(plan.cut) ? plan.cut : [];
    var keeps = Array.isArray(plan.keep) ? plan.keep : [];
    var cutHtml = cuts.length
      ? "<ul>" +
        cuts
          .map(function (c) {
            return (
              "<li>" +
              esc(String(c.start)) +
              "–" +
              esc(String(c.end)) +
              "s · " +
              esc(c.reason || "") +
              "</li>"
            );
          })
          .join("") +
        "</ul>"
      : "<p>" + esc(t("yt_no_cuts")) + "</p>";
    var keepHtml = keeps.length
      ? "<ul>" +
        keeps
          .map(function (c) {
            return (
              "<li>" +
              esc(String(c.start)) +
              "–" +
              esc(String(c.end)) +
              "s · " +
              esc(c.note || "") +
              "</li>"
            );
          })
          .join("") +
        "</ul>"
      : "";
    var yt = item.youtube_id
      ? '<p>' +
        esc(t("yt_published")) +
        ' <a href="https://www.youtube.com/watch?v=' +
        esc(item.youtube_id) +
        '" target="_blank" rel="noopener">' +
        esc(item.youtube_id) +
        "</a></p>"
      : '<p class="crm-yt-hint">' + esc(t("yt_publish_hint")) + "</p>";
    return (
      "<p><strong>" +
      esc(plan.summary || t("yt_review_empty")) +
      "</strong></p>" +
      "<h3>" +
      esc(t("yt_cut_list")) +
      "</h3>" +
      cutHtml +
      "<h3>" +
      esc(t("yt_keep_list")) +
      "</h3>" +
      keepHtml +
      "<label class=\"crm-field-label\">" +
      esc(t("yt_transcript")) +
      "</label>" +
      '<textarea class="crm-input crm-yt-area" rows="8" readonly>' +
      esc(item.transcript || "") +
      "</textarea>" +
      "<label class=\"crm-field-label\">" +
      esc(t("yt_review_notes")) +
      "</label>" +
      '<textarea id="crm-yt-review-notes" class="crm-input crm-yt-area" rows="4">' +
      esc(item.review_notes || "") +
      "</textarea>" +
      '<div class="crm-yt-toolbar">' +
      '<button type="button" class="crm-btn" id="crm-yt-approve">' +
      esc(t("yt_approve_cuts")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-yt-needs-work">' +
      esc(t("yt_needs_work")) +
      "</button>" +
      "</div>" +
      "<h3>" +
      esc(t("yt_background")) +
      "</h3>" +
      "<p>" +
      esc(t("yt_background_copy")) +
      "</p>" +
      yt
    );
  }

  function renderChat() {
    var box = document.getElementById("crm-yt-chat");
    if (!box || !state.item) return;
    var msgs = state.item.chat || [];
    box.innerHTML = msgs
      .map(function (m) {
        return (
          '<div class="crm-yt-msg crm-yt-msg--' +
          (m.role === "assistant" ? "bot" : "user") +
          '">' +
          esc(m.content || "") +
          "</div>"
        );
      })
      .join("");
    box.scrollTop = box.scrollHeight;
  }

  function renderDetail() {
    var item = state.item;
    var body = item
      ? state.tab === "prompter"
        ? prompterPane(item)
        : state.tab === "record"
          ? recordPane(item)
          : state.tab === "review"
            ? reviewPane(item)
            : scriptPane(item)
      : '<div class="crm-yt-empty">' + esc(t("yt_pick_page")) + "</div>";
    var actions = item
      ? '<a class="crm-btn secondary" href="' +
        esc(item.urlEs) +
        '" target="_blank" rel="noopener">' +
        esc(t("yt_open_page")) +
        "</a>" +
        '<button type="button" class="crm-btn secondary" id="crm-yt-generate">' +
        esc(t("yt_generate")) +
        "</button>" +
        '<button type="button" class="crm-btn" id="crm-yt-save">' +
        esc(t("yt_save")) +
        "</button>"
      : "";
    return (
      '<div class="crm-yt-head">' +
      pageSelectHtml() +
      (item
        ? '<h1 class="crm-yt-title">' +
          esc(item.title) +
          "</h1><span class=\"crm-yt-status\">" +
          esc(statusLabel(item.status)) +
          "</span>"
        : "") +
      '<div class="crm-yt-tabs">' +
      (item ? paneTabs() : "") +
      "</div>" +
      '<div class="crm-yt-toolbar">' +
      actions +
      "</div></div>" +
      '<div class="crm-yt-pane' +
      (state.tab === "script" && item ? " crm-yt-pane--script" : "") +
      '">' +
      body +
      "</div>"
    );
  }

  function render() {
    var root = document.getElementById("crm-yt-root");
    if (!root) return;
    root.innerHTML = renderDetail();
    if (state.tab === "script") renderChat();
    bind();
  }

  function collectScriptFields() {
    return {
      breakdown: (state.item && state.item.breakdown) || "",
      script_es: (document.getElementById("crm-yt-script-es") || {}).value || "",
      script_en: (state.item && state.item.script_en) || "",
    };
  }

  async function saveScript(extra) {
    if (!state.slug) return;
    extra = extra || {};
    var fields = collectScriptFields();
    state.saving = true;
    var data = await api("/api/staff/youtube-scripts", {
      action: "save",
      slug: state.slug,
      breakdown: fields.breakdown || (state.item && state.item.breakdown) || "",
      script_es: fields.script_es || (state.item && state.item.script_es) || "",
      script_en: fields.script_en || (state.item && state.item.script_en) || "",
      status: extra.status || (state.item && state.item.status) || "draft",
      chat: state.item && state.item.chat,
    });
    state.item = data.item;
    state.saving = false;
    await loadList();
    render();
  }

  async function loadList() {
    var data = await api("/api/staff/youtube-scripts", null, { method: "GET" });
    state.groups = data.groups || [];
  }

  async function loadItem(slug) {
    state.slug = slug;
    state.loading = true;
    var data = await api("/api/staff/youtube-scripts?slug=" + encodeURIComponent(slug), null, { method: "GET" });
    state.item = data;
    state.loading = false;
    if (!state.item.script_es && !state.item.breakdown) state.tab = "script";
  }

  function bind() {
    var pick = document.getElementById("crm-yt-page-select");
    if (pick) {
      pick.addEventListener("change", function () {
        var slug = String(pick.value || "").trim();
        if (!slug) return;
        setHash(slug);
        loadItem(slug).then(render).catch(showErr);
      });
    }
    document.querySelectorAll("[data-yt-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.tab = btn.getAttribute("data-yt-tab");
        render();
        if (state.tab === "prompter") launchPrompter();
      });
    });
    var gen = document.getElementById("crm-yt-generate");
    if (gen) {
      gen.addEventListener("click", function () {
        gen.disabled = true;
        api("/api/staff/youtube-scripts", { action: "generate", slug: state.slug })
          .then(function (data) {
            state.item = data.item;
            render();
          })
          .catch(showErr)
          .finally(function () {
            gen.disabled = false;
          });
      });
    }
    var save = document.getElementById("crm-yt-save");
    if (save) save.addEventListener("click", function () {
      saveScript().catch(showErr);
    });
    var form = document.getElementById("crm-yt-chat-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = document.getElementById("crm-yt-chat-input");
        var message = String(input && input.value || "").trim();
        if (!message || state.chatBusy) return;
        state.chatBusy = true;
        api("/api/staff/youtube-scripts", {
          action: "chat",
          slug: state.slug,
          message: message,
          script_es: (document.getElementById("crm-yt-script-es") || {}).value || "",
          chat: (state.item && state.item.chat) || [],
        })
          .then(function (data) {
            state.item = data.item;
            render();
          })
          .catch(showErr)
          .finally(function () {
            state.chatBusy = false;
          });
      });
    }
    var copy = document.getElementById("crm-yt-copy-spoken");
    if (copy) {
      copy.addEventListener("click", function () {
        var text = (document.getElementById("crm-yt-spoken") || {}).value || "";
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
          copy.textContent = t("yt_copied");
        }
      });
    }
    var openVp = document.getElementById("crm-yt-open-prompter");
    if (openVp) {
      openVp.addEventListener("click", function () {
        launchPrompter();
      });
    }
    var mark = document.getElementById("crm-yt-mark-approved");
    if (mark) {
      mark.addEventListener("click", function () {
        saveScript({ status: "approved" }).catch(showErr);
      });
    }
    var upload = document.getElementById("crm-yt-upload");
    if (upload) {
      upload.addEventListener("click", function () {
        var fileEl = document.getElementById("crm-yt-file");
        var file = fileEl && fileEl.files && fileEl.files[0];
        var status = document.getElementById("crm-yt-upload-status");
        if (!file) {
          if (status) status.textContent = t("yt_pick_file");
          return;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          var tooBig = t("yt_file_too_big", { mb: String(Math.round(file.size / (1024 * 1024))) });
          if (status) status.textContent = tooBig;
          showErr(new Error(tooBig));
          return;
        }
        clearErr();
        upload.disabled = true;
        var ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
        var mime =
          file.type && (file.type.indexOf("video/") === 0 || file.type.indexOf("audio/") === 0)
            ? file.type
            : ext === "mov"
              ? "video/quicktime"
              : "video/mp4";
        (async function () {
          var audioFile = null;
          if (file.size > WHISPER_MAX_BYTES) {
            if (status) status.textContent = t("yt_reading_audio");
            try {
              audioFile = await extractAnalysisAudio(file);
              if (!audioFile || audioFile.size > WHISPER_MAX_BYTES) audioFile = null;
            } catch (e) {
              audioFile = null;
            }
          }
          if (status) status.textContent = t("yt_uploading");
          var up = await api("/api/staff/youtube-scripts", {
            action: "upload-url",
            slug: state.slug,
            ext: ext,
          });
          await putFile(up.signedUrl, file, mime, function (pct) {
            if (status) status.textContent = t("yt_uploading_pct", { pct: String(Math.round(pct * 100)) });
          });
          if (audioFile) {
            if (status) status.textContent = t("yt_uploading_audio");
            var audioUp = await api("/api/staff/youtube-scripts", {
              action: "upload-url",
              slug: state.slug,
              path: siblingAudioPath(up.path),
              ext: "wav",
            });
            await putFile(audioUp.signedUrl, audioFile, "audio/wav");
          }
          var saved = await api("/api/staff/youtube-scripts", {
            action: "recording-saved",
            slug: state.slug,
            recording_path: up.path,
            recording_mime: mime,
          });
          if (!audioFile && file.size > WHISPER_MAX_BYTES) {
            saved._audioWarn = true;
          }
          return saved;
        })()
          .then(function (data) {
            state.item = data.item;
            render();
            if (data._audioWarn) {
              var again = document.getElementById("crm-yt-upload-status");
              if (again) again.textContent = t("yt_audio_skip");
            }
          })
          .catch(function (e) {
            var msg = (e && e.message) || String(e);
            if (/failed to fetch/i.test(msg)) msg = t("yt_upload_failed");
            showErr(new Error(msg));
            if (status) status.textContent = msg;
          })
          .finally(function () {
            upload.disabled = false;
          });
      });
    }
    var removeRec = document.getElementById("crm-yt-remove-recording");
    if (removeRec) {
      removeRec.addEventListener("click", function () {
        if (!window.confirm(t("yt_remove_recording_confirm"))) return;
        removeRec.disabled = true;
        var status = document.getElementById("crm-yt-upload-status");
        if (status) status.textContent = t("yt_removing");
        api("/api/staff/youtube-scripts", { action: "remove-recording", slug: state.slug })
          .then(function (data) {
            state.item = data.item;
            render();
          })
          .catch(function (e) {
            showErr(e);
            removeRec.disabled = false;
            if (status) status.textContent = (e && e.message) || String(e);
          });
      });
    }
    var analyze = document.getElementById("crm-yt-analyze");
    if (analyze) {
      analyze.addEventListener("click", function () {
        analyze.disabled = true;
        var status = document.getElementById("crm-yt-upload-status");
        if (status) status.textContent = t("yt_analyzing");
        api("/api/staff/youtube-scripts", { action: "analyze", slug: state.slug })
          .then(function (data) {
            state.item = data.item;
            state.tab = "review";
            render();
          })
          .catch(showErr)
          .finally(function () {
            analyze.disabled = false;
          });
      });
    }
    var approve = document.getElementById("crm-yt-approve");
    if (approve) {
      approve.addEventListener("click", function () {
        api("/api/staff/youtube-scripts", {
          action: "review",
          slug: state.slug,
          decision: "approved",
          review_notes: (document.getElementById("crm-yt-review-notes") || {}).value || "",
        })
          .then(function (data) {
            state.item = data.item;
            render();
          })
          .catch(showErr);
      });
    }
    var needs = document.getElementById("crm-yt-needs-work");
    if (needs) {
      needs.addEventListener("click", function () {
        api("/api/staff/youtube-scripts", {
          action: "review",
          slug: state.slug,
          decision: "changes",
          review_notes: (document.getElementById("crm-yt-review-notes") || {}).value || "",
        })
          .then(function (data) {
            state.item = data.item;
            render();
          })
          .catch(showErr);
      });
    }
  }

  function showErr(e) {
    var main = document.getElementById("crm-main");
    if (!main) return;
    var msg = (e && e.message) || String(e);
    var note = document.getElementById("crm-yt-err");
    if (note) note.textContent = msg;
    else {
      var p = document.createElement("p");
      p.id = "crm-yt-err";
      p.className = "crm-err";
      p.textContent = msg;
      main.prepend(p);
    }
  }

  function launchPrompter() {
    if (!state.item) return;
    if (!window.StaffVoicePrompter) return;
    var live = document.getElementById("crm-yt-script-es");
    var spoken =
      (live && live.value && String(live.value).trim()) ||
      state.item.spoken ||
      state.item.script_es ||
      "";
    if (!spoken.trim()) return;
    window.StaffVoicePrompter.open({
      title: state.item.title,
      script: spoken,
      lang: "es-US",
    });
  }

  async function mount(main, opts) {
    opts = opts || {};
    main.innerHTML = '<div id="crm-yt-root" class="crm-yt-shell"></div>';
    await loadList();
    if (opts.slug) {
      try {
        await loadItem(opts.slug);
      } catch (e) {
        showErr(e);
      }
    }
    render();
  }

  window.StaffCrmYoutube = { mount: mount };
})();
