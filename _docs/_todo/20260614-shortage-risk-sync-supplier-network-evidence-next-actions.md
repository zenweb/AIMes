# 2026-06-14 Todo - Shortage Risk Sync Supplier Network Evidence

## Next Actions
- Continue selecting slices by coverage increment and user-criticality.
- Avoid further polishing `shortage-risk-sync.ts` immediately unless a defect appears; its line coverage is now above the current global line coverage.
- Prefer a broad but user-critical component with clear gaps, such as `ChatPanel.vue`, `notifications.ts`, or another low-covered workflow identified by the latest report.

## Candidate Next Slice
- `ChatPanel.vue` remains low at 66.72% lines and is user-critical, but it is broad; choose only one narrow assistant workflow branch.
- `notifications.ts` remains low at 69.51% lines and affects reliability/observability of user feedback.

## Deferred
- Gray observation / 15-day monitoring window remains skipped for this execution path.
