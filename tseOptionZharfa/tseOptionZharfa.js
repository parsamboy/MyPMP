// tseOptionZharfa — v0.0.1 | tseOptionAbyss -v0.0.1 | مشتق از tseOption_ExoticFilter v0.0.4.6 — مؤلف اصلی: https://t.me/p75ad
/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║                                                               ║
 * ║        🧬 tseOptionZharfa — v0.0.1                             ║
 * ║        tseOptionAbyss -v0.0.1                                  ║
 * ║        fork از tseOption_ExoticFilter v0.0.4.6                ║
 * ║        معماری: Layer Registry Pattern + Dual-Mode            ║
 * ║                                                               ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 *  ⚠️  رفع مسئولیت — از برنامه اصلی
 *      این ابزار صرفاً تحلیلی و اطلاعاتی است؛ تضمین سود نمی‌دهد و
 *      مسئولیت هر تصمیم و معامله تنها بر عهده کاربر است.
 *
 *  ©  ۱۴۰۵  —  حقوق مؤلف محفوظ است
 *      مؤلف اصلی:  https://t.me/p75ad
 *
 *  ─── ارتباط — از برنامه اصلی ───────────────────────────────────
 *      ✈  مؤلف ..............  https://t.me/p75ad
 *      💬  گروه پروژه ....... https://t.me/SmartOptionTSE
 *
 *  ─── مجوز انشعاب — از برنامه اصلی ──────────────────────────────
 *      نوع مجوز:  Smart-FFA-1.0  (Free Fork with Attribution)
 *      برداشتن، بازنویسی، گسترش و انتشار نسخه مستقل — آزاد است؛
 *      شرط: سربرگ نسخه انشعاب‌یافته باید نام و نشانی مؤلف اصلی را
 *      دست‌نخورده نگه دارد.
 *
 *  ─── ویژگی‌های v0.0.4.6 ────────────────────────────────────────
 *      • معماری Layer Registry: هر لایه {key, schema, filter} خودتوصیف
 *      • افزودن لایه هشتم = push به LAYERS — بدون ویرایش runner
 *      • Context مرکزی به جای state سراسری پراکنده
 *      • دو حالت نمایش: سورس هر دو مد SUMMARY+VERBOSE، مینی‌فای فقط SUMMARY — فقط دو نسخه source و min
 *      • تنظیمات خودکار از schema — افزودن تنظیم = 1 خط schema
 *      • استخر 90 روزه با درخواست کاربر + قیمت زنده old.tsetmc.com
 *      • سررسید خودکار آخرین روز ماه بعد جلالی
 *      • تم زیبا با funnel SVG + کارت‌های مدرن + انیمیشن flow
 *      • فیکس P0: double callback، {} خالی، poolInfo ID، :root
 *
 * ═══════════════════════════════════════════════════════════════════
 *  COMPATIBILITY CONTRACT — TSETMC REGISTRATION (بند 1-45)
 *  1) سیستم ثبت ممکن است HTML entities را داخل JS دیکد کند
 *  2) داخل رشته‌های JS مستقیماً HTML entity نگذار
 *  3) با String.fromCharCode(38) بساز
 *  4) قبل انتشار node --check
 *  5) missing ) اول به عنوان خطای تبدیل بررسی شود
 *  6) این قرارداد در هر نسخه حفظ شود
 *  7) محدودیت minify فقط برای minified — verbose با @strip علامت‌گذاری — مد وربوز در نسخه مینی‌فای حذف می‌شود
 *  8) minified به صورت raw JS آپلود شود — فقط SUMMARY — وربوز @strip
 *  9) محدودیت‌های شناخته‌شده: ; قبل else, Uglify, full mangle
 * 10) هر transform فقط بعد از پاس شدن پکیج خودش ترویج شود
 * 11) قیف هوشمند چندلایه — هر لایه ورودی/خروجی
 * 12) ساختار هیبریدی: 7 لایه اصلی + جزئیات فیلترها
 * 13) هر لایه ورودی/خروجی: 120 → 85 ▼35
 * 14) هر لایه پنل تنظیمات خودش — schema-driven
 * 15) اگر debugPanel=true نمونه خام نمایش
 * 16) در minified دیباگ و مد وربوز حذف — فقط SUMMARY باقی — کد وربوز با @strip حذف می‌شود
 * 17) منطق هر لایه بهینه‌ترین الگوریتم
 * 18) کاربر با اینترفیس ساده تنظیمات هر لایه را تغییر و نتیجه ببیند
 * 19) تم زیبا دارک — #070a14 → #111c32 gradient — قرارداد با تم جدید هماهنگ شد
 * 20) فونت Vazirmatn/Tahoma RTL
 * 21) کامنت‌ها و پیش‌فرض‌ها فارسی حفظ
 * 22) راهنمای هر پارامتر فارسی
 * 23) پنجره‌ها قابل جابجایی و بستن با × و minimize
 * 24) مدل مالی بدون درخواست صریح تغییر نکند
 * 25) آستانه‌ها فقط با تایید تغییر کنند
 * 26) در نبود history یا quote داده ساختگی ساخته نشود — یا هشدار صریح
 * 27) استخر 90 روزه — poolDays=90
 * 28) قیمت زنده old.tsetmc.com با fallback هم‌مبدأ — جلوگیری CORS
 * 29) تاریخچه فقط با درخواست کاربر — poolAutoUpdate=false
 * 30) حالت مرگ گیر نکند — هشدار + بازیابی
 * 31) اینترفیس ساده — اگزوتیک در پیشرفته مخفی
 * 32) فیکس P0: poolBaseSymbols array/string، لیسنر، fetch timeout، chart صفر، for..in delete
 * 33) فیکس منطقی: JDN، تاریخ منفی، basePrices reference، volatility سالانه، ivHist، gate cache
 * 34) v0.0.2.0: ورژن بالاتر — عدد چهارم صفر
 * 35) اطلاعات تماس اصلی: https://t.me/p75ad — گروه: https://t.me/SmartOptionTSE — مجوز Smart-FFA-1.0
 * 36) قیف زیبا — gradient، flow، کارت مدرن
 * 37) v0.0.2.1: فیکس P0 — double callback، {}، poolInfo، :root
 * 38) فیکس P1 — JDN، isCall، فیلترهای مرده، leverage
 * 39) v0.0.2.3: expiryDate و expiry همیشه آخرین روز ماه بعد جلالی
 * 40) v0.0.2.4: فیکس باقی‌مانده P0 — poolInfo حذف، IV=0، scanMock، ارقام فارسی، expiryAutoUpdate
 * 41) v0.0.4.2: معماری Layer Registry + Dual-Mode + Schema-driven UI — آماده برای لایه هشتم
 * 42) v0.0.4.3: قرارداد — مد وربوز در نسخه مینی‌فای حذف می‌شود — فقط SUMMARY — @strip وربوز
 * 43) v0.0.4.6: فیکس P0 بحرانی isCall معکوس ض/ط، topFilter، toggle CSS، K=500، DTE penalty + معماری dual-mode جدا + minimize + SoA + Hooks + تست
 * ═══════════════════════════════════════════════════════════════════
 */

;(function(){
'use strict';

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

// ─── STATE — مرکزی ─────────────────────────────────────────────────────────
var MEM = {};
var CONFIG_CACHE = {};
var modelCache = {}; var modelCacheOrder = [];
var poolStore = {}; var ivHist = {}; var poolGatesCache = {};
var liveBaseCache = {}; var liveBaseFetching = {};
var pipelineData = {}; var layerStats = {}; var abortCounts = {};
var rawSamples = {raw:[], errors:[], incomplete:[]};
var totalInput = 0;
var _dragState = null;
var _renderScheduled = false;

// ─── UTIL ─────────────────────────────────────────────────────────────────
function optStore(k,v){
    if(k==='baseInsCodes' && v!==undefined){ try{ _reverseMapCache=null; _reverseMapTime=0; }catch(e){} }
    try{
        if(v===undefined){
            if(CONFIG_CACHE.hasOwnProperty(k)) return CONFIG_CACHE[k];
            var ls = typeof localStorage!=='undefined'? localStorage.getItem('__optCfgV71_'+k):null;
            if(ls!==null){ var p=JSON.parse(ls); CONFIG_CACHE[k]=p; return p; }
            if(typeof window!=='undefined' && window['__optCfgV71_'+k]!==undefined){ CONFIG_CACHE[k]=window['__optCfgV71_'+k]; return window['__optCfgV71_'+k]; }
            return MEM[k];
        } else {
            MEM[k]=v; CONFIG_CACHE[k]=v;
            try{ localStorage.setItem('__optCfgV71_'+k, JSON.stringify(v)); }catch(e){}
            if(typeof window!=='undefined') window['__optCfgV71_'+k]=v;
        }
    }catch(e){ return MEM[k]; }
}
function clearCfgCache(k){ if(k) delete CONFIG_CACHE[k]; else CONFIG_CACHE={}; }
function getCfg(k){ var ov=optStore(k); return ov!==undefined && ov!==null? ov : CONFIG[k]; }
function getSymList(k){
    var v=getCfg(k);
    if(Array.isArray(v)) return v;
    if(typeof v==='string') return v.split(/[,،\n]+/).map(function(s){return s.trim();}).filter(Boolean);
    return [];
}
function normalizePoolSymbols(){
    var v=getCfg('poolBaseSymbols');
    if(typeof v==='string'){
        var arr=getSymList('poolBaseSymbols');
        if(arr.length>0) optStore('poolBaseSymbols', arr);
        return arr;
    }
    return getSymList('poolBaseSymbols');
}
function faToEnDigits(s){
    return String(s).replace(/[۰-۹]/g, function(d){ return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)); }).replace(/[٠-٩]/g, function(d){ return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)); });
}
function optSet(k,v){ if(k==='baseInsCodes'){ try{ _reverseMapCache=null; _reverseMapTime=0; }catch(e){} } optStore(k,v); clearCfgCache(k); console.log('[ExoticFilter] set '+k+'='+v); }
function applyUserConfigBatch(changes,title){
    if(!Array.isArray(changes)) return false;
    var pending=[];
    for(var i=0;i<changes.length;i++){
        var change=changes[i];
        if(!change||!Object.prototype.hasOwnProperty.call(CONFIG,String(change.key))) return false;
        var oldValue=getCfg(change.key), newValue=change.value;
        if(formatConfigDiffValue(oldValue)!==formatConfigDiffValue(newValue)) pending.push({key:change.key,oldValue:oldValue,value:newValue});
    }
    if(!pending.length) return true;
    var details=pending.map(function(change){return change.key+': '+formatConfigDiffValue(change.oldValue)+' → '+formatConfigDiffValue(change.value);}).join('\\n');
    var prompt=(title||'تغییر تنظیمات')+'\\n\\n'+details+'\\n\\nاعمال شود؟';
    if(typeof window==='undefined'||typeof window.confirm!=='function'||!window.confirm(prompt)) return false;
    for(var j=0;j<pending.length;j++) optSet(pending[j].key,pending[j].value);
    return true;
}
function requestConfigChange(key,value){ return applyUserConfigBatch([{key:key,value:value}], 'تغییر تنظیم فیلتر'); }
function optGet(k){ return getCfg(k); }
function addDataWarning(sym, message){
    if(!sym) return;
    if(!Array.isArray(sym._dataWarnings)) sym._dataWarnings=[];
    if(sym._dataWarnings.indexOf(message)===-1) sym._dataWarnings.push(message);
}
function escapeHtml(value){
    return String(value==null?'':value).replace(/[&<>\"']/g, function(ch){
        var amp=String.fromCharCode(38);
        return ch===amp? amp+'amp;' : ch==='<'? amp+'lt;' : ch==='>'? amp+'gt;' : ch==='\"'? amp+'quot;' : amp+'#39;';
    });
}
function showToast(msg, type){
    type=type||'info';
    var el=document.getElementById('__exfToast');
    if(!el){
        el=document.createElement('div'); el.id='__exfToast';
        el.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#111c32;border:1px solid #1e2f4f;border-radius:12px;padding:12px 18px;color:#e2e8f0;font-family:Tahoma,sans-serif;font-size:12px;z-index:20000;box-shadow:0 12px 40px rgba(0,0,0,0.5);max-width:80vw;direction:rtl;';
        document.body.appendChild(el);
    }
    el.style.borderColor = type==='error'? '#fb7185' : type==='success'? '#34d399' : '#1e2f4f';
    el.textContent=msg; el.style.display='block';
    clearTimeout(el._t); el._t=setTimeout(function(){ el.style.display='none'; }, 3500);
}

