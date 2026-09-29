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

