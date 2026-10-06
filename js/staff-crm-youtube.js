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
    playUrl: "",
    playMime: "",
    playSlug: "",
    playPath: "",
    playRow: -1,
    playUntil: null,
    playOpen: false,
    cutting: false,
    fixJobs: {},
    fixTicker: 0,
    fixPoll: 0,
  };

  var MAX_UPLOAD_BYTES = 4 * 1024 * 1024 * 1024;
  var HOLDING_MAX_BYTES = 40 * 1024 * 1024;
  var WHISPER_MAX_BYTES = 25 * 1024 * 1024;
  var HOLDING_MAX_EDGE = 960;

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

  function pickRecorderMime() {
    var types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ];
    for (var i = 0; i < types.length; i++) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(types[i])) {
        return types[i];
      }
    }
    return "";
  }

  function fitHoldingSize(vw, vh) {
    var w = Math.max(2, vw || 0);
    var h = Math.max(2, vh || 0);
    var long = Math.max(w, h);
    if (long > HOLDING_MAX_EDGE) {
      var scale = HOLDING_MAX_EDGE / long;
      w = w * scale;
      h = h * scale;
    }
    w = Math.max(2, Math.round(w / 2) * 2);
    h = Math.max(2, Math.round(h / 2) * 2);
    return { w: w, h: h };
  }

  function holdingBitrate(durationSec) {
    var budgetBits = 36 * 1024 * 1024 * 8;
    var audio = 96000;
    var dur = Math.max(20, Number(durationSec) || 180);
    return Math.max(400000, Math.min(1500000, Math.floor(budgetBits / dur) - audio));
  }

  function compressForHolding(file, onProgress) {
    if (file.size <= HOLDING_MAX_BYTES) return Promise.resolve(file);
    if (file.type && file.type.indexOf("audio/") === 0) return Promise.resolve(file);
    var mime = pickRecorderMime();
    if (!mime) return Promise.reject(new Error("compress"));
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var video = document.createElement("video");
      var canvas = document.createElement("canvas");
      var rec = null;
      var stream = null;
      var done = false;
      var chunks = [];
      function fail(err) {
        if (done) return;
        done = true;
        cleanup();
        reject(err || new Error("compress"));
      }
      function cleanup() {
        try {
          if (rec && rec.state === "recording") rec.stop();
        } catch (e) {}
        if (stream) {
          stream.getTracks().forEach(function (tr) {
            try {
              tr.stop();
            } catch (e2) {}
          });
        }
        try {
          video.pause();
        } catch (e3) {}
        if (video.parentNode) video.parentNode.removeChild(video);
        URL.revokeObjectURL(url);
      }
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.preload = "auto";
      video.muted = false;
      video.volume = 0;
      video.controls = false;
      video.style.cssText = "position:fixed;left:-9999px;top:0;width:4px;height:4px;opacity:0;";
      document.body.appendChild(video);
      video.onerror = function () {
        fail(new Error("compress"));
      };
      video.onloadedmetadata = function () {
        var size = fitHoldingSize(video.videoWidth, video.videoHeight);
        canvas.width = size.w;
        canvas.height = size.h;
        var ctx = canvas.getContext("2d");
        if (!ctx) return fail(new Error("compress"));
        var recMime = mime;
        var draw = function () {
          if (done) return;
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          } catch (e4) {}
          if (typeof video.requestVideoFrameCallback === "function") {
            video.requestVideoFrameCallback(function () {
              draw();
            });
          }
        };
        video.ontimeupdate = function () {
          if (onProgress && video.duration) onProgress(video.currentTime / video.duration);
        };
        video.onended = function () {
          try {
            if (rec && rec.state === "recording") rec.stop();
          } catch (e5) {
            fail(new Error("compress"));
          }
        };
        video
          .play()
          .then(function () {
            try {
              stream = canvas.captureStream(30);
              var live = video.captureStream ? video.captureStream() : video.mozCaptureStream && video.mozCaptureStream();
              if (live) {
                live.getAudioTracks().forEach(function (tr) {
                  stream.addTrack(tr);
                });
              }
              rec = new MediaRecorder(stream, {
                mimeType: recMime,
                videoBitsPerSecond: holdingBitrate(video.duration),
                audioBitsPerSecond: 96000,
              });
            } catch (e) {
              return fail(new Error("compress"));
            }
            rec.ondataavailable = function (ev) {
              if (ev.data && ev.data.size) chunks.push(ev.data);
            };
            rec.onerror = function () {
              fail(new Error("compress"));
            };
            rec.onstop = function () {
              if (done) return;
              done = true;
              cleanup();
              var blob = new Blob(chunks, { type: recMime.split(";")[0] });
              var ext = recMime.indexOf("mp4") >= 0 ? "mp4" : "webm";
              resolve(new File([blob], "holding." + ext, { type: blob.type || recMime.split(";")[0] }));
            };
            rec.start(250);
            if (typeof video.requestVideoFrameCallback === "function") draw();
            else {
              var loop = function () {
                if (done) return;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                requestAnimationFrame(loop);
              };
              loop();
            }
          })
          .catch(function () {
            fail(new Error("compress"));
          });
      };
      video.src = url;
      video.load();
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

  function formatTs(sec) {
    if (sec == null || sec === "" || !isFinite(Number(sec))) return "";
    var s = Math.max(0, Number(sec));
    var m = Math.floor(s / 60);
    var rem = s - m * 60;
    var whole = Math.floor(rem);
    var tenth = Math.round((rem - whole) * 10);
    if (tenth === 10) {
      whole += 1;
      tenth = 0;
    }
    if (whole === 60) {
      m += 1;
      whole = 0;
    }
    return m + ":" + (whole < 10 ? "0" : "") + whole + "." + tenth;
  }

  function tsRange(start, end) {
    var a = formatTs(start);
    var b = formatTs(end);
    if (a && b) return a + " – " + b;
    return a || b;
  }

  function tokenizeWords(s) {
    return String(s || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function normalizeWord(w) {
    return String(w || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/^[¡¿]+/, "")
      .replace(/[.,;:!?…"'«»”’]+$/g, "")
      .replace(/[^a-z0-9ñü$]/gi, "");
  }

  function wordsMatch(a, b) {
    var x = normalizeWord(a);
    var y = normalizeWord(b);
    return !!(x && y && x === y);
  }

  function alignWords(script, spoken) {
    var A = tokenizeWords(script);
    var B = tokenizeWords(spoken);
    var n = A.length;
    var m = B.length;
    var dp = [];
    var i;
    var j;
    for (i = 0; i <= n; i++) {
      dp[i] = [];
      for (j = 0; j <= m; j++) dp[i][j] = 0;
    }
    for (i = n - 1; i >= 0; i--) {
      for (j = m - 1; j >= 0; j--) {
        dp[i][j] = wordsMatch(A[i], B[j])
          ? 1 + dp[i + 1][j + 1]
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    var raw = [];
    i = 0;
    j = 0;
    while (i < n && j < m) {
      if (wordsMatch(A[i], B[j])) {
        raw.push({ script: A[i], spoken: B[j], match: true });
        i += 1;
        j += 1;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        raw.push({ script: A[i], spoken: "", match: false });
        i += 1;
      } else {
        raw.push({ script: "", spoken: B[j], match: false });
        j += 1;
      }
    }
    while (i < n) {
      raw.push({ script: A[i], spoken: "", match: false });
      i += 1;
    }
    while (j < m) {
      raw.push({ script: "", spoken: B[j], match: false });
      j += 1;
    }
    var pairs = [];
    for (var k = 0; k < raw.length; k++) {
      var p = raw[k];
      var nxt = raw[k + 1];
      if (
        nxt &&
        !p.match &&
        !nxt.match &&
        p.script &&
        !p.spoken &&
        nxt.spoken &&
        !nxt.script
      ) {
        pairs.push({ script: p.script, spoken: nxt.spoken, match: false });
        k += 1;
      } else {
        pairs.push(p);
      }
    }
    return pairs;
  }

  function wordCellHtml(pair) {
    var off = !pair.match;
    return (
      '<span class="crm-yt-word' +
      (off ? " is-off" : "") +
      '"><span class="crm-yt-word-script' +
      (pair.script ? "" : " is-empty") +
      '">' +
      (pair.script ? esc(pair.script) : "&nbsp;") +
      '</span><span class="crm-yt-word-spoken' +
      (pair.spoken ? "" : " is-empty") +
      '">' +
      (pair.spoken ? esc(pair.spoken) : "&nbsp;") +
      "</span></span>"
    );
  }

  function speechTokens(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9ñü\s]/gi, " ")
      .split(/\s+/)
      .filter(function (w) {
        return w.length > 1;
      });
  }

  function tokenOverlap(a, b) {
    var A = speechTokens(a);
    var B = speechTokens(b);
    if (!A.length || !B.length) return 0;
    var set = {};
    A.forEach(function (w) {
      set[w] = true;
    });
    var hit = 0;
    B.forEach(function (w) {
      if (set[w]) hit += 1;
    });
    return hit / Math.max(A.length, B.length);
  }

  function splitScriptRows(script) {
    var text = String(script || "").replace(/\r/g, "").trim();
    if (!text) return [];
    var paras = text
      .split(/\n\s*\n/)
      .map(function (p) {
        return p.replace(/\s+/g, " ").trim();
      })
      .filter(Boolean);
    var rows = [];
    paras.forEach(function (p) {
    var parts = p.match(/[^.!?…]+(?:[.!?…]+|$)/g);
    var sentences = (parts || [p]).map(function (s) {
      return s.trim();
    }).filter(Boolean);
    if (sentences.length > 1 && p.length > 80) rows.push.apply(rows, sentences);
    else rows.push(p);
    });
    return rows;
  }

  function describeDeviation(script, spoken) {
    var a = speechTokens(script);
    var b = speechTokens(spoken);
    if (!a.length) return spoken ? t("yt_dev_not_in_script") : "";
    if (!b.length) return t("yt_dev_not_heard");
    var overlap = tokenOverlap(script, spoken);
    if (overlap >= 0.78 && Math.abs(a.length - b.length) <= 3) return "";
    if (b.length > a.length + 4) return t("yt_dev_extra");
    if (a.length > b.length + 4) return t("yt_dev_skipped");
    if (overlap < 0.55) return t("yt_dev_wording");
    if (overlap < 0.78) return t("yt_dev_small");
    return "";
  }

  function alignScriptToSegments(scriptEs, segments) {
    var rows = splitScriptRows(scriptEs);
    var segs = (segments || []).filter(function (s) {
      return s && String(s.text || "").trim();
    });
    if (!rows.length) {
      return segs.map(function (s) {
        return {
          script: "",
          spoken: s.text,
          start: s.start,
          end: s.end,
          deviation: t("yt_dev_not_in_script"),
        };
      });
    }
    var assigned = rows.map(function () {
      return [];
    });
    var extras = rows.map(function () {
      return [];
    });
    var before = [];
    var i = 0;
    segs.forEach(function (seg) {
      var thisScore = tokenOverlap(seg.text, rows[i] || "");
      var nextScore = i + 1 < rows.length ? tokenOverlap(seg.text, rows[i + 1]) : 0;
      var extraRow = {
        script: "",
        spoken: seg.text,
        start: seg.start,
        end: seg.end,
        deviation: t("yt_dev_not_in_script"),
      };
      if (Math.max(thisScore, nextScore) < 0.18) {
        if (!assigned[i] || !assigned[i].length) before.push(extraRow);
        else extras[i].push(extraRow);
        return;
      }
      if (nextScore > thisScore + 0.06 && nextScore >= 0.22) i += 1;
      assigned[Math.min(i, rows.length - 1)].push(seg);
    });
    var out = before.slice();
    rows.forEach(function (script, r) {
      var group = assigned[r];
      var spoken = group
        .map(function (s) {
          return s.text;
        })
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      out.push({
        script: script,
        spoken: spoken,
        start: group.length ? group[0].start : null,
        end: group.length ? group[group.length - 1].end : null,
        deviation: describeDeviation(script, spoken) || null,
      });
      extras[r].forEach(function (row) {
        out.push(row);
      });
    });
    return out;
  }

  function alignmentRows(item) {
    var plan = item.cut_plan || {};
    var script = item.spoken || item.script_es || "";
    if (Array.isArray(plan.rows) && plan.rows.length) {
      return plan.rows.map(function (row) {
        var line = String((row && row.script) || "").trim();
        var spoken = String((row && row.spoken) || "").trim();
        return {
          script: line,
          spoken: spoken,
          start: row && row.start,
          end: row && row.end,
          deviation: describeDeviation(line, spoken) || null,
        };
      });
    }
    var segs = Array.isArray(plan.segments) ? plan.segments : [];
    if (segs.length) return alignScriptToSegments(script, segs);
    if (item.transcript) {
      var fake = splitScriptRows(item.transcript).map(function (text) {
        return { start: null, end: null, text: text };
      });
      return alignScriptToSegments(script, fake);
    }
    if (script) {
      return splitScriptRows(script).map(function (line) {
        return {
          script: line,
          spoken: "",
          start: null,
          end: null,
          deviation: t("yt_dev_not_heard"),
        };
      });
    }
    return [];
  }

  function expectedSpeechSec(text) {
    var n = speechTokens(text).length;
    if (!n) return 0;
    return Math.max(1.1, n / 2.15);
  }

  function offScriptIssues(item) {
    var plan = (item && item.cut_plan) || {};
    if (Array.isArray(plan.issues) && plan.issues.length) return plan.issues;
    var rows = alignmentRows(item);
    var cuts = Array.isArray(plan.cut) ? plan.cut : [];
    var issues = [];
    var first = null;
    rows.forEach(function (r) {
      if (!first && r && String(r.script || "").trim() && isFinite(Number(r.start)) && isFinite(Number(r.end))) {
        first = r;
      }
      if (r && !String(r.script || "").trim() && String(r.spoken || "").trim() && isFinite(Number(r.start))) {
        issues.push({
          start: Number(r.start),
          end: Number(r.end),
          kind: "extra_speech",
          label: t("yt_offscript_extra"),
          spoken: String(r.spoken).trim(),
          status: "open",
        });
      }
    });
    if (first) {
      var dur = Number(first.end) - Number(first.start);
      var exp = expectedSpeechSec(first.script);
      if (dur > exp + 1.15) {
        issues.unshift({
          start: Number(first.start),
          end: Math.round((Number(first.start) + (dur - exp)) * 10) / 10,
          kind: "before_script",
          label: t("yt_offscript_before"),
          spoken: "",
          status: "open",
        });
      }
    }
    cuts.forEach(function (c) {
      var reason = String((c && c.reason) || "").trim();
      issues.push({
        start: Number(c.start),
        end: Number(c.end),
        kind: /retake|restart|go back/i.test(reason) ? "retake" : "off_script",
        label: reason || t("yt_offscript_extra"),
        spoken: "",
        status: "open",
      });
    });
    return issues.filter(function (x) {
      return isFinite(x.start) && isFinite(x.end) && x.end - x.start >= 0.25;
    });
  }

  function issueLabel(issue) {
    if (!issue) return t("yt_offscript_extra");
    if (issue.kind === "before_script") return t("yt_offscript_before");
    if (issue.kind === "retake") return issue.label || t("yt_offscript_retake");
    return issue.label || t("yt_offscript_extra");
  }

  function issueKey(issue) {
    return Number(issue.start).toFixed(1) + "-" + Number(issue.end).toFixed(1);
  }

  function formatFixElapsed(ms) {
    var s = Math.max(0, Math.floor(Number(ms) / 1000));
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function anyFixWorking() {
    return Object.keys(state.fixJobs || {}).some(function (key) {
      return state.fixJobs[key] && state.fixJobs[key].status === "working";
    });
  }

  function startFixTicker() {
    if (state.fixTicker) return;
    state.fixTicker = window.setInterval(function () {
      var any = false;
      Object.keys(state.fixJobs || {}).forEach(function (key) {
        var job = state.fixJobs[key];
        if (!job || job.status !== "working") return;
        any = true;
        var el = document.querySelector('[data-yt-fix-timer="' + key + '"]');
        if (el) el.textContent = formatFixElapsed(Date.now() - job.startedAt);
      });
      if (!any) {
        window.clearInterval(state.fixTicker);
        state.fixTicker = 0;
      }
    }, 250);
  }

  function markFixDone(key, item) {
    var job = state.fixJobs[key];
    if (!job) return;
    var recChanged =
      item && item.recording_path && item.recording_path !== (state.item && state.item.recording_path);
    if (item) {
      if (recChanged) {
        closeFloatPlayer();
        state.playUrl = "";
        state.playSlug = "";
        state.playPath = "";
      }
      state.item = item;
    }
    if (job.status === "done") {
      if (recChanged) render();
      return;
    }
    job.status = "done";
    job.finishedAt = Date.now();
    render();
    window.setTimeout(function () {
      if (state.fixJobs[key] && state.fixJobs[key].status === "done") {
        delete state.fixJobs[key];
        render();
      }
    }, 4500);
  }

  function startFixPoll() {
    if (state.fixPoll) return;
    state.fixPoll = window.setInterval(function () {
      if (!anyFixWorking()) {
        window.clearInterval(state.fixPoll);
        state.fixPoll = 0;
        return;
      }
      api("/api/staff/youtube-scripts?slug=" + encodeURIComponent(state.slug), null, { method: "GET" })
        .then(function (data) {
          var fresh = data && data.slug ? data : data && data.item;
          if (!fresh) return;
          var still = {};
          offScriptIssues(fresh).forEach(function (iss) {
            still[issueKey(iss)] = iss;
          });
          Object.keys(state.fixJobs).forEach(function (key) {
            var job = state.fixJobs[key];
            if (!job || job.status !== "working") return;
            var iss = still[key];
            if (!iss || iss.status === "fixed") markFixDone(key, fresh);
          });
        })
        .catch(function () {});
    }, 2000);
  }

  function ensureFixJobsFromItem(item) {
    if (!state.fixJobs) state.fixJobs = {};
    offScriptIssues(item).forEach(function (iss) {
      if (iss.status !== "requested" && iss.status !== "working") return;
      var key = issueKey(iss);
      if (state.fixJobs[key]) return;
      var started = Date.parse(iss.requested_at);
      if (!isFinite(started)) started = Date.now();
      state.fixJobs[key] = {
        start: iss.start,
        end: iss.end,
        kind: iss.kind,
        label: issueLabel(iss),
        spoken: iss.spoken || "",
        status: "working",
        startedAt: started,
      };
    });
    if (anyFixWorking()) {
      startFixTicker();
      startFixPoll();
    }
  }

  function issuesForView(item) {
    var issues = offScriptIssues(item).slice();
    Object.keys(state.fixJobs || {}).forEach(function (key) {
      var job = state.fixJobs[key];
      if (!job || (job.status !== "working" && job.status !== "done")) return;
      var found = issues.some(function (iss) {
        return issueKey(iss) === key;
      });
      if (!found) {
        issues.push({
          start: job.start,
          end: job.end,
          kind: job.kind,
          label: job.label,
          spoken: job.spoken || "",
          status: job.status === "done" ? "fixed" : "requested",
        });
      }
    });
    return issues;
  }

  function fixActionHtml(issue) {
    var key = issueKey(issue);
    var job = state.fixJobs[key];
    if (job && job.status === "done") {
      return (
        '<div class="crm-yt-fix-progress is-done" data-yt-fix-key="' +
        esc(key) +
        '">' +
        esc(t("yt_fix_complete_time", { time: formatFixElapsed(job.finishedAt - job.startedAt) })) +
        "</div>"
      );
    }
    if ((job && job.status === "working") || issue.status === "requested") {
      var started = job ? job.startedAt : Date.now();
      return (
        '<div class="crm-yt-fix-progress is-working" data-yt-fix-key="' +
        esc(key) +
        '" role="status">' +
        '<span class="crm-yt-fix-pulse" aria-hidden="true"></span>' +
        '<span class="crm-yt-fix-status">' +
        esc(t("yt_fix_working_label")) +
        "</span>" +
        '<span class="crm-yt-fix-timer" data-yt-fix-timer="' +
        esc(key) +
        '">' +
        esc(formatFixElapsed(Date.now() - started)) +
        "</span>" +
        "</div>"
      );
    }
    var busy = anyFixWorking();
    return (
      '<button type="button" class="crm-btn crm-yt-fix-btn" data-yt-fix-start="' +
      esc(String(issue.start)) +
      '" data-yt-fix-end="' +
      esc(String(issue.end)) +
      '" data-yt-fix-kind="' +
      esc(issue.kind || "off_script") +
      '" data-yt-fix-reason="' +
      esc(issueLabel(issue)) +
      '"' +
      (busy ? " disabled" : "") +
      ">" +
      esc(t("yt_fix_remotion")) +
      "</button>"
    );
  }

  function issuesHtml(item) {
    ensureFixJobsFromItem(item);
    var issues = issuesForView(item);
    if (!issues.length) return "";
    return (
      '<section class="crm-yt-issues">' +
      "<h3>" +
      esc(t("yt_offscript_title")) +
      "</h3>" +
      issues
        .map(function (issue, i) {
          var times = tsRange(issue.start, issue.end);
          var job = state.fixJobs[issueKey(issue)];
          var rowClass =
            job && job.status === "done" ? " is-done" : job && job.status === "working" ? " is-working" : "";
          return (
            '<div class="crm-yt-issue' +
            rowClass +
            '" data-yt-issue-start="' +
            esc(String(issue.start)) +
            '" data-yt-issue-end="' +
            esc(String(issue.end)) +
            '">' +
            '<span class="crm-yt-issue-num">' +
            esc(String(i + 1)) +
            "</span>" +
            '<div class="crm-yt-issue-body">' +
            '<p class="crm-yt-issue-time">' +
            esc(times) +
            "</p>" +
            "<p>" +
            esc(issueLabel(issue)) +
            (issue.spoken ? " — " + esc(issue.spoken) : "") +
            "</p>" +
            "</div>" +
            fixActionHtml(issue) +
            "</div>"
          );
        })
        .join("") +
      "</section>"
    );
  }

  function playerHtml(item) {
    if (!item || !item.recording_path) return "";
    return (
      '<div class="crm-yt-player-launch">' +
      '<button type="button" class="crm-btn" id="crm-yt-play-open">' +
      esc(t("yt_play_open")) +
      "</button>" +
      '<p class="crm-yt-hint">' +
      esc(t("yt_play_hint")) +
      "</p>" +
      "</div>"
    );
  }

  function closeFloatPlayer() {
    var media = document.getElementById("crm-yt-media");
    if (media) {
      try {
        media.pause();
      } catch (e) {}
    }
    var box = document.getElementById("crm-yt-float");
    if (box) box.remove();
    state.playOpen = false;
    state.playUntil = null;
    state.playRow = -1;
    document.querySelectorAll(".crm-yt-align-row.is-playing").forEach(function (el) {
      el.classList.remove("is-playing");
    });
  }

  function floatPlayerHtml() {
    var mime = state.playMime || (state.item && state.item.recording_mime) || "video/mp4";
    var isVideo = mime.indexOf("audio/") !== 0;
    var src = state.playUrl || "";
    var tag = isVideo ? "video" : "audio";
    return (
      '<div class="crm-yt-float-head">' +
      "<span>" +
      esc(t("yt_play_open")) +
      "</span>" +
      '<button type="button" class="crm-yt-float-close" id="crm-yt-float-close">' +
      esc(t("yt_play_close")) +
      "</button>" +
      "</div><" +
      tag +
      ' id="crm-yt-media" class="crm-yt-float-media" controls playsinline' +
      (src ? ' src="' + esc(src) + '"' : "") +
      "></" +
      tag +
      ">"
    );
  }

  function bindFloatMedia() {
    var close = document.getElementById("crm-yt-float-close");
    if (close) close.addEventListener("click", closeFloatPlayer);
    var media = document.getElementById("crm-yt-media");
    if (media) {
      media.addEventListener("timeupdate", highlightPlaying);
      media.addEventListener("play", highlightPlaying);
      media.addEventListener("seeked", highlightPlaying);
    }
  }

  function openFloatPlayer() {
    if (!state.item || !state.item.recording_path) return;
    if (state.playOpen && document.getElementById("crm-yt-media")) {
      var existing = document.getElementById("crm-yt-media");
      existing.currentTime = 0;
      var replay = existing.play();
      if (replay && replay.catch) replay.catch(function () {});
      return;
    }
    state.playOpen = true;
    state.playUntil = null;
    ensurePlayUrl()
      .then(function () {
        if (!state.playOpen) return;
        var box = document.getElementById("crm-yt-float");
        if (!box) {
          box = document.createElement("div");
          box.id = "crm-yt-float";
          box.className = "crm-yt-float";
          document.body.appendChild(box);
        }
        box.innerHTML = floatPlayerHtml();
        bindFloatMedia();
        var media = document.getElementById("crm-yt-media");
        if (media) {
          media.currentTime = 0;
          var play = media.play();
          if (play && play.catch) play.catch(function () {});
        }
      })
      .catch(showErr);
  }

  function highlightPlaying() {
    var media = document.getElementById("crm-yt-media");
    if (!media) return;
    var t = media.currentTime;
    if (state.playUntil != null && t >= state.playUntil - 0.04) {
      media.pause();
      media.currentTime = state.playUntil;
      state.playUntil = null;
      t = media.currentTime;
    }
    var rows = document.querySelectorAll(".crm-yt-align-row[data-yt-start]");
    var current = null;
    var currentIdx = -1;
    rows.forEach(function (el, i) {
      var start = Number(el.getAttribute("data-yt-start"));
      var endRaw = el.getAttribute("data-yt-end");
      var end = endRaw !== "" && endRaw != null ? Number(endRaw) : NaN;
      var next = rows[i + 1];
      var stop =
        Number.isFinite(end) && end > start
          ? end
          : next
            ? Number(next.getAttribute("data-yt-start"))
            : Number.isFinite(media.duration)
              ? media.duration
              : start + 999;
      var on = Number.isFinite(start) && t >= start - 0.08 && t < stop;
      el.classList.toggle("is-playing", on);
      if (on) {
        current = el;
        currentIdx = i;
      }
    });
    if (current && !media.paused && currentIdx !== state.playRow) {
      state.playRow = currentIdx;
      var pane = document.querySelector(".crm-yt-pane--review");
      if (pane) {
        var r = current.getBoundingClientRect();
        var p = pane.getBoundingClientRect();
        if (r.top < p.top + 90 || r.bottom > p.bottom - 16) {
          current.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    }
    if (media.paused) state.playRow = -1;
  }

  function ensurePlayUrl() {
    if (!state.item || !state.item.recording_path) return Promise.resolve();
    if (state.playSlug === state.slug && state.playPath === state.item.recording_path && state.playUrl) {
      return Promise.resolve();
    }
    return api("/api/staff/youtube-scripts", { action: "play-url", slug: state.slug }).then(function (data) {
      state.playUrl = data.url || "";
      state.playMime = data.mime || "";
      state.playSlug = state.slug;
      state.playPath = state.item.recording_path || "";
    });
  }

  function bindPlayer() {
    var openBtn = document.getElementById("crm-yt-play-open");
    if (openBtn) {
      openBtn.addEventListener("click", openFloatPlayer);
    }
    document.querySelectorAll(".crm-yt-align-row[data-yt-start]").forEach(function (el) {
      function jump() {
        if (!state.playOpen) return;
        var media = document.getElementById("crm-yt-media");
        if (!media) return;
        var start = Number(el.getAttribute("data-yt-start"));
        var end = Number(el.getAttribute("data-yt-end"));
        if (!isFinite(start)) return;
        state.playUntil = isFinite(end) && end > start ? end : null;
        media.currentTime = Math.max(0, start - 0.12);
        media.play();
      }
      el.addEventListener("click", jump);
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          jump();
        }
      });
    });
    document.querySelectorAll(".crm-yt-issue").forEach(function (el) {
      el.addEventListener("click", function (e) {
        if (e.target && e.target.closest(".crm-yt-fix-btn, .crm-yt-fix-progress")) return;
        if (!state.playOpen) return;
        var media = document.getElementById("crm-yt-media");
        var start = Number(el.getAttribute("data-yt-issue-start"));
        if (!media || !isFinite(start)) return;
        media.currentTime = start;
        media.play();
      });
    });
    document.querySelectorAll(".crm-yt-fix-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (btn.disabled) return;
        var start = Number(btn.getAttribute("data-yt-fix-start"));
        var end = Number(btn.getAttribute("data-yt-fix-end"));
        var kind = btn.getAttribute("data-yt-fix-kind") || "off_script";
        var reason = btn.getAttribute("data-yt-fix-reason") || "";
        var key = issueKey({ start: start, end: end });
        state.fixJobs[key] = {
          start: start,
          end: end,
          kind: kind,
          label: reason,
          spoken: "",
          status: "working",
          startedAt: Date.now(),
        };
        render();
        startFixTicker();
        startFixPoll();
        api("/api/staff/youtube-scripts", {
          action: "request-fix",
          slug: state.slug,
          start: start,
          end: end,
          kind: kind,
          reason: reason,
        })
          .then(function (data) {
            if (data.applied) {
              markFixDone(key, data.item);
              return;
            }
            if (data.item) state.item = data.item;
            render();
            startFixTicker();
            startFixPoll();
          })
          .catch(function (err) {
            if (state.fixJobs[key]) delete state.fixJobs[key];
            showErr(err);
            render();
          });
      });
    });
  }

  function alignRowHtml(row, index) {
    var spoken = String((row && row.spoken) || "").trim();
    var script = String((row && row.script) || "").trim();
    var times = tsRange(row && row.start, row && row.end);
    var pairs = alignWords(script, spoken);
    var off = pairs.some(function (p) {
      return !p.match;
    });
    var num = String((index || 0) + 1);
    var start =
      row && row.start != null && row.start !== "" && isFinite(Number(row.start)) ? Number(row.start) : "";
    var end = row && row.end != null && row.end !== "" && isFinite(Number(row.end)) ? Number(row.end) : "";
    return (
      '<article class="crm-yt-align-row' +
      (off ? " is-off" : "") +
      '"' +
      (start !== ""
        ? ' data-yt-start="' +
          start +
          '" data-yt-end="' +
          end +
          '" role="button" tabindex="0"'
        : "") +
      ">" +
      '<span class="crm-yt-align-num">' +
      esc(num) +
      "</span>" +
      '<div class="crm-yt-words">' +
      pairs.map(wordCellHtml).join("") +
      "</div>" +
      (times ? '<span class="crm-yt-ts">' + esc(times) + "</span>" : "") +
      "</article>"
    );
  }

  function reviewPane(item) {
    var plan = item.cut_plan || {};
    var rows = alignmentRows(item);
    var cuts = Array.isArray(plan.cut) ? plan.cut : [];
    var keeps = Array.isArray(plan.keep) ? plan.keep : [];
    var cutHtml = cuts.length
      ? "<ul>" +
        cuts
          .map(function (c) {
            return (
              "<li>" +
              esc(tsRange(c.start, c.end) || String(c.start) + "–" + String(c.end)) +
              " · " +
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
              esc(tsRange(c.start, c.end) || String(c.start) + "–" + String(c.end)) +
              " · " +
              esc(c.note || "") +
              "</li>"
            );
          })
          .join("") +
        "</ul>"
      : "";
    var yt = item.youtube_id
      ? "<p>" +
        esc(t("yt_published")) +
        ' <a href="https://www.youtube.com/watch?v=' +
        esc(item.youtube_id) +
        '" target="_blank" rel="noopener">' +
        esc(item.youtube_id) +
        "</a></p>"
      : '<p class="crm-yt-hint">' + esc(t("yt_publish_hint")) + "</p>";
    var alignHtml = rows.length
      ? '<div class="crm-yt-align">' + rows.map(alignRowHtml).join("") + "</div>"
      : '<p class="crm-yt-hint">' + esc(t("yt_review_empty")) + "</p>";
    return (
      playerHtml(item) +
      issuesHtml(item) +
      (plan.summary && !/^one sentence$/i.test(String(plan.summary).trim())
        ? '<p class="crm-yt-lead"><strong>' + esc(plan.summary) + "</strong></p>"
        : "") +
      alignHtml +
      '<details class="crm-yt-timeline">' +
      "<summary>" +
      esc(t("yt_cut_list")) +
      " / " +
      esc(t("yt_keep_list")) +
      "</summary>" +
      "<h3>" +
      esc(t("yt_cut_list")) +
      "</h3>" +
      cutHtml +
      "<h3>" +
      esc(t("yt_keep_list")) +
      "</h3>" +
      keepHtml +
      "</details>" +
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
      (state.tab === "review" && item ? " crm-yt-pane--review" : "") +
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
    var pathChanged = state.playPath && state.playPath !== (data.recording_path || "");
    if (state.playSlug !== slug || pathChanged) {
      closeFloatPlayer();
      state.playUrl = "";
      state.playMime = "";
      state.playSlug = "";
      state.playPath = "";
      state.playRow = -1;
    }
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
        (async function () {
          var holding = file;
          if (file.size > HOLDING_MAX_BYTES) {
            if (status) status.textContent = t("yt_compressing", { pct: "0" });
            try {
              holding = await compressForHolding(file, function (pct) {
                if (status) {
                  status.textContent = t("yt_compressing", {
                    pct: String(Math.min(99, Math.round(pct * 100))),
                  });
                }
              });
            } catch (e) {
              throw new Error(t("yt_compress_failed"));
            }
            if (!holding || !holding.size) throw new Error(t("yt_compress_failed"));
          }
          var ext = (holding.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
          var mime =
            holding.type && (holding.type.indexOf("video/") === 0 || holding.type.indexOf("audio/") === 0)
              ? holding.type
              : ext === "webm"
                ? "video/webm"
                : ext === "mov"
                  ? "video/quicktime"
                  : "video/mp4";
          var audioFile = null;
          if (holding.size > WHISPER_MAX_BYTES && holding.size <= 80 * 1024 * 1024) {
            if (status) status.textContent = t("yt_reading_audio");
            try {
              audioFile = await extractAnalysisAudio(holding);
              if (!audioFile || audioFile.size > WHISPER_MAX_BYTES) audioFile = null;
            } catch (e2) {
              audioFile = null;
            }
          }
          if (status) status.textContent = t("yt_uploading");
          var up = await api("/api/staff/youtube-scripts", {
            action: "upload-url",
            slug: state.slug,
            ext: ext,
          });
          await putFile(up.signedUrl, holding, mime, function (pct) {
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
          if (!audioFile && holding.size > WHISPER_MAX_BYTES) {
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
        })
          .then(function (data) {
            state.item = data.item;
            render();
          })
          .catch(showErr);
      });
    }
    bindPlayer();
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
    closeFloatPlayer();
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
