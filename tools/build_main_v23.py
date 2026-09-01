# -*- coding: utf-8 -*-
"""v2.3: پانویس، فهرست سرتیترهای جدید، استایل فارسی Complex و استایل English Text."""
import copy
import os
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import apply_v19 as A
from apply_v19 import W, q, ptext, style_of, set_pstyle, ensure, setv, fonts
from apply_v19 import TNR, TITR, LOTUS, finish_style, finish_ppr, reorder, RPR_ORDER
from build_main_v21 import clone_footnote

SRC = 'Payannameh-Fatemeh-Bayat-v2.2.docx'
DST = 'Payannameh-Fatemeh-Bayat-v2.3.docx'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
AR_FA = str.maketrans({'ي': 'ی', 'ك': 'ک'})


def make_complex(ppr, rpr, cs_font):
    """راست‌چین + Complex با val=1 تا در ورد دیده شود."""
    setv(ppr, 'bidi', val='1')
    setv(ppr, 'jc', val='right')
    if rpr is None:
        return
    fonts(rpr, TNR, cs_font)
    setv(rpr, 'rtl', val='1')
    setv(rpr, 'cs', val='1')
    lang = ensure(rpr, 'lang')
    lang.set(q('bidi'), 'fa-IR')
    if q('val') not in lang.attrib:
        lang.set(q('val'), 'en-US')


def make_latin(ppr, rpr):
    setv(ppr, 'bidi', val='0')
    setv(ppr, 'jc', val='left')
    if rpr is None:
        return
    fonts(rpr, TNR, TNR)
    setv(rpr, 'rtl', val='0')
    setv(rpr, 'cs', val='0')
    lang = ensure(rpr, 'lang')
    lang.set(q('val'), 'en-US')
    if q('bidi') in lang.attrib:
        del lang.attrib[q('bidi')]


def apply_runs_complex(p, cs_font):
    for r in p.findall(q('r')):
        if r.find(q('footnoteReference')) is not None:
            continue
        rpr = r.find(q('rPr'))
        if rpr is None:
            rpr = etree.Element(q('rPr'))
            r.insert(0, rpr)
        fonts(rpr, TNR, cs_font)
        setv(rpr, 'rtl', val='1')
        setv(rpr, 'cs', val='1')
        lang = ensure(rpr, 'lang')
        lang.set(q('bidi'), 'fa-IR')
        reorder(rpr, RPR_ORDER)


def apply_runs_latin(p):
    for r in p.findall(q('r')):
        if r.find(q('footnoteReference')) is not None:
            continue
        rpr = r.find(q('rPr'))
        if rpr is None:
            rpr = etree.Element(q('rPr'))
            r.insert(0, rpr)
        fonts(rpr, TNR, TNR)
        setv(rpr, 'rtl', val='0')
        setv(rpr, 'cs', val='0')
        lang = ensure(rpr, 'lang')
        lang.set(q('val'), 'en-US')
        if q('bidi') in lang.attrib:
            del lang.attrib[q('bidi')]
        reorder(rpr, RPR_ORDER)


def apply_para_complex(p, cs_font):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    rpr = ppr.find(q('rPr'))
    if rpr is None:
        rpr = etree.SubElement(ppr, q('rPr'))
    make_complex(ppr, rpr, cs_font)
    finish_ppr(ppr)
    apply_runs_complex(p, cs_font)


