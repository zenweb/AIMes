# 2026-06-15 Shortage Risk Backend-First All-Record Fallback Coverage Plan

## Objective

Complete the shortage-risk backend-first fallback evidence across every record family used by purchase, BOM, schedule, dashboard, and supplier-network paths.

## Execution

1. Reuse the existing shortage-risk sync test file.
2. Add full local fixtures for shortage resolution and shortage kitting events.
3. Extend the incomplete-backend fallback test to cover resolution and kitting event records.
4. Run targeted, full unit, and full coverage verification.

## Result

The targeted path is green and `shortage-risk-sync.ts` coverage rose to statements 80.12% and lines 90.78%.

## Next Best Step

Move to the next low-coverage user-critical path only after confirming it has a real correctness or evidence gap. Avoid refining this slice further unless a concrete uncovered risk is found.
