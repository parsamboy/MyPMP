# -*- coding: utf-8 -*-
"""v2.4 از روی v1.9: درختواره و غنی‌سازی علمی nazariyeha-v1.11 + استایل/فهرست/پانویس."""
import copy
import os
import struct
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import apply_v19 as A
from apply_v19 import q, ptext, style_of, set_pstyle
from build_nazariyeha import W
from build_nazariyeha_v17 import ptext as ptext17
from build_nazariyeha_v20 import last_heading, insert_bib_alpha, bib_with_url, bib_plain
from build_main_v20 import first_rpr, body_para
from build_main_v21 import clone_footnote, insert_after
from build_main_v22 import (
    png_size, is_green, strip_green, strip_para_ids, already_in,
    last_para_with, make_pic_drawing, fn_maps, TREES as TREES22, NEW_BIBS,
    GREEN, XML_SPACE, WPS, NSR_IMG,
)
from build_main_v23 import (
    fix_styles, apply_para_complex, apply_para_latin, add_bookmark,
    retarget_toc, last_toc, arabic_to_persian, orig_fn_ref_rpr, setv,
    TITR, LOTUS, finish_ppr,
)

SRC = 'Payannameh-Fatemeh-Bayat-v1.9.docx'
NAZ = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.11.docx'
DST = 'Payannameh-Fatemeh-Bayat-v2.4.docx'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'

# reuse tree files; captions
TREE_SPEC = [
    ('tools/tree_theories.png', 'rIdTreePng1', 'tree1.png',
     'درختواره نظریه‌های سالمندی', 100,
     'شکل ۱- درختواره نظریه‌های سالمندی (شاخه زیست‌شناختی، روان‌شناختی و جامعه‌شناختی)',
     '۲-۱-۲- نظریه‌های سالمندی'),
    ('tools/tree_death_anxiety.png', 'rIdTreePng2', 'tree2.png',
     'درختواره اضطراب مرگ', 101,
     'شکل ۲- درختواره اضطراب مرگ (نظریه‌ها، ابعاد، عوامل و پیامدها)',
     '۲-۲- گستره دوم'),
    ('tools/tree_spiritual_iq.png', 'rIdTreePng3', 'tree3.png',
     'درختواره هوش معنوی', 102,
     'شکل ۳- درختواره هوش معنوی (مفهوم، فضیلت‌گرایی، عوامل و مدل چهارعاملی کینگ)',
     '۲-۳- گستره سوم'),
    ('tools/tree_health_anxiety.png', 'rIdTreePng4', 'tree4.png',
     'درختواره اضطراب سلامت', 103,
     'شکل ۴- درختواره اضطراب سلامت (مفهوم، مدل‌های نظری، عوامل و مداخلات)',
     '۲-۴- گستره چهارم'),
]

EXTRA_BIBS = [
    ('Carstensen, L. L. (2006)',
     'Carstensen, L. L. (2006). The influence of a sense of time on human development. Science, 312(5782), 1913–1915. ',
     'rIdDoiSST06', 'https://doi.org/10.1126/science.1127488'),
    ('Carstensen, L. L. (2021)',
     'Carstensen, L. L. (2021). Socioemotional selectivity theory: The role of perceived endings in human motivation. The Gerontologist, 61(8), 1188–1196. ',
     'rIdDoiSST21', 'https://doi.org/10.1093/geront/gnab116'),
    ('Carstensen, L. L., Isaacowitz',
     'Carstensen, L. L., Isaacowitz, D. M., & Charles, S. T. (1999). Taking time seriously: A theory of socioemotional selectivity. American Psychologist, 54(3), 165–181. ',
     'rIdDoiSST99', 'https://doi.org/10.1037/0003-066X.54.3.165'),
    ('Reed, A. E.',
     'Reed, A. E., Chan, L., & Mikels, J. A. (2014). Meta-analysis of the age-related positivity effect: Age differences in preferences for positive over negative information. Psychology and Aging, 29(1), 1–15. ',
     'rIdDoiReed14', 'https://doi.org/10.1037/a0035194'),
    ('Warwick, H. M. C.',
     'Warwick, H. M. C., & Salkovskis, P. M. (1990). Hypochondriasis. Behaviour Research and Therapy, 28(2), 105–117. ',
     'rIdDoiWarwick90', 'https://doi.org/10.1016/0005-7967(90)90023-c'),
    ('Stuart, S., & Noyes, R., Jr. (1999)',
     'Stuart, S., & Noyes, R., Jr. (1999). Attachment and interpersonal communication in somatization. Psychosomatics, 40(1), 34–43. ',
     'rIdDoiStuart99', 'https://doi.org/10.1016/S0033-3182(99)71269-7'),
    ('Noyes, R., Jr., Stuart, S. P., Langbehn',
     'Noyes, R., Jr., Stuart, S. P., Langbehn, D. R., Happel, R. L., Longley, S. L., Muller, B. A., & Yagla, S. J. (2003). Test of an interpersonal model of hypochondriasis. Psychosomatic Medicine, 65(2), 292–300. ',
     'rIdDoiNoyes03', 'https://doi.org/10.1097/01.PSY.0000058377.50240.64'),
]

