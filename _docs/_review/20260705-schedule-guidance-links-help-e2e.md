# 2026-07-05 Schedule guidance links and help E2E review

## Decision

`PASS`

Added real-browser evidence that Scheduling complex operations expose bilingual guidance, contextual evidence links, and a clickable help entry.

## Scope

- Existing feature: Scheduling workbench guidance/help surface.
- Product principles covered:
  - English and Simplified Chinese text are both visible.
  - Related evidence points are linked from the operation surface.
  - Complex optimization/adoption/writeback operations have a visible help affordance.
- No production code changed in this slice.

## Evidence

- Test added: `排产复杂操作提供双语指引、关联证据链接和帮助入口`.
- Browser assertions cover:
  - Chinese guidance: `优化或采纳前，请确认目标、锁定期、证据链和回写路径。`
  - English guidance: `Before optimizing or adopting a plan, confirm objective, lock window, evidence trail, and writeback path.`
  - Contextual links:
    - `审计回放 / Audit trail` -> `./audit-logs`
    - `交付报表 / Delivery report` -> `./report`
    - `帮助 / Help` -> `#schedule-workbench-help`
  - Clicking Help changes the URL hash to `#schedule-workbench-help` and reveals the help region.
  - Help region has `aria-label="排产帮助"` and bilingual guidance for optimization, adoption, and drag writeback.

## Validation

- `npm run test:e2e -- --grep "排产复杂操作提供双语指引、关联证据链接和帮助入口"`: `1 passed`.
- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: no whitespace errors; Git reported the existing LF-to-CRLF working-copy warning.

## Review note

The first browser run failed because the runtime `href` attributes are relative (`./audit-logs`, `./report`) rather than absolute (`/scheduling/...`). The final test now asserts the real browser behavior instead of the unit-test rendering assumption.

## Boundary

This closes the browser evidence gap for the Scheduling guidance/help surface. It does not change or certify unrelated Scheduling writeback, DeviceData field verification, or strict gray-observation release gates.
