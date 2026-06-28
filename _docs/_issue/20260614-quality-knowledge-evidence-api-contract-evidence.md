# 2026-06-14 Issue - Quality Knowledge Evidence API Contract Evidence

## Issue
Quality knowledge evidence API helpers carry multiple governance payload types through one envelope endpoint, but direct endpoint and parameter coverage was missing.

## Impact
- `evidenceType` routing drift could break quality samples, recommendation feedback, retraining versions, or gray release decisions across Admin/Report/Audit surfaces.
- Swallowing API read failures at the helper layer would weaken fail-loud behavior when no local quality evidence exists.

## Resolution
- Added `quality-knowledge-evidence-api.test.ts` to cover typed reads, envelope writeback, and read failure propagation.

## Status
- Closed for unit-level contract evidence.
- Live quality knowledge write/read/replay evidence remains separate work.
