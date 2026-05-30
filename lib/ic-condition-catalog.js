/**
 * Curated IC-style problem names for medical intake condition search parity.
 * Integrity Connect uses IMO Problem IT; we approximate with hand-mapped intake terms.
 */
const IC_CONDITIONS = [
  { name: "Diabetes", tokens: ["diabetes"] },
  {
    name: "Diabetes When Coadministered With Certain Medications",
    tokens: ["diabetes", "coadministered"],
  },
  { name: "Diabetes Mellitus", tokens: ["diabetes", "diabetes mellitus"] },
  { name: "Diabetes Insipidus", tokens: ["diabetes insipidus", "diabetes"] },
  { name: "Prediabetes", tokens: ["prediabetes", "diabetes"] },
  { name: "Diaper Dermatitis", icd10_code: "L22", tokens: ["diaper"] },
  { name: "Diabetic Macular Edema", tokens: ["diabetic", "macular", "edema"] },
  { name: "Diabetic Limb Ischemia", tokens: ["diabetic", "limb", "ischemia"] },
  { name: "Diabetic Amputation", tokens: ["diabetic", "amputation"] },
  { name: "Diabetic Foot Ulcer", icd10_code: "Z87.891", tokens: ["diabetic", "foot", "ulcer"] },
  { name: "Diabetic Ketoacidosis (DKA)", tokens: ["diabetic", "dka", "keto"] },
  { name: "Diabetes Mellitus (DM)", tokens: ["diabetes mellitus", "diabetes"] },
  { name: "High Blood Pressure / Hypertension", tokens: ["high", "hypertension", "htn", "blood pressure"] },
  { name: "High Cholesterol", tokens: ["high", "cholesterol", "hyperlipid"] },
  { name: "High Output Acute Heart Failure", tokens: ["high", "heart failure", "output"] },
  { name: "Sucrose Hypersensitivity", tokens: ["sugar", "sucrose"] },
  { name: "Blood Glucose Support", tokens: ["sugar", "glucose", "blood sugar"] },
  { name: "Galactosemia", tokens: ["sugar", "galactose"] },
  { name: "Hyperosmolar Hyperglycemic State", tokens: ["sugar", "hyperosmolar", "hyperglycemic", "glucose"] },
  { name: "Galactose-free Diet", tokens: ["sugar", "galactose", "diet"] },
  { name: "Glucose Intolerance", tokens: ["sugar", "glucose", "glycemic"] },
  { name: "Glycosuria", tokens: ["sugar", "glucose", "glycosuria"] },
  { name: "Blood Sugar - High", tokens: ["sugar", "high", "glucose", "hyperglycem"] },
  { name: "Blood Sugar - Low", tokens: ["sugar", "low", "glucose", "hypoglycem"] },
  { name: "Bedridden", group: "broken", tokens: ["broken"] },
  { name: "Awaiting Surgery", group: "broken", tokens: ["broken", "surgery"] },
  { name: "Incarcerated", group: "broken", tokens: ["broken"] },
  { name: "Pain", group: "broken", tokens: ["broken", "pain"] },
  { name: "Weakness", group: "broken", tokens: ["broken", "weakness"] },
  { name: "Bone Fractures", group: "broken_bone", tokens: ["broken bone", "fracture", "bone"] },
  { name: "Bone Pain", group: "broken_bone", tokens: ["broken bone", "bone pain", "bone"] },
  { name: "Crush Injury", group: "broken_bone", tokens: ["broken bone", "crush", "injury"] },
  { name: "Osteomyelitis", group: "broken_bone", tokens: ["broken bone", "osteomyelitis"] },
  { name: "Tendon Rupture", group: "broken_bone", tokens: ["broken bone", "tendon", "rupture"] },
  { name: "Chronic Obstructive Pulmonary Disease (COPD)", group: "copd", tokens: ["copd", "chronic obstructive pulmonary"] },
  { name: "Copd", group: "copd", tokens: ["copd"] },
  { name: "Chronic Obstructive Pulmonary Disease", group: "copd", tokens: ["copd", "chronic obstructive pulmonary"] },
  { name: "Chronic Lung Disease (CLD)", group: "copd", tokens: ["copd", "chronic lung", "cld"] },
  { name: "Chronic Lung Disease", group: "copd", tokens: ["copd", "chronic lung"] },
  { name: "Atrial Fibrillation (AFib)", group: "afib", tokens: ["afib", "atrial fibrillation"] },
  { name: "Afib", group: "afib", tokens: ["afib"] },
  { name: "Atrial Fibrillation", group: "afib", tokens: ["afib", "atrial fibrillation"] },
  { name: "Atrial Flutter", group: "afib", tokens: ["afib", "flutter", "atrial"] },
  { name: "Paroxysmal Atrial Fibrillation", group: "afib", tokens: ["afib", "paroxysmal", "atrial fibrillation"] },
  { name: "Congestive Heart Failure (CHF)", group: "chf", tokens: ["chf", "congestive heart failure"] },
  { name: "Chf", group: "chf", tokens: ["chf"] },
  { name: "Heart Failure", group: "chf", tokens: ["chf", "heart failure"] },
  { name: "Congestive Heart Failure", group: "chf", tokens: ["chf", "heart failure", "congestive"] },
  { name: "Chronic Heart Failure", group: "chf", tokens: ["chf", "heart failure", "chronic"] },
  { name: "Blood Thinners", group: "blood_thinner", tokens: ["blood thinner", "anticoagul"] },
  { name: "Anticoagulant Therapy", group: "blood_thinner", tokens: ["blood thinner", "anticoagul"] },
  { name: "Warfarin Use", group: "blood_thinner", tokens: ["blood thinner", "warfarin"] },
  { name: "Blood Thinner Medication", group: "blood_thinner", tokens: ["blood thinner"] },
  { name: "Clopidogrel Use", group: "blood_thinner", tokens: ["blood thinner", "clopidogrel", "plavix"] },
  { name: "Multiple Sclerosis (MS)", group: "ms", tokens: ["ms", "multiple sclerosis"] },
  { name: "Ms", group: "ms", tokens: ["ms"] },
  { name: "Multiple Sclerosis", group: "ms", tokens: ["ms", "multiple sclerosis"] },
  { name: "Relapsing Remitting Multiple Sclerosis", group: "ms", tokens: ["ms", "multiple sclerosis"] },
  { name: "Primary Progressive Multiple Sclerosis", group: "ms", tokens: ["ms", "multiple sclerosis"] },
  { name: "Attention Deficit Hyperactivity Disorder (ADHD/ADD)", group: "adhd", tokens: ["adhd", "add", "attention deficit"] },
  { name: "Adhd", group: "adhd", tokens: ["adhd"] },
  { name: "Add", group: "adhd", tokens: ["adhd", "add", "attention deficit"] },
  { name: "Attention Deficit Disorder", group: "adhd", tokens: ["adhd", "add", "attention deficit"] },
  { name: "Attention Deficit Hyperactivity Disorder", group: "adhd", tokens: ["adhd", "attention deficit"] },
  { name: "Autism Spectrum Disorder (ASD)", group: "autism", tokens: ["autism", "asd"] },
  { name: "Autism", group: "autism", tokens: ["autism"] },
  { name: "Autism Spectrum Disorder", group: "autism", tokens: ["autism", "asd"] },
  { name: "Asperger Syndrome", group: "autism", tokens: ["autism", "asperger"] },
  { name: "Autistic Disorder", group: "autism", tokens: ["autism", "autistic"] },
  { name: "Post-Traumatic Stress Disorder (PTSD)", group: "ptsd", tokens: ["ptsd", "post-traumatic"] },
  { name: "Ptsd", group: "ptsd", tokens: ["ptsd"] },
  { name: "Post-Traumatic Stress Disorder", group: "ptsd", tokens: ["ptsd", "post-traumatic"] },
  { name: "Combat Stress", group: "ptsd", tokens: ["ptsd", "post-traumatic", "combat"] },
  { name: "Trauma Related Stress", group: "ptsd", tokens: ["ptsd", "trauma"] },
  { name: "Alzheimer's Disease", group: "alzheimer", tokens: ["alzheimer", "alzheimers"] },
  { name: "Alzheimers", group: "alzheimer", tokens: ["alzheimer", "alzheimers"] },
  { name: "Alzheimer's Disease With Early Onset", group: "alzheimer", tokens: ["alzheimer", "early onset"] },
  { name: "Alzheimer's Disease With Late Onset", group: "alzheimer", tokens: ["alzheimer", "late onset"] },
  { name: "Senile Dementia Of Alzheimer Type", group: "alzheimer", tokens: ["alzheimer", "dementia"] },
  { name: "Hypercholesterolemia", group: "cholesterol", tokens: ["cholesterol", "hypercholesterol"] },
  { name: "Hyperlipidemia", group: "cholesterol", tokens: ["cholesterol", "lipid", "hyperlipid"] },
  { name: "Elevated Cholesterol", group: "cholesterol", tokens: ["cholesterol", "elevated"] },
  { name: "Cholesterol - High", group: "cholesterol", tokens: ["cholesterol", "high"] },
  { name: "Lipid Disorder", group: "cholesterol", tokens: ["cholesterol", "lipid"] },
  { name: "Presence Of Cardiac Pacemaker", group: "pacemaker", tokens: ["pacemaker"] },
  { name: "Pacemaker", group: "pacemaker", tokens: ["pacemaker"] },
  { name: "Cardiac Pacemaker In Situ", group: "pacemaker", tokens: ["pacemaker", "cardiac"] },
  { name: "Pacemaker Dependence", group: "pacemaker", tokens: ["pacemaker"] },
  { name: "Fibromyalgia", group: "fibromyalgia", tokens: ["fibromyalgia"] },
  { name: "Fibromyalgia Syndrome", group: "fibromyalgia", tokens: ["fibromyalgia"] },
  { name: "Chronic Pain Syndrome", group: "fibromyalgia", tokens: ["fibromyalgia", "chronic pain"] },
  { name: "Myofascial Pain Syndrome", group: "fibromyalgia", tokens: ["fibromyalgia", "myofascial"] },
  { name: "Widespread Pain", group: "fibromyalgia", tokens: ["fibromyalgia", "pain"] },
  { name: "Heart Attack", group: "heart", tokens: ["heart", "myocardial", "infarction"] },
  { name: "Heart Disease", group: "heart", tokens: ["heart"] },
  { name: "Coronary Artery Disease", group: "heart", tokens: ["heart", "coronary"] },
  { name: "Heart Murmur", group: "heart", tokens: ["heart", "murmur"] },
  { name: "Cardiomyopathy", group: "heart", tokens: ["heart", "cardiomyopathy"] },
  { name: "Obstructive Sleep Apnea", group: "cpap", tokens: ["cpap", "sleep apnea", "apnea"] },
  { name: "Sleep Apnea", group: "cpap", tokens: ["cpap", "sleep apnea"] },
  { name: "Apnea", group: "cpap", tokens: ["cpap", "apnea"] },
  { name: "Nebulizer Use", group: "cpap", tokens: ["cpap", "nebulizer"] },
  { name: "Complex Sleep-related Behaviors", group: "cpap", tokens: ["cpap", "sleep"] },
  { name: "Persistent Albuminuria", group: "ckd", tokens: ["ckd", "albuminuria", "kidney"] },
  { name: "Chronic Kidney Disease", group: "ckd", tokens: ["ckd", "chronic kidney", "kidney disease"] },
  { name: "Proteinuria", group: "ckd", tokens: ["ckd", "proteinuria", "kidney"] },
  { name: "Diabetic Nephropathy", group: "ckd", tokens: ["ckd", "nephropathy", "kidney"] },
  { name: "Bk Virus-associated Nephropathy", group: "ckd", tokens: ["ckd", "nephropathy"] },
  { name: "Assisted Living", group: "hospice", tokens: ["hospice", "assisted living", "care setting"] },
  { name: "Nursing Home", group: "hospice", tokens: ["hospice", "nursing home", "long term care"] },
  { name: "Skilled Nursing", group: "hospice", tokens: ["hospice", "skilled nursing"] },
  { name: "Requires A Specialized Care Setting", group: "hospice", tokens: ["hospice", "care setting"] },
  { name: "Long Term Care Facility", group: "hospice", tokens: ["hospice", "long term care"] },
  { name: "Procedural Complications", group: "hip_replacement", tokens: ["hip replacement", "knee replacement", "procedure"] },
  { name: "Heart Valve Replacement", group: "hip_replacement", tokens: ["hip replacement", "knee replacement", "replacement"] },
  {
    name: "Increased Risk For Procedure-related Complications",
    group: "hip_replacement",
    tokens: ["hip replacement", "knee replacement", "procedure", "complication"],
  },
  { name: "Awaiting Surgery", group: "hip_replacement", tokens: ["hip replacement", "knee replacement", "surgery"] },
  {
    name: "Implant Insertion And Removal Complications",
    group: "hip_replacement",
    tokens: ["hip replacement", "knee replacement", "implant", "complication"],
  },
  { name: "Memory Impairment", group: "memory_loss", tokens: ["memory loss", "memory", "impairment", "cognitive"] },
  { name: "Brain Health And Memory Support", group: "memory_loss", tokens: ["memory loss", "memory", "brain"] },
  { name: "Amnesia", group: "memory_loss", tokens: ["memory loss", "amnesia", "memory"] },
  { name: "Alzheimer", group: "memory_loss", tokens: ["memory loss", "alzheimer", "dementia"] },
  { name: "Wernicke/korsakoff Syndrome", group: "memory_loss", tokens: ["memory loss", "wernicke", "korsakoff"] },
  { name: "Testicular Failure", group: "low_testosterone", tokens: ["low testosterone", "testicular", "testosterone"] },
  { name: "Testicular Atrophy", group: "low_testosterone", tokens: ["low testosterone", "testicular", "atrophy"] },
  { name: "Oligospermia", group: "low_testosterone", tokens: ["low testosterone", "oligospermia", "testosterone"] },
  { name: "Hypogonadism", group: "low_testosterone", tokens: ["low testosterone", "hypogonadism", "testosterone"] },
  { name: "Hypogonadism Diagnosis", group: "low_testosterone", tokens: ["low testosterone", "hypogonadism"] },
];

