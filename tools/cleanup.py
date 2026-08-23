#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
cleanup.py — post-processing pass over the beautified thesis.

Fixes three classes of defect found by auditing the original .doc:

A. AI / tooling fingerprints
   - "?utm_source=chatgpt.com" query tags on four reference hyperlinks
     (both in the .rels targets and in any visible link text)
   - document metadata (author "data system", lastModifiedBy, company)
   - rsid edit-session fingerprints + proofState
   - the duplicated-URL runs the .doc converter emitted

B. Persian orthography normalisation (character level, wording untouched)
   - Arabic yeh  ي (U+064A) -> Persian yeh  ی (U+06CC)
   - Arabic kaf  ك (U+0643) -> Persian kaf  ک (U+06A9)
   - Arabic teh marbuta ة   -> ه
   - the .doc's optional-hyphen (U+001F) used as a half-space -> ZWNJ (U+200C)
   - collapsed double spaces, stray space before ، ؛ . :

C. Clear typographic slips (explicit, auditable list only)
"""

from __future__ import annotations

import os
import re
import shutil
import zipfile

from lxml import etree

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
w = lambda t: f"{{{W}}}{t}"  # noqa: E731

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCX = os.path.join(REPO, "PayannamehFatemeh.Bayat-Beautified.docx")

# ---------------------------------------------------------------- A. AI traces
UTM_RE = re.compile(r"[?&]utm_source=chatgpt\.com", re.I)

# ------------------------------------------------- B. orthography normalisation
CHAR_MAP = {
    "\u064a": "\u06cc",   # ي -> ی
    "\u0643": "\u06a9",   # ك -> ک
    "\u0629": "\u0647",   # ة -> ه
    "\u001f": "\u200c",   # optional hyphen used as half-space -> ZWNJ
}
# NOTE: tanween (ً) is deliberately preserved — it is correct Persian
# orthography in Arabic loanwords such as «قبلاً», «صرفاً», «عمدتاً».

# ------------------------------------------------------- C. explicit typo fixes
TYPO_FIXES = [
    ("حاصل تحقیق و پژوه انجام شده", "حاصل تحقیق و پژوهش انجام شده"),
    ("کاهش اضطاب سلامت", "کاهش اضطراب سلامت"),
    ("پیشینه پزوهش", "پیشینه پژوهش"),
    ("یافته های های توصیفی", "یافته های توصیفی"),
    ("بحث ونتیجه گیری", "بحث و نتیجه گیری"),
    ("هوش معنوی واضطراب سلامتی", "هوش معنوی و اضطراب سلامتی"),
    # heading numbers that contradict their own chapter / the TOC
    ("5-5-2- پيشنهادهای کاربردی", "5-3-2- پیشنهادهای کاربردی"),
    ("۵-۵-۲- پيشنهادهای کاربردی", "۵-۳-۲- پیشنهادهای کاربردی"),
    ("2-3-3- پرسشنامه اضطراب مرگ", "3-3-2- پرسشنامه اضطراب مرگ"),
    ("۲-۳-۳- پرسشنامه اضطراب مرگ", "۳-۳-۲- پرسشنامه اضطراب مرگ"),
    ("4-3- روش اجرای پژوهش", "3-4- روش اجرای پژوهش"),
    ("۴-۳- روش اجرای پژوهش", "۳-۴- روش اجرای پژوهش"),
    ("5-3- روش تجزیه و تحلیل", "3-5- روش تجزیه و تحلیل"),
    ("۵-۳- روش تجزیه و تحلیل", "۳-۵- روش تجزیه و تحلیل"),
]

stats = {k: 0 for k in (
    "utm", "dup_url", "yeh", "kaf", "teh", "zwnj", "dbl_space",
    "space_punct", "typos", "rsid", "meta")}


def fix_text(s: str) -> str:
    """Character-level normalisation of one <w:t> value."""
    if not s:
        return s
    stats["yeh"] += s.count("\u064a")
    stats["kaf"] += s.count("\u0643")
    stats["teh"] += s.count("\u0629")
    stats["zwnj"] += s.count("\u001f")
    for a, b in CHAR_MAP.items():
        s = s.replace(a, b)

    before = s
    s = re.sub(r"[ \t]{2,}", " ", s)
    stats["dbl_space"] += (before != s)

    before = s
    s = re.sub(r"\s+([،؛؟!])", r"\1", s)        # no space before Persian comma
    s = re.sub(r"([،؛])(?=[^\s\u200c»)\]])", r"\1 ", s)  # space after it
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r"\s+\)", ")", s)
    stats["space_punct"] += (before != s)

    if UTM_RE.search(s):
        s = UTM_RE.sub("", s)
        stats["utm"] += 1
    return s


def strip_duplicate_urls(body) -> None:
    """
    The .doc->docx converter emitted the hyperlink target twice for two
    references, e.g.  ... 3408. <url>"<url>
    Drop the stray quote + repeated copy.
    """
    for p in body.iter(w("p")):
        runs = [r for r in p.iter(w("r"))]
        texts = ["".join(t.text or "" for t in r.iter(w("t"))) for r in runs]
        for i in range(len(runs) - 2):
            a, mid, b = texts[i], texts[i + 1], texts[i + 2]
            if (a.startswith("http") and mid.strip() in ('"', '".', '"')
                    and b.startswith("http") and a.split('"')[0] in b):
                for r in (runs[i + 1], runs[i + 2]):
                    r.getparent().remove(r)
                stats["dup_url"] += 1
                break
            # variant: the quote is glued to the second copy
            if (a.startswith("http") and mid.startswith('"http')
                    and mid.lstrip('"').rstrip(".").startswith(a.rstrip("."))):
                runs[i + 1].getparent().remove(runs[i + 1])
                stats["dup_url"] += 1
                break


def apply_typos(body) -> None:
    """
    Apply the explicit typo list. Runs are fragmented, so operate on the
    paragraph's concatenated text and, when it changes, push the whole
    corrected string into the first run and blank the rest.
    """
    for p in body.iter(w("p")):
        tnodes = [t for r in p.findall(w("r")) for t in r.findall(w("t"))]
        if not tnodes:
            continue
        joined = "".join(t.text or "" for t in tnodes)
        fixed = joined
        for bad, good in TYPO_FIXES:
            if bad in fixed:
                fixed = fixed.replace(bad, good)
        if fixed != joined:
            stats["typos"] += 1
            tnodes[0].text = fixed
            tnodes[0].set(
                "{http://www.w3.org/XML/1998/namespace}space", "preserve")
            for t in tnodes[1:]:
                t.text = ""


def scrub_part(data: bytes) -> bytes:
    """Normalise every <w:t> in a document part."""
    root = etree.fromstring(data)
    for t in root.iter(w("t")):
        t.text = fix_text(t.text)
    for t in root.iter(w("instrText")):
        if t.text and UTM_RE.search(t.text):
            t.text = UTM_RE.sub("", t.text)
            stats["utm"] += 1
    body = root[0] if len(root) else root
    strip_duplicate_urls(root)
    apply_typos(root)
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8",
                          standalone=True)


def scrub_rsids(data: bytes, is_settings: bool) -> bytes:
    """Remove revision-session ids (they leak the editing history)."""
    root = etree.fromstring(data)
    if is_settings:
        for tag in ("rsids", "proofState"):
            for el in root.findall(w(tag)):
                stats["rsid"] += len(el) if tag == "rsids" else 1
                root.remove(el)
    else:
        for el in root.iter():
            for k in list(el.attrib):
                if "rsid" in k.lower():
                    del el.attrib[k]
                    stats["rsid"] += 1
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8",
                          standalone=True)


CORE_XML = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/\
metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" \
xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/\
dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\
<dc:title>رابطه هوش معنوی و اضطراب سلامتی با اضطراب مرگ سالمندان</dc:title>\
<dc:creator>فاطمه بیات</dc:creator><cp:lastModifiedBy>فاطمه بیات\
</cp:lastModifiedBy><cp:revision>1</cp:revision></cp:coreProperties>"""


