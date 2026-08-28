# -*- coding: utf-8 -*-
"""
v1.3 — فقط نواقص درخواستی، روی فایل اصلی.

۱) قالب پانویس مطابق فایل پیام‌نور: ۹/۱۰ نقطه، چپ‌چین، TNR
۲) چکیده از ابتدای صفحه + مدخل فهرست
۳) سرفصل با page break بدون فضای خالی قبل
۴) انتقال علامت پانویس به پایانِ همان نام/عبارت
۵) پانویس برای نام‌ها، نظریه‌ها، نمادها، اشخاص و سازمان‌های غیرایرانیِ بدون پوشش
۶) زبان فقط fa-IR / en-US
"""
import copy, re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W = '{%s}' % NS
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
def q(t): return W + t

TNR, LOTUS, TITR = 'Times New Roman', 'B Lotus', 'B Titr'
LETTERS = 'آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیئءأإؤة‌'

# هر پانویس موجود → عبارتی که علامت باید بلافاصله بعد از آن بنشیند
AFTER = {
    '1': ['صندوق جمعیت سازمان ملل متحد', 'سازمان ملل متحد'],
    '4': ['لیو'],
    '5': ['کیکاس'],
    '6': ['وانگ'],
    '7': ['اتچیسون'],
    '8': ['ژرونتولوژی'],
    '9': ['سازمان جهانی بهداشت'],
    '10': ['نظریه ایمنی'],
    '11': ['نیکولاس'],
    '12': ['فولپ'],
    '13': ['لوپز-اوتین'],
    '14': ['کامپیزی'],
    '15': ['گلادیشف'],
    '16': ['گولد'],
    '17': ['لوینسون'],
    '18': ['شی'],
    '19': ['اریکسون'],
    '20': ['کیونیو'],
    '21': ['نظریه عدم تعهد'],
    '22': ['کامینگ'],
    '23': ['آچلی'],
    '24': ['نظریه فعالیت'],
    '25': ['هاویگهرست'],
    '26': ['توبین'],
    '27': ['داود'],
    '28': ['نظریه تداوم'],
    '29': ['نوردگرن'],
    '30': ['مارتین'],
    '31': ['فروید'],
    '32': ['یالوم'],
    '33': ['گرینبرگ', 'گرین برگ'],
    '34': ['میکولینسر'],
    '35': ['نیمیر'],
    '36': ['ون بروگن'],
    '37': ['هوانگ'],
    '38': ['استرنبرگ'],
    '39': ['مایر'],
    '40': ['پینتو'],
    '41': ['پینتو', 'ریف'],
    '42': ['کینگ'],
    '43': ['زوهار'],
    '44': ['آبراموویتز', 'ابراموویتس'],
    '45': ['پاپالیا'],
    '46': ['سالکوسکیس', 'وارویک'],
    '47': ['آبراموویتز', 'ابراموویتس'],
    '48': ['انگل'],
    '49': ['آسموندسون', 'آسْموندسون'],
    '50': ['ماوندر', 'هانتر'],
    '51': ['انجمن روان‌پزشکی آمریکا', 'انجمن روان پزشکی آمریکا'],
    '52': ['فرگوس'],
    '53': ['آبراموویتز', 'ابراموویتس'],
    '54': ['تیلور'],
    '55': ['سازمان جهانی بهداشت'],
    '56': ['انجمن روان‌پزشکی آمریکا', 'انجمن روان پزشکی آمریکا'],
    '57': ['نشنال اینستیتوت'],
    '58': ['کونیگ'],
    '59': ['وانگ'],
    '60': ['سوتو'],
    '61': ['چن'],
    '62': ['کاپلان'],
    '63': ['بک'],
    '64': ['گولد'],
    '65': ['ژائو', 'وانگ'],
    '66': ['استاوروا'],
    '67': ['یانکر'],
    '68': ['زنگ'],
    '69': ['لوین'],
    '70': ['سعاد'],
    '71': ['چالن'],
    '72': ['کینگ'],
    '73': ['جین'],
    '74': ['هاردینگ'],
    '75': ['دورسون'],
    '76': ['موریرا'],
    '77': ['جین'],
    '78': ['نویز'],
    '79': ['تامر'],
    '80': ['یالوم'],
    '81': ['کرجسی'],
    '82': ['لوین'],
    '83': ['کینگ'],
    '84': ['هاردینگ'],
    '85': ['نویز'],
}

