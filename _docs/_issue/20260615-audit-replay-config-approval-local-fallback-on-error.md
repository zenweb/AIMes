# 2026-06-15 Audit Replay Config Approval Local Fallback On Error Issue

## Issue

Configuration approval backend loading can fail while local approval evidence exists. Without a direct regression test, the audit replay panel could regress into hiding local governance evidence.

## Risk

- Operators could miss pending configuration approvals during a backend outage.
- Local approval evidence could be lost from replay even though it is available.
- The UI could show either evidence without a warning or a warning without the evidence.

## Resolution

- Added a focused test that verifies local configuration approval evidence remains visible after backend failure.
- Added assertions that the alert region reports the backend approval failure.
