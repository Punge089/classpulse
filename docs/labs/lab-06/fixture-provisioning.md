# Lab 6 additive fixture procedure (CD-01 / CD-07)

**Status: proposed for A review. No database read or mutation was performed when this document was prepared.** The current existence of either target email and the live enrollment state of `student3` are not verified.

## Scope

If approved and after human preflight, the only intended additions are:

| Account | Role | Active | Enrollment |
|---|---|---:|---|
| `uat6.extra@classpulse.test` | RESPONDENT | yes | Existing CPE334 course only |
| `uat6.inactive@classpulse.test` | RESPONDENT | no | none required |

This procedure must preserve every existing account, enrollment, course, survey, response, and session. In particular, `student3@classpulse.test` must remain enrolled in CPE231 and not enrolled in CPE334.

## Review and human gate

1. Student A reviews this procedure before anyone uses it.
2. An authorized human privately confirms the intended GCP project, Cloud SQL instance, and database in the Cloud Console. The SQL readback below reports a database name but does not prove which GCP project or instance was reached.
3. The human runs this read-only preflight in that confirmed database using a privately configured connection. Do not place the connection string or any password in this repository, chat, issue, command arguments, logs, or screenshots.

```sql
BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '10s';

SELECT current_database() AS database_name;

SELECT c.id AS course_id, c.code, u.email AS owner_email
FROM "Course" c
JOIN "User" u ON u.id = c."ownerId"
WHERE c.code IN ('CPE334', 'CPE231')
ORDER BY c.code;

SELECT u.id, u.email, u.role, u."isActive", c.code AS enrolled_course
FROM "User" u
LEFT JOIN "Enrollment" e ON e."userId" = u.id
LEFT JOIN "Course" c ON c.id = e."courseId"
WHERE u.email IN (
  'student1@classpulse.test',
  'student2@classpulse.test',
  'student3@classpulse.test',
  'uat6.extra@classpulse.test',
  'uat6.inactive@classpulse.test'
)
ORDER BY u.email, c.code;

ROLLBACK;
```

### Expected preflight

- Exactly one existing course row each for CPE334 and CPE231, in the intended database.
- Existing `student1` and `student2` rows show RESPONDENT and CPE334 enrollment.
- Existing `student3` shows RESPONDENT and CPE231 enrollment only, with no CPE334 row.
- Neither proposed `uat6.*` address appears.
- The human separately confirms the GCP project and instance match the intended ClassPulse target.

If either target email already exists, either course is missing/ambiguous, or any existing account/enrollment differs from those expectations, stop and make no changes. Do not delete, deactivate, update, reset, or re-enroll an existing row to force the expected output.

## Requirements for any later mutator

This PR contains no mutating command or provisioning code. A mutator must be separately scoped and reviewed before a human runs it. It must:

- Use the pinned CP-V01 schema and the existing `server/src/lib/password.ts` `hashPassword` helper (scrypt with a random 16-byte salt and a 64-byte derived key).
- Recheck all guards inside one database transaction; abort and roll back if either email exists or if the course/account/enrollment baseline differs.
- Create exactly two new User rows with role RESPONDENT (one `isActive=true`, one `isActive=false`) and exactly one Enrollment row linking the active account to the existing CPE334 course.
- Use `create` operations only. Never use seed/reset, upsert, update, delete, deactivate, or other operations against existing accounts. Do not create a course, session, survey, response, or any unrelated row.
- Accept the connection and passwords from the human privately. Never log or print secrets or password hashes.

A uniqueness collision or any unexpected state must make the whole transaction fail without changing existing data.

## Post-check and evidence

After a separately reviewed mutator is run by the human, repeat the read-only query in the same confirmed target. Verify both new rows, their roles/activity, the single CPE334 enrollment for the active account, no enrollment for the inactive account, and unchanged IDs/roles/activity/enrollments for student1, student2, and student3. Return only sanitized IDs and state/enrollment evidence.

C/D still need to perform and record the actual login and UAT checks. Fixture creation itself is not a PASS, does not verify inactive-login behavior, and does not establish final acceptance.