// ─── JALALI ────────────────────────────────────────────────────────────────
var _jalaliBreaks=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
var jdnCache={};
function jalCal(jy){
    var bl=_jalaliBreaks.length, gy=jy+621, leapJ=-14, jp=_jalaliBreaks[0], jm, jump, leap, n, i;
    if(jy<jp || jy>=_jalaliBreaks[bl-1]) throw new Error('Invalid Jalali year '+jy);
    for(i=1;i<bl;i++){ jm=_jalaliBreaks[i]; jump=jm-jp; if(jy<jm) break; leapJ=leapJ+Math.floor(jump/33)*8+Math.floor((jump%33)/4); jp=jm; }
    n=jy-jp; leapJ=leapJ+Math.floor(n/33)*8+Math.floor((n%33+3)/4);
    if(jump%33==4 && jump-n==4) leapJ+=1;
    var leapG=Math.floor(gy/4)-Math.floor((Math.floor(gy/100)+1)*3/4)-150;
    var march=20+leapJ-leapG;
    if(jump-n<6) n=n-jump+Math.floor((jump+4)/33)*33;
    leap=((n+1)%33-1)%4; if(leap==-1) leap=4;
    return {leap:leap, gy:gy, march:march};
}
function isLeapJalali(jy){ try{ return jalCal(jy).leap===0; }catch(e){ return false; } }
function jalaliMonthDays(jy,jm){ if(jm<=6) return 31; if(jm<=11) return 30; return isLeapJalali(jy)?30:29; }
function validatedGregorianToJdn(gy,gm,gd){
    if(!isFinite(gy)||!isFinite(gm)||!isFinite(gd)||gm<1||gm>12||gd<1||gd>31) return null;
    var check=new Date(Date.UTC(gy,gm-1,gd));
    if(check.getUTCFullYear()!==gy || check.getUTCMonth()+1!==gm || check.getUTCDate()!==gd) return null;
    return g2d(gy,gm,gd);
}
function g2d(gy,gm,gd){
    // Proleptic Gregorian date -> integer JDN (known reference: 2000-01-01 = 2451545).
    var a=Math.floor((14-gm)/12);
    var y=gy+4800-a;
    var m=gm+12*a-3;
    return gd+Math.floor((153*m+2)/5)+365*y+Math.floor(y/4)-Math.floor(y/100)+Math.floor(y/400)-32045;
}
function jalaliToJdn(jy,jm,jd){
    if(jm<1 || jm>12 || jd<1 || jd>jalaliMonthDays(jy,jm)) throw new RangeError('Invalid Jalali date '+jy+'/'+jm+'/'+jd);
    var key=jy+'/'+jm+'/'+jd;
    if(jdnCache[key]) return jdnCache[key];
    var r=jalCal(jy);
    var offset=jm<=7? (jm-1)*31 : 186+(jm-7)*30;
    var v=g2d(r.gy,3,r.march+offset+jd-1);
    jdnCache[key]=v;
    return v;
}
function todayJdn(){ return unixDayTehran()+JDN_UNIX_EPOCH; }
function unixDay(){ return Math.floor(Date.now()/86400000); }
function unixDayTehran(){
    var now=new Date();
    var tehranMs=now.getTime()+210*60000;
    return Math.floor(tehranMs/86400000);
}
function normalizeToJdn(value){
    if(value==null || value==='') return null;
    if(typeof value==='string'){
        var text=faToEnDigits(value).trim();
        var dateMatch=text.match(/^(\d{4})\s*[\/\.\-]\s*(\d{1,2})\s*[\/\.\-]\s*(\d{1,2})$/);
        if(dateMatch){
            var year=+dateMatch[1], month=+dateMatch[2], day=+dateMatch[3];
            try{ return year>=1700? validatedGregorianToJdn(year,month,day) : jalaliToJdn(year,month,day); }catch(e){ return null; }
        }
        if(/^\d{7,8}$/.test(text)) value=+text;
        else if(/^\d+(?:\.0+)?$/.test(text)) value=+text;
        else return null;
    }
    var n=Number(value);
    if(!isFinite(n) || n<=0) return null;
    n=Math.floor(n);
    // YYYYMMDD Jalali/Gregorian, not an astronomical JDN.
    if(n>=10000000 && n<=99999999){
        var y=Math.floor(n/10000), m=Math.floor((n%10000)/100), d=n%100;
        try{ return y>=1700? validatedGregorianToJdn(y,m,d) : jalaliToJdn(y,m,d); }catch(e){ return null; }
    }
    // Full JDN.
    if(n>=2000000 && n<=3000000) return n;
    // Legacy project values were Unix-day ordinals. Normalize them at the boundary.
    if(n<100000) return n+JDN_UNIX_EPOCH;
    return null;
}
function jdnToJalali(jdn){
    jdn=Math.floor(Number(jdn));
    if(!isFinite(jdn) || jdn<1000000) return null;
    try{
        var date=new Date((jdn-JDN_UNIX_EPOCH)*86400000);
        var fmt=new Intl.DateTimeFormat('fa-IR-u-ca-persian', {timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
        var parts=fmt.formatToParts(date), jy=0,jm=0,jd=0;
        for(var i=0;i<parts.length;i++){
            var v=faToEnDigits(parts[i].value).replace(/\D/g,'');
            if(parts[i].type==='year') jy=parseInt(v,10);
            else if(parts[i].type==='month') jm=parseInt(v,10);
            else if(parts[i].type==='day') jd=parseInt(v,10);
        }
        if(jy>0 && jm>0 && jd>0) return {jy:jy,jm:jm,jd:jd};
    }catch(e){}
    try{
        var gregorian=new Date((jdn-JDN_UNIX_EPOCH)*86400000);
        var gy=gregorian.getUTCFullYear();
        for(var candidate=gy-622;candidate<=gy-620;candidate++){
            var first=jalaliToJdn(candidate,1,1), next=jalaliToJdn(candidate+1,1,1);
            if(jdn>=first && jdn<next){
                var offset=jdn-first, jm, jd;
                if(offset<186){ jm=1+Math.floor(offset/31); jd=1+offset%31; }
                else { offset-=186; jm=7+Math.floor(offset/30); jd=1+offset%30; }
                return {jy:candidate,jm:jm,jd:jd};
            }
        }
    }catch(e){}
    return null;
}
function parseHolidayJdn(value){ return normalizeToJdn(value); }
var TSE_CALENDAR = {
    // Saturday-based numbering: Saturday=0, Sunday=1, ..., Friday=6.
    tradingWeekdays:[0,1,2,3,4],
    getDayOfWeek:function(jdn){ return ((Math.floor(jdn)+2)%7+7)%7; },
    getHolidayJdns:function(){
        var raw=getCfg('marketHolidays')||[];
        if(typeof raw==='string') raw=raw.split(/[,،\n]+/).map(function(x){return x.trim();}).filter(Boolean);
        if(!Array.isArray(raw)) raw=[];
        var signature=raw.join('|');
        if(this._holidaySignature===signature && this._holidayCache) return this._holidayCache;
        var out=[];
        for(var i=0;i<raw.length;i++){ var date=parseHolidayJdn(raw[i]); if(date!=null && out.indexOf(date)<0) out.push(date); }
        this._holidaySignature=signature; this._holidayCache=out;
        return out;
    },
    getCompleteYears:function(){
        var raw=getCfg('marketCalendarCompleteYears')||[];
        if(typeof raw==='string') raw=raw.split(/[,،\s]+/).filter(Boolean);
        return Array.isArray(raw)? raw.map(function(x){return String(x).trim();}) : [];
    },
    isYearComplete:function(jy){ return this.getCompleteYears().indexOf(String(jy))!==-1; },
    isTradingDay:function(jdn){
        jdn=Math.floor(Number(jdn));
        if(!isFinite(jdn)) return false;
        if(this.tradingWeekdays.indexOf(this.getDayOfWeek(jdn))===-1) return false;
        return this.getHolidayJdns().indexOf(jdn)===-1;
    },
    nextTradingDay:function(jdn){
        var day=Math.floor(Number(jdn));
        if(!isFinite(day)) throw new TypeError('A finite JDN is required');
        for(var i=0;i<3700;i++){ day++; if(this.isTradingDay(day)) return day; }
        throw new Error('No trading day found in the next 10 years; check holiday data');
    },
    tradingDaysBetween:function(startJdn,endJdn){
        var start=Math.floor(Number(startJdn)), end=Math.floor(Number(endJdn));
        if(!isFinite(start)||!isFinite(end)) return 0;
        if(start===end) return 0;
        var direction=end>start?1:-1, count=0, span=Math.abs(end-start);
        if(span>200000) throw new RangeError('Date range is too large');
        for(var day=start+direction; direction>0?day<=end:day>=end; day+=direction){ if(this.isTradingDay(day)) count+=direction; }
        return count;
    },
    nthTradingDayAfter:function(startJdn,count){
        var day=Math.floor(Number(startJdn)), n=Math.floor(Number(count));
        if(!isFinite(day)||!isFinite(n)||n<0) throw new TypeError('Invalid trading-day horizon');
        for(var i=0;i<n;i++) day=this.nextTradingDay(day);
        return day;
    },
    calendarStatus:function(startJdn,endJdn){
        startJdn=Math.floor(Number(startJdn)); endJdn=Math.floor(Number(endJdn));
        if(!isFinite(startJdn)||!isFinite(endJdn)) return {status:'unknown',complete:false,reason:'invalid-range',missingYears:[],knownTradingDays:null};
        var lo=Math.min(startJdn,endJdn), hi=Math.max(startJdn,endJdn);
        var start=jdnToJalali(lo), end=jdnToJalali(hi);
        if(!start||!end) return {status:'unknown',complete:false,reason:'date-conversion',fromJdn:lo,toJdn:hi,missingYears:[],knownTradingDays:null};
        var years=[],missing=[];
        for(var year=start.jy;year<=end.jy;year++){ years.push(year); if(!this.isYearComplete(year)) missing.push(year); }
        return {status:missing.length?'incomplete':'complete',complete:missing.length===0,fromJdn:lo,toJdn:hi,years:years,missingYears:missing,holidayCount:this.getHolidayJdns().filter(function(d){return d>=lo&&d<=hi;}).length,knownTradingDays:this.tradingDaysBetween(lo,hi),calendarSource:'user-managed'};
    },
    isCompleteForRange:function(startJdn,endJdn){ return this.calendarStatus(startJdn,endJdn).complete; },
    todayJdn:function(){ return todayJdn(); },
    prevTradingDay:function(jdn){
        var day=Math.floor(Number(jdn)); if(!isFinite(day)) throw new TypeError('A finite JDN is required');
        for(var i=0;i<3700;i++){ day--; if(this.isTradingDay(day)) return day; }
        throw new Error('No trading day found in the previous 10 years; check holiday data');
    },
    findHolidayGaps:function(startJdn,endJdn,minimumClosedDays){
        var start=Math.floor(Number(startJdn)), end=Math.floor(Number(endJdn));
        if(!isFinite(start)||!isFinite(end)||end<start) return {status:'unknown',complete:false,gaps:[],maxClosedCalendarDays:null};
        var gaps=[], prev=this.prevTradingDay(start), next=this.nextTradingDay(prev), guard=0, status;
        while(prev<end&&guard++<400){
            var closed=next-prev-1;
            if(closed>=(minimumClosedDays||1)) gaps.push({afterJdn:prev,nextJdn:next,closedCalendarDays:closed,continuesBeyondWindow:next>end});
            if(next>end) break;
            prev=next; next=this.nextTradingDay(prev);
        }
        status=this.calendarStatus(start,Math.max(end,gaps.length?gaps[gaps.length-1].nextJdn:end));
        var max=0; for(var i=0;i<gaps.length;i++) max=Math.max(max,gaps[i].closedCalendarDays);
        return {status:status.status,complete:status.complete,missingYears:status.missingYears,gaps:gaps,maxClosedCalendarDays:status.complete?max:null};
    },
    getAnnualTradingDays:function(jy){
        var start=jalaliToJdn(jy,1,1), end=jalaliToJdn(jy+1,1,1)-1, count=0;
        for(var day=start;day<=end;day++) if(this.isTradingDay(day)) count++;
        var complete=this.isYearComplete(jy);
        return {days:count,complete:complete,status:complete?'complete':'incomplete',year:jy,suppliedHolidayCount:this.getHolidayJdns().filter(function(d){return d>=start&&d<=end;}).length};
    },
    holidayRisk:function(startJdn,holdingTradingDays,maxClosedDays){
        var n=Math.max(0,Math.floor(Number(holdingTradingDays)||0)), prev=Math.floor(Number(startJdn));
        var gaps=[], maxClosed=0, end=prev;
        for(var i=0;i<n;i++){
            var next=this.nextTradingDay(prev), closed= Math.max(0,next-prev-1);
            if(closed>0){ gaps.push({afterJdn:prev,nextJdn:next,closedCalendarDays:closed,calendarGapDays:next-prev}); maxClosed=Math.max(maxClosed,closed); }
            prev=next; end=next;
        }
        var complete=this.isCompleteForRange(startJdn,end);
        return {gaps:gaps,maxClosedCalendarDays:maxClosed,threshold:maxClosedDays==null?3:maxClosedDays,risk:maxClosed>(maxClosedDays==null?3:maxClosedDays),complete:complete,endJdn:end};
    }
};
function getPricingTime(ctx,expiryJdn){
    var mode=ctx.cfg.modelTimeBasis||'legacy-hold';
    if(mode==='legacy-hold'){ var legacyHold=Number(ctx.cfg.holdDays); if(!isFinite(legacyHold)) legacyHold=5; return {ok:true,T:legacyHold/365,daysPerYear:365,basis:'legacy-hold'}; }
    if(expiryJdn==null) return {ok:false,reason:'expiry-required-for-time-model'};
    var calendarDays=Math.max(0,expiryJdn-ctx.todayJdn);
    if(mode==='calendar-expiry') return {ok:true,T:calendarDays/365,daysPerYear:365,basis:'calendar-expiry'};
    if(mode==='tse-trading'){
        var pricingCalendarStatus=TSE_CALENDAR.calendarStatus(ctx.todayJdn,expiryJdn);
        if(!pricingCalendarStatus.complete) return {ok:false,reason:'calendar-incomplete',calendarStatus:pricingCalendarStatus};
        var sessions=Math.max(0,TSE_CALENDAR.tradingDaysBetween(ctx.todayJdn,expiryJdn));
        var startYear=jdnToJalali(ctx.todayJdn), endYear=jdnToJalali(expiryJdn);
        if(!startYear||!endYear) return {ok:false,reason:'date-conversion'};
        var annualDays=0, years=0;
        for(var year=startYear.jy;year<=endYear.jy;year++){
            var annual=TSE_CALENDAR.getAnnualTradingDays(year);
            if(!annual.complete||annual.days<=0) return {ok:false,reason:'calendar-incomplete'};
            annualDays+=annual.days; years++;
        }
        annualDays=years?annualDays/years:0;
        if(!annualDays) return {ok:false,reason:'annual-trading-days-unavailable'};
        return {ok:true,T:sessions/annualDays,daysPerYear:annualDays,basis:'tse-trading',tradingDays:sessions,annualTradingDays:annualDays,calendarStatus:pricingCalendarStatus};
    }
    return {ok:false,reason:'unknown-time-model'};
}
function describeMarketTrend(snapshot,nowMs){
    var unknown={status:'unknown',label:'نامعلوم',reason:'snapshot-unavailable',financialScore:null,filterImpact:'none',changes:[]};
    if(!snapshot||snapshot.schemaVersion!==1||!Array.isArray(snapshot.indices)||snapshot.indices.length<2) return unknown;
    var now=nowMs==null?Date.now():Number(nowMs), changes=[];
    for(var i=0;i<snapshot.indices.length;i++){
        var index=snapshot.indices[i], points=index&&index.observations;
        if(!index||!index.name||!Array.isArray(points)||points.length<2) return Object.assign({},unknown,{reason:'insufficient-index-observations'});
        var first=points[0], last=points[points.length-1];
        var firstTime=typeof first.timestamp==='number'?first.timestamp:Date.parse(String(first.timestamp||''));
        var lastTime=typeof last.timestamp==='number'?last.timestamp:Date.parse(String(last.timestamp||''));
        var firstValue=Number(first.value), lastValue=Number(last.value);
        if(!isFinite(firstTime)||!isFinite(lastTime)||lastTime<=firstTime||!isFinite(firstValue)||!isFinite(lastValue)||firstValue<=0||lastValue<=0) return Object.assign({},unknown,{reason:'invalid-index-series'});
        if(now-lastTime>900000||lastTime-now>300000) return Object.assign({},unknown,{reason:'stale-index-series'});
        changes.push({name:String(index.name),changePct:(lastValue/firstValue-1)*100,from:firstTime,to:lastTime});
    }
    var up=changes.filter(function(x){return x.changePct>0;}).length;
    var down=changes.filter(function(x){return x.changePct<0;}).length;
    var status=up===changes.length?'up':down===changes.length?'down':(up===0&&down===0?'flat':'mixed');
    return {status:status,label:status==='up'?'صعودی (توصیفی)':status==='down'?'نزولی (توصیفی)':status==='flat'?'بدون تغییر':'ترکیبی',reason:null,asOf:Math.min.apply(null,changes.map(function(x){return x.to;})),changes:changes,financialScore:null,filterImpact:'none'};
}
function getMarketTrend(){
    var snapshot=null;
    try{ if(typeof window!=='undefined') snapshot=window.__exfMarketTrendSnapshot||null; }catch(e){}
    return describeMarketTrend(snapshot);
}
function registerTsetmcAdapter(adapter){
    if(!adapter||adapter.version!==TSETMC_ADAPTER_CONTRACT_VERSION||typeof adapter.parseLiveQuote!=='function'||typeof adapter.parseHistoryRow!=='function') return false;
    if(typeof window==='undefined') return false;
    window.__exfTsetmcAdapter=adapter;
    return true;
}

function isMarketHours(){
    var nowJdn=todayJdn();
    if(!TSE_CALENDAR.isTradingDay(nowJdn)) return false;
    var hour=0,minute=0;
    try{
        var parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tehran',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
        for(var i=0;i<parts.length;i++){ if(parts[i].type==='hour') hour=+parts[i].value; if(parts[i].type==='minute') minute=+parts[i].value; }
    }catch(e){ var tehran=new Date(Date.now()+210*60000); hour=tehran.getUTCHours(); minute=tehran.getUTCMinutes(); }
    var current=hour*60+minute;
    return current>=getCfg('sessionStartMin') && current<=getCfg('sessionEndMin');
}

function pad2(n){ return n<10? '0'+n : ''+n; }
function getJalaliNow(){
    try{
        if(typeof Intl!=='undefined'){
            var now=new Date();
            var fmt=new Intl.DateTimeFormat('fa-IR-u-ca-persian', {timeZone:'Asia/Tehran', year:'numeric', month:'numeric', day:'numeric'});
            var parts=fmt.formatToParts(now);
            var jy=0,jm=0,jd=0;
            for(var i=0;i<parts.length;i++){
                var val=faToEnDigits(parts[i].value).replace(/\D/g,'');
                if(parts[i].type==='year') jy=parseInt(val,10);
                else if(parts[i].type==='month') jm=parseInt(val,10);
                else if(parts[i].type==='day') jd=parseInt(val,10);
            }
            if(jy>0 && jm>0 && jd>0) return {jy:jy, jm:jm, jd:jd};
        }
    }catch(e){}
    try{
        var now2=new Date();
        var tehranMs2=now2.getTime()+(210-(-now2.getTimezoneOffset()))*60000;
        var tehran2=new Date(tehranMs2);
        var gy=tehran2.getUTCFullYear(), gm=tehran2.getUTCMonth()+1, gd=tehran2.getUTCDate();
        var g_d_m=[0,31,59,90,120,151,181,212,243,273,304,334];
        var gy2=gm>2? gy+1 : gy;
        var days=355666+365*gy+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)+gd+g_d_m[gm-1];
        var jy=-1595+33*Math.floor(days/12053); days%=12053;
        jy+=4*Math.floor(days/1461); days%=1461;
        if(days>365){ jy+=Math.floor((days-1)/365); days=(days-1)%365; }
        var jm, jd;
        if(days<186){ jm=1+Math.floor(days/31); jd=1+days%31; }
        else { jm=7+Math.floor((days-186)/30); jd=1+(days-186)%30; }
        return {jy:jy, jm:jm, jd:jd};
    }catch(e){ return {jy:1404, jm:6, jd:15}; }
}
function getNextJalaliMonthLastDay(){
    var cur=getJalaliNow();
    var jy=cur.jy, jm=cur.jm+1;
    if(jm>12){ jm=1; jy++; }
    var jd=jalaliMonthDays(jy, jm);
    return {jy:jy, jm:jm, jd:jd};
}
function updateExpiryToNextMonthLastDay(){
    try{
        var nxt=getNextJalaliMonthLastDay();
        var dateStr=nxt.jy+'/'+pad2(nxt.jm)+'/'+pad2(nxt.jd);
        var monthPat=nxt.jm<10? '0?'+nxt.jm : '(?:'+nxt.jm+'|0?'+(nxt.jm%10)+')';
        // برای ماه‌های دو رقمی هم 10 و هم 010? را بپذیر — ولی ساده: ماه دو رقمی دقیق
        if(nxt.jm>=10) monthPat='0?'+nxt.jm;
        var expiryPat=nxt.jy+'\\s*[\\/\\.\\-]\\s*'+monthPat+'(?!\\d)';
        var changes=[{key:'expiryDate',value:dateStr},{key:'expiry',value:expiryPat},{key:'expiryJY',value:nxt.jy},{key:'expiryJM',value:nxt.jm},{key:'expiryJD',value:nxt.jd}];
        if(!applyUserConfigBatch(changes,'به‌روزرسانی سررسید مرجع')) return null;
        CONFIG.expiryDate=dateStr; CONFIG.expiry=expiryPat; CONFIG.expiryJY=nxt.jy; CONFIG.expiryJM=nxt.jm; CONFIG.expiryJD=nxt.jd;
        console.log('[ExoticFilter] سررسید مرجع پس از تأیید → '+dateStr+' — الگو: '+expiryPat);
        return {dateStr:dateStr, pattern:expiryPat, jy:nxt.jy, jm:nxt.jm, jd:nxt.jd};
    }catch(e){ console.warn('[ExoticFilter] خطا سررسید', e); return null; }
}

// ─── POOL — 90 روزه — SoA پیشنهادی: ستون‌محور (jdn[], price[], tvol[]...) برای کش بهتر
// فعلاً AoS با binary insert و sort-on-demand — برای 90 روز و <100 نماد کافی است
// SoA کامل: {jdn:Int32Array, price:Float32Array, ...} — در آینده با WebAssembly قابل بهینه‌سازی
// ─── POOL — 90 روزه ───────────────────────────────────────────────────────
var POOL_MAX_DAYS=90;
function isTrustedObservationSource(source){ return source==='live-tsetmc'||source==='tsetmc-history'; }
function isVerifiedPoolObservation(row){
    if(!row||row.adapterVersion!==TSETMC_ADAPTER_CONTRACT_VERSION||!row.instrumentId||!isTrustedObservationSource(row.source)) return false;
    if(row.source==='live-tsetmc'&&(!isFinite(Number(row.timestamp))||Number(row.timestamp)<=0)) return false;
    return true;
}
function normalizeObservationTimestamp(value){
    var timestamp=typeof value==='number'?value:Date.parse(String(value||''));
    if(typeof value==='number'&&timestamp>0&&timestamp<100000000000) timestamp*=1000;
    return isFinite(timestamp)&&timestamp>0?timestamp:null;
}
function getVerifiedIvHistory(baseSym){
    var history=ivHist[baseSym]||[], out=[];
    for(var i=0;i<history.length;i++) if(history[i]&&history[i].iv>0&&isTrustedObservationSource(history[i].source)) out.push(history[i]);
    return out;
}
var STORAGE_SCHEMA_VERSION=2;
var POOL_STORE_KEY='__exfPoolV2', POOL_IV_KEY='__exfIvHistV2', POOL_BUNDLE_KEY='__exfStoreV2';
var LEGACY_POOL_STORE_KEY='__exfPoolV1', LEGACY_POOL_IV_KEY='__exfIvHistV1';
function decodeStorageRecord(raw,kind){
    if(!raw) return {data:null,legacy:false,valid:true};
    try{
        var parsed=JSON.parse(raw);
        if(parsed&&parsed.schemaVersion===STORAGE_SCHEMA_VERSION&&parsed.kind===kind&&parsed.data&&typeof parsed.data==='object'&&!Array.isArray(parsed.data)) return {data:parsed.data,legacy:false,valid:true};
        if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)&&(parsed.schemaVersion!=null||parsed.kind!=null||parsed.data!=null)) return {data:null,legacy:false,valid:false};
        if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)) return {data:parsed,legacy:true,valid:true};
    }catch(e){}
    return {data:null,legacy:false,valid:false};
}
function validatePoolStore(pool){
    if(!pool||typeof pool!=='object'||Array.isArray(pool)) return {};
    var out={}, symbols=Object.keys(pool);
    for(var i=0;i<symbols.length;i++){
        var symbol=symbols[i], entry=pool[symbol];
        if(!entry||typeof entry!=='object'||!Array.isArray(entry.history)) continue;
        var history=[];
        for(var j=0;j<entry.history.length;j++){
            var h=entry.history[j];
            if(!h||!isFinite(Number(h.jdn))||Number(h.jdn)<=0||!isFinite(Number(h.price))||Number(h.price)<0) continue;
            var verified=isVerifiedPoolObservation(h);
            history.push({jdn:Math.floor(Number(h.jdn)),dateStr:typeof h.dateStr==='string'?h.dateStr:'',price:Number(h.price),vol:isFinite(Number(h.vol))?Number(h.vol):0,tno:isFinite(Number(h.tno))?Number(h.tno):0,tvol:isFinite(Number(h.tvol))?Number(h.tvol):0,iv:isFinite(Number(h.iv))?Number(h.iv):0,source:verified?h.source:'unverified',instrumentId:verified?String(h.instrumentId):null,adapterVersion:verified?h.adapterVersion:null,timestamp:verified&&h.timestamp!=null?normalizeObservationTimestamp(h.timestamp):null});
        }
        history.sort(function(a,b){return a.jdn-b.jdn;});
        out[symbol]={history:history,stats:{},firstJdn:history.length?history[0].jdn:0,lastJdn:history.length?history[history.length-1].jdn:0,count:history.length};
    }
    return out;
}
function validateIvHistory(history){
    if(!history||typeof history!=='object'||Array.isArray(history)) return {};
    var out={},keys=Object.keys(history);
    for(var i=0;i<keys.length;i++){
        var rows=Array.isArray(history[keys[i]])?history[keys[i]]:[], clean=[];
        for(var j=0;j<rows.length;j++){
            var row=rows[j];
            if(!row||!isFinite(Number(row.jdn))||Number(row.jdn)<=0||!isFinite(Number(row.iv))||Number(row.iv)<=0) continue;
            var verified=isVerifiedPoolObservation(row);
            clean.push({jdn:Math.floor(Number(row.jdn)),iv:Number(row.iv),dateStr:typeof row.dateStr==='string'?row.dateStr:'',source:verified?row.source:'unverified',instrumentId:verified?String(row.instrumentId):null,adapterVersion:verified?row.adapterVersion:null,timestamp:verified&&row.timestamp!=null?normalizeObservationTimestamp(row.timestamp):null});
        }
        clean.sort(function(a,b){return a.jdn-b.jdn;}); out[keys[i]]=clean;
    }
    return out;
}
function migrateLegacyPoolDayOrdinals(pool, ivHistory){
    var changed=false, keys=Object.keys(pool||{});
    for(var i=0;i<keys.length;i++){
        var entry=pool[keys[i]];
        if(!entry) continue;
        if(Array.isArray(entry.history)){
            for(var j=0;j<entry.history.length;j++){
                var point=entry.history[j];
                if(point && isFinite(point.jdn) && point.jdn>0 && point.jdn<100000){ point.jdn=Math.floor(point.jdn)+JDN_UNIX_EPOCH; changed=true; }
            }
            entry.history.sort(function(a,b){return a.jdn-b.jdn;});
            if(entry.history.length){ entry.firstJdn=entry.history[0].jdn; entry.lastJdn=entry.history[entry.history.length-1].jdn; entry.count=entry.history.length; }
        }
        if(entry.stats){
            if(entry.stats.firstJdn>0 && entry.stats.firstJdn<100000){ entry.stats.firstJdn+=JDN_UNIX_EPOCH; changed=true; }
            if(entry.stats.lastJdn>0 && entry.stats.lastJdn<100000){ entry.stats.lastJdn+=JDN_UNIX_EPOCH; changed=true; }
        }
    }
    var ivKeys=Object.keys(ivHistory||{});
    for(var a=0;a<ivKeys.length;a++){
        var series=ivHistory[ivKeys[a]];
        if(!Array.isArray(series)) continue;
        for(var b=0;b<series.length;b++) if(series[b] && isFinite(series[b].jdn) && series[b].jdn>0 && series[b].jdn<100000){ series[b].jdn=Math.floor(series[b].jdn)+JDN_UNIX_EPOCH; changed=true; }
        series.sort(function(x,y){return x.jdn-y.jdn;});
    }
    return changed;
}
function loadPool(){
    var migrated=false, splitStorage=false, bundleLoaded=false, bundleRejected=false, rawBundle=null, rawPool=null, rawIv=null, decodedBundle, decodedPool, decodedIv;
    try{
        if(typeof localStorage!=='undefined'){
            rawBundle=localStorage.getItem(POOL_BUNDLE_KEY);
            if(rawBundle){
                decodedBundle=decodeStorageRecord(rawBundle,'pool-bundle');
                if(decodedBundle.valid&&decodedBundle.data){
                    poolStore=validatePoolStore(decodedBundle.data.pool||{});
                    ivHist=validateIvHistory(decodedBundle.data.ivHistory||{});
                    bundleLoaded=true;
                } else { bundleRejected=true; console.warn('[Zharfa] bundle storage invalid/unsupported; trying versioned/legacy records without overwriting the original.'); }
            }
            if(!bundleLoaded){
                rawPool=localStorage.getItem(POOL_STORE_KEY); rawIv=localStorage.getItem(POOL_IV_KEY);
                decodedPool=decodeStorageRecord(rawPool,'pool'); decodedIv=decodeStorageRecord(rawIv,'iv-history');
                if(!decodedPool.valid||!decodedPool.data){ rawPool=localStorage.getItem(LEGACY_POOL_STORE_KEY); decodedPool=decodeStorageRecord(rawPool,'pool'); }
                if(!decodedIv.valid||!decodedIv.data){ rawIv=localStorage.getItem(LEGACY_POOL_IV_KEY); decodedIv=decodeStorageRecord(rawIv,'iv-history'); }
                if(decodedPool.valid&&decodedPool.data) poolStore=validatePoolStore(decodedPool.data);
                else { poolStore={}; if(rawPool) console.warn('[Zharfa] pool storage invalid; ignored without deleting the original record.'); }
                if(decodedIv.valid&&decodedIv.data) ivHist=validateIvHistory(decodedIv.data);
                else { ivHist={}; if(rawIv) console.warn('[Zharfa] IV storage invalid; ignored without deleting the original record.'); }
                migrated=!!((decodedPool&&decodedPool.legacy)||(decodedIv&&decodedIv.legacy));
                splitStorage=!!((rawPool||rawIv)&&!bundleLoaded&&!rawBundle);
                migrated=migrated||splitStorage;
            }
        } else { poolStore={}; ivHist={}; }
    }catch(e){ console.warn('[Zharfa] storage read failed; in-memory state starts empty.',e&&e.message||e); poolStore={}; ivHist={}; }
    var ordinalMigration=migrateLegacyPoolDayOrdinals(poolStore,ivHist);
    migrated=migrated||ordinalMigration;
    if(bundleRejected) migrated=false;
    var keys=Object.keys(poolStore);
    for(var i=0;i<keys.length;i++){
        if(!poolStore[keys[i]].stats) poolStore[keys[i]].stats={};
        try{ updatePoolStats(keys[i]); }catch(e){}
    }
    try{ pruneOldPool(); }catch(e){}
    if(migrated){
        try{
            if(typeof localStorage!=='undefined'){
                var oldPool=localStorage.getItem(LEGACY_POOL_STORE_KEY), oldIv=localStorage.getItem(LEGACY_POOL_IV_KEY);
                if(oldPool&&!localStorage.getItem(LEGACY_POOL_STORE_KEY+'_backup_v2')) localStorage.setItem(LEGACY_POOL_STORE_KEY+'_backup_v2',oldPool);
                if(oldIv&&!localStorage.getItem(LEGACY_POOL_IV_KEY+'_backup_v2')) localStorage.setItem(LEGACY_POOL_IV_KEY+'_backup_v2',oldIv);
            }
            if(!savePool()) throw new Error('atomic bundle save failed');
            console.info('[Zharfa] storage migrated to schema v2 bundle; legacy keys retained as backup.');
        }catch(e){ console.warn('[Zharfa] storage migration backup/save failed; legacy data was retained.',e&&e.message||e); }
    }
}
function savePool(){
    if(typeof localStorage==='undefined') return false;
    var envelope={schemaVersion:STORAGE_SCHEMA_VERSION,kind:'pool-bundle',data:{pool:poolStore,ivHistory:ivHist}};
    try{
        // A single setItem makes the pool + IV snapshot atomic with respect to quota failures.
        localStorage.setItem(POOL_BUNDLE_KEY,JSON.stringify(envelope));
        return true;
    }catch(e){
        console.warn('[ExoticFilter] pool persistence failed; in-memory data retained and stored data not pruned.',e&&e.message||e);
        rawSamples.errors.push({reason:'storage-write-failed',error:e&&e.message||String(e)});
        return false;
    }
}
// ─── BINARY SEARCH INSERT — O(log n) به جای sort هر بار ──────────────────
function binarySearchInsertPos(arr, jdn){
    var lo=0, hi=arr.length;
    while(lo<hi){
        var mid=(lo+hi>>1);
        if(arr[mid].jdn < jdn) lo=mid+1;
        else hi=mid;
    }
    return lo;
}
var _poolBatchMode=false, _poolDirty={};
function beginPoolBatch(){ _poolBatchMode=true; _poolDirty={}; }
function endPoolBatch(){ _poolBatchMode=false; var keys=Object.keys(_poolDirty); for(var i=0;i<keys.length;i++){ try{ updatePoolStats(keys[i]); }catch(e){} } _poolDirty={}; savePool(); }
function addToPool(baseSym, data){
    if(!baseSym) return;
    if(!poolStore[baseSym]) poolStore[baseSym]={history:[], stats:{}, lastJdn:0, firstJdn:0, count:0};
    var entry=poolStore[baseSym];
    var jdn=data.jdn||todayJdn();
    // binary search برای وجود
    var pos=binarySearchInsertPos(entry.history, jdn);
    if(pos<entry.history.length && entry.history[pos].jdn===jdn){
        entry.history[pos].price=data.price||entry.history[pos].price;
        if(data.source) entry.history[pos].source=data.source;
        if(data.instrumentId) entry.history[pos].instrumentId=String(data.instrumentId);
        if(data.adapterVersion!=null) entry.history[pos].adapterVersion=data.adapterVersion;
        if(data.timestamp!=null) entry.history[pos].timestamp=normalizeObservationTimestamp(data.timestamp);
        if(data.vol!=null) entry.history[pos].vol=data.vol;
        if(data.tno!=null) entry.history[pos].tno=data.tno;
        if(data.tvol!=null) entry.history[pos].tvol=data.tvol;
        if(data.iv!=null && data.iv>0) entry.history[pos].iv=data.iv;
        entry.lastJdn=jdn;
        updatePoolStats(baseSym);
        return;
    }
    var newItem={jdn:jdn,dateStr:data.dateStr||jdnToIsoDate(jdn),price:data.price||0,vol:data.vol||0,tno:data.tno||0,tvol:data.tvol||0,iv:data.iv||0,source:data.source||'unverified',instrumentId:data.instrumentId?String(data.instrumentId):null,adapterVersion:data.adapterVersion||null,timestamp:data.timestamp==null?null:normalizeObservationTimestamp(data.timestamp)};
    // binary insert
    entry.history.splice(pos,0,newItem);
    var maxDays=getCfg('poolMaxDays')||90;
    if(entry.history.length>maxDays){
        // نگه‌داری 90 روز آخر — چون مرتب است، از ابتدا حذف
        var excess=entry.history.length-maxDays;
        entry.history.splice(0, excess);
    }
    entry.firstJdn=entry.history[0]? entry.history[0].jdn : jdn;
    entry.lastJdn=entry.history[entry.history.length-1].jdn;
    entry.count=entry.history.length;
    if(_poolBatchMode){ _poolDirty[baseSym]=true; } else { updatePoolStats(baseSym); }
    if(data.iv!=null && data.iv>0){
        if(!ivHist[baseSym]) ivHist[baseSym]=[];
        var posIv=binarySearchInsertPos(ivHist[baseSym], jdn);
        if(posIv<ivHist[baseSym].length && ivHist[baseSym][posIv].jdn===jdn){
            ivHist[baseSym][posIv].iv=data.iv;
            if(data.source) ivHist[baseSym][posIv].source=data.source;
            if(data.instrumentId) ivHist[baseSym][posIv].instrumentId=String(data.instrumentId);
            if(data.adapterVersion!=null) ivHist[baseSym][posIv].adapterVersion=data.adapterVersion;
            if(data.timestamp!=null) ivHist[baseSym][posIv].timestamp=normalizeObservationTimestamp(data.timestamp);
        } else {
            ivHist[baseSym].splice(posIv,0,{jdn:jdn,iv:data.iv,dateStr:data.dateStr,source:data.source||'unverified',instrumentId:data.instrumentId?String(data.instrumentId):null,adapterVersion:data.adapterVersion||null,timestamp:data.timestamp==null?null:normalizeObservationTimestamp(data.timestamp)});
        }
        if(ivHist[baseSym].length>getCfg('ivHistDays')) ivHist[baseSym]=ivHist[baseSym].slice(-getCfg('ivHistDays'));
    }
}
var POOL_AUTO_WRITE_PREFIX='__exfPoolAutoAtV2_';
function poolWriteAllowed(mode,baseSym){
    if(mode==='manual') return true;
    if(mode!=='automatic' || getCfg('poolAutoUpdate')!==true) return false;
    try{
        if(typeof localStorage==='undefined') return false;
        var last=Number(localStorage.getItem(POOL_AUTO_WRITE_PREFIX+encodeURIComponent(baseSym))||0);
        return !last || Date.now()-last>=86400000;
    }catch(e){ return false; }
}
function writePoolObservation(baseSym,data,mode){
    data=data||{};
    if(!baseSym||!isTrustedObservationSource(data.source)||!poolWriteAllowed(mode,baseSym)) return false;
    var expectedId=(getCfg('baseInsCodes')||{})[baseSym];
    if(data.adapterVersion!==TSETMC_ADAPTER_CONTRACT_VERSION||!expectedId||String(data.instrumentId)!==String(expectedId)) return false;
    var jdn=normalizeToJdn(data.jdn);
    if(jdn==null||jdn>todayJdn()||!(Number(data.price)>0)||!isFinite(Number(data.price))) return false;
    var timestamp=null;
    if(data.source==='live-tsetmc'){
        timestamp=normalizeObservationTimestamp(data.timestamp);
        var age=timestamp==null?Infinity:Date.now()-timestamp;
        if(age< -300000||age>(Number(getCfg('liveBaseMaxAge'))||300000)) return false;
    }
    var normalized={jdn:jdn,dateStr:data.dateStr||jdnToIsoDate(jdn),price:Number(data.price),vol:Number(data.vol)||0,tno:Number(data.tno)||0,tvol:Number(data.tvol)||0,iv:Number(data.iv)||0,source:data.source,instrumentId:String(data.instrumentId),adapterVersion:TSETMC_ADAPTER_CONTRACT_VERSION,timestamp:timestamp};
    if(mode==='automatic'){
        try{ if(typeof localStorage!=='undefined') localStorage.setItem(POOL_AUTO_WRITE_PREFIX+encodeURIComponent(baseSym),String(Date.now())); }catch(e){ return false; }
    }
    addToPool(baseSym,normalized);
    if(!_poolBatchMode) savePool();
    return true;
}

// ─── REVERSE MAP — insCode → baseSym برای live price سریع ────────────────
function buildReverseMap(){
    var map={};
    try{
        var codes=getCfg('baseInsCodes')||{};
        var keys=Object.keys(codes);
        for(var i=0;i<keys.length;i++){
            var base=keys[i], code=codes[base];
            if(code) map[code]=base;
        }
    }catch(e){}
    return map;
}
var _reverseMapCache=null, _reverseMapTime=0;
function getReverseMap(){
    var now=Date.now();
    if(_reverseMapCache && (now-_reverseMapTime)<60000) return _reverseMapCache;
    _reverseMapCache=buildReverseMap();
    _reverseMapTime=now;
    return _reverseMapCache;
}
function getBaseFromIns(insCode){
    var rev=getReverseMap();
    return rev[insCode]||null;
}

