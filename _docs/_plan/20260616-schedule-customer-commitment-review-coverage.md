# 2026-06-16 Schedule Customer Commitment Review Coverage Plan

## Objective

Cover the customer delivery commitment path that was exposed after the prior outsourcing commitment slice.

## Success Criteria

- The schedule board can load a backend-first OTD KPI commitment package in tests.
- The event queue exposes the customer commitment with audit and trace evidence.
- Generating the suggestion produces the customer delivery recovery review copy.
- The test locks the review boundaries: locked-window insertion, shortage closure, CNC bottleneck protection, and quality gate retention.
- Targeted, related, and full frontend verification pass.

## Outcome

- Success criteria met.
- The component now has direct coverage for the customer commitment review branch.
- Strict v1.0.0 release readiness remains unclaimed while gray observation is deferred.

## Next Slice

Move away from fine-grained `ScheduleBoard.vue` line chasing unless supplier SLA review is explicitly chosen as the next business-critical slice. Prefer the next low/medium-coverage user-critical feature with stronger coverage leverage.
