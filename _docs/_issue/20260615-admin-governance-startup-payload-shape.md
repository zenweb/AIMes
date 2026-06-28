# 2026-06-15 Issue: Admin governance startup accepted non-array evidence payload

## Problem

AdminBoard startup evidence loaders caught rejected promises, but successful non-array payloads could be assigned to list state without a fail-loud alert.

## Impact

- Agent governance evidence could silently enter an invalid state.
- Opening the Agent governance tab after a bad payload risked runtime failures or misleading empty governance evidence.

## Fix

- Added a regression test with `readAgentConfigApprovalsBackendFirst` returning `{ items: [] }`.
- Added `ensureAdminEvidenceArray` and applied it to array-backed startup governance evidence loaders.

## Verification

- RED target test: 1 failed / 21 passed, no `[role="alert"]` was shown.
- GREEN target test: 22/22 passed.
- Full frontend coverage: 966/966 passed; refreshed on 2026-06-19 with 111 files / 1083 tests passed.

## Status

Closed for AdminBoard startup array-backed governance evidence payload shape.
