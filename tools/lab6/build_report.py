"""Build the stable Lab 6 submission candidate from actual retained evidence."""
import hashlib
import html
import json
import re
import subprocess
from pathlib import Path

from reportlab import rl_config
rl_config.invariant = 1
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Frame, Image, PageBreak, PageTemplate, Paragraph,
    Preformatted, Spacer, Table, TableStyle, Flowable,
)
from reportlab.platypus.tableofcontents import TableOfContents
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
HERE = ROOT / "evidence/lab-06/finalization-20261127/report-draft"
SRC = HERE.parent / "baseline-snapshots"
EV = SRC / "evidence/lab-06"
NEW = HERE.parent / "received-cd-decision-20261126"
LIVE = HERE.parent / "workflow-a-live-20261126"
CLOSURE = HERE.parent / "workflow-closure-20261126"
LOCALAC04 = HERE.parent / "received-ac04-alternative-20261126"
ACCEPTED = HERE.parent / "received-cd-acceptance-20261127"
FINALC = HERE.parent / "received-c-final-20261127"
SPECIAL = HERE.parent / "workflow-special-setup-20261127"
BREVIEW = HERE.parent / "received-b-final-review-20261127"
BOWNER = HERE.parent / "received-b-owner-confirmation-20261127"
OUT = ROOT / "docs/labs/lab-06/report"
OUT.mkdir(parents=True, exist_ok=True)
PDF = OUT / "ClassPulse_Lab6_REVIEW_20261127.pdf"
CP = "bee0d122bf23410e3d2db69649ad5e44959b6cd8"
WF = "41a8fefa7a5d93b6531dff88daae39574d72dcb7"
used = {}

for name, file in [("Body", "tahoma.ttf"), ("Bold", "tahomabd.ttf"), ("Mono", "consola.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(Path("C:/Windows/Fonts") / file)))
pdfmetrics.registerFontFamily("Body", normal="Body", bold="Bold", italic="Body", boldItalic="Bold")
styles = getSampleStyleSheet()
styles.add(ParagraphStyle("BodyText2", fontName="Body", fontSize=9.2, leading=13, spaceAfter=6))
styles.add(ParagraphStyle("H1", fontName="Bold", fontSize=17, leading=22, textColor=colors.HexColor("#12374b"), spaceAfter=12, keepWithNext=True))
styles.add(ParagraphStyle("H2", fontName="Bold", fontSize=11.5, leading=15, spaceBefore=9, spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle("Cell", fontName="Body", fontSize=7.7, leading=10.5, spaceAfter=0, splitLongWords=True))
styles.add(ParagraphStyle("Caption2", fontName="Body", fontSize=8.2, leading=11.5, textColor=colors.HexColor("#334b58"), spaceAfter=8))
styles.add(ParagraphStyle("Code2", fontName="Mono", fontSize=7, leading=9, leftIndent=4, rightIndent=4, spaceBefore=5, spaceAfter=7))
styles.add(ParagraphStyle("Cover2", fontName="Bold", fontSize=27, leading=34, textColor=colors.HexColor("#12374b"), spaceAfter=18))
styles.add(ParagraphStyle("Status2", fontName="Bold", fontSize=12, leading=17, textColor=colors.HexColor("#9b3c1a"), spaceAfter=13))

def normalize(s):
    s = re.sub(r"\x1b\[[0-?]*[ -/]*[@-~]", "", s)
    s = s.replace("\u2011", "-").replace("\u2013", "-").replace("\u2014", " - ").replace("\ufffd", "-")
    s = re.sub(r"âŽ¯+", "---", s)
    s = re.sub(r"https?://(?:www\.)?discord(?:app)?\.com/channels/@me/[^\s)]+", "[private notice URL omitted]", s)
    return re.sub(r"postgres(?:ql)?://[^\s]+", "[connection string omitted]", s)

def read(path):
    b = path.read_bytes()
    used[str(path.relative_to(ROOT)).replace("\\", "/")] = hashlib.sha256(b).hexdigest()
    return normalize(b.decode("utf-8-sig"))

def inline(s):
    s = normalize(s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1", s)
    s = html.escape(s)
    s = re.sub(r"`([^`]+)`", r'<font name="Mono">\1</font>', s)
    return re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)

def p(s, style="BodyText2"):
    return Paragraph(inline(s), styles[style])

def table(rows, widths=None):
    n = len(rows[0])
    if widths is None:
        ratios = {2:[.26,.74], 3:[.19,.35,.46], 4:[.14,.22,.37,.27], 5:[.12,.18,.22,.25,.23], 6:[.10,.14,.15,.22,.25,.14]}.get(n,[1/n]*n)
        widths = [172*mm*x for x in ratios]
    data = [[p(str(c), "Cell") for c in row] for row in rows]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND",(0,0),(-1,0),colors.HexColor("#e3edf1")),
        ("VALIGN",(0,0),(-1,-1),"TOP"),
        ("BOX",(0,0),(-1,-1),.5,colors.HexColor("#b5c8d0")),
        ("INNERGRID",(0,0),(-1,-1),.25,colors.HexColor("#c9d6dc")),
        ("LEFTPADDING",(0,0),(-1,-1),5), ("RIGHTPADDING",(0,0),(-1,-1),5),
        ("TOPPADDING",(0,0),(-1,-1),5), ("BOTTOMPADDING",(0,0),(-1,-1),5),
    ]))
    return t

def md(text):
    lines = normalize(text).splitlines(); out=[]; i=0
    while i<len(lines):
        s=lines[i].strip()
        if not s or s in ["---","***"]: i+=1; continue
        if s.startswith("```"):
            block=[]; i+=1
            while i<len(lines) and not lines[i].strip().startswith("```"):
                block.append(lines[i]); i+=1
            out.append(Preformatted("\n".join(block),styles["Code2"],maxLineLength=104)); i+=1; continue
        if s.startswith("|") and i+1<len(lines) and re.match(r"\|?\s*:?-{2,}",lines[i+1].strip()):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith("|"):
                row=lines[i].strip().strip("|").split("|")
                if not all(re.fullmatch(r"\s*:?-+:?\s*",x) for x in row): rows.append([x.strip() for x in row])
                i+=1
            n=len(rows[0]); rows=[r[:n]+[""]*max(0,n-len(r)) for r in rows]
            out.extend([table(rows),Spacer(1,7)]); continue
        if s.startswith("#"):
            out.append(p(re.sub(r"^#+\s*","",s),"H2"));i+=1;continue
        paragraph=[s]; i+=1
        while i<len(lines) and lines[i].strip() and not lines[i].lstrip().startswith(("#","|","```","- ","* ")) and not re.match(r"\d+\. ",lines[i].strip()):
            paragraph.append(lines[i].strip());i+=1
        out.append(p(" ".join(paragraph)))
    return out

def between(text,start,end=None):
    if start not in text: raise ValueError("Missing source section: "+start)
    s=text.split(start,1)[1]
    return s.split(end,1)[0] if end and end in s else s

