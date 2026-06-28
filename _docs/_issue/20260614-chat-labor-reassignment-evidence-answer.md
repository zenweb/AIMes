# 2026-06-14 Issue - Chat Labor Reassignment Evidence Answer

## Problem
- The ChatPanel labor capability fallback answer had real browser coverage but did not have focused unit evidence for the branch that consumes labor reassignment and qualification release records.
- Unit tests mocked the labor sync helpers as fixed empty arrays, so the existing evidence-rich answer branch could not be asserted directly.

## Root Cause
- `chat-panel.test.ts` used inline `vi.fn(() => [])` mocks for `readLaborQualificationBlocks` and `readLaborReassignments`.
- Tests could not inject personnel evidence without changing the mock shape.

## Fix
- Promoted the labor sync mocks to hoisted controllable mocks.
- Added a focused unit test that proves the assistant answer uses reassignment, release, and latest OTD labor evidence.

## Remaining Issue
- Full frontend coverage still reports `--localstorage-file was provided without a valid path`.
- This warning remains outside this slice.

