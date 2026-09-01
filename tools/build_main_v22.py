# -*- coding: utf-8 -*-
"""v2.2: درختواره‌های قابل‌نمایش (PNG)، تکمیل غنی‌سازی فصل ۲، DOI معتبر."""
import copy
import os
import struct
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_nazariyeha as B
from build_nazariyeha import W, q
from build_nazariyeha_v17 import ptext
from build_nazariyeha_v20 import add_rel, last_heading, insert_bib_alpha, bib_with_url, bib_plain
from build_main_v20 import style_of, first_rpr
from build_main_v21 import clone_footnote

SRC = 'Payannameh-Fatemeh-Bayat-v2.1.docx'
NAZ = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.11.docx'
DST = 'Payannameh-Fatemeh-Bayat-v2.2.docx'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
GREEN = '1B7A3D'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
WPS = '{http://schemas.microsoft.com/office/word/2010/wordprocessingShape}'
NSR_IMG = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image'

TREES = [
    ('tools/tree_theories.png', 'rIdTreePng1', 'tree1.png', 'درختواره نظریه‌های سالمندی', 100),
    ('tools/tree_death_anxiety.png', 'rIdTreePng2', 'tree2.png', 'درختواره اضطراب مرگ', 101),
    ('tools/tree_spiritual_iq.png', 'rIdTreePng3', 'tree3.png', 'درختواره هوش معنوی', 102),
    ('tools/tree_health_anxiety.png', 'rIdTreePng4', 'tree4.png', 'درختواره اضطراب سلامت', 103),
]

NEW_BIBS = [
    ('Franceschi, C.',
     'Franceschi, C., Garagnani, P., Parini, P., Giuliani, C., & Santoro, A. (2018). Inflammaging: A new immune–metabolic viewpoint for age-related diseases. Nature Reviews Endocrinology, 14(10), 576–590. ',
     'rIdDoiFranc18', 'https://doi.org/10.1038/s41574-018-0059-4'),
    ('Rowe, J. W., & Kahn, R. L. (2015)',
     'Rowe, J. W., & Kahn, R. L. (2015). Successful aging 2.0: Conceptual expansions for the 21st century. The Journals of Gerontology, Series B, 70(4), 593–596. ',
     'rIdDoiRowe15', 'https://doi.org/10.1093/geronb/gbv025'),
    ('Westerhof, G. J.',
     'Westerhof, G. J., Bohlmeijer, E. T., & McAdams, D. P. (2017). The relation of ego integrity and despair to personality traits and mental health. The Journals of Gerontology, Series B, 72(3), 400–407. ',
     'rIdDoiWest17', 'https://doi.org/10.1093/geronb/gbv062'),
    ('Iverach, L.',
     'Iverach, L., Menzies, R. G., & Menzies, R. E. (2014). Death anxiety and its role in psychopathology: Reviewing the status of a transdiagnostic construct. Clinical Psychology Review, 34(7), 580–593. ',
     'rIdDoiIver14', 'https://doi.org/10.1016/j.cpr.2014.09.002'),
    ('Menzies, R. E., & Menzies, R. G. (2020)',
     'Menzies, R. E., & Menzies, R. G. (2020). Death anxiety in the time of COVID-19: Theoretical explanations and clinical implications. The Cognitive Behaviour Therapist, 13, e19. ',
     'rIdDoiMenz20', 'https://doi.org/10.1017/S1754470X20000215'),
    ('Pyszczynski, T., Lockett',
     'Pyszczynski, T., Lockett, M., Greenberg, J., & Solomon, S. (2021). Terror management theory and the COVID-19 pandemic. Journal of Humanistic Psychology, 61(2), 173–189. ',
     'rIdDoiPysz21', 'https://doi.org/10.1177/0022167820959488'),
    ('Wong, P. T. P. (2008)',
     'Wong, P. T. P. (2008). Meaning management theory and death acceptance. In A. Tomer, G. T. Eliason, & P. T. P. Wong (Eds.), Existential and spiritual issues in death attitudes (pp. 65–87). Erlbaum.',
     None, None),
]


def png_size(path):
    with open(path, 'rb') as f:
        f.read(16)
        w, h = struct.unpack('>II', f.read(8))
    return w, h


def is_green(p):
    for r in p.iter(q('r')):
        rpr = r.find(q('rPr'))
        if rpr is None:
            continue
        c = rpr.find(q('color'))
        if c is not None and (c.get(q('val')) or '').upper() == GREEN:
            return True
    return False


