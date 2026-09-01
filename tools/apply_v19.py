# -*- coding: utf-8 -*-
"""
v1.9 — استایل Heading1–6 و Caption واقعاً راست‌چین و Complex؛
Bibliography چپ‌چین و لاتین. ترتیب pPr/rPr مطابق طرح‌وارهٔ OOXML
تا ورد آن‌ها را نیندازد. عنصر w:cs برای Complex Scripts.
"""
import sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W = '{%s}' % NS
def q(t): return W + t
TNR, TITR, LOTUS = 'Times New Roman', 'B Titr', 'B Lotus'

PPR_ORDER = [
    'pStyle', 'keepNext', 'keepLines', 'pageBreakBefore', 'framePr', 'widowControl',
    'numPr', 'suppressLineNumbers', 'pBdr', 'shd', 'tabs', 'suppressAutoHyphens',
    'kinsoku', 'wordWrap', 'overflowPunct', 'topLinePunct', 'autoSpaceDE', 'autoSpaceDN',
    'bidi', 'adjustRightInd', 'snapToGrid', 'spacing', 'ind', 'contextualSpacing',
    'mirrorIndents', 'suppressOverlap', 'jc', 'textDirection', 'textAlignment',
    'textboxTightWrap', 'outlineLvl', 'divId', 'cnfStyle', 'rPr', 'sectPr', 'pPrChange',
]
RPR_ORDER = [
    'rStyle', 'rFonts', 'b', 'bCs', 'i', 'iCs', 'caps', 'smallCaps', 'strike', 'dstrike',
    'outline', 'shadow', 'emboss', 'imprint', 'noProof', 'snapToGrid', 'vanish', 'webHidden',
    'color', 'spacing', 'w', 'kern', 'position', 'sz', 'szCs', 'highlight', 'u', 'effect',
    'bdr', 'shd', 'fitText', 'vertAlign', 'rtl', 'cs', 'em', 'lang', 'eastAsianLayout',
    'specVanish', 'oMath', 'rPrChange',
]


def tagname(el):
    return el.tag.split('}')[-1]


def reorder(parent, order):
    rank = {n: i for i, n in enumerate(order)}
    kids = list(parent)
    kids.sort(key=lambda e: rank.get(tagname(e), 1000))
    for c in list(parent):
        parent.remove(c)
    for c in kids:
        parent.append(c)


def ensure(parent, tag):
    el = parent.find(q(tag))
    if el is None:
        el = etree.SubElement(parent, q(tag))
    return el


def setv(parent, tag, **attrs):
    el = ensure(parent, tag)
    for k, v in attrs.items():
        if v is None:
            if q(k) in el.attrib:
                del el.attrib[q(k)]
        else:
            el.set(q(k), v)
    return el


def style_by_id(styles, sid):
    for s in styles.findall(q('style')):
        if s.get(q('styleId')) == sid:
            return s
    return None


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


def fonts(rpr, ascii=TNR, cs=None):
    rf = ensure(rpr, 'rFonts')
    rf.set(q('ascii'), ascii)
    rf.set(q('hAnsi'), ascii)
    rf.set(q('eastAsia'), ascii)
    if cs:
        rf.set(q('cs'), cs)
    return rf


def make_complex(ppr, rpr, cs_font):
    """راست‌چین + Complex Scripts (bidi/rtl/cs)."""
    bidi = setv(ppr, 'bidi', val='1')
    setv(ppr, 'jc', val='right')
    if rpr is None:
        return
    fonts(rpr, TNR, cs_font)
    rtl = ensure(rpr, 'rtl')
    if q('val') in rtl.attrib:
        del rtl.attrib[q('val')]
    cs = ensure(rpr, 'cs')
    if q('val') in cs.attrib:
        del cs.attrib[q('val')]
    lang = ensure(rpr, 'lang')
    lang.set(q('bidi'), 'fa-IR')
    if q('val') not in lang.attrib:
        lang.set(q('val'), 'en-US')


def make_latin(ppr, rpr):
    """چپ‌چین + لاتین (نه Complex)."""
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


def finish_ppr(ppr):
    rpr = ppr.find(q('rPr'))
    if rpr is not None:
        reorder(rpr, RPR_ORDER)
    reorder(ppr, PPR_ORDER)


