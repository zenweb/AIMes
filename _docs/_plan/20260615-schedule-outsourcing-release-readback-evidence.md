# 2026-06-15 Schedule Outsourcing Release Readback Evidence Plan

## Goal

Prove the existing ScheduleBoard outsourcing release readback path stays in OTD review mode after release evidence has already been archived.

## Steps

1. Inspect current outsourcing event generation and adoption tests.
2. Add a focused released-package readback test.
3. Verify released event evidence, OTD review suggestion, and no repeated release confirmation.
4. Run focused unit, focused coverage, full frontend coverage, and current host `5000` scan.

## Success Criteria

- Released outsourcing package renders as `已释放`.
- Suggestion title is `外协排产释放后的 OTD 复盘`.
- Suggestion action includes release trace, release audit ID, and customer delivery review.
- `confirmOutsourcingScheduleRelease` is not called for the released readback path.
