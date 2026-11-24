BEGIN TRANSACTION READ ONLY;
SET LOCAL statement_timeout = '10s';

SELECT current_database() AS database_name, current_user AS database_role,
       current_setting('transaction_read_only') AS read_only;

SELECT c.id AS course_id, c.code, u.id AS owner_id, u.email AS owner_email,
       u.role AS owner_role, u."isActive" AS owner_active
FROM "Course" c JOIN "User" u ON u.id = c."ownerId"
WHERE c.code IN ('CPE334', 'CPE231')
ORDER BY c.code;

SELECT u.id AS user_id, u.email, u.role, u."isActive",
       e.id AS enrollment_id, c.id AS course_id, c.code AS course_code
FROM "User" u
LEFT JOIN "Enrollment" e ON e."userId" = u.id
LEFT JOIN "Course" c ON c.id = e."courseId"
WHERE lower(btrim(u.email)) IN (
 'ann.lee@classpulse.test', 'ben.kim@classpulse.test',
 'student1@classpulse.test', 'student2@classpulse.test',
 'student3@classpulse.test', 'uat6.extra@classpulse.test',
 'uat6.inactive@classpulse.test')
ORDER BY lower(btrim(u.email)), c.code, e.id;

ROLLBACK;