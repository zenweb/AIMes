# 2026-06-19 Plan: Routing capability release readback

## Success Criteria
- Capability validation and split/batch release writes perform backend readback.
- Backend readback success updates the visible evidence from the authoritative record.
- Backend readback failure is shown as an assertive alert.
- Local release evidence remains visible so operators can recover without losing context.

## Execution
- Add a RED test for release readback failure after successful local release write.
- Verify the test fails because no readback alert is rendered.
- Add the smallest shared readback helper and call it after validation/release writes.
- Re-run targeted and component tests.
- Run full frontend coverage, lint, and build.

## Result
- Criteria met.
- Full frontend coverage passed: 111 files / 1105 tests.
- Strict release completion remains gated by gray observation.
