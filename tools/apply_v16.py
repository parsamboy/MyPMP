# -*- coding: utf-8 -*-
"""
v1.6 — زیباسازی جدول‌ها، فهرست جداول، تراز فارسی، جداکنندهٔ کوتاه پانویس، حاشیه.
"""
import sys, zipfile, re
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W = '{%s}' % NS
def q(t): return W + t

FA_RE = re.compile(r'[آ-ی]')
BORDER = {'val': 'single', 'sz': '8', 'space': '0', 'color': '000000'}
HEADER_FILL = 'E2EFD9'  # سبز خیلی روشن، یکدست برای همهٔ جدول‌ها


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def cellt(c):
    return ''.join(t.text or '' for t in c.iter(q('t')))


def ensure(parent, tag, after=None):
    e = parent.find(q(tag))
    if e is None:
        e = etree.Element(q(tag))
        if after is None:
            parent.append(e)
        else:
            after.addnext(e)
    return e


def set_border_el(parent, tag):
    e = parent.find(q(tag))
    if e is None:
        e = etree.SubElement(parent, q(tag))
    for k, v in BORDER.items():
        e.set(q(k), v)
    return e


def beautify_tables(body):
    n = 0
    for tbl in [e for e in body if e.tag == q('tbl')]:
        tpr = ensure(tbl, 'tblPr')
        # فیت پنجره + محتوا
        tw = ensure(tpr, 'tblW')
        tw.set(q('w'), '5000')
        tw.set(q('type'), 'pct')
        lay = tpr.find(q('tblLayout'))
        if lay is not None:
            tpr.remove(lay)
        lay = etree.SubElement(tpr, q('tblLayout'))
        lay.set(q('type'), 'autofit')
        if tpr.find(q('bidiVisual')) is None:
            tpr.insert(0, etree.Element(q('bidiVisual')))
        jc = ensure(tpr, 'jc')
        jc.set(q('val'), 'center')
        bdr = ensure(tpr, 'tblBorders')
        for side in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
            set_border_el(bdr, side)

        rows = tbl.findall(q('tr'))
        is_diag_table = False
        if rows:
            c0 = cellt(rows[0].findall(q('tc'))[0]) if rows[0].findall(q('tc')) else ''
            if 'متغیر' in c0 and 'شاخص' in c0:
                is_diag_table = True

        for ri, tr in enumerate(rows):
            trpr = ensure(tr, 'trPr')
            # ارتفاع ثابت را بردار تا جدول در یک صفحه جا شود
            for th in trpr.findall(q('trHeight')):
                trpr.remove(th)
            if trpr.find(q('cantSplit')) is None:
                etree.SubElement(trpr, q('cantSplit'))
            if ri == 0 and trpr.find(q('tblHeader')) is None:
                etree.SubElement(trpr, q('tblHeader'))
            tcs = tr.findall(q('tc'))
            for ci, tc in enumerate(tcs):
                tcpr = ensure(tc, 'tcPr')
                # مرز سلول را به ارث از جدول بسپار (خطوط یکدست)
                oldb = tcpr.find(q('tcBorders'))
                if oldb is not None:
                    tcpr.remove(oldb)
                va = ensure(tcpr, 'vAlign')
                va.set(q('val'), 'center')
                if ri == 0:
                    sh = ensure(tcpr, 'shd')
                    sh.set(q('val'), 'clear')
                    sh.set(q('color'), 'auto')
                    sh.set(q('fill'), HEADER_FILL)
                # مورب فقط ردیف ۱ ستون ۱ جدول ضرایب
                if is_diag_table and ri == 0 and ci == 0:
                    b = etree.SubElement(tcpr, q('tcBorders'))
                    d = etree.SubElement(b, q('tr2bl'))
                    d.set(q('val'), 'single')
                    d.set(q('sz'), '8')
                    d.set(q('space'), '0')
                    d.set(q('color'), '000000')
                for p in tc.findall(q('p')):
                    ppr = p.find(q('pPr'))
                    if ppr is None:
                        ppr = etree.Element(q('pPr'))
                        p.insert(0, ppr)
                    if ppr.find(q('bidi')) is None:
                        etree.SubElement(ppr, q('bidi'))
                    txt = ptext(p)
                    jc = ppr.find(q('jc'))
                    if jc is None:
                        jc = etree.SubElement(ppr, q('jc'))
                    if FA_RE.search(txt) and not re.search(r'[A-Za-z]', txt):
                        jc.set(q('val'), 'right')
                    else:
                        jc.set(q('val'), 'center')
                    sp = ppr.find(q('spacing'))
                    if sp is None:
                        sp = etree.SubElement(ppr, q('spacing'))
                    sp.set(q('after'), '0')
                    sp.set(q('line'), '240')
                    sp.set(q('lineRule'), 'auto')
        n += 1
    return n


def caption_keep_with_table(body):
    els = list(body)
    n = 0
    for i, el in enumerate(els):
        if el.tag != q('p') or style_of(el) != 'Caption':
            continue
        ppr = el.find(q('pPr'))
        if ppr is None:
            continue
        if ppr.find(q('keepNext')) is None:
            etree.SubElement(ppr, q('keepNext'))
            n += 1
        jc = ppr.find(q('jc'))
        if jc is None:
            jc = etree.SubElement(ppr, q('jc'))
        jc.set(q('val'), 'right')
        if ppr.find(q('bidi')) is None:
            etree.SubElement(ppr, q('bidi'))
    return n


