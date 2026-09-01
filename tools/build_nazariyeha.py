# -*- coding: utf-8 -*-
"""فایل جداگانه: نظریه‌های سالمندی + SST + غنی‌سازی + درختواره + فهرست + پانویس + منابع."""
import copy, shutil, zipfile
from lxml import etree

SRC = 'Payannameh-Fatemeh-Bayat-v1.9.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.1.docx'
IMG = 'tools/tree_theories_draft.png'
GREEN = '1B7A3D'  # مطالب جدید برای بازبینی

NSMAP = {
    'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'pic': 'http://schemas.openxmlformats.org/drawingml/2006/picture',
}
W = '{%s}' % NSMAP['w']
R = '{%s}' % NSMAP['r']
def q(t): return W + t

PD = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
def pd(s):
    return s.translate(PD)


def el(tag, attrib=None, text=None):
    e = etree.Element(q(tag))
    if attrib:
        for k, v in attrib.items():
            e.set(q(k) if not k.startswith('{') else k, v)
    if text is not None:
        e.text = text
    return e


def rpr_body(rtl=True, green=False):
    rpr = el('rPr')
    rf = el('rFonts', {
        'ascii': 'Times New Roman', 'hAnsi': 'Times New Roman',
        'eastAsia': 'Times New Roman', 'cs': 'B Lotus'})
    rpr.append(rf)
    if green:
        rpr.append(el('color', {'val': GREEN}))
    rpr.append(el('sz', {'val': '28'}))
    rpr.append(el('szCs', {'val': '28'}))
    if rtl:
        rpr.append(el('rtl'))
        rpr.append(el('cs'))
        lang = el('lang', {'bidi': 'fa-IR', 'val': 'en-US'})
    else:
        rpr.append(el('rtl', {'val': '0'}))
        rpr.append(el('cs', {'val': '0'}))
        lang = el('lang', {'val': 'en-US'})
    rpr.append(lang)
    return rpr


def rpr_fnmark(green=False):
    rpr = el('rPr')
    rpr.append(el('rFonts', {
        'ascii': 'Times New Roman', 'hAnsi': 'Times New Roman',
        'eastAsia': 'Times New Roman', 'cs': 'Times New Roman'}))
    rpr.append(el('rStyle', {'val': 'FootnoteReference'}))
    if green:
        rpr.append(el('color', {'val': GREEN}))
    rpr.append(el('sz', {'val': '20'}))
    rpr.append(el('szCs', {'val': '20'}))
    rpr.append(el('vertAlign', {'val': 'superscript'}))
    rpr.append(el('rtl', {'val': '0'}))
    rpr.append(el('cs', {'val': '0'}))
    rpr.append(el('lang', {'val': 'en-US'}))
    return rpr


def ppr(style=None, jc=None, bidi='1', extra=None):
    p = el('pPr')
    if style:
        p.append(el('pStyle', {'val': style}))
    if bidi is not None:
        p.append(el('bidi', {'val': bidi}))
    p.append(el('spacing', {'after': '120', 'line': '276', 'lineRule': 'auto'}))
    if jc:
        p.append(el('jc', {'val': jc}))
    if extra:
        for e in extra:
            p.append(e)
    return p


def run(text, rtl=True, bold=False, green=False):
    r = el('r')
    rp = rpr_body(rtl=rtl, green=green)
    if bold:
        rp.insert(1, el('b'))
        rp.insert(2, el('bCs'))
    r.append(rp)
    t = el('t', text=text)
    if text.startswith(' ') or text.endswith(' '):
        t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    r.append(t)
    return r


def fn_run(fid, green=False):
    r = el('r')
    r.append(rpr_fnmark(green=green))
    r.append(el('footnoteReference', {'id': str(fid)}))
    return r


def para(style, parts, jc=None, bidi='1', page_break=False, green=False):
    """parts: str or ('fn', id) tuples."""
    p = el('p')
    extra = []
    if page_break:
        extra.append(el('pageBreakBefore'))
    jc = jc or ('left' if bidi == '0' else 'right')
    p.append(ppr(style, jc=jc, bidi=bidi, extra=extra))
    if isinstance(parts, str):
        parts = [parts]
    bold = bool(style and style.startswith('Heading'))
    rtl = (bidi != '0')
    for item in parts:
        if isinstance(item, tuple) and item[0] == 'fn':
            p.append(fn_run(item[1], green=green))
        else:
            p.append(run(item, rtl=rtl, bold=bold, green=green))
    return p


def caption_para(text, green=False):
    p = el('p')
    p.append(ppr('Caption', jc='right', bidi='1', extra=[el('keepNext')]))
    p.append(run(text, rtl=True, bold=True, green=green))
    return p


def image_para(rid, cx, cy):
    p = el('p')
    p.append(ppr(None, jc='center', bidi='0'))
    r = el('r')
    r.append(rpr_body(rtl=False))
    drawing = etree.fromstring(
        '''<w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
              xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
              xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
              xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
              xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="{cx}" cy="{cy}"/>
            <wp:effectExtent l="0" t="0" r="0" b="0"/>
            <wp:docPr id="10" name="tree" descr="درختواره نظریه‌های سالمندی"/>
            <wp:cNvGraphicFramePr>
              <a:graphicFrameLocks noChangeAspect="1"/>
            </wp:cNvGraphicFramePr>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic>
                  <pic:nvPicPr>
                    <pic:cNvPr id="0" name="tree.png"/>
                    <pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr>
                  </pic:nvPicPr>
                  <pic:blipFill>
                    <a:blip r:embed="{rid}"/>
                    <a:stretch><a:fillRect/></a:stretch>
                  </pic:blipFill>
                  <pic:spPr bwMode="auto">
                    <a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
                    <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                  </pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>'''.format(cx=cx, cy=cy, rid=rid)
    )
    r.append(drawing)
    p.append(r)
    return p


