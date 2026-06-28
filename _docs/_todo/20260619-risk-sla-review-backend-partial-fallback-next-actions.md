# 2026-06-19 Todo - Risk SLA Review Backend Partial Fallback

## Next Actions
- Continue auditing singleton backend-first readers that call `getLatest...` APIs and return records without runtime validation.
- Consider moving validation into the API adapter only after all direct callers are mapped.
- Keep the v1.0.0 goal active; this closes one evidence integrity slice, not the full release gate.
