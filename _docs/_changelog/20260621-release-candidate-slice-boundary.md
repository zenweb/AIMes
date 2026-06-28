# 2026-06-21 Release Candidate Slice Boundary

## Changed

- Added `scripts/test-release-candidate-slice-boundary.ps1` to validate a release-candidate slice manifest against the current code diff.
- Added explicit UTF-8 manifest loading so Chinese grep tokens remain valid under Windows PowerShell.
- Generated boundary report: `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry.md`.

## Evidence

- Command: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-release-candidate-slice-boundary.ps1 -ReportPath _docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry.md`.
- Result: expected `FAIL`.
- Reason: current candidate diff contains excluded-theme tokens for real dhtmlx/rush drag writeback, multi-objective feedback readback, Assistant/engineering fail-loud, and schedule guidance links.

## 2026-06-21 Diff Mode Update

- Added `-DiffMode working|staged` to `scripts/test-release-candidate-slice-boundary.ps1`.
- Working diff report: `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-working.md` is `Result: FAIL`, proving the current uncommitted candidate still mixes excluded themes.
- Staged diff report: `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged.md` is `Result: PASS` only because no matching candidate code is currently staged; it is not hosted CI or release proof.

## 2026-06-21 Staged Empty Diff Guard

- Tightened `-DiffMode staged`: staged mode now fails if the staged diff does not contain any first-slice tokens.
- Updated staged report: `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged.md` is now `Result: FAIL` with reason `staged diff does not contain first-slice tokens`.
- This prevents an empty staged diff from being misread as push readiness.

## 2026-06-21 Script Syntax Recheck

- Verified `scripts/test-release-candidate-slice-boundary.ps1` with PowerShell parser: `syntax-ok`.
- Rechecked report behavior:
  - `working` report remains `Result: FAIL` due to excluded-theme tokens.
  - `staged` report remains `Result: FAIL` because no first-slice tokens are staged.

## 2026-06-21 Token Location Output

- Added token location reporting to the boundary script.
- Working report now lists first-slice and excluded-theme matches as `file:line: token`, so the labor-only patch can be split from mixed scheduling work without manually scanning the whole large diff.

## Boundary

- This is a release-readiness improvement, not a product behavior change.
- Do not stage/push the current schedule labor candidate until the excluded theme hits are removed or explicitly accepted by owner review.
