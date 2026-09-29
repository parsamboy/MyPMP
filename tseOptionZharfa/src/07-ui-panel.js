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

