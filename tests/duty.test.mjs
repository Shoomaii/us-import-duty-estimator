import test from 'node:test';
import assert from 'node:assert/strict';
import { CBP_RULES, analyzeBatchCsv, calculateShipment, normalizeCountry, normalizeShippingMode } from '../src/duty_engine.mjs';

test('China ocean formal shipment stacks MFN + Section 301 + MPF + HMF accurately', () => {
  const res = calculateShipment({
    presetId: 'cotton-tee',
    origin: 'CN',
    shippingMode: 'ocean',
    unitCost: 10,
    quantity: 1000,       // $10,000 customs value
    freight: 800,
    insurance: 50,
    brokerFee: 150,
    extraTariffRate: 10,
    targetMarginPct: 60,
    currentRetailPrice: 25,
  });

  assert.equal(res.customsValue, 10000);
  assert.equal(res.entryType, 'formal');
  assert.equal(res.breakdown.mfnDuty, 1650);
  assert.equal(res.breakdown.sec301Duty, 750);
  assert.equal(res.breakdown.extraDuty, 1000);
  assert.equal(res.breakdown.mpfFee, 34.64);
  assert.equal(res.breakdown.hmfFee, 12.50);
  assert.equal(res.breakdown.totalDutiesAndFees, 3447.14);
  assert.equal(res.totalLandedCost, 14447.14);
  assert.equal(res.landedCostPerUnit, 14.45);
  assert.equal(res.recommendedDdpPrice, 36.12);
});

test('CBP MPF respects statutory formal floor ($32.71) and formal cap ($634.62)', () => {
  const lowFormal = calculateShipment({
    presetId: 'cotton-tee',
    origin: 'VN',
    shippingMode: 'air',
    unitCost: 30,
    quantity: 100, // $3,000 -> raw MPF $10.39 -> clamped to $32.71
  });
  assert.equal(lowFormal.entryType, 'formal');
  assert.equal(lowFormal.breakdown.mpfFee, CBP_RULES.mpfFormalMin);
  assert.equal(lowFormal.breakdown.hmfFee, 0);

  const highFormal = calculateShipment({
    presetId: 'cotton-tee',
    origin: 'VN',
    shippingMode: 'ocean',
    unitCost: 100,
    quantity: 3000, // $300,000 -> raw MPF $1,039.20 -> clamped to $634.62
  });
  assert.equal(highFormal.breakdown.mpfFee, CBP_RULES.mpfFormalMax);
  assert.equal(highFormal.breakdown.hmfFee, 375);
});

test('Informal non-Section-301 shipment <= $2,500 uses $2.62 informal MPF', () => {
  const res = calculateShipment({
    presetId: 'skincare',
    origin: 'KR',
    shippingMode: 'courier',
    unitCost: 10,
    quantity: 100,
  });
  assert.equal(res.entryType, 'informal');
  assert.equal(res.breakdown.mpfFee, CBP_RULES.mpfInformalFee);
  assert.equal(res.breakdown.hmfFee, 0);
});

test('USMCA-qualifying Mexico/Canada shipment waives both Base MFN and CBP MPF', () => {
  const res = calculateShipment({
    presetId: 'leather-bags',
    origin: 'MX',
    shippingMode: 'truck',
    unitCost: 50,
    quantity: 200,
    usmcaQualifying: true,
  });
  assert.equal(res.usmcaApplied, true);
  assert.equal(res.breakdown.mfnDuty, 0);
  assert.equal(res.breakdown.mpfFee, 0);
  assert.equal(res.breakdown.hmfFee, 0);
  assert.equal(res.breakdown.totalDutiesAndFees, 0);
});

test('Steel fastener preset stacks Section 232 (25%) + China Section 301 (25%)', () => {
  const res = calculateShipment({
    presetId: 'steel-bolts',
    origin: 'CN',
    shippingMode: 'ocean',
    unitCost: 5,
    quantity: 200,
  });
  assert.equal(res.entryType, 'formal');
  assert.equal(res.breakdown.sec301Duty, 250);
  assert.equal(res.breakdown.sec232Duty, 250);
  assert.equal(res.breakdown.mpfFee, CBP_RULES.mpfFormalMin);
});

test('Country & shipping mode normalization handle EO 13936 HK->CN, Sea->ocean, and reject junk', () => {
  assert.equal(normalizeCountry('HK'), 'CN');
  assert.equal(normalizeCountry('Hong Kong'), 'CN');
  assert.equal(normalizeCountry('FR'), 'OTHER');
  assert.equal(normalizeCountry('12'), '');
  assert.equal(normalizeCountry('MARS'), '');
  assert.equal(normalizeShippingMode('Sea'), 'ocean');
  assert.equal(normalizeShippingMode('DHL'), 'courier');
  assert.equal(normalizeShippingMode('teleport'), '');

  assert.throws(() => calculateShipment({ origin: 'CN', unitCost: 10, quantity: 10, mfnRate: 'abc' }));
  assert.throws(() => calculateShipment({ origin: 'CN', unitCost: 10, quantity: 10, extraTariffRate: -5 }));
});

