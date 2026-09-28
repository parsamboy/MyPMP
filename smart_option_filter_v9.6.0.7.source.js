// smart_option_filter_v9.6.0.7 — فیلترِ هوشمندِ اختیارهایِ TSETMC — نویسنده: https://t.me/p75ad — ۱۴۰۵/۰۶/۲۲
/*
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║                                                               ║
 * ║        ⚡  Smart Option Filter  —  v9.6.0.7                     ║
 * ║        فیلترِ هوشمندِ اختیارهایِ بورسِ تهران                  ║
 * ║                                                               ║
 * ╚═══════════════════════════════════════════════════════════════╝
 *
 *  ⚠️  رفعِ مسئولیت
 *      این ابزار صرفاً تحلیلی و اطلاعاتی است؛ تضمینِ سود نمی‌دهد و
 *      مسئولیتِ هر تصمیم و معامله تنها بر عهدهٔ کاربر است.
 *
 *  ©  ۱۴۰۵  —  حقوقِ مؤلف محفوظ است
 *      مؤلفِ اصلی:  https://t.me/p75ad
 *
 *  ─── ارتباط ────────────────────────────────────────────────────
 *      ✈  مؤلف ..............  https://t.me/p75ad
 *      💬  گروهِ پروژه ....... https://t.me/SmartOptionTSE
 *
 *  ─── پیش از تغییر در تنظیمات ───────────────────────────────────
 *      این اسکریپت با پیش‌فرض‌های آزموده‌شده تنظیم شده است.
 *      تا زمانی که با همهٔ پارامترها و اثرِ متقابل‌شان آشنا نشده‌اید،
 *      هیچ مقداری را تغییر ندهید. تغییرهای ناآگاهانه، رفتارِ فیلتر
 *      را از مسیرِ درست خارج می‌کند و نتیجهٔ آن به‌ظاهر کار می‌کند،
 *      اما فیلتر به‌جای سود، ضرر پنهان تولید می‌کند.
 *
 *      اگر تازه‌کار هستید: یک هفته با پیش‌فرض‌ها کار کنید،
 *      خروجی را در کنارِ بازار بسنجید، سپس تدریجی دست ببرید.
 *
 *  ─── مجوزِ انشعاب ──────────────────────────────────────────────
 *      نوع مجوز:  Smart-FFA-1.0  (Free Fork with Attribution)
 *      برداشتن، بازنویسی، گسترش و انتشارِ نسخهٔ مستقل — آزاد است؛
 *      نیازی به اجازهٔ جداگانه نیست.
 *      شرطِ این مجوز: سربرگِ نسخهٔ انشعاب‌یافته باید نام و نشانیِ
 *      مؤلفِ اصلی را دست‌نخورده نگه دارد. حذفِ این سربرگ، پایانِ
 *      اعتبارِ مجوز است.
 *      سود و زیانِ نسخهٔ انشعاب‌یافته تنها بر عهدهٔ صاحبِ همان نسخه است.
 *
 *  ─── تاریخچهٔ نسخه ─────────────────────────────────────────────
 *      برای مشاهدهٔ تاریخچهٔ کامل، به فایل سورس مراجعه کنید:
 *      smart_option_filter_v9.6.0.7.source.js
 *
 * ═══════════════════════════════════════════════════════════════
 */
/*
 COMPATIBILITY CONTRACT — TSETMC REGISTRATION
 Mandatory for every future AI author:
 1) The registration system may decode HTML entities inside JavaScript source.
 2) Do not place HTML entities directly inside JavaScript string literals.
 3) Build entities with String.fromCharCode(38), never with literal ampersand entities.
 4) Run node --check before release and compare source before/after registration.
 5) Treat missing ) after argument list first as a possible source-transformation error.
 6) Preserve this contract in every upgraded version.
 7) The following minification limits apply only to minified output; do not treat them as general source rules.
 8) Minified output must be uploaded as raw JavaScript, not copied from HTML/Markdown-rendered text.
 9) Known minification limits: semicolon removal before else, Uglify/AST re-emission,
    full minify/mangle, and the failed binary/emission batches; keep these transforms restricted.
10) Promote a minification transform only after its own multi-operation package passes raw registration.
11) v9.6.0.7 source integrity: buildPanel must remain defined before its startup call; pipeline with per-filter levels and real-log analyzer are applied.
12) Proven-safe minification through 056 includes lexical-safe whitespace, numeric, boolean,
    comparison, ASCII-message, UI-window, and two single-statement brace transformations.
13) Each package contains exactly two transformations and applies all safe matches for them. Package 064 tested standalone modulo whitespace; package 065 tests whitespace around standalone `<<` and `>>`; shifts/assignments and `>>>` excluded; no mangle/full minify.
14) v9.5.3 fixes the reported min/source mismatches and logic regressions; package 067 tests only standalone `^` and `~` whitespace.
15) Package 068 tests only whitespace before and after standalone `>>>`; `>>>=` excluded.
16) Package 069 tests only code numeric shortening `0.25→.25` and `1.0→1`; strings/comments excluded and both source/minified outputs require node --check.
17) تا پایان benchmark/debug، مؤلفهٔ چهارم نسخه افزایش می‌یابد؛ پس از نهایی‌شدن این مرحله حذف می‌شود و نسخه‌گذاری به الگوی معمول بازمی‌گردد.
*/
//  v9.5.3 — ادغام کنترل‌شدهٔ v9.3.2 و v9.3.11: مدل/کش/استخر نسخهٔ 11 + دیباگ و checkbox رابط.
// ═══════════════════════════════════════════════════════════════════════
//  smart_option_filter_v9.5.3 — v9 = v8.3.0 + چند-سررسیدی + حل‌کنندهٔ IV نیوتن + دورهای بازبینی I–XII + مرتب‌سازیِ جدولِ تحلیل + گیتِ minExpRet روی adjRet + نشانِ گیت + مستندسازیِ cold/warm + پاک‌سازی‌های نقدِ ۱۶ (v9.5.3)
//  v9.5.3 — اصلاحِ تاریخچهٔ [ih]، کشِ زمینه‌محور، رتبه‌بندیِ پایدارتر، baseInsCodes رشته‌ای،
//  v9.5.3 patch — مقداردهیِ زودهنگامِ wk.g، بازگردانیِ نمونه‌گیریِ نقدشوندگی پیش از گیت،
//  صفِ نمادهای تازهٔ بدون‌نشت، LRU سریع ADX و persistence کم‌نوشت‌ترِ IV Rank.
//  v9.5.3 audit follow-up — حذفِ duplicate liquidity، merge چندتب و snapshot اتمیکِ IV،
//  status صادقانهٔ ivFlush، cycleStart، hashِ history payload، LRU پیوندیِ ADX،
//  guard بک‌تستِ wgReset و مستندسازیِ نیمه‌عمرِ روزتقویمی.
//  v9.5.3 design follow-up — نمونه‌گیریِ pre-gate برای cr/ivp/lev/vr،
//  نرمال‌سازیِ JDN رکوردهای legacy، sort قطعیِ merge و coarse same-ms guard.
//  محدودیتِ شناخته‌شده: localStorage فاقد CAS است؛ guard توزیع‌شده نیست و retry/lock عمداً اضافه نشده.
//  v9.5.3 — poolPreGateEveryScan (پیش‌فرض true): true هم‌نرخ با sp/tn/tv؛ false فقط heavy compute.
//  v9.5.3 release note — v9.3.0 یک build داخلیِ تثبیت بود و tag production مستقل نگرفت؛ خط عمومی از v9.3.1 ادامه یافت.
//  v9.5.3 follow-up — guard مشترک session، یک خواندن snapshot در flush،
//  prune خطیِ IV و مستندسازیِ استقلال schemaهای cache و rank.
//  bounds آربیتراژی، هزینهٔ دفتر، سود نقدی، risk-free اشتراکی، ADX/EWMA، UI و اعتبارسنجی.
//  ⚠ تغییرِ رفتاری: multiExpiry=true پیش‌فرض است (سررسید از نامِ هر ردیف) — خاموشی: optSet('multiExpiry', false)
//  ⚠ تغییرِ رفتاری نسبت به v9.1.2: گیتِ minExpRet در هر سه مسیر (rank/warm/cold) روی adjRet (پس از جریمهٔ DTE) است — در warm تعدادِ عبورها ممکن است کمتر شود؛ خاموشی: optSet('minExpRet', 0)
//  Web Worker/LUT: به‌دلیلِ محدودیتِ ساختاریِ TSETMC کنار گذاشته شد؛ جانشین: حل‌کنندهٔ نیوتن + کش/perfBudgetMs
//  (بازپیاده‌سازیِ بلوک‌ها روی «متنِ v6.1»، نه کپی از بازنویسیِ فشرده)
//
//  ── v7.1 — ترکیبِ «ویژگی‌های برترِ هر دو نسخه» (بررسیِ review_ext_v7.js) ──
//   ★ امتیازِ تناسب: ER۳۵/IVRank۲۵/ADX۱۵/نقدینگی۱۵/برتریِ IV۱۰ → گیتِ scoreMin،
//     ستونِ مرتب‌سازیِ cfield0 (حالتِ c0Mode:'er' هم موجود)، برچسبِ ★N در cfield1
//   ★ IV Rank صدکی: تاریخچهٔ روزانهٔ IV پایه‌ها (__optIvHistV71)، پنجرهٔ ivHistDays؛
//     تاریخچهٔ کم = خنثی (۵۰)؛ نمایشِ R در cfield1 (در منبع: صدک min/max بود)
//   ★ ADX ویلدرِ واقعی از [ih]: پنجره = «تازه‌ترین» ۲·period+۱ نمونه (منبع،
//     کهنه‌ترین‌ها را جمع می‌زد)؛ منبع = [ih] واقعی (منبع، متغیرِ تاریخچهٔ ناموجود را می‌خواند
//     → در TSETMC همیشه صفر)؛ [ih][0]=جدیدترین، قابلِ تغییر با ihNewestFirst
//   ★ پیشنهادِ معامله در cfield2: ورود = منصفانه−entryPad٪ (سقفِ ask، گردِ تیکِ ۵)،
//     SL با کفِ «ارزشِ ذاتی+۱ تیک» (در منبع: درصدِ ثابتِ کور)، TP ≥ max(۱+tp٪، منصفانه)
//   ★ پنلِ تحلیلِ درون‌صفحه‌ای (📊 تحلیل در پنل؛ جدولِ RTLِ مرتب با امتیاز؛ optPopOpen/optPopClear)
//   ★ رفعِ دو ارجاعِ مرده در v7: realizedVol و detectTrend به متغیرِ تاریخچهٔ ناموجود
//     اشاره می‌کردند → در TSETMC بی‌اثر بودند؛ اکنون [ih] واقعی می‌خورند
//     (+ نرمال‌سازیِ جهت در detectTrend)
//   ★ رفعِ posTag در مسیرِ کش: CS/askS در مسیرِ کش تضمین می‌شوند
//   ★ هم‌نصبیِ امن: کلیدها __optCfgV71/__optWeekV71/__optRankV71 (+ مهاجرتِ
//     نشانه‌دار از v7)، شناسه‌های DOM با پسوندِ 71 — تداخلی با v7/نسخهٔ بیرونی ندارد
//   ★ overrideهای محیطی: OPT_MIN_SCORE، OPT_CONTRACT_SIZE
//
//  v6 = v5 با ۴ تغییر (هستهٔ محاسباتی دست‌نخورده):
//
//   ۱) استخرِ N-روزه به‌جای «هفتهٔ پیش»:
//      پیش‌تر مشاهدات فقط از «هفتهٔ پیش» (شنبه…جمعه) پیش‌فرض می‌شدند؛ اکنون
//      استخرِ اولیه با «تعدادِ روزِ گذشته» پر می‌شود — کلیدِ poolDays،
//      بازهٔ مجاز ۷ تا ۳۰ روز، پیش‌فرض ۱۴ روز. مشاهدات هنوز با سطلِ هفتگیِ
//      ایرانی (شنبه‌آغاز) ذخیره می‌شوند، ولی «منبعِ پیش‌فرض‌ها» اجتماعِ همهٔ
//      مشاهده‌های داخلِ پنجرهٔ N روزهٔ گذشته است (هر سطل مهرِ زمان دارد).
//      اگر پنجره خالی باشد → جدولِ ثابت ملاک است (نه عقب‌گردِ یک‌هفته‌ای v5).
//      کلیدها: weekly* → pool* (poolAuto / poolGates / poolMinObs / …).
//
//   ۲) پنلِ تنظیمات فقط «ورودی» — محاسبه‌شده‌ها فقط‌خواندنی:
//      متغیرهایی که خودِ استخر کالیبره می‌کند (maxSpread، maxCostRT،
//      maxIvPremium، minTno/minTvol، maxLeverage، volFloor/volCeil و کلیدهای
//      مدیریتیِ استخر) از ورودی‌های پنل «حذف» شدند؛ مقدارِ مؤثرِ محاسبه‌شده
//      از استخر در بلوکِ «محاسبه‌شده از استخر» فقط‌خواندنی نمایش داده می‌شود.
//      تغییرِ دستی همچنان با optSet در کنسول ممکن است (اولویت: دستی > استخر > ثابت).
//
//   ۳) چینشِ ورودی‌ها بر اساس اهمیت (بالا → پایین):
//      ① سررسید و دیدِ بازار  ② استخر و اندازهٔ قرارداد  ③ موتور و کارایی
//      (بخشِ ۳ به‌صورت پیش‌فرض جمع است؛ تنظیماتِ موتور به‌ندرت دست می‌خورد.)
//
//   ۴) تاریخِ سررسید در ابتدای پنل قابلِ تعریف است:
//      ورودیِ «expiryDate» با قالبِ جلالی 1405/07/07 (جداکنندهٔ / - . و ارقام
//      فارسی پذیرفته می‌شود). از آن، الگوی نامِ نماد (expiry) و expiryJY/JM/JD
//      خودکار ساخته می‌شود — دیگر لازم نیست متنِ اسکریپت دست‌کاری شود.
//
//  بازبینیِ فنی (v6.1 — پس از نقدِ بیرونی):
//   • الگوی سررسید با lookahead منفی بسته شد → ماهِ ۱ دیگر نام‌های ماهِ
//     ۱۰/۱۱/۱۲ را پیشوندی تطبیق نمی‌دهد (و دنبالهٔ رقمیِ اضافه در هیچ ماهی)
//   • تغییرِ poolDays → کشِ صدکِ گیت‌ها «بلافاصله» باطل می‌شود (مُهرِ پنجره)
//   • پنجرهٔ برآوردِ زندهٔ پایه‌ها (wgLiveS) با طولِ استخر هماهنگ شد (۲…۷ روز)
//   • پارسِ expiryDate با کشِ memo — سبک‌تر در هر ردیف
//
//  بلوک‌های v7 (هرکدام با کلیدِ خاموش/روشنِ خودش — بخشِ ④ پنل و کنسول):
//   ① سود نقدی: dividendCalendar (دستی: optDivAdd) + واکشیِ خودکارِ اختیاری
//      → Sِ مدل با «PV سودهایِ تا سررسید» تعدیل می‌شود (Merton گسسته)؛
//        گیتِ «روزِ سود» (blockOnDividendDay) نمادِ در روزِ مجمع را رد می‌کند
//   ② قیمتِ زندهٔ پایه: baseInsCodes (کدِ TSETMC هر پایه) → واکشیِ هم‌مبدأِ
//      محافظت‌شده؛ فقط اگر تازه و «سالم» باشد روی جدول می‌نشیند (useLiveBase)
//   ③ توقف/صف: blockOnHalt + blockOnOrderQueue (دفترِ یک‌طرفه → رد)
//   ④ نرخِ پویا: riskFreeCurve — نرخِ مؤثر = آخرین نقطهٔ ≤ امروز (پله‌ای)
//   ⑤ EWMA: نوسانِ تحقق‌یافته با وزنِ نمایی (ewmaLambda، RiskMetrics)
//   ⑥ حجمِ مبنا: enforceVolumeBase — فقط اگر فیلدِ bvol در دسترسِ موتور باشد
//   ⑦ عمقِ وزنی: depthWeights روی نردبانِ قیمت (سطرِ اول سنگین‌تر)
//   ⑧ روندِ خودکار: autoView — مومنتومِ [ih] با وزن autoViewWeight در دید
//   ⑨ مدیریتِ پوزیشن: اندازهٔ پیشنهادیِ قرارداد از ریسک (N… در خروجی)
//   ⑩ لاگ: optLog() — شمارشِ دلایلِ ردِ هر گیت (+ نمایشِ ۳ دلیلِ برتر در پنل)
//   ⑫ تبعی: قرارداد روی «اختیارِ دیگر» (پایهٔ ض/ط) → تخفیفِ بازدهِ تبعی
//   ⑬ نمادِ تازه: warmup — sampleهای کم‌معامله‌ی تازه‌وارد
//   ⑭ بک‌تست: backtestMode + backtestDate → زمانِ مؤثرِ فیلتر ثابت می‌شود
//   (تست‌ها: test_v9.js — گروه‌هایِ آزمون روی شبیه‌سازِ موتورِ TSETMC)
//
//  میراث:
//   • دادهٔ استخر همان کلیدِ v5 (__optWeekV71 ← مهاجرت از v5/v7: __optWeekV1) را می‌خواند/می‌نویسد → مشاهداتِ
//     گذشته با ارتقا به v6 از دست نمی‌رود.
//   • کلیدِ تنظیماتِ ذخیره‌شده نو شد (__opt71CfgV6) → overrideهای پنلِ v5 یک‌بار
//     باید دوباره ذخیره شوند.
//   • پنلِ 📅 (پایه‌ها و گیت‌ها) و optBase() در کنسول، اکنون گزارشِ «پنجرهٔ
//     N روزه» می‌دهند.
//
//  هستهٔ الگوریتم (بدونِ تغییر از v3):
//   ۱) IV معکوس (bisection روی بلک-شولز)           → قیمت‌گذاری منصفانه
//   ۲) آربیتراژ Put-Call                           → IV پایدار حتی برای ITM عمیق
//   ۳) ارزش انتظاری روی شبکهٔ سناریو               → «چقدر سود می‌دهد» به‌جای «چقدر ATM است»
//   ۴) هزینهٔ رفت‌وبرگشت با عمق دفتر سفارش         → هزینهٔ واقعی، نه فقط نیم‌اسپرد
//   ۵) مرز پارتو در گروه                           → حذف وزن‌های دلخواه
//   ۶) زمان‌بندیِ اجرا و گیت‌های زندهٔ تابلو        (v5 — بدونِ تغییر)
// ═══════════════════════════════════════════════════════════════════════
// حالت و آمارِ سراسریِ زمان‌بندی (بین اجرای فیلتر روی نمادهای مختلف مشترک است)
;(function () {
    // Parser-safe standalone entry point: the leading semicolon also protects
    // execution when this file follows a previous console/snippet expression.
    if (typeof window !== 'undefined' && window) {
        window.__opt71Mem = window.__opt71Mem || {};
        window.__opt71Rt = window.__opt71Rt || { cache: {}, n: 0, sum: 0, checked: 0,
            fast: false, hits: 0, computes: 0 };
        // ظرفِ جدولِ رتبهٔ «مقیم در حافظه»: { db, ver, t, dirty }
        window.__opt71Db = window.__opt71Db || null;
    }

    var VERSION_TAG = 'v9607';
    function verLabel71() { return 'v9.6.0.7'; }

    // v9.6.0.7: نگاشت نام‌های فنی TSETMC به توضیح فارسی واضح — «آزادسازی از نامفهومی»
    var TSETMC_FIELDS71 = {
        l18:     { label: 'شناسهٔ نماد', hint: 'مثل ضخود8045 — شناسه کوتاه یکتا' },
        inscode: { label: 'کد معاملاتی', hint: 'کد عددی 8 رقمی هسته معاملات' },
        l30:     { label: 'نام کامل نماد', hint: 'نام فارسی مثل اختیار خرید خودرو' },
        tno:     { label: 'تعداد معاملات امروز', hint: 'چند بار امروز معامله شده' },
        tvol:    { label: 'حجم معاملات امروز', hint: 'چند قرارداد/سهم جابجا شده' },
        pd1:     { label: 'بهترین قیمت خرید', hint: 'بالاترین قیمت خریدار در دفتر سفارش' },
        po1:     { label: 'بهترین قیمت فروش', hint: 'پایین‌ترین قیمت فروشنده در دفتر سفارش' },
        pl:      { label: 'آخرین قیمت معامله', hint: 'قیمت آخرین معامله انجام‌شده' },
        qd1:     { label: 'حجم در صف خرید', hint: 'تعداد سفارش در بهترین خرید' },
        qo1:     { label: 'حجم در صف فروش', hint: 'تعداد سفارش در بهترین فروش' },
        pd2:     { label: 'دومین قیمت خرید', hint: 'قیمت دوم در سمت خرید' },
        po2:     { label: 'دومین قیمت فروش', hint: 'قیمت دوم در سمت فروش' },
        qd2:     { label: 'حجم دومین خرید', hint: '' },
        qo2:     { label: 'حجم دومین فروش', hint: '' },
        pd3:     { label: 'سومین قیمت خرید', hint: '' },
        po3:     { label: 'سومین قیمت فروش', hint: '' },
        qd3:     { label: 'حجم سومین خرید', hint: '' },
        qo3:     { label: 'حجم سومین فروش', hint: '' }
    };
    function fieldDesc71(code){
        try {
            var f = TSETMC_FIELDS71[code];
            if (f) return f.label + ' (' + code + ')';
            return code;
        } catch(e){ return code; }
    }
    function humanFieldList71(codes){
        // codes like ['l18','l30'] -> 'شناسهٔ نماد، نام کامل نماد'
        try {
            return codes.map(function(c){ var f=TSETMC_FIELDS71[c]; return f?f.label:c; }).join('، ');
        } catch(e){ return codes.join('، '); }
    }

    try { benchCount71('iife-exec',1); } catch(e){}
    try { if (typeof window !== 'undefined' && window) window.__opt71Ver = verLabel71(); } catch(e){}
    var CONFIG = {

        expiryDate:  '1405/07/30',  // ⚠️ روز دقیق سررسید را از اطلاعیهٔ نماد بگذارید
        expiry:      '1405\\s*[\\/.\\-]\\s*0?7',  // ← مشتقِ خودکار (دست نزنید)
        expiryJY:    1405,     // ← مشتقِ خودکار از expiryDate
        expiryJM:    7,
        expiryJD:    30,

        view:        0.4,
        viewDailyPct:1.2,      // درصدِ حرکت روزانهٔ متناظر با دیدِ کامل (±1)
        holdDays:    5,        // افق نگه‌داری (روز کاری)
        erGridStep:  0.25,     // گام شبکهٔ expectedReturn

        baseVol: {
            'اهرم':70,'وبملت':60,'خودرو':80,'شستا':75,'خساپا':80,'شپنا':65,
            'فملی':55,'فولاد':55,'شبندر':60,'خبهمن':75,'وتجارت':70,'وبصادر':70,
            'ذوب':75,'اخابر':55,'تاصیکو':60
        },
        volFloor:    25,       // کمینهٔ نوسان‌پذیری فرضی (٪)
        volCeil:     150,      // بیشینهٔ نوسان‌پذیری فرضی (٪)

        riskFree:    33,       // ≈ نرخ اوراق/سپردهٔ کوتاه‌مدت — تأثیرش در ۳۰ روز ناچیز است

        minTno:        3,
        minTvol:       30,
        contractSize:  10000,
        strictContractSize: false, // اندازهٔ ناشناخته حدس زده نشود؛ فقط جدول دستی یا استخر معتبر
        unitGuardX:    8,      // اگر قیمت بازار بیش از این‌قدر با مدل اختلاف داشت → واحد اشتباه است
        minPrice:      10,
        maxSpread:     15,     // ٪
        maxCostRT:     12,     // ٪ هزینهٔ رفت‌وبرگشت (اسپرد + لغزش عمق) — بیش از این یعنی دام
        minDaysLeft:   4,      // کمتر از این = تلهٔ تتا/گاما نزدیک سررسید
        maxLeverage:   30,     // اهرم مؤثرِ بیش از این = قراردادِ پوچِ خیلی OTM
        maxTimeValuePct: 100,  // ارزشِ زمانیِ بیش از ۱۰۰٪ قیمت = حقِ بیمهٔ غیرمنطقی — ۱۰۰ = عملاً خاموش (mid≤ask ⇒ نسبت≤۱۰۰؛ عمدی)
        maxIvPremium:  10,     // اگر IV قرارداد بیش از این مقدار (واحد ٪) از نوسان‌پذیریِ
        minDteWeight:  true,   // جریمهٔ قراردادهای نزدیک سررسید فعال باشد

        maxPerGroup:   2,
        maxTotalRows:  0,      // v9.0.4 — سقفِ کل: ردیف با شمارِ ردیف‌هایِ بهترِ دیده‌شده (ER بیشتر یا مساوی با نامِ کوچک‌تر) رد می‌شود (۰=خاموش؛ warm: سقفِ نرمِ ×۱٫۵؛ مستقل از maxPerGroup/maxPerExpiry؛ شمارش روی جدولِ تریم‌شده = best-effort)
        c0Tiebreak:    false,  // v9.0.6 — tie-breakِ فقط-score: score×۱۰۰۰ + ER×۸ (در er اعمال نمی‌شود تا ترتیبِ ER نشکند)
        minExpRet:     40,     // حداقل بازدهٔ انتظاری (٪) برای نمایش؛ مقدار اولیه، قابل کالیبراسیون با استخر
        minDepthTrades:0.5,      // عمق دفتر ÷ میانگین اندازهٔ هر معاملهٔ امروز ≥ ۱
        usePareto:     true,   // false → رتبه‌بندی صرفاً با بازده انتظاری

        computeIntervalMs: 15000, // هر نماد حداکثر هر ۱۵ ثانیه «یک بار» واقعاً محاسبهٔ
        cacheTtlMs:        120000,// عمر سنجهٔ کش‌شده؛ بعد از آن نماد واقعاً دوباره محاسبه می‌شود
        maxCache:          600,   // سقف رکوردهای کش (حذف قدیمی‌ترین‌ها)
        offHoursFactor:    4,     // بیرون از ساعت معاملات، دورهٔ محاسبه در این ضریب ضرب می‌شود
        offHoursOnce:      true,  // ⭐ بیرون از ساعتِ بازار هر نماد فقط «یک بار» محاسبه
        enforceMarketHours:false, // true → بیرون از ساعت معاملات هیچ نمادی نمایش داده
        perfBudgetMs:      4.0,   // بودجهٔ زمان به‌ازای هر نماد (میلی‌ثانیه)
        perfWindow:        25,    // میانگین روی این تعداد محاسبهٔ آخر
        allowFastPath:     true,  // اگر از بودجه رد شد، موقتاً «مسیر سریع»: IV از قیمت
        sessionStartHour:  8,
        poolObsFromMin:   525, // v9.0.3 — شروعِ ثبتِ استخر (۸:۴۵)     // پیش‌گشایش از ۸:۴۵
        sessionEndHour:    13,    // پایان بازار ۱۲:۳۰ + حاشیهٔ امن
        sessionDays:       [0,1,2,3,4,6],  // ۵ = جمعه؛ پنج‌شنبه با optSet قابل حذف است
        marketHolidays:    [],             // تعطیلات استثناییِ جلالی؛ نمونه: ['1405/01/02']
        tzOffsetMin:       210,   // تهران = UTC+3:30 → اگر مرورگر ساعت دیگری دارد هم درست کار می‌کند

        rankTtl:       60000,  // ⚠️ خودش با «دورهٔ واقعیِ اسکنِ دیده‌بان» تطبیق داده می‌شود
        resetAfter:    600000,
        warmupMs:      12000,
        maxGroupSize:  60,     // سقف رکورد در هر گروهِ رتبه‌بندی (کنترل حجمِ JSON)
        rankFlushEvery:16,     // جدولِ رتبه هر چند تغییر، یک بار در حافظهٔ مرورگر نوشته شود
        rankFlushMs:   1500,   // … یا دستِ‌کم هر این چند میلی‌ثانیه یک بار (هرکدام زودتر)
        rankCacheMs:   1000,   // اگر حافظهٔ سراسری بین اجراها زنده نماند (contextِ

        basePrices: {
            'اهرم':70000,'وبملت':1300,'خودرو':480,'شستا':900,'خساپا':350,'شپنا':15000,
            'فملی':8500,'فولاد':7500,'شبندر':12000,'خبهمن':500,'وتجارت':700,'وبصادر':700
        },

        poolDays:      21,     // ⭐ v6 — طولِ پنجرهٔ استخر (روزِ گذشته)؛ ۷ تا ۳۰
        poolAuto:      true,   // false → استخرسنج خاموش (نه ثبت، نه کاربرد)
        poolPreGateEveryScan: true, // true: cache-hit هم‌نرخ با sp/tn/tv؛ false: فقط محاسبهٔ سنگین (سبک‌تر، sparse)
        poolMinObs:    3,      // حداقلِ مشاهده برای پذیرشِ هر پایهٔ محاسبه‌شده
        poolClamp:     3,      // قیمتِ استخر حداکثر این ضریب با ثابت فاصله داشته باشد
        contractSizes: {
            'خساپا':1000,'خودرو':1000,'وبملت':1000,'ذوب':1000,'اخابر':1000,
            'شپنا':1000,'شستا':1000,'وبصادر':1000,'تاصیکو':1000,'وتجارت':1000,
            'خبهمن':1000,'فملی':1371
        },     // مقادیر اعلام‌شدهٔ اندازهٔ قرارداد؛ نماد ناشناخته فقط از استخر معتبر
        poolGates:       true, // false → گیت‌ها فقط مقادیر ثابت/ایستا می‌مانند
        poolGateClamp:   2,    // هر مقدار مشتق در [ثابت/۲، ثابت×۲] مهار می‌شود
        poolMinGateObs:  20,   // حداقل مشاهداتِ استخرِ N-روزه برای هر گیت

        // ═══ بلوک‌های v7 (پیش‌فرض‌ها محافظه‌کارانه — چیزی بی‌اجازه عوض نمی‌شود) ═══
        // ── ① سود نقدی (تقویمِ دستی + واکشیِ خودکارِ اختیاری) ──
        dividendCalendar: {},
        dividendAutoFetch: false,  // true + dividendFetchUrl → JSONِ [{sym:'فولاد',d:[y,m,d],amt:1200},…]
        dividendFetchUrl: '',
        dividendMaxDays: 90,       // فقط سودهایِ داخلِ این افق (روز) تعدیل می‌شوند
        blockOnDividendDay: true,  // روزِ مجمعِ همان پایه → نمادش رد می‌شود
        useLiveBase: true,         // فقط با baseInsCodes فعال می‌شود (کدِ TSETMC پایه)
        baseInsCodes: {},          // نمونه: {'فملی':'46348095188555032'} — optSet در کنسول
        liveBaseMaxAge: 300000,    // عمرِ قیمتِ واکشی‌شده (۵ دقیقه)
        blockOnHalt: true,         // ردیفِ یخ‌زده (بدونِ معامله و قیمت) → رد
        blockOnOrderQueue: true,   // دفترِ یک‌طرفهٔ خرید (صف) → رد
        orderQueueThreshold: 0.005,// سهمِ طرفِ خرید از دفتر بیش از (۱−این) → صف
        riskFreeCurve: [[1405,5,1,34],[1405,8,1,36],[1406,2,1,35]],
        riskFreeAutoFetch: false, riskFreeFetchUrl: '',
        useEwma: true,             // نوسانِ تحقق‌یافته با وزنِ نمایی (به‌جای ساده)
        ewmaLambda: 0.94,          // RiskMetrics
        enforceVolumeBase: false,  // فقط وقتی موتورِ TSETMC فیلدِ (bvol) را بدهد اثر دارد
        volumeBaseRatio: 0.5,      // معاملاتِ امروز < ۵۰٪ حجمِ مبنا → قیمتِ مهارشده → رد
        useWeightedDepth: true,    // نردبان: سطرِ اولِ قیمت سنگین‌تر است
        depthWeights: [1.0, 0.6, 0.3],
        autoView: false,           // مومنتومِ ۱۰روزهٔ [ih] در «دید» ترکیب شود
        autoViewWeight: 0.5,
        positionSizing: true,
        capital: 100000000,        // سرمایه (ریال)
        riskPerTrade: 2,           // ریسک هر معامله (٪ سرمایه)
        stopLossPct: 30,           // حدِ ضرر (٪ قیمتِ ورود)
        takeProfitPct: 80,         // حدِ سود (٪) — فقط نمایشی
        verbose: false,            // لاگِ خط‌به‌خط در کنسول
        debugPanel: false,          // v9.5.3 — پنل دیباگ مستقل، پیش‌فرض خاموش
        logReasons: true,          // شمارشِ دلایلِ رد → optLog() و پنل
        supportTabeii: true,
        tabeiiDiscount: 10,        // ٪ کاهشِ بازدهِ انتظاری
        allowNewSymbols: true,     // false → نمادِ تازه‌واردِ کم‌معامله رد می‌شود
        newSymbolMinObs: 5,        // حداقلِ معاملهٔ امروز برای نمادِ دیده‌شدهٔ < ۳ روز
        backtestMode: false,       // true → زمانِ مؤثر = backtestDate (ثابت)
        backtestDate: '',          // نمونه: '2026-09-01'
        useScore: true,            // امتیازِ تناسب + گیتِ scoreMin
        scoreMin: 35,              // امتیازِ کمتر → رد (دلیلِ «score-N» در optLog)
        c0Mode: 'score',           // ستونِ cfield0: 'score' یا 'er' (بازدهِ ٪)
        wER: 35, wIVR: 25, wADX: 15, wLiq: 15, wEdge: 10,   // وزن‌های امتیاز
        useIvRank: true,           // IV Rank صدکی (تاریخچهٔ روزانهٔ IV پایه)
        ivRankBuy: 40,             // Rank ≤ این = ارزان (امتیازِ کامل)
        ivRankSell: 70,            // Rank ≥ این = گران (امتیازِ صفر)
        ivHistDays: 90,            // پنجرهٔ تاریخچهٔ IV (روز)
        ivAtmBand: 5,              // v8.3.0 - ATM band for IV Rank history
        multiExpiry: true,         // v9.0.0 — سررسید از نامِ هر ردیف؛ خاموشی: false (تغییرِ رفتاری — سربرگ را ببینید)
        maxPerExpiry: 0,           // v9.0.0 — >۰ = سقفِ ردیف در هر (پایه×نوع×سررسید)
        distantDays: 45,           // v9.0.0 — سررسیدِ دورتر از این از گیتِ نمادِ تازه معاف (در عملِ allowNewSymbols=false)
        useAdx: true,              // ADX ویلدر از [ih] خودِ قرارداد
        adxPeriod: 14,
        ihNewestFirst: true,       // هستهٔ جدیدِ TSETMC: [ih][0] = جدیدترین روز
        useEntry: true,            // پیشنهادِ ورود/SL/TP در cfield2
        entryPad: 5,
        roundToTick: 5,            // v7.1 — اندازهٔ تیکِ گردکردنِ ورود/SL/TP (ریال)               // ورود = منصفانه − این ٪ (سقفِ ask، گردِ ۵ ریال)
        usePopup: true,            // جمعِ ردیف‌ها برای پاپ‌آپِ 📊 پنل
        abortThreshold: 10           // v9.6.0.7: آستانه توقف — 10 خطا، fallback یکسان 10، پیام فارسی واضح با NL=String.fromCharCode(10)
    };

    try {
        if (typeof process !== 'undefined' && process && process.env) {
            if (process.env.CONTRACT_SIZE) CONFIG.contractSize = +process.env.CONTRACT_SIZE;   // v5-compat; OPT_CONTRACT_SIZE runs later and overrides it
            if (process.env.OPT_VIEW !== undefined && process.env.OPT_VIEW !== '') CONFIG.view = +process.env.OPT_VIEW;
            if (process.env.OPT_INTERVAL_MS) CONFIG.computeIntervalMs = +process.env.OPT_INTERVAL_MS;
            if (process.env.OPT_CACHE_TTL_MS) CONFIG.cacheTtlMs = +process.env.OPT_CACHE_TTL_MS;
            if (process.env.OPT_ENFORCE_HOURS) CONFIG.enforceMarketHours = process.env.OPT_ENFORCE_HOURS === '1';
            if (process.env.OPT_OFF_ONCE !== undefined && process.env.OPT_OFF_ONCE !== '') CONFIG.offHoursOnce = process.env.OPT_OFF_ONCE === '1';
            if (process.env.OPT_PERF_BUDGET_MS) CONFIG.perfBudgetMs = +process.env.OPT_PERF_BUDGET_MS;
            if (process.env.OPT_MAX_GROUP) CONFIG.maxGroupSize = +process.env.OPT_MAX_GROUP;
            if (process.env.OPT_RANK_TTL_MS) CONFIG.rankTtl = +process.env.OPT_RANK_TTL_MS;
            if (process.env.OPT_PERF_WINDOW) CONFIG.perfWindow = +process.env.OPT_PERF_WINDOW;
            if (process.env.OPT_RANK_FLUSH_EVERY) CONFIG.rankFlushEvery = +process.env.OPT_RANK_FLUSH_EVERY;
            if (process.env.OPT_RANK_FLUSH_MS) CONFIG.rankFlushMs = +process.env.OPT_RANK_FLUSH_MS;
            if (process.env.OPT_RANK_CACHE_MS) CONFIG.rankCacheMs = +process.env.OPT_RANK_CACHE_MS;
            if (process.env.OPT_POOL_DAYS) CONFIG.poolDays = +process.env.OPT_POOL_DAYS;
            if (process.env.OPT_MIN_SCORE) CONFIG.scoreMin = +process.env.OPT_MIN_SCORE;       // v7.1
            if (process.env.OPT_CONTRACT_SIZE) CONFIG.contractSize = +process.env.OPT_CONTRACT_SIZE;   // v7.1
            if (process.env.OPT_POOL_AUTO) CONFIG.poolAuto = process.env.OPT_POOL_AUTO !== '0';
            if (process.env.OPT_POOL_PRE_GATE_EVERY_SCAN !== undefined) CONFIG.poolPreGateEveryScan = process.env.OPT_POOL_PRE_GATE_EVERY_SCAN !== '0';
            if (process.env.OPT_POOL_MIN_OBS) CONFIG.poolMinObs = +process.env.OPT_POOL_MIN_OBS;
            if (process.env.OPT_POOL_GATES) CONFIG.poolGates = process.env.OPT_POOL_GATES !== '0';
            if (process.env.OPT_POOL_MIN_GATE_OBS) CONFIG.poolMinGateObs = +process.env.OPT_POOL_MIN_GATE_OBS;
            if (process.env.OPT_ABORT_THRESHOLD) CONFIG.abortThreshold = +process.env.OPT_ABORT_THRESHOLD;
            if (!process.env.OPT_POOL_AUTO && process.env.OPT_WEEKLY_AUTO) CONFIG.poolAuto = process.env.OPT_WEEKLY_AUTO !== '0';
            if (!process.env.OPT_POOL_MIN_OBS && process.env.OPT_WEEK_MIN_OBS) CONFIG.poolMinObs = +process.env.OPT_WEEK_MIN_OBS;
            if (!process.env.OPT_POOL_GATES && process.env.OPT_WEEKLY_GATES) CONFIG.poolGates = process.env.OPT_WEEKLY_GATES !== '0';
            if (!process.env.OPT_POOL_MIN_GATE_OBS && process.env.OPT_WEEK_MIN_GATE_OBS) CONFIG.poolMinGateObs = +process.env.OPT_WEEK_MIN_GATE_OBS;
        }
    } catch (e) {}

    // ═══════════════════════════════════════════════════════════════
    //  v7 بلوک ۱۴ — بک‌تست: زمانِ مؤثرِ فیلتر قابلِ انجماد است
    // ═══════════════════════════════════════════════════════════════
    function isBacktest() { return !!CONFIG.backtestMode; }
    function btNow() {
        if (!isBacktest() || !CONFIG.backtestDate) return Date.now();
        try {
            var iso = (typeof wgValidIsoDate71 === 'function') ? wgValidIsoDate71(CONFIG.backtestDate) : null;
            if (!iso) return Date.now();
            var t = new Date(iso + 'T12:00:00Z').getTime();
            return (t === t && t > 0) ? t : Date.now();
        } catch(e){ return Date.now(); }
    }

    // ═══════════════════════════════════════════════════════════════
    //  v7 بلوک ۱۰ — لاگِ دلایلِ رد (optLog در کنسول + پانوشتِ پنل)
    // ═══════════════════════════════════════════════════════════════
    // ═══ v9.5.3 — هستهٔ دیباگِ کم‌هزینه و پنل پنج‌تب ═══
    // v9.5.3: پنجرهٔ فعال با کلیک/لمس به بالاترین لایه می‌آید؛ در صورت نبود JavaScript هیچ پنل تولید نمی‌شود.
    function bringTop71(el) {
        try {
            if (!el || !el.style || typeof document === 'undefined' || !document.body) return;
            if (el.parentNode !== document.body) document.body.appendChild(el);
            el.style.zIndex = '2147483647';
            el.setAttribute('data-opt71-ui', '1');
        } catch (e) {}
    }
    function wireTopWindow71(el) {
        if (!el || typeof el.addEventListener !== 'function') return;
        el.setAttribute('data-opt71-ui', '1');
        var _bring = function(e){
            try {
                if (e && e.target && e.target.tagName === 'BUTTON') return;
                if (e && e.target && e.target.closest && e.target.closest('button')) return;
            } catch(ex){}
            bringTop71(el);
        };
        el.addEventListener('pointerdown', _bring, true);
        el.addEventListener('mousedown', _bring, true);
        bringTop71(el);
    }
    function bind71(btn, fn){
        try {
            if (!btn || typeof btn.addEventListener !== 'function') return;
            btn.type = 'button';
            btn.addEventListener('click', function(e){
                try { if (e) { e.preventDefault(); e.stopPropagation(); } fn(e); } catch(ex){}
            });
        } catch(e){}
    }

    var __opt71PreHideState71 = null;
    function hideUi71() {
        try {
            if (typeof document === 'undefined') return false;
            __opt71PreHideState71 = [];
            var a = document.querySelectorAll('[data-opt71-ui]');
            for (var i = 0; i < a.length; i++) {
                __opt71PreHideState71[i] = a[i].style.display || '';
                a[i].style.setProperty('display', 'none', 'important');
            }
            document.documentElement.setAttribute('data-opt71-ui-disabled', '1');
            return true;
        } catch (e) { return false; }
    }
    function showUi71() {
        try {
            if (typeof document === 'undefined') return false;
            document.documentElement.removeAttribute('data-opt71-ui-disabled');
            var a = document.querySelectorAll('[data-opt71-ui]');
            for (var i = 0; i < a.length; i++) {
                a[i].style.removeProperty('display');
                if (__opt71PreHideState71 && __opt71PreHideState71[i] !== undefined) a[i].style.display = __opt71PreHideState71[i];
            }
            __opt71PreHideState71 = null;
            return true;
        } catch (e) { return false; }
    }

    function dbgState() {
        try {
            if (typeof window === 'undefined' || !window || !CONFIG.debugPanel) return null;
            return window.__opt71Dbg || (window.__opt71Dbg = { version: verLabel71(), startedAt: Date.now(),
                pool: { state: '', lastSkip: null, skipCounts: {}, lastFlush: null, lastObserve: null, store: '', jsonBytes: 0 },
                metrics: { last: null, history: [] }, bench: { enabled: false, scans: 0, totalMs: 0, lastMs: 0, avgMs: 0, samples: [], loops: {} }, rank: {}, cache: {}, iv: {}, warnings: [],
                rejects: { counts: {}, last: null, history: [] } });
        } catch (e) { return null; }
    }
    function dbgWarn(msg, critical) {
        if (critical || CONFIG.verbose) { try { console.warn('⚠ ' + msg); } catch (e0) {} }
        var D = dbgState(); if (!D) return;
        D.warnings.push({ msg: String(msg), t: Date.now(), critical: !!critical });
        if (D.warnings.length > 50) D.warnings.shift();
    }
    function dbgPoolSkip(reason, sym) {
        var D = dbgState(); if (!D) return;
        D.pool.lastSkip = { reason: reason, sym: sym || '', t: Date.now() };
        D.pool.skipCounts[reason] = (D.pool.skipCounts[reason] || 0) + 1;
    }
    function dbgSnapshot(which) {
        try { var D = dbgState(); if (!D) return null; if (which === 'reset') { window.__opt71Dbg = null; return dbgState(); }
            if (!which) return JSON.parse(JSON.stringify(D)); return JSON.parse(JSON.stringify(D[which] || null)); } catch (e) { return null; }
    }
    function benchState71() {
        try {
            if (typeof window === 'undefined' || !window || !window.__opt71Bench) return null;
            var D = dbgState();
            if (!D) return null;
            D.bench = D.bench || { enabled: true, scans: 0, totalMs: 0, lastMs: 0, avgMs: 0, samples: [], loops: {} };
            D.bench.enabled = true;
            return D.bench;
        } catch (e) { return null; }
    }
    function benchNote71(kind, dt, count) {
        var B = benchState71(); if (!B) return;
        if (!(dt >= 0)) return;
        B.scans++; B.lastMs = dt; B.totalMs += dt; B.avgMs = B.totalMs / B.scans;
        B.samples.push({ kind: kind, ms: Math.round(dt * 1000) / 1000, n: count || 1, t: Date.now() });
        if (B.samples.length > 100) B.samples.shift();
    }
    function benchCount71(kind, count) {
        var B = benchState71(); if (!B) return;
        B.loops[kind] = (B.loops[kind] || 0) + (count || 1);
    }
    function shouldAbort71() {
        try { return !!(typeof window !== 'undefined' && window && window.__opt71Abort); } catch(e){ return false; }
    }
    function incFail71() {
        try {
            var W = (typeof window !== 'undefined' && window) ? window : null;
            if (!W) return 0;
            W.__opt71InputFailStreak = (W.__opt71InputFailStreak || 0) + 1;
            W.__opt71InputFailTotal = (W.__opt71InputFailTotal || 0) + 1;
            return W.__opt71InputFailStreak;
        } catch(e){ return 0; }
    }
    function resetFail71() {
        try { if (typeof window !== 'undefined' && window) window.__opt71InputFailStreak = 0; } catch(e){}
    }

    function dbgTimerStart71() {
        try {
            if (typeof window === 'undefined' || !window || window.__opt71DbgTimer || !window.__opt71DbgPanel || !window.__opt71DbgRender) return;
            window.__opt71DbgTimer = setInterval(function () { if (window.__opt71DbgPanel && window.__opt71DbgPanel.style.display !== 'none') window.__opt71DbgRender(); }, 500);
        } catch (e) {}
    }
    function buildDebugPanel() {
        try {
            if (typeof window === 'undefined' || !window || !CONFIG.debugPanel || typeof document === 'undefined' || !document.body) return;
            if (window.__opt71DbgPanel) return;
            var el = document.createElement('div'); el.id='__opt71DbgPanel'; el.dir='rtl';
            el.style.cssText='position:fixed;top:56px;right:8px;z-index:2147483646;width:650px;max-width:96vw;max-height:80vh;overflow:auto;background:#161b24;color:#dfe6f1;border:1px solid #3a4356;border-radius:10px;padding:10px;font:11px/1.8 Tahoma;display:none;';
            el.innerHTML='<div style="display:flex;gap:4px;align-items:center"><b style="flex:1;color:#ffd479">🐞 دیباگ ' + verLabel71() + '</b><button id="__dbgClose">×</button></div><div id="__dbgTabs" style="display:flex;gap:3px;flex-wrap:wrap;margin:6px 0"></div><pre id="__dbgBody" style="white-space:pre-wrap;direction:ltr;text-align:left;max-height:58vh;overflow:auto"></pre><div><button id="__dbgReset">پاک‌کردن آمار</button> <button id="__dbgCopy">کپی JSON</button></div>';
            document.body.appendChild(el); window.__opt71DbgPanel=el; wireTopWindow71(el);
            var tabs=['pool','metrics','bench','rank','cache','warnings']; var tb=el.querySelector('#__dbgTabs'), active='pool';
            tabs.forEach(function(k){ var b=document.createElement('button'); b.textContent=k; b.onclick=function(){active=k; render();}; tb.appendChild(b); });
            function render(){ var body=el.querySelector('#__dbgBody'); body.textContent=JSON.stringify(dbgSnapshot(active),null,2); }
            el.querySelector('#__dbgClose').onclick=function(){el.style.display='none'; if (window.__opt71DbgTimer) { clearInterval(window.__opt71DbgTimer); window.__opt71DbgTimer=0; }};
            el.querySelector('#__dbgReset').onclick=function(){dbgSnapshot('reset');render();};
            el.querySelector('#__dbgCopy').onclick=function(){try{navigator.clipboard.writeText(JSON.stringify(dbgSnapshot(),null,2));}catch(e){}};
            window.__opt71DbgRender=render; render();
            dbgTimerStart71();
        } catch (e) { dbgWarn('buildDebugPanel: ' + e.message); }
    }

    function LOG() {
        try {
            if (typeof window !== 'undefined' && window)
                return (window.__opt71Log = window.__opt71Log || { rejected: {}, passed: 0 });
        } catch (e) {}
        return null;
    }

    // v9.6.0.7: Pipeline tracking — نمایش گرافیکی فرآیند فیلترینگ

    // v9.6.0.7: Pipeline — هر فیلتر منطقی یک سطح، نمایش تعداد فیلتر شده و خروجی نهایی
    var FILTER_ORDER71 = [
        { key: 'input-data', label: 'داده ناقص', desc: 'شناسه، قیمت، حجم ناقص' },
        { key: 'not-option', label: 'غیر اختیار', desc: 'نماد اختیار نیست' },
        { key: 'off-hours', label: 'خارج ساعت بازار', desc: 'بیرون ساعت معاملات' },
        { key: 'expiry', label: 'سررسید نامعتبر', desc: 'فرمت تاریخ سررسید اشتباه' },
        { key: 'expiry-past', label: 'سررسید گذشته', desc: 'تاریخ سررسید گذشته' },
        { key: 'dte', label: 'روز تا سررسید کم', desc: 'کمتر از حداقل روز مانده' },
        { key: 'tno', label: 'تعداد معاملات', desc: 'تعداد معاملات کمتر از حد' },
        { key: 'tvol', label: 'حجم معاملات', desc: 'حجم کمتر از حد' },
        { key: 'new-sym', label: 'نماد تازه', desc: 'نماد تازه وارد با معامله کم' },
        { key: 'base-vol', label: 'حجم مبنا', desc: 'حجم کمتر از حجم مبنا' },
        { key: 'halt', label: 'توقف نماد', desc: 'نماد متوقف' },
        { key: 'price', label: 'قیمت نامعتبر', desc: 'آخرین قیمت کمتر از حداقل' },
        { key: 'no-quote', label: 'بدون مظنه', desc: 'قیمت خرید/فروش موجود نیست' },
        { key: 'crossed-book', label: 'دفتر متقاطع', desc: 'قیمت خرید > فروش' },
        { key: 'spread', label: 'اسپرد زیاد', desc: 'اختلاف خرید/فروش بیش از سقف' },
        { key: 'avg-trade', label: 'میانگین معامله', desc: 'میانگین حجم معامله کم' },
        { key: 'depth0', label: 'عمق صفر', desc: 'حجم صف خرید/فروش صفر' },
        { key: 'buy-queue', label: 'صف خرید قفل', desc: 'صف خرید قفل شده' },
        { key: 'depth', label: 'عمق کم', desc: 'عمق دفتر سفارش کم' },
        { key: 'strike', label: 'اعمال نامعتبر', desc: 'قیمت اعمال استخراج نشد' },
        { key: 'unit', label: 'واحد قیمت', desc: 'اختلاف مدل/بازار بیش از حد' },
        { key: 'unit-fast', label: 'واحد (سریع)', desc: 'اختلاف در مسیر سریع' },
        { key: 'arb-bound', label: 'مرز آربیتراژ', desc: 'قیمت خارج از بازه آربیتراژ' },
        { key: 'time-value', label: 'ارزش زمانی', desc: 'ارزش زمانی بیش از سقف' },
        { key: 'iv-premium', label: 'صرف IV', desc: 'IV بالاتر از سقف صرف' },
        { key: 'iv-bad', label: 'IV نامعتبر', desc: 'حل IV ممکن نشد' },
        { key: 'iv-range', label: 'IV خارج بازه', desc: 'IV خارج از ۵٪-۵۰۰٪' },
        { key: 'base-price', label: 'قیمت پایه نامعتبر', desc: 'قیمت پایه یافت نشد' },
        { key: 'div-day', label: 'روز تقسیم سود', desc: 'روز مجمع/سود' },
        { key: 'contractSize', label: 'اندازه قرارداد', desc: 'اندازه قرارداد نامعتبر' },
        { key: 'gate', label: 'گیت محاسباتی', desc: 'رد در محاسبات اولیه' },
        { key: 'score', label: 'امتیاز پایین', desc: 'امتیاز کمتر از حداقل', isPrefix: true },
        { key: 'rank', label: 'رتبه پایین', desc: 'رتبه خارج از سقف گروه' },
        { key: 'global-rank', label: 'سقف کل', desc: 'بیش از سقف کل ردیف‌ها' },
        { key: 'pareto', label: 'پارتو', desc: 'رد در فیلتر پارتو' },
        { key: 'min-er', label: 'بازده کم', desc: 'بازده انتظاری کمتر از حداقل' },
        { key: 'cold', label: 'بازده سرد', desc: 'بازده کمتر از کف 3%' },
        { key: 'aborted', label: 'توقف خودکار', desc: 'توقف به دلیل خطای پیاپی' }
    ];
    var PIPELINE_DEFS71 = FILTER_ORDER71; // for backward compat
    function pipelineData71(){
        try {
            var total = 0;
            try { total = (typeof window !== 'undefined' && window && window.__opt71TotalScanned) ? window.__opt71TotalScanned : 0; } catch(e){}
            var L = null;
            try { L = LOG(); } catch(e){}
            var rejected = (L && L.rejected) ? L.rejected : {};
            var passed = (L && typeof L.passed === 'number') ? L.passed : 0;
            var stages = [];
            var remaining = total;
            stages.push({ key: 'total', label: 'ورودی کل', count: total, filtered: 0, remaining: total, color: '#5b9cf6', isTotal: true, desc: 'تعداد کل نمادهای بررسی شده' });
            // v9.6.0.7: نمایش همه فیلترهای منطقی حتی اگر ورودی ندارند — درخواست کاربر
            for (var i=0;i<FILTER_ORDER71.length;i++){
                var def = FILTER_ORDER71[i];
                var cnt = 0;
                if (def.isPrefix) {
                    for (var kk in rejected) if (Object.prototype.hasOwnProperty.call(rejected, kk) && kk.indexOf(def.key)===0) cnt += rejected[kk];
                } else {
                    if (rejected[def.key]) cnt = rejected[def.key];
                }
                var before = remaining;
                if (cnt>0) remaining = Math.max(0, remaining - cnt);
                var colors = ['#ff6b6b','#ff8e53','#ffa502','#feca57','#1dd1a1','#54a0ff','#5f27cd','#9980fa','#ff9ff3','#f368e0','#00d2d3','#ff9f43','#10ac84','#ee5a24','#0abde3','#c8d6e5','#57606f','#222f3e','#5f27cd','#9980fa','#ff6b6b','#ff8e53','#ffa502','#feca57','#1dd1a1','#54a0ff','#5f27cd','#9980fa','#10ac84','#8395a7'];
                var color = colors[i % colors.length];
                stages.push({ 
                    key: def.key, 
                    label: def.label, 
                    count: cnt, 
                    filtered: cnt, 
                    remaining: remaining, 
                    before: before,
                    color: color, 
                    desc: def.desc,
                    pctFiltered: total ? Math.round(cnt/total*100) : 0,
                    pctRemaining: total ? Math.round(remaining/total*100) : 0,
                    isZero: cnt===0
                });
            }
            // سایر - any rejected not in FILTER_ORDER
            var otherCnt = 0;
            for (var kk2 in rejected) if (Object.prototype.hasOwnProperty.call(rejected, kk2)) {
                var isAcc = false;
                for (var jj=0;jj<FILTER_ORDER71.length;jj++){
                    var dd = FILTER_ORDER71[jj];
                    if (dd.isPrefix && kk2.indexOf(dd.key)===0) { isAcc = true; break; }
                    if (dd.key === kk2) { isAcc = true; break; }
                }
                if (!isAcc) otherCnt += rejected[kk2];
            }
            if (otherCnt > 0) {
                var beforeOther = remaining;
                remaining = Math.max(0, remaining - otherCnt);
                stages.push({ key: 'other', label: 'سایر فیلترها', count: otherCnt, filtered: otherCnt, remaining: remaining, before: beforeOther, color: '#8395a7', desc: 'سایر دلایل رد', pctFiltered: total ? Math.round(otherCnt/total*100) : 0, pctRemaining: total ? Math.round(remaining/total*100) : 0, isZero: false });
            }
            stages.push({ key: 'passed', label: 'خروجی نهایی ✅', count: passed, filtered: 0, remaining: passed, before: remaining, color: '#10ac84', isPass: true, desc: 'تعداد نمادهایی که از تمام فیلترها عبور کردند', pctRemaining: total ? Math.round(passed/total*100) : 0 });
            return { total: total, passed: passed, rejected: rejected, stages: stages, finalRemaining: passed };
        } catch(e){ return { total:0, passed:0, rejected:{}, stages:[], finalRemaining:0 }; }
    }
    
        function buildPipelinePanel71(){
        try {
            if (typeof window === 'undefined' || !window || typeof document === 'undefined' || !document || !document.body) return null;
            var id = '__opt71PipePanel';
            var el = document.getElementById(id);
            if (el) return el;
            el = document.createElement('div');
            el.id = id;
            el.dir = 'rtl';
            el.setAttribute('data-opt71-ui','1');
            el.style.cssText = 'position:fixed;top:60px;right:12px;z-index:2147483646;width:520px;max-width:96vw;max-height:85vh;overflow:auto;background:#1e2430;color:#dfe6f1;border:1px solid #3a455c;border-radius:12px;padding:14px 16px;font:12px/1.8 Tahoma,Vazirmatn,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,.5);display:none;';
            el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><b style="flex:1;font-size:13px;color:#8ecbff;">📈 فرآیند فیلترینگ — قیف نمادها</b><button id="__opt71PipeClose" style="background:#ff6b6b;color:#fff;border:0;border-radius:6px;padding:2px 8px;cursor:pointer;">×</button></div><div style="margin-bottom:8px;display:flex;gap:6px;align-items:center;"><label style="display:flex;align-items:center;gap:4px;font-size:11px;color:#a0aec0;cursor:pointer;"><input type="checkbox" id="__opt71PipeShowZero" checked style="cursor:pointer;"> نمایش فیلترهای خالی (0)</label><span style="font-size:10px;color:#718096;">— هر سطح = یک فیلتر منطقی</span></div><div id="__opt71PipeBody"></div><div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap;"><button id="__opt71PipeReset" style="background:#444c5e;color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font:11px Tahoma;">🔄 پاک‌سازی آمار</button><button id="__opt71PipeLog" style="background:#2d6cdf;color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font:11px Tahoma;">📋 جزئیات لاگ</button><button id="__opt71PipeCopy" style="background:#2d6e4f;color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font:11px Tahoma;">📋 کپی</button><button id="__opt71PipeAnalyze" style="background:#9b59b6;color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font:11px Tahoma;">🔍 تحلیل لاگ واقعی</button></div><div id="__opt71PipeLogDetail" style="display:none;margin-top:10px;background:#151a24;border-radius:8px;padding:8px;max-height:30vh;overflow:auto;white-space:pre-wrap;font:11px/1.6 monospace;direction:ltr;text-align:left;"></div><div id="__opt71PipeAnalyzeDetail" style="display:none;margin-top:10px;background:#1a2332;border:1px solid #2d6cdf;border-radius:8px;padding:10px;max-height:40vh;overflow:auto;"></div>';
            document.body.appendChild(el);
            try { if (typeof wireTopWindow71 === 'function') wireTopWindow71(el); } catch(e){}
            var closeBtn = el.querySelector('#__opt71PipeClose');
            if (closeBtn) {
                closeBtn.type = 'button';
                bind71(closeBtn, function(){ el.style.display='none'; });
            }
            var resetBtn = el.querySelector('#__opt71PipeReset');
            if (resetBtn) {
                bind71(resetBtn, function(){ try { if (window.optLogReset) window.optLogReset(); if (window.optResetScanStats) window.optResetScanStats(); pipelineRender71(); } catch(ex){} });
            }
            var logBtn = el.querySelector('#__opt71PipeLog');
            if (logBtn) {
                bind71(logBtn, function(){
                    try {
                        var detail = el.querySelector('#__opt71PipeLogDetail');
                        if (!detail) return;
                        if (detail.style.display === 'none') {
                            var data = pipelineData71();
                            var NL = String.fromCharCode(10);
                            var txt = 'Total: ' + data.total + ' | Passed: ' + data.passed + NL;
                            txt += 'Rejected breakdown:' + NL;
                            for (var k in data.rejected) if (Object.prototype.hasOwnProperty.call(data.rejected, k)) txt += '  ' + k + ': ' + data.rejected[k] + NL;
                            try { if (window.optInputLog) { var il = window.optInputLog(); txt += NL + 'InputLog: ' + JSON.stringify(il, null, 2); } } catch(ex){}
                            try { if (window.optAbortStatus) { var ab = window.optAbortStatus(); txt += NL + NL + 'AbortStatus: ' + JSON.stringify(ab, null, 2); } } catch(ex){}
                            detail.textContent = txt;
                            detail.style.display = '';
                        } else {
                            detail.style.display = 'none';
                        }
                    } catch(ex){}
                });
            }
            var showZeroChk = el.querySelector('#__opt71PipeShowZero');
            if (showZeroChk) {
                showZeroChk.type='checkbox';
                var showZeroFn = function(){
                    try { window.__opt71ShowZero = !!showZeroChk.checked; pipelineRender71(); } catch(e){}
                };
                try { showZeroChk.addEventListener('change', showZeroFn); } catch(e){}
                try { window.__opt71ShowZero = true; } catch(e){}
            }
            var analyzeBtn = el.querySelector('#__opt71PipeAnalyze');
            if (analyzeBtn) {
                bind71(analyzeBtn, function(){
                    try {
                        var detail = el.querySelector('#__opt71PipeAnalyzeDetail');
                        if (!detail) return;
                        if (detail.style.display === 'none') {
                            var analysis = '';
                            try { if (typeof analyzeRealLog71 === 'function') analysis = analyzeRealLog71(); else analysis = 'تحلیل‌گر در دسترس نیست'; } catch(ex){ analysis = 'خطا در تحلیل: ' + ex; }
                            detail.innerHTML = analysis;
                            detail.style.display = '';
                        } else {
                            detail.style.display = 'none';
                        }
                    } catch(ex){}
                });
            }
            var copyBtn = el.querySelector('#__opt71PipeCopy');
            if (copyBtn) {
                bind71(copyBtn, function(){
                    try {
                        var data = pipelineData71();
                        var txt = JSON.stringify(data, null, 2);
                        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt);
                        copyBtn.textContent = '✔ کپی شد';
                        setTimeout(function(){ copyBtn.textContent = '📋 کپی'; }, 1500);
                    } catch(ex){}
                });
            }
            window.__opt71PipePanel = el;
            return el;
        } catch(e){ return null; }
    }

    function pipelineRender71(){
        try {
            var el = document.getElementById('__opt71PipePanel') || window.__opt71PipePanel || buildPipelinePanel71();
            if (!el) return;
            var body = el.querySelector('#__opt71PipeBody');
            if (!body) return;
            var data = pipelineData71();
            var total = data.total || 1;
            var html = '';
            html += '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">';
            html += '<div style="background:#2d3748;border-radius:8px;padding:6px 10px;flex:1;min-width:90px;text-align:center;"><div style="font-size:11px;color:#a0aec0;">ورودی کل</div><div style="font-size:18px;font-weight:bold;color:#5b9cf6;">' + data.total + '</div><div style="font-size:10px;color:#718096;">100%</div></div>';
            html += '<div style="background:#2d3748;border-radius:8px;padding:6px 10px;flex:1;min-width:90px;text-align:center;"><div style="font-size:11px;color:#a0aec0;">فیلتر شده</div><div style="font-size:18px;font-weight:bold;color:#ff6b6b;">' + (data.total - data.passed) + '</div><div style="font-size:10px;color:#718096;">' + (total?Math.round((data.total-data.passed)/total*100):0) + '%</div></div>';
            html += '<div style="background:#1a2e22;border:1px solid #10ac84;border-radius:8px;padding:6px 10px;flex:1;min-width:90px;text-align:center;"><div style="font-size:11px;color:#a0aec0;">خروجی نهایی</div><div style="font-size:18px;font-weight:bold;color:#10ac84;">' + data.passed + '</div><div style="font-size:10px;color:#718096;">' + (total?Math.round(data.passed/total*100):0) + '%</div></div>';
            html += '</div>';
            var showZero = true;
            try { if (typeof window !== 'undefined' && window && typeof window.__opt71ShowZero === 'boolean') showZero = window.__opt71ShowZero; } catch(e){}
            html += '<div style="display:flex;flex-direction:column;gap:8px;">';
            for (var i=0;i<data.stages.length;i++){
                var st = data.stages[i];
                if (st.isTotal) continue;
                var isPass = !!st.isPass;
                if (!isPass && st.isZero && !showZero) continue;
                var barPctFiltered = total ? Math.round(st.filtered / total * 100) : 0;
                var barPctRemaining = total ? Math.max(3, Math.round(st.remaining / total * 100)) : 0;
                var barPct = isPass ? barPctRemaining : (st.isZero ? 0 : Math.max(3, barPctFiltered));
                var beforePct = total ? Math.round((st.before||total) / total * 100) : 0;
                var isZero = !!st.isZero;
                if (isPass) {
                    html += '<div style="background:linear-gradient(135deg,#1a2e22 0%,#0f2a1a 100%);border:2px solid #10ac84;border-radius:10px;padding:10px 12px;box-shadow:0 2px 8px rgba(16,172,132,0.2);">';
                    html += '<div style="display:flex;align-items:center;gap:10px;">';
                    html += '<div style="width:36px;height:36px;background:#10ac84;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;">✅</div>';
                    html += '<div style="flex:1;"><div style="font-size:13px;font-weight:bold;color:#10ac84;">' + st.label + '</div><div style="font-size:11px;color:#a0aec0;">' + (st.desc||'') + '</div></div>';
                    html += '<div style="text-align:left;"><div style="font-size:20px;font-weight:bold;color:#10ac84;">' + st.remaining + '</div><div style="font-size:11px;color:#718096;">' + st.pctRemaining + '% از ورودی</div></div>';
                    html += '</div>';
                    html += '<div style="margin-top:8px;background:#0f1f16;border-radius:6px;height:24px;position:relative;overflow:hidden;"><div style="background:linear-gradient(90deg,#10ac84,#1dd1a1);width:' + barPct + '%;height:100%;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;transition:width 0.5s;">' + st.remaining + ' نماد</div></div>';
                    html += '</div>';
                } else {
                    var bg = isZero ? '#1f252f' : '#252d3d';
                    var opacity = isZero ? '0.6' : '1';
                    var borderStyle = isZero ? 'border-right:4px solid #4a5568;' : 'border-right:4px solid ' + st.color + ';';
                    html += '<div style="background:' + bg + ';border-radius:10px;padding:8px 10px;' + borderStyle + 'opacity:' + opacity + ';">';
                    html += '<div style="display:flex;align-items:center;gap:8px;">';
                    html += '<div style="width:28px;height:28px;background:' + (isZero ? '#4a5568' : st.color) + ';border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;">' + (i) + '</div>';
                    html += '<div style="flex:1;"><div style="font-size:12px;font-weight:bold;color:' + (isZero ? '#a0aec0' : '#e2e8f0') + ';">' + st.label + (isZero ? ' <span style="font-size:10px;color:#718096;">(بدون فیلتر)</span>' : '') + '</div><div style="font-size:10px;color:#a0aec0;">' + (st.desc||'') + '</div></div>';
                    html += '<div style="text-align:left;min-width:90px;">';
                    if (isZero) {
                        html += '<div style="font-size:11px;color:#718096;">▼ فیلتر: <b>0</b> (0%)</div>';
                    } else {
                        html += '<div style="font-size:11px;color:#ff8a8a;">▼ فیلتر: <b>' + st.filtered + '</b> (' + st.pctFiltered + '%)</div>';
                    }
                    html += '<div style="font-size:11px;color:#63b3ed;">◀ مانده: <b>' + st.remaining + '</b> (' + st.pctRemaining + '%)</div>';
                    html += '</div></div>';
                    html += '<div style="margin-top:6px;display:flex;align-items:center;gap:6px;">';
                    html += '<div style="font-size:10px;color:#718096;width:50px;">قبل: ' + (st.before||0) + '</div>';
                    html += '<div style="flex:1;background:#1a202c;border-radius:6px;height:16px;position:relative;overflow:hidden;display:flex;">';
                    html += '<div style="background:' + st.color + ';width:' + beforePct + '%;height:100%;opacity:0.3;"></div>';
                    html += '<div style="background:' + st.color + ';width:' + barPct + '%;height:100%;border-radius:6px;position:absolute;right:0;top:0;transition:width 0.5s;opacity:' + (isZero ? '0.4' : '1') + ';"></div>';
                    html += '</div>';
                    html += '<div style="font-size:10px;color:#718096;width:50px;">بعد: ' + st.remaining + '</div>';
                    html += '</div></div>';
                }
            }
            html += '</div>';
            html += '<div style="margin-top:12px;padding:8px;background:#1a202c;border-radius:8px;font-size:10px;color:#718096;text-align:center;line-height:1.6;">هر سطح = یک فیلتر منطقی — حتی اگر 0 نماد فیلتر کند، نام آن نمایش داده می‌شود (v9.6.0.7)<br>▼ تعداد فیلتر شده در این مرحله | ◀ تعداد باقی‌مانده پس از این فیلتر<br>در انتها خروجی نهایی = تعداد نمادهایی که از تمام فیلترها عبور کردند</div>';
            body.innerHTML = html;
        } catch(e){ try { dbgWarn('pipeline: ' + (e && e.message ? e.message : e), false); } catch(e2){} }
    }
    
    
    // v9.6.0.7: تحلیل‌گر لاگ واقعی فرآیند فیلتر
        function analyzeRealLog71(){
        try {
            var data = pipelineData71();
            var total = data.total || 0;
            var NL = String.fromCharCode(10);
            var esc71 = function(s){ try { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); } catch(e){ return ''; } };
            var html = '<div style="font:12px/1.8 Tahoma;">';
            html += '<div style="background:#1e2a3a;border-radius:8px;padding:10px;margin-bottom:10px;">';
            html += '<b style="color:#8ecbff;">📊 تحلیل لاگ واقعی — ' + esc71(total) + ' نماد بررسی شده</b><br>';
            html += '<span style="color:#a0aec0;">ورودی: ' + esc71(total) + ' | خروجی نهایی: ' + esc71(data.passed) + ' | فیلتر شده: ' + esc71(total - data.passed) + '</span>';
            html += '</div>';

            // Check aborted high
            var abortedCnt = 0;
            try { if (data.rejected && data.rejected['aborted']) abortedCnt = data.rejected['aborted']; } catch(e){}
            if (abortedCnt > 0) {
                var abortedPct = total ? Math.round(abortedCnt/total*100) : 0;
                html += '<div style="background:' + (abortedPct>50 ? '#3a1f1f' : '#2a2a1f') + ';border:1px solid ' + (abortedPct>50 ? '#ff6b6b' : '#ffa502') + ';border-radius:8px;padding:10px;margin-bottom:10px;">';
                html += '<div style="color:' + (abortedPct>50 ? '#ff6b6b' : '#ffa502') + ';font-weight:bold;">⚠️ توقف خودکار: ' + esc71(abortedCnt) + ' نماد (' + esc71(abortedPct) + '%)</div>';
                html += '<div style="color:#d0d0d0;font-size:11px;margin-top:6px;line-height:1.8;">';
                html += 'دلیل: دیده‌بان اختیار نامعتبر (l18/l30 ناقص) → خطای پیاپی → آستانه توقف ' + esc71((typeof CONFIG !== 'undefined' && CONFIG.abortThreshold) ? CONFIG.abortThreshold : 10) + ' فعال شد.<br>';
                html += 'راه‌حل:<br>';
                html += '1. بررسی دیده‌بان: باید فقط نمادهای اختیار (ض+حروف) باشد، نه سهام پایه.<br>';
                html += '2. اجرای دستور در کنسول: <code style="background:#1a1a1a;padding:2px 6px;border-radius:4px;direction:ltr;">optClearAbort()</code> یا <code style="background:#1a1a1a;padding:2px 6px;border-radius:4px;">optSet("abortThreshold",0)</code><br>';
                html += '3. سپس صفحه را رفرش کنید و دوباره اسکن کنید.';
                html += '</div></div>';
            }

            // Top 5 bottlenecks
            var sorted = [];
            try {
                for (var k in data.rejected) if (Object.prototype.hasOwnProperty.call(data.rejected, k)) {
                    if (k==='aborted') continue; // handled separately
                    sorted.push({ key:k, count:data.rejected[k] });
                }
                sorted.sort(function(a,b){ return b.count - a.count; });
            } catch(e){}

            if (sorted.length>0) {
                html += '<div style="background:#1e2430;border-radius:8px;padding:10px;margin-bottom:10px;">';
                html += '<b style="color:#ffd479;">🔝 ۵ گلوگاه اصلی فیلترینگ (بدون احتساب توقف):</b><br>';
                for (var i=0;i<Math.min(5, sorted.length);i++) {
                    var it = sorted[i];
                    var pct = total ? Math.round(it.count/total*100) : 0;
                    var def = null;
                    try { for (var j=0;j<FILTER_ORDER71.length;j++) if (FILTER_ORDER71[j].key===it.key) { def=FILTER_ORDER71[j]; break; } } catch(e){}
                    var label = def ? def.label : it.key;
                    var desc = def ? def.desc : '';
                    html += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #2a3441;">';
                    html += '<span><b style="color:#ff9f43;">' + esc71(label) + '</b> <span style="color:#718096;font-size:10px;">(' + esc71(it.key) + ')</span> — <span style="color:#a0aec0;font-size:11px;">' + esc71(desc) + '</span></span>';
                    html += '<span style="color:#ff6b6b;font-weight:bold;">' + esc71(it.count) + ' (' + esc71(pct) + '%)</span>';
                    html += '</div>';
                }
                html += '</div>';
            }

            // Efficiency
            html += '<div style="background:#1a2e22;border:1px solid #10ac84;border-radius:8px;padding:10px;margin-bottom:10px;">';
            html += '<b style="color:#10ac84;">📈 کارایی قیف:</b><br>';
            var eff = 0;
            if (total>0) {
                if (data.passed>0) eff = Math.round(data.passed/total*100);
                else if (total>0 && data.passed===0) eff = 0;
            }
            if (total===0) {
                html += '<span style="color:#ffa502;">⚠️ ورودی صفر — دیده‌بان خالی یا فیلتر اولیه همه را حذف کرده</span>';
            } else if (data.passed>0) {
                html += '<span style="color:#d0d0d0;">از هر 100 نماد ورودی، ' + esc71(eff) + ' نماد به خروجی نهایی می‌رسد. کارایی: ' + esc71(eff) + '%</span>';
            } else {
                html += '<span style="color:#ff6b6b;">⚠️ خروجی صفر — تمام ' + esc71(total) + ' نماد فیلتر شدند. گلوگاه اصلی را بررسی کنید.</span>';
                if (abortedCnt>0) html += '<br><span style="color:#ffa502;">توقف خودکار فعال بوده — ابتدا آن را پاک کنید.</span>';
            }
            html += '</div>';

            // Full stages table
            html += '<div style="background:#1e2430;border-radius:8px;padding:10px;">';
            html += '<b style="color:#8ecbff;">📋 جزئیات تمام سطوح قیف:</b><br>';
            html += '<div style="max-height:30vh;overflow:auto;margin-top:8px;">';
            for (var s=0;s<data.stages.length;s++) {
                var st = data.stages[s];
                if (st.isTotal) continue;
                var isAborted = st.key==='aborted';
                var bg = isAborted ? '#3a1f1f' : (st.isZero ? '#1f252f' : '#252d3d');
                var borderColor = isAborted ? '#ff6b6b' : st.color;
                html += '<div style="background:' + bg + ';border-right:4px solid ' + borderColor + ';border-radius:6px;padding:6px 8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;">';
                html += '<span style="color:' + (isAborted ? '#ff6b6b' : '#d0d0d0') + ';font-size:11px;"><b>' + esc71(st.label) + '</b> (' + esc71(st.key) + ') — ' + esc71(st.desc||'') + '</span>';
                html += '<span style="color:' + (st.isZero ? '#718096' : (isAborted ? '#ff6b6b' : '#ff8e53')) + ';font-weight:bold;font-size:11px;">' + esc71(st.filtered) + ' فیلتر | ' + esc71(st.remaining) + ' باقی (' + esc71(st.pctRemaining||0) + '%)</span>';
                html += '</div>';
            }
            html += '</div></div>';

            html += '</div>';
            return html;
        } catch(e){ return '<div style="color:#ff6b6b;">خطا در تحلیل: ' + (e && e.message ? e.message : e) + '</div>'; }
    }


    function pipelineOpen71(){
        try {
            var el = buildPipelinePanel71();
            if (!el) return;
            pipelineRender71();
            el.style.display = '';
            try { if (typeof bringTop71 === 'function') bringTop71(el); } catch(e){}
        } catch(e){}
    }

    function logReject(sym, reason) {
        var D = dbgState();
        if (D) { D.rejects.counts[reason] = (D.rejects.counts[reason] || 0) + 1; D.rejects.last = { reason: reason, sym: sym, t: Date.now() }; D.rejects.history.push(D.rejects.last); if (D.rejects.history.length > 100) D.rejects.history.shift(); }
        var L = LOG(); if (!L) return;
        if (CONFIG.logReasons) L.rejected[reason] = (L.rejected[reason] || 0) + 1;
        if (CONFIG.verbose) { try { console.log('❌ ' + sym + ' → ' + reason); } catch (e) {} }
    }
    function logRej(sym, reason) { logReject(sym, reason); return false; }
    function logPass(sym) {
        var L = LOG(); if (!L) return;
        L.passed++;
        if (CONFIG.verbose) { try { console.log('✅ ' + sym); } catch (e) {} }
    }

    // ═══════════════════════════════════════════════════════════════
    //  تنظیماتِ زمانِ اجرا — بدونِ دست‌کاریِ متنِ اسکریپت
    // ═══════════════════════════════════════════════════════════════
    // ── v6: کلیدها بر اساس اهمیت (بالا → پایین) ──
    var OPT_KEYS = [
        ['expiryDate',        'تاریخِ سررسید (جلالی) — در چند-سررسیدی فقط پشتیبان', 'str'],
        ['view',              'دیدِ جهت‌دار (−1 نزولی … +1 صعودی)'],
        ['viewDailyPct',      'حرکتِ روزانهٔ متناظر با دیدِ کامل (٪)'],
        ['holdDays',          'افقِ نگه‌داری (روزِ کاری)'],
        ['erGridStep',        'گامِ شبکهٔ ER (تخصصی)', null, 'console'],
        ['minExpRet',         'حداقلِ بازدهِ انتظاری (٪)'],
        ['maxPerGroup',       'سقفِ نماد در هر گروه'],
        ['poolDays',          'طولِ پنجرهٔ استخر (۷ تا ۳۰ روزِ گذشته)'],
        ['poolAuto',          'استخرسنج: پیش‌فرض‌ها از پنجرهٔ گذشته'],
        ['poolPreGateEveryScan', 'پری‌گیت: نمونه‌برداری در هر پاس (حتی cache-hit)'],
        ['poolGates',         'گیت‌های بهینه از استخر'],
        ['contractSize',      'اندازهٔ قرارداد ⚠️'],
        ['strictContractSize','ردِ اندازهٔ قراردادِ ناشناخته (سخت‌گیر؛ ممکن است نمادهای بیشتری رد شوند)'],
        ['computeIntervalMs', 'دورهٔ محاسبهٔ سنگین (ms)'],
        ['cacheTtlMs',        'عمرِ سنجهٔ کش (ms)'],
        ['offHoursOnce',      'بیرونِ ساعت: فقط یک بار محاسبه'],
        ['offHoursFactor',    'ضریبِ دوره بیرونِ ساعت (اگر offHoursOnce=false)'],
        ['enforceMarketHours','بیرونِ ساعت هیچ خروجی نشان نده'],
        ['perfBudgetMs',      'بودجهٔ زمانیِ هر نماد (ms)'],
        ['allowFastPath',     'اجازهٔ مسیرِ سریع (!)'],
        ['sessionDays',        'روزهای فعال بازار (مثال بورس تهران: 0,1,2,3,6)', 'days'],
        ['marketHolidays',     'تعطیلات استثنایی جلالی (مثال: 1405/01/02)', 'hol'],
        ['maxSpread',         'سقفِ اسپرد (٪)',                 null, 'ro'],
        ['maxCostRT',         'سقفِ هزینهٔ رفت‌وبرگشت (٪)',      null, 'ro'],
        ['maxIvPremium',      'سقفِ صرفِ IV (واحدِ ٪)',          null, 'ro'],
        ['volFloor',          'کفِ نوسان (٪)',                  null, 'ro'],
        ['volCeil',           'سقفِ نوسان (٪)',                 null, 'ro'],
        ['minTno',            'حداقلِ معامله',                  null, 'ro'],
        ['minTvol',           'حداقلِ حجم',                     null, 'ro'],
        ['maxLeverage',       'سقفِ اهرم',                      null, 'ro'],
        ['poolMinObs',        'استخر: حداقلِ مشاهده',           null, 'console'],
        ['poolClamp',         'استخر: ضریبِ اطمینانِ قیمت',      null, 'console'],
        ['poolGateClamp',     'استخر: مهارِ گیت (ضریب)',        null, 'console'],
        ['poolMinGateObs',    'استخر: حداقلِ مشاهدهٔ هر گیت',    null, 'console'],
        ['basePrices',        'قیمت‌های پایه (شیء)',  'obj', 'console'],
        ['baseVol',           'نوسان‌های پایه (شیء)', 'obj', 'console'],
        ['contractSizes',     'اندازهٔ قراردادِ هر نماد (شیء)', 'obj', 'console'],
        ['useEwma',           'نوسانِ EWMA'],
        ['useLiveBase',       'قیمتِ زندهٔ پایه'],
        ['blockOnHalt',       'بلاکِ توقف'],
        ['blockOnOrderQueue', 'بلاکِ صفِ خرید'],
        ['blockOnDividendDay','بلاکِ روزِ سود'],
        ['enforceVolumeBase', 'حجمِ مبنا'],
        ['useWeightedDepth',  'عمقِ وزنی'],
        ['autoView',          'روندِ خودکار'],
        ['positionSizing',    'مدیریتِ پوزیشن'],
        ['logReasons',        'دلیلِ رد'],
        ['verbose',           'لاگِ کامل'],
        ['debugPanel',        'پنل دیباگ 🐞'],
        ['backtestMode',      'بک‌تست'],
        ['backtestDate',      'تاریخِ بک‌تست (2026-09-01)', 'str', 'console'],
        ['supportTabeii',     'تبعی'],
        ['allowNewSymbols',   'نمادِ تازه'],
        ['ewmaLambda',        'λ EWMA',                     null, 'console'],
        ['autoViewWeight',    'وزنِ روندِ خودکار',           null, 'console'],
        ['volumeBaseRatio',   'نسبتِ حجمِ مبنا',             null, 'console'],
        ['orderQueueThreshold','آستانهٔ صفِ خرید',            null, 'console'],
        ['liveBaseMaxAge',    'عمرِ قیمتِ زنده (ms)',        null, 'console'],
        ['capital',           'سرمایه (ریال)',               null, 'console'],
        ['riskPerTrade',      'ریسک هر معامله (٪)',          null, 'console'],
        ['stopLossPct',       'حدِ ضرر (٪)',                 null, 'console'],
        ['takeProfitPct',     'حدِ سود (٪)',                 null, 'console'],
        ['tabeiiDiscount',    'تخفیفِ تبعی (٪)',             null, 'console'],
        ['newSymbolMinObs',   'حداقلِ معاملهٔ نمادِ تازه',    null, 'console'],
        ['dividendMaxDays',   'افقِ سود (روز)',              null, 'console'],
        ['dividendAutoFetch', 'واکشیِ خودکارِ سود',           null, 'console'],
        ['dividendFetchUrl',  'نشانیِ واکشیِ سود',             'url', 'console'],
        ['riskFreeAutoFetch', 'واکشیِ خودکارِ نرخ',           null, 'console'],
        ['riskFreeFetchUrl',  'نشانیِ واکشیِ نرخ',             'url', 'console'],
        ['baseInsCodes',      'کدِ TSETMC پایه‌ها (شیء)', 'obj', 'console'],
        ['dividendCalendar',  'تقویمِ سود (شیء)',        'cal', 'console'],
        ['riskFreeCurve',     'منحنیِ نرخ (آرایه)',      'arr', 'console'],
        ['depthWeights',      'وزن‌های عمق (آرایه)',     'arr', 'console'],
        ['useScore',           'امتیازِ تناسب'],
        ['scoreMin',           'حداقلِ امتیازِ تناسب'],
        ['useIvRank',          'IV Rank'],
        ['useAdx',             'ADX (از [ih])'],
        ['useEntry',           'پیشنهادِ ورود/SL/TP'],
        ['entryPad',           'تخفیف ورود از منصفانه (٪)'],
        ['roundToTick',        'تیکِ گردکردن (ریال)',   null, 'console'],
        ['maxTimeValuePct',    'سقفِ ارزشِ زمانی (٪ پریمیوم)', null, 'console'],        ['usePopup',           'پاپ‌آپِ تحلیلی'],
        ['c0Mode',             'ستونِ cfield0: score یا er', 'str', 'console'],
        ['wER',                'وزنِ ER',                    null, 'console'],
        ['wIVR',               'وزنِ IV Rank',               null, 'console'],
        ['wADX',               'وزنِ ADX',                   null, 'console'],
        ['wLiq',               'وزنِ نقدینگی',               null, 'console'],
        ['wEdge',              'وزنِ برتریِ IV',             null, 'console'],
        ['ivRankBuy',          'IV Rank خرید ≤',             null, 'console'],
        ['ivRankSell',         'IV Rank فروش ≥',             null, 'console'],
        ['ivHistDays',         'پنجرهٔ تاریخچهٔ IV (روز)',    null, 'console'],
        ['ivAtmBand',          'باندِ ATM برای IV Rank (٪)'],
        ['multiExpiry',        'چند-سررسیدی (سررسید از نامِ ردیف)'],
        ['maxPerExpiry',       'سقفِ ردیف در هر پایه/نوع/سررسید (۰=خاموش)'],
        ['distantDays',        'معافیتِ سررسیدِ دورتر از این (روز)'],
        ['maxTotalRows',       'سقفِ کلِ ردیف‌ها (۰=خاموش؛ warm تا ×۱٫۵)'],
        ['c0Tiebreak',         'ترتیبِ دوم در cfield0 (فقط حالتِ score)'],
        ['poolObsFromMin',     'شروعِ ثبتِ استخر (دقیقه از نیمشب)', null, 'console'],
        ['adxPeriod',          'دورهٔ ADX',                  null, 'console'],
        ['ihNewestFirst',      '[ih][0] = جدیدترین',         null, 'console'],
        ['abortThreshold', 'آستانهٔ توقف خودکار (۰=خاموش)', null, 'console'],
];
    var PANEL_SECTIONS = [
        ['① سررسید و دید بازار', ['expiryDate', 'view', 'viewDailyPct', 'holdDays'], true, true],
        ['② بازده و سقف نمایش', ['minExpRet', 'maxPerGroup', 'maxTotalRows'], true, true],
        ['③ نقدشوندگی و گیت‌ها', ['minTno', 'minTvol', 'maxSpread', 'maxCostRT', 'minDepthTrades', 'maxLeverage', 'maxIvPremium', 'maxTimeValuePct'], true],
        ['④ استخر و قرارداد', ['poolDays', 'poolAuto', 'poolPreGateEveryScan', 'poolGates', 'contractSize', 'strictContractSize'], true],
        ['⑤ تقویم و ساعت بازار', ['sessionDays', 'marketHolidays', 'enforceMarketHours', 'offHoursOnce', 'offHoursFactor'], true],
        ['⑥ موتور و کارایی', ['computeIntervalMs', 'cacheTtlMs', 'perfBudgetMs', 'allowFastPath', 'abortThreshold'], true],
        ['⑦ داده و فیلترهای بازار', ['useLiveBase', 'useEwma', 'useWeightedDepth', 'autoView', 'blockOnHalt', 'blockOnOrderQueue', 'blockOnDividendDay', 'enforceVolumeBase', 'allowNewSymbols'], true],
        ['⑧ امتیاز، IV و ADX', ['useScore', 'scoreMin', 'useIvRank', 'useAdx', 'ivAtmBand', 'useEntry', 'entryPad'], true],
        ['⑨ چندسررسیدی و خروجی', ['multiExpiry', 'maxPerExpiry', 'distantDays', 'c0Tiebreak', 'usePopup'], true],
        ['⑩ تبعی، پوزیشن و تشخیص', ['supportTabeii', 'positionSizing', 'logReasons', 'verbose', 'debugPanel', 'backtestMode'], true]
    ];
    var OPT_CFG_KEY = '__optCfgV71', OPT_VER_KEY = '__optCfgV71_v', RF_AUTO_KEY71 = '__optRiskFreeAutoV71';
    var CACHE_AFFECTING_KEYS71 = {
        basePrices:1, baseVol:1, contractSizes:1, dividendCalendar:1, riskFreeCurve:1, depthWeights:1,
        baseInsCodes:1, riskFree:1, useWeightedDepth:1, useEwma:1, ewmaLambda:1, ihNewestFirst:1,
        adxPeriod:1, ivAtmBand:1, ivHistDays:1, ivRankBuy:1, ivRankSell:1, minDaysLeft:1,
        minDteWeight:1, volFloor:1, volCeil:1, unitGuardX:1, maxTimeValuePct:1, maxIvPremium:1,
        maxLeverage:1, maxCostRT:1, contractSize:1, supportTabeii:1, tabeiiDiscount:1,
        multiExpiry:1, holdDays:1, view:1, viewDailyPct:1, riskFreeAutoFetch:1, riskFreeFetchUrl:1,
        dividendAutoFetch:1, dividendFetchUrl:1, dividendMaxDays:1, autoView:1, autoViewWeight:1,
        useLiveBase:1, liveBaseMaxAge:1,
        minExpRet:1, erGridStep:1, strictContractSize:1, maxPerExpiry:1, distantDays:1, maxTotalRows:1,
        useScore:1, scoreMin:1, useIvRank:1, useAdx:1,
        wER:1, wIVR:1, wADX:1, wLiq:1, wEdge:1,
        poolDays:1, poolAuto:1, poolGates:1, poolClamp:1, poolGateClamp:1, poolMinObs:1, poolMinGateObs:1, poolPreGateEveryScan:1,
        backtestMode:1, backtestDate:1
    };
    var POOL_AFFECTING_KEYS71 = {
        poolDays:1, poolAuto:1, poolGates:1, poolClamp:1, poolGateClamp:1, poolMinObs:1, poolMinGateObs:1, poolPreGateEveryScan:1
    };

    (function migrate71() {
        try {
            var STm = optStore(); if (!STm) return;
            var legacy71 = null;
            try { legacy71 = store(); } catch (eL71) { legacy71 = null; }
            var bridge71 = function (key71, verKey71) {
                try {
                    if (!legacy71 || STm.get(key71) != null) return;
                    var lv71 = legacy71.getItem(key71);
                    if (lv71 == null) return;
                    STm.set(key71, lv71);
                    var lvv71 = legacy71.getItem(verKey71);
                    if (lvv71 != null) STm.set(verKey71, lvv71);
                } catch (eB71) {}
            };
            bridge71('__optCfgV71', '__optCfgV71_v');
            bridge71('__optRankV71', '__optRankV71_v');
            bridge71('__optWeekV71', '__optWeekV71_v');
            bridge71('__optCfgV7', '__optCfgV7_v');
            bridge71('__optRankV3', '__optRankV3_v');
            bridge71('__optWeekV1', '__optWeekV1_v');
            var raw = STm.get('__optCfgV7');
            if (STm.get('__optCfgV71') == null && raw) {
                var pm = null;
                try { pm = JSON.parse(raw); } catch (eM1) { pm = null; }
                if (pm && (Object.prototype.hasOwnProperty.call(pm, 'backtestMode') || Object.prototype.hasOwnProperty.call(pm, 'positionSizing') ||
                           Object.prototype.hasOwnProperty.call(pm, 'tabeiiDiscount') || Object.prototype.hasOwnProperty.call(pm, 'ewmaLambda'))) {
                    STm.set('__optCfgV71', raw);
                    var vm71 = STm.get('__optCfgV7_v');
                    if (vm71 !== null && vm71 !== undefined) STm.set('__optCfgV71_v', vm71);
                }
            }
            if (STm.get('__optRankV71') == null && STm.get('__optRankV3') != null) {
                STm.set('__optRankV71', STm.get('__optRankV3'));
                var vr3 = STm.get('__optRankV3_v');
                if (vr3 !== null && vr3 !== undefined) STm.set('__optRankV71_v', vr3);
            }
            if (STm.get('__optWeekV71') == null && STm.get('__optWeekV1') != null) {
                STm.set('__optWeekV71', STm.get('__optWeekV1'));
                var vw1 = STm.get('__optWeekV1_v');
                if (vw1 !== null && vw1 !== undefined) STm.set('__optWeekV71_v', vw1);
            }
        } catch (eM) {}
    })();

    var __optStoreCache71 = null, __optStoreTried71 = false;
    function optStore() {
        if (__optStoreTried71) return __optStoreCache71;
        __optStoreTried71 = true;
        var out71 = null;
        try {
            if (typeof localStorage !== 'undefined' && localStorage && localStorage.setItem) {
                localStorage.setItem('__opt71Probe', '1');
                if (localStorage.getItem('__opt71Probe') === '1') {
                    localStorage.removeItem('__opt71Probe');
                    out71 = {
                        get: function (key) { return localStorage.getItem(key); },
                        set: function (key, val) { localStorage.setItem(key, val); },
                        del: function (key) { localStorage.removeItem(key); }
                    };
                }
            }
        } catch (e) {}
        if (!out71) try {
            if (typeof window !== 'undefined' && window) {
                out71 = {
                    get: function (key) { return window[key]; },
                    set: function (key, val) { window[key] = val; },
                    del: function (key) { try { delete window[key]; } catch (e) { window[key] = undefined; } }
                };
            }
        } catch (e) {}
        __optStoreCache71 = out71;
        return __optStoreCache71;
    }

    // v9.2: یک backend برای مهاجرت و رتبه‌بندی؛ قبلاً rank از window و migration از localStorage می‌خواند.
    function rankStore() {
        var st = optStore();
        if (st) return {
            getItem: function (key) { return st.get(key); },
            setItem: function (key, val) { st.set(key, val); },
            removeItem: function (key) { st.del(key); }
        };
        return store();
    }

    function optOverrides() {
        var ST = optStore();
        if (!ST) return null;
        var ver = -1;
        try { ver = parseInt(ST.get(OPT_VER_KEY), 10); } catch (e) {}
        if (!(ver >= 0)) return null;                  // بدون مهرِ نسخه → بدون override
        var RC = null;
        try { if (typeof window !== 'undefined' && window) RC = window.__opt71Cfg; } catch (e) {}
        if (RC && RC.ver === ver) return RC;
        var ov = {}, raw = null, parsed = null;
        try { raw = ST.get(OPT_CFG_KEY); } catch (e) {}
        if (raw) { try { parsed = JSON.parse(raw); } catch (e) { parsed = null; } }
        if (parsed) {
            for (var idx = 0; idx < OPT_KEYS.length; idx++) {
                var key = OPT_KEYS[idx][0];
                if (!Object.prototype.hasOwnProperty.call(parsed, key)) continue;
                var val = parsed[key], typ = typeof CONFIG[key];
                if ((typ === 'number' && typeof val === 'number' && isFinite(val)) ||
                    (typ === 'boolean' && typeof val === 'boolean')) ov[key] = val;
                else if (OPT_KEYS[idx][2] === 'str') {
                    if (typeof val === 'string' && val.length <= 24) ov[key] = val;   // v6: expiryDate
                }
                else if (OPT_KEYS[idx][2] === 'url') {
                    if (typeof val === 'string' && val.length <= 300 && /^(?:https?:\/\/|\/)[^<>\s]+$/.test(val)) ov[key] = val;
                }
                else if (OPT_KEYS[idx][2] === 'obj') {
                    var dv = (key === 'baseInsCodes') ? wgValidInsCodes(val) : wgValidDict(val);
                    if (dv) ov[key] = dv;
                }
                else if (OPT_KEYS[idx][2] === 'days') {
                    var dvDays = wgValidDays(val);
                    if (dvDays) ov[key] = dvDays;
                }
                else if (OPT_KEYS[idx][2] === 'hol') {
                    var dvHol = wgValidHolidays71(val);
                    if (dvHol) ov[key] = dvHol;
                }
                else if (OPT_KEYS[idx][2] === 'arr') {   // v7 — آرایه‌ها
                    var av = wgValidArr(val);
                    if (av) ov[key] = av;
                }
                else if (OPT_KEYS[idx][2] === 'cal') {   // v7 — تقویمِ سود
                    var cv = wgValidCal(val);
                    if (cv) ov[key] = cv;
                }
            }
        }
        RC = { ver: ver, ov: ov };
        try { if (typeof window !== 'undefined' && window) window.__opt71Cfg = RC; } catch (e) {}
        return RC;
    }

    function applyOverrides(CFG) {
        var _tAO0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        try {                                          // پیش‌فرض‌های دست‌نخورده، یک بار
            if (typeof window !== 'undefined' && window && (!window.__opt71Def || window.__opt71BV !== VERSION_TAG)) {   // v9.0.2: DEF-ye ghadimi (nosxe-ye qadim) Bazsazi
                var def = {};
                for (var idx = 0; idx < OPT_KEYS.length; idx++) def[OPT_KEYS[idx][0]] = cloneConfigValue71(CFG[OPT_KEYS[idx][0]]);
                window.__opt71Def = def;
            }
        } catch (e) {}
        var res = optOverrides();
        if (!res || !res.ov) { try { benchNote71('init.applyOverrides', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tAO0 : 0), 1); } catch(e){} return; }
        for (var k2 in res.ov) if (Object.prototype.hasOwnProperty.call(res.ov, k2)) CFG[k2] = res.ov[k2];
        try { benchNote71('init.applyOverrides', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tAO0 : 0), 1); } catch(e){}
    }

    var __expMemo = null;
    var __rowReMemo71 = null;
    function rowExpRe71(jy, jm) {
        try {
            var k71 = jy + '|' + jm;
            if (__rowReMemo71 && __rowReMemo71.src === k71) return __rowReMemo71.re;
            var r71 = new RegExp(jy + '\\s*[\\/.\\-]\\s*' + (jm < 10 ? '0?' + jm : String(jm)) + '(?!\\d)');
            __rowReMemo71 = { src: k71, re: r71 };
            return r71;
        } catch (e) { return EXPIRY_RE; }
    }                       // کشِ نتیجهٔ پارس (هر ردیف CFG تازه است)
    function resolveExpiry(CFG) {
        try {
            var s = norm(String(CFG.expiryDate == null ? '' : CFG.expiryDate)).replace(/\s+/g, '');
            if (!__expMemo || __expMemo.src !== s) {
                var m = s.match(/^(\d{3,4})[\/.\-](\d{1,2})(?:[\/.\-](\d{1,2}))?$/);
                if (!m) { __expMemo = { src: s, bad: true }; return false; }
                var jy = +m[1], jm = +m[2], jd = m[3] ? +m[3] : 30;   // v7.1: بدونِ روز → ۳۰
                if (!isValidJDate(jy, jm, jd)) {
                    __expMemo = { src: s, bad: true }; return false;
                }
                __expMemo = { src: s, jy: jy, jm: jm, jd: jd,
                              re: jy + '\\s*[\\/.\\-]\\s*' + (jm < 10 ? '0?' + jm : String(jm)) + '(?!\\d)' };
            }
            var mo = __expMemo;
            if (mo.bad) return false;
            CFG.expiryJY = mo.jy; CFG.expiryJM = mo.jm; CFG.expiryJD = mo.jd;
            CFG.expiry = mo.re;
            return true;
        } catch (e) { return false; }
    }
    var __marketHolidayJdn71 = Object.create(null);
    function applyDerived(CFG) {
        var _tAD0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        try {
            CFG.erGridStep = Math.max(0.1, Math.min(1.0, +CFG.erGridStep || 0.25));
        } catch (eGrid71) { CFG.erGridStep = 0.25; }
        try {
            var d = Math.round(+CFG.poolDays);
            if (!(d > 0)) d = 14;
            CFG.poolDays = Math.min(30, Math.max(7, d));
        } catch (e) { CFG.poolDays = 14; }
        try {
            var sd71 = wgValidDays(CFG.sessionDays);
            CFG.sessionDays = sd71 || [0,1,2,3,4,6];
            var mh71 = wgValidHolidays71(CFG.marketHolidays);
            CFG.marketHolidays = mh71 || [];
            __marketHolidayJdn71 = Object.create(null);
            var hi71, hp71;
            for (hi71 = 0; hi71 < CFG.marketHolidays.length; hi71++) {
                hp71 = CFG.marketHolidays[hi71].split('/');
                __marketHolidayJdn71[String(j2d(+hp71[0], +hp71[1], +hp71[2]))] = true;
            }
        } catch (e) {
            CFG.sessionDays = [0,1,2,3,4,6];
            CFG.marketHolidays = [];
            __marketHolidayJdn71 = Object.create(null);
        }
        try {
            if (typeof window !== 'undefined' && window) {
                window.__opt71PoolEpoch = String(CFG.poolDays);
                window.__opt71AbortThreshold = (CFG.abortThreshold >= 0) ? CFG.abortThreshold : 10;
                // scan timing for proportional info
                try {
                    if (!window.__opt71ScanStart) window.__opt71ScanStart = Date.now();
                    window.__opt71TotalScanned = (window.__opt71TotalScanned || 0) + 1;
                } catch(e){}
            }
        } catch (e) {}
        if (!resolveExpiry(CFG)) {                 // تاریخِ نامعتبر → پیش‌فرضِ اسکریپت
            CFG.expiryDate = '1405/07/30';
            resolveExpiry(CFG);
        }
        try {
            if (typeof window !== 'undefined' && window) {
                var ep = CFG.expiryJY * 10000 + CFG.expiryJM * 100 + CFG.expiryJD;   // v9.0.2: ebtools-e cache faqhat baraye taghir-e expiry; safir-e digar ba TTL/ceyle serv mishavad (amdi)
                if (!CFG.multiExpiry && window.__opt71ExpEpoch !== ep) {   // v9.0.2: dar chand-sarresidi ebtools kash bimoor
                    window.__opt71ExpEpoch = ep;
                    var RT = runtime();
                    if (RT && RT.cache) { RT.cache = {}; RT.n = 0; }
                }
            }
        } catch (e) {}
        try { benchNote71('init.applyDerived', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tAD0 : 0), 1); } catch(e){}
    }

    function uiStatus(RT) {
        try {
            if (typeof window === 'undefined' || !window || !window.__opt71StatusEl) return;
            var stamp = Date.now();
            var hasInputNotice = !!(window.__opt71InputNotice || window.__opt71HistNotice);
            // Throttle but bypass when inputNotice appears
            if (window.__opt71StatT && stamp - window.__opt71StatT < 500 && !hasInputNotice) return;
            window.__opt71StatT = stamp;
            var rejTxt = '', LL = LOG();
            if (LL && CONFIG.logReasons) {
                var rk = [], rr2;
                for (rr2 in LL.rejected) if (Object.prototype.hasOwnProperty.call(LL.rejected, rr2)) rk.push([rr2, LL.rejected[rr2]]);
                rk.sort(function (a2, b2) { return b2[1] - a2[1]; });
                var t3 = rk.slice(0, 3).map(function (x2) { return x2[0] + '=' + x2[1]; }).join('،');
                if (t3) rejTxt = ' · رد: ' + t3;
            }
            var rb71 = '';
            try {
                var RC71s = window.__opt71Db, db71s = RC71s && RC71s.db, n71s = 0, k71s, j71s;
                if (db71s && db71s.g) for (k71s in db71s.g) if (Object.prototype.hasOwnProperty.call(db71s.g, k71s)) for (j71s in db71s.g[k71s]) if (Object.prototype.hasOwnProperty.call(db71s.g[k71s], j71s)) n71s++;
                if (n71s > 0) rb71 = ' · کاندید: ' + n71s + (CONFIG.maxTotalRows > 0 ? ' · سقفِ کل: ' + CONFIG.maxTotalRows : '');
            } catch (eR71) {}
            var noticePart = (window.__opt71InputNotice || window.__opt71HistNotice) ? ' · ' + (window.__opt71InputNotice || window.__opt71HistNotice) : '';
            window.__opt71StatusEl.textContent =
                'محاسبهٔ سنگین: ' + (RT.computes || 0) +
                ' · برخوردِ کش: ' + (RT.hits || 0) +
                ' · رکوردِ کش: ' + (RT.n || 0) +
                ' · مسیرِ سریع: ' + (RT.fast ? 'روشن (!)' : 'خاموش') +
                ' · بازار: ' + (inSession(new Date(btNow())) ? "باز" : "بسته") + rejTxt + rb71 + ' · نمایش: ' + ((LL && LL.passed) || 0) + noticePart;
            // Highlight status element when inputNotice present
            try {
                if (hasInputNotice) {
                    window.__opt71StatusEl.style.background = '#5a1f2a';
                    window.__opt71StatusEl.style.color = '#ffd7d7';
                    window.__opt71StatusEl.style.border = '1px solid #ff6b6b';
                    window.__opt71StatusEl.style.borderRadius = '6px';
                    window.__opt71StatusEl.style.padding = '6px 8px';
                    window.__opt71StatusEl.style.whiteSpace = 'pre-wrap';
                } else {
                    window.__opt71StatusEl.style.background = '';
                    window.__opt71StatusEl.style.color = '';
                    window.__opt71StatusEl.style.border = '';
                    window.__opt71StatusEl.style.padding = '';
                }
            } catch(eStyle){}
        } catch (e) {}
    }



    function optHelpers() {
        try {
            if (typeof window === 'undefined' || !window) return;
            if (window.__opt71BV === VERSION_TAG && window.optSet) return;   // v9.0.2: nosxe-ye ghadim → dobare-sazi
            window.optCfg = function () {
                var out = {}, res = optOverrides(), DEF = window.__opt71Def || {};
                for (var idx = 0; idx < OPT_KEYS.length; idx++) {
                    var key = OPT_KEYS[idx][0];
                    var outVal = (res && res.ov && Object.prototype.hasOwnProperty.call(res.ov, key)) ? res.ov[key] : DEF[key];
                    out[key] = cloneConfigValue71(outVal);
                }
                return out;
            };
            window.optSortHelp = function () {   // v9.0.3: راهنمای مرتب‌سازی
                return 'مرتب‌سازی در TSETMC: روی ستونِ cfield0 مرتب‌سازی نزولی بزنید — cfield0 = امتیاز (c0Mode=score) یا بازده (c0Mode=er). برای سقفِ کل، maxTotalRows را ببینید — در دورِ اول (warm) تا ۱٫۵ برابرِ سقف ممکن است موقتاً نمایش داده شود. tie-break فقط در حالتِ score اعمال می‌شود؛ در حالتِ er، cfield0 دقیقاً بازده است.';
            };
            window.optTop = function (n71) {   // v9.0.3: آستانهٔ معادلِ top-N
                try {
                    var RC71 = (typeof window !== 'undefined' && window) ? window.__opt71Db : null;
                    var db71t = RC71 && RC71.db ? RC71.db : null;
                    if (!db71t || !db71t.g) return 'داده‌ای نیست — بعد از یک دورِ کاملِ رفرش';
                    var vals71 = [], g71t, s71t;
                    for (g71t in db71t.g) if (Object.prototype.hasOwnProperty.call(db71t.g, g71t)) for (s71t in db71t.g[g71t]) if (Object.prototype.hasOwnProperty.call(db71t.g[g71t], s71t) && db71t.g[g71t][s71t] && typeof db71t.g[g71t][s71t].r === 'number') vals71.push(db71t.g[g71t][s71t].r);
                    if (!vals71.length) return 'داده‌ای نیست';
                    vals71.sort(function (a71, b71) { return b71 - a71; });
                    n71 = (+n71 > 0) ? +n71 : 10;
                    var th71 = vals71[Math.min(n71, vals71.length) - 1];
                    return 'top' + Math.min(n71, vals71.length) + ' از ' + vals71.length + ' | آستانهٔ ER≈' + (th71 !== undefined ? th71.toFixed(1) : '-') + '٪';
                } catch (e71t) { return 'خطا: ' + e71t; }
            };
            window.optIvReset = function () {   // v9.0.1: پاک‌کردنِ poolهای مخلوطِ تاریخچهٔ IV (atm حفظ می‌شود)
                try {
                    var db71 = ivDb71();
                    if (!db71) return 'دسترسی به IV DB نیست';
                    var n71 = 0, k71;
                    for (k71 in db71) if (Object.prototype.hasOwnProperty.call(db71, k71) && k71.indexOf('@atm') < 0) { delete db71[k71]; n71++; }
                    ivDirtySet71(true); ivFlush71(true);
                    return 'پاک شد: ' + n71 + ' poolِ مخلوط';
                } catch (e71) { return 'خطا: ' + e71; }
            };
            window.optSet = function (key, val) {
                var ST = optStore();
                if (!ST) return 'حافظه در دسترس نیست';
                var DEF = window.__opt71Def;
                if (!DEF || !Object.prototype.hasOwnProperty.call(DEF, key)) return 'کلیدِ ناشناخته: ' + key;
                if (typeof val !== typeof DEF[key] || (typeof val === 'number' && !isFinite(val))) {
                    return 'نوعِ نادرست — باید ' + typeof DEF[key] + ' باشد';
                }
                if (key === 'expiryDate' && !resolveExpiry({ expiryDate: val })) {
                    return 'تاریخِ نامعتبر — قالب: 1405/07/07';
                }
                if (key === 'poolDays' && !(+val >= 7 && +val <= 30)) {
                    return 'poolDays باید بین ۷ و ۳۰ روز باشد';
                }
                if ((key === 'dividendFetchUrl' || key === 'riskFreeFetchUrl') &&
                    !(typeof val === 'string' && val.length <= 300 && /^(?:https?:\/\/|\/)[^<>\s]+$/.test(val))) {
                    return 'نشانی باید هم‌مبدأ یا با http/https و بدون فاصله باشد';
                }
                if (key === 'ivAtmBand' && !(+val >= 0 && +val <= 20)) {
                    return 'ivAtmBand باید بین ۰ و ۲۰ باشد';
                }
                if (key === 'ivRankSell' && !(+val > +CONFIG.ivRankBuy)) {
                    return 'ivRankSell باید بزرگ‌تر از ivRankBuy باشد';
                }
                if (key === 'ivRankBuy' && !(+val < +CONFIG.ivRankSell)) {
                    return 'ivRankBuy باید کوچک‌تر از ivRankSell باشد';
                }
                if (key === 'maxPerExpiry' && !(+val >= 0 && +val <= 50)) {
                    return 'maxPerExpiry باید بین ۰ و ۵۰ باشد';
                }
                if (key === 'distantDays' && !(+val >= 0 && +val <= 400)) {
                    return 'distantDays باید بین ۰ و ۴۰۰ روز باشد';
                }
                if (key === 'maxTotalRows' && !(+val >= 0 && +val <= 200)) {
                    return 'maxTotalRows باید بین ۰ و ۲۰۰ باشد';
                }
                if (key === 'poolObsFromMin' && !(+val >= 0 && +val <= 1200)) {
                    return 'poolObsFromMin باید بین ۰ و ۱۲۰۰ (دقیقه) باشد';
                }
                if (key === 'abortThreshold' && !(+val >= 0 && +val <= 200)) {
                    return 'abortThreshold باید بین ۰ (خاموش) و ۲۰۰ باشد';
                }
                if (/^w(ER|IVR|ADX|Liq|Edge)$/.test(key) && !(+val >= 0)) {
                    return 'وزن‌ها باید ≥ ۰ باشند';
                }
                if (typeof val === 'object' && val !== null) {
                    var tag = null, ti;
                    for (ti = 0; ti < OPT_KEYS.length; ti++) if (OPT_KEYS[ti][0] === key) { tag = OPT_KEYS[ti][2]; break; }
                    if (tag === 'days') {
                        val = wgValidDays(val);
                        if (!val) return 'sessionDays نامعتبر — آرایه‌ای از اعداد صحیح ۰ تا ۶ (خالی مجاز نیست)';
                    } else if (key === 'backtestDate') {
                        if (val === '' || val == null) { /* allow empty to disable */ }
                        else {
                            var isoChk = (typeof wgValidIsoDate71 === 'function') ? wgValidIsoDate71(val) : null;
                            if (!isoChk) return 'backtestDate نامعتبر — فرمت باید YYYY-MM-DD (مثال 2026-09-01) و سال بین 2000-2100';
                            val = isoChk;
                        }
                    } else if (tag === 'hol') {
                        val = wgValidHolidays71(val);
                        if (!val) return 'marketHolidays نامعتبر — آرایه‌ای از تاریخ‌های جلالی مثل 1405/01/02';
                    } else if (tag === 'arr') {
                        val = wgValidArr(val);
                        if (!val) return 'آرایهٔ نامعتبر — [عدد] یا [[عدد,…],…]';
                    } else if (tag === 'cal') {
                        val = wgValidCal(val);
                        if (!val) return 'تقویمِ نامعتبر — {نماد: [[سال,ماه,روز,مبلغ],…]}';
                    } else if (key === 'baseInsCodes') {
                        val = wgValidInsCodes(val);
                        if (!val) return 'کدهای پایه نامعتبر — {نامِ نماد: رشتهٔ کدِ TSETMC}';
                    } else {
                        val = wgValidDict(val);
                        if (!val) return 'شیءِ نامعتبر — فقط {نامِ نماد: عددِ مثبت}';
                    }
                }
                var ov = {}, raw = null, parsed = null;
                try { raw = ST.get(OPT_CFG_KEY); } catch (e) {}
                if (raw) { try { parsed = JSON.parse(raw); } catch (e) { parsed = null; } }
                if (parsed) { for (var k2 in parsed) if (Object.prototype.hasOwnProperty.call(parsed, k2)) ov[k2] = parsed[k2]; }
                ov[key] = val;
                var ver = parseInt(ST.get(OPT_VER_KEY), 10);
                if (!(ver >= 0)) ver = 0;
                ST.set(OPT_CFG_KEY, JSON.stringify(ov));
                ST.set(OPT_VER_KEY, String(ver + 1));
                window.__opt71Cfg = null;
                try {
                    if (CACHE_AFFECTING_KEYS71[key]) {
                        var RT71 = runtime();
                        if (RT71 && RT71.cache) { RT71.cache = {}; RT71.n = 0; RT71.fast = false; }
                        bumpModelEpoch();
                    }
                    if (typeof POOL_AFFECTING_KEYS71 !== 'undefined' && POOL_AFFECTING_KEYS71[key]) {
                        try {
                            if (typeof window !== 'undefined' && window) {
                                window.__opt71WDCache = null;
                                if (window.__opt71Wk) window.__opt71Wk.__opt71WDCache = null;
                            }
                        } catch(ePool1){}
                        try {
                            if (typeof WG !== 'undefined' && WG) {
                                WG.gatesCache = null;
                                WG.gatesDone = 0;
                                WG.gatesAt = 0;
                                WG.gatesApplied = {};
                                WG.applied = {};
                                WG.appliedN = 0;
                                // v9.6.0.7: refresh userKeys so manual overrides are not ignored
                                try {
                                    var ro2 = (typeof optOverrides === 'function') ? optOverrides() : null;
                                    var uk2 = {};
                                    if (ro2 && ro2.ov) for (var kk in ro2.ov) if (Object.prototype.hasOwnProperty.call(ro2.ov, kk)) uk2[kk] = true;
                                    WG.userKeys = uk2;
                                } catch(eUK){}
                            }
                        } catch(ePool2){}
                    }
                } catch (eCache71) {}
                try { if (window.__opt71PopRows) window.__opt71PopRows.length = 0; window.__opt71PopReady = false; } catch (ePC72) {}
                return '✔ ' + key + ' = ' + (typeof val === 'object' && val !== null ? JSON.stringify(val) : val) +
                       ' (نسخهٔ ' + (ver + 1) + ')';
            };
            window.optLog = function () {           // v7 — گزارشِ دلایلِ رد
                var L = LOG(), top = [], rr;
                if (!L) return 'لاگ در دسترس نیست';
                for (rr in L.rejected) if (Object.prototype.hasOwnProperty.call(L.rejected, rr)) top.push([rr, L.rejected[rr]]);
                top.sort(function (a, b) { return b[1] - a[1]; });
                return { passed: L.passed, rejectedTotal: top.reduce(function (ac, x) { return ac + x[1]; }, 0),
                         top: top.slice(0, 8) };
            };
            window.optLogReset = function () {
                var L = LOG(); if (L) { L.rejected = {}; L.passed = 0; }
                return '✔ لاگ پاک شد';
            };
            window.optInputLog = function () {
                try {
                    return {
                        notice: (typeof window !== 'undefined' && window) ? window.__opt71InputNotice : '',
                        missing: (typeof window !== 'undefined' && window) ? window.__opt71InputMissing : {},
                        histNotice: (typeof window !== 'undefined' && window) ? window.__opt71HistNotice : ''
                    };
                } catch(e){ return null; }
            };
            window.optClearInputNotice = function () {
                try {
                    if (typeof window !== 'undefined' && window) {
                        window.__opt71InputNotice = '';
                        window.__opt71HistNotice = '';
                        window.__opt71InputMissing = {};
                        window.__opt71HistMissing = {};
                        window.__opt71InputFailStreak = 0;
                        window.__opt71InputFailTotal = 0;
                    }
                    clearInputBanner71();
                    return '✔ پیام دادهٔ ناقص پاک شد';
                } catch(e){ return 'خطا: ' + e; }
            };
            window.optAbort = function () {
                try {
                    if (typeof window !== 'undefined' && window) window.__opt71Abort = true;
                    ensureInputBanner71('⛔ توقف توسط کاربر فعال شد. اجرای نمادهای بعدی متوقف می‌شود. برای ادامه optClearAbort() را اجرا کنید.');
                    return '✔ توقف فعال شد';
                } catch(e){ return 'خطا: ' + e; }
            };
            window.optClearAbort = function () {
                try {
                    if (typeof window !== 'undefined' && window) {
                        window.__opt71Abort = false;
                        window.__opt71InputFailStreak = 0;
                    }
                    clearInputBanner71();
                    return '✔ توقف پاک شد — ادامه فعال';
                } catch(e){ return 'خطا: ' + e; }
            };
            window.optFieldHelp = function(){
                try {
                    var NL = String.fromCharCode(10);
                    var out = 'راهنمای فیلدهای TSETMC:' + NL;
                    for (var k in TSETMC_FIELDS71) if (TSETMC_FIELDS71.hasOwnProperty(k)) {
                        out += '  ' + k + ' → ' + TSETMC_FIELDS71[k].label + (TSETMC_FIELDS71[k].hint ? ' — ' + TSETMC_FIELDS71[k].hint : '') + NL;
                    }
                    out += NL + 'برای ادامه پس از توقف: optClearAbort()' + NL + 'برای توقف دستی: optAbort()';
                    console.log(out);
                    return out;
                } catch(e){ return 'help unavailable'; }
            };
            window.optPipeline = function(){ try { return pipelineData71(); } catch(e){ return null; } };
            window.optPipelineOpen = function(){ try { pipelineOpen71(); return true; } catch(e){ return false; } };
            window.optPipelineRender = function(){ try { pipelineRender71(); return true; } catch(e){ return false; } };
            window.optAnalyzeLog = function(){ try { return analyzeRealLog71(); } catch(e){ return null; } };
            window.optResetScanStats = function(){
                try {
                    if (typeof window !== 'undefined' && window) {
                        window.__opt71ScanStart = Date.now();
                        window.__opt71TotalScanned = 0;
                        window.__opt71InputFailStreak = 0;
                        window.__opt71InputFailTotal = 0;
                    }
                    return true;
                } catch(e){ return false; }
            };
            window.optAbortStatus = function () {
                try {
                    var W = (typeof window !== 'undefined' && window) ? window : null;
                    if (!W) return null;
                    return {
                        aborted: !!W.__opt71Abort,
                        streak: W.__opt71InputFailStreak || 0,
                        total: W.__opt71InputFailTotal || 0,
                        threshold: (W.__opt71AbortThreshold >= 0 ? W.__opt71AbortThreshold : 10)
                    };
                } catch(e){ return null; }
            };
            window.optDiv = function () {           // v7 — تقویمِ سودِ مؤثر
                try { return JSON.parse(JSON.stringify(CONFIG.dividendCalendar || {})); } catch (e) { return {}; }
            };
            window.optDivAdd = function (sym, jy, jm, jd, amt) {   // v7 — ورودِ سریعِ سود
                var cal = CONFIG.dividendCalendar || {};
                var arr = cal[sym] || (cal[sym] = []);
                arr.push([+jy, +jm, +jd, +amt]);
                var msg = optSet('dividendCalendar', cal);
                return '✔ ' + sym + ': سودِ ' + amt + ' در ' + jy + '/' + jm + '/' + jd + ' — ' + msg;
            };
            window.optReset = function () {
                var ST = optStore();
                if (!ST) return 'حافظه در دسترس نیست';
                ST.del(OPT_CFG_KEY);
                ST.del(OPT_VER_KEY);
                try { window.__opt71Cfg = null; if (window.__opt71PopRows) window.__opt71PopRows.length = 0; window.__opt71PopReady = false; } catch (e) {}
                return '✔ همهٔ کلیدها به پیش‌فرض برگشتند';
            };
        } catch (e) {}
    }


    // ═══════════════════════════════════════════════════════════════
    //  استخرسنج (v6) — «مقادیرِ پنجرهٔ N روزهٔ گذشته» به‌جای جدول‌های دستی + گیت‌های «بهینه»
    // ═══════════════════════════════════════════════════════════════
    var WG_KEY = '__optWeekV71', WG_VER_KEY = '__optWeekV71_v',
        // Bump RANK_SCHEMA71 whenever the persisted db.g record shape changes; v9.5.3 keeps the v921 shape.
        RANK_SCHEMA71 = 'v921';
    var WG = null;      // حالتِ مشترک: { idx, weeks, pairs, applied, userKeys, staticP, staticV, ... }
    // v9.5.3: warning visibility is state-based, not a 2-second repeated toast.
    var __wgPoolWarningState71 = 'init', __wgPoolWarningViewState71 = '', __wgPoolWarningViewSince71 = 0;
    var WG_RESET_NOTICE_MS71 = 5000; // keep the explicit reset confirmation visible before the data warning resumes
    var WG_GATES = [
        ['maxSpread',    'اسپرد (٪)'],
        ['maxCostRT',    'هزینهٔ ر/ب (٪)'],
        ['maxIvPremium', 'صرفِ IV'],
        ['volFloor',     'کفِ نوسان (٪)'],
        ['volCeil',      'سقفِ نوسان (٪)'],
        ['minTno',       'حداقلِ معامله'],
        ['minTvol',      'حداقلِ حجم'],
        ['maxLeverage',  'سقفِ اهرم']
    ];

    function wgValidDict(val) {
        try {
            if (!val || typeof val !== 'object' || Object.prototype.toString.call(val) !== '[object Object]') return null;
            var out = {}, cnt = 0, kv;
            for (kv in val) {
                if (!Object.prototype.hasOwnProperty.call(val, kv)) continue;
                if (++cnt > 200) return null;
                var nv = val[kv];
                if (typeof nv !== 'number' || !isFinite(nv) || !(nv > 0)) return null;
                if (!kv || String(kv).length > 40 || kv === '__proto__' || kv === 'prototype' || kv === 'constructor') return null;
                out[String(kv)] = nv;
            }
            return out;
        } catch (e) { return null; }
    }
    function wgValidInsCodes(val) {
        try {
            if (!val || typeof val !== 'object' || Object.prototype.toString.call(val) !== '[object Object]') return null;
            var out = {}, cnt = 0, kv, code;
            for (kv in val) {
                if (!Object.prototype.hasOwnProperty.call(val, kv)) continue;
                if (++cnt > 200) return null;
                if (typeof val[kv] !== 'string') return null;
                code = val[kv].replace(/^\s+|\s+$/g, '');
                // کد را string نگه می‌داریم؛ تبدیل به Number موجب از دست رفتن precision می‌شود.
                if (!kv || String(kv).length > 40 || kv === '__proto__' || kv === 'prototype' || kv === 'constructor' || !/^\d{8,24}$/.test(code)) return null;
                out[String(kv)] = code;
            }
            return out;
        } catch (e) { return null; }
    }
    function wgValidIsoDate71(s){
        try {
            if (typeof s !== 'string') return null;
            var t = s.trim();
            if (!t) return null;
            // Must be YYYY-MM-DD
            var m = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!m) return null;
            var y = +m[1], mo = +m[2], d = +m[3];
            if (y < 2000 || y > 2100) return null;
            if (mo < 1 || mo > 12) return null;
            if (d < 1 || d > 31) return null;
            var dt = new Date(t + 'T12:00:00Z');
            if (isNaN(dt.getTime())) return null;
            // Verify round-trip
            if (dt.getUTCFullYear() !== y || dt.getUTCMonth()+1 !== mo || dt.getUTCDate() !== d) return null;
            return t;
        } catch(e){ return null; }
    }
    function wgValidDays(val) {
        try {
            if (!Array.isArray(val) || val.length === 0 || val.length > 7) return null;
            var out = [], seen = {}, i, d;
            for (i = 0; i < val.length; i++) {
                d = val[i];
                if (typeof d !== 'number' || !isFinite(d) || Math.floor(d) !== d || d < 0 || d > 6) return null;
                if (!seen[d]) { seen[d] = true; out.push(d); }
            }
            return out;
        } catch (e) { return null; }
    }
    function holidayKey71(val) {
        try {
            var t = norm(String(val == null ? '' : val)).replace(/\s+/g, '').replace(/[.\-]/g, '/');
            var m = t.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
            if (!m || !isValidJDate(+m[1], +m[2], +m[3])) return '';
            return m[1] + '/' + ('0' + m[2]).slice(-2) + '/' + ('0' + m[3]).slice(-2);
        } catch (e) { return ''; }
    }
    function wgValidHolidays71(val) {
        try {
            if (!Array.isArray(val) || val.length > 366) return null;
            var out = [], seen = {}, i, k;
            for (i = 0; i < val.length; i++) {
                if (typeof val[i] !== 'string') return null;
                k = holidayKey71(val[i]);
                if (!k) return null;
                if (!seen[k]) { seen[k] = true; out.push(k); }
            }
            return out;
        } catch (e) { return null; }
    }
    function parseDaysInput71(raw) {
        try {
            var t = norm(String(raw == null ? '' : raw)).replace(/^\s+|\s+$/g, '');
            if (!t) return null;
            var ps = t.split(/[,\u060C;\u061B|\s]+/), out = [], i;
            for (i = 0; i < ps.length; i++) {
                if (!/^\d+$/.test(ps[i])) return null;
                out.push(+ps[i]);
            }
            return wgValidDays(out);
        } catch (e) { return null; }
    }
    function parseHolidaysInput71(raw) {
        try {
            var t = norm(String(raw == null ? '' : raw)).replace(/^\s+|\s+$/g, '');
            if (!t) return [];
            var ps = t.split(/[,\u060C;\u061B|]+/), out = [], i;
            for (i = 0; i < ps.length; i++) {
                ps[i] = ps[i].replace(/^\s+|\s+$/g, '');
                if (!ps[i]) return null;
                out.push(ps[i]);
            }
            return wgValidHolidays71(out);
        } catch (e) { return null; }
    }
    function wgValidArr(val) {
        try {
            if (!Array.isArray(val) || val.length > 60) return null;
            var i, j, it;
            for (i = 0; i < val.length; i++) {
                it = val[i];
                if (typeof it === 'number' && isFinite(it)) continue;
                if (!Array.isArray(it) || it.length > 10) return null;
                for (j = 0; j < it.length; j++) if (typeof it[j] !== 'number' || !isFinite(it[j])) return null;
            }
            return val;
        } catch (e) { return null; }
    }
    function wgValidCal(val) {
        try {
            if (!val || typeof val !== 'object' || Object.prototype.toString.call(val) !== '[object Object]') return null;
            var out = {}, k, arr, i, ev, nk = 0;
            for (k in val) {
                if (!Object.prototype.hasOwnProperty.call(val, k)) continue;
                if (++nk > 80) return null;
                if (k === '__proto__' || k === 'prototype' || k === 'constructor') return null;
                arr = val[k];
                if (!Array.isArray(arr) || arr.length > 60) return null;
                var clean = [];
                for (i = 0; i < arr.length; i++) {
                    ev = arr[i];
                    if (!Array.isArray(ev) || ev.length < 4) continue;
                    var y = +ev[0], m = +ev[1], d = +ev[2], a = +ev[3];
                    if (!isValidJDate(y, m, d) || !isFinite(a) || !(a > 0)) continue;
                    clean.push([y, m, d, a]);
                }
                if (clean.length) out[String(k).slice(0, 40)] = clean;
            }
            return out;
        } catch (e) { return null; }
    }

    function wgTodayParts(ms) {
        var dt = new Date(ms + CONFIG.tzOffsetMin * 60000);
        return [dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()];
    }
    function wgWeekIdx(ms) {
        try {
            var pp = wgTodayParts(ms);
            return Math.floor((g2d(pp[0], pp[1], pp[2]) + 2) / 7);
        } catch (e) { return 0; }
    }
    function wgD2J(jdn) {
        var lo = 1300, hi = 1500, md;
        while (lo < hi) { md = (lo + hi + 1) >> 1; if (j2d(md, 1, 1) <= jdn) lo = md; else hi = md - 1; }
        var jy = lo; lo = 1; hi = 12;
        while (lo < hi) { md = (lo + hi + 1) >> 1; if (j2d(jy, md, 1) <= jdn) lo = md; else hi = md - 1; }
        return [jy, lo, jdn - j2d(jy, lo, 1) + 1];
    }
    function wgWeekLabel(wIdx) {
        try {
            var fa = function (xx) { return xx[0] + '/' + ('0' + xx[1]).slice(-2) + '/' + ('0' + xx[2]).slice(-2); };
            return fa(wgD2J(wIdx * 7 - 2)) + ' تا ' + fa(wgD2J(wIdx * 7 + 4));   // شنبه … جمعه
        } catch (e) { return ''; }
    }

    function poolEffDays() {
        var d = Math.round(+CONFIG.poolDays);
        if (!(d > 0)) d = 14;
        return Math.min(30, Math.max(7, d));
    }
    function wgPoolLabel(now) {
        try {
            var d = poolEffDays();
            var pp = wgTodayParts(now);
            var jdn = g2d(pp[0], pp[1], pp[2]);
            var fa = function (xx) { return xx[0] + '/' + ('0' + xx[1]).slice(-2) + '/' + ('0' + xx[2]).slice(-2); };
            return fa(wgD2J(jdn - d + 1)) + ' تا ' + fa(wgD2J(jdn)) + ' (' + d + ' روز)';
        } catch (e) { return ''; }
    }

    function wgMedian(arr) {
        if (!arr || !arr.length) return 0;
        var prs = [], iw;
        for (iw = 0; iw < arr.length; iw++) {
            if (arr[iw] && arr[iw][1] > 0) prs.push([arr[iw][1], arr[iw][2] > 0 ? arr[iw][2] : 1]);
        }
        if (!prs.length) return 0;
        prs.sort(function (aa, bb) { return aa[0] - bb[0]; });
        var m0 = prs[(prs.length - 1) >> 1][0];
        var devs = [], id;
        for (id = 0; id < prs.length; id++) devs.push(Math.abs(prs[id][0] - m0));
        devs.sort(function (aa, bb) { return aa - bb; });
        var mad = devs[(devs.length - 1) >> 1];
        var tol = Math.max(3 * mad, m0 * 0.05);
        var kept = [], ik;
        for (ik = 0; ik < prs.length; ik++) if (Math.abs(prs[ik][0] - m0) <= tol) kept.push(prs[ik]);
        if (!kept.length) kept = prs;
        var tot = 0;
        for (ik = 0; ik < kept.length; ik++) tot += kept[ik][1];
        var half = tot / 2, cum = 0;
        for (ik = 0; ik < kept.length; ik++) {
            cum += kept[ik][1];
            if (cum >= half) return kept[ik][0];
        }
        return kept[kept.length - 1][0];
    }
    function wgMode(arr) {             // پرتکرارترین مقدار (برای اندازهٔ قرارداد)
        if (!arr || !arr.length) return 0;
        var cnt = {}, best = 0, bestN = 0, im, ky;
        for (im = 0; im < arr.length; im++) {
            if (!(arr[im] && arr[im][1] > 0)) continue;
            ky = String(arr[im][1]);
            cnt[ky] = (cnt[ky] || 0) + 1;
            if (cnt[ky] > bestN) { bestN = cnt[ky]; best = arr[im][1]; }
        }
        return best;
    }
    function wgModeShare(arr) {        // سهمِ مُد از همهٔ مشاهده‌ها (ابهام → رد)
        if (!arr || !arr.length) return 0;
        var mm = wgMode(arr), cnt = 0, in2;
        for (in2 = 0; in2 < arr.length; in2++) if (arr[in2] && arr[in2][1] === mm) cnt++;
        return cnt / arr.length;
    }
    function wgPct(pool, pct) {
        if (!pool || !pool.length) return 0;
        var vals = [], ip;
        for (ip = 0; ip < pool.length; ip++) {
            if (pool[ip] && pool[ip][1] === pool[ip][1]) vals.push(pool[ip][1]);
        }
        if (!vals.length) return 0;
        vals.sort(function (aa, bb) { return aa - bb; });
        var pos = (vals.length - 1) * pct / 100, lo = Math.floor(pos), hi = Math.ceil(pos);
        return lo === hi ? vals[lo] : vals[lo] + (vals[hi] - vals[lo]) * (pos - lo);
    }
    function wgTrim(arr) { while (arr.length > 40) arr.shift(); }
    function wgEmpty(obj) { for (var ke in obj) if (Object.prototype.hasOwnProperty.call(obj, ke)) return false; return true; }

    function wgBaseFromName(nName) {
        try {
            var parts = nName.split(/[\-\u2010-\u2015\u2212]+/);
            var ei = -1, ix;
            var GEN71 = /(1[3-4]\d\d|1500)\s*[\/.\-]\s*(0?[1-9]|1[0-2])(?!\d)/;   // v9.0.1: هر سررسیدی، نه فقط ماهِ کانفیگ
            for (ix = 0; ix < parts.length; ix++) if (GEN71.test(parts[ix])) { ei = ix; break; }
            if (ei < 2) return '';                        // دستِ‌کم: شرح، اعمال، سررسید
            if (!(numOf(parts[ei - 1]) > 0)) return '';   // بخشِ قبل از سررسید باید اعمال باشد
            var cand = parts[ei - 2];
            cand = cand.replace(/^اختیار[^\s\u200c]*[\s\u200c]*/, '');
            cand = cand.replace(/^(خ|ف)[\s\u200c]+/, '');
            cand = cand.replace(/^\s+|\s+$/g, '');
            if (cand.length < 2 || cand.length > 30) return '';
            if (numOf(cand) > 0 || GEN71.test(cand)) return '';
            return norm(cand);
        } catch (e) { return ''; }
    }

    function wgInit() {
        try {
            var now = Date.now();
            var mem = (typeof window !== 'undefined' && window) ? window : null;
            if (!WG) {
                if (mem && mem.__opt71Week && mem.__opt71Week.weeks) WG = mem.__opt71Week;
                else WG = { idx: wgWeekIdx(now), weeks: {}, pairs: {}, applied: {}, userKeys: {},
                            staticP: {}, staticV: {}, ver: -1, lastFlush: 0, dirty: 0 };
                if (mem) mem.__opt71Week = WG;
            }
            if (!WG.weeks) WG.weeks = {};
            if (!WG.pairs) WG.pairs = {};
            if (!WG.store) WG.store = optStore() || null;
            var newIdx = wgWeekIdx(now);
            if (WG.ready && WG.idx === newIdx) return WG;      // آماده و هفته عوض نشده → ارزان
            if (WG.ready && WG.idx !== newIdx) wgFlush(now);   // هفته عوض شد → ذخیرهٔ قطعیِ هفتهٔ قبل
            WG.idx = newIdx;
            var ST = WG.store;
            if (ST) {
                var stVer = 0, sv = null;
                try { sv = ST.get(WG_VER_KEY); if (sv !== null && sv !== undefined && parseInt(sv, 10) >= 0) stVer = parseInt(sv, 10); } catch (e) {}
                if (WG.ver < 0 || WG.ver !== stVer) {
                    var blob = null, data = null;
                    try { blob = ST.get(WG_KEY); } catch (e) {}
                    if (blob) { try { data = JSON.parse(blob); } catch (e) { data = null; } }
                    if (data && data.w && typeof data.w === 'object') wgMergeWeeks(data.w, WG.weeks);
                    WG.ver = stVer;
                }
            }
            wgPrune(WG.weeks, WG.idx);
            if (!WG.weeks[String(WG.idx)]) WG.weeks[String(WG.idx)] = { u: {} };
            WG.ready = true;
            return WG;
        } catch (e) { return WG; }
    }
    function wgPrunePairs71() {                    // v9.0.2: پالایشِ جفت‌های Put-Call
        try {
            if (!WG || !WG.pairs) return;
            var pc71 = Date.now() - Math.max(7, 2 * poolEffDays()) * 86400000, pk71, pr71;
            for (pk71 in WG.pairs) {
                if (!Object.prototype.hasOwnProperty.call(WG.pairs, pk71)) continue;
                pr71 = WG.pairs[pk71];
                if (!pr71 || Math.max(pr71.ct || 0, pr71.pt || 0) < pc71) delete WG.pairs[pk71];
            }
        } catch (e) {}
    }
    function wgPrune(weeks, idx) {
        var span = Math.ceil(poolEffDays() / 7) + 1;
        wgPrunePairs71();   // v9.0.2   // +۱ سطل هامش
        for (var kw in weeks) {
            if (!Object.prototype.hasOwnProperty.call(weeks, kw)) continue;
            var nw = parseInt(kw, 10);
            if (!(nw >= idx - span && nw <= idx)) delete weeks[kw];
        }
    }
    function wgMergeWeeks(src, dst) {
        for (var kw in src) {
            if (!Object.prototype.hasOwnProperty.call(src, kw) || !src[kw] || !(src[kw].u || src[kw].g)) continue;
            var dw = dst[kw] || (dst[kw] = { u: {} });
            if (!dw.u) dw.u = {};
            if (src[kw].u) for (var bb in src[kw].u) {
                if (!Object.prototype.hasOwnProperty.call(src[kw].u, bb)) continue;
                var su = src[kw].u[bb] || {};
                var du = dw.u[bb] || (dw.u[bb] = { s: [], v: [], c: [], k: [0, 0] });
                if (!du.s) du.s = []; if (!du.v) du.v = []; if (!du.c) du.c = []; if (!du.k) du.k = [0, 0];
                du.s = wgMergeArr(du.s, su.s, 40); du.v = wgMergeArr(du.v, su.v, 40); du.c = wgMergeArr(du.c, su.c, 40);
                if (su.k && su.k[0] > 0) {
                    du.k[0] = (du.k[0] > 0) ? Math.min(du.k[0], su.k[0]) : su.k[0];
                    du.k[1] = Math.max(du.k[1] || 0, su.k[1] || 0);
                }
            }
            var sg = src[kw].g;
            if (sg && typeof sg === 'object') {
                if (!dw.g) dw.g = {};
                for (var gp in sg) {
                    if (!Object.prototype.hasOwnProperty.call(sg, gp)) continue;
                    if (/_n$/.test(gp)) dw.g[gp] = Math.max(dw.g[gp] || 0, sg[gp] || 0);
                    else dw.g[gp] = wgMergeArr(dw.g[gp] || [], sg[gp], 200);
                }
            }
        }
    }
    function wgMergeArr(dstArr, srcArr, cap) {
        if (!srcArr || !srcArr.length) return dstArr;
        var seen = {}, out = [], ia, ka;
        for (ia = 0; ia < dstArr.length; ia++) { ka = dstArr[ia][0] + '|' + dstArr[ia][1]; if (!seen[ka]) { seen[ka] = 1; out.push(dstArr[ia]); } }
        for (ia = 0; ia < srcArr.length; ia++) { ka = srcArr[ia][0] + '|' + srcArr[ia][1]; if (!seen[ka]) { seen[ka] = 1; out.push(srcArr[ia]); } }
        out.sort(function (xx, yy) { return xx[0] - yy[0]; });
        var lim = cap > 0 ? cap : 40;
        while (out.length > lim) out.shift();
        return out;
    }
    function wgHalve(weeks) {
        var thin = function (arr) { var out = [], ith; if (!arr) return out; for (ith = 0; ith < arr.length; ith += 2) out.push(arr[ith]); return out; };
        for (var kw in weeks) {
            if (!Object.prototype.hasOwnProperty.call(weeks, kw) || !weeks[kw]) continue;
            var uu2, bb2;
            if (weeks[kw].u) for (bb2 in weeks[kw].u) {
                if (!Object.prototype.hasOwnProperty.call(weeks[kw].u, bb2)) continue;
                uu2 = weeks[kw].u[bb2]; if (!uu2) continue;
                uu2.s = thin(uu2.s); uu2.v = thin(uu2.v); uu2.c = thin(uu2.c);
            }
            if (weeks[kw].g) for (var gp2 in weeks[kw].g) {
                if (!Object.prototype.hasOwnProperty.call(weeks[kw].g, gp2)) continue;
                if (!/_n$/.test(gp2)) weeks[kw].g[gp2] = thin(weeks[kw].g[gp2]);
            }
        }
    }
    function wgFlush(now) {
        try {
            var ST = WG && WG.store; if (!ST) return;
            var stVer = 0, sv = null;
            try { sv = ST.get(WG_VER_KEY); if (sv !== null && sv !== undefined && parseInt(sv, 10) >= 0) stVer = parseInt(sv, 10); } catch (e) {}
            if (stVer !== WG.ver) {
                var blob = null, data = null;
                try { blob = ST.get(WG_KEY); } catch (e) {}
                if (blob) { try { data = JSON.parse(blob); } catch (e) { data = null; } }
                if (data && data.w) wgMergeWeeks(data.w, WG.weeks);
            }
            wgPrune(WG.weeks, WG.idx);
            var out = JSON.stringify({ w: WG.weeks });
            if (out.length > 400000) { wgHalve(WG.weeks); out = JSON.stringify({ w: WG.weeks }); }
            ST.set(WG_KEY, out);
            WG.ver = stVer + 1;
            ST.set(WG_VER_KEY, String(WG.ver));
            WG.lastFlush = now; WG.lastFlushT = now;
        } catch (e) { try { dbgWarn('wgFlush: ' + (e && e.message ? e.message : e), true); } catch (e2) {} }
    }
    function wgMaybeFlush(now) {
        if (!WG || !WG.store) return;
        WG.dirty = (WG.dirty || 0) + 1;
        if (!WG.lastFlush || (now - WG.lastFlush) >= 2000 ||
            ((now - WG.lastFlush) >= 200 && WG.dirty >= 8)) {
            wgFlush(now); WG.dirty = 0;
            WG.flushCount71 = ((WG.flushCount71 || 0) + 1) % 5000;
            if (WG.flushCount71 === 0) wgPrunePairs71();
        }
    }
    function wgPush(gPool, key, now, val) {
        benchCount71('wgPush', 1);
        if (!(val === val) || !(val > 0) || !(val < 1e12)) return;
        var arr = gPool[key] || (gPool[key] = []);
        var entry = [now, Math.round(val * 1000) / 1000];
        if (arr.length < 200) { arr.push(entry); return; }
        var seenN = (gPool[key + '_n'] = (gPool[key + '_n'] || 200) + 1);
        arr[seenN % 200] = entry;
    }

    function poolState940() {
        try {
            if (!CONFIG.poolAuto) return 'خاموش';
            if (isBacktest()) return 'بک‌تست';
            if (!WG || !WG.ready) return 'آماده‌نشده';
            if (!WG.store) return 'حافظه-ندارد';
            var dt = new Date(), tm = tehranMinutes(dt), dayOk = CONFIG.sessionDays.indexOf(tm.day) >= 0;
            if (!dayOk || tm.min / 60 < CONFIG.sessionStartHour || tm.min / 60 >= CONFIG.sessionEndHour) return 'خارج-ساعت';
            if (tm.min < (CONFIG.poolObsFromMin > 0 ? CONFIG.poolObsFromMin : CONFIG.sessionStartHour * 60)) return 'پیش‌گشایش';
            return 'فعال';
        } catch (e) { return 'نامشخص'; }
    }

    function wgShouldObserve71() {
        try {
            if (!CONFIG.poolAuto || !WG || isBacktest()) return false;
            // v9.6.0.7: Test-only hook now behind debugPanel flag to prevent backdoor in prod
            if (CONFIG.debugPanel && typeof window !== 'undefined' && window && window.__opt71NoSess) return true;
            return inSession(new Date()) && tehranMinutes(new Date()).min >= (CONFIG.poolObsFromMin > 0 ? CONFIG.poolObsFromMin : 0);
        } catch (e) { return false; }
    }

    function wgObserveLive(ob) {
        try {
            var Dpl = dbgState(); if (Dpl) Dpl.pool.state = poolState940();
            if (!ob || !wgShouldObserve71()) return;   // v9.0.3: جلسه + حذفِ پیش‌گشایش (poolObsFromMin)
            var now = Date.now();
            var wk = wgCur();
            if (!wk) return;
            if (!wk.g) wk.g = {};
            if (ob.spreadPct > 0) wgPush(wk.g, 'sp', now, ob.spreadPct);
            if (ob.tno > 0) wgPush(wk.g, 'tn', now, ob.tno);
            if (ob.tvol > 0) wgPush(wk.g, 'tv', now, ob.tvol);
            if (Dpl) Dpl.pool.lastObserve = { t: now, tno: ob.tno, tvol: ob.tvol, spread: ob.spreadPct };
            wgMaybeFlush(now);
        } catch (e) {}
    }

    // Pre-gate metric calibration: IV/cost/leverage/realized-vol are already
    // computed at the decision boundary, but the final gate has not selected survivors.
    // This keeps their pool representative of the observed market rather than only passes.
    function wgObservePreGate(ob) {
        try {
            if (!ob || !wgShouldObserve71()) return;
            var now = Date.now(), wk = wgCur();
            if (!wk) return;
            if (!wk.g) wk.g = {};
            if (ob.costRT > 0 && ob.costRT < 100) wgPush(wk.g, 'cr', now, ob.costRT);
            if (ob.ivSrc === 'IV' && ob.iv > 0 && ob.vPct > 0) wgPush(wk.g, 'ivp', now, ob.iv * 100 - ob.vPct);
            if (ob.leverage > 0) wgPush(wk.g, 'lev', now, ob.leverage);
            if (ob.vReal > 5) wgPush(wk.g, 'vr', now, ob.vReal);
            wgMaybeFlush(now);
        } catch (e) {}
    }

    function wgObserve(ob) {
        try {
            if (!ob || !wgShouldObserve71()) return;   // v9.0.3: جلسه + حذفِ پیش‌گشایش (poolObsFromMin)
            var base = ob.base || wgBaseFromName(ob.nName || '');
            if (!base) return;
            base = norm(base);
            if (!(ob.strike > 0)) return;
            var now = Date.now();
            var wk = wgCur();
            if (!wk) return;
            if (!wk.g) wk.g = {};
            if (Object.keys(wk.u).length >= 40 && !wk.u[base]) return;   // سقفِ نماد در هفته
            var uu = wk.u[base] || (wk.u[base] = { s: [], v: [], c: [], k: [ob.strike, ob.strike] });
            if (ob.strike < uu.k[0]) uu.k[0] = ob.strike;
            if (ob.strike > uu.k[1]) uu.k[1] = ob.strike;
            var knownS = CONFIG.basePrices[base] > 0 ? CONFIG.basePrices[base] : 0;
            var discK = ob.strike * Math.exp(-(ob.r || 0) * (ob.T || 0));
            var divPvOb = ob.divPv > 0 ? ob.divPv : 0;
            var pk = base + '|' + ob.strike + '|' + ob.daysLeft;
            var leg = WG.pairs[pk] || (WG.pairs[pk] = {});
            if (ob.isCall) { leg.c = ob.mid; leg.ct = now; } else { leg.p = ob.mid; leg.pt = now; }
            var freshPair = CONFIG.cacheTtlMs > 0 ? CONFIG.cacheTtlMs * 2 : 240000;
            if (leg.c > 0 && leg.p > 0 && Math.abs((leg.ct || 0) - (leg.pt || 0)) < freshPair) {
                wgAddS(uu, now, leg.c - leg.p + discK + divPvOb, knownS, 2);      // S = C − P + K·e^(−rT)
            }
            if (ob.S > 0 && ob.intrinsic > 0 && ob.timeValue < ob.intrinsic * 0.02 + 1e-9) {
                wgAddS(uu, now, ob.isCall ? (ob.mid + discK + divPvOb) : (discK - ob.mid + divPvOb), knownS, 1);
            }
            if (ob.vReal > 5) { uu.v.push([now, Math.round(ob.vReal)]); wgTrim(uu.v); }
            // sp/tn/tv are sampled once, pre-gate, by wgObserveLive.
            if (ob.modelChk > 0 && ob.askS > 0) {
                var ratio = ob.modelChk / ob.askS;
                if (ratio >= 3 || ratio <= 1 / 3) {
                    var ff = Math.pow(10, Math.round(Math.log(ratio) / Math.LN10));
                    if (Math.abs(ratio / ff - 1) < 0.35) {
                        var hint = Math.round(ob.csUsed / ff);
                        if (hint >= 1) { uu.c.push([now, hint]); wgTrim(uu.c); }
                    }
                }
            }
            // cr/ivp/lev/vr are sampled once by wgObservePreGate so rejected
            // rows contribute to calibration; survivor-only observations stay here.
            wgMaybeFlush(now);
        } catch (e) {}
    }
    function wgAddS(uu, now, sEst, knownS, weight) {
        if (!(sEst > 0) || !(sEst < 1e12)) return;
        if (knownS > 0) {
            var rr = sEst / knownS;
            if (rr < 1 / 3 || rr > 3) return;               // بیرونِ بازهٔ سلامت → ثبت نمی‌شود
        } else if (uu.k && uu.k[0] > 0) {
            if (!(sEst >= uu.k[0] * 0.3 && sEst <= uu.k[1] * 3)) return;   // بازهٔ اعمال‌ها
        } else return;
        uu.s.push([now, Math.round(sEst * 100) / 100, weight > 0 ? weight : 1]);
        wgTrim(uu.s);
    }
    function wgCur() {
        if (!WG) return null;
        var kc = String(WG.idx);
        if (!WG.weeks[kc]) WG.weeks[kc] = { u: {}, g: {} };
        if (!WG.weeks[kc].u) WG.weeks[kc].u = {};
        if (!WG.weeks[kc].g) WG.weeks[kc].g = {};
        return WG.weeks[kc];
    }

    function wgLiveS(base) {
        try {
            var wk = wgCur(), uu = wk && wk.u[base];
            if (!uu || !uu.s || uu.s.length < 2) return 0;
            var winD = Math.max(2, Math.min(7, Math.ceil(poolEffDays() / 7)));
            var cutoff = Date.now() - winD * 86400000, fresh = [], il;
            for (il = 0; il < uu.s.length; il++) if (uu.s[il][0] >= cutoff) fresh.push(uu.s[il]);
            if (fresh.length < 2) return 0;
            var med = wgMedian(fresh);
            if (!(med > 0)) return 0;
            var mx = 0, mn = 1e18;
            for (il = 0; il < fresh.length; il++) {
                if (fresh[il][1] > mx) mx = fresh[il][1];
                if (fresh[il][1] < mn) mn = fresh[il][1];
            }
            if ((mx - mn) / med > 0.25) return 0;            // پراکندگی → داده قابلِ اتکا نیست
            if (!wgSanePrice(med, CONFIG.basePrices[base] || 0, uu)) return 0;
            return Math.round(med);
        } catch (e) { return 0; }
    }
    function wgLiveCS(base) {
        try {
            var wk = wgCur(), uu = wk && wk.u[base];
            if (!uu || !uu.c || uu.c.length < (CONFIG.poolMinObs > 0 ? CONFIG.poolMinObs : 3)) return 0;
            if (wgModeShare(uu.c) < 0.6) return 0;           // نشانه‌های ضدونقیض → دست نمی‌زنیم
            var mm = wgMode(uu.c);
            return mm > 0 ? mm : 0;
        } catch (e) { return 0; }
    }
    function wgSanePrice(sEst, refStatic, uu) {
        if (!(sEst > 0) || !(sEst < 1e12)) return false;
        var clamp = CONFIG.poolClamp >= 1.5 ? CONFIG.poolClamp : 3;
        var okStatic = refStatic > 0 ? (sEst / refStatic >= 1 / clamp && sEst / refStatic <= clamp) : true;
        var okRange = (uu && uu.k && uu.k[0] > 0) ? (sEst >= uu.k[0] * 0.3 && sEst <= uu.k[1] * 3) : true;
        return okStatic && okRange;
    }

    // ═══════════════════════════════════════════════════════════════
    //  v7 بلوک ۴ — نرخِ بدونِ ریسکِ پویا (پله‌ای روی منحنی)
    // ═══════════════════════════════════════════════════════════════
    function loadRiskFreeAuto71() {
        try {
            if (!CONFIG.riskFreeAutoFetch || isBacktest()) return;
            var W71r = (typeof window !== 'undefined' && window) ? window : null;
            if (!W71r || W71r.__opt71RfAuto) return;
            var ST71r = optStore(), raw71r = ST71r && ST71r.get(RF_AUTO_KEY71 || '__optRiskFreeAutoV71'), dat71r = null;
            if (raw71r) { try { dat71r = JSON.parse(raw71r); } catch (eR71) {} }
            var now71r = Date.now();
            if (dat71r && Array.isArray(dat71r.v) && dat71r.v.length && dat71r.at > 0 && now71r >= dat71r.at && now71r - dat71r.at < 7 * 86400000) {
                var valid71r = wgValidArr(dat71r.v);
                if (valid71r && valid71r.length) {
                    W71r.__opt71RfAuto = valid71r;
                    W71r.__opt71RfAutoAt = dat71r.at;
                    bumpModelEpoch();
                }
            }
        } catch (e) {}
    }

    function effRate(todayJdn) {
        try {
            var Wrf = (typeof window !== 'undefined' && window) ? window : null;
            if (Wrf && !Wrf.__opt71RfAuto) loadRiskFreeAuto71();
            var cur = (CONFIG.riskFreeAutoFetch && Wrf && Wrf.__opt71RfAuto) || CONFIG.riskFreeCurve;
            if (!Array.isArray(cur) || !cur.length) return CONFIG.riskFree;
            var best = -1, bj = -1e9, i, ev, j0;
            for (i = 0; i < cur.length; i++) {
                ev = cur[i];
                if (!Array.isArray(ev) || ev.length < 4) continue;
                j0 = j2d(+ev[0], +ev[1], +ev[2]);
                if (!(j0 > 0)) continue;
                if (j0 <= todayJdn && j0 > bj) { bj = j0; best = +ev[3]; }
            }
            return (best > 0) ? best : CONFIG.riskFree;
        } catch (e) { return CONFIG.riskFree; }
    }

    // ═══════════════════════════════════════════════════════════════
    //  v7 بلوک ۱ — سود نقدی: PVِ سودهایِ بینِ امروز و سررسید (Merton گسسته)
    // ═══════════════════════════════════════════════════════════════
    function jdnOfMs(ms) {
        try {
            var d = new Date(ms + CONFIG.tzOffsetMin * 60000);
            return g2d(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
        } catch (e) { return 0; }
    }
    function divEvents(nb) {
        try {
            var cal = divCalEff(), out = [], k, arr, i, ev;
            for (k in cal) {
                if (!Object.prototype.hasOwnProperty.call(cal, k)) continue;
                if (norm(k) !== nb) continue;
                arr = cal[k];
                if (!Array.isArray(arr)) continue;
                for (i = 0; i < arr.length; i++) {
                    ev = arr[i];
                    if (!Array.isArray(ev) || ev.length < 4) continue;
                    var j0 = j2d(+ev[0], +ev[1], +ev[2]), amt = +ev[3];
                    if (j0 > 0 && amt > 0) out.push({ jdn: j0, amount: amt });
                }
            }
            return out;
        } catch (e) { return []; }
    }
    function divAdjust(nb, todayJdn, expJdn) {
        try {
            var evs = divEvents(nb), pv = 0, onEx = false, i, r = effRate(todayJdn) / 100;
            for (i = 0; i < evs.length; i++) {
                var e = evs[i];
                if (e.jdn === todayJdn) onEx = true;                  // امروز روزِ مجمع
                if (e.jdn > todayJdn && e.jdn <= expJdn &&
                    (e.jdn - todayJdn) <= (CONFIG.dividendMaxDays > 0 ? CONFIG.dividendMaxDays : 90)) {
                    pv += e.amount * Math.exp(-r * Math.max(1, e.jdn - todayJdn) / 365);
                }
            }
            return { pv: pv, onExDay: onEx };
        } catch (e) { return { pv: 0, onExDay: false }; }
    }
    function fetchWithTimeout71(url, options, timeoutMs) {
        try {
            var ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
            var opts = {}, srcOpts = options || {}, ok71;
            for (ok71 in srcOpts) if (Object.prototype.hasOwnProperty.call(srcOpts, ok71)) opts[ok71] = srcOpts[ok71];
            if (ctrl) opts.signal = ctrl.signal;
            var to = setTimeout(function () { if (ctrl) ctrl.abort(); }, timeoutMs || 8000);
            if (typeof fetch !== 'function') return Promise.reject(new Error('fetch unavailable'));
            return fetch(url, opts).then(function (r) { clearTimeout(to); return r; }, function (e) { clearTimeout(to); throw e; });
        } catch (e) { return Promise.reject(e); }
    }

    function fetchDividends() {
        try {
            if (isBacktest() || !CONFIG.dividendAutoFetch || !CONFIG.dividendFetchUrl) return;
            var W = (typeof window !== 'undefined' && window) ? window : null;
            if (!W) return;
            var now = Date.now();
            if (W.__opt71DivFetch && (now - W.__opt71DivFetch) < 3600000) return;   // ساعتی یک‌بار
            if (typeof fetch !== 'function') return;
            var loc = '';
            try { loc = String((typeof location !== 'undefined' && location && location.origin) || ''); } catch (e) {}
            if (loc.indexOf('tsetmc') < 0) return;                    // فقط هم‌مبدأ
            W.__opt71DivFetch = now;
            fetchWithTimeout71(CONFIG.dividendFetchUrl, { mode: 'same-origin' }, 8000)
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (j) {
                    try {
                        if (!Array.isArray(j)) return;
                        var cal = {}, i, it;
                        for (i = 0; i < j.length; i++) {
                            it = j[i];
                            if (!it || !it.sym || !Array.isArray(it.d)) continue;
                            (cal[it.sym] = cal[it.sym] || []).push([+it.d[0], +it.d[1], +it.d[2], +it.amt || 0]);
                        }
                        var v = wgValidCal(cal);
                        if (v) {
                            W.__opt71DivAuto = v;                    // جدا از تقویمِ دستی
                            W.__opt71DivVersion = (W.__opt71DivVersion || 0) + 1;
                            bumpModelEpoch();
                        }
                    } catch (e) {}
                })
                .catch(function () {});
        } catch (e) {}
    }
    function divCalEff() {
        try {
            var W = (typeof window !== 'undefined' && window) ? window : null;
            var auto = (CONFIG.dividendAutoFetch && W && W.__opt71DivAuto) ? W.__opt71DivAuto : null;
            if (!auto) return CONFIG.dividendCalendar || {};
            var out = {}, k, i, j;
            for (k in auto) if (Object.prototype.hasOwnProperty.call(auto, k)) out[k] = auto[k].slice();
            for (k in (CONFIG.dividendCalendar || {})) if (Object.prototype.hasOwnProperty.call(CONFIG.dividendCalendar, k)) {
                var base71 = (out[k] || []).slice();
                for (i = 0; i < (CONFIG.dividendCalendar[k] || []).length; i++) {
                    var m71 = CONFIG.dividendCalendar[k][i], dup71 = false;
                    for (j = 0; j < base71.length; j++)
                        if (base71[j][0] === m71[0] && base71[j][1] === m71[1] && base71[j][2] === m71[2]) { base71[j] = m71; dup71 = true; break; }
                    if (!dup71) base71.push(m71);          // ⭐ ادغام: دستی + خودکار با هم؛ دستی در تاریخِ تکراری مقدم
                }
                out[k] = base71;
            }
            return out;
        } catch (e) { return CONFIG.dividendCalendar || {}; }
    }

    // ═══════════════════════════════════════════════════════════════
    //  v7 بلوک ۲ — قیمتِ زندهٔ پایه (واکشیِ هم‌مبدأ؛ فقط با baseInsCodes)
    // ═══════════════════════════════════════════════════════════════
    function fetchRiskFreeCurve71() {          // v7.1: hook اختیاری — JSONِ [[سال,ماه,روز,نرخ٪],…]
        try {
            if (isBacktest() || !CONFIG.riskFreeAutoFetch || !CONFIG.riskFreeFetchUrl) return;
            var W = (typeof window !== 'undefined' && window) ? window : null;
            if (!W) return;
            var now = Date.now();
            if (W.__opt71RfFetch && (now - W.__opt71RfFetch) < 3600000) return;   // ساعتی یک‌بار
            if (typeof fetch !== 'function') return;
            var loc = '';
            try { loc = String((typeof location !== 'undefined' && location && location.origin) || ''); } catch (e) {}
            if (loc.indexOf('tsetmc') < 0) return;                    // فقط هم‌مبدأ
            W.__opt71RfFetch = now;
            fetchWithTimeout71(CONFIG.riskFreeFetchUrl, { mode: 'same-origin' }, 8000)
                .then(function (r) { return r.ok ? r.json() : null; })
                .then(function (j) {
                    try {
                        var v = wgValidArr(j);
                        if (v && v.length) {
                            W.__opt71RfAuto = v;
                            W.__opt71RfAutoAt = Date.now();
                            try { var ST71rf = optStore(); if (ST71rf) ST71rf.set(RF_AUTO_KEY71, JSON.stringify({ at: W.__opt71RfAutoAt, v: v })); } catch (eRF71) {}
                            bumpModelEpoch();
                        }
                    } catch (e) {}
                })
                .catch(function () {});
        } catch (e) {}
    }

    function livePxStore() {
        try {
            if (typeof window !== 'undefined' && window)
                return (window.__opt71LivePx = window.__opt71LivePx || {});
        } catch (e) {}
        return null;
    }
    function fetchLiveBase(nb, code) {
        try {
            var st = livePxStore(); if (!st || !code) return;
            var now = Date.now(), hit = st[nb];
            var fTtl71 = (hit && hit.px > 0) ? Math.max(30000, CONFIG.liveBaseMaxAge) : 30000;   // v8.0.1: شکست → تلاشِ دوباره پس از ۳۰ث
            if (hit && (now - hit.t) < fTtl71) return;
            if (hit && hit.busy) return;
            if (typeof fetch !== 'function') { st[nb] = { t: now, px: 0 }; return; }
            var loc = '';
            try { loc = String((typeof location !== 'undefined' && location && location.origin) || ''); } catch (e) {}
            if (loc.indexOf('tsetmc') < 0) { st[nb] = { t: now, px: 0 }; return; }   // بیرونِ TSETMC → خاموش
            var busyCount71 = 0, bk71;
            for (bk71 in st) if (Object.prototype.hasOwnProperty.call(st, bk71) && st[bk71] && st[bk71].busy) busyCount71++;
            if (busyCount71 >= 3) return;
            st[nb] = { t: hit ? hit.t : now, px: hit ? hit.px : 0, busy: true };
            var liveUrl71 = '/tsev2/data/InstInfoFast.aspx?i=' + encodeURIComponent(code) + String.fromCharCode(38)+'c=34';
            try { if (typeof location !== 'undefined' && location && location.origin) liveUrl71 = location.origin + liveUrl71; } catch (eU71) {}
            fetchWithTimeout71(liveUrl71, { mode: 'same-origin', credentials: 'same-origin',
                               headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'text/plain,*/*' } })
                .then(function (r) { return r.ok ? r.text() : ''; })
                .then(function (tx) {
                    var px = 0;
                    if (tx) {
                        // قرارداد InstInfoFast: بخش اول CSV و قیمتِ قابلِ استفاده در اندیس ۲ است.
                        // fallbackهای نام‌گذاری‌شده برای fixture/APIهای جدید نگه داشته می‌شوند.
                        var f = tx.split(';')[0].split(','), direct = parseFloat(f[2]);
                        if (direct > 1 && direct < 1e12) px = direct;
                        if (!(px > 0)) {
                            var cand71 = [f[3], f[4], f[5], f[1]], ci71, vv71;
                            for (ci71 = 0; ci71 < cand71.length; ci71++) {
                                vv71 = parseFloat(cand71[ci71]);
                                if (vv71 > 1 && vv71 < 1e12) { px = vv71; break; }
                            }
                        }
                    }
                    st[nb] = { t: Date.now(), px: (px > 0 ? px : 0) };
                    try { if (typeof window !== 'undefined' && window) window.__opt71LivePxVersion = (window.__opt71LivePxVersion || 0) + 1; } catch (eV71) {}
                })
                .catch(function () { st[nb] = { t: Date.now(), px: 0 }; });
        } catch (e) {}
    }

    // ═══════════════════════════════════════════════════════════════
    //  v7 بلوک ۸ — روندِ خودکار: مومنتومِ ۱۰روزهٔ [ih] در بازهٔ [−۱،+۱]
    // ═══════════════════════════════════════════════════════════════
    function detectTrend(ihArr) {
        try {
            if (typeof ihArr === 'undefined' || !ihArr || ihArr.length < 11) return 0;
            var arr71 = getOrderedHistory(ihArr, CONFIG);   // داخلی: کهنه → جدید
            var n = arr71.length, a = arr71[n - 11], b = arr71[n - 1];
            if (!a || !b) return 0;
            var pa = histClose71(a), pb = histClose71(b);
            if (!(pa > 0) || !(pb > 0)) return 0;
            var mom = (pb / pa - 1) * 100;
            var sc = (CONFIG.viewDailyPct || 1.2) * 10;
            return Math.max(-1, Math.min(1, mom / sc));
        } catch (e) { return 0; }
    }

    function wgPoolU() {
        try {
            if (shouldAbort71()) return null;
            if (!WG) return null;
            var cutoff = Date.now() - poolEffDays() * 86400000;
            var span = Math.ceil(poolEffDays() / 7);
            var out = {}, kw, bb, il, uu, tg;
            var _loopCnt = 0;
            for (kw in WG.weeks) {
                if (shouldAbort71()) break;
                if ((++_loopCnt % 50) === 0 && (Date.now() - cutoff) > 86400000*60) { /* safety */ }

                if (!Object.prototype.hasOwnProperty.call(WG.weeks, kw)) continue;
                var nw = parseInt(kw, 10);
                if (!(nw >= WG.idx - span && nw <= WG.idx)) continue;
                var wk = WG.weeks[kw]; if (!wk || !wk.u) continue;
                for (bb in wk.u) {
                    if (!Object.prototype.hasOwnProperty.call(wk.u, bb)) continue;
                    uu = wk.u[bb]; if (!uu) continue;
                    tg = out[bb] || (out[bb] = { s: [], v: [], c: [], k: [0, 0] });
                    for (il = 0; uu.s && il < uu.s.length; il++) if (uu.s[il] && uu.s[il][0] >= cutoff) tg.s.push(uu.s[il]);
                    for (il = 0; uu.v && il < uu.v.length; il++) if (uu.v[il] && uu.v[il][0] >= cutoff) tg.v.push(uu.v[il]);
                    for (il = 0; uu.c && il < uu.c.length; il++) if (uu.c[il] && uu.c[il][0] >= cutoff) tg.c.push(uu.c[il]);
                    if (uu.k) {
                        if (uu.k[0] > 0) tg.k[0] = (tg.k[0] > 0) ? Math.min(tg.k[0], uu.k[0]) : uu.k[0];
                        if (uu.k[1] > 0) tg.k[1] = Math.max(tg.k[1], uu.k[1]);
                    }
                }
            }
            return out;
        } catch (e) { return null; }
    }

    function applyWeeklyDefaults(CFG) {     // v9.5.6.4: cache با signature ورودی برای جلوگیری از تکرار سنگین در هر نماد
        var _tWD0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        try {
            if (!CFG.poolAuto || isBacktest()) { try { benchNote71('init.applyWeeklyDefaults', 0, 1); } catch(e){} return; }
            wgInit();
            if (!WG) { try { benchNote71('init.applyWeeklyDefaults', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tWD0 : 0), 1); } catch(e){} return; }
            var kk;
            WG.staticP = {}; WG.staticV = {};
            for (kk in CFG.basePrices) if (Object.prototype.hasOwnProperty.call(CFG.basePrices, kk)) WG.staticP[kk] = CFG.basePrices[kk];
            for (kk in CFG.baseVol) if (Object.prototype.hasOwnProperty.call(CFG.baseVol, kk)) WG.staticV[kk] = CFG.baseVol[kk];
            var uk = {}, ro = optOverrides();
            if (ro && ro.ov) for (kk in ro.ov) if (Object.prototype.hasOwnProperty.call(ro.ov, kk)) uk[kk] = true;
            WG.userKeys = uk;
            try {
                var W = (typeof window !== 'undefined' && window) ? window : null;
                var pe = W ? String(W.__opt71PoolEpoch || '') : '';
                var sig = VERSION_TAG + '|' + WG.idx + '|' + (CFG.poolDays||0) + '|' + (CFG.poolMinObs||0) + '|' + pe + '|' + JSON.stringify(uk);
                var C = W ? W.__opt71WDCache : null;
                if (C && C.sig === sig && C.idx === WG.idx && C.pe === pe) {
                    WG.applied = C.applied ? JSON.parse(JSON.stringify(C.applied)) : {};
                    WG.appliedN = C.appliedN || 0;
                    WG.lastIdx = C.lastIdx || WG.idx;
                    if (!uk['basePrices'] && C.basePricesPatch) {
                        for (var k in C.basePricesPatch) if (Object.prototype.hasOwnProperty.call(C.basePricesPatch,k)) CFG.basePrices[k] = C.basePricesPatch[k];
                    }
                    if (!uk['baseVol'] && C.baseVolPatch) {
                        for (var k in C.baseVolPatch) if (Object.prototype.hasOwnProperty.call(C.baseVolPatch,k)) CFG.baseVol[k] = C.baseVolPatch[k];
                    }
                    if (!uk['contractSizes'] && C.contractSizesPatch) {
                        for (var k in C.contractSizesPatch) if (Object.prototype.hasOwnProperty.call(C.contractSizesPatch,k)) CFG.contractSizes[k] = C.contractSizesPatch[k];
                    }
                    try { benchCount71('weeklyDefaults-cache-hit',1); benchNote71('init.applyWeeklyDefaults', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tWD0 : 0),1); } catch(e){}
                    return;
                }
            } catch(eCache){}
            var pu = wgPoolU();
            WG.applied = {}; WG.appliedN = 0; WG.lastIdx = 0;
            if (!pu || wgEmpty(pu)) {
                try {
                    var W2 = (typeof window !== 'undefined' && window) ? window : null;
                    var pe2 = W2 ? String(W2.__opt71PoolEpoch || '') : '';
                    var sig2 = VERSION_TAG + '|' + WG.idx + '|' + (CFG.poolDays||0) + '|' + (CFG.poolMinObs||0) + '|' + pe2 + '|' + JSON.stringify(uk);
                    if (W2) W2.__opt71WDCache = { sig: sig2, idx: WG.idx, pe: pe2, applied: {}, appliedN:0, lastIdx:0, basePricesPatch:{}, baseVolPatch:{}, contractSizesPatch:{} };
                } catch(e){}
                try { benchNote71('init.applyWeeklyDefaults', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tWD0 : 0),1); } catch(e){}
                return;
            }
            WG.lastIdx = WG.idx;
            var minObs = CFG.poolMinObs > 0 ? CFG.poolMinObs : 3;
            var basePricesPatch = {}, baseVolPatch = {}, contractSizesPatch = {};
            var _bbCnt = 0;
            for (var bb in pu) {
                if (shouldAbort71()) break;
                if ((++_bbCnt % 100) === 0 && (typeof performance !== 'undefined' && performance.now ? performance.now() - _tWD0 : 0) > 100) { benchCount71('weeklyDefaults-timeout',1); break; }

                if (!Object.prototype.hasOwnProperty.call(pu, bb)) continue;
                var uu = pu[bb]; if (!uu) continue;
                var ap = {};
                if (!uk['basePrices'] && uu.s && uu.s.length >= minObs) {
                    var sMed = wgMedian(uu.s);
                    if (wgSanePrice(sMed, CFG.basePrices[bb] || 0, uu)) {
                        var tKey = bb, kq;
                        if (!(CFG.basePrices[bb] > 0)) {
                            for (kq in CFG.basePrices) {
                                if (Object.prototype.hasOwnProperty.call(CFG.basePrices, kq) && norm(kq) === bb) { tKey = kq; break; }
                            }
                        }
                        CFG.basePrices[tKey] = Math.round(sMed); ap.p = Math.round(sMed);
                        basePricesPatch[tKey] = CFG.basePrices[tKey];
                    }
                }
                if (!uk['baseVol'] && uu.v && uu.v.length >= minObs) {
                    var vMed = wgMedian(uu.v);
                    if (vMed >= CFG.volFloor && vMed <= CFG.volCeil) {
                        var vKey = bb, kv2;
                        vMed = clamp711(Math.round(vMed), CFG.volFloor, CFG.volCeil);
                        if (!(CFG.baseVol[bb] > 0)) {
                            for (kv2 in CFG.baseVol) {
                                if (Object.prototype.hasOwnProperty.call(CFG.baseVol, kv2) && norm(kv2) === bb) { vKey = kv2; break; }
                            }
                        }
                        CFG.baseVol[vKey] = Math.round(vMed); ap.v = Math.round(vMed);
                        baseVolPatch[vKey] = CFG.baseVol[vKey];
                    }
                }
                if (!uk['contractSizes'] && uu.c && uu.c.length >= minObs && wgModeShare(uu.c) >= 0.6) {
                    var cMode = wgMode(uu.c);
                    if (cMode > 0) { CFG.contractSizes[bb] = cMode; ap.c = cMode; contractSizesPatch[bb] = cMode; }
                }
                if (ap.p || ap.v || ap.c) { WG.applied[bb] = ap; WG.appliedN++; }
            }
            try {
                var W3 = (typeof window !== 'undefined' && window) ? window : null;
                var pe3 = W3 ? String(W3.__opt71PoolEpoch || '') : '';
                var sig3 = VERSION_TAG + '|' + WG.idx + '|' + (CFG.poolDays||0) + '|' + (CFG.poolMinObs||0) + '|' + pe3 + '|' + JSON.stringify(uk);
                if (W3) {
                    W3.__opt71WDCache = {
                        sig: sig3,
                        idx: WG.idx,
                        pe: pe3,
                        applied: JSON.parse(JSON.stringify(WG.applied)),
                        appliedN: WG.appliedN,
                        lastIdx: WG.lastIdx,
                        basePricesPatch: basePricesPatch,
                        baseVolPatch: baseVolPatch,
                        contractSizesPatch: contractSizesPatch
                    };
                }
            } catch(e){}
            try { benchCount71('weeklyDefaults-miss',1); benchNote71('init.applyWeeklyDefaults', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tWD0 : 0),1); } catch(e){}
        } catch (e) { try { benchNote71('init.applyWeeklyDefaults',0,1); } catch(e2){} }
    }

    function wgPoolG() {
        try {
            if (shouldAbort71()) return null;
            if (!WG) return null;
            var cutoff = Date.now() - poolEffDays() * 86400000;
            var span = Math.ceil(poolEffDays() / 7);
            var out = {}, kw, gp2, il, wk, arr, tg;
            for (kw in WG.weeks) {
                if (shouldAbort71()) break;

                if (!Object.prototype.hasOwnProperty.call(WG.weeks, kw)) continue;
                var nw = parseInt(kw, 10);
                if (!(nw >= WG.idx - span && nw <= WG.idx)) continue;
                wk = WG.weeks[kw]; if (!wk || !wk.g) continue;
                for (gp2 in wk.g) {
                    if (!Object.prototype.hasOwnProperty.call(wk.g, gp2)) continue;
                    if (/_n$/.test(gp2)) continue;             // شمارندهٔ حلقه‌ای — برای صدک لازم نیست
                    arr = wk.g[gp2]; if (!arr || !arr.length) continue;
                    tg = out[gp2] || (out[gp2] = []);
                    for (il = 0; il < arr.length; il++) if (arr[il] && arr[il][0] >= cutoff) tg.push(arr[il]);
                }
            }
            return out;
        } catch (e) { return null; }
    }

    function applyWeeklyGates(CFG) {
        var _tWG0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        try {
            if (!CFG.poolAuto || !CFG.poolGates || isBacktest()) { try { benchNote71('init.applyWeeklyGates', 0, 1); } catch(e){} return; }
            wgInit();
            if (!WG) { try { benchNote71('init.applyWeeklyGates', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tWG0 : 0), 1); } catch(e){} return; }
            var gi;
            var pe = (typeof window !== 'undefined' && window) ? String(window.__opt71PoolEpoch || '') : '';
            if (WG.poolEpoch !== pe) {
                WG.poolEpoch = pe;
                WG.gatesCache = null; WG.gatesDone = 0; WG.gatesAt = 0;
            }
            if (!WG.staticG) WG.staticG = {};
            for (gi = 0; gi < WG_GATES.length; gi++) {
                var gateKey71 = WG_GATES[gi][0];
                if (typeof WG.staticG[gateKey71] !== 'number' || !isFinite(WG.staticG[gateKey71])) WG.staticG[gateKey71] = CFG[gateKey71];
            }
            WG.gatesApplied = {};
            if (WG.gatesCache && WG.gatesDone === WG.idx &&
                (Date.now() - (WG.gatesAt || 0)) < 1800000) {
                var kc;
                for (kc in WG.gatesCache) {
                    if (!Object.prototype.hasOwnProperty.call(WG.gatesCache, kc)) continue;
                    if (WG.userKeys && WG.userKeys[kc]) continue;
                    CFG[kc] = WG.gatesCache[kc];
                }
                WG.gatesApplied = WG.gatesCache;
                if (CFG.volCeil <= CFG.volFloor) CFG.volCeil = CFG.volFloor + 20;
                try { benchCount71('weeklyGates-cache-hit',1); benchNote71('init.applyWeeklyGates', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tWG0 : 0), 1); } catch(e){}
                return;
            }
            var gp = wgPoolG();
            WG.gatesApplied = {};
            if (!gp || wgEmpty(gp)) { try { benchNote71('init.applyWeeklyGates', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tWG0 : 0), 1); } catch(e){} return; }
            var minObs = CFG.poolMinGateObs > 0 ? CFG.poolMinGateObs : 20;
            var clampF = CFG.poolGateClamp >= 1.2 ? CFG.poolGateClamp : 2;
            wgSetGate(CFG, 'maxSpread',    gp.sp,  80, 1.3, clampF, minObs, 1,   40, 1);
            wgSetGate(CFG, 'maxCostRT',    gp.cr,  80, 1.3, clampF, minObs, 0.5, 30, 1);
            wgSetGate(CFG, 'maxIvPremium', gp.ivp, 60, 1,   clampF, minObs, 2,   60, 1, 2);
            wgSetGate(CFG, 'volFloor',     gp.vr,  10, 0.8, clampF, minObs, 5,   120, 0);
            wgSetGate(CFG, 'volCeil',      gp.vr,  90, 1.3, clampF, minObs, 60,  300, 0);
            wgSetGate(CFG, 'minTno',       gp.tn,  20, 0.5, clampF, minObs, 1,   200, 0);
            wgSetGate(CFG, 'minTvol',      gp.tv,  20, 0.5, clampF, minObs, 1,   1000000, 0);
            wgSetGate(CFG, 'maxLeverage',  gp.lev, 90, 1.2, clampF, minObs, 2,   100, 0);
            if (CFG.volCeil <= CFG.volFloor) CFG.volCeil = CFG.volFloor + 20;
            WG.gatesCache = WG.gatesApplied; WG.gatesDone = WG.idx;
            WG.gatesAt = Date.now();
            try { benchCount71('weeklyGates-miss',1); benchNote71('init.applyWeeklyGates', (typeof performance !== 'undefined' && performance.now ? performance.now() - _tWG0 : 0), 1); } catch(e){}
        } catch (e) { try { benchNote71('init.applyWeeklyGates',0,1); } catch(e2){} }
    }
    function wgSetGate(CFG, key, pool, pct, margin, clampF, minObs, hardFloor, hardCeil, decimals, addConst) {
        try {
            if (!pool || pool.length < minObs) return;
            if (WG.userKeys && WG.userKeys[key]) return;      // تصمیمِ صریحِ کاربر ارجح است
            var st = WG.staticG[key];
            if (!(st > 0)) return;
            var raw = wgPct(pool, pct) * margin + (addConst || 0);
            if (!isFinite(raw) || !(raw > 0)) return;
            var val = Math.max(st / clampF, Math.min(st * clampF, raw));
            val = Math.max(hardFloor, Math.min(hardCeil, val));
            val = (decimals === 0) ? Math.round(val) : Math.round(val * 10) / 10;
            CFG[key] = val;
            if (!WG.gatesApplied) WG.gatesApplied = {};
            WG.gatesApplied[key] = val;
        } catch (e) {}
    }

    function wgEffPrice(orig, bn) {
        if (CONFIG.basePrices[orig] > 0) {
            var SP = CONFIG.basePrices[orig];
            var src = (WG && WG.userKeys && WG.userKeys['basePrices']) ? 'user'
                    : (WG && WG.applied && WG.applied[bn] && WG.applied[bn].p) ? 'weekly' : 'static';
            if (!(WG && WG.userKeys && WG.userKeys['basePrices']) && CONFIG.useLiveBase && !isBacktest()) {
                var code0 = (CONFIG.baseInsCodes || {})[bn] || (CONFIG.baseInsCodes || {})[orig];
                if (code0) {
                    fetchLiveBase(bn, code0);
                    var st0 = livePxStore(), h0 = st0 && st0[bn];
                    if (h0 && h0.px > 0 && (Date.now() - h0.t) < Math.max(30000, CONFIG.liveBaseMaxAge)) {
                        var cl0 = CONFIG.poolClamp >= 1.5 ? CONFIG.poolClamp : 3;
                        if (SP <= 0 || (h0.px / SP >= 1 / cl0 && h0.px / SP <= cl0)) return { S: h0.px, src: 'live' };
                    }
                }
            }
            return { S: SP, src: src };
        }
        var ls = wgLiveS(bn);
        if (ls > 0) return { S: ls, src: 'live' };
        return { S: 0, src: '' };
    }
    function resolveBase(nName) {
        var b = '', kk;
        try {
            var best71b = 0;   // v9.5.3: بلندترین تطابق — «فولادآلیاژی» بر «فولاد» ببرد (ترتیبِ keys تضمینی نیست)
            for (kk in CONFIG.basePrices) {
                if (!Object.prototype.hasOwnProperty.call(CONFIG.basePrices, kk)) continue;
                var pk71 = norm(kk);
                if (pk71 && nName.indexOf(pk71) > -1 && pk71.length > best71b) { b = kk; best71b = pk71.length; }
            }
            if (!b) b = wgBaseFromName(nName) || '';
            if (!b) return { S: 0, base: '', src: '' };
            var bn = norm(b);
            var eff = wgEffPrice(b, bn);
            return { S: eff.S, base: (eff.S > 0 && CONFIG.basePrices[b] > 0) ? b : bn, src: eff.src };
        } catch (e) { return { S: 0, base: b, src: '' }; }
    }
    function resolveCS(base) {
        try {
            if (base) {
                var bn = norm(base);
                if (CONFIG.contractSizes && CONFIG.contractSizes[base] > 0) return CONFIG.contractSizes[base];
                if (CONFIG.contractSizes && CONFIG.contractSizes[bn] > 0) return CONFIG.contractSizes[bn];
                if (!(WG && WG.userKeys && WG.userKeys['contractSizes'])) {
                    var lc = wgLiveCS(bn);
                    if (lc > 0) return lc;
                }
            }
            if (CONFIG.strictContractSize) return 0;
        } catch (e) { if (CONFIG.strictContractSize) return 0; }
        return CONFIG.contractSize > 0 ? CONFIG.contractSize : 1;
    }

    function wgTable() {
        var bases = {}, kk;
        for (kk in CONFIG.basePrices) if (Object.prototype.hasOwnProperty.call(CONFIG.basePrices, kk)) bases[norm(kk)] = kk;
        if (WG) {
            for (kk in WG.staticP) if (Object.prototype.hasOwnProperty.call(WG.staticP, kk) && !bases[norm(kk)]) bases[norm(kk)] = kk;
            for (kk in WG.applied) if (Object.prototype.hasOwnProperty.call(WG.applied, kk) && !bases[kk]) bases[kk] = kk;
            var wk = WG.weeks[String(WG.idx)];
            if (wk && wk.u) for (kk in wk.u) if (Object.prototype.hasOwnProperty.call(wk.u, kk) && !bases[kk]) bases[kk] = kk;
        }
        var out = [];
        for (var bn in bases) {
            if (!Object.prototype.hasOwnProperty.call(bases, bn)) continue;
            var orig = bases[bn];
            var eff = { S: 0, src: '' };
            try { eff = wgEffPrice(orig, bn); } catch (e) {}
            var wkC = WG && WG.weeks[String(WG.idx)];
            var uu = (wkC && wkC.u && wkC.u[bn]) || null;
            var stP = (WG && WG.staticP && WG.staticP[orig] > 0) ? WG.staticP[orig] : 0;
            var volEff = CONFIG.baseVol[orig] > 0 ? CONFIG.baseVol[orig] : (CONFIG.baseVol[bn] > 0 ? CONFIG.baseVol[bn] : 0);
            out.push({
                base: orig,
                price: eff.S,
                src: eff.src,
                delta: (eff.S > 0 && stP > 0 && eff.S !== stP) ? Math.round((eff.S - stP) / stP * 1000) / 10 : null,
                vol: volEff,
                cs: resolveCS(bn),
                n: uu ? ((uu.s ? uu.s.length : 0) + (uu.v ? uu.v.length : 0) + (uu.c ? uu.c.length : 0)) : 0
            });
        }
        out.sort(function (xx, yy) { return xx.base < yy.base ? -1 : (xx.base > yy.base ? 1 : 0); });
        return out.slice(0, 40);
    }
    function wgGateTable() {
        var out = [], gi;
        for (gi = 0; gi < WG_GATES.length; gi++) {
            var key = WG_GATES[gi][0];
            var src = (WG && WG.userKeys && WG.userKeys[key]) ? 'user'
                    : (WG && WG.gatesApplied && WG.gatesApplied[key] !== undefined) ? 'weekly' : 'static';
            out.push({ key: key, label: WG_GATES[gi][1], value: CONFIG[key], src: src });
        }
        return out;
    }

    function buildPanel() {
        try {
            if (typeof window === 'undefined' || !window) return;
            if (window.__opt71NoDom) { try { delete window.__opt71NoDom; } catch(e){ window.__opt71NoDom=false; } }
            // v9.6.0.7 fix: always clean up old panels from DOM to avoid duplicate id querySelector bug
            try {
                var oldPanels = document.querySelectorAll('[data-stamp^="v"][data-stamp$="b"]');
                for (var opi=0; opi<oldPanels.length; opi++) {
                    var op = oldPanels[opi];
                    if (op && op.id !== '__opt71Panel' && op.getAttribute('data-stamp') !== VERSION_TAG + 'b') {
                        try { if (op.parentNode) op.parentNode.removeChild(op); } catch(e){}
                    }
                }
                // Also remove any element with id __opt71Panel if exists but reference is null
                var oldById = document.getElementById('__opt71Panel');
                if (oldById && !window.__opt71Panel) {
                    try { if (oldById.parentNode) oldById.parentNode.removeChild(oldById); } catch(e){}
                }
            } catch(e){}
            if (window.__opt71Panel) {                 // v7.1: پنلِ کهنه (مُهرِ متفاوت) → بازسازی
                var pStaleB71 = true;
                try { pStaleB71 = !(window.__opt71Panel.getAttribute && window.__opt71Panel.getAttribute('data-stamp') === VERSION_TAG + 'b'); } catch (eSB71) {}
                if (!pStaleB71) return;
                try { if (window.__opt71Panel.parentNode) window.__opt71Panel.parentNode.removeChild(window.__opt71Panel); } catch (eRB71) {}
                window.__opt71Panel = null;
            }
            if (typeof document === 'undefined' || !document || !document.createElement) {
                return;      // محیطِ بدون DOM (مثلاً worker)
            }
            if (!document.body) {
                // Retry if body not ready
                try { if (!window.__opt71PanelRetry) { window.__opt71PanelRetry=1; setTimeout(function(){ try { buildPanel(); bar71(); } catch(e){} }, 800); } } catch(e){}
                return;                // هنوز آماده نیست → رفرشِ بعد دوباره
            }
            var ST = optStore();
            if (!ST) return;
            var DEF = window.__opt71Def || {};
            var res = optOverrides();
            var el = document.createElement('div');
            el.setAttribute('dir', 'rtl');
            el.style.cssText = 'position:fixed;bottom:36px;left:8px;z-index:2147483647;width:350px;' +
                'max-height:70vh;overflow:auto;background:#1e2430;color:#dfe6f1;border:1px solid #3a4356;' +
                'border-radius:8px;padding:8px 10px;font:11px/2 Tahoma,Verdana,sans-serif;text-align:right;';
            var OPT_MAP = {}, om;
            for (om = 0; om < OPT_KEYS.length; om++) OPT_MAP[OPT_KEYS[om][0]] = OPT_KEYS[om];
            var eff = function (k9) {
                return (res && res.ov && Object.prototype.hasOwnProperty.call(res.ov, k9)) ? res.ov[k9] : DEF[k9];
            };
            var html = '<div id="__opt71Hdr" style="cursor:pointer;font-weight:bold;color:#8ecbff;">' +
                '⚙ تنظیماتِ فیلترِ اختیار (' + verLabel71() + ') <span style="float:left;">−</span></div><div id="__opt71Body">';
            var si, ki, sec, secKeys, key, lab, meta;
            var sectionGuide949 = [
                'تاریخ سررسید و دید بازار، افق نگهداری و جهت حرکت مورد انتظار را تعیین می‌کنند.',
                'minExpRet حداقل بازده پس از جریمه DTE است؛ سقف گروه و سقف کل تعداد خروجی را محدود می‌کنند.',
                'این مقادیر سخت‌گیری گیت‌های حجم، معامله، اسپرد، هزینه، عمق و اهرم را تعیین می‌کنند.',
                'اولویت اندازه قرارداد: تنظیم دستی، سپس استخر معتبر، سپس مقدار ثابت مجاز.',
                'روز JavaScript: 0=یکشنبه، 1=دوشنبه، 2=سه‌شنبه، 3=چهارشنبه، 4=پنج‌شنبه، 5=جمعه، 6=شنبه؛ بورس تهران: 0,1,2,3,6. مصرف: inSession، poolState940 و wgShouldObserve71 برای تشخیص روز/ساعت بازار.',
                'دوره محاسبه، عمر کش و مسیر سریع بر سرعت و دقت محاسبه اثر می‌گذارند.',
                'منبع قیمت پایه، EWMA، عمق دفتر، روند خودکار و گیت‌های توقف و صف در این بخش تنظیم می‌شوند.',
                'امتیاز، IV Rank، ADX و پیشنهاد ورود و حد ضرر و حد سود در این بخش کنترل می‌شوند.',
                'تنظیمات چندسررسیدی، محدودیت ردیف‌ها و پنجره تحلیل در این بخش قرار دارند.',
                'تبعی، مدیریت پوزیشن، لاگ، دیباگ و حالت بک‌تست در این بخش تنظیم می‌شوند.'
            ];
            for (si = 0; si < PANEL_SECTIONS.length; si++) {
                sec = PANEL_SECTIONS[si]; secKeys = sec[1];
                html += '<div' + (sec[2] ? ' id="__opt71Sec' + si + 'Hdr"' : '') +
                    ' style="cursor:pointer;color:#8ecbff;font-weight:bold;border-bottom:1px solid #3a4356;' +
                    'margin-top:4px;padding-bottom:1px;">' + sec[0] +
                    (sec[2] ? ' <span style="float:left;">…</span>' : '') + '</div>';
                if (sec[2]) html += '<div id="__opt71Sec' + si + '" style="display:' + (sec[3] ? '' : 'none') + ';">';   // بخشِ جمع‌شونده؛ sec[3]=باز در شروع
                for (ki = 0; ki < secKeys.length; ki++) {
                    key = secKeys[ki]; meta = OPT_MAP[key] || [];
                    lab = meta[1] || key;
                    var isBool940 = typeof DEF[key] === 'boolean';
                    var safeVal940 = esc71(eff(key));
                    var control940 = isBool940
                        ? '<input type="checkbox" id="__opt71I_' + key + '"' + (eff(key) ? ' checked' : '') + ' style="width:18px;height:18px;accent-color:#2d8cff;cursor:pointer;" aria-label="' + esc71(lab) + '">'
                        : '<input id="__opt71I_' + key + '" value="' + safeVal940 + '" style="width:95px;background:#12161f;color:#fff;border:1px solid #3a4356;border-radius:4px;padding:1px 4px;font:11px Tahoma;text-align:center;">';
                    html += '<div style="display:flex;gap:6px;align-items:center;"><label for="__opt71I_' + key + '" style="flex:1;cursor:pointer;">' + lab + '</label>' + control940 + '</div>';                }
                if (sectionGuide949[si]) html += '<div style="color:#8fa3c8;font:10px/1.8 Tahoma;padding:3px 2px 5px;border-bottom:1px dashed #3a4356;">راهنما: ' + sectionGuide949[si] + '</div>';
                if (sec[2]) html += '</div>';
            }
            html += '<details style="border-top:1px solid #3a4356;margin-top:4px;padding-top:4px;color:#dfe6f1;">' +
                '<summary style="cursor:pointer;color:#8ecbff;">وضعیت و مقادیر محاسبه‌شدهٔ استخر</summary>' +
                '<div id="__opt71PoolRO" style="padding:4px 2px;">محاسبه‌شده از استخر: در انتظارِ اولین رفرش…</div>' +
                '</details>';
            html += '<div style="margin-top:6px;display:flex;gap:6px;">' +
                '<button id="__opt71X" style="flex:0 0 40px;background:#6b2737;color:#fff;border:0;' +
                'border-radius:4px;padding:4px;cursor:pointer;font:11px Tahoma;">✕ بستن</button>' +
                '<button id="__opt71Pop" style="flex:1;background:#7a4ddf;color:#fff;border:0;' +
                'border-radius:4px;padding:4px;cursor:pointer;font:11px Tahoma;">📊 تحلیل</button>' +
                '<button id="__opt71Apply" style="flex:1;background:#2d6cdf;color:#fff;border:0;' +
                'border-radius:4px;padding:4px;cursor:pointer;font:11px Tahoma;">اعمال</button>' +
                '<button id="__opt71Reset" style="flex:1;background:#444c5e;color:#fff;border:0;' +
                'border-radius:4px;padding:4px;cursor:pointer;font:11px Tahoma;">پیش‌فرض</button></div>' +
                '<div style="margin-top:6px;display:flex;gap:6px;align-items:center;">' +
                '<button id="__opt71Top25" style="background:#2d6e4f;color:#fff;border:0;border-radius:4px;' +
                'padding:3px 8px;cursor:pointer;font:11px Tahoma;">🎯 قانونِ top 25</button>' +
                '<span style="flex:1;color:#8fa3c8;font:11px Tahoma;">راهنما: سقفِ کل ۲۵ + tie-break (v9.0.4)</span></div>' +
                '<div id="__opt71Msg" style="color:#ffd479;min-height:16px;"></div>' +
                '<details style="border-top:1px solid #3a4356;margin-top:4px;padding-top:4px;color:#8fa3c8;"><summary style="cursor:pointer;color:#8ecbff;">وضعیت اجرای فیلتر</summary><div id="__opt71Stat">در انتظارِ اولین رفرش…</div></details>' +
                '<div style="margin-top:4px;padding-top:3px;border-top:1px dashed #3a4356;">' +
                '<a href="' + 'https://t.me/p75ad' + '" target="_blank" rel="noopener" ' +
                'style="color:#8ecbff;text-decoration:none;font-weight:bold;">✈ نویسنده: t.me/p75ad</a></div></div>';
            el.setAttribute('data-stamp', VERSION_TAG + 'b');
            el.innerHTML = html;
            document.body.appendChild(el);
            window.__opt71Panel = el;
            window.__opt71StatusEl = el.querySelector('#__opt71Stat');
            window.__opt71PoolRO = el.querySelector('#__opt71PoolRO');

            var popBtn71 = el.querySelector('#__opt71Pop');
            if (popBtn71) popBtn71.onclick = function () { try { window.__opt71PopReady = !!(window.__opt71PopRows && window.__opt71PopRows.length); popupOpen71(); } catch (ePB71) {} };
            var xBtn71 = el.querySelector('#__opt71X');
            if (xBtn71) {
                xBtn71.addEventListener('click', function(e){ try { e.stopPropagation(); el.style.display = 'none'; } catch (eX71) {} });
            }
            var t25Btn71 = el.querySelector('#__opt71Top25');   // v9.0.4: قانونِ top 25
            if (t25Btn71) t25Btn71.onclick = function () {
                try {
                    var oc71 = {}, erM71 = false;
                    try { oc71 = window.optCfg ? (window.optCfg() || {}) : {}; } catch (eO71) {}
                    erM71 = !oc71.useScore || oc71.c0Mode === 'er';   // v9.0.7: در er-mode tie-break بی‌اثر است
                    var r1 = window.optSet('maxTotalRows', 25);
                    var r2 = erM71 ? '✔' : window.optSet('c0Tiebreak', true);
                    var m71 = el.querySelector('#__opt71Msg');
                    if (String(r1).indexOf('✔') !== 0 || String(r2).indexOf('✔') !== 0) {
                        if (m71) m71.textContent = 'قانونِ top 25 اعمال نشد: ' + String(r1) + ' / ' + String(r2);
                        return;
                    }
                    var i1 = el.querySelector('#__opt71I_maxTotalRows'); if (i1) i1.value = '25';
                    var i2 = el.querySelector('#__opt71I_c0Tiebreak'); if (!erM71 && i2) { if (i2.type === 'checkbox') i2.checked = true; else i2.value = 'true'; }
                    if (m71) m71.textContent = erM71 ? '✔ سقفِ ۲۵ اعمال شد — tie-break در حالتِ er بی‌اثر است' : '✔ قانونِ top 25 اعمال شد (سقفِ ۲۵ + tie-break)';
                } catch (eT25) {}
            };
            el.querySelector('#__opt71Hdr').onclick = function () {
                var body = el.querySelector('#__opt71Body');
                body.style.display = (body.style.display === 'none') ? '' : 'none';
            };
            var sc;
            for (sc = 0; sc < PANEL_SECTIONS.length; sc++) {
                if (!PANEL_SECTIONS[sc][2]) continue;
                (function (sI) {
                    var h = el.querySelector('#__opt71Sec' + sI + 'Hdr'), b = el.querySelector('#__opt71Sec' + sI);
                    if (h && b) h.onclick = function () { b.style.display = (b.style.display === 'none') ? '' : 'none'; };
                })(sc);
            }
            el.querySelector('#__opt71Apply').onclick = function () {
                var ov = {}, errs = [];
                for (var j = 0; j < OPT_KEYS.length; j++) {
                    var key2 = OPT_KEYS[j][0], tag2 = OPT_KEYS[j][3];
                    if (OPT_KEYS[j][2] === 'obj' || tag2) continue;   // فقط ورودی‌های پنل
                    var inp = el.querySelector('#__opt71I_' + key2);
                    if (!inp) continue;
                    var raw = inp.type === 'checkbox' ? inp.checked : inp.value, val2;
                    if (typeof DEF[key2] === 'boolean') {
                        val2 = !!inp.checked;
                    } else if (OPT_KEYS[j][2] === 'str') {                   // v6: تاریخِ سررسید
                        val2 = String(raw).replace(/\s+/g, '');
                        if (!resolveExpiry({ expiryDate: val2 })) { errs.push(key2); continue; }
                    } else if (OPT_KEYS[j][2] === 'days') {
                        val2 = parseDaysInput71(raw);
                        if (!val2) { errs.push(key2 + ' (۰…۶)'); continue; }
                    } else if (OPT_KEYS[j][2] === 'hol') {
                        val2 = parseHolidaysInput71(raw);
                        if (!val2) { errs.push(key2 + ' (تاریخ جلالی)'); continue; }
                    } else {
                        val2 = parseFloat(raw);
                        if (!isFinite(val2)) { errs.push(key2); continue; }
                        if (key2 === 'poolDays' && (val2 < 7 || val2 > 30)) { errs.push('poolDays (۷…۳۰)'); continue; }
                    }
                    if (val2 !== DEF[key2]) ov[key2] = val2;
                }
                var msg = el.querySelector('#__opt71Msg');
                if (errs.length) { msg.textContent = '⚠ مقدارِ نامعتبر: ' + errs.join('، '); return; }
                var ver = parseInt(ST.get(OPT_VER_KEY), 10);
                if (!(ver >= 0)) ver = 0;
                ST.set(OPT_CFG_KEY, JSON.stringify(ov));
                ST.set(OPT_VER_KEY, String(ver + 1));
                try { if (window.__opt71PopRows) window.__opt71PopRows.length = 0; window.__opt71PopReady = false; } catch (ePC71) {}
                window.__opt71Cfg = null;                // اجرای بعدی دوباره parse می‌کند
                try { wgUiTick(true); popRender71(); } catch (eAR71) {}   // v7.1: RO/استخر/تحلیلِ فوری
                var cnt = 0, k3;
                for (k3 in ov) if (Object.prototype.hasOwnProperty.call(ov, k3)) cnt++;
                msg.textContent = cnt ? ('✔ ' + cnt + ' کلید ذخیره شد — از رفرشِ بعدی اعمال می‌شود')
                                      : '✔ ذخیره شد (همه = پیش‌فرض)';
            };
            el.querySelector('#__opt71Reset').onclick = function () {
                ST.del(OPT_CFG_KEY);
                ST.del(OPT_VER_KEY);
                try { if (window.__opt71PopRows) window.__opt71PopRows.length = 0; window.__opt71PopReady = false; } catch (ePR71) {}
                window.__opt71Cfg = null;
                for (var j2 = 0; j2 < OPT_KEYS.length; j2++) {
                    var key4 = OPT_KEYS[j2][0];
                    var inp2 = el.querySelector('#__opt71I_' + key4);
                    if (inp2 && Object.prototype.hasOwnProperty.call(DEF, key4)) { if (inp2.type === 'checkbox') inp2.checked = !!DEF[key4]; else inp2.value = String(DEF[key4]); }
                }
                el.querySelector('#__opt71Msg').textContent = '✔ به پیش‌فرض برگشت — از رفرشِ بعدی';
            };
        } catch (e) {
            try { console.warn('buildPanel error', e && e.message ? e.message : e, e && e.stack ? e.stack : ''); } catch(e3){}
            try { if (typeof window !== 'undefined' && window) window.__opt71Panel = null; } catch (e2) {}
        }
    }

    function buildWeekPanel() {
        try {
            if (typeof window === 'undefined' || !window) return;
            if (window.__opt71NoDom) { try { delete window.__opt71NoDom; } catch(e){ window.__opt71NoDom=false; } }
            try {
                var oldW = document.querySelectorAll('[data-stamp^="v"][data-stamp$="w"]');
                for (var owi=0; owi<oldW.length; owi++) {
                    var ow = oldW[owi];
                    if (ow && ow.getAttribute('data-stamp') !== VERSION_TAG + 'w') {
                        try { if (ow.parentNode) ow.parentNode.removeChild(ow); } catch(e){}
                    }
                }
            } catch(e){}
            if (window.__opt71WeekPanel) {             // v7.1: پنلِ کهنه → بازسازی
                var pStaleW71 = true;
                try { pStaleW71 = !(window.__opt71WeekPanel.getAttribute && window.__opt71WeekPanel.getAttribute('data-stamp') === VERSION_TAG + 'w'); } catch (eSW71) {}
                if (!pStaleW71) return;
                try { if (window.__opt71WeekPanel.parentNode) window.__opt71WeekPanel.parentNode.removeChild(window.__opt71WeekPanel); } catch (eRW71) {}
                window.__opt71WeekPanel = null;
            }
            if (typeof document === 'undefined' || !document || !document.createElement) {
                window.__opt71NoDom = true; return;
            }
            if (!document.body) return;
            var el = document.createElement('div');
            el.setAttribute('dir', 'rtl');
            el.style.cssText = 'position:fixed;bottom:36px;left:366px;z-index:2147483647;width:430px;' +
                'max-height:70vh;overflow:auto;background:#1e2430;color:#dfe6f1;border:1px solid #3a4356;' +
                'border-radius:8px;padding:8px 10px;font:11px/1.9 Tahoma,Verdana,sans-serif;text-align:right;';
            el.innerHTML = '<div id="__opt71WkHdr" style="cursor:pointer;font-weight:bold;color:#9fe0a8;">' +
                '📅 استخرِ <span id="__opt71WkDays"></span>روزه — پایه‌ها و گیت‌های بهینه از پنجرهٔ گذشته <span style="float:left;">−</span></div>' +
                '<div id="__opt71WkBody"><div id="__opt71WkT">در انتظارِ اولین رفرش…</div>' +
                '<div style="margin-top:4px;display:flex;gap:6px;align-items:center;">' +
                '<button id="__opt71WkX" style="background:#6b2737;color:#fff;border:0;border-radius:4px;' +
                'padding:3px 8px;cursor:pointer;font:11px Tahoma;">✕ بستن</button>' +
                '<button id="__opt71WkReset" style="background:#444c5e;color:#fff;border:0;border-radius:4px;' +
                'padding:3px 8px;cursor:pointer;font:11px Tahoma;">بازنشانیِ استخر</button>' +
                '<span id="__opt71WkF" style="color:#8fa3c8;flex:1;"></span></div></div>';
            el.setAttribute('data-stamp', VERSION_TAG + 'w');
            document.body.appendChild(el);
            window.__opt71WeekPanel = el; wireTopWindow71(el);
            window.__opt71WeekTbl = el.querySelector('#__opt71WkT');    // مرجعِ پایدار (تست‌پذیر)
            window.__opt71WkDays = el.querySelector('#__opt71WkDays');
            window.__opt71WeekFoot = el.querySelector('#__opt71WkF');
            var wxBtn71 = el.querySelector('#__opt71WkX');
            if (wxBtn71) {
                wxBtn71.type = 'button';
                var hideWeek71 = function(){ try { el.style.display = 'none'; } catch (eWX71) {} };
                try { bind71(wxBtn71, function(){ hideWeek71(); }); } catch(e){}
            }
            window.__opt71WeekReset = wgReset;
            el.querySelector('#__opt71WkHdr').onclick = function () {
                var body = el.querySelector('#__opt71WkBody');
                body.style.display = (body.style.display === 'none') ? '' : 'none';
            };
            el.querySelector('#__opt71WkReset').onclick = function () {
                var btn71 = this;
                if (btn71.getAttribute('data-armed') === '1') {
                    btn71.setAttribute('data-armed', '0');
                    btn71.textContent = 'بازنشانیِ استخر';
                    wgReset();
                    return;
                }
                btn71.setAttribute('data-armed', '1');
                btn71.textContent = '⚠ مطمئنید؟ کلیکِ دوم = پاک';
                setTimeout(function () {
                    if (btn71.getAttribute('data-armed') === '1') {
                        btn71.setAttribute('data-armed', '0');
                        btn71.textContent = 'بازنشانیِ استخر';
                    }
                }, 4000);
            };
            wgUiTick(true);
        } catch (e) {
            try { if (typeof window !== 'undefined' && window) window.__opt71WeekPanel = null; } catch (e2) {}
        }
    }
    function wgFmt(xx) { return String(Math.round(xx * 100) / 100); }
    function wgSrcTag(src) {
        if (src === 'user')   return '<span style="color:#ffd479;">کاربر</span>';
        if (src === 'weekly') return '<span style="color:#9fe0a8;">استخر</span>';
        if (src === 'live')   return '<span style="color:#8ecbff;">زنده</span>';
        if (src === 'static') return '<span style="color:#8fa3c8;">ثابت</span>';
        return '—';
    }
    // ⚠ Side-effect: this evaluator sets __wgPoolWarningState71 for wgPoolWarningVisible71.
    // Tests/debug callers should account for that state mutation.
    function wgPoolWarning71() {
        try {
            if (isBacktest()) {
                __wgPoolWarningState71 = 'backtest';
                return '⚠ ثبتِ استخر در بک‌تست غیرفعال است — optSet("backtestMode", false)';
            }
            if (!CONFIG.poolAuto) {
                __wgPoolWarningState71 = 'pool-off';
                return '⚠ استخر خاموش است — برای به‌روزرسانی optSet("poolAuto", true)';
            }
            if (!CONFIG.poolGates) {
                __wgPoolWarningState71 = 'gates-off';
                return '';
            }
            if (!WG) {
                __wgPoolWarningState71 = 'not-ready';
                return '⚠ استخر هنوز مقداردهی نشده — یک ردیفِ معتبر در ساعتِ بازار لازم است';
            }
            // A non-empty, recent gates cache is already actionable; do not report stale pool counts
            // while the conservative gate values are still being used by applyWeeklyGates.
            if (WG.gatesCache && !wgEmpty(WG.gatesCache) && WG.gatesDone === WG.idx && WG.gatesAt > 0 &&
                (Date.now() - WG.gatesAt) < 1800000) {
                __wgPoolWarningState71 = 'gates-cache';
                return '';
            }
            var gp71 = wgPoolG(), min71 = +CONFIG.poolMinGateObs > 0 ? Math.round(+CONFIG.poolMinGateObs) : 20;
            var need71 = ['sp', 'tn', 'tv', 'cr', 'ivp', 'lev', 'vr'], missing71 = [], missingKey71 = [], i71, n71;
            for (i71 = 0; i71 < need71.length; i71++) {
                n71 = gp71 && gp71[need71[i71]] ? gp71[need71[i71]].length : 0;
                if (n71 < min71) {
                    missing71.push(need71[i71] + ' ' + n71 + '/' + min71);
                    missingKey71.push(need71[i71]);
                }
            }
            if (!missing71.length) {
                __wgPoolWarningState71 = 'ready';
                return '';
            }
            __wgPoolWarningState71 = 'insufficient|' + missingKey71.join(',') + '|min:' + min71 +
                '|cad:' + (CONFIG.poolPreGateEveryScan === false ? 'sparse' : 'every-scan');
            return '⚠ دادهٔ استخر برای گیت‌ها کافی نیست: ' + missing71.join('، ') +
                (CONFIG.poolPreGateEveryScan === false
                    ? ' — برای پرشدن سریع‌تر optSet("poolPreGateEveryScan", true)'
                    : ' — در حال جمع‌آوری؛ poolAuto=true و backtestMode=false را بررسی کنید');
        } catch (e) {
            __wgPoolWarningState71 = 'warning-error';
            return '';
        }
    }

    function wgPoolWarningVisible71(raw71) {
        try {
            var now71 = Date.now(), state71 = __wgPoolWarningState71 || 'unknown';
            if (state71 !== __wgPoolWarningViewState71) {
                __wgPoolWarningViewState71 = state71;
                __wgPoolWarningViewSince71 = now71;
            }
            if (!raw71) return '';
            // Warmup/state notice: show a new warning for 30 seconds, then keep the footer quiet
            // until the state changes (the raw diagnostic remains available for tests/debugging).
            return (now71 - __wgPoolWarningViewSince71) <= 30000 ? raw71 : '';
        } catch (e) { return raw71 || ''; }
    }

    function wgUiTick(force) {
        try {
            if (typeof window === 'undefined' || !window || !window.__opt71WeekTbl) return;
            var now = Date.now();
            if (!force && window.__opt71WkTick && (now - window.__opt71WkTick) < 2000) return;
            window.__opt71WkTick = now;
            var tbl = wgTable(), it;
            var html = '<table style="width:100%;border-collapse:collapse;font:11px Tahoma;">' +
                '<tr style="color:#8ecbff;border-bottom:1px solid #3a4356;"><th>نماد</th>' +
                '<th>قیمتِ پایه</th><th>منبع</th><th>Δ٪</th><th>نوسان</th><th>قرارداد</th><th>مشاهده</th></tr>';
            for (it = 0; it < tbl.length; it++) {
                var tt = tbl[it];
                html += '<tr style="border-bottom:1px solid #2a3140;"><td>' + esc71(tt.base) + '</td><td>' +
                    (tt.price > 0 ? wgFmt(tt.price) : '—') + '</td><td>' + wgSrcTag(tt.src) + '</td><td>' +
                    (tt.delta === null ? '—' : (tt.delta > 0 ? '+' : '') + tt.delta + '٪') + '</td><td>' +
                    (tt.vol > 0 ? tt.vol + '٪' : '—') + '</td><td>' + wgFmt(tt.cs) + '</td><td>' + tt.n + '</td></tr>';
            }
            html += '</table>';
            var gt = wgGateTable(), ig;
            html += '<div style="color:#9fe0a8;margin-top:4px;border-top:1px solid #3a4356;padding-top:2px;">' +
                'گیت‌های بهینه از استخر:</div>';
            for (ig = 0; ig < gt.length; ig++) {
                html += '<span style="margin-left:8px;white-space:nowrap;">' + gt[ig].label + ': <b>' +
                    wgFmt(gt[ig].value) + '</b> ' + wgSrcTag(gt[ig].src) + '</span>';
                if (ig % 3 === 2) html += String.fromCharCode(60) + 'br>';
            }
            window.__opt71WeekTbl.innerHTML = html;
            if (window.__opt71WkDays) window.__opt71WkDays.textContent = String(poolEffDays());
            if (window.__opt71WeekFoot) {
                var footTxt71 = 'پنجرهٔ استخر: ' + wgPoolLabel(now) +
                    (WG && WG.appliedN ? ' · پیش‌فرض از استخر: ' + WG.appliedN + ' نماد' : '') +
                    (WG && WG.lastFlushT ? ' · آخرین ذخیره: ' + new Date(WG.lastFlushT).toLocaleTimeString('fa-IR') : '');
                var resetNotice71 = !!(WG && WG.resetAt && now >= WG.resetAt && (now - WG.resetAt) < WG_RESET_NOTICE_MS71);
                var poolWarnRaw71 = wgPoolWarning71();
                var poolWarnVisible71 = wgPoolWarningVisible71(poolWarnRaw71);
                var poolWarn71 = resetNotice71 ? '' : poolWarnVisible71;
                if (typeof window !== 'undefined' && window) {
                    window.__opt71PoolWarning = poolWarn71 || '';
                    window.__opt71PoolWarningRaw = poolWarnRaw71 || '';
                }
                if (poolWarn71) footTxt71 = poolWarn71 + ' · ' + footTxt71;
                if (WG && WG.resetAt && now >= WG.resetAt && (now - WG.resetAt) < 60000) {
                    var resetAge71 = Math.max(0, Math.round((now - WG.resetAt) / 1000));
                    if (resetNotice71) {
                        footTxt71 = '✔ استخر بازنشانی شد · ' + new Date(WG.resetAt).toLocaleTimeString('fa-IR') +
                            ' — تا جمع‌شدنِ مشاهداتِ تازه، پایه‌ها و گیت‌ها «ثابت» است';
                    } else {
                        footTxt71 = '✔ استخر ' + resetAge71 + 's پیش بازنشانی شد · ' + footTxt71;
                    }
                }
                window.__opt71WeekFoot.textContent = footTxt71;
            }
            try {
                var ro = window.__opt71PoolRO;
                if (ro) {
                    var rh = '<div style="color:#9fe0a8;margin-top:4px;">محاسبه‌شده از استخر (فقط‌خواندنی):</div>';
                    for (ig = 0; ig < gt.length; ig++) {
                        rh += '<span style="margin-left:8px;white-space:nowrap;color:#dfe6f1;">' + gt[ig].label +
                            ': <b>' + wgFmt(gt[ig].value) + '</b> ' + wgSrcTag(gt[ig].src) + '</span>';
                        if (ig % 2 === 1) rh += String.fromCharCode(60) + 'br>';
                    }
                    rh += '<div style="color:#8fa3c8;margin-top:2px;">تغییرِ دستی: optSet در کنسول — اولویت: دستی ' + String.fromCharCode(38) + 'gt; استخر ' + String.fromCharCode(38) + 'gt; ثابت</div>';
                    ro.innerHTML = rh;
                }
            } catch (e2) {}
        } catch (e) {}
    }
    function wgReset() {
        try {
            if (isBacktest()) {
                if (typeof window !== 'undefined' && window && window.__opt71WeekFoot) {
                    window.__opt71WeekFoot.textContent = '⚠ بازنشانیِ استخر در بک‌تست غیرفعال است — optSet("backtestMode", false) و دوباره امتحان کنید';
                }
                return;
            }
            var ST = optStore();
            if (ST) { ST.del(WG_KEY); ST.del(WG_VER_KEY); }
            if (WG) {
                WG.weeks = {}; WG.pairs = {}; WG.applied = {}; WG.appliedN = 0;
                WG.gatesApplied = {}; WG.gatesCache = null; WG.gatesDone = 0;
                WG.ver = 0; WG.lastFlush = Date.now();
                WG.resetAt = Date.now();   // نشانِ پایدارِ بازنشانی برای UI
                var kr;
                if (WG.staticP && !(WG.userKeys && WG.userKeys['basePrices'])) {
                    CONFIG.basePrices = {};
                    for (kr in WG.staticP) if (Object.prototype.hasOwnProperty.call(WG.staticP, kr)) CONFIG.basePrices[kr] = WG.staticP[kr];
                }
                if (WG.staticV && !(WG.userKeys && WG.userKeys['baseVol'])) {
                    CONFIG.baseVol = {};
                    for (kr in WG.staticV) if (Object.prototype.hasOwnProperty.call(WG.staticV, kr)) CONFIG.baseVol[kr] = WG.staticV[kr];
                }
                if (!(WG.userKeys && WG.userKeys['contractSizes'])) CONFIG.contractSizes = {};
                if (WG.staticG) {
                    for (kr in WG.staticG) {
                        if (Object.prototype.hasOwnProperty.call(WG.staticG, kr) && !(WG.userKeys && WG.userKeys[kr])) CONFIG[kr] = WG.staticG[kr];
                    }
                }
            }
            try { if (typeof window !== 'undefined' && window) window.__opt71WDCache = null; } catch(e){}
            bumpModelEpoch();
            // Normal reset is a state transition: restart the warning visibility window on the next tick.
            // View state is reset as well because wgUiTick evaluates the raw state before rendering.
            __wgPoolWarningState71 = 'reset';
            __wgPoolWarningViewState71 = 'reset';
            __wgPoolWarningViewSince71 = 0;
            wgUiTick(true);
            // Set the confirmation after wgUiTick so its normal footer render cannot overwrite it.
            if (typeof window !== 'undefined' && window && window.__opt71WeekFoot) {
                var resetClock71 = new Date();
                window.__opt71WeekFoot.textContent = '✔ استخر بازنشانی شد · ' + resetClock71.toLocaleTimeString('fa-IR') +
                    ' — تا جمع‌شدنِ مشاهداتِ تازه، پایه‌ها و گیت‌ها «ثابت» است';
            }
        } catch (e) {}
    }

    function optWeekHelpers() {
        try {
            if (typeof window === 'undefined' || !window) return;
            if (window.__opt71BV === VERSION_TAG && window.optBase) return;   // v9.0.2
            window.optBase = function () {
                var now = btNow();   // v9.0.6: در بک‌تست تاریخِ بک‌تست، نه امروز
                return {
                    poolWindow: wgPoolLabel(now),
                    poolDays: poolEffDays(),
                    poolSource: (WG && WG.lastIdx) ? wgWeekLabel(WG.lastIdx) : 'هیچ — جدولِ ثابت',
                    applied: (WG && WG.applied) ? WG.applied : {},
                    gates: (WG && WG.gatesApplied) ? WG.gatesApplied : {},
                    gateTable: wgGateTable(),
                    table: wgTable()
                };
            };
        } catch (e) {}
    }


    function timedInit71(label, fn) {
        var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        try { fn(); } catch(e) { try { dbgWarn('init.' + label + ': ' + (e && e.message ? e.message : e), true); } catch(e2){} }
        try { benchNote71('startup.' + label, (typeof performance !== 'undefined' && performance.now ? performance.now() - t0 : 0), 1); } catch(e){}
    }
    timedInit71('applyOverrides', function(){ applyOverrides(CONFIG); });
    timedInit71('applyDerived', function(){ applyDerived(CONFIG); });
    timedInit71('applyWeeklyDefaults', function(){ applyWeeklyDefaults(CONFIG); });
    timedInit71('applyWeeklyGates', function(){ applyWeeklyGates(CONFIG); });
    loadRiskFreeAuto71();          // دادهٔ خودکارِ persisted پیش از امضای cache خوانده شود
    buildPanel();                  // پنل فقط در مرورگر و فقط یک بار ساخته می‌شود
    buildWeekPanel();              // 📅 جدولِ پایه‌های هفتگی — بیرون از لیستِ نتیجه
    buildDebugPanel();              // v9.5.3 — فقط در حالت debugPanel
    optHelpers();                  // optCfg / optSet / optReset روی کنسول
    optWeekHelpers();
    if (typeof window !== 'undefined' && window) {
        window.__opt71BV = VERSION_TAG;   // v9.0.3: mohr-e nosxe-ye snapshot-ha
    }
    bar71();                           // v7.1 — نوارِ ⚙ 📅 📊
    // v9.6.0.7: retry bar/panel for console-paste timing and force UI
    try {
        if (typeof window !== 'undefined' && window) {
            setTimeout(function(){ try { bar71(); } catch(e){} }, 1000);
            setTimeout(function(){ try { buildPanel(); buildWeekPanel(); bar71(); } catch(e){} }, 2000);
            window.optForceUI = function(){
                try { 
                    window.__opt71NoDom=false; 
                    // Remove old DOM nodes first to avoid duplicate id bug
                    try {
                        var allOld = document.querySelectorAll('[data-stamp^="v"]');
                        for (var ao=0; ao<allOld.length; ao++) {
                            var aoEl = allOld[ao];
                            try { if (aoEl && aoEl.parentNode) aoEl.parentNode.removeChild(aoEl); } catch(e){}
                        }
                        var idsToClean = ['__opt71Panel','__opt71Bar','__opt71WeekPanel','__opt71PipePanel','__opt71DbgPanel','__opt71InputBanner'];
                        for (var ici=0; ici<idsToClean.length; ici++) {
                            var elById = document.getElementById(idsToClean[ici]);
                            if (elById) { try { if (elById.parentNode) elById.parentNode.removeChild(elById); } catch(e){} }
                        }
                    } catch(e){}
                    window.__opt71Panel=null; 
                    window.__opt71Bar=null; 
                    window.__opt71WeekPanel=null;
                    window.__opt71PipePanel=null;
                    window.__opt71DbgPanel=null;
                    window.__opt71PanelRetry=0;
                    window.__opt71BarRetry=0;
                } catch(e){}
                var res={panel:false, bar:false, week:false, errors:[]};
                try { buildPanel(); res.panel=!!window.__opt71Panel; } catch(e){ res.errors.push('buildPanel:'+e.message); try { console.warn('buildPanel failed', e); } catch(e2){} }
                try { buildWeekPanel(); res.week=!!window.__opt71WeekPanel; } catch(e){ res.errors.push('buildWeekPanel:'+e.message); }
                try { bar71(); res.bar=!!window.__opt71Bar; } catch(e){ res.errors.push('bar71:'+e.message); }
                try { if (!res.bar) { var b=document.createElement('div'); b.id='__opt71BarFallback'; b.style.cssText='position:fixed;bottom:6px;left:8px;z-index:2147483647;background:#ff0000;color:#fff;padding:8px;border-radius:6px;'; b.textContent='⚠️ Fallback bar — panel:'+res.panel; document.body.appendChild(b); } } catch(e){}
                return res;
            };
            window.optShowIcons = window.optForceUI;
        }
    } catch(e){}


    var EXPIRY_RE = new RegExp(CONFIG.expiry);
    var SQRT_2PI  = 2.5066282746310002;
    var TRADING_DAYS_PER_YEAR = 250;

    // ═══════════════════════════════════════════════════════════════════
    //  ریاضیات پایه
    // ═══════════════════════════════════════════════════════════════════

    // تابع توزیع تجمعی نرمال — تقریب A&S 7.1.26 (خطا < 1.5e-7)
    function ncdf(x) {
        if (x > 8) return 1;
        if (x < -8) return 0;
        var t = 1 / (1 + 0.2316419 * (x < 0 ? -x : x));
        var d = 0.3989422804014327 * Math.exp(-x * x / 2);
        var p = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 +
                t * (-1.821255978 + t * 1.330274429))));
        return x > 0 ? 1 - p : p;
    }

    function bs(S, K, T, r, v, isCall) {
        if (!(S > 0) || !(K > 0) || !(T > 0) || !(v > 0)) {
            var intr = isCall ? Math.max(0, S - K) : Math.max(0, K - S);
            return [intr, isCall ? 1 : -1, 0, 0];
        }
        var sqT  = Math.sqrt(T);
        var d1   = (Math.log(S / K) + (r + v * v / 2) * T) / (v * sqT);
        var d2   = d1 - v * sqT;
        var disc = Math.exp(-r * T);
        var pdf1 = Math.exp(-d1 * d1 / 2) / SQRT_2PI;
        var price, delta, theta, vega;
        vega = S * pdf1 * sqT;
        if (isCall) {
            price = S * ncdf(d1) - K * disc * ncdf(d2);
            delta = ncdf(d1);
            theta = (-(S * pdf1 * v) / (2 * sqT) - r * K * disc * ncdf(d2)) / 365;
        } else {
            price = K * disc * ncdf(-d2) - S * ncdf(-d1);
            delta = ncdf(d1) - 1;
            theta = (-(S * pdf1 * v) / (2 * sqT) + r * K * disc * ncdf(-d2)) / 365;
        }
        return [price, delta, theta, vega];
    }

    function bsPriceOnly(S, K, T, r, v, isCall) {
        if (!(S > 0) || !(K > 0) || !(T > 0) || !(v > 0)) return isCall ? Math.max(0, S - K) : Math.max(0, K - S);
        var sqT = Math.sqrt(T), d1 = (Math.log(S / K) + (r + v * v / 2) * T) / (v * sqT), d2 = d1 - v * sqT;
        var disc = Math.exp(-r * T);
        return isCall ? S * ncdf(d1) - K * disc * ncdf(d2) : K * disc * ncdf(-d2) - S * ncdf(-d1);
    }

    function impliedVol(mkt, S, K, T, r, isCall) {
        if (!(mkt > 0) || !(S > 0) || !(K > 0) || !(T > 0)) return 0;
        var discK = K * Math.exp(-r * T);
        var lower = isCall ? Math.max(S - discK, 0) : Math.max(discK - S, 0);
        var upper = isCall ? S : discK;
        var eps = Math.max(1e-6, Math.abs(mkt) * 1e-4);
        if (mkt < lower - eps || mkt > upper + eps) return 0;
        var lo = 0.01, hi = 5.0, mid, px;
        var pxLo = bs(S, K, T, r, lo, isCall)[0];
        var pxHi = bs(S, K, T, r, hi, isCall)[0];
        if (mkt < pxLo - eps || mkt > pxHi + eps) return 0;
        var moneyness71 = Math.log(S / K);
        var parityMkt71 = isCall ? mkt : (mkt + S - K * Math.exp(-r * T));
        var seedBase71 = (parityMkt71 > 0 && S > 0) ? Math.sqrt(2 * Math.PI / Math.max(T, 0.01)) * parityMkt71 / S : 0;
        if (!(seedBase71 > 0) || !isFinite(seedBase71)) seedBase71 = 0.5 + Math.abs(moneyness71) / Math.max(2 * T, 0.02);
        var sig71 = Math.min(2.5, Math.max(0.08, seedBase71));
        var g71 = bs(S, K, T, r, sig71, isCall), it71 = 0;
        var priceTol71 = Math.max(1e-8, Math.abs(mkt) * 1e-6);
        while (it71++ < 8) {
            px = g71[0];
            var v71 = g71[3];
            if (!(v71 > 1e-9)) break;
            var d71 = px - mkt;
            if (Math.abs(d71) < priceTol71) break;
            sig71 -= d71 / v71;
            if (!(sig71 > lo) || sig71 >= hi) break;
            g71 = bs(S, K, T, r, sig71, isCall);
        }
        if (it71 <= 9 && sig71 > lo && sig71 < hi && Math.abs(g71[0] - mkt) < priceTol71) return sig71;
        for (var i = 0; i < 60; i++) {
            mid = (lo + hi) / 2;
            px  = bs(S, K, T, r, mid, isCall)[0];
            if (px < mkt) lo = mid; else hi = mid;
            if (hi - lo < 1e-6) break;
        }
        return (lo + hi) / 2;
    }

    var __ZW71z = null, __ZW71w = null;   // v9.5.3: ثابت‌های expectedReturn — در سطحِ ماژول
    function expectedReturn(S, K, T, r, v, isCall, ask, driftDaily, holdDays) {
        if (!(ask > 0)) return -100;
        var dSig = v / Math.sqrt(TRADING_DAYS_PER_YEAR);          // سیگمای روزانهٔ معاملاتی
        var Ttd  = Math.max(0, T * TRADING_DAYS_PER_YEAR);         // کل زمان در واحد روز معاملاتی
        var hEff = Math.min(Math.max(+holdDays || 1, 1), Ttd);
        if (!(hEff > 0)) hEff = Ttd;
        var Th   = hEff / TRADING_DAYS_PER_YEAR;
        var mu   = driftDaily * hEff / 100;
        var sd   = dSig * Math.sqrt(hEff);
        var Tr   = Math.max(Ttd - hEff, 0) / TRADING_DAYS_PER_YEAR; // هر دو طرف بر مبنای روز معاملاتی

        if (!__ZW71z) { __ZW71z = []; __ZW71w = [];   // v9.5.3: شبکهٔ گاوس-هرمایت — یک‌بار به‌جای هر فراخوانی
            var erGridStep71 = CONFIG.erGridStep > 0 ? CONFIG.erGridStep : 0.25;
            var halfStep71 = erGridStep71 / 2;
            for (var zz71 = -4.0; zz71 <= 4.0001; zz71 += erGridStep71) { __ZW71z.push(zz71); __ZW71w.push(ncdf(zz71 + halfStep71) - ncdf(zz71 - halfStep71)); }
        }
        var Z = __ZW71z, W = __ZW71w;
        var sum = 0, wsum = 0;
        for (var i = 0; i < Z.length; i++) {
            var St = S * Math.exp(mu + sd * Z[i]);
            var val = (Tr > 0) ? bsPriceOnly(St, K, Tr, r, v, isCall) : Math.max(0, isCall ? St - K : K - St);
            sum  += W[i] * val;
            wsum += W[i];
        }
        var expVal = sum / (wsum || 1);
        var expRet71 = (expVal - ask) / ask * 100; if (expRet71 > 500) expRet71 = 500; if (expRet71 < -100) expRet71 = -100; return expRet71;   // بازده انتظاری ٪ محدودشده
    }

    // ═══════════════════════════════════════════════════════════════════
    //  تاریخ جلالی → میلادی (برای روزهای باقی‌مانده تا سررسید)
    // ═══════════════════════════════════════════════════════════════════
    function div(a, b) { return ~~(a / b); }
    function mod(a, b) { return a - ~~(a / b) * b; }
    function jalCal(jy) {
        var breaks = [-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
        var bl = breaks.length, gy = jy + 621, leapJ = -14, jp = breaks[0], jm, jump, leap, n, i;
        if (jy < jp || jy >= breaks[bl - 1]) throw new Error('invalid jalaali year');
        for (i = 1; i < bl; i++) {
            jm = breaks[i]; jump = jm - jp;
            if (jy < jm) break;
            leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4);
            jp = jm;
        }
        n = jy - jp;
        leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
        if (mod(jump, 33) === 4 && jump - n === 4) leapJ++;
        var leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
        var march = 20 + leapJ - leapG;
        if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
        leap = mod(mod(n + 1, 33) - 1, 4);
        if (leap === -1) leap = 4;
        return { leap: leap, gy: gy, march: march };
    }
    function j2d(jy, jm, jd) {
        var r = jalCal(jy);
        return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
    }
    function g2d(gy, gm, gd) {
        var d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4)
              + div(153 * mod(gm + 9, 12) + 2, 5)
              + gd - 34840408;
        d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
        return d;
    }
    function jalaliDaysInMonth(y, m) {
        try {
            if (!(y >= 1300 && y <= 1500) || !(m >= 1 && m <= 12)) return 0;
            if (m <= 6) return 31;
            if (m <= 11) return 30;
            return j2d(y + 1, 1, 1) - j2d(y, 12, 1);
        } catch (e) { return 0; }
    }
    function isValidJDate(y, m, d) {
        var yy = +y, mm = +m, dd = +d;
        if (!isFinite(yy) || !isFinite(mm) || !isFinite(dd)) return false;
        if (Math.floor(yy) !== yy || Math.floor(mm) !== mm || Math.floor(dd) !== dd) return false;
        if (yy < 1300 || yy > 1500 || mm < 1 || mm > 12 || dd < 1) return false;
        return dd <= jalaliDaysInMonth(yy, mm);
    }
    function daysToExpiry(now) {
        try {
            var expJd = j2d(CONFIG.expiryJY, CONFIG.expiryJM, CONFIG.expiryJD);
            var todayJd = jdnOfMs(now.getTime());      // v8.0.1: وقتِ تهران — نه تاریخِ محلیِ مرورگر
            return expJd - todayJd;
        } catch (e) { return -1; }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  ابزارهای عمومی
    // ═══════════════════════════════════════════════════════════════════
    function norm(s) {
        return String(s == null ? '' : s)
            .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
            .replace(/[\u200C\u200D\u200E\u200F\uFEFF]/g, '')
            .replace(/[\u0622\u0623\u0625]/g, '\u0627')
            .replace(/\u064A/g, '\u06CC').replace(/\u0643/g, '\u06A9')
            .replace(/[\u06F0-\u06F9]/g, function (c) { return String(c.charCodeAt(0) - 0x06F0); })
            .replace(/[\u0660-\u0669]/g, function (c) { return String(c.charCodeAt(0) - 0x0660); });
    }
    function numOf(x) {
        var t = norm(String(x == null ? '' : x)).replace(/[,،\u066C\s]/g, '').replace(/\u066B/g, '.');
        if (!/^[+]?\d+(\.\d+)?$/.test(t)) return 0;
        var n = parseFloat(t);
        return (isFinite(n) && n > 0) ? n : 0;
    }
    function num(x) { var n = +x; return isFinite(n) ? n : 0; }

    function deepClone(x) {
        try {
            if (x === undefined) return undefined;
            return JSON.parse(JSON.stringify(x));
        } catch (e) { return x; }
    }
    function cloneConfigValue71(x) {
        return x && typeof x === 'object' ? deepClone(x) : x;
    }
    function normalizeHistory(h) {
        try {
            if (Array.isArray(h) && h.length === 1 && Array.isArray(h[0])) h = h[0];
            if (!Array.isArray(h) || !h.length) return null;
            var valid = 0, i, rec;
            for (i = 0; i < h.length; i++) {
                rec = h[i];
                if (rec && typeof rec === 'object') valid++;
            }
            return valid ? h : null;
        } catch (e) { return null; }
    }
    function histNum71(v71) {
        var n71 = +v71;
        return isFinite(n71) && n71 > 0 ? n71 : 0;
    }
    function histClose71(rec71) {
        rec71 = rec71 || {};
        var c71 = histNum71(rec71.PClosing);
        return c71 > 0 ? c71 : histNum71(rec71.PDrCotVal);
    }
    function histHigh71(rec71) {
        rec71 = rec71 || {};
        var h71 = histNum71(rec71.PriceMax);
        if (!(h71 > 0)) h71 = histNum71(rec71.PMax);
        return h71 > 0 ? h71 : histClose71(rec71);
    }
    function histLow71(rec71) {
        rec71 = rec71 || {};
        var l71 = histNum71(rec71.PriceMin);
        if (!(l71 > 0)) l71 = histNum71(rec71.PMin);
        return l71 > 0 ? l71 : histClose71(rec71);
    }
    function getOrderedHistory(ih71, cfg71) {
        if (!Array.isArray(ih71)) return [];
        var out71 = ih71.slice();
        cfg71 = cfg71 || CONFIG;
        // canonical order for every consumer: oldest -> newest
        if (cfg71.ihNewestFirst !== false) out71.reverse();
        return out71;
    }
    // WeakMap footgun: mutating a history array after this call leaves a stale digest;
    // callers must treat the input array as immutable (or pass a new array reference).
    var __histSigMemo71 = (typeof WeakMap === 'function') ? new WeakMap() : null;
    function historySig71(h) {
        try {
            if (!Array.isArray(h) || !h.length) return 'none';
            if (__histSigMemo71) {
                var cachedHistSig71 = __histSigMemo71.get(h);
                if (cachedHistSig71 !== undefined) return cachedHistSig71;
            }
            var out71 = [h.length], i71, q71;
            for (i71 = 0; i71 < h.length; i71++) {
                q71 = h[i71] || {};
                // Keep both close fields in the signature, while using the same
                // fallback extraction as ADX/realized-vol for H/L.
                out71.push(histNum71(q71.PClosing), histNum71(q71.PDrCotVal), histHigh71(q71), histLow71(q71));
            }
            var sig71 = out71.join('|');
            if (__histSigMemo71) __histSigMemo71.set(h, sig71);
            return sig71;
        } catch (e) { return 'bad'; }
    }
    function sigHash71(text71) {
        try {
            text71 = String(text71 == null ? '' : text71);
            var h1 = 2166136261, h2 = 2246822519, i71, c71;
            for (i71 = 0; i71 < text71.length; i71++) {
                c71 = text71.charCodeAt(i71);
                h1 ^= c71;
                h1 = Math.imul ? Math.imul(h1, 16777619) : (h1 * 16777619);
                h2 ^= (c71 + ((i71 & 255) << 8));
                h2 = Math.imul ? Math.imul(h2, 3266489917) : (h2 * 3266489917);
            }
            function hx71(x71) { return ('00000000' + ((x71 >>> 0).toString(16))).slice(-8); }
            return hx71(h1) + hx71(h2);
        } catch (e) { return String(text71); }
    }
    var __baseCfgSig71 = null;
    function baseCfgSig71(CFG) {
        if (__baseCfgSig71) return __baseCfgSig71;
        try {
            __baseCfgSig71 = sigHash71(JSON.stringify({ basePrices: CFG.basePrices, baseVol: CFG.baseVol, contractSizes: CFG.contractSizes, dividendCalendar: CFG.dividendCalendar, riskFreeCurve: CFG.riskFreeCurve, depthWeights: CFG.depthWeights, baseInsCodes: CFG.baseInsCodes }));
        } catch (e) { __baseCfgSig71 = 'cfg-error'; }
        return __baseCfgSig71;
    }

    function modelCacheSig(CFG, expiryKey, dte, hist, rowName) {
        try {
            var Wc = (typeof window !== 'undefined' && window) ? window : null;
            var payload = {
                schema: VERSION_TAG,   // v9.5.6.10: schema از VERSION_TAG برای invalidate بین نسخه‌ها
                expiry: expiryKey,
                multiExpiry: !!CFG.multiExpiry,
                dte: dte,
                history: sigHash71(historySig71(hist)),
                rowName: rowName || '',
                effectiveDay: ivDayKey71(btNow()),
                backtest: !!CFG.backtestMode,
                backtestDate: CFG.backtestDate || '',
                view: CFG.view,
                viewDailyPct: CFG.viewDailyPct,
                holdDays: CFG.holdDays,
                minExpRet: CFG.minExpRet,
                minDteWeight: CFG.minDteWeight,
                minDaysLeft: CFG.minDaysLeft,
                volFloor: CFG.volFloor,
                volCeil: CFG.volCeil,
                unitGuardX: CFG.unitGuardX,
                maxTimeValuePct: CFG.maxTimeValuePct,
                maxIvPremium: CFG.maxIvPremium,
                maxLeverage: CFG.maxLeverage,
                maxCostRT: CFG.maxCostRT,
                supportTabeii: CFG.supportTabeii,
                tabeiiDiscount: CFG.tabeiiDiscount,
                riskFree: CFG.riskFree,
                riskFreeAutoFetch: CFG.riskFreeAutoFetch,
                riskFreeFetchUrl: CFG.riskFreeFetchUrl,
                riskFreeCurve: CFG.riskFreeCurve,
                baseCfg: baseCfgSig71(CFG),
                useEwma: CFG.useEwma,
                ewmaLambda: CFG.ewmaLambda,
                autoView: CFG.autoView,
                autoViewWeight: CFG.autoViewWeight,
                ihNewestFirst: CFG.ihNewestFirst,
                adxPeriod: CFG.adxPeriod,
                ivAtmBand: CFG.ivAtmBand,
                ivHistDays: CFG.ivHistDays,
                ivRankBuy: CFG.ivRankBuy,
                ivRankSell: CFG.ivRankSell,
                liveEpoch: Wc ? (Wc.__opt71LivePxVersion || 0) : 0,
                modelEpoch: Wc ? (Wc.__opt71ModelEpoch || 0) : 0,
                riskFreeAutoAt: Wc ? (Wc.__opt71RfAutoAt || 0) : 0,
                dividendEpoch: Wc ? (Wc.__opt71DivVersion || 0) : 0
            };
            return 'v950|' + sigHash71(JSON.stringify(payload));
        } catch (e) { return 'v950|' + sigHash71(String(expiryKey) + '|' + String(dte)); }
    }
    function bumpModelEpoch() {
        __baseCfgSig71 = null;
        __ZW71z = null; __ZW71w = null;
        try { if (typeof window !== 'undefined' && window) window.__opt71WDCache = null; } catch(e){}
        try {
            if (typeof window !== 'undefined' && window)
                window.__opt71ModelEpoch = (window.__opt71ModelEpoch || 0) + 1;
        } catch (e) {}
    }

    function webStorage(api) {
        return { __a: api,
            getItem: function (k) { return this.__a.getItem(k); },
            setItem: function (k, v) { this.__a.setItem(k, v); } };
    }
    function probe(api) {
        api.setItem('__opt71Probe', '1');
        if (api.getItem('__opt71Probe') !== '1') throw new Error('unwritable');
        api.removeItem('__opt71Probe'); return true;
    }
    // ═══════════════════════════════════════════════════════════════════
    //  v7.1 — بلوک‌های جذب‌شده از نسخهٔ تحلیلیِ بیرونی (پس از رفعِ باگ‌ها)
    // ═══════════════════════════════════════════════════════════════════
    var __adxMemo71 = null;    // ⭐ کشِ ADX بر «امضای تاریخچه» — ده‌ها استریکِ یک پایه = یک محاسبه
    function adxMoveTail71(cache71, key71) {
        var node71 = cache71.nodes[key71];
        if (!node71) {
            node71 = cache71.nodes[key71] = { k: key71, p: null, n: null };
            if (cache71.tail) { cache71.tail.n = node71; node71.p = cache71.tail; }
            else cache71.head = node71;
            cache71.tail = node71;
            return;
        }
        if (cache71.tail === node71) return;
        if (node71.p) node71.p.n = node71.n; else cache71.head = node71.n;
        if (node71.n) node71.n.p = node71.p;
        node71.p = cache71.tail; node71.n = null;
        if (cache71.tail) cache71.tail.n = node71; else cache71.head = node71;
        cache71.tail = node71;
    }
    function adxDropHead71(cache71) {
        var node71 = cache71.head;
        if (!node71) return;
        cache71.head = node71.n;
        if (cache71.head) cache71.head.p = null; else cache71.tail = null;
        delete cache71.nodes[node71.k]; delete cache71.map[node71.k];
        cache71.n = Math.max(0, cache71.n - 1);
    }
    function computeAdx71(ihArr, period) {
        try {
            if (!ihArr || !ihArr.length) return 0;
            period = (period > 2) ? Math.floor(period) : 14;
            var sig71 = period + '|' + (CONFIG.ihNewestFirst !== false ? 1 : 0) + '|' + historySig71(ihArr);
            if (!__adxMemo71 || !__adxMemo71.map || !__adxMemo71.nodes)
                __adxMemo71 = { map: {}, nodes: Object.create(null), head: null, tail: null, n: 0 };   // v9.5.3: linked LRU
            if (__adxMemo71.map[sig71] !== undefined) {
                adxMoveTail71(__adxMemo71, sig71);
                return __adxMemo71.map[sig71];
            }
            var arr = getOrderedHistory(ihArr, CONFIG), i, a;   // داخلی: کهنه → جدید
            var H = [], L = [], C = [];
            for (i = 0; i < arr.length; i++) {
                a = arr[i]; if (!a) continue;
                var pc = histClose71(a);
                if (!(pc > 0)) continue;
                var hi71 = histHigh71(a);
                var lo71 = histLow71(a);
                H.push(hi71 > 0 ? hi71 : pc);
                L.push(lo71 > 0 ? lo71 : pc);
                C.push(pc);
            }
            var need = period * 4 + 1;
            if (C.length > need) {                          // ⭐ تازه‌ترین‌ها (منبع: کهنه‌ترین‌ها!)
                H = H.slice(H.length - need); L = L.slice(L.length - need); C = C.slice(C.length - need);
            }
            var r71;
            if (C.length < period + 2) r71 = adxFromCloses71(C, period);
            else r71 = adxWilder71(H, L, C, period);
            if (__adxMemo71.n >= 200) adxDropHead71(__adxMemo71);
            __adxMemo71.map[sig71] = r71;
            adxMoveTail71(__adxMemo71, sig71);
            __adxMemo71.n++;
            return r71;
        } catch (e) { return 0; }
    }
    function adxWilder71(H, L, C, period) {                 // هموارسازیِ ویلدرِ کامل
        try {
            var n = C.length, trS = 0, pS = 0, mS = 0, adx = null, dxN = 0, i;
            for (i = 1; i < n; i++) {
                var tr = Math.max(H[i] - L[i], Math.abs(H[i] - C[i - 1]), Math.abs(L[i] - C[i - 1]));
                var up = H[i] - H[i - 1], dn = L[i - 1] - L[i];
                var pdm = (up > dn && up > 0) ? up : 0;
                var mdm = (dn > up && dn > 0) ? dn : 0;
                if (i <= period) {
                    trS += tr; pS += pdm; mS += mdm;
                    if (i < period) continue;
                } else {
                    trS = trS - trS / period + tr;
                    pS = pS - pS / period + pdm;
                    mS = mS - mS / period + mdm;
                }
                var pdi = trS > 0 ? pS / trS * 100 : 0;
                var mdi = trS > 0 ? mS / trS * 100 : 0;
                var dx = (pdi + mdi) > 0 ? Math.abs(pdi - mdi) / (pdi + mdi) * 100 : 0;
                adx = (adx === null) ? dx : (adx * (period - 1) + dx) / period;
                dxN++;
            }
            return (dxN >= period && adx !== null) ? Math.round(adx) : 0;
        } catch (e) { return 0; }
    }
    function adxFromCloses71(closes, period) {              // fallback فقط-پایانی (DX بی‌جهت)
        try {
            if (!closes || closes.length < period + 2) return 0;
            var p = 0, m = 0, tr = 0, i;
            for (i = 1; i < closes.length; i++) {
                var d = closes[i] - closes[i - 1];
                if (d > 0) p += d; else if (d < 0) m += -d;
                tr += Math.abs(d);
            }
            return tr > 0 ? Math.round(Math.abs(p - m) / tr * 100) : 0;
        } catch (e) { return 0; }
    }

    var IVH_KEY71 = '__optIvHistV71', IV_SNAPSHOT_KEY71 = '__optIvSnapshotV71', IVH_PENDING_KEY71 = '__optIvHistV71_pending',
        IVH_SAVED_AT_KEY71 = '__optIvHistV71_savedAt', IV_REC_TIMES_KEY71 = '__optIvRecTimesV71',
        IV_REC_TIMES_SAVED_AT_KEY71 = '__optIvRecTimesV71_savedAt',
        __ivDb71 = null, __ivDirty71 = false;   // fallback برای محیطِ بدون window؛ در مرورگر mirror با window همگام می‌ماند
    var __ivRecTimes71 = null;   // v9.2: throttle باید بین اجرای ردیف‌ها مشترک باشد
    function ivDirtySet71(flag71) {
        __ivDirty71 = !!flag71;
        try { if (typeof window !== 'undefined' && window) window.__opt71IvDirty = !!flag71; } catch (e) {}
    }
    function ivDirtyGet71() {
        try {
            if (typeof window !== 'undefined' && window && typeof window.__opt71IvDirty === 'boolean') return window.__opt71IvDirty;
        } catch (e) {}
        return !!__ivDirty71;
    }
    function ivRecTimesStore71() {
        try {
            if (typeof window !== 'undefined' && window) {
                if (!window.__opt71IvRecTimes) {
                    var loaded71 = Object.create(null), st71 = optStore(), raw71 = null, parsed71 = null, key71;
                    var savedRtAt71 = 0, pendingRt71 = null;
                    try {
                        raw71 = st71 && st71.get(IV_REC_TIMES_KEY71);
                        if (raw71) parsed71 = JSON.parse(raw71);
                        var savedRtRaw71 = st71 && st71.get(IV_REC_TIMES_SAVED_AT_KEY71);
                        savedRtAt71 = +savedRtRaw71 > 0 ? +savedRtRaw71 : 0;
                        var snapshotRtRaw71 = st71 && st71.get(IV_SNAPSHOT_KEY71), snapshotRt71 = null;
                        if (snapshotRtRaw71) { try { snapshotRt71 = JSON.parse(snapshotRtRaw71); } catch (eSR71) { snapshotRt71 = null; } }
                        if (snapshotRt71 && snapshotRt71.times && snapshotRt71.at > savedRtAt71) { parsed71 = snapshotRt71.times; savedRtAt71 = snapshotRt71.at; }
                        var pendingRtRaw71 = st71 && st71.get(IVH_PENDING_KEY71);
                        if (pendingRtRaw71) pendingRt71 = JSON.parse(pendingRtRaw71);
                        if (pendingRt71 && pendingRt71.times && pendingRt71.at > savedRtAt71) parsed71 = pendingRt71.times;
                    } catch (e71r) { parsed71 = null; }
                    if (parsed71 && typeof parsed71 === 'object') {
                        for (key71 in parsed71) if (Object.prototype.hasOwnProperty.call(parsed71, key71) &&
                            key71 !== '__proto__' && key71 !== 'prototype' && key71 !== 'constructor' &&
                            typeof parsed71[key71] === 'number' && isFinite(parsed71[key71]) && parsed71[key71] > 0) loaded71[key71] = parsed71[key71];
                    }
                    window.__opt71IvRecTimes = loaded71;
                }
                return window.__opt71IvRecTimes;
            }
        } catch (e) {}
        return __ivRecTimes71 || (__ivRecTimes71 = Object.create(null));
    }
    function ivMainStamp71(ST71s, snapshotRaw71) {
        var at71 = 0, raw71 = snapshotRaw71, snap71 = null, sv71 = null;
        try { sv71 = ST71s && ST71s.get(IVH_SAVED_AT_KEY71); at71 = +sv71 > 0 ? +sv71 : 0; } catch (eS71) {}
        if (raw71 === undefined) { try { raw71 = ST71s && ST71s.get(IV_SNAPSHOT_KEY71); } catch (eR71) {} }
        if (raw71) { try { snap71 = JSON.parse(raw71); } catch (eSN71) { snap71 = null; } }
        if (snap71 && +snap71.at > at71) at71 = +snap71.at;
        return at71;
    }
    function ivRecJdn71(rec71) {
        try {
            var jdn71 = +rec71[3], m71, yy71, mm71, dd71, gd71;
            if (jdn71 > 0) return jdn71;
            m71 = String(rec71[0] || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!m71) return 0;
            yy71 = +m71[1]; mm71 = +m71[2]; dd71 = +m71[3];
            if (yy71 >= 1300 && yy71 <= 1500) return isValidJDate(yy71, mm71, dd71) ? j2d(yy71, mm71, dd71) : 0;
            gd71 = new Date(Date.UTC(yy71, mm71 - 1, dd71));
            return gd71.getUTCFullYear() === yy71 && gd71.getUTCMonth() === mm71 - 1 && gd71.getUTCDate() === dd71 ? g2d(yy71, mm71, dd71) : 0;
        } catch (e) { return 0; }
    }
    function ivMergeArr71(a71, b71) {
        var out71 = [], pos71 = Object.create(null), i71, rec71, key71, idx71, dst71, cA71, cB71;
        function add71(recX71) {
            if (!Array.isArray(recX71) || !(recX71[1] > 0)) return;
            var jdnX71 = ivRecJdn71(recX71);
            key71 = jdnX71 > 0 ? 'j' + jdnX71 : 'k' + String(recX71[0] || '');
            idx71 = pos71[key71];
            if (idx71 === undefined) { pos71[key71] = out71.length; out71.push(recX71.slice()); return; }
            dst71 = out71[idx71]; cA71 = dst71[2] > 0 ? +dst71[2] : 1; cB71 = recX71[2] > 0 ? +recX71[2] : 1;
            dst71[1] = (dst71[1] * cA71 + recX71[1] * cB71) / (cA71 + cB71);
            dst71[2] = cA71 + cB71;
            if (!(dst71[3] > 0) && recX71[3] > 0) dst71[3] = recX71[3];
        }
        for (i71 = 0; a71 && i71 < a71.length; i71++) add71(a71[i71]);
        for (i71 = 0; b71 && i71 < b71.length; i71++) add71(b71[i71]);
        out71.sort(function (aa71, bb71) {
            var ja71 = +aa71[3], jb71 = +bb71[3];
            if (isFinite(ja71) && isFinite(jb71) && ja71 !== jb71) return ja71 - jb71;
            var sa71 = String(aa71[0]), sb71 = String(bb71[0]);
            return sa71 < sb71 ? -1 : (sa71 > sb71 ? 1 : 0);
        });
        return out71;
    }
    function ivMergeDb71(stored71, current71) {
        try {
            var out71 = {}, key71;
            for (key71 in stored71 || {}) if (Object.prototype.hasOwnProperty.call(stored71, key71) && Array.isArray(stored71[key71])) out71[key71] = stored71[key71].slice();
            for (key71 in current71 || {}) if (Object.prototype.hasOwnProperty.call(current71, key71) && Array.isArray(current71[key71])) out71[key71] = ivMergeArr71(out71[key71] || [], current71[key71]);
            return out71;
        } catch (e) { return current71 || stored71 || {}; }
    }
    function ivMergeTimes71(stored71, current71) {
        var out71 = {}, key71, sv71, cv71;
        try {
            for (key71 in stored71 || {}) if (Object.prototype.hasOwnProperty.call(stored71, key71) && +stored71[key71] > 0) out71[key71] = +stored71[key71];
            for (key71 in current71 || {}) if (Object.prototype.hasOwnProperty.call(current71, key71) && +current71[key71] > 0) {
                sv71 = +out71[key71] || 0; cv71 = +current71[key71]; out71[key71] = Math.max(sv71, cv71);
            }
        } catch (e) {}
        return out71;
    }
    function ivCapDb71(db71) {
        var names71 = Object.keys(db71 || {}), nm71, partner71, i71;
        while (names71.length > 300) {
            nm71 = names71[0]; partner71 = nm71.indexOf('@atm') > -1 ? nm71.slice(0, -4) : nm71 + '@atm';
            delete db71[nm71]; names71.shift();
            if (db71[partner71]) { delete db71[partner71]; i71 = names71.indexOf(partner71); if (i71 > -1) names71.splice(i71, 1); }
        }
        return db71 || {};
    }
    function ivDb71(snapshotRaw71) {
        if (__ivDb71) return __ivDb71;
        var W71d = (typeof window !== 'undefined' && window) ? window : null;
        var ST = optStore(), db = {}, savedAt71 = 0, mainDb71 = null, snap71 = null, pending71 = null;
        if (W71d && W71d.__opt71IvDb) {
            __ivDb71 = W71d.__opt71IvDb;
            // Window cache is authoritative during this IIFE; external pending is merged on flush.
            if (!(W71d.__opt71IvBaseAt > 0)) W71d.__opt71IvBaseAt = ivMainStamp71(ST);
            return __ivDb71;
        }
        try {
            var snapRaw71 = snapshotRaw71;
            if (snapRaw71 === undefined) snapRaw71 = ST ? ST.get(IV_SNAPSHOT_KEY71) : null;
            if (snapRaw71) { try { snap71 = JSON.parse(snapRaw71); } catch (eSN71) { snap71 = null; } }
            var raw = ST ? ST.get(IVH_KEY71) : null;
            if (raw) mainDb71 = JSON.parse(raw) || {};
            savedAt71 = ivMainStamp71(ST, snapRaw71);
            if (snap71 && snap71.db && +snap71.at >= savedAt71) { db = snap71.db; savedAt71 = +snap71.at; }
            else db = mainDb71 || {};
            var pendingRaw71 = ST ? ST.get(IVH_PENDING_KEY71) : null;
            if (pendingRaw71) { try { pending71 = JSON.parse(pendingRaw71); } catch (eP71) { pending71 = null; } }
            if (pending71 && pending71.db && +pending71.at > savedAt71) db = pending71.db; // local unsaved state
        } catch (e) { db = {}; }
        __ivDb71 = db;
        if (W71d) {
            W71d.__opt71IvDb = db;
            // BaseAt denotes the main snapshot this in-memory DB was based on;
            // a pending journal is local and must not be merged back into itself.
            W71d.__opt71IvBaseAt = savedAt71;
            if (!(W71d.__opt71IvSaveAt > 0)) W71d.__opt71IvSaveAt = savedAt71;
        }
        return db;
    }
    function ivWritePending71(db71, at71, times71) {
        try {
            var ST71p = optStore();
            if (ST71p) ST71p.set(IVH_PENDING_KEY71, JSON.stringify({ at: at71, db: db71 || {}, times: times71 || {} }));
        } catch (e) {}
    }
    function ivFlush71(mode71) {   // v9.5.3: true=write موفق؛ false=خطای write؛ 'throttled'/'clean'=بدون write؛ unload=آستانهٔ ۲ثانیه
        var force71 = mode71 === true;
        var W71f = (typeof window !== 'undefined' && window) ? window : null;
        var ST = optStore(); if (!ST) return false;
        var dirty71 = ivDirtyGet71();
        if (!dirty71 && !force71) return 'clean';
        var now = Date.now();
        var minMs71 = force71 ? 0 : (mode71 === 'unload' ? 2000 : 15000);   // v9.0.10: آستانهٔ کوتاهِ unload — اتلافِ حداکثر ۲ثانیه
        if (!force71 && W71f && now - (W71f.__opt71IvSaveAt || 0) < minMs71) { ivDirtySet71(true); return 'throttled'; }   // v9.0.7: throttleِ واقعی — مهر روی window
        var storedRaw71;
        try { storedRaw71 = ST.get(IV_SNAPSHOT_KEY71); } catch (eSRF71) { storedRaw71 = undefined; }
        var storedAt71 = ivMainStamp71(ST, storedRaw71);
        if (storedAt71 >= now) now = storedAt71 + 1; // coarse same-ms guard; localStorage has no CAS/distributed lock
        var dbNow71 = ivDb71(storedRaw71);   // v9.0.8: همیشه DBِ مشترک (window/storage)
        try {
            var storedSnap71 = null, storedDb71 = null, storedTimes71 = null;
            if (storedRaw71) { try { storedSnap71 = JSON.parse(storedRaw71); } catch (eSS71) { storedSnap71 = null; } }
            if (storedSnap71 && storedSnap71.db) { storedDb71 = storedSnap71.db; storedTimes71 = storedSnap71.times || null; }
            else {
                var storedLegacyRaw71 = ST.get(IVH_KEY71);
                if (storedLegacyRaw71) { try { storedDb71 = JSON.parse(storedLegacyRaw71); } catch (eSL71) { storedDb71 = null; } }
                try { var storedLegacyTimesRaw71 = ST.get(IV_REC_TIMES_KEY71); if (storedLegacyTimesRaw71) storedTimes71 = JSON.parse(storedLegacyTimesRaw71); } catch (eSLT71) {}
            }
            var baseAt71 = W71f ? (W71f.__opt71IvBaseAt || 0) : 0;
            var externalNewer71 = storedAt71 > 0 && storedAt71 > baseAt71;
            if (storedDb71 && externalNewer71) dbNow71 = ivMergeDb71(storedDb71, dbNow71);
            dbNow71 = ivCapDb71(dbNow71);
            __ivDb71 = dbNow71;
            if (W71f) W71f.__opt71IvDb = dbNow71;
            var timesNow71 = ivRecTimesStore71();
            if (storedTimes71 && externalNewer71) {
                timesNow71 = ivMergeTimes71(storedTimes71, timesNow71);
                if (W71f) W71f.__opt71IvRecTimes = timesNow71; else __ivRecTimes71 = timesNow71;
            }
            // One snapshot write is the authoritative atomic commit for new code.
            ST.set(IV_SNAPSHOT_KEY71, JSON.stringify({ v: VERSION_TAG, at: now, db: dbNow71 || {}, times: timesNow71 || {} }));
            // Legacy mirrors keep v9.2.2 readers and manual inspection working.
            try { ST.set(IVH_KEY71, JSON.stringify(dbNow71 || {})); } catch (eLDB71) {}
            try { ST.set(IV_REC_TIMES_KEY71, JSON.stringify(timesNow71 || {})); } catch (eLRT71) {}
            try { ST.set(IVH_SAVED_AT_KEY71, String(now)); } catch (eSA71) {}
            try { ST.set(IV_REC_TIMES_SAVED_AT_KEY71, String(now)); } catch (eRSA71) {}
            try { if (ST.del) ST.del(IVH_PENDING_KEY71); } catch (eDP71) {}
            ivDirtySet71(false);
            if (W71f) { W71f.__opt71IvSaveAt = now; W71f.__opt71IvBaseAt = now; W71f.__opt71IvDirty = false; }
            var Di940 = dbgState();
            if (Di940) { var ik940, ir940 = 0; for (ik940 in dbNow71) if (Object.prototype.hasOwnProperty.call(dbNow71, ik940)) ir940 += (dbNow71[ik940] || []).length; Di940.iv = { keys: Object.keys(dbNow71).length, records: ir940, lastFlush: now }; }
            return true;
        } catch (e) { return false; }
    }
    function ivRecAgeDays71(rec71, todayJdn71) {
        try {
            var jd71 = rec71 && +rec71[3];
            return isFinite(jd71) && jd71 > 0 ? todayJdn71 - jd71 : ivAgeDays71(rec71 && rec71[0], todayJdn71);
        } catch (e) { return -1; }
    }
    function ivDayKey71(ms) {
        try {                                       // v8.0.1: تاریخِ تهران (نه UTC)
            var p71 = wgTodayParts(ms);
            return p71[0] + '-' + ('0' + p71[1]).slice(-2) + '-' + ('0' + p71[2]).slice(-2);
        } catch (e) { return ''; }
    }
    function ivRankRecord(baseName, ivPct, tag71) {   // v8.3.0: tag71=atm -> separate key
        try {
            if (isBacktest()) return;      // v8.0.1c: bactest dar DB-e zende-ye IV neminevisad
            if (!(ivPct > 0) || !(ivPct < 500) || !baseName) return;

            var db = ivDb71();
            var keys71 = (tag71 === 'atm') ? [baseName, baseName + '@atm'] : [baseName];   // هر دو pool در یک فراخوانی
            var nowIv71 = btNow(), todayJdnIv71 = jdnOfMs(nowIv71), k = ivDayKey71(nowIv71), kU71 = '';
            var recTimes71 = ivRecTimesStore71(), recordedIv71 = false;
            try { kU71 = new Date(nowIv71).toISOString().slice(0, 10); } catch (eU71) {}
            for (var ki71 = 0; ki71 < keys71.length; ki71++) {
            var dbKey71 = keys71[ki71], arr = db[dbKey71] || [];
            var last = arr.length ? arr[arr.length - 1] : null;
            if (recTimes71[dbKey71] && nowIv71 >= recTimes71[dbKey71] && nowIv71 - recTimes71[dbKey71] < 300000) continue;   // حداکثر یک نمونه در هر ۵ دقیقه
            recTimes71[dbKey71] = nowIv71;
            recordedIv71 = true;
            if (last && last[0] === kU71) { last[0] = k; last[3] = todayJdnIv71; }      // migrate UTC-key to Tehran-key
            if (last && last[0] === k) {                    // ادغامِ همان روز (میانگینِ در حالِ اجرا)
                var c = last[2] || 1;
                last[1] = (last[1] * c + ivPct) / (c + 1);
                last[2] = c + 1; last[3] = todayJdnIv71;
            } else arr.push([k, Math.round(ivPct * 100) / 100, 1, todayJdnIv71]);
            var winDays71 = (CONFIG.ivHistDays > 5 ? CONFIG.ivHistDays : 60) * 1.5;
            var ageOldIv71, firstValidIv71 = 0;
            // Current keys are Gregorian YYYY-MM-DD for the Tehran-local day; legacy Jalali keys remain supported.
            while (firstValidIv71 < arr.length) {
                ageOldIv71 = ivRecAgeDays71(arr[firstValidIv71], todayJdnIv71);
                if (ageOldIv71 < 0 || ageOldIv71 > winDays71) firstValidIv71++;
                else break;
            }
            if (firstValidIv71 > 0) arr = arr.slice(firstValidIv71);
            db[dbKey71] = arr;
            }   // v9.0.3: payan-e halqe-ye poolha
            if (!recordedIv71) return;   // throttled calls do not rewrite the DB or journal
            var names = Object.keys(db);                    // سقفِ تعدادِ پایه‌ها — v9.5.3: جفتِ base/@atm هم‌زمان حذف شود
            while (names.length > 300) {
                var nm71o = names[0], at71f = nm71o.indexOf('@atm') > -1, pr71f = at71f ? nm71o.slice(0, -4) : nm71o + '@atm';
                delete db[nm71o]; names.shift();
                if (db[pr71f]) { delete db[pr71f]; var pi71f = names.indexOf(pr71f); if (pi71f > -1) names.splice(pi71f, 1); }
            }
            __ivDb71 = db; ivDirtySet71(true);
            var flushedIv71 = ivFlush71(false);
            if (flushedIv71 !== true) ivWritePending71(db, nowIv71, recTimes71);
        if (typeof window !== 'undefined' && window) window.__ivTimes71 = ivRecTimesStore71();   // v9.2: دسترسیِ آزمون
        } catch (e) {}
    }
    function ivAgeDays71(key71, todayJdn71) {
        try {
            var m71 = String(key71 || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (!m71) return -1;
            var yy71 = +m71[1], mm71 = +m71[2], dd71 = +m71[3], jd71;
            if (yy71 >= 1300 && yy71 <= 1500) {
                if (!isValidJDate(yy71, mm71, dd71)) return -1;
                jd71 = j2d(yy71, mm71, dd71);
            } else {
                var gd71 = new Date(Date.UTC(yy71, mm71 - 1, dd71));
                if (!(gd71.getUTCFullYear() === yy71 && gd71.getUTCMonth() === mm71 - 1 && gd71.getUTCDate() === dd71)) return -1;
                jd71 = g2d(yy71, mm71, dd71);
            }
            return todayJdn71 - jd71;
        } catch (e) { return -1; }
    }
    function ivRankCompute(baseName, ivPct, tag71) {   // v8.3.0: same-tag compare
        try {
            if (isBacktest()) return null;   // v9.0.2: dar bactest khanci (mobanaye sahih nist)
            var db71c = ivDb71();
            var arr = (tag71 === 'atm') ? db71c[baseName + '@atm'] : db71c[baseName];   // v9.5.3: ATM does not fall back to mixed history
            if (tag71 === 'atm' && (!arr || arr.length < 5)) return null;
            var vals = [], i, todayJdn71 = jdnOfMs(btNow());
            // Half-life is calendar-day based; missing weekend observations therefore decay naturally.
            var halfLife71 = Math.max(7, (CONFIG.ivHistDays > 5 ? CONFIG.ivHistDays : 60) * 0.5);
            if (arr) for (i = 0; i < arr.length; i++) {
                var rec71 = arr[i], age71 = ivRecAgeDays71(rec71, todayJdn71);
                if (rec71 && rec71[1] > 0 && age71 > 0) {
                    vals.push([+rec71[1], Math.exp(-Math.LN2 * age71 / halfLife71)]);
                }
            }
            if (vals.length < 5 || !(ivPct > 0)) return null;     // تاریخچهٔ کم → خنثی
            vals.sort(function (aa71, bb71) { return aa71[0] - bb71[0]; });
            var totalW71 = 0, belowW71 = 0;
            for (i = 0; i < vals.length; i++) {
                totalW71 += vals[i][1];
                if (vals[i][0] < ivPct) belowW71 += vals[i][1];   // سخت‌گیرانه: هم‌سطح = نیمه
            }
            return totalW71 > 0 ? Math.round(belowW71 / totalW71 * 1000) / 10 : null;
        } catch (e) { return null; }
    }

    function clamp711(x, lo, hi) { return x < lo ? lo : (x > hi ? hi : x); }
    function computeScore71(p) {
        try {
            var wER = CONFIG.wER >= 0 ? CONFIG.wER : 35, wIVR = CONFIG.wIVR >= 0 ? CONFIG.wIVR : 25;
            var wADX = CONFIG.wADX >= 0 ? CONFIG.wADX : 15, wLiq = CONFIG.wLiq >= 0 ? CONFIG.wLiq : 15;
            var wE = CONFIG.wEdge >= 0 ? CONFIG.wEdge : 10;
            var wSum = wER + wIVR + wADX + wLiq + wE;
            if (!(wSum > 0)) return 50;
            var erScale = Math.max(50, (CONFIG.minExpRet || 0) * 1.5); var erS = clamp711((p.er || 0) / erScale, 0, 1) * 100;   // v9.5.3: سقفِ سیرِ ER با گیت — minExpRet=50 → تفکیک تا ER٪۷۵ (با ۰ مثلِ قبل: ۳۰)
            var ivrS = 50;                                              // بدونِ تاریخچه = خنثی
            if (p.ivRank !== null && p.ivRank !== undefined && p.ivRank === p.ivRank) {
                var rb = CONFIG.ivRankBuy >= 0 ? CONFIG.ivRankBuy : 40;
                var rs = Math.max(rb + 1, CONFIG.ivRankSell > rb ? CONFIG.ivRankSell : 70);
                ivrS = p.ivRank <= rb ? 100 : (p.ivRank >= rs ? 0 : 100 - (p.ivRank - rb) / (rs - rb) * 100);
            }
            var adxS = clamp711((p.adx || 0) / 50, 0, 1) * 100;         // ADX ۵۰+ = روندِ کامل
            var liqS = clamp711((p.tno || 0) / 50, 0, 1) * 100;         // ۵۰ معامله = سقف
            var eS = clamp711((p.ivEdge || 0) / 5, 0, 1) * 100;         // ۵ واحد برتری = سقف
            return Math.round((erS * wER + ivrS * wIVR + adxS * wADX + liqS * wLiq + eS * wE) / wSum);
        } catch (e) { return 50; }
    }

    function roundTick71(x, cs) {
        var t = (CONFIG.roundToTick > 0 ? CONFIG.roundToTick : 5) * (cs > 0 ? cs : 1);
        return Math.round(x / t) * t;
    }
    function fmt71(n) {
        try {
            var x = Math.round(n), s71 = String(Math.abs(x)), o = '', c = 0, i;
            for (i = s71.length - 1; i >= 0; i--) { o = s71.charAt(i) + o; c++; if (c % 3 === 0 && i > 0) o = ',' + o; }
            return (x < 0 ? '-' : '') + o;
        } catch (e) { return String(n); }
    }
    function suggestTrade71(fairQ, askQ, intrQ, csQ) {
        try {
            if (!(fairQ > 0) || !(askQ > 0)) return null;
            var pad = CONFIG.entryPad >= 0 ? CONFIG.entryPad : 5;
            var slP = CONFIG.stopLossPct > 0 ? CONFIG.stopLossPct : 30;    // مشترک با مدیریتِ پوزیشن
            var tpP = CONFIG.takeProfitPct > 0 ? CONFIG.takeProfitPct : 80;
            var tickQ = (CONFIG.roundToTick > 0 ? CONFIG.roundToTick : 5) * (csQ > 0 ? csQ : 1);
            var entry = roundTick71(Math.min(askQ, fairQ * (1 - pad / 100)), csQ);
            if (!(entry > 0)) return null;
            var sl = roundTick71(entry * (1 - slP / 100), csQ);
            if (intrQ > 0 && intrQ < entry) sl = Math.max(sl, roundTick71(intrQ, csQ) + tickQ);   // ⭐ کفِ ارزشِ ذاتی + ۱ تیک
            if (!(sl > 0) || sl >= entry) sl = Math.max(tickQ, roundTick71(entry / 2, csQ));
            var tp = roundTick71(Math.max(entry * (1 + tpP / 100), fairQ), csQ);              // ⭐ هدف ≥ منصفانه
            if (!(tp > entry)) return null;
            return { entry: entry, sl: sl, tp: tp };
        } catch (e) { return null; }
    }

    function popupCollect71(rec) {
        try {
            if (typeof window === 'undefined' || !window || !CONFIG.usePopup) return;
            var arr = window.__opt71PopRows = window.__opt71PopRows || [];
            for (var i71d = arr.length - 1; i71d >= 0; i71d--) {
                if (arr[i71d] && arr[i71d].n === rec.n) { arr.splice(i71d, 1); break; }
            }
            arr.push(rec);
            if (arr.length > 400) arr.splice(0, arr.length - 400);
        } catch (e) {}
    }
    function esc71(x) {
        var a = String.fromCharCode(38);
        return String(x == null ? '' : x).replace(/&/g, a + 'amp;').replace(/</g, a + 'lt;')
            .replace(/>/g, a + 'gt;').replace(/"/g, a + 'quot;').replace(/'/g, a + '#39;');
    }
    function popSort71(arr71s) {   // v9.1.1: مرتب‌سازیِ ستونیِ جدولِ تحلیل (پیش‌فرض: ★ نزولی)
        var s71s = (typeof window !== 'undefined' && window && window.__opt71PopSort) ? window.__opt71PopSort : { key: 'sc', dir: -1 };
        arr71s.sort(function (a71s, b71s) {
            var va71 = a71s[s71s.key], vb71 = b71s[s71s.key];
            var e71a = (va71 === null || va71 === undefined || va71 === ''), e71b = (vb71 === null || vb71 === undefined || vb71 === '');
            if (e71a && e71b) return 0;
            if (e71a) return 1;   // v9.1.3: خالی‌ها همیشه آخر — در هر دو جهت
            if (e71b) return -1;
            var na71 = +va71, nb71 = +vb71;
            if (na71 === na71 && nb71 === nb71) return (na71 - nb71) * s71s.dir;   // عددی
            va71 = String(va71); vb71 = String(vb71);   // متنی
            return va71 < vb71 ? -s71s.dir : (va71 > vb71 ? s71s.dir : 0);
        });
        return arr71s;
    }
    if (typeof window !== 'undefined' && window) window.optPopSort = function (k71p, d71p) {   // v9.1.1: دستیارِ کنسول — ترتیبِ نمادها با ستونِ دلخواه
        try {
            var s71p = window.__opt71PopSort = window.__opt71PopSort || { key: 'sc', dir: -1 };
            if (k71p) { s71p.key = String(k71p); s71p.dir = (d71p === 1 || d71p === '1') ? 1 : -1; }
            return popSort71((window.__opt71PopRows || []).slice()).map(function (r71p) { return r71p.n; }).join('،');
        } catch (e71p) { return 'خطا: ' + e71p; }
    };
    function popHtml71() {
        var ready71 = !!(typeof window !== 'undefined' && window && window.__opt71PopReady);
        var arr = ready71 ? (window.__opt71PopRows || []).slice() : [];
        var now71 = Date.now(), scanCycle71 = 30000;
        try {
            var RC71p = window.__opt71Db;
            if (RC71p && RC71p.db && RC71p.db.scan && RC71p.db.scan.cycle > 0) scanCycle71 = RC71p.db.scan.cycle;
        } catch (eSC71) {}
        var ttl71 = Math.max(90000, scanCycle71 * 3);
        arr = arr.filter(function (r71) { return r71 && (!r71.t || (now71 - r71.t) <= ttl71); });
        var seen71 = Object.create(null);
        arr = arr.filter(function (r71) { if (!r71 || seen71[r71.n]) return false; seen71[r71.n] = 1; return true; });
        if (ready71) popSort71(arr);
        var noteTableStyleS71 = 'width:100%;table-layout:fixed;border-collapse:separate;border-spacing:6px 0;margin:0 0 7px 0;';
        var noteCellBaseS71 = 'vertical-align:top;box-sizing:border-box;border-radius:8px;padding:7px 9px;font:11px/1.9 Tahoma,Verdana,sans-serif;';
        var h = '<table dir="rtl" role="note" aria-label="هشدار و پیام مولف" style="' + noteTableStyleS71 + '"><tbody><tr>' +
            '<td style="width:66.6667%;' + noteCellBaseS71 + 'background:#3b2f16;color:#ffe5a3;border:1px solid #8d7130;">' +
            '\u003Cb\u003E\u26A0 رفع مسئولیت:\u003C/b\u003E این برنامه صرفاً ابزار تحلیلی/اطلاعاتی است و پیشنهاد سرمایه‌گذاری یا تضمین سود نیست. مؤلف برنامه مسئول هیچ‌گونه زیان یا خسارت مستقیم و غیرمستقیم ناشی از تصمیم یا معاملهٔ کاربر نیست؛ استفاده بر عهدهٔ کاربر است. ' + // readable: ⚠ رفع مسئولیت: این برنامه صرفاً ابزار تحلیلی/اطلاعاتی است و پیشنهاد سرمایه‌گذاری یا تضمین سود نیست. مولف برنامه مسئول هیچ‌گونه زیان یا خسارت مستقیم و غیرمستقیم ناشی از تصمیم یا معاملهٔ کاربر نیست؛ استفاده بر عهدهٔ کاربر است.

            '<a href="https://t.me/p75ad" target="_blank" rel="noopener" style="color:#9fdcff;font-weight:bold;">\u0644\u06cc\u0646\u06a9 \u0645\u0648\u0644\u0641: t.me/p75ad</a>' +
            '</td>' +
            '<td style="width:33.3333%;' + noteCellBaseS71 + 'background:#1a2d3d;color:#c8e6ff;border:1px solid #3a7fc4;">' +
            '\u003Cb\u003E\u06af\u0631\u0648\u0647\u0650 \u067e\u0631\u0648\u0698\u0647:\u003C/b\u003E ' + String.fromCharCode(60) + 'br>' +
            '\u067e\u0631\u0633\u0634\u060c \u067e\u06cc\u0634\u0646\u0647\u0627\u062f \u0648 \u062a\u0628\u0627\u062f\u0644\u0650 \u0646\u0638\u0631 \u062f\u0631 \u06af\u0631\u0648\u0647.' + String.fromCharCode(60) + 'br>' + String.fromCharCode(60) + 'br>' +
            '<a href="https://t.me/SmartOptionTSE" target="_blank" rel="noopener" style="color:#8ecbff;font-weight:bold;text-decoration:none;">' +
            '\u2014 t.me/SmartOptionTSE' +
            '</a>' +
            '</td>' +
            '</tr></tbody></table>' +
            '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">' +
            '<b style="flex:1;color:#8ecbff;">📊 تحلیلِ قراردادها (' + arr.length + ' ردیف یکتا) — ' + verLabel71() + '</b>' +
            '<button id="__opt71PopRe" style="background:#2d6cdf;color:#fff;border:0;border-radius:4px;padding:2px 9px;cursor:pointer;font:11px Tahoma;">به‌روزرسانی</button>' +
            '<button id="__opt71PopCl" style="background:#444c5e;color:#fff;border:0;border-radius:4px;padding:2px 9px;cursor:pointer;font:11px Tahoma;">پاک‌کردن</button>' +
            '<button id="__opt71PopX" style="background:#6b2737;color:#fff;border:0;border-radius:4px;padding:2px 9px;cursor:pointer;font:11px Tahoma;">×</button>' +
            '</div>';
        if (!ready71)
            return h + '<div style="color:#8fa3c8;padding:8px 4px;">پنجره در شروع خالی است. برای نمایش تحلیل‌ها روی «به‌روزرسانی» بزنید.</div>';
        if (!arr.length)
            return h + '<div style="color:#8fa3c8;padding:8px 4px;">هنوز ردیفی جمع نشده — یک رفرشِ دیده‌بان بزنید.</div>';
if (isBacktest()) h += '<div style="color:#ffd479;margin:4px 0;">حالتِ بک‌تست: زمانِ منجمد — IV Rank خنثی (۵۰)، ADX تقریبی، گیتِ نمادِ تازه غیرفعال</div>';
        h += '<div style="color:#7fd4a0;margin:4px 0;">' +   // v9.1.2: نشانِ گیت — رابطهٔ «تنظیمات ↔ ستونِ ER» صریح
            'گیتِ فعال (پس از جریمهٔ DTE): ' + (CONFIG.minExpRet > 0 ? ('ER ≥ ' + CONFIG.minExpRet + '%') : 'minExpRet = 0 (فقط ER منفی رد می‌شود)') +
            ' — ستونِ «ER٪(' + (CONFIG.holdDays > 0 ? CONFIG.holdDays : 5) + 'روز)» پس از جریمهٔ DTE است و دقیقاً همان مقداری است که گیت می‌شود — همهٔ ردیف‌ها از آن گذشته‌اند (کلیک روی هدر: مرتب)</div>';
        var thS = 'padding:4px 6px;color:#8ecbff;background:#262d3d;border-bottom:2px solid #3a4356;text-align:center;white-space:nowrap;';
        var tdS = 'padding:3px 6px;border-bottom:1px solid #2a3142;text-align:center;white-space:nowrap;';
        var cols71 = [['n', 'نماد'], ['b', 'پایه'], ['k', 'K'], ['side', 'نوع'], ['sc', '★'],   // v9.1.1: هدرهای کلیک‌پذیر
            ['er', 'ER٪(' + (CONFIG.holdDays > 0 ? CONFIG.holdDays : 5) + 'روز)'], ['iv', 'IV٪'], ['rv', 'IVRank'], ['adx', 'ADX'],
            ['st', 'وضعیت'], ['en', 'ورود'], ['sl', 'SL'], ['tp', 'TP']];
        var srt71h = (typeof window !== 'undefined' && window && window.__opt71PopSort) ? window.__opt71PopSort : { key: 'sc', dir: -1 };
        var thS2 = thS + 'cursor:pointer;user-select:none;';
        h += '<table dir="rtl" style="border-collapse:collapse;width:100%;font:11px/1.8 Tahoma,Verdana,sans-serif;"><tr>';
        for (var ci71 = 0; ci71 < cols71.length; ci71++) {
            var c71h = cols71[ci71];
            h += '<th id="__opt71Th_' + c71h[0] + '"' +
                (c71h[0] === 'er' ? ' title="بازدهِ انتظاری برای افقِ نگه‌داری — همان مقداری که minExpRet گیت می‌کند (کلیک: مرتب‌سازی)"' : (c71h[0] === 'side' ? ' title="کلیک: تفکیک نوع (C/P)"' : ' title="کلیک: مرتب‌سازی"')) +
                ' style="' + thS2 + '">' + c71h[1] +
                (srt71h.key === c71h[0] ? (srt71h.dir < 0 ? ' ▼' : ' ▲') : '') + '</th>';
        }
        h += '</tr>';
        var i, r, z;
        for (i = 0; i < arr.length; i++) {
            r = arr[i];
            z = (i % 2) ? 'background:#232a38;' : '';                 // سطرهای یک‌درمیان
            h += '<tr' + (z ? ' style="' + z + '"' : '') + '>' +
                '<td style="' + tdS + 'font-weight:bold;">' + esc71(r.n) + '</td>' +
                '<td style="' + tdS + 'color:#8fa3c8;">' + esc71(r.b) + '</td>' +
                '<td style="' + tdS + '">' + fmt71(r.k) + '</td>' +
                '<td style="' + tdS + 'font-weight:bold;color:' + (r.side === 'C' ? '#3faf6e' : '#e05656') + ';">' + esc71(r.side) + '</td>' +
                '<td style="' + tdS + 'font-weight:bold;color:#ffd479;">' + esc71(r.sc === null || r.sc === undefined ? '—' : r.sc) + '</td>' +
                '<td style="' + tdS + 'font-weight:bold;color:#8ecbff;" title="بازدهِ انتظاری (' + (CONFIG.holdDays > 0 ? CONFIG.holdDays : 5) + 'روز) — گیتِ minExpRet روی همین مقدار است">' + esc71(r.er) + '</td>' +
                '<td style="' + tdS + '">' + esc71(r.iv) + '</td>' +
                '<td style="' + tdS + '">' + esc71(r.rv === null || r.rv === undefined ? '—' : Math.round(r.rv)) + '</td>' +
                '<td style="' + tdS + '">' + esc71(r.adx || 0) + '</td>' +
                '<td style="' + tdS + '">' + esc71(r.st) + '</td>' +
                '<td style="' + tdS + 'font-weight:bold;">' + (r.en ? fmt71(r.en) : '—') + '</td>' +
                '<td style="' + tdS + 'color:#e05656;">' + (r.sl ? fmt71(r.sl) : '—') + '</td>' +
                '<td style="' + tdS + 'color:#3faf6e;">' + (r.tp ? fmt71(r.tp) : '—') + '</td>' +
                '</tr>';
        }
        return h + '</table>';
    }
    // v9.6.0.7 resource guard: coalesce popup renders without dropping the final state.
    var __popRenderT71 = 0, __popRenderTimer71 = 0;
    function popRender71() {
        try {
            var nowPop71 = Date.now(), waitPop71 = 200 - (nowPop71 - __popRenderT71);
            if (waitPop71 > 0) {
                if (!__popRenderTimer71) __popRenderTimer71 = setTimeout(function () { __popRenderTimer71 = 0; popRender71(); }, waitPop71);
                return;
            }
            __popRenderT71 = nowPop71;
            if (typeof window === 'undefined' || !window || !window.__opt71PopPanel) return;
            var el = window.__opt71PopPanel;
            el.innerHTML = popHtml71();
            var bR = el.querySelector('#__opt71PopRe'), bC = el.querySelector('#__opt71PopCl'), bX = el.querySelector('#__opt71PopX');
            if (bR) bR.onclick = function () { try { window.__opt71PopReady = true; popRender71(); } catch (eR1) {} };
            if (bC) bC.onclick = function () { try { if (window.__opt71PopRows) window.__opt71PopRows.length = 0; window.__opt71PopReady = false; popRender71(); } catch (eR2) {} };
            if (bX) bX.onclick = function () { try { el.style.display = 'none'; } catch (eR3) {} };
            var sk71 = ['n', 'b', 'k', 'side', 'sc', 'er', 'iv', 'rv', 'adx', 'st', 'en', 'sl', 'tp'];   // v9.1.1: مرتب‌سازی با کلیک روی هدر
            for (var qi71 = 0; qi71 < sk71.length; qi71++) {
                (function (k71q) {
                    var th71q = el.querySelector('#__opt71Th_' + k71q);
                    if (th71q) th71q.onclick = function () {
                        try {
                            var s71q = window.__opt71PopSort = window.__opt71PopSort || { key: 'sc', dir: -1 };
                            if (s71q.key === k71q) s71q.dir = -s71q.dir; else { s71q.key = k71q; s71q.dir = -1; }
                            popRender71();
                        } catch (eS71q) {}
                    };
                })(sk71[qi71]);
            }
        } catch (e) {}
    }
    function popupOpen71() {                       // پنلِ درون‌صفحه‌ای — هم‌سبکِ پنلِ تنظیمات
        try {
            ivFlush71('unload');   // v9.1.3: toggleهای پشت‌سرهم write مضاعف نمی‌سازند (آستانهٔ ۲ثانیه)
            if (typeof window === 'undefined' || !window) return;
            if (typeof document === 'undefined' || !document || !document.createElement || !document.body) return;
            if (window.__opt71PopPanel) {              // v7.1: پنلِ کهنه → بازسازی
                var pStaleP71 = true;
                try { pStaleP71 = !(window.__opt71PopPanel.getAttribute && window.__opt71PopPanel.getAttribute('data-stamp') === VERSION_TAG + 'p'); } catch (eSP71) {}
                if (pStaleP71) {
                    try { if (window.__opt71PopPanel.parentNode) window.__opt71PopPanel.parentNode.removeChild(window.__opt71PopPanel); } catch (eRP71) {}
                    window.__opt71PopPanel = null;
                }
            }
            if (window.__opt71PopPanel) {           // toggle: باز/بسته
                var el0 = window.__opt71PopPanel;
                bringTop71(el0);
                if (el0.style.display === 'none') { el0.style.display = ''; popRender71(); }
                else el0.style.display = 'none';
                return;
            }
            var el = document.createElement('div');
            el.setAttribute('dir', 'rtl');
            el.style.cssText = 'position:fixed;top:56px;left:8px;z-index:2147483646;width:780px;max-width:96vw;' +
                'max-height:80vh;overflow:auto;background:#1e2430;color:#dfe6f1;border:1px solid #3a4356;' +
                'border-radius:10px;padding:10px 12px;font:12px/1.9 Tahoma,Verdana,sans-serif;text-align:right;' +
                'box-shadow:0 6px 24px rgba(0,0,0,0.45);';
            el.setAttribute('data-stamp', VERSION_TAG + 'p');
            document.body.appendChild(el);
            window.__opt71PopPanel = el; wireTopWindow71(el);
            if (typeof window.__opt71PopReady === 'undefined') window.__opt71PopReady = false;
            popRender71();
        } catch (e) {}
    }
    try {
        if (typeof window !== 'undefined' && window) {
            window.optPopOpen = function () { popupOpen71(); return true; };      // کنسول
            window.optPopClear = function () { if (window.__opt71PopRows) window.__opt71PopRows.length = 0; window.__opt71PopReady = false; try { popRender71(); } catch (ePC71) {} return true; };
            window.optIvFlush = function (m71f) { return ivFlush71(m71f === undefined ? true : m71f); };   // v9.0.10: mode اختیاری — پیش‌فرض true؛ 'unload' = آستانهٔ کوتاه
            window.optIvDump = function () { return JSON.parse(JSON.stringify(ivDb71())); };
            window.optDivCal = function () { return divCalEff(); };   // تقویمِ مؤثرِ سود
        }
    } catch (eG71) {}

    function toggle71(which) {                     // v7.1 — باز/بسته‌کردنِ پنل‌ها (از نوار یا کنسول: optPanels)
        try {
            if (typeof window === 'undefined' || !window) return;
            if (which === 'cfg') {
                if (window.__opt71Panel) { var p71 = window.__opt71Panel; bringTop71(p71); p71.style.display = (p71.style.display === 'none') ? '' : 'none'; }
                else buildPanel();
            } else if (which === 'wk') {
                if (window.__opt71WeekPanel) { var w71 = window.__opt71WeekPanel; bringTop71(w71); w71.style.display = (w71.style.display === 'none') ? '' : 'none'; }
                else buildWeekPanel();
            } else popupOpen71();
        } catch (e) {}
    }
    function bar71() {                             // نوارِ کوچکِ پایین-چپ: همیشه در دسترس
        try {
            if (typeof window === 'undefined' || !window) return;
            if (typeof document === 'undefined' || !document || !document.createElement || !document.body) {
                // Retry if body not ready — fix for console paste before DOM ready
                try { if (!window.__opt71BarRetry) { window.__opt71BarRetry=1; setTimeout(function(){ try { bar71(); } catch(e){} }, 500); } } catch(e){}
                return;
            }
            // v9.6.0.7 fix: clean old bars
            try {
                var oldBars = document.querySelectorAll('[data-stamp^="v"][data-stamp$="bar"]');
                for (var obi=0; obi<oldBars.length; obi++) {
                    var ob = oldBars[obi];
                    if (ob && ob.getAttribute('data-stamp') !== VERSION_TAG + 'bar') {
                        try { if (ob.parentNode) ob.parentNode.removeChild(ob); } catch(e){}
                    }
                }
            } catch(e){}
            var ob71 = window.__opt71Bar;
            if (ob71 && ob71.getAttribute && ob71.getAttribute('data-stamp') === VERSION_TAG + 'bar') return;
            if (ob71 && ob71.parentNode) ob71.parentNode.removeChild(ob71);   // v9.0.1: نوارِ نسخهٔ کهنه → بازسازی
            var b = document.createElement('div');
            b.setAttribute('dir', 'rtl');
            b.setAttribute('data-stamp', VERSION_TAG + 'bar');
            b.style.cssText = 'position:fixed;bottom:6px;left:8px;z-index:2147483647;display:flex;gap:4px;';
            b.innerHTML =
                '<button id="__opt71Bcfg" title="تنظیماتِ فیلتر" style="width:32px;height:26px;background:#2d6cdf;color:#fff;border:0;border-radius:6px;cursor:pointer;font:13px Tahoma;">⚙</button>' +
                '<button id="__opt71Bwk" title="استخر و پایه‌ها" style="width:32px;height:26px;background:#2f7d4f;color:#fff;border:0;border-radius:6px;cursor:pointer;font:12px Tahoma;">📅</button>' +
                '<button id="__opt71Bdbg" title="دیباگ" style="width:32px;height:26px;background:#9b6b22;color:#fff;border:0;border-radius:6px;cursor:pointer;font:12px Tahoma;">🐞</button>' +
                '<button id="__opt71Bpop" title="تحلیلِ قراردادها" style="width:32px;height:26px;background:#7a4ddf;color:#fff;border:0;border-radius:6px;cursor:pointer;font:12px Tahoma;">📊</button>' +
                '<button id="__opt71Bpipe" title="نمودار فیلتر — قیف تعداد نمادها" style="width:32px;height:26px;background:#10ac84;color:#fff;border:0;border-radius:6px;cursor:pointer;font:12px Tahoma;">📈</button>';
            document.body.appendChild(b);
            b.setAttribute('data-opt71-ui', '1');
            wireTopWindow71(b);
            window.__opt71Bar = b;
            var tg71 = function (bid, fn) { var x71 = b.querySelector(bid); if (x71) x71.onclick = function () { try { fn(); } catch (eT71) {} }; };
            tg71('#__opt71Bcfg', function () { toggle71('cfg'); });
            tg71('#__opt71Bwk', function () { toggle71('wk'); });
            tg71('#__opt71Bpop', function () { toggle71('pop'); });
            tg71('#__opt71Bpipe', function () { try { if (typeof pipelineOpen71 === 'function') pipelineOpen71(); else if (typeof buildPipelinePanel71 === 'function') { buildPipelinePanel71(); pipelineRender71(); var pp=document.getElementById('__opt71PipePanel'); if(pp) pp.style.display=''; } } catch(e){} });
            tg71('#__opt71Bdbg', function () { if (!window.__opt71DbgPanel) buildDebugPanel(); if (window.__opt71DbgPanel) { window.__opt71DbgPanel.style.display = window.__opt71DbgPanel.style.display === 'none' ? '' : 'none'; if (window.__opt71DbgRender) window.__opt71DbgRender(); } });
        } catch (e) {}
    }
    try { if (typeof window !== 'undefined' && window) { window.optPanels = toggle71; window.optDisableUI = hideUi71; window.optEnableUI = showUi71; window.optDbg = function (w) { if (!CONFIG.debugPanel) return 'پنل دیباگ خاموش است — optSet(\"debugPanel\", true)'; return dbgSnapshot(w); }; window.optDbgPanel = function(){ if (!window.__opt71DbgPanel) buildDebugPanel(); if (window.__opt71DbgPanel) { window.__opt71DbgPanel.style.display = window.__opt71DbgPanel.style.display === 'none' ? '' : 'none'; if (window.__opt71DbgPanel.style.display !== 'none') dbgTimerStart71(); } return true; }; window.optBench = function (on) { window.__opt71Bench = !!on; if (window.__opt71Bench) { CONFIG.debugPanel = true; var B = benchState71(); return B || 'debug unavailable'; } return true; }; window.optBenchReset = function () { if (window.__opt71Dbg && window.__opt71Dbg.bench) window.__opt71Dbg.bench = { enabled: !!window.__opt71Bench, scans: 0, totalMs: 0, lastMs: 0, avgMs: 0, samples: [], loops: {} }; return true; }; window.optBenchDump = function () { return dbgSnapshot('bench'); }; } } catch (e) {}

    function store() {
        try {
            if (typeof window !== 'undefined' && window) {
                return webStorage({
                    getItem: function (k) { return window[k]; },
                    setItem: function (k, v) { window[k] = v; },
                    removeItem: function (k) { try { delete window[k]; } catch (e) { window[k] = undefined; } }
                });
            }
        } catch (e) {}
        try { if (typeof localStorage !== 'undefined' && localStorage && probe(localStorage)) return webStorage(localStorage); } catch (e) {}
        try { if (typeof sessionStorage !== 'undefined' && sessionStorage && probe(sessionStorage)) return webStorage(sessionStorage); } catch (e) {}
        var MEM = (typeof window !== 'undefined' && window && window.__opt71Mem) ? window.__opt71Mem : {};
        return { __m: MEM, getItem: function (k) { return this.__m[k]; }, setItem: function (k, v) { this.__m[k] = v; } };
    }

    var RT_LOCAL = null;
    var DB_LOCAL = null;      // جدولِ رتبهٔ مقیم در حافظه، وقتی window در دسترس نیست
    function runtime() {
        try {
            if (typeof window !== 'undefined' && window) {
                if (!window.__opt71Rt) window.__opt71Rt = { cache: {}, n: 0, sum: 0,
                    checked: 0, fast: false, hits: 0, computes: 0 };
                return window.__opt71Rt;
            }
        } catch (e) {}
        if (!RT_LOCAL) RT_LOCAL = { cache: {}, n: 0, sum: 0, checked: 0,
                                    fast: false, hits: 0, computes: 0 };
        return RT_LOCAL;
    }

    function tehranMinutes(d) {
        var utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
        var t = new Date(utcMs + CONFIG.tzOffsetMin * 60000);
        return { min: t.getUTCHours() * 60 + t.getUTCMinutes(), day: t.getUTCDay() };
    }
    function inSession(d) {
        var tm = tehranMinutes(d), i, dayOk = false;
        for (i = 0; i < CONFIG.sessionDays.length; i++) {
            if (CONFIG.sessionDays[i] === tm.day) { dayOk = true; break; }
        }
        if (!dayOk) return false;
        if (__marketHolidayJdn71[String(jdnOfMs(d.getTime()))]) return false;
        var h = tm.min / 60;
        return (h >= CONFIG.sessionStartHour && h < CONFIG.sessionEndHour);
    }

    function pruneCache(RT, now) {
        if (RT.n <= CONFIG.maxCache) return;
        var keys = [], k;
        for (k in RT.cache) if (Object.prototype.hasOwnProperty.call(RT.cache, k)) keys.push(k);
        keys.sort(function (a, b) { return (RT.cache[a][1] || 0) - (RT.cache[b][1] || 0); });
        var drop = keys.length - CONFIG.maxCache, j;
        for (j = 0; j < drop; j++) { delete RT.cache[keys[j]]; RT.n = Math.max(0, RT.n - 1); }
    }

    function saveMetrics(RT, sym, metrics, now) {
        try {
            RT.computes = (RT.computes || 0) + 1;
            benchCount71('cache-save', 1);
            if (!RT.cache[sym]) RT.n++;
            RT.cache[sym] = [metrics, now];
            pruneCache(RT, now);
            var Dm940 = dbgState();
            if (Dm940) Dm940.cache = { n: RT.n, hits: RT.hits || 0, computes: RT.computes || 0, fast: !!RT.fast, avg: RT.avg || 0, t: now };

        } catch (e) {}
    }

    var perfBase = 0;
    function nowMs() {
        try {
            if (typeof performance !== 'undefined' && performance && performance.now) {
                var pp = performance.now();
                if (!perfBase) perfBase = pp;
                return pp - perfBase;
            }
        } catch (e) {}
        return Date.now();
    }

    function perfNote(RT, dt) {
        if (!(dt >= 0)) return;
        RT.checked++;
        benchNote71('heavy-scan', dt, 1);
        RT.sum += dt;
        if (RT.checked >= CONFIG.perfWindow) {
            RT.avg = RT.sum / RT.checked;
            RT.lastAvg = RT.avg;
            if (CONFIG.allowFastPath) {
                if (RT.avg > CONFIG.perfBudgetMs) RT.fast = true;
                else if (RT.avg < CONFIG.perfBudgetMs * 0.5) RT.fast = false;
            }
            RT.checked = 0; RT.sum = 0;
        }
    }

    function realizedVol(ihArr, days) {
        try {
            if (typeof ihArr === 'undefined' || !ihArr || !ihArr.length) return 0;
            var hist = getOrderedHistory(ihArr, CONFIG);   // داخلی: کهنه → جدید
            var rets = [], n = Math.min(days || 20, hist.length - 1), start71 = Math.max(0, hist.length - n - 1);
            for (var i = start71; i < hist.length - 1; i++) {
                var a = hist[i], b = hist[i + 1];
                if (!a || !b) continue;
                var pa = histClose71(a), pb = histClose71(b);
                if (!(pa > 0) || !(pb > 0)) continue;
                rets.push(Math.log(pb / pa));
            }
            if (rets.length < 6) return 0;
            if (CONFIG.useEwma && CONFIG.ewmaLambda > 0 && CONFIG.ewmaLambda < 1) {
                var lam = CONFIG.ewmaLambda, v2 = rets[rets.length - 1] * rets[rets.length - 1], ri;
                for (ri = rets.length - 2; ri >= 0; ri--) v2 = lam * v2 + (1 - lam) * rets[ri] * rets[ri];
                return Math.sqrt(v2 * TRADING_DAYS_PER_YEAR) * 100;
            }
            var mean = 0; for (var j = 0; j < rets.length; j++) mean += rets[j];
            mean /= rets.length;
            var varr = 0; for (var k2 = 0; k2 < rets.length; k2++) varr += (rets[k2] - mean) * (rets[k2] - mean);
            varr /= (rets.length - 1);
            return Math.sqrt(varr * TRADING_DAYS_PER_YEAR) * 100;
        } catch (e) { return 0; }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  مرحله ۱ — گیت‌های سخت
    // ═══════════════════════════════════════════════════════════════════
    var sym  = (typeof l18 !== 'undefined' && l18 != null) ? String(l18) : '';
    // v9.5.6.10: ultra-fast abort guard — if already aborted, exit without counting
    try {
        if (shouldAbort71()) {
            try { benchCount71('aborted',1); } catch(e){}
            return logRej(sym || '?', 'aborted');
        }
    } catch(eAB){}
    // v9.6.0.7: ultra-fast fail — آزاد از نامفهومی، با پیام فارسی واضح و NL=String.fromCharCode(10)
    try {
        if (!sym) {
            var _fastStreak = incFail71();
            var _fastThresh = (typeof window !== 'undefined' && window && window.__opt71AbortThreshold >= 0) ? window.__opt71AbortThreshold : 10;
            if (_fastThresh > 0 && _fastStreak >= _fastThresh) {
                try { window.__opt71Abort = true; } catch(e){}
            }
            if (_fastStreak <= 3 || (_fastThresh > 0 && _fastStreak >= _fastThresh) || _fastStreak % 10 === 0) {
                var _elapsed = 0;
                try { _elapsed = window.__opt71ScanStart ? Math.round((Date.now() - window.__opt71ScanStart)/1000) : 0; } catch(e){}
                var NL = String.fromCharCode(10);
                var _msgFast = '⛔ شناسهٔ نماد یافت نشد — دیده‌بان خالی یا اشتباه است' + NL +
                    'بررسی: ' + _fastStreak + ' نماد پیاپی بدون شناسه در ' + (_elapsed||0) + ' ثانیه' + NL +
                    'راهنما: وارد دیده‌بان «اختیار معامله» شوید و ستون‌های شناسه، نام، تعداد/حجم معاملات، قیمت خرید/فروش، آخرین قیمت و عمق را فعال کنید' + NL +
                    'فنی: l18=شناسه، l30=نام، tno=تعداد معاملات، tvol=حجم، pd1=بهترین خرید، po1=بهترین فروش، pl=آخرین قیمت، qd1/qo1=حجم صف' + NL +
                    'برای ادامه optClearAbort() یا دکمه «ادامه»، برای توقف optAbort()';
                if (_fastThresh > 0 && _fastStreak >= _fastThresh) {
                    _msgFast = '⛔ توقف خودکار — دیده‌بان نامعتبر یا ستون‌ها خاموش' + NL +
                        'دلیل: ' + _fastStreak + ' نماد پیاپی بدون شناسه/نام در ' + (_elapsed||0) + ' ثانیه بررسی شد' + NL +
                        'بررسی‌شده: ' + (window.__opt71TotalScanned||_fastStreak) + ' نماد' + NL +
                        'داده‌های لازم که یافت نشد:' + NL +
                        '  • شناسهٔ نماد (l18 / inscode) — مثل ضخود8045' + NL +
                        '  • نام کامل نماد (l30)' + NL +
                        '  • تعداد معاملات امروز (tno) و حجم معاملات (tvol)' + NL +
                        '  • بهترین قیمت خرید (pd1) و فروش (po1)' + NL +
                        '  • آخرین قیمت معامله (pl)' + NL +
                        '  • عمق دفتر سفارش: حجم خرید (qd1) و فروش (qo1)' + NL +
                        'اقدام:' + NL +
                        '  1) دیده‌بان «اختیار معامله» را باز کنید' + NL +
                        '  2) در تنظیمات دیده‌بان، ستون‌های بالا را فعال کنید' + NL +
                        '  3) فیلتر را دقیقاً روی همان دیده‌بان اجرا کنید' + NL +
                        'برای ادامه «ادامه با وجود خطا» یا optClearAbort()، برای توقف optAbort()';
                }
                ensureInputBanner71(_msgFast);
            }
            try { benchCount71('fast-fail-l18',1); } catch(e){}
            return logRej('?', 'input-data');
        }
    } catch(eFast){}
    var name = (typeof l30 !== 'undefined' && l30 != null) ? String(l30) : '';
    var nName = norm(name);

    function historyInput71() {
        var raw71 = null;
        try {
            if (typeof mw !== 'undefined' && mw && mw.InstHistory && typeof row !== 'undefined' && row && row['inscode'] != null) {
                raw71 = mw.InstHistory[row['inscode']];
            }
        } catch (eIH71) {}
        if (raw71 == null) {
            try { if (typeof ih !== 'undefined') raw71 = ih; } catch (eIH72) {}
        }
        return raw71;
    }
    function inputCode71() {
        try {
            if (typeof row !== 'undefined' && row && row['inscode'] != null) return String(row['inscode']);
            if (typeof inscode !== 'undefined' && inscode != null) return String(inscode);
        } catch (eIC71) {}
        return '';
    }
    function ensureInputBanner71(msg) {
        try {
            if (typeof window === 'undefined' || !window || typeof document === 'undefined' || !document || !document.body) return;
            var now = Date.now();
            var last = window.__opt71BannerLast || 0;
            var isAbort = !!(window.__opt71Abort);
            if (!isAbort && now - last < 1000) {
                window.__opt71BannerPending = msg;
                if (!window.__opt71BannerTimer) {
                    var delay = 1000 - (now - last);
                    if (delay < 0) delay = 0;
                    window.__opt71BannerTimer = setTimeout(function() {
                        try {
                            window.__opt71BannerTimer = 0;
                            var pending = window.__opt71BannerPending || msg;
                            window.__opt71BannerPending = '';
                            ensureInputBanner71(pending);
                        } catch(e){}
                    }, delay);
                }
                return;
            }
            window.__opt71BannerLast = now;
            if (window.__opt71BannerTimer) { try { clearTimeout(window.__opt71BannerTimer); } catch(e){} window.__opt71BannerTimer = 0; }

            var id = '__opt71InputBanner';
            var el = document.getElementById(id) || window.__opt71InputBannerEl;
            if (!el) {
                el = document.createElement('div');
                el.id = id;
                el.dir = 'rtl';
                el.style.cssText = 'position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:2147483647;max-width:92vw;background:#5a1f2a;color:#ffd7d7;border:2px solid #ff6b6b;border-radius:10px;padding:12px 14px;font:12px/1.9 Tahoma,Verdana,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.4);text-align:right;';
                document.body.appendChild(el);
                window.__opt71InputBannerEl = el;
                el.setAttribute('data-opt71-ui','1');
                try { if (typeof wireTopWindow71 === 'function') wireTopWindow71(el); } catch(e){}
            }
            var txtId = '__opt71InputBannerTxt';
            var txtEl = document.getElementById(txtId);
            if (!txtEl) {
                txtEl = document.createElement('div');
                txtEl.id = txtId;
                txtEl.style.cssText = 'white-space:pre-wrap;word-break:break-word;max-height:30vh;overflow:auto;';
                // controls
                var ctrl = document.createElement('div');
                ctrl.style.cssText = 'display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;';
                function bindBtn71(btn, fn){
                    try {
                        btn.type = 'button';
                        // v9.6.0.7: fix double execution - only addEventListener, no onclick
                        btn.addEventListener('click', function(e){
                            try { e.preventDefault(); e.stopPropagation(); } catch(ex){}
                            try { fn(); } catch(ex){}
                        });
                    } catch(e){}
                }
                var btnContinue = document.createElement('button');
                btnContinue.textContent = '▶ ادامه با وجود خطا';
                btnContinue.style.cssText = 'background:#2d6e4f;color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font:11px Tahoma;';
                bindBtn71(btnContinue, function(){ try { window.__opt71Abort = false; window.__opt71InputFailStreak = 0; el.style.display='none'; if (window.__opt71BannerTimer) { clearTimeout(window.__opt71BannerTimer); window.__opt71BannerTimer=0; } } catch(ex){} });
                var btnStop = document.createElement('button');
                btnStop.textContent = '⛔ توقف کامل';
                btnStop.style.cssText = 'background:#8a2a3a;color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font:11px Tahoma;';
                bindBtn71(btnStop, function(){ try { window.__opt71Abort = true; el.style.display='none'; } catch(ex){} });
                var btnClear = document.createElement('button');
                btnClear.textContent = '× بستن';
                btnClear.style.cssText = 'background:#ff6b6b;color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font:11px Tahoma;';
                bindBtn71(btnClear, function(){ try { el.style.display='none'; } catch(ex){} });
                var btnLog = document.createElement('button');
                btnLog.textContent = '📊 نمودار فیلتر';
                btnLog.title = 'نمایش گرافیکی فرآیند فیلترینگ';
                btnLog.style.cssText = 'background:#2d6cdf;color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font:11px Tahoma;';
                bindBtn71(btnLog, function(){
                    try {
                        if (typeof pipelineOpen71 === 'function') pipelineOpen71();
                        else {
                            if (window.optLog) console.log(window.optLog());
                            if (window.optInputLog) console.log(window.optInputLog());
                            if (window.optAbortStatus) console.log(window.optAbortStatus());
                        }
                    } catch(ex){
                        try { if (window.optLog) console.log(window.optLog()); } catch(e2){}
                    }
                });
                var btnLogDetail = document.createElement('button');
                btnLogDetail.textContent = '📋 لاگ فنی';
                btnLogDetail.title = 'جزئیات فنی برای برنامه‌نویس';
                btnLogDetail.style.cssText = 'background:#444c5e;color:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer;font:11px Tahoma;';
                bindBtn71(btnLogDetail, function(){
                    try {
                        if (typeof pipelineOpen71 === 'function') {
                            pipelineOpen71();
                            var pp = document.getElementById('__opt71PipePanel');
                            if (pp) {
                                var det = pp.querySelector('#__opt71PipeLogDetail');
                                if (det && det.style.display === 'none') {
                                    var btn = pp.querySelector('#__opt71PipeLog');
                                    if (btn) btn.click();
                                }
                            }
                        }
                    } catch(ex){}
                });
                ctrl.appendChild(btnContinue);
                ctrl.appendChild(btnStop);
                ctrl.appendChild(btnClear);
                ctrl.appendChild(btnLog);
                ctrl.appendChild(btnLogDetail);
                el.innerHTML = '';
                el.appendChild(txtEl);
                var help = document.createElement('div');
                help.id = '__opt71InputHelp';
                help.style.cssText = 'margin-top:8px;color:#ffe5a3;font:11px/1.7 Tahoma;border-top:1px dashed #8d4a56;padding-top:6px;';
                try {
                    var _reqCodes = ['l18','l30','tno','tvol','pd1','po1','pl','qd1','qo1'];
                    var _humanList = (typeof humanFieldList71 === 'function') ? humanFieldList71(_reqCodes) : 'شناسه، نام، تعداد/حجم معاملات، بهترین خرید/فروش، آخرین قیمت، حجم صف';
                    help.textContent = '💡 راهنما: وارد دیده‌بان «اختیار معامله» شوید. اگر این پیام را می‌بینید، ستون‌های لازم فعال نیست یا دیده‌بان اشتباه است. دکمه «نمودار فیلتر» تعداد نمادها در هر مرحله را نشان می‌دهد.';
                } catch(eHelp){
                    help.textContent = 'راهنما: دیده‌بان «اختیار معامله» را باز کنید. ستون‌های ضروری: شناسه (l18)، نام (l30)، تعداد (tno)، حجم (tvol)، خرید (pd1)، فروش (po1)، آخرین قیمت (pl)، صف خرید/فروش (qd1/qo1). optClearAbort() برای ادامه، optAbort() برای توقف.';
                }
                el.appendChild(help);
                el.appendChild(ctrl);
            }
            if (txtEl) {
                // v9.5.6.10: avoid duplicate suffix if msg already contains کل خطاها
                if (msg.indexOf('کل خطاها') === -1 && msg.indexOf('بررسی‌شده') === -1) {
                    var total = (window.__opt71InputFailTotal || 0);
                    var streak = (window.__opt71InputFailStreak || 0);
                    var extra = '';
                    if (total > 1) extra = ' (کل: ' + total + '، پیاپی: ' + streak + (window.__opt71Abort ? ' — متوقف' : '') + ')';
                    txtEl.textContent = msg + extra;
                } else {
                    txtEl.textContent = msg;
                }
            }
            el.style.display = '';
            try {
                var bar = window.__opt71Bar;
                if (bar) { bar.style.border = '2px solid #ff6b6b'; bar.title = msg; }
            } catch(e){}
        } catch(e){}
    }
    function clearInputBanner71() {
        try {
            var el = (typeof document !== 'undefined' && document) ? document.getElementById('__opt71InputBanner') : null;
            if (el) el.style.display = 'none';
            if (typeof window !== 'undefined' && window && window.__opt71Bar) {
                try { window.__opt71Bar.style.border = ''; window.__opt71Bar.title = ''; } catch(e){}
            }
            window.__opt71BannerPending = '';
        } catch(e){}
    }

    function inputNotice71(items) {
        if (!items || !items.length) return;
        var msg71 = '⚠ دادهٔ نماد ناقص: ' + items.join('؛ ') + '. → دیده‌بان اختیار و ستون‌های قیمتی را بررسی کنید. (l18=شناسه، l30=نام، tno=تعداد، tvol=حجم، pd1=بهترین خرید، po1=بهترین فروش، pl=آخرین قیمت، qd1/qo1=حجم صف)';
        try {
            if (typeof window === 'undefined' || !window) return;
            window.__opt71InputNotice = msg71;
            window.__opt71InputMissing = window.__opt71InputMissing || {};
            var code71 = '';
            try { code71 = inputCode71() || String(sym || 'unknown'); } catch(e){ code71 = String((typeof sym !== 'undefined' && sym) ? sym : 'unknown'); }
            var sig71 = code71 + '|' + items.join('|');
            var isNew = !window.__opt71InputMissing[sig71];
            if (isNew) {
                window.__opt71InputMissing[sig71] = 1;
            }
            var streak = incFail71();
            var threshold = (typeof window !== 'undefined' && window && window.__opt71AbortThreshold >= 0) ? window.__opt71AbortThreshold : 10;
            // Only warn to console for first few or every 20th to avoid spam
            if (isNew && (streak <= 5 || streak % 20 === 0)) {
                try { console.warn(msg71 + ' (streak=' + streak + ')'); } catch (eIN71) {}
            }
            // Show banner only for first 3, then every 10, and on abort threshold
            var shouldShowBanner = isNew && (streak <= 3 || streak % 10 === 0 || (threshold > 0 && streak >= threshold));
            if (threshold > 0 && streak >= threshold) {
                try { window.__opt71Abort = true; } catch(e){}
                var NL2 = String.fromCharCode(10);
                var abortMsg = '⛔ توقف خودکار — ' + streak + ' خطای پیاپی' + NL2 +
                    'دلیل: دیده‌بان فاقد داده‌های ضروری است (شناسه، قیمت خرید/فروش، حجم).' + NL2 +
                    'بررسی‌شده: ' + (window.__opt71TotalScanned||streak) + ' نماد، زمان: ' + (window.__opt71ScanStart?Math.round((Date.now()-window.__opt71ScanStart)/1000)+'s':'?') + NL2 +
                    'دادهٔ ناقص: ' + msg71 + NL2 +
                    'اقدام: 1) دیده‌بان اختیار را باز کنید 2) ستون‌های شناسه/نام/تعداد/حجم/قیمت خرید/فروش/آخرین قیمت/عمق را روشن کنید 3) فیلتر را همانجا اجرا کنید' + NL2 +
                    'برای ادامه «ادامه» یا optClearAbort()، برای توقف optAbort()';
                ensureInputBanner71(abortMsg);
            } else if (shouldShowBanner) {
                ensureInputBanner71(msg71);
            }
            // v9.5.6.10: avoid uiStatus thrash inside long loop — only for first few and abort
            if (streak <= 3 || (threshold > 0 && streak >= threshold)) {
                try { window.__opt71StatT = 0; } catch(e){}
                try { if (typeof runtime === 'function') { var RTb = runtime(); if (RTb) uiStatus(RTb); } } catch(e){}
            }
        } catch (eIN72) {}
    }
    function historyNotice71() {
        // history missing is less critical, don't count toward abort streak
        try {
            var msgH = 'تاریخچهٔ قیمت از mw.InstHistory[row["inscode"]] دریافت نشد یا معتبر نیست؛ برای ADX/EWMA/روندِ خودکار، تاریخچهٔ قیمت‌ها را در تنظیماتِ دیده‌بان فعال کنید';
            if (typeof window !== 'undefined' && window) {
                window.__opt71HistNotice = msgH;
                // only console once per inscode
                var codeH = '';
                try { codeH = inputCode71() || 'unknown'; } catch(e){}
                var sigH = codeH + '|hist';
                window.__opt71HistMissing = window.__opt71HistMissing || {};
                if (!window.__opt71HistMissing[sigH]) {
                    window.__opt71HistMissing[sigH] = 1;
                    try { console.warn('⚠ ' + msgH); } catch(e){}
                }
            }
        } catch(e){}
    }
    function inputPreflight71() {
        // v9.5.6.10: check abort first to avoid work inside long loop
        try { if (shouldAbort71()) return false; } catch(e){}
        var miss71 = [], raw71 = null;
        try { raw71 = historyInput71(); } catch(e){ raw71 = null; }
        // fast check for critical fields before history notice
        try {
            if (typeof l18 === 'undefined' || !l18) { /* already handled above */ }
        } catch(e){}

        if (!sym) miss71.push('شناسهٔ نماد (l18 / کد معاملاتی inscode)');
        if (!name) miss71.push('نام کامل نماد (l30)');
        var tno71 = num(typeof tno !== 'undefined' ? tno : 0), vol71 = num(typeof tvol !== 'undefined' ? tvol : 0);
        var bid71 = num(typeof pd1 !== 'undefined' ? pd1 : 0), ask71 = num(typeof po1 !== 'undefined' ? po1 : 0), last71 = num(typeof pl !== 'undefined' ? pl : 0);
        if (!(tno71 > 0)) miss71.push('تعداد معاملات امروز (tno)');
        if (!(vol71 > 0)) miss71.push('حجم معاملات امروز (tvol)');
        if (!(bid71 > 0) || !(ask71 > 0)) miss71.push('بهترین قیمت خرید (pd1) و فروش (po1)');
        if (!(last71 > 0)) miss71.push('آخرین قیمت معامله (pl)');
        if (CONFIG.useWeightedDepth) {
            var di71, qn71, pn71;
            for (di71 = 1; di71 <= 3; di71++) {
                qn71 = di71 === 1 ? (typeof qd1 !== 'undefined' ? qd1 : undefined) : di71 === 2 ? (typeof qd2 !== 'undefined' ? qd2 : undefined) : (typeof qd3 !== 'undefined' ? qd3 : undefined);
                pn71 = di71 === 1 ? (typeof pd1 !== 'undefined' ? pd1 : undefined) : di71 === 2 ? (typeof pd2 !== 'undefined' ? pd2 : undefined) : (typeof pd3 !== 'undefined' ? pd3 : undefined);
                if (!(num(qn71) > 0) || !(num(pn71) > 0)) { miss71.push('عمق بازار: حجم و قیمت خرید سطح ' + di71 + ' (qd' + di71 + '/pd' + di71 + ')'); break; }
            }
        }
        if (!raw71) historyNotice71();
        if (miss71.length) { inputNotice71(miss71); return false; }
        return true;
    }
    var RT   = runtime();
    // v9.5.6.10: abort guard - exit fast if user requested stop
    try {
        if (shouldAbort71()) {
            benchCount71('aborted',1);
            return logRej(sym || '?', 'aborted');
        }
    } catch(e){}
    if (!CONFIG.allowFastPath) RT.fast = false;
    var NOW  = Date.now();
    var usedFast71 = false;
    var live = isBacktest() ? true : inSession(new Date());
    try { uiStatus(RT); } catch(e){}
    try { wgUiTick(); } catch(e){}
    try { if (window.__opt71PipePanel && window.__opt71PipePanel.style.display !== 'none') pipelineRender71(); } catch(e){}

    var __hist = null;
    try { __hist = normalizeHistory(historyInput71()); } catch (eH71) { __hist = null; }
    if (!__hist) historyNotice71();
    if (!inputPreflight71()) return logRej(sym || '?', 'input-data');

    var isCall = (sym.indexOf('ض') === 0);
    var isPut  = (sym.indexOf('ط') === 0);
    if (!isCall && !isPut) return logRej(sym, 'not-option');

    // preflight passed -> reset fail streak
    try { resetFail71(); } catch(e){}

    try { uiStatus(RT); } catch(e){}
    try { wgUiTick(); } catch(e){}
    try { if (window.__opt71PipePanel && window.__opt71PipePanel.style.display !== 'none') pipelineRender71(); } catch(e){}

    var cycle = CONFIG.computeIntervalMs;
    if (!live) cycle = cycle * Math.max(1, CONFIG.offHoursFactor);
    if (RT.fast) cycle = Math.max(4000, Math.round(cycle * 0.6));  // در حالت سریع، تازه‌تر

    var ce = RT.cache[sym];
    var offOnce = !live && CONFIG.offHoursOnce;

    if (!live && CONFIG.enforceMarketHours) return logRej(sym, 'off-hours');  // بیرونِ ساعت: هیچ خروجی (حتی از کش)

    if (!offOnce && ce && (NOW - (ce[1] || 0)) > CONFIG.cacheTtlMs) {
        if (RT.cache[sym]) { delete RT.cache[sym]; RT.n = Math.max(0, RT.n - 1); } ce = null;           // سنجهٔ کهنه → دور (v9.5.3: گاردِ منفی‌نشدنِ n)
    }
    if (ce && (!ce[0] || !ce[0].strike)) { delete RT.cache[sym]; RT.n = Math.max(0, RT.n - 1); ce = null; }

    var useCache = false;

    var P0 = 0;                                            // زمانِ سنجشِ بودجهٔ زمانیِ مسیرِ سنگین
    var METRICS = null;                                    // سنجه‌های محاسبه‌شدهٔ این نماد
    var gateFail = '';                                     // v7: دلیلِ رد (رشتهٔ خالی = پاس)

    var rowDays71 = -1, rowM71 = 0, rowY71 = 0, rowExpSrc71 = '', rowExpJdn71 = 0;
    if (CONFIG.multiExpiry) {
        var mE71 = nName.match(/(1[3-4]\d\d|1500)\s*[\/.\-]\s*(0?[1-9]|1[0-2])(?!\d)(?:\s*[\/.\-]\s*(\d{1,2}))?/);
        if (!mE71) return logRej(sym, 'expiry');
        rowY71 = +mE71[1]; rowM71 = +mE71[2];
        var rowD71 = mE71[3] ? +mE71[3] : 30;
        if (!isValidJDate(rowY71, rowM71, rowD71)) return logRej(sym, 'expiry');
        rowExpJdn71 = j2d(rowY71, rowM71, rowD71);
        rowDays71 = rowExpJdn71 - jdnOfMs(btNow());
        if (rowDays71 < 0) return logRej(sym, 'expiry-past');
        rowExpSrc71 = rowY71 + '\\s*[\\/.\\-]\\s*' + (rowM71 < 10 ? '0?' + rowM71 : String(rowM71)) + '(?!\\d)';
    }
    if (!CONFIG.multiExpiry && !EXPIRY_RE.test(nName)) return logRej(sym, 'expiry');

    // v9.2: DTE باید قبل از استفاده از cache محاسبه و کنترل شود؛
    // در غیر این صورت non-multi پس از انقضا و multi در آستانهٔ minDaysLeft stale می‌ماند.
    var currentDays71 = CONFIG.multiExpiry ? rowDays71 : daysToExpiry(new Date(btNow()));
    if (currentDays71 < 0) return logRej(sym, 'expiry-past');
    if (currentDays71 < CONFIG.minDaysLeft) return logRej(sym, 'dte');
    var expiryKey71 = CONFIG.multiExpiry
        ? rowY71 + '/' + (rowM71 < 10 ? '0' + rowM71 : String(rowM71)) + '/' + (rowD71 < 10 ? '0' + rowD71 : String(rowD71))
        : CONFIG.expiryJY + '/' + (CONFIG.expiryJM < 10 ? '0' + CONFIG.expiryJM : String(CONFIG.expiryJM)) + '/' + (CONFIG.expiryJD < 10 ? '0' + CONFIG.expiryJD : String(CONFIG.expiryJD));
    var cacheSig71 = modelCacheSig(CONFIG, expiryKey71, currentDays71, __hist, nName);
    if (ce && (!ce[0] || ce[0].cacheSig !== cacheSig71)) {
        delete RT.cache[sym]; RT.n = Math.max(0, RT.n - 1); ce = null;
    }
    useCache = !!(ce && ce[0] && ce[0].cacheSig === cacheSig71 &&
                   (offOnce || (NOW - ce[1]) < cycle));

    var vol = num((tvol)), tradeNo = num((tno));
    var bid = num((pd1)), ask = num((po1));
    wgObserveLive({ spreadPct: (bid > 0 && ask > 0) ? (ask - bid) / ask * 100 : -1, tno: tradeNo, tvol: vol });
    if (!(tradeNo >= CONFIG.minTno)) return logRej(sym, 'tno');
    if (!(vol >= CONFIG.minTvol)) return logRej(sym, 'tvol');

    var NS = (typeof window !== 'undefined' && window) ? (window.__opt71NewSyms = window.__opt71NewSyms || {}) : null;
    var isNewSym = false;
    if (NS && !isBacktest()) {   // v8.0.1c: در بک‌تست زمان ثابت است → ثبتِ نمادِ تازه خاموش
        var nsOrder71 = window.__opt71NewSymsOrder = window.__opt71NewSymsOrder || [];
        var nsMap71 = window.__opt71NewSymsOrderMap = window.__opt71NewSymsOrderMap || Object.create(null);
        if (!window.__opt71NewSymsOrderReady || !window.__opt71NewSymsOrderMapReady) {
            nsOrder71.length = 0; nsMap71 = window.__opt71NewSymsOrderMap = Object.create(null);
            for (var nsKey71 in NS) if (Object.prototype.hasOwnProperty.call(NS, nsKey71) && NS[nsKey71] > 0) nsOrder71.push(nsKey71);
            nsOrder71.sort(function (aa71, bb71) { return (NS[aa71] || 0) - (NS[bb71] || 0); });
            for (var nsIx71 = 0; nsIx71 < nsOrder71.length; nsIx71++) nsMap71[nsOrder71[nsIx71]] = 1;
            window.__opt71NewSymsOrderReady = 1;
            window.__opt71NewSymsOrderMapReady = 1;
        }
        var nowNs71 = btNow(), cutoffNs71 = nowNs71 - 10 * 86400000, oldNs71;
        while (nsOrder71.length && (!NS[nsOrder71[0]] || NS[nsOrder71[0]] < cutoffNs71)) {
            oldNs71 = nsOrder71.shift(); delete NS[oldNs71]; delete nsMap71[oldNs71];
        }
        while (nsOrder71.length > 500) {
            oldNs71 = nsOrder71.shift(); delete NS[oldNs71]; delete nsMap71[oldNs71];
        }
        if (!nsMap71[sym]) {
            while (nsOrder71.length >= 500) {
                oldNs71 = nsOrder71.shift(); delete NS[oldNs71]; delete nsMap71[oldNs71];
            }
            if (!Object.prototype.hasOwnProperty.call(NS, sym)) NS[sym] = nowNs71;
            nsOrder71.push(sym); nsMap71[sym] = 1;
        }
        isNewSym = (nowNs71 - NS[sym]) < 3 * 86400000;
    }
    if (isNewSym && !(tradeNo >= CONFIG.newSymbolMinObs) && !CONFIG.allowNewSymbols && !(CONFIG.multiExpiry && rowDays71 > (CONFIG.distantDays > 0 ? CONFIG.distantDays : 45))) return logRej(sym, 'new-sym');   // v9.0.0

    if (CONFIG.enforceVolumeBase) {
        var bvolQ = num(typeof bvol !== 'undefined' ? (bvol) : 0);
        if (bvolQ > 0 && vol < bvolQ * CONFIG.volumeBaseRatio) return logRej(sym, 'base-vol');
    }

    var last = num((pl));
    if (CONFIG.blockOnHalt && !(last > 0)) return logRej(sym, 'halt');
    if (!(last >= CONFIG.minPrice)) return logRej(sym, 'price');

    if (!(bid > 0 && ask > 0)) return logRej(sym, 'no-quote');
    // Quote updates can transiently cross; classify it explicitly and leave the
    // row without entering the heavy model/cache path. Never price a crossed book.
    if (bid > ask) { gateFail = 'crossed-book'; return logRej(sym, gateFail); }   // transient quote mismatch is visible through optLog
    var spreadPct = (ask - bid) / ask * 100;
    if (!(spreadPct <= CONFIG.maxSpread)) return logRej(sym, 'spread');

    var avgTrade = tradeNo > 0 ? vol / tradeNo : vol;        // میانگین اندازهٔ هر معامله
    if (!(avgTrade > 0)) return logRej(sym, 'avg-trade');

    function lvl(qq, pp) { var nq = num(qq), np = num(pp); return (nq > 0 && np > 0) ? [nq, np] : null; }
    var askLvl = [lvl((qo1), (po1)), lvl((qo2), (po2)), lvl((qo3), (po3))];
    var bidLvl = [lvl((qd1), (pd1)), lvl((qd2), (pd2)), lvl((qd3), (pd3))];

    var DW = (CONFIG.useWeightedDepth && Array.isArray(CONFIG.depthWeights) &&
              CONFIG.depthWeights.length === 3) ? CONFIG.depthWeights : [1, 1, 1];
    var askQty = 0, askVal = 0, bidQty = 0, bidVal = 0, i2, wI;
    for (i2 = 0; i2 < 3; i2++) {
        wI = (typeof DW[i2] === 'number' && DW[i2] >= 0) ? DW[i2] : 1;
        if (askLvl[i2]) { askQty += askLvl[i2][0] * wI; askVal += askLvl[i2][0] * askLvl[i2][1] * wI; }
        if (bidLvl[i2]) { bidQty += bidLvl[i2][0] * wI; bidVal += bidLvl[i2][0] * bidLvl[i2][1] * wI; }
    }
    if (!(askQty > 0) || !(bidQty > 0)) return logRej(sym, 'depth0');

    if (CONFIG.blockOnOrderQueue) {
        var qTot = askQty + bidQty;
        if (qTot > 0 && bidQty / qTot > 1 - (CONFIG.orderQueueThreshold > 0 ? CONFIG.orderQueueThreshold : 0.005))
            return logRej(sym, 'buy-queue');
    }

    var depthQty   = Math.min(askQty, bidQty);        // سمتِ ضعیف‌تر = گلوگاهِ واقعی
    var depthTrade = depthQty / avgTrade;             // چند «معاملهٔ معمولی» جا می‌شود؟
    if (!(depthTrade >= CONFIG.minDepthTrades)) return logRej(sym, 'depth');

    if (!useCache) {
    P0 = nowMs();

    // ═══════════════════════════════════════════════════════════════════
    //  مرحله ۲ — استخراج اعمال و پایه
    // ═══════════════════════════════════════════════════════════════════
    nName = norm(name);
    var parts = nName.split(/[\-\u2010-\u2015\u2212]+/);
    var strike = 0, ei = -1, i3;
    var S = 0, baseName = '', sSrc = '', iv = 0, ivSrc = 'IV', vPct = 60, T = 21 / 365, r = 0;
    var daysLeft = -1, delta = 0, thetaD = 0, leverage = 0, costRT = 0, expRet = 0, vReal = 0;
    var dtePenalty = 0, adjRet = 0, ivEdge = 0, mnyPct = 0, mir = 1, status = 'ATM';
    for (i3 = 0; i3 < parts.length; i3++) if ((CONFIG.multiExpiry ? rowExpRe71(rowY71, rowM71) : EXPIRY_RE).test(parts[i3])) { ei = i3; break; }
    if (ei > 0) strike = numOf(parts[ei - 1]);
    if (!strike && ei >= 0 && ei + 1 < parts.length) strike = numOf(parts[ei + 1]);
    if (!strike) { for (i3 = 0; i3 < parts.length; i3++) { if (i3 === ei) continue; var c = numOf(parts[i3]); if (c > 0) { strike = c; break; } } }
    if (!strike) { var mm = nName.match((CONFIG.multiExpiry ? rowExpSrc71 : CONFIG.expiry) + '[\\s\\-/]*(\\d[\\d,]*)'); if (mm) strike = numOf(mm[1]); }
    if (!gateFail && !(strike > 0)) gateFail = 'strike';

    var sRes = resolveBase(nName);
    S = sRes.S; baseName = sRes.base; sSrc = sRes.src;
    if (!(baseName)) inputNotice71(['نام پایه و قیمت پایه از اطلاعات نماد قابل استخراج نیست']);
    if (!(S > 0)) { inputNotice71(['قیمت پایهٔ معتبر برای ' + (baseName || 'نماد') + ' موجود نیست؛ مقدار پایه یا دسترسی قیمت پایه را اصلاح کنید']); return logRej(sym, 'base-price'); }
    if (!gateFail && !(S > 0)) gateFail = 'base-price';

    var isTabeii = (ei > 1) ? /^[\u0636\u0637]/.test(String(parts[ei - 2] || '')) : false;   // پایه = خودِ اختیار (ض/ط)
    var divPv = 0;
    try {
        if (S > 0 && (CONFIG.dividendAutoFetch || !wgEmpty(CONFIG.dividendCalendar))) fetchDividends();
        fetchRiskFreeCurve71();
        var todayJdn = jdnOfMs(btNow());
        var expJdn = (CONFIG.multiExpiry && rowExpJdn71 > 0) ? rowExpJdn71 : j2d(CONFIG.expiryJY, CONFIG.expiryJM, CONFIG.expiryJD);   // v9.0.1: سررسیدِ خودِ ردیف
        var dInf = divAdjust(norm(baseName), todayJdn, expJdn);
        divPv = dInf.pv;
        if (CONFIG.blockOnDividendDay && dInf.onExDay) return logRej(sym, 'div-day');
    } catch (e) {}
    if (!(divPv > 0) || divPv >= S * 0.5) divPv = 0;
    var Sd = divPv > 0 ? S - divPv : S;

    // ═══════════════════════════════════════════════════════════════════
    //  مرحله ۳ — زمان، نوسان‌پذیری، IV
    // ═══════════════════════════════════════════════════════════════════
    if (CONFIG.multiExpiry) daysLeft = rowDays71;             // v9.0.0
    else daysLeft = daysToExpiry(new Date(btNow()));   // v7: در بک‌تست، «امروز» ثابت است
    if (daysLeft < 0) return logRej(sym, 'expiry-past');   // v9.5.3: non-multi هم سررسیدِ گذشته را رد کند — نه Tِ ساختگیِ ۲۱روزه
    if (!gateFail && daysLeft >= 0 && daysLeft < CONFIG.minDaysLeft) gateFail = 'dte';   // تلهٔ نزدیک سررسید
    T = (daysLeft > 0 ? daysLeft : 21) / 365;
    r = effRate(jdnOfMs(btNow())) / 100;

    var vBase = CONFIG.baseVol[baseName] || 60;
    vReal = realizedVol(__hist, 20);          // v7.1: [ih] واقعی (پیش‌تر: متغیرِ تاریخچهٔ ناموجود!)
    vPct       = vReal > 5 ? Math.round((vBase + vReal) / 2) : vBase;
    if (vPct < CONFIG.volFloor) vPct = CONFIG.volFloor;
    if (vPct > CONFIG.volCeil)  vPct = CONFIG.volCeil;
    var v = vPct / 100;

    var CS  = resolveCS(baseName);          // ⭐ اندازهٔ قراردادِ هر نمادِ پایه جداگانه
    if (!(CS > 0)) { inputNotice71(['اندازهٔ قرارداد برای ' + (baseName || 'نماد') + ' معتبر نیست؛ مقدار رسمی قرارداد را در تنظیمات/دادهٔ پایه وارد کنید']); return logRej(sym, 'contractSize'); }
    var mid = (bid + ask) / 2 / CS;      // قیمت میانه به‌ازای هر سهم
    var askS = ask / CS;                 // قیمتِ ورودِ واقعی به‌ازای هر سهم

    var modelChk = bs(Sd, strike, T, r, v, isCall)[0];   // v7: مدل با Sِ پس از کسرِ سود
    if (!(modelChk > 0) || modelChk > askS * CONFIG.unitGuardX || askS > modelChk * CONFIG.unitGuardX) {
        if (!gateFail) gateFail = 'unit';
    }
    var intrinsic = Math.max(0, isCall ? (Sd - strike) : (strike - Sd));
    var discK = strike * Math.exp(-r * T);
    var lowerBound = isCall ? Math.max(Sd - discK, 0) : Math.max(discK - Sd, 0);
    var upperBound = isCall ? Sd : discK;
    var timeValue = mid - intrinsic;              // ارزش ذاتی جاری؛ lowerBound برای آربیتراژ جداست
    var arbTol71 = Math.max(1e-6, Math.abs(mid) * 1e-6);
    if (!(mid >= lowerBound - arbTol71 && mid <= upperBound + arbTol71)) if (!gateFail) gateFail = 'arb-bound';

    if (RT.fast && CONFIG.allowFastPath) {
        usedFast71 = true;
        iv = v; ivSrc = 'IVf';
        if (!(modelChk > 0) || modelChk > mid * 3 || mid > modelChk * 3) if (!gateFail) gateFail = 'unit-fast';
    } else {
        iv = impliedVol(mid, Sd, strike, T, r, isCall);   // ۶۰ تکرار bisection
        ivSrc = 'IV';                                    // منبعِ نوسان‌پذیریِ استفاده‌شده

    if (!(iv > 0)) {
        // IV~ فقط نزدیک lower bound و به‌عنوان fallback تشخیصی؛ قیمت زیر bound مجاز نیست.
        var ivTol71 = Math.max(1e-6, Math.abs(mid) * 1e-4);
        if (mid >= lowerBound - ivTol71 && Math.abs(mid - lowerBound) <= Math.max(1e-6, Math.abs(mid) * 0.001)) {
            iv = v; ivSrc = 'IV~';
        } else {
            if (!gateFail) gateFail = 'iv-bad';
        }
    }
    if (iv < 0.05 || iv > 5) if (!gateFail) gateFail = 'iv-range';
    }   // ← پایانِ elseِ مسیرِ سریع        // قیمت بی‌منطق (تابلوی خراب یا دادهٔ کهنه)

    if (ask > 0 && (Math.max(0, timeValue) / askS * 100) > CONFIG.maxTimeValuePct) if (!gateFail) gateFail = 'time-value';

    if (ivSrc === 'IV' && iv * 100 > vPct + CONFIG.maxIvPremium) if (!gateFail) gateFail = 'iv-premium';   // v8.0.1: IV~/IVf → گیتِ بی‌معنا، رد شود

    var greeks  = bs(Sd, strike, T, r, iv, isCall);
    delta   = Math.abs(greeks[1]);
    thetaD  = greeks[2];                       // ریال به‌ازای هر روز
    mnyPct  = Math.round(Sd / strike * 100);

    // ═══════════════════════════════════════════════════════════════════
    //  مرحله ۴ — سنجه‌های تصمیم (همه «کوچک‌تر بهتر» یا «بزرگ‌تر بهتر»)
    // ═══════════════════════════════════════════════════════════════════

    // ۴.۱ اهرم مؤثر = دلتا × پایه ÷ قیمت اختیار  (چند برابرِ خودِ سهم سود می‌دهد)
    leverage = askS > 0 ? delta * Sd / askS : 0;               // بدون واحد
    if (!(leverage > 0) || !(leverage <= CONFIG.maxLeverage)) if (!gateFail) gateFail = 'leverage';

    // v9.2: avgAsk- bid و ask-avgBid هر دو شامل spread بودند و spread را دوبار می‌شمردند.
    var avgAskBook = askVal / askQty;
    var avgBidBook = bidVal / bidQty;
    var bookMid = (avgAskBook + avgBidBook) / 2;
    costRT = (bookMid > 0 && avgAskBook >= avgBidBook)
        ? (avgAskBook - avgBidBook) / bookMid * 100
        : 999;
    if (!(costRT >= 0 && costRT <= CONFIG.maxCostRT)) if (!gateFail) gateFail = 'cost-rt';

    var thetaPct = askS > 0 ? Math.abs(thetaD) / askS * 100 : 0;   // بدون واحد

    var effView = CONFIG.view;
    if (CONFIG.autoView && CONFIG.autoViewWeight > 0) {
        var tvT = detectTrend(__hist);            // v7.1: [ih] واقعی
        effView = Math.max(-1, Math.min(1, (1 - CONFIG.autoViewWeight) * CONFIG.view + CONFIG.autoViewWeight * tvT));
    }
    var driftDaily = effView * CONFIG.viewDailyPct;
    expRet = expectedReturn(Sd, strike, T, r, iv, isCall, askS, driftDaily, CONFIG.holdDays);   // v7: Sِ مدل
    if (CONFIG.supportTabeii && isTabeii) expRet = expRet * (1 - (CONFIG.tabeiiDiscount > 0 ? CONFIG.tabeiiDiscount : 0) / 100);

    dtePenalty = 0;
    var holdCalDays71 = Math.max(1, (CONFIG.holdDays > 0 ? CONFIG.holdDays : 1) * 365 / TRADING_DAYS_PER_YEAR);
    if (CONFIG.minDteWeight && daysLeft >= 0 && daysLeft < holdCalDays71 * 2) {
        dtePenalty = (1 - daysLeft / (holdCalDays71 * 2)) * 15;   // از ۱۵٪ در dte=0 خطی تا ۰٪ در dte=2×holdDays_cal
    }
    adjRet = expRet - dtePenalty;
    if (!(adjRet >= CONFIG.minExpRet)) if (!gateFail) gateFail = 'exp-ret';   // v9.1.3: گیت روی adjRet — یکدستیِ rank/warm؛ درخواستِ کاربر: ستونِ ER همان مقدارِ گیت است

    ivEdge = (vPct / 100 - iv) * 100;          // مثبت = ارزان
    var moneyness = Sd / strike;
    mir    = isCall ? moneyness : (2 - moneyness);   // «میرا» → برای Put هم درست
    status = (mir > 1.03) ? 'ITM' : (mir >= 0.97) ? 'ATM' : 'OTM';

    var obs71 = { base: baseName, nName: nName, S: S, strike: strike, daysLeft: daysLeft,
        T: T, r: r, isCall: isCall, mid: mid, askS: askS, modelChk: modelChk,
        intrinsic: intrinsic, timeValue: timeValue, divPv: divPv, vReal: vReal, csUsed: CS,
        spreadPct: spreadPct, tno: tradeNo, tvol: vol,
        iv: iv, ivSrc: ivSrc, vPct: vPct, costRT: costRT, leverage: leverage };
    // All four calibration metrics are sampled before the final survivor gate.
    wgObservePreGate(obs71);
    if (!gateFail) wgObserve(obs71);
    if (!useCache) { perfNote(RT, nowMs() - P0); }

    if (!gateFail) METRICS = { strike: strike, S: S, baseName: baseName, iv: iv, ivSrc: ivSrc,
                vPct: vPct, T: T, r: r, daysLeft: daysLeft, delta: delta,
                thetaD: thetaD, leverage: leverage, costRT: costRT, expRet: expRet,
                dtePenalty: dtePenalty, adjRet: adjRet, ivEdge: ivEdge,
                thetaPct: thetaPct, mnyPct: mnyPct, mir: mir, status: status, isCall: isCall, sSrc: sSrc,
                Sd: Sd, cs: CS, vReal: vReal, cacheSig: cacheSig71 };   // vReal is retained for cache-hit pre-gate calibration
    } else {
        RT.hits = (RT.hits || 0) + 1;           // ریاضیِ سنگین «رد» شد → سنجهٔ کش‌شده
        var M = ce[0];
        strike = M.strike; S = M.S; baseName = M.baseName; iv = M.iv; ivSrc = M.ivSrc;
        vPct = M.vPct; T = M.T; r = M.r; daysLeft = currentDays71; delta = M.delta;
        thetaD = M.thetaD; leverage = M.leverage; costRT = M.costRT; expRet = M.expRet; vReal = M.vReal > 0 ? M.vReal : 0;
        dtePenalty = M.dtePenalty; adjRet = M.adjRet; ivEdge = M.ivEdge;
        thetaPct = M.thetaPct; mnyPct = M.mnyPct; mir = M.mir; status = M.status;
        sSrc = M.sSrc || '';
        Sd = (M.Sd > 0) ? M.Sd : S;   // v9.0.1: Sd در مسیرِ کش هم بازیابی شود
        CS = M.cs > 0 ? M.cs : resolveCS(baseName);
        METRICS = M;
        // Cache hits retain the last heavy metrics; resample them once per scan so
        // cr/ivp/lev/vr have the same observation cadence as sp/tn/tv.
        // Sampling cadence: true → cr/ivp/lev/vr follow scan-tick; false → heavy compute only.
        if (CONFIG.poolPreGateEveryScan !== false) wgObservePreGate({ iv: iv, ivSrc: ivSrc, vPct: vPct, costRT: costRT, leverage: leverage, vReal: vReal });
    }
    if (!METRICS) return logRej(sym, gateFail || 'gate');
    var Dm71 = dbgState();
    if (Dm71) { Dm71.metrics.last = { sym: sym, name: name, base: baseName, strike: strike, bid: bid, ask: ask, S: S, CS: CS, iv: iv, expRet: expRet, adjRet: adjRet, costRT: costRT, daysLeft: daysLeft, t: Date.now() }; Dm71.metrics.history.push(Dm71.metrics.last); if (Dm71.metrics.history.length > 10) Dm71.metrics.history.shift(); }

    // ═══ v7.1 — ADX + IV Rank (مشترک: مسیرِ سنگین و کش؛ ثبتِ پیش از گیت‌ها) ═══
    if (!(CS > 0)) CS = resolveCS(baseName);        // مسیرِ کش: CS ست نشده بود (fix: posTag کش)
    if (!(askS > 0)) askS = ask / CS;
    var adxVal = CONFIG.useAdx ? computeAdx71(__hist, CONFIG.adxPeriod) : 0;
    var ivRank = null;
    if (CONFIG.useIvRank && iv > 0) {
        var atmB71 = CONFIG.ivAtmBand > 0 ? CONFIG.ivAtmBand : 5;   // v8.3.0
        var ivTag71 = (Math.abs(mnyPct - 100) < atmB71 ? 'atm' : null);
        if (ivSrc === 'IV' && !useCache) ivRankRecord(baseName, iv * 100, ivTag71);   // فقط IV حل‌شده در محاسبهٔ سنگین
        ivRank = ivRankCompute(baseName, iv * 100, ivTag71);   // same-tag compare
    }
    if (!useCache) saveMetrics(RT, sym, METRICS, Date.now());

    // ═══════════════════════════════════════════════════════════════════
    //  مرحله ۵ — مرز پارتو در گروه (پایه × نوع)
    // ═══════════════════════════════════════════════════════════════════
    var groupKey = baseName + (isCall ? '_C' : '_P') +
        ((CONFIG.multiExpiry && CONFIG.maxPerExpiry > 0)
            ? '_E' + rowY71 + (rowM71 < 10 ? '0' + rowM71 : String(rowM71)) + (rowD71 < 10 ? '0' + rowD71 : String(rowD71))
            : '');   // v9.2: maxPerGroup across expiries; maxPerExpiry isolates exact expiry
    var mode = 'fallback', rank = 1, pareto = 1, dom = 0, size = 1, gbGlobal71 = 0;   // v9.0.3

    try {
        var St = rankStore(), KEY = '__optRankV71', now = Date.now();

        var RC = (typeof window !== 'undefined' && window)
                 ? (window.__opt71Db || (window.__opt71Db = { db: null, ver: -1, t: 0, tf: 0, dirty: 0 }))
                 : (DB_LOCAL || (DB_LOCAL = { db: null, ver: -1, t: 0, tf: 0, dirty: 0 }));
        if (RC.schema !== RANK_SCHEMA71) {
            RC.db = null; RC.ver = -1; RC.dirty = 0; RC.schema = RANK_SCHEMA71;
        }
        var VKEY = KEY + '_v';
        var flushEvery = (CONFIG.rankFlushEvery > 0) ? CONFIG.rankFlushEvery : 1;

        var db = null, blob = null, stVer = 0;
        try {
            var sv = St.getItem(VKEY);
            if (sv !== null && sv !== undefined && parseInt(sv, 10) >= 0) stVer = parseInt(sv, 10);
        } catch (e) {}

        if (RC.ver < 0) RC.ver = stVer;

        if (RC.db && RC.ver === stVer) {
            db = RC.db;                                     // ← بدون هیچ parse
        } else {
            blob = St.getItem(KEY);
            if (blob) { try { db = JSON.parse(blob); } catch (e) { db = null; } }
            RC.ver = stVer;
        }
        RC.t = now;                                         // آخرین تماس با جدولِ رتبه
        var today = ivDayKey71(btNow());
        if (!db || typeof db !== 'object' || db.schema !== RANK_SCHEMA71 || db.day !== today) db = { schema: RANK_SCHEMA71, day: today, ts: now, born: now, g: {} };
        if (now - (db.ts || 0) > CONFIG.resetAfter) { db.g = {}; db.born = now; db.scan = null; }
        db.ts = now;
        if (!db.born) db.born = now;
        RC.db = db;

        var scan = db.scan || (db.scan = { first: '', passes: 0, last: now, cycle: 0, cycleStart: 0 });
        if (!(scan.cycleStart > 0)) scan.cycleStart = now;
        if (!scan.first) {
            scan.first = sym; scan.cycleStart = now;
        } else if (sym === scan.first) {
            var cycleMs = now - scan.cycleStart;
            if (cycleMs > 200 && cycleMs < 600000) scan.cycle = scan.cycle ? Math.round((scan.cycle + cycleMs) / 2) : cycleMs;
            scan.cycleStart = now;
            scan.passes++;
            var L71c = LOG(); if (L71c) { L71c.passed = 0; L71c.rejected = {}; }
        }
        scan.last = now;
        db.scan = scan;

        var effTtl = CONFIG.rankTtl;
        if (scan.cycle > 0) effTtl = Math.max(effTtl, scan.cycle * 2 + 5000);

        var g = db.g[groupKey] || (db.g[groupKey] = {});
        g[sym] = { r: adjRet, c: costRT, d: depthTrade, t: now };

        var gk;
        for (gk in g) {
            if (!Object.prototype.hasOwnProperty.call(g, gk)) continue;
            if (!g[gk] || (now - g[gk].t) > effTtl) delete g[gk];
        }
        var gcount = 0;
        for (gk in g) if (Object.prototype.hasOwnProperty.call(g, gk)) gcount++;
        if (gcount > CONFIG.maxGroupSize) {
            var arr = [];
            for (gk in g) if (Object.prototype.hasOwnProperty.call(g, gk)) arr.push([gk, g[gk].t]);
            arr.sort(function (a, b) { return b[1] - a[1]; });   // تازه‌ترین اول
            for (var ai = CONFIG.maxGroupSize; ai < arr.length; ai++) delete g[arr[ai][0]];
        }
        // حذفِ staleها در گروه‌هایی که این ردیف لمس نکرده است، پیش از maxTotalRows.
        var dg71, sg71;
        for (dg71 in db.g) {
            if (!Object.prototype.hasOwnProperty.call(db.g, dg71) || !db.g[dg71]) continue;
            for (sg71 in db.g[dg71]) {
                if (Object.prototype.hasOwnProperty.call(db.g[dg71], sg71) &&
                    (!db.g[dg71][sg71] || now - (db.g[dg71][sg71].t || 0) > effTtl)) delete db.g[dg71][sg71];
            }
            var dgKeys71 = Object.keys(db.g[dg71]);
            if (dgKeys71.length > CONFIG.maxGroupSize) {
                dgKeys71.sort(function (aa71, bb71) { return (db.g[dg71][bb71].t || 0) - (db.g[dg71][aa71].t || 0); });
                for (var di71 = CONFIG.maxGroupSize; di71 < dgKeys71.length; di71++) delete db.g[dg71][dgKeys71[di71]];
            }
            if (!Object.keys(db.g[dg71]).length) delete db.g[dg71];
        }

        var complete = (scan.passes >= 1) || (now - db.born >= CONFIG.warmupMs);

        var isP = {};
        for (var a in g) {
            if (!Object.prototype.hasOwnProperty.call(g, a)) continue;
            var isDom71 = false;
            for (var b in g) {
                if (!Object.prototype.hasOwnProperty.call(g, b) || b === a) continue;
                if (g[b].r >= g[a].r && g[b].c <= g[a].c && g[b].d >= g[a].d &&
                    (g[b].r > g[a].r + 1e-9 || g[b].c < g[a].c - 1e-9 || g[b].d > g[a].d + 1e-9)) {
                    isDom71 = true; break;
                }
            }
            isP[a] = !isDom71;
        }
        pareto = CONFIG.usePareto ? (isP[sym] ? 1 : 0) : 1;

        var betterCount = 0, cnt = 0, meP = isP[sym] ? 1 : 0, s3, oP;
        for (s3 in g) {
            if (!Object.prototype.hasOwnProperty.call(g, s3) || s3 === sym) continue;
            cnt++;
            if (!CONFIG.usePareto) {
                if (g[s3].r > adjRet + 1e-9 || (g[s3].r === adjRet && s3 < sym)) betterCount++;
                continue;
            }
            oP = isP[s3] ? 1 : 0;
            if (oP > meP) { betterCount++; continue; }       // پارتو بر مغلوب
            if (oP < meP) continue;                          // مغلوب، بعد از من
            if (g[s3].r > adjRet + 1e-9) betterCount++;      // بازدهِ بیشتر
            else if (g[s3].r === adjRet && s3 < sym) betterCount++;  // رفعِ تساوی
        }
        size = cnt + 1;
        dom = betterCount;
        rank = betterCount + 1;
        gbGlobal71 = 0;
        if (CONFIG.maxTotalRows > 0) {   // v9.0.5: با سقفِ خاموش، شمارشی هم نیست
            var cap71 = complete ? CONFIG.maxTotalRows : Math.ceil(CONFIG.maxTotalRows * 1.5);
            count71: for (var gk71 in db.g) {
                if (!Object.prototype.hasOwnProperty.call(db.g, gk71)) continue;
                for (var s71 in db.g[gk71]) {
                    if (!Object.prototype.hasOwnProperty.call(db.g[gk71], s71) || s71 === sym) continue;
                    var o71g = db.g[gk71][s71];
                    if (!o71g) continue;
                    if (o71g.r > adjRet + 1e-9) gbGlobal71++;   // v9.0.3
                    else if (o71g.r >= adjRet - 1e-9 && s71 < sym) gbGlobal71++;   // v9.0.4: tie قطعی (نامِ نماد)
                    if (gbGlobal71 >= cap71) break count71;   // v9.0.5: خروجِ زودهنگام — برای ردّ همین کافی است
                }
            }
        }
        mode = complete ? 'rank' : 'warm';

        RC.dirty = (RC.dirty || 0) + 1;
        if (RC.dirty >= flushEvery || (now - (RC.tf || 0)) >= CONFIG.rankFlushMs) {
            RC.tf = now;
            RC.dirty = 0;
            St.setItem(KEY, JSON.stringify(db));
            RC.ver = (RC.ver || 0) + 1;                     // مهرِ نسخه برای contextهای دیگر
            St.setItem(VKEY, String(RC.ver));
        }
    } catch (e) { mode = 'fallback'; rank = 1; pareto = 1; }

    var Dr940 = dbgState();
    if (Dr940) Dr940.rank = { mode: mode, groupKey: groupKey, rank: rank, size: size, pareto: pareto, global: gbGlobal71, cycle: (db && db.scan ? db.scan.cycle : 0), passes: (db && db.scan ? db.scan.passes : 0), t: Date.now() };

    // ═══════════════════════════════════════════════════════════════════
    //  مرحله ۶ — گیت نهایی
    // ═══════════════════════════════════════════════════════════════════
    if (mode === 'rank') {
        var mpg71 = (CONFIG.multiExpiry && CONFIG.maxPerExpiry > 0) ? CONFIG.maxPerExpiry : CONFIG.maxPerGroup;   // v9.0.0
        if (rank > mpg71) return logRej(sym, 'rank');
        if (CONFIG.maxTotalRows > 0 && gbGlobal71 >= CONFIG.maxTotalRows) return logRej(sym, 'global-rank');   // v9.0.3
    } else if (mode === 'warm') {
        if (CONFIG.maxTotalRows > 0 && gbGlobal71 >= Math.ceil(CONFIG.maxTotalRows * 1.5)) return logRej(sym, 'global-rank');   // v9.0.4: سقفِ نرمِ warm
        if (CONFIG.usePareto && pareto === 0) return logRej(sym, 'pareto');
        if (!(adjRet >= CONFIG.minExpRet)) return logRej(sym, 'min-er');
    } else {
        if (!(adjRet >= 3)) return logRej(sym, 'cold');   // v9.1.4: کفِ اضافی روی گیتِ سراسریِ minExpRet (روی adjRet، همهٔ مسیرها) → مؤثر: max(minExpRet,۳)
    }

    // ═══ v7.1 — امتیازِ تناسب (گیت) + پیشنهادِ ورود/SL/TP ═══
    var sc71 = null;
    if (CONFIG.useScore) {
        sc71 = computeScore71({ er: adjRet, ivRank: ivRank, adx: adxVal, tno: tradeNo, ivEdge: ivEdge });
        if (!(sc71 >= (CONFIG.scoreMin > 0 ? CONFIG.scoreMin : 0)))
            return logRej(sym, 'score-' + Math.round(sc71));
    }
    var sug71 = null;
    if (CONFIG.useEntry && CS > 0) {
        var fair71 = bs(Sd, strike, T, r, iv, isCall)[0] * CS;   // v9.0.1: منصفانه بر Sِ تعدیل‌شده (Sd)
        sug71 = suggestTrade71(fair71, ask,
            Math.max(0, isCall ? (Sd - strike) : (strike - Sd)) * CS, CS);   // v8.0.1: total-value rounding uses CS
    }

    // ═══════════════════════════════════════════════════════════════════
    //  مرحله ۷ — خروجی
    // ═══════════════════════════════════════════════════════════════════
    // برچسب‌ها عمداً بدون فاصله‌اند تا گروه (مثل وبملت_C) همیشه توکنِ اول بماند
    var posTag = '';
    if (CONFIG.positionSizing && CS > 0 && askS > 0 && CONFIG.stopLossPct > 0 && CONFIG.capital > 0) {
        var pRisk = CONFIG.capital * (CONFIG.riskPerTrade > 0 ? CONFIG.riskPerTrade : 1) / 100;
        var pPer  = askS * CS * (CONFIG.stopLossPct / 100);
        var pN    = pPer > 0 ? Math.floor(pRisk / pPer) : 0;
        if (pN > 100) pN = 100;    // ⭐ سقفِ منطقی — جلوی پوزیشنِ نجومی از ریسکِ لنگِ کوچک
        if (pN > 0) posTag = ' N' + pN + '(' + (CONFIG.takeProfitPct > 0 ? CONFIG.takeProfitPct : 0) + ')';
    }

    var badge = (mode === 'rank')    ? ('#' + rank + (pareto ? 'P' : '-'))
              : (mode === 'warm')    ? '#?'
              :                        '*0';
    if (usedFast71 || ivSrc === 'IVf') badge = '!' + badge;        // «!» = مسیر سریعِ همین ردیف

        (cfield0) = (CONFIG.useScore && CONFIG.c0Mode !== 'er') ? (CONFIG.c0Tiebreak ? (Math.round(sc71) * 1000 + Math.max(0, Math.min(999, Math.round(adjRet * 8)))) : Math.round(sc71))   // v9.0.5: رقمِ tie = ER×۸ (اشباع فقط بالای ER٪۱۲۵)
              : Math.round(adjRet * 10) / 10;   // v9.0.6: در er هیچ tie-breakی — رقمِ امتیاز می‌توانست ER را تا ۰٫۹٪ وارونه کند

    (cfield1) = badge + ' ' + groupKey + ' ' + status +
                ' ER' + (Math.round(adjRet * 10) / 10) + '%' +
                ' ' + ivSrc + Math.round(iv * 100) +
                (ivEdge >= 1 ? '*' : ivEdge <= -1 ? '!' : '') +   // * ارزان، ! گران
                ' D' + Math.round(delta * 100) +
                (sc71 !== null ? ' ★' + Math.round(sc71) : '') +          // v7.1: امتیازِ تناسب
                (ivRank !== null ? ' R' + Math.round(ivRank) : '');

    (cfield2) = 'K' + strike +
                ' L' + (Math.round(leverage * 10) / 10) +          // اهرم مؤثر
                ' C' + (Math.round(costRT * 10) / 10) + '%' +      // هزینهٔ رفت‌وبرگشت
                ' T' + (Math.round(thetaPct * 10) / 10) + '%/d' +  // تتا
                (daysLeft >= 0 ? ' E' + daysLeft + 'd' : '') + posTag +
                (sug71 ? ' │ ورود:' + fmt71(sug71.entry) + ' SL:' + fmt71(sug71.sl) +
                ' TP:' + fmt71(sug71.tp) : '');

    popupCollect71({ n: sym, b: baseName, k: strike, side: isCall ? 'C' : 'P',      // v7.1
        sc: sc71, er: Math.round(adjRet * 10) / 10, iv: Math.round(iv * 100),
        rv: (ivRank === null ? null : Math.round(ivRank)), adx: adxVal,
        st: status + (daysLeft >= 0 ? ' E' + daysLeft + 'd' : ''),
        en: (sug71 ? sug71.entry : 0), sl: (sug71 ? sug71.sl : 0), tp: (sug71 ? sug71.tp : 0), t: Date.now() });
    logPass(sym);
    return true;
})();