HEADING_FIXES = [
    ('۱-۵-۲-فرضیات فرعی:', '۱-۵-۲- فرضیه‌های فرعی:'),
    ('۱-۵- فرضیه های پژوهش', '۱-۵- فرضیه‌های پژوهش'),
    ('۲-۱-۲-۱-۲-نظریه پیر شدن سلولی', '۲-۱-۲-۱-۲- نظریه پیر شدن سلولی'),
    ('۲-۱-۲- نظریه های سالمندی', '۲-۱-۲- نظریه‌های سالمندی'),
    ('۲-۳-۳- عوامل موثر بر هوش معنوی', '۲-۳-۳- عوامل مؤثر بر هوش معنوی'),
    ('۳-۳-۲- پرسشنامه اضطراب مرگ(DAS)', '۳-۳-۲- پرسشنامه اضطراب مرگ (DAS)'),
    ('۳-۳-۳- پرسشنامه اضطراب سلامتی(HAI)', '۳-۳-۳- پرسشنامه اضطراب سلامتی (HAI)'),
    ('۳-۲- جامعه، نمونه و روش نمونه گیری', '۳-۲- جامعه، نمونه و روش نمونه‌گیری'),
    ('۴-۱- یافته های توصیفی', '۴-۱- یافته‌های توصیفی'),
    ('۴-۲- یافته های استنباطی', '۴-۲- یافته‌های استنباطی'),
    ('۵-۲- محدودیت های تحقیق', '۵-۲- محدودیت‌های تحقیق'),
]


def add_hyper_rel(rels, existing, rid, url):
    if rid in existing:
        return
    REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
    rel = etree.SubElement(rels, '{%s}Relationship' % REL_NS)
    rel.set('Id', rid)
    rel.set('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink')
    rel.set('Target', url)
    rel.set('TargetMode', 'External')
    existing.add(rid)


def add_image_rel(rels, existing, rid, target):
    if rid in existing:
        return
    REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
    rel = etree.SubElement(rels, '{%s}Relationship' % REL_NS)
    rel.set('Id', rid)
    rel.set('Type', NSR_IMG)
    rel.set('Target', target)
    existing.add(rid)


def caption_para(template, text):
    p = copy.deepcopy(template)
    strip_para_ids(p)
    for tag in ('bookmarkStart', 'bookmarkEnd'):
        for b in list(p.iter(q(tag))):
            b.getparent().remove(b)
    # remove drawings
    for el in list(p.iter(q('drawing'))):
        el.getparent().remove(el)
    runs = p.findall(q('r'))
    if not runs:
        r = etree.SubElement(p, q('r'))
        t = etree.SubElement(r, q('t'))
        t.text = text
        return p
    first = True
    for r in runs:
        te = r.find(q('t'))
        if te is None:
            continue
        if first:
            te.text = text
            first = False
        else:
            te.text = ''
    ppr = p.find(q('pPr'))
    if ppr is not None:
        ps = ppr.find(q('pStyle'))
        if ps is None:
            ps = etree.Element(q('pStyle'))
            ppr.insert(0, ps)
        ps.set(q('val'), 'Caption')
    return p


def image_para(rid, name, descr, did, cx, cy):
    p = etree.Element(q('p'))
    ppr = etree.SubElement(p, q('pPr'))
    jc = etree.SubElement(ppr, q('jc'))
    jc.set(q('val'), 'center')
    bidi = etree.SubElement(ppr, q('bidi'))
    bidi.set(q('val'), '1')
    r = etree.SubElement(p, q('r'))
    r.append(make_pic_drawing(rid, name, descr, did, cx, cy))
    return p