const STRICT_CATALOG_GROUPS = new Set([
  "broken",
  "broken_bone",
  "ms",
  "afib",
  "chf",
  "blood_thinner",
  "adhd",
  "autism",
  "ptsd",
  "pacemaker",
]);

function queryGroupForCatalog(q) {
  const qLower = String(q || "").trim().toLowerCase();
  if (qLower.includes("broken") && qLower.includes("bone")) return "broken_bone";
  if (qLower.startsWith("broken")) return "broken";
  if (qLower === "copd" || qLower.startsWith("copd")) return "copd";
  if (qLower === "ms") return "ms";
  if (qLower === "afib" || qLower.startsWith("afib")) return "afib";
  if (qLower === "chf" || qLower.startsWith("chf")) return "chf";
  if (qLower.includes("blood thinner")) return "blood_thinner";
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
  return null;
}

function catalogMatchesQuery(entry, q) {
  const qLower = String(q || "").trim().toLowerCase();
  if (!qLower || qLower.length < 2) return false;
  const nameLower = entry.name.toLowerCase();
  const isBrokenBone = qLower.includes("broken") && qLower.includes("bone");
  const isBrokenOnly = !isBrokenBone && qLower.startsWith("broken");

  if (isBrokenOnly && entry.group === "broken_bone") return false;
  if (isBrokenBone && entry.group === "broken") return false;

  const qGroup = queryGroupForCatalog(q);
  const semanticOnlyGroup =
    qGroup === "heart" ||
    qGroup === "cpap" ||
    qGroup === "ckd" ||
    qGroup === "hospice" ||
    qGroup === "hip_replacement" ||
    qGroup === "memory_loss" ||
    qGroup === "low_testosterone";
  if (semanticOnlyGroup && entry.group !== qGroup) return false;
  if (qGroup && entry.group && entry.group !== qGroup) return false;
  if (qGroup && STRICT_CATALOG_GROUPS.has(qGroup) && !entry.group) {
    if (!nameLower.includes(qLower)) return false;
  }

  if (qLower === "dia") {
    if (nameLower.includes("diaper")) return true;
    if (nameLower.startsWith("diabetic")) return true;
    if (nameLower.includes("diarrhea")) return true;
    return false;
  }

  if (nameLower.includes(qLower)) return true;

  const qWords = qLower.split(/\s+/).filter(function (w) {
    return w.length >= 3;
  });
  const ambiguousSingleTokens = new Set(["low", "high", "pain", "dia", "sugar"]);

  return (entry.tokens || []).some(function (token) {
    const t = String(token || "").toLowerCase();
    if (qWords.length > 1 && ambiguousSingleTokens.has(t) && !t.includes(" ")) {
      if (!entry.group || entry.group !== qGroup) return false;
    }
    if (t === qLower) return true;
    if (qLower.includes(t) && t.length >= 3) return true;
    if (t.includes(qLower) && qLower.length >= 3) return true;
    if (qLower.startsWith(t) && t.length >= 4) return true;
    if (t.startsWith(qLower) && qLower.length >= 4) return true;
    return false;
  });
}