# نواقص پوشش: نخستین رخداد پس از چکیده
NEW_FN = [
    (['تمپلر'], 'Templer'),
    (['سالکوفسکیس', 'سالکوسکیس'], 'Salkovskis'),
    (['یونگ'], 'Jung'),
    (['فرنس'], 'Franz'),
    (['فرانکل'], 'Frankl'),
    (['آدلر'], 'Adler'),
    (['ویلیام جیمز'], 'William James'),
    (['رایان'], 'Ryan'),
    (['دسی'], 'Deci'),
    (['ریف'], 'Ryff'),
    (['کیز'], 'Keyes'),
    (['داینر', 'دیتر'], 'Diener'),
    (['بالبی'], 'Bowlby'),
    (['مازلو'], 'Maslow'),
    (['سازمان ملل متحد'], 'United Nations'),
    (['صندوق جمعیت سازمان ملل متحد'], 'UNFPA'),
    (['انجمن روان‌شناسی آمریکا'], 'American Psychological Association'),
    (['TMT'], 'Terror Management Theory'),
    (['DAS'], 'Death Anxiety Scale'),
    (['HAI'], 'Health Anxiety Inventory'),
    (['DSM-5'], 'Diagnostic and Statistical Manual of Mental Disorders'),
]


def ptext(p):
    return ''.join(t.text or '' for t in p.iter(q('t')))


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def rpr_of(el, create=False):
    rpr = el.find(q('rPr'))
    if rpr is None and create:
        rpr = etree.Element(q('rPr'))
        el.insert(0, rpr)
    return rpr


def set_fonts(rpr, cs, latin=TNR):
    rf = rpr.find(q('rFonts'))
    if rf is None:
        rf = etree.Element(q('rFonts'))
        rpr.insert(0, rf)
    rf.set(q('ascii'), latin)
    rf.set(q('hAnsi'), latin)
    rf.set(q('eastAsia'), latin)
    rf.set(q('cs'), cs)


def set_sz(rpr, half, half_cs=None):
    if half_cs is None:
        half_cs = half
    for tag, val in (('sz', half), ('szCs', half_cs)):
        e = rpr.find(q(tag))
        if e is None:
            e = etree.SubElement(rpr, q(tag))
        e.set(q('val'), str(val))


def bounded_find(text, needle):
    if re.fullmatch(r'[A-Za-z0-9\-]+', needle or ''):
        pat = r'(?<![A-Za-z0-9])' + re.escape(needle) + r'(?![A-Za-z0-9])'
    else:
        pat = r'(?<![' + LETTERS + r'])' + re.escape(needle) + r'(?![' + LETTERS + r'])'
    return list(re.finditer(pat, text))


def first_needle(plain, needles):
    """فقط تطابق مرزی؛ زیررشتهٔ درون واژه (مثل ریف⊂تعریف) قبول نیست."""
    for needle in needles:
        if bounded_find(plain, needle):
            return needle
        if (' ' in needle or '\u200c' in needle) and needle in plain:
            return needle
    return None


def text_runs(p):
    """ران‌های دارای متن، به ترتیب سند (بدون علامت پانویس)."""
    out = []
    for r in p.iter(q('r')):
        if r.find(q('footnoteReference')) is not None:
            continue
        t = r.find(q('t'))
        if t is not None and t.text:
            out.append(r)
    return out


def plain_of_runs(runs):
    return ''.join((r.find(q('t')).text or '') for r in runs)


def split_run_at(r, offset):
    t = r.find(q('t'))
    text = t.text or ''
    if offset <= 0 or offset >= len(text):
        return
    t.text = text[:offset]
    if text[:offset].startswith(' ') or text[:offset].endswith(' '):
        t.set(XML_SPACE, 'preserve')
    nr = copy.deepcopy(r)
    nt = nr.find(q('t'))
    nt.text = text[offset:]
    if text[offset:].startswith(' ') or text[offset:].endswith(' '):
        nt.set(XML_SPACE, 'preserve')
    r.addnext(nr)


