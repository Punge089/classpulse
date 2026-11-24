# Lab 6 version and release register

## Verified repository references, 19 November 2026

| Reference | SHA / observation | Meaning |
|---|---|---|
| Protected Sprint 1 tag v1.0.0-sprint1 | d4bad74211729032697164f378638efb834a67b6 | Baseline; never move/recreate |
| Remote main at preparation | 1fe3e3b82dfb0537be30223c9b598b3479b4affe | Main source observed with Git; not proof of live serving image |
| Remote sprint-2-staging at branch creation | 8c239225c75dc8f0f4db191797282ed9698850d4 | Documentation branch baseline |
| Candidate service URL | https://classpulse-zdwglar6eq-as.a.run.app/ | Needs agreed version readback before UAT |
| Last recorded Lab 5 revision | classpulse-00006-6w6, 100% traffic | Historical observation only |
| Last recorded image digest | sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795 | Historical image tied to main 1fe3e3b in Lab 5; not a fresh serving readback |

Historical metadata provenance: [Lab 5 deployment evidence](../lab-05/deployment.md). Do not reuse its manual test results as Lab 6 independent execution.

## Initial and corrected session register — updated24November2026

| Version ID | Purpose | Source SHA | Digest | Serving revision(s)/traffic | URL | Actual time/operator | Release/CI/smoke evidence |
|---|---|---|---|---|---|---|---|
| CP-V01 | Initial ClassPulse independent UAT | 1fe3e3b82dfb0537be30223c9b598b3479b4affe | sha256:60f61ccccbc559e6c060383ad9acafc6918e1202ec1e7e5e43aa107c35707795 | classpulse-00006-6w6,100% | Candidate URL above | A latest saved Console24Nov02:16:41Bangkok; C/D actual run17:31–18:03 | [Time-specific readback](../../../evidence/lab-06/checkpoint-20261124/cp-v01/reconfirmation.txt); developer preflight8/8, not acceptance |
| PARTNER-V01 | Original Workflow independent UAT | 82a4806b5291b57ad7e76a28fb7d40e1e947b9a6 | sha256:6554d7f8cccdf1b4ded95f3f7d1a2560a786b0ecf7613cab62d59d942613a4fb | scd928edd-00007-477,100% | https://scd928edd-4d7hbszvwq-as.a.run.app | C/D cloud mapping24Nov20:51:51–58Bangkok; A run21:03:40–21:09:45 | [Supplied mapping](../../../evidence/lab-06/checkpoint-20261124/received-cd-a2/Workflow/current-serving-version.json); A footer matched, setup variation later accepted in C/D A3 |
| PARTNER-FIX-01 | Workflow correction branch only, NOT a deployed release | 84a62c781c730ecf5779c80be0607df7ce0fe74f | PENDING corrected deployment | PENDING corrected deployment | Original URL still serves PARTNER-V01 | A inspected remote PR63/CI; no deployed retest | DraftPR63;CI45407729755SUCCESS; actual teammate review/integration/deployment/retest pending |

Append corrected releases and retest versions when they exist. Each correction needs traceable original defective code -> RED test commit -> fix/GREEN commit -> feature merge -> reviewed main release -> deployed image/revision -> independent retest/decision. Explain merge SHA differences. Use CP-EX-* IDs for the professor-standardized educational exercise, never label it as a natural defect of the healthy release.

## Readback procedure

Before handoff and after each correction deployment, read Cloud Run service traffic and serving revision image digest, match Artifact Registry immutable digest to the full source SHA tag and actual release run. Record timestamp/operator and all serving traffic; a latest-ready revision alone does not prove it receives requests. Public health/ready/SPA/auth smoke cannot identify the source image. No environment-secret values should be inspected or captured. Notify the UAT Team before deployment affects their session.

Acceptance is release-specific. Keep initial failures/evidence and corrected observations as separate runs; do not overwrite earlier results. See [record templates R02/R06/R07](records-template.md) and [coordination](coordination.md).

## Standardized exercise lineage

Track healthy source/initial thorough independent run -> new Sprint staging exercise commit -> independently accessible staging test instance -> blind UAT finding -> reproducer RED -> correction GREEN/regression -> reviewed fixed integration/main release -> corrected deployed revision -> independent retest. CP-EX labels identify educational origin. Record failing existing checks honestly; they do not authorize a defective main deployment or disabling CI. See [exercise protocol](exercise-protocol.md) and [coverage audit](coverage-review.md).

## Current integration boundary

PR75 merged3425a5e,PR76 mergedb98369c and PR78 mergedcdcf460 are documentation changes on staging. They do not change main1fe3e3b or provision accounts/deploy an app. Protected annotated Sprint1 tag object7f2a63d8 peels tod4bad742; it has not moved. See [checkpoint](checkpoint-20261124.md). No corrected ClassPulse/exercise release exists yet; final acceptance remains PENDING.

C/D A3 reattaches the original Workflow mapping only. It is neither a new cloud verification nor a corrected serving release. PR63 now Ready at the same84a62c7, but no corrected source/digest/revision/traffic mapping exists. See [later response](../../../evidence/lab-06/checkpoint-20261124/received-cd-a3/Workflow/CORRECTION-STATUS.md).

B v2 UI observes original82a4806 marker21:27:28–21:34:37 Bangkok; later human06 at21:57:46 lacks a fresh marker/mapping in its screenshot and remains qualified. Workflow release64 targets main at eee7c7e with actual osizk approval/current CI; that source is not yet a corrected serving release. Obtain actual post-merge source/marker/revision/digest/traffic/time and keep further execution/retest in a new versioned run.
