# -*- coding: utf-8 -*-
"""v1.41 از v1.4: پر کردن فهرست اشکال با چهار درختواره، قالب فهرست جداول."""
import os
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import ptext, q, style_of

SRC = 'MasterThesis-Fatemeh-Bayat-v1.4.docx'
DST = 'MasterThesis-Fatemeh-Bayat-v1.41.docx'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

# شماره صفحه از سرفصل نزدیک در فهرست مطالب
FIGS = [
    ('شکل ۱- درختواره نظریه‌های سالمندی (شاخه زیست‌شناختی، روان‌شناختی و جامعه‌شناختی)',
     '_TocFig001', '14'),
    ('شکل ۲- درختواره اضطراب مرگ (نظریه‌ها، ابعاد، عوامل و پیامدها)',
     '_TocFig002', '21'),
    ('شکل ۳- درختواره هوش معنوی (مفهوم، فضیلت‌گرایی، عوامل و مدل چهارعاملی کینگ)',
     '_TocFig003', '26'),
    ('شکل ۴- درختواره اضطراب سلامت (مفهوم، مدل‌های نظری، عوامل و مداخلات)',
     '_TocFig004', '33'),
]


def freeze_xml(el):
    return etree.tostring(el)


def r_el(children_tag=None):
    r = etree.Element(q('r'))
    rpr = etree.SubElement(r, q('rPr'))
    etree.SubElement(rpr, q('noProof'))
    return r, rpr


def make_tof_entry(title, anchor, page):
    p = etree.Element(q('p'))
    ppr = etree.SubElement(p, q('pPr'))
    ps = etree.SubElement(ppr, q('pStyle'))
    ps.set(q('val'), 'TableofFigures')
    tabs = etree.SubElement(ppr, q('tabs'))
    tb = etree.SubElement(tabs, q('tab'))
    tb.set(q('val'), 'right')
    tb.set(q('leader'), 'dot')
    tb.set(q('pos'), '8788')

    hl = etree.SubElement(p, q('hyperlink'))
    hl.set(q('anchor'), anchor)
    hl.set(q('history'), '1')

    r = etree.SubElement(hl, q('r'))
    rpr = etree.SubElement(r, q('rPr'))
    st = etree.SubElement(rpr, q('rStyle'))
    st.set(q('val'), 'Hyperlink')
    etree.SubElement(rpr, q('noProof'))
    te = etree.SubElement(r, q('t'))
    te.set(XML_SPACE, 'preserve')
    te.text = title

    rtab = etree.SubElement(hl, q('r'))
    rp = etree.SubElement(rtab, q('rPr'))
    etree.SubElement(rp, q('noProof'))
    wh = etree.SubElement(rp, q('webHidden'))
    etree.SubElement(rtab, q('tab'))

    def hidden_r():
        rr = etree.SubElement(hl, q('r'))
        rpr = etree.SubElement(rr, q('rPr'))
        etree.SubElement(rpr, q('noProof'))
        etree.SubElement(rpr, q('webHidden'))
        rtl = etree.SubElement(rpr, q('rtl'))
        rtl.set(q('val'), '0')
        return rr

    r = hidden_r()
    fc = etree.SubElement(r, q('fldChar'))
    fc.set(q('fldCharType'), 'begin')
    fc.set(q('dirty'), 'true')
    r = hidden_r()
    it = etree.SubElement(r, q('instrText'))
    it.set(XML_SPACE, 'preserve')
    it.text = ' PAGEREF %s \\h ' % anchor
    r = hidden_r()
    etree.SubElement(r, q('fldChar')).set(q('fldCharType'), 'separate')
    r = etree.SubElement(hl, q('r'))
    rpr = etree.SubElement(r, q('rPr'))
    etree.SubElement(rpr, q('noProof'))
    etree.SubElement(rpr, q('webHidden'))
    te = etree.SubElement(r, q('t'))
    te.text = page
    r = hidden_r()
    etree.SubElement(r, q('fldChar')).set(q('fldCharType'), 'end')
    return p


def style_fig_heading(p, template):
    """عنوان فهرست اشکال را شبیه فهرست جداول کن."""
    tppr = template.find(q('pPr'))
    ppr = p.find(q('pPr'))
    if ppr is not None:
        p.remove(ppr)
    if tppr is not None:
        p.insert(0, etree.fromstring(etree.tostring(tppr)))
    # متن
    for child in list(p):
        if child.tag != q('pPr'):
            p.remove(child)
    # کپی ران عنوان از الگو با متن جدید
    tr = template.find(q('r'))
    r = etree.fromstring(etree.tostring(tr)) if tr is not None else etree.SubElement(p, q('r'))
    for t in r.iter(q('t')):
        t.text = 'فهرست اشکال'
    if r.getparent() is None:
        p.append(r)


