# 2026-06-20 Review - BOM detail engineering evidence fail-loud

## Scope
- BOM detail selection and its engineering evidence refresh path.

## Findings
- No open findings for this slice.
- Prior detail refresh surfaced thrown errors when mocks failed, but it did not explicitly demand backend readback failures through `{ failLoud: true }`.

## Resolution
- Detail refresh now uses fail-loud backend readback for engineering evidence.
- Startup loading remains tolerant so the board can open with local fallback data.

## Evidence
- Red-first BOM unit test failed on missing readback options.
- Focused and adjacent tests passed.
- Production build passed.

## Residual risk
- This slice does not make ScheduleBoard adoption paths fail loud for alternate material / ECN evidence. That remains a candidate follow-up.
