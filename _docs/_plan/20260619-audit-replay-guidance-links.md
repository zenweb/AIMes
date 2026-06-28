# 2026-06-19 Plan - Audit Replay Guidance Links

## Success Criteria
- Audit replay page shows bilingual guidance before operators inspect replay chains.
- The guidance links to related Production, Reports, Config Approvals, and Help contexts.
- The replay detail region is programmatically associated with the guidance.
- Existing replay mapping and fail-loud tests remain green.

## Execution
1. Confirmed audit replay had object-specific links but lacked page-level guidance and help affordance.
2. Wrote RED test for bilingual guidance, contextual links, and `aria-describedby`.
3. Implemented minimal template and style changes.
4. Verified targeted test, 59-test replay suite, full coverage, lint, build, and real browser rendering.

## Stop Condition
- This slice stops after audit replay guidance/link/help behavior is verified.
- The wider active goal remains open because gray observation is deferred.
