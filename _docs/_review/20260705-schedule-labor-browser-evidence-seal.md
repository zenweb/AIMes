# 2026-07-05 Schedule labor browser evidence seal review

## Decision

`PASS`

Sealed two Scheduling labor TODO evidence gaps that were still listed as browser-open even though `V1` already contains the matching real-browser tests.

## Scope

- Existing feature: Scheduling labor qualification block and labor evidence retry recovery.
- Target gaps:
  - `_docs/_todo/20260622-schedule-labor-block-agent-suggestion-next-actions.md`
  - `_docs/_todo/20260622-schedule-labor-evidence-retry-recovery-next-actions.md`
- This slice does not change production or test code. It updates the evidence ledger after rerunning the relevant browser tests.

## Evidence

- `人员证据启动读取失败后可重试并释放排产人员约束` verifies the startup labor evidence read failure warning, retry affordance, recovered qualification/reassignment evidence, and warning cleanup in Chromium.
- `人员无有效替班候选时排产保持停工复核事件` verifies the no-reassignment labor block stays as a stop-work review event and opens `人员资质停工复核建议` with audit evidence in Chromium.

## Validation

- `npm run test:e2e -- --grep "人员无有效替班候选时排产保持停工复核事件|人员证据启动读取失败后可重试并释放排产人员约束"`: `2 passed`.
- GitHub `V1` commit `d19d3ce7d5022d52d15ed22314b588eb59ac9322`: CI run `28729807580` passed and Agent Evaluation run `28729807543` passed.

## Boundary

This is a documentation/evidence consistency seal. It does not close DeviceData field deployment verification, `ShouldQuarantine` timing behavior debt, `SubmitLockHandle` concurrency behavior debt, or strict gray-observation release gate.
