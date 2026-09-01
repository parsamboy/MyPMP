# -*- coding: utf-8 -*-
"""
پاک‌سازی ردپای ابزار و نشانه‌های تولید ماشینی از سند.

آنچه حذف/پاک می‌شود:

۱) پارامتر ردیابی «?utm_source=chatgpt.com» از انتهای نشانی منابع
   — آشکارترین ردپا؛ در ۶ مدخل فهرست منابع بود.
   (هر utm_* دیگری هم پاک می‌شود؛ خودِ نشانی سالم می‌ماند.)

۲) نشانه‌های ویرایش ماشینی/سابقهٔ نشست:
   • rsid ها  (شناسهٔ یکتای هر نشست ویرایش ورد)
   • proofErr (برچسب غلط‌یاب؛ ۳۸۸۲ مورد، حجم بی‌مورد)
   • bookmark های موقتِ _Hlk (نشانک‌های خودکار ورد)
   • _GoBack (آخرین محل مکان‌نما)

۳) تغییرات ثبت‌شده و کامنت: ins/del/moveFrom/moveTo/comment
   (اگر باشند؛ در این سند نبودند ولی برای اطمینان بررسی می‌شود.)

۴) متادیتای شخصی: lastModifiedBy، TotalTime، Template، Company
   و برچسب نسخهٔ داخلی. عنوان و نام نویسنده حفظ می‌شود.

آنچه دست نمی‌خورد: نشانک‌های _Toc (فهرست خودکار به آن‌ها وابسته است)،
Application=Microsoft Office Word (سند واقعاً با ورد ساخته شده و
حذفش خودش غیرعادی است).
"""
import re, sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

# پارامترهای ردیابی که باید از نشانی‌ها پاک شوند
UTM = re.compile(r'[?&]utm_[a-z_]+=[^"\s<&)]*', re.I)
# ویژگی‌های rsid روی هر عنصر
RSID_ATTRS = ('rsid', 'rsidR', 'rsidRPr', 'rsidRDefault', 'rsidP',
              'rsidTr', 'rsidDel', 'rsidSect', 'rsidRoot')
# نشانک‌های موقت ورد
TEMP_BM = re.compile(r'^(_Hlk\d+|_GoBack|OLE_LINK\d*|_Ref\d+)$')
# عناصر بازبینی
REVISION = ('ins', 'del', 'moveFrom', 'moveTo',
            'commentRangeStart', 'commentRangeEnd', 'commentReference')


def strip_utm(root):
    n = 0
    for t in root.iter(q('t'), q('instrText')):
        if t.text and 'utm_' in t.text:
            new = UTM.sub('', t.text)
            if new != t.text:
                t.text = new; n += 1
    return n


def strip_rsid(root):
    """هم ویژگی‌های rsid و هم عنصرهای <w:rsid> را برمی‌دارد.

    نکته: در styles.xml هر سبک یک فرزند <w:rsid w:val="..."/> دارد
    که ویژگی نیست و با پاک‌کردن attribute گرفته نمی‌شود.
    """
    n = 0
    for e in root.iter():
        for a in RSID_ATTRS:
            if e.get(q(a)) is not None:
                del e.attrib[q(a)]; n += 1
    for e in list(root.iter(q('rsid'))):
        p = e.getparent()
        if p is not None:
            p.remove(e); n += 1
    return n


def strip_proof(root):
    els = list(root.iter(q('proofErr')))
    for e in els:
        p = e.getparent()
        if p is not None:
            p.remove(e)
    return len(els)


def strip_bookmarks(root):
    """نشانک‌های موقت را برمی‌دارد؛ _Toc دست‌نخورده می‌ماند."""
    kill = set()
    n = 0
    for b in list(root.iter(q('bookmarkStart'))):
        nm = b.get(q('name')) or ''
        if TEMP_BM.match(nm):
            kill.add(b.get(q('id')))
            b.getparent().remove(b); n += 1
    for b in list(root.iter(q('bookmarkEnd'))):
        if b.get(q('id')) in kill:
            b.getparent().remove(b)
    return n


def strip_revisions(root):
    """محتوای ins را نگه می‌دارد، del را حذف می‌کند."""
    n = 0
    for tag in REVISION:
        for e in list(root.iter(q(tag))):
            p = e.getparent()
            if p is None:
                continue
            if tag in ('ins', 'moveTo'):
                idx = list(p).index(e)
                for child in reversed(list(e)):
                    p.insert(idx, child)
            p.remove(e); n += 1
    return n


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()
    rep = dict(utm=0, rsid=0, proof=0, bookmark=0, revision=0)

    for name in list(parts):
        if not name.endswith('.xml') or name.startswith('docProps'):
            continue
        try:
            root = etree.fromstring(parts[name])
        except Exception:
            continue
        rep['utm']      += strip_utm(root)
        rep['proof']    += strip_proof(root)
        rep['bookmark'] += strip_bookmarks(root)
        rep['revision'] += strip_revisions(root)
        rep['rsid']     += strip_rsid(root)
        parts[name] = etree.tostring(
            root, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- settings: بلوک rsids و مقادیر شخصی ----
    st = etree.fromstring(parts['word/settings.xml'])
    for tag in ('rsids', 'proofState', 'attachedTemplate',
                'documentProtection', 'writeProtection'):
        for e in st.findall(q(tag)):
            st.remove(e)
    parts['word/settings.xml'] = etree.tostring(
        st, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- docProps/core: حذف اثر شخصی ----
    CP = '{http://schemas.openxmlformats.org/package/2006/metadata/core-properties}'
    cp = etree.fromstring(parts['docProps/core.xml'])
    for tag in ('lastModifiedBy', 'revision', 'category',
                'lastPrinted', 'contentStatus', 'keywords', 'description'):
        for e in cp.findall(CP + tag):
            cp.remove(e)
    parts['docProps/core.xml'] = etree.tostring(
        cp, xml_declaration=True, encoding='UTF-8', standalone=True)

    # ---- docProps/app: زمان ویرایش و قالب ----
    ap = etree.fromstring(parts['docProps/app.xml'])
    EP = '{http://schemas.openxmlformats.org/officeDocument/2006/extended-properties}'
    for tag in ('TotalTime', 'Template', 'Company', 'Manager'):
        for e in ap.findall(EP + tag):
            ap.remove(e)
    parts['docProps/app.xml'] = etree.tostring(
        ap, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return rep


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-Fatemeh-Bayat-v1.0.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    for k, v in process(src, dst).items():
        print(f'  {k}: {v}')
