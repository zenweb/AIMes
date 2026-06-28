# 2026-06-15 Review - Audit Replay Config Approval Local Fallback On Error

## Decision

The audit replay path now has explicit regression coverage for configuration approval local fallback after backend load failure.

## What changed

- Added a test that forces the backend configuration approval loader to reject.
- Provided local approval evidence and verified it remains visible.
- Asserted the pending badge, approval row, replay details, and alert all stay correct.

## Why it matters

- Configuration approvals are governance evidence; backend outage must not hide locally captured approval work.
- The operator needs both the local evidence and a loud alert that backend sync failed.

## Verification

- Targeted unit test passed.
- Targeted coverage passed.
- Related replay regression passed.
- Full frontend unit coverage passed at `111 files / 1012 tests passed`.
- Regression refresh on 2026-06-19 passed: replay panel `56 tests`, full frontend `111 files / 1083 tests`, and lint.
