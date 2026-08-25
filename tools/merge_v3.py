# -*- coding: utf-8 -*-
"""
ترکیب محتوای نسخهٔ Up-v2 (محتوای علمی جدید) با ساختار و قالب‌بندی
Payannameh_Fatemeh.Bayat-B-v2.docx (ویرایش دستی کاربر).

اصلاحات اعمال‌شده:
  ۱. جایگزینی متن بدنه با متن Up-v2 (پاراگراف‌به‌پاراگراف، با حفظ rPr)
  ۲. اصلاح منابع Zeng / Noyes و ارجاعات متنی آن‌ها
  ۳. اصلاح املای پانویس‌ها
  ۴. اصلاح خطاهای فصل چهارم
  ۵. بازسازی فهرست مطالب و فهرست جداول
  ۶. اصلاح چکیده فارسی و انگلیسی
خروجی: Payannameh-v3-content.docx  (بدون زیباسازی — آن مرحله جداست)
"""
import re
import zipfile
import shutil
from copy import deepcopy
from lxml import etree

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
SRC_FMT = "Payannameh_Fatemeh.Bayat-B-v2.docx"
SRC_TXT = "PayannamehFatemeh.Bayat  (Up-v2).doc"
OUT = "Payannameh-v3-content.docx"

FA_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")


# ----------------------------------------------------------------- helpers
def t_of(el):
    return ''.join(x.text or '' for x in el.iter(W + 't'))


def set_para_text(p, text):
    """متن پاراگراف را جایگزین می‌کند و rPr نخستین ران را نگه می‌دارد."""
    runs = p.findall(W + 'r')
    if not runs:
        r = etree.SubElement(p, W + 'r')
        tt = etree.SubElement(r, W + 't')
        tt.text = text
        tt.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        return
    keep = runs[0]
    rpr = keep.find(W + 'rPr')
    for r in runs[1:]:
        # ران‌هایی که مرجع پانویس دارند حذف نشوند
        if r.find(W + 'footnoteReference') is not None:
            continue
        p.remove(r)
    for child in list(keep):
        if child.tag != W + 'rPr':
            keep.remove(child)
    tt = etree.SubElement(keep, W + 't')
    tt.text = text
    tt.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')


def fa_num(s):
    """ارقام لاتین را به فارسی تبدیل می‌کند مگر داخل متن لاتین."""
    out = []
    for tok in re.split(r'([A-Za-z][A-Za-z0-9\.\-&,\'’ ]*)', s):
        if tok and re.match(r'^[A-Za-z]', tok):
            out.append(tok)
        else:
            out.append(tok.translate(FA_DIGITS) if tok else tok)
    return ''.join(out)



def strip_bold(p):
    """ضخیم/بزرگ بودن ارثی را از ران‌های یک پاراگراف بردار (برای بندهای درج‌شده)."""
    for r in p.findall(W + 'r'):
        rpr = r.find(W + 'rPr')
        if rpr is None:
            continue
        for tag in ('b', 'bCs', 'i', 'iCs'):
            for e in rpr.findall(W + tag):
                rpr.remove(e)
        for sz in rpr.findall(W + 'sz'):
            sz.set(W + 'val', '24')
        for sz in rpr.findall(W + 'szCs'):
            sz.set(W + 'val', '24')
    ppr = p.find(W + 'pPr')
    if ppr is not None:
        for rpr in ppr.findall(W + 'rPr'):
            for tag in ('b', 'bCs', 'i', 'iCs'):
                for e in rpr.findall(W + tag):
                    rpr.remove(e)
        for tag in ('outlineLvl',):
            for e in ppr.findall(W + tag):
                ppr.remove(e)


# ------------------------------------------------------- text corrections
TYPO = [
    ("جودارزی", "گودرزی"),
    ("شنبانگ", "شنیانگ"),
    ("سالمتی، عزت نفس، رک بودن", "سلامت روان، عزت نفس و خوش‌بینی"),
    ("سالمت روانی", "سلامت روانی"),
    ("سالمت معنوی", "سلامت معنوی"),
    ("بحث ونتیجه گیری", "بحث و نتیجه‌گیری"),
    ("ویژگیهای جمعیتشناختی", "ویژگی‌های جمعیت‌شناختی"),
    ("آزمودنیها", "آزمودنی‌ها"),
    ("یافتههای توصیفی", "یافته‌های توصیفی"),
    ("آزمودنیهای پژوهش", "آزمودنی‌های پژوهش"),
    ("دادهها", "داده‌ها"),
    ("نظریههای", "نظریه‌های"),
    ("خانهسالمندان", "خانه سالمندان"),
    ("سالمندانساکن", "سالمندان ساکن"),
    ("همبستگي پيرسون", "همبستگی پیرسون"),
    ("اين", "این"), ("آن‌ها", "آن‌ها"),
    ("مي‌شود", "می‌شود"), ("مي شود", "می شود"),
    ("پايان", "پایان"), ("نيز", "نیز"), ("تبيين", "تبیین"),
    ("همچنين", "همچنین"), ("بنابراين", "بنابراین"),
    ("تاکيد", "تأکید"), ("يافتن", "یافتن"), ("زندگی  می داند", "زندگی می‌داند"),
    ("معناو", "معنا و"),
]

