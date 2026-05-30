/**
 * Medical intake search — live proxy to RxNorm, NPI Registry, ICD-10, Zippopotam.
 * Server-side only (browser never calls public APIs directly).
 * No local directory download or lookup-table caching required.
 */

function normKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function fetchJson(url, opts) {
  const r = await fetch(url, Object.assign({ headers: { Accept: "application/json" } }, opts || {}));
  const text = await r.text();
  if (!r.ok) throw new Error(`fetch ${r.status}: ${text.slice(0, 200)}`);
  return JSON.parse(text || "{}");
}

function parseZip(zip) {
  const z = String(zip || "").replace(/\D/g, "").slice(0, 5);
  return z.length === 5 ? z : null;
}

function inferStateFromZip(zip) {
  const n = parseInt(String(zip || "").slice(0, 3), 10);
  if (!Number.isFinite(n)) return "";
  // USPS 3-digit prefix → state (partial map; extend as needed).
  if (n >= 680 && n <= 693) return "NE";
  if (n >= 690 && n <= 699) return "NE";
  if (n >= 500 && n <= 528) return "IA";
  if (n >= 660 && n <= 679) return "KS";
  if (n >= 800 && n <= 816) return "CO";
  if (n >= 750 && n <= 799) return "TX";
  if (n >= 900 && n <= 961) return "CA";
  if (n >= 600 && n <= 629) return "IL";
  if (n >= 300 && n <= 399) return "GA";
  if (n >= 320 && n <= 349) return "FL";
  if (n >= 850 && n <= 865) return "AZ";
  return "";
}

async function geocodeZip(zip) {
  const z = parseZip(zip);
  if (!z) return null;
  try {
    const data = await fetchJson(`https://api.zippopotam.us/us/${z}`);
    const place = data && data.places && data.places[0];
    if (!place) return null;
    return {
      zip: z,
      city: place["place name"] || "",
      state: place["state abbreviation"] || inferStateFromZip(z),
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
    };
  } catch (_) {
    return {
      zip: z,
      city: "",
      state: inferStateFromZip(z),
      lat: null,
      lng: null,
    };
  }
}

function stripDrugRouteSuffix(name) {
  return String(name || "")
    .replace(/\s*\([^)]+\)\s*$/, "")
    .trim();
}

function isIvDrugCompound(name) {
  const s = String(name || "");
  return (s.match(/ MG\/ML /gi) || []).length >= 2 || s.length > 100;
}

function drugNameMatchesQuery(name, query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return false;
  const base = stripDrugRouteSuffix(name).toLowerCase();
  if (base.startsWith(q)) return true;
  const parts = base.split(/[\s/]+/).filter(Boolean);
  if (parts.some(function (part) {
    return part.startsWith(q);
  })) {
    return true;
  }
  if (q.length >= 5) {
    if (parts.some(function (part) {
      return part.includes(q);
    })) {
      return true;
    }
    if (base.includes(q)) return true;
  }
  return false;
}

function normDrugIngredientKey(part) {
  return normKey(
    String(part || "")
      .replace(
        /\b(hydrochloride|hcl|anhydrous|monohydrate|trihydrate|pentahydrate|dihydrate|potassium dihydrate)\b/gi,
        ""
      )
      .replace(/\s+/g, " ")
      .trim()
  );
}

function isNonPrescribableDrugSearchResult(name) {
  const s = String(name || "").toLowerCase();
  if (
    /\b(metamucil|methylcellulose|chondroitin|methylsulfonylmethane|eucalyptol|methyl salicylate|methohexital)\b/.test(
      s
    )
  ) {
    return true;
  }
  if (String(name || "").split(/\s*\/\s*/).length > 3) return true;
  return false;
}

function isValidDrugSearchLabel(name) {
  const s = String(name || "").trim().toLowerCase();
  if (!s || s.length < 2) return false;
  if (/\b(tablet for|powder for|for oral suspension|for solution|for suspension)\b/.test(s)) {
    return false;
  }
  if (/\b(cartridge|disintegrating|metered dose|dry powder inhaler|inhalation powder)\b/.test(s)) {
    return false;
  }
  if (/\b(injectable solution|injection|inhalation solution)\b/.test(s) && !/\//.test(s)) {
    return false;
  }
  return true;
}

function shouldSupplementFromRxNorm(q) {
  return String(q || "").trim().length >= 4;
}

function classifyDrugType(baseName) {
  const s = stripDrugRouteSuffix(baseName);
  if (/^[A-Z0-9][A-Z0-9\s\-/]+$/.test(s)) return "Brand";
  return "Generic";
}

