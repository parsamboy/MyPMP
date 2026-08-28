# -*- coding: utf-8 -*-
"""v1.2: درختواره با اشکال ورد + غنی‌سازی ادامهٔ فصل ۲ (متن اصلی حفظ، مطالب جدید سبز)."""
import copy, zipfile
from lxml import etree

import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_nazariyeha as B
from build_nazariyeha import GREEN, W, q, para, pd

SRC_MAIN = 'Payannameh-Fatemeh-Bayat-v1.9.docx'
SRC_SEP = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.1.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.2.docx'

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


def _box(x, y, w, h, fill, text, txtcolor='FFFFFF', gold=False, fs='16'):
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
    p = etree.SubElement(content, q('p'))
    pPr = etree.SubElement(p, q('pPr'))
    etree.SubElement(pPr, q('jc')).set(q('val'), 'center')
    etree.SubElement(pPr, q('bidi'))
    r = etree.SubElement(p, q('r'))
    rPr = etree.SubElement(r, q('rPr'))
    rf = etree.SubElement(rPr, q('rFonts'))
    rf.set(q('ascii'), 'Times New Roman'); rf.set(q('cs'), 'B Lotus'); rf.set(q('hAnsi'), 'Times New Roman')
    etree.SubElement(rPr, q('sz')).set(q('val'), fs)
    etree.SubElement(rPr, q('szCs')).set(q('val'), fs)
    etree.SubElement(rPr, q('color')).set(q('val'), txtcolor)
    etree.SubElement(rPr, q('rtl')); etree.SubElement(rPr, q('cs'))
    t = etree.SubElement(r, q('t')); t.text = text
    bp = etree.SubElement(wsp, WPS + 'bodyPr')
    bp.set('anchor', 'ctr'); bp.set('lIns', '36000'); bp.set('rIns', '36000')
    bp.set('tIns', '18000'); bp.set('bIns', '18000')
    return wsp


def tree_drawing():
    wpg = etree.Element(WPG + 'wgp')
    etree.SubElement(wpg, WPG + 'cNvGrpSpPr')
    gsp = etree.SubElement(wpg, WPG + 'grpSpPr')
    xf = etree.SubElement(gsp, A + 'xfrm')
    o = etree.SubElement(xf, A + 'off'); o.set('x', '0'); o.set('y', '0')
    e = etree.SubElement(xf, A + 'ext'); e.set('cx', emu(6.2)); e.set('cy', emu(4.7))
    co = etree.SubElement(xf, A + 'chOff'); co.set('x', '0'); co.set('y', '0')
    ce = etree.SubElement(xf, A + 'chExt'); ce.set('cx', emu(6.2)); ce.set('cy', emu(4.7))
    wpg.append(_box(1.85, 0.08, 2.5, 0.48, '1F4E5F', 'نظریه‌های سالمندی', fs='22'))
    wpg.append(_box(4.25, 0.85, 1.75, 0.40, '3D5C4A', 'زیست‌شناختی', fs='18'))
    wpg.append(_box(2.22, 0.85, 1.75, 0.40, '3D5C4A', 'روان‌شناختی', fs='18'))
    wpg.append(_box(0.20, 0.85, 1.75, 0.40, '3D5C4A', 'جامعه‌شناختی', fs='18'))
    bio = ['نظریه ایمنی', 'نظریه پیر شدن سلولی', 'نظریه رادیکال آزاد']
    psy = ['نظریه گولد', 'نظریه لوینسون و شی', 'نظریه اریکسون', 'نظریه انتخاب اجتماعی-هیجانی']
    soc = ['نظریه عدم تعهد', 'نظریه فعالیت', 'نظریه مبادله یا تعامل', 'نظریه استمرار']
    for i, t in enumerate(bio):
        wpg.append(_box(4.25, 1.45 + i * 0.48, 1.75, 0.42, 'F7F4EC', t, '1F4E5F', fs='15'))
    for i, t in enumerate(psy):
        wpg.append(_box(2.22, 1.45 + i * 0.48, 1.75, 0.42, 'F7F4EC', t, '1F4E5F', gold=(i == 3), fs='14'))
    for i, t in enumerate(soc):
        wpg.append(_box(0.20, 1.45 + i * 0.48, 1.75, 0.42, 'F7F4EC', t, '1F4E5F', fs='15'))
    drawing = etree.Element(q('drawing'))
    inline = etree.SubElement(drawing, WP + 'inline')
    inline.set('distT', '0'); inline.set('distB', '0'); inline.set('distL', '0'); inline.set('distR', '0')
    ex = etree.SubElement(inline, WP + 'extent'); ex.set('cx', emu(6.2)); ex.set('cy', emu(4.7))
    ee = etree.SubElement(inline, WP + 'effectExtent')
    for a in ('l', 't', 'r', 'b'):
        ee.set(a, '0')
    docPr = etree.SubElement(inline, WP + 'docPr'); docPr.set('id', '20'); docPr.set('name', 'WordTree')
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
    r.append(tree_drawing())
    return p


