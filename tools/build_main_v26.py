# -*- coding: utf-8 -*-
"""v2.6: اصلاحات XML 2.3 — پرکننده، پانویس، APA منابع، متن فهرست."""
import copy
import os
import re
import sys
import zipfile
from collections import defaultdict

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apply_v19 import q, ptext, style_of
from build_nazariyeha_v17 import para_tokens, tokens_text, make_para
from build_main_v20 import replace_span, rebuild_tokens

SRC = 'Payannameh-Fatemeh-Bayat-v2.5.docx'
DST = 'Payannameh-Fatemeh-Bayat-v2.6.docx'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'

SKIP_STYLES = ('TOC', 'Heading', 'Caption', 'Bibliography', 'EnglishText')

FILLERS = [
    ('همچنین', 15, ['علاوه بر این', 'افزون بر این', 'در کنار این', '']),
    ('از جمله', 15, ['مانند', 'نظیر', 'برای مثال', 'به عنوان نمونه', '']),
    ('بنابراین', 10, ['از این رو', 'در نتیجه', 'بدین ترتیب', '']),
    ('با توجه به', 7, ['نظر به', 'با در نظر گرفتن', 'با عنایت به', 'با نگاه به']),
    ('علاوه بر این', 2, ['در کنار این', 'افزون بر این', '']),
]

FN_TEXT = {
    '1': 'UN',
    '9': 'WHO',
    '10': 'Immunological Theory',
    '33': 'Greenberg et al.',
    '51': 'APA',
    '55': 'WHO',
    '56': 'APA',
    '57': 'NIA',
    '100': 'UN',
    '101': 'APA',
    '105': 'DSM-5',
}

TOC_LABELS = {
    '_Toc238572009': '۱-۵- فرضیه‌های پژوهش',
    '_Toc238572011': '۱-۵-۲- فرضیه‌های فرعی:',
    '_Toc238572018': '۲-۱-۲- نظریه‌های سالمندی',
    '_Toc238572021': '۲-۱-۲-۱-۲- نظریه پیر شدن سلولی',
    '_Toc238572046': '۲-۳-۳- عوامل مؤثر بر هوش معنوی',
    '_Toc238572061': '۳-۲- جامعه، نمونه و روش نمونه‌گیری',
    '_Toc238572064': '۳-۳-۲- پرسشنامه اضطراب مرگ (DAS)',
    '_Toc238572065': '۳-۳-۳- پرسشنامه اضطراب سلامتی (HAI)',
    '_Toc238572069': '۴-۱- یافته‌های توصیفی',
    '_Toc238572091': '۴-۲- یافته‌های استنباطی',
    '_Toc238572097': '۵-۲- محدودیت‌های تحقیق',
}


def skip_para(p):
    st = style_of(p) or ''
    return any(st.startswith(s) for s in SKIP_STYLES)


def expand_old(full, j, word, new):
    """اگر حذف است، ویرگول/فاصلهٔ چسبیده را هم بردار."""
    n = len(word)
    if new != '':
        return j, word
    if full[j:j + n + 2] == word + '، ':
        return j, word + '، '
    if full[j:j + n + 1] == word + ' ':
        return j, word + ' '
    if j >= 2 and full[j - 2:j + n] == '، ' + word:
        return j - 2, '، ' + word
    if j >= 1 and full[j - 1:j + n] == ' ' + word:
        return j - 1, ' ' + word
    return j, word


def apply_filler(body, word, keep, alts):
    hits = []
    for p in list(body.iter(q('p'))):
        if skip_para(p):
            continue
        t = ptext(p)
        start, k = 0, 0
        while True:
            j = t.find(word, start)
            if j < 0:
                break
            hits.append({'p': p, 'k': k})
            k += 1
            start = j + 1
    extra = hits[keep:]
    print(word, 'hits', len(hits), 'keep', keep, 'change', len(extra))
    if not extra:
        return
    alt_use = defaultdict(int)
    prev_para_alt = {}
    assignments = []  # (p, k, new)
    for n, h in enumerate(extra):
        pid = id(h['p'])
        chosen = None
        for alt in alts:
            if alt_use[alt] >= 3 and alt != '':
                continue
            if prev_para_alt.get(pid) == alt and alt:
                continue
            chosen = alt
            break
        if chosen is None:
            chosen = alts[-1] if alts else ''
        if chosen:
            alt_use[chosen] += 1
        prev_para_alt[pid] = chosen
        assignments.append((h['p'], h['k'], chosen))

    by_p = defaultdict(list)
    for p, k, new in assignments:
        by_p[id(p)].append((p, k, new))
    for pid, ops in by_p.items():
        p = ops[0][0]
        ops.sort(key=lambda x: -x[1])
        toks = para_tokens(p)
        full = tokens_text(toks)
        for _, k, new in ops:
            start, found = 0, -1
            for i in range(k + 1):
                found = full.find(word, start)
                if found < 0:
                    break
                start = found + 1
            if found < 0:
                continue
            j, old = expand_old(full, found, word, new)
            toks, _, did = replace_span(toks, j, old, new)
            if did:
                full = tokens_text(toks)
        rebuild_tokens(p, toks)


