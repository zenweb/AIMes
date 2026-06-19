# 2026-06-20 Review - Employee Live Login Clears Offline Demo

## Scope
- 文件：`src/frontend/src/stores/auth.ts`
- 测试：`src/frontend/tests/unit/auth.store.test.ts`

## Findings
- 根因确认：持久化的 `aimes_offline_demo=true` 会让登录流程优先走 demo 账号，从而继续让 HTTP 拦截器跳过 `/api/v1/employee`。
- 修复位置合理：离线 demo 是认证模式状态，清理应发生在普通登录边界，而不是在员工页吞错。
- 显式 demo 入口保留：`offlineDemo=1/true/offline` 和构建级 `VITE_OFFLINE_DEMO=true` 仍可进入 demo。

## Residual Risk
- 页面顶部“离线”仍是连接/运行状态标签，容易和 offline demo 模式混淆；这是独立 UI 文案风险，未在本片改动。
