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

