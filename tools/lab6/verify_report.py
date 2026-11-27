"""Verify the actual Lab6 document, immutable inputs, layout and decision scope."""
from pathlib import Path
import hashlib
import json
import re
import sys

import pymupdf
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[2]
FINAL=ROOT/'evidence/lab-06/finalization-20261127'
RECEIPT=ROOT/'docs/labs/lab-06/report/report-receipt.json'
manifest=json.loads(RECEIPT.read_text(encoding='utf-8'))
pdf=ROOT/manifest['pdf']
reader=PdfReader(pdf)
doc=pymupdf.open(pdf)
text='\n'.join(page.extract_text() or '' for page in reader.pages)
compact=re.sub(r'\s+','',text)
checks={}
def verify(name,condition):
    checks[name]=bool(condition)

verify('PDF hash matches exact receipt',hashlib.sha256(pdf.read_bytes()).hexdigest()==manifest['pdfSha256'])
verify('PDF page count matches',len(reader.pages)==manifest['pages'])
verify('review copy not a submitted final',manifest['draft'] and manifest['notForSubmission'] and all('DRAFT - NOT FOR SUBMISSION' in p.get_text() for p in doc))
verify('all actual read input hashes match',all((ROOT/name).is_file() and hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest for name,digest in manifest['inputHashes'].items()))
provenance=json.loads((FINAL/'input-provenance.json').read_text())
verify('curated input bytes preserved',all((ROOT/name).is_file() and hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==item['sha256'] for name,item in provenance['files'].items()))
verify('no private cluster or dependency tree in curated paths',not any(any(p in ['.private','.git','node_modules'] for p in Path(name).parts) for name in provenance['files']))
special=FINAL/'workflow-special-setup-20261127'
run=json.loads((special/'run-record.json').read_text())
cases=json.loads((special/'case-results.json').read_text())
verify('exact isolated Workflow source and revision',run['source']=='41a8fefa7a5d93b6531dff88daae39574d72dcb7' and run['servingRevision']=='N/A')
verify('full unchanged suite 19 pass without skipped or failed',run['unmodifiedSuiteCounts']=={'tests':19,'pass':19,'fail':0,'skipped':0,'cancelled':0})
verify('seven measured independent observations',len(cases)==7 and all(c['result']=='PASS' and c['servingRevision']=='N/A' for c in cases))
restart=cases[-1]['actual']
verify('actual restart complete both-role comparison',restart['oldPid']!=restart['newPid'] and restart['sameDatabase'] and not restart['reseedBetweenObservations'] and restart['beforeRequester']==restart['afterRequester']==restart['beforeReviewer']==restart['afterReviewer'])
verify('own cluster stopped and source unchanged',run['sourceCleanAfter'] and run['isolatedClusterStopped'] and not run['postgresListenerAfter'])
verify('original SQL fixture rollback',run['schemaFixtureRollback']['equal'] and run['schemaFixtureRollback']['before']==run['schemaFixtureRollback']['after']=='0|0|0|0')
verify('expected injected failure not hidden','Attempt01' in text and 'Attempt02' in text and 'Attempt03' in text and 'Attempt04' in text)
verify('later scope excluded','laterwithdrawaltests' in compact and 'outsideLab6Sprint1acceptanceassertions' in compact)
verify('C D accepted record and historical live block distinct','01:35:39' in text and '02:01:21' in text and 'Historical' in text and 'BLOCKED' in text and 'bee0d122bf23410e3d2db69649ad5e44959b6cd8' in text)
owner_dir=FINAL/'received-b-owner-confirmation-20261127'
owner=json.loads((owner_dir/'RECEIPT.json').read_text())
verify('historical B recommendation distinct from later owner confirmation','HUMANBCONFIRMATIONPENDING' in compact and 'recommendconcurrence' in compact and manifest['bHumanDecisionConfirmed'] is True and 'supersedesthatidentity/decisionstate' in compact)
verify('B owner identity decision and bounded time preserved',owner['humanIdentityConfirmed'] is True and owner['humanDecisionConfirmed'] is True and owner['fullName']=='Papangkorn Jitvoottikrai' and owner['studentId']=='67070503421' and owner['sourceCommit']==run['source'] and owner['acknowledgedDateBangkok']=='2026-11-27' and owner['humanMessageExactAt'] is None and manifest['bHumanMessageExactAt'] is None and owner['receiptObservedByBangkok']==manifest['bReceiptObservedByBangkok']=='2026-11-27T16:18:31+07:00' and '16:18:31' in text and 'upperboundisnottheacknowledgment' in compact and hashlib.sha256((owner_dir/owner['sourceFile']).read_bytes()).hexdigest()==owner['sourceSha256'])
verify('original B reviews embedded','Bownerdecisiontime:PENDINGDIRECTHUMANCONFIRMATION' in compact and 'HUMANBIDENTITY/FINAL-FILECONFIRMATIONPENDING' in compact)
verify('Product Team result acknowledgment embedded','acknowledgesallsevenpassingobservations' in compact and 'sixagreedisolatedWorkflowcasegroups' in compact)
h=manifest['headings']
hist_start=h['Appendix H - B continuation and A closure evidence']
hist_end=h['Appendix I - Accepted ClassPulse record and Workflow setup inventory']-1
verify('every historical H page explicitly labeled',all('HISTORICAL 26 NOVEMBER SNAPSHOT' in doc[n-1].get_text() for n in range(hist_start,hist_end+1)))
verify('old pending C statement prefaced as historical','Historicaldocumentsnapshotbelow' in compact and 'CurrentDAccepted/Cacknowledgmentarereceived' in compact)
table_pages=[page for page in doc if 'Measured isolated Workflow observations - WF-ISO-01 to07' in page.get_text()]
verify('observation table begins on its own page',len(table_pages)==1 and all(f'WF-ISO-{n:02}' in table_pages[0].get_text() for n in range(1,8)))
table_bottom=None
if table_pages:
    page=table_pages[0]
    horizontal=[]
    for drawing in page.get_drawings():
        for item in drawing['items']:
            if item[0]=='l':
                a,b=item[1:]
                if abs(a.y-b.y)<0.1 and abs(a.x-b.x)>350 and a.y>100:
                    horizontal.append(a.y)
    if horizontal:table_bottom=max(horizontal)
