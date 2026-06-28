# 2026-06-21 Issue - Release Candidate Slice Boundary

## Problem

The proposed `schedule-labor-evidence-retry` release-candidate file set was small by file count but large by diff size, mixing multiple independent scheduling themes.

## Impact

If pushed as one candidate, reviewer bandwidth would be spent on dhtmlx drag writeback, multi-objective feedback, Assistant/engineering fail-loud, guidance links, and labor evidence retry at the same time.

## Resolution

- Added a manifest-driven boundary guard script.
- The guard fails when excluded-theme grep tokens appear in the current candidate diff.
- Current report correctly fails and lists the excluded theme hits.
- PowerShell parser syntax check now passes for the guard script.
- Current report also lists token locations, reducing the review cost of splitting the large scheduling diff.

## Status

- Open for the candidate split.
- Closed for the guard implementation.
- Diff-mode support is available; current working diff fails due to excluded themes, and current staged diff fails because no first-slice tokens are staged.
