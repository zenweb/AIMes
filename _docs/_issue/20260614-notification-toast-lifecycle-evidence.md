# 2026-06-14 Issue - Notification Toast Lifecycle Evidence

## Issue
- `notifications.ts` had coverage for SignalR connection races and high-severity alerts, but lacked direct evidence for queue retention, automatic expiry, and permission-gated browser notification creation.
- These behaviors are shared by the authenticated shell and affect user trust in realtime alerts.

## Resolution
- Added a fake-timer test for latest-five toast retention and 3-second expiry.
- Added a permission-request test for critical quality alerts where `Notification.permission` starts as `default`.

## Status
- Resolved for this slice.
- No production code change required.
