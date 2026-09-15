#!/usr/bin/env node
"use strict";

const {
  toCents,
  money,
  isoDate,
  fingerprint,
  matchVendor,
  parseBankCsv,
  resolveCounterpart,
  counterpartForImport,
  validateLines,
  trialBalance,
  profitAndLoss,
  balanceSheet,
  openingLines,
  VENDORS,
  CHART,
} = require("../lib/staff-accounting");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(toCents("1,055.39") === 105539, "toCents comma");
assert(toCents("($20.00)") === -2000, "toCents parens");
assert(money(-96059) === "-$960.59", "money neg");
assert(isoDate("8/5/2026") === "2026-08-05", "iso m/d/y");
assert(isoDate("2026-09-13") === "2026-09-13", "iso already");

const v = matchVendor("Chase FACEBK *C37VU46LY4", VENDORS);
assert(v && v.account_code === "5000", "facebook vendor");
const v2 = matchVendor("Chase AUTOMATIC PAYMENT - THANK", VENDORS);
assert(v2 && v2.account_code === "1000", "card payment maps to checking");

const fp = fingerprint("acc1", "2026-09-13", -11600, "FACEBK *xx");
assert(fp.includes("FACEBK"), "fingerprint");

const checkingCsv = `Details,Posting Date,Description,Amount,Type,Balance
CREDIT,08/05/2026,Cornhusker Bank Mutual of Omaha,75.40,ACH,1150.19
DEBIT,08/17/2026,Chase AUTOMATIC PAYMENT - THANK,-1055.39,ACH,94.80
DEBIT,09/10/2026,CURSOR, AI POWERED IDE,-60.00,DEBIT,940.00`;
const bank = parseBankCsv(checkingCsv, { accountType: "bank" });
assert(!bank.error, bank.error);
assert(bank.rows.length === 3, "bank rows");
assert(bank.rows[0].amount_cents === 7540, "deposit cents");
assert(bank.rows[1].amount_cents === -105539, "payment cents");
assert(bank.rows[2].amount_cents === -6000, "cursor unquoted comma");
assert(/CURSOR/.test(bank.rows[2].description), "cursor description kept");

const ccCsv = `Transaction Date,Posting Date,Description,Category,Type,Amount
09/13/2026,09/13/2026,FACEBK *ads,Ads,Sale,-116.00
08/17/2026,08/17/2026,AUTOMATIC PAYMENT - THANK,Payment,Payment,1055.39`;
const cc = parseBankCsv(ccCsv, { accountType: "credit_card" });
assert(!cc.error, cc.error);
assert(cc.rows[0].amount_cents === 11600, "cc sale inverted to liability increase");
assert(cc.rows[1].amount_cents === -105539, "cc payment inverted to decrease");

const checking = CHART.find((a) => a.code === "1000");
assert(resolveCounterpart(checking, checking, CHART).code === "2000", "checking payment counterpart is card");
assert(resolveCounterpart(CHART.find((a) => a.code === "2000"), checking, CHART).code === "1000", "cc payment counterpart is checking");

const ads = CHART.find((a) => a.code === "5000");
const card = CHART.find((a) => a.code === "2000");
const lines = counterpartForImport(checking, ads, -479);
assert(validateLines(lines).ok, "import lines balance");
const charge = counterpartForImport(card, ads, 11600);
assert(validateLines(charge).ok, "cc charge balances");
assert(charge[1].account_code === "2000" && charge[1].side === "credit", "cc credit on charge");

const accounts = CHART.map((a) => ({ ...a, id: a.code }));
const posted = [
  { account_id: "1000", account_code: "1000", side: "debit", amount_cents: 7540, entry_date: "2026-08-05" },
  { account_id: "4000", account_code: "4000", side: "credit", amount_cents: 7540, entry_date: "2026-08-05" },
  { account_id: "5000", account_code: "5000", side: "debit", amount_cents: 11600, entry_date: "2026-09-13" },
  { account_id: "2000", account_code: "2000", side: "credit", amount_cents: 11600, entry_date: "2026-09-13" },
];
const tb = trialBalance(accounts, posted);
assert(tb.balanced, "trial balance");
const pl = profitAndLoss(accounts, posted, "2026-08-01", "2026-09-30");
assert(pl.income_cents === 7540, "pl income");
assert(pl.expense_cents === 11600, "pl expense");
assert(pl.net_cents === 7540 - 11600, "pl net");
const bs = balanceSheet(accounts, posted, "2026-09-30");
assert(bs.balanced, "balance sheet equation");

const open = openingLines(accounts, { "1000": 115019, "1010": 10200, "2000": 144715 });
assert(validateLines(open).ok, "opening balances");

console.log("ok", { vendors: VENDORS.length, accounts: CHART.length });
