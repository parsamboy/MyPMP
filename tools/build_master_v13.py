# -*- coding: utf-8 -*-
"""v1.3 از v1.2: نمایش درست پرانتز وقتی زبان داخل و بیرون فرق دارد."""
import copy
import os
import re
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import LOTUS, TNR, fonts, ptext, q, style_of

SRC = 'MasterThesis-Fatemeh-Bayat-v1.2.docx'
DST = 'MasterThesis-Fatemeh-Bayat-v1.3.docx'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
LRM = '\u200e'
SKIP_STYLES = {'EnglishText', 'References'}
LATIN_PAREN = re.compile(r'\([^()]*[A-Za-z][^()]*\)')


def freeze_xml(el):
    return etree.tostring(el)


def has_special(r):
    for c in r:
        if c.tag not in (q('rPr'), q('t')):
            return True
    return False


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


def make_ltr_run(template, text):
    r = etree.Element(q('r'))
    rpr_src = template.find(q('rPr'))
    if rpr_src is not None:
        rpr = copy.deepcopy(rpr_src)
        r.append(rpr)
    else:
        rpr = etree.SubElement(r, q('rPr'))
    for tag in ('rtl', 'cs', 'iCs', 'bCs'):
        e = rpr.find(q(tag))
        if e is not None:
            rpr.remove(e)
    fonts(rpr, TNR, None)
    lang = rpr.find(q('lang'))
    if lang is None:
        lang = etree.SubElement(rpr, q('lang'))
    lang.set(q('val'), 'en-US')
    if lang.get(q('bidi')):
        lang.attrib.pop(q('bidi'), None)
    te = etree.SubElement(r, q('t'))
    te.set(XML_SPACE, 'preserve')
    te.text = text
    return r


def apply_match(parent, start, end, token):
    runs = parent.findall(q('r'))
    pos = 0
    spans = []
    for r in runs:
        tx = run_text(r)
        spans.append((r, pos, pos + len(tx), tx))
        pos += len(tx)
    ov = [s for s in spans if s[2] > start and s[1] < end]
    if not ov or any(has_special(s[0]) for s in ov):
        return 0
    first_r, f0, _, ftx = ov[0]
    last_r, l0, _, ltx = ov[-1]
    prefix = ftx[: start - f0]
    suffix = ltx[end - l0 :]
    if prefix and re.search(r'[آ-ی]$', prefix) and not prefix.endswith(' '):
        prefix = prefix + ' '
    elif not prefix:
        prev = first_r.getprevious()
        while prev is not None and prev.tag != q('r'):
            prev = prev.getprevious()
        if prev is not None:
            ptx = run_text(prev)
            if ptx and re.search(r'[آ-ی]$', ptx) and not ptx.endswith(' '):
                set_run_text(prev, ptx + ' ')
    inner = LRM + token + LRM
    ltr = make_ltr_run(first_r, inner)
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
    return 1


def already_wrapped(full, start, end):
    prev = full[start - 1] if start else ''
    nxt = full[end] if end < len(full) else ''
    return prev == LRM or nxt == LRM or LRM in full[start:end]


def process_container(parent):
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
            if key in failed or already_wrapped(full, m.start(), m.end()):
                continue
            found = m
        if found is None:
            return n
        if apply_match(parent, found.start(), found.end(), found.group()):
            n += 1
        else:
            failed.add((found.start(), found.end()))
            if len(failed) > 40:
                return n
    return n


def space_between_runs(parent):
    n = 0
    nonempty = [(r, run_text(r)) for r in parent.findall(q('r')) if run_text(r)]
    for i in range(len(nonempty) - 1):
        r, a = nonempty[i]
        _, b = nonempty[i + 1]
        if re.search(r'[آ-ی]$', a) and b.startswith('('):
            set_run_text(r, a + ' ')
            n += 1
    return n


def process_para(p):
    st = style_of(p) or ''
    if st in SKIP_STYLES:
        return 0
    t = ptext(p)
    if not re.search(r'[آ-ی]', t):
        return 0
    n = space_between_runs(p)
    n += process_container(p)
    for child in list(p):
        tag = child.tag
        if tag == q('hyperlink') or tag.endswith('}hyperlink'):
            n += space_between_runs(child)
            n += process_container(child)
    return n


SPACE_BEFORE = re.compile(r'([\u0600-\u06FF])\(')


def patch_simple(root):
    n = 0
    for t in root.iter(q('t')):
        if not t.text:
            continue
        if 'شی)۱۹۷۹' in t.text:
            t.text = t.text.replace('شی)۱۹۷۹', 'شی (۱۹۷۹')
            n += 1
        nt, k = SPACE_BEFORE.subn(r'\1 (', t.text)
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
    front_ids = {id(el) for el in kids[:i_toc]}
    last_ids = {id(el) for el in kids[i_pnu:]}

    n_simple = patch_simple(doc)
    n_iso = 0
    for p in list(body.iter(q('p'))):
        # skip if this p is inside frozen front/last block: only skip top-level
        skip = False
        cur = p
        while cur is not None and cur is not body:
            if id(cur) in front_ids or id(cur) in last_ids:
                skip = True
                break
            cur = cur.getparent()
        if skip:
            continue
        n_iso += process_para(p)

    n_fn = 0
    if 'word/footnotes.xml' in parts:
        fn = etree.fromstring(parts['word/footnotes.xml'])
        n_simple += patch_simple(fn)
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

    print('شی)۱۹۷۹', n_simple, 'پرانتز جداشده', n_iso, 'پانویس', n_fn)
    print('freeze OK')
    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
