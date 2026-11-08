"""Assemble the Deliverable 1 PDF from the repository documents.

    python tools/build_report.py            # draft: missing files / TODO markers become visible placeholders
    python tools/build_report.py --final    # refuses to build while any TODO or missing file remains

Pipeline: Markdown docs -> one HTML file -> Edge headless "print to PDF" -> PyMuPDF finds the real
page of every heading, so the navigation table and table of contents carry correct page numbers
(two to four passes until stable) and a footer "page n / N" is stamped on every page.
Requires: Microsoft Edge (or Chrome), `pip install markdown pymupdf`.
"""
import argparse
import html
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import markdown
import pymupdf

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "deliverable-1"
S1 = "docs/sprints/sprint-1"

# (letter, title, files, IDs shown in the navigation table)
PARTS = [
    ("A", "SRS and product scope", ["docs/srs.md"], "FR-01…18, BR-01…14, NFR-01…10, D-01…08"),
    ("B", "Feature inventory and traceability", ["docs/features.md", "docs/traceability.md"],
     "SR-01, F-01…F-14; 42 requirement rows; coverage gaps"),
    ("C", "System-Level SDS", ["docs/system-sds.md", "docs/diagrams/architecture.md", "docs/diagrams/er.md"],
     "role/permission matrix, data model, API conventions, authentication, deployment plan"),
    ("D", "Three-sprint plan", ["docs/sprints/plan.md"], "Sprint 1–3 and feature allocation"),
    ("E", "Sprint 1 engineering contracts",
     [f"{S1}/SR-01-foundation.md", f"{S1}/F-01-authentication.md", f"{S1}/F-03-survey-authoring.md",
      f"{S1}/F-04-response-submission.md", f"{S1}/F-05-aggregate-summary.md", f"{S1}/I-10-journey.md",
      f"{S1}/definition-of-done.md"],
     "SR-01, F-01, F-03, F-04, F-05, I-10; AC-01…AC-54; TEST-01…TEST-58; TEST-40; Product DoD"),
    ("F", "Working Sprint 1 and verification",
     ["docs/deliverable-1/part-f.md", f"{S1}/test-results.md", "docs/contributions.md", "docs/ai-use.md"],
     "DEMO-1…3; build/test results; AC-to-test table; Issue/PR chains; contributions; AI use; limitations"),
]

CSS = """
@page { size: A4; margin: 17mm 15mm 18mm 15mm; }
body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10pt; line-height: 1.38; color: #14213D; }
h1 { font-size: 20pt; border-bottom: 3px solid #C8431D; padding-bottom: 4px; margin: 0 0 10px; page-break-before: always; }
h1.nobreak { page-break-before: avoid; }
h2 { font-size: 14pt; margin: 18px 0 6px; page-break-after: avoid; }
h3 { font-size: 11.5pt; margin: 14px 0 4px; page-break-after: avoid; }
h4, h5, h6 { font-size: 10.5pt; margin: 10px 0 3px; page-break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 6px 0 10px; font-size: 8.3pt; }
th, td { border: 1px solid #cfc8bb; padding: 3px 5px; vertical-align: top; text-align: left; overflow-wrap: break-word; }
.id { white-space: nowrap; }
td code.path { word-break: break-all; }
th { background: #FBE3DA; }
tr { page-break-inside: avoid; }
code { font-family: Consolas, "Courier New", monospace; font-size: 8.6pt; background: #f3efe8; padding: 0 2px; }
pre { background: #f3efe8; padding: 6px 8px; font-size: 8pt; white-space: pre-wrap; overflow-wrap: anywhere; page-break-inside: avoid; }
pre code { background: none; padding: 0; }
img { max-width: 100%; }
img[src*="screenshots"] { max-width: 68%; border: 1px solid #cfc8bb; margin: 4px 0; }
blockquote { border-left: 3px solid #C8431D; margin: 6px 0; padding: 2px 10px; color: #5B6478; }
.cover h1 { page-break-before: avoid; font-size: 24pt; }
.todo { background: #ffe9a8; font-weight: 600; }
.missing { background: #ffe9a8; border: 1px dashed #B3261E; padding: 8px; }
.marker { font-size: 1px; color: #ffffff; }
.toc td, .nav td, .nav th { font-size: 9pt; }
.toc td { padding-top: 1px; padding-bottom: 1px; }
.nav th:nth-child(2), .nav td:nth-child(2) { width: 62px; white-space: nowrap; }
.cover th { display: none; }
.mermaid { text-align: center; margin: 8px 0 12px; page-break-inside: avoid; }
.mermaid svg { max-width: 100%; height: auto; }
.toc td.pg { text-align: right; width: 48px; }
"""


