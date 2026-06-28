# 2026-06-19 Todo - Anomaly Dispatch Backend Partial Fallback

## Next Actions
- Continue auditing backend-first evidence readers for API adapters that return typed records without runtime validation.
- Consider moving shared runtime validation into API adapters when multiple callers read the same evidence type.
- Add broader regression only if another anomaly dispatch caller bypasses `readAnomalyDispatchRecordsBackendFirst`.
