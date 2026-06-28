# 2026-06-15 Issue: Assistant audit invalid backend payload dropped local replay evidence

## Problem

When assistant action audit loading returned an invalid backend payload, the audit replay panel showed a fail-loud alert but did not preserve local assistant action replay records.

## Impact

- Reviewers saw the backend sync failure but could lose the locally captured assistant action evidence in the replay panel.
- The audit chain became weaker during backend degradation, exactly when local evidence is most useful.

## Fix

- Added a regression test with invalid backend assistant-audit payload plus a valid local customer commitment assistant action record.
- Updated the assistant-audit loading branch to read local records after invalid payload validation records a sync error.
- Added execution feedback text into customer commitment replay steps.

## Verification

- RED target test: 1 failed / 30 passed, selected detail remained the base AI suggestion.
- GREEN target test: 31/31 passed.
- Full frontend coverage: 964/964 passed.

## Status

Closed for frontend assistant audit replay fallback behavior.