function formatDrugDisplayName(baseName, drugType) {
  const base = stripDrugRouteSuffix(baseName);
  if (drugType === "Brand") {
    return base
      .split(/\s+/)
      .map(function (w) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(" ");
  }
  return base.toLowerCase();
}

function drugSearchDedupeKey(name) {
  const base = stripDrugRouteSuffix(name);
  if (!base.includes("/")) return normKey(base);
  return base
    .split(/\s*\/\s*/)
    .map(function (part) {
      return normKey(part);
    })
    .sort()
    .join("|");
}

function isRedundantSaltVariant(name, out) {
  const lower = String(name || "").toLowerCase();
  if (/\b(anhydrous|calcium|propylene glycol solvate|trihydrate)\b/.test(lower)) {
    const soft = normDrugIngredientKey(name);
    return out.some(function (item) {
      return normDrugIngredientKey(item.name) === soft;
    });
  }
  if (/\b(hydrochloride|hcl)\b/.test(lower)) {
    const plain = normDrugIngredientKey(name);
    if (plain === "metformin") {
      return out.some(function (item) {
        return normDrugIngredientKey(item.name) === "metformin";
      });
    }
  }
  return false;
}

function conceptProperties(group) {
  if (!group || !group.conceptProperties) return [];
  const props = group.conceptProperties;
  return Array.isArray(props) ? props : [props];
}

function tryAddDrugSearchResult(out, seen, name, q, drugType, priority) {
  const base = stripDrugRouteSuffix(String(name || "").trim());
  if (!base || base.length < q.length) return;
  if (isNonPrescribableDrugSearchResult(base)) return;
  if (!isValidDrugSearchLabel(base)) return;
  if (!drugNameMatchesQuery(base, q)) return;
  if (isRedundantSaltVariant(base, out)) return;
  const key = drugSearchDedupeKey(base);
  if (seen.has(key)) return;
  seen.add(key);
  out.push({
    name: formatDrugDisplayName(base, drugType),
    rxcui: null,
    drug_type: drugType,
    _priority: priority != null ? priority : 50,
  });
}

function formatComboDrugName(raw, q) {
  const root = drugSearchRoot(q);
  const parts = String(raw)
    .split(/\s*\/\s/)
    .map(function (p) {
      return p.trim().toLowerCase().replace(/\s+/g, " ");
    });
  parts.sort(function (a, b) {
    const am = a.includes(root) ? 0 : 1;
    const bm = b.includes(root) ? 0 : 1;
    if (am !== bm) return am - bm;
    return a.localeCompare(b);
  });
  return parts.join("/");
}

function formatScdfDrugName(raw, q) {
  let s = String(raw || "").trim();
  const isEr = /extended\s*release/i.test(s);
  s = s.replace(
    /\s+(Extended Release Oral (?:Tablet|Capsule|Suspension)|Extended Release Suspension|Oral (?:Tablet|Capsule|Solution|Liquid|Suspension))$/gi,
    ""
  );
  if (/\s*\/\s/.test(s)) return formatComboDrugName(s, q);
  s = s.toLowerCase().trim();
  if (isEr && !/\ber\b/.test(s)) s += " er";
  return s.replace(/\s+er$/i, " er");
}

async function resolveDrugRxcuiIds(term) {
  const name = String(term || "").trim();
  if (!name) return [];
  const tries = [name, name.replace(/\bxr\b/i, "extended release")];
  const ids = new Set();
  for (const t of tries) {
    try {
      const data = await fetchJson(
        `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encodeURIComponent(t)}&search=1`
      );
      const raw = data.idGroup && data.idGroup.rxnormId;
      const idList = !raw ? [] : Array.isArray(raw) ? raw : [raw];
      idList.forEach(function (id) {
        ids.add(String(id));
      });
    } catch (_) {
      /* try next term */
    }
  }
  return Array.from(ids);
}

async function resolveDrugRxcui(drugName) {
  const ids = await resolveDrugRxcuiIds(drugName);
  if (!ids.length) return null;
  if (ids.length === 1) return ids[0];

  const root = drugSearchRoot(drugName);
  let best = ids[0];
  let bestScore = -1;
  for (const id of ids) {
    try {
      const rel = await fetchJson(
        `https://rxnav.nlm.nih.gov/REST/rxcui/${encodeURIComponent(id)}/related.json?tty=MIN+PIN+IN`
      );
      const groups = (rel && rel.relatedGroup && rel.relatedGroup.conceptGroup) || [];
      const min = conceptProperties(groups.find(function (g) {
        return g.tty === "MIN";
      }));
      const pin = conceptProperties(groups.find(function (g) {
        return g.tty === "PIN";
      }));
      const inProps = conceptProperties(groups.find(function (g) {
        return g.tty === "IN";
      }));
      const inMatch = inProps.some(function (c) {
        return String(c.name || "")
          .toLowerCase()
          .includes(root);
      });
      const score = (inMatch ? 1000 : 0) + min.length + pin.length * 2;
      if (score > bestScore) {
        bestScore = score;
        best = id;
      }
    } catch (_) {
      /* try next id */
    }
  }
  return bestScore >= 0 ? best : ids[0];
}

async function supplementDrugsFromRxNorm(q, out, seen) {
  const ids = await resolveDrugRxcuiIds(q);
  if (!ids.length) return;

  const root = drugSearchRoot(q);
  const pinSeen = new Set();
  const minSeen = new Set();
  let singleEr = false;

  for (const id of ids) {
    try {
      const data = await fetchJson(
        `https://rxnav.nlm.nih.gov/REST/rxcui/${encodeURIComponent(id)}/related.json?tty=PIN+MIN+SCDF`
      );
      const groups = (data && data.relatedGroup && data.relatedGroup.conceptGroup) || [];
      const pin = conceptProperties(groups.find(function (g) {
        return g.tty === "PIN";
      }));
      const min = conceptProperties(groups.find(function (g) {
        return g.tty === "MIN";
      }));
      const scdf = conceptProperties(groups.find(function (g) {
        return g.tty === "SCDF";
      }));

      if (
        !singleEr &&
        scdf.some(function (c) {
          return (
            c.name &&
            /extended release/i.test(c.name) &&
            !/\s\/\s/.test(c.name) &&
            String(c.name).toLowerCase().includes(root)
          );
        })
      ) {
        singleEr = true;
      }

      for (const c of pin) {
        if (!c.name) continue;
        const pinKey = normKey(c.name);
        if (pinSeen.has(pinKey)) continue;
        pinSeen.add(pinKey);
        const base = String(c.name).toLowerCase();
        tryAddDrugSearchResult(out, seen, base, q, "Generic", 10);
        if (singleEr && base.includes(root) && /bitartrate|polistirex/i.test(base)) {
          tryAddDrugSearchResult(out, seen, `${base} er`, q, "Generic", 12);
        }
      }
      for (const c of min) {
        if (!c.name) continue;
        const parts = String(c.name).split(/\s*\/\s*/);
        if (parts.length > 2) continue;
        const combo = formatComboDrugName(c.name, q);
        const comboKey = drugSearchDedupeKey(combo);
        if (minSeen.has(comboKey)) continue;
        minSeen.add(comboKey);
        tryAddDrugSearchResult(out, seen, combo, q, "Generic", 30);
      }
    } catch (_) {
      /* RxNorm supplement optional per id */
    }
  }
}

async function searchDrugs(term) {
  const q = String(term || "").trim();
  if (q.length < 2) return { items: [], result_count: 0 };

  const out = [];
  const seen = new Set();

  try {
    const data = await fetchJson(
      `https://clinicaltables.nlm.nih.gov/api/rxterms/v3/search?terms=${encodeURIComponent(q)}&maxList=120`
    );
    const names = Array.isArray(data[1]) ? data[1] : [];

    names.forEach(function (raw, idx) {
      if (!raw || isIvDrugCompound(raw)) return;
      if (/\(Topical\)/i.test(raw)) return;
      const base = stripDrugRouteSuffix(raw);
      if (!base || base.length < q.length) return;
      if (!drugNameMatchesQuery(base, q)) return;
      tryAddDrugSearchResult(out, seen, base, q, classifyDrugType(base), idx);
    });
  } catch (_) {
    /* RxTerms optional */
  }

  if (shouldSupplementFromRxNorm(q)) {
    await supplementDrugsFromRxNorm(q, out, seen);
  }

  if (!out.length) {
    try {
      const drugs = await fetchJson(
        `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(q)}`
      );
      const groups = (drugs && drugs.drugGroup && drugs.drugGroup.conceptGroup) || [];
      for (const g of groups) {
        for (const c of g.conceptProperties || []) {
          const raw = c.name || c.synonym || "";
          if (!raw || isIvDrugCompound(raw) || !drugNameMatchesQuery(raw, q)) continue;
          const key = normKey(raw) + "|" + (c.rxcui || "");
          if (seen.has(key)) continue;
          seen.add(key);
          const drug_type =
            g.tty === "SBD" ? "Brand" : g.tty === "BPCK" ? "Branded Generic" : "Generic";
          out.push({
            name: formatDrugDisplayName(raw, drug_type === "Brand" ? "Brand" : "Generic"),
            rxcui: c.rxcui ? String(c.rxcui) : null,
            drug_type,
          });
        }
      }
    } catch (_) {
      /* drugs.json optional */
    }
  }

  out.sort(function (a, b) {
    const pa = a._priority != null ? a._priority : 50;
    const pb = b._priority != null ? b._priority : 50;
    if (pa !== pb) return pa - pb;
    const root = drugSearchRoot(q);
    const aSingle = !a.name.includes("/");
    const bSingle = !b.name.includes("/");
    if (aSingle !== bSingle) return aSingle ? -1 : 1;
    const aRoot = a.name.toLowerCase().startsWith(root) ? 0 : 1;
    const bRoot = b.name.toLowerCase().startsWith(root) ? 0 : 1;
    if (aRoot !== bRoot) return aRoot - bRoot;
    return a.name.localeCompare(b.name);
  });

  const items = out.slice(0, 60).map(function (item) {
    return {
      name: item.name,
      rxcui: item.rxcui,
      drug_type: item.drug_type,
    };
  });
  const result_count = Math.min(out.length, 60);
  return { items, result_count };
}

function formatIcStrength(strength, formAbbr, rxName) {
  let s = String(strength || "")
    .toUpperCase()
    .replace(/\s+/g, "");
  if (!s) return "";
  const raw = String(rxName || "").toLowerCase();
  const isOralLiquid =
    (formAbbr === "SOL" || formAbbr === "SUSP") &&
    /oral\s+(solution|suspension)/.test(raw) &&
    !/injectable/.test(raw);
  const mgMl = s.match(/^(\d+(?:\.\d+)?)MG\/ML$/);
  if (isOralLiquid && mgMl) {
    const mgPer5 = parseFloat(mgMl[1]) * 5;
    const rounded = Math.round(mgPer5 * 10) / 10;
    const formatted = Number.isInteger(rounded) ? String(rounded) : String(rounded);
    if (rounded >= 100) return `${formatted}/5ML`;
    return `${formatted}MG/5ML`;
  }
  return s;
}

function isCombinationDose(rawName) {
  return /\s\/\s/.test(String(rawName || ""));
}

function drugSearchRoot(drugName) {
  return String(drugName || "")
    .trim()
    .toLowerCase()
    .replace(/\bhcl\b|\bhydrochloride\b|\bsulfate\b|\ber\b|\bxr\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)[0];
}

function monotherapyMatchesDrug(rawName, drugName) {
  const root = drugSearchRoot(drugName);
  if (!root) return true;
  if (isCombinationDose(rawName)) return false;
  return String(rawName || "").toLowerCase().includes(root);
}

function formatIcDosageLabel(rxName) {
  let n = String(rxName || "")
    .trim()
    .replace(/\s*\[[^\]]+\]\s*$/, "");

  let releaseNote = "";
  if (/osmotic/i.test(n)) releaseNote = "(osmotic)";
  else if (/modified/i.test(n)) releaseNote = "(modified release)";

  const isEr =
    /extended\s*release/i.test(n) ||
    (/24\s*hr/i.test(n) && /tablet|suspension|capsule/i.test(n));

  n = n.replace(/^(?:modified|osmotic)\s+/i, "");
  n = n.replace(/^24\s*hr\s+/i, "");

  let formAbbr = "";
  const formPatterns = [
    [/extended\s*release\s*oral\s*tablet/i, "TAB"],
    [/extended\s*release\s*suspension/i, "SUSP"],
    [/tablet\s*for\s*oral\s*suspension/i, "TAB"],
    [/oral\s*tablet/i, "TAB"],
    [/oral\s*solution/i, "SOL"],
    [/injectable\s*solution/i, "SOL"],
    [/oral\s*capsule/i, "CAP"],
    [/oral\s*suspension/i, "SUSP"],
  ];
  for (const [re, abbr] of formPatterns) {
    if (re.test(n)) {
      formAbbr = abbr;
      n = n.replace(re, "").trim();
      break;
    }
  }

  const strengthMatch = n.match(/(\d+(?:\.\d+)?\s*MG(?:\s*\/\s*(?:ML|\d+\s*ML))?)/i);
  let strength = strengthMatch ? strengthMatch[1].replace(/\s+/g, "").toUpperCase() : "";
  strength = formatIcStrength(strength, formAbbr, rxName);
  if (isEr && formAbbr === "TAB" && strength && !/ ER$/i.test(strength)) {
    strength = `${strength} ER`;
  }

  let ingredient = n.replace(/(\d+(?:\.\d+)?\s*MG.*)$/i, "").trim();
  ingredient = ingredient
    .replace(/hydrochloride/gi, "hcl")
    .replace(/sulfate/gi, "sulf")
    .replace(/acetate/gi, "acet")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

  if (!formAbbr) {
    const raw = String(rxName || "").toLowerCase();
    if (/solution|suspension|mg\/ml/.test(raw)) formAbbr = "SOL";
    else if (/tablet|tab/.test(raw)) formAbbr = "TAB";
    else if (/capsule|cap/.test(raw)) formAbbr = "CAP";
  }

  let label = [ingredient, formAbbr, strength].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (releaseNote) label += ` ${releaseNote}`;
  return label.trim();
}

