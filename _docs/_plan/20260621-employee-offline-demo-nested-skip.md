# Plan: Employee Offline Demo Nested Skip

## Goal
Stop EmployeeBoard from surfacing raw offline-demo backend skip messages while preserving real backend failure alerts.

## Steps
1. Reproduce and inspect the Employee page, offline-demo gate, and current preview behavior.
2. Add a failing regression for nested offline-demo errors.
3. Implement the smallest classifier change.
4. Run focused frontend unit tests.
5. Build an isolated preview bundle and verify with a real browser.

## Status
- Completed on 2026-06-21.

