# Issue: Risk action queue startup failures could overwrite earlier source alerts

Date: 2026-06-19

## Status

Resolved in this slice.

## Problem

When more than one startup risk source failed in `RiskActionQueuePanel`, each loader catch block assigned a new `actionError`. A later source failure could hide an earlier source failure, so the operator only saw the last unavailable evidence source.

## Impact

The risk queue still rendered base action cards, but fail-loud evidence was incomplete. For a complex risk operation, hidden startup failures can make the queue look less degraded than it really is.

## Resolution

- Added a focused failing test that rejects both anomaly dispatch and assistant recovery source reads.
- Replaced direct startup source error assignment with an append helper.
- Verified single-source and existing action failure paths still pass.
