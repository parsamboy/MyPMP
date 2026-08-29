# -*- coding: utf-8 -*-
"""v1.2 از v1.1: فقط اصلاح غلط‌های تایپی (چسبیدن واژه، فاصلهٔ نقطه، املای نام)."""
import os
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import ptext, q

SRC = 'MasterThesis-Fatemeh-Bayat-v1.1.docx'
DST = 'MasterThesis-Fatemeh-Bayat-v1.2.docx'

# (قدیمی، جدید) — فقط غلط تایپی، نه بازنویسی علمی
REPLACEMENTS = [
    ('ایمنیپیری', 'ایمنی، پیری'),
    ('کند.دوران', 'کند. دوران'),
    ('شدند.نتایج', 'شدند. نتایج'),
    ('بودند .رابطه', 'بودند. رابطه'),
    ('بله)نمره ۱)', 'بله (نمره ۱)'),
    ('لوینو همکاران', 'لوین و همکاران'),
    ('و دسیکو', 'و دی‌سیکو'),
    ('۲۰۰۸).به این', '۲۰۰۸). به این'),
]


def freeze_xml(el):
    return etree.tostring(el)


def apply_text(s):
    n = 0
    for old, new in REPLACEMENTS:
        c = s.count(old)
        if c:
            s = s.replace(old, new)
            n += c
    return s, n


def patch_root(root):
    n = 0
    for t in root.iter(q('t')):
        if not t.text:
            continue
        nt, k = apply_text(t.text)
        if k:
            t.text = nt
            n += k
        if t.tail:
            nt, k = apply_text(t.tail)
            if k:
                t.tail = nt
                n += k
    return n


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
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
        n_fn = patch_root(fn)
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

    blob = ''.join(ptext(p) for p in doc.iter(q('p')))
    leftover = [old for old, _ in REPLACEMENTS if old in blob]
    if 'دسیکو' in blob.replace('دی‌سیکو', ''):
        leftover.append('دسیکو')
    print('جایگزینی سند', n_doc, 'پانویس', n_fn)
    print('freeze OK')
    if leftover:
        print('باقی‌مانده', leftover)
        raise SystemExit('typo leftover')

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
