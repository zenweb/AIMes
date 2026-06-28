# Issue: Successful chat navigation actions could be repeated

Date: 2026-06-19

## Problem

Plain assistant navigation actions were not locked after successful routing.

## Impact

Repeated clicks could trigger duplicate route changes, duplicate `动作已执行` status messages, and duplicate successful audit evidence for the same operator action.

## Fix

After a successful `router.push`, `ChatPanel` now adds the action id to `completedActionIds`, reusing the existing disabled-button and early-return guard.

## Evidence

- Target RED/GREEN test: `locks a successful plain navigation action so repeated clicks do not duplicate audit evidence`.
- ChatPanel suite: 71 passed.
- Full frontend coverage: 111 files / 1086 tests passed.
- Lint and build passed.
