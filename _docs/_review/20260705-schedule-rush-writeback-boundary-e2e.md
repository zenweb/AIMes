# 2026-07-05 Schedule Rush Writeback Boundary E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

The Scheduling rush-order Agent workflow now has current real-browser evidence for the operator-facing boundary between local adoption feedback and formal schedule plan writeback.

## Scope

- Surface: `/scheduling/scheduling`
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Target todo: `_docs/_todo/20260622-schedule-rejected-rush-writeback-boundary-next-actions.md`
- Existing unit boundary: `_docs/_review/20260622-schedule-rejected-rush-writeback-boundary.md`

## Result

The focused Playwright E2E `急单 Agent 采纳后区分反馈与正式排产回写` verifies:

- the rush-order event generates a rescheduling suggestion;
- adopting the suggestion writes local feedback and keeps the formal writeback step pending;
- the workbench explicitly says `排产反馈已写入本地复盘记录；正式计划待优化或保存`;
- clicking `排产优化` performs the formal plan update;
- after optimization, the workbench says `排产反馈已写入本地复盘记录；正式排产计划已更新`;
- the `执行回写` step becomes done only after the formal schedule update.

The rejected rush-order side remains covered by the existing 2026-06-22 unit guard, which proves rejected rush-order Agent suggestions do not trigger the formal schedule writeback warning.

No production code changed in this seal. The current slice closes the stale browser-evidence follow-up without broadening the workflow.

## Verification

```text
$env:AIMES_E2E_PORT='4186'; npm run test:e2e -- --grep "急单 Agent 采纳后区分反馈与正式排产回写"
Result: 1 passed
```

## Boundary

- This is frontend quality hardening for an existing Scheduling workflow.
- This does not claim a new browser test for the rejected branch; rejected behavior is still proven by the existing unit-level guard.
- It does not change the release-gate status.
- Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` evidence.
- DeviceData field verification remains separate and still needs the correct runtime or log bundle.
