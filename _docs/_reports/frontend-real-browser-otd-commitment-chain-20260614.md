# Frontend Real Browser OTD Commitment Chain Evidence

- GeneratedAt: 2026-06-14T00:00:00+08:00
- Scope: OTD KPI commitment package chains in Report, Chat, Scheduling, and Audit replay.
- Command: `npm run test:e2e -- tests/e2e/report.spec.ts -g "OTD KPI 可生成客户交付恢复承诺包并进入助手与审计|OTD KPI 产品族外协等待可生成外协承诺包并进入排产与审计"`
- WorkingDirectory: `src/frontend`
- Nuxt mode: production build via `scripts/e2e.mjs`
- Browser project: `chromium`

## Result

- Build: PASS
- Tests: 2 passed
- Result: PASS

## Covered Paths

- Report OTD KPI customer drilldown generates `华东新能源 交付恢复承诺包`.
- Customer commitment evidence shows `AUD-KPI-COMMITMENT-HUADONG-20260521-001` and `TRACE-KPI-COMMITMENT-HUADONG-20260521`.
- Report CSV export contains the customer commitment package and audit/trace pair.
- Chat can read the generated customer commitment package and answer with the OTD recovery basis.
- Audit replay shows the customer commitment decision chain and archived KPI/customer/action/export rationale.
- Report product-family drilldown generates `法兰盘 DN100 外协承诺包`.
- Outsourcing commitment evidence shows `AUD-OUTSOURCING-COMMITMENT-FLANGE-20260521-001` and `TRACE-OUTSOURCING-FLANGE-20260521`.
- Scheduling event queue receives the outsourcing commitment event and generates the post-outsourcing reschedule review suggestion.
- Audit replay records the outsourcing commitment, schedule review, and factory-outside waiting classification.
- Report CSV export contains the outsourcing commitment package and audit/trace pair.

## Boundary

- This is targeted real-browser evidence for the OTD commitment chain, not a full frontend regression.
- The 15-day gray observation window is owner-deferred/skipped per 2026-06-14 direction and is not marked PASS here.
- This report does not change production code and does not replace hosted CI, staging, or backend live persistence evidence.
