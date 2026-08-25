# -*- coding: utf-8 -*-
"""
شماره‌گذاری صفحات مطابق تصمیم کاربر:

  بخش ۱ (جلد، بسم‌الله، عنوان، تعهدنامه، تشکر، تقدیم)  → بدون شماره
  بخش ۲ (فهرست‌ها و چکیده)                              → ابجد: الف، ب، ج
  بخش ۳ (از فصل اول تا پایان)                           → ارقام فارسی: ۱، ۲، ۳

روش: سه بخش با سه پاصفحهٔ جداگانه. ورد قالب ارقام فارسی را با
numFmt="hebrew1"? نه — برای فارسی از w:pgNumType/@fmt استفاده نمی‌شود؛
راه درست، سوییچ فیلد PAGE با \\* استفاده از قالب زبان است. چون ورد
ارقام را بر پایهٔ زبان ران نمایش می‌دهد، ران فیلد را با lang/bidi فارسی
علامت می‌زنیم و numFmt را روی decimal نگه می‌داریم.
"""
import sys, zipfile, copy
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
R  = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
W, RQ = '{%s}' % NS, '{%s}' % R
def q(t): return W + t
XMLSP = '{http://www.w3.org/XML/1998/namespace}space'

CHAP1 = 'فصل اول'


def ptext(p): return ''.join(t.text or '' for t in p.iter(q('t')))


def footer_xml(kind):
    """kind: 'none' | 'abjad' | 'fa'"""
    head = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            f'<w:ftr xmlns:w="{NS}">')
    if kind == 'none':
        return (head + '<w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p></w:ftr>').encode()

    # ارقام فارسی: ران با rtl + lang bidi=fa-IR تا ورد ارقام را فارسی بنویسد
    rpr = ('<w:rPr>'
           '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="B Lotus"/>'
           '<w:sz w:val="24"/><w:szCs w:val="24"/>'
           '<w:rtl/><w:lang w:bidi="fa-IR"/>'
           '</w:rPr>')
    return (head +
            '<w:p><w:pPr><w:bidi/><w:jc w:val="center"/>'
            '<w:rPr><w:rtl/></w:rPr></w:pPr>'
            f'<w:r>{rpr}<w:fldChar w:fldCharType="begin"/></w:r>'
            f'<w:r>{rpr}<w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>'
            f'<w:r>{rpr}<w:fldChar w:fldCharType="separate"/></w:r>'
            f'<w:r>{rpr}<w:t>1</w:t></w:r>'
            f'<w:r>{rpr}<w:fldChar w:fldCharType="end"/></w:r>'
            '</w:p></w:ftr>').encode()


