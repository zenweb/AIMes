# 2026-06-05 Production Real Browser Evidence

## Result

- Result: PASS
- Scope: Nuxt production build + Playwright Chromium project using Google Chrome channel.
- Command: `npm run test:e2e -- production.spec.ts`
- Working directory: `src/frontend`
- Outcome: `21 passed`

## Covered User Interactions

- Production dashboard loads summary, work-order list, filters, scan input, and progress bars.
- Work-order selection opens detail and operation cards.
- Operation cards show SOP, quality gate, equipment, and material constraints.
- Start flow:
  - Start dialog renders qualification checks.
  - CNC start writes execution trace.
  - Heat-treatment start consumes labor reassignment evidence and writes OTD evidence.
  - Missing replacement candidate blocks start confirmation.
- Completion flow:
  - Completion generates scheduling writeback, production review, and quality writeback records.
  - Completion evidence appears in Scheduling, Report, and Audit replay.
- Exception flow:
  - Exception report creates risk linkage.
  - Exception evidence appears in Report, Scheduling, Audit replay, Dashboard assistant, Admin governance, Anomaly, and Risk action queue.
- Empty work-order state remains visible when API returns no records.

## Notes

- This is focused browser evidence for the production execution critical path.
- It does not close hosted CI, PostgreSQL/staging rehearsal, human attack-chain verification, security signoff, or gray observation gates.
- Nuxt build still emits the known large chunk warning for chunks over `900 kB`; keep it as a separate performance follow-up.
