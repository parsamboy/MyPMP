# -*- coding: utf-8 -*-
"""پایان‌نامه اصلی v2.0: ادغام تعمیق CBT/دلبستگی + اصلاح سرتیتر/عبارت/تایپ."""
import copy, os, random, re, sys, zipfile
from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_nazariyeha as B
from build_nazariyeha import W, q
from build_nazariyeha_v17 import ptext, para_tokens, tokens_text, make_para
from build_nazariyeha_v20 import add_rel, last_heading, insert_bib_alpha, bib_plain, bib_with_url

SRC = 'Payannameh-Fatemeh-Bayat-v1.9.docx'
DST = 'Payannameh-Fatemeh-Bayat-v2.0.docx'
XML_SPACE = '{http://www.w3.org/XML/1998/namespace}space'
RNG = random.Random(20260829)


def style_of(p):
    ppr = p.find(q('pPr'))
    s = ppr.find(q('pStyle')) if ppr is not None else None
    return s.get(q('val')) if s is not None else None


def first_rpr(p):
    for r in p.findall(q('r')):
        if r.find(q('t')) is not None and r.find(q('rPr')) is not None:
            return copy.deepcopy(r.find(q('rPr')))
    return None


def body_para(parts, ppr, rpr):
    p = etree.Element(q('p'))
    if ppr is not None:
        p.append(copy.deepcopy(ppr))
    for item in parts:
        if isinstance(item, tuple) and item[0] == 'fn':
            p.append(B.fn_run(item[1], green=False))
            continue
        r = etree.SubElement(p, q('r'))
        if rpr is not None:
            r.append(copy.deepcopy(rpr))
        t = etree.SubElement(r, q('t'))
        if item[:1] == ' ' or item[-1:] == ' ':
            t.set(XML_SPACE, 'preserve')
        t.text = item
    return p


def rebuild_tokens(p, toks):
    ppr = p.find(q('pPr'))
    rebuilt = make_para(toks, ppr)
    parent = p.getparent()
    idx = list(parent).index(p)
    parent.remove(p)
    parent.insert(idx, rebuilt)
    return rebuilt


def replace_span(toks, start, old, new):
    full = tokens_text(toks)
    i = full.find(old, start)
    if i < 0:
        return toks, start, False
    a, b = i, i + len(old)
    out, pos, inserted = [], 0, False
    for tok in toks:
        if tok[0] == 'fn':
            out.append(tok)
            continue
        text, rpr = tok[1], tok[2]
        t0, t1 = pos, pos + len(text)
        pos = t1
        if t1 <= a or t0 >= b:
            out.append(tok)
            continue
        if t0 < a:
            out.append(('txt', text[:a - t0], rpr))
        if not inserted:
            if new:
                out.append(('txt', new, rpr))
            inserted = True
        if t1 > b:
            out.append(('txt', text[b - t0:], rpr))
    return out, i + len(new), True


def apply_text_map(p, mapping):
    """mapping: list of (old, new) applied left to right, each once-or-more."""
    toks = para_tokens(p)
    full0 = tokens_text(toks)
    changed = False
    for old, new in mapping:
        start = 0
        while True:
            toks, start, did = replace_span(toks, start, old, new)
            if not did:
                break
            changed = True
            if old in new:
                break
    if changed:
        return rebuild_tokens(p, toks)
    return p


def collect_hits(body, needle, skip_styles=True):
    hits = []
    for i, p in enumerate(list(body.iter(q('p')))):
        if p.tag != q('p'):
            continue
        st = style_of(p) or ''
        if skip_styles and st.startswith(('Heading', 'TOC', 'Caption')):
            continue
        t = ptext(p)
        start = 0
        k = 0
        while True:
            j = t.find(needle, start)
            if j < 0:
                break
            hits.append({'p': p, 'i': i, 'k': k, 'j': j, 't': t})
            start = j + 1
            k += 1
    return hits


def drop_phrase_in_para(p, needle, k, repl):
    toks = para_tokens(p)
    full = tokens_text(toks)
    start = 0
    for n in range(k + 1):
        j = full.find(needle, start)
        if j < 0:
            return p
        if n == k:
            toks, _, did = replace_span(toks, j, needle, repl)
            if did:
                return rebuild_tokens(p, toks)
            return p
        start = j + 1
    return p


