# -*- coding: utf-8 -*-
"""
v1.5 — پانویس پیام‌نور، لوگوی صفحهٔ آخر، راست‌چین فارسی،
فهرست جداول، لینک منابع، شمارهٔ صفحهٔ چکیده از ۱.
"""
import copy, re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W = '{%s}' % NS
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
def q(t): return W + t

TNR = 'Times New Roman'
HYPER_LEFTOVER = re.compile(
    r'HYPERLINK\s+"([^"]+)"(?:\s*\\t\s*"[^"]*")?', re.I)
URL_RE = re.compile(r'https?://[^\s<>"\\]+', re.I)


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def ensure_ppr(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    return ppr


def set_el(parent, tag, **attrs):
    e = parent.find(q(tag))
    if e is None:
        e = etree.SubElement(parent, q(tag))
    for k, v in attrs.items():
        if v is None:
            if q(k) in e.attrib:
                del e.attrib[q(k)]
        else:
            e.set(q(k), v)
    return e


def style_by_id(styles, sid):
    for s in styles.findall(q('style')):
        if s.get(q('styleId')) == sid:
            return s
    return None


def ensure_style_ppr(st):
    ppr = st.find(q('pPr'))
    if ppr is None:
        # after name/basedOn
        ppr = etree.Element(q('pPr'))
        st.append(ppr)
    return ppr


def persian_styles(styles):
    """استایل‌های فارسی: bidi + راست‌چین (H1 وسط)."""
    specs = {
        'Heading1': ('center', True),
        'Heading2': ('right', True),
        'Heading3': ('right', True),
        'Heading4': ('right', True),
        'TOC1': ('right', True),
        'TOC2': ('right', True),
        'TOC3': ('right', True),
        'TOC4': ('right', True),
        'TableofFigures': ('right', True),
        'Caption': ('right', True),
        'Footer': ('center', True),
        'Header': ('right', True),
        'Normal': (None, True),
    }
    for sid, (jc, bidi) in specs.items():
        st = style_by_id(styles, sid)
        if st is None:
            continue
        ppr = ensure_style_ppr(st)
        if bidi:
            b = ppr.find(q('bidi'))
            if b is None:
                etree.SubElement(ppr, q('bidi'))
            elif b.get(q('val')) in ('0', 'false'):
                if q('val') in b.attrib:
                    del b.attrib[q('val')]
        if jc:
            set_el(ppr, 'jc', val=jc)
        if sid == 'TableofFigures':
            ind = ppr.find(q('ind'))
            if ind is not None:
                ppr.remove(ind)
            sp = ppr.find(q('spacing'))
            if sp is None:
                sp = etree.SubElement(ppr, q('spacing'))
            sp.set(q('before'), '0')
            sp.set(q('after'), '40')
            tabs = ppr.find(q('tabs'))
            if tabs is None:
                tabs = etree.SubElement(ppr, q('tabs'))
            tab = tabs.find(q('tab'))
            if tab is None:
                tab = etree.SubElement(tabs, q('tab'))
            tab.set(q('val'), 'right')
            tab.set(q('leader'), 'dot')
            tab.set(q('pos'), '8778')


def fix_instance_align(body):
    for p in body.iter(q('p')):
        st = style_of(p)
        ppr = p.find(q('pPr'))
        if ppr is None:
            continue
        t = ptext(p).strip()
        if st == 'Heading1' and t != 'ABSTRACT':
            set_el(ppr, 'jc', val='center')
            b = ppr.find(q('bidi'))
            if b is not None and b.get(q('val')) in ('0', 'false'):
                del b.attrib[q('val')]
            elif b is None:
                etree.SubElement(ppr, q('bidi'))
        if st in ('TOC1', 'TOC2', 'TOC3', 'TOC4', 'TableofFigures', 'Caption',
                  'Heading2', 'Heading3', 'Heading4'):
            if ppr.find(q('bidi')) is None:
                etree.SubElement(ppr, q('bidi'))
            if st == 'Caption':
                set_el(ppr, 'jc', val='right')
            if st == 'TableofFigures':
                set_el(ppr, 'jc', val='right')
                ind = ppr.find(q('ind'))
                if ind is not None:
                    ppr.remove(ind)


def restore_fn_separator(fn_root):
    n = 0
    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')) not in ('separator', 'continuationSeparator'):
            continue
        p = f.find(q('p'))
        if p is None:
            p = etree.SubElement(f, q('p'))
        ppr = ensure_ppr(p)
        bdr = ppr.find(q('pBdr'))
        if bdr is None:
            bdr = etree.SubElement(ppr, q('pBdr'))
        bot = bdr.find(q('bottom'))
        if bot is None:
            bot = etree.SubElement(bdr, q('bottom'))
        bot.set(q('val'), 'single')
        bot.set(q('sz'), '12')
        bot.set(q('space'), '1')
        bot.set(q('color'), '000000')
        sp = ppr.find(q('spacing'))
        if sp is None:
            sp = etree.SubElement(ppr, q('spacing'))
        sp.set(q('before'), '0')
        sp.set(q('after'), '0')
        sp.set(q('line'), '240')
        sp.set(q('lineRule'), 'auto')
        if p.find(q('r')) is None:
            r = etree.SubElement(p, q('r'))
            rpr = etree.SubElement(r, q('rPr'))
            for tag in ('sz', 'szCs'):
                e = etree.SubElement(rpr, q(tag))
                e.set(q('val'), '4')
            n += 1
    return n


def format_footnotes_pnu(fn_root, styles):
    """۹pt لاتین / ۱۰pt پیچیده، TNR، چپ‌چین — مطابق پانویس انگلیسی پیام‌نور."""
    st = style_by_id(styles, 'FootnoteText')
    if st is not None:
        rpr = st.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(st, q('rPr'))
        rf = rpr.find(q('rFonts'))
        if rf is None:
            rf = etree.Element(q('rFonts'))
            rpr.insert(0, rf)
        for a in ('ascii', 'hAnsi', 'eastAsia', 'cs'):
            rf.set(q(a), TNR)
        set_el(rpr, 'sz', val='18')
        set_el(rpr, 'szCs', val='20')
        ppr = ensure_style_ppr(st)
        set_el(ppr, 'jc', val='left')
    st = style_by_id(styles, 'FootnoteReference')
    if st is not None:
        rpr = st.find(q('rPr'))
        if rpr is None:
            rpr = etree.SubElement(st, q('rPr'))
        if rpr.find(q('b')) is None:
            etree.SubElement(rpr, q('b'))
        if rpr.find(q('bCs')) is None:
            etree.SubElement(rpr, q('bCs'))
        va = rpr.find(q('vertAlign'))
        if va is not None:
            rpr.remove(va)
        set_el(rpr, 'sz', val='18')
        set_el(rpr, 'szCs', val='20')
    n = 0
    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')):
            continue
        for p in f.findall(q('p')):
            ppr = ensure_ppr(p)
            ps = ppr.find(q('pStyle'))
            if ps is None:
                ps = etree.SubElement(ppr, q('pStyle'))
                ps.set(q('val'), 'FootnoteText')
            set_el(ppr, 'jc', val='left')
            bidi = ppr.find(q('bidi'))
            if bidi is None:
                bidi = etree.SubElement(ppr, q('bidi'))
            bidi.set(q('val'), '0')
            for r in p.iter(q('r')):
                rpr = r.find(q('rPr'))
                if rpr is None:
                    rpr = etree.Element(q('rPr'))
                    r.insert(0, rpr)
                rf = rpr.find(q('rFonts'))
                if rf is None:
                    rf = etree.Element(q('rFonts'))
                    rpr.insert(0, rf)
                for a in ('ascii', 'hAnsi', 'eastAsia', 'cs'):
                    rf.set(q(a), TNR)
                set_el(rpr, 'sz', val='18')
                set_el(rpr, 'szCs', val='20')
                n += 1
    return n


def restore_last_page_logo(doc, parts, src_bu):
    """نماد پیام‌نور بالای شناسنامهٔ انگلیسی — از Bu-V00."""
    body = doc[0]
    target = None
    for p in body.iter(q('p')):
        if ptext(p).startswith('Payame Noor University'):
            target = p
            break
    if target is None:
        return False
    # اگر از قبل تصویر دارد
    if any(e.tag.endswith('drawing') or e.tag.endswith('pict')
           for e in target.iter()):
        return False
    bu = zipfile.ZipFile(src_bu)
    bdoc = etree.fromstring(bu.read('word/document.xml'))
    run = None
    for p in bdoc[0].iter(q('p')):
        if not ptext(p).startswith('Payame Noor University'):
            continue
        for r in p.findall(q('r')):
            if list(r.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}anchor')):
                run = copy.deepcopy(r)
                break
    if run is None:
        bu.close()
        return False
    # تصویر
    img = bu.read('word/media/image3.jpeg')
    bu.close()
    parts['word/media/image3.jpeg'] = img
    rid = 'rId23'
    # embed
    for blip in run.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}blip'):
        blip.set('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed', rid)
    ppr = ensure_ppr(target)
    if ppr.find(q('pageBreakBefore')) is None:
        etree.SubElement(ppr, q('pageBreakBefore'))
    bidi = ppr.find(q('bidi'))
    if bidi is None:
        bidi = etree.SubElement(ppr, q('bidi'))
    bidi.set(q('val'), '0')
    set_el(ppr, 'jc', val='center')
    # درج ران تصویر در ابتدای بند (بعد از pPr)
    ppr.addnext(run)
    # rels
    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    if not any(r.get('Id') == rid for r in rels):
        e = etree.SubElement(rels, '{%s}Relationship' % REL_NS)
        e.set('Id', rid)
        e.set('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image')
        e.set('Target', 'media/image3.jpeg')
    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)
    return True


