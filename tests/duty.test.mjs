import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MPF_SCHEDULES,
  allocateCentsProRata,
  analyzeBatchCsv,
  calculateShipment,
  getCbpSchedule,
  normalizeCountry,
  normalizeShippingMode,
} from '../src/duty_engine.mjs';

test('Entry-date versioning selects FY2026 vs FY2027 official CBP MPF schedule at Oct 1, 2026 boundary', () => {
  const fy26 = getCbpSchedule('2026-09-30');
  assert.equal(fy26.fiscalYear, 'FY2026');
  assert.equal(fy26.mpfFormalMin, 32.71);
  assert.equal(fy26.mpfFormalMax, 634.62);
  assert.equal(fy26.mpfInformalFee, 2.62);

  const fy27 = getCbpSchedule('2026-10-01');
  assert.equal(fy27.fiscalYear, 'FY2027');
  assert.equal(fy27.mpfFormalMin, 34.58);
  assert.equal(fy27.mpfFormalMax, 670.86);
  assert.equal(fy27.mpfInformalFee, 2.77);

  assert.throws(() => getCbpSchedule('2026-02-30'));
  assert.throws(() => getCbpSchedule('2026-13-01'));
});

test('China ocean formal shipment stacks MFN + Section 301 + FY2027 MPF + HMF accurately', () => {
  const res = calculateShipment({
    entryDate: '2026-11-25',
    presetId: 'cotton-tee',
    origin: 'CN',
    shippingMode: 'ocean',
    unitCost: 10,
    quantity: 1000,       // $10,000 customs value -> raw MPF $34.64 > $34.58 FY2027 floor
    freight: 800,
    insurance: 50,
    brokerFee: 150,
    extraTariffRate: 10,
    targetMarginPct: 60,
    currentRetailPrice: 25,
  });

  assert.equal(res.fiscalYear, 'FY2027');
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

test('CBP MPF respects FY2027 floor ($34.58), cap ($670.86), and informal ($2.77), plus FY2026 historical boundary', () => {
  const lowFy27 = calculateShipment({
    entryDate: '2026-10-01',
    presetId: 'cotton-tee',
    origin: 'VN',
    shippingMode: 'air',
    unitCost: 30,
    quantity: 100, // $3,000 -> clamped to $34.58
  });
  assert.equal(lowFy27.breakdown.mpfFee, MPF_SCHEDULES.FY2027.mpfFormalMin);
  assert.equal(lowFy27.breakdown.hmfFee, 0);

  const highFy27 = calculateShipment({
    entryDate: '2026-10-01',
    presetId: 'cotton-tee',
    origin: 'VN',
    shippingMode: 'ocean',
    unitCost: 100,
    quantity: 3000, // $300,000 -> clamped to $670.86
  });
  assert.equal(highFy27.breakdown.mpfFee, MPF_SCHEDULES.FY2027.mpfFormalMax);

  const infFy27 = calculateShipment({
    entryDate: '2026-10-01',
    presetId: 'skincare',
    origin: 'KR',
    shippingMode: 'courier',
    unitCost: 10,
    quantity: 100,
  });
  assert.equal(infFy27.entryType, 'informal');
  assert.equal(infFy27.breakdown.mpfFee, MPF_SCHEDULES.FY2027.mpfInformalFee);

  const lowFy26 = calculateShipment({
    entryDate: '2026-09-30',
    presetId: 'cotton-tee',
    origin: 'VN',
    shippingMode: 'air',
    unitCost: 30,
    quantity: 100,
  });
  assert.equal(lowFy26.breakdown.mpfFee, MPF_SCHEDULES.FY2026.mpfFormalMin);
});

test('Hong Kong origin is preserved independently and NOT assessed China Section 301 (Codex High finding)', () => {
  assert.equal(normalizeCountry('HK'), 'HK');
  assert.equal(normalizeCountry('Hong Kong'), 'HK');

  const hkCables = calculateShipment({
    entryDate: '2026-11-25',
    presetId: 'usb-cables', // 2.6% MFN, 25% China Sec 301
    origin: 'HK',
    shippingMode: 'air',
    unitCost: 10,
    quantity: 100, // $1,000
  });
  assert.equal(hkCables.origin, 'HK');
  assert.equal(hkCables.rates.sec301, 0);
  assert.equal(hkCables.breakdown.sec301Duty, 0);
  assert.equal(hkCables.breakdown.mfnDuty, 26);
  assert.equal(hkCables.entryType, 'informal');
  assert.equal(hkCables.breakdown.mpfFee, 2.77);

  const cnCables = calculateShipment({
    entryDate: '2026-11-25',
    presetId: 'usb-cables',
    origin: 'CN',
    shippingMode: 'air',
    unitCost: 10,
    quantity: 100,
  });
  assert.equal(cnCables.breakdown.sec301Duty, 250);
  assert.equal(cnCables.entryType, 'formal');
});

test('Unknown HTS or unconfirmed 6-digit prefix fallback blocks export without manual MFN rate (Codex High finding)', () => {
  // Unrecognized HTS with no manual rate must fail
  const unknownCsv = 'SKU,Product,Origin,HTS,Unit Cost,Qty\nVN-1,Mystery Widget,VN,9999.88.77,10,100\n';
  const rUnknown = analyzeBatchCsv(unknownCsv, { isPro: true });
  assert.equal(rUnknown.errors.length, 1);
  assert.equal(rUnknown.exportBlocked, true);
  assert.equal(rUnknown.exportCsv, null);

  // Supplying explicit Base Rate allows export cleanly
  const manualCsv = 'SKU,Product,Origin,HTS,Unit Cost,Qty,Base Rate\nVN-1,Mystery Widget,VN,9999.88.77,10,100,4.5%\n';
  const rManual = analyzeBatchCsv(manualCsv, { isPro: true });
  assert.equal(rManual.errors.length, 0);
  assert.equal(rManual.exportBlocked, false);
  assert.equal(rManual.rows[0].breakdown.mfnDuty, 45);

  // 6-digit prefix-only match (6109.10.99 != 6109.10.00) must block unless explicitly confirmed or manual rate given
  const prefixCsv = 'SKU,Product,Origin,HTS,Unit Cost,Qty\nVN-2,Other Tee,VN,6109.10.99,10,100\n';
  const rPrefix = analyzeBatchCsv(prefixCsv, { isPro: true });
  assert.equal(rPrefix.errors.length, 1);
  assert.match(rPrefix.errors[0].message, /6-digit heading/);
  assert.equal(rPrefix.exportBlocked, true);
});

test('400-SKU consolidated entry allocates integer cents non-negatively and reconciles exactly (Codex Medium finding)', () => {
  const header = 'SKU,Product,Origin,HTS,Unit Cost,Qty,Mode';
  const lines = [header];
  for (let i = 1; i <= 400; i += 1) {
    lines.push(`SHIRT-${i},Cotton Tee ${i},VN,6109.10.00,1.00,1,air`);
  }
  // 400 x $1 = $400 non-Sec-301 consolidated entry -> informal $2.77 (277 cents across 400 equal rows!)
  const res = analyzeBatchCsv(lines.join('\n'), { isPro: true, entryBasis: 'consolidated', entryDate: '2026-11-25' });
  assert.equal(res.errors.length, 0);
  assert.equal(res.rows.length, 400);
  assert.equal(res.exportBlocked, false);
  for (const r of res.rows) {
    assert.ok(r.breakdown.mpfFee >= 0, `Negative MPF found: ${r.breakdown.mpfFee}`);
  }
  const sumMpfCents = res.rows.reduce((s, r) => s + Math.round(r.breakdown.mpfFee * 100), 0);
  assert.equal(sumMpfCents, 277);

  // Also test formal entry floor ($34.58 = 3458 cents across 400 rows of $10 = $4,000)
  const alloc = allocateCentsProRata(34.58, new Array(400).fill(10));
  assert.equal(alloc.every((v) => v >= 0), true);
  assert.equal(alloc.reduce((s, v) => s + Math.round(v * 100), 0), 3458);
});

test('USMCA preference, Sec 232 stacking, thousands commas, mode aliases, and CSV formula guard', () => {
  const usmca = calculateShipment({
    presetId: 'leather-bags', origin: 'MX', shippingMode: 'truck', unitCost: 50, quantity: 200, usmcaQualifying: true,
  });
  assert.equal(usmca.breakdown.mfnDuty, 0);
  assert.equal(usmca.breakdown.mpfFee, 0);

  const bolts = calculateShipment({
    entryDate: '2026-11-25', presetId: 'steel-bolts', origin: 'CN', shippingMode: 'ocean', unitCost: 5, quantity: 200,
  });
  assert.equal(bolts.breakdown.sec301Duty, 250);
  assert.equal(bolts.breakdown.sec232Duty, 250);
  assert.equal(bolts.breakdown.mpfFee, 34.58);

  assert.equal(normalizeShippingMode('Sea'), 'ocean');
  assert.equal(normalizeShippingMode('DHL'), 'courier');
  assert.equal(normalizeShippingMode('teleport'), '');

  const batchCsv = [
    'SKU,Product,Origin,HTS,Unit Cost,Qty,Freight,Mode,Retail Price,USMCA',
    '"=SUM(A1)","Heavy Tee",CN,6109.10.00,"$1,000.00","2",100,Sea,"$2,500.00",no',
    'S2,Bag,MX,4202.21.90,25.00,100,200,truck,110.00,yes',
  ].join('\n');
  const res = analyzeBatchCsv(batchCsv, { isPro: true, entryDate: '2026-11-25' });
  assert.equal(res.errors.length, 0);
  assert.ok(res.exportCsv.includes("'=SUM(A1)"));
  assert.equal(res.rows[0].shippingMode, 'ocean');
  assert.equal(res.rows[1].breakdown.mpfFee, 0);
});

test('Fuzz & 5k-SKU scale invariants: 200 randomized batches produce 0 NaNs, non-negative MPF, and exact FY2027 cap', () => {
  let rng = 20261126;
  const rand = () => ((rng = (rng * 1664525 + 1013904223) >>> 0) / 4294967296);
  const codes = ['CN', 'HK', 'VN', 'MX', 'CA', 'DE', 'KR', 'IN'];
  const htsList = ['6109.10.00', '8544.42.90', '9617.00.10', '7318.15.80', '3304.99.50', '4202.21.90'];
  const modes = ['ocean', 'air', 'courier', 'truck', 'Sea', 'DHL'];

  for (let c = 0; c < 200; c++) {
    const n = 1 + Math.floor(rand() * 40);
    const lines = ['SKU,Product,Origin,HTS,Unit Cost,Qty,Freight,Mode,Retail Price,USMCA'];
    for (let i = 0; i < n; i++) {
      lines.push(`S${i},Item ${i},${codes[Math.floor(rand() * codes.length)]},${htsList[Math.floor(rand() * htsList.length)]},${(0.5 + rand() * 200).toFixed(2)},${1 + Math.floor(rand() * 200)},${(rand() * 200).toFixed(2)},${modes[Math.floor(rand() * modes.length)]},${(20 + rand() * 300).toFixed(2)},${rand() < 0.25 ? 'yes' : 'no'}`);
    }
    const r = analyzeBatchCsv(lines.join('\n'), {
      isPro: true,
      entryBasis: rand() < 0.5 ? 'consolidated' : 'separate',
      entryDate: rand() < 0.5 ? '2026-11-25' : '2026-08-01',
      defaultBrokerFee: Math.round(rand() * 200),
    });
    assert.equal(r.errors.length, 0);
    for (const row of r.rows) {
      assert.ok(Number.isFinite(row.totalLandedCost) && row.totalLandedCost >= 0);
      assert.ok(Number.isFinite(row.breakdown.mpfFee) && row.breakdown.mpfFee >= 0);
    }
  }

  const bigLines = ['SKU,Product,Origin,HTS,Unit Cost,Qty,Freight,Mode,Retail Price,USMCA'];
  for (let i = 0; i < 5000; i++) {
    bigLines.push(`B-${i},Item ${i},VN,6109.10.00,10.00,10,5,ocean,35.00,no`);
  }
  const big = analyzeBatchCsv(bigLines.join('\n'), { isPro: true, entryBasis: 'consolidated', entryDate: '2026-11-25' });
  assert.equal(big.errors.length, 0);
  const totalMpfCents = big.rows.reduce((s, r) => s + Math.round(r.breakdown.mpfFee * 100), 0);
  assert.equal(totalMpfCents, 67086); // Exact FY2027 formal cap $670.86
});

