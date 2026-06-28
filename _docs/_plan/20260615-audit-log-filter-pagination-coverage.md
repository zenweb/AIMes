# 2026-06-15 AuditLogBoard filter / pagination coverage plan

## Success Criteria
- Action filter resets to page 1 and reloads audit logs with the selected action.
- Pagination loads the requested page and preserves the audit review workflow.
- A reviewer can open and close a detail modal from a paged result.
- Focused AuditLogBoard tests pass.
- Full frontend coverage passes.

## Execution
1. Select AuditLogBoard as the next clean user-critical audit path.
2. Inspect existing AuditLogBoard tests and coverage gaps.
3. Add focused tests for filtering, pagination, and detail close behavior.
4. Run focused tests and focused coverage.
5. Run full frontend coverage.
6. Record evidence in changelog/review/todo/issue/plan docs.

## Result
- Criteria met for this coverage-hardening slice.
- The overall CC remediation goal remains active.
