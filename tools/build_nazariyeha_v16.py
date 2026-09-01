# -*- coding: utf-8 -*-
"""v1.6: حذف درختواره پیشینه؛ جاستیفای متن شرح‌گونه؛ پانویس جدا برای هر نام غیرایرانی."""
import os, sys, zipfile
from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_nazariyeha as B
from build_nazariyeha import W, q

SRC = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.5.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.6.docx'
WP = '{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}'
GREEN = '1B7A3D'


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def is_skip_para(p):
    st = style_of(p) or ''
    if st.startswith(('Heading', 'TOC', 'Caption', 'Bibliography')):
        return True
    if p.find('.//' + WP + 'inline') is not None:
        return True
    return False


def flatten(p):
    """Sequence of ('t', t_el) or ('fn', fn_el) in document order."""
    out = []
    for el in p.iter():
        if el.tag == q('t') and el.text:
            out.append(('t', el))
        elif el.tag == q('footnoteReference'):
            out.append(('fn', el))
    return out


def full_text(nodes):
    return ''.join(el.text if kind == 't' else '' for kind, el in nodes)


def map_offset(nodes, target):
    """Char offset in concatenated t-text → (node_index, offset_in_t)."""
    pos = 0
    for i, (kind, el) in enumerate(nodes):
        if kind != 't':
            continue
        n = len(el.text)
        if pos <= target < pos + n:
            return i, target - pos
        if target == pos + n:
            return i, n
        pos += n
    return None


def is_letter(c):
    if not c:
        return False
    if c == '\u200c':
        return True
    import unicodedata
    return unicodedata.category(c).startswith('L')


def is_whole_word(text, start, needle):
    end = start + len(needle)
    prev = text[start - 1] if start > 0 else ''
    nxt = text[end] if end < len(text) else ''
    if is_letter(prev) or is_letter(nxt):
        return False
    return True


def next_is_fn(nodes, end_offset):
    loc = map_offset(nodes, end_offset)
    if loc is None:
        return False
    i, off = loc
    kind, el = nodes[i]
    if kind == 't' and off < len(el.text):
        return False
    for j in range(i + 1, len(nodes)):
        k2, el2 = nodes[j]
        if k2 == 'fn':
            return True
        if k2 == 't' and el2.text:
            return False
    return False


def run_is_green(r):
    if r is None:
        return False
    rpr = r.find(q('rPr'))
    if rpr is None:
        return False
    c = rpr.find(q('color'))
    return c is not None and c.get(q('val')) == GREEN


def insert_fn_run_after_t(t_el, fid, green=False):
    """Split w:t at its current end (already cut) and insert footnote run after its w:r."""
    r = t_el.getparent()
    parent = r.getparent()
    idx = list(parent).index(r)
    fnr = B.fn_run(fid, green=green)
    parent.insert(idx + 1, fnr)
    return fnr


def insert_after_needle(p, needle, fid, green=None):
    """Insert footnote after the next unmarked whole-word occurrence of needle."""
    nodes = flatten(p)
    text = full_text(nodes)
    from_pos = 0
    start = -1
    while True:
        idx = text.find(needle, from_pos)
        if idx < 0:
            return False
        if is_whole_word(text, idx, needle) and not next_is_fn(nodes, idx + len(needle)):
            start = idx
            break
        from_pos = idx + 1
    if start < 0:
        return False
    end = start + len(needle)
    loc = map_offset(nodes, end)
    if loc is None:
        return False
    i, off = loc
    kind, el = nodes[i]
    if kind != 't':
        return False
    r = el.getparent()
    if green is None:
        green = run_is_green(r)
    txt = el.text
    before, after = txt[:off], txt[off:]
    el.text = before
    if before.startswith(' ') or before.endswith(' ') or before == '':
        el.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    fnr = insert_fn_run_after_t(el, fid, green=green)
    if after:
        parent = r.getparent()
        idx = list(parent).index(fnr)
        nr = etree.Element(q('r'))
        rpr = r.find(q('rPr'))
        if rpr is not None:
            nr.append(etree.fromstring(etree.tostring(rpr)))
        nt = etree.SubElement(nr, q('t'))
        if after.startswith(' ') or after.endswith(' '):
            nt.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
        nt.text = after
        parent.insert(idx + 1, nr)
    return True


