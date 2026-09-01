# -*- coding: utf-8 -*-
"""v2.1 اصلی: اصلاح پانویس، درختواره‌های فصل ۲، SST/کینگ، لینک منابع معتبر."""
import copy, os, sys, zipfile
from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_nazariyeha as B
from build_nazariyeha import W, q
from build_nazariyeha_v17 import ptext
from build_nazariyeha_v20 import add_rel, last_heading, insert_bib_alpha, bib_plain, bib_with_url
from build_main_v20 import style_of, first_rpr, body_para, XML_SPACE

SRC = 'Payannameh-Fatemeh-Bayat-v2.0.docx'
NAZ = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.11.docx'
DST = 'Payannameh-Fatemeh-Bayat-v2.1.docx'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'


def clone_footnote(template, fid, text):
    f = copy.deepcopy(template)
    f.set(q('id'), str(fid))
    p = f.find(q('p'))
    if p is not None:
        for attr in list(p.attrib):
            if attr.endswith('paraId') or attr.endswith('textId'):
                del p.attrib[attr]
    for t in f.iter(q('t')):
        parent = t.getparent()
        if parent is not None and parent.find(q('footnoteRef')) is None:
            t.text = ' ' + text
            t.set(XML_SPACE, 'preserve')
    return f


def insert_after(body, heading_start, new_paras):
    target = None
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if st.startswith('Heading') and ptext(p).startswith(heading_start):
            target = p
    if target is None:
        print('MISS heading', heading_start)
        return False
    parent = target.getparent()
    idx = list(parent).index(target) + 1
    for i, np in enumerate(new_paras):
        parent.insert(idx + i, copy.deepcopy(np) if np.getparent() is not None else np)
    return True


def insert_before_heading(body, heading_start, new_paras):
    target = None
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if st.startswith('Heading') and ptext(p).startswith(heading_start):
            target = p
            break  # first in body after TOC: actually last match better for body
    # last match
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if st.startswith('Heading') and ptext(p).startswith(heading_start):
            target = p
    if target is None:
        print('MISS before', heading_start)
        return False
    parent = target.getparent()
    idx = list(parent).index(target)
    for i, np in enumerate(new_paras):
        parent.insert(idx + i, np)
    return True


def strip_hyperlink_keep_text(p):
    """Remove w:hyperlink wrappers but keep inner text runs; drop fake URL text."""
    t = ptext(p)
    for h in list(p.findall(q('hyperlink'))):
        parent = h.getparent()
        idx = list(parent).index(h)
        runs = list(h)
        parent.remove(h)
        for j, r in enumerate(runs):
            parent.insert(idx + j, r)
    # remove the wrong doi substring from t runs
    for r in p.findall(q('r')):
        te = r.find(q('t'))
        if te is not None and te.text and 'https://doi.org/10.1097/MS9' in te.text:
            te.text = te.text.replace('https://doi.org/10.1097/MS9.0000000000002100', '').rstrip()
    return p


