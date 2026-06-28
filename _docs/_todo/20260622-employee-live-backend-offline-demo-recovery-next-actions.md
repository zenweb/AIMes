# Next actions - Employee live backend offline-demo recovery - 2026-06-22

## Immediate

- Keep the accessible entry as `http://127.0.0.1:4173/scheduling/login`.
- Use `admin / admin123`.
- If the browser is in offline demo mode, use the visible "切换在线后端" link on the employee fallback state before using the manual local-storage fallback.
- For direct online verification, open `http://127.0.0.1:4173/scheduling/employee?offlineDemo=0`; do not use an `offlineDemo=1` URL when validating live backend employee reads.
- If the page is blank or still shows stale employee fallback after a rebuild, restart the `4173` preview process. A running `node ./scripts/preview.mjs` keeps the old Nuxt bundle in memory until restarted.

## Packaging

- Package employee live-backend hardening separately from the broader personnel capability E2E work.
- Avoid broad staging of `src/frontend/tests/e2e/employee.spec.ts` until its additional personnel capability changes are audited.
- Keep the in-page recovery affordance with the employee live-backend recovery slice; it is directly tied to the offline-demo skip failure mode.
- When reviewing the staged E2E hunk, keep only the recovery-link coverage with this slice unless the broader employee capability E2E changes are reviewed as a separate package.

## Follow-up

- After the staged bundle is split or committed, re-run one smoke pass on the live recovery link to guard against preview/build drift.
- Consider applying the same visible live-backend recovery affordance to other offline-demo fallback pages only after this employee slice is reviewed.
