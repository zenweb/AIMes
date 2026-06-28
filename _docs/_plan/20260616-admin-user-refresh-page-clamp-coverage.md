# 2026-06-16 Admin User Refresh Page Clamp Coverage Plan

## Goal

Keep Admin user-management tables visible and trustworthy after backend-authoritative refreshes shrink the result set.

## Success Criteria

- A page-2 user action followed by a one-page backend refresh displays the remaining backend user.
- The stale page-2 row disappears.
- Targeted Admin unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Re-baselined AdminBoard targeted coverage.
2. Read user pagination and refresh logic.
3. Added a failing regression test for refresh-after-shrink.
4. Implemented the smallest current-page clamp in `refreshUsers`.
5. Ran targeted and full frontend coverage.

## Next Slice Candidate

Continue by coverage leverage plus user-critical value. AdminBoard still has uncovered navigation/status-mapping branches, but the next slice should again start from a fresh baseline and a concrete workflow risk.