def fn_text(f):
    return ''.join(t.text or '' for t in f.iter(q('t')))


NEW_FN = {
    32: 'Pyszczynski, Lockett, Greenberg & Solomon',
    33: 'Iverach, Menzies & Menzies',
    34: 'Wong',
    35: 'Meaning Management Theory',
    36: 'King',
    37: 'Menzies & Menzies',
    38: 'King & DeCicco',
}


def greens(H):
    """پاراگراف‌های سبز برای ادامهٔ فصل ۲."""
    g = {}
    g['aging_concept'] = H('Normal', [
        'در سال‌های اخیر، سازمان جهانی بهداشت سالمندی سالم را نه صرفاً بر پایه سن تقویمی، بلکه بر اساس توانمندی کارکردی یعنی ترکیب ظرفیت درونی فرد و ویژگی‌های محیطی تعریف کرده است. این رویکرد بر حفظ توانایی انجام کارهای ارزشمند برای فرد و مشارکت اجتماعی تأکید دارد (سازمان جهانی بهداشت، ',
        pd('2020؛ سازمان جهانی بهداشت، 2023).'),
    ], green=True)
    g['da_concept'] = H('Normal', [
        'همسو با این یافته‌ها، آزمون‌های جدیدتر نظریه مدیریت وحشت نشان می‌دهند که برجسته شدن فناپذیری ــ از جمله در شرایط تهدید جمعی مانند همه‌گیری ــ می‌تواند هم دفاع‌های روان‌شناختی را فعال کند و هم اضطراب مرگ را در گروه‌های سنی مختلف افزایش دهد (پیشزچینسکی و همکاران',
        ('fn', 32), pd('، 2021).'),
    ], green=True)
    g['freud'] = H('Normal', [
        'پژوهش‌های متأخر کمتر از تبیین کاملاً ناهشیار فروید پیروی می‌کنند و اضطراب مرگ را سازه‌ای قابل‌اندازه‌گیری و فراتشخیصی می‌دانند که با طیف وسیعی از مشکلات هیجانی پیوند دارد (ایوراچ، منزیس و منزیس',
        ('fn', 33), pd('، 2014).'),
    ], green=True)
    g['yalom'] = H('Normal', [
        'رویکردهای وجودی معاصر همچنان بر چهار دغدغه یالوم تأکید دارند؛ در کنار آن، نظریه مدیریت معنا',
        ('fn', 35),
        ' بیان می‌کند که معناجویی و پذیرش مرگ، مسیر سازگاری سالم‌تر در مواجهه با فناپذیری است (وانگ',
        ('fn', 34), pd('، 2008).'),
    ], green=True)
    g['tmt'] = H('Normal', [
        'شواهد جدیدتر نظریه مدیریت وحشت را در شرایط تهدید جمعی مانند همه‌گیری کووید-۱۹ نیز آزموده‌اند و نشان داده‌اند که یادآوری مرگ می‌تواند وابستگی به جهان‌بینی فرهنگی و جست‌وجوی معنا را همزمان افزایش دهد (پیشزچینسکی و همکاران، ',
        pd('2021).'),
    ], green=True)
    g['dim'] = H('Normal', [
        'طبقه‌بندی‌های جدیدتر، اضطراب مرگ را چندبُعدی می‌دانند و میان ترس از مردن، ترس از آنچه پس از مرگ می‌آید و نگرانی برای بازماندگان تمایز می‌گذارند؛ همین تمایز در طراحی مقیاس‌ها و مداخلات اهمیت دارد (ایوراچ و همکاران، ',
        pd('2014).'),
    ], green=True)
    g['cons'] = H('Normal', [
        'مرورها نشان می‌دهند که اضطراب مرگ می‌تواند سازه‌ای فراتشخیصی باشد و با افسردگی، اضطراب سلامت و اجتناب از مراقبت سلامت همراه شود؛ کاهش آن با بهبود کیفیت زندگی مرتبط است (ایوراچ و همکاران، ',
        pd('2014؛ منزیس و منزیس'), ('fn', 37), pd('، 2020).'),
    ], green=True)
    g['king_h'] = H('Heading3', '۲-۳-۴- مدل چهارعاملی هوش معنوی کینگ', green=True)
    g['king'] = H('Normal', [
        'کینگ', ('fn', 36),
        ' هوش معنوی را مجموعه‌ای از توانایی‌های ذهنی مرتبط با آگاهی، یکپارچگی و کاربرد انطباقی جنبه‌های غیرمادی و وجودی زندگی تعریف می‌کند. مدل چهارعاملی وی شامل تفکر وجودی انتقادی، تولید معنای شخصی، آگاهی متعالی و گسترش هشیارانه حالت آگاهی است. همین مدل مبنای پرسشنامه‌ای است که در پژوهش حاضر برای سنجش هوش معنوی به کار رفته است (کینگ و دی‌سیکو',
        ('fn', 38), pd('، 2009).'),
    ], green=True)
    g['synth'] = H('Normal', [
        'در مجموع، پیشینه داخلی و خارجی از رابطه منفی هوش معنوی با اضطراب مرگ و از پیوند اضطراب سلامت با اضطراب مرگ حمایت می‌کند. شکاف پژوهشی، بررسی همزمان این سه متغیر در سالمندان مقیم مراکز نگهداری و تبیین آن در پرتو نظریه‌هایی مانند انتخاب اجتماعی-هیجانی، مدیریت وحشت و مدل چهارعاملی کینگ است.',
    ], green=True)
    return g


