# 2026-06-19 Offline Demo Monitoring Governance Quiet Fallback

## Summary
- Fixed `/scheduling/monitoring?offlineDemo=1` so skipped monitoring governance reads no longer leak technical backend skip errors.
- Preserved fail-loud behavior for real monitoring governance backend failures.

## Changed
- `src/frontend/src/components/monitoring/MonitoringBoard.vue`
  - Detects `OfflineDemoApiError` during startup governance reads.
  - Keeps demo monitoring startup flowing into SignalR/demo data setup without rendering initialization failure copy.
- `src/frontend/tests/unit/monitoring-board.test.ts`
  - Added RED/GREEN regression coverage for quiet offline demo monitoring governance fallback.
  - Kept ordinary governance backend failure coverage active.

## Evidence
- RED: `npm run test:unit -- tests/unit/monitoring-board.test.ts -t "quietly keeps demo monitoring"` failed before the component change because `现场态势初始化读取失败` and backend skip text were visible.
- GREEN: `npm run test:unit -- tests/unit/monitoring-board.test.ts -t "quietly keeps demo monitoring"` -> 1 passed.
- Fail-loud guard: `npm run test:unit -- tests/unit/monitoring-board.test.ts -t "initial monitoring governance records cannot be loaded"` -> 1 passed.
- `npm run test:unit -- tests/unit/monitoring-board.test.ts` -> 15 passed.
- Offline demo regression bundle -> 352 passed.
- `npm run build` -> passed.
- Real browser:
  - `/scheduling/monitoring?offlineDemo=1`
  - `hasBackendSkip: false`
  - `hasGovernanceFailure: false`
  - `hasHypercareLoadFailure: false`
  - `alertCount: 0`
  - `equipmentCount: 8`
  - demo equipment `CNC-001 加工中心` visible.

## Additional Sweep Findings
- Still queued for later offline demo quiet-fallback slices:
  - `/scheduling/bom`
  - `/scheduling/routing`
  - `/scheduling/equipment`
  - `/scheduling/purchase`
  - `/scheduling/barcode`
  - `/scheduling/scanner`
