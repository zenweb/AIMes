# Review - Release Candidate Hunk Map

## Scope
- Added a read-only diagnostic script and reports.
- No application behavior changed.

## Findings
- The labor retry candidate cannot be safely split by file-level staging.
- Hunk-level classification shows 5 mixed hunks that must be manually split before staging.
- There are only 7 pure keep hunks; staging all changes in the three candidate files would include unrelated themes.

## Validation
- Script parses successfully.
- Working hunk report was generated from current `git diff`.
- Staged hunk report correctly reports 0 hunks.

## Residual Risk
- Hunk classification is token-based. It helps route review but does not replace semantic staged diff review.