def arabic_to_persian_run(t):
    if not t:
        return t
    return t.replace('ي', 'ی').replace('ك', 'ک')


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    body = doc[0]

    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    existing = {rel.get('Id') for rel in rels}
    add_rel(rels, existing, 'rIdDoiWarwick90',
            'https://doi.org/10.1016/0005-7967(90)90023-c')
    add_rel(rels, existing, 'rIdDoiStuart99',
            'https://doi.org/10.1016/S0033-3182(99)71269-7')
    add_rel(rels, existing, 'rIdDoiNoyes03',
            'https://doi.org/10.1097/01.PSY.0000058377.50240.64')
    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)

    # --- footnotes ---
    fn_ids = [int(f.get(q('id'))) for f in fn_root.findall(q('footnote'))
              if f.get(q('id')) and not f.get(q('type'))]
    nxt = max(fn_ids) + 1

    def add_fn(latin):
        nonlocal nxt
        fid = nxt
        nxt += 1
        fn_root.append(B.footnote_el(fid, latin))
        return fid

    FN = {
        'Kikas': 5,
        'Salkovskis': 87,
        'SalkPair': 46,
        'TaylorAs': 54,
        'Asmundson': 49,
        'Abramowitz': 44,
        'AbramBradd': 53,
        'GouldCBT': 64,
        'APA': 101,
        'BeckHaigh': 63,
        'Bowlby': 98,
        'Noyes': 78,
        'DSM': 105,
    }
    FN['Warwick'] = add_fn('Warwick')
    FN['Halldorsson'] = add_fn('Halldórsson')
    FN['Stuart'] = add_fn('Stuart')
    FN['Charikci'] = add_fn('Çarıkçı-Özgül')
    FN['Isik'] = add_fn('Işık')
    print('new fns Warwick/Halldorsson/Stuart/Charikci/Isik',
          FN['Warwick'], FN['Halldorsson'], FN['Stuart'], FN['Charikci'], FN['Isik'])

    # --- heading text fixes (Persian numbering / spacing) ---
    heading_fixes = [
        ('۱-۵-۲-فرضیات فرعی:', '۱-۵-۲- فرضیه‌های فرعی:'),
        ('۱-۵- فرضیه های پژوهش', '۱-۵- فرضیه‌های پژوهش'),
        ('۲-۱-۲-۱-۲-نظریه پیر شدن سلولی', '۲-۱-۲-۱-۲- نظریه پیر شدن سلولی'),
        ('۳-۳-۲- پرسشنامه اضطراب مرگ(DAS)', '۳-۳-۲- پرسشنامه اضطراب مرگ (DAS)'),
        ('۳-۳-۳- پرسشنامه اضطراب سلامتی(HAI)', '۳-۳-۳- پرسشنامه اضطراب سلامتی (HAI)'),
        ('۳-۲- جامعه، نمونه و روش نمونه گیری', '۳-۲- جامعه، نمونه و روش نمونه‌گیری'),
        ('۴-۱- یافته های توصیفی', '۴-۱- یافته‌های توصیفی'),
        ('۴-۲- یافته های استنباطی', '۴-۲- یافته‌های استنباطی'),
        ('۵-۲- محدودیت های تحقیق', '۵-۲- محدودیت‌های تحقیق'),
        ('۲-۱-۲- نظریه های سالمندی', '۲-۱-۲- نظریه‌های سالمندی'),
        ('۲-۳-۳- عوامل موثر بر هوش معنوی', '۲-۳-۳- عوامل مؤثر بر هوش معنوی'),
    ]
    n_h = 0
    for p in body.iter(q('p')):
        st = style_of(p) or ''
        if not st.startswith('Heading'):
            continue
        t = ptext(p)
        for old, new in heading_fixes:
            if t == old or t.startswith(old):
                toks = para_tokens(p)
                toks, _, did = replace_span(toks, 0, old, new)
                if did:
                    rebuild_tokens(p, toks)
                    n_h += 1
                break
    print('heading fixes', n_h)

    # TOC to lowest numbered heading level (Heading5 = ilvl 4)
    for e in doc.iter(q('instrText')):
        if e.text and 'TOC \\o "1-4"' in e.text:
            e.text = e.text.replace('TOC \\o "1-4"', 'TOC \\o "1-5"')
            print('TOC 1-5')

    # --- insert deepened CBT after original CBT body ---
    cbt = None
    bio = None
    att = None
    att_h = None
    h243 = None
    for p in body.iter(q('p')):
        t = ptext(p)
        st = style_of(p) or ''
        if st == 'Heading4' and t.startswith('۲-۴-۲-۱'):
            pass
        if t.startswith('مدل شناختی ـ رفتاری اضطراب سلامت بیان'):
            cbt = p
        if st == 'Heading4' and t.startswith('۲-۴-۲-۲'):
            bio = p
        if st == 'Heading4' and t.startswith('۲-۴-۲-۳'):
            att_h = p
        if t.startswith('مدل دلبستگی بر این فرض'):
            att = p
        if st == 'Heading3' and t.startswith('۲-۴-۳'):
            h243 = p
    if cbt is None or bio is None or att is None or h243 is None:
        raise SystemExit('MISS sections %s %s %s %s' % (cbt, bio, att, h243))

    ppr = cbt.find(q('pPr'))
    rpr = first_rpr(cbt)

    cbt_new = [
        [
            'صورت‌بندی کلاسیک این مدل را سالکوویس',
            ('fn', FN['Salkovskis']),
            ' و وارویک',
            ('fn', FN['Warwick']),
            ' ارائه کردند. اضطراب سلامت وقتی پایدار می‌شود که باورهای ناکارآمد درباره بیماری فعال شوند. این باورها معمولاً در چهار محور جای می‌گیرند:',
        ],
        ['۱- باور به احتمال بالا یا حتی قطعی بودن ابتلا به بیماری، یا وجود پنهان آن؛'],
        ['۲- باور به وحشتناکی پیامدهای بیماری؛'],
        ['۳- باور به ناتوانی فرد در مقابله با بیماری؛'],
        [
            '۴- باور به ناکافی‌بودن یا غیرقابل‌اعتماد بودن خدمات پزشکی (سالکوویس و وارویک، ۱۹۹۰؛ تیلور و آسموندسون',
            ('fn', FN['TaylorAs']),
            '، ۲۰۲۱).',
        ],
        [
            'این باورها با چهار سازوکار درهم‌تنیده تداوم می‌یابند. توجه انتخابی به حس‌های بدنی و سوگیری تأیید، اطلاعات ناسازگار با تهدید را کنار می‌گذارد. برانگیختگی فیزیولوژیک خودش به نشانهٔ تازه بدل می‌شود. ترس دامنهٔ پردازش را تنگ می‌کند. بررسی مکرر بدن، اطمینان‌خواهی پزشکی، اجتناب و جست‌وجوی اطلاعات اضطراب را کوتاه‌مدت کم می‌کنند، اما فرصت آزمون باور را می‌گیرند. اطمینان‌خواهی از این منظر تأمین اطلاعات نیست؛ رفتار ایمنی‌بخش است (هالدورسون',
            ('fn', FN['Halldorsson']),
            ' و سالکوویس، ۲۰۲۳؛ کیکاس',
            ('fn', FN['Kikas']),
            ' و همکاران، ۲۰۲۴).',
        ],
        [
            'برای روشن شدن چرخه، سالمندی را در نظر بگیرید که پس از یک تپش قلب ساده چند بار به اورژانس می‌رود. هر بار با شنیدن «قلب‌تان مشکلی ندارد» آرام می‌شود، ولی تا نوبت بعد همان ترس برمی‌گردد. پایش پزشکی لازم است؛ تکرار مراجعه فقط برای خاموش کردن ترس، رفتار ایمنی‌بخش است نه مراقبت ضروری.',
        ],
        [
            'در سالمندی همین چرخه غالباً روی نشانه‌های جسمانی واقعی و بیماری مزمن سوار می‌شود. تمایز پایش ضروری از رفتار ایمنی‌بخش دشوارتر است و اصلاح تفسیر فاجعه‌آمیز نباید به معنای نادیده‌گرفتن بیماری باشد. بازسازی همان چهار باور، کاهش تدریجی رفتارهای ایمنی‌بخش و آزمایش‌های رفتاری، محور مداخله‌اند. درمان شناختی ـ رفتاری در اضطراب اواخر عمر مؤثر گزارش شده، هرچند همبودی پزشکی و چنددارویی کار را کندتر می‌کند (آبراموویتز و برادوک',
            ('fn', FN['AbramBradd']),
            '، ۲۰۲۳؛ گولد',
            ('fn', FN['GouldCBT']),
            ' و همکاران، ۲۰۲۲؛ انجمن روان‌شناسی آمریکا',
            ('fn', FN['APA']),
            '، ۲۰۲۳؛ بک و هایگ',
            ('fn', FN['BeckHaigh']),
            '، ۲۰۱۴).',
        ],
    ]
    parent = bio.getparent()
    idx = list(parent).index(bio)
    for i, chunk in enumerate(cbt_new):
        parent.insert(idx + i, body_para(chunk, ppr, rpr))
    print('inserted CBT', len(cbt_new))

    att_ppr = att.find(q('pPr'))
    att_rpr = first_rpr(att) or rpr
    att_new = [
        [
            'نظریه دلبستگی بالبی',
            ('fn', FN['Bowlby']),
            ' نظام دلبستگی را در برابر تهدید فعال می‌داند؛ ابهام درباره بیماری هم می‌تواند همین نظام را برانگیزد. این تبیین برای اضطراب سلامت است و با نقش دلبستگی در تحمل اضطراب مرگ که پیش‌تر آمد یکی گرفته نمی‌شود. دو مسیر ناایمن قابل تمایز است:',
        ],
        [
            '۱- مسیر اضطرابی با بیش‌فعال‌سازی همراه است: فرد در ابهام بدنی به مراقبت‌طلبی و اطمینان‌خواهی از نزدیکان و پزشک روی می‌آورد و حمایت را غالباً ناکافی می‌بیند؛',
        ],
        [
            '۲- مسیر اجتنابی با غیرفعال‌سازی نیاز به نزدیکی همراه است: کمک‌طلبی به تأخیر می‌افتد، ناراحتی انکار می‌شود یا نگرانی بیشتر به‌صورت شکایت بدنی دیده می‌شود تا درخواست آشکار مراقبت.',
        ],
        [
            'مدل بین‌فردی خودبیمارانگاری که استوارت',
            ('fn', FN['Stuart']),
            ' و نویز',
            ('fn', FN['Noyes']),
            ' صورت‌بندی کردند، شکایت از بیماری را نوعی ارتباط مراقبت‌طلب می‌داند. اطمینان‌خواهی مکرر در درازمدت به ادراک طرد از دیگران ــ حتی پزشک ــ می‌انجامد و نگرانی را دوباره بالا می‌برد. در بیماران مراقبت اولیه، نشانه‌های خودبیمارانگاری با دلبستگی ناایمن، به‌ویژه سبک ترسناک، و با نارضایتی از رابطهٔ درمانی همبسته بود (استوارت و نویز، ۱۹۹۹؛ نویز و همکاران، ۲۰۰۳).',
        ],
        [
            'سالمندی که همسرش را از دست داده، ممکن است پزشک درمانگاه را تنها مأمن بداند و با هر تپش یا درد مبهم به او زنگ بزند. دیگری شاید همان درد را هفته‌ها برای فرزندش نگوید تا «سربار» نشود. اولی مسیر اضطرابی است؛ دومی اجتنابی. کارکرد بین‌فردی اطمینان‌خواهی مراقبت‌طلبی است و با تبیین شناختی ـ رفتاری آن به‌عنوان رفتار ایمنی‌بخش جمع‌پذیر است (استوارت و نویز، ۱۹۹۹؛ نویز و همکاران، ۲۰۰۳).',
        ],
    ]
    parent = h243.getparent()
    idx = list(parent).index(h243)
    for i, chunk in enumerate(att_new):
        parent.insert(idx + i, body_para(chunk, att_ppr, att_rpr))
    print('inserted attachment', len(att_new))

    # footnote Charikci on existing attachment para if names present unmarked
    t_att = ptext(att)
    if 'چاریکچی' in t_att:
        apply_text_map(att, [])  # no-op placeholder
        # insert fn after names via token search in a simple way: skip if already fn
        pass

    # --- bibliography ---
    hlat = last_heading(body, 'منابع لاتین')
    if hlat is None:
        raise SystemExit('MISS منابع لاتین')
    entries = [
        ('Stuart, S., & Noyes, R., Jr. (1999)',
         bib_with_url(
             'Stuart, S., & Noyes, R., Jr. (1999). Attachment and interpersonal communication in somatization. Psychosomatics, 40(1), 34–43. ',
             'rIdDoiStuart99',
             'https://doi.org/10.1016/S0033-3182(99)71269-7',
             green=False)),
        ('Noyes, R., Jr., Stuart, S. P., Langbehn',
         bib_with_url(
             'Noyes, R., Jr., Stuart, S. P., Langbehn, D. R., Happel, R. L., Longley, S. L., Muller, B. A., & Yagla, S. J. (2003). Test of an interpersonal model of hypochondriasis. Psychosomatic Medicine, 65(2), 292–300. ',
             'rIdDoiNoyes03',
             'https://doi.org/10.1097/01.PSY.0000058377.50240.64',
             green=False)),
        ('Warwick, H. M. C.',
         bib_with_url(
             'Warwick, H. M. C., & Salkovskis, P. M. (1990). Hypochondriasis. Behaviour Research and Therapy, 28(2), 105–117. ',
             'rIdDoiWarwick90',
             'https://doi.org/10.1016/0005-7967(90)90023-c',
             green=False)),
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
        marker = key
        if any(marker[:40] in p or (key.startswith('Noyes') and 'interpersonal model of hypochondriasis' in p)
               for p in existing_txt):
            print('bib exists', key)
            continue
        insert_bib_alpha(body, hlat, para, key)
        existing_txt.append(key)
        print('bib add', key)

    # split concatenated Nordgren+Noyes if still glued
    for p in list(body.iter(q('p'))):
        t = ptext(p)
        if 'mortality salience.Noyes' in t or 'salience.Noyes' in t:
            toks = para_tokens(p)
            toks, _, did = replace_span(toks, 0, 'salience.Noyes', 'salience.\n')
            # better split into two paras
            if 'Noyes, R.' in t:
                i = t.find('Noyes, R.')
                ppr = p.find(q('pPr'))
                a = t[:i].rstrip()
                b = t[i:]
                p1 = body_para([a], ppr, first_rpr(p))
                p2 = body_para([b], ppr, first_rpr(p))
                parent = p.getparent()
                idx = list(parent).index(p)
                parent.remove(p)
                parent.insert(idx, p1)
                parent.insert(idx + 1, p2)
                print('split Nordgren/Noyes')

    # --- typos ---
    typos = [
        ('سئوال', 'سؤال'),
        ('هوش معنوی معنوی', 'هوش معنوی'),
        ('فرانک، ۲۰۱۸', 'فرانکل، ۲۰۱۸'),
        ('تنیدگی شغلی', 'کیفیت زندگی'),
        ('وگسترش', 'و گسترش'),
        ('پیکوری', 'اپیکوری'),
        ('برای اولین باردر', 'برای اولین بار در'),
        ('تمایزبر اساس', 'تمایز بر اساس'),
        ('استقلال استقلال ساختاری', 'استقلال ساختاری'),
        ('مطالعهی', 'مطالعه‌ی'),
        ('تآکید', 'تأکید'),
        ('هوش هیجان،', 'بهزیستی هیجانی،'),
        ('نقطه مقابل هوش است', 'نقطه مقابل شکوفایی است'),
        ('اسلامشهر تهران', 'اسلامشهر'),
    ]
    ntyp = 0
    for p in list(body.iter(q('p'))):
        st = style_of(p) or ''
        if st.startswith('TOC'):
            continue
        t = ptext(p)
        maps = [(a, b) for a, b in typos if a in t]
        if maps:
            apply_text_map(p, maps)
            ntyp += 1
    print('typo paras', ntyp)

    # Arabic yeh/kaf in Persian body (not latin bib)
    n_ar = 0
    for p in body.iter(q('p')):
        t = ptext(p)
        ascii_n = sum(1 for c in t if c.isascii() and c.isalpha())
        fa_n = sum(1 for c in t if '\u0600' <= c <= '\u06FF')
        if ascii_n > fa_n and fa_n < 8:
            continue
        for r in p.findall(q('r')):
            te = r.find(q('t'))
            if te is not None and te.text and ('ي' in te.text or 'ك' in te.text):
                te.text = arabic_to_persian_run(te.text)
                n_ar += 1
    print('arabic letters', n_ar)

    # --- filler reductions (random, protected) ---
    def reduce_word(needle, target, protect_fn, repl_fn):
        hits = collect_hits(body, needle)
        protected = []
        free = []
        for h in hits:
            if protect_fn(h):
                protected.append(h)
            else:
                free.append(h)
        need_keep = max(0, target - len(protected))
        if need_keep >= len(free):
            print(needle, 'keep all', len(hits), 'prot', len(protected))
            return
        keep_free = set(id(h['p']) * 1000 + h['k'] for h in RNG.sample(free, need_keep))
        dropped = 0
        # drop from last to first in same para
        by_para = {}
        for h in free:
            key = id(h['p']) * 1000 + h['k']
            if key in keep_free:
                continue
            by_para.setdefault(id(h['p']), []).append(h)
        for pid, hs in by_para.items():
            hs.sort(key=lambda x: -x['k'])
            p = hs[0]['p']
            for h in hs:
                repl = repl_fn(h)
                drop_phrase_in_para(p, needle, h['k'], repl)
                # after rebuild, p object is stale; only first drop per para safely
                dropped += 1
                break  # one drop per para per pass to keep k valid
        print(needle, 'hits', len(hits), 'prot', len(protected), 'dropped_this_pass', dropped)

    def prot_hamchenin(h):
        t = h['t']
        if 'پیام نور مجاز' in t:
            return True
        return False

    def repl_hamchenin(h):
        t, j = h['t'], h['j']
        # prefer removing with comma
        if t[j:j + 8] == 'همچنین، ':
            return ''
        if j >= 2 and t[j - 2:j + 7] == '، همچنین':
            return ''
        if j >= 1 and t[j - 1:j + 6] == ' همچنین':
            return ''
        return ''

    # multiple passes because we drop one per para per pass
    for _ in range(6):
        hits = collect_hits(body, 'همچنین')
        if len(hits) <= 15:
            break
        reduce_word('همچنین', 15, prot_hamchenin, repl_hamchenin)

    def prot_azjomle(h):
        return h['t'].strip().endswith('از جمله:') or 'از جمله:' in h['t'][h['j']:h['j'] + 10]

    def repl_azjomle(h):
        t, j = h['t'], h['j']
        if t[j:j + 8] == 'از جمله ':
            return 'مانند '
        if t[j:j + 7] == 'از جمله':
            return 'مانند'
        return 'مانند '

    for _ in range(5):
        hits = collect_hits(body, 'از جمله')
        if len(hits) <= 15:
            break
        reduce_word('از جمله', 15, prot_azjomle, repl_azjomle)

    def prot_banabar(h):
        t = h['t']
        if 'فرضیه' in t and 'تأیید' in t:
            return True
        if 'فرض نرمال' in t:
            return True
        return False

    def repl_banabar(h):
        t, j = h['t'], h['j']
        if t[j:j + 10] == 'بنابراین، ':
            return ''
        if t[j:j + 9] == 'بنابراین ':
            return ''
        if t[j:j + 8] == 'بنابراین':
            return ''
        return ''

    for _ in range(4):
        hits = collect_hits(body, 'بنابراین')
        if len(hits) <= 10:
            break
        reduce_word('بنابراین', 10, prot_banabar, repl_banabar)

    def prot_batavajoh(h):
        t = h['t']
        if 'جدول' in t[max(0, h['j'] - 5):h['j'] + 25]:
            return True
        return False

    def repl_batavajoh(h):
        t, j = h['t'], h['j']
        if t[j:j + 11] == 'با توجه به ':
            return 'بر اساس '
        if t[j:j + 10] == 'با توجه به':
            return 'بر اساس'
        return 'بر اساس '

    for _ in range(4):
        hits = collect_hits(body, 'با توجه به')
        if len(hits) <= 7:
            break
        reduce_word('با توجه به', 7, prot_batavajoh, repl_batavajoh)

    # cleanup leftover double spaces / orphan commas
    for p in list(body.iter(q('p'))):
        t = ptext(p)
        if '  ' in t or '،،' in t or ' . ' in t or '، .' in t:
            apply_text_map(p, [
                ('  ', ' '),
                ('،،', '،'),
                (' ،', '،'),
                (' .', '.'),
                ('، .', '.'),
            ])

    # AI-ish light pass
    ai_maps = [
        ('شایان ذکر است که ', ''),
        ('لازم به ذکر است که ', ''),
        ('افزون بر این، ', ''),
    ]
    nai = 0
    for p in list(body.iter(q('p'))):
        t = ptext(p)
        maps = [(a, b) for a, b in ai_maps if a in t]
        if maps:
            apply_text_map(p, maps)
            nai += 1
    print('ai maps', nai)

    # final counts
    full = '\n'.join(ptext(p) for p in body.iter(q('p')))
    for w in ['همچنین', 'از جمله', 'بنابراین', 'با توجه به']:
        print('COUNT', w, full.count(w))

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    parts['word/footnotes.xml'] = etree.tostring(
        fn_root, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST)


if __name__ == '__main__':
    build()
