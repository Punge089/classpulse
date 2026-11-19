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

## Initial and corrected session register

| Version ID | Purpose | Source SHA | Digest | Serving revision(s)/traffic | URL | Actual time/operator | Release/CI/smoke evidence |
|---|---|---|---|---|---|---|---|
| CP-V01 | Initial independent UAT | Pending | Pending | Pending | Candidate URL above | Pending | Pending |
| PARTNER-V01 | A/B test partner app | Pending | Pending | Pending | Pending partner handoff | Pending | Pending |

Append corrected releases and retest versions when they exist. Each correction needs traceable original defective code -> RED test commit -> fix/GREEN commit -> feature merge -> reviewed main release -> deployed image/revision -> independent retest/decision. Explain merge SHA differences. Use CP-EX-* IDs for the TA-approved isolated exercise, never label it as a natural defect of the healthy release.

## Readback procedure

Before handoff and after each correction deployment, read Cloud Run service traffic and serving revision image digest, match Artifact Registry immutable digest to the full source SHA tag and actual release run. Record timestamp/operator and all serving traffic; a latest-ready revision alone does not prove it receives requests. Public health/ready/SPA/auth smoke cannot identify the source image. No environment-secret values should be inspected or captured. Notify the UAT Team before deployment affects their session.

Acceptance is release-specific. Keep initial failures/evidence and corrected observations as separate runs; do not overwrite earlier results. See [record templates R02/R06/R07](records-template.md) and [coordination](coordination.md).
