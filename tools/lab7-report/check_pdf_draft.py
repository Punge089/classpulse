"""Verify the actual PDF structure/content/bounds; visual review remains separate."""
import hashlib
import json
from pathlib import Path

from PIL import Image
from pypdf import PdfReader
import pdfplumber

ROOT = Path(__file__).resolve().parents[2]
FILE = ROOT / "output/pdf/ClassPulse-Lab7-DRAFT.pdf"
meta = json.loads((ROOT / "autopilot/pdf-draft-render.json").read_text(encoding="utf-8"))
reader = PdfReader(FILE)
assert hashlib.sha256(FILE.read_bytes()).hexdigest() == meta["sha256"]
assert len(reader.pages) == meta["pages"]
parts = meta["partStartPages"]
assert set(parts) == set("ABCD") and list(parts.values()) == sorted(parts.values())
navigation = reader.pages[1].extract_text()
for part, start in parts.items():
    end = parts.get(chr(ord(part) + 1), len(reader.pages) + 1) - 1
    assert f"{start}-{end}" in navigation
    assert f"Part {part} -" in reader.pages[start - 1].extract_text()
links = [a.get_object() for a in reader.pages[1].get("/Annots", [])]
page_refs = {p.indirect_reference.idnum: n for n, p in enumerate(reader.pages, 1)}
destinations = [page_refs[a["/Dest"][0].idnum] for a in links if "/Dest" in a]
# A wrapped link creates one annotation rectangle per visual line. Every
# rectangle must still target exactly one of the four correct Part pages.
assert sorted(set(destinations)) == sorted(parts.values())
expected_images = {}
for path in (ROOT / "evidence/lab-07/report/screenshots").glob("*.png"):
    with Image.open(path) as im:
        expected_images[hashlib.sha256(im.convert("RGB").tobytes()).hexdigest()] = path.name
images = []; page_checks = []
with pdfplumber.open(FILE) as pdf:
    for number, page in enumerate(pdf.pages, 1):
        words = page.extract_words(); text = page.extract_text() or ""
        assert "WORKING DRAFT - NOT READY FOR SUBMISSION" in text
        assert f"Page {number}" in text
        assert len(words) >= 35 or len(page.images) > 0, f"Blank intermediate page {number}"
        outside = [w for w in words if w["x0"] < 30 or w["x1"] > page.width - 30 or w["top"] < 12 or w["bottom"] > page.height - 15]
        assert not outside, f"Text outside page bounds {number}"
        for entry in reader.pages[number - 1].images:
            pixel_hash = hashlib.sha256(entry.image.convert("RGB").tobytes()).hexdigest()
            assert pixel_hash in expected_images
            images.append({"page": number, "source": expected_images[pixel_hash], "originalPixelsPreserved": True})
        page_checks.append({"page": number, "width": page.width, "height": page.height, "words": len(words), "outOfBoundsWords": 0, "draftFooter": True})
assert len(images) == len(expected_images) == 3
result = {"artifact": str(FILE.relative_to(ROOT)).replace("\\", "/"), "sha256": meta["sha256"], "sourceSha256UTF8LF": meta["sourceSha256UTF8LF"], "pages": len(reader.pages), "partStartPages": parts, "navigationDestinations": destinations, "images": images, "pageChecks": page_checks, "structuralResult": "PASS: all pages bounded/nonblank/draft-labelled; all Part links/page ranges correct; original screenshot pixels preserved", "visualQA": "PENDING separate rendered-page inspection; structural checks alone do not establish visual quality", "releaseState": "NOT READY; no B final PDF approval or submission"}
(ROOT / "autopilot/pdf-draft-structure.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"pages": len(reader.pages), "partStartPages": parts, "navigationTargets": len(set(destinations)), "originalScreenshots": len(images), "result": "PASS structure; visual inspection still required"}))
