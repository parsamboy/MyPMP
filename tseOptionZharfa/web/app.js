(function () {
  'use strict';

  var api = window.__exf;
  var els = {
    data: document.getElementById('data-input'),
    file: document.getElementById('file-input'),
    count: document.getElementById('input-count'),
    message: document.getElementById('input-message'),
    run: document.getElementById('run-analysis'),
    clear: document.getElementById('clear-input'),
    saveConfig: document.getElementById('save-config'),
    results: document.getElementById('results-section'),
    summary: document.getElementById('result-summary'),
    metrics: document.getElementById('metric-cards'),
    pipeline: document.getElementById('pipeline-list'),
    rejects: document.getElementById('reject-list'),
    warning: document.getElementById('warning-summary'),
    scenarios: document.getElementById('scenario-list'),
    body: document.getElementById('results-body'),
    resultCount: document.getElementById('result-count'),
    empty: document.getElementById('empty-results'),
    trend: document.getElementById('trend-status'),
    profile: document.getElementById('profile-summary')
  };
  var lastResult = null;
  var inputRows = [];
  var MAX_FILE_BYTES = 2 * 1024 * 1024;
  var MAX_ROWS = 5000;
  var configKeys = ['minPrice', 'maxSpread', 'maxIvPremium', 'minExpRet', 'scoreMin', 'minDaysLeft'];
  var extraConfigKeys = ['modelTimeBasis', 'dtePenaltyBasis', 'marketHolidays', 'marketCalendarCompleteYears', 'holdScenarioDays', 'underlyingScenarioShocks', 'volatilityAnnualizationMode'];

  function faNumber(value) {
    return Number(value || 0).toLocaleString('fa-IR');
  }
  function setMessage(text, kind) {
    els.message.textContent = text || '';
    els.message.style.color = kind === 'error' ? '#fb7185' : kind === 'success' ? '#4de0b0' : '#f5c15c';
  }
  function parseInput(showError) {
    var text = els.data.value.trim();
    if (!text) {
      inputRows = [];
      els.count.textContent = '۰ ردیف';
      if (showError) setMessage('ابتدا دادهٔ واقعی را به‌صورت آرایهٔ JSON وارد یا بارگذاری کنید.', 'error');
      return null;
    }
    try {
      var parsed = JSON.parse(text);
      if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.symbols)) parsed = parsed.symbols;
      if (!Array.isArray(parsed)) throw new Error('ساختار ریشه باید آرایه یا شیء دارای symbols باشد.');
      if (parsed.length > MAX_ROWS) throw new Error('حداکثر ' + MAX_ROWS + ' ردیف در هر اجرا مجاز است.');
      if (parsed.some(function (row) { return !row || typeof row !== 'object' || Array.isArray(row); })) {
        throw new Error('هر عضو آرایه باید یک شیء نماد باشد.');
      }
      inputRows = parsed;
      els.count.textContent = faNumber(parsed.length) + ' ردیف';
      if (showError) setMessage('ورودی معتبر است؛ ' + faNumber(parsed.length) + ' ردیف آمادهٔ تحلیل.', 'success');
      return parsed;
    } catch (error) {
      inputRows = [];
      els.count.textContent = 'ورودی نامعتبر';
      if (showError) setMessage(error.message || 'JSON معتبر نیست.', 'error');
      return null;
    }
  }
  function updateInputCount() {
    var parsed = parseInput(false);
    if (!els.data.value.trim()) return;
    if (parsed) setMessage('ساختار JSON معتبر است؛ داده هنوز اجرا نشده.', '');
    else setMessage('JSON نامعتبر است یا سقف ردیف‌ها رعایت نشده.', 'error');
  }
  function addMetric(label, value, detail, className) {
    var card = document.createElement('div');
    card.className = 'metric-card ' + (className || '');
    var labelEl = document.createElement('span'); labelEl.textContent = label;
    var valueEl = document.createElement('strong'); valueEl.textContent = value;
    var detailEl = document.createElement('small'); detailEl.textContent = detail || '';
    card.appendChild(labelEl); card.appendChild(valueEl); card.appendChild(detailEl);
    els.metrics.appendChild(card);
  }
  function renderMetrics(result, elapsed) {
    els.metrics.replaceChildren();
    var filtered = Object.keys(result.pipeline || {}).reduce(function (n, key) {
      return n + ((result.pipeline[key] && result.pipeline[key].filtered) || 0);
    }, 0);
    addMetric('کل ورودی', faNumber(result.total), 'ردیف کاربر', 'accent');
    addMetric('عبوری نهایی', faNumber(result.pass.length), result.total ? (100 * result.pass.length / result.total).toFixed(1) + '٪' : 'بدون ورودی', 'good');
    addMetric('تعداد حذف‌ها در لایه‌ها', faNumber(filtered), 'یک نماد می‌تواند در یک لایه حذف شود', '');
    addMetric('زمان محاسبه', Math.max(0, elapsed).toFixed(1) + ' ms', 'محاسبهٔ محلی مرورگر', '');
    var trend = typeof api.getTrend === 'function' ? api.getTrend() : { status: 'unknown', label: 'نامعلوم', reason: 'trend-module-unavailable' };
    addMetric('Trend توصیفی', trend.label || 'نامعلوم', trend.status === 'unknown' ? 'دادهٔ روند معتبر موجود نیست؛ در فیلتر دخالت ندارد.' : 'توصیفی، بدون امتیاز مالی یا اثر بر فیلتر', '');
    if (els.trend) { els.trend.textContent = trend.status === 'unknown' ? 'Trend: نامعلوم — سری شاخص معتبر/تازه در دسترس نیست؛ هیچ امتیاز یا فیلتر خنثی ساخته نمی‌شود.' : 'Trend توصیفی: ' + trend.label + ' · بدون اثر بر امتیاز/فیلتر'; els.trend.dataset.status = trend.status; }
    els.summary.textContent = faNumber(result.total) + ' ورودی · ' + faNumber(result.pass.length) + ' عبوری · ' + (result.simulation ? 'شبیه‌سازی' : 'ورودی کاربر');
  }
  function renderPipeline(result) {
    els.pipeline.replaceChildren();
    (api.layers || []).forEach(function (layer, index) {
      var stat = (result.pipeline || {})[layer.key] || { input: 0, output: 0, filtered: 0 };
      var row = document.createElement('div'); row.className = 'pipeline-row';
      var number = document.createElement('span'); number.className = 'pipeline-number'; number.textContent = String(index + 1).padStart(2, '0');
      var title = document.createElement('div');
      var label = document.createElement('div'); label.className = 'pipeline-label'; label.textContent = layer.label;
      var detail = document.createElement('div'); detail.className = 'pipeline-detail'; detail.textContent = faNumber(stat.input) + ' ورودی / ' + faNumber(stat.filtered) + ' حذف';
      title.appendChild(label); title.appendChild(detail);
      var track = document.createElement('div'); track.className = 'bar-track';
      var fill = document.createElement('div'); fill.className = 'bar-fill';
      fill.style.width = stat.input ? Math.max(0, Math.min(100, stat.output / stat.input * 100)) + '%' : '0%';
      track.appendChild(fill);
      var count = document.createElement('span'); count.className = 'pipeline-count'; count.textContent = faNumber(stat.output) + ' عبور';
      row.appendChild(number); row.appendChild(title); row.appendChild(track); row.appendChild(count); els.pipeline.appendChild(row);
    });
  }
  function renderRejects(result) {
    els.rejects.replaceChildren();
    var counts = {};
    (result.fail || []).forEach(function (failure) { counts[failure.reason] = (counts[failure.reason] || 0) + 1; });
    var keys = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 8);
    if (!keys.length) {
      var empty = document.createElement('div'); empty.className = 'empty-small'; empty.textContent = 'در این اجرا نمادی حذف نشد.'; els.rejects.appendChild(empty); return;
    }
    keys.forEach(function (key) {
      var row = document.createElement('div'); row.className = 'reject-row';
      var label = document.createElement('span');
      var filter = api.filters && api.filters[key];
      label.textContent = filter ? filter.label : key;
      var count = document.createElement('strong'); count.textContent = faNumber(counts[key]);
      row.appendChild(label); row.appendChild(count); els.rejects.appendChild(row);
    });
  }
  function renderWarnings(result) {
    els.warning.replaceChildren();
    var warnings = result.dataWarnings || [];
    if (result.simulation) warnings.push({ symbol: 'SIMULATION', warnings: ['این اجرا شبیه‌سازی است و دادهٔ بازار نیست.'] });
    (result.pass || []).forEach(function (symbol) { var advisory = symbol._holdingAdvisory; if (advisory && advisory.warnings && advisory.warnings.length) warnings.push({ symbol: symbol.l18 || symbol.l30 || '', warnings: advisory.warnings }); });
    if (!warnings.length) { els.warning.hidden = true; return; }
    els.warning.hidden = false;
    var unique = [];
    warnings.forEach(function (entry) {
      (entry.warnings || []).forEach(function (message) { if (unique.indexOf(message) < 0) unique.push(message); });
    });
    var text = document.createElement('span');
    text.textContent = 'هشدار کیفیت داده: ' + warnings.length + ' نماد دارای fallback/دادهٔ ناقص است. ' + unique.join(' · ');
    els.warning.appendChild(text);
  }
  function advisoryDte(symbol) {
    var dte = symbol._holdingAdvisory && symbol._holdingAdvisory.dte;
    if (dte) return (dte.calendarDays == null ? '—' : faNumber(dte.calendarDays) + ' تقویمی') + ' / ' + (dte.tradingDays == null ? 'معاملاتی: نامعلوم' : faNumber(dte.tradingDays) + ' معاملاتی');
    return symbol.dte == null ? '—' : faNumber(symbol.dte) + ' تقویمی / معاملاتی: نامعلوم';
  }
  function renderTable(result) {
    els.body.replaceChildren();
    els.resultCount.textContent = faNumber(result.pass.length);
    els.empty.hidden = result.pass.length !== 0;
    result.pass.slice(0, 500).forEach(function (symbol) {
      var tr = document.createElement('tr');
      function cell(text, className) { var td = document.createElement('td'); if (className) td.className = className; td.textContent = text; tr.appendChild(td); }
      cell(symbol.l18 || symbol.l30 || '—', 'symbol-name');
      cell(symbol.base || '—', 'symbol-code');
      cell(symbol._isCall == null ? '—' : (symbol._isCall ? 'Call' : 'Put'), '');
      cell(symbol._er == null ? '—' : symbol._er.toFixed(1) + '٪', '');
      cell(symbol._score == null ? '—' : Math.round(symbol._score).toString(), '');
      cell(symbol._iv == null ? '—' : (symbol._iv * 100).toFixed(1) + '٪', '');
      var dte = advisoryDte(symbol);
      cell(dte, '');
      var advisory = symbol._holdingAdvisory || {};
      cell(advisory.status === 'advisory' ? faNumber((advisory.scenarios || []).length) + ' حالت' : advisory.status === 'disabled' ? 'خاموش' : 'داده ناکافی', advisory.status === 'advisory' ? 'tag' : 'warn-tag');
      cell((symbol._dataWarnings || []).join(' · ') || '—', symbol._dataWarnings && symbol._dataWarnings.length ? 'warn-tag' : '');
      els.body.appendChild(tr);
    });
    if (result.pass.length > 500) {
      var tr = document.createElement('tr'); var td = document.createElement('td'); td.colSpan = 9; td.textContent = 'نمایش ۵۰۰ ردیف از ' + faNumber(result.pass.length) + '؛ برای دریافت همه، خروجی JSON بگیرید.'; tr.appendChild(td); els.body.appendChild(tr);
    }
  }
  function renderScenarios(result) {
    els.scenarios.replaceChildren();
    var symbols = result.pass || [];
    var available = symbols.filter(function (symbol) { return symbol._holdingAdvisory; });
    if (!available.length) { var empty = document.createElement('div'); empty.className = 'empty-small'; empty.textContent = 'در این اجرا نامزد عبوری برای نمایش سناریو وجود ندارد.'; els.scenarios.appendChild(empty); return; }
    available.slice(0, 8).forEach(function (symbol) {
      var advisory = symbol._holdingAdvisory;
      var card = document.createElement('article'); card.className = 'scenario-card';
      var title = document.createElement('strong'); title.textContent = (symbol.l18 || symbol.l30 || 'نماد') + ' · ' + (advisory.status === 'advisory' ? (advisory.scenarios || []).length + ' سناریو' : advisory.status === 'disabled' ? 'خاموش' : 'دادهٔ ناکافی'); card.appendChild(title);
      var caveats = document.createElement('p'); caveats.textContent = (advisory.warnings || advisory.reasons || []).join(' · ') || 'برآورد نظری؛ نه توصیهٔ معاملاتی.'; card.appendChild(caveats);
      if (advisory.dte) { var dteRow = document.createElement('p'); dteRow.textContent = 'DTE: ' + (advisory.dte.calendarDays == null ? 'تقویمی نامعلوم' : faNumber(advisory.dte.calendarDays) + ' روز تقویمی') + ' · ' + (advisory.dte.tradingDays == null ? 'معاملاتی نامعلوم (' + advisory.dte.tradingStatus + ')' : faNumber(advisory.dte.tradingDays) + ' روز معاملاتی واقعی'); card.appendChild(dteRow); }
      if (advisory.calendar) { var calendarRow = document.createElement('p'); calendarRow.textContent = advisory.calendar.complete ? ('تقویم تعطیلات علامت‌گذاری‌شده؛ بیشینه فاصلهٔ بسته ' + faNumber(advisory.calendar.maxClosedCalendarDays) + ' روز، آستانه ' + faNumber(advisory.calendar.thresholdCalendarDays) + ' روز؛ ریسک ' + (advisory.calendar.exceedsThreshold ? 'بالاتر از آستانه' : 'زیر آستانه')) : 'تقویم تعطیلات ناقص است؛ ریسک فاصلهٔ تعطیلی نامعلوم.'; card.appendChild(calendarRow); }
      if (advisory.thetaDecay && advisory.thetaDecay.length) {
        var thetaTitle = document.createElement('p'); thetaTitle.className = 'theta-heading'; thetaTitle.textContent = 'زوال تتا · برآورد نظری · پایه و IV ثابت'; card.appendChild(thetaTitle);
        var maxAbs = advisory.thetaDecay.reduce(function (maximum, point) { return Math.max(maximum, Math.abs(point.modelDecayPct || 0)); }, 0) || 1;
        advisory.thetaDecay.forEach(function (point) {
          var chartRow = document.createElement('div'); chartRow.className = 'theta-row';
          var label = document.createElement('span'); label.textContent = faNumber(point.holdingCalendarDays) + ' روز';
          var track = document.createElement('div'); track.className = 'theta-track';
          var bar = document.createElement('i'); bar.className = 'theta-bar ' + (point.modelDecayPct < 0 ? 'negative' : 'positive'); bar.style.width = Math.max(2, Math.min(100, Math.abs(point.modelDecayPct) / maxAbs * 100)) + '%'; track.appendChild(bar);
          var value = document.createElement('b'); value.textContent = (point.modelDecayPct > 0 ? '+' : '') + point.modelDecayPct.toFixed(1) + '٪';
          chartRow.appendChild(label); chartRow.appendChild(track); chartRow.appendChild(value); card.appendChild(chartRow);
        });
      }
      (advisory.scenarios || []).slice(0, 5).forEach(function (scenario) {
        var row = document.createElement('p'); row.className = 'scenario-values';
        row.textContent = scenario.holdingCalendarDays + 'd · shock ' + (scenario.underlyingShock * 100).toFixed(0) + '% · estimated change ' + scenario.estimatedReturnPct.toFixed(1) + '%'; card.appendChild(row);
      });
      els.scenarios.appendChild(card);
    });
    if (available.length > 8) { var note = document.createElement('p'); note.className = 'settings-hint'; note.textContent = 'نمایش ۸ نامزد از ' + faNumber(available.length) + '؛ خروجی JSON شامل همهٔ سناریوهاست.'; els.scenarios.appendChild(note); }
  }
  function renderResult(result, elapsed) {
    lastResult = result;
    els.results.hidden = false;
    renderMetrics(result, elapsed);
    renderPipeline(result);
    renderRejects(result);
    renderWarnings(result);
    renderScenarios(result);
    renderTable(result);
    els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function run() {
    if (!api || typeof api.run !== 'function') { setMessage('موتور تحلیل بارگذاری نشد؛ صفحه را تازه‌سازی کنید.', 'error'); return; }
    var parsed = parseInput(true);
    if (!parsed) return;
    if (!parsed.length) { setMessage('آرایه خالی است؛ هیچ داده‌ای تحلیل نشد.', 'error'); return; }
    els.run.disabled = true;
    setMessage('در حال اجرای لایه‌ها…', '');
    window.setTimeout(function () {
      try {
        var safeCopy = JSON.parse(JSON.stringify(parsed));
        var start = performance.now();
        var result = api.run(safeCopy, { source: 'user-input' });
        var elapsed = performance.now() - start;
        renderResult(result, elapsed);
        setMessage('تحلیل تمام شد؛ ورودی شما تغییر داده نشد.', 'success');
      } catch (error) {
        setMessage('اجرای تحلیل با خطا روبه‌رو شد: ' + (error.message || error), 'error');
      } finally { els.run.disabled = false; }
    }, 0);
  }
  function refreshConfig() {
    document.querySelectorAll('[data-config]').forEach(function (input) {
      input.value = api.optGet(input.dataset.config);
    });
    if (els.profile) els.profile.textContent = 'minExpRet: ' + api.optGet('minExpRet') + '٪ · scoreMin: ' + api.optGet('scoreMin') + ' · مدل زمان: ' + api.optGet('modelTimeBasis') + ' — فقط نمایش؛ بدون تغییر خودکار آستانه‌ها.';
  }
  function saveConfig() {
    var changes = [];
    for (var i = 0; i < configKeys.length; i++) {
      var key = configKeys[i];
      var input = document.querySelector('[data-config=\"' + key + '\"]');
      var value = Number(input.value);
      var min = input.min === '' ? -Infinity : Number(input.min);
      var max = input.max === '' ? Infinity : Number(input.max);
      if (!Number.isFinite(value) || value < min || value > max) {
        input.classList.add('invalid'); setMessage('مقدار ' + key + ' خارج از محدودهٔ مجاز است.', 'error'); input.focus(); return;
      }
      input.classList.remove('invalid');
      if (value !== Number(api.optGet(key))) changes.push({ key: key, value: value });
    }
    var allowed = { modelTimeBasis: ['legacy-hold', 'calendar-expiry', 'tse-trading'], dtePenaltyBasis: ['calendar', 'trading'], volatilityAnnualizationMode: ['legacy252', 'tse-calendar'] };
    for (var j = 0; j < extraConfigKeys.length; j++) {
      var extraKey = extraConfigKeys[j];
      var extraInput = document.querySelector('[data-config=\"' + extraKey + '\"]');
      var raw = extraInput.value.trim();
      var parsed;
      if (allowed[extraKey]) {
        parsed = raw;
        if (allowed[extraKey].indexOf(parsed) < 0) { extraInput.classList.add('invalid'); setMessage('گزینهٔ ' + extraKey + ' معتبر نیست.', 'error'); extraInput.focus(); return; }
      } else {
        var tokens = raw ? raw.split(/[,،\s]+/).filter(Boolean) : [];
        parsed = tokens;
        if (extraKey !== 'marketHolidays') {
          parsed = tokens.map(Number);
          var valid = parsed.every(function (value) { return Number.isFinite(value); });
          if (!valid) { extraInput.classList.add('invalid'); setMessage('مقادیر ' + extraKey + ' باید عددی و جداشده با کاما باشند.', 'error'); extraInput.focus(); return; }
          if (extraKey === 'marketCalendarCompleteYears' && parsed.some(function (year) { return year < 1200 || year > 1600; })) { extraInput.classList.add('invalid'); setMessage('سال‌های تقویم باید سال جلالی معتبر باشند.', 'error'); extraInput.focus(); return; }
          if (extraKey === 'holdScenarioDays' && parsed.some(function (day) { return day < 0 || day > 365; })) { extraInput.classList.add('invalid'); setMessage('افق نگهداری باید بین صفر و ۳۶۵ روز باشد.', 'error'); extraInput.focus(); return; }
          if (extraKey === 'underlyingScenarioShocks' && parsed.some(function (shock) { return Math.abs(shock) > 1; })) { extraInput.classList.add('invalid'); setMessage('شوک پایه باید در بازهٔ ۱- تا ۱+ اعشاری باشد.', 'error'); extraInput.focus(); return; }
        }
      }
      extraInput.classList.remove('invalid');
      if (JSON.stringify(parsed) !== JSON.stringify(api.optGet(extraKey))) changes.push({ key: extraKey, value: parsed });
    }
    if (!changes.length) { setMessage('تغییری برای ثبت وجود ندارد.', 'success'); return; }
    if (typeof api.setConfigBatch !== 'function' || !api.setConfigBatch(changes, 'ثبت تغییرات تنظیمات')) return;
    refreshConfig();
    setMessage('تنظیمات انتخابی با تأیید شما ذخیره شدند. خروجی فعلی تغییر نمی‌کند؛ برای اثرگذاری دوباره تحلیل را اجرا کنید.', 'success');
  }

  function download(name, content, mime) {
    var blob = new Blob([content], { type: mime + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a'); a.href = url; a.download = name; a.click();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function exportJson() {
    if (!lastResult) return;
    download('tseOptionZharfa-results.json', JSON.stringify({ version: api.version, subtitle: 'tseOptionAbyss -v0.0.1', result: lastResult }, null, 2), 'application/json');
  }
  function exportCsv() {
    if (!lastResult) return;
    function csv(value) {
      var text = String(value == null ? '' : value);
      if (/^[=+@\-]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    }
    var lines = [['Symbol', 'Base', 'Type', 'ER', 'Score', 'IV', 'DTE', 'Advisory status', 'Scenario count', 'Warnings'].map(csv).join(',')];
    lastResult.pass.forEach(function (symbol) {
      lines.push([symbol.l18 || symbol.l30, symbol.base, symbol._isCall == null ? '' : symbol._isCall ? 'Call' : 'Put', symbol._er, symbol._score, symbol._iv, symbol.dte, symbol._holdingAdvisory && symbol._holdingAdvisory.status, symbol._holdingAdvisory && (symbol._holdingAdvisory.scenarios || []).length, (symbol._dataWarnings || []).join(' | ')].map(csv).join(','));
    });
    download('tseOptionZharfa-results.csv', '\ufeff' + lines.join('\r\n'), 'text/csv');
  }

  if (!api) { setMessage('موتور تحلیل بارگذاری نشد.', 'error'); return; }
  document.getElementById('file-input').addEventListener('change', function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) { setMessage('حجم فایل باید حداکثر ۲ مگابایت باشد.', 'error'); event.target.value = ''; return; }
    var reader = new FileReader();
    reader.onload = function () { els.data.value = String(reader.result || ''); updateInputCount(); setMessage('فایل آماده است؛ قبل از اجرا ورودی را بررسی کنید.', 'success'); };
    reader.onerror = function () { setMessage('خواندن فایل ممکن نشد.', 'error'); };
    reader.readAsText(file, 'utf-8');
  });
  els.data.addEventListener('input', updateInputCount);
  els.run.addEventListener('click', run);
  els.clear.addEventListener('click', function () { els.data.value = ''; inputRows = []; els.count.textContent = '۰ ردیف'; setMessage('ورودی پاک شد.', 'success'); });
  els.saveConfig.addEventListener('click', saveConfig);
  document.getElementById('export-json').addEventListener('click', exportJson);
  document.getElementById('export-csv').addEventListener('click', exportCsv);
  refreshConfig();
  els.count.textContent = '۰ ردیف';
  console.info('[Zharfa] Standalone mode ready; no market data or synthetic rows are loaded automatically.');
})();
