# 2026-06-20 Review - Schedule suggestion missing engineering evidence

## Scope
- ScheduleBoard engineering evidence driven suggestion generation when backend readback returns `null`.

## Findings
- A fail-loud read that returned `null` did not throw.
- The material event then fell through to a generic shortage recommendation, which could make the UI look actionable without backend alternate-material evidence.

## Resolution
- Missing backend evidence is now treated as a fail-loud condition for route capability, engineering change, and targeted alternate-material suggestions.
- The active suggestion remains in the waiting state and the existing error banner explains the missing evidence.

## Evidence
- Red-first missing-evidence test reproduced the generic shortage recommendation.
- Focused and adjacent tests passed after the fix.

## Residual risk
- This slice intentionally covers engineering evidence driven suggestions only.
