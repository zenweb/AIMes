# Plan - Release Candidate Hunk Map

## Success Criteria
- Candidate split work has a repeatable hunk-level diagnostic.
- The script shares the manifest token source with the existing boundary guard.
- Reports clearly distinguish keep, exclude, mixed, and neutral hunks.

## Steps
1. Read the existing boundary guard and manifest.
2. Add a read-only hunk-map script.
3. Verify PowerShell syntax.
4. Generate working and staged hunk reports.
5. Record findings in the five project document tracks.

## Status
- Completed for hunk-map diagnostics.
- Actual labor-only patch staging remains pending.
