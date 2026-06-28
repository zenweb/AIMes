# Issue: Chat navigation failure could still look successful

Date: 2026-06-19

## Problem

For plain assistant navigation actions, `ChatPanel` already alerted when `router.push` failed, but execution then continued into the generic success branch.

## Impact

Operators could see a route failure alert and a later `动作已执行` status for the same failed action. The success audit could also misrepresent a failed navigation as a permitted successful action.

## Fix

The failed navigation path now records a failed audit and returns immediately. If failed-audit recording fails, the assistant emits an additional assertive alert.

## Evidence

- Target RED/GREEN test: `announces when a plain navigation action fails instead of crashing`.
- Audit failure test: `fails loud when a plain navigation failure audit cannot be written`.
- ChatPanel suite: 70 passed.
- Full frontend coverage: 111 files / 1085 tests passed.
- Lint and build passed.
