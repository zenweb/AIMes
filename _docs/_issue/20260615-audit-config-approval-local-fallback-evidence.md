# 2026-06-15 Issue: Configuration approval invalid backend payload dropped local evidence

## Problem

When configuration approval loading returned an invalid backend payload, the audit replay panel showed a fail-loud alert but did not preserve local configuration approval records.

## Impact

- Reviewers could miss pending configuration approvals during backend degradation.
- The approval lane and replay card evidence no longer reflected local decisions that still matter for audit review.

## Fix

- Added a regression test with invalid backend configuration approval payload plus a valid local quality experiment gate approval.
- Updated the configuration approval loading branch to read local records after invalid payload validation records a sync error.

## Verification

- RED target test: 1 failed / 31 passed, pending approval badge stayed at 0.
- GREEN target test: 32/32 passed.
- Full frontend coverage: 965/965 passed.

## Status

Closed for frontend configuration approval replay fallback behavior.
