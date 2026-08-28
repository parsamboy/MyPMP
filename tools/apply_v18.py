# -*- coding: utf-8 -*-
"""
v1.8 — Heading1–6 راست‌چین و Complex، عنوان جدول همین‌طور،
منابع انگلیسی چپ‌چین و لاتین، جداکنندهٔ پانویس چپ و LTR.
"""
import copy, re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W = '{%s}' % NS
def q(t): return W + t
TNR = 'Times New Roman'
TITR = 'B Titr'
LOTUS = 'B Lotus'

KEEP = {
    'Normal', 'Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5', 'Heading6',
    'TOC1', 'TOC2', 'TOC3', 'TOC4', 'TOC5',
    'FootnoteText', 'FootnoteReference', 'Hyperlink',
    'Caption', 'TableofFigures', 'Bibliography',
    'DefaultParagraphFont', 'TableNormal', 'NoList',
    'Header', 'Footer', 'PageNumber',
}


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def set_pstyle(p, sid):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    ps = ppr.find(q('pStyle'))
    if ps is None:
        ps = etree.Element(q('pStyle'))
        ppr.insert(0, ps)
    ps.set(q('val'), sid)
    return ppr


def ensure_ppr(el):
    ppr = el.find(q('pPr'))
    if ppr is None:
        ppr = etree.SubElement(el, q('pPr'))
    return ppr


def ensure_rpr(el):
    rpr = el.find(q('rPr'))
    if rpr is None:
        rpr = etree.SubElement(el, q('rPr'))
    return rpr


def set_child(parent, tag, **attrs):
    el = parent.find(q(tag))
    if el is None:
        el = etree.SubElement(parent, q(tag))
    for k, v in attrs.items():
        if v is None:
            if q(k) in el.attrib:
                del el.attrib[q(k)]
        else:
            el.set(q(k), v)
    return el


def remove_child(parent, tag):
    el = parent.find(q(tag))
    if el is not None:
        parent.remove(el)


def style_by_id(styles, sid):
    for s in styles.findall(q('style')):
        if s.get(q('styleId')) == sid:
            return s
    return None


def make_complex_right(ppr, rpr=None, cs_font=TITR):
    """راست‌چین + Complex (bidi/rtl/قلم پیچیده)."""
    bidi = ppr.find(q('bidi'))
    if bidi is None:
        bidi = etree.SubElement(ppr, q('bidi'))
    if q('val') in bidi.attrib:
        del bidi.attrib[q('val')]
    set_child(ppr, 'jc', val='right')
    if rpr is not None:
        rf = rpr.find(q('rFonts'))
        if rf is None:
            rf = etree.Element(q('rFonts'))
            rpr.insert(0, rf)
        if not rf.get(q('ascii')):
            rf.set(q('ascii'), TNR)
        if not rf.get(q('hAnsi')):
            rf.set(q('hAnsi'), TNR)
        if not rf.get(q('eastAsia')):
            rf.set(q('eastAsia'), TNR)
        rf.set(q('cs'), cs_font)
        rtl = rpr.find(q('rtl'))
        if rtl is None:
            rtl = etree.SubElement(rpr, q('rtl'))
        if q('val') in rtl.attrib:
            del rtl.attrib[q('val')]
        lang = rpr.find(q('lang'))
        if lang is None:
            lang = etree.SubElement(rpr, q('lang'))
        lang.set(q('bidi'), 'fa-IR')


def make_latin_left(ppr, rpr=None):
    """چپ‌چین + لاتین (نه Complex)."""
    set_child(ppr, 'bidi', val='0')
    set_child(ppr, 'jc', val='left')
    if rpr is not None:
        rf = rpr.find(q('rFonts'))
        if rf is None:
            rf = etree.Element(q('rFonts'))
            rpr.insert(0, rf)
        for a in ('ascii', 'hAnsi', 'eastAsia', 'cs'):
            rf.set(q(a), TNR)
        set_child(rpr, 'rtl', val='0')
        lang = rpr.find(q('lang'))
        if lang is None:
            lang = etree.SubElement(rpr, q('lang'))
        lang.set(q('val'), 'en-US')
        if q('bidi') in lang.attrib:
            del lang.attrib[q('bidi')]


