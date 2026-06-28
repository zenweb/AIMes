# 2026-06-16 Admin User Search Case Insensitive Coverage Plan

## Goal

Make existing Admin user search reliable for mixed-case usernames and display names.

## Success Criteria

- Searching `qa` finds a user displayed as `QA Lead`.
- Non-matching users remain filtered out.
- Targeted Admin unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Re-baselined AdminBoard targeted coverage.
2. Read uncovered AdminBoard logic and existing gray governance tests.
3. Avoided duplicating already-covered gray expansion success behavior.
4. Added a failing regression test for mixed-case user search.
5. Implemented the smallest field-normalization fix.
6. Ran targeted and full frontend coverage.

## Next Slice Candidate

Continue by coverage leverage plus user-critical value. `AdminBoard.vue` still has low branch coverage, but the next slice should again start from a fresh baseline and a real admin workflow gap.
