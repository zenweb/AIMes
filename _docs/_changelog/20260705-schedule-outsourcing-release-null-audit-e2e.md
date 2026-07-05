# 2026-07-05 Schedule outsourcing release null audit E2E changelog

## Changed

- Added a real-browser Scheduling E2E for the outsourcing schedule release null-audit branch.
- Reused the outsourcing arrival fixture through `seedReceivedOutsourcingCommitment()` so the existing success path and the new fail-loud path share the same input data.

## Verified

- `npm run test:e2e -- --grep "外协排产释放返回空审计时真实浏览器 fail-loud"`: `1 passed`.
- `npm run test:e2e -- --grep "外协到货建议被采纳后真实浏览器归档排产释放证据|外协排产释放返回空审计时真实浏览器 fail-loud"`: `2 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.
- GitHub `V1` commit `587c6409e9752b4bfe8a76e9769209faec8ac59b`: CI run `28727099444` passed and Agent Evaluation run `28727099458` passed.

## Notes

- The new browser test proves the UI preserves adoption feedback and fails loud when release audit persistence returns no record.
- The test also proves the page does not show a fake archive success trace in that failure state.
- This slice does not change the separate DeviceData field-verification boundary.
