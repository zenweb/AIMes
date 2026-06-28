# 2026-06-14 Plan - Knowledge Next Training Action Disambiguation

## Objective
- Harden the existing knowledge-governance next-training workflow so lifecycle actions are unambiguous and emit the correct version IDs.

## Success Criteria
- Add a failing unit test first for multiple R3 next-training assets.
- Prove the current implementation lacks asset-specific accessible names and misbinds shared-version assets.
- Add the minimum production fix in `KnowledgeGovernancePanel.vue`.
- Verify action labels, emitted version IDs, and real-browser R3 lifecycle behavior.
- Run focused and broad verification.

## Execution
- Added one unit regression test in `src/frontend/tests/unit/knowledge-governance-panel.test.ts`.
- Confirmed RED: buttons could not be found by asset-specific accessible names and repeated R3 assets matched the first R3 version.
- Added asset-specific accessible names to the next-training lifecycle buttons.
- Tightened version lookup to exact feedback ID first, unique-version fallback second.
- Updated one Chromium R3 lifecycle test to use the asset-specific button names.
- Ran focused unit, full panel unit, focused Chromium, full knowledge Chromium, and full frontend unit coverage.

## Stop Condition
- Stop this next-training action disambiguation subpath for now; it has both unit and real-browser evidence.
- Continue with the next highest-leverage existing feature slice.
- Gray observation / 15-day monitoring remains deferred by owner instruction.
