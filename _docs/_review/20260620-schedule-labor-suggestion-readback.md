# 2026-06-20 Review - Schedule labor suggestion readback

## Scope
- ScheduleBoard labor event suggestion generation.

## Findings
- Prior labor suggestions used local `readLaborQualificationBlock()` / `readLaborReassignment()` state during user-triggered generation.
- That allowed stale local labor evidence to produce a production-start recommendation without proving current backend evidence.

## Resolution
- Labor suggestion generation now refreshes labor qualification blocks and labor reassignments via backend-first fail-loud reads.
- Missing matching backend evidence prevents suggestion generation and surfaces the reason in the existing error banner.

## Evidence
- Red-first stale-local labor block test failed before the fix and passed after the fix.
- ScheduleBoard full unit suite and adjacent labor tests passed.

## Residual risk
- Startup event cards may still display locally hydrated labor evidence before the user clicks generate; this slice secures the user action path.
