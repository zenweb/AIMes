# 2026-06-20 Review - Frontend live preview proxy guard

## Scope
- Guarded the live preview backend proxy path that protects ordinary login and employee reads from falling into stale offline-demo behavior.

## Findings
- No open code-review findings for this slice.
- The change is intentionally narrow: config extraction plus unit coverage only.

## Evidence
- Unit regression: 4 files, 48 tests passed.
- Production build completed successfully.

## Residual risk
- This does not prove every runtime deployment uses the rebuilt artifact. Real browser evidence remains required after each preview rebuild or hosted deployment.
