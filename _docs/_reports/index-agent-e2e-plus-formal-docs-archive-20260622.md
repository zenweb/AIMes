# Index Archive - Agent E2E Plus Formal Docs - 2026-06-22

## Scope

Archived the current staged package so the index can be safely rebuilt later for formal-writeback hunk staging.

## Archive Artifact

- Patch: `tmp/index-agent-e2e-plus-formal-docs-20260622.patch`
- Size: `45934` bytes
- SHA256: `302E0D7C500B27A19715EEE685DC6A1A3CFACD13D73C356631FF561A1CD22C65`
- Git status: intentionally untracked.

The patch file is not staged because storing a patch as a tracked file makes `git diff --cached --check` report trailing whitespace from the archived diff payload itself. Keep the hash and path here as local recovery evidence unless a dedicated artifact store is introduced.

## Current Staged Package Contents

The archived index contains 23 files:

- Agent E2E current-worktree verification docs.
- Formal-writeback hunk-map and focused-patch-draft docs.
- Package-boundary docs.
- `src/frontend/scripts/e2e.mjs`
- `src/frontend/tests/e2e/scheduling.spec.ts`

## Validation

- `git diff --cached --check`: PASS.
- Formal-writeback business code remains unstaged.
- Attempted staging of the archive patch was reverted because it caused `git diff --cached --check` whitespace failures inside the patch payload.

## Restore Check

To validate the archive later:

```powershell
Get-FileHash tmp/index-agent-e2e-plus-formal-docs-20260622.patch -Algorithm SHA256
git apply --check tmp/index-agent-e2e-plus-formal-docs-20260622.patch
```

`git apply --check` should be run only after considering current worktree/index state; this archive was exported from the current staged diff and may conflict after later edits.

## Non-Claims

- This archive does not complete the global CC plan.
- This archive does not stage formal-writeback business code.
- This archive does not prove a clean formal-writeback implementation package.
