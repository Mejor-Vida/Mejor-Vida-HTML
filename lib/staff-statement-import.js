"use strict";

const crypto = require("crypto");
const A = require("./staff-accounting");
const P = require("./staff-statement-parse");

const NEEDS_JULIE = /COPART/i;

function byCode(accounts) {
  const m = {};
  (accounts || []).forEach((a) => {
    m[a.code] = a;
    m[a.id] = a;
  });
  return m;
}

function classify(payee, vendors) {
  const hit = A.matchVendor(payee, vendors);
  if (hit) {
    const code = hit.account_code || hit._code;
    return { code, name: hit.name, needsJulie: NEEDS_JULIE.test(payee) };
  }
  return { code: "5900", name: "Unmapped", needsJulie: true };
}

function fileSha(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function loadPostedIndex(cfg, restSelect) {
  const rows = await restSelect(
    cfg,
    "staff_acct_lines",
    "select=amount_cents,account_id,account:staff_acct_accounts(code),entry:staff_acct_entries!inner(id,entry_date,payee,status)&entry.status=eq.posted&limit=20000"
  );
  const fps = new Set();
  const transferAmts = new Set();
  const byEntry = {};
  (rows || []).forEach((ln) => {
    const e = ln.entry || {};
    const code = ln.account && ln.account.code;
    const abs = Math.abs(Number(ln.amount_cents) || 0);
    if (e.entry_date && e.payee) {
      fps.add(P.fingerprint(e.entry_date, e.payee, abs));
      fps.add(P.fingerprint(e.entry_date, e.payee, -abs));
    }
    if (!e.id) return;
    if (!byEntry[e.id]) byEntry[e.id] = { codes: new Set(), amt: abs };
    byEntry[e.id].codes.add(code);
    byEntry[e.id].amt = abs;
  });
  Object.values(byEntry).forEach((e) => {
    if (e.codes.has("1000") && e.codes.has("2000")) transferAmts.add(e.amt);
  });
  return { fps, transferAmts };
}

function linesForTxn(t, codes, accountCode) {
  const abs = Math.abs(t.amount_cents);
  const register = t.register || "1000";
  const counterpart = codes[accountCode || "5900"];
  const checking = codes["1000"];
  const card = codes["2000"];
  if (!counterpart || !checking || !card) return null;
  if (register === "2000") {
    if (P.isCardAutopay(t.payee) || (t.amount_cents < 0 && P.isCardAutopay(t.payee))) {
      return [
        { account_id: card.id, side: "debit", amount_cents: abs },
        { account_id: checking.id, side: "credit", amount_cents: abs },
      ];
    }
    if (t.amount_cents < 0) {
      return [
        { account_id: card.id, side: "debit", amount_cents: abs },
        { account_id: counterpart.id, side: "credit", amount_cents: abs },
      ];
    }
    return [
      { account_id: counterpart.id, side: "debit", amount_cents: abs },
      { account_id: card.id, side: "credit", amount_cents: abs },
    ];
  }
  if (t.amount_cents > 0) {
    return [
      { account_id: checking.id, side: "debit", amount_cents: abs },
      { account_id: counterpart.id, side: "credit", amount_cents: abs },
    ];
  }
  if (P.isCardAutopay(t.payee)) {
    return [
      { account_id: card.id, side: "debit", amount_cents: abs },
      { account_id: checking.id, side: "credit", amount_cents: abs },
    ];
  }
  return [
    { account_id: counterpart.id, side: "debit", amount_cents: abs },
    { account_id: checking.id, side: "credit", amount_cents: abs },
  ];
}

async function postParsedStatement(cfg, { parsed, vendors, accounts, restSelect, postEntry, createdBy, closedThrough }) {
  const codes = byCode(accounts);
  const vendorsHydrated = (vendors || []).map((v) => {
    const acct = codes[v.default_account_id];
    return { ...v, account_code: acct && acct.code, _code: acct && acct.code };
  });
  const index = await loadPostedIndex(cfg, restSelect);
  const txns = P.uniqueTxns(parsed.txns || []);
  let posted = 0;
  let skipped = 0;
  const needsJulie = [];
  for (const t of txns) {
    const cls = classify(t.payee, vendorsHydrated);
    t.account_code = cls.code;
    if (cls.needsJulie) needsJulie.push(`${t.date} ${cls.name} ${t.payee}`.slice(0, 120));
    const abs = Math.abs(t.amount_cents);
    const fp = P.fingerprint(t.date, t.payee, t.amount_cents);
    const fpAbs = P.fingerprint(t.date, t.payee, abs);
    if (A.isClosedDate(closedThrough, t.date)) {
      skipped += 1;
      continue;
    }
    if (index.fps.has(fp) || index.fps.has(fpAbs)) {
      skipped += 1;
      continue;
    }
    if (P.isCardAutopay(t.payee) && index.transferAmts.has(abs)) {
      skipped += 1;
      continue;
    }
    const lines = linesForTxn(t, codes, cls.code);
    if (!lines || !A.validateLines(lines).ok) {
      skipped += 1;
      continue;
    }
    await postEntry(cfg, {
      date: t.date,
      memo: "Statement " + ((parsed.summary && parsed.summary.close) || ""),
      payee: String(t.payee || "").slice(0, 180),
      source: "import",
      lines,
      createdBy,
    });
    index.fps.add(fp);
    index.fps.add(fpAbs);
    if (P.isCardAutopay(t.payee)) index.transferAmts.add(abs);
    posted += 1;
  }
  return { posted, skipped, needsJulie, total: txns.length };
}

module.exports = {
  fileSha,
  classify,
  postParsedStatement,
};
