# -*- coding: utf-8 -*-
"""v1.1e1: پذیرش اصلاحات e0 — بدون رنگ، بدون خط‌خوردگی، بدون پرانتز علت."""
import os
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import ptext, q, style_of

SRC = 'MasterThesis-Fatemeh-Bayat-v1.1e0.docx'
DST = 'MasterThesis-Fatemeh-Bayat-v1.1e1.docx'
GREEN = '1B7A3D'
RED = 'C00000'
NOTE = '1F4E79'


def rpr(r):
    return r.find(q('rPr'))


def color_of(r):
    rp = rpr(r)
    if rp is None:
        return ''
    c = rp.find(q('color'))
    return (c.get(q('val')) or '').upper() if c is not None else ''


def is_strike(r):
    rp = rpr(r)
    return rp is not None and rp.find(q('strike')) is not None


def is_note(r):
    if color_of(r) != NOTE:
        return False
    rp = rpr(r)
    sz = rp.find(q('sz')) if rp is not None else None
    return sz is not None and sz.get(q('val')) == '20'


def uncolor(r):
    rp = rpr(r)
    if rp is None:
        return
    c = rp.find(q('color'))
    if c is not None:
        rp.remove(c)
    st = rp.find(q('strike'))
    if st is not None:
        rp.remove(st)


def freeze_xml(el):
    return etree.tostring(el)


def drop_unused_footnotes(doc, fn_root):
    used = {fr.get(q('id')) for fr in doc.iter(q('footnoteReference'))}
    n = 0
    for f in list(fn_root.findall(q('footnote'))):
        if f.get(q('type')):
            continue
        if f.get(q('id')) not in used:
            fn_root.remove(f)
            n += 1
    return n


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
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

    n_del = n_keep = n_note = 0
    for el in list(body):
        if el.tag != q('p'):
            continue
        if id(el) in front_ids or id(el) in last_ids:
            continue
        st = style_of(el) or ''
        runs = [r for r in el.findall(q('r'))]
        if not runs:
            continue
        # remove note runs
        for r in list(runs):
            if is_note(r):
                el.remove(r)
                n_note += 1
        runs = [r for r in el.findall(q('r'))]
        text_runs = [r for r in runs if r.find(q('t')) is not None]
        if not text_runs:
            continue
        reds = [r for r in text_runs if color_of(r) == RED and is_strike(r)]
        greens = [r for r in text_runs if color_of(r) == GREEN]
        # phrase-level: ایمنیپیری red + ایمنی، پیری green
        if reds and greens and len(reds) <= 2:
            for r in reds:
                el.remove(r)
            for r in greens:
                uncolor(r)
            n_keep += 1
            continue
        # whole-para red deletion
        if reds and not greens and len(reds) == len(text_runs):
            body.remove(el)
            n_del += 1
            continue
        # green replacement para
        if greens and not reds:
            for r in greens:
                uncolor(r)
            n_keep += 1
            continue
        # leftover colors
        for r in text_runs:
            if color_of(r) in (GREEN, RED, NOTE) or is_strike(r):
                uncolor(r)

    # nested paras (درختواره و غیره)
    for p in list(body.iter(q('p'))):
        if id(p) in front_ids or id(p) in last_ids:
            continue
        for r in list(p.findall(q('r'))):
            if is_note(r):
                p.remove(r)
                continue
            if color_of(r) in (GREEN, RED, NOTE) or is_strike(r):
                if color_of(r) == RED and is_strike(r) and r.find(q('t')) is not None:
                    # leftover struck tree labels: restore as normal
                    uncolor(r)
                else:
                    uncolor(r)
        for t in p.iter(q('t')):
            if not t.text:
                continue
            if 'کینگ (۲۰۰۰)' in t.text:
                t.text = t.text.replace('کینگ (۲۰۰۰)', 'کینگ و دی‌سیکو (۲۰۰۹)')
            if t.text.strip().startswith('(۲۰۰۰)'):
                t.text = t.text.replace('(۲۰۰۰)', 'و دی‌سیکو (۲۰۰۹)', 1)

    nu = drop_unused_footnotes(doc, fn_root)
    print('deleted paras', n_del, 'accepted', n_keep, 'notes dropped', n_note, 'fn unused', nu)

    kids2 = list(body)
    i_toc2 = None
    i_pnu2 = None
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

    leftover = 0
    for r in doc.iter(q('r')):
        if color_of(r) in (GREEN, RED, NOTE) or is_strike(r):
            leftover += 1
    print('leftover color/strike runs', leftover)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn_root, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
