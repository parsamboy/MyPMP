# -*- coding: utf-8 -*-
"""
بازبینی سند بدون LibreOffice.

چرا LibreOffice در دسترس نیست (آزموده شد):
    apt              → مخازن deb.debian.org و همهٔ آینه‌ها مسدودند
    AppImage گیت‌هاب → objects.githubusercontent.com مسدود است
    PyPI             → بستهٔ libreoffice/soffice وجود ندارد
    unoserver        → فقط پوسته است و به soffice نصب‌شده نیاز دارد
    weasyprint       → به libpango سیستمی نیاز دارد که نصب نیست
تنها PyPI و api.github.com بازند.

جایگزین عملی: pandoc (از راه wheel «pypandoc-binary»، بدون وابستگی
سیستمی). برای بازبینی محتوا از Spire.Doc بهتر است چون سقف
۵۰۰ پاراگراف / ۳ صفحه ندارد و کل سند را یک‌جا می‌خواند.

کاربردها:
    python3 tools/verify.py text  <file>   استخراج کامل متن
    python3 tools/verify.py odt   <file>   تبدیل به ODT (قالب LibreOffice)
    python3 tools/verify.py html  <file>   خروجی HTML برای مرور در مرورگر
    python3 tools/verify.py check <file>   بازبینی خودکار سلامت
"""
import re, sys, os, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t


def to_text(src, out='/tmp/verify.txt'):
    import pypandoc
    t = pypandoc.convert_file(src, 'plain', extra_args=['--wrap=none'])
    open(out, 'w', encoding='utf-8').write(t)
    return t, out


def to_odt(src, out=None):
    """ODT قالب بومی LibreOffice است؛ برای بازکردن با LO روی رایانهٔ خود."""
    import pypandoc
    out = out or os.path.splitext(src)[0] + '.odt'
    pypandoc.convert_file(src, 'odt', outputfile=out)
    return out


def to_html(src, out=None):
    """HTML مستقل با تصاویر داخلی — در هر مرورگری باز می‌شود."""
    import pypandoc
    out = out or os.path.splitext(src)[0] + '.html'
    pypandoc.convert_file(src, 'html', outputfile=out,
                          extra_args=['--standalone', '--embed-resources',
                                      '--metadata', 'dir=rtl'])
    return out


