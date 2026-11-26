/**
 * Deterministic US Import Duty & Full Landed Cost Engine (USITC + CBP Fees)
 * Pure ES module — runs identically in Node tests, Free Web Preview, and Offline Pro HTML.
 */

export const MPF_SCHEDULES = {
  FY2026: {
    fiscalYear: 'FY2026',
    effectiveFrom: '2025-10-01',
    effectiveTo: '2026-09-30',
    mpfFormalRate: 0.003464,
    mpfFormalMin: 32.71,
    mpfFormalMax: 634.62,
    mpfInformalFee: 2.62,
  },
  FY2027: {
    fiscalYear: 'FY2027',
    effectiveFrom: '2026-10-01',
    effectiveTo: '2027-09-30',
    mpfFormalRate: 0.003464,
    mpfFormalMin: 34.58,
    mpfFormalMax: 670.86,
    mpfInformalFee: 2.77,
  },
};

export const DEFAULT_ENTRY_DATE = '2026-11-25';

export const CBP_RULES = {
  ...MPF_SCHEDULES.FY2027,
  formalThresholdUsd: 2500.0,
  hmfOceanRate: 0.00125,
  freePreviewSkuLimit: 5,
};

export function getCbpSchedule(entryDate = DEFAULT_ENTRY_DATE) {
  const raw = String(entryDate || DEFAULT_ENTRY_DATE).trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) {
    throw new Error(`Invalid entry date "${entryDate}". Use YYYY-MM-DD format.`);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() + 1 !== mo || dt.getUTCDate() !== d) {
    throw new Error(`Invalid calendar entry date "${entryDate}".`);
  }
  const schedule = raw < '2026-10-01' ? MPF_SCHEDULES.FY2026 : MPF_SCHEDULES.FY2027;
  return {
    ...schedule,
    entryDate: raw,
    formalThresholdUsd: CBP_RULES.formalThresholdUsd,
    hmfOceanRate: CBP_RULES.hmfOceanRate,
  };
}

