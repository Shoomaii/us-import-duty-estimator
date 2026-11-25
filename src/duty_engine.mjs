/**
 * Deterministic US Import Duty & Full Landed Cost Engine (USITC + CBP Fees)
 * Pure ES module — runs identically in Node tests, Free Web Preview, and Offline Pro HTML.
 */

export const CBP_RULES = {
  mpfFormalRate: 0.003464,       // 0.3464% ad valorem (19 CFR 24.23)
  mpfFormalMin: 32.71,           // FY2026-2027 formal entry minimum
  mpfFormalMax: 634.62,          // FY2026-2027 formal entry maximum
  mpfInformalFee: 2.62,          // Automated informal entry <= $2,500
  formalThresholdUsd: 2500.0,    // Formal entry required above $2,500 (or Sec 301/232 goods)
  hmfOceanRate: 0.00125,         // 0.125% Harbor Maintenance Fee (Ocean only)
  freePreviewSkuLimit: 5,
};

export const COUNTRIES = [
  { code: 'CN', name: 'China', sec301Eligible: true, usmca: false, note: 'Subject to Chapter 99 Section 301 lists (7.5%–50%) regardless of dispatch country.' },
  { code: 'VN', name: 'Vietnam', sec301Eligible: false, usmca: false, note: 'MFN base rates apply; verify non-China substantial transformation.' },
  { code: 'IN', name: 'India', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'MX', name: 'Mexico', sec301Eligible: false, usmca: true, note: 'USMCA-qualifying goods get 0% MFN + $0 MPF.' },
  { code: 'CA', name: 'Canada', sec301Eligible: false, usmca: true, note: 'USMCA/CUSMA-qualifying goods get 0% MFN + $0 MPF (China-made stock shipped from CA still incurs China tariffs!).' },
  { code: 'DE', name: 'Germany (EU)', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'IT', name: 'Italy (EU)', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'GB', name: 'United Kingdom', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'JP', name: 'Japan', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'KR', name: 'South Korea', sec301Eligible: false, usmca: false, note: 'KORUS FTA may reduce MFN to 0% if certificate of origin is held.' },
  { code: 'TW', name: 'Taiwan', sec301Eligible: false, usmca: false, note: 'MFN base rates apply (exempt from China Sec 301).' },
  { code: 'TR', name: 'Turkey', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'TH', name: 'Thailand', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'ID', name: 'Indonesia', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'BD', name: 'Bangladesh', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'PK', name: 'Pakistan', sec301Eligible: false, usmca: false, note: 'MFN base rates apply.' },
  { code: 'AU', name: 'Australia', sec301Eligible: false, usmca: false, note: 'AUSFTA may qualify for 0% MFN with origin docs.' },
  { code: 'OTHER', name: 'Other WTO MFN Country', sec301Eligible: false, usmca: false, note: 'Standard Column 1 MFN rates apply.' },
];

