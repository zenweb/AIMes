# 2026-06-15 Schedule Production Closeout Evidence Issue

## Problem

`ScheduleBoard` already had a production closeout path that turned OTD evidence-chain `生产复核` records into schedule events, but there was no focused unit evidence proving the event, Agent suggestion, and adoption feedback flow.

## Impact

Production completion and closeout is a user-critical manufacturing path. Without focused evidence, regressions could break post-completion schedule review or audit feedback without being caught by the existing coverage.

## Resolution

Added a focused `schedule-board.test.ts` case that injects a closed production closeout OTD record and verifies the event display, Agent suggestion, local snapshot, and backend feedback payload.
