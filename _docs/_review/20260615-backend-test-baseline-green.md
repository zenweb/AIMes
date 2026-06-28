# 2026-06-15 Backend Test Baseline Review

## Result

Pass for the regular backend baseline.

## Reviewed Evidence

- Architecture rules: 115/115 passed.
- Unit tests: 444/444 passed after sequential rerun with `-m:1`.
- Integration tests: 203/203 passed with `-m:1`.
- Evaluation tests: 2/2 passed with `-m:1`.

## Notes

- The earlier unit-test failure was caused by parallel test output contention on `MES.Api.dll`; the same project passed when run sequentially. Future backend baseline runs should avoid parallel project execution unless the build output isolation is changed.
- `MES.Benchmarks` remains outside the normal green/red baseline because benchmark output is performance evidence, not a deterministic regression gate.
- Docker runtime smoke is still separate from this backend test baseline. Current compose configuration resolves API to `published=5002`, `target=5002`.

