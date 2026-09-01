# -*- coding: utf-8 -*-
"""
یکدست‌سازی کامل زبان سند: فقط fa-IR و en-US باقی می‌ماند.

ورد سه خصیصهٔ زبان جدا دارد (w:lang):
    @w:bidi     → زبان متن راست‌به‌چپ  (فارسی)
    @w:val      → زبان متن لاتین       (انگلیسی)
    @w:eastAsia → زبان خط شرق آسیا     (استفاده نمی‌شود)

شکلِ ارقامِ فیلدهای PAGE/SEQ/TOC و رفتار غلط‌یاب از همین‌ها می‌آید،
پس هر سه باید تمیز باشند:

    هر گویش عربی (ar-*)      → fa-IR
    هر گویش انگلیسی (en-GB،
      en-CA، …) و fa در val  → en-US
    ja-JP / ko-KR / zh-CN
      و هر مقدار دیگر        → en-US

نکتهٔ آموخته‌شده: هرگز دنبال رشتهٔ ثابت مثل 'ar-SA' نگرد — یک بار
ar-YE (عربی یمن) روی سبک BasicParagraph از همین راه جا ماند.
همیشه با الگو بگرد و در پایان بازبینی کن.
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

FA, EN = 'fa-IR', 'en-US'
AR_ANY = re.compile(r'^ar(-[A-Za-z]{2,})?$', re.I)
FA_ANY = re.compile(r'^fa(-[A-Za-z]{2,})?$', re.I)

LANG_RE = re.compile(rb'w:(?:lang|themeFontLang)')


def fix_root(root):
    """هر سه خصیصهٔ زبان را به fa-IR / en-US می‌برد."""
    n = 0
    for tag in ('lang', 'themeFontLang'):
        for e in root.iter(q(tag)):
            # --- زبان دوسویه: همیشه فارسی ---
            v = e.get(q('bidi'))
            if v and v != FA:
                e.set(q('bidi'), FA); n += 1

            # --- زبان لاتین: همیشه en-US ---
            v = e.get(q('val'))
            if v and v != EN:
                # اگر val به‌اشتباه فارسی/عربی است، جایش bidi است نه val
                e.set(q('val'), EN); n += 1

            # --- شرق آسیا: بلااستفاده، یکدست en-US ---
            v = e.get(q('eastAsia'))
            if v and v != EN:
                e.set(q('eastAsia'), EN); n += 1
    return n


def audit(path):
    """گزارش همهٔ کدهای زبان موجود در بسته."""
    z = zipfile.ZipFile(path)
    found = {}
    for n in z.namelist():
        if not n.endswith('.xml'):
            continue
        try:
            r = etree.fromstring(z.read(n))
        except Exception:
            continue
        for tag in ('lang', 'themeFontLang'):
            for e in r.iter(q(tag)):
                for a in ('val', 'eastAsia', 'bidi'):
                    v = e.get(q(a))
                    if v:
                        found[(a, v)] = found.get((a, v), 0) + 1
    return found


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()

    report = {}
    for name in list(parts):
        if not name.endswith('.xml'):
            continue
        if not LANG_RE.search(parts[name]):
            continue
        root = etree.fromstring(parts[name])
        n = fix_root(root)
        if n:
            parts[name] = etree.tostring(
                root, xml_declaration=True, encoding='UTF-8', standalone=True)
            report[name] = n

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return report


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-final.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    rep = process(src, dst)
    print('نوشته شد:', dst)
    for k, v in rep.items():
        print(f'  {k}: {v} اصلاح')
    print('\nبازبینی پس از اصلاح:')
    for (a, v), c in sorted(audit(dst).items()):
        mark = '✓' if v in (FA, EN) else '✗'
        print(f'  {mark} w:{a:9s} = {v:8s} ×{c}')
