# 2026-06-19 Issue: Offline demo backend-skip technical message leak

## Problem
- Offline demo intentionally skips live backend requests, but some backend-first loaders treated the skip as a normal user-facing failure.
- The visible symptom included messages such as `员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`.

## Impact
- The demo entry looked broken even though local sample data was available.
- Technical implementation details were exposed to users, weakening the boutique-quality requirement for an existing critical path.

## Resolution
- Employee roster loading now suppresses `OfflineDemoApiError` while still showing local sample employees.
- Quality knowledge and customer order import evidence loaders now return quiet local/empty demo state for intentional offline skips.
- Non-demo backend failures still display explicit failure messages.

## Evidence
- Unit regression: 132 targeted tests passed.
- Build passed.
- Real browser final check on `/scheduling/employee?offlineDemo=1` showed `EMP-001`, no alert, and no backend-skip text.
