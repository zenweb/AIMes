# 2026-06-15 Issue: Restricted chat action denial could duplicate audit evidence

## Problem

After a restricted assistant action was denied and the denial audit was written, the action button stayed enabled.

## Impact

- Users could repeatedly click the same denied action.
- Duplicate denial audit records could pollute the assistant action evidence chain.

## Fix

- Added a regression test that clicks a restricted delivery recovery package action twice.
- Locked the action after successful denial audit recording.

## Verification

- RED target test: 1 failed / 64 passed, denied action button was not disabled.
- GREEN target test: 65/65 passed.
- Full frontend coverage: 967/967 passed.

## Status

Closed for frontend restricted action denial locking.
