# Release gate audit

- GeneratedAt: 2026-06-15T09:38:34.8396001+08:00
- Scope: v1.0.0 B-track hard release gates

## Gate summary

- Evidence packet status: FOUND or MISSING

| Gate | Status | Evidence packet status | Evidence packet | Required evidence |
| --- | --- | --- | --- | --- |
| Hosted CI | PASS | FOUND | _docs/_reports/hosted-ci-20260611-v1-pass.md | Hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary |
| PostgreSQL/staging | FAIL | FOUND | _docs/_reports/staging-rehearsal-20260615-5003-docker-api-missing.md | Production environment, PostgreSQL connection, Docker dependencies, EF migrations, API startup, /live, and /ready |
| Attack Chain A/B/C | PASS | FOUND | _docs/_reports/attack-chain-verification-20260611-manual-verified.md | VERIFIED status, verifier, VerifiedAt, and Attack Chain A/B/C Manual verification PASS with non-placeholder evidence |
| Security signoff | PASS | FOUND | _docs/_review/20260607-security-signoff.md | Human SIGNED decision, signer, SignedAt, evidence, self-assessment, and Attack Chain A/B/C PASS |
| Gray observation | DEFERRED_BY_OWNER | FOUND | _docs/_reports/gray-observation-latest.md | Deferred owner decision; original strict gate still requires PASS gray release id, observation timestamps, 14 calendar days, P0/P1=0, and evidence |

## Gate

- Result: FAIL

## Deferred Gates

- Gray observation deferred by owner: 2026-06-13 owner decision to skip the 14-day gray observation wait for current follow-up work.

This report is allowed to continue follow-up work after an explicit owner deferral, but it is not a strict v1.0.0 final release PASS.

## Violations

- PostgreSQL/staging release gate is not PASS.

This report cannot close the v1.0.0 release gate.