def shift_headings(text: str, by: int = 1) -> str:
    out, fenced = [], False
    for line in text.splitlines():
        if line.lstrip().startswith("```"):
            fenced = not fenced
        m = re.match(r"^(#{1,6})(\s.*)$", line)
        if m and not fenced:
            line = "#" * min(6, len(m.group(1)) + by) + m.group(2)
        out.append(line)
    return "\n".join(out)


def abs_images(text: str, base: Path) -> str:
    def fix(m):
        alt, target = m.group(1), m.group(2)
        if re.match(r"^(https?:|file:|data:)", target):
            return m.group(0)
        return f"![{alt}]({(base / target).resolve().as_uri()})"
    return re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", fix, text)


def first_h1(text: str, fallback: str) -> str:
    for line in text.splitlines():
        m = re.match(r"^#\s+(.*)$", line)
        if m:
            return m.group(1).strip()
    return fallback


ID_RE = re.compile(r"\b(?:TEST|AC|FR|BR|NFR|SR|DEMO|D|Q|A)-\d+\b|\bF-\d\d\b|\bAPI/DB\b|\bE2E\b")


def keep_ids_together(html_text: str) -> str:
    """Wrap requirement/test IDs in a no-wrap span (text between tags only, never inside <pre>/<code>)."""
    out, in_code = [], 0
    for part in re.split(r"(<[^>]+>)", html_text):
        if part.startswith("<"):
            if re.match(r"<(pre|code)\b", part):
                in_code += 1
            elif re.match(r"</(pre|code)>", part):
                in_code = max(0, in_code - 1)
            out.append(part)
        else:
            out.append(part if in_code else ID_RE.sub(lambda m: f'<span class="id">{m.group(0)}</span>', part))
    return "".join(out)


MERMAID_BLOCK = re.compile(r'<pre><code class="language-mermaid">(.*?)</code></pre>', re.DOTALL)
# Pinned release on cdnjs; the diagrams are drawn in the browser while Edge prints, so the build needs internet.
MERMAID_SRC = "https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js"


def md(text: str) -> str:
    rendered = keep_ids_together(markdown.markdown(text, extensions=["tables", "fenced_code", "sane_lists"]))
    # Only file paths and URLs (they contain "/") may be broken in the middle of a word inside narrow table cells.
    rendered = re.sub(r"<code>([^<]*/[^<]*)</code>", r'<code class="path">\1</code>', rendered)
    # ```mermaid blocks become <div class="mermaid">; the entities stay escaped and are decoded by the browser.
    return MERMAID_BLOCK.sub(lambda m: f'<div class="mermaid">{m.group(1)}</div>', rendered)


def collect(final: bool):
    """Return (parts, problems). parts: list of (letter, title, ids, [(doc_title, html_body)])."""
    problems, parts = [], []
    for letter, title, files, ids in PARTS:
        docs = []
        for rel in files:
            path = ROOT / rel
            if not path.exists():
                msg = f"missing file: {rel}"
                problems.append(msg)
                docs.append((f"(missing) {rel}", f'<div class="missing">Missing file <code>{html.escape(rel)}</code> '
                                                 "(draft build only; it must exist before the final build).</div>"))
                continue
            raw = path.read_text(encoding="utf-8")
            if re.search(r"\bTODO\b", raw):
                problems.append(f"TODO marker in {rel}")
            body = md(abs_images(shift_headings(raw), path.parent))
            body = re.sub(r"\bTODO\b", '<span class="todo">TODO</span>', body)
            docs.append((first_h1(raw, rel), body))
        parts.append((letter, title, ids, docs))
    return parts, problems


