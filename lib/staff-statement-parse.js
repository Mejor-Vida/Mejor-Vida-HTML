"use strict";

const A = require("./staff-accounting");

function moneyToCents(s) {
  const t = String(s || "")
    .trim()
    .replace(/[$,]/g, "")
    .replace(/^\+/, "");
  const n = Math.round(Math.abs(parseFloat(t)) * 100);
  if (!Number.isFinite(n)) return 0;
  return t.startsWith("-") ? -n : n;
}

function isoFromMdY(mmddyyyy) {
  const [mm, dd, yyyy] = String(mmddyyyy).split("/").map((x) => parseInt(x, 10));
  if (!yyyy || !mm || !dd) return "";
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function toIsoMmDdYy(mmddyy) {
  const [mm, dd, yy] = String(mmddyy).split("/").map((x) => parseInt(x, 10));
  const y = yy < 100 ? 2000 + yy : yy;
  return `${y}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function txnIso(mmdd, closeIso) {
  const [mm, dd] = String(mmdd).split("/").map((x) => parseInt(x, 10));
  const [cy, cm, cd] = String(closeIso).split("-").map((x) => parseInt(x, 10));
  let y = cy;
  if (mm > cm || (mm === cm && dd > cd)) y -= 1;
  return `${y}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function cleanPayee(raw) {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .replace(/\bX{4,}\d+\b/gi, "")
    .replace(/\bP\d{5,}\b/gi, "")
    .replace(/\b\d{6,}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(date, payee, cents) {
  return [date, A.normalizePayee(payee).slice(0, 24), String(cents)].join("|");
}

function detectKind(text) {
  const t = String(text || "");
  if (/Cornhusker/i.test(t) && /Beginning Balance/i.test(t)) return "cornhusker_checking";
  if (/Payment, Credits/i.test(t) && /Previous Balance/i.test(t)) return "chase_card";
  if (/AUTOMATIC PAYMENT/i.test(t) && /Purchases/i.test(t)) return "chase_card";
  return "unknown";
}

function moneyFromSummary(text, label) {
  const re = new RegExp(label + "[:]?\\s+([+\\-]?)\\s*\\$?([\\d,]+\\.\\d{2})");
  const m = String(text || "").match(re);
  if (!m) return null;
  return moneyToCents(m[1] + m[2]);
}

function parseChaseClosing(text) {
  const m = String(text || "").match(
    /Opening\/Closing Date[:\s\n]*(\d{2}\/\d{2}\/\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})/i
  );
  if (!m) return null;
  return { open: toIsoMmDdYy(m[1]), close: toIsoMmDdYy(m[2]) };
}

function parseChaseCard(text) {
  const range = parseChaseClosing(text);
  if (!range) return { error: "Could not read the Chase statement period." };
  const summary = {
    open: range.open,
    close: range.close,
    previous_cents: moneyFromSummary(text, "Previous Balance"),
    payments_cents: moneyFromSummary(text, "Payment, Credits"),
    purchases_cents: moneyFromSummary(text, "Purchases"),
    new_balance_cents: moneyFromSummary(text, "New Balance"),
  };
  const start = text.search(/Date of\s*\n?Transaction/i);
  const end = text.search(/Total fees charged in \d{4}/i);
  const body = start >= 0 ? text.slice(start, end > start ? end : undefined) : text;
  const DATE_LINE = /^(\d{2}\/\d{2})\s*$/;
  const AMOUNT_LINE = /^-?(?:[\d,]+\.\d{2}|\.\d{2})$/;
  const inline = /^(\d{2}\/\d{2})\s+(.+?)\s+([+\-]?(?:[\d,]+\.\d{2}|\.\d{2}))$/;
  const lines = body.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const txns = [];
  for (let i = 0; i < lines.length; i++) {
    const one = lines[i].match(inline);
    if (one && !/TRANSACTIONS THIS CYCLE|INCLUDING PAYMENTS/i.test(one[2])) {
      const merchant = cleanPayee(one[2]);
      if (merchant && !/JULIE BRAUNSROTH|JUSTIN BRAUNSROTH/i.test(merchant)) {
        txns.push({
          date: txnIso(one[1], range.close),
          payee: merchant,
          amount_cents: moneyToCents(one[3]),
          register: "2000",
        });
      }
      continue;
    }
    const dm = lines[i].match(DATE_LINE);
    if (!dm) continue;
    const desc = [];
    let j = i + 1;
    while (j < lines.length && !DATE_LINE.test(lines[j]) && !AMOUNT_LINE.test(lines[j]) && !inline.test(lines[j])) {
      desc.push(lines[j]);
      j++;
    }
    if (j >= lines.length || !AMOUNT_LINE.test(lines[j])) continue;
    const merchant = cleanPayee(desc.join(" "));
    if (!merchant || /TRANSACTIONS THIS CYCLE|INCLUDING PAYMENTS|JULIE BRAUNSROTH|JUSTIN BRAUNSROTH/i.test(merchant)) {
      i = j;
      continue;
    }
    txns.push({
      date: txnIso(dm[1], range.close),
      payee: merchant,
      amount_cents: moneyToCents(lines[j]),
      register: "2000",
    });
    i = j;
  }
  return { kind: "chase_card", summary, txns };
}

function parseCornhuskerChecking(text) {
  const begin = text.match(/(\d{2}\/\d{2}\/\d{4})\s+Beginning Balance\s+\$([0-9,]+\.\d{2})/i);
  const end = text.match(/(\d{2}\/\d{2}\/\d{4})\s+Ending Balance\s+\$([0-9,]+\.\d{2})/i);
  const creditsHdr = text.match(/(\d+)\s+Credit\(s\) This Period\s+\$([0-9,]+\.\d{2})/i);
  const debitsHdr = text.match(/(\d+)\s+Debit\(s\) This Period\s+\$([0-9,]+\.\d{2})/i);
  const summary = {
    open: begin ? isoFromMdY(begin[1]) : null,
    close: end ? isoFromMdY(end[1]) : null,
    previous_cents: begin ? moneyToCents(begin[2]) : null,
    new_balance_cents: end ? moneyToCents(end[2]) : null,
    credits_cents: creditsHdr ? moneyToCents(creditsHdr[2]) : null,
    debits_cents: debitsHdr ? moneyToCents(debitsHdr[2]) : null,
  };
  if (!summary.close) return { error: "Could not read the checking statement period." };
  const skip =
    /beginning balance|ending balance|credit\(s\) this period|debit\(s\) this period|statement ending|daily balances|account summary|summary of accounts|managing your accounts|this page left/i;
  const row = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+\$([0-9,]+\.\d{2})\s*$/;
  const txns = [];
  let section = null;
  for (const raw of String(text || "").split(/\n/)) {
    const line = raw.trim();
    if (/^Electronic Credits/i.test(line) || /^Other Credits/i.test(line)) section = "credit";
    else if (/^Other Debits/i.test(line)) section = "debit";
    else if (/^Daily Balances/i.test(line)) section = null;
    if (!section || skip.test(line)) continue;
    const m = line.match(row);
    if (!m) continue;
    const desc = cleanPayee(m[2]);
    if (!desc || /continued/i.test(desc)) continue;
    const cents = moneyToCents(m[3]);
    txns.push({
      date: isoFromMdY(m[1]),
      payee: desc,
      amount_cents: section === "credit" ? cents : -cents,
      register: "1000",
    });
  }
  return { kind: "cornhusker_checking", summary, txns };
}

function parseStatementText(text) {
  const kind = detectKind(text);
  if (kind === "cornhusker_checking") return parseCornhuskerChecking(text);
  if (kind === "chase_card") return parseChaseCard(text);
  return { error: "This PDF is not a Chase card or Cornhusker checking statement we can read yet.", kind: "unknown" };
}

function isCardAutopay(payee) {
  return /CHASE CREDIT CRD|AUTOMATIC PAYMENT|THANK YOU/i.test(String(payee || ""));
}

function uniqueTxns(txns) {
  const seen = new Set();
  const out = [];
  for (const t of txns || []) {
    const fp = fingerprint(t.date, t.payee, t.amount_cents);
    if (seen.has(fp)) continue;
    seen.add(fp);
    out.push(t);
  }
  return out;
}

module.exports = {
  moneyToCents,
  cleanPayee,
  fingerprint,
  detectKind,
  parseChaseCard,
  parseCornhuskerChecking,
  parseStatementText,
  isCardAutopay,
  uniqueTxns,
};
