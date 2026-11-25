# US Import Duty & Full Landed Cost Estimator

100% client-side US import tariff, CBP fee, and DDP retail pricing workbench for Shopify, Amazon, and WooCommerce importers. Zero server dependencies, zero spreadsheet upload privacy risk.

## What It Calculates Deterministically
- **Base USITC MFN Duty** across 26 curated e-commerce HTS categories + manual custom HTS/rate override.
- **Chapter 99 China Section 301** (List 3 `25%`, List 4A `7.5%`, battery hike `25%`) — with explicit country-of-manufacture warnings for China-made goods routed through Canada or the EU.
- **Section 232 Steel & Aluminum (`25%`)** for steel/aluminum derivatives.
- **USMCA / CUSMA Preference (`CA` / `MX`)** — waives Base MFN (`0%`) and CBP MPF (`$0.00` per 19 CFR 24.23(c)(3)).
- **Exact CBP Merchandise Processing Fee (MPF)** — Formal `0.3464%` clamped to `$32.71` min / `$634.62` max; Informal `$2.62` for eligible entries `<= $2,500`; automatic formal entry trigger when Section 301/232 applies.
- **Ocean Harbor Maintenance Fee (HMF)** — `0.125%` for ocean freight, `$0` for air/courier/truck.
- **Batch SKU CSV Analyzer** — Free web edition previews up to 5 SKUs; **Offline Pro (`$19`)** unlocks unlimited SKUs + downloadable `us-landed-cost-breakdown.csv` and `ddp-pricing-runbook.md`.

## Build, Test & Deploy
```bash
npm test
npm run build
npx wrangler deploy
```

## Offline Pro Edition ($19)
Upload `release/us-import-duty-estimator-pro.html` to Payhip using the copy-paste kit in `PAYHIP_LISTING.md`.
