---
name: patriot-accounting
description: Weekly Patriot Software bookkeeping for Mejor Vida. Reviews imported bank transactions, classifies them from prior Patriot history, then briefs cash, P&L, and recommended changes. Use when the user mentions Patriot Software, accounting agent, weekly books, classify transactions, imported transactions, or a finance overview.
---

# Patriot accounting (weekly)

Julie connects the **MVI Agent Browser Bridge** to Patriot Software about once a week. Drive the already-logged-in Chrome tab. Do not invent Patriot URLs.

## Start

1. `npm run bridge:browser:status` — need `"armed": true`.
2. `npm run bridge:browser:cmd -- tabs` and `-- active` — confirm the control tab is Patriot (not Gmail, Ads, or the website).
3. If the bridge is off or the tab is wrong, stop. Tell Julie to open Patriot, turn **Bridge ON**, and say when ready.
4. Read [vendor-map.md](vendor-map.md) before touching transactions.
5. Screenshot + `text` after each important screen. Discover menus from what you see.

Bridge commands: `tools/agent-browser-bridge/README.md`.

## Privacy

- Never print EIN, Patriot customer ID, full bank account numbers, routing numbers, or SSN.
- Do not write dollar-amount reviews into files that get deployed with the website.
- Save weekly notes under `integrations/accounting/reviews/` (gitignored).
- Update [vendor-map.md](vendor-map.md) with **vendor → account** only (no amounts).

Tax identifiers for paperwork live in Supabase `staff_business_tax_profile` (service role only). Do not copy them into this skill or into chat.

## Weekly workflow

Copy and track:

```
Accounting week:
- [ ] Bridge on Patriot
- [ ] Imported / for-review transactions listed
- [ ] Each classified from history or flagged
- [ ] Vendor map updated
- [ ] P&L + cash + liabilities pulled
- [ ] Briefing delivered
```

### 1. Imported transactions

Find the bank feed / imported / “for review” / unmatched transactions (wording varies). Screenshot the list.

For **each** open transaction:

1. Read payee, amount, date, memo.
2. Look up the payee in `vendor-map.md`.
3. If no map row, search Patriot’s existing transactions or register for the same payee and copy **that** account.
4. If several past categories exist, use the most recent consistent one and note the conflict.
5. Apply the category in Patriot (same clicks a bookkeeper would use). Screenshot after save.
6. **Do not classify** if: new vendor, amount is far off the usual pattern, looks personal, looks like a transfer/payroll tax/owner draw you’re unsure of, or duplicate. Leave it and list it under “Needs Julie.”

Typical Mejor Vida vendors (confirm in Patriot, do not assume): Google Ads, Meta, HubSpot, Vercel, Telnyx, Make, ManyChat, carriers/IMOs, payroll, phone. Income is usually insurance commissions — match how prior commission deposits were booked.

Common traps:

- Payroll tax / 941 / Nebraska withholding payments are **liability payments**, not a new expense.
- Owner draw / distribution is not wages.
- Credit-card payments are **transfers**, not double-counted expenses if the charges were already categorized.
- Refunds go to the original expense/income account.

### 2. After the feed is clean

From Patriot reports (this month, last month, and year-to-date when available):

- Cash / bank balances (no full account numbers)
- Profit & Loss: revenue, ads, software, payroll, net
- Unpaid bills / money owed
- Payroll liabilities or filing reminders if shown
- Anything overdue, rejected imports, or unreconciled accounts

### 3. Brief Julie

Use this structure in chat (and save a copy to `integrations/accounting/reviews/YYYY-MM-DD.md`):

```markdown
# Weekly books — YYYY-MM-DD

## Classified this week
- N transactions categorized from prior history
- List: date, payee, account (no bank account numbers)

## Needs Julie
- Anything left uncategorized, with why

## How the finances look
- Cash:
- Revenue (period):
- Major expenses:
- Net:
- Compared with last period:

## Watch items
- Unusual amounts, missing deposits, ads spend spikes, payroll/tax dates

## Changes to consider
- Cash timing (card autopay vs checking), classification fixes, tax dates — not spend cuts unless she asks
```

Be direct. Lead with what is true. Do not dump raw tables. Do not give tax-filing advice beyond “this looks due / this looks off — confirm with your tax person.”

## Owner policy (Julie)

- **Losses are expected for now.** Do not recommend cutting ads, software, or other spend unless she asks.
- **Payroll is paused. No employees.** $0 payroll expense is correct. Do not flag missing payroll or suggest running payroll.
- BBB = **Professional Fees** (not Advertising).
- Anytime Mailbox can be higher some months because of **mail scanning fees** — still Office Expense, not a problem.

## First run

If `vendor-map.md` is empty, spend the first session **learning**: open recent categorized transactions, fill the vendor map, then classify the current import queue. Tell Julie it is a learning pass.

## Do not

- Log into Patriot yourself or reset passwords
- File payroll or tax forms unless explicitly asked
- Change chart of accounts, payroll employees, or bank connections
- Touch the public website, chatbot knowledge, or Meta/Google ads as part of this job
- Classify a transaction “to get through the list”
