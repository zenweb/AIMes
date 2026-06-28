# 2026-06-19 Admin Create User Dialog Guidance

## Summary
- Added in-dialog guidance for the high-risk admin create-user flow.
- The create-user dialog now shows Simplified Chinese and English guidance before account creation.
- The dialog guidance links to `#admin-governance-help`, keeping the local action connected to the broader system governance help.

## Evidence
- RED: `npm run test:unit -- admin-board.test.ts -t "shows bilingual guidance and help inside the create-user dialog"` failed because `.modal-guidance` was missing.
- GREEN: the same targeted test passed after adding the dialog guidance.
- Admin suite: `npm run test:unit -- admin-board.test.ts` passed, 30 tests.
- Full coverage: `npm run test:unit:coverage` passed, 111 files / 1089 tests. Total coverage stayed at statements 89.74%, branches 77.19%, functions 89.96%, lines 92.84%; AdminBoard branch coverage moved to 57.67%.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `http://127.0.0.1:4173/admin/` rendered the create-user modal with bilingual guidance and help link. Screenshot captured as `admin-create-user-dialog-guidance-real-browser-20260619`.

## Files
- `src/frontend/src/components/admin/AdminBoard.vue`
- `src/frontend/tests/unit/admin-board.test.ts`
