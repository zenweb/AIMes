# 2026-06-19 Plan: Admin Create User Dialog Guidance

## Goal
Bring the existing AdminBoard create-user flow closer to boutique quality by adding local guidance and help where the complex account-creation action happens.

## Scope
- Existing create-user modal only.
- No new admin workflow.
- No changes to account creation, refresh, pagination, or backend API behavior.

## Steps
1. Inspect existing AdminBoard tests and recent admin next-action docs to avoid repeating closed slices.
2. Add a RED test requiring bilingual guidance and a help link inside the create-user dialog.
3. Add minimal modal guidance markup and styles.
4. Run targeted, component, full coverage, lint, build, and browser checks.
5. Record changelog, review, todo, issue, and plan artifacts.

## Stop Condition
- The modal displays Chinese and English guidance before account creation.
- The modal links to `#admin-governance-help`.
- Tests and browser evidence prove the behavior.
