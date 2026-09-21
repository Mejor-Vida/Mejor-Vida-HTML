---
name: mvi-accounting
description: Staff CRM Accounting tab — parallel books next to Patriot Software. Use when Julie mentions the Accounting tab, MVI books, imported bank CSV, chart of accounts, P&L, or switching off Patriot.
---

# MVI Accounting (Staff CRM)

Parallel books live in the Staff CRM **Accounting** tab (`#/accounting`). Patriot stays official until Julie says to switch.

## What it is

Modified-cash double-entry modeled on Patriot Accounting Premium (not payroll, not invoicing):

- Chart of accounts (Checking, Savings, Credit Card, commission, ads, software, etc.)
- Vendor match from the bank description
- Import Chase CSV → review → post
- **Upload Chase card or Cornhusker checking PDFs** on Accounting → Statements (also on Home). Posts unique lines automatically. Same PDF will not double-post.
- Journal, opening balances, **close period**, **bank/card reconcile** (check off PDF lines — **no Plaid or live feed**)
- Register with running balance, CSV export, void log
- P&L, Balance Sheet, Trial Balance, General Ledger

## Do

1. Keep Patriot running until the CRM books have been used for a few months.
2. Never print EIN, bank account numbers, or Patriot customer IDs.
3. Classify from the vendor map / Accounting → Vendors tab the same way as Patriot.
4. Credit-card payments are transfers (Checking ↔ Credit Card), not expenses.
5. **Whenever Patriot is updated (imports, dismissals, journal, recategorize), update this tab in the same sitting.** Duplicate bank rows that Patriot dismisses stay unposted here too.
6. **Chase often sends the same charge twice.** CRM must post **one** of each date+payee+amount. Upload the official PDF statements rather than copying Patriot’s GL. **Do not add a live bank feed** — that is how Patriot doubled entries.
7. **Do not copy Patriot trial-balance totals into CRM openings** while Patriot still has those doubles. Openings come from the bank/card statement (one payment, one charge).

## Files

- UI: `js/staff-crm-accounting.js`, `css/staff-crm-accounting.css`
- API: `api/staff/accounting.js`
- Engine: `lib/staff-accounting.js`
- Schema: `integrations/supabase/migrations/099_staff_accounting.sql`, `101_staff_acct_statements.sql`, `102_staff_acct_reconcile_close.sql`