def insert_all(p, needle, fid, green=None):
    n = 0
    while insert_after_needle(p, needle, fid, green=green):
        n += 1
        if n > 20:
            break
    return n


def fn_el_after(nodes, end_offset):
    loc = map_offset(nodes, end_offset)
    if loc is None:
        return None
    i, off = loc
    kind, el = nodes[i]
    if kind == 't' and off < len(el.text):
        return None
    for j in range(i + 1, len(nodes)):
        k2, el2 = nodes[j]
        if k2 == 'fn':
            return el2
        if k2 == 't' and el2.text:
            return None
    return None


def remove_fn_after_needle(p, needle, fid=None):
    """Remove footnoteReference immediately after needle. Returns removed id or None."""
    nodes = flatten(p)
    text = full_text(nodes)
    start = text.find(needle)
    if start < 0:
        return None
    end = start + len(needle)
    loc = map_offset(nodes, end)
    if loc is None:
        return None
    i, off = loc
    kind, el = nodes[i]
    if kind == 't' and off < len(el.text):
        return None
    for j in range(i + 1, len(nodes)):
        k2, el2 = nodes[j]
        if k2 == 'fn':
            got = el2.get(q('id'))
            if fid is None or got == str(fid):
                r = el2.getparent()
                if r is not None and r.getparent() is not None:
                    r.getparent().remove(r)
                return got
            return None
        if k2 == 't' and el2.text:
            return None
    return None


def set_fn_text(fn_by_id, fid, new_text):
    note = fn_by_id.get(str(fid))
    if note is None:
        return False
    texts = [t for t in note.iter(q('t'))]
    if not texts:
        return False
    texts[0].text = ' ' + new_text
    texts[0].set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    for extra in texts[1:]:
        extra.text = ''
    return True


def add_footnote(fn_root, fn_by_id, fid, latin):
    el = B.footnote_el(fid, latin)
    fn_root.append(el)
    fn_by_id[str(fid)] = el