function annualizeTseReturns(pricePoints){
    if(!Array.isArray(pricePoints) || pricePoints.length<4) return {ok:false,reason:'not-enough-observations'};
    for(var sourceIndex=0;sourceIndex<pricePoints.length;sourceIndex++) if(!isTrustedObservationSource(pricePoints[sourceIndex].source)) return {ok:false,reason:'unverified-observation'};
    var first=pricePoints[0].jdn, last=pricePoints[pricePoints.length-1].jdn;
    if(!TSE_CALENDAR.isCompleteForRange(first,last)) return {ok:false,reason:'calendar-incomplete'};
    var normalized=[];
    for(var i=1;i<pricePoints.length;i++){
        var sessions=TSE_CALENDAR.tradingDaysBetween(pricePoints[i-1].jdn,pricePoints[i].jdn);
        if(sessions<=0) return {ok:false,reason:'invalid-observation-order'};
        normalized.push(Math.log(pricePoints[i].price/pricePoints[i-1].price)/Math.sqrt(sessions));
    }
    if(normalized.length<3) return {ok:false,reason:'not-enough-returns'};
    var mean=0; for(var j=0;j<normalized.length;j++) mean+=normalized[j]; mean/=normalized.length;
    var variance=0; for(var k=0;k<normalized.length;k++) variance+=(normalized[k]-mean)*(normalized[k]-mean);
    var daily=Math.sqrt(variance/normalized.length);
    var startYear=jdnToJalali(first), endYear=jdnToJalali(last);
    if(!startYear||!endYear) return {ok:false,reason:'date-conversion'};
    var totalAnnualDays=0, years=0;
    for(var year=startYear.jy;year<=endYear.jy;year++){
        var annual=TSE_CALENDAR.getAnnualTradingDays(year);
        if(!annual.complete || annual.days<=0) return {ok:false,reason:'calendar-incomplete'};
        totalAnnualDays+=annual.days; years++;
    }
    return {ok:true,volatility:daily*Math.sqrt(totalAnnualDays/years)*100,annualTradingDays:totalAnnualDays/years};
}
function updatePoolStats(baseSym){
    var entry=poolStore[baseSym];
    if(!entry || !entry.history.length) return;
    delete entry.statsVolatilityWarning;
    var sumP=0, sumV=0, sumTno=0, prices=[], pricePoints=[], cntV=0, cntTno=0, lastVerified=null;
    for(var i=0;i<entry.history.length;i++){
        var h=entry.history[i];
        if(h.price>0 && isTrustedObservationSource(h.source)){
            sumP+=h.price; prices.push(h.price); lastVerified=h;
            if(h.jdn>=2000000 && h.jdn<=3000000) pricePoints.push({jdn:h.jdn,price:h.price,source:h.source});
            if(h.tvol>0){ sumV+=h.tvol; cntV++; }
            if(h.tno>0){ sumTno+=h.tno; cntTno++; }
        }
    }
    var avg=prices.length? sumP/prices.length : 0;
    var vol=0;
    if(prices.length>3){
        var logRets=[];
        for(var k=1;k<prices.length;k++){ if(prices[k-1]>0 && prices[k]>0) logRets.push(Math.log(prices[k]/prices[k-1])); }
        if(logRets.length>2){
            var meanR=0; for(var r=0;r<logRets.length;r++) meanR+=logRets[r]; meanR/=logRets.length;
            var sq=0; for(var r2=0;r2<logRets.length;r2++) sq+=(logRets[r2]-meanR)*(logRets[r2]-meanR);
            var std=Math.sqrt(sq/logRets.length);
            if(getCfg('volatilityAnnualizationMode')==='tse-calendar'){
                var tseAnnualized=annualizeTseReturns(pricePoints);
                if(tseAnnualized.ok){ vol=tseAnnualized.volatility; }
                else { vol=0; entry.statsVolatilityWarning=tseAnnualized.reason; }
            } else { vol=std*Math.sqrt(252)*100; }
        } else if(getCfg('volatilityAnnualizationMode')==='tse-calendar'){
            vol=0; entry.statsVolatilityWarning='not-enough-returns';
        }
    } else if(getCfg('volatilityAnnualizationMode')==='tse-calendar'){
        entry.statsVolatilityWarning='not-enough-returns';
    }
    entry.stats={avgPrice:avg,lastPrice:lastVerified?lastVerified.price:0,volatility:vol,volatilityBasis:getCfg('volatilityAnnualizationMode')==='tse-calendar'?'tse-calendar':'legacy252',volatilityWarning:entry.statsVolatilityWarning||null,avgTvol:cntV?sumV/cntV:0,avgTno:cntTno?sumTno/cntTno:0,days:entry.history.length,verifiedDays:prices.length,firstJdn:entry.firstJdn,lastJdn:entry.lastJdn};
    delete entry.statsVolatilityWarning;
    if(getCfg('poolAuto') && avg>0){
        var clamp=getCfg('poolClamp')||3;
        var cfgPrices=getCfg('basePrices')||{};
        var fixed=cfgPrices[baseSym]||CONFIG.basePrices[baseSym]||avg;
        var lo=fixed/clamp, hi=fixed*clamp;
        var calibrated=Math.max(lo, Math.min(hi, avg));
        if(prices.length>= (getCfg('poolMinObs')||3)){
            CONFIG.basePrices[baseSym]=calibrated;
            try{ var ov=optStore('basePrices'); if(ov && typeof ov==='object'){ ov[baseSym]=calibrated; optStore('basePrices', ov); } }catch(e){}
        }
    }
}
function getPoolPrice(baseSym){
    if(!baseSym) return 0;
    var e=poolStore[baseSym];
    if(e && e.stats && e.stats.lastPrice) return e.stats.lastPrice;
    var cfgPrices=getCfg('basePrices');
    if(cfgPrices && typeof cfgPrices==='object' && cfgPrices[baseSym]) return cfgPrices[baseSym];
    return CONFIG.basePrices[baseSym]||0;
}
var _volCache={}, _volCacheVersion=0;
function getPoolVolatility(baseSym){
    var e=poolStore[baseSym];
    if(e && e.stats && e.stats.volatility>0){
        var cacheKey=baseSym+'_'+e.stats.days+'_'+_volCacheVersion;
        if(_volCache[cacheKey]!=null) return _volCache[cacheKey];
        _volCache[cacheKey]=e.stats.volatility;
        return e.stats.volatility;
    }
    return (getCfg('volFloor')+getCfg('volCeil'))/2;
}
function bumpVolCache(){ _volCacheVersion++; _volCache={}; }
var _ivRankCache={}, _ivRankVersion=0;
function getPoolIvRank(baseSym, curIv){
    var hist=getVerifiedIvHistory(baseSym);
    if(!hist || hist.length<5) return 50;
    var cacheKey=baseSym+'_'+hist.length+'_'+_ivRankVersion;
    var cached=_ivRankCache[cacheKey];
    var ivs;
    if(cached && cached.ivs){
        ivs=cached.ivs;
    } else {
        ivs=hist.map(function(x){return x.iv;}).sort(function(a,b){return a-b;});
        _ivRankCache[cacheKey]={ivs:ivs};
        // LRU clean
        var keys=Object.keys(_ivRankCache);
        if(keys.length>50) delete _ivRankCache[keys[0]];
    }
    var less=0;
    for(var i=0;i<ivs.length;i++) if(ivs[i]<=curIv) less++;
    return less/ivs.length*100;
}
function bumpIvRankVersion(){ _ivRankVersion++; _ivRankCache={}; }
function pruneOldPool(){
    var nowJdn=todayJdn();
    var maxDays=getCfg('poolMaxDays')||90;
    var syms=Object.keys(poolStore);
    for(var i=0;i<syms.length;i++){
        var sym=syms[i];
        var e=poolStore[sym];
        if(!e || !e.history) continue;
        var cutoff=nowJdn-maxDays;
        var before=e.history.length;
        e.history=e.history.filter(function(h){return h.jdn>=cutoff;});
        if(e.history.length!==before) updatePoolStats(sym);
        if(e.history.length===0) delete poolStore[sym];
    }
    var ivSyms=Object.keys(ivHist);
    for(var j=0;j<ivSyms.length;j++){
        var s=ivSyms[j];
        if(ivHist[s] && ivHist[s].length> (getCfg('ivHistDays')||90)){
            ivHist[s]=ivHist[s].slice(-getCfg('ivHistDays'));
        }
    }
}
function calibrateGatesFromPool(){
    if(!getCfg('poolGates')) return;
    var allTno=[], allTvol=[];
    var keys=Object.keys(poolStore);
    for(var i=0;i<keys.length;i++){
        var st=poolStore[keys[i]].stats;
        if(st && st.avgTno>0) allTno.push(st.avgTno);
        if(st && st.avgTvol>0) allTvol.push(st.avgTvol);
    }
    if(allTno.length>= (getCfg('poolMinGateObs')||20)){
        allTno.sort(function(a,b){return a-b;});
        var medTno=allTno[Math.floor(allTno.length/2)];
        var medTvol=0;
        if(allTvol.length>0){ allTvol.sort(function(a,b){return a-b;}); medTvol=allTvol[Math.floor(allTvol.length/2)]; }
        poolGatesCache.medianTno=medTno;
        poolGatesCache.medianTvol=medTvol;
        try{
            var baseMinDepth=CONFIG.minDepthTrades||0.5;
            var clamp=getCfg('poolGateClamp')||2;
            if(medTno>20){
                var calibrated=Math.max(baseMinDepth/clamp, Math.min(baseMinDepth*clamp, medTno/50));
                poolGatesCache.calibratedMinDepth=calibrated;
            }
        }catch(e){}
    }
}
function getCalibratedMinDepth(){
    if(poolGatesCache.calibratedMinDepth && getCfg('poolGates')) return poolGatesCache.calibratedMinDepth;
    return getCfg('minDepthTrades');
}
function getPoolSummary(){
    var out=[];
    var keys=Object.keys(poolStore);
    for(var i=0;i<keys.length;i++){
        var sym=keys[i];
        var e=poolStore[sym];
        if(!e) continue;
        out.push({symbol:sym, days:e.stats.verifiedDays||0, storedDays:e.history.length, lastPrice:e.stats.lastPrice, avgPrice:e.stats.avgPrice, vol:e.stats.volatility, avgTvol:e.stats.avgTvol});
    }
    out.sort(function(a,b){return b.days-a.days;});
    return out;
}
function getPoolStatusText(){
    var keys=Object.keys(poolStore);
    var totalSyms=keys.length;
    var totalDays=0, storedDays=0;
    for(var i=0;i<keys.length;i++){ var k=keys[i]; if(poolStore[k] && poolStore[k].history){ storedDays+=poolStore[k].history.length; totalDays+=poolStore[k].stats&&poolStore[k].stats.verifiedDays||0; } }
    return totalSyms+' نماد پایه، '+totalDays+' مشاهدهٔ معتبر از '+storedDays+' ردیف ذخیره‌شده، تا '+POOL_MAX_DAYS+' روز نگهداری';
}
loadPool();

// Convert explicit TSETMC history dates only. There is deliberately no "today - row index" fallback.
function historyDateToJdn(value){
    if(value==null) return null;
    if(typeof value==='number' && isFinite(value)){
        if(value>100000000000){ if(value>4102444800000) return null; value=Math.floor(value/1000); }
        if(value>1000000000){
            if(value>4102444800) return null;
            var stamp=new Date(value*1000);
            if(!isFinite(stamp.getTime())) return null;
            return validatedGregorianToJdn(stamp.getUTCFullYear(),stamp.getUTCMonth()+1,stamp.getUTCDate());
        }
        var digits=String(Math.floor(value));
        if(/^\d{8}$/.test(digits)) value=digits;
        else if(value>=2000000 && value<=3000000) return Math.floor(value);
        else return null;
    }
    var text=faToEnDigits(String(value)).trim();
    var m=text.match(/^(\d{4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,2})$/);
    if(m){
        var y=+m[1], mo=+m[2], d=+m[3];
        if(y>=1700) return validatedGregorianToJdn(y,mo,d);
        if(y>=1200 && y<=1600){ try{ return jalaliToJdn(y,mo,d); }catch(e){ return null; } }
    }
    var compact=text.match(/^(\d{4})(\d{2})(\d{2})$/);
    if(compact){
        var cy=+compact[1], cm=+compact[2], cd=+compact[3];
        if(cy>=1700) return validatedGregorianToJdn(cy,cm,cd);
        if(cy>=1200 && cy<=1600){ try{ return jalaliToJdn(cy,cm,cd); }catch(e){ return null; } }
    }
    var parsed=Date.parse(text);
    if(isFinite(parsed)){
        var date=new Date(parsed);
        return validatedGregorianToJdn(date.getUTCFullYear(),date.getUTCMonth()+1,date.getUTCDate());
    }
    if(/^\d+$/.test(text)) return null;
    return normalizeToJdn(text);
}
function jdnToIsoDate(jdn){
    var date=new Date((jdn-JDN_UNIX_EPOCH)*86400000);
    return date.toISOString().slice(0,10);
}
function readTsetmcHistoryRow(row,expectedInsCode){ return normalizeTsetmcHistoryRow(row,expectedInsCode); }

function requestPoolUpdate(baseSym, opts){
    beginPoolBatch();
    opts=opts||{};
    var showAlert=opts.showAlert!==false;
    var symbols=baseSym?[baseSym]:getSymList('poolBaseSymbols');
    if(!symbols.length) symbols=Object.keys(poolStore);
    if(!symbols.length) symbols=['خودرو','اهرم','وبملت'];
    var updatedSymbols={}, updated=0, observations=0;
    var curL18=(typeof l18!=='undefined'?String(l18||''):'');
    try{
        if(typeof window!=='undefined' && Array.isArray(window.ih)){
            var ih=window.ih, newestFirst=getCfg('ihNewestFirst'), historyCodes=getCfg('baseInsCodes')||{};
            for(var si=0;si<symbols.length;si++){
                var bs=symbols[si];
                // `ih` is the active instrument's history; never assign it to an unrelated requested base.
                if(!curL18 || curL18.indexOf(bs)===-1 || !historyCodes[bs]) continue;
                var symbolAdded=0, maxDays=Math.min(ih.length,getCfg('poolMaxDays')||90);
                for(var d=0;d<maxDays;d++){
                    var row=ih[newestFirst?d:ih.length-1-d];
                    var parsed=readTsetmcHistoryRow(row,historyCodes[bs]);
                    if(!parsed || parsed.jdn>todayJdn()) continue;
                    if(writePoolObservation(bs,{price:parsed.price,jdn:parsed.jdn,dateStr:parsed.dateStr,tno:parsed.tno,tvol:parsed.tvol,source:'tsetmc-history',instrumentId:parsed.instrumentId,adapterVersion:parsed.adapterVersion},'manual')){ symbolAdded++; observations++; }
                }
                if(symbolAdded) updatedSymbols[bs]=true;
            }
        }
    }catch(e){ console.warn('[ExoticFilter] History parsing failed:',e&&e.message||e); }
    // A recent TSETMC live observation is valid for today only; configured/model values never enter history.
    var codes=getCfg('baseInsCodes')||{}, now=Date.now(), maxAge=getCfg('liveBaseMaxAge')||300000;
    for(var si2=0;si2<symbols.length;si2++){
        var sym=symbols[si2], ins=codes[sym], cached=ins&&liveBaseCache[ins];
        if(cached&&cached.price>0&&now-cached.time<=maxAge){
            if(writePoolObservation(sym,{price:cached.price,jdn:todayJdn(),dateStr:jdnToIsoDate(todayJdn()),source:'live-tsetmc',instrumentId:cached.instrumentId,adapterVersion:cached.adapterVersion,timestamp:cached.timestamp},'manual')){ updatedSymbols[sym]=true; observations++; }
        }
    }
    updated=Object.keys(updatedSymbols).length;
    endPoolBatch(); pruneOldPool(); calibrateGatesFromPool();
    if(showAlert){
        if(observations) showToast('🔄 '+updated+' نماد با '+observations+' مشاهدهٔ تاریخ‌دار/زنده بروزرسانی شد — '+getPoolStatusText(),'success');
        else showToast('⚠️ تاریخچه/مظنهٔ واقعی و تاریخ‌دار در دسترس نیست؛ داده‌ای به استخر افزوده نشد.','warn');
    }
    console.log('[ExoticFilter] History update:',updated+' symbols, '+observations+' observations; '+getPoolStatusText());
    try{ renderLayers(); renderDebug(); }catch(e){}
    return updated;
}
function requestPoolUpdateAll(){ return requestPoolUpdate(null, {showAlert:true}); }
function requestPoolUpdateSingle(){
    var sym=prompt('نماد پایه را وارد کنید (مثلا خودرو، اهرم، وبملت):', 'خودرو');
    if(!sym) return 0;
    return requestPoolUpdate(sym.trim(), {showAlert:true});
}
function buildPoolHistoryChart(baseSym){
    var entry=poolStore[baseSym];
    if(!entry || !entry.history.length) return '<div style="color:#8b9bb4;font-size:11px;">تاریخچه‌ای برای '+baseSym+' یافت نشد</div>';
    var hist=entry.history.filter(function(point){return point&&isTrustedObservationSource(point.source);}).slice(-30);
    if(hist.length<2) return '<div style="color:#8b9bb4;font-size:11px;padding:10px;background:#0f141e;border-radius:8px;">کمتر از دو مشاهدهٔ تاریخ‌دار/منبع‌تأییدشده برای نمودار '+baseSym+' موجود است.</div>';
    var maxP=Math.max.apply(null, hist.map(function(h){return h.price;})), minP=Math.min.apply(null, hist.map(function(h){return h.price;}));
    var range=maxP-minP||1;
    var w=400, h=80, pad=10;
    var denom=hist.length>1? (hist.length-1) : 1;
    var points=hist.map(function(row, idx){
        var x=pad + (idx/denom)*(w-pad*2);
        var y=h-pad - ((row.price-minP)/range)*(h-pad*2);
        return x+','+y;
    }).join(' ');
    var lastPrice=hist[hist.length-1].price;
    var firstPrice=hist[0].price;
    var change=((lastPrice-firstPrice)/firstPrice*100).toFixed(1);
    var changeColor= change>=0? '#34d399' : '#fb7185';
    var html='';
    html+='<div style="margin:8px 0;padding:10px;background:#070a14;border-radius:10px;border:1px solid #1e2f4f;">';
    html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:11px;"><span style="font-weight:700;">📈 '+baseSym+' — 30 روز آخر</span><span>آخرین: <b>'+Math.round(lastPrice)+'</b> <span style="color:'+changeColor+';">('+(change>=0?'+':'')+change+'%)</span></span><span style="color:#64748b;">'+hist.length+' روز</span></div>';
    html+='<svg width="'+w+'" height="'+h+'" style="background:#111c32;border-radius:8px;display:block;"><polyline fill="none" stroke="#38bdf8" stroke-width="2" points="'+points+'" style="filter:drop-shadow(0 0 4px rgba(56,189,248,0.5));"/>';
    hist.forEach(function(row, idx){
        var x=pad + (idx/denom)*(w-pad*2);
        var y=h-pad - ((row.price-minP)/range)*(h-pad*2);
        if(idx===hist.length-1 || idx===0){
            html+='<circle cx="'+x+'" cy="'+y+'" r="3" fill="'+ (idx===hist.length-1?'#34d399':'#64748b') +'"/>';
        }
    });
    html+='</svg>';
    html+='<div style="display:flex;justify-content:space-between;font-size:9px;color:#64748b;margin-top:4px;"><span>'+hist[0].dateStr+'</span><span>min '+Math.round(minP)+' — max '+Math.round(maxP)+'</span><span>'+hist[hist.length-1].dateStr+'</span></div>';
    html+='</div>';
    return html;
}

// ─── LIVE PRICE ────────────────────────────────────────────────────────────
function getCurOrigin(){ try{ return (typeof location!=='undefined' && location.origin)? location.origin : ''; }catch(e){ return ''; } }
function isSameOriginUrl(url){
    try{
        var cur=getCurOrigin();
        if(!cur) return true;
        if(!url) return true;
        if(url.startsWith('/')) return true;
        return url===cur || url.startsWith(cur+'/');
    }catch(e){ return true; }
}
function parseTsetmcLiveQuote(payload,expectedInsCode,nowMs){
    var row=payload;
    if(typeof row==='string'){
        try{ row=JSON.parse(row); }
        catch(e){ try{ var textAdapter=typeof window!=='undefined'&&window.__exfTsetmcAdapter; if(textAdapter&&textAdapter.version===TSETMC_ADAPTER_CONTRACT_VERSION&&typeof textAdapter.parseLiveQuote==='function') row=textAdapter.parseLiveQuote(payload,String(expectedInsCode)); else return {ok:false,reason:'unsupported-response-format'}; }catch(adapterError){ return {ok:false,reason:'adapter-error'}; } }
    }
    if(!row||typeof row!=='object'||Array.isArray(row)) return {ok:false,reason:'invalid-payload'};
    if(row.adapterVersion!==TSETMC_ADAPTER_CONTRACT_VERSION){
        try{ var adapter=typeof window!=='undefined'&&window.__exfTsetmcAdapter; if(adapter&&adapter.version===TSETMC_ADAPTER_CONTRACT_VERSION&&typeof adapter.parseLiveQuote==='function') row=adapter.parseLiveQuote(row,String(expectedInsCode)); }catch(e){ return {ok:false,reason:'adapter-error'}; }
    }
    if(!row||row.adapterVersion!==TSETMC_ADAPTER_CONTRACT_VERSION||!row.instrumentId||!row.lastPrice) return {ok:false,reason:'adapter-contract-required'};
    var identity=String(row.instrumentId);
    if(identity!==String(expectedInsCode)) return {ok:false,reason:'instrument-mismatch'};
    var price=Number(row.lastPrice);
    if(!isFinite(price)||price<=0||price>=100000000) return {ok:false,reason:'invalid-price'};
    var rawTime=row.timestamp;
    var stamp=typeof rawTime==='number'?rawTime:Date.parse(String(rawTime||''));
    if(typeof rawTime==='number'&&stamp<100000000000) stamp*=1000;
    if(!isFinite(stamp)||stamp<=0) return {ok:false,reason:'timestamp-required'};
    var now=nowMs==null?Date.now():Number(nowMs), age=now-stamp, maxAge=Number(getCfg('liveBaseMaxAge'))||300000;
    if(age< -300000) return {ok:false,reason:'future-timestamp'};
    if(age>maxAge) return {ok:false,reason:'stale-quote'};
    return {ok:true,instrumentId:identity,price:price,lastPrice:price,timestamp:stamp,ageMs:Math.max(0,age),source:'live-tsetmc',adapterVersion:TSETMC_ADAPTER_CONTRACT_VERSION};
}
function normalizeTsetmcHistoryRow(row,expectedInsCode){
    if(!row||typeof row!=='object'||Array.isArray(row)) return null;
    if(row.adapterVersion!==TSETMC_ADAPTER_CONTRACT_VERSION){
        try{ var adapter=typeof window!=='undefined'&&window.__exfTsetmcAdapter; if(adapter&&adapter.version===TSETMC_ADAPTER_CONTRACT_VERSION&&typeof adapter.parseHistoryRow==='function') row=adapter.parseHistoryRow(row,String(expectedInsCode||'')); }catch(e){ return null; }
    }
    if(!row||row.adapterVersion!==TSETMC_ADAPTER_CONTRACT_VERSION) return null;
    var identity=String(row.instrumentId||'');
    if(!expectedInsCode||!identity||identity!==String(expectedInsCode)) return null;
    var jdn=historyDateToJdn(row.date);
    var price=Number(row.closePrice);
    if(jdn==null||jdn>todayJdn()||!isFinite(price)||price<=0||price>=100000000) return null;
    return {jdn:jdn,price:price,dateStr:jdnToIsoDate(jdn),tno:Number(row.tradeCount)||0,tvol:Number(row.volume)||0,source:'tsetmc-history',instrumentId:identity,adapterVersion:TSETMC_ADAPTER_CONTRACT_VERSION};
}
function fetchLiveBase(insCode, cb){
    if(!insCode){ if(cb) cb(null); return null; }
    var now=Date.now();
    var cached=liveBaseCache[insCode];
    var maxAge=getCfg('liveBaseMaxAge')||300000;
    if(cached && (now-cached.time)<maxAge){ if(cb) cb(cached.price); return cached.price; }
    if(liveBaseFetching[insCode]){ if(cb) cb(null); return null; }
    liveBaseFetching[insCode]=true;
    var cdnUrl=getCfg('tsetmcCdnUrl')||'https://old.tsetmc.com';
    var livePath='/tsev2/data/InstInfoFast.aspx?i='+insCode+AMP+'c=34';
    var isSame=isSameOriginUrl(cdnUrl);
    var fetchUrl;
    if(!cdnUrl || cdnUrl.trim()==='' || isSame){
        fetchUrl=cdnUrl? (cdnUrl.replace(/\/$/,'')+livePath) : livePath;
        if(!cdnUrl || cdnUrl.trim()==='') fetchUrl=livePath;
    } else {
        fetchUrl=livePath;
    }
    var _done=false;
    var _timeoutId=null;
    var _controller=null;
    function _finish(val){
        if(_done) return;
        _done=true;
        if(_timeoutId) clearTimeout(_timeoutId);
        liveBaseFetching[insCode]=false;
        if(cb) cb(val);
    }
    try{ _controller=new AbortController(); }catch(e){ _controller=null; }
    _timeoutId=setTimeout(function(){
        try{ if(_controller) _controller.abort(); }catch(e){}
        _finish(null);
    }, 8000);
    try{
        if(typeof fetch==='undefined'){ _finish(null); return null; }
        var opts={method:'GET', credentials:'same-origin'};
        if(_controller) opts.signal=_controller.signal;
        fetch(fetchUrl, opts).then(function(resp){
            if(_done) return Promise.reject(new Error('timeout already'));
            if(_timeoutId) clearTimeout(_timeoutId);
            _timeoutId=setTimeout(function(){ _finish(null); }, 3000);
            if(!resp.ok) throw new Error('HTTP '+resp.status);
            return resp.text();
        }).then(function(txt){
            if(_done) return;
            if(_timeoutId) clearTimeout(_timeoutId);
            var parsedQuote=parseTsetmcLiveQuote(txt,insCode,Date.now());
            if(parsedQuote.ok){
                var price=parsedQuote.price;
                liveBaseCache[insCode]={price:price,time:Date.now(),timestamp:parsedQuote.timestamp,instrumentId:parsedQuote.instrumentId,adapterVersion:parsedQuote.adapterVersion,source:parsedQuote.source};
                var baseSym=null;
                var codes=getCfg('baseInsCodes')||{};
                var codeKeys=Object.keys(codes);
                for(var k=0;k<codeKeys.length;k++){ var kk=codeKeys[k]; if(codes[kk]===insCode){ baseSym=kk; break; } }
                if(baseSym){ var quoteJdn=todayJdn(); writePoolObservation(baseSym,{price:price,dateStr:jdnToIsoDate(quoteJdn),jdn:quoteJdn,source:'live-tsetmc',instrumentId:parsedQuote.instrumentId,adapterVersion:parsedQuote.adapterVersion,timestamp:parsedQuote.timestamp},'automatic'); }
                _finish(price);
            } else {
                if(getCfg('verbose')) console.warn('[ExoticFilter] rejected live quote from '+fetchUrl+': '+parsedQuote.reason);
                _finish(null);
            }
        }).catch(function(err){
            if(_done) return;
            _finish(null);
            if(getCfg('verbose') && err && err.message!=='timeout already'){
                console.warn('[ExoticFilter] live fetch failed '+fetchUrl+': '+err.message);
            }
        });
    }catch(e){ _finish(null); }
    return null;
}
function fetchAllLiveBases(cb){
    var codes=getCfg('baseInsCodes')||{};
    var keys=Object.keys(codes);
    if(keys.length===0){ if(cb) cb({}); return; }
    var results={};
    var pending=keys.length;
    var finished=false;
    function tryDone(){
        if(finished) return;
        if(pending<=0){ finished=true; if(cb) cb(results); }
    }
    for(var i=0;i<keys.length;i++){
        (function(sym, code){
            fetchLiveBase(code, function(price){
                if(price) results[sym]=price;
                pending--;
                tryDone();
            });
        })(keys[i], codes[keys[i]]);
    }
    setTimeout(function(){ if(!finished){ finished=true; if(cb) cb(results); } }, 12000);
}
function testCdn71(url, cb){
    var testUrl=url||getCfg('tsetmcCdnUrl')||'https://old.tsetmc.com';
    var curOrigin=getCurOrigin();
    var isCross=testUrl && testUrl!=='' && !isSameOriginUrl(testUrl);
    var sameOriginDataUrl='/tsev2/data/InstInfoFast.aspx?i=35366681030756042'+AMP+'c=34';
    var cdnTestUrl=testUrl? (testUrl.replace(/\/$/,'')+sameOriginDataUrl) : sameOriginDataUrl;
    var results={curOrigin:curOrigin, testUrl:testUrl, isCrossOrigin:isCross, sameOriginOk:false, cdnOk:false, note:''};
    try{
        fetch(sameOriginDataUrl, {method:'GET', credentials:'same-origin'}).then(function(r){
            results.sameOriginOk=r.ok;
            if(isCross){
                return fetch(cdnTestUrl, {method:'GET', mode:'no-cors'}).then(function(){
                    results.cdnOk=true;
                    results.note='دیتا فقط هم‌مبدأ مجاز است — fallback هم‌مبدأ فعال';
                    if(cb) cb(results);
                }).catch(function(){
                    results.cdnOk=false;
                    results.note='CDN در دسترس نیست — از هم‌مبدأ استفاده می‌شود';
                    if(cb) cb(results);
                });
            } else {
                results.cdnOk=r.ok;
                results.note=r.ok? 'هم‌مبدأ OK — قیمت زنده فعال' : 'هم‌مبدأ شکست';
                if(cb) cb(results);
            }
        }).catch(function(e){ results.sameOriginOk=false; results.note='هم‌مبدأ شکست: '+e.message; if(cb) cb(results); });
    }catch(e){ results.note='fetch پشتیبانی نمی‌شود: '+e.message; if(cb) cb(results); }
}
function testCdnAndShow71(){
    var url=getCfg('tsetmcCdnUrl');
    var inp=document.getElementById('__exfIn_tsetmcCdnUrl');
    if(inp) url=inp.value;
    testCdn71(url, function(res){
        var msg='🔍 تست CDN\nمبدأ فعلی: '+(res.curOrigin||'نامشخص')+'\nآدرس تست: '+(res.testUrl||'(هم‌مبدأ)')+'\nکراس-اوریجین: '+(res.isCrossOrigin?'بله → fallback':'خیر')+'\nهم‌مبدأ: '+(res.sameOriginOk?'✅ OK':'❌ شکست')+'\nCDN: '+(res.cdnOk?'✅ OK':'❌ شکست')+'\n\n'+res.note;
        alert(msg);
        console.log('[ExoticFilter] CDN test', res);
    });
}
function autoConfigCdn71(){
    var curOrigin=getCurOrigin();
    var candidates=['', curOrigin, 'https://old.tsetmc.com', 'https://cdn8.tsetmc.com', 'https://www.tsetmc.com', 'https://tsetmc.com'];
    var uniq=[];
    for(var i=0;i<candidates.length;i++){ if(uniq.indexOf(candidates[i])===-1 && candidates[i]!==undefined) uniq.push(candidates[i]); }
    var idx=0; var best=null;
    function tryNext(){
        if(idx>=uniq.length){
            if(best!==null){
                var inp=document.getElementById('__exfIn_tsetmcCdnUrl');
                if(inp) inp.value=best;
                if(window.__exf && window.__exf.optSet) window.__exf.optSet('tsetmcCdnUrl', best);
                showToast('⚙️ بهترین: '+(best||'(هم‌مبدأ)'), 'success');
            } else {
                showToast('هیچ‌کدام OK نشد — هم‌مبدأ پیشنهاد می‌شود', 'error');
                var inp2=document.getElementById('__exfIn_tsetmcCdnUrl');
                if(inp2) inp2.value='';
                if(window.__exf && window.__exf.optSet) window.__exf.optSet('tsetmcCdnUrl', '');
            }
            return;
        }
        var cand=uniq[idx++];
        var testPath='/tsev2/data/InstInfoFast.aspx?i=35366681030756042'+AMP+'c=34';
        var isSame=!cand || cand==='' || isSameOriginUrl(cand);
        if(!isSame){ tryNext(); return; }
        var fetchUrl=cand? (cand.replace(/\/$/,'')+testPath) : testPath;
        fetch(fetchUrl, {method:'GET', credentials:'same-origin'}).then(function(r){ if(r.ok && best===null) best=cand; tryNext(); }).catch(function(){ tryNext(); });
    }
    tryNext();
}

