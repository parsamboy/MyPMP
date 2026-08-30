# -*- coding: utf-8 -*-
"""v1.5 از v1.41: فهرست جداول و اشکال در یک صفحه؛ منابع انگلیسی یکدست APA."""
import os
import re
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import (
    TNR, apply_runs_latin, ensure, finish_ppr, fonts, make_latin,
    ptext, q, set_pstyle, setv, style_of,
)

SRC = 'MasterThesis-Fatemeh-Bayat-v1.41.docx'
DST = 'MasterThesis-Fatemeh-Bayat-v1.5.docx'


def freeze_xml(el):
    return etree.tostring(el)


def apa_text(s):
    if not s:
        return s, 0
    orig = s
    s = s.replace('.(', '. (')
    s = re.sub(r'([A-Za-z])\((\d{4})', r'\1. (\2', s)
    s = re.sub(r'(Association|Organization) (\((?:19|20)\d{2})', r'\1. \2', s)
    ym = re.search(r'\((?:19|20)\d{2}', s)
    if ym:
        head, tail = s[:ym.start()], s[ym.start():]
        head = re.sub(r'\b([A-Z])\.([A-Z])\.', r'\1. \2.', head)
        head = re.sub(r'\b([A-Z]\.) ([A-Z][a-z]{2,})', r'\1, \2', head)
        if ' &' not in head:
            head = re.sub(
                r', ([A-ZÀ-ÖØ-öø-ÿ][^,]*, [A-Z]\.(?: [A-Z]\.)?)\s*$',
                r', & \1 ',
                head,
            )
        s = head + tail
    if s.endswith('Basic Books'):
        s += '.'
    s = re.sub(r' {2,}', ' ', s)
    return s, int(s != orig)


def apply_apa_para(p):
    set_pstyle(p, 'References')
    ppr = p.find(q('pPr'))
    rpr = ppr.find(q('rPr')) if ppr is not None else None
    make_latin(ppr, rpr)
    # hanging APA: 0.5in
    ind = ensure(ppr, 'ind')
    ind.set(q('left'), '720')
    ind.set(q('hanging'), '720')
    if q('firstLine') in ind.attrib:
        del ind.attrib[q('firstLine')]
    if q('right') in ind.attrib:
        del ind.attrib[q('right')]
    sp = ensure(ppr, 'spacing')
    if not sp.get(q('after')):
        sp.set(q('after'), '80')
    if not sp.get(q('line')):
        sp.set(q('line'), '276')
        sp.set(q('lineRule'), 'auto')
    finish_ppr(ppr)
    apply_runs_latin(p)
    # hyperlink runs
    for hl in p.findall(q('hyperlink')):
        for r in hl.findall(q('r')):
            rpr = r.find(q('rPr'))
            if rpr is None:
                rpr = etree.Element(q('rPr'))
                r.insert(0, rpr)
            fonts(rpr, TNR, TNR)
            setv(rpr, 'rtl', val='0')
            setv(rpr, 'cs', val='0')
    n = 0
    for t in p.iter(q('t')):
        if not t.text:
            continue
        nt, k = apa_text(t.text)
        if k:
            t.text = nt
            n += 1
    ts = [t for t in p.iter(q('t')) if t.text]
    for i, t in enumerate(ts):
        prev = ts[i - 1].text if i else ''
        if t.text.startswith('(') and prev.endswith('.'):
            t.text = ' ' + t.text
            n += 1
        if t.text.startswith('(') and prev[-1:].isalpha():
            ts[i - 1].text = prev + '.'
            t.text = ' ' + t.text
            n += 1
    return n


def same_page_lists(body):
    n = 0
    for p in body.iter(q('p')):
        t = ptext(p).strip()
        if t != 'فهرست اشکال':
            continue
        ppr = p.find(q('pPr'))
        if ppr is not None:
            pb = ppr.find(q('pageBreakBefore'))
            if pb is not None:
                ppr.remove(pb)
                n += 1
        for r in p.iter(q('r')):
            for lr in list(r.findall(q('lastRenderedPageBreak'))):
                r.remove(lr)
                n += 1
        # فاصله بعد از عنوان جداول کافی است؛ عنوان اشکال بدون شکست صفحه
        sp = ppr.find(q('spacing')) if ppr is not None else None
        if sp is not None:
            sp.set(q('before'), '240')
            sp.set(q('after'), '120')
    # کمی فشرده‌تر کردن عنوان جداول تا هر دو در یک صفحه بمانند
    for p in body.iter(q('p')):
        if ptext(p).strip() == 'فهرست جداول':
            ppr = p.find(q('pPr'))
            if ppr is None:
                continue
            sp = ensure(ppr, 'spacing')
            sp.set(q('after'), '120')
            sp.set(q('line'), '276')
            sp.set(q('lineRule'), 'auto')
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
    i_lat = None
    i_abs = None
    for i, el in enumerate(kids):
        if el.tag != q('p'):
            continue
        st = style_of(el) or ''
        t = ptext(el).strip()
        if st == 'Heading1' and t == 'منابع لاتین':
            i_lat = i
        if st == 'Heading1' and t == 'ABSTRACT':
            i_abs = i
    front = [freeze_xml(el) for el in kids[:i_toc]]
    last = [freeze_xml(el) for el in kids[i_pnu:]]

    n_list = same_page_lists(body)
    n_txt = 0
    n_para = 0
    for el in kids[i_lat + 1:i_abs]:
        if el.tag != q('p'):
            continue
        if not ptext(el).strip():
            continue
        n_txt += apply_apa_para(el)
        n_para += 1

    print('list pagebreak removed', n_list, 'refs styled', n_para, 'text fixes', n_txt)

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
    print('freeze OK')

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
