# Issue - Employee List Offline Demo Skip Recheck

## Symptom

The employee list displayed:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

## Root Cause

The visible symptom is consistent with stale browser offline-demo state, not a backend outage:

- `aimes_offline_demo=true` or an offline demo URL entry can keep the frontend in demo mode.
- With no live token or with a `demo-token-*`, the HTTP interceptor skips backend requests by design.

## Resolution

Use the live entry URL and clear stale local storage state:

- `http://127.0.0.1:4173/scheduling/login?offlineDemo=0`
- Then log in with the live admin account.

## Status

Recovered and verified by live browser recheck on 2026-06-22.