class Report(BaseDocTemplate):
    def __init__(self,path):
        super().__init__(str(path),pagesize=(210*mm,297*mm),leftMargin=19*mm,rightMargin=19*mm,topMargin=23*mm,bottomMargin=21*mm,
                         title="ClassPulse Lab 6 - Independent UAT and defect management",author="Student A/Punge089 with Codex GPT-6")
        self.page_map={}
        self.historical_bounds=None
        self.addPageTemplates(PageTemplate(id="normal",frames=Frame(19*mm,21*mm,172*mm,253*mm,leftPadding=0,rightPadding=0,topPadding=0,bottomPadding=0),onPage=self.decor))
    def decor(self,c,doc):
        c.setStrokeColor(colors.HexColor("#a7c2ce"));c.line(19*mm,278*mm,191*mm,278*mm)
        c.setFont("Body",8);c.setFillColor(colors.HexColor("#4c6471"));c.drawString(19*mm,282*mm,"CLASSPULSE / LAB 6 / UAT REPORT")
        if self.historical_bounds and self.historical_bounds[0] <= doc.page <= self.historical_bounds[1]:
            c.setFont("Bold",6.8);c.drawString(19*mm,275.7*mm,"HISTORICAL 26 NOVEMBER SNAPSHOT | later outcomes and decisions: Appendices I-K")
        c.setFont("Bold",7.4);c.setFillColor(colors.HexColor("#9b3c1a"));c.drawString(19*mm,12*mm,"CLASSPULSE LAB 6 | UAT, DEFECT AND RETEST EVIDENCE")
        c.setFont("Body",8);c.drawRightString(191*mm,12*mm,str(doc.page))
    def afterFlowable(self,flow):
        if isinstance(flow,Paragraph) and flow.style.name=="H1":
            text=flow.getPlainText();key="sec_"+re.sub(r"[^a-z0-9]+","_",text.lower())
            self.canv.bookmarkPage(key);self.notify("TOCEntry",(0,text,self.page,key));self.page_map[text]=self.page

def section(story,title):
    story.extend([PageBreak(),p(title,"H1")])

class EvidenceClip(Flowable):
    """Magnify a rectangle in PDF layout; the original bitmap stays unchanged."""
    def __init__(self,path,bbox):
        from PIL import Image as PILImage
        Flowable.__init__(self)
        self.path=path;self.bbox=bbox;self.iw,self.ih=PILImage.open(path).size
        l,t,r,b=bbox;self.scale=min(172*mm/(r-l),205*mm/(b-t))
        self.width=(r-l)*self.scale;self.height=(b-t)*self.scale;self.hAlign="CENTER"
    def draw(self):
        c=self.canv;l,t,r,b=self.bbox;c.saveState()
        clip=c.beginPath();clip.rect(0,0,self.width,self.height);c.clipPath(clip,stroke=0,fill=0)
        c.drawImage(str(self.path),-l*self.scale,-(self.ih-b)*self.scale,width=self.iw*self.scale,height=self.ih*self.scale,mask="auto")
        c.restoreState()

def figure(story,path,caption):
    from PIL import Image as PILImage
    read_bytes=path.read_bytes();used[str(path.relative_to(ROOT)).replace("\\","/")]=hashlib.sha256(read_bytes).hexdigest()
    w,h=PILImage.open(path).size
    bbox=(0,0,w,h) if w < 600 else ((410,0,845,h) if w==1265 else ((290,0,1050,h) if w==1366 else (250,0,1030,h)))
    caption+=f" Magnified crop {bbox}; original screenshot unchanged."
    story.extend([PageBreak(),p(caption,"Caption2"),EvidenceClip(path,bbox),Spacer(1,6)])

