# 2026-06-19 Plan: Monitoring Situation Guidance Links

## Success Criteria
- Shopfloor situation sync/escalation shows Simplified Chinese and English guidance.
- The guidance links to scheduling, risk queue, and local help.
- The action group is associated with the guidance through `aria-describedby`.
- Existing monitoring behavior remains covered by unit tests.
- Full frontend verification and real browser evidence are refreshed.

## Execution
1. Add a RED unit test for situation guidance, links, and accessibility association.
2. Implement the smallest UI change in `MonitoringBoard.vue`.
3. Run target test, component suite, full coverage, lint, build, and production preview.
4. Record evidence in the five project document categories.

## Status
- Completed for this slice.
- Overall CC/v1.0.0 goal remains active because gray observation is not proven complete.

