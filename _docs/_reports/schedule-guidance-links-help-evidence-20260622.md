# Schedule guidance links and help evidence - 2026-06-22

## Scope

This package implements the three core UI principles on the scheduling workbench:

- bilingual support for English and Simplified Chinese;
- contextual links between related evidence and destination pages;
- visible help guidance for complex scheduling actions.

## Implemented behavior

- Added a scheduling operation guidance band before optimization/adoption controls.
- Added Simplified Chinese and English guidance text:
  - `优化或采纳前，请确认目标、锁定期、证据链和回写路径。`
  - `Before optimizing or adopting a plan, confirm objective, lock window, evidence trail, and writeback path.`
- Added contextual links:
  - `/audit-logs` for audit replay evidence;
  - `/report` for delivery reporting evidence;
  - `#schedule-workbench-help` for local help.
- Added a help section for optimization, adoption, and drag writeback.

## Verification

```text
npm run test:unit -- tests/unit/schedule-board.test.ts

Test Files  1 passed (1)
Tests       76 passed (76)
```

```text
git diff --cached --check
PASS
```

## Boundary

- This package only stages the scheduling guidance/help UI and its focused unit test.
- It does not stage unrelated backend-first refresh, adoption snapshot restore, personnel E2E, or broad ScheduleBoard hardening.
