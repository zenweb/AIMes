# 2026-06-21 TODO - Release Candidate Slice Boundary Next Actions

## Done

- Added the slice boundary guard script.
- Ran the guard against the schedule labor evidence retry manifest.
- Captured the expected FAIL report showing mixed themes in the current diff.
- Verified the guard script parses successfully with PowerShell parser.
- Refreshed the labor retry manifest so all 5 staged code/script files are listed.
- Added a boundary guard failure when diff code/script files are missing from the manifest.
- Added hunk-map reporting for `Diff Files Missing From Manifest`; current staged labor retry report shows none.

## Next Actions

- Keep the labor retry staged slice split away from excluded themes.
- Rerun `scripts/test-release-candidate-slice-boundary.ps1 -DiffMode staged`; it must include first-slice tokens, exclude excluded-theme tokens, and report no missing manifest files.
- Treat staged PASS as a boundary check only, then do human staged diff review.
- Only when the boundary guard passes, perform staged diff review and then push for hosted CI evidence.
- Keep strict v1.0.0 PASS unclaimed while gray observation remains deferred.
