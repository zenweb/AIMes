# Issue: Gray Observation Gate Needed A Start Runbook

## Problem

The gray observation gate correctly fails while `NOT_STARTED`, but the next operational step was spread across reports and todo files. That can delay first gray once staging and signoff are ready.

## Fix

Added a prepared-only readiness packet with:

- preconditions before first gray,
- required start evidence,
- `OBSERVING` command template,
- `PASS` command template.

## Boundary

The gate remains `FAIL`. This issue only prepares the workflow; it does not start gray, complete the 14-day window, or assert P0/P1=0.
