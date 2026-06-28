# 2026-06-14 Todo - Audit Replay OTD Evidence Mapping

## Next Actions
- Move to another low-coverage, user-critical existing feature instead of further polishing this component immediately.
- Keep using coverage increment and business criticality as the routing signal.
- Pair future audit/traceability slices with one focused unit run, full frontend coverage, and a relevant Chromium path when available.

## Candidate Next Slice
- `shortage-risk-sync.ts` remains a good candidate if its coverage is still low and it supports user-critical shortage/OTD decisions.
- `ChatPanel.vue` is broad; only choose a narrow high-value branch if the coverage report shows a clear gap tied to existing assistant workflows.

## Deferred
- Gray observation / 15-day monitoring window remains skipped for this execution path.
