# Employee preview stale output recurrence plan

## Success Criteria

- Employee offline-demo page does not show `员工列表加载失败`.
- Employee offline-demo page does not show `Offline demo mode skipped backend request`.
- The accessible local entry on `4173` serves the current rebuilt frontend output.

## Execution

1. Confirm source classification and EmployeeBoard fallback behavior.
2. Run focused unit and E2E checks.
3. Restart stale preview output instead of changing business code.
4. Verify the actual browser entry.

## Result

All criteria are met for the current local preview entry.
