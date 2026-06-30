# 2026-06-30 Report E2E Fail-Loud Source Context Closure

## Result

Report real-browser E2E is green for the full Report suite.

## Root Cause

The full `report.spec.ts` run exposed three failures after the POC focused red cluster was already green:

- Report startup evidence sync failures collapsed HTTP `502 Bad Gateway` responses into generic `Bad Gateway` text.
- The aggregate fail-loud alert therefore did not preserve the concrete evidence source, such as `/api/v1/scheduling/customer-order-import/latest`.
- The Excel export assertion used the page-wide `getByRole('alert')`, which became ambiguous when startup evidence errors and global toast errors were present.

## Changed

- `ReportBoard.vue` now formats optional report evidence failures with a source hint.
- Startup evidence messages preserve API/local evidence context while still showing one aggregate ReportBoard fail-loud alert.
- `report.spec.ts` now scopes the Excel export assertion to `.report-board [role="alert"]`.

## Verification

Focused repair check:

```powershell
cd C:\AIWorks\AIMes\v1\src\frontend
npm run test:e2e -- tests/e2e/report.spec.ts -g "多源报表证据加载失败时真实浏览器展示单条聚合 fail-loud 告警|CSV 导出成功后仍保留报表证据加载 fail-loud 告警|OTD 证据链消费批量对比采纳 feedback snapshot"
```

Result: 3 passed.

Full Report suite:

```powershell
npm run test:e2e -- tests/e2e/report.spec.ts
```

Result: 20 passed.

## Boundary

- This proves the Report real-browser E2E suite, not the full frontend E2E suite.
- Full `npm run test:e2e` remains required before claiming full frontend real-browser closure.
- The main CC plan / Full Achievement remains incomplete.
