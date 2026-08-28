# -*- coding: utf-8 -*-
"""v1.10 جدا: تعمیق علمی ۲-۴-۲-۱ مدل شناختی-رفتاری (سبز)."""
import copy, os, sys, zipfile
from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_nazariyeha as B
from build_nazariyeha import W, q
from build_nazariyeha_v17 import ptext, find_para

SRC = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.9.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.10.docx'
GREEN = '1B7A3D'
REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'


def green_body_para(parts, ppr_template):
    p = etree.Element(q('p'))
    if ppr_template is not None:
        p.append(copy.deepcopy(ppr_template))
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
    for item in parts:
        if isinstance(item, tuple) and item[0] == 'fn':
            p.append(B.fn_run(item[1], green=True))
        else:
            p.append(B.run(item, rtl=True, green=True))
    return p


def add_rel(rels, existing, rid, target):
    if rid in existing:
        return
    rel = etree.SubElement(rels, '{%s}Relationship' % REL_NS)
    rel.set('Id', rid)
    rel.set('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink')
    rel.set('Target', target)
    rel.set('TargetMode', 'External')
    existing.add(rid)


def last_heading(body, title):
    found = None
    for p in body.iter(q('p')):
        if ptext(p).strip() == title:
            found = p
    return found


def insert_bib_alpha(body, heading, new_p, sort_key):
    parent = heading.getparent()
    kids = list(parent)
    start = kids.index(heading) + 1
    insert_at = None
    for i in range(start, len(kids)):
        el = kids[i]
        if el.tag != q('p'):
            insert_at = i
            break
        t = ptext(el).strip()
        if not t:
            continue
        if t.lower() > sort_key.lower():
            insert_at = i
            break
    if insert_at is None:
        insert_at = len(kids)
    parent.insert(insert_at, new_p)


def bib_plain(text, green=True):
    return B.bib_para([text], green=green)


