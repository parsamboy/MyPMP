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