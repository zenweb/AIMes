# Issue: DocumentUpload guidance links

Date: 2026-06-19
Status: Resolved for this slice

## Problem

The DocumentUpload intake workflow is a complex operation, but the top-level upload area did not explicitly remind operators to confirm classification, validity window, and citation scope before uploading. It also lacked nearby contextual links to related governance/evidence areas.

## Resolution

Added a compact bilingual guidance panel with contextual links and a help affordance.

## Evidence

- Target test failed before implementation because `.upload-guidance` was absent.
- Target test passed after implementation.
- Full DocumentUpload suite passed.
- Full frontend coverage and lint passed.

## Remaining non-blocker

The help link is an anchor-level affordance. A richer help article can be added later without changing the current upload behavior.
