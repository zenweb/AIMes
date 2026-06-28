# 2026-06-15 Agent Config Approval Merge Policy Coverage Plan

## Objective

Improve evidence for Agent configuration approval synchronization and quality experiment gate policy without expanding product scope.

## Selection Rationale

Agent configuration approval sync is part of the existing governance/audit baseline. It is user-critical because it determines whether policy changes are pending, approved, rejected, or effective.

## Execution

1. Read `src/utils/agent-config-approval-sync.ts` and existing tests.
2. Add timestamp merge precedence coverage for local-vs-backend approval evidence.
3. Add quality experiment expansion gate coverage.
4. Add unknown approval ID write-prevention coverage.
5. Run focused tests, focused coverage, and admin/governance regressions.
6. Record evidence in five documentation streams.

## Result

No implementation change was needed. The added tests proved the existing merge and policy behavior.

