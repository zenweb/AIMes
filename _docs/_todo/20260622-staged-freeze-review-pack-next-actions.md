# Todo - Staged freeze review pack next actions - 2026-06-22

- Keep the 87-file staged package frozen.
- Do not broad-stage dirty worktree files.
- If committing the current staged package, review the 13 source/test files and 74 docs together; current focused audit found no blocker-level staged diff issue.
- If splitting before commit, rebuild the index intentionally by package boundary.
- Start the next implementation package only after this staged boundary is resolved.
- Keep the unstaged `employee.spec.ts` personnel capability hunks as a separate split package unless the index is intentionally rebuilt.
