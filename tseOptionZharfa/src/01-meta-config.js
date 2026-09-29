// ─── META ─────────────────────────────────────────────────────────────────
var TSETMC_ADAPTER_CONTRACT_VERSION=1;
var VERSION_TAG = 'tseOptionZharfa-v0.0.1';
var BUILD_DATE = '2026-09-29';
var AUTHOR = 'https://t.me/p75ad';
var CONTACT = {author:'https://t.me/p75ad', group:'https://t.me/SmartOptionTSE'};
var DISCLAIMER = 'این ابزار صرفاً تحلیلی و اطلاعاتی است؛ تضمین سود نمی‌دهد و مسئولیت هر تصمیم و معامله تنها بر عهده کاربر است.';
var LICENSE = 'Smart-FFA-1.0 (Free Fork with Attribution)';
var NL = String.fromCharCode(10);
var AMP = String.fromCharCode(38);
var JDN_UNIX_EPOCH = 2440588;

// ─── CONFIG — هسته تنظیمات ────────────────────────────────────────────────
var CONFIG = {
    expiryAutoUpdate: true,
    expiryDate: '1405/07/30',
    expiry: '1405\\s*[\\/\\.\\-]\\s*0?7',
    expiryJY: 1405, expiryJM: 7, expiryJD: 30,
    view: 0.4, viewDailyPct: 1.2, holdDays: 5, erGridStep: 0.25,
    holdScenarioDays: [3,5,7,10], underlyingScenarioShocks: [-0.05,-0.02,0,0.02,0.05],
    maxHolidayGap: 3, showScenarioTable: true, minTradingDaysLeft: 0, dtePenaltyBasis: 'calendar',
    modelTimeBasis: 'legacy-hold', volatilityAnnualizationMode: 'legacy252',
    volFloor: 25, volCeil: 150, unitGuardX: 8, minPrice: 10, maxSpread: 15, maxCostRT: 12,
    maxThetaPct: 100, maxStalePricePct: 50, maxImbalanceRatio: 20,
    minDelta: 0, maxDelta: 1, moneynessMin: 0, moneynessMax: 0,
    minDaysLeft: 4, maxLeverage: 30, minLeverage: 0,
    maxTimeValuePct: 100, maxIvPremium: 10, minDteWeight: true, dtePenaltyMax: 15, dtePenaltyDaysMult: 2,
    maxPerGroup: 2, maxTotalRows: 0, c0Tiebreak: false, minExpRet: 40, coldThreshold: 3, minDepthTrades: 0.5, usePareto: true,
    computeIntervalMs: 15000, cacheTtlMs: 120000, maxCache: 600, offHoursFactor: 4, offHoursOnce: true, enforceMarketHours: false,
    perfBudgetMs: 4.0, perfWindow: 25, allowFastPath: true,
    sessionStartHour: 8, sessionStartMin: 525, sessionEndMin: 810, poolObsFromMin: 525, sessionEndHour: 13,
    sessionDays: [0,1,2,3,4], marketHolidays: [], marketCalendarCompleteYears: [], tzOffsetMin: 210,
    rankTtl: 60000, resetAfter: 600000, warmupMs: 12000, maxGroupSize: 60, rankFlushEvery: 16, rankFlushMs: 1500, rankCacheMs: 1000,
    basePrices: {'اهرم':70000,'وبملت':1300,'خودرو':480,'شستا':900,'خساپا':350,'شپنا':15000,'فملی':8500,'فولاد':7500,'شبندر':12000,'خبهمن':500,'وتجارت':700,'وبصادر':700},
    poolDays: 90, poolMaxDays: 90, poolAutoUpdate: false, poolAuto: true, poolPreGateEveryScan: true, poolMinObs: 3, poolClamp: 3,
    poolBaseSymbols: ['اهرم','وبملت','خودرو','شستا','خساپا','شپنا','فملی','فولاد','شبندر','خبهمن','وتجارت','وبصادر','ذوب','اخابر','تاصیکو'],
    contractSizes: {'خساپا':1000,'خودرو':1000,'وبملت':1000,'ذوب':1000,'اخابر':1000,'شپنا':1000,'شستا':1000,'وبصادر':1000,'تاصیکو':1000,'وتجارت':1000,'خبهمن':1000,'فملی':1371},
    poolGates: true, poolGateClamp: 2, poolMinGateObs: 20,
    dividendCalendar: {}, tsetmcCdnUrl: 'https://old.tsetmc.com', dividendAutoFetch: false, dividendFetchUrl: '', dividendMaxDays: 90,
    blockOnDividendDay: true, useLiveBase: true, baseInsCodes: {'فملی':'46348095188555032','فولاد':'18443602267221359','شستا':'13157749938547794','خودرو':'35366681030756042','اهرم':'77458905939487148'},
    liveBaseMaxAge: 300000, blockOnHalt: true, blockOnOrderQueue: true, orderQueueThreshold: 0.005,
    riskFreeCurve: [[1405,5,1,34],[1405,8,1,36],[1406,2,1,35]], riskFreeAutoFetch: false, riskFreeFetchUrl: '', riskFree: 33,
    useEwma: true, ewmaLambda: 0.94, enforceVolumeBase: false, volumeBaseRatio: 0.5, useWeightedDepth: true, depthWeights: [1.0,0.6,0.3],
    autoView: false, autoViewWeight: 0.5, positionSizing: true, capital: 100000000, riskPerTrade: 2, stopLossPct: 30, takeProfitPct: 80,
    verbose: false, debugPanel: false, logReasons: true, supportTabeii: true, tabeiiDiscount: 10, allowNewSymbols: true, newSymbolMinObs: 5,
    backtestMode: false, backtestDate: '', useScore: true, scoreMin: 35, c0Mode: 'score', wER: 35, wIVR: 25, wADX: 15, wLiq: 15, wEdge: 10,
    useIvRank: true, ivRankBuy: 40, ivRankSell: 70, ivHistDays: 90, ivAtmBand: 5, multiExpiry: true, maxPerExpiry: 0, distantDays: 45,
    useAdx: true, adxPeriod: 14, ihNewestFirst: true, useEntry: true, entryPad: 5, roundToTick: 5, usePopup: true,
    abortThreshold: 10, abortThresholdInput: 100,
    exoticEnabled: false, exoticTypes: [], barrierLevel: 0, asianWindow: 0, binaryPayout: 0, exoticMargin: 5, exoticVolMult: 1.2,
    viewMode: 'verbose' // summary | verbose — خلاصه فقط در minified
};

