# 2026-06-19 Plan - Skill Matrix Reassignment Guidance Links

## Success Criteria
- Labor reassignment and stop-work review decisions show bilingual guidance before complex action buttons.
- The guidance includes contextual links to Production, Scheduling, Audit trail, and Help.
- The stop-work review alert is associated with the guidance for assistive technology.
- Existing replacement, block, review, release, and evidence-sync tests remain green.

## Execution
1. Confirmed `SkillMatrixPanel` had a complex qualification/reassignment workflow without explicit bilingual operation guidance and help links.
2. Wrote RED unit test for guidance text, links, and `aria-describedby`.
3. Implemented minimal template and style changes.
4. Verified focused test, component suite, full coverage, lint, build, and real browser rendering.

## Stop Condition
- This slice stops after labor reassignment guidance/link/help behavior is verified.
- The wider active goal remains open because gray observation is deferred.
