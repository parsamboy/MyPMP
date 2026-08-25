# -*- coding: utf-8 -*-
"""
زیباسازی ظاهر فهرست مطالب و جداول.

ورد وقتی فیلد TOC را با سوییچ \\h می‌سازد، هر مدخل را به یک
w:hyperlink تبدیل می‌کند و ران‌هایش سبک «Hyperlink» می‌گیرند:
آبی (0563C1) و زیرخط‌دار. روی صفحه برای پیمایش خوب است، اما
در نسخهٔ چاپی پایان‌نامه ناپسند است — فهرست باید سیاهِ ساده باشد.

این اسکریپت:
  ۱) رنگ و زیرخط را از ۱۰۷۶ ران فهرست برمی‌دارد (پیوند باقی می‌ماند،
     پس با Ctrl+کلیک هنوز پرش می‌کند)
  ۲) سبک TOC1..4 را یکدست می‌کند: B Lotus، اندازهٔ ۱۲، سیاه
     (پیش‌تر TOC1/2 اندازهٔ ۱۰ و TOC5..9 روی Arial بودند)
  ۳) سبک Hyperlink را برای بقیهٔ سند سیاه می‌کند تا نشانی‌های
     فهرست منابع هم آبی چاپ نشوند
"""
import sys, zipfile, re
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

TOC_STYLES = re.compile(r'^(TOC[1-9]|TableofFigures)$')


def sub(parent, tag, **attrs):
    e = parent.find(q(tag))
    if e is None:
        e = etree.SubElement(parent, q(tag))
    for k, v in attrs.items():
        e.set(q(k), v)
    return e


def drop(parent, *tags):
    n = 0
    for t in tags:
        for e in parent.findall(q(t)):
            parent.remove(e); n += 1
    return n


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    rep = dict(runs=0, styles=0)

    # ۱) ران‌های فهرست: حذف رنگ و زیرخط
    for p in body.iter(q('p')):
        ppr = p.find(q('pPr'))
        s = ppr.find(q('pStyle')) if ppr is not None else None
        sv = s.get(q('val')) if s is not None else None
        if not sv or not TOC_STYLES.match(sv):
            continue
        for r in p.iter(q('r')):
            rpr = r.find(q('rPr'))
            if rpr is None:
                continue
            changed = drop(rpr, 'color', 'u')
            rs = rpr.find(q('rStyle'))
            if rs is not None and rs.get(q('val')) == 'Hyperlink':
                rpr.remove(rs); changed = 1
            sub(rpr, 'color', val='000000')
            rep['runs'] += changed

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ۲و۳) سبک‌ها
    st = etree.fromstring(parts['word/styles.xml'])
    for style in st.findall(q('style')):
        sid = style.get(q('styleId')) or ''
        if TOC_STYLES.match(sid):
            rpr = style.find(q('rPr'))
            if rpr is None:
                rpr = etree.SubElement(style, q('rPr'))
            drop(rpr, 'u')
            sub(rpr, 'rFonts', ascii='Times New Roman',
                hAnsi='Times New Roman', cs='B Lotus')
            sub(rpr, 'color', val='000000')
            sub(rpr, 'sz', val='24')
            sub(rpr, 'szCs', val='24')
            rep['styles'] += 1
        elif re.fullmatch(r'Heading[1-4]|Caption', sid):
            # Heading2 روی 365F91 و Heading3 روی 243F60 آبی بودند
            # (پیش‌فرض تم ورد). در چاپ باید سیاه باشند.
            rpr = style.find(q('rPr'))
            if rpr is None:
                rpr = etree.SubElement(style, q('rPr'))
            sub(rpr, 'color', val='000000')
            rep['styles'] += 1
        elif sid == 'Hyperlink':
            rpr = style.find(q('rPr'))
            if rpr is None:
                rpr = etree.SubElement(style, q('rPr'))
            drop(rpr, 'u')
            sub(rpr, 'color', val='000000')
            rep['styles'] += 1

    parts['word/styles.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return rep


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.0.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    for k, v in process(src, dst).items():
        print(f'  {k}: {v}')
