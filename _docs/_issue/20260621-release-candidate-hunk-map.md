# Issue - Release Candidate Hunk Map

## Problem
- The current release-candidate boundary guard identifies mixed tokens but does not classify diff hunks.
- Without hunk-level routing, splitting the labor retry candidate risks accidentally staging unrelated themes.

## Resolution
- Added a read-only hunk map script that classifies each diff hunk using manifest tokens.

## Evidence
- Working hunk map reports 58 hunks and identifies 5 mixed hunks requiring manual split.
- Staged hunk map reports 0 hunks, matching the current empty staged candidate.

## Remaining Work
- Convert hunk-map evidence into an actual labor-only staged patch.
