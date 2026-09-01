# -*- coding: utf-8 -*-
"""v1.32 از v1.31: جفت پرانتز هم‌زبان؛ حذف ) بدون جفت؛ بدون LRM نمایان."""
import copy
import os
import re
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import TNR, fonts, ptext, q, style_of

SRC = 'MasterThesis-Fatemeh-Bayat-v1.31.docx'
DST = 'MasterThesis-Fatemeh-Bayat-v1.32.docx'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
MARKS = '\u200e\u200f\u202a\u202b\u202c\u2066\u2067\u2068\u2069'
SKIP_STYLES = {'EnglishText', 'References'}
LATIN_PAREN = re.compile(r'\([^()]*[A-Za-z][^()]*\)')


def freeze_xml(el):
    return etree.tostring(el)


def run_text(r):
    return ''.join(t.text or '' for t in r.findall(q('t')))


def set_run_text(r, text):
    ts = r.findall(q('t'))
    if not ts:
        te = etree.SubElement(r, q('t'))
        te.set(XML_SPACE, 'preserve')
        te.text = text
        return
    ts[0].set(XML_SPACE, 'preserve')
    ts[0].text = text
    for extra in ts[1:]:
        r.remove(extra)


def has_special(r):
    return any(c.tag not in (q('rPr'), q('t')) for c in r)


def force_ltr(r):
    rpr = r.find(q('rPr'))
    if rpr is None:
        rpr = etree.SubElement(r, q('rPr'))
    for tag in ('cs', 'iCs', 'bCs'):
        e = rpr.find(q(tag))
        if e is not None:
            rpr.remove(e)
    rtl = rpr.find(q('rtl'))
    if rtl is None:
        rtl = etree.SubElement(rpr, q('rtl'))
    rtl.set(q('val'), '0')
    fonts(rpr, TNR, None)
    lang = rpr.find(q('lang'))
    if lang is None:
        lang = etree.SubElement(rpr, q('lang'))
    lang.set(q('val'), 'en-US')
    if lang.get(q('bidi')):
        lang.attrib.pop(q('bidi'), None)


def strip_marks_container(parent):
    n = 0
    for r in list(parent.findall(q('r'))):
        tt = run_text(r)
        if not tt:
            continue
        nt = tt.translate({ord(c): None for c in MARKS})
        if nt != tt:
            set_run_text(r, nt)
            n += 1
        if nt == '' and not has_special(r):
            parent.remove(r)
            n += 1
    return n


def make_ltr_run(template, text):
    r = etree.Element(q('r'))
    rpr_src = template.find(q('rPr'))
    if rpr_src is not None:
        r.append(copy.deepcopy(rpr_src))
    force_ltr(r)
    te = etree.SubElement(r, q('t'))
    te.set(XML_SPACE, 'preserve')
    te.text = text
    return r


def unify_latin_pair(parent):
    """پرانتز باز و بستهٔ متن لاتین در یک ران انگلیسی."""
    n = 0
    failed = set()
    while True:
        runs = parent.findall(q('r'))
        if not runs:
            return n
        full = ''.join(run_text(r) for r in runs)
        found = None
        for m in LATIN_PAREN.finditer(full):
            key = (m.start(), m.end())
            if key in failed:
                continue
            # اگر همین حالا داخل یک ران تنهاست، فقط LTR کن
            pos = 0
            one = None
            for r in runs:
                tx = run_text(r)
                a, b = pos, pos + len(tx)
                pos = b
                if a <= m.start() and m.end() <= b:
                    one = r
                    break
            if one is not None:
                force_ltr(one)
                continue
            found = m
        if found is None:
            return n
        # ادغام چند ران
        start, end, token = found.start(), found.end(), found.group()
        pos = 0
        ov = []
        for r in runs:
            tx = run_text(r)
            a, b = pos, pos + len(tx)
            pos = b
            if b > start and a < end:
                ov.append((r, a, b, tx))
        if not ov or any(has_special(s[0]) for s in ov):
            failed.add((start, end))
            continue
        first_r, f0, _, ftx = ov[0]
        last_r, l0, _, ltx = ov[-1]
        prefix = ftx[: start - f0]
        suffix = ltx[end - l0 :]
        ltr = make_ltr_run(first_r, token)
        set_run_text(first_r, prefix)
        for s in ov[1:]:
            parent.remove(s[0])
        first_r.addnext(ltr)
        if suffix:
            sr = copy.deepcopy(first_r)
            set_run_text(sr, suffix)
            ltr.addnext(sr)
        if prefix == '':
            parent.remove(first_r)
        n += 1
    return n


