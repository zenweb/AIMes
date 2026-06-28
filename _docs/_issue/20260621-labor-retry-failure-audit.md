# Issue - Labor Retry Failure Audit

## Problem
- Retry success was covered, but retry failure could have regressed by clearing the startup labor evidence warning and hiding the retry action.

## Resolution
- Added a unit regression test asserting that a failed retry re-displays `人员约束启动证据加载失败`, includes the retry failure reason, and keeps `重试人员证据` available.

## Verification
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: passed.

## Residual Risk
- The test currently sits in an unstaged file with unrelated local changes; it must be hunk-split before inclusion in the release-candidate patch.
