# 2026-06-16 Admin LLM Status Fail Loud Plan

## Goal

Make Admin LLM settings fail loud when the LLM status/config endpoint cannot be loaded.

## Success Criteria

- LLM API failure leaves the status panel in a conservative disconnected state.
- The admin sees a visible alert with the failure reason.
- Targeted Admin unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Re-baselined AdminBoard targeted coverage.
2. Read the LLM tab template and `loadLlmStatus` catch path.
3. Added a failing regression test for a rejected LLM status call.
4. Implemented the smallest notification update in `loadLlmStatus`.
5. Ran targeted and full frontend coverage.

## Next Slice Candidate

Continue by coverage leverage plus user-critical value. AdminBoard still has uncovered navigation/status-mapping branches, but the next slice should start with a fresh baseline and a real workflow risk rather than line chasing.