function isOralLiquidDose(rxName, icLabel) {
  const raw = String(rxName || "").toLowerCase();
  const ic = String(icLabel || "").toLowerCase();
  return (
    /\bsol\b|\bsusp\b/.test(ic) &&
    /oral\s+(solution|suspension)/.test(raw) &&
    !/injectable/.test(raw)
  );
}

function inferPackagingOptions(rxName, icLabel) {
  const ic = String(icLabel || "").toLowerCase();
  // IC label form wins — RxNorm names like "Tablet for Oral Suspension" must not map to liquid bottles.
  if (/\ber tab\b|\btab\b|\bcap\b/.test(ic)) {
    return [
      { label: "100 count Bottle", default_quantity: 1 },
      { label: "30 count Bottle", default_quantity: 1 },
      { label: "90 count Bottle", default_quantity: 1 },
    ];
  }
  if (isOralLiquidDose(rxName, icLabel)) {
    const mg5Match = ic.match(/(\d+(?:\.\d+)?)(?:mg)?\/5ml/);
    const mg5 = mg5Match ? parseFloat(mg5Match[1]) : 0;
    if (mg5 > 0 && mg5 <= 5) {
      return [
        { label: "500ML Bottle", default_quantity: 1 },
        { label: "5ML Cup", default_quantity: 1 },
        { label: "5ML Cup (sold in a package of 30 cups)", default_quantity: 1 },
        { label: "5ML Box (sold in a package of 30 boxes)", default_quantity: 1 },
      ];
    }
    return [{ label: "500ML Bottle", default_quantity: 1 }];
  }
  if (/\bsol\b|\bsusp\b/.test(ic)) {
    return [
      { label: "500ML Bottle", default_quantity: 1 },
      { label: "473ML Bottle", default_quantity: 1 },
      { label: "100ML Bottle", default_quantity: 1 },
    ];
  }
  const s = `${rxName || ""} ${icLabel || ""}`.toLowerCase();
  if (/solution|suspension|mg\/ml|liquid|injectable/.test(s)) {
    return [
      { label: "500ML Bottle", default_quantity: 1 },
      { label: "473ML Bottle", default_quantity: 1 },
      { label: "100ML Bottle", default_quantity: 1 },
    ];
  }
  if (/tablet|capsule|pill/.test(s)) {
    return [
      { label: "100 count Bottle", default_quantity: 1 },
      { label: "30 count Bottle", default_quantity: 1 },
      { label: "90 count Bottle", default_quantity: 1 },
    ];
  }
  return [{ label: "Standard packaging", default_quantity: 30 }];
}

function inferDefaultQuantity(rxName, packagingLabel, icLabel) {
  const ic = String(icLabel || "").toLowerCase();
  const pkg = String(packagingLabel || "").toLowerCase();
  if (/bottle|ml|liter/.test(pkg)) return 1;
  if (/count/.test(pkg)) return 1;
  if (/\btab\b|\bcap\b|\bsol\b|\bsusp\b/.test(ic)) return 1;
  const rx = String(rxName || "").toLowerCase();
  if (/solution|suspension|mg\/ml|injectable/.test(rx)) return 1;
  return 30;
}

function ingredientFromIcLabel(icLabel) {
  const s = String(icLabel || "").trim();
  const m = s.match(/^(.+?)\s+(?:ER\s+)?(?:SOL|TAB|CAP|SUSP)\b/i);
  if (m) return m[1].trim();
  return s.split(/\s+\d/)[0].trim();
}

async function searchDrugDosages(rxcui, drugName) {
  let id = String(rxcui || "").trim();
  if (!id) id = (await resolveDrugRxcui(drugName)) || "";
  const out = [];
  const seen = new Set();

  function pushDose(rawName, doseRxcui) {
    if (!rawName || isIvDrugCompound(rawName)) return;
    const raw = String(rawName).toLowerCase();
    if (/injectable\s+solution/.test(raw) && !/oral/.test(raw)) return;
    if (isCombinationDose(rawName)) return;
    if (drugName && !monotherapyMatchesDrug(rawName, drugName)) return;
    if (/extended\s*release\s*suspension/i.test(rawName)) return;

    const icLabel = formatIcDosageLabel(rawName);
    if (isOralLiquidDose(rawName, icLabel)) {
      const mg5Match = String(icLabel).match(/(\d+(?:\.\d+)?)(?:MG)?\/5ML/i);
      const mg5 = mg5Match ? parseFloat(mg5Match[1]) : 0;
      const opioidLike = /methadone|morphine|oxycodone|hydromorphone|fentanyl/i.test(
        `${rawName} ${drugName || ""}`
      );
      if (opioidLike && mg5 > 10) return;
    }
    const key = normKey(icLabel);
    if (!icLabel || seen.has(key)) return;
    seen.add(key);
    const packaging_options = inferPackagingOptions(rawName, icLabel);
    out.push({
      dosage_label: icLabel,
      rxnorm_name: String(rawName),
      rxcui: doseRxcui ? String(doseRxcui) : id || null,
      default_quantity: inferDefaultQuantity(
        rawName,
        packaging_options[0] && packaging_options[0].label,
        icLabel
      ),
      packaging_options,
    });
  }

  if (id) {
    try {
      const data = await fetchJson(
        `https://rxnav.nlm.nih.gov/REST/rxcui/${encodeURIComponent(id)}/related.json?tty=SCD+SCDF`
      );
      const groups = (data && data.relatedGroup && data.relatedGroup.conceptGroup) || [];
      const scdGroup = groups.find((g) => g.tty === "SCD");
      const scdfGroup = groups.find((g) => g.tty === "SCDF");
      const scd = (scdGroup && scdGroup.conceptProperties) || [];
      const scdf = (scdfGroup && scdfGroup.conceptProperties) || [];
      for (const c of scd) pushDose(c.name, c.rxcui);
      if (!out.length) {
        for (const c of scdf) pushDose(c.name, c.rxcui);
      }
    } catch (_) {
      /* fall through */
    }
  }

  if (!out.length && drugName) {
    try {
      const drugs = await fetchJson(
        `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`
      );
      const groups = (drugs && drugs.drugGroup && drugs.drugGroup.conceptGroup) || [];
      for (const g of groups) {
        if (g.tty !== "SCD" && g.tty !== "SCDF" && g.tty !== "SBD") continue;
        for (const c of g.conceptProperties || []) {
          pushDose(c.name, c.rxcui);
        }
      }
    } catch (_) {
      /* ignore */
    }
  }

  out.sort(function (a, b) {
    const aSol = /\bsol\b/i.test(a.dosage_label);
    const bSol = /\bsol\b/i.test(b.dosage_label);
    if (aSol !== bSol) return aSol ? -1 : 1;
    const aEr = / ER/i.test(a.dosage_label);
    const bEr = / ER/i.test(b.dosage_label);
    if (aEr !== bEr) return aEr ? 1 : -1;
    const strengthNum = function (label) {
      const m = String(label).match(/(\d+(?:\.\d+)?)(?:MG|\/)/i);
      return m ? parseFloat(m[1]) : 0;
    };
    const aMg = strengthNum(a.dosage_label);
    const bMg = strengthNum(b.dosage_label);
    if (aMg !== bMg) return aMg - bMg;
    return a.dosage_label.localeCompare(b.dosage_label);
  });

  return out.slice(0, 40);
}

