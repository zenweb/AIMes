# 2026-06-19 Issue: Monitoring Situation Escalation Lacked Operation Guidance Links

## Problem
- The monitoring page lets operators sync shopfloor situation evidence and escalate it into a cross-module response package.
- This is a complex operation, but the action area did not explain what to verify before syncing/escalating and did not link to related scheduling/risk/help context.

## Impact
- Operators could escalate monitoring events without explicitly checking source event, impacted work orders, owner, or audit trace.
- This weakened the Core Product Principles for multilingual support, contextual linking, and complex-operation guidance.

## Resolution
- Added bilingual shopfloor situation guidance.
- Added contextual links to scheduling, risk queue, and in-place help.
- Associated the action group with the guidance through `aria-describedby`.

## Evidence
- `monitoring-shopfloor-situation-guidance-real-browser-20260619`
- `npm run test:unit:coverage` passed 111 files / 1100 tests.

