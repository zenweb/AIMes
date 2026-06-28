# 2026-06-19 Review - Monitoring Situation Backend Partial Fallback

## Scope
- Reviewed the monitoring situation escalation backend-first array reader.
- Files changed:
  - `src/frontend/src/utils/monitoring-situation-escalation-sync.ts`
  - `src/frontend/tests/unit/monitoring-situation-escalation-sync.test.ts`

## Finding
- Local storage reads already rejected incomplete escalation packages, but backend-first reads returned any non-empty backend array.
- A partial backend package could remove owner, schedule action, OTD impact, evidence, dispatch steps, and audit metadata from monitoring, risk, schedule, chat, and audit-facing flows.

## Resolution
- Added backend record filtering with the existing `isMonitoringSituationEscalation` guard.
- Added merge semantics so complete backend records retain precedence while local complete records remain available when backend data is empty or partial.

## Residual Risk
- The shared API adapter still returns a typed array at compile time. Other direct callers should use this guarded reader instead of trusting raw API records.
