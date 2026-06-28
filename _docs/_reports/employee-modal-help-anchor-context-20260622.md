# Employee modal help anchor context evidence

- GeneratedAt: 2026-06-22T13:56:00+08:00
- Scope: Employee create/edit modal Help links now target anchors inside the active dialog context.
- Boundary: focused frontend unit/build evidence; no release-gate claim.

## Change

- Edit guidance Help link now targets `#employee-edit-help`.
- Create guidance Help link now targets `#employee-create-help`.
- Unit coverage verifies that each Help link target exists inside its own dialog.

## Verification

```text
npm run test:unit -- tests/unit/employee-board.test.ts

Test Files  1 passed (1)
Tests       23 passed (23)
Exit code   0
```

```text
npm run build

Result: Build complete
Exit code: 0
```

## Result

PASS. Employee create/edit modal Help links are now contextual to the visible dialog instead of pointing at a sibling or missing modal anchor.