def build(ranges=None):
    story=[Spacer(1,14*mm),p("Independent UAT and defect management","Cover2"),p("ClassPulse / CPE334 Lab 6","H2"),
           p("ClassPulse ACCEPTED; A/B accept Workflow with documented limits","Status2"),
           p("Decision record, 27 November 2026 (Bangkok): D accepted ClassPulse at 01:35:39 and C confirmed the evidence at 02:01:21. A accepted Workflow with explicitly documented minor limitations at 02:28:53 after the agreed local methods; C/D acknowledged the outcomes. B confirms his identity and concurrence dated 27 November; his agent observed receipt by 16:18:31 ICT, with the exact human-message instant unknown. Historical live M01 remains BLOCKED at its original scope, separate from the accepted exact-source isolated method and recorded ClassPulse decision. Exact releases, results, independent reviews and residual limits follow."),
           p("This report contains the retained UAT cases, results, defect-resolution chain and acceptance records. No pending case is converted to PASS. Repository approval and the actual LEB2 upload receipt are recorded separately; this report does not claim either action or an awarded grade."),
           table([["Item","Recorded identity / scope"],["Product Team","ClassPulse: identified course-feedback surveys; Sprint 1 F-01/F-03/F-04/F-05"],["A / B","Bannasorn Thongkorn /67070503420 /Punge089; Papangkorn Jitvoottikrai /67070503421 /book6349. B directly confirms own name/ID in the new27Nov record; A's recorded identity is retained."],["Independent partner","EN-037_P5: Thira Rungruangkaset (D), 67070503419; Ashira Sansoda (C), 67070503445."],["Repository / app","github.com/Punge089/classpulse; https://classpulse-zdwglar6eq-as.a.run.app/"],["Partner repository / app","github.com/osizk/WorkflowAndApprovalSystem; https://scd928edd-4d7hbszvwq-as.a.run.app/login"],["Document control","Exact PDF hash and source inputs: report-receipt.json. Current file review: ClassPulse PR #133. Actual course filename, submission deadline and LEB2 receipt are verified by the submitting student; the original deadline is historical."]])]
    story.extend([PageBreak(),p("Contents","H2")])
    toc=TableOfContents();toc.levelStyles=[ParagraphStyle("TOC0",fontName="Body",fontSize=9,leading=14,spaceBefore=3,leftIndent=0,rightIndent=20)]
    story.append(toc)
    story.append(Spacer(1,10))
    story.append(table([["Part / marks","Evidence IDs / pages","Current readiness"],
        ["A / 20","A01-A04 / "+(ranges or {}).get("A","see contents"),"Complete handoff, case and contract material retained."],
        ["B / 25","B01-B05 / "+(ranges or {}).get("B","see contents"),"Original deployed A/B cases and agreed local special setups complete at their stated scopes; A decision and B concurrence received."],
        ["C / 20","C01-C03 / "+(ranges or {}).get("C","see contents"),"Incoming exercise finding and outgoing confirmed Workflow finding classified and dispositioned."],
        ["D / 35","D01-D08 / "+(ranges or {}).get("D","see contents"),"Correction, review, CI, deployment and independent retest chain retained. D accepted ClassPulse on 27Nov; C confirmation received."]]))
    story.append(p("These are evidence-readiness statements, not awarded scores. The later instructor clarification supplies the standardized no-defect exercise procedure; the old generic TA-assignment wording is historical."))

    section(story,"A - Preparation and handoff (20)")
    story+=md("""ClassPulse Sprint 1 covers authentication, authoring/publish/close, eligible identified responses, one response per respondent, persistence and owner aggregates. Later editing, extra question types, anonymous mode and exports are excluded. The immutable protected tag v1.0.0-sprint1 peels to d4bad74211729032697164f378638efb834a67b6.

A01: the complete original UAT-01-12 cases appear in Appendix A. A02: applicable acceptance criteria and STS rows appear in Appendix B. A03: C/D independently audited important Sprint 1 coverage and added CD-01-08; baseline outcomes and the current gap are documented below. A04: role labels and inputs are synthetic, credentials privately exchanged, dependencies declared and evidence retained. No passwords, cookies or production connection strings belong in this PDF.

Use the exact release records; CP-V01's original observations are not relabeled as a fresh run on CP-FIX-001. Retain surveys26/27, responses13-16, new Cloud drafts28/29 and original LOCAL exercise drafts3/6/9 in their separate namespaces. New fixture accounts are additive; student3 remains CPE231-only. Tests must not reset shared or Cloud data.
""")
    story.append(table([["Version","Exact source / serving mapping"],["CP-V01 baseline run","1fe3e3b82dfb0537be30223c9b598b3479b4affe / classpulse-00006-6w6; digest sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795. Historical 100% during those runs."],["CP-EX-001 faulty exercise","4199888409fefafa920a773991d735f14ffb4ac8 / original sprint-1-staging; D-owned isolated local runtime. Cloud revision/traffic N/A."],["CP-FIX-001 corrected deployed candidate",CP+" / classpulse-00007-6t9 / 100% in A's26Nov17:34:24 Cloud readback; Registry source mapping17:37:19. Not a fresh C/D Console readback."],["Digest roles","Index sha256:ff599f3bdf57eb83d2840709b83fbdc5b1e56ae5994e4866e10e5dfa8d25a89f includes linux/amd64 runtime sha256:e00257d3b1c9cfdaabbe9b3f1d238c1d26fb342665f80122dcddc4550bc4388d, matching Cloud Run."]]))

    section(story,"B - Independent Workflow execution (25)")
    story.append(p("B01-B03 are A/B's actual independent work on Workflow, not C/D's ClassPulse results. Original release82a4806b5291b57ad7e76a28fb7d40e1e947b9a6 / marker82a4806b5291 / scd928edd-00007-477 /100%, digest6554d7f8cccdf1b4ded95f3f7d1a2560a786b0ecf7613cab62d59d942613a4fb, mapped by C/D24Nov20:51:51-58. A/B observed the marker. Browser engine/private-window details were not exposed; later C/D A3 accepts the documented logout/replacement-tab setup at its actual scope."))
    story.append(table([["Case / operator","Actual result and evidence","Scope"],["UAT-01 / A Codex GPT-6,24Nov21:03:40-21:05:38","125.50 request e1cc8f10-ccb4-49b1-a391-3d44fd4e3f67 approved by assigned reviewer with blank reason; requester readback APPROVED and exactly SUBMITTED->APPROVED.","Scoped PASS; accepted setup variation."],["UAT-04 / A,21:06:19-21:07:20","Same request, fresh login/reviewer reload retain amount/status/two events; terminal decision control counts zero.","Scoped PASS; no process restart claimed."],["UAT-05 / A,21:07:42-21:09:45","Request b1f4b385-04b4-4e7a-905f-7f9091e65db2,300.00. Empty reason denied; reload retains SUBMITTED/one event. Valid reason persisted REJECTED/two events for requester.","Scoped PASS; UI validation, no inferred HTTP status."],["UAT-02 / B Codex GPT-6.1 Sol,21:27:28-21:34:37","Invalid0/0.001/1000000.01 rejected;0.01 and1000000.00 saved on dedicated IDs. C/D accepts ungrouped two-decimal display.","Scoped numeric UI PASS."],["UAT-03 / B, same run","Other requester/reviewer cannot list/read B's89.00 request d27f11e6-a057-4a1f-b190-980688127c63; owner readback unchanged SUBMITTED/one event.","Scoped UI isolation PASS; backend probes separate."],["UAT-06 / B-reported human21:57:46","403 FORBIDDEN; before/after200 preserve125.50/SUBMITTED/one event, unchanged:true. Initial BLOCKED checkpoint superseded for this probe.","C/D scoped PASS; fresh marker/expanded identity absent in capture, later continuity corroborated."]]))
    story.append(p("A recorded3case paths,15 observations and26evidence files. B's automated run contains48 observations, not48cases. Original UAT-01 precedes UAT-04 and retains its shared ID. Original human/script evidence and limitations remain preserved; no equal-work or human-attendance claim is inferred from commit counts."))
    story.append(p("B04: A actually continued ADD-01 core and ADD-06 keyboard/mobile/retrieval on 26 Nov. A's start log was 20:58:05 Bangkok; 28 UI observations span 21:02:59-21:12:45. The final separate HTTP capture at 21:18:09-21:18:13 contains 25 requests and 30 passing assertions, zero failures; these are not case counts. Generic invalid-login outcomes, role/reload, ordinary logout, signed-out denial, value-free cookie metadata, keyboard feedback and approval/readback were observed. Full methods and limits appear in Appendix G."))
    story.append(p("A retained new request 5deda680-a443-4268-becb-8816bfebacaf, amount 125.50, APPROVED with exactly SUBMITTED and APPROVED events. All 21 prior requester-visible IDs remain and this was the only added ID. No pre-existing business record was changed by A. Both role readbacks agree. Reload is not a restart; no revoked-session replay, forced expiry, database or cloud operation was performed. Clients ended signed out."))
    story.append(p("B actually completed the permitted ADD02-05 runtime branches: 41 PASS subcase/probe observations, grouped 19/9/8/5, on 26Nov22:23:26.987-22:24:30.011 Bangkok, Codex GPT-6.2 Sol under book6349. Original credential/setup interruptions remain disclosed. A reviewed the supplied runner and raw JSON; 180 offline artifact checks passed. Fourteen new B requests and all prior22 requester-visible IDs remain in a final36-ID list. These observations include fixture creation and are not41whole cases."))
    story.append(p("A then completed the exact original-UAT01 terminal conflict branch on e1cc8f10-ccb4-49b1-a391-3d44fd4e3f67 at22:52:24-28: repeat APPROVE and REJECT both409 DECISION_CONFLICT, full authorized before/after identical. This is A's work; no fresh-record equivalence waiver is needed for the original-ID branch. A also captured three negative ADD05 response bodies with only error. The supplemental auth/readback/logout run passed31assertions,0fail; these are not31cases. No new business request or changed original record. Public marker matched before/after. Full review and per-observation index appear in Appendix H."))
    story.append(p("B05: C/D's20:57:26 mapping/go-ahead froze deployments/main merges through the team finish notice: source "+WF+" / scd928edd-00009-fsg /100%, digest sha256:06e187cc4d1a9dc809925d4b68873014092a1c0cd6e83e440ec9a9e9bb60193d. Public markers support continuity, not an A/B Cloud readback. C/D subsequently acknowledged the current A/B window complete via the user-relayed receipt; any further run needs a new coordinated method/window. Preserve all36requests, including14newB. Optional REJECTED-terminal retry/exploratory padded storage are NOTRUN. The complete seven-row special-setup inventory received27Nov is in Appendix I. No withdrawal or infrastructure change was performed."))
    story.append(p("B04-B05 completion27Nov: C/D accepted the exact-source independent isolated methods before execution. A ran the unmodified full test:sprint1 suite19/19PASS,0fail/skip, plus existing transactional schema.sql/rollback. A then captured7PASS observations across6case groups: exact controlled expiry, same-session rejection, absent/wrong-role mapping separately409/no saved request or history, database self-assignment refusal, forced500transaction rollback with complete history preserved, and actual application process restart with full same-ID/125.50/status/history comparisons under both roles. Actual supplement02:23:41-42Bangkok, local revisionN/A; no live/Cloud action.06cNwas not selected because06cRwas the agreed alternative. Runtime differences and earlier operational interruptions are disclosed in Appendix J."))
    story.append(p("Workflow decision: StudentA/Punge089 records Accepted with explicitly documented minor limitations for original Sprint1scope on source"+WF+", using prior live revision00009-fsg and agreed independent local special methods (revisionN/A). HumanB/book6349 confirms identity and concurs on27Nov with the same limits; receipt observed by16:18:31ICT, exact human-message instant unknown. B's earlier41scopedPASS remain separate; latest review did not rerun A's local cases. B reviewed ca77/PDF76pages and requests a fresh review of this acknowledgment-bearing revision/newCI before merge. WF-BUG001 remains fixed/independently verified."))

    section(story,"C - Defect reporting and triage (20)")
    story.append(table([["Finding","Observed behavior / classification","Disposition"],["C01 / CP-EX-F01, ClassPulse","D independently created a blank-title draft with a valid required rating on4199888. UAT02/CD02, AC11/19, BR02. Instructor-standardized exercise, not a natural defect found in healthy CP-V01. Minor functional severity adopted from C; earlier A Medium proposal retained.","Accepted defect; owner A/B. FIXED / INDEPENDENTLY VERIFIED on CP-FIX-001; Cloud28/29 and local3/6/9 retained."],["C02 / WF-BUG-001, Workflow","C/D initially found/designed the probe; A independently confirmed24Nov19:09:37 on82a4806.102400-byte JSON returned422;102401 returned500 rather than413.2tests:1PASS/1FAIL/0skip. Minor; no demonstrated outage/data loss/credential disclosure.","C/D corrected/released WF-FIX-001. A independent retest2original+5supplementalPASS; C/D closed as fixed/independently verified. Separate from ClassPulse PartD."],["C03 / coverage dependencies","Historical liveCD01BLOCKED was a verification gap, not an observed defect. Exact-source isolatedTEST04/auth8of8 now supplies required protocol/DB observations; natural8h/storage/log/rounding/internal schedule retain limits.","D Accepted27Nov01:35:39; C evidence confirmation/acknowledgment02:01:21. No livePASS or TA approval invented. Workflow special cases remain separate."]]))
    story.append(p("Workflow correction historical lineage: RED0e489731, GREEN84a62c7, developer CI45407729755 recorded17/17 plusDocker. Corrected main ad2cbef67decf9953219694898327dea0bb66034 / markerad2cbef67dec / scd928edd-00008-9zd /100%, digest26459db1d0278afcac49ec298c2c7d0523c7fc6eef75eeb40e7f18561e34ca43. A's actual independent retest24Nov23:03:13-15Bangkok passed2original and5supplemental checks. A did not supply C/D's peer approval or relabel developer tests independent UAT."))

    section(story,"D - Correction, deployment and independent retest (35)")
    closure=read(SRC/"docs/labs/lab-06/cp-ex-f01-closure.md")
    story+=md(between(closure,"## Finding and correction","## Independent retest"))
    story.append(p("Controlled exposure checks are also retained honestly: healthy base9bf820ac recorded139server/1clientPASS and builds. Faulty4199888 recorded134serverPASS/5FAIL/0skip, client1PASS and builds. ExposureCI45666188098 failed as expected on the same5server assertions; downstream CI stages were skipped after failure. This did not disable tests or authorize a faulty main deployment. Later corrected CI passed. The18normal local developer HTTP observations were smoke evidence, not independent UAT or a no-defect conclusion."))
    story.append(p("D01-D03: the following exact regression excerpt and actual outputs establish a meaningful failure, the same assertions passing and preserved history. All initial failures/skips remain disclosed; no test was weakened or disabled."))
    code=subprocess.check_output(["git","show",CP+":server/tests/api/uat6TitleRegression.test.ts"],cwd=ROOT).decode("utf-8")
    story.append(Preformatted("\n".join(f"{i+1:3} {line}" for i,line in enumerate(code.splitlines()) if 15<=i<88),styles["Code2"],maxLineLength=104))
    story.append(p("Actual repeated RED: source29c1d51, output committed at aed4be8 before final fix; command npm test -- tests/api/uat6TitleRegression.test.ts,2failed/2passed/0skipped. Display line wrapping is editorial; original output is retained."))
    red=read(EV/"exercise-correction-20261126/red/reported-case-tests.txt")
    story.append(Preformatted(red,styles["Code2"],maxLineLength=104))
    diff=subprocess.check_output(["git","diff","29c1d51bc6c884dac60ae1f86480e3bce4c756ee","3d6f0874ccbaa8a14756ada9b12c2e20fa003e2b","--","server/src/lib/surveyValidation.ts"],cwd=ROOT).decode("utf-8")
    story.append(p("D04: relevant correction diff; existing minimum title guard restored."))
    story.append(Preformatted(normalize(diff),styles["Code2"],maxLineLength=104))
    story.append(p("Same focused command at final fix3d6f087:4passed/0failed/0skipped. Full server143/143 across17files; client1/1; both builds. A's exact-release review separately ran all8preserved browser tests,0failed/0skipped. ReleaseCI45792413066 has no browser step; those8are local A evidence."))
    story.append(Preformatted(read(EV/"exercise-correction-20261126/green/reported-case-tests.txt"),styles["Code2"],maxLineLength=104))
    story.append(p("D05-D06: substantive review text and release verification appear in Appendix D. Mandatory featureCI45783244281 used a distinct integration tree; releaseCI45792413066 checkout98c7ee9 has the exact0b8tree. Human-initiated reviewed main mergeBee at17:30:18 triggered deployment45801951833SUCCESS. Index/runtime digests are explicitly associated; later Sprint2runtime was not released. Developer8public/5auth smoke observations are separate from D independent UAT."))
    story.append(p("Historical independent retest/closure record below predates the later27Nov accepted decision. Its references to pending final acceptance describe that earlier point; the current decision is stated afterward."))
    story+=md(between(closure,"## Independent retest").split("Subsequent decision:",1)[0])
    story.append(p("D07-D08 current decision: D records Accepted27Nov01:35:39 for ClassPulse Sprint1identified-survey scope onCP-FIX-001 "+CP+" / classpulse-00007-6t9. Exact-source independent isolated TEST04/auth8of8 passed27Nov01:15:20.386-01:15:23.973, exit0, CodexGPT-6.2Sol underThira/D, local revisionN/A. Initial missingSEED_PASSWORD setup failure is retained; final suite0fail/0skip. C/Ashira confirms the evidence and acknowledges DAccepted at02:01:21 without rerun. C did not have D's original decision wording/time available; A retains D's original record separately. Appendix I contains both records. Historical liveM01 staysBLOCKED and no instructor/TA approval is claimed. RequiredAC05 methodTEST05 passed locally; natural8h observation remains supplementalOPEN."))

    section(story,"Contributions, limitations and submission gates")
    story.append(table([["Participant","Actual contribution / limits"],["A/Punge089","Independent Workflow01/04/05, actual 26Nov ADD01 core/ADD06 keyboard-mobile continuation and bug confirmation/retest; standardized ClassPulse exercise/correction, actual RED/GREEN/repeat disclosure, release review/readbacks and evidence/report assembly. Human initiated cloud-changing release; Codex did not perform that human gate."],["B/book6349","Original Workflow02/03 and reported human06; actual26NovADD02-05 with41scopedPASSobservations and supporting-onlyAC04review; substantive correction review with actual4/143/1/build checks; integration/route/release PR work and actual PR123 review/merge. CombinedZIP integrity/provenance review received; no exact-finalPDF approval inferred."],["D/Thira","Independent exercise discovery and corrected Cloud5subcases, earlier local retention; historical NotAccepted26Nov then Accepted27Nov01:35:39. Human EdgeM01partial200/204 remainedBLOCKED. Exact-source isolated auth8of8 was CodexGPT-6.2Sol underD; no human-run label substituted."],["C/Ashira","Original/corrected retest evidence reviews without rerun; earlier decision review retained. Final27Nov02:01:21 note confirms isolatedTEST04/auth8of8 and acknowledges DAccepted with Codex assistance. No new C app execution claimed."]]))
    story.append(p("Other limits remain explicit: production storage/full-log inspection unobserved; auth8-test file excludes passwordTEST06; extra rounding tie NOTRUN; external duplicate outcome observed without proof of internal schedule. No new natural ClassPulse defect is asserted outside observed scope. Preserve source identities and distinguish local exercise, Cloud baseline and corrected deployment namespaces."))
    story.append(p("Document control: Human B identity and Workflow concurrence, C/D result acknowledgment, ClassPulse D acceptance and C evidence confirmation are received. Selected agreed methods are complete; residual limits remain explicit. The current PDF hash and input provenance are in the companion receipt. PR #133 records the actual current-file review and merge, and the submitting student retains the actual LEB2 receipt separately. Those administrative events do not change the test results. The reviewed PDF can be uploaded unchanged; no rebuild is required solely to record approval, merge or submission. No grade is assigned by the team."))

    section(story,"Appendix A - Complete ClassPulse UAT cases (A01)")
    story.append(p("Case definitions are quoted from the reviewed handoff at documentation head024ee302. The old proposed/awaiting-agreement section heading is historical; current technical inventory and actual scoped dispositions are stated in the main report. Definitions are not execution results. Private account passwords are excluded."))
    hand=read(SRC/"docs/labs/lab-06/handoff.md")
    story+=md("### Account labels, data rules and common UI setup\n"+between(hand,"### Account labels and data rules","### API probe helper"))
    story+=md(between(hand,"## Executable cases - proposed, awaiting agreement","## Coverage and limitations to agree explicitly"))
    story.append(p("Independent R11 additional case definitions (original IDs UAT-CD-01-08; shortened CD-01-08 in later records)","H2"))
    story.append(p("These are complete case definitions from C/D's independent review, not execution results. Historical proposed setup is interpreted with the recorded Product Team dispositions: inactive account and extra third CPE334 respondent were later provided and tested; original student3 stays CPE231-only. Missing-ID and authenticated PUT/DELETE interpretations follow the received A2/coverage records. Historical liveCD01 staysBLOCKED; the later DAccepted/C acknowledgment uses exact-source isolatedTEST04, not a fabricated live result."))
    r11=read(HERE/"inputs/classpulse-r11-additional-cases.md")
    story+=md(between(r11,"## Proposed additional cases","## Coordination and outstanding clarifications"))

    section(story,"Appendix B - Applicable ClassPulse AC and test specifications (A02)")
    for name in ["F-01-authentication.md","F-03-survey-authoring.md","F-04-response-submission.md","F-05-aggregate-summary.md"]:
        text=read(SRC/"docs/sprints/sprint-1"/name)
        story.append(p(name,"H2"))
        lines=text.splitlines();start=next(i for i,x in enumerate(lines) if re.match(r"## 9[. ]",x));end=next((i for i in range(start+1,len(lines)) if re.match(r"## 11[. ]",lines[i])),len(lines))
        story+=md("\n".join(lines[start:end]))

    section(story,"Appendix C - Complete Workflow cases and original contract (B01-B05)")
    originals=read(HERE/"inputs/workflow-original-cases.md")
    story+=md("## UAT-01: submit and approve\n"+between(originals,"## UAT-01: submit and approve","## Record results"))
    story.append(p("Additional A2 definitions below preserve proposed-era wording as historical source. C/D's received20:08applicability review confirms the cases for original Sprint1paths on41a8fefa; actual incomplete observations remain incomplete. The definitions themselves never establish PASS."))
    add=read(EV/"checkpoint-20261124/workflow-additional-cases-a2.md")
    story+=md("## Common execution rules\n"+between(add,"## Common execution rules","## Workflow Product Team disposition requested"))
    contract=read(HERE/"inputs/workflow-contract-v06.md")
    story.append(p("Original Workflow Sprint1contractv0.6 acceptance criteria and STS, pinned82a4806; later withdrawal is excluded.","H2"))
    story+=md(between(contract,"## Acceptance criteria and software test specification","## Product Definition of Done"))

    section(story,"Appendix D - Actual reviews and release checks (D05-D06)")
    for label,name in [("B correction review6070920924","b-correction-review.json"),("A release review6072306247","a-release-review.json")]:
        d=json.loads(read(EV/"corrected-retest-20261126"/name));story.append(p(label,"H2"));story+=md(d["body"])
    latest=json.loads(read(HERE.parent/"coordination-2011/pr123-reviewed-and-merged.json"))
    for review in latest["reviews"]:
        if review["author"]["login"]=="book6349" and review["state"]=="APPROVED":
            story.append(p("B receipt/document review - exact024ee302, mergeda3a0424","H2"));story+=md(review["body"])
    summary=json.loads(read(EV/"corrected-retest-20261126/a-release121-review-summary.json"))
    story.append(p("Actual A release-review checks (stored receipt)","H2"))
    story.append(Preformatted(json.dumps({k:v for k,v in summary.items() if k in ["head","focusedPassed","serverPassed","clientPassed","browserFullPassed","failed","skipped","builds","releaseCI","releaseCIConclusion","releaseCIActualCheckout","releaseCITreeEqualsCandidate"]},indent=2),styles["Code2"],maxLineLength=104))

    section(story,"Appendix E - Independent decisions and release applicability (D08)")
    story.append(p("Historical baseline case-by-case coverage on CP-V01. Later decision, source-continuity and method dispositions below supersede its earlier pending receipt states; these are not new runs on CP-FIX-001.","H2"))
    story+=md(read(HERE/"inputs/classpulse-baseline-coverage.md"))
    for name in ["CLASS-PULSE-ACCEPTANCE-DISPOSITION.md","C-ACCEPTANCE-DECISION-REVIEW.md","WORKFLOW-A2-RELEASE-APPLICABILITY.md"]:
        story+=md(read(NEW/name))
    story.append(p("The21:00-22:00proposal in the received applicability record is historical. The user now requests immediate testing and reports the readiness/no-deploy request sent. That request was later superseded by C/D's explicit 20:57:26 go-ahead/freeze and A's actual continuation recorded in the main report and Appendix G; B later completed scoped ADD02-05; A completed the original-ID/error-shape supplements. Appendix H supersedes those earlier execution-pending statements, without changing the historical source records. The records are retained byte-for-byte; typography and line wrapping here are editorial."))
    story.append(p("D's original corrected-release retest narrative (historical receipt; later decision/review above)","H2"))
    story+=md(read(EV/"corrected-retest-20261126/received-d/D-RETEST-REPORT.redacted.md"))

    section(story,"Appendix F - Selected readable visual evidence")
    story.append(p("The following figures are selected original evidence, with action, expected/actual, operator, time and version captions. API statuses, numeric IDs and unchanged-state assertions are corroborated by the retained JSON and case records; they are not inferred solely from screenshots. No screenshot was edited to alter application behavior. Original files are included in the input hash receipt."))
    figures=[
        (EV/"checkpoint-20261124/a-workflow/evidence/06-uat01-approved.jpg","B-F01 | Workflow UAT01 | A/Codex,24Nov21:05 | original82a4806 / revision00007-477. Expected assigned approval; actual APPROVED with two events. Later setup variation accepted."),
        (EV/"checkpoint-20261124/a-workflow/evidence/13-uat05-empty-reason-denial.jpg","B-F02 | Workflow UAT05 | A/Codex,24Nov21:07-21:09 | original82a4806 / revision00007-477. Required rejection reason message; reload preserved SUBMITTED/one event in accompanying readback. UI observation, no inferred HTTP status."),
        (EV/"exercise-correction-20261126/received-d/CP-EX-F01-created-draft.png","C-F01 | Original ClassPulse failure | D/Codex,26Nov14:58 |4199888 local, Cloud N/A. Expected400/title error; actual201 persisted blank-title Draft9. Numeric/API facts come from retained JSON, not screenshot alone."),
        (EV/"corrected-retest-20261126/received-d/CP-RT-01-error.png","D-F01 | Independent corrected retest | D/Codex,26Nov18:30 |Bee / A-mapped00007-6t9. Empty title returned400 VALIDATION_ERROR/title detail, inline message, unchanged owner IDs."),
        (EV/"corrected-retest-20261126/received-d/CP-RT-03-draft.png","D-F02 | Independent valid control | D/Codex,26Nov18:30 |Bee / A-mapped00007-6t9. Valid title returned201, Cloud Draft28, reload/readback200 and retained title/question. Local3/6/9 are separate records."),
    ]
    for path,caption in figures: figure(story,path,caption)
    section(story,"Appendix G - A actual Workflow continuation, 26 November")
    story.append(p("Historical first A run, before B continuation and A exact-ID supplement. Later execution states are in Appendix H; original scope/limitations remain preserved."))
    story += md(read(LIVE/"A-RESULTS.md"))
    receipt=json.loads(read(LIVE/"bundle-receipt.json"))
    story.append(p("Sanitized evidence bundle SHA256: "+receipt["sha256"]+". CRC and all 72 payload hashes verified. Private input-loader helpers and source-review scratch files are excluded. That earlier54-page artifact is historical; current-file approval is recorded separately in PR #133, not inferred from this old evidence receipt."))
    figure(story,LIVE/"11-keyboard-visible-focus.jpg","B-F03 | Workflow ADD06 | A/Codex,26Nov21:07 | source41a8fefa / revision00009-fsg. Visible keyboard focus on Submit. Required-title error and identical before/after list IDs are in separate JSON captures; no HTTP status inferred from this image.")
    figure(story,LIVE/"24-mobile-requester-final-readback.jpg","B-F04 | Workflow ADD06 | A/Codex,26Nov21:11 | source41a8fefa / revision00009-fsg. 390x844 requester readback of the newly approved 125.50 request with two events. API readbacks independently agree; no restart claimed.")
    section(story,"Appendix H - B continuation and A closure evidence")
    story.append(p("HISTORICAL SNAPSHOT - 26 NOVEMBER 2026. The following original execution and pending-decision statements describe that point in time. They do not reopen the later completed special methods or replace the current ClassPulse decision. Later outcomes are in Appendices I-K.","Status2"))
    historical=read(CLOSURE/"COMBINED-RESULTS.md")
    historical=historical.replace("## Scope and limitations", "## Scope and limitations (historical 26 November)\n\nHistorical status only: later agreed local methods and A's Workflow decision are recorded in Appendix J; C/D and B-side evidence reviews are in Appendix K.")
    historical=historical.replace("## B's AC04 evidence review", "## B's AC04 evidence review (historical)\n\nThis original review predates the exact-source TEST04 run, D Accepted decision and C confirmation. Preserve its original words as history, not a current pending-work instruction.")
    story += md(historical)
    story.append(p("Historical local AC04 evidence and earlier A rubric interpretation","H2"))
    story.append(p("C/D supplied local15PASS (4isolation/11flow) on CP-FIX-001 Bee,26Nov21:58:51-52 Bangkok, revisionN/A. Two independent clients showed session rows2->1->0 and unaffected control client. This new harness does NOT replay a saved cookie. A reviewed25artifact/source checks; B independently reviewed the corrected evidence and eight identical CPV01/CPFIX blobs. A/B did not rerun D's harness. Earlier TEST04 supplies isolated replay/deletion/clearing support."))
    story.append(p("The following preserved26Novnote records A's earlier interpretation, not an instructor ruling. A later clarified that F01 specifies isolatedTEST04 and does not itself require Cloud-only execution; D subsequently issued Accepted using actual exact-source isolated evidence and C acknowledged it. Historical execution outcomes are unchanged and no TA approval is claimed."))
    story += md(read(LOCALAC04/"RUBRIC-CORRECTION.md"))
    story.append(p("Historical live M01 readiness and partial attempt","H2"))
    story.append(p("A's26Nov22:14:40 authenticated read-only Cloud mapping confirmed healthy00007-6t9/100%/runtimee00257 associated withBee. D reported Edge start23:19, before/me200 image23:27 andlogout204/SignIn image23:36; exactHTTPtimes and finish were not recorded. Cookie clearing and old-session401 were not observed in that live attempt. A's bounded audit plus27Nov00:21:56 readback supported version continuity, not continuous observation. The historical live result remainsBLOCKED. Later isolatedTEST04 and D/C decisions are in Appendix I."))
    section(story,"Appendix I - Accepted ClassPulse record and Workflow setup inventory")
    story.append(p("Current ClassPulse decision","H2"))
    story.append(p("Historical document snapshot below: D's issued decision predates receipt of C's02:01:21 confirmation. Its statement that C's original confirmation was not supplied describes that earlier receipt only; the actual C note is embedded immediately afterward. Current DAccepted/Cacknowledgment are received.","Caption2"))
    story+=md(read(ACCEPTED/"D-ACCEPTANCE-STATUS.md"))
    story.append(p("The original D record predates C's following confirmation. Retain its wording/time as issued; C's final note is newly received evidence, not a backdated replacement of an earlier review."))
    story+=md(read(FINALC/"C-REVIEW.md"))
    story.append(p("Independent exact-source isolated run","H2"))
    story+=md(read(ACCEPTED/"CP-FIX-001-TEST-04-ISOLATED/REPORT.md"))
    story.append(p("The supplied run REPORT was written before the later DAccepted/C confirmation. Its pending-review wording is historical. The actual run/output remain unchanged. A's20artifact/source checks passed; no A app rerun occurred."))
    story.append(p("The following display converts the original checkmark to ASCII [PASS] for font compatibility; original output bytes are preserved in the supplied archive."))
    story.append(Preformatted(read(ACCEPTED/"CP-FIX-001-TEST-04-ISOLATED/auth-test-output.txt").replace("\r", "").replace("\u2713", "[PASS]"),styles["Code2"],maxLineLength=104))
    story.append(p("Audit files and provenance","H2"))
    for path in [ACCEPTED/"A-ARTIFACT-REVIEW.json", ACCEPTED/"CP-FIX-001-TEST-04-ISOLATED/run-record.json", ACCEPTED/"CP-FIX-001-TEST-04-ISOLATED/fixture-setup-failure.json", ACCEPTED/"CP-FIX-001-TEST-04-ISOLATED/fixture-setup-failure-output.txt", ACCEPTED/"CP-FIX-001-TEST-04-ISOLATED/setup-output.txt", FINALC/"A-RECEIPT.json"]:
        read(path)
    story.append(p("TEST04archiveSHA2565635f08cb986f5a3571f2c947b8cd3b8da44555b46f81f78b9bcc455ec1fa89f; CRCpass, six payload hashes computed byA (no supplied manifest). Source/revision/times/operator and original setup-failure output are retained in the artifact index. C27Novconfirmation and full Workflow inventory passed12offline checks; initial reviewer Markdown-row counter was corrected to include the separator, with source files unchanged."))
    story.append(p("Complete partner Workflow special-setup status","H2"))
    story+=md(read(FINALC/"SPECIAL-SETUP-STATUS-20261127.md"))
    story.append(p("The preceding02:01:21 setup table is historical, before the ProductTeam accepted A's isolated method and A executed it. Appendix J records the actual later outcomes.06cRwas selected,06cNnot selected as its alternative; no original OPEN/NOTRUN record is rewritten as a historical PASS."))
    section(story,"Appendix J - Completed independent Workflow special methods")
    story.append(p("Method agreement and independent execution","H2"))
    story+=md(read(SPECIAL/"PRODUCT-TEAM-METHOD-AGREEMENT.txt"))
    story+=md(read(SPECIAL/"RESULTS.txt"))
    case_rows=json.loads(read(SPECIAL/"case-results.json"))
    rows=[["Evidence / case / time Bangkok","Expected","Measured actual / result"]]
    for entry in case_rows:
        actual=entry["actual"]
        if entry["evidenceId"]=="WF-ISO-07":
            result=f"PASS. Actual PID{actual['oldPid']}->{actual['newPid']}; sameDB/no reseed. ID{actual['id']},125.50THB,APPROVED,two original events; complete records equal under both roles."
        elif entry["evidenceId"]=="WF-ISO-06":
            result=f"PASS.500INTERNAL_ERROR; ID{actual['id']} remainsSUBMITTED. Complete before/after records/history equal; reviewer readback matches."
        else:
            result="PASS. "+json.dumps(actual,ensure_ascii=True,separators=(",",":"))
        rows.append([entry["evidenceId"]+" / "+entry["case"]+" / "+entry["timeBangkok"],entry["expected"],result])
    story.extend([PageBreak(),p("Measured isolated Workflow observations - WF-ISO-01 to07","H2")])
    story.append(table(rows))
    story.append(p("All7observations are A's independent local work, source"+WF+", revisionN/A. They supplement earlier deployed user-facing UAT; they are not C/D developer results copied into actual fields. The7count includes two mapping branches and is not7wholeoriginalcases.06cNnotselected is an approved alternative disposition, not a PASS or a required blocked test."))
    story.append(p("Actual existing suite output, unfiltered","H2"))
    output=read(SPECIAL/"attempt-02/logs/unmodified-full-suite.txt")
    output=output.replace("\u2714","[PASS]").replace("\u2713","[PASS]").replace("\u2139","#")
    story.append(p("Display-only ASCII substitutions replace checkmarks/info markers; original output bytes remain in the evidence package.19/19includes two named later withdrawal tests on this source; they ran without skipping but are outside Lab6Sprint1acceptance assertions."))
    story.append(Preformatted(output,styles["Code2"],maxLineLength=104))
    story.append(p("Relevant unchanged developer assertions, independently executed by A","H2"))
    auth=read(SPECIAL/"pinned-source-excerpts/tests/auth.test.mjs").splitlines()
    excerpt="\n".join(f"{i+1:3} {line}" for i,line in enumerate(auth) if 58<=i<66 or 77<=i<87)
    story.append(Preformatted(excerpt,styles["Code2"],maxLineLength=104))
    decisions=read(SPECIAL/"pinned-source-excerpts/tests/decisions.test.mjs").splitlines()
    story.append(Preformatted("\n".join(f"{i+1:3} {line}" for i,line in enumerate(decisions) if 102<=i<114),styles["Code2"],maxLineLength=104))
    story.append(p("Self-assignment and fixture rollback","H2"))
    sql=read(SPECIAL/"pinned-source-excerpts/tests/schema.sql").splitlines()
    sql_excerpt="\n".join(f"{i+1:3} {line}" for i,line in enumerate(sql) if i<25)
    sql_excerpt+="\n    -- Other constraint checks omitted from display; full script ran unchanged.\n"
    sql_excerpt+="\n".join(f"{i+1:3} {line}" for i,line in enumerate(sql) if i>=len(sql)-2)
    story.append(Preformatted(sql_excerpt,styles["Code2"],maxLineLength=104))
    story.append(Preformatted(read(SPECIAL/"attempt-03/logs/unmodified-schema-check.txt")+"\nBefore counts: "+read(SPECIAL/"attempt-03/logs/schema-before.txt").strip()+"\nAfter counts: "+read(SPECIAL/"attempt-03/logs/schema-after.txt").strip(),styles["Code2"],maxLineLength=104))
    story.append(p("Supplemental readbacks also observedSQLSTATE23514 on isolated self-mapping and preserved the original mapping. This is a database constraint assertion; no HTTP409is claimed for self-assignment."))
    story.append(p("Actual restart comparison","H2"))
    restart=case_rows[-1]["actual"]
    rows=[["Readback","ID / amount / status","Complete history check"]]
    for key in ["beforeRequester","afterRequester","beforeReviewer","afterReviewer"]:
        rec=restart[key]
        rows.append([key,rec["id"]+" / "+rec["amount"]+" / "+rec["status"]," -> ".join(e["type"]+":"+e["id"] for e in rec["history"])])
    story.append(table(rows))
    story.append(p("Stop requested"+restart["stopRequested"]+"; oldPID"+str(restart["oldPid"])+" exitedSIGTERM at"+restart["stopped"]+"; newPID"+str(restart["newPid"])+" ready"+restart["newProcessReady"]+". Times above areUTC; table observations useBangkokUTC+7. Same origin"+restart["origin"]+", same isolated PostgreSQL database and no reseed between readbacks. Full JSON snapshots also compare all other fields, timestamps and reasons. Loopback listener evidence is retained separately; this is not a CloudRunrestart."))
    story.append(p("A's independent Workflow disposition - original issued record","H2"))
    story.append(p("This is A's02:28:53issued record, preserved unchanged. Its B-not-received field describes that earlier time and is superseded only by the later B owner confirmation in Appendix K. A's original decision/time are not rewritten.","Caption2"))
    decision=json.loads(read(SPECIAL/"A-WORKFLOW-DECISION.json"))
    story.append(p(decision["decision"]+". Recorded"+decision["recordedAtBangkok"]+" by"+decision["decisionOwner"]+", assisted by"+decision["assistance"]+". Accepted exact source"+decision["acceptedSourceCommit"]+"; prior live revision"+decision["liveRevisionForPriorLiveChecks"]+", local special methodsN/A. Earlier A/B independent deployed observations and closedWF-BUG001retetst remain the baseline. No unresolved observed critical/major defect or selected required blocked method is asserted."))
    story.append(p(decision["studentBFinalDecisionAcknowledgment"]))
    for limit in decision["limits"]:story.append(p(limit))
    story.append(p("Earlier operational failures retained","H2"))
    story.append(p("Attempt01: Windows pg_ctl inherited an output-file handle; A logger cleanup failed before app tests, owncluster immediately verified/stopped. Attempt02: unchanged fullsuite19/19passed, then A parser expected TAP rather than spec summary; reused original passing output/time. Attempt03: unchangedSQLpassed/rolledback; supplemental host-format assertion stopped before app observations, corrected to canonical PostgreSQLhost(). Attempt04: final seven supplementsPASS. No product/test source change, skipped assertion or fabricated product failure. All original failed operational records are in the handoff; fresh clusters were separate. Private credentials and cluster data are excluded."))
    for path in [SPECIAL/"run-record.json",SPECIAL/"supplemental-results.json",SPECIAL/"listeners.jsonl",SPECIAL/"ARTIFACT-REVIEW.json"]:read(path)
    section(story,"Appendix K - Partner acknowledgment and B-side report review")
    acknowledgment=json.loads(read(SPECIAL/"CD-PRODUCT-ACKNOWLEDGMENT.json"))
    story.append(p("C/D Product Team artifact acknowledgment","H2"))
    story.append(p("Received through the user; the external author's exact timestamp/personal signer/model was not supplied and is not invented. This is an evidence review acknowledgment, not a new app execution."))
    story+=md(acknowledgment["quotedResponse"])
    story.append(p("Historical B-side evidence review recommendation - before owner confirmation","H2"))
    story+=md(read(BREVIEW/"ClassPulse_B_Workflow_decision_review_20261127.txt"))
    story.append(p("B-side PDF comparison of the earlier74page copy","H2"))
    story+=md(read(BREVIEW/"ClassPulse_B_PDF_comparison_20261127.txt"))
    read(BREVIEW/"RECEIPT.json")
    story.append(p("Disposition of those earlier findings: historical26Nov pages now carry dated labels; the old pending-C sentence is explicitly historical; the measured table begins on a fresh page with footer clearance. The original74page/hash and both review files remain unchanged. Their human-pending wording was true when issued; the following new owner record supersedes that identity/decision state. It does not approve this future revised PDF or authorize PR merge/deployment."))
    story.append(p("New B owner confirmation and ca77 review","H2"))
    story+=md(read(BOWNER/"ClassPulse_B_Workflow_confirmation_and_PR133_review_20261127.txt"))
    owner=json.loads(read(BOWNER/"RECEIPT.json"))
    story.append(p("Current recorded B concurrence: Papangkorn Jitvoottikrai /67070503421 /book6349, acknowledged date27Nov2026. Exact human-message time is unavailable; B's agent had observed the receipt by16:18:31ICT. This upper bound is not the acknowledgment's exact instant. A's receipt time and file creation time are not substituted. B confirms the limited Workflow product decision and enumerated conditions, without app rerun, and asks for new-head/greenCI review after this insertion. The earlier25/25verification and approval assessment belong to ca77/PDFhashf4739f, not this changed PDF. No GitHub review, merge or future-file approval is invented."))
    return story