verify('table has at least 28mm footer clearance',table_bottom is not None and table_bottom < table_pages[0].rect.height-28*72/25.4)
body_bottoms=[]
for n,page in enumerate(doc,1):
    for block in page.get_text('dict')['blocks']:
        for line in block.get('lines',[]):
            for span in line['spans']:
                if 'DRAFT - NOT FOR SUBMISSION' not in span['text'] and span['text']!=str(n):
                    body_bottoms.append(span['bbox'][3])
verify('all body text remains clear of footer',bool(body_bottoms) and max(body_bottoms)<790)
verify('no connection string or raw session value in PDF','postgresql://' not in text and 'postgres://' not in text and not re.search(r'(?:cp_session|session)=[a-f0-9]{32,}',text))
unsafe=[]
for name in provenance['files']:
    p=ROOT/name
    if p.suffix.lower() in ['.txt','.json','.md','.mjs','.ts','.sql']:
        s=p.read_text(encoding='utf-8-sig')
        if 'postgresql://classpulse_app:' in s or 'postgresql://uat6_local:' in s or re.search(r'(?:cp_session|session)=[a-f0-9]{32,}',s):unsafe.append(name)
verify('no actual credentials or raw cookies in curated text',not unsafe)
report={'passed':sum(checks.values()),'failed':sum(not value for value in checks.values()),'checks':checks,'pdf':manifest['pdf'],'pdfSha256':manifest['pdfSha256'],'pages':manifest['pages'],'tablePage':table_pages[0].number+1 if table_pages else None,'tableBottomY':table_bottom,'footerClearanceMm':(table_pages[0].rect.height-table_bottom)*25.4/72 if table_bottom is not None else None,'humanBDecision':'CONFIRMED27Nov; receipt observed by16:18:31ICT; exact human-message time unknown','revisedPdfApproval':'PENDING fresh review; earlier review belongs to ca77/f4739f PDF','appTestsRerunByVerifier':False}
(FINAL/'artifact-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
sys.exit(1 if report['failed'] else 0)
