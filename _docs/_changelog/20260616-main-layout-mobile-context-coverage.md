# 2026-06-16 MainLayout Mobile Context Coverage

- Added focused unit evidence for `MainLayout.vue` mobile navigation and active module context.
- Verified the shell shows the active module group, label, and description for the current route.
- Verified the active sidebar link is marked for the current route.
- Verified mobile navigation closes after a module is selected and updates `aria-expanded` back to `false`.
- Improved the MainLayout unit test isolation by mocking `ChatPanel.vue` and `ToastContainer.vue` at module level, so targeted coverage no longer imports broad unrelated component trees.
- Production code was not changed.

## Verification

- Targeted new test: `npm run test:unit -- tests/unit/main-layout.test.ts -t "closes mobile navigation" --reporter=dot`
  - Result: `1 passed | 3 skipped`.
- Targeted MainLayout coverage: `npm run test:unit:coverage -- tests/unit/main-layout.test.ts --reporter=dot --coverage.reporter=text`
  - Result: `1 file / 4 tests passed`.
  - `MainLayout.vue`: statements `88.13%`, branches `75.47%`, functions `77.27%`, lines `90.19%`.
- Full frontend coverage: `npm run test:unit:coverage -- --reporter=dot`
  - Result: `111 files / 1041 tests passed`.
  - Totals: statements `89.07%`, branches `76.19%`, functions `88.89%`, lines `92.24%`.
