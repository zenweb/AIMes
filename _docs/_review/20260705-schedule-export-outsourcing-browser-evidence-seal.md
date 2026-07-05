# 2026-07-05 Schedule export and outsourcing browser evidence seal review

## Decision

`PASS`

Sealed three Scheduling TODO evidence gaps that were still listed as browser-open even though `V1` already contains the matching Chromium E2E coverage.

## Scope

- Existing features:
  - Schedule CSV toolbar export.
  - Outsourcing release null-audit fail-loud handling.
  - Outsourcing release risk-refresh fail-loud handling.
- Target gaps:
  - `_docs/_todo/20260622-schedule-export-csv-toolbar-evidence-next-actions.md`
  - `_docs/_todo/20260622-schedule-outsourcing-release-null-audit-fail-loud-next-actions.md`
  - `_docs/_todo/20260622-schedule-outsourcing-release-risk-refresh-fail-loud-next-actions.md`
- This slice does not change production or test code. It updates the evidence ledger after rerunning the relevant browser tests.

## Evidence

- `工具栏导出 CSV 时真实浏览器下载当前排产计划` verifies Chromium download handling, filename format, CSV headers, current task row, and progress value.
- `外协排产释放返回空审计时真实浏览器 fail-loud 且不虚假归档` verifies missing release audit evidence fails loud, keeps adoption feedback local, and does not write false release archive trace fields.
- `外协排产释放后风险事件刷新失败时真实浏览器保留释放确认` verifies the release confirmation remains visible and archived when the follow-up risk dashboard refresh fails.

## Validation

- `npm run test:e2e -- --grep "工具栏导出 CSV 时真实浏览器下载当前排产计划|外协排产释放返回空审计时真实浏览器 fail-loud 且不虚假归档|外协排产释放后风险事件刷新失败时真实浏览器保留释放确认"`: `3 passed`.
- Hosted CI and Agent Evaluation: pending GitHub `V1` submission.

## Boundary

This is a documentation/evidence consistency seal. It does not close the separate task-detail backend browser evidence, double-click browser evidence, DeviceData field deployment verification, `ShouldQuarantine` timing behavior debt, `SubmitLockHandle` concurrency behavior debt, or strict gray-observation release gate.
