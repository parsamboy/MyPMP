# -*- coding: utf-8 -*-
"""v1.5: درختواره اضطراب سلامت و پیشینه + غنی‌سازی بقیهٔ فصل ۲."""
import zipfile
from lxml import etree
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_nazariyeha as B
from build_nazariyeha import W, q, pd

SRC = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.4.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.5.docx'

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
        sp.set(q('after'), '0'); sp.set(q('before'), '0')
        sp.set(q('line'), '240'); sp.set(q('lineRule'), 'auto')
        r = etree.SubElement(p, q('r'))
        rPr = etree.SubElement(r, q('rPr'))
        rf = etree.SubElement(rPr, q('rFonts'))
        rf.set(q('ascii'), 'Times New Roman'); rf.set(q('cs'), 'B Lotus')
        rf.set(q('hAnsi'), 'Times New Roman')
        etree.SubElement(rPr, q('sz')).set(q('val'), fs)
        etree.SubElement(rPr, q('szCs')).set(q('val'), fs)
        etree.SubElement(rPr, q('color')).set(q('val'), txtcolor)
        etree.SubElement(rPr, q('rtl')); etree.SubElement(rPr, q('cs'))
        t = etree.SubElement(r, q('t')); t.text = line
    bp = etree.SubElement(wsp, WPS + 'bodyPr')
    bp.set('anchor', 'ctr'); bp.set('lIns', '36000'); bp.set('rIns', '36000')
    bp.set('tIns', '18000'); bp.set('bIns', '18000')
    return wsp


def make_drawing(wpg, cx, cy, name, doc_id):
    drawing = etree.Element(q('drawing'))
    inline = etree.SubElement(drawing, WP + 'inline')
    inline.set('distT', '0'); inline.set('distB', '0'); inline.set('distL', '0'); inline.set('distR', '0')
    ex = etree.SubElement(inline, WP + 'extent'); ex.set('cx', emu(cx)); ex.set('cy', emu(cy))
    ee = etree.SubElement(inline, WP + 'effectExtent')
    for a in ('l', 't', 'r', 'b'):
        ee.set(a, '0')
    docPr = etree.SubElement(inline, WP + 'docPr')
    docPr.set('id', str(doc_id)); docPr.set('name', name)
    etree.SubElement(inline, WP + 'cNvGraphicFramePr')
    graphic = etree.SubElement(inline, A + 'graphic')
    gd = etree.SubElement(graphic, A + 'graphicData')
    gd.set('uri', 'http://schemas.microsoft.com/office/word/2010/wordprocessingGroup')
    gd.append(wpg)
    p = etree.Element(q('p'))
    pPr = etree.SubElement(p, q('pPr'))
    etree.SubElement(pPr, q('jc')).set(q('val'), 'center')
    etree.SubElement(pPr, q('bidi')).set(q('val'), '0')
    r = etree.SubElement(p, q('r'))
    r.append(drawing)
    return p


def group(cx, cy):
    wpg = etree.Element(WPG + 'wgp')
    etree.SubElement(wpg, WPG + 'cNvGrpSpPr')
    gsp = etree.SubElement(wpg, WPG + 'grpSpPr')
    xf = etree.SubElement(gsp, A + 'xfrm')
    o = etree.SubElement(xf, A + 'off'); o.set('x', '0'); o.set('y', '0')
    e = etree.SubElement(xf, A + 'ext'); e.set('cx', emu(cx)); e.set('cy', emu(cy))
    co = etree.SubElement(xf, A + 'chOff'); co.set('x', '0'); co.set('y', '0')
    ce = etree.SubElement(xf, A + 'chExt'); ce.set('cx', emu(cx)); ce.set('cy', emu(cy))
    return wpg


def ha_tree_para():
    wpg = group(6.2, 3.45)
    wpg.append(_box(1.70, 0.06, 2.80, 0.44, '1F4E5F', 'اضطراب سلامت', fs='22'))
    wpg.append(_box(4.28, 0.68, 1.75, 0.44, '3D5C4A', 'مفهوم', fs='16'))
    wpg.append(_box(2.22, 0.68, 1.75, 0.44, '3D5C4A', 'مدل‌های نظری', fs='16'))
    wpg.append(_box(0.18, 0.68, 1.75, 0.44, '3D5C4A', 'سالمندی', fs='16'))
    models = [
        (4.28, ['شناختی-رفتاری']),
        (2.22, ['زیستی-روانی-', 'اجتماعی']),
        (0.18, ['دلبستگی']),
    ]
    for x, lines in models:
        wpg.append(_box(x, 1.30, 1.75, 0.62, 'F7F4EC', lines, '1F4E5F', fs='14'))
    wpg.append(_box(3.30, 2.12, 2.20, 0.44, 'F7F4EC', 'عوامل زمینه‌ساز', '1F4E5F', fs='15'))
    wpg.append(_box(0.70, 2.12, 2.20, 0.44, 'F7F4EC', 'مداخلات', '1F4E5F', fs='15'))
    return make_drawing(wpg, 6.2, 3.45, 'HealthAnxietyTree', 23)