def make_hyperlink(url, model_r):
    hl = etree.Element(q('hyperlink'))
    # history + anchor via rel — برای خارجی از r:id استفاده می‌شود بعداً
    hl.set('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id', 'PENDING')
    nr = copy.deepcopy(model_r)
    t = nr.find(q('t'))
    if t is None:
        t = etree.SubElement(nr, q('t'))
    t.text = url
    t.set(XML_SPACE, 'preserve')
    # فقط یک t
    for extra in nr.findall(q('t'))[1:]:
        extra.getparent().remove(extra)
    rpr = nr.find(q('rPr'))
    if rpr is None:
        rpr = etree.Element(q('rPr'))
        nr.insert(0, rpr)
    rs = rpr.find(q('rStyle'))
    if rs is None:
        rs = etree.Element(q('rStyle'))
        rpr.insert(0, rs)
    rs.set(q('val'), 'Hyperlink')
    hl.append(nr)
    return hl


def linkify_paragraph(p, new_rels):
    """HYPERLINK \"url\" و URLهای ساده را به hyperlink واقعی تبدیل می‌کند."""
    if style_of(p) and str(style_of(p)).startswith('TOC'):
        return 0
    n = 0
    # اگر کل بند از قبل hyperlink دارد و متن HYPERLINK ندارد، رد شو
    full = ptext(p)
    if 'HYPERLINK' not in full and not URL_RE.search(full):
        return 0
    for r in list(p.iter(q('r'))):
        if r.getparent() is not None and r.getparent().tag == q('hyperlink'):
            continue
        t = r.find(q('t'))
        if t is None or not t.text:
            continue
        text = t.text
        m = HYPER_LEFTOVER.search(text)
        url = None
        prefix = suffix = ''
        if m:
            url = m.group(1).rstrip('.,);')
            prefix, suffix = text[:m.start()], text[m.end():]
        else:
            m2 = URL_RE.search(text)
            if not m2:
                continue
            url = m2.group(0).rstrip('.,);')
            prefix, suffix = text[:m2.start()], text[m2.end():]
        if not url:
            continue
        rid = 'rIdU%d' % (len(new_rels) + 100)
        new_rels.append((rid, url))
        hl = make_hyperlink(url, r)
        hl.set('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id', rid)
        # جایگزینی
        if prefix.strip() == '' and suffix.strip() == '':
            t.text = url
            r.addprevious(hl)
            r.getparent().remove(r)
        else:
            if prefix:
                t.text = prefix
                r.addnext(hl)
                anchor = hl
            else:
                r.addprevious(hl)
                r.getparent().remove(r)
                anchor = hl
            if suffix:
                nr = copy.deepcopy(anchor.find(q('r')) if anchor.find(q('r')) is not None else r)
                # simpler: new run after hl
                nr = copy.deepcopy(r) if r.getparent() is not None else copy.deepcopy(hl.find(q('r')))
                nt = nr.find(q('t'))
                if nt is not None:
                    nt.text = suffix
                hl.addnext(nr)
        n += 1
    return n


