# 2026-06-20 Plan - Engineering evidence fail-loud readback

## Goal
Improve existing engineering-data evidence correctness without expanding product scope.

## Selection signal
- Fresh frontend coverage showed `src/api/engineeringEvidence.ts` at 84.21% line coverage with missing branch behavior.
- Engineering evidence is upstream of BOM, route capability, and scheduling decisions.

## Steps
1. Refresh frontend coverage baseline.
2. Inspect engineering evidence API and sync layers.
3. Add failing API tests for optional versus fail-loud reads.
4. Add failing sync tests for fail-loud backend-first readback.
5. Implement minimal option propagation.
6. Verify focused tests, adjacent tests, and production build.

## Status
- Completed for this slice.
