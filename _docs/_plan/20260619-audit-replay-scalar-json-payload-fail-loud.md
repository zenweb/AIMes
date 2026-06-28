# 2026-06-19 Plan: Audit Replay Scalar JSON Payload Fail-Loud

## Goal
Prevent malformed audit detail payloads from disappearing silently when `newValues` is valid JSON but not an object.

## Scope
- Existing audit replay feature only.
- No new feature scope.
- Preserve valid replay cards and surface invalid audit details through the existing alert region.

## Steps
1. Inspect existing audit replay parsing and tests for backend business-write and schedule adoption feedback.
2. Add a RED test for schedule adoption feedback scalar JSON payload.
3. Add minimal parser fail-loud behavior.
4. Add equivalent business-write regression coverage and verify RED by temporarily restoring old behavior.
5. Run target, component, full coverage, lint, build, and real browser preview checks.

## Stop Condition
- Both scalar JSON payload paths emit visible fail-loud alerts.
- Valid replay/base cards remain visible.
- Regression commands pass.
- Browser evidence confirms the audit console renders in production preview.

## Notes
- Browser plugin `node_repl js` entry was unavailable in this session, so real browser evidence used the available Puppeteer Chromium MCP surface.
- Production preview was used because Nuxt dev remains a documented blocker.
