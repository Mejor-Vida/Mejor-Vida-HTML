/**
 * CRM MVI Mailbox — scanned virtual-mailbox PDFs, sorted by date, search by name.
 */
(function () {
  "use strict";

  var items = [];
  var searchQ = "";
  var statusMsg = "";
  var selectedId = "";
  var viewerUrl = "";
  var searchTimer = null;

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  function api(path, body, opts) {
    if (!window.StaffCrm || !window.StaffCrm.authedApi) throw new Error("StaffCrm not ready");
    return window.StaffCrm.authedApi(path, body, opts);
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
    if (isNaN(d.getTime())) return "—";
    var lang = window.StaffCrmI18n ? window.StaffCrmI18n.getLang() : "en";
    return d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function fmtSize(bytes) {
    var n = Number(bytes) || 0;
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + " KB";
    return (n / (1024 * 1024)).toFixed(1) + " MB";
  }

  function setStatus(msg) {
    statusMsg = msg || "";
    var el = document.getElementById("crm-mail-status");
    if (el) el.textContent = statusMsg;
  }

  function revokeViewer() {
    if (viewerUrl) {
      URL.revokeObjectURL(viewerUrl);
      viewerUrl = "";
    }
  }

  function payloadToBlob(payload) {
    var bin = atob(payload.data_base64 || "");
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var contentType = payload.content_type || "application/pdf";
    var blob = new Blob([bytes], { type: contentType });
    return {
      blob: blob,
      url: URL.createObjectURL(blob),
      filename: payload.filename || "mail.pdf",
      contentType: contentType,
    };
  }

  async function loadItems() {
    var path = "/api/staff/mailbox";
    if (searchQ) path += "?q=" + encodeURIComponent(searchQ);
    var data = await api(path, null, { method: "GET" });
    items = Array.isArray(data.items) ? data.items : [];
  }

  function selectedItem() {
    return items.find(function (it) {
      return String(it.id) === String(selectedId);
    });
  }

  function renderList() {
    if (!items.length) {
      return (
        '<div class="crm-mail-empty">' +
        esc(searchQ ? t("mailbox_empty_search") : t("mailbox_empty")) +
        "</div>"
      );
    }
    return (
      '<ul class="crm-mail-list" role="listbox">' +
      items
        .map(function (it) {
          var active = String(it.id) === String(selectedId) ? " active" : "";
          return (
            '<li class="crm-mail-row' +
            active +
            '" role="option" data-mail-id="' +
            esc(it.id) +
            '" tabindex="0">' +
            '<div class="crm-mail-row-main">' +
            '<div class="crm-mail-row-title">' +
            esc(it.title || it.from_name || "—") +
            "</div>" +
            '<div class="crm-mail-row-meta">' +
            esc(fmtDate(it.received_on)) +
            " · " +
            esc(fmtSize(it.file_size_bytes)) +
            "</div>" +
            "</div></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function renderDetail() {
    var it = selectedItem();
    if (!it) {
      return (
        '<div class="crm-mail-detail-empty">' +
        esc(t("mailbox_select_prompt")) +
        "</div>"
      );
    }
    return (
      '<div class="crm-mail-detail">' +
      '<div class="crm-mail-detail-head">' +
      '<label class="crm-mail-field"><span>' +
      esc(t("mailbox_from_label")) +
      '</span><input type="text" id="crm-mail-edit-title" value="' +
      esc(it.title || "") +
      '" /></label>' +
      '<label class="crm-mail-field"><span>' +
      esc(t("mailbox_date_label")) +
      '</span><input type="date" id="crm-mail-edit-date" value="' +
      esc((it.received_on || "").slice(0, 10)) +
      '" /></label>' +
      '<label class="crm-mail-field crm-mail-field-wide"><span>' +
      esc(t("mailbox_notes_label")) +
      '</span><textarea id="crm-mail-edit-notes" rows="2">' +
      esc(it.notes || "") +
      "</textarea></label>" +
      '<div class="crm-mail-detail-actions">' +
      '<button type="button" class="crm-btn" id="crm-mail-save-btn">' +
      esc(t("mailbox_save")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-mail-open-btn">' +
      esc(t("mailbox_open")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-mail-download-btn">' +
      esc(t("mailbox_download")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary crm-mail-danger" id="crm-mail-delete-btn">' +
      esc(t("mailbox_delete")) +
      "</button>" +
      "</div></div>" +
      '<div class="crm-mail-viewer-wrap" id="crm-mail-viewer-wrap">' +
      '<p class="crm-mail-viewer-hint">' +
      esc(t("mailbox_viewer_hint")) +
      "</p></div></div>"
    );
  }

  function renderShell(main) {
    main.innerHTML =
      '<div class="crm-mail-shell">' +
      '<h1 class="crm-mail-page-title">' +
      esc(t("mailbox_title")) +
      "</h1>" +
      '<p class="crm-mail-page-sub">' +
      esc(t("mailbox_sub")) +
      "</p>" +
      '<div class="crm-mail-toolbar">' +
      '<input type="search" id="crm-mail-search" class="crm-mail-search" placeholder="' +
      esc(t("mailbox_search_placeholder")) +
      '" value="' +
      esc(searchQ) +
      '" />' +
      '<label class="crm-btn secondary crm-mail-upload-label">' +
      esc(t("mailbox_upload")) +
      '<input type="file" id="crm-mail-upload" accept="application/pdf,image/*" hidden />' +
      "</label>" +
      "</div>" +
      '<p class="crm-mail-status" id="crm-mail-status">' +
      esc(statusMsg) +
      "</p>" +
      '<div class="crm-mail-layout">' +
      '<div class="crm-mail-list-pane" id="crm-mail-list-pane">' +
      renderList() +
      '</div><div class="crm-mail-detail-pane" id="crm-mail-detail-pane">' +
      renderDetail() +
      "</div></div></div>";
  }

  function bindList(main) {
    main.querySelectorAll("[data-mail-id]").forEach(function (row) {
      row.addEventListener("click", function () {
        selectedId = row.getAttribute("data-mail-id");
        revokeViewer();
        paint(main);
      });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectedId = row.getAttribute("data-mail-id");
          revokeViewer();
          paint(main);
        }
      });
    });
  }

  async function openSelected(downloadOnly) {
    if (!selectedId) return;
    setStatus(t("mailbox_loading"));
    try {
      var payload = await api(
        "/api/staff/mailbox?download=" + encodeURIComponent(selectedId),
        null,
        { method: "GET" }
      );
      var file = payloadToBlob(payload);
      if (downloadOnly) {
        var a = document.createElement("a");
        a.href = file.url;
        a.download = file.filename;
        a.click();
        URL.revokeObjectURL(file.url);
        setStatus("");
        return;
      }
      revokeViewer();
      viewerUrl = file.url;
      var wrap = document.getElementById("crm-mail-viewer-wrap");
      if (wrap) {
        if (/^application\/pdf$/i.test(file.contentType)) {
          wrap.innerHTML =
            '<iframe class="crm-mail-viewer" title="' +
            esc(t("mailbox_title")) +
            '" src="' +
            esc(file.url) +
            '"></iframe>';
        } else if (/^image\//i.test(file.contentType)) {
          wrap.innerHTML =
            '<img class="crm-mail-viewer-img" alt="" src="' + esc(file.url) + '" />';
        } else {
          wrap.innerHTML =
            '<p class="crm-mail-viewer-hint">' +
            esc(t("mailbox_viewer_unsupported")) +
            "</p>";
        }
      }
      setStatus("");
    } catch (e) {
      setStatus((e && e.message) || t("load_error"));
    }
  }

  function bindDetail(main) {
    var saveBtn = document.getElementById("crm-mail-save-btn");
    if (saveBtn) {
      saveBtn.addEventListener("click", async function () {
        var titleEl = document.getElementById("crm-mail-edit-title");
        var dateEl = document.getElementById("crm-mail-edit-date");
        var notesEl = document.getElementById("crm-mail-edit-notes");
        var title = titleEl ? titleEl.value.trim() : "";
        if (!title) {
          setStatus(t("mailbox_title_required"));
          return;
        }
        setStatus(t("mailbox_saving"));
        try {
          await api(
            "/api/staff/mailbox?id=" + encodeURIComponent(selectedId),
            {
              title: title,
              from_name: title,
              received_on: dateEl ? dateEl.value : undefined,
              notes: notesEl ? notesEl.value : undefined,
            },
            { method: "PATCH" }
          );
          await loadItems();
          paint(main);
          setStatus(t("mailbox_saved"));
        } catch (e) {
          setStatus((e && e.message) || t("load_error"));
        }
      });
    }
    var openBtn = document.getElementById("crm-mail-open-btn");
    if (openBtn) openBtn.addEventListener("click", function () {
      openSelected(false);
    });
    var dlBtn = document.getElementById("crm-mail-download-btn");
    if (dlBtn) dlBtn.addEventListener("click", function () {
      openSelected(true);
    });
    var delBtn = document.getElementById("crm-mail-delete-btn");
    if (delBtn) {
      delBtn.addEventListener("click", async function () {
        if (!window.confirm(t("mailbox_delete_confirm"))) return;
        setStatus(t("mailbox_deleting"));
        try {
          await api("/api/staff/mailbox?id=" + encodeURIComponent(selectedId), null, {
            method: "DELETE",
          });
          selectedId = "";
          revokeViewer();
          await loadItems();
          paint(main);
          setStatus(t("mailbox_deleted"));
        } catch (e) {
          setStatus((e && e.message) || t("load_error"));
        }
      });
    }
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result || "");
        var i = result.indexOf(",");
        resolve(i >= 0 ? result.slice(i + 1) : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function bindToolbar(main) {
    var search = document.getElementById("crm-mail-search");
    if (search) {
      search.addEventListener("input", function () {
        searchQ = search.value.trim();
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(async function () {
          try {
            await loadItems();
            paint(main);
          } catch (e) {
            setStatus((e && e.message) || t("load_error"));
          }
        }, 250);
      });
    }
    var upload = document.getElementById("crm-mail-upload");
    if (upload) {
      upload.addEventListener("change", async function () {
        var file = upload.files && upload.files[0];
        upload.value = "";
        if (!file) return;
        var from = window.prompt(t("mailbox_upload_from_prompt"), "");
        if (from == null) return;
        from = String(from).trim();
        if (!from) {
          setStatus(t("mailbox_title_required"));
          return;
        }
        setStatus(t("mailbox_uploading"));
        try {
          var b64 = await fileToBase64(file);
          var today = new Date().toISOString().slice(0, 10);
          var res = await api(
            "/api/staff/mailbox",
            {
              title: from,
              from_name: from,
              filename: file.name,
              content_type: file.type || "application/pdf",
              data_base64: b64,
              received_on: today,
            },
            { method: "POST" }
          );
          await loadItems();
          if (res && res.item && res.item.id) selectedId = res.item.id;
          paint(main);
          setStatus(t("mailbox_upload_done"));
        } catch (e) {
          setStatus((e && e.message) || t("load_error"));
        }
      });
    }
  }

  function paint(main) {
    renderShell(main);
    bindToolbar(main);
    bindList(main);
    bindDetail(main);
  }

  async function mount(main) {
    statusMsg = "";
    revokeViewer();
    main.innerHTML =
      '<div class="crm-mail-shell"><p class="crm-mail-status">' +
      esc(t("mailbox_loading")) +
      "</p></div>";
    try {
      await loadItems();
      if (selectedId && !selectedItem()) selectedId = "";
      paint(main);
    } catch (e) {
      main.innerHTML =
        '<div class="crm-placeholder"><strong>' +
        esc(t("load_error")) +
        "</strong><p>" +
        esc((e && e.message) || "") +
        "</p></div>";
    }
  }

  window.StaffCrmMailbox = {
    mount: mount,
  };
})();
