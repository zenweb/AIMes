# 2026-06-15 Schedule MRB Closed Evidence Issue

## Problem

`ScheduleBoard` had logic for closed MRB disposition records, but the unit test mocks always returned no MRB disposition. That left the closed MRB event and closure review suggestion unproved.

## Impact

A regression could drop the MRB closure trace, resolved event state, or action-result review wording without being caught by focused ScheduleBoard tests.

## Resolution

Hoisted the MRB disposition mocks and added a focused test that injects a closed MRB record, verifies event readback, and checks the generated closure review suggestion.
