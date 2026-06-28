# 2026-06-20 Review: Equipment Evidence Backend Fail Loud

## Scope

Reviewed the equipment evidence backend-first read paths:

- `src/frontend/src/api/equipmentEvidence.ts`
- `src/frontend/src/utils/equipment-risk-sync.ts`
- `src/frontend/tests/unit/equipment-risk-sync.test.ts`
- `src/frontend/tests/unit/equipment-evidence-api.test.ts`

## Findings

- No blocking issue found in this slice.
- `failLoud` remains opt-in, preserving ordinary local/demo fallback semantics.
- Incomplete equipment downtime payloads now produce `后端返回残缺设备停机审计载荷` when audit refresh requests fail-loud behavior.
- Incomplete customer equipment fault payloads now produce `后端返回残缺客户设备故障审计载荷` when audit refresh requests fail-loud behavior.

## Residual Risk

- Verification is frontend unit/component focused. It does not prove live Docker/PostgreSQL readback.
- Adjacent tests were filtered and include skipped tests; they are not a full frontend regression.
- Current worktree contains pre-existing dirty files. This review only covers the equipment evidence slice and directly touched files.

## Evidence

- `equipment-risk-sync.test.ts`: 15 passed.
- `equipment-evidence-api.test.ts`: 3 passed.
- `equipment-schedule-impact-panel.test.ts` filtered: 3 passed, 1 skipped.
- `report-board.test.ts` filtered: 7 passed, 21 skipped.
- `chat-panel.test.ts` filtered: 5 passed, 66 skipped.
- `poc-evidence-governance.test.ts`: 2 passed.
- Targeted lint passed.
- Targeted `git diff --check` exited 0 with LF/CRLF normalization warnings only.
