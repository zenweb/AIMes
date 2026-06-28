# 2026-06-14 Issue - Schedule Equipment Scenario Decision Depth

## Issue
- `ScheduleBoard.vue` had unit evidence that a backend equipment risk could generate a suggestion, but the test only checked the title and action text.
- That was too thin for the C6-style requirement that Agent recommendations preserve scenario fit, tradeoffs, rejected alternatives, and audit rationale.

## Resolution
- Extended the equipment-risk suggestion test to expose the scenario decision package.
- Asserted recommended scenario, decision rationale, three alternatives, rejected scenario names, local feedback snapshot, and backend adoption feedback payload.

## Status
- Resolved for this slice.
- No production code change required.