def render(parts, pages, front_md: str) -> str:
    """pages: dict key -> page number (or None on the first pass)."""
    def pg(key):
        return str(pages.get(key, "00")) if pages is not None else "00"

    def nav_pages(letter):
        keys = [k for k in (pages or {}) if k.startswith(f"{letter}|")]
        nums = sorted(pages[k] for k in keys) if keys else []
        start = pages.get(f"{letter}|") if pages else None
        end = (pages.get(f"next|{letter}") - 1) if pages and pages.get(f"next|{letter}") else None
        if not (start and end):
            return "00"
        return str(start) if start == end else f"{start}–{end}"

    nav_rows = "".join(
        f"<tr><td><b>Part {l}</b> - {html.escape(t)}</td><td>{nav_pages(l)}</td><td>{html.escape(ids)}</td></tr>"
        for l, t, _f, ids in [(p[0], p[1], None, p[2]) for p in parts])
    toc_rows = []
    for letter, title, _ids, docs in parts:
        toc_rows.append(f'<tr><td><b>Part {letter} - {html.escape(title)}</b></td><td class="pg">{pg(f"{letter}|")}</td></tr>')
        for i, (dt, _b) in enumerate(docs):
            toc_rows.append(f'<tr><td style="padding-left:18px">{html.escape(dt)}</td><td class="pg">{pg(f"{letter}|{i}")}</td></tr>')
    body = []
    for letter, title, _ids, docs in parts:
        body.append(f"<h1>Part {letter} - {html.escape(title)}</h1>")
        for dt, b in docs:
            body.append(b)
    front = md(front_md)
    has_diagrams = any('class="mermaid"' in b for _l, _t, _i, docs in parts for _d, b in docs)
    mermaid = (f'<script src="{MERMAID_SRC}"></script>'
               '<script>mermaid.initialize({startOnLoad:true,theme:"neutral",securityLevel:"strict"});</script>'
               if has_diagrams else "")
    return (
        "<!doctype html><html><head><meta charset='utf-8'><title>ClassPulse - CPE 334 Deliverable 1</title>"
        f"<style>{CSS}</style>{mermaid}</head><body>"
        f"<div class='cover'>{front}</div>"
        "<h2>Navigation table</h2><table class='nav'><tr><th>Part</th><th>Pages</th><th>Relevant IDs</th></tr>"
        f"{nav_rows}</table>"
        "<h2>Table of contents</h2><table class='toc'>" + "".join(toc_rows) + "</table>"
        "<div class='marker'>BODYSTART7F3A</div>"
        + "".join(body) + "</body></html>"
    )


