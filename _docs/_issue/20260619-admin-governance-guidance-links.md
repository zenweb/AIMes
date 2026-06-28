# Issue: AdminBoard lacked bilingual governance guidance before high-risk changes

Date: 2026-06-19
Status: Resolved for this slice

## Problem

`AdminBoard.vue` opens directly into high-risk system management actions without a visible bilingual reminder to confirm role scope, audit ID, and rollback path. It also lacked direct related links to audit replay, document governance, and a local help anchor.

## Impact

System administrators could change users, configs, Agent governance, or LLM settings without first seeing the related evidence surfaces and support guidance expected for complex operations.

## Resolution

Added a top-of-page governance guidance panel with bilingual copy, contextual links, and an in-panel `#admin-governance-help` anchor.

## Evidence

- Targeted RED/GREEN test completed.
- Full `AdminBoard` suite passed.
- Full frontend coverage passed: 111 files / 1083 tests.
- Frontend lint passed.
