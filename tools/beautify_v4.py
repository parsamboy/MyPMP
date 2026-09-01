# -*- coding: utf-8 -*-
"""
زیباسازی نهایی پایان‌نامه بر پایهٔ قالب Bu-V00 + شیوه‌نامهٔ پیام‌نور.

تصمیم‌های قفل‌شدهٔ کاربر:
  حاشیه   : راست ۳ سانتی‌متر، بقیه ۲٫۵  (گزینهٔ ترکیبی)
  قلم بدنه: B Lotus 14 (فارسی) / Times New Roman 12 (انگلیسی)
  عنوان فصل: B Titr 28 روی صفحهٔ مجزا (حفظ وضع Bu-V00)
  پانویس  : اندازه ۱۲، شماره‌گذاری هر صفحه از ۱
"""
import re, shutil, zipfile, sys, os
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

CM = 566.93
def cm(v): return str(int(round(v * CM)))

MAR = dict(top=cm(2.5), bottom=cm(2.5), left=cm(2.5), right=cm(3.0),
           header=cm(1.25), footer=cm(1.0), gutter='0')

PAGE_W   = 11906                     # A4
TEXT_W   = PAGE_W - int(MAR['left']) - int(MAR['right'])   # عرض واقعی متن

FA_BODY  = 'B Lotus'
FA_TITLE = 'B Titr'
EN_FONT  = 'Times New Roman'

SZ_BODY, SZ_HEAD, SZ_CHAP, SZ_FN = '28', '30', '56', '24'

DIG = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')
FA_RE   = re.compile(r'[\u0600-\u06FF]')
LAT_RE  = re.compile(r'[A-Za-z]')
CHAP_RE = re.compile(r'^\s*فصل\s+(اول|دوم|سوم|چهارم|پنجم)')


def sub(parent, tag, **attrs):
    """زیرعنصر را می‌سازد یا موجود را برمی‌گرداند و ویژگی‌ها را می‌نشاند."""
    e = parent.find(q(tag))
    if e is None:
        e = etree.SubElement(parent, q(tag))
    for k, v in attrs.items():
        e.set(q(k), v)
    return e


def drop(parent, *tags):
    for t in tags:
        for e in parent.findall(q(t)):
            parent.remove(e)


