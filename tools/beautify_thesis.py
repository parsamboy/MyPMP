#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
beautify_thesis.py
==================

زیباسازی پایان‌نامه «PayannamehFatemeh.Bayat .doc» بدون تغییر در محتوا.

Beautifies the thesis WITHOUT changing its wording. What it does:

1. Persian runs  -> RTL, Persian language tag (fa-IR), unified Persian font,
   Persian (contextual) digits ۰۱۲۳۴۵۶۷۸۹.
2. Latin runs    -> LTR, en-US, left aligned, original Latin font kept,
   ASCII digits 0123456789.
3. Normal page margins (2.54 cm) + a real dot-leader tab stop in the two
   tables of contents so every page number lands in one straight column.
4. Headings never split across pages (keepNext / keepLines / widowControl)
   and each chapter cover page sits alone on its own page.
5. Every chapter's body text starts at the top of the following page.

The legacy .doc is read through a Spire.Doc conversion, and the tail that the
free Spire tier truncates (the English ABSTRACT page and the English title
page) is recovered straight from the binary .doc piece table, so no content is
lost.
"""

from __future__ import annotations

import copy
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import zipfile
from typing import Iterable

from lxml import etree

# --------------------------------------------------------------------------
# constants
# --------------------------------------------------------------------------

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
w = lambda tag: f"{{{W}}}{tag}"  # noqa: E731

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DOC = os.path.join(REPO, "PayannamehFatemeh.Bayat .doc")
OUT_DOCX = os.path.join(REPO, "PayannamehFatemeh.Bayat-Beautified.docx")

# A4 = 11906 x 16838 twips.  "Normal" Word margins = 1 inch = 1440 twips.
PAGE_W, PAGE_H = 11906, 16838
MARGIN = 1440
TEXT_WIDTH = PAGE_W - 2 * MARGIN          # 9026 twips -> the TOC tab stop

PERSIAN_FONT = "B Nazanin"                # body text
PERSIAN_TITLE_FONT = "B Titr"             # chapter covers / main titles
LATIN_FONT_FALLBACK = "Times New Roman"

BODY_SZ = 28        # half-points -> 14 pt
HEAD_SZ = 30        # 15 pt
CHAPTER_SZ = 56     # 28 pt on the chapter cover pages
LINE_SPACING = 360  # 1.5 lines (240 = single)

PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
ASCII_DIGITS = "0123456789"
TO_FA = str.maketrans(ASCII_DIGITS + "٠١٢٣٤٥٦٧٨٩", PERSIAN_DIGITS * 2)
TO_EN = str.maketrans(PERSIAN_DIGITS + "٠١٢٣٤٥٦٧٨٩", ASCII_DIGITS * 2)

ARABIC_RANGES = (
    (0x0600, 0x06FF), (0x0750, 0x077F), (0x08A0, 0x08FF),
    (0xFB50, 0xFDFF), (0xFE70, 0xFEFF),
)
LATIN_LETTER = re.compile(r"[A-Za-z\u00C0-\u024F]")


def is_arabic_char(ch: str) -> bool:
    o = ord(ch)
    return any(lo <= o <= hi for lo, hi in ARABIC_RANGES)


def script_of(text: str) -> str:
    """'fa' | 'en' | 'neutral' for a piece of text."""
    if any(is_arabic_char(c) for c in text):
        return "fa"
    if LATIN_LETTER.search(text):
        return "en"
    return "neutral"


# --------------------------------------------------------------------------
# 1. read the legacy .doc
# --------------------------------------------------------------------------

def spire_convert(src: str, dst: str) -> None:
    """Convert the binary .doc to .docx using Spire.Doc."""
    from spire.doc import Document, FileFormat

    doc = Document()
    doc.LoadFromFile(src)
    doc.SaveToFile(dst, FileFormat.Docx2016)
    doc.Close()


def raw_doc_paragraphs(path: str) -> list[str]:
    """
    Pull the main text stream out of a Word 97-2003 binary file by walking the
    piece table (CLX / PlcPcd).  Used to recover the tail Spire's free tier
    drops.
    """
    import olefile

    ole = olefile.OleFileIO(path)
    wd = ole.openstream("WordDocument").read()
    flags = struct.unpack_from("<H", wd, 10)[0]
    table_name = "1Table" if (flags >> 9) & 1 else "0Table"
    tbl = ole.openstream(table_name).read()

    ccp_text = struct.unpack_from("<l", wd, 0x004C)[0]
    fc_clx, lcb_clx = struct.unpack_from("<ll", wd, 0x01A2)
    clx = tbl[fc_clx: fc_clx + lcb_clx]

    i = 0
    while clx[i] == 1:                       # skip Prc entries
        cb = struct.unpack_from("<h", clx, i + 1)[0]
        i += 3 + cb
    assert clx[i] == 2, "unexpected CLX layout"
    lcb = struct.unpack_from("<L", clx, i + 1)[0]
    plc = clx[i + 5: i + 5 + lcb]

    n = (lcb - 4) // 12
    cps = [struct.unpack_from("<L", plc, 4 * k)[0] for k in range(n + 1)]
    base = 4 * (n + 1)

    out: list[str] = []
    for k in range(n):
        fc = struct.unpack_from("<L", plc, 0)[0]  # placeholder, replaced below
        pcd = plc[base + 8 * k: base + 8 * (k + 1)]
        fc = struct.unpack_from("<L", pcd, 2)[0]
        compressed = (fc >> 30) & 1
        fc &= 0x3FFFFFFF
        cch = cps[k + 1] - cps[k]
        if compressed:
            out.append(wd[fc // 2: fc // 2 + cch].decode("cp1256", "replace"))
        else:
            out.append(wd[fc: fc + cch * 2].decode("utf-16-le", "replace"))

    main = "".join(out)[:ccp_text]
    return main.split("\r")


# --------------------------------------------------------------------------
# 2. small OOXML helpers
# --------------------------------------------------------------------------

def sub(parent, tag: str, **attrs):
    el = etree.SubElement(parent, w(tag))
    for k, v in attrs.items():
        el.set(w(k), str(v))
    return el


def get_or_make(parent, tag: str, before: Iterable[str] = ()):
    """Fetch child <tag>, creating it in schema order if missing."""
    el = parent.find(w(tag))
    if el is not None:
        return el
    el = etree.Element(w(tag))
    anchor = None
    for name in before:
        found = parent.find(w(name))
        if found is not None:
            anchor = found
            break
    if anchor is not None:
        anchor.addprevious(el)
    else:
        parent.append(el)
    return el


PPR_ORDER = [
    "pStyle", "keepNext", "keepLines", "pageBreakBefore", "framePr",
    "widowControl", "numPr", "suppressLineNumbers", "pBdr", "shd", "tabs",
    "suppressAutoHyphens", "kinsoku", "wordWrap", "overflowPunct",
    "topLinePunct", "autoSpaceDE", "autoSpaceDN", "bidi", "adjustRightInd",
    "snapToGrid", "spacing", "ind", "contextualSpacing", "mirrorIndents",
    "suppressOverlap", "jc", "textDirection", "textAlignment",
    "textboxTightWrap", "outlineLvl", "divId", "cnfStyle", "rPr", "sectPr",
    "pPrChange",
]
RPR_ORDER = [
    "rStyle", "rFonts", "b", "bCs", "i", "iCs", "caps", "smallCaps", "strike",
    "dstrike", "outline", "shadow", "emboss", "imprint", "noProof",
    "snapToGrid", "vanish", "webHidden", "color", "spacing", "wcode", "kern",
    "position", "sz", "szCs", "highlight", "u", "effect", "bdr", "shd",
    "fitText", "vertAlign", "rtl", "cs", "em", "lang", "eastAsianLayout",
    "specVanish", "oMath",
]


def order_children(el, order: list[str]) -> None:
    idx = {name: i for i, name in enumerate(order)}
    kids = list(el)
    kids.sort(key=lambda c: idx.get(etree.QName(c).localname, len(order)))
    for c in kids:
        el.append(c)


def ppr_of(p):
    pPr = p.find(w("pPr"))
    if pPr is None:
        pPr = etree.Element(w("pPr"))
        p.insert(0, pPr)
    return pPr


def rpr_of(r):
    rPr = r.find(w("rPr"))
    if rPr is None:
        rPr = etree.Element(w("rPr"))
        r.insert(0, rPr)
    return rPr


def set_flag(parent, tag: str, on: bool = True) -> None:
    el = parent.find(w(tag))
    if on:
        if el is None:
            el = etree.SubElement(parent, w(tag))
        el.attrib.pop(w("val"), None)
    else:
        if el is None:
            el = etree.SubElement(parent, w(tag))
        el.set(w("val"), "0")


def drop(parent, tag: str) -> None:
    for el in parent.findall(w(tag)):
        parent.remove(el)


def text_of(node) -> str:
    return "".join(t.text or "" for t in node.iter(w("t")))


def run_text(r) -> str:
    return "".join(t.text or "" for t in r.iter(w("t")))


# --------------------------------------------------------------------------
# 3. run + paragraph formatting
# --------------------------------------------------------------------------

def style_run(r, script: str, *, size: int, bold: bool | None,
              font_fa: str = PERSIAN_FONT) -> None:
    """Apply language / direction / font / digit shaping to one run."""
    rPr = rpr_of(r)

    fonts = get_or_make(rPr, "rFonts")
    lang = get_or_make(rPr, "lang")

    if script == "fa":
        fonts.set(w("cs"), font_fa)
        fonts.set(w("hint"), "cs")
        set_flag(rPr, "rtl", True)
        lang.set(w("bidi"), "fa-IR")
        lang.attrib.pop(w("val"), None)
        for t in r.iter(w("t")):
            if t.text:
                t.text = t.text.translate(TO_FA)
    elif script == "en":
        if not fonts.get(w("ascii")):
            fonts.set(w("ascii"), LATIN_FONT_FALLBACK)
            fonts.set(w("hAnsi"), LATIN_FONT_FALLBACK)
        fonts.attrib.pop(w("hint"), None)
        set_flag(rPr, "rtl", False)
        lang.set(w("val"), "en-US")
        lang.attrib.pop(w("bidi"), None)
        for t in r.iter(w("t")):
            if t.text:
                t.text = t.text.translate(TO_EN)

    # size
    for tag in ("sz", "szCs"):
        el = get_or_make(rPr, tag)
        el.set(w("val"), str(size))

    if bold is not None:
        set_flag(rPr, "b", bold)
        set_flag(rPr, "bCs", bold)

    col = get_or_make(rPr, "color")
    col.set(w("val"), "000000")

    order_children(rPr, RPR_ORDER)


def style_paragraph(p, script: str, *, jc: str, spacing_after: int = 120,
                    line: int = LINE_SPACING, first_line: int | None = None,
                    keep_next: bool = False, page_break: bool = False,
                    space_before: int = 0) -> None:
    pPr = ppr_of(p)

    drop(pPr, "jc")
    drop(pPr, "spacing")
    drop(pPr, "ind")
    drop(pPr, "bidi")
    drop(pPr, "keepNext")
    drop(pPr, "keepLines")
    drop(pPr, "pageBreakBefore")
    drop(pPr, "widowControl")
    drop(pPr, "textAlignment")

    if script == "fa":
        etree.SubElement(pPr, w("bidi"))
    else:
        el = etree.SubElement(pPr, w("bidi"))
        el.set(w("val"), "0")

    if page_break:
        etree.SubElement(pPr, w("pageBreakBefore"))
    if keep_next:
        etree.SubElement(pPr, w("keepNext"))
        etree.SubElement(pPr, w("keepLines"))
    etree.SubElement(pPr, w("widowControl"))

    sp = etree.SubElement(pPr, w("spacing"))
    sp.set(w("before"), str(space_before))
    sp.set(w("after"), str(spacing_after))
    sp.set(w("line"), str(line))
    sp.set(w("lineRule"), "auto")

    ind = etree.SubElement(pPr, w("ind"))
    ind.set(w("left"), "0")
    ind.set(w("right"), "0")
    if first_line:
        ind.set(w("firstLine"), str(first_line))

    j = etree.SubElement(pPr, w("jc"))
    j.set(w("val"), jc)

    order_children(pPr, PPR_ORDER)


# --------------------------------------------------------------------------
# 4. classification of the source paragraphs
# --------------------------------------------------------------------------

# numbered heading, e.g. "1-1- مقدمه"  /  "2-1-2- نظریه های سالمندی"
HEADING_RE = re.compile(r"^\s*\d+(?:\s*-\s*\d+)*\s*-\s*\S")
TOC_ENTRY_RE = re.compile(r"^(?P<title>.*?)[\s.\u2026_]*(?P<page>\d+)\s*$")
CHAPTER_LINE_RE = re.compile(r"^\s*فصل\s+(اول|دوم|سوم|چهارم|پنجم)\b")

SPECIAL_HEADINGS = {
    "چکیده", "منابع", "فهرست مطالب", "فهرست جداول",
    "تعهد نامه اصالت رساله/پایان نامه", "تشکر و قدردانی", "تقدیم نامه:",
}


def is_heading(text: str) -> bool:
    t = text.strip()
    if not t or len(t) > 130:
        return False
    if t in SPECIAL_HEADINGS or CHAPTER_LINE_RE.match(t):
        return True
    return bool(HEADING_RE.match(t)) and len(t) < 130


# --------------------------------------------------------------------------
# 5. build the beautified document
# --------------------------------------------------------------------------

def rebuild(doc_xml_path: str, tail_paras: list[str]) -> etree._ElementTree:
    tree = etree.parse(doc_xml_path)
    body = tree.getroot()[0]
    blocks = list(body)

    # ---- locate the section break that separates front matter from body ----
    sect_para = None
    for b in blocks:
        if b.tag == w("p") and b.find(w("pPr/") + w("sectPr")) is not None:
            sect_para = b
            break
    if sect_para is None:
        for b in blocks:
            if b.tag == w("p"):
                pPr = b.find(w("pPr"))
                if pPr is not None and pPr.find(w("sectPr")) is not None:
                    sect_para = b
                    break

    # ---- index every block ----
    texts = {id(b): text_of(b).strip() for b in blocks}

    # remember how each paragraph was aligned in the original so that
    # centred material (title pages, table captions, dedications) stays centred
    orig_jc = {}
    for b in blocks:
        if b.tag != w("p"):
            continue
        pPr = b.find(w("pPr"))
        jc = pPr.find(w("jc")) if pPr is not None else None
        orig_jc[id(b)] = jc.get(w("val")) if jc is not None else None

    def find_para(pred, start=0, end=None):
        end = len(blocks) if end is None else end
        for i in range(start, end):
            b = blocks[i]
            if b.tag == w("p") and pred(texts[id(b)]):
                return i
        return None

    # anchors we need (indices into `blocks`)
    i_toc_start = find_para(lambda t: t == "فهرست مطالب")
    i_toc_tables = find_para(lambda t: t == "فهرست جداول")
    i_abstract = find_para(lambda t: t == "چکیده")

    def nonempty(i: int) -> bool:
        b = blocks[i]
        if b.tag == w("tbl"):
            return True
        return bool(texts[id(b)]) or b.find(".//" + w("pict")) is not None

    def has_content(i: int) -> bool:
        """Real content: a table, or a paragraph with actual words."""
        b = blocks[i]
        return b.tag == w("tbl") or bool(texts[id(b)])

    # A chapter cover page is the "فصل …" line plus the consecutive title
    # lines that follow it ("فصل دوم:" / "مبانی نظری و" / "پیشینه پژوهش").
    chapter_covers = []   # index of the first cover line
    cover_indices = set()  # every line that belongs to a cover page
    chapter_bodies = []   # first real paragraph of the chapter

    i = 0
    while i < len(blocks):
        b = blocks[i]
        t = texts[id(b)] if b.tag == w("p") else ""
        if (b.tag == w("p") and CHAPTER_LINE_RE.match(t) and len(t) <= 20
                and (i_abstract is None or i > i_abstract)):
            chapter_covers.append(i)
            j = i
            while j < len(blocks) and nonempty(j):
                cover_indices.add(j)
                j += 1
            # the chapter body starts at the first block that carries real
            # content; bare decorative text boxes still belong to the cover
            k = j
            while k < len(blocks) and not has_content(k):
                if nonempty(k):
                    cover_indices.add(k)
                k += 1
            if k < len(blocks):
                chapter_bodies.append(k)
            i = k
            continue
        i += 1

    i_refs = None
    for i in range(len(blocks) - 1, -1, -1):
        if blocks[i].tag == w("p") and texts[id(blocks[i])] == "منابع":
            i_refs = i
            break

    page_break_at = set()
    for i in (i_toc_start, i_toc_tables, i_refs):
        if i is not None:
            page_break_at.add(i)
    # requirement 4: each chapter cover title sits alone on one page
    # requirement 5: the chapter text starts at the top of the next page
    page_break_at.update(chapter_covers)
    page_break_at.update(chapter_bodies)

    # front-matter section headings each get their own page
    for name in ("تعهد نامه اصالت رساله/پایان نامه", "تشکر و قدردانی",
                 "تقدیم نامه:"):
        i = find_para(lambda t, n=name: t == n)
        if i is not None:
            page_break_at.add(i)

    toc_end = i_toc_tables if i_toc_tables else (i_abstract or len(blocks))
    toc_ranges = []
    if i_toc_start is not None:
        toc_ranges.append((i_toc_start + 1, toc_end))
    if i_toc_tables is not None:
        end = i_abstract if i_abstract else len(blocks)
        toc_ranges.append((i_toc_tables + 1, end))

    def in_toc(i: int) -> bool:
        return any(a <= i < b for a, b in toc_ranges)

    # ---- pass over every block -------------------------------------------
    new_children = []
    pending_break = False

    for i, b in enumerate(blocks):
        if b.tag == w("tbl"):
            style_table(b)
            new_children.append(b)
            continue
        if b.tag != w("p"):
            new_children.append(b)
            continue

        txt = texts[id(b)]
        has_pict = b.find(".//" + w("pict")) is not None
        is_sect = b is sect_para

        # drop the filler empty paragraphs – real page breaks replace them
        if not txt and not has_pict and not is_sect:
            continue

        if i in page_break_at:
            pending_break = True

        if is_sect and not txt:
            new_children.append(b)          # keep the section break marker
            continue

        script = script_of(txt) if txt else "fa"
        if script == "neutral":
            script = "fa"

        if in_toc(i):
            format_toc_entry(b, txt, page_break=pending_break)
            pending_break = False
            new_children.append(b)
            continue

        cover = i in cover_indices

        format_normal_paragraph(
            b, txt, script,
            cover=bool(cover),
            heading=is_heading(txt),
            page_break=pending_break,
            has_pict=has_pict,
            centred=orig_jc.get(id(b)) == "center",
        )
        pending_break = False
        new_children.append(b)

    # rebuild body
    for c in list(body):
        body.remove(c)
    for c in new_children:
        body.append(c)

    # ---- append the English pages Spire truncated -------------------------
    append_english_tail(body, tail_paras)

    # ---- final section properties ----------------------------------------
    fix_sect_prs(body)
    return tree


def style_table(tbl) -> None:
    """Centre tables, keep them on one page, and shape their text."""
    tblPr = tbl.find(w("tblPr"))
    if tblPr is None:
        tblPr = etree.Element(w("tblPr"))
        tbl.insert(0, tblPr)
    drop(tblPr, "jc")
    j = etree.SubElement(tblPr, w("jc"))
    j.set(w("val"), "center")
    if tblPr.find(w("bidiVisual")) is None:
        etree.SubElement(tblPr, w("bidiVisual"))

    for tr in tbl.iter(w("tr")):
        trPr = tr.find(w("trPr"))
        if trPr is None:
            trPr = etree.Element(w("trPr"))
            tr.insert(0, trPr)
        if trPr.find(w("cantSplit")) is None:
            etree.SubElement(trPr, w("cantSplit"))

    for p in tbl.iter(w("p")):
        txt = text_of(p).strip()
        script = script_of(txt)
        if script == "neutral":
            script = "fa"
        style_paragraph(p, script, jc="center", spacing_after=0, line=240)
        for r in p.findall(w("r")):
            rt = run_text(r)
            s = script_of(rt)
            if s == "neutral":
                s = script
            style_run(r, s, size=24, bold=None)


def format_toc_entry(p, txt: str, *, page_break: bool) -> None:
    """
    Rebuild a table-of-contents line as:  title <tab> page-number
    with a right-aligned dot-leader tab stop at the text-width, so every
    page number lines up in a single column.
    """
    m = TOC_ENTRY_RE.match(txt)
    chapter_line = CHAPTER_LINE_RE.match(txt.strip()) and not m

    if m and m.group("title").strip():
        title = m.group("title").rstrip(" .\u2026_")
        page = m.group("page")
    else:
        title, page = txt.rstrip(" .\u2026_"), None

    level = 1
    hm = re.match(r"^\s*(\d+(?:\s*-\s*\d+)*)\s*-", title)
    if hm:
        level = len(re.findall(r"\d+", hm.group(1)))

    bold = bool(chapter_line) or level == 1

    # wipe the old runs
    for r in p.findall(w("r")):
        p.remove(r)
    for h in p.findall(w("hyperlink")):
        p.remove(h)

    pPr = ppr_of(p)
    drop(pPr, "tabs")
    drop(pPr, "numPr")
    drop(pPr, "pStyle")

    style_paragraph(
        p, "fa",
        jc="center" if chapter_line else "right",
        spacing_after=60, line=276,
        page_break=page_break,
    )

    if not chapter_line:
        tabs = etree.SubElement(pPr, w("tabs"))
        tab = etree.SubElement(tabs, w("tab"))
        tab.set(w("val"), "right")
        tab.set(w("leader"), "dot")
        tab.set(w("pos"), str(TEXT_WIDTH))
        # indent deeper levels away from the right (start) margin
        ind = pPr.find(w("ind"))
        if ind is not None and level > 1:
            ind.set(w("right"), str(min(level - 1, 3) * 240))
        order_children(pPr, PPR_ORDER)

    r = etree.SubElement(p, w("r"))
    t = etree.SubElement(r, w("t"))
    t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t.text = title.strip()
    style_run(r, "fa", size=BODY_SZ, bold=bold)

    if page and not chapter_line:
        rt = etree.SubElement(p, w("r"))
        etree.SubElement(rt, w("tab"))
        style_run(rt, "fa", size=BODY_SZ, bold=bold)

        rp = etree.SubElement(p, w("r"))
        tp = etree.SubElement(rp, w("t"))
        tp.text = page
        style_run(rp, "fa", size=BODY_SZ, bold=bold)


def format_normal_paragraph(p, txt: str, script: str, *, cover: bool,
                            heading: bool, page_break: bool,
                            has_pict: bool, centred: bool = False) -> None:
    pPr = ppr_of(p)
    drop(pPr, "pStyle")
    drop(pPr, "tabs")

    if centred and not cover and not heading:
        # keep centred material centred (title pages, captions, dedication)
        style_paragraph(p, script, jc="center", spacing_after=120,
                        line=276, page_break=page_break)
        for r in p.iter(w("r")):
            rt = run_text(r)
            s = script_of(rt)
            if s == "neutral":
                s = script
            style_run(r, s, size=BODY_SZ, bold=None)
        return

    if cover:
        style_paragraph(p, script, jc="center", spacing_after=240,
                        line=276, page_break=page_break, keep_next=True,
                        space_before=2400 if page_break else 0)
        size, bold, font = CHAPTER_SZ, True, PERSIAN_TITLE_FONT
    elif heading:
        style_paragraph(p, script, jc="right" if script == "fa" else "left",
                        spacing_after=100, line=276, keep_next=True,
                        page_break=page_break, space_before=240)
        size, bold, font = HEAD_SZ, True, PERSIAN_TITLE_FONT
    elif has_pict and not txt:
        style_paragraph(p, script, jc="center", spacing_after=120,
                        page_break=page_break)
        size, bold, font = BODY_SZ, None, PERSIAN_FONT
    else:
        jc = "both"
        style_paragraph(p, script, jc=jc, spacing_after=120,
                        first_line=397 if script == "fa" else 397,
                        page_break=page_break)
        if script == "en":
            # requirement 2: Latin text is left aligned
            j = pPr.find(w("jc"))
            j.set(w("val"), "left")
        size, bold, font = BODY_SZ, None, PERSIAN_FONT

    for r in p.iter(w("r")):
        rt = run_text(r)
        s = script_of(rt)
        if s == "neutral":
            s = script
        style_run(r, s, size=size, bold=bold, font_fa=font)


def append_english_tail(body, tail: list[str]) -> None:
    """Add back the English ABSTRACT page and the English title page."""
    if not tail:
        return

    # split: everything up to (and including) the Keywords line is the
    # abstract page, the rest is the English title page.
    kw = next((i for i, t in enumerate(tail)
               if t.strip().lower().startswith("keywords")), None)
    abstract = tail[:kw + 1] if kw is not None else tail
    title_page = tail[kw + 1:] if kw is not None else []

    def add(text: str, *, jc: str, size: int, bold: bool,
            page_break: bool = False, before: int = 0, after: int = 120,
            justify: bool = False):
        p = etree.SubElement(body, w("p"))
        style_paragraph(p, "en", jc="both" if justify else jc,
                        spacing_after=after, line=LINE_SPACING,
                        page_break=page_break, space_before=before)
        if justify:
            ppr_of(p).find(w("jc")).set(w("val"), "both")
        r = etree.SubElement(p, w("r"))
        t = etree.SubElement(r, w("t"))
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
        t.text = text
        style_run(r, "en", size=size, bold=bold)
        return p

    first = True
    for line in abstract:
        s = line.strip()
        if not s:
            continue
        if s.upper() == "ABSTRACT":
            add(s, jc="center", size=HEAD_SZ, bold=True,
                page_break=True, after=240)
            first = False
        elif s.lower().startswith("keywords"):
            add(s, jc="left", size=BODY_SZ, bold=False, before=240)
        else:
            add(s, jc="left", size=BODY_SZ, bold=False, justify=True)
        first = False

    if title_page:
        started = False
        for line in title_page:
            s = line.strip()
            if not s:
                continue
            big = s in ("Payame Noor University",)
            titleish = s in ("Title", "Supervisor", "Author", "Master's Thesis")
            add(
                s,
                jc="center",
                size=36 if big else (CHAPTER_SZ // 2 if titleish else BODY_SZ),
                bold=big or titleish or "Relationship between" in s,
                page_break=not started,
                before=600 if not started else 0,
                after=160,
            )
            started = True


def fix_sect_prs(body) -> None:
    """Normal margins, A4, RTL section, sane footnote handling."""
    sects = list(body.iter(w("sectPr")))
    for sp in sects:
        drop(sp, "pgSz")
        drop(sp, "pgMar")
        drop(sp, "pgBorders")
        drop(sp, "cols")
        drop(sp, "docGrid")

        sz = etree.SubElement(sp, w("pgSz"))
        sz.set(w("w"), str(PAGE_W))
        sz.set(w("h"), str(PAGE_H))
        sz.set(w("code"), "9")

        mar = etree.SubElement(sp, w("pgMar"))
        for k, v in (("top", MARGIN), ("right", MARGIN), ("bottom", MARGIN),
                     ("left", MARGIN), ("header", 708), ("footer", 708),
                     ("gutter", 0)):
            mar.set(w(k), str(v))

        cols = etree.SubElement(sp, w("cols"))
        cols.set(w("space"), "708")

        if sp.find(w("bidi")) is None:
            etree.SubElement(sp, w("bidi"))

        grid = etree.SubElement(sp, w("docGrid"))
        grid.set(w("linePitch"), "360")

        order = ["footnotePr", "endnotePr", "type", "pgSz", "pgMar",
                 "paperSrc", "pgBorders", "lnNumType", "pgNumType", "cols",
                 "formProt", "vAlign", "noEndnote", "titlePg", "textDirection",
                 "bidi", "rtlGutter", "docGrid", "printerSettings"]
        order_children(sp, order)


# --------------------------------------------------------------------------
# 6. styles.xml / settings.xml touch-ups
# --------------------------------------------------------------------------

def fix_styles(path: str) -> None:
    tree = etree.parse(path)
    root = tree.getroot()

    # docDefaults -> Persian body font, 14 pt, 1.5 line spacing
    dd = root.find(w("docDefaults"))
    if dd is not None:
        rpd = dd.find(w("rPrDefault"))
        if rpd is not None:
            rPr = get_or_make(rpd, "rPr")
            fonts = get_or_make(rPr, "rFonts")
            fonts.set(w("ascii"), LATIN_FONT_FALLBACK)
            fonts.set(w("hAnsi"), LATIN_FONT_FALLBACK)
            fonts.set(w("cs"), PERSIAN_FONT)
            for tag in ("sz", "szCs"):
                el = get_or_make(rPr, tag)
                el.set(w("val"), str(BODY_SZ))
            order_children(rPr, RPR_ORDER)

    for st in root.findall(w("style")):
        sid = st.get(w("styleId"))
        if sid == "Normal":
            pPr = get_or_make(st, "pPr")
            drop(pPr, "spacing")
            sp = etree.SubElement(pPr, w("spacing"))
            sp.set(w("after"), "120")
            sp.set(w("line"), str(LINE_SPACING))
            sp.set(w("lineRule"), "auto")
            if pPr.find(w("bidi")) is None:
                etree.SubElement(pPr, w("bidi"))
            order_children(pPr, PPR_ORDER)

            rPr = get_or_make(st, "rPr")
            fonts = get_or_make(rPr, "rFonts")
            fonts.set(w("cs"), PERSIAN_FONT)
            for tag in ("sz", "szCs"):
                el = get_or_make(rPr, tag)
                el.set(w("val"), str(BODY_SZ))
            set_flag(rPr, "rtl", True)
            order_children(rPr, RPR_ORDER)

    tree.write(path, xml_declaration=True, encoding="UTF-8", standalone=True)


def fix_settings(path: str) -> None:
    tree = etree.parse(path)
    root = tree.getroot()

    # a sane default tab stop and proper bidi handling
    for tag, val in (("defaultTabStop", "720"),):
        el = root.find(w(tag))
        if el is None:
            el = etree.Element(w(tag))
            root.insert(0, el)
        el.set(w("val"), val)

    for tag in ("evenAndOddHeaders",):
        drop(root, tag)

    tree.write(path, xml_declaration=True, encoding="UTF-8", standalone=True)


# --------------------------------------------------------------------------
# 7. main
# --------------------------------------------------------------------------

def main() -> None:
    tmp = tempfile.mkdtemp(prefix="beautify-")
    try:
        converted = os.path.join(tmp, "converted.docx")
        print("• converting the legacy .doc …")
        spire_convert(SRC_DOC, converted)

        print("• recovering the truncated English pages from the raw .doc …")
        raw = raw_doc_paragraphs(SRC_DOC)
        kw = next((i for i, t in enumerate(raw)
                   if t.strip().upper() == "ABSTRACT"), None)
        tail = raw[kw:] if kw is not None else []
        tail = [re.sub(r"[\x00-\x08\x0b-\x1f]", "", t) for t in tail]

        work = os.path.join(tmp, "work")
        with zipfile.ZipFile(converted) as z:
            z.extractall(work)

        doc_xml = os.path.join(work, "word", "document.xml")
        print("• rebuilding the document …")
        tree = rebuild(doc_xml, tail)
        tree.write(doc_xml, xml_declaration=True, encoding="UTF-8",
                   standalone=True)

        fix_styles(os.path.join(work, "word", "styles.xml"))
        fix_settings(os.path.join(work, "word", "settings.xml"))

        print(f"• writing {os.path.basename(OUT_DOCX)} …")
        if os.path.exists(OUT_DOCX):
            os.remove(OUT_DOCX)
        with zipfile.ZipFile(OUT_DOCX, "w", zipfile.ZIP_DEFLATED) as z:
            # [Content_Types].xml must come first
            ct = os.path.join(work, "[Content_Types].xml")
            z.write(ct, "[Content_Types].xml")
            for root_dir, _, files in os.walk(work):
                for f in files:
                    full = os.path.join(root_dir, f)
                    rel = os.path.relpath(full, work).replace(os.sep, "/")
                    if rel == "[Content_Types].xml":
                        continue
                    z.write(full, rel)
        print("  done →", OUT_DOCX)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
