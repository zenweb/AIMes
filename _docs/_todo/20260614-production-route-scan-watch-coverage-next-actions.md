# Production route scan watch next actions

- Continue ProductionBoard hardening only where it adds operator-facing confidence.
- Remaining useful targets:
  - barcode context rejection when the target operation is not startable/completable;
  - invalid route `scanCode` values that should not alter the current work order;
  - POC pilot trace de-duplication if refresh/reload behavior is introduced.
- Avoid repeating route scan-code coverage unless production behavior changes.
