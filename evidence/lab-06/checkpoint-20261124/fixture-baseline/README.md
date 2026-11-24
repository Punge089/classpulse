# Read-only ClassPulse fixture baseline

Observed by Codex GPT-6 under A after explicit user authorization, 24 November 2026 at22:53:02.943 Bangkok. SQL Studio authenticated as classpulse_app in project cpe-334-en-034 / instance classpulse-pg / database classpulse. The bounded transaction reports read_only=on and ends ROLLBACK. No live writes, credential/permission changes or fixture creation occurred. Credential values are excluded.

The five existing synthetic users and their complete recorded enrollments match the intended baseline. Importantly, student2 is user5 and student3 is user4; do not guess IDs from email suffixes. Existing student3 remains CPE231-only. Both proposed emails are absent including lower(btrim(email)) variants.

`provisioner-observed-snapshot.json` is a derived format for later human review, not an approved apply baseline. After B fixes the independently reproduced PR83 race and A reviews the new head, the human must personally verify exact target/baseline, privately supply credentials/passwords, and run the reviewed command. Never seed/reset/upsert or alter existing accounts/enrollments.
