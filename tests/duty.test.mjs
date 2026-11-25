import test from 'node:test';
import assert from 'node:assert/strict';
import { CBP_RULES, analyzeBatchCsv, calculateShipment } from '../src/duty_engine.mjs';

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
  assert.equal(res.breakdown.mfnDuty, 1650);       // 16.5%
  assert.equal(res.breakdown.sec301Duty, 750);     // 7.5%
  assert.equal(res.breakdown.extraDuty, 1000);     // 10%
  assert.equal(res.breakdown.mpfFee, 34.64);       // 0.3464% of $10,000
  assert.equal(res.breakdown.hmfFee, 12.50);       // 0.125% of $10,000
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
  assert.equal(lowFormal.breakdown.hmfFee, 0); // Air freight = $0 HMF

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
    quantity: 100, // $1,000
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
    quantity: 200, // $10,000
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
    quantity: 200, // $1,000 -> still formal entry due to trade remedies!
  });
  assert.equal(res.entryType, 'formal');
  assert.equal(res.breakdown.sec301Duty, 250);
  assert.equal(res.breakdown.sec232Duty, 250);
  assert.equal(res.breakdown.mpfFee, CBP_RULES.mpfFormalMin);
});

test('Batch CSV analyzer enforces 5-SKU free preview vs unlimited Pro export', () => {
  const rows = [
    'SKU,Product,Origin,HTS,Unit Cost,Qty,Freight,Mode,Retail Price,USMCA',
    'S1,Tee 1,CN,6109.10.00,$6.50,100,100,ocean,$24.00,no',
    'S2,Tee 2,VN,6109.10.00,7.00,100,100,ocean,24.00,no',
    'S3,Mug,CN,6912.00.44,3.00,200,150,ocean,16.00,no',
    'S4,Cable,CN,8544.42.90,2.00,500,120,air,12.00,no',
    'S5,Serum,KR,3304.99.50,5.00,200,90,air,32.00,no',
    'S6,Bag,MX,4202.21.90,25.00,100,200,truck,110.00,yes',
  ].join('\n');

  const freeRes = analyzeBatchCsv(rows, { isPro: false });
  assert.equal(freeRes.totalSkus, 6);
  assert.equal(freeRes.visibleSkus, 5);
  assert.equal(freeRes.truncatedCount, 1);
  assert.equal(freeRes.exportBlocked, true);
  assert.equal(freeRes.exportCsv, null);

  const proRes = analyzeBatchCsv(rows, { isPro: true });
  assert.equal(proRes.totalSkus, 6);
  assert.equal(proRes.visibleSkus, 6);
  assert.equal(proRes.truncatedCount, 0);
  assert.equal(proRes.exportBlocked, false);
  assert.ok(proRes.exportCsv.includes('S6,Bag,MX'));
  assert.ok(proRes.runbookMd.includes('# US Import Duty & DDP Pricing Runbook'));
});

test('Batch CSV analyzer blocks export when a row has invalid country or cost', () => {
  const badCsv = [
    'SKU,Product,Origin,HTS,Unit Cost,Qty',
    'OK-1,Good Item,CN,6109.10.00,10,100',
    'BAD-2,Broken Item,MARS,6109.10.00,10,100',
  ].join('\n');

  const res = analyzeBatchCsv(badCsv, { isPro: true });
  assert.equal(res.errors.length, 1);
  assert.equal(res.exportBlocked, true);
  assert.equal(res.exportCsv, null);
});