export const HTS_PRESETS = [
  { id: 'cotton-tee', hts: '6109.10.00', category: 'Apparel', label: 'Cotton T-Shirts (Knitted)', mfnRate: 16.5, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'poly-hoodie', hts: '6110.30.30', category: 'Apparel', label: 'Polyester Hoodies / Sweatshirts', mfnRate: 32.0, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'denim-jeans', hts: '6203.42.45', category: 'Apparel', label: 'Cotton Denim Jeans / Trousers', mfnRate: 16.6, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'ath-sneakers', hts: '6404.11.90', category: 'Footwear', label: 'Athletic Sneakers (Textile Upper)', mfnRate: 20.0, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'leather-boots', hts: '6403.91.60', category: 'Footwear', label: 'Leather Boots / Casual Footwear', mfnRate: 8.5, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'earbuds', hts: '8518.30.20', category: 'Electronics', label: 'Bluetooth Earbuds & Headphones', mfnRate: 0.0, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'usb-cables', hts: '8544.42.90', category: 'Electronics', label: 'USB-C / Power Cables & Adapters', mfnRate: 2.6, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 0 },
  { id: 'phone-cases', hts: '3926.90.99', category: 'Electronics', label: 'Plastic / Silicone Phone Cases', mfnRate: 5.3, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'lithium-bank', hts: '8507.60.00', category: 'Electronics', label: 'Lithium-Ion Batteries & Power Banks', mfnRate: 3.4, sec301Rate: 25.0, sec301List: 'List 4A / 2024-26 Battery Hike', sec232Rate: 0 },
  { id: 'led-lamps', hts: '9405.21.80', category: 'Home', label: 'LED Desk & Floor Lamps', mfnRate: 3.9, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 0 },
  { id: 'steel-tumbler', hts: '9617.00.10', category: 'Home & Kitchen', label: 'Insulated Stainless Steel Tumblers', mfnRate: 7.2, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'ceramic-mugs', hts: '6912.00.44', category: 'Home & Kitchen', label: 'Ceramic Coffee Mugs & Tableware', mfnRate: 10.0, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'wood-furniture', hts: '9403.60.80', category: 'Home', label: 'Wooden Home Furniture', mfnRate: 0.0, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 0 },
  { id: 'kitchen-silicone', hts: '3924.10.40', category: 'Home & Kitchen', label: 'Silicone / Plastic Kitchenware', mfnRate: 3.4, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'skincare', hts: '3304.99.50', category: 'Beauty', label: 'Skincare Creams & Serums', mfnRate: 0.0, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 0 },
  { id: 'makeup-brushes', hts: '9603.30.60', category: 'Beauty', label: 'Cosmetic & Makeup Brushes', mfnRate: 0.0, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'imitation-jewelry', hts: '7117.19.90', category: 'Accessories', label: 'Base-Metal Fashion Jewelry', mfnRate: 11.0, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'leather-bags', hts: '4202.21.90', category: 'Accessories', label: 'Leather Handbags & Totes', mfnRate: 9.0, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 0 },
  { id: 'sunglasses', hts: '9004.10.00', category: 'Accessories', label: 'Sunglasses & Eyewear', mfnRate: 2.0, sec301Rate: 7.5, sec301List: 'List 4A', sec232Rate: 0 },
  { id: 'plastic-toys', hts: '9503.00.00', category: 'Toys', label: 'Toys, Puzzles & Action Figures', mfnRate: 0.0, sec301Rate: 0.0, sec301List: 'None (List 4B suspended)', sec232Rate: 0 },
  { id: 'yoga-mats', hts: '3921.90.40', category: 'Fitness', label: 'TPE / PVC Yoga & Exercise Mats', mfnRate: 4.2, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 0 },
  { id: 'pet-gear', hts: '4201.00.30', category: 'Pets', label: 'Dog Leashes, Collars & Harnesses', mfnRate: 2.4, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 0 },
  { id: 'auto-parts', hts: '8708.99.81', category: 'Automotive', label: 'Aftermarket Auto Parts & Brackets', mfnRate: 2.5, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 0 },
  { id: 'steel-bolts', hts: '7318.15.80', category: 'Hardware / Metal', label: 'Steel Fasteners, Bolts & Hardware', mfnRate: 0.0, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 25.0 },
  { id: 'alum-brackets', hts: '7616.99.51', category: 'Hardware / Metal', label: 'Aluminum Extrusions & Brackets', mfnRate: 2.5, sec301Rate: 25.0, sec301List: 'List 3', sec232Rate: 25.0 },
  { id: 'custom', hts: 'CUSTOM', category: 'Custom', label: 'Custom HTS Code / Manual Duty Rate', mfnRate: 5.0, sec301Rate: 0.0, sec301List: 'Manual', sec232Rate: 0 },
];

const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));
const PRESET_BY_ID = new Map(HTS_PRESETS.map((p) => [p.id, p]));
const PRESET_BY_HTS = new Map(HTS_PRESETS.map((p) => [p.hts.replace(/\./g, ''), p]));

export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function findPreset(htsOrId) {
  if (!htsOrId) return null;
  const raw = String(htsOrId).trim();
  if (PRESET_BY_ID.has(raw)) return PRESET_BY_ID.get(raw);
  const digits = raw.replace(/\D+/g, '');
  if (PRESET_BY_HTS.has(digits)) return PRESET_BY_HTS.get(digits);
  // Match 6-digit heading prefix if 8/10-digit suffix differs
  if (digits.length >= 6) {
    for (const p of HTS_PRESETS) {
      const pd = p.hts.replace(/\D+/g, '');
      if (pd.length >= 6 && pd.slice(0, 6) === digits.slice(0, 6)) return p;
    }
  }
  return null;
}

