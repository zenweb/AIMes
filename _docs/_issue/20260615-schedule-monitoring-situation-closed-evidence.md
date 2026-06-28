# 2026-06-15 Schedule Monitoring Situation Closed Evidence Issue

## Problem

`ScheduleBoard` had logic for closed monitoring situation packages, but the unit tests used fixed empty monitoring sync mocks. That left the closed-state event and closure review suggestion unprovable in focused tests.

## Impact

A regression could lose the closure trace, resolved event status, or closed-state review suggestion for on-site situation packages without being caught by the focused ScheduleBoard test suite.

## Resolution

Hoisted the monitoring situation sync mocks and added a focused test that injects a closed situation package, verifies event readback, and checks the generated closure review suggestion.
