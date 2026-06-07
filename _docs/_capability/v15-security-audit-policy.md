# V1.5 Capability: Agent Security And Audit Policy

## Scope

- Policy doc: `_docs/_design/20260524-v15-agent-permission-policy.md`.
- Agent recommend/adopt/reject APIs use authenticated endpoints.
- Non-Admin adopt/reject attempts are rejected and persisted as `AgentPolicyRejected` audit/action rows.
- All Agent write paths carry actor, role, business key, trace id, prompt hash and context hash where available.

## Verification

- Integration tests cover:
  - non-Admin adopt rejection and audit/action persistence;
  - Admin adopt success with `ScheduleAdoptionFeedback`;
  - Admin reject success with audit/action persistence;
  - non-Admin reject rejection;
  - decision query from a new client.

## Remaining Product Work

- Replace Admin-only execution with the full Admin/Planner/Quality/Purchase/Maintenance role matrix.
- Add execute-class APIs when write-back automation expands beyond scheduling adoption/rejection.
