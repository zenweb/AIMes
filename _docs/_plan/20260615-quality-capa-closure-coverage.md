# 2026-06-15 Plan: Quality CAPA closure coverage

## Success Criteria

- Quality CAPA positive closure paths have direct test evidence.
- Focused coverage materially improves without production code changes.
- Full frontend unit coverage remains green.

## Steps

1. Run focused QualityCapaTaskPanel coverage baseline.
2. Add tests for task start/no-op, reuse approval, effect verification, low-score queue lifecycle, gray recommendation adoption, and assistant quality action closure.
3. Run target test and focused coverage.
4. Run full frontend coverage.
5. Record outcome and move the next slice to another component.
