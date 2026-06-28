# 2026-06-19 Issue - Risk SLA Review Needed Operator Guidance Links

## Problem
- The Risk SLA daily review workflow can generate and close cross-functional review packages, but lacked explicit bilingual guidance and related evidence links at the decision point.

## Impact
- Operators could generate or close a review without a visible reminder to verify overdue risks, accountable actions, scheduling protection, and audit trail.
- Related Scheduling, Reports, and Audit trail contexts were not linked from the workflow.

## Resolution
- Added `#risk-sla-review-help` guidance with Simplified Chinese and English text.
- Added links to Scheduling, Reports, Audit trail, and Help.
- Added `aria-describedby="risk-sla-review-help"` to the SLA review panel.

## Status
- Resolved for the Risk SLA review workflow.
- Verified by RED/GREEN unit test, focused suite, full frontend coverage, lint, build, and real browser screenshot.
