# Lab7 primary RED - before implementation

Contract8017c9183302e4e0c5ff04cd997704255420b8fb -> [B C3](https://github.com/Punge089/classpulse/issues/87#issuecomment-7159676041),25Nov2026 10:25:30UTC/17:25:30Bangkok -> test-only commit3f8918ceefd5eb55cdebd970710fd0789bd38c98 -> [CI45597034491](https://github.com/Punge089/classpulse/actions/runs/45597034491). No implementation/schema changes exist in this test commit.

## Actual command and outcome

Existing workflow Test server step executes `npm test` from `server`, using its own fresh PostgreSQL16 service, generated old-schema Prisma client and normal migrations/fixtures. It does not use local5432 or a Lab6 database. Static `tsc --noEmit --target ES2022 --module CommonJS --moduleResolution Node --strict --esModuleInterop --skipLibCheck server/tests/api/surveyReopen.test.ts` passed before push.

Actual server result:139passed,2failed,0skipped,total141;16files passed/1failed,total17. Both new parameterized cases failed at `expect(reply.status).toBe(200)` with actual404: TEST100 length10 and TEST101 valid upper reason boundary300. The existing healthy app lacks POST reopen and returns its normal404; fixtures/login/compilation/migrations succeeded. This is meaningful missing-behavior RED, not a setup or deliberately broken fixture error. Existing139checks remain green. Assertions following the primary failure have not executed or passed.

CI checks PR test-merge d34d22018affa62c75009fa4e8be01b7ab728799, containing basec99748c0f5d7044aa6cbf8e7124fa9300e0006ff and test head3f8918ceefd5eb55cdebd970710fd0789bd38c98; checkout log mentions that merge SHA. Run head metadata is the feature test SHA. These legitimate SHA differences do not represent application changes.

Server failure prevents later Test client, Build server, Build client and Build Docker steps, and cache post-step; those5pipeline steps are SKIPPED. No application test was disabled or skipped. This expected RED run is not merge-ready or deploy-ready. The earlier local builds are separate preflight evidence, not substituted results for the failed CI.

## Retained evidence and next step

- [Complete retained server-step output](red-ci-server.txt), timestamps and assertion stack; environment values omitted and ANSI controls removed.
- [Run metadata/steps/counts/SHA256](red-ci-run.json).
- [Original run plan and actual tested head](red-run-plan.json).
- Test source `server/tests/api/surveyReopen.test.ts`, first HTTP assertion before future DTO/model access, and existing helpers/old-schema imports only.

The evidence commit precedes implementation. Next add remaining meaningful boundary/access/transaction tests in test-first increments, implement approved contract, rerun unchanged original two assertions and full regression. B must review final proposed head/current CI. Migration/local instance/deployed checks and Lab6 accepted baseline remain pending. No GREEN, feature completion, independent UAT, acceptance or deployment is claimed. Assistance:Codex GPT-6.1 Sol under A.

Artifact-format check: the initial evidence staging check reported timestamp-only trailing whitespace; a follow-up commit trims only line-end spaces and refreshes the retained-log SHA256. Original CI/test outcomes are unchanged, the initial evidence commit is preserved, and no implementation occurred between these evidence commits.
