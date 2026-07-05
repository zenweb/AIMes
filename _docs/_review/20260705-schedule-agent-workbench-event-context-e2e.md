# 2026-07-05 Schedule Agent Workbench Event Context E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

The Scheduling event queue now has real-browser evidence that user-visible risk events generate the correct Agent rescheduling recommendation context.

## Scope

- Surface: `/scheduling/scheduling`
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Target todo: `_docs/_todo/20260622-schedule-agent-workbench-event-context-next-actions.md`

## Result

The existing Playwright E2E `三类事件触发 Agent 重排建议` verifies:

- the event queue is visible as a list with an accessible event-count label;
- shortage, equipment-fault, and rush-order events are visible;
- clicking the shortage event generates `缺料约束重排建议`;
- clicking the equipment event generates `设备维护窗口重排建议`;
- clicking the rush-order event generates `急单插入重排建议`;
- each generated suggestion includes the expected business context, including BOM substitute material, routing capability, maintenance window, and lock-window scheduling rationale.

No production code changed in this seal. The test already exists on current `V1`; this review closes the stale todo evidence gap.

## Verification

```text
$env:AIMES_E2E_PORT='4185'; npm run test:e2e -- --grep "三类事件触发 Agent 重排建议"
Result: 1 passed
```

## Boundary

- This is frontend quality hardening for an existing Scheduling workflow.
- It does not change the release-gate status.
- Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` evidence.
- DeviceData field verification remains separate and still needs the correct runtime or log bundle.
