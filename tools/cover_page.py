# -*- coding: utf-8 -*-
"""
بازطراحی صفحهٔ عنوان مطابق الگوی پیام‌نور.

چیدمان استاندارد از بالا به پایین:
    آرم دانشگاه  (تصویر موجود، وسط)
    نام دانشگاه / مرکز            ۱۶pt بولد
    مقطع و رشته                   ۱۴pt
    «عنوان:»                      ۱۴pt بولد
    عنوان پایان‌نامه              ۱۸pt بولد   ← بزرگ‌ترین قلم صفحه
    محل اجرا                      ۱۴pt
    استاد راهنما / نام            ۱۴pt
    نگارنده / نام                 ۱۴pt
    ماه و سال                     ۱۴pt

همه وسط‌چین، بدون تورفتگی، با فاصله‌گذاری متناسب.
محتوای متنی دست نمی‌خورد؛ فقط قالب و فاصله.
"""
import sys, zipfile, re
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

FA = 'B Lotus'
FA_TITLE = 'B Titr'


def sub(parent, tag, **attrs):
    e = parent.find(q(tag))
    if e is None:
        e = etree.SubElement(parent, q(tag))
    for k, v in attrs.items():
        e.set(q(k), v)
    return e


def drop(parent, *tags):
    for t in tags:
        for e in parent.findall(q(t)):
            parent.remove(e)


def get_pPr(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr')); p.insert(0, ppr)
    return ppr


def get_rPr(r):
    rpr = r.find(q('rPr'))
    if rpr is None:
        rpr = etree.Element(q('rPr')); r.insert(0, rpr)
    return rpr


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style(p, size, bold=True, before='0', after='120', font=FA):
    """قالب یک سطر از صفحهٔ عنوان."""
    ppr = get_pPr(p)
    drop(ppr, 'ind', 'numPr', 'pBdr')
    sub(ppr, 'bidi')
    sub(ppr, 'jc', val='center')
    sub(ppr, 'spacing', before=before, after=after,
        line='240', lineRule='auto')
    for r in p.findall(q('r')):
        rpr = get_rPr(r)
        sub(rpr, 'rFonts', ascii='Times New Roman',
            hAnsi='Times New Roman', cs=font)
        sub(rpr, 'sz', val=size)
        sub(rpr, 'szCs', val=size)
        drop(rpr, 'b', 'bCs')
        if bold:
            sub(rpr, 'b'); sub(rpr, 'bCs')
        sub(rpr, 'rtl')


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    blocks = list(body)

    # مرز صفحهٔ عنوان: تا اولین پاراگراف دارای pageBreakBefore
    end = next(i for i, b in enumerate(blocks)
               if b.tag == q('p') and b.find(q('pPr')) is not None
               and b.find(q('pPr')).find(q('pageBreakBefore')) is not None)

    # نقش هر سطر بر پایهٔ متن
    ROLE = [
        (r'^مرکز|^دانشگاه',                    '32', True,  '0',   '60'),   # ۱۶pt
        (r'^پایان\s*نامه',                     '28', True,  '120', '60'),
        (r'^رشته',                             '26', False, '0',   '240'),
        (r'^عنوان$',                           '28', True,  '120', '60'),
        (r'^استاد راهنما$|^مؤلف$|^نگارنده$',   '28', True,  '360', '60'),
        (r'^(شهریور|مهر|آبان|آذر|دی|بهمن|اسفند|فروردین|اردیبهشت|خرداد|تیر|مرداد)',
                                               '28', True,  '480', '0'),
    ]

    n_img = n_txt = 0
    title_done = False
    for i in range(end):
        b = blocks[i]
        if b.tag != q('p'):
            continue
        t = ptext(b).strip()

        # پاراگراف تصویر (آرم): فقط وسط‌چین
        if not t and (any(True for _ in b.iter(q('drawing')))
                      or any(True for _ in b.iter(q('pict')))):
            ppr = get_pPr(b)
            drop(ppr, 'ind')
            sub(ppr, 'jc', val='center')
            sub(ppr, 'spacing', before='0', after='120',
                line='240', lineRule='auto')
            n_img += 1
            continue
        if not t:
            continue

        n_txt += 1
        for pat, size, bold, before, after in ROLE:
            if re.search(pat, t):
                style(b, size, bold, before, after)
                break
        else:
            # عنوان پایان‌نامه = نخستین سطر بلندِ بی‌نقش، بزرگ‌ترین قلم
            if not title_done and len(t) > 25:
                style(b, '36', True, '120', '240', font=FA_TITLE)  # ۱۸pt
                title_done = True
            else:
                style(b, '28', True, '0', '120')

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return dict(end=end, images=n_img, lines=n_txt)


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-v8-fnrule.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-v9-cover.docx'
    print('نوشته شد:', dst, process(src, dst))
