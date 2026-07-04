# AIMes v1 修复计划（Repo-local Evidence Bridge）

> 完整基线计划位于 `C:\AIWorks\AIMes\_docs\_plan\20260514-cc-remediation-plan.md`。
> 本文件是 `v1` 仓库内的审计桥接页，用于让实现、测试、review 和 release gate 证据能在当前 git 工作树内找到 CC plan 落点。

## Current Status

- Plan status: `ACTIVE`。
- Team model: `1 人 + AI（Claude + Codex）`。
- v1.0.0 scope: 阶段一 `Sprint 0-3` + 首次灰度 + 14 天无 P0/P1。
- v1.1 scope: 阶段二 `Sprint 4-6 + E1`。
- Scope rule: 范围保留；带宽不足时按 cut line 顺延阶段二，不删除任务。
- Current release-gate mode: owner explicitly deferred the 14-day gray observation wait for current follow-up work; strict final v1.0.0 release PASS still requires the original gray observation evidence.

## Authoritative Sources

- Full baseline plan: `C:\AIWorks\AIMes\_docs\_plan\20260514-cc-remediation-plan.md`。
- CEO plan: `C:\Users\陈奕铭\.gstack\projects\AIMes\ceo-plans\2026-05-29-aimes-v1-remediation.md`。
- Engineering test plan: `C:\Users\陈奕铭\.gstack\projects\AIMes\eng-review-test-plan-20260530.md`。
- Deferred items bridge: `_docs/_todo/20260530-deferred-from-ceo-review.md`。

## Sprint 0 Baseline Evidence

- `_docs/_review/20260622-sprint0-current-baseline-index.md` is the current Sprint 0 / task 0.0 repo-local baseline index.
- Backend Unit baseline: `_docs/_review/20260620-unit-tests-full-baseline.md` records 444 passed / 0 failed / 0 skipped.
- Backend Integration baseline: `_docs/_review/20260620-integration-tests-full-baseline.md` records 203 passed / 0 failed / 0 skipped.
- Architecture baseline: `_docs/_review/20260620-architecture-tests-full-baseline.md` records 118 passed / 0 failed / 0 skipped.
- Frontend Unit baseline: `_docs/_review/20260620-frontend-unit-tests-full-baseline.md` records 113 files / 1211 tests passed.
- Frontend Unit Coverage baseline: `_docs/_review/20260620-frontend-unit-coverage-full-baseline.md` records 92.99% overall line coverage.
- Frontend E2E evidence is split by focused browser packs, including `_docs/_review/20260611-sprint0-frontend-e2e-evidence-recovery.md`, `_docs/_review/20260621-frontend-e2e-employee-pass.md`, `_docs/_review/20260621-frontend-e2e-modules-offline-demo-pass.md`, and `_docs/_review/20260621-frontend-e2e-production-pass.md`.
- Current full frontend real-browser E2E: `_docs/_reports/20260630-live-staging-full-e2e-no-skip-closure.md` records `390 passed / 0 skipped / 0 failed` with `AIMES_RUN_LIVE_STAGING_E2E=true`, `AIMES_E2E_LIVE_BACKEND=true`, and live API on `http://127.0.0.1:5002`.
- Employee live-backend recovery evidence: `_docs/_reports/employee-live-backend-evidence-20260630-5002-current.md` records backend health on port 5002, focused auth/offline-demo/employee unit regressions, and Chromium `[employee-live-backend]` recovery from stale offline-demo state to authenticated `/api/v1/employee` read.
- Current staged labor retry candidate evidence is indexed by `_docs/_review/20260622-labor-retry-staged-commit-package-index.md`; it is not a full baseline replacement.

## Current B-Track Release Gate Evidence

- Hosted CI: `_docs/_reports/hosted-ci-20260705-v1-36ff338-pass.md` is `Result: PASS`; GitHub `V1` functional/evidence sweep head `36ff3388197fb6540221c5cb79373882f26863d1` passed CI run `28721692957` and Agent Evaluation run `28721692960`. The later documentation-only tips are also hosted-gate verified: `_docs/_reports/release-gate-audit-20260705-tip-af57f35-doc-refresh-pass.md` records `af57f35778e2946d27ddc1c90d0d2cb62042f9c7`, and GitHub `V1` tip `7e8425c00ac2b03326ab95d26963745fe2f0aaba` passed CI run `28722656677` plus Agent Evaluation run `28722656727`.
- PostgreSQL/staging: `_docs/_reports/staging-rehearsal-20260621-5003-ef-tools-aligned-pass.md` is `Result: PASS`; Docker Desktop Linux engine is available, PostgreSQL/Redis/RabbitMQ/Qdrant/API containers are healthy, EF migrations are up to date with no EF tools/runtime version-skew warning, API uses `http://localhost:5003`, `/live` + `/ready` returned HTTP 200, and reschedule plus commitment PostgreSQL persistence probes passed.
- Security self-assessment: `_docs/_reports/security-self-assessment-20260611-current.md` is `Result: PASS`.
- Attack Chain automated support: `_docs/_reports/attack-chain-automated-evidence-20260611-current.md` is `Result: PASS`.
- Real Chrome frontend evidence: `_docs/_reports/frontend-real-browser-evidence-20260611.md` is `Result: PASS`; 78 Chrome e2e tests covered login/auth guard, audit replay, monitoring escalation, quality evidence flows, and fail-loud no-forged-evidence paths. Visual screenshots are indexed at `output/playwright/20260611-real-browser/manifest.md`.
- Attack Chain manual verification: `_docs/_reports/attack-chain-verification-20260611-manual-verified.md` is `Result: PASS`; Attack Chain A/B/C are `VERIFIED` with human verifier and non-placeholder evidence references.
- Security signoff: `_docs/_review/20260607-security-signoff.md` is `Result: PASS`; human signer and signed decision are present.
- Gray observation: `_docs/_reports/gray-observation-latest.md` is still `OBSERVING` and strict `Result: FAIL`; owner deferred the 14-day wait for current follow-up work, but this remains required for strict final v1.0.0 release PASS.
- Phase-one acceptance matrix: `_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md` maps Sprint 0-3 acceptance criteria to current evidence and explicitly marks remaining human/wall-clock gates.
- Aggregate release gate: `_docs/_reports/release-gate-audit-20260705-current-hosted-ci-36ff338-deferred-gray.md` is the current B-track recheck and reports `Result: PASS_WITH_DEFERRED_GRAY_OBSERVATION`; `_docs/_reports/release-gate-audit-20260705-current-hosted-ci-cc45df7-deferred-gray.md` and `_docs/_reports/release-gate-audit-20260630-live-e2e-no-skip-deferred-gray.md` are prior packets. Hosted CI, PostgreSQL/staging, Attack Chain A/B/C, and Security signoff are PASS, while Gray observation is explicitly `DEFERRED_BY_OWNER`.
- Worktree inventory: `_docs/_reports/worktree-inventory-20260621-current.md` records the local dirty review surface for release-candidate slicing. It explicitly states that hosted CI evidence covers committed heads only and does not prove the dirty worktree.

## Execution Rule

Do not treat this bridge as a scope rewrite. It only makes the active CC plan discoverable from the `v1` repo. Implementation and audit continue to use current worktree evidence, command output, and release gate reports as authoritative proof.
