# Lab 6 coordination and execution plan

Status: A-authored preparation for Issue #68; teammate review and partner agreement pending. Prepared from the Lab 6 handout and local shared kit. The handoff, coverage and contract extracts remain B-owned and will be linked after B creates their scoped Issue/PR. This is documentation preparation, not an executed UAT report.

Navigation: [coordination](coordination.md), [version register](versions.md), [evidence index](evidence-index.md), [blank record templates](records-template.md). Use the actual reviewed B handoff once available; twelve cases are currently proposed, not an agreed independent test inventory.

## 1. ผลลัพธ์ที่ต้องมี

| เกณฑ์ | คะแนน | ผลงานที่ตรวจได้ | ผู้รับผิดชอบหลักที่เสนอ |
|---|---:|---|---|
| A Preparation | 20 | เคสครบ scope สำคัญ อย่างน้อย 4 ประเภท, instructions/accounts/data/version พร้อมใช้ | B เขียน/ตรวจ handoff; A ตรวจ contract/coverage |
| B Independent execution | 25 | A และ B รันทุกรายการที่ตกลงของแอป C/D พร้อม actual/evidence | A normal/state; B boundary/access |
| C Reporting and triage | 20 | outgoing reports + received findings ทั้งหมด มี classification/reason/severity/owner/disposition | A ดู ledger; B ตรวจเหตุผล |
| D Resolution and retest | 35 | correction หรือ TA-approved exercise, RED/GREEN, review/CI/release/deploy, independent retest/decision | เจ้าของโมดูลแก้; อีกคน review; C/D retest |

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
| ทีมคู่ → ClassPulse: 07,01,04,05,10 | C (เสนอ) | D ตรวจ evidence | R03 จริง; A/B ให้ข้อมูลเมื่อถูกถาม |
| ทีมคู่ → ClassPulse: 02,03,06,08,09,11,12 | D (เสนอ) | C ตรวจ evidence | R03 จริง; ทำตาม dependency |
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

## 3. เวลาเป้าหมายและจุดตัดสินใจ

ทุกเวลาเป็น Asia/Bangkok และเป็น **proposed internal target** ไม่ใช่เวลาที่นัดสำเร็จแล้ว ให้กรอกเวลาจริงใน R01 หากช่วงใดผ่านไปแล้วให้เริ่มทันทีและปรับร่วมกับทีมคู่ โดยคงเส้นตายจริง