def bib_with_url(before, rid, url, green=True):
    return B.bib_para([before, ('url', rid, url)], green=green)


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    body = doc[0]

    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    existing = {rel.get('Id') for rel in rels}
    add_rel(rels, existing, 'rIdDoiWarwick90',
            'https://doi.org/10.1016/0005-7967(90)90023-c')
    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)

    cbt = None
    review = None
    for p in body.iter(q('p')):
        t = ptext(p)
        if t.startswith('مدل شناختی ـ رفتاری اضطراب سلامت بیان'):
            cbt = p
        if t.startswith('مرورهای اخیر همچنان درمان شناختی'):
            review = p
    if cbt is None:
        raise SystemExit('MISS CBT body')
    if review is None:
        raise SystemExit('MISS CBT review')

    ppr = cbt.find(q('pPr'))
    FN = {
        'Salkovskis': 131,
        'Warwick': 132,
        'Taylor': 78,
        'Asmundson': 79,
        'Halldorsson': 133,
        'Salkovskis2': 134,
        'Kikas': 139,
        'Abramowitz': 76,
        'Braddock': 116,
        'Gould': 90,
        'APA': 88,
        'Beck': 89,
        'Haigh': 146,
    }

    new_paras = []

    new_paras.append(green_body_para([
        'صورت‌بندی کلاسیک این مدل را سالکوویس',
        ('fn', FN['Salkovskis']),
        ' و وارویک',
        ('fn', FN['Warwick']),
        ' ارائه کردند و منابع درمانی بعدی آن را بسط دادند. بر این اساس، اضطراب سلامت وقتی پایدار می‌شود که باورهای ناکارآمد درباره بیماری فعال شوند. این باورها معمولاً در چهار محور جای می‌گیرند:',
    ], ppr))

    new_paras.append(green_body_para([
        '۱- باور به احتمال بالا یا حتی قطعی بودن ابتلا به بیماری، یا وجود پنهان آن؛',
    ], ppr))
    new_paras.append(green_body_para([
        '۲- باور به وحشتناکی پیامدهای بیماری؛',
    ], ppr))
    new_paras.append(green_body_para([
        '۳- باور به ناتوانی فرد در مقابله با بیماری؛',
    ], ppr))
    new_paras.append(green_body_para([
        '۴- باور به ناکافی‌بودن یا غیرقابل‌اعتماد بودن خدمات پزشکی (سالکوویس و وارویک، ۱۹۹۰؛ تیلور',
        ('fn', FN['Taylor']),
        ' و آسموندسون',
        ('fn', FN['Asmundson']),
        '، ۲۰۲۱).',
    ], ppr))

    new_paras.append(green_body_para([
        'این باورها با چهار سازوکار درهم‌تنیده تداوم می‌یابند. در سطح شناختی، توجه انتخابی به حس‌های بدنی و سوگیری تأیید، اطلاعات ناسازگار با تهدید را کنار می‌گذارد. در سطح فیزیولوژیک، برانگیختگی خود به نشانه‌های تازه‌ای بدل می‌شود که دوباره تفسیر فاجعه‌آمیز می‌شوند. در سطح هیجانی، ترس و نگرانی دامنه پردازش را تنگ می‌کند. در سطح رفتاری، بررسی مکرر بدن، اطمینان‌خواهی پزشکی، اجتناب و جست‌وجوی اطلاعات، اضطراب را کوتاه‌مدت کاهش می‌دهند اما فرصت آزمون باور را می‌گیرند. اطمینان‌خواهی از این منظر تأمین اطلاعات نیست، بلکه رفتار ایمنی‌بخش است و به همین دلیل چرخه را پایدار می‌کند (هالدورسون',
        ('fn', FN['Halldorsson']),
        ' و سالکووسکیس',
        ('fn', FN['Salkovskis2']),
        '، ۲۰۲۳؛ کیکاس',
        ('fn', FN['Kikas']),
        ' و همکاران، ۲۰۲۴؛ تیلور و آسموندسون، ۲۰۲۱).',
    ], ppr))

    new_paras.append(green_body_para([
        'در سالمندی همین چرخه غالباً بر بستر نشانه‌های جسمانی واقعی، بیماری مزمن و مراجعات پزشکی مکرر عمل می‌کند؛ بنابراین تمایز میان پایش ضروری پزشکی و رفتار ایمنی‌بخش دشوارتر است و اصلاح تفسیر فاجعه‌آمیز نباید به معنای نادیده‌گرفتن بیماری واقعی باشد. مؤلفه‌های اصلی مداخله عبارت‌اند از شناسایی و بازسازی همان چهار باور، کاهش تدریجی رفتارهای ایمنی‌بخش، و آزمایش‌های رفتاری برای آزمون پیش‌بینی‌های تهدیدآمیز. شواهد نشان می‌دهد درمان شناختی ـ رفتاری در کاهش اضطراب اواخر عمر مؤثر است، هرچند همبودی پزشکی، چنددارویی و کاهش ذخیره شناختی ممکن است نیازمند ساده‌سازی تکالیف و هماهنگی با مراقبت جسمانی باشد (آبراموویتز',
        ('fn', FN['Abramowitz']),
        ' و برادوک',
        ('fn', FN['Braddock']),
        '، ۲۰۲۳؛ گولد',
        ('fn', FN['Gould']),
        ' و همکاران، ۲۰۲۲؛ انجمن روان‌شناسی آمریکا',
        ('fn', FN['APA']),
        '، ۲۰۲۳؛ بک',
        ('fn', FN['Beck']),
        ' و هایگ',
        ('fn', FN['Haigh']),
        '، ۲۰۱۴).',
    ], ppr))

    parent = review.getparent()
    idx = list(parent).index(review)
    for i, np in enumerate(new_paras):
        parent.insert(idx + i, np)
    print('inserted', len(new_paras), 'green CBT paras')

    # bibliography in the final Latin section only
    hlat = last_heading(body, 'منابع لاتین')
    if hlat is None:
        raise SystemExit('MISS منابع لاتین')

    entries = [
        ('Abramowitz, J. S.',
         bib_plain('Abramowitz, J. S., & Braddock, A. E. (2023). Psychological Treatment of Health Anxiety and Illness Anxiety Disorder. Guilford Press.')),
        ('American Psychiatric Association (2022)',
         bib_plain('American Psychiatric Association (2022). Diagnostic and Statistical Manual of Mental Disorders (5th ed., Text Revision; DSM-5-TR). Washington, DC: American Psychiatric Association.')),
        ('American Psychological Association. (2023)',
         bib_plain('American Psychological Association. (2023). Clinical Practice Guideline for the Treatment of Depression and Anxiety in Older Adults.')),
        ('Beck, J. S.',
         bib_plain('Beck, J. S., & Haigh, E. A. P. (2014). Advances in Cognitive Theory and Therapy: The Generic Cognitive Model. Annual Review of Clinical Psychology, 10, 1–24.')),
        ('Gould, R. L.',
         bib_plain('Gould, R. L., et al. (2022). Cognitive behavioural therapy for depression and anxiety in older people: A systematic review and meta-analysis. Age and Ageing.')),
        ('Halldórsson, B',
         bib_with_url(
             'Halldórsson, B; & Salkovskis, P. M. (2023). Reassurance and its alternatives: Overview and cognitive behavioural conceptualisation. Journal of Obsessive-Compulsive and Related Disorders, 36, 100783. ',
             'rIdU104',
             'https://doi.org/10.1016/j.jocrd.2023.100783')),
        ('Kikas, K',
         bib_with_url(
             'Kikas, K; Werner-Seidler, A; Upton, E., & Newby, J. M. (2024). Illness anxiety disorder: A review of the current research and future directions. Current Psychiatry Reports, 26(7), 331–339. ',
             'rId12',
             'https://doi.org/10.1007/s11920-024-01507-2')),
        ('Taylor, S',
         bib_plain('Taylor, S; & Asmundson, G. J. G. (2021). Treating Health Anxiety: A Cognitive-Behavioral Approach. Guilford Press.')),
        ('Warwick, H. M. C.',
         bib_with_url(
             'Warwick, H. M. C., & Salkovskis, P. M. (1990). Hypochondriasis. Behaviour Research and Therapy, 28(2), 105–117. ',
             'rIdDoiWarwick90',
             'https://doi.org/10.1016/0005-7967(90)90023-c')),
    ]

    # skip if already present in the final section
    parent = hlat.getparent()
    kids = list(parent)
    start = kids.index(hlat) + 1
    existing_txt = []
    for el in kids[start:]:
        if el.tag != q('p'):
            break
        existing_txt.append(ptext(el))

    for key, para in entries:
        if any(p.startswith(key.split(',')[0]) and key[:12] in p for p in existing_txt):
            print('bib exists', key)
            continue
        insert_bib_alpha(body, hlat, para, key)
        print('bib add', key)

    parts['word/document.xml'] = etree.tostring(
        doc, xml_declaration=True, encoding='UTF-8', standalone=True)
    with zipfile.ZipFile(DST, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    print('نوشته شد:', DST)


if __name__ == '__main__':
    build()