def find_browser() -> str:
    for p in [r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Google\Chrome\Application\chrome.exe"]:
        if Path(p).exists():
            return p
    for name in ("msedge", "google-chrome", "chromium", "chrome"):
        if shutil.which(name):
            return shutil.which(name)
    sys.exit("No Edge/Chrome found; install one to print the PDF.")


def wait_for_pdf(pdf: Path, timeout: float = 90.0) -> bool:
    """Edge can return before the PDF is fully written (seen on a teammate's Windows machine), so wait until
    the file exists, is non-empty and has stopped growing, and PyMuPDF can open it."""
    deadline = time.time() + timeout
    last_size = -1
    while time.time() < deadline:
        if pdf.exists():
            size = pdf.stat().st_size
            if size > 0 and size == last_size:
                try:
                    pymupdf.open(pdf).close()
                    return True
                except Exception:
                    pass  # still being written
            last_size = size
        time.sleep(1.0)
    return False


def to_pdf(html_text: str, pdf: Path) -> None:
    pdf.unlink(missing_ok=True)  # never mistake an old file for this run's output
    has_diagrams = 'class="mermaid"' in html_text
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "report.html"
        src.write_text(html_text, encoding="utf-8")
        command = [find_browser(), "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                   f"--user-data-dir={Path(tmp) / 'profile'}", f"--print-to-pdf={pdf}"]
        if has_diagrams:
            command.append("--virtual-time-budget=20000")  # let mermaid.js fetch and draw before printing
        command.append(src.as_uri())
        # The exit code is not trusted: success means a complete PDF exists afterwards.
        subprocess.run(command, timeout=240, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if not wait_for_pdf(pdf):
            sys.exit("The browser did not produce a readable PDF (check that Edge or Chrome can start headless, "
                     "and that cdnjs.cloudflare.com is reachable when the document has diagrams).")


def warn_unrendered_diagrams(pdf: Path) -> None:
    doc = pymupdf.open(pdf)
    leaked = [i + 1 for i in range(doc.page_count)
              if re.search(r"erDiagram|flowchart (LR|TD)|sequenceDiagram|classDiagram", doc[i].get_text())]
    doc.close()
    if leaked:
        print(f"WARNING: diagram source text appears on pages {leaked}; the diagrams were not drawn "
              "(no internet access to cdnjs.cloudflare.com?). Fix this before submitting.")


def measure(parts, pdf: Path):
    """Find the real page (1-based) of every Part heading and document title."""
    doc = pymupdf.open(pdf)
    texts = [re.sub(r"\s+", " ", doc[i].get_text()) for i in range(doc.page_count)]
    start = next((i for i, t in enumerate(texts) if "BODYSTART7F3A" in t), None)
    if start is None:
        sys.exit("Body marker not found in the PDF; layout broke.")
    # The first Part heading starts a new page (page-break-before), so the body begins on the page AFTER the marker.
    # Searching from the marker's own page would match the table of contents when it fits on that page.
    pages, cur = {}, min(start + 1, doc.page_count - 1)
    for letter, title, _ids, docs in parts:
        head = f"Part {letter} - {title}"
        head = re.sub(r"\s+", " ", head)
        idx = next((i for i in range(cur, doc.page_count) if head in texts[i]), cur)
        pages[f"{letter}|"] = idx + 1
        cur = idx
        for n, (dt, _b) in enumerate(docs):
            key = re.sub(r"\s+", " ", dt)
            j = next((i for i in range(cur, doc.page_count) if key in texts[i]), cur)
            pages[f"{letter}|{n}"] = j + 1
            cur = j
    letters = [p[0] for p in parts]
    for a, b in zip(letters, letters[1:]):
        pages[f"next|{a}"] = pages[f"{b}|"]
    pages[f"next|{letters[-1]}"] = doc.page_count + 1
    n = doc.page_count
    doc.close()
    return pages, n


def stamp(pdf_in: Path, pdf_out: Path) -> int:
    doc = pymupdf.open(pdf_in)
    total = doc.page_count
    for i, page in enumerate(doc):
        r = page.rect
        page.insert_text((r.width / 2 - 70, r.height - 22), f"ClassPulse - Deliverable 1 - page {i + 1} / {total}",
                         fontsize=8, color=(0.36, 0.39, 0.47))
    doc.save(pdf_out)
    doc.close()
    return total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--final", action="store_true", help="fail if any TODO or missing file remains")
    ap.add_argument("--out", default=str(OUT_DIR / "ClassPulse_Deliverable1.pdf"))
    args = ap.parse_args()

    front_path = OUT_DIR / "front-matter.md"
    if not front_path.exists():
        sys.exit(f"missing {front_path}")
    front_md = front_path.read_text(encoding="utf-8")
    front_md_html = re.sub(r"\bTODO\b", "TODO", front_md)
    parts, problems = collect(args.final)
    if re.search(r"\bTODO\b", front_md):
        problems.append("TODO marker in docs/deliverable-1/front-matter.md")
    if problems:
        print("Problems:" if not args.final else "Cannot build the final PDF:")
        for p in problems:
            print("  -", p)
        if args.final:
            sys.exit(1)

    pages, prev = None, None
    tmp_pdf = Path(args.out).with_suffix(".tmp.pdf")
    for attempt in range(1, 5):
        to_pdf(render(parts, pages, front_md_html), tmp_pdf)
        new, total = measure(parts, tmp_pdf)
        print(f"pass {attempt}: {total} pages")
        if new == pages:
            break
        pages = new
    to_pdf(render(parts, pages, front_md_html), tmp_pdf)
    total = stamp(tmp_pdf, Path(args.out))
    warn_unrendered_diagrams(Path(args.out))
    tmp_pdf.unlink(missing_ok=True)
    print(f"wrote {args.out} ({total} pages)" + ("" if not problems else " [DRAFT: see problems above]"))


if __name__ == "__main__":
    main()
