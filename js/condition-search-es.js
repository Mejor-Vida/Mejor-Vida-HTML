(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.MiConditionSearchEs = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function stripAccents(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function norm(s) {
    var t = stripAccents(String(s || "").trim().toLowerCase());
    // Common misspellings / French-English variants clients type in Spanish UI
    t = t.replace(/\bpression\b/g, "presion");
    t = t.replace(/\bdiabetis\b/g, "diabetes");
    t = t.replace(/\bcorason\b/g, "corazon");
    return t;
  }

  var PHRASE_MAP = {
    "presion alta": "high blood pressure",
    "alta presion": "high blood pressure",
    "presion alta de sangre": "high blood pressure",
    "alta presion de sangre": "high blood pressure",
    "presion arterial alta": "high blood pressure",
    "azucar alta": "diabetes",
    "azucar en la sangre": "blood sugar",
    "nivel de azucar": "blood sugar",
    "enfermedad del corazon": "heart disease",
    "insuficiencia cardiaca": "heart failure",
    "fibrilacion auricular": "atrial fibrillation",
    "dolor de espalda": "back pain",
    "dolor en la espalda": "back pain",
    "hueso roto": "broken bone",
    "fractura de hueso": "broken bone",
    "perdida de memoria": "memory loss",
    "problemas de memoria": "memory loss",
    "enfermedad renal": "kidney disease",
    "apnea del sueno": "sleep apnea",
    "apnea de sueno": "sleep apnea",
    "colesterol alto": "high cholesterol",
    "derrame cerebral": "stroke",
    "ataque al corazon": "heart attack",
    "ataque cardiaco": "heart attack",
    "infarto al corazon": "heart attack",
    "infarto de miocardio": "heart attack",
    "delgador de la sangre": "blood thinner",
    "sangre delgada": "blood thinner",
    "esclerosis multiple": "multiple sclerosis",
    "deficit de atencion": "adhd",
    "estres postraumatico": "ptsd",
    "enfermedad de alzheimer": "alzheimer",
    "enfermedad pulmonar obstructiva": "copd",
    "enfermedad pulmonar cronica": "copd",
    "reemplazo de cadera": "hip replacement",
    "reemplazo de rodilla": "knee replacement",
    "testosterona baja": "low testosterone",
    "cuidados paliativos": "hospice",
    "hogar de ancianos": "nursing home",
    "vivienda asistida": "assisted living",
  };

  var WORD_MAP = {
    hueso: "bone",
    huesos: "bone",
    fractura: "fracture",
    fracturas: "fracture",
    roto: "broken",
    rota: "broken",
    corazon: "heart",
    cardiaca: "heart",
    cardiaco: "heart",
    rinon: "kidney",
    rinones: "kidney",
    renal: "kidney",
    pulmon: "lung",
    pulmones: "lung",
    pulmonar: "pulmonary",
    azucar: "sugar",
    glucosa: "glucose",
    presion: "blood pressure",
    hipertension: "hypertension",
    alta: "high",
    alto: "high",
    baja: "low",
    bajo: "low",
    sangre: "blood",
    colesterol: "cholesterol",
    marcapasos: "pacemaker",
    artritis: "arthritis",
    asma: "asthma",
    cancer: "cancer",
    demencia: "dementia",
    alzheimer: "alzheimer",
    depresion: "depression",
    ansiedad: "anxiety",
    tiroides: "thyroid",
    fibromialgia: "fibromyalgia",
    osteoporosis: "osteoporosis",
    anemia: "anemia",
    obesidad: "obesity",
    dolor: "pain",
    tabaco: "tobacco",
    fumar: "tobacco",
    diabetes: "diabetes",
    diabetico: "diabetes",
    diabetica: "diabetes",
    epoc: "copd",
    apnea: "apnea",
    sueno: "sleep",
    higado: "liver",
    espalda: "back",
    espaldas: "back",
    cabeza: "head",
    cabezas: "head",
    rodilla: "knee",
    rodillas: "knee",
    cadera: "hip",
    hombro: "shoulder",
    cuello: "neck",
    pecho: "chest",
    pierna: "leg",
    brazo: "arm",
    pie: "foot",
    mano: "hand",
    ojo: "eye",
    oido: "ear",
    garganta: "throat",
    cerebro: "brain",
    estomago: "stomach",
    colon: "colon",
    prostata: "prostate",
    convulsion: "seizure",
    convulsiones: "seizure",
    epilepsia: "epilepsy",
    embarazo: "pregnancy",
    embarazada: "pregnancy",
    autismo: "autism",
    bipolar: "bipolar",
    esquizofrenia: "schizophrenia",
    hepatitis: "hepatitis",
    cirrosis: "cirrhosis",
    infarto: "heart attack",
    derrame: "stroke",
    trombosis: "thrombosis",
    coagulacion: "blood thinner",
    anticoagulante: "blood thinner",
    warfarina: "warfarin",
    insulina: "insulin",
    hipotiroidismo: "hypothyroidism",
    hipertiroidismo: "hyperthyroidism",
    lupus: "lupus",
    psoriasis: "psoriasis",
    celiaca: "celiac",
    celiaco: "celiac",
    gastritis: "gastritis",
    ulcera: "ulcer",
    reflujo: "reflux",
    migraña: "migraine",
    migrana: "migraine",
  };

  function resolveConditionSearchQuery(term) {
    var raw = String(term || "").trim();
    if (!raw) return raw;

    var n = norm(raw);
    if (n.length < 2) return raw;

    var phraseEntries = Object.keys(PHRASE_MAP).sort(function (a, b) {
      return b.length - a.length;
    });
    for (var i = 0; i < phraseEntries.length; i++) {
      var phrase = phraseEntries[i];
      if (n === phrase || n.indexOf(phrase) >= 0) {
        return PHRASE_MAP[phrase];
      }
    }

    var words = n.split(/\s+/).filter(Boolean);
    if (!words.length) return raw;

    var mappedAny = false;
    var translated = words.map(function (w) {
      var en = WORD_MAP[w];
      if (en) {
        mappedAny = true;
        return en;
      }
      return w;
    });

    if (mappedAny) {
      return translated.join(" ");
    }

    return raw;
  }

  function isLikelySpanishQuery(term) {
    var raw = String(term || "").trim();
    if (/[ñáéíóúü¿¡]/i.test(raw)) return true;
    var n = norm(raw);
    if (PHRASE_MAP[n]) return true;
    var words = n.split(/\s+/).filter(Boolean);
    return words.some(function (w) {
      return !!WORD_MAP[w];
    });
  }

  function queryDiffersFromTranslation(term) {
    var raw = String(term || "").trim();
    if (!raw) return false;
    var en = resolveConditionSearchQuery(raw);
    return norm(en) !== norm(raw);
  }

  return {
    resolveConditionSearchQuery: resolveConditionSearchQuery,
    isLikelySpanishQuery: isLikelySpanishQuery,
    queryDiffersFromTranslation: queryDiffersFromTranslation,
    PHRASE_MAP: PHRASE_MAP,
    WORD_MAP: WORD_MAP,
  };
});
