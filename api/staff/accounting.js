const { requireStaffAuth } = require("../auth-check");
const { json, readJsonBody, serviceConfig, restSelect, restPatch, restInsert } = require("./_inbox-lib");
const A = require("../../lib/staff-accounting");
const { parseStatementText } = require("../../lib/staff-statement-parse");
const { pdfBufferToText } = require("../../lib/staff-statement-pdf");
const { fileSha, postParsedStatement } = require("../../lib/staff-statement-import");

function emailOf(auth) {
  return (auth && auth.user && auth.user.email) || null;
}

function byCode(accounts) {
  const m = {};
  (accounts || []).forEach((a) => {
    m[a.code] = a;
    m[a.id] = a;
  });
  return m;
}

function findRegisterAccount(accounts, id) {
  const list = accounts || [];
  return (
    list.find((a) => a.id === id || a.code === id) ||
    list.find((a) => a.code === "1000") ||
    list[0] ||
    null
  );
}

function closedError(res, e) {
  const msg = (e && e.message) || "";
  if (/closed period/i.test(msg)) return json(res, 400, { error: msg });
  return null;
}

async function loadAccounts(cfg) {
  return restSelect(
    cfg,
    "staff_acct_accounts",
    "select=id,code,name,type,subtype,is_system,is_active,sort_order&order=sort_order.asc"
  );
}

async function loadVendors(cfg) {
  return restSelect(
    cfg,
    "staff_acct_vendors",
    "select=id,name,match_pattern,default_account_id,notes,created_at&order=name.asc"
  );
}

async function loadSettings(cfg) {
  const rows = await restSelect(cfg, "staff_acct_settings", "select=id,books_name,basis,opening_date,closed_through,updated_at&id=eq.1");
  return rows && rows[0]
    ? rows[0]
    : { books_name: "Mejor Vida Insurance LLC", basis: "modified_cash", opening_date: null, closed_through: null };
}

async function ensureSeeded(cfg) {
  const existing = await restSelect(cfg, "staff_acct_accounts", "select=id&limit=1");
  if (existing && existing.length) return;
  await restInsert(
    cfg,
    "staff_acct_accounts",
    A.CHART.map((a) => ({
      code: a.code,
      name: a.name,
      type: a.type,
      subtype: a.subtype,
      is_system: a.system,
      is_active: true,
      sort_order: a.sort_order,
    }))
  );
  const accounts = await loadAccounts(cfg);
  const codes = byCode(accounts);
  await restInsert(
    cfg,
    "staff_acct_vendors",
    A.VENDORS.map((v) => ({
      name: v.name,
      match_pattern: v.match_pattern,
      default_account_id: codes[v.account_code] ? codes[v.account_code].id : null,
      notes: "",
    }))
  );
  const settings = await restSelect(cfg, "staff_acct_settings", "select=id&id=eq.1");
  if (!settings || !settings.length) {
    await restInsert(cfg, "staff_acct_settings", [
      { id: 1, books_name: "Mejor Vida Insurance LLC", basis: "modified_cash" },
    ]);
  }
}

function flattenPosted(rows) {
  const out = [];
  (rows || []).forEach((ln) => {
    const entry = ln.entry || {};
    const account = ln.account || {};
    if (entry.status && entry.status !== "posted") return;
    out.push({
      id: ln.id,
      entry_id: ln.entry_id,
      account_id: ln.account_id,
      account_code: account.code,
      account_name: account.name,
      account_type: account.type,
      sort_order: account.sort_order,
      side: ln.side,
      amount_cents: ln.amount_cents,
      memo: ln.memo || entry.memo || "",
      payee: entry.payee || "",
      source: entry.source || "",
      entry_date: entry.entry_date,
    });
  });
  return out;
}

async function loadPostedLines(cfg, start, end) {
  let q =
    "select=id,side,amount_cents,memo,sort_order,account_id,entry_id,account:staff_acct_accounts(id,code,name,type,subtype,sort_order),entry:staff_acct_entries!inner(id,entry_date,memo,payee,source,status)&entry.status=eq.posted&limit=20000";
  if (start) q += `&entry.entry_date=gte.${encodeURIComponent(start)}`;
  if (end) q += `&entry.entry_date=lte.${encodeURIComponent(end)}`;
  const rows = await restSelect(cfg, "staff_acct_lines", q);
  return flattenPosted(rows);
}

