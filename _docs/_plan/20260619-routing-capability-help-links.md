# 2026-06-19 Plan - Routing Capability Help Links

## Goal
Apply the new core principles to an existing user-critical workflow without broadening scope.

## Slice
- Target: `RoutingBoard` route capability validation and release operation.
- Add bilingual guidance for English and Simplified Chinese.
- Turn related route capability evidence destinations into contextual links.
- Provide clickable help/support for the complex operation.

## Success Criteria
- A failing test proves the guidance/link/help affordances are missing before implementation.
- The same test passes after the minimal UI change.
- Full frontend coverage and lint pass.
- Any skipped or blocked real-browser evidence is recorded loudly.

## Result
- Implemented and verified by targeted unit coverage, full frontend coverage, lint, and real Chromium preview evidence.
- Nuxt dev startup remains a separate DX follow-up, but production build + `scripts/preview.mjs` browser evidence passed for this slice.
