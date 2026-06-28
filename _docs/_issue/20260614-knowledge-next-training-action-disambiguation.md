# 2026-06-14 Issue - Knowledge Next Training Action Disambiguation

## Status
- Fixed one accessibility and correctness issue in the knowledge-governance next-training lifecycle path.

## Issue
- R3 next-training lifecycle buttons did not include the asset title in their accessible names.
- When several assets shared the same `trainingSetVersion`, lookup could bind a later asset to the first matching version.
- The user-facing result was ambiguous review actions and potential wrong version IDs being emitted from approval, validation, or publish actions.

## Resolution
- Added asset-specific `aria-label` values for R3 approval, gray-prevalidation, and gray-publish buttons.
- Changed `nextTrainingVersionFor()` to prefer exact recommendation feedback ID matching.
- Kept training-set-version fallback only when the matching version is unique.

## Remaining Gaps
- Broader document upload and knowledge persistence paths remain separate candidates for future hardening.
- Future knowledge work should target distinct workflow risk, not repeat this covered next-training action disambiguation path.
- Gray observation / 15-day monitoring is intentionally deferred by owner direction.
