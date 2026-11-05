# คู่มือสำหรับเพื่อน (Student B): ทำ Issue ด้วย AI ของตัวเอง

Issue ของคุณ: **I-03** (System SDS), **I-05** (Foundation), **I-08** (Response submission), **I-09** (Summary)
และงานคู่: **I-01**, **I-06** (คุณเป็นคน review PR), **I-11**
คุณเป็นคน review PR ของ A ใน I-02, I-04, I-07, I-10

## ตั้งค่าครั้งเดียว
1. ยอมรับคำเชิญ collaborator ที่ https://github.com/Punge089/classpulse/invitations (บัญชี `book6349`)
2. `git clone https://github.com/Punge089/classpulse.git` แล้ว `cd classpulse`
   บอร์ดงาน: https://github.com/users/Punge089/projects/5 · Issue ของคุณ: #3, #5, #8, #9 (เลข Issue = เลข I-xx)
3. ตั้งชื่อ git ให้ตรงกับบัญชี GitHub ของคุณเอง (สำคัญมาก ไม่งั้นคะแนนการมีส่วนร่วมจะไม่ขึ้นเป็นชื่อคุณ)
   `git config user.name "ชื่อคุณ"` และ `git config user.email "อีเมลที่ผูกกับ GitHub"`
4. ติดตั้ง Node 22 + PostgreSQL 16 แล้วสร้าง DB `classpulse` กับ `classpulse_test`
5. ติดตั้ง `gh` แล้ว `gh auth login` ด้วยบัญชีของคุณเอง

## ทำ 1 Issue (1 Issue ต่อ 1 session ของ AI)
1. `git checkout sprint-1-staging && git pull`
2. เปิด AI ในโฟลเดอร์ repo
   - **Claude Code:** เปิด session ใหม่ในโฟลเดอร์ `classpulse` ระบบจะอ่าน `CLAUDE.md` ให้เอง
   - **AI ตัวอื่น (Copilot, Cursor, ChatGPT):** แนบ/วาง `AGENTS.md` และ `docs/plan.md` ให้มันอ่านก่อน
3. วาง prompt จาก `docs/plan.md` §6.1 โดยเปลี่ยน `I-0X` เป็นเลข Issue ของคุณ
4. ทุกคอมเมนต์เขียนไว้ให้แล้วใน `docs/comment-playbook.md` AI จะเติมค่าจริง (commit, ตัวเลข test) แล้วโชว์ให้ดู คุณแค่อ่านแล้วพิมพ์ "ok" AI จะโพสต์ด้วย `gh` จากบัญชีคุณ (ใช้เวลาประมาณ 1 นาทีต่อข้อความ)
5. หลัง C2 AI จะรอ A ตอบ C3 ก่อน (ถ้ามีจุดต้องแก้ AI จะแก้ contract เป็น v1.1 แล้วโพสต์ C4)
6. บอก AI ให้ทำต่อ: เขียน test ที่ fail (red) → commit → เขียนโค้ด → test ผ่าน (green) → commit
7. **ก่อนเปิด PR ตรวจเอง:** เปิดไฟล์ test อ่าน assertion ว่าตรงกับ AC จริง, ดู `evidence/*-red.txt` ว่า fail จริง, รัน `npx vitest run` เองแล้วดูตัวเลข
8. ให้ AI push และเปิด PR เข้า `sprint-1-staging` (ห้าม merge เอง) แล้วขอให้ A review

## ตอน A review PR ของคุณ
- ตอบทุกคอมเมนต์ (C8): ถ้าแก้ ให้ใส่ลิงก์ commit ที่แก้ ถ้าไม่แก้ ให้บอกเหตุผล
- ให้ AI ช่วยแก้ได้ แต่ต้องรัน test ใหม่ทุกครั้ง

## ตอนคุณ review PR ของ A
1. เปิด session AI ใหม่ แล้ววาง "Reviewer prompt" จาก `docs/plan.md` §6.1
2. AI จะ checkout PR, รัน test, รันการตรวจตาม `docs/comment-playbook.md` Part B แล้วเติม review ด้วยผลที่ได้จริง
3. อ่านที่ AI เขียน (โดยเฉพาะบรรทัด Check และ inline comment) แล้วพิมพ์ "ok" ให้โพสต์
4. Approve พร้อมเหตุผล หรือ Request changes ถ้าเจอปัญหาจริง แล้ว merge แบบ merge commit (ห้าม squash)

## ห้ามทำ
- ห้ามปิด/skip/ลดความเข้มของ test เพื่อให้ผ่าน
- ห้ามโพสต์ผลตรวจที่ไม่ได้รันจริง หรือ approve PR ของตัวเอง
- ห้าม commit ไฟล์ `.env` หรือรหัสผ่านจริง
- ห้ามแก้ไฟล์ของ Issue คนอื่น นอกจากที่ระบุไว้ใน *Modify*

## สิ่งที่ต้องเข้าใจเอง (TA อาจถามใครก็ได้)
login/session ทำงานอย่างไร · ทำไม 1 คนตอบได้ครั้งเดียวแม้กดพร้อมกัน (unique constraint) · ใครเห็นข้อมูลอะไร (role matrix) · test ของคุณพิสูจน์ AC ไหน
เขียนรายการ AI ที่ใช้และงานที่ให้ช่วยลงใน `docs/ai-use.md` ด้วย
