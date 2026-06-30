# 2026-06-22 Review: Sprint 0 Current Baseline Index

Scope:
- CC plan Sprint 0 task 0.0 requires running existing tests and recording green/red/flaky/not-runnable status as the baseline for later "passed" claims.
- This index consolidates the latest repo-local evidence already present in the worktree. It does not rerun every suite.

Authoritative plan references:
- `_docs/_plan/20260514-cc-remediation-plan.md`
- `C:\Users\陈奕铭\.gstack\projects\AIMes\eng-review-test-plan-20260530.md`

Current baseline evidence:

| Area | Evidence | Status |
| --- | --- | --- |
| Backend Unit | `_docs/_review/20260620-unit-tests-full-baseline.md` | PASS: 444 passed / 0 failed / 0 skipped |
| Backend Integration | `_docs/_review/20260620-integration-tests-full-baseline.md` | PASS: 203 passed / 0 failed / 0 skipped |
| Architecture | `_docs/_review/20260620-architecture-tests-full-baseline.md` | PASS: 118 passed / 0 failed / 0 skipped |
| Frontend Unit | `_docs/_review/20260620-frontend-unit-tests-full-baseline.md` | PASS: 113 files / 1211 tests passed |
| Frontend Unit Coverage | `_docs/_review/20260620-frontend-unit-coverage-full-baseline.md` | PASS: 113 files / 1211 tests passed; line coverage 92.99% |
| Frontend E2E Recovery | `_docs/_review/20260611-sprint0-frontend-e2e-evidence-recovery.md` | PASS evidence for recovered real-browser packs |
| Frontend E2E Employee | `_docs/_reports/frontend-e2e-employee-20260621-pass.md` | PASS focused employee browser pack |
| Frontend E2E Employee Live Backend Recovery | `_docs/_reports/employee-live-backend-evidence-20260630-5002-current.md` | PASS: backend health preflight on port 5002, 64 focused unit tests, and Chromium `[employee-live-backend]` recovery to authenticated `/api/v1/employee` read; rerun after Employee recovery base-path hardening and live API route isolation |
| Frontend E2E Modules Offline Demo | `_docs/_reports/frontend-e2e-modules-offline-demo-20260621-pass.md` | PASS focused modules offline-demo browser pack |
| Frontend E2E Production | `_docs/_reports/frontend-e2e-production-20260621-pass.md` | PASS focused production browser pack |
| Hosted CI / V1 head | `_docs/_reports/hosted-ci-20260621-v1-head-pass.md` | PASS on committed V1 head `47d65547557a8a6cf035327ae94455a1a1285daf` |
| Staging / PostgreSQL | `_docs/_reports/staging-rehearsal-20260621-5003-ef-tools-aligned-pass.md` | PASS on Docker/staging with API port 5003 |

Current local candidate overlay:
- `_docs/_review/20260622-labor-retry-staged-commit-package-index.md` records the current staged `schedule-labor-evidence-retry` package.
- This staged package has focused local validation but is not covered by hosted CI until committed and pushed.

Known limitations:
- This is an index over existing evidence, not a fresh full rerun on 2026-06-22.
- Full frontend E2E is represented by focused/recovered packs, not by a single all-spec green command in this index.
- Employee live-backend recovery evidence depends on backend port `5002` for the current local live API and is a local browser smoke, not hosted CI or staging proof.
- The dirty local worktree contains staged and unstaged candidate work; hosted CI evidence covers committed head only.
- Strict v1.0.0 release PASS remains blocked by the original gray observation requirement unless formally re-scoped.

Audit conclusion:
- Sprint 0 task 0.0 has a usable repo-local baseline map for later pass/fail comparisons.
- Future completion claims must cite the exact layer evidence above or run a fresh command; do not use a focused slice to imply full-suite health.