def apply_para_latin(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    rpr = ppr.find(q('rPr'))
    if rpr is None:
        rpr = etree.SubElement(ppr, q('rPr'))
    make_latin(ppr, rpr)
    finish_ppr(ppr)
    apply_runs_latin(p)


def style_by_id(styles, sid):
    for s in styles.findall(q('style')):
        if s.get(q('styleId')) == sid:
            return s
    return None


def add_english_style(styles):
    if style_by_id(styles, 'EnglishText') is not None:
        return
    bib = style_by_id(styles, 'Bibliography')
    s = etree.Element(q('style'))
    s.set(q('type'), 'paragraph')
    s.set(q('styleId'), 'EnglishText')
    nm = etree.SubElement(s, q('name'))
    nm.set(q('val'), 'English Text')
    based = etree.SubElement(s, q('basedOn'))
    based.set(q('val'), 'Normal')
    nxt = etree.SubElement(s, q('next'))
    nxt.set(q('val'), 'EnglishText')
    etree.SubElement(s, q('qFormat'))
    ppr = etree.SubElement(s, q('pPr'))
    rpr = etree.SubElement(s, q('rPr'))
    make_latin(ppr, rpr)
    setv(rpr, 'sz', val='24')
    setv(rpr, 'szCs', val='24')
    finish_style(s)
    # insert after Bibliography
    parent = styles
    if bib is not None:
        idx = list(parent).index(bib) + 1
        parent.insert(idx, s)
    else:
        parent.append(s)
    ls = styles.find(q('latentStyles'))
    if ls is not None:
        ex = etree.SubElement(ls, q('lsdException'))
        ex.set(q('name'), 'English Text')
        ex.set(q('qFormat'), '1')
        ex.set(q('uiPriority'), '99')
        cnt = int(ls.get(q('count') or '0') or 0)
        ls.set(q('count'), str(cnt + 1))
    print('added EnglishText')


def fix_styles(styles):
    nrm = style_by_id(styles, 'Normal')
    if nrm is not None:
        ppr = nrm.find(q('pPr')) or etree.SubElement(nrm, q('pPr'))
        rpr = nrm.find(q('rPr')) or etree.SubElement(nrm, q('rPr'))
        make_complex(ppr, rpr, LOTUS)
        finish_style(nrm)
    for i in range(1, 7):
        s = style_by_id(styles, 'Heading%d' % i)
        if s is None:
            continue
        ppr = s.find(q('pPr')) or etree.SubElement(s, q('pPr'))
        rpr = s.find(q('rPr')) or etree.SubElement(s, q('rPr'))
        make_complex(ppr, rpr, TITR)
        fonts(rpr, TNR, TITR)
        ensure(rpr, 'b')
        ensure(rpr, 'bCs')
        finish_style(s)
    for sid, csf, extra_b in (
        ('Caption', LOTUS, True),
        ('TOC1', LOTUS, True),
        ('TOC2', LOTUS, False),
        ('TOC3', LOTUS, False),
        ('TOC4', LOTUS, False),
        ('TOC5', LOTUS, False),
        ('TableofFigures', LOTUS, False),
        ('Header', LOTUS, False),
    ):
        s = style_by_id(styles, sid)
        if s is None:
            continue
        ppr = s.find(q('pPr')) or etree.SubElement(s, q('pPr'))
        rpr = s.find(q('rPr')) or etree.SubElement(s, q('rPr'))
        make_complex(ppr, rpr, csf)
        if extra_b:
            ensure(rpr, 'b')
            ensure(rpr, 'bCs')
        finish_style(s)
    bib = style_by_id(styles, 'Bibliography')
    if bib is not None:
        ppr = bib.find(q('pPr')) or etree.SubElement(bib, q('pPr'))
        rpr = bib.find(q('rPr')) or etree.SubElement(bib, q('rPr'))
        make_latin(ppr, rpr)
        finish_style(bib)
    add_english_style(styles)
    eng = style_by_id(styles, 'EnglishText')
    if eng is not None:
        finish_style(eng)
    dd = styles.find(q('docDefaults'))
    if dd is not None:
        pdef = dd.find(q('pPrDefault'))
        if pdef is None:
            pdef = etree.SubElement(dd, q('pPrDefault'))
        ppr = pdef.find(q('pPr'))
        if ppr is None:
            ppr = etree.SubElement(pdef, q('pPr'))
        make_complex(ppr, None, LOTUS)
        finish_ppr(ppr)
        rdef = dd.find(q('rPrDefault'))
        if rdef is not None:
            rpr = rdef.find(q('rPr'))
            if rpr is not None:
                fonts(rpr, TNR, LOTUS)
                lang = ensure(rpr, 'lang')
                lang.set(q('bidi'), 'fa-IR')
                setv(rpr, 'rtl', val='1')
                setv(rpr, 'cs', val='1')
                reorder(rpr, RPR_ORDER)


def clear_bookmarks(p):
    for tag in ('bookmarkStart', 'bookmarkEnd'):
        for b in list(p.iter(q(tag))):
            b.getparent().remove(b)


def add_bookmark(p, name, bid):
    clear_bookmarks(p)
    start = etree.Element(q('bookmarkStart'))
    start.set(q('id'), str(bid))
    start.set(q('name'), name)
    end = etree.Element(q('bookmarkEnd'))
    end.set(q('id'), str(bid))
    ppr = p.find(q('pPr'))
    idx = 1 if ppr is not None else 0
    p.insert(idx, start)
    p.append(end)


def last_heading(body, start):
    found = None
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if st.startswith('Heading') and ptext(p).startswith(start):
            found = p
    return found


def last_toc(body, contains):
    found = None
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if st.startswith('TOC') and contains in ptext(p):
            found = p
    return found


def retarget_toc(p, new_text, anchor, page):
    """Clone-ready TOC para: rewrite visible text, PAGEREF and page."""
    for t in p.iter(q('t')):
        if t.text and any(c.isdigit() or c in '۰۱۲۳۴۵۶۷۸۹' for c in t.text) and len(t.text) <= 4 and '۲-' not in t.text and 'فصل' not in (t.text or ''):
            # page number run
            if t.text.strip().isdigit() or all(c in '۰۱۲۳۴۵۶۷۸۹' for c in t.text.strip()):
                t.text = page
                continue
        if t.text and t.text.strip()[:1] in '۱۲۳۴۵۶۷۸۹۰۱۲۳':
            t.text = new_text
    for h in p.findall(q('hyperlink')):
        h.set(q('anchor'), anchor)
    for it in p.iter(q('instrText')):
        if it.text and 'PAGEREF' in it.text:
            it.text = ' PAGEREF %s \\h ' % anchor
    for attr in list(p.attrib):
        if attr.endswith('paraId') or attr.endswith('textId'):
            del p.attrib[attr]


def arabic_to_persian(root):
    n = 0
    for t in root.iter(q('t')):
        if not t.text:
            continue
        # skip URLs
        if 'http' in t.text or 'doi.org' in t.text:
            continue
        nw = t.text.translate(AR_FA)
        if nw != t.text:
            t.text = nw
            n += 1
    return n


def orig_fn_ref_rpr(doc):
    for r in doc.iter(q('r')):
        fr = r.find(q('footnoteReference'))
        if fr is not None and fr.get(q('id')) == '5' and r.find(q('rPr')) is not None:
            return r.find(q('rPr'))
    return None


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    styles = etree.fromstring(parts['word/styles.xml'])
    body = doc[0]

    # --- styles ---
    fix_styles(styles)

    # --- unique bookmarks for new headings ---
    sst_h = last_heading(body, '۲-۱-۲-۲-۴-')
    king_h = last_heading(body, '۲-۳-۴- مدل چهارعاملی')
    if sst_h is None or king_h is None:
        print('MISS headings', sst_h, king_h)
    add_bookmark(sst_h, '_Toc238572200', 5002)
    add_bookmark(king_h, '_Toc238572201', 5003)
    print('bookmarks SST/King')

    # --- TOC entries ---
    toc_erik = last_toc(body, '۲-۱-۲-۲-۳- نظریه اریکسون')
    toc_233 = last_toc(body, '۲-۳-۳-')
    if toc_erik is not None:
        np = copy.deepcopy(toc_erik)
        retarget_toc(np, '۲-۱-۲-۲-۴- نظریه انتخاب اجتماعی-هیجانی', '_Toc238572200', '۱۸')
        parent = toc_erik.getparent()
        parent.insert(list(parent).index(toc_erik) + 1, np)
        print('TOC SST')
    if toc_233 is not None:
        # fix Arabic/hamza in existing 2-3-3 label
        for t in toc_233.iter(q('t')):
            if t.text and 'موثر' in t.text:
                t.text = t.text.replace('موثر', 'مؤثر')
        np = copy.deepcopy(toc_233)
        retarget_toc(np, '۲-۳-۴- مدل چهارعاملی هوش معنوی کینگ', '_Toc238572201', '۲۹')
        parent = toc_233.getparent()
        parent.insert(list(parent).index(toc_233) + 1, np)
        print('TOC King + 2-3-3 مؤثر')

    # --- King-only footnote on کینگ (not King & DeCicco) ---
    tmpl = None
    for f in fn_root.findall(q('footnote')):
        if f.get(q('id')) == '5':
            tmpl = f
            break
    fn_ids = [int(f.get(q('id'))) for f in fn_root.findall(q('footnote'))
              if f.get(q('id')) and not f.get(q('type'))]
    king_only = max(fn_ids) + 1
    fn_root.append(clone_footnote(tmpl, king_only, 'King'))
    # replace id=42 only in the new King body / summary that cite کینگ alone
    for p in body.iter(q('p')):
        t = ptext(p)
        if t.startswith('کینگ هوش معنوی را') or t.startswith('در مجموع، پیشینه داخلی'):
            for r in p.iter(q('r')):
                fr = r.find(q('footnoteReference'))
                if fr is not None and fr.get(q('id')) == '42':
                    fr.set(q('id'), str(king_only))
                    print('King fn ->', king_only, t[:40])

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

    # --- arabic yeh/kaf ---
    n_ar = arabic_to_persian(doc)
    n_ar += arabic_to_persian(fn_root)
    print('arabic->persian runs', n_ar)

    # --- remap paragraph styles ---
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
                # Persian body: bidi/jc on pPr, don't rewrite mixed runs
                if ppr.find(q('bidi')) is None:
                    setv(ppr, 'bidi', val='1')
                if ppr.find(q('jc')) is None:
                    setv(ppr, 'jc', val='right')
                finish_ppr(ppr)

    print('remap', n)

    # footnote separator LTR
    A.make_latin = make_latin  # use val=0 variants
    nsep = A.sep_left(fn_root)
    print('sep', nsep)

    # dirty TOC pageref fields
    ndirty = 0
    for fc in body.iter(q('fldChar')):
        if fc.get(q('fldCharType')) == 'begin':
            fc.set(q('dirty'), 'true')
            ndirty += 1
    st = etree.fromstring(parts['word/settings.xml'])
    uf = st.find(q('updateFields'))
    if uf is None:
        uf = etree.SubElement(st, q('updateFields'))
    uf.set(q('val'), 'true')
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)
    print('dirty fields', ndirty)

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