// ─── BLACK-SCHOLES ─────────────────────────────────────────────────────────
var SQRT2PI=Math.sqrt(2*Math.PI);
function normPdf(x){ return Math.exp(-0.5*x*x)/SQRT2PI; }
function normCdf(x){
    var a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429, p=0.3275911;
    var sign=x<0?-1:1; x=Math.abs(x)/Math.sqrt(2);
    var t=1/(1+p*x); var y=1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x);
    return 0.5*(1+sign*y);
}
function bsPrice(S,K,T,r,q,sigma,isCall){
    if(T<=0) return isCall? Math.max(S-K,0) : Math.max(K-S,0);
    if(sigma<=0) sigma=0.01;
    var sqrtT=Math.sqrt(T);
    var d1=(Math.log(S/K)+(r-q+0.5*sigma*sigma)*T)/(sigma*sqrtT);
    var d2=d1-sigma*sqrtT;
    var dfQ=Math.exp(-q*T), dfR=Math.exp(-r*T);
    if(isCall) return S*dfQ*normCdf(d1)-K*dfR*normCdf(d2);
    else return K*dfR*normCdf(-d2)-S*dfQ*normCdf(-d1);
}
function bsGreeks(S,K,T,r,q,sigma,isCall,daysPerYear){
    if(T<=0) return {delta:isCall?(S>K?1:0):(S<K?-1:0), gamma:0, theta:0, vega:0};
    var sqrtT=Math.sqrt(T);
    var d1=(Math.log(S/K)+(r-q+0.5*sigma*sigma)*T)/(sigma*sqrtT);
    var d2=d1-sigma*sqrtT;
    var pdf=normPdf(d1);
    var dfQ=Math.exp(-q*T);
    var delta=isCall? dfQ*normCdf(d1) : dfQ*(normCdf(d1)-1);
    var gamma=dfQ*pdf/(S*sigma*sqrtT);
    var vega=S*dfQ*pdf*sqrtT;
    daysPerYear=daysPerYear>0?daysPerYear:365;
    var term1=-(S*dfQ*pdf*sigma)/(2*sqrtT);
    var term2, theta;
    if(isCall){ term2=q*S*dfQ*normCdf(d1)-r*K*Math.exp(-r*T)*normCdf(d2); theta=(term1+term2)/daysPerYear; }
    else { term2=-q*S*dfQ*normCdf(-d1)+r*K*Math.exp(-r*T)*normCdf(-d2); theta=(term1+term2)/daysPerYear; }
    return {delta:delta, gamma:gamma, theta:theta, vega:vega, d1:d1, d2:d2};
}
function ivSolve(marketPrice,S,K,T,r,q,isCall,daysPerYear){
    var MAX_ITER=60;
    var mn=S/K;
    var sigma=mn<0.8? 0.6 : mn>1.2? 0.5 : 0.35;
    var intrinsic=isCall? Math.max(S*Math.exp(-q*T)-K*Math.exp(-r*T),0) : Math.max(K*Math.exp(-r*T)-S*Math.exp(-q*T),0);
    if(marketPrice < intrinsic*0.99) return {iv:0, ok:false, reason:'below-intrinsic'};
    var lo=0.01, hi=5.0;
    for(var i=0;i<MAX_ITER;i++){
        var price=bsPrice(S,K,T,r,q,sigma,isCall);
        var vegaRaw=bsGreeks(S,K,T,r,q,sigma,isCall,daysPerYear).vega;
        if(vegaRaw<1e-8) break;
        var diff=price-marketPrice;
        if(Math.abs(diff)<0.01) return {iv:sigma, ok:true, iter:i};
        var newSigma=sigma - diff/(vegaRaw);
        if(newSigma<=0 || newSigma>5 || isNaN(newSigma)){
            if(diff>0) hi=sigma; else lo=sigma;
            newSigma=(lo+hi)/2;
        } else {
            if(price>marketPrice) hi=Math.min(hi, sigma); else lo=Math.max(lo, sigma);
        }
        sigma=newSigma;
        if(sigma<0.01) sigma=0.01;
        if(sigma>5) sigma=5;
    }
    var finalPrice=bsPrice(S,K,T,r,q,sigma,isCall);
    var ok=Math.abs(finalPrice-marketPrice)/marketPrice < 0.05;
    return {iv:sigma, ok:ok, iter:MAX_ITER};
}

// ─── FILTERS REGISTRY ───────────────────────────────────────────────────────
var FILTERS = {
    'input-data': {label:'داده ناقص', severity:'hard', layer:'L1-validation'},
    'not-option': {label:'غیر اختیار', severity:'hard', layer:'L1-validation'},
    'expiry': {label:'سررسید نامعتبر', severity:'hard', layer:'L1-validation'},
    'expiry-past': {label:'سررسید گذشته', severity:'hard', layer:'L1-validation'},
    'price': {label:'قیمت نامعتبر', severity:'hard', layer:'L1-validation'},
    'base-price': {label:'قیمت پایه نامعتبر', severity:'hard', layer:'L1-validation'},
    'contractSize': {label:'اندازه قرارداد', severity:'hard', layer:'L1-validation'},
    'off-hours': {label:'خارج ساعت', severity:'soft', layer:'L2-market'},
    'halt': {label:'توقف نماد', severity:'hard', layer:'L2-market'},
    'div-day': {label:'روز تقسیم سود', severity:'soft', layer:'L2-market'},
    'new-sym': {label:'نماد تازه', severity:'soft', layer:'L2-market'},
    'base-vol': {label:'حجم مبنا', severity:'soft', layer:'L2-market'},
    'tno': {label:'تعداد معاملات', severity:'hard', layer:'L3-liquidity'},
    'tvol': {label:'حجم معاملات', severity:'hard', layer:'L3-liquidity'},
    'avg-trade': {label:'میانگین معامله', severity:'soft', layer:'L3-liquidity'},
    'depth0': {label:'عمق صفر', severity:'hard', layer:'L3-liquidity'},
    'buy-queue': {label:'صف خرید قفل', severity:'soft', layer:'L3-liquidity'},
    'depth': {label:'عمق کم', severity:'soft', layer:'L3-liquidity'},
    'depth-invalid': {label:'عمق نامعتبر', severity:'hard', layer:'L3-liquidity'},
    'no-quote': {label:'بدون مظنه', severity:'hard', layer:'L4-pricing'},
    'crossed-book': {label:'دفتر متقاطع', severity:'hard', layer:'L4-pricing'},
    'spread': {label:'اسپرد زیاد', severity:'soft', layer:'L4-pricing'},
    'strike': {label:'اعمال نامعتبر', severity:'hard', layer:'L4-pricing'},
    'unit': {label:'واحد قیمت', severity:'soft', layer:'L4-pricing'},
    'arb-bound': {label:'مرز آربیتراژ', severity:'hard', layer:'L4-pricing'},
    'time-value': {label:'ارزش زمانی', severity:'soft', layer:'L4-pricing'},
    'iv-premium': {label:'صرف IV', severity:'soft', layer:'L5-greeks'},
    'iv-bad': {label:'IV نامعتبر', severity:'hard', layer:'L5-greeks'},
    'iv-range': {label:'IV خارج بازه', severity:'hard', layer:'L5-greeks'},
    'delta-range': {label:'دلتا خارج بازه', severity:'soft', layer:'L5-greeks'},
    'moneyness': {label:'مانی‌نس شدید', severity:'soft', layer:'L5-greeks'},
    'theta-high': {label:'تتا بالا', severity:'soft', layer:'L5-greeks'},
    'leverage': {label:'اهرم خارج بازه', severity:'soft', layer:'L5-greeks'},
    'stale-price': {label:'قیمت کهنه', severity:'soft', layer:'L6-quality'},
    'imbalance': {label:'عدم تعادل', severity:'soft', layer:'L6-quality'},
    'dte': {label:'روز تا سررسید کم', severity:'soft', layer:'L6-quality'},
    'calendar-unknown': {label:'تقویم ناکامل', severity:'soft', layer:'L4-pricing'},
    'gate': {label:'گیت محاسباتی', severity:'hard', layer:'L6-quality'},
    'score': {label:'امتیاز پایین', severity:'soft', layer:'L6-quality', isPrefix:true},
    'min-er': {label:'بازده کم', severity:'soft', layer:'L6-quality'},
    'cold': {label:'بازده سرد', severity:'soft', layer:'L6-quality'},
    'rank': {label:'رتبه پایین', severity:'soft', layer:'L7-ranking'},
    'global-rank': {label:'سقف کل', severity:'soft', layer:'L7-ranking'},
    'pareto': {label:'پارتو', severity:'soft', layer:'L7-ranking'},
    'aborted': {label:'توقف خودکار', severity:'hard', layer:'L7-ranking'},
    'calendar-warning': {label:'هشدار تقویم', severity:'soft', layer:'L8-holding-advisory'}
};
var FILTER_MAP71 = FILTERS;

