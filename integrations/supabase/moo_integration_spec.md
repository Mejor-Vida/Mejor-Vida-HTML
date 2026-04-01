# Mutual of Omaha — Living Promise Integration Spec (Nebraska)

## Product Slug Strategy — Recommendation: Option A (3 slugs)

| Product Slug | Plan Type | Tobacco | Ages | Max Face | Policy Fee | File |
|---|---|---|---|---|---|---|
| `living_promise_level_nt` | Level | Non-Tobacco | 45–85 | $50,000 | $36/yr | `living_promise_level_nt_NE.csv` |
| `living_promise_level_t` | Level | Tobacco | 45–85 | $50,000 | $36/yr | `living_promise_level_t_NE.csv` |
| `living_promise_graded` | Graded | None (same rate) | 45–80 | $20,000 | $12/yr | `living_promise_graded_NE.csv` |

**Tobacco routing logic in the quote:**
```
if plan == "level":
    slug = "living_promise_level_t" if client.tobacco else "living_promise_level_nt"
else:
    slug = "living_promise_graded"   # tobacco flag ignored, same rate either way
```

---

## Premium Formula

```
annual_premium  = (face_amount / 1000 × base_rate_per_1k) + policy_fee_annual
monthly_bsp     = annual_premium × 0.089
```

The `base_rate_per_1k` and `policy_fee_annual` are stored per row in the CSVs.  
Do NOT use a face-amount multiplier — the fixed policy fee makes rates non-linear across face amounts.

---

## CSV Schema (all three slug files share the same columns)

| Column | Type | Notes |
|---|---|---|
| `product_slug` | string | e.g. `living_promise_level_nt` |
| `age` | integer | Issue age |
| `gender` | string | `male` or `female` |
| `tobacco` | string | `yes` or `no` (`no` for all graded rows) |
| `base_rate_per_1k` | decimal | Rate per $1,000 face amount |
| `policy_fee_annual` | integer | 36 (level) or 12 (graded) |
| `modal_factor` | decimal | 0.089 (BSP/EFT monthly) |
| `monthly_bsp_10k` | decimal | Pre-calculated at $10K for easy spot-checking |
| `min_face` | integer | 2000 |
| `max_face` | integer | 50000 (level) or 20000 (graded) |

---

## Minimum Face Amount

The Mutual of Omaha quoting system accepts **$2,000** as the minimum for both Level and Graded.  
If the site currently enforces $2,500, that's more conservative than required — either works, but $2,000 is accurate to the carrier.

---

## Validation Rules (enforce in the calculator)

| Condition | Error Message |
|---|---|
| Plan = Level, age > 85 | "Not eligible for Level Benefit above age 85" |
| Plan = Graded, age > 80 | "Not eligible for Graded Benefit above age 80" |
| Plan = Graded, face > $20,000 | "Maximum face amount for Graded Benefit is $20,000" |
| Plan = Level, face > $50,000 | "Maximum face amount for Level Benefit is $50,000" |
| Any plan, face < $2,000 | "Minimum face amount is $2,000" |

---

## Data Source

All base rates pulled directly from the Mutual of Omaha producer quoting API  
(`https://api.mutualofomaha.com/mobile-quotes/v1/products/lp/calculate`)  
for Nebraska (NE), 2026. All 236 age/gender/tobacco/plan combinations were  
queried and verified. Formula and BSP modal factor confirmed against live outputs.

