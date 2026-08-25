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

    nf = len([x for x in fn.findall(q('footnote'))
              if x.get(q('id')) and int(x.get(q('id'))) > 0])
    nref = len(list(body.iter(q('footnoteReference'))))
    row('پانویس / ارجاع', f'{nf} / {nref}', nf == nref)
    row('جدول', sum(1 for b in body if b.tag == q('tbl')), True)
    row('بخش (sectPr)', len(list(body.iter(q('sectPr')))), True)
    row('شناسنامهٔ انگلیسی', 'Payame Noor University' in txt,
        'Payame Noor University' in txt)

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