test('Batch CSV analyzer handles thousands commas, consolidated pro-rata MPF vs separate MPF, and formula guard', () => {
  const rows = [
    'SKU,Product,Origin,HTS,Unit Cost,Qty,Freight,Mode,Retail Price,USMCA',
    '"=SUM(A1)","Cotton Tee, Heavy",HK,6109.10.00,"$1,000.00","2",100,Sea,"$2,500.00",no',
    'S2,Tee 2,VN,6109.10.00,10.00,200,100,ocean,35.00,no',
    'S3,Mug,CN,6912.00.44,3.00,200,150,ocean,16.00,no',
    'S4,Cable,CN,8544.42.90,2.00,500,120,air,12.00,no',
    'S5,Serum,KR,3304.99.50,5.00,200,90,DHL,32.00,no',
    'S6,Bag,MX,4202.21.90,25.00,100,200,truck,110.00,yes',
  ].join('\n');

  // Free preview truncates to 5 rows
  const freeRes = analyzeBatchCsv(rows, { isPro: false, entryBasis: 'consolidated' });
  assert.equal(freeRes.errors.length, 0);
  assert.equal(freeRes.totalSkus, 6);
  assert.equal(freeRes.visibleSkus, 5);
  assert.equal(freeRes.truncatedCount, 1);
  assert.equal(freeRes.exportBlocked, true);
  assert.equal(freeRes.exportCsv, null);

  // Pro consolidated: non-USMCA customs = 2000 + 2000 + 600 + 1000 + 1000 = $6,600 -> single formal MPF $32.71 (since $6,600*0.003464=$22.86 < $32.71)
  const proCons = analyzeBatchCsv(rows, { isPro: true, entryBasis: 'consolidated' });
  assert.equal(proCons.errors.length, 0);
  assert.equal(proCons.visibleSkus, 6);
  assert.equal(proCons.exportBlocked, false);
  const totalMpfCons = Math.round(proCons.rows.reduce((s, r) => s + r.breakdown.mpfFee, 0) * 100) / 100;
  assert.equal(totalMpfCons, 32.71);
  assert.equal(proCons.rows[5].breakdown.mpfFee, 0); // USMCA MX row pays $0 MPF
  assert.equal(proCons.rows[0].origin, 'CN');        // HK -> CN
  assert.equal(proCons.rows[0].shippingMode, 'ocean'); // Sea -> ocean
  assert.ok(proCons.exportCsv.includes("'=SUM(A1)")); // Formula injection guarded

  // Separate entry mode applies MPF independently per SKU
  const proSep = analyzeBatchCsv(rows, { isPro: true, entryBasis: 'separate' });
  const totalMpfSep = Math.round(proSep.rows.reduce((s, r) => s + r.breakdown.mpfFee, 0) * 100) / 100;
  assert.ok(totalMpfSep > totalMpfCons);
});

test('Batch CSV analyzer blocks export on invalid country, unclosed quotes, bogus shipping mode, or invalid margin', () => {
  const badCountry = 'SKU,Product,Origin,HTS,Unit Cost,Qty\nOK-1,Good,CN,6109.10.00,10,100\nBAD-2,Broken,MARS,6109.10.00,10,100\n';
  const r1 = analyzeBatchCsv(badCountry, { isPro: true });
  assert.equal(r1.errors.length, 1);
  assert.equal(r1.exportBlocked, true);
  assert.equal(r1.exportCsv, null);

  const unclosedQuote = 'SKU,Product,Origin,Unit Cost,Qty\nA,"Broken Quote,CN,10,100\n';
  const r2 = analyzeBatchCsv(unclosedQuote, { isPro: true });
  assert.equal(r2.errors.length, 1);
  assert.match(r2.errors[0].message, /unclosed quoted/i);
  assert.equal(r2.exportBlocked, true);

  const badMode = 'SKU,Product,Origin,Unit Cost,Qty,Mode\nA,Item,VN,10,100,teleport\n';
  const r3 = analyzeBatchCsv(badMode, { isPro: true });
  assert.equal(r3.errors.length, 1);
  assert.equal(r3.exportBlocked, true);

  const badMargin = analyzeBatchCsv('SKU,Unit Cost,Qty\nA,10,100\n', { isPro: true, defaultTargetMarginPct: 100 });
  assert.equal(badMargin.errors.length, 1);
  assert.equal(badMargin.exportBlocked, true);
});