def clone_ch2_rest(main_doc, main_fn, id_start):
    paras = list(main_doc[0].iter(q('p')))
    start = end = None
    for i, p in enumerate(paras):
        st, t = style_of(p) or '', ptext(p).strip()
        if st == 'Heading1' and t.startswith('فصل دوم'):
            start = i
        if start is not None and i > start and st == 'Heading1':
            end = i
            break
    # part A: 2-1 + 2-1-1 ؛ part B: از 2-2 تا پایان فصل (نظریه‌های 2-1-2 در فایل جدا هست)
    part_a, part_b = [], []
    mode = 'a'
    for p in paras[start:end]:
        st, t = style_of(p) or '', ptext(p).strip()
        if st == 'Heading1' and t.startswith('فصل دوم'):
            continue
        if st == 'Heading3' and t.startswith('۲-۱-۲'):
            mode = 'skip'
            continue
        if mode == 'skip':
            if st == 'Heading2' and t.startswith('۲-۲'):
                mode = 'b'
            else:
                continue
        if mode == 'a':
            part_a.append(p)
        elif mode == 'b':
            part_b.append(p)
    keep = part_a + part_b  # remap together; split later by 2-2 heading

    fn_by_id = {f.get(q('id')): f for f in main_fn.findall(q('footnote')) if not f.get(q('type'))}
    mapping, nxt = {}, id_start
    out_p, out_f = [], []
    for p in keep:
        p2 = copy.deepcopy(p)
        for fr in p2.iter(q('footnoteReference')):
            old = fr.get(q('id'))
            if old not in mapping:
                mapping[old] = str(nxt)
                srcf = fn_by_id.get(old)
                if srcf is not None:
                    f2 = copy.deepcopy(srcf)
                    f2.set(q('id'), str(nxt))
                    out_f.append(f2)
                nxt += 1
            fr.set(q('id'), mapping[old])
        out_p.append(p2)
    return out_p, out_f, nxt


