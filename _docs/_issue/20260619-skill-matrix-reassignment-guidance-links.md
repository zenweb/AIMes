# 2026-06-19 Issue - Labor Reassignment Needed Complex Operation Guidance

## Problem
- The skill matrix workflow could generate replacement recommendations or stop-work review evidence without a visible bilingual prompt at the decision point.
- Related destinations existed elsewhere in the application, but the panel did not present contextual links for production start, scheduling, audit replay, or help.

## Impact
- Operators reviewing labor qualification risks could miss the downstream production-start and scheduling impact of reassignment or stop-work decisions.
- The no-replacement stop-work alert was not programmatically associated with an operation guidance block.

## Resolution
- Added `#labor-reassignment-help` guidance with Simplified Chinese and English text.
- Added links to Production, Scheduling, Audit trail, and Help.
- Added `aria-describedby="labor-reassignment-help"` to the stop-work review alert.

## Status
- Resolved for this workflow.
- Verified by RED/GREEN unit test, focused suite, full coverage, lint, build, and real browser screenshot.
