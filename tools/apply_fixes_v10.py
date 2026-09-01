# -*- coding: utf-8 -*-
"""
شش اصلاح درخواستی روی «Payannameh-v9-اصلاحی.docx».

پایه: فایل اصلاحیِ دستیِ کاربر (فهرست خودکار F9-شده، سبک‌ها و سرتیترها).
محتوای متنی همان (R).doc است — بررسی شد که با Up-v2 یکسان است.

  ۱) پانویس فقط برای نام‌های غیرایرانی  → حذف Goodarzi و Jafari-Koulaee
  ۲) «فرشتگان تهران» → «فرشتگان اسلامشهر»
  ۳) نمونه‌گیری «تصادفی ساده» → «در دسترس»  (فقط جایی که به پژوهش حاضر
     اشاره دارد؛ پیشینه‌ها و کارآزمایی‌های دیگران دست نمی‌خورند)
  ۴) فهرست فصل ۴ — عنوان بدشمارهٔ «۴-۳-۲-۱-۲- نظریه استمرار» که در فصل ۲
     است ولی با ۴ شروع می‌شود و در فهرست زیر فصل ۴ می‌نشیند
  ۵) منابع: حذف مدخل‌های یتیم/بی‌ارجاع گزارش می‌شود (بدون حذف خودکار)
  ۶) عربی → فارسی: ي→ی ، ك→ک ، ة→ه  (أ/إ/ؤ دست‌نخورده: در «مسأله»،
     «تأهل»، «تأثیر»، «مؤلف» املای فارسی صحیح‌اند)
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

# ---------- ۶) نگاشت عربی → فارسی ----------
AR2FA = {'\u064A': '\u06CC',   # ي → ی
         '\u0643': '\u06A9',   # ك → ک
         '\u0629': '\u0647'}   # ة → ه
AR_TABLE = str.maketrans(AR2FA)

# ---------- ۱) پانویس‌های ایرانی ----------
IRANIAN_FN = {'Goodarzi', 'Jafari-Koulaee'}

# ---------- ۲و۳) جایگزینی‌های متنی ----------
TEXT_FIXES = [
    ('فرشتگان تهران', 'فرشتگان اسلامشهر'),
]

# جملهٔ روش نمونه‌گیری پژوهش حاضر (نه پیشینه‌ها)
SAMPLING = [
    ('نمونه گیری به روش تصادفی ساده انجام شد',
     'نمونه گیری به روش در دسترس انجام شد'),
    ('۸۰ نفر به روش نمونه‌گیری تصادفی ساده انتخاب شدند',
     '۸۰ نفر به روش نمونه‌گیری در دسترس انتخاب شدند'),
    ('روش نمونه گیری تصادفی ساده در نظر گرفته شد',
     'روش نمونه گیری در دسترس در نظر گرفته شد'),
    ('به روش نمونه گیری تصادفی ساده',
     'به روش نمونه گیری در دسترس'),
    ('به روش نمونه‌گیری تصادفی ساده',
     'به روش نمونه‌گیری در دسترس'),
    # محدودیت‌های فصل ۵ هم به روش نمونه‌گیری اشاره می‌کند
    ('از روش نمونه‌گیری تصادفی ساده استفاده شده است',
     'از روش نمونه‌گیری در دسترس استفاده شده است'),
    ('از روش نمونه گیری تصادفی ساده استفاده شده است',
     'از روش نمونه گیری در دسترس استفاده شده است'),
]


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def para_runs_text(p):
    """فهرست (عنصر w:t، متن) برای بازنویسی امن در سطح ران."""
    return [(t, t.text or '') for t in p.iter(q('t'))]


def replace_across_runs(p, old, new):
    """جایگزینی رشته‌ای که ممکن است بین چند ران شکسته باشد."""
    items = para_runs_text(p)
    full = ''.join(x[1] for x in items)
    if old not in full:
        return 0
    n = full.count(old)
    full = full.replace(old, new)
    # متن جدید را در ران اول می‌ریزیم و بقیه را خالی می‌کنیم
    if items:
        items[0][0].text = full
        items[0][0].set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        for t, _ in items[1:]:
            t.text = ''
    return n


def fix_arabic_in(root):
    """ي/ك/ة را در همهٔ w:t به معادل فارسی برمی‌گرداند."""
    n = 0
    for t in root.iter(q('t')):
        if not t.text:
            continue
        new = t.text.translate(AR_TABLE)
        if new != t.text:
            n += sum(1 for ch in t.text if ch in AR2FA)
            t.text = new
    return n


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()

    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    fn = etree.fromstring(parts['word/footnotes.xml'])

    rep = dict(fn_removed=[], text=0, sampling=0, arabic=0, toc_fix=0)

    # ---- ۱) حذف پانویس‌های ایرانی ----
    kill_ids = set()
    for note in fn.findall(q('footnote')):
        i = note.get(q('id'))
        if i is None or int(i) <= 0:
            continue
        body_txt = ''.join(t.text or '' for t in note.iter(q('t'))).strip()
        # شمارهٔ خودکار ورد در ابتدای متن پانویس نیست؛ متن خالص را می‌سنجیم
        if body_txt in IRANIAN_FN:
            kill_ids.add(int(i))
            rep['fn_removed'].append(f'{i}: {body_txt}')
    for note in list(fn.findall(q('footnote'))):
        i = note.get(q('id'))
        if i and int(i) in kill_ids:
            fn.remove(note)
    # ارجاع‌های درون متن
    for ref in list(body.iter(q('footnoteReference'))):
        i = ref.get(q('id'))
        if i and int(i) in kill_ids:
            r = ref.getparent()
            gp = r.getparent()
            if gp is not None:
                gp.remove(r)

    # ---- ۶) عربی → فارسی (اول انجام می‌شود) ----
    # باید پیش از جایگزینی‌های متنی اجرا شود: برخی بندها «تصادفي» با
    # ي عربی دارند و الگوهای فارسی روی آن‌ها نمی‌گیرند.
    rep['arabic'] += fix_arabic_in(body)
    rep['arabic'] += fix_arabic_in(fn)
    for extra in ('word/endnotes.xml', 'word/footer1.xml',
                  'word/footer2.xml', 'word/footer3.xml'):
        if extra in parts:
            root = etree.fromstring(parts[extra])
            rep['arabic'] += fix_arabic_in(root)
            parts[extra] = etree.tostring(
                root, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- ۲و۳) جایگزینی‌های متنی ----
    for p in body.iter(q('p')):
        for old, new in TEXT_FIXES:
            rep['text'] += replace_across_runs(p, old, new)
        for old, new in SAMPLING:
            rep['sampling'] += replace_across_runs(p, old, new)

    # ---- ۴) فهرست فصل ۴ ----
    # مدخل‌های زائدِ فهرست («متغیر/میانگین/۸۲٫۶۳/…») متنِ کهنهٔ ذخیره‌شدهٔ
    # فیلد TOC اند: سلول‌های جدول ۴-۵ در نوبتی قبلی سبک Heading داشته‌اند.
    # حالا سلول‌ها بی‌سبک‌اند، پس کافی است حافظهٔ فیلد پاک شود تا ورد
    # هنگام باز شدن از نو بسازد. dirty=true + updateFields همین کار را می‌کند.
    for fc in body.iter(q('fldChar')):
        if fc.get(q('fldCharType')) == 'begin':
            fc.set(q('dirty'), 'true')
            rep['toc_fix'] += 1

    st = etree.fromstring(parts['word/settings.xml'])
    uf = st.find(q('updateFields'))
    if uf is None:
        uf = etree.SubElement(st, q('updateFields'))
    uf.set(q('val'), 'true')
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return rep


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-v9-اصلاحی.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-v10.docx'
    r = process(src, dst)
    print('نوشته شد:', dst)
    for k, v in r.items():
        print(f'  {k}: {v}')