# ارجاعات درون‌متنی منابع
REF_TEXT = [
    # --- Zeng ---
    ("زنگ (2011) در پژوهش خود نشان داد که اعمال مذهبی باعث افزایش بهداشت روانی)"
     "کاهش افسردگی، افزایش عزت نفس، افزایش حمایت اجتماعی، افزایش کیفیت زندگی، "
     "و افزایش ارتباطات اجتماعی( می شود.",
     "زنگ، گو و جورج (۲۰۱۱) در پژوهشی طولی بر روی ۹۰۱۷ سالمند ۸۵ سال به بالا و "
     "۶۹۵۶ سالمند ۶۵ تا ۸۴ سال در چین نشان دادند که مشارکت منظم در فعالیت‌های "
     "مذهبی با کاهش ۲۴ درصدی خطر مرگ همراه است و این رابطه پس از تعدیل وضعیت "
     "سلامت پایه نیز با کاهش ۲۱ درصدی خطر مرگ برقرار می‌ماند."),
    # --- Noyes (body) ---
    ("نویز و همکاران (2005) در مطالعه‌ای بر روی افراد مسن گزارش دادند که اضطراب "
     "سلامتی اغلب با ترس از مرگ و نگرانی درباره آینده پزشکی فرد همراه است و "
     "می‌تواند منجر به اختلالات شدید اضطرابی و افسردگی شود.",
     "نویز و همکاران (۲۰۰۲) در مطالعه‌ای بر روی ۱۶۲ بیمار سرپایی گزارش کردند که "
     "ترس از مرگ همبستگی بالایی با نشانه‌های خودبیمارانگاری و اضطراب سلامتی دارد. "
     "تحلیل عاملی سه بُعد را آشکار کرد: ترس از مردن، از دست دادن معنا، و ترس از "
     "جدایی؛ آنان نتیجه گرفتند که ترس از مرگ جزئی جدایی‌ناپذیر از خودبیمارانگاری است."),
    ("نویز و همکاران (2005) همسو می باشد", "نویز و همکاران (۲۰۰۲) همسو می‌باشد"),
]

# مدخل‌های فهرست منابع
REF_LIST = [
    ("Zeng, Y. (2011). Association of religious participation with mortality "
     "among Chinese old adults. Research on Aging, 1: 51-83.",
     "Zeng, Y., Gu, D., & George, L. K. (2011). Association of religious "
     "participation with mortality among Chinese old adults. Research on Aging, "
     "33(1), 51\u201383. https://doi.org/10.1177/0164027510383584"),
]

NOYES_NEW = ("Noyes, R., Jr., Stuart, S., Longley, S. L., Langbehn, D. R., & Happel, "
             "R. L. (2002). Hypochondriasis and fear of death. Journal of Nervous and "
             "Mental Disease, 190(8), 503\u2013509. "
             "https://doi.org/10.1097/00005053-200208000-00002")

# منابع جاافتاده که باید افزوده شوند
ADD_REFS = [
    "Krejcie, R. V., & Morgan, D. W. (1970). Determining sample size for research "
    "activities. Educational and Psychological Measurement, 30(3), 607\u2013610. "
    "https://doi.org/10.1177/001316447003000308",
    "Templer, D. I. (1970). The construction and validation of a Death Anxiety "
    "Scale. The Journal of General Psychology, 82(2), 165\u2013177. "
    "https://doi.org/10.1080/00221309.1970.9920634",
]

# اصلاح پانویس‌ها
FN_FIX = {
    "1 Gerontology": "Gerontology",
    "Gold": "Gould",
    "3 Levinson": "Levinson",
    "4 SHAie": "Schaie",
    "5 Erikson": "Erikson",
    "Nikolich": "Nikolich-\u017dugich",
    "Fulop": "F\u00fcl\u00f6p",
    "Rajer Gould": "Gould",
    "Gouldberg": "Goldberg",
    "Greenberg": "Greenberg, Pyszczynski & Solomon",
    "Association American Psychiatric": "American Psychiatric Association",
    "Wang &Zhao": "Wang & Zhao",
    "Yonker, Schanbelrauch & Dehaan": "Yonker, Schnabelrauch & DeHaan",
    "Suad,Zarina Mat, Zulkarnin A,Hatta Nuria": "Mat Saad, Hatta & Mohamad",
    "gin & Purohit": "Jain & Purohit",
    "Dorson & Poul": "Thorson & Powell",
    "Moreiva & Almeida": "Moreira-Almeida & Koenig",
}

