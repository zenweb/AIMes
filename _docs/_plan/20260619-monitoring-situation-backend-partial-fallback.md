# 2026-06-19 Plan - Monitoring Situation Backend Partial Fallback

## Goal
Keep monitoring situation escalation owner action, schedule action, OTD impact, dispatch steps, and evidence metadata intact when backend-first reads receive partial payloads.

## Steps
1. Confirm current backend-first reader and existing local guard.
2. Add a failing test where backend returns a partial escalation package with the same id as local complete evidence.
3. Filter backend records through the existing guard and merge complete backend/local records.
4. Run focused sync tests plus monitoring, risk queue, schedule, chat, and risk evidence API regressions.

## Stop Condition
- Partial backend escalation packages cannot shadow complete local evidence.
- Complete backend escalation packages still participate in backend-first reads.
- Targeted tests pass and filtered verification scope is explicit.
