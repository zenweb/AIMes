# Current staged boundary after Agent doc sync

## Scope

This review records the current index boundary after syncing the Agent E2E regression documentation.

## Staged Candidate Contents

- Existing `schedule-labor-evidence-retry` candidate code and evidence documents remain staged.
- Agent E2E regression documents are now staged in all five required doc lanes:
  - `_docs/_changelog/20260621-scheduling-agent-e2e-offline-entry-regression.md`
  - `_docs/_issue/20260621-scheduling-agent-e2e-offline-entry-regression.md`
  - `_docs/_todo/20260621-scheduling-agent-e2e-offline-entry-regression-next-actions.md`
  - `_docs/_plan/20260621-scheduling-agent-e2e-offline-entry-regression.md`
  - `_docs/_review/20260621-scheduling-agent-e2e-offline-entry-regression.md`

## Checks

- `git diff --cached --check`: PASS.
- No whole-file staging was performed for `src/frontend/tests/e2e/scheduling.spec.ts`.
- `src/frontend/scripts/e2e.mjs` remains unstaged for the Agent runtime change; do not claim a code slice until that hunk is reviewed and staged deliberately.
- Attempted Agent code hunk staging was stopped before changing the index because `scheduling.spec.ts` requires a cleaner split than the current mixed staged/unstaged state allows in one safe command.

## Residual Risk

- `src/frontend/tests/e2e/scheduling.spec.ts` remains `MM` and contains mixed staged/unstaged work.
- Any release-candidate commit from this index still requires hunk-level review before final commit or PR creation.
- Agent E2E regression documents are staged, but Agent code changes remain unstaged. Keep this visible; do not present the staged candidate as containing the Agent code fix.