export function normalizeCountry(raw) {
  const s = String(raw || '').trim().toUpperCase();
  if (!s) return '';
  if (COUNTRY_BY_CODE.has(s)) return s;
  const aliases = {
    CHINA: 'CN', PRC: 'CN', 'HONG KONG': 'CN',
    VIETNAM: 'VN', INDIA: 'IN', MEXICO: 'MX', CANADA: 'CA',
    GERMANY: 'DE', ITALY: 'IT', UK: 'GB', 'UNITED KINGDOM': 'GB',
    JAPAN: 'JP', KOREA: 'KR', 'SOUTH KOREA': 'KR', TAIWAN: 'TW',
    TURKEY: 'TR', THAILAND: 'TH', INDONESIA: 'ID', BANGLADESH: 'BD',
    PAKISTAN: 'PK', AUSTRALIA: 'AU', EU: 'DE',
  };
  return aliases[s] || (s.length === 2 ? 'OTHER' : '');
}

/**
 * Calculate deterministic US import duties, CBP fees, full landed cost, and DDP pricing.
 */
export function calculateShipment(input) {
  const unitCost = Number(input.unitCost);
  const quantity = Number(input.quantity);
  const freight = Number(input.freight || 0);
  const insurance = Number(input.insurance || 0);
  const brokerFee = Number(input.brokerFee || 0);
  const targetMarginPct = Number(input.targetMarginPct ?? 60);
  const currentRetailPrice = input.currentRetailPrice !== undefined && input.currentRetailPrice !== '' && input.currentRetailPrice !== null
    ? Number(input.currentRetailPrice)
    : null;

  if (!Number.isFinite(unitCost) || unitCost < 0) throw new Error('Unit cost must be a valid non-negative number.');
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantity must be greater than 0.');
  if (!Number.isFinite(freight) || freight < 0) throw new Error('Freight must be a non-negative number.');
  if (!Number.isFinite(insurance) || insurance < 0) throw new Error('Insurance must be a non-negative number.');
  if (!Number.isFinite(brokerFee) || brokerFee < 0) throw new Error('Broker fee must be a non-negative number.');
  if (!Number.isFinite(targetMarginPct) || targetMarginPct < 0 || targetMarginPct >= 99) {
    throw new Error('Target margin must be between 0% and 98.9%.');
  }

  const origin = normalizeCountry(input.origin || 'CN') || 'OTHER';
  const country = COUNTRY_BY_CODE.get(origin) || COUNTRY_BY_CODE.get('OTHER');
  const preset = findPreset(input.presetId || input.htsCode);
  const mode = String(input.shippingMode || 'ocean').trim().toLowerCase();

  const customsValue = round2(unitCost * quantity);

  const rawMfnRate = input.mfnRate !== undefined && input.mfnRate !== '' && input.mfnRate !== null
    ? Number(input.mfnRate)
    : (preset ? preset.mfnRate : 0);

  const usmcaApplied = Boolean(input.usmcaQualifying) && Boolean(country.usmca);
  const effectiveMfnRate = usmcaApplied ? 0 : Math.max(0, rawMfnRate);

  const applySec301 = input.applySec301 !== undefined ? Boolean(input.applySec301) : country.sec301Eligible;
  const rawSec301Rate = input.sec301Rate !== undefined && input.sec301Rate !== '' && input.sec301Rate !== null
    ? Number(input.sec301Rate)
    : (preset ? preset.sec301Rate : 0);
  const effectiveSec301Rate = (country.sec301Eligible && applySec301) ? Math.max(0, rawSec301Rate) : 0;

  const applySec232 = input.applySec232 !== undefined
    ? Boolean(input.applySec232)
    : Boolean(preset && preset.sec232Rate > 0);
  const rawSec232Rate = input.sec232Rate !== undefined && input.sec232Rate !== '' && input.sec232Rate !== null
    ? Number(input.sec232Rate)
    : (preset ? preset.sec232Rate : 0);
  const effectiveSec232Rate = applySec232 ? Math.max(0, rawSec232Rate) : 0;

  const extraTariffRate = Math.max(0, Number(input.extraTariffRate || 0));

  const mfnDuty = round2(customsValue * (effectiveMfnRate / 100));
  const sec301Duty = round2(customsValue * (effectiveSec301Rate / 100));
  const sec232Duty = round2(customsValue * (effectiveSec232Rate / 100));
  const extraDuty = round2(customsValue * (extraTariffRate / 100));
  const totalDuty = round2(mfnDuty + sec301Duty + sec232Duty + extraDuty);

  // Formal vs Informal CBP Entry
  // Formal entry required above $2,500 OR if Section 301/232 trade remedies apply (or forced by user)
  const hasTradeRemedy = effectiveSec301Rate > 0 || effectiveSec232Rate > 0;
  const entryType = (input.forceFormalEntry || customsValue > CBP_RULES.formalThresholdUsd || hasTradeRemedy)
    ? 'formal'
    : 'informal';

  let mpfFee = 0;
  if (usmcaApplied) {
    mpfFee = 0; // 19 CFR 24.23(c)(3) USMCA MPF exemption
  } else if (entryType === 'formal') {
    const rawMpf = customsValue * CBP_RULES.mpfFormalRate;
    mpfFee = round2(Math.min(CBP_RULES.mpfFormalMax, Math.max(CBP_RULES.mpfFormalMin, rawMpf)));
  } else {
    mpfFee = CBP_RULES.mpfInformalFee;
  }

  const hmfFee = mode === 'ocean' ? round2(customsValue * CBP_RULES.hmfOceanRate) : 0;
  const totalCbpFees = round2(mpfFee + hmfFee);
  const totalDutiesAndFees = round2(totalDuty + totalCbpFees);

  const totalLandedCost = round2(customsValue + freight + insurance + brokerFee + totalDutiesAndFees);
  const landedCostPerUnit = round2(totalLandedCost / quantity);
  const dutyPerUnit = round2(totalDutiesAndFees / quantity);
  const effectiveDutyRatePct = customsValue > 0 ? round2((totalDuty / customsValue) * 100) : 0;
  const effectiveAllInTaxPct = customsValue > 0 ? round2((totalDutiesAndFees / customsValue) * 100) : 0;

  const recommendedDdpPrice = round2(landedCostPerUnit / (1 - targetMarginPct / 100));
  const currentMarginPct = (currentRetailPrice && currentRetailPrice > 0)
    ? round2(((currentRetailPrice - landedCostPerUnit) / currentRetailPrice) * 100)
    : null;
  const currentProfitPerUnit = (currentRetailPrice !== null && Number.isFinite(currentRetailPrice))
    ? round2(currentRetailPrice - landedCostPerUnit)
    : null;

  const warnings = [];
  if (origin === 'CN' && effectiveSec301Rate > 0) {
    warnings.push(`China Section 301 (${effectiveSec301Rate}%) applied — CBP determines origin by country of manufacture, even if shipped via Canada or EU.`);
  }
  if (effectiveSec232Rate > 0) {
    warnings.push(`Section 232 steel/aluminum derivative tariff (${effectiveSec232Rate}%) applied.`);
  }
  if (entryType === 'formal' && customsValue <= CBP_RULES.formalThresholdUsd && hasTradeRemedy) {
    warnings.push(`Formal entry MPF ($${mpfFee.toFixed(2)}) triggered because Section 301/232 goods are excluded from informal/de minimis entry.`);
  }
  if (usmcaApplied) {
    warnings.push('USMCA/CUSMA preference active: Base MFN duty (0%) and CBP MPF ($0.00) waived. Keep signed Certificate of Origin on file.');
  }
  if (currentMarginPct !== null && currentMarginPct < 30) {
    warnings.push(`Margin alert: At $${currentRetailPrice.toFixed(2)} retail, net landed margin drops to ${currentMarginPct.toFixed(1)}% ($${currentProfitPerUnit.toFixed(2)}/unit before ads/pick-pack).`);
  }

  return {
    origin,
    countryName: country.name,
    htsCode: input.htsCode || (preset ? preset.hts : 'CUSTOM'),
    htsLabel: preset ? preset.label : (input.title || 'Custom Product'),
    shippingMode: mode,
    entryType,
    usmcaApplied,
    quantity,
    unitCost: round2(unitCost),
    customsValue,
    freight: round2(freight),
    insurance: round2(insurance),
    brokerFee: round2(brokerFee),
    rates: {
      mfn: round2(effectiveMfnRate),
      sec301: round2(effectiveSec301Rate),
      sec232: round2(effectiveSec232Rate),
      extra: round2(extraTariffRate),
      combinedDutyPct: round2(effectiveMfnRate + effectiveSec301Rate + effectiveSec232Rate + extraTariffRate),
    },
    breakdown: {
      mfnDuty,
      sec301Duty,
      sec232Duty,
      extraDuty,
      totalDuty,
      mpfFee,
      hmfFee,
      totalCbpFees,
      totalDutiesAndFees,
    },
    effectiveDutyRatePct,
    effectiveAllInTaxPct,
    totalLandedCost,
    landedCostPerUnit,
    dutyPerUnit,
    targetMarginPct,
    recommendedDdpPrice,
    currentRetailPrice,
    currentMarginPct,
    currentProfitPerUnit,
    warnings,
  };
}

