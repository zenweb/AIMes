# Knowledge E2E Upload Live Mock Closure Report - 2026-06-23

## Result

Knowledge real-browser E2E is green for the full focused suite.

## Verification

```powershell
npm run test:e2e -- tests/e2e/knowledge.spec.ts -g "上传"
```

Result: 2 passed.

```powershell
npm run test:e2e -- tests/e2e/knowledge.spec.ts
```

Result: 21 passed.

## Closure Notes

- The upload success case now proves a routed live/mock `/api/v1/knowledge/documents` response enters the governance queue.
- The bad-payload case now proves HTML fallback is surfaced as a row-level fail-loud error and does not create fake upload history.
- The route stays initialized under offline demo data to avoid unrelated mounted evidence GET calls from triggering live backend auth redirects.

## Next Gate

Run the full frontend E2E suite and close the next red cluster found after Knowledge.
