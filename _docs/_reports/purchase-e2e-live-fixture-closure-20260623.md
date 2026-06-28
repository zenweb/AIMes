# Purchase E2E Live Fixture Closure Report - 2026-06-23

## Result

Purchase real-browser E2E is green for the full Purchase suite.

## Verification

```powershell
npm run test:e2e -- tests/e2e/purchase.spec.ts -g "详情加载失败后再次选择成功"
```

Result: 1 passed.

```powershell
npm run test:e2e -- tests/e2e/purchase.spec.ts -g "列表首次降级"
```

Result: 1 passed.

```powershell
npm run test:e2e -- tests/e2e/purchase.spec.ts
```

Result: 13 passed.

## Closure Notes

- The create, confirm, and receive failure cases now switch to live/mock mode immediately before the action that must hit the routed backend request.
- The detail-recovery case now proves a stale detail failure warning is cleared after the next successful detail load while preserving startup evidence warnings.
- The list-recovery case now proves the initial list fail-loud warning survives a successful confirm action and later list refresh.
- The live reload fixtures explicitly prevent unrelated global requests from returning `401` and clearing auth, which was the root cause of the login/dashboard loop.

## Next Gate

Run the full frontend E2E suite and close the next red cluster found after Purchase.
