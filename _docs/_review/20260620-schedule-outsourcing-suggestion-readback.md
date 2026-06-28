# 2026-06-20 Review - Schedule outsourcing suggestion readback

## Scope
- ScheduleBoard outsourcing commitment and outsourcing receipt suggestion generation.

## Findings
- Prior outsourcing suggestions could use locally hydrated outsourcing commitment state during user-triggered generation.
- That allowed stale local receipt evidence to produce an outsourcing release recommendation without proving current backend evidence.

## Resolution
- Outsourcing suggestion generation now refreshes the latest outsourcing commitment through backend-first fail-loud readback.
- Missing or mismatched backend evidence prevents suggestion generation and reports the evidence gap.

## Evidence
- Red-first stale-local outsourcing receipt test failed before the fix and passed after the fix.
- ScheduleBoard full unit suite and adjacent outsourcing/OTD/report tests passed.

## Residual risk
- Startup event cards may still display locally hydrated outsourcing evidence before the user clicks generate; this slice secures the user action path.
