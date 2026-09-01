# -*- coding: utf-8 -*-
"""
یکدست‌سازی استاندارد جدول‌ها.

  متن داخل جدول : B Lotus 12 (sz=24)
  تراز          : وسط‌چین، بدون تورفتگی، تک‌فاصله، بدون فاصلهٔ قبل/بعد
  سطر سرآیند    : بولد + تکرار در صفحهٔ بعد (tblHeader) + عدم شکست سطر
  ارقام         : فارسی
  عرض           : ۱۰۰٪ صفحه، وسط صفحه، RTL
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

FA_BODY = 'B Lotus'
SZ_TBL  = '24'                      # ۱۲ پوینت
DIG     = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
FA_RE   = re.compile(r'[\u0600-\u06FF]')
LAT_RE  = re.compile(r'[A-Za-z]')


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


def style_cell(p, bold):
    ppr = get_pPr(p)
    drop(ppr, 'ind', 'numPr')
    sub(ppr, 'jc', val='center')
    sub(ppr, 'bidi')
    sub(ppr, 'spacing', before='0', after='0', line='240', lineRule='auto')

    for r in p.findall(q('r')):
        rpr = get_rPr(r)
        txt = ''.join(t.text or '' for t in r.findall(q('t')))
        latin = bool(LAT_RE.search(txt))
        sub(rpr, 'rFonts',
            ascii='Times New Roman', hAnsi='Times New Roman',
            cs='Times New Roman' if latin else FA_BODY)
        sub(rpr, 'sz', val=SZ_TBL)
        sub(rpr, 'szCs', val=SZ_TBL)
        drop(rpr, 'b', 'bCs')
        if bold:
            sub(rpr, 'b'); sub(rpr, 'bCs')
        if not latin:
            sub(rpr, 'rtl')
            for t in r.findall(q('t')):
                if t.text and not LAT_RE.search(t.text):
                    t.text = t.text.translate(DIG)


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    n_tbl = n_row = n_cell = 0
    for tbl in body.iter(q('tbl')):
        n_tbl += 1
        tblPr = tbl.find(q('tblPr'))
        if tblPr is None:
            tblPr = etree.Element(q('tblPr')); tbl.insert(0, tblPr)
        sub(tblPr, 'bidiVisual')
        sub(tblPr, 'jc', val='center')
        sub(tblPr, 'tblW', w='5000', type='pct')

        # خطوط: کادر کامل نازک (یکدست‌سازی استاندارد)
        bd = tblPr.find(q('tblBorders'))
        if bd is not None:
            tblPr.remove(bd)
        bd = etree.SubElement(tblPr, q('tblBorders'))
        for side in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
            e = etree.SubElement(bd, q(side))
            e.set(q('val'), 'single'); e.set(q('sz'), '4')
            e.set(q('space'), '0'); e.set(q('color'), '000000')

        rows = tbl.findall(q('tr'))
        for ri, tr in enumerate(rows):
            n_row += 1
            trPr = tr.find(q('trPr'))
            if trPr is None:
                trPr = etree.Element(q('trPr')); tr.insert(0, trPr)
            sub(trPr, 'cantSplit')
            if ri == 0:
                sub(trPr, 'tblHeader')          # تکرار سرآیند در صفحهٔ بعد
            else:
                drop(trPr, 'tblHeader')

            for tc in tr.findall(q('tc')):
                n_cell += 1
                tcPr = tc.find(q('tcPr'))
                if tcPr is None:
                    tcPr = etree.Element(q('tcPr')); tc.insert(0, tcPr)
                sub(tcPr, 'vAlign', val='center')
                for p in tc.findall(q('p')):
                    style_cell(p, bold=(ri == 0))

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return dict(tables=n_tbl, rows=n_row, cells=n_cell)


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-v6-final.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-v7-tables.docx'
    print('نوشته شد:', dst, process(src, dst))