def insert_run_after_phrase(p, phrase, run):
    """علامت را بلافاصله بعد از phrase می‌گذارد. True اگر پیدا شد."""
    runs = text_runs(p)
    if not runs:
        return False
    plain = plain_of_runs(runs)
    hits = bounded_find(plain, phrase)
    if not hits:
        # بدون مرز، برای عبارات چندکلمه‌ای
        i = plain.find(phrase)
        if i < 0:
            return False
        end = i + len(phrase)
    else:
        end = hits[0].end()
    acc = 0
    for r in runs:
        t = r.find(q('t'))
        n = len(t.text or '')
        if acc + n >= end:
            off = end - acc
            if off < n:
                split_run_at(r, off)
            r.addnext(run)
            return True
        acc += n
    return False


def take_fn_runs(p):
    found = []
    for r in list(p.iter(q('r'))):
        if r.find(q('footnoteReference')) is not None:
            found.append(r)
            r.getparent().remove(r)
    return found


def make_fn_ref_run(fid):
    r = etree.Element(q('r'))
    rpr = etree.SubElement(r, q('rPr'))
    st = etree.SubElement(rpr, q('rStyle'))
    st.set(q('val'), 'FootnoteReference')
    set_fonts(rpr, TNR, TNR)
    lang = etree.SubElement(rpr, q('lang'))
    lang.set(q('bidi'), 'fa-IR')
    fr = etree.SubElement(r, q('footnoteReference'))
    fr.set(q('id'), str(fid))
    return r


def make_fn_mark_run():
    r = etree.Element(q('r'))
    rpr = etree.SubElement(r, q('rPr'))
    st = etree.SubElement(rpr, q('rStyle'))
    st.set(q('val'), 'FootnoteReference')
    set_fonts(rpr, TNR, TNR)
    set_sz(rpr, 18, 20)
    etree.SubElement(r, q('footnoteRef'))
    return r


def make_footnote_el(fid, english, model_fn):
    el = copy.deepcopy(model_fn)
    el.set(q('id'), str(fid))
    if q('type') in el.attrib:
        del el.attrib[q('type')]
    p = el.find(q('p'))
    if p is None:
        p = etree.SubElement(el, q('p'))
    for extra in list(el):
        if extra is not p:
            el.remove(extra)
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    for old in list(p):
        if old is not ppr:
            p.remove(old)
    ps = ppr.find(q('pStyle'))
    if ps is None:
        ps = etree.SubElement(ppr, q('pStyle'))
    ps.set(q('val'), 'FootnoteText')
    bidi = ppr.find(q('bidi'))
    if bidi is None:
        bidi = etree.SubElement(ppr, q('bidi'))
    bidi.set(q('val'), '0')
    jc = ppr.find(q('jc'))
    if jc is None:
        jc = etree.SubElement(ppr, q('jc'))
    jc.set(q('val'), 'left')
    p.append(make_fn_mark_run())
    tr = etree.SubElement(p, q('r'))
    rpr = etree.SubElement(tr, q('rPr'))
    set_fonts(rpr, TNR, TNR)
    set_sz(rpr, 18, 20)
    te = etree.SubElement(tr, q('t'))
    te.set(XML_SPACE, 'preserve')
    te.text = ' ' + english
    return el


def format_footnotes(fn_root):
    n = 0
    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')):
            continue
        for p in f.findall(q('p')):
            ppr = p.find(q('pPr'))
            if ppr is None:
                ppr = etree.Element(q('pPr'))
                p.insert(0, ppr)
            ps = ppr.find(q('pStyle'))
            if ps is None:
                ps = etree.SubElement(ppr, q('pStyle'))
            ps.set(q('val'), 'FootnoteText')
            bidi = ppr.find(q('bidi'))
            if bidi is None:
                bidi = etree.SubElement(ppr, q('bidi'))
            bidi.set(q('val'), '0')
            jc = ppr.find(q('jc'))
            if jc is None:
                jc = etree.SubElement(ppr, q('jc'))
            jc.set(q('val'), 'left')
            for r in p.iter(q('r')):
                rpr = rpr_of(r, create=True)
                set_fonts(rpr, TNR, TNR)
                set_sz(rpr, 18, 20)
                n += 1
    return n