| วัน/เวลาเป้าหมาย | งาน | เสร็จเมื่อ |
|---|---|---|
| 19 พ.ย. ภายใน 2 ชั่วโมงหลังเริ่มใช้แผน | ยืนยัน 4 คนและจอง initial/retest ทั้งสองแอป | R01 มีผู้ตอบรับจริง |
| 19 พ.ย. ก่อนสิ้นวัน | review handoff, live metadata, private access, dry run | G1 พร้อม; ถ้าไม่พร้อมแจ้งคู่และเปิด blocker |
| 20 พ.ย. 10:00–13:00 | C/D ทดสอบ ClassPulse | agreed cases ทุกเคสมี actual หรือ BLOCKED |
| 20 พ.ย. 14:00–17:00 | A/B ทดสอบแอป C/D | ทุกเคสที่ตกลงถูกบันทึก; ทั้ง A/B มีงานจริง |
| 20 พ.ย. 17:00–19:00 | แลก findings, reproduce, triage | ทุก finding มี disposition/owner; ขอ exercise ถ้าไม่พบ defect |
| 21 พ.ย. 09:00–14:00 | RED → fix → GREEN/regression → review/CI | G3 ผ่าน; แจ้งก่อน deployment ทุกครั้ง |
| 21 พ.ย. 14:00–16:00 | reviewed release, smoke, version handoff | R02 แถวใหม่ตรง revision ที่ serve จริง |
| 21 พ.ย. 16:00–18:00 | retest ทั้งสองแอป | R06 + decision หรือ blocker/follow-up จริง |
| 22 พ.ย. 09:00–12:00 | buffer สำหรับปัญหา/retest/exercise | ไม่มี required BLOCKED สำหรับการยอมรับ |
| 22 พ.ย. 12:00–17:00 | รวม PDF + ตรวจหลักฐาน/อ่านทุกหน้า | G5 ผ่าน |
| 22 พ.ย. 17:00–20:00 | B ตรวจ exact PDF; A แก้และให้ตรวจส่วนเปลี่ยน | hash/review ตรงไฟล์สุดท้าย |
| 22 พ.ย. 21:00 | human upload + เปิดไฟล์ที่ส่งตรวจ | มี receipt; deadline จริง 23:59 |

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
- [ ] ทีมคู่ยืนยันรับเอกสารและตกลง case/subcase list; เวลา/ข้อมูลพอรันทุกรายการ

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
- [ ] ถ้าไม่มี natural defect: healthy release acceptance และ TA-approved exercise แยกกัน

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
- **ไม่พบ legitimate defect หลังทดสอบจริง:** บันทึก findings = none พร้อมผลและ acceptance แล้วขอ controlled defect exercise จาก TA ตาม §3.5 ระบุ isolated branch/version และขอคำชี้แจงเรื่อง release/test environment ที่แยกจากเว็บที่ยอมรับแล้ว
- **exercise/tester ยังไม่จัดให้:** เก็บ timely notification + response/status และใส่ dependency ใน PDF ห้ามอ้าง RED/GREEN/retest ที่ยังไม่ทำ
- **เวลาแก้ไม่ทัน:** จัดลำดับ critical/major ก่อน; ทำ disposition ของทุกข้อ; ให้ทีม UAT ออก Not Accepted ตามจริงถ้าเงื่อนไขไม่ครบ
- **ต้องเปลี่ยน deployment:** แจ้งทีมคู่ก่อน, เก็บ version เดิม, หยุดรอบที่ได้รับผลกระทบ, เปิด execution run ใหม่ ห้ามรวมผลคนละเวอร์ชันเป็นผลเดียวโดยไม่อธิบาย
- **secret ติดภาพ:** หยุดส่งต่อ สร้างสำเนาปกปิดข้อมูลและตรวจซ้ำ; แจ้งเจ้าของ credential ให้จัดการส่วนตัว ห้ามลงค่า secret ใน incident log

## 7. What this kit does not claim

ขณะจัดทำยังไม่มี partner agreement, UAT result, defect, retest หรือ acceptance ของ Lab 6 ชุดนี้ การตรวจเว็บภายในและผล Lab 5 เป็นข้อมูลประกอบแยกเท่านั้น ไม่มีการติดต่อทีมอื่นหรือ TA หรือเปลี่ยน production จากการจัดทำแผนนี้

## Final PDF checks

- One self-contained PDF per team by 22 November 2026 23:59 Asia/Bangkok; upload target 21:00.
- Front matter: actual names/student IDs, team/product/repo/URL, Sprint 1 scope, baseline and exact tested final version, independent tester names and decision. Include contents/Part A-D page ranges/evidence IDs.
- A: complete ClassPulse UAT cases, applicable contract excerpts, safe account roles, setup/sequence/data retention and version.
- B: A/B actual independent execution of the partner product, every agreed case, both participants, inputs/date/version/actual observations and readable normal/negative evidence.
- C: outgoing reports and all received findings, reasons/classification/severity/owner/disposition, and explicit known-minor-limitations consent.
- D: our corrected accepted-defect chain or TA-approved isolated exercise, real RED/GREEN/assertions/diff/regression outputs, substantive review/CI/release/deployment, independent retest and exact-release acceptance. Include our decision on the partner product as well.
- Distinguish manual/AI-assisted/developer tests; retain actual commands/test IDs/commit and pass-fail-skip counts. Embed assessed evidence and review text rather than only external links.
- Include version lineage, actual contributions/pair roles, AI-use declaration, limitations and unresolved TA dependencies. No fixed page limit; use readable figures/internal references, no secrets.
- B reviews the actual PDF with matching hash; changed evidence needs actual follow-up review. Human checks LEB2 filename requirements, uploads, opens the uploaded file and retains receipt. No submission is inferred from a local file.

## Document history

| Version | Date | Editor | Reason / review |
|---|---|---|---|
| 1.0 | 19 Nov 2026 | Punge089 assisted by Codex GPT-6.1 Sol; prior local kit assisted by GPT-6 | Publish A-owned preparation scope so B can review through GitHub; agreement and B review pending |
