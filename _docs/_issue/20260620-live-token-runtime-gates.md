# 2026-06-20 Issue: Runtime gates still trusted stale offline demo storage

## Symptom

After fixing employee live reads, other live paths could still behave as offline/demo:

- Production operation commands could return local demo confirmations.
- Dashboard monitoring SignalR could be skipped.
- Monitoring page could start demo monitoring instead of live SignalR.
- Missing latest Hypercare acceptance showed an initialization failure.

## Root Cause

Some call sites still used raw `isOfflineDemoMode()` instead of the token-aware live/demo decision. Separately, latest Hypercare `404` represented an absent optional record, not a backend failure.

## Resolution

- Reused `shouldSkipBackendForOfflineDemo(getLocalAccessToken())` for production commands and realtime startup decisions.
- Added focused tests for stale demo storage plus real token behavior.
- Added `404` empty-state handling for latest Hypercare acceptance.

## Status

Resolved for production command API, Dashboard realtime startup, Monitoring realtime startup, and missing Hypercare latest empty state.
