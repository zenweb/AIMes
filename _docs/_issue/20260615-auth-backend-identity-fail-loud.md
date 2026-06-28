# 2026-06-15 Issue - Auth Backend Identity Fail Loud

## Issue

Backend login responses with blank identity fields were previously accepted after normalization to empty strings.

## Impact

That allowed invalid auth evidence to enter `aimes_user`, which weakens reload behavior and makes login state less trustworthy.

## Resolution

- Reject invalid normalized auth responses before state persistence.
- Lock the behavior with a focused unit test.

## Status

- Closed for this slice.

