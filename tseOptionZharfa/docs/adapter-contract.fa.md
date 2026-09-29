# قرارداد Adapter دادهٔ TSETMC — نسخهٔ ۱

## اصل ایمنی

پاسخ خام زندهٔ `InstInfoFast.aspx` در این محیط به‌صورت قابل‌اتکا تأیید نشده است؛ بنابراین هیچ regex عددی یا نام فیلد حدس‌زده‌شده‌ای به‌عنوان قیمت معتبر تلقی نمی‌شود. adapter باید معنای فیلدها را از پاسخ/مستندات واقعی تأیید کند و برای همان نسخه fixture داشته باشد. تا پیش از ثبت adapter معتبر، parse شکست می‌خورد و pool/تحلیل با عدد حدسی تغذیه نمی‌شود.

Fixtureهای `fixtures/tsetmc-*-v1.json` **نمونهٔ normalized قرارداد** برای تست هستند، نه ادعای snapshot یا fixture خام بازار TSETMC.

## رابط ثبت

پیش از استفاده می‌توان adapter را به `window.__exfTsetmcAdapter` داد، یا پس از شروع موتور از `window.__exf.registerTsetmcAdapter(adapter)` استفاده کرد:

```js
{
  version: 1,
  parseLiveQuote(rawPayload, expectedInstrumentId) { /* canonical quote */ },
  parseHistoryRow(rawRow, expectedInstrumentId) { /* canonical row */ }
}
```

توابع باید یکی از دو ساختار زیر را برگردانند؛ در غیر این صورت داده رد می‌شود.

### مظنهٔ زنده

```json
{
  "adapterVersion": 1,
  "instrumentId": "کد دقیق ابزار پایه",
  "lastPrice": 12345,
  "timestamp": "2026-09-29T08:49:00.000Z"
}
```

`timestamp` می‌تواند ISO-8601 یا Unix timestamp بر حسب ثانیه/میلی‌ثانیه باشد. قیمت باید مثبت و متناهی باشد؛ شناسه باید دقیقاً با شناسهٔ درخواستی برابر باشد؛ timestamp الزامی و باید در پنجرهٔ freshness تنظیم‌شده (`liveBaseMaxAge`) باشد. اگر هر شرطی برقرار نباشد callback مقدار `null` می‌گیرد.

### ردیف تاریخچه

```json
{
  "adapterVersion": 1,
  "instrumentId": "کد دقیق ابزار پایه",
  "date": "2026-09-29",
  "closePrice": 12345,
  "volume": 987654,
  "tradeCount": 321
}
```

تاریخ باید صریح و قابل تبدیل باشد؛ ترتیب ردیف‌ها هرگز تاریخ نمی‌سازد. برای اتصال `window.ih` به یک نماد پایه، `baseInsCodes[base]` باید موجود و دقیقاً برابر `instrumentId` نرمال‌شده باشد. حجم/تعداد اختیاری‌اند و در نبود داده صفر/تأییدنشده می‌مانند؛ adapter نباید مقدار مصنوعی تولید کند.

## Trend اختیاری

در صورت داشتن سری معتبر، `window.__exfMarketTrendSnapshot` می‌تواند شکل `{schemaVersion:1, indices:[{name, observations:[{value,timestamp}, ...]}]}` داشته باشد. سری باید دست‌کم دو نقطهٔ مرتب و تازه برای حداقل دو شاخص داشته باشد. نتیجه صرفاً `up`، `down`، `mixed`، `flat` یا `unknown` است؛ `financialScore` تهی و `filterImpact: none` می‌ماند. نبود یا کهنگی داده `unknown` است، نه روند خنثی برای ورود به مدل.

## Pool و ذخیره‌سازی

همهٔ observationهای عملیاتی فقط از `writePoolObservation` عبور می‌کنند: منبع مجاز، قیمت مثبت، تاریخ معتبر/غیرآینده و مجوز مسیر manual یا تنظیم صریح `poolAutoUpdate=true` لازم است. مسیر خودکار برای هر نماد حداکثر یک بار در روز ذخیره می‌کند. API عمومی snapshot فقط‌خواندنی می‌دهد.

Pool و IV history در یک envelope اتمیک `__exfStoreV2` با `schemaVersion: 2` ذخیره می‌شوند. کلیدهای قدیمی پیش از مهاجرت backup و نگهداری می‌شوند؛ خطای quota دادهٔ in-memory را حذف یا تاریخچه را نصف نمی‌کند. schema ناشناخته/جدیدتر بازنویسی نمی‌شود.
