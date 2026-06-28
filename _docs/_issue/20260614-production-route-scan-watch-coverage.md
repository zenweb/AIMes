# Production route scan watch coverage issue note

## Issue

The initial route `scanCode` handoff was covered, but the watcher path for scan-code changes after the board had already loaded was not. That left cross-module handoff regressions possible when a user stays on ProductionBoard and receives a new barcode context.

## Resolution

- Made the test route query reactive.
- Added a focused test for post-load `scanCode` changes.

## Evidence

- ProductionBoard now has 29 targeted tests.
- Full frontend unit coverage passed with 799 tests and 84.49% line coverage.
