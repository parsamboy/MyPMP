# -*- coding: utf-8 -*-
"""
اصلاح شماره‌گذاری سرتیترها و همگام‌سازی سطح Heading با عمق شماره.

دو ایراد در سند بود:

۱) شماره‌های معکوس — نویسنده در برخی بخش‌ها از راست به چپ شماره داده:
       «۴-۳-۲-۱-۲- نظریه استمرار»  یعنی فصل۲ › بخش۱ › ۲ › ۳ › ۴
   ولی جای دیگر از چپ به راست:
       «۲-۲-۲-۴- نظریه دلبستگی»    یعنی فصل۲ › ۲ › ۲ › ۴
   قاعدهٔ تشخیص: شمارهٔ اولِ درست باید برابر شمارهٔ فصل جاری باشد.
   اگر شمارهٔ *آخر* برابر فصل بود ⇒ رشته معکوس است و باید برگردد.

۲) سطح Heading با عمق شماره نمی‌خواند — «۲-۴-۲-۱-» چهار جزء دارد
   پس Heading4 است، نه Heading3. فیلد TOC با سوییچ \\o "1-4" سطح‌ها
   را از همین‌جا می‌خواند، برای همین فهرست فصل ۴ (و بقیه) تورفتگی
   و ترتیب غلط نشان می‌داد.

هر دو با هم اصلاح می‌شوند و متن عنوان دست نمی‌خورد.
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t
XMLSP = '{http://www.w3.org/XML/1998/namespace}space'

FA = '۰۱۲۳۴۵۶۷۸۹'
CHAP = {'اول': 1, 'دوم': 2, 'سوم': 3, 'چهارم': 4, 'پنجم': 5}
CHAP_RE = re.compile(r'^\s*فصل\s+(اول|دوم|سوم|چهارم|پنجم)')
NUM_RE  = re.compile(r'^\s*([۰-۹]+(?:-[۰-۹]+)*)\s*-\s*(.*)$', re.S)
MAX_LVL = 4                      # مطابق سوییچ TOC \o "1-4"


def fa2i(s):
    return int(''.join(str(FA.index(c)) for c in s))


def i2fa(n):
    return ''.join(FA[int(d)] for d in str(n))


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def set_style(p, style):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr')); p.insert(0, ppr)
    e = ppr.find(q('pStyle'))
    if e is None:
        e = etree.Element(q('pStyle')); ppr.insert(0, e)
    e.set(q('val'), style)


def rewrite_text(p, new_text):
    """متن پاراگراف را بازنویسی می‌کند و قالب ران نخست را نگه می‌دارد."""
    ts = list(p.iter(q('t')))
    if not ts:
        return False
    ts[0].text = new_text
    ts[0].set(XMLSP, 'preserve')
    for t in ts[1:]:
        t.text = ''
    return True


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    chap = 0
    last_sibling = None
    fixed_num, fixed_lvl = [], []

    for p in body.iter(q('p')):
        ppr = p.find(q('pPr'))
        s = ppr.find(q('pStyle')) if ppr is not None else None
        sv = s.get(q('val')) if s is not None else None
        if not sv or not sv.startswith('Heading'):
            continue

        raw = ptext(p).strip()

        m = CHAP_RE.match(raw)
        if m:
            chap = CHAP[m.group(1)]
            last_sibling = None
            set_style(p, 'Heading1')
            continue

        if raw in ('منابع فارسی', 'منابع لاتین', 'ABSTRACT', 'چکیده'):
            set_style(p, 'Heading1')
            continue

        nm = NUM_RE.match(raw)
        if not nm or not chap:
            continue

        nums = [fa2i(x) for x in nm.group(1).split('-')]
        title = nm.group(2).strip()

        # --- ۱) رشتهٔ معکوس؟ ---
        # حالت آشکار: شمارهٔ اول با فصل نمی‌خواند ولی شمارهٔ آخر می‌خواند.
        rev = len(nums) > 1 and nums[0] != chap and nums[-1] == chap

        # حالت پنهان: شمارهٔ اول تصادفاً برابر فصل است (مثل «۲-۲-۱-۲-»
        # در فصل ۲) پس تست بالا رد می‌شود. اما اگر پیشوندِ والدِ
        # قبلی با معکوسِ رشته جور دربیاید و با خودش نه، معکوس است.
        if not rev and len(nums) > 2 and last_sibling:
            rv = nums[::-1]
            pref = last_sibling[:len(rv) - 1]
            if rv[:len(rv) - 1] == pref and nums[:len(nums) - 1] != pref:
                rev = True

        if rev:
            nums = nums[::-1]
            new = '-'.join(i2fa(n) for n in nums) + '- ' + title
            if rewrite_text(p, new):
                fixed_num.append((raw[:46], new[:46]))
            raw = new

        last_sibling = nums

        # --- ۲) سطح Heading = عمق شماره ---
        lvl = min(len(nums), MAX_LVL)
        want = f'Heading{lvl}'
        if sv != want:
            set_style(p, want)
            fixed_lvl.append((raw[:52], sv, want))

    # فیلدها dirty شوند تا ورد فهرست را از نو بسازد
    n_dirty = 0
    for fc in body.iter(q('fldChar')):
        if fc.get(q('fldCharType')) == 'begin':
            fc.set(q('dirty'), 'true'); n_dirty += 1

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)

    st = etree.fromstring(parts['word/settings.xml'])
    uf = st.find(q('updateFields'))
    if uf is None:
        uf = etree.SubElement(st, q('updateFields'))
    uf.set(q('val'), 'true')
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return fixed_num, fixed_lvl, n_dirty


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-final.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    num, lvl, d = process(src, dst)
    print(f'شماره‌های معکوسِ اصلاح‌شده: {len(num)}')
    for a, b in num:
        print(f'   {a}  →  {b}')
    print(f'\nسطح Heading اصلاح‌شده: {len(lvl)}')
    for t, o, n in lvl:
        print(f'   {o} → {n}   {t}')
    print(f'\nفیلدهای dirty: {d}')
