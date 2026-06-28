# 2026-06-19 TODO: Offline demo report evidence quiet fallback next actions

## Next
- Continue offline demo real-browser traversal for quality, schedule, production, and audit logs.
- Prioritize routes with backend-first evidence loaders and aggregated alert banners.
- For each leak, add a focused RED test before production code changes.

## Guardrail
- Only `OfflineDemoApiError` should be quiet in offline demo mode.
- Live backend failures, invalid payloads, and write failures must remain fail-loud.

## Stop Condition
- User-critical offline demo routes show business content or local fallback states without `Offline demo mode skipped backend request` in visible text, alerts, or console-relevant user messages.
