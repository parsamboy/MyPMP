# -*- coding: utf-8 -*-
"""
استخراج متن از فایل‌های .doc (Word 97-2003, OLE2) بدون نیاز به LibreOffice.
پیاده‌سازی FIB + piece table (CLX) + محدوده‌های متنی (main / footnotes).
"""
import struct
import olefile


class Doc:
    def __init__(self, path):
        self.ole = olefile.OleFileIO(path)
        self.wd = self.ole.openstream("WordDocument").read()
        self._fib()
        tbl = "1Table" if self.fWhichTblStm else "0Table"
        self.tbl = self.ole.openstream(tbl).read()
        self._piece_table()

    # ---------------- FIB ----------------
    def _fib(self):
        wd = self.wd
        self.wIdent = struct.unpack_from("<H", wd, 0)[0]
        self.nFib = struct.unpack_from("<H", wd, 2)[0]
        flags = struct.unpack_from("<H", wd, 10)[0]
        self.fWhichTblStm = (flags >> 9) & 1
        # FibRgLw97 starts after base(32) + csw(2) + rgw97(28) + cslw(2)
        base = 32 + 2 + 28 + 2
        self.ccpText = struct.unpack_from("<i", wd, base + 12)[0]
        self.ccpFtn = struct.unpack_from("<i", wd, base + 16)[0]
        self.ccpHdd = struct.unpack_from("<i", wd, base + 20)[0]
        self.ccpMcr = struct.unpack_from("<i", wd, base + 24)[0]
        self.ccpAtn = struct.unpack_from("<i", wd, base + 28)[0]
        self.ccpEdn = struct.unpack_from("<i", wd, base + 32)[0]
        self.ccpTxbx = struct.unpack_from("<i", wd, base + 36)[0]
        self.ccpHdrTxbx = struct.unpack_from("<i", wd, base + 40)[0]
        # FibRgFcLcb97
        cbRgFcLcb_off = base + 88
        self.cbRgFcLcb = struct.unpack_from("<H", wd, cbRgFcLcb_off)[0]
        self.fcLcb = cbRgFcLcb_off + 2
        self.ccpAll = (self.ccpText + self.ccpFtn + self.ccpHdd + self.ccpMcr +
                       self.ccpAtn + self.ccpEdn + self.ccpTxbx + self.ccpHdrTxbx)

    def _fclcb(self, idx):
        off = self.fcLcb + idx * 8
        return struct.unpack_from("<II", self.wd, off)

    # ---------------- piece table ----------------
    def _piece_table(self):
        fcClx, lcbClx = self._fclcb(33)  # fcClx is entry 33
        clx = self.tbl[fcClx:fcClx + lcbClx]
        i = 0
        pcdt = None
        while i < len(clx):
            t = clx[i]
            if t == 1:  # Prc
                cb = struct.unpack_from("<h", clx, i + 1)[0]
                i += 3 + cb
            elif t == 2:  # Pcdt
                lcb = struct.unpack_from("<I", clx, i + 1)[0]
                pcdt = clx[i + 5:i + 5 + lcb]
                break
            else:
                i += 1
        if pcdt is None:
            raise ValueError("no piece table")
        n = (len(pcdt) - 4) // 12
        cps = [struct.unpack_from("<I", pcdt, k * 4)[0] for k in range(n + 1)]
        pieces = []
        for k in range(n):
            off = 4 * (n + 1) + k * 8
            fc = struct.unpack_from("<I", pcdt, off + 2)[0]
            compressed = bool(fc & 0x40000000)
            fc = fc & 0x3FFFFFFF
            pieces.append((cps[k], cps[k + 1], fc, compressed))
        self.pieces = pieces

    def text_range(self, cp_start, cp_end):
        """متن بین دو CP را برمی‌گرداند."""
        out = []
        for cps, cpe, fc, comp in self.pieces:
            if cpe <= cp_start or cps >= cp_end:
                continue
            a = max(cps, cp_start); b = min(cpe, cp_end)
            if comp:
                s = self.wd[fc + (a - cps): fc + (b - cps)]
                out.append(s.decode("cp1256", errors="replace"))
            else:
                s = self.wd[fc + 2 * (a - cps): fc + 2 * (b - cps)]
                out.append(s.decode("utf-16-le", errors="replace"))
        return "".join(out)

    def main_text(self):
        return self.text_range(0, self.ccpText)

    def footnote_text(self):
        s = self.ccpText
        return self.text_range(s, s + self.ccpFtn)

    # ---------------- footnote plcs ----------------
    def _plc(self, idx, cbData):
        fc, lcb = self._fclcb(idx)
        if lcb == 0:
            return [], []
        buf = self.tbl[fc:fc + lcb]
        n = (lcb - 4) // (4 + cbData)
        cps = [struct.unpack_from("<i", buf, k * 4)[0] for k in range(n + 1)]
        data = [buf[4 * (n + 1) + k * cbData: 4 * (n + 1) + (k + 1) * cbData]
                for k in range(n)]
        return cps, data

    def footnote_refs(self):
        """CP موقعیت مرجع پانویس در متن اصلی."""
        cps, _ = self._plc(6, 2)   # fcPlcffndRef
        return cps[:-1] if cps else []

    def footnote_txt_cps(self):
        cps, _ = self._plc(7, 0)   # fcPlcffndTxt
        return cps

    def footnotes(self):
        """[(index, ref_cp, text)] برای هر پانویس."""
        refs = self.footnote_refs()
        txt = self.footnote_txt_cps()
        base = self.ccpText
        out = []
        for i in range(len(refs)):
            if i + 1 < len(txt):
                a, b = base + txt[i], base + txt[i + 1]
                t = self.text_range(a, b)
                out.append((i + 1, refs[i], t))
        return out

    def close(self):
        self.ole.close()


def clean(s):
    """پاک‌سازی نویسه‌های کنترلی ورد برای مقایسه."""
    rep = {"\r": "\n", "\x07": "\t", "\x0b": "\n", "\x0c": "\n",
           "\x13": "", "\x14": "", "\x15": "", "\x01": "", "\x02": "",
           "\x08": "", "\x1e": "-", "\x1f": "", "\xa0": " "}
    for k, v in rep.items():
        s = s.replace(k, v)
    return s


if __name__ == "__main__":
    import sys
    d = Doc(sys.argv[1])
    print("nFib", d.nFib, "ccpText", d.ccpText, "ccpFtn", d.ccpFtn,
          "pieces", len(d.pieces))
    t = clean(d.main_text())
    print("main chars", len(t))
    fns = d.footnotes()
    print("footnotes", len(fns))
    for i, cp, x in fns[:10]:
        print(f"  {i:>3} cp={cp} {clean(x)!r}")
