# 2026-06-20 Review - Schedule engineering evidence fail-loud

## Scope
- ScheduleBoard engineering constraint adoption and route capability release flows.

## Findings
- No open findings for this slice.
- Prior flow could execute adoption/release logic without explicitly requiring fail-loud backend readback for engineering evidence.

## Resolution
- `applyEngineeringChangeApprovals()` now reads alternate material approval and ECN impact with `{ failLoud: true }`.
- `applyRouteCapabilityValidation()` now reads route capability validation with `{ failLoud: true }`.
- Startup constraint loading still catches and surfaces warnings so the board remains usable when initial evidence hydration fails.

## Evidence
- Focused tests assert fail-loud options for alternate material, ECN impact, and route capability reads.
- Adjacent BOM and engineering evidence tests passed.
- Production build passed.

## Residual risk
- This slice does not audit every downstream generated suggestion for local fallback reuse; continue selecting next slices by user-criticality and coverage leverage.
