# Production POC pilot trace next actions

- Continue ProductionBoard hardening on remaining operator-visible branches:
  - route `scanCode` changes after initial load;
  - barcode context rejection paths for missing, completed, or non-startable operations;
  - POC pilot trace de-duplication if repeated refreshes are introduced later.
- Do not spend more slices on POC pilot trace unless production code changes or live backend evidence needs browser proof.