def rebuild_para_with_url(p, prefix, url, suffix, new_rels):
    ppr = p.find(q('pPr'))
    model = None
    for r in p.iter(q('r')):
        if r.find(q('t')) is not None:
            model = r
            break
    if model is None:
        return 0
    for child in list(p):
        if child is ppr:
            continue
        p.remove(child)
    if prefix:
        r = copy.deepcopy(model)
        t = r.find(q('t'))
        if t is None:
            t = etree.SubElement(r, q('t'))
        t.text = prefix + (' ' if not prefix.endswith(' ') else '')
        t.set(XML_SPACE, 'preserve')
        for extra in list(r):
            if extra.tag not in (q('rPr'), q('t')):
                r.remove(extra)
        p.append(r)
    rid = 'rIdU%d' % (len(new_rels) + 100)
    new_rels.append((rid, url))
    hl = make_hyperlink(url, model)
    hl.set('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id', rid)
    p.append(hl)
    if suffix:
        r = copy.deepcopy(model)
        t = r.find(q('t'))
        if t is None:
            t = etree.SubElement(r, q('t'))
        t.text = (' ' if not suffix.startswith(' ') else '') + suffix
        t.set(XML_SPACE, 'preserve')
        for extra in list(r):
            if extra.tag not in (q('rPr'), q('t')):
                r.remove(extra)
        p.append(r)
    return 1


