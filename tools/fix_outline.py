# -*- coding: utf-8 -*-
"""
پاک‌سازی outlineLvl نادرست — ریشهٔ خرابی نویگیشن و فهرست.

ورد «سطح رئوس مطالب» را از دو جا می‌خواند:
    ۱) سبک پاراگراف (Heading1..9)
    ۲) خصیصهٔ صریح w:outlineLvl روی خودِ پاراگراف

مورد دوم بر سبک اولویت دارد و در پنجرهٔ Navigation و فیلد TOC
دیده می‌شود، حتی اگر پاراگراف سبک Normal داشته باشد.

در این سند ۲۰ پاراگراف نادرست outlineLvl داشتند:
  • ۱۶ سلول از جدول ۴-۵ با outlineLvl=0  → در نویگیشن مثل عنوانِ
    سطح‌یک ظاهر می‌شدند («متغیر»، «میانگین»، «۸۲/۶۳»، «۷۰»، …)
    و همان مدخل‌های زائدی بودند که بار پیش فقط متنشان را از
    فهرست پاک کردم، بی‌آنکه علت را بردارم — پس با هر بار F9
    دوباره برمی‌گشتند.
  • بند «همان گونه که مشاهده می‌شود، میانگین هوش معنوی…»
    با outlineLvl=0
  • بند «جدول ۴-۳، فراوانی و درصد… را نشان می‌دهد» با outlineLvl=5
    (جملهٔ ارجاع درون‌متنی است، نه عنوان جدول)

قاعده: outlineLvl فقط روی عنوان واقعی می‌ماند — یعنی پاراگرافی که
سبک Heading1..4 یا Caption دارد و بیرون جدول است. روی هر پاراگراف
دیگر حذف می‌شود.
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

CHAP = re.compile(r'^\s*فصل\s+(اول|دوم|سوم|چهارم|پنجم)')
NUM  = re.compile(r'^[۰-۹]+(-[۰-۹]+)*-')
CAP  = re.compile(r'^جدول\s*[۰-۹0-9]+-')
NAMED = ('منابع فارسی', 'منابع لاتین', 'ABSTRACT', 'چکیده')


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def is_real_heading(p, in_table):
    """آیا این پاراگراف عنوان واقعی است؟"""
    if in_table:
        return False                      # هیچ سلولی عنوان نیست
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    sv = s.get(q('val')) if s is not None else None
    t = ptext(p).strip()

    if sv and re.fullmatch(r'Heading[1-4]', sv):
        return bool(CHAP.match(t) or NUM.match(t) or t in NAMED)
    if sv == 'Caption':
        # عنوان جدول‌ها outlineLvl لازم ندارند: فهرست جداول از فیلد
        # SEQ ساخته می‌شود، نه از سطح رئوس. ضمناً در این سند فقط
        # ۲ عنوان از ۹ تا آن را داشتند — ناهمگونیِ بازمانده از ورد.
        # نگه‌داشتنشان باعث می‌شد در Navigation هم ظاهر شوند.
        return False
    return False


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    in_tbl = {id(p) for t in body.iter(q('tbl')) for p in t.iter(q('p'))}
    removed, kept = [], 0

    for p in body.iter(q('p')):
        ppr = p.find(q('pPr'))
        if ppr is None:
            continue
        o = ppr.find(q('outlineLvl'))
        if o is None:
            continue
        if is_real_heading(p, id(p) in in_tbl):
            kept += 1
            continue
        removed.append((o.get(q('val')), ptext(p).strip()[:52]))
        ppr.remove(o)

    # فیلدها dirty تا ورد فهرست را از نو بسازد
    n_dirty = 0
    for fc in body.iter(q('fldChar')):
        if fc.get(q('fldCharType')) == 'begin':
            fc.set(q('dirty'), 'true'); n_dirty += 1

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    st = etree.fromstring(parts['word/settings.xml'])
    uf = st.find(q('updateFields'))
    if uf is None:
        uf = etree.SubElement(st, q('updateFields'))
    uf.set(q('val'), 'true')
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return removed, kept, n_dirty


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.0.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    rm, kept, d = process(src, dst)
    print(f'outlineLvl حذف‌شده: {len(rm)}')
    for lv, t in rm:
        print(f'   lvl={lv}  {t}')
    print(f'\nنگه‌داشته‌شده روی عنوان واقعی: {kept}')
    print(f'فیلدهای dirty: {d}')
