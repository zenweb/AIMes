# Plan - Scheduling API contract coverage

## Success Criteria
- Scheduling API helper endpoint paths are directly covered.
- Default params for equipment and Agent decision reads are directly covered.
- Optimization, compare, feedback, reschedule, and Agent decision write payloads are directly covered.
- Related scheduling UI caller tests remain green.
- Full frontend unit coverage remains green and improves the coverage baseline.

## Execution
- Read `scheduling.ts`, scheduling type definitions, and current callers.
- Add focused API contract tests without production-code changes unless a contract mismatch appears.
- Run focused unit, focused coverage, related caller unit suites, and full frontend unit coverage.

## Result
- Completed.
- Production code unchanged.
- Full frontend unit coverage: 106 files / 786 tests passed; global line coverage 84.29%.