doc=Report(PDF)
doc.multiBuild(build())
first=dict(doc.page_map)
keys=[("A","A - Preparation and handoff (20)"),("B","B - Independent Workflow execution (25)"),("C","C - Defect reporting and triage (20)"),("D","D - Correction, deployment and independent retest (35)")]
all_starts=sorted(first.values())
ranges={k:f"{first[t]}-{next(x for x in all_starts if x>first[t])-1}" for k,t in keys}
doc=Report(PDF)
doc.historical_bounds=(first["Appendix H - B continuation and A closure evidence"],first["Appendix I - Accepted ClassPulse record and Workflow setup inventory"]-1)
doc.multiBuild(build(ranges))
pages=len(PdfReader(str(PDF)).pages)
assert all(doc.page_map[t]==first[t] for _,t in keys),"Page ranges changed; regenerate"
manifest={"draft":False,"notForSubmission":False,"submissionCandidate":True,"submitted":False,"currentFileApprovalClaimed":False,"approvalRecord":"PR #133; review the actual head and this PDF hash before upload. No rebuild solely for approval/merge/submission.","pdf":PDF.relative_to(ROOT).as_posix(),"pdfSha256":hashlib.sha256(PDF.read_bytes()).hexdigest(),"pages":pages,"partPageRanges":ranges,"headings":doc.page_map,"documentationHead":"024ee302ff371c769fc8bcc07fad2818017e706b","documentationMerge":"a3a0424f6574696363ea5268131725ae2f390ba2","classPulseCandidate":CP,"classPulseRevision":"classpulse-00007-6t9","currentDecision":"D Accepted27Nov01:35:39; C evidence confirmation/acknowledgment02:01:21 received; historical liveM01BLOCKED retained","workflowDecision":"A Accepted with explicitly documented minor limitations on exact41a8fefa; human B identity and concurrence confirmed27Nov, receipt observed by16:18:31ICT, exact instant unknown","bHumanDecisionConfirmed":True,"bAcknowledgedDateBangkok":"2026-11-27","bHumanMessageExactAt":None,"bReceiptObservedByBangkok":"2026-11-27T16:18:31+07:00","bReviewedPreviousHead":"ca77cc1ba8508ca7492452d3b3e28552dc180fcc","workflowRemainingCases":"Selected methods complete;06cNnotselected; C/D acknowledgment and humanBidentity/decision concurrence received. Administrative current-file review/merge and actual human submission are tracked separately; upload the same reviewed PDF bytes.","newAppTestsRunDuringThisBuild":False,"retainedRuntimeEvidence":True,"workflowAActualSource":WF,"workflowAActualRevision":"scd928edd-00009-fsg (prior live); N/A isolated special setups","inputHashes":used}
(OUT/"report-receipt.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
print(json.dumps({k:v for k,v in manifest.items() if k not in ["inputHashes","headings"]},indent=2))
