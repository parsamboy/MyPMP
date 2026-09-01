# -*- coding: utf-8 -*-
"""v2.5: جایگزینی درختواره‌های ورد nazariyeha روی پایان‌نامهٔ مبتنی بر v1.9."""
import copy
import os
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import q, ptext, style_of
from build_nazariyeha import W

SRC = 'Payannameh-Fatemeh-Bayat-v2.4.docx'
NAZ = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.11.docx'
DST = 'Payannameh-Fatemeh-Bayat-v2.5.docx'
WPS = '{http://schemas.microsoft.com/office/word/2010/wordprocessingShape}'
WP = '{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'


def strip_ids(p):
    for el in p.iter():
        for attr in list(el.attrib):
            if attr.endswith('paraId') or attr.endswith('textId'):
                del el.attrib[attr]
    for tag in ('bookmarkStart', 'bookmarkEnd'):
        for b in list(p.iter(q(tag))):
            b.getparent().remove(b)


def set_docpr_ids(p, base):
    n = 0
    for el in p.iter():
        if el.tag.split('}')[-1] == 'docPr':
            el.set('id', str(base + n))
            n += 1
    return n


def naz_trees(naz_doc):
    trees = []
    pending = None
    for p in naz_doc[0].iter(q('p')):
        nw = len(p.findall('.//' + WPS + 'wsp'))
        t = ptext(p)
        st = style_of(p) or ''
        if nw >= 8:
            pending = p
        elif pending is not None and (st == 'Caption' or t.startswith('شکل ')):
            trees.append(pending)
            pending = None
    return trees


def png_tree_paras(body):
    found = []
    for p in body.iter(q('p')):
        rids = []
        for blip in p.findall('.//' + A + 'blip'):
            rid = blip.get(R + 'embed') or ''
            if rid.startswith('rIdTreePng'):
                rids.append(rid)
        if rids:
            found.append((p, rids[0]))
    found.sort(key=lambda x: x[1])
    return [p for p, _ in found]


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    naz = zipfile.ZipFile(NAZ)
    naz_doc = etree.fromstring(naz.read('word/document.xml'))
    naz.close()

    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    src_trees = naz_trees(naz_doc)
    dst_trees = png_tree_paras(body)
    print('naz trees', len(src_trees), 'png slots', len(dst_trees))
    if len(src_trees) != 4 or len(dst_trees) != 4:
        raise SystemExit('tree count mismatch')

    for i, (old, src) in enumerate(zip(dst_trees, src_trees)):
        np = copy.deepcopy(src)
        strip_ids(np)
        set_docpr_ids(np, 200 + i * 20)
        parent = old.getparent()
        idx = list(parent).index(old)
        parent.remove(old)
        parent.insert(idx, np)
        print('replaced', i, 'wsp', len(np.findall('.//' + WPS + 'wsp')),
              'next', ptext(list(parent)[idx + 1])[:40] if idx + 1 < len(list(parent)) else '')

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
