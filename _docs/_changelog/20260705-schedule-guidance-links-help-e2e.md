# 2026-07-05 Schedule guidance links and help E2E changelog

## Changed

- Added a real-browser Scheduling E2E for the workbench guidance/help surface.
- The test validates bilingual guidance, contextual links to audit/report evidence, and the Help anchor for complex scheduling operations.

## Verified

- `npm run test:e2e -- --grep "排产复杂操作提供双语指引、关联证据链接和帮助入口"`: `1 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.
- GitHub `V1` commit `782411e50ce94215a991231ff9e85410df6f2b8e`: CI run `28727633759` passed and Agent Evaluation run `28727633766` passed.

## Notes

- Initial E2E feedback showed the runtime links are relative (`./audit-logs`, `./report`), so the final assertion follows real browser behavior.
- No production behavior changed in this slice.