def fix_footnote_styles(styles):
    for st in styles.findall(q('style')):
        sid = st.get(q('styleId')) or ''
        if sid == 'FootnoteText':
            rpr = st.find(q('rPr'))
            if rpr is None:
                rpr = etree.SubElement(st, q('rPr'))
            set_fonts(rpr, LOTUS, TNR)
            set_sz(rpr, 18, 20)  # ۹ نقطه لاتین / ۱۰ نقطه پیچیده
            ppr = st.find(q('pPr'))
            if ppr is None:
                ppr = etree.Element(q('pPr'))
                st.insert(0, ppr)
            jc = ppr.find(q('jc'))
            if jc is None:
                jc = etree.SubElement(ppr, q('jc'))
            jc.set(q('val'), 'left')
            sp = ppr.find(q('spacing'))
            if sp is None:
                sp = etree.SubElement(ppr, q('spacing'))
            sp.set(q('after'), '0')
            sp.set(q('line'), '240')
            sp.set(q('lineRule'), 'auto')
        elif sid == 'FootnoteReference':
            rpr = st.find(q('rPr'))
            if rpr is None:
                rpr = etree.SubElement(st, q('rPr'))
            # قالب مبدأ: بولد، نه بالانویس صریح
            if rpr.find(q('b')) is None:
                etree.SubElement(rpr, q('b'))
            if rpr.find(q('bCs')) is None:
                etree.SubElement(rpr, q('bCs'))
            va = rpr.find(q('vertAlign'))
            if va is not None:
                rpr.remove(va)
            set_sz(rpr, 18, 20)
        elif sid == 'Heading1':
            ppr = st.find(q('pPr'))
            if ppr is None:
                ppr = etree.Element(q('pPr'))
                st.insert(0, ppr)
            sp = ppr.find(q('spacing'))
            if sp is None:
                sp = etree.SubElement(ppr, q('spacing'))
            sp.set(q('before'), '0')


def chapter_pagebreaks(body, rep):
    blocks = list(body)
    for i, p in enumerate(blocks):
        if p.tag != q('p'):
            continue
        sv = style_of(p)
        ppr = p.find(q('pPr'))
        if ppr is None:
            continue
        if sv == 'Heading1':
            if ppr.find(q('pageBreakBefore')) is None:
                etree.SubElement(ppr, q('pageBreakBefore'))
            sp = ppr.find(q('spacing'))
            if sp is None:
                sp = etree.SubElement(ppr, q('spacing'))
            sp.set(q('before'), '0')
            if sp.get(q('after')) is None:
                sp.set(q('after'), '240')
            # پاراگراف خالی بلافاصله بعد
            if i + 1 < len(blocks) and blocks[i + 1].tag == q('p'):
                nxt = blocks[i + 1]
                if not ptext(nxt).strip() and style_of(nxt) is None:
                    body.remove(nxt)
                    rep['empty_after_h1'] += 1
            rep['h1_break'] += 1
        elif sv in ('Heading2', 'Heading3', 'Heading4'):
            pb = ppr.find(q('pageBreakBefore'))
            if pb is not None:
                ppr.remove(pb)
                rep['h2_break_removed'] += 1