def lit_tree_para():
    wpg = group(6.2, 2.05)
    wpg.append(_box(1.70, 0.08, 2.80, 0.46, '1F4E5F', 'پیشینه پژوهش', fs='22'))
    wpg.append(_box(3.35, 0.78, 2.30, 0.50, '3D5C4A', 'پیشینه داخلی', fs='18'))
    wpg.append(_box(0.55, 0.78, 2.30, 0.50, '3D5C4A', 'پیشینه خارجی', fs='18'))
    return make_drawing(wpg, 6.2, 2.05, 'LiteratureTree', 24)


def insert_after_heading(body, heading_start, items):
    target = None
    for p in body.iter(q('p')):
        if (style_of(p) or '').startswith('Heading') and ptext(p).strip().startswith(heading_start):
            if (style_of(p) or '') in ('Heading1', 'Heading2'):
                target = p
                break
    if target is None:
        raise SystemExit('not found ' + heading_start)
    parent = target.getparent()
    idx = list(parent).index(target)
    for i, el in enumerate(items):
        parent.insert(idx + 1 + i, el)
    print('inserted after', ptext(target)[:40])


def insert_green_after(body, startswith, para_el, used):
    kids = list(body)
    for i, p in enumerate(kids):
        if p.tag != q('p'):
            continue
        t = ptext(p)
        if t.startswith(startswith) and startswith not in used:
            parent = p.getparent()
            idx = list(parent).index(p)
            parent.insert(idx + 1, para_el)
            used.add(startswith)
            print('green after', startswith[:40])
            return True
    print('MISS', startswith[:40])
    return False


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    H = B.para

    insert_after_heading(body, '۲-۴-', [
        ha_tree_para(),
        B.caption_para('شکل ۴- درختواره اضطراب سلامت (مفهوم، مدل‌های نظری، عوامل و مداخلات)', green=True),
    ])
    insert_after_heading(body, '۲-۵-', [
        lit_tree_para(),
        B.caption_para('شکل ۵- درختواره پیشینه پژوهش (داخلی و خارجی)', green=True),
    ])

    used = set()
    greens = [
        ('اضطراب سلامت را می‌توان از منظر شناختی',
         H('Normal', [
             'در طبقه‌بندی‌های جدید، اضطراب سلامت در یک پیوستار دیده می‌شود؛ از نگرانی طبیعی تا اختلال اضطراب بیماری در DSM-5-TR. این تمایز برای سالمندان اهمیت دارد، چون نشانه‌های جسمانی واقعی با تفسیر فاجعه‌آمیز همپوشانی پیدا می‌کنند (انجمن روان‌پزشکی آمریکا، ',
             pd('2022؛ کیکاس و همکاران، 2024).'),
         ], green=True)),
        ('مدل شناختی ـ رفتاری اضطراب سلامت بیان می‌کند',
         H('Normal', [
             'مرورهای اخیر همچنان درمان شناختی-رفتاری را مداخلهٔ اصلی اضطراب سلامت می‌دانند و بر کاهش رفتارهای ایمنی‌بخش و اصلاح تفسیر فاجعه‌آمیز نشانه‌های بدنی تأکید می‌کنند (آبراموویتز و برادوک، ',
             pd('2023؛ انجمن روان‌شناسی آمریکا، 2023).'),
         ], green=True)),
        ('مدل زیستی ـ روانی ـ اجتماعی بر این فرض استوار است',
         H('Normal', [
             'این مدل با رویکرد معاصر سالمندی سالم نیز همخوان است که سلامت را حاصل تعامل ظرفیت درونی فرد و ویژگی‌های محیطی می‌داند و مداخله را به یک بُعد زیستی محدود نمی‌کند (سازمان جهانی بهداشت، ',
             pd('2020؛ سازمان جهانی بهداشت، 2024).'),
         ], green=True)),
        ('مدل دلبستگی بر این فرض استوار است که سبک‌های دلبستگی ناایمن',
         H('Normal', [
             'از منظر سالمندی، دلبستگی ناایمن می‌تواند با اطمینان‌خواهی مکرر پزشکی و ادراک تهدید بدنی همراه شود و چرخه اضطراب سلامت را پایدار کند (چاریکچی‌اوزگول و ایشیک، ',
             pd('2024).'),
         ], green=True)),
        ('اضطراب سلامت ممکن است در دوره سالمندی تحت تأثیر افزایش تجربه بیماری',
         H('Normal', [
             'این شواهد نشان می‌دهد اضطراب سلامت در سالمندی را باید در کنار بیماری‌های مزمن، تنهایی و کاهش حمایت اجتماعی دید؛ نه صرفاً به‌عنوان نگرانی افراطی جدا از بافت زندگی (سازمان جهانی بهداشت، ',
             pd('2024؛ شفیعی و همکاران، 2025).'),
         ], green=True)),
        ('مداخلات شناختی از مؤثرترین رویکردهای روان‌شناختی در کاهش اضطراب',
         H('Normal', [
             'شواهد جدیدتر از ترکیب درمان شناختی-رفتاری با آرام‌سازی، حمایت اجتماعی و مداخلات معنوی در کاهش اضطراب سالمندان حمایت می‌کنند و بر مداخله چندسطحی تأکید دارند (سازمان جهانی بهداشت، ',
             pd('2024؛ انجمن روان‌شناسی آمریکا، 2023).'),
         ], green=True)),
    ]
    for start, el in greens:
        insert_green_after(body, start, el, used)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST, 'greens', len(used))


if __name__ == '__main__':
    build()
