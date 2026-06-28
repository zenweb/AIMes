# 2026-06-20 Review - Schedule suggestion engineering readback

## Scope
- ScheduleBoard event suggestion generation for engineering evidence driven events.

## Findings
- Prior code could generate a suggestion from local alternate-material or engineering evidence when startup readback had failed.
- That allowed a user action to proceed from stale local evidence instead of proving current backend evidence.

## Resolution
- Suggestion generation now performs fail-loud backend readback for route capability, engineering change, and targeted alternate-material evidence.
- Readback failure leaves the Agent suggestion in the waiting state and surfaces an error banner.

## Evidence
- Red-first test reproduced stale local alternate-material suggestion generation.
- Focused ScheduleBoard and adjacent engineering evidence tests passed.

## Residual risk
- This slice covers engineering evidence driven suggestions only; other event families should continue to be selected by user-criticality and coverage leverage.
