# 2026-06-15 Issue - ChatPanel residual coverage gaps

## Status

- No new runtime issue found in this slice.

## Residual Risk

- ChatPanel remains below boutique-level coverage after this slice: statements 78.36%, branches 72.16%, functions 76.06%, lines 78.99%.
- Remaining uncovered areas include engineering/routing action helpers, anomaly/monitoring action helper variants, and several POC/business-answer branches.
- The assistant intent router is keyword-sensitive. Tests should continue to use realistic user phrases and assert the selected branch explicitly to avoid false evidence.

## Mitigation

- Continue using focused coverage before and after each ChatPanel slice.
- Prefer one business workflow per test: startup badge, monitoring situation, quality rework, POC rollout, etc.

