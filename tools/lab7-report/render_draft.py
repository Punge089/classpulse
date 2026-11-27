"""Render the separate Lab7 working draft; capture no new application evidence.

Uses reportlab/Pillow/pypdf and Windows Arial/Consolas/Segoe Symbol. A4 text
pages and A3 landscape evidence sheets keep original screenshots readable.
"""
from html import escape
import hashlib
import json
from pathlib import Path
import re
import textwrap

from PIL import Image as PILImage
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import A3, A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import BaseDocTemplate, Frame, Image, NextPageTemplate, PageBreak, PageTemplate, Paragraph, Spacer, Table, TableStyle, XPreformatted

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "docs/labs/lab-07/report.md"
OUTPUT = ROOT / "output/pdf/ClassPulse-Lab7-DRAFT.pdf"
TEMP = ROOT / "autopilot/tmp/pdfs"
NAVY, TEAL, INK = [colors.HexColor(x) for x in ["#15324c", "#087e8b", "#203247"]]
MARGIN = 42
WIDE = landscape(A3)
WIDTH = A4[0] - MARGIN * 2


def register_fonts():
    for name, file in [("Body", "arial.ttf"), ("Bold", "arialbd.ttf"), ("Italic", "ariali.ttf"), ("Code", "consola.ttf"), ("Symbols", "seguisym.ttf")]:
        pdfmetrics.registerFont(TTFont(name, "C:/Windows/Fonts/" + file))
    pdfmetrics.registerFontFamily("Body", normal="Body", bold="Bold", italic="Italic", boldItalic="Bold")


def display(text):
    return text.translate(str.maketrans({"\ufeff": "", "\ufe0f": "", "\u23af": "-", "\u2011": "-", "\u2010": "-", "\u2013": "-", "\u2014": "-", "\u00a0": " "}))


def runs(text, font="Body"):
    cmap = pdfmetrics.getFont(font).face.charToGlyph
    symbols = pdfmetrics.getFont("Symbols").face.charToGlyph
    result = []
    for char in display(text):
        if ord(char) < 128 or ord(char) in cmap: result.append(escape(char))
        elif ord(char) in symbols: result.append('<font name="Symbols">' + escape(char) + '</font>')
        else: raise ValueError(f"Unsupported glyph U+{ord(char):04X}")
    return "".join(result)


def inline(text):
    output = []
    for part in re.split(r"(`[^`]+`)", text):
        if part.startswith("`") and part.endswith("`"):
            output.append('<font name="Code" size="8.4">' + runs(part[1:-1], "Code") + '</font>')
        else:
            item = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", runs(part))
            item = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<link href="\2" color="#087e8b">\1</link>', item)
            output.append(item)
    return "".join(output)


def styles():
    common = dict(fontName="Body", textColor=INK, wordWrap="CJK", splitLongWords=True)
    return {
        "body": ParagraphStyle("body", fontSize=9.6, leading=13.5, spaceAfter=7, **common),
        "title": ParagraphStyle("title", fontName="Bold", fontSize=26, leading=31, spaceAfter=14, textColor=NAVY, keepWithNext=True),
        "h1": ParagraphStyle("h1", fontName="Bold", fontSize=20, leading=25, spaceAfter=14, textColor=NAVY, keepWithNext=True),
        "h2": ParagraphStyle("h2", fontName="Bold", fontSize=13.4, leading=17, spaceBefore=12, spaceAfter=7, textColor=TEAL, keepWithNext=True),
        "h3": ParagraphStyle("h3", fontName="Bold", fontSize=11.3, leading=15, spaceBefore=10, spaceAfter=6, textColor=NAVY, keepWithNext=True),
        "cell": ParagraphStyle("cell", fontSize=8.4, leading=11.4, **common),
        "head": ParagraphStyle("head", fontName="Bold", fontSize=8.5, leading=11.5, textColor=colors.white, wordWrap="CJK"),
        "quote": ParagraphStyle("quote", fontSize=9.4, leading=13.3, leftIndent=12, rightIndent=10, borderColor=TEAL, borderWidth=1, borderPadding=9, spaceBefore=7, spaceAfter=12, **common),
        "code": ParagraphStyle("code", fontName="Code", fontSize=8, leading=10.2, textColor=INK, backColor=colors.HexColor("#f2f5f8"), borderPadding=6, spaceBefore=5, spaceAfter=10),
        "caption": ParagraphStyle("caption", fontSize=10, leading=14, spaceAfter=12, **common),
        "draft": ParagraphStyle("draft", fontName="Bold", fontSize=11, leading=15, textColor=colors.HexColor("#a62f27"), spaceAfter=12),
    }


