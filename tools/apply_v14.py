# -*- coding: utf-8 -*-
"""
v1.4 — زبان، ارقام، جهت لاتین، شمارهٔ صفحه، شناسنامه، استایل‌ها.
متن بازنویسی نمی‌شود.
"""
import copy, re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W = '{%s}' % NS
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
CT_NS = 'http://schemas.openxmlformats.org/package/2006/content-types'
CP = '{http://schemas.openxmlformats.org/package/2006/metadata/core-properties}'
DC = '{http://purl.org/dc/elements/1.1/}'
DCT = '{http://purl.org/dc/terms/}'
EP = '{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}'
W14 = '{http://schemas.microsoft.com/office/word/2010/wordml}'
W15 = '{http://schemas.microsoft.com/office/word/2012/wordml}'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

def q(t): return W + t

FA, EN = 'fa-IR', 'en-US'
WEST2FA = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
FA2WEST = str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩', '01234567890123456789')

KEEP_STYLES = {
    'Normal', 'Heading1', 'Heading2', 'Heading3', 'Heading4',
    'TOC1', 'TOC2', 'TOC3', 'TOC4',
    'FootnoteText', 'FootnoteReference', 'FootnoteTextChar',
    'Caption', 'TableofFigures', 'Hyperlink',
    'DefaultParagraphFont', 'TableNormal', 'NoList',
    'Header', 'Footer', 'HeaderChar', 'FooterChar',
    'EndnoteText', 'EndnoteReference', 'EndnoteTextChar',
    'PageNumber', 'CaptionChar',
    'Heading1Char', 'Heading2Char', 'Heading3Char', 'Heading4Char',
    'TOC1Char', 'TOC2Char', 'TOC3Char', 'TOC4Char',
}
REMAP_STYLES = {'NormalWeb': 'Normal', 'NormalWebChar': None}

KEEP_NUM = {'5', '20', '21'}


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def is_fa_char(ch):
    o = ord(ch)
    return (
        '\u0600' <= ch <= '\u06FF'
        or '\u0750' <= ch <= '\u077F'
        or ch in '‌‍۰۱۲۳۴۵۶۷۸۹'
        or ch in '،؛؟«»ـ'
    )


def is_en_char(ch):
    return ('A' <= ch <= 'Z') or ('a' <= ch <= 'z') or ('0' <= ch <= '9')


def kind(ch):
    if is_fa_char(ch):
        return 'fa'
    if is_en_char(ch):
        return 'en'
    return 'n'


def split_script(text):
    """متن را به قطعات fa/en می‌شکند؛ خنثی‌ها به قطعهٔ مجاور می‌چسبند."""
    if not text:
        return []
    raw = []
    buf, k0 = text[0], kind(text[0])
    for ch in text[1:]:
        k = kind(ch)
        if k == k0 or k == 'n' or k0 == 'n':
            if k0 == 'n' and k != 'n':
                k0 = k
            buf += ch
        else:
            raw.append((k0, buf))
            buf, k0 = ch, k
    raw.append((k0, buf))
    # خنثیِ مانده
    out = []
    for k, s in raw:
        if k == 'n' and out:
            pk, ps = out[-1]
            out[-1] = (pk, ps + s)
        else:
            out.append((k if k != 'n' else 'fa', s))
    return out


def rpr_of(r, create=False):
    rpr = r.find(q('rPr'))
    if rpr is None and create:
        rpr = etree.Element(q('rPr'))
        r.insert(0, rpr)
    return rpr


def set_run_dir(r, script):
    rpr = rpr_of(r, create=True)
    rtl = rpr.find(q('rtl'))
    if script == 'en':
        if rtl is None:
            rtl = etree.SubElement(rpr, q('rtl'))
        rtl.set(q('val'), '0')
        lang = rpr.find(q('lang'))
        if lang is None:
            lang = etree.SubElement(rpr, q('lang'))
        lang.set(q('val'), EN)
        if lang.get(q('bidi')):
            lang.set(q('bidi'), FA)
    else:
        if rtl is None:
            etree.SubElement(rpr, q('rtl'))
        else:
            if q('val') in rtl.attrib:
                del rtl.attrib[q('val')]
        lang = rpr.find(q('lang'))
        if lang is None:
            lang = etree.SubElement(rpr, q('lang'))
        lang.set(q('bidi'), FA)


