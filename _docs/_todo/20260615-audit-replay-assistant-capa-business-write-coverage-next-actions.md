# 2026-06-15 Next Actions - Audit replay coverage

## Next

- Keep AuditDecisionReplayPanel in the candidate pool because branch coverage is still below 50%, but only continue if the next branch is audit-significant.
- Candidate follow-up paths: POC evidence governance replay, knowledge governance replay, barcode rework release variants, or startup error branches for specific evidence providers.
- If coverage leverage is higher elsewhere, move to the next low-coverage user-critical component instead of polishing AuditReplay micro-branches.

## Stop Condition

- Do not chase formatting-only branches in AuditDecisionReplayPanel.
- Stop once remaining gaps are mostly mapper variants with equivalent evidence semantics.

