# -*- coding: utf-8 -*-
"""v1.4 از v1.32: تقویت سبک انسانی طبق humanize_text v1.0 (بذر ثابت)."""
import os
import random
import re
import sys
import zipfile
from collections import defaultdict

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import ptext, q, style_of

SRC = 'MasterThesis-Fatemeh-Bayat-v1.32.docx'
DST = 'MasterThesis-Fatemeh-Bayat-v1.4.docx'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
SEED = 20260830  # تاریخ XML
SKIP_STYLES = {
    'EnglishText', 'References', 'Caption',
}


def freeze_xml(el):
    return etree.tostring(el)


def skip_style(st):
    st = st or ''
    if st in SKIP_STYLES:
        return True
    return st.startswith(('TOC', 'Heading', 'PersianRef'))


def is_tree_dump(t):
    if 'زمینه‌سازمداخلات' in t or 'سالمندیزیست' in t:
        return True
    if len(t) > 80 and t.count(' ') < 3:
        return True
    return False


def t_nodes(p):
    out = []
    for r in p.iter(q('r')):
        for t in r.findall(q('t')):
            out.append(t)
    return out


def full_text(ts):
    return ''.join(x.text or '' for x in ts)


def replace_once_in_para(p, old, new, at):
    ts = t_nodes(p)
    full = full_text(ts)
    if at < 0 or at >= len(full) or full[at:at + len(old)] != old:
        # متن جابه‌جا شده؛ دوباره پیدا کن
        at = full.find(old)
        if at < 0:
            return False
    pos = 0
    for t in ts:
        s = t.text or ''
        if pos <= at and at + len(old) <= pos + len(s):
            off = at - pos
            t.text = s[:off] + new + s[off + len(old):]
            if t.text != (t.text or '').strip() or (new[:1] == ' ' or s[:off].endswith(' ')):
                t.set(XML_SPACE, 'preserve')
            return True
        pos += len(s)
    return False  # روی چند ران نشسته


def find_hits(p, patterns):
    ts = t_nodes(p)
    full = full_text(ts)
    hits = []
    occupied = [False] * (len(full) + 1)
    for pat in sorted(patterns, key=len, reverse=True):
        start = 0
        while True:
            j = full.find(pat, start)
            if j < 0:
                break
            if not any(occupied[j:j + len(pat)]):
                hits.append((j, pat))
                for k in range(j, j + len(pat)):
                    occupied[k] = True
            start = j + 1
    return hits


def pick_alt(rng, alts, used, max_use):
    pool = [(txt, w) for txt, w in alts if used[txt] < max_use]
    if not pool:
        return None
    total = sum(w for _, w in pool)
    x = rng.uniform(0, total)
    acc = 0
    for txt, w in pool:
        acc += w
        if x <= acc:
            return txt
    return pool[-1][0]


def cleanup_spaces(s):
    s = re.sub(r' {2,}', ' ', s)
    s = re.sub(r' +\.', '.', s)
    s = re.sub(r' +،', '،', s)
    return s


