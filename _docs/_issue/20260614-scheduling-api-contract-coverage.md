# Issue - Scheduling API contract coverage

## Problem
- `src/frontend/src/api/scheduling.ts` is a core scheduling boundary but previously had weak direct contract evidence in the full coverage report.
- A wrong endpoint path, dropped default param, or reshaped write payload could break user-critical scheduling flows while component mocks still pass.

## Impact
- Schedule startup, optimization, drag reschedule, feedback submission, and Agent decision workflows depend on these helper contracts.
- Weak direct API helper coverage increases review burden for a 1 person + AI team.

## Fix
- Added direct unit coverage for scheduling reads, writes, default paging, and Agent decision lifecycle helpers.
- Verified related UI caller suites after adding the contract tests.

## Verification
- Focused scheduling API test: 6 passed.
- Related scheduling caller unit tests: 83 passed.
- Full frontend unit coverage: 106 files / 786 tests passed; global line coverage 84.29%.
