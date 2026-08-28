# -*- coding: utf-8 -*-
"""v1.7: دسته‌بندی ۲-۳-۲ (ریف و مدل سلامت) + روانی محدود + خطاها قرمز."""
import copy, os, sys, zipfile
from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_nazariyeha import W, q

SRC = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.6.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.7.docx'
RED = 'C00000'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def is_letter(c):
    if not c:
        return False
    if c == '\u200c':
        return True
    import unicodedata
    return unicodedata.category(c).startswith('L')


def whole_word(text, start, needle):
    end = start + len(needle)
    prev = text[start - 1] if start > 0 else ''
    nxt = text[end] if end < len(text) else ''
    return not is_letter(prev) and not is_letter(nxt)


def para_tokens(p):
    toks = []
    for r in p.findall(q('r')):
        if r.find(q('footnoteReference')) is not None:
            toks.append(('fn', copy.deepcopy(r)))
            continue
        t = r.find(q('t'))
        if t is not None and t.text:
            rpr = r.find(q('rPr'))
            toks.append(('txt', t.text, copy.deepcopy(rpr) if rpr is not None else None))
    return toks


def tokens_text(toks):
    return ''.join(t[1] if t[0] == 'txt' else '' for t in toks)


def slice_tokens(toks, a, b):
    out = []
    pos = 0
    for tok in toks:
        if tok[0] == 'fn':
            attach = pos - 1 if pos > 0 else 0
            if a <= attach < b:
                out.append(tok)
            continue
        text = tok[1]
        n = len(text)
        o0, o1 = max(pos, a), min(pos + n, b)
        if o1 > o0:
            out.append(('txt', text[o0 - pos:o1 - pos], tok[2]))
        pos += n
    return out


def make_para(toks, ppr):
    p = etree.Element(q('p'))
    if ppr is not None:
        p.append(copy.deepcopy(ppr))
    for tok in toks:
        if tok[0] == 'fn':
            p.append(copy.deepcopy(tok[1]))
            continue
        _, text, rpr = tok
        r = etree.SubElement(p, q('r'))
        if rpr is not None:
            r.append(copy.deepcopy(rpr))
        t = etree.SubElement(r, q('t'))
        if text.startswith(' ') or text.endswith(' '):
            t.set(XML_SPACE, 'preserve')
        t.text = text
    return p


def prepend_txt(toks, prefix):
    rpr = None
    for tok in toks:
        if tok[0] == 'txt':
            rpr = tok[2]
            break
    return [('txt', prefix, copy.deepcopy(rpr) if rpr is not None else None)] + toks


def replace_with_splits(body, p, cuts, prefixes=None):
    """cuts: phrases that start a new paragraph (in order). prefixes[i] for chunk i."""
    toks = para_tokens(p)
    full = tokens_text(toks)
    positions = [0]
    for ph in cuts:
        i = full.find(ph)
        if i < 0:
            print('CUT MISS', ph[:50])
            continue
        if i not in positions:
            positions.append(i)
    positions = sorted(set(positions))
    positions.append(len(full))
    chunks = list(zip(positions[:-1], positions[1:]))
    ppr = p.find(q('pPr'))
    new_paras = []
    for i, (a, b) in enumerate(chunks):
        ct = slice_tokens(toks, a, b)
        if prefixes and i < len(prefixes) and prefixes[i]:
            ct = prepend_txt(ct, prefixes[i])
        new_paras.append(make_para(ct, ppr))
    parent = p.getparent()
    idx = list(parent).index(p)
    parent.remove(p)
    for i, np in enumerate(new_paras):
        parent.insert(idx + i, np)
    print('split into', len(new_paras), 'from', full[:30])
    return new_paras


def span_is_red(toks, a):
    pos = 0
    for tok in toks:
        if tok[0] != 'txt':
            continue
        t0, t1 = pos, pos + len(tok[1])
        if t0 <= a < t1:
            rpr = tok[2]
            if rpr is None:
                return False
            col = rpr.find(q('color'))
            return col is not None and col.get(q('val')) == RED
        pos += len(tok[1])
    return False


def paint_red_once(p, needle, hit):
    toks = para_tokens(p)
    a, b = hit, hit + len(needle)
    new = []
    pos = 0
    for tok in toks:
        if tok[0] == 'fn':
            new.append(tok)
            continue
        text, rpr = tok[1], tok[2]
        t0, t1 = pos, pos + len(text)
        pos = t1
        if t1 <= a or t0 >= b:
            new.append(tok)
            continue
        if t0 < a:
            new.append(('txt', text[:a - t0], copy.deepcopy(rpr) if rpr is not None else None))
        mid = text[max(0, a - t0):max(0, b - t0)]
        nrpr = copy.deepcopy(rpr) if rpr is not None else etree.Element(q('rPr'))
        col = nrpr.find(q('color'))
        if col is None:
            col = etree.SubElement(nrpr, q('color'))
        col.set(q('val'), RED)
        new.append(('txt', mid, nrpr))
        if t1 > b:
            new.append(('txt', text[b - t0:], copy.deepcopy(rpr) if rpr is not None else None))
    ppr = p.find(q('pPr'))
    rebuilt = make_para(new, ppr)
    parent = p.getparent()
    idx = list(parent).index(p)
    parent.remove(p)
    parent.insert(idx, rebuilt)
    return rebuilt