def set_fn_text(fn_root, fid, text):
    for f in fn_root.findall(q('footnote')):
        if f.get(q('id')) != str(fid):
            continue
        for t in f.iter(q('t')):
            parent = t.getparent()
            if parent is not None and parent.find(q('footnoteRef')) is None:
                if not first_done:
                    prefix = ' ' if (t.text or '').startswith(' ') else ''
                    t.text = prefix + text
                    t.set(XML_SPACE, 'preserve')
                    first_done = True
                else:
                    t.text = ''
        return first_done
    return False


def move_periods(p):
    """نقطهٔ بلافاصله قبل از پانویس را بعد از علامت ببر."""
    n = 0
    changed = True
    while changed:
        changed = False
        runs = [c for c in p if c.tag == q('r')]
        i = 0
        while i < len(runs):
            r = runs[i]
            if r.find(q('footnoteReference')) is None:
                i += 1
                continue
            if i == 0:
                i += 1
                continue
            prev = runs[i - 1]
            te = prev.find(q('t'))
            if te is None or not te.text or not te.text.endswith('.'):
                i += 1
                continue
            te.text = te.text[:-1]
            j = i
            while j + 1 < len(runs) and runs[j + 1].find(q('footnoteReference')) is not None:
                j += 1
            last = runs[j]
            parent = last.getparent()
            idx = list(parent).index(last)
            nr = etree.Element(q('r'))
            rpr = copy.deepcopy(prev.find(q('rPr'))) if prev.find(q('rPr')) is not None else None
            if rpr is not None:
                nr.append(rpr)
            tt = etree.SubElement(nr, q('t'))
            tt.text = '.'
            parent.insert(idx + 1, nr)
            n += 1
            changed = True
            break
    return n


def fix_bib_authors(t):
    i = t.find('(')
    if i < 0:
        head, tail = t, ''
    else:
        head, tail = t[:i], t[i:]
    head = head.replace('; &', '., &').replace('; and', '., and')
    head = re.sub(r'([A-Za-z])\s*;\s*', r'\1., ', head)
    return head + tail


def rewrite_para_text_keep_fn(p, new_full):
    """فقط وقتی متن بدون پانویس عوض شده؛ پانویس‌ها حفظ می‌شوند."""
    toks = para_tokens(p)
    old = tokens_text(toks)
    if old == new_full:
        return False
    # replace whole text span 0..len keeping fns via replace_span of entire old
    toks, _, did = replace_span(toks, 0, old, new_full)
    if did:
        rebuild_tokens(p, toks)
        return True
    return False


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    body = doc[0]

    for word, keep, alts in FILLERS:
        apply_filler(body, word, keep, alts)

    nfn = 0
    for fid, txt in FN_TEXT.items():
        if set_fn_text(fn_root, fid, txt):
            nfn += 1
            print('fn', fid, '->', txt)
    print('fn texts', nfn)

    nper = 0
    for p in body.iter(q('p')):
        nper += move_periods(p)
    print('fn period moves', nper)

    nbib = 0
    for p in list(body.iter(q('p'))):
        if style_of(p) != 'Bibliography':
            continue
        t = ptext(p)
        nt = fix_bib_authors(t)
        if nt != t:
            if rewrite_para_text_keep_fn(p, nt):
                nbib += 1
    print('bib author punctuation', nbib)

    ntoc = 0
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if not st.startswith('TOC'):
            continue
        for h in p.findall(q('hyperlink')):
            anc = h.get(q('anchor'))
            if anc not in TOC_LABELS:
                continue
            label = TOC_LABELS[anc]
            ts = list(h.iter(q('t')))
            if ts and ts[0].text and not ts[0].text.strip()[:1].isdigit():
                ts[0].text = label
                ntoc += 1
    print('toc labels', ntoc)

    for fc in body.iter(q('fldChar')):
        if fc.get(q('fldCharType')) == 'begin':
            fc.set(q('dirty'), 'true')
    st = etree.fromstring(parts['word/settings.xml'])
    uf = st.find(q('updateFields'))
    if uf is None:
        uf = etree.SubElement(st, q('updateFields'))
    uf.set(q('val'), 'true')
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn_root, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST, os.path.getsize(DST))


if __name__ == '__main__':
    build()
