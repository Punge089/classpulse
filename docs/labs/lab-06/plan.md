# Lab 6 coordination and execution plan

## Latest verified state —24November2026, after WF-FIX-001 retest

- Workflow WF-BUG-001 independent corrected-live retest **PASS**:2original boundary tests plus5supplemental checks,0failures/skips,23:03:13–15Bangkok. Full sourcead2cbef67decf9953219694898327dea0bb66034; markers before/afterad2cbef67dec; revision00008-9zd,100%. [Independent result](../../../evidence/lab-06/checkpoint-20261124/a-wf-bug-retest/INDEPENDENT-RETEST.md). C/D cloud mapping is attributed; A checked served source/browser and remote deployment. All A/B business records were left untouched.
- [C/D's latest B-v2 dispositions](../../../evidence/lab-06/checkpoint-20261124/received-cd-corrected/EN037-B-V2-DISPOSITION.md) accept the recorded same-tab/logout02/03 paths, numeric1000000.00 display and scoped06denial; no repeat solely for those capture limits. Earlier original82a4806 snapshots remain historical. B06 still lacks a fresh marker/expanded identity in its screenshot; predeployment C/D readback corroborates release continuity without inventing that capture. The six original Workflow paths have scoped PASS evidence; required unexecuted additional branches and whole-product acceptance remain pending.
- ClassPulse [actual read-only baseline](../../../evidence/lab-06/checkpoint-20261124/fixture-baseline/README.md) completed22:53:02Bangkok:target emails absent, student2id5/student3id4, student3CPE231-only. No accounts created. This is an agent-observed point-in-time snapshot, not human-approved live apply.
- B contract81 merged6dc55d8 after exact-head approval/CI. B implemented PR83; A ran138server tests/build/typecheck at294efc4 but independently reproduced a normalized-email concurrency race and [requested changes](../../../evidence/lab-06/checkpoint-20261124/repository/PR83-REVIEW.md). No live fixture apply until B's regression/fix and new A review, then human target/baseline approval and execution.
- C/D still needs the new inactive/third-respondent fixtures for CD01/CD07, controlled-session coverage disposition and actual peer contribution evidence. ClassPulse PartD is incomplete. The Workflow fix and provisioner review do not substitute. A sends the scoped retest return; B fixes83 and reviews82 at its current head. Final acceptance/PDF/human submission remain pending. Automations remain paused.

Earlier dated paragraphs below retain the sequence of evidence received. Where they say corrected deployment/retest, B setup disposition, live email absence, or provisioner implementation is pending, this latest section supersedes them. Raw incoming/execution files are unchanged.

Status: A-owned Issue79 evidence consolidation, current as of 24 November 2026. B merged PR75; actual independent observations and remaining gates are distinguished in the [current checkpoint](checkpoint-20261124.md). Final participant acknowledgements and acceptance remain pending. Earlier preparation began in Issue #68. B's handoff/coverage/contract extracts were integrated through PR #71; B's instructor-clarification follow-up is PR #76. This plan records known progress and remaining dependencies, not a final UAT decision.

Navigation: [coordination](coordination.md), [version register](versions.md), [evidence index](evidence-index.md), [blank record templates](records-template.md). Use the reviewed B handoff and C/D A2 technical inventory: original twelve ClassPulse cases plus CD01–08, with residual fixture branches pending. Technical agreement is not execution or final acceptance.

## Current checkpoint 24 November 2026

- Student A reports a deadline extension. The extension has not been independently verified against an official course record, and the **exact revised deadline is PENDING confirmation**. The original 22 November 23:59 deadline and 21:00 internal upload target are historical; neither is a current deadline. Partner availability through 29 November is not a course deadline.
- A verified CP-V01 source/image/revision/traffic on 24 November (latest saved metadata readback 02:16:41 Asia/Bangkok): source `1fe3e3b82dfb0537be30223c9b598b3479b4affe`, revision `classpulse-00006-6w6`, 100%, digest `sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795`. Public developer preflight passed 8/8. These are time-specific developer observations, not C/D acceptance or a new readback at every later request.
- Partner C is Ashira Sansoda / 67070503445; D is Thira Rungruangkaset / 67070503419, EN-037_P5, Workflow and Approval System. Their 24 November progress ZIP contains 95 accumulated execution/tool records and seven screenshots, with passing behavior observations for all twelve original ClassPulse cases. UAT-08/10/11 used disclosed API fixture setup; A's later disposition accepts that setup deviation only. Incomplete added branches, actual peer participation and final acceptance remain pending. Original records stay preserved for final PDF assembly.
- A independently confirmed the Workflow Product Team's WF-BUG-001 at 19:09:37 Bangkok: the two credential-free boundary requests yielded 422 at 102400 bytes and 500 at 102401 bytes; regression totals 1 passed, 1 failed, 0 skipped. This is independent confirmation of their discovery, not ClassPulse's Part D or completed A/B Workflow UAT. C/D later supplied the original82a4806 mapping at20:51:51–58 Bangkok; the correction is not yet deployed. See [checkpoint](checkpoint-20261124.md).
- B requested date corrections on PR #75 exact `ec74e5a`. A reviewed B's three-file PR #76 at `fa3f1810fda69c5ab63a7f390998e05c19fb2767`, ran 32 offline document/helper checks and verified successful CI45396597109, then approved and merged it into staging at `b98369cc94526bba8745faa0e8720ab512ca9949`. B now supplies qualified02/03 UI and later human06 observations; A later observed expected01/04/05 behaviors with the actual browser variation later accepted by C/D A3. B approved/merged A75 at3425a5e; A later merged B78 atcdcf460 after Ready/current-head checks. See the current checkpoint for complete provenance. No ClassPulse correction, educational defect insertion, independent retest, final PDF review or Lab 6 submission is established.
- Student A deferred appointment/findings-channel discussion to **25 November**. That is a planning discussion, not a booked test or retest. C/D's already performed run keeps its actual 24 November times; do not retroactively describe it as a previously agreed appointment.

The [report source](report.md) records this checkpoint and its limits. The coordination/version/contribution registers now link current actual evidence. Earlier preparation/automation statements remain dated history. Replace final-report placeholders only from traceable actual records; see [Part D readiness](part-d-readiness.md).

## Instructor update effective for current planning

The [20 November clarification](instructor-clarification.md) governs current work: each independent UAT Team must audit supplied-case coverage against important Sprint 1 requirements/ACs, propose additional cases and test thoroughly before concluding no genuine defects. Complete [R11 coverage review](coverage-review.md) before freezing the expanded inventory. If none are found after real execution, use the [standard staging-commit exercise](exercise-protocol.md), preserving blind discovery and full RED/GREEN/review/CI/corrected-deploy/retest. No generic wait for a bespoke TA exercise is required; escalate only actual technical/partner blockers. No exercise is started by this documentation change.

## 1. ผลลัพธ์ที่ต้องมี

| เกณฑ์ | คะแนน | ผลงานที่ตรวจได้ | ผู้รับผิดชอบหลักที่เสนอ |
|---|---:|---|---|
| A Preparation | 20 | เคสครบ scope สำคัญ อย่างน้อย 4 ประเภท, instructions/accounts/data/version พร้อมใช้ | B เขียน/ตรวจ handoff; A ตรวจ contract/coverage |
| B Independent execution | 25 | A และ B รันทุกรายการที่ตกลงของแอป C/D พร้อม actual/evidence | A normal/state; B boundary/access |
| C Reporting and triage | 20 | outgoing reports + received findings ทั้งหมด มี classification/reason/severity/owner/disposition | A ดู ledger; B ตรวจเหตุผล |
| D Resolution and retest | 35 | correction หรือ professor-standardized exercise, RED/GREEN, review/CI/release/deploy, independent retest/decision | เจ้าของโมดูลแก้; อีกคน review; C/D retest |

คะแนนไม่ขึ้นกับจำนวน bug จึงไม่ตั้งเป้าว่าต้องหาให้ได้กี่ตัว เป้าคือครบ scope, รับผิดชอบทุก finding และมีคำตัดสินที่หลักฐานรองรับ

## 2. สมาชิกและการแบ่งงาน

กรอกข้อมูลจริงใน R01 ก่อน freeze handoff ใช้ A/B สำหรับสมาชิก ClassPulse และ C/D สำหรับสมาชิกทีมคู่ แยกจากบัญชี Owner A/Owner B ในแอปซึ่งเป็นบัญชีสังเคราะห์

| งาน | Driver / ผู้ทำหลัก | Reviewer / ผู้ตรวจ | ผลที่ต้องส่งต่อ |
|---|---|---|---|
| ติดต่อทีมคู่และนัดสองรอบ | B | A ยืนยัน availability | R01 + ข้อความตกลงจริง |
| baseline และ live version ClassPulse | A | B เทียบ image/revision/scope | R02 + screenshot/readback ที่ไม่มี secrets |
| ปรับ handoff และ dry run | B | A ตรวจทุก expected เทียบ AC | handoff version + ข้อแก้ไข + readiness decision |
| ClassPulse → แอปทีมคู่: normal + state/history | A | B ตรวจผล/หลักฐาน | R03 รายเคส |
| ClassPulse → แอปทีมคู่: boundary + role/access | B | A ตรวจผล/หลักฐาน | R03 รายเคส |
| ทีมคู่ → ClassPulse: 07,01,04,05,10 | D (ข้อเสนอใน R11 ของ C/D) | C ตรวจ evidence | บันทึก actual operator/AI assistance; ไม่ถือว่าข้อเสนอพิสูจน์ participation |
| ทีมคู่ → ClassPulse: 02,03,06,08,09,11,12 | C (ข้อเสนอใน R11 ของ C/D) | D ตรวจ evidence | ใช้ actual records; คง dependency และข้อจำกัดการมีส่วนร่วมจริง |
| triage findings ที่ส่งให้ ClassPulse | A รวบรวม; module owner reproduce | อีกคนตรวจ contract/severity | R04/R05 ทุก finding |
| auth/owner/lifecycle correction | A | B | RED/GREEN, PR, CI |
| response/summary correction | B | A | RED/GREEN, PR, CI |
| correction ที่แตะหลายโมดูล | เลือก driver ก่อนเริ่ม Issue | อีกคน review | Files list ชัด ไม่แก้ทับกัน |
| reviewed main release | A หรือ B ที่ระบุใน release Issue | non-author | reviewed release + CI + deployed metadata |
| independent retest/acceptance ของ ClassPulse | C และ D | ทีมคู่รับรองผลของตัวเอง | R06/R07 ที่อ้าง release จริง |
| independent retest/acceptance ของแอปทีมคู่ | A และ B | ตรวจผลกันก่อนส่ง | R06/R07 ของแอปทีมคู่ |
| PDF ของ ClassPulse | A รวมไฟล์ | B ตรวจไฟล์ที่ hash ตรงกัน | PDF self-contained + review record |
| PDF ของทีมคู่ | C/D กำหนดเอง | อีกคนในทีมคู่ | PDF ของทีมเขาเอง |
| LEB2 upload | A (มนุษย์) | B ตรวจชื่อ/ไฟล์/สถานะ | ใบยืนยันการส่งจริง |

ทั้งสองคนของแต่ละทีมต้องลงมือทดสอบ ไม่ให้คนหนึ่งทำทั้งหมดแล้วใส่อีกชื่อเป็น tester ห้ามยืมตัวตนอีกคนโพสต์ review หรือ sign-off

## 3. Historical schedule and current next steps

All times are Asia/Bangkok. The old 20–22 November targets have elapsed. They were proposals, not booked appointments or evidence of completed work.

| Historical target | Actual status known at 24 November |
|---|---|
| 20 November initial coverage/UAT and findings exchange | Documentation preparation/review occurred. The proposed initial sessions were not booked; no independent execution is evidenced for those old slots. C/D's received ClassPulse execution occurred on 24 November instead. |
| 21 November RED/GREEN, corrected release and independent retest | No Lab 6 ClassPulse correction/exercise/retest chain is established for that date. Do not reuse earlier Lab 5 tests or deployment as these results. |
| 22 November buffer, final PDF review and 21:00 upload target | No Lab 6 exact-file review or upload receipt is established. These targets elapsed; A reports an extension, but the official revised deadline remains unverified/PENDING. |

Current work follows dependencies until real times are agreed; no replacement deadline is invented:

| Next step | Owner / dependency | Done check |
|---|---|---|
| Confirm the revised course deadline and filename rules | Human checks the actual course announcement/LEB2 | Actual revised date/time and provenance recorded; partner availability is not substituted |
| PR75/76/78 documentation integration | Completed:75→3425a5e,76→b98369c,78→cdcf460 | No app deployment or fixture creation implied; B owns separately scoped executable provisioner |
| Discuss initial/retest slots and private findings channel on 25 November | A/B availability plus C/D acknowledgement; no slot booked yet | R01 records actual agreement and actual prior-run times separately |
| Complete final expanded inventory and account/fixture disposition | A/B and C/D; CD-07 third respondent and CD-01 inactive/controlled-session remain pending; CD-08 guarded/original404 completed by C/D | Agreed case/subcase list; preserved data; actual private access; no setup-only PASS |
| Complete Workflow independent execution | Original82a4806 mapping supplied; A01/04/05 PASS for recorded paths with C/D A3 setup variation accepted; B02/03/06 have qualified observations; additional incomplete cases remain actual execution tasks | Preserve shared01/04 request; notify before new live tests; actual roles/results/evidence, not inferred participation |
| Complete ClassPulse residual checks and assess no-defect entry gate | Independent C/D execution plus actual C/D participation/review | Full required coverage/dispositions; no comprehensive no-defect conclusion from incomplete branches |
| Perform correction or conditional standardized exercise if applicable | Correct module owner, teammate review, mandatory CI and human cloud gates | RED/GREEN/regression, reviewed corrected release, version-specific independent retest |
| Assemble self-contained PDF and submit | A assembles, B reviews exact bytes, human uploads by the confirmed revised deadline | G5 plus actual file hash/review/upload receipt |

ช่วงแก้ไขอาจต้องหลายรอบ ถ้า major/critical ยังไม่หาย ให้รายงาน Not Accepted พร้อมข้อค้างและหลักฐาน ไม่เปลี่ยนความหมายของ expected result เพื่อให้ผ่าน

## 4. Readiness / exit gates

### G0 — Coordination

- [ ] ทั้ง 4 คนยืนยันชื่อ รหัส บทบาท app/repo และช่องทางติดต่อ
- [ ] initial, correction และ retest slots ของสองแอปตกลงจริง
- [ ] ตกลงวิธีส่ง defect และระยะตอบรับ (เสนอภายใน 2 ชั่วโมงในช่วงที่นัดทำงาน)
- [ ] ถ้าคู่หาย/เว็บเข้าไม่ได้ แจ้ง TA โดยเร็ว ไม่รอคืนวันส่ง

### G1 — Handoff ready

- [ ] ทั้ง A/B ตรวจ handoff version เดียวกันและ expected เทียบ AC
- [ ] baseline tag กับ deployed SHA/revision/digest/traffic ถูกแยกชัด
- [ ] credentials ส่งส่วนตัวและทดลองเข้าทุกบทบาทได้; enrollment matrix ตรง
- [ ] case order, fresh run IDs, data-retention agreement และหลักฐานที่ต้องเก็บชัด
- [ ] partial AC coverage ถูกระบุ ไม่อ้างว่า manual UAT แทน full automated suite
- [ ] Independent UAT Team ทำ R11 ตรวจ important Sprint 1 AC coverage และเสนอ additional cases พร้อม disposition ก่อน freeze inventory
- [ ] ทีมคู่ยืนยันรับเอกสารและตกลง expanded case/subcase list; เวลา/ข้อมูลพอรันทุกรายการ

### G2 — Initial execution complete

- [ ] ทุก agreed case มีผลจริง หรือ BLOCKED พร้อมเหตุผล; รันไม่ครบไม่ถือว่าจบ
- [ ] ทั้งสองคนของทีม UAT เป็น tester จริง และตรวจบันทึกกัน
- [ ] negative cases มี rejection + protected-state readback/no disclosure
- [ ] มี evidence IDs, timestamp, tested release และ finding IDs
- [ ] ทั้งสองทิศทางส่งผลให้ Product Team และเก็บ acknowledgement

### G3 — Correction ready for independent retest

- [ ] ทุก finding ผ่าน triage และ accepted defects มี owner
- [ ] bug ที่แก้มี test fail เพราะพฤติกรรมผิดจริงก่อน implementation
- [ ] same test assertions ผ่านหลัง fix; broader regression ผ่านพร้อม actual counts
- [ ] teammate ตรวจ exact PR head, CI ผ่าน, merge commit และ reviewed release สู่ main
- [ ] แยก fix SHA, merge SHA, source/image SHA ให้ตามรอยได้
- [ ] deployment + smoke + traffic/digest ตรวจตรงกัน; แจ้งทีมคู่ revision ใหม่แล้ว

### G4 — Independent decision

- [ ] UAT Team ทดสอบซ้ำทุก corrected release-blocker และ affected cases
- [ ] ไม่มี critical/major ที่ค้างหรือ required test ที่ BLOCKED หากจะยอมรับ
- [ ] minor ค้างมี explicit acceptance จากทีม UAT พร้อม reason/limitation
- [ ] R07 ระบุ exact release/scope/date/testers/evidence และคำตัดสินจริง
- [ ] ถ้า thorough independent UAT ไม่พบ genuine defect: healthy decision + new staging exercise commit + blind discovery/report + full correction/deploy/retest ตาม protocol

### G5 — Submission ready

- [ ] ครบ checklist ใน the final PDF checks below และทั้งสองคนอ่านไฟล์จริง
- [ ] PDF บรรจุ assessed evidence ไม่ใช่ link-only
- [ ] version table, contributions, AI use, limitations ถูกต้อง
- [ ] ชื่อผู้เรียน/รหัส/section/group ตรวจจากข้อมูลจริง
- [ ] human upload + receipt ตรวจเรียบร้อยก่อนเส้นตาย

## 5. How sessions run

ก่อนเริ่ม 10 นาที: UAT Team จดเวลาจริง version, browser, account labels และ case list; Product Team ยืนยันไม่มี deployment ระหว่างรอบ เปิดแอปผ่าน URL ที่ตกลง

ขณะทดสอบ: คนหนึ่งลงมือ อีกคนช่วยบันทึก/ตรวจหลักฐาน แล้วสลับผู้ลงมือในเคสที่แบ่งไว้ เจ้าของแอปไม่ทำ action แทนทีม UAT คำชี้แจงหรือวิธี workaround ที่จำเป็นต้องจดไว้ เพราะ handoff ควรทำตามได้โดยไม่ต้องอธิบายปากเปล่า

เมื่อพบความผิดปกติ: จด actual ก่อนแก้ environment, เก็บ screenshot ที่ไม่มี secrets, เปิด finding พร้อม repro/impact และส่งให้เจ้าของทีม ไม่ประกาศว่าเป็น bug จน triage เทียบ contract แต่ห้ามปิดทิ้งโดยไม่ reproduce/อธิบาย

เมื่อจบรอบ: สรุปจำนวน PASS/FAIL/BLOCKED/NOT RUN ตามหน่วยเดียวกัน แยก case กับ subcase เก็บ raw evidence เดิม ไม่เขียนทับหลัง retest

## 6. Escalation และ no-defect path

- **ไม่มีทีมคู่/เข้าแอปไม่ได้:** แจ้ง TA ด้วยข้อมูลจริงและเวลาที่ติดต่อ เก็บหลักฐาน ขอ replacement tester/team; ระหว่างรอทำ handoff และรายงานต่อได้ ห้ามทดสอบกันเองแทน independent requirement
- **ไม่พบ genuine defect หลัง audit coverage และ thorough independent UAT จริง:** ใช้ standardized procedure ของอาจารย์: new staging commit นำ defect เดิมกลับมา (หรือปิด required-field validation หนึ่งกฎเมื่อไม่มี defect เดิมที่เหมาะสม) ให้ UAT Team ค้นหา/รายงานโดยไม่บอก exact defect ก่อน แล้วทำ RED/GREEN/regression/review/CI/corrected deploy/independent retest ตาม [protocol](exercise-protocol.md) ไม่ต้องรอ TA ออกโจทย์รายทีม
- **exercise exposure/branch policy ติดจริง:** เก็บ expected failing checks ไม่ลด tests/CI หรือ bypass ruleset ให้มนุษย์/TA ชี้แจงเฉพาะทางเข้าทดสอบ staging instance ที่ไม่กระทบ healthy main และบันทึก blocker จริง
- **เวลาแก้ไม่ทัน:** จัดลำดับ critical/major ก่อน; ทำ disposition ของทุกข้อ; ให้ทีม UAT ออก Not Accepted ตามจริงถ้าเงื่อนไขไม่ครบ
- **ต้องเปลี่ยน deployment:** แจ้งทีมคู่ก่อน, เก็บ version เดิม, หยุดรอบที่ได้รับผลกระทบ, เปิด execution run ใหม่ ห้ามรวมผลคนละเวอร์ชันเป็นผลเดียวโดยไม่อธิบาย
- **secret ติดภาพ:** หยุดส่งต่อ สร้างสำเนาปกปิดข้อมูลและตรวจซ้ำ; แจ้งเจ้าของ credential ให้จัดการส่วนตัว ห้ามลงค่า secret ใน incident log

## 7. What this kit does not claim

Historical preparation note, 19–20 November: at that checkpoint no partner agreement, UAT result, defect, retest or acceptance had been established. Later 24 November observations are recorded in the current checkpoint above. Lab 5 observations remain separate supporting evidence, and a planning change never establishes production mutation or independent acceptance.

## Final PDF checks

- One self-contained PDF per team by the **confirmed revised deadline (PENDING)**. A reports an extension; official verification and the new exact date/time remain pending. The original 22 November 23:59 deadline and 21:00 internal target are historical, not a current submission schedule.
- Front matter: actual names/student IDs, team/product/repo/URL, Sprint 1 scope, baseline and exact tested final version, independent tester names and decision. Include contents/Part A-D page ranges/evidence IDs.
- A: complete ClassPulse UAT cases, applicable contract excerpts, safe account roles, setup/sequence/data retention and version.
- B: A/B actual independent execution of the partner product, every agreed case, both participants, inputs/date/version/actual observations and readable normal/negative evidence.
- C: outgoing reports and all received findings, reasons/classification/severity/owner/disposition, and explicit known-minor-limitations consent.
- D: our corrected accepted-defect chain or professor-standardized educational exercise, real RED/GREEN/assertions/diff/regression outputs, substantive review/CI/release/deployment, independent retest and exact-release acceptance. Include our decision on the partner product as well.
- Distinguish manual/AI-assisted/developer tests; retain actual commands/test IDs/commit and pass-fail-skip counts. Embed assessed evidence and review text rather than only external links.
- Include version lineage, actual contributions/pair roles, AI-use declaration, limitations and unresolved TA dependencies. No fixed page limit; use readable figures/internal references, no secrets.
- B reviews the actual PDF with matching hash; changed evidence needs actual follow-up review. Human checks LEB2 filename requirements, uploads, opens the uploaded file and retains receipt. No submission is inferred from a local file.

## Document history

| Version | Date | Editor | Reason / review |
|---|---|---|---|
| 1.0 | 19 Nov 2026 | Punge089 assisted by Codex GPT-6.1 Sol; prior local kit assisted by GPT-6 | Publish A-owned preparation scope so B can review through GitHub; agreement and B review pending |

| 1.1 | 19 Nov 2026 | Punge089 assisted by Codex GPT-6.1 Sol | Correct B receipt/work/scheduler status from actual comment7014497599 and Issue #70; formal review and appointments still pending |

| 1.2 | 20 Nov 2026 | Punge089 assisted by Codex GPT-6.1 Sol | Record later B heartbeat activation report7016235809 while retaining earlier scheduler limitation as history; availability stays pending |

| 1.3 | 20 Nov 2026 | Punge089 assisted by Codex GPT-6.1 Sol | Apply supplied professor clarification: independent coverage audit/additional cases and standardized blind staging exercise after genuine no-defect UAT |

| 1.4 | 24 Nov 2026 | Punge089 assisted by Codex GPT-6 | Address B's exact-head review: archive elapsed 20–22 November targets, distinguish A-reported extension from unverified official revised deadline, record known 24 November progress and dependency-based next steps; no booked times or acceptance invented |

| 1.5 | 24 Nov 2026 | Punge089 assisted by Codex GPT-6 | Consolidate received A2/CD08/mapping and actual A01/04/05 observations, completed documentation merges and remaining PartD gates under Issue79; no new app execution or acceptance |

| 1.6 | 24 Nov 2026 | Punge089 assisted by Codex GPT-6 | Receive C/D A3 browser disposition and scoped PASS results; record contract80/81 C3 while retaining all live fixture/deployment/retest gates |

B v2 supersedes earlier NOT RUN statements for observed original02/03 and the later human06 denial only. See checkpoint for setup/format/version limits. A retains ADD01/06; B ADD02–05 still have incomplete API/capture branches. C/D release64 is approved/CI-green but not yet a corrected deployment; prepared clearance is unsent. Pause new Workflow starts until the actual corrected mapping. No fixture/provisioner implementation is supplied by B yet; C3 already permits isolated RED work.

| 1.7 | 24 Nov 2026 | Punge089 / Codex GPT-6 | Record qualified B v2 results, human06 time correction and release64 coordination; retain all unexecuted scope/deployment/PartD gates |