def paint_all(body, needle):
    n = 0
    while True:
        found = False
        for p in list(body.iter(q('p'))):
            toks = para_tokens(p)
            full = tokens_text(toks)
            start = 0
            while True:
                i = full.find(needle, start)
                if i < 0:
                    break
                if whole_word(full, i, needle) and not span_is_red(toks, i):
                    paint_red_once(p, needle, i)
                    n += 1
                    found = True
                    break
                start = i + 1
            if found:
                break
        if not found:
            break
        if n > 80:
            break
    return n


def prepend_first_t(p, prefix):
    for r in p.findall(q('r')):
        t = r.find(q('t'))
        if t is not None and t.text:
            t.text = prefix + t.text
            return True
    return False


def find_para(body, startswith):
    for p in body.iter(q('p')):
        if ptext(p).startswith(startswith):
            return p
    return None


def body_paras_between(body, start_h, end_h):
    out = []
    on = False
    for p in list(body):
        if p.tag != q('p'):
            continue
        st, t = style_of(p) or '', ptext(p)
        if st.startswith('Heading') and t.startswith(start_h):
            on = True
            continue
        if on and st.startswith('Heading') and t.startswith(end_h):
            break
        if on:
            out.append(p)
    return out


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    # --- Ryff six components: number ---
    ryff = [
        ('پذیرش خود:', '۱- '),
        ('روابط مثبت با دیگران:', '۲- '),
        ('خودمختاری:', '۳- '),
        ('تسلط بر محیط:', '۴- '),
        ('هدفمندی در زندگی،', '۵- '),
        ('رشد شخصی:', '۶- '),
    ]
    for start, num in ryff:
        p = find_para(body, start)
        if p is None:
            print('MISS ryff', start)
            continue
        prepend_first_t(p, num)
        if start.startswith('هدفمندی'):
            # colon instead of comma for consistency
            for r in p.findall(q('r')):
                t = r.find(q('t'))
                if t is not None and t.text and 'هدفمندی در زندگی،' in t.text:
                    t.text = t.text.replace('هدفمندی در زندگی،', 'هدفمندی در زندگی:', 1)
        print('numbered', num, start[:20])

    # --- health model: split wall of text ---
    hp = find_para(body, 'مدل سلامت معنوی کامل:')
    if hp is None:
        raise SystemExit('no health model para')
    replace_with_splits(body, hp, [
        'سلامت معنوی کامل نشانگانی است',
        'سلامت معنوی ناکامل شرایطی است',
        'تنش معنوی کامل نشانگانی است',
        'افراد در حال پژمردگی',
        'تنیدگی شغلی مطلوب',
        'امروزه با پیدایش و گسترش روان شناسی سلامت',
        'از لحاظ تاریخی فلاسفه',
        'داینر مطابق با دیدگاه',
        'در بعد هوش روان شناختی',
        'سلامت معنوی نیز در این میان',
    ], prefixes=[
        '',
        '۱- ',
        '۲- ',
        '۳- ',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
    ])

    # --- Jung paragraph: split the repeated half ---
    jp = None
    for p in body.iter(q('p')):
        t = ptext(p)
        if t.startswith('بسیاری از دیدگاه‌های روان‌شناختی، معنویت را'):
            jp = p
            break
    if jp is not None:
        replace_with_splits(body, jp, [
            'همینطور در رویکرد تحلیلی یونگ',
        ])

    # --- 2-3-1 long history paragraph ---
    h1 = find_para(body, 'از زمان های بسیار دور')
    if h1 is not None:
        replace_with_splits(body, h1, [
            'در طول تاریخ، فلاسفه',
            'معتقدین به اصل سودگرایی',
            'در اوایل قرن بیستم',
            'بسیاری از نظریات بیان شده در مخالفت',
            'عقیده محکم اریکسون',
            'نظریه فرانکل',
        ])

    # --- red errors ---
    reds = [
        'تنیدگی شغلی',
        'پیکوری',
        'تآکید',
        'مطالعهی',
        'برای اولین باردر',
        'استقلال استقلال',
        'هوش هیجان،',
        'هوش معنوی معنوی',
        'سئوال',
        'فرانک، ۲۰۱۸',
        'تمایزبر اساس',
        'وگسترش',
        'نقطه مقابل هوش است',
        'چهار حالت؛',
    ]
    total = 0
    for needle in reds:
        c = paint_all(body, needle)
        if c:
            print('red', needle, c)
        total += c
    print('red marks', total)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST)


if __name__ == '__main__':
    build()
