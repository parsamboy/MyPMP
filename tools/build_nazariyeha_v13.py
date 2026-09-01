# -*- coding: utf-8 -*-
"""v1.3: درختواره اضطراب مرگ با اشکال ورد."""
import zipfile
from lxml import etree
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_nazariyeha as B
from build_nazariyeha import W, q

SRC = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.2.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.3.docx'

A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
WP = '{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}'
WPS = '{http://schemas.microsoft.com/office/word/2010/wordprocessingShape}'
WPG = '{http://schemas.microsoft.com/office/word/2010/wordprocessingGroup}'


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def emu(i):
    return str(int(i * 914400))


def _box(x, y, w, h, fill, lines, txtcolor='FFFFFF', gold=False, fs='16'):
    if isinstance(lines, str):
        lines = [lines]
    wsp = etree.Element(WPS + 'wsp')
    cnv = etree.SubElement(wsp, WPS + 'cNvSpPr')
    cnv.set('txBox', '1')
    spPr = etree.SubElement(wsp, WPS + 'spPr')
    xfrm = etree.SubElement(spPr, A + 'xfrm')
    off = etree.SubElement(xfrm, A + 'off'); off.set('x', emu(x)); off.set('y', emu(y))
    ext = etree.SubElement(xfrm, A + 'ext'); ext.set('cx', emu(w)); ext.set('cy', emu(h))
    geom = etree.SubElement(spPr, A + 'prstGeom'); geom.set('prst', 'roundRect')
    av = etree.SubElement(geom, A + 'avLst')
    gd = etree.SubElement(av, A + 'gd'); gd.set('name', 'adj'); gd.set('fmla', 'val 16667')
    sf = etree.SubElement(spPr, A + 'solidFill')
    c = etree.SubElement(sf, A + 'srgbClr'); c.set('val', fill)
    ln = etree.SubElement(spPr, A + 'ln'); ln.set('w', '19050' if gold else '6350')
    lnf = etree.SubElement(ln, A + 'solidFill')
    lc = etree.SubElement(lnf, A + 'srgbClr'); lc.set('val', 'C4A35A' if gold else '8AA38A')
    txbx = etree.SubElement(wsp, WPS + 'txbx')
    content = etree.SubElement(txbx, q('txbxContent'))
    for line in lines:
        p = etree.SubElement(content, q('p'))
        pPr = etree.SubElement(p, q('pPr'))
        etree.SubElement(pPr, q('jc')).set(q('val'), 'center')
        etree.SubElement(pPr, q('bidi'))
        sp = etree.SubElement(pPr, q('spacing'))
        sp.set(q('after'), '0'); sp.set(q('before'), '0'); sp.set(q('line'), '240'); sp.set(q('lineRule'), 'auto')
        r = etree.SubElement(p, q('r'))
        rPr = etree.SubElement(r, q('rPr'))
        rf = etree.SubElement(rPr, q('rFonts'))
        rf.set(q('ascii'), 'Times New Roman'); rf.set(q('cs'), 'B Lotus'); rf.set(q('hAnsi'), 'Times New Roman')
        etree.SubElement(rPr, q('sz')).set(q('val'), fs)
        etree.SubElement(rPr, q('szCs')).set(q('val'), fs)
        etree.SubElement(rPr, q('color')).set(q('val'), txtcolor)
        etree.SubElement(rPr, q('rtl')); etree.SubElement(rPr, q('cs'))
        t = etree.SubElement(r, q('t')); t.text = line
    bp = etree.SubElement(wsp, WPS + 'bodyPr')
    bp.set('anchor', 'ctr'); bp.set('lIns', '36000'); bp.set('rIns', '36000')
    bp.set('tIns', '18000'); bp.set('bIns', '18000')
    return wsp