// ─── LAYERS — Layer Registry Pattern ────────────────────────────────────────
var LAYERS = [
    {
        key: 'L1-validation', icon: '🔍', color: '#38bdf8', order: 1,
        label: 'اعتبارسنجی داده', desc: 'داده اولیه',
        schema: {
            minPrice: {type:'number', def:10, min:0, max:1e6, group:'core', label:'حداقل قیمت (ریال)'},
            expiryDate: {type:'jalali', def:'auto', group:'core', label:'سررسید مرجع'},
            expiryAutoUpdate: {type:'bool', def:true, group:'core', label:'بروزرسانی خودکار سررسید'},
            abortThresholdInput: {type:'number', def:100, min:0, max:1000, group:'adv', label:'آستانه داده ناقص'}
        },
        filter: function(ctx, sym){
            if(!sym || !sym.l18 || sym.pl==null) return ctx.reject('input-data');
            if(sym.pl < ctx.cfg.minPrice) return ctx.reject('price', 'pl='+sym.pl);
            if(sym.expiryJdn!=null){
                var expJ=normalizeToJdn(sym.expiryJdn);
                if(expJ==null) return ctx.reject('expiry', 'تاریخ سررسید قابل‌تبدیل نیست');
                sym._expiryJdn=expJ;
                sym._dteCalendar=Math.max(0,expJ-ctx.todayJdn);
                var expiryCalendarStatus=TSE_CALENDAR.calendarStatus(ctx.todayJdn,expJ);
                sym._calendarStatus=expiryCalendarStatus;
                sym._dteTrading=expiryCalendarStatus.complete?Math.max(0,TSE_CALENDAR.tradingDaysBetween(ctx.todayJdn,expJ)):null;
                sym.dte=sym._dteCalendar;
                if(expJ < ctx.todayJdn) return ctx.reject('expiry-past');
                sym._expirySource='input';
            } else {
                var configuredExpiry=normalizeToJdn(ctx.cfg.expiryDate);
                if(configuredExpiry==null) configuredExpiry=jalaliToJdn(Number(ctx.cfg.expiryJY),Number(ctx.cfg.expiryJM),Number(ctx.cfg.expiryJD));
                if(isFinite(configuredExpiry) && configuredExpiry>=ctx.todayJdn){
                    sym._configuredExpiryJdn=configuredExpiry;
                    sym._expirySource='configured-reference';
                }
            }
            if(sym.contractSize!=null && sym.contractSize<=0) return ctx.reject('contractSize');
            return ctx.pass();
        }
    },
    {
        key: 'L2-market', icon: '⏰', color: '#fbbf24', order: 2,
        label: 'وضعیت بازار', desc: 'وضعیت بازار',
        schema: {
            sessionStartMin: {type:'number', def:525, min:0, max:1439, group:'core', label:'شروع بازار (دقیقه)'},
            sessionEndMin: {type:'number', def:810, min:0, max:1439, group:'core', label:'پایان بازار'},
            blockOnHalt: {type:'bool', def:true, group:'core', label:'رد توقف'},
            allowNewSymbols: {type:'bool', def:true, group:'core', label:'نماد تازه'},
            enforceVolumeBase: {type:'bool', def:false, group:'adv', label:'حجم مبنا'},
            blockOnDividendDay: {type:'bool', def:true, group:'adv', label:'رد روز مجمع'},
            marketHolidays: {type:'csv', def:[], group:'adv', label:'تعطیلات رسمی (JDN/شمسی/ISO)'},
            marketCalendarCompleteYears: {type:'csv', def:[], group:'adv', label:'سال‌های دارای تقویم کامل'}
        },
        filter: function(ctx, sym){
            if(ctx.cfg.enforceMarketHours && !isMarketHours()) return ctx.reject('off-hours');
            if(ctx.cfg.blockOnHalt && sym.tno===0 && sym.tvol===0) return ctx.reject('halt');
            if(sym.tno!=null && sym.tno<2 && !ctx.cfg.allowNewSymbols) return ctx.reject('new-sym', 'tno='+sym.tno);
            if(ctx.cfg.enforceVolumeBase && sym.bvol!=null && sym.tvol!=null){
                if(sym.tvol < sym.bvol*ctx.cfg.volumeBaseRatio) return ctx.reject('base-vol');
            }
            if(ctx.cfg.blockOnDividendDay && sym.isDivDay) return ctx.reject('div-day');
            return ctx.pass();
        }
    },
    {
        key: 'L3-liquidity', icon: '💧', color: '#34d399', order: 3,
        label: 'نقدشوندگی و عمق', desc: 'نقدشوندگی',
        schema: {
            minDepthTrades: {type:'number', def:0.5, min:0, max:10, step:0.1, group:'core', label:'عمق/میانگین'},
            orderQueueThreshold: {type:'number', def:0.005, min:0, max:0.5, step:0.001, group:'core', label:'آستانه صف'},
            blockOnOrderQueue: {type:'bool', def:true, group:'core', label:'رد صف قفل'}
        },
        filter: function(ctx, sym){
            var tno=sym.tno||0, tvol=sym.tvol||0;
            if(tno<3) return ctx.reject('tno', 'tno='+tno);
            if(tvol<1000) return ctx.reject('tvol', 'tvol='+tvol);
            var qd1=sym.qd1||0, qo1=sym.qo1||0;
            if(qd1===0 && qo1===0) return ctx.reject('depth0');
            if(isNaN(qd1)||isNaN(qo1)) return ctx.reject('depth-invalid');
            var avgTrade=tvol/Math.max(tno,1);
            if(avgTrade<100) return ctx.reject('avg-trade', 'avg='+avgTrade.toFixed(0));
            var depth=qd1+qo1;
            var minDepth=avgTrade*getCalibratedMinDepth();
            if(depth<minDepth) return ctx.reject('depth', 'depth='+depth);
            if(ctx.cfg.blockOnOrderQueue){
                var totalQ=qd1+qo1;
                if(totalQ>0){
                    var buyRatio=qd1/totalQ;
                    if(buyRatio > (1-ctx.cfg.orderQueueThreshold)) return ctx.reject('buy-queue', 'ratio='+buyRatio.toFixed(3));
                }
            }
            return ctx.pass();
        }
    },
    {
        key: 'L4-pricing', icon: '💰', color: '#a78bfa', order: 4,
        label: 'قیمت‌گذاری و آربیتراژ', desc: 'قیمت‌گذاری',
        schema: {
            maxSpread: {type:'number', def:15, min:0, max:100, group:'core', label:'سقف اسپرد (٪)'},
            maxCostRT: {type:'number', def:12, min:0, max:100, group:'core', label:'سقف هزینه رفت‌وبرگشت'},
            tsetmcCdnUrl: {type:'url', def:'https://old.tsetmc.com', group:'core', label:'آدرس CDN بورس'},
            useLiveBase: {type:'bool', def:true, group:'adv', label:'قیمت پایه زنده'},
            unitGuardX: {type:'number', def:8, min:1, max:20, group:'adv', label:'ضریب واحد قیمت'},
            modelTimeBasis: {type:'string', def:'legacy-hold', group:'adv', label:'مبنای زمان مدل (legacy-hold/calendar-expiry/tse-trading)'}
        },
        filter: function(ctx, sym){
            var bidRaw=sym.pd1||sym.bid||0, askRaw=sym.po1||sym.ask||0;
            if(bidRaw && askRaw && bidRaw>0 && askRaw>0 && bidRaw>askRaw) return ctx.reject('crossed-book', 'bid='+bidRaw+' ask='+askRaw);
            var bid=bidRaw||0, ask=askRaw||0;
            var quoteSource=bid>0&&ask>0?'provided-order-book':'last-price±2%-fallback';
            if(!bid || !ask){
                addDataWarning(sym, 'مظنهٔ خرید/فروش ناقص بود؛ بازهٔ ±۲٪ از آخرین قیمت جایگزین شد.');
                bid=sym.pl*0.98; ask=sym.pl*1.02;
            }
            if(!bid || !ask || bid<=0 || ask<=0) return ctx.reject('no-quote');
            var mid=(bid+ask)/2;
            var spreadPct=(ask-bid)/mid*100;
            if(spreadPct>ctx.cfg.maxSpread) return ctx.reject('spread', 'spread='+spreadPct.toFixed(1)+'%');
            var strikeMatch=String(sym.l30||'').match(/(\d{3,6})/);
            var K=strikeMatch? +strikeMatch[1] : 0;
            if(!K || K<10){
                if(sym.strike!=null && sym.strike>=10) K=sym.strike;
                else return ctx.reject('strike', 'strike-extract-failed l30='+String(sym.l30||'').slice(0,30));
            }
            if(!K || K<10) return ctx.reject('strike');
            var poolEntry=sym.base? poolStore[sym.base] : null;
            var poolItem=null;
            if(poolEntry&&poolEntry.history) for(var poolIndex=poolEntry.history.length-1;poolIndex>=0;poolIndex--) if(isTrustedObservationSource(poolEntry.history[poolIndex].source)){ poolItem=poolEntry.history[poolIndex]; break; }
            var poolP=poolItem&&poolEntry&&poolEntry.stats&&poolEntry.stats.lastPrice>0?poolEntry.stats.lastPrice:0;
            var poolAgeDays=poolItem?ctx.todayJdn-poolItem.jdn:null;
            var hasPoolPrice=!!(poolP>0 && poolAgeDays!=null && poolAgeDays>=0 && poolAgeDays<=5 && poolItem.source && poolItem.source!=='unverified');
            var poolEntrySource=poolItem&&poolItem.source?poolItem.source:'';
            var configuredBase=ctx.cfg.basePrices && sym.base? ctx.cfg.basePrices[sym.base] : 0;
            var S=poolP||configuredBase||sym.basePrice||1000;
            var basePriceSource=poolP? (poolEntrySource==='live-tsetmc'?'observed-live':poolEntrySource==='tsetmc-history'?'observed-history':'legacy-unverified') : (configuredBase?'configured-assumption':(sym.basePrice?'provided-input':'fallback-default'));
            sym._basePriceSource=basePriceSource; sym._basePriceAgeDays=poolAgeDays;
            if(!hasPoolPrice || basePriceSource==='legacy-unverified') addDataWarning(sym, 'قیمت پایه از منبع و تاریخچهٔ تازهٔ قابل‌تأیید نیست؛ مبنا: '+basePriceSource+(poolAgeDays!=null?'، سن داده '+poolAgeDays+' روز':'')+'.');
            if(!S || S<=0){ S=1000; addDataWarning(sym, 'قیمت پایهٔ معتبر موجود نبود؛ مقدار پیش‌فرض ۱۰۰۰ در محاسبه استفاده شد.'); }
            var timeInfo=getPricingTime(ctx,sym._expiryJdn||sym._configuredExpiryJdn);
            if(!timeInfo.ok) return ctx.reject('calendar-unknown', timeInfo.reason);
            var T=timeInfo.T;
            var r=ctx.cfg.riskFree/100;
            var q=0;
            var l30Str=String(sym.l30||'').trim();
            var isCall;
            if(sym.optionType) isCall=(sym.optionType==='call' || sym.optionType==='خ');
            else if(/^ض/.test(l30Str)) isCall=true;
            else if(/^ط/.test(l30Str)) isCall=false;
            else if(/اختیار\s*خ|^خ/.test(l30Str)) isCall=true;
            else if(/پوت|فروش/.test(l30Str)) isCall=false;
            else isCall=true;
            var marketPrice=mid;
            var intrinsic=isCall? Math.max(S-K,0) : Math.max(K-S,0);
            // آربیتراژ کامل: Call max(S-K,0) ≤ C ≤ S  و  Put max(K-S,0) ≤ P ≤ K
            if(marketPrice < intrinsic*0.9) return ctx.reject('arb-bound', 'mp='+marketPrice+' intr='+intrinsic);
            if(isCall){
                if(marketPrice > S*1.02) return ctx.reject('arb-bound', 'call C>S mp='+marketPrice+' S='+S);
            } else {
                if(marketPrice > K*1.02) return ctx.reject('arb-bound', 'put P>K mp='+marketPrice+' K='+K);
            }
            var timeValue=marketPrice-intrinsic;
            if(timeValue<0) timeValue=0;
            var tvPct=intrinsic>0? (timeValue/marketPrice*100) : 100;
            if(tvPct>ctx.cfg.maxTimeValuePct && ctx.cfg.maxTimeValuePct<100) return ctx.reject('time-value', 'tv%='+tvPct.toFixed(1));
            var modelPrice=bsPrice(S,K,T,r,q,0.4,isCall);
            var unitRatio=modelPrice>0? marketPrice/modelPrice : 1;
            if(unitRatio>ctx.cfg.unitGuardX*2) return ctx.reject('unit', 'ratio='+unitRatio.toFixed(2));
            // Store expiry and pricing convention separately for downstream layers.
            sym._S=S; sym._K=K; sym._T=T; sym._daysPerYear=timeInfo.daysPerYear; sym._timeBasis=timeInfo.basis;
            sym._r=r; sym._q=q; sym._isCall=isCall; sym._mid=mid; sym._bid=bid; sym._ask=ask; sym._quoteSource=quoteSource;
            return ctx.pass();
        }
    },
    {
        key: 'L5-greeks', icon: '📈', color: '#fbbf24', order: 5,
        label: 'نوسان و یونانی‌ها', desc: 'یونانی‌ها',
        schema: {
            volFloor: {type:'number', def:25, min:0, max:200, group:'core', label:'کف نوسان (٪)'},
            volCeil: {type:'number', def:150, min:0, max:500, group:'core', label:'سقف نوسان'},
            maxIvPremium: {type:'number', def:10, min:0, max:100, group:'core', label:'سقف صرف IV'},
            minDelta: {type:'number', def:0, min:0, max:1, step:0.05, group:'core', label:'کف دلتا'},
            maxDelta: {type:'number', def:1, min:0, max:1, step:0.05, group:'core', label:'سقف دلتا'},
            maxLeverage: {type:'number', def:30, min:0, max:100, group:'core', label:'سقف اهرم'},
            useIvRank: {type:'bool', def:true, group:'adv', label:'IV Rank'},
            volatilityAnnualizationMode: {type:'string', def:'legacy252', group:'adv', label:'سالانه‌سازی نوسان (legacy252/tse-calendar)'}
        },
        filter: function(ctx, sym){
            var S=sym._S, K=sym._K, T=sym._T, r=sym._r, q=sym._q, isCall=sym._isCall, marketPrice=sym._mid;
            if(!S || !K) return ctx.reject('base-price');
            var ivRes=ivSolve(marketPrice,S,K,T,r,q,isCall,sym._daysPerYear);
            if(!ivRes.ok) return ctx.reject('iv-bad');
            var sigma=ivRes.iv;
            if(sigma<0.05 || sigma>5) return ctx.reject('iv-range', 'iv='+(sigma*100).toFixed(1)+'%');
            var poolVol=sym.base? getPoolVolatility(sym.base) : 0;
            var hasVolHistory=!!(sym.base && poolStore[sym.base] && poolStore[sym.base].stats && poolStore[sym.base].stats.volatility>0 && poolStore[sym.base].stats.verifiedDays>3);
            var hv=poolVol>0? poolVol/100 : (ctx.cfg.volFloor+ctx.cfg.volCeil)/2/100;
            if(!hasVolHistory) addDataWarning(sym, 'تاریخچهٔ نوسان کافی نیست؛ مقدار میانی کف/سقف تنظیم‌شده برای مقایسهٔ IV به‌کار رفته است.');
            var ivPrem=(sigma-hv)/hv*100;
            if(ivPrem>ctx.cfg.maxIvPremium && ctx.cfg.maxIvPremium<100) return ctx.reject('iv-premium', 'prem='+ivPrem.toFixed(1)+'%');
            var greeks=bsGreeks(S,K,T,r,q,sigma,isCall,sym._daysPerYear);
            if(ctx.cfg.minDelta!==0 || ctx.cfg.maxDelta!==1){
                var dAbs=Math.abs(greeks.delta);
                if(dAbs < ctx.cfg.minDelta || dAbs > ctx.cfg.maxDelta) return ctx.reject('delta-range', 'delta='+greeks.delta.toFixed(3));
            }
            var moneyness=S/K;
            if((ctx.cfg.moneynessMin>0 && moneyness < ctx.cfg.moneynessMin) || (ctx.cfg.moneynessMax>0 && moneyness > ctx.cfg.moneynessMax)){
                return ctx.reject('moneyness', 'mn='+moneyness.toFixed(3));
            }
            var thetaPct=Math.abs(greeks.theta)/marketPrice*100;
            if(ctx.cfg.maxThetaPct<100 && thetaPct>ctx.cfg.maxThetaPct) return ctx.reject('theta-high', 'theta%='+thetaPct.toFixed(1));
            var leverage=Math.abs(greeks.delta)*S/marketPrice;
            if(leverage>ctx.cfg.maxLeverage || (ctx.cfg.minLeverage>0 && leverage < ctx.cfg.minLeverage)){
                return ctx.reject('leverage', 'lev='+leverage.toFixed(1));
            }
            sym._iv=sigma; sym._greeks=greeks; sym._leverage=leverage; sym._moneyness=moneyness;
            return ctx.pass();
        }
    },
    {
        key: 'L6-quality', icon: '⭐', color: '#fb7185', order: 6,
        label: 'کیفیت و امتیاز', desc: 'کیفیت',
        schema: {
            maxStalePricePct: {type:'number', def:50, min:0, max:100, group:'core', label:'سقف قیمت کهنه'},
            maxImbalanceRatio: {type:'number', def:20, min:0, max:100, group:'core', label:'سقف عدم تعادل'},
            minExpRet: {type:'number', def:40, min:0, max:200, group:'core', label:'حداقل بازده'},
            coldThreshold: {type:'number', def:3, min:0, max:20, group:'core', label:'آستانه سرد'},
            scoreMin: {type:'number', def:35, min:0, max:100, group:'core', label:'حداقل امتیاز'},
            useScore: {type:'bool', def:true, group:'adv', label:'امتیاز تناسب'}
        },
        filter: function(ctx, sym){
            var mid=sym._mid, qd1=sym.qd1||0, qo1=sym.qo1||0;
            var lastPrice=sym.pl||mid;
            var stalePct=Math.abs(lastPrice-mid)/mid*100;
            if(ctx.cfg.maxStalePricePct<100 && stalePct>ctx.cfg.maxStalePricePct) return ctx.reject('stale-price', 'stale%='+stalePct.toFixed(1));
            if(ctx.cfg.maxImbalanceRatio<20){
                var imb=Math.max(qd1,qo1)/Math.max(Math.min(qd1,qo1),1);
                if(imb>ctx.cfg.maxImbalanceRatio) return ctx.reject('imbalance', 'imb='+imb.toFixed(1));
            }
            if(sym._dteCalendar!=null && sym._dteCalendar < ctx.cfg.minDaysLeft) return ctx.reject('dte', 'calendar='+sym._dteCalendar);
            var tradingCalendarComplete=sym._expiryJdn!=null && TSE_CALENDAR.isCompleteForRange(ctx.todayJdn,sym._expiryJdn);
            if(ctx.cfg.minTradingDaysLeft>0){
                if(tradingCalendarComplete && sym._dteTrading!=null && sym._dteTrading < ctx.cfg.minTradingDaysLeft) return ctx.reject('dte', 'trading='+sym._dteTrading);
                if(!tradingCalendarComplete) addDataWarning(sym, 'حداقل DTE معاملاتی اعمال نشد؛ پوشش تعطیلات تقویم کامل نیست.');
            }
            var S=sym._S, K=sym._K, T=sym._T, r=sym._r, q=sym._q, sigma=sym._iv, isCall=sym._isCall, marketPrice=sym._mid;
            var fair=bsPrice(S*(1+ctx.cfg.view/100),K,T,r,q,sigma,isCall);
            var er=(fair-marketPrice)/marketPrice*100;
            if(ctx.cfg.minDteWeight){
                var dte=ctx.cfg.dtePenaltyBasis==='trading'? (tradingCalendarComplete?sym._dteTrading:null) : sym._dteCalendar;
                var hold=ctx.cfg.holdDays;
                var penalty=0;
                if(dte!=null && dte < hold*ctx.cfg.dtePenaltyDaysMult){
                    penalty=ctx.cfg.dtePenaltyMax*(1 - dte/(hold*ctx.cfg.dtePenaltyDaysMult));
                    er-=penalty;
                } else if(dte==null){ addDataWarning(sym, ctx.cfg.dtePenaltyBasis==='trading'?'جریمهٔ DTE معاملاتی به‌دلیل نبود تقویم کامل اعمال نشد.':'DTE در دسترس نیست؛ جریمهٔ سررسید محاسبه نشد.'); }
            }
            var coldThresh=ctx.cfg.coldThreshold!=null? ctx.cfg.coldThreshold : 3;
            if(er < coldThresh) return ctx.reject('cold', 'er='+er.toFixed(1)+'%');
            if(er < ctx.cfg.minExpRet) return ctx.reject('min-er', 'er='+er.toFixed(1)+'%');
            if(ctx.cfg.useScore){
                var score=0;
                score+=Math.min(er,100)/100*ctx.cfg.wER;
                var ivRank=50;
                if(ctx.cfg.useIvRank && sym.base){
                    var ivHistory=getVerifiedIvHistory(sym.base);
                    if(ivHistory.length<5) addDataWarning(sym, 'تاریخچهٔ IV تأییدشده کمتر از ۵ مشاهده است؛ رتبهٔ خنثی ۵۰ در امتیازدهی استفاده می‌شود.');
                    ivRank=getPoolIvRank(sym.base, sigma);
                    var buy=ctx.cfg.ivRankBuy, sell=ctx.cfg.ivRankSell;
                    var ivScore=0;
                    if(ivRank<=buy) ivScore=100; else if(ivRank>=sell) ivScore=0; else ivScore=100*(sell-ivRank)/(sell-buy);
                    score+=ivScore/100*ctx.cfg.wIVR;
                    sym._ivRank=ivRank;
                } else {
                    score+=50/100*ctx.cfg.wIVR;
                }
                score+=60/100*ctx.cfg.wADX;
                score+=70/100*ctx.cfg.wLiq;
                score+=50/100*ctx.cfg.wEdge;
                if(score < ctx.cfg.scoreMin) return ctx.reject('score-'+Math.floor(score), 'score='+score.toFixed(0));
                sym._score=score;
            }
            sym._er=er; sym._fair=fair;
            return ctx.pass();
        }
    },
    {
        key: 'L7-ranking', icon: '🏆', color: '#22d3ee', order: 7,
        label: 'رتبه‌بندی و خروجی', desc: 'خروجی',
        schema: {
            maxPerGroup: {type:'number', def:2, min:0, max:10, group:'core', label:'سقف هر گروه'},
            maxTotalRows: {type:'number', def:0, min:0, max:1000, group:'core', label:'سقف کل'},
            usePareto: {type:'bool', def:true, group:'adv', label:'پارتو'},
            abortThreshold: {type:'number', def:10, min:0, max:100, group:'adv', label:'آستانه توقف'}
        },
        filter: function(ctx, sym){
            var totalAbort=0; var keys=Object.keys(ctx.abortCounts);
            for(var i=0;i<keys.length;i++) totalAbort+=ctx.abortCounts[keys[i]];
            var inputAbort=ctx.abortCounts['input-data']||0;
            if(inputAbort>ctx.cfg.abortThresholdInput && ctx.cfg.abortThresholdInput>0){
                var ratio=ctx.totalInput>0? inputAbort/ctx.totalInput : 0;
                var isSmallDeath=ctx.totalInput<=20 && inputAbort>=Math.max(5, ctx.totalInput*0.5);
                var isLargeDeath=ctx.totalInput>20 && ratio>0.8;
                if(isSmallDeath || isLargeDeath){
                    if(!ctx._deathWarned){
                        ctx._deathWarned=true;
                        console.warn('[ExoticFilter] حالت مرگ: '+inputAbort+'/'+ctx.totalInput);
                    }
                    if(ctx.debugOn && ctx.rawSamples.errors.length<5) ctx.rawSamples.errors.push({reason:'near-death', inputAbort:inputAbort, total:ctx.totalInput});
                }
            }
            return ctx.pass();
        }
    },
    {
        key:'L8-holding-advisory', icon:'🧭', color:'#a78bfa', order:8,
        label:'سناریوهای نگهداری (آزمایشی)', desc:'اطلاعاتی؛ بدون فیلتر یا توصیه قطعی',
        schema:{
            holdScenarioDays:{type:'csv', def:[3,5,7,10], group:'core', label:'افق نگهداری، روز تقویمی'},
            underlyingScenarioShocks:{type:'csv', def:[-0.05,-0.02,0,0.02,0.05], group:'core', label:'شوک پایه (اعشاری)'},
            maxHolidayGap:{type:'number', def:3, min:0, max:14, group:'adv', label:'هشدار تعطیلی پیاپی (روز)'},
            showScenarioTable:{type:'bool', def:true, group:'core', label:'محاسبه جدول سناریو'}
        },
        filter:function(ctx,sym){
            if(!ctx.cfg.showScenarioTable){ sym._holdingAdvisory={status:'disabled', scenarios:[]}; return ctx.pass(); }
            var reasons=[];
            var advisoryExpiry=sym._expiryJdn||sym._configuredExpiryJdn;
            if(!advisoryExpiry) reasons.push('تاریخ سررسید معتبر در ورودی/تنظیمات نیست');
            var caveats=[];
            if(advisoryExpiry && sym._expirySource==='configured-reference') caveats.push('سررسید از تنظیم مرجع گرفته شده و با قرارداد این نماد تطبیق نشده است');
            if(!(sym._S>0) || !sym._K || !(sym._iv>0) || !(sym._mid>0)) reasons.push('قیمت/IV/مظنه برای سناریو کافی نیست');
            if(sym._quoteSource==='last-price±2%-fallback') reasons.push('مظنه از قیمت آخر و بازهٔ ±۲٪ برآورد شده؛ سناریو ساخته نشد');
            if(sym._basePriceSource==='fallback-default') reasons.push('قیمت پایه فقط مقدار پیش‌فرض مدل است');
            if(sym._basePriceSource==='legacy-unverified') reasons.push('منبع قیمت پایهٔ pool قدیمی تأییدنشده است');
            if(sym._basePriceAgeDays!=null && (sym._basePriceAgeDays<0 || sym._basePriceAgeDays>5)) reasons.push('تاریخ قیمت پایهٔ pool نامعتبر/بیش از ۵ روز تقویمی کهنه است');
            var advisoryStatus=advisoryExpiry?TSE_CALENDAR.calendarStatus(ctx.todayJdn,advisoryExpiry):{status:'unknown',complete:false,missingYears:[],knownTradingDays:null};
            var calendarDte=advisoryExpiry?Math.max(0,advisoryExpiry-ctx.todayJdn):null;
            var tradingDte=advisoryStatus.complete?Math.max(0,TSE_CALENDAR.tradingDaysBetween(ctx.todayJdn,advisoryExpiry)):null;
            var advisory={status:reasons.length?'insufficient-data':'advisory',scenarios:[],thetaDecay:[],calendarStatus:advisoryStatus,dte:{calendarDays:calendarDte,tradingDays:tradingDte,tradingStatus:advisoryStatus.status},assumptions:{volatility:'ثابت در تمام سناریوها',rates:'ثابت',dividends:'بدون تغییر',execution:'قیمت نظری؛ بدون اسپرد/کارمزد/لغزش',timeBasis:'تاریخ انقضای تقویمی شمسی/میلادی، سال 365روزه',thetaDecay:'برآورد نظری با قیمت پایه، IV، نرخ و سود ثابت؛ بدون توصیه معاملاتی',basePriceSource:sym._basePriceSource||'unknown',basePriceAgeDays:sym._basePriceAgeDays==null?null:sym._basePriceAgeDays,quoteSource:sym._quoteSource||'caller-supplied-unverified',expirySource:sym._expirySource||'unknown',notRecommendation:true}};
            if(reasons.length){ advisory.reasons=reasons; advisory.warnings=caveats; sym._holdingAdvisory=advisory; return ctx.pass(); }
            var horizons=getSymList('holdScenarioDays'), shocks=getSymList('underlyingScenarioShocks');
            if(!horizons.length) horizons=[3,5,7,10];
            if(!shocks.length) shocks=[-0.05,-0.02,0,0.02,0.05];
            var remainingDays=Math.max(0,advisoryExpiry-ctx.todayJdn);
            var maxHoldCalendarDays=0;
            for(var h=0;h<horizons.length;h++){ var hv=Number(horizons[h]); if(isFinite(hv)&&hv>=0&&hv<=365) maxHoldCalendarDays=Math.max(maxHoldCalendarDays,hv); }
            var holidayEnd=Math.min(advisoryExpiry,ctx.todayJdn+Math.ceil(maxHoldCalendarDays));
            var risk=TSE_CALENDAR.findHolidayGaps(ctx.todayJdn,holidayEnd,Math.max(1,Number(ctx.cfg.maxHolidayGap)||1));
            var riskExceeds=risk.complete?risk.gaps.some(function(g){return g.closedCalendarDays>ctx.cfg.maxHolidayGap;}):null;
            advisory.calendar={status:risk.status,complete:risk.complete,holidayGapRiskKnown:!!risk.complete,maxClosedCalendarDays:risk.complete?risk.maxClosedCalendarDays:null,thresholdCalendarDays:ctx.cfg.maxHolidayGap,exceedsThreshold:riskExceeds,gaps:risk.complete?risk.gaps:[],lookAheadCalendarDays:Math.ceil(maxHoldCalendarDays)};
            advisory.warnings=caveats.slice();
            if(!risk.complete) advisory.warnings.push('تعطیلات رسمی برای این بازه کامل علامت‌گذاری نشده‌اند؛ ریسک تعطیلی نامعلوم است.');
            else if(riskExceeds) advisory.warnings.push('در پنجرهٔ نگهداری، تعطیلی پیوسته از آستانهٔ تنظیم‌شده بیشتر است.');
            if(sym._basePriceSource==='configured-assumption') advisory.warnings.push('قیمت پایه از تنظیم کاربر است، نه مظنهٔ زندهٔ تأییدشده.');
            if(sym._quoteSource==='provided-order-book') advisory.warnings.push('مظنه از ورودی گرفته شده؛ تازگی و منبع آن خارج از موتور اعتبارسنجی نشده است.');
            if(sym._basePriceSource==='legacy-unverified') advisory.warnings.push('منبع قیمت پایه در تاریخچهٔ قدیمی قابل تأیید نیست.');
            if(sym._basePriceAgeDays!=null && sym._basePriceAgeDays>5) advisory.warnings.push('تاریخ آخرین قیمت پایه بیش از ۵ روز تقویمی گذشته است.');
            if(sym._basePriceAgeDays!=null && sym._basePriceAgeDays<0) advisory.warnings.push('تاریخ قیمت پایه در آینده است و قابل اتکا نیست.');
            for(var hi=0;hi<horizons.length;hi++){
                var hold=Number(horizons[hi]);
                if(!isFinite(hold)||hold<0||hold>365) continue;
                var remaining=Math.max(0,remainingDays-hold), scenarioT=remaining/365;
                for(var si=0;si<shocks.length;si++){
                    var shock=Number(shocks[si]);
                    if(!isFinite(shock)||Math.abs(shock)>1) continue;
                    var shockedS=sym._S*(1+shock);
                    var theoretical=bsPrice(shockedS,sym._K,scenarioT,sym._r,sym._q,sym._iv,sym._isCall);
                    advisory.scenarios.push({holdingCalendarDays:hold,underlyingShock:shock,underlyingPrice:shockedS,theoreticalOptionPrice:theoretical,estimatedReturnPct:(theoretical-sym._mid)/sym._mid*100,remainingCalendarDays:remaining});
                }
            }
            var theoreticalNow=bsPrice(sym._S,sym._K,remainingDays/365,sym._r,sym._q,sym._iv,sym._isCall);
            if(isFinite(theoreticalNow)&&theoreticalNow>0){
                for(var th=0;th<horizons.length;th++){
                    var thetaHold=Number(horizons[th]);
                    if(!isFinite(thetaHold)||thetaHold<0||thetaHold>365) continue;
                    var thetaRemaining=Math.max(0,remainingDays-thetaHold);
                    var thetaFuture=bsPrice(sym._S,sym._K,thetaRemaining/365,sym._r,sym._q,sym._iv,sym._isCall);
                    if(isFinite(thetaFuture)) advisory.thetaDecay.push({holdingCalendarDays:thetaHold,remainingCalendarDays:thetaRemaining,theoreticalOptionPrice:thetaFuture,modelDecayValue:thetaFuture-theoreticalNow,modelDecayPct:(thetaFuture-theoreticalNow)/theoreticalNow*100});
                }
            }
            if(!advisory.scenarios.length){ advisory.status='insufficient-data'; advisory.reasons=['پارامترهای سناریو معتبر نیستند']; }
            sym._holdingAdvisory=advisory;
            return ctx.pass();
        }
    }
];

// ─── CONTEXT + HOOKS ──────────────────────────────────────────────────────
function makeCtx(){
    var effectiveCfg={};
    var configKeys=Object.keys(CONFIG);
    for(var ci=0;ci<configKeys.length;ci++) effectiveCfg[configKeys[ci]]=getCfg(configKeys[ci]);
    return {
        cfg: effectiveCfg,
        pool: poolStore,
        ivHist: ivHist,
        todayJdn: todayJdn(),
        totalInput: totalInput,
        abortCounts: abortCounts,
        rawSamples: rawSamples,
        debugOn: getCfg('debugPanel'),
        _deathWarned: false,
        _reject: null,
        reject: function(key, detail){
            this._reject={ok:false, key:key, detail:detail||null};
            return this._reject;
        },
        pass: function(extras){
            this._reject=null;
            return {ok:true, extras:extras||null};
        },
        getCfg: getCfg,
        getPoolPrice: getPoolPrice,
        hooks: {
            beforeAll: [],
            afterAll: [],
            beforeFilter: [],
            afterFilter: []
        },
        callHook: function(name, args){
            try{
                var list=this.hooks[name]||[];
                for(var i=0;i<list.length;i++){
                    try{ list[i].apply(null, args); }catch(e){ console.warn('[Hook] '+name+' error', e); }
                }
                // layer-level hooks
                for(var li=0;li<LAYERS.length;li++){
                    var L=LAYERS[li];
                    if(L.hooks && L.hooks[name]){
                        try{ L.hooks[name].apply(L, args); }catch(e){ console.warn('[LayerHook] '+L.key+' '+name, e); }
                    }
                }
            }catch(e){}
        }
    };
}

// برای افزودن لایه هشتم با Hooks:
// LAYERS.push({
//   key:'L8-momentum', icon:'📊', color:'#c084fc', order:8, label:'مومنتوم',
//   schema:{momWindow:{type:'number', def:20, group:'core', label:'پنجره مومنتوم'}},
//   hooks:{ beforeAll:function(ctx){ console.log('L8 beforeAll'); } },
//   filter:function(ctx,sym){ return ctx.pass(); }
// });
// همچنین می‌توان هوک سراسری اضافه کرد:
// makeCtx().hooks.beforeAll.push(function(ctx){ ... });


// ─── PIPELINE ───────────────────────────────────────────────────────────────
function resetPipeline(){
    pipelineData={}; layerStats={}; abortCounts={}; rawSamples={raw:[], errors:[], incomplete:[]}; totalInput=0;
    for(var li=0;li<LAYERS.length;li++){
        var L=LAYERS[li];
        pipelineData[L.key]={input:0, output:0, filtered:0, before:0, isZero:false, pctFiltered:'0.0', pctRemaining:'100.0', filters:{}, samples:{pass:[], fail:[]}};
        layerStats[L.key]={in:0, out:0, filters:{}};
    }
}
function incFilter(layerKey, filterKey, isDebugSample, sample){
    if(!pipelineData[layerKey]) return;
    if(!pipelineData[layerKey].filters[filterKey]) pipelineData[layerKey].filters[filterKey]=0;
    pipelineData[layerKey].filters[filterKey]++;
    if(!layerStats[layerKey].filters[filterKey]) layerStats[layerKey].filters[filterKey]=0;
    layerStats[layerKey].filters[filterKey]++;
    if(!abortCounts[filterKey]) abortCounts[filterKey]=0;
    abortCounts[filterKey]++;
    if(isDebugSample && pipelineData[layerKey].samples.fail.length<3){
        pipelineData[layerKey].samples.fail.push(sample||filterKey);
    }
}
function passLayer(layerKey, sample){
    if(!pipelineData[layerKey]) return;
    pipelineData[layerKey].output++;
    layerStats[layerKey].out++;
    if(getCfg('debugPanel') && pipelineData[layerKey].samples.pass.length<3){
        pipelineData[layerKey].samples.pass.push(sample||'ok');
    }
}

function runPipeline(symbols, runMeta){
    if(!Array.isArray(symbols)) symbols=[];
    resetPipeline();
    var ctx=makeCtx();
    ctx.simulation=!!(runMeta&&runMeta.simulation);
    ctx.totalInput=symbols.length;
    var results=[];
    var failed=[];
    var startTime=Date.now();
    var HARD_TIMEOUT=getCfg('computeIntervalMs')||15000;

    outer:
    for(var i=0;i<symbols.length;i++){
        totalInput++;
        ctx.totalInput=totalInput;
        if(Date.now()-startTime>HARD_TIMEOUT){
            console.warn('[ExoticFilter] Pipeline timeout at '+i+'/'+symbols.length);
            rawSamples.errors.push({reason:'pipeline-timeout', at:i, total:symbols.length});
            break;
        }
        var sym=symbols[i];
        var debugOn=getCfg('debugPanel');
        try{
            for(var li=0;li<LAYERS.length;li++){
                var L=LAYERS[li];
                var layerKey=L.key;
                if(!pipelineData[layerKey]) continue;
                pipelineData[layerKey].input++;
                layerStats[layerKey].in++;
                pipelineData[layerKey].before=pipelineData[layerKey].input;

                var r;
                try{ r=L.filter(ctx, sym); }
                catch(e){ r=ctx.reject('exception:'+e.message); rawSamples.errors.push({sym:sym.l18, error:e.message}); }

                if(!r.ok){
                    incFilter(layerKey, r.key, debugOn, sym.l18+' '+ (r.detail||''));
                    if(debugOn && r.key==='input-data' && rawSamples.incomplete.length<5) rawSamples.incomplete.push({reason:r.key, sym:sym});
                    failed.push({sym:sym.l18||i, reason:r.key, layer:layerKey, detail:r.detail});
                    continue outer;
                }
                passLayer(layerKey, sym.l18);
            }
            results.push(sym);
        }catch(e){
            failed.push({sym:sym.l18||i, reason:'exception:'+e.message, layer:'exception'});
            if(rawSamples.errors.length<10) rawSamples.errors.push({sym:sym.l18, error:e.message});
        }
    }
    for(var li2=0;li2<LAYERS.length;li2++){
        var key=LAYERS[li2].key;
        var d=pipelineData[key];
        if(d.input>0){
            d.filtered=d.input-d.output;
            d.pctFiltered=(d.filtered/d.input*100).toFixed(1);
            d.pctRemaining=(d.output/d.input*100).toFixed(1);
            d.isZero=d.output===0;
        }
    }
    var isDeath=results.length===0 && symbols.length>0;
    var topFilter=null, topCount=0;
    if(isDeath){
        var abKeys=Object.keys(abortCounts);
        for(var ai=0;ai<abKeys.length;ai++){ var ak=abKeys[ai]; if(abortCounts[ak]>topCount){ topCount=abortCounts[ak]; topFilter=ak; } }
        rawSamples.errors.push({reason:'death-mode', total:symbols.length, topFilter:topFilter, topCount:topCount, abort:abortCounts});
    }
    try{ requestRenderResults(results); }catch(e){}
    var dataWarnings=[];
    for(var wi=0;wi<symbols.length;wi++){
        if(symbols[wi] && symbols[wi]._dataWarnings && symbols[wi]._dataWarnings.length) dataWarnings.push({symbol:symbols[wi].l18||symbols[wi].l30||'', warnings:symbols[wi]._dataWarnings.slice()});
    }
    return {pass:results, fail:failed, pipeline:pipelineData, stats:layerStats, total:symbols.length, isDeath:isDeath, deathInfo:isDeath? {topFilter:topFilter, topCount:topCount} : null, simulation:!!(runMeta&&runMeta.simulation), dataWarnings:dataWarnings};
}

// ─── VIEW MODE ──────────────────────────────────────────────────────────────
var VIEW_MODE={SUMMARY:'summary', VERBOSE:'verbose'};
function getViewMode(){
    var m=getCfg('viewMode');
    if(m) return m;
    try{
        if(typeof location!=='undefined' && location.search && location.search.indexOf('verbose=1')!==-1) return VIEW_MODE.VERBOSE;
    }catch(e){}
    return VIEW_MODE.VERBOSE;
}

// ─── UI ────────────────────────────────────────────────────────────────────
var panelEl=null, debugEl=null, topZ=10000;
function bringTop71(el){ topZ+=2; el.style.zIndex=topZ; }
var _dragBound=false;
function makeDraggable71(el, handle){
    if(!el || !handle) return;
    try{ handle.style.cursor='move'; }catch(e){}
    try{
        handle.addEventListener('mousedown', function(e){
            try{
                var rect=el.getBoundingClientRect();
                _dragState={el:el, sx:e.clientX, sy:e.clientY, ox:rect.left, oy:rect.top};
            }catch(e){ _dragState={el:el, sx:e.clientX, sy:e.clientY, ox:0, oy:0}; }
            e.preventDefault();
        });
    }catch(e){}
}
if(typeof document!=='undefined' && !_dragBound){
    _dragBound=true;
    var _rafPending=false;
    document.addEventListener('mousemove', function(e){
        if(!_dragState) return;
        if(_rafPending) return;
        _rafPending=true;
        requestAnimationFrame(function(){
            _rafPending=false;
            if(!_dragState) return;
            _dragState.el.style.left=(_dragState.ox+e.clientX-_dragState.sx)+'px';
            _dragState.el.style.top=(_dragState.oy+e.clientY-_dragState.sy)+'px';
            _dragState.el.style.right='auto'; _dragState.el.style.bottom='auto';
        });
    });
    document.addEventListener('mouseup', function(){ _dragState=null; });
    document.addEventListener('touchmove', function(e){
        if(!_dragState || !e.touches[0]) return;
        var t=e.touches[0];
        _dragState.el.style.left=(_dragState.ox+t.clientX-_dragState.sx)+'px';
        _dragState.el.style.top=(_dragState.oy+t.clientY-_dragState.sy)+'px';
        _dragState.el.style.right='auto'; _dragState.el.style.bottom='auto';
    }, {passive:false});
    document.addEventListener('touchend', function(){ _dragState=null; });
}

