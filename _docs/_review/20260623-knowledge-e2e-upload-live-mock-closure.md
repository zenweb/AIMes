# 2026-06-23 Knowledge E2E Upload Live Mock Review

## Scope

- Reviewed `src/frontend/tests/e2e/knowledge.spec.ts` changes for the Knowledge upload live/mock slice.

## Findings

- No blocking review findings for this slice.
- The change is test-scope only and keeps the product behavior unchanged.
- The helper intentionally preserves offline demo page initialization, then switches URL query intent plus local tokens immediately before upload so the POST request exercises the live axios path and Playwright route mock.

## Residual Risk

- Full frontend E2E remains unproven after this slice.
- Other suites may still have red clusters after Knowledge; continue routing by current failing evidence rather than revisiting closed green modules.

## Evidence Checked

- Focused upload run: `npm run test:e2e -- tests/e2e/knowledge.spec.ts -g "上传"` passed.
- Full Knowledge suite: `npm run test:e2e -- tests/e2e/knowledge.spec.ts` passed 21 Chromium tests.
