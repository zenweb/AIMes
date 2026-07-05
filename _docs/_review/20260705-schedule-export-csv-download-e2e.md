# 2026-07-05 Schedule Export CSV Download E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

The Scheduling toolbar CSV export now has real-browser download evidence. This closes a small but user-visible Scheduling quality slice without changing production behavior.

## Scope

- Surface: `/scheduling/scheduling?offlineDemo=0`
- User action: toolbar `导出 CSV`
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Evidence type: Playwright Chromium download event plus downloaded file content readback.

## Result

- Added a Playwright E2E for `工具栏导出 CSV 时真实浏览器下载当前排产计划`.
- The test waits for the rendered Gantt task line, clicks `导出 CSV`, captures the browser download, and verifies:
  - suggested filename matches `排产计划-yyyyMMdd-HHmm.csv`;
  - downloaded content contains the expected CSV header;
  - downloaded content contains `WO-DEMO-1001`;
  - downloaded content includes a percent progress value.
- No production code changed because the existing export behavior already produced the correct browser download.

## Verification

```text
npm run lint -- tests/e2e/scheduling.spec.ts
Result: PASS

git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts
Result: PASS

npm run test:e2e -- --grep "工具栏导出 CSV 时真实浏览器下载当前排产计划"
Result: 1 passed

GitHub Actions for commit 924bd5a693d7de86b8623dfc4b2bbb19bb76dc47
CI: success (run 28725364165)
Agent Evaluation: success (run 28725364169)
```

## Notes

- An earlier 120s command window was interrupted during Nuxt build and surfaced an EPIPE-style timeout; that was a command timeout, not a Playwright assertion failure.
- The successful run used a longer timeout and completed the production Nuxt build plus the targeted Chromium test.

## Boundary

- This is frontend quality hardening for an existing Scheduling workflow.
- It does not change backend Scheduling persistence or CSV generation logic.
- It does not replace the separate `DeviceDataIocTask` / `usemark=9` field verification, which remains blocked by missing target runtime evidence.
- It does not change the release-gate status. Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` monitoring evidence.
