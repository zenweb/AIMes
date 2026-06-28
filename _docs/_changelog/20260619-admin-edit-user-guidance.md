# 2026-06-19 Admin Edit User Guidance

## Change
- Added bilingual, in-dialog guidance to the edit-user modal before access changes are saved.
- Linked the edit-user guidance to `#admin-governance-help` so administrators can reach the same system governance support anchor used by other admin operations.

## Evidence
- RED: `npm run test:unit -- admin-board.test.ts -t "edit-user dialog before changing access"` failed because `.modal-content .modal-guidance` was missing from the edit dialog.
- GREEN: `npm run test:unit -- admin-board.test.ts -t "edit-user dialog before changing access"` passed.
- Component suite: `npm run test:unit -- admin-board.test.ts` passed 31/31.
- Full frontend coverage: `npm run test:unit:coverage` passed 111 files / 1094 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser production preview: `admin-edit-user-guidance-real-browser-20260619`, route `/admin`, port 4173, preview process stopped after capture.

## Scope Boundary
- This slice improves an existing high-risk admin operation. It does not close the deferred gray observation gate for strict v1.0.0 readiness.