def justify_normal(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    sp = ppr.find(q('spacing'))
    if sp is None:
        sp = etree.SubElement(ppr, q('spacing'))
    sp.set(q('after'), '0')
    sp.set(q('line'), '276')
    sp.set(q('lineRule'), 'auto')
    ind = ppr.find(q('ind'))
    if ind is None:
        ind = etree.SubElement(ppr, q('ind'))
    ind.set(q('firstLine'), '397')
    jc = ppr.find(q('jc'))
    if jc is None:
        jc = etree.SubElement(ppr, q('jc'))
    jc.set(q('val'), 'both')
    bidi = ppr.find(q('bidi'))
    if bidi is None:
        bidi = etree.SubElement(ppr, q('bidi'))
    bidi.set(q('val'), '1')


def remove_fig5(body):
    removed = 0
    kids = list(body)
    for i, p in enumerate(kids):
        if p.tag != q('p'):
            continue
        t = ptext(p)
        if t.startswith('شکل ۵- درختواره پیشینه') or t.startswith('شکل 5- درختواره پیشینه'):
            if i > 0:
                prev = kids[i - 1]
                if prev.find('.//' + WP + 'inline') is not None:
                    body.remove(prev)
                    removed += 1
            if p.getparent() is not None:
                body.remove(p)
                removed += 1
            print('removed fig5', t[:40])
            return removed
    print('MISS fig5')
    return removed


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    body = doc[0]

    remove_fig5(body)

    n_just = 0
    for p in body.iter(q('p')):
        if style_of(p) == 'Normal':
            justify_normal(p)
            n_just += 1
    print('justified Normal', n_just)

    fn_by_id = {}
    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')):
            continue
        fn_by_id[f.get(q('id'))] = f
    next_id = max(int(i) for i in fn_by_id) + 1

    def alloc(latin):
        nonlocal next_id
        fid = next_id
        next_id += 1
        add_footnote(fn_root, fn_by_id, fid, latin)
        return fid

    # --- update shared footnote texts to the name they currently sit on ---
    updates = {
        16: 'McAdams',
        22: 'Mikels',
        24: 'Henry',
        28: 'Tobin',
        29: 'Kahn',
        33: 'Iverach',
        37: 'Menzies',
        38: 'DeCicco',
        46: 'Mikulincer',
        52: 'Mayer',
        74: 'Fergus',
        76: 'Abramowitz',
        78: 'Taylor',
        89: 'Beck',
        91: 'Zhao',
        93: 'Yonker',
        96: 'Mat Saad',
        97: 'Chlan',
        98: 'King',
        99: 'Jain',
        101: 'Thorson',
        102: 'Moreira-Almeida',
        103: 'Jain',
        105: 'Tomer',
        66: 'King',
    }
    for fid, txt in updates.items():
        set_fn_text(fn_by_id, fid, txt)

    # ids we will reuse for names already defined
    RE = {
        'WHO': 2,
        'Carstensen': 18,
        'Isaacowitz': 19,
        'Charles': 20,
        'Erikson': 14,
        'Kivnick': 15,
        'Havighurst': 27,
        'Atchley': 25,
        'Gould': 11,
        'Levinson': 12,
        'Schaie': 13,
        'King': 36,
        'Pyszczynski': 32,
        'Iverach': 33,
        'Freud': 42,
        'Yalom': 43,
        'Wong': 34,
        'DSM': 71,
        'APA_psychiat': 73,
        'APA_psychol': 88,
        'Abramowitz': 76,
        'Greenberg': 45,
        'Ryff': 63,
        'Pinto': 53,
        'Nikolich': 4,
        'Fulop': 5,
        'Franceschi': 7,
        'Lopez': 8,
        'Gladyshev': 10,
        'Campisi': 9,
        'Reed': 22,  # will be reassigned — don't reuse 22 for Reed after update to Mikels
    }

    # new ids
    N = {}
    def nid(key, latin):
        if key not in N:
            N[key] = alloc(latin)
        return N[key]

    stats = {'ins': 0, 'miss': []}

    def put(p, needle, fid, label=None):
        n = insert_all(p, needle, fid)
        stats['ins'] += n
        if n == 0 and needle not in ptext(p):
            return 0
        if n == 0:
            # already marked or failed
            nodes = flatten(p)
            text = full_text(nodes)
            if needle in text and not next_is_fn(nodes, text.find(needle) + len(needle)):
                stats['miss'].append((label or needle, ptext(p)[:40]))
        return n

    # paragraphs to process
    paras = [p for p in body.iter(q('p')) if p.tag == q('p') and not is_skip_para(p)]

    # stop at latin refs: skip Bibliography already. Also skip if text is mostly ascii.
    def is_latin_bib(p):
        t = ptext(p).strip()
        if not t:
            return True
        ascii_n = sum(1 for c in t if c.isascii() and c.isalpha())
        fa_n = sum(1 for c in t if '\u0600' <= c <= '\u06FF')
        return ascii_n > fa_n and fa_n < 8

    body_paras = [p for p in paras if not is_latin_bib(p)]

    # --- pair/list: first names that currently have no mark ---
    # (needle, fid)
    jobs = []

    def add_job(needle, fid):
        jobs.append((needle, fid))

    # Cumming & Henry
    add_job('کامینگ', nid('Cumming', 'Cumming'))
    # Henry already 24
    # Rowe & Kahn
    add_job('رو و کان', None)  # special: insert after رو only — handled below
    add_job('وسترهاف', nid('Westerhof', 'Westerhof'))
    add_job('بولمایر', nid('Bohlmeijer', 'Bohlmeijer'))
    # McAdams is 16
    add_job('رید،', None)
    add_job('چان', nid('Chan', 'Chan'))
    # Mikels 22
    add_job('ایوراچ', RE['Iverach'])
    add_job('منزیس', nid('Menzies1', 'Menzies'))  # first of a pair; second keeps 33/37
    add_job('نیوگارتن', nid('Neugarten', 'Neugarten'))
    # Tobin 28; Havighurst in that list:
    add_job('هاویگهرست، نیوگارتن', None)
    add_job('فلوریان', nid('Florian', 'Florian'))
    add_job('سالوی', nid('Salovey', 'Salovey'))
    add_job('والنتاینر', nid('Valentiner', 'Valentiner'))
    add_job('برادوک', nid('Braddock', 'Braddock'))
    add_job('دی‌سیکو', nid('DeCicco', 'DeCicco'))
    add_job('دسیکو', nid('DeCicco2', 'DeCicco'))
    add_job('اسنابلروچ', nid('Schnabelrauch', 'Schnabelrauch'))
    add_job('دهان', nid('DeHaan', 'DeHaan'))
    add_job('زبراکی', nid('Zebracki', 'Zebracki'))
    add_job('وگل', nid('Vogel', 'Vogel'))
    add_job('پوروحیت', nid('Purohit', 'Purohit'))
    add_job('پاوول', nid('Powell', 'Powell'))
    add_job('الیسون', nid('Eliason', 'Eliason'))
    add_job('کوئینگ', nid('Koenig2', 'Koenig'))
    add_job('زولکرنین آ. حتا', nid('Hatta', 'Hatta'))
    add_job('نوریا محمد', nid('Mohamad', 'Mohamad'))
    add_job('گو و جورج', None)
    add_job('جورج', nid('George', 'George'))
    add_job('ژائو', 91)  # already
    add_job('وانگ و ژائو', None)
    add_job('آیزاکوویتز', RE['Isaacowitz'])
    add_job('چارلز', RE['Charles'])
    add_job('کیونیو', RE['Kivnick'])
    add_job('رایس', nid('Rice', 'Rice'))
    add_job('رابرت آچلی', RE['Atchley'])
    add_job('سالکوویس', nid('Salkovskis', 'Salkovskis'))
    add_job('وارویک', nid('Warwick', 'Warwick'))
    add_job('هالدورسون', nid('Halldorsson', 'Halldórsson'))
    add_job('سالکووسکیس', nid('Salkovskis2', 'Salkovskis'))
    add_job('بولتون', nid('Bolton', 'Bolton'))
    add_job('ژیلت', nid('Gillett', 'Gillett'))
    add_job('چاریکچی‌اوزگول', nid('Charikci', 'Çarıkçı-Özgül'))
    add_job('ایشیک', nid('Isik', 'Işık'))
    add_job('کیکاس', nid('Kikas', 'Kikas'))
    add_job('لو، یانگ', None)
    add_job('یانگ', nid('Yang', 'Yang'))
    add_job('یونس', nid('Younes', 'Younes'))
    add_job('رحمه', nid('Rahme', 'Rahme'))
    add_job('راجحا', nid('Rajha', 'Rajha'))
    add_job('مزواک', nid('Mzawak', 'Mzawak'))
    add_job('کیلینگزورث', nid('Killingsworth', 'Killingsworth'))
    add_job('DSM-5-TR', RE['DSM'])
    add_job('DSM-5', RE['DSM'])
    add_job('انجمن روان‌پزشکی آمریکا', RE['APA_psychiat'])
    add_job('انجمن روان‌شناسی آمریکا', RE['APA_psychol'])
    add_job('سازمان جهانی بهداشت', RE['WHO'])
    add_job('آبراموویتز', RE['Abramowitz'])
    add_job('کارستنسن', RE['Carstensen'])
    add_job('پیشزچینسکی', RE['Pyszczynski'])
    add_job('آچلی', RE['Atchley'])
    add_job('گولد', RE['Gould'])
    add_job('لوینسون', RE['Levinson'])
    add_job('اریکسون', RE['Erikson'])
    add_job('یالوم', RE['Yalom'])
    add_job('فروید', RE['Freud'])
    add_job('وانگ', RE['Wong'])  # careful — وانگ also Wang in literature
    add_job('ریف', RE['Ryff'])
    add_job('کینگ', RE['King'])
    add_job('گرین برگ', RE['Greenberg'])
    add_job('هایگ', nid('Haigh', 'Haigh'))
    add_job('کامپیزی', 9)
    add_job('گلادیشف', 10)
    add_job('فرانچسکی', 7)
    add_job('لوپز-اوتین', 8)
    add_job('نیکولاس', 4)
    add_job('فولپ', 5)
    add_job('پینتو', RE['Pinto'])

    # special unique insertions (avoid short-name collisions)
    specials = [
        # (must_contain, needle_for_insert_after, fid)
        ('کامینگ و هنری', 'کامینگ', nid('Cumming', 'Cumming')),
        ('رو و کان', 'رو و کان', None),  # placeholder
        ('رید، چان و مایکلز', 'رید', nid('Reed', 'Reed')),
        ('رید، چان و مایکلز', 'چان', nid('Chan', 'Chan')),
        ('هاویگهرست، نیوگارتن', 'هاویگهرست', RE['Havighurst']),
        ('وانگ و ژائو', 'وانگ', nid('WangZhao', 'Wang')),
        ('زنگ', 'گو', nid('Gu', 'Gu')),
        ('لو، یانگ و ما', 'لو', nid('Lou', 'Lou')),
        ('لو، یانگ و ما', 'ما', nid('Ma', 'Ma')),
        ('کارستنسن، آیزاکوویتز', 'کارستنسن', RE['Carstensen']),
        ('اریکسون و کیونیو', 'اریکسون', RE['Erikson']),
        ('کینگ و دی‌سیکو', 'کینگ', RE['King']),
        ('کینگ و دسیکو', 'کینگ', RE['King']),
        ('منزیس و منزیس', 'منزیس', nid('MenziesA', 'Menzies')),
        ('ایوراچ، منزیس', 'منزیس', nid('MenziesB', 'Menzies')),
        ('موریرا آلمیدا', 'موریرا آلمیدا', 102),
        ('شی ', 'شی', RE['Schaie']),
    ]

    # 1) move Moreira fn from after موریرا to after آلمیدا
    for p in body_paras:
        t = ptext(p)
        if 'موریرا' in t and 'آلمیدا' in t:
            remove_fn_after_needle(p, 'موریرا', fid='102')
            put(p, 'موریرا آلمیدا', 102, 'Moreira-Almeida')

    # 2) رو و کان — insert after رو (not after the whole phrase)
    for p in body_paras:
        t = ptext(p)
        if 'رو و کان' in t:
            # insert after the رو that is in this phrase
            put(p, 'رو و کان', nid('Rowe', 'Rowe'))
            # that put fn after whole phrase which already has 29 after کان.
            # So instead: insert after 'رو' only if followed by ' و کان'
            # undo if we added after whole phrase — insert_after_needle on 'رو و کان'
            # would skip because fn already after کان.
            # Do: find 'رو و کان' and insert after first two chars رو
            nodes = flatten(p)
            text = full_text(nodes)
            idx = text.find('رو و کان')
            if idx >= 0:
                # insert after 'رو' at idx+2
                needle_prefix = text[idx:idx + 2]  # رو
                # use a unique longer? We'll split at idx+2 via custom
                loc = map_offset(nodes, idx + 2)
                if loc and not next_is_fn(nodes, idx + 2):
                    i, off = loc
                    kind, el = nodes[i]
                    if kind == 't':
                        r = el.getparent()
                        green = run_is_green(r)
                        txt = el.text
                        before, after = txt[:off], txt[off:]
                        el.text = before
                        fnr = insert_fn_run_after_t(el, N['Rowe'], green=green)
                        if after:
                            parent = r.getparent()
                            ix = list(parent).index(fnr)
                            nr = etree.Element(q('r'))
                            rpr = r.find(q('rPr'))
                            if rpr is not None:
                                nr.append(etree.fromstring(etree.tostring(rpr)))
                            nt = etree.SubElement(nr, q('t'))
                            if after.startswith(' ') or after.endswith(' '):
                                nt.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                            nt.text = after
                            parent.insert(ix + 1, nr)
                        stats['ins'] += 1

    # 3) لو — only in Lou/Yang/Ma paragraph
    for p in body_paras:
        t = ptext(p)
        if t.startswith('لو، یانگ و ما'):
            put(p, 'لو', nid('Lou', 'Lou'), 'Lou')
            put(p, 'یانگ', nid('Yang', 'Yang'), 'Yang')
            phrase = 'و ما در سال'
            nodes = flatten(p)
            text = full_text(nodes)
            idx = text.find(phrase)
            if idx >= 0:
                end_ma = idx + len('و ما')
                if not next_is_fn(nodes, end_ma):
                    loc = map_offset(nodes, end_ma)
                    if loc:
                        i, off = loc
                        kind, el = nodes[i]
                        if kind == 't':
                            r = el.getparent()
                            green = run_is_green(r)
                            before, after = el.text[:off], el.text[off:]
                            el.text = before
                            fnr = insert_fn_run_after_t(el, nid('Ma', 'Ma'), green=green)
                            if after:
                                parent = r.getparent()
                                ix = list(parent).index(fnr)
                                nr = etree.Element(q('r'))
                                rpr = r.find(q('rPr'))
                                if rpr is not None:
                                    nr.append(etree.fromstring(etree.tostring(rpr)))
                                nt = etree.SubElement(nr, q('t'))
                                if after.startswith(' ') or after.endswith(' '):
                                    nt.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                                nt.text = after
                                parent.insert(ix + 1, nr)
                            stats['ins'] += 1

    # 4) generic jobs with uniqueness guards
    GENERIC = [
        ('کامینگ', N['Cumming']),
        ('وسترهاف', N['Westerhof']),
        ('بولمایر', N['Bohlmeijer']),
        ('رید', N['Reed']),
        ('چان', N['Chan']),
        ('نیوگارتن', N['Neugarten']),
        ('فلوریان', N['Florian']),
        ('سالوی', N['Salovey']),
        ('والنتاینر', N['Valentiner']),
        ('برادوک', N['Braddock']),
        ('دی‌سیکو', N['DeCicco']),
        ('دسیکو', N['DeCicco2']),
        ('اسنابلروچ', N['Schnabelrauch']),
        ('دهان', N['DeHaan']),
        ('زبراکی', N['Zebracki']),
        ('وگل', N['Vogel']),
        ('پوروحیت', N['Purohit']),
        ('پاوول', N['Powell']),
        ('الیسون', N['Eliason']),
        ('کوئینگ', N['Koenig2']),
        ('زولکرنین آ. حتا', N['Hatta']),
        ('نوریا محمد', N['Mohamad']),
        ('جورج', N['George']),
        ('گو', N['Gu']),
        ('رایس', N['Rice']),
        ('رابرت آچلی', RE['Atchley']),
        ('سالکوویس', N['Salkovskis']),
        ('وارویک', N['Warwick']),
        ('هالدورسون', N['Halldorsson']),
        ('سالکووسکیس', N['Salkovskis2']),
        ('بولتون', N['Bolton']),
        ('ژیلت', N['Gillett']),
        ('چاریکچی‌اوزگول', N['Charikci']),
        ('ایشیک', N['Isik']),
        ('کیکاس', N['Kikas']),
        ('یونس', N['Younes']),
        ('رحمه', N['Rahme']),
        ('راجحا', N['Rajha']),
        ('مزواک', N['Mzawak']),
        ('کیلینگزورث', N['Killingsworth']),
        ('یانگ', N['Yang']),
        ('هایگ', N['Haigh']),
        ('هایگا', N['Haigh']),
        ('آیزاکوویتز', RE['Isaacowitz']),
        ('برادوک', N['Braddock']),
        ('DSM-5-TR', RE['DSM']),
        ('انجمن روان‌پزشکی آمریکا', RE['APA_psychiat']),
        ('انجمن روان‌شناسی آمریکا', RE['APA_psychol']),
        ('سازمان جهانی بهداشت', RE['WHO']),
        ('آبراموویتز', RE['Abramowitz']),
        ('چاریکچی‌اوزگول', N['Charikci']),
    ]

    # names that are common words — only in specific contexts
    CONTEXT = [
        ('پیشزچینسکی', RE['Pyszczynski']),
        ('ایوراچ', RE['Iverach']),
        ('کارستنسن', RE['Carstensen']),
        ('آچلی', RE['Atchley']),
        ('لوینسون', RE['Levinson']),
        ('اریکسون', RE['Erikson']),
        ('کیونیو', RE['Kivnick']),
        ('یالوم', RE['Yalom']),
        ('فروید', RE['Freud']),
        ('کینگ', RE['King']),
        ('گولد', RE['Gould']),
        ('گرین برگ', RE['Greenberg']),
        ('فرانچسکی', 7),
        ('لوپز-اوتین', 8),
        ('نیکولاس', 4),
        ('فولپ', 5),
        ('گلادیشف', 10),
        ('کامپیزی', 9),
        ('پینتو', RE['Pinto']),
        ('ریف', RE['Ryff']),
        ('منزیس', N['MenziesA']),
        ('هاویگهرست', RE['Havighurst']),
        ('چارلز', RE['Charles']),
        ('شی', RE['Schaie']),
    ]

    # وانگ is Wong in some paras and Wang in literature
    for p in body_paras:
        t = ptext(p)
        for needle, fid in GENERIC:
            if needle in t:
                put(p, needle, fid, needle)
        for needle, fid in CONTEXT:
            if needle in t:
                # شی is too short / common as particle? In Persian شی as Schaie is " شی" after period
                if needle == 'شی':
                    if 'شی (' in t or 'شی(' in t or 'لوینسون و شی' in t:
                        if 'شی (' in t:
                            put(p, 'شی', fid, 'Schaie')
                        elif 'شی(' in t:
                            put(p, 'شی', fid, 'Schaie')
                    continue
                if needle == 'ریف' and 'شریف' in t and 'ریف' not in t.replace('شریف', ''):
                    continue
                put(p, needle, fid, needle)
        # وانگ: literature Wang vs Wong
        if 'وانگ و ژائو' in t:
            put(p, 'وانگ', N['WangZhao'], 'Wang')
        elif 'وانگ' in t:
            # later literature Wang 84 already on some; Wong in existential
            put(p, 'وانگ', 84 if 'همکاران' in t or '۲۰۲۳' in t or '2023' in t else RE['Wong'], 'Wang/Wong')

    # move «و همکاران» footnotes onto the name
    hamkaran_names = [
        'نیکولاس', 'فولپ', 'فرانچسکی', 'لوپز-اوتین', 'پیشزچینسکی',
        'کیکاس', 'ایوراچ', 'پینتو', 'کیلینگزورث',
    ]
    # ایوراچ should keep 33; last منزیس in that sentence must not stay Iverach
    for p in body_paras:
        t = ptext(p)
        if 'ایوراچ' not in t or 'منزیس' not in t:
            continue
        nodes = flatten(p)
        text = full_text(nodes)
        from_pos = 0
        while True:
            idx = text.find('منزیس', from_pos)
            if idx < 0:
                break
            if is_whole_word(text, idx, 'منزیس'):
                el = fn_el_after(nodes, idx + len('منزیس'))
                if el is not None and el.get(q('id')) == '33':
                    el.set(q('id'), str(N['MenziesA']))
            from_pos = idx + 1

    for p in body_paras:
        t = ptext(p)
        for name in hamkaran_names:
            key = name + ' و همکاران'
            if key not in t:
                continue
            removed = remove_fn_after_needle(p, key)
            if removed:
                insert_after_needle(p, name, int(removed))
                stats['ins'] += 1

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn_root, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST, 'inserts', stats['ins'], 'next_id', next_id)
    if stats['miss']:
        print('miss', len(stats['miss']))
        for m in stats['miss'][:15]:
            print(' ', m)


if __name__ == '__main__':
    build()
