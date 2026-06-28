# 2026-06-14 Chat Labor Reassignment Evidence Answer

## Changed
- Added focused ChatPanel unit evidence for the existing labor capability answer path.
- Made labor qualification block and labor reassignment sync mocks controllable in `chat-panel.test.ts`.
- Verified the assistant uses reassignment, release, and latest OTD labor evidence when RAG falls back to demo analysis.

## Verification
- Focused unit: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "uses labor reassignment"` -> 1 passed.
- ChatPanel unit: `npm run test:unit -- tests/unit/chat-panel.test.ts` -> 52 passed.
- Real browser focused: `npm run test:e2e -- tests/e2e/chat.spec.ts -g "人员替班证据生成后解释" --project=chromium` -> 1 passed.
- Frontend coverage: `npm run test:unit:coverage` -> 105 files passed, 775 tests passed, global line coverage 84.19%, `ChatPanel.vue` line coverage 75.12%.

## Notes
- The focused unit passed immediately because production behavior already consumed the labor evidence correctly; this slice is a coverage and evidence hardening slice, not a production behavior fix.
- Coverage still emits the existing `--localstorage-file was provided without a valid path` warning.
- Gray observation remains owner-skipped/deferred and is not a blocker for this slice.

