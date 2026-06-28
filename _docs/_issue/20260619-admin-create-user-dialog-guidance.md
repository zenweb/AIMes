# 2026-06-19 Issue: Create User Dialog Lacked Local Governance Guidance

## Status
Closed for the create-user dialog.

## Problem
The system management page had global guidance, but when an admin opened the create-user dialog, the modal contained only input fields. The user lost local context for role scope, initial password handoff, audit trail, and where to get help.

## Impact
- The high-risk account creation action did not meet the complex-operation guidance principle at the point of action.
- Related governance help existed but was not linked from the modal.

## Fix
Added a compact bilingual guidance block inside the create-user modal with a link to `#admin-governance-help`.

## Evidence
- Target RED test failed before the fix because `.modal-guidance` was absent.
- Target GREEN test now verifies both languages and the help link.
- Real browser screenshot confirms the modal renders the guidance in production preview.
