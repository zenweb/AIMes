# 2026-06-19 Plan - Quality CAPA Operation Guidance Links

## Success Criteria
- CAPA reuse draft operations show bilingual guidance before writeback actions.
- The guidance provides contextual links to draft trace evidence, audit evidence, and help.
- The formal CAPA writeback area is programmatically associated with the guidance.
- Existing CAPA closure, reuse verification, review queue, recommendation adoption, and assistant quality closure behavior remains green.

## Execution
1. Confirmed `QualityCapaTaskPanel` lacked explicit complex-operation guidance/help links at the reuse-draft action point.
2. Wrote RED unit test for bilingual guidance, contextual links, help anchor, and `aria-describedby`.
3. Implemented the smallest template/style change to satisfy the test.
4. Verified target test, component suite, full coverage, lint, build, and real browser rendering.

## Stop Condition
- This slice stops after verified guidance/link/help coverage for the CAPA operation area.
- The wider active goal continues; do not mark full achievement while gray observation remains deferred.
