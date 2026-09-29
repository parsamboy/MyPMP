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