def strip_green(p):
    for r in p.iter(q('r')):
        rpr = r.find(q('rPr'))
        if rpr is None:
            continue
        for c in list(rpr.findall(q('color'))):
            if (c.get(q('val')) or '').upper() == GREEN:
                rpr.remove(c)
    return p


def strip_para_ids(p):
    for el in p.iter():
        for attr in list(el.attrib):
            if attr.endswith('paraId') or attr.endswith('textId'):
                del el.attrib[attr]


def already_in(text, hay):
    t = text.strip()
    if not t:
        return True
    if t in hay:
        return True
    if len(t) >= 40 and t[:40] in hay:
        return True
    if len(t) >= 55 and t[:55] in hay:
        return True
    return False


def last_para_with(body, needle):
    found = None
    if not needle:
        return None
    for p in body.iter(q('p')):
        t = ptext(p)
        if needle in t:
            found = p
    return found


def make_pic_drawing(rid, name, descr, docpr_id, cx, cy):
    xml = '''<w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
          xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
          xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
          xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="{cx}" cy="{cy}"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="{did}" name="{name}" descr="{descr}"/>
        <wp:cNvGraphicFramePr>
          <a:graphicFrameLocks noChangeAspect="1"/>
        </wp:cNvGraphicFramePr>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic>
              <pic:nvPicPr>
                <pic:cNvPr id="0" name="{name}"/>
                <pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="{rid}"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr bwMode="auto">
                <a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>'''.format(cx=cx, cy=cy, did=docpr_id, name=name, descr=descr, rid=rid)
    return etree.fromstring(xml)


