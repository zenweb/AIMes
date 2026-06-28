# 2026-06-15 Auth Router Real Browser Evidence Plan

## Objective

Close the hold packet's known gap: collect real-browser evidence for the hardened auth/router/local-user path.

## Execution

1. Re-read the hold packet.
2. Inspect the current login e2e spec and auth/router/local-user diff.
3. Run the smallest relevant Chromium Playwright suite.
4. If it fails, make the smallest fix and rerun.
5. If it passes, record evidence without expanding feature scope.

## Outcome

The focused Chromium suite passed with no code changes required.

## Next Best Slice

Continue using coverage and user-criticality as the routing signal. Do not keep polishing auth/router unless a real defect appears; this slice now has both focused unit evidence and focused real-browser evidence.