def clone_heading(styles, src_id, new_id, name, outline, sz):
    if style_by_id(styles, new_id) is not None:
        return
    src = style_by_id(styles, src_id)
    el = copy.deepcopy(src)
    el.set(q('styleId'), new_id)
    nm = el.find(q('name'))
    if nm is not None:
        nm.set(q('val'), name)
    al = el.find(q('aliases'))
    if al is not None:
        el.remove(al)
    ln = el.find(q('link'))
    if ln is not None:
        el.remove(ln)
    ppr = ensure_ppr(el)
    set_child(ppr, 'outlineLvl', val=str(outline))
    rpr = ensure_rpr(el)
    for tag in ('sz', 'szCs'):
        set_child(rpr, tag, val=sz)
    src.addnext(el)


def add_bibliography_style(styles):
    if style_by_id(styles, 'Bibliography') is not None:
        return
    nrm = style_by_id(styles, 'Normal')
    el = etree.Element(q('style'))
    el.set(q('type'), 'paragraph')
    el.set(q('styleId'), 'Bibliography')
    nm = etree.SubElement(el, q('name'))
    nm.set(q('val'), 'bibliography')
    bo = etree.SubElement(el, q('basedOn'))
    bo.set(q('val'), 'Normal')
    nx = etree.SubElement(el, q('next'))
    nx.set(q('val'), 'Bibliography')
    etree.SubElement(el, q('qFormat'))
    ppr = etree.SubElement(el, q('pPr'))
    rpr = etree.SubElement(el, q('rPr'))
    # فاصله نزدیک به منابع فعلی
    set_child(ppr, 'spacing', after='80', line='276', lineRule='auto')
    make_latin_left(ppr, rpr)
    set_child(rpr, 'sz', val='24')
    set_child(rpr, 'szCs', val='24')
    set_child(rpr, 'color', val='000000')
    nrm.addnext(el)


def fix_heading_and_caption_styles(styles):
    for i in range(1, 7):
        s = style_by_id(styles, 'Heading%d' % i)
        if s is None:
            continue
        ppr = ensure_ppr(s)
        rpr = ensure_rpr(s)
        make_complex_right(ppr, rpr, TITR)
        # قلم پیچیده و لاتین صریح
        rf = rpr.find(q('rFonts'))
        rf.set(q('ascii'), TNR)
        rf.set(q('hAnsi'), TNR)
        rf.set(q('eastAsia'), TNR)
        rf.set(q('cs'), TITR)
        if rpr.find(q('bCs')) is None:
            etree.SubElement(rpr, q('bCs'))
        lang = rpr.find(q('lang'))
        if lang is None:
            lang = etree.SubElement(rpr, q('lang'))
        lang.set(q('bidi'), 'fa-IR')
    cap = style_by_id(styles, 'Caption')
    if cap is not None:
        ppr = ensure_ppr(cap)
        rpr = ensure_rpr(cap)
        make_complex_right(ppr, rpr, LOTUS)
        rf = rpr.find(q('rFonts'))
        rf.set(q('ascii'), TNR)
        rf.set(q('hAnsi'), TNR)
        rf.set(q('eastAsia'), TNR)
        rf.set(q('cs'), LOTUS)
        if rpr.find(q('bCs')) is None:
            etree.SubElement(rpr, q('bCs'))
        lang = rpr.find(q('lang'))
        if lang is None:
            lang = etree.SubElement(rpr, q('lang'))
        lang.set(q('bidi'), 'fa-IR')


def apply_complex_right_p(p, cs_font):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    rpr = ppr.find(q('rPr'))
    if rpr is None:
        rpr = etree.SubElement(ppr, q('rPr'))
    make_complex_right(ppr, rpr, cs_font)
    # ران‌ها هم Complex
    for r in p.findall(q('r')):
        rr = r.find(q('rPr'))
        if rr is None:
            rr = etree.Element(q('rPr'))
            r.insert(0, rr)
        rf = rr.find(q('rFonts'))
        if rf is None:
            rf = etree.Element(q('rFonts'))
            rr.insert(0, rf)
        rf.set(q('cs'), cs_font)
        rtl = rr.find(q('rtl'))
        if rtl is None:
            rtl = etree.SubElement(rr, q('rtl'))
        if q('val') in rtl.attrib:
            del rtl.attrib[q('val')]
        lang = rr.find(q('lang'))
        if lang is None:
            lang = etree.SubElement(rr, q('lang'))
        lang.set(q('bidi'), 'fa-IR')


