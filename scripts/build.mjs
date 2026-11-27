import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const engineSrc = fs.readFileSync(path.join(root, 'src', 'duty_engine.mjs'), 'utf8')
  .replace(/^export\s+/gm, '');

function renderHtml({ isPro }) {
  const title = isPro
    ? 'US Import Duty & Landed Cost Estimator — Offline Pro'
    : 'US Import Duty & Landed Cost Estimator — Section 301, MPF, HMF & DDP Calculator';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="Calculate US import duties (Base MFN + China Section 301 + Section 232 + CBP MPF + Ocean HMF), full landed cost per unit, and Shopify DDP retail pricing — single SKU or batch CSV, 100% in your browser." />
  <style>
    :root {
      --bg: #f6f7f5;
      --paper: #ffffff;
      --ink: #11181c;
      --muted: #556068;
      --line: #dfe4e2;
      --accent: #0f6b4f;
      --accent-soft: #e6f4ee;
      --warn: #b45309;
      --warn-soft: #fef3c7;
      --danger: #b91c1c;
      --danger-soft: #fee2e2;
      --radius: 12px;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0; background: var(--bg); color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5; -webkit-font-smoothing: antialiased;
    }
    .wrap { max-width: 1120px; margin: 0 auto; padding: 24px 18px 64px; }
    header {
      display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between;
      gap: 14px; padding-bottom: 18px; border-bottom: 1px solid var(--line);
    }
    .eyebrow {
      font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
      color: var(--accent); margin-bottom: 6px;
    }
    h1 { font-size: clamp(23px, 4vw, 33px); line-height: 1.15; margin: 0; letter-spacing: -0.02em; }
    .sub { color: var(--muted); font-size: 14.5px; margin: 6px 0 0; max-width: 700px; }
    .badge {
      display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px;
      font-size: 12.5px; font-weight: 700;
      background: ${isPro ? '#11181c' : 'var(--accent-soft)'};
      color: ${isPro ? '#ffffff' : 'var(--accent)'};
    }

    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
    .tab {
      border: 1px solid var(--line); background: var(--paper); color: var(--muted);
      padding: 9px 16px; border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer;
    }
    .tab.active { background: var(--ink); color: #fff; border-color: var(--ink); }

    .grid-2 { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); gap: 16px; margin-top: 14px; }
    @media (max-width: 860px) { .grid-2 { grid-template-columns: 1fr; } }

    .card {
      background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius); padding: 18px;
    }
    .card h2 { font-size: 17px; margin: 0 0 12px; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
    label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 4px; }
    select, input[type="text"], input[type="number"], textarea {
      width: 100%; border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px;
      font: inherit; font-size: 14px; background: #fff; color: var(--ink);
    }
    input[type="text"], input[type="number"], select { height: 40px; }
    textarea { min-height: 165px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12.5px; resize: vertical; }
    .check-row { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 500; margin-top: 8px; }
    .btn {
      height: 40px; padding: 0 16px; border-radius: 8px; border: 1px solid var(--line);
      background: #fff; color: var(--ink); font: inherit; font-weight: 600; font-size: 14px;
      cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      text-decoration: none;
    }
    .btn-primary { background: var(--accent); border-color: var(--accent); color: #fff; }
    .btn-primary:hover { background: #0c5840; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }

    .kpis { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
    .kpi { background: #f8faf9; border: 1px solid var(--line); border-radius: 10px; padding: 12px; }
    .kpi.hi { background: var(--accent-soft); border-color: #b7e0d0; }
    .kpi-label { font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
    .kpi-val { font-size: 22px; font-weight: 700; margin-top: 2px; font-variant-numeric: tabular-nums; }
    .kpi-sub { font-size: 12px; color: var(--muted); }

    .line-item {
      display: flex; justify-content: space-between; align-items: baseline; padding: 7px 0;
      border-bottom: 1px solid #eef1f0; font-size: 13.5px;
    }
    .line-item:last-child { border-bottom: none; }
    .line-item.total { font-weight: 700; font-size: 15px; border-top: 2px solid var(--line); margin-top: 4px; padding-top: 10px; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-variant-numeric: tabular-nums; }

    .alert { padding: 10px 13px; border-radius: 9px; font-size: 13px; margin-top: 10px; }
    .alert-warn { background: var(--warn-soft); color: #92400e; }
    .alert-err { background: var(--danger-soft); color: var(--danger); }
    .alert-ok { background: var(--accent-soft); color: var(--accent); }

    .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; background: #fff; margin-top: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 820px; }
    th {
      text-align: left; padding: 9px 10px; background: #f3f5f4; color: var(--muted);
      font-size: 11px; text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid var(--line);
    }
    td { padding: 9px 10px; border-bottom: 1px solid #eef1f0; vertical-align: top; }
    .pill { display: inline-block; padding: 2px 7px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .pill-bad { background: var(--danger-soft); color: var(--danger); }
    .pill-ok { background: var(--accent-soft); color: var(--accent); }
    .pill-warn { background: var(--warn-soft); color: var(--warn); }

    .pro-banner {
      margin-top: 16px; padding: 16px 18px; border-radius: var(--radius);
      border: 1px solid var(--accent); background: linear-gradient(180deg, #f1faf5 0%, #ffffff 100%);
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px;
    }
    .hidden { display: none !important; }
    footer { margin-top: 32px; font-size: 12.5px; color: var(--muted); text-align: center; }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <div>
        <div class="eyebrow">100% Client-Side · Zero Upload Privacy</div>
        <h1>US Import Duty &amp; Landed Cost Estimator</h1>
        <p class="sub">Estimate Base USITC MFN duties, China Section 301, Section 232 steel/aluminum, entry-date-versioned CBP MPF (FY2027: $34.58–$670.86 formal / $2.77 informal / $0 USMCA), Ocean HMF (0.125%), and DDP retail pricing.</p>
      </div>
      <div class="badge">${isPro ? 'Offline Pro Edition · Unlimited SKUs' : 'Free Web Preview · 5-SKU Batch Limit'}</div>
    </header>

    <div class="tabs" role="tablist">
      <button class="tab active" id="tabSingle" data-tab="single" type="button">Single Shipment / SKU Calculator</button>
      <button class="tab" id="tabBatch" data-tab="batch" type="button">Batch SKU CSV Analyzer ${isPro ? '(Unlimited)' : '(Free 5-SKU Preview)'}</button>
    </div>

    <!-- SINGLE SKU PANEL -->
    <section id="panelSingle" class="grid-2">
      <div class="card">
        <h2>Shipment &amp; Tariff Inputs</h2>
        <div class="form-grid">
          <div style="grid-column: span 2;">
            <label for="presetSelect">Product Category / HTS Preset</label>
            <select id="presetSelect"></select>
          </div>
          <div>
            <label for="entryDate">CBP Entry Date (MPF FY)</label>
            <input id="entryDate" type="date" value="2026-11-25" />
          </div>
          <div>
            <label for="originSelect">Country of Origin (Manufacture)</label>
            <select id="originSelect"></select>
          </div>
          <div>
            <label for="modeSelect">Shipping Mode</label>
            <select id="modeSelect">
              <option value="ocean" selected>Ocean Freight (+0.125% HMF)</option>
              <option value="air">Air Freight ($0 HMF)</option>
              <option value="courier">Express Courier / DHL / UPS ($0 HMF)</option>
              <option value="truck">Truck / Rail ($0 HMF)</option>
            </select>
          </div>
          <div>
            <label for="unitCost">Unit FOB Cost ($)</label>
            <input id="unitCost" type="number" step="0.01" min="0" value="8.50" />
          </div>
          <div>
            <label for="quantity">Order Quantity (Units)</label>
            <input id="quantity" type="number" step="1" min="1" value="500" />
          </div>
          <div>
            <label for="freight">Freight Cost ($)</label>
            <input id="freight" type="number" step="0.01" min="0" value="650" />
          </div>
          <div>
            <label for="insurance">Cargo Insurance ($)</label>
            <input id="insurance" type="number" step="0.01" min="0" value="45" />
          </div>
          <div>
            <label for="brokerFee">Customs Broker / Filing ($)</label>
            <input id="brokerFee" type="number" step="0.01" min="0" value="125" />
          </div>
          <div>
            <label for="mfnRate">Base MFN Duty (%)</label>
            <input id="mfnRate" type="number" step="0.1" min="0" value="16.5" />
          </div>
          <div>
            <label for="sec301Rate">China Sec 301 (%)</label>
            <input id="sec301Rate" type="number" step="0.1" min="0" value="7.5" />
          </div>
          <div>
            <label for="sec232Rate">Sec 232 Steel/Alum (%)</label>
            <input id="sec232Rate" type="number" step="0.1" min="0" value="0" />
          </div>
          <div>
            <label for="extraRate">Extra / Reciprocal Scenario (%)</label>
            <input id="extraRate" type="number" step="0.5" min="0" value="10" />
          </div>
          <div>
            <label for="targetMargin">Target Gross Margin (%)</label>
            <input id="targetMargin" type="number" step="1" min="1" max="95" value="60" />
          </div>
          <div>
            <label for="currentRetail">Current Retail Price ($ opt.)</label>
            <input id="currentRetail" type="number" step="0.01" min="0" value="28.00" />
          </div>
        </div>
        <div class="check-row">
          <input id="usmcaCheck" type="checkbox" />
          <label for="usmcaCheck" style="margin:0;cursor:pointer;color:var(--ink);">USMCA / CUSMA Qualifying Certificate on File (CA / MX only → 0% MFN + $0 MPF)</label>
        </div>
        <div id="originNote" class="alert alert-ok" style="margin-top:12px;"></div>
      </div>

      <div class="card">
        <h2>Landed Cost &amp; DDP Breakdown</h2>
        <div class="kpis">
          <div class="kpi hi">
            <div class="kpi-label">Landed Cost / Unit</div>
            <div class="kpi-val mono" id="kpiUnitLanded">$0.00</div>
            <div class="kpi-sub" id="kpiDutyPerUnit">Duty+Fees: $0.00/u</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Rec. DDP Retail Price</div>
            <div class="kpi-val mono" id="kpiRecPrice">$0.00</div>
            <div class="kpi-sub" id="kpiCurrentMargin">Current margin: —</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Total Duties + CBP Fees</div>
            <div class="kpi-val mono" id="kpiTotalTax">$0.00</div>
            <div class="kpi-sub" id="kpiEffRate">Effective rate: 0%</div>
          </div>
          <div class="kpi">
            <div class="kpi-label">Total Shipment Cash Outlay</div>
            <div class="kpi-val mono" id="kpiTotalLanded">$0.00</div>
            <div class="kpi-sub" id="kpiEntryType">Formal Entry</div>
          </div>
        </div>
        <div id="breakdownLines"></div>
        <div id="singleWarnings"></div>
      </div>
    </section>

    <!-- BATCH CSV PANEL -->
    <section id="panelBatch" class="card hidden" style="margin-top:14px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
        <h2 style="margin:0;">Batch SKU Landed Cost Analyzer</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="btnLoadSampleCsv" class="btn" type="button">Load 8-SKU Sample CSV</button>
          <label class="btn" for="csvFileInput" style="margin:0;cursor:pointer;">Upload .CSV File</label>
          <input id="csvFileInput" type="file" accept=".csv,text/csv" class="hidden" />
        </div>
      </div>
      <div class="form-grid" style="margin-bottom:12px;">
        <div>
          <label for="batchEntryDate">CBP Entry Date (MPF FY)</label>
          <input id="batchEntryDate" type="date" value="2026-11-25" />
        </div>
        <div>
          <label for="batchEntryBasis">Customs Entry Basis</label>
          <select id="batchEntryBasis">
            <option value="consolidated" selected>Single Consolidated Entry (Pro-Rata MPF)</option>
            <option value="separate">Separate Entry per SKU</option>
          </select>
        </div>
        <div>
          <label for="batchExtraRate">Default Extra / Reciprocal Tariff (%)</label>
          <input id="batchExtraRate" type="number" step="0.5" min="0" value="10" />
        </div>
        <div>
          <label for="batchMargin">Target DDP Margin (%)</label>
          <input id="batchMargin" type="number" step="1" min="1" max="95" value="60" />
        </div>
        <div>
          <label for="batchMode">Default Mode (if omitted)</label>
          <select id="batchMode">
            <option value="ocean" selected>Ocean (+0.125% HMF)</option>
            <option value="air">Air ($0 HMF)</option>
            <option value="courier">Courier ($0 HMF)</option>
            <option value="truck">Truck / Rail ($0 HMF)</option>
          </select>
        </div>
        <div>
          <label for="batchBroker">Total Broker Fee ($)</label>
          <input id="batchBroker" type="number" step="1" min="0" value="0" />
        </div>
      </div>
      <label for="batchCsvText">Paste Supplier / Shopify SKU CSV (Columns: SKU, Product, Origin, HTS, Unit Cost, Qty, Freight, Mode, Base Rate, Retail Price, USMCA)</label>
      <textarea id="batchCsvText" spellcheck="false" placeholder="SKU,Product,Origin,HTS,Unit Cost,Qty,Freight,Mode,Retail Price,USMCA&#10;TEE-BLK-M,Cotton Tee,CN,6109.10.00,6.50,400,480,ocean,24.00,no"></textarea>
      <div class="btn-row">
        <button id="btnAnalyzeBatch" class="btn btn-primary" type="button">Analyze Batch SKUs</button>
        <button id="btnClearBatch" class="btn" type="button">Clear</button>
        ${isPro ? `
          <button id="btnDlCsv" class="btn btn-primary" type="button" disabled>Download us-landed-cost-breakdown.csv</button>
          <button id="btnDlRunbook" class="btn" type="button" disabled>Download ddp-pricing-runbook.md</button>
        ` : ''}
      </div>

      <div id="batchAlerts"></div>
      <div id="batchSummary" class="kpis hidden" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-top:14px;"></div>
      <div id="batchTableWrap" class="table-wrap hidden">
        <table>
          <thead>
            <tr>
              <th>SKU / Product</th>
              <th>Origin &amp; HTS</th>
              <th>FOB Value</th>
              <th>Duty Stack</th>
              <th>CBP Fees</th>
              <th>Landed / Unit</th>
              <th>Current Margin</th>
              <th>Rec. DDP Price</th>
            </tr>
          </thead>
          <tbody id="batchTableBody"></tbody>
        </table>
      </div>
      <div id="batchPager" class="hidden" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;font-size:13px;color:var(--muted);">
        <span id="batchPagerInfo"></span>
        <button id="btnMoreSkus" class="btn" type="button" style="height:34px;font-size:13px;">Show next 250 SKUs</button>
      </div>
      ${isPro ? '' : `
      <div id="proBanner" class="pro-banner">
        <div>
          <strong>Need Unlimited SKUs + Shopify/ERP Landed Cost CSV &amp; DDP Runbook Exports?</strong>
          <div style="font-size:13.5px;color:var(--muted);">Free web preview shows the first 5 SKUs. Get the <strong>Offline Pro Single-File HTML ($19 one-time)</strong> — runs 100% locally with zero subscription, unlimited SKUs, and 1-click CSV + Markdown runbook exports.</div>
        </div>
        <a class="btn btn-primary" href="${process.env.PRO_CHECKOUT_URL || 'mailto:jshoomaii@gmail.com?subject=US%20Import%20Duty%20Estimator%20Offline%20Pro%20(%2419)&body=Hi%2C%20please%20send%20the%20checkout%20link%20for%20the%20US%20Import%20Duty%20Estimator%20Offline%20Pro%20HTML%20(%2419).'}" ${process.env.PRO_CHECKOUT_URL ? 'target="_blank" rel="noopener"' : ''}>Get Offline Pro ($19)</a>
      </div>
      <div id="serviceCta" style="margin-top:12px;padding:12px 14px;border:1px dashed #cbd5e1;border-radius:10px;font-size:13.5px;color:var(--muted);">
        <strong>Rather not do it yourself?</strong> Send your SKU list (product, HTS code if known, origin country, unit cost) and get back a reviewed landed-cost + suggested DDP retail price sheet ready for Shopify/Amazon import within 48h. <strong>Flat $149 up to 500 SKUs.</strong>
        <a href="${process.env.SERVICE_URL || 'mailto:jshoomaii@gmail.com?subject=Done-for-you%20landed%20cost%20sheet%20(%24149)&body=Hi%2C%20I%27d%20like%20a%20done-for-you%20landed-cost%20sheet.%20Store%20URL%3A%20%0AApprox.%20SKU%20count%3A%20%0AOrigin%20countries%3A%20'}" style="font-weight:600;">Request a done-for-you sheet &rarr;</a>
      </div>
      `}
    </section>

    <footer>
      Reference estimator based on USITC HTS Column 1 MFN, Chapter 99 Section 301/232, and entry-date-versioned CBP MPF/HMF rules (19 CFR 24.23; FY2027 Federal Register 2026-15530 Table 2). Always confirm binding 10-digit HTS rulings and active executive tariff proclamations with a licensed US customs broker.
    </footer>
  </div>

  <script>
    const IS_PRO = ${isPro ? 'true' : 'false'};
    ${engineSrc}

    const SAMPLE_CSV = [
      'SKU,Product,Origin,HTS,Unit Cost,Qty,Freight,Mode,Retail Price,USMCA',
      'TEE-BLK-M,Heavyweight Cotton Tee,CN,6109.10.00,6.80,500,520,ocean,26.00,no',
      'HOOD-GRY-L,Fleece Poly Hoodie,CN,6110.30.30,13.50,300,640,ocean,48.00,no',
      'TUMB-40OZ,Insulated Steel Tumbler,CN,9617.00.10,5.20,600,710,ocean,32.00,no',
      'CABLE-USBC,Braided USB-C Cable 2m,CN,8544.42.90,1.95,2000,390,air,14.99,no',
      'BOLT-M8-SS,Stainless Steel Bolt Kit,CN,7318.15.80,4.10,800,450,ocean,15.50,no',
      'TEE-VN-WHT,Cotton Tee (Vietnam Alt),VN,6109.10.00,7.60,500,560,ocean,26.00,no',
      'SERUM-30ML,Vitamin C Skincare Serum,KR,3304.99.50,5.40,400,280,air,34.00,no',
      'BAG-MX-TAN,Full-Grain Leather Tote,MX,4202.21.90,28.00,150,310,truck,125.00,yes',
    ].join('\\n');

    const presetSel = document.getElementById('presetSelect');
    const originSel = document.getElementById('originSelect');
    presetSel.innerHTML = HTS_PRESETS.map((p) => \`<option value="\${p.id}">\${p.hts} — \${p.label} (\${p.mfnRate}% MFN)</option>\`).join('');
    originSel.innerHTML = COUNTRIES.map((c) => \`<option value="\${c.code}">\${c.code} — \${c.name}</option>\`).join('');

    function esc(s) {
      return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function money(n) {
      return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function applyPresetRates() {
      const p = findPreset(presetSel.value);
      if (!p) return;
      document.getElementById('mfnRate').value = p.mfnRate;
      document.getElementById('sec301Rate').value = originSel.value === 'CN' ? p.sec301Rate : 0;
      document.getElementById('sec232Rate').value = p.sec232Rate;
      recalcSingle();
    }

    function applyOriginChange() {
      const p = findPreset(presetSel.value);
      if (originSel.value === 'CN') {
        document.getElementById('sec301Rate').value = p ? p.sec301Rate : document.getElementById('sec301Rate').value;
      } else {
        document.getElementById('sec301Rate').value = 0;
      }
      recalcSingle();
    }

    function recalcSingle() {
      const origin = originSel.value;
      const country = COUNTRIES.find((c) => c.code === origin) || COUNTRIES[COUNTRIES.length - 1];
      document.getElementById('originNote').textContent = country.note;
      const usmcaBox = document.getElementById('usmcaCheck');
      usmcaBox.disabled = !country.usmca;
      if (!country.usmca) usmcaBox.checked = false;

      try {
        const res = calculateShipment({
          entryDate: document.getElementById('entryDate').value || DEFAULT_ENTRY_DATE,
          presetId: presetSel.value,
          origin,
          shippingMode: document.getElementById('modeSelect').value,
          unitCost: document.getElementById('unitCost').value,
          quantity: document.getElementById('quantity').value,
          freight: document.getElementById('freight').value,
          insurance: document.getElementById('insurance').value,
          brokerFee: document.getElementById('brokerFee').value,
          mfnRate: document.getElementById('mfnRate').value,
          sec301Rate: document.getElementById('sec301Rate').value,
          applySec301: origin === 'CN',
          sec232Rate: document.getElementById('sec232Rate').value,
          applySec232: Number(document.getElementById('sec232Rate').value) > 0,
          extraTariffRate: document.getElementById('extraRate').value,
          targetMarginPct: document.getElementById('targetMargin').value,
          currentRetailPrice: document.getElementById('currentRetail').value,
          usmcaQualifying: usmcaBox.checked,
        });

        document.getElementById('kpiUnitLanded').textContent = money(res.landedCostPerUnit);
        document.getElementById('kpiDutyPerUnit').textContent = \`Duties+Fees: \${money(res.dutyPerUnit)}/unit\`;
        document.getElementById('kpiRecPrice').textContent = money(res.recommendedDdpPrice);
        document.getElementById('kpiCurrentMargin').textContent = res.currentMarginPct !== null
          ? \`Current net margin: \${res.currentMarginPct.toFixed(1)}% (\${money(res.currentProfitPerUnit)}/u)\`
          : \`Target margin: \${res.targetMarginPct}%\`;
        document.getElementById('kpiTotalTax').textContent = money(res.breakdown.totalDutiesAndFees);
        document.getElementById('kpiEffRate').textContent = \`\${res.effectiveAllInTaxPct.toFixed(1)}% of FOB value\`;
        document.getElementById('kpiTotalLanded').textContent = money(res.totalLandedCost);
        document.getElementById('kpiEntryType').textContent = \`\${res.entryType.toUpperCase()} (\${res.fiscalYear}) · \${res.quantity.toLocaleString()} units\`;

        document.getElementById('breakdownLines').innerHTML = [
          ['FOB Customs Value', money(res.customsValue)],
          [\`Base MFN Duty (\${res.rates.mfn}%)\`, money(res.breakdown.mfnDuty)],
          [\`China Section 301 (\${res.rates.sec301}%)\`, money(res.breakdown.sec301Duty)],
          [\`Section 232 Steel/Alum (\${res.rates.sec232}%)\`, money(res.breakdown.sec232Duty)],
          [\`Extra / Reciprocal Scenario (\${res.rates.extra}%)\`, money(res.breakdown.extraDuty)],
          [\`CBP MPF (\${res.usmcaApplied ? 'USMCA Waived' : res.entryType + ' · ' + res.fiscalYear})\`, money(res.breakdown.mpfFee)],
          [\`Ocean HMF (\${res.shippingMode === 'ocean' ? '0.125%' : 'N/A'})\`, money(res.breakdown.hmfFee)],
          ['Freight + Insurance + Broker', money(res.freight + res.insurance + res.brokerFee)],
          ['Total Landed Cost', money(res.totalLandedCost), true],
        ].map(([k, v, tot]) => \`<div class="line-item \${tot ? 'total' : ''}"><span>\${esc(k)}</span><span class="mono">\${esc(v)}</span></div>\`).join('');

        document.getElementById('singleWarnings').innerHTML = res.warnings
          .map((w) => \`<div class="alert alert-warn">\${esc(w)}</div>\`).join('');
      } catch (err) {
        document.getElementById('kpiUnitLanded').textContent = '—';
        document.getElementById('kpiDutyPerUnit').textContent = 'Fix input error below';
        document.getElementById('kpiRecPrice').textContent = '—';
        document.getElementById('kpiCurrentMargin').textContent = '—';
        document.getElementById('kpiTotalTax').textContent = '—';
        document.getElementById('kpiEffRate').textContent = '—';
        document.getElementById('kpiTotalLanded').textContent = '—';
        document.getElementById('kpiEntryType').textContent = '—';
        document.getElementById('breakdownLines').innerHTML = '';
        document.getElementById('singleWarnings').innerHTML = \`<div class="alert alert-err">\${esc(err.message)}</div>\`;
      }
    }

    presetSel.addEventListener('change', applyPresetRates);
    originSel.addEventListener('change', applyOriginChange);
    ['entryDate','modeSelect','unitCost','quantity','freight','insurance','brokerFee','mfnRate','sec301Rate','sec232Rate','extraRate','targetMargin','currentRetail','usmcaCheck']
      .forEach((id) => document.getElementById(id).addEventListener('input', recalcSingle));
    recalcSingle();

    // Tabs
    const tabBtns = document.querySelectorAll('.tab');
    tabBtns.forEach((btn) => btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.dataset.tab;
      document.getElementById('panelSingle').classList.toggle('hidden', key !== 'single');
      document.getElementById('panelBatch').classList.toggle('hidden', key !== 'batch');
    }));

    // Batch analyzer
    const BATCH_PAGE_SIZE = 250;
    let lastBatch = null;
    let batchVisibleLimit = BATCH_PAGE_SIZE;

    function invalidateBatch(reason = 'Batch inputs changed — click "Analyze Batch SKUs" to refresh results before exporting.') {
      if (IS_PRO) {
        document.getElementById('btnDlCsv').disabled = true;
        document.getElementById('btnDlRunbook').disabled = true;
      }
      if (!lastBatch) return;
      lastBatch = null;
      if (reason) {
        document.getElementById('batchAlerts').innerHTML = \`<div class="alert alert-warn"><strong>Analysis out of date (exports disabled):</strong> \${esc(reason)}</div>\`;
      }
    }

    ['batchCsvText','batchEntryDate','batchEntryBasis','batchExtraRate','batchMargin','batchMode','batchBroker'].forEach((id) => {
      const el = document.getElementById(id);
      el.addEventListener('input', () => invalidateBatch());
      el.addEventListener('change', () => invalidateBatch());
    });

    function renderBatchRows(res) {
      const slice = res.rows.slice(0, batchVisibleLimit);
      document.getElementById('batchTableBody').innerHTML = slice.map((r) => {
        const mPill = r.currentMarginPct === null ? '—'
          : \`<span class="pill \${r.currentMarginPct < 30 ? 'pill-bad' : 'pill-ok'}">\${r.currentMarginPct.toFixed(1)}%</span>\`;
        return \`<tr>
          <td><strong>\${esc(r.sku)}</strong><div style="color:var(--muted);font-size:12px;">\${esc(r.title)}</div></td>
          <td class="mono">\${esc(r.origin)} · \${esc(r.htsCode)}<div style="color:var(--muted);font-size:11.5px;">\${esc(r.shippingMode)} (\${esc(r.entryType)})</div></td>
          <td class="mono">\${money(r.customsValue)}<div style="color:var(--muted);font-size:11.5px;">\${r.quantity} × \${money(r.unitCost)}</div></td>
          <td class="mono">\${money(r.breakdown.totalDuty)}<div style="color:var(--muted);font-size:11.5px;">\${r.rates.combinedDutyPct}% total</div></td>
          <td class="mono">\${money(r.breakdown.totalCbpFees)}<div style="color:var(--muted);font-size:11.5px;">MPF \${money(r.breakdown.mpfFee)}</div></td>
          <td class="mono"><strong>\${money(r.landedCostPerUnit)}</strong></td>
          <td>\${mPill}</td>
          <td class="mono"><strong>\${money(r.recommendedDdpPrice)}</strong></td>
        </tr>\`;
      }).join('');
      const pager = document.getElementById('batchPager');
      if (res.rows.length > slice.length) {
        pager.classList.remove('hidden');
        document.getElementById('batchPagerInfo').textContent = \`Showing \${slice.length.toLocaleString()} of \${res.rows.length.toLocaleString()} SKUs (exports include all \${res.totalSkus.toLocaleString()} SKUs)\`;
      } else {
        pager.classList.add('hidden');
      }
    }

    document.getElementById('btnMoreSkus').addEventListener('click', () => {
      if (!lastBatch) return;
      batchVisibleLimit += BATCH_PAGE_SIZE;
      renderBatchRows(lastBatch);
    });

    function runBatch() {
      const text = document.getElementById('batchCsvText').value;
      batchVisibleLimit = BATCH_PAGE_SIZE;
      const res = analyzeBatchCsv(text, {
        isPro: IS_PRO,
        entryDate: document.getElementById('batchEntryDate').value || DEFAULT_ENTRY_DATE,
        entryBasis: document.getElementById('batchEntryBasis').value,
        defaultExtraTariffRate: Number(document.getElementById('batchExtraRate').value || 0),
        defaultTargetMarginPct: Number(document.getElementById('batchMargin').value || 60),
        defaultShippingMode: document.getElementById('batchMode').value,
        defaultBrokerFee: Number(document.getElementById('batchBroker').value || 0),
      });
      lastBatch = res;

      const alerts = [];
      if (res.errors.length && res.rows.length) {
        alerts.push(\`<div class="alert alert-err"><strong>Export blocked:</strong> \${res.errors.length} row error(s) found. Summary totals below exclude invalid rows until fixed.</div>\`);
      }
      for (const e of res.errors) alerts.push(\`<div class="alert alert-err">\${esc(e.message)}</div>\`);
      if (res.truncatedCount > 0) {
        alerts.push(\`<div class="alert alert-warn">Showing first \${res.visibleSkus} of \${res.totalSkus} SKUs (\${res.truncatedCount} hidden in Free Preview). Upgrade to Offline Pro ($19) for unlimited SKU exports.</div>\`);
      }
      document.getElementById('batchAlerts').innerHTML = alerts.join('');

      const sumEl = document.getElementById('batchSummary');
      const wrapEl = document.getElementById('batchTableWrap');
      if (res.summary && res.rows.length) {
        sumEl.classList.remove('hidden');
        wrapEl.classList.remove('hidden');
        sumEl.innerHTML = [
          ['SKUs Analyzed', String(res.summary.skuCount), \`\${res.summary.chinaSkus} China-origin\`],
          ['Total FOB Value', money(res.summary.totalCustoms), 'Customs basis'],
          ['Total Duties + CBP', money(res.summary.totalDuties + res.summary.totalCbpFees), \`\${res.summary.blendedDutyPct}% blended duty\`],
          ['Total Landed Outlay', money(res.summary.totalLanded), \`\${res.summary.marginAlertSkus} margin alerts\`],
        ].map(([l, v, s]) => \`<div class="kpi"><div class="kpi-label">\${esc(l)}</div><div class="kpi-val mono" style="font-size:18px;">\${esc(v)}</div><div class="kpi-sub">\${esc(s)}</div></div>\`).join('');

        renderBatchRows(res);
      } else {
        sumEl.classList.add('hidden');
        wrapEl.classList.add('hidden');
        document.getElementById('batchPager').classList.add('hidden');
      }

      if (IS_PRO) {
        document.getElementById('btnDlCsv').disabled = res.exportBlocked;
        document.getElementById('btnDlRunbook').disabled = res.exportBlocked;
      }
    }

    document.getElementById('btnLoadSampleCsv').addEventListener('click', () => {
      document.getElementById('batchCsvText').value = SAMPLE_CSV;
      runBatch();
    });
    document.getElementById('btnAnalyzeBatch').addEventListener('click', runBatch);
    document.getElementById('btnClearBatch').addEventListener('click', () => {
      document.getElementById('batchCsvText').value = '';
      document.getElementById('batchAlerts').innerHTML = '';
      document.getElementById('batchSummary').classList.add('hidden');
      document.getElementById('batchTableWrap').classList.add('hidden');
      document.getElementById('batchPager').classList.add('hidden');
      invalidateBatch('');
    });
    document.getElementById('csvFileInput').addEventListener('change', (ev) => {
      const f = ev.target.files && ev.target.files[0];
      if (!f) return;
      invalidateBatch('Loading replacement CSV file...');
      const reader = new FileReader();
      reader.onload = () => {
        document.getElementById('batchCsvText').value = String(reader.result || '');
        ev.target.value = '';
        runBatch();
      };
      reader.onerror = () => {
        ev.target.value = '';
        invalidateBatch('Failed to read CSV file.');
      };
      reader.readAsText(f);
    });

    if (IS_PRO) {
      function dl(filename, content, mime) {
        const blob = new Blob([content], { type: mime });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      }
      document.getElementById('btnDlCsv').addEventListener('click', () => {
        if (lastBatch && !lastBatch.exportBlocked && lastBatch.exportCsv) dl('us-landed-cost-breakdown.csv', lastBatch.exportCsv, 'text/csv;charset=utf-8');
      });
      document.getElementById('btnDlRunbook').addEventListener('click', () => {
        if (lastBatch && !lastBatch.exportBlocked && lastBatch.runbookMd) dl('ddp-pricing-runbook.md', lastBatch.runbookMd, 'text/markdown;charset=utf-8');
      });
    }
  </script>
</body>
</html>
`;
}

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.mkdirSync(path.join(root, 'release'), { recursive: true });

const freePath = path.join(root, 'public', 'index.html');
const proPath = path.join(root, 'release', 'us-import-duty-estimator-pro.html');

fs.writeFileSync(freePath, renderHtml({ isPro: false }), 'utf8');
fs.writeFileSync(proPath, renderHtml({ isPro: true }), 'utf8');

console.log(`Built Free Web Preview: ${freePath}`);
console.log(`Built Offline Pro HTML: ${proPath}`);
