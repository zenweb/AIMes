# 2026-06-20 Plan - Schedule outsourcing suggestion readback

## Goal
Prevent user-triggered outsourcing release recommendations from using stale local outsourcing commitment or receipt evidence.

## Selection
- Outsourcing receipt suggestions can trigger schedule release review and affect OTD recovery evidence.
- This is the next user-critical suggestion family after engineering and labor readback hardening.

## Steps
1. Inspect ScheduleBoard outsourcing suggestion generation and existing outsourcing tests.
2. Add a red stale-local outsourcing receipt regression test.
3. Refresh latest outsourcing commitment with `{ failLoud: true }` before generating outsourcing suggestions.
4. Require backend evidence to match the clicked event.
5. Verify ScheduleBoard and adjacent outsourcing/OTD/report tests.

## Status
- Completed for this slice.