def apply_latin_left_p(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    rpr = ppr.find(q('rPr'))
    if rpr is None:
        rpr = etree.SubElement(ppr, q('rPr'))
    make_latin_left(ppr, rpr)
    for r in p.findall(q('r')):
        rr = r.find(q('rPr'))
        if rr is None:
            rr = etree.Element(q('rPr'))
            r.insert(0, rr)
        rf = rr.find(q('rFonts'))
        if rf is None:
            rf = etree.Element(q('rFonts'))
            rr.insert(0, rf)
        for a in ('ascii', 'hAnsi', 'eastAsia', 'cs'):
            rf.set(q(a), TNR)
        set_child(rr, 'rtl', val='0')
        lang = rr.find(q('lang'))
        if lang is None:
            lang = etree.SubElement(rr, q('lang'))
        lang.set(q('val'), 'en-US')
        if q('bidi') in lang.attrib:
            del lang.attrib[q('bidi')]
        # هایپرلینک داخل منابع لاتین بماند


def remap_body(body):
    n_h = n_cap = n_bib = 0
    in_latin = False
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        t = ptext(p).strip()
        if t == 'منابع لاتین':
            in_latin = True
        elif t == 'ABSTRACT' or (st == 'Heading1' and t and t != 'منابع لاتین'):
            if t != 'منابع لاتین':
                in_latin = False

        if st.startswith('Heading'):
            if t == 'ABSTRACT':
                apply_latin_left_p(p)
            else:
                apply_complex_right_p(p, TITR)
                n_h += 1
        elif st == 'Caption':
            apply_complex_right_p(p, LOTUS)
            n_cap += 1
        elif in_latin and t and st not in (
                'Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5', 'Heading6'):
            set_pstyle(p, 'Bibliography')
            apply_latin_left_p(p)
            n_bib += 1
    return n_h, n_cap, n_bib


def sep_left(fn_root):
    """جداکننده چپ‌چین و لاتین/LTR تا در سند راست‌به‌چپ به راست نرود."""
    n = 0
    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')) not in ('separator', 'continuationSeparator'):
            continue
        p = f.find(q('p'))
        if p is None:
            continue
        ppr = p.find(q('pPr'))
        if ppr is None:
            ppr = etree.Element(q('pPr'))
            p.insert(0, ppr)
        set_child(ppr, 'bidi', val='0')
        set_child(ppr, 'jc', val='left')
        rpr = ppr.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(ppr, q('rPr'))
        set_child(rpr, 'rtl', val='0')
        n += 1
    return n


def english_names_and_prune(styles, used):
    keep = set(KEEP) | set(used)
    removed = 0
    for s in list(styles.findall(q('style'))):
        sid = s.get(q('styleId'))
        al = s.find(q('aliases'))
        if al is not None:
            s.remove(al)
        ln = s.find(q('link'))
        if ln is not None and ln.get(q('val')) not in keep:
            s.remove(ln)
        nm = s.find(q('name'))
        if nm is not None:
            name = nm.get(q('val')) or ''
            if re.search(r'[\u0600-\u06FF]', name):
                nm.set(q('val'), sid)
        if sid not in keep:
            styles.remove(s)
            removed += 1
            continue
        for tag in ('basedOn', 'next'):
            el = s.find(q(tag))
            if el is not None and el.get(q('val')) not in keep:
                if tag == 'basedOn':
                    el.set(q('val'), 'Normal' if s.get(q('type')) == 'paragraph' else 'DefaultParagraphFont')
                else:
                    s.remove(el)
    return removed


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn = etree.fromstring(parts['word/footnotes.xml'])
    styles = etree.fromstring(parts['word/styles.xml'])
    clone_heading(styles, 'Heading5', 'Heading6', 'heading 6', 5, '26')
    add_bibliography_style(styles)
    fix_heading_and_caption_styles(styles)
    n_h, n_cap, n_bib = remap_body(doc[0])
    n_sep = sep_left(fn)
    used = set()
    for e in list(doc.iter(q('pStyle'), q('rStyle'))) + list(fn.iter(q('pStyle'), q('rStyle'))):
        used.add(e.get(q('val')))
    for name in ('word/footer1.xml', 'word/footer2.xml', 'word/footer3.xml'):
        if name in parts:
            r = etree.fromstring(parts[name])
            for e in r.iter(q('pStyle'), q('rStyle')):
                used.add(e.get(q('val')))
    removed = english_names_and_prune(styles, used)
    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/styles.xml'] = etree.tostring(
        styles, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return {'headings': n_h, 'captions': n_cap, 'bib': n_bib, 'sep': n_sep, 'styles_removed': removed}


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.7.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-Fatemeh-Bayat-v1.8.docx'
    print('نوشته شد:', dst, process(src, dst))
