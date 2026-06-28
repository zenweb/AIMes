# 2026-06-16 Schedule Customer Commitment Review Coverage Issue

## Status

Closed for this slice.

## Problem

`ScheduleBoard.vue` still lacked direct evidence for the customer delivery commitment review branch. That branch matters because a customer-facing OTD recovery promise must not bypass schedule review of locked-window insertion, shortage closure, CNC bottleneck protection, and quality gates.

## Resolution

Added a regression test that loads a customer commitment package through controlled OTD KPI commitment mocks and generates the event-queue suggestion.

## Evidence

- Targeted schedule suite: `64 passed`.
- Schedule targeted coverage: lines `89.71%`.
- Related schedule/OTD regression: `85 passed`.
- Full frontend coverage: `111 files / 1032 tests passed`.
