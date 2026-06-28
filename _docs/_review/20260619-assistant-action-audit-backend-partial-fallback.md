# 2026-06-19 Review - Assistant Action Audit Backend Partial Fallback

## Scope
- Reviewed assistant action audit backend-first reader used by admin and audit replay evidence.
- Focused on preserving action label, action type, actor, role, route, audit code, trace ID, result message, permission result, and created timestamp.

## Findings
- `readAssistantActionAuditsBackendFirst` validated that backend payload was an array, but merged array items without validating each audit record.
- A partial backend item could appear in replay/admin evidence without permission result or user-facing action label.
- Local storage already filtered incomplete action audit records; backend-first merge missed the same guard.

## Decision
- Filter backend records through `isAssistantActionAuditRecord` before merging with local records.
- Preserve existing fail-loud behavior for non-array payloads and explicit `{ failLoud: true }` backend failures.

## Residual Risk
- Mixed backend arrays now keep complete backend audits and drop partial ones.
- Filtered admin/audit/chat tests are adjacency checks, not full frontend regression.
