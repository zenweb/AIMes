# 2026-06-15 Schedule Production Closeout Evidence Plan

## Goal

Add focused evidence for the existing `ScheduleBoard` production closeout review path without expanding product scope.

## Steps

1. Inspect current production closeout mapping and existing `ScheduleEventQueuePanel` unit-test patterns.
2. Add a focused test using an OTD evidence-chain `生产复核` record.
3. Verify event display, Agent suggestion generation, local feedback snapshot persistence, and backend adoption feedback payload.
4. Run focused unit, focused coverage, full frontend coverage, and current host `5000` runtime scan.

## Success Criteria

- The production closeout record appears as a production schedule event.
- The generated suggestion includes follow-up operation window, quality gate, and OTD evidence-chain review.
- Adoption feedback uses `production_event_agent` locally and `accepted_production_event_agent` for backend sync.
- Verification commands pass freshly.
