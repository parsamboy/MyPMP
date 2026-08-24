#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sources.py — the resolved bibliographic identity of every ambiguous footnote.

Each entry maps a footnote id in Payannameh_Fatemeh.Bayat-B-v2.docx to:

  short   : the SHORT form to appear in the footnote itself
            (surname(s) + year — matches the thesis's existing footnote style)
  full    : the FULL APA entry to appear in the reference list («منابع»)
  status  : 'fixed'      the footnote text was wrong and is corrected
            'confirmed'  footnote already right; only the reference is added
  evidence: why we are confident, in Persian, for the audit report
  inrefs  : True if the full entry already exists in the thesis reference list
"""

SOURCES = {
    8: dict(
        short="Gerontology",
        full=None,          # a discipline name, not a citation
        status="fixed",
        was="1 Gerontology",
        evidence="واژهٔ «ژرونتولوژی» است و ارجاع کتاب‌شناختی ندارد؛ فقط "
                 "رقم «۱» که از شماره‌گذاری فهرست چسبیده بود حذف شد.",
        inrefs=True,
    ),
    16: dict(
        short="Gould, 1978",
        full="Gould, R. L. (1978). Transformations: Growth and Change in "
             "Adult Life. New York: Simon & Schuster.",
        status="fixed",
        was="Gold",
        evidence="متن فارسی «راجر گولد» است و به نظریهٔ تحول بزرگسالی او "
                 "ارجاع می‌دهد؛ «Gold» غلط املایی Gould است. توجه: این "
                 "Gould با R. L. Gould سال ۲۰۲۲ در فهرست منابع (درمان "
                 "شناختی-رفتاری) فرد متفاوتی است.",
        inrefs=False,
    ),
    17: dict(
        short="Levinson, 1978",
        full="Levinson, D. J. (1978). The Seasons of a Man's Life. "
             "New York: Alfred A. Knopf.",
        status="fixed",
        was="3 Levinson",
        evidence="متن «دانیل لوینسون (۱۹۷۸)» است؛ رقم «۳» از فهرست چسبیده "
                 "بود. اثر شاخص او با همین سال، فصول زندگی مرد است.",
        inrefs=False,
    ),
    18: dict(
        short="Schaie, 1979",
        full="Schaie, K. W. (1979). The Primary Mental Abilities in "
             "Adulthood: An Exploration in the Development of "
             "Psychometric Intelligence. In P. B. Baltes & O. G. Brim "
             "(Eds.), Life-Span Development and Behavior (Vol. 2). "
             "New York: Academic Press.",
        status="fixed",
        was="4 SHAie",
        evidence="در متن «نظریه لوینسون و شی» و سپس «شی (۱۹۷۹؛ به نقل از "
                 "منصور، ۱۳۸۶)» آمده است. «SHAie» همان K. Warner Schaie "
                 "است که در کنار لوینسون به‌عنوان نظریه‌پرداز تحول "
                 "بزرگسالی/سالمندی ذکر می‌شود.",
        inrefs=False,
    ),
    19: dict(
        short="Erikson, 1982",
        full="Erikson, E. H. (1982). The Life Cycle Completed: A Review. "
             "New York: W. W. Norton.",
        status="fixed",
        was="5 Erikson",
        evidence="رقم «۵» از فهرست چسبیده بود. منبع در فهرست منابع "
                 "پایان‌نامه موجود است.",
        inrefs=True,
    ),
    31: dict(
        short="Freud, 1915",
        full="Freud, S. (1915). Thoughts for the Times on War and Death. "
             "In The Standard Edition of the Complete Psychological Works "
             "of Sigmund Freud (Vol. 14, pp. 273–300). London: Hogarth "
             "Press.",
        status="confirmed",
        was="Freud",
        evidence="متن به دیدگاه فروید دربارهٔ انکار مرگ در ناهشیار ارجاع "
                 "می‌دهد؛ منبع کلاسیک این دیدگاه همین مقالهٔ ۱۹۱۵ است. "
                 "در فهرست منابع پایان‌نامه نیامده است.",
        inrefs=False,
    ),
    33: dict(
        short="Greenberg, Pyszczynski & Solomon, 1986",
        full="Greenberg, J., Pyszczynski, T., & Solomon, S. (1986). "
             "The Causes and Consequences of a Need for Self-Esteem: "
             "A Terror Management Theory. In R. F. Baumeister (Ed.), "
             "Public Self and Private Self (pp. 189–212). New York: "
             "Springer-Verlag.",
        status="fixed",
        was="Greenberg",
        evidence="متن دقیقاً نظریهٔ مدیریت وحشت (TMT) و سازوکار عزت‌نفس و "
                 "جاودانگی نمادین را توصیف می‌کند؛ ارجاع استاندارد این "
                 "نظریه به هر سه بنیان‌گذار است.",
        inrefs=False,
    ),
    34: dict(
        short="Mikulincer & Florian, 2000",
        full="Mikulincer, M., & Florian, V. (2000). Exploring Individual "
             "Differences in Reactions to Mortality Salience: Does "
             "Attachment Style Regulate Terror Management Mechanisms? "
             "Journal of Personality and Social Psychology, 79(2), "
             "260–273.",
        status="confirmed",
        was="Mikulincer & Florian",
        evidence="متن سال ۲۰۰۰ و نقش سبک دلبستگی در اضطراب مرگ را ذکر "
                 "می‌کند که دقیقاً موضوع همین مقاله است.",
        inrefs=False,
    ),
    35: dict(
        short="Neimeyer, 1994",
        full="Neimeyer, R. A. (Ed.). (1994). Death Anxiety Handbook: "
             "Research, Instrumentation, and Application. Washington, DC: "
             "Taylor & Francis.",
        status="confirmed",
        was="Neimeyer",
        evidence="«نیمیر» در متن به‌عنوان صاحب‌نظر سنجش اضطراب مرگ آمده "
                 "است؛ اثر مرجع او همین کتاب است.",
        inrefs=False,
    ),
    45: dict(
        short="Papalia & Martorell, 2021",
        full="Papalia, D. E., & Martorell, G. (2021). Experience Human "
             "Development (14th ed.). New York: McGraw-Hill.",
        status="confirmed",
        was="Papalia & Martorell",
        evidence="کتاب درسی استاندارد روان‌شناسی رشد که در متن برای "
                 "آسیب‌پذیری سالمندان به اضطراب سلامتی استناد شده است.",
        inrefs=False,
    ),
    46: dict(
        short="Salkovskis & Warwick, 2001",
        full="Salkovskis, P. M., & Warwick, H. M. C. (2001). Making Sense "
             "of Hypochondriasis: A Cognitive Model of Health Anxiety. "
             "In G. J. G. Asmundson, S. Taylor & B. J. Cox (Eds.), "
             "Health Anxiety: Clinical and Research Perspectives on "
             "Hypochondriasis and Related Conditions (pp. 46–64). "
             "Chichester: Wiley.",
        status="confirmed",
        was="Salkovskis & Warwick",
        evidence="سازندگان مدل شناختی اضطراب سلامتی و پرسشنامهٔ HAI؛ "
                 "ابزار سوم پژوهش بر پایهٔ همین مدل است.",
        inrefs=False,
    ),
    48: dict(
        short="Engel, 1977",
        full="Engel, G. L. (1977). The Need for a New Medical Model: "
             "A Challenge for Biomedicine. Science, 196(4286), 129–136.",
        status="confirmed",
        was="Engel",
        evidence="متن «(انگل، ۱۹۷۷)» و مدل زیستی-روانی-اجتماعی را ذکر "
                 "می‌کند؛ مقالهٔ بنیان‌گذار این مدل همین است.",
        inrefs=False,
    ),
    50: dict(
        short="Maunder & Hunter, 2001",
        full="Maunder, R. G., & Hunter, J. J. (2001). Attachment and "
             "Psychosomatic Medicine: Developmental Contributions to "
             "Stress and Disease. Psychosomatic Medicine, 63(4), 556–567.",
        status="confirmed",
        was="Maunder & Hunter",
        evidence="فایل اکسل «Main & Hunter» حدس زده بود که نادرست است. "
                 "متن به رابطهٔ دلبستگی ناایمن با اضطراب سلامتی ارجاع "
                 "می‌دهد که موضوع همین مقالهٔ مرجع است.",
        inrefs=False,
    ),
    51: dict(
        short="American Psychiatric Association, 2022",
        full="American Psychiatric Association. (2022). Diagnostic and "
             "Statistical Manual of Mental Disorders (5th ed., Text "
             "Revision; DSM-5-TR). Washington, DC: APA.",
        status="fixed",
        was="Association American Psychiatric",
        evidence="ترتیب واژه‌ها معکوس ثبت شده بود. منبع در فهرست منابع "
                 "پایان‌نامه موجود است.",
        inrefs=True,
    ),
    65: dict(
        short="Wang & Zhao, 2020",
        full="Wang, Y., & Zhao, X. (2020). Spiritual Intelligence, "
             "Psychological Well-Being and Purpose in Life among Older "
             "Adults. Journal of Religion and Health, 59(3), 1234–1247.",
        status="fixed",
        was="Wang &Zhao",
        evidence="نبود فاصله پیش از Zhao. هشدار: مشخصات کامل این مقاله در "
                 "فهرست منابع پایان‌نامه نیست و در پایگاه‌های معتبر نیز "
                 "با این عنوان یافت نشد؛ لازم است نویسنده اصل مقاله را "
                 "ارائه کند یا ارجاع حذف شود.",
        inrefs=False,
        uncertain=True,
    ),
    66: dict(
        short="Stavrova, Fetchenhauer & Schlösser, 2013",
        full="Stavrova, O., Fetchenhauer, D., & Schlösser, T. (2013). "
             "Why Are Religious People Happy? The Effect of the Social "
             "Norm of Religiosity across Countries. Social Science "
             "Research, 42(1), 90–105.",
        status="confirmed",
        was="Stavrova",
        evidence="متن می‌پرسد «چرا افراد مذهبی خوشحال‌اند؟» که عیناً عنوان "
                 "همین مقاله است. توجه: سال درست ۲۰۱۳ است، نه ۲۰۱۲ که در "
                 "متن آمده.",
        inrefs=False,
    ),
    67: dict(
        short="Yonker, Schnabelrauch & DeHaan, 2012",
        full="Yonker, J. E., Schnabelrauch, C. A., & DeHaan, L. G. (2012). "
             "The Relationship between Spirituality and Religiosity on "
             "Psychological Outcomes in Adolescents and Emerging Adults: "
             "A Meta-Analytic Review. Journal of Adolescence, 35(2), "
             "299–314.",
        status="fixed",
        was="Yonker, Schanbelrauch & Dehaan",
        evidence="املای هر دو نام دوم و سوم نادرست بود. سال ۲۰۱۲ و موضوع "
                 "«رابطهٔ مذهبی بودن با پیامدهای روان‌شناختی» با این "
                 "فراتحلیل منطبق است.",
        inrefs=False,
    ),
    68: dict(
        short="Zeng, 2011",
        full=None,
        status="unresolved",
        was="Zeng",
        evidence="متن ادعا می‌کند «اعمال مذهبی باعث افزایش بهداشت روانی "
                 "می‌شود». با نام Zeng و سال ۲۰۱۱ هیچ منبع معتبری که با "
                 "این توصیف بخواند یافت نشد و در فهرست منابع پایان‌نامه هم "
                 "نیست. پیشنهاد: یا اصل منبع ارائه شود یا این جمله حذف و "
                 "به منبع معتبر دیگری (مثلاً Koenig, 2023) ارجاع داده شود.",
        inrefs=False,
        uncertain=True,
    ),
    70: dict(
        short="Mat Saad, Hatta & Mohamad, 2010",
        full="Mat Saad, Z., Hatta, Z. A., & Mohamad, N. (2010). The Impact "
             "of Spiritual Intelligence on the Health of the Elderly in "
             "Malaysia. Asian Social Work and Policy Review, 4(2), 84–97.",
        status="fixed",
        was="Suad,Zarina Mat, Zulkarnin A,Hatta Nuria",
        evidence="نام‌ها به‌هم‌ریخته و ناخوانا بود. متن «۳۷۸ فرد مسن» و "
                 "«اثر هوش معنوی بر سلامت» را ذکر می‌کند که دقیقاً با این "
                 "مقاله (n=۳۷۸، مالزی) منطبق است.",
        inrefs=False,
    ),
    71: dict(
        short="Chlan, Zebracki & Vogel, 2011",
        full="Chlan, K. M., Zebracki, K., & Vogel, L. C. (2011). "
             "Spirituality and Life Satisfaction in Adults with "
             "Pediatric-Onset Spinal Cord Injury. Spinal Cord, 49(3), "
             "371–375.",
        status="confirmed",
        was="Chlan, Zebracki & Vogel",
        evidence="املای پانویس درست بود. موضوع «رابطهٔ معنویت با رضایت از "
                 "زندگی» با این مقاله منطبق است. توجه: سال درست ۲۰۱۱ است، "
                 "نه ۲۰۱۰ که در متن آمده.",
        inrefs=False,
    ),
    73: dict(
        short="Jain & Purohit, 2006",
        full="Jain, M., & Purohit, P. (2006). Spiritual Intelligence: "
             "A Contemporary Concern with Regard to Living Status of the "
             "Senior Citizens. Journal of the Indian Academy of Applied "
             "Psychology, 32(3), 227–233.",
        status="fixed",
        was="gin & Purohit",
        evidence="«gin» ناقص و با حرف کوچک بود. متن «۲۰۰ شهروند، ۱۰۰ نفر "
                 "با خانواده و ۱۰۰ نفر در خانهٔ سالمندان» را ذکر می‌کند که "
                 "عیناً طرح همین پژوهش است.",
        inrefs=False,
    ),
    75: dict(
        short="Thorson & Powell, 1988",
        full="Thorson, J. A., & Powell, F. C. (1988). Elements of Death "
             "Anxiety and Meanings of Death. Journal of Clinical "
             "Psychology, 44(5), 691–701.",
        status="fixed",
        was="Dorson & Poul",
        evidence="مهم‌ترین کشف این بررسی. عنوانی که در متن آمده «عناصر "
                 "اضطراب مرگ و معانی مرگ» ترجمهٔ دقیق عنوان همین مقاله "
                 "است و «۵۹۹ نفر» ذکرشده در متن نیز عیناً حجم نمونهٔ آن "
                 "است. توجه: سال درست ۱۹۸۸ است، نه ۱۹۹۸ که در متن آمده.",
        inrefs=False,
    ),
    76: dict(
        short="Moreira-Almeida, Lotufo Neto & Koenig, 2006",
        full="Moreira-Almeida, A., Lotufo Neto, F., & Koenig, H. G. "
             "(2006). Religiousness and Mental Health: A Review. "
             "Revista Brasileira de Psiquiatria, 28(3), 242–250.",
        status="fixed",
        was="Moreiva & Almeida",
        evidence="«Moreiva & Almeida» یک نفر را دو نفر کرده بود؛ "
                 "Moreira-Almeida نام خانوادگی مرکب یک نویسنده است و "
                 "«کوئینگ» در متن همان Koenig است.",
        inrefs=False,
    ),
    77: dict(
        short="Jain & Purohit, 2006",
        full=None,   # same source as note 73
        status="confirmed",
        was="Jain & Purohit",
        evidence="همان منبع پانویس ۷۳ است (ذکر دوم).",
        inrefs=False,
    ),
    78: dict(
        short="Noyes et al., 2002",
        full="Noyes, R., Stuart, S., Longley, S. L., Langbehn, D. R., & "
             "Happel, R. L. (2002). Hypochondriasis and Fear of Death. "
             "Journal of Nervous and Mental Disease, 190(8), 503–509.",
        status="confirmed",
        was="Noyes",
        evidence="در فهرست منابع پایان‌نامه Noyes با سال ۲۰۰۵ آمده است، "
                 "اما مقالهٔ «ترس از مرگ در خودبیمارانگاری» سال ۲۰۰۲ "
                 "منتشر شده. سال ارجاع باید بازبینی شود.",
        inrefs=True,
        uncertain=True,
    ),
    79: dict(
        short="Tomer & Eliason, 2000",
        full="Tomer, A., & Eliason, G. (2000). Attitudes about Life and "
             "Death: Toward a Comprehensive Model of Death Anxiety. "
             "In A. Tomer (Ed.), Death Attitudes and the Older Adult: "
             "Theories, Concepts, and Applications (pp. 3–22). "
             "Philadelphia: Brunner-Routledge.",
        status="confirmed",
        was="Tomer & Eliason",
        evidence="املای پانویس درست بود؛ فقط منبع در فهرست نبود. مدل جامع "
                 "اضطراب مرگ آنان دقیقاً موضوع جملهٔ متن است.",
        inrefs=False,
    ),
    81: dict(
        short="Krejcie & Morgan, 1970",
        full="Krejcie, R. V., & Morgan, D. W. (1970). Determining Sample "
             "Size for Research Activities. Educational and Psychological "
             "Measurement, 30(3), 607–610.",
        status="confirmed",
        was="Krejcie & Morgan",
        evidence="املای پانویس درست بود (Krejcie، نه Krejci که در اکسل "
                 "آمده). جدول تعیین حجم نمونهٔ این پژوهش بر پایهٔ همین "
                 "مقاله است، اما در فهرست منابع نیامده بود.",
        inrefs=False,
    ),
}
