# Issue - Labor Retry ScheduleBoard Staged

The staged candidate passes static boundary checks, but runtime evidence is not yet staged-only.

Why this matters:

- The working tree contains unrelated real dhtmlx, assistant engineering, multi-objective feedback, and guidance-link changes.
- Running E2E directly from the working tree can accidentally prove behavior that is not present in the staged candidate.

Required closure:

- Verify the staged index in isolation before treating the candidate as push-ready.