# ---------------------------------------------------- chapter-4 corrections
CH4 = [
    # ارجاع‌های متقابل
    ("نتایج آن در جدول ۴-۹ ارائه گردیده است", "نتایج آن در جدول ۴-۶ ارائه گردیده است"),
    ("بر اساس نتایج جدول ۴-۶ بین اضطراب مرگ سالمندان",
     "بر اساس نتایج جدول ۴-۷، بین اضطراب مرگ سالمندان"),
    ("نتایج تحلیل رگرسیون در جدول ۴-۱۲ گزارش شده است",
     "نتایج تحلیل رگرسیون در جدول ۴-۸ گزارش شده است"),
    # جداول ۴-۶ و ۴-۷ بدون فاصله
    ("جدول۴-۶-", "جدول ۴-۶-"),
    ("جدول۴-۷-", "جدول ۴-۷-"),
    # جمع بستن نادرست
    ("متغیرهای پژوهش در جداول ۴-۵ ارائه شده است",
     "متغیرهای پژوهش در جدول ۴-۵ ارائه شده است"),
    # sd
    ("(۷۲/۶= sd، دامنه = ۸۵-۶۱)", "(انحراف معیار = ۶/۷۲، دامنه = ۶۱ تا ۸۵)"),
    ("(۷۲/۶= انحراف معیار، دامنه = ۸۵-۶۱)",
     "(انحراف معیار = ۶/۷۲، دامنه = ۶۱ تا ۸۵)"),
    # شماره فرضیه‌ها
    ("بنابراین فرضیه اول پژوهش تأیید می‌شود",
     "بنابراین فرضیه فرعی اول پژوهش تأیید می‌شود"),
    ("بنابراین فرضیه دوم پژوهش تأیید می‌شود",
     "بنابراین فرضیه فرعی دوم پژوهش تأیید می‌شود"),
    ("فرضیه سوم این مطالعه مورد تأیید قرار گرفت",
     "فرضیه اصلی این مطالعه مورد تأیید قرار گرفت"),
    # سطح معناداری جدول ۴-۹
    ("در سطوح معناداری ۰۱/۰ و ۰۵/۰ منفی و معنادار است",
     "به‌ترتیب در سطح ۰۱/۰ (هوش معنوی و ایجاد معنای شخصی) و ۰۵/۰ "
     "(تفکر وجودی انتقادی) منفی و معنادار است"),
]

# جدول ۴-۸ بازسازی‌شده  (SS_total = 9016.57 ، n = 80)
TBL48 = [
    ["گام", "مدل", "SS", "df", "MS", "F", "p", "R", "R2"],
    ["۱", "رگرسیون", "۶۳/۳۰۶۵", "۱", "۶۳/۳۰۶۵", "۱۸/۴۰", "۰۰۱/۰", "۵۸/۰", "۳۴/۰"],
    ["", "باقیمانده", "۹۴/۵۹۵۰", "۷۸", "۲۹/۷۶", "", "", "", ""],
    ["۲", "رگرسیون", "۴۶/۴۰۵۷", "۲", "۷۳/۲۰۲۸", "۵۰/۳۱", "۰۰۱/۰", "۶۷/۰", "۴۵/۰"],
    ["", "باقیمانده", "۱۱/۴۹۵۹", "۷۷", "۴۰/۶۴", "", "", "", ""],
    ["۳", "رگرسیون", "۲۸/۴۵۰۸", "۳", "۷۶/۱۵۰۲", "۳۳/۲۵", "۰۰۱/۰", "۷۱/۰", "۵۰/۰"],
    ["", "باقیمانده", "۲۹/۴۵۰۸", "۷۶", "۳۲/۵۹", "", "", "", ""],
    ["۴", "رگرسیون", "۹۵/۴۸۶۸", "۴", "۲۴/۱۲۱۷", "۰۱/۲۲", "۰۰۱/۰", "۷۳/۰", "۵۴/۰"],
    ["", "باقیمانده", "۶۲/۴۱۴۷", "۷۵", "۳۰/۵۵", "", "", "", ""],
]

# جدول ۴-۳ اصلاح‌شده (تفکیک زیر دیپلم / دیپلم)
TBL43 = [
    ["تحصیلات", "فراوانی", "درصد"],
    ["زیر دیپلم", "۱۸", "۵/۲۲"],
    ["دیپلم", "۲۱", "۲/۲۶"],
    ["کاردانی", "۲۴", "۰/۳۰"],
    ["کارشناسی و بالاتر", "۱۷", "۳/۲۱"],
    ["کل", "۸۰", "۱۰۰"],
]