def convert_digits(text, script):
    if script == 'en':
        return text.translate(FA2WEST)
    return text.translate(WEST2FA)


def para_is_ltr(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        return False
    bidi = ppr.find(q('bidi'))
    if bidi is not None and bidi.get(q('val')) in ('0', 'false', 'off'):
        return True
    return False


def process_run_text(r, ltr_para):
    if r.find(q('footnoteReference')) is not None:
        return 0
    if r.find(q('drawing')) is not None or r.find(q('object')) is not None:
        return 0
    t = r.find(q('t'))
    if t is None or t.text is None or t.text == '':
        return 0
    text = t.text
    parts = split_script(text)
    if not parts:
        return 0
    n = 0
    has_lat_letter = bool(re.search(r'[A-Za-z]', text))
    has_fa_letter = bool(re.search(r'[آ-ی]', text))
    scripts = {k for k, _ in parts if k != 'n'}
    # فقط رقم/علامت → تابع جهت بند
    if not has_lat_letter and not has_fa_letter:
        script = 'en' if ltr_para else 'fa'
        new = convert_digits(text, script)
        if new != text:
            t.text = new
            n += 1
        set_run_dir(r, script)
        return n
    if len(parts) == 1 or len(scripts) <= 1:
        script = 'en' if (ltr_para or (has_lat_letter and not has_fa_letter)) else 'fa'
        new = convert_digits(text, script)
        if new != text:
            t.text = new
            n += 1
        set_run_dir(r, script)
        return n
    # شکستن ران مختلط
    first_k, first_s = parts[0]
    if ltr_para and first_k != 'fa':
        first_k = 'en'
    new = convert_digits(first_s, first_k)
    t.text = new
    if first_s.startswith(' ') or first_s.endswith(' ') or new.startswith(' ') or new.endswith(' '):
        t.set(XML_SPACE, 'preserve')
    set_run_dir(r, first_k)
    n += 1
    anchor = r
    for k, s in parts[1:]:
        if ltr_para and k != 'fa':
            k = 'en'
        nr = copy.deepcopy(r)
        # فقط یک t نگه دار
        ts = nr.findall(q('t'))
        if not ts:
            continue
        ts[0].text = convert_digits(s, k)
        if s.startswith(' ') or s.endswith(' '):
            ts[0].set(XML_SPACE, 'preserve')
        for extra in ts[1:]:
            extra.getparent().remove(extra)
        set_run_dir(nr, k)
        anchor.addnext(nr)
        anchor = nr
        n += 1
    return n


KEEP_RUN_KIDS = (
    'fldChar', 'instrText', 'tab', 'br', 'cr', 'drawing', 'object',
    'footnoteReference', 'footnoteRef', 'endnoteReference', 'endnoteRef',
    'lastRenderedPageBreak', 'sym', 'separator', 'continuationSeparator',
    'pgNum', 'ptab',
)


def strip_empty_runs(root):
    n = 0
    for r in list(root.iter(q('r'))):
        if any(r.find(q(tag)) is not None for tag in KEEP_RUN_KIDS):
            continue
        if any((t.text or '') for t in r.findall(q('t'))):
            continue
        parent = r.getparent()
        if parent is not None:
            parent.remove(r)
            n += 1
    return n


def walk_paras(root):
    n = 0
    for p in root.iter(q('p')):
        ltr = para_is_ltr(p)
        for r in list(p.iter(q('r'))):
            n += process_run_text(r, ltr)
    n += strip_empty_runs(root)
    return n


def fix_lang_root(root):
    n = 0
    for tag in ('lang', 'themeFontLang'):
        for e in root.iter(q(tag)):
            v = e.get(q('bidi'))
            if v and v != FA:
                e.set(q('bidi'), FA); n += 1
            v = e.get(q('val'))
            if v and v != EN:
                e.set(q('val'), EN); n += 1
            v = e.get(q('eastAsia'))
            if v and v != EN:
                e.set(q('eastAsia'), EN); n += 1
    return n


def remap_and_collect_used(doc, fn, footers):
    used = set()
    for root in (doc, fn) + tuple(footers):
        for e in root.iter(q('pStyle'), q('rStyle'), q('tblStyle')):
            val = e.get(q('val'))
            if val in REMAP_STYLES:
                dest = REMAP_STYLES[val]
                if dest:
                    e.set(q('val'), dest)
                    used.add(dest)
                else:
                    e.getparent().remove(e)
            else:
                used.add(val)
    return used


def prune_styles(styles, used):
    keep = set(KEEP_STYLES) | set(used)
    removed = 0
    for s in list(styles.findall(q('style'))):
        sid = s.get(q('styleId'))
        if sid not in keep:
            styles.remove(s)
            removed += 1
            continue
        # نام انگلیسی از قبل هست؛ لینک به استایل حذف‌شده را بردار
        for tag in ('link', 'basedOn', 'next'):
            el = s.find(q(tag))
            if el is not None and el.get(q('val')) not in keep:
                if tag == 'basedOn':
                    el.set(q('val'), 'Normal' if s.get(q('type')) == 'paragraph' else 'DefaultParagraphFont')
                else:
                    s.remove(el)
        nm = s.find(q('name'))
        if nm is not None:
            name = nm.get(q('val')) or ''
            # اگر نام غیرلاتین بود، styleId را جایگزین کن
            if re.search(r'[\u0600-\u06FF]', name):
                nm.set(q('val'), sid)
    return removed


def prune_numbering(num_root):
    # numId → abstractNumId برای موارد استفاده‌شده
    keep_abs = set()
    for n in num_root.findall(q('num')):
        if n.get(q('numId')) in KEEP_NUM:
            a = n.find(q('abstractNumId'))
            if a is not None:
                keep_abs.add(a.get(q('val')))
    removed = 0
    for n in list(num_root.findall(q('num'))):
        if n.get(q('numId')) not in KEEP_NUM:
            num_root.remove(n); removed += 1
    for a in list(num_root.findall(q('abstractNum'))):
        if a.get(q('abstractNumId')) not in keep_abs:
            num_root.remove(a); removed += 1
    return removed


def move_section_before_chekideh(body):
    """ابجد تا پیش از چکیده؛ از چکیده شماره از ۱."""
    blocks = list(body)
    i_chek = next(i for i, b in enumerate(blocks)
                  if b.tag == q('p') and ptext(b).strip() == 'چکیده')
    # sectPr فعلیِ بخش ابجد را پیدا کن (fmt=arabicAlpha)
    abjad_host = None
    for b in blocks:
        if b.tag != q('p'):
            continue
        ppr = b.find(q('pPr'))
        if ppr is None:
            continue
        sp = ppr.find(q('sectPr'))
        if sp is None:
            continue
        pn = sp.find(q('pgNumType'))
        if pn is not None and pn.get(q('fmt')) == 'arabicAlpha':
            abjad_host = (b, ppr, sp)
    if abjad_host is None:
        return False
    b, ppr, sp = abjad_host
    # اگر همین الان روی پاراگرافِ قبل از چکیده است، تمام
    if blocks[i_chek - 1] is b:
        _ensure_next_page(sp)
        return True
    # انتقال
    ppr.remove(sp)
    prev = blocks[i_chek - 1]
    if prev.tag != q('p'):
        return False
    pp = prev.find(q('pPr'))
    if pp is None:
        pp = etree.Element(q('pPr'))
        prev.insert(0, pp)
    # sectPr قبلیِ prev را اگر هست بردار
    for old in pp.findall(q('sectPr')):
        pp.remove(old)
    _ensure_next_page(sp)
    pp.append(sp)
    return True


def _ensure_next_page(sp):
    typ = sp.find(q('type'))
    if typ is None:
        typ = etree.Element(q('type'))
        # type باید نزدیک ابتدای sectPr باشد
        sp.insert(0, typ)
    typ.set(q('val'), 'nextPage')


def clean_props(parts):
    # core: فقط عنوان و پدیدآور
    core = etree.fromstring(parts['docProps/core.xml'])
    keep_tags = {DC + 'title', DC + 'creator'}
    for child in list(core):
        if child.tag not in keep_tags:
            core.remove(child)
    parts['docProps/core.xml'] = etree.tostring(
        core, xml_declaration=True, encoding='UTF-8', standalone=True)

    app = etree.fromstring(parts['docProps/app.xml'])
    for tag in ('Template', 'Company', 'Manager', 'TotalTime',
                'HeadingPairs', 'TitlesOfParts', 'ScaleCrop',
                'LinksUpToDate', 'SharedDoc', 'HyperlinksChanged',
                'DocSecurity'):
        for e in app.findall(EP + tag):
            app.remove(e)
    parts['docProps/app.xml'] = etree.tostring(
        app, xml_declaration=True, encoding='UTF-8', standalone=True)

    st = etree.fromstring(parts['word/settings.xml'])
    for e in list(st):
        tag = e.tag
        if tag in (W14 + 'docId', W15 + 'docId', q('rsids'),
                   q('attachedTemplate'), q('documentProtection'),
                   q('writeProtection'), q('doNotTrackMoves')):
            st.remove(e)
    # زبان زمینه
    tfl = st.find(q('themeFontLang'))
    if tfl is None:
        tfl = etree.SubElement(st, q('themeFontLang'))
    tfl.set(q('val'), EN)
    tfl.set(q('eastAsia'), EN)
    tfl.set(q('bidi'), FA)
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)