/**
 * RFC 4180 CSV parser preserving physical 1-based line numbers & stripping UTF-8 BOM.
 */
export function parseCsv(text) {
  const src = String(text || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let line = 1;
  let rowStartLine = 1;

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        if (ch === '\n') line += 1;
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field.trim());
      field = '';
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      row.push(field.trim());
      field = '';
      if (row.some((c) => c !== '')) {
        rows.push({ line: rowStartLine, cells: row });
      }
      row = [];
      line += 1;
      rowStartLine = line;
    } else {
      field += ch;
    }
  }
  row.push(field.trim());
  if (row.some((c) => c !== '')) {
    rows.push({ line: rowStartLine, cells: row });
  }
  return rows;
}

function parseMoney(raw, fallback = 0) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return fallback;
  const cleaned = String(raw).replace(/[$,%\s]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : NaN;
}

function parseBoolCell(raw) {
  const s = String(raw || '').trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'y';
}

function mapHeaderIndex(headers) {
  const norm = headers.map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, ''));
  const find = (...candidates) => {
    for (const c of candidates) {
      const idx = norm.indexOf(c);
      if (idx !== -1) return idx;
    }
    return -1;
  };
  return {
    sku: find('sku', 'skucode', 'item', 'id', 'variant'),
    title: find('title', 'product', 'name', 'description'),
    origin: find('origin', 'country', 'countryoforigin', 'coo'),
    hts: find('hts', 'htscode', 'hscode', 'tariffcode', 'preset'),
    unitCost: find('unitcost', 'fob', 'cost', 'unitprice', 'wholesale'),
    quantity: find('quantity', 'qty', 'units', 'orderqty'),
    freight: find('freight', 'shipping', 'freightcost'),
    mode: find('mode', 'shippingmode', 'transport'),
    mfnRate: find('mfnrate', 'baserate', 'dutyrate', 'mfn'),
    retailPrice: find('retailprice', 'retail', 'price', 'msrp', 'shopifyprice'),
    usmca: find('usmca', 'cusma', 'fta'),
  };
}

