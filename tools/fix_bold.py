# -*- coding: utf-8 -*-
"""
یکدست‌سازی ضخامت قلم (بولد) بر پایهٔ نقش پاراگراف.

قاعدهٔ حروف‌چینی پایان‌نامه:
    عنوان فصل / سرتیتر / عنوان جدول / سرآیند جدول → بولد
    بدنهٔ متن / سلول‌های دادهٔ جدول / منابع        → نازک

در سند ۷۵ پاراگراف بلندِ بدنه کاملاً بولد بودند (۳۶٪ کل متن اصلی)
که خواندن را خسته‌کننده و ظاهر را غیرحرفه‌ای می‌کرد. ریشه‌اش
copy-paste از منابع مختلف در نسخه‌های اولیه است.

آنچه دست نمی‌خورد:
  • صفحهٔ عنوان و تعهدنامه و تقدیم‌نامه (پیش از «فهرست مطالب») —
    بولد بودنشان عمدی و درست است.
  • عنوان‌ها با سبک Heading1..4 و Caption.
  • سطر سرآیند جدول‌ها (نخستین tr).
  • تأکیدهای کوتاه درون‌متنی (ران کمتر از ۲۵ نویسه که تنها بخش
    بولدِ پاراگراف است) — ممکن است تأکید عمدی نویسنده باشد.
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

HEAD_STYLE = re.compile(r'Heading[1-4]')
KEEP_STYLE = {'Caption'}
SHORT_EMPHASIS = 25          # ران کوتاه‌تر از این، تأکید عمدی فرض می‌شود


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def in_table(p):
    e = p.getparent()
    while e is not None:
        if e.tag == q('tbl'):
            return True
        e = e.getparent()
    return False


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def unbold(run):
    rpr = run.find(q('rPr'))
    if rpr is None:
        return 0
    n = 0
    for tag in ('b', 'bCs'):
        e = rpr.find(q(tag))
        if e is not None:
            rpr.remove(e); n = 1
    return n


def setbold(run):
    rpr = run.find(q('rPr'))
    if rpr is None:
        rpr = etree.Element(q('rPr')); run.insert(0, rpr)
    n = 0
    for tag in ('b', 'bCs'):
        if rpr.find(q(tag)) is None:
            etree.SubElement(rpr, q(tag)); n = 1
    return n


def runs_with_text(p):
    out = []
    for r in p.findall(q('r')):
        t = ''.join(x.text or '' for x in r.findall(q('t')))
        if t.strip():
            out.append((r, t))
    return out


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    blocks = list(body)

    # مرز صفحات آغازین: تا «فهرست مطالب» دست نمی‌خورد
    start = 0
    for i, b in enumerate(blocks):
        if b.tag == q('p') and ptext(b).strip() == 'فهرست مطالب':
            start = i
            break

    rep = dict(body=0, table_data=0, header_row=0, heading=0, kept=0)

    # ---- بدنه ----
    for i in range(start, len(blocks)):
        b = blocks[i]
        if b.tag != q('p') or in_table(b):
            continue
        sv = style_of(b)
        if sv and (HEAD_STYLE.fullmatch(sv) or sv in KEEP_STYLE):
            # عنوان‌ها باید بولد باشند؛ ۵ عنوان فصل و ۹ عنوان جدول
            # نازک مانده بودند و با بقیهٔ عنوان‌ها ناهمگون بودند.
            for r, _ in runs_with_text(b):
                rep['heading'] += setbold(r)
            continue
        rs = runs_with_text(b)
        if not rs:
            continue
        total = sum(len(t) for _, t in rs)
        bold = [(r, t) for r, t in rs
                if (r.find(q('rPr')) is not None
                    and r.find(q('rPr')).find(q('b')) is not None)]
        if not bold:
            continue
        bl = sum(len(t) for _, t in bold)

        # تأکید کوتاه درون یک پاراگراف عادی → نگه دار
        if total > 60 and bl < total * 0.5 and bl <= SHORT_EMPHASIS:
            rep['kept'] += 1
            continue
        for r, _ in bold:
            rep['body'] += unbold(r)

    # ---- جدول‌ها: سرآیند بولد، دادهٔ نازک ----
    for tbl in body.iter(q('tbl')):
        for ri, tr in enumerate(tbl.findall(q('tr'))):
            for p in tr.iter(q('p')):
                for r, _ in runs_with_text(p):
                    if ri == 0:
                        rep['header_row'] += setbold(r)
                    else:
                        rep['table_data'] += unbold(r)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return rep


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.0.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    for k, v in process(src, dst).items():
        print(f'  {k}: {v}')