async function postEntry(cfg, { date, memo, payee, source, lines, importId, createdBy, voidOf }) {
  const settings = await loadSettings(cfg);
  if (A.isClosedDate(settings.closed_through, date) && source !== "void") {
    throw new Error("That date is in a closed period.");
  }
  const check = A.validateLines(lines);
  if (!check.ok) throw new Error(check.error);
  const inserted = await restInsert(cfg, "staff_acct_entries", [
    {
      entry_date: date,
      memo: memo || "",
      payee: payee || "",
      source: source || "journal",
      status: "posted",
      import_id: importId || null,
      created_by: createdBy || null,
      posted_at: new Date().toISOString(),
      void_of: voidOf || null,
    },
  ]);
  const entry = Array.isArray(inserted) ? inserted[0] : inserted;
  if (!entry || !entry.id) throw new Error("Could not create journal entry");
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

async function alreadyPostedSimilar(cfg, { date, amountCents, description, register, counterpart }) {
  const abs = Math.abs(Number(amountCents) || 0);
  const day = A.isoDate(date);
  if (!day || !abs) return null;
  const rows = await restSelect(
    cfg,
    "staff_acct_entries",
    `select=id,payee,source,status&entry_date=eq.${encodeURIComponent(day)}&status=eq.posted&limit=80`
  );
  const needle = A.normalizePayee(description);
  const transferLike =
    register &&
    counterpart &&
    ((register.subtype === "credit_card" && (counterpart.subtype === "bank" || counterpart.code === "1000")) ||
      (register.subtype === "bank" && counterpart.subtype === "credit_card"));
  for (const e of rows || []) {
    const lines = await restSelect(
      cfg,
      "staff_acct_lines",
      `select=amount_cents,account_id&entry_id=eq.${encodeURIComponent(e.id)}&limit=12`
    );
    if (!(lines || []).some((ln) => Math.abs(Number(ln.amount_cents) || 0) === abs)) continue;
    const pay = A.normalizePayee(e.payee);
    if (needle && pay && (pay.includes(needle.slice(0, 10)) || needle.includes(pay.slice(0, 10)))) {
      return { id: e.id, reason: "same_payee_date_amount" };
    }
    if (transferLike && /AUTOMATIC PAYMENT|CREDIT CRD AUTOPAY|THANK YOU/i.test(String(e.payee || "") + " " + description)) {
      return { id: e.id, reason: "same_card_payment" };
    }
  }
  return null;
}

function hydrateImportLines(register, counterpart, amountCents, accounts) {
  const codes = byCode(accounts);
  const spec = A.counterpartForImport(register, counterpart, amountCents);
  if (!spec) return null;
  return spec.map((ln) => {
    const acct = codes[ln.account_code];
    return { account_id: acct && acct.id, side: ln.side, amount_cents: ln.amount_cents };
  });
}

async function dashboard(cfg, accounts) {
  const end = A.todayIso();
  const start = A.monthStart(end);
  const lines = await loadPostedLines(cfg, null, end);
  const tb = A.trialBalance(accounts, lines);
  const monthLines = lines.filter((ln) => ln.source !== "opening");
  const pl = A.profitAndLoss(accounts, monthLines, start, end);
  const pending = await restSelect(
    cfg,
    "staff_acct_imports",
    "select=id&status=eq.pending&limit=500"
  );
  const pick = (code) => {
    const acct = accounts.find((a) => a.code === code);
    const row = acct && tb.rows.find((r) => r.id === acct.id);
    return { account: acct, balance_cents: row ? row.balance_cents : 0 };
  };
  return {
    start,
    end,
    checking: pick("1000"),
    savings: pick("1010"),
    credit_card: pick("2000"),
    income_cents: pl.income_cents,
    expense_cents: pl.expense_cents,
    net_cents: pl.net_cents,
    pending_count: (pending || []).length,
  };
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;
  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  try {
    await ensureSeeded(cfg);
  } catch (e) {
    console.error("staff/accounting seed", e);
    return json(res, 500, { error: "Could not initialize the books" });
  }

  if (req.method === "GET") {
    const url = new URL(req.url, "http://localhost");
    const view = String(url.searchParams.get("view") || "bootstrap").trim();
    const start = A.isoDate(url.searchParams.get("start") || "") || A.monthStart(A.todayIso());
    const end = A.isoDate(url.searchParams.get("end") || "") || A.todayIso();
    const report = String(url.searchParams.get("report") || "pl").trim();
    try {
      const accounts = await loadAccounts(cfg);
      const vendors = await loadVendors(cfg);
      const settings = await loadSettings(cfg);
      if (view === "bootstrap" || view === "home") {
        const dash = await dashboard(cfg, accounts);
        return json(res, 200, { accounts, vendors, settings, dashboard: dash });
      }
      if (view === "review") {
        const rows = await restSelect(
          cfg,
          "staff_acct_imports",
          "select=id,account_id,txn_date,amount_cents,description,suggested_account_id,status,created_at&status=eq.pending&order=txn_date.desc&limit=1000"
        );
        return json(res, 200, { accounts, vendors, settings, items: rows || [] });
      }
      if (view === "vendors") return json(res, 200, { accounts, vendors, settings });
      if (view === "accounts") return json(res, 200, { accounts, vendors, settings });
      if (view === "statements") {
        const rows = await restSelect(
          cfg,
          "staff_acct_statements",
          "select=id,file_name,kind,period_start,period_end,begin_cents,end_cents,status,posted_count,skipped_count,needs_julie,error,created_at&order=created_at.desc&limit=80"
        );
        return json(res, 200, { accounts, vendors, settings, statements: rows || [] });
      }
      if (view === "register") {
        const account = findRegisterAccount(accounts, url.searchParams.get("accountId"));
        if (!account) return json(res, 400, { error: "Choose Checking, Savings, or Credit Card." });
        const lines = await loadPostedLines(cfg, null, end);
        const voids = await restSelect(
          cfg,
          "staff_acct_entries",
          "select=id,entry_date,payee,memo,voided_at,status&status=eq.voided&order=voided_at.desc&limit=40"
        );
        return json(res, 200, {
          accounts,
          vendors,
          settings,
          report: A.accountRegister(account, lines, start, end),
          voids: voids || [],
        });
      }
      if (view === "reconcile") {
        const account = findRegisterAccount(accounts, url.searchParams.get("accountId"));
        if (!account) return json(res, 400, { error: "Choose Checking, Savings, or Credit Card." });
        const stmtDate = end;
        const lines = await loadPostedLines(cfg, null, stmtDate);
        const report = A.accountRegister(account, lines, null, stmtDate);
        const marks = await restSelect(
          cfg,
          "staff_acct_recon_marks",
          `select=line_id,recon_id&account_id=eq.${encodeURIComponent(account.id)}`
        );
        const recs = await restSelect(
          cfg,
          "staff_acct_reconciliations",
          `select=id,account_id,statement_date,statement_cents,difference_cents,status,created_at&account_id=eq.${encodeURIComponent(account.id)}&order=statement_date.desc&limit=12`
        );
        const kind = account.code === "2000" ? "chase_card" : account.code === "1000" ? "cornhusker_checking" : "";
        let suggested_cents = null;
        if (kind) {
          const stmts = await restSelect(
            cfg,
            "staff_acct_statements",
            `select=end_cents,period_end,kind&kind=eq.${encodeURIComponent(kind)}&status=eq.processed&order=period_end.desc&limit=8`
          );
          const match = (stmts || []).find((s) => s.period_end === stmtDate) || (stmts && stmts[0]);
          if (match && match.end_cents != null) suggested_cents = match.end_cents;
        }
        return json(res, 200, {
          accounts,
          vendors,
          settings,
          report,
          markedLineIds: (marks || []).map((m) => m.line_id),
          reconciliations: recs || [],
          suggested_cents,
        });
      }
      if (view === "report") {
        const asOf = end;
        const histStart = report === "bs" || report === "tb" ? null : start;
        const lines = await loadPostedLines(cfg, histStart, asOf);
        const payload = { accounts, settings, start, end };
        if (report === "pl") payload.report = A.profitAndLoss(accounts, lines, start, end);
        else if (report === "bs") payload.report = A.balanceSheet(accounts, lines, asOf);
        else if (report === "tb") payload.report = A.trialBalance(accounts, lines);
        else if (report === "gl") payload.report = A.generalLedger(accounts, lines, start, end);
        else return json(res, 400, { error: "Unknown report" });
        return json(res, 200, payload);
      }
      return json(res, 400, { error: "Unknown view" });
    } catch (e) {
      console.error("staff/accounting GET", e);
      return json(res, 500, { error: e.message || "Failed to load accounting" });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = readJsonBody(req);
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }
  const action = String(body.action || "").trim();
  const createdBy = emailOf(auth);

  try {
    const accounts = await loadAccounts(cfg);
    const vendors = await loadVendors(cfg);
    const codes = byCode(accounts);

    if (action === "import") {
      const account = codes[body.accountId] || codes[body.accountCode];
      if (!account) return json(res, 400, { error: "Choose Checking, Savings, or Credit Card." });
      const accountType = account.subtype === "credit_card" ? "credit_card" : "bank";
      const parsed = A.parseBankCsv(body.csv || "", { accountType });
      if (parsed.error) return json(res, 400, { error: parsed.error });
      let inserted = 0;
      let skipped = 0;
      for (const row of parsed.rows) {
        const vendor = A.matchVendor(row.description, vendors);
        const suggestedRaw = vendor && vendor.default_account_id ? codes[vendor.default_account_id] : null;
        const suggested = A.resolveCounterpart(account, suggestedRaw, accounts);
        const fp = A.fingerprint(account.id, row.txn_date, row.amount_cents, row.description);
        try {
          await restInsert(cfg, "staff_acct_imports", [
            {
              account_id: account.id,
              txn_date: row.txn_date,
              amount_cents: row.amount_cents,
              description: row.description,
              fingerprint: fp,
              suggested_account_id: suggested ? suggested.id : null,
              status: "pending",
            },
          ]);
          inserted += 1;
        } catch (err) {
          const msg = String(err.message || err);
          if (/duplicate|23505/i.test(msg)) skipped += 1;
          else throw err;
        }
      }
      return json(res, 200, { inserted, skipped, total: parsed.rows.length });
    }

    if (action === "classify") {
      const id = String(body.id || "").trim();
      const counterpart = codes[body.accountId];
      if (!id || !counterpart) return json(res, 400, { error: "Pick a category account." });
      await restPatch(cfg, "staff_acct_imports", `id=eq.${encodeURIComponent(id)}`, {
        suggested_account_id: counterpart.id,
      });
      return json(res, 200, { ok: true });
    }

    if (action === "ignore") {
      const id = String(body.id || "").trim();
      if (!id) return json(res, 400, { error: "Missing id" });
      await restPatch(cfg, "staff_acct_imports", `id=eq.${encodeURIComponent(id)}`, { status: "ignored" });
      return json(res, 200, { ok: true });
    }

    if (action === "post-import") {
      const ids = Array.isArray(body.ids) ? body.ids.map(String) : body.id ? [String(body.id)] : [];
      if (!ids.length) return json(res, 400, { error: "Nothing to post" });
      const filter = ids.map((id) => `"${id}"`).join(",");
      const items = await restSelect(
        cfg,
        "staff_acct_imports",
        `select=id,account_id,txn_date,amount_cents,description,suggested_account_id,status&id=in.(${filter})&status=eq.pending`
      );
      let posted = 0;
      const errors = [];
      for (const item of items || []) {
        const register = codes[item.account_id];
        const counterpart = codes[item.suggested_account_id];
        if (!register || !counterpart) {
          errors.push({ id: item.id, error: "Choose a category first." });
          continue;
        }
        const lines = hydrateImportLines(register, counterpart, item.amount_cents, accounts);
        if (!lines || lines.some((ln) => !ln.account_id)) {
          errors.push({ id: item.id, error: "Could not build the journal." });
          continue;
        }
        const dup = await alreadyPostedSimilar(cfg, {
          date: item.txn_date,
          amountCents: item.amount_cents,
          description: item.description,
          register,
          counterpart,
        });
        if (dup) {
          await restPatch(cfg, "staff_acct_imports", `id=eq.${encodeURIComponent(item.id)}`, {
            status: "ignored",
          });
          errors.push({
            id: item.id,
            error: "Skipped duplicate — already on the books (" + dup.reason + ").",
          });
          continue;
        }
        const settingsNow = await loadSettings(cfg);
        if (A.isClosedDate(settingsNow.closed_through, item.txn_date)) {
          errors.push({ id: item.id, error: "That date is in a closed period." });
          continue;
        }
        const entry = await postEntry(cfg, {
          date: item.txn_date,
          memo: "Imported transaction",
          payee: item.description,
          source: "import",
          lines,
          importId: item.id,
          createdBy,
        });
        await restPatch(cfg, "staff_acct_imports", `id=eq.${encodeURIComponent(item.id)}`, {
          status: "posted",
          posted_entry_id: entry.id,
        });
        posted += 1;
      }
      return json(res, 200, { posted, errors });
    }

    if (action === "journal") {
      const date = A.isoDate(body.date);
      const rawLines = Array.isArray(body.lines) ? body.lines : [];
      const lines = rawLines
        .map((ln) => {
          const acct = codes[ln.accountId] || codes[ln.account_id];
          const debit = A.toCents(ln.debit);
          const credit = A.toCents(ln.credit);
          if (!acct || (!debit && !credit)) return null;
          return {
            account_id: acct.id,
            side: debit ? "debit" : "credit",
            amount_cents: debit || credit,
            memo: ln.memo || "",
          };
        })
        .filter(Boolean);
      const entry = await postEntry(cfg, {
        date,
        memo: String(body.memo || "").trim(),
        payee: String(body.payee || "").trim(),
        source: "journal",
        lines,
        createdBy,
      });
      return json(res, 200, { entry });
    }

    if (action === "opening") {
      const date = A.isoDate(body.date) || A.todayIso();
      const balances = {};
      Object.entries(body.balances || {}).forEach(([code, val]) => {
        balances[code] = A.toCents(val);
      });
      const spec = A.openingLines(accounts, balances);
      if (!spec.length) return json(res, 400, { error: "Enter at least one opening balance." });
      const lines = spec.map((ln) => ({
        account_id: codes[ln.account_code] && codes[ln.account_code].id,
        side: ln.side,
        amount_cents: ln.amount_cents,
      }));
      const entry = await postEntry(cfg, {
        date,
        memo: "Opening balances (parallel books)",
        payee: "",
        source: "opening",
        lines,
        createdBy,
      });
      await restPatch(cfg, "staff_acct_settings", "id=eq.1", {
        opening_date: date,
        updated_at: new Date().toISOString(),
        updated_by: createdBy,
      });
      return json(res, 200, { entry });
    }

    if (action === "void") {
      const id = String(body.id || "").trim();
      if (!id) return json(res, 400, { error: "Missing entry" });
      const entries = await restSelect(
        cfg,
        "staff_acct_entries",
        `select=id,entry_date,memo,payee,status&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      const orig = entries && entries[0];
      if (!orig || orig.status !== "posted") return json(res, 400, { error: "Entry is not posted." });
      const lock = await loadSettings(cfg);
      if (A.isClosedDate(lock.closed_through, orig.entry_date)) {
        return json(res, 400, { error: "That date is in a closed period." });
      }
      const origLines = await restSelect(
        cfg,
        "staff_acct_lines",
        `select=account_id,side,amount_cents,memo&entry_id=eq.${encodeURIComponent(id)}`
      );
      const reverse = (origLines || []).map((ln) => ({
        account_id: ln.account_id,
        side: ln.side === "debit" ? "credit" : "debit",
        amount_cents: ln.amount_cents,
        memo: ln.memo || "",
      }));
      await postEntry(cfg, {
        date: A.todayIso(),
        memo: "Void: " + (orig.memo || orig.payee || orig.id),
        payee: orig.payee || "",
        source: "void",
        lines: reverse,
        createdBy,
        voidOf: orig.id,
      });
      await restPatch(cfg, "staff_acct_entries", `id=eq.${encodeURIComponent(id)}`, {
        status: "voided",
        voided_at: new Date().toISOString(),
      });
      return json(res, 200, { ok: true });
    }

    if (action === "statement-upload") {
      const fileName = String(body.fileName || "statement.pdf").replace(/[^A-Za-z0-9._ -]+/g, "-").slice(0, 120);
      let b64 = String(body.contentBase64 || "").trim();
      const comma = b64.indexOf(",");
      if (b64.startsWith("data:") && comma >= 0) b64 = b64.slice(comma + 1);
      if (!b64) return json(res, 400, { error: "Choose a PDF statement." });
      let bytes;
      try {
        bytes = Buffer.from(b64, "base64");
      } catch (e) {
        return json(res, 400, { error: "Could not read that PDF." });
      }
      if (bytes.length < 80 || bytes.length > 12 * 1024 * 1024) {
        return json(res, 400, { error: "That PDF is empty or too large (12 MB max)." });
      }
      const sha = fileSha(bytes);
      const existing = await restSelect(
        cfg,
        "staff_acct_statements",
        `select=id,file_name,kind,status,posted_count,skipped_count,needs_julie,error,period_end&file_sha256=eq.${encodeURIComponent(sha)}&limit=1`
      );
      if (existing && existing[0]) {
        return json(res, 200, {
          duplicate: true,
          statement: existing[0],
          posted: 0,
          skipped: existing[0].skipped_count || 0,
        });
      }
      let text = "";
      let parsed = { error: "Could not read PDF text." };
      try {
        text = await pdfBufferToText(bytes);
        parsed = parseStatementText(text);
      } catch (e) {
        parsed = { error: "Could not read that PDF." };
      }
      const objectPath = `${A.todayIso().slice(0, 7)}/${sha.slice(0, 16)}-${fileName.replace(/\s+/g, "-")}`;
      try {
        const up = await fetch(`${cfg.supabaseUrl}/storage/v1/object/staff-acct-statements/${objectPath}`, {
          method: "POST",
          headers: {
            apikey: cfg.serviceKey,
            Authorization: `Bearer ${cfg.serviceKey}`,
            "Content-Type": "application/pdf",
            "x-upsert": "true",
          },
          body: bytes,
        });
        if (!up.ok) {
          const errText = await up.text();
          console.error("statement storage", up.status, String(errText || "").slice(0, 180));
        }
      } catch (e) {
        console.error("statement storage", e.message || e);
      }
      if (parsed.error) {
        const failed = await restInsert(cfg, "staff_acct_statements", [
          {
            file_name: fileName,
            kind: parsed.kind || "unknown",
            storage_path: objectPath,
            file_sha256: sha,
            status: "failed",
            error: String(parsed.error).slice(0, 400),
            uploaded_by: createdBy || "",
          },
        ]);
        return json(res, 400, { error: parsed.error, statement: Array.isArray(failed) ? failed[0] : failed });
      }
      const result = await postParsedStatement(cfg, {
        parsed,
        vendors,
        accounts,
        restSelect,
        postEntry,
        createdBy,
        closedThrough: (await loadSettings(cfg)).closed_through,
      });
      const sum = parsed.summary || {};
      const inserted = await restInsert(cfg, "staff_acct_statements", [
        {
          file_name: fileName,
          kind: parsed.kind,
          period_start: sum.open || null,
          period_end: sum.close || null,
          begin_cents: sum.previous_cents != null ? sum.previous_cents : null,
          end_cents: sum.new_balance_cents != null ? sum.new_balance_cents : null,
          storage_path: objectPath,
          file_sha256: sha,
          status: "processed",
          posted_count: result.posted,
          skipped_count: result.skipped,
          needs_julie: (result.needsJulie || []).join("\n").slice(0, 2000),
          error: "",
          uploaded_by: createdBy || "",
        },
      ]);
      return json(res, 200, {
        statement: Array.isArray(inserted) ? inserted[0] : inserted,
        posted: result.posted,
        skipped: result.skipped,
        total: result.total,
        needsJulie: result.needsJulie || [],
        kind: parsed.kind,
        periodEnd: sum.close || null,
        endingCents: sum.new_balance_cents != null ? sum.new_balance_cents : null,
      });
    }

    if (action === "save-vendor") {
      const name = String(body.name || "").trim();
      const match_pattern = String(body.match_pattern || name).trim();
      const acct = codes[body.accountId];
      if (!name || !acct) return json(res, 400, { error: "Vendor needs a name and default account." });
      if (body.id) {
        await restPatch(cfg, "staff_acct_vendors", `id=eq.${encodeURIComponent(body.id)}`, {
          name,
          match_pattern,
          default_account_id: acct.id,
          notes: String(body.notes || "").trim(),
          updated_at: new Date().toISOString(),
        });
      } else {
        await restInsert(cfg, "staff_acct_vendors", [
          { name, match_pattern, default_account_id: acct.id, notes: String(body.notes || "").trim() },
        ]);
      }
      return json(res, 200, { ok: true });
    }

    if (action === "close-period") {
      const date = A.isoDate(body.date);
      if (!date) return json(res, 400, { error: "Choose a close date." });
      await restPatch(cfg, "staff_acct_settings", "id=eq.1", {
        closed_through: date,
        updated_at: new Date().toISOString(),
        updated_by: createdBy,
      });
      return json(res, 200, { ok: true, closed_through: date });
    }

    if (action === "recon-complete") {
      const account = findRegisterAccount(accounts, body.accountId);
      if (!account || (account.subtype !== "bank" && account.subtype !== "credit_card")) {
        return json(res, 400, { error: "Choose Checking, Savings, or Credit Card." });
      }
      const statementDate = A.isoDate(body.statementDate);
      if (!statementDate) return json(res, 400, { error: "Choose the statement ending date." });
      const statementCents = A.toCents(body.statementAmount);
      const lineIds = Array.isArray(body.lineIds) ? body.lineIds.map(String).filter(Boolean) : [];
      const lines = await loadPostedLines(cfg, null, statementDate);
      const report = A.accountRegister(account, lines, null, statementDate);
      const allowed = new Set(report.rows.map((r) => String(r.id)));
      const chosen = lineIds.filter((id) => allowed.has(id));
      if (!chosen.length) return json(res, 400, { error: "Check off the lines that are on the statement." });
      let cleared = 0;
      report.rows.forEach((r) => {
        if (chosen.indexOf(String(r.id)) >= 0) cleared += Number(r.delta_cents) || 0;
      });
      const difference = statementCents - cleared;
      if (difference !== 0) {
        return json(res, 400, {
          error: "Statement balance must match the checked lines before you finish.",
          difference_cents: difference,
          cleared_cents: cleared,
          statement_cents: statementCents,
        });
      }
      const rec = await restInsert(cfg, "staff_acct_reconciliations", [
        {
          account_id: account.id,
          statement_date: statementDate,
          statement_cents: statementCents,
          difference_cents: 0,
          status: "completed",
          created_by: createdBy || "",
        },
      ]);
      const recRow = Array.isArray(rec) ? rec[0] : rec;
      if (!recRow || !recRow.id) throw new Error("Could not save the reconciliation.");
      const existing = await restSelect(
        cfg,
        "staff_acct_recon_marks",
        `select=line_id&account_id=eq.${encodeURIComponent(account.id)}`
      );
      const have = new Set((existing || []).map((m) => String(m.line_id)));
      const marks = chosen
        .filter((id) => !have.has(id))
        .map((line_id) => ({ line_id, recon_id: recRow.id, account_id: account.id }));
      if (marks.length) await restInsert(cfg, "staff_acct_recon_marks", marks);
      return json(res, 200, { ok: true, reconciliation: recRow });
    }

    return json(res, 400, { error: "Unknown action" });
  } catch (e) {
    if (closedError(res, e)) return;
    console.error("staff/accounting POST", e);
    return json(res, 500, { error: e.message || "Accounting save failed" });
  }
};
