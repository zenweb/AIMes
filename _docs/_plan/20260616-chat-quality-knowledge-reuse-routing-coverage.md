# 2026-06-16 Chat Quality Knowledge Reuse Routing Coverage Plan

## Goal

Make the existing AI production assistant answer quality knowledge reuse questions with the deep CAPA reuse evidence chain instead of a generic quality rework fallback.

## Success Criteria

- A quality knowledge reuse question enters the `扫码质量复用建议` branch.
- The answer includes sample, draft, verified CAPA, published retraining version, and recommendation feedback evidence.
- The existing quality rework impact branch still works for impact/replanning questions.
- Targeted and full frontend regression pass.

## Result

- Success criteria are met.
- The fix is limited to intent routing in `ChatPanel.vue`.
- Tests now protect the route against future broad-intent regressions.

## Next Routing

Pick the next slice by coverage leverage and user-critical path value. Do not keep expanding ChatPanel unless a concrete assistant workflow gap is found.
