#!/usr/bin/env node
/**
 * Import Cornhusker business checking PDFs into Staff CRM Accounting.
 * Skips Chase card autopays already posted from the card statements.
 * Does not print account numbers or env secrets.
 *
 * Usage:
 *   node scripts/import-cornhusker-checking-statements.js --dry-run --pdfs="a.pdf,b.pdf"
 *   node scripts/import-cornhusker-checking-statements.js --pdfs="a.pdf,b.pdf"
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, "utf8")
    .split("\n")
    .forEach((line) => {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (!m || process.env[m[1]]) return;
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    });
}

loadEnvLocal();

const A = require("../lib/staff-accounting");
const { restSelect, restInsert, restPatch } = require("../api/staff/_inbox-lib");

const EXTRA_VENDORS = [
  { name: "Patriot payroll", match_pattern: "PATRIOT SOFTWARE PAYROLL", account_code: "5800" },
  { name: "Chase card epay", match_pattern: "CHASE CREDIT CRD EPAY", account_code: "2000" },
  { name: "Owner transfer in", match_pattern: "ECORP TRANSFER FROM E-CHECKING", account_code: "3000" },
  { name: "Lockton Affinity", match_pattern: "LOCKTON AFFINITY", account_code: "5700" },
  { name: "NSF fee", match_pattern: "NSF RETURNED ITEM FEE", account_code: "5600" },
];

function byCode(accounts) {
  const m = {};
  (accounts || []).forEach((a) => {
    m[a.code] = a;
  });
  return m;
}

function moneyToCents(s) {
  const t = String(s).trim().replace(/[$,]/g, "").replace(/^\+/, "");
  const n = Math.round(Math.abs(parseFloat(t)) * 100);
  if (!Number.isFinite(n)) return 0;
  return t.startsWith("-") ? -n : n;
}

function pdfText(pdfPath) {
  return execFileSync(
    "python3",
    [
      "-c",
      "from pypdf import PdfReader; import sys; r=PdfReader(sys.argv[1]); print('\\n'.join((p.extract_text() or '') for p in r.pages))",
      pdfPath,
    ],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }
  );
}

function isoFromMdY(mmddyyyy) {
  const [mm, dd, yyyy] = mmddyyyy.split("/").map((x) => parseInt(x, 10));
  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
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

function parsePdf(pdfPath) {
  const text = pdfText(pdfPath);
  const begin = text.match(/(\d{2}\/\d{2}\/\d{4})\s+Beginning Balance\s+\$([0-9,]+\.\d{2})/i);
  const end = text.match(/(\d{2}\/\d{2}\/\d{4})\s+Ending Balance\s+\$([0-9,]+\.\d{2})/i);
  const creditsHdr = text.match(/(\d+)\s+Credit\(s\) This Period\s+\$([0-9,]+\.\d{2})/i);
  const debitsHdr = text.match(/(\d+)\s+Debit\(s\) This Period\s+\$([0-9,]+\.\d{2})/i);
  const summary = {
    file: path.basename(pdfPath).replace(/\s+\d{5,}\.pdf$/i, ".pdf"),
    begin: begin ? isoFromMdY(begin[1]) : null,
    end: end ? isoFromMdY(end[1]) : null,
    begin_cents: begin ? moneyToCents(begin[2]) : null,
    end_cents: end ? moneyToCents(end[2]) : null,
    credits_cents: creditsHdr ? moneyToCents(creditsHdr[2]) : null,
    debits_cents: debitsHdr ? moneyToCents(debitsHdr[2]) : null,
  };

  const skip = /beginning balance|ending balance|credit\(s\) this period|debit\(s\) this period|statement ending|daily balances|account summary|summary of accounts|managing your accounts|this page left/i;
  const row = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+\$([0-9,]+\.\d{2})\s*$/;
  const txns = [];
  let section = null;
  for (const raw of text.split(/\n/)) {
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
      side: section,
    });
  }

  const creditSum = txns.filter((t) => t.amount_cents > 0).reduce((s, t) => s + t.amount_cents, 0);
  const debitSum = txns.filter((t) => t.amount_cents < 0).reduce((s, t) => s + t.amount_cents, 0);
  return { summary, txns, creditSum, debitSum };
}

function isCardPay(payee) {
  return /CHASE CREDIT CRD/i.test(payee);
}

function fingerprint(date, payee, cents) {
  return [date, A.normalizePayee(payee).slice(0, 28), String(cents)].join("|");
}

async function postEntry(cfg, { date, memo, payee, source, lines }) {
  const check = A.validateLines(lines);
  if (!check.ok) throw new Error(check.error);
  const inserted = await restInsert(cfg, "staff_acct_entries", [
    {
      entry_date: date,
      memo: memo || "",
      payee: payee || "",
      source: source || "import",
      status: "posted",
      created_by: "cornhusker-checking-import",
      posted_at: new Date().toISOString(),
    },
  ]);
  const entry = Array.isArray(inserted) ? inserted[0] : inserted;
  await restInsert(
    cfg,
    "staff_acct_lines",
    lines.map((ln, i) => ({
      entry_id: entry.id,
      account_id: ln.account_id,
      side: ln.side,
      amount_cents: Math.abs(Number(ln.amount_cents) || 0),
      memo: ln.memo || "",
      sort_order: i,
    }))
  );
  return entry;
}

async function ensureVendors(cfg, accounts) {
  const codes = byCode(accounts);
  const existing = await restSelect(cfg, "staff_acct_vendors", "select=id,name,match_pattern,default_account_id");
  const have = new Set((existing || []).map((v) => A.normalizePayee(v.match_pattern || v.name)));
  const toAdd = [];
  for (const v of EXTRA_VENDORS) {
    const key = A.normalizePayee(v.match_pattern);
    if (have.has(key)) continue;
    const acct = codes[v.account_code];
    if (!acct) continue;
    toAdd.push({
      name: v.name,
      match_pattern: v.match_pattern,
      default_account_id: acct.id,
      notes: "From Cornhusker checking statements",
    });
  }
  if (toAdd.length) await restInsert(cfg, "staff_acct_vendors", toAdd);
  const rows = await restSelect(cfg, "staff_acct_vendors", "select=id,name,match_pattern,default_account_id");
  const byId = {};
  accounts.forEach((a) => {
    byId[a.id] = a;
  });
  return (rows || []).map((v) => ({
    ...v,
    account_code: byId[v.default_account_id] && byId[v.default_account_id].code,
    _code: byId[v.default_account_id] && byId[v.default_account_id].code,
  }));
}

function classify(payee, vendors) {
  const hit = A.matchVendor(payee, vendors);
  if (hit) return { code: hit.account_code || hit._code, name: hit.name };
  return { code: "5900", name: "Unmapped" };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const pdfArg = process.argv.find((a) => a.startsWith("--pdfs="));
  if (!pdfArg) {
    console.error("Pass --pdfs=file1.pdf,file2.pdf");
    process.exit(1);
  }
  const pdfs = pdfArg
    .slice("--pdfs=".length)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = pdfs.map(parsePdf);
  parsed.sort((a, b) => String(a.summary.end).localeCompare(String(b.summary.end)));

  const allTxns = [];
  const seen = new Set();
  for (const p of parsed) {
    const credOk = p.creditSum === (p.summary.credits_cents || 0);
    const debOk = Math.abs(p.debitSum) === (p.summary.debits_cents || 0);
    console.log(
      `${p.summary.end}  begin ${(p.summary.begin_cents / 100).toFixed(2)}  credits ${(p.summary.credits_cents / 100).toFixed(2)} (lines ${(p.creditSum / 100).toFixed(2)}${credOk ? "" : " MISMATCH"})  debits ${(p.summary.debits_cents / 100).toFixed(2)} (lines ${(Math.abs(p.debitSum) / 100).toFixed(2)}${debOk ? "" : " MISMATCH"})  end ${(p.summary.end_cents / 100).toFixed(2)}  n=${p.txns.length}`
    );
    for (const t of p.txns) {
      const fp = fingerprint(t.date, t.payee, t.amount_cents);
      if (seen.has(fp)) continue;
      seen.add(fp);
      allTxns.push({ ...t, stmt: p.summary.end });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL && process.env.SUPABASE_URL.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  const cfg = { supabaseUrl, serviceKey };
  const accounts = await restSelect(
    cfg,
    "staff_acct_accounts",
    "select=id,code,name,type,subtype&order=sort_order.asc"
  );
  const codes = byCode(accounts);
  const vendors = await ensureVendors(cfg, accounts);

  const unmapped = [];
  allTxns.forEach((t) => {
    const c = classify(t.payee, vendors);
    t.account_code = c.code;
    t.vendor_name = c.name;
    if (c.name === "Unmapped") unmapped.push(t);
  });

  const posted = await restSelect(
    cfg,
    "staff_acct_entries",
    "select=id,entry_date,memo,payee,source,status&status=eq.posted&order=entry_date.asc&limit=5000"
  );
  const postedAmounts = new Set();
  for (const e of posted || []) {
    const lines = await restSelect(
      cfg,
      "staff_acct_lines",
      `select=amount_cents,account_id,side&entry_id=eq.${encodeURIComponent(e.id)}&limit=12`
    );
    const checking = codes["1000"];
    const hit = (lines || []).find(
      (ln) => ln.account_id === checking.id && Math.abs(Number(ln.amount_cents) || 0)
    );
    if (hit) postedAmounts.add(Math.abs(Number(hit.amount_cents)));
  }

  const toPost = [];
  const skippedCard = [];
  for (const t of allTxns) {
    if (isCardPay(t.payee) && postedAmounts.has(Math.abs(t.amount_cents))) {
      skippedCard.push(t);
      continue;
    }
    toPost.push(t);
  }

  console.log(`Unique checking lines: ${allTxns.length}`);
  console.log(`Skip Chase already on books: ${skippedCard.length}`);
  console.log(`To post: ${toPost.length}`);
  if (unmapped.length) {
    console.log("Unmapped:");
    unmapped.forEach((t) => console.log(`  ${t.date} ${(t.amount_cents / 100).toFixed(2)} ${t.payee.slice(0, 70)}`));
  }

  const reviewDir = path.join(__dirname, "..", "integrations", "accounting", "reviews");
  fs.mkdirSync(reviewDir, { recursive: true });
  fs.writeFileSync(
    path.join(reviewDir, "2026-09-20-cornhusker-checking.json"),
    JSON.stringify(
      {
        summaries: parsed.map((p) => p.summary),
        txns: allTxns.map((t) => ({
          date: t.date,
          cents: t.amount_cents,
          payee: t.payee,
          account: t.account_code,
        })),
      },
      null,
      2
    )
  );

  if (dryRun) {
    console.log("Dry run — no CRM posts.");
    toPost.forEach((t) =>
      console.log(`  ${t.date} ${(t.amount_cents / 100).toFixed(2)} ${t.vendor_name} ${t.payee.slice(0, 50)}`)
    );
    return;
  }

  const firstBegin = parsed.find((p) => p.summary.begin_cents)?.summary;
  const openingHasChecking = (posted || []).some((e) => e.source === "opening");
  if (firstBegin && firstBegin.begin_cents) {
    const alreadyOpen = (posted || []).some(
      (e) => e.source === "opening" && /checking/i.test(e.memo || "")
    );
    if (!alreadyOpen) {
      await postEntry(cfg, {
        date: firstBegin.begin,
        memo: "Opening checking from Cornhusker statement beginning balance",
        payee: "",
        source: "opening",
        lines: [
          { account_id: codes["1000"].id, side: "debit", amount_cents: firstBegin.begin_cents },
          { account_id: codes["3000"].id, side: "credit", amount_cents: firstBegin.begin_cents },
        ],
      });
      console.log("Posted checking opening.");
    } else if (openingHasChecking) {
      console.log("Checking opening already present.");
    }
  }

  let n = 0;
  for (const t of toPost) {
    const abs = Math.abs(t.amount_cents);
    const counterpart = codes[t.account_code || "5900"];
    let lines;
    if (t.amount_cents > 0) {
      lines = [
        { account_id: codes["1000"].id, side: "debit", amount_cents: abs },
        { account_id: counterpart.id, side: "credit", amount_cents: abs },
      ];
    } else if (isCardPay(t.payee)) {
      lines = [
        { account_id: codes["2000"].id, side: "debit", amount_cents: abs },
        { account_id: codes["1000"].id, side: "credit", amount_cents: abs },
      ];
    } else {
      lines = [
        { account_id: counterpart.id, side: "debit", amount_cents: abs },
        { account_id: codes["1000"].id, side: "credit", amount_cents: abs },
      ];
    }
    await postEntry(cfg, {
      date: t.date,
      memo: "Cornhusker checking statement " + t.stmt,
      payee: t.payee.slice(0, 180),
      source: "import",
      lines,
    });
    n++;
  }
  console.log(`Posted ${n} checking lines.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
