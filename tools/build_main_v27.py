# -*- coding: utf-8 -*-
"""v2.7: قوانین پانویس — فقط غیرایرانی، یک‌بار در هر صفحه، فرمت خلاصه."""
import copy
import os
import re
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import q, ptext, style_of, ensure, setv, fonts, TNR, finish_ppr, RPR_ORDER, reorder

SRC = 'Payannameh-Fatemeh-Bayat-v2.6.docx'
DST = 'Payannameh-Fatemeh-Bayat-v2.7.docx'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
PAGE_CHARS = 2000

FN_REWRITE = {
    '56': 'APA',
    '57': 'NIA',
    '105': 'Diagnostic and Statistical Manual of Mental Disorders',
    '67': 'Yonker et al.',
    '121': 'Pyszczynski et al.',
    '70': 'Mat Saad et al.',
    '71': 'Chlan et al.',
}


def set_fn_text(f, text):
    first = True
    for t in f.iter(q('t')):
        parent = t.getparent()
        if parent is not None and parent.find(q('footnoteRef')) is not None:
            continue
        if first:
            prefix = ' ' if (t.text or '').startswith(' ') else ''
            t.text = prefix + text
            t.set(XML_SPACE, 'preserve')
            first = False
        else:
            t.text = ''


def key_of(txt):
    return re.sub(r'\s+', ' ', (txt or '').strip()).lower()


def etal_if_many(txt):
    t = txt.strip()
    if ' et al.' in t.lower() or t.endswith('et al.'):
        return t
    if t.count('&') >= 1 and t.count(',') >= 2:
        first = re.split(r'[,&]', t)[0].strip()
        return first + ' et al.'
    return t


def move_periods(p):
    n = 0
    changed = True
    while changed:
        changed = False
        runs = [c for c in p if c.tag == q('r')]
        i = 0
        while i < len(runs):
            r = runs[i]
            if r.find(q('footnoteReference')) is None or i == 0:
                i += 1
                continue
            prev = runs[i - 1]
            te = prev.find(q('t'))
            if te is None or not te.text or not te.text.endswith('.'):
                i += 1
                continue
            te.text = te.text[:-1]
            j = i
            while j + 1 < len(runs) and runs[j + 1].find(q('footnoteReference')) is not None:
                j += 1
            last = runs[j]
            parent = last.getparent()
            idx = list(parent).index(last)
            nr = etree.Element(q('r'))
            if prev.find(q('rPr')) is not None:
                nr.append(copy.deepcopy(prev.find(q('rPr'))))
            tt = etree.SubElement(nr, q('t'))
            tt.text = '.'
            parent.insert(idx + 1, nr)
            n += 1
            changed = True
            break
    return n


def latin_footnote_body(f):
    for p in f.findall(q('p')):
        ppr = p.find(q('pPr'))
        if ppr is None:
            ppr = etree.Element(q('pPr'))
            p.insert(0, ppr)
        setv(ppr, 'bidi', val='0')
        setv(ppr, 'jc', val='both')
        rpr = ppr.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(ppr, q('rPr'))
        fonts(rpr, TNR, TNR)
        setv(rpr, 'rtl', val='0')
        setv(rpr, 'cs', val='0')
        setv(rpr, 'sz', val='18')
        setv(rpr, 'szCs', val='18')
        lang = ensure(rpr, 'lang')
        lang.set(q('val'), 'en-US')
        if q('bidi') in lang.attrib:
            del lang.attrib[q('bidi')]
        finish_ppr(ppr)
        for r in p.findall(q('r')):
            if r.find(q('footnoteRef')) is not None:
                continue
            rr = r.find(q('rPr'))
            if rr is None:
                rr = etree.Element(q('rPr'))
                r.insert(0, rr)
            fonts(rr, TNR, TNR)
            setv(rr, 'rtl', val='0')
            setv(rr, 'cs', val='0')
            setv(rr, 'sz', val='18')
            setv(rr, 'szCs', val='18')
            reorder(rr, RPR_ORDER)


