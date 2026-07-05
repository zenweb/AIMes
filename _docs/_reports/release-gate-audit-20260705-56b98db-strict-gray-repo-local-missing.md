# Release gate audit

- GeneratedAt: 2026-07-05T18:46:10.4356096+08:00
- Scope: v1.0.0 B-track hard release gates

## Gate summary

- Evidence packet status: FOUND or MISSING

| Gate | Status | Evidence packet status | Evidence packet | Required evidence |
| --- | --- | --- | --- | --- |
| Hosted CI | PASS | FOUND | _docs/_reports/hosted-ci-20260705-v1-56b98db-pass.md | Hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary |
| PostgreSQL/staging | PASS | FOUND | _docs/_reports/staging-rehearsal-20260621-5003-ef-tools-aligned-pass.md | Production environment, PostgreSQL connection, Docker dependencies, EF migrations, API startup, /live, and /ready |
| Attack Chain A/B/C | PASS | FOUND | _docs/_reports/attack-chain-verification-20260611-manual-verified.md | VERIFIED status, verifier, VerifiedAt, and Attack Chain A/B/C Manual verification PASS with non-placeholder evidence |
| Security signoff | PASS | FOUND | _docs/_review/20260607-security-signoff.md | Human SIGNED decision, signer, SignedAt, evidence, self-assessment, and Attack Chain A/B/C PASS |
| Gray observation | FAIL | FOUND | _docs/_reports/gray-observation-20260705-repo-local-evidence-required.md | PASS gray release id, observation timestamps, 14 calendar days, P0/P1=0, and evidence |

## Gate

- Result: FAIL

## Violations

- Gray observation release gate is not PASS.

This report cannot close the v1.0.0 release gate.
