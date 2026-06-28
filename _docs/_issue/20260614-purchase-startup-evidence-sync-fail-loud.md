# 2026-06-14 Issue - Purchase Startup Evidence Sync Fail-Loud

## Status
- Fixed one reliability and observability issue in the purchase-board startup evidence sync path.

## Issue
- Startup evidence came from several sources: supplier network, outsourcing commitment, and anomaly dispatch.
- Local evidence reads could fail before the purchase board reached a usable mounted state.
- Backend-first evidence sync failures could overwrite earlier notices, hiding which startup evidence sources failed.
- The user-facing result could be either a blocked purchase board or a single late alert that masked earlier evidence-sync failures.

## Resolution
- Initialize local evidence state safely and apply local startup evidence during mounted startup recovery.
- Catch local evidence read failures for each source and keep startup progressing.
- Accumulate startup sync failure messages instead of replacing earlier messages.
- Preserve board usability while surfacing all startup evidence sync failures fail-loud.

## Remaining Gaps
- Some purchase operational branches remain lower coverage and should be considered only if they affect user-critical purchase decisions.
- Future purchase work should target uncovered behavior with distinct workflow value, not repeat the now-covered startup sync failure path.
- Gray observation / 15-day monitoring is intentionally deferred by owner direction.
