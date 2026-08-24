#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_sample.py — «نمونه پانویس و منابع (پیش‌نمایش).docx»

A 3-page PREVIEW, not the final thesis. It shows, using the real formatting
of the beautified thesis:

  page 1  a real thesis page whose footnotes have been corrected, so the
          look of the footnote area can be judged
  page 2  side-by-side before/after of every ambiguous footnote
  page 3  the reference-list entries that would be added, in APA form

The actual v3 file is deliberately NOT produced until this preview is
approved.
"""

from __future__ import annotations

import os
import re
import sys
import zipfile

from lxml import etree

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sources import SOURCES  # noqa: E402

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
w = lambda t: f"{{{W}}}{t}"  # noqa: E731

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, "Payannameh_Fatemeh.Bayat-B-v2.docx")
OUT = os.path.join(REPO, "نمونه پانویس و منابع (پیش‌نمایش).docx")

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


# --------------------------------------------------------------------------
# formatting cloned from the beautified thesis
# --------------------------------------------------------------------------
FA, TI, LAT = "B Nazanin", "B Titr", "Times New Roman"
BODY, HEAD, TITLE = 28, 30, 36


def rpr(size, bold, script, color=None, italic=False):
    el = etree.Element(w("rPr"))
    f = etree.SubElement(el, w("rFonts"))
    if script == "en":
        f.set(w("ascii"), LAT)
        f.set(w("hAnsi"), LAT)
        f.set(w("cs"), LAT)
    else:
        f.set(w("cs"), FA if size <= HEAD else TI)
        f.set(w("hint"), "cs")
    if bold:
        etree.SubElement(el, w("b"))
        etree.SubElement(el, w("bCs"))
    if italic:
        etree.SubElement(el, w("i"))
        etree.SubElement(el, w("iCs"))
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


def para(body, text="", *, size=BODY, bold=False, jc="both", after=120,
         before=0, color=None, shade=None, keep=False, page_break=False,
         line=360, first=0, italic=False, ltr=False):
    p = etree.SubElement(body, w("p"))
    pPr = etree.SubElement(p, w("pPr"))
    if page_break:
        etree.SubElement(pPr, w("pageBreakBefore"))
    if keep:
        etree.SubElement(pPr, w("keepNext"))
        etree.SubElement(pPr, w("keepLines"))
    etree.SubElement(pPr, w("widowControl"))
    b = etree.SubElement(pPr, w("bidi"))
    if ltr:
        b.set(w("val"), "0")
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
    if first:
        ind.set(w("firstLine" if first > 0 else "hanging"), str(abs(first)))
    etree.SubElement(pPr, w("jc")).set(w("val"), jc)
    for sc, ck in chunks(text):
        r = etree.SubElement(p, w("r"))
        r.append(rpr(size, bold, sc, color, italic))
        t = etree.SubElement(r, w("t"))
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        t.text = ck.translate(TO_FA) if sc != "en" else ck
    return p


def add_footnote_ref(p, fid, size=BODY):
    r = etree.SubElement(p, w("r"))
    rPr = rpr(size, False, "en")
    st = etree.Element(w("rStyle"))
    st.set(w("val"), "FootnoteReference")
    rPr.insert(0, st)
    r.append(rPr)
    ref = etree.SubElement(r, w("footnoteReference"))
    ref.set(w("id"), str(fid))


def para_with_notes(body, segments, **kw):
    """segments: list of (text, footnote_id_or_None)."""
    p = para(body, "", **kw)
    for text, fid in segments:
        if text:
            for sc, ck in chunks(text):
                r = etree.SubElement(p, w("r"))
                r.append(rpr(kw.get("size", BODY), kw.get("bold", False), sc))
                t = etree.SubElement(r, w("t"))
                t.set("{http://www.w3.org/XML/1998/namespace}space",
                      "preserve")
                t.text = ck.translate(TO_FA) if sc != "en" else ck
        if fid is not None:
            add_footnote_ref(p, fid, kw.get("size", BODY))
    return p


def build():
    # start from the real thesis so styles / fonts / footnote style match
    import shutil
    work = "/tmp/sample"
    shutil.rmtree(work, ignore_errors=True)
    with zipfile.ZipFile(SRC) as z:
        z.extractall(work)

    doc_path = os.path.join(work, "word", "document.xml")
    fn_path = os.path.join(work, "word", "footnotes.xml")
    tree = etree.parse(doc_path)
    body = tree.getroot()[0]
    sect = [c for c in body if c.tag == w("sectPr")]
    for c in list(body):
        body.remove(c)

    # rebuild the footnotes part with only the notes we demo
    ftree = etree.parse(fn_path)
    froot = ftree.getroot()
    keep_special = [n for n in froot.findall(w("footnote"))
                    if n.get(w("type"))]
    template = next(n for n in froot.findall(w("footnote"))
                    if not n.get(w("type")))
    for n in list(froot):
        froot.remove(n)
    for n in keep_special:
        froot.append(n)

    demo_ids = [16, 17, 18, 19, 33, 67, 70, 73, 75, 76, 79, 81]

    import copy
    for i, fid in enumerate(demo_ids, start=1):
        note = copy.deepcopy(template)
        note.set(w("id"), str(i))
        for r in list(note.iter(w("r"))):
            if r.find(w("footnoteRef")) is None:
                r.getparent().remove(r)
        p0 = note.find(w("p"))
        r = etree.SubElement(p0, w("r"))
        rp = etree.SubElement(r, w("rPr"))
        f = etree.SubElement(rp, w("rFonts"))
        f.set(w("ascii"), LAT)
        f.set(w("hAnsi"), LAT)
        t = etree.SubElement(r, w("t"))
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        t.text = " " + SOURCES[fid]["short"]
        froot.append(note)
    ftree.write(fn_path, xml_declaration=True, encoding="UTF-8",
                standalone=True)

    idx = {fid: i for i, fid in enumerate(demo_ids, start=1)}

    # ---------------- page 1: a real thesis page, footnotes corrected -----
    para(body, "نمونهٔ پیش‌نمایش — این فایل نسخهٔ نهایی نیست",
         size=24, bold=True, jc="center", color="9C0006",
         shade="FDE7E9", after=200)
    para(body, "صفحهٔ ۱ — نمای واقعی متن پایان‌نامه با پانویس‌های اصلاح‌شده",
         size=HEAD, bold=True, jc="right", after=160, keep=True)
    para(body, "متن زیر عیناً از فصل دوم پایان‌نامه برداشته شده و تنها "
               "پانویس‌ها اصلاح شده‌اند. هدف این صفحه آن است که ببینید "
               "شکل ظاهری پانویس‌ها و تناسب آن‌ها با متن چگونه می‌شود.",
         size=24, jc="both", after=200, color="595959")

    para(body, "۲-۱-۲-۲- نظریه‌های روان‌شناختی", size=HEAD, bold=True,
         jc="right", after=120, keep=True)
    para_with_notes(body, [
        ("راجر گولد", idx[16]),
        (" سالمندی را مرحله‌ای از زندگی می‌داند که با افزایش نرم‌خویی، "
         "گرمی عاطفی و بازنگری در روابط با والدین همراه است. ", None),
        ("دانیل لوینسون", idx[17]),
        (" سالمندی را مواجهه با خود و زندگی می‌داند و ", None),
        ("شی", idx[18]),
        (" آن را مرحلهٔ ایجاد وحدت و تمامیت می‌شمارد. از دیدگاه ", None),
        ("اریکسون", idx[19]),
        ("، واپسین مرحلهٔ رشد روانی ـ اجتماعی با تعارض «انسجام من در "
         "برابر ناامیدی» مشخص می‌شود.", None),
    ], first=397, after=160)

    para(body, "۲-۲-۲-۳- نظریه مدیریت وحشت", size=HEAD, bold=True,
         jc="right", after=120, keep=True)
    para_with_notes(body, [
        ("طبق این نظریه، که توسط ", None),
        ("گرینبرگ و همکاران", idx[33]),
        (" مطرح شده است، انسان‌ها برای مقابله با اضطراب مرگ به "
         "سیستم‌های دفاعی فرهنگی و عزت‌نفس متوسل می‌شوند. یادآوری مرگ "
         "باعث می‌شود افراد بکوشند بیشتر با ارزش‌های فرهنگی خود همسو "
         "شوند تا احساس جاودانگی نمادین پیدا کنند.", None),
    ], first=397, after=160)

    para(body, "۲-۵-۲- پیشینه خارجی", size=HEAD, bold=True, jc="right",
         after=120, keep=True)
    para_with_notes(body, [
        ("یانکر، اسنابلروچ و دهان", idx[67]),
        (" (۲۰۱۲) در پژوهشی با عنوان رابطهٔ مذهبی بودن و پیامدهای "
         "روان‌شناختی به این نتیجه رسیدند که مذهبی و معنوی بودن بر بروز "
         "افسردگی و عزت نفس تأثیر می‌گذارد. ", None),
        ("مت سعد، حتا و محمد", idx[70]),
        (" (۲۰۱۰) در مطالعه‌ای بر ۳۷۸ فرد مسن نشان دادند هوش معنوی با "
         "سلامت عمومی رابطهٔ مثبت دارد. ", None),
        ("جین و پوروحیت", idx[73]),
        (" (۲۰۰۶) هوش معنوی ۲۰۰ سالمند را در دو گروه ساکن خانواده و "
         "خانهٔ سالمندان مقایسه کردند.", None),
    ], first=397, after=160)

    para_with_notes(body, [
        ("تورسون و پاوول", idx[75]),
        (" (۱۹۸۸) در پژوهشی با عنوان «عناصر اضطراب مرگ و معانی مرگ» با "
         "مشارکت ۵۹۹ نفر نشان دادند زنان سطوح بالاتری از اضطراب مرگ را "
         "گزارش می‌کنند. ", None),
        ("موریرا-آلمیدا و کوئینگ", idx[76]),
        (" (۲۰۰۶) با تحلیل بیش از ۲۰۰۰ پژوهش دریافتند بین معنویت و "
         "بهزیستی ذهنی رابطه وجود دارد. ", None),
        ("تامر و الیسون", idx[79]),
        (" (۲۰۰۰) تأکید کردند دیدگاه فرد نسبت به مرگ تحت‌تأثیر "
         "نگرانی‌های سلامت است.", None),
    ], first=397, after=160)

    para_with_notes(body, [
        ("به منظور تعیین حجم نمونه، از جدول ", None),
        ("کرجسی و مورگان", idx[81]),
        (" (۱۹۷۰) استفاده شد.", None),
    ], first=397, after=160)

    # ---------------- page 2: before / after ------------------------------
    para(body, "صفحهٔ ۲ — فهرست موارد گنگ و آنچه شناسایی شد",
         size=HEAD, bold=True, jc="right", page_break=True, after=100,
         keep=True)
    para(body, "ستون «پیش» متن فعلی پانویس در فایل شماست و ستون «پس» "
               "پیشنهاد اصلاح‌شده بر پایهٔ منبع اصلی.",
         size=24, jc="both", after=180, color="595959")

    n = 0
    for fid, s in sorted(SOURCES.items()):
        if s["status"] not in ("fixed", "unresolved"):
            continue
        n += 1
        unc = s.get("uncertain")
        col = "9C0006" if unc else "1F6F8B"
        shade = "FDE7E9" if unc else "E7F1F5"
        tag = "نیازمند تصمیم شما" if unc else "شناسایی شد"
        para(body, f"{n}. پانویس {fid}   |   {tag}", size=24, bold=True,
             jc="right", before=200, after=70, color=col, shade=shade,
             keep=True)
        para(body, f"پیش:  {s['was']}", size=24, after=50, keep=True)
        if s["short"]:
            para(body, f"پس:  {s['short']}", size=24, bold=True, after=50,
                 keep=True)
        para(body, "دلیل:  " + s["evidence"], size=24, after=130)

    # ---------------- page 3: reference-list additions --------------------
    para(body, "صفحهٔ ۳ — مدخل‌هایی که باید به «منابع» افزوده شوند",
         size=HEAD, bold=True, jc="right", page_break=True, after=100,
         keep=True)
    para(body, "بررسی نشان داد ۲۱ منبع در متن ارجاع داده شده‌اند اما در "
               "فهرست منابع پایان‌نامه نیامده‌اند. پیشنهاد این است که "
               "پانویس‌ها کوتاه بمانند (نام و سال) و مشخصات کامل در بخش "
               "منابع بیاید. مدخل‌های زیر به شیوهٔ APA آماده شده‌اند:",
         size=24, jc="both", after=200, color="595959")

    entries = sorted(
        {s["full"] for s in SOURCES.values() if s.get("full")})
    for i, e in enumerate(entries, 1):
        para(body, e, size=24, jc="left", ltr=True, after=110, first=-397,
             line=300)

    para(body, "موارد حل‌نشده", size=HEAD, bold=True, jc="right",
         before=280, after=120, keep=True)
    for fid, s in sorted(SOURCES.items()):
        if not s.get("uncertain"):
            continue
        para(body, f"◆  پانویس {fid} ({s['was']}): {s['evidence']}",
             size=24, jc="both", after=130)

    for c in sect:
        body.append(c)
    tree.write(doc_path, xml_declaration=True, encoding="UTF-8",
               standalone=True)

    if os.path.exists(OUT):
        os.remove(OUT)
    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(work, "[Content_Types].xml"),
                "[Content_Types].xml")
        for root_dir, _, files in os.walk(work):
            for f in files:
                full = os.path.join(root_dir, f)
                rel = os.path.relpath(full, work).replace(os.sep, "/")
                if rel != "[Content_Types].xml":
                    z.write(full, rel)
    print("written:", OUT)
    print("demo footnotes:", len(demo_ids),
          "| reference entries:", len(entries))


if __name__ == "__main__":
    build()