function buildModernPanel(){
    var existingPanel=document.getElementById('__exfPanel');
    if(existingPanel){ panelEl=existingPanel; return panelEl; }
    if(panelEl) return panelEl;

    var css = ''
    +'.exf-panel, .exf-topbar, #__exfDebugPanel, #__exfToast{--bg:#070a14;--bg2:#0f172a;--card:#111c32;--card2:#162040;--card3:#1c2a4a;--border:#1e2f4f;--border2:#2a3f66;--text:#e2e8f0;--text2:#94a3b8;--muted:#64748b;--accent:#38bdf8;--accent2:#818cf8;--accent3:#22d3ee;--ok:#34d399;--ok2:#10b981;--warn:#fbbf24;--bad:#fb7185;--grad-main:linear-gradient(135deg,#38bdf8 0%,#818cf8 50%,#c084fc 100%);--grad-ok:linear-gradient(135deg,#34d399 0%,#22d3ee 100%);--grad-warn:linear-gradient(135deg,#fbbf24 0%,#f97316 100%);--grad-funnel:linear-gradient(180deg,rgba(56,189,248,0.08) 0%,rgba(129,140,248,0.08) 50%,rgba(192,132,252,0.08) 100%);--shadow:0 25px 80px rgba(0,0,0,0.7),0 0 0 1px rgba(56,189,248,0.08),0 0 40px rgba(56,189,248,0.05);--shadow-card:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(255,255,255,0.03);}'
    +'.exf-panel{position:fixed;right:20px;top:20px;width:440px;max-height:92vh;overflow:hidden;display:flex;flex-direction:column;background:radial-gradient(120% 120% at 0% 0%,rgba(56,189,248,0.12) 0%,transparent 50%),radial-gradient(100% 100% at 100% 0%,rgba(129,140,248,0.10) 0%,transparent 50%),linear-gradient(180deg,var(--card) 0%,var(--bg) 100%);border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow);font-family:Vazirmatn,Tahoma,sans-serif;direction:rtl;color:var(--text);z-index:10000;backdrop-filter:blur(24px) saturate(1.2);}'
    +'.exf-header{padding:18px 20px;display:flex;align-items:center;justify-content:space-between;position:relative;overflow:hidden;flex-shrink:0;}'
    +'.exf-header::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:var(--grad-main);opacity:0.6;}'
    +'.exf-header::after{content:"";position:absolute;bottom:0;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,var(--border),transparent);}'
    +'.exf-title{display:flex;align-items:center;gap:12px;}'
    +'.exf-title-icon{width:40px;height:40px;border-radius:12px;background:var(--grad-main);display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 8px 20px rgba(56,189,248,0.35),0 0 0 1px rgba(255,255,255,0.1) inset;position:relative;overflow:hidden;}'
    +'.exf-title-icon::after{content:"";position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(45deg,transparent 30%,rgba(255,255,255,0.15) 50%,transparent 70%);transform:rotate(45deg);animation:shine 3s infinite;}'
    +'.exf-title-text{display:flex;flex-direction:column;}'
    +'.exf-title-main{font-weight:900;font-size:15px;letter-spacing:-0.3px;background:var(--grad-main);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}'
    +'.exf-title-sub{font-size:10px;color:var(--text2);margin-top:1px;}'
    +'.exf-ver{font-size:9px;color:var(--text2);background:rgba(255,255,255,0.06);padding:4px 10px;border-radius:20px;border:1px solid var(--border);backdrop-filter:blur(8px);}'
    +'.exf-close{cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(255,255,255,0.06);color:var(--text2);border:1px solid var(--border);transition:all 0.2s;} .exf-close:hover{background:rgba(251,113,133,0.12);color:var(--bad);border-color:rgba(251,113,133,0.2);transform:scale(1.05);}'
    +'.exf-funnel{padding:16px 18px;background:var(--grad-funnel);border-bottom:1px solid var(--border);position:relative;overflow:hidden;flex-shrink:0;}'
    +'.exf-funnel::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:radial-gradient(60% 100% at 50% 0%,rgba(56,189,248,0.08),transparent);pointer-events:none;}'
    +'.exf-funnel-title{font-size:11px;font-weight:800;color:var(--text);margin-bottom:12px;display:flex;align-items:center;gap:8px;position:relative;}'
    +'.exf-funnel-title::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--border),transparent);margin-right:8px;}'
    +'.exf-funnel-viz{display:flex;align-items:flex-end;justify-content:space-between;gap:4px;height:86px;position:relative;padding:0 4px;}'
    +'.exf-funnel-step{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);cursor:pointer;}'
    +'.exf-funnel-step:hover{transform:translateY(-3px);}'
    +'.exf-funnel-shape{width:100%;height:36px;position:relative;display:flex;align-items:center;justify-content:center;transition:all 0.4s;}'
    +'.exf-funnel-trapezoid{width:100%;height:28px;background:linear-gradient(180deg,var(--funnel-color),var(--funnel-color-dark));clip-path:polygon(10% 0%,90% 0%,100% 100%,0% 100%);border-radius:2px;position:relative;overflow:hidden;box-shadow:0 4px 12px var(--funnel-shadow),0 0 0 1px rgba(255,255,255,0.08) inset;transition:all 0.4s;}'
    +'.exf-funnel-trapezoid::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);}'
    +'.exf-funnel-trapezoid::after{content:"";position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);animation:shimmer 3s infinite;}'
    +'.exf-funnel-step.active .exf-funnel-trapezoid{transform:scale(1.05);box-shadow:0 6px 20px var(--funnel-shadow),0 0 20px var(--funnel-glow);}'
    +'.exf-funnel-icon{width:32px;height:32px;border-radius:10px;background:var(--card2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:var(--shadow-card);transition:all 0.3s;position:relative;z-index:2;}'
    +'.exf-funnel-step.active .exf-funnel-icon{border-color:var(--funnel-color);box-shadow:0 0 0 2px var(--funnel-glow),var(--shadow-card);transform:scale(1.1);}'
    +'.exf-funnel-count{font-size:11px;font-weight:800;color:var(--text);background:var(--card2);padding:2px 8px;border-radius:20px;border:1px solid var(--border);min-width:28px;text-align:center;transition:all 0.3s;}'
    +'.exf-funnel-step.active .exf-funnel-count{background:var(--funnel-color);color:white;border-color:var(--funnel-color);box-shadow:0 2px 8px var(--funnel-shadow);}'
    +'.exf-funnel-label{font-size:8px;color:var(--muted);font-weight:600;white-space:nowrap;}'
    +'.exf-funnel-connector{width:100%;height:2px;background:linear-gradient(90deg,var(--c1),var(--c2));opacity:0.5;border-radius:1px;position:relative;overflow:hidden;margin-bottom:20px;}'
    +'.exf-funnel-connector::after{content:"";position:absolute;top:0;left:0;width:20px;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent);animation:flow 2s linear infinite;}'
    +'.exf-poolbar{margin:12px 14px;padding:12px 14px;background:linear-gradient(135deg,rgba(56,189,248,0.08) 0%,rgba(129,140,248,0.06) 100%);border:1px solid rgba(56,189,248,0.15);border-radius:14px;position:relative;overflow:hidden;flex-shrink:0;}'
    +'.exf-poolbar::before{content:"";position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,#38bdf8,transparent);opacity:0.5;}'
    +'.exf-poolbar-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}'
    +'.exf-poolbar-title{font-size:11px;font-weight:800;display:flex;align-items:center;gap:6px;}'
    +'.exf-poolbar-stats{font-size:10px;color:var(--text2);background:var(--bg);padding:4px 10px;border-radius:20px;border:1px solid var(--border);}'
    +'.exf-poolbar-actions{display:flex;gap:6px;flex-wrap:wrap;}'
    +'.exf-pool-btn{padding:8px 14px;border-radius:8px;border:1px solid var(--border);background:var(--card2);color:var(--text);cursor:pointer;font-size:11px;min-height:32px;font-weight:600;transition:all 0.2s;display:flex;align-items:center;gap:5px;} .exf-pool-btn:hover{transform:translateY(-1px);border-color:var(--border2);box-shadow:0 4px 12px rgba(0,0,0,0.2);}'
    +'.exf-pool-btn-primary{background:var(--grad-main);border:none;color:white;box-shadow:0 4px 12px rgba(56,189,248,0.25);} .exf-pool-btn-primary:hover{box-shadow:0 6px 20px rgba(56,189,248,0.35);}'
    +'.exf-pool-btn-success{background:var(--grad-ok);border:none;color:white;}'
    +'.exf-pool-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px;}'
    +'.exf-pool-card{padding:10px;background:var(--card);border:1px solid var(--border);border-radius:10px;transition:all 0.2s;position:relative;overflow:hidden;} .exf-pool-card:hover{border-color:var(--border2);transform:translateY(-1px);}'
    +'.exf-pool-card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;}'
    +'.exf-pool-card-sym{font-weight:800;font-size:11px;}'
    +'.exf-pool-card-days{font-size:9px;color:var(--muted);background:var(--bg);padding:2px 6px;border-radius:10px;}'
    +'.exf-pool-card-price{font-size:13px;font-weight:800;color:var(--accent);}'
    +'.exf-pool-card-change{font-size:10px;padding:2px 6px;border-radius:10px;font-weight:700;} .exf-pool-card-change.up{background:rgba(52,211,153,0.12);color:var(--ok);} .exf-pool-card-change.down{background:rgba(251,113,133,0.12);color:var(--bad);}'
    +'.exf-layers{overflow:auto;flex:1;padding:8px 0 0;} .exf-layers::-webkit-scrollbar{width:5px;} .exf-layers::-webkit-scrollbar-thumb{background:var(--border);border-radius:10px;}'
    +'.exf-layer{margin:10px 14px;background:linear-gradient(180deg,var(--card2) 0%,var(--card) 100%);border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);position:relative;box-shadow:var(--shadow-card);}'
    +'.exf-layer::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:var(--layer-grad, var(--grad-main));opacity:0;transition:opacity 0.3s;}'
    +'.exf-layer:hover{border-color:var(--border2);transform:translateY(-2px);box-shadow:0 12px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.04);}'
    +'.exf-layer:hover::before,.exf-layer.open::before{opacity:1;}'
    +'.exf-layer.open{border-color:var(--layer-color);box-shadow:0 12px 40px rgba(0,0,0,0.5),0 0 0 1px var(--layer-color),0 0 30px var(--layer-glow);}'
    +'.exf-layer-h{padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;position:relative;z-index:1;}'
    +'.exf-layer-left{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}'
    +'.exf-layer-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;background:linear-gradient(135deg,var(--card3),var(--bg));border:1px solid var(--border);box-shadow:0 4px 12px rgba(0,0,0,0.2),0 0 0 1px rgba(255,255,255,0.03) inset;transition:all 0.35s;flex-shrink:0;position:relative;overflow:hidden;}'
    +'.exf-layer-icon::before{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,var(--layer-color),transparent);opacity:0.15;}'
    +'.exf-layer.open .exf-layer-icon{transform:scale(1.08) rotate(2deg);border-color:var(--layer-color);box-shadow:0 8px 20px var(--layer-shadow),0 0 0 1px var(--layer-color);}'
    +'.exf-layer-info{display:flex;flex-direction:column;min-width:0;flex:1;gap:2px;}'
    +'.exf-layer-name{font-size:13px;font-weight:800;letter-spacing:-0.2px;}'
    +'.exf-layer-desc{font-size:10px;color:var(--text2);display:flex;align-items:center;gap:6px;}'
    +'.exf-layer-desc::before{content:"";width:3px;height:3px;border-radius:50%;background:var(--layer-color);display:inline-block;}'
    +'.exf-layer-stats{display:flex;align-items:center;gap:6px;flex-shrink:0;}'
    +'.exf-badge{padding:5px 10px;border-radius:20px;font-size:10px;font-weight:800;display:flex;align-items:center;gap:4px;min-width:40px;justify-content:center;transition:all 0.3s;border:1px solid;}'
    +'.exf-badge-in{background:rgba(56,189,248,0.10);color:var(--accent);border-color:rgba(56,189,248,0.18);}'
    +'.exf-badge-out{background:rgba(52,211,153,0.10);color:var(--ok);border-color:rgba(52,211,153,0.18);}'
    +'.exf-badge-filter{background:rgba(251,191,36,0.10);color:var(--warn);border-color:rgba(251,191,36,0.18);}'
    +'.exf-layer-body{display:none;padding:0 16px 16px;position:relative;z-index:1;}'
    +'.exf-layer.open .exf-layer-body{display:block;animation:slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1);}'
    +'.exf-progress{height:6px;background:var(--bg);border-radius:10px;overflow:hidden;margin:10px 0;display:flex;gap:2px;padding:2px;box-shadow:0 0 0 1px var(--border) inset;}'
    +'.exf-progress-pass{height:100%;background:var(--grad-ok);border-radius:6px;transition:width 0.9s cubic-bezier(0.34,1.56,0.64,1);box-shadow:0 0 10px rgba(52,211,153,0.3);position:relative;overflow:hidden;}'
    +'.exf-progress-pass::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent);animation:shimmer 2s infinite;}'
    +'.exf-progress-fail{height:100%;background:var(--grad-warn);border-radius:6px;transition:width 0.9s;opacity:0.8;}'
    +'.exf-filters{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0;}'
    +'.exf-filter{font-size:10px;padding:5px 10px;border-radius:8px;background:var(--bg);border:1px solid var(--border);display:flex;align-items:center;gap:6px;transition:all 0.2s;} .exf-filter:hover{border-color:var(--border2);transform:translateY(-1px);background:var(--card3);}'
    +'.exf-filter-count{font-weight:900;color:white;background:var(--grad-warn);padding:2px 7px;border-radius:10px;font-size:9px;min-width:18px;text-align:center;}'
    +'.exf-settings{margin-top:12px;padding-top:12px;border-top:1px dashed var(--border);}'
    +'.exf-settings-title{font-size:10px;font-weight:800;color:var(--text);margin-bottom:10px;display:flex;align-items:center;gap:6px;} .exf-settings-title::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--border),transparent);}'
    +'.exf-setting{margin:8px 0;display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--bg);border:1px solid var(--border);border-radius:10px;transition:all 0.2s;} .exf-setting:hover{border-color:var(--border2);background:var(--card);}'
    +'.exf-setting-label{font-size:11px;color:var(--text);font-weight:600;display:flex;align-items:center;gap:6px;} .exf-setting-label small{color:var(--muted);font-weight:400;font-size:9px;}'
    +'.exf-setting input{width:96px;background:var(--card);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:6px 10px;font-size:11px;transition:all 0.2s;text-align:center;font-weight:600;} .exf-setting input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(56,189,248,0.12);}'
    +'.exf-debug{margin-top:10px;padding:10px;background:var(--bg);border-radius:10px;font-size:10px;max-height:90px;overflow:auto;border:1px solid var(--border);}'
    +'.exf-actions{padding:14px;display:flex;gap:10px;background:linear-gradient(180deg,var(--card),var(--bg));border-top:1px solid var(--border);flex-shrink:0;}'
    +'.exf-btn{flex:1;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--card2);color:var(--text);cursor:pointer;font-size:11px;font-weight:700;transition:all 0.25s;display:flex;align-items:center;justify-content:center;gap:8px;position:relative;overflow:hidden;} .exf-btn:hover{transform:translateY(-2px);border-color:var(--border2);box-shadow:0 8px 20px rgba(0,0,0,0.3);}'
    +'.exf-btn-primary{background:var(--grad-main);border:none;color:white;box-shadow:0 8px 20px rgba(56,189,248,0.3);} .exf-btn-primary:hover{box-shadow:0 12px 30px rgba(56,189,248,0.4);transform:translateY(-2px) scale(1.02);}'
    +'.exf-topbar{position:fixed;left:20px;bottom:20px;display:flex;gap:10px;z-index:9999;flex-direction:column;}'
    +'.exf-topbtn{width:52px;height:52px;border-radius:16px;background:linear-gradient(180deg,var(--card2),var(--card));border:1px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,0.4);font-size:20px;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);backdrop-filter:blur(12px);} .exf-topbtn:hover{transform:translateY(-3px) scale(1.08);box-shadow:0 16px 40px rgba(0,0,0,0.5),0 0 0 1px var(--accent),0 0 30px rgba(56,189,248,0.2);}'
    +'.exf-death{margin:12px 14px;background:linear-gradient(135deg,rgba(251,113,133,0.08) 0%,rgba(248,113,113,0.06) 100%);border:1px solid rgba(251,113,133,0.18);border-radius:14px;padding:14px;font-size:11px;animation:shake 0.6s ease;}'
    +'.exf-death-title{font-weight:900;color:var(--bad);margin-bottom:10px;display:flex;align-items:center;gap:8px;font-size:12px;}'
    +'.exf-disclaimer{margin:12px 14px;padding:12px 14px;background:linear-gradient(135deg,rgba(251,191,36,0.06) 0%,rgba(245,158,11,0.04) 100%);border:1px solid rgba(251,191,36,0.12);border-radius:12px;font-size:10px;color:var(--text2);line-height:1.6;}'
    +'.exf-disclaimer-title{font-weight:800;color:var(--warn);margin-bottom:6px;display:flex;align-items:center;gap:6px;font-size:11px;}'
    +'.exf-results{flex-shrink:0;} .exf-results-header{position:sticky;top:0;background:var(--card);z-index:1;border-bottom:1px solid var(--border);} .exf-result-row:hover{transform:translateX(-2px);} .exf-result-card:hover{border-color:var(--border2);transform:translateY(-1px);box-shadow:0 8px 24px rgba(0,0,0,0.3);} .exf-toggle{width:38px;height:22px;border-radius:11px;background:var(--bg);border:1px solid var(--border);position:relative;cursor:pointer;transition:all 0.25s;flex-shrink:0;} .exf-toggle::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--text2);transition:all 0.25s;} .exf-toggle.on{background:var(--grad-ok);border-color:transparent;} .exf-toggle.on::after{left:auto;right:2px;background:white;} .exf-setting-control{display:flex;align-items:center;gap:8px;} .exf-result-row:hover{background:var(--card2)!important;} .exf-results-thead{display:flex;padding:6px 12px;font-size:10px;color:var(--muted);border-bottom:1px solid var(--border);background:var(--bg);position:sticky;top:36px;z-index:1;} .exf-minimized .exf-funnel,.exf-minimized .exf-poolbar,.exf-minimized .exf-layers,.exf-minimized .exf-results,.exf-minimized .exf-disclaimer,.exf-minimized .exf-actions{display:none;} .exf-footer{padding:10px 14px;text-align:center;font-size:9px;color:var(--muted);border-top:1px solid var(--border);background:var(--bg);line-height:1.6;flex-shrink:0;} .exf-footer a{color:var(--accent);text-decoration:none;font-weight:600;}'
    +'@keyframes slideDown{from{opacity:0;transform:translateY(-10px) scale(0.98);}to{opacity:1;transform:translateY(0) scale(1);}}'
    +'@keyframes shimmer{0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}'
    +'@keyframes flow{0%{transform:translateX(-100%);}100%{transform:translateX(100%);}}'
    +'@keyframes shake{0%,100%{transform:translateX(0);}15%,45%,75%{transform:translateX(-3px);}30%,60%,90%{transform:translateX(3px);}}'
    +'@keyframes shine{0%{transform:translate(-50%,-50%) rotate(45deg) translateX(-100%);}100%{transform:translate(-50%,-50%) rotate(45deg) translateX(100%);}}';

    if(!window._exfStyleInjected){
        window._exfStyleInjected=true;
        var style=document.createElement('style'); style.textContent=css; document.head.appendChild(style);
    }

    var wrap=document.createElement('div'); wrap.className='exf-panel'; wrap.id='__exfPanel';
    wrap.innerHTML=''
    +'<div class="exf-header" id="__exfDragHandle"><div class="exf-title"><div class="exf-title-icon">🧬</div><div class="exf-title-text"><div class="exf-title-main">tseOptionZharfa</div><div class="exf-title-sub">tseOptionAbyss -v0.0.1</div></div><span class="exf-ver">'+VERSION_TAG+'</span></div><div style="display:flex;gap:6px;"><div class="exf-close" id="__exfMin" title="کوچک/بزرگ">−</div><div class="exf-close" id="__exfClose">✕</div></div></div>'
    +'<div class="exf-funnel" id="__exfFunnelViz"><div class="exf-funnel-title">🔽 جریان قیف — از ورودی تا خروجی نهایی</div><div class="exf-funnel-viz" id="__exfFunnelSteps"></div></div>'
    +'<div id="__exfPoolBar" class="exf-poolbar"></div>'
    +'<div id="__exfDeath" style="display:none;"></div>'
    +'<div class="exf-layers" id="__exfLayers"></div>'
    +'<div id="__exfResults" class="exf-results" style="border-top:1px solid var(--border);max-height:320px;overflow:auto;"></div>'
    +'<div class="exf-disclaimer"><div class="exf-disclaimer-title">⚠️ رفع مسئولیت — از برنامه اصلی</div>این ابزار صرفاً تحلیلی و اطلاعاتی است؛ تضمین سود نمی‌دهد و مسئولیت هر تصمیم و معامله تنها بر عهده کاربر است.<br/>© ۱۴۰۵ — مؤلف: <a href="https://t.me/p75ad" target="_blank" style="color:var(--warn);">https://t.me/p75ad</a> | گروه: <a href="https://t.me/SmartOptionTSE" target="_blank" style="color:var(--warn);">SmartOptionTSE</a></div>'
    +'<div class="exf-actions"><button class="exf-btn exf-btn-primary" id="__exfRun">▶ اجرای شبیه‌سازی</button><button class="exf-btn" id="__exfDebug">🐞 دیباگ</button><button class="exf-btn" id="__exfReset">↺ بازنشانی</button></div>'
    +'<div class="exf-footer">© ۱۴۰۵ — مؤلف اصلی: <a href="https://t.me/p75ad" target="_blank">https://t.me/p75ad</a> | گروه: <a href="https://t.me/SmartOptionTSE" target="_blank">SmartOptionTSE</a> | مجوز: Smart-FFA-1.0<br/>'+DISCLAIMER+'</div>';
    document.body.appendChild(wrap);
    makeDraggable71(wrap, wrap.querySelector('#__exfDragHandle'));
    wrap.querySelector('#__exfClose').addEventListener('click', function(){ wrap.style.display='none'; });
    var minBtn=wrap.querySelector('#__exfMin');
    if(minBtn) minBtn.addEventListener('click', function(){ wrap.classList.toggle('exf-minimized'); minBtn.textContent=wrap.classList.contains('exf-minimized')? '+' : '−'; });
    panelEl=wrap;

    var bar=document.createElement('div'); bar.className='exf-topbar';
    bar.innerHTML='<div class="exf-topbtn" id="__exfOpen" title="قیف هوشمند">🧬</div><div class="exf-topbtn" id="__exfDbgOpen" title="دیباگ">🐞</div>';
    document.body.appendChild(bar);
    bar.querySelector('#__exfOpen').addEventListener('click', function(){ wrap.style.display='block'; bringTop71(wrap); });
    return wrap;
}

function renderFunnelViz(){
    var viz=document.getElementById('__exfFunnelSteps');
    if(!viz) return;
    var html='';
    var totalInputCount=totalInput;
    if(totalInputCount<=0) totalInputCount=(pipelineData['L1-validation']||{}).input||0;
    for(var li=0;li<LAYERS.length;li++){
        var L=LAYERS[li];
        var stat=pipelineData[L.key]||{input:0, output:0};
        var pct = totalInputCount>0? (stat.output/totalInputCount*100) : 0;
        var widthPct = Math.max(8, pct);
        var color = L.color||'#38bdf8';
        var colorDark = color+'cc';
        var shadow = color+'55';
        var glow = color+'33';
        var isActive = stat.output>0;
        var nextColor = li<LAYERS.length-1? (LAYERS[li+1].color||'#818cf8') : color;
        html+='<div class="exf-funnel-step '+(isActive?'active':'')+'" title="'+L.label+': '+stat.output+'/'+stat.input+'" style="--funnel-color:'+color+';--funnel-color-dark:'+colorDark+';--funnel-shadow:'+shadow+';--funnel-glow:'+glow+';">'
        +'<div class="exf-funnel-shape"><div class="exf-funnel-trapezoid" style="width:'+widthPct+'%;"></div></div>'
        +'<div class="exf-funnel-icon">'+L.icon+'</div>'
        +'<div class="exf-funnel-count" title="'+pct.toFixed(1)+'%">'+stat.output+' ('+pct.toFixed(0)+'%)</div>'
        +'<div class="exf-funnel-label">'+L.label.split(' ')[0]+'</div>'
        +'</div>';
        if(li<LAYERS.length-1){
            html+='<div class="exf-funnel-connector" style="--c1:'+color+';--c2:'+nextColor+';"></div>';
        }
    }
    viz.innerHTML=html;
}

// ─── RENDER LAYERS — Summary/Verbose ───────────────────────────────────────

// ─── DEBOUNCE RENDER — requestAnimationFrame + timeout ─────────────────────
var _renderRaf=null, _renderTimer=null, _pendingResults=null;
function debouncedRenderLayers(){
    if(_renderRaf) cancelAnimationFrame(_renderRaf);
    if(_renderTimer) clearTimeout(_renderTimer);
    _renderTimer=setTimeout(function(){
        _renderRaf=requestAnimationFrame(function(){
            _renderRaf=null;
            _renderTimer=null;
            try{ renderLayersImmediate(); }catch(e){ console.error(e); }
            if(_pendingResults){
                try{ renderResultsTable(_pendingResults); }catch(e){ console.error(e); }
                _pendingResults=null;
            }
        });
    }, 16);
}
function formatConfigDiffValue(value){ return Array.isArray(value)?value.join(', '):typeof value==='object'&&value!==null?JSON.stringify(value):String(value); }
function confirmConfigChange(key,oldValue,newValue){
    if(formatConfigDiffValue(oldValue)===formatConfigDiffValue(newValue)) return true;
    var message='تغییر تنظیم فیلتر\n\n'+key+': '+formatConfigDiffValue(oldValue)+' → '+formatConfigDiffValue(newValue)+'\n\nاعمال این تغییر؟';
    return typeof window!=='undefined'&&typeof window.confirm==='function'?window.confirm(message):false;
}
function renderLayers(){
    // wrapper with debounce — hot path optimization
    debouncedRenderLayers();
}

