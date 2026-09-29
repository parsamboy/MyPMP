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