class DraftDoc(BaseDocTemplate):
    def __init__(self, path):
        super().__init__(str(path), pagesize=A4, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=53, bottomMargin=46, title="ClassPulse Lab7 - working draft, NOT READY", author="Bannasorn Thongkorn and Papangkorn Jitvoottikrai")
        self.parts, self.headings = {}, []
        for name, size in [("portrait", A4), ("wide", WIDE)]:
            frame = Frame(MARGIN, 46, size[0] - 2 * MARGIN, size[1] - 99, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
            self.addPageTemplates(PageTemplate(id=name, frames=[frame], pagesize=size, onPage=self.decorate))

    def decorate(self, canvas, doc):
        width, height = canvas._pagesize
        canvas.saveState(); canvas.setStrokeColor(colors.HexColor("#c7d5de"))
        canvas.line(MARGIN, height - 35, width - MARGIN, height - 35)
        canvas.setFont("Bold", 8); canvas.setFillColor(NAVY)
        canvas.drawString(MARGIN, height - 27, "ClassPulse / LAB 7 MAINTENANCE")
        canvas.setFont("Body", 7.5)
        canvas.drawRightString(width - MARGIN, height - 27, "Working draft v0.6 / 28 Nov 2026")
        canvas.setFillColor(colors.HexColor("#a62f27")); canvas.setFont("Bold", 7.6)
        canvas.drawString(MARGIN, 26, "WORKING DRAFT - NOT READY FOR SUBMISSION")
        canvas.setFillColor(INK); canvas.setFont("Body", 7.5)
        canvas.drawRightString(width - MARGIN, 26, f"Page {doc.page}"); canvas.restoreState()

    def afterFlowable(self, flowable):
        if hasattr(flowable, "report_key"):
            key, title = flowable.report_key, flowable.report_title
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, level=0 if key.startswith("part-") else 1, closed=False)
            self.headings.append({"heading": title, "key": key, "page": self.page})
            if key.startswith("part-"): self.parts[key[-1].upper()] = self.page


def widths(header):
    n = len(header)
    if header[0] == "Student": return [155, 77, 70, WIDTH - 302]
    if header[0] == "Reference": return [111, 243, WIDTH - 354]
    if header[0] == "ID" and n == 3: return [48, WIDTH - 125, 77]
    if header[0] == "Part": return [142, 36, WIDTH - 265, 87]
    if header[0] == "Event": return [133, 218, WIDTH - 351]
    if header[0] == "Run ID": return [73, 210, 105, WIDTH - 388]
    if header[0] == "Current status": return [70, 145, 145, WIDTH - 360]
    if n == 6: return [49, 44, 55, 127, 138, WIDTH - 413]
    if n == 5: return [164, 44, 44, 44, WIDTH - 296]
    if n == 4: return [99, 150, 97, WIDTH - 346]
    if n == 3: return [112, 237, WIDTH - 349]
    return [WIDTH / n] * n


