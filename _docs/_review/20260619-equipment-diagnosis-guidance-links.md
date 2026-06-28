# 2026-06-19 Review: Equipment Diagnosis Guidance Links

## Scope
- Reviewed the equipment diagnosis slice for the three core product principles:
  - English and Simplified Chinese user-facing guidance.
  - Related UI points exposed as contextual links.
  - Complex diagnosis operation has visible help/support affordance.

## Findings
- No blocking issue found in the changed slice.
- The implementation is limited to `EquipmentBoard.vue` and its unit test.
- The real browser check confirmed the diagnosis guidance, links, and `aria-describedby` are visible in the production build.

## Residual Risk
- Strict v1.0.0 completion remains unproven because the gray observation window is still deferred/skipped by owner decision.