def fix_tof_field(body):
    """فیلد TOC جدول را ببند تا کد فیلد دیده نشود."""
    tofs = [p for p in body.iter(q('p')) if style_of(p) == 'TableofFigures']
    if not tofs:
        return False
    last = tofs[-1]
    # اگر end سراسری ندارد، اضافه کن
    ends = [fc for fc in last.iter(q('fldChar')) if fc.get(q('fldCharType')) == 'end']
    begins = [fc for fc in last.iter(q('fldChar')) if fc.get(q('fldCharType')) == 'begin']
    # PAGEREF خودش end دارد؛ برای TOC اصلی end نداریم
    n_end = sum(1 for p in tofs for fc in p.iter(q('fldChar')) if fc.get(q('fldCharType')) == 'end')
    n_begin = sum(1 for p in tofs for fc in p.iter(q('fldChar')) if fc.get(q('fldCharType')) == 'begin')
    if n_begin > n_end:
        r = etree.SubElement(last, q('r'))
        fc = etree.SubElement(r, q('fldChar'))
        fc.set(q('fldCharType'), 'end')
    for p in tofs:
        ppr = p.find(q('pPr'))
        if ppr is None:
            continue
        if ppr.find(q('bidi')) is None:
            etree.SubElement(ppr, q('bidi'))
        jc = ppr.find(q('jc'))
        if jc is None:
            jc = etree.SubElement(ppr, q('jc'))
        jc.set(q('val'), 'right')
    return True


def short_fn_separator(fn_root):
    """جداکنندهٔ پیش‌فرض ورد (کوتاه، نه تمام‌صفحه)."""
    n = 0
    for f in fn_root.findall(q('footnote')):
        kind = f.get(q('type'))
        if kind not in ('separator', 'continuationSeparator'):
            continue
        for child in list(f):
            f.remove(child)
        p = etree.SubElement(f, q('p'))
        ppr = etree.SubElement(p, q('pPr'))
        sp = etree.SubElement(ppr, q('spacing'))
        sp.set(q('after'), '0')
        sp.set(q('line'), '240')
        sp.set(q('lineRule'), 'auto')
        r = etree.SubElement(p, q('r'))
        tag = 'separator' if kind == 'separator' else 'continuationSeparator'
        etree.SubElement(r, q(tag))
        n += 1
    return n


def shrink_margins(doc):
    """حدود ۲٫۵مم از چپ و راست — نامحسوس، برای جا شدن چکیده."""
    n = 0
    for s in doc.iter(q('sectPr')):
        mar = s.find(q('pgMar'))
        if mar is None:
            continue
        for side in ('left', 'right'):
            v = mar.get(q(side))
            if v and v.isdigit():
                mar.set(q(side), str(max(int(v) - 140, 900)))
                n += 1
    return n


def fit_chekideh(body):
    started = False
    n = 0
    for p in body.iter(q('p')):
        t = ptext(p).strip()
        if t == 'چکیده':
            started = True
            ppr = p.find(q('pPr'))
            if ppr is not None:
                sp = ppr.find(q('spacing'))
                if sp is not None:
                    sp.set(q('after'), '80')
                    n += 1
            continue
        if not started:
            continue
        if style_of(p) == 'Heading1' or t.startswith('فصل'):
            break
        ppr = p.find(q('pPr'))
        if ppr is None:
            ppr = etree.Element(q('pPr'))
            p.insert(0, ppr)
        sp = ppr.find(q('spacing'))
        if sp is None:
            sp = etree.SubElement(ppr, q('spacing'))
        sp.set(q('before'), '0')
        sp.set(q('after'), '80')
        sp.set(q('line'), '276')
        sp.set(q('lineRule'), 'auto')
        n += 1
    return n


def persian_headings(body, styles):
    for sid, jc in (('Heading2', 'right'), ('Heading3', 'right'),
                    ('Heading4', 'right'), ('Caption', 'right'),
                    ('TableofFigures', 'right'), ('TOC1', 'right'),
                    ('TOC2', 'right'), ('TOC3', 'right'), ('TOC4', 'right')):
        for st in styles.findall(q('style')):
            if st.get(q('styleId')) != sid:
                continue
            ppr = st.find(q('pPr'))
            if ppr is None:
                ppr = etree.SubElement(st, q('pPr'))
            if ppr.find(q('bidi')) is None:
                etree.SubElement(ppr, q('bidi'))
            e = ppr.find(q('jc'))
            if e is None:
                e = etree.SubElement(ppr, q('jc'))
            e.set(q('val'), jc)
    n = 0
    for p in body.iter(q('p')):
        st = style_of(p)
        if st in ('Heading2', 'Heading3', 'Heading4', 'Caption'):
            ppr = p.find(q('pPr'))
            if ppr is None:
                continue
            if ppr.find(q('bidi')) is None:
                etree.SubElement(ppr, q('bidi'))
            jc = ppr.find(q('jc'))
            if jc is None:
                jc = etree.SubElement(ppr, q('jc'))
            jc.set(q('val'), 'right')
            n += 1
    return n


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn = etree.fromstring(parts['word/footnotes.xml'])
    styles = etree.fromstring(parts['word/styles.xml'])
    body = doc[0]
    rep = {}
    rep['tables'] = beautify_tables(body)
    rep['caption'] = caption_keep_with_table(body)
    rep['tof'] = fix_tof_field(body)
    rep['sep'] = short_fn_separator(fn)
    rep['margin'] = shrink_margins(doc)
    rep['chekideh'] = fit_chekideh(body)
    rep['heads'] = persian_headings(body, styles)
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
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.5.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-Fatemeh-Bayat-v1.6.docx'
    print('نوشته شد:', dst, process(src, dst))