const zipGeoCache = new Map();

async function geocodeZipCached(zip) {
  const z = parseZip(zip);
  if (!z) return null;
  if (zipGeoCache.has(z)) return zipGeoCache.get(z);
  const geo = await geocodeZip(z);
  if (geo) zipGeoCache.set(z, geo);
  return geo;
}

function haversineMiles(lat1, lon1, lat2, lon2) {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;
  const R = 3959;
  const p = Math.PI / 180;
  const a =
    0.5 -
    Math.cos((lat2 - lat1) * p) / 2 +
    (Math.cos(lat1 * p) * Math.cos(lat2 * p) * (1 - Math.cos((lon2 - lon1) * p))) / 2;
  return R * 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
}

async function distanceMilesBetweenZips(zipA, zipB) {
  const a = await geocodeZipCached(zipA);
  const b = await geocodeZipCached(zipB);
  if (!a || !b || !Number.isFinite(a.lat) || !Number.isFinite(b.lat)) return null;
  return haversineMiles(a.lat, a.lng, b.lat, b.lng);
}

function providerDisplayName(basic) {
  if (!basic) return "Unknown";
  if (basic.organization_name) return String(basic.organization_name).trim();
  const parts = [basic.first_name, basic.middle_name, basic.last_name].filter(Boolean).map(String);
  let name = parts.join(" ").trim();
  if (basic.credential) name = `${name}, ${String(basic.credential).trim()}`;
  return name || "Unknown";
}

function locationDedupeKey(loc) {
  if (!loc) return "";
  const line = String(loc.address_line || "")
    .toUpperCase()
    .replace(/\bROAD\b/g, "RD")
    .replace(/\bSTREET\b/g, "ST")
    .replace(/\bDRIVE\b/g, "DR")
    .replace(/\bAVENUE\b/g, "AVE")
    .replace(/\bBOULEVARD\b/g, "BLVD")
    .replace(/[^A-Z0-9]/g, "");
  return line + "|" + (parseZip(loc.zip) || "");
}

function formatNpiAddress(addr) {
  if (!addr) return null;
  const zip = parseZip(addr.postal_code);
  return {
    address_line: [addr.address_1, addr.address_2].filter(Boolean).join(", "),
    city: addr.city || "",
    state: addr.state || "",
    zip: zip || "",
    phone: addr.telephone_number || "",
  };
}

