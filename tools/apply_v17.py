# -*- coding: utf-8 -*-
"""
v1.7 — تراز فارسی، یک استایل برای هر سطح تیتر، عنوان جدول،
علامت پانویس ۱۰pt سوپراسکریپت انگلیسی، جداکنندهٔ چپ، نام انگلیسی استایل.
"""
import copy, re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W = '{%s}' % NS
def q(t): return W + t
TNR = 'Times New Roman'

KEEP = {
    'Normal', 'Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5',
    'TOC1', 'TOC2', 'TOC3', 'TOC4', 'TOC5',
    'FootnoteText', 'FootnoteReference', 'Hyperlink',
    'Caption', 'TableofFigures',
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


def num_level(text):
    t = text.strip()
    t = re.sub(r'[۰-۹0-9]+$', '', t).strip()
    if t.startswith('فصل') or t in ('چکیده', 'ABSTRACT', 'منابع فارسی', 'منابع لاتین'):
        return 1
    m = re.match(r'^([۰-۹0-9]+(?:[-–][۰-۹0-9]+)*)', t)
    if not m:
        return None
    return len(re.split(r'[-–]', m.group(1)))


def style_by_id(styles, sid):
    for s in styles.findall(q('style')):
        if s.get(q('styleId')) == sid:
            return s
    return None


def clone_heading(styles, src_id, new_id, name, outline, sz='28'):
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
    ppr = el.find(q('pPr'))
    if ppr is not None:
        ol = ppr.find(q('outlineLvl'))
        if ol is None:
            ol = etree.SubElement(ppr, q('outlineLvl'))
        ol.set(q('val'), str(outline))
        if ppr.find(q('bidi')) is None:
            etree.SubElement(ppr, q('bidi'))
        jc = ppr.find(q('jc'))
        if jc is None:
            jc = etree.SubElement(ppr, q('jc'))
        jc.set(q('val'), 'right')
    rpr = el.find(q('rPr'))
    if rpr is not None:
        for tag in ('sz', 'szCs'):
            e = rpr.find(q(tag))
            if e is not None:
                e.set(q('val'), sz)
    src.addnext(el)


def clone_toc(styles, src_id, new_id, name, indent):
    if style_by_id(styles, new_id) is not None:
        return
    src = style_by_id(styles, src_id)
    el = copy.deepcopy(src)
    el.set(q('styleId'), new_id)
    nm = el.find(q('name'))
    if nm is not None:
        nm.set(q('val'), name)
    ppr = el.find(q('pPr'))
    if ppr is not None:
        ind = ppr.find(q('ind'))
        if ind is None:
            ind = etree.SubElement(ppr, q('ind'))
        ind.set(q('left'), str(indent))
        if ppr.find(q('bidi')) is None:
            etree.SubElement(ppr, q('bidi'))
        jc = ppr.find(q('jc'))
        if jc is None:
            jc = etree.SubElement(ppr, q('jc'))
        jc.set(q('val'), 'right')
    src.addnext(el)


def remap_levels(body):
    n = 0
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        t = ptext(p).strip()
        if st.startswith('Heading'):
            lv = num_level(t)
            if lv and lv >= 2:
                want = 'Heading%d' % min(lv, 5)
                if st != want:
                    set_pstyle(p, want)
                    n += 1
            # تراز نمونه
            ppr = p.find(q('pPr'))
            if ppr is not None:
                if ppr.find(q('bidi')) is None:
                    etree.SubElement(ppr, q('bidi'))
                if t != 'ABSTRACT':
                    jc = ppr.find(q('jc'))
                    if jc is None:
                        jc = etree.SubElement(ppr, q('jc'))
                    if st == 'Heading1' or (num_level(t) == 1):
                        jc.set(q('val'), 'center')
                    else:
                        jc.set(q('val'), 'right')
        elif st.startswith('TOC'):
            lv = num_level(t)
            if lv:
                want = 'TOC%d' % min(lv, 5)
                if st != want:
                    set_pstyle(p, want)
                    n += 1
            ppr = p.find(q('pPr'))
            if ppr is not None:
                if ppr.find(q('bidi')) is None:
                    etree.SubElement(ppr, q('bidi'))
                jc = ppr.find(q('jc'))
                if jc is None:
                    jc = etree.SubElement(ppr, q('jc'))
                jc.set(q('val'), 'right')
        elif st == 'Caption':
            ppr = p.find(q('pPr'))
            if ppr is not None:
                if ppr.find(q('bidi')) is None:
                    etree.SubElement(ppr, q('bidi'))
                jc = ppr.find(q('jc'))
                if jc is None:
                    jc = etree.SubElement(ppr, q('jc'))
                jc.set(q('val'), 'right')
    return n


def persian_style_align(styles):
    """استایل با قلم فارسی (B Lotus / B Titr) راست‌چین؛ Heading1 وسط (عنوان فصل)."""
    for s in styles.findall(q('style')):
        sid = s.get(q('styleId'))
        rpr = s.find(q('rPr'))
        cs = None
        if rpr is not None and rpr.find(q('rFonts')) is not None:
            cs = rpr.find(q('rFonts')).get(q('cs')) or ''
        if cs not in ('B Lotus', 'B Titr', 'B Nazanin', 'B Traffic'):
            continue
        ppr = s.find(q('pPr'))
        if ppr is None:
            if s.get(q('type')) != 'paragraph':
                continue
            ppr = etree.SubElement(s, q('pPr'))
        if ppr.find(q('bidi')) is None:
            etree.SubElement(ppr, q('bidi'))
        jc = ppr.find(q('jc'))
        if jc is None:
            jc = etree.SubElement(ppr, q('jc'))
        if sid == 'Heading1':
            jc.set(q('val'), 'center')
        else:
            jc.set(q('val'), 'right')


def fix_fn_marks(doc, styles):
    st = style_by_id(styles, 'FootnoteReference')
    if st is not None:
        rpr = st.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(st, q('rPr'))
        for tag in ('b', 'bCs'):
            e = rpr.find(q(tag))
            if e is not None:
                rpr.remove(e)
        rf = rpr.find(q('rFonts'))
        if rf is None:
            rf = etree.Element(q('rFonts'))
            rpr.insert(0, rf)
        for a in ('ascii', 'hAnsi', 'eastAsia', 'cs'):
            rf.set(q(a), TNR)
        for tag, val in (('sz', '20'), ('szCs', '20')):
            e = rpr.find(q(tag))
            if e is None:
                e = etree.SubElement(rpr, q(tag))
            e.set(q('val'), val)
        va = rpr.find(q('vertAlign'))
        if va is None:
            va = etree.SubElement(rpr, q('vertAlign'))
        va.set(q('val'), 'superscript')
    n = 0
    for r in doc.iter(q('r')):
        if r.find(q('footnoteReference')) is None:
            continue
        rpr = r.find(q('rPr'))
        if rpr is None:
            rpr = etree.Element(q('rPr'))
            r.insert(0, rpr)
        rs = rpr.find(q('rStyle'))
        if rs is None:
            rs = etree.Element(q('rStyle'))
            rpr.insert(0, rs)
        rs.set(q('val'), 'FootnoteReference')
        rf = rpr.find(q('rFonts'))
        if rf is None:
            rf = etree.Element(q('rFonts'))
            rpr.insert(0, rf)
        for a in ('ascii', 'hAnsi', 'eastAsia', 'cs'):
            rf.set(q(a), TNR)
        for tag, val in (('sz', '20'), ('szCs', '20')):
            e = rpr.find(q(tag))
            if e is None:
                e = etree.SubElement(rpr, q(tag))
            e.set(q('val'), val)
        va = rpr.find(q('vertAlign'))
        if va is None:
            va = etree.SubElement(rpr, q('vertAlign'))
        va.set(q('val'), 'superscript')
        for tag in ('b', 'bCs'):
            e = rpr.find(q(tag))
            if e is not None:
                rpr.remove(e)
        lang = rpr.find(q('lang'))
        if lang is None:
            lang = etree.SubElement(rpr, q('lang'))
        lang.set(q('val'), 'en-US')
        rtl = rpr.find(q('rtl'))
        if rtl is None:
            rtl = etree.SubElement(rpr, q('rtl'))
        rtl.set(q('val'), '0')
        n += 1
    return n


def sep_left(fn_root):
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
        jc = ppr.find(q('jc'))
        if jc is None:
            jc = etree.SubElement(ppr, q('jc'))
        jc.set(q('val'), 'left')
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
    clone_heading(styles, 'Heading4', 'Heading5', 'heading 5', 4, '28')
    clone_toc(styles, 'TOC4', 'TOC5', 'toc 5', 880)
    persian_style_align(styles)
    # Normal راست‌چین
    nrm = style_by_id(styles, 'Normal')
    if nrm is not None:
        ppr = nrm.find(q('pPr'))
        if ppr is not None:
            jc = ppr.find(q('jc'))
            if jc is None:
                jc = etree.SubElement(ppr, q('jc'))
            jc.set(q('val'), 'right')
    rep = {}
    rep['levels'] = remap_levels(doc[0])
    rep['fnmark'] = fix_fn_marks(doc, styles)
    rep['sep'] = sep_left(fn)
    used = set()
    for e in list(doc.iter(q('pStyle'), q('rStyle'))) + list(fn.iter(q('pStyle'), q('rStyle'))):
        used.add(e.get(q('val')))
    for name in ('word/footer1.xml', 'word/footer2.xml', 'word/footer3.xml'):
        if name in parts:
            r = etree.fromstring(parts[name])
            for e in r.iter(q('pStyle'), q('rStyle')):
                used.add(e.get(q('val')))
    rep['styles_removed'] = english_names_and_prune(styles, used)
    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/styles.xml'] = etree.tostring(
        styles, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return rep


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.6.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-Fatemeh-Bayat-v1.7.docx'
    print('نوشته شد:', dst, process(src, dst))
