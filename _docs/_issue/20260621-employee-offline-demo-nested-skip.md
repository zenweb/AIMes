# Issue: Employee Offline Demo Nested Skip

## Problem
The user saw:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

That message exposes an internal offline-demo backend skip as if it were a real employee-list load failure.

## Root Cause
The existing classifier handled direct `OfflineDemoApiError`, marker/code/name checks, and preserved message strings. It did not inspect nested error objects such as `cause`, `error`, or `innerError`.

## Impact
- EmployeeBoard could look broken in demo mode even though the local fallback data was intentionally available.
- The message reduced trust in a user-critical existing feature.

## Resolution
- Added bounded recursive classification for nested offline-demo errors.
- Added regression tests for nested `cause` and response-title wrapping.

## Verification
- RED/GREEN unit evidence captured.
- Independent production build passed.
- Real browser evidence on `4174` confirmed Employee page loaded without raw offline skip text.

