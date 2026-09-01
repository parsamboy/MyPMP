# -*- coding: utf-8 -*-
"""v1.9 جدا: اصلاح خطاهای قرمز + افزودن تنش معنوی ناکامل بر پایه کیز."""
import copy, os, sys, zipfile
from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_nazariyeha import W, q
from build_nazariyeha_v17 import (
    ptext, para_tokens, tokens_text, make_para, find_para, XML_SPACE,
)
import build_nazariyeha as B

SRC = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.8.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.9.docx'
GREEN = '1B7A3D'
RED = 'C00000'


def is_suggest_tok(tok):
    if tok[0] != 'txt':
        return False
    text = tok[1] or ''
    return '[پیشنهاد:' in text


def strip_suggest(toks):
    out = []
    for tok in toks:
        if is_suggest_tok(tok):
            continue
        if tok[0] == 'txt':
            t = tok[1]
            # leftover fragments of suggestion
            t = t.replace(' [پیشنهاد:', '').replace('[پیشنهاد:', '')
            if t == tok[1]:
                out.append(tok)
            elif t.strip():
                out.append(('txt', t, tok[2]))
        else:
            out.append(tok)
    return out


def unred(rpr):
    if rpr is None:
        return None
    rpr = copy.deepcopy(rpr)
    col = rpr.find(q('color'))
    if col is not None and col.get(q('val')) == RED:
        rpr.remove(col)
        auto = etree.SubElement(rpr, q('color'))
        auto.set(q('val'), 'auto')
    return rpr


def apply_fixes_toks(toks, fixes):
    fns = []
    rpr0 = None
    pieces = []
    pos = 0
    for tok in toks:
        if tok[0] == 'fn':
            fns.append([pos, tok])
            continue
        if rpr0 is None and tok[2] is not None:
            rpr0 = unred(tok[2])
        pieces.append(tok[1])
        pos += len(tok[1])
    full = ''.join(pieces)
    orig = full
    for old, new in fixes:
        start = 0
        while True:
            i = full.find(old, start)
            if i < 0:
                break
            delta = len(new) - len(old)
            full = full[:i] + new + full[i + len(old):]
            for item in fns:
                if item[0] > i:
                    item[0] += delta
            start = i + len(new)
    rpr0 = unred(rpr0)
    out = []
    last = 0
    for fpos, ftok in fns:
        fpos = max(0, min(fpos, len(full)))
        if fpos > last:
            out.append(('txt', full[last:fpos], rpr0))
        out.append(ftok)
        last = fpos
    if last < len(full):
        out.append(('txt', full[last:], rpr0))
    elif not out and full:
        out.append(('txt', full, rpr0))
    return out, full != orig


def clean_para(p, fixes):
    toks = strip_suggest(para_tokens(p))
    toks2, changed = apply_fixes_toks(toks, fixes)
    if not toks2:
        toks2 = [('txt', '', None)]
    ppr = p.find(q('pPr'))
    rebuilt = make_para(toks2, ppr)
    parent = p.getparent()
    idx = list(parent).index(p)
    parent.remove(p)
    parent.insert(idx, rebuilt)
    return rebuilt, changed


def green_body_para(text_parts, ppr_template, green=True):
    """text_parts: mix of str and ('fn', id)."""
    p = etree.Element(q('p'))
    if ppr_template is not None:
        p.append(copy.deepcopy(ppr_template))
    for item in text_parts:
        if isinstance(item, tuple) and item[0] == 'fn':
            p.append(B.fn_run(item[1], green=green))
        else:
            p.append(B.run(item, rtl=True, green=green))
    # match original body: both + firstLine
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.SubElement(p, q('pPr'))
        p.insert(0, ppr)
    jc = ppr.find(q('jc'))
    if jc is None:
        jc = etree.SubElement(ppr, q('jc'))
    jc.set(q('val'), 'both')
    ind = ppr.find(q('ind'))
    if ind is None:
        ind = etree.SubElement(ppr, q('ind'))
    ind.set(q('firstLine'), '397')
    return p


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    fixes = [
        ('سئوال', 'سؤال'),
        ('هوش معنوی معنوی', 'هوش معنوی'),
        ('فرانک، ۲۰۱۸', 'فرانکل، ۲۰۱۸'),
        ('هوش هیجان،', 'بهزیستی هیجانی،'),
        ('نقطه مقابل هوش است', 'نقطه مقابل شکوفایی است'),
        ('تنیدگی شغلی', 'کیفیت زندگی'),
        ('وگسترش', 'و گسترش'),
        ('پیکوری', 'اپیکوری'),
        ('برای اولین باردر', 'برای اولین بار در'),
        ('تمایزبر اساس', 'تمایز بر اساس'),
        ('استقلال استقلال ساختاری', 'استقلال ساختاری'),
        ('مطالعهی', 'مطالعه‌ی'),
        ('تآکید', 'تأکید'),
    ]

    nfix = 0
    for p in list(body.iter(q('p'))):
        xml = etree.tostring(p, encoding='unicode')
        t = ptext(p)
        if '[پیشنهاد:' in t or RED in xml or any(a in t for a, _ in fixes):
            _, did = clean_para(p, fixes)
            if did:
                nfix += 1
    print('cleaned paras', nfix)

    # add 4th state after ۳- تنش معنوی کامل
    target = None
    for p in body.iter(q('p')):
        if ptext(p).startswith('۳- تنش معنوی کامل'):
            target = p
            break
    if target is None:
        print('MISS state 3')
    else:
        ppr = target.find(q('pPr'))
        newp = green_body_para([
            '۴- تنش معنوی ناکامل حالتی است که فرد نشانه‌هایی از تنش یا پریشانی معنوی دارد، اما هنوز درجاتی از بهزیستی هیجانی، روان‌شناختی یا اجتماعی در او باقی می‌ماند. این تفکیک از مدل حالت کامل سلامت کیز',
            ('fn', 67),
            ' برمی‌آید که سلامت و بیماری را دو پیوستار جدا می‌داند؛ بنابراین وجود تنش لزوماً به معنای فقدان کامل سلامت نیست و چهار حالت از ترکیب دو بُعد سلامت معنوی (کامل/ناکامل) و تنش معنوی (کامل/ناکامل) به‌دست می‌آید (کیز، ۲۰۰۲).',
        ], ppr, green=True)
        parent = target.getparent()
        idx = list(parent).index(target)
        parent.insert(idx + 1, newp)
        print('added state 4')

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST)


if __name__ == '__main__':
    build()
