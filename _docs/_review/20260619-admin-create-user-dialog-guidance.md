# 2026-06-19 Review: Admin Create User Dialog Guidance

## Finding
The AdminBoard page had global governance guidance, but the create-user modal itself did not include local guidance or a help affordance. Account creation is a complex/high-risk governance operation because it changes access scope and initial password handoff, so the prompt was missing at the point of action.

## Change Reviewed
- Added `.modal-guidance` inside the create-user dialog.
- Guidance is bilingual: Simplified Chinese and English.
- Help link points to the existing `#admin-governance-help` section.
- No create/update/toggle business behavior was changed.

## Verification
- RED/GREEN target test passed after reproducing the missing modal guidance.
- AdminBoard unit suite passed: 30/30.
- Full frontend coverage passed: 111 files / 1089 tests.
- Lint and production build passed.
- Real browser preview confirmed the modal guidance, help link, page-level guidance, and fail-loud startup alert render together.

## Residual Risk
- Browser evidence used offline-demo/local auth state, not a live backend admin session.
- This slice improves guidance and help for create-user only. Edit-user and config-save dialogs/rows may still deserve similar local guidance in later slices if a concrete UX gap is confirmed.