def insert_greens(paras, g):
    """پس از پاراگراف‌های مشخص، پاراگراف سبز درج می‌شود."""
    rules = [
        ('سالمندی یا کهنسالی آخرین مرحله', g['aging_concept']),
        ('اضطراب مرگ به احساس ترس، نگرانی و آشفتگی روانی', g['da_concept']),
        ('فروید معتقد بود که ذهن ناهشیار', g['freud']),
        ('اروین یالوم اضطراب مرگ را یکی از چهار', g['yalom']),
        ('طبق این نظریه، که توسط گرینبرگ', g['tmt']),
        ('اضطراب درباره نحوه‌ی به یاد آوردن فرد پس از مرگ', g['dim']),
        ('در مقابل، کاهش اضطراب مرگ می‌تواند باعث افزایش آرامش', g['cons']),
        ('رویکرد لذت‌گرایانه به بهزیستی پیشینه‌ای طولانی', [g['king_h'], g['king']]),
        ('یالوم(۱۹۸۰) در نظریه‌', g['synth']),
        ('یالوم(1980)', g['synth']),
    ]
    used = set()
    out = []
    for p in paras:
        out.append(p)
        t = ptext(p)
        for key, extra in rules:
            if key in used:
                continue
            if t.startswith(key) or key in t[:80]:
                if isinstance(extra, list):
                    out.extend(extra)
                else:
                    out.append(extra)
                used.add(key)
    return out, used


def extra_latin():
    return [
        ([('Iverach, L., Menzies, R. G., & Menzies, R. E. (2014). Death anxiety and its role in psychopathology: Reviewing the status of a transdiagnostic construct. Clinical Psychology Review, 34(7), 580–593. '),
          ('url', 'rIdDoiIver', 'https://doi.org/10.1016/j.cpr.2014.09.002')], True),
        ([('King, D. B., & DeCicco, T. L. (2009). A viable model and self-report measure of spiritual intelligence. International Journal of Transpersonal Studies, 28(1), 68–85.')], True),
        ([('Menzies, R. E., & Menzies, R. G. (2020). Death anxiety in the time of COVID-19: Theoretical explanations and clinical implications. The Cognitive Behaviour Therapist, 13, e19. '),
          ('url', 'rIdDoiMenz', 'https://doi.org/10.1017/S1754470X20000215')], True),
        ([('Pyszczynski, T., Lockett, M., Greenberg, J., & Solomon, S. (2021). Terror management theory and the COVID-19 pandemic. Journal of Humanistic Psychology, 61(2), 173–189. '),
          ('url', 'rIdDoiPysz', 'https://doi.org/10.1177/0022167820959488')], True),
        ([('Wong, P. T. P. (2008). Meaning management theory and death acceptance. In A. Tomer, G. T. Eliason, & P. T. P. Wong (Eds.), Existential and spiritual issues in death attitudes (pp. 65–87). Erlbaum.')], True),
    ]


TOC_EXTRA = [
    ('TOC2', '۲-۱- گستره نخست: سالمندی', False),
    ('TOC3', '۲-۱-۱- مفهوم سالمندی', False),
    ('TOC2', '۲-۲- گستره دوم: اضطراب مرگ', False),
    ('TOC3', '۲-۲-۱- مفهوم اضطراب مرگ', False),
    ('TOC3', '۲-۲-۲- نظریه‌های مرتبط با اضطراب مرگ', False),
    ('TOC3', '۲-۲-۳- ابعاد اضطراب مرگ', False),
    ('TOC3', '۲-۲-۴- عوامل مؤثر بر اضطراب مرگ در سالمندان', False),
    ('TOC3', '۲-۲-۵- اضطراب مرگ و سالمندی', False),
    ('TOC3', '۲-۲-۶- پیامدهای اضطراب مرگ', False),
    ('TOC2', '۲-۳- گستره سوم: هوش معنوی', False),
    ('TOC3', '۲-۳-۱- مفهوم هوش معنوی', False),
    ('TOC3', '۲-۳-۲- دیدگاه فضیلت‌گرایانه به هوش معنوی', False),
    ('TOC3', '۲-۳-۳- عوامل موثر بر هوش معنوی', False),
    ('TOC3', '۲-۳-۴- مدل چهارعاملی هوش معنوی کینگ', True),
    ('TOC2', '۲-۴- گستره چهارم: اضطراب سلامتی', False),
    ('TOC3', '۲-۴-۱- مفهوم اضطراب سلامتی', False),
    ('TOC3', '۲-۴-۲- مدل‌های نظری اضطراب سلامتی', False),
    ('TOC3', '۲-۴-۳- سالمندی و اضطراب سلامت', False),
    ('TOC3', '۲-۴-۴- عوامل زمینه‌ساز اضطراب', False),
    ('TOC3', '۲-۴-۵- مداخلات معطوف به کاهش اضطراب سلامت سالمندان', False),
    ('TOC2', '۲-۵- پیشینه پژوهش', False),
    ('TOC3', '۲-۵-۱- پیشینه داخلی', False),
    ('TOC3', '۲-۵-۲- پیشینه خارجی', False),
]


