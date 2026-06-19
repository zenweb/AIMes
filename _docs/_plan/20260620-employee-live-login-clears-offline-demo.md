# 2026-06-20 Plan - Employee Live Login Clears Offline Demo

## Success Criteria
- 普通登录入口即使浏览器残留 `aimes_offline_demo=true`，也必须调用后端 `/api/v1/auth/login`。
- 后端登录成功后，员工页 `/api/v1/employee` 不得被 HTTP 层用 offline demo skip 拦截。
- 显式离线演示入口仍能使用 demo 账号。

## Steps
1. 复现并定位：检查 4173/5003 服务、离线 demo 工具、认证 store、员工页 fallback。
2. 修复认证边界：普通登录前清理旧 demo 标记，成功后写入 `false`。
3. 回归测试：补充认证单测，并跑认证、离线 demo、员工页相关单测。
4. 真实浏览器验证：残留 demo 状态下重新登录并打开员工页。

## Result
- 已完成，满足成功标准。
