# 2026-06-14 Review - Schedule Feedback Audit Replay Evidence

## Scope
- Reviewed whether required schedule adoption feedback reasons are visible in audit replay, not only persisted in backend audit logs.

## Findings
- The backend already writes `ReasonDetail`, category, objective, decision, operator, and trace metadata into `ScheduleAdoptionFeedbackUpsert`.
- The replay panel only queried Agent business-write audit actions, so schedule feedback audit evidence was not visible to users.
- A persisted reason that cannot be replayed is weak audit evidence for the scheduling workflow.

## Resolution
- Added a dedicated schedule adoption feedback audit reader and replay mapper.
- Kept unsupported or incomplete feedback records fail-loud: blank `ReasonDetail` records produce a sync error and do not render as complete replay cards.
- Added unit and Chromium coverage proving the required reason appears in the replay card and detail chain.

## Verification
- Focused schedule feedback unit test passed after first confirming RED.
- Full audit replay unit file: 24/24 passed.
- Focused Chromium schedule feedback replay: passed.
- Full Chromium audit spec: 36/36 passed.

## Residual Risk
- This slice verifies replay visibility for schedule feedback audit records; it does not change backend persistence or DTO validation, which were covered by earlier slices.
- Gray observation remains intentionally skipped/deferred by owner direction.
