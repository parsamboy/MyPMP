# -*- coding: utf-8 -*-
"""
تبدیل فهرست دستی به فهرست خودکار ورد.

۱) به عنوان‌های واقعی سبک Heading1..4 می‌دهد (فیلد TOC فقط همین‌ها را می‌بیند).
۲) بلوک فهرست دستی را با یک فیلد TOC واقعی جایگزین می‌کند.
۳) فهرست جداول را هم با فیلد TOC مبتنی بر برچسب «جدول» می‌سازد.

نکته: ورد فیلد را هنگام باز شدن سند محاسبه می‌کند؛ با dirty="true"
خودِ ورد بدون نیاز به F9 دستی آن را به‌روز می‌کند.
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t
XMLSP = '{http://www.w3.org/XML/1998/namespace}space'

CHAP_RE = re.compile(r'^\s*فصل\s+(اول|دوم|سوم|چهارم|پنجم)')
NUM_RE  = re.compile(r'^([۰-۹0-9]+(?:-[۰-۹0-9]+)*)-\s*\S')
TBL_RE  = re.compile(r'^جدول\s*[۰-۹0-9]')
FA_TITLE, FA_BODY = 'B Titr', 'B Lotus'
TEXT_W = 8788


def ptext(p): return ''.join(t.text or '' for t in p.iter(q('t')))


def get_pPr(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    return ppr


def set_style(p, style):
    ppr = get_pPr(p)
    for e in ppr.findall(q('pStyle')):
        ppr.remove(e)
    e = etree.Element(q('pStyle'))
    e.set(q('val'), style)
    ppr.insert(0, e)


def run(text=None, tab=False, size='28', font=FA_BODY, bold=False, rtl=True):
    r = etree.Element(q('r'))
    rpr = etree.SubElement(r, q('rPr'))
    f = etree.SubElement(rpr, q('rFonts'))
    f.set(q('ascii'), 'Times New Roman'); f.set(q('hAnsi'), 'Times New Roman')
    f.set(q('cs'), font)
    if bold:
        etree.SubElement(rpr, q('b')); etree.SubElement(rpr, q('bCs'))
    for tag in ('sz', 'szCs'):
        e = etree.SubElement(rpr, q(tag)); e.set(q('val'), size)
    if rtl:
        etree.SubElement(rpr, q('rtl'))
    if tab:
        etree.SubElement(r, q('tab'))
    elif text is not None:
        t = etree.SubElement(r, q('t')); t.text = text; t.set(XMLSP, 'preserve')
    return r


def toc_field(instr, heading_text):
    """پاراگراف‌های تشکیل‌دهندهٔ یک فیلد TOC را برمی‌گرداند."""
    out = []

    # عنوان بخش
    h = etree.Element(q('p'))
    ppr = etree.SubElement(h, q('pPr'))
    etree.SubElement(ppr, q('bidi'))
    jc = etree.SubElement(ppr, q('jc')); jc.set(q('val'), 'center')
    sp = etree.SubElement(ppr, q('spacing'))
    sp.set(q('after'), '240'); sp.set(q('line'), '276'); sp.set(q('lineRule'), 'auto')
    pb = etree.SubElement(ppr, q('pageBreakBefore'))
    h.append(run(heading_text, size='32', font=FA_TITLE, bold=True))
    out.append(h)

    # پاراگراف حامل فیلد
    p = etree.Element(q('p'))
    ppr = etree.SubElement(p, q('pPr'))
    etree.SubElement(ppr, q('bidi'))
    tabs = etree.SubElement(ppr, q('tabs'))
    tb = etree.SubElement(tabs, q('tab'))
    tb.set(q('val'), 'right'); tb.set(q('pos'), str(TEXT_W)); tb.set(q('leader'), 'dot')

    r1 = run(rtl=False)
    fc = etree.SubElement(r1, q('fldChar'))
    fc.set(q('fldCharType'), 'begin'); fc.set(q('dirty'), 'true')
    p.append(r1)

    r2 = run(rtl=False)
    it = etree.SubElement(r2, q('instrText')); it.set(XMLSP, 'preserve'); it.text = instr
    p.append(r2)

    r3 = run(rtl=False)
    etree.SubElement(r3, q('fldChar')).set(q('fldCharType'), 'separate')
    p.append(r3)

    p.append(run('برای به‌روزرسانی: کلیک راست ← Update Field'))

    r5 = run(rtl=False)
    etree.SubElement(r5, q('fldChar')).set(q('fldCharType'), 'end')
    p.append(r5)
    out.append(p)
    return out


def is_caption(blocks, j):
    """عنوان واقعی جدول است اگر بلوک مجاورش یک جدول باشد.

    سطرهایی مثل «جدول ۴-۳، فراوانی … را نشان می‌دهد» ارجاع درون‌متنی‌اند
    و نباید وارد فهرست جداول شوند.
    """
    t = ptext(blocks[j]).strip()
    if re.search(r'(نشان می|ارائه شده|مشاهده می|بر اساس)', t):
        return False
    for k in (j + 1, j + 2, j - 1):
        if 0 <= k < len(blocks) and blocks[k].tag == q('tbl'):
            return True
    return False


def depth(t):
    m = NUM_RE.match(t)
    return len(m.group(1).split('-')) if m else 0


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    blocks = list(body)

    # ---- مرزهای فهرست دستی ----
    i_toc = i_tbl = i_ch1 = None
    for i, b in enumerate(blocks):
        if b.tag != q('p'):
            continue
        t = ptext(b).strip()
        if i_toc is None and t == 'فهرست مطالب':
            i_toc = i
        elif i_tbl is None and t == 'فهرست جداول':
            i_tbl = i
        elif i_ch1 is None and CHAP_RE.match(t) and \
                b.find(q('pPr')) is not None and \
                b.find(q('pPr')).find(q('pageBreakBefore')) is not None:
            i_ch1 = i
            break

    # ---- سبک‌دهی به عنوان‌های بدنه (بعد از فهرست‌ها) ----
    stats = {1: 0, 2: 0, 3: 0, 4: 0, 'table': 0}
    seen_refs = [0]
    n = len(blocks)
    j = i_ch1
    while j < n:
        b = blocks[j]
        if b.tag != q('p'):
            j += 1; continue
        t = ptext(b).strip()
        ppr = b.find(q('pPr'))
        is_pb = ppr is not None and ppr.find(q('pageBreakBefore')) is not None

        # صفحهٔ عنوان فصل: «فصل اول:» + سطرهای ادامه را در یک Heading1 ادغام کن
        if is_pb and CHAP_RE.match(t):
            k, tail = j + 1, []
            while k < n and blocks[k].tag == q('p'):
                nt = ptext(blocks[k]).strip()
                nppr = blocks[k].find(q('pPr'))
                if not nt:
                    k += 1; continue
                if (nppr is not None and nppr.find(q('pageBreakBefore')) is not None) \
                   or NUM_RE.match(nt) or len(nt) > 45:
                    break
                tail.append(nt); k += 1
            head = t if t.rstrip().endswith(':') else t.rstrip() + ':'
            full = head + (' ' + ' '.join(tail) if tail else '')
            for r in b.findall(q('r')):
                b.remove(r)
            b.append(run(full, size='56', font=FA_TITLE, bold=True))
            set_style(b, 'Heading1')
            for d in range(j + 1, k):
                if blocks[d].tag == q('p') and ptext(blocks[d]).strip():
                    body.remove(blocks[d])
            stats[1] += 1
            j = k; continue

        d = depth(t)
        if d and len(t) < 120:
            lvl = min(max(d, 2), 4)
            set_style(b, f'Heading{lvl}')
            stats[lvl] += 1
        elif t in ('منابع', 'ABSTRACT', 'چکیده') and len(t) < 20:
            # سند دو بخش «منابع» دارد (فارسی و لاتین) با عنوان یکسان؛
            # در فهرست خودکار باید از هم تفکیک شوند.
            if t == 'منابع':
                seen_refs[0] += 1
                label = 'منابع فارسی' if seen_refs[0] == 1 else 'منابع لاتین'
                for r in b.findall(q('r')):
                    b.remove(r)
                b.append(run(label, size='32', font=FA_TITLE, bold=True))
            set_style(b, 'Heading1'); stats[1] += 1
        elif TBL_RE.match(t) and len(t) < 140 and is_caption(blocks, j):
            # فیلد "TOC \c" فقط عنوان‌هایی را می‌بیند که فیلد SEQ داشته باشند.
            # عنوان جدول را به «جدول <SEQ> - متن» تبدیل می‌کنیم.
            m = re.match(r'^(جدول\s*)([۰-۹0-9]+)-([۰-۹0-9]+)(\s*-?\s*)(.*)$', t)
            if m:
                set_style(b, 'Caption')
                chap, num, rest = m.group(2), m.group(3), m.group(5)
                for r in b.findall(q('r')):
                    b.remove(r)
                # «جدول ۴-» ثابت + فیلد SEQ برای شمارهٔ دوم، تا هم در فهرست
                # جداول دیده شود و هم شمارهٔ نمایشی «۴-۱» بماند.
                b.append(run('جدول ' + chap + '-', size='24', bold=True))
                r1 = run(rtl=False)
                etree.SubElement(r1, q('fldChar')).set(q('fldCharType'), 'begin')
                b.append(r1)
                r2 = run(rtl=False)
                it = etree.SubElement(r2, q('instrText'))
                it.set(XMLSP, 'preserve')
                it.text = r' SEQ جدول \* ARABIC '
                b.append(r2)
                r3 = run(rtl=False)
                etree.SubElement(r3, q('fldChar')).set(q('fldCharType'), 'separate')
                b.append(r3)
                b.append(run(num, size='24', bold=True))
                r5 = run(rtl=False)
                etree.SubElement(r5, q('fldChar')).set(q('fldCharType'), 'end')
                b.append(r5)
                b.append(run('- ' + rest, size='24', bold=True))
            stats['table'] += 1
        j += 1

    # ---- جایگزینی فهرست دستی با فیلدها ----
    # چکیده بین «فهرست جداول» و فصل اول قرار دارد و محتوای واقعی است؛
    # بازهٔ حذف باید پیش از آن متوقف شود، وگرنه چکیده هم پاک می‌شود.
    i_stop = i_ch1
    for k in range(i_toc, i_ch1):
        if blocks[k].tag == q('p') and ptext(blocks[k]).strip().startswith('چکیده'):
            i_stop = k
            break

    old = blocks[i_toc:i_stop]
    anchor = blocks[i_stop]

    # مرز بخش (sectPr ابجد → عددی) داخل یکی از پاراگراف‌های حذف‌شونده است؛
    # پیش از حذف باید نجات داده شود وگرنه شماره‌گذاری مقدمات از بین می‌رود.
    rescued = None
    for b in old:
        if b.tag != q('p'):
            continue
        ppr = b.find(q('pPr'))
        if ppr is not None and ppr.find(q('sectPr')) is not None:
            rescued = ppr.find(q('sectPr'))
            break

    for b in old:
        body.remove(b)

    new = toc_field(r' TOC \o "1-4" \h \z \u ', 'فهرست مطالب')
    new += toc_field(r' TOC \h \z \c "جدول" ', 'فهرست جداول')

    if rescued is not None:
        # پاراگراف حامل مرز بخش، پس از فهرست‌ها و پیش از فصل اول
        holder = etree.Element(q('p'))
        hppr = etree.SubElement(holder, q('pPr'))
        hppr.append(rescued)
        new.append(holder)

    for p in new:                      # به ترتیب، نه معکوس
        anchor.addprevious(p)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- settings: ورد هنگام باز شدن فیلدها را به‌روز کند ----
    st = etree.fromstring(parts['word/settings.xml'])
    if st.find(q('updateFields')) is None:
        e = etree.SubElement(st, q('updateFields'))
        e.set(q('val'), 'true')
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)

    stats['removed'] = len(old)
    return stats


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-v4-formatted.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-v5-autotoc.docx'
    s = process(src, dst)
    print('نوشته شد:', dst)
    for k, v in s.items():
        print(f'  {k}: {v}')
