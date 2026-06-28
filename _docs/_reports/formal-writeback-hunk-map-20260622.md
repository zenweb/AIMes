# Formal Writeback Hunk Map - 2026-06-22

## Scope

Hunk map for splitting the unstaged `schedule-agent-formal-writeback-trace` work into a clean package without mixing unrelated ScheduleBoard hardening.

## Current Boundary

The current staged package remains `scheduling-agent-e2e-current-worktree-verification`.

Formal writeback is currently unstaged and mixed into wider files:

- `src/frontend/src/components/schedule/ScheduleAgentWorkbenchPanel.vue`
- `src/frontend/src/components/schedule/ScheduleBoard.vue`
- `src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts`
- `src/frontend/tests/unit/schedule-board.test.ts`
- `src/frontend/tests/e2e/scheduling.spec.ts`

`src/frontend/tests/e2e/scheduling.spec.ts` is `MM`; hunk staging must preserve the staged Agent E2E package.

## Keep Hunks

### `ScheduleAgentWorkbenchPanel.vue`

Keep:

- prop addition:
  - `formalScheduleWriteback: 'pending' | 'saved'`
- execution step change:
  - `执行回写` uses `executionWritebackDetail`
  - state is `current` while event adoption feedback exists but formal plan save is still pending
  - state becomes `done` after `formalScheduleWriteback === 'saved'`
- computed helpers:
  - `requiresFormalScheduleSave`
  - `executionWritebackDetail`

Rationale: this is the user-visible distinction between Agent adoption feedback and formal schedule writeback.

### `ScheduleBoard.vue`

Keep only formal-writeback related hunks:

- template prop:
  - `:formal-schedule-writeback="formalScheduleWriteback"`
- status text:
  - `scheduleSaveStatus` paragraph only if included with drag-save proof
- state refs:
  - `formalScheduleWriteback = ref<'pending' | 'saved'>('pending')`
  - `scheduleSaveStatus = ref('')` if drag-save proof is included
- `handleOptimize`:
  - returns boolean success
  - sets `formalScheduleWriteback.value = 'saved'` after successful optimization
  - caller awaits success before recording adoption if this hunk is needed for formal-writeback proof
- drag-save:
  - clears `scheduleSaveStatus` before save
  - sets `formalScheduleWriteback.value = 'saved'` after successful `rescheduleItem`
  - sets `scheduleSaveStatus` with saved window
  - `formatScheduleSaveDate`
- adoption feedback:
  - `needsFormalScheduleWritebackNotice`
  - accepted `rush_event_agent` sets `formalScheduleWriteback.value = 'pending'`
  - feedback sync note explicitly says feedback is recorded but formal plan is not yet written

### `schedule-agent-workbench-panel.test.ts`

Keep:

- mount helper prop support for `formalScheduleWriteback`
- test: `keeps event adoption feedback separate from formal schedule execution`
- test: `marks formal schedule execution done after the plan is saved`

Optional only if already in package scope:

- backend pending/adopt/reject Agent decision tests are not formal-writeback-specific and should stay out unless packaging a broader Agent workbench coverage slice.

### `schedule-board.test.ts`

Keep only direct formal-writeback tests:

- `keeps rush-order adoption separate from formal schedule execution`
- `marks rush-order adoption as formally saved after a successful optimization`
- `marks rush-order adoption as formally saved after a successful drag reschedule`
- `announces successful drag reschedule writeback with the saved window` only if `scheduleSaveStatus` UI is included

Do not keep the wider unrelated startup, guidance, outsourcing, engineering, feedback snapshot, or scenario tradeoff tests in this package.

### `scheduling.spec.ts`

Keep:

- `FORMAL_WRITEBACK_EVIDENCE_TITLE`
- `usesFormalWritebackMock`
- using `mockSchedulingPlanApis(page)` for the formal writeback test
- E2E test:
  - `急单 Agent 采纳后区分反馈与正式排产回写`
- `mockSchedulingPlanApis` additions needed by the test:
  - `optimizedPlan`
  - `/api/v1/scheduling/optimize` response with `plan: optimizedPlan`

Do not disturb already staged Agent backend evidence title handling.

## Defer Hunks

Defer these unrelated changes into separate auditable packages:

- schedule workbench bilingual guidance link UI.
- startup engineering constraint fail-loud aggregation.
- scenario fit/tradeoff details.
- feedback snapshot backend-first restore and invalid payload fallback.
- outsourcing commitment preservation/release handling.
- assistant recovery handoff closure behavior.
- route/engineering/material/labor backend-first fail-loud reads.
- broad `schedule-board.test.ts` fixture and mock refactors not directly required by the formal-writeback tests.

## Suggested Split Order

1. Isolate `ScheduleAgentWorkbenchPanel.vue` and its two direct unit tests.
2. Isolate `ScheduleBoard.vue` minimal state/notice/save transitions and the three direct unit tests.
3. Isolate `scheduling.spec.ts` formal-writeback E2E hunk while preserving the staged Agent E2E hunks.
4. Run validation:

```powershell
npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/schedule-board.test.ts
npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单 Agent 采纳后区分反馈与正式排产回写" --project=chromium
git diff --check -- src/frontend/src/components/schedule/ScheduleAgentWorkbenchPanel.vue src/frontend/src/components/schedule/ScheduleBoard.vue src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts src/frontend/tests/unit/schedule-board.test.ts src/frontend/tests/e2e/scheduling.spec.ts
git diff --cached --check
```

## Current Worktree Behavior Verification

2026-06-22 03:34 recheck: PASS.

Commands:

```powershell
npm run test:unit -- tests/unit/schedule-agent-workbench-panel.test.ts tests/unit/schedule-board.test.ts
npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单 Agent 采纳后区分反馈与正式排产回写" --project=chromium
```

Observed result:

- Unit: 2 files passed, 82 tests passed.
- E2E: 1 Chromium test passed.

This proves the current dirty worktree behavior for pending/saved formal writeback, but it does not prove the eventual release package is clean. Hunk-level packaging is still required.

## Non-Claims

- This hunk map does not stage formal writeback.
- This hunk map does not claim the formal-writeback package is clean yet.
- This hunk map does not complete the global CC plan.
