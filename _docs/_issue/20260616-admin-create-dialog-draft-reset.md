# 2026-06-16 Admin Create Dialog Draft Reset Issue

## Issue

Cancelled AdminBoard create-user drafts persisted in memory and appeared again when the dialog was reopened.

## Impact

An administrator could reopen the create-user dialog and see stale username, display name, password, and role values from an abandoned account creation attempt. This weakens the existing user-management workflow and can lead to accidental account creation with outdated draft data.

## Root Cause

The cancel and overlay-close paths only set `showUserCreate = false`; they did not reset `createForm`.

## Fix

Added explicit create-dialog open/close helpers that reset `createForm` to the default `Operator` form, then routed add, cancel, overlay close, and successful create through those helpers.

## Evidence

- Red test failed before fix with reopened username `qa-admin`.
- Single test passed after fix.
- Targeted AdminBoard coverage passed: `28 tests`.
- Full frontend coverage passed: `111 files / 1061 tests`.