def clean_split_hyperlinks(body, new_rels):
    n = 0
    started = False
    for p in body.iter(q('p')):
        t = ptext(p)
        ts = t.strip()
        if ts in ('منابع لاتین', 'منابع فارسی'):
            started = True
            continue
        if ts == 'ABSTRACT':
            started = False
        if not started or 'HYPERLINK' not in t:
            continue
        m = re.search(r'HYPERLINK\s+"([^"]+)"', t)
        if not m:
            continue
        url = m.group(1)
        prefix = t[:t.find('HYPERLINK')].rstrip()
        m2 = re.search(r'_blank"?\s*(.*)$', t)
        suffix = (m2.group(1) if m2 else '').strip()
        n += rebuild_para_with_url(p, prefix, url, suffix, new_rels)
    return n


def linkify_refs(body, parts):
    new_rels = []
    n = 0
    started = False
    for p in body.iter(q('p')):
        t = ptext(p).strip()
        if t in ('منابع لاتین', 'منابع فارسی'):
            started = True
            continue
        if t == 'ABSTRACT':
            started = False
        if not started:
            continue
        n += linkify_paragraph(p, new_rels)
    n += clean_split_hyperlinks(body, new_rels)
    if new_rels:
        rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
        have = {r.get('Id') for r in rels}
        HT = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink'
        for rid, url in new_rels:
            if rid in have:
                continue
            e = etree.SubElement(rels, '{%s}Relationship' % REL_NS)
            e.set('Id', rid)
            e.set('Type', HT)
            e.set('Target', url)
            e.set('TargetMode', 'External')
            have.add(rid)
        parts['word/_rels/document.xml.rels'] = etree.tostring(
            rels, xml_declaration=True, encoding='UTF-8', standalone=True)
    return n


def ensure_chekideh_page1(body):
    """از چکیده شمارهٔ عددی از ۱ — sectPr ابجد باید قبل از چکیده باشد."""
    blocks = list(body)
    i_chek = next(i for i, b in enumerate(blocks)
                  if b.tag == q('p') and ptext(b).strip() == 'چکیده')
    prev = blocks[i_chek - 1]
    ppr = prev.find(q('pPr')) if prev.tag == q('p') else None
    ok = False
    if ppr is not None:
        sp = ppr.find(q('sectPr'))
        if sp is not None:
            pn = sp.find(q('pgNumType'))
            if pn is None:
                pn = etree.SubElement(sp, q('pgNumType'))
            pn.set(q('fmt'), 'arabicAlpha')
            pn.set(q('start'), '1')
            ok = True
    final = body.find(q('sectPr'))
    if final is not None:
        pn = final.find(q('pgNumType'))
        if pn is None:
            pn = etree.SubElement(final, q('pgNumType'))
        if q('fmt') in pn.attrib:
            del pn.attrib[q('fmt')]
        pn.set(q('start'), '1')
    return ok


def process(src, dst, bu='Payannameh_Fatemeh.Bayat-(Bu-V00).docx'):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn = etree.fromstring(parts['word/footnotes.xml'])
    styles = etree.fromstring(parts['word/styles.xml'])
    rep = {}

    persian_styles(styles)
    fix_instance_align(doc[0])
    rep['sep'] = restore_fn_separator(fn)
    rep['fn'] = format_footnotes_pnu(fn, styles)
    rep['logo'] = restore_last_page_logo(doc, parts, bu)
    # rels may have been rewritten by logo
    parts['word/document.xml'] = etree.tostring(doc)  # temp so linkify uses same tree
    rep['links'] = linkify_refs(doc[0], parts)
    rep['page1'] = ensure_chekideh_page1(doc[0])

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
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.4.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-Fatemeh-Bayat-v1.5.docx'
    print('نوشته شد:', dst, process(src, dst))
