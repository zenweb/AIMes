# Issue: DocumentUpload contextual links need real destinations

Date: 2026-06-19
Status: Resolved for this slice

## Problem

The first DocumentUpload guidance slice added contextual links, but the knowledge governance and help affordances still needed real same-page destinations to avoid becoming decorative links.

## Resolution

- Wrapped the governance panel with `#knowledge-governance`.
- Added `#knowledge-upload-help` with bilingual operator guidance.

## Evidence

- Target test failed before implementation because `#knowledge-governance` was missing.
- Target test passed after implementation.
- Full DocumentUpload unit suite passed.
- Full frontend coverage and lint passed.
