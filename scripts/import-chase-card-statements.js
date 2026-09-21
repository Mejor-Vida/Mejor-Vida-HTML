#!/usr/bin/env node
/**
 * Import Chase Business Card PDFs (last4 only in filenames) into Staff CRM Accounting.
 * Posts one of each statement line. Payments are transfers (Dr card / Cr checking).
 *
 * Usage:
 *   node scripts/import-chase-card-statements.js --dry-run --pdfs "/path/a.pdf,/path/b.pdf"
 *   node scripts/import-chase-card-statements.js --pdfs "..."
 *
 * Does not print account numbers or env secrets.
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
  { name: "Agent CRM", match_pattern: "AGENT CRM", account_code: "5100" },
  { name: "Abacus", match_pattern: "ABACUS", account_code: "5100" },
  { name: "ElevenLabs", match_pattern: "ELEVENLABS", account_code: "5100" },
  { name: "GoDaddy", match_pattern: "GODADDY", account_code: "5100" },
  { name: "xAI", match_pattern: "XAI", account_code: "5100" },
  { name: "Hugging Face", match_pattern: "HUGGINGFACE", account_code: "5100" },
  { name: "OpenAI", match_pattern: "OPENAI", account_code: "5100" },
  { name: "Fal.ai", match_pattern: "FAL.AI", account_code: "5100" },
  { name: "HubSpot", match_pattern: "HUBSPOT", account_code: "5100" },
  { name: "Make.com", match_pattern: "MAKE.COM", account_code: "5100" },
  { name: "Trellus", match_pattern: "TRELLUS", account_code: "5100" },
  { name: "Twilio", match_pattern: "TWILIO", account_code: "5400" },
  { name: "USPS", match_pattern: "USPS", account_code: "5200" },
  { name: "Amazon", match_pattern: "AMAZON", account_code: "5250" },
  { name: "FEX Quotes", match_pattern: "FEX", account_code: "5300" },
  { name: "Vistaprint", match_pattern: "VISTAPRINT", account_code: "5000" },
  { name: "Copart", match_pattern: "COPART", account_code: "5900" },
];

const NEEDS_JULIE = /COPART/i;
const DATE_LINE = /^(\d{2}\/\d{2})\s*$/;
const AMOUNT_LINE = /^-?(?:[\d,]+\.\d{2}|\.\d{2})$/;

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

function moneyFromSummary(text, label) {
  const re = new RegExp(label + "[:]?\\s+([+\\-]?)\\s*\\$?([\\d,]+\\.\\d{2})");
  const m = text.match(re);
  if (!m) return null;
  return moneyToCents(m[1] + m[2]);
}

function parseClosing(text) {
  const m = text.match(
    /Opening\/Closing Date[:\s\n]*(\d{2}\/\d{2}\/\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})/i
  );
  if (!m) return null;
  return { open: toIso(m[1]), close: toIso(m[2]), closeRaw: m[2] };
}

function toIso(mmddyy) {
  const [mm, dd, yy] = mmddyy.split("/").map((x) => parseInt(x, 10));
  const y = yy < 100 ? 2000 + yy : yy;
  return `${y}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function txnIso(mmdd, closeIso) {
  const [mm, dd] = mmdd.split("/").map((x) => parseInt(x, 10));
  const [cy, cm, cd] = closeIso.split("-").map((x) => parseInt(x, 10));
  let y = cy;
  if (mm > cm || (mm === cm && dd > cd)) y -= 1;
  return `${y}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

function pdfText(pdfPath) {
  try {
    return execFileSync("pdftotext", ["-layout", pdfPath, "-"], {
      encoding: "utf8",
      maxBuffer: 8 * 1024 * 1024,
    });
  } catch (err) {
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
}

function parsePdf(pdfPath) {
  const text = pdfText(pdfPath);
  const range = parseClosing(text);
  if (!range) throw new Error("No opening/closing date in " + path.basename(pdfPath));
  const summary = {
    file: path.basename(pdfPath),
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
  const lines = body.split(/\n/).map((l) => l.trim()).filter(Boolean);
  const txns = [];
  const inline = /^(\d{2}\/\d{2})\s+(.+?)\s+([+\-]?(?:[\d,]+\.\d{2}|\.\d{2}))$/;
  for (let i = 0; i < lines.length; i++) {
    const one = lines[i].match(inline);
    if (one && !/TRANSACTIONS THIS CYCLE|INCLUDING PAYMENTS/i.test(one[2])) {
      const merchant = one[2].replace(/\s+/g, " ").trim();
      if (!/JULIE BRAUNSROTH|JUSTIN BRAUNSROTH/i.test(merchant)) {
        txns.push({
          date: txnIso(one[1], range.close),
          payee: merchant,
          amount_cents: moneyToCents(one[3]),
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
    const merchant = desc.join(" ").replace(/\s+/g, " ").trim();
    if (/TRANSACTIONS THIS CYCLE|INCLUDING PAYMENTS|JULIE BRAUNSROTH|JUSTIN BRAUNSROTH/i.test(merchant)) {
      i = j;
      continue;
    }
    if (!merchant) continue;
    txns.push({
      date: txnIso(dm[1], range.close),
      payee: merchant,
      amount_cents: moneyToCents(lines[j]),
    });
    i = j;
  }

  const purchSum = txns.filter((t) => t.amount_cents > 0).reduce((s, t) => s + t.amount_cents, 0);
  const paySum = txns.filter((t) => t.amount_cents < 0).reduce((s, t) => s + t.amount_cents, 0);
  return { summary, txns, purchSum, paySum };
}

function classify(payee, vendors) {
  const hit = A.matchVendor(payee, vendors);
  if (hit) {
    const code = hit.account_code || hit._code;
    return { code, name: hit.name, needsJulie: NEEDS_JULIE.test(payee) };
  }
  return { code: "5900", name: "Unmapped", needsJulie: true };
}

function isPayment(payee) {
  return /AUTOMATIC PAYMENT|THANK YOU|CREDIT CRD AUTOPAY/i.test(payee);
}

async function postEntry(cfg, { date, memo, payee, source, lines, createdBy, voidOf }) {
  const check = A.validateLines(lines);
  if (!check.ok) throw new Error(check.error);
  const inserted = await restInsert(cfg, "staff_acct_entries", [
    {
      entry_date: date,
      memo: memo || "",
      payee: payee || "",
      source: source || "journal",
      status: "posted",
      created_by: createdBy || "chase-statement-import",
      posted_at: new Date().toISOString(),
      void_of: voidOf || null,
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

async function voidPosted(cfg, orig) {
  const existingVoids = await restSelect(
    cfg,
    "staff_acct_entries",
    `select=id&void_of=eq.${encodeURIComponent(orig.id)}&limit=20`
  );
  for (const v of existingVoids || []) {
    await restPatch(cfg, "staff_acct_entries", `id=eq.${encodeURIComponent(v.id)}`, {
      status: "voided",
      voided_at: new Date().toISOString(),
    });
  }
  await restPatch(cfg, "staff_acct_entries", `id=eq.${encodeURIComponent(orig.id)}`, {
    status: "voided",
    voided_at: new Date().toISOString(),
  });
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
      notes: "From Chase card statements",
    });
    have.add(key);
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

function fingerprint(date, payee, cents) {
  return [date, A.normalizePayee(payee).slice(0, 24), String(cents)].join("|");
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
  parsed.sort((a, b) => a.summary.close.localeCompare(b.summary.close));

  const allTxns = [];
  const seen = new Set();
  for (const p of parsed) {
    const purchOk = p.purchSum === Math.abs(p.summary.purchases_cents || 0);
    const payOk = p.paySum === (p.summary.payments_cents || 0);
    console.log(
      `${p.summary.close}  prev ${((p.summary.previous_cents || 0) / 100).toFixed(2)}  purch ${((p.summary.purchases_cents || 0) / 100).toFixed(2)} (lines ${ (p.purchSum / 100).toFixed(2)}${purchOk ? "" : " MISMATCH"})  pays ${((p.summary.payments_cents || 0) / 100).toFixed(2)} (lines ${(p.paySum / 100).toFixed(2)}${payOk ? "" : " MISMATCH"})  new ${((p.summary.new_balance_cents || 0) / 100).toFixed(2)}  n=${p.txns.length}`
    );
    for (const t of p.txns) {
      const fp = fingerprint(t.date, t.payee, t.amount_cents);
      if (seen.has(fp)) continue;
      seen.add(fp);
      allTxns.push({ ...t, stmt: p.summary.close });
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

  const needsJulie = [];
  const unmapped = [];
  allTxns.forEach((t) => {
    if (isPayment(t.payee)) return;
    const c = classify(t.payee, vendors);
    t.account_code = c.code;
    t.vendor_name = c.name;
    if (c.needsJulie) needsJulie.push(t);
    if (c.name === "Unmapped") unmapped.push(t);
  });

  const posted = await restSelect(
    cfg,
    "staff_acct_entries",
    "select=id,entry_date,memo,payee,source,status&status=eq.posted&order=entry_date.asc&limit=5000"
  );

  const lastClose = parsed[parsed.length - 1].summary.close;
  const keepAfter = (posted || []).filter(
    (e) => e.entry_date > lastClose && e.source !== "opening" && e.source !== "void"
  );
  const keepIds = new Set(keepAfter.map((e) => e.id));
  const toVoid = (posted || []).filter((e) => !keepIds.has(e.id) && e.source !== "void");

  console.log(`Unique statement lines: ${allTxns.length}`);
  console.log(`Existing posted CRM entries: ${(posted || []).length}`);
  console.log(`Keep after ${lastClose}: ${keepAfter.length}`);
  if (unmapped.length) {
    console.log("Unmapped payees:");
    unmapped.forEach((t) => console.log(`  ${t.date} ${(t.amount_cents / 100).toFixed(2)} ${t.payee.slice(0, 60)}`));
  }
  if (needsJulie.length) {
    console.log("Needs Julie:");
    needsJulie.forEach((t) => console.log(`  ${t.date} ${(t.amount_cents / 100).toFixed(2)} ${t.payee.slice(0, 60)}`));
  }

  const reviewDir = path.join(__dirname, "..", "integrations", "accounting", "reviews");
  fs.mkdirSync(reviewDir, { recursive: true });
  fs.writeFileSync(
    path.join(reviewDir, "2026-09-20-chase-7672.json"),
    JSON.stringify(
      {
        summaries: parsed.map((p) => p.summary),
        txns: allTxns.map((t) => ({
          date: t.date,
          cents: t.amount_cents,
          payee: t.payee,
          account: t.account_code || (isPayment(t.payee) ? "1000" : null),
        })),
      },
      null,
      2
    )
  );

  if (dryRun) {
    console.log("Dry run — no CRM posts.");
    return;
  }

  for (const e of toVoid) {
    await voidPosted(cfg, e);
    process.stdout.write(".");
  }
  console.log(`\nVoided ${toVoid.length} posted entries (kept ${keepAfter.length} after ${lastClose}).`);

  const firstPrev = parsed[0].summary.previous_cents || 0;
  if (firstPrev) {
    const openDate = parsed[0].summary.open;
    const spec = A.openingLines(accounts, { "2000": firstPrev, "1010": 10229 });
    await postEntry(cfg, {
      date: openDate < "2025-12-24" ? openDate : "2025-12-23",
      memo: "Opening from Chase card statement previous balance + savings",
      payee: "",
      source: "opening",
      lines: spec.map((ln) => ({
        account_id: codes[ln.account_code].id,
        side: ln.side,
        amount_cents: ln.amount_cents,
      })),
    });
    await restPatch(cfg, "staff_acct_settings", "id=eq.1", {
      opening_date: "2025-12-23",
      updated_at: new Date().toISOString(),
      updated_by: "chase-statement-import",
    });
    console.log("Posted opening (card previous balance + savings).");
  }

  let postedN = 0;
  for (const t of allTxns) {
    const abs = Math.abs(t.amount_cents);
    let lines;
    if (isPayment(t.payee) || t.amount_cents < 0) {
      if (isPayment(t.payee)) {
        lines = [
          { account_id: codes["2000"].id, side: "debit", amount_cents: abs },
          { account_id: codes["1000"].id, side: "credit", amount_cents: abs },
        ];
      } else {
        const exp = codes[t.account_code || "5900"];
        lines = [
          { account_id: codes["2000"].id, side: "debit", amount_cents: abs },
          { account_id: exp.id, side: "credit", amount_cents: abs },
        ];
      }
    } else {
      const exp = codes[t.account_code || "5900"];
      lines = [
        { account_id: exp.id, side: "debit", amount_cents: abs },
        { account_id: codes["2000"].id, side: "credit", amount_cents: abs },
      ];
    }
    await postEntry(cfg, {
      date: t.date,
      memo: "Chase statement " + t.stmt,
      payee: t.payee.replace(/\s+/g, " ").slice(0, 180),
      source: "import",
      lines,
    });
    postedN++;
  }
  console.log(`Posted ${postedN} statement lines.`);
  console.log(`Left ${keepAfter.length} posted entries after ${lastClose} in place.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