export const COUNTRIES = [
  { code: 'CN', name: 'China', sec301Eligible: true, usmca: false, note: 'Subject to Chapter 99 Section 301 lists (7.5%–50%) regardless of dispatch country.' },
  { code: 'HK', name: 'Hong Kong', sec301Eligible: false, usmca: false, note: 'EO 13936 requires "China" origin marking on goods of Hong Kong origin, but CBP still distinguishes genuine Hong Kong origin as exempt from China Section 301 tariffs.' },
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

const OTHER_WTO_ISO2 = new Set([
  'AT','BE','BR','CH','CL','CO','CZ','DK','ES','FI','FR','GR','HU','IE','IL',
  'KH','LK','MA','MY','NL','NO','NZ','PE','PH','PL','PT','RO','SE','SG','SK','ZA',
]);

export function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

/**
 * Allocate a USD dollar total across weights in integer cents using the largest-remainder method.
 * Guarantees every allocation is >= 0 and the sum of allocations equals totalUsd to the exact cent.
 */
export function allocateCentsProRata(totalUsd, weights) {
  const n = weights.length;
  if (n === 0) return [];
  const totalCents = Math.round(Number(totalUsd) * 100);
  if (!Number.isFinite(totalCents) || totalCents < 0) {
    throw new Error('Allocation total must be a non-negative finite number.');
  }
  if (totalCents === 0) return new Array(n).fill(0);

  const cleanWeights = weights.map((w) => (Number.isFinite(Number(w)) && Number(w) > 0 ? Number(w) : 0));
  const sumW = cleanWeights.reduce((a, b) => a + b, 0);
  const effectiveWeights = sumW > 0 ? cleanWeights : new Array(n).fill(1);
  const denom = sumW > 0 ? sumW : n;

  const floors = new Array(n).fill(0);
  const remainders = [];
  let sumFloor = 0;

  for (let i = 0; i < n; i += 1) {
    if (effectiveWeights[i] === 0) continue;
    const exact = (totalCents * effectiveWeights[i]) / denom;
    const fl = Math.floor(exact);
    floors[i] = fl;
    sumFloor += fl;
    remainders.push({ idx: i, rem: exact - fl });
  }

  let leftover = totalCents - sumFloor;
  remainders.sort((a, b) => (b.rem - a.rem) || (a.idx - b.idx));
  for (let k = 0; k < leftover && k < remainders.length; k += 1) {
    floors[remainders[k].idx] += 1;
  }

  return floors.map((c) => c / 100);
}

/**
 * Resolve an HTS preset ID or 8/10-digit HTS code while distinguishing exact matches
 * from 6-digit heading prefix candidates so prefix substitutions are never silent.
 */
export function resolvePreset(htsOrId) {
  if (!htsOrId) return { preset: null, matchType: 'none' };
  const raw = String(htsOrId).trim();
  if (!raw) return { preset: null, matchType: 'none' };
  if (PRESET_BY_ID.has(raw)) {
    const p = PRESET_BY_ID.get(raw);
    return { preset: p, matchType: p.id === 'custom' ? 'custom' : 'exact' };
  }
  if (raw.toUpperCase() === 'CUSTOM') {
    return { preset: PRESET_BY_ID.get('custom'), matchType: 'custom' };
  }
  const digits = raw.replace(/\D+/g, '');
  if (digits && PRESET_BY_HTS.has(digits)) {
    return { preset: PRESET_BY_HTS.get(digits), matchType: 'exact' };
  }
  // Exact 10-digit statistical suffix under a known 8-digit tariff line (e.g. 6109.10.00.12 -> 6109.10.00)
  if (digits.length === 10 && PRESET_BY_HTS.has(digits.slice(0, 8))) {
    return { preset: PRESET_BY_HTS.get(digits.slice(0, 8)), matchType: 'exact' };
  }
  // 6-digit heading match only — requires explicit confirmation or manual rate
  if (digits.length >= 6) {
    for (const p of HTS_PRESETS) {
      const pd = p.hts.replace(/\D+/g, '');
      if (pd.length >= 6 && pd.slice(0, 6) === digits.slice(0, 6)) {
        return { preset: p, matchType: 'prefix' };
      }
    }
  }
  return { preset: null, matchType: 'none' };
}

export function findPreset(htsOrId) {
  const { preset, matchType } = resolvePreset(htsOrId);
  return matchType === 'exact' || matchType === 'custom' ? preset : null;
}

export function normalizeCountry(raw) {
  const s = String(raw || '').trim().toUpperCase();
  if (!s) return '';
  if (COUNTRY_BY_CODE.has(s)) return s;
  const aliases = {
    CHINA: 'CN', PRC: 'CN',
    HK: 'HK', 'HONG KONG': 'HK', HONGKONG: 'HK',
    VIETNAM: 'VN', INDIA: 'IN', MEXICO: 'MX', CANADA: 'CA',
    GERMANY: 'DE', ITALY: 'IT', UK: 'GB', 'UNITED KINGDOM': 'GB', BRITAIN: 'GB',
    JAPAN: 'JP', KOREA: 'KR', 'SOUTH KOREA': 'KR', TAIWAN: 'TW',
    TURKEY: 'TR', THAILAND: 'TH', INDONESIA: 'ID', BANGLADESH: 'BD',
    PAKISTAN: 'PK', AUSTRALIA: 'AU', EU: 'DE',
  };
  if (aliases[s]) return aliases[s];
  if (OTHER_WTO_ISO2.has(s)) return 'OTHER';
  return '';
}

export function normalizeShippingMode(raw) {
  const s = String(raw || '').trim().toLowerCase();
  if (!s) return 'ocean';
  if (['ocean', 'sea', 'vessel', 'fcl', 'lcl', 'maritime', 'boat', 'ship'].includes(s)) return 'ocean';
  if (['air', 'airfreight', 'air freight', 'plane'].includes(s)) return 'air';
  if (['courier', 'express', 'dhl', 'fedex', 'ups', 'usps', 'parcel', 'post'].includes(s)) return 'courier';
  if (['truck', 'rail', 'ground', 'road', 'ltl', 'ftl', 'land'].includes(s)) return 'truck';
  return '';
}

function assertNonNegFinite(val, label) {
  if (!Number.isFinite(val) || val < 0) {
    throw new Error(`${label} must be a valid non-negative number.`);
  }
}

/**
 * Calculate deterministic US import duties, CBP fees (FY-versioned), full landed cost, and DDP pricing.
 */
export function calculateShipment(input) {
  const schedule = getCbpSchedule(input.entryDate || DEFAULT_ENTRY_DATE);
  const unitCost = Number(input.unitCost);
  const quantity = Number(input.quantity);
  const freight = input.freight === '' || input.freight === undefined || input.freight === null ? 0 : Number(input.freight);
  const insurance = input.insurance === '' || input.insurance === undefined || input.insurance === null ? 0 : Number(input.insurance);
  const brokerFee = input.brokerFee === '' || input.brokerFee === undefined || input.brokerFee === null ? 0 : Number(input.brokerFee);
  const targetMarginPct = input.targetMarginPct === '' || input.targetMarginPct === undefined || input.targetMarginPct === null
    ? 60
    : Number(input.targetMarginPct);
  const currentRetailPrice = input.currentRetailPrice !== undefined && input.currentRetailPrice !== '' && input.currentRetailPrice !== null
    ? Number(input.currentRetailPrice)
    : null;

  assertNonNegFinite(unitCost, 'Unit cost');
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('Quantity must be greater than 0.');
  assertNonNegFinite(freight, 'Freight');
  assertNonNegFinite(insurance, 'Insurance');
  assertNonNegFinite(brokerFee, 'Broker fee');
  if (!Number.isFinite(targetMarginPct) || targetMarginPct < 0 || targetMarginPct >= 99) {
    throw new Error('Target margin must be between 0% and 98.9%.');
  }
  if (currentRetailPrice !== null) {
    assertNonNegFinite(currentRetailPrice, 'Current retail price');
  }

  const origin = normalizeCountry(input.origin || 'CN');
  if (!origin) throw new Error(`Unsupported country of origin: "${input.origin}".`);
  const country = COUNTRY_BY_CODE.get(origin) || COUNTRY_BY_CODE.get('OTHER');

  const { preset, matchType } = resolvePreset(input.presetId || input.htsCode);
  const hasManualMfn = input.mfnRate !== undefined && input.mfnRate !== '' && input.mfnRate !== null;

  if (!hasManualMfn) {
    if (matchType === 'prefix' && !input.confirmPrefixFallback) {
      throw new Error(
        `HTS "${input.htsCode || input.presetId}" only matches 6-digit heading ${preset.hts} (${preset.label}). Provide an explicit Base MFN Rate or confirm the exact tariff line.`
      );
    }
    if (matchType === 'none' || matchType === 'custom') {
      throw new Error(
        `Unrecognized or custom HTS code "${input.htsCode || input.presetId || ''}" requires an explicit Base MFN Duty (%) rate.`
      );
    }
  }

  const mode = normalizeShippingMode(input.shippingMode ?? 'ocean');
  if (!mode) throw new Error(`Unsupported shipping mode: "${input.shippingMode}". Use ocean, air, courier, or truck.`);

  const customsValue = round2(unitCost * quantity);

  const rawMfnRate = hasManualMfn ? Number(input.mfnRate) : preset.mfnRate;
  assertNonNegFinite(rawMfnRate, 'Base MFN duty rate');

  const usmcaApplied = Boolean(input.usmcaQualifying) && Boolean(country.usmca);
  const effectiveMfnRate = usmcaApplied ? 0 : rawMfnRate;

  const applySec301 = input.applySec301 !== undefined ? Boolean(input.applySec301) : country.sec301Eligible;
  const rawSec301Rate = input.sec301Rate !== undefined && input.sec301Rate !== '' && input.sec301Rate !== null
    ? Number(input.sec301Rate)
    : (preset && (matchType === 'exact' || input.confirmPrefixFallback) ? preset.sec301Rate : 0);
  assertNonNegFinite(rawSec301Rate, 'Section 301 rate');
  const effectiveSec301Rate = (country.sec301Eligible && applySec301) ? rawSec301Rate : 0;

  const applySec232 = input.applySec232 !== undefined
    ? Boolean(input.applySec232)
    : Boolean(preset && (matchType === 'exact' || input.confirmPrefixFallback) && preset.sec232Rate > 0);
  const rawSec232Rate = input.sec232Rate !== undefined && input.sec232Rate !== '' && input.sec232Rate !== null
    ? Number(input.sec232Rate)
    : (preset && (matchType === 'exact' || input.confirmPrefixFallback) ? preset.sec232Rate : 0);
  assertNonNegFinite(rawSec232Rate, 'Section 232 rate');
  const effectiveSec232Rate = applySec232 ? rawSec232Rate : 0;

  const extraTariffRate = input.extraTariffRate === '' || input.extraTariffRate === undefined || input.extraTariffRate === null
    ? 0
    : Number(input.extraTariffRate);
  assertNonNegFinite(extraTariffRate, 'Extra tariff rate');

  const mfnDuty = round2(customsValue * (effectiveMfnRate / 100));
  const sec301Duty = round2(customsValue * (effectiveSec301Rate / 100));
  const sec232Duty = round2(customsValue * (effectiveSec232Rate / 100));
  const extraDuty = round2(customsValue * (extraTariffRate / 100));
  const totalDuty = round2(mfnDuty + sec301Duty + sec232Duty + extraDuty);

  const hasTradeRemedy = effectiveSec301Rate > 0 || effectiveSec232Rate > 0;
  const entryType = (input.forceFormalEntry || customsValue > schedule.formalThresholdUsd || hasTradeRemedy)
    ? 'formal'
    : 'informal';

  let mpfFee = 0;
  if (input.mpfOverrideUsd !== undefined && input.mpfOverrideUsd !== null) {
    assertNonNegFinite(Number(input.mpfOverrideUsd), 'MPF override');
    mpfFee = round2(Number(input.mpfOverrideUsd));
  } else if (usmcaApplied) {
    mpfFee = 0;
  } else if (entryType === 'formal') {
    const rawMpf = customsValue * schedule.mpfFormalRate;
    mpfFee = round2(Math.min(schedule.mpfFormalMax, Math.max(schedule.mpfFormalMin, rawMpf)));
  } else {
    mpfFee = schedule.mpfInformalFee;
  }

  const hmfFee = mode === 'ocean' ? round2(customsValue * schedule.hmfOceanRate) : 0;
  const totalCbpFees = round2(mpfFee + hmfFee);
  const totalDutiesAndFees = round2(totalDuty + totalCbpFees);

  const totalLandedCost = round2(customsValue + freight + insurance + brokerFee + totalDutiesAndFees);
  const exactUnitLanded = totalLandedCost / quantity;
  const landedCostPerUnit = round2(exactUnitLanded);
  const dutyPerUnit = round2(totalDutiesAndFees / quantity);
  const effectiveDutyRatePct = customsValue > 0 ? round2((totalDuty / customsValue) * 100) : 0;
  const effectiveAllInTaxPct = customsValue > 0 ? round2((totalDutiesAndFees / customsValue) * 100) : 0;

  const recommendedDdpPrice = round2(exactUnitLanded / (1 - targetMarginPct / 100));
  const currentMarginPct = (currentRetailPrice !== null && currentRetailPrice > 0)
    ? round2(((currentRetailPrice - exactUnitLanded) / currentRetailPrice) * 100)
    : null;
  const currentProfitPerUnit = (currentRetailPrice !== null)
    ? round2(currentRetailPrice - exactUnitLanded)
    : null;

  const warnings = [];
  if (origin === 'CN' && effectiveSec301Rate > 0) {
    warnings.push(`China Section 301 (${effectiveSec301Rate}%) applied — CBP determines origin by country of manufacture, even if shipped via Canada or EU.`);
  }
  if (origin === 'HK') {
    warnings.push('Hong Kong origin: China Section 301 is NOT assessed on genuine HK-origin goods (EO 13936 affects marking only). Verify true HK origin documentation.');
  }
  if (effectiveSec232Rate > 0) {
    warnings.push(`Section 232 steel/aluminum derivative tariff (${effectiveSec232Rate}%) applied.`);
  }
  if (entryType === 'formal' && customsValue <= schedule.formalThresholdUsd && hasTradeRemedy && !usmcaApplied) {
    warnings.push(`Formal entry MPF ($${mpfFee.toFixed(2)}, ${schedule.fiscalYear}) triggered because Section 301/232 goods are excluded from informal/de minimis entry.`);
  }
  if (usmcaApplied) {
    warnings.push('USMCA/CUSMA preference active: Base MFN duty (0%) and CBP MPF ($0.00) waived. Keep signed Certificate of Origin on file.');
  }
  if (currentMarginPct !== null && currentMarginPct < 30) {
    warnings.push(`Margin alert: At $${currentRetailPrice.toFixed(2)} retail, net landed margin drops to ${currentMarginPct.toFixed(1)}% ($${currentProfitPerUnit.toFixed(2)}/unit before ads/pick-pack).`);
  }

  return {
    entryDate: schedule.entryDate,
    fiscalYear: schedule.fiscalYear,
    origin,
    countryName: country.name,
    htsCode: input.htsCode || (preset ? preset.hts : 'CUSTOM'),
    htsLabel: preset && matchType !== 'none' ? preset.label : (input.title || 'Custom Product'),
    htsMatchType: matchType,
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

export function parseCsv(text) {
  const src = String(text || '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let fieldStart = true;
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
    } else if (ch === '"' && fieldStart) {
      inQuotes = true;
      fieldStart = false;
    } else if (ch === ',') {
      row.push(field.trim());
      field = '';
      fieldStart = true;
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      row.push(field.trim());
      field = '';
      fieldStart = true;
      if (row.some((c) => c !== '')) {
        rows.push({ line: rowStartLine, cells: row });
      }
      row = [];
      line += 1;
      rowStartLine = line;
    } else {
      field += ch;
      fieldStart = false;
    }
  }
  if (inQuotes) {
    return { rows: [], error: `Malformed CSV: unclosed quoted field starting near line ${rowStartLine}.` };
  }
  row.push(field.trim());
  if (row.some((c) => c !== '')) {
    rows.push({ line: rowStartLine, cells: row });
  }
  return { rows, error: null };
}

function parseMoney(raw, fallback = 0) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return fallback;
  const trimmed = String(raw).trim().replace(/^[$€£¥\s]+|[%\s]+$/g, '');
  if (trimmed.includes(',') && !/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(trimmed)) {
    return NaN;
  }
  const num = Number(trimmed.replace(/,/g, ''));
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

function escCsvCell(v, guardFormula = false) {
  let s = String(v ?? '');
  if (guardFormula && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function analyzeBatchCsv(csvText, options = {}) {
  const {
    isPro = false,
    entryDate = DEFAULT_ENTRY_DATE,
    defaultExtraTariffRate = 0,
    defaultTargetMarginPct = 60,
    defaultShippingMode = 'ocean',
    defaultBrokerFee = 0,
    entryBasis = 'consolidated',
    confirmPrefixFallback = false,
  } = options;

  const errors = [];
  let schedule;
  try {
    schedule = getCbpSchedule(entryDate);
  } catch (err) {
    errors.push({ line: 0, message: err.message });
  }
  if (!Number.isFinite(Number(defaultTargetMarginPct)) || Number(defaultTargetMarginPct) < 0 || Number(defaultTargetMarginPct) >= 99) {
    errors.push({ line: 0, message: 'Target DDP Margin must be between 0% and 98.9%.' });
  }
  if (!Number.isFinite(Number(defaultExtraTariffRate)) || Number(defaultExtraTariffRate) < 0) {
    errors.push({ line: 0, message: 'Default Extra Tariff Rate must be >= 0%.' });
  }
  if (!Number.isFinite(Number(defaultBrokerFee)) || Number(defaultBrokerFee) < 0) {
    errors.push({ line: 0, message: 'Broker Fee must be >= $0.' });
  }
  const cleanDefaultMode = normalizeShippingMode(defaultShippingMode);
  if (!cleanDefaultMode) {
    errors.push({ line: 0, message: `Unsupported default shipping mode: "${defaultShippingMode}".` });
  }
  if (errors.length > 0) {
    return {
      totalSkus: 0, visibleSkus: 0, truncatedCount: 0, entryBasis,
      entryDate, fiscalYear: schedule ? schedule.fiscalYear : '',
      errors, rows: [], summary: null, exportBlocked: true, exportCsv: null, runbookMd: null,
    };
  }

  const { rows: parsed, error: csvErr } = parseCsv(csvText);
  if (csvErr) {
    return {
      totalSkus: 0, visibleSkus: 0, truncatedCount: 0, entryBasis,
      entryDate: schedule.entryDate, fiscalYear: schedule.fiscalYear,
      errors: [{ line: 1, message: csvErr }],
      rows: [], summary: null, exportBlocked: true, exportCsv: null, runbookMd: null,
    };
  }
  if (parsed.length < 2) {
    return {
      totalSkus: 0, visibleSkus: 0, truncatedCount: 0, entryBasis,
      entryDate: schedule.entryDate, fiscalYear: schedule.fiscalYear,
      errors: [{ line: 1, message: 'Paste or upload a CSV with a header row and at least 1 SKU row.' }],
      rows: [], summary: null, exportBlocked: true, exportCsv: null, runbookMd: null,
    };
  }

  const col = mapHeaderIndex(parsed[0].cells);
  if (col.unitCost === -1) {
    return {
      totalSkus: 0, visibleSkus: 0, truncatedCount: 0, entryBasis,
      entryDate: schedule.entryDate, fiscalYear: schedule.fiscalYear,
      errors: [{ line: parsed[0].line, message: 'Missing required "Unit Cost" (or "FOB" / "Cost") column in CSV header.' }],
      rows: [], summary: null, exportBlocked: true, exportCsv: null, runbookMd: null,
    };
  }

  const validInputs = [];

  for (let i = 1; i < parsed.length; i += 1) {
    const { line, cells } = parsed[i];
    const get = (idx) => (idx >= 0 && idx < cells.length ? cells[idx] : '');

    const sku = get(col.sku) || `SKU-${i}`;
    const title = get(col.title) || sku;
    const rawOrigin = get(col.origin) || 'CN';
    const origin = normalizeCountry(rawOrigin);
    if (!origin) {
      errors.push({ line, sku, message: `Line ${line} (${sku}): Unrecognized Country of Origin "${rawOrigin}". Use 2-letter ISO code (e.g. CN, HK, VN, MX, CA, DE).` });
      continue;
    }

    const rawMode = get(col.mode);
    const mode = rawMode ? normalizeShippingMode(rawMode) : cleanDefaultMode;
    if (!mode) {
      errors.push({ line, sku, message: `Line ${line} (${sku}): Unrecognized Shipping Mode "${rawMode}". Use ocean, air, courier, or truck.` });
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

    const htsCode = get(col.hts) || '';
    const { preset, matchType } = resolvePreset(htsCode);
    if (mfnRate === undefined) {
      if (matchType === 'prefix' && !confirmPrefixFallback) {
        errors.push({
          line,
          sku,
          message: `Line ${line} (${sku}): HTS "${htsCode}" only matches 6-digit heading ${preset.hts} (${preset.label}). Add a "Base Rate" column with the confirmed MFN % before exporting.`,
        });
        continue;
      }
      if (matchType === 'none' || matchType === 'custom') {
        errors.push({
          line,
          sku,
          message: `Line ${line} (${sku}): Unrecognized HTS code "${htsCode || '(blank)'}" with no manual MFN rate. Use a supported HTS code or add a "Base Rate" column with the confirmed MFN %.`,
        });
        continue;
      }
    }

    const usmcaQualifying = col.usmca !== -1 ? parseBoolCell(get(col.usmca)) : false;

    validInputs.push({
      line, sku, title, origin, htsCode: htsCode || 'CUSTOM', unitCost, quantity, freight,
      shippingMode: mode, mfnRate, retailPrice, usmcaQualifying,
    });
  }

  let mpfByIndex = null;
  let forceConsolidatedFormal = false;

  if (entryBasis === 'consolidated' && validInputs.length > 0) {
    const prelim = validInputs.map((v) => calculateShipment({
      entryDate: schedule.entryDate,
      title: v.title, origin: v.origin, htsCode: v.htsCode, unitCost: v.unitCost,
      quantity: v.quantity, freight: v.freight, brokerFee: 0, shippingMode: v.shippingMode,
      mfnRate: v.mfnRate, extraTariffRate: Number(defaultExtraTariffRate),
      targetMarginPct: Number(defaultTargetMarginPct), currentRetailPrice: v.retailPrice,
      usmcaQualifying: v.usmcaQualifying, confirmPrefixFallback,
    }));

    let nonUsmcaValue = 0;
    let anyTradeRemedy = false;
    const mpfWeights = prelim.map((p) => {
      if (p.usmcaApplied) return 0;
      nonUsmcaValue += p.customsValue;
      if (p.rates.sec301 > 0 || p.rates.sec232 > 0) anyTradeRemedy = true;
      return p.customsValue > 0 ? p.customsValue : 1;
    });

    const hasNonUsmca = mpfWeights.some((w) => w > 0);
    if (hasNonUsmca) {
      const isFormalEntry = nonUsmcaValue > schedule.formalThresholdUsd || anyTradeRemedy;
      forceConsolidatedFormal = isFormalEntry;
      const totalEntryMpf = isFormalEntry
        ? round2(Math.min(schedule.mpfFormalMax, Math.max(schedule.mpfFormalMin, nonUsmcaValue * schedule.mpfFormalRate)))
        : schedule.mpfInformalFee;
      mpfByIndex = allocateCentsProRata(totalEntryMpf, mpfWeights);
    } else {
      mpfByIndex = new Array(validInputs.length).fill(0);
    }
  }

  const brokerFeeNum = Number(defaultBrokerFee);
  const brokerByIndex = entryBasis === 'consolidated' && brokerFeeNum > 0
    ? allocateCentsProRata(brokerFeeNum, validInputs.map((v) => round2(v.unitCost * v.quantity)))
    : validInputs.map(() => brokerFeeNum);

  const computed = validInputs.map((v, idx) => {
    const calc = calculateShipment({
      entryDate: schedule.entryDate,
      title: v.title,
      origin: v.origin,
      htsCode: v.htsCode,
      unitCost: v.unitCost,
      quantity: v.quantity,
      freight: v.freight,
      brokerFee: brokerByIndex[idx],
      shippingMode: v.shippingMode,
      mfnRate: v.mfnRate,
      extraTariffRate: Number(defaultExtraTariffRate),
      targetMarginPct: Number(defaultTargetMarginPct),
      currentRetailPrice: v.retailPrice,
      usmcaQualifying: v.usmcaQualifying,
      confirmPrefixFallback,
      forceFormalEntry: entryBasis === 'consolidated' ? forceConsolidatedFormal : false,
      mpfOverrideUsd: mpfByIndex ? mpfByIndex[idx] : null,
    });
    return { line: v.line, sku: v.sku, title: v.title, ...calc };
  });

  const totalCustoms = round2(computed.reduce((s, r) => s + r.customsValue, 0));
  const totalDuties = round2(computed.reduce((s, r) => s + r.breakdown.totalDuty, 0));
  const totalCbpFees = round2(computed.reduce((s, r) => s + r.breakdown.totalCbpFees, 0));
  const totalFreight = round2(computed.reduce((s, r) => s + r.freight, 0));
  const totalLanded = round2(computed.reduce((s, r) => s + r.totalLandedCost, 0));
  const chinaSkus = computed.filter((r) => r.origin === 'CN').length;
  const marginAlertSkus = computed.filter((r) => r.currentMarginPct !== null && r.currentMarginPct < 30).length;

  const summary = {
    skuCount: computed.length,
    excludedErrorCount: errors.length,
    entryBasis,
    entryDate: schedule.entryDate,
    fiscalYear: schedule.fiscalYear,
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
      'SKU', 'Product', 'Origin', 'HTS Code', 'Entry Date', 'CBP FY', 'Mode', 'Entry Type', 'Qty', 'Unit FOB ($)',
      'Customs Value ($)', 'Base MFN %', 'Sec 301 %', 'Sec 232 %', 'Extra Tariff %',
      'Total Duty ($)', 'CBP MPF ($)', 'Ocean HMF ($)', 'Freight ($)',
      'Total Landed ($)', 'Landed Cost / Unit ($)', 'Current Retail ($)',
      'Current Net Margin %', 'Recommended DDP Price ($)',
    ];
    const lines = [
      csvCols.join(','),
      ...computed.map((r) => [
        escCsvCell(r.sku, true), escCsvCell(r.title, true), escCsvCell(r.origin), escCsvCell(r.htsCode, true),
        escCsvCell(r.entryDate), escCsvCell(r.fiscalYear),
        escCsvCell(r.shippingMode), escCsvCell(r.entryType), escCsvCell(r.quantity), escCsvCell(r.unitCost.toFixed(2)),
        escCsvCell(r.customsValue.toFixed(2)), escCsvCell(r.rates.mfn), escCsvCell(r.rates.sec301), escCsvCell(r.rates.sec232), escCsvCell(r.rates.extra),
        escCsvCell(r.breakdown.totalDuty.toFixed(2)), escCsvCell(r.breakdown.mpfFee.toFixed(2)), escCsvCell(r.breakdown.hmfFee.toFixed(2)), escCsvCell(r.freight.toFixed(2)),
        escCsvCell(r.totalLandedCost.toFixed(2)), escCsvCell(r.landedCostPerUnit.toFixed(2)),
        escCsvCell(r.currentRetailPrice !== null ? r.currentRetailPrice.toFixed(2) : ''),
        escCsvCell(r.currentMarginPct !== null ? r.currentMarginPct.toFixed(1) : ''),
        escCsvCell(r.recommendedDdpPrice.toFixed(2)),
      ].join(',')),
    ];
    exportCsv = lines.join('\r\n');

    const worstMargin = [...computed]
      .filter((r) => r.currentMarginPct !== null)
      .sort((a, b) => a.currentMarginPct - b.currentMarginPct)
      .slice(0, 5);

    runbookMd = [
      '# US Import Duty & DDP Pricing Runbook',
      '',
      `- **Entry Date / CBP Schedule:** ${schedule.entryDate} (${schedule.fiscalYear}: formal MPF $${schedule.mpfFormalMin.toFixed(2)}–$${schedule.mpfFormalMax.toFixed(2)}, informal $${schedule.mpfInformalFee.toFixed(2)})`,
      `- **SKUs Analyzed:** ${summary.skuCount}`,
      `- **Customs Entry Basis:** ${entryBasis === 'consolidated' ? 'Single Consolidated Entry (pro-rata CBP MPF & broker fee)' : 'Separate Entry per SKU'}`,
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
    entryBasis,
    entryDate: schedule.entryDate,
    fiscalYear: schedule.fiscalYear,
    errors,
    rows: visibleRows,
    summary,
    exportBlocked,
    exportCsv,
    runbookMd,
  };
}
