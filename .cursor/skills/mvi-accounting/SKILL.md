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
- Journal, opening balances
- P&L, Balance Sheet, Trial Balance, General Ledger

## Do

1. Keep Patriot running until the CRM books have been used for a few months.
2. Never print EIN, bank account numbers, or Patriot customer IDs.
3. Classify from the vendor map / Accounting → Vendors tab the same way as Patriot.
4. Credit-card payments are transfers (Checking ↔ Credit Card), not expenses.

## Files

- UI: `js/staff-crm-accounting.js`, `css/staff-crm-accounting.css`
- API: `api/staff/accounting.js`
- Engine: `lib/staff-accounting.js`
- Schema: `integrations/supabase/migrations/099_staff_accounting.sql`
