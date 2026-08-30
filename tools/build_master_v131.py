# -*- coding: utf-8 -*-
"""v1.31 از v1.3: ویرگول فارسی/انگلیسی، ي→ی / ك→ک، املای نام‌های غیرایرانی طبق جدول پانویس."""
import os
import re
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import ptext, q, style_of

SRC = 'MasterThesis-Fatemeh-Bayat-v1.3.docx'
DST = 'MasterThesis-Fatemeh-Bayat-v1.31.docx'

AR_YEH, FA_YEH = '\u064a', '\u06cc'
AR_KAF, FA_KAF = '\u0643', '\u06a9'
ALEF_MAKSURA = '\u0649'
FA_COMMA = '\u060c'

# بلندترها اول — طبق Jadval-Panavis-Farsi-Latin.xlsx
NAME_FIXES = [
    ('نشنال اینستیتوت آن ایجینگ', 'مؤسسه ملی سالمندی'),
    ('موریرا آلمیدا', 'موریرا-آلمیدا'),
    ('آسْموندسون', 'آسموندسون'),
    ('گرین برگ', 'گرینبرگ'),
    ('سالکوسکیس', 'سالکووسکیس'),
    ('سالکوویس', 'سالکووسکیس'),
    ('کوئینگ', 'کونیگ'),
    ('هایگا', 'هایگ'),
    ('فروغیان', 'فروغان'),
    ('فرانک، ۲۰۱۸', 'فرانکل، ۲۰۱۸'),
]

SKIP_STYLES = {'EnglishText', 'References'}
# ویرگول فارسی در کلاس حروف نیست تا (نام، سال) دوباره ویرگول نگیرد
CITE_NOCOMMA = re.compile(
    r'\(([آ-ی\u200c]{2,25}) ([۱۲۳۴۵۶۷۸۹۰]{4})\)')
COMMA_NOSPACE = re.compile(FA_COMMA + r'([^\s])')
ISSUE_COMMA = re.compile(r'شماره،\s*([۱۲۳۴۵۶۷۸۹۰0-9])')


def freeze_xml(el):
    return etree.tostring(el)


def fix_arabic_letters(s):
    n = s.count(AR_YEH) + s.count(AR_KAF) + s.count(ALEF_MAKSURA)
    if not n:
        return s, 0
    s = s.replace(AR_YEH, FA_YEH).replace(AR_KAF, FA_KAF).replace(ALEF_MAKSURA, FA_YEH)
    return s, n


def fix_names(s):
    n = 0
    if 'زوهر' in s:
        s2, k = re.subn(r'زوهر(?!ا)', 'زوهار', s)
        s, n = s2, n + k
    if 'سالوی' in s:
        s2, k = re.subn(r'سالوی(?!ی)', 'سالووی', s)
        s, n = s2, n + k
    for old, new in NAME_FIXES:
        if old in s:
            c = s.count(old)
            s = s.replace(old, new)
            n += c
    return s, n


def fix_commas_persian(s):
    n = 0
    s2, k = ISSUE_COMMA.subn(r'شماره \1', s)
    s, n = s2, n + k
    s2, k = CITE_NOCOMMA.subn(r'(\1، \2)', s)
    s, n = s2, n + k
    s2, k = COMMA_NOSPACE.subn(FA_COMMA + r' \1', s)
    s, n = s2, n + k
    return s, n


def patch_text(s, do_comma):
    n = 0
    s, k = fix_arabic_letters(s)
    n += k
    s, k = fix_names(s)
    n += k
    if do_comma:
        s, k = fix_commas_persian(s)
        n += k
    return s, n


def patch_root(root, skip_style=True):
    n = 0
    for p in root.iter(q('p')):
        st = style_of(p) or ''
        do_comma = st not in SKIP_STYLES and not st.startswith('TOC')
        if skip_style and st in SKIP_STYLES:
            # فقط حروف عربی؛ ویرگول انگلیسی منابع دست نخورد
            do_comma = False
        for t in p.iter(q('t')):
            if not t.text:
                continue
            nt, k = patch_text(t.text, do_comma)
            if k:
                t.text = nt
                n += k
    return n


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {name: zin.read(name) for name in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    kids = list(body)

    def find_i(pred):
        for i, el in enumerate(kids):
            if el.tag == q('p') and pred(ptext(el)):
                return i
        return None

    i_toc = find_i(lambda t: t.strip() == 'فهرست مطالب')
    i_pnu = find_i(lambda t: 'Payame Noor University' in t)
    front = [freeze_xml(el) for el in kids[:i_toc]]
    last = [freeze_xml(el) for el in kids[i_pnu:]]

    n_doc = patch_root(doc)
    n_fn = 0
    if 'word/footnotes.xml' in parts:
        fn = etree.fromstring(parts['word/footnotes.xml'])
        n_fn = patch_root(fn, skip_style=False)
        parts['word/footnotes.xml'] = etree.tostring(
            fn, xml_declaration=True, encoding='UTF-8', standalone=True)

    kids2 = list(body)
    i_toc2 = i_pnu2 = None
    for i, el in enumerate(kids2):
        if el.tag != q('p'):
            continue
        tt = ptext(el)
        if tt.strip() == 'فهرست مطالب':
            i_toc2 = i
        if 'Payame Noor University' in tt:
            i_pnu2 = i
    if [freeze_xml(el) for el in kids2[:i_toc2]] != front:
        raise SystemExit('front changed')
    if [freeze_xml(el) for el in kids2[i_pnu2:]] != last:
        raise SystemExit('last changed')

    print('سند', n_doc, 'پانویس', n_fn)
    print('freeze OK')
    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
