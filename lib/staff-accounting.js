/**
 * MVI staff accounting — double-entry helpers modeled on Patriot Accounting Premium.
 * Modified cash: post what hit the bank / card. No payroll in v1.
 */
"use strict";

function toCents(n) {
  const x = Number(String(n == null ? "" : n).replace(/[$,\s]/g, "").replace(/^\((.+)\)$/, "-$1"));
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100);
}

function fromCents(cents) {
  return (Number(cents) || 0) / 100;
}

function money(cents) {
  const n = fromCents(cents);
  const abs = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? "-$" + abs : "$" + abs;
}

function isoDate(d) {
  if (!d) return "";
  const s = String(d).trim();
  const mdy = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (mdy) {
    let y = Number(mdy[3]);
    if (y < 100) y += 2000;
    const mm = String(mdy[1]).padStart(2, "0");
    const dd = String(mdy[2]).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const t = Date.parse(s);
  if (!Number.isFinite(t)) return "";
  const dt = new Date(t);
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${dt.getFullYear()}-${mm}-${dd}`;
}

function monthStart(iso) {
  const d = isoDate(iso) || isoDate(new Date().toISOString().slice(0, 10));
  return d.slice(0, 8) + "01";
}

function todayIso() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function normalizePayee(s) {
  return String(s || "")
    .toUpperCase()
    .replace(/['"`]/g, "")
    .replace(/[^A-Z0-9*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(accountId, date, cents, description) {
  return [String(accountId || ""), isoDate(date), String(cents), normalizePayee(description)].join("|");
}

const CHART = [
  { code: "1000", name: "Checking", type: "asset", subtype: "bank", system: true, sort_order: 10 },
  { code: "1010", name: "Savings", type: "asset", subtype: "bank", system: true, sort_order: 20 },
  { code: "2000", name: "Credit Card", type: "liability", subtype: "credit_card", system: true, sort_order: 30 },
  { code: "3000", name: "Owner's Equity", type: "equity", subtype: "equity", system: true, sort_order: 40 },
  { code: "3100", name: "Owner's Draw", type: "equity", subtype: "draw", system: false, sort_order: 50 },
  { code: "3900", name: "Retained Earnings", type: "equity", subtype: "retained", system: true, sort_order: 60 },
  { code: "4000", name: "Commission Income", type: "income", subtype: "income", system: false, sort_order: 70 },
  { code: "4100", name: "Interest Income", type: "income", subtype: "income", system: false, sort_order: 80 },
  { code: "5000", name: "Advertising", type: "expense", subtype: "expense", system: false, sort_order: 90 },
  { code: "5100", name: "Software & Technology", type: "expense", subtype: "expense", system: false, sort_order: 100 },
  { code: "5200", name: "Office Expense", type: "expense", subtype: "expense", system: false, sort_order: 110 },
  { code: "5250", name: "Office Supplies", type: "expense", subtype: "expense", system: false, sort_order: 115 },
  { code: "5300", name: "Professional Fees", type: "expense", subtype: "expense", system: false, sort_order: 120 },
  { code: "5400", name: "Telephone", type: "expense", subtype: "expense", system: false, sort_order: 130 },
  { code: "5500", name: "Licensing and Fees", type: "expense", subtype: "expense", system: false, sort_order: 140 },
  { code: "5600", name: "Bank Fees", type: "expense", subtype: "expense", system: false, sort_order: 150 },
  { code: "5700", name: "Insurance", type: "expense", subtype: "expense", system: false, sort_order: 160 },
  { code: "5800", name: "Payroll Expense", type: "expense", subtype: "expense", system: false, sort_order: 170 },
  { code: "5900", name: "Other Expense", type: "expense", subtype: "expense", system: false, sort_order: 180 },
];

const VENDORS = [
  { name: "Vercel", match_pattern: "VERCEL", account_code: "5100" },
  { name: "Cursor", match_pattern: "CURSOR", account_code: "5100" },
  { name: "Anthropic Claude", match_pattern: "ANTHROPIC", account_code: "5100" },
  { name: "Patriot Software", match_pattern: "PATRIOT SOFTWARE", account_code: "5100" },
  { name: "HeyGen", match_pattern: "HEYGEN", account_code: "5100" },
  { name: "Google Workspace", match_pattern: "WORKSPACE", account_code: "5100" },
  { name: "OpenArt", match_pattern: "OPENART", account_code: "5000" },
  { name: "Canva", match_pattern: "CANVA", account_code: "5000" },
  { name: "CapCut", match_pattern: "CAPCUT", account_code: "5000" },
  { name: "Facebook Ads", match_pattern: "FACEBK", account_code: "5000" },
  { name: "Google Ads", match_pattern: "ADS260", account_code: "5000" },
  { name: "ManyChat", match_pattern: "MANYCHAT", account_code: "5000" },
  { name: "Anytime Mailbox", match_pattern: "ANYTIME MAILBOX", account_code: "5200" },
  { name: "Telnyx", match_pattern: "TELNYX", account_code: "5400" },
  { name: "NIPR", match_pattern: "NIPR", account_code: "5500" },
  { name: "Sircon", match_pattern: "SIRCON", account_code: "5500" },
  { name: "Mutual of Omaha", match_pattern: "MUTUAL OF OMAHA", account_code: "4000" },
  { name: "Owner contribution", match_pattern: "OWNER CONTRIBUTION", account_code: "3000" },
  { name: "Chase card autopay", match_pattern: "CHASE CREDIT CRD AUTOPAY", account_code: "2000" },
  { name: "Card payment", match_pattern: "AUTOMATIC PAYMENT", account_code: "1000" },
  { name: "Better Business Bureau", match_pattern: "BETTER BUSINESS BUREAU", account_code: "5300" },
  { name: "BBB", match_pattern: "BBB", account_code: "5300" },
];

function naturalSign(type) {
  return type === "asset" || type === "expense" ? 1 : -1;
}

function signedBalance(type, debitCents, creditCents) {
  const d = Number(debitCents) || 0;
  const c = Number(creditCents) || 0;
  if (type === "asset" || type === "expense") return d - c;
  return c - d;
}

function matchVendor(description, vendors) {
  const hay = normalizePayee(description);
  if (!hay) return null;
  let best = null;
  let bestLen = 0;
  for (const v of vendors || []) {
    const pat = normalizePayee(v.match_pattern || v.name);
    if (!pat) continue;
    if (hay.includes(pat) && pat.length >= bestLen) {
      best = v;
      bestLen = pat.length;
    }
  }
  return best;
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function headerIndex(headers) {
  const lower = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim());
  const find = (...needles) => {
    for (const n of needles) {
      const i = lower.findIndex((h) => h === n || h.includes(n));
      if (i >= 0) return i;
    }
    return -1;
  };
  return {
    date: find("posting date", "transaction date", "date"),
    description: find("description", "payee", "name", "memo"),
    amount: find("amount"),
    type: find("type", "details"),
  };
}

function parseAmountCell(raw) {
  const s = String(raw || "").trim();
  if (!s) return 0;
  return toCents(s);
}

function parseBankCsv(text, opts) {
  const accountType = (opts && opts.accountType) || "bank";
  const raw = String(text || "").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { rows: [], error: "Need a header row and at least one transaction." };
  let headerLine = 0;
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const idx = headerIndex(splitCsvLine(lines[i]));
    if (idx.date >= 0 && idx.amount >= 0) {
      headerLine = i;
      break;
    }
  }
  const headers = splitCsvLine(lines[headerLine]);
  const idx = headerIndex(headers);
  if (idx.date < 0 || idx.amount < 0) {
    return { rows: [], error: "Could not find Date and Amount columns." };
  }
  const parsed = [];
  for (let i = headerLine + 1; i < lines.length; i++) {
    const colsRaw = splitCsvLine(lines[i]);
    if (colsRaw.every((c) => !c)) continue;
    let cols = colsRaw;
    if (cols.length > headers.length && idx.description >= 0) {
      const extra = cols.length - headers.length;
      const merged = cols.slice(idx.description, idx.description + extra + 1).join(",");
      cols = cols.slice(0, idx.description).concat([merged], cols.slice(idx.description + extra + 1));
    }
    const date = isoDate(cols[idx.date]);
    const description = idx.description >= 0 ? cols[idx.description] : cols[0];
    const amount = parseAmountCell(cols[idx.amount]);
    const type = idx.type >= 0 ? cols[idx.type] : "";
    if (!date || !amount) continue;
    parsed.push({ date, description: String(description || "").trim(), amount, type });
  }
  if (!parsed.length) return { rows: [], error: "No dated amounts found in that file." };

  let rows = parsed;
  if (accountType === "credit_card") {
    const types = parsed.map((r) => String(r.type || "").toLowerCase());
    const chaseLike = types.some((t) => /sale|payment|return/.test(t));
    const negCount = parsed.filter((r) => r.amount < 0).length;
    const invert = chaseLike || negCount > parsed.length / 2;
    if (invert) {
      rows = parsed.map((r) => ({ ...r, amount: -r.amount }));
    }
  }
  return {
    rows: rows.map((r) => ({
      txn_date: r.date,
      description: r.description,
      amount_cents: r.amount,
      raw_type: r.type || "",
    })),
  };
}

function resolveCounterpart(registerAccount, suggested, accounts) {
  if (!registerAccount) return suggested || null;
  if (suggested && suggested.id !== registerAccount.id && suggested.code !== registerAccount.code) {
    return suggested;
  }
  const list = accounts || [];
  if (registerAccount.subtype === "bank" || registerAccount.code === "1000" || registerAccount.code === "1010") {
    return list.find((a) => a.subtype === "credit_card") || suggested || null;
  }
  if (registerAccount.subtype === "credit_card") {
    return list.find((a) => a.code === "1000") || suggested || null;
  }
  return suggested || null;
}

function counterpartForImport(registerAccount, counterpartAccount, amountCents) {
  const amt = Number(amountCents) || 0;
  if (!registerAccount || !counterpartAccount || !amt) return null;
  const abs = Math.abs(amt);
  const regType = registerAccount.type;
  const lines = [];
  if (regType === "asset") {
    if (amt > 0) {
      lines.push({ account_code: registerAccount.code, side: "debit", amount_cents: abs });
      lines.push({ account_code: counterpartAccount.code, side: "credit", amount_cents: abs });
    } else {
      lines.push({ account_code: counterpartAccount.code, side: "debit", amount_cents: abs });
      lines.push({ account_code: registerAccount.code, side: "credit", amount_cents: abs });
    }
  } else if (regType === "liability") {
    if (amt > 0) {
      lines.push({ account_code: counterpartAccount.code, side: "debit", amount_cents: abs });
      lines.push({ account_code: registerAccount.code, side: "credit", amount_cents: abs });
    } else {
      lines.push({ account_code: registerAccount.code, side: "debit", amount_cents: abs });
      lines.push({ account_code: counterpartAccount.code, side: "credit", amount_cents: abs });
    }
  } else {
    return null;
  }
  return lines;
}

function validateLines(lines) {
  let debit = 0;
  let credit = 0;
  for (const ln of lines || []) {
    const a = Math.abs(Number(ln.amount_cents) || 0);
    if (!a) continue;
    if (ln.side === "debit") debit += a;
    else if (ln.side === "credit") credit += a;
    else return { ok: false, error: "Each line needs debit or credit." };
  }
  if (debit === 0 && credit === 0) return { ok: false, error: "Entry has no amounts." };
  if (debit !== credit) return { ok: false, error: "Debits must equal credits." };
  return { ok: true, debit, credit };
}

function sumByAccount(postedLines) {
  const by = {};
  for (const ln of postedLines || []) {
    const id = ln.account_id || ln.account_code;
    if (!id) continue;
    if (!by[id]) by[id] = { debit: 0, credit: 0 };
    const a = Math.abs(Number(ln.amount_cents) || 0);
    if (ln.side === "debit") by[id].debit += a;
    else by[id].credit += a;
  }
  return by;
}

function trialBalance(accounts, postedLines) {
  const sums = sumByAccount(postedLines);
  const rows = (accounts || []).map((acct) => {
    const s = sums[acct.id] || sums[acct.code] || { debit: 0, credit: 0 };
    const balance = signedBalance(acct.type, s.debit, s.credit);
    return {
      id: acct.id,
      code: acct.code,
      name: acct.name,
      type: acct.type,
      debit_cents: s.debit,
      credit_cents: s.credit,
      balance_cents: balance,
    };
  });
  const debit = rows.reduce((n, r) => n + r.debit_cents, 0);
  const credit = rows.reduce((n, r) => n + r.credit_cents, 0);
  return { rows, debit_cents: debit, credit_cents: credit, balanced: debit === credit };
}

function inRange(date, start, end) {
  const d = isoDate(date);
  if (!d) return false;
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

function profitAndLoss(accounts, postedLines, start, end) {
  const period = (postedLines || []).filter((ln) => inRange(ln.entry_date, start, end));
  const tb = trialBalance(accounts, period);
  const income = tb.rows.filter((r) => r.type === "income");
  const expense = tb.rows.filter((r) => r.type === "expense");
  const incomeTotal = income.reduce((n, r) => n + r.balance_cents, 0);
  const expenseTotal = expense.reduce((n, r) => n + r.balance_cents, 0);
  return {
    start,
    end,
    income,
    expense,
    income_cents: incomeTotal,
    expense_cents: expenseTotal,
    net_cents: incomeTotal - expenseTotal,
  };
}

function netIncomeThrough(accounts, postedLines, asOf, fromDate) {
  const pl = profitAndLoss(accounts, postedLines, fromDate || "2000-01-01", asOf);
  return pl.net_cents;
}

function balanceSheet(accounts, postedLines, asOf) {
  const thru = (postedLines || []).filter((ln) => inRange(ln.entry_date, null, asOf));
  const tb = trialBalance(accounts, thru);
  const assets = tb.rows.filter((r) => r.type === "asset");
  const liabilities = tb.rows.filter((r) => r.type === "liability");
  const equity = tb.rows.filter((r) => r.type === "equity");
  const yearStart = (asOf || todayIso()).slice(0, 4) + "-01-01";
  const ni = netIncomeThrough(accounts, postedLines, asOf, yearStart);
  const assetTotal = assets.reduce((n, r) => n + r.balance_cents, 0);
  const liabTotal = liabilities.reduce((n, r) => n + r.balance_cents, 0);
  const equityTotal = equity.reduce((n, r) => n + r.balance_cents, 0);
  return {
    as_of: asOf,
    assets,
    liabilities,
    equity,
    net_income_cents: ni,
    asset_cents: assetTotal,
    liability_cents: liabTotal,
    equity_cents: equityTotal,
    total_liab_equity_cents: liabTotal + equityTotal + ni,
    balanced: assetTotal === liabTotal + equityTotal + ni,
  };
}

function generalLedger(accounts, postedLines, start, end) {
  const byId = {};
  for (const a of accounts || []) byId[a.id || a.code] = a;
  const groups = {};
  const sorted = (postedLines || [])
    .filter((ln) => inRange(ln.entry_date, start, end))
    .slice()
    .sort((a, b) => String(a.entry_date).localeCompare(String(b.entry_date)) || String(a.id || "").localeCompare(String(b.id || "")));
  for (const ln of sorted) {
    const key = ln.account_id || ln.account_code;
    if (!groups[key]) {
      const acct = byId[key] || { name: ln.account_name || key, type: ln.account_type || "asset", code: ln.account_code || "" };
      groups[key] = { account: acct, lines: [], debit_cents: 0, credit_cents: 0, balance_cents: 0 };
    }
    const g = groups[key];
    const a = Math.abs(Number(ln.amount_cents) || 0);
    if (ln.side === "debit") g.debit_cents += a;
    else g.credit_cents += a;
    g.lines.push(ln);
  }
  const sections = Object.values(groups).map((g) => {
    g.balance_cents = signedBalance(g.account.type, g.debit_cents, g.credit_cents);
    return g;
  });
  sections.sort((a, b) => Number(a.account.sort_order || 0) - Number(b.account.sort_order || 0));
  return { start, end, sections };
}

function openingLines(accounts, balancesByCode) {
  const byCode = {};
  for (const a of accounts || []) byCode[a.code] = a;
  const equity = byCode["3000"];
  const lines = [];
  let equityCents = 0;
  for (const [code, cents] of Object.entries(balancesByCode || {})) {
    const amt = Number(cents) || 0;
    if (!amt) continue;
    const acct = byCode[code];
    if (!acct || acct.code === "3000") continue;
    const abs = Math.abs(amt);
    if (acct.type === "asset") {
      if (amt > 0) {
        lines.push({ account_code: code, side: "debit", amount_cents: abs });
        equityCents += amt;
      } else {
        lines.push({ account_code: code, side: "credit", amount_cents: abs });
        equityCents += amt;
      }
    } else if (acct.type === "liability") {
      if (amt > 0) {
        lines.push({ account_code: code, side: "credit", amount_cents: abs });
        equityCents -= amt;
      } else {
        lines.push({ account_code: code, side: "debit", amount_cents: abs });
        equityCents -= amt;
      }
    }
  }
  if (!lines.length || !equity) return [];
  if (equityCents > 0) lines.push({ account_code: "3000", side: "credit", amount_cents: equityCents });
  else if (equityCents < 0) lines.push({ account_code: "3000", side: "debit", amount_cents: Math.abs(equityCents) });
  return lines;
}

module.exports = {
  toCents,
  fromCents,
  money,
  isoDate,
  monthStart,
  todayIso,
  normalizePayee,
  fingerprint,
  CHART,
  VENDORS,
  naturalSign,
  signedBalance,
  matchVendor,
  parseBankCsv,
  resolveCounterpart,
  counterpartForImport,
  validateLines,
  trialBalance,
  profitAndLoss,
  balanceSheet,
  generalLedger,
  openingLines,
};