def check(src):
    """بازبینی خودکار: زبان، فونت، ردپا، ساختار."""
    z = zipfile.ZipFile(src)
    allb = b''.join(z.read(n) for n in z.namelist())
    doc = etree.fromstring(z.read('word/document.xml'))
    body = doc[0]

    def ptext(p):
        return ''.join(t.text or '' for t in p.iter(q('t')))
    txt = '\n'.join(ptext(p) for p in body.iter(q('p')))
    fn = etree.fromstring(z.read('word/footnotes.xml'))

    rows = []
    def row(label, val, ok):
        rows.append((('✓' if ok else '✗'), label, val))

    # زبان
    ar = len(re.findall(rb'"ar(?:-[A-Za-z]{2,})?"', allb))
    row('کد زبان عربی', ar, ar == 0)
    langs = sorted({m.decode() for m in re.findall(rb'"([a-z]{2}-[A-Z]{2})"', allb)})
    row('کدهای زبان', ','.join(langs), set(langs) <= {'fa-IR', 'en-US'})

    # حروف عربی
    arch = txt.count('ي') + txt.count('ك') + txt.count('ة')
    row('حروف عربی در متن', arch, arch == 0)

    # ردپا
    for term in (b'chatgpt', b'utm_', b'proofErr', b'w:rsid', b'_Hlk'):
        c = allb.count(term)
        row(f'ردپای {term.decode()}', c, c == 0)

    # نگارش
    sp = len(re.findall(r'[^\s.]\s+[،؛:]', txt))
    row('فاصله پیش از نشانه', sp, sp == 0)
    dbl = len(re.findall(r'[ \t]{2,}', txt))
    row('فاصلهٔ چندتایی', dbl, dbl == 0)

    # ساختار
    import collections
    st = collections.Counter()
    for p in body.iter(q('p')):
        ppr = p.find(q('pPr'))
        s = ppr.find(q('pStyle')) if ppr is not None else None
        if s is not None:
            st[s.get(q('val'))] += 1
    hs = {k: v for k, v in st.items() if k.startswith('Heading')}
    ts = {k: v for k, v in st.items() if k.startswith('TOC')}
    match = all(ts.get(f'TOC{i}') == hs.get(f'Heading{i}') for i in (1, 2, 3, 4))
    row('TOC منطبق بر Heading', f'{sorted(ts.items())} / {sorted(hs.items())}', match)

    # outlineLvl سرکش: ورد نویگیشن را از این هم می‌خواند، نه فقط سبک
    def in_table(p):
        e = p.getparent()
        while e is not None:
            if e.tag == q('tbl'):
                return True
            e = e.getparent()
        return False
    stray = 0
    for p in body.iter(q('p')):
        ppr = p.find(q('pPr'))
        if ppr is None or ppr.find(q('outlineLvl')) is None:
            continue
        s2 = ppr.find(q('pStyle'))
        sv2 = s2.get(q('val')) if s2 is not None else None
        if in_table(p) or not (sv2 and re.fullmatch(r'Heading[1-4]', sv2)):
            stray += 1
    row('outlineLvl سرکش', stray, stray == 0)

    nav = 0
    for p in body.iter(q('p')):
        ppr = p.find(q('pPr'))
        if ppr is None:
            continue
        s2 = ppr.find(q('pStyle'))
        sv2 = s2.get(q('val')) if s2 is not None else None
        o = ppr.find(q('outlineLvl'))
        lv = int(o.get(q('val'))) if o is not None else (
            int(sv2[-1]) - 1 if sv2 and re.fullmatch(r'Heading[1-9]', sv2) else None)
        if lv is not None and lv < 9 and in_table(p):
            nav += 1
    row('مدخل نویگیشن از جدول', nav, nav == 0)

    nf = len([x for x in fn.findall(q('footnote'))
              if x.get(q('id')) and int(x.get(q('id'))) > 0])
    nref = len(list(body.iter(q('footnoteReference'))))
    row('پانویس / ارجاع', f'{nf} / {nref}', nf == nref)
    row('جدول', sum(1 for b in body if b.tag == q('tbl')), True)
    row('بخش (sectPr)', len(list(body.iter(q('sectPr')))), True)
    row('شناسنامهٔ انگلیسی', 'Payame Noor University' in txt,
        'Payame Noor University' in txt)

    def fonts_of_rpr(rpr):
        if rpr is None:
            return {}
        rf = rpr.find(q('rFonts'))
        if rf is None:
            return {}
        return {k.split('}')[-1]: v for k, v in rf.attrib.items()}

    def is_bold_rpr(rpr):
        if rpr is None:
            return False
        def on(e):
            if e is None:
                return False
            v = e.get(q('val'))
            return v not in ('0', 'false', 'off') if v is not None else True
        return on(rpr.find(q('b'))) or on(rpr.find(q('bCs')))

    ALLOWED = {'B Lotus', 'B Titr', 'Times New Roman'}
    bad_font = 0
    for rpr in doc.iter(q('rPr')):
        for loc, v in fonts_of_rpr(rpr).items():
            if loc.endswith('Theme') or loc.endswith('theme') or loc == 'hint' or not v:
                continue
            if v not in ALLOWED:
                bad_font += 1
    row('فونت غیرمجاز روی متن', bad_font, bad_font == 0)

    # TOC: فونت مؤثر مدخل‌ها باید B Lotus باشد (نه B Titr)
    toc_titr = 0
    toc_mismatch = 0
    heads, tocs = [], []
    for p in body.iter(q('p')):
        sv = None
        ppr = p.find(q('pPr'))
        s = ppr.find(q('pStyle')) if ppr is not None else None
        if s is not None:
            sv = s.get(q('val'))
        t = ptext(p).strip()
        if sv and re.fullmatch(r'Heading[1-4]', sv):
            heads.append(t)
        elif sv and re.fullmatch(r'TOC[1-4]', sv):
            tocs.append((p, t, sv))
            for r in p.iter(q('r')):
                rpr = r.find(q('rPr'))
                cs = fonts_of_rpr(rpr).get('cs')
                tx = ''.join(x.text or '' for x in r.findall(q('t')))
                if tx.strip() and cs == 'B Titr':
                    toc_titr += 1
    row('B Titr در فهرست مطالب', toc_titr, toc_titr == 0)
    for h, (p, t, sv) in zip(heads, tocs):
        title = re.sub(r'\d+$', '', t).strip()
        if h != title:
            toc_mismatch += 1
    row('عنوان TOC = سرتیتر', toc_mismatch, toc_mismatch == 0)

    # بولد pPr بدنه بعد از فهرست
    start = 0
    blocks = list(body)
    for i, b in enumerate(blocks):
        if b.tag == q('p') and ptext(b).strip() == 'فهرست مطالب':
            start = i
            break
    body_ppr_bold = 0
    for b in blocks[start:]:
        if b.tag != q('p'):
            continue
        sv = None
        ppr = b.find(q('pPr'))
        if ppr is None:
            continue
        s = ppr.find(q('pStyle'))
        if s is not None:
            sv = s.get(q('val'))
        if sv and (re.fullmatch(r'Heading[1-4]', sv) or sv in ('Caption',)
                   or (sv.startswith('TOC') if sv else False)
                   or sv == 'TableofFigures'):
            continue
        if is_bold_rpr(ppr.find(q('rPr'))):
            body_ppr_bold += 1
    row('بولد pPr بدنه بعد از فهرست', body_ppr_bold, body_ppr_bold == 0)

    body_run_bold = 0
    for b in blocks[start:]:
        if b.tag != q('p'):
            continue
        sv = None
        ppr = b.find(q('pPr'))
        if ppr is not None:
            s = ppr.find(q('pStyle'))
            if s is not None:
                sv = s.get(q('val'))
        if sv and (re.fullmatch(r'Heading[1-4]', sv) or sv in ('Caption',)
                   or (sv.startswith('TOC') if sv else False)
                   or sv == 'TableofFigures'):
            continue
        for r in b.iter(q('r')):
            t = ''.join(x.text or '' for x in r.findall(q('t')))
            if not t.strip():
                continue
            if is_bold_rpr(r.find(q('rPr'))):
                body_run_bold += 1
    row('بولد ران بدنه بعد از فهرست', body_run_bold, body_run_bold == 0)

    return rows


USAGE = __doc__

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(USAGE); sys.exit(0)
    mode = sys.argv[1]
    src = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-Fatemeh-Bayat-v1.0.docx'

    if mode == 'text':
        t, out = to_text(src)
        print(f'{len(t):,} نویسه → {out}')
    elif mode == 'odt':
        print('ساخته شد:', to_odt(src))
    elif mode == 'html':
        print('ساخته شد:', to_html(src))
    elif mode == 'check':
        bad = 0
        print('=' * 62)
        print('بازبینی:', src)
        print('=' * 62)
        for mark, label, val in check(src):
            if mark == '✗':
                bad += 1
            print(f'  {mark} {label:26s} {val}')
        print('=' * 62)
        print('نتیجه:', 'همه‌چیز سالم ✓' if bad == 0 else f'{bad} ایراد ✗')
        sys.exit(1 if bad else 0)
    else:
        print(USAGE)