def build_sectPr(src, fmt, start, rid):
    """کپی از sectPr مرجع با pgNumType و footerReference دلخواه."""
    s = copy.deepcopy(src)
    for tag in ('footerReference', 'headerReference', 'pgNumType', 'titlePg'):
        for e in s.findall(q(tag)):
            s.remove(e)
    fr = etree.Element(q('footerReference'))
    fr.set(q('type'), 'default'); fr.set(RQ + 'id', rid)
    s.insert(0, fr)
    pn = etree.SubElement(s, q('pgNumType'))
    if fmt:
        pn.set(q('fmt'), fmt)
    pn.set(q('start'), str(start))
    return s


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()

    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    blocks = list(body)
    final = body.find(q('sectPr'))

    # --- مرز ۱: پایان صفحات آغازین = «فهرست مطالب» ---
    i_toc = next(i for i, b in enumerate(blocks)
                 if b.tag == q('p') and ptext(b).strip() == 'فهرست مطالب')
    # --- مرز ۲: شروع متن اصلی = صفحهٔ عنوان فصل اول ---
    i_ch1 = next(i for i, b in enumerate(blocks)
                 if b.tag == q('p') and ptext(b).strip().startswith(CHAP1)
                 and b.find(q('pPr')) is not None
                 and b.find(q('pPr')).find(q('pageBreakBefore')) is not None)

    # --- پاصفحه‌ها ---
    parts['word/footer1.xml'] = footer_xml('none')    # آغازین
    parts['word/footer2.xml'] = footer_xml('abjad')   # ابجد
    parts['word/footer3.xml'] = footer_xml('fa')      # ارقام فارسی

    # --- rels ---
    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    RNS = 'http://schemas.openxmlformats.org/package/2006/relationships'
    have = {r.get('Id') for r in rels}
    FT = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer'
    ids = {}
    for name, target in (('none', 'footer1.xml'), ('abjad', 'footer2.xml'), ('fa', 'footer3.xml')):
        rid = next(r.get('Id') for r in rels if r.get('Target') == target) \
            if any(r.get('Target') == target for r in rels) else None
        if rid is None:
            n = 900
            while f'rId{n}' in have:
                n += 1
            rid = f'rId{n}'; have.add(rid)
            e = etree.SubElement(rels, '{%s}Relationship' % RNS)
            e.set('Id', rid); e.set('Type', FT); e.set('Target', target)
        ids[name] = rid
    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)

    # --- Content_Types ---
    ct = etree.fromstring(parts['[Content_Types].xml'])
    CNS = 'http://schemas.openxmlformats.org/package/2006/content-types'
    known = {o.get('PartName') for o in ct}
    for f in ('/word/footer2.xml', '/word/footer3.xml'):
        if f not in known:
            o = etree.SubElement(ct, '{%s}Override' % CNS)
            o.set('PartName', f)
            o.set('ContentType',
                  'application/vnd.openxmlformats-officedocument.'
                  'wordprocessingml.footer+xml')
    parts['[Content_Types].xml'] = etree.tostring(
        ct, xml_declaration=True, encoding='UTF-8', standalone=True)

    # --- پاک‌سازی sectPr های میانی قبلی ---
    for b in blocks:
        if b.tag != q('p'):
            continue
        ppr = b.find(q('pPr'))
        if ppr is not None:
            for e in ppr.findall(q('sectPr')):
                ppr.remove(e)

    # --- درج مرزها ---
    # بخش ۱: بدون شماره → sectPr در پاراگراف پیش از «فهرست مطالب»
    p1 = blocks[i_toc - 1]
    ppr1 = p1.find(q('pPr'))
    if ppr1 is None:
        ppr1 = etree.Element(q('pPr')); p1.insert(0, ppr1)
    ppr1.append(build_sectPr(final, None, 1, ids['none']))

    # بخش ۲: ابجد → sectPr در پاراگراف پیش از فصل اول
    p2 = blocks[i_ch1 - 1]
    ppr2 = p2.find(q('pPr'))
    if ppr2 is None:
        ppr2 = etree.Element(q('pPr')); p2.insert(0, ppr2)
    ppr2.append(build_sectPr(final, 'arabicAlpha', 1, ids['abjad']))

    # بخش ۳ (پایانی): ارقام فارسی از ۱
    for tag in ('footerReference', 'headerReference', 'pgNumType'):
        for e in final.findall(q(tag)):
            final.remove(e)
    fr = etree.Element(q('footerReference'))
    fr.set(q('type'), 'default'); fr.set(RQ + 'id', ids['fa'])
    final.insert(0, fr)
    pn = etree.SubElement(final, q('pgNumType'))
    pn.set(q('start'), '1')

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    # --- زبان دوسویهٔ سند: ar-SA → fa-IR ---
    # ورد ارقام فیلد PAGE را بر پایهٔ زبان دوسویه نمایش می‌دهد؛ با fa-IR
    # ارقام فارسی (۱۲۳) و با ar-SA ارقام عربی‌شرقی (١٢٣) می‌شوند.
    st = etree.fromstring(parts['word/settings.xml'])
    tfl = st.find(q('themeFontLang'))
    if tfl is None:
        tfl = etree.SubElement(st, q('themeFontLang'))
    tfl.set(q('bidi'), 'fa-IR')
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)

    return dict(bagh=i_toc, abjad_to=i_ch1, ids=ids)


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-v5-autotoc.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-v6-final.docx'
    print('نوشته شد:', dst, process(src, dst))
