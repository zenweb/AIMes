# 2026-06-15 Notification SignalR Lifecycle Coverage

- Added focused evidence for the global notification store.
- Covered duplicate SignalR connection prevention when the current connection is already connected.
- Covered offline demo mode bypassing SignalR build/start before connecting.
- Covered ordinary operator event mappings for equipment fault, production progress, inventory stock-out, and purchase status updates.
- Covered unknown backend status/severity labels staying visible instead of being dropped.
- No production code change was required; the existing implementation already satisfied the strengthened contract.

## Verification

From `src/frontend`:

```powershell
npm run test:unit -- tests/unit/notifications.store.test.ts --reporter=dot
npm run test:unit:coverage -- tests/unit/notifications.store.test.ts --reporter=dot --coverage.reporter=json-summary
npm run test:unit -- tests/unit/notifications.store.test.ts tests/unit/http-refresh.test.ts --reporter=dot
```

Results:

- `notifications.store.test.ts`: 12 passed.
- Focused `src/stores/notifications.ts` coverage: 92.68% lines, 91.76% statements, 70.45% branches, 81.81% functions.
- Notification + HTTP focused regression: 2 files / 22 tests passed.