def half_separator(fn_root):
    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')) != 'separator':
            continue
        p = f.find(q('p'))
        if p is None:
            continue
        ppr = p.find(q('pPr'))
        if ppr is None:
            ppr = etree.Element(q('pPr'))
            p.insert(0, ppr)
        # remove special separator char
        for r in list(p.findall(q('r'))):
            if r.find(q('separator')) is not None:
                p.remove(r)
        setv(ppr, 'bidi', val='0')
        setv(ppr, 'jc', val='left')
        bdr = ppr.find(q('pBdr'))
        if bdr is None:
            bdr = etree.Element(q('pBdr'))
            ppr.append(bdr)
        bot = bdr.find(q('bottom'))
        if bot is None:
            bot = etree.SubElement(bdr, q('bottom'))
        bot.set(q('val'), 'single')
        bot.set(q('sz'), '4')  # 0.5pt
        bot.set(q('space'), '1')
        bot.set(q('color'), '000000')
        ind = ensure(ppr, 'ind')
        ind.set(q('right'), '5000')  # ~half page
        finish_ppr(ppr)


def style_footnote_text(styles):
    for s in styles.findall(q('style')):
        if s.get(q('styleId')) != 'FootnoteText':
            continue
        ppr = s.find(q('pPr'))
        if ppr is None:
            ppr = etree.SubElement(s, q('pPr'))
        setv(ppr, 'bidi', val='0')
        setv(ppr, 'jc', val='both')
        rpr = s.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(s, q('rPr'))
        fonts(rpr, TNR, TNR)
        setv(rpr, 'sz', val='18')
        setv(rpr, 'szCs', val='18')
        setv(rpr, 'rtl', val='0')
        setv(rpr, 'cs', val='0')
        lang = ensure(rpr, 'lang')
        lang.set(q('val'), 'en-US')
        finish_ppr(ppr)
        reorder(rpr, RPR_ORDER)


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    styles = etree.fromstring(parts['word/styles.xml'])
    body = doc[0]

    fnt = {}
    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')):
            continue
        fid = f.get(q('id'))
        if fid in FN_REWRITE:
            set_fn_text(f, FN_REWRITE[fid])
            print('fn rewrite', fid, FN_REWRITE[fid])
        else:
            raw = ptext(f).strip()
            et = etal_if_many(raw)
            if et != raw:
                set_fn_text(f, et)
                print('fn etal', fid, et)
        fnt[fid] = ptext(f).strip()

    # once per approximate page
    used = set()
    chars = 0
    removed = 0
    to_remove = []  # runs
    for el in body.iter():
        if el.tag == q('lastRenderedPageBreak') or el.tag == q('pageBreakBefore') or (
                el.tag == q('br') and el.get(q('type')) == 'page'):
            used = set()
            chars = 0
        if el.tag == q('t') and el.text:
            chars += len(el.text)
            if chars >= PAGE_CHARS:
                used = set()
                chars = 0
        if el.tag != q('footnoteReference'):
            continue
        fid = el.get(q('id'))
        k = key_of(fnt.get(fid, fid))
        if k in used:
            r = el.getparent()
            if r is not None and r.tag == q('r'):
                to_remove.append(r)
                removed += 1
        else:
            used.add(k)
    for r in to_remove:
        parent = r.getparent()
        if parent is not None:
            parent.remove(r)
    print('removed duplicate-on-page refs', removed)

    nper = 0
    for p in body.iter(q('p')):
        nper += move_periods(p)
    print('period moves', nper)

    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')):
            continue
        latin_footnote_body(f)
    half_separator(fn_root)
    style_footnote_text(styles)

    # drop unused footnote defs
    used_ids = {fr.get(q('id')) for fr in doc.iter(q('footnoteReference'))}
    nu = 0
    for f in list(fn_root.findall(q('footnote'))):
        if f.get(q('type')):
            continue
        if f.get(q('id')) not in used_ids:
            fn_root.remove(f)
            nu += 1
    print('unused fn removed', nu)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn_root, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/styles.xml'] = etree.tostring(
        styles, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