def finish_style(s):
    ppr = s.find(q('pPr'))
    rpr = s.find(q('rPr'))
    if rpr is not None:
        reorder(rpr, RPR_ORDER)
    if ppr is not None:
        pr = ppr.find(q('rPr'))
        if pr is not None:
            reorder(pr, RPR_ORDER)
        finish_ppr(ppr)


def apply_runs_complex(p, cs_font):
    for r in p.findall(q('r')):
        rpr = r.find(q('rPr'))
        if rpr is None:
            rpr = etree.Element(q('rPr'))
            r.insert(0, rpr)
        fonts(rpr, TNR, cs_font)
        rtl = ensure(rpr, 'rtl')
        if q('val') in rtl.attrib:
            del rtl.attrib[q('val')]
        cs = ensure(rpr, 'cs')
        if q('val') in cs.attrib:
            del cs.attrib[q('val')]
        lang = ensure(rpr, 'lang')
        lang.set(q('bidi'), 'fa-IR')
        reorder(rpr, RPR_ORDER)


def apply_runs_latin(p):
    for r in p.findall(q('r')):
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


def fix_styles(styles):
    nrm = style_by_id(styles, 'Normal')
    if nrm is not None:
        ppr = nrm.find(q('pPr'))
        if ppr is None:
            ppr = etree.SubElement(nrm, q('pPr'))
        rpr = nrm.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(nrm, q('rPr'))
        make_complex(ppr, rpr, LOTUS)
        finish_style(nrm)

    for i in range(1, 7):
        s = style_by_id(styles, 'Heading%d' % i)
        if s is None:
            continue
        ppr = s.find(q('pPr'))
        if ppr is None:
            ppr = etree.SubElement(s, q('pPr'))
        rpr = s.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(s, q('rPr'))
        make_complex(ppr, rpr, TITR)
        fonts(rpr, TNR, TITR)
        ensure(rpr, 'b')
        ensure(rpr, 'bCs')
        finish_style(s)

    cap = style_by_id(styles, 'Caption')
    if cap is not None:
        ppr = cap.find(q('pPr'))
        if ppr is None:
            ppr = etree.SubElement(cap, q('pPr'))
        rpr = cap.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(cap, q('rPr'))
        make_complex(ppr, rpr, LOTUS)
        ensure(rpr, 'b')
        ensure(rpr, 'bCs')
        finish_style(cap)

    bib = style_by_id(styles, 'Bibliography')
    if bib is not None:
        ppr = bib.find(q('pPr'))
        if ppr is None:
            ppr = etree.SubElement(bib, q('pPr'))
        rpr = bib.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(bib, q('rPr'))
        make_latin(ppr, rpr)
        finish_style(bib)

    # پیش‌فرض سند هم Complex/راست تا استایل‌ها تکی نمانند
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


def remap_body(body):
    n = {'h': 0, 'cap': 0, 'bib': 0}
    in_latin = False
    for p in list(body.iter(q('p'))):
        st = style_of(p) or ''
        t = ptext(p).strip()
        if t == 'منابع لاتین':
            in_latin = True
        elif t == 'ABSTRACT' or (st == 'Heading1' and t and t != 'منابع لاتین'):
            if t != 'منابع لاتین':
                in_latin = False

        if st.startswith('Heading'):
            if t == 'ABSTRACT':
                apply_para_latin(p)
            else:
                apply_para_complex(p, TITR)
                n['h'] += 1
        elif st == 'Caption':
            apply_para_complex(p, LOTUS)
            n['cap'] += 1
        elif st == 'Bibliography' or (in_latin and t and not st.startswith('Heading')):
            set_pstyle(p, 'Bibliography')
            apply_para_latin(p)
            n['bib'] += 1
        else:
            ppr = p.find(q('pPr'))
            if ppr is not None:
                finish_ppr(ppr)
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
        make_latin(ppr, None)
        rpr = ppr.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(ppr, q('rPr'))
        setv(rpr, 'rtl', val='0')
        setv(rpr, 'cs', val='0')
        finish_ppr(ppr)
        n += 1
    return n


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn = etree.fromstring(parts['word/footnotes.xml'])
    styles = etree.fromstring(parts['word/styles.xml'])
    fix_styles(styles)
    counts = remap_body(doc[0])
    counts['sep'] = sep_left(fn)
    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/styles.xml'] = etree.tostring(
        styles, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return counts


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.8.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-Fatemeh-Bayat-v1.9.docx'
    print('نوشته شد:', dst, process(src, dst))
