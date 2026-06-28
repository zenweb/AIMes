# Todo - Frontend unit current-worktree baseline next actions - 2026-06-22

- Preserve this green unit baseline before adding new frontend source hunks.
- If the next split touches frontend runtime behavior, rerun the affected focused unit tests first, then rerun `npm run test:unit`.
- Keep staged-only package verification separate from current-worktree baseline evidence.
- Continue CC execution with backend/full-stack or focused E2E baselines next; do not treat this as release completion.
