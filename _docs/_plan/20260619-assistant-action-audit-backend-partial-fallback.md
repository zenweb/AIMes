# 2026-06-19 Plan - Assistant Action Audit Backend Partial Fallback

## Goal
Protect assistant action audit backend-first reads from incomplete backend array items so replay evidence remains trustworthy.

## Steps
1. Inspect quality knowledge readers and confirm their common helper already filters payloads.
2. Select assistant action audit as the next unprotected admin/audit evidence reader.
3. Add a failing partial backend audit test.
4. Filter backend audit records before merge.
5. Run focused sync/API tests, filtered admin/audit/chat tests, lint, and diff check.
6. Record evidence and remaining release caveats.

## Stop Condition
- Partial backend assistant audits cannot remove action label, type, actor, role, route, trace ID, result message, permission result, or timestamp.
- Non-array backend payloads still fail loud when replay evidence requires it.
- Complete backend audits still merge with local audits.
- Verification results and skipped filtered-test counts are documented.
