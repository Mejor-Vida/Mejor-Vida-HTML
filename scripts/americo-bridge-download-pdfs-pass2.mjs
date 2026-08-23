#!/usr/bin/env node
/**
 * Pass 2: remaining Americo informational PDFs (sales tools, UW questionnaires,
 * Julie-state apps, annuity suitability). Skips blank service/admin duplicates.
 *
 * Usage: node scripts/americo-bridge-download-pdfs-pass2.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HOST = process.env.MVI_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.MVI_BRIDGE_PORT || 9334);
const TOKEN = process.env.MVI_BRIDGE_TOKEN || "mvi-local-bridge";
const BASE = `http://${HOST}:${PORT}`;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.join(__dirname, "..");
const PDF_DIR = path.join(REPO, "integrations", "knowledge", "Americo_Knowledge", "raw", "pdfs");
const CHUNK = 180000;

const FILES = [
  { id: 20914, name: "Eagle_Select_Client_Presentation_20914.pdf" },
  { id: 15327, name: "Final_Wishes_Planning_Guide_15327.pdf" },
  { id: 21252, name: "Americo_Strength_Flyer_21252.pdf" },
  { id: 20697, name: "Target_the_Beneficiary_Client_Flyer_20697.pdf" },
  { id: 19871, name: "General_Client_Lead_Letter_19871.pdf" },
  { id: 19096, name: "Age_Last_Birthday_Sales_Solution_Flyer_19096.pdf" },
  { id: 20696, name: "Common_Excuses_Client_Flyer_20696.pdf" },
  { id: 19756, name: "Generic_Referral_Flyer_19756.pdf" },
  { id: 20857, name: "IUL_Sales_Flyer_20857.pdf" },
  { id: 20588, name: "CBO_Flyer_20588.pdf" },
  { id: 20165, name: "CBO_LBR_Flyer_20165.pdf" },
  { id: 20164, name: "Living_Benefits_Riders_Flyer_20164.pdf" },
  { id: 20589, name: "Instant_Decision_Term_CBO_Brochure_20589.pdf" },
  { id: 20361, name: "Instant_Decision_Term_TriFold_Spanish_20361.pdf" },
  { id: 20591, name: "Instant_Decision_Series_Client_Worksheet_20591.pdf" },
  { id: 20695, name: "CBO_Sales_Solution_Flyer_20695.pdf" },
  { id: 20158, name: "Continuation_10_25_Flyer_20158.pdf" },
  { id: 20702, name: "Payment_Protector_Flyer_20702.pdf" },
  { id: 20592, name: "Payment_Protector_Expense_Worksheet_20592.pdf" },
  { id: 20161, name: "Payment_Protector_Continuation_Flyer_20161.pdf" },
  { id: 20186, name: "ADB_Postcard_20186.pdf" },
  { id: 20698, name: "Platinum_Assure_Series_Client_Flyer_20698.pdf" },
  { id: 20879, name: "Platinum_Assure_Series_Example_Flyer_20879.pdf" },
  { id: 19255, name: "Elite_5_Five_Year_Hypothetical_19255.pdf" },
  { id: 19254, name: "Elite_5_One_Year_Hypothetical_19254.pdf" },
  { id: 19160, name: "AdvantageWL_Precalculated_Face_Amounts_19160.pdf" },
  { id: 19161, name: "AdvantageWL_Rates_for_Premium_19161.pdf" },
  { id: 18710, name: "Life_Insurance_Needs_Analysis_18710.pdf" },
  { id: 20757, name: "Replacement_Forms_Requirements_20757.pdf" },
  { id: 21146, name: "Advertising_Guidelines_21146.pdf" },
  { id: 20643, name: "Social_Media_Advertising_Guidelines_20643.pdf" },
  { id: 19421, name: "Commission_Guide_19421.pdf" },
  { id: 20888, name: "Schedule_of_Commissions_Addendum_20888.pdf" },
  { id: 21050, name: "Annuity_Suitability_Producer_Guide_21050.pdf" },
  { id: 20541, name: "Annuity_Product_Specific_Training_20541.pdf" },
  { id: 18586, name: "State_Specific_General_Annuity_Training_18586.pdf" },
  { id: 17017, name: "Annuity_Telephone_Video_Sales_Guidelines_17017.pdf" },
  { id: 16969, name: "Fixed_Deferred_Annuity_Buyers_Guide_16969.pdf" },
  { id: 21277, name: "Current_Interest_Rates_21277.pdf" },
  { id: 18182, name: "Financial_Suitability_Form_18182.pdf" },
  { id: 16882, name: "Insurance_Agent_Disclosure_for_Annuities_16882.pdf" },
  { id: 19456, name: "Financial_Suitability_Supplemental_Form_19456.pdf" },
  { id: 19930, name: "AdvantageWL_Application_Packet_CO_19930.pdf" },
  { id: 19942, name: "AdvantageWL_Application_Packet_NV_19942.pdf" },
  { id: 19950, name: "AdvantageWL_Application_Packet_KS_19950.pdf" },
  { id: 19959, name: "AdvantageWL_Application_Packet_NE_19959.pdf" },
  { id: 18703, name: "Eagle_Benefit_Option_Election_Application_18703.pdf" },
  { id: 16103, name: "UW_Alcohol_Questionnaire_16103.pdf" },
  { id: 15920, name: "UW_Arthritis_Questionnaire_15920.pdf" },
  { id: 16126, name: "UW_Back_Disorders_Questionnaire_16126.pdf" },
  { id: 17366, name: "UW_Chest_Pain_Questionnaire_17366.pdf" },
  { id: 16615, name: "UW_Coronary_Disease_Questionnaire_16615.pdf" },
  { id: 18174, name: "UW_Coronary_Disease_Questionnaire_NE_18174.pdf" },
  { id: 16209, name: "UW_Diabetic_Questionnaire_16209.pdf" },
  { id: 15099, name: "UW_Epilepsy_Seizure_Questionnaire_15099.pdf" },
  { id: 15046, name: "UW_High_Blood_Pressure_Questionnaire_15046.pdf" },
  { id: 17692, name: "UW_Nervous_Disorders_Questionnaire_17692.pdf" },
  { id: 15669, name: "UW_Prescription_Medication_Questionnaire_15669.pdf" },
  { id: 17248, name: "UW_Prescription_Medication_NV_17248.pdf" },
  { id: 15827, name: "UW_Residence_Travel_Questionnaire_15827.pdf" },
  { id: 16545, name: "UW_Respiratory_Disorders_Questionnaire_16545.pdf" },
  { id: 18529, name: "UW_Sports_Activities_Questionnaire_18529.pdf" },
  { id: 16051, name: "UW_Tumor_Questionnaire_16051.pdf" },
  { id: 18949, name: "UW_Military_Questionnaire_18949.pdf" },
  { id: 17765, name: "UW_Foreign_National_Travel_Questionnaire_17765.pdf" },
  { id: 18697, name: "Additional_Insured_Supplemental_App_18697.pdf" },
  { id: 17976, name: "Aviation_Questionnaire_17976.pdf" },
  { id: 15893, name: "Childrens_Term_Rider_Supplemental_App_15893.pdf" },
  { id: 18176, name: "Disability_Income_Rider_Supplemental_App_18176.pdf" },
  { id: 15615, name: "Business_Insurance_Questionnaire_15615.pdf" },
  { id: 18587, name: "Personal_Financial_Questionnaire_18587.pdf" },
  { id: 16262, name: "Paramed_Exam_Form_16262.pdf" },
  { id: 16320, name: "Paramed_Exam_Form_NE_16320.pdf" },
  { id: 16858, name: "HIV_Consent_KS_NE_16858.pdf" },
  { id: 16342, name: "HIV_Consent_CO_16342.pdf" },
  { id: 16954, name: "HIV_Consent_NV_16954.pdf" },
  { id: 20856, name: "Military_Personnel_Disclosure_20856.pdf" },
  { id: 18113, name: "Replacement_Notice_Generic_18113.pdf" },
  { id: 18316, name: "Replacement_Notice_NV_18316.pdf" },
  { id: 18217, name: "Replacement_Notice_KS_18217.pdf" },
];

async function api(pathname, opts = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "X-MVI-Bridge-Token": TOKEN,
      ...(opts.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  if (!res.ok) throw new Error(body.error || body.message || `HTTP ${res.status}`);
  return body;
}

async function command(action, args = {}) {
  return api("/v1/command", { method: "POST", body: JSON.stringify({ action, args }) });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function evalCode(code) {
  const r = await command("evaluate", { code });
  return r.value !== undefined ? r.value : r.result ?? r;
}

async function fetchChunk(fileId, offset) {
  const code = `(() => {
    const id = ${fileId};
    const offset = ${offset};
    const limit = ${CHUNK};
    if (!window.__mviPdf || window.__mviPdf.id !== id) {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "https://portal.americoagent.com/File/Get/" + id, false);
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
      xhr.send(null);
      window.__mviPdf = {
        id: id,
        status: xhr.status,
        type: xhr.getResponseHeader("content-type") || "",
        bin: xhr.responseText || ""
      };
    }
    const c = window.__mviPdf;
    const slice = c.bin.substring(offset, offset + limit);
    let s = "";
    for (let i = 0; i < slice.length; i++) s += String.fromCharCode(slice.charCodeAt(i) & 255);
    return { status: c.status, len: c.bin.length, type: c.type, offset: offset, n: slice.length, b64: btoa(s) };
  })()`;
  return evalCode(code);
}

async function downloadOne(file) {
  const dest = path.join(PDF_DIR, file.name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log("skip existing", file.name);
    return dest;
  }
  process.stdout.write(`↓ ${file.id} ${file.name} `);
  const first = await fetchChunk(file.id, 0);
  if (!first || first.status !== 200 || !first.len) {
    console.log("FAIL status", first && first.status, first && first.type);
    return null;
  }
  const buf = Buffer.alloc(first.len);
  Buffer.from(first.b64, "base64").copy(buf, 0);
  let got = first.n;
  while (got < first.len) {
    const part = await fetchChunk(file.id, got);
    if (!part || !part.n) break;
    Buffer.from(part.b64, "base64").copy(buf, got);
    got += part.n;
    process.stdout.write(".");
  }
  fs.writeFileSync(dest, buf);
  const mag = buf.slice(0, 5).toString("utf8");
  console.log(` ${buf.length} bytes ${mag.startsWith("%PDF") ? "PDF" : mag}`);
  return dest;
}

async function main() {
  fs.mkdirSync(PDF_DIR, { recursive: true });
  await command("navigate", { url: "https://portal.americoagent.com/" });
  await sleep(2000);
  let ok = 0;
  let fail = 0;
  for (const file of FILES) {
    try {
      const dest = await downloadOne(file);
      if (dest) ok++;
      else fail++;
    } catch (e) {
      fail++;
      console.log("FAIL", file.id, e.message);
    }
  }
  console.log("Done pass2 ok", ok, "fail", fail);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
