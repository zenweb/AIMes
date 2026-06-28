# 2026-06-13 TODO: Schedule live staging rejection evidence next actions

- Keep the real dhtmlx smoke set centered on render, successful save/readback, and rejected save/no false success.
- If continuing this path, add a compact report aggregator for the three scheduling real dhtmlx browser evidence manifests.
- Do not broaden scheduling scope until the current drag-save/readback/rejection evidence remains stable in CI-like runs.
- Avoid parallel Playwright invocations that share the default preview port; run targeted E2E commands serially or set distinct `AIMES_E2E_PORT` values.