def steal_open_into_latin(parent):
    """اگر ران فارسی به ( ختم شود و ران لاتین ) داشته باشد، ( را به ران لاتین ببر."""
    n = 0
    runs = [r for r in parent.findall(q('r')) if run_text(r) or has_special(r)]
    nonempty = [(r, run_text(r)) for r in parent.findall(q('r')) if run_text(r)]
    for i in range(1, len(nonempty)):
        r0, a = nonempty[i - 1]
        r1, b = nonempty[i]
        if a.endswith('(') and ')' in b and '(' not in b and re.search(r'[A-Za-z]', b):
            set_run_text(r0, a[:-1])
            set_run_text(r1, '(' + b)
            force_ltr(r1)
            n += 1
    return n


def drop_orphan_closes(parent):
    """) بدون ( هم‌زبان/جفت را حذف کن (نه فهرست ۱) ۲) )."""
    runs = parent.findall(q('r'))
    if not runs:
        return 0
    parts = [(r, run_text(r)) for r in runs]
    full = ''.join(p[1] for p in parts)
    if not full:
        return 0
    # فهرست عددی مثل 1) را نگه دار
    stack = []
    orphan = []
    for i, ch in enumerate(full):
        if ch == '(':
            stack.append(i)
        elif ch == ')':
            if stack:
                stack.pop()
            else:
                # 1) 2) در ابتدای بند
                lead = full[:i].rstrip()
                if re.search(r'(^|\n)\s*\d{1,3}$', lead):
                    continue
                orphan.append(i)
    if not orphan:
        return 0
    # حذف از انتها
    n = 0
    for idx in reversed(orphan):
        pos = 0
        for r, tx in parts:
            if pos <= idx < pos + len(tx):
                off = idx - pos
                nt = tx[:off] + tx[off + 1 :]
                set_run_text(r, nt)
                n += 1
                break
            pos += len(tx)
    return n


def process_container(parent):
    n = strip_marks_container(parent)
    n += steal_open_into_latin(parent)
    n += unify_latin_pair(parent)
    n += drop_orphan_closes(parent)
    return n


def process_para(p):
    st = style_of(p) or ''
    if st in SKIP_STYLES:
        return 0
    n = process_container(p)
    for child in list(p):
        tag = child.tag
        if tag == q('hyperlink') or str(tag).endswith('}hyperlink'):
            n += process_container(child)
    return n


def in_frozen(p, body, front_ids, last_ids):
    cur = p
    while cur is not None and cur is not body:
        if id(cur) in front_ids or id(cur) in last_ids:
            return True
        cur = cur.getparent()
    return False


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
    front_ids = {id(el) for el in kids[:i_toc]}
    last_ids = {id(el) for el in kids[i_pnu:]}

    n = 0
    for p in list(body.iter(q('p'))):
        if in_frozen(p, body, front_ids, last_ids):
            continue
        n += process_para(p)

    n_fn = 0
    if 'word/footnotes.xml' in parts:
        fn = etree.fromstring(parts['word/footnotes.xml'])
        for p in fn.iter(q('p')):
            n_fn += process_para(p)
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

    print('اصلاح پرانتز', n, 'پانویس', n_fn)
    print('freeze OK')
    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
