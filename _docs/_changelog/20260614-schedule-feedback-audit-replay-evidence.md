# 2026-06-14 Schedule Feedback Audit Replay Evidence

## Change
- Connected backend `ScheduleAdoptionFeedbackUpsert` audit entries to the audit decision replay panel.
- Added replay mapping for schedule adoption feedback, including decision label, reason category, required reason detail, optimization objective, operator, trace ID, and AI scheduling route link.
- Added fail-loud handling so feedback audit records without a non-blank reason detail are skipped and surfaced as replay sync errors instead of appearing as complete evidence.

## Evidence
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "schedule adoption feedback"`
  - RED first: failed because the replay detail stayed on the base rush-order card.
  - GREEN after implementation: 1 targeted test passed.
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`
  - 1 file passed.
  - 24 tests passed.
- `npm run test:e2e -- --project=chromium tests/e2e/audit.spec.ts -g "真实浏览器回放排产采纳反馈审计原因说明"`
  - Nuxt production build passed.
  - Chromium 1 test passed.
- `npm run test:e2e -- --project=chromium tests/e2e/audit.spec.ts`
  - Nuxt production build passed.
  - Chromium 36 tests passed.

## Notes
- This is a depth-hardening slice for the existing AI scheduling and audit replay path.
- Gray observation / 15-day monitoring remains skipped by owner direction and is not used as a blocker for this work item.
