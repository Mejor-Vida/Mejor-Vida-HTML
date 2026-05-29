(function () {
  "use strict";

  var TOKEN = new URLSearchParams(window.location.search).get("t") || "";
  var state = {
    healthInfo: {
      gender: "",
      birthdate: "",
      heightFt: null,
      heightIn: null,
      weightLbs: null,
      tobaccoUse: false,
    },
    providers: [],
    prescriptions: [],
    pharmacies: [],
    conditions: [],
  };

  var FREQUENCIES = [
    "per month",
    "per two months",
    "per three months",
    "per six months",
    "per year",
  ];
  var DISTANCES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  function $(id) {
    return document.getElementById(id);
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(null, args);
      }, ms);
    };
  }

  function api(path, opts) {
    var url = path + (path.indexOf("?") >= 0 ? "&" : "?") + "t=" + encodeURIComponent(TOKEN);
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || j.ok === false) throw new Error(j.error || "request_failed");
        return j;
      });
    });
  }

  function calcAge(dob) {
    if (!dob) return "—";
    var d = new Date(dob);
    if (isNaN(d.getTime())) return "—";
    var t = new Date();
    var a = t.getFullYear() - d.getFullYear();
    var m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
    return String(a);
  }

  function updateAgeDisplay() {
    var el = $("mi-age-display");
    if (el) el.textContent = calcAge(state.healthInfo.birthdate);
  }

  function renderLists() {
    renderList("providers", state.providers, function (p) {
      return (p.name || "Provider") + (p.specialty ? " — " + p.specialty : "") + (p.npi ? " (NPI " + p.npi + ")" : "");
    });
    renderList("prescriptions", state.prescriptions, function (p) {
      return (p.drugName || "") + " — " + (p.dosage || "") + ", qty " + (p.quantity || "") + ", " + (p.frequency || "");
    });
    renderList("pharmacies", state.pharmacies, function (p) {
      return (p.name || "Pharmacy") + " — " + [p.address_line, p.city, p.state, p.zip].filter(Boolean).join(", ");
    });
    renderList("conditions", state.conditions, function (c) {
      return (c.name || "") + (c.icd10_code ? " (" + c.icd10_code + ")" : "");
    });
    ["providers", "prescriptions", "pharmacies", "conditions"].forEach(function (k) {
      var cnt = $("mi-count-" + k);
      if (cnt) cnt.textContent = "(" + state[k].length + ")";
    });
  }

  function renderList(key, items, labelFn) {
    var list = $("mi-list-" + key);
    var empty = $("mi-empty-" + key);
    if (!list) return;
    if (!items.length) {
      list.innerHTML = "";
      if (empty) empty.classList.remove("mi-hidden");
      return;
    }
    if (empty) empty.classList.add("mi-hidden");
    list.innerHTML = items
      .map(function (item, idx) {
        return (
          '<div class="mi-list-item"><span>' +
          escapeHtml(labelFn(item)) +
          '</span><button type="button" class="mi-remove" data-key="' +
          key +
          '" data-idx="' +
          idx +
          '">Remove</button></div>'
        );
      })
      .join("");
    list.querySelectorAll(".mi-remove").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.getAttribute("data-key");
        var i = parseInt(btn.getAttribute("data-idx"), 10);
        state[k].splice(i, 1);
        renderLists();
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openModal(id) {
    var m = $(id);
    if (m) m.classList.add("show");
  }
  function closeModal(id) {
    var m = $(id);
    if (m) m.classList.remove("show");
  }

  function wireSections() {
    document.querySelectorAll(".mi-section-head").forEach(function (head) {
      head.addEventListener("click", function (e) {
        if (e.target.closest(".mi-add-btn")) return;
        head.parentElement.classList.toggle("open");
      });
    });
    document.querySelectorAll(".mi-add-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var modal = btn.getAttribute("data-modal");
        if (modal) openModal(modal);
      });
    });
    document.querySelectorAll(".mi-modal-close, .mi-modal-cancel").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeModal(btn.getAttribute("data-close"));
      });
    });
  }

  function wireHealthInfo() {
    document.querySelectorAll("[data-gender]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.healthInfo.gender = btn.getAttribute("data-gender");
        document.querySelectorAll("[data-gender]").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
      });
    });
    document.querySelectorAll("[data-tobacco]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.healthInfo.tobaccoUse = btn.getAttribute("data-tobacco") === "yes";
        document.querySelectorAll("[data-tobacco]").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
      });
    });
    var dob = $("mi-birthdate");
    if (dob) {
      dob.addEventListener("change", function () {
        state.healthInfo.birthdate = dob.value;
        updateAgeDisplay();
      });
    }
    ["mi-height-ft", "mi-height-in", "mi-weight"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("input", function () {
        if (id === "mi-height-ft") state.healthInfo.heightFt = parseInt(el.value, 10) || null;
        else if (id === "mi-height-in") state.healthInfo.heightIn = parseInt(el.value, 10) || null;
        else state.healthInfo.weightLbs = parseInt(el.value, 10) || null;
      });
    });
  }

  function fillDistanceSelect(sel) {
    if (!sel) return;
    sel.innerHTML = DISTANCES.map(function (d) {
      return '<option value="' + d + '">' + d + " miles</option>";
    }).join("");
  }

  function wireDrugModal() {
    var step = 1;
    var selected = null;
    var searchIn = $("mi-drug-search");
    var results = $("mi-drug-results");
    var step1 = $("mi-drug-step1");
    var step2 = $("mi-drug-step2");
    var dosageSel = $("mi-drug-dosage");
    var qtyIn = $("mi-drug-qty");
    var freqSel = $("mi-drug-frequency");

    if (freqSel) {
      freqSel.innerHTML = FREQUENCIES.map(function (f) {
        return '<option value="' + f + '">' + f + "</option>";
      }).join("");
    }

    function reset() {
      step = 1;
      selected = null;
      if (searchIn) searchIn.value = "";
      if (results) results.innerHTML = "";
      if (step1) step1.classList.remove("mi-hidden");
      if (step2) step2.classList.add("mi-hidden");
    }

    var doSearch = debounce(function () {
      var q = (searchIn && searchIn.value.trim()) || "";
      if (q.length < 2) {
        if (results) results.innerHTML = "";
        return;
      }
      api("/api/medical-intake/search?type=drugs&q=" + encodeURIComponent(q))
        .then(function (data) {
          if (!results) return;
          results.innerHTML = (data.items || [])
            .map(function (d) {
              return (
                '<button type="button" data-name="' +
                escapeHtml(d.name) +
                '" data-rxcui="' +
                escapeHtml(d.rxcui || "") +
                '" data-type="' +
                escapeHtml(d.drug_type || "") +
                '">' +
                escapeHtml(d.name) +
                (d.drug_type ? '<span class="mi-badge">' + escapeHtml(d.drug_type) + "</span>" : "") +
                "</button>"
              );
            })
            .join("");
          results.querySelectorAll("button").forEach(function (btn) {
            btn.addEventListener("click", function () {
              selected = {
                name: btn.getAttribute("data-name"),
                rxcui: btn.getAttribute("data-rxcui") || "",
                drug_type: btn.getAttribute("data-type") || "",
              };
              $("mi-drug-selected-label").textContent = selected.name + (selected.drug_type ? " (" + selected.drug_type + ")" : "");
              step = 2;
              if (step1) step1.classList.add("mi-hidden");
              if (step2) step2.classList.remove("mi-hidden");
              api(
                "/api/medical-intake/search?type=drug-dosages&rxcui=" +
                  encodeURIComponent(selected.rxcui) +
                  "&name=" +
                  encodeURIComponent(selected.name)
              ).then(function (dd) {
                if (!dosageSel) return;
                dosageSel.innerHTML = (dd.items || [])
                  .map(function (x) {
                    return '<option value="' + escapeHtml(x.dosage_label) + '">' + escapeHtml(x.dosage_label) + "</option>";
                  })
                  .join("");
                if (dd.items && dd.items[0] && qtyIn) qtyIn.value = dd.items[0].default_quantity || 30;
              });
            });
          });
        })
        .catch(function () {
          if (results) results.innerHTML = '<p class="mi-error">Search unavailable. Try again.</p>';
        });
    }, 400);

    if (searchIn) searchIn.addEventListener("input", doSearch);
    var addBtn = $("mi-drug-add");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (!selected || !dosageSel) return;
        state.prescriptions.push({
          drugName: selected.name,
          rxcui: selected.rxcui,
          drug_type: selected.drug_type,
          dosage: dosageSel.value,
          quantity: parseInt(qtyIn && qtyIn.value, 10) || 30,
          frequency: freqSel ? freqSel.value : "per month",
        });
        renderLists();
        closeModal("mi-modal-drug");
        reset();
      });
    }
    document.querySelector('[data-close="mi-modal-drug"]') &&
      document.querySelectorAll('[data-close="mi-modal-drug"]').forEach(function (el) {
        el.addEventListener("click", reset);
      });
  }

  function wireProviderModal() {
    fillDistanceSelect($("mi-provider-distance"));
    var zipIn = $("mi-provider-zip");
    var searchIn = $("mi-provider-search");
    var results = $("mi-provider-results");
    var err = $("mi-provider-zip-err");

    var doSearch = debounce(function () {
      var zip = (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "";
      if (zip.length !== 5) {
        if (err) err.textContent = "Zip code must be 5 digits";
        return;
      }
      if (err) err.textContent = "";
      api(
        "/api/medical-intake/search?type=providers&zipCode=" +
          encodeURIComponent(zip) +
          "&searchTerm=" +
          encodeURIComponent((searchIn && searchIn.value) || "") +
          "&radius=" +
          encodeURIComponent(($("mi-provider-distance") && $("mi-provider-distance").value) || "25")
      )
        .then(function (data) {
          if (!results) return;
          results.innerHTML = (data.items || [])
            .map(function (p, i) {
              return (
                '<button type="button" data-idx="' +
                i +
                '">' +
                escapeHtml(p.name) +
                "<br><small>" +
                escapeHtml(p.specialty || "") +
                " · NPI " +
                escapeHtml(p.npi || "") +
                "</small></button>"
              );
            })
            .join("");
          var items = data.items || [];
          results.querySelectorAll("button").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var p = items[parseInt(btn.getAttribute("data-idx"), 10)];
              if (p) state.providers.push(p);
              renderLists();
              closeModal("mi-modal-provider");
            });
          });
        })
        .catch(function () {
          if (results) results.innerHTML = '<p class="mi-error">Search failed.</p>';
        });
    }, 400);
    if (searchIn) searchIn.addEventListener("input", doSearch);
    if (zipIn) zipIn.addEventListener("input", doSearch);
  }

  function wirePharmacyModal() {
    fillDistanceSelect($("mi-pharmacy-distance"));
    var zipIn = $("mi-pharmacy-zip");
    var nameIn = $("mi-pharmacy-name");
    var results = $("mi-pharmacy-results");
    var err = $("mi-pharmacy-zip-err");
    var tabPhysical = $("mi-pharm-tab-physical");
    var tabOnline = $("mi-pharm-tab-online");
    var pharmType = "physical";

    function setTab(t) {
      pharmType = t;
      if (tabPhysical) tabPhysical.classList.toggle("active", t === "physical");
      if (tabOnline) tabOnline.classList.toggle("active", t === "online");
      doSearch();
    }
    if (tabPhysical) tabPhysical.addEventListener("click", function () {
      setTab("physical");
    });
    if (tabOnline) tabOnline.addEventListener("click", function () {
      setTab("online");
    });

    var doSearch = debounce(function () {
      var zip = (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "";
      if (zip.length !== 5) {
        if (err) err.textContent = "Zip code must be 5 digits";
        return;
      }
      if (err) err.textContent = "";
      api(
        "/api/medical-intake/search?type=pharmacies&zipCode=" +
          encodeURIComponent(zip) +
          "&pharmacyName=" +
          encodeURIComponent((nameIn && nameIn.value) || "") +
          "&pharmacyType=" +
          encodeURIComponent(pharmType)
      )
        .then(function (data) {
          if (!results) return;
          results.innerHTML = (data.items || [])
            .map(function (p, i) {
              return (
                '<button type="button" data-idx="' +
                i +
                '">' +
                escapeHtml(p.name) +
                "<br><small>" +
                escapeHtml([p.address_line, p.city, p.state, p.zip].filter(Boolean).join(", ")) +
                "</small></button>"
              );
            })
            .join("");
          var items = data.items || [];
          results.querySelectorAll("button").forEach(function (btn) {
            btn.addEventListener("click", function () {
              var p = items[parseInt(btn.getAttribute("data-idx"), 10)];
              if (p) state.pharmacies.push(Object.assign({}, p, { pharmacy_type: pharmType }));
              renderLists();
              closeModal("mi-modal-pharmacy");
            });
          });
        })
        .catch(function () {
          if (results) results.innerHTML = '<p class="mi-error">Search failed.</p>';
        });
    }, 400);
    if (nameIn) nameIn.addEventListener("input", doSearch);
    if (zipIn) zipIn.addEventListener("input", doSearch);
  }

  function wireConditionModal() {
    var searchIn = $("mi-condition-search");
    var results = $("mi-condition-results");
    var countEl = $("mi-condition-count");

    var doSearch = debounce(function () {
      var q = (searchIn && searchIn.value.trim()) || "";
      if (q.length < 2) {
        if (results) results.innerHTML = "";
        if (countEl) countEl.textContent = "";
        return;
      }
      api("/api/medical-intake/search?type=conditions&q=" + encodeURIComponent(q))
        .then(function (data) {
          var items = data.items || [];
          if (countEl) countEl.textContent = items.length + " conditions found";
          if (!results) return;
          results.innerHTML = items
            .map(function (c, i) {
              return (
                '<label style="display:block;padding:8px 0;border-bottom:1px solid #eef2f7">' +
                '<input type="radio" name="mi-cond-pick" value="' +
                i +
                '" /> ' +
                escapeHtml(c.name) +
                (c.icd10_code ? " <small>(" + escapeHtml(c.icd10_code) + ")</small>" : "") +
                "</label>"
              );
            })
            .join("");
        })
        .catch(function () {
          if (results) results.innerHTML = '<p class="mi-error">Search failed.</p>';
        });
    }, 400);
    if (searchIn) searchIn.addEventListener("input", doSearch);
    var nextBtn = $("mi-condition-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var picked = document.querySelector('input[name="mi-cond-pick"]:checked');
        if (!picked) return;
        api("/api/medical-intake/search?type=conditions&q=" + encodeURIComponent(searchIn.value.trim()))
          .then(function (data) {
            var c = (data.items || [])[parseInt(picked.value, 10)];
            if (c && !state.conditions.some(function (x) {
              return x.icd10_code === c.icd10_code;
            })) {
              state.conditions.push(c);
            }
            renderLists();
            closeModal("mi-modal-condition");
          });
      });
    }
  }

  function wireSubmit() {
    var form = $("mi-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!state.healthInfo.gender || !state.healthInfo.birthdate) {
        alert("Please complete Health Info (gender and birthdate).");
        return;
      }
      var consent = $("mi-consent");
      if (!consent || !consent.checked) {
        alert("Please confirm the privacy acknowledgment.");
        return;
      }
      var btn = $("mi-submit-btn");
      if (btn) btn.disabled = true;
      fetch("/api/medical-intake/submit?t=" + encodeURIComponent(TOKEN), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: TOKEN,
          healthInfo: state.healthInfo,
          providers: state.providers,
          prescriptions: state.prescriptions,
          pharmacies: state.pharmacies,
          conditions: state.conditions,
          consent: true,
        }),
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error || "submit_failed");
          $("mi-gate").classList.remove("mi-hidden");
          $("mi-app").classList.add("mi-hidden");
          $("mi-gate").innerHTML =
            "<h2>Thank you</h2><p>Your medical information was submitted securely. Julie will review it before your call.</p>";
        })
        .catch(function (err) {
          alert("Could not submit: " + (err.message || "error"));
          if (btn) btn.disabled = false;
        });
    });
  }

  function init() {
    if (!TOKEN) {
      $("mi-gate").innerHTML = "<h2>Invalid link</h2><p>This medical intake link is missing or invalid.</p>";
      return;
    }
    api("/api/medical-intake/validate")
      .then(function () {
        $("mi-gate").classList.add("mi-hidden");
        $("mi-app").classList.remove("mi-hidden");
        document.querySelectorAll(".mi-section").forEach(function (s) {
          s.classList.add("open");
        });
        wireSections();
        wireHealthInfo();
        wireDrugModal();
        wireProviderModal();
        wirePharmacyModal();
        wireConditionModal();
        wireSubmit();
        renderLists();
      })
      .catch(function (err) {
        var msg =
          err.message === "token_expired"
            ? "This link has expired. Please contact Julie for a new link."
            : err.message === "token_used"
              ? "This link was already used."
              : "This link is invalid or expired.";
        $("mi-gate").innerHTML = "<h2>Unable to open form</h2><p>" + escapeHtml(msg) + "</p>";
      });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
