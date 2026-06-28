# 2026-06-20 Plan: OTD KPI Commitment Backend Fail Loud

## Goal
Make OTD KPI commitment backend reads fail loud when requested and prevent malformed backend payloads from weakening customer promise evidence.

## Success Criteria
- OTD KPI commitment list and latest API reads support fail-loud behavior.
- Non-array backend list payloads fail loud with `后端返回非数组 OTD KPI 承诺审计载荷`.
- Incomplete backend list and latest records do not replace complete local evidence.
- Report, schedule, OTD evidence, and outsourcing adjacent behavior remains stable under targeted tests.

## Execution
1. Add RED tests for list/latest fail-loud reads and non-array list payload.
2. Update `queryOtdKpiCommitments()` and `getLatestOtdKpiCommitment()` to accept fail-loud options.
3. Update backend-first sync reads to pass fail-loud options, validate list shape, and require complete latest records.
4. Run target and adjacent tests, lint, and diff checks.

## Status
- Completed for this slice on 2026-06-20.
- This does not mark the overall CC remediation or strict v1.0.0 goal complete.
