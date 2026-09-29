'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const childProcess = require('child_process');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'tseOptionZharfa.js');
const source = fs.readFileSync(sourcePath, 'utf8');
childProcess.execFileSync(process.execPath, ['--check', sourcePath], { stdio: 'inherit' });

const checks = [];
function test(name, run) { run(); checks.push(name); }

test('src build is deterministic and byte-identical to the TSETMC artifact', function () {
  childProcess.execFileSync(process.execPath, [path.join(root, 'scripts', 'build.js'), '--check'], { cwd: root, stdio: 'pipe' });
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src', 'manifest.json'), 'utf8'));
  assert.strictEqual(manifest.format, 'classic-script-fragments-v1');
  assert.strictEqual(manifest.order.length, 10);
  assert.strictEqual((source.match(/addToPool\(/g) || []).length, 2, 'the low-level inserter is private behind one guarded production writer');
});

test('product identity, original attribution, and fork license remain present', function () {
  assert.match(source, /tseOptionZharfa-v0\.0\.1/);
  assert.match(source, /tseOptionAbyss -v0\.0\.1/);
  assert.match(source, /https:\/\/t\.me\/p75ad/);
  assert.match(source, /https:\/\/t\.me\/SmartOptionTSE/);
  assert.match(source, /Smart-FFA-1\.0/);
});

test('TSETMC query separators are assembled with String.fromCharCode(38)', function () {
  assert.match(source, /String\.fromCharCode\(38\)/);
  assert.match(source, /insCode\+AMP\+'c=34'/);
  assert.doesNotMatch(source, /\?i=[^'"\n]*&c=34/);
  assert.doesNotMatch(source, /&(?:amp|lt|gt|quot|#\d+|#x[\da-f]+);/i);
});

// Load the IIFE without running its browser startup; expose internals only to this test VM.
const startupMarker = "if(typeof document!=='undefined' && document.readyState==='loading'){";
const startupIndex = source.lastIndexOf(startupMarker);
assert(startupIndex > 0, 'startup marker not found');
const testSource = source.slice(0, startupIndex) + `
  globalThis.__zharfaTest = {
    CONFIG: CONFIG, LAYERS: LAYERS, FILTERS: FILTERS,
    makeCtx: makeCtx, optSet: optSet, optGet: optGet,
    runPipeline: runPipeline, resetPipeline: resetPipeline, runUnitTests: runUnitTests,
    calendar: TSE_CALENDAR, dates: {toJdn:normalizeToJdn, jalaliToJdn:jalaliToJdn, fromJdn:jdnToJalali, todayJdn:todayJdn},
    getPricingTime: getPricingTime, annualizeTseReturns: annualizeTseReturns, bsGreeks: bsGreeks,
    readTsetmcHistoryRow: readTsetmcHistoryRow, parseTsetmcLiveQuote: parseTsetmcLiveQuote, describeTrend: describeMarketTrend,
    updatePoolStats: updatePoolStats, migrateLegacyPoolDayOrdinals: migrateLegacyPoolDayOrdinals, requestPoolUpdate: requestPoolUpdate, writePoolObservation: writePoolObservation, savePool: savePool,
    getPool: function(){return poolStore;}, getIvHist: function(){return ivHist;}, getPoolIvRank: getPoolIvRank, addToPool: addToPool
  };
})();
`;
function makeSandbox(localStorage) {
  const sandbox = {
  console: { log() {}, warn() {}, error() {}, info() {}, table() {}, assert() {} },
  Date, Math, Intl, JSON, String, Object, Array, RegExp, Error, Number, isNaN,
  setTimeout, clearTimeout,
  requestAnimationFrame() { return 1; },
  cancelAnimationFrame() {},
  performance: { now: () => Date.now() },
  location: { origin: 'https://www.tsetmc.com', search: '' }
  };
  if (localStorage) sandbox.localStorage = localStorage;
  vm.runInNewContext(testSource, sandbox, { filename: 'tseOptionZharfa.js' });
  return sandbox;
}
const sandbox = makeSandbox();
const engine = sandbox.__zharfaTest;

test('eight registered layers retain order and filter functions', function () {
  assert.strictEqual(engine.LAYERS.length, 8);
  assert.deepStrictEqual(Array.from(engine.LAYERS, layer => layer.order), [1, 2, 3, 4, 5, 6, 7, 8]);
  engine.LAYERS.forEach(layer => assert.strictEqual(typeof layer.filter, 'function'));
});

test('user configuration overrides are reflected in per-run context', function () {
  engine.optSet('maxSpread', 8);
  engine.optSet('scoreMin', 44);
  const context = engine.makeCtx();
  assert.strictEqual(context.cfg.maxSpread, 8);
  assert.strictEqual(context.cfg.scoreMin, 44);
  engine.optSet('maxSpread', engine.CONFIG.maxSpread);
  engine.optSet('scoreMin', engine.CONFIG.scoreMin);
});

test('upstream filter regression tests all pass in a TSETMC-like origin', function () {
  const result = engine.runUnitTests();
  assert.strictEqual(result.failed, 0);
  assert.ok(result.passed >= 11);
});

test('financial and threshold defaults remain unchanged from the full source', function () {
  assert.strictEqual(engine.CONFIG.view, 0.4);
  assert.strictEqual(engine.CONFIG.maxSpread, 15);
  assert.strictEqual(engine.CONFIG.minExpRet, 40);
  assert.strictEqual(engine.CONFIG.scoreMin, 35);
  assert.strictEqual(engine.CONFIG.poolDays, 90);
  assert.strictEqual(engine.CONFIG.modelTimeBasis, 'legacy-hold');
  assert.strictEqual(engine.CONFIG.volatilityAnnualizationMode, 'legacy252');
  assert.deepStrictEqual(Array.from(engine.CONFIG.sessionDays), [0, 1, 2, 3, 4]);
});

test('empty input returns zero results without creating symbols', function () {
  const result = engine.runPipeline([]);
  assert.strictEqual(result.total, 0);
  assert.strictEqual(result.pass.length, 0);
  assert.strictEqual(result.simulation, false);
  assert.strictEqual(result.dataWarnings.length, 0);
});

test('full browser-style startup exposes the standalone API without a TSETMC panel', function () {
  const browser = {
    console: { log() {}, warn() {}, error() {}, info() {}, table() {}, assert() {} },
    document: { readyState: 'complete', getElementById() { return null; }, addEventListener() {} },
    location: { origin: 'https://preview.example', search: '' },
    requestAnimationFrame() { return 1; }, cancelAnimationFrame() {}, setTimeout, clearTimeout
  };
  browser.window = browser;
  const confirmationMessages = [];
  browser.confirm = function (message) { confirmationMessages.push(String(message)); return true; };
  browser.__ZharfaStandalone = true;
  vm.runInNewContext(source, browser, { filename: 'tseOptionZharfa.browser-smoke.js' });
  assert.strictEqual(browser.__exf.version, 'tseOptionZharfa-v0.0.1');
  assert.strictEqual(browser.__exf.layers.length, 8);
  assert.strictEqual(browser.__exf.adapterContract.version, 1);
  assert.strictEqual(browser.__exf.registerTsetmcAdapter({ version: 1, parseLiveQuote() {}, parseHistoryRow() {} }), true);
  assert.strictEqual(browser.__exf.registerTsetmcAdapter({ version: 2, parseLiveQuote() {}, parseHistoryRow() {} }), false);
  const oldThreshold = browser.__exf.optGet('minExpRet');
  assert.strictEqual(browser.__exf.optSet('minExpRet', oldThreshold + 1), true);
  assert.ok(confirmationMessages.some(message => /minExpRet: 40 → 41/.test(message)));
  browser.confirm = function () { return false; };
  assert.strictEqual(browser.__exf.optSet('minExpRet', 55), false, 'cancelled public config change is rejected');
  assert.strictEqual(browser.__exf.optGet('minExpRet'), oldThreshold + 1);
  browser.confirm = function () { return true; };
  assert.strictEqual(browser.__exf.optSet('minExpRet', oldThreshold), true);
  assert.strictEqual(browser.__exf.getTrend().status, 'unknown');
  const publicPool = browser.__exf.getPool(); publicPool.MUTATION = { history: [] };
  assert.strictEqual(browser.__exf.getPool().MUTATION, undefined, 'public pool API is a defensive copy');
  assert.strictEqual(browser.__exf.run([]).total, 0);
});

test('synthetic quote/base fallbacks are disclosed on the candidate', function () {
  const ctx = engine.makeCtx();
  const row = { l18: 'TEST-ONLY', l30: 'ضTEST1000', pl: 100, base: 'unknown-test-base' };
  const result = engine.LAYERS[3].filter(ctx, row);
  assert.strictEqual(result.ok, true);
  assert.ok(Array.isArray(row._dataWarnings));
  assert.ok(row._dataWarnings.some(message => message.indexOf('مظنه') >= 0));
  assert.strictEqual(row._quoteSource, 'last-price±2%-fallback');
  assert.ok(row._dataWarnings.some(message => message.indexOf('قیمت پایه') >= 0));
});

test('random demonstration is explicitly labeled and cannot auto-run in standalone mode', function () {
  assert.match(source, /window\.__ZharfaStandalone===true/);
  assert.match(source, /window\.confirm\('این اجرا فقط شبیه‌سازی/);
  assert.match(source, /SIMULATION ONLY/);
  assert.match(source, /اجرای شبیه‌سازی/);
  const mockBody = source.slice(source.indexOf('function scanMock(){'), source.indexOf('// ─── STARTUP', source.indexOf('function scanMock(){')));
  assert.doesNotMatch(mockBody, /addToPool|savePool|pruneOldPool/);
});

test('internal unit test restores the previous user baseInsCodes setting', function () {
  assert.match(source, /var originalBaseInsCodes=optGet\('baseInsCodes'\)/);
  assert.match(source, /optSet\('baseInsCodes', originalBaseInsCodes\)/);
});

test('standalone interface imports user JSON and has no bundled mock market rows', function () {
  const html = fs.readFileSync(path.join(root, 'web', 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'web', 'app.js'), 'utf8');
  assert.match(html, /window\.__ZharfaStandalone=true/);
  assert.match(html, /type="file" accept="application\/json/);
  assert.match(html, /marketCalendarCompleteYears/);
  assert.match(html, /scenario-list/);
  assert.match(html, /profile-summary/);
  assert.match(html, /trend-status/);
  assert.match(app, /thetaDecay/);
  assert.match(app, /api\.setConfigBatch\(changes/);
  assert.match(source, /formatConfigDiffValue\(change\.oldValue\).*→/);
  assert.match(html, /هشت لایه/);
  assert.match(html, /DOMContentLoaded', loadApp/);
  assert.match(app, /JSON\.parse\(text\)/);
  assert.match(app, /api\.run\(safeCopy, \{ source: 'user-input' \}\)/);
  assert.doesNotMatch(app, /Math\.random\(/);
  assert.doesNotMatch(source, /pipelineData\['L1-validation'\]\)\.input \|\| 100/);
});


test('JDN conversion round-trips known Gregorian and Jalali reference dates', function () {
  assert.strictEqual(engine.dates.toJdn('2000-01-01'), 2451545);
  assert.strictEqual(engine.dates.toJdn('1399/01/01'), 2458929);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(engine.dates.fromJdn(2458929))), { jy: 1399, jm: 1, jd: 1 });
  assert.strictEqual(engine.dates.toJdn(1), 2440589, 'legacy Unix-day ordinal should map at the date boundary');
  assert.strictEqual(engine.calendar.getDayOfWeek(2451545), 0, 'reference Saturday maps to zero');
  assert.strictEqual(engine.calendar.getDayOfWeek(2451551), 6, 'reference Friday maps to six');
});

test('TSE weekday and holiday model stays incomplete unless explicitly covered', function () {
  const date = engine.dates.toJdn('1405/01/01');
  engine.optSet('marketHolidays', ['1405/01/01']);
  engine.optSet('marketCalendarCompleteYears', []);
  assert.strictEqual(engine.calendar.isTradingDay(date), false);
  assert.strictEqual(engine.calendar.isCompleteForRange(date, date + 30), false);
  engine.optSet('marketCalendarCompleteYears', ['1405']);
  assert.strictEqual(engine.calendar.isCompleteForRange(date, date + 30), true);
  const annual = engine.calendar.getAnnualTradingDays(1405);
  assert.strictEqual(annual.complete, true);
  assert.ok(annual.days > 200 && annual.days < 270);
  engine.optSet('marketHolidays', engine.CONFIG.marketHolidays);
  engine.optSet('marketCalendarCompleteYears', engine.CONFIG.marketCalendarCompleteYears);
});

test('legacy model time remains unchanged; experimental time bases require valid expiry/calendar', function () {
  const ctx = engine.makeCtx();
  const expiry = ctx.todayJdn + 20;
  assert.strictEqual(engine.getPricingTime(ctx, null).T, (ctx.cfg.holdDays || 5) / 365);
  ctx.cfg.modelTimeBasis = 'calendar-expiry';
  assert.strictEqual(engine.getPricingTime(ctx, expiry).T, 20 / 365);
  ctx.cfg.modelTimeBasis = 'tse-trading';
  engine.optSet('marketCalendarCompleteYears', [String(engine.dates.fromJdn(ctx.todayJdn).jy)]);
  assert.strictEqual(engine.getPricingTime(ctx, expiry).ok, true);
  engine.optSet('marketCalendarCompleteYears', []);
  assert.strictEqual(engine.getPricingTime(ctx, expiry).reason, 'calendar-incomplete');
});

test('versioned adapter fixtures validate identity, meaning, explicit date/time, and freshness', function () {
  const liveFixture = JSON.parse(fs.readFileSync(path.join(root, 'fixtures', 'tsetmc-live-quote.v1.json'), 'utf8'));
  const historyFixture = JSON.parse(fs.readFileSync(path.join(root, 'fixtures', 'tsetmc-history-row.v1.json'), 'utf8'));
  const now = Date.parse(liveFixture.timestamp);
  const quote = engine.parseTsetmcLiveQuote(liveFixture, liveFixture.instrumentId, now);
  assert.strictEqual(quote.ok, true);
  assert.strictEqual(quote.price, liveFixture.lastPrice);
  assert.strictEqual(engine.parseTsetmcLiveQuote(liveFixture, 'wrong-instrument', now).reason, 'instrument-mismatch');
  assert.strictEqual(engine.parseTsetmcLiveQuote({ adapterVersion: 1, instrumentId: 'BASE-1', lastPrice: 100 }, 'BASE-1', now).reason, 'timestamp-required');
  assert.strictEqual(engine.parseTsetmcLiveQuote({ insCode: 'BASE-1', pClosing: 100, timestamp: now }, 'BASE-1', now).reason, 'adapter-contract-required');
  assert.strictEqual(engine.parseTsetmcLiveQuote(liveFixture, liveFixture.instrumentId, now + 600000).reason, 'stale-quote');
  const row = engine.readTsetmcHistoryRow(historyFixture, historyFixture.instrumentId);
  assert.ok(row);
  assert.strictEqual(row.jdn, engine.dates.toJdn(historyFixture.date));
  assert.strictEqual(row.price, historyFixture.closePrice);
  assert.strictEqual(row.tvol, historyFixture.volume);
  assert.strictEqual(engine.readTsetmcHistoryRow(historyFixture, 'OTHER'), null);
  assert.strictEqual(engine.readTsetmcHistoryRow([1, 2, 12345], historyFixture.instrumentId), null);
  assert.strictEqual(engine.readTsetmcHistoryRow({ date: historyFixture.date, closePrice: 12345, instrumentId: historyFixture.instrumentId }, historyFixture.instrumentId), null);
});

test('descriptive trend is unknown without fresh series and never creates a financial score', function () {
  assert.strictEqual(engine.describeTrend(null).status, 'unknown');
  const now = Date.now();
  const trend = engine.describeTrend({ schemaVersion: 1, indices: [
    { name: 'broad', observations: [{ value: 100, timestamp: now - 60000 }, { value: 101, timestamp: now }] },
    { name: 'equal', observations: [{ value: 100, timestamp: now - 60000 }, { value: 100.5, timestamp: now }] }
  ] }, now);
  assert.strictEqual(trend.status, 'up');
  assert.strictEqual(trend.financialScore, null);
  assert.strictEqual(trend.filterImpact, 'none');
});

test('legacy pool ordinal migration is one-time and leaves provenance unverified', function () {
  const pool = { A: { history: [{ jdn: 1000, price: 12 }, { jdn: 1001, price: 13 }], stats: { firstJdn: 1000, lastJdn: 1001 } } };
  const iv = { A: [{ jdn: 1000, iv: 0.3 }] };
  assert.strictEqual(engine.migrateLegacyPoolDayOrdinals(pool, iv), true);
  assert.strictEqual(pool.A.history[0].jdn, 2441588);
  assert.strictEqual(iv.A[0].jdn, 2441588);
  assert.strictEqual(pool.A.history[0].source, undefined);
  assert.strictEqual(engine.migrateLegacyPoolDayOrdinals(pool, iv), false);
});

test('holding L8 is advisory-only, emits scenarios with assumptions, and passes missing-data rows', function () {
  engine.optSet('holdScenarioDays', [2, 4]);
  engine.optSet('underlyingScenarioShocks', [-0.05, 0, 0.05]);
  const ctx = engine.makeCtx();
  const row = { _S: 1000, _K: 1000, _T: 0.1, _r: 0.2, _q: 0, _iv: 0.3, _isCall: true, _mid: 100, _expiryJdn: ctx.todayJdn + 30, _dteCalendar: 30, _basePriceSource: 'observed-live', _expirySource: 'input' };
  const result = engine.LAYERS[7].filter(ctx, row);
  assert.strictEqual(result.ok, true);
  assert.strictEqual(row._holdingAdvisory.status, 'advisory');
  assert.strictEqual(row._holdingAdvisory.scenarios.length, 6);
  assert.strictEqual(row._holdingAdvisory.assumptions.notRecommendation, true);
  assert.strictEqual(row._holdingAdvisory.dte.tradingDays, null, 'trading DTE stays unknown without complete calendar');
  assert.strictEqual(row._holdingAdvisory.calendarStatus.status, 'incomplete');
  assert.strictEqual(row._holdingAdvisory.thetaDecay.length, 2, 'theoretical theta curve uses configured holding horizons');
  assert.strictEqual(row._holdingAdvisory.assumptions.thetaDecay.indexOf('برآورد نظری') >= 0, true);
  const jalaliYear = engine.dates.fromJdn(ctx.todayJdn).jy;
  engine.optSet('marketCalendarCompleteYears', [String(jalaliYear)]);
  const completeCalendarRow = Object.assign({}, row, { _holdingAdvisory: undefined });
  assert.strictEqual(engine.LAYERS[7].filter(ctx, completeCalendarRow).ok, true);
  assert.strictEqual(completeCalendarRow._holdingAdvisory.calendarStatus.status, 'complete');
  assert.ok(Number.isInteger(completeCalendarRow._holdingAdvisory.dte.tradingDays));
  engine.optSet('marketCalendarCompleteYears', engine.CONFIG.marketCalendarCompleteYears);
  const missing = {};
  assert.strictEqual(engine.LAYERS[7].filter(ctx, missing).ok, true);
  assert.strictEqual(missing._holdingAdvisory.status, 'insufficient-data');
  assert.strictEqual(missing._holdingAdvisory.scenarios.length, 0);
  const estimatedQuote = Object.assign({}, row, { _quoteSource: 'last-price±2%-fallback' });
  assert.strictEqual(engine.LAYERS[7].filter(ctx, estimatedQuote).ok, true);
  assert.strictEqual(estimatedQuote._holdingAdvisory.status, 'insufficient-data');
  assert.strictEqual(estimatedQuote._holdingAdvisory.scenarios.length, 0);
  engine.optSet('holdScenarioDays', engine.CONFIG.holdScenarioDays);
  engine.optSet('underlyingScenarioShocks', engine.CONFIG.underlyingScenarioShocks);
});

test('TSE annualized volatility does not fall back to guessed dispersion', function () {
  const now = engine.dates.todayJdn();
  const jy = engine.dates.fromJdn(now).jy;
  engine.optSet('marketCalendarCompleteYears', [String(jy)]);
  engine.optSet('volatilityAnnualizationMode', 'tse-calendar');
  const points = [];
  var pointDate = now - 12;
  for (var pointIndex = 0; pointIndex < 4; pointIndex++) { pointDate = engine.calendar.nextTradingDay(pointDate); points.push({ jdn: pointDate, price: 100 + pointIndex * 3, source: 'tsetmc-history' }); }
  const result = engine.annualizeTseReturns(points);
  assert.strictEqual(result.ok, true);
  assert.ok(result.volatility > 0);
  engine.optSet('marketCalendarCompleteYears', []);
  assert.strictEqual(engine.annualizeTseReturns(points).reason, 'calendar-incomplete');
  engine.optSet('volatilityAnnualizationMode', engine.CONFIG.volatilityAnnualizationMode);
});

test('legacy pool prices, fake volume, volatility, and IV rank are excluded without source provenance', function () {
  const symbol = '__UNVERIFIED_LEGACY__';
  const today = engine.dates.todayJdn();
  const pool = engine.getPool();
  pool[symbol] = { history: [0, 1, 2, 3].map(function (offset) { return { jdn: today - offset, price: 100 + offset, tno: 10, tvol: 10000 }; }), stats: { volatility: 99, avgTno: 99, avgTvol: 99999 } };
  engine.updatePoolStats(symbol);
  assert.strictEqual(pool[symbol].stats.lastPrice, 0);
  assert.strictEqual(pool[symbol].stats.avgPrice, 0);
  assert.strictEqual(pool[symbol].stats.volatility, 0);
  assert.strictEqual(pool[symbol].stats.avgTno, 0);
  assert.strictEqual(pool[symbol].stats.avgTvol, 0);
  engine.getIvHist()[symbol] = [0, 1, 2, 3, 4].map(function (offset) { return { jdn: today - offset, iv: 0.5 }; });
  assert.strictEqual(engine.getPoolIvRank(symbol, 0.2), 50);
  delete pool[symbol]; delete engine.getIvHist()[symbol];
});

test('manual pool update does not inject configured/model values without a dated live observation', function () {
  const before = Object.keys(engine.getPool());
  assert.strictEqual(engine.requestPoolUpdate('__NO_REAL_HISTORY__', { showAlert: false }), 0);
  assert.strictEqual(engine.getPool().__NO_REAL_HISTORY__, undefined);
  assert.deepStrictEqual(Object.keys(engine.getPool()).sort(), before.sort());
});

test('TSE annualization reports insufficient observations instead of legacy dispersion', function () {
  const symbol = '__SHORT_TSE_HISTORY__';
  engine.optSet('volatilityAnnualizationMode', 'tse-calendar');
  engine.addToPool(symbol, { price: 123, jdn: engine.dates.todayJdn(), source: 'live-tsetmc' });
  assert.strictEqual(engine.getPool()[symbol].stats.volatility, 0);
  assert.strictEqual(engine.getPool()[symbol].stats.volatilityWarning, 'not-enough-returns');
  delete engine.getPool()[symbol];
  engine.optSet('volatilityAnnualizationMode', engine.CONFIG.volatilityAnnualizationMode);
});

test('theta uses its supplied day basis without changing price sensitivities', function () {
  const a = engine.bsGreeks(100, 100, 0.2, 0.1, 0, 0.3, true, 252);
  const b = engine.bsGreeks(100, 100, 0.2, 0.1, 0, 0.3, true, 365);
  assert.notStrictEqual(a.theta, b.theta);
  assert.strictEqual(a.delta, b.delta);
  assert.strictEqual(a.vega, b.vega);
});


test('all production pool writes pass the single guard and automatic mode is opt-in/rate limited', function () {
  const store = new Map();
  const localStorage = { getItem(key) { return store.has(key) ? store.get(key) : null; }, setItem(key, value) { store.set(key, String(value)); } };
  const guarded = makeSandbox(localStorage).__zharfaTest;
  const today = guarded.dates.todayJdn();
  guarded.optSet('baseInsCodes', { GUARD: 'G-1', MANUAL: 'M-1' });
  const row = { jdn: today, price: 123, source: 'live-tsetmc', instrumentId: 'G-1', adapterVersion: 1, timestamp: Date.now() };
  assert.strictEqual(guarded.writePoolObservation('GUARD', row, 'automatic'), false, 'auto update defaults off');
  assert.strictEqual(guarded.writePoolObservation('GUARD', { ...row, source: 'unverified' }, 'manual'), false);
  assert.strictEqual(guarded.writePoolObservation('GUARD', { ...row, jdn: today + 1 }, 'manual'), false);
  assert.strictEqual(guarded.writePoolObservation('GUARD', { ...row, timestamp: Date.now() - 600000 }, 'manual'), false, 'stale live quote rejected');
  guarded.optSet('poolAutoUpdate', true);
  assert.strictEqual(guarded.writePoolObservation('GUARD', row, 'automatic'), true);
  assert.strictEqual(guarded.writePoolObservation('GUARD', row, 'automatic'), false, 'one automatic write per instrument/day');
  assert.strictEqual(guarded.getPool().GUARD.history.length, 1);
  assert.strictEqual(guarded.writePoolObservation('MANUAL', { ...row, instrumentId: 'M-1' }, 'manual'), true, 'explicit manual write is permitted');
});

test('versioned legacy pool/IV migration retains backups and saves one atomic bundle', function () {
  const currentOrdinal = engine.dates.todayJdn() - 2440588;
  const legacyPool = JSON.stringify({ A: { history: [{ jdn: currentOrdinal - 3, price: 12 }, { jdn: currentOrdinal - 2, price: 13 }] } });
  const legacyIv = JSON.stringify({ A: [{ jdn: currentOrdinal - 3, iv: 0.3 }] });
  const values = new Map([['__exfPoolV1', legacyPool], ['__exfIvHistV1', legacyIv]]);
  const storage = { getItem(key) { return values.has(key) ? values.get(key) : null; }, setItem(key, value) { values.set(key, String(value)); } };
  const migrated = makeSandbox(storage).__zharfaTest;
  const envelope = JSON.parse(values.get('__exfStoreV2'));
  assert.strictEqual(envelope.schemaVersion, 2);
  assert.strictEqual(envelope.kind, 'pool-bundle');
  assert.strictEqual(envelope.data.pool.A.history[0].jdn, engine.dates.todayJdn() - 3);
  assert.strictEqual(envelope.data.pool.A.history[0].source, 'unverified');
  assert.strictEqual(values.get('__exfPoolV1'), legacyPool);
  assert.strictEqual(values.get('__exfPoolV1_backup_v2'), legacyPool);
  assert.strictEqual(values.get('__exfIvHistV1_backup_v2'), legacyIv);
  assert.strictEqual(migrated.getIvHist().A[0].source, 'unverified');
});

test('unsupported future storage schema is never overwritten by a fallback migration', function () {
  const future = JSON.stringify({ schemaVersion: 99, kind: 'pool-bundle', data: { pool: { FUTURE: { history: [] } }, ivHistory: {} } });
  const values = new Map([['__exfStoreV2', future], ['__exfPoolV1', JSON.stringify({ OLD: { history: [{ jdn: 1, price: 10 }] } })]]);
  const storage = { getItem(key) { return values.has(key) ? values.get(key) : null; }, setItem(key, value) { values.set(key, String(value)); } };
  makeSandbox(storage);
  assert.strictEqual(values.get('__exfStoreV2'), future);
});

test('quota failure cannot partially overwrite or prune the previous atomic pool snapshot', function () {
  const oldEnvelope = JSON.stringify({ schemaVersion: 2, kind: 'pool-bundle', data: { pool: {}, ivHistory: {} } });
  const values = new Map([['__exfStoreV2', oldEnvelope]]);
  const storage = { getItem(key) { return values.has(key) ? values.get(key) : null; }, setItem(key, value) { if (key === '__exfStoreV2') throw new Error('quota'); values.set(key, String(value)); } };
  const guarded = makeSandbox(storage).__zharfaTest;
  guarded.optSet('baseInsCodes', { 'QUOTA-TEST': 'Q-1' });
  assert.strictEqual(guarded.writePoolObservation('QUOTA-TEST', { jdn: guarded.dates.todayJdn(), price: 100, source: 'live-tsetmc', instrumentId: 'Q-1', adapterVersion: 1, timestamp: Date.now() }, 'manual'), true);
  assert.strictEqual(guarded.savePool(), false);
  assert.strictEqual(values.get('__exfStoreV2'), oldEnvelope);
  assert.ok(guarded.getPool()['QUOTA-TEST'], 'failed persistence retains in-memory observations');
});

console.log('OK — ' + checks.length + ' checks passed');
checks.forEach((name, index) => console.log((index + 1) + '. ' + name));
