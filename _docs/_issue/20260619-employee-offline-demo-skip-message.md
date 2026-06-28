# 2026-06-19 Issue - Employee Offline Demo Skip Message

## Symptom
The employee list showed:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

## Root Cause
`EmployeeBoard` already suppresses expected offline demo errors, but the shared classifier did not recognize wrapped `Error` instances when an HTTP layer prefixed the standard skip message.

## Resolution
`isOfflineDemoError` now recognizes the fixed offline demo skip marker inside the message in addition to class, code, marker, and name.

## Status
Resolved for preserved-marker wrapper cases such as `Request failed: Offline demo mode skipped backend request: /api/v1/employee`.

## Evidence Gap
Real browser evidence is not claimed: the existing `4173` preview mounted an empty Nuxt app, and a clean dev server attempt failed with `No entry found in rollupOptions.input`.