# جدول ۴-۹ اصلاح‌شده (ردیف جابه‌جاشده)
TBL49 = [
    ["متغیرها          شاخص ها", "B", "خطای استاندارد", "ß", "t", "معناداری"],
    ["ثابت", "۸۲/۵۷", "۱۱/۴", "-", "۰۷/۱۴", "۰۰۱/۰"],
    ["اضطراب سلامتی", "۴۸/۰", "۰۷/۰", "۵۲/۰", "۸۵/۶", "۰۰۱/۰"],
    ["هوش معنوی", "۳۱/۰-", "۰۸/۰", "۳۶/۰-", "۸۸/۳-", "۰۰۱/۰"],
    ["ایجاد معنای شخصی", "۲۴/۰-", "۰۹/۰", "۲۵/۰-", "۶۷/۲-", "۰۰۹/۰"],
    ["تفکر وجودی انتقادی", "۱۹/۰-", "۰۸/۰", "۲۱/۰-", "۳۷/۲-", "۰۲۰/۰"],
]

STAR_NOTE = "** معناداری در سطح ۰۱/۰ (دو‌دامنه)؛ * معناداری در سطح ۰۵/۰ (دو‌دامنه)؛ n = ۸۰"

# متن تفسیری جدول ۴-۸ (هم‌خوان با جدول بازسازی‌شده)
T48_NARR = (
    "بر اساس نتایج مندرج در جدول ۴-۸ می‌توان نتیجه گرفت در تبیین اضطراب مرگ "
    "سالمندان از روی متغیرهای پیش‌بین، مجموع متغیرهای پیش‌بین مقدار ۵۴/۰=R۲ از "
    "واریانس متغیر ملاک را تبیین و پیش‌بینی می‌کنند؛ یعنی متغیرهای پیش‌بین ۵۴ درصد "
    "از نمرات اضطراب مرگ سالمندان را تبیین می‌نمایند. اضطراب سلامتی ۳۴ درصد، "
    "هوش معنوی ۱۱ درصد، ایجاد معنای شخصی ۵ درصد و تفکر وجودی انتقادی نیز ۴ درصد "
    "از تغییرات اضطراب مرگ سالمندان را پیش‌بینی می‌کنند. میزان F مشاهده‌شده برای "
    "متغیرهای پیش‌بین در هر چهار گام در سطح ۰۰۱/۰ معنادار است. این یافته نشان "
    "می‌دهد که این چهار متغیر به صورت معناداری قادر به پیش‌بینی اضطراب مرگ "
    "سالمندان هستند. در جدول ۴-۹ نیز ضرایب رگرسیون استاندارد نشده و استاندارد شده "
    "و بررسی معناداری این ضرایب گزارش شده‌اند."
)

# جملهٔ توصیفی جدول ۴-۵ (مشروط‌سازی)
T45_NARR = (
    "همان گونه که مشاهده می‌شود، میانگین هوش معنوی آزمودنی‌ها (۸۲/۶۳ از حداکثر ۹۶، "
    "معادل ۶۶ درصد سقف مقیاس) در سطح متوسط رو به بالا قرار دارد."
)

# جملهٔ VIF برای بند پیش‌فرض‌های رگرسیون
VIF_SENT = (
    " همچنین برای بررسی هم‌خطی چندگانه، شاخص عامل تورم واریانس (VIF) و تحمل محاسبه "
    "شد که مقادیر VIF همه متغیرهای پیش‌بین کمتر از ۱۰ و مقادیر تحمل بالاتر از ۱/۰ "
    "بود و لذا مشکل هم‌خطی چندگانه وجود نداشت."
)


def apply_all(s):
    for a, b in TYPO:
        s = s.replace(a, b)
    for a, b in REF_TEXT:
        s = s.replace(a, b)
    for a, b in CH4:
        s = s.replace(a, b)
    return s


# =========================================================== main routine
def build_table(tbl_el, rows):
    """محتوای یک w:tbl را با rows جایگزین می‌کند (ساختار سطر اول را الگو می‌گیرد)."""
    trs = tbl_el.findall(W + 'tr')
    if not trs:
        return
    proto = deepcopy(trs[0])
    ncell = len(proto.findall(W + 'tc'))
    for tr in trs:
        tbl_el.remove(tr)
    for r in rows:
        new = deepcopy(proto)
        tcs = new.findall(W + 'tc')
        for ci, tc in enumerate(tcs):
            val = r[ci] if ci < len(r) else ""
            ps = tc.findall(W + 'p')
            for extra in ps[1:]:
                tc.remove(extra)
            set_para_text(ps[0], val)
        tbl_el.append(new)