def apply_category(eligible, patterns, alts, target, max_use, rng, skip_fn=None):
    """alts: list of (text or '', weight). '' = DELETE."""
    hits = []  # (p, offset, pat)
    for p in eligible:
        for off, pat in find_hits(p, patterns):
            if skip_fn and skip_fn(p, off, pat):
                continue
            hits.append((p, off, pat))
    n_orig = len(hits)
    need = max(0, n_orig - target)
    print('  یافت', n_orig, 'هدف نگهداشت', target, 'تغییر', need)
    if need <= 0 or not hits:
        return 0, n_orig
    chosen = rng.sample(hits, min(need, len(hits)))
    # اعمال از انتهای هر پاراگراف تا آفست خراب نشود
    by_p = defaultdict(list)
    for item in chosen:
        by_p[id(item[0])].append(item)
    used = defaultdict(int)
    n_ok = 0
    for pid, items in by_p.items():
        items.sort(key=lambda x: x[1], reverse=True)
        for p, off, pat in items:
            alt = pick_alt(rng, alts, used, max_use)
            if alt is None:
                continue
            new = alt
            if new == '':
                # حذف + فاصله/ویرگول اضافه
                ts = t_nodes(p)
                full = full_text(ts)
                # الگوی همچنین، / بنابراین،
                take = pat
                after = full[off + len(pat):off + len(pat) + 2]
                before = full[max(0, off - 2):off]
                if after.startswith('،'):
                    take = pat + '،'
                    if len(full) > off + len(take) and full[off + len(take)] == ' ':
                        take += ' '
                elif after.startswith(' '):
                    take = pat + ' '
                if replace_once_in_para(p, take, '', off):
                    used[alt] += 1
                    n_ok += 1
            else:
                # اگر جایگزین «که» دارد و متن بعدی هم « که» است، کهِ جایگزین بماند
                if replace_once_in_para(p, pat, new, off):
                    used[alt] += 1
                    n_ok += 1
    return n_ok, n_orig


PERSONAL = [
    'به باور پژوهشگر، ',
    'از دیدگاه محقق، ',
    'به اعتقاد نگارنده، ',
    'آنچه از نظر نگارنده حائز اهمیت است، ',
    'با نگاهی عمیق‌تر به این یافته، ',
    'از منظر پژوهش حاضر، ',
    'بر اساس مشاهدات این پژوهش، ',
]


def insert_personal(p, phrase):
    ts = t_nodes(p)
    if not ts or not (ts[0].text or ''):
        return False
    ts[0].text = phrase + (ts[0].text or '')
    ts[0].set(XML_SPACE, 'preserve')
    return True


