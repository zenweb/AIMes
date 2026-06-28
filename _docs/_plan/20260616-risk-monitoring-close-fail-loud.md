# 2026-06-16 Risk Monitoring Close Fail Loud Plan

## Goal

Make monitoring-situation closure failures fail loud when the realtime package writeback fails after risk trace archival.

## Success Criteria

- A thrown `closeMonitoringSituationEscalation` error is caught.
- The operator sees a visible alert explaining that risk closure trace archival succeeded but realtime monitoring package closure did not.
- The realtime monitoring situation package remains escalated after the failed writeback.
- Targeted RiskActionQueuePanel unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Read the risk closure and monitoring situation writeback flow.
2. Added a failing regression test for the second-phase realtime closure write failure.
3. Implemented a minimal `try/catch` around `closeMonitoringSituationEscalation`.
4. Preserved risk trace archival while preventing false local closure after realtime writeback failure.
5. Ran targeted and full frontend coverage.

## Hold State

This slice is sealed. The larger CC remediation goal is being placed on hold for GPT 5.6 continuation, with current progress preserved at `94%` and strict release readiness still blocked by owner-deferred gray observation.
