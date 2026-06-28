# Review - BOM startup and list failures aggregate

## Scope
- Reviewed `src/frontend/src/components/bom/BomBoard.vue`.
- Reviewed `src/frontend/tests/unit/bom-board.test.ts`.
- Reviewed `src/frontend/tests/e2e/engineering-data.spec.ts`.

## Findings
- No open issue remains in this slice after verification.
- RED confirmed the original behavior: `BOM 列表加载失败` overwrote `BOM 工程证据加载失败`.

## Decision
- Kept one visible alert for the page, but composed it from separate startup/list/operation lanes.
- This avoids UI churn while preserving fail-loud evidence from independent failure sources.

## Residual Risk
- The full repository worktree is dirty with many unrelated changes; this slice intentionally touched only BOM and engineering-data evidence files.
- The known `--localstorage-file` warning remains outside this slice.