function catalogMatchesQueryWords(entry, q) {
  const qLower = String(q || "").trim().toLowerCase();
  if (!qLower || qLower.length < 2) return false;
  const nameLower = entry.name.toLowerCase();
  if (nameMatchesQueryWords(nameLower, qLower)) return true;
  return false;
}

function nameMatchesQueryWords(nameLower, qLower) {
  if (nameLower.includes(qLower)) {
    if (qLower.length <= 4) {
      const words = nameLower.split(/[\s/()-]+/).filter(Boolean);
      if (words.some(function (w) {
        return w === qLower || w.startsWith(qLower);
      })) {
        return true;
      }
      return nameLower.startsWith(qLower);
    }
    return true;
  }
  const qWords = qLower.split(/\s+/).filter(function (w) {
    return w.length >= 3;
  });
  if (qWords.length > 1) {
    return qWords.every(function (w) {
      return nameLower.includes(w);
    });
  }
  return false;
}

function searchIcConditionCatalogWords(q) {
  const matches = [];
  IC_CONDITIONS.forEach(function (entry, idx) {
    if (!catalogMatchesQueryWords(entry, q)) return;
    matches.push({
      name: entry.name,
      icd10_code: entry.icd10_code || null,
      catalogIdx: idx,
    });
  });
  return matches;
}

function searchIcConditionCatalog(q) {
  const matches = [];
  IC_CONDITIONS.forEach(function (entry, idx) {
    if (!catalogMatchesQuery(entry, q)) return;
    matches.push({
      name: entry.name,
      icd10_code: entry.icd10_code || null,
      catalogIdx: idx,
    });
  });
  return matches;
}

module.exports = {
  IC_CONDITIONS,
  queryGroupForCatalog,
  catalogMatchesQueryWords,
  searchIcConditionCatalogWords,
  searchIcConditionCatalog,
  nameMatchesQueryWords,
};