def drop_custom_xml(parts):
    drop = [n for n in parts if n.startswith('customXml/')]
    for n in drop:
        del parts[n]
    # rels
    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    for rel in list(rels):
        typ = rel.get('Type') or ''
        tgt = rel.get('Target') or ''
        if 'customXml' in typ or 'customXml' in tgt:
            rels.remove(rel)
    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)
    ct = etree.fromstring(parts['[Content_Types].xml'])
    for o in list(ct):
        pn = o.get('PartName') or ''
        if 'customXml' in pn:
            ct.remove(o)
    parts['[Content_Types].xml'] = etree.tostring(
        ct, xml_declaration=True, encoding='UTF-8', standalone=True)
    return len(drop)


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    rep = {}

    doc = etree.fromstring(parts['word/document.xml'])
    fn = etree.fromstring(parts['word/footnotes.xml'])
    styles = etree.fromstring(parts['word/styles.xml'])
    numbering = etree.fromstring(parts['word/numbering.xml'])
    ftrs = []
    for name in ('word/footer1.xml', 'word/footer2.xml', 'word/footer3.xml'):
        ftrs.append(etree.fromstring(parts[name]))

    # ۱) زبان
    nlang = 0
    for root in (doc, fn, styles, numbering) + tuple(ftrs):
        nlang += fix_lang_root(root)
    rep['lang'] = nlang

    # ۲+۳) ارقام و LTR با شکستن ران‌های مختلط
    nrun = walk_paras(doc) + walk_paras(fn)
    for f in ftrs:
        nrun += walk_paras(f)
    rep['runs'] = nrun

    # ۴) شمارهٔ صفحه: ابجد تا پیش از چکیده، از چکیده از ۱
    rep['sect'] = move_section_before_chekideh(doc[0])

    # استایل‌ها
    used = remap_and_collect_used(doc, fn, ftrs)
    rep['styles_removed'] = prune_styles(styles, used)
    rep['num_removed'] = prune_numbering(numbering)

    # ۵) شناسنامه
    clean_props(parts)
    rep['customxml'] = drop_custom_xml(parts)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/styles.xml'] = etree.tostring(
        styles, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/numbering.xml'] = etree.tostring(
        numbering, xml_declaration=True, encoding='UTF-8', standalone=True)
    for i, name in enumerate(('word/footer1.xml', 'word/footer2.xml', 'word/footer3.xml')):
        parts[name] = etree.tostring(
            ftrs[i], xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return rep


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.3.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-Fatemeh-Bayat-v1.4.docx'
    rep = process(src, dst)
    print('نوشته شد:', dst)
    for k, v in rep.items():
        print(f'  {k}: {v}')
