# 2026-06-15 Knowledge Citation Inventory Routing Coverage Plan

## Objective

Improve evidence for AI assistant citation routing and inventory consistency without expanding product scope.

## Selection Rationale

After shared HTTP, notifications, and CSV export evidence, AI citation trust was the next user-critical existing path. It affects whether assistant answers can be audited and whether review-only sources stay under review.

## Execution

1. Read `src/utils/knowledge-citations.ts` and existing tests.
2. Add inventory consistency coverage for governance-reviewed sources.
3. Add route isolation coverage for top-risk questions.
4. Run focused tests, focused coverage, and related governance/quality knowledge regressions.
5. Record evidence in five documentation streams.

## Result

No implementation change was needed. The added tests proved the existing citation routing and inventory behavior.

