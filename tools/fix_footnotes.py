#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fix_footnotes.py
================

Audit and repair the footnotes of «Payannameh_Fatemeh.Bayat-B-v2.docx»
(the manually corrected, beautified thesis) and emit
«Payannameh_Fatemeh.Bayat-B-v3.docx».

Only the TEXT INSIDE FOOTNOTES is touched. Paragraph layout, styles, fonts,
page breaks, tables, section properties and the body text of the thesis are
left byte-for-byte identical, so the manual formatting work is preserved.

Every correction below was verified against the primary literature.
"""

from __future__ import annotations

import copy
import os
import re
import shutil
import zipfile

from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
w = lambda t: f"{{{W}}}{t}"  # noqa: E731

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(REPO, "Payannameh_Fatemeh.Bayat-B-v2.docx")
DST = os.path.join(REPO, "Payannameh_Fatemeh.Bayat-B-v3.docx")

# --------------------------------------------------------------------------
# The correction table.
#
#   footnote id -> (corrected text, kind, evidence)
#
# kind:  'garbled'  the Latin name was wrong/unreadable
#        'stray'    a stray list digit had leaked into the note
#        'order'    words in the right set but wrong order
#        'spacing'  purely cosmetic spacing/diacritics
# --------------------------------------------------------------------------
FIXES: dict[int, tuple[str, str, str]] = {
    8: ("Gerontology", "stray",
        "شمارهٔ «۱» از فهرست چسبیده بود؛ خود واژه درست است."),
    16: ("Roger Gould", "garbled",
         "متن «راجر گولد» است؛ Gold غلط املایی Gould است. "
         "Gould, R. L. (1978). Transformations: Growth and Change in "
         "Adult Life."),
    17: ("Daniel Levinson", "stray",
         "شمارهٔ «۳» چسبیده بود. Levinson, D. J. (1978). "
         "The Seasons of a Man's Life."),
    18: ("K. Warner Schaie", "garbled",
         "«شی» در عبارت «نظریه لوینسون و شی» همان Schaie است؛ "
         "«SHAie» با شمارهٔ ۴ چسبیده ثبت شده بود. "
         "Schaie, K. W. — مطالعهٔ طولی سیاتل."),
    19: ("Erik Erikson", "stray",
         "شمارهٔ «۵» چسبیده بود. Erikson, E. H. (1982). "
         "The Life Cycle Completed."),
    11: ("Nikolich-Žugich", "spacing",
         "نام کامل نویسنده؛ در متن «نیکولاس» آمده که املای نادرست است."),
    12: ("Fülöp", "spacing", "املای صحیح با دیاکریتیک مجارستانی."),
    33: ("Greenberg, Pyszczynski & Solomon", "garbled",
         "بنیان‌گذاران نظریه مدیریت وحشت (TMT)؛ ذکر هر سه نام "
         "استاندارد ارجاع به این نظریه است."),
    51: ("American Psychiatric Association", "order",
         "ترتیب واژه‌ها معکوس ثبت شده بود "
         "(«Association American Psychiatric»)."),
    65: ("Wang & Zhao", "spacing", "نبود فاصله پیش از «Zhao»."),
    67: ("Yonker, Schnabelrauch & DeHaan", "garbled",
         "املای صحیح: Yonker, J. E., Schnabelrauch, C. A., & DeHaan, "
         "L. G. (2012). Journal of Adolescence, 35(2), 299–314."),
    70: ("Zarina Mat Saad, Zulkarnain A. Hatta & Noriah Mohamad",
         "garbled",
         "نام‌ها به‌هم‌ریخته و ناقص بود. مقاله: Saad, Z. M., Hatta, "
         "Z. A., & Mohamad, N. (2010). The Impact of Spiritual "
         "Intelligence on the Health of the Elderly in Malaysia. "
         "Asian Social Work and Policy Review, 4(2), 84–97."),
    73: ("Jain & Purohit", "garbled",
         "با حرف کوچک و ناقص («gin») ثبت شده بود. Jain, M., & Purohit, "
         "P. (2006). Journal of the Indian Academy of Applied "
         "Psychology, 32(3), 227–233."),
    75: ("Thorson & Powell", "garbled",
         "«دورسون و پاوول» در واقع Thorson و Powell است. مقاله: "
         "Thorson, J. A., & Powell, F. C. (1988). Elements of death "
         "anxiety and meanings of death. Journal of Clinical "
         "Psychology, 44(5), 691–701. (عنوانی که در متن آمده)"),
    76: ("Moreira-Almeida & Koenig", "garbled",
         "«Moreiva & Almeida» یک نفر را دو نفر کرده بود؛ نام خانوادگی "
         "مرکب Moreira-Almeida است و نویسندهٔ دوم Koenig. مقاله: "
         "Moreira-Almeida, A., Lotufo Neto, F., & Koenig, H. G. "
         "(2006). Religiousness and mental health: a review. "
         "Revista Brasileira de Psiquiatria, 28(3), 242–250."),
}

# Footnotes that the Excel sheet flagged as doubtful but which are in fact
# already correct in v2 — recorded so the audit report can say so explicitly.
CONFIRMED_OK: dict[int, str] = {
    50: "Maunder & Hunter — درست است. Maunder, R. G., & Hunter, J. J. "
        "(2001). Attachment and psychosomatic medicine. Psychosomatic "
        "Medicine, 63(4), 556–567. (فایل اکسل به اشتباه «Main & Hunter» "
        "حدس زده بود.)",
    71: "Chlan, Zebracki & Vogel — درست است. Chlan, K. M., Zebracki, K., "
        "& Vogel, L. C. (2011). Spirituality and life satisfaction in "
        "adults with pediatric-onset spinal cord injury. Spinal Cord, "
        "49(3), 371–375.",
    79: "Tomer & Eliason — درست است. Tomer, A., & Eliason, G. (2000). "
        "Attitudes about life and death: Toward a comprehensive model "
        "of death anxiety.",
    68: "Zeng — نام کوتاه اما قابل قبول؛ منبع دقیق در فهرست منابع "
        "پایان‌نامه موجود نیست و باید تکمیل شود.",
    81: "Krejcie & Morgan — درست است (املای صحیح Krejcie، نه Krejci). "
        "Krejcie, R. V., & Morgan, D. W. (1970). Educational and "
        "Psychological Measurement, 30(3), 607–610.",
}


def footnote_paragraph_runs(note):
    """Yield the <w:r> elements of a footnote that carry visible text."""
    for r in note.iter(w("r")):
        if r.find(w("footnoteRef")) is not None:
            continue
        if r.find(w("t")) is not None:
            yield r


def ensure_footnote_ref(note) -> bool:
    """
    Notes 8, 17, 18 and 19 carry a HARD-TYPED digit ("1", "3", "4", "5")
    instead of Word's automatic footnote-number field, so their numbers do
    not renumber and did not match the marker in the body text. Give them a
    real <w:footnoteRef/> like every other note.

    Returns True when a mark had to be inserted.
    """
    if note.find(".//" + w("footnoteRef")) is not None:
        return False

    para = note.find(w("p"))
    if para is None:
        return False

    # model the new run on an existing one so the font matches
    template = None
    for r in note.iter(w("r")):
        if r.find(w("rPr")) is not None:
            template = r
            break

    ref_run = etree.Element(w("r"))
    rPr = etree.SubElement(ref_run, w("rPr"))
    style = etree.SubElement(rPr, w("rStyle"))
    style.set(w("val"), "FootnoteReference")
    if template is not None:
        tf = template.find(w("rPr")).find(w("rFonts"))
        if tf is not None:
            rPr.append(copy.deepcopy(tf))
    etree.SubElement(ref_run, w("footnoteRef"))

    # insert before the first content run, after <w:pPr>
    anchor = para.find(w("pPr"))
    if anchor is not None:
        anchor.addnext(ref_run)
    else:
        para.insert(0, ref_run)
    return True


def set_footnote_text(note, new_text: str) -> None:
    """
    Replace a footnote's visible text with `new_text`, keeping the
    footnote-reference mark and the original run formatting intact.
    """
    runs = list(footnote_paragraph_runs(note))
    if not runs:
        return
    first = runs[0]
    ts = first.findall(w("t"))
    ts[0].text = " " + new_text
    ts[0].set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    for extra in ts[1:]:
        extra.text = ""
    for r in runs[1:]:
        for t in r.findall(w("t")):
            t.text = ""


def main() -> None:
    work = "/tmp/fnfix"
    shutil.rmtree(work, ignore_errors=True)
    with zipfile.ZipFile(SRC) as z:
        z.extractall(work)

    path = os.path.join(work, "word", "footnotes.xml")
    with open(path, "rb") as fh:
        tree = etree.fromstring(fh.read())

    before, after, applied, marks_added = {}, {}, [], []
    for note in tree.findall(w("footnote")):
        if note.get(w("type")):
            continue
        fid = int(note.get(w("id")))
        old = "".join(t.text or "" for t in note.iter(w("t"))).strip()
        before[fid] = old
        if ensure_footnote_ref(note):
            marks_added.append(fid)
        if fid in FIXES:
            new, kind, why = FIXES[fid]
            if old != new:
                set_footnote_text(note, new)
                applied.append((fid, old, new, kind, why))
        after[fid] = "".join(
            t.text or "" for t in note.iter(w("t"))).strip()

    with open(path, "wb") as fh:
        fh.write(etree.tostring(tree, xml_declaration=True,
                                encoding="UTF-8", standalone=True))

    if os.path.exists(DST):
        os.remove(DST)
    with zipfile.ZipFile(DST, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(work, "[Content_Types].xml"),
                "[Content_Types].xml")
        for root_dir, _, files in os.walk(work):
            for f in files:
                full = os.path.join(root_dir, f)
                rel = os.path.relpath(full, work).replace(os.sep, "/")
                if rel != "[Content_Types].xml":
                    z.write(full, rel)

    print(f"footnotes in document : {len(before)}")
    print(f"corrections applied   : {len(applied)}")
    print(f"auto-number marks fixed: {marks_added}\n")
    for fid, old, new, kind, _ in applied:
        print(f"  [{fid:>2}] {kind:<8} {old!r}  ->  {new!r}")
    print(f"\nwritten: {DST}")

    import json
    json.dump(
        {"applied": [
            {"id": i, "old": o, "new": n, "kind": k, "why": y}
            for i, o, n, k, y in applied],
         "confirmed_ok": CONFIRMED_OK,
         "all_after": after},
        open("/tmp/fn_report.json", "w"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
