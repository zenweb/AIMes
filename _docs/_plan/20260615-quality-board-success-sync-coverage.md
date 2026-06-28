# 2026-06-15 Plan - QualityBoard 成功同步路径覆盖

Success criteria:
- `QualityBoard` success paths for MRB, barcode quality knowledge reuse, gate release, and startup fallback are covered by intent-revealing tests.
- Focused `QualityBoard.vue` branch coverage reaches at least 80%.
- Full frontend test suite remains green.
- New runtime verification avoids host `localhost:5000`.

Execution:
1. Read existing `QualityBoard` tests and component handlers.
2. Add focused tests for success sync and startup fallback.
3. Run focused unit tests and focused coverage.
4. Run full frontend coverage.
5. Scan current runtime/operator files for stale host `5000` defaults.

Result:
- Criteria met for the frontend quality slice.
- Live browser staging was not part of this unit-coverage slice; Docker was later restored by the owner, so the next staging proof can proceed with a non-5000 API override such as `http://localhost:5003`.
