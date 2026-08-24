#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_footnote_report.py — «گزارش بررسی پانویس‌ها.docx»

A short Persian report that documents, for the supervisor:
  * which footnotes were wrong and what they were corrected to,
  * the evidence for each correction,
  * which entries the Excel sheet doubted but that were already correct,
  * what still needs the author's decision.
"""

from __future__ import annotations

import json
import os
import re
import zipfile

from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
CT = "http://schemas.openxmlformats.org/package/2006/content-types"
PR = "http://schemas.openxmlformats.org/package/2006/relationships"
w = lambda t: f"{{{W}}}{t}"  # noqa: E731

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, "گزارش بررسی پانویس‌ها.docx")

FA_FONT, TI_FONT, LAT_FONT = "B Nazanin", "B Titr", "Times New Roman"
BODY, HEAD, TITLE = 26, 30, 38
MARGIN, PAGE_W, PAGE_H = 1440, 11906, 16838
TO_FA = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
ARABIC = ((0x0600, 0x06FF), (0xFB50, 0xFDFF), (0xFE70, 0xFEFF))
LATIN = re.compile(r"[A-Za-z\u00C0-\u024F]")


def sc_of(ch):
    o = ord(ch)
    if any(lo <= o <= hi for lo, hi in ARABIC):
        return "fa"
    return "en" if LATIN.match(ch) else "neutral"


def chunks(s):
    out, buf, cur = [], "", "neutral"
    for ch in s:
        sc = sc_of(ch)
        if sc == "neutral":
            buf += ch
            continue
        if cur == "neutral":
            cur, buf = sc, buf + ch
        elif sc == cur:
            buf += ch
        else:
            out.append((cur, buf))
            buf, cur = ch, sc
    if buf:
        out.append((cur, buf))
    return out or [("fa", s)]


def rpr(size, bold, script, color=None):
    el = etree.Element(w("rPr"))
    f = etree.SubElement(el, w("rFonts"))
    if script == "en":
        f.set(w("ascii"), LAT_FONT)
        f.set(w("hAnsi"), LAT_FONT)
        f.set(w("cs"), LAT_FONT)
    else:
        f.set(w("cs"), FA_FONT if size <= HEAD else TI_FONT)
        f.set(w("hint"), "cs")
    if bold:
        etree.SubElement(el, w("b"))
        etree.SubElement(el, w("bCs"))
    if color:
        etree.SubElement(el, w("color")).set(w("val"), color)
    etree.SubElement(el, w("sz")).set(w("val"), str(size))
    etree.SubElement(el, w("szCs")).set(w("val"), str(size))
    rtl = etree.SubElement(el, w("rtl"))
    lang = etree.SubElement(el, w("lang"))
    if script == "en":
        rtl.set(w("val"), "0")
        lang.set(w("val"), "en-US")
    else:
        lang.set(w("bidi"), "fa-IR")
    return el


def para(body, text, *, size=BODY, bold=False, jc="both", after=120,
         before=0, color=None, shade=None, keep=False, page_break=False,
         line=340):
    p = etree.SubElement(body, w("p"))
    pPr = etree.SubElement(p, w("pPr"))
    if page_break:
        etree.SubElement(pPr, w("pageBreakBefore"))
    if keep:
        etree.SubElement(pPr, w("keepNext"))
        etree.SubElement(pPr, w("keepLines"))
    etree.SubElement(pPr, w("widowControl"))
    etree.SubElement(pPr, w("bidi"))
    if shade:
        sh = etree.SubElement(pPr, w("shd"))
        sh.set(w("val"), "clear")
        sh.set(w("fill"), shade)
    sp = etree.SubElement(pPr, w("spacing"))
    sp.set(w("before"), str(before))
    sp.set(w("after"), str(after))
    sp.set(w("line"), str(line))
    sp.set(w("lineRule"), "auto")
    ind = etree.SubElement(pPr, w("ind"))
    ind.set(w("left"), "0")
    ind.set(w("right"), "0")
    etree.SubElement(pPr, w("jc")).set(w("val"), jc)
    for sc, ck in chunks(text):
        r = etree.SubElement(p, w("r"))
        r.append(rpr(size, bold, sc, color))
        t = etree.SubElement(r, w("t"))
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        t.text = ck.translate(TO_FA) if sc != "en" else ck
    return p


KIND_FA = {
    "garbled": "نام لاتین نادرست",
    "stray":   "چسبیدن شمارهٔ فهرست",
    "order":   "ترتیب واژه‌ها",
    "spacing": "املا/فاصله/دیاکریتیک",
}
KIND_COLOR = {"garbled": "9C0006", "stray": "C05621",
              "order": "1F6F8B", "spacing": "2F6B2F"}
KIND_SHADE = {"garbled": "FDE7E9", "stray": "FDF0E3",
              "order": "E7F1F5", "spacing": "E9F3E9"}


def build():
    rep = json.load(open("/tmp/fn_report.json", encoding="utf-8"))
    applied = rep["applied"]
    ok = rep["confirmed_ok"]

    root = etree.Element(w("document"), nsmap={"w": W, "r": R})
    body = etree.SubElement(root, w("body"))

    para(body, "گزارش بررسی و اصلاح پانویس‌ها", size=TITLE, bold=True,
         jc="center", before=1800, after=160)
    para(body, "پایان‌نامه: رابطه هوش معنوی و اضطراب سلامتی با اضطراب مرگ "
               "سالمندان", size=HEAD, bold=True, jc="center", after=500)
    para(body, "فایل بررسی‌شده: Payannameh_Fatemeh.Bayat-B-v2.docx",
         jc="center", after=90)
    para(body, "فایل اصلاح‌شده: Payannameh_Fatemeh.Bayat-B-v3.docx",
         jc="center", after=500, bold=True)

    para(body, "خلاصهٔ اجرایی", size=HEAD, bold=True, jc="right",
         after=140, keep=True)
    for line in [
        f"کل پانویس‌های موجود در پایان‌نامه: {len(rep['all_after'])} مورد.",
        f"پانویس‌های اصلاح‌شده: {len(applied)} مورد "
        "(نام لاتین نادرست، چسبیدن شمارهٔ فهرست، ترتیب واژه‌ها و املا).",
        "افزون بر این، چهار پانویس (شماره‌های ۸، ۱۷، ۱۸ و ۱۹) به‌جای "
        "شمارهٔ خودکارِ ورد، عدد دستی تایپ‌شده داشتند؛ این یعنی با افزودن "
        "یا حذف هر پانویس، شمارهٔ آن‌ها به‌روز نمی‌شد و با شمارهٔ داخل متن "
        "نمی‌خواند. هر چهار مورد به شمارهٔ خودکار تبدیل شد.",
        "سبک پانویس‌های پایان‌نامه «فقط املای لاتین نام» است؛ این سبک "
        "عیناً حفظ شد و ارجاع کتاب‌شناختی کامل به پانویس‌ها افزوده نشد تا "
        "یکدستی متن به‌هم نخورد.",
        "هیچ بخش دیگری از فایل تغییر نکرد: مقایسهٔ کدِ داخلی نشان می‌دهد "
        "تنها بخش footnotes.xml تفاوت دارد و صفحه‌بندی، قلم‌ها، جدول‌ها و "
        "اصلاحات دستی شما دست‌نخورده باقی مانده است.",
    ]:
        para(body, "◆  " + line, after=130)

    para(body, "الف) پانویس‌های اصلاح‌شده", size=HEAD, bold=True,
         jc="right", page_break=True, after=150, keep=True)

    for i, a in enumerate(applied, 1):
        k = a["kind"]
        para(body, f"{i}. پانویس شمارهٔ {a['id']}   |   {KIND_FA[k]}",
             size=24, bold=True, jc="right", before=220, after=80,
             color=KIND_COLOR[k], shade=KIND_SHADE[k], keep=True)
        para(body, f"پیش از اصلاح:  {a['old']}", after=60, keep=True)
        para(body, f"پس از اصلاح:  {a['new']}", bold=True, after=60,
             keep=True)
        para(body, "مستند:  " + a["why"], after=150)

    para(body, "ب) مواردی که فایل اکسل مشکوک دانسته بود اما درست بودند",
         size=HEAD, bold=True, jc="right", page_break=True, after=150,
         keep=True)
    para(body, "فایل اکسل پیشنهادی برای این چند مورد حدس‌های نادرست زده "
               "بود. پس از بررسی منابع اصلی، متن موجود در پایان‌نامه درست "
               "تشخیص داده شد و تغییری اعمال نشد:", after=160)
    for fid, why in sorted(ok.items(), key=lambda x: int(x[0])):
        para(body, f"پانویس {fid}:  {why}", after=130)

    para(body, "ج) مواردی که تصمیم با شماست", size=HEAD, bold=True,
         jc="right", page_break=True, after=150, keep=True)
    for line in [
        "پانویس ۶۸ («Zeng»): منبع این ارجاع در فهرست منابع پایان‌نامه "
        "نیامده است. یا باید مشخصات کامل مقاله یافته و به فهرست منابع "
        "افزوده شود، یا در صورت نبودِ منبع معتبر، ارجاع از متن حذف گردد.",
        "چند نام دیگر که در متن ارجاع داده شده‌اند اما در فهرست منابع "
        "پایان‌نامه نیستند: شفیعی، ویت‌مور، اکبری، کاظمی، امامی، "
        "رحیمی‌پور و فروتن. پیش از جلسهٔ دفاع، یا مشخصات کامل آن‌ها به "
        "فهرست منابع افزوده شود یا ارجاعشان از متن برداشته شود؛ داوران "
        "معمولاً این ناهماهنگی را می‌گیرند.",
        "فایل اکسل پیشنهاد کرده بود پانویس‌ها به ارجاع کتاب‌شناختی کامل "
        "(نویسنده، سال، عنوان، مجله، صفحات) تبدیل شوند. این کار سبک "
        "پانویس‌های پایان‌نامه را عوض می‌کند و متن را سنگین می‌سازد؛ "
        "به همین دلیل اعمال نشد. اگر استاد راهنما این سبک را بخواهد، "
        "با یک دستور قابل اجراست.",
        "پانویس‌های چکیده (کرجسی و مورگان، کینگ، سالکووسکیس، وارویک، "
        "تمپلر و پیرسون) طبق رسم پایان‌نامه‌های ایرانی در چکیده درج "
        "نشده‌اند و همین‌طور باقی ماندند؛ در متن اصلی همگی پانویس دارند.",
    ]:
        para(body, "◆  " + line, after=150)

    sect = etree.SubElement(body, w("sectPr"))
    sz = etree.SubElement(sect, w("pgSz"))
    sz.set(w("w"), str(PAGE_W))
    sz.set(w("h"), str(PAGE_H))
    mar = etree.SubElement(sect, w("pgMar"))
    for k, v in (("top", MARGIN), ("right", MARGIN), ("bottom", MARGIN),
                 ("left", MARGIN), ("header", 708), ("footer", 708),
                 ("gutter", 0)):
        mar.set(w(k), str(v))
    etree.SubElement(sect, w("bidi"))

    st = etree.Element(w("styles"), nsmap={"w": W})
    dd = etree.SubElement(st, w("docDefaults"))
    rp = etree.SubElement(etree.SubElement(dd, w("rPrDefault")), w("rPr"))
    f = etree.SubElement(rp, w("rFonts"))
    f.set(w("ascii"), LAT_FONT)
    f.set(w("hAnsi"), LAT_FONT)
    f.set(w("cs"), FA_FONT)
    etree.SubElement(rp, w("sz")).set(w("val"), str(BODY))
    etree.SubElement(rp, w("szCs")).set(w("val"), str(BODY))
    s = etree.SubElement(st, w("style"))
    s.set(w("type"), "paragraph")
    s.set(w("default"), "1")
    s.set(w("styleId"), "Normal")
    etree.SubElement(s, w("name")).set(w("val"), "Normal")

    ct = etree.Element("{%s}Types" % CT, nsmap={None: CT})
    for ext, mime in (("rels", "application/vnd.openxmlformats-package."
                               "relationships+xml"),
                      ("xml", "application/xml")):
        d = etree.SubElement(ct, "{%s}Default" % CT)
        d.set("Extension", ext)
        d.set("ContentType", mime)
    for part, mime in (
        ("/word/document.xml", "application/vnd.openxmlformats-"
         "officedocument.wordprocessingml.document.main+xml"),
        ("/word/styles.xml", "application/vnd.openxmlformats-"
         "officedocument.wordprocessingml.styles+xml"),
    ):
        o = etree.SubElement(ct, "{%s}Override" % CT)
        o.set("PartName", part)
        o.set("ContentType", mime)

    rels = etree.Element("{%s}Relationships" % PR, nsmap={None: PR})
    e = etree.SubElement(rels, "{%s}Relationship" % PR)
    e.set("Id", "rId1")
    e.set("Type", "http://schemas.openxmlformats.org/officeDocument/2006/"
                  "relationships/officeDocument")
    e.set("Target", "word/document.xml")

    drels = etree.Element("{%s}Relationships" % PR, nsmap={None: PR})
    e = etree.SubElement(drels, "{%s}Relationship" % PR)
    e.set("Id", "rId1")
    e.set("Type", "http://schemas.openxmlformats.org/officeDocument/2006/"
                  "relationships/styles")
    e.set("Target", "styles.xml")

    ser = lambda el: etree.tostring(  # noqa: E731
        el, xml_declaration=True, encoding="UTF-8", standalone=True)
    if os.path.exists(OUT):
        os.remove(OUT)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", ser(ct))
        z.writestr("_rels/.rels", ser(rels))
        z.writestr("word/document.xml", ser(root))
        z.writestr("word/styles.xml", ser(st))
        z.writestr("word/_rels/document.xml.rels", ser(drels))
    print("written:", OUT)


if __name__ == "__main__":
    build()