def scrub_app(data: bytes) -> bytes:
    root = etree.fromstring(data)
    ns = "{http://schemas.openxmlformats.org/officeDocument/2006/" \
         "extended-properties}"
    for tag in ("Company", "Manager", "Template", "Application",
                "AppVersion", "TotalTime"):
        for el in root.findall(ns + tag):
            root.remove(el)
            stats["meta"] += 1
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8",
                          standalone=True)


def main() -> None:
    work = "/tmp/cleanup-work"
    shutil.rmtree(work, ignore_errors=True)
    with zipfile.ZipFile(DOCX) as z:
        z.extractall(work)

    # --- A: hyperlink targets in the .rels -----------------------------------
    rels = os.path.join(work, "word", "_rels", "document.xml.rels")
    raw = open(rels, encoding="utf-8").read()
    n = len(UTM_RE.findall(raw))
    if n:
        open(rels, "w", encoding="utf-8").write(UTM_RE.sub("", raw))
        stats["utm"] += n

    # --- A+B+C: text-bearing parts -------------------------------------------
    for rel in ("word/document.xml", "word/footnotes.xml", "word/footer1.xml",
                "word/endnotes.xml", "word/header1.xml"):
        path = os.path.join(work, *rel.split("/"))
        if os.path.exists(path):
            with open(path, "rb") as fh:
                data = fh.read()
            out = scrub_part(data)
            with open(path, "wb") as fh:
                fh.write(out)

    # --- A: rsids ------------------------------------------------------------
    for rel, is_set in (("word/document.xml", False),
                        ("word/settings.xml", True),
                        ("word/styles.xml", False)):
        path = os.path.join(work, *rel.split("/"))
        if os.path.exists(path):
            with open(path, "rb") as fh:
                data = fh.read()
            out = scrub_rsids(data, is_set)
            with open(path, "wb") as fh:
                fh.write(out)

    # --- A: metadata ---------------------------------------------------------
    with open(os.path.join(work, "docProps", "core.xml"),
              "w", encoding="utf-8") as fh:
        fh.write(CORE_XML)
    stats["meta"] += 1
    app = os.path.join(work, "docProps", "app.xml")
    if os.path.exists(app):
        with open(app, "rb") as fh:
            data = fh.read()
        out = scrub_app(data)
        with open(app, "wb") as fh:
            fh.write(out)

    # --- repack --------------------------------------------------------------
    tmp = DOCX + ".tmp"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(work, "[Content_Types].xml"),
                "[Content_Types].xml")
        for root_dir, _, files in os.walk(work):
            for f in files:
                full = os.path.join(root_dir, f)
                rel = os.path.relpath(full, work).replace(os.sep, "/")
                if rel != "[Content_Types].xml":
                    z.write(full, rel)
    os.replace(tmp, DOCX)

    print("cleanup summary")
    for k, v in stats.items():
        print(f"  {k:12} {v}")


if __name__ == "__main__":
    main()