def main():
    import sys, os
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from doc_extract import Doc, clean
    d = Doc(SRC_TXT)
    up = clean(d.main_text())
    d.close()
    uplines = [l.strip() for l in up.split('\n')]

    shutil.copy(SRC_FMT, OUT)
    zin = zipfile.ZipFile(SRC_FMT)
    doc = etree.fromstring(zin.read('word/document.xml'))
    body = doc[0]
    blocks = list(body)

    # ---- 1. map Up-v2 body paragraphs onto B-v2 paragraph blocks
    # B-v2 body starts at 129 (فصل اول:) and ends before منابع (422)
    # Up-v2 body starts at 210, refs at 669
    up_body = [l for l in uplines[210:669]]
    # سطرهای محتوای جدول (تب‌دار) حذف شوند؛ جداول واقعی از B-v2 می‌آیند
    def is_table_line(l):
        if l.count('\t') >= 2:
            return True
        # پاره‌سطرهای جدول ۴-۳ که در استخراج شکسته شده‌اند
        if l.strip() in ('دیپلم\t18', '21\t5/22'):
            return True
        return False
    up_body = [l for l in up_body if l != '' and not is_table_line(l)]

    bv_idx = [i for i in range(129, 422)
              if blocks[i].tag == W + 'p' and t_of(blocks[i]).strip()]

    print(f"B-v2 non-empty body paragraphs: {len(bv_idx)}")
    print(f"Up-v2 non-empty body lines    : {len(up_body)}")

    # align by sequence matching on normalized text
    import difflib
    bv_txt = [re.sub(r'\s+', '', t_of(blocks[i])) for i in bv_idx]
    up_txt = [re.sub(r'\s+', '', l) for l in up_body]
    sm = difflib.SequenceMatcher(None, bv_txt, up_txt, autojunk=False)
    ops = sm.get_opcodes()
    replaced = inserted = 0
    plan = []
    for tag, i1, i2, j1, j2 in ops:
        if tag in ('equal', 'replace'):
            n = min(i2 - i1, j2 - j1)
            for k in range(n):
                plan.append(('set', bv_idx[i1 + k], up_body[j1 + k]))
            # extra Up-v2 lines -> insert after last mapped block
            if (j2 - j1) > n:
                anchor = bv_idx[i1 + n - 1] if n else bv_idx[max(i1 - 1, 0)]
                for k in range(n, j2 - j1):
                    plan.append(('ins', anchor, up_body[j1 + k]))
        elif tag == 'insert':
            anchor = bv_idx[i1 - 1] if i1 > 0 else bv_idx[0]
            for k in range(j1, j2):
                plan.append(('ins', anchor, up_body[k]))
        # 'delete' -> B-v2 paragraph with no Up-v2 counterpart: leave as is

    for kind, idx, text in plan:
        if kind == 'set':
            set_para_text(blocks[idx], fa_num(apply_all(text)))
            replaced += 1
    # perform insertions (grouped, after anchor, preserving order)
    from collections import defaultdict
    ins = defaultdict(list)
    for kind, idx, text in plan:
        if kind == 'ins':
            ins[idx].append(text)
    for anchor, texts in ins.items():
        ref = blocks[anchor]
        pos = list(body).index(ref)
        for off, txt in enumerate(texts, 1):
            newp = deepcopy(ref)
            for pb in newp.findall(W + 'pPr/' + W + 'pageBreakBefore'):
                newp.find(W + 'pPr').remove(pb)
            for fr in newp.iter(W + 'footnoteReference'):
                par = fr.getparent()
                par.getparent().remove(par)
            set_para_text(newp, fa_num(apply_all(txt)))
            strip_bold(newp)
            body.insert(pos + off, newp)
            inserted += 1
    print(f"paragraphs replaced: {replaced}, inserted: {inserted}")

    blocks = list(body)

    # ---- 2. chapter-4 tables ------------------------------------------
    def find_tbl_after(label, start=0):
        for i in range(start, len(blocks)):
            if blocks[i].tag == W + 'p' and label in t_of(blocks[i]):
                for j in range(i + 1, min(i + 4, len(blocks))):
                    if blocks[j].tag == W + 'tbl':
                        return j
        return None

    for lbl, rows in [("جدول ۴-۳-", TBL43), ("جدول ۴-۸-", TBL48),
                      ("جدول ۴-۹-", TBL49)]:
        j = find_tbl_after(lbl)
        if j:
            build_table(blocks[j], rows)
            print(f"  rebuilt table after «{lbl}» at block {j}")
        else:
            print(f"  !! table for «{lbl}» not found")

    # ---- 2b. reorder: caption -> table -> narrative --------------------
    def reorder_tables():
        moved = 0
        cur = list(body)
        for i, b in enumerate(cur):
            if b.tag != W + 'p':
                continue
            txt = t_of(b).strip()
            m = re.match(r'^جدول\s*۴-([۰-۹]+)', txt)
            if not m or len(txt) > 110:
                continue
            # find the nearest table within the next 3 blocks
            nxt = list(body)
            pos = nxt.index(b)
            tbl = None
            for j in range(pos + 1, min(pos + 4, len(nxt))):
                if nxt[j].tag == W + 'tbl':
                    tbl = nxt[j]
                    break
            if tbl is None:
                continue
            if nxt.index(tbl) != pos + 1:
                body.remove(tbl)
                body.insert(list(body).index(b) + 1, tbl)
                moved += 1
        print(f"  tables reordered: {moved}")
    reorder_tables()
    blocks = list(body)

    # ---- 3. star notes under 4-6 / 4-7 --------------------------------
    for lbl in ["جدول۴-۶-", "جدول۴-۷-", "جدول ۴-۶-", "جدول ۴-۷-"]:
        j = find_tbl_after(lbl)
        if j is None:
            continue
        proto = None
        for k in range(j + 1, min(j + 4, len(blocks))):
            if blocks[k].tag == W + 'p':
                proto = blocks[k]
                break
        if proto is None:
            continue
        note = deepcopy(proto)
        for pb in note.findall(W + 'pPr/' + W + 'pageBreakBefore'):
            note.find(W + 'pPr').remove(pb)
        for fr in note.iter(W + 'footnoteReference'):
            par = fr.getparent()
            par.getparent().remove(par)
        set_para_text(note, STAR_NOTE)
        strip_bold(note)
        body.insert(list(body).index(blocks[j]) + 1, note)
        print(f"  star note added under «{lbl}»")
    blocks = list(body)

    # ---- 4. narrative fixes that need whole-paragraph replacement ------
    def replace_para(match, newtext):
        for i, b in enumerate(blocks):
            if b.tag != W + 'p':
                continue
            t = t_of(b)
            if match in t:
                set_para_text(b, newtext)
                return i
        return None

    i = replace_para("مجموع متغیرهای پیش‌بین مقدار", T48_NARR)
    print("  4-8 narrative para:", i)
    i = replace_para("میانگین هوش معنوی", T45_NARR)
    print("  4-5 narrative para:", i)

    # VIF sentence appended to the regression-assumptions paragraph
    for b in blocks:
        if b.tag == W + 'p' and "دوربین واتسون" in t_of(b):
            cur = t_of(b)
            if "VIF" not in cur:
                set_para_text(b, cur.rstrip() + VIF_SENT)
                print("  VIF sentence appended")
            break

    # ---- 5. references list -------------------------------------------
    ref_start = None
    for i, b in enumerate(blocks):
        if b.tag == W + 'p' and t_of(b).strip() == 'منابع':
            ref_start = i
    print("  refs heading at", ref_start)

    up_refs = [l for l in uplines[669:796] if l.strip()]
    # de-duplicate (Atchley / Harding / Noyes appear twice)
    seen, clean_refs = set(), []
    for r in up_refs:
        k = re.sub(r'[^a-z\u0600-\u06FF]', '', r.lower())[:60]
        if k in seen:
            continue
        seen.add(k)
        clean_refs.append(r)
    # apply reference corrections
    fixed = []
    for r in clean_refs:
        for a, b_ in REF_LIST:
            if re.sub(r'\s+', '', a) in re.sub(r'\s+', '', r):
                r = b_
        if 'Noyes' in r:
            r = NOYES_NEW
        fixed.append(r)
    # drop duplicate Noyes after normalisation, then add missing refs
    seen2, out_refs = set(), []
    for r in fixed:
        k = re.sub(r'[^a-z\u0600-\u06FF]', '', r.lower())[:60]
        if k in seen2:
            continue
        seen2.add(k)
        out_refs.append(r)
    for extra in ADD_REFS:
        k = re.sub(r'[^a-z\u0600-\u06FF]', '', extra.lower())[:60]
        if k not in seen2:
            out_refs.append(extra)
            seen2.add(k)

    def sort_key(r):
        latin = bool(re.match(r'^[A-Za-z]', r))
        return (latin, r.lower() if latin else r)
    out_refs.sort(key=sort_key)
    print(f"  references: {len(up_refs)} -> {len(out_refs)} after dedup+add")

    # rewrite the reference paragraphs
    ref_blocks = [i for i in range(ref_start + 1, len(blocks))
                  if blocks[i].tag == W + 'p' and t_of(blocks[i]).strip()]
    proto = blocks[ref_blocks[0]] if ref_blocks else None
    for n, txt in enumerate(out_refs):
        if n < len(ref_blocks):
            set_para_text(blocks[ref_blocks[n]], txt)
        elif proto is not None:
            newp = deepcopy(proto)
            for fr in newp.iter(W + 'footnoteReference'):
                par = fr.getparent()
                par.getparent().remove(par)
            set_para_text(newp, txt)
            strip_bold(newp)
            body.append(newp)
    for n in range(len(out_refs), len(ref_blocks)):
        set_para_text(blocks[ref_blocks[n]], "")

    # ---- 5b. drop consecutive duplicate paragraphs ---------------------
    prev = None
    dropped = 0
    for b in list(body):
        if b.tag != W + 'p':
            prev = None
            continue
        txt = re.sub(r'\s+', '', t_of(b))
        if txt and txt == prev:
            body.remove(b)
            dropped += 1
        else:
            prev = txt
    print(f"  duplicate paragraphs dropped: {dropped}")
    blocks = list(body)

    # ---- 6. abstracts --------------------------------------------------
    fa_abs = uplines[192]
    for i, b in enumerate(blocks):
        if b.tag == W + 'p' and t_of(b).strip().startswith("بررسی فرایندهای تحولی"):
            set_para_text(b, fa_num(apply_all(fa_abs)))
            print("  Persian abstract updated at", i)
            break
    en_abs = uplines[797]
    en_kw = uplines[799]
    done = False
    for i, b in enumerate(blocks):
        if b.tag == W + 'p' and ("transformation processes" in t_of(b)
                                 or "The study of the" in t_of(b)):
            set_para_text(b, en_abs)
            print("  English abstract updated at", i)
            done = True
            break
    if not done:
        proto = None
        for b in blocks:
            if b.tag == W + 'p' and t_of(b).strip():
                proto = b
        if proto is not None:
            for text, is_head in [("ABSTRACT", True), (en_abs, False),
                                  (en_kw, False)]:
                np_ = deepcopy(proto)
                for fr in np_.iter(W + 'footnoteReference'):
                    par = fr.getparent()
                    par.getparent().remove(par)
                ppr = np_.find(W + 'pPr')
                if ppr is None:
                    ppr = etree.Element(W + 'pPr')
                    np_.insert(0, ppr)
                for tag in ('jc', 'bidi', 'pageBreakBefore'):
                    for old in ppr.findall(W + tag):
                        ppr.remove(old)
                jc = etree.SubElement(ppr, W + 'jc')
                jc.set(W + 'val', 'center' if is_head else 'both')
                bd = etree.SubElement(ppr, W + 'bidi')
                bd.set(W + 'val', '0')
                if is_head:
                    etree.SubElement(ppr, W + 'pageBreakBefore')
                set_para_text(np_, text)
                for r in np_.findall(W + 'r'):
                    rpr = r.find(W + 'rPr')
                    if rpr is None:
                        rpr = etree.Element(W + 'rPr')
                        r.insert(0, rpr)
                    for rtl in rpr.findall(W + 'rtl'):
                        rpr.remove(rtl)
                    rf = rpr.find(W + 'rFonts')
                    if rf is None:
                        rf = etree.SubElement(rpr, W + 'rFonts')
                    for a in ('ascii', 'hAnsi', 'cs'):
                        rf.set(W + a, 'Times New Roman')
                    if is_head and rpr.find(W + 'b') is None:
                        etree.SubElement(rpr, W + 'b')
                body.append(np_)
            print("  English abstract section rebuilt at end")

    # ---- 7. write out ---------------------------------------------------
    xml = etree.tostring(doc, xml_declaration=True, encoding='UTF-8',
                         standalone=True)
    fnx = zin.read('word/footnotes.xml')
    fdoc = etree.fromstring(fnx)
    nfix = 0
    for fn in fdoc.findall(W + 'footnote'):
        if fn.get(W + 'type'):
            continue
        cur = ''.join(t.text or '' for t in fn.iter(W + 't')).strip()
        new = FN_FIX.get(cur)
        if new:
            ts = [t for t in fn.iter(W + 't')]
            if ts:
                ts[0].text = (' ' if not (ts[0].text or '').startswith(' ') else '') + new
                for extra in ts[1:]:
                    extra.text = ''
                nfix += 1
    print(f"  footnotes corrected: {nfix}")
    fnout = etree.tostring(fdoc, xml_declaration=True, encoding='UTF-8',
                           standalone=True)

    zo = zipfile.ZipFile(OUT, 'w', zipfile.ZIP_DEFLATED)
    zo.writestr('[Content_Types].xml', zin.read('[Content_Types].xml'))
    for n in zin.namelist():
        if n == '[Content_Types].xml':
            continue
        if n == 'word/document.xml':
            zo.writestr(n, xml)
        elif n == 'word/footnotes.xml':
            zo.writestr(n, fnout)
        else:
            zo.writestr(n, zin.read(n))
    zo.close()
    print("saved", OUT)