export function analyzeBatchCsv(csvText, options = {}) {
  const {
    isPro = false,
    defaultExtraTariffRate = 0,
    defaultTargetMarginPct = 60,
    defaultShippingMode = 'ocean',
    defaultBrokerFee = 0,
  } = options;

  const parsed = parseCsv(csvText);
  if (parsed.length < 2) {
    return {
      totalSkus: 0,
      visibleSkus: 0,
      truncatedCount: 0,
      errors: [{ line: 1, message: 'Paste or upload a CSV with a header row and at least 1 SKU row.' }],
      rows: [],
      summary: null,
      exportBlocked: true,
      exportCsv: null,
      runbookMd: null,
    };
  }

  const col = mapHeaderIndex(parsed[0].cells);
  if (col.unitCost === -1) {
    return {
      totalSkus: 0,
      visibleSkus: 0,
      truncatedCount: 0,
      errors: [{ line: parsed[0].line, message: 'Missing required "Unit Cost" (or "FOB" / "Cost") column in CSV header.' }],
      rows: [],
      summary: null,
      exportBlocked: true,
      exportCsv: null,
      runbookMd: null,
    };
  }

  const errors = [];
  const computed = [];

  for (let i = 1; i < parsed.length; i += 1) {
    const { line, cells } = parsed[i];
    const get = (idx) => (idx >= 0 && idx < cells.length ? cells[idx] : '');

    const sku = get(col.sku) || `SKU-${i}`;
    const title = get(col.title) || sku;
    const rawOrigin = get(col.origin) || 'CN';
    const origin = normalizeCountry(rawOrigin);
    if (!origin) {
      errors.push({ line, sku, message: `Line ${line} (${sku}): Unrecognized Country of Origin "${rawOrigin}". Use 2-letter ISO code (e.g. CN, VN, MX, CA, DE).` });
      continue;
    }

    const unitCost = parseMoney(get(col.unitCost), NaN);
    const quantity = parseMoney(get(col.quantity), 1);
    const freight = parseMoney(get(col.freight), 0);
    const rawMfn = get(col.mfnRate);
    const mfnRate = rawMfn !== '' ? parseMoney(rawMfn, NaN) : undefined;
    const rawRetail = get(col.retailPrice);
    const retailPrice = rawRetail !== '' ? parseMoney(rawRetail, NaN) : null;

    if (!Number.isFinite(unitCost) || unitCost < 0) {
      errors.push({ line, sku, message: `Line ${line} (${sku}): Invalid Unit Cost "${get(col.unitCost)}".` });
      continue;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      errors.push({ line, sku, message: `Line ${line} (${sku}): Invalid Quantity "${get(col.quantity)}".` });
      continue;
    }
    if (!Number.isFinite(freight) || freight < 0) {
      errors.push({ line, sku, message: `Line ${line} (${sku}): Invalid Freight "${get(col.freight)}".` });
      continue;
    }
    if (mfnRate !== undefined && (!Number.isFinite(mfnRate) || mfnRate < 0)) {
      errors.push({ line, sku, message: `Line ${line} (${sku}): Invalid Base MFN Rate "${rawMfn}".` });
      continue;
    }
    if (retailPrice !== null && (!Number.isFinite(retailPrice) || retailPrice < 0)) {
      errors.push({ line, sku, message: `Line ${line} (${sku}): Invalid Retail Price "${rawRetail}".` });
      continue;
    }

    const htsCode = get(col.hts) || 'CUSTOM';
    const mode = (get(col.mode) || defaultShippingMode || 'ocean').toLowerCase();
    const usmcaQualifying = col.usmca !== -1 ? parseBoolCell(get(col.usmca)) : false;

    const calc = calculateShipment({
      title,
      origin,
      htsCode,
      unitCost,
      quantity,
      freight,
      brokerFee: defaultBrokerFee,
      shippingMode: mode,
      mfnRate,
      extraTariffRate: defaultExtraTariffRate,
      targetMarginPct: defaultTargetMarginPct,
      currentRetailPrice: retailPrice,
      usmcaQualifying,
    });

    computed.push({ line, sku, title, ...calc });
  }

  const totalCustoms = round2(computed.reduce((s, r) => s + r.customsValue, 0));
  const totalDuties = round2(computed.reduce((s, r) => s + r.breakdown.totalDuty, 0));
  const totalCbpFees = round2(computed.reduce((s, r) => s + r.breakdown.totalCbpFees, 0));
  const totalFreight = round2(computed.reduce((s, r) => s + r.freight, 0));
  const totalLanded = round2(computed.reduce((s, r) => s + r.totalLandedCost, 0));
  const chinaSkus = computed.filter((r) => r.origin === 'CN').length;
  const marginAlertSkus = computed.filter((r) => r.currentMarginPct !== null && r.currentMarginPct < 30).length;

  const summary = {
    skuCount: computed.length,
    totalCustoms,
    totalDuties,
    totalCbpFees,
    totalFreight,
    totalLanded,
    blendedDutyPct: totalCustoms > 0 ? round2((totalDuties / totalCustoms) * 100) : 0,
    chinaSkus,
    marginAlertSkus,
  };

  const visibleRows = isPro ? computed : computed.slice(0, CBP_RULES.freePreviewSkuLimit);
  const truncatedCount = isPro ? 0 : Math.max(0, computed.length - CBP_RULES.freePreviewSkuLimit);
  const exportBlocked = errors.length > 0 || computed.length === 0 || !isPro;

  let exportCsv = null;
  let runbookMd = null;

  if (!exportBlocked) {
    const csvCols = [
      'SKU', 'Product', 'Origin', 'HTS Code', 'Mode', 'Entry Type', 'Qty', 'Unit FOB ($)',
      'Customs Value ($)', 'Base MFN %', 'Sec 301 %', 'Sec 232 %', 'Extra Tariff %',
      'Total Duty ($)', 'CBP MPF ($)', 'Ocean HMF ($)', 'Freight ($)',
      'Total Landed ($)', 'Landed Cost / Unit ($)', 'Current Retail ($)',
      'Current Net Margin %', 'Recommended DDP Price ($)',
    ];
    const esc = (v) => {
      const s = String(v ?? '');
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      csvCols.join(','),
      ...computed.map((r) => [
        r.sku, r.title, r.origin, r.htsCode, r.shippingMode, r.entryType, r.quantity, r.unitCost.toFixed(2),
        r.customsValue.toFixed(2), r.rates.mfn, r.rates.sec301, r.rates.sec232, r.rates.extra,
        r.breakdown.totalDuty.toFixed(2), r.breakdown.mpfFee.toFixed(2), r.breakdown.hmfFee.toFixed(2), r.freight.toFixed(2),
        r.totalLandedCost.toFixed(2), r.landedCostPerUnit.toFixed(2),
        r.currentRetailPrice !== null ? r.currentRetailPrice.toFixed(2) : '',
        r.currentMarginPct !== null ? r.currentMarginPct.toFixed(1) : '',
        r.recommendedDdpPrice.toFixed(2),
      ].map(esc).join(',')),
    ];
    exportCsv = lines.join('\r\n');

    const worstMargin = [...computed]
      .filter((r) => r.currentMarginPct !== null)
      .sort((a, b) => a.currentMarginPct - b.currentMarginPct)
      .slice(0, 5);

    runbookMd = [
      '# US Import Duty & DDP Pricing Runbook',
      '',
      `- **SKUs Analyzed:** ${summary.skuCount}`,
      `- **Total FOB Customs Value:** $${summary.totalCustoms.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `- **Total US Duties (MFN + Sec 301/232 + Scenario):** $${summary.totalDuties.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${summary.blendedDutyPct}% blended)`,
      `- **Total CBP Fees (MPF + HMF):** $${summary.totalCbpFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `- **Total Landed Cash Outlay:** $${summary.totalLanded.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      `- **China-Origin SKUs Exposed to Sec 301:** ${summary.chinaSkus}`,
      `- **SKUs Below 30% Net Landed Margin:** ${summary.marginAlertSkus}`,
      '',
      '## Highest Margin-Risk SKUs',
      ...(worstMargin.length
        ? worstMargin.map((r) => `- **${r.sku} (${r.title})** — Origin: ${r.origin}, Landed: $${r.landedCostPerUnit.toFixed(2)}/unit, Retail: $${r.currentRetailPrice.toFixed(2)} (**${r.currentMarginPct.toFixed(1)}% margin**) → Recommended DDP Price: **$${r.recommendedDdpPrice.toFixed(2)}**`)
        : ['- No current retail prices supplied; review Recommended DDP Price column in `us-landed-cost-breakdown.csv`.']),
      '',
      '## Customs & Shopify DDP Checklist',
      '1. Confirm exact 10-digit USITC HTS binding rulings with your licensed customs broker before filing.',
      '2. Verify **Country of Origin (Manufacture)** — shipping China-manufactured inventory from Canada or EU warehouses still triggers China Section 301 duties.',
      '3. For CA/MX USMCA-qualifying SKUs, retain signed Certificates of Origin on file to substantiate 0% MFN and $0 MPF.',
      '4. Update Shopify / ERP cost-per-item with `Landed Cost / Unit ($)` and adjust DDP retail prices before purchase orders ship.',
    ].join('\n');
  }

  return {
    totalSkus: computed.length,
    visibleSkus: visibleRows.length,
    truncatedCount,
    errors,
    rows: visibleRows,
    summary,
    exportBlocked,
    exportCsv,
    runbookMd,
  };
}
