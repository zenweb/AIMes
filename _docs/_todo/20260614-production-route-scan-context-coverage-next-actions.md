# Production route scan context next actions

- Continue with ProductionBoard uncovered branches only when they improve operator-facing correctness or evidence integrity.
- Good next candidates:
  - POC pilot run trace success rendering;
  - route `scanCode` changes after initial load;
  - barcode context rejection paths for completed or missing operations.
- Run real browser evidence only when route/UI behavior itself changes, not for pure test coverage.