def make_chekideh_heading(p):
    ppr = p.find(q('pPr'))
    if ppr is None:
        ppr = etree.Element(q('pPr'))
        p.insert(0, ppr)
    ps = ppr.find(q('pStyle'))
    if ps is None:
        ps = etree.SubElement(ppr, q('pStyle'))
    ps.set(q('val'), 'Heading1')
    if ppr.find(q('pageBreakBefore')) is None:
        etree.SubElement(ppr, q('pageBreakBefore'))
    sp = ppr.find(q('spacing'))
    if sp is None:
        sp = etree.SubElement(ppr, q('spacing'))
    sp.set(q('before'), '0')
    sp.set(q('after'), '240')
    jc = ppr.find(q('jc'))
    if jc is None:
        jc = etree.SubElement(ppr, q('jc'))
    jc.set(q('val'), 'center')
    # نشانه‌گذاری برای فهرست
    bm_s = etree.Element(q('bookmarkStart'))
    bm_s.set(q('id'), '5001')
    bm_s.set(q('name'), '_TocChekideh')
    bm_e = etree.Element(q('bookmarkEnd'))
    bm_e.set(q('id'), '5001')
    ppr.addnext(bm_s)
    p.append(bm_e)
    for r in p.iter(q('r')):
        t = ''.join(x.text or '' for x in r.findall(q('t')))
        if not t.strip():
            continue
        rpr = rpr_of(r, create=True)
        set_fonts(rpr, TITR, TNR)
        set_sz(rpr, 56)
        if rpr.find(q('b')) is None:
            etree.SubElement(rpr, q('b'))
        if rpr.find(q('bCs')) is None:
            etree.SubElement(rpr, q('bCs'))


def insert_toc_chekideh(body):
    toc1 = [p for p in body.iter(q('p')) if style_of(p) == 'TOC1']
    if len(toc1) < 2:
        return False
    first, second = toc1[0], toc1[1]
    # عنوان اولین مدخل را به چکیده عوض کن، فصل اول را بعدش درج کن
    hl = first.find(q('hyperlink'))
    if hl is None:
        return False
    old_anchor = hl.get(q('anchor'))
    old_title = None
    old_page = None
    for r in hl.findall(q('r')):
        t = r.find(q('t'))
        if t is not None and t.text and 'فصل' in (t.text or ''):
            old_title = t.text
            t.text = 'چکیده'
        elif t is not None and t.text and t.text.strip().isdigit() and old_page is None:
            old_page = t.text
            t.text = '1'
    hl.set(q('anchor'), '_TocChekideh')
    for r in hl.iter(q('instrText')):
        if r.text and 'PAGEREF' in r.text:
            r.text = ' PAGEREF _TocChekideh \\h '
    # مدخل فصل اول
    neu = copy.deepcopy(second)
    nhl = neu.find(q('hyperlink'))
    if nhl is not None:
        nhl.set(q('anchor'), old_anchor or '_Toc238572002')
        set_title = False
        for r in nhl.findall(q('r')):
            t = r.find(q('t'))
            if t is not None and t.text and not t.text.strip().isdigit():
                if not set_title:
                    t.text = old_title or 'فصل اول: کلیات پژوهش'
                    set_title = True
                else:
                    t.text = ''
            elif t is not None and t.text and t.text.strip().isdigit():
                t.text = old_page or '1'
        for r in nhl.iter(q('instrText')):
            if r.text and 'PAGEREF' in r.text:
                r.text = ' PAGEREF %s \\h ' % (old_anchor or '_Toc238572002')
    first.addnext(neu)
    return True


def _next_body(paras, idx):
    for nxt in paras[idx + 1:idx + 10]:
        st = style_of(nxt) or ''
        if st.startswith('Heading') or st.startswith('TOC'):
            continue
        if ptext(nxt).strip():
            return nxt
    return None