def da_tree_drawing():
    """درختواره اضطراب مرگ: نظریه‌ها + ابعاد/عوامل/پیامدها."""
    wpg = etree.Element(WPG + 'wgp')
    etree.SubElement(wpg, WPG + 'cNvGrpSpPr')
    gsp = etree.SubElement(wpg, WPG + 'grpSpPr')
    xf = etree.SubElement(gsp, A + 'xfrm')
    o = etree.SubElement(xf, A + 'off'); o.set('x', '0'); o.set('y', '0')
    e = etree.SubElement(xf, A + 'ext'); e.set('cx', emu(6.2)); e.set('cy', emu(3.35))
    co = etree.SubElement(xf, A + 'chOff'); co.set('x', '0'); co.set('y', '0')
    ce = etree.SubElement(xf, A + 'chExt'); ce.set('cx', emu(6.2)); ce.set('cy', emu(3.35))
    wpg.append(_box(1.70, 0.06, 2.80, 0.46, '1F4E5F', 'اضطراب مرگ', fs='22'))
    # نظریه‌ها راست به چپ
    theories = [
        (4.62, ['نظریه فروید', 'روان‌تحلیل‌گری']),
        (3.12, ['نظریه یالوم', 'وجودگرایی']),
        (1.62, ['نظریه مدیریت وحشت', 'TMT']),
        (0.12, ['نظریه دلبستگی', 'بالبی']),
    ]
    for x, lines in theories:
        wpg.append(_box(x, 0.72, 1.42, 0.70, '3D5C4A', lines, fs='14'))
    # ردیف پایین
    lower = [
        (4.28, 'ابعاد'),
        (2.38, 'عوامل مؤثر'),
        (0.48, 'پیامدها'),
    ]
    for x, t in lower:
        wpg.append(_box(x, 1.62, 1.70, 0.44, 'F7F4EC', t, '1F4E5F', fs='16'))
    # مفهوم
    wpg.append(_box(2.10, 2.22, 2.00, 0.42, 'F7F4EC', 'مفهوم اضطراب مرگ', '1F4E5F', fs='15'))

    drawing = etree.Element(q('drawing'))
    inline = etree.SubElement(drawing, WP + 'inline')
    inline.set('distT', '0'); inline.set('distB', '0'); inline.set('distL', '0'); inline.set('distR', '0')
    ex = etree.SubElement(inline, WP + 'extent'); ex.set('cx', emu(6.2)); ex.set('cy', emu(3.35))
    ee = etree.SubElement(inline, WP + 'effectExtent')
    for a in ('l', 't', 'r', 'b'):
        ee.set(a, '0')
    docPr = etree.SubElement(inline, WP + 'docPr')
    docPr.set('id', '21'); docPr.set('name', 'DeathAnxietyTree')
    etree.SubElement(inline, WP + 'cNvGraphicFramePr')
    graphic = etree.SubElement(inline, A + 'graphic')
    gd = etree.SubElement(graphic, A + 'graphicData')
    gd.set('uri', 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup')
    gd.append(wpg)
    return drawing


def tree_para():
    p = etree.Element(q('p'))
    pPr = etree.SubElement(p, q('pPr'))
    etree.SubElement(pPr, q('jc')).set(q('val'), 'center')
    etree.SubElement(pPr, q('bidi')).set(q('val'), '0')
    r = etree.SubElement(p, q('r'))
    r.append(da_tree_drawing())
    return p


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    target = None
    for p in body.iter(q('p')):
        if (style_of(p) or '') == 'Heading2' and ptext(p).strip().startswith('۲-۲-'):
            target = p
            break
    if target is None:
        raise SystemExit('heading 2-2 not found')
    parent = target.getparent()
    idx = list(parent).index(target)
    parent.insert(idx + 1, tree_para())
    parent.insert(idx + 2, B.caption_para(
        'شکل ۲- درختواره اضطراب مرگ (نظریه‌ها، ابعاد، عوامل و پیامدها)', green=True))
    print('inserted after', ptext(target))

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST)


if __name__ == '__main__':
    build()
