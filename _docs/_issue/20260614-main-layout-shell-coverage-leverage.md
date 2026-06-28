# 2026-06-14 Issue - MainLayout 用户壳层关键行为缺少回归证据

## Problem
- `MainLayout` 覆盖率较低，且是全站用户必经壳层。
- 暗色模式恢复和退出登录清理是用户可感知行为，但此前没有明确单元测试证据。

## Resolution
- 增加暗色模式 `localStorage` 恢复和切换持久化测试。
- 增加退出登录时 `disconnect`、`logout`、`router.push('/login')` 链路测试。

## Verification
- `npm run test:unit -- tests/unit/main-layout.test.ts`：3 passed。
- `npm run test:unit:coverage`：105 files / 751 tests passed。