def build():
    rng = random.Random(SEED)
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    kids = list(body)

    def find_i(pred):
        for i, el in enumerate(kids):
            if el.tag == q('p') and pred(ptext(el)):
                return i
        return None

    i_toc = find_i(lambda t: t.strip() == 'فهرست مطالب')
    i_pnu = find_i(lambda t: 'Payame Noor University' in t)
    i_ch5 = None
    i_sug = None
    for i, el in enumerate(kids):
        if el.tag != q('p'):
            continue
        t = ptext(el)
        st = style_of(el) or ''
        if st == 'Heading1' and 'فصل پنجم' in t:
            i_ch5 = i
        if st.startswith('Heading') and 'پیشنهاد' in t and i_ch5 and i_sug is None:
            i_sug = i
    front = [freeze_xml(el) for el in kids[:i_toc]]
    last = [freeze_xml(el) for el in kids[i_pnu:]]

    eligible = []
    for el in kids[i_toc:i_pnu]:
        if el.tag != q('p'):
            continue
        if skip_style(style_of(el)):
            continue
        t = ptext(el)
        if not t.strip() or is_tree_dump(t):
            continue
        eligible.append(el)

    def skip_shows(p, off, pat):
        t = ptext(p)
        ctx = t[off:off + len(pat) + 12]
        if 'را نشان' in t[max(0, off - 5):off + len(pat)]:
            return True
        # شرح جدول
        if t.strip().startswith('جدول') or t.strip().startswith('نمودار'):
            return True
        return False

    print('1 نشان می‌دهد')
    n1, _ = apply_category(
        eligible,
        ['نشان می‌دهد که', 'نشان می\u200cدهد که', 'نشان می دهد که',
         'نشان می‌دهد', 'نشان می\u200cدهد', 'نشان می دهد'],
        [
            ('حاکی از آن است که', 3),
            ('بیانگر این نکته است که', 2),
            ('مؤید این مطلب است که', 2),
            ('تأیید می‌کند که', 2),
            ('آشکار می‌سازد که', 1),
            ('گویای این واقعیت است که', 1),
            ('از آن حکایت دارد که', 1),
            ('بر آن دلالت دارد که', 1),
            ('مشخص می‌کند که', 2),
            ('روشن می‌سازد که', 1),
            ('اثبات می‌کند که', 1),
            ('واضح می‌سازد که', 1),
            ('به اثبات می‌رساند که', 2),
        ],
        target=5, max_use=2, rng=rng, skip_fn=skip_shows)

    print('2 نتایج نشان داد')
    n2, _ = apply_category(
        eligible,
        ['نتایج پژوهش نشان داد', 'یافته‌ها نشان دادند که', 'یافته‌ها نشان داد',
         'یافته\u200cها نشان دادند که', 'یافته\u200cها نشان داد',
         'نتایج نشان دادند که', 'نتایج نشان داد که', 'نتایج نشان دادند',
         'نتایج نشان داد'],
        [
            ('تحلیل داده‌ها آشکار ساخت که', 2),
            ('بررسی فرضیه‌ها مشخص کرد که', 2),
            ('آزمون‌های آماری تأیید کردند که', 2),
            ('بر اساس خروجی‌های آماری،', 2),
            ('داده‌های جمع‌آوری‌شده نشان دادند که', 1),
            ('یافته‌های حاصل از این تحقیق بیانگر آن است که', 2),
            ('خروجی تحلیل‌های آماری حاکی از آن بود که', 1),
            ('بر مبنای یافته‌های آماری،', 1),
            ('نتیجه به دست آمده از این پژوهش آن است که', 2),
            ('تحلیل‌های صورت‌گرفته روشن ساخت که', 1),
            ('بررسی‌های آماری مؤید این نکته بود که', 1),
            ('داده‌های پژوهش گویای این واقعیت بودند که', 2),
        ],
        target=3, max_use=1, rng=rng)

    print('3 ناشی از (الگوی پرکننده؛ موارد واقعی عمدتاً غیرپرکننده)')
    n3, o3 = apply_category(
        eligible,
        ['این امر می‌تواند ناشی از', 'این امر ناشی از'],
        [
            ('یک تبیین احتمالی برای این یافته آن است که', 2),
            ('شاید بتوان این نتیجه را چنین تفسیر کرد که', 2),
            ('به نظر می‌رسد علت این موضوع', 1),
            ('تفسیر این یافته آن است که', 2),
            ('این نتیجه احتمالاً به این دلیل است که', 1),
            ('در تبیین این نتیجه باید گفت', 1),
        ],
        target=3, max_use=2, rng=rng)
    print('  (می‌تواند ناشی از عمومی اعمال نشد تا معنی خراب نشود)')

    print('4 همچنین')
    n4, _ = apply_category(
        eligible, ['همچنین'],
        [
            ('افزون بر این', 2),
            ('در کنار این', 2),
            ('در عین حال', 2),
            ('ضمن آنکه', 1),
            ('علاوه بر آن', 1),
            ('از سوی دیگر', 1),
            ('', 3),
            ('به علاوه', 1),
            ('در ضمن', 1),
        ],
        target=5, max_use=2, rng=rng)

    print('5 از جمله')
    n5, _ = apply_category(
        eligible, ['از جمله'],
        [
            ('مانند', 2),
            ('نظیر', 2),
            ('برای نمونه', 2),
            ('به عنوان نمونه', 1),
            ('برای مثال', 1),
            ('همچون', 1),
        ],
        target=5, max_use=2, rng=rng)

    print('6 بنابراین')
    n6, _ = apply_category(
        eligible, ['بنابراین'],
        [
            ('از این رو', 2),
            ('بدین ترتیب', 2),
            ('در نتیجه', 2),
            ('به همین دلیل', 1),
            ('بر این اساس', 1),
            ('', 2),
            ('با این اوصاف', 1),
        ],
        target=4, max_use=2, rng=rng)

    print('7 نقش مهمی در')
    n7, _ = apply_category(
        eligible,
        ['نقش مهمی در', 'نقش بسزایی در', 'نقش کلیدی در'],
        [
            ('تأثیر بسزایی بر', 2),
            ('سهم قابل توجهی در', 1),
            ('از مؤلفه‌های کلیدی در', 1),
            ('سهم عمده‌ای در', 2),
        ],
        target=3, max_use=2, rng=rng)

    print('8 زمینه‌ساز')
    n8, _ = apply_category(
        eligible, ['زمینه‌ساز ', 'زمینه\u200cساز '],
        [
            ('بستر لازم برای ', 2),
            ('موجب ', 2),
            ('عامل ', 1),
            ('مسیر هموار برای ', 1),
        ],
        target=2, max_use=2, rng=rng)

    print('9 نتایج این پژوهش')
    n9, o9 = apply_category(
        eligible, ['نتایج این پژوهش'],
        [
            ('یافته‌های حاصل از این مطالعه', 2),
            ('خروجی‌های این تحقیق', 2),
            ('دستاوردهای پژوهشی حاضر', 1),
            ('برآیند این مطالعه', 1),
            ('آنچه از این پژوهش به دست آمد', 2),
            ('حاصل این بررسی', 1),
        ],
        target=3, max_use=2, rng=rng)

    print('10 این نتایج بیانگر')
    n10, _ = apply_category(
        eligible, ['این نتایج بیانگر', 'این یافته‌ها بیانگر', 'این یافته\u200cها بیانگر'],
        [
            ('از این یافته‌ها چنین برداشت می‌شود که', 2),
            ('نتایج گویای این واقعیت است که', 1),
            ('این دستاورد پژوهشی حاکی از آن است که', 1),
            ('برآیند یافته‌ها آن است که', 2),
            ('از نتایج چنین استنباط می‌شود که', 1),
        ],
        target=2, max_use=2, rng=rng)

    print('11 در تبیین این یافته')
    n11, _ = apply_category(
        eligible, ['در تبیین این یافته'],
        [
            ('برای تفسیر این نتیجه', 2),
            ('در توضیح این دستاورد', 1),
            ('هنگام تحلیل این یافته', 1),
            ('در واکاوی این نتیجه', 1),
        ],
        target=1, max_use=2, rng=rng)

    print('12 با توجه به')
    n12, _ = apply_category(
        eligible, ['با توجه به'],
        [
            ('نظر به', 2),
            ('با در نظر گرفتن', 1),
            ('با عنایت به', 1),
            ('با نگاه به', 1),
        ],
        target=3, max_use=2, rng=rng)

    # لمس شخصی در فصل پنجم
    n_pers = 0
    if i_ch5:
        end = i_sug if i_sug else i_pnu
        cands = []
        for el in kids[i_ch5 + 1:end]:
            if el.tag != q('p') or skip_style(style_of(el)):
                continue
            t = ptext(el).strip()
            if len(t) < 220 or t.startswith('«') or t.startswith('"'):
                continue
            if any(t.startswith(x.strip()) for x in PERSONAL):
                continue
            cands.append(el)
        k = min(6, len(cands), len(PERSONAL))
        if k:
            step = max(1, len(cands) // k)
            picked = [cands[min(i * step, len(cands) - 1)] for i in range(k)]
            # یکتا
            seen = []
            for p in picked:
                if p not in seen:
                    seen.append(p)
            phrases = PERSONAL[:]
            rng.shuffle(phrases)
            for p, ph in zip(seen, phrases):
                if insert_personal(p, ph):
                    n_pers += 1

    print('شخصی‌سازی', n_pers)
    print('جمع جایگزینی', n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8 + n9 + n10 + n11 + n12)

    kids2 = list(body)
    i_toc2 = i_pnu2 = None
    for i, el in enumerate(kids2):
        if el.tag != q('p'):
            continue
        tt = ptext(el)
        if tt.strip() == 'فهرست مطالب':
            i_toc2 = i
        if 'Payame Noor University' in tt:
            i_pnu2 = i
    if [freeze_xml(el) for el in kids2[:i_toc2]] != front:
        raise SystemExit('front changed')
    if [freeze_xml(el) for el in kids2[i_pnu2:]] != last:
        raise SystemExit('last changed')
    print('freeze OK')

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
