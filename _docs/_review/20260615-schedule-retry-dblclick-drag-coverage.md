# 2026-06-15 ScheduleBoard retry / double-click / drag coverage review

## Scope
- File changed: `src/frontend/tests/unit/schedule-board.test.ts`.
- Production code changed: none.

## Findings
- No blocking issue found in this slice.
- The added tests target user-visible behavior: retry recovery, task double-click explanation, and drag writeback fail-loud handling.
- The earlier parallel full-coverage failure was not a product regression; it was caused by two Vitest coverage runs writing to the same `coverage/.tmp` directory.

## Evidence
- Focused ScheduleBoard test: 48 passed.
- Focused ScheduleBoard coverage: statements 80.17%, branches 48.96%, functions 64.34%, lines 81.32%.
- Full frontend unit coverage: 111 files, 931 tests passed.

## Residual Risk
- ScheduleBoard branch coverage remains low at 48.96%; remaining branches are mostly deeper event/package/governance permutations and should be selected only when they map to a user-critical workflow, not as blind micro-polish.