def story(text, parts, total):
    st = styles(); result = []; lines = text.splitlines(); i = 0; section = 0; caption = None; after_figure = False
    while i < len(lines):
        line = lines[i]
        if not line.strip(): i += 1; continue
        if after_figure and not line.startswith("![") and not re.match(r"L7-B0[567]:", line):
            result.extend([NextPageTemplate("portrait"), PageBreak()]); after_figure = False
        if line.startswith("```"):
            block = []; i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                for wrapped in textwrap.wrap(display(lines[i]).expandtabs(4), width=105, subsequent_indent="    ", replace_whitespace=False, drop_whitespace=False, break_long_words=True, break_on_hyphens=False) or [""]:
                    block.append(runs(wrapped, "Code"))
                i += 1
            result.append(XPreformatted("\n".join(block), st["code"])); i += 1; continue
        if line.startswith("|"):
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                row = [x.strip() for x in lines[i].strip().strip("|").split("|")]
                if not all(set(x) <= set("-: ") for x in row): rows.append(row)
                i += 1
            navigation = rows[0][0] == "Part" and len(rows[0]) == 4
            if navigation:
                rows[0][-1] = "Draft PDF pages"
                for row in rows[1:]:
                    part = row[0][0]; start = parts.get(part); stop = parts.get(chr(ord(part) + 1), total + 1) - 1
                    row[-1] = f"{start}-{stop}" if start else "00-00"
                    row[0] = f'<link href="#part-{part.lower()}" color="#087e8b">{escape(row[0])}</link>'
            cells = []
            for r, row in enumerate(rows):
                formatted = []
                for c, cell in enumerate(row):
                    markup = cell if navigation and r > 0 and c == 0 else inline(cell)
                    if r > 0 and re.fullmatch(r"\d{3}(?:,\d{3})+", cell): markup = cell.replace(",", ",<br/>")
                    formatted.append(Paragraph(markup, st["head"] if r == 0 else st["cell"]))
                cells.append(formatted)
            table = Table(cells, colWidths=widths(rows[0]), repeatRows=1, hAlign="LEFT", splitByRow=True)
            table.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), NAVY), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5), ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5), ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f2f6f9"), colors.white]), ("LINEBELOW", (0, 0), (-1, 0), .6, TEAL), ("LINEBELOW", (0, 1), (-1, -1), .25, colors.HexColor("#d9e2e9"))]))
            result.extend([table, Spacer(1, 9)]); continue
        if line.startswith("#"):
            level = len(line) - len(line.lstrip("#")); title = line[level:].strip(); part = re.match(r"Part ([A-D]) -", title)
            if (part or title == "Navigation and version map") and (not result or not isinstance(result[-1], PageBreak)): result.append(PageBreak())
            p = Paragraph(inline(title), st["title"] if level == 1 and not part else st[f"h{min(level, 3)}"])
            if part: p.report_key = "part-" + part[1].lower(); p.report_title = title
            elif level == 2 and title != "Navigation and version map":
                section += 1; p.report_key = f"section-{section}"; p.report_title = title
            result.append(p); i += 1; continue
        if line.startswith("!["):
            image = re.match(r"!\[([^]]+)\]\(([^)]+)\)", line); path = (SOURCE.parent / image[2]).resolve()
            with PILImage.open(path) as picture: w, h = picture.size
            scale = min((WIDE[0] - 2 * MARGIN) / w, (WIDE[1] - 165) / h)
            result.extend([NextPageTemplate("wide"), PageBreak()])
            if caption: result.append(Paragraph(inline(caption), st["caption"])); caption = None
            result.append(Image(str(path), width=w * scale, height=h * scale, hAlign="CENTER"))
            after_figure = True; i += 1; continue
        paragraph = [line]; i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].startswith(("#", "|", "```", "![", ">", "- ")):
            paragraph.append(lines[i]); i += 1
        value = " ".join(paragraph)
        if re.match(r"L7-B0[567]:", value): caption = value; continue
        if value.startswith("> "): result.append(Paragraph(inline(value[2:]), st["quote"]))
        elif value.startswith("- "): result.append(Paragraph("&#8226; " + inline(value[2:]), st["body"]))
        else:
            p = Paragraph(inline(value), st["draft"] if "NOT READY FOR SUBMISSION" in value else st["body"])
            look = i
            while look < len(lines) and not lines[look].strip(): look += 1
            if look < len(lines) and lines[look].startswith("|"): p.keepWithNext = True
            result.append(p)
    return result


def main():
    register_fonts(); TEMP.mkdir(parents=True, exist_ok=True); OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    source = SOURCE.read_text(encoding="utf-8"); parts, count = {}, 0
    for iteration in range(1, 5):
        path = TEMP / f"draft-pass-{iteration}.pdf"; doc = DraftDoc(path)
        def stable_canvas(*args, **kwargs):
            kwargs["invariant"] = 1
            return Canvas(*args, **kwargs)
        doc.build(story(source, parts, count), canvasmaker=stable_canvas)
        if doc.parts == parts and doc.page == count: OUTPUT.write_bytes(path.read_bytes()); break
        parts, count = doc.parts, doc.page
    else: raise RuntimeError("Part navigation failed to stabilize")
    reader = PdfReader(OUTPUT); assert len(reader.pages) == count
    text = "\n".join(p.extract_text() or "" for p in reader.pages)
    for required in ["NOT READY FOR SUBMISSION", "Part A -", "Part B -", "Part C -", "Part D -", "expected 404 to be 200", "219 passed", "10 passed", "67070503420", "67070503421"]: assert required in text, required
    metadata = {"artifact": "output/pdf/ClassPulse-Lab7-DRAFT.pdf", "sha256": hashlib.sha256(OUTPUT.read_bytes()).hexdigest(), "sourceSha256UTF8LF": hashlib.sha256(source.encode("utf-8")).hexdigest(), "pages": count, "partStartPages": parts, "headings": doc.headings, "status": "WORKING DRAFT / NOT READY; no B final PDF approval or submission", "rendering": "embedded Arial/Consolas/Segoe Symbol; A4 text and A3 landscape original evidence figures; visible draft footer each page; stable navigation", "displayNormalization": "visual line wrapping; typographic dashes/decorative rules rendered as ASCII hyphens; BOM/variation selectors hidden for font display only; input bytes unchanged", "visualQA": "PENDING all-page rendered inspection"}
    (ROOT / "autopilot/pdf-draft-render.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: metadata[k] for k in ["artifact", "sha256", "pages", "partStartPages", "visualQA"]}))


if __name__ == "__main__": main()
