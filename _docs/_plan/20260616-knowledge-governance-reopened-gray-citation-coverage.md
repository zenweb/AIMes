# 2026-06-16 Knowledge Governance Reopened Gray Citation Coverage Plan

## Goal

Protect the existing knowledge-governance lifecycle so reopened gray decisions and assistant citation evidence cannot silently regress.

## Success Criteria

- Assistant citation traces render governed source, blocked evidence, and review status.
- Rolled-back retraining versions show the corrected reapproval state rather than another rollback action.
- Reopened R3 gray decisions route through revalidation when republish evidence is absent.
- Reopened R3 validation-passed decisions route to republish when republish evidence exists.
- Full frontend unit coverage remains green.

## Result

- All success criteria are covered by unit tests.
- No production code change was needed because the behavior already existed.
- Full frontend regression passed.

## Resume Plan

1. Re-read `.omx/state/task-hold-on.json`.
2. Keep task `active` unless the owner asks for another hold.
3. Select the next slice by coverage leverage plus user-critical path value.
4. Avoid saturated component line chasing unless it protects a concrete critical behavior.
5. Run targeted and full frontend coverage before reporting new progress.
