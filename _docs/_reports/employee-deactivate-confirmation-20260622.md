# Employee deactivate confirmation evidence

- GeneratedAt: 2026-06-22T13:49:30+08:00
- Scope: Employee deactivate flow now requires explicit confirmation before calling the backend.
- Boundary: focused employee frontend slice; not a full release gate.

## Change

- The employee edit dialog no longer calls `deactivateEmployee(...)` on the first "离职" click.
- The first click opens a bilingual confirmation block.
- The confirmation block links to related operational context:
  - Production start
  - AI scheduling
  - Audit replay
  - Help anchor
- Only "确认离职" calls the deactivate API; "取消离职" dismisses the confirmation without a backend call.

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

## Real Browser Check

- URL: `http://127.0.0.1:4176/scheduling/employee?offlineDemo=1`
- Action: opened the first employee card and clicked `离职`; did not click final `确认离职`.
- Confirmation visible: `[data-employee-deactivate-confirmation]`
- Visible controls:
  - `取消离职`
  - `确认离职`
- Runtime link resolution:
  - `./production` -> `http://127.0.0.1:4176/scheduling/production`
  - `./scheduling` -> `http://127.0.0.1:4176/scheduling/scheduling`
  - `./audit-logs` -> `http://127.0.0.1:4176/scheduling/audit-logs`
  - `#employee-deactivate-help` -> current employee page help anchor

## Result

PASS. The high-risk employee deactivate operation now has a visible confirmation and guidance step before mutation.
