# 2026-06-19 TODO: Offline demo admin startup quiet fallback next actions

## Next
- Continue real-browser traversal for remaining offline demo routes beyond admin, employee, and document upload.
- Prioritize user-critical modules that load many backend-first evidence sources: report, quality, schedule, production, and audit logs.
- For each discovered leak, write a failing unit test before changing the component or sync utility.

## Guardrail
- Do not globally hide all errors. Only `OfflineDemoApiError` should be quiet in offline demo mode.
- Keep live backend failures visible with business-friendly fail-loud text.

## Stop Condition
- Offline demo routes do not show `Offline demo mode skipped backend request` in visible text or alerts, while live-mode simulated failures still produce clear alerts.
