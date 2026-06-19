# 2026-06-20 Plan - Employee Live Preview Entry Fix

## Success Criteria
- 普通 `/scheduling/login` 即使浏览器残留 `aimes_offline_demo=true`，也必须调用 live 后端登录。
- 4173 production preview 的 `/api/v1/auth/login` 必须转发到 5003 并返回后端 JSON。
- 员工页 live 模式下不得展示 `Offline demo mode skipped backend request`。

## Steps
1. 复现并定位 localStorage、认证 store、4173 `/api` 返回内容。
2. 用失败单测固定“普通登录保持 live”的规则。
3. 最小修改认证模式选择和 production preview API 代理。
4. 跑单测、build、真实浏览器验证。

## Result
- 已完成。