def add_bookmark(p, name, bid):
    if any(b.get(q('name')) == name for b in p.iter(q('bookmarkStart'))):
        return
    bs = etree.Element(q('bookmarkStart'))
    bs.set(q('id'), str(bid))
    bs.set(q('name'), name)
    be = etree.Element(q('bookmarkEnd'))
    be.set(q('id'), str(bid))
    ppr = p.find(q('pPr'))
    if ppr is not None:
        ppr.addnext(bs)
    else:
        p.insert(0, bs)
    p.append(be)


def close_open_fld_on(p):
    types = [fc.get(q('fldCharType')) for fc in p.iter(q('fldChar'))]
    if types.count('begin') > types.count('end'):
        r = etree.SubElement(p, q('r'))
        etree.SubElement(r, q('fldChar')).set(q('fldCharType'), 'end')
        return True
    return False


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    kids = list(body)

    def find_i(pred):
        for i, el in enumerate(kids):
            if el.tag == q('p') and pred(ptext(el)):
                return i
        return None

    i_toc = find_i(lambda t: t.strip() == 'فهرست مطالب')
    i_pnu = find_i(lambda t: 'Payame Noor University' in t)
    front = [freeze_xml(el) for el in kids[:i_toc]]
    last = [freeze_xml(el) for el in kids[i_pnu:]]

    i_tbl_h = find_i(lambda t: t.strip() == 'فهرست جداول')
    i_fig_h = find_i(lambda t: t.strip() == 'فهرست اشکال')
    if i_fig_h is None or i_tbl_h is None:
        raise SystemExit('فهرست جداول/اشکال پیدا نشد')

    style_fig_heading(kids[i_fig_h], kids[i_tbl_h])

    # بوکمارک روی کپشن شکل‌ها
    mx = 0
    for b in doc.iter(q('bookmarkStart')):
        try:
            mx = max(mx, int(b.get(q('id') or '0')))
        except ValueError:
            pass
    bid = mx + 1
    n_bm = 0
    for title, name, _page in FIGS:
        prefix = title.split('-')[0].strip()  # شکل ۱
        for p in body.iter(q('p')):
            if (style_of(p) or '') != 'Caption':
                continue
            t = ptext(p).strip()
            if t.startswith(prefix) and 'درختواره' in t:
                add_bookmark(p, name, bid)
                bid += 1
                n_bm += 1
                break
    print('bookmarks', n_bm)

    # بستن فیلد فهرست جداول اگر هنوز باز است
    # آخرین ردیف جدول قبل از عنوان اشکال
    last_tbl = None
    for i in range(i_fig_h - 1, i_tbl_h, -1):
        if kids[i].tag == q('p') and (style_of(kids[i]) or '') == 'TableofFigures':
            last_tbl = kids[i]
            break
    if last_tbl is not None:
        r = etree.SubElement(last_tbl, q('r'))
        etree.SubElement(r, q('fldChar')).set(q('fldCharType'), 'end')
        print('closed table TOC field')

    # حذف پاراگراف‌های خالی فیلد بعد از عنوان اشکال
    to_del = []
    for el in list(body)[i_fig_h + 1:]:
        if el.tag != q('p'):
            break
        st = style_of(el) or ''
        t = ptext(el).strip()
        if st == 'TableofFigures' and not t:
            to_del.append(el)
            continue
        break
    for el in to_del:
        body.remove(el)
    print('removed empty', len(to_del))

    # درج ردیف‌های فهرست
    anchor = kids[i_fig_h]
    prev = anchor
    for title, name, page in FIGS:
        np = make_tof_entry(title, name, page)
        prev.addnext(np)
        prev = np
    print('entries', len(FIGS))

    kids2 = list(body)
    i_toc2 = i_pnu2 = None
    for i, el in enumerate(kids2):
        if el.tag != q('p'):
            continue
        tt = ptext(el)
        if tt.strip() == 'فهرست مطالب':
            i_toc2 = i
        if 'Payame Noor University' in tt:
            i_pnu2 = i
    if [freeze_xml(el) for el in kids2[:i_toc2]] != front:
        raise SystemExit('front changed')
    if [freeze_xml(el) for el in kids2[i_pnu2:]] != last:
        raise SystemExit('last changed')
    print('freeze OK')

    # تأیید
    seen = [ptext(p).strip() for p in body.iter(q('p'))]
    i = seen.index('فهرست اشکال')
    print('after heading:', seen[i + 1:i + 6])

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
