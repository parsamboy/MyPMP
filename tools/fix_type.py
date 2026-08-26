# -*- coding: utf-8 -*-
"""
یکدست‌سازی حروف‌چینی متن‌های هم‌نوع.

یافته‌های بازرسی روی v1.1 (نه حدس):
  ۱) فهرست مطالب: سبک TOC روی B Lotus است، اما ران‌ها cs=B Titr دارند
     و دو مدخل فصل ۴ (۴-۲-۲ و ۴-۲-۳) برعکس B Lotus نازک مانده‌اند.
     TOC2/3 بولدِ تیتر، TOC1/4 نازکِ تیتر — ناهمگون.
  ۲) ۱۶ سرتیتر که شماره‌شان در متن اصلاح شده بود، در فیلد TOC کهنه مانده
     (مثلاً ۱-۲-۱-۲ به‌جای ۲-۱-۲-۱).
  ۳) ۶۴ پاراگراف بدنه بعد از فهرست هنوز از pPr بولدند؛ v1.1 فقط b ران را
     برداشته بود، پس همان جمله‌های بلند هنوز ضخیم دیده می‌شوند.
  ۴) Heading2/3 در سبک نازک‌اند و pPrشان cs=B Lotus است در حالی که ران
     B Titr است. Heading4 در سبک Calibri/Arial است.
  ۵) عنوان جدول‌ها رقم لاتین ۱–۹ با اندازهٔ ۱۴ دارند؛ فهرست جداول رقم فارسی
     ۱۲ دارد. pPr عنوان جدول Cambria است.
  ۶) Normal = Courier New، docDefaults eastAsia=Calibri، تم Aptos،
     eastAsia=MS Mincho روی متن تعهدنامه.

قاعدهٔ یکدستی:
  عنوان فصل/سرتیتر          → B Titr + Times New Roman، بولد
  فهرست مطالب و فهرست جداول → B Lotus + Times New Roman، TOC1 بولد، بقیه نازک
  بدنه / منابع / سلول داده  → B Lotus + Times New Roman، نازک
  عنوان جدول و سرآیند جدول  → B Lotus + Times New Roman، بولد
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
def q(t): return W + t

LOTUS, TITR, TNR = 'B Lotus', 'B Titr', 'Times New Roman'
FA_DIGIT = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
HEAD_RE = re.compile(r'^Heading[1-4]$')
TOC_RE  = re.compile(r'^(TOC[1-9]|TableofFigures)$')
JUNK_LATIN = {
    'Calibri', 'Calibri Light', 'Cambria', 'Courier New', 'Arial',
    'Aptos', 'Aptos Display', 'Tahoma', 'Century Gothic', 'Garamond',
    'MS Mincho', 'SimSun', 'Batang', 'DengXian', 'DengXian Light',
    'Century Schoolbook', 'Book Antiqua', 'Franklin Gothic Demi Cond',
    'Britannic Bold', 'Andalus', 'Traditional Arabic', 'Adobe Arabic',
}
JUNK_FA = {
    'Zar', 'B Zar', 'BZar', 'Nazanin', 'B Nazanin', 'BNazanin',
    'B Nazanin,Bold', 'Yagut', 'B Yagut', 'Mitra', 'B Mitra', 'F_Mitra',
    'Lotus', 'Titr', 'B Koodak', 'IranNastaliq', 'Traffic',
}


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def rpr_of(el, create=False):
    rpr = el.find(q('rPr'))
    if rpr is None and create:
        rpr = etree.Element(q('rPr'))
        el.insert(0, rpr)
    return rpr


def is_on(e):
    if e is None:
        return False
    v = e.get(q('val'))
    return v not in ('0', 'false', 'off') if v is not None else True


def is_bold(rpr):
    return rpr is not None and (is_on(rpr.find(q('b'))) or is_on(rpr.find(q('bCs'))))


def drop(parent, *tags):
    n = 0
    for t in tags:
        for e in parent.findall(q(t)):
            parent.remove(e); n += 1
    return n


def sub(parent, tag, **attrs):
    e = parent.find(q(tag))
    if e is None:
        e = etree.SubElement(parent, q(tag))
    for k, v in attrs.items():
        if v is None:
            continue
        e.set(q(k), v)
    return e


def set_fonts(rpr, cs, latin=TNR):
    rf = rpr.find(q('rFonts'))
    if rf is None:
        rf = etree.Element(q('rFonts'))
        rpr.insert(0, rf)
    for a in list(rf.attrib):
        loc = a.split('}')[-1]
        if loc.endswith('Theme') or loc.endswith('theme') or loc == 'hint':
            del rf.attrib[a]
    rf.set(q('ascii'), latin)
    rf.set(q('hAnsi'), latin)
    rf.set(q('eastAsia'), latin)
    rf.set(q('cs'), cs)
    return rf


def set_size(rpr, half_points):
    sub(rpr, 'sz', val=str(half_points))
    sub(rpr, 'szCs', val=str(half_points))


def set_bold(rpr, on):
    if on:
        if rpr.find(q('b')) is None:
            etree.SubElement(rpr, q('b'))
        if rpr.find(q('bCs')) is None:
            etree.SubElement(rpr, q('bCs'))
    else:
        drop(rpr, 'b', 'bCs')


def clean_junk_fonts(rpr):
    """فونت‌های بلااستفاده را روی ران/سبک موجود به سه‌گانهٔ مجاز برمی‌گرداند."""
    if rpr is None:
        return 0
    rf = rpr.find(q('rFonts'))
    if rf is None:
        return 0
    n = 0
    for a in list(rf.attrib):
        loc = a.split('}')[-1]
        if loc.endswith('Theme') or loc.endswith('theme'):
            del rf.attrib[a]; n += 1
            continue
        if loc == 'hint':
            continue
        v = rf.get(a)
        if not v:
            continue
        if v in JUNK_FA:
            rf.set(a, TITR if v in ('Titr',) else LOTUS); n += 1
        elif v in JUNK_LATIN:
            rf.set(a, TNR); n += 1
    return n


def ensure_style_rpr(style):
    rpr = style.find(q('rPr'))
    if rpr is None:
        rpr = etree.SubElement(style, q('rPr'))
    return rpr


def apply_style(style, cs, latin=TNR, size=None, bold=None, color='000000'):
    rpr = ensure_style_rpr(style)
    set_fonts(rpr, cs, latin)
    if size is not None:
        set_size(rpr, size)
    if bold is not None:
        set_bold(rpr, bold)
    if color is not None:
        sub(rpr, 'color', val=color)
    drop(rpr, 'u')
    return rpr


def replace_toc_title(p, title):
    """عنوان مدخل فهرست را با متن سرتیتر هم‌نام جایگزین می‌کند؛ شماره صفحه می‌ماند."""
    hl = p.find(q('hyperlink'))
    if hl is None:
        return False
    title_runs = []
    for child in list(hl):
        if child.tag != q('r'):
            break
        if (child.find(q('tab')) is not None
                or child.find(q('fldChar')) is not None
                or child.find(q('instrText')) is not None):
            break
        if child.find(q('t')) is not None:
            title_runs.append(child)
    if not title_runs:
        return False
    t_el = title_runs[0].find(q('t'))
    if (t_el.text or '') == title and len(title_runs) == 1:
        return False
    t_el.text = title
    if title.startswith(' ') or title.endswith(' '):
        t_el.set(XML_SPACE, 'preserve')
    for r in title_runs[1:]:
        hl.remove(r)
    return True


def toc_level(sv):
    if sv and sv.startswith('TOC') and sv[-1].isdigit():
        return int(sv[-1])
    return 0


def process_toc_para(p, heading_text, rep):
    sv = style_of(p)
    lvl = toc_level(sv)
    ppr = p.find(q('pPr'))
    if ppr is not None:
        rpr = rpr_of(ppr, create=True)
        set_fonts(rpr, LOTUS)
        set_size(rpr, 24)
        set_bold(rpr, lvl == 1)
        drop(rpr, 'u')
        sub(rpr, 'color', val='000000')

    if heading_text:
        if replace_toc_title(p, heading_text):
            rep['toc_text'] += 1

    hl = p.find(q('hyperlink'))
    in_title = True
    # ترتیب سند: ران‌های داخل hyperlink
    targets = list(hl) if hl is not None else list(p)
    for child in targets:
        if child.tag != q('r'):
            continue
        if (child.find(q('tab')) is not None
                or child.find(q('fldChar')) is not None
                or child.find(q('instrText')) is not None):
            in_title = False
        rpr = rpr_of(child, create=True)
        set_fonts(rpr, LOTUS)
        set_size(rpr, 24)
        sub(rpr, 'color', val='000000')
        drop(rpr, 'u')
        rs = rpr.find(q('rStyle'))
        if rs is not None and rs.get(q('val')) == 'Hyperlink':
            rpr.remove(rs)
        set_bold(rpr, bool(lvl == 1 and in_title and child.find(q('t')) is not None))
        rep['toc_runs'] += 1

    # فیلد TOC در ابتدای نخستین مدخل (بیرون hyperlink)
    for r in p.findall(q('r')):
        rpr = rpr_of(r, create=True)
        set_fonts(rpr, LOTUS)
        set_size(rpr, 24)
        sub(rpr, 'color', val='000000')
        # فیلد دستور TOC را بولد نکن
        if r.find(q('instrText')) is not None or r.find(q('fldChar')) is not None:
            set_bold(rpr, False)
        # dirty را خاموش کن تا ورد هنگام باز کردن، Titr را از سرتیتر برنگرداند
        fc = r.find(q('fldChar'))
        if fc is not None and fc.get(q('dirty')) == 'true':
            del fc.attrib[q('dirty')]
            rep['toc_dirty'] += 1


def process_heading(p, rep):
    sv = style_of(p)
    sizes = {'Heading1': 56, 'Heading2': 30, 'Heading3': 30, 'Heading4': 30}
    sz = sizes.get(sv, 30)
    ppr = p.find(q('pPr'))
    if ppr is not None:
        rpr = rpr_of(ppr, create=True)
        set_fonts(rpr, TITR)
        set_size(rpr, sz)
        set_bold(rpr, True)
        drop(rpr, 'u')
        sub(rpr, 'color', val='000000')
    latin_only = bool(re.fullmatch(r'[A-Za-z0-9 ,.:;\'\"()\-]+', ptext(p).strip() or 'x'))
    cs = TNR if latin_only else TITR
    for r in p.iter(q('r')):
        t = ''.join(x.text or '' for x in r.findall(q('t')))
        if not t:
            continue
        rpr = rpr_of(r, create=True)
        set_fonts(rpr, cs)
        set_size(rpr, sz)
        set_bold(rpr, True)
        sub(rpr, 'color', val='000000')
        drop(rpr, 'u')
        rep['heading_runs'] += 1


def process_caption(p, rep):
    ppr = p.find(q('pPr'))
    if ppr is not None:
        rpr = rpr_of(ppr, create=True)
        set_fonts(rpr, LOTUS)
        set_size(rpr, 24)
        set_bold(rpr, True)
        drop(rpr, 'u')
        sub(rpr, 'color', val='000000')
    for r in p.iter(q('r')):
        rpr = rpr_of(r, create=True)
        set_fonts(rpr, LOTUS)
        set_size(rpr, 24)
        set_bold(rpr, True)
        sub(rpr, 'color', val='000000')
        for t in r.findall(q('t')):
            if t.text and any(c.isdigit() for c in t.text):
                nt = t.text.translate(FA_DIGIT)
                if nt != t.text:
                    t.text = nt
                    rep['caption_digits'] += 1
        rep['caption_runs'] += 1


def unbold_body_ppr(p, rep):
    ppr = p.find(q('pPr'))
    if ppr is None:
        return
    rpr = ppr.find(q('rPr'))
    if rpr is None:
        return
    n = drop(rpr, 'b', 'bCs')
    if n:
        rep['body_ppr'] += 1


def fix_styles(st, rep):
    for style in st.findall(q('style')):
        sid = style.get(q('styleId')) or ''
        if sid == 'Normal':
            apply_style(style, LOTUS, size=28, bold=False)
            rep['styles'] += 1
        elif sid == 'Heading1':
            apply_style(style, TITR, size=56, bold=True)
            rep['styles'] += 1
        elif sid in ('Heading2', 'Heading3', 'Heading4'):
            apply_style(style, TITR, size=30, bold=True)
            rep['styles'] += 1
        elif sid == 'TOC1':
            apply_style(style, LOTUS, size=24, bold=True)
            rep['styles'] += 1
        elif TOC_RE.match(sid):
            apply_style(style, LOTUS, size=24, bold=False)
            rep['styles'] += 1
        elif sid == 'Caption':
            apply_style(style, LOTUS, size=24, bold=True)
            rep['styles'] += 1
        elif sid == 'FootnoteText':
            apply_style(style, LOTUS, size=20, bold=False)
            rep['styles'] += 1
        elif sid == 'NormalWeb':
            apply_style(style, LOTUS, size=24, bold=False)
            rep['styles'] += 1
        elif sid == 'Hyperlink':
            rpr = ensure_style_rpr(style)
            drop(rpr, 'u')
            sub(rpr, 'color', val='000000')
            rep['styles'] += 1
        else:
            rpr = style.find(q('rPr'))
            if rpr is not None:
                rep['style_junk'] += clean_junk_fonts(rpr)

    dd = st.find(q('docDefaults'))
    if dd is not None:
        rpr = dd.find('.//' + q('rPr'))
        if rpr is not None:
            set_fonts(rpr, LOTUS)
            # بدنهٔ فارسی ۱۴ نقطه (پیش‌فرض فعلی)
            if rpr.find(q('sz')) is None:
                set_size(rpr, 28)
            rep['styles'] += 1


def fix_theme(xml_bytes):
    text = xml_bytes.decode('utf-8')
    text2 = text.replace('typeface="Aptos Display"', 'typeface="Times New Roman"')
    text2 = text2.replace('typeface="Aptos"', 'typeface="Times New Roman"')
    return text2.encode('utf-8'), text2 != text


def sweep_part(root, rep):
    """پاک‌سازی فونت‌های متفرقه در هر جزء XML."""
    for rpr in root.iter(q('rPr')):
        n = clean_junk_fonts(rpr)
        if n:
            rep['junk'] += n


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()

    rep = dict(toc_runs=0, toc_text=0, toc_dirty=0, heading_runs=0,
               caption_runs=0, caption_digits=0, body_ppr=0, body_run=0,
               styles=0, style_junk=0, junk=0, theme=0)

    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    blocks = list(body)

    headings, tocs, captions, tofs = [], [], [], []
    for p in body.iter(q('p')):
        sv = style_of(p)
        if sv and HEAD_RE.fullmatch(sv):
            headings.append(p)
        elif sv and re.fullmatch(r'TOC[1-4]', sv):
            tocs.append(p)
        elif sv == 'Caption':
            captions.append(p)
        elif sv == 'TableofFigures':
            tofs.append(p)

    # ---- فهرست مطالب: فونت + همگام‌سازی متن با سرتیتر ----
    for i, p in enumerate(tocs):
        ht = ptext(headings[i]).strip() if i < len(headings) else None
        process_toc_para(p, ht, rep)

    for p in tofs:
        process_toc_para(p, None, rep)

    # ---- سرتیترها ----
    for p in headings:
        process_heading(p, rep)

    # ---- عنوان جدول ----
    for p in captions:
        process_caption(p, rep)

    # ---- بولد pPr بدنه بعد از «فهرست مطالب» ----
    start = 0
    for i, b in enumerate(blocks):
        if b.tag == q('p') and ptext(b).strip() == 'فهرست مطالب':
            start = i
            break
    for b in blocks[start:]:
        if b.tag != q('p'):
            continue
        sv = style_of(b)
        if sv and (HEAD_RE.fullmatch(sv) or sv in ('Caption',) or TOC_RE.match(sv)):
            continue
        unbold_body_ppr(b, rep)
        # v1.1 فقط w:b را برداشته بود؛ فارسی با w:bCs بولد می‌ماند
        for r in b.iter(q('r')):
            rpr = r.find(q('rPr'))
            if rpr is None:
                continue
            if drop(rpr, 'b', 'bCs'):
                rep['body_run'] = rep.get('body_run', 0) + 1

    sweep_part(doc, rep)
    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    st = etree.fromstring(parts['word/styles.xml'])
    fix_styles(st, rep)
    parts['word/styles.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    for name in list(parts):
        if name.startswith('word/') and name.endswith('.xml') and name not in (
                'word/document.xml', 'word/styles.xml'):
            if b'rFonts' not in parts[name] and b'rPr' not in parts[name]:
                continue
            try:
                root = etree.fromstring(parts[name])
            except etree.XMLSyntaxError:
                continue
            before = rep['junk']
            sweep_part(root, rep)
            if rep['junk'] != before:
                parts[name] = etree.tostring(
                    root, xml_declaration=True, encoding='UTF-8', standalone=True)

    if 'word/theme/theme1.xml' in parts:
        parts['word/theme/theme1.xml'], changed = fix_theme(parts['word/theme/theme1.xml'])
        if changed:
            rep['theme'] = 1

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return rep


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.1.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    for k, v in process(src, dst).items():
        print(f'  {k}: {v}')