def fn_maps(fn_root):
    exact, first = {}, {}
    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')):
            continue
        fid = f.get(q('id'))
        txt = ptext(f).strip()
        exact[txt] = fid
        tok = txt.split()[0] if txt else ''
        first.setdefault(tok, fid)
    return exact, first


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    naz = zipfile.ZipFile(NAZ)
    naz_doc = etree.fromstring(naz.read('word/document.xml'))
    naz_fn = etree.fromstring(naz.read('word/footnotes.xml'))
    naz.close()

    doc = etree.fromstring(parts['word/document.xml'])
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    body = doc[0]
    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    existing_rids = {rel.get('Id') for rel in rels}

    # media + rels for tree PNGs
    for path, rid, fname, descr, did in TREES:
        add_rel(rels, existing_rids, rid, 'media/' + fname)
        # force type image
        for rel in rels:
            if rel.get('Id') == rid:
                rel.set('Type', NSR_IMG)
                rel.set('Target', 'media/' + fname)
        with open(path, 'rb') as f:
            parts['word/media/' + fname] = f.read()
        print('media', fname, len(parts['word/media/' + fname]))

    for key, _txt, rid, url in NEW_BIBS:
        if rid and url:
            add_rel(rels, existing_rids, rid, url)
    add_rel(rels, existing_rids, 'rIdDoiHav61', 'https://doi.org/10.1093/geront/1.1.8')

    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)

    # replace wps trees with PNG so they render in Word/preview
    tree_paras = []
    for p in body.iter(q('p')):
        if len(p.findall('.//' + WPS + 'wsp')) >= 8:
            tree_paras.append(p)
    print('wps trees', len(tree_paras))
    cx = 5669280
    for p, (path, rid, fname, descr, did) in zip(tree_paras, TREES):
        w, h = png_size(path)
        cy = int(cx * h / float(w))
        drawing = make_pic_drawing(rid, fname, descr, did, cx, cy)
        # replace existing drawing
        old = None
        for el in p.iter(q('drawing')):
            old = el
            break
        if old is None:
            print('no drawing in tree para')
            continue
        parent = old.getparent()
        idx = list(parent).index(old)
        parent.remove(old)
        parent.insert(idx, drawing)
        print('png tree', fname, 'cy', cy)

    tmpl = None
    for f in fn_root.findall(q('footnote')):
        if f.get(q('id')) == '5':
            tmpl = f
            break
    fn_ids = [int(f.get(q('id'))) for f in fn_root.findall(q('footnote'))
              if f.get(q('id')) and not f.get(q('type'))]
    nxt = max(fn_ids) + 1
    exact, first = fn_maps(fn_root)

    def add_fn(latin):
        nonlocal nxt
        fid = nxt
        nxt += 1
        fn_root.append(clone_footnote(tmpl, fid, latin))
        exact[latin] = str(fid)
        tok = latin.split()[0] if latin else ''
        first.setdefault(tok, str(fid))
        return str(fid)

    orig_ref = None
    for r in doc.iter(q('r')):
        fr = r.find(q('footnoteReference'))
        if fr is not None and fr.get(q('id')) == '5' and r.find(q('rPr')) is not None:
            orig_ref = r.find(q('rPr'))
            break

    naz_fn_txt = {}
    for f in naz_fn.findall(q('footnote')):
        if f.get(q('type')):
            continue
        naz_fn_txt[f.get(q('id'))] = ptext(f).strip()

    def remap_fns(p):
        for r in p.iter(q('r')):
            fr = r.find(q('footnoteReference'))
            if fr is None:
                continue
            oid = fr.get(q('id'))
            ntxt = naz_fn_txt.get(oid, '')
            newid = exact.get(ntxt)
            if newid is None and ntxt:
                tok = ntxt.split()[0]
                newid = first.get(tok)
            if newid is None:
                newid = add_fn(ntxt or 'note')
            fr.set(q('id'), str(newid))
            old = r.find(q('rPr'))
            if old is not None:
                r.remove(old)
            if orig_ref is not None:
                r.insert(0, copy.deepcopy(orig_ref))

    naz_paras = list(naz_doc[0].iter(q('p')))
    inserted = 0
    for i, p in enumerate(naz_paras):
        if not is_green(p):
            continue
        st = style_of(p) or ''
        t = ptext(p).strip()
        if st.startswith('TOC') or st == 'Caption' or t.startswith('شکل '):
            continue
        if st == 'Bibliography' or t[:1].isascii() and t[:8].replace(',', '').replace('.', '').replace(' ', '').isalpha() and '(' in t[:40]:
            # bib handled later if Bibliography; skip latin-looking green bib here too
            if st == 'Bibliography' or (t[:1].isascii() and ', ' in t[:30] and '(' in t[:40]):
                continue
        if len(p.findall('.//' + WPS + 'wsp')) >= 8:
            continue
        hay = '\n'.join(ptext(x) for x in body.iter(q('p')))
        if already_in(t, hay):
            continue
        if t.startswith('۱- مسیر اضطرابی با بیش‌فعال‌سازی نظام دلبستگی'):
            continue
        # previous naz para that already exists in main
        anchor = None
        for j in range(i - 1, -1, -1):
            prev = ptext(naz_paras[j]).strip()
            if prev and already_in(prev, hay):
                anchor = prev[:50]
                break
        np = copy.deepcopy(p)
        strip_green(np)
        strip_para_ids(np)
        remap_fns(np)
        target = last_para_with(body, anchor) if anchor else None
        if target is None:
            print('NO ANCHOR', t[:60])
            continue
        parent = target.getparent()
        idx = list(parent).index(target) + 1
        parent.insert(idx, np)
        inserted += 1
        print('ins', inserted, t[:55])

    # bibliography
    hlat = last_heading(body, 'منابع لاتین')
    parent = hlat.getparent()
    kids = list(parent)
    start = kids.index(hlat) + 1
    existing_txt = []
    for el in kids[start:]:
        if el.tag != q('p'):
            break
        existing_txt.append(ptext(el))
    for key, text, rid, url in NEW_BIBS:
        if any(key[:24] in p for p in existing_txt):
            print('bib exists', key)
            continue
        if rid and url:
            para = bib_with_url(text, rid, url, green=False)
        else:
            para = bib_plain(text, green=False)
        insert_bib_alpha(body, hlat, para, key)
        existing_txt.append(key)
        print('bib add', key)

    for p in body.iter(q('p')):
        t = ptext(p)
        if t.startswith('Havighurst, R. J. (1961)') and p.find(q('hyperlink')) is None:
            # space + url
            from build_main_v21 import append_url_run
            append_url_run(p, 'rIdDoiHav61', 'https://doi.org/10.1093/geront/1.1.8')
            print('link Havighurst 1961')

    # align new fn refs
    if orig_ref is not None:
        nfix = 0
        for r in doc.iter(q('r')):
            fr = r.find(q('footnoteReference'))
            if fr is None:
                continue
            fid = int(fr.get(q('id') or 0))
            if fid >= 106:
                old = r.find(q('rPr'))
                if old is not None:
                    r.remove(old)
                r.insert(0, copy.deepcopy(orig_ref))
                nfix += 1
        print('fn ref rPr aligned', nfix)

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