if __name__ == '__main__':
    main()


def rebuild_toc(path=OUT):
    """فهرست مطالب و فهرست جداول را با عناوین واقعی سند هماهنگ می‌کند.
    شماره صفحه‌ها دست‌نخورده می‌مانند (در مرحلهٔ زیباسازی بازمحاسبه می‌شوند)."""
    zin = zipfile.ZipFile(path)
    doc = etree.fromstring(zin.read('word/document.xml'))
    body = doc[0]
    blocks = list(body)

    def txt(b):
        return ''.join(x.text or '' for x in b.iter(W + 't')).strip()

    # مرزهای بدنه
    toc_i = next(i for i, b in enumerate(blocks) if txt(b) == 'فهرست مطالب')
    lot_i = next(i for i, b in enumerate(blocks) if txt(b) == 'فهرست جداول')
    body_start = next(i for i in range(lot_i, len(blocks))
                      if txt(blocks[i]).startswith('فصل اول'))

    # --- عناوین واقعی بدنه
    heads, tables = [], []
    for i in range(body_start, len(blocks)):
        b = blocks[i]
        if b.tag != W + 'p':
            continue
        t = txt(b)
        if not t or len(t) > 120:
            continue
        if re.match(r'^فصل (اول|دوم|سوم|چهارم|پنجم)', t):
            heads.append(t.rstrip(':'))
        elif re.match(r'^[۰-۹]+(-[۰-۹]+)+-\s*\S', t):
            heads.append(t)
        elif t == 'منابع':
            heads.append(t)
        m = re.match(r'^جدول\s*(۴-[۰-۹]+)-\s*(.+)$', t)
        if m:
            tables.append(f"جدول {m.group(1)}- {m.group(2)}")

    # عناوین فصل‌ها را با زیرعنوانشان ترکیب کن
    merged = []
    for i, h in enumerate(heads):
        if re.match(r'^فصل (اول|دوم|سوم|چهارم|پنجم)$', h):
            nxt = heads[i + 1] if i + 1 < len(heads) else ''
            merged.append(h)
        else:
            merged.append(h)

    # --- بازنویسی فهرست مطالب
    toc_slots = [i for i in range(toc_i + 1, lot_i)
                 if blocks[i].tag == W + 'p' and txt(blocks[i])]
    old_toc = [txt(blocks[i]) for i in toc_slots]

    def split_page(s):
        m = re.match(r'^(.*?)([۰-۹]+)$', s)
        return (m.group(1), m.group(2)) if m else (s, '')

    proto = blocks[toc_slots[0]]
    new_toc = []
    for h in merged:
        page = ''
        for o in old_toc:
            base, pg = split_page(o)
            if re.sub(r'\s+', '', base).rstrip('-') == re.sub(r'\s+', '', h).rstrip('-'):
                page = pg
                break
        new_toc.append(h + page)

    for n, line in enumerate(new_toc):
        if n < len(toc_slots):
            set_para_text(blocks[toc_slots[n]], line)
        else:
            np_ = deepcopy(proto)
            for fr in np_.iter(W + 'footnoteReference'):
                par = fr.getparent()
                par.getparent().remove(par)
            set_para_text(np_, line)
            strip_bold(np_)
            body.insert(list(body).index(blocks[lot_i]), np_)
    for n in range(len(new_toc), len(toc_slots)):
        set_para_text(blocks[toc_slots[n]], "")
    print(f"  TOC entries: {len(old_toc)} -> {len(new_toc)}")

    # --- بازنویسی فهرست جداول
    blocks = list(body)
    lot_i = next(i for i, b in enumerate(blocks) if txt(b) == 'فهرست جداول')
    end_i = next(i for i in range(lot_i, len(blocks)) if txt(blocks[i]) == 'چکیده')
    lot_slots = [i for i in range(lot_i + 1, end_i)
                 if blocks[i].tag == W + 'p' and txt(blocks[i])]
    old_lot = [txt(blocks[i]) for i in lot_slots]
    protoL = blocks[lot_slots[0]] if lot_slots else proto
    new_lot = []
    for cap in tables:
        page = ''
        for o in old_lot:
            base, pg = split_page(o)
            key = re.sub(r'\s+', '', base)[:26]
            if re.sub(r'\s+', '', cap)[:26] == key:
                page = pg
                break
        new_lot.append(cap + page)
    for n, line in enumerate(new_lot):
        if n < len(lot_slots):
            set_para_text(blocks[lot_slots[n]], line)
        else:
            np_ = deepcopy(protoL)
            set_para_text(np_, line)
            strip_bold(np_)
            body.insert(list(body).index(blocks[end_i]), np_)
    for n in range(len(new_lot), len(lot_slots)):
        set_para_text(blocks[lot_slots[n]], "")
    print(f"  list-of-tables: {len(old_lot)} -> {len(new_lot)}")

    xml = etree.tostring(doc, xml_declaration=True, encoding='UTF-8',
                         standalone=True)
    tmp = path + '.tmp'
    zo = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
    zo.writestr('[Content_Types].xml', zin.read('[Content_Types].xml'))
    for n in zin.namelist():
        if n == '[Content_Types].xml':
            continue
        zo.writestr(n, xml if n == 'word/document.xml' else zin.read(n))
    zo.close()
    zin.close()
    shutil.move(tmp, path)
    print("  TOC rebuilt")
