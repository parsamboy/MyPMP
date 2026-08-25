# -*- coding: utf-8 -*-
"""
سه کار نهایی روی سند:

۱) افزودن «شناسنامهٔ انگلیسی» از صفحهٔ آخر (R).doc — در فایل ما غایب بود.
   نکته: «Tehran» به «Eslamshahr» اصلاح می‌شود، هماهنگ با اصلاح فارسی.
   «September 2026» هم به «September 2026» می‌ماند مگر تاریخ فارسی
   (شهریور ۱۴۰۵) که معادل September 2026 است — پس درست است.

۲) اصلاح خطاهای نگارشی قطعی:
      • فاصله پیش از ، ؛ : .        → حذف فاصله
      • نبود فاصله پس از ، و ؛      → افزودن فاصله (به‌جز داخل عدد)
      • فاصله چسبیده داخل پرانتز    → حذف
      • فاصلهٔ دوتایی و بیشتر       → یک فاصله
   محافظه‌کارانه: «ممیز فارسی ۸۲/۶۳» و «به طور» دست نمی‌خورند چون
   در متون فارسی هر دو شکل رایج‌اند و تغییرشان تصمیم سبکی است.

۳) نسخه‌گذاری: خروجی با شمارهٔ نسخه و تاریخ در docProps.
"""
import re, sys, zipfile, datetime
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t
XMLSP = '{http://www.w3.org/XML/1998/namespace}space'

VERSION = 'v1.0'

# ---------- شناسنامهٔ انگلیسی (از صفحهٔ آخر R.doc) ----------
COLOPHON = [
    ('Payame Noor University',                     32, True,  'center', 0,   120),
    ('Sari Center',                                28, True,  'center', 0,   360),
    ("Master's Thesis",                            28, True,  'center', 0,   120),
    ('Psychology Major, Islamic Psychology Major, '
     'Positive Psychology Major',                  24, False, 'center', 0,   360),
    ('Title',                                      28, True,  'center', 0,   120),
    ('Relationship between Spiritual Intelligence and Health '
     'Anxiety with Death Anxiety in the Elderly',  36, True,  'center', 0,   120),
    ('Fereshtegan Nursing Home, Eslamshahr',       24, False, 'center', 0,   480),
    ('Supervisor',                                 28, True,  'center', 0,   120),
    ('Babollah Bakhshipour Joibari',               28, True,  'center', 0,   360),
    ('Author',                                     28, True,  'center', 0,   120),
    ('Fatemeh Bayat',                              28, True,  'center', 0,   480),
    ('September 2026',                             28, True,  'center', 0,     0),
]


def mk_para(text, sz, bold, jc, before, after, pagebreak=False):
    """پاراگراف انگلیسی چپ‌چین/وسط‌چین با جهت LTR صریح."""
    p = etree.Element(q('p'))
    ppr = etree.SubElement(p, q('pPr'))
    b = etree.SubElement(ppr, q('bidi')); b.set(q('val'), '0')
    if pagebreak:
        etree.SubElement(ppr, q('pageBreakBefore'))
    j = etree.SubElement(ppr, q('jc')); j.set(q('val'), jc)
    sp = etree.SubElement(ppr, q('spacing'))
    sp.set(q('before'), str(before)); sp.set(q('after'), str(after))
    sp.set(q('line'), '240'); sp.set(q('lineRule'), 'auto')
    prpr = etree.SubElement(ppr, q('rPr'))
    rtl0 = etree.SubElement(prpr, q('rtl')); rtl0.set(q('val'), '0')

    r = etree.SubElement(p, q('r'))
    rpr = etree.SubElement(r, q('rPr'))
    f = etree.SubElement(rpr, q('rFonts'))
    f.set(q('ascii'), 'Times New Roman'); f.set(q('hAnsi'), 'Times New Roman')
    f.set(q('cs'), 'Times New Roman')
    if bold:
        etree.SubElement(rpr, q('b')); etree.SubElement(rpr, q('bCs'))
    for tag in ('sz', 'szCs'):
        e = etree.SubElement(rpr, q(tag)); e.set(q('val'), str(sz))
    rt = etree.SubElement(rpr, q('rtl')); rt.set(q('val'), '0')
    lg = etree.SubElement(rpr, q('lang'))
    lg.set(q('val'), 'en-US'); lg.set(q('bidi'), 'fa-IR')
    t = etree.SubElement(r, q('t')); t.text = text; t.set(XMLSP, 'preserve')
    return p


# ---------- اصلاح نگارشی ----------
FIXES = [
    (re.compile(r'[ \t]+([،؛:])'), r'\1'),          # فاصله پیش از نشانه
    (re.compile(r'([،؛])(?=[^\s\d۰-۹])'), r'\1 '),  # نبود فاصله پس از ویرگول
    (re.compile(r'\(\s+'), '('),
    (re.compile(r'\s+\)'), ')'),
    (re.compile(r'[ \t]{2,}'), ' '),
]
# «فاصله پیش از نقطه» جدا: نقطه‌چین‌های فرم تعهدنامه نباید خراب شوند
DOT_FIX = re.compile(r'(?<=[^\s.])[ \t]+\.(?=\s|$)')


def fix_text(s):
    if not s:
        return s, 0
    o = s
    for pat, rep in FIXES:
        s = pat.sub(rep, s)
    s = DOT_FIX.sub('.', s)
    return s, (1 if s != o else 0)


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    # ---- ۲) اصلاح نگارشی (پیش از افزودن انگلیسی) ----
    n_fix = 0
    for t in body.iter(q('t')):
        new, ch = fix_text(t.text)
        if ch:
            t.text = new; t.set(XMLSP, 'preserve'); n_fix += ch
    fnroot = etree.fromstring(parts['word/footnotes.xml'])
    for t in fnroot.iter(q('t')):
        new, ch = fix_text(t.text)
        if ch:
            t.text = new; t.set(XMLSP, 'preserve'); n_fix += ch
    parts['word/footnotes.xml'] = etree.tostring(
        fnroot, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- ۱) افزودن شناسنامهٔ انگلیسی در انتها ----
    sect = body.find(q('sectPr'))
    added = 0
    for i, (txt, sz, bold, jc, bf, af) in enumerate(COLOPHON):
        p = mk_para(txt, sz, bold, jc, bf, af, pagebreak=(i == 0))
        if sect is not None:
            sect.addprevious(p)
        else:
            body.append(p)
        added += 1

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- ۳) نسخه‌گذاری ----
    cp = etree.fromstring(parts['docProps/core.xml'])
    CP = '{http://schemas.openxmlformats.org/package/2006/metadata/core-properties}'
    DC = '{http://purl.org/dc/elements/1.1/}'
    stamp = datetime.date.today().isoformat()
    for tag, val in ((DC + 'title', 'رابطه هوش معنوی و اضطراب سلامتی با اضطراب مرگ سالمندان'),
                     (DC + 'creator', 'فاطمه بیات'),
                     (CP + 'revision', VERSION.lstrip('v').split('.')[0]),
                     (CP + 'category', f'{VERSION} — {stamp}')):
        e = cp.find(tag)
        if e is None:
            e = etree.SubElement(cp, tag)
        e.text = val
    parts['docProps/core.xml'] = etree.tostring(
        cp, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return dict(fixes=n_fix, colophon=added, version=VERSION)


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-final.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    print(process(src, dst))