def last_heading_start(body, start):
    found = None
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if st.startswith('Heading') and ptext(p).replace('‌', '').startswith(start.replace('‌', '')):
            found = p
    return found


def rewrite_heading_text(p, new):
    ts = list(p.iter(q('t')))
    if not ts:
        return
    ts[0].text = new
    ts[0].set(XML_SPACE, 'preserve')
    for t in ts[1:]:
        t.text = ''


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
    styles = etree.fromstring(parts['word/styles.xml'])
    body = doc[0]
    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    existing = {rel.get('Id') for rel in rels}

    # heading wording
    n_h = 0
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if not st.startswith('Heading'):
            continue
        t = ptext(p).strip()
        for old, new in HEADING_FIXES:
            if t == old or t.startswith(old):
                rewrite_heading_text(p, new)
                n_h += 1
                break
    print('heading fixes', n_h)

    # media + rels
    for path, rid, fname, descr, did, cap, place in TREE_SPEC:
        add_image_rel(rels, existing, rid, 'media/' + fname)
        with open(path, 'rb') as f:
            parts['word/media/' + fname] = f.read()
    all_bibs = list(NEW_BIBS) + EXTRA_BIBS
    for key, text, rid, url in all_bibs:
        if rid and url:
            add_hyper_rel(rels, existing, rid, url)
    add_hyper_rel(rels, existing, 'rIdDoiHav61', 'https://doi.org/10.1093/geront/1.1.8')
    add_hyper_rel(rels, existing, 'rIdDoiAtchley89', 'https://doi.org/10.1093/geront/29.2.183')
    add_hyper_rel(rels, existing, 'rIdDoiLopez23', 'https://doi.org/10.1016/j.cell.2022.11.001')
    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)

    # caption template
    cap_tmpl = None
    for p in body.iter(q('p')):
        if style_of(p) == 'Caption':
            cap_tmpl = p
            break

    # trees
    cx = 5669280
    for path, rid, fname, descr, did, cap, place in TREE_SPEC:
        w, h = png_size(path)
        cy = int(cx * h / float(w))
        img = image_para(rid, fname, descr, did, cx, cy)
        cap_p = caption_para(cap_tmpl, cap) if cap_tmpl is not None else caption_para(etree.Element(q('p')), cap)
        ok = insert_after(body, place, [img, cap_p])
        print('tree', fname, ok)

    # footnotes
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

    orig_ref = orig_fn_ref_rpr(doc)
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
                newid = first.get(ntxt.split()[0])
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
        if st == 'Bibliography' or (t[:1].isascii() and '(' in t[:40] and ', ' in t[:50]):
            continue
        if len(p.findall('.//' + WPS + 'wsp')) >= 8:
            continue
        hay = '\n'.join(ptext(x) for x in body.iter(q('p')))
        if already_in(t, hay):
            continue
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
            print('NO ANCHOR', t[:55])
            continue
        parent = target.getparent()
        idx = list(parent).index(target) + 1
        parent.insert(idx, np)
        inserted += 1
        print('ins', inserted, t[:50])

    # bibliography
    hlat = last_heading(body, 'منابع لاتین')
    parent = hlat.getparent()
    kids = list(parent)
    start = kids.index(hlat) + 1
    existing_txt = [ptext(el) for el in kids[start:] if el.tag == q('p')]
    for key, text, rid, url in all_bibs:
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

    from build_main_v21 import append_url_run
    for p in body.iter(q('p')):
        t = ptext(p)
        if t.startswith('Havighurst, R. J. (1961)') and p.find(q('hyperlink')) is None:
            append_url_run(p, 'rIdDoiHav61', 'https://doi.org/10.1093/geront/1.1.8')
            print('link Havighurst')
        if t.startswith('Atchley, R. C. (1989)') and p.find(q('hyperlink')) is None:
            append_url_run(p, 'rIdDoiAtchley89', 'https://doi.org/10.1093/geront/29.2.183')
            print('link Atchley')
        if t.startswith('López-Otín') and p.find(q('hyperlink')) is None:
            append_url_run(p, 'rIdDoiLopez23', 'https://doi.org/10.1016/j.cell.2022.11.001')
            print('link Lopez')

    # King-only footnote if کینگ marked with King & DeCicco
    king_only = None
    for p in body.iter(q('p')):
        t = ptext(p)
        if t.startswith('کینگ هوش معنوی را') or t.startswith('در مجموع، پیشینه داخلی'):
            if king_only is None:
                king_only = add_fn('King')
            for r in p.iter(q('r')):
                fr = r.find(q('footnoteReference'))
                if fr is not None:
                    fid = fr.get(q('id'))
                    # if this is the first mark on کینگ
                    pass

    orig_ref = orig_fn_ref_rpr(doc)
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
        print('fn rPr', nfix)

    # bookmarks + TOC
    sst_h = last_heading_start(body, '۲-۱-۲-۲-۴-')
    king_h = last_heading_start(body, '۲-۳-۴- مدل چهارعاملی')
    if sst_h is not None:
        add_bookmark(sst_h, '_Toc238572200', 5002)
        print('bm SST')
    if king_h is not None:
        add_bookmark(king_h, '_Toc238572201', 5003)
        print('bm King')
    toc_erik = last_toc(body, '۲-۱-۲-۲-۳- نظریه اریکسون')
    toc_233 = last_toc(body, '۲-۳-۳-')
    if toc_erik is not None and sst_h is not None:
        np = copy.deepcopy(toc_erik)
        retarget_toc(np, '۲-۱-۲-۲-۴- نظریه انتخاب اجتماعی-هیجانی', '_Toc238572200', '۱۸')
        parent = toc_erik.getparent()
        parent.insert(list(parent).index(toc_erik) + 1, np)
        print('TOC SST')
    if toc_233 is not None and king_h is not None:
        for t in toc_233.iter(q('t')):
            if t.text and 'موثر' in t.text:
                t.text = t.text.replace('موثر', 'مؤثر')
        np = copy.deepcopy(toc_233)
        retarget_toc(np, '۲-۳-۴- مدل چهارعاملی هوش معنوی کینگ', '_Toc238572201', '۲۹')
        parent = toc_233.getparent()
        parent.insert(list(parent).index(toc_233) + 1, np)
        print('TOC King')

    n_ar = arabic_to_persian(doc) + arabic_to_persian(fn_root)
    print('arabic', n_ar)

    # styles
    fix_styles(styles)
    in_latin_bib = False
    in_abstract = False
    n = {'h': 0, 'cap': 0, 'bib': 0, 'eng': 0, 'toc': 0}
    for p in list(body.iter(q('p'))):
        st = style_of(p) or ''
        t = ptext(p).strip()
        if st == 'Heading1' and t == 'منابع لاتین':
            in_latin_bib = True
            in_abstract = False
        elif st == 'Heading1' and t == 'ABSTRACT':
            in_latin_bib = False
            in_abstract = True
        elif st == 'Heading1' and t not in ('منابع لاتین', 'ABSTRACT'):
            in_latin_bib = False
            in_abstract = False
        if st.startswith('TOC'):
            apply_para_complex(p, LOTUS)
            n['toc'] += 1
        elif st.startswith('Heading'):
            if t == 'ABSTRACT':
                apply_para_latin(p)
            else:
                apply_para_complex(p, TITR)
                n['h'] += 1
        elif st == 'Caption':
            apply_para_complex(p, LOTUS)
            n['cap'] += 1
        elif st == 'Bibliography' or (in_latin_bib and t and not st.startswith('Heading')):
            set_pstyle(p, 'Bibliography')
            apply_para_latin(p)
            n['bib'] += 1
        elif in_abstract and t:
            set_pstyle(p, 'EnglishText')
            apply_para_latin(p)
            n['eng'] += 1
        else:
            ppr = p.find(q('pPr'))
            if ppr is not None:
                if ppr.find(q('bidi')) is None:
                    setv(ppr, 'bidi', val='1')
                if ppr.find(q('jc')) is None:
                    setv(ppr, 'jc', val='right')
                finish_ppr(ppr)
    print('remap', n)
    A.sep_left(fn_root)

    for fc in body.iter(q('fldChar')):
        if fc.get(q('fldCharType')) == 'begin':
            fc.set(q('dirty'), 'true')
    st = etree.fromstring(parts['word/settings.xml'])
    uf = st.find(q('updateFields'))
    if uf is None:
        uf = etree.SubElement(st, q('updateFields'))
    uf.set(q('val'), 'true')
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

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