def relocate_footnotes(body, rep):
    paras = [p for p in body.iter(q('p'))]
    for idx, p in enumerate(paras):
        fn_runs = [(r.find(q('footnoteReference')).get(q('id')), r)
                   for r in p.iter(q('r'))
                   if r.find(q('footnoteReference')) is not None]
        if not fn_runs:
            continue
        taken = []
        for fid, r in fn_runs:
            if r.getparent() is not None:
                r.getparent().remove(r)
            taken.append((fid, r))
        items = []
        plain = ptext(p)
        for fid, r in taken:
            needles = AFTER.get(fid, [])
            pos, used = -1, None
            for n in needles:
                hits = bounded_find(plain, n)
                if hits:
                    pos, used = hits[0].end(), n
                    break
                i = plain.find(n)
                if i >= 0:
                    pos, used = i + len(n), n
                    break
            items.append((pos, fid, used, r, needles))
        items.sort(key=lambda x: x[0], reverse=True)
        is_heading = bool(style_of(p) and str(style_of(p)).startswith('Heading'))
        for pos, fid, used, r, needles in items:
            ok = False
            if used and pos >= 0:
                ok = insert_run_after_phrase(p, used, r)
            if not ok:
                search = needles[:]
                if used and used not in search:
                    search.insert(0, used)
                window = paras[idx + 1:idx + 40] if is_heading else paras[idx + 1:idx + 8]
                for nxt in window:
                    npt = ptext(nxt)
                    for n in search:
                        if n and n in npt:
                            if insert_run_after_phrase(nxt, n, r):
                                ok = True
                                if is_heading:
                                    rep['fn_moved_off_heading'] += 1
                                break
                    if ok:
                        break
            if not ok and is_heading:
                nxt = _next_body(paras, idx)
                if nxt is not None:
                    nxt.append(r)
                    ok = True
                    rep['fn_moved_off_heading'] += 1
            if not ok:
                p.append(r)
                rep['fn_kept_end'] += 1
            else:
                rep['fn_moved'] += 1


def existing_english(fn_root):
    s = set()
    for f in fn_root.findall(q('footnote')):
        if f.get(q('type')):
            continue
        t = ''.join(x.text or '' for x in f.iter(q('t'))).strip().lower()
        s.add(t)
        for part in re.split(r'[,&/]| and ', t):
            s.add(part.strip().lower())
    return s


def _fn_immediately_after(p, phrase):
    pieces = []
    acc = 0
    for r in p.iter(q('r')):
        t = r.find(q('t'))
        txt = (t.text or '') if t is not None else ''
        pieces.append((acc, r, txt))
        acc += len(txt)
    plain = ''.join(x[2] for x in pieces)
    hits = bounded_find(plain, phrase)
    if hits:
        end = hits[0].end()
    else:
        i = plain.find(phrase)
        if i < 0:
            return False
        end = i + len(phrase)
    for start, r, txt in pieces:
        stop = start + len(txt)
        if stop <= end:
            if r.find(q('footnoteReference')) is not None and start >= end:
                return True
            continue
        leftover = txt[max(0, end - start):]
        if leftover.strip():
            return False
        if r.find(q('footnoteReference')) is not None:
            return True
    return False


def add_missing_footnotes(body, fn_root, rep):
    model = None
    max_id = 0
    for f in fn_root.findall(q('footnote')):
        i = f.get(q('id'))
        if i is None:
            continue
        try:
            max_id = max(max_id, int(i))
        except ValueError:
            pass
        if model is None and not f.get(q('type')):
            model = f
    paras = [p for p in body.iter(q('p'))]
    chek_i = 0
    for i, p in enumerate(paras):
        if ptext(p).strip() == 'چکیده':
            chek_i = i
            break
    added_en = set()
    for needles, english in NEW_FN:
        if english.lower() in added_en:
            continue
        for p in paras[chek_i + 1:]:
            st = style_of(p) or ''
            if st.startswith('TOC') or st.startswith('Heading'):
                continue
            plain = ptext(p)
            used = first_needle(plain, needles)
            if not used:
                continue
            if _fn_immediately_after(p, used):
                added_en.add(english.lower())
                break
            max_id += 1
            el = make_footnote_el(max_id, english, model)
            fn_root.append(el)
            run = make_fn_ref_run(max_id)
            if insert_run_after_phrase(p, used, run):
                added_en.add(english.lower())
                rep['fn_added'] += 1
                rep.setdefault('added_names', []).append((used, english))
            else:
                fn_root.remove(el)
                max_id -= 1
            break
        else:
            # فقط در عنوان آمده (TMT/DAS/HAI) → بند بعدی
            if english.lower() in added_en:
                continue
            for i, p in enumerate(paras):
                if i <= chek_i:
                    continue
                st = style_of(p) or ''
                if not st.startswith('Heading'):
                    continue
                if not first_needle(ptext(p), needles):
                    continue
                nxt = _next_body(paras, i)
                if nxt is None:
                    break
                max_id += 1
                el = make_footnote_el(max_id, english, model)
                fn_root.append(el)
                run = make_fn_ref_run(max_id)
                ok = False
                extra = {
                    'TMT': ['این نظریه', 'نظریه مدیریت وحشت'],
                    'DAS': ['این پرسشنامه', 'پرسشنامه اضطراب مرگ'],
                    'HAI': ['پرسشنامه اضطراب سلامتی', 'این ابزار'],
                }
                candidates = extra.get(needles[0], []) + list(needles)
                for n in candidates:
                    if n in ptext(nxt) and insert_run_after_phrase(nxt, n, run):
                        ok = True
                        break
                if not ok:
                    runs = text_runs(nxt)
                    if runs:
                        # بعد از نخستین واژهٔ بند
                        t = runs[0].find(q('t'))
                        txt = t.text or ''
                        sp = txt.find(' ')
                        if sp > 0:
                            split_run_at(runs[0], sp)
                        runs[0].addnext(run)
                        ok = True
                    else:
                        nxt.append(run)
                        ok = True
                if ok:
                    added_en.add(english.lower())
                    rep['fn_added'] += 1
                    rep.setdefault('added_names', []).append((needles[0] + '@heading', english))
                else:
                    fn_root.remove(el)
                    max_id -= 1
                break