def build():
    zin = zipfile.ZipFile(SRC_SEP)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    zm = zipfile.ZipFile(SRC_MAIN)
    main_doc = etree.fromstring(zm.read('word/document.xml'))
    main_fn = etree.fromstring(zm.read('word/footnotes.xml'))
    zm.close()

    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    fn_root = etree.fromstring(parts['word/footnotes.xml'])

    # 1) replace image drawing with Word shapes
    replaced = False
    for p in list(body.iter(q('p'))):
        if p.find('.//' + WP + 'inline') is not None or p.find('.//' + WP + 'anchor') is not None:
            # only the tree image (has pic)
            if p.find('.//{http://schemas.openxmlformats.org/drawingml/2006/picture}pic') is not None:
                parent = p.getparent()
                idx = list(parent).index(p)
                parent.remove(p)
                parent.insert(idx, tree_para())
                replaced = True
                break
    print('tree replaced', replaced)

    # 2) TOC extras before منابع فارسی toc
    toc_anchor = None
    for p in body.iter(q('p')):
        if style_of(p) == 'TOC1' and ptext(p).strip() == 'منابع فارسی':
            toc_anchor = p
            break
    if toc_anchor is not None:
        parent = toc_anchor.getparent()
        idx = list(parent).index(toc_anchor)
        for i, (st, t, g) in enumerate(TOC_EXTRA):
            parent.insert(idx + i, B.para(st, t, green=g))

    # 3) clone rest of ch2 + greens, insert before منابع فارسی heading
    rest, extra_fns, nxt = clone_ch2_rest(main_doc, main_fn, 40)
    gmap = greens(B.para)
    rest, used = insert_greens(rest, gmap)
    split = next((i for i, p in enumerate(rest) if (style_of(p) or '').startswith('Heading') and ptext(p).startswith('۲-۲-')), len(rest))
    part_a, part_b = rest[:split], rest[split:]
    print('green inserts', sorted(used), 'A', len(part_a), 'B', len(part_b), 'cloned fn', len(extra_fns), 'next_id', nxt)

    # 2-1 و 2-1-1 قبل از 2-1-2
    h212 = None
    for p in body.iter(q('p')):
        if (style_of(p) or '').startswith('Heading') and ptext(p).startswith('۲-۱-۲- نظریه‌'):
            h212 = p
            break
    if h212 is not None:
        parent = h212.getparent()
        idx = list(parent).index(h212)
        for i, p in enumerate(part_a):
            parent.insert(idx + i, p)

    src_anchor = None
    for p in body.iter(q('p')):
        if style_of(p) == 'Heading1' and ptext(p).strip() == 'منابع فارسی':
            src_anchor = p
            break
    parent = src_anchor.getparent()
    idx = list(parent).index(src_anchor)
    for i, p in enumerate(part_b):
        parent.insert(idx + i, p)

    # 4) footnotes
    for f in extra_fns:
        fn_root.append(f)
    for fid, txt in NEW_FN.items():
        fn_root.append(B.footnote_el(fid, txt))

    # 5) extra latin refs before end
    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
    existing = {rel.get('Id') for rel in rels}

    def add_rel(rid, typ, target, external=False):
        if rid in existing:
            return
        rel = etree.SubElement(rels, '{%s}Relationship' % REL_NS)
        rel.set('Id', rid); rel.set('Type', typ); rel.set('Target', target)
        if external:
            rel.set('TargetMode', 'External')
        existing.add(rid)

    for rid, url in {
        'rIdDoiIver': 'https://doi.org/10.1016/j.cpr.2014.09.002',
        'rIdDoiMenz': 'https://doi.org/10.1017/S1754470X20000215',
        'rIdDoiPysz': 'https://doi.org/10.1177/0022167820959488',
    }.items():
        add_rel(rid, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', url, True)

    # append extra bib at end of body (before sectPr)
    sect = body.find(q('sectPr'))
    for parts_b, isnew in extra_latin():
        body.insert(list(body).index(sect), B.bib_para(parts_b, green=isnew))

    parts['word/document.xml'] = etree.tostring(doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(fn_root, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/_rels/document.xml.rels'] = etree.tostring(rels, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST)


if __name__ == '__main__':
    build()
