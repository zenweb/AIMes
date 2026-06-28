# Employee modal guidance links evidence

- GeneratedAt: 2026-06-22T13:39:00+08:00
- Scope: Employee create/edit dialogs now include bilingual operation guidance and contextual links for complex personnel master-data changes.
- Boundary: focused frontend unit evidence only; not a full release gate.

## Change

- Added edit-dialog guidance for team, shift, certification impact, and audit trail review before saving employee changes.
- Added create-dialog guidance for employee number uniqueness, role scope, team shift, and audit trail review before creating employees.
- Added contextual links from both dialogs to:
  - Production start: `/scheduling/production`
  - AI scheduling: `/scheduling/scheduling`
  - Audit replay: `/scheduling/audit-logs`
  - Help anchor: `#employee-operation-help`
- Links are produced through `appAssetPath(...)` in the component script, preserving the configured app base path.

## Verification

```text
npm run test:unit -- tests/unit/employee-board.test.ts

Test Files  1 passed (1)
Tests       22 passed (22)
Exit code   0
```

```text
npm run build

Result: Build complete
Exit code: 0
```

## Real Browser Check

- URL: `http://127.0.0.1:4175/scheduling/employee?offlineDemo=1`
- Edit dialog: `[data-employee-edit-guidance]` visible with Chinese and English guidance.
- Create dialog: `[data-employee-create-guidance]` visible with Chinese and English guidance.
- Runtime link resolution:
  - `./production` -> `http://127.0.0.1:4175/scheduling/production`
  - `./scheduling` -> `http://127.0.0.1:4175/scheduling/scheduling`
  - `./audit-logs` -> `http://127.0.0.1:4175/scheduling/audit-logs`
  - `#employee-operation-help` -> current employee page help anchor

## Result

PASS. The employee create/edit dialogs satisfy the core product principles for multilingual guidance, contextual links, and help affordance on complex operations.