def append_url_run(p, rid, url, rpr_latin=None):
    if p.find(q('hyperlink')) is not None:
        return
    # space + hyperlink
    r0 = etree.SubElement(p, q('r'))
    if rpr_latin is not None:
        r0.append(copy.deepcopy(rpr_latin))
    t0 = etree.SubElement(r0, q('t'))
    t0.set(XML_SPACE, 'preserve')
    t0.text = ' '
    h = etree.SubElement(p, q('hyperlink'))
    h.set(R + 'id', rid)
    h.set(q('history'), '1')
    r = etree.SubElement(h, q('r'))
    rp = etree.SubElement(r, q('rPr'))
    rp.append(etree.SubElement(rp, q('rStyle')) if False else B.el('rStyle', {'val': 'Hyperlink'}))
    # rebuild rPr clean
    r.remove(rp)
    rp = B.rpr_body(rtl=False, green=False)
    rp.insert(1, B.el('rStyle', {'val': 'Hyperlink'}))
    r.insert(0, rp)
    tt = etree.SubElement(r, q('t'))
    tt.text = url


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    naz = zipfile.ZipFile(NAZ)
    naz_doc = etree.fromstring(naz.read('word/document.xml'))
    naz.close()

    doc = etree.fromstring(parts['word/document.xml'])
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    body = doc[0]

    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    existing = {rel.get('Id') for rel in rels}
    add_rel(rels, existing, 'rIdDoiAtchley89', 'https://doi.org/10.1093/geront/29.2.183')
    add_rel(rels, existing, 'rIdDoiSST99', 'https://doi.org/10.1037/0003-066X.54.3.165')
    add_rel(rels, existing, 'rIdDoiSST06', 'https://doi.org/10.1126/science.1127488')
    add_rel(rels, existing, 'rIdDoiSST21', 'https://doi.org/10.1093/geront/gnab116')
    add_rel(rels, existing, 'rIdDoiReed14', 'https://doi.org/10.1037/a0035194')
    add_rel(rels, existing, 'rIdDoiLopez23', 'https://doi.org/10.1016/j.cell.2022.11.001')
    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)

    # --- rebuild new footnotes like original ---
    tmpl = None
    for f in fn_root.findall(q('footnote')):
        if f.get(q('id')) == '5':
            tmpl = f
            break
    texts = {
        '106': 'Warwick',
        '107': 'Halldórsson',
        '108': 'Stuart',
        '109': 'Çarıkçı-Özgül',
        '110': 'Işık',
    }
    for f in list(fn_root.findall(q('footnote'))):
        if f.get(q('id')) in texts:
            fn_root.remove(f)
    for fid, txt in texts.items():
        fn_root.append(clone_footnote(tmpl, int(fid), txt))
    print('rebuilt fn 106-110')

    fn_ids = [int(f.get(q('id'))) for f in fn_root.findall(q('footnote'))
              if f.get(q('id')) and not f.get(q('type'))]
    nxt = max(fn_ids) + 1

    def add_fn(latin):
        nonlocal nxt
        fid = nxt
        nxt += 1
        fn_root.append(clone_footnote(tmpl, fid, latin))
        return fid

    FN = {
        'SST': add_fn('Socioemotional Selectivity Theory'),
        'Carstensen': add_fn('Carstensen'),
        'positivity': add_fn('positivity effect'),
        'Isaacowitz': add_fn('Isaacowitz'),
        'Charles': add_fn('Charles'),
        'Reed': add_fn('Reed'),
        'Chan': add_fn('Chan'),
        'Mikels': add_fn('Mikels'),
        'King': 42,
        'DeCicco': add_fn('DeCicco'),
    }
    print('SST fns', FN)

    # --- copy Word-shape trees from nazariyeha ---
    WPS = '{http://schemas.microsoft.com/office/word/2010/wordprocessingShape}'
    trees = []  # (tree_p, caption_p)
    pending = None
    for p in naz_doc[0].iter(q('p')):
        nw = len(p.findall('.//' + WPS + 'wsp'))
        t = ptext(p)
        st = style_of(p) or ''
        if nw >= 8:
            pending = p
        elif pending is not None and (st == 'Caption' or t.startswith('شکل ')):
            trees.append((pending, p))
            pending = None
    print('trees found', len(trees), [ptext(c)[:40] for _, c in trees])

    places = [
        '۲-۱-۲- نظریه‌های سالمندی',
        '۲-۲- گستره دوم: اضطراب مرگ',
        '۲-۳- گستره سوم: هوش معنوی',
        '۲-۴- گستره چهارم: اضطراب سلامتی',
    ]
    for (tr, cap), place in zip(trees, places):
        ok = insert_after(body, place, [copy.deepcopy(tr), copy.deepcopy(cap)])
        print('tree ->', place, ok)

    # --- SST ---
    # heading clone from Erikson Heading5
    erik = None
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if st == 'Heading5' and ptext(p).startswith('۲-۱-۲-۲-۳'):
            erik = p
    h_sst = copy.deepcopy(erik) if erik is not None else etree.Element(q('p'))
    for r in list(h_sst.findall(q('r'))):
        h_sst.remove(r)
    hr = etree.SubElement(h_sst, q('r'))
    if erik is not None and erik.find(q('r')) is not None and erik.find(q('r')).find(q('rPr')) is not None:
        hr.append(copy.deepcopy(erik.find(q('r')).find(q('rPr'))))
    ht = etree.SubElement(hr, q('t'))
    ht.text = '۲-۱-۲-۲-۴- نظریه انتخاب اجتماعی-هیجانی'

    # body near Erikson
    erik_body = None
    seen = False
    for p in body.iter(q('p')):
        if p is erik:
            seen = True
            continue
        if seen and ptext(p).strip():
            erik_body = p
            break
    ppr = erik_body.find(q('pPr')) if erik_body is not None else None
    rpr = first_rpr(erik_body) if erik_body is not None else None
    sst_body = body_para([
        'نظریه انتخاب اجتماعی-هیجانی',
        ('fn', FN['SST']),
        ' که توسط لورا کارستنسن',
        ('fn', FN['Carstensen']),
        ' مطرح شد، انگیزش و تجربهٔ هیجانی سالمندی را بر پایهٔ ادراک افق زمانی باقی‌مانده تبیین می‌کند، نه صرفاً سن تقویمی. وقتی آینده گسترده تصور می‌شود، کسب دانش و گسترش شبکه اجتماعی اولویت دارد؛ وقتی زمان محدود ادراک می‌شود ــ وضعیتی که در سالمندی شایع‌تر است ــ افراد اهداف هیجانی و روابط نزدیک را ترجیح می‌دهند. این تغییر با «اثر مثبت‌نگری»',
        ('fn', FN['positivity']),
        ' در توجه و حافظه همراه دانسته شده است. بازنگری‌های بعدی نظریه بر نقش ادراک پایان‌ها در انگیزش تأکید کرده‌اند (کارستنسن، آیزاکوویتز',
        ('fn', FN['Isaacowitz']),
        ' و چارلز',
        ('fn', FN['Charles']),
        '، ۱۹۹۹؛ کارستنسن، ۲۰۰۶؛ رید',
        ('fn', FN['Reed']),
        '، چان',
        ('fn', FN['Chan']),
        ' و مایکلز',
        ('fn', FN['Mikels']),
        '، ۲۰۱۴؛ کارستنسن، ۲۰۲۱).',
    ], ppr, rpr)
    insert_before_heading(body, '۲-۱-۲-۳- نظریه‌های جامعه', [h_sst, sst_body])
    print('inserted SST')

    # --- King 2-3-4 ---
    h33 = None
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if st == 'Heading3' and ptext(p).startswith('۲-۳-۳'):
            h33 = p
    h_king = copy.deepcopy(h33) if h33 is not None else etree.Element(q('p'))
    for r in list(h_king.findall(q('r'))):
        h_king.remove(r)
    hr = etree.SubElement(h_king, q('r'))
    if h33 is not None and h33.find(q('r')) is not None and h33.find(q('r')).find(q('rPr')) is not None:
        hr.append(copy.deepcopy(h33.find(q('r')).find(q('rPr'))))
    ht = etree.SubElement(hr, q('t'))
    ht.text = '۲-۳-۴- مدل چهارعاملی هوش معنوی کینگ'
    # body template
    king_src = None
    seen = False
    for p in body.iter(q('p')):
        if p is h33:
            seen = True
            continue
        if seen and ptext(p).strip() and not (style_of(p) or '').startswith('Heading'):
            king_src = p
            break
    king_body = body_para([
        'کینگ',
        ('fn', FN['King']),
        ' هوش معنوی را مجموعه‌ای از توانایی‌های ذهنی مرتبط با آگاهی، یکپارچگی و کاربرد انطباقی جنبه‌های غیرمادی و وجودی زندگی تعریف می‌کند. مدل چهارعاملی وی شامل تفکر وجودی انتقادی، تولید معنای شخصی، آگاهی متعالی و گسترش هشیارانهٔ حالت آگاهی است. همین مدل مبنای پرسشنامه‌ای است که در پژوهش حاضر برای سنجش هوش معنوی به کار رفته است (کینگ و دی‌سیکو',
        ('fn', FN['DeCicco']),
        '، ۲۰۰۹).',
    ], king_src.find(q('pPr')) if king_src is not None else None,
       first_rpr(king_src) if king_src is not None else None)
    insert_before_heading(body, '۲-۴- گستره چهارم', [h_king, king_body])
    print('inserted King')

    # --- bibliography ---
    hlat = last_heading(body, 'منابع لاتین')
    entries = [
        ('Atchley, R. C. (1989)', None),  # handled as URL upgrade
        ('Carstensen, L. L. (2006)',
         bib_with_url(
             'Carstensen, L. L. (2006). The influence of a sense of time on human development. Science, 312(5782), 1913–1915. ',
             'rIdDoiSST06', 'https://doi.org/10.1126/science.1127488', green=False)),
        ('Carstensen, L. L. (2021)',
         bib_with_url(
             'Carstensen, L. L. (2021). Socioemotional selectivity theory: The role of perceived endings in human motivation. The Gerontologist, 61(8), 1188–1196. ',
             'rIdDoiSST21', 'https://doi.org/10.1093/geront/gnab116', green=False)),
        ('Carstensen, L. L., Isaacowitz',
         bib_with_url(
             'Carstensen, L. L., Isaacowitz, D. M., & Charles, S. T. (1999). Taking time seriously: A theory of socioemotional selectivity. American Psychologist, 54(3), 165–181. ',
             'rIdDoiSST99', 'https://doi.org/10.1037/0003-066X.54.3.165', green=False)),
        ('Reed, A. E.',
         bib_with_url(
             'Reed, A. E., Chan, L., & Mikels, J. A. (2014). Meta-analysis of the age-related positivity effect: Age differences in preferences for positive over negative information. Psychology and Aging, 29(1), 1–15. ',
             'rIdDoiReed14', 'https://doi.org/10.1037/a0035194', green=False)),
    ]
    parent = hlat.getparent()
    kids = list(parent)
    start = kids.index(hlat) + 1
    existing_txt = []
    for el in kids[start:]:
        if el.tag != q('p'):
            break
        existing_txt.append(ptext(el))
    for key, para in entries:
        if para is None:
            continue
        if any(key[:24] in p for p in existing_txt):
            print('bib exists', key)
            continue
        insert_bib_alpha(body, hlat, para, key)
        existing_txt.append(key)
        print('bib add', key)

    # fix bad Havighurst URL; glue Mayer; add Noyes 2002 and Atchley 1989 links
    for p in list(body.iter(q('p'))):
        t = ptext(p)
        if t.startswith('Havighurst, R. J. (1961)') and 'MS9' in t:
            strip_hyperlink_keep_text(p)
            print('removed fake Havighurst DOI')
        if t.startswith('Mayer, J. D') and 'World Health Organization' in t:
            for r in p.findall(q('r')):
                te = r.find(q('t'))
                if te is not None and te.text and 'World Health Organization' in te.text:
                    te.text = te.text.replace('World Health Organization – Ageing and health', '').replace(
                        '.World Health Organization – Ageing and health', '.')
            print('split Mayer/WHO glue')
        if t.startswith('Noyes, R., Jr., Stuart, S., Longley') and p.find(q('hyperlink')) is None:
            append_url_run(p, 'rIdU117', 'https://doi.org/10.1097/00005053-200208000-00002')
            print('link Noyes 2002')
        if t.startswith('Atchley, R. C. (1989)') and p.find(q('hyperlink')) is None:
            append_url_run(p, 'rIdDoiAtchley89', 'https://doi.org/10.1093/geront/29.2.183')
            print('link Atchley 1989')
        if t.startswith('López-Otín') and p.find(q('hyperlink')) is None:
            append_url_run(p, 'rIdDoiLopez23', 'https://doi.org/10.1016/j.cell.2022.11.001')
            print('link Lopez-Otin')


    # match new footnote reference rPr to original (id 5)
    orig_ref = None
    for r in doc.iter(q('r')):
        fr = r.find(q('footnoteReference'))
        if fr is not None and fr.get(q('id')) == '5' and r.find(q('rPr')) is not None:
            orig_ref = r.find(q('rPr'))
            break
    if orig_ref is not None:
        nfix = 0
        for r in doc.iter(q('r')):
            fr = r.find(q('footnoteReference'))
            if fr is None:
                continue
            fid = int(fr.get(q('id') or 0))
            if fid >= 106:
                old = r.find(q('rPr'))
                if old is not None:
                    r.remove(old)
                r.insert(0, copy.deepcopy(orig_ref))
                nfix += 1
        print('fn ref rPr aligned', nfix)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn_root, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as zout:
        for k, v in parts.items():
            zout.writestr(k, v)
    print('نوشته شد:', DST)


if __name__ == '__main__':
    build()
