# 2026-06-15 backend baseline and 5003 staging gate plan

## Success Criteria

- Backend baseline status is known and supported by current command output.
- Staging rehearsal is attempted on the active non-5000 API URL.
- Release gate audit reflects current evidence without hiding deferred gray observation or staging failure.
- No code is changed merely to mask an environment failure.

## Execution

1. Run Unit and Architecture tests.
2. Classify the concurrent Architecture file-lock failure and verify with serial rerun.
3. Run Integration and Evaluation tests.
4. Run staging rehearsal against `http://localhost:5003`.
5. Run release gate audit with gray observation deferred by owner.
6. Record results and next actions.

## Current Stop Condition

Stop Docker retries after repeated engine command timeouts. Meaningful progress now requires restoring Docker engine responsiveness before staging can pass.
