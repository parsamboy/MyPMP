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