function collectProviderLocations(npiRow) {
  const out = [];
  const seen = new Set();
  function push(loc) {
    if (!loc || !loc.address_line) return;
    const key = locationDedupeKey(loc);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(loc);
  }
  for (const addr of npiRow.addresses || []) {
    if (addr.address_purpose === "LOCATION") push(formatNpiAddress(addr));
  }
  for (const pl of npiRow.practiceLocations || []) {
    push(formatNpiAddress(pl));
  }
  if (!out.length) {
    const fallback = (npiRow.addresses || [])[0];
    if (fallback) push(formatNpiAddress(fallback));
  }
  return out;
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function contactKeysFromNpiRow(npiRow) {
  const phones = new Set();
  const faxes = new Set();
  for (const addr of npiRow.addresses || []) {
    const p = normalizePhone(addr.telephone_number);
    const f = normalizePhone(addr.fax_number);
    if (p) phones.add(p);
    if (f) faxes.add(f);
  }
  for (const pl of npiRow.practiceLocations || []) {
    const p = normalizePhone(pl.telephone_number);
    if (p) phones.add(p);
  }
  const ao = normalizePhone(npiRow.basic && npiRow.basic.authorized_official_telephone_number);
  if (ao) phones.add(ao);
  return { phones, faxes };
}

function orgMatchesContact(orgRow, phones, faxes) {
  for (const addr of [...(orgRow.addresses || []), ...(orgRow.practiceLocations || [])]) {
    if (phones.has(normalizePhone(addr.telephone_number))) return true;
    if (faxes.has(normalizePhone(addr.fax_number))) return true;
  }
  const ao = normalizePhone(orgRow.basic && orgRow.basic.authorized_official_telephone_number);
  return !!(ao && phones.has(ao));
}

/** Org NPI-2: prefer secondary practice sites over primary HQ when listed separately. */
function collectOrgSiteLocations(npiRow) {
  const practice = npiRow.practiceLocations || [];
  if (practice.length) {
    return practice.map(formatNpiAddress).filter(function (loc) {
      return loc && loc.address_line;
    });
  }
  return (npiRow.addresses || [])
    .filter(function (a) {
      return a.address_purpose === "LOCATION";
    })
    .map(formatNpiAddress)
    .filter(function (loc) {
      return loc && loc.address_line;
    });
}

const ORG_AFFILIATION_CLUSTERS = [
  { trigger: /family physician/i, include: /medical education partnership/i },
];

async function loadOrgDirectory(state, city, taxonomyDescription) {
  const params = new URLSearchParams({
    version: "2.1",
    enumeration_type: "NPI-2",
    state: state,
    limit: "200",
  });
  if (city) params.set("city", city);
  if (taxonomyDescription) params.set("taxonomy_description", taxonomyDescription);
  return fetchNpiProviders(params);
}

async function fetchNpiByNumber(number) {
  const params = new URLSearchParams({ version: "2.1", number: String(number) });
  const rows = await fetchNpiProviders(params);
  return rows[0] || null;
}

async function collectAffiliatedOrgLocations(individualRow, orgDirectory) {
  const keys = contactKeysFromNpiRow(individualRow);
  if (!keys.phones.size && !keys.faxes.size) return [];

  const matchedOrgs = [];
  const matchedNames = [];

  for (const org of orgDirectory) {
    if (orgMatchesContact(org, keys.phones, keys.faxes)) {
      matchedOrgs.push(org);
      if (org.basic && org.basic.organization_name) {
        matchedNames.push(String(org.basic.organization_name));
      }
    }
  }

  for (const rule of ORG_AFFILIATION_CLUSTERS) {
    if (!matchedNames.some(function (n) {
      return rule.trigger.test(n);
    })) {
      continue;
    }
    for (const org of orgDirectory) {
      const name = String((org.basic && org.basic.organization_name) || "");
      if (!rule.include.test(name)) continue;
      if (matchedOrgs.some(function (o) {
        return o.number === org.number;
      })) {
        continue;
      }
      matchedOrgs.push(org);
    }
  }

  const locs = [];
  const seen = new Set();
  function pushLoc(loc) {
    if (!loc || !loc.address_line) return;
    const key = locationDedupeKey(loc);
    if (seen.has(key)) return;
    seen.add(key);
    locs.push(loc);
  }

  for (const org of matchedOrgs) {
    const full = org.number ? await fetchNpiByNumber(org.number) : null;
    const row = full || org;
    for (const loc of collectOrgSiteLocations(row)) {
      pushLoc(loc);
    }
  }
  return locs;
}

async function collectAllProviderLocations(individualRow, orgDirectory) {
  const seen = new Set();
  const out = [];
  function push(loc) {
    if (!loc || !loc.address_line) return;
    const key = locationDedupeKey(loc);
    if (seen.has(key)) return;
    seen.add(key);
    out.push(loc);
  }
  for (const loc of collectProviderLocations(individualRow)) push(loc);
  for (const loc of await collectAffiliatedOrgLocations(individualRow, orgDirectory)) push(loc);
  return out;
}

function primaryTaxonomyKeyword(npiRow) {
  const taxonomies = npiRow.taxonomies || [];
  const tax = taxonomies.find(function (t) {
    return t.primary;
  }) || taxonomies[0];
  const desc = String((tax && tax.desc) || (tax && tax.classification) || "").trim();
  if (!desc) return "";
  return desc.split(/[\s,/]+/).slice(0, 2).join(" ");
}

function parseProviderNameTerm(term) {
  const parts = String(term || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length >= 2) {
    return { first_name: parts[0], last_name: parts.slice(1).join(" ") };
  }
  if (parts.length === 1) return { last_name: parts[0] };
  return {};
}

/** NPI API v2.1: append * for partial name match (needs at least 2 chars before *). */
function toNpiWildcardName(value) {
  const s = String(value || "").trim();
  if (!s) return "";
  if (s.includes("*")) return s.toUpperCase();
  if (s.length < 2) return s.toUpperCase();
  return s.toUpperCase() + "*";
}

function providerMatchesSearchTerm(item, term) {
  const tokens = String(term || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  if (!tokens.length) return true;
  const hay = String((item && item.name) || "").toLowerCase();
  return tokens.every(function (tok) {
    return hay.indexOf(tok) !== -1;
  });
}

async function filterLocationsByRadius(originZip, locations, radiusMiles) {
  const filtered = [];
  for (const loc of locations) {
    const locZip = parseZip(loc.zip) || originZip;
    const dist = await distanceMilesBetweenZips(originZip, locZip);
    if (dist === null || dist <= radiusMiles) {
      filtered.push(Object.assign({}, loc, { distance_miles: dist != null ? Math.round(dist * 10) / 10 : null }));
    }
  }
  return filtered;
}

async function fetchNpiProviders(params) {
  const data = await fetchJson(`https://npiregistry.cms.hhs.gov/api/?${params}`);
  return Array.isArray(data.results) ? data.results : [];
}

async function buildProviderItems(results, originZip, geo, radius, orgDirectory) {
  const items = [];
  for (const r of results) {
    const basic = r.basic || {};
    const taxonomies = (r.taxonomies || []).map((t) => t.desc || t.primary).filter(Boolean);
    const specialty = taxonomies.join(", ");
    const allLocs = await collectAllProviderLocations(r, orgDirectory || []);
    const locations = await filterLocationsByRadius(originZip, allLocs, radius);
    if (!locations.length) continue;

    locations.sort(function (a, b) {
      const da = a.distance_miles != null ? a.distance_miles : 9999;
      const db = b.distance_miles != null ? b.distance_miles : 9999;
      return da - db;
    });

    const primary = locations[0];
    items.push({
      npi: String(r.number || ""),
      name: providerDisplayName(basic),
      specialty,
      locations,
      address_line: primary.address_line,
      city: primary.city || geo.city || "",
      state: primary.state || geo.state || "",
      zip: primary.zip || originZip,
      phone: primary.phone || "",
      lat: geo.lat ?? null,
      lng: geo.lng ?? null,
      distance_miles: primary.distance_miles ?? null,
    });
  }
  items.sort(function (a, b) {
    const da = a.distance_miles != null ? a.distance_miles : 9999;
    const db = b.distance_miles != null ? b.distance_miles : 9999;
    return da - db;
  });
  return items;
}

function npiBaseParams() {
  return new URLSearchParams({
    version: "2.1",
    enumeration_type: "NPI-1",
    limit: "200",
  });
}

async function searchProviders(opts) {
  const zip = parseZip(opts && opts.zipCode);
  if (!zip) return { error: "zip_invalid", items: [], total: 0 };
  const term = String((opts && opts.searchTerm) || "").trim();
  const radius = Math.max(1, Math.min(parseInt((opts && opts.radius) || "25", 10) || 25, 100));
  const page = Math.max(1, parseInt((opts && opts.page) || "1", 10) || 1);
  const perPage = Math.max(1, Math.min(parseInt((opts && opts.perPage) || "20", 10) || 20, 50));

  const geo = await geocodeZipCached(zip);
  if (!geo) return { error: "zip_invalid", items: [], total: 0 };
  const state = geo.state || inferStateFromZip(zip);

  const nameParts = parseProviderNameTerm(term);
  let results = [];

  if (term) {
    const params = npiBaseParams();
    if (nameParts.first_name) params.set("first_name", toNpiWildcardName(nameParts.first_name));
    if (nameParts.last_name) params.set("last_name", toNpiWildcardName(nameParts.last_name));
    if (state) params.set("state", state);
    // Never use postal_code with name — NPI matches practice address zip exactly, not radius.
    results = await fetchNpiProviders(params);

    // Fallback: last name only in state (handles middle initials / alternate ordering).
    if (!results.length && nameParts.last_name && state) {
      const fallback = npiBaseParams();
      fallback.set("last_name", toNpiWildcardName(nameParts.last_name));
      fallback.set("state", state);
      results = await fetchNpiProviders(fallback);
      if (nameParts.first_name) {
        const first = String(nameParts.first_name).toLowerCase();
        results = results.filter(function (r) {
          const fn = String((r.basic && r.basic.first_name) || "").toLowerCase();
          return fn.indexOf(first) === 0 || first.indexOf(fn) === 0;
        });
      }
    }
  } else {
    const params = npiBaseParams();
    params.set("postal_code", zip);
    results = await fetchNpiProviders(params);
  }

  const orgDirectory = state
    ? await loadOrgDirectory(
        state,
        geo.city || "",
        results.map(primaryTaxonomyKeyword).find(Boolean) || "Family"
      )
    : [];
  const items = (await buildProviderItems(results, zip, geo, radius, orgDirectory)).filter(function (item) {
    return providerMatchesSearchTerm(item, term);
  });

  const total = items.length;
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total,
    page,
    perPage,
    result_count: total,
  };
}

const ONLINE_PHARMACY_CATALOG = [
  { npi: "", name: "PILLPACK BY AMAZON PHARMACY", address_line: "Digital Pharmacy", city: "", state: "", zip: "", pharmacy_type: "online" },
  { npi: "", name: "US MED LLC", address_line: "Digital Pharmacy", city: "", state: "", zip: "", pharmacy_type: "online" },
  { npi: "", name: "BIRDI, INC.", address_line: "Digital Pharmacy", city: "", state: "", zip: "", pharmacy_type: "online" },
  { npi: "", name: "BIRDI, INC.", address_line: "Digital Pharmacy", city: "", state: "", zip: "", pharmacy_type: "online" },
  { npi: "", name: "EXPRESS SCRIPTS", address_line: "Digital Pharmacy", city: "", state: "", zip: "", pharmacy_type: "online" },
  { npi: "", name: "CVS CAREMARK", address_line: "Digital Pharmacy", city: "", state: "", zip: "", pharmacy_type: "online" },
  { npi: "", name: "OPTUMRX", address_line: "Digital Pharmacy", city: "", state: "", zip: "", pharmacy_type: "online" },
  { npi: "", name: "HUMANA PHARMACY", address_line: "Digital Pharmacy", city: "", state: "", zip: "", pharmacy_type: "online" },
];

function pharmacyDisplayName(record) {
  const basic = (record && record.basic) || {};
  const dba = (record.other_names || []).find(function (n) {
    return String(n.type || "").toLowerCase().includes("doing business") || String(n.code || "") === "3";
  });
  let name = dba && dba.organization_name ? String(dba.organization_name).trim() : String(basic.organization_name || "Pharmacy").trim();
  name = name.replace(/#\s+/g, "#");
  return name;
}

function pharmacySearchHaystack(record, displayName, addr) {
  const basic = (record && record.basic) || {};
  const parts = [
    displayName,
    basic.organization_name,
    addr.address_1,
    addr.address_2,
    addr.city,
    addr.state,
    addr.postal_code,
  ];
  (record.other_names || []).forEach(function (n) {
    if (n.organization_name) parts.push(n.organization_name);
  });
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function pharmacyChainPriority(name) {
  const s = String(name || "").toLowerCase();
  if (/\bcvs\b/.test(s)) return 1;
  if (/walgreens/.test(s)) return 2;
  if (/walmart/.test(s)) return 3;
  if (/hy-vee|hyvee/.test(s)) return 4;
  if (/shopko/.test(s)) return 5;
  return 50;
}

async function fetchNpiPharmacies(params) {
  const data = await fetchJson(`https://npiregistry.cms.hhs.gov/api/?${params}`);
  return Array.isArray(data.results) ? data.results : [];
}

async function searchPharmacies(opts) {
  const radius = Math.max(1, Math.min(parseInt((opts && opts.radius) || "25", 10) || 25, 100));
  const ptype = opts && opts.pharmacyType === "online" ? "online" : "physical";
  const page = Math.max(1, parseInt((opts && opts.page) || "1", 10) || 1);
  const perPage = Math.max(1, Math.min(parseInt((opts && opts.perPage) || "10", 10) || 10, 50));
  const nameFilter = String((opts && opts.pharmacyName) || "").trim().toLowerCase();
  const addressFilter = String((opts && opts.address) || "").trim().toLowerCase();

  if (ptype === "online") {
    let items = ONLINE_PHARMACY_CATALOG.slice();
    if (nameFilter) items = items.filter((p) => p.name.toLowerCase().includes(nameFilter));
    const total = items.length;
    const start = (page - 1) * perPage;
    return {
      items: items.slice(start, start + perPage),
      total,
      result_count: total,
      page,
      perPage,
    };
  }

  const zip = parseZip(opts && opts.zipCode);
  if (!zip) return { error: "zip_invalid", items: [], total: 0, result_count: 0, page: 1, perPage };
  const geo = await geocodeZipCached(zip);
  if (!geo) return { error: "zip_invalid", items: [], total: 0, result_count: 0, page: 1, perPage };

  const name = String((opts && opts.pharmacyName) || "").trim();
  const baseParams = new URLSearchParams({
    version: "2.1",
    limit: "200",
    taxonomy_description: "Pharmacy",
    postal_code: zip,
  });
  if (name.length >= 2) baseParams.set("organization_name", name);

  let results = await fetchNpiPharmacies(baseParams);
  if (!results.length && name.length >= 2) {
    const fallbackParams = new URLSearchParams({
      version: "2.1",
      limit: "200",
      taxonomy_description: "Pharmacy",
      postal_code: zip,
    });
    results = await fetchNpiPharmacies(fallbackParams);
  }

  let items = [];

  for (const r of results) {
    const addr =
      (r.addresses || []).find(function (a) {
        return a.address_purpose === "LOCATION";
      }) ||
      (r.addresses || [])[0] ||
      {};
    const displayName = pharmacyDisplayName(r);
    const hay = pharmacySearchHaystack(r, displayName, addr);

    if (nameFilter && !hay.includes(nameFilter)) continue;
    if (addressFilter && !hay.includes(addressFilter)) continue;

    const locZip = parseZip(addr.postal_code) || zip;
    const dist = await distanceMilesBetweenZips(zip, locZip);
    if (dist !== null && dist > radius) continue;

    items.push({
      npi: String(r.number || ""),
      name: displayName,
      address_line: [addr.address_1, addr.address_2].filter(Boolean).join(", "),
      city: addr.city || geo.city || "",
      state: addr.state || geo.state || "",
      zip: locZip,
      phone: addr.telephone_number || "",
      pharmacy_type: ptype,
      lat: geo.lat ?? null,
      lng: geo.lng ?? null,
      distance_miles: dist != null ? Math.round(dist * 10) / 10 : null,
    });
  }

  items.sort(function (a, b) {
    const da = a.distance_miles != null ? a.distance_miles : 9999;
    const db = b.distance_miles != null ? b.distance_miles : 9999;
    if (Math.abs(da - db) > 1) return da - db;
    const pa = pharmacyChainPriority(a.name);
    const pb = pharmacyChainPriority(b.name);
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });

  const total = items.length;
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total,
    result_count: total,
    page,
    perPage,
  };
}

const { searchIcConditionCatalog, searchIcConditionCatalogWords, nameMatchesQueryWords } = require("./ic-condition-catalog");
const { resolveConditionSearchQuery } = require("./condition-search-es");

async function searchConditions(term) {
  const qRaw = String(term || "").trim();
  const q = resolveConditionSearchQuery(qRaw);
  if (q.length < 2) return { items: [], result_count: 0 };

  const out = [];
  const seen = new Set();
  const qLower = q.toLowerCase();
  const WORD_TIER_THRESHOLD = 5;
  const PRIORITY_WORD_CATALOG = 0;
  const PRIORITY_WORD_REGEN = 10;
  const PRIORITY_WORD_ICD = 30;
  const PRIORITY_SEM_CATALOG = 50;
  const PRIORITY_SEM_REGEN = 80;
  const PRIORITY_SEM_ICD = 130;
  const DISPLAY_CAP = 200;

  const SEARCH_EXPANSIONS = {
    sugar: ["sugar", "glucose", "galactose", "hyperosmolar", "hypoglycem", "sucrose", "glycemic", "glycosuria", "fructose"],
    high: ["high", "hypertension", "hyperlipid", "cholesterol", "hyperglycem"],
    dia: ["dia", "diaper", "diarrhea", "diabetic"],
    diabetes: ["diabetes", "diabetic", "prediabetes", "hyperglycem", "mellitus", "insipidus"],
    broken: ["broken", "pain", "weakness", "fracture", "injury", "bedridden"],
    broken_bone: ["broken bone", "fracture", "bone", "crush", "osteomyelitis", "tendon", "rupture", "injury"],
    copd: ["copd", "chronic obstructive pulmonary", "pulmonary", "obstructive", "emphysema", "chronic lung", "bronchitis", "cld"],
    afib: ["afib", "atrial fibrillation", "atrial flutter", "fibrillation", "arrhythmia"],
    chf: ["chf", "congestive heart failure", "heart failure", "cardiac failure", "systolic", "diastolic"],
    blood_thinner: ["blood thinner", "anticoagul", "warfarin", "clopidogrel", "coumadin", "eliquis", "xarelto"],
    ms: ["ms", "multiple sclerosis", "sclerosis", "demyelinating"],
    adhd: ["adhd", "add", "attention deficit", "hyperactivity"],
    autism: ["autism", "asd", "asperger", "autistic"],
    ptsd: ["ptsd", "post-traumatic", "trauma", "stress disorder"],
    alzheimer: ["alzheimer", "alzheimers", "dementia", "cognitive"],
    cholesterol: ["cholesterol", "hyperlipid", "hypercholesterol", "lipid", "ldl", "hdl"],
    pacemaker: ["pacemaker", "cardiac pacemaker", "cardiac device"],
    fibromyalgia: ["fibromyalgia", "myofascial", "chronic pain", "widespread pain"],
    heart: ["heart", "cardiac", "coronary", "myocardial", "cardiomyopathy", "murmur"],
    cpap: ["cpap", "sleep apnea", "apnea", "obstructive sleep", "nebulizer", "hypopnea"],
    ckd: ["ckd", "chronic kidney", "kidney disease", "renal", "nephropathy", "proteinuria", "albuminuria"],
    hospice: ["hospice", "nursing home", "assisted living", "skilled nursing", "long term care", "palliative"],
    hip_replacement: [
      "hip replacement",
      "knee replacement",
      "joint replacement",
      "prosthesis",
      "implant",
      "procedure",
      "surgery",
      "complication",
    ],
    memory_loss: ["memory loss", "memory", "amnesia", "alzheimer", "dementia", "cognitive", "impairment", "wernicke", "korsakoff"],
    low_testosterone: ["low testosterone", "testosterone", "hypogonadism", "testicular", "oligospermia", "androgen", "atrophy"],
  };

  function expansionKeyForQuery() {
    if (qLower === "dia" || (qLower.startsWith("dia") && qLower.length <= 4)) return "dia";
    if (qLower.startsWith("diabetes") || qLower.startsWith("diabetic") || qLower.startsWith("prediabetes")) {
      return "diabetes";
    }
    if (qLower.includes("broken") && qLower.includes("bone")) return "broken_bone";
    if (qLower.startsWith("broken")) return "broken";
    if (qLower === "copd" || qLower.startsWith("copd")) return "copd";
    if (qLower === "afib" || qLower.startsWith("afib")) return "afib";
    if (qLower === "chf" || qLower.startsWith("chf")) return "chf";
    if (qLower.includes("blood thinner") || qLower.includes("thin blood")) return "blood_thinner";
    if (qLower === "ms") return "ms";
    if (qLower === "adhd" || qLower.startsWith("adhd")) return "adhd";
    if (qLower === "autism" || qLower.startsWith("autism")) return "autism";
    if (qLower === "ptsd" || qLower.startsWith("ptsd")) return "ptsd";
    if (qLower.startsWith("alzheimer")) return "alzheimer";
    if (qLower.startsWith("cholesterol")) return "cholesterol";
    if (qLower.startsWith("pacemaker")) return "pacemaker";
    if (qLower.startsWith("fibromyalgia")) return "fibromyalgia";
    if (qLower === "heart" || (qLower.startsWith("heart") && qLower.length <= 6)) return "heart";
    if (qLower === "cpap" || qLower.startsWith("cpap")) return "cpap";
    if (qLower === "ckd" || qLower.startsWith("ckd")) return "ckd";
    if (qLower.startsWith("hospice")) return "hospice";
    if (qLower.includes("hip replacement") || qLower.includes("knee replacement")) return "hip_replacement";
    if (qLower.includes("memory loss") || qLower === "memory") return "memory_loss";
    if (qLower.includes("low") && qLower.includes("testosterone")) return "low_testosterone";
    if (qLower.startsWith("sugar")) return "sugar";
    if (qLower.startsWith("high")) return "high";
    return null;
  }

  function expansionTermsList() {
    const key = expansionKeyForQuery();
    if (!key) return [q];
    const terms = SEARCH_EXPANSIONS[key].slice();
    if (!terms.includes(q)) terms.unshift(q);
    return terms;
  }

  function formatConditionDisplayName(name) {
    const s = String(name || "").trim();
    if (!s) return "";
    return s.replace(/\b([a-z])/g, function (_m, c, offset) {
      if (offset === 0 || /[\s(/-]/.test(s.charAt(offset - 1))) return c.toUpperCase();
      return c;
    });
  }

  function normalizeRegenstriefName(name) {
    let s = String(name || "").trim();
    if (!s) return "";
    if (/^high blood pressure/i.test(s)) return "High Blood Pressure / Hypertension";
    const highSuffix = s.match(/^(.+?)\s+-\s+high\b/i);
    if (highSuffix) return formatConditionDisplayName("High " + highSuffix[1].trim());
    if (/^foot ulcer\s*-\s*diabetic/i.test(s)) return "Diabetic Foot Ulcer";
    if (/^neuropathy\s*-\s*diabetic/i.test(s)) return "Diabetic Neuropathy";
    if (/^retinopathy\s*-\s*diabetic/i.test(s)) return "Diabetic Retinopathy";
    if (/^blood sugar\s*-\s*high/i.test(s)) return "Blood Sugar - High";
    if (/^blood sugar\s*-\s*low/i.test(s)) return "Blood Sugar - Low";
    if (/^lipids\s*-\s*high/i.test(s)) return "High Cholesterol";
    if (/^copd\s*-\s*exacerbation|copd exacerbation/i.test(s)) return "COPD Exacerbation";
    if (/^chronic obstructive pulmonary disease/i.test(s)) {
      return s.match(/\(COPD\)/i)
        ? "Chronic Obstructive Pulmonary Disease (COPD)"
        : "Chronic Obstructive Pulmonary Disease";
    }
    if (/^chronic lung disease/i.test(s)) {
      return s.match(/\(CLD\)/i) ? "Chronic Lung Disease (CLD)" : "Chronic Lung Disease";
    }
    return formatConditionDisplayName(s);
  }

  function shortenIcdConditionName(raw) {
    const s = String(raw || "").trim();
    const lower = s.toLowerCase();
    if (/diaper dermatitis/.test(lower)) return "Diaper Dermatitis";
    if (/macular edema/.test(lower)) return "Diabetic Macular Edema";
    if (/diabetic foot ulcer|foot ulcer.*diabet/.test(lower)) return "Diabetic Foot Ulcer";
    if (/hyperosmolar.*hyperglycemic|hyperglycemic.*hyperosmolar/.test(lower)) {
      return "Hyperosmolar Hyperglycemic State";
    }
    if (/galactosemia/.test(lower)) return "Galactosemia";
    if (/high output.*heart failure/.test(lower)) return "High Output Acute Heart Failure";
    if (/type [12] diabetes mellitus|diabetes mellitus due to|gestational diabetes mellitus/.test(lower)) {
      return null;
    }
    if (/drug or chemical induced diabetes|poisoning by insulin|underdosing of insulin/.test(lower)) {
      return null;
    }
    if (/^other chronic obstructive pulmonary disease$/.test(lower)) return "Chronic Obstructive Pulmonary Disease";
    if (/^other specified chronic obstructive pulmonary disease$/.test(lower)) {
      return "Chronic Obstructive Pulmonary Disease";
    }
    if (/^unspecified chronic obstructive pulmonary disease$/.test(lower)) {
      return "Chronic Obstructive Pulmonary Disease";
    }
    if (/^chronic obstructive pulmonary disease with/.test(lower)) return null;
    if (/^personal history of.*copd|history of.*copd/.test(lower)) return null;
    if (/^nicotine dependence.*copd|copd.*nicotine/.test(lower)) return null;
    if (s.length > 65) return null;
    return formatConditionDisplayName(s);
  }

  function shouldSkipSupplementalCondition(name, icCatalogMatches) {
    const lower = String(name || "").toLowerCase();
    const expKey = expansionKeyForQuery();
    if ((qLower === "afib" || qLower.startsWith("afib")) && /afibrinogenemia/.test(lower)) return true;
    if (qLower === "ms") {
      if (/maple syrup|medullary sponge|\(msk\)|\(msud\)/.test(lower)) return true;
      if (icCatalogMatches.length >= 3 && !/multiple sclerosis|\(ms\)/.test(lower)) return true;
    }
    if (expKey === "heart" && icCatalogMatches.length >= 5 && /^heartburn$/.test(lower)) return true;
    if (expKey === "pacemaker" && icCatalogMatches.length >= 3 && /encounter for (adjustment|checking|testing)/.test(lower)) {
      return true;
    }
    if (expKey === "autism" && icCatalogMatches.length >= 3 && /encounter for autism screening/.test(lower)) return true;
    if (expKey === "adhd" && icCatalogMatches.length >= 3 && /drug addiction|addisonian/.test(lower)) return true;
    if (
      expKey === "ptsd" &&
      icCatalogMatches.length >= 3 &&
      /trauma/.test(lower) &&
      !/post-traumatic|ptsd|stress disorder|combat stress/.test(lower)
    ) {
      return true;
    }
    if (expKey === "heart" && icCatalogMatches.length >= 5 && /high output.*heart failure/.test(lower)) return true;
    if (expKey === "cholesterol" && icCatalogMatches.length >= 5 && /cholesterolosis|bile acid.*cholesterol metabolism/.test(lower)) {
      return true;
    }
    if (
      qLower.startsWith("broken") &&
      icCatalogMatches.length >= 5 &&
      /broken internal.*prosthesis/i.test(lower)
    ) {
      return true;
    }
    if (expKey === "low_testosterone" && icCatalogMatches.length >= 3 && /blood sugar.*low|hypoglycem/.test(lower)) {
      return true;
    }
    return false;
  }

  function conditionMatchesQueryWords(name) {
    const lower = String(name || "").toLowerCase();
    if (!nameMatchesQueryWords(lower, qLower)) return false;
    return !shouldSkipWordTierCondition(lower);
  }

  function shouldSkipWordTierCondition(lower) {
    if ((qLower === "afib" || qLower.startsWith("afib")) && /afibrinogenemia/.test(lower)) return true;
    if (qLower === "ms") {
      if (/maple syrup|medullary sponge|\(msk\)|\(msud\)/.test(lower)) return true;
      if (lower === "ms") return false;
      if (!/multiple sclerosis|\(ms\)/.test(lower)) return true;
    }
    return false;
  }

  function conditionMatchesQuery(name) {
    const lower = String(name || "").toLowerCase();
    if (lower.includes(qLower)) return true;
    const qWords = qLower.split(/\s+/).filter(function (w) {
      return w.length >= 3;
    });
    if (qWords.length > 1 && qWords.every(function (w) {
      return lower.includes(w);
    })) {
      return true;
    }
    const expansions = expansionTermsList();
    if (expansions.length <= 1) return false;
    return expansions.some(function (term) {
      const t = String(term || "").toLowerCase();
      return t !== qLower && t.length >= 3 && lower.includes(t);
    });
  }

  function matchScore(name) {
    const lower = name.toLowerCase();
    const words = lower.split(/[\s/()-]+/).filter(Boolean);
    if (lower.startsWith(qLower)) return 0;
    if (words.some(function (w) {
      return w.startsWith(qLower);
    })) {
      return 1;
    }
    if (new RegExp("\\b" + qLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(lower)) {
      return 2;
    }
    if (lower.includes(qLower)) return 3;
    return 4;
  }

  function priorityBand(priority) {
    const p = priority != null ? priority : 50;
    if (p < 50) return 0;
    if (p < 80) return 1;
    if (p < 130) return 2;
    return 3;
  }

  function tryAddCondition(name, icd10Code, priority) {
    const display = formatConditionDisplayName(String(name || "").trim());
    if (!display || display.length > 140) return;
    const key = display.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      name: display,
      icd10_code: icd10Code ? String(icd10Code) : null,
      _priority: priority != null ? priority : 50,
    });
  }

  /* Tier 1 — word search (raw query only) */
  searchIcConditionCatalogWords(q).forEach(function (entry, idx) {
    tryAddCondition(entry.name, entry.icd10_code, PRIORITY_WORD_CATALOG + idx);
  });

  try {
    const data = await fetchJson(
      `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encodeURIComponent(q)}&maxList=200&df=consumer_name,primary_name,term_icd10_code`
    );
    const rows = Array.isArray(data[3]) ? data[3] : [];
    rows.forEach(function (row, idx) {
      const consumerName = String((row && row[0]) || "").trim();
      const primaryName = String((row && row[1]) || "").trim();
      const icd10 = String((row && row[2]) || "").trim();
      const normalized = normalizeRegenstriefName(consumerName || primaryName);
      if (!normalized || !conditionMatchesQueryWords(normalized)) return;
      tryAddCondition(normalized, icd10, PRIORITY_WORD_REGEN + idx);
    });
  } catch (_) {
    /* conditions list optional */
  }

  try {
    const icd = await fetchJson(
      `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=name&terms=${encodeURIComponent(q)}&maxList=200`
    );
    const codes = Array.isArray(icd[1]) ? icd[1] : [];
    const names = Array.isArray(icd[3]) ? icd[3] : [];
    for (let i = 0; i < codes.length; i++) {
      const code = String(codes[i] || "");
      const nameArr = names[i];
      const rawName = Array.isArray(nameArr)
        ? String(nameArr[1] || nameArr[0] || "")
        : String(nameArr || code);
      const shortName = shortenIcdConditionName(rawName) || formatConditionDisplayName(rawName);
      if (!shortName || !conditionMatchesQueryWords(shortName)) continue;
      if (shortName.length > 100) continue;
      tryAddCondition(shortName, code, PRIORITY_WORD_ICD + i);
    }
  } catch (_) {
    /* ICD-10 supplement optional */
  }

  /* Tier 2 — semantic fallback when word tier is sparse */
  if (out.length < WORD_TIER_THRESHOLD) {
    const icCatalogMatches = searchIcConditionCatalog(q);

    icCatalogMatches.forEach(function (entry, idx) {
      tryAddCondition(entry.name, entry.icd10_code, PRIORITY_SEM_CATALOG + idx);
    });

    for (const term of expansionTermsList()) {
      try {
        const semData = await fetchJson(
          `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${encodeURIComponent(term)}&maxList=200&df=consumer_name,primary_name,term_icd10_code`
        );
        const semRows = Array.isArray(semData[3]) ? semData[3] : [];
        semRows.forEach(function (row, idx) {
          const consumerName = String((row && row[0]) || "").trim();
          const primaryName = String((row && row[1]) || "").trim();
          const icd10 = String((row && row[2]) || "").trim();
          const normalized = normalizeRegenstriefName(consumerName || primaryName);
          if (!normalized || !conditionMatchesQuery(normalized)) return;
          if (shouldSkipSupplementalCondition(normalized, icCatalogMatches)) return;
          tryAddCondition(normalized, icd10, PRIORITY_SEM_REGEN + idx);
        });
      } catch (_) {
        /* conditions list optional */
      }
    }

    for (const term of expansionTermsList()) {
      try {
        const semIcd = await fetchJson(
          `https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=name&terms=${encodeURIComponent(term)}&maxList=200`
        );
        const semCodes = Array.isArray(semIcd[1]) ? semIcd[1] : [];
        const semNames = Array.isArray(semIcd[3]) ? semIcd[3] : [];
        for (let i = 0; i < semCodes.length; i++) {
          const code = String(semCodes[i] || "");
          const nameArr = semNames[i];
          const rawName = Array.isArray(nameArr)
            ? String(nameArr[1] || nameArr[0] || "")
            : String(nameArr || code);
          const shortName = shortenIcdConditionName(rawName) || formatConditionDisplayName(rawName);
          if (!shortName || !conditionMatchesQuery(shortName)) continue;
          if (shortName.length > 100) continue;
          if (shouldSkipSupplementalCondition(shortName, icCatalogMatches)) continue;
          tryAddCondition(shortName, code, PRIORITY_SEM_ICD + i);
        }
      } catch (_) {
        /* ICD-10 supplement optional */
      }
    }
  }

  out.sort(function (a, b) {
    const ba = priorityBand(a._priority);
    const bb = priorityBand(b._priority);
    if (ba !== bb) return ba - bb;
    const pa = a._priority != null ? a._priority : 50;
    const pb = b._priority != null ? b._priority : 50;
    if (pa !== pb) return pa - pb;

    const sa = matchScore(a.name);
    const sb = matchScore(b.name);
    if (sa !== sb) return sa - sb;
    if (a.name.length !== b.name.length) return a.name.length - b.name.length;
    return a.name.localeCompare(b.name);
  });

  const items = out.slice(0, 60).map(function (item) {
    return {
      name: item.name,
      icd10_code: item.icd10_code,
    };
  });
  const result_count = Math.min(out.length, DISPLAY_CAP);
  return { items, result_count };
}

module.exports = {
  parseZip,
  geocodeZip,
  searchDrugs,
  searchDrugDosages,
  searchProviders,
  searchPharmacies,
  searchConditions,
};
