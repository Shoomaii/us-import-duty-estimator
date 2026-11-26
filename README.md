# US Import Duty & Full Landed Cost Estimator

100% client-side US import tariff, CBP fee, and DDP retail pricing workbench for Shopify, Amazon, and WooCommerce importers. Zero server dependencies, zero spreadsheet upload privacy risk.

## What It Calculates Deterministically
- **Base USITC MFN Duty** across 25 curated e-commerce HTS categories + explicit manual rate override (unrecognized HTS codes or unconfirmed 6-digit headings block export until a confirmed MFN rate is entered).
- **Chapter 99 China Section 301** (List 3 `25%`, List 4A `7.5%`, battery hike `25%`) — applied to China (`CN`) origin; Hong Kong (`HK`) is preserved independently (EO 13936 affects marking, not Section 301 assessment).
- **Section 232 Steel & Aluminum (`25%`)** for steel/aluminum derivatives.
- **USMCA / CUSMA Preference (`CA` / `MX`)** — waives Base MFN (`0%`) and CBP MPF (`$0.00` per 19 CFR 24.23(c)(3)).
- **Entry-Date-Versioned CBP Merchandise Processing Fee (MPF):**
  - **FY2027 (effective Oct 1, 2026 — Federal Register 2026-15530 Table 2):** `0.3464%` formal entry clamped to **`$34.58` min / `$670.86` max**; automated informal **`$2.77`** (`<= $2,500` non-remedy).
  - **FY2026 (prior to Oct 1, 2026):** `0.3464%` formal entry clamped to `$32.71` min / `$634.62` max; automated informal `$2.62`.
- **Ocean Harbor Maintenance Fee (HMF)** — `0.125%` for ocean freight, `$0` for air/courier/truck.
- **Batch SKU CSV Analyzer** — Supports **Single Consolidated Entry** (exact integer-cent pro-rata MPF & broker fee allocation) or **Separate Entry per SKU**. Free web edition previews up to 5 SKUs; **Offline Pro (`$19`)** unlocks unlimited SKUs + downloadable `us-landed-cost-breakdown.csv` and `ddp-pricing-runbook.md`.

## Build, Test & Deploy
```bash
npm test
PRO_CHECKOUT_URL="https://payhip.com/b/YOUR_LIVE_ID" npm run build
npx wrangler deploy
```
*(The generated `release/us-import-duty-estimator-pro.html` file is `.gitignore`d so the paid Pro file is built locally for Payhip fulfillment and never exposed in the public repository.)*
