# -*- coding: utf-8 -*-
"""v1.8: پیشنهاد سبز برای خطاهای قرمز + دسته‌بندی سه حوزهٔ شناختی-رفتاری."""
import copy, os, sys, zipfile
from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_nazariyeha import W, q
from build_nazariyeha_v17 import (
    ptext, para_tokens, tokens_text, slice_tokens, make_para,
    prepend_txt, replace_with_splits, find_para, whole_word, XML_SPACE,
)

SRC = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.7.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.8.docx'
GREEN = '1B7A3D'


def green_rpr(base):
    rpr = copy.deepcopy(base) if base is not None else etree.Element(q('rPr'))
    col = rpr.find(q('color'))
    if col is None:
        col = etree.SubElement(rpr, q('color'))
    col.set(q('val'), GREEN)
    return rpr


def rpr_at(toks, offset):
    pos = 0
    last = None
    for tok in toks:
        if tok[0] != 'txt':
            continue
        last = tok[2]
        t1 = pos + len(tok[1])
        if pos <= offset < t1:
            return tok[2]
        pos = t1
    return last


def insert_suggest(body, needle, fix):
    marker = '[پیشنهاد:'
    n = 0
    guard = 0
    while True:
        guard += 1
        if guard > 80:
            break
        found = False
        for p in list(body.iter(q('p'))):
            toks = para_tokens(p)
            full = tokens_text(toks)
            start = 0
            while True:
                i = full.find(needle, start)
                if i < 0:
                    break
                if needle == 'پیکوری' and not whole_word(full, i, needle):
                    start = i + 1
                    continue
                end = i + len(needle)
                after = full[end:end + 24]
                if marker in after:
                    start = end
                    continue
                # already inside a previous suggestion
                last_open = full.rfind('[پیشنهاد:', 0, i)
                last_close = full.rfind(']', 0, i)
                if last_open > last_close:
                    start = end
                    continue
                sug = ' [پیشنهاد: %s]' % fix
                new = []
                pos = 0
                inserted = False
                for tok in toks:
                    if tok[0] == 'fn':
                        new.append(tok)
                        continue
                    text, rpr = tok[1], tok[2]
                    t0, t1 = pos, pos + len(text)
                    if not inserted and t0 < end <= t1:
                        cut = end - t0
                        if cut > 0:
                            new.append(('txt', text[:cut], copy.deepcopy(rpr) if rpr is not None else None))
                        new.append(('txt', sug, green_rpr(rpr)))
                        if cut < len(text):
                            new.append(('txt', text[cut:], copy.deepcopy(rpr) if rpr is not None else None))
                        inserted = True
                    else:
                        new.append(tok)
                    pos = t1
                if not inserted:
                    start = end
                    continue
                ppr = p.find(q('pPr'))
                rebuilt = make_para(new, ppr)
                parent = p.getparent()
                idx = list(parent).index(p)
                parent.remove(p)
                parent.insert(idx, rebuilt)
                n += 1
                found = True
                break
            if found:
                break
        if not found:
            break
    return n


def strip_leading_va(p):
    """۳- و بعد → ۳- بعد"""
    t = ptext(p)
    if t.startswith('۳- و '):
        for r in p.findall(q('r')):
            te = r.find(q('t'))
            if te is not None and te.text and '۳- و ' in te.text:
                te.text = te.text.replace('۳- و ', '۳- ', 1)
                return True
    return False


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    # --- CBT three domains ---
    cbt = find_para(body, 'اضطراب سلامت را می‌توان از منظر شناختی')
    if cbt is None:
        print('MISS CBT para')
    else:
        replace_with_splits(body, cbt, [
            'بعد شناختی شامل',
            'بعد هیجانی شامل',
            'بعد رفتاری شامل',
            'این رفتارها اگرچه',
        ], prefixes=[
            '',
            '۱- ',
            '۲- ',
            '۳- ',
            '',
        ])
        for p in list(body.iter(q('p'))):
            if ptext(p).startswith('۳- و '):
                strip_leading_va(p)

    suggestions = [
        ('سئوال', 'سؤال'),
        ('هوش معنوی معنوی', 'هوش معنوی'),
        ('فرانک، ۲۰۱۸', 'فرانکل، ۲۰۱۸'),
        ('چهار حالت؛', 'چهار حالت: سلامت معنوی کامل و ناکامل، تنش معنوی کامل و ناکامل'),
        ('هوش هیجان،', 'بهزیستی هیجانی،'),
        ('نقطه مقابل هوش است', 'نقطه مقابل شکوفایی است'),
        ('تنیدگی شغلی', 'کیفیت زندگی'),
        ('وگسترش', 'و گسترش'),
        ('پیکوری', 'اپیکوری'),
        ('برای اولین باردر', 'برای اولین بار در'),
        ('تمایزبر اساس', 'تمایز بر اساس'),
        ('استقلال استقلال', 'استقلال ساختاری'),
        ('مطالعهی', 'مطالعه‌ی'),
        ('تآکید', 'تأکید'),
    ]
    total = 0
    for needle, fix in suggestions:
        c = insert_suggest(body, needle, fix)
        if c:
            print('suggest', needle, '→', fix, c)
        total += c
    print('suggestions', total)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST)


if __name__ == '__main__':
    build()