def hyperlink_run(text, rid, green=False):
    h = etree.Element(q('hyperlink'))
    h.set(R + 'id', rid)
    h.set(q('history'), '1')
    r = el('r')
    rp = rpr_body(rtl=False, green=green)
    rp.insert(1, el('rStyle', {'val': 'Hyperlink'}))
    r.append(rp)
    t = el('t', text=text)
    t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    r.append(t)
    h.append(r)
    return h


def bib_para(parts, green=False):
    """parts mix of str and ('url', rid, text)."""
    p = el('p')
    p.append(ppr('Bibliography', jc='left', bidi='0'))
    for item in parts:
        if isinstance(item, tuple) and item[0] == 'url':
            p.append(hyperlink_run(item[2], item[1], green=green))
        else:
            p.append(run(item, rtl=False, green=green))
    return p


def footnote_el(fid, text):
    f = el('footnote', {'id': str(fid)})
    p = el('p')
    p.append(ppr('FootnoteText', jc='left', bidi='0'))
    r1 = el('r')
    r1.append(rpr_fnmark())
    r1.append(el('footnoteRef'))
    p.append(r1)
    r2 = el('r')
    rp = rpr_body(rtl=False)
    # footnote body 9pt as thesis
    for child in list(rp):
        if child.tag in (q('sz'), q('szCs')):
            rp.remove(child)
    rp.append(el('sz', {'val': '18'}))
    rp.append(el('szCs', {'val': '20'}))
    r2.append(rp)
    t = el('t', text=' ' + text)
    t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    r2.append(t)
    p.append(r2)
    f.append(p)
    return f


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()

    # image
    img = open(IMG, 'rb').read()
    parts['word/media/tree_theories.png'] = img
    # 1312x816 -> fit ~5.9in
    cx, cy = 5486400, 3411900

    # rels: add image + doi hyperlinks
    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
    existing = {rel.get('Id') for rel in rels}
    def add_rel(rid, typ, target, external=False):
        if rid in existing:
            return
        rel = etree.SubElement(rels, '{%s}Relationship' % REL_NS)
        rel.set('Id', rid)
        rel.set('Type', typ)
        rel.set('Target', target)
        if external:
            rel.set('TargetMode', 'External')
        existing.add(rid)

    add_rel('rIdTree', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
            'media/tree_theories.png')
    dois = {
        'rIdDoiSST99': 'https://doi.org/10.1037/0003-066X.54.3.165',
        'rIdDoiSST06': 'https://doi.org/10.1126/science.1127488',
        'rIdDoiSST21': 'https://doi.org/10.1093/geront/gnab116',
        'rIdDoiReed': 'https://doi.org/10.1037/a0035194',
        'rIdDoiFran': 'https://doi.org/10.1038/s41574-018-0059-4',
        'rIdDoiLopez': 'https://doi.org/10.1016/j.cell.2022.11.001',
        'rIdDoiWest': 'https://doi.org/10.1093/geronb/gbv062',
        'rIdDoiRowe': 'https://doi.org/10.1093/geronb/gbv025',
    }
    for rid, url in dois.items():
        add_rel(rid, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
                url, external=True)
    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)

    ct = etree.fromstring(parts['[Content_Types].xml'])
    # png default already exists in v1.9
    parts['[Content_Types].xml'] = etree.tostring(
        ct, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- footnotes ----
    FN = {
        1: 'Gerontology',
        2: 'World Health Organization',
        3: 'Immunological Theory of Aging',
        4: 'Nikolich-Žugich',
        5: 'Fülöp',
        6: 'Inflammaging',
        7: 'Franceschi',
        8: 'López-Otín',
        9: 'Campisi',
        10: 'Gladyshev',
        11: 'Gould',
        12: 'Levinson',
        13: 'Schaie',
        14: 'Erikson',
        15: 'Kivnick',
        16: 'Westerhof, Bohlmeijer & McAdams',
        17: 'Socioemotional Selectivity Theory',
        18: 'Carstensen',
        19: 'Isaacowitz',
        20: 'Charles',
        21: 'positivity effect',
        22: 'Reed, Chan & Mikels',
        23: 'Disengagement Theory',
        24: 'Cumming & Henry',
        25: 'Atchley',
        26: 'Activity Theory',
        27: 'Havighurst',
        28: 'Neugarten & Tobin',
        29: 'Rowe & Kahn',
        30: 'Dowd',
        31: 'Continuity Theory',
    }

    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    # keep separator / continuation
    keep = [f for f in fn_root.findall(q('footnote')) if f.get(q('type'))]
    for f in list(fn_root.findall(q('footnote'))):
        fn_root.remove(f)
    for f in keep:
        fn_root.append(f)
    for fid, txt in FN.items():
        fn_root.append(footnote_el(fid, txt))
    parts['word/footnotes.xml'] = etree.tostring(
        fn_root, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- document ----
    old = etree.fromstring(parts['word/document.xml'])
    sect = copy.deepcopy(old[0].find(q('sectPr')))
    body = etree.Element(q('body'))

    H = para
    blocks = []

    blocks.append(H('Heading1', 'نظریه‌های سالمندی', page_break=False))
    blocks.append(image_para('rIdTree', cx, cy))
    blocks.append(caption_para('شکل ۱- درختواره نظریه‌های سالمندی (شاخه زیست‌شناختی، روان‌شناختی و جامعه‌شناختی)', green=True))

    blocks.append(H('Heading2', 'فهرست مطالب'))
    toc = [
        ('TOC1', 'نظریه‌های سالمندی'),
        ('TOC3', '۲-۱-۲- نظریه‌های سالمندی'),
        ('TOC4', '۲-۱-۲-۱- نظریه‌های زیست‌شناختی'),
        ('TOC5', '۲-۱-۲-۱-۱- نظریه ایمنی'),
        ('TOC5', '۲-۱-۲-۱-۲- نظریه پیر شدن سلولی'),
        ('TOC5', '۲-۱-۲-۱-۳- نظریه رادیکال آزاد'),
        ('TOC4', '۲-۱-۲-۲- نظریه‌های روان‌شناختی'),
        ('TOC5', '۲-۱-۲-۲-۱- نظریه گولد'),
        ('TOC5', '۲-۱-۲-۲-۲- نظریه لوینسون و شی'),
        ('TOC5', '۲-۱-۲-۲-۳- نظریه اریکسون'),
        ('TOC5', '۲-۱-۲-۲-۴- نظریه انتخاب اجتماعی-هیجانی'),
        ('TOC4', '۲-۱-۲-۳- نظریه‌های جامعه‌شناختی'),
        ('TOC5', '۲-۱-۲-۳-۱- نظریه عدم تعهد'),
        ('TOC5', '۲-۱-۲-۳-۲- نظریه فعالیت'),
        ('TOC5', '۲-۱-۲-۳-۳- نظریه مبادله یا تعامل'),
        ('TOC5', '۲-۱-۲-۳-۴- نظریه استمرار'),
        ('TOC1', 'منابع فارسی'),
        ('TOC1', 'منابع لاتین'),
    ]
    for st, t in toc:
        blocks.append(H(st, t, green=('۲-۱-۲-۲-۴' in t)))

    blocks.append(H('Heading3', '۲-۱-۲- نظریه‌های سالمندی', page_break=True))
    blocks.append(H('Normal', [
        'ژرونتولوژی', ('fn', 1),
        ' یا علم پیرشناسی، شاخه‌ای میان‌رشته‌ای از علوم است که فرایند سالمندی را از ابعاد زیستی، روان‌شناختی و اجتماعی مورد مطالعه قرار می‌دهد. این علم به بررسی تغییرات مرتبط با افزایش سن، عوامل مؤثر بر سالمندی، پیامدهای جسمی، روانی و اجتماعی آن و همچنین راهکارهای ارتقای سلامت و کیفیت زندگی سالمندان می‌پردازد. پژوهشگران حوزه سالمندشناسی با تبیین سازوکارهای سالمندی و شناسایی عوامل مؤثر بر آن، در تلاش‌اند تا زمینه دستیابی به سالمندی سالم، حفظ توانمندی‌های عملکردی و ارتقای کیفیت زندگی سالمندان را فراهم کنند. همچنین، نظریه‌های مختلف سالمندی با رویکردهای زیستی، روان‌شناختی و اجتماعی برای تبیین علل و پیامدهای این فرایند ارائه شده‌اند (سازمان جهانی بهداشت',
        ('fn', 2),
        pd('، 2023؛ سازمان جهانی بهداشت، 2020).'),
    ]))
    blocks.append(H('Normal',
        'در ادامه، این نظریه‌ها در سه شاخه زیست‌شناختی، روان‌شناختی و جامعه‌شناختی مرور می‌شوند. شکل ۱ درختواره همین طبقه‌بندی را نشان می‌دهد و نظریه انتخاب اجتماعی-هیجانی را نیز در میان نظریه‌های روان‌شناختی جای داده است.',
        green=True))

    blocks.append(H('Heading4', '۲-۱-۲-۱- نظریه‌های زیست‌شناختی'))
    blocks.append(H('Normal', 'نظریه‌های زیست‌شناختی به سه دسته تقسیم می‌شوند:'))

    blocks.append(H('Heading5', '۲-۱-۲-۱-۱- نظریه ایمنی'))
    blocks.append(H('Normal', [
        'بر اساس نظریه ایمنی', ('fn', 3),
        ' پیری تا حدی نتیجه تغییرات تدریجی در عملکرد سیستم ایمنی بدن است. سیستم ایمنی وظیفه شناسایی و حذف عوامل بیماری‌زا مانند ویروس‌ها، باکتری‌ها، قارچ‌ها و همچنین سلول‌های غیرطبیعی از جمله سلول‌های توموری را بر عهده دارد. با افزایش سن، کارایی سیستم ایمنی کاهش یافته و پدیده‌ای به نام پیری ایمنی رخ می‌دهد که با کاهش پاسخ ایمنی، افزایش استعداد ابتلا به عفونت‌ها، سرطان و بیماری‌های مزمن همراه است. علاوه بر این، در سالمندی احتمال بروز پاسخ‌های خودایمنی و التهاب مزمن نیز افزایش می‌یابد که می‌تواند به آسیب بافت‌های سالم بدن منجر شود. اگرچه نظریه ایمنی بخشی از فرایند سالمندی را تبیین می‌کند، اما به‌تنهایی قادر به توضیح همه جنبه‌های پیچیده پیری نیست و امروزه در کنار سایر نظریه‌های زیستی مورد بررسی قرار می‌گیرد (نیکولاس و همکاران',
        ('fn', 4), pd('، 2023؛ فولپ و همکاران'), ('fn', 5), pd('، 2023).'),
    ]))
    blocks.append(H('Normal', [
        'در پژوهش‌های سال‌های اخیر، مفهوم «التهاب پیری» یا اینفلامجینگ', ('fn', 6),
        ' به محور تبیین ایمنی‌شناختی سالمندی بدل شده است. اینفلامجینگ به التهاب مزمن، خفیف و استریل گفته می‌شود که با افزایش سن و در نبود عفونت آشکار پدید می‌آید و با پیری ایمنی درهم‌تنیده است. این دیدگاه ایمنی‌متابولیک نشان می‌دهد که بازآرایی دستگاه ایمنی در طول عمر، همزمان می‌تواند مقاومت در برابر برخی تهدیدها را حفظ کند و زمینه بیماری‌های وابسته به سن را فراهم آورد. از همین‌رو، نظریه‌های معاصر ایمنی و التهاب را نه دو فرایند جدا، بلکه دو روی یک سکه می‌دانند (فرانچسکی و همکاران',
        ('fn', 7), pd('، 2018؛ فولپ و همکاران، 2023).'),
    ], green=True))

    blocks.append(H('Heading5', '۲-۱-۲-۱-۲- نظریه پیر شدن سلولی'))
    blocks.append(H('Normal', [
        'بر اساس نظریه پیری سلولی، سالمندی نتیجه تجمع تدریجی آسیب‌های مولکولی و سلولی، به‌ویژه در ماده ژنتیکی سلول‌ها (DNA)، است. در طول زندگی، عوامل درونی و محیطی موجب بروز آسیب در DNA و سایر اجزای سلول می‌شوند و با کاهش توانایی سیستم‌های ترمیم DNA، این آسیب‌ها به‌تدریج انباشته می‌شوند. در نتیجه، عملکرد طبیعی سلول‌ها مختل شده و ظرفیت تکثیر و بازسازی آن‌ها کاهش می‌یابد. علاوه بر این، کوتاه شدن تلومرها، تغییرات اپی‌ژنتیکی، اختلال در بیان ژن‌ها و ورود سلول‌ها به مرحله پیری سلولی از مهم‌ترین سازوکارهای مؤثر در این فرایند به شمار می‌روند. این تغییرات در نهایت باعث کاهش عملکرد بافت‌ها و اندام‌ها، افت توانایی ترمیم، افزایش سفتی بافت‌ها و بروز تدریجی ویژگی‌های سالمندی می‌شوند. با این حال، پژوهشگران معتقدند که پیری سلولی تنها یکی از مکانیسم‌های زیستی سالمندی است و برای تبیین کامل این فرایند باید سایر عوامل ژنتیکی، متابولیکی و محیطی نیز در نظر گرفته شوند (لوپز-اوتین و همکاران',
        ('fn', 8), pd('، 2023؛ کامپیزی'), ('fn', 9), pd('، 2024).'),
    ]))
    blocks.append(H('Normal', [
        'بازنگری‌های زیست‌شناسی سالمندی، پیری سلولی را در چارچوب «نشانه‌های دوازده‌گانه سالمندی» جای داده‌اند؛ از جمله بی‌ثباتی ژنوم، کوتاه شدن تلومر، تغییرات اپی‌ژنتیکی، اختلال پروتئوستاز، نارسایی خودخواری سلولی، اختلال حس مواد مغذی، بدکاری میتوکندری، پیری سلولی، فرسودگی سلول‌های بنیادی، تغییر ارتباط بین‌سلولی، التهاب مزمن و دسبیوز. این چارچوب تأکید می‌کند که پیری سلولی با سایر نشانه‌ها در شبکه‌ای به‌هم‌پیوسته عمل می‌کند و مداخله بر یکی می‌تواند بر بقیه اثر بگذارد (لوپز-اوتین و همکاران',
        ('fn', 8), pd('، 2023).'),
    ], green=True))

    blocks.append(H('Heading5', '۲-۱-۲-۱-۳- نظریه رادیکال آزاد'))
    blocks.append(H('Normal', [
        'بر اساس نظریه رادیکال‌های آزاد، سالمندی تا حدی نتیجه تجمع آسیب‌های ناشی از گونه‌های فعال اکسیژن و سایر رادیکال‌های آزاد در سلول‌ها است. این مولکول‌های بسیار واکنش‌پذیر در جریان فرایندهای طبیعی متابولیسم، به‌ویژه در میتوکندری، تولید می‌شوند و در صورت برهم خوردن تعادل میان تولید آن‌ها و ظرفیت سیستم‌های آنتی‌اکسیدانی، موجب بروز استرس اکسیداتیو می‌شوند. استرس اکسیداتیو می‌تواند به DNA، پروتئین‌ها، لیپیدهای غشایی و سایر اجزای سلولی آسیب برساند و به اختلال عملکرد سلول‌ها و بافت‌ها منجر شود. همچنین، با افزایش سن تغییراتی در بافت همبند از جمله افزایش پیوندهای عرضی رشته‌های کلاژن و کاهش خاصیت ارتجاعی آن‌ها مشاهده می‌شود. از سوی دیگر، تجمع رنگدانه لیپوفوسین که حاصل اکسیداسیون لیپیدها و پروتئین‌ها است، یکی از شاخص‌های شناخته‌شده پیری سلولی محسوب می‌شود و می‌تواند با اختلال در عملکرد طبیعی سلول‌ها و کاهش توانایی آن‌ها در دفع مواد زائد، در فرایند سالمندی نقش داشته باشد. اگرچه امروزه نقش استرس اکسیداتیو در سالمندی به‌خوبی پذیرفته شده است، اما پژوهشگران معتقدند که این نظریه به‌تنهایی قادر به تبیین تمامی ابعاد پیچیده سالمندی نیست و باید در کنار سایر مکانیسم‌های زیستی مورد بررسی قرار گیرد (لوپز-اوتین و همکاران، ',
        pd('2023؛ گلادیشف'), ('fn', 10), pd('، 2024).'),
    ]))
    blocks.append(H('Normal', [
        'همسو با همین چارچوب یکپارچه، استرس اکسیداتیو و بدکاری میتوکندری امروزه بیشتر به‌عنوان یکی از نشانه‌های درهم‌تنیده سالمندی دیده می‌شوند تا علت واحد پیری. بر این اساس، رادیکال‌های آزاد هم در آسیب سلولی و هم در پیام‌رسانی فیزیولوژیک نقش دارند و کاهش یا افزایش نامتعادل آن‌ها می‌تواند مسیر سالمندی را تغییر دهد (لوپز-اوتین و همکاران، ',
        pd('2023؛ گلادیشف، 2024).'),
    ], green=True))

    blocks.append(H('Heading4', '۲-۱-۲-۲- نظریه‌های روان‌شناختی'))
    blocks.append(H('Normal',
        'نظریه‌های روان‌شناختی سالمندی در تلاش‌اند تا فرایند پیری را از منظر تغییرات روانی، شناختی، هیجانی و اجتماعی تبیین کرده و الگوهای رفتاری و سازگاری افراد سالمند را در این دوره از زندگی توضیح دهند (حسینی و همکاران، ۱۴۰۲).'))
    blocks.append(H('Normal', [
        'در کنار نظریه‌های کلاسیک مراحل زندگی، نظریه انتخاب اجتماعی-هیجانی در دهه‌های اخیر پشتوانه تجربی گسترده‌ای یافته و انگیزش هیجانی سالمندان را بر پایه ادراک زمان تبیین کرده است (کارستنسن',
        ('fn', 18), pd('، 2021).'),
    ], green=True))

    blocks.append(H('Heading5', '۲-۱-۲-۲-۱- نظریه گولد'))
    blocks.append(H('Normal', [
        'راجر گولد', ('fn', 11),
        ' سالمندی را مرحله‌ای از زندگی می‌داند که با افزایش نرم‌خویی، گرمی عاطفی، بازنگری در روابط با والدین، فرزندان و دوستان، مرور تجربه‌های گذشته و طرح دوباره پرسش‌هایی درباره معنا و هدف زندگی همراه است. از دیدگاه وی، در این دوره افراد بیش از گذشته به برقراری روابط عمیق و معنادار و دستیابی به احساس انسجام و رضایت در زندگی گرایش پیدا می‌کنند (گولد، ۲۰۰۱، ترجمه فروغیان، ۱۳۹۲).',
    ]))
    blocks.append(H('Normal', [
        'اگرچه صورت‌بندی گولد بیشتر بالینی و روایی است تا آزمون‌پذیر به شیوه نظریه‌های متأخر، تأکید او بر بازنگری معنا و روابط در نیمه دوم زندگی با یافته‌های جدیدتر درباره اولویت اهداف معنادار در سالمندی همسو است (کارستنسن، ',
        pd('2021).'),
    ], green=True))

    blocks.append(H('Heading5', '۲-۱-۲-۲-۲- نظریه لوینسون و شی'))
    blocks.append(H('Normal', [
        'دانیل لوینسون', ('fn', 12),
        pd(' (1978؛ به نقل از رایس، 2001، ترجمه فروغان، 1392) '),
        'سالمندی را مواجهه با خود و زندگی و نیاز به برقراری صلح جهانی می‌داند. شی',
        ('fn', 13),
        pd(' (1979؛ به نقل از منصور، 1386) '),
        'سالمندی را مرحله ایجاد وحدت و تمامیت می‌داند و فرد بیشتر بر هدف‌ها و اعمال خویش متمرکز است و از بسیاری از فعالیت‌ها انصراف حاصل می‌کند.',
    ]))
    blocks.append(H('Normal', [
        'صورت‌بندی مرحله‌ای لوینسون و شی امروزه کمتر به‌عنوان توالی ثابت همگانی پذیرفته می‌شود؛ با این حال، ایده مواجهه با خود و بازتعریف اهداف در بزرگسالی با پژوهش‌های معاصر انگیزش وابسته به زمان هم‌خوانی دارد (کارستنسن، ',
        pd('2006).'),
    ], green=True))

    blocks.append(H('Heading5', '۲-۱-۲-۲-۳- نظریه اریکسون'))
    blocks.append(H('Normal', [
        'از دیدگاه اریکسون', ('fn', 14),
        '، واپسین مرحله رشد روانی ـ اجتماعی با تعارض «انسجام من در برابر ناامیدی» مشخص می‌شود. در این مرحله، سالمندان زندگی گذشته خود را مرور و موفقیت‌ها و شکست‌هایشان را ارزیابی می‌کنند و می‌کوشند برای زندگی خود معنا و انسجام بیابند. افرادی که گذشته خود را با احساس رضایت و پذیرش ارزیابی می‌کنند، به احساس انسجام، آرامش و خرد دست می‌یابند؛ در مقابل، کسانی که زندگی خود را سرشار از فرصت‌های ازدست‌رفته و ناکامی می‌دانند، ممکن است دچار احساس ناامیدی، پوچی و ترس از مرگ شوند. از این‌رو، دستیابی به احساس انسجام در این مرحله نقش مهمی در سلامت روان و سازگاری سالمندان دارد (اریکسون، ',
        pd('1982؛ اریکسون و کیونیو'), ('fn', 15), pd('، 1986).'),
    ]))
    blocks.append(H('Normal', [
        'مطالعات جدیدتر نشان داده‌اند که انسجام من با حالت‌های سلامت روان مرتبط است، در حالی که ناامیدی بیشتر با ویژگی شخصیتی روان‌رنجورخویی پیوند دارد؛ بنابراین تعارض پایانی اریکسون همچنان برای فهم سازگاری و سلامت روان سالمندان راهگشا است (وسترهاف، بولمایر و مک‌آدامز',
        ('fn', 16), pd('، 2017).'),
    ], green=True))

    blocks.append(H('Heading5', '۲-۱-۲-۲-۴- نظریه انتخاب اجتماعی-هیجانی', green=True))
    blocks.append(H('Normal', [
        'نظریه انتخاب اجتماعی-هیجانی', ('fn', 17),
        ' که توسط لورا کارستنسن', ('fn', 18),
        ' مطرح شد، یکی از تأثیرگذارترین تبیین‌های روان‌شناختی معاصر از انگیزش، روابط اجتماعی و تجربه هیجانی در بزرگسالی و سالمندی است. بر اساس این نظریه، ادراک افراد از افق زمانی باقی‌مانده زندگی، و نه صرفاً سن تقویمی، جهت‌گیری اهداف را تعیین می‌کند. هنگامی که آینده گسترده و باز تصور می‌شود، اهداف معطوف به کسب دانش، کشف و گسترش شبکه اجتماعی در اولویت قرار می‌گیرند؛ اما وقتی زمان باقی‌مانده محدود ادراک می‌شود ــ وضعیتی که در سالمندی شایع‌تر است ــ افراد اهداف هیجانی و معنادار را ترجیح می‌دهند، شبکه اجتماعی خود را گزینشی‌تر می‌کنند و بیش از پیش به روابط نزدیک و تجربه‌های رضایت‌بخش حال حاضر روی می‌آورند. این تغییر انگیزشی با «اثر مثبت‌نگری»',
        ('fn', 21),
        ' در توجه و حافظه سالمندان همراه دانسته شده است؛ یعنی سوگیری به اطلاعات مثبت در مقایسه با اطلاعات منفی. شواهد تجربی، از جمله فراتحلیل مطالعات این حوزه، پایداری نسبی این اثر را تأیید کرده‌اند. بازنگری‌های جدیدتر نظریه نیز بر نقش ادراک پایان‌ها در انگیزش انسان تأکید کرده‌اند و کاربردهایی برای ارتباط با سالمندان و فهم سازگاری هیجانی در مواجهه با محدودیت زمانی ــ از جمله آگاهی از پایان زندگی ــ پیشنهاد نموده‌اند (کارستنسن، آیزاکوویتز',
        ('fn', 19),
        ' و چارلز', ('fn', 20),
        pd('، 1999؛ کارستنسن، 2006؛ رید، چان و مایکلز'),
        ('fn', 22),
        pd('، 2014؛ کارستنسن، 2021).'),
    ], green=True))

    blocks.append(H('Heading4', '۲-۱-۲-۳- نظریه‌های جامعه‌شناختی'))
    blocks.append(H('Heading5', '۲-۱-۲-۳-۱- نظریه عدم تعهد'))
    blocks.append(H('Normal', [
        'نظریه عدم تعهد', ('fn', 23),
        ' که توسط کامینگ و هنری', ('fn', 24),
        ' ارائه شد، بیان می‌کند که سالمندی با کاهش تدریجی تعاملات و نقش‌های اجتماعی همراه است. بر اساس این نظریه، با افزایش سن، فرد به‌تدریج از برخی مسئولیت‌ها و روابط اجتماعی فاصله می‌گیرد و جامعه نیز متقابلاً نقش‌های کمتری به او واگذار می‌کند. این فرایند به سالمند فرصت می‌دهد تا انرژی و زمان خود را بیشتر صرف علایق شخصی، باز در زندگی و سازگاری با تغییرات ناشی از سالمندی کند. از دیدگاه این نظریه، کاهش مشارکت اجتماعی بخشی طبیعی از فرایند سالمندی و زمینه‌ساز انطباق فرد با مراحل پایانی زندگی است، هرچند این دیدگاه بعدها با انتقادهایی مواجه شد و پژوهشگران بر اهمیت تداوم مشارکت اجتماعی و حفظ نقش‌های فعال در دوران سالمندی تأکید کردند (کامینگ و هنری، ',
        pd('1961؛ آچلی'), ('fn', 25), pd('، 2016).'),
    ]))
    blocks.append(H('Normal', [
        'همسو با همین انتقادها، سیاست‌های جهانی سالمندی سالم بر حفظ توانمندی کارکردی و مشارکت اجتماعی تأکید دارند و کناره‌گیری را مسیر مطلوب همگانی نمی‌دانند (سازمان جهانی بهداشت، ',
        pd('2020؛ سازمان جهانی بهداشت، 2023).'),
    ], green=True))

    blocks.append(H('Heading5', '۲-۱-۲-۳-۲- نظریه فعالیت'))
    blocks.append(H('Normal', [
        'نظریه فعالیت', ('fn', 26),
        ' که توسط هاویگهرست', ('fn', 27),
        ' و همکاران مطرح شد، در تقابل با نظریه عدم تعهد قرار دارد. بر اساس این نظریه، حفظ فعالیت‌های جسمی، روانی و اجتماعی و تداوم ایفای نقش‌های معنادار، نقش مهمی در رضایت از زندگی و سلامت سالمندان دارد. این دیدگاه بیان می‌کند که سالمندی موفق زمانی تحقق می‌یابد که فرد بتواند ضمن حفظ نقش‌های پیشین یا جایگزین کردن آن‌ها با نقش‌های جدید، همچنان در فعالیت‌های فردی و اجتماعی مشارکت داشته باشد. از این منظر، سالمندانی که سبک زندگی فعال‌تری دارند، سازگاری روانی و اجتماعی بیشتری را تجربه کرده و از سلامت جسمی و کیفیت زندگی مطلوب‌تری برخوردار هستند (هاویگهرست، ',
        pd('1961؛ هاویگهرست، نیوگارتن و توبین'), ('fn', 28), pd('، 1968).'),
    ]))
    blocks.append(H('Normal', [
        'توسعه‌های جدیدتر مفهوم سالمندی موفق نیز بر مشارکت مولد، همبستگی اجتماعی و ظرفیت جوامع برای بهره‌گیری از توان سالمندان تأکید کرده‌اند و فعالیت را از سطح فردی به سطح اجتماعی گسترش داده‌اند (رو و کان',
        ('fn', 29), pd('، 2015).'),
    ], green=True))

    blocks.append(H('Heading5', '۲-۱-۲-۳-۳- نظریه مبادله یا تعامل'))
    blocks.append(H('Normal', [
        'نظریه مبادله اجتماعی، که توسط داود', ('fn', 30),
        ' مطرح شد، بر این اصل استوار است که روابط اجتماعی بر پایه مبادله منابع، پاداش‌ها و هزینه‌ها شکل می‌گیرند. بر اساس این نظریه، با افزایش سن و کاهش برخی توانایی‌ها و نقش‌های اجتماعی، سالمندان ممکن است منابع و قدرت اجتماعی کمتری در اختیار داشته باشند؛ ازاین‌رو، جامعه باید در مقابل کاهش مشارکت شغلی و اجتماعی آنان، حمایت‌هایی مانند مستمری بازنشستگی، خدمات بهداشتی و درمانی، تأمین اجتماعی، مراقبت‌های حمایتی و برنامه‌های توانمندسازی را فراهم کند. این حمایت‌ها موجب حفظ منزلت اجتماعی، افزایش کیفیت زندگی و ارتقای رفاه سالمندان می‌شود (داود، ',
        pd('1975).'),
    ]))

    blocks.append(H('Heading5', '۲-۱-۲-۳-۴- نظریه استمرار'))
    blocks.append(H('Normal', [
        'نظریه تداوم یا استمرار', ('fn', 31),
        ' که توسط رابرت آچلی ارائه شد، بیان می‌کند که سالمندی ادامه طبیعی مراحل پیشین زندگی است و افراد می‌کوشند با حفظ الگوهای رفتاری، ارزش‌ها، روابط اجتماعی و سبک زندگی گذشته، احساس ثبات و هویت خود را حفظ کنند. بر اساس این نظریه، سالمندان برای سازگاری با تغییرات ناشی از افزایش سن، از تجربیات، مهارت‌ها و راهبردهای مقابله‌ای که در طول زندگی کسب کرده‌اند استفاده می‌کنند. ازاین‌رو، حفظ تداوم در نقش‌ها، فعالیت‌ها و روابط اجتماعی می‌تواند به افزایش سازگاری، رضایت از زندگی و سلامت روان سالمندان کمک کند. این نظریه در واقع برخی از جنبه‌های نظریه‌های فعالیت و عدم تعهد را با یکدیگر تلفیق کرده و معتقد است میزان مشارکت یا کناره‌گیری اجتماعی باید متناسب با ویژگی‌ها و تجربیات هر فرد تداوم یابد (آچلی، ',
        pd('1989؛ آچلی، 2016).'),
    ]))
    blocks.append(H('Normal', [
        'پژوهش‌های بعدی در سالمندشناسی اجتماعی همچنان بر نقش تداوم هویت، عادت‌ها و روابط در سازگاری با گذارهای سالمندی تأکید دارند و این نظریه را چارچوبی برای فهم تفاوت‌های فردی در میزان فعالیت یا کناره‌گیری می‌دانند (آچلی، ',
        pd('2016).'),
    ], green=True))

    blocks.append(H('Heading1', 'منابع فارسی', page_break=True))
    blocks.append(H('Normal',
        'حسینی، جنبذی سیدعلی؛ و زرقی، محمد. (۱۴۰۲). مروری بر نظریه‌های روان‌شناختی سالمندی و سالمندی موفق. فصلنامه سالمند.'))

    blocks.append(H('Heading1', 'منابع لاتین'))
    latin = [
        [('Atchley, R. C. (1989). A Continuity Theory of Normal Aging. The Gerontologist, 29(2), 183–190.')],
        [('Atchley, R. C. (2016). Social Forces and Aging: An Introduction to Social Gerontology (14th ed.). Cengage Learning.')],
        [('Campisi, J. (2024). Cellular Senescence and Organismal Aging. Nature Reviews Molecular Cell Biology.')],
        [('Carstensen, L. L. (2006). The influence of a sense of time on human development. Science, 312(5782), 1913–1915. '),
         ('url', 'rIdDoiSST06', 'https://doi.org/10.1126/science.1127488')],
        [('Carstensen, L. L. (2021). Socioemotional selectivity theory: The role of perceived endings in human motivation. The Gerontologist, 61(8), 1188–1196. '),
         ('url', 'rIdDoiSST21', 'https://doi.org/10.1093/geront/gnab116')],
        [('Carstensen, L. L., Isaacowitz, D. M., & Charles, S. T. (1999). Taking time seriously: A theory of socioemotional selectivity. American Psychologist, 54(3), 165–181. '),
         ('url', 'rIdDoiSST99', 'https://doi.org/10.1037/0003-066X.54.3.165')],
        [('Cumming, E., & Henry, W. E. (1961). Growing Old: The Process of Disengagement. New York: Basic Books.')],
        [('Dowd, J. J. (1975). Aging as exchange: A preface to theory. Journal of Gerontology, 30(5), 584–594.')],
        [('Erikson, E. H. (1982). The Life Cycle Completed. New York: W. W. Norton.')],
        [('Erikson, E. H., Erikson, J. M., & Kivnick, H. Q. (1986). Vital Involvement in Old Age. New York: W. W. Norton.')],
        [('Franceschi, C., Garagnani, P., Parini, P., Giuliani, C., & Santoro, A. (2018). Inflammaging: A new immune–metabolic viewpoint for age-related diseases. Nature Reviews Endocrinology, 14(10), 576–590. '),
         ('url', 'rIdDoiFran', 'https://doi.org/10.1038/s41574-018-0059-4')],
        [('Fulop, T., Larbi, A., Dupuis, G., et al. (2023). Immunosenescence and inflammaging as two sides of the same coin: Friends or foes? Frontiers in Immunology.')],
        [('Gladyshev, V. N. (2024). The Biology of Aging. Nature Reviews Molecular Cell Biology.')],
        [('Havighurst, R. J. (1961). Successful aging. The Gerontologist.')],
        [('Havighurst, R. J., Neugarten, B. L., & Tobin, S. S. (1968). Disengagement and patterns of aging. In Middle Age and Aging.')],
        [('López-Otín, C., Blasco, M. A., Partridge, L., Serrano, M., & Kroemer, G. (2023). Hallmarks of aging: An expanding universe. Cell, 186(2), 243–278. '),
         ('url', 'rIdDoiLopez', 'https://doi.org/10.1016/j.cell.2022.11.001')],
        [('Nikolich-Žugich, J., et al. (2023). The twilight of immunity: Emerging concepts in aging of the immune system. Nature Immunology.')],
        [('Reed, A. E., Chan, L., & Mikels, J. A. (2014). Meta-analysis of the age-related positivity effect: Age differences in preferences for positive over negative information. Psychology and Aging, 29(1), 1–15. '),
         ('url', 'rIdDoiReed', 'https://doi.org/10.1037/a0035194')],
        [('Rowe, J. W., & Kahn, R. L. (2015). Successful aging 2.0: Conceptual expansions for the 21st century. The Journals of Gerontology, Series B, 70(4), 593–596. '),
         ('url', 'rIdDoiRowe', 'https://doi.org/10.1093/geronb/gbv025')],
        [('Westerhof, G. J., Bohlmeijer, E. T., & McAdams, D. P. (2017). The relation of ego integrity and despair to personality traits and mental health. The Journals of Gerontology, Series B, 72(3), 400–407. '),
         ('url', 'rIdDoiWest', 'https://doi.org/10.1093/geronb/gbv062')],
        [('World Health Organization. (2020). Healthy ageing and functional ability.')],
        [('World Health Organization. (2023). Healthy ageing: A priority for delivering universal health coverage. Geneva: World Health Organization.')],
    ]
    NEW_BIB = (
        'Carstensen, L. L. (2006)',
        'Carstensen, L. L. (2021)',
        'Carstensen, L. L., Isaacowitz',
        'Franceschi, C.',
        'Reed, A. E.',
        'Rowe, J. W.',
        'Westerhof, G. J.',
    )
    for item in latin:
        first = item[0] if isinstance(item[0], str) else ''
        blocks.append(bib_para(item, green=first.startswith(NEW_BIB)))

    for b in blocks:
        body.append(b)
    body.append(sect)

    newdoc = etree.Element(q('document'))
    # copy nsmap from old
    newdoc = old
    oldbody = newdoc[0]
    for child in list(oldbody):
        oldbody.remove(child)
    for b in blocks:
        oldbody.append(b)
    oldbody.append(sect)

    parts['word/document.xml'] = etree.tostring(
        newdoc, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST)


if __name__ == '__main__':
    build()
