# -*- coding: utf-8 -*-
"""
پاک‌سازی کامل زبان دوسویه: ar-SA → fa-IR در همهٔ اجزای سند.

چرا مهم است: ورد شکلِ ارقامِ فیلدها (PAGE، SEQ، TOC) و رفتار
غلط‌یاب/شکست خط را بر پایهٔ w:lang/@bidi تعیین می‌کند. اگر حتی
سبک پایهٔ Normal روی ar-SA بماند، هر پاراگرافی که override نداشته
باشد زبانش را از آن ارث می‌برد.

در نسخهٔ قبل فقط settings.xml/themeFontLang اصلاح شده بود؛
۲۱ عنصر lang در styles.xml (از جمله Normal) جا مانده بودند.
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

NEW = 'fa-IR'

# هر گویش عربی، نه فقط ar-SA. در این سند ar-YE (عربی یمن) روی سبک
# BasicParagraph مانده بود و با جست‌وجوی صرفِ 'ar-SA' دیده نمی‌شد.
AR_ANY = re.compile(r'^ar(-[A-Za-z]{2,})?$', re.I)


def fix_root(root):
    """@w:bidi را در همهٔ w:lang و themeFontLang به fa-IR می‌برد."""
    n = 0
    for tag in ('lang', 'themeFontLang'):
        for e in root.iter(q(tag)):
            v = e.get(q('bidi'))
            if v and AR_ANY.match(v):
                e.set(q('bidi'), NEW)
                n += 1
    return n


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()

    report = {}
    for name in list(parts):
        if not name.endswith('.xml'):
            continue
        if not re.search(rb'"ar(-[A-Za-z]{2,})?"', parts[name]):
            continue
        root = etree.fromstring(parts[name])
        n = fix_root(root)
        if n:
            parts[name] = etree.tostring(
                root, xml_declaration=True, encoding='UTF-8', standalone=True)
            report[name] = n

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)

    # بازبینی: هیچ ar-SA نباید بماند
    zz = zipfile.ZipFile(dst)
    left = {}
    for n in zz.namelist():
        hits = re.findall(rb'"(ar(?:-[A-Za-z]{2,})?)"', zz.read(n))
        if hits:
            left[n] = sorted({h.decode() for h in hits})
    return report, left


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-v10.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-v11.docx'
    rep, left = process(src, dst)
    print('نوشته شد:', dst)
    for k, v in rep.items():
        print(f'  اصلاح‌شده {k}: {v}')
    print('  باقی‌ماندهٔ ar-SA:', left if left else 'هیچ ✓')