def get_pPr(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    return ppr


def get_rPr(r):
    rpr = r.find(q('rPr'))
    if rpr is None:
        rpr = etree.Element(q('rPr'))
        r.insert(0, rpr)
    return rpr


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def set_font(r, cs_font, size, latin=EN_FONT):
    rpr = get_rPr(r)
    sub(rpr, 'rFonts', ascii=latin, hAnsi=latin, cs=cs_font)
    sub(rpr, 'sz', val=size)
    sub(rpr, 'szCs', val=size)


def persian_digits(p):
    """ارقام لاتین را در ران‌های فارسی به فارسی برمی‌گرداند."""
    for r in p.findall(q('r')):
        txt = ''.join(t.text or '' for t in r.findall(q('t')))
        if not txt or not FA_RE.search(txt):
            continue
        if LAT_RE.search(txt):          # ران آمیخته با واژهٔ لاتین: دست نزن
            continue
        for t in r.findall(q('t')):
            if t.text:
                t.text = t.text.translate(DIG)


def make_rtl(p):
    ppr = get_pPr(p)
    sub(ppr, 'bidi')
    for r in p.findall(q('r')):
        sub(get_rPr(r), 'rtl')


def make_ltr(p):
    """جهت پاراگراف را LTR می‌کند.

    چون sectPr روی bidi است، حذف صرف <w:bidi> کافی نیست؛ باید
    صراحتاً bidi=0 نوشته شود وگرنه ورد جهت را از بخش ارث می‌برد
    و نقطهٔ پایان جمله به ابتدای سطر می‌پرد.
    """
    ppr = get_pPr(p)
    drop(ppr, 'bidi')
    sub(ppr, 'bidi', val='0')
    sub(ppr, 'jc', val='left')
    ppr_rpr = ppr.find(q('rPr'))
    if ppr_rpr is not None:
        drop(ppr_rpr, 'rtl')
        sub(ppr_rpr, 'rtl', val='0')
    for r in p.findall(q('r')):
        rpr = get_rPr(r)
        drop(rpr, 'rtl', 'rtlGutter')
        sub(rpr, 'rtl', val='0')
        sub(rpr, 'rFonts', ascii=EN_FONT, hAnsi=EN_FONT, cs=EN_FONT)
        sub(rpr, 'sz', val='24')        # تایمز ۱۲
        sub(rpr, 'szCs', val='24')


def classify(p):
    """نقش پاراگراف را تعیین می‌کند."""
    txt = ptext(p).strip()
    if not txt:
        return 'empty'
    fa, la = len(FA_RE.findall(txt)), len(LAT_RE.findall(txt))
    if la > 3 and fa < 3:
        return 'english'
    ppr = p.find(q('pPr'))
    if ppr is not None and ppr.find(q('pageBreakBefore')) is not None \
       and CHAP_RE.match(txt) and len(txt) < 60:
        return 'chapter'
    for r in p.findall(q('r')):
        rpr = r.find(q('rPr'))
        if rpr is None:
            continue
        f, s = rpr.find(q('rFonts')), rpr.find(q('sz'))
        if f is not None and f.get(q('cs')) == FA_TITLE:
            return 'chapter' if (s is not None and s.get(q('val')) == SZ_CHAP) else 'heading'
    if re.match(r'^[۰-۹0-9]+(-[۰-۹0-9]+)*-\s*\S', txt) and len(txt) < 90:
        return 'heading'
    return 'body'


def fix_toc_line(p, pages=None):
    """شمارهٔ صفحهٔ چسبیده را با Tab از عنوان جدا می‌کند تا نقطه‌چین بنشیند.

    اگر سطر شماره نداشته باشد، از نقشهٔ مرجع (Bu-V00) بازیابی می‌شود.
    سطرهای «فصل اول/دوم/…» عنوان گروه‌اند و شماره نمی‌گیرند.
    """
    txt = ptext(p).strip()
    if not txt:
        return False
    m = re.match(r'^(.*?[^\s\u06F0-\u06F9])\s*([\u06F0-\u06F9]{1,3})\s*$', txt)
    if m:
        title, page = m.group(1).rstrip(), m.group(2)
    else:
        if CHAP_RE.match(txt):          # سرگروه فهرست: بدون شماره
            return False
        page = (pages or {}).get(norm_key(txt))
        if not page:
            return False
        title = txt

    proto = None
    for r in p.findall(q('r')):
        rpr = r.find(q('rPr'))
        if rpr is not None:
            proto = rpr
            break

    for r in p.findall(q('r')):
        p.remove(r)

    def mk(text=None, tab=False):
        r = etree.SubElement(p, q('r'))
        if proto is not None:
            r.append(etree.fromstring(etree.tostring(proto)))
        if tab:
            etree.SubElement(r, q('tab'))
        else:
            t = etree.SubElement(r, q('t'))
            t.text = text
            t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        return r

    mk(title); mk(tab=True); mk(page)

    ppr = get_pPr(p)
    tabs = ppr.find(q('tabs'))
    if tabs is None:
        tabs = etree.SubElement(ppr, q('tabs'))
    for t in tabs.findall(q('tab')):
        tabs.remove(t)
    tb = etree.SubElement(tabs, q('tab'))
    tb.set(q('val'), 'right'); tb.set(q('pos'), str(TEXT_W)); tb.set(q('leader'), 'dot')
    return True


def load_toc_pages(ref='Payannameh_Fatemeh.Bayat-(Bu-V00).docx'):
    """نقشهٔ «عنوان نرمال‌شده → شمارهٔ صفحه» از فهرست مرجع."""
    pages = {}
    if not os.path.exists(ref):
        return pages
    z = zipfile.ZipFile(ref)
    doc = etree.fromstring(z.read('word/document.xml'))
    z.close()
    for b in list(doc[0]):
        if b.tag != q('p'):
            continue
        ppr = b.find(q('pPr'))
        if ppr is None or not any(t.get(q('leader')) == 'dot' for t in ppr.iter(q('tab'))):
            continue
        txt = ptext(b).strip()
        m = re.match(r'^(.*?[^\s\u06F0-\u06F9])\s*([\u06F0-\u06F9]{1,3})\s*$', txt)
        if m:
            pages[norm_key(m.group(1))] = m.group(2)
    return pages


def norm_key(s):
    """کلید تطبیق: حذف فاصله، نیم‌فاصله، دونقطه و ی/ک عربی."""
    s = s.replace('\u200c', '').replace('ي', 'ی').replace('ك', 'ک')
    s = re.sub(r'[\s:ـ]', '', s)
    return s


def in_toc(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        return False
    for t in ppr.iter(q('tab')):
        if t.get(q('leader')) == 'dot':
            return True
    return False


def toc_range(body):
    """بازهٔ بلوک‌های فهرست مطالب/جداول: از «فهرست مطالب» تا اولین صفحهٔ فصل."""
    blocks = list(body)
    start = end = None
    for i, b in enumerate(blocks):
        if b.tag != q('p'):
            continue
        t = ptext(b).strip()
        if start is None:
            if t in ('فهرست مطالب', 'فهرست جداول'):
                start = i
            continue
        ppr = b.find(q('pPr'))
        if ppr is not None and ppr.find(q('pageBreakBefore')) is not None \
           and CHAP_RE.match(t):
            end = i
            break
    if start is None:
        return []
    if end is None:
        end = len(blocks)
    out = []
    for b in blocks[start:end]:
        out.append(b)
        if b.tag != q('p'):
            out.extend(b.iter(q('p')))
    return out          # ارجاع‌ها زنده می‌مانند تا id() پایدار بماند


def process(src, dst):
    shutil.copy(src, dst)
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()

    toc_pages = load_toc_pages()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    toc_blocks = toc_range(body)      # نگه‌داشتن ارجاع = پایداری id
    toc_ids = {id(b) for b in toc_blocks}
    stats = dict(chapter=0, heading=0, body=0, english=0, toc=0, empty=0)

    for p in body.iter(q('p')):
        kind = classify(p)
        ppr = get_pPr(p)

        if kind == 'english':
            make_ltr(p); stats['english'] += 1; continue

        if kind == 'empty':
            # پاراگراف خالی هم اگر تب نقطه‌چین دارد یکدست شود
            for tb in p.iter(q('tab')):
                if tb.get(q('leader')) == 'dot':
                    tb.set(q('pos'), str(TEXT_W))
            stats['empty'] += 1; continue

        make_rtl(p)
        persian_digits(p)

        if id(p) in toc_ids or in_toc(p):
            # تب نقطه‌چین همهٔ سطرهای فهرست روی عرض واقعی متن یکدست شود،
            # حتی سطرهایی که شمارهٔ صفحه ندارند (وگرنه ۹۰۲۶ قدیمی می‌ماند).
            for tb in p.iter(q('tab')):
                if tb.get(q('leader')) == 'dot':
                    tb.set(q('pos'), str(TEXT_W))
            if fix_toc_line(p, toc_pages):
                stats['toc'] += 1
            else:
                stats['toc_skipped'] = stats.get('toc_skipped', 0) + 1
            for r in p.findall(q('r')):
                set_font(r, FA_BODY, SZ_BODY)
                rpr = get_rPr(r)
                if not CHAP_RE.match(ptext(p).strip()):
                    drop(rpr, 'b', 'bCs')
            drop(ppr, 'outlineLvl')
            continue

        if kind == 'chapter':
            sub(ppr, 'jc', val='center')
            # صفحه‌شکن فقط اگر از قبل بوده؛ خط دوم عنوان نباید به صفحهٔ بعد بپرد
            sub(ppr, 'keepNext')
            for r in p.findall(q('r')):
                set_font(r, FA_TITLE, SZ_CHAP)
                sub(get_rPr(r), 'b'); sub(get_rPr(r), 'bCs')
            stats['chapter'] += 1

        elif kind == 'heading':
            drop(ppr, 'jc')
            sub(ppr, 'spacing', before='240', after='100', line='276', lineRule='auto')
            sub(ppr, 'keepNext')
            for r in p.findall(q('r')):
                set_font(r, FA_TITLE, SZ_HEAD)
                sub(get_rPr(r), 'b'); sub(get_rPr(r), 'bCs')
            stats['heading'] += 1

        else:
            sub(ppr, 'jc', val='both')
            sub(ppr, 'spacing', line='276', lineRule='auto', after='0')
            sub(ppr, 'ind', firstLine='397')
            for r in p.findall(q('r')):
                set_font(r, FA_BODY, SZ_BODY)
            stats['body'] += 1

    # ---- بخش‌ها: حاشیه، پاصفحه، شروع مجدد پانویس ----
    for sec in body.iter(q('sectPr')):
        sub(sec, 'pgSz', w=str(PAGE_W), h='16838')
        sub(sec, 'pgMar', **MAR)
        sub(sec, 'bidi')
        fp = sec.find(q('footnotePr'))
        if fp is None:
            fp = etree.Element(q('footnotePr'))
            sec.insert(0, fp)
        sub(fp, 'numRestart', val='eachPage')

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- پانویس‌ها: اندازه ۱۲ ----
    fn = etree.fromstring(parts['word/footnotes.xml'])
    nfn = 0
    for note in fn.findall(q('footnote')):
        nid = note.get(q('id'))
        if nid is None or int(nid) <= 0:
            continue
        nfn += 1
        for r in note.iter(q('r')):
            rpr = get_rPr(r)
            sub(rpr, 'sz', val=SZ_FN)
            sub(rpr, 'szCs', val=SZ_FN)
    parts['word/footnotes.xml'] = etree.tostring(
        fn, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- settings: شروع مجدد پانویس ----
    st = etree.fromstring(parts['word/settings.xml'])
    fpr = st.find(q('footnotePr'))
    if fpr is None:
        fpr = etree.Element(q('footnotePr'))
        st.insert(0, fpr)
    sub(fpr, 'numRestart', val='eachPage')
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- سبک پیش‌فرض ----
    sty = etree.fromstring(parts['word/styles.xml'])
    dd = sty.find(q('docDefaults'))
    if dd is not None:
        rd = dd.find(q('rPrDefault'))
        if rd is not None:
            rpr = rd.find(q('rPr'))
            if rpr is None:
                rpr = etree.SubElement(rd, q('rPr'))
            sub(rpr, 'rFonts', ascii=EN_FONT, hAnsi=EN_FONT,
                cs=FA_BODY, eastAsia='Calibri')
            sub(rpr, 'sz', val=SZ_BODY)
            sub(rpr, 'szCs', val=SZ_BODY)
    parts['word/styles.xml'] = etree.tostring(
        sty, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for n, d in parts.items():
            z.writestr(n, d)

    stats['footnotes'] = nfn
    return stats


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-v3-content.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-v4-formatted.docx'
    s = process(src, dst)
    print('نوشته شد:', dst, os.path.getsize(dst), 'بایت')
    print('عرض متن (twip):', TEXT_W, '| حاشیه:', MAR['right'], '/', MAR['left'])
    for k, v in s.items():
        print(f'  {k:10s} {v}')