def fix_lang_root(root):
    FA, EN = 'fa-IR', 'en-US'
    n = 0
    for tag in ('lang', 'themeFontLang'):
        for e in root.iter(q(tag)):
            v = e.get(q('bidi'))
            if v and v != FA:
                e.set(q('bidi'), FA); n += 1
            v = e.get(q('val'))
            if v and v != EN:
                e.set(q('val'), EN); n += 1
            v = e.get(q('eastAsia'))
            if v and v != EN:
                e.set(q('eastAsia'), EN); n += 1
    return n


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    rep = dict(h1_break=0, h2_break_removed=0, empty_after_h1=0,
               fn_moved=0, fn_kept_end=0, fn_moved_off_heading=0,
               fn_added=0, fn_fmt=0, toc=0, lang=0, empty_before_chekideh=0)
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    styles = etree.fromstring(parts['word/styles.xml'])

    # ۳) سرفصل
    chapter_pagebreaks(body, rep)

    # ۲) چکیده
    blocks = list(body)
    chek = None
    for i, p in enumerate(blocks):
        if p.tag == q('p') and ptext(p).strip() == 'چکیده':
            chek = p
            # خالی‌های قبل
            j = i - 1
            while j >= 0 and blocks[j].tag == q('p') and not ptext(blocks[j]).strip():
                body.remove(blocks[j])
                rep['empty_before_chekideh'] += 1
                j -= 1
            break
    if chek is not None:
        make_chekideh_heading(chek)
        if insert_toc_chekideh(body):
            rep['toc'] = 1

    # ۴) جابه‌جایی علامت‌ها
    relocate_footnotes(body, rep)

    # ۵) پانویس‌های غایب
    add_missing_footnotes(body, fn_root, rep)

    # ۱) قالب پانویس
    fix_footnote_styles(styles)
    rep['fn_fmt'] = format_footnotes(fn_root)

    # ۶) زبان
    for root in (doc, fn_root, styles):
        rep['lang'] += fix_lang_root(root)
    for name in list(parts):
        if name.endswith('.xml') and name.startswith('word/') and name not in (
                'word/document.xml', 'word/footnotes.xml', 'word/styles.xml'):
            if b'w:lang' not in parts[name] and b'themeFontLang' not in parts[name]:
                continue
            try:
                r = etree.fromstring(parts[name])
            except etree.XMLSyntaxError:
                continue
            n = fix_lang_root(r)
            if n:
                parts[name] = etree.tostring(
                    r, xml_declaration=True, encoding='UTF-8', standalone=True)
                rep['lang'] += n

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn_root, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/styles.xml'] = etree.tostring(
        styles, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return rep


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.2.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-Fatemeh-Bayat-v1.3.docx'
    rep = process(src, dst)
    print('نوشته شد:', dst)
    for k, v in rep.items():
        print(f'  {k}: {v}')
