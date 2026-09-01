# -*- coding: utf-8 -*-
"""
جداکنندهٔ پانویس: خط پررنگ سراسری (مطابق شیوه‌نامهٔ پیام‌نور).

ورد به‌طور پیش‌فرض یک خط نازک کوتاه (حدود یک‌سوم عرض) می‌کشد که با
عنصر <w:separator/> تولید می‌شود و عرض/ضخامتش قابل تنظیم نیست.
راه استاندارد: عنصر separator را حذف و به‌جایش یک پاراگراف با
کادر پایینی (pBdr/bottom) بگذاریم که کل عرض متن را می‌گیرد و
ضخامتش با @sz کنترل می‌شود.

  sz=12  → ۱٫۵ پوینت (پررنگ، مطابق «زیر یک خط پر رنگ»)
"""
import sys, zipfile
from lxml import etree

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
W  = '{%s}' % NS
def q(t): return W + t

RULE_SZ = '12'          # ضخامت خط بر حسب یک‌هشتم پوینت → ۱٫۵pt


def make_rule_p(keep_sep_elem=None):
    """پاراگرافی با خط زیرین سراسری."""
    p = etree.Element(q('p'))
    ppr = etree.SubElement(p, q('pPr'))
    etree.SubElement(ppr, q('bidi'))
    sp = etree.SubElement(ppr, q('spacing'))
    sp.set(q('before'), '0'); sp.set(q('after'), '0')
    sp.set(q('line'), '240'); sp.set(q('lineRule'), 'auto')

    bdr = etree.SubElement(ppr, q('pBdr'))
    bot = etree.SubElement(bdr, q('bottom'))
    bot.set(q('val'), 'single')
    bot.set(q('sz'), RULE_SZ)
    bot.set(q('space'), '1')
    bot.set(q('color'), '000000')

    rpr = etree.SubElement(ppr, q('rPr'))
    for tag in ('sz', 'szCs'):
        e = etree.SubElement(rpr, q(tag))
        e.set(q('val'), '4')        # ارتفاع خط را کم نگه می‌دارد

    r = etree.SubElement(p, q('r'))
    rrpr = etree.SubElement(r, q('rPr'))
    for tag in ('sz', 'szCs'):
        e = etree.SubElement(rrpr, q(tag))
        e.set(q('val'), '4')
    # عمداً <w:separator/> را برنمی‌گردانیم: اگر بماند، ورد خطِ کوتاهِ
    # پیش‌فرض را هم می‌کشد و دو خط روی هم می‌افتد (در رندر تأیید شد).
    # ران خالی کافی است و فایل معتبر می‌ماند.
    return p


def process(src, dst):
    zin = zipfile.ZipFile(src)
    parts = {n: zin.read(n) for n in zin.namelist()}
    zin.close()

    changed = []
    for part in ('word/footnotes.xml', 'word/endnotes.xml'):
        if part not in parts:
            continue
        root = etree.fromstring(parts[part])
        tag = 'footnote' if 'footnotes' in part else 'endnote'
        for n in root.findall(q(tag)):
            i = n.get(q('id'))
            if i is None or int(i) > 0:
                continue
            kind = n.get(q('type'))
            if kind not in ('separator', 'continuationSeparator'):
                continue
            # عنصر جداکنندهٔ اصلی را بردار و در پاراگراف تازه بگذار
            sep = None
            for e in n.iter():
                if e.tag in (q('separator'), q('continuationSeparator')):
                    sep = e
                    break
            if sep is not None:
                sep.getparent().remove(sep)
            for child in list(n):
                n.remove(child)
            n.append(make_rule_p(sep))
            changed.append(f'{tag}:{kind}')
        parts[part] = etree.tostring(
            root, xml_declaration=True, encoding='UTF-8', standalone=True)

    with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
        for k, v in parts.items():
            z.writestr(k, v)
    return changed


if __name__ == '__main__':
    src = sys.argv[1] if len(sys.argv) > 1 else 'Payannameh-v7-tables.docx'
    dst = sys.argv[2] if len(sys.argv) > 2 else 'Payannameh-v8-fnrule.docx'
    print('نوشته شد:', dst, '| اصلاح‌شده:', process(src, dst))