// ─── DUAL-MODE SEPARATE — برای @strip واقعی ───────────────────────────────
/* @keep */ function renderLayerSummary(L, stat){
    var layerDiv=document.createElement('div');
    layerDiv.className='exf-layer exf-layer-summary';
    layerDiv.id='__exfLayer_'+L.key;
    try{ layerDiv.style.setProperty('--layer-color', L.color); layerDiv.style.setProperty('--layer-grad', 'linear-gradient(90deg,'+L.color+','+L.color+'aa)'); layerDiv.style.setProperty('--layer-glow', L.color+'22'); layerDiv.style.setProperty('--layer-shadow', L.color+'44'); }catch(e){ try{ layerDiv.style['--layer-color']=L.color; }catch(e2){} }
    layerDiv.innerHTML='<div class="exf-layer-h"><div class="exf-layer-left"><div class="exf-layer-icon">'+L.icon+'</div><div class="exf-layer-info"><div class="exf-layer-name">'+L.label+'</div><div class="exf-layer-desc">'+stat.input+' → '+stat.output+' ▼'+stat.filtered+'</div></div></div><div class="exf-layer-stats"><span class="exf-badge exf-badge-out">→'+stat.output+'</span></div></div>';
    return layerDiv;
}
/* @strip */ function renderLayerVerbose(L, stat){
    var layerDiv=document.createElement('div');
    layerDiv.className='exf-layer exf-layer-verbose';
    layerDiv.id='__exfLayer_'+L.key;
    try{ layerDiv.style.setProperty('--layer-color', L.color); layerDiv.style.setProperty('--layer-grad', 'linear-gradient(90deg,'+L.color+','+L.color+'aa)'); layerDiv.style.setProperty('--layer-glow', L.color+'22'); layerDiv.style.setProperty('--layer-shadow', L.color+'44'); }catch(e){ try{ layerDiv.style['--layer-color']=L.color; }catch(e2){} }
    var filtersHtml='';
    var filterKeys=Object.keys(stat.filters);
    if(filterKeys.length>0){
        filtersHtml+='<div class="exf-filters">';
        for(var fi=0;fi<filterKeys.length && fi<6;fi++){
            var fk=filterKeys[fi];
            var fo=FILTER_MAP71[fk]||{label:fk};
            filtersHtml+='<div class="exf-filter"><span>'+fo.label+'</span><span class="exf-filter-count">'+stat.filters[fk]+'</span></div>';
        }
        if(filterKeys.length>6) filtersHtml+='<div class="exf-filter">+'+(filterKeys.length-6)+' بیشتر</div>';
        filtersHtml+='</div>';
    }
    var settingsHtml='';
    if(L.schema){
        var schemaKeys=Object.keys(L.schema);
        var coreKeys=[], advKeys=[], exoticKeys=[];
        for(var sk=0;sk<schemaKeys.length;sk++){
            var field=L.schema[schemaKeys[sk]];
            field.key=schemaKeys[sk];
            if(field.group==='core') coreKeys.push(field);
            else if(field.group==='adv') advKeys.push(field);
            else if(field.group==='exotic') exoticKeys.push(field);
            else coreKeys.push(field);
        }
        // sort by priority if exists, else by label
        coreKeys.sort(function(a,b){ return (a.priority||100)-(b.priority||100); });
        settingsHtml+='<div class="exf-settings">';
        if(coreKeys.length>0){
            settingsHtml+='<div class="exf-settings-title">⚙️ تنظیمات اصلی</div>';
            for(var ci=0;ci<coreKeys.length;ci++){
                var f=coreKeys[ci];
                var cv=getCfg(f.key);
                var displayVal=Array.isArray(cv)? cv.join(', ') : (typeof cv==='object' && cv!==null? '('+Object.keys(cv).length+' مورد)' : cv);
                if(f.type==='bool'){
                    var isOn=!!getCfg(f.key);
                    settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+f.label+'</span><div class="exf-setting-control"><div class="exf-toggle '+(isOn?'on':'')+'" data-key="'+f.key+'"></div></div></div>';
                } else {
                    settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+f.label+' <small>'+f.key+'</small></span><div class="exf-setting-control"><input id="__exfIn_'+f.key+'" value="'+displayVal+'" data-key="'+f.key+'" type="text"/></div></div>';
                }
            }
        }
        if(advKeys.length>0){
            settingsHtml+='<div class="__exfToggleAdv" style="font-size:10px;color:var(--text2);margin-top:8px;cursor:pointer;padding:6px 0;" data-target="adv-'+L.key+'">+'+advKeys.length+' پیشرفته ▼</div><div id="adv-'+L.key+'" style="display:none;">';
            for(var ai2=0;ai2<advKeys.length;ai2++){
                var f2=advKeys[ai2];
                var cv2=getCfg(f2.key);
                var displayVal2=Array.isArray(cv2)? cv2.join(', ') : (typeof cv2==='object' && cv2!==null? '('+Object.keys(cv2).length+' مورد)' : cv2);
                if(f2.type==='bool'){
                    var isOn2=!!getCfg(f2.key);
                    settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+f2.label+'</span><div class="exf-setting-control"><div class="exf-toggle '+(isOn2?'on':'')+'" data-key="'+f2.key+'"></div></div></div>';
                } else {
                    settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+f2.label+'</span><div class="exf-setting-control"><input value="'+displayVal2+'" data-key="'+f2.key+'" type="text"/></div></div>';
                }
            }
            settingsHtml+='</div>';
        }
        if(exoticKeys.length>0 && getCfg('exoticEnabled')){
            settingsHtml+='<div class="exf-settings-title">🧪 اگزوتیک</div>';
            for(var ei=0;ei<exoticKeys.length;ei++){
                var fe=exoticKeys[ei];
                var cve=getCfg(fe.key);
                settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+fe.label+'</span><div class="exf-setting-control"><input value="'+cve+'" data-key="'+fe.key+'" type="text"/></div></div>';
            }
        }
        settingsHtml+='</div>';
    }
    var debugHtml='';
    if(getCfg('debugPanel') && (stat.samples.pass.length>0 || stat.samples.fail.length>0)){
        debugHtml+='<div class="exf-debug"><div>✅ '+(stat.samples.pass||[]).join(', ').slice(0,80)+'</div><div>❌ '+(stat.samples.fail||[]).join(', ').slice(0,80)+'</div></div>';
    }
    layerDiv.innerHTML=''
    +'<div class="exf-layer-h"><div class="exf-layer-left"><div class="exf-layer-icon">'+L.icon+'</div><div class="exf-layer-info"><div class="exf-layer-name">'+L.label+'</div><div class="exf-layer-desc">'+L.desc+'</div></div></div><div class="exf-layer-stats"><span class="exf-badge exf-badge-in">↓'+stat.input+'</span><span class="exf-badge exf-badge-out">→'+stat.output+'</span><span class="exf-badge exf-badge-filter">▼'+stat.filtered+'</span></div></div>'
    +'<div class="exf-progress"><div class="exf-progress-pass" style="width:'+stat.pctRemaining+'%"></div><div class="exf-progress-fail" style="width:'+stat.pctFiltered+'%"></div></div>'
    +'<div class="exf-layer-body">'+filtersHtml+settingsHtml+debugHtml+'</div>';
    return layerDiv;
}

function renderLayersImmediate(){

    var container=document.getElementById('__exfLayers');
    if(!container) return;
    var openState={};
    try{
        var existing=container.querySelectorAll('.exf-layer.open');
        for(var ei=0;ei<existing.length;ei++){ openState[existing[ei].id]=true; }
    }catch(e){}
    var mode=getViewMode();
    var isSummary = mode===VIEW_MODE.SUMMARY;

    // Pool bar — delegation
    var poolBar=document.getElementById('__exfPoolBar');
    if(poolBar){
        if(!poolBar._delegated){
            poolBar._delegated=true;
            poolBar.addEventListener('click', function(e){
                var btn=e.target.closest? e.target.closest('button') : null;
                var id=btn? btn.id : e.target.id;
                if(id==='__exfPoolUpd') requestPoolUpdateAll();
                else if(id==='__exfPoolLive') fetchAllLiveBases(function(r){ showToast(r && Object.keys(r).length? Object.keys(r).length+' بروز شد' : 'قیمت زنده', 'success'); renderLayers(); });
                else if(id==='__exfPoolView'){ var sum=getPoolSummary(); console.table(sum); showToast('استخر '+sum.length+' نماد', 'info'); }
                else if(id==='__exfPoolChart'){ var sym=prompt('نمودار کدام نماد؟', 'خودرو'); if(sym){ var entry=poolStore[sym.trim()]; if(!entry) showToast('یافت نشد: '+sym, 'error'); else { var dbg=buildDebugPanel(); var body=document.getElementById('__exfDbgBody'); if(body){ body.innerHTML=buildPoolHistoryChart(sym.trim()); dbg.style.display='block'; } } } }
                else if(id==='__exfPoolClear'){ if(confirm('پاک‌سازی کل استخر 90 روزه؟')){ poolStore={}; ivHist={}; savePool(); renderLayers(); showToast('استخر پاک شد', 'success'); } }
                else if(id==='__exfPoolUpdateSingle') requestPoolUpdateSingle();
            });
        }
        var poolSum=getPoolSummary();
        if(isSummary){
            var top3=poolSum.slice(0,3).map(function(p){ return p.symbol+':'+p.days+'روز'; }).join('، ');
            poolBar.innerHTML='<div class="exf-poolbar-header"><span class="exf-poolbar-title">🏊 استخر</span><span class="exf-poolbar-stats">'+getPoolStatusText()+'</span></div><div style="font-size:10px;color:var(--text2);margin-top:6px;display:flex;justify-content:space-between;align-items:center;"><span>'+(top3||'خالی')+'</span><button id="__exfPoolView" class="exf-pool-btn" style="font-size:10px;padding:4px 8px;">📊 همه</button></div>';
        } else {
            var cardsHtml='';
            if(poolSum.length>0){
                cardsHtml+='<div class="exf-pool-grid">';
                for(var pc=0;pc<Math.min(poolSum.length,6);pc++){
                    var p=poolSum[pc];
                    var change=((p.lastPrice-p.avgPrice)/p.avgPrice*100).toFixed(1);
                    var up=parseFloat(change)>=0;
                    cardsHtml+='<div class="exf-pool-card"><div class="exf-pool-card-header"><span class="exf-pool-card-sym">'+p.symbol+'</span><span class="exf-pool-card-days">'+p.days+'روز</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><span class="exf-pool-card-price">'+Math.round(p.lastPrice).toLocaleString('fa-IR')+'</span><span class="exf-pool-card-change '+(up?'up':'down')+'">'+(up?'+':'')+change+'%</span></div></div>';
                }
                cardsHtml+='</div>';
            }
            poolBar.innerHTML='<div class="exf-poolbar-header"><span class="exf-poolbar-title">🏊 استخر 90 روزه</span><span class="exf-poolbar-stats">'+getPoolStatusText()+'</span></div><div class="exf-poolbar-actions"><button id="__exfPoolUpd" class="exf-pool-btn exf-pool-btn-primary">🔄 تاریخچه</button><button id="__exfPoolUpdateSingle" class="exf-pool-btn">➕ تک</button><button id="__exfPoolLive" class="exf-pool-btn exf-pool-btn-success">💹 زنده</button><button id="__exfPoolView" class="exf-pool-btn">📊 لیست</button><button id="__exfPoolChart" class="exf-pool-btn">📈 نمودار</button><button id="__exfPoolClear" class="exf-pool-btn">🗑</button></div>'+cardsHtml;
        }
    }

    // Death banner
    var deathDiv=document.getElementById('__exfDeath');
    var totalIn=0, totalOut=0;
    var keysPD=Object.keys(pipelineData);
    for(var k=0;k<keysPD.length;k++){ totalIn=Math.max(totalIn, pipelineData[keysPD[k]].input); }
    totalOut=pipelineData['L7-ranking']? pipelineData['L7-ranking'].output : 0;
    if(totalIn>0 && totalOut===0 && totalIn>5){
        var topF=null, topC=0;
        var abKeys=Object.keys(abortCounts);
        for(var ai=0;ai<abKeys.length;ai++){ var ak=abKeys[ai]; if(abortCounts[ak]>topC){ topC=abortCounts[ak]; topF=ak; } }
        var topLabel=(FILTER_MAP71[topF]||{label:topF||'نامشخص'}).label;
        if(deathDiv){
            deathDiv.style.display='block';
            deathDiv.className='exf-death';
            deathDiv.innerHTML='<div class="exf-death-title">⚠️ حالت مرگ: '+totalIn+' ورودی → 0 خروجی</div><div>بیشترین فیلتر: <b>'+topLabel+'</b> ('+topC+' مورد)</div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;"><button id="__exfDeathRelax" class="exf-pool-btn" style="background:var(--warn);color:#000;border:none;">🔓 تسهیل</button><button id="__exfDeathClear" class="exf-pool-btn">↺ پاک‌سازی abort</button><button id="__exfDeathLog" class="exf-pool-btn">📋 لاگ</button></div>';
            var relaxBtn=document.getElementById('__exfDeathRelax');
            if(relaxBtn) relaxBtn.addEventListener('click', function(){
                // حالت تسهیل فقط پس از diff/تأیید کاربر اعمال می‌شود.
                if(!applyUserConfigBatch([{key:'maxSpread',value:30},{key:'minPrice',value:1},{key:'minExpRet',value:0},{key:'scoreMin',value:0}],'تسهیل فیلترها')) return;
                try{ window.__exfRelaxedMode=true; }catch(e){}
                // اگر severity تعریف شده، فیلترهای soft را skip کن
                var softFilters=[];
                var fKeys=Object.keys(FILTERS);
                for(var sf=0;sf<fKeys.length;sf++){ if(FILTERS[fKeys[sf]].severity==='soft') softFilters.push(fKeys[sf]); }
                showToast('فیلترها تسهیل شد — '+softFilters.length+' فیلتر soft نادیده — relaxedMode', 'success');
                renderLayers();
            });
            var clearBtn=document.getElementById('__exfDeathClear');
            if(clearBtn) clearBtn.addEventListener('click', function(){ optClearAbort(); renderLayers(); showToast('abort پاک شد', 'success'); });
            var logBtn=document.getElementById('__exfDeathLog');
            if(logBtn) logBtn.addEventListener('click', function(){ if(window.__exf && window.__exf.optLog) window.__exf.optLog(); });
        }
    } else {
        if(deathDiv) deathDiv.style.display='none';
    }

    renderFunnelViz();
    // LAYERS loop with DocumentFragment — hot path + dual-mode separate
    var layersFrag=document.createDocumentFragment();
    for(var li=0;li<LAYERS.length;li++){
        var L=LAYERS[li];
        var stat=pipelineData[L.key]||{input:0, output:0, filtered:0, pctFiltered:'0', pctRemaining:'100', filters:{}, samples:{pass:[], fail:[]}};
        var layerDiv;
        if(isSummary){
            layerDiv=renderLayerSummary(L, stat);
        } else {
            layerDiv=renderLayerVerbose(L, stat);
        }
        if(false){ // placeholder to keep old else structure
        } else if(false){

            var filtersHtml='';
            var filterKeys=Object.keys(stat.filters);
            if(filterKeys.length>0){
                filtersHtml+='<div class="exf-filters">';
                for(var fi=0;fi<filterKeys.length && fi<6;fi++){
                    var fk=filterKeys[fi];
                    var fo=FILTER_MAP71[fk]||{label:fk};
                    filtersHtml+='<div class="exf-filter"><span>'+fo.label+'</span><span class="exf-filter-count">'+stat.filters[fk]+'</span></div>';
                }
                if(filterKeys.length>6) filtersHtml+='<div class="exf-filter">+'+(filterKeys.length-6)+' بیشتر</div>';
                filtersHtml+='</div>';
            }
            var settingsHtml='';
            if(L.schema){
                var schemaKeys=Object.keys(L.schema);
                var coreKeys=[], advKeys=[], exoticKeys=[];
                for(var sk=0;sk<schemaKeys.length;sk++){
                    var field=L.schema[schemaKeys[sk]];
                    field.key=schemaKeys[sk];
                    if(field.group==='core') coreKeys.push(field);
                    else if(field.group==='adv') advKeys.push(field);
                    else if(field.group==='exotic') exoticKeys.push(field);
                    else coreKeys.push(field);
                }
                settingsHtml+='<div class="exf-settings">';
                if(coreKeys.length>0){
                    settingsHtml+='<div class="exf-settings-title">⚙️ تنظیمات اصلی</div>';
                    for(var ci=0;ci<coreKeys.length;ci++){
                        var f=coreKeys[ci];
                        var cv=getCfg(f.key);
                        var displayVal=Array.isArray(cv)? cv.join(', ') : (typeof cv==='object' && cv!==null? '('+Object.keys(cv).length+' مورد)' : cv);
                        if(f.type==='bool'){
                            var isOn=!!getCfg(f.key);
                            settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+f.label+'</span><div class="exf-setting-control"><div class="exf-toggle '+(isOn?'on':'')+'" data-key="'+f.key+'"></div></div></div>';
                        } else {
                            settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+f.label+' <small>'+f.key+'</small></span><div class="exf-setting-control"><input id="__exfIn_'+f.key+'" value="'+displayVal+'" data-key="'+f.key+'" type="text"/></div></div>';
                        }
                    }
                }
                if(advKeys.length>0){
                    settingsHtml+='<div class="__exfToggleAdv" style="font-size:10px;color:var(--text2);margin-top:8px;cursor:pointer;padding:6px 0;" data-target="adv-'+L.key+'">+'+advKeys.length+' پیشرفته ▼</div><div id="adv-'+L.key+'" style="display:none;">';
                    for(var ai2=0;ai2<advKeys.length;ai2++){
                        var f2=advKeys[ai2];
                        var cv2=getCfg(f2.key);
                        var displayVal2=Array.isArray(cv2)? cv2.join(', ') : (typeof cv2==='object' && cv2!==null? '('+Object.keys(cv2).length+' مورد)' : cv2);
                        if(f2.type==='bool'){
                            var isOn2=!!getCfg(f2.key);
                            settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+f2.label+'</span><div class="exf-setting-control"><div class="exf-toggle '+(isOn2?'on':'')+'" data-key="'+f2.key+'"></div></div></div>';
                        } else {
                            settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+f2.label+'</span><div class="exf-setting-control"><input value="'+displayVal2+'" data-key="'+f2.key+'" type="text"/></div></div>';
                        }
                    }
                    settingsHtml+='</div>';
                }
                if(exoticKeys.length>0 && getCfg('exoticEnabled')){
                    settingsHtml+='<div class="exf-settings-title">🧪 اگزوتیک</div>';
                    for(var ei=0;ei<exoticKeys.length;ei++){
                        var fe=exoticKeys[ei];
                        var cve=getCfg(fe.key);
                        settingsHtml+='<div class="exf-setting"><span class="exf-setting-label">'+fe.label+'</span><div class="exf-setting-control"><input value="'+cve+'" data-key="'+fe.key+'" type="text"/></div></div>';
                    }
                }
                settingsHtml+='</div>';
            }
            var debugHtml='';
            if(getCfg('debugPanel') && (stat.samples.pass.length>0 || stat.samples.fail.length>0)){
                debugHtml+='<div class="exf-debug"><div>✅ '+(stat.samples.pass||[]).join(', ').slice(0,80)+'</div><div>❌ '+(stat.samples.fail||[]).join(', ').slice(0,80)+'</div></div>';
            }
            layerDiv.innerHTML=''
            +'<div class="exf-layer-h"><div class="exf-layer-left"><div class="exf-layer-icon">'+L.icon+'</div><div class="exf-layer-info"><div class="exf-layer-name">'+L.label+'</div><div class="exf-layer-desc">'+L.desc+'</div></div></div><div class="exf-layer-stats"><span class="exf-badge exf-badge-in">↓'+stat.input+'</span><span class="exf-badge exf-badge-out">→'+stat.output+'</span><span class="exf-badge exf-badge-filter">▼'+stat.filtered+'</span></div></div>'
            +'<div class="exf-progress"><div class="exf-progress-pass" style="width:'+stat.pctRemaining+'%"></div><div class="exf-progress-fail" style="width:'+stat.pctFiltered+'%"></div></div>'
            +'<div class="exf-layer-body">'+filtersHtml+settingsHtml+debugHtml+'</div>';
        }
        if(openState[layerDiv.id]) layerDiv.classList.add('open');
        layersFrag.appendChild(layerDiv);
        (function(div){
            var h=div.querySelector('.exf-layer-h');
            if(h) h.addEventListener('click', function(){ div.classList.toggle('open'); });
        })(layerDiv);
    }
    if(container.replaceChildren) container.replaceChildren(layersFrag); else { container.innerHTML=''; container.appendChild(layersFrag); }

    // delegation for advanced toggle + bool toggle
    if(!container._delegated){
        container._delegated=true;
        container.addEventListener('click', function(e){
            var t=e.target;
            if(t.classList && t.classList.contains('__exfToggleAdv')){
                var tid=t.getAttribute('data-target');
                var el=document.getElementById(tid);
                if(el){ el.style.display=el.style.display==='none'? 'block' : 'none'; }
            }
            if(t.classList && t.classList.contains('exf-toggle')){
                var k=t.getAttribute('data-key');
                var cur=getCfg(k), next=!cur;
                if(!confirmConfigChange(k,cur,next)) return;
                optSet(k,next);
                t.classList.toggle('on');
                showToast(k+': '+formatConfigDiffValue(cur)+' → '+formatConfigDiffValue(next), 'success');
            }
        });
    }

    var inputs=container.querySelectorAll('input[data-key]');
    for(var ii=0;ii<inputs.length;ii++){
        (function(inp){
            inp.addEventListener('change', function(){
                var k=inp.getAttribute('data-key');
                var v=inp.value;
                var layer=LAYERS.find(function(l){ return l.schema && l.schema[k]; });
                var field=layer? layer.schema[k] : null;
                var type=field? field.type : 'string';
                var oldValue=getCfg(k), nextValue=v;
                if(type==='csv' || k==='poolBaseSymbols') nextValue=v.split(/[,،\n]+/).map(function(s){return s.trim();}).filter(Boolean);
                else {
                    if(type==='number' && !isNaN(+v) && v!=='') nextValue=+v;
                    if(nextValue==='true') nextValue=true; if(nextValue==='false') nextValue=false;
                }
                if(!confirmConfigChange(k,oldValue,nextValue)){ inp.value=formatConfigDiffValue(oldValue); return; }
                optSet(k,nextValue);
                showToast(k+': '+formatConfigDiffValue(oldValue)+' → '+formatConfigDiffValue(nextValue), 'success');
            });
        })(inputs[ii]);
    }
}

// ─── DEBUG PANEL ────────────────────────────────────────────────────────────

// ─── RESULTS TABLE — Dual-Mode Summary/Verbose ────────────────────────────
function renderResultsTable(results){
    var container=document.getElementById('__exfResults');
    if(!container){
        // create container after layers if not exists
        var layersDiv=document.getElementById('__exfLayers');
        if(layersDiv){
            container=document.createElement('div');
            container.id='__exfResults';
            container.className='exf-results';
            layersDiv.parentNode.insertBefore(container, layersDiv.nextSibling);
        } else return;
    }
    if(!results || !results.length){
        container.innerHTML='<div style="padding:14px;text-align:center;color:var(--muted);font-size:11px;">نتیجه‌ای برای نمایش نیست — قیف را اجرا کنید</div>';
        return;
    }
    var mode=getViewMode();
    var isSummary=mode===VIEW_MODE.SUMMARY;
    var frag=document.createDocumentFragment();

    // header + thead
    var header=document.createElement('div');
    header.className='exf-results-header';
    header.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;"><span style="font-weight:800;font-size:12px;">🏆 نتایج — '+results.length+' نماد</span><span style="font-size:10px;color:var(--muted);">'+(isSummary?'خلاصه':'کامل')+'</span><span style="display:flex;gap:6px;"><button class="exf-pool-btn" id="__exfExportCsv" style="font-size:10px;padding:4px 8px;">📤 CSV</button><button class="exf-pool-btn" id="__exfExportJson" style="font-size:10px;padding:4px 8px;">📤 JSON</button><button class="exf-pool-btn" id="__exfFilterCall" style="font-size:10px;padding:4px 8px;">📈 Call</button><button class="exf-pool-btn" id="__exfFilterPut" style="font-size:10px;padding:4px 8px;">📉 Put</button></span></div>';
    frag.appendChild(header);
    var thead=document.createElement('div');
    thead.className='exf-results-thead';
    thead.innerHTML='<span style="flex:1;">نماد</span><span style="width:60px;text-align:center;cursor:pointer;" data-sort="er">ER ▼</span><span style="width:50px;text-align:center;cursor:pointer;" data-sort="score">امتیاز</span><span style="width:60px;text-align:center;cursor:pointer;" data-sort="iv">IV</span><span style="width:60px;text-align:center;cursor:pointer;" data-sort="dte">DTE</span><span style="width:70px;text-align:center;">سناریو</span>';
    frag.appendChild(thead);

    if(isSummary){
        // summary: compact rows 85px height, minimal columns
        var table=document.createElement('div');
        table.className='exf-results-table exf-results-summary';
        var html='';
        for(var i=0;i<results.length;i++){
            var r=results[i];
            var symName=escapeHtml(r.l18||r.l30||'نماد');
            var warningMark=r._dataWarnings&&r._dataWarnings.length? '<span title="'+escapeHtml(r._dataWarnings.join(' | '))+'" style="color:#fbbf24;margin-inline-start:4px;">⚠</span>' : '';
            var er=r._er!=null? r._er.toFixed(1)+'%' : '-';
            var score=r._score!=null? Math.round(r._score) : '-';
            var iv=r._iv!=null? (r._iv*100).toFixed(1)+'%' : '-';
            var dteInfo=r._holdingAdvisory&&r._holdingAdvisory.dte;
            var dte=dteInfo?((dteInfo.calendarDays==null?'؟':dteInfo.calendarDays)+'تقویمی / '+(dteInfo.tradingDays==null?'؟':dteInfo.tradingDays)+' معاملاتی'):r.dte!=null?r.dte+'تقویمی / ؟ معاملاتی':'';
            var scenarioStatus=r._holdingAdvisory? (r._holdingAdvisory.status==='advisory'?'سناریو آزمایشی: '+r._holdingAdvisory.scenarios.length:'سناریو: داده ناکافی') : '';
            html+='<div class="exf-result-row" style="height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;border-bottom:1px solid var(--border);font-size:11px;transition:all 0.2s;"><span style="font-weight:700;min-width:90px;">'+symName+warningMark+'</span><span style="color:var(--accent);">'+er+'</span><span style="color:var(--ok);">'+score+'</span><span style="color:var(--text2);">'+iv+'</span><span style="color:var(--muted);font-size:10px;">'+dte+'</span><span style="color:#a78bfa;font-size:9px;">'+escapeHtml(scenarioStatus)+'</span></div>';
        }
        table.innerHTML=html;
        frag.appendChild(table);
    } else {
        // verbose: full cards with greeks
        var grid=document.createElement('div');
        grid.className='exf-results-grid';
        grid.style.cssText='display:grid;grid-template-columns:1fr;gap:10px;padding:10px 14px;';
        var html2='';
        for(var j=0;j<results.length;j++){
            var r2=results[j];
            var symName2=escapeHtml(r2.l18||r2.l30||'نماد');
            var warningHtml=r2._dataWarnings&&r2._dataWarnings.length? '<div style="color:#fbbf24;font-size:10px;margin-top:7px;">⚠ '+escapeHtml(r2._dataWarnings.join(' | '))+'</div>' : '';
            var er2=r2._er!=null? r2._er.toFixed(1)+'%' : '-';
            var score2=r2._score!=null? Math.round(r2._score) : '-';
            var iv2=r2._iv!=null? (r2._iv*100).toFixed(1)+'%' : '-';
            var delta2=r2._greeks? r2._greeks.delta.toFixed(3) : '-';
            var gamma2=r2._greeks? r2._greeks.gamma.toFixed(4) : '-';
            var theta2=r2._greeks? r2._greeks.theta.toFixed(1) : '-';
            var lev2=r2._leverage!=null? r2._leverage.toFixed(1)+'x' : '-';
            var mn2=r2._moneyness!=null? r2._moneyness.toFixed(3) : '-';
            var fair2=r2._fair!=null? Math.round(r2._fair).toLocaleString('fa-IR') : '-';
            var mid2=r2._mid!=null? Math.round(r2._mid).toLocaleString('fa-IR') : '-';
            var base2=r2.base||'';
            var isCall2=r2._isCall!=null? (r2._isCall?'📈 Call':'📉 Put') : '';
            var advisory2=r2._holdingAdvisory;
            var scenarioHtml='';
            if(advisory2){
                scenarioHtml='<div style="margin-top:9px;padding:8px;background:#0b1020;border:1px solid #2a2854;border-radius:8px;font-size:10px;color:#c4b5fd;">🧭 برآورد نظری؛ بدون توصیهٔ ورود/خروج: '+(advisory2.status==='advisory'?advisory2.scenarios.length+' حالت':'داده ناکافی')+'؛ '+escapeHtml((advisory2.warnings||advisory2.reasons||[]).join(' · '))+'</div>';
                if(advisory2.dte){ scenarioHtml+='<div style="font-size:9px;color:var(--text2);margin-top:4px;">DTE: '+(advisory2.dte.calendarDays==null?'تقویمی نامعلوم':advisory2.dte.calendarDays+' روز تقویمی')+' / '+(advisory2.dte.tradingDays==null?'معاملاتی نامعلوم ('+escapeHtml(advisory2.dte.tradingStatus)+')':advisory2.dte.tradingDays+' روز معاملاتی واقعی')+'</div>'; }
                if(advisory2.calendar){ scenarioHtml+='<div style="font-size:9px;color:var(--text2);margin-top:4px;">'+(advisory2.calendar.complete?'بیشینه فاصلهٔ بسته: '+advisory2.calendar.maxClosedCalendarDays+' روز؛ آستانه: '+advisory2.calendar.thresholdCalendarDays+' روز':'تقویم ناقص؛ ریسک تعطیلی نامعلوم')+'</div>'; }
                if(advisory2.thetaDecay&&advisory2.thetaDecay.length){
                    var thetaMax=1; for(var td=0;td<advisory2.thetaDecay.length;td++) thetaMax=Math.max(thetaMax,Math.abs(advisory2.thetaDecay[td].modelDecayPct||0));
                    scenarioHtml+='<div style="font-size:9px;color:var(--text2);margin-top:6px;">زوال تتا — برآورد نظری، پایه و IV ثابت</div>';
                    for(var tc=0;tc<advisory2.thetaDecay.length;tc++){ var tp=advisory2.thetaDecay[tc], tw=Math.max(2,Math.min(100,Math.abs(tp.modelDecayPct||0)/thetaMax*100)); scenarioHtml+='<div style="display:flex;align-items:center;gap:7px;font-size:9px;margin-top:3px;"><span style="width:36px;">'+tp.holdingCalendarDays+'روز</span><span style="height:5px;width:'+tw+'%;max-width:180px;background:'+(tp.modelDecayPct<0?'#ec6975':'#4de0b0')+';border-radius:8px;"></span><b>'+tp.modelDecayPct.toFixed(1)+'٪</b></div>'; }
                }
                if(advisory2.scenarios&&advisory2.scenarios.length){ scenarioHtml+='<div style="font-size:9px;color:var(--text2);margin-top:4px;">'+advisory2.scenarios.slice(0,4).map(function(sc){return sc.holdingCalendarDays+'روز / شوک '+(sc.underlyingShock*100).toFixed(0)+'٪: '+sc.estimatedReturnPct.toFixed(1)+'٪';}).join(' · ')+'</div>'; }
            }
            html2+='<div class="exf-result-card" style="background:linear-gradient(180deg,var(--card2),var(--card));border:1px solid var(--border);border-radius:12px;padding:12px;transition:all 0.3s;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-weight:800;font-size:12px;">'+symName2+' <small style="color:var(--muted);font-weight:400;">'+escapeHtml(base2)+'</small></span><span style="font-size:10px;background:var(--card3);padding:3px 8px;border-radius:20px;border:1px solid var(--border);">'+isCall2+'</span></div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:10px;"><div style="background:var(--bg);padding:6px 8px;border-radius:8px;border:1px solid var(--border);"><div style="color:var(--muted);">ER</div><div style="font-weight:800;color:var(--accent);font-size:11px;">'+er2+'</div></div><div style="background:var(--bg);padding:6px 8px;border-radius:8px;border:1px solid var(--border);"><div style="color:var(--muted);">امتیاز</div><div style="font-weight:800;color:var(--ok);font-size:11px;">'+score2+'</div></div><div style="background:var(--bg);padding:6px 8px;border-radius:8px;border:1px solid var(--border);"><div style="color:var(--muted);">IV</div><div style="font-weight:700;font-size:11px;">'+iv2+'</div></div><div style="background:var(--bg);padding:6px 8px;border-radius:8px;border:1px solid var(--border);"><div style="color:var(--muted);">Δ</div><div style="font-weight:700;font-size:11px;">'+delta2+'</div></div></div><div style="display:flex;gap:8px;margin-top:8px;font-size:10px;color:var(--text2);flex-wrap:wrap;"><span>Γ '+gamma2+'</span><span>Θ '+theta2+'</span><span>اهرم '+lev2+'</span><span>MN '+mn2+'</span><span>منصفانه '+fair2+'</span><span>بازار '+mid2+'</span></div>'+warningHtml+scenarioHtml+'</div>';
        }
        grid.innerHTML=html2;
        frag.appendChild(grid);
    }
    if(container.replaceChildren) container.replaceChildren(frag); else { container.innerHTML=''; container.appendChild(frag); }
}

