# 2026-06-15 ScheduleBoard next actions

## Next
- Continue coverage-leverage routing instead of repeatedly polishing already cleared paths.
- For ScheduleBoard, only add more tests when the uncovered branch is tied to a user-critical workflow such as release adoption, cross-module evidence, or live writeback failure recovery.
- Do not run two Vitest coverage commands at the same time; they share `coverage/.tmp`.

## Candidate Next Slice
- Re-run the coverage inventory and pick the next lowest-covered user-critical component.
- Keep current runtime/browser evidence on API host `http://localhost:5002`.

## Not In This Slice
- No gray observation shortcut was claimed.
- No release-gate completion was claimed.
