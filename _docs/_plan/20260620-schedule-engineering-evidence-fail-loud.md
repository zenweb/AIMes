# 2026-06-20 Plan - Schedule engineering evidence fail-loud

## Goal
Make ScheduleBoard user-action paths fail loud when engineering evidence readback is unavailable or incomplete.

## Selection
- ScheduleBoard is a user-critical path.
- Engineering adoption and route capability release decisions affect formal schedule execution and auditability.
- Startup should remain tolerant, but adoption/release actions need stronger backend evidence.

## Steps
1. Locate ScheduleBoard backend-first engineering evidence reads.
2. Keep startup hydration recoverable with visible warnings.
3. Require `{ failLoud: true }` for adoption/release readback calls.
4. Add focused unit assertions for each affected read.
5. Verify focused, adjacent, and build checks.

## Status
- Completed for this slice.