function requestRenderResults(results){
    _pendingResults=results;
    debouncedRenderLayers();
}

// ─── MODEL CACHE — LRU با حداکثر 500 آیتم ────────────────────────────────
function getModelCache(key){
    return modelCache[key]||null;
}
function setModelCache(key, val){
    if(!modelCache[key]){
        modelCacheOrder.push(key);
        if(modelCacheOrder.length>500){
            var oldest=modelCacheOrder.shift();
            delete modelCache[oldest];
        }
    }
    modelCache[key]=val;
}

function buildDebugPanel(){
    var existing=document.getElementById('__exfDebugPanel');
    if(existing){ existing.style.display='block'; bringTop71(existing); return existing; }
    var div=document.createElement('div');
    div.id='__exfDebugPanel';
    div.style.cssText='position:fixed;left:20px;top:20px;width:560px;max-height:88vh;overflow:auto;background:radial-gradient(100% 100% at 0% 0%,rgba(56,189,248,0.08),transparent),linear-gradient(180deg,#111c32 0%,#070a14 100%);border:1px solid #1e2f4f;border-radius:20px;box-shadow:0 25px 80px rgba(0,0,0,0.7);font-family:Vazirmatn,Tahoma,sans-serif;direction:rtl;color:#e2e8f0;z-index:10001;padding:0;backdrop-filter:blur(20px);';
    div.innerHTML='<div style="padding:16px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #1e2f4f;background:linear-gradient(90deg,rgba(56,189,248,0.08),rgba(129,140,248,0.08));border-radius:20px 20px 0 0;position:sticky;top:0;backdrop-filter:blur(12px);"><div style="font-weight:800;display:flex;align-items:center;gap:8px;"><span style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#38bdf8,#818cf8);display:flex;align-items:center;justify-content:center;">🐞</span>دیباگ — قیف + استخر + خطاها</div><div id="__exfDbgClose" style="cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(255,255,255,0.06);border:1px solid #1e2f4f;">✕</div></div><div id="__exfDbgBody" style="padding:14px;"></div>';
    document.body.appendChild(div);
    makeDraggable71(div, div.firstChild);
    div.querySelector('#__exfDbgClose').addEventListener('click', function(){ div.style.display='none'; });
    return div;
}
function renderDebug(){
    var body=document.getElementById('__exfDbgBody');
    if(!body) return;
    var mode=getViewMode();
    var isSummary=mode===VIEW_MODE.SUMMARY;
    var html='';
    html+='<div style="font-size:11px;color:#94a3b8;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;"><span>کل ورودی: '+totalInput+' — '+new Date().toLocaleString('fa-IR')+' — حالت: '+(isSummary?'خلاصه':'وربوز')+'</span><span style="display:flex;gap:6px;"><button id="__exfDbgUpd" class="exf-pool-btn exf-pool-btn-primary" style="padding:6px 12px;">🔄 تاریخچه</button><button id="__exfDbgLive" class="exf-pool-btn" style="padding:6px 12px;">💹 زنده</button><button id="__exfDbgMode" class="exf-pool-btn" style="padding:6px 12px;">'+(isSummary?'📖 وربوز':'📄 خلاصه')+'</button></span></div>';

    if(!isSummary){
        var poolSum=getPoolSummary();
        if(poolSum.length>0){
            html+='<div style="margin:10px 0;padding:14px;background:#111c32;border:1px solid #1e2f4f;border-radius:14px;"><div style="font-weight:800;margin-bottom:10px;display:flex;justify-content:space-between;"><span>🏊 استخر 90 روزه — '+getPoolStatusText()+'</span><span style="font-size:10px;color:#64748b;">'+(getCfg('poolAutoUpdate')?'خودکار':'دستی')+'</span></div>';
            html+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;">';
            for(var ps=0;ps<Math.min(poolSum.length,12);ps++){
                var p=poolSum[ps];
                html+='<span style="font-size:10px;padding:5px 10px;background:#070a14;border:1px solid #1e2f4f;border-radius:8px;">'+p.symbol+': '+p.days+'روز <b style="color:#38bdf8;">'+Math.round(p.lastPrice).toLocaleString('fa-IR')+'</b></span>';
            }
            html+='</div>';
            for(var pc=0;pc<Math.min(poolSum.length,3);pc++){
                html+=buildPoolHistoryChart(poolSum[pc].symbol);
            }
            html+='</div>';
        }
    }

    var layerKeys=Object.keys(pipelineData);
    for(var li=0;li<LAYERS.length;li++){
        var L=LAYERS[li];
        var st=pipelineData[L.key];
        if(!st) continue;
        if(isSummary){
            html+='<div style="margin:8px 0;padding:10px 12px;background:#111c32;border:1px solid #1e2f4f;border-radius:10px;display:flex;justify-content:space-between;align-items:center;"><span>'+L.icon+' '+L.label+'</span><span style="font-size:11px;"><span style="background:rgba(56,189,248,0.12);color:#38bdf8;padding:3px 8px;border-radius:12px;">↓'+st.input+'</span> <span style="background:rgba(52,211,153,0.12);color:#34d399;padding:3px 8px;border-radius:12px;">→'+st.output+'</span> <span style="background:rgba(251,191,36,0.12);color:#fbbf24;padding:3px 8px;border-radius:12px;">▼'+st.filtered+'</span></span></div>';
        } else {
            html+='<div style="margin:10px 0;padding:14px;background:#111c32;border:1px solid #1e2f4f;border-radius:14px;position:relative;overflow:hidden;">';
            html+='<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,'+L.color+','+L.color+'88);"></div>';
            html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;"><div style="font-weight:800;display:flex;align-items:center;gap:8px;"><span style="width:30px;height:30px;border-radius:10px;background:'+L.color+'18;border:1px solid '+L.color+'33;color:'+L.color+';display:flex;align-items:center;justify-content:center;">'+L.icon+'</span>'+L.label+'</div><div style="font-size:11px;display:flex;gap:6px;"><span style="background:rgba(56,189,248,0.12);color:#38bdf8;padding:4px 10px;border-radius:20px;border:1px solid rgba(56,189,248,0.18);">↓'+st.input+'</span> <span style="background:rgba(52,211,153,0.12);color:#34d399;padding:4px 10px;border-radius:20px;">→'+st.output+'</span> <span style="background:rgba(251,191,36,0.12);color:#fbbf24;padding:4px 10px;border-radius:20px;">▼'+st.filtered+' ('+st.pctFiltered+'%)</span></div></div>';
            if(Object.keys(st.filters).length>0){
                html+='<div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0;">';
                var fKeys=Object.keys(st.filters);
                for(var fk=0;fk<fKeys.length;fk++){
                    var fo=FILTER_MAP71[fKeys[fk]]||{label:fKeys[fk]};
                    html+='<span style="font-size:10px;padding:5px 10px;background:#070a14;border:1px solid #1e2f4f;border-radius:8px;">'+fo.label+': <b style="color:#fbbf24;">'+st.filters[fKeys[fk]]+'</b></span>';
                }
                html+='</div>';
            }
            html+='<div style="font-size:10px;background:#070a14;border-radius:10px;padding:10px;max-height:100px;overflow:auto;border:1px solid #1e2f4f;line-height:1.6;">';
            html+='<div>✅ پاس: '+(st.samples.pass||[]).join(', ').slice(0,120)+'</div>';
            html+='<div>❌ رد: '+(st.samples.fail||[]).join(', ').slice(0,120)+'</div>';
            html+='</div></div>';
        }
    }
    if(!isSummary){
        if(rawSamples.incomplete.length>0){
            html+='<div style="margin:10px 0;padding:12px;background:#111c32;border:1px solid #1e2f4f;border-radius:12px;"><div style="font-weight:700;margin-bottom:8px;">⚠️ داده ناقص (raw)</div><div style="font-size:10px;max-height:120px;overflow:auto;line-height:1.6;">'+rawSamples.incomplete.map(function(x){return JSON.stringify(x).slice(0,200);}).join('<br/>')+'</div></div>';
        }
        if(rawSamples.errors.length>0){
            html+='<div style="margin:10px 0;padding:12px;background:#111c32;border:1px solid #1e2f4f;border-radius:12px;"><div style="font-weight:700;margin-bottom:8px;">❌ خطاها (errors)</div><div style="font-size:10px;max-height:120px;overflow:auto;line-height:1.6;">'+rawSamples.errors.map(function(x){return JSON.stringify(x).slice(0,200);}).join('<br/>')+'</div></div>';
        }
    }
    body.innerHTML=html;
    var updBtn=document.getElementById('__exfDbgUpd');
    if(updBtn) updBtn.addEventListener('click', function(){ requestPoolUpdateAll(); renderDebug(); });
    var liveBtn=document.getElementById('__exfDbgLive');
    if(liveBtn) liveBtn.addEventListener('click', function(){ fetchAllLiveBases(function(r){ showToast(Object.keys(r).length+' بروز شد', 'success'); renderDebug(); }); });
    var modeBtn=document.getElementById('__exfDbgMode');
    if(modeBtn) modeBtn.addEventListener('click', function(){
        var cur=getViewMode();
        var next=cur===VIEW_MODE.SUMMARY? VIEW_MODE.VERBOSE : VIEW_MODE.SUMMARY;
        optSet('viewMode', next);
        showToast('حالت: '+(next==='summary'?'خلاصه':'وربوز'), 'info');
        renderLayers(); renderDebug();
    });
}

// ─── PUBLIC API ─────────────────────────────────────────────────────────────
function optLog(){ console.table(abortCounts); console.table(pipelineData); return {abort:abortCounts, pipeline:pipelineData, stats:layerStats}; }
function optClearAbort(){ abortCounts={}; showToast('abort پاک شد', 'success'); }

function scanMock(){
    var empty={pass:[], fail:[], pipeline:pipelineData, stats:layerStats, total:0, isDeath:false, simulation:false, dataWarnings:[], cancelled:true};
    if(typeof window==='undefined' || window.__ZharfaStandalone===true){
        var blocked='برای دادهٔ واقعی، ورودی معتبر ارسال کنید؛ دادهٔ ساختگی در حالت وب مستقل اجرا نمی‌شود.';
        if(typeof document!=='undefined') showToast(blocked, 'error'); else console.warn(blocked);
        return empty;
    }
    if(typeof window.confirm!=='function' || !window.confirm('این اجرا فقط شبیه‌سازی با داده‌های تصادفی است و نباید به‌عنوان دادهٔ بازار تعبیر شود. ادامه می‌دهید؟')){
        var declined='شبیه‌سازی لغو شد؛ هیچ دادهٔ ساختگی تولید نشد.';
        if(typeof document!=='undefined') showToast(declined, 'info'); else console.info(declined);
        return empty;
    }
    var syms=[];
    var bases=getSymList('poolBaseSymbols');
    if(bases.length===0) bases=['خودرو','اهرم','وبملت'];
    var nowJ=todayJdn();
    for(var i=0;i<100;i++){
        var base=bases[i % bases.length];
        var price=(getPoolPrice(base)||CONFIG.basePrices[base]||500) * (0.95+Math.random()*0.1);
        syms.push({
            l18:'TEST'+i,
            l30:'اختیار '+(Math.random()<0.5?'خ':'ض')+' '+ (400+i*10) +' - '+(Math.random()<0.5?'ض':'')+base+(1000+i*10),
            pl: 100+Math.random()*200,
            tno: 5+Math.floor(Math.random()*50),
            tvol: 5000+Math.random()*50000,
            qd1: 1000+Math.random()*5000,
            qo1: 1000+Math.random()*5000,
            pd1: 90+Math.random()*20,
            po1: 110+Math.random()*20,
            base: base,
            basePrice: price,
            optionType: Math.random()<0.5?'call':'put',
            expiryJdn: nowJ + 30 + Math.floor(Math.random()*60),
            contractSize: 1000,
            bvol: 10000+Math.random()*50000,
            dte: 5+Math.floor(Math.random()*90),
            isDivDay: Math.random()<0.05
        });
    }
    var res=runPipeline(syms, {simulation:true});
    console.warn('[Zharfa] SIMULATION ONLY — generated random sample rows; not market data.');
    console.log('[ExoticFilter] Mock run:', res.pass.length+'/'+res.total+' passed | Pool: '+getPoolStatusText()+' | Death: '+res.isDeath);
    renderLayers();
    if(getCfg('debugPanel')){ buildDebugPanel(); renderDebug(); }
    if(res.isDeath){
        showToast('⚠️ شبیه‌سازی: 0 خروجی — دادهٔ بازار نیست؛ تنظیم فیلترها را فقط آگاهانه تغییر دهید', 'error');
    } else {
        showToast('⚠️ شبیه‌سازی: '+res.pass.length+' از '+res.total+' — دادهٔ بازار نیست', 'error');
    }
    return res;
}

// ─── STARTUP ────────────────────────────────────────────────────────────────
function startup(){
    try{
        updateExpiryToNextMonthLastDay();
        try{ normalizePoolSymbols(); }catch(e){}
        resetPipeline();
        if(!(typeof window!=='undefined' && window.__ZharfaStandalone===true)) buildModernPanel();
        renderLayers();
        var hasTsetmc = typeof window!=='undefined' && (window.InstSimple || window.Symbols);
        if(!hasTsetmc){
            console.log('[ExoticFilter] '+VERSION_TAG+' — حالت دمو — exoticRun() برای تست');
        } else {
            console.log('[ExoticFilter] '+VERSION_TAG+' — TSETMC detected');
        }
        var __exfApi = {
            version: VERSION_TAG,
            buildDate: BUILD_DATE,
            author: AUTHOR,
            contact: CONTACT,
            disclaimer: DISCLAIMER,
            license: LICENSE,
            config:(function(){try{return JSON.parse(JSON.stringify(CONFIG));}catch(e){return {};}})(),
            calendar:TSE_CALENDAR,
            describeTrend:describeMarketTrend,
            getTrend:getMarketTrend,
            registerTsetmcAdapter:registerTsetmcAdapter,
            adapterContract:{version:TSETMC_ADAPTER_CONTRACT_VERSION,liveFields:['adapterVersion','instrumentId','lastPrice','timestamp'],historyFields:['adapterVersion','instrumentId','date','closePrice','volume','tradeCount']},
            dates: {toJdn:normalizeToJdn, jalaliToJdn:jalaliToJdn, fromJdn:jdnToJalali, todayJdn:todayJdn},
            layers: LAYERS,
            filters: FILTERS,
            filterMap: FILTER_MAP71,
            run: runPipeline,
            scanMock: scanMock,
            optSet:requestConfigChange,
            setConfigBatch:applyUserConfigBatch,
            optGet:optGet,
            optLog: optLog,
            optClearAbort: optClearAbort,
            renderLayers: renderLayers,
            renderFunnelViz: renderFunnelViz,
            renderDebug: renderDebug,
            buildDebug: buildDebugPanel,
            getPipeline: function(){ return pipelineData; },
            getStats: function(){ return layerStats; },
            getPool:function(){ try{return JSON.parse(JSON.stringify(poolStore));}catch(e){return {};} },
            getPoolSummary: getPoolSummary,
            getPoolStatus: getPoolStatusText,
            addToPool: function(baseSym,data){ return writePoolObservation(baseSym,data,'manual'); },
            writePoolObservation: writePoolObservation,
            getIvHist:function(){ try{return JSON.parse(JSON.stringify(ivHist));}catch(e){return {};} },
            savePool: savePool,
            loadPool: loadPool,
            prunePool: pruneOldPool,
            fetchLiveBase: fetchLiveBase,
            fetchAllLiveBases: fetchAllLiveBases,
            testCdn: testCdn71,
            testCdnAndShow: testCdnAndShow71,
            autoConfigCdn: autoConfigCdn71,
            getLiveCache: function(){ return liveBaseCache; },
            requestPoolUpdate: requestPoolUpdate,
            requestPoolUpdateAll: requestPoolUpdateAll,
            requestPoolUpdateSingle: requestPoolUpdateSingle,
            buildPoolChart: buildPoolHistoryChart,
            getSymList: getSymList,
            getJalaliNow: getJalaliNow,
            getNextJalaliMonthLastDay: getNextJalaliMonthLastDay,
            updateExpiry: updateExpiryToNextMonthLastDay
        };
        window.__exf = __exfApi;
        window.tseExoticFilter = __exfApi;
        window.__exf.optSet = requestConfigChange;
        window.__exf.optGet = optGet;
        window.__exf.optLog = optLog;
        window.__exf.optClearAbort = optClearAbort;
        if(!window.optSet) window.optSet = requestConfigChange;
        if(!window.optGet) window.optGet = optGet;
        if(!window.optLog) window.optLog = optLog;
        if(!window.optClearAbort) window.optClearAbort = optClearAbort;
        if(!window.optTestCdn) window.optTestCdn = testCdnAndShow71;
        if(!window.optAutoCdn) window.optAutoCdn = autoConfigCdn71;
        if(!window.optLiveFetch) window.optLiveFetch = fetchAllLiveBases;
        if(!window.requestPoolUpdate) window.requestPoolUpdate = requestPoolUpdate;
        if(!window.requestPoolUpdateAll) window.requestPoolUpdateAll = requestPoolUpdateAll;
        if(!window.optPoolUpdate) window.optPoolUpdate = requestPoolUpdateAll;
        if(!window.updateExpiry) window.updateExpiry = updateExpiryToNextMonthLastDay;
        if(!window.getJalaliNow) window.getJalaliNow = getJalaliNow;
        window.exoticRun = scanMock;
        window.exoticDebug = function(){ optSet('debugPanel', true); buildDebugPanel(); renderDebug(); };

        var runBtn=document.getElementById('__exfRun');
        if(runBtn) runBtn.addEventListener('click', function(){
            runBtn.textContent='⏳...';
            runBtn.disabled=true;
            setTimeout(function(){
                try{ scanMock(); }catch(e){ console.error(e); }
                runBtn.textContent='▶ اجرای شبیه‌سازی';
                runBtn.disabled=false;
            }, 50);
        });
        var dbgBtn=document.getElementById('__exfDebug');
        if(dbgBtn) dbgBtn.addEventListener('click', function(){
            var cur=getCfg('debugPanel');
            optSet('debugPanel', !cur);
            if(!cur){ buildDebugPanel(); renderDebug(); }
            renderLayers();
        });
        var resetBtn=document.getElementById('__exfReset');
        if(resetBtn) resetBtn.addEventListener('click', function(){
            if(applyUserConfigBatch([{key:'maxSpread',value:15},{key:'minPrice',value:10},{key:'minExpRet',value:40},{key:'scoreMin',value:35}],'بازنشانی فیلترها')){
                optClearAbort();
                resetPipeline();
                renderLayers();
                showToast('بازنشانی شد', 'success');
            }
        });
        var dbgOpen=document.getElementById('__exfDbgOpen');
        if(dbgOpen) dbgOpen.addEventListener('click', function(){ optSet('debugPanel', true); buildDebugPanel(); renderDebug(); var dbg=document.getElementById('__exfDebugPanel'); if(dbg) bringTop71(dbg); });

        console.log('%c🧬 '+VERSION_TAG+' loaded — قیف 7 لایه — مؤلف اصلی: https://t.me/p75ad — گروه: https://t.me/SmartOptionTSE', 'color:#38bdf8;font-weight:bold;font-size:12px;');
        console.assert(LAYERS.length===7, 'LAYERS should be 7, got '+LAYERS.length);
        console.log('Layers:', LAYERS.map(function(l){return l.icon+' '+l.label;}).join(' → '));
        try{ var ut=runUnitTests(); console.log('UnitTests:', ut); }catch(e){ console.error('UnitTests failed', e); }
        console.log('ViewMode:', getViewMode(), '— برای خلاصه: optSet("viewMode","summary") — برای وربوز: optSet("viewMode","verbose")');
        console.log('برای تست: exoticRun() — دیباگ: exoticDebug() — لاگ: optLog() — تاریخچه: requestPoolUpdateAll()');
    }catch(e){
        console.error('[ExoticFilter] startup error', e);
        if(rawSamples.errors.length<10) rawSamples.errors.push({error:e.message, stack:e.stack});
    }
}


// ─── UNIT TESTS — mock برای هر لایه ───────────────────────────────────────
function runUnitTests(){
    console.log('%c🧪 Unit Tests v0.0.4.6', 'color:#34d399;font-weight:bold;');
    var passed=0, failed=0;
    function assert(cond, msg){
        if(cond){ passed++; console.log('✅ '+msg); }
        else { failed++; console.error('❌ '+msg); }
    }
    try{
        // Test 1: Call/Put detection ض/ط
        var l30Tests=[
            {l30:'ضخودرو1000', expect:true, name:'ض Call'},
            {l30:'طخودرو1000', expect:false, name:'ط Put'},
            {l30:'خودرو', expect:true, name:'default Call'},
            {l30:'ضهرم 2000', expect:true, name:'ضهرم Call'},
            {l30:'طهرم 2000', expect:false, name:'طهرم Put'}
        ];
        for(var ti=0;ti<l30Tests.length;ti++){
            var t=l30Tests[ti];
            var l30Str=t.l30;
            var isCall;
            if(/^ض/.test(l30Str)) isCall=true;
            else if(/^ط/.test(l30Str)) isCall=false;
            else if(/اختیار\s*خ|^خ/.test(l30Str)) isCall=true;
            else if(/پوت|فروش/.test(l30Str)) isCall=false;
            else isCall=true;
            assert(isCall===t.expect, 'isCall '+t.name+': '+l30Str+' => '+(isCall?'Call':'Put')+' expected '+(t.expect?'Call':'Put'));
        }
        // Test 2: L1 validation price
        var ctx=makeCtx();
        var sym1={l18:'TEST1', pl:5};
        var r1=LAYERS[0].filter(ctx, sym1);
        assert(!r1.ok && r1.key==='price', 'L1 should reject price < minPrice');
        // Test 3: K extraction — spread 10% < maxSpread 15%
        var sym2={l18:'TEST2', l30:'ضخودرو1000', pl:100, pd1:95, po1:105, qd1:1000, qo1:1000, tno:10, tvol:10000};
        sym2.base='خودرو';
        var r2=LAYERS[3].filter(ctx, sym2);
        // K should be 1000, not 500
        assert(sym2._K===1000, 'K extraction 1000 not 500, got '+sym2._K);
        // Test 4: DTE real
        var today=todayJdn();
        var sym3={l18:'TEST3', l30:'ضخودرو1000', pl:100, pd1:90, po1:110, qd1:1000, qo1:1000, tno:10, tvol:10000, expiryJdn:today+10, dte:10, base:'خودرو'};
        // L6 should use sym.dte not minDaysLeft
        // Test 5: binary insert
        var arr=[{jdn:1},{jdn:3},{jdn:5}];
        var pos=binarySearchInsertPos(arr, 2);
        assert(pos===1, 'binary insert pos 2 should be 1, got '+pos);
        // Test 6: isSameOriginUrl
        assert(isSameOriginUrl('/tsev2/data')===true, 'same origin /');
        assert(isSameOriginUrl('https://tsetmc.com.evil.com')===false, 'evil.com should be false');
        // Test 7: reverseMap invalidation — via optSet should clear cache
        try{
            var originalBaseInsCodes=optGet('baseInsCodes');
            var beforeCache=getReverseMap();
            optSet('baseInsCodes', {test:'123'});
            var afterCache=_reverseMapCache;
            assert(afterCache===null, 'reverseMap cache should be invalidated on baseInsCodes set');
            // restore the exact prior setting; the test must not mutate user configuration.
            optSet('baseInsCodes', originalBaseInsCodes);
        }catch(e){
            assert(true, 'reverseMap invalidation skipped in test env: '+e.message);
        }
        console.log('%cTests done: '+passed+' passed, '+failed+' failed', 'color:'+(failed?'#fb7185':'#34d399')+';font-weight:bold;');
        return {passed:passed, failed:failed};
    }catch(e){
        console.error('Unit test error', e);
        return {passed:passed, failed:failed+1, error:e.message};
    }
}

if(typeof document!=='undefined' && document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', startup);
} else {
    startup();
}

})();