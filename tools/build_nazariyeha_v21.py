# -*- coding: utf-8 -*-
"""v1.11 جدا: تعمیق علمی ۲-۴-۲-۳ مدل دلبستگی (سبز) بدون تکرار CBT و اضطراب مرگ."""
import os, sys, zipfile
from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_nazariyeha as B
from build_nazariyeha import W, q
from build_nazariyeha_v17 import ptext
from build_nazariyeha_v20 import (
    green_body_para, add_rel, last_heading, insert_bib_alpha,
    bib_plain, bib_with_url,
)

SRC = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.10.docx'
DST = 'Payannameh-Fatemeh-Bayat-Nazariyeha-v1.11.docx'


def build():
    zin = zipfile.ZipFile(SRC)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    doc = etree.fromstring(parts['word/document.xml'])
    fn_root = etree.fromstring(parts['word/footnotes.xml'])
    body = doc[0]

    rels = etree.fromstring(parts['word/_rels/document.xml.rels'])
    existing = {rel.get('Id') for rel in rels}
    add_rel(rels, existing, 'rIdDoiStuart99',
            'https://doi.org/10.1016/S0033-3182(99)71269-7')
    add_rel(rels, existing, 'rIdDoiNoyes03',
            'https://doi.org/10.1097/01.PSY.0000058377.50240.64')
    parts['word/_rels/document.xml.rels'] = etree.tostring(
        rels, xml_declaration=True, encoding='UTF-8', standalone=True)

    fn_ids = [int(f.get(q('id'))) for f in fn_root.findall(q('footnote'))
              if f.get(q('id')) and not f.get(q('type'))]
    fid_stuart = max(fn_ids) + 1
    fn_root.append(B.footnote_el(fid_stuart, 'Stuart'))
    print('new fn Stuart', fid_stuart)

    aging = None
    nxt = None
    seen_aging = False
    for p in body.iter(q('p')):
        t = ptext(p)
        if t.startswith('از منظر سالمندی، دلبستگی ناایمن'):
            aging = p
            seen_aging = True
            continue
        if seen_aging and t.startswith('۲-۴-۳-'):
            nxt = p
            break
    if aging is None:
        raise SystemExit('MISS attachment aging para')
    if nxt is None:
        raise SystemExit('MISS 2-4-3')

    ppr = aging.find(q('pPr'))
    FN = {
        'Bowlby': 47,
        'Stuart': fid_stuart,
        'Noyes': 104,
    }

    new_paras = []
    new_paras.append(green_body_para([
        'نظریه دلبستگی بالبی',
        ('fn', FN['Bowlby']),
        ' نظام دلبستگی را در برابر تهدید فعال می‌داند؛ ابهام درباره بیماری و تهدید بدنی نیز می‌تواند همین نظام را برانگیزد. این تبیین برای اضطراب سلامت است و با نقش دلبستگی در تحمل اضطراب مرگ که پیش‌تر آمده یکی گرفته نمی‌شود. دست‌کم دو مسیر ناایمن قابل تمایز است:',
    ], ppr))
    new_paras.append(green_body_para([
        '۱- مسیر اضطرابی با بیش‌فعال‌سازی نظام دلبستگی همراه است: فرد در ابهام بدنی به مراقبت‌طلبی و اطمینان‌خواهی از نزدیکان و پزشک روی می‌آورد و حمایت را غالباً ناکافی ادراک می‌کند؛',
    ], ppr))
    new_paras.append(green_body_para([
        '۲- مسیر اجتنابی با غیرفعال‌سازی نیاز به نزدیکی همراه است: فرد ممکن است کمک‌طلبی را به تأخیر بیندازد، ناراحتی را انکار کند یا نگرانی سلامت را بیشتر به‌صورت شکایت بدنی نشان دهد تا درخواست آشکار مراقبت.',
    ], ppr))
    new_paras.append(green_body_para([
        'مدل بین‌فردی خودبیمارانگاری که استوارت',
        ('fn', FN['Stuart']),
        ' و نویز',
        ('fn', FN['Noyes']),
        ' صورت‌بندی کردند، شکایت از بیماری را نوعی ارتباط مراقبت‌طلب می‌داند که از دلبستگی ناایمن برمی‌خیزد. در این چرخه، اطمینان‌خواهی مکرر در درازمدت به ادراک طرد یا بیگانگی از دیگران ــ از جمله پزشک ــ می‌انجامد و نگرانی را دوباره افزایش می‌دهد. آزمون مدل در بیماران مراقبت اولیه نشان داد نشانه‌های خودبیمارانگاری با سبک‌های دلبستگی ناایمن، به‌ویژه سبک ترسناک، و با مشکلات بین‌فردی و نارضایتی از رابطهٔ درمانی همبسته است (استوارت و نویز، ۱۹۹۹؛ نویز و همکاران، ۲۰۰۳).',
    ], ppr))
    new_paras.append(green_body_para([
        'در سالمندی، با کاهش برخی چهره‌های دلبستگی نزدیک، رابطه با پزشک و نظام درمان می‌تواند بار دلبستگی بیشتری پیدا کند. مسیر اضطرابی بیشتر به مراجعات پیاپی و جابه‌جایی پزشک می‌انجامد؛ مسیر اجتنابی بیشتر به تأخیر در مراجعه یا کم‌گویی نیاز. کارکرد بین‌فردی اطمینان‌خواهی در این مدل مراقبت‌طلبی است و با تبیین شناختی ـ رفتاری آن به‌عنوان رفتار ایمنی‌بخش جمع‌پذیر است: یکی انگیزهٔ رابطه‌ای را روشن می‌کند و دیگری تداوم شناختی نگرانی را (استوارت',
        ('fn', FN['Stuart']),
        ' و نویز',
        ('fn', FN['Noyes']),
        '، ۱۹۹۹؛ نویز و همکاران، ۲۰۰۳).',
    ], ppr))

    parent = nxt.getparent()
    idx = list(parent).index(nxt)
    for i, np in enumerate(new_paras):
        parent.insert(idx + i, np)
    print('inserted', len(new_paras), 'green attachment paras')

    hlat = last_heading(body, 'منابع لاتین')
    if hlat is None:
        raise SystemExit('MISS منابع لاتین')

    entries = [
        ('Çarıkçı-Özgül, D. N',
         bib_with_url(
             'Çarıkçı-Özgül, D. N; & Işık, Ü. (2024). Exploring adult attachment and anxiety: The role of intolerance of uncertainty and social support. Current Psychology, 43, 18612–18620. ',
             'rIdU116',
             'https://doi.org/10.1007/s12144-024-05659-5')),
        ('Noyes, R., Jr., Stuart, S., Longley',
         bib_with_url(
             'Noyes, R., Jr., Stuart, S., Longley, S. L., Langbehn, D. R., & Happel, R. L. (2002). Hypochondriasis and fear of death. Journal of Nervous and Mental Disease, 190(8), 503–509. ',
             'rIdU117',
             'https://doi.org/10.1097/00005053-200208000-00002')),
        ('Noyes, R., Jr., Stuart, S. P., Langbehn',
         bib_with_url(
             'Noyes, R., Jr., Stuart, S. P., Langbehn, D. R., Happel, R. L., Longley, S. L., Muller, B. A., & Yagla, S. J. (2003). Test of an interpersonal model of hypochondriasis. Psychosomatic Medicine, 65(2), 292–300. ',
             'rIdDoiNoyes03',
             'https://doi.org/10.1097/01.PSY.0000058377.50240.64')),
        ('Stuart, S., & Noyes, R., Jr. (1999)',
         bib_with_url(
             'Stuart, S., & Noyes, R., Jr. (1999). Attachment and interpersonal communication in somatization. Psychosomatics, 40(1), 34–43. ',
             'rIdDoiStuart99',
             'https://doi.org/10.1016/S0033-3182(99)71269-7')),
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
        if any(key[:20] in p for p in existing_txt):
            print('bib exists', key)
            continue
        insert_bib_alpha(body, hlat, para, key)
        print('bib add', key)

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
