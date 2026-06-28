# Review: Employee Offline Demo Evidence Script

## Scope
- Repeatable evidence runner for the Employee offline-demo backend-skip path.
- Architecture guard to keep that runner present and bounded.

## Findings
- The prior fix had focused unit tests and real-browser e2e coverage, but the rerun path was still implicit.
- The new script captures:
  - `offline-demo-mode.test.ts`
  - `employee-board.test.ts`
  - the Employee Playwright case filtered by the ASCII token `backend skip`
  - markdown output with `Result: PASS` or `Result: FAIL`
- The architecture rule checks for the script and the bounded command tokens, so this evidence entrypoint cannot silently disappear.

## Verification
- Focused architecture guard: PASS.
- Evidence script: PASS.
- Report: `_docs/_reports/frontend-real-browser-employee-offline-demo-20260621-current.md`.

## Residual Risk
- The script is intentionally narrow and does not replace the full frontend e2e baseline.
- Running the old `4173` preview can still show stale UI if that process serves an older build.